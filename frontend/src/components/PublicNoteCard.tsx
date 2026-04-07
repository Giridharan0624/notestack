"use client";
import { Note } from "@/lib/types";
import Link from "next/link";

const GRADIENTS = ["var(--g1)", "var(--g2)", "var(--g3)", "var(--g4)", "var(--g5)", "var(--g6)", "var(--g7)", "var(--g8)"];
function pick(id: string) { let h = 0; for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0; return GRADIENTS[Math.abs(h) % GRADIENTS.length]; }

export default function PublicNoteCard({ note, index = 0 }: { note: Note; index?: number }) {
  const d = new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <Link href={`/feed/notes/${note.noteId}`}
      className={`block bg-white rounded-[var(--r)] overflow-hidden up d${Math.min(index + 1, 12)}`}
      style={{ boxShadow: "var(--shadow-card)", transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div className="h-36 relative" style={{ background: pick(note.noteId) }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/20 text-[40px] font-extrabold">{note.title[0]?.toUpperCase()}</span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-[15px] font-bold truncate mb-1">{note.title}</h3>
        {note.description && (
          <p className="text-[13px] leading-relaxed mb-3" style={{ color: "var(--fg3)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {note.description}
          </p>
        )}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.tags.slice(0, 3).map((t) => <span key={t} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "rgba(79,110,247,0.08)", color: "var(--blue)" }}>{t}</span>)}
          </div>
        )}
        <div className="flex items-center gap-2.5 pt-3 border-t border-[var(--border)]">
          <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ background: pick(note.userId) }}>
            {(note.authorDisplayName || "S")[0].toUpperCase()}
          </div>
          <span className="text-[12px] font-medium" style={{ color: "var(--fg3)" }}>{note.authorDisplayName || "Student"}</span>
          <span className="text-[11px] ml-auto" style={{ color: "var(--fg4)" }}>{d}</span>
        </div>
      </div>
    </Link>
  );
}
