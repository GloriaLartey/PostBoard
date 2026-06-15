import { useState } from "react";
import { FiLock, FiLoader, FiCheck, FiUnlock } from "react-icons/fi";
import { useEncodeContent } from "../hooks/useContentActions";

export default function EncodeButton({ content }) {
  const [encoded, setEncoded] = useState(content?.isCoded ?? false);
  const [showSuccess, setShowSuccess] = useState(false);

  const encodeMutation = useEncodeContent();

  const handleEncode = async () => {
    if (encodeMutation.isPending || !content?._id) return;
    try {
      await encodeMutation.mutateAsync(content._id);
      setEncoded(true);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2500);
    } catch (err) {
      console.error("Encode failed:", err);
    }
  };

  const errorMsg = encodeMutation.error?.response?.data?.message;

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={handleEncode}
        disabled={encodeMutation.isPending}
        className={`
          flex items-center gap-2
          px-3 py-2 rounded-xl text-sm text-gray-700
          transition-all duration-300
          disabled:opacity-60 disabled:cursor-not-allowed
          ${encoded ? FiLock : FiUnlock} ${
            encodeMutation.isPending ? FiUnlock : FiLock
          }
        `}>
        {encodeMutation.isPending ? (
          <FiLoader className="animate-spin" size={16} />
        ) : encoded ? (
          <FiCheck size={16} />
        ) : (
          <FiLock size={16} />
        )}
        {encodeMutation.isPending
          ? "Encoding…"
          : encoded
            ? "Encoded"
            : "Encode"}
      </button>

      {showSuccess && (
        <p className="text-xs text-green-600 font-medium">
          ✓ Encoded! Decode key emailed to shared users.
        </p>
      )}
      {errorMsg && !encodeMutation.isPending && (
        <p className="text-xs text-red-500">{errorMsg}</p>
      )}
    </div>
  );
}
