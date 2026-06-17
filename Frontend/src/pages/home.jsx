import { useState } from "react";
import Header from "../components/header.jsx";
import Help from "../components/help.jsx";
import Sidebar from "../components/sideBar.jsx";
import HomeButton from "../components/homeButton.jsx";
import MyFilesButton from "../components/myFilesButton.jsx";
import SharedWithMeButton from "../components/sharedWithMeButton.jsx";
import CodedButton from "../components/codedButton.jsx";
import DraftsButton from "../components/draftsButton.jsx";
import TrashButton from "../components/trashButton.jsx";

export default function Home() {
  const [activePage, setActivePage] = useState("myfiles");
  const [viewMode, setViewMode]     = useState("grid");

  // Single search query, lifted here, fed by Header's SearchBar,
  // consumed by whichever section is currently active.
  const [searchQuery, setSearchQuery] = useState("");

  const renderContent = () => {
    switch (activePage) {
      case "myfiles":
        return <MyFilesButton viewMode={viewMode} searchQuery={searchQuery} />;
      case "home":
        return <HomeButton viewMode={viewMode} searchQuery={searchQuery} />;
      case "shared":
        return <SharedWithMeButton viewMode={viewMode} searchQuery={searchQuery} />;
      case "coded":
        return <CodedButton viewMode={viewMode} searchQuery={searchQuery} />;
      case "drafts":
        return <DraftsButton viewMode={viewMode} searchQuery={searchQuery} />;
      case "trash":
        return <TrashButton viewMode={viewMode} searchQuery={searchQuery} />;
      default:
        return <HomeButton viewMode={viewMode} searchQuery={searchQuery} />;
    }
  };

  return (
    <div className="h-screen bg-gray-100 overflow-hidden">
      {/* FIXED HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex h-[calc(100vh-96px)] pt-24">
        {/* SIDEBAR */}
        <Sidebar
          activePage={activePage}
          setActivePage={(page) => { setActivePage(page); setSearchQuery(""); }}
        />

        {/* MAIN CONTENT */}
        <main className="flex-1 overflow-y-auto h-full">
          <div className="p-8">{renderContent()}</div>
        </main>
      </div>

      {/* HELP BUTTON */}
      <div className="fixed bottom-6 right-6 z-50">
        <Help />
      </div>
    </div>
  );
}
