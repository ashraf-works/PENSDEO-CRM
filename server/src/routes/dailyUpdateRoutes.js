const express = require('express');
const router = express.Router();
const {
  getDailyUpdates,
  getDailyUpdateById,
  createDailyUpdate,
  updateManagerReview,
  updateVisibility,
  deleteDailyUpdate,
} = require('../controllers/dailyUpdateController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { scopeQuery } = require('../middleware/scopeMiddleware');
const upload = require('../middleware/uploadMiddleware');

router
  .route('/')
  .get(protect, scopeQuery('DailyUpdate'), getDailyUpdates)
  .post(
    protect,
    authorize('SuperAdmin', 'Manager', 'Employee'),
    upload.array('attachments', 5),
    createDailyUpdate
  );

router
  .route('/:id')
  .get(protect, getDailyUpdateById)
  .delete(protect, authorize('SuperAdmin', 'Manager'), deleteDailyUpdate);

// Manager Detailed Review & Messaging Route
router
  .route('/:id/manager-review')
  .patch(protect, authorize('SuperAdmin', 'Manager'), updateManagerReview);

// Admin Control Route: Toggle visibility for client
router
  .route('/:id/visibility')
  .patch(protect, authorize('SuperAdmin', 'Manager'), updateVisibility);

module.exports = router;
