import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiLayout } from "react-icons/fi";
import Logo from "../components/logo";
import Signup from "../components/signup";
import Login from "../components/login";
import Help from "../components/help";
import RightBarActions from "../components/rightBarActions";
import { useAuth } from "../context/authContext";

export default function Hero() {
  const [showIcons, setShowIcons] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setShowIcons(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const iconBase =
    "w-20 h-20 rounded-full bg-white/80 backdrop-blur-md shadow-xl flex items-center justify-center";
  const bounce = "animate-bounce [animation-duration:3s]";

  return (
    <div className="relative h-screen overflow-hidden bg-white">
      {/* BACKGROUND IMAGE */}
      <img
        src="/Rectangle 54.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-90 z-0"
      />

      {/* TOP NAV */}
      <div className="relative z-20 flex items-center justify-between px-6 md:px-12 py-6">
        <Logo />

        {/* Logged in → Dashboard + bell + profile. Logged out → Login + Signup */}
        {user ? (
          <RightBarActions />
        ) : (
          <div className="flex items-center gap-3">
            <Login />
            <Signup />
          </div>
        )}
      </div>

      {/* HERO SECTION */}
      <div className="relative z-10 h-[calc(100vh-100px)] grid grid-cols-1 lg:grid-cols-2 px-6 md:px-12">
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center items-center text-center pb-10">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight bg-gradient-to-r from-blue-600 via-pink-500 to-cyan-400 bg-clip-text text-transparent max-w-3xl">
            One Sharing Platform
          </h1>
          <p className="mt-3 text-gray-500 italic text-sm md:text-lg max-w-2xl">
            Efficiently sharing and receiving files, folders, messages and links
            on a secure platform.
          </p>

          {/* CTA — Get Started when logged out, Go to Dashboard when logged in */}
          <div className="flex justify-center mt-8 w-full">
            <div className="p-[2px] rounded-full bg-gradient-to-r from-blue-600 via-pink-500 to-cyan-400 hover:scale-105 transition duration-300">
              {user ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2 px-10 py-2 rounded-full bg-gray-900 text-white font-semibold">
                  <FiLayout size={16} /> Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate("/signup")}
                  className="px-10 py-2 rounded-full bg-gray-900 text-white font-semibold">
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative hidden lg:block">
          <img
            src="/img7.png"
            alt="Main Visual"
            className="absolute right-0 top-1/2 -translate-y-1/2 w-[900px] object-contain opacity-90"
          />

          {[
            { src: "/folder.png", delay: "0s", pos: "bottom-45 left-15" },
            { src: "/message.webp", delay: "0.2s", pos: "bottom-25 left-50" },
            { src: "/video.png", delay: "0.4s", pos: "bottom-25 right-40" },
            { src: "/code.webp", delay: "0.6s", pos: "bottom-45 right-10" },
          ].map(({ src, delay, pos }) => (
            <div
              key={src}
              className={`absolute ${pos} ${iconBase} ${bounce} transition-all duration-700 ${showIcons ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
              style={{ animationDelay: delay }}>
              <img src={src} className="w-10 h-10" />
            </div>
          ))}
        </div>
      </div>

      {/* HELP */}
      <div className="fixed bottom-6 right-6 z-50">
        <Help />
      </div>
    </div>
  );
}
