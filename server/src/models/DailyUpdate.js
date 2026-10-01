const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, default: 'application/octet-stream' },
});

const dailyUpdateSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee ID is required'],
    },
    description: {
      type: String,
      required: [true, 'Daily update description is required'],
      trim: true,
    },
    timeSpent: {
      type: Number, // In minutes
      required: [true, 'Time spent in minutes is required'],
      min: [1, 'Time spent must be at least 1 minute'],
    },
    visibility: {
      type: String,
      enum: ['Internal Only', 'Visible to Client'],
      default: 'Internal Only',
      required: true,
    },
    // Manager Review & Messaging Fields
    reviewStatus: {
      type: String,
      enum: ['Pending Review', 'Approved by Manager', 'Changes Requested'],
      default: 'Pending Review',
    },
    managerNotesForClient: {
      type: String,
      default: '',
      trim: true,
    },
    managerNotesForEmployee: {
      type: String,
      default: '',
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    attachments: [attachmentSchema],
  },
  {
    timestamps: true,
  }
);

const DailyUpdate = mongoose.model('DailyUpdate', dailyUpdateSchema);
module.exports = DailyUpdate;
