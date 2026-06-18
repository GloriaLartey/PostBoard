import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/login")}
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
          bg-white
          px-4 sm:px-5 md:px-6
          py-1.5 sm:py-2
          text-sm sm:text-base
          font-semibold
          text-center
          transition-all
          duration-300
          hover:rounded-full
        "
      >
        <span
          className="
            bg-gradient-to-r
            from-blue-600
            via-pink-500
            to-cyan-400
            bg-clip-text
            text-transparent
          "
        >
          Login
        </span>
      </div>
    </div>
  );
}