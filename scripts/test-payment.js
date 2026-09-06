require('dotenv').config();
const mongoose = require('mongoose');
const { Invoice, Quotation } = require('../models');
const { createOrder, verifySignature } = require('../services/paymentService');

async function testPayment() {
  const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/odoo';
  console.log(`\nConnecting to MongoDB (${connStr})...`);
  await mongoose.connect(connStr);

  console.log('--- Testing Razorpay Payment Flow in Test/Mock Mode ---\n');

  // Find an existing invoice or use a mock invoice
  let invoice = await Invoice.findOne({ status: 'ISSUED' });
  if (!invoice) {
    invoice = await Invoice.findOne();
  }

  if (!invoice) {
    console.log('No invoice found. Creating a test quotation & invoice...');
    const q = await Quotation.create({
      customerId: new mongoose.Types.ObjectId(),
      salespersonId: new mongoose.Types.ObjectId(),
      title: 'Test Deal for Payment',
      status: 'BILLED',
      totalAmount: 5000
    });
    invoice = await Invoice.create({
      quotationId: q._id,
      type: 'ONE_TIME',
      amount: 5000,
      status: 'ISSUED'
    });
  }

  console.log(`1. Target Invoice: ${invoice._id} (Amount: ₹${invoice.amount}, Status: ${invoice.status})`);

  // Step 1: Create Order
  console.log('\n2. Calling paymentService.createOrder()...');
  const orderResult = await createOrder(invoice);
  console.log('   ✓ Order Created:', orderResult);

  // Step 2: Verify Signature
  console.log('\n3. Verifying signature (Test / Mock Verification)...');
  const mockPaymentId = `pay_${Date.now()}`;
  const isSignatureValid = verifySignature(orderResult.orderId, mockPaymentId, 'mock_signature');
  console.log(`   ✓ Signature Verification Result: ${isSignatureValid ? 'VALID' : 'INVALID'}`);

  console.log('\n--- Razorpay Test Completed Successfully! ---\n');
  process.exit(0);
}

testPayment().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
