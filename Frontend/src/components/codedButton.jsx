import { useState } from "react";
import {
  FiLock,
  FiUnlock,
  FiShield,
  FiLoader,
  FiGrid,
  FiList,
  FiFileText,
  FiImage,
  FiVideo,
  FiCode,
  FiFolder,
  FiLink,
  FiMessageSquare,
  FiMusic,
  FiStar,
  FiX,
  FiUsers,
} from "react-icons/fi";
import {
  useSectionContents,
  useDecodeContent,
  useMoveToTrash,
} from "../hooks/useContent";
import ThreeDotsMenu from "./threeDotsMenu";
import Open from "./open";
import { filterContents } from "../utils/contentFilter";

const PER_PAGE = 15;

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

function CodedCard({
  file,
  starred,
  onStar,
  onDecode,
  onOpen,
  onDelete,
  isDecoded,
}) {
  return (
    <div
      onClick={() => (isDecoded ? onOpen(file) : onDecode(file))}
      className="bg-white border border-orange-100 shadow-sm hover:shadow-xl transition rounded-2xl p-4 relative group w-[95%] mx-auto cursor-pointer">
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
          <ThreeDotsMenu
            file={file}
            onOpen={() => (isDecoded ? onOpen(file) : onDecode(file))}
            onDelete={() => onDelete(file._id)}
          />
        </div>
        <div className="relative w-full">
          <div
            className={`p-7 rounded-md text-5xl w-full flex justify-center ${isDecoded ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-400"}`}>
            {getIcon(file.type, 40)}
          </div>
          <div
            className={`absolute bottom-1 right-1/2 translate-x-6 w-6 h-6 rounded-full flex items-center justify-center shadow-md ${isDecoded ? "bg-green-500" : "bg-orange-500"}`}>
            {isDecoded ? (
              <FiUnlock size={12} className="text-white" />
            ) : (
              <FiLock size={12} className="text-white" />
            )}
          </div>
        </div>
      </div>
      <h3 className="text-center font-semibold mt-4 text-sm break-words">
        {file.name}
        {file.extension && !["message", "link", "folder"].includes(file.type)
          ? `.${file.extension}`
          : ""}
      </h3>
      <div className="flex justify-center items-center gap-2 text-xs text-gray-400 mt-1 flex-wrap">
        {file.sharedWithAll && (
          <span className="flex items-center gap-0.5 text-blue-400">
            <FiUsers size={9} /> All
          </span>
        )}
        {!file.sharedWithAll && file.sharedWith?.length > 0 && (
          <span className="flex items-center gap-0.5 text-indigo-400">
            <FiUsers size={9} /> {file.sharedWith.length}
          </span>
        )}
        {fmt(file.size) && <span>{fmt(file.size)}</span>}
      </div>
    </div>
  );
}

function CodedRow({
  file,
  starred,
  onStar,
  onDecode,
  onOpen,
  onDelete,
  isDecoded,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-orange-50 px-4 py-2 group">
      <div
        onClick={() => (isDecoded ? onOpen(file) : onDecode(file))}
        className={`rounded-xl flex items-center gap-3 px-3 py-2.5 cursor-pointer ${isDecoded ? "bg-green-50" : "bg-orange-50"}`}>
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 relative ${isDecoded ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-500"}`}>
          {getIcon(file.type, 18)}
          <div
            className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center ${isDecoded ? "bg-green-500" : "bg-orange-500"}`}>
            {isDecoded ? (
              <FiUnlock size={8} className="text-white" />
            ) : (
              <FiLock size={8} className="text-white" />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {file.name}
            {file.extension &&
            !["message", "link", "folder"].includes(file.type)
              ? `.${file.extension}`
              : ""}
          </p>
        </div>
        {fmt(file.size) && (
          <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
            {fmt(file.size)}
          </span>
        )}
        {(file.sharedWithAll || file.sharedWith?.length > 0) && (
          <span className="flex items-center gap-1 text-xs text-indigo-400 flex-shrink-0">
            <FiUsers size={11} />
            {file.sharedWithAll ? "All" : file.sharedWith.length}
          </span>
        )}
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
          <ThreeDotsMenu
            file={file}
            onOpen={() => (isDecoded ? onOpen(file) : onDecode(file))}
            onDelete={() => onDelete(file._id)}
          />
        </div>
      </div>
    </div>
  );
}

export default function CodedButton({ searchQuery = "" }) {
  const [folderStack, setFolderStack] = useState([]);
  const currentFolder = folderStack[folderStack.length - 1] ?? null;

  const [viewMode, setViewMode] = useState("grid");
  const [starred, setStarred] = useState({});
  const [page, setPage] = useState(1);
  const [decodedFiles, setDecodedFiles] = useState({});
  const [decodeTarget, setDecodeTarget] = useState(null);
  const [decodeKey, setDecodeKey] = useState("");
  const [decodeError, setDecodeError] = useState("");
  const [openContent, setOpenContent] = useState(null);
  const [showOpen, setShowOpen] = useState(false);

  const { data, isLoading, error } = useSectionContents("coded");
  const decodeMutation = useDecodeContent();
  const trashMutation = useMoveToTrash();

  const allFiles = data?.data?.contents || [];
  const files = filterContents(allFiles, searchQuery);
  const sorted = sortStar(files, starred);
  const slice = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const maxPage = Math.max(1, Math.ceil(sorted.length / PER_PAGE));

  const handleDecode = async () => {
    if (!decodeKey.trim()) {
      setDecodeError("Please enter the decode key.");
      return;
    }
    setDecodeError("");
    try {
      const res = await decodeMutation.mutateAsync({
        id: decodeTarget._id,
        key: decodeKey,
      });
      setDecodedFiles((p) => ({
        ...p,
        [decodeTarget._id]: res?.data?.content || decodeTarget,
      }));
      setDecodeTarget(null);
      setDecodeKey("");
    } catch {
      setDecodeError("Incorrect decode key. Please try again.");
    }
  };

  const handleOpen = (file) => {
    setOpenContent(decodedFiles[file._id] || file);
    setShowOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await trashMutation.mutateAsync(id);
    } catch (e) {
      console.error(e);
    }
  };

  const navigateTo = (index) =>
    setFolderStack((prev) => (index < 0 ? [] : prev.slice(0, index + 1)));

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin text-orange-400" size={28} />
        <p className="ml-3 text-gray-500">Loading encoded contents…</p>
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
          <FiLock size={14} /> Coded Contents
        </button>
        {folderStack.map((folder, i) => (
          <span key={folder._id} className="flex items-center gap-1">
            <span className="text-gray-400">›</span>
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
        Your encoded and protected contents. Click any item to decode
      </p>
      <div className="flex items-center justify-end mb-5">
        {allFiles.length > 0 && (
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-white shadow text-orange-500" : "text-gray-400"}`}>
              <FiGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-white shadow text-orange-500" : "text-gray-400"}`}>
              <FiList size={16} />
            </button>
          </div>
        )}
      </div>

      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64">
          <FiShield size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            {searchQuery ? "No matches found" : "No encoded contents"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {searchQuery
              ? `Nothing matches "${searchQuery}"`
              : "Encoded files and messages will appear here"}
          </p>
        </div>
      )}

      {viewMode === "grid" && files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 auto-rows-max">
          {slice.map((f) => (
            <CodedCard
              key={f._id}
              file={f}
              starred={starred}
              onStar={(id) => setStarred((p) => ({ ...p, [id]: !p[id] }))}
              onDecode={setDecodeTarget}
              onOpen={handleOpen}
              onDelete={handleDelete}
              isDecoded={!!decodedFiles[f._id]}
            />
          ))}
        </div>
      )}
      {viewMode === "list" && files.length > 0 && (
        <div className="flex flex-col gap-2">
          {slice.map((f) => (
            <CodedRow
              key={f._id}
              file={f}
              starred={starred}
              onStar={(id) => setStarred((p) => ({ ...p, [id]: !p[id] }))}
              onDecode={setDecodeTarget}
              onOpen={handleOpen}
              onDelete={handleDelete}
              isDecoded={!!decodedFiles[f._id]}
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

      {decodeTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button
              onClick={() => {
                setDecodeTarget(null);
                setDecodeKey("");
                setDecodeError("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition">
              <FiX size={22} />
            </button>
            <div className="flex justify-center mb-5">
              <div className="bg-orange-100 p-4 rounded-2xl">
                <FiUnlock size={35} className="text-orange-500" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center">Enter Decode Key</h2>
            <p className="text-gray-500 text-center text-sm mt-1 mb-2 truncate">
              "{decodeTarget.name}"
            </p>
            <p className="text-gray-400 text-center text-xs mb-6">
              Use the key that was emailed to you
            </p>
            <input
              type="text"
              value={decodeKey}
              onChange={(e) => {
                setDecodeKey(e.target.value);
                setDecodeError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleDecode()}
              placeholder="Enter decode key..."
              className="w-full border border-gray-300 rounded-2xl px-4 py-4 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
            />
            {decodeError && (
              <p className="text-red-500 text-sm mt-2">{decodeError}</p>
            )}
            <button
              onClick={handleDecode}
              disabled={decodeMutation.isPending}
              className="w-full mt-5 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl transition font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
              {decodeMutation.isPending ? (
                <>
                  <FiLoader className="animate-spin" size={16} /> Decoding…
                </>
              ) : (
                <>
                  <FiUnlock size={16} /> Decode Content
                </>
              )}
            </button>
          </div>
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
