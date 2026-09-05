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
} = require('../models');

async function seed() {
  const connStr = process.env.MONGO_URI || 'mongodb://localhost:27017/odoo';
  console.log(`Connecting to MongoDB at ${connStr}...`);
  await mongoose.connect(connStr);
  console.log('Connected successfully!');

  // Clear existing collections
  console.log('Clearing existing collections...');
  const collections = [
    User, CustomerTier, Customer, Category, Product, DiscountRule,
    Quotation, Approval, Recommendation, Warehouse, Inventory,
    Fulfillment, Backorder, Negotiation, Subscription, Invoice,
    Payment, DealHealth, QuotationHistory
  ];

  for (const col of collections) {
    try {
      await col.deleteMany({});
    } catch (e) {
      // ignore
    }
  }

  console.log('1. Seeding Customer Tiers...');
  const bronze = await CustomerTier.create({ name: 'Bronze', maxDiscountPercent: 5 });
  const silver = await CustomerTier.create({ name: 'Silver', maxDiscountPercent: 10 });
  const gold = await CustomerTier.create({ name: 'Gold', maxDiscountPercent: 15 });

  console.log('2. Seeding Categories...');
  const catHardware = await Category.create({ name: 'Hardware', description: 'Computing, displays and peripherals' });
  const catServices = await Category.create({ name: 'Services', description: 'Implementation and setup services' });
  const catSubscription = await Category.create({ name: 'Subscription', description: 'Recurring care and support contracts' });
  const catCloud = await Category.create({ name: 'Cloud', description: 'Cloud infrastructure and hosting services' });
  const catSoftware = await Category.create({ name: 'Software', description: 'Enterprise desktop and server licenses' });
  const catNetworking = await Category.create({ name: 'Networking', description: 'Switches, routers and connectivity' });

  console.log('3. Seeding Products...');
  const pLaptop14 = await Product.create({
    name: 'Laptop Pro 14',
    categoryId: catHardware._id,
    cost: 900,
    sellingPrice: 1200,
    billingType: 'ONE_TIME',
    isActive: true
  });
  const pSetup = await Product.create({
    name: 'Onsite Setup Service',
    categoryId: catServices._id,
    cost: 200,
    sellingPrice: 450,
    billingType: 'ONE_TIME',
    isActive: true
  });
  const pDock = await Product.create({
    name: 'Docking Station',
    categoryId: catHardware._id,
    cost: 110,
    sellingPrice: 180,
    billingType: 'ONE_TIME',
    isActive: true
  });
  const pCarePlan = await Product.create({
    name: 'Care Plan 3 years',
    categoryId: catSubscription._id,
    cost: 15,
    sellingPrice: 40,
    billingType: 'RECURRING',
    frequency: 'MONTHLY',
    isActive: true
  });
  const pLaptop16 = await Product.create({
    name: 'NovaBook Ultra 16',
    categoryId: catHardware._id,
    cost: 1400,
    sellingPrice: 1850,
    billingType: 'ONE_TIME',
    isActive: true
  });
  const pMonitor = await Product.create({
    name: 'NovaMonitor 27',
    categoryId: catHardware._id,
    cost: 210,
    sellingPrice: 320,
    billingType: 'ONE_TIME',
    isActive: true
  });
  const pCloud = await Product.create({
    name: 'NovaCloud Pro',
    categoryId: catCloud._id,
    cost: 120,
    sellingPrice: 299,
    billingType: 'RECURRING',
    frequency: 'MONTHLY',
    isActive: true
  });
  const pSecureDesk = await Product.create({
    name: 'SecureDesk Enterprise',
    categoryId: catSoftware._id,
    cost: 60,
    sellingPrice: 150,
    billingType: 'RECURRING',
    frequency: 'YEARLY',
    isActive: true
  });
  const pWarranty = await Product.create({
    name: 'Extended Warranty 2yr',
    categoryId: catServices._id,
    cost: 40,
    sellingPrice: 99,
    billingType: 'ONE_TIME',
    isActive: true
  });
  const pSupportSLA = await Product.create({
    name: 'Premium Support SLA',
    categoryId: catSubscription._id,
    cost: 200,
    sellingPrice: 500,
    billingType: 'RECURRING',
    frequency: 'MONTHLY',
    isActive: true
  });
  const pSwitch = await Product.create({
    name: 'NovaSwitch 24-Port',
    categoryId: catNetworking._id,
    cost: 250,
    sellingPrice: 380,
    billingType: 'ONE_TIME',
    isActive: true
  });
  const pAnalytics = await Product.create({
    name: 'Enterprise Analytics Suite',
    categoryId: catSoftware._id,
    cost: 1800,
    sellingPrice: 3500,
    billingType: 'ONE_TIME',
    isActive: true
  });
  const pWorkflow = await Product.create({
    name: 'Workflow Automation Module',
    categoryId: catSoftware._id,
    cost: 700,
    sellingPrice: 1500,
    billingType: 'ONE_TIME',
    isActive: true
  });

  console.log('4. Seeding Discount Rules...');
  // Tier + Category specific rules
  await DiscountRule.create({ tierId: bronze._id, categoryId: catHardware._id, maxDiscountPercent: 5, approvalLevel: 1 });
  await DiscountRule.create({ tierId: silver._id, categoryId: catHardware._id, maxDiscountPercent: 10, approvalLevel: 1 });
  await DiscountRule.create({ tierId: gold._id, categoryId: catHardware._id, maxDiscountPercent: 12, approvalLevel: 2 });

  await DiscountRule.create({ tierId: bronze._id, categoryId: catServices._id, maxDiscountPercent: 10, approvalLevel: 1 });
  await DiscountRule.create({ tierId: silver._id, categoryId: catServices._id, maxDiscountPercent: 15, approvalLevel: 1 });
  await DiscountRule.create({ tierId: gold._id, categoryId: catServices._id, maxDiscountPercent: 20, approvalLevel: 2 });

  await DiscountRule.create({ tierId: gold._id, categoryId: catSoftware._id, maxDiscountPercent: 15, approvalLevel: 2 });

  console.log('5. Seeding Warehouses & Inventory...');
  const whMumbai = await Warehouse.create({ name: 'Mumbai Central DC', location: 'Mumbai, MH', priority: 1 });
  const whBlr = await Warehouse.create({ name: 'Bengaluru Tech Hub', location: 'Bengaluru, KA', priority: 2 });
  const whDelhi = await Warehouse.create({ name: 'Delhi NCR Fulfillment', location: 'Gurugram, HR', priority: 3 });

  const hardwareProducts = [pLaptop14, pDock, pLaptop16, pMonitor, pSwitch];
  for (const hp of hardwareProducts) {
    await Inventory.create({ warehouseId: whMumbai._id, productId: hp._id, availableQty: 50, reservedQty: 5 });
    await Inventory.create({ warehouseId: whBlr._id, productId: hp._id, availableQty: 35, reservedQty: 0 });
    await Inventory.create({ warehouseId: whDelhi._id, productId: hp._id, availableQty: 25, reservedQty: 0 });
  }

  console.log('6. Seeding Users...');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const uAdmin = await User.create({
    name: 'Admin User',
    email: 'admin@dealflow360.com',
    passwordHash: hashedPassword,
    role: 'admin'
  });
  const uManager = await User.create({
    name: 'M. Shah (Sales Manager)',
    email: 'manager@dealflow360.com',
    passwordHash: hashedPassword,
    role: 'sales_manager'
  });
  const uAtharva = await User.create({
    name: 'Atharva K.',
    email: 'atharva@dealflow360.com',
    passwordHash: hashedPassword,
    role: 'salesperson'
  });

  console.log('7. Seeding Customers...');
  const cAcme = await Customer.create({
    companyName: 'Acme Corporation',
    contactName: 'John Carter',
    email: 'john.carter@acmecorp.com',
    phone: '+91 98765 43210',
    tierId: gold._id,
    portalEnabled: true
  });
  const cTechNova = await Customer.create({
    companyName: 'TechNova Solutions',
    contactName: 'Priya Sharma',
    email: 'priya@technova.com',
    phone: '+91 98111 22334',
    tierId: silver._id,
    portalEnabled: true
  });
  const cVertex = await Customer.create({
    companyName: 'Vertex Enterprises',
    contactName: 'David Lee',
    email: 'david@vertex.com',
    phone: '+91 99222 33445',
    tierId: gold._id,
    portalEnabled: false
  });
  const cGlobal = await Customer.create({
    companyName: 'Global Supplies',
    contactName: 'Sanjay Mehta',
    email: 'sanjay@globalsupplies.com',
    phone: '+91 97333 44556',
    tierId: bronze._id,
    portalEnabled: false
  });
  const cNova = await Customer.create({
    companyName: 'Nova Industries',
    contactName: 'Elena Rostova',
    email: 'elena@novaindustries.com',
    phone: '+91 98444 55667',
    tierId: silver._id,
    portalEnabled: true
  });

  console.log('8. Seeding Quotations & History...');

  // Quotation 1: Acme Corp - High Discount needing approval (Matches Q-1042 in frontend)
  const q1Items = [
    {
      productId: pLaptop14._id,
      qty: 2,
      unitPrice: 1200,
      discountPercent: 18, // Gold limit is 12% -> Triggers approval!
      lineTotal: 1200 * 2 * (1 - 0.18),
      lineMargin: (1200 * 0.82 - 900) * 2,
      isRecommendation: false
    },
    {
      productId: pDock._id,
      qty: 2,
      unitPrice: 180,
      discountPercent: 10,
      lineTotal: 180 * 2 * 0.9,
      lineMargin: (180 * 0.9 - 110) * 2,
      isRecommendation: true
    },
    {
      productId: pSupportSLA._id,
      qty: 1,
      unitPrice: 500,
      discountPercent: 0,
      lineTotal: 500,
      lineMargin: 300,
      isRecommendation: true
    }
  ];
  const q1TotalAmount = q1Items.reduce((s, i) => s + i.lineTotal, 0);
  const q1TotalMargin = q1Items.reduce((s, i) => s + i.lineMargin, 0);

  const qAcme = await Quotation.create({
    customerId: cAcme._id,
    salespersonId: uAtharva._id,
    title: 'Enterprise Software & Hardware Package',
    status: 'PENDING_APPROVAL',
    items: q1Items,
    totalAmount: q1TotalAmount,
    totalMargin: q1TotalMargin,
    riskScore: 78
  });

  await QuotationHistory.create({
    quotationId: qAcme._id,
    actorId: uAtharva._id,
    action: 'Quotation created in DRAFT',
    fromStatus: 'DRAFT',
    toStatus: 'DRAFT'
  });
  await QuotationHistory.create({
    quotationId: qAcme._id,
    actorId: uAtharva._id,
    action: 'Submitted for approval (18% discount requested on Laptop Pro 14)',
    fromStatus: 'DRAFT',
    toStatus: 'PENDING_APPROVAL'
  });

  // Create Approval for qAcme
  await Approval.create({
    quotationId: qAcme._id,
    approverId: uManager._id,
    level: 2,
    requestedDiscountPercent: 18,
    allowedDiscountPercent: 12,
    status: 'PENDING',
    reason: 'Requested 18% exceeds limit of 12% for Laptop Pro 14'
  });

  // Deal Health for qAcme
  await DealHealth.create({
    quotationId: qAcme._id,
    score: 48,
    status: 'AT_RISK',
    riskFactors: ['1 pending approval(s)', 'Discount exceeds standard Gold tier by 6%']
  });

  // Quotation 2: TechNova - DRAFT (Matches Q-1041)
  const q2Items = [
    {
      productId: pCloud._id,
      qty: 1,
      unitPrice: 299,
      discountPercent: 5,
      lineTotal: 299 * 0.95,
      lineMargin: 299 * 0.95 - 120,
      isRecommendation: false
    }
  ];
  const qTechNova = await Quotation.create({
    customerId: cTechNova._id,
    salespersonId: uAtharva._id,
    title: 'Cloud Migration Services',
    status: 'DRAFT',
    items: q2Items,
    totalAmount: 240000,
    totalMargin: 80000,
    riskScore: 20
  });
  await QuotationHistory.create({
    quotationId: qTechNova._id,
    actorId: uAtharva._id,
    action: 'Quotation drafted',
    fromStatus: 'DRAFT',
    toStatus: 'DRAFT'
  });
  await DealHealth.create({
    quotationId: qTechNova._id,
    score: 88,
    status: 'HEALTHY',
    riskFactors: []
  });

  // Quotation 3: Vertex Enterprises - CONFIRMED & In Fulfillment (Matches Q-1040)
  const q3Items = [
    {
      productId: pLaptop16._id,
      qty: 3,
      unitPrice: 1850,
      discountPercent: 10,
      lineTotal: 1850 * 3 * 0.9,
      lineMargin: (1850 * 0.9 - 1400) * 3,
      isRecommendation: false
    }
  ];
  const qVertex = await Quotation.create({
    customerId: cVertex._id,
    salespersonId: uAtharva._id,
    title: 'Annual Support Contract & Hardware',
    status: 'FULFILLMENT',
    items: q3Items,
    totalAmount: 610000,
    totalMargin: 190000,
    riskScore: 15
  });
  await QuotationHistory.create({
    quotationId: qVertex._id,
    actorId: uAtharva._id,
    action: 'Quotation confirmed by customer',
    fromStatus: 'SENT_TO_CUSTOMER',
    toStatus: 'CONFIRMED'
  });
  await QuotationHistory.create({
    quotationId: qVertex._id,
    actorId: uAtharva._id,
    action: 'Fulfillment initiated from Mumbai Central DC',
    fromStatus: 'CONFIRMED',
    toStatus: 'FULFILLMENT'
  });

  // Create Fulfillment and Invoice for qVertex
  await Fulfillment.create({
    quotationId: qVertex._id,
    quotationItemId: qVertex.items[0]._id,
    warehouseId: whMumbai._id,
    allocatedQty: 3,
    status: 'SHIPPED'
  });

  const invVertex = await Invoice.create({
    quotationId: qVertex._id,
    type: 'ONE_TIME',
    amount: 610000,
    status: 'ISSUED',
    issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
  });

  await DealHealth.create({
    quotationId: qVertex._id,
    score: 92,
    status: 'HEALTHY',
    riskFactors: []
  });

  // Quotation 4: Global Supplies - SENT_TO_CUSTOMER (Matches Q-1039)
  const qGlobal = await Quotation.create({
    customerId: cGlobal._id,
    salespersonId: uAtharva._id,
    title: 'Hardware Procurement',
    status: 'SENT_TO_CUSTOMER',
    items: [
      {
        productId: pSwitch._id,
        qty: 5,
        unitPrice: 380,
        discountPercent: 5,
        lineTotal: 380 * 5 * 0.95,
        lineMargin: (380 * 0.95 - 250) * 5,
        isRecommendation: false
      }
    ],
    totalAmount: 190000,
    totalMargin: 50000,
    riskScore: 35
  });
  await QuotationHistory.create({
    quotationId: qGlobal._id,
    actorId: uAtharva._id,
    action: 'Sent to customer for review',
    fromStatus: 'APPROVED',
    toStatus: 'SENT_TO_CUSTOMER'
  });
  await DealHealth.create({
    quotationId: qGlobal._id,
    score: 75,
    status: 'HEALTHY',
    riskFactors: []
  });

  // Quotation 5: Nova Industries - NEGOTIATION (Matches Q-1038)
  const qNova = await Quotation.create({
    customerId: cNova._id,
    salespersonId: uAtharva._id,
    title: 'Security Audit Framework',
    status: 'NEGOTIATION',
    items: [
      {
        productId: pAnalytics._id,
        qty: 1,
        unitPrice: 3500,
        discountPercent: 12,
        lineTotal: 3500 * 0.88,
        lineMargin: 3500 * 0.88 - 1800,
        isRecommendation: false
      }
    ],
    totalAmount: 375000,
    totalMargin: 120000,
    riskScore: 65
  });
  await QuotationHistory.create({
    quotationId: qNova._id,
    actorId: uAtharva._id,
    action: 'Customer requested discount negotiation',
    fromStatus: 'SENT_TO_CUSTOMER',
    toStatus: 'NEGOTIATION'
  });
  await DealHealth.create({
    quotationId: qNova._id,
    score: 38,
    status: 'CRITICAL',
    riskFactors: ['Active negotiation stalled', 'Discount adjustment pending review']
  });

  // Quotation 6: PAID Quotation with Invoice & Payment
  const qPaid = await Quotation.create({
    customerId: cAcme._id,
    salespersonId: uAtharva._id,
    title: 'Enterprise Analytics Renewal',
    status: 'PAID',
    items: [
      {
        productId: pAnalytics._id,
        qty: 1,
        unitPrice: 3500,
        discountPercent: 10,
        lineTotal: 3150,
        lineMargin: 1350,
        isRecommendation: false
      }
    ],
    totalAmount: 3150,
    totalMargin: 1350,
    riskScore: 10
  });

  const invPaid = await Invoice.create({
    quotationId: qPaid._id,
    type: 'ONE_TIME',
    amount: 3150,
    status: 'PAID',
    issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  });

  await Payment.create({
    invoiceId: invPaid._id,
    amount: 3150,
    method: 'CARD',
    status: 'SUCCESS',
    paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    reference: 'PAY-1042'
  });

  // Seed Subscriptions
  await Subscription.create({
    quotationItemId: qAcme.items[2]._id,
    productId: pSupportSLA._id,
    frequency: 'MONTHLY',
    amount: 499,
    startDate: new Date(),
    status: 'ACTIVE'
  });
  await Subscription.create({
    quotationItemId: qTechNova.items[0]._id,
    productId: pCloud._id,
    frequency: 'MONTHLY',
    amount: 299,
    startDate: new Date(),
    status: 'ACTIVE'
  });

  console.log('\n=========================================');
  console.log(' DealFlow360 Database Seeded Successfully!');
  console.log('=========================================');
  console.log('Demo Users:');
  console.log('  Admin:       admin@dealflow360.com / password123');
  console.log('  Manager:     manager@dealflow360.com / password123');
  console.log('  Salesperson: atharva@dealflow360.com / password123');
  console.log('\nDemo Quotations:');
  console.log(`  Q-1042 (Pending Approval): ${qAcme._id}`);
  console.log(`  Q-1041 (Draft):            ${qTechNova._id}`);
  console.log(`  Q-1040 (Fulfillment):      ${qVertex._id}`);
  console.log(`  Q-1039 (Sent to Customer): ${qGlobal._id}`);
  console.log(`  Q-1038 (Negotiation):      ${qNova._id}`);
  console.log(`  Q-1035 (Paid):             ${qPaid._id}`);
  console.log('\n=========================================\n');

  process.exit(0);
}

seed().catch(err => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
