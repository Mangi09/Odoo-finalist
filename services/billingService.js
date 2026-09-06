/**
 * Billing Service
 * Splits confirmed sales order items into one-time invoices and recurring subscriptions.
 */

const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const Product = require('../models/Product');
const logger = require('../utils/logger');

/**
 * Generate invoices and subscriptions from a confirmed sales order.
 * @param {Object} salesOrder - SalesOrder with items
 * @returns {Promise<{ invoices: Array, subscriptions: Array }>}
 */
async function generateBilling(salesOrder) {
  const invoices = [];
  const subscriptions = [];

  let oneTimeTotal = 0;
  let hasOneTimeItems = false;
  const subtotalAmount = salesOrder.subtotalAmount || salesOrder.items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0);
  const discountFactor = subtotalAmount > 0 ? (Number(salesOrder.totalAmount || subtotalAmount) / subtotalAmount) : 1;
  const applyGlobalDiscount = (amount) => Math.round(Number(amount || 0) * discountFactor);

  for (const item of salesOrder.items) {
    const product = await Product.findById(item.productId);
    const billingType = item.billingType || (product ? product.billingType : 'ONE_TIME');

    if (billingType === 'ONE_TIME') {
      oneTimeTotal += applyGlobalDiscount(item.lineTotal);
      hasOneTimeItems = true;
    } else if (billingType === 'RECURRING') {
      const frequency = product ? (product.frequency || 'MONTHLY') : 'MONTHLY';
      const recurringAmount = applyGlobalDiscount(item.lineTotal);

      const sub = await Subscription.create({
        salesOrderId: salesOrder._id,
        salesOrderItemId: item._id || item.quotationItemId,
        productId: item.productId,
        frequency,
        amount: recurringAmount,
        startDate: new Date(),
        status: 'ACTIVE',
      });
      subscriptions.push(sub);
      logger.info(`Subscription created: ${product ? product.name : item.productId} — ${frequency} — ₹${recurringAmount}`);

      // Also create first recurring invoice
      const recurringInvoice = await Invoice.create({
        salesOrderId: salesOrder._id,
        type: 'RECURRING',
        amount: recurringAmount,
        status: 'ISSUED',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Net 30
      });
      invoices.push(recurringInvoice);
    }
  }

  // Create one-time invoice for all hardware/service items
  if (hasOneTimeItems && oneTimeTotal > 0) {
    const invoice = await Invoice.create({
      salesOrderId: salesOrder._id,
      type: 'ONE_TIME',
      amount: oneTimeTotal,
      status: 'ISSUED',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Net 30
    });
    invoices.push(invoice);
    logger.info(`One-time invoice created for SalesOrder ${salesOrder.orderNumber}: ₹${oneTimeTotal}`);
  }

  return { invoices, subscriptions };
}

module.exports = { generateBilling };
