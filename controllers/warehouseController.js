const Warehouse = require('../models/Warehouse');
const Inventory = require('../models/Inventory');
const Fulfillment = require('../models/Fulfillment');
const ApiResponse = require('../utils/apiResponse');

exports.getWarehouses = async (req, res, next) => {
  try {
    const warehouses = await Warehouse.find({ isArchived: { $ne: true } }).sort({ priority: 1, name: 1 });
    return ApiResponse.success(res, warehouses);
  } catch (err) {
    next(err);
  }
};

exports.createWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.create(req.body);
    return ApiResponse.created(res, warehouse);
  } catch (err) {
    next(err);
  }
};

exports.updateWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!warehouse) return ApiResponse.notFound(res, 'Warehouse not found');
    return ApiResponse.success(res, warehouse);
  } catch (err) {
    next(err);
  }
};

exports.archiveWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return ApiResponse.notFound(res, 'Warehouse not found');

    warehouse.isArchived = true;
    warehouse.archivedAt = new Date();
    warehouse.archivedBy = req.user.id;
    await warehouse.save();

    return ApiResponse.success(res, warehouse);
  } catch (err) {
    next(err);
  }
};

exports.deleteWarehouse = async (req, res, next) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return ApiResponse.notFound(res, 'Warehouse not found');

    const hasFulfillment = await Fulfillment.exists({ warehouseId: warehouse._id });
    if (hasFulfillment) {
      return ApiResponse.badRequest(res, 'This warehouse has fulfillment history. Archive it instead to preserve related records.');
    }

    await Inventory.deleteMany({ warehouseId: warehouse._id });
    await Warehouse.deleteOne({ _id: warehouse._id });

    return ApiResponse.success(res, { deleted: true, id: warehouse._id });
  } catch (err) {
    next(err);
  }
};
