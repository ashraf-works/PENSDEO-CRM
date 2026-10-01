const express = require('express');
const router = express.Router();
const { getUsers, createUser, updateUser, inviteUser, adminResetPassword } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, authorize('SuperAdmin', 'Manager'), getUsers);
router.post('/', protect, authorize('SuperAdmin', 'Manager'), createUser);
router.put('/:id', protect, authorize('SuperAdmin', 'Manager'), updateUser);
router.post('/invite', protect, authorize('SuperAdmin', 'Manager'), inviteUser);
router.post('/:id/reset-password', protect, authorize('SuperAdmin', 'Manager'), adminResetPassword);

module.exports = router;
