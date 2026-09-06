require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const {
  User,
  CustomerTier,
  Customer,
  Category,
  Product,
  DiscountRule,
  Quotation,
  Approval,
  Recommendation,
  Warehouse,
  Inventory,
  Fulfillment,
  Backorder,
  Negotiation,
  Subscription,
  Invoice,
  Payment,
  DealHealth,
  QuotationHistory,
  SalesOrder,
  SalesOrderHistory,
} = require('../models');

const companyPrefixes = ['Nova', 'Apex', 'Vertex', 'BluePeak', 'Quantum', 'Sterling', 'Metro', 'Orion', 'Summit', 'Pioneer', 'Nexus', 'Evergreen'];
const companySuffixes = ['Systems', 'Retail', 'Logistics', 'Foods', 'Pharma', 'Industries', 'Networks', 'Labs', 'Technologies', 'Holdings'];
const contactNames = ['Anika Rao', 'Rohan Mehta', 'Priya Sharma', 'Kabir Sethi', 'Neha Iyer', 'Arjun Kapoor', 'Meera Nair', 'Vikram Jain'];
const quoteStatuses = ['DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT_TO_CUSTOMER', 'NEGOTIATION', 'RE_APPROVAL', 'ACCEPTED', 'REJECTED', 'CANCELLED'];
const orderStatuses = ['CONFIRMED', 'IN_FULFILLMENT', 'PARTIALLY_FULFILLED', 'BILLED', 'PAID', 'CLOSED'];

function pick(arr, idx) {
  return arr[idx % arr.length];
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function buildItem(product, idx) {
  const qty = (idx % 6) + 1;
  const discountPercent = [0, 3, 5, 8, 12, 15, 18][idx % 7];
  const unitPrice = product.sellingPrice;
  const discountedUnit = unitPrice * (1 - discountPercent / 100);
  return {
    productId: product._id,
    qty,
    unitPrice,
    discountPercent,
    lineTotal: Math.round(discountedUnit * qty),
    lineMargin: Math.round((discountedUnit - product.cost) * qty),
    isRecommendation: idx % 5 === 0,
  };
}

async function seed() {
  const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/odoo';
  console.log(`Connecting to MongoDB at ${connStr}...`);
  await mongoose.connect(connStr);

  const collections = [
    User, CustomerTier, Customer, Category, Product, DiscountRule,
    Quotation, Approval, Recommendation, Warehouse, Inventory,
    Fulfillment, Backorder, Negotiation, Subscription, Invoice,
    Payment, DealHealth, QuotationHistory, SalesOrder, SalesOrderHistory
  ];

  console.log('Clearing existing collections...');
  for (const col of collections) await col.deleteMany({});

  const passwordHash = await bcrypt.hash('password123', 10);
  const [bronze, silver, gold] = await CustomerTier.create([
    { name: 'Bronze', maxDiscountPercent: 5 },
    { name: 'Silver', maxDiscountPercent: 10 },
    { name: 'Gold', maxDiscountPercent: 15 },
  ]);

  const categories = await Category.create([
    { name: 'Hardware' },
    { name: 'Services' },
    { name: 'Subscription' },
    { name: 'Cloud' },
    { name: 'Software' },
    { name: 'Networking' },
  ]);
  const categoryByName = Object.fromEntries(categories.map(c => [c.name, c]));

  const products = await Product.create([
    { name: 'Laptop Pro 14', categoryId: categoryByName.Hardware._id, cost: 900, sellingPrice: 1200, billingType: 'ONE_TIME' },
    { name: 'NovaBook Ultra 16', categoryId: categoryByName.Hardware._id, cost: 1400, sellingPrice: 1850, billingType: 'ONE_TIME' },
    { name: 'Docking Station', categoryId: categoryByName.Hardware._id, cost: 110, sellingPrice: 180, billingType: 'ONE_TIME' },
    { name: 'NovaMonitor 27', categoryId: categoryByName.Hardware._id, cost: 210, sellingPrice: 320, billingType: 'ONE_TIME' },
    { name: 'NovaSwitch 24-Port', categoryId: categoryByName.Networking._id, cost: 250, sellingPrice: 380, billingType: 'ONE_TIME' },
    { name: 'SecureRouter Edge', categoryId: categoryByName.Networking._id, cost: 420, sellingPrice: 680, billingType: 'ONE_TIME' },
    { name: 'Enterprise Analytics Suite', categoryId: categoryByName.Software._id, cost: 1800, sellingPrice: 3500, billingType: 'ONE_TIME' },
    { name: 'Identity Shield License', categoryId: categoryByName.Software._id, cost: 85, sellingPrice: 190, billingType: 'RECURRING', frequency: 'YEARLY' },
    { name: 'NovaCloud Pro', categoryId: categoryByName.Cloud._id, cost: 120, sellingPrice: 299, billingType: 'RECURRING', frequency: 'MONTHLY' },
    { name: 'Managed Backup Vault', categoryId: categoryByName.Cloud._id, cost: 80, sellingPrice: 210, billingType: 'RECURRING', frequency: 'MONTHLY' },
    { name: 'Onsite Setup Service', categoryId: categoryByName.Services._id, cost: 200, sellingPrice: 450, billingType: 'ONE_TIME' },
    { name: 'Migration Workshop', categoryId: categoryByName.Services._id, cost: 650, sellingPrice: 1200, billingType: 'ONE_TIME' },
    { name: 'Care Plan 3 years', categoryId: categoryByName.Subscription._id, cost: 15, sellingPrice: 40, billingType: 'RECURRING', frequency: 'MONTHLY' },
    { name: 'Premium Support SLA', categoryId: categoryByName.Subscription._id, cost: 200, sellingPrice: 500, billingType: 'RECURRING', frequency: 'MONTHLY' },
    { name: 'Quarterly Success Plan', categoryId: categoryByName.Subscription._id, cost: 420, sellingPrice: 900, billingType: 'RECURRING', frequency: 'QUARTERLY' },
    { name: 'Extended Warranty 2yr', categoryId: categoryByName.Services._id, cost: 40, sellingPrice: 99, billingType: 'ONE_TIME' },
  ]);

  await DiscountRule.create([
    ...[bronze, silver, gold].flatMap((tier, tierIdx) =>
      categories.map((category, catIdx) => ({
        tierId: tier._id,
        categoryId: category._id,
        maxDiscountPercent: [5, 10, 15][tierIdx] + (catIdx % 2 === 0 ? 0 : 3),
        approvalLevel: tierIdx === 2 ? 2 : 1,
        active: true,
      }))
    )
  ]);

  const warehouses = await Warehouse.create([
    { name: 'Mumbai Central DC', location: 'Mumbai, MH', priority: 1 },
    { name: 'Bengaluru Tech Hub', location: 'Bengaluru, KA', priority: 2 },
    { name: 'Delhi NCR Fulfillment', location: 'Gurugram, HR', priority: 3 },
    { name: 'Pune Returns Annex', location: 'Pune, MH', priority: 4 },
    { name: 'Hyderabad Cloud Depot', location: 'Hyderabad, TS', priority: 5 },
  ]);

  const physicalProducts = products.filter(p => p.billingType === 'ONE_TIME');
  for (const warehouse of warehouses) {
    for (const product of physicalProducts) {
      await Inventory.create({
        warehouseId: warehouse._id,
        productId: product._id,
        availableQty: 80 + ((warehouse.priority + product.name.length) % 9) * 12,
        reservedQty: (warehouse.priority + product.name.length) % 8,
      });
    }
  }

  const users = await User.create([
    { name: 'Admin User', email: 'admin@dealflow360.com', passwordHash, role: 'admin' },
    { name: 'M. Shah', email: 'manager@dealflow360.com', passwordHash, role: 'sales_manager' },
    { name: 'Dwithi Poojary', email: 'dwithi.manager@dealflow360.com', passwordHash, role: 'sales_manager' },
    { name: 'Finance Ops', email: 'finance@dealflow360.com', passwordHash, role: 'finance_ops' },
    { name: 'Atharva K.', email: 'atharva@dealflow360.com', passwordHash, role: 'salesperson' },
    { name: 'Vibha M.', email: 'vibha@dealflow360.com', passwordHash, role: 'salesperson' },
    { name: 'Rhea Menon', email: 'rhea@dealflow360.com', passwordHash, role: 'salesperson' },
    { name: 'Kunal Desai', email: 'kunal@dealflow360.com', passwordHash, role: 'salesperson' },
    { name: 'Sara Fernandes', email: 'sara@dealflow360.com', passwordHash, role: 'salesperson' },
  ]);
  const admin = users.find(u => u.role === 'admin');
  const managers = users.filter(u => u.role === 'sales_manager');
  const sellers = users.filter(u => ['salesperson', 'sales_manager'].includes(u.role));

  const tiers = [bronze, silver, gold];
  const customers = [];
  for (let i = 0; i < 96; i += 1) {
    const companyName = `${pick(companyPrefixes, i)} ${pick(companySuffixes, i * 3)}`;
    const customer = await Customer.create({
      companyName: `${companyName} ${String(i + 1).padStart(2, '0')}`,
      contactName: pick(contactNames, i),
      email: `buyer${i + 1}@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      phone: `+91 98${String(10000000 + i * 739).slice(0, 8)}`,
      tierId: pick(tiers, i)._id,
      salespersonId: pick(sellers, i)._id,
      portalEnabled: i % 3 !== 0,
      createdAt: daysAgo(140 - (i % 80)),
    });
    customers.push(customer);
  }

  const portalCustomers = customers.filter(c => c.portalEnabled).slice(0, 30);
  for (let i = 0; i < portalCustomers.length; i += 1) {
    await User.create({
      name: portalCustomers[i].contactName,
      email: `customer${i + 1}@dealflow360.com`,
      passwordHash,
      role: 'customer',
      customerId: portalCustomers[i]._id,
    });
  }

  const quotations = [];
  for (let i = 0; i < 260; i += 1) {
    const customer = pick(customers, i * 5);
    const status = pick(quoteStatuses, i);
    const lineCount = 2 + (i % 3);
    const items = [];
    for (let j = 0; j < lineCount; j += 1) {
      items.push(buildItem(pick(products, i + j * 4), i + j));
    }
    const totalAmount = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const totalMargin = items.reduce((sum, item) => sum + item.lineMargin, 0);
    const quote = await Quotation.create({
      customerId: customer._id,
      salespersonId: customer.salespersonId,
      title: `${customer.companyName} ${pick(['Workspace Refresh', 'Cloud Expansion', 'Security Rollout', 'Support Renewal'], i)}`,
      status,
      items,
      totalAmount,
      totalMargin,
      riskScore: (i * 13) % 100,
      isArchived: i % 37 === 0,
      archivedAt: i % 37 === 0 ? daysAgo(i % 20) : null,
      archivedBy: i % 37 === 0 ? admin._id : null,
      createdAt: daysAgo(120 - (i % 90)),
      updatedAt: daysAgo(20 - (i % 20)),
    });
    quotations.push(quote);

    await QuotationHistory.create({
      quotationId: quote._id,
      actorId: customer.salespersonId,
      action: 'Quotation created in DRAFT',
      oldValue: null,
      newValue: 'DRAFT',
      createdAt: quote.createdAt,
    });
    if (status !== 'DRAFT') {
      await QuotationHistory.create({
        quotationId: quote._id,
        actorId: customer.salespersonId,
        action: `Quotation moved to ${status}`,
        oldValue: 'DRAFT',
        newValue: status,
        createdAt: daysAgo(90 - (i % 70)),
      });
    }

    if (['PENDING_APPROVAL', 'RE_APPROVAL', 'REJECTED'].includes(status) || i % 6 === 0) {
      await Approval.create({
        quotationId: quote._id,
        quotationItemId: quote.items[0]._id,
        approverId: pick(managers, i)._id,
        level: quote.items[0].discountPercent > 12 ? 2 : 1,
        requestedDiscountPercent: quote.items[0].discountPercent,
        allowedDiscountPercent: pick(tiers, i).maxDiscountPercent,
        status: status === 'REJECTED' ? 'REJECTED' : (i % 8 === 0 ? 'APPROVED' : 'PENDING'),
        reason: quote.items[0].discountPercent > 12 ? 'Discount exceeds tier threshold' : 'Standard manager review',
        decidedAt: status === 'REJECTED' || i % 8 === 0 ? daysAgo(i % 18) : null,
      });
    }

    if (['SENT_TO_CUSTOMER', 'NEGOTIATION', 'RE_APPROVAL'].includes(status) || i % 7 === 0) {
      await Negotiation.create({
        quotationId: quote._id,
        customerId: customer._id,
        type: i % 2 === 0 ? 'COUNTER_OFFER' : 'CHANGE_REQUEST',
        message: pick(['Requesting rollout in two phases', 'Need extended payment terms', 'Can we add support coverage?', 'Please revise hardware quantities'], i),
        status: i % 5 === 0 ? 'APPROVED' : 'PENDING',
        items: [{
          quotationItemId: quote.items[0]._id,
          productId: quote.items[0].productId,
          requestedQty: quote.items[0].qty + 1,
          requestedDiscountPercent: Math.min(quote.items[0].discountPercent + 2, 25),
          action: 'MODIFY',
        }],
      });
    }

    const healthScore = 35 + ((i * 17) % 65);
    await DealHealth.create({
      quotationId: quote._id,
      score: healthScore,
      status: healthScore < 45 ? 'CRITICAL' : healthScore < 70 ? 'AT_RISK' : 'HEALTHY',
      riskFactors: healthScore < 70 ? [status === 'PENDING_APPROVAL' ? 'Approval pending' : 'Low recent activity', 'Margin or timing needs review'] : [],
    });

    if (i % 4 === 0) {
      await Recommendation.create({
        quotationId: quote._id,
        productId: pick(products, i + 3)._id,
        type: i % 8 === 0 ? 'UPSELL' : 'CROSS_SELL',
        reason: 'Frequently attached to similar customer deployments',
        marginImpact: 12 + (i % 20),
        status: i % 6 === 0 ? 'ACCEPTED' : 'PENDING',
      });
    }
  }

  const orderQuotes = quotations.filter(q => !q.isArchived).slice(0, 225);
  const recurringProducts = products.filter(p => p.billingType === 'RECURRING');

  for (let i = 0; i < orderQuotes.length; i += 1) {
    const quote = orderQuotes[i];
    if (quote.status !== 'ACCEPTED') {
      quote.status = 'ACCEPTED';
      await quote.save();
    }
    const order = await SalesOrder.create({
      orderNumber: `SO-${new Date().getFullYear()}-${String(1000 + i).padStart(4, '0')}`,
      quotationId: quote._id,
      customerId: quote.customerId,
      salespersonId: quote.salespersonId,
      items: quote.items.map(item => {
        const product = products.find(p => p._id.toString() === item.productId.toString());
        return {
          quotationItemId: item._id,
          productId: item.productId,
          qty: item.qty,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          lineTotal: item.lineTotal,
          lineMargin: item.lineMargin,
          billingType: product?.billingType || 'ONE_TIME',
          isRecommendation: item.isRecommendation,
        };
      }),
      totalAmount: quote.totalAmount,
      totalMargin: quote.totalMargin,
      status: pick(orderStatuses, i),
      confirmedAt: daysAgo(75 - (i % 50)),
      createdAt: daysAgo(75 - (i % 50)),
    });

    await SalesOrderHistory.create({
      salesOrderId: order._id,
      actorId: quote.salespersonId,
      action: 'Sales Order created from accepted quotation',
      oldValue: null,
      newValue: 'CONFIRMED',
      createdAt: order.createdAt,
    });

    for (const item of order.items) {
      const product = products.find(p => p._id.toString() === item.productId.toString());
      if (product?.billingType === 'ONE_TIME') {
        const warehouse = pick(warehouses, i + item.qty);
        if (i % 10 === 0 && item.qty > 3) {
          await Backorder.create({
            salesOrderId: order._id,
            salesOrderItemId: item._id,
            productId: item.productId,
            pendingQty: 1,
            status: 'PENDING',
          });
        }
        await Fulfillment.create({
          salesOrderId: order._id,
          salesOrderItemId: item._id,
          warehouseId: warehouse._id,
          allocatedQty: Math.max(1, item.qty - (i % 10 === 0 ? 1 : 0)),
          status: pick(['RESERVED', 'SHIPPED', 'DELIVERED'], i + item.qty),
        });
      }
    }

    const subscriptionProduct = pick(recurringProducts, i);
    const subscriptionAmount = Math.round(subscriptionProduct.sellingPrice * (1 + (i % 4)));
    const subscription = await Subscription.create({
      salesOrderId: order._id,
      salesOrderItemId: order.items[0]._id,
      productId: subscriptionProduct._id,
      frequency: subscriptionProduct.frequency || pick(['MONTHLY', 'QUARTERLY', 'YEARLY'], i),
      amount: subscriptionAmount,
      startDate: daysAgo(60 - (i % 45)),
      endDate: i % 13 === 0 ? daysFromNow(180 + (i % 90)) : null,
      status: pick(['ACTIVE', 'ACTIVE', 'ACTIVE', 'PAUSED', 'CANCELLED', 'EXPIRED'], i),
    });

    await Invoice.create({
      salesOrderId: order._id,
      type: i % 3 === 0 ? 'RECURRING' : 'ONE_TIME',
      amount: i % 3 === 0 ? subscription.amount : order.totalAmount,
      status: pick(['DRAFT', 'ISSUED', 'ISSUED', 'PAID', 'OVERDUE', 'CANCELLED'], i),
      issueDate: daysAgo(55 - (i % 45)),
      dueDate: i % 7 === 0 ? daysAgo(2 + (i % 12)) : daysFromNow(7 + (i % 30)),
    });

    await DealHealth.create({
      salesOrderId: order._id,
      score: 40 + ((i * 19) % 60),
      status: i % 9 === 0 ? 'CRITICAL' : i % 4 === 0 ? 'AT_RISK' : 'HEALTHY',
      riskFactors: i % 4 === 0 ? ['Fulfillment or payment requires follow-up'] : [],
    });
  }

  const paidInvoices = await Invoice.find({ status: 'PAID' }).limit(90);
  for (let i = 0; i < paidInvoices.length; i += 1) {
    await Payment.create({
      invoiceId: paidInvoices[i]._id,
      amount: paidInvoices[i].amount,
      method: pick(['CARD', 'BANK_TRANSFER', 'UPI', 'OTHER'], i),
      status: 'SUCCESS',
      paidAt: daysAgo(i % 25),
      reference: `PAY-${String(5000 + i)}`,
    });
  }

  const counts = {
    users: await User.countDocuments(),
    customers: await Customer.countDocuments(),
    products: await Product.countDocuments(),
    quotations: await Quotation.countDocuments(),
    salesOrders: await SalesOrder.countDocuments(),
    invoices: await Invoice.countDocuments(),
    subscriptions: await Subscription.countDocuments(),
    fulfillments: await Fulfillment.countDocuments(),
    approvals: await Approval.countDocuments(),
    negotiations: await Negotiation.countDocuments(),
    dealHealth: await DealHealth.countDocuments(),
    payments: await Payment.countDocuments(),
  };

  console.log('\nDealFlow360 Database Seeded Successfully');
  console.table(counts);
  console.log('\nDemo Users:');
  console.log('  Admin:       admin@dealflow360.com / password123');
  console.log('  Manager:     manager@dealflow360.com / password123');
  console.log('  Manager 2:   dwithi.manager@dealflow360.com / password123');
  console.log('  Salesperson: atharva@dealflow360.com / password123');
  console.log('  Finance:     finance@dealflow360.com / password123');
  console.log('  Customer:    customer1@dealflow360.com / password123');

  await mongoose.disconnect();
}

seed().catch(async err => {
  console.error('Seed script failed:', err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
