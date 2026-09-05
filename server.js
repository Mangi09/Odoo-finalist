require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const logger = require('./utils/logger');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const dashboardRoutes = require('./routes/dashboard');
const quotationRoutes = require('./routes/quotations');
const approvalRoutes = require('./routes/approvals');
const recommendationRoutes = require('./routes/recommendations');
const portalRoutes = require('./routes/portal');
const fulfillmentRoutes = require('./routes/fulfillments');
const subscriptionRoutes = require('./routes/subscriptions');
const invoiceRoutes = require('./routes/invoices');
const dealHealthRoutes = require('./routes/dealHealth');
const reportsRoutes = require('./routes/reports');
const paymentRoutes = require('./routes/payments');

const app = express();

// Connect to MongoDB
connectDB();

// Core Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'DealFlow360 API', timestamp: new Date() });
});

// API Routes (v1)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/quotations', quotationRoutes);
app.use('/api/v1/approvals', approvalRoutes);
app.use('/api/v1', recommendationRoutes);
app.use('/api/v1/portal', portalRoutes);
app.use('/api/v1/fulfillments', fulfillmentRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/invoices', invoiceRoutes);
app.use('/api/v1/deal-health', dealHealthRoutes);
app.use('/api/v1/reports', reportsRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Fallback 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`DealFlow360 server running on port ${PORT}`);
});

module.exports = { app, server };
