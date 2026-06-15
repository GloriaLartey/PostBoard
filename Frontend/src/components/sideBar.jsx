import AddButton from "./addButton.jsx";

import {
  FiHome,
  FiFileText,
  FiUsers,
  FiLock,
  FiEdit,
  FiClock,
  FiTrash2,
  FiHardDrive,
} from "react-icons/fi";

export default function Sidebar({ activePage, setActivePage }) {
  // SIDEBAR ITEMS
  const sidebarItems = [
    {
      id: "myfiles",
      label: "My Contents",
      icon: <FiHome />,
    },

    {
      id: "home",
      label: "Shared Contents",
      icon: <FiFileText />,
    },

    {
      id: "shared",
      label: "Shared with Me",
      icon: <FiUsers />,
    },

    {
      id: "coded",
      label: "Coded Contents",
      icon: <FiLock />,
    },

    {
      id: "drafts",
      label: "Drafts",
      icon: <FiEdit />,
    },

    {
      id: "trash",
      label: "Trash",
      icon: <FiTrash2 />,
    },
  ];

  return (
    <aside className="w-[290px] bg-white border-none h-[calc(100vh-96px)] flex flex-col px-5 py-3 overflow-y-auto">
      {/* ADD BUTTON */}
      <div className="mb-5">
        <AddButton />
      </div>

      {/* NAVIGATION */}
      <div className="flex flex-col">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all duration-200 ${
              activePage === item.id
                ? "bg-blue-600 text-white shadow-lg"
                : "hover:bg-gray-100 text-gray-700"
            }`}>
            <span className="text-xl">{item.icon}</span>

            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
