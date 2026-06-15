import { useEffect, useState } from "react";
import { FiX, FiSave } from "react-icons/fi";

export default function Edit({
  isOpen,
  onClose,
  content,
  onSave,
}) {
  const [form, setForm] = useState({
    name: "",
    message: "",
    url: "",
    additionalMessage: "",
  });

  useEffect(() => {
    if (content) {
      setForm({
        name: content.name || "",
        message: content.message || "",
        url: content.url || "",
        additionalMessage: content.additionalMessage || "",
      });
    }
  }, [content]);

  if (!isOpen || !content) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    onSave({
      ...content,
      ...form,
    });
    onClose();
  };

  const isMessage = content.type === "message";
  const isLink = content.type === "link";
  const isUpload =
    !isMessage &&
    !isLink &&
    content.type !== "folder";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] px-4">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl p-6 relative">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4"
        >
          <FiX size={24} />
        </button>

        {/* TITLE */}
        <h2 className="text-2xl font-bold mb-6">
          Edit {content.type}
        </h2>

        {/* NAME */}
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter name..."
          className="w-full border rounded-2xl px-4 py-3 mb-4 outline-none focus:border-blue-500"
        />

        {/* MESSAGE */}
        {isMessage && (
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Edit message..."
            className="w-full h-40 border rounded-2xl p-4 mb-4 outline-none focus:border-blue-500"
          />
        )}

        {/* URL */}
        {isLink && (
          <input
            name="url"
            value={form.url}
            onChange={handleChange}
            placeholder="Edit URL..."
            className="w-full border rounded-2xl px-4 py-3 mb-4 outline-none focus:border-purple-500"
          />
        )}

        {/* UPLOAD ADDITIONAL MESSAGE */}
        {isUpload && (
          <textarea
            name="additionalMessage"
            value={form.additionalMessage}
            onChange={handleChange}
            placeholder="Edit additional message..."
            className="w-full h-32 border rounded-2xl p-4 mb-4 outline-none focus:border-blue-500"
          />
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-4 mt-6">

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-2xl hover:bg-blue-700"
          >
            <FiSave />
            Save
          </button>

        </div>

      </div>
    </div>
  );
}