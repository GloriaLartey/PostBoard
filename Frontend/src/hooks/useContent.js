import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as contentAPI from "../api/content.api";

export const useSectionContents = (section, options = {}) =>
  useQuery({
    queryKey: ["content", "section", section],
    queryFn: () => contentAPI.getSectionContents(section, options.params),
    enabled: !!section,
    refetchOnWindowFocus: true,
  });

export const useFolderContents = (folderId, options = {}) =>
  useQuery({
    queryKey: ["content", "folder", folderId],
    queryFn: () => contentAPI.getFolderContents(folderId, options.params),
    enabled: !!folderId,
  });

export const useSearchContents = (query, options = {}) =>
  useQuery({
    queryKey: ["content", "search", query],
    queryFn: () => contentAPI.searchContents(query, options.params),
    enabled: !!query && query.length > 0,
  });

export const useContent = (id) =>
  useQuery({
    queryKey: ["content", id],
    queryFn: () => contentAPI.getContent(id),
    enabled: !!id,
  });

const invalidateContent = (queryClient) =>
  queryClient.invalidateQueries({ queryKey: ["content"] });

export const useCreateFolder = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: contentAPI.createFolder, onSuccess: () => invalidateContent(qc) });
};

export const useCreateMessage = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: contentAPI.createMessage, onSuccess: () => invalidateContent(qc) });
};

export const useCreateLink = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: contentAPI.createLink, onSuccess: () => invalidateContent(qc) });
};

export const useUploadFile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ formData, onProgress }) => contentAPI.uploadSingleFile(formData, onProgress),
    onSuccess: () => invalidateContent(qc),
  });
};

export const useUploadFolder = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ formData, onProgress }) => contentAPI.uploadFolder(formData, onProgress),
    onSuccess: () => invalidateContent(qc),
  });
};

export const useShareContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ contentId, shareWith }) => contentAPI.shareContent(contentId, shareWith),
    onSuccess: () => invalidateContent(qc),
  });
};

export const useEncodeContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => contentAPI.encodeContent(id),
    onSuccess: () => invalidateContent(qc),
  });
};

export const useDecodeContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, key }) => contentAPI.decodeContent(id, key),
    onSuccess: () => invalidateContent(qc),
  });
};

export const useMoveToTrash = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: contentAPI.moveToTrash, onSuccess: () => invalidateContent(qc) });
};

export const useRestoreFromTrash = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: contentAPI.restoreFromTrash, onSuccess: () => invalidateContent(qc) });
};

export const usePermanentDelete = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: contentAPI.permanentDelete, onSuccess: () => invalidateContent(qc) });
};

export const useUpdateContent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => contentAPI.updateContent(id, updates),
    onSuccess: () => invalidateContent(qc),
  });
};