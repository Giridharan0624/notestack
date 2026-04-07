import { getIdToken } from "./auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
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

// Notes API
export const notesApi = {
  list: () => request<import("./types").Note[]>("/notes"),

  get: (id: string) => request<import("./types").Note>(`/notes/${id}`),

  create: (title: string, content: string = "") =>
    request<import("./types").Note>("/notes", {
      method: "POST",
      body: JSON.stringify({ title, content }),
    }),

  update: (id: string, data: { title?: string; content?: string }) =>
    request<import("./types").Note>(`/notes/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    request<{ message: string }>(`/notes/${id}`, { method: "DELETE" }),
};

// Upload API
export const uploadApi = {
  getUploadUrl: (noteId: string, fileName: string, contentType: string) =>
    request<import("./types").UploadUrlResponse>("/upload-url", {
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
  list: (noteId: string) =>
    request<import("./types").Attachment[]>(`/notes/${noteId}/attachments`),

  create: (
    noteId: string,
    data: {
      fileName: string;
      fileKey: string;
      fileSize: number;
      contentType: string;
    }
  ) =>
    request<import("./types").Attachment>(`/notes/${noteId}/attachments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  delete: (noteId: string, attachmentId: string) =>
    request<{ message: string }>(
      `/notes/${noteId}/attachments/${attachmentId}`,
      { method: "DELETE" }
    ),
};
