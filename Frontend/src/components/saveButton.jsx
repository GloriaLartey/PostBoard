import { useState } from "react";
import { FiSave, FiLoader } from "react-icons/fi";
import {
  useUploadFile,
  useUploadFolder,
  useCreateFolder,
  useCreateMessage,
  useCreateLink,
} from "../hooks/useContent";

export default function SaveButton({ type, getData, onSuccess, onError }) {
  const [loading, setLoading] = useState(false);

  const uploadFileMutation = useUploadFile();
  const uploadFolderMutation = useUploadFolder();
  const createFolderMutation = useCreateFolder();
  const createMessageMutation = useCreateMessage();
  const createLinkMutation = useCreateLink();

  const handleSave = async () => {
    setLoading(true);
    try {
      const formData = getData();
      const parentFolderId = formData.parentFolderId ?? null;

      switch (type) {
        case "file": {
          if (!formData.file) throw new Error("No file selected.");
          const fd = new FormData();
          fd.append("file", formData.file);
          if (formData.name?.trim()) fd.append("name", formData.name.trim());
          if (formData.description)
            fd.append("description", formData.description);
          if (parentFolderId) fd.append("parentFolder", parentFolderId);
          if (formData.isCoded) fd.append("isCoded", "true");
          if (formData.shareWith?.length)
            fd.append("shareWith", JSON.stringify(formData.shareWith));
          // section defaults to "myfile" on backend
          await uploadFileMutation.mutateAsync({ formData: fd });
          break;
        }

        case "folder-upload": {
          if (!formData.files?.length) throw new Error("No folder selected.");
          const fd = new FormData();
          formData.files.forEach((f) => fd.append("files", f));
          fd.append(
            "relativePaths",
            JSON.stringify(
              formData.files.map((f) => f.webkitRelativePath || f.name),
            ),
          );
          if (formData.name?.trim()) fd.append("name", formData.name.trim());
          if (formData.description)
            fd.append("description", formData.description);
          if (parentFolderId) fd.append("parentFolder", parentFolderId);
          if (formData.isCoded) fd.append("isCoded", "true");
          if (formData.shareWith?.length)
            fd.append("shareWith", JSON.stringify(formData.shareWith));
          await uploadFolderMutation.mutateAsync({ formData: fd });
          break;
        }

        case "create-folder": {
          if (!formData.name?.trim())
            throw new Error("Folder name is required.");
          await createFolderMutation.mutateAsync({
            name: formData.name.trim(),
            parentFolder: parentFolderId,
            shareWith: formData.shareWith ?? [],
          });
          break;
        }

        case "message": {
          if (!formData.body?.trim())
            throw new Error("Message body is required.");
          await createMessageMutation.mutateAsync({
            name: formData.name?.trim() || "Untitled Message",
            body: formData.body.trim(),
            parentFolder: parentFolderId,
            shareWith: formData.shareWith ?? [],
            isDraft: formData.isDraft ?? false,
            isCoded: formData.isCoded ?? false,
          });
          break;
        }

        case "message-draft": {
          // Save as draft — body may be empty/partial
          await createMessageMutation.mutateAsync({
            name: formData.name?.trim() || "Untitled Message",
            body: formData.body?.trim() || " ",
            parentFolder: parentFolderId,
            isDraft: true,
          });
          break;
        }

        case "link": {
          if (!formData.body?.trim()) throw new Error("URL is required.");
          await createLinkMutation.mutateAsync({
            name: formData.name?.trim() || formData.body.trim(),
            body: formData.body.trim(),
            parentFolder: parentFolderId,
            shareWith: formData.shareWith ?? [],
            isDraft: formData.isDraft ?? false,
            isCoded: formData.isCoded ?? false,
          });
          break;
        }

        case "link-draft": {
          await createLinkMutation.mutateAsync({
            name: formData.name?.trim() || "Untitled Link",
            body: formData.body?.trim() || "https://",
            parentFolder: parentFolderId,
            isDraft: true,
          });
          break;
        }

        default:
          throw new Error(`Unknown type: ${type}`);
      }

      onSuccess?.();
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Save failed.";
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  };

  const isPending =
    loading ||
    uploadFileMutation.isPending ||
    uploadFolderMutation.isPending ||
    createFolderMutation.isPending ||
    createMessageMutation.isPending ||
    createLinkMutation.isPending;

  return (
    <button
      onClick={handleSave}
      disabled={isPending}
      className="
    flex
    items-center
    justify-center
    gap-2
    bg-blue-600
    text-white

    px-3 sm:px-4 md:px-5
    py-2.5 sm:py-3

    text-sm md:text-base

    rounded-xl md:rounded-2xl

    hover:bg-blue-700
    transition

    disabled:opacity-50
    disabled:cursor-not-allowed

    w-full sm:w-auto
  ">
      {isPending ? (
        <FiLoader className="animate-spin" size={16} />
      ) : (
        <FiSave size={16} />
      )}

      {isPending ? "Saving…" : "Save"}
    </button>
  );
}
