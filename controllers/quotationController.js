const Quotation = require('../models/Quotation');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Product = require('../models/Product');
const QuotationHistory = require('../models/QuotationHistory');
const { runDiscountEngine } = require('../services/discountEngine');
const { transitionStatus } = require('../utils/stateMachine');
const ApiResponse = require('../utils/apiResponse');

function formatQuotationListItem(q) {
  const customerName = q.customerId?.name || 'Unknown Customer';
  const valDisplay = `₹${((q.totalAmount || 0) / 100000).toFixed(2)}L`;
  
  // Format stage to match frontend title-cased or standard status
  const stageMap = {
    DRAFT: 'Draft',
    PENDING_APPROVAL: 'Approval',
    APPROVED: 'Approved',
    SENT_TO_CUSTOMER: 'Sent',
    NEGOTIATION: 'Negotiation',
    RE_APPROVAL: 'Re-Approval',
    ACCEPTED: 'Accepted',
    CONFIRMED: 'Accepted',
    REJECTED: 'Rejected',
    CANCELLED: 'Cancelled'
  };

  return {
    _id: q._id,
    id: `Q-${q._id.toString().slice(-4).toUpperCase()}`,
    customer: customerName,
    title: q.title || `${customerName} Quotation`,
    value: valDisplay,
    totalAmount: q.totalAmount,
    stage: stageMap[q.status] || q.status,
    rawStatus: q.status,
    updated: q.updatedAt ? new Date(q.updatedAt).toLocaleDateString() : 'Just now',
    isPriority: (q.riskScore && q.riskScore > 50) || false
  };
}

/**
 * GET /api/v1/quotations
 */
exports.getQuotations = async (req, res, next) => {
  try {
    const { status, search, customerId } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status.toUpperCase() === 'CONFIRMED' ? 'ACCEPTED' : status.toUpperCase();
    }
    if (customerId) filter.customerId = customerId;

    const quotations = await Quotation.find(filter)
      .populate('customerId')
      .populate('salespersonId')
      .populate('items.productId')
      .sort({ updatedAt: -1 });

    let result = quotations.map(formatQuotationListItem);

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(q =>
        q.id.toLowerCase().includes(s) ||
        q.customer.toLowerCase().includes(s) ||
        q.title.toLowerCase().includes(s)
      );
    }

    return ApiResponse.success(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/quotations/:id
 */
exports.getQuotationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let quotation;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      quotation = await Quotation.findById(id)
        .populate('customerId')
        .populate('salespersonId')
        .populate('items.productId');
    } else {
      const all = await Quotation.find()
        .populate('customerId')
        .populate('salespersonId')
        .populate('items.productId');
      quotation = all.find(q => `Q-${q._id.toString().slice(-4).toUpperCase()}` === id.toUpperCase());
    }

    if (!quotation) {
      return ApiResponse.notFound(res, 'Quotation not found');
    }

    const histories = await QuotationHistory.find({ quotationId: quotation._id })
      .populate('actorId')
      .sort({ createdAt: 1 });

    const activities = histories.map(h => ({
      title: h.action || `Status changed to ${h.newValue || h.toStatus}`,
      time: new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    const cust = quotation.customerId || {};
    const formatted = {
      _id: quotation._id,
      id: `Q-${quotation._id.toString().slice(-4).toUpperCase()}`,
      title: quotation.title || `${cust.name || 'Deal'} Package`,
      stage: quotation.status,
      totalAmount: quotation.totalAmount,
      totalMargin: quotation.totalMargin,
      customer: {
        _id: cust._id,
        name: cust.name || 'Acme Corporation',
        contact: cust.contactPerson || cust.contactName || 'Contact Person',
        email: cust.email || 'contact@client.com',
        phone: cust.phone || '+91 98765 43210',
        category: cust.tierId ? 'Enterprise' : 'Standard'
      },
      details: {
        date: new Date(quotation.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
        validity: quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '30 Days',
        salesperson: quotation.salespersonId?.name || 'Sales Rep',
        paymentTerms: quotation.paymentTerms || 'Net 30',
        currency: 'INR'
      },
      items: quotation.items.map((it, idx) => ({
        id: idx + 1,
        _id: it._id,
        productId: it.productId?._id,
        product: it.productId?.name || 'Product',
        description: it.productId?.description || '',
        quantity: it.qty,
        unitPrice: it.unitPrice,
        discountPercent: it.discountPercent || 0,
        lineTotal: it.lineTotal,
        lineMargin: it.lineMargin || 0,
        isRecommendation: it.isRecommendation || false
      })),
      activities: activities.length > 0 ? activities : [
        { title: 'Quotation created', time: new Date(quotation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]
    };

    return ApiResponse.success(res, formatted);
  } catch (err) {
    next(err);
  }
};

/**
 * Helper to calculate quotation items totals and margin dynamically across all items
 */
async function calculateItems(items) {
  let totalAmount = 0;
  let totalMargin = 0;

  const calculatedItems = [];
  for (const it of items) {
    const product = await Product.findById(it.productId);
    const unitPrice = it.unitPrice !== undefined ? it.unitPrice : (product ? product.sellingPrice : 0);
    const costPrice = product ? (product.costPrice || product.cost || 0) : 0;
    const qty = it.qty || it.quantity || 1;
    const discountPercent = it.discountPercent || 0;

    const discountedUnit = unitPrice * (1 - discountPercent / 100);
    const lineTotal = Math.round(discountedUnit * qty);
    const lineMargin = Math.round((discountedUnit - costPrice) * qty);

    totalAmount += lineTotal;
    totalMargin += lineMargin;

    calculatedItems.push({
      _id: it._id,
      productId: it.productId,
      qty,
      unitPrice,
      discountPercent,
      lineTotal,
      lineMargin,
      isRecommendation: it.isRecommendation || false
    });
  }

  return { calculatedItems, totalAmount, totalMargin };
}

/**
 * POST /api/v1/quotations
 */
exports.createQuotation = async (req, res, next) => {
  try {
    const { customerId, salespersonId, items = [], title } = req.body;
    
    const finalSalespersonId = salespersonId || req.user?._id || (await User.findOne())?._id;
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return ApiResponse.badRequest(res, 'Valid customerId is required');
    }

    const { calculatedItems, totalAmount, totalMargin } = await calculateItems(items);

    const quotation = new Quotation({
      customerId,
      salespersonId: finalSalespersonId,
      title: title || `${customer.name} Quotation`,
      status: 'DRAFT',
      items: calculatedItems,
      totalAmount,
      totalMargin
    });

    await quotation.save();

    await QuotationHistory.create({
      quotationId: quotation._id,
      actorId: finalSalespersonId,
      action: 'Quotation created in DRAFT',
      oldValue: null,
      newValue: 'DRAFT'
    });

    return ApiResponse.created(res, quotation);
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/quotations/:id
 */
exports.updateQuotation = async (req, res, next) => {
  try {
    const { items, title, status } = req.body;
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return ApiResponse.notFound(res, 'Quotation not found');

    if (title) quotation.title = title;

    if (items) {
      const { calculatedItems, totalAmount, totalMargin } = await calculateItems(items);
      quotation.items = calculatedItems;
      quotation.totalAmount = totalAmount;
      quotation.totalMargin = totalMargin;
    }

    if (status && status !== quotation.status) {
      const actorId = req.user?._id || quotation.salespersonId;
      await transitionStatus(quotation, status, actorId, `Status updated to ${status}`);
    } else {
      await quotation.save();
    }

    return ApiResponse.success(res, quotation);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/quotations/:id/submit
 */
exports.submitQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('items.productId');
    if (!quotation) return ApiResponse.notFound(res, 'Quotation not found');

    const customer = await Customer.findById(quotation.customerId);
    const { needsApproval, decisions } = await runDiscountEngine(quotation, customer);

    const actorId = req.user?._id || quotation.salespersonId;
    const nextStatus = needsApproval ? 'PENDING_APPROVAL' : 'APPROVED';

    await transitionStatus(
      quotation,
      nextStatus,
      actorId,
      needsApproval ? 'Submitted for approval (discount threshold exceeded)' : 'Auto-approved by discount policy'
    );

    return ApiResponse.success(res, {
      quotation,
      needsApproval,
      decisions
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/quotations/:id/items
 */
exports.addItem = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return ApiResponse.notFound(res, 'Quotation not found');

    const newItems = [...quotation.items, req.body];
    const { calculatedItems, totalAmount, totalMargin } = await calculateItems(newItems);

    quotation.items = calculatedItems;
    quotation.totalAmount = totalAmount;
    quotation.totalMargin = totalMargin;
    await quotation.save();

    return ApiResponse.success(res, quotation);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/quotations/:id/accept
 * Accepts quotation and generates immutable SalesOrder
 */
exports.acceptQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    let quotation;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      quotation = await Quotation.findById(id).populate('items.productId');
    } else {
      const all = await Quotation.find().populate('items.productId');
      quotation = all.find(q => `Q-${q._id.toString().slice(-4).toUpperCase()}` === id.toUpperCase());
    }

    if (!quotation) {
      return ApiResponse.notFound(res, 'Quotation not found');
    }

    const actorId = req.user?._id || quotation.salespersonId || quotation.customerId;
    const { createSalesOrderFromQuotation } = require('../services/salesOrderService');
    const salesOrder = await createSalesOrderFromQuotation(quotation, actorId);

    return ApiResponse.success(res, {
      message: 'Quotation accepted and SalesOrder created successfully',
      quotationId: quotation._id,
      salesOrder
    });
  } catch (err) {
    next(err);
  }
};
