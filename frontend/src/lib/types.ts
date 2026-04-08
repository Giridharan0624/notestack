export interface Note {
  noteId: string;
  userId: string;
  title: string;
  content: string;
  description: string;
  tags: string[];
  visibility: "public" | "private";
  authorDisplayName: string;
  pinned: boolean;
  likeCount: number;
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
  username: string;
  displayName: string;
  university: string;
  bio: string;
  avatarUrl: string;
  yearOfStudy: string;
  major: string;
  socialLinks: { linkedin?: string; github?: string; instagram?: string };
  followerCount: number;
  followingCount: number;
  joinDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserStats {
  totalNotes: number;
  publicNotes: number;
  totalLikes: number;
  popularTags: string[];
}

export interface PaginatedNotes {
  notes: Note[];
  nextCursor: string | null;
}

export interface SocialStatus {
  likes: Record<string, boolean>;
  bookmarks: Record<string, boolean>;
  follows: Record<string, boolean>;
}

export interface BookmarkItem {
  noteId: string;
  noteTitle: string;
  noteAuthorName: string;
  createdAt: string;
}

export interface ShareNotification {
  shareId: string;
  sk?: string;
  senderId: string;
  senderName: string;
  noteId: string;
  noteTitle: string;
  read: boolean;
  createdAt: string;
}

export interface UserSearchResult {
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
}

export interface Group {
  groupId: string;
  name: string;
  creatorId: string;
  memberCount: number;
  createdAt: string;
}

export interface GroupMember {
  userId: string;
  displayName: string;
  role: "admin" | "member";
  joinedAt: string;
}

export interface GroupNote {
  noteId: string;
  noteTitle: string;
  noteOwnerId: string;
  sharedBy: string;
  sharedByName: string;
  sharedAt: string;
}

export interface GroupDetail {
  group: Group;
  members: GroupMember[];
  notes: GroupNote[];
}

export interface GroupInvite {
  groupId: string;
  groupName: string;
  invitedBy: string;
  invitedByName: string;
  createdAt: string;
}

export interface ApiError {
  error: string;
}
