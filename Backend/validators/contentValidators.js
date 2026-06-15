const { body, param, query } = require("express-validator");

// ── Upload file ───────────────────────────────────────────────────────────────
const uploadFileValidation = [
  body("name").optional().trim().isLength({ max: 255 }).withMessage("Name cannot exceed 255 characters"),
  body("section").optional().isIn(["myfile", "draft"]).withMessage("Section must be myfile or draft"),
  body("isCoded").optional().isBoolean().withMessage("isCoded must be a boolean"),
  body("parentFolder").optional().isMongoId().withMessage("Invalid folder ID"),
];

// ── Create folder ─────────────────────────────────────────────────────────────
const createFolderValidation = [
  body("name").trim().notEmpty().withMessage("Folder name is required").isLength({ max: 255 }).withMessage("Name cannot exceed 255 characters"),
  body("section").optional().isIn(["myfile", "draft"]).withMessage("Section must be myfile or draft"),
  body("parentFolder").optional().isMongoId().withMessage("Invalid folder ID"),
];

// ── Create message ────────────────────────────────────────────────────────────
const createMessageValidation = [
  body("body").trim().notEmpty().withMessage("Message body is required"),
  body("name").optional().trim().isLength({ max: 255 }).withMessage("Name cannot exceed 255 characters"),
  body("isDraft").optional().isBoolean().withMessage("isDraft must be a boolean"),
  body("isCoded").optional().isBoolean().withMessage("isCoded must be a boolean"),
];

// ── Create link ───────────────────────────────────────────────────────────────
const createLinkValidation = [
  body("body").trim().notEmpty().withMessage("Link URL is required").isURL().withMessage("Please provide a valid URL"),
  body("name").optional().trim().isLength({ max: 255 }).withMessage("Name cannot exceed 255 characters"),
  body("isDraft").optional().isBoolean().withMessage("isDraft must be a boolean"),
  body("isCoded").optional().isBoolean().withMessage("isCoded must be a boolean"),
];

// ── Update content ────────────────────────────────────────────────────────────
const updateContentValidation = [
  param("id").isMongoId().withMessage("Invalid content ID"),
  body("name").optional().trim().isLength({ max: 255 }).withMessage("Name cannot exceed 255 characters"),
  body("body").optional().trim(),
  body("section").optional().isIn(["myfile", "home"]).withMessage("Invalid section"),
];

// ── Decode content ────────────────────────────────────────────────────────────
const decodeContentValidation = [
  param("id").isMongoId().withMessage("Invalid content ID"),
  body("key").trim().notEmpty().withMessage("Decode key is required"),
];

// ── Share content ─────────────────────────────────────────────────────────────
const shareContentValidation = [
  param("id").isMongoId().withMessage("Invalid content ID"),
  body("shareWith").notEmpty().withMessage("shareWith is required"),
];

// ── Section query ─────────────────────────────────────────────────────────────
const sectionQueryValidation = [
  param("section")
    .isIn(["home", "myfile", "shared-with-me", "coded", "draft", "trash"])
    .withMessage("Invalid section"),
  query("page").optional().isInt({ min: 1 }).withMessage("Page must be a positive integer"),
  query("limit").optional().isInt({ min: 1, max: 200 }).withMessage("Limit must be between 1 and 100"),
  query("type").optional().isIn(["image","video","audio","document","code","folder","message","link"]).withMessage("Invalid type filter"),
];

module.exports = {
  uploadFileValidation,
  createFolderValidation,
  createMessageValidation,
  createLinkValidation,
  updateContentValidation,
  decodeContentValidation,
  shareContentValidation,
  sectionQueryValidation,
};