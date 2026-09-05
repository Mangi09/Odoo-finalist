const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['UPSELL', 'CROSS_SELL'],
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    marginImpact: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
      default: 'PENDING',
      required: true,
    },
    resultingQuotationItemId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Recommendation', recommendationSchema);
