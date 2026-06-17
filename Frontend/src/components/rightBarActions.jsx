import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell, FiX, FiTrash2, FiLoader, FiEdit2, FiLogOut, FiLayout,
} from "react-icons/fi";
import { useAuth } from "../context/authContext";
import { useLogout } from "../hooks/useAuth";
import api from "../api/axios";

let _notifListeners = [];
let _notifications  = [];

export const addNotification = (notif) => {
  _notifications = [{ ...notif, id: Date.now(), read: false }, ..._notifications];
  _notifListeners.forEach((fn) => fn([..._notifications]));
};

export const useNotifications = () => {
  const [notifs, setNotifs] = useState([..._notifications]);
  useEffect(() => {
    _notifListeners.push(setNotifs);
    return () => { _notifListeners = _notifListeners.filter((fn) => fn !== setNotifs); };
  }, []);
  return [notifs, setNotifs];
};

export default function RightBarActions() {
  const { user, saveUser } = useAuth();
  const navigate           = useNavigate();
  const logoutMutation     = useLogout();

  const [openNotif,   setOpenNotif]   = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [notifs,      setNotifs]      = useNotifications();
  const [uploading,   setUploading]   = useState(false);
  const [avatarError, setAvatarError] = useState("");

  const notifRef   = useRef(null);
  const profileRef = useRef(null);
  const fileRef    = useRef(null);

  const unread  = notifs.filter((n) => !n.read).length;
  const initial = user?.username?.[0]?.toUpperCase() || "?";

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current   && !notifRef.current.contains(e.target))   setOpenNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setOpenProfile(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      try {
        const { data } = await api.get("api/content/section/shared-with-me", { params: { limit: 5 } });
        const contents  = data?.data?.contents || [];
        const lastCheck = Number(localStorage.getItem("pb_last_notif_check") || 0);
        const newItems  = contents.filter((c) => new Date(c.createdAt).getTime() > lastCheck);
        newItems.forEach((c) => addNotification({
          text:  `"${c.name}" was shared with you by ${c.owner?.username || "someone"}`,
          route: "/dashboard",
        }));
        if (newItems.length) localStorage.setItem("pb_last_notif_check", Date.now());
      } catch { /* silent */ }
    };
    check();
    const id = setInterval(check, 30_000);
    return () => clearInterval(id);
  }, [user]);

  const markAllRead = () => setNotifs((p) => p.map((n) => ({ ...n, read: true })));

  const handleNotifClick = (notif) => {
    setNotifs((p) => p.filter((n) => n.id !== notif.id));
    if (notif.route) navigate(notif.route);
    setOpenNotif(false);
  };

  /**
   * Single source of truth for logout. The hook's onSuccess/onError both
   * call clearAuth() already — we just await it here so any 401 (token
   * already expired server-side) is caught locally instead of surfacing
   * as an unhandled rejection in the console. We navigate only after the
   * mutation settles, success or fail, since the user is logged out
   * client-side either way.
   */
  const handleLogout = async () => {
    setOpenProfile(false);
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Expected when the access token was already invalid/expired —
      // clearAuth() still ran via the hook's onError, nothing further to do.
    } finally {
      navigate("/login");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setUploading(true); setAvatarError("");
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const { data } = await api.patch("api/auth/me/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      saveUser({ ...user, avatar: data.data.avatar });
    } catch {
      const reader = new FileReader();
      reader.onload = (ev) => saveUser({ ...user, avatar: ev.target.result });
      reader.readAsDataURL(file);
    } finally {
      setUploading(false); e.target.value = "";
    }
  };

  const AvatarCircle = ({ size = "w-10 h-10", textSize = "text-lg" }) => (
    user?.avatar
      ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
      : <div className={`w-full h-full bg-gradient-to-br from-blue-500 to-pink-500 flex items-center justify-center text-white font-bold ${textSize}`}>
          {initial}
        </div>
  );

  return (
    <div className="flex items-center gap-3">

      {/* DASHBOARD BUTTON */}
      <button
        onClick={() => navigate("/dashboard")}
        className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
      >
        <FiLayout size={15} /> Dashboard
      </button>

      {/* NOTIFICATIONS */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => { setOpenNotif((p) => !p); setOpenProfile(false); if (!openNotif) markAllRead(); }}
          className="relative p-2.5 rounded-xl bg-white shadow hover:bg-gray-50 transition"
        >
          <FiBell size={20} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>

        {openNotif && (
          <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl p-4 z-50 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold">Notifications</h2>
              <button onClick={() => setOpenNotif(false)} className="text-gray-400 hover:text-black"><FiX size={16} /></button>
            </div>
            {notifs.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-sm">You're all caught up!</div>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifs.map((n) => (
                  <button key={n.id} onClick={() => handleNotifClick(n)}
                    className={`w-full text-left p-3 rounded-xl text-sm transition hover:bg-blue-50 ${n.read ? "bg-gray-50 text-gray-600" : "bg-blue-50 text-gray-800 font-medium"}`}>
                    {n.text}
                  </button>
                ))}
              </div>
            )}
            {notifs.length > 0 && (
              <button onClick={() => setNotifs([])} className="w-full mt-3 text-xs text-center text-gray-400 hover:text-red-500 transition">
                Clear all
              </button>
            )}
          </div>
        )}
      </div>

      {/* PROFILE */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => { setOpenProfile((p) => !p); setOpenNotif(false); }}
          className="w-10 h-10 rounded-xl overflow-hidden shadow hover:shadow-md transition"
        >
          <AvatarCircle />
        </button>

        {openProfile && (
          <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl p-5 z-50 border border-gray-100">

            <div className="flex flex-col items-center text-center mb-4">
              <div className="relative mb-3">
                <div className="w-20 h-20 rounded-full overflow-hidden shadow-md">
                  <AvatarCircle size="w-20 h-20" textSize="text-3xl" />
                </div>
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-700 transition"
                  title="Change photo"
                >
                  {uploading ? <FiLoader className="animate-spin" size={12} /> : <FiEdit2 size={12} />}
                </button>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </div>

              {avatarError && <p className="text-red-500 text-xs mb-2">{avatarError}</p>}

              <h2 className="font-bold text-base">{user?.username || "User"}</h2>
              <p className="text-sm text-gray-500 mt-0.5">{user?.email}</p>

              {user?.avatar && (
                <button
                  onClick={() => saveUser({ ...user, avatar: null })}
                  className="mt-2 flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition"
                >
                  <FiTrash2 size={11} /> Remove photo
                </button>
              )}
            </div>

            <div className="border-t border-gray-100 pt-3">
              <button
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-red-500 transition text-sm font-medium"
              >
                {logoutMutation.isPending
                  ? <FiLoader className="animate-spin" size={15} />
                  : <FiLogOut size={15} />}
                {logoutMutation.isPending ? "Logging out…" : "Logout"}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
