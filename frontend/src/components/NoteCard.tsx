"use client";

import { Note } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function NoteCard({ note, index = 0 }: { note: Note; index?: number }) {
  const router = useRouter();

  const formattedDate = new Date(note.updatedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <article
      onClick={() => router.push(`/notes/${note.noteId}`)}
      className={`group cursor-pointer animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
      style={{
        background: "var(--bg-card)",
        borderRadius: "var(--radius-lg)",
        border: "1px solid var(--border-light)",
        boxShadow: "var(--shadow-sm)",
        transition: "all var(--transition-base)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-md)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "var(--shadow-sm)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: note.visibility === "public" ? "var(--success-light)" : "var(--bg-secondary)",
              color: note.visibility === "public" ? "var(--success)" : "var(--text-tertiary)",
            }}
          >
            {note.visibility === "public" ? "Public" : "Private"}
          </span>
          {note.subject && (
            <span
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: "var(--accent-light)", color: "var(--accent)" }}
            >
              {note.subject}
            </span>
          )}
          <span className="text-xs ml-auto" style={{ color: "var(--text-tertiary)" }}>
            {formattedDate}
          </span>
        </div>

        <h3
          className="font-semibold text-base leading-snug truncate"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          {note.title}
        </h3>

        <p
          className="text-sm mt-1.5 leading-relaxed"
          style={{
            color: "var(--text-secondary)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {note.description || note.content || "No content yet..."}
        </p>
      </div>
    </article>
  );
}
