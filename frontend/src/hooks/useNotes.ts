"use client";

import { useState, useEffect, useCallback } from "react";
import { notesApi } from "@/lib/api";
import { Note } from "@/lib/types";

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await notesApi.list();
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = async (data: {
    title: string;
    content?: string;
    description?: string;
    subject?: string;
    visibility?: string;
  }) => {
    const note = await notesApi.create(data);
    setNotes((prev) => [note, ...prev]);
    return note;
  };

  const updateNote = async (
    id: string,
    data: {
      title?: string;
      content?: string;
      description?: string;
      subject?: string;
      visibility?: string;
    }
  ) => {
    const updated = await notesApi.update(id, data);
    setNotes((prev) => prev.map((n) => (n.noteId === id ? updated : n)));
    return updated;
  };

  const deleteNote = async (id: string) => {
    await notesApi.delete(id);
    setNotes((prev) => prev.filter((n) => n.noteId !== id));
  };

  return {
    notes,
    isLoading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refreshNotes: fetchNotes,
  };
}
