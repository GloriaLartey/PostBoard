import { useState } from "react";
import {
  FiTrash2,
  FiRotateCcw,
  FiFileText,
  FiImage,
  FiVideo,
  FiCode,
  FiFolder,
  FiLink,
  FiMessageSquare,
  FiMusic,
  FiLoader,
  FiGrid,
  FiList,
  FiLock,
} from "react-icons/fi";
import {
  useSectionContents,
  useRestoreFromTrash,
  usePermanentDelete,
} from "../hooks/useContent";
import { filterContents } from "../utils/contentFilter";

const FILES_PER_PAGE = 20;

function getIcon(type, size = 36) {
  const p = { size, className: "text-red-400" };
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

function TrashCard({ file, onRestore, onDelete }) {
  return (
    <div className="bg-white border border-red-100 shadow-sm hover:shadow-md transition rounded-2xl p-4 relative group w-[95%] mx-auto">
      <div className="flex justify-end gap-2 mb-2">
        <button
          onClick={() => onRestore(file._id)}
          title="Restore"
          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition">
          <FiRotateCcw size={15} />
        </button>
        <button
          onClick={() => onDelete(file._id)}
          title="Delete permanently"
          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition">
          <FiTrash2 size={15} />
        </button>
      </div>
      <div className="bg-red-50 p-6 rounded-xl flex items-center justify-center">
        {getIcon(file.type, 40)}
      </div>
      <h3 className="text-center font-semibold mt-3 text-sm break-words text-gray-700">
        {file.name}
        {file.extension && !["message", "link", "folder"].includes(file.type)
          ? `.${file.extension}`
          : ""}
      </h3>
      <div className="flex justify-center gap-2 text-xs text-gray-400 mt-1 flex-wrap">
        {file.isCoded && <FiLock size={10} className="text-orange-400" />}
        {fmt(file.size) && <span>{fmt(file.size)} •</span>}
        <span>
          Deleted{" "}
          {new Date(file.trashedAt || file.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

function TrashRow({ file, onRestore, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm px-4 py-2">
      <div className="bg-red-50 rounded-xl flex items-center gap-3 px-3 py-2.5">
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
          {getIcon(file.type, 18)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-700 truncate">
            {file.name}
            {file.extension &&
            !["message", "link", "folder"].includes(file.type)
              ? `.${file.extension}`
              : ""}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            Deleted{" "}
            {new Date(file.trashedAt || file.updatedAt).toLocaleDateString()}
          </p>
        </div>
        {fmt(file.size) && (
          <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
            {fmt(file.size)}
          </span>
        )}
        {file.isCoded && (
          <FiLock size={13} className="text-orange-400 flex-shrink-0" />
        )}
        <button
          onClick={() => onRestore(file._id)}
          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition flex-shrink-0">
          <FiRotateCcw size={15} />
        </button>
        <button
          onClick={() => onDelete(file._id)}
          className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition flex-shrink-0">
          <FiTrash2 size={15} />
        </button>
      </div>
    </div>
  );
}

export default function TrashButton({
  viewMode: viewModeProp,
  searchQuery = "",
}) {
  const [folderStack, setFolderStack] = useState([]);
  const currentFolder = folderStack[folderStack.length - 1] ?? null;

  const [viewMode, setViewMode] = useState(viewModeProp || "grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmId, setConfirmId] = useState(null);

  const { data, isLoading, error } = useSectionContents("trash");
  const restoreMutation = useRestoreFromTrash();
  const deleteMutation = usePermanentDelete();

  const allFiles = data?.data?.contents || [];
  const files = filterContents(allFiles, searchQuery);
  const slice = files.slice(
    (currentPage - 1) * FILES_PER_PAGE,
    currentPage * FILES_PER_PAGE,
  );
  const maxPage = Math.max(1, Math.ceil(files.length / FILES_PER_PAGE));

  const handleRestore = async (id) => {
    try {
      await restoreMutation.mutateAsync(id);
    } catch (e) {
      console.error(e);
    }
  };
  const confirmDelete = async () => {
    try {
      await deleteMutation.mutateAsync(confirmId);
      setConfirmId(null);
    } catch (e) {
      console.error(e);
    }
  };

  const navigateTo = (index) =>
    setFolderStack((prev) => (index < 0 ? [] : prev.slice(0, index + 1)));
  const handleFolderOpen = (folder) =>
    setFolderStack((prev) => [...prev, { _id: folder._id, name: folder.name }]);

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin text-red-400" size={28} />
        <p className="ml-3 text-gray-500">Loading trash…</p>
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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm flex-wrap">
        <button
          onClick={() => navigateTo(-1)}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition">
          <FiTrash2 size={14} /> Trash
        </button>
        {folderStack.map((folder, i) => (
          <span key={folder._id} className="flex items-center gap-1">
            <FiChevronRight size={14} className="text-gray-400" />
            <button
              onClick={() => navigateTo(i)}
              className={`font-medium transition ${i === folderStack.length - 1 ? "text-gray-800 cursor-default" : "text-blue-600 hover:text-blue-800"}`}>
              {folder.name}
            </button>
          </span>
        ))}
      </nav>
      <p className="text-gray-500 italic text-sm mb-1">
        Deleted items are automatically and permanently removed after 50 days
      </p>
      <div className="flex items-center justify-end mb-5">
        {allFiles.length > 0 && (
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-white shadow text-red-500" : "text-gray-400"}`}>
              <FiGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-white shadow text-red-500" : "text-gray-400"}`}>
              <FiList size={16} />
            </button>
          </div>
        )}
      </div>

      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64">
          <FiTrash2 size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">
            {searchQuery ? "No matches found" : "Trash is empty"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            {searchQuery
              ? `Nothing matches "${searchQuery}"`
              : "Deleted items appear here for 50 days"}
          </p>
        </div>
      )}

      {viewMode === "grid" && files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 auto-rows-max">
          {slice.map((f) => (
            <TrashCard
              key={f._id}
              file={f}
              onRestore={handleRestore}
              onDelete={setConfirmId}
            />
          ))}
        </div>
      )}
      {viewMode === "list" && files.length > 0 && (
        <div className="flex flex-col gap-2">
          {slice.map((f) => (
            <TrashRow
              key={f._id}
              file={f}
              onRestore={handleRestore}
              onDelete={setConfirmId}
            />
          ))}
        </div>
      )}

      {maxPage > 1 && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-5 py-2 rounded-xl bg-gray-200 disabled:opacity-40">
            Previous
          </button>
          <span className="font-medium text-sm">
            Page {currentPage} / {maxPage}
          </span>
          <button
            disabled={currentPage === maxPage}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-5 py-2 rounded-xl bg-gray-200 disabled:opacity-40">
            Next
          </button>
        </div>
      )}

      {confirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl">
            <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrash2 size={28} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Delete Permanently?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 transition font-medium">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white transition font-medium disabled:opacity-60">
                {deleteMutation.isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
