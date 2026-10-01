const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public Auth Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected Auth Routes
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

module.exports = router;
