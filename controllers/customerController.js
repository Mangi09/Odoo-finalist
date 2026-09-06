const Customer = require('../models/Customer');
const CustomerTier = require('../models/CustomerTier');
const ApiResponse = require('../utils/apiResponse');

/**
 * GET /api/v1/customers
 */
exports.getCustomers = async (req, res, next) => {
  try {
    const filter = {};

    // If salesperson, only show their own customers
    if (req.user && ['salesperson', 'sales_manager'].includes(req.user.role)) {
      filter.salespersonId = req.user.id;
    }

    const customers = await Customer.find(filter)
      .populate('tierId')
      .populate('salespersonId')
      .sort({ companyName: 1 });

    return ApiResponse.success(res, customers);
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/customers
 */
exports.createCustomer = async (req, res, next) => {
  try {
    const { companyName, contactName, email, phone, tierId, portalEnabled } = req.body;
    
    if (!companyName || !contactName || !email) {
      return ApiResponse.badRequest(res, 'Company Name, Contact Name, and Email are required.');
    }

    // Use default tier if not provided
    let finalTierId = tierId;
    if (!finalTierId) {
      const defaultTier = await CustomerTier.findOne({ name: 'Standard' }) || await CustomerTier.findOne();
      if (defaultTier) {
        finalTierId = defaultTier._id;
      }
    }

    // Auto-assign salesperson if created by one
    let salespersonId = null;
    if (req.user && req.user.role === 'salesperson') {
      salespersonId = req.user.id;
    } else if (req.body.salespersonId) {
      salespersonId = req.body.salespersonId; // admin/manager can assign explicitly
    }

    const customer = new Customer({
      companyName,
      contactName,
      email,
      phone,
      tierId: finalTierId,
      salespersonId,
      portalEnabled: portalEnabled || false
    });

    await customer.save();
    
    // Populate before returning so frontend gets all data
    await customer.populate('tierId');
    await customer.populate('salespersonId');

    return ApiResponse.created(res, customer);
  } catch (err) {
    next(err);
  }
};
