const express = require('express');
const router = express.Router();
const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  calculateProjectProgress,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { scopeQuery } = require('../middleware/scopeMiddleware');
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .get(protect, scopeQuery('Project'), getProjects)
  .post(
    protect,
    authorize('SuperAdmin', 'Manager'),
    upload.array('attachments', 5),
    createProject
  );

router
  .route('/:id')
  .get(protect, getProjectById)
  .put(
    protect,
    authorize('SuperAdmin', 'Manager'),
    upload.array('attachments', 5),
    updateProject
  )
  .delete(protect, authorize('SuperAdmin'), deleteProject);

// Endpoint to recalculate & update project progressPercentage
router
  .route('/:id/calculate-progress')
  .post(protect, authorize('SuperAdmin', 'Manager', 'Employee'), calculateProjectProgress);

module.exports = router;
