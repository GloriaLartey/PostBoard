const express = require("express");
const router = express.Router();

const {
  signup,
  verifyOTP,
  resendOTP,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
  validateResetToken,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { authLimiter, sensitiveAuthLimiter } = require("../middleware/rateLimiter");

const {
  signupValidation,
  verifyOTPValidation,
  resendOTPValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require("../validators/authValidators");

// ── Public routes ─────────────────────────────────────────────────────────────

// Registration
router.post("/signup", authLimiter, signupValidation, validate, signup);

// OTP
router.post("/verify-otp", authLimiter, verifyOTPValidation, validate, verifyOTP);
router.post("/resend-otp", sensitiveAuthLimiter, resendOTPValidation, validate, resendOTP);

// Login / token management
router.post("/login", authLimiter, loginValidation, validate, login);
router.post("/refresh-token", authLimiter, refreshToken);

// Password recovery
router.post("/forgot-password", sensitiveAuthLimiter, forgotPasswordValidation, validate, forgotPassword);
router.post("/reset-password", authLimiter, resetPasswordValidation, validate, resetPassword);

// Validate reset token before rendering the reset-password page (frontend ping)
router.get("/validate-reset-token", validateResetToken);

// ── Protected routes ──────────────────────────────────────────────────────────

// Logout (needs user context to revoke refresh token)
router.post("/logout", protect, logout);

// Get current authenticated user
router.get("/me", protect, getMe);

module.exports = router;