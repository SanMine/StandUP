const { Project } = require('../models');

// Get user's projects
const getUserProjects = async (req, res, next) => {
  try {
    const projects = await Project.findAll({
      where: { user_id: req.session.userId },
      order: [['featured', 'DESC'], ['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: projects
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
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// Update project
const updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);

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

    await project.update({
      title: title || project.title,
      description: description || project.description,
      image: image !== undefined ? image : project.image,
      tags: tags !== undefined ? tags : project.tags,
      github_url: githubUrl !== undefined ? githubUrl : project.github_url,
      live_url: liveUrl !== undefined ? liveUrl : project.live_url,
      featured: featured !== undefined ? featured : project.featured
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project
    });
  } catch (error) {
    next(error);
  }
};

// Delete project
const deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findByPk(id);

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

    await project.destroy();

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
