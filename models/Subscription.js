const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    salesOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalesOrder',
      default: null,
      index: true,
    },
    salesOrderItemId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    frequency: {
      type: String,
      enum: ['MONTHLY', 'QUARTERLY', 'YEARLY'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED'],
      default: 'ACTIVE',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);
