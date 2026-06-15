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
      "
    >
      <div
        className="
          bg-white
          px-6
          py-2
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