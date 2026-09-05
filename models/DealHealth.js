const mongoose = require('mongoose');

const dealHealthSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DealHealth', dealHealthSchema);
