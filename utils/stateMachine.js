/**
 * Quotation State Machine
 * Validates allowed status transitions and logs history.
 * ALL status changes MUST go through this module.
 */

const QuotationHistory = require('../models/QuotationHistory');

// Allowed transitions: { fromStatus: [toStatuses] }
const TRANSITIONS = {
  DRAFT:             ['PENDING_APPROVAL', 'APPROVED', 'CANCELLED'],
  PENDING_APPROVAL:  ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED:          ['SENT_TO_CUSTOMER', 'CANCELLED'],
  SENT_TO_CUSTOMER:  ['NEGOTIATION', 'CONFIRMED', 'CANCELLED'],
  NEGOTIATION:       ['RE_APPROVAL', 'CONFIRMED', 'CANCELLED'],
  RE_APPROVAL:       ['APPROVED', 'REJECTED', 'CANCELLED'],
  CONFIRMED:         ['FULFILLMENT', 'CANCELLED'],
  FULFILLMENT:       ['BILLED', 'CANCELLED'],
  BILLED:            ['PAID', 'CANCELLED'],
  PAID:              [],   // terminal
  REJECTED:          ['DRAFT'],  // allow re-drafting
  CANCELLED:         ['DRAFT'],  // allow re-drafting
};

/**
 * Validate whether a transition from currentStatus to newStatus is allowed.
 * @param {string} currentStatus
 * @param {string} newStatus
 * @returns {{ valid: boolean, error?: string }}
 */
function validateTransition(currentStatus, newStatus) {
  const allowed = TRANSITIONS[currentStatus];
  if (!allowed) {
    return { valid: false, error: `Unknown current status: ${currentStatus}` };
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
 * Transition a quotation's status, validate it, save it, and log history.
 * @param {Object} quotation - Mongoose Quotation document
 * @param {string} newStatus - The target status
 * @param {string} actorId - User ID performing the action
 * @param {string} action - Description of the action (e.g. "Approved by manager")
 * @returns {Promise<Object>} - The updated quotation
 * @throws {Error} if transition is invalid
 */
async function transitionStatus(quotation, newStatus, actorId, action) {
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
    action,
    oldValue: oldStatus,
    newValue: newStatus,
  });

  return quotation;
}

module.exports = { TRANSITIONS, validateTransition, transitionStatus };
