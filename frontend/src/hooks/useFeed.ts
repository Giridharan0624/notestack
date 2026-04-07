"use client";

import { useState, useEffect, useCallback } from "react";
import { feedApi } from "@/lib/api";
import { Note } from "@/lib/types";

export function useFeed() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchInitial = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await feedApi.list();
      setNotes(data.notes);
      setNextCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const loadMore = async () => {
    if (!nextCursor || !hasMore) return;
    try {
      const data = await feedApi.list(nextCursor);
      setNotes((prev) => [...prev, ...data.notes]);
      setNextCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    }
  };

  return { notes, isLoading, error, hasMore, loadMore, refresh: fetchInitial };
}
