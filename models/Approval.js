const mongoose = require('mongoose');

const approvalSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true,
      index: true,
    },
    quotationItemId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    approverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    level: {
      type: Number,
      required: true,
    },
    requestedDiscountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    allowedDiscountPercent: {
      type: Number,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    decidedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Approval', approvalSchema);
