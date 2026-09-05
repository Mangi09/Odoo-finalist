/**
 * Discount Engine Service
 * Evaluates discount limits per line item and triggers approvals if needed.
 * effective limit = min(tierLimit, categoryLimit)
 */

const DiscountRule = require('../models/DiscountRule');
const CustomerTier = require('../models/CustomerTier');
const Category = require('../models/Category');
const Approval = require('../models/Approval');
const Product = require('../models/Product');
const logger = require('../utils/logger');

/**
 * Get the effective discount limit for a product given a customer tier.
 * @param {ObjectId} tierId
 * @param {ObjectId} categoryId
 * @returns {Promise<{ tierLimit: number, categoryLimit: number, effectiveLimit: number, approvalLevel: number }>}
 */
async function getEffectiveLimit(tierId, categoryId) {
  // Get tier max discount
  const tier = await CustomerTier.findById(tierId);
  const tierLimit = tier ? tier.maxDiscountPercent : 0;

  // Get category-specific rule for this tier (most specific)
  let categoryLimit = 100; // default: no category cap
  let approvalLevel = 1;

  const rule = await DiscountRule.findOne({
    tierId,
    categoryId,
    active: true,
  });

  if (rule) {
    categoryLimit = rule.maxDiscountPercent;
    approvalLevel = rule.approvalLevel;
  } else {
    // Fallback: category-only rule (no tier)
    const catRule = await DiscountRule.findOne({
      tierId: null,
      categoryId,
      active: true,
    });
    if (catRule) {
      categoryLimit = catRule.maxDiscountPercent;
      approvalLevel = catRule.approvalLevel;
    }
  }

  const effectiveLimit = Math.min(tierLimit, categoryLimit);
  return { tierLimit, categoryLimit, effectiveLimit, approvalLevel };
}

/**
 * Evaluate all items in a quotation. Returns whether approval is needed and details.
 * @param {Object} quotation - Populated quotation with items (productId populated)
 * @param {Object} customer - Customer with tierId
 * @returns {Promise<{ needsApproval: boolean, decisions: Array, maxApprovalLevel: number }>}
 */
async function evaluateQuotation(quotation, customer) {
  const decisions = [];
  let needsApproval = false;
  let maxApprovalLevel = 0;

  for (const item of quotation.items) {
    const product = await Product.findById(item.productId);
    if (!product) continue;

    const limits = await getEffectiveLimit(customer.tierId, product.categoryId);
    const requestedDiscount = item.discountPercent || 0;
    const exceedsLimit = requestedDiscount > limits.effectiveLimit;

    if (exceedsLimit) {
      needsApproval = true;
      if (limits.approvalLevel > maxApprovalLevel) {
        maxApprovalLevel = limits.approvalLevel;
      }
    }

    decisions.push({
      productId: item.productId,
      productName: product.name,
      requestedDiscount,
      effectiveLimit: limits.effectiveLimit,
      tierLimit: limits.tierLimit,
      categoryLimit: limits.categoryLimit,
      exceedsLimit,
      approvalLevel: exceedsLimit ? limits.approvalLevel : 0,
    });

    logger.info(`Discount check: ${product.name} — requested ${requestedDiscount}%, limit ${limits.effectiveLimit}% → ${exceedsLimit ? 'NEEDS APPROVAL' : 'OK'}`);
  }

  return { needsApproval, decisions, maxApprovalLevel };
}

/**
 * Run the discount engine on a quotation and create Approval records if needed.
 * @param {Object} quotation - Mongoose quotation document (with items)
 * @param {Object} customer - Customer with tierId
 * @returns {Promise<{ needsApproval: boolean, decisions: Array }>}
 */
async function runDiscountEngine(quotation, customer) {
  const { needsApproval, decisions, maxApprovalLevel } = await evaluateQuotation(quotation, customer);

  if (needsApproval) {
    // Find items that exceed limits and create approval records
    for (const decision of decisions) {
      if (decision.exceedsLimit) {
        await Approval.create({
          quotationId: quotation._id,
          quotationItemId: null, // Could be refined to specific item
          level: decision.approvalLevel,
          requestedDiscountPercent: decision.requestedDiscount,
          allowedDiscountPercent: decision.effectiveLimit,
          status: 'PENDING',
          reason: `Requested ${decision.requestedDiscount}% exceeds limit of ${decision.effectiveLimit}% for ${decision.productName}`,
        });
      }
    }
    logger.info(`Quotation ${quotation._id}: Approval required (level ${maxApprovalLevel})`);
  } else {
    logger.info(`Quotation ${quotation._id}: Auto-approved (all discounts within limits)`);
  }

  return { needsApproval, decisions };
}

module.exports = { getEffectiveLimit, evaluateQuotation, runDiscountEngine };
