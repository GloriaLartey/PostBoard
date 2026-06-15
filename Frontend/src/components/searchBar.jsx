import { useState, useEffect, useRef } from "react";
import { FiSearch, FiX, FiLoader, FiFileText, FiImage, FiVideo, FiCode, FiFolder, FiLink, FiMessageSquare, FiMusic } from "react-icons/fi";
import { useSearchContents } from "../hooks/useContent";

const typeIcon = (type) => {
  const p = { size: 14 };
  switch (type) {
    case "image":   return <FiImage {...p} />;
    case "video":   return <FiVideo {...p} />;
    case "code":    return <FiCode {...p} />;
    case "folder":  return <FiFolder {...p} />;
    case "link":    return <FiLink {...p} />;
    case "message": return <FiMessageSquare {...p} />;
    case "audio":   return <FiMusic {...p} />;
    default:        return <FiFileText {...p} />;
  }
};

const typeColor = {
  image: "text-pink-500 bg-pink-50", video: "text-red-500 bg-red-50",
  audio: "text-orange-500 bg-orange-50", code: "text-green-600 bg-green-50",
  folder: "text-yellow-600 bg-yellow-50", link: "text-purple-500 bg-purple-50",
  message: "text-blue-500 bg-blue-50", document: "text-blue-600 bg-blue-50",
};

export default function SearchBar({ onSelectContent }) {
  const [query,    setQuery]    = useState("");
  const [open,     setOpen]     = useState(false);
  const containerRef            = useRef(null);

  // Debounce: only search after 300ms pause
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data, isFetching } = useSearchContents(debouncedQuery);
  const results = data?.data?.contents || [];

  // Close on outside click
  useEffect(() => {
    const h = (e) => { if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSelect = (item) => {
    onSelectContent?.(item);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative w-full max-w-md" ref={containerRef}>
      <div className={`flex items-center gap-2 px-4 py-3 border rounded-2xl shadow-sm bg-white transition-all ${open && query ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-300"}`}>
        {isFetching
          ? <FiLoader className="text-blue-500 animate-spin flex-shrink-0" size={17} />
          : <FiSearch className="text-gray-400 flex-shrink-0" size={17} />}

        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search files, folders, links..."
          className="w-full outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
        />

        {query && (
          <button onClick={() => { setQuery(""); setDebouncedQuery(""); setOpen(false); }}
            className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <FiX size={15} />
          </button>
        )}
      </div>

      {/* RESULTS DROPDOWN */}
      {open && query.length >= 2 && (
        <div className="absolute top-14 left-0 w-full bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden max-h-80 overflow-y-auto">
          {results.length === 0 && !isFetching && (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No results for "<span className="font-medium">{query}</span>"
            </div>
          )}
          {results.map((item) => (
            <button key={item._id} onClick={() => handleSelect(item)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition text-left border-b border-gray-50 last:border-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${typeColor[item.type] || "text-blue-600 bg-blue-50"}`}>
                {typeIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {item.type} · {new Date(item.updatedAt || item.createdAt).toLocaleDateString()}
                  {item.owner?.username && ` · by ${item.owner.username}`}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}