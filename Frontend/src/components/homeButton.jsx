import { useState } from "react";
import { FiHome, FiChevronRight, FiLoader, FiFile } from "react-icons/fi";
import { useSectionContents, useFolderContents } from "../hooks/useContent";
import ContentGrid from "./contentGrid";
import { filterContents } from "../utils/contentFilter";

export default function HomeButton({ viewMode, searchQuery = "" }) {
  const [folderStack, setFolderStack] = useState([]);
  const currentFolder = folderStack[folderStack.length - 1] ?? null;

  const { data: sectionData, isLoading: sectionLoading, error: sectionError } = useSectionContents("home");
  const { data: folderData,  isLoading: folderLoading,  error: folderError  } = useFolderContents(currentFolder?._id);

  const isLoading = currentFolder ? folderLoading : sectionLoading;
  const error     = currentFolder ? folderError   : sectionError;

  const allFiles = currentFolder
    ? (folderData?.data?.contents ?? [])
    : (sectionData?.data?.contents ?? []);

  const visibleFiles = filterContents(allFiles, searchQuery);

  const navigateTo = (index) => setFolderStack((prev) => (index < 0 ? [] : prev.slice(0, index + 1)));
  const handleFolderOpen = (folder) => setFolderStack((prev) => [...prev, { _id: folder._id, name: folder.name }]);

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
      <nav className="flex items-center gap-1 text-sm mb-1 flex-wrap">
        <button onClick={() => navigateTo(-1)} className="flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition">
          <FiFile size={14} /> Shared Content
        </button>
        {folderStack.map((folder, i) => (
          <span key={folder._id} className="flex items-center gap-1">
            <FiChevronRight size={14} className="text-gray-400" />
            <button
              onClick={() => navigateTo(i)}
              className={`font-medium transition ${i === folderStack.length - 1 ? "text-gray-800 cursor-default" : "text-blue-600 hover:text-blue-800"}`}
            >
              {folder.name}
            </button>
          </span>
        ))}
      </nav>
      <p className="text-gray-500 italic text-sm mb-5">
        All files, folders, messages and links you shared with others
      </p>

      <ContentGrid
        files={visibleFiles}
        isLoading={false}
        error={error}
        emptyMessage={searchQuery ? "No matches found" : (currentFolder ? "This folder is empty" : "No contents yet")}
        emptySubMessage={searchQuery ? `Nothing matches "${searchQuery}"` : (currentFolder ? "See shared content here" : "Start by sharing content")}
        showViewToggle
        onFolderOpen={handleFolderOpen}
      />
    </div>
  );
}