const mongoose = require("mongoose");

/**
 * Temporary store for signup data awaiting OTP verification.
 * Documents auto-delete via the TTL index once expiresAt is reached.
 * A real User document is only created after OTP is confirmed.
 */
const PendingUserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }, // already hashed
  otp: {
    code:      { type: String, required: true },
    expiresAt: { type: Date,   required: true },
    attempts:  { type: Number, default: 0 },
  },

  // TTL index — MongoDB removes the document automatically after this date
  expiresAt: { type: Date, required: true },
});

// TTL index: document is deleted when the current time passes expiresAt
PendingUserSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PendingUser", PendingUserSchema);