const { User, UserSkill, Project, Application, SavedJob, CareerRoadmap } = require('../models');

// Get user profile
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.session.userId, {
      include: [
        { model: UserSkill, as: 'skills' },
        { model: Project, as: 'projects' },
        { model: CareerRoadmap, as: 'roadmap', order: [['order', 'ASC']] }
      ]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Calculate profile strength
    let profileStrength = 0;
    if (user.name) profileStrength += 10;
    if (user.email) profileStrength += 10;
    if (user.bio) profileStrength += 15;
    if (user.avatar) profileStrength += 10;
    if (user.graduation) profileStrength += 10;
    if (user.skills && user.skills.length > 0) profileStrength += 20;
    if (user.projects && user.projects.length > 0) profileStrength += 25;

    // Update profile strength
    await user.update({ profile_strength: Math.min(profileStrength, 100) });

    res.status(200).json({
      success: true,
      profile: {
        ...user.toSafeObject(),
        skills: user.skills,
        projects: user.projects,
        roadmap: user.roadmap
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.session.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
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
      website
    } = req.body;

    await user.update({
      name: name || user.name,
      bio: bio !== undefined ? bio : user.bio,
      avatar: avatar !== undefined ? avatar : user.avatar,
      graduation: graduation !== undefined ? graduation : user.graduation,
      company_name: company_name !== undefined ? company_name : user.company_name,
      company_size: company_size !== undefined ? company_size : user.company_size,
      industry: industry !== undefined ? industry : user.industry,
      website: website !== undefined ? website : user.website
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// Add skills
const addSkills = async (req, res, next) => {
  try {
    const { skills } = req.body;

    if (!Array.isArray(skills) || skills.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Skills must be a non-empty array'
        }
      });
    }

    // Remove existing skills
    await UserSkill.destroy({ where: { user_id: req.session.userId } });

    // Add new skills
    const userSkills = await Promise.all(
      skills.map(skill => 
        UserSkill.create({
          user_id: req.session.userId,
          skill_name: skill
        })
      )
    );

    res.status(200).json({
      success: true,
      message: 'Skills updated successfully',
      skills: userSkills
    });
  } catch (error) {
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
      const applicationsCount = await Application.count({ where: { user_id: userId } });
      const interviewsCount = await Application.count({ 
        where: { 
          user_id: userId,
          status: 'interview'
        } 
      });
      const savedJobsCount = await SavedJob.count({ where: { user_id: userId } });

      const user = await User.findByPk(userId, {
        include: [{ model: CareerRoadmap, as: 'roadmap' }]
      });

      res.status(200).json({
        success: true,
        stats: {
          profileStrength: user.profile_strength,
          applications: applicationsCount,
          interviews: interviewsCount,
          savedJobs: savedJobsCount,
          roadmap: user.roadmap
        }
      });
    } else if (userRole === 'employer') {
      // Employer dashboard stats
      const { Job } = require('../models');
      const jobsCount = await Job.count({ where: { employer_id: userId } });
      const activeJobsCount = await Job.count({ 
        where: { 
          employer_id: userId,
          status: 'active'
        } 
      });
      const applicationsCount = await Application.count({
        include: [{
          model: Job,
          as: 'job',
          where: { employer_id: userId }
        }]
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
  const t = await require('../models').sequelize.transaction();
  try {
    const user = await User.findByPk(req.session.userId, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
    }

    const { name, graduation, skills, roles, company_name } = req.body;

    // Update basic profile fields
    await user.update({
      name: name !== undefined ? name : user.name,
      graduation: graduation !== undefined ? graduation : user.graduation,
      company_name: company_name !== undefined ? company_name : user.company_name
    }, { transaction: t });

    // Replace skills
    if (Array.isArray(skills)) {
      await UserSkill.destroy({ where: { user_id: user.id }, transaction: t });
      await Promise.all(skills.map(skill => UserSkill.create({ user_id: user.id, skill_name: skill }, { transaction: t })));
    }

    // Replace career roadmap entries for desired roles (only for students)
    if (Array.isArray(roles)) {
      // remove existing roadmap entries
      await CareerRoadmap.destroy({ where: { user_id: user.id }, transaction: t });
      // create new roadmap entries from roles
      await Promise.all(roles.map((roleTitle, idx) => CareerRoadmap.create({
        user_id: user.id,
        title: roleTitle,
        order: idx
      }, { transaction: t })));
    }

    await t.commit();

    // reload user with skills and roadmap
    const updated = await User.findByPk(user.id, {
      include: [ { model: UserSkill, as: 'skills' }, { model: CareerRoadmap, as: 'roadmap' } ]
    });

    res.status(200).json({ success: true, message: 'Onboarding saved', user: updated.toSafeObject(), skills: updated.skills, roadmap: updated.roadmap });
  } catch (error) {
    await t.rollback();
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  addSkills,
  getDashboardStats,
  onboarding
};
