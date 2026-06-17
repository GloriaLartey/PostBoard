const mongoose = require("mongoose");
const Content = require("../models/content");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const {
  getContentType,
  getExtension,
  generateDecodeKey,
  verifyDecodeKey,
} = require("../utils/contentHelpers");
const { sendDecodeKeyEmail } = require("../utils/emailService");

const TRASH_TTL_DAYS = 50;

// ─────────────────────────────────────────────────────────────────────────────
//  SHARED HELPERS
// ─────────────────────────────────────────────────────────────────────────────

// Resolve shareWith → { sharedWithAll, sharedWith[] }
const resolveShareTargets = async (shareWith, ownerId) => {
  if (shareWith === "all") {
    const users = await User.find(
      { _id: { $ne: ownerId }, isActive: true },
      "_id",
    );
    return {
      sharedWithAll: true,
      sharedWith: users.map((u) => ({ user: u._id })),
    };
  }
  if (Array.isArray(shareWith) && shareWith.length > 0) {
    const ids = shareWith
      .filter((id) => id !== String(ownerId))
      .map((id) => ({ user: new mongoose.Types.ObjectId(id) }));
    return { sharedWithAll: false, sharedWith: ids };
  }
  return { sharedWithAll: false, sharedWith: [] };
};

// Parse shareWith from body (string JSON or array)
const buildSharing = async (shareWith, ownerId) => {
  return resolveShareTargets(
    shareWith
      ? Array.isArray(shareWith)
        ? shareWith
        : JSON.parse(shareWith)
      : [],
    ownerId,
  );
};

// Generate decode key pair
const buildCoding = (coded) => {
  if (!coded)
    return { isCoded: false, decodeKeyHash: null, rawDecodeKey: null };
  const { rawKey, hashedKey } = generateDecodeKey();
  return { isCoded: true, decodeKeyHash: hashedKey, rawDecodeKey: rawKey };
};

// Email decode keys to all shared recipients
const emailDecodeKeys = async (
  sharing,
  senderUsername,
  contentName,
  rawDecodeKey,
) => {
  if (!rawDecodeKey || !sharing.sharedWith.length) return;
  const recipients = await User.find(
    { _id: { $in: sharing.sharedWith.map((s) => s.user) } },
    "email username",
  );
  await Promise.allSettled(
    recipients.map((r) =>
      sendDecodeKeyEmail({
        to: r.email,
        recipientUsername: r.username,
        senderUsername,
        contentName,
        decodeKey: rawDecodeKey,
      }),
    ),
  );
};

// ═════════════════════════════════════════════════════════════════════════════
//  UPLOAD SINGLE FILE  →  POST /api/content/upload
//  Sends file to Cloudinary, saves record in DB.
//  Body (multipart/form-data): file, name?, description?, section?,
//                               isCoded?, shareWith?, parentFolder?
// ═════════════════════════════════════════════════════════════════════════════
exports.uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) return errorResponse(res, "No file provided.", 400);

    const {
      name,
      description = "",
      shareWith,
      section = "myfile",
      isCoded = false,
      parentFolder,
    } = req.body;

    const userId = req.user._id;
    const sharing = await buildSharing(shareWith, userId);
    const coding = buildCoding(isCoded === "true" || isCoded === true);
    const ext = getExtension(req.file.originalname);
    const type = getContentType(req.file.mimetype, ext);
    const fileName = name?.trim() || req.file.originalname;
    const finalSection = section; // section is always set by caller (myfile or draft)

    const content = await Content.create({
      owner: userId,
      name: fileName,
      description,
      category: "uploaded",
      type,
      extension: ext,
      size: req.file.size,
      mimeType: req.file.mimetype,
      cloudinary: {
        publicId: req.file.filename,
        url: req.file.path,
        resourceType: req.file.resource_type || "raw",
      },
      section: finalSection,
      sharedWith: sharing.sharedWith,
      sharedWithAll: sharing.sharedWithAll,
      isCoded: coding.isCoded,
      decodeKeyHash: coding.decodeKeyHash,
      parentFolder: parentFolder || null,
    });

    await emailDecodeKeys(
      sharing,
      req.user.username,
      fileName,
      coding.rawDecodeKey,
    );

    return successResponse(
      res,
      "File uploaded successfully.",
      { content },
      201,
    );
  } catch (err) {
    console.error("uploadSingleFile error:", err);
    return errorResponse(res, "Failed to upload file.", 500);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  UPLOAD FOLDER  →  POST /api/content/upload-folder
//  Folders are DB-only documents. Files inside go to Cloudinary.
//  Body (multipart/form-data):
//    files[]       — all files in the folder
//    relativePaths — JSON array matching files[] order
//    name?         — override root folder name
//    section?      — myfile | draft
//    shareWith?    — "all" | JSON array of userIds
//    isCoded?      — boolean
//    parentFolder? — mongoId to nest inside
// ═════════════════════════════════════════════════════════════════════════════
exports.uploadFolder = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, "No files provided.", 400);
    }

    const {
      name,
      shareWith,
      section = "myfile",
      isCoded = false,
      parentFolder,
      relativePaths: rawPaths,
    } = req.body;

    const userId = req.user._id;
    const sharing = await buildSharing(shareWith, userId);
    const coding = buildCoding(isCoded === "true" || isCoded === true);
    const finalSection = section;

    const relativePaths = rawPaths
      ? JSON.parse(rawPaths)
      : req.files.map((f) => f.originalname);

    const rootName =
      name?.trim() || relativePaths[0].split("/")[0] || "Uploaded Folder";

    // Create root folder (DB only)
    const rootFolder = await Content.create({
      owner: userId,
      name: rootName,
      category: "uploaded",
      type: "folder",
      extension: null,
      size: 0,
      section: finalSection,
      sharedWith: sharing.sharedWith,
      sharedWithAll: sharing.sharedWithAll,
      parentFolder: parentFolder || null,
    });

    const folderCache = { [rootName]: rootFolder._id };
    let uploadedCount = 0;

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const relativePath = relativePaths[i] || file.originalname;
      const parts = relativePath.split("/").filter(Boolean);
      const subDirParts = parts.slice(1, -1);
      const fileName = parts[parts.length - 1];

      let parentId = rootFolder._id;
      let cumulativePath = rootName;

      for (const dirName of subDirParts) {
        cumulativePath = `${cumulativePath}/${dirName}`;
        if (folderCache[cumulativePath]) {
          parentId = folderCache[cumulativePath];
        } else {
          const subFolder = await Content.create({
            owner: userId,
            name: dirName,
            category: "uploaded",
            type: "folder",
            extension: null,
            size: 0,
            section: finalSection,
            sharedWith: sharing.sharedWith,
            sharedWithAll: sharing.sharedWithAll,
            parentFolder: parentId,
          });
          folderCache[cumulativePath] = subFolder._id;
          parentId = subFolder._id;
        }
      }

      const ext = getExtension(fileName);
      const type = getContentType(file.mimetype, ext);

      await Content.create({
        owner: userId,
        name: fileName,
        category: "uploaded",
        type,
        extension: ext,
        size: file.size,
        mimeType: file.mimetype,
        cloudinary: {
          publicId: file.filename,
          url: file.path,
          resourceType: file.resource_type || "raw",
        },
        section: finalSection,
        sharedWith: sharing.sharedWith,
        sharedWithAll: sharing.sharedWithAll,
        isCoded: coding.isCoded,
        decodeKeyHash: coding.decodeKeyHash,
        parentFolder: parentId,
      });

      uploadedCount++;
    }

    await emailDecodeKeys(
      sharing,
      req.user.username,
      rootName,
      coding.rawDecodeKey,
    );

    return successResponse(
      res,
      `Folder uploaded. ${uploadedCount} file(s) added.`,
      { rootFolder, fileCount: uploadedCount },
      201,
    );
  } catch (err) {
    console.error("uploadFolder error:", err);
    return errorResponse(res, "Failed to upload folder.", 500);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  CREATE EMPTY FOLDER  →  POST /api/content/folder
//  DB only, nothing to Cloudinary.
//  Body: { name, section?, shareWith?, parentFolder? }
// ═════════════════════════════════════════════════════════════════════════════
exports.createFolder = async (req, res) => {
  try {
    const { name, shareWith, section = "myfile", parentFolder } = req.body;
    if (!name) return errorResponse(res, "Folder name is required.", 400);

    const userId = req.user._id;
    const sharing = await buildSharing(shareWith, userId);
    const finalSection = section;

    const folder = await Content.create({
      owner: userId,
      name: name.trim(),
      category: "uploaded",
      type: "folder",
      extension: null,
      size: 0,
      section: finalSection,
      sharedWith: sharing.sharedWith,
      sharedWithAll: sharing.sharedWithAll,
      parentFolder: parentFolder || null,
    });

    return successResponse(res, "Folder created.", { content: folder }, 201);
  } catch (err) {
    console.error("createFolder error:", err);
    return errorResponse(res, "Failed to create folder.", 500);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  CREATE MESSAGE  →  POST /api/content/message
// ═════════════════════════════════════════════════════════════════════════════
exports.createMessage = async (req, res) => {
  try {
    const {
      name,
      body,
      shareWith,
      section = "myfile",
      isDraft = false,
      isCoded = false,
      parentFolder,
    } = req.body;

    if (!body) return errorResponse(res, "Message body is required.", 400);

    const sharing = await buildSharing(shareWith, req.user._id);
    const coding = buildCoding(isCoded === true || isCoded === "true");
    const finalSection = isDraft ? "draft" : section;

    const message = await Content.create({
      owner: req.user._id,
      name: name?.trim() || "Untitled Message",
      category: "created",
      type: "message",
      extension: "msg",
      body,
      section: finalSection,
      sharedWith: sharing.sharedWith,
      sharedWithAll: sharing.sharedWithAll,
      isCoded: coding.isCoded,
      decodeKeyHash: coding.decodeKeyHash,
      parentFolder: parentFolder || null,
    });

    await emailDecodeKeys(
      sharing,
      req.user.username,
      message.name,
      coding.rawDecodeKey,
    );

    return successResponse(
      res,
      isDraft ? "Message saved to drafts." : "Message created successfully.",
      { content: message },
      201,
    );
  } catch (err) {
    console.error("createMessage error:", err);
    return errorResponse(res, "Failed to create message.", 500);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  CREATE LINK  →  POST /api/content/link
// ═════════════════════════════════════════════════════════════════════════════
exports.createLink = async (req, res) => {
  try {
    const {
      name,
      body,
      shareWith,
      section = "myfile",
      isDraft = false,
      isCoded = false,
      parentFolder,
    } = req.body;

    if (!body) return errorResponse(res, "Link URL is required.", 400);
    try {
      new URL(body);
    } catch {
      return errorResponse(res, "Please provide a valid URL.", 400);
    }

    const sharing = await buildSharing(shareWith, req.user._id);
    const coding = buildCoding(isCoded === true || isCoded === "true");
    const finalSection = isDraft ? "draft" : section;

    const link = await Content.create({
      owner: req.user._id,
      name: name?.trim() || body,
      category: "created",
      type: "link",
      extension: "lnk",
      body,
      section: finalSection,
      sharedWith: sharing.sharedWith,
      sharedWithAll: sharing.sharedWithAll,
      isCoded: coding.isCoded,
      decodeKeyHash: coding.decodeKeyHash,
      parentFolder: parentFolder || null,
    });

    await emailDecodeKeys(
      sharing,
      req.user.username,
      link.name,
      coding.rawDecodeKey,
    );

    return successResponse(
      res,
      isDraft ? "Link saved to drafts." : "Link created successfully.",
      { content: link },
      201,
    );
  } catch (err) {
    console.error("createLink error:", err);
    return errorResponse(res, "Failed to create link.", 500);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  GET SECTION CONTENTS  →  GET /api/content/section/:section
// ═════════════════════════════════════════════════════════════════════════════
exports.getSectionContents = async (req, res) => {
  try {
    const { section } = req.params;
    const { page = 1, limit = 200, type, search } = req.query;
    const userId = req.user._id;
    const skip = (Number(page) - 1) * Number(limit);

    let query = {};
    switch (section) {
      case "home":
        // Root-level contents the user owns AND has shared with at least one person or everyone
        query = {
          owner: userId,
          section: { $nin: ["trash", "draft"] },
          parentFolder: null,
          $or: [{ sharedWithAll: true }, { "sharedWith.0": { $exists: true } }],
        };
        break;

      case "myfile":
        // Root-level contents owned by this user (not inside any folder, excluding trash/draft)
        // Contents saved inside a folder are accessed by opening that folder
        query = {
          owner: userId,
          section: { $nin: ["trash", "draft"] },
          parentFolder: null,
        };
        break;

      case "shared-with-me":
        // Content shared with this user that they don't own
        query = {
          owner: { $ne: userId },
          section: { $nin: ["trash", "draft"] },
          $or: [{ "sharedWith.user": userId }, { sharedWithAll: true }],
        };
        break;

      case "coded":
        // All coded content accessible to this user (excluding trash/draft)
        query = {
          isCoded: true,
          section: { $nin: ["trash", "draft"] },
          $or: [
            { owner: userId },
            { "sharedWith.user": userId },
            { sharedWithAll: true },
          ],
        };
        break;

      case "draft":
        // Unsaved content belonging to this user
        query = { owner: userId, section: "draft" };
        break;

      case "trash":
        // Temporarily deleted content belonging to this user
        query = { owner: userId, section: "trash" };
        break;

      default:
        return errorResponse(res, "Invalid section.", 400);
    }

    if (type) query.type = type;
    if (search) query.name = { $regex: search, $options: "i" };

    const [contents, total] = await Promise.all([
      Content.find(query)
        .populate("owner", "username email avatar")
        .populate("sharedWith.user", "username email avatar")
        .populate("parentFolder", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select("-decodeKeyHash"),
      Content.countDocuments(query),
    ]);

    return successResponse(res, `${section} contents retrieved.`, {
      contents,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("getSectionContents error:", err);
    return errorResponse(res, "Failed to retrieve contents.", 500);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  GET SINGLE CONTENT  →  GET /api/content/:id
// ═════════════════════════════════════════════════════════════════════════════
exports.getContent = async (req, res) => {
  try {
    const userId = req.user._id;
    const content = await Content.findById(req.params.id)
      .populate("owner", "username email avatar")
      .populate("sharedWith.user", "username email avatar")
      .populate("parentFolder", "name")
      .select("-decodeKeyHash");

    if (!content) return errorResponse(res, "Content not found.", 404);

    const isOwner = String(content.owner._id) === String(userId);
    const isShared =
      content.sharedWithAll ||
      content.sharedWith.some((s) => String(s.user._id) === String(userId));

    if (!isOwner && !isShared) {
      return errorResponse(res, "You do not have access to this content.", 403);
    }

    if (content.isCoded && !isOwner) {
      content.body = null;
      if (content.cloudinary?.url) content.cloudinary.url = null;
    }

    return successResponse(res, "Content retrieved.", { content });
  } catch (err) {
    console.error("getContent error:", err);
    return errorResponse(res, "Failed to retrieve content.", 500);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  DECODE CONTENT  →  POST /api/content/:id/decode
// ═════════════════════════════════════════════════════════════════════════════
exports.decodeContent = async (req, res) => {
  try {
    const { key } = req.body;
    const userId = req.user._id;
    const content = await Content.findById(req.params.id).select(
      "+decodeKeyHash",
    );

    if (!content) return errorResponse(res, "Content not found.", 404);
    if (!content.isCoded)
      return errorResponse(res, "This content is not coded.", 400);

    const isOwner = String(content.owner) === String(userId);
    const isShared =
      content.sharedWithAll ||
      content.sharedWith.some((s) => String(s.user) === String(userId));

    if (!isOwner && !isShared) {
      return errorResponse(res, "You do not have access to this content.", 403);
    }

    if (!verifyDecodeKey(key, content.decodeKeyHash)) {
      return errorResponse(res, "Incorrect decode key.", 401);
    }

    const full = await Content.findById(req.params.id)
      .populate("owner", "username email avatar")
      .populate("sharedWith.user", "username email avatar")
      .select("-decodeKeyHash");

    return successResponse(res, "Content decoded successfully.", {
      content: full,
    });
  } catch (err) {
    console.error("decodeContent error:", err);
    return errorResponse(res, "Failed to decode content.", 500);
  }
};

exports.shareContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { shareWith } = req.body;

    const content = await Content.findById(id);

    if (!content) {
      return res.status(404).json({
        message: "Content not found",
      });
    }

    if (content.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized",
      });
    }

    if (shareWith === "all") {
      content.sharedWithAll = true;
      content.sharedWith = [];
    } else {
      content.sharedWithAll = false;

      content.sharedWith = shareWith.map((userId) => ({
        user: userId,
        sharedAt: new Date(),
      }));
    }

    content.lastModifiedAt = new Date();

    await content.save();

    return res.status(200).json({
      success: true,
      message: "Content shared successfully",
      content,
    });
  } catch (error) {
    console.error("shareContent error:", error);

    return res.status(500).json({
      message: "Failed to share content",
    });
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  ENCODE CONTENT  →  POST /api/content/:id/encode
// ═════════════════════════════════════════════════════════════════════════════
exports.encodeContent = async (req, res) => {
  try {
    const userId = req.user._id;
    const content = await Content.findById(req.params.id);

    if (!content) return errorResponse(res, "Content not found.", 404);
    if (String(content.owner) !== String(userId)) {
      return errorResponse(res, "Only the owner can encode this content.", 403);
    }

    const { rawKey, hashedKey } = generateDecodeKey();
    content.isCoded = true;
    content.decodeKeyHash = hashedKey;
    content.lastModifiedAt = new Date();
    await content.save();

    await sendDecodeKeyEmail({
      to: req.user.email,
      senderUsername: req.user.username,
      contentName: content.name,
      decodeKey: rawKey,
    });

    return successResponse(
      res,
      "Content encoded. Decode keys sent to your email.",
    );
  } catch (err) {
    console.error("encodeContent error:", err);
    return errorResponse(res, "Failed to encode content.", 500);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  UPDATE CONTENT  →  PATCH /api/content/:id
// ═════════════════════════════════════════════════════════════════════════════
exports.updateContent = async (req, res) => {
  try {
    const userId = req.user._id;
    const content = await Content.findById(req.params.id);

    if (!content) return errorResponse(res, "Content not found.", 404);
    if (String(content.owner) !== String(userId)) {
      return errorResponse(res, "Only the owner can edit this content.", 403);
    }
    if (content.section === "trash") {
      return errorResponse(res, "Restore this content before editing.", 400);
    }

    const { name, body, description, section } = req.body;

    if (name) content.name = name;
    if (description !== undefined) content.description = description;
    if (body !== undefined && content.category === "created")
      content.body = body;
    if (section && section !== "draft" && content.section === "draft") {
      content.section = section;
    }

    content.lastModifiedAt = new Date();
    await content.save();

    return successResponse(res, "Content updated.", { content });
  } catch (err) {
    console.error("updateContent error:", err);
    return errorResponse(res, "Failed to update content.", 500);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  MOVE TO TRASH  →  DELETE /api/content/:id
// ═════════════════════════════════════════════════════════════════════════════
exports.moveToTrash = async (req, res) => {
  try {
    const userId = req.user._id;
    const content = await Content.findById(req.params.id);

    if (!content) return errorResponse(res, "Content not found.", 404);
    if (String(content.owner) !== String(userId)) {
      return errorResponse(res, "Only the owner can delete this content.", 403);
    }
    if (content.section === "trash") {
      return errorResponse(res, "Content is already in trash.", 400);
    }

    const permanentDeleteAt = new Date(
      Date.now() + TRASH_TTL_DAYS * 24 * 60 * 60 * 1000,
    );
    content.section = "trash";
    content.trashedAt = new Date();
    content.permanentDeleteAt = permanentDeleteAt;
    content.lastModifiedAt = new Date();
    await content.save();

    return successResponse(res, "Content moved to trash.", {
      permanentDeleteAt,
    });
  } catch (err) {
    console.error("moveToTrash error:", err);
    return errorResponse(res, "Failed to move content to trash.", 500);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  RESTORE FROM TRASH  →  PATCH /api/content/:id/restore
// ═════════════════════════════════════════════════════════════════════════════
exports.restoreFromTrash = async (req, res) => {
  try {
    const userId = req.user._id;
    const content = await Content.findById(req.params.id);

    if (!content) return errorResponse(res, "Content not found.", 404);
    if (String(content.owner) !== String(userId)) {
      return errorResponse(
        res,
        "Only the owner can restore this content.",
        403,
      );
    }
    if (content.section !== "trash") {
      return errorResponse(res, "Content is not in trash.", 400);
    }

    content.section = "myfile"; // always restore to My Files
    content.trashedAt = null;
    content.permanentDeleteAt = null;
    content.lastModifiedAt = new Date();
    await content.save();

    return successResponse(res, "Content restored successfully.", { content });
  } catch (err) {
    console.error("restoreFromTrash error:", err);
    return errorResponse(res, "Failed to restore content.", 500);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  PERMANENTLY DELETE  →  DELETE /api/content/:id/permanent
// ═════════════════════════════════════════════════════════════════════════════
exports.permanentDelete = async (req, res) => {
  try {
    const userId = req.user._id;
    const content = await Content.findById(req.params.id);

    if (!content) return errorResponse(res, "Content not found.", 404);
    if (String(content.owner) !== String(userId)) {
      return errorResponse(
        res,
        "Only the owner can permanently delete this content.",
        403,
      );
    }
    if (content.section !== "trash") {
      return errorResponse(
        res,
        "Move content to trash before permanently deleting.",
        400,
      );
    }

    if (content.cloudinary?.publicId) {
      await cloudinary.uploader.destroy(content.cloudinary.publicId, {
        resource_type: content.cloudinary.resourceType || "raw",
      });
    }

    await Content.deleteOne({ _id: content._id });

    return successResponse(res, "Content permanently deleted.");
  } catch (err) {
    console.error("permanentDelete error:", err);
    return errorResponse(res, "Failed to permanently delete content.", 500);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  GET FOLDER CONTENTS  →  GET /api/content/folder/:id/contents
// ═════════════════════════════════════════════════════════════════════════════
exports.getFolderContents = async (req, res) => {
  try {
    const userId = req.user._id;
    const folderId = req.params.id;
    const folder = await Content.findById(folderId);

    if (!folder || folder.type !== "folder") {
      return errorResponse(res, "Folder not found.", 404);
    }

    const isOwner = String(folder.owner) === String(userId);
    const isShared =
      folder.sharedWithAll ||
      folder.sharedWith.some((s) => String(s.user) === String(userId));

    if (!isOwner && !isShared) {
      return errorResponse(res, "You do not have access to this folder.", 403);
    }

    const contents = await Content.find({
      parentFolder: folderId,
      section: { $ne: "trash" },
    })
      .populate("owner", "username email avatar")
      .select("-decodeKeyHash")
      .sort({ createdAt: -1 });

    return successResponse(res, "Folder contents retrieved.", {
      folder,
      contents,
    });
  } catch (err) {
    console.error("getFolderContents error:", err);
    return errorResponse(res, "Failed to retrieve folder contents.", 500);
  }
};

// ═════════════════════════════════════════════════════════════════════════════
//  SEARCH CONTENTS  →  GET /api/content/search?q=&type=&category=
// ═════════════════════════════════════════════════════════════════════════════
exports.searchContents = async (req, res) => {
  try {
    const { q, type, category, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    const skip = (Number(page) - 1) * Number(limit);

    if (!q) return errorResponse(res, "Search query is required.", 400);

    const query = {
      section: { $ne: "trash" },
      name: { $regex: q, $options: "i" },
      $or: [
        { owner: userId },
        { "sharedWith.user": userId },
        { sharedWithAll: true },
      ],
    };

    if (type) query.type = type;
    if (category) query.category = category;

    const [contents, total] = await Promise.all([
      Content.find(query)
        .populate("owner", "username email avatar")
        .select("-decodeKeyHash")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Content.countDocuments(query),
    ]);

    return successResponse(res, "Search results.", {
      contents,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error("searchContents error:", err);
    return errorResponse(res, "Search failed.", 500);
  }
};
