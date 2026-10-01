const Task = require('../models/Task');
const Project = require('../models/Project');

// Helper function to recalculate project progress percentage
const syncProjectProgress = async (projectId) => {
  if (!projectId) return;
  try {
    const totalTasks = await Task.countDocuments({ projectId });
    if (totalTasks === 0) return;
    const completedTasks = await Task.countDocuments({ projectId, status: 'Completed' });
    const percentage = Math.round((completedTasks / totalTasks) * 100);

    const updateData = { progressPercentage: percentage };
    if (percentage === 100) {
      updateData.status = 'Completed';
    }

    await Project.findByIdAndUpdate(projectId, updateData);
    console.log(`[AUTO-SYNC] Project (${projectId}) progress percentage updated to ${percentage}%.`);
  } catch (err) {
    console.error('[AUTO-SYNC ERROR] Failed to sync project progress:', err.message);
  }
};

// @desc    Get tasks scoped by user role
// @route   GET /api/tasks
// @access  Private (All Roles - scoped via roleFilter)
const getTasks = async (req, res) => {
  try {
    const filter = req.roleFilter || {};
    const tasks = await Task.find(filter)
      .populate('projectId', 'title status progressPercentage clientId')
      .populate('assignedTo', 'name email department role')
      .populate('clientId', 'name email role department')
      .sort({ updatedAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('projectId', 'title status progressPercentage clientId')
      .populate('assignedTo', 'name email department role')
      .populate('clientId', 'name email role department')
      .populate('comments.user', 'name role');

    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create and assign a task (with file attachments via Multer)
// @route   POST /api/tasks
// @access  Private (SuperAdmin, Manager)
const createTask = async (req, res) => {
  try {
    const { title, description, projectId, clientId, assignedTo, status, priority, dueDate, comments, submittedToClient } = req.body;

    // Process Multer file attachments if uploaded
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
      }));
    }

    const isSubmitted = submittedToClient === true || submittedToClient === 'true' || status === 'Waiting for Client';

    const task = await Task.create({
      title,
      description: description || '',
      projectId,
      clientId: clientId || null,
      assignedTo: assignedTo || null,
      status: status || (isSubmitted ? 'Waiting for Client' : 'Not Started'),
      priority: priority || 'Medium',
      dueDate: dueDate || null,
      attachments,
      comments: comments ? (typeof comments === 'string' ? JSON.parse(comments) : comments) : [],
      submittedToClient: isSubmitted,
    });

    // Auto sync project progress
    await syncProjectProgress(projectId);

    const populatedTask = await Task.findById(task._id)
      .populate('projectId', 'title status')
      .populate('assignedTo', 'name email department')
      .populate('clientId', 'name email role department');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update task details (with file attachments)
// @route   PUT /api/tasks/:id
// @access  Private (SuperAdmin, Manager, Employee)
const updateTask = async (req, res) => {
  try {
    const previousTask = await Task.findById(req.params.id);
    if (!previousTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    let updateData = { ...req.body };

    if (updateData.submittedToClient === 'true' || updateData.submittedToClient === true) {
      updateData.submittedToClient = true;
    } else if (updateData.submittedToClient === 'false' || updateData.submittedToClient === false) {
      updateData.submittedToClient = false;
    }

    if (updateData.status === 'Waiting for Client') {
      updateData.submittedToClient = true;
    }

    // Process new Multer file attachments
    if (req.files && req.files.length > 0) {
      const newAttachments = req.files.map((file) => ({
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
      }));
      updateData.attachments = [...(previousTask.attachments || []), ...newAttachments];
    }

    const task = await Task.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate('projectId', 'title status')
      .populate('assignedTo', 'name email department')
      .populate('clientId', 'name email role department');

    // Trigger Notification Console Log if status changed to 'Waiting for Client' or 'Completed'
    if (
      req.body.status &&
      req.body.status !== previousTask.status &&
      ['Waiting for Client', 'Completed'].includes(req.body.status)
    ) {
      console.log(
        `🔔 [NOTIFICATION TRIGGER] Task "${task.title}" status changed to "${req.body.status}". Project ID: ${task.projectId._id || task.projectId}. Triggering Client/Manager alert notification!`
      );
    }

    // Auto sync project progress
    await syncProjectProgress(task.projectId._id || task.projectId);

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update task status specifically
// @route   PATCH /api/tasks/:id/status
// @access  Private (SuperAdmin, Manager, Employee)
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const previousTask = await Task.findById(req.params.id);
    if (!previousTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('projectId', 'title status')
      .populate('assignedTo', 'name email department');

    if (
      status !== previousTask.status &&
      ['Waiting for Client', 'Completed'].includes(status)
    ) {
      console.log(
        `🔔 [NOTIFICATION TRIGGER] Task "${task.title}" status changed from "${previousTask.status}" -> "${status}". Project ID: ${task.projectId._id || task.projectId}. Client/Manager Alert Dispatched.`
      );
    }

    await syncProjectProgress(task.projectId._id || task.projectId);

    res.json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (SuperAdmin, Manager)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    await syncProjectProgress(task.projectId);
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
