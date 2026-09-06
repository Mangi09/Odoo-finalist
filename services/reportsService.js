/**
 * Reports Service
 * Aggregation queries for dashboard KPIs and analytics.
 */

const Quotation = require('../models/Quotation');
const SalesOrder = require('../models/SalesOrder');
const Approval = require('../models/Approval');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const DealHealth = require('../models/DealHealth');
const Fulfillment = require('../models/Fulfillment');

const activeQuoteStatuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT_TO_CUSTOMER', 'NEGOTIATION', 'RE_APPROVAL', 'ACCEPTED'];
const activeSoStatuses = ['CONFIRMED', 'IN_FULFILLMENT', 'PARTIALLY_FULFILLED', 'BILLED'];

function customerFilter(customerIds) {
  return Array.isArray(customerIds) ? { customerId: { $in: customerIds } } : {};
}

async function scopedIds(customerIds) {
  const quoteFilter = customerFilter(customerIds);
  const orderFilter = customerFilter(customerIds);
  const [quotes, orders] = await Promise.all([
    Quotation.find(quoteFilter, '_id'),
    SalesOrder.find(orderFilter, '_id')
  ]);
  return {
    quoteIds: quotes.map(q => q._id),
    orderIds: orders.map(o => o._id)
  };
}

async function scopedInvoiceIds(orderIds) {
  const invoices = await Invoice.find({ salesOrderId: { $in: orderIds } }, '_id');
  return invoices.map(invoice => invoice._id);
}

async function sumField(model, match, field) {
  const result = await model.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: field } } }
  ]);
  return result[0]?.total || 0;
}

async function averageAgeDays(model, match) {
  const docs = await model.find(match, 'createdAt');
  if (!docs.length) return '0 days';
  const totalDays = docs.reduce((sum, doc) => {
    return sum + Math.max(0, Date.now() - new Date(doc.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  }, 0);
  return `${Math.max(1, Math.round(totalDays / docs.length))} days`;
}

function completionRate(count, total) {
  return total > 0 ? `${Math.round((count / total) * 100)}%` : '0%';
}

/**
 * Get KPI summary.
 */
async function getKpis(customerIds = null) {
  const quoteFilter = customerFilter(customerIds);
  const orderFilter = customerFilter(customerIds);
  const { quoteIds, orderIds } = await scopedIds(customerIds);
  const invoiceIds = await scopedInvoiceIds(orderIds);

  const activeQuoteCount = await Quotation.countDocuments({ ...quoteFilter, status: { $in: activeQuoteStatuses } });
  const activeSoCount = await SalesOrder.countDocuments({ ...orderFilter, status: { $in: activeSoStatuses } });
  const activeDeals = activeQuoteCount + activeSoCount;

  const quotePipeline = await sumField(Quotation, { ...quoteFilter, status: { $in: activeQuoteStatuses } }, '$totalAmount');
  const soPipeline = await sumField(SalesOrder, { ...orderFilter, status: { $in: activeSoStatuses } }, '$totalAmount');
  const revenuePipeline = quotePipeline + soPipeline;

  const pendingApprovals = await Approval.countDocuments({
    status: 'PENDING',
    quotationId: { $in: quoteIds }
  });

  const paymentsCollected = await sumField(Payment, {
    status: 'SUCCESS',
    invoiceId: { $in: invoiceIds }
  }, '$amount');

  const totalInvoicedAmount = await sumField(Invoice, {
    salesOrderId: { $in: orderIds },
    status: { $in: ['ISSUED', 'PAID'] }
  }, '$amount');
  const collectionRate = totalInvoicedAmount > 0 ? Math.round((paymentsCollected / totalInvoicedAmount) * 100) : 0;

  return {
    activeDeals: { value: activeDeals.toString(), context: 'assigned customers', trend: 'trend-up' },
    revenuePipeline: { value: `₹${(revenuePipeline / 100000).toFixed(1)}L`, context: 'Across active opportunities', trend: 'trend-up' },
    pendingApprovals: { value: pendingApprovals.toString(), context: 'Requires management attention', trend: pendingApprovals > 5 ? 'attention' : 'trend-up' },
    paymentsCollected: { value: `₹${(paymentsCollected / 100000).toFixed(1)}L`, context: `${collectionRate}% collection rate`, trend: 'trend-up' }
  };
}

/**
 * Get lifecycle overview stages.
 */
async function getLifecycleStages(customerIds = null) {
  const quoteFilter = customerFilter(customerIds);
  const orderFilter = customerFilter(customerIds);
  const { quoteIds } = await scopedIds(customerIds);

  const stages = [
    { name: 'Sales', count: await Quotation.countDocuments({ ...quoteFilter, status: 'DRAFT' }), model: Quotation, filter: { ...quoteFilter, status: 'DRAFT' } },
    { name: 'Quotation', count: await Quotation.countDocuments({ ...quoteFilter, status: { $in: ['PENDING_APPROVAL', 'APPROVED'] } }), model: Quotation, filter: { ...quoteFilter, status: { $in: ['PENDING_APPROVAL', 'APPROVED'] } } },
    { name: 'Negotiation', count: await Quotation.countDocuments({ ...quoteFilter, status: { $in: ['SENT_TO_CUSTOMER', 'NEGOTIATION', 'RE_APPROVAL'] } }), model: Quotation, filter: { ...quoteFilter, status: { $in: ['SENT_TO_CUSTOMER', 'NEGOTIATION', 'RE_APPROVAL'] } } },
    { name: 'Approval', count: await Approval.countDocuments({ status: 'PENDING', quotationId: { $in: quoteIds } }), model: Approval, filter: { status: 'PENDING', quotationId: { $in: quoteIds } } },
    { name: 'Fulfillment', count: await SalesOrder.countDocuments({ ...orderFilter, status: { $in: ['CONFIRMED', 'IN_FULFILLMENT', 'PARTIALLY_FULFILLED'] } }), model: SalesOrder, filter: { ...orderFilter, status: { $in: ['CONFIRMED', 'IN_FULFILLMENT', 'PARTIALLY_FULFILLED'] } } },
    { name: 'Invoice', count: await SalesOrder.countDocuments({ ...orderFilter, status: 'BILLED' }), model: SalesOrder, filter: { ...orderFilter, status: 'BILLED' } },
    { name: 'Payment', count: await SalesOrder.countDocuments({ ...orderFilter, status: 'PAID' }), model: SalesOrder, filter: { ...orderFilter, status: 'PAID' } }
  ];

  const total = stages.reduce((sum, stage) => sum + stage.count, 0);
  return Promise.all(stages.map(async stage => ({
    name: stage.name,
    count: stage.count,
    avgTime: await averageAgeDays(stage.model, stage.filter),
    completionRate: completionRate(stage.count, total)
  })));
}

/**
 * Get performance analytics.
 */
async function getAnalytics(customerIds = null) {
  const quoteFilter = customerFilter(customerIds);
  const orderFilter = customerFilter(customerIds);
  const { quoteIds, orderIds } = await scopedIds(customerIds);
  const invoiceIds = await scopedInvoiceIds(orderIds);

  const created = await Quotation.countDocuments(quoteFilter);
  const won = await SalesOrder.countDocuments({ ...orderFilter, status: 'PAID' });
  const conversionRate = created > 0 ? `${Math.round((won / created) * 100)}%` : '0%';

  const activeNeg = await Quotation.countDocuments({ ...quoteFilter, status: { $in: ['NEGOTIATION', 'RE_APPROVAL'] } });
  const escalations = await Approval.countDocuments({ level: { $gte: 2 }, quotationId: { $in: quoteIds } });

  const inProgress = await Fulfillment.countDocuments({ salesOrderId: { $in: orderIds }, status: 'RESERVED' });
  const delayed = await Fulfillment.countDocuments({ salesOrderId: { $in: orderIds }, status: 'SHIPPED' });
  const completed = await Fulfillment.countDocuments({ salesOrderId: { $in: orderIds }, status: 'DELIVERED' });

  const received = await sumField(Payment, { status: 'SUCCESS', invoiceId: { $in: invoiceIds } }, '$amount');
  const outstanding = await sumField(Invoice, { salesOrderId: { $in: orderIds }, status: 'ISSUED' }, '$amount');
  const overdue = await sumField(Invoice, { salesOrderId: { $in: orderIds }, status: 'OVERDUE' }, '$amount');

  return {
    sales: { created, won, conversionRate },
    negotiation: { active: activeNeg, avgDuration: await averageAgeDays(Quotation, { ...quoteFilter, status: { $in: ['NEGOTIATION', 'RE_APPROVAL'] } }), escalation: escalations },
    fulfillment: { inProgress, delayed, completed },
    finance: {
      received: `₹${(received / 100000).toFixed(1)}L`,
      outstanding: `₹${(outstanding / 100000).toFixed(1)}L`,
      overdue: `₹${(overdue / 100000).toFixed(1)}L`
    }
  };
}

/**
 * Get attention items.
 */
async function getAttentionItems(customerIds = null) {
  const items = [];
  const { quoteIds, orderIds } = await scopedIds(customerIds);

  const staleApprovals = await Approval.countDocuments({
    status: 'PENDING',
    quotationId: { $in: quoteIds },
    createdAt: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) }
  });
  if (staleApprovals > 0) {
    items.push({
      type: 'Approval Bottleneck',
      deal: `${staleApprovals} approvals`,
      detail: `${staleApprovals} deals have been waiting for approval for more than 48 hours.`,
      severity: 'High'
    });
  }

  const overdueCount = await Invoice.countDocuments({
    salesOrderId: { $in: orderIds },
    status: { $in: ['ISSUED', 'OVERDUE'] },
    dueDate: { $lt: new Date() }
  });
  if (overdueCount > 0) {
    items.push({
      type: 'Overdue Invoice',
      deal: `${overdueCount} invoices`,
      detail: `${overdueCount} invoices have passed their payment terms.`,
      severity: 'Medium'
    });
  }

  const criticalDeals = await DealHealth.countDocuments({
    status: 'CRITICAL',
    $or: [
      { quotationId: { $in: quoteIds } },
      { salesOrderId: { $in: orderIds } }
    ]
  });
  if (criticalDeals > 0) {
    items.push({
      type: 'Critical Deal Health',
      deal: `${criticalDeals} deals`,
      detail: `${criticalDeals} deals are in critical health status.`,
      severity: 'High'
    });
  }

  return items;
}

/**
 * Get recent activity feed.
 */
async function getActivity(customerIds = null) {
  const QuotationHistory = require('../models/QuotationHistory');
  const SalesOrderHistory = require('../models/SalesOrderHistory');
  const { quoteIds, orderIds } = await scopedIds(customerIds);

  const qActivities = await QuotationHistory.find({ quotationId: { $in: quoteIds } })
    .populate('actorId')
    .sort({ createdAt: -1 })
    .limit(5);

  const soActivities = await SalesOrderHistory.find({ salesOrderId: { $in: orderIds } })
    .populate('actorId')
    .sort({ createdAt: -1 })
    .limit(5);

  const combined = [...qActivities, ...soActivities]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 10);

  return combined.map(a => ({
    title: a.action || 'Action recorded',
    time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));
}

module.exports = { getKpis, getLifecycleStages, getAnalytics, getAttentionItems, getActivity };
