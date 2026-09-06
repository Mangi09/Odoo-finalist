const Quotation = require('../models/Quotation');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const QuotationHistory = require('../models/QuotationHistory');
const Approval = require('../models/Approval');
const Negotiation = require('../models/Negotiation');
const DealHealth = require('../models/DealHealth');
const SalesOrder = require('../models/SalesOrder');
const { runDiscountEngine } = require('../services/discountEngine');
const { transitionStatus } = require('../utils/stateMachine');
const ApiResponse = require('../utils/apiResponse');
const { calculateQuotationTotals, normalizeDiscountPercent } = require('../utils/quotationTotals');

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
    subtotalAmount: q.subtotalAmount || q.totalAmount,
    globalDiscountPercent: q.globalDiscountPercent || 0,
    globalDiscountAmount: q.globalDiscountAmount || 0,
    totalAmount: q.totalAmount,
    status: q.status,
    salesperson: q.salespersonId?.name || 'Unassigned',
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
    const { status, search, customerId, includeArchived } = req.query;
    const filter = includeArchived === 'true' && req.user?.role === 'admin' ? {} : { isArchived: { $ne: true } };

    if (status && status !== 'All') {
      filter.status = status.toUpperCase() === 'CONFIRMED' ? 'ACCEPTED' : status.toUpperCase();
    }
    if (customerId) filter.customerId = customerId;

    if (req.user && req.user.role === 'salesperson') {
      filter.salespersonId = req.user.id;
    } else if (req.user && req.user.role === 'sales_manager') {
      const assignedCustomers = await Customer.find({ salespersonId: req.user.id }, '_id');
      filter.customerId = { $in: assignedCustomers.map(customer => customer._id) };
    } else if (req.user && req.user.role === 'customer') {
      filter.customerId = req.user.customerId;
    }

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

    if (req.user && req.user.role === 'salesperson' && quotation.salespersonId?._id?.toString() !== req.user.id && quotation.salespersonId?.toString() !== req.user.id) {
      return ApiResponse.forbidden(res, 'Access denied. You can only view your own quotations.');
    }
    if (req.user && req.user.role === 'sales_manager') {
      const assignedCustomer = await Customer.exists({ _id: quotation.customerId?._id || quotation.customerId, salespersonId: req.user.id });
      if (!assignedCustomer) {
        return ApiResponse.forbidden(res, 'Access denied. This customer is not assigned to you.');
      }
    }
    if (req.user && req.user.role === 'customer' && quotation.customerId?._id?.toString() !== req.user.customerId && quotation.customerId?.toString() !== req.user.customerId) {
      return ApiResponse.forbidden(res, 'Access denied. You can only view your own quotations.');
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
      status: quotation.status,
      subtotalAmount: quotation.subtotalAmount || quotation.items.reduce((sum, it) => sum + (it.lineTotal || 0), 0),
      globalDiscountPercent: quotation.globalDiscountPercent || 0,
      globalDiscountAmount: quotation.globalDiscountAmount || 0,
      totalAmount: quotation.totalAmount,
      totalMargin: quotation.totalMargin,
      customer: {
        _id: cust._id,
        name: cust.name || cust.companyName || 'Customer',
        contact: cust.contactPerson || cust.contactName || '',
        email: cust.email || '',
        phone: cust.phone || '',
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
async function calculateItems(items, globalDiscountPercent = 0) {
  const calculatedItems = [];
  for (const it of items) {
    const product = await Product.findById(it.productId);
    const unitPrice = it.unitPrice !== undefined ? it.unitPrice : (product ? product.sellingPrice : 0);
    const costPrice = product ? (product.costPrice || product.cost || 0) : 0;
    const qty = it.qty || it.quantity || 1;
    const discountPercent = normalizeDiscountPercent(it.discountPercent);
    if (Number(it.discountPercent || 0) !== discountPercent) {
      const err = new Error('Product discount must be between 0 and 100');
      err.statusCode = 400;
      throw err;
    }

    const discountedUnit = unitPrice * (1 - discountPercent / 100);
    const lineTotal = Math.round(discountedUnit * qty);
    const lineMargin = Math.round((discountedUnit - costPrice) * qty);

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

  const totals = calculateQuotationTotals(calculatedItems, globalDiscountPercent);
  return { calculatedItems, ...totals };
}

// Quotations do not reserve stock, but callers need an authoritative warning before saving.
async function getInventoryWarnings(items) {
  const requested = new Map();
  for (const item of items) {
    const id = item.productId?.toString();
    if (id) requested.set(id, (requested.get(id) || 0) + Number(item.qty || item.quantity || 1));
  }
  const warnings = [];
  for (const [productId, qty] of requested) {
    const inventory = await Inventory.aggregate([
      { $match: { productId: new (require('mongoose').Types.ObjectId)(productId) } },
      { $group: { _id: null, availableQty: { $sum: '$availableQty' } } }
    ]);
    const availableQty = inventory[0]?.availableQty || 0;
    if (qty > availableQty) warnings.push({ productId, requestedQty: qty, availableQty });
  }
  return warnings;
}

async function canManageQuotation(req, quotation) {
  if (req.user?.role === 'admin') return true;
  if (req.user?.role === 'salesperson') return quotation.salespersonId?.toString() === req.user.id;
  if (req.user?.role === 'sales_manager') {
    return Boolean(await Customer.exists({ _id: quotation.customerId, salespersonId: req.user.id }));
  }
  return false;
}

/**
 * POST /api/v1/quotations
 */
exports.createQuotation = async (req, res, next) => {
  try {
    const { customerId, salespersonId, items = [], title } = req.body;
    const globalDiscountPercent = normalizeDiscountPercent(req.body.globalDiscountPercent);
    if (Number(req.body.globalDiscountPercent || 0) !== globalDiscountPercent) {
      return ApiResponse.badRequest(res, 'Global discount must be between 0 and 100');
    }
    
    const finalSalespersonId = req.user?.role === 'salesperson'
      ? req.user.id
      : (salespersonId || req.user?.id || (await User.findOne())?._id);
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return ApiResponse.badRequest(res, 'Valid customerId is required');
    }
    if (['salesperson', 'sales_manager'].includes(req.user?.role) && customer.salespersonId?.toString() !== req.user.id) {
      return ApiResponse.forbidden(res, 'Access denied. This customer is not assigned to you.');
    }

    const {
      calculatedItems,
      subtotalAmount,
      globalDiscountAmount,
      totalAmount,
      totalMargin
    } = await calculateItems(items, globalDiscountPercent);

    const quotation = new Quotation({
      customerId,
      salespersonId: finalSalespersonId,
      title: title || `${customer.name || customer.companyName} Quotation`,
      status: 'DRAFT',
      items: calculatedItems,
      subtotalAmount,
      globalDiscountPercent,
      globalDiscountAmount,
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

    return ApiResponse.created(res, { ...quotation.toObject(), inventoryWarnings: await getInventoryWarnings(items) });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT/PATCH /api/v1/quotations/:id
 */
exports.updateQuotation = async (req, res, next) => {
  try {
    const { items, title, status } = req.body;
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return ApiResponse.notFound(res, 'Quotation not found');

    const hasGlobalDiscount = Object.prototype.hasOwnProperty.call(req.body, 'globalDiscountPercent');
    const globalDiscountPercent = hasGlobalDiscount
      ? normalizeDiscountPercent(req.body.globalDiscountPercent)
      : quotation.globalDiscountPercent || 0;
    if (hasGlobalDiscount && Number(req.body.globalDiscountPercent || 0) !== globalDiscountPercent) {
      return ApiResponse.badRequest(res, 'Global discount must be between 0 and 100');
    }
    if (req.user?.role === 'salesperson' && quotation.salespersonId.toString() !== req.user.id) {
      return ApiResponse.forbidden(res, 'You can only edit your own quotations');
    }
    if (req.user?.role === 'sales_manager') {
      const assignedCustomer = await Customer.exists({ _id: quotation.customerId, salespersonId: req.user.id });
      if (!assignedCustomer) return ApiResponse.forbidden(res, 'Access denied. This customer is not assigned to you.');
    }
    if (!['DRAFT', 'PENDING_APPROVAL', 'RE_APPROVAL'].includes(quotation.status)) {
      return ApiResponse.badRequest(res, 'Only draft or pending quotations can be edited');
    }

    if (title) quotation.title = title;

    if (items || hasGlobalDiscount) {
      const { calculatedItems, subtotalAmount, globalDiscountAmount, totalAmount, totalMargin } = await calculateItems(items || quotation.items, globalDiscountPercent);
      quotation.items = calculatedItems;
      quotation.subtotalAmount = subtotalAmount;
      quotation.globalDiscountPercent = globalDiscountPercent;
      quotation.globalDiscountAmount = globalDiscountAmount;
      quotation.totalAmount = totalAmount;
      quotation.totalMargin = totalMargin;
    }

    if (status && status !== quotation.status) {
      const actorId = req.user?._id || quotation.salespersonId;
      await transitionStatus(quotation, status, actorId, `Status updated to ${status}`);
    } else {
      await quotation.save();
    }

    return ApiResponse.success(res, { ...quotation.toObject(), inventoryWarnings: await getInventoryWarnings(items || quotation.items) });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/quotations/:id/archive
 */
exports.archiveQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return ApiResponse.notFound(res, 'Quotation not found');
    if (!(await canManageQuotation(req, quotation))) {
      return ApiResponse.forbidden(res, 'Access denied. You cannot archive this quotation.');
    }

    quotation.isArchived = true;
    quotation.archivedAt = new Date();
    quotation.archivedBy = req.user.id;
    await quotation.save();

    await QuotationHistory.create({
      quotationId: quotation._id,
      actorId: req.user.id,
      action: 'Quotation archived',
      oldValue: quotation.status,
      newValue: 'ARCHIVED'
    });

    return ApiResponse.success(res, quotation);
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/quotations/:id
 */
exports.deleteQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return ApiResponse.notFound(res, 'Quotation not found');
    if (!(await canManageQuotation(req, quotation))) {
      return ApiResponse.forbidden(res, 'Access denied. You cannot delete this quotation.');
    }

    const linkedOrder = await SalesOrder.exists({ quotationId: quotation._id });
    if (linkedOrder) {
      return ApiResponse.badRequest(res, 'This quotation has a linked Sales Order. Archive it instead to preserve related records.');
    }

    await Promise.all([
      Approval.deleteMany({ quotationId: quotation._id }),
      Negotiation.deleteMany({ quotationId: quotation._id }),
      DealHealth.deleteMany({ quotationId: quotation._id }),
      QuotationHistory.deleteMany({ quotationId: quotation._id })
    ]);
    await Quotation.deleteOne({ _id: quotation._id });

    return ApiResponse.success(res, { deleted: true, id: quotation._id });
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
    const { calculatedItems, subtotalAmount, globalDiscountAmount, totalAmount, totalMargin } = await calculateItems(newItems, quotation.globalDiscountPercent || 0);

    quotation.items = calculatedItems;
    quotation.subtotalAmount = subtotalAmount;
    quotation.globalDiscountAmount = globalDiscountAmount;
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
