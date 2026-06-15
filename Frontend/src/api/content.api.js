import api from "./axios";

export const uploadSingleFile = async (formData, onUploadProgress) => {
  const { data } = await api.post("api/content/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return data;
};

export const uploadFolder = async (formData, onUploadProgress) => {
  const { data } = await api.post("api/content/upload-folder", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress,
  });
  return data;
};

export const createFolder = async ({
  name,
  parentFolder = null,
  shareWith = [],
}) => {
  const { data } = await api.post("api/content/folder", {
    name,
    parentFolder,
    shareWith,
  });
  return data;
};

export const createMessage = async ({
  name,
  body,
  shareWith = [],
  isDraft = false,
  isCoded = false,
  parentFolder = null,
}) => {
  const { data } = await api.post("api/content/message", {
    name,
    body,
    shareWith,
    isDraft,
    isCoded,
    parentFolder,
  });
  return data;
};

export const createLink = async ({
  name,
  body,
  shareWith = [],
  isDraft = false,
  isCoded = false,
  parentFolder = null,
}) => {
  const { data } = await api.post("api/content/link", {
    name,
    body,
    shareWith,
    isDraft,
    isCoded,
    parentFolder,
  });
  return data;
};

export const getSectionContents = async (section, params = {}) => {
  const { data } = await api.get(`api/content/section/${section}`, { params });
  return data;
};

export const getContent = async (id) => {
  const { data } = await api.get(`api/content/${id}`);
  return data;
};

export const getFolderContents = async (folderId, params = {}) => {
  const { data } = await api.get(`api/content/folder/${folderId}/contents`, {
    params,
  });
  return data;
};

export const searchContents = async (query, params = {}) => {
  const { data } = await api.get("api/content/search", {
    params: { q: query, ...params },
  });
  return data;
};

export const updateContent = async (id, updates) => {
  const { data } = await api.patch(`api/content/${id}`, updates);
  return data;
};

// Fixed: was broken as contentAPI object — now a plain named export
export const shareContent = async (id, shareWith) => {
  const { data } = await api.post(`api/content/${id}/share`, { shareWith });
  return data;
};

export const encodeContent = async (id) => {
  const { data } = await api.post(`api/content/${id}/encode`);
  return data;
};

export const decodeContent = async (id, key) => {
  const { data } = await api.post(`api/content/${id}/decode`, { key });
  return data;
};

export const moveToTrash = async (id) => {
  const { data } = await api.delete(`api/content/${id}`);
  return data;
};

export const restoreFromTrash = async (id) => {
  const { data } = await api.patch(`api/content/${id}/restore`);
  return data;
};

export const permanentDelete = async (id) => {
  const { data } = await api.delete(`api/content/${id}/permanent`);
  return data;
};
