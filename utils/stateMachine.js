/**
 * Quotation & SalesOrder State Machines
 * Validates allowed status transitions and logs history.
 */

const QuotationHistory = require('../models/QuotationHistory');
const SalesOrderHistory = require('../models/SalesOrderHistory');

// Allowed Quotation transitions: { fromStatus: [toStatuses] }
// Quotations end at ACCEPTED (or REJECTED/CANCELLED).
const TRANSITIONS = {
  DRAFT:             ['PENDING_APPROVAL', 'APPROVED', 'SENT_TO_CUSTOMER', 'CANCELLED'],
  PENDING_APPROVAL:  ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED:          ['SENT_TO_CUSTOMER', 'ACCEPTED', 'CANCELLED'],
  SENT_TO_CUSTOMER:  ['NEGOTIATION', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
  NEGOTIATION:       ['RE_APPROVAL', 'ACCEPTED', 'REJECTED', 'CANCELLED'],
  RE_APPROVAL:       ['APPROVED', 'REJECTED', 'CANCELLED'],
  ACCEPTED:          [],         // terminal stage for Quotation
  REJECTED:          ['DRAFT'],  // allow re-drafting
  CANCELLED:         ['DRAFT'],  // allow re-drafting
};

// Allowed SalesOrder transitions:
const SALES_ORDER_TRANSITIONS = {
  CONFIRMED:           ['IN_FULFILLMENT', 'CANCELLED'],
  IN_FULFILLMENT:      ['PARTIALLY_FULFILLED', 'BILLED', 'CANCELLED'],
  PARTIALLY_FULFILLED: ['IN_FULFILLMENT', 'BILLED', 'CANCELLED'],
  BILLED:              ['PAID', 'CANCELLED'],
  PAID:                ['CLOSED', 'CANCELLED'],
  CLOSED:              [],   // terminal
  CANCELLED:           [],   // terminal
};

/**
 * Validate whether a transition from currentStatus to newStatus is allowed for Quotation.
 * @param {string} currentStatus
 * @param {string} newStatus
 * @returns {{ valid: boolean, error?: string }}
 */
function validateTransition(currentStatus, newStatus) {
  // Support legacy CONFIRMED status string by mapping to ACCEPTED
  if (newStatus === 'CONFIRMED') newStatus = 'ACCEPTED';
  if (currentStatus === 'CONFIRMED') currentStatus = 'ACCEPTED';

  const allowed = TRANSITIONS[currentStatus];
  if (!allowed) {
    return { valid: false, error: `Unknown current quotation status: ${currentStatus}` };
  }
  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      error: `Transition from ${currentStatus} to ${newStatus} is not allowed. Allowed: [${allowed.join(', ')}]`,
    };
  }
  return { valid: true };
}

/**
 * Validate whether a transition from currentStatus to newStatus is allowed for SalesOrder.
 * @param {string} currentStatus
 * @param {string} newStatus
 * @returns {{ valid: boolean, error?: string }}
 */
function validateSalesOrderTransition(currentStatus, newStatus) {
  const allowed = SALES_ORDER_TRANSITIONS[currentStatus];
  if (!allowed) {
    return { valid: false, error: `Unknown current sales order status: ${currentStatus}` };
  }
  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      error: `Transition from ${currentStatus} to ${newStatus} is not allowed for SalesOrder. Allowed: [${allowed.join(', ')}]`,
    };
  }
  return { valid: true };
}

/**
 * Transition a quotation's status, validate it, save it, and log history.
 * @param {Object} quotation - Mongoose Quotation document
 * @param {string} newStatus - The target status
 * @param {string} actorId - User ID performing the action
 * @param {string} action - Description of the action (e.g. "Approved by manager")
 * @returns {Promise<Object>} - The updated quotation
 */
async function transitionStatus(quotation, newStatus, actorId, action) {
  if (newStatus === 'CONFIRMED') newStatus = 'ACCEPTED';
  const oldStatus = quotation.status;
  const result = validateTransition(oldStatus, newStatus);
  if (!result.valid) {
    const err = new Error(result.error);
    err.statusCode = 400;
    throw err;
  }

  quotation.status = newStatus;
  await quotation.save();

  // Append-only audit log
  await QuotationHistory.create({
    quotationId: quotation._id,
    actorId,
    action: action || `Status updated to ${newStatus}`,
    oldValue: oldStatus,
    newValue: newStatus,
  });

  return quotation;
}

/**
 * Transition a SalesOrder's status, validate it, save it, and log history.
 * @param {Object} salesOrder - Mongoose SalesOrder document
 * @param {string} newStatus - The target status
 * @param {string} actorId - User ID performing the action
 * @param {string} action - Description of the action
 * @returns {Promise<Object>} - The updated sales order
 */
async function transitionSalesOrderStatus(salesOrder, newStatus, actorId, action) {
  const oldStatus = salesOrder.status;
  const result = validateSalesOrderTransition(oldStatus, newStatus);
  if (!result.valid) {
    const err = new Error(result.error);
    err.statusCode = 400;
    throw err;
  }

  salesOrder.status = newStatus;
  await salesOrder.save();

  // Append-only audit log
  await SalesOrderHistory.create({
    salesOrderId: salesOrder._id,
    actorId,
    action: action || `SalesOrder status updated to ${newStatus}`,
    oldValue: oldStatus,
    newValue: newStatus,
  });

  return salesOrder;
}

module.exports = {
  TRANSITIONS,
  SALES_ORDER_TRANSITIONS,
  validateTransition,
  validateSalesOrderTransition,
  transitionStatus,
  transitionSalesOrderStatus,
};
