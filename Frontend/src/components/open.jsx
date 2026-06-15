import { useState, useEffect } from "react";
import {
  FiX,
  FiEdit3,
  FiShare2,
  FiLock,
  FiDownload,
  FiFileText,
  FiImage,
  FiVideo,
  FiCode,
  FiFolder,
  FiLink,
  FiMessageSquare,
  FiMusic,
  FiSave,
  FiTrash2,
  FiCheck,
  FiLoader,
} from "react-icons/fi";
import { useUpdateContent } from "../hooks/useContent";
import Share from "./share";
import EncodeButton from "./encode";

// ── Media preview ─────────────────────────────────────────────────────────────
function MediaPreview({ content }) {
  const url = content.cloudinary?.url;
  const type = content.type;

  if (type === "image" && url) {
    return (
      <div className="w-full rounded-2xl overflow-hidden bg-gray-50 flex items-center justify-center max-h-80">
        <img
          src={url}
          alt={content.name}
          className="max-w-full max-h-80 object-contain"
        />
      </div>
    );
  }

  if (type === "video" && url) {
    return (
      <video controls className="w-full rounded-2xl max-h-80 bg-black">
        <source src={url} />
        Your browser does not support video.
      </video>
    );
  }

  if (type === "audio" && url) {
    return (
      <div className="w-full bg-gray-50 rounded-2xl p-6 flex flex-col items-center gap-4">
        <FiMusic size={48} className="text-orange-400" />
        <audio controls className="w-full">
          <source src={url} />
        </audio>
      </div>
    );
  }

  if ((type === "document" || type === "code") && url) {
    // For PDFs show an embed; others show a download link
    const isPdf = content.extension === "pdf";
    if (isPdf) {
      return (
        <iframe
          src={url}
          title={content.name}
          className="w-full h-80 rounded-2xl border border-gray-200"
        />
      );
    }
    return (
      <div className="w-full bg-gray-50 rounded-2xl p-6 flex flex-col items-center gap-3">
        <FiFileText size={48} className="text-blue-400" />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition text-sm font-medium">
          <FiDownload size={14} /> Open / Download
        </a>
      </div>
    );
  }

  // Fallback icon
  const icons = {
    folder: <FiFolder size={56} className="text-yellow-500" />,
    message: <FiMessageSquare size={56} className="text-blue-500" />,
    link: <FiLink size={56} className="text-purple-500" />,
  };
  return (
    <div className="w-full bg-gray-50 rounded-2xl p-10 flex items-center justify-center">
      {icons[type] || <FiFileText size={56} className="text-blue-400" />}
    </div>
  );
}

// ── Edit panel ────────────────────────────────────────────────────────────────
function EditPanel({ content, onSave, onDiscard }) {
  const [name, setName] = useState(content.name || "");
  const [body, setBody] = useState(content.body || "");
  const [description, setDesc] = useState(content.description || "");

  const updateMutation = useUpdateContent();

  const handleSave = async () => {
    const updates = { name };
    if (content.category === "created") updates.body = body;
    if (content.category === "uploaded") updates.description = description;
    try {
      await updateMutation.mutateAsync({ id: content._id, updates });
      onSave({ ...content, name, body, description });
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name..."
        className="border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 text-sm"
      />

      {content.category === "created" && (
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={content.type === "link" ? "URL..." : "Message body..."}
          rows={content.type === "message" ? 8 : 3}
          className="border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 resize-none text-sm"
        />
      )}

      {content.category === "uploaded" && (
        <textarea
          value={description}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Description / note..."
          rows={4}
          className="border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 resize-none text-sm"
        />
      )}

      <div className="flex gap-3 mt-2">
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition disabled:opacity-50 text-sm font-medium">
          {updateMutation.isPending ? (
            <FiLoader className="animate-spin" size={14} />
          ) : (
            <FiSave size={14} />
          )}
          {updateMutation.isPending ? "Saving…" : "Save"}
        </button>
        <button
          onClick={onDiscard}
          className="flex items-center gap-2 bg-gray-100 text-gray-600 px-5 py-2.5 rounded-xl hover:bg-gray-200 transition text-sm font-medium">
          <FiTrash2 size={14} /> Discard
        </button>
      </div>

      {updateMutation.error && (
        <p className="text-red-500 text-xs">
          {updateMutation.error?.response?.data?.message || "Save failed."}
        </p>
      )}
    </div>
  );
}

// ── Main Open component ───────────────────────────────────────────────────────
export default function Open({ isOpen, onClose, content: initialContent }) {
  const [content, setContent] = useState(initialContent);
  const [editMode, setEditMode] = useState(false);

  // Sync when content prop changes
  useEffect(() => {
    setContent(initialContent);
    setEditMode(false);
  }, [initialContent]);

  if (!isOpen || !content) return null;

  const handleSaved = (updated) => {
    setContent(updated);
    setEditMode(false);
  };

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "—";
  const formatSize = (b) => {
    if (!b || b === 0) return null;
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex-1 min-w-0 mr-4">
            <h2 className="text-xl font-bold text-gray-800 truncate">
              {content.name}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5 capitalize">
              {content.type}
            </p>
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Edit */}
            <button
              onClick={() => setEditMode((e) => !e)}
              title="Edit"
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                editMode
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100 text-gray-500"
              }`}>
              {editMode ? <FiCheck size={16} /> : <FiEdit3 size={16} />}
            </button>

            {/* Encode */}
            <EncodeButton content={content} />

            {/* Share */}
            <Share content={content} />

            {/* Download for uploaded files */}
            {content.cloudinary?.url && (
              <a
                href={content.cloudinary.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 text-gray-500 transition"
                title="Download">
                <FiDownload size={16} />
              </a>
            )}

            {/* Close */}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 text-gray-500 transition">
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-6 flex flex-col gap-5">
          {/* Media preview */}
          {!editMode && <MediaPreview content={content} />}

          {/* Edit panel */}
          {editMode && (
            <EditPanel
              content={content}
              onSave={handleSaved}
              onDiscard={() => setEditMode(false)}
            />
          )}

          {/* Message/link body (view mode) */}
          {!editMode && content.category === "created" && content.body && (
            <div className="bg-gray-50 rounded-2xl p-4">
              {content.type === "link" ? (
                <a
                  href={content.body}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all">
                  {content.body}
                </a>
              ) : (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {content.body}
                </p>
              )}
            </div>
          )}

          {/* Description (view mode) */}
          {!editMode && content.description && (
            <div className="bg-gray-50 rounded-2xl p-4">
              <p className="text-xs text-gray-400 font-medium mb-1 uppercase tracking-wide">
                Description
              </p>
              <p className="text-sm text-gray-700">{content.description}</p>
            </div>
          )}

          {/* Metadata */}
          {!editMode && (
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Type", content.type],
                ["Category", content.category],
                content.size > 0 ? ["Size", formatSize(content.size)] : null,
                content.extension
                  ? ["Extension", `.${content.extension}`]
                  : null,
                ["Added", formatDate(content.createdAt)],
                ["Modified", formatDate(content.lastModifiedAt)],
                content.owner?.username
                  ? ["Owner", content.owner.username]
                  : null,
                content.sharedWithAll
                  ? ["Shared with", "Everyone"]
                  : content.sharedWith?.length > 0
                    ? ["Shared with", `${content.sharedWith.length} user(s)`]
                    : null,
              ]
                .filter(Boolean)
                .map(([label, value]) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                      {label}
                    </p>
                    <p className="text-gray-700 font-medium capitalize">
                      {value}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
