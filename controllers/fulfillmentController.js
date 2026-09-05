const Fulfillment = require('../models/Fulfillment');
const Quotation = require('../models/Quotation');
const Warehouse = require('../models/Warehouse');
const Product = require('../models/Product');
const { transitionStatus } = require('../utils/stateMachine');
const ApiResponse = require('../utils/apiResponse');

function formatFulfillment(f) {
  const quote = f.quotationId || {};
  const cust = quote.customerId || {};
  const warehouse = f.warehouseId || {};

  return {
    _id: f._id,
    id: `FUL-${f._id.toString().slice(-4).toUpperCase()}`,
    quotation: quote.quotationNumber || (quote._id ? `Q-${quote._id.toString().slice(-4).toUpperCase()}` : 'Q-1040'),
    quotationId: quote._id,
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
    const { status, quotationId } = req.query;
    const filter = {};
    if (status) filter.status = status.toUpperCase();
    if (quotationId) filter.quotationId = quotationId;

    const fulfillments = await Fulfillment.find(filter)
      .populate({
        path: 'quotationId',
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
        path: 'quotationId',
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

    // If delivered, check if all fulfillments for this quotation are delivered
    if (status === 'DELIVERED') {
      const remaining = await Fulfillment.countDocuments({
        quotationId: fulfillment.quotationId,
        status: { $ne: 'DELIVERED' }
      });

      if (remaining === 0) {
        const quotation = await Quotation.findById(fulfillment.quotationId);
        if (quotation && quotation.status === 'FULFILLMENT') {
          const actorId = req.user?._id || quotation.salespersonId;
          await transitionStatus(quotation, 'BILLED', actorId, 'All items delivered — ready for final billing');
        }
      }
    }

    return ApiResponse.success(res, formatFulfillment(fulfillment));
  } catch (err) {
    next(err);
  }
};
