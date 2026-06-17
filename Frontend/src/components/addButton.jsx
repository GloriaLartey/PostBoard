import { useEffect, useRef, useState } from "react";
import DiscardButton from "./discardButton";
import SaveButton from "./saveButton";
import NameAndPathSelector from "./nameAndPathSelector";
import {
  useCreateMessage,
  useCreateLink,
  useUploadFile,
  useUploadFolder,
} from "../hooks/useContent";
import {
  FiPlus,
  FiUpload,
  FiEdit3,
  FiFileText,
  FiImage,
  FiVideo,
  FiCode,
  FiFolderPlus,
  FiFolder,
  FiMessageSquare,
  FiLink,
  FiX,
  FiMusic,
} from "react-icons/fi";

// ── Modal shell defined OUTSIDE AddButton so it never remounts on re-render ──
function Modal({ title, onX, maxW = "max-w-4xl", children }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div
        className={`bg-white w-full ${maxW} rounded-3xl shadow-2xl p-6 relative overflow-y-auto max-h-[90vh]`}>
        <button
          onClick={onX}
          className="absolute top-4 right-4 text-gray-400 hover:text-black transition">
          <FiX size={24} />
        </button>
        <h2 className="text-3xl font-bold mb-6 mt-6">{title}</h2>
        {children}
      </div>
    </div>
  );
}

const INIT = {
  message: "",
  url: "",
  fileName: "",
  folderName: "",
  selectedFolder: null,
  uploadedDocument: null,
  uploadedImage: null,
  uploadedVideo: null,
  uploadedAudio: null,
  uploadedCode: null,
  uploadedFolder: null,
};

export default function AddButton() {
  const dropdownRef = useRef(null);

  const [openDropdown, setOpenDropdown] = useState(false);
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showFolderUpload, setShowFolderUpload] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showVideoUpload, setShowVideoUpload] = useState(false);
  const [showAudioUpload, setShowAudioUpload] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showCodeUpload, setShowCodeUpload] = useState(false);
  const [showCreateOptions, setShowCreateOptions] = useState(false);
  const [showMessageEditor, setShowMessageEditor] = useState(false);
  const [showUrlEditor, setShowUrlEditor] = useState(false);
  const [showFolderCreator, setShowFolderCreator] = useState(false);

  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [folderName, setFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [uploadedDocument, setUploadedDocument] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [uploadedAudio, setUploadedAudio] = useState(null);
  const [uploadedCode, setUploadedCode] = useState(null);
  const [uploadedFolder, setUploadedFolder] = useState(null);
  const [saveError, setSaveError] = useState("");

  const createMessageMutation = useCreateMessage();
  const createLinkMutation = useCreateLink();
  const uploadFileMutation = useUploadFile();
  const uploadFolderMutation = useUploadFolder();

  const resetForm = () => {
    setMessage("");
    setUrl("");
    setFileName("");
    setFolderName("");
    setSelectedFolder(null);
    setUploadedDocument(null);
    setUploadedImage(null);
    setUploadedVideo(null);
    setUploadedAudio(null);
    setUploadedCode(null);
    setUploadedFolder(null);
    setSaveError("");
  };

  const closeAll = () => {
    setShowUploadOptions(false);
    setShowDocumentUpload(false);
    setShowImageUpload(false);
    setShowVideoUpload(false);
    setShowAudioUpload(false);
    setShowCodeUpload(false);
    setShowFolderUpload(false);
    setShowCreateOptions(false);
    setShowMessageEditor(false);
    setShowUrlEditor(false);
    setShowFolderCreator(false);
    resetForm();
  };

  const handleXClose = async (type) => {
    const parentFolder = selectedFolder?._id ?? null;
    try {
      if (type === "message" && message.trim()) {
        await createMessageMutation.mutateAsync({
          name: fileName?.trim() || "Untitled Message",
          body: message.trim(),
          isDraft: true,
          parentFolder,
        });
      } else if (type === "link" && url.trim()) {
        await createLinkMutation.mutateAsync({
          name: fileName?.trim() || "Untitled Link",
          body: url.trim(),
          isDraft: true,
          parentFolder,
        });
      } else if (type === "file") {
        const file =
          uploadedDocument ||
          uploadedImage ||
          uploadedVideo ||
          uploadedAudio ||
          uploadedCode;
        if (file) {
          const fd = new FormData();
          fd.append("file", file);
          if (fileName?.trim()) fd.append("name", fileName.trim());
          if (message) fd.append("description", message);
          if (parentFolder) fd.append("parentFolder", parentFolder);
          fd.append("section", "draft");
          await uploadFileMutation.mutateAsync({ formData: fd });
        }
      } else if (type === "folder-upload" && uploadedFolder?.length) {
        const fd = new FormData();
        uploadedFolder.forEach((f) => fd.append("files", f));
        fd.append(
          "relativePaths",
          JSON.stringify(
            uploadedFolder.map((f) => f.webkitRelativePath || f.name),
          ),
        );
        if (fileName?.trim()) fd.append("name", fileName.trim());
        if (message) fd.append("description", message);
        if (parentFolder) fd.append("parentFolder", parentFolder);
        fd.append("section", "draft");
        await uploadFolderMutation.mutateAsync({ formData: fd });
      }
    } catch (err) {
      console.error("Draft save error:", err);
    }
    closeAll();
  };

  useEffect(() => {
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setOpenDropdown(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleImageUpload = (e) => {
    const f = e.target.files?.[0];
    if (f?.type.startsWith("image/")) setUploadedImage(f);
  };
  const handleDocumentUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ok = [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".csv",
      ".ppt",
      ".pptx",
      ".odt",
      ".ods",
      ".odp",
      ".rtf",
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".html",
      ".css",
      ".py",
      ".java",
      ".php",
      ".c",
      ".cpp",
      ".cs",
      ".json",
      ".sql",
    ];
    if (!ok.includes("." + f.name.split(".").pop().toLowerCase())) {
      alert("Please upload a document or code file.");
      e.target.value = "";
      return;
    }
    setUploadedDocument(f);
  };
  const handleVideoUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ok = [
      ".mp4",
      ".mov",
      ".avi",
      ".mkv",
      ".wmv",
      ".webm",
      ".m4v",
      ".3gp",
    ];
    if (
      !f.type.startsWith("video/") ||
      !ok.includes("." + f.name.split(".").pop().toLowerCase())
    ) {
      alert("Video files only.");
      e.target.value = "";
      return;
    }
    setUploadedVideo(f);
  };
  const handleAudioUpload = (e) => {
    const f = e.target.files?.[0];
    if (f?.type.startsWith("audio/")) setUploadedAudio(f);
  };
  const handleCodeUpload = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ok = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".html",
      ".css",
      ".py",
      ".java",
      ".php",
      ".c",
      ".cpp",
      ".cs",
      ".json",
      ".sql",
    ];
    if (!ok.includes("." + f.name.split(".").pop().toLowerCase())) {
      alert("Code files only.");
      return;
    }
    setUploadedCode(f);
  };
  const handleFolderUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) setUploadedFolder(files);
  };

  // ── Shared bottom actions bar ─────────────────────────────────────────────
  const actions = (type, getDataFn) => (
    <div className="flex flex-wrap items-center gap-4 mt-8">
      <SaveButton
        type={type}
        getData={getDataFn}
        onSuccess={closeAll}
        onError={setSaveError}
      />
      <DiscardButton onDiscard={closeAll} />
      {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
    </div>
  );

  // ── Shared name + location row ────────────────────────────────────────────
  const nameAndPath = (
    <NameAndPathSelector
      fileName={fileName}
      setFileName={setFileName}
      selectedFolder={selectedFolder}
      onFolderSelect={setSelectedFolder}
    />
  );

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ADD BUTTON */}
      <button
        onClick={() => setOpenDropdown(!openDropdown)}
        className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow hover:bg-blue-700 transition">
        <FiPlus />
        <span>Add</span>
      </button>

      {/* DROPDOWN */}
      {openDropdown && (
        <div className="absolute left-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl p-3 z-50">
          <button
            onClick={() => {
              setShowUploadOptions(true);
              setOpenDropdown(false);
            }}
            className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl hover:bg-gray-100 transition">
            <FiUpload /> Upload
          </button>
          <button
            onClick={() => {
              setShowCreateOptions(true);
              setOpenDropdown(false);
            }}
            className="w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl hover:bg-gray-100 transition">
            <FiEdit3 /> Create
          </button>
        </div>
      )}

      {/* UPLOAD OPTIONS */}
      {showUploadOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowUploadOptions(false)}
              className="absolute top-4 right-4">
              <FiX size={24} />
            </button>
            <h2 className="text-3xl font-bold mb-2">Upload Content</h2>
            <p className="text-gray-500 mb-8">
              Select the type of content you want to upload
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
              {[
                {
                  label: "Document & Code",
                  icon: (
                    <FiFileText
                      size={40}
                      className="mx-auto text-blue-500 mb-4"
                    />
                  ),
                  desc: "PDF, DOC, DOCX, JS, PY, HTML...",
                  color: "hover:border-blue-500",
                  fn: () => {
                    setShowUploadOptions(false);
                    setShowDocumentUpload(true);
                  },
                },
                {
                  label: "Image",
                  icon: (
                    <FiImage size={40} className="mx-auto text-pink-500 mb-4" />
                  ),
                  desc: "PNG, JPG and image files",
                  color: "hover:border-pink-500",
                  fn: () => {
                    setShowUploadOptions(false);
                    setShowImageUpload(true);
                  },
                },
                {
                  label: "Video",
                  icon: (
                    <FiVideo size={40} className="mx-auto text-red-500 mb-4" />
                  ),
                  desc: "MP4 and video files",
                  color: "hover:border-red-500",
                  fn: () => {
                    setShowUploadOptions(false);
                    setShowVideoUpload(true);
                  },
                },
                {
                  label: "Audio",
                  icon: (
                    <FiMusic
                      size={40}
                      className="mx-auto text-orange-500 mb-4"
                    />
                  ),
                  desc: "MP3, WAV and audio files",
                  color: "hover:border-orange-500",
                  fn: () => {
                    setShowUploadOptions(false);
                    setShowAudioUpload(true);
                  },
                },
              ].map(({ label, icon, desc, color, fn }) => (
                <label
                  key={label}
                  onClick={fn}
                  className={`border rounded-2xl p-6 ${color} hover:shadow-lg cursor-pointer transition text-center`}>
                  {icon}
                  <h3 className="font-bold text-lg">{label}</h3>
                  <p className="text-sm text-gray-400 mt-2">{desc}</p>
                </label>
              ))}
              <label
                onClick={() => {
                  setShowUploadOptions(false);
                  setShowFolderUpload(true);
                }}
                className="border rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-yellow-500 hover:shadow-lg cursor-pointer transition">
                <FiFolder size={40} className="text-yellow-600 mb-4" />
                <h3 className="text-lg font-bold mb-2">Upload Folder</h3>
                <p className="text-sm text-gray-400 mb-10">
                  Folder from your device
                </p>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT */}
      {showDocumentUpload && (
        <Modal
          title="Upload a Document or Code File"
          onX={() => handleXClose("file")}>
          <label className="border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 rounded-3xl h-56 flex flex-col items-center justify-center text-center cursor-pointer transition-all w-full">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.odt,.ods,.odp,.rtf,.js,.jsx,.ts,.tsx,.html,.css,.py,.java,.php,.c,.cpp,.cs,.json,.sql"
              onChange={handleDocumentUpload}
              className="hidden"
            />
            {!uploadedDocument ? (
              <>
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <FiFileText size={42} className="text-blue-500" />
                </div>
                <h3 className="font-semibold text-lg">
                  Upload Document or Code
                </h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                  PDF, DOC, DOCX, XLS, PPT or JS, TS, HTML, PY and more
                </p>
                <span className="mt-3 text-xs text-blue-500 font-medium">
                  PDF • DOC • DOCX • JS • TS • HTML • PY • JSON
                </span>
              </>
            ) : (
              <>
                <div className="bg-blue-100 p-4 rounded-full mb-4">
                  <FiFileText size={42} className="text-blue-500" />
                </div>
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                  ✓ Ready to save
                </div>
                <h3 className="font-semibold break-all px-4">
                  {uploadedDocument.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {(uploadedDocument.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            )}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a description or note..."
            className="w-full h-20 border border-gray-400 mt-4 rounded-2xl p-3 outline-none resize-none focus:border-blue-500"
          />
          {nameAndPath}
          {actions("file", () => ({
            file: uploadedDocument,
            name: fileName,
            description: message,
            parentFolderId: selectedFolder?._id ?? null,
          }))}
        </Modal>
      )}

      {/* UPLOAD IMAGE */}
      {showImageUpload && (
        <Modal title="Upload an Image" onX={() => handleXClose("file")}>
          <label
            htmlFor="imageUpload"
            className="border-2 border-dashed border-pink-300 hover:border-pink-500 hover:bg-pink-50 rounded-3xl h-56 flex flex-col items-center justify-center text-center cursor-pointer transition-all w-full overflow-hidden">
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {!uploadedImage ? (
              <>
                <div className="bg-pink-100 p-4 rounded-full mb-4">
                  <FiImage size={42} className="text-pink-500" />
                </div>
                <h3 className="font-semibold text-lg">Upload Image</h3>
                <span className="mt-4 text-xs text-pink-500 font-medium">
                  PNG • JPG • JPEG • GIF • WebP
                </span>
              </>
            ) : (
              <>
                <img
                  src={URL.createObjectURL(uploadedImage)}
                  alt="preview"
                  className="w-28 h-28 object-cover rounded-2xl shadow-md mb-3"
                />
                <div className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-medium mb-2">
                  ✓ Ready to save
                </div>
                <h3 className="font-semibold break-all max-w-md px-4">
                  {uploadedImage.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  {(uploadedImage.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            )}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a description or note..."
            className="w-full h-20 border border-gray-400 mt-4 rounded-2xl p-3 outline-none resize-none focus:border-blue-500"
          />
          {nameAndPath}
          {actions("file", () => ({
            file: uploadedImage,
            name: fileName,
            description: message,
            parentFolderId: selectedFolder?._id ?? null,
          }))}
        </Modal>
      )}

      {/* UPLOAD VIDEO */}
      {showVideoUpload && (
        <Modal title="Upload a Video" onX={() => handleXClose("file")}>
          <label className="border-2 border-dashed border-red-300 hover:border-red-500 hover:bg-red-50 rounded-3xl h-56 flex flex-col items-center justify-center text-center cursor-pointer transition-all w-full">
            <input
              type="file"
              accept=".mp4,.mov,.avi,.mkv,.wmv,.webm,.m4v,.3gp,video/*"
              onChange={handleVideoUpload}
              className="hidden"
            />
            {!uploadedVideo ? (
              <>
                <div className="bg-red-100 p-4 rounded-full mb-4">
                  <FiVideo size={42} className="text-red-500" />
                </div>
                <h3 className="font-semibold text-lg">Upload Video</h3>
                <span className="mt-4 text-xs text-red-500 font-medium">
                  MP4 • MOV • AVI • MKV
                </span>
              </>
            ) : (
              <>
                <FiVideo size={55} className="text-red-500 mb-4" />
                <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                  ✓ Ready to save
                </div>
                <h3 className="font-semibold break-all px-4">
                  {uploadedVideo.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {(uploadedVideo.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            )}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a description or note..."
            className="w-full h-20 border border-gray-400 mt-4 rounded-2xl p-3 outline-none resize-none focus:border-blue-500"
          />
          {nameAndPath}
          {actions("file", () => ({
            file: uploadedVideo,
            name: fileName,
            description: message,
            parentFolderId: selectedFolder?._id ?? null,
          }))}
        </Modal>
      )}

      {/* UPLOAD AUDIO */}
      {showAudioUpload && (
        <Modal title="Upload an Audio" onX={() => handleXClose("file")}>
          <label className="border-2 border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50 rounded-3xl h-56 flex flex-col items-center justify-center text-center cursor-pointer transition-all w-full">
            <input
              type="file"
              accept=".mp3,.wav,.aac,.flac,.ogg,audio/*"
              onChange={handleAudioUpload}
              className="hidden"
            />
            {!uploadedAudio ? (
              <>
                <div className="bg-orange-100 p-4 rounded-full mb-4">
                  <FiMusic size={42} className="text-orange-500" />
                </div>
                <h3 className="font-semibold text-lg">Upload Audio</h3>
                <span className="mt-4 text-xs text-orange-500 font-medium">
                  MP3 • WAV • AAC • FLAC
                </span>
              </>
            ) : (
              <>
                <FiMusic size={55} className="text-orange-500 mb-4" />
                <div className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                  ✓ Ready to save
                </div>
                <h3 className="font-semibold break-all px-4">
                  {uploadedAudio.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {(uploadedAudio.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            )}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a description or note..."
            className="w-full h-20 border border-gray-400 mt-4 rounded-2xl p-3 outline-none resize-none focus:border-blue-500"
          />
          {nameAndPath}
          {actions("file", () => ({
            file: uploadedAudio,
            name: fileName,
            description: message,
            parentFolderId: selectedFolder?._id ?? null,
          }))}
        </Modal>
      )}

      {/* UPLOAD CODE */}
      {showCodeUpload && (
        <Modal title="Upload a Code File" onX={() => handleXClose("file")}>
          <label className="border-2 border-dashed border-green-300 hover:border-green-500 hover:bg-green-50 rounded-3xl h-56 flex flex-col items-center justify-center text-center cursor-pointer transition-all w-full">
            <input
              type="file"
              accept=".js,.jsx,.ts,.tsx,.html,.css,.py,.java,.php,.c,.cpp,.cs,.json,.sql"
              onChange={handleCodeUpload}
              className="hidden"
            />
            {!uploadedCode ? (
              <>
                <div className="bg-green-100 p-4 rounded-full mb-4">
                  <FiCode size={42} className="text-green-500" />
                </div>
                <h3 className="font-semibold text-lg">Upload Code</h3>
                <span className="mt-4 text-xs text-green-500 font-medium">
                  JS • TS • HTML • CSS • PY
                </span>
              </>
            ) : (
              <>
                <FiCode size={55} className="text-green-500 mb-4" />
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                  ✓ Ready to save
                </div>
                <h3 className="font-semibold break-all px-4">
                  {uploadedCode.name}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {(uploadedCode.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </>
            )}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a description or note..."
            className="w-full h-20 border border-gray-400 mt-4 rounded-2xl p-3 outline-none resize-none focus:border-blue-500"
          />
          {nameAndPath}
          {actions("file", () => ({
            file: uploadedCode,
            name: fileName,
            description: message,
            parentFolderId: selectedFolder?._id ?? null,
          }))}
        </Modal>
      )}

      {/* UPLOAD FOLDER */}
      {showFolderUpload && (
        <Modal
          title="Upload a Folder"
          onX={() => handleXClose("folder-upload")}>
          <label className="border-2 border-dashed border-yellow-300 hover:border-yellow-500 hover:bg-yellow-50 rounded-3xl h-56 flex flex-col items-center justify-center text-center cursor-pointer transition-all w-full">
            <input
              type="file"
              webkitdirectory="true"
              directory=""
              multiple
              onChange={handleFolderUpload}
              className="hidden"
            />
            {!uploadedFolder ? (
              <>
                <div className="bg-yellow-100 p-4 rounded-full mb-4">
                  <FiFolder size={42} className="text-yellow-500" />
                </div>
                <h3 className="font-semibold text-lg">Upload Folder</h3>
                <span className="mt-4 text-xs text-yellow-500 font-medium">
                  All folder types supported
                </span>
              </>
            ) : (
              <>
                <FiFolder size={55} className="text-yellow-500 mb-4" />
                <div className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                  ✓ Ready to save
                </div>
                <h3 className="font-semibold">
                  {uploadedFolder[0]?.webkitRelativePath?.split("/")[0] ||
                    "Folder"}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {uploadedFolder.length} files •{" "}
                  {(
                    uploadedFolder.reduce((t, f) => t + f.size, 0) /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </p>
              </>
            )}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a description or note..."
            className="w-full h-20 border border-gray-400 mt-4 rounded-2xl p-3 outline-none resize-none focus:border-blue-500"
          />
          {nameAndPath}
          {actions("folder-upload", () => ({
            files: uploadedFolder,
            name: fileName,
            description: message,
            parentFolderId: selectedFolder?._id ?? null,
          }))}
        </Modal>
      )}

      {/* CREATE OPTIONS */}
      {showCreateOptions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-6 relative">
            <button
              onClick={() => setShowCreateOptions(false)}
              className="absolute top-4 right-4">
              <FiX size={24} />
            </button>
            <h2 className="text-3xl font-bold mb-2">Create Content</h2>
            <p className="text-gray-500 mb-8">Select what you want to create</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <button
                onClick={() => {
                  setShowCreateOptions(false);
                  setShowMessageEditor(true);
                }}
                className="border rounded-2xl p-8 hover:border-blue-500 hover:shadow-lg transition text-center">
                <FiMessageSquare
                  size={45}
                  className="mx-auto text-blue-600 mb-4"
                />
                <h3 className="font-bold text-xl">Create a Message</h3>
                <p className="text-gray-400 mt-2">
                  Write long notes and secure messages
                </p>
              </button>
              <button
                onClick={() => {
                  setShowCreateOptions(false);
                  setShowUrlEditor(true);
                }}
                className="border rounded-2xl p-8 hover:border-purple-500 hover:shadow-lg transition text-center">
                <FiLink size={45} className="mx-auto text-purple-500 mb-4" />
                <h3 className="font-bold text-xl">Add a URL</h3>
                <p className="text-gray-400 mt-2">
                  Save important links and resources
                </p>
              </button>
              <button
                onClick={() => {
                  setShowCreateOptions(false);
                  setShowFolderCreator(true);
                }}
                className="border rounded-2xl p-8 hover:border-green-500 hover:shadow-lg transition text-center">
                <FiFolderPlus
                  size={45}
                  className="mx-auto text-green-500 mb-4"
                />
                <h3 className="font-bold text-xl">Create Folder</h3>
                <p className="text-gray-400 mt-2">
                  Organize your contents into folders
                </p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MESSAGE EDITOR */}
      {showMessageEditor && (
        <Modal title="Create a Message" onX={() => handleXClose("message")}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message here..."
            className="w-full h-72 border border-gray-400 rounded-2xl p-5 outline-none resize-none focus:border-blue-500"
          />
          {nameAndPath}
          {actions("message", () => ({
            name: fileName,
            body: message,
            parentFolderId: selectedFolder?._id ?? null,
          }))}
        </Modal>
      )}

      {/* URL EDITOR */}
      {showUrlEditor && (
        <Modal
          title="Add a URL"
          onX={() => handleXClose("link")}
          maxW="max-w-3xl">
          <textarea
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste your URL here..."
            className="w-full h-40 border rounded-2xl p-5 outline-none resize-none border-gray-400 focus:border-purple-500"
          />
          {nameAndPath}
          {actions("link", () => ({
            name: fileName,
            body: url,
            parentFolderId: selectedFolder?._id ?? null,
          }))}
        </Modal>
      )}

      {/* CREATE FOLDER */}
      {showFolderCreator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-6 relative">
            <button
              onClick={closeAll}
              className="absolute top-4 right-4 text-gray-400 hover:text-black transition">
              <FiX size={24} />
            </button>
            <div className="flex justify-center mb-5 mt-4">
              <div className="bg-blue-100 text-blue-600 p-5 rounded-2xl">
                <FiFolderPlus size={40} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-center mb-6">
              Create a Folder
            </h2>
            <NameAndPathSelector
              fileName={folderName}
              setFileName={setFolderName}
              selectedFolder={selectedFolder}
              onFolderSelect={setSelectedFolder}
            />
            {saveError && (
              <p className="text-red-500 text-sm mt-2">{saveError}</p>
            )}
            <div className="flex gap-4 mt-6">
              <SaveButton
                type="create-folder"
                getData={() => ({
                  name: folderName,
                  parentFolderId: selectedFolder?._id ?? null,
                })}
                onSuccess={closeAll}
                onError={setSaveError}
              />
              <DiscardButton onDiscard={closeAll} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
