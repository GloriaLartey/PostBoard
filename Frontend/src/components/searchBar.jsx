import { useState, useEffect, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";

/**
 * SearchBar — single shared search input, lives in Header.
 *
 * Controlled by the parent (Home.jsx) via `value` + `onQueryChange`,
 * so the same typed query persists/applies across whichever section
 * is currently active. Sections filter their own loaded data locally —
 * this component does not call the backend or render a results dropdown.
 */
export default function SearchBar({ value = "", onQueryChange, placeholder = "Search by name, type, or date..." }) {
  const [local, setLocal] = useState(value);
  const debounceRef = useRef(null);

  // Stay in sync if parent resets the query (e.g. switching sections)
  useEffect(() => { setLocal(value); }, [value]);

  const handleChange = (e) => {
    const next = e.target.value;
    setLocal(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => onQueryChange?.(next), 150);
  };

  const handleClear = () => {
    setLocal("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    onQueryChange?.("");
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center gap-2 px-4 py-3 border border-gray-300 rounded-2xl shadow-sm bg-white transition-all focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100">
        <FiSearch className="text-gray-400 flex-shrink-0" size={17} />
        <input
          type="text"
          value={local}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full outline-none text-sm text-gray-700 placeholder-gray-400 bg-transparent"
        />
        {local && (
          <button onClick={handleClear} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <FiX size={15} />
          </button>
        )}
      </div>
    </div>
  );
}