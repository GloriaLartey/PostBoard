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

  const floatingIcons = [
    {
      src: "/folder.png",
      delay: "0s",
      // arc: far left, slightly up
      pos: "left-[4%] bottom-[12%]",
    },
    {
      src: "/message.webp",
      delay: "0.2s",
      // arc: left-center, lower
      pos: "left-[27%] bottom-[0%]",
    },
    {
      src: "/video.png",
      delay: "0.4s",
      // arc: right-center, lower
      pos: "right-[27%] bottom-[0%]",
    },
    {
      src: "/code.webp",
      delay: "0.6s",
      // arc: far right, slightly up
      pos: "right-[4%] bottom-[12%]",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white">
      {/* ── BACKGROUND ─────────────────────────────────────────── */}
      <img
        src="/Rectangle 54.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-90 z-0 pointer-events-none"
      />

      {/* ── TOP NAV ────────────────────────────────────────────── */}
      <nav className="relative z-20 flex items-center justify-between px-4 sm:px-6 md:px-10 py-3 md:py-4">
        <Logo />
        {user ? (
          <RightBarActions />
        ) : (
          <div className="flex items-center gap-2">
            <Login />
            <Signup />
          </div>
        )}
      </nav>

      {/* ── HERO BODY ──────────────────────────────────────────── */}
      {/*
        Mobile / tablet  → single column: text first, image below
        Desktop (lg+)    → two columns side-by-side
      */}
      <div className="relative z-10 flex flex-col lg:grid lg:grid-cols-2 lg:items-center min-h-[calc(100vh-64px)] px-4 sm:px-6 md:px-10 pb-16 lg:pb-0">
        {/* ── LEFT: TEXT + CTA ───────────────────────────────── */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left justify-center pt-10 sm:pt-12 md:pt-14 lg:pt-0 order-1">
          {/* eyebrow pill */}

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4">
             <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 border border-pink-100 text-pink-600 text-xs font-semibold tracking-wide mb-4 select-none">
            
        <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
            Effective Communication & Collaboration
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold tracking-wide mb-4 select-none">
            
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Secure File Sharing
          </span>

          </div>
         

          <h1
            className="
            text-[2rem]
            sm:text-[2.4rem]
            md:text-[2.8rem]
            lg:text-[3rem]
            xl:text-[3.4rem]
            font-extrabold
            leading-[1.15]
            tracking-tight
            bg-gradient-to-r from-blue-600 via-pink-500 to-cyan-400
            bg-clip-text text-transparent
            [color:blue]
            max-w-lg
          ">
            One Sharing Platform
          </h1>

          <p
            className="
            mt-3 md:mt-4
            text-gray-500
            text-sm sm:text-base md:text-[0.95rem]
            max-w-sm sm:max-w-md
            leading-relaxed
          ">
            Efficiently sharing and receiving files, folders, messages and links
            on a secure platform.
          </p>

          {/* CTA button */}
          <div className="mt-6 md:mt-7">
            <div className="p-[2px] rounded-full bg-gradient-to-r from-blue-600 via-pink-500 to-cyan-400 hover:scale-[1.03] transition-transform duration-200 inline-block">
              {user ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="
                    flex items-center gap-2
                    px-7 sm:px-8 py-2.5
                    rounded-full bg-gray-900
                    text-white text-sm font-semibold
                    whitespace-nowrap
                  ">
                  <FiLayout size={15} />
                  Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate("/signup")}
                  className="
                    px-7 sm:px-8 py-2.5
                    rounded-full bg-gray-900
                    text-white text-sm font-semibold
                    whitespace-nowrap
                  ">
                  Get Started
                </button>
              )}
            </div>
          </div>

          {/* trust micro-copy */}
          <p className="mt-4 text-xs text-gray-400">
            No credit card required · Free to start
          </p>
        </div>

        {/* ── RIGHT: IMAGE + FLOATING ICONS ─────────────────── */}
        {/*
          On mobile/tablet the image section sits below the text (order-2).
          We give it enough bottom padding so the floating icons don't clip.
          On desktop it fills the column naturally.
        */}
        <div
          className="
          order-2
          relative
          flex justify-center items-center
          w-full
          mt-8 sm:mt-10 lg:mt-0
          pb-14 sm:pb-16 lg:pb-0
          min-h-[220px] sm:min-h-[300px] md:min-h-[340px] lg:min-h-0
        ">
          {/* Main visual */}
          <img
            src="/img7.png"
            alt="Platform preview"
            className="
              relative z-10
              w-[200px]
              sm:w-[260px]
              md:w-[320px]
              lg:w-[420px]
              xl:w-[500px]
              object-contain
              drop-shadow-xl
              mx-auto
            "
          />

          {/* Floating icon bubbles in an arc */}
          {floatingIcons.map(({ src, delay, pos }) => (
            <div
              key={src}
              style={{ animationDelay: delay }}
              className={`
                absolute ${pos}
                w-9 h-9
                sm:w-11 sm:h-11
                md:w-12 md:h-12
                lg:w-13 lg:h-13
                rounded-full
                bg-white/85 backdrop-blur-md
                shadow-lg
                flex items-center justify-center
                animate-bounce [animation-duration:2.8s]
                transition-all duration-700
                ${showIcons ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}
              `}>
              <img
                src={src}
                alt=""
                aria-hidden="true"
                className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── HELP ───────────────────────────────────────────────── */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 scale-90 md:scale-100">
        <Help />
      </div>
    </div>
  );
}
