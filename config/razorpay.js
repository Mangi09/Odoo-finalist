const Razorpay = require('razorpay');
const logger = require('../utils/logger');

let razorpayInstance = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
  logger.info('Razorpay initialized successfully');
} else {
  logger.warn('Razorpay keys not configured in environment; mock mode enabled');
}

module.exports = razorpayInstance;
