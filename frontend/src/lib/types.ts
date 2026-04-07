export interface Note {
  noteId: string;
  userId: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  visibility: "public" | "private";
  authorDisplayName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  attachmentId: string;
  noteId: string;
  fileName: string;
  fileKey: string;
  fileSize: number;
  contentType: string;
  createdAt: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
}

export interface UserProfile {
  userId: string;
  displayName: string;
  university: string;
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedNotes {
  notes: Note[];
  nextCursor: string | null;
}

export interface ApiError {
  error: string;
}
