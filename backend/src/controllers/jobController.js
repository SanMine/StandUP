const { Job, JobSkill, Application, SavedJob, User, UserSkill } = require('../models');
const { Op } = require('sequelize');
const { calculateJobMatch } = require('../config/gemini');

// Get all jobs with filters
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

    const offset = (page - 1) * limit;
    const where = { status: 'active' };

    // Search filter
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { company: { [Op.like]: `%${search}%` } },
        { location: { [Op.like]: `%${search}%` } }
      ];
    }

    // Role filter
    if (roles) {
      const roleArray = roles.split(',');
      where.title = {
        [Op.or]: roleArray.map(role => ({ [Op.like]: `%${role}%` }))
      };
    }

    // Location filter
    if (locations) {
      const locationArray = locations.split(',');
      where.location = {
        [Op.or]: locationArray.map(loc => ({ [Op.like]: `%${loc}%` }))
      };
    }

    // Mode filter
    if (modes) {
      where.mode = { [Op.in]: modes.split(',') };
    }

    // Type filter
    if (types) {
      where.type = { [Op.in]: types.split(',') };
    }

    const { count, rows: jobs } = await Job.findAndCountAll({
      where,
      include: [
        { model: JobSkill, as: 'skills' },
        { model: User, as: 'employer', attributes: ['id', 'company_name', 'industry'] }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['posted_date', 'DESC']]
    });

    // If user is authenticated, calculate match scores using AI
    let jobsWithScores = jobs;
    if (req.session && req.session.userId && req.session.userRole === 'student') {
      const user = await User.findByPk(req.session.userId, {
        include: [{ model: UserSkill, as: 'skills' }]
      });

      if (user && user.skills && user.skills.length > 0) {
        jobsWithScores = await Promise.all(
          jobs.map(async (job) => {
            try {
              const matchData = await calculateJobMatch(
                {
                  skills: user.skills.map(s => s.skill_name),
                  desiredRoles: [], // Can be added to user profile
                  experienceLevel: 'entry-level'
                },
                {
                  title: job.title,
                  skills: job.skills.map(s => s.skill_name),
                  type: job.type,
                  mode: job.mode,
                  requirements: job.requirements || []
                }
              );

              return {
                ...job.toJSON(),
                matchScore: matchData.matchScore,
                whyMatch: matchData.whyMatch,
                whyNotMatch: matchData.whyNotMatch,
                recommendation: matchData.recommendation
              };
            } catch (error) {
              console.error('Error calculating match for job:', job.id, error);
              return {
                ...job.toJSON(),
                matchScore: 70,
                whyMatch: ['Skills alignment'],
                whyNotMatch: [],
                recommendation: 'Consider applying'
              };
            }
          })
        );

        // Sort by match score
        jobsWithScores.sort((a, b) => b.matchScore - a.matchScore);
      }
    }

    res.status(200).json({
      success: true,
      data: jobsWithScores,
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

// Get single job
const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Job.findByPk(id, {
      include: [
        { model: JobSkill, as: 'skills' },
        { model: User, as: 'employer', attributes: ['id', 'company_name', 'industry', 'company_size'] }
      ]
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found'
        }
      });
    }

    // Calculate match score if user is authenticated
    let jobData = job.toJSON();
    if (req.session && req.session.userId && req.session.userRole === 'student') {
      const user = await User.findByPk(req.session.userId, {
        include: [{ model: UserSkill, as: 'skills' }]
      });

      if (user && user.skills && user.skills.length > 0) {
        try {
          const matchData = await calculateJobMatch(
            {
              skills: user.skills.map(s => s.skill_name),
              desiredRoles: [],
              experienceLevel: 'entry-level'
            },
            {
              title: job.title,
              skills: job.skills.map(s => s.skill_name),
              type: job.type,
              mode: job.mode,
              requirements: job.requirements || []
            }
          );

          jobData = {
            ...jobData,
            matchScore: matchData.matchScore,
            whyMatch: matchData.whyMatch,
            whyNotMatch: matchData.whyNotMatch,
            recommendation: matchData.recommendation
          };
        } catch (error) {
          console.error('Error calculating match:', error);
        }
      }
    }

    res.status(200).json({
      success: true,
      data: jobData
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
      employer_id: req.session.userId,
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
      await Promise.all(
        skills.map(skill =>
          JobSkill.create({
            job_id: job.id,
            skill_name: skill
          })
        )
      );
    }

    const jobWithSkills = await Job.findByPk(job.id, {
      include: [{ model: JobSkill, as: 'skills' }]
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: jobWithSkills
    });
  } catch (error) {
    next(error);
  }
};

// Update job (employer only)
const updateJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);

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
    if (job.employer_id !== req.session.userId) {
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

    await job.update({
      title: title || job.title,
      company: company || job.company,
      logo: logo !== undefined ? logo : job.logo,
      location: location || job.location,
      type: type || job.type,
      mode: mode || job.mode,
      salary: salary !== undefined ? salary : job.salary,
      description: description || job.description,
      requirements: requirements !== undefined ? requirements : job.requirements,
      culture: culture !== undefined ? culture : job.culture,
      status: status || job.status
    });

    // Update skills if provided
    if (skills && Array.isArray(skills)) {
      await JobSkill.destroy({ where: { job_id: job.id } });
      await Promise.all(
        skills.map(skill =>
          JobSkill.create({
            job_id: job.id,
            skill_name: skill
          })
        )
      );
    }

    const updatedJob = await Job.findByPk(job.id, {
      include: [{ model: JobSkill, as: 'skills' }]
    });

    res.status(200).json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    next(error);
  }
};

// Delete job (employer only)
const deleteJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const job = await Job.findByPk(id);

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
    if (job.employer_id !== req.session.userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this job'
        }
      });
    }

    await job.destroy();

    res.status(200).json({
      success: true,
      message: 'Job deleted successfully'
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
  deleteJob
};
