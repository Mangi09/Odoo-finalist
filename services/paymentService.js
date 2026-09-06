const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const logger = require('../utils/logger');

/**
 * Create a payment order for an invoice.
 * @param {Object} invoice - Invoice document
 * @returns {Promise<Object>} - Order details
 */
async function createOrder(invoice) {
  const amountInPaise = Math.round((invoice.amount || 100) * 100);

  if (razorpay) {
    try {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `inv_${invoice._id}`,
        notes: {
          invoiceId: invoice._id.toString(),
          quotationId: invoice.quotationId?.toString()
        }
      });
      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      };
    } catch (err) {
      logger.error('Razorpay order creation failed, falling back to mock order:', err);
    }
  }

  // Mock order for dev/demo without credentials
  return {
    orderId: `order_mock_${Date.now()}`,
    amount: amountInPaise,
    currency: 'INR',
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock',
    mock: true
  };
}

/**
 * Verify Razorpay payment signature
 * @param {string} orderId
 * @param {string} paymentId
 * @param {string} signature
 * @returns {boolean}
 */
function verifySignature(orderId, paymentId, signature) {
  if (!process.env.RAZORPAY_KEY_SECRET) {
    // If running in development without secret, accept mock signatures
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  return generatedSignature === signature;
}

/**
 * Verify Webhook signature
 * @param {string} body - Raw request body
 * @param {string} signature - Header signature
 * @returns {boolean}
 */
function verifyWebhookSignature(body, signature) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return true;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(typeof body === 'string' ? body : JSON.stringify(body))
    .digest('hex');

  return expectedSignature === signature;
}

module.exports = {
  createOrder,
  verifySignature,
  verifyWebhookSignature
};
