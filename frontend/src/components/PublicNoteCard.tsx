"use client";
import { Note } from "@/lib/types";
import Link from "next/link";

const GS = ["var(--g1)","var(--g2)","var(--g3)","var(--g4)","var(--g5)","var(--g6)","var(--g7)","var(--g8)"];
function pick(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h+s.charCodeAt(i))|0; return GS[Math.abs(h)%GS.length]; }

interface Props {
  note: Note; index?: number; liked?: boolean; bookmarked?: boolean;
  onLike?: () => void; onBookmark?: () => void; onShare?: () => void;
}

export default function PublicNoteCard({ note, index = 0, liked, bookmarked, onLike, onBookmark, onShare }: Props) {
  const d = new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className={`bg-white rounded-2xl overflow-hidden up d${Math.min(index+1,12)} group`}
      style={{ boxShadow: "var(--shadow-card)", transition: "all 0.2s ease" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <Link href={`/feed/notes/${note.noteId}`}>
        <div className="h-32 relative" style={{ background: pick(note.noteId) }}>
          <span className="absolute inset-0 flex items-center justify-center text-white/15 text-[40px] font-extrabold select-none">{note.title[0]?.toUpperCase()}</span>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-center gap-1.5 mb-2">
          {note.tags[0] && <span className="tag">{note.tags[0]}</span>}
          <span className="text-[11px] ml-auto" style={{ color: "var(--fg4)" }}>{d}</span>
        </div>
        <Link href={`/feed/notes/${note.noteId}`}>
          <h3 className="text-[14px] font-semibold truncate mb-1 hover:text-[var(--blue)] transition-colors">{note.title}</h3>
        </Link>
        {note.description && (
          <p className="text-[13px] leading-relaxed mb-3" style={{ color: "var(--fg3)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{note.description}</p>
        )}
        <div className="flex items-center gap-2 pt-3 border-t border-[var(--border)]">
          <Link href={`/profile/${note.userId}`} className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0" style={{ background: pick(note.userId) }}>{(note.authorDisplayName||"S")[0].toUpperCase()}</div>
            <span className="text-[12px] truncate" style={{ color: "var(--fg3)" }}>{note.authorDisplayName || "Student"}</span>
          </Link>
          <div className="flex items-center gap-1 ml-auto shrink-0">
            {onLike && (
              <button onClick={(e) => { e.preventDefault(); onLike(); }}
                className="flex items-center gap-0.5 text-[12px] h-7 px-2 rounded-lg transition-all cursor-pointer"
                style={{ color: liked ? "#ef4444" : "var(--fg4)", background: liked ? "var(--red-bg)" : "transparent" }}>
                {liked ? "❤️" : "🤍"}{note.likeCount ? ` ${note.likeCount}` : ""}
              </button>
            )}
            {onBookmark && (
              <button onClick={(e) => { e.preventDefault(); onBookmark(); }}
                className="text-[12px] h-7 px-2 rounded-lg transition-all cursor-pointer"
                style={{ color: bookmarked ? "var(--blue)" : "var(--fg4)", background: bookmarked ? "var(--blue-light)" : "transparent" }}>
                {bookmarked ? "🔖" : "📑"}
              </button>
            )}
            {onShare && (
              <button onClick={(e) => { e.preventDefault(); onShare(); }}
                className="text-[12px] h-7 px-2 rounded-lg transition-all cursor-pointer hover:bg-[var(--hover)]" style={{ color: "var(--fg4)" }}>📤</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
