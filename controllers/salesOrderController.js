const SalesOrder = require('../models/SalesOrder');
const SalesOrderHistory = require('../models/SalesOrderHistory');
const Fulfillment = require('../models/Fulfillment');
const Backorder = require('../models/Backorder');
const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const { transitionSalesOrderStatus } = require('../utils/stateMachine');
const ApiResponse = require('../utils/apiResponse');

function formatSalesOrderListItem(so) {
  const customerName = so.customerId?.name || 'Customer';
  const valDisplay = `₹${((so.totalAmount || 0) / 100000).toFixed(2)}L`;

  return {
    _id: so._id,
    id: so.orderNumber,
    orderNumber: so.orderNumber,
    quotationId: so.quotationId,
    customer: customerName,
    salesperson: so.salespersonId?.name || 'Sales Rep',
    value: valDisplay,
    totalAmount: so.totalAmount,
    totalMargin: so.totalMargin,
    status: so.status,
    rawStatus: so.status,
    confirmedAt: so.confirmedAt ? new Date(so.confirmedAt).toLocaleDateString() : 'Just now',
    updatedAt: so.updatedAt ? new Date(so.updatedAt).toLocaleDateString() : 'Just now',
  };
}

/**
 * GET /api/v1/sales-orders
 */
exports.getSalesOrders = async (req, res, next) => {
  try {
    const { status, search, customerId } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status.toUpperCase();
    }
    if (customerId) filter.customerId = customerId;

    const salesOrders = await SalesOrder.find(filter)
      .populate('customerId')
      .populate('salespersonId')
      .populate('items.productId')
      .sort({ createdAt: -1 });

    let result = salesOrders.map(formatSalesOrderListItem);

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        so =>
          so.orderNumber.toLowerCase().includes(s) ||
          so.customer.toLowerCase().includes(s) ||
          so.salesperson.toLowerCase().includes(s)
      );
    }

    return ApiResponse.success(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/sales-orders/:id
 */
exports.getSalesOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let salesOrder;

    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      salesOrder = await SalesOrder.findById(id)
        .populate('customerId')
        .populate('salespersonId')
        .populate('quotationId')
        .populate('items.productId');
    } else {
      salesOrder = await SalesOrder.findOne({ orderNumber: id.toUpperCase() })
        .populate('customerId')
        .populate('salespersonId')
        .populate('quotationId')
        .populate('items.productId');
    }

    if (!salesOrder) {
      return ApiResponse.notFound(res, 'Sales Order not found');
    }

    // Fetch history, fulfillments, backorders, invoices, subscriptions
    const history = await SalesOrderHistory.find({ salesOrderId: salesOrder._id })
      .populate('actorId')
      .sort({ createdAt: 1 });

    const fulfillments = await Fulfillment.find({ salesOrderId: salesOrder._id }).populate('warehouseId');
    const backorders = await Backorder.find({ salesOrderId: salesOrder._id }).populate('productId');
    const invoices = await Invoice.find({ salesOrderId: salesOrder._id });
    const subscriptions = await Subscription.find({ salesOrderId: salesOrder._id }).populate('productId');

    const activities = history.map(h => ({
      title: h.action || `Status changed to ${h.newValue}`,
      time: new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actor: h.actorId?.name || 'System'
    }));

    const cust = salesOrder.customerId || {};
    const formatted = {
      _id: salesOrder._id,
      id: salesOrder.orderNumber,
      orderNumber: salesOrder.orderNumber,
      quotationId: salesOrder.quotationId?._id || salesOrder.quotationId,
      status: salesOrder.status,
      totalAmount: salesOrder.totalAmount,
      totalMargin: salesOrder.totalMargin,
      confirmedAt: salesOrder.confirmedAt,
      customer: {
        _id: cust._id,
        name: cust.name || 'Customer',
        contact: cust.contactPerson || cust.contactName || '',
        email: cust.email || '',
        phone: cust.phone || ''
      },
      salesperson: salesOrder.salespersonId?.name || 'Sales Rep',
      items: salesOrder.items.map((it, idx) => ({
        id: idx + 1,
        _id: it._id,
        quotationItemId: it.quotationItemId,
        productId: it.productId?._id || it.productId,
        product: it.productId?.name || 'Product',
        description: it.productId?.description || '',
        quantity: it.qty,
        unitPrice: it.unitPrice,
        discountPercent: it.discountPercent,
        lineTotal: it.lineTotal,
        lineMargin: it.lineMargin,
        billingType: it.billingType,
        isRecommendation: it.isRecommendation || false
      })),
      activities: activities.length > 0 ? activities : [
        { title: 'Sales Order created', time: new Date(salesOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ],
      fulfillments,
      backorders,
      invoices,
      subscriptions
    };

    return ApiResponse.success(res, formatted);
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/v1/sales-orders/:id/status
 * Enforces strict immutability — only status updates allowed.
 */
exports.updateSalesOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Check for immutability violation
    if (req.body.items || req.body.totalAmount || req.body.customerId || req.body.quotationId) {
      return ApiResponse.badRequest(res, 'Sales Orders are immutable. Pricing, items, and customer details cannot be modified after confirmation.');
    }

    if (!status) {
      return ApiResponse.badRequest(res, 'Status field is required');
    }

    const salesOrder = await SalesOrder.findById(req.params.id);
    if (!salesOrder) return ApiResponse.notFound(res, 'Sales Order not found');

    const actorId = req.user?._id || salesOrder.salespersonId;
    await transitionSalesOrderStatus(salesOrder, status.toUpperCase(), actorId, `SalesOrder status updated to ${status}`);

    return ApiResponse.success(res, salesOrder);
  } catch (err) {
    next(err);
  }
};
