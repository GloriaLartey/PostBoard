import { FiTrash2 } from "react-icons/fi";

export default function DiscardButton({
  onDiscard,
  text = "Discard",
}) {
  return (
    <button
      onClick={onDiscard}
      className="
        flex
        items-center
        gap-2
        bg-red-100
        text-red-600
        px-5
        py-3
        rounded-2xl
        hover:bg-red-200
        transition
      "
    >
      <FiTrash2 />
      {text}
    </button>
  );
}