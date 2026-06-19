import { useState } from "react";
import AddButton from "./addButton.jsx";
import {
  FiHome,
  FiFileText,
  FiUsers,
  FiLock,
  FiEdit,
  FiTrash2,
  FiMenu,
  FiX,
} from "react-icons/fi";

const sidebarItems = [
  { id: "myfiles", label: "My Contents", icon: <FiHome /> },
  { id: "home", label: "Shared Contents", icon: <FiFileText /> },
  { id: "shared", label: "Shared with Me", icon: <FiUsers /> },
  { id: "coded", label: "Coded Contents", icon: <FiLock /> },
  { id: "drafts", label: "Drafts", icon: <FiEdit /> },
  { id: "trash", label: "Trash", icon: <FiTrash2 /> },
];

export default function Sidebar({
  activePage,
  setActivePage,
  mobileMenuOpen,
  setMobileMenuOpen,
}) {
  const handleSelect = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
  };

  const NavItems = () => (
    <div className="flex flex-col gap-1">
      {sidebarItems.map((item) => (
        <button
          key={item.id}
          onClick={() => handleSelect(item.id)}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-sm font-medium ${
            activePage === item.id
              ? "bg-blue-600 text-white shadow-md"
              : "hover:bg-gray-100 text-gray-700"
          }`}>
          <span className="text-base flex-shrink-0">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ─────────────────────────────────── */}
      <aside className="hidden lg:flex w-[240px] xl:w-[260px] bg-white h-[calc(100vh-72px)] flex-col px-4 py-4 overflow-y-auto flex-shrink-0">
        <div className="mb-4">
          <AddButton />
        </div>
        <NavItems />
      </aside>

      {/* ── MOBILE HAMBURGER BUTTON (rendered in Header via prop) ─ */}
      {/* exported separately — see HamburgerButton below */}

      {/* ── MOBILE DRAWER MODAL ─────────────────────────────── */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 left-0 h-full w-[260px] bg-white z-50 shadow-2xl flex flex-col lg:hidden animate-slide-in-left">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <span className="font-bold text-gray-800 text-sm">
                Navigation
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition">
                <FiX size={18} />
              </button>
            </div>

            {/* Add button */}
            <div className="px-4 py-3 border-b border-gray-100">
              <AddButton />
            </div>

            {/* Nav items */}
            <div className="flex-1 overflow-y-auto px-3 py-3">
              <NavItems />
            </div>
          </div>
        </>
      )}
    </>
  );
}

/** Standalone hamburger button — drop this into Header on mobile */
export function HamburgerButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-700 transition flex-shrink-0"
      aria-label="Open menu">
      <FiMenu size={20} />
    </button>
  );
}
