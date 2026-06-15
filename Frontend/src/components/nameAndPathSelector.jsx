import { useState, useMemo } from "react";
import { FiSearch, FiFolder, FiHome, FiX, FiChevronRight, FiLoader } from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import * as contentAPI from "../api/content.api";

const useFolders = () =>
  useQuery({
    queryKey: ["folders-picker"],
    queryFn: async () => {
      // Fetch up to 200 folders from myfile section
      const res = await contentAPI.getSectionContents("myfile", { type: "folder", limit: 200 });
      // res shape: { success, message, data: { contents, pagination } }
      return res?.data?.contents ?? [];
    },
    staleTime: 1000 * 30,
  });

function buildFlatTree(folders) {
  const map = {};
  folders.forEach((f) => (map[f._id] = { ...f, children: [] }));
  const roots = [];
  folders.forEach((f) => {
    const parentId = f.parentFolder?._id || f.parentFolder;
    if (parentId && map[parentId]) {
      map[parentId].children.push(map[f._id]);
    } else {
      roots.push(map[f._id]);
    }
  });
  const flat = [];
  const walk = (node, depth) => {
    flat.push({ ...node, depth });
    node.children.forEach((c) => walk(c, depth + 1));
  };
  roots.forEach((r) => walk(r, 0));
  return flat;
}

export default function NameAndPathSelector({ fileName, setFileName, selectedFolder, onFolderSelect }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");

  const { data: folders = [], isLoading } = useFolders();
  const tree = useMemo(() => buildFlatTree(folders), [folders]);

  const filtered = useMemo(() => {
    if (!search) return tree;
    return tree.filter((f) => f.name.toLowerCase().includes(search.toLowerCase()));
  }, [tree, search]);

  const displayValue = selectedFolder?.name ?? "";

  return (
    <div className="grid w-full md:grid-cols-2 gap-4 mt-6 relative">
      {/* Name */}
      <input
        type="text"
        value={fileName}
        onChange={(e) => setFileName(e.target.value)}
        placeholder="Enter content name..."
        className="border border-gray-400 rounded-2xl px-4 py-3 outline-none focus:border-blue-500"
      />

      {/* Location selector */}
      <div className="relative">
        <input
          type="text"
          value={displayValue}
          readOnly
          onClick={() => { setOpen(true); setSearch(""); }}
          placeholder="Save to (My Contents / Folder)..."
          className="border border-gray-400 rounded-2xl px-4 py-3 w-full cursor-pointer outline-none focus:border-blue-500"
        />
        {selectedFolder && (
          <button
            onClick={(e) => { e.stopPropagation(); onFolderSelect(null); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-400 transition"
          >
            <FiX size={14} />
          </button>
        )}

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute z-50 top-14 left-0 w-72 bg-white shadow-2xl rounded-2xl p-3 max-h-64 flex flex-col border border-gray-100">
              {/* Search */}
              <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 mb-2 flex-shrink-0">
                {search
                  ? <button onClick={() => setSearch("")}><FiX size={13} className="text-gray-400" /></button>
                  : <FiSearch size={13} className="text-gray-400" />}
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search folders..."
                  className="w-full outline-none text-sm"
                  autoFocus
                />
              </div>

              {/* List */}
              <div className="overflow-y-auto flex-1">
                {/* Root */}
                {!search && (
                  <button
                    onClick={() => { onFolderSelect({ _id: null, name: "My Contents" }); setOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-blue-50 transition text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <FiHome size={13} className="text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">My Contents</span>
                    <FiChevronRight size={12} className="ml-auto text-gray-300 group-hover:text-blue-400" />
                  </button>
                )}

                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <FiLoader className="animate-spin text-blue-400" size={18} />
                  </div>
                ) : filtered.length === 0 && search ? (
                  <p className="text-center text-xs text-gray-400 py-4">No folders found</p>
                ) : (
                  filtered.map((folder) => (
                    <button
                      key={folder._id}
                      onClick={() => { onFolderSelect({ _id: folder._id, name: folder.name }); setOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition text-left group"
                      style={{ paddingLeft: `${12 + folder.depth * 14}px` }}
                    >
                      <div className="w-7 h-7 rounded-lg bg-yellow-50 flex items-center justify-center flex-shrink-0">
                        <FiFolder size={13} className="text-yellow-500" />
                      </div>
                      <span className="text-sm text-gray-700 truncate">{folder.name}</span>
                      <FiChevronRight size={12} className="ml-auto text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
