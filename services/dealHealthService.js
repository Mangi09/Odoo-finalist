/**
 * Deal Health Service
 * Recalculates health scores based on key events.
 * Score: 0-100. HEALTHY (>70), AT_RISK (40-70), CRITICAL (<40).
 * Supports pre-acceptance (Quotation) and post-acceptance (SalesOrder) risk evaluation.
 */

const DealHealth = require('../models/DealHealth');
const Approval = require('../models/Approval');
const Negotiation = require('../models/Negotiation');
const Backorder = require('../models/Backorder');
const Invoice = require('../models/Invoice');
const Quotation = require('../models/Quotation');
const SalesOrder = require('../models/SalesOrder');
const logger = require('../utils/logger');

/**
 * Calculate health score for a quotation (pre-acceptance).
 * @param {ObjectId} quotationId
 * @returns {Promise<Object>} - DealHealth document
 */
async function recalculate(quotationId) {
  const quotation = await Quotation.findById(quotationId);
  if (!quotation) return null;

  let score = 100;
  const riskFactors = [];

  // Factor 1: Pending approvals (-15 each)
  const pendingApprovals = await Approval.countDocuments({ quotationId, status: 'PENDING' });
  if (pendingApprovals > 0) {
    score -= pendingApprovals * 15;
    riskFactors.push(`${pendingApprovals} pending approval(s)`);
  }

  // Factor 2: Rejected approvals (-25 each)
  const rejectedApprovals = await Approval.countDocuments({ quotationId, status: 'REJECTED' });
  if (rejectedApprovals > 0) {
    score -= rejectedApprovals * 25;
    riskFactors.push(`${rejectedApprovals} rejected approval(s)`);
  }

  // Factor 3: Active negotiations (-10 each)
  const activeNegotiations = await Negotiation.countDocuments({ quotationId, status: 'PENDING' });
  if (activeNegotiations > 0) {
    score -= activeNegotiations * 10;
    riskFactors.push(`${activeNegotiations} active negotiation(s)`);
  }

  // Factor 4: Inactivity (days since last update)
  const daysSinceUpdate = Math.floor((Date.now() - new Date(quotation.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceUpdate > 14) {
    score -= 30;
    riskFactors.push(`Inactive for ${daysSinceUpdate} days`);
  } else if (daysSinceUpdate > 7) {
    score -= 15;
    riskFactors.push(`Inactive for ${daysSinceUpdate} days`);
  } else if (daysSinceUpdate > 3) {
    score -= 5;
    riskFactors.push(`Inactive for ${daysSinceUpdate} days`);
  }

  // Factor 5: High discount requests (-5 per item with >15% discount)
  const highDiscountItems = quotation.items.filter(i => i.discountPercent > 15).length;
  if (highDiscountItems > 0) {
    score -= highDiscountItems * 5;
    riskFactors.push(`${highDiscountItems} item(s) with >15% discount`);
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  let status;
  if (score > 70) status = 'HEALTHY';
  else if (score >= 40) status = 'AT_RISK';
  else status = 'CRITICAL';

  // Append-only: create record
  const healthDoc = await DealHealth.create({
    quotationId,
    score,
    status,
    riskFactors,
  });

  logger.info(`DealHealth recalculated: Quotation ${quotationId} — score ${score} (${status})`);
  return healthDoc;
}

/**
 * Calculate health score for a SalesOrder (post-acceptance).
 * @param {ObjectId} salesOrderId
 * @returns {Promise<Object>} - DealHealth document
 */
async function recalculateSalesOrder(salesOrderId) {
  const salesOrder = await SalesOrder.findById(salesOrderId);
  if (!salesOrder) return null;

  let score = 100;
  const riskFactors = [];

  // Factor 1: Pending Backorders (-15 each)
  const pendingBackorders = await Backorder.countDocuments({ salesOrderId, status: 'PENDING' });
  if (pendingBackorders > 0) {
    score -= pendingBackorders * 15;
    riskFactors.push(`${pendingBackorders} pending backorder(s)`);
  }

  // Factor 2: Overdue Invoices (-25 each)
  const overdueInvoices = await Invoice.countDocuments({ salesOrderId, status: 'OVERDUE' });
  if (overdueInvoices > 0) {
    score -= overdueInvoices * 25;
    riskFactors.push(`${overdueInvoices} overdue invoice(s)`);
  }

  // Factor 3: High Discount Items (-5 per item > 15%)
  const highDiscountItems = salesOrder.items.filter(i => i.discountPercent > 15).length;
  if (highDiscountItems > 0) {
    score -= highDiscountItems * 5;
    riskFactors.push(`${highDiscountItems} item(s) with >15% discount`);
  }

  // Factor 4: Days since confirmed / updated
  const daysSinceUpdate = Math.floor((Date.now() - new Date(salesOrder.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
  if (daysSinceUpdate > 14) {
    score -= 20;
    riskFactors.push(`In fulfillment/billing for ${daysSinceUpdate} days`);
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  let status;
  if (score > 70) status = 'HEALTHY';
  else if (score >= 40) status = 'AT_RISK';
  else status = 'CRITICAL';

  const healthDoc = await DealHealth.create({
    salesOrderId,
    score,
    status,
    riskFactors,
  });

  logger.info(`DealHealth recalculated: SalesOrder ${salesOrder.orderNumber} — score ${score} (${status})`);
  return healthDoc;
}

module.exports = { recalculate, recalculateSalesOrder };
