import { useMemo, useState } from "react";
import { FiShare2, FiSearch, FiX, FiLoader, FiCheck } from "react-icons/fi";
import { useUsers } from "../hooks/useUsers";
import { useShareContent } from "../hooks/useContentActions";

export default function Share({ content }) {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [shareWithAll, setShareWithAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");

  const { data: usersData, isLoading: loadingUsers } = useUsers(
    search,
    showModal,
  );
  const users = usersData?.data?.users || [];

  const shareMutation = useShareContent();

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
    );
  }, [users, search]);

  const toggleUser = (userId) => {
    setSelectedIds((prev) => {
      const next = prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];
      setShareWithAll(next.length === users.length && users.length > 0);
      return next;
    });
  };

  const handleShareWithAll = () => {
    if (!shareWithAll) {
      setSelectedIds(users.map((u) => u._id));
      setShareWithAll(true);
    } else {
      setSelectedIds([]);
      setShareWithAll(false);
    }
  };

  const handleOpen = () => {
    console.log("CONTENT", content);
    console.log("SHARED WITH", content?.sharedWith);
    setSearch("");
    setSuccessMsg("");

    shareMutation.reset();

    setShareWithAll(content?.sharedWithAll || false);

    setSelectedIds(
      content?.sharedWith?.map((s) => s.user?._id || s.user) || [],
    );

    setShowModal(true);
  };

  const handleDone = async () => {
    if (!content || !content._id) {
      console.error("Invalid content:", content);
      console.log("Content:", content);
      return;
    }

    if (!selectedIds.length && !shareWithAll) {
      setShowModal(false);
      return;
    }

    try {
      const shareWith = shareWithAll ? "all" : selectedIds;

      await shareMutation.mutateAsync({
        contentId: content._id,
        shareWith,
      });

      setSuccessMsg("Shared successfully!");
    } catch (err) {
      console.error("Share failed:", err);
    }
  };

  const errorMsg = shareMutation.error?.response?.data?.message;

  return (
    <>
      {/* SHARE BUTTON — always enabled */}
      <button
        onClick={handleOpen}
        className="flex items-center justify-center w-12 h-12 rounded-2xl text-blue-500 hover:scale-105 transition duration-300 cursor-pointer">
        <FiShare2 size={15} />
      </button>

      {/* SHARE MODAL */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}>
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
            {/* HEADER */}
            <div className="p-6 shadow-sm">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-5 right-5 text-gray-500 hover:text-black transition">
                <FiX size={22} />
              </button>

              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-pink-500 to-cyan-400 bg-clip-text text-transparent">
                Share Options
              </h2>
              {content?.name && (
                <>
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    Sharing:{" "}
                    <span className="font-medium text-gray-600">
                      {content.name}
                    </span>
                  </p>

                  {content?.sharedWithAll && (
                    <p className="text-xs text-green-600 mt-1">
                      Currently shared with everyone
                    </p>
                  )}

                  {!content?.sharedWithAll &&
                    content?.sharedWith?.length > 0 && (
                      <p className="text-xs text-blue-600 mt-1">
                        Currently shared with {content.sharedWith.length} user
                        {content.sharedWith.length > 1 ? "s" : ""}
                      </p>
                    )}
                </>
              )}

              <div className="relative mt-5">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users by name or email"
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-pink-400"
                />
                {search ? (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">
                    <FiX size={20} />
                  </button>
                ) : (
                  <FiSearch
                    size={20}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                )}
              </div>

              <p className="mt-5 text-sm font-semibold text-gray-500">
                Select users
              </p>
            </div>

            {/* USERS LIST */}
            <div className="max-h-[300px] overflow-y-auto px-6 py-4 space-y-3">
              {loadingUsers ? (
                <div className="flex justify-center items-center py-10">
                  <FiLoader className="animate-spin text-blue-500" size={24} />
                </div>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <label
                    key={user._id}
                    className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition rounded-2xl px-4 py-3 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {user.username?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {user.username}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user._id)}
                      onChange={() => toggleUser(user._id)}
                      className="w-5 h-5 accent-pink-500"
                    />
                  </label>
                ))
              ) : (
                <div className="text-center text-sm text-gray-400 py-10">
                  No users found
                </div>
              )}
            </div>

            {/* BOTTOM */}
            <div className="bg-white p-6 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
              {errorMsg && (
                <p className="text-red-500 text-sm mb-3">{errorMsg}</p>
              )}
              {successMsg && (
                <p className="text-green-500 text-sm mb-3 flex items-center gap-1">
                  <FiCheck size={14} /> {successMsg}
                </p>
              )}

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={shareWithAll}
                  onChange={handleShareWithAll}
                  className="w-5 h-5 accent-pink-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Share with all
                </span>
              </label>

              {selectedIds.length > 0 && !shareWithAll && (
                <p className="text-xs text-gray-400 mt-2">
                  {selectedIds.length} user{selectedIds.length > 1 ? "s" : ""}{" "}
                  selected
                </p>
              )}

              <button
                onClick={handleDone}
                disabled={shareMutation.isPending}
                className="w-full mt-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-pink-500 to-cyan-400 text-white font-semibold shadow-lg hover:scale-[1.02] transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-2">
                {shareMutation.isPending ? (
                  <>
                    <FiLoader className="animate-spin" size={16} /> Sharing…
                  </>
                ) : (
                  "Done"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
