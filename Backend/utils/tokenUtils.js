const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ─────────────────────────────────────────────────────────────────────────────
//  JWT Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a short-lived access token.
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Generate a long-lived refresh token.
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
};

/**
 * Verify an access token. Returns the decoded payload or throws.
 */
const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

/**
 * Verify a refresh token. Returns the decoded payload or throws.
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

// ─────────────────────────────────────────────────────────────────────────────
//  OTP Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a cryptographically random 6-digit OTP.
 */
const generateOTP = () => {
  // Produces a number in [0, 999999], zero-padded to 6 digits
  const raw = crypto.randomInt(0, 1_000_000);
  return String(raw).padStart(6, "0");
};

/**
 * Compute OTP expiry Date from env variable (minutes).
 */
const otpExpiresAt = () => {
  const minutes = Number(process.env.OTP_EXPIRES_IN) || 10;
  return new Date(Date.now() + minutes * 60 * 1000);
};

// ─────────────────────────────────────────────────────────────────────────────
//  Password Reset Token Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a secure random hex token for password reset.
 * Returns { rawToken, hashedToken, expiresAt }
 *
 * Store only the hashed version in the DB.
 * Send the raw token inside the reset link to the user.
 */
const generatePasswordResetToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  const minutes = Number(process.env.RESET_TOKEN_EXPIRES_IN) || 30;
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000);
  return { rawToken, hashedToken, expiresAt };
};

/**
 * Hash a raw reset token so it can be compared against the DB value.
 */
const hashResetToken = (rawToken) => {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateOTP,
  otpExpiresAt,
  generatePasswordResetToken,
  hashResetToken,
};