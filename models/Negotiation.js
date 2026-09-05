const mongoose = require('mongoose');

const negotiationItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    index: true,
  },
  requestedQty: {
    type: Number,
    min: 0,
  },
  requestedDiscountPercent: {
    type: Number,
    min: 0,
    max: 100,
  },
  action: {
    type: String,
    enum: ['ADD', 'REMOVE', 'MODIFY'],
    required: true,
  },
});

const negotiationSchema = new mongoose.Schema(
  {
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
    type: {
      type: String,
      enum: ['COUNTER_OFFER', 'CHANGE_REQUEST'],
      required: true,
    },
    message: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
      required: true,
    },
    items: [negotiationItemSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Negotiation', negotiationSchema);
