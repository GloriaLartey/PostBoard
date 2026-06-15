const express = require("express");
const router  = express.Router();

const {
  uploadSingleFile,
  uploadFolder,
  createFolder,
  createMessage,
  createLink,
  getSectionContents,
  getContent,
  decodeContent,
  shareContent,
  encodeContent,
  updateContent,
  moveToTrash,
  restoreFromTrash,
  permanentDelete,
  getFolderContents,
  searchContents,
} = require("../controllers/contentController");

const { protect } = require("../middleware/authMiddleware");
const validate    = require("../middleware/validate");
const multer = require("../config/multer");

const {
  uploadFileValidation,
  createFolderValidation,
  createMessageValidation,
  createLinkValidation,
  updateContentValidation,
  decodeContentValidation,
  shareContentValidation,
  sectionQueryValidation,
} = require("../validators/contentValidators");

// All content routes require authentication
router.use(protect);

// ── Uploads ───────────────────────────────────────────────────────────────────
router.post("/upload", multer.single("file"), uploadFileValidation, validate, uploadSingleFile);
router.post("/upload-folder",  multer.array("files"),  uploadFileValidation,   validate, uploadFolder);
router.post("/folder", createFolderValidation, validate, createFolder);

// ── Created contents ──────────────────────────────────────────────────────────
router.post("/message", createMessageValidation, validate, createMessage);
router.post("/link",    createLinkValidation,    validate, createLink);

// ── Sections & search ─────────────────────────────────────────────────────────
router.get("/search",              searchContents);
router.get("/section/:section",    sectionQueryValidation, validate, getSectionContents);
router.get("/folder/:id/contents", getFolderContents);

// ── Single content ────────────────────────────────────────────────────────────
router.get("/:id", getContent);

// ── Actions ───────────────────────────────────────────────────────────────────
router.patch("/:id", updateContentValidation, validate, updateContent);
router.post("/:id/share", shareContentValidation,  validate, shareContent);
router.post("/:id/encode", encodeContent);
router.post("/:id/decode", decodeContentValidation, validate, decodeContent);
router.patch("/:id/restore",    restoreFromTrash);
router.delete("/:id",           moveToTrash);
router.delete("/:id/permanent", permanentDelete);

module.exports = router;