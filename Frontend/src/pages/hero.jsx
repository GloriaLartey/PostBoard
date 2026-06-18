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
    "w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-white/80 backdrop-blur-md shadow-xl flex items-center justify-center";

  const bounce = "animate-bounce [animation-duration:3s]";

  return (
    <div className="relative min-h-screen overflow-hidden bg-white">
      {/* BACKGROUND IMAGE */}
      <img
        src="/Rectangle 54.png"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-90 z-0"
      />

      {/* TOP NAV */}
      <div className="relative z-20 flex items-center justify-between px-4 sm:px-6 md:px-10 lg:px-12 py-4 md:py-5">
        <Logo />

        {user ? (
          <RightBarActions />
        ) : (
          <div className="flex items-center gap-2 sm:gap-3">
            <Login />
            <Signup />
          </div>
        )}
      </div>

      {/* HERO SECTION */}
      <div className="relative z-10 min-h-[calc(100vh-90px)] grid grid-cols-1 lg:grid-cols-2 px-4 sm:px-6 md:px-8 lg:px-12">
        {/* LEFT SIDE */}
        <div className="flex flex-col justify-center items-center text-center pt-16 sm:pt-20 md:pt-24 lg:pt-0 pb-6 order-1">
          <h1
            className="
              text-3xl
              sm:text-4xl
              md:text-5xl
              lg:text-6xl
              font-extrabold
              leading-tight
              bg-gradient-to-r
              from-blue-600
              via-pink-500
              to-cyan-400
              bg-clip-text
              text-transparent
              max-w-3xl
            ">
            One Sharing Platform
          </h1>

          <p
            className="
              mt-3
              text-black md:text-gray-500
              italic
              text-sm
              sm:text-base
              md:text-lg
              max-w-xl md:max-w-2xl
              px-2
            ">
            Efficiently sharing and receiving files, folders, messages and links
            on a secure platform.
          </p>

          {/* CTA */}
          <div className="flex justify-center mt-6 md:mt-8 w-full">
            <div className="p-[2px] rounded-full bg-gradient-to-r from-blue-600 via-pink-500 to-cyan-400 hover:scale-105 transition duration-300">
              {user ? (
                <button
                  onClick={() => navigate("/dashboard")}
                  className="
                    flex items-center gap-2
                    px-6 sm:px-8 md:px-10
                    py-2 sm:py-2.5
                    rounded-full
                    bg-gray-900
                    text-white
                    text-sm md:text-base
                    font-semibold
                  ">
                  <FiLayout size={16} />
                  Go to Dashboard
                </button>
              ) : (
                <button
                  onClick={() => navigate("/signup")}
                  className="
                    px-6 sm:px-8 md:px-10
                    py-2 sm:py-2.5
                    rounded-full
                    bg-gray-900
                    text-white
                    text-sm md:text-base
                    font-semibold
                  ">
                  Get Started
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="relative order-2 flex justify-center items-center min-h-[260px] sm:min-h-[320px] lg:min-h-0 mt-4 lg:mt-0">
          {/* Main Image */}
          <img
            src="/img7.png"
            alt="Main Visual"
            className="
relative
w-[220px]
sm:w-[280px]
md:w-[360px]
lg:w-[560px]
xl:w-[700px]
object-contain
opacity-90
mx-auto
"
          />

          {[
            {
              src: "/folder.png",
              delay: "0s",
              pos: "absolute left-[12%] bottom-[5%] lg:left-[20%] lg:bottom-[8%]",
            },
            {
              src: "/message.webp",
              delay: "0.2s",
              pos: "absolute left-[32%] bottom-[-5%] lg:left-[38%] lg:bottom-[-3%]",
            },
            {
              src: "/video.png",
              delay: "0.4s",
              pos: "absolute right-[32%] bottom-[-5%] lg:right-[38%] lg:bottom-[-3%]",
            },
            {
              src: "/code.webp",
              delay: "0.6s",
              pos: "absolute right-[12%] bottom-[5%] lg:right-[20%] lg:bottom-[8%]",
            },
          ].map(({ src, delay, pos }) => (
            <div
              key={src}
              className={`
                ${pos}
                ${iconBase}
                ${bounce}
                transition-all
                duration-700
                ${
                  showIcons
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }
              `}
              style={{
                animationDelay: delay,
              }}>
              <img
                src={src}
                alt=""
                className="
                  w-5 h-5
                  sm:w-6 sm:h-6
                  md:w-8 md:h-8
                  lg:w-10 lg:h-10
                "
              />
            </div>
          ))}
        </div>
      </div>

      {/* HELP */}
      <div className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-50 scale-90 md:scale-100">
        <Help />
      </div>
    </div>
  );
}
