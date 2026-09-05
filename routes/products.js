const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, productController.getProducts);
router.get('/:id', optionalAuth, productController.getProductById);
router.post('/', optionalAuth, productController.createProduct);
router.put('/:id', optionalAuth, productController.updateProduct);

module.exports = router;
