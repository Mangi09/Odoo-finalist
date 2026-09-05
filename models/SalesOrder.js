const mongoose = require('mongoose');

const salesOrderItemSchema = new mongoose.Schema({
  quotationItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  qty: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  discountPercent: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  lineTotal: {
    type: Number,
    required: true,
    min: 0,
  },
  lineMargin: {
    type: Number,
    default: 0,
  },
  billingType: {
    type: String,
    enum: ['ONE_TIME', 'RECURRING'],
    required: true,
    default: 'ONE_TIME',
  },
  isRecommendation: {
    type: Boolean,
    default: false,
  },
});

const salesOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    salespersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: [salesOrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalMargin: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: [
        'CONFIRMED',
        'IN_FULFILLMENT',
        'PARTIALLY_FULFILLED',
        'BILLED',
        'PAID',
        'CLOSED',
        'CANCELLED',
      ],
      default: 'CONFIRMED',
      required: true,
    },
    confirmedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SalesOrder', salesOrderSchema);
