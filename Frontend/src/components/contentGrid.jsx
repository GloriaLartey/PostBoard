import { useState } from "react";
import {
  FiStar, FiFileText, FiImage, FiVideo, FiCode,
  FiFolder, FiLink, FiMessageSquare, FiMusic,
  FiGrid, FiList, FiUsers, FiLock,
} from "react-icons/fi";
import ThreeDotsMenu from "./threeDotsMenu";
import Open from "./open";
import { useMoveToTrash } from "../hooks/useContent";

const FILES_PER_PAGE = 12;

export function getFileIcon(type, size = 20) {
  const props = { size };
  switch (type) {
    case "image":   return <FiImage {...props} />;
    case "video":   return <FiVideo {...props} />;
    case "code":    return <FiCode {...props} />;
    case "folder":  return <FiFolder {...props} />;
    case "link":    return <FiLink {...props} />;
    case "message": return <FiMessageSquare {...props} />;
    case "audio":   return <FiMusic {...props} />;
    default:        return <FiFileText {...props} />;
  }
}

const TYPE_COLORS = {
  folder:  { bg: "bg-yellow-50",  text: "text-yellow-500"  },
  image:   { bg: "bg-pink-50",    text: "text-pink-500"    },
  video:   { bg: "bg-red-50",     text: "text-red-500"     },
  audio:   { bg: "bg-orange-50",  text: "text-orange-500"  },
  code:    { bg: "bg-green-50",   text: "text-green-500"   },
  message: { bg: "bg-blue-50",    text: "text-blue-500"    },
  link:    { bg: "bg-purple-50",  text: "text-purple-500"  },
  default: { bg: "bg-blue-50",    text: "text-blue-600"    },
};

function colorFor(type) {
  return TYPE_COLORS[type] || TYPE_COLORS.default;
}

function sortStarredFirst(files, starred) {
  return [...files].sort((a, b) => {
    const aS = starred[a._id] ? 1 : 0;
    const bS = starred[b._id] ? 1 : 0;
    return bS - aS;
  });
}

function formatSize(bytes) {
  if (!bytes || bytes === 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function ShareBadge({ content }) {
  if (content.sharedWithAll) {
    return (
      <span className="flex items-center gap-1 text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
        <FiUsers size={10} /> Everyone
      </span>
    );
  }
  if (content.sharedWith?.length > 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
        <FiUsers size={10} /> {content.sharedWith.length}
      </span>
    );
  }
  return null;
}

// ── Grid card ─────────────────────────────────────────────────────────────────
function GridCard({ file, starred, onStar, onOpen, onRename, onDelete }) {
  const { bg, text } = colorFor(file.type);
  const isStarred = starred[file._id];

  return (
    <div
      onClick={() => onOpen(file)}
      className="bg-white shadow-md hover:shadow-xl transition rounded-2xl p-4 relative group w-[95%] mx-auto cursor-pointer"
    >
      <div className="relative flex justify-center mt-3">
        <button
          onClick={(e) => { e.stopPropagation(); onStar(file._id); }}
          className="absolute left-2 -top-2.5 opacity-0 group-hover:opacity-100 transition z-20"
        >
          <FiStar size={20} className={isStarred ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} />
        </button>

        <div className="absolute right-2 -top-2.5 z-20" onClick={(e) => e.stopPropagation()}>
          <ThreeDotsMenu
            file={file}
            onOpen={() => onOpen(file)}
            onRename={() => onRename(file)}
            onDelete={() => onDelete(file._id)}
          />
        </div>

        <div className={`${bg} p-7 rounded-md text-5xl ${text} w-full flex justify-center`}>
          {getFileIcon(file.type, 40)}
        </div>
      </div>

      <h3 className="text-center font-semibold mt-4 break-words text-sm">
        {file.name}
        {file.extension && !["message","link","folder"].includes(file.type) ? `.${file.extension}` : ""}
      </h3>

      <div className="flex justify-center items-center gap-2 text-xs text-gray-400 mt-1 flex-wrap">
        {file.isCoded && <FiLock size={10} className="text-orange-400" />}
        <ShareBadge content={file} />
        {file.size > 0 && <span>{formatSize(file.size)}</span>}
        {file.size > 0 && <span>•</span>}
        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

// ── List row ──────────────────────────────────────────────────────────────────
function ListRow({ file, starred, onStar, onOpen, onRename, onDelete }) {
  const { bg, text } = colorFor(file.type);
  const isStarred = starred[file._id];

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition px-4 py-2 group">
      <div
        onClick={() => onOpen(file)}
        className="bg-blue-50 rounded-xl flex items-center gap-3 px-3 py-2.5 cursor-pointer"
      >
        {/* Icon */}
        <div className={`${bg} ${text} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0`}>
          {getFileIcon(file.type, 18)}
        </div>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {file.name}
            {file.extension && !["message","link","folder"].includes(file.type) ? `.${file.extension}` : ""}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(file.updatedAt || file.createdAt).toLocaleDateString()}
          </p>
        </div>

        {/* Size */}
        <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block w-20 text-right">
          {formatSize(file.size) || "—"}
        </span>

        {/* Share info */}
        <div className="flex-shrink-0">
          <ShareBadge content={file} />
        </div>

        {/* Coded */}
        {file.isCoded && <FiLock size={14} className="text-orange-400 flex-shrink-0" />}

        {/* Star */}
        <button
          onClick={(e) => { e.stopPropagation(); onStar(file._id); }}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition"
        >
          <FiStar size={16} className={isStarred ? "text-yellow-500 fill-yellow-500" : "text-gray-300"} />
        </button>

        {/* Three dots */}
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <ThreeDotsMenu
            file={file}
            onOpen={() => onOpen(file)}
            onRename={() => onRename(file)}
            onDelete={() => onDelete(file._id)}
          />
        </div>
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
/**
 * ContentGrid
 * Props:
 *   files          Content[]
 *   isLoading      bool
 *   error          Error|null
 *   emptyMessage   string
 *   showViewToggle bool (default true)
 *   onFolderOpen   fn(folder) — called when a folder is clicked (optional)
 */
export default function ContentGrid({
  files = [],
  isLoading = false,
  error = null,
  emptyMessage = "No contents yet",
  emptySubMessage = "",
  showViewToggle = true,
  onFolderOpen,
  onContentOpen,
})  {
  const [viewMode, setViewMode]   = useState("grid");
  const [starred, setStarred]     = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showOpenModal, setShowOpenModal]   = useState(false);
  const [openedContent, setOpenedContent]   = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [selectedFile, setSelectedFile]       = useState(null);

  const moveToTrashMutation = useMoveToTrash();

  const handleDelete = async (id) => {
    try { await moveToTrashMutation.mutateAsync(id); }
    catch (err) { console.error("Failed to move to trash:", err); }
  };

  const handleStar = (id) =>
    setStarred((prev) => ({ ...prev, [id]: !prev[id] }));

const handleOpen = (content) => {
  if (onContentOpen) {
    onContentOpen(content);
    return;
  }

  if (content.type === "folder" && onFolderOpen) {
    onFolderOpen(content);
    return;
  }

  setOpenedContent(content);
  setShowOpenModal(true);
};

  // Sort starred first, then paginate
  const sorted = sortStarredFirst(files, starred);
  const startIndex = (currentPage - 1) * FILES_PER_PAGE;
  const currentFiles = sorted.slice(startIndex, startIndex + FILES_PER_PAGE);
  const maxPage = Math.max(1, Math.ceil(sorted.length / FILES_PER_PAGE));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="ml-3 text-gray-500">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
        <p className="text-red-600 text-sm">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* View toggle */}
      {showViewToggle && files.length > 0 && (
        <div className="flex justify-end mb-5">
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-white shadow text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              <FiGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-white shadow text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
            >
              <FiList size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Empty state */}
      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64">
          <FiFileText size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">{emptyMessage}</p>
          {emptySubMessage && <p className="text-gray-400 text-sm mt-1">{emptySubMessage}</p>}
        </div>
      )}

      {/* Grid */}
      {files.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 auto-rows-max">
          {currentFiles.map((file) => (
            <GridCard
              key={file._id}
              file={file}
              starred={starred}
              onStar={handleStar}
              onOpen={handleOpen}
              onRename={(f) => { setSelectedFile(f); setShowRenameModal(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* List */}
      {files.length > 0 && viewMode === "list" && (
        <div className="flex flex-col gap-2">
          {currentFiles.map((file) => (
            <ListRow
              key={file._id}
              file={file}
              starred={starred}
              onStar={handleStar}
              onOpen={handleOpen}
              onRename={(f) => { setSelectedFile(f); setShowRenameModal(true); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {maxPage > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-5 py-2 rounded-xl bg-gray-200 disabled:opacity-40"
          >Previous</button>
          <span className="font-medium text-sm">Page {currentPage} / {maxPage}</span>
          <button
            disabled={currentPage === maxPage}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-5 py-2 rounded-xl bg-gray-200 disabled:opacity-40"
          >Next</button>
        </div>
      )}

      {/* Rename modal */}
      {showRenameModal && selectedFile && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative">
            <button onClick={() => setShowRenameModal(false)} className="absolute top-4 right-4">✕</button>
            <h2 className="text-xl font-bold mb-4">Rename</h2>
            <input
              type="text"
              defaultValue={selectedFile.name}
              className="w-full border rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
            />
            <button className="w-full mt-4 bg-blue-600 text-white py-3 rounded-2xl hover:bg-blue-700 transition">
              Save
            </button>
          </div>
        </div>
      )}

      {/* Content viewer */}
      <Open
        isOpen={showOpenModal}
        onClose={() => setShowOpenModal(false)}
        content={openedContent}
      />
    </div>
  );
}
