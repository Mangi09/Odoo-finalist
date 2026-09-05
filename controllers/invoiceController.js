const Invoice = require('../models/Invoice');
const Quotation = require('../models/Quotation');
const Payment = require('../models/Payment');
const { generateInvoicePdf } = require('../services/invoicePdfService');
const { transitionStatus } = require('../utils/stateMachine');
const ApiResponse = require('../utils/apiResponse');

function formatInvoice(inv) {
  const quote = inv.quotationId || {};
  const cust = quote.customerId || {};

  const customerName = cust.companyName || cust.name || 'Acme Corp';
  const dueDateStr = inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Net 30';

  const statusDisplay = inv.status === 'PAID' ? 'Paid' : 'Unpaid';
  const typeDisplay = inv.type === 'ONE_TIME' ? 'One-Time' : 'Recurring';

  return {
    _id: inv._id,
    id: `INV-${inv._id.toString().slice(-4).toUpperCase()}`,
    customer: customerName,
    amount: `$${inv.amount?.toLocaleString() || 0}`,
    rawAmount: inv.amount,
    status: statusDisplay,
    dueDate: dueDateStr,
    type: typeDisplay,
    issueDate: inv.issueDate,
    quotationId: quote._id,
    linkedDeal: quote.quotationNumber || (quote._id ? `Q-${quote._id.toString().slice(-4).toUpperCase()}` : 'Q-1042')
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

    const invoices = await Invoice.find(filter)
      .populate({
        path: 'quotationId',
        populate: { path: 'customerId' }
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
      invoice = await Invoice.findById(id).populate({
        path: 'quotationId',
        populate: [{ path: 'customerId' }, { path: 'items.productId' }]
      });
    } else {
      const all = await Invoice.find().populate({
        path: 'quotationId',
        populate: [{ path: 'customerId' }, { path: 'items.productId' }]
      });
      invoice = all.find(inv => `INV-${inv._id.toString().slice(-4).toUpperCase()}` === id.toUpperCase());
    }

    if (!invoice) return ApiResponse.notFound(res, 'Invoice not found');

    const payments = await Payment.find({ invoiceId: invoice._id }).sort({ createdAt: -1 });

    const quote = invoice.quotationId || {};
    const cust = quote.customerId || {};

    const formatted = {
      _id: invoice._id,
      id: `INV-${invoice._id.toString().slice(-4).toUpperCase()}`,
      customer: cust.companyName || cust.name || 'Acme Corporation',
      linkedDeal: quote.quotationNumber || (quote._id ? `Q-${quote._id.toString().slice(-4).toUpperCase()}` : 'Q-1042'),
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

    const payment = await Payment.create({
      invoiceId: invoice._id,
      amount: amount || invoice.amount,
      method: method || 'MANUAL',
      reference: reference || `MAN-${Date.now()}`,
      status: 'CAPTURED'
    });

    invoice.status = 'PAID';
    await invoice.save();

    // Check if quotation can transition to PAID
    const quotation = await Quotation.findById(invoice.quotationId);
    if (quotation && (quotation.status === 'BILLED' || quotation.status === 'FULFILLMENT')) {
      const remainingUnpaid = await Invoice.countDocuments({
        quotationId: quotation._id,
        status: { $ne: 'PAID' }
      });
      if (remainingUnpaid === 0) {
        const actorId = req.user?._id || quotation.salespersonId;
        await transitionStatus(quotation, 'PAID', actorId, 'All invoices paid in full');
      }
    }

    return ApiResponse.created(res, { payment, invoice });
  } catch (err) {
    next(err);
  }
};
