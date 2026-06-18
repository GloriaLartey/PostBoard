import { useNavigate } from "react-router-dom";

export default function Logo() {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate("/")}
      className="
        flex
        items-center
        gap-1.5
        cursor-pointer
        select-none
      "
    >
      {/* PB Box */}
      <div
        className="
          p-1.5
          sm:p-2
          bg-blue-600
          text-white
          font-bold
          text-sm
          sm:text-base
          md:text-lg
          rounded-lg
          md:rounded-xl
          shadow-sm
        "
      >
        PB
      </div>

      {/* Text */}
      <div
        className="
          font-semibold
          text-base
          sm:text-lg
          md:text-xl
          text-black
        "
      >
        PostBoard
      </div>
    </div>
  );
}