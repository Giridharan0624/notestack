"use client";
import { Note } from "@/lib/types";
import { useRouter } from "next/navigation";

const GRADIENTS = ["var(--g1)", "var(--g2)", "var(--g3)", "var(--g4)", "var(--g5)", "var(--g6)", "var(--g7)", "var(--g8)"];

function pickGradient(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = ((h << 5) - h + id.charCodeAt(i)) | 0;
  return GRADIENTS[Math.abs(h) % GRADIENTS.length];
}

export default function NoteCard({ note, index = 0 }: { note: Note; index?: number }) {
  const router = useRouter();
  const d = new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const gradient = pickGradient(note.noteId);

  return (
    <div onClick={() => router.push(`/notes/${note.noteId}`)}
      className={`bg-white rounded-[var(--r)] overflow-hidden cursor-pointer up d${Math.min(index + 1, 12)} group`}
      style={{ boxShadow: "var(--shadow-card)", transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {/* Gradient header — the Dribbble look */}
      <div className="h-32 relative overflow-hidden" style={{ background: gradient }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="opacity-20">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="white" strokeWidth="1.5"/>
            <path d="M14 2v6h6" stroke="white" strokeWidth="1.5"/>
          </svg>
        </div>
        {/* Visibility badge */}
        <div className="absolute top-3 right-3">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full backdrop-blur-sm"
            style={{ background: note.visibility === "public" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.3)", color: note.visibility === "public" ? "var(--green)" : "rgba(255,255,255,0.8)" }}>
            {note.visibility === "public" ? "Public" : "Private"}
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-[15px] font-bold truncate mb-1">{note.title}</h3>
        <p className="text-[13px] leading-relaxed mb-3" style={{ color: "var(--fg3)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {note.description || "No description"}
        </p>
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.tags.slice(0, 3).map((t) => (
              <span key={t} className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "rgba(79,110,247,0.08)", color: "var(--blue)" }}>{t}</span>
            ))}
            {note.tags.length > 3 && <span className="text-[11px] self-center" style={{ color: "var(--fg4)" }}>+{note.tags.length - 3}</span>}
          </div>
        )}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
          <span className="text-[12px] font-medium" style={{ color: "var(--fg4)" }}>{d}</span>
        </div>
      </div>
    </div>
  );
}
