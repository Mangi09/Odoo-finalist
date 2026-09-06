const Invoice = require('../models/Invoice');
const SalesOrder = require('../models/SalesOrder');
const Customer = require('../models/Customer');
const Payment = require('../models/Payment');
const { generateInvoicePdf } = require('../services/invoicePdfService');
const { transitionSalesOrderStatus } = require('../utils/stateMachine');
const ApiResponse = require('../utils/apiResponse');

async function requireInvoiceCustomerAccess(req, invoice) {
  if (req.user?.role !== 'customer') return true;
  const order = await SalesOrder.findById(invoice.salesOrderId, 'customerId');
  return order?.customerId?.toString() === req.user.customerId;
}

async function requireInvoiceSalespersonAccess(req, invoice) {
  if (!['salesperson', 'sales_manager'].includes(req.user?.role)) return true;
  const order = await SalesOrder.findById(invoice.salesOrderId, 'customerId');
  return Boolean(order && await Customer.exists({ _id: order.customerId, salespersonId: req.user.id }));
}

function formatInvoice(inv) {
  const order = inv.salesOrderId || {};
  const cust = order.customerId || {};

  const customerName = cust.companyName || cust.name || 'Customer Corp';
  const dueDateStr = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Net 30';

  const statusDisplay = inv.status === 'PAID' ? 'Paid' : 'Unpaid';
  const typeDisplay = inv.type === 'ONE_TIME' ? 'One-Time' : 'Recurring';
  const linkedDeal = order.orderNumber || 'SO-2026-0001';
  const salesperson = order.salespersonId?.name || 'Unassigned';

  return {
    _id: inv._id,
    id: `INV-${inv._id.toString().slice(-4).toUpperCase()}`,
    customer: customerName,
    salesperson,
    amount: `₹${inv.amount?.toLocaleString('en-IN') || 0}`,
    rawAmount: inv.amount,
    status: statusDisplay,
    dueDate: dueDateStr,
    type: typeDisplay,
    issueDate: inv.issueDate,
    salesOrderId: order._id || null,
    linkedDeal
  };
}

/**
 * GET /api/v1/invoices
 */
exports.getInvoices = async (req, res, next) => {
  try {
    const { status, type } = req.query;
    const filter = {};
    if (status) filter.status = status.toUpperCase();
    if (type) filter.type = type.toUpperCase();

    if (req.user && ['salesperson', 'sales_manager'].includes(req.user.role)) {
      const assignedCustomers = await Customer.find({ salespersonId: req.user.id }, '_id');
      const myOrders = await SalesOrder.find({ customerId: { $in: assignedCustomers.map(customer => customer._id) } }, '_id');
      filter.salesOrderId = { $in: myOrders.map(o => o._id) };
    } else if (req.user && req.user.role === 'customer') {
      const myOrders = await SalesOrder.find({ customerId: req.user.customerId }, '_id');
      filter.salesOrderId = { $in: myOrders.map(o => o._id) };
    }

    const invoices = await Invoice.find(filter)
      .populate({
        path: 'salesOrderId',
        populate: [{ path: 'customerId' }, { path: 'salespersonId' }]
      })
      .sort({ createdAt: -1 });

    return ApiResponse.success(res, invoices.map(formatInvoice));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/invoices/:id
 */
exports.getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let invoice;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      invoice = await Invoice.findById(id)
        .populate({
          path: 'salesOrderId',
          populate: [{ path: 'customerId' }, { path: 'items.productId' }, { path: 'salespersonId' }]
        });
    } else {
      const all = await Invoice.find()
        .populate({
          path: 'salesOrderId',
          populate: [{ path: 'customerId' }, { path: 'items.productId' }]
        });
      invoice = all.find(inv => `INV-${inv._id.toString().slice(-4).toUpperCase()}` === id.toUpperCase());
    }

    if (!invoice) return ApiResponse.notFound(res, 'Invoice not found');
    if (!(await requireInvoiceCustomerAccess(req, invoice))) return ApiResponse.forbidden(res, 'Access denied. This invoice belongs to another customer.');
    if (!(await requireInvoiceSalespersonAccess(req, invoice))) return ApiResponse.forbidden(res, 'Access denied. This customer is not assigned to you.');

    const payments = await Payment.find({ invoiceId: invoice._id }).sort({ createdAt: -1 });
    const order = invoice.salesOrderId || {};
    const cust = order.customerId || {};

    const formatted = {
      _id: invoice._id,
      id: `INV-${invoice._id.toString().slice(-4).toUpperCase()}`,
      customer: cust.companyName || cust.name || 'Customer Corp',
      linkedDeal: order.orderNumber || 'SO-2026-0001',
      amount: invoice.amount,
      invoiceDate: invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '10 Sep 2026',
      dueDate: invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '18 Sep 2026',
      status: invoice.status === 'PAID' ? 'Paid' : 'Emailed',
      paymentTerms: 'Net 30',
      payments: payments.map(p => ({
        id: p._id,
        amount: p.amount,
        method: p.method,
        reference: p.reference,
        status: p.status,
        date: p.createdAt
      })),
      activities: [
        { title: 'Invoice created', time: invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'Recent' },
        { title: 'Invoice posted', time: invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'Recent' },
        { title: 'Invoice emailed to customer', time: invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'Recent' }
      ]
    };

    return ApiResponse.success(res, formatted);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/invoices/:id/pdf
 */
exports.getInvoicePdf = async (req, res, next) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return ApiResponse.notFound(res, 'Invoice not found');
    if (!(await requireInvoiceCustomerAccess(req, invoice))) return ApiResponse.forbidden(res, 'Access denied. This invoice belongs to another customer.');
    if (!(await requireInvoiceSalespersonAccess(req, invoice))) return ApiResponse.forbidden(res, 'Access denied. This customer is not assigned to you.');

    await generateInvoicePdf(invoice, res);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/invoices/:id/payments
 */
exports.recordPayment = async (req, res, next) => {
  try {
    const { amount, method, reference } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return ApiResponse.notFound(res, 'Invoice not found');
    if (!(await requireInvoiceCustomerAccess(req, invoice))) return ApiResponse.forbidden(res, 'Access denied. This invoice belongs to another customer.');
    if (!(await requireInvoiceSalespersonAccess(req, invoice))) return ApiResponse.forbidden(res, 'Access denied. This customer is not assigned to you.');
    if (['salesperson', 'sales_manager'].includes(req.user?.role)) return ApiResponse.forbidden(res, 'This role has read-only invoice access');

    const payment = await Payment.create({
      invoiceId: invoice._id,
      amount: amount || invoice.amount,
      method: method || 'OTHER',
      reference: reference || `MAN-${Date.now()}`,
      status: 'SUCCESS'
    });

    invoice.status = 'PAID';
    await invoice.save();

    // Check if SalesOrder can transition to PAID
    if (invoice.salesOrderId) {
      const salesOrder = await SalesOrder.findById(invoice.salesOrderId);
      if (salesOrder && (salesOrder.status === 'BILLED' || salesOrder.status === 'IN_FULFILLMENT')) {
        const remainingUnpaid = await Invoice.countDocuments({
          salesOrderId: salesOrder._id,
          status: { $ne: 'PAID' }
        });
        if (remainingUnpaid === 0) {
          const actorId = req.user?._id || salesOrder.salespersonId;
          await transitionSalesOrderStatus(salesOrder, 'PAID', actorId, 'All invoices paid in full');
        }
      }
    }

    return ApiResponse.created(res, { payment, invoice });
  } catch (err) {
    next(err);
  }
};
