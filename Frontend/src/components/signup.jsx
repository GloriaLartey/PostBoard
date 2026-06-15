import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/signup")}
      className="
        cursor-pointer
        p-[3px]
        bg-gradient-to-r
        from-blue-600
        via-pink-500
        to-cyan-400
        transition-all
        duration-300
        hover:rounded-full
      "
    >
      <div
        className="
          bg-black
          text-white
          text-center
          px-3
          py-2
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