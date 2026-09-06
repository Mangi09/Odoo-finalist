/**
 * JWT authentication middleware.
 * Extracts user from Bearer token and attaches to req.user.
 * Routes are accessible without auth for now (optional JWT).
 */

const jwt = require('jsonwebtoken');
const ApiResponse = require('../utils/apiResponse');

/**
 * Optional auth — attaches user if token present, passes through otherwise.
 * Use `requireAuth` for endpoints that MUST be authenticated.
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

/**
 * Required auth — rejects request if no valid token.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.unauthorized(res, 'Authentication required. Provide a Bearer token.');
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return ApiResponse.unauthorized(res, 'Invalid or expired token.');
  }
}

module.exports = { optionalAuth, requireAuth };
