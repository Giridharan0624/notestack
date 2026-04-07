import { getIdToken } from "./auth";
import type { Note, Attachment, UploadUrlResponse, UserProfile, PaginatedNotes } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getIdToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function publicRequest<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Notes API (authenticated)
export const notesApi = {
  list: () => request<Note[]>("/notes"),
  get: (id: string) => request<Note>(`/notes/${id}`),
  create: (data: {
    title: string;
    content?: string;
    description?: string;
    tags?: string[];
    visibility?: string;
  }) =>
    request<Note>("/notes", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: {
    title?: string;
    content?: string;
    description?: string;
    tags?: string[];
    visibility?: string;
  }) =>
    request<Note>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    request<{ message: string }>(`/notes/${id}`, { method: "DELETE" }),
};

// Feed API (public)
export const feedApi = {
  list: (cursor?: string, limit = 20) =>
    publicRequest<PaginatedNotes>(
      `/feed?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`
    ),
  getNote: (noteId: string) => publicRequest<Note>(`/feed/notes/${noteId}`),
  userNotes: (userId: string, cursor?: string, limit = 20) =>
    publicRequest<PaginatedNotes>(
      `/users/${userId}/notes?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`
    ),
};

// Profile API
export const profileApi = {
  get: (userId: string) => publicRequest<UserProfile>(`/users/${userId}`),
  getOwn: () => request<UserProfile>("/me/profile"),
  update: (data: { displayName?: string; university?: string; bio?: string }) =>
    request<UserProfile>("/me/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// Upload API
export const uploadApi = {
  getUploadUrl: (noteId: string, fileName: string, contentType: string) =>
    request<UploadUrlResponse>("/upload-url", {
      method: "POST",
      body: JSON.stringify({ noteId, fileName, contentType }),
    }),
  uploadFile: async (uploadUrl: string, file: File) => {
    const res = await fetch(uploadUrl, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!res.ok) throw new Error("File upload failed");
  },
};

// Attachments API
export const attachmentsApi = {
  list: (noteId: string) => request<Attachment[]>(`/notes/${noteId}/attachments`),
  create: (
    noteId: string,
    data: { fileName: string; fileKey: string; fileSize: number; contentType: string }
  ) =>
    request<Attachment>(`/notes/${noteId}/attachments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  delete: (noteId: string, attachmentId: string) =>
    request<{ message: string }>(`/notes/${noteId}/attachments/${attachmentId}`, {
      method: "DELETE",
    }),
};
