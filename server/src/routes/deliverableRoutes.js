const express = require('express');
const router = express.Router();
const {
  getDeliverables,
  getDeliverableById,
  createDeliverable,
  updateClientReview,
  deleteDeliverable,
} = require('../controllers/deliverableController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { scopeQuery } = require('../middleware/scopeMiddleware');

router
  .route('/')
  .get(protect, scopeQuery('Deliverable'), getDeliverables)
  .post(protect, authorize('SuperAdmin', 'Manager', 'Employee'), createDeliverable);

router
  .route('/:id')
  .get(protect, getDeliverableById)
  .delete(protect, authorize('SuperAdmin', 'Manager'), deleteDeliverable);

// Client Specific Endpoint to submit review (Approved / Changes Requested) & clientFeedback
router
  .route('/:id/client-review')
  .patch(protect, authorize('Client', 'SuperAdmin', 'Manager'), updateClientReview);

// Alias route for backward compatibility
router
  .route('/:id/feedback')
  .patch(protect, authorize('Client', 'SuperAdmin', 'Manager'), updateClientReview);

module.exports = router;
