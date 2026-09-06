const Quotation = require('../models/Quotation');
const SalesOrder = require('../models/SalesOrder');
const Approval = require('../models/Approval');
const DealHealth = require('../models/DealHealth');
const Customer = require('../models/Customer');
const ApiResponse = require('../utils/apiResponse');

async function getCustomerFilter(req) {
  if (req.user?.role !== 'sales_manager') return {};
  const customers = await Customer.find({ salespersonId: req.user.id }, '_id');
  return { customerId: { $in: customers.map(customer => customer._id) } };
}

/**
 * GET /api/v1/dashboard/summary
 * Returns metrics: Open Deals, Pipeline Value, Action Required, etc.
 */
exports.getSummary = async (req, res, next) => {
  try {
    const customerFilter = await getCustomerFilter(req);
    const openQuotes = await Quotation.find({
      ...customerFilter,
      status: { $in: ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT_TO_CUSTOMER', 'NEGOTIATION', 'RE_APPROVAL'] }
    });
    const openOrders = await SalesOrder.find({
      ...customerFilter,
      status: { $in: ['CONFIRMED', 'IN_FULFILLMENT', 'PARTIALLY_FULFILLED', 'BILLED'] }
    });

    const openDealsCount = openQuotes.length + openOrders.length;
    const pipelineValue = openQuotes.reduce((acc, q) => acc + (q.totalAmount || 0), 0) +
                          openOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    const scopedQuoteIds = await Quotation.find(customerFilter, '_id');
    const scopedOrderIds = await SalesOrder.find(customerFilter, '_id');
    const pendingApprovalsCount = await Approval.countDocuments({
      status: 'PENDING',
      quotationId: { $in: scopedQuoteIds.map(q => q._id) }
    });
    const atRiskCount = await DealHealth.countDocuments({
      status: { $in: ['AT_RISK', 'CRITICAL'] },
      $or: [
        { quotationId: { $in: scopedQuoteIds.map(q => q._id) } },
        { salesOrderId: { $in: scopedOrderIds.map(o => o._id) } }
      ]
    });

    const pipelineValueDisplay = `\u20B9${(pipelineValue / 100000).toFixed(2)}L`;

    return ApiResponse.success(res, {
      openDeals: openDealsCount,
      openDealsDescription: "Across active stages",
      pipelineValue: pipelineValueDisplay,
      pipelineRawValue: pipelineValue,
      pipelineDescription: "Active opportunities",
      actionRequired: pendingApprovalsCount + atRiskCount,
      actionRequiredDescription: "Deals need attention",
      pendingApprovals: pendingApprovalsCount,
      atRiskDeals: atRiskCount
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/dashboard/recent-deals
 */
exports.getRecentDeals = async (req, res, next) => {
  try {
    const customerFilter = await getCustomerFilter(req);
    const quotations = await Quotation.find(customerFilter)
      .populate('customerId')
      .sort({ updatedAt: -1 })
      .limit(10);

    const formatted = quotations.map(q => {
      const customerName = q.customerId?.name || 'Customer';
      const valDisplay = `\u20B9${((q.totalAmount || 0) / 100000).toFixed(2)}L`;
      return {
        id: `Q-${q._id.toString().slice(-4).toUpperCase()}`,
        _id: q._id,
        customer: customerName,
        title: q.title || `${customerName} Quotation`,
        value: valDisplay,
        rawAmount: q.totalAmount,
        stage: q.status === 'ACCEPTED' ? 'Accepted' : q.status,
        updated: q.updatedAt ? new Date(q.updatedAt).toLocaleDateString() : 'Recent',
        isPriority: q.isPriority || false
      };
    });

    return ApiResponse.success(res, formatted);
  } catch (err) {
    next(err);
  }
};
