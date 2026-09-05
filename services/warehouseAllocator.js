/**
 * Warehouse Allocator Service
 * Allocates inventory across warehouses by priority for confirmed sales orders.
 */

const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');
const Fulfillment = require('../models/Fulfillment');
const Backorder = require('../models/Backorder');
const Product = require('../models/Product');
const logger = require('../utils/logger');

/**
 * Allocate inventory for a confirmed sales order.
 * @param {Object} salesOrder - SalesOrder document with items
 * @returns {Promise<{ fulfillments: Array, backorders: Array }>}
 */
async function allocateForSalesOrder(salesOrder) {
  const warehouses = await Warehouse.find().sort({ priority: 1 }); // lower priority number = higher priority
  const fulfillments = [];
  const backorders = [];

  for (const item of salesOrder.items) {
    const product = await Product.findById(item.productId);
    
    // Skip recurring/service products — no physical inventory
    const billingType = item.billingType || (product ? product.billingType : 'ONE_TIME');
    if (billingType === 'RECURRING') continue;

    let remainingQty = item.qty;

    for (const warehouse of warehouses) {
      if (remainingQty <= 0) break;

      const inventory = await Inventory.findOne({
        warehouseId: warehouse._id,
        productId: item.productId,
      });

      if (!inventory || inventory.availableQty <= 0) continue;

      const allocateQty = Math.min(remainingQty, inventory.availableQty);

      // Decrement available, increment reserved
      inventory.availableQty -= allocateQty;
      inventory.reservedQty += allocateQty;
      await inventory.save();

      const fulfillment = await Fulfillment.create({
        salesOrderId: salesOrder._id,
        salesOrderItemId: item._id || item.quotationItemId,
        warehouseId: warehouse._id,
        allocatedQty: allocateQty,
        status: 'RESERVED',
      });

      fulfillments.push(fulfillment);
      remainingQty -= allocateQty;

      logger.info(`Allocated ${allocateQty}x ${product ? product.name : item.productId} from ${warehouse.name}`);
    }

    // If still remaining → backorder
    if (remainingQty > 0) {
      const backorder = await Backorder.create({
        salesOrderId: salesOrder._id,
        salesOrderItemId: item._id || item.quotationItemId,
        productId: item.productId,
        pendingQty: remainingQty,
        status: 'PENDING',
      });

      backorders.push(backorder);
      logger.warn(`Backorder: ${remainingQty}x ${product ? product.name : item.productId} — insufficient inventory`);
    }
  }

  return { fulfillments, backorders };
}

module.exports = { allocateForSalesOrder, allocateForQuotation: allocateForSalesOrder };
