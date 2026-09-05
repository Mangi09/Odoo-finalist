/**
 * Billing Service
 * Splits confirmed quotation items into one-time invoices and recurring subscriptions.
 */

const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const Product = require('../models/Product');
const logger = require('../utils/logger');

/**
 * Generate invoices and subscriptions from a confirmed quotation.
 * @param {Object} quotation - Quotation with items populated
 * @returns {Promise<{ invoices: Array, subscriptions: Array }>}
 */
async function generateBilling(quotation) {
  const invoices = [];
  const subscriptions = [];

  let oneTimeTotal = 0;
  let hasOneTimeItems = false;

  for (const item of quotation.items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    if (product.billingType === 'ONE_TIME') {
      oneTimeTotal += item.lineTotal;
      hasOneTimeItems = true;
    } else if (product.billingType === 'RECURRING') {
      const sub = await Subscription.create({
        quotationItemId: item._id,
        productId: item.productId,
        frequency: product.frequency || 'MONTHLY',
        amount: item.lineTotal,
        startDate: new Date(),
        status: 'ACTIVE',
      });
      subscriptions.push(sub);
      logger.info(`Subscription created: ${product.name} — ${product.frequency} — ₹${item.lineTotal}`);

      // Also create first recurring invoice
      const recurringInvoice = await Invoice.create({
        quotationId: quotation._id,
        type: 'RECURRING',
        amount: item.lineTotal,
        status: 'ISSUED',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Net 30
      });
      invoices.push(recurringInvoice);
    }
  }

  // Create one-time invoice for all hardware/service items
  if (hasOneTimeItems) {
    const invoice = await Invoice.create({
      quotationId: quotation._id,
      type: 'ONE_TIME',
      amount: oneTimeTotal,
      status: 'ISSUED',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Net 30
    });
    invoices.push(invoice);
    logger.info(`One-time invoice created: ₹${oneTimeTotal}`);
  }

  return { invoices, subscriptions };
}

module.exports = { generateBilling };
