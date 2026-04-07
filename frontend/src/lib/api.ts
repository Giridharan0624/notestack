import { getIdToken } from "./auth";
import type { Note, Attachment, UploadUrlResponse, UserProfile, UserStats, PaginatedNotes, SocialStatus, BookmarkItem, ShareNotification, UserSearchResult, Group, GroupDetail } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await getIdToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
  });
  if (!res.ok) { const b = await res.json().catch(() => ({ error: "Request failed" })); throw new Error(b.error || `HTTP ${res.status}`); }
  return res.json();
}

async function publicRequest<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { headers: { "Content-Type": "application/json" } });
  if (!res.ok) { const b = await res.json().catch(() => ({ error: "Request failed" })); throw new Error(b.error || `HTTP ${res.status}`); }
  return res.json();
}

// Notes
export const notesApi = {
  list: () => request<Note[]>("/notes"),
  get: (id: string) => request<Note>(`/notes/${id}`),
  create: (d: { title: string; content?: string; description?: string; tags?: string[]; visibility?: string }) =>
    request<Note>("/notes", { method: "POST", body: JSON.stringify(d) }),
  update: (id: string, d: { title?: string; content?: string; description?: string; tags?: string[]; visibility?: string; pinned?: boolean }) =>
    request<Note>(`/notes/${id}`, { method: "PUT", body: JSON.stringify(d) }),
  delete: (id: string) => request<{ message: string }>(`/notes/${id}`, { method: "DELETE" }),
};

// Feed
export const feedApi = {
  list: (cursor?: string, limit = 20) => publicRequest<PaginatedNotes>(`/feed?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`),
  getNote: (id: string) => publicRequest<Note>(`/feed/notes/${id}`),
  userNotes: (uid: string, cursor?: string, limit = 20) => publicRequest<PaginatedNotes>(`/users/${uid}/notes?limit=${limit}${cursor ? `&cursor=${cursor}` : ""}`),
};

// Profile
export const profileApi = {
  get: (uid: string) => publicRequest<UserProfile>(`/users/${uid}`),
  getStats: (uid: string) => publicRequest<UserStats>(`/users/${uid}/stats`),
  getOwn: () => request<UserProfile>("/me/profile"),
  update: (d: { displayName?: string; university?: string; bio?: string; yearOfStudy?: string; major?: string; socialLinks?: Record<string, string> }) =>
    request<UserProfile>("/me/profile", { method: "PUT", body: JSON.stringify(d) }),
  getAvatarUploadUrl: (fileName: string, contentType: string) =>
    request<{ uploadUrl: string; avatarKey: string }>("/me/avatar-upload-url", { method: "POST", body: JSON.stringify({ fileName, contentType }) }),
  setAvatar: (avatarUrl: string) => request<{ avatarUrl: string }>("/me/avatar", { method: "PUT", body: JSON.stringify({ avatarUrl }) }),
  searchUsers: (q: string) => request<{ users: UserSearchResult[] }>(`/users/search?q=${encodeURIComponent(q)}`),
};

// Sharing
export const sharingApi = {
  shareNote: (noteId: string, recipientId: string) =>
    request<{ message: string }>(`/notes/${noteId}/share`, { method: "POST", body: JSON.stringify({ recipientId }) }),
  getNotifications: () => request<{ notifications: ShareNotification[] }>("/me/notifications"),
  markRead: (shareId: string) => request<{ message: string }>(`/me/notifications/${shareId}/read`, { method: "PUT" }),
  getUnreadCount: () => request<{ count: number }>("/me/notifications/unread-count"),
};

// Groups
export const groupsApi = {
  create: (name: string) => request<Group>("/groups", { method: "POST", body: JSON.stringify({ name }) }),
  listMine: () => request<{ groups: Group[] }>("/me/groups"),
  getDetail: (groupId: string) => request<GroupDetail>(`/groups/${groupId}`),
  addMember: (groupId: string, userId: string) =>
    request<{ message: string }>(`/groups/${groupId}/members`, { method: "POST", body: JSON.stringify({ userId }) }),
  removeMember: (groupId: string, userId: string) =>
    request<{ message: string }>(`/groups/${groupId}/members/${userId}`, { method: "DELETE" }),
  shareNote: (groupId: string, noteId: string) =>
    request<{ message: string }>(`/groups/${groupId}/notes`, { method: "POST", body: JSON.stringify({ noteId }) }),
  deleteGroup: (groupId: string) => request<{ message: string }>(`/groups/${groupId}`, { method: "DELETE" }),
};

// Social
export const socialApi = {
  follow: (uid: string) => request<{ message: string }>(`/users/${uid}/follow`, { method: "POST" }),
  unfollow: (uid: string) => request<{ message: string }>(`/users/${uid}/follow`, { method: "DELETE" }),
  getFollowers: (uid: string) => publicRequest<{ users: { userId: string; createdAt: string }[] }>(`/users/${uid}/followers`),
  getFollowing: (uid: string) => publicRequest<{ users: { userId: string; createdAt: string }[] }>(`/users/${uid}/following`),
  like: (noteId: string) => request<{ message: string }>(`/notes/${noteId}/like`, { method: "POST" }),
  unlike: (noteId: string) => request<{ message: string }>(`/notes/${noteId}/like`, { method: "DELETE" }),
  bookmark: (noteId: string) => request<{ message: string }>(`/notes/${noteId}/bookmark`, { method: "POST" }),
  unbookmark: (noteId: string) => request<{ message: string }>(`/notes/${noteId}/bookmark`, { method: "DELETE" }),
  getBookmarks: () => request<{ bookmarks: BookmarkItem[] }>("/me/bookmarks"),
  getSocialStatus: (noteIds: string[], userIds: string[]) =>
    request<SocialStatus>(`/me/social-status?noteIds=${noteIds.join(",")}&userIds=${userIds.join(",")}`),
};

// Upload
export const uploadApi = {
  getUploadUrl: (noteId: string, fileName: string, contentType: string) =>
    request<UploadUrlResponse>("/upload-url", { method: "POST", body: JSON.stringify({ noteId, fileName, contentType }) }),
  uploadFile: async (url: string, file: File) => { const r = await fetch(url, { method: "PUT", body: file, headers: { "Content-Type": file.type } }); if (!r.ok) throw new Error("Upload failed"); },
};

// Attachments
export const attachmentsApi = {
  list: (noteId: string) => request<Attachment[]>(`/notes/${noteId}/attachments`),
  create: (noteId: string, d: { fileName: string; fileKey: string; fileSize: number; contentType: string }) =>
    request<Attachment>(`/notes/${noteId}/attachments`, { method: "POST", body: JSON.stringify(d) }),
  delete: (noteId: string, aid: string) => request<{ message: string }>(`/notes/${noteId}/attachments/${aid}`, { method: "DELETE" }),
  getDownloadUrl: (noteId: string, aid: string) => request<{ downloadUrl: string; fileName: string }>(`/notes/${noteId}/attachments/${aid}/download`),
};

// Username lookup
export const usernameApi = {
  getProfile: (username: string) => publicRequest<UserProfile>(`/u/${username}`),
};
