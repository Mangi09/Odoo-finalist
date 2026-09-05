/**
 * Invoice PDF Service
 * Generates clean invoice PDFs using PDFKit.
 */

const PDFDocument = require('pdfkit');
const Invoice = require('../models/Invoice');
const SalesOrder = require('../models/SalesOrder');
const Quotation = require('../models/Quotation');
const Customer = require('../models/Customer');
const Product = require('../models/Product');

/**
 * Generate and stream an invoice PDF to the response.
 * @param {Object} invoice - Invoice document
 * @param {Object} res - Express response object
 */
async function generateInvoicePdf(invoice, res) {
  let salesOrder = null;
  let customer = null;
  let items = [];

  if (invoice.salesOrderId) {
    salesOrder = await SalesOrder.findById(invoice.salesOrderId).populate('customerId').populate('items.productId');
    if (salesOrder) {
      customer = salesOrder.customerId;
      items = salesOrder.items;
    }
  } else if (invoice.quotationId) {
    const quotation = await Quotation.findById(invoice.quotationId).populate('customerId').populate('items.productId');
    if (quotation) {
      customer = quotation.customerId;
      items = quotation.items;
    }
  }

  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${invoice._id}.pdf`);
  doc.pipe(res);

  // ── Header ──
  doc.fontSize(24).font('Helvetica-Bold').text('DealFlow360', 50, 50);
  doc.fontSize(10).font('Helvetica').text('B2B Quote-to-Cash Platform', 50, 78);
  doc.moveTo(50, 100).lineTo(545, 100).stroke('#333');

  // ── Invoice Details ──
  doc.fontSize(18).font('Helvetica-Bold').text('INVOICE', 50, 120);

  doc.fontSize(10).font('Helvetica');
  const detailsTop = 150;
  doc.text(`Invoice #: ${invoice._id.toString().slice(-8).toUpperCase()}`, 50, detailsTop);
  doc.text(`Type: ${invoice.type === 'ONE_TIME' ? 'One-Time' : 'Recurring'}`, 50, detailsTop + 15);
  doc.text(`Issue Date: ${invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : 'N/A'}`, 50, detailsTop + 30);
  doc.text(`Due Date: ${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}`, 50, detailsTop + 45);
  doc.text(`Status: ${invoice.status}`, 50, detailsTop + 60);

  // ── Customer Details ──
  doc.text('Bill To:', 350, detailsTop);
  if (customer) {
    doc.font('Helvetica-Bold').text(customer.companyName || customer.name || 'Customer', 350, detailsTop + 15);
    doc.font('Helvetica').text(customer.contactPerson || customer.contactName || '', 350, detailsTop + 30);
    doc.text(customer.email || '', 350, detailsTop + 45);
    if (customer.phone) doc.text(customer.phone, 350, detailsTop + 60);
  } else {
    doc.text('Customer information unavailable', 350, detailsTop + 15);
  }

  doc.moveTo(50, detailsTop + 85).lineTo(545, detailsTop + 85).stroke('#ccc');

  // ── Line Items Table ──
  const tableTop = detailsTop + 100;
  doc.font('Helvetica-Bold').fontSize(10);
  doc.text('#', 50, tableTop, { width: 30 });
  doc.text('Product', 80, tableTop, { width: 200 });
  doc.text('Qty', 280, tableTop, { width: 50, align: 'center' });
  doc.text('Unit Price', 330, tableTop, { width: 80, align: 'right' });
  doc.text('Discount', 410, tableTop, { width: 60, align: 'right' });
  doc.text('Total', 470, tableTop, { width: 75, align: 'right' });

  doc.moveTo(50, tableTop + 15).lineTo(545, tableTop + 15).stroke('#ccc');

  doc.font('Helvetica').fontSize(9);

  if (items && items.length > 0) {
    let y = tableTop + 25;
    let idx = 1;

    for (const item of items) {
      const product = item.productId && item.productId.name ? item.productId : await Product.findById(item.productId);
      const productName = product ? product.name : 'Product';
      const itemBillingType = item.billingType || (product ? product.billingType : 'ONE_TIME');

      // Filter items based on invoice type
      if (invoice.type === 'ONE_TIME' && itemBillingType !== 'ONE_TIME') continue;
      if (invoice.type === 'RECURRING' && itemBillingType !== 'RECURRING') continue;

      doc.text(idx.toString(), 50, y, { width: 30 });
      doc.text(productName, 80, y, { width: 200 });
      doc.text(item.qty.toString(), 280, y, { width: 50, align: 'center' });
      doc.text(`₹${(item.unitPrice || 0).toLocaleString('en-IN')}`, 330, y, { width: 80, align: 'right' });
      doc.text(`${item.discountPercent || 0}%`, 410, y, { width: 60, align: 'right' });
      doc.text(`₹${(item.lineTotal || 0).toLocaleString('en-IN')}`, 470, y, { width: 75, align: 'right' });

      y += 20;
      idx++;

      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    }

    // ── Total ──
    doc.moveTo(50, y + 5).lineTo(545, y + 5).stroke('#ccc');
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Total Amount:', 350, y + 15, { width: 120, align: 'right' });
    doc.text(`₹${(invoice.amount || 0).toLocaleString('en-IN')}`, 470, y + 15, { width: 75, align: 'right' });
  } else {
    doc.text('No line items available', 50, tableTop + 25);
    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Total:', 350, tableTop + 50, { width: 120, align: 'right' });
    doc.text(`₹${(invoice.amount || 0).toLocaleString('en-IN')}`, 470, tableTop + 50, { width: 75, align: 'right' });
  }

  // ── Footer ──
  doc.fontSize(8).font('Helvetica').fillColor('#999');
  doc.text(
    'This is a computer-generated invoice. No signature required.',
    50,
    doc.page.height - 60,
    { align: 'center', width: 495 }
  );
  doc.text(
    `Generated on ${new Date().toLocaleString()}`,
    50,
    doc.page.height - 45,
    { align: 'center', width: 495 }
  );

  doc.end();
}

module.exports = { generateInvoicePdf };
