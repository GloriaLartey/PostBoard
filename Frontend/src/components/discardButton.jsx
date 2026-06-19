import { FiTrash2 } from "react-icons/fi";

export default function DiscardButton({ onDiscard, text = "Discard" }) {
  return (
    <button
      onClick={onDiscard}
      className="
    flex
    items-center
    justify-center
    gap-2

    bg-red-100
    text-red-600

    px-3 sm:px-4 md:px-5
    py-2.5 sm:py-3

    text-sm md:text-base

    rounded-xl md:rounded-2xl

    hover:bg-red-200
    transition

    w-full sm:w-auto
  ">
      <FiTrash2 />
      {text}
    </button>
  );
}
