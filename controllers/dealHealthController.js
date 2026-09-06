const DealHealth = require('../models/DealHealth');
const Quotation = require('../models/Quotation');
const SalesOrder = require('../models/SalesOrder');
const Customer = require('../models/Customer');
const { recalculate, recalculateSalesOrder } = require('../services/dealHealthService');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /api/v1/deal-health
 * Returns overview, anomalies, at-risk deals, and health distribution matching DealHealthPage.jsx
 */
exports.getDealHealthDashboard = async (req, res, next) => {
  try {
    const customerFilter = req.user?.role === 'customer'
      ? { customerId: req.user.customerId }
      : req.user?.role === 'sales_manager'
        ? { customerId: { $in: (await Customer.find({ salespersonId: req.user.id }, '_id')).map(customer => customer._id) } }
        : {};
    // Recalculate health for all active quotations
    const activeQuotations = await Quotation.find({
      ...customerFilter,
      status: { $nin: ['ACCEPTED', 'REJECTED', 'CANCELLED'] }
    });

    for (const q of activeQuotations) {
      await recalculate(q._id);
    }

    // Recalculate health for all active sales orders
    const activeSalesOrders = await SalesOrder.find({
      ...customerFilter,
      status: { $nin: ['PAID', 'CLOSED', 'CANCELLED'] }
    });

    for (const so of activeSalesOrders) {
      await recalculateSalesOrder(so._id);
    }

    const healthFilter = ['customer', 'sales_manager'].includes(req.user?.role)
      ? {
          $or: [
            { quotationId: { $in: (await Quotation.find(customerFilter, '_id')).map(q => q._id) } },
            { salesOrderId: { $in: (await SalesOrder.find(customerFilter, '_id')).map(so => so._id) } }
          ]
        }
      : {};
    const allHealth = await DealHealth.find(healthFilter)
      .populate({
        path: 'quotationId',
        populate: [{ path: 'customerId' }, { path: 'salespersonId' }]
      })
      .populate({
        path: 'salesOrderId',
        populate: [{ path: 'customerId' }, { path: 'salespersonId' }]
      })
      .sort({ score: 1 });

    const healthyCount = allHealth.filter(h => h.status === 'HEALTHY').length;
    const atRiskCount = allHealth.filter(h => h.status === 'AT_RISK').length;
    const criticalCount = allHealth.filter(h => h.status === 'CRITICAL').length;

    // Anomalies
    const anomalies = [];
    allHealth.filter(h => h.riskFactors && h.riskFactors.length > 0).slice(0, 5).forEach(h => {
      const q = h.quotationId || {};
      const so = h.salesOrderId || {};
      const cust = q.customerId || so.customerId || {};
      const primaryRisk = h.riskFactors[0] || 'Unusual inactivity or margin drop';
      const dealTitle = so.orderNumber || q.title || `${cust.name || 'Deal'} Order`;
      const salesperson = so.salespersonId?.name || q.salespersonId?.name || 'Unassigned';

      anomalies.push({
        id: h._id,
        quotationId: q._id || so.quotationId || null,
        salesOrderId: so._id || null,
        dealType: so._id ? 'order' : 'quotation',
        deal: dealTitle,
        customer: cust.name || 'Customer Corp',
        salesperson,
        severity: h.status === 'CRITICAL' ? 'Critical' : (h.status === 'AT_RISK' ? 'High' : 'Medium'),
        description: h.escalated ? `[ESCALATED] ${primaryRisk}` : primaryRisk,
        escalated: h.escalated || false,
        recommendation: h.status === 'CRITICAL'
          ? 'Review pricing changes and recent communications immediately.'
          : 'Follow up with the customer decision-maker or manager.'
      });
    });

    // At-Risk Deals Table
    const atRiskDeals = allHealth.map(h => {
      const q = h.quotationId || {};
      const so = h.salesOrderId || {};
      const cust = q.customerId || so.customerId || {};
      const riskLabel = h.score >= 70 ? 'Low' : (h.score >= 40 ? 'Medium' : 'High');
      const dealTitle = so.orderNumber || q.title || `${cust.name || 'Enterprise'} Renewal`;
      const stage = so.status || q.status || 'Approval';
      const updatedAt = so.updatedAt || q.updatedAt || h.updatedAt;
      const salesperson = so.salespersonId?.name || q.salespersonId?.name || 'Unassigned';

      return {
        id: h._id,
        quotationId: q._id || so.quotationId || null,
        salesOrderId: so._id || null,
        dealType: so._id ? 'order' : 'quotation',
        deal: dealTitle,
        customer: cust.name || 'Customer Corp',
        salesperson,
        stage,
        healthScore: h.score,
        escalated: h.escalated || false,
        risk: riskLabel,
        lastActivity: updatedAt ? `${Math.floor((Date.now() - new Date(updatedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago` : '2 days ago'
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
 * POST /api/v1/deal-health/:id/escalate
 */
exports.escalateDeal = async (req, res, next) => {
  try {
    const health = await DealHealth.findById(req.params.id);
    if (!health) return ApiResponse.notFound(res, 'Deal health record');

    if (req.user?.role === 'sales_manager') {
      const assignedCustomers = await Customer.find({ salespersonId: req.user.id }, '_id');
      const customerIds = assignedCustomers.map(customer => customer._id);
      const quote = health.quotationId ? await Quotation.findOne({ _id: health.quotationId, customerId: { $in: customerIds } }) : null;
      const order = health.salesOrderId ? await SalesOrder.findOne({ _id: health.salesOrderId, customerId: { $in: customerIds } }) : null;
      if (!quote && !order) return ApiResponse.forbidden(res, 'Access denied. This customer is not assigned to you.');
    }

    health.escalated = true;
    health.escalatedAt = new Date();
    health.escalatedBy = req.user.id;
    if (!health.riskFactors.some(factor => factor.includes('Escalated'))) {
      health.riskFactors.unshift('Escalated to leadership');
    }
    await health.save();

    return ApiResponse.success(res, health);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/deal-health/recalculate/:quotationId
 */
exports.recalculateScore = async (req, res, next) => {
  try {
    if (req.user?.role === 'customer') {
      const quote = await Quotation.findOne({ _id: req.params.quotationId, customerId: req.user.customerId });
      const order = quote ? null : await SalesOrder.findOne({ _id: req.params.quotationId, customerId: req.user.customerId });
      if (!quote && !order) return ApiResponse.forbidden(res, 'Access denied.');
    }
    if (req.user?.role === 'sales_manager') {
      const assignedCustomers = await Customer.find({ salespersonId: req.user.id }, '_id');
      const customerIds = assignedCustomers.map(customer => customer._id);
      const quote = await Quotation.findOne({ _id: req.params.quotationId, customerId: { $in: customerIds } });
      const order = quote ? null : await SalesOrder.findOne({ _id: req.params.quotationId, customerId: { $in: customerIds } });
      if (!quote && !order) return ApiResponse.forbidden(res, 'Access denied. This customer is not assigned to you.');
    }
    let health = await recalculate(req.params.quotationId);
    if (!health) {
      health = await recalculateSalesOrder(req.params.quotationId);
    }
    if (!health) return ApiResponse.notFound(res, 'Quotation or SalesOrder not found');
    return ApiResponse.success(res, health);
  } catch (err) {
    next(err);
  }
};
