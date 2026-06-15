import { useState, useRef, useEffect } from "react";
import {
  FiMoreVertical,
  FiExternalLink,
  FiDownload,
  FiEdit,
  FiEdit3,
  FiTrash2,
  FiShare2,
  FiLock,
} from "react-icons/fi";

import Share from "./share";
import EncodeButton from "./encode";

export default function ThreeDotsMenu({
  file,
  onOpen,
  onRename,
  onDelete,
  onEdit,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const close = () => setOpen(false);

  const isFolder = file?.type === "folder";
  const isCreated = file?.type === "message" || file?.type === "link";
  const hasUrl = !!file?.cloudinary?.url;
  const isCoded = !!file?.isCoded;

  const Item = ({ icon, label, onClick, danger = false }) => (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
        close();
      }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 transition text-left ${
        danger ? "text-red-500 hover:bg-red-50" : "text-gray-700"
      }`}>
      <span className={danger ? "text-red-400" : "text-gray-400"}>{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((p) => !p);
        }}
        className="opacity-0 group-hover:opacity-100 transition p-1 rounded-lg hover:bg-gray-100 text-gray-500">
        <FiMoreVertical size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-7 bg-white shadow-2xl rounded-2xl w-48 z-50 overflow-hidden border border-gray-100 py-1">
          {onOpen && (
            <Item
              icon={<FiExternalLink size={15} />}
              label="Open"
              onClick={onOpen}
            />
          )}

          {/* Edit — for message/link body */}
          {isCreated && onEdit && (
            <Item icon={<FiEdit3 size={15} />} label="Edit" onClick={onEdit} />
          )}

          {/* Rename */}
          {onRename && (
            <Item
              icon={<FiEdit size={15} />}
              label="Rename"
              onClick={() => onRename(file)}
            />
          )}

          {/* Download — only for non-coded uploaded files */}
          {hasUrl && !isFolder && !isCoded && (
            <Item
              icon={<FiDownload size={15} />}
              label="Download"
              onClick={() => window.open(file.cloudinary.url, "_blank")}
            />
          )}

          {/* Download coded — must decode first */}
          {hasUrl && !isFolder && isCoded && (
            <Item
              icon={<FiDownload size={15} />}
              label="Download (decode first)"
              onClick={() =>
                alert("Please decode this content first before downloading.")
              }
            />
          )}

          <div
            onClick={(e) => e.stopPropagation()}
            className=" border-t border-gray-100 my-1 right-0 hover:bg-gray-50">
            <Share content={file} />
          </div>

          <div
            className="my-1 hover:bg-gray-50 right-0 "
            onClick={(e) => e.stopPropagation()}>
            <EncodeButton content={file} />
          </div>

          {onDelete && <div className="border-t border-gray-100 my-1" />}
          {onDelete && (
            <Item
              icon={<FiTrash2 size={15} />}
              label="Move to trash"
              onClick={onDelete}
              danger
            />
          )}
        </div>
      )}
    </div>
  );
}
