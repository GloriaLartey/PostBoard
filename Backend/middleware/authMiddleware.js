const { verifyAccessToken } = require("../utils/tokenUtils");
const { errorResponse } = require("../utils/apiResponse");
const User = require("../models/user");

// ─────────────────────────────────────────────────────────────────────────────
//  protect – verifies JWT and attaches req.user
// ─────────────────────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header or cookie
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return errorResponse(
        res,
        "Access denied. Please log in to continue.",
        401
      );
    }

    // 2. Verify token signature and expiry
    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return errorResponse(
          res,
          "Your session has expired. Please log in again.",
          401
        );
      }
      return errorResponse(res, "Invalid token. Please log in again.", 401);
    }

    // 3. Check user still exists
    const user = await User.findById(decoded.id);
    if (!user) {
      return errorResponse(
        res,
        "The account associated with this token no longer exists.",
        401
      );
    }

    // 4. Check account is active and verified
    if (!user.isActive) {
      return errorResponse(
        res,
        "Your account has been deactivated. Please contact your administrator.",
        403
      );
    }

    if (!user.isVerified) {
      return errorResponse(
        res,
        "Please verify your email address before accessing this resource.",
        403
      );
    }

    // 5. Check if password was changed after token was issued
    if (user.passwordChangedAfter(decoded.iat)) {
      return errorResponse(
        res,
        "Your password was recently changed. Please log in again.",
        401
      );
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("protect middleware error:", error);
    return errorResponse(res, "Authentication failed.", 500);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  restrictTo – role-based access guard (use after protect)
//  Usage: router.delete('/users/:id', protect, restrictTo('admin'), handler)
// ─────────────────────────────────────────────────────────────────────────────
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        "You do not have permission to perform this action.",
        403
      );
    }
    next();
  };
};

module.exports = { protect, restrictTo };