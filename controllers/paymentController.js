const Invoice = require('../models/Invoice');
const Quotation = require('../models/Quotation');
const Payment = require('../models/Payment');
const { createOrder, verifySignature, verifyWebhookSignature } = require('../services/paymentService');
const { transitionStatus } = require('../utils/stateMachine');
const ApiResponse = require('../utils/apiResponse');

/**
 * POST /api/v1/payments/create-order
 * Body: { invoiceId }
 */
exports.createPaymentOrder = async (req, res, next) => {
  try {
    const { invoiceId } = req.body;
    if (!invoiceId) return ApiResponse.badRequest(res, 'invoiceId is required');

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return ApiResponse.notFound(res, 'Invoice not found');

    const order = await createOrder(invoice);
    return ApiResponse.success(res, order);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/payments/verify
 * Body: { invoiceId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    const { invoiceId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    if (!invoiceId || !razorpayPaymentId) {
      return ApiResponse.badRequest(res, 'invoiceId and razorpayPaymentId are required');
    }

    const isValid = verifySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!isValid) {
      return ApiResponse.badRequest(res, 'Invalid payment signature');
    }

    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) return ApiResponse.notFound(res, 'Invoice not found');

    const payment = await Payment.create({
      invoiceId: invoice._id,
      amount: invoice.amount,
      method: 'CARD',
      status: 'SUCCESS',
      paidAt: new Date(),
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      reference: razorpayPaymentId
    });

    invoice.status = 'PAID';
    await invoice.save();

    // Check if quotation can move to PAID
    const quotation = await Quotation.findById(invoice.quotationId);
    if (quotation && (quotation.status === 'BILLED' || quotation.status === 'FULFILLMENT')) {
      const unpaidInvoices = await Invoice.countDocuments({
        quotationId: quotation._id,
        status: { $ne: 'PAID' }
      });
      if (unpaidInvoices === 0) {
        const actorId = req.user?._id || quotation.salespersonId;
        await transitionStatus(quotation, 'PAID', actorId, 'Full payment received via Razorpay');
      }
    }

    return ApiResponse.success(res, {
      message: 'Payment verified and recorded successfully',
      payment,
      invoice
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/payments/webhook
 */
exports.handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const isValid = verifyWebhookSignature(req.body, signature);
    if (!isValid) {
      return ApiResponse.unauthorized(res, 'Invalid webhook signature');
    }

    const event = req.body.event;
    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload?.payment?.entity;
      if (paymentEntity && paymentEntity.notes?.invoiceId) {
        const invoiceId = paymentEntity.notes.invoiceId;
        const invoice = await Invoice.findById(invoiceId);
        if (invoice) {
          invoice.status = 'PAID';
          await invoice.save();

          await Payment.create({
            invoiceId: invoice._id,
            amount: paymentEntity.amount / 100,
            method: paymentEntity.method ? paymentEntity.method.toUpperCase() : 'CARD',
            status: 'SUCCESS',
            paidAt: new Date(),
            razorpayPaymentId: paymentEntity.id,
            reference: paymentEntity.id
          });
        }
      }
    }

    return ApiResponse.success(res, { received: true });
  } catch (err) {
    next(err);
  }
};
