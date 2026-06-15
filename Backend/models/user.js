const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      match: [
        /^[a-zA-Z0-9_.-]+$/,
        "Username can only contain letters, numbers, underscores, hyphens and dots",
      ],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // never returned in queries by default
    },

    // ── Profile ───────────────────────────────────────────────────────────────
    avatar: {
      type: String,
      default: null,
    },

    role: {
      type: String,
      enum: ["employee", "admin"],
      default: "employee",
    },

    // ── Account Status ────────────────────────────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ── OTP (email verification at signup) ────────────────────────────────────
    otp: {
      code: {
        type: String,
        select: false,
      },
      expiresAt: {
        type: Date,
        select: false,
      },
      attempts: {
        type: Number,
        default: 0,
        select: false,
      },
    },

    // ── Password Reset ────────────────────────────────────────────────────────
    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpiresAt: {
      type: Date,
      select: false,
    },

    // ── Refresh Tokens (stored hashed for rotation) ───────────────────────────
    refreshTokens: {
      type: [String],
      select: false,
      default: [],
    },

    // ── Audit ─────────────────────────────────────────────────────────────────
    lastLoginAt: {
      type: Date,
      default: null,
    },

    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
// email and username indexes are created automatically via `unique: true` above.
// Only the reset token needs an explicit index since it has no unique constraint.
UserSchema.index({ passwordResetToken: 1 });




// ── Instance method: check if password changed after JWT was issued ───────────
UserSchema.methods.passwordChangedAfter = function (jwtIssuedAt) {
  if (this.passwordChangedAt) {
    const changedAt = Math.floor(this.passwordChangedAt.getTime() / 1000);
    return changedAt > jwtIssuedAt;
  }
  return false;
};

// ── Transform: strip sensitive fields from JSON output ────────────────────────
UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.password;
    delete ret.otp;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpiresAt;
    delete ret.refreshTokens;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model("User", UserSchema);