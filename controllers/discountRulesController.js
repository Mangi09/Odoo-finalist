/**
 * Discount Rules Controller
 * GET  /api/v1/discount-rules       — list all rules with tier + category info
 * PATCH /api/v1/discount-rules/:id  — update a single rule's maxDiscountPercent / approvalLevel
 */

const DiscountRule = require('../models/DiscountRule');
const CustomerTier = require('../models/CustomerTier');
const Category = require('../models/Category');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /api/v1/discount-rules
 */
exports.getDiscountRules = async (req, res, next) => {
  try {
    const rules = await DiscountRule.find()
      .populate('tierId')
      .populate('categoryId')
      .sort({ tierId: 1, categoryId: 1 });

    const tiers = await CustomerTier.find().sort({ maxDiscountPercent: 1 });
    const categories = await Category.find().sort({ name: 1 });

    // Find category max discount mappings from rules
    const catMaxMap = {};
    rules.forEach(r => {
      if (r.categoryId) {
        const cId = r.categoryId._id ? r.categoryId._id.toString() : r.categoryId.toString();
        if (catMaxMap[cId] === undefined || r.maxDiscountPercent > catMaxMap[cId]) {
          catMaxMap[cId] = r.maxDiscountPercent;
        }
      }
    });

    const formatted = rules.map(r => ({
      _id: r._id,
      tier: r.tierId?.name || 'Unknown',
      tierId: r.tierId?._id,
      tierMaxDiscount: r.tierId?.maxDiscountPercent || 0,
      category: r.categoryId?.name || 'All',
      categoryId: r.categoryId?._id,
      maxDiscountPercent: r.maxDiscountPercent,
      approvalLevel: r.approvalLevel,
      active: r.active !== false,
    }));

    return ApiResponse.success(res, {
      rules: formatted,
      tiers: tiers.map(t => ({ _id: t._id, name: t.name, maxDiscountPercent: t.maxDiscountPercent })),
      categories: categories.map(c => ({
        _id: c._id,
        name: c.name,
        maxDiscount: catMaxMap[c._id.toString()] !== undefined ? catMaxMap[c._id.toString()] : 15,
      })),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/discount-rules/bulk
 * Body: { tiers: [{ id, maxDiscount }], categories: [{ id, maxDiscount }] }
 */
exports.updateBulk = async (req, res, next) => {
  try {
    const { tiers, categories } = req.body;

    if (Array.isArray(tiers)) {
      for (const t of tiers) {
        const pct = Number(t.maxDiscount !== undefined ? t.maxDiscount : t.maxDiscountPercent);
        if (!isNaN(pct) && pct >= 0 && pct <= 100) {
          await CustomerTier.findByIdAndUpdate(t.id || t._id, { maxDiscountPercent: pct });
        }
      }
    }

    if (Array.isArray(categories)) {
      for (const c of categories) {
        const pct = Number(c.maxDiscount !== undefined ? c.maxDiscount : c.maxDiscountPercent);
        if (!isNaN(pct) && pct >= 0 && pct <= 100) {
          await DiscountRule.updateMany({ categoryId: c.id || c._id }, { maxDiscountPercent: pct });
        }
      }
    }

    return ApiResponse.success(res, { message: 'Discount rules and tiers updated successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/discount-rules/:id
 * Body: { maxDiscountPercent, approvalLevel, active }
 */
exports.updateDiscountRule = async (req, res, next) => {
  try {
    const { maxDiscountPercent, approvalLevel, active } = req.body;
    const rule = await DiscountRule.findById(req.params.id).populate('tierId').populate('categoryId');
    if (!rule) return ApiResponse.notFound(res, 'Discount rule not found');

    if (maxDiscountPercent !== undefined) {
      const pct = Number(maxDiscountPercent);
      if (isNaN(pct) || pct < 0 || pct > 100) {
        return ApiResponse.badRequest(res, 'maxDiscountPercent must be 0–100');
      }
      rule.maxDiscountPercent = pct;
    }
    if (approvalLevel !== undefined) rule.approvalLevel = Number(approvalLevel) || 1;
    if (active !== undefined) rule.active = Boolean(active);

    await rule.save();

    return ApiResponse.success(res, {
      _id: rule._id,
      tier: rule.tierId?.name || 'Unknown',
      tierId: rule.tierId?._id,
      category: rule.categoryId?.name || 'All',
      categoryId: rule.categoryId?._id,
      maxDiscountPercent: rule.maxDiscountPercent,
      approvalLevel: rule.approvalLevel,
      active: rule.active,
    });
  } catch (err) {
    next(err);
  }
};

