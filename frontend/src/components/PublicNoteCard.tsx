"use client";

import { Note } from "@/lib/types";
import Link from "next/link";

export default function PublicNoteCard({ note, index = 0 }: { note: Note; index?: number }) {
  const date = new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <Link
      href={`/feed/notes/${note.noteId}`}
      className={`block glass group animate-fade-up stagger-${Math.min(index + 1, 6)} transition-all`}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2.5">
          {note.tags.length > 0 && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
              {note.tags[0]}
            </span>
          )}
          <span className="text-[10px] ml-auto" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{date}</span>
        </div>

        <h3 className="font-semibold text-sm truncate mb-1" style={{ color: "var(--text-primary)" }}>{note.title}</h3>
        {note.description && (
          <p className="text-xs leading-relaxed mb-3" style={{ color: "var(--text-tertiary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {note.description}
          </p>
        )}

        {note.tags.length > 1 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {note.tags.slice(1, 4).map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: "var(--bg-overlay)", color: "var(--text-tertiary)" }}>
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-2.5" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold"
            style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
            {(note.authorDisplayName || "S")[0].toUpperCase()}
          </div>
          <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{note.authorDisplayName || "Student"}</span>
        </div>
      </div>
    </Link>
  );
}
