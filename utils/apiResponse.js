/**
 * Standard API response helpers.
 * Every endpoint returns { success, data?, error?, pagination? }
 */

class ApiResponse {
  static success(res, data, statusCode = 200, pagination = null) {
    const response = { success: true, data };
    if (pagination) response.pagination = pagination;
    return res.status(statusCode).json(response);
  }

  static created(res, data) {
    return res.status(201).json({ success: true, data });
  }

  static error(res, message, statusCode = 500, errors = null) {
    const response = { success: false, error: message };
    if (errors) response.errors = errors;
    return res.status(statusCode).json(response);
  }

  static notFound(res, resource = 'Resource') {
    return res.status(404).json({ success: false, error: `${resource} not found` });
  }

  static badRequest(res, message, errors = null) {
    return ApiResponse.error(res, message, 400, errors);
  }

  static unauthorized(res, message = 'Unauthorized') {
    return ApiResponse.error(res, message, 401);
  }

  static forbidden(res, message = 'Forbidden') {
    return ApiResponse.error(res, message, 403);
  }

  /**
   * Build pagination metadata from mongoose query params.
   */
  static paginate(total, page, limit) {
    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    };
  }
}

module.exports = ApiResponse;
