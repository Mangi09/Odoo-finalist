const mongoose = require('mongoose');

const fulfillmentSchema = new mongoose.Schema(
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
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
      index: true,
    },
    allocatedQty: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['RESERVED', 'SHIPPED', 'DELIVERED'],
      default: 'RESERVED',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Fulfillment', fulfillmentSchema);
