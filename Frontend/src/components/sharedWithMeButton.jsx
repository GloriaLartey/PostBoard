import { useState } from "react";
import {
  FiUsers,
  FiLoader,
  FiGrid,
  FiList,
  FiStar,
  FiFileText,
  FiImage,
  FiVideo,
  FiCode,
  FiFolder,
  FiLink,
  FiMessageSquare,
  FiMusic,
  FiLock,
} from "react-icons/fi";
import { useSectionContents } from "../hooks/useContent";
import ThreeDotsMenu from "./threeDotsMenu";
import Open from "./open";

const PER_PAGE = 12;
const TYPE_COLORS = {
  folder: { bg: "bg-yellow-50", text: "text-yellow-500" },
  image: { bg: "bg-pink-50", text: "text-pink-500" },
  video: { bg: "bg-red-50", text: "text-red-500" },
  audio: { bg: "bg-orange-50", text: "text-orange-500" },
  code: { bg: "bg-green-50", text: "text-green-500" },
  message: { bg: "bg-blue-50", text: "text-blue-500" },
  link: { bg: "bg-purple-50", text: "text-purple-500" },
};
const colorFor = (t) =>
  TYPE_COLORS[t] || { bg: "bg-indigo-50", text: "text-indigo-500" };

function getIcon(type, size = 36) {
  const p = { size };
  switch (type) {
    case "image":
      return <FiImage {...p} />;
    case "video":
      return <FiVideo {...p} />;
    case "code":
      return <FiCode {...p} />;
    case "folder":
      return <FiFolder {...p} />;
    case "link":
      return <FiLink {...p} />;
    case "message":
      return <FiMessageSquare {...p} />;
    case "audio":
      return <FiMusic {...p} />;
    default:
      return <FiFileText {...p} />;
  }
}
function fmt(b) {
  if (!b) return null;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}
function sortStar(files, starred) {
  return [...files].sort(
    (a, b) => (starred[b._id] ? 1 : 0) - (starred[a._id] ? 1 : 0),
  );
}

function SharedCard({ file, starred, onStar, onOpen }) {
  const { bg, text } = colorFor(file.type);
  return (
    <div
      onClick={() => onOpen(file)}
      className="bg-white shadow-md hover:shadow-xl transition rounded-2xl p-4 relative group w-[95%] mx-auto cursor-pointer border border-indigo-50">
      <div className="relative flex justify-center mt-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStar(file._id);
          }}
          className="absolute left-2 -top-2.5 opacity-0 group-hover:opacity-100 transition z-20">
          <FiStar
            size={20}
            className={
              starred[file._id]
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-400"
            }
          />
        </button>
        <div
          className="absolute right-2 -top-2.5 z-20"
          onClick={(e) => e.stopPropagation()}>
          <ThreeDotsMenu file={file} onOpen={() => onOpen(file)} />
        </div>
        <div
          className={`${bg} p-7 rounded-md text-5xl ${text} w-full flex justify-center relative`}>
          {getIcon(file.type, 40)}
          {file.isCoded && (
            <div className="absolute bottom-1 right-1/2 translate-x-6 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow">
              <FiLock size={11} className="text-white" />
            </div>
          )}
        </div>
      </div>
      <h3 className="text-center font-semibold mt-4 text-sm break-words">
        {file.name}
        {file.extension && !["message", "link", "folder"].includes(file.type)
          ? `.${file.extension}`
          : ""}
      </h3>
      <div className="flex justify-center gap-2 text-xs text-gray-400 mt-1">
        {fmt(file.size) && <span>{fmt(file.size)} •</span>}
        <span>{new Date(file.createdAt).toLocaleDateString()}</span>
      </div>
      <div className="flex items-center justify-center gap-1 mt-2 text-xs text-indigo-400 font-medium">
        <FiUsers size={11} />
        <span>From {file.owner?.username || "someone"}</span>
      </div>
    </div>
  );
}

function SharedRow({ file, starred, onStar, onOpen }) {
  const { bg, text } = colorFor(file.type);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-indigo-50 px-4 py-2 group">
      <div
        onClick={() => onOpen(file)}
        className="bg-indigo-50 rounded-xl flex items-center gap-3 px-3 py-2.5 cursor-pointer">
        <div
          className={`${bg} ${text} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative`}>
          {getIcon(file.type, 18)}
          {file.isCoded && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center">
              <FiLock size={8} className="text-white" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {file.name}
            {file.extension &&
            !["message", "link", "folder"].includes(file.type)
              ? `.${file.extension}`
              : ""}
          </p>
          <p className="text-xs text-indigo-400 mt-0.5 flex items-center gap-1">
            <FiUsers size={10} /> From {file.owner?.username || "someone"}
          </p>
        </div>
        {fmt(file.size) && (
          <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
            {fmt(file.size)}
          </span>
        )}
        <span className="text-xs text-gray-400 flex-shrink-0">
          {new Date(file.createdAt).toLocaleDateString()}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onStar(file._id);
          }}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
          <FiStar
            size={15}
            className={
              starred[file._id]
                ? "text-yellow-500 fill-yellow-500"
                : "text-gray-300"
            }
          />
        </button>
        <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <ThreeDotsMenu file={file} onOpen={() => onOpen(file)} />
        </div>
      </div>
    </div>
  );
}

export default function SharedWithMeButton() {
  const [folderStack, setFolderStack] = useState([]);
  const currentFolder = folderStack[folderStack.length - 1] ?? null;

  const [viewMode, setViewMode] = useState("grid");
  const [starred, setStarred] = useState({});
  const [page, setPage] = useState(1);
  const [openContent, setOpenContent] = useState(null);
  const [showOpen, setShowOpen] = useState(false);

  const { data, isLoading, error } = useSectionContents("shared-with-me");
  const files = data?.data?.contents || [];
  const sorted = sortStar(files, starred);
  const slice = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const maxPage = Math.max(1, Math.ceil(sorted.length / PER_PAGE));

  const handleOpen = (c) => {
    setOpenContent(c);
    setShowOpen(true);
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin text-indigo-400" size={28} />
        <p className="ml-3 text-gray-500">Loading shared contents…</p>
      </div>
    );
  if (error)
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-600 text-sm">Error: {error.message}</p>
      </div>
    );

  return (
    <div>
      <nav className="flex items-center gap-1 text-sm px-6 pt-6 flex-wrap">
        <button
          onClick={() => navigateTo(-1)}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition">
          <FiUsers size={14} /> Shared With Me
        </button>
        {folderStack.map((folder, i) => (
          <span key={folder._id} className="flex items-center gap-1">
            <FiChevronRight size={14} className="text-gray-400" />
            <button
              onClick={() => navigateTo(i)}
              className={`font-medium transition ${
                i === folderStack.length - 1
                  ? "text-gray-800 cursor-default"
                  : "text-blue-600 hover:text-blue-800"
              }`}>
              {folder.name}
            </button>
          </span>
        ))}
      </nav>
      <p className="flex items-center gap-1.5 text-gray-500 text-decoration-italic px-6">
        All contents that have been shared with you
      </p>
      <div className="flex items-center justify-between mb-5">
        {files.length > 0 && (
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-white shadow text-indigo-500" : "text-gray-400"}`}>
              <FiGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-white shadow text-indigo-500" : "text-gray-400"}`}>
              <FiList size={16} />
            </button>
          </div>
        )}
      </div>

      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64">
          <FiUsers size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            Nothing shared with you yet
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Content shared by others will appear here
          </p>
        </div>
      )}

      {viewMode === "grid" && files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 auto-rows-max">
          {slice.map((f) => (
            <SharedCard
              key={f._id}
              file={f}
              starred={starred}
              onStar={(id) => setStarred((p) => ({ ...p, [id]: !p[id] }))}
              onOpen={handleOpen}
            />
          ))}
        </div>
      )}
      {viewMode === "list" && files.length > 0 && (
        <div className="flex flex-col gap-2">
          {slice.map((f) => (
            <SharedRow
              key={f._id}
              file={f}
              starred={starred}
              onStar={(id) => setStarred((p) => ({ ...p, [id]: !p[id] }))}
              onOpen={handleOpen}
            />
          ))}
        </div>
      )}

      {maxPage > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-5 py-2 rounded-xl bg-gray-200 disabled:opacity-40">
            Previous
          </button>
          <span className="font-medium text-sm">
            Page {page} / {maxPage}
          </span>
          <button
            disabled={page === maxPage}
            onClick={() => setPage((p) => p + 1)}
            className="px-5 py-2 rounded-xl bg-gray-200 disabled:opacity-40">
            Next
          </button>
        </div>
      )}

      <Open
        isOpen={showOpen}
        onClose={() => setShowOpen(false)}
        content={openContent}
      />
    </div>
  );
}
