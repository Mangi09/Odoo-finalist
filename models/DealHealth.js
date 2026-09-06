const mongoose = require('mongoose');

const dealHealthSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      default: null,
      index: true,
    },
    salesOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalesOrder',
      default: null,
      index: true,
    },
    score: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['HEALTHY', 'AT_RISK', 'CRITICAL'],
      required: true,
    },
    riskFactors: {
      type: [String],
      default: [],
    },
    escalated: {
      type: Boolean,
      default: false,
      index: true,
    },
    escalatedAt: {
      type: Date,
      default: null,
    },
    escalatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DealHealth', dealHealthSchema);
