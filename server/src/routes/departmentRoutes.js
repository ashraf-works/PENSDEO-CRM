const express = require('express');
const router = express.Router();
const {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/departmentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(protect, getDepartments)
  .post(protect, authorize('SuperAdmin', 'Manager'), createDepartment);

router
  .route('/:id')
  .put(protect, authorize('SuperAdmin', 'Manager'), updateDepartment)
  .delete(protect, authorize('SuperAdmin'), deleteDepartment);

module.exports = router;
