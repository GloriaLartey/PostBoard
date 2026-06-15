import { useState } from "react";
import {
  FiHelpCircle,
  FiHome,
  FiFile,
  FiUsers,
  FiLock,
  FiStar,
  FiEdit,
  FiClock,
  FiTrash2,
  FiPlus,
  FiX,
} from "react-icons/fi";

export default function Help() {
  const [open, setOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "About PostBoard",
      content:
        "PostBoard is a smart productivity and file management platform that helps users organize files, folders, links, coded messages, and shared resources in one place.",
    },

    {
      title: "How to Use PostBoard",
      content: (
        <div className="space-y-3 text-left">
          <p>Select any option from the sidebar:</p>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FiPlus />
              <span>Add</span>
            </div>

            <div className="flex items-center gap-2">
              <FiHome />
              <span>My Contents</span>
            </div>

            <div className="flex items-center gap-2">
              <FiFile />
              <span>Shared Contents</span>
            </div>

            <div className="flex items-center gap-2">
              <FiUsers />
              <span>Shared with Me</span>
            </div>

            <div className="flex items-center gap-2">
              <FiLock />
              <span>Coded Contents</span>
            </div>

            <div className="flex items-center gap-2">
              <FiEdit />
              <span>Drafts</span>
            </div>

            <div className="flex items-center gap-2">
              <FiTrash2 />
              <span>Trash</span>
            </div>
          </div>
        </div>
      ),
    },

    {
      title: "Add",
      content:
        "Use the + Add option to upload new files, create folders, save links, or add new content to your workspace.",
      icon: <FiPlus size={40} />,
    },

    {
      title: "My Contents",
      content:
        "The My Contents gives you an overview of your activities, recent uploads, quick access tools, and important updates.",
      icon: <FiHome size={40} />,
    },

    {
      title: "Shared Contents",
      content:
        "Shared Contents stores all shared files, documents, images, videos, and folders in one organized location.",
      icon: <FiFile size={40} />,
    },

    {
      title: "Shared with Me",
      content:
        "This section contains files and folders other users have shared with you for collaboration and viewing.",
      icon: <FiUsers size={40} />,
    },

    {
      title: "Coded Contents",
      content:
        "Coded Messages allows users to create and view encrypted or protected messages securely.",
      icon: <FiLock size={40} />,
    },

    {
      title: "Drafts",
      content:
        "Drafts stores unfinished work or temporary content before publishing or sharing.",
      icon: <FiEdit size={40} />,
    },

    {
      title: "Trash",
      content:
        "Deleted items are temporarily stored in Trash before being permanently removed.",
      icon: <FiTrash2 size={40} />,
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <>
      {/* Help Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-black text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition">
        <FiHelpCircle size={20} />
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black">
              <FiX size={24} />
            </button>

            {/* Slide Content */}
            <div className="flex flex-col items-center text-center min-h-[320px] justify-center">
              {slides[currentSlide].icon && (
                <div className="mb-4 text-blue-600">
                  {slides[currentSlide].icon}
                </div>
              )}

              <h2 className="text-2xl font-bold mb-4">
                {slides[currentSlide].title}
              </h2>

              <div className="text-gray-600 leading-relaxed">
                {slides[currentSlide].content}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-6">
              <button
                onClick={prevSlide}
                disabled={currentSlide === 0}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40">
                Previous
              </button>

              <button
                onClick={nextSlide}
                disabled={currentSlide === slides.length - 1}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40">
                Next
              </button>
            </div>

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-6 flex-wrap">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentSlide === index
                      ? "bg-blue-600 scale-110"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
