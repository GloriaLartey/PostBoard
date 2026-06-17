import Logo from "./logo";
import SearchBar from "./searchBar";
import RightBarActions from "./rightBarActions.jsx";

export default function Header({ searchQuery, onSearchChange }) {
  return (
    <header className="w-full h-24 bg-white border-none shadow-sm px-8 flex items-center">
      <div className="w-full flex items-center justify-between gap-8">

        {/* LEFT - LOGO */}
        <div className="shrink-0">
          <Logo />
        </div>

        {/* MIDDLE - SEARCH BAR */}
        <div className="flex-1 flex justify-center">
          <SearchBar value={searchQuery} onQueryChange={onSearchChange} />
        </div>

        {/* RIGHT - ACTIONS */}
        <div className="shrink-0">
          <RightBarActions />
        </div>

      </div>
    </header>
  );
}
