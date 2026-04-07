"use client";

import { Note } from "@/lib/types";
import Link from "next/link";

const SUBJECT_COLORS: Record<string, string> = {
  CS: "#6366f1",
  Math: "#ec4899",
  Biology: "#22c55e",
  Physics: "#f59e0b",
  English: "#8b5cf6",
  History: "#ef4444",
  Business: "#06b6d4",
  Engineering: "#f97316",
};

export default function PublicNoteCard({ note, index = 0 }: { note: Note; index?: number }) {
  const formattedDate = new Date(note.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const subjectColor = SUBJECT_COLORS[note.subject] || "var(--text-tertiary)";

  return (
    <Link
      href={`/feed/notes/${note.noteId}`}
      className={`block group animate-fade-in-up stagger-${Math.min(index + 1, 6)}`}
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
        <div className="flex items-center gap-2 mb-2.5">
          {note.subject && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: `${subjectColor}15`,
                color: subjectColor,
              }}
            >
              {note.subject}
            </span>
          )}
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            {formattedDate}
          </span>
        </div>

        <h3
          className="font-semibold text-base leading-snug mb-1.5 truncate"
          style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
        >
          {note.title}
        </h3>

        {note.description && (
          <p
            className="text-sm leading-relaxed mb-3"
            style={{
              color: "var(--text-secondary)",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {note.description}
          </p>
        )}

        <div className="flex items-center gap-2 pt-2" style={{ borderTop: "1px solid var(--border-light)" }}>
          <div
            className="h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold"
            style={{
              background: "var(--accent-light)",
              color: "var(--accent)",
              fontFamily: "var(--font-display)",
            }}
          >
            {(note.authorDisplayName || "S")[0].toUpperCase()}
          </div>
          <Link
            href={`/profile/${note.userId}`}
            className="text-xs font-medium hover:underline"
            style={{ color: "var(--text-secondary)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {note.authorDisplayName || "Student"}
          </Link>
        </div>
      </div>
    </Link>
  );
}
