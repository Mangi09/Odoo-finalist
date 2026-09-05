const mongoose = require('mongoose');

const backorderSchema = new mongoose.Schema(
  {
    salesOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SalesOrder',
      required: true,
      index: true,
    },
    salesOrderItemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    pendingQty: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['PENDING', 'FULFILLED', 'CANCELLED'],
      default: 'PENDING',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Backorder', backorderSchema);
