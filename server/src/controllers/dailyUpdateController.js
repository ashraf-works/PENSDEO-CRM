const DailyUpdate = require('../models/DailyUpdate');

// @desc    Get daily updates scoped strictly by role & visibility
// @route   GET /api/daily-updates
// @access  Private (Scoped via roleFilter)
const getDailyUpdates = async (req, res) => {
  try {
    const filter = req.roleFilter || {};
    const updates = await DailyUpdate.find(filter)
      .populate('projectId', 'title status')
      .populate('taskId', 'title status priority')
      .populate('employeeId', 'name email department')
      .populate('reviewedBy', 'name role')
      .sort({ createdAt: -1 });
    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single daily update log by ID
// @route   GET /api/daily-updates/:id
// @access  Private
const getDailyUpdateById = async (req, res) => {
  try {
    const update = await DailyUpdate.findById(req.params.id)
      .populate('projectId', 'title')
      .populate('taskId', 'title status')
      .populate('employeeId', 'name email department')
      .populate('reviewedBy', 'name role');

    if (!update) {
      return res.status(404).json({ error: 'Daily update log not found.' });
    }

    if (req.user.role === 'Client' && update.visibility !== 'Visible to Client') {
      return res.status(403).json({ error: 'Access denied: This log is internal only.' });
    }

    res.json(update);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create daily work log (with Multer file attachments)
// @route   POST /api/daily-updates
// @access  Private (SuperAdmin, Manager, Employee)
const createDailyUpdate = async (req, res) => {
  try {
    const { projectId, taskId, description, timeSpent, visibility } = req.body;

    if (!projectId || !description || !timeSpent) {
      return res.status(400).json({ error: 'Please provide projectId, description, and timeSpent.' });
    }

    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map((file) => ({
        fileName: file.originalname,
        fileUrl: `/uploads/${file.filename}`,
        fileType: file.mimetype,
      }));
    }

    const dailyUpdate = await DailyUpdate.create({
      projectId,
      taskId: taskId || null,
      employeeId: req.user._id,
      description,
      timeSpent: Number(timeSpent),
      visibility: visibility || 'Internal Only',
      reviewStatus: 'Pending Review',
      attachments,
    });

    const populatedUpdate = await DailyUpdate.findById(dailyUpdate._id)
      .populate('projectId', 'title')
      .populate('taskId', 'title status')
      .populate('employeeId', 'name email department');

    res.status(201).json(populatedUpdate);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Manager Detailed Review & Messaging Endpoint
// @route   PATCH /api/daily-updates/:id/manager-review
// @access  Private (SuperAdmin, Manager ONLY)
const updateManagerReview = async (req, res) => {
  try {
    const { visibility, reviewStatus, managerNotesForClient, managerNotesForEmployee } = req.body;

    const update = await DailyUpdate.findById(req.params.id);
    if (!update) {
      return res.status(404).json({ error: 'Daily update log not found.' });
    }

    if (visibility) update.visibility = visibility;
    if (reviewStatus) update.reviewStatus = reviewStatus;
    if (managerNotesForClient !== undefined) update.managerNotesForClient = managerNotesForClient;
    if (managerNotesForEmployee !== undefined) update.managerNotesForEmployee = managerNotesForEmployee;
    update.reviewedBy = req.user._id;

    await update.save();

    const populated = await DailyUpdate.findById(update._id)
      .populate('projectId', 'title')
      .populate('taskId', 'title status')
      .populate('employeeId', 'name email department')
      .populate('reviewedBy', 'name role');

    console.log(
      `💬 [MANAGER REVIEW UPDATED] Report (${update._id}) set to "${update.reviewStatus}" (Visibility: ${update.visibility}) by ${req.user.name}`
    );

    res.json(populated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Toggle client visibility flag
// @route   PATCH /api/daily-updates/:id/visibility
// @access  Private (SuperAdmin, Manager ONLY)
const updateVisibility = async (req, res) => {
  try {
    const { visibility } = req.body;

    if (!['Internal Only', 'Visible to Client'].includes(visibility)) {
      return res.status(400).json({
        error: "Invalid visibility. Allowed values: ['Internal Only', 'Visible to Client']",
      });
    }

    const update = await DailyUpdate.findByIdAndUpdate(
      req.params.id,
      { visibility, reviewedBy: req.user._id },
      { new: true, runValidators: true }
    );

    if (!update) {
      return res.status(404).json({ error: 'Daily update log not found.' });
    }

    res.json(update);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete daily update
// @route   DELETE /api/daily-updates/:id
// @access  Private (SuperAdmin, Manager)
const deleteDailyUpdate = async (req, res) => {
  try {
    const update = await DailyUpdate.findByIdAndDelete(req.params.id);
    if (!update) {
      return res.status(404).json({ error: 'Daily update log not found.' });
    }
    res.json({ message: 'Daily update log deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDailyUpdates,
  getDailyUpdateById,
  createDailyUpdate,
  updateManagerReview,
  updateVisibility,
  deleteDailyUpdate,
};
