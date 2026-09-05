const Fulfillment = require('../models/Fulfillment');
const SalesOrder = require('../models/SalesOrder');
const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const { transitionSalesOrderStatus } = require('../utils/stateMachine');
const ApiResponse = require('../utils/apiResponse');

function formatFulfillment(f) {
  const order = f.salesOrderId || {};
  const cust = order.customerId || {};
  const warehouse = f.warehouseId || {};

  return {
    _id: f._id,
    id: `FUL-${f._id.toString().slice(-4).toUpperCase()}`,
    salesOrderId: order._id,
    salesOrderNumber: order.orderNumber || 'SO-2026-0001',
    customer: cust.name || 'Customer',
    warehouse: warehouse.name || 'Main Warehouse',
    allocatedQty: f.allocatedQty,
    status: f.status,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt
  };
}

/**
 * GET /api/v1/fulfillments
 */
exports.getFulfillments = async (req, res, next) => {
  try {
    const { status, salesOrderId } = req.query;
    const filter = {};
    if (status) filter.status = status.toUpperCase();
    if (salesOrderId) filter.salesOrderId = salesOrderId;

    const fulfillments = await Fulfillment.find(filter)
      .populate({
        path: 'salesOrderId',
        populate: { path: 'customerId' }
      })
      .populate('warehouseId')
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, fulfillments.map(formatFulfillment));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/fulfillments/:id
 */
exports.getFulfillmentById = async (req, res, next) => {
  try {
    const fulfillment = await Fulfillment.findById(req.params.id)
      .populate({
        path: 'salesOrderId',
        populate: [{ path: 'customerId' }, { path: 'items.productId' }]
      })
      .populate('warehouseId');

    if (!fulfillment) return ApiResponse.notFound(res, 'Fulfillment not found');

    return ApiResponse.success(res, formatFulfillment(fulfillment));
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/fulfillments/:id
 * Body: { status: 'SHIPPED' | 'DELIVERED' }
 */
exports.updateFulfillmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['RESERVED', 'SHIPPED', 'DELIVERED'].includes(status)) {
      return ApiResponse.badRequest(res, 'Status must be RESERVED, SHIPPED, or DELIVERED');
    }

    const fulfillment = await Fulfillment.findById(req.params.id);
    if (!fulfillment) return ApiResponse.notFound(res, 'Fulfillment not found');

    fulfillment.status = status;
    await fulfillment.save();

    // If delivered, check if all fulfillments for this SalesOrder are delivered
    if (status === 'DELIVERED') {
      const remaining = await Fulfillment.countDocuments({
        salesOrderId: fulfillment.salesOrderId,
        status: { $ne: 'DELIVERED' }
      });

      if (remaining === 0) {
        const salesOrder = await SalesOrder.findById(fulfillment.salesOrderId);
        if (salesOrder && (salesOrder.status === 'IN_FULFILLMENT' || salesOrder.status === 'PARTIALLY_FULFILLED')) {
          const actorId = req.user?._id || salesOrder.salespersonId;
          await transitionSalesOrderStatus(salesOrder, 'BILLED', actorId, 'All items delivered — order billed');
        }
      }
    }

    return ApiResponse.success(res, formatFulfillment(fulfillment));
  } catch (err) {
    next(err);
  }
};
