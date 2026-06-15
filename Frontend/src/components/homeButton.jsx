import { useEffect, useState } from "react";
import { FiHome, FiChevronRight, FiLoader, FiFileText} from "react-icons/fi";
import { useSectionContents, useFolderContents } from "../hooks/useContent";
import ContentGrid from "./ContentGrid";

export default function MyFilesButton() {
  // Stack of { _id, name } — empty = root
  const [folderStack, setFolderStack] = useState([]);
  const currentFolder = folderStack[folderStack.length - 1] ?? null;

  const {
    data: sectionData,
    isLoading: sectionLoading,
    error: sectionError,
  } = useSectionContents("home");

  const {
    data: folderData,
    isLoading: folderLoading,
    error: folderError,
  } = useFolderContents(currentFolder?._id);

  // Reset to page 1 when navigating
  useEffect(() => {}, [currentFolder?._id]);

  const isLoading = currentFolder ? folderLoading : sectionLoading;
  const error = currentFolder ? folderError : sectionError;

  // sectionData shape: { success, message, data: { contents, pagination } }
  // folderData shape:  { success, message, data: { folder, contents } }
  const allFiles = currentFolder
    ? (folderData?.data?.contents ?? [])
    : (sectionData?.data?.contents ?? []);

  const navigateTo = (index) =>
    setFolderStack((prev) => (index < 0 ? [] : prev.slice(0, index + 1)));

  const handleFolderOpen = (folder) =>
    setFolderStack((prev) => [...prev, { _id: folder._id, name: folder.name }]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FiLoader className="animate-spin text-blue-500" size={28} />
        <p className="ml-3 text-gray-500">Loading…</p>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm px-6 pt-6 flex-wrap">
        <button
          onClick={() => navigateTo(-1)}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition">
          <FiFileText  size={14} /> Shared Content
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
        All files, folders, messages and links you shared with others
      </p>

      <ContentGrid
        files={allFiles}
        isLoading={false}
        error={error}
        emptyMessage={
          currentFolder ? "This folder is empty" : "No contents yet"
        }
        emptySubMessage={
          currentFolder ? "See Shared content here" : "Start by sharing content"
        }
        showViewToggle
        onFolderOpen={handleFolderOpen}
      />
    </div>
  );
}
