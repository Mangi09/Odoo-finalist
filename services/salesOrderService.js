/**
 * Sales Order Service
 * Handles creation and lifecycle management of immutable SalesOrders.
 */

const SalesOrder = require('../models/SalesOrder');
const SalesOrderHistory = require('../models/SalesOrderHistory');
const Quotation = require('../models/Quotation');
const Product = require('../models/Product');
const { transitionStatus, transitionSalesOrderStatus } = require('../utils/stateMachine');
const { allocateForSalesOrder } = require('./warehouseAllocator');
const { generateBilling } = require('./billingService');
const { recalculateSalesOrder } = require('./dealHealthService');
const logger = require('../utils/logger');

/**
 * Generate a unique Order Number (e.g., SO-2026-8942)
 */
async function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-4);
  const randomStr = Math.floor(1000 + Math.random() * 9000);
  const orderNumber = `SO-${new Date().getFullYear()}-${timestamp}${randomStr}`;
  
  // Ensure uniqueness
  const exists = await SalesOrder.findOne({ orderNumber });
  if (exists) {
    return generateOrderNumber();
  }
  return orderNumber;
}

/**
 * Create an immutable SalesOrder snapshot from an accepted Quotation.
 * @param {string|Object} quotationInput - Quotation ID or document
 * @param {string} actorId - User or customer performing acceptance
 * @returns {Promise<Object>} - Newly created SalesOrder
 */
async function createSalesOrderFromQuotation(quotationInput, actorId) {
  let quotation;
  if (typeof quotationInput === 'string' || quotationInput instanceof String) {
    quotation = await Quotation.findById(quotationInput).populate('items.productId');
  } else {
    quotation = quotationInput;
    if (quotation.items && quotation.items.length > 0 && !quotation.items[0].productId.billingType) {
      quotation = await Quotation.findById(quotation._id).populate('items.productId');
    }
  }

  if (!quotation) {
    throw new Error('Quotation not found');
  }

  // Check if SalesOrder already exists for this quotation
  const existingOrder = await SalesOrder.findOne({ quotationId: quotation._id });
  if (existingOrder) {
    return existingOrder;
  }

  // Ensure quotation status is ACCEPTED
  if (quotation.status !== 'ACCEPTED') {
    const finalActorId = actorId || quotation.customerId || quotation.salespersonId;
    await transitionStatus(quotation, 'ACCEPTED', finalActorId, 'Quotation accepted — converting to SalesOrder');
  }

  // Build frozen snapshot of items with billingType
  const frozenItems = [];
  for (const item of quotation.items) {
    let billingType = 'ONE_TIME';
    if (item.productId && item.productId.billingType) {
      billingType = item.productId.billingType;
    } else if (item.productId) {
      const prod = await Product.findById(item.productId);
      if (prod && prod.billingType) {
        billingType = prod.billingType;
      }
    }

    frozenItems.push({
      quotationItemId: item._id,
      productId: item.productId._id || item.productId,
      qty: item.qty,
      unitPrice: item.unitPrice,
      discountPercent: item.discountPercent || 0,
      lineTotal: item.lineTotal,
      lineMargin: item.lineMargin || 0,
      billingType,
      isRecommendation: item.isRecommendation || false,
    });
  }

  const orderNumber = await generateOrderNumber();
  const finalActorId = actorId || quotation.salespersonId || quotation.customerId;

  const salesOrder = await SalesOrder.create({
    orderNumber,
    quotationId: quotation._id,
    customerId: quotation.customerId._id || quotation.customerId,
    salespersonId: quotation.salespersonId._id || quotation.salespersonId,
    items: frozenItems,
    subtotalAmount: quotation.subtotalAmount || frozenItems.reduce((sum, item) => sum + (item.lineTotal || 0), 0),
    globalDiscountPercent: quotation.globalDiscountPercent || 0,
    globalDiscountAmount: quotation.globalDiscountAmount || 0,
    totalAmount: quotation.totalAmount,
    totalMargin: quotation.totalMargin,
    status: 'CONFIRMED',
    confirmedAt: new Date(),
  });

  // Record audit history
  await SalesOrderHistory.create({
    salesOrderId: salesOrder._id,
    actorId: finalActorId,
    action: 'Sales Order created from accepted quotation',
    oldValue: null,
    newValue: 'CONFIRMED',
  });

  logger.info(`SalesOrder created: ${salesOrder.orderNumber} for Quotation ${quotation._id}`);

  // Trigger warehouse inventory allocation
  const allocation = await allocateForSalesOrder(salesOrder);

  // Trigger billing generation (invoices & subscriptions)
  const billing = await generateBilling(salesOrder);

  // Advance SalesOrder status based on allocation / billing results
  if (allocation.fulfillments.length > 0) {
    await transitionSalesOrderStatus(salesOrder, 'IN_FULFILLMENT', finalActorId, 'Inventory allocated — order entered fulfillment');
  } else if (billing.invoices.length > 0) {
    await transitionSalesOrderStatus(salesOrder, 'BILLED', finalActorId, 'Invoices generated — order billed');
  }

  // Track post-acceptance deal health
  await recalculateSalesOrder(salesOrder._id);

  return salesOrder;
}

module.exports = {
  createSalesOrderFromQuotation,
  generateOrderNumber,
};
