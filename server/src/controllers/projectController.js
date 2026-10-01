const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get projects scoped by user role
// @route   GET /api/projects
// @access  Private (All Roles - scoped by roleFilter)
const getProjects = async (req, res) => {
  try {
    const filter = req.roleFilter || {};
    const projects = await Project.find(filter)
      .populate('clientId', 'name email role department')
      .populate('assignedTeam', 'name email role department')
      .sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('clientId', 'name email role department')
      .populate('assignedTeam', 'name email role department');

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create a new project (with file attachments via Multer)
// @route   POST /api/projects
// @access  Private (SuperAdmin, Manager)
const createProject = async (req, res) => {
  try {
    const { title, description, clientId, status, startDate, expectedDelivery, assignedTeam } = req.body;

    // Process uploaded project brief attachments via Multer
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
      }));
    }

    // Parse assignedTeam if transmitted as JSON string from FormData
    let teamIds = assignedTeam;
    if (typeof assignedTeam === 'string') {
      try {
        teamIds = JSON.parse(assignedTeam);
      } catch (e) {
        teamIds = assignedTeam ? [assignedTeam] : [];
      }
    }

    const project = await Project.create({
      title,
      description: description || '',
      clientId,
      status: status || 'Planning',
      startDate: startDate || Date.now(),
      expectedDelivery: expectedDelivery || null,
      assignedTeam: teamIds || [],
      attachments,
    });

    if (clientId) {
      await User.findByIdAndUpdate(clientId, {
        $addToSet: { assignedProjects: project._id },
      });
    }

    const populated = await Project.findById(project._id)
      .populate('clientId', 'name email')
      .populate('assignedTeam', 'name email department');

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update project details (with file attachments via Multer)
// @route   PUT /api/projects/:id
// @access  Private (SuperAdmin, Manager)
const updateProject = async (req, res) => {
  try {
    const existingProject = await Project.findById(req.params.id);
    if (!existingProject) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    let updateData = { ...req.body };

    // Process new attachments if uploaded
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map((file) => ({
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
      }));
      updateData.attachments = [...(existingProject.attachments || []), ...newAttachments];
    }

    if (typeof updateData.assignedTeam === 'string') {
      try {
        updateData.assignedTeam = JSON.parse(updateData.assignedTeam);
      } catch (e) {
        updateData.assignedTeam = [updateData.assignedTeam];
      }
    }

    const project = await Project.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('clientId', 'name email')
      .populate('assignedTeam', 'name email department');

    res.json(project);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (SuperAdmin)
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }
    res.json({ message: 'Project removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Calculate and update progressPercentage of a project based on completed tasks
// @route   POST /api/projects/:id/calculate-progress
// @access  Private (SuperAdmin, Manager, Employee)
const calculateProjectProgress = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const totalTasks = await Task.countDocuments({ projectId });

    if (totalTasks === 0) {
      project.progressPercentage = 0;
      await project.save();
      return res.json({
        message: 'No tasks found for project. Progress reset to 0%.',
        progressPercentage: 0,
        completedTasks: 0,
        totalTasks: 0,
      });
    }

    const completedTasks = await Task.countDocuments({ projectId, status: 'Completed' });
    const calculatedPercentage = Math.round((completedTasks / totalTasks) * 100);

    project.progressPercentage = calculatedPercentage;
    if (calculatedPercentage === 100 && project.status !== 'Completed') {
      project.status = 'Completed';
    }
    await project.save();

    res.json({
      message: 'Project progress updated successfully.',
      progressPercentage: calculatedPercentage,
      completedTasks,
      totalTasks,
      project,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  calculateProjectProgress,
};
