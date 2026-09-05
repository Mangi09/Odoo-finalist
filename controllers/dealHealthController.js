const DealHealth = require('../models/DealHealth');
const Quotation = require('../models/Quotation');
const { recalculate } = require('../services/dealHealthService');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /api/v1/deal-health
 * Returns overview, anomalies, at-risk deals, and health distribution matching DealHealthPage.jsx
 */
exports.getDealHealthDashboard = async (req, res, next) => {
  try {
    // Recalculate health for all active quotations
    const activeQuotations = await Quotation.find({
      status: { $nin: ['PAID', 'CANCELLED'] }
    }).populate('customerId');

    for (const q of activeQuotations) {
      await recalculate(q._id);
    }

    const allHealth = await DealHealth.find()
      .populate({
        path: 'quotationId',
        populate: { path: 'customerId' }
      })
      .sort({ score: 1 });

    const healthyCount = allHealth.filter(h => h.status === 'HEALTHY').length;
    const atRiskCount = allHealth.filter(h => h.status === 'AT_RISK').length;
    const criticalCount = allHealth.filter(h => h.status === 'CRITICAL').length;

    // Anomalies
    const anomalies = [];
    allHealth.filter(h => h.riskFactors && h.riskFactors.length > 0).slice(0, 5).forEach(h => {
      const q = h.quotationId || {};
      const cust = q.customerId || {};
      const primaryRisk = h.riskFactors[0] || 'Unusual inactivity or margin drop';

      anomalies.push({
        id: h._id,
        deal: q.title || `${cust.name || 'Deal'} Order`,
        customer: cust.name || 'Acme Corporation',
        severity: h.status === 'CRITICAL' ? 'Critical' : (h.status === 'AT_RISK' ? 'High' : 'Medium'),
        description: primaryRisk,
        recommendation: h.status === 'CRITICAL'
          ? 'Review pricing changes and recent communications immediately.'
          : 'Follow up with the customer decision-maker or manager.'
      });
    });

    // At-Risk Deals Table
    const atRiskDeals = allHealth.map(h => {
      const q = h.quotationId || {};
      const cust = q.customerId || {};
      const riskLabel = h.score >= 70 ? 'Low' : (h.score >= 40 ? 'Medium' : 'High');

      return {
        id: h._id,
        deal: q.title || `${cust.name || 'Enterprise'} Renewal`,
        customer: cust.name || 'Customer Corp',
        stage: q.status || 'Approval',
        healthScore: h.score,
        risk: riskLabel,
        lastActivity: q.updatedAt ? `${Math.floor((Date.now() - new Date(q.updatedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago` : '2 days ago'
      };
    });

    return ApiResponse.success(res, {
      summary: {
        totalTracked: allHealth.length,
        healthy: healthyCount,
        atRisk: atRiskCount,
        critical: criticalCount
      },
      distribution: {
        healthy: healthyCount,
        atRisk: atRiskCount,
        critical: criticalCount
      },
      anomalies,
      atRiskDeals
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/deal-health/recalculate/:quotationId
 */
exports.recalculateScore = async (req, res, next) => {
  try {
    const health = await recalculate(req.params.quotationId);
    if (!health) return ApiResponse.notFound(res, 'Quotation not found');
    return ApiResponse.success(res, health);
  } catch (err) {
    next(err);
  }
};
