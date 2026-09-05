const mongoose = require('mongoose');

const fulfillmentSchema = new mongoose.Schema(
  {
    quotationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quotation',
      required: true,
      index: true,
    },
    quotationItemId: {
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
