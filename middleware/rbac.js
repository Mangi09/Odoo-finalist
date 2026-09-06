/**
 * Role-Based Access Control middleware.
 * Usage: router.get('/admin', requireAuth, requireRole('admin', 'sales_manager'), handler)
 */

const ApiResponse = require('../utils/apiResponse');

/**
 * Factory: returns middleware that checks req.user.role against allowed roles.
 * @param  {...string} roles - Allowed roles
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.unauthorized(res, 'Authentication required.');
    }
    if (!roles.includes(req.user.role)) {
      return ApiResponse.forbidden(res, `Access denied. Required role(s): ${roles.join(', ')}`);
    }
    next();
  };
}

module.exports = { requireRole };
