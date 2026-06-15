const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary");
const path = require("path");

// ── Cloudinary storage ────────────────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    const baseName = path.basename(
      file.originalname,
      path.extname(file.originalname),
    );

    // Determine cloudinary resource_type
    let resourceType = "raw" || "auto"; // default for documents, code, etc.
    if (
      [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "svg",
        "ico",
        "bmp",
        "tiff",
      ].includes(ext)
    ) {
      resourceType = "image";
    } else if (
      ["mp4", "mov", "avi", "mkv", "webm", "flv", "wmv"].includes(ext)
    ) {
      resourceType = "video";
    } else if (["mp3", "wav", "ogg", "aac", "flac", "m4a"].includes(ext)) {
      resourceType = "video"; // cloudinary handles audio under video
    } else if (
      [
        "jsx",
        "js",
        "ts",
        "tsx",
        "py",
        "java",
        "c",
        "cpp",
        "html",
        "css",
        "json",
        "xml",
        "php",
      ].includes(ext)
    ) {
      resourceType = "auto" || "raw"; // code files can be treated as auto/raw
    }

    return {
      folder: `postboard/${req.user._id}`,
      public_id: `${Date.now()}-${baseName}`,
      resource_type: resourceType,
    };
  },
});

// ── File filter ───────────────────────────────────────────────────────────────
const ALLOWED_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  // Video
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/webm",
  // Audio
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/aac",
  "audio/flac",
  "audio/mp4",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  // Code files
  "text/javascript",
  "application/javascript",
  "text/typescript",
  "text/x-python",
  "text/x-java-source",
  "text/x-c",
  "text/x-c++src",
  "text/html",
  "text/css",
  "application/json",
  "application/xml",
  "text/xml",
  "text/x-php",
  "application/x-httpd-php",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
];

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type '${file.mimetype}' is not supported.`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB per file
});

module.exports = upload;
