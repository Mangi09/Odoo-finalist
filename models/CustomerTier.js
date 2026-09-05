const mongoose = require('mongoose');

const customerTierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold'],
      required: true,
      unique: true,
    },
    maxDiscountPercent: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CustomerTier', customerTierSchema);
