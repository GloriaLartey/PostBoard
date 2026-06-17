import { useState } from "react";
import { FiHome, FiChevronRight, FiLoader } from "react-icons/fi";
import { useSectionContents, useFolderContents } from "../hooks/useContent";
import ContentGrid from "./ContentGrid";
import { filterContents } from "../utils/contentFilter";

export default function MyFilesButton({ viewMode, searchQuery = "" }) {
  const [folderStack, setFolderStack] = useState([]);
  const currentFolder = folderStack[folderStack.length - 1] ?? null;

  const {
    data: sectionData,
    isLoading: sectionLoading,
    error: sectionError,
  } = useSectionContents("myfile");
  const {
    data: folderData,
    isLoading: folderLoading,
    error: folderError,
  } = useFolderContents(currentFolder?._id);

  const isLoading = currentFolder ? folderLoading : sectionLoading;
  const error = currentFolder ? folderError : sectionError;

  const allFiles = currentFolder
    ? (folderData?.data?.contents ?? [])
    : (sectionData?.data?.contents ?? []);

  // Filtered by the shared header search query
  const visibleFiles = filterContents(allFiles, searchQuery);

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
      <nav className="flex items-center gap-1 text-sm flex-wrap">
        <button
          onClick={() => navigateTo(-1)}
          className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition">
          <FiHome size={14} /> My Contents
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
      <p className="items-center text-gray-500 italic text-sm mt-1 mb-4">
        Your personal space to create or upload and manage your contents
      </p>

      <ContentGrid
        files={visibleFiles}
        isLoading={false}
        error={error}
        emptyMessage={
          searchQuery
            ? "No matches found"
            : currentFolder
              ? "This folder is empty"
              : "No contents yet"
        }
        emptySubMessage={
          searchQuery
            ? `Nothing matches "${searchQuery}"`
            : currentFolder
              ? "Upload or create content here"
              : "Start by uploading files or creating content"
        }
        showViewToggle
        onFolderOpen={handleFolderOpen}
      />
    </div>
  );
}
