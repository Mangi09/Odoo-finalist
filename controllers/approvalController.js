const Approval = require('../models/Approval');
const Quotation = require('../models/Quotation');
const { transitionStatus } = require('../utils/stateMachine');
const ApiResponse = require('../utils/apiResponse');

function formatApproval(appr) {
  const quote = appr.quotationId || {};
  const cust = quote.customerId || {};
  const approver = appr.approverId || {};

  let risk = 'LOW';
  if (appr.requestedDiscountPercent > 20) risk = 'HIGH';
  else if (appr.requestedDiscountPercent > 10) risk = 'MEDIUM';

  const salesperson = quote.salespersonId?.name || 'Unassigned';

  const stageNames = {
    1: 'Sales Manager',
    2: 'VP Sales',
    3: 'Finance'
  };

  return {
    _id: appr._id,
    quotation: quote.quotationNumber || (quote._id ? `Q-${quote._id.toString().slice(-4).toUpperCase()}` : 'Q-UNKNOWN'),
    quotationId: quote._id,
    customer: cust.name || 'Acme Corp',
    salesperson,
    risk,
    stage: stageNames[appr.level] || `Level ${appr.level}`,
    assigned: approver.name || (appr.status === 'APPROVED' ? 'Approved' : 'Pending Manager'),
    status: appr.status,
    requestedDiscount: `${appr.requestedDiscountPercent}%`,
    allowedDiscount: `${appr.allowedDiscountPercent || 0}%`,
    subtotalAmount: quote.subtotalAmount || quote.totalAmount || 0,
    globalDiscountPercent: quote.globalDiscountPercent || 0,
    globalDiscountAmount: quote.globalDiscountAmount || 0,
    totalAmount: quote.totalAmount || 0,
    items: (quote.items || []).map(item => ({
      product: item.productId?.name || 'Product',
      discountPercent: item.discountPercent || 0,
      lineTotal: item.lineTotal || 0
    })),
    reason: appr.reason,
    marginImpact: appr.requestedDiscountPercent ? `-${appr.requestedDiscountPercent * 0.8}% Margin` : 'Minimal',
    createdAt: appr.createdAt
  };
}

/**
 * GET /api/v1/approvals
 */
exports.getApprovals = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status.toUpperCase();

    const approvals = await Approval.find(filter)
      .populate({
        path: 'quotationId',
        populate: [{ path: 'customerId' }, { path: 'salespersonId' }]
      })
      .populate('approverId')
      .sort({ createdAt: -1 });

    const formatted = approvals.map(formatApproval);
    return ApiResponse.success(res, formatted);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/approvals/:id
 */
exports.getApprovalById = async (req, res, next) => {
  try {
    const approval = await Approval.findById(req.params.id)
      .populate({
        path: 'quotationId',
        populate: [{ path: 'customerId' }, { path: 'items.productId' }, { path: 'salespersonId' }]
      })
      .populate('approverId');

    if (!approval) return ApiResponse.notFound(res, 'Approval request not found');

    return ApiResponse.success(res, formatApproval(approval));
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/approvals/:id
 * Body: { status: 'APPROVED' | 'REJECTED', reason?: string }
 */
exports.decideApproval = async (req, res, next) => {
  try {
    const { status, reason } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return ApiResponse.badRequest(res, 'Status must be APPROVED or REJECTED');
    }

    const approval = await Approval.findById(req.params.id);
    if (!approval) return ApiResponse.notFound(res, 'Approval not found');

    approval.status = status;
    approval.reason = reason || approval.reason;
    approval.decidedAt = new Date();
    approval.approverId = req.user?._id || approval.approverId;
    await approval.save();

    // Check if quotation needs transition
    const quotation = await Quotation.findById(approval.quotationId);
    if (quotation) {
      const actorId = req.user?._id || quotation.salespersonId;
      if (status === 'REJECTED') {
        if (quotation.status === 'PENDING_APPROVAL' || quotation.status === 'RE_APPROVAL') {
          await transitionStatus(quotation, 'REJECTED', actorId, `Rejected by approver: ${reason || 'Discount too high'}`);
        }
      } else if (status === 'APPROVED') {
        // Check if there are any other remaining pending approvals for this quotation
        const pendingCount = await Approval.countDocuments({
          quotationId: quotation._id,
          status: 'PENDING'
        });

        if (pendingCount === 0) {
          if (quotation.status === 'PENDING_APPROVAL' || quotation.status === 'RE_APPROVAL') {
            await transitionStatus(quotation, 'APPROVED', actorId, 'Approved by all required reviewers');
          }
        }
      }
    }

    return ApiResponse.success(res, formatApproval(approval));
  } catch (err) {
    next(err);
  }
};
