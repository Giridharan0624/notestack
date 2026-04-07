"use client";

import { Note } from "@/lib/types";
import NoteCard from "./NoteCard";

export default function NoteList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No notes yet</p>
        <p className="text-sm mt-1">Create your first note to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <NoteCard key={note.noteId} note={note} />
      ))}
    </div>
  );
}
