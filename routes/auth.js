const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const { login, register, getMe } = require('../controllers/authController');

const router = express.Router();

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

router.post(
  '/register',
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['salesperson', 'sales_manager', 'finance_ops', 'admin']),
  ],
  validate,
  register
);

router.get('/me', requireAuth, getMe);

module.exports = router;
