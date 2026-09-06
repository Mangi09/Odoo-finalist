const { getKpis, getLifecycleStages, getAnalytics, getAttentionItems, getActivity } = require('../services/reportsService');
const Customer = require('../models/Customer');
const ApiResponse = require('../utils/apiResponse');

async function getCustomerScope(req) {
  if (req.user?.role !== 'sales_manager') return null;
  const customers = await Customer.find({ salespersonId: req.user.id }, '_id');
  return customers.map(customer => customer._id);
}

/**
 * GET /api/v1/reports/kpis
 */
exports.getKpisReport = async (req, res, next) => {
  try {
    const data = await getKpis(await getCustomerScope(req));
    return ApiResponse.success(res, data);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/reports/lifecycle
 */
exports.getLifecycleReport = async (req, res, next) => {
  try {
    const data = await getLifecycleStages(await getCustomerScope(req));
    return ApiResponse.success(res, data);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/reports/analytics
 */
exports.getAnalyticsReport = async (req, res, next) => {
  try {
    const data = await getAnalytics(await getCustomerScope(req));
    return ApiResponse.success(res, data);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/reports/attention
 */
exports.getAttentionReport = async (req, res, next) => {
  try {
    const data = await getAttentionItems(await getCustomerScope(req));
    return ApiResponse.success(res, data);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/reports/activity
 */
exports.getActivityReport = async (req, res, next) => {
  try {
    const data = await getActivity(await getCustomerScope(req));
    return ApiResponse.success(res, data);
  } catch (err) {
    next(err);
  }
};
