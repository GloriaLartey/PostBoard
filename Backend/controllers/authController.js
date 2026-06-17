const bcrypt = require("bcryptjs");
const User = require("../models/user");
const PendingUser = require("../models/pendingUser");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateOTP,
  otpExpiresAt,
  generatePasswordResetToken,
  hashResetToken,
} = require("../utils/tokenUtils");
const {
  sendOTPEmail,
  sendPasswordResetEmail,
} = require("../utils/emailService");

// ─────────────────────────────────────────────────────────────────────────────
//  Helper – attach refresh token as HttpOnly cookie
// ─────────────────────────────────────────────────────────────────────────────
const setRefreshCookie = (res, token) => {
  const days = parseInt(process.env.JWT_REFRESH_EXPIRES_IN) || 30;
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: days * 24 * 60 * 60 * 1000,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
//  Helper – build safe user payload to send to client
// ─────────────────────────────────────────────────────────────────────────────
const userPayload = (user) => ({
  id:         user._id,
  username:   user.username,
  email:      user.email,
  avatar:     user.avatar,
  role:       user.role,
  isVerified: user.isVerified,
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/signup
//  Validates uniqueness, hashes password, stores in PendingUser, sends OTP.
//  No User document is created here.
// ─────────────────────────────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Reject if a verified account already exists for this email / username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      if (existingUser.email === email) {
        return errorResponse(res, "An account with this email already exists.", 409);
      }
      return errorResponse(res, "This username is already taken.", 409);
    }

    // 2. If a pending signup exists for this email, refresh it and resend OTP
    const existingPending = await PendingUser.findOne({ email });
    if (existingPending) {
      // Also check if the new request wants a username already pending for someone else
      const usernameTaken = await PendingUser.findOne({
        username,
        email: { $ne: email },
      });
      if (usernameTaken) {
        return errorResponse(res, "This username is already taken.", 409);
      }

      const otp        = generateOTP();
      const expiresAt  = otpExpiresAt();
      const otpMinutes = Number(process.env.OTP_EXPIRES_IN) || 10;

      existingPending.otp      = { code: otp, expiresAt, attempts: 0 };
      existingPending.expiresAt = new Date(Date.now() + otpMinutes * 60 * 1000);
      await existingPending.save();

      await sendOTPEmail({
        to: email,
        username: existingPending.username,
        otp,
        expiresInMinutes: otpMinutes,
      });

      return successResponse(
        res,
        "A new verification code has been sent to your email.",
        { email },
        200
      );
    }

    // 3. Check username isn't pending for a different email
    const pendingUsername = await PendingUser.findOne({ username });
    if (pendingUsername) {
      return errorResponse(res, "This username is already taken.", 409);
    }

    // 4. Hash the password before storing in PendingUser
    const salt           = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Generate OTP and compute expiry
    const otp        = generateOTP();
    const otpMinutes = Number(process.env.OTP_EXPIRES_IN) || 10;
    const expiresAt  = new Date(Date.now() + otpMinutes * 60 * 1000);

    // 6. Store in PendingUser (auto-deleted by TTL if never verified)
    await PendingUser.create({
      username,
      email,
      password: hashedPassword,
      otp: { code: otp, expiresAt, attempts: 0 },
      expiresAt,
    });

    // 7. Send OTP — account only becomes real after this is confirmed
    await sendOTPEmail({ to: email, username, otp, expiresInMinutes: otpMinutes });

    return successResponse(
      res,
      "A verification code has been sent to your email. Please enter it to complete your registration.",
      { email },
      201
    );
  } catch (error) {
    console.error("signup error:", error);
    return errorResponse(res, "An error occurred during signup.", 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/verify-otp
//  Validates OTP against PendingUser, then creates the real User document.
// ─────────────────────────────────────────────────────────────────────────────
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // 1. Look up pending registration
    const pending = await PendingUser.findOne({ email });
    if (!pending) {
      return errorResponse(
        res,
        "No pending registration found for this email. Please sign up first.",
        404
      );
    }

    const MAX_ATTEMPTS = 5;

    // 2. Too many wrong attempts
    if (pending.otp.attempts >= MAX_ATTEMPTS) {
      await PendingUser.deleteOne({ email });
      return errorResponse(
        res,
        "Too many incorrect attempts. Your registration has been cancelled. Please sign up again.",
        429
      );
    }

    // 3. OTP expired
    if (pending.otp.expiresAt < new Date()) {
      await PendingUser.deleteOne({ email });
      return errorResponse(
        res,
        "Your verification code has expired. Please sign up again.",
        400
      );
    }

    // 4. Wrong OTP
    if (pending.otp.code !== otp) {
      pending.otp.attempts += 1;
      await pending.save();
      const remaining = MAX_ATTEMPTS - pending.otp.attempts;
      return errorResponse(
        res,
        `Incorrect code. ${remaining} attempt${remaining !== 1 ? "s" : ""} remaining.`,
        400
      );
    }

    // ✅ OTP correct — create the real User now
    // Flag tells the pre-save hook not to re-hash the already-hashed password
    const user        = new User({
      username:   pending.username,
      email:      pending.email,
      password:   pending.password, // already hashed in signup
      isVerified: true,
    });
    // Issue tokens — user is logged in immediately after verification
    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens = [refreshToken];
    user.lastLoginAt   = new Date();
    await user.save(); // single save — flag prevents double-hashing

    // Remove the pending record
    await PendingUser.deleteOne({ email });

    setRefreshCookie(res, refreshToken);

    return successResponse(
      res,
      "Email verified! Welcome to PostBoard.",
      { accessToken, user: userPayload(user) },
      201
    );
  } catch (error) {
    console.error("verifyOTP error:", error);
    return errorResponse(res, "An error occurred during OTP verification.", 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/resend-otp
//  Refreshes OTP on an existing PendingUser record.
// ─────────────────────────────────────────────────────────────────────────────
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const pending = await PendingUser.findOne({ email });
    if (!pending) {
      return errorResponse(
        res,
        "No pending registration found for this email. Please sign up first.",
        404
      );
    }

    const otp        = generateOTP();
    const otpMinutes = Number(process.env.OTP_EXPIRES_IN) || 10;
    const expiresAt  = new Date(Date.now() + otpMinutes * 60 * 1000);

    pending.otp      = { code: otp, expiresAt, attempts: 0 };
    pending.expiresAt = expiresAt;
    await pending.save();

    await sendOTPEmail({
      to: email,
      username: pending.username,
      otp,
      expiresInMinutes: otpMinutes,
    });

    return successResponse(
      res,
      "A new verification code has been sent to your email.",
      { email }
    );
  } catch (error) {
    console.error("resendOTP error:", error);
    return errorResponse(res, "Failed to resend OTP.", 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const isEmail = identifier.includes("@");
    const query   = isEmail ? { email: identifier } : { username: identifier };
    const user    = await User.findOne(query).select("+password +refreshTokens");

    const invalidMsg = "Invalid credentials. Please check your details and try again.";
    if (!user) {
        return errorResponse(res, invalidMsg, 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return errorResponse(res, invalidMsg, 401);

    if (!user.isActive) {
      return errorResponse(
        res,
        "Your account has been deactivated. Please contact your administrator.",
        403
      );
    }

    // Issue tokens
    const accessToken  = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens = [...(user.refreshTokens || []), refreshToken].slice(-5);
    user.lastLoginAt   = new Date();
    await user.save({ validateBeforeSave: false });

    setRefreshCookie(res, refreshToken);

    return successResponse(res, "Login successful.", {
      accessToken,
      user: userPayload(user),
    });
  } catch (error) {
    console.error("login error:", error);
    return errorResponse(res, "An error occurred during login.", 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/refresh-token
// ─────────────────────────────────────────────────────────────────────────────
exports.refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;
    if (!token) return errorResponse(res, "No refresh token provided.", 401);

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch {
      return errorResponse(res, "Invalid or expired refresh token.", 401);
    }

    const user = await User.findById(decoded.id).select("+refreshTokens");
    if (!user || !user.refreshTokens.includes(token)) {
      if (user) {
        user.refreshTokens = [];
        await user.save({ validateBeforeSave: false });
      }
      return errorResponse(res, "Refresh token is no longer valid. Please log in again.", 401);
    }

    const newAccessToken  = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokens = user.refreshTokens
      .filter((t) => t !== token)
      .concat(newRefreshToken)
      .slice(-5);

    await user.save({ validateBeforeSave: false });
    setRefreshCookie(res, newRefreshToken);

    return successResponse(res, "Token refreshed.", { accessToken: newAccessToken });
  } catch (error) {
    console.error("refreshToken error:", error);
    return errorResponse(res, "Token refresh failed.", 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/logout
// ─────────────────────────────────────────────────────────────────────────────
exports.logout = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (token) {
      const user = await User.findById(req.user?._id).select("+refreshTokens");
      if (user) {
        user.refreshTokens = (user.refreshTokens || []).filter((t) => t !== token);
        await user.save({ validateBeforeSave: false });
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return successResponse(res, "Logged out successfully.");
  } catch (error) {
    console.error("logout error:", error);
    return errorResponse(res, "Logout failed.", 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/forgot-password
// ─────────────────────────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user      = await User.findOne({ email });

    // Always return the same message to prevent email enumeration
    const genericMsg = "If an account with that email exists, a password reset link has been sent.";

    if (!user || !user.isActive) return successResponse(res, genericMsg);

    const { rawToken, hashedToken, expiresAt } = generatePasswordResetToken();

    user.passwordResetToken = hashedToken;
    user.passwordResetExpiresAt = expiresAt;
    await user.save({ validateBeforeSave: false });

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail({
      to: user.email,
      username: user.username,
      resetLink,
      expiresInMinutes: Number(process.env.RESET_TOKEN_EXPIRES_IN) || 30,
    });

    return successResponse(res, genericMsg);
  } catch (error) {
    console.error("forgotPassword error:", error);
    return errorResponse(res, "Failed to process password reset request.", 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/reset-password
// ─────────────────────────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    const hashedToken = hashResetToken(token);
    const user        = await User.findOne({
      passwordResetToken:     hashedToken,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select("+password");

    if (!user) {
      return errorResponse(
        res,
        "This password reset link is invalid or has expired. Please request a new one.",
        400
      );
    }

    // Hash the new password before saving
    const salt = await bcrypt.genSalt(12);
    user.password               = await bcrypt.hash(password, salt);
    user.passwordChangedAt      = new Date(Date.now() - 1000);
    user.passwordResetToken     = undefined;
    user.passwordResetExpiresAt = undefined;
    user.refreshTokens          = []; // invalidate all sessions

    await user.save();

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return successResponse(
      res,
      "Password reset successful! Please log in with your new password."
    );
  } catch (error) {
    console.error("resetPassword error:", error);
    return errorResponse(res, "Failed to reset password.", 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/auth/me  (protected)
// ─────────────────────────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return errorResponse(res, "User not found.", 404);
    return successResponse(res, "User profile retrieved.", userPayload(user));
  } catch (error) {
    console.error("getMe error:", error);
    return errorResponse(res, "Failed to retrieve profile.", 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/auth/validate-reset-token  (public)
// ─────────────────────────────────────────────────────────────────────────────
exports.validateResetToken = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) return errorResponse(res, "Token is required.", 400);

    const hashedToken = hashResetToken(token);
    const user        = await User.findOne({
      passwordResetToken:     hashedToken,
      passwordResetExpiresAt: { $gt: new Date() },
    });

    if (!user) return errorResponse(res, "This reset link is invalid or has expired.", 400);

    return successResponse(res, "Token is valid.", { valid: true });
  } catch (error) {
    console.error("validateResetToken error:", error);
    return errorResponse(res, "Token validation failed.", 500);
  }
};