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
        rounded-xl
        hover:rounded-full
        transition-all
        duration-300
      "
    >
      <div
        className="
          bg-black
          text-white
          text-center
          px-3
          md:px-4
          py-2
          text-sm
          md:text-base
          font-semibold
          rounded-xl
          hover:rounded-full
          transition-all
          duration-300
        "
      >
        Get Started
      </div>
    </div>
  );
}