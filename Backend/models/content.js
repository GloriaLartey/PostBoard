const mongoose = require("mongoose");

// ─────────────────────────────────────────────────────────────────────────────
//  Sub-schema: share entry
// ─────────────────────────────────────────────────────────────────────────────
const ShareEntrySchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sharedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
//  Main Content schema
// ─────────────────────────────────────────────────────────────────────────────
const ContentSchema = new mongoose.Schema(
  {
    // ── Ownership ─────────────────────────────────────────────────────────────
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  "User",
      required: true,
      index: true,
    },

    // ── Identity ──────────────────────────────────────────────────────────────
    name: {
      type:     String,
      required: [true, "Content name is required"],
      trim:     true,
      maxlength: [255, "Name cannot exceed 255 characters"],
    },

    // ── Category: uploaded | created ──────────────────────────────────────────
    category: {
      type:     String,
      enum:     ["uploaded", "created"],
      required: true,
    },

    // ── Type within category ──────────────────────────────────────────────────
    // uploaded: image | video | audio | document | code | folder
    // created:  message | link
    type: {
      type:     String,
      enum:     ["image","video","audio","document","code","folder","message","link"],
      required: true,
    },

    // ── Extension ─────────────────────────────────────────────────────────────
    // folders → no extension
    // messages → "msg" | link messages → "lnk"
    // uploaded files → actual extension e.g. "pdf", "jpg", "mp4"
    extension: {
      type:    String,
      trim:    true,
      lowercase: true,
      default: null,
    },

    // ── File metadata (uploaded contents only) ────────────────────────────────
    size: {
      type:    Number, // bytes
      default: 0,
    },

    mimeType: {
      type:    String,
      default: null,
    },

    // ── Cloudinary (uploaded files only) ─────────────────────────────────────
    cloudinary: {
      publicId:    { type: String, default: null },
      url:         { type: String, default: null },
      resourceType:{ type: String, default: null },
    },

    // ── Created content body ──────────────────────────────────────────────────
    // message → plain text | link → URL string
    body: {
      type:    String,
      default: null,
    },

    description: { type: String, default: "", trim: true },

    // ── Folder children ───────────────────────────────────────────────────────
    parentFolder: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     "Content",
      default: null,
      index:   true,
    },

    // ── Coding / encryption ───────────────────────────────────────────────────
    isCoded: {
      type:    Boolean,
      default: false,
    },

    // Hashed decode key — raw key is emailed to shared users, never stored plain
    decodeKeyHash: {
      type:   String,
      select: false,
      default: null,
    },

    // ── Sharing ───────────────────────────────────────────────────────────────
    sharedWith: {
      type:    [ShareEntrySchema],
      default: [],
    },

    // true = shared with every user in the system
    sharedWithAll: {
      type:    Boolean,
      default: false,
    },

    // ── Containers / sections ─────────────────────────────────────────────────
    // Where this content lives:
    // home       → visible in Home feed (auto-set when shared)
    // myfile     → saved by owner to My Files
    // draft      → incomplete / not yet saved
    // trash      → soft-deleted
    section: {
      type:    String,
      enum:    ["home", "myfile", "draft", "trash", "coded", "shared-with-me"],
      default: "myfile",
      index:   true,
    },

    // ── Trash metadata ────────────────────────────────────────────────────────
    trashedAt: {
      type:    Date,
      default: null,
    },

    // Auto-delete 50 days after trashing (set by controller)
    permanentDeleteAt: {
      type:    Date,
      default: null,
    },

    // ── Audit ─────────────────────────────────────────────────────────────────
    lastModifiedAt: {
      type:    Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
ContentSchema.index({ owner: 1, section: 1 });
ContentSchema.index({ "sharedWith.user": 1 });
ContentSchema.index({ permanentDeleteAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-delete from trash

// ── Virtual: isInTrash ────────────────────────────────────────────────────────
ContentSchema.virtual("isInTrash").get(function () {
  return this.section === "trash";
});

module.exports = mongoose.model("Content", ContentSchema);