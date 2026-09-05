const Subscription = require('../models/Subscription');
const Quotation = require('../models/Quotation');
const Product = require('../models/Product');
const ApiResponse = require('../utils/apiResponse');

function formatSubscription(sub) {
  const prod = sub.productId || {};
  let customerName = 'Customer';
  if (sub.quotationItemId) {
    // If quotation populated
  }

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
    customer: customerName,
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

    const subscriptions = await Subscription.find(filter)
      .populate('productId')
      .sort({ createdAt: -1 });

    // Populate customer names via quotation item
    const formatted = await Promise.all(
      subscriptions.map(async sub => {
        const item = formatSubscription(sub);
        // Find corresponding quotation
        const quote = await Quotation.findOne({ 'items._id': sub.quotationItemId }).populate('customerId');
        if (quote && quote.customerId) {
          item.customer = quote.customerId.name;
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
    const sub = await Subscription.findById(req.params.id).populate('productId');
    if (!sub) return ApiResponse.notFound(res, 'Subscription not found');

    const formatted = formatSubscription(sub);
    const quote = await Quotation.findOne({ 'items._id': sub.quotationItemId }).populate('customerId');
    if (quote && quote.customerId) {
      formatted.customer = quote.customerId.name;
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

    if (status) sub.status = status.toUpperCase();
    await sub.save();

    return ApiResponse.success(res, formatSubscription(sub));
  } catch (err) {
    next(err);
  }
};
