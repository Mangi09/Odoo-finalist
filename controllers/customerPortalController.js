const Quotation = require('../models/Quotation');
const Negotiation = require('../models/Negotiation');
const Customer = require('../models/Customer');
const SalesOrder = require('../models/SalesOrder');
const { transitionStatus } = require('../utils/stateMachine');
const { createSalesOrderFromQuotation } = require('../services/salesOrderService');
const ApiResponse = require('../utils/apiResponse');

const ALLOWED_DISCOUNT_THRESHOLD = 12; // 12% max auto-approve threshold

exports.getAdminRequests = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user && ['salesperson', 'sales_manager'].includes(req.user.role)) {
      const assignedCustomers = await Customer.find({ salespersonId: req.user.id }, '_id');
      filter.customerId = { $in: assignedCustomers.map(c => c._id) };
    }

    const negotiations = await Negotiation.find(filter)
      .populate('customerId')
      .populate('quotationId')
      .populate('salesOrderId')
      .sort({ createdAt: -1 });

    const quoteIds = negotiations.map(item => item.quotationId?._id || item.quotationId).filter(Boolean);
    const orders = await SalesOrder.find({ quotationId: { $in: quoteIds } }, 'orderNumber quotationId');
    const orderByQuote = orders.reduce((acc, order) => {
      acc[order.quotationId.toString()] = order;
      return acc;
    }, {});

    return ApiResponse.success(res, negotiations.map(item => {
      const quoteId = item.quotationId?._id || item.quotationId;
      const order = item.salesOrderId || (quoteId ? orderByQuote[quoteId.toString()] : null);
      return {
        _id: item._id,
        customerName: item.customerId?.companyName || item.customerId?.name || 'Customer',
        orderNumber: order?.orderNumber || '-',
        orderId: order?._id || null,
        quotationId: quoteId || null,
        request: item.message || item.type,
        status: item.status,
        createdAt: item.createdAt
      };
    }));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/portal/quotation/:id
 * Customer safe quotation view
 */
exports.getPortalQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    let quotation;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      quotation = await Quotation.findById(id).populate('customerId').populate('items.productId');
    } else {
      const all = await Quotation.find().populate('customerId').populate('items.productId');
      quotation = all.find(q => `Q-${q._id.toString().slice(-4).toUpperCase()}` === id.toUpperCase());
    }

    if (!quotation) return ApiResponse.notFound(res, 'Quotation not found');

    if (req.user && req.user.role === 'customer') {
      if (quotation.customerId?._id?.toString() !== req.user.customerId && quotation.customerId?.toString() !== req.user.customerId) {
        return ApiResponse.forbidden(res, 'Access denied. This quotation belongs to another customer.');
      }
    }

    const cust = quotation.customerId || {};
    const safeData = {
      id: `Q-${quotation._id.toString().slice(-4).toUpperCase()}`,
      _id: quotation._id,
      customerName: cust.companyName || cust.name || 'Customer',
      status: quotation.status,
      subtotalAmount: quotation.subtotalAmount || quotation.items.reduce((sum, it) => sum + (it.lineTotal || 0), 0),
      globalDiscountPercent: quotation.globalDiscountPercent || 0,
      globalDiscountAmount: quotation.globalDiscountAmount || 0,
      totalAmount: quotation.totalAmount,
      items: quotation.items.map(it => ({
        id: it._id,
        name: it.productId?.name || 'Product',
        qty: it.qty,
        unitPrice: it.unitPrice,
        discountPercent: it.discountPercent,
        lineTotal: it.lineTotal
      }))
    };

    return ApiResponse.success(res, safeData);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/portal/quotation/:id/accept
 * Customer confirms the quotation -> creates SalesOrder
 */
exports.acceptQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('items.productId');
    if (!quotation) return ApiResponse.notFound(res, 'Quotation not found');

    if (req.user && req.user.role === 'customer') {
      if (quotation.customerId?._id?.toString() !== req.user.customerId && quotation.customerId?.toString() !== req.user.customerId) {
        return ApiResponse.forbidden(res, 'Access denied. This quotation belongs to another customer.');
      }
    }

    if (quotation.status === 'RE_APPROVAL' || quotation.status === 'PENDING_APPROVAL') {
      return ApiResponse.badRequest(res, 'Quotation is currently under internal approval. Please wait for confirmation.');
    }

    const actorId = req.user?._id || quotation.customerId;
    const salesOrder = await createSalesOrderFromQuotation(quotation, actorId);

    return ApiResponse.success(res, {
      message: 'Quotation accepted and Sales Order created successfully',
      quotation,
      salesOrder
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/portal/quotation/:id/reject
 */
exports.rejectQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return ApiResponse.notFound(res, 'Quotation not found');

    if (req.user && req.user.role === 'customer') {
      if (quotation.customerId?._id?.toString() !== req.user.customerId && quotation.customerId?.toString() !== req.user.customerId) {
        return ApiResponse.forbidden(res, 'Access denied. This quotation belongs to another customer.');
      }
    }

    const actorId = req.user?._id || quotation.customerId;
    const { reason } = req.body;
    await transitionStatus(quotation, 'CANCELLED', actorId, `Customer rejected quotation: ${reason || 'Not interested'}`);

    return ApiResponse.success(res, {
      message: 'Quotation rejected by customer',
      quotation
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/portal/quotation/:id/negotiate
 * Body: { counterDiscount, requestedDate, lineComment, lineItemName }
 */
exports.submitNegotiation = async (req, res, next) => {
  try {
    const { orderId, counterDiscount, requestedDate, lineComment, lineItemName } = req.body;
    let salesOrder = null;
    let quotationId = req.params.id;

    if (orderId) {
      salesOrder = await SalesOrder.findOne({ _id: orderId, customerId: req.user.customerId });
      if (!salesOrder) return ApiResponse.forbidden(res, 'Access denied. This sales order belongs to another customer.');
      quotationId = salesOrder.quotationId;
    }

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) return ApiResponse.notFound(res, 'Quotation not found');

    if (req.user && req.user.role === 'customer') {
      if (quotation.customerId?._id?.toString() !== req.user.customerId && quotation.customerId?.toString() !== req.user.customerId) {
        return ApiResponse.forbidden(res, 'Access denied. This quotation belongs to another customer.');
      }
    }

    const discountVal = parseFloat(counterDiscount);

    const negotiation = await Negotiation.create({
      quotationId: quotation._id,
      customerId: quotation.customerId,
      salesOrderId: salesOrder?._id || null,
      type: 'COUNTER_OFFER',
      items: quotation.items.map(it => ({
        quotationItemId: it._id,
        productId: it.productId,
        action: 'MODIFY',
        requestedQty: it.qty,
        requestedDiscountPercent: !isNaN(discountVal) ? discountVal : it.discountPercent
      })),
      message: lineComment || `Counter offer for ${salesOrder?.orderNumber || 'quotation'}: ${counterDiscount}% discount requested. Date: ${requestedDate || 'Standard'}`
    });

    const actorId = req.user?._id || quotation.customerId;

    let quoteStatus = quotation.status;
    let notification;

    if (quotation.status === 'ACCEPTED' || salesOrder) {
      quoteStatus = salesOrder ? salesOrder.status : 'ACCEPTED';
      notification = `Request submitted for order ${salesOrder?.orderNumber || quotation._id}. Your sales rep has been notified.`;
    } else if (!isNaN(discountVal) && discountVal > ALLOWED_DISCOUNT_THRESHOLD) {
      // Exceeds threshold -> Re-approval required
      await transitionStatus(quotation, 'NEGOTIATION', actorId, `Customer requested ${discountVal}% discount (exceeds ${ALLOWED_DISCOUNT_THRESHOLD}%)`);
      await transitionStatus(quotation, 'RE_APPROVAL', actorId, 'Re-approval initiated due to high discount request');
      quoteStatus = 'Pending Re-Approval';
      notification = `Negotiation request submitted (${discountVal}% discount requested). Requested discount exceeds allowed threshold (${ALLOWED_DISCOUNT_THRESHOLD}%). Quotation has re-entered internal approval workflow.`;
    } else {
      // Auto-accept within threshold
      await transitionStatus(quotation, 'NEGOTIATION', actorId, `Customer requested reasonable discount: ${discountVal || 10}%`);
      quoteStatus = 'Approved - Ready for Confirmation';
      notification = `Negotiation request accepted. Terms updated to ${discountVal || 10}% discount. You can now confirm the quotation.`;
    }

    return ApiResponse.success(res, {
      quoteStatus,
      notification,
      negotiation,
      salesOrderId: salesOrder?._id || null,
      orderNumber: salesOrder?.orderNumber || null
    });
  } catch (err) {
    next(err);
  }
};
