const { User, UserSkill, Project, Application, SavedJob, CareerRoadmap } = require('../models');

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Get related data
    const skills = await UserSkill.find({ user_id: user._id });
    const projects = await Project.find({ user_id: user._id });
    const roadmap = await CareerRoadmap.find({ user_id: user._id }).sort({ order: 1 });

    // Calculate profile strength
    let profileStrength = 0;
    if (user.name) profileStrength += 10;
    if (user.email) profileStrength += 10;
    if (user.bio) profileStrength += 15;
    if (user.avatar) profileStrength += 10;
    if (user.graduation) profileStrength += 10;
    if (skills && skills.length > 0) profileStrength += 20;
    if (projects && projects.length > 0) profileStrength += 25;

    // Update profile strength
    user.profile_strength = Math.min(profileStrength, 100);
    await user.save();

    res.status(200).json({
      success: true,
      profile: {
        ...user.toSafeObject(),
        skills,
        projects,
        roadmap
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  const session = await require('../models').mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.user.userId).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      });
    }

    const {
      name,
      bio,
      avatar,
      graduation,
      company_name,
      company_size,
      industry,
      website,
      skills // <- merged skills here
    } = req.body;

    // Update basic fields
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;
    if (graduation !== undefined) user.graduation = graduation;
    if (company_name !== undefined) user.company_name = company_name;
    if (company_size !== undefined) user.company_size = company_size;
    if (industry !== undefined) user.industry = industry;
    if (website !== undefined) user.website = website;

    await user.save({ session });

    // Replace skills if provided
    if (Array.isArray(skills)) {
      await UserSkill.deleteMany({ user_id: user._id }, { session });
      if (skills.length > 0) {
        await UserSkill.insertMany(
          skills.map(skill => ({ user_id: user._id, skill_name: skill })),
          { session }
        );
      }
    }

    await session.commitTransaction();
    session.endSession();

    // Reload skills to include in response
    const updatedSkills = await UserSkill.find({ user_id: user._id });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toSafeObject(),
      skills: updatedSkills
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.session.userId;
    const userRole = req.session.userRole;

    if (userRole === 'student') {
      // Student dashboard stats
      const applicationsCount = await Application.countDocuments({ user_id: userId });
      const interviewsCount = await Application.countDocuments({ 
        user_id: userId,
        status: 'interview'
      });
      const savedJobsCount = await SavedJob.countDocuments({ user_id: userId });

      const user = await User.findById(userId);
      const roadmap = await CareerRoadmap.find({ user_id: userId });

      res.status(200).json({
        success: true,
        stats: {
          profileStrength: user.profile_strength,
          applications: applicationsCount,
          interviews: interviewsCount,
          savedJobs: savedJobsCount,
          roadmap
        }
      });
    } else if (userRole === 'employer') {
      // Employer dashboard stats
      const { Job } = require('../models');
      const jobsCount = await Job.countDocuments({ employer_id: userId });
      const activeJobsCount = await Job.countDocuments({ 
        employer_id: userId,
        status: 'active'
      });
      
      // Count applications for employer's jobs
      const jobs = await Job.find({ employer_id: userId }).select('_id');
      const jobIds = jobs.map(job => job._id);
      const applicationsCount = await Application.countDocuments({
        job_id: { $in: jobIds }
      });

      res.status(200).json({
        success: true,
        stats: {
          totalJobs: jobsCount,
          activeJobs: activeJobsCount,
          totalApplications: applicationsCount
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

// Onboarding: update profile, skills, and desired roles (career roadmap)
const onboarding = async (req, res, next) => {
  const session = await require('../models').mongoose.startSession();
  session.startTransaction();
  
  try {
    const user = await User.findById(req.session.userId).session(session);
    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ 
        success: false, 
        error: { 
          code: 'USER_NOT_FOUND', 
          message: 'User not found' 
        } 
      });
    }

    const { name, graduation, skills, roles, company_name } = req.body;

    // Update basic profile fields
    if (name !== undefined) user.name = name;
    if (graduation !== undefined) user.graduation = graduation;
    if (company_name !== undefined) user.company_name = company_name;
    
    await user.save({ session });

    // Replace skills
    if (Array.isArray(skills)) {
      await UserSkill.deleteMany({ user_id: user._id }, { session });
      await UserSkill.insertMany(
        skills.map(skill => ({ user_id: user._id, skill_name: skill })),
        { session }
      );
    }

    // Replace career roadmap entries for desired roles (only for students)
    if (Array.isArray(roles)) {
      await CareerRoadmap.deleteMany({ user_id: user._id }, { session });
      await CareerRoadmap.insertMany(
        roles.map((roleTitle, idx) => ({
          user_id: user._id,
          title: roleTitle,
          order: idx
        })),
        { session }
      );
    }

    await session.commitTransaction();
    session.endSession();

    // Reload user with skills and roadmap
    const userSkills = await UserSkill.find({ user_id: user._id });
    const userRoadmap = await CareerRoadmap.find({ user_id: user._id });

    res.status(200).json({ 
      success: true, 
      message: 'Onboarding saved', 
      user: user.toSafeObject(), 
      skills: userSkills, 
      roadmap: userRoadmap 
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getDashboardStats,
  onboarding
};
