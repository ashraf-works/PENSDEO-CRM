const Department = require('../models/Department');

// @desc    Get all dynamic departments
// @route   GET /api/departments
// @access  Private (All authenticated roles)
const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Create dynamic department
// @route   POST /api/departments
// @access  Private (SuperAdmin, Manager)
const createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Department name is required.' });
    }

    const existing = await Department.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: 'Department with this name already exists.' });
    }

    const department = await Department.create({ name, description });
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Update dynamic department
// @route   PUT /api/departments/:id
// @access  Private (SuperAdmin, Manager)
const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!department) {
      return res.status(404).json({ error: 'Department not found.' });
    }
    res.json(department);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (SuperAdmin)
const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) {
      return res.status(404).json({ error: 'Department not found.' });
    }
    res.json({ message: 'Department deleted successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
