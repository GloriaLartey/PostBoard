const { body } = require("express-validator");

// ── Signup ────────────────────────────────────────────────────────────────────
const signupValidation = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username is required")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage(
      "Username can only contain letters, numbers, underscores, hyphens and dots",
    ),

  // Any valid email format is accepted — no domain restriction.
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address (e.g. name@example.com)")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)
    .withMessage("Password must contain at least one special character"),
];

// ── OTP Verification ──────────────────────────────────────────────────────────
const verifyOTPValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail({ gmail_remove_dots: false }),

  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
];

// ── Resend OTP ────────────────────────────────────────────────────────────────
const resendOTPValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .normalizeEmail({ gmail_remove_dots: false }),
];

// ── Login ─────────────────────────────────────────────────────────────────────
const loginValidation = [
  body("identifier")
    .trim()
    .notEmpty()
    .withMessage("Email or username is required"),

  body("password").notEmpty().withMessage("Password is required"),
];

// ── Forgot Password ───────────────────────────────────────────────────────────
const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address (e.g. name@example.com)")
    .normalizeEmail({ gmail_remove_dots: false }),
];

// ── Reset Password ────────────────────────────────────────────────────────────
const resetPasswordValidation = [
  body("token").trim().notEmpty().withMessage("Reset token is required"),

  body("password")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/)
    .withMessage("Password must contain at least one special character"),
];

module.exports = {
  signupValidation,
  verifyOTPValidation,
  resendOTPValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};