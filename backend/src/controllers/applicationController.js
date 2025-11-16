const { Application, Job, JobSkill, SavedJob } = require('../models');

// Get user's applications
const getUserApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ user_id: req.user.userId })
      .sort({ applied_date: -1 })
      .lean();

    // Populate job and skills for each application
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app) => {
        const job = await Job.findById(app.job_id).lean();
        if (job) {
          const skills = await JobSkill.find({ job_id: job._id }).lean();
          return {
            ...app,
            id: app._id,
            job: {
              ...job,
              id: job._id,
              skills
            }
          };
        }
        return { ...app, id: app._id, job: null };
      })
    );

    res.status(200).json({
      success: true,
      data: applicationsWithDetails
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
    const job = await Job.findById(jobId);
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
      user_id: req.user.userId,
      job_id: jobId
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
      user_id: req.user.userId,
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

    // Get job with skills
    const jobWithSkills = await Job.findById(jobId).lean();
    const skills = await JobSkill.find({ job_id: jobId }).lean();

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        ...application.toObject(),
        id: application._id,
        job: {
          ...jobWithSkills,
          id: jobWithSkills._id,
          skills
        }
      }
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

    const application = await Application.findById(id);

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
    if (application.user_id !== req.user.userId) {
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

    if (status !== undefined) application.status = status;
    if (notes !== undefined) application.notes = notes;
    application.last_update = new Date();
    application.timeline = timeline;
    
    await application.save();

    // Get job with skills
    const job = await Job.findById(application.job_id).lean();
    const skills = await JobSkill.find({ job_id: application.job_id }).lean();

    res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: {
        ...application.toObject(),
        id: application._id,
        job: job ? {
          ...job,
          id: job._id,
          skills
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete/Withdraw application
const deleteApplication = async (req, res, next) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id);

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
    if (application.user_id !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this application'
        }
      });
    }

    await application.deleteOne();

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
    const savedJobs = await SavedJob.find({ user_id: req.user.userId })
      .sort({ saved_date: -1 })
      .lean();

    // Populate job and skills
    const savedJobsWithDetails = await Promise.all(
      savedJobs.map(async (savedJob) => {
        const job = await Job.findById(savedJob.job_id).lean();
        if (job) {
          const skills = await JobSkill.find({ job_id: job._id }).lean();
          return {
            ...savedJob,
            id: savedJob._id,
            job: {
              ...job,
              id: job._id,
              skills
            }
          };
        }
        return { ...savedJob, id: savedJob._id, job: null };
      })
    );

    res.status(200).json({
      success: true,
      data: savedJobsWithDetails
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
    const job = await Job.findById(jobId);
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
      user_id: req.user.userId,
      job_id: jobId
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
      user_id: req.user.userId,
      job_id: jobId,
      saved_date: new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Job saved successfully',
      data: { ...savedJob.toObject(), id: savedJob._id }
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
      user_id: req.user.userId,
      job_id: jobId
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

    await savedJob.deleteOne();

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
