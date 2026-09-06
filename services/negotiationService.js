/**
 * Negotiation Service
 * Handles customer negotiation requests and re-approval workflow.
 */

const Negotiation = require('../models/Negotiation');
const Quotation = require('../models/Quotation');
const { runDiscountEngine } = require('./discountEngine');
const Customer = require('../models/Customer');
const { transitionStatus } = require('../utils/stateMachine');
const { calculateQuotationTotals } = require('../utils/quotationTotals');
const logger = require('../utils/logger');

/**
 * Process a negotiation review — apply changes and re-run discount engine if needed.
 * @param {ObjectId} negotiationId
 * @param {string} action - 'APPROVED' or 'REJECTED'
 * @param {string} actorId - User performing the review
 * @returns {Promise<Object>}
 */
async function reviewNegotiation(negotiationId, action, actorId) {
  const negotiation = await Negotiation.findById(negotiationId);
  if (!negotiation) throw new Error('Negotiation not found');

  negotiation.status = action;
  await negotiation.save();

  if (action === 'APPROVED') {
    const quotation = await Quotation.findById(negotiation.quotationId);
    if (!quotation) throw new Error('Quotation not found');

    // Apply negotiation item changes to quotation
    for (const negItem of negotiation.items) {
      if (negItem.action === 'MODIFY') {
        const qItem = quotation.items.find(i => i.productId.toString() === negItem.productId.toString());
        if (qItem) {
          if (negItem.requestedQty) qItem.qty = negItem.requestedQty;
          if (negItem.requestedDiscountPercent != null) qItem.discountPercent = negItem.requestedDiscountPercent;
          // Recalculate line total
          qItem.lineTotal = qItem.qty * qItem.unitPrice * (1 - qItem.discountPercent / 100);
        }
      }
      // ADD/REMOVE handled separately
    }

    // Recalculate totals
    const totals = calculateQuotationTotals(quotation.items, quotation.globalDiscountPercent || 0);
    quotation.subtotalAmount = totals.subtotalAmount;
    quotation.globalDiscountAmount = totals.globalDiscountAmount;
    quotation.totalAmount = totals.totalAmount;
    quotation.totalMargin = totals.totalMargin;
    await quotation.save();

    // Re-run discount engine
    const customer = await Customer.findById(quotation.customerId);
    const { needsApproval } = await runDiscountEngine(quotation, customer);

    if (needsApproval) {
      await transitionStatus(quotation, 'RE_APPROVAL', actorId, 'Negotiation approved — re-approval required due to discount changes');
    } else {
      await transitionStatus(quotation, 'CONFIRMED', actorId, 'Negotiation approved — quotation confirmed');
    }

    logger.info(`Negotiation ${negotiationId} approved → quotation ${quotation._id} → ${quotation.status}`);
  }

  return negotiation;
}

module.exports = { reviewNegotiation };
