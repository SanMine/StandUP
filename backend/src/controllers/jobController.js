const { Job, JobSkill, Application, SavedJob, User, UserSkill } = require('../models');
const { calculateMatchPercentageOnly, calculateFullJobMatch } = require('../utils/jobMatchingAI');

const getAllJobs = async (req, res, next) => {
  try {
    const {
      search,
      roles,
      locations,
      modes,
      types,
      page = 1,
      limit = 10
    } = req.query;

    const skip = (page - 1) * limit;
    const query = { status: 'active' };

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Role filter
    if (roles) {
      const roleArray = roles.split(',');
      query.title = { $in: roleArray.map(role => new RegExp(role, 'i')) };
    }

    // Location filter
    if (locations) {
      const locationArray = locations.split(',');
      query.location = { $in: locationArray.map(loc => new RegExp(loc, 'i')) };
    }

    // Mode filter
    if (modes) {
      query.mode = { $in: modes.split(',') };
    }

    // Type filter
    if (types) {
      query.type = { $in: types.split(',') };
    }

    const count = await Job.countDocuments(query);
    const jobs = await Job.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ posted_date: -1 })
      .lean();

    // Get skills and employer for each job
    const jobsWithDetails = await Promise.all(
      jobs.map(async (job) => {
        const skills = await JobSkill.find({ job_id: job._id }).lean();
        const employer = await User.findById(job.employer_id).select('_id company_name industry').lean();
        return {
          ...job,
          id: job._id,
          skills,
          employer: employer ? { ...employer, id: employer._id } : null
        };
      })
    );

    // If user is authenticated and is a student, calculate AI-powered match percentages only
    let jobsWithAIMatching = jobsWithDetails;
    let userPlan = 'free';

    if (req.user && req.user.role === 'student') {
      try {
        const user = await User.findById(req.user.userId).lean();
        const userSkills = await UserSkill.find({ user_id: req.user.userId }).lean();

        if (user) {
          userPlan = user.plan || 'free';

          if (user.plan === 'premium') {
            console.log('✓ Premium user - enabling AI match percentage calculation');

            // Calculate ONLY match percentage for each job (fast operation)
            jobsWithAIMatching = await Promise.all(
              jobsWithDetails.map(async (job) => {
                try {
                  const matchResult = await calculateMatchPercentageOnly(userSkills, {
                    title: job.title,
                    company: job.company,
                    type: job.type,
                    mode: job.mode,
                    location: job.location,
                    skills: job.skills
                  });

                  return {
                    ...job,
                    matchPercentage: matchResult.matchPercentage
                  };
                } catch (error) {
                  console.error(`Error calculating match percentage for job ${job._id}:`, error.message);
                  return {
                    ...job,
                    matchPercentage: null
                  };
                }
              })
            );

            // Sort by match percentage (highest first)
            jobsWithAIMatching.sort((a, b) => {
              const matchA = a.matchPercentage !== null ? a.matchPercentage : -1;
              const matchB = b.matchPercentage !== null ? b.matchPercentage : -1;
              return matchB - matchA;
            });
          } else {
            console.log('✗ Free user - AI matching is premium feature');
          }
        }
      } catch (error) {
        console.error('Error in AI matching process:', error);
      }
    }

    res.status(200).json({
      success: true,
      data: jobsWithAIMatching,
      userPlan,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found'
        }
      });
    }

    // Get skills and employer
    const skills = await JobSkill.find({ job_id: job._id }).lean();
    const employer = await User.findById(job.employer_id).select('_id company_name industry company_size').lean();

    let jobData = {
      ...job,
      id: job._id,
      skills,
      employer: employer ? { ...employer, id: employer._id } : null
    };

    let userPlan = 'free';

    // Calculate FULL AI-powered match analysis if user is authenticated, is a student, and has premium plan
    if (req.user && req.user.role === 'student') {
      try {
        const user = await User.findById(req.user.userId).lean();
        console.log(user)
        const userSkills = await UserSkill.find({ user_id: req.user.userId }).lean();

        if (user) {
          userPlan = user.plan || 'free';

          if (user.plan === 'premium') {
            console.log('✓ Premium user - calculating full AI match analysis');

            const matchResult = await calculateFullJobMatch(userSkills, {
              title: job.title,
              company: job.company,
              type: job.type,
              mode: job.mode,
              location: job.location,
              skills: skills,
              requirements: job.requirements || []
            });

            jobData = {
              ...jobData,
              matchPercentage: matchResult.matchPercentage,
              strongMatchFacts: matchResult.strongMatchFacts,
              areasToImprove: matchResult.areasToImprove
            };
          }
        }
      } catch (error) {
        console.error('Error calculating full AI match:', error);
      }
    }

    res.status(200).json({
      success: true,
      data: jobData,
      userPlan
    });
  } catch (error) {
    next(error);
  }
};

// Create job (employer only)
const createJob = async (req, res, next) => {
  try {
    const {
      title,
      company,
      logo,
      location,
      type,
      mode,
      salary,
      description,
      requirements,
      skills,
      culture
    } = req.body;

    const job = await Job.create({
      employer_id: req.user.userId,
      title,
      company,
      logo,
      location,
      type,
      mode,
      salary,
      description,
      requirements: requirements || [],
      culture: culture || [],
      posted_date: new Date(),
      status: 'active'
    });

    // Add skills
    if (skills && Array.isArray(skills) && skills.length > 0) {
      await JobSkill.insertMany(
        skills.map(skill => ({
          job_id: job._id,
          skill_name: skill
        }))
      );
    }

    const jobSkills = await JobSkill.find({ job_id: job._id });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: {
        ...job.toObject(),
        id: job._id,
        skills: jobSkills
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update job (employer only)
const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found'
        }
      });
    }

    // Check if user owns this job
    if (job.employer_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this job'
        }
      });
    }

    const {
      title,
      company,
      logo,
      location,
      type,
      mode,
      salary,
      description,
      requirements,
      skills,
      culture,
      status
    } = req.body;

    // Update job fields
    if (title !== undefined) job.title = title;
    if (company !== undefined) job.company = company;
    if (logo !== undefined) job.logo = logo;
    if (location !== undefined) job.location = location;
    if (type !== undefined) job.type = type;
    if (mode !== undefined) job.mode = mode;
    if (salary !== undefined) job.salary = salary;
    if (description !== undefined) job.description = description;
    if (requirements !== undefined) job.requirements = requirements;
    if (culture !== undefined) job.culture = culture;
    if (status !== undefined) job.status = status;

    await job.save();

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      await JobSkill.deleteMany({ job_id: job._id });
      await JobSkill.insertMany(
        skills.map(skill => ({
          job_id: job._id,
          skill_name: skill
        }))
      );
    }

    const jobSkills = await JobSkill.find({ job_id: job._id });

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: {
        ...job.toObject(),
        id: job._id,
        skills: jobSkills
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete job (employer only)
const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found'
        }
      });
    }

    // Check if user owns this job
    if (job.employer_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this job'
        }
      });
    }

    // Delete associated data
    await JobSkill.deleteMany({ job_id: job._id });
    await Application.deleteMany({ job_id: job._id });
    await SavedJob.deleteMany({ job_id: job._id });

    await job.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get all jobs for current employer
const getMyJobs = async (req, res, next) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 10,
      sortBy = 'posted_date',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;

    // Base query - only jobs by this employer
    const query = { employer_id: req.user.userId };

    // Status filter (active, closed, draft)
    if (status) {
      query.status = status;
    }

    // Search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const count = await Job.countDocuments(query);

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Fetch jobs
    const jobs = await Job.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort(sortOptions)
      .lean();

    // Enrich with skills and application counts
    const jobsWithDetails = await Promise.all(
      jobs.map(async (job) => {
        const skills = await JobSkill.find({ job_id: job._id }).lean();
        const applicationCount = await Application.countDocuments({ job_id: job._id });
        const savedCount = await SavedJob.countDocuments({ job_id: job._id });

        return {
          ...job,
          id: job._id,
          skills,
          applicationCount,
          savedCount
        };
      })
    );

    // Calculate statistics
    const stats = {
      total: count,
      active: await Job.countDocuments({ employer_id: req.user.userId, status: 'active' }),
      draft: await Job.countDocuments({ employer_id: req.user.userId, status: 'draft' }),
      closed: await Job.countDocuments({ employer_id: req.user.userId, status: 'closed' }),
      totalApplications: await Application.countDocuments({
        job_id: { $in: jobs.map(j => j._id) }
      })
    };

    res.status(200).json({
      success: true,
      data: jobsWithDetails,
      stats,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs
};