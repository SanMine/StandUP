const { Application, Job, JobSkill, SavedJob } = require('../models');

// Get user's applications
const getUserApplications = async (req, res, next) => {
  try {
    const applications = await Application.findAll({
      where: { user_id: req.session.userId },
      include: [
        {
          model: Job,
          as: 'job',
          include: [{ model: JobSkill, as: 'skills' }]
        }
      ],
      order: [['applied_date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: applications
    });
  } catch (error) {
    next(error);
  }
};

// Apply for a job
const applyForJob = async (req, res, next) => {
  try {
    const { jobId, notes } = req.body;

    // Check if job exists
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found'
        }
      });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      where: {
        user_id: req.session.userId,
        job_id: jobId
      }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_APPLIED',
          message: 'You have already applied for this job'
        }
      });
    }

    // Create application
    const application = await Application.create({
      user_id: req.session.userId,
      job_id: jobId,
      status: 'applied',
      applied_date: new Date(),
      last_update: new Date(),
      notes: notes || '',
      timeline: [{
        date: new Date().toISOString().split('T')[0],
        event: 'Application Submitted',
        status: 'completed'
      }]
    });

    const applicationWithJob = await Application.findByPk(application.id, {
      include: [{
        model: Job,
        as: 'job',
        include: [{ model: JobSkill, as: 'skills' }]
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: applicationWithJob
    });
  } catch (error) {
    next(error);
  }
};

// Update application
const updateApplication = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findByPk(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found'
        }
      });
    }

    // Check if user owns this application
    if (application.user_id !== req.session.userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this application'
        }
      });
    }

    // Update timeline if status changed
    let timeline = application.timeline || [];
    if (status && status !== application.status) {
      const statusEvents = {
        'screening': 'Initial Screening',
        'interview': 'Technical Interview',
        'offer': 'Offer Received',
        'rejected': 'Application Rejected',
        'withdrawn': 'Application Withdrawn'
      };

      timeline.push({
        date: new Date().toISOString().split('T')[0],
        event: statusEvents[status] || 'Status Updated',
        status: 'completed'
      });
    }

    await application.update({
      status: status || application.status,
      notes: notes !== undefined ? notes : application.notes,
      last_update: new Date(),
      timeline
    });

    const updatedApplication = await Application.findByPk(application.id, {
      include: [{
        model: Job,
        as: 'job',
        include: [{ model: JobSkill, as: 'skills' }]
      }]
    });

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: updatedApplication
    });
  } catch (error) {
    next(error);
  }
};

// Delete/Withdraw application
const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'APPLICATION_NOT_FOUND',
          message: 'Application not found'
        }
      });
    }

    // Check if user owns this application
    if (application.user_id !== req.session.userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this application'
        }
      });
    }

    await application.destroy();

    res.status(200).json({
      success: true,
      message: 'Application withdrawn successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get saved jobs
const getSavedJobs = async (req, res, next) => {
  try {
    const savedJobs = await SavedJob.findAll({
      where: { user_id: req.session.userId },
      include: [{
        model: Job,
        as: 'job',
        include: [{ model: JobSkill, as: 'skills' }]
      }],
      order: [['saved_date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: savedJobs
    });
  } catch (error) {
    next(error);
  }
};

// Save a job
const saveJob = async (req, res, next) => {
  try {
    const { jobId } = req.body;

    // Check if job exists
    const job = await Job.findByPk(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'JOB_NOT_FOUND',
          message: 'Job not found'
        }
      });
    }

    // Check if already saved
    const existing = await SavedJob.findOne({
      where: {
        user_id: req.session.userId,
        job_id: jobId
      }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ALREADY_SAVED',
          message: 'Job is already saved'
        }
      });
    }

    const savedJob = await SavedJob.create({
      user_id: req.session.userId,
      job_id: jobId,
      saved_date: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      data: savedJob
    });
  } catch (error) {
    next(error);
  }
};

// Unsave a job
const unsaveJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;

    const savedJob = await SavedJob.findOne({
      where: {
        user_id: req.session.userId,
        job_id: jobId
      }
    });

    if (!savedJob) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Saved job not found'
        }
      });
    }

    await savedJob.destroy();

    res.status(200).json({
      success: true,
      message: 'Job unsaved successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserApplications,
  applyForJob,
  updateApplication,
  deleteApplication,
  getSavedJobs,
  saveJob,
  unsaveJob
};
