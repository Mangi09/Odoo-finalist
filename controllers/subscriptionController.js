const Subscription = require('../models/Subscription');
const SalesOrder = require('../models/SalesOrder');
const Quotation = require('../models/Quotation');
const Product = require('../models/Product');
const Customer = require('../models/Customer');
const ApiResponse = require('../utils/apiResponse');

function formatSubscription(sub) {
  const prod = sub.productId || {};
  let customerName = 'Customer';
  let salespersonName = 'Unassigned';

  const cycleMap = {
    MONTHLY: 'Monthly',
    QUARTERLY: 'Quarterly',
    YEARLY: 'Yearly'
  };

  const statusMap = {
    ACTIVE: 'Active',
    PAUSED: 'Paused',
    CANCELLED: 'Cancelled'
  };

  const dateStr = sub.startDate ? new Date(sub.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Next Month';

  return {
    _id: sub._id,
    id: `SUB-${sub._id.toString().slice(-3).toUpperCase()}`,
    salesOrderId: sub.salesOrderId,
    customer: customerName,
    salesperson: salespersonName,
    plan: prod.name || 'Cloud Care Plan',
    cycle: cycleMap[sub.frequency] || 'Monthly',
    nextBill: statusMap[sub.status] === 'Cancelled' ? '-' : dateStr,
    status: statusMap[sub.status] || sub.status,
    amount: sub.amount || 499,
    startDate: sub.startDate,
    createdAt: sub.createdAt
  };
}

/**
 * GET /api/v1/subscriptions
 */
exports.getSubscriptions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && status !== 'all') {
      filter.status = status.toUpperCase();
    }

    if (req.user && ['salesperson', 'sales_manager'].includes(req.user.role)) {
      const assignedCustomers = await Customer.find({ salespersonId: req.user.id }, '_id');
      const myOrders = await SalesOrder.find({ customerId: { $in: assignedCustomers.map(customer => customer._id) } }, '_id');
      filter.salesOrderId = { $in: myOrders.map(o => o._id) };
    } else if (req.user && req.user.role === 'customer') {
      const myOrders = await SalesOrder.find({ customerId: req.user.customerId }, '_id');
      filter.salesOrderId = { $in: myOrders.map(o => o._id) };
    }

    const subscriptions = await Subscription.find(filter)
      .populate('productId')
      .populate({
        path: 'salesOrderId',
        populate: [{ path: 'customerId' }, { path: 'salespersonId' }]
      })
      .sort({ createdAt: -1 });

    const formatted = await Promise.all(
      subscriptions.map(async sub => {
        const item = formatSubscription(sub);
        if (sub.salesOrderId && sub.salesOrderId.customerId) {
          item.customer = sub.salesOrderId.customerId.name;
          item.salesperson = sub.salesOrderId.salespersonId?.name || 'Unassigned';
        } else if (sub.salesOrderId) {
          const order = await SalesOrder.findById(sub.salesOrderId).populate('customerId').populate('salespersonId');
          if (order && order.customerId) item.customer = order.customerId.name;
          if (order && order.salespersonId) item.salesperson = order.salespersonId.name;
        } else if (sub.quotationItemId) {
          const quote = await Quotation.findOne({ 'items._id': sub.quotationItemId }).populate('customerId');
          if (quote && quote.customerId) item.customer = quote.customerId.name;
        }
        return item;
      })
    );

    return ApiResponse.success(res, formatted);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/subscriptions/:id
 */
exports.getSubscriptionById = async (req, res, next) => {
  try {
    const sub = await Subscription.findById(req.params.id)
      .populate('productId')
      .populate({
        path: 'salesOrderId',
        populate: { path: 'customerId' }
      });
    if (!sub) return ApiResponse.notFound(res, 'Subscription not found');
    if (['salesperson', 'sales_manager'].includes(req.user?.role)) {
      const assigned = await Customer.exists({ _id: sub.salesOrderId?.customerId?._id, salespersonId: req.user.id });
      if (!assigned) return ApiResponse.forbidden(res, 'Access denied. This customer is not assigned to you.');
    }
    if (req.user?.role === 'customer' && (!sub.salesOrderId || sub.salesOrderId.customerId?._id?.toString() !== req.user.customerId)) {
      return ApiResponse.forbidden(res, 'Access denied. This subscription belongs to another customer.');
    }

    const formatted = formatSubscription(sub);
    if (sub.salesOrderId && sub.salesOrderId.customerId) {
      formatted.customer = sub.salesOrderId.customerId.name;
    } else if (sub.quotationItemId) {
      const quote = await Quotation.findOne({ 'items._id': sub.quotationItemId }).populate('customerId');
      if (quote && quote.customerId) formatted.customer = quote.customerId.name;
    }

    return ApiResponse.success(res, formatted);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/subscriptions/:id
 * Body: { status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' }
 */
exports.updateSubscription = async (req, res, next) => {
  try {
    const { status } = req.body;
    const sub = await Subscription.findById(req.params.id);
    if (!sub) return ApiResponse.notFound(res, 'Subscription not found');
    if (['salesperson', 'sales_manager'].includes(req.user?.role)) return ApiResponse.forbidden(res, 'This role has read-only subscription access');
    if (req.user?.role === 'customer') {
      const order = await SalesOrder.findById(sub.salesOrderId);
      if (!order || order.customerId.toString() !== req.user.customerId) return ApiResponse.forbidden(res, 'Access denied.');
    }

    if (status) sub.status = status.toUpperCase();
    await sub.save();

    return ApiResponse.success(res, formatSubscription(sub));
  } catch (err) {
    next(err);
  }
};
