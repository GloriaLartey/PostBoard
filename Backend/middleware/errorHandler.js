const { errorResponse } = require("../utils/apiResponse");

// ─────────────────────────────────────────────────────────────────────────────
//  Global error handler middleware
// ─────────────────────────────────────────────────────────────────────────────
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  // Log error details (excluding sensitive data in production)
  if (process.env.NODE_ENV === "development") {
    console.error("❌ Error:", {
      message: err.message,
      status: err.statusCode,
      path: req.path,
      method: req.method,
      stack: err.stack,
    });
  } else {
    console.error(`❌ [${err.statusCode}] ${err.message}`);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return errorResponse(res, "Validation failed", 422, errors);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message =
      field === "email"
        ? "An account with this email already exists."
        : field === "username"
          ? "This username is already taken."
          : `Duplicate value for field: ${field}`;
    return errorResponse(res, message, 409);
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === "CastError") {
    return errorResponse(res, `Invalid ${err.path}: ${err.value}`, 400);
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return errorResponse(res, "Invalid token. Please log in again.", 401);
  }

  if (err.name === "TokenExpiredError") {
    return errorResponse(
      res,
      "Your session has expired. Please log in again.",
      401,
    );
  }

  // Multer errors (file upload)
  if (err.name === "MulterError") {
    if (err.code === "FILE_TOO_LARGE") {
      return errorResponse(res, "File size exceeds the maximum limit.", 413);
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return errorResponse(res, "Too many files uploaded.", 413);
    }
    return errorResponse(res, "File upload error.", 400);
  }

  // Custom API errors
  if (err.isOperational === true) {
    return errorResponse(res, err.message, err.statusCode);
  }

  // Unknown errors
  const statusCode = err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production"
      ? "An unexpected error occurred. Please try again later."
      : err.message;

  return errorResponse(res, message, statusCode);
};

// ─────────────────────────────────────────────────────────────────────────────
//  404 Not Found handler
// ─────────────────────────────────────────────────────────────────────────────
const notFound = (req, res) => {
  return errorResponse(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
  );
};

module.exports = { errorHandler, notFound };
