"use client";
import { Note } from "@/lib/types";
import NoteCard from "./NoteCard";

export default function NoteList({ notes }: { notes: Note[] }) {
  if (!notes.length) return (
    <div className="flex flex-col items-center py-24 up">
      <div className="h-20 w-20 rounded-[20px] flex items-center justify-center mb-5" style={{ background: "var(--g8)" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="white" strokeWidth="1.5"/><path d="M14 2v6h6M12 18v-6M9 15h6" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </div>
      <p className="text-[16px] font-bold mb-1">No notes yet</p>
      <p className="text-[14px]" style={{ color: "var(--fg3)" }}>Upload your first note to get started</p>
    </div>
  );
  return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{notes.map((n, i) => <NoteCard key={n.noteId} note={n} index={i} />)}</div>;
}
