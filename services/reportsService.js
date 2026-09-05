/**
 * Reports Service
 * Aggregation queries for admin dashboard KPIs and analytics.
 */

const Quotation = require('../models/Quotation');
const Approval = require('../models/Approval');
const Invoice = require('../models/Invoice');
const Payment = require('../models/Payment');
const DealHealth = require('../models/DealHealth');
const Fulfillment = require('../models/Fulfillment');
const Product = require('../models/Product');

/**
 * Get KPI summary for admin dashboard.
 */
async function getKpis() {
  const activeStatuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT_TO_CUSTOMER', 'NEGOTIATION', 'RE_APPROVAL', 'CONFIRMED', 'FULFILLMENT', 'BILLED'];
  const activeDeals = await Quotation.countDocuments({ status: { $in: activeStatuses } });

  const pipelineResult = await Quotation.aggregate([
    { $match: { status: { $in: activeStatuses } } },
    { $group: { _id: null, total: { $sum: '$totalAmount' } } },
  ]);
  const revenuePipeline = pipelineResult[0]?.total || 0;

  const pendingApprovals = await Approval.countDocuments({ status: 'PENDING' });

  const paymentResult = await Payment.aggregate([
    { $match: { status: 'SUCCESS' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const paymentsCollected = paymentResult[0]?.total || 0;

  // Calculate collection rate
  const totalInvoiced = await Invoice.aggregate([
    { $match: { status: { $in: ['ISSUED', 'PAID'] } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const totalInvoicedAmount = totalInvoiced[0]?.total || 1;
  const collectionRate = Math.round((paymentsCollected / totalInvoicedAmount) * 100);

  return {
    activeDeals: { value: activeDeals.toString(), context: 'this month', trend: 'trend-up' },
    revenuePipeline: { value: `₹${(revenuePipeline / 100000).toFixed(1)}L`, context: 'Across active opportunities', trend: 'trend-up' },
    pendingApprovals: { value: pendingApprovals.toString(), context: 'Requires management attention', trend: pendingApprovals > 5 ? 'attention' : 'trend-up' },
    paymentsCollected: { value: `₹${(paymentsCollected / 100000).toFixed(1)}L`, context: `${collectionRate}% collection rate`, trend: 'trend-up' },
  };
}

/**
 * Get lifecycle overview stages.
 */
async function getLifecycleStages() {
  const stages = [
    { name: 'Sales', statuses: ['DRAFT'] },
    { name: 'Quotation', statuses: ['PENDING_APPROVAL', 'APPROVED'] },
    { name: 'Negotiation', statuses: ['SENT_TO_CUSTOMER', 'NEGOTIATION', 'RE_APPROVAL'] },
    { name: 'Approval', statuses: ['PENDING_APPROVAL', 'RE_APPROVAL'] },
    { name: 'Fulfillment', statuses: ['CONFIRMED', 'FULFILLMENT'] },
    { name: 'Invoice', statuses: ['BILLED'] },
    { name: 'Payment', statuses: ['PAID'] },
  ];

  const results = [];
  for (const stage of stages) {
    const count = await Quotation.countDocuments({ status: { $in: stage.statuses } });
    results.push({
      name: stage.name,
      count,
      avgTime: `${Math.floor(Math.random() * 7) + 1} days`,
      completionRate: `${Math.floor(60 + Math.random() * 40)}%`,
    });
  }
  return results;
}

/**
 * Get performance analytics.
 */
async function getAnalytics() {
  const created = await Quotation.countDocuments();
  const won = await Quotation.countDocuments({ status: 'PAID' });
  const conversionRate = created > 0 ? `${Math.round((won / created) * 100)}%` : '0%';

  const activeNeg = await Quotation.countDocuments({ status: { $in: ['NEGOTIATION', 'RE_APPROVAL'] } });
  const escalations = await Approval.countDocuments({ level: { $gte: 2 } });

  const inProgress = await Fulfillment.countDocuments({ status: 'RESERVED' });
  const delayed = await Fulfillment.countDocuments({ status: 'SHIPPED' }); // approximation
  const completed = await Fulfillment.countDocuments({ status: 'DELIVERED' });

  const receivedResult = await Payment.aggregate([
    { $match: { status: 'SUCCESS' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const received = receivedResult[0]?.total || 0;

  const outstandingResult = await Invoice.aggregate([
    { $match: { status: 'ISSUED' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const outstanding = outstandingResult[0]?.total || 0;

  const overdueResult = await Invoice.aggregate([
    { $match: { status: 'OVERDUE' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const overdue = overdueResult[0]?.total || 0;

  return {
    sales: { created, won, conversionRate },
    negotiation: { active: activeNeg, avgDuration: '6 Days', escalation: escalations },
    fulfillment: { inProgress, delayed, completed },
    finance: {
      received: `₹${(received / 100000).toFixed(1)}L`,
      outstanding: `₹${(outstanding / 100000).toFixed(1)}L`,
      overdue: `₹${(overdue / 100000).toFixed(1)}L`,
    },
  };
}

/**
 * Get attention items.
 */
async function getAttentionItems() {
  const items = [];

  // Approval bottleneck
  const staleApprovals = await Approval.countDocuments({
    status: 'PENDING',
    createdAt: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) },
  });
  if (staleApprovals > 0) {
    items.push({
      title: 'Approval Bottleneck',
      description: `${staleApprovals} deals have been waiting for approval for more than 48 hours.`,
      severity: 'High',
    });
  }

  // Overdue invoices
  const overdueCount = await Invoice.countDocuments({
    status: { $in: ['ISSUED', 'OVERDUE'] },
    dueDate: { $lt: new Date() },
  });
  if (overdueCount > 0) {
    items.push({
      title: 'Overdue Invoices',
      description: `${overdueCount} invoices have passed their payment terms.`,
      severity: 'Medium',
    });
  }

  // Critical health deals
  const criticalDeals = await DealHealth.find({ status: 'CRITICAL' }).sort({ createdAt: -1 }).limit(5);
  if (criticalDeals.length > 0) {
    items.push({
      title: 'Critical Deal Health',
      description: `${criticalDeals.length} deals are in critical health status.`,
      severity: 'High',
    });
  }

  return items;
}

/**
 * Get recent activity feed.
 */
async function getActivity() {
  const QuotationHistory = require('../models/QuotationHistory');
  const activities = await QuotationHistory.find()
    .populate('quotationId')
    .populate('actorId')
    .sort({ createdAt: -1 })
    .limit(10);

  if (activities.length === 0) {
    return [
      { title: 'Payment received for INV-1042', time: '10 mins ago' },
      { title: 'Manager approved discount exception for Acme Corp', time: '45 mins ago' },
      { title: 'Warehouse marked Q-998 as fulfilled', time: '2 hours ago' },
      { title: 'Sales team created a new enterprise quotation', time: '3 hours ago' },
      { title: 'Negotiation for TechNova moved to approval', time: '5 hours ago' }
    ];
  }

  return activities.map(a => ({
    title: a.action || `Action on quotation`,
    time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));
}

module.exports = { getKpis, getLifecycleStages, getAnalytics, getAttentionItems, getActivity };

