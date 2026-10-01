const Deliverable = require('../models/Deliverable');

// @desc    Get deliverables scoped by user role
// @route   GET /api/deliverables
// @access  Private (Scoped via roleFilter)
const getDeliverables = async (req, res) => {
  try {
    const filter = req.roleFilter || {};
    const deliverables = await Deliverable.find(filter)
      .populate('projectId', 'title status')
      .sort({ createdAt: -1 });
    res.json(deliverables);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get deliverable by ID
// @route   GET /api/deliverables/:id
// @access  Private
const getDeliverableById = async (req, res) => {
  try {
    const deliverable = await Deliverable.findById(req.params.id).populate('projectId', 'title status');
    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found.' });
    }
    res.json(deliverable);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Upload / create new deliverable
// @route   POST /api/deliverables
// @access  Private (SuperAdmin, Manager, Employee)
const createDeliverable = async (req, res) => {
  try {
    const { projectId, title, fileUrl, type, status } = req.body;

    if (!projectId || !title || !fileUrl) {
      return res.status(400).json({ error: 'Please provide projectId, title, and fileUrl.' });
    }

    const deliverable = await Deliverable.create({
      projectId,
      title,
      fileUrl,
      type: type || 'Document',
      status: status || 'Pending Review',
    });

    console.log(`📁 [NEW DELIVERABLE UPLOADED] "${title}" (${fileUrl}) for Project (${projectId})`);

    res.status(201).json(deliverable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Client Review Endpoint: Update status (Approved / Changes Requested) & submit clientFeedback
// @route   PATCH /api/deliverables/:id/client-review
// @access  Private (Client, SuperAdmin, Manager)
const updateClientReview = async (req, res) => {
  try {
    const { status, clientFeedback } = req.body;

    if (!['Approved', 'Changes Requested', 'Pending Review'].includes(status)) {
      return res.status(400).json({
        error: "Invalid status. Allowed values: ['Approved', 'Changes Requested', 'Pending Review']",
      });
    }

    const deliverable = await Deliverable.findByIdAndUpdate(
      req.params.id,
      {
        status,
        clientFeedback: clientFeedback !== undefined ? clientFeedback : '',
      },
      { new: true, runValidators: true }
    ).populate('projectId', 'title');

    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found.' });
    }

    console.log(
      `💬 [CLIENT FEEDBACK SUBMITTED] Deliverable "${deliverable.title}" status updated to "${status}". Client Feedback: "${clientFeedback || 'None'}"`
    );

    res.json(deliverable);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete deliverable
// @route   DELETE /api/deliverables/:id
// @access  Private (SuperAdmin, Manager)
const deleteDeliverable = async (req, res) => {
  try {
    const deliverable = await Deliverable.findByIdAndDelete(req.params.id);
    if (!deliverable) {
      return res.status(404).json({ error: 'Deliverable not found.' });
    }
    res.json({ message: 'Deliverable deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDeliverables,
  getDeliverableById,
  createDeliverable,
  updateClientReview,
  deleteDeliverable,
};
