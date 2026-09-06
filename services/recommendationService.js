/**
 * Recommendation Service
 * Category-based cross-sell/upsell suggestion engine.
 */

const Product = require('../models/Product');
const Category = require('../models/Category');
const Recommendation = require('../models/Recommendation');
const logger = require('../utils/logger');

// Rule definitions: if quotation contains product in sourceCategory → suggest products in targetCategory
const CROSS_SELL_RULES = [
  { sourceCategory: 'Hardware', targetCategories: ['Hardware', 'Networking'], type: 'CROSS_SELL', reason: 'Complement your hardware setup' },
  { sourceCategory: 'Hardware', targetCategories: ['Services'], type: 'UPSELL', reason: 'Protect your investment' },
  { sourceCategory: 'Hardware', targetCategories: ['Cloud', 'Software'], type: 'CROSS_SELL', reason: 'Complete your IT stack' },
  { sourceCategory: 'Cloud', targetCategories: ['Services', 'Subscription'], type: 'UPSELL', reason: 'Ensure uptime with support' },
];

/**
 * Generate recommendations for a quotation based on its items.
 * @param {Object} quotation - Populated quotation with items
 * @returns {Promise<Array>} - Array of recommendation docs created
 */
async function generateRecommendations(quotation) {
  const categories = await Category.find();
  const catMap = {};
  categories.forEach(c => { catMap[c._id.toString()] = c.name; });

  // Collect category names of products already in the quotation
  const existingProductIds = quotation.items.map(i => i.productId.toString());
  const existingProducts = await Product.find({ _id: { $in: existingProductIds } });
  const existingCategoryNames = [...new Set(existingProducts.map(p => catMap[p.categoryId.toString()]))];

  const recommendations = [];

  for (const rule of CROSS_SELL_RULES) {
    if (!existingCategoryNames.includes(rule.sourceCategory)) continue;

    // Find target category IDs
    const targetCategoryIds = categories
      .filter(c => rule.targetCategories.includes(c.name))
      .map(c => c._id);

    // Find products in target categories that are NOT already in the quotation
    const candidates = await Product.find({
      categoryId: { $in: targetCategoryIds },
      _id: { $nin: existingProductIds },
      isActive: true,
    });

    for (const candidate of candidates) {
      // Check if recommendation already exists for this quotation+product
      const exists = await Recommendation.findOne({
        quotationId: quotation._id,
        productId: candidate._id,
      });
      if (exists) continue;

      const marginImpact = candidate.sellingPrice - candidate.cost;

      const rec = await Recommendation.create({
        quotationId: quotation._id,
        productId: candidate._id,
        type: rule.type,
        reason: rule.reason,
        marginImpact,
        status: 'PENDING',
      });

      recommendations.push(rec);
      logger.info(`Recommendation: ${candidate.name} (${rule.type}) for quotation ${quotation._id}`);
    }
  }

  return recommendations;
}

module.exports = { generateRecommendations };
