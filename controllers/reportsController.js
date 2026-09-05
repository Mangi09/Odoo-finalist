const { getKpis, getLifecycleStages, getAnalytics, getAttentionItems, getActivity } = require('../services/reportsService');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /api/v1/reports/kpis
 */
exports.getKpisReport = async (req, res, next) => {
  try {
    const data = await getKpis();
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
    const data = await getLifecycleStages();
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
    const data = await getAnalytics();
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
    const data = await getAttentionItems();
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
    const data = await getActivity();
    return ApiResponse.success(res, data);
  } catch (err) {
    next(err);
  }
};
