const Product = require('../models/Product');
const Category = require('../models/Category');
const ApiResponse = require('../utils/apiResponse');

function formatProduct(p) {
  const categoryName = p.categoryId?.name || p.category?.name || p.category || 'Hardware';
  const priceDisplay = p.billingType === 'RECURRING'
    ? `₹${p.sellingPrice?.toLocaleString('en-IN') || 0}/month`
    : `₹${p.sellingPrice?.toLocaleString('en-IN') || 0}`;

  return {
    _id: p._id,
    id: p.sku || `PROD-${p._id.toString().slice(-3).toUpperCase()}`,
    name: p.name,
    category: categoryName,
    variants: p.variants && p.variants.length > 0 ? `${p.variants.length} options` : '-',
    price: priceDisplay,
    sellingPrice: p.sellingPrice,
    costPrice: p.cost || p.costPrice || 0,
    unit: p.billingType === 'RECURRING' ? 'Recurring' : 'Each',
    tax: `${p.taxRate || 15}%`,
    status: p.isActive !== false ? 'Active' : 'Archived',
    billingType: p.billingType || 'ONE_TIME',
    frequency: p.frequency,
    description: p.description || ''
  };
}

/**
 * GET /api/v1/products
 */
exports.getProducts = async (req, res, next) => {
  try {
    const { category, billingType, search } = req.query;
    const filter = {};

    if (billingType) filter.billingType = billingType;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    let products = await Product.find(filter).populate('categoryId');

    if (category && category.toLowerCase() !== 'all') {
      products = products.filter(p => {
        const catName = p.categoryId?.name || p.category;
        return catName && catName.toLowerCase() === category.toLowerCase();
      });
    }

    const formatted = products.map(formatProduct);
    return ApiResponse.success(res, formatted);
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/products/:id
 */
exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id).populate('categoryId');
    } else {
      product = await Product.findOne({ sku: id }).populate('categoryId');
      if (!product) {
        // fallback search by name or ending
        const all = await Product.find().populate('categoryId');
        product = all.find(p => `PROD-${p._id.toString().slice(-3).toUpperCase()}` === id.toUpperCase());
      }
    }

    if (!product) {
      return ApiResponse.notFound(res, 'Product not found');
    }

    return ApiResponse.success(res, formatProduct(product));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/products
 */
exports.createProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.cost && payload.costPrice) payload.cost = payload.costPrice;
    const product = new Product(payload);
    await product.save();
    await product.populate('categoryId');
    return ApiResponse.created(res, formatProduct(product));
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/v1/products/:id
 */
exports.updateProduct = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (!payload.cost && payload.costPrice) payload.cost = payload.costPrice;
    const product = await Product.findByIdAndUpdate(req.params.id, payload, { new: true }).populate('categoryId');
    if (!product) return ApiResponse.notFound(res, 'Product not found');
    return ApiResponse.success(res, formatProduct(product));
  } catch (err) {
    next(err);
  }
};
