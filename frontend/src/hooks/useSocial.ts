"use client";
import { useState, useCallback } from "react";
import { socialApi } from "@/lib/api";
import { SocialStatus } from "@/lib/types";

export function useSocial() {
  const [status, setStatus] = useState<SocialStatus>({ likes: {}, bookmarks: {}, follows: {} });
  const [loading, setLoading] = useState(false);

  const loadStatus = useCallback(async (noteIds: string[], userIds: string[]) => {
    if (!noteIds.length && !userIds.length) return;
    setLoading(true);
    try {
      const s = await socialApi.getSocialStatus(noteIds, userIds);
      setStatus(s);
    } catch {}
    finally { setLoading(false); }
  }, []);

  const toggleLike = async (noteId: string) => {
    const liked = status.likes[noteId];
    setStatus(p => ({ ...p, likes: { ...p.likes, [noteId]: !liked } }));
    try {
      if (liked) await socialApi.unlike(noteId);
      else await socialApi.like(noteId);
    } catch { setStatus(p => ({ ...p, likes: { ...p.likes, [noteId]: liked } })); }
  };

  const toggleBookmark = async (noteId: string) => {
    const saved = status.bookmarks[noteId];
    setStatus(p => ({ ...p, bookmarks: { ...p.bookmarks, [noteId]: !saved } }));
    try {
      if (saved) await socialApi.unbookmark(noteId);
      else await socialApi.bookmark(noteId);
    } catch { setStatus(p => ({ ...p, bookmarks: { ...p.bookmarks, [noteId]: saved } })); }
  };

  const toggleFollow = async (userId: string) => {
    const following = status.follows[userId];
    setStatus(p => ({ ...p, follows: { ...p.follows, [userId]: !following } }));
    try {
      if (following) await socialApi.unfollow(userId);
      else await socialApi.follow(userId);
    } catch { setStatus(p => ({ ...p, follows: { ...p.follows, [userId]: following } })); }
  };

  return { status, loading, loadStatus, toggleLike, toggleBookmark, toggleFollow };
}
