export interface Note {
  noteId: string;
  userId: string;
  title: string;
  content: string;
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

export interface ApiError {
  error: string;
}
