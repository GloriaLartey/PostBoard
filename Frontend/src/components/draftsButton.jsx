import { useState } from "react";
import {
  FiClock,
  FiLoader,
  FiGrid,
  FiList,
  FiStar,
  FiEdit3,
  FiFileText,
  FiImage,
  FiVideo,
  FiCode,
  FiFolder,
  FiLink,
  FiMessageSquare,
  FiMusic,
  FiX,
  FiSave,
  FiTrash2,
} from "react-icons/fi";
import {
  useSectionContents,
  useUpdateContent,
  useMoveToTrash,
} from "../hooks/useContent";
// import ThreeDotsMenu from "./threeDotsMenu";

const FILES_PER_PAGE = 12;

function getIcon(type, size = 36) {
  const props = { size };
  switch (type) {
    case "image":
      return <FiImage {...props} />;
    case "video":
      return <FiVideo {...props} />;
    case "code":
      return <FiCode {...props} />;
    case "folder":
      return <FiFolder {...props} />;
    case "link":
      return <FiLink {...props} />;
    case "message":
      return <FiMessageSquare {...props} />;
    case "audio":
      return <FiMusic {...props} />;
    default:
      return <FiFileText {...props} />;
  }
}

function formatSize(b) {
  if (!b) return null;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

function sortStarredFirst(files, starred) {
  return [...files].sort(
    (a, b) => (starred[b._id] ? 1 : 0) - (starred[a._id] ? 1 : 0),
  );
}

function DraftCard({ file, starred, onStar, onClick, onDelete }) {
  return (
    <div
      onClick={() => onClick(file)}
      className="bg-white border border-amber-100 shadow-sm hover:shadow-xl transition rounded-2xl p-4 relative group w-[95%] mx-auto cursor-pointer">
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
        {/* <div
          className="absolute right-2 -top-2.5 z-20"
          onClick={(e) => e.stopPropagation()}>
          <ThreeDotsMenu
            file={file}
            onOpen={() => onClick(file)}
            onDelete={() => onDelete(file._id)}
          />
        </div> */}
        <div className="bg-amber-50 p-7 rounded-md text-5xl text-amber-500 w-full flex justify-center">
          {getIcon(file.type, 40)}
        </div>
      </div>

      <h3 className="text-center font-semibold mt-4 text-sm break-words text-gray-700">
        {file.name || "Untitled"}
        {file.extension && !["message", "link", "folder"].includes(file.type)
          ? `.${file.extension}`
          : ""}
      </h3>

      <div className="flex justify-center gap-2 text-xs text-gray-400 mt-1">
        {formatSize(file.size) && <span>{formatSize(file.size)}</span>}
        <span>
          {new Date(file.updatedAt || file.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

function DraftRow({ file, starred, onStar, onClick, onDelete }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-amber-50 px-4 py-2 group">
      <div
        onClick={() => onClick(file)}
        className="bg-amber-50 rounded-xl flex items-center gap-3 px-3 py-2.5 cursor-pointer">
        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-500 flex items-center justify-center flex-shrink-0">
          {getIcon(file.type, 18)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {file.name || "Untitled"}
            {file.extension &&
            !["message", "link", "folder"].includes(file.type)
              ? `.${file.extension}`
              : ""}
          </p>
          <p className="text-xs text-amber-400 mt-0.5 flex items-center gap-1">
            <FiEdit3 size={10} /> Draft •{" "}
            {new Date(file.updatedAt || file.createdAt).toLocaleDateString()}
          </p>
        </div>
        {formatSize(file.size) && (
          <span className="text-xs text-gray-400 flex-shrink-0 hidden sm:block">
            {formatSize(file.size)}
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
        {/* <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <ThreeDotsMenu
            file={file}
            onOpen={() => onClick(file)}
            onDelete={() => onDelete(file._id)}
          />
        </div> */}
      </div>
    </div>
  );
}

// ── Continue editing modal ────────────────────────────────────────────────────
function ContinueModal({ draft, onClose, onSaved, onDiscarded }) {
  const [name, setName] = useState(draft.name || "");
  const [body, setBody] = useState(draft.body || "");
  const updateMutation = useUpdateContent();
  const trashMutation = useMoveToTrash();

  const isCreated = draft.category === "created";

  const handleSaveDraft = async () => {
    try {
      await updateMutation.mutateAsync({
        id: draft._id,
        updates: { name, body, section: "draft" },
      });
      onSaved();
    } catch (e) {
      console.error(e);
    }
  };

  const handleFinish = async () => {
    try {
      await updateMutation.mutateAsync({
        id: draft._id,
        updates: { name, body, section: "myfile" },
      });
      onSaved();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDiscard = async () => {
    try {
      await trashMutation.mutateAsync(draft._id);
      onDiscarded();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-2xl rounded-3xl p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition">
          <FiX size={22} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="bg-amber-100 p-3 rounded-xl">
            <FiEdit3 size={22} className="text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Continue Editing</h2>
            <p className="text-xs text-gray-400">Draft — {draft.type}</p>
          </div>
        </div>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name..."
          className="w-full border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-amber-400 mb-4 text-sm"
        />

        {isCreated && (
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder={
              draft.type === "link"
                ? "Paste your URL here..."
                : "Type your message here..."
            }
            rows={draft.type === "message" ? 10 : 4}
            className="w-full border border-gray-300 rounded-2xl px-4 py-3 outline-none focus:border-amber-400 resize-none text-sm"
          />
        )}

        {!isCreated && (
          <div className="bg-gray-50 rounded-2xl p-4 text-sm text-gray-500 flex items-center gap-2">
            {getIcon(draft.type, 20)}
            <span>{draft.name}</span>
            {formatSize(draft.size) && (
              <span className="text-gray-400">• {formatSize(draft.size)}</span>
            )}
          </div>
        )}

        {updateMutation.error && (
          <p className="text-red-500 text-sm mt-3">
            {updateMutation.error?.response?.data?.message || "Save failed."}
          </p>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSaveDraft}
            disabled={updateMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-100 text-amber-700 hover:bg-amber-200 py-3 rounded-2xl transition font-medium text-sm disabled:opacity-60">
            <FiSave size={14} /> Save Draft
          </button>
          <button
            onClick={handleFinish}
            disabled={updateMutation.isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 py-3 rounded-2xl transition font-medium text-sm disabled:opacity-60">
            <FiSave size={14} /> Finish & Save
          </button>
          <button
            onClick={handleDiscard}
            disabled={trashMutation.isPending}
            className="flex items-center justify-center gap-2 bg-red-50 text-red-500 hover:bg-red-100 px-4 py-3 rounded-2xl transition text-sm disabled:opacity-60"
            title="Discard draft">
            <FiTrash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DraftsButton() {
  const [folderStack, setFolderStack] = useState([]);
  const currentFolder = folderStack[folderStack.length - 1] ?? null;

  const [viewMode, setViewMode] = useState("grid");
  const [starred, setStarred] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [editingDraft, setEditingDraft] = useState(null);

  const { data: sectionData, isLoading, error } = useSectionContents("draft");
  const trashMutation = useMoveToTrash();

  const files = sectionData?.data?.contents || [];
  const sorted = sortStarredFirst(files, starred);
  const startIndex = (currentPage - 1) * FILES_PER_PAGE;
  const currentFiles = sorted.slice(startIndex, startIndex + FILES_PER_PAGE);
  const maxPage = Math.max(1, Math.ceil(sorted.length / FILES_PER_PAGE));

  const handleDelete = async (id) => {
    try {
      await trashMutation.mutateAsync(id);
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading)
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin text-amber-400" size={28} />
        <p className="ml-3 text-gray-500">Loading drafts…</p>
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
          <FiClock size={14} /> Drafts
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
        Your draft messages and unpublished content. Click any draft to continue
        editing
      </p>
      <div className="flex items-center justify-end mb-6">
        {files.length > 0 && (
          <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${viewMode === "grid" ? "bg-white shadow text-amber-500" : "text-gray-400"}`}>
              <FiGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition ${viewMode === "list" ? "bg-white shadow text-amber-500" : "text-gray-400"}`}>
              <FiList size={16} />
            </button>
          </div>
        )}
      </div>

      {files.length === 0 && (
        <div className="flex flex-col items-center justify-center h-64">
          <FiClock size={48} className="text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">No drafts yet</p>
          <p className="text-gray-400 text-sm mt-1">
            Drafts will appear here when you save without finishing
          </p>
        </div>
      )}

      {viewMode === "grid" && files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-7 auto-rows-max">
          {currentFiles.map((f) => (
            <DraftCard
              key={f._id}
              file={f}
              starred={starred}
              onStar={(id) => setStarred((p) => ({ ...p, [id]: !p[id] }))}
              onClick={setEditingDraft}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {viewMode === "list" && files.length > 0 && (
        <div className="flex flex-col gap-2">
          {currentFiles.map((f) => (
            <DraftRow
              key={f._id}
              file={f}
              starred={starred}
              onStar={(id) => setStarred((p) => ({ ...p, [id]: !p[id] }))}
              onClick={setEditingDraft}
              onDelete={handleDelete}
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

      {editingDraft && (
        <ContinueModal
          draft={editingDraft}
          onClose={() => setEditingDraft(null)}
          onSaved={() => setEditingDraft(null)}
          onDiscarded={() => setEditingDraft(null)}
        />
      )}
    </div>
  );
}
