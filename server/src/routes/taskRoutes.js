const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} = require('../controllers/taskController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { scopeQuery } = require('../middleware/scopeMiddleware');
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .get(protect, scopeQuery('Task'), getTasks)
  .post(protect, authorize('SuperAdmin', 'Manager'), upload.array('attachments', 5), createTask);

router
  .route('/:id')
  .get(protect, getTaskById)
  .put(protect, authorize('SuperAdmin', 'Manager', 'Employee'), upload.array('attachments', 5), updateTask)
  .delete(protect, authorize('SuperAdmin', 'Manager'), deleteTask);

router
  .route('/:id/status')
  .patch(protect, authorize('SuperAdmin', 'Manager', 'Employee'), updateTaskStatus);

module.exports = router;
