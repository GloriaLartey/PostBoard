import Logo from "./logo";
import SearchBar from "./searchBar";
import RightBarActions from "./rightBarActions.jsx";
import { HamburgerButton } from "./sideBar.jsx";

export default function Header({ searchQuery, onSearchChange, mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <header className="w-full bg-white shadow-sm z-30 relative">

      {/* ── ROW 1: Hamburger · Logo · Actions ──────────────── */}
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 h-14 md:h-16 gap-3">

        {/* LEFT: hamburger (mobile only) + logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <HamburgerButton onClick={() => setMobileMenuOpen((p) => !p)} />
          <Logo />
        </div>

        {/* MIDDLE: search bar — hidden on small, visible md+ inline */}
        <div className="hidden md:flex flex-1 justify-center max-w-xl mx-4">
          <SearchBar value={searchQuery} onQueryChange={onSearchChange} />
        </div>

        {/* RIGHT: actions */}
        <div className="flex-shrink-0">
          <RightBarActions />
        </div>
      </div>

      {/* ── ROW 2: Search bar on mobile only ───────────────── */}
      <div className="md:hidden px-4 pb-3">
        <SearchBar value={searchQuery} onQueryChange={onSearchChange} />
      </div>

    </header>
  );
}
