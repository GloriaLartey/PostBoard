import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/signup")}
      className="
        cursor-pointer
        p-[2px]
        bg-gradient-to-r
        from-blue-600
        via-pink-500
        to-cyan-400
        transition-all
        duration-300
        hover:rounded-full
        hover:scale-105
      "
    >
      <div
        className="
          bg-black
          text-white
          text-center
          px-3 sm:px-4 md:px-5
          py-1.5 sm:py-2
          text-sm sm:text-base
          font-semibold
          transition-all
          duration-300
          hover:rounded-full
        "
      >
        Get Started
      </div>
    </div>
  );
}