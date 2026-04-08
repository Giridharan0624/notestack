"use client";
import { Note } from "@/lib/types";
import { useRouter } from "next/navigation";

const GS = ["var(--g1)","var(--g2)","var(--g3)","var(--g4)","var(--g5)","var(--g6)","var(--g7)","var(--g8)"];
function pick(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h+s.charCodeAt(i))|0; return GS[Math.abs(h)%GS.length]; }

export default function NoteCard({ note, index = 0 }: { note: Note; index?: number }) {
  const router = useRouter();
  const d = new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div onClick={() => router.push(`/notes/${note.noteId}`)}
      className={`bg-white rounded-2xl overflow-hidden cursor-pointer up d${Math.min(index+1,12)} group`}
      style={{ boxShadow: "var(--shadow-card)", transition: "all 0.2s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div className="h-28 relative" style={{ background: pick(note.noteId) }}>
        <span className="absolute inset-0 flex items-center justify-center text-white/15 text-[36px] font-extrabold select-none">{note.title[0]?.toUpperCase()}</span>
        <div className="absolute top-2.5 right-2.5">
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-md"
            style={{ background: note.visibility === "public" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.25)", color: note.visibility === "public" ? "var(--green)" : "rgba(255,255,255,0.85)" }}>
            {note.visibility === "public" ? "Public" : "Private"}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-[14px] font-semibold truncate mb-1">{note.title}</h3>
        <p className="text-[13px] leading-relaxed mb-3" style={{ color: "var(--fg3)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {note.description || "No description"}
        </p>
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
            {note.tags.length > 3 && <span className="text-[11px] self-center" style={{ color: "var(--fg4)" }}>+{note.tags.length - 3}</span>}
          </div>
        )}
        <div className="flex items-center pt-3 border-t border-[var(--border)]">
          <span className="text-[12px]" style={{ color: "var(--fg4)" }}>{d}</span>
          {note.likeCount > 0 && <span className="text-[12px] ml-auto" style={{ color: "var(--fg4)" }}>❤️ {note.likeCount}</span>}
        </div>
      </div>
    </div>
  );
}
