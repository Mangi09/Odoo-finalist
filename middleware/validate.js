/**
 * Express-validator result checker middleware.
 * Place after express-validator check() chains to return 400 on validation failure.
 */

const { validationResult } = require('express-validator');
const ApiResponse = require('../utils/apiResponse');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.badRequest(res, 'Validation failed', errors.array());
  }
  next();
}

module.exports = validate;
