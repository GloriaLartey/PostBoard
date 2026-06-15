const path    = require("path");
const crypto  = require("crypto");
const mime    = require("mime-types");

// ── Derive type from mimetype or extension ────────────────────────────────────
const getContentType = (mimetype, ext) => {
  if (!mimetype && !ext) return "document";
  const m = (mimetype || "").toLowerCase();
  const e = (ext    || "").toLowerCase().replace(".", "");

  if (m.startsWith("image/"))                                    return "image";
  if (m.startsWith("video/"))                                    return "video";
  if (m.startsWith("audio/"))                                    return "audio";

  const codeExts = ["js","ts","jsx","tsx","py","java","c","cpp","cs","php",
                    "rb","go","rs","swift","kt","html","css","scss","json",
                    "xml","yaml","yml","sh","bash","sql","md","vue","dart"];
  if (codeExts.includes(e))                                      return "code";

  return "document";
};

// ── Get clean extension from original filename ────────────────────────────────
const getExtension = (filename) => {
  const ext = path.extname(filename || "").replace(".", "").toLowerCase();
  return ext || null;
};

// ── Format bytes to human-readable string ────────────────────────────────────
const formatSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

// ── Generate a decode key pair ────────────────────────────────────────────────
// Returns { rawKey, hashedKey }
// Store only hashedKey in DB. Email rawKey to shared users.
const generateDecodeKey = () => {
  const rawKey    = crypto.randomBytes(16).toString("hex").toUpperCase();
  const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
  return { rawKey, hashedKey };
};

// ── Verify a submitted decode key against stored hash ─────────────────────────
const verifyDecodeKey = (rawKey, hashedKey) => {
  const hash = crypto.createHash("sha256").update(rawKey).digest("hex");
  return hash === hashedKey;
};

module.exports = {
  getContentType,
  getExtension,
  formatSize,
  generateDecodeKey,
  verifyDecodeKey,
};