const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register / Invite a new user
// @route   POST /api/auth/register
// @access  Public (Self-registration) or Protected (SuperAdmin / Manager invite)
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    let assignedRole = role || 'Employee';

    if (req.user && !['SuperAdmin', 'Manager'].includes(req.user.role)) {
      assignedRole = 'Employee';
    }

    const user = await User.create({
      name,
      email,
      password,
      role: assignedRole,
      department: department || 'Development',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(400).json({ error: 'Invalid user data provided.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Authenticate user & get JWT token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        assignedProjects: user.assignedProjects,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password.' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private (Protected by JWT)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('assignedProjects');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// @desc    Change user password
// @route   POST /api/auth/change-password
// @access  Private (Protected by JWT)
const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Please provide oldPassword and newPassword.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user._id).select('+password');

    if (!user || !(await user.matchPassword(oldPassword))) {
      return res.status(401).json({ error: 'Invalid current password.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  changePassword,
};
