const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
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
  isRecommendation: {
    type: Boolean,
    default: false,
  },
});

const quotationSchema = new mongoose.Schema(
  {
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
    title: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: [
        'DRAFT',
        'PENDING_APPROVAL',
        'APPROVED',
        'SENT_TO_CUSTOMER',
        'NEGOTIATION',
        'RE_APPROVAL',
        'ACCEPTED',
        'REJECTED',
        'CANCELLED',
      ],
      default: 'DRAFT',
      required: true,
    },
    items: [quotationItemSchema],
    subtotalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    globalDiscountPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    globalDiscountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMargin: {
      type: Number,
      default: 0,
    },
    riskScore: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    archivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Quotation', quotationSchema);
