const Quotation = require('../models/Quotation');
const Negotiation = require('../models/Negotiation');
const Customer = require('../models/Customer');
const { transitionStatus } = require('../utils/stateMachine');
const { allocateForQuotation } = require('../services/warehouseAllocator');
const { generateBilling } = require('../services/billingService');
const ApiResponse = require('../utils/apiResponse');

const ALLOWED_DISCOUNT_THRESHOLD = 12; // 12% max auto-approve threshold

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

    const cust = quotation.customerId || {};
    const safeData = {
      id: `Q-${quotation._id.toString().slice(-4).toUpperCase()}`,
      _id: quotation._id,
      customerName: cust.name,
      status: quotation.status,
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
 * Customer confirms the quotation
 */
exports.acceptQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('items.productId');
    if (!quotation) return ApiResponse.notFound(res, 'Quotation not found');

    if (quotation.status === 'RE_APPROVAL' || quotation.status === 'PENDING_APPROVAL') {
      return ApiResponse.badRequest(res, 'Quotation is currently under internal approval. Please wait for confirmation.');
    }

    const actorId = req.user?._id || quotation.customerId;
    await transitionStatus(quotation, 'CONFIRMED', actorId, 'Customer accepted quotation via portal');

    // Trigger warehouse inventory allocation
    const allocationResult = await allocateForQuotation(quotation);

    // Trigger billing generation (invoices & subscriptions)
    const billingResult = await generateBilling(quotation);

    // Move to FULFILLMENT stage
    await transitionStatus(quotation, 'FULFILLMENT', actorId, 'Order entered fulfillment');

    return ApiResponse.success(res, {
      message: 'Quotation accepted and order placed successfully',
      quotation,
      allocation: allocationResult,
      billing: billingResult
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
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return ApiResponse.notFound(res, 'Quotation not found');

    const { counterDiscount, requestedDate, lineComment, lineItemName } = req.body;
    const discountVal = parseFloat(counterDiscount);

    const negotiation = await Negotiation.create({
      quotationId: quotation._id,
      items: quotation.items.map(it => ({
        productId: it.productId,
        action: 'MODIFY',
        requestedQty: it.qty,
        requestedDiscountPercent: !isNaN(discountVal) ? discountVal : it.discountPercent
      })),
      notes: lineComment || `Counter offer: ${counterDiscount}% discount requested. Date: ${requestedDate || 'Standard'}`
    });

    const actorId = req.user?._id || quotation.customerId;

    let quoteStatus;
    let notification;

    if (!isNaN(discountVal) && discountVal > ALLOWED_DISCOUNT_THRESHOLD) {
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
      negotiation
    });
  } catch (err) {
    next(err);
  }
};
