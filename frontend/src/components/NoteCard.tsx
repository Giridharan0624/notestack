"use client";

import { Note } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function NoteCard({ note, index = 0 }: { note: Note; index?: number }) {
  const router = useRouter();
  const date = new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <article
      onClick={() => router.push(`/notes/${note.noteId}`)}
      className={`glass group cursor-pointer animate-fade-up stagger-${Math.min(index + 1, 6)} transition-all`}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2.5">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
            style={{
              background: note.visibility === "public" ? "var(--green-subtle)" : "var(--bg-overlay)",
              color: note.visibility === "public" ? "var(--green)" : "var(--text-tertiary)",
              fontFamily: "var(--font-mono)",
            }}
          >
            {note.visibility}
          </span>
          <span className="text-[10px] ml-auto" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{date}</span>
        </div>
        <h3 className="font-semibold text-sm truncate mb-1" style={{ color: "var(--text-primary)" }}>{note.title}</h3>
        <p className="text-xs leading-relaxed mb-2.5" style={{ color: "var(--text-tertiary)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {note.description || "No description"}
        </p>
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="text-[10px] px-1.5 py-0.5" style={{ color: "var(--text-tertiary)" }}>+{note.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
