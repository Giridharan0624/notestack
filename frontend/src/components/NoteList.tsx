"use client";

import { Note } from "@/lib/types";
import NoteCard from "./NoteCard";

export default function NoteList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <div
          className="h-16 w-16 rounded-full flex items-center justify-center mb-5"
          style={{ background: "var(--accent-light)" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent)" }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2v6h6M12 18v-6M9 15h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h3
          className="text-xl font-semibold mb-2"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          No notes yet
        </h3>
        <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
          Create your first note to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note, i) => (
        <NoteCard key={note.noteId} note={note} index={i} />
      ))}
    </div>
  );
}
