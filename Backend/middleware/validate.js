const { validationResult } = require("express-validator");
const { errorResponse } = require("../utils/apiResponse");

/**
 * Middleware that reads express-validator results and short-circuits with
 * a 422 if any rule failed.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return errorResponse(res, "Validation failed", 422, formatted);
  }
  next();
};

module.exports = validate;