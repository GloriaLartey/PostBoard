const rateLimit = require("express-rate-limit");
const { errorResponse } = require("../utils/apiResponse");

const rateLimitHandler = (req, res) => {
  return errorResponse(
    res,
    "Too many requests from this IP. Please try again later.",
    429
  );
};

// ── General auth limiter (signup, login, etc.) ────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

// ── OTP / forgot-password – stricter window ───────────────────────────────────
const sensitiveAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
});

module.exports = { authLimiter, sensitiveAuthLimiter };