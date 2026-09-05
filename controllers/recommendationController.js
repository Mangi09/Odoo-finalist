const Recommendation = require('../models/Recommendation');
const Quotation = require('../models/Quotation');
const Product = require('../models/Product');
const { generateRecommendations } = require('../services/recommendationService');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /api/v1/quotations/:id/recommendations
 */
exports.getRecommendationsForQuotation = async (req, res, next) => {
  try {
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return ApiResponse.notFound(res, 'Quotation not found');

    // Generate new recommendations based on current items
    await generateRecommendations(quotation);

    const recs = await Recommendation.find({
      quotationId: quotation._id,
      status: 'PENDING'
    }).populate('productId');

    const formatted = recs.map(r => ({
      _id: r._id,
      id: r._id,
      product: r.productId?.name || 'Product',
      productId: r.productId?._id,
      price: r.productId?.sellingPrice || 0,
      type: r.type,
      reason: r.reason,
      marginImpact: r.marginImpact ? `+$${r.marginImpact}` : '$0',
      status: r.status
    }));

    return ApiResponse.success(res, formatted);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/recommendations/:id/accept
 */
exports.acceptRecommendation = async (req, res, next) => {
  try {
    const rec = await Recommendation.findById(req.params.id).populate('productId');
    if (!rec) return ApiResponse.notFound(res, 'Recommendation not found');

    const quotation = await Quotation.findById(rec.quotationId);
    if (!quotation) return ApiResponse.notFound(res, 'Quotation not found');

    const product = rec.productId;
    const unitPrice = product.sellingPrice;
    const costPrice = product.cost || 0;
    const qty = 1;
    const lineTotal = unitPrice * qty;
    const lineMargin = (unitPrice - costPrice) * qty;

    quotation.items.push({
      productId: product._id,
      qty,
      unitPrice,
      discountPercent: 0,
      lineTotal,
      lineMargin,
      isRecommendation: true
    });

    quotation.totalAmount = (quotation.totalAmount || 0) + lineTotal;
    quotation.totalMargin = (quotation.totalMargin || 0) + lineMargin;
    await quotation.save();

    rec.status = 'ACCEPTED';
    await rec.save();

    return ApiResponse.success(res, {
      message: 'Recommendation accepted and added to quotation',
      quotation,
      recommendation: rec
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/recommendations/:id/reject
 */
exports.rejectRecommendation = async (req, res, next) => {
  try {
    const rec = await Recommendation.findById(req.params.id);
    if (!rec) return ApiResponse.notFound(res, 'Recommendation not found');

    rec.status = 'REJECTED';
    await rec.save();

    return ApiResponse.success(res, {
      message: 'Recommendation rejected',
      recommendation: rec
    });
  } catch (err) {
    next(err);
  }
};
