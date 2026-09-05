const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    availableQty: {
      type: Number,
      default: 0,
      min: 0,
    },
    reservedQty: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.index({ warehouseId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
