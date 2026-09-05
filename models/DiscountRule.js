const mongoose = require('mongoose');

const discountRuleSchema = new mongoose.Schema(
  {
    tierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CustomerTier',
      default: null,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
      index: true,
    },
    maxDiscountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    approvalLevel: {
      type: Number,
      required: true,
      default: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DiscountRule', discountRuleSchema);
