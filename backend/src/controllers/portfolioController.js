const { Project } = require('../models');

// Get user's projects
const getUserProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({ user_id: req.session.userId })
      .sort({ featured: -1, createdAt: -1 })
      .lean();

    // Add id field
    const projectsWithId = projects.map(p => ({ ...p, id: p._id }));

    res.status(200).json({
      success: true,
      data: projectsWithId
    });
  } catch (error) {
    next(error);
  }
};

// Add new project
const addProject = async (req, res, next) => {
  try {
    const { title, description, image, tags, githubUrl, liveUrl, featured } = req.body;

    const project = await Project.create({
      user_id: req.session.userId,
      title,
      description,
      image,
      tags: tags || [],
      github_url: githubUrl,
      live_url: liveUrl,
      featured: featured || false
    });

    res.status(201).json({
      success: true,
      message: 'Project added successfully',
      data: { ...project.toObject(), id: project._id }
    });
  } catch (error) {
    next(error);
  }
};

// Update project
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        }
      });
    }

    // Check if user owns this project
    if (project.user_id !== req.session.userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to update this project'
        }
      });
    }

    const { title, description, image, tags, githubUrl, liveUrl, featured } = req.body;

    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    if (image !== undefined) project.image = image;
    if (tags !== undefined) project.tags = tags;
    if (githubUrl !== undefined) project.github_url = githubUrl;
    if (liveUrl !== undefined) project.live_url = liveUrl;
    if (featured !== undefined) project.featured = featured;

    await project.save();

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { ...project.toObject(), id: project._id }
    });
  } catch (error) {
    next(error);
  }
};

// Delete project
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found'
        }
      });
    }

    // Check if user owns this project
    if (project.user_id !== req.session.userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You do not have permission to delete this project'
        }
      });
    }

    await project.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProjects,
  addProject,
  updateProject,
  deleteProject
};
