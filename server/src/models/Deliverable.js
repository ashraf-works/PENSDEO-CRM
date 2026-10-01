const mongoose = require('mongoose');

const deliverableSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Project ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Deliverable title is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL is required'],
      trim: true,
    },
    type: {
      type: String,
      default: 'Document', // e.g., 'Design', 'Code', 'Document', 'Report'
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Pending Review', 'Approved', 'Changes Requested'],
      default: 'Pending Review',
    },
    clientFeedback: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Deliverable = mongoose.model('Deliverable', deliverableSchema);
module.exports = Deliverable;
