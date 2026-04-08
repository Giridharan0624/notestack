"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header"; import ProtectedRoute from "@/components/ProtectedRoute";
import Spinner from "@/components/ui/Spinner";
import { sharingApi } from "@/lib/api"; import { Note } from "@/lib/types";
import Link from "next/link";

const GS = ["var(--g1)","var(--g2)","var(--g3)","var(--g4)","var(--g5)","var(--g6)","var(--g7)","var(--g8)"];
function pick(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h+s.charCodeAt(i))|0; return GS[Math.abs(h)%GS.length]; }

type SharedNote = Note & { sharedBy: string; sharedAt: string };

export default function SharedWithMePage() {
  const [notes, setNotes] = useState<SharedNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { sharingApi.getSharedWithMe().then(r => setNotes(r.notes)).finally(() => setLoading(false)); }, []);

  return (
    <ProtectedRoute><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-6 up">
          <h1 className="text-[28px] font-extrabold tracking-tight">Shared with me</h1>
          <p className="text-[14px]" style={{ color: "var(--fg3)" }}>Notes that others have sent to you</p>
        </div>
        {loading ? <Spinner className="mt-16" /> : !notes.length ? (
          <div className="flex flex-col items-center py-24 up">
            <div className="text-3xl mb-3">📨</div>
            <p className="text-[16px] font-bold mb-1">Nothing shared yet</p>
            <p className="text-[14px]" style={{ color: "var(--fg3)" }}>When someone shares a note with you, it will appear here</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {notes.map((n, i) => (
              <Link key={n.noteId} href={`/shared/${n.noteId}`}
                className={`bg-white rounded-[var(--r)] overflow-hidden up d${Math.min(i+1,12)}`}
                style={{ boxShadow: "var(--shadow-card)", transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div className="h-28 relative" style={{ background: pick(n.noteId) }}>
                  <span className="absolute inset-0 flex items-center justify-center text-white/20 text-[36px] font-extrabold">{n.title[0]?.toUpperCase()}</span>
                  {n.visibility === "private" && (
                    <span className="absolute top-3 right-3 text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.3)", color: "rgba(255,255,255,0.8)" }}>Private</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-[15px] font-bold truncate mb-0.5">{n.title}</h3>
                  {n.description && <p className="text-[13px] leading-relaxed mb-2" style={{ color: "var(--fg3)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{n.description}</p>}
                  {n.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {n.tags.slice(0, 3).map(t => <span key={t} className="tag">{t}</span>)}
                    </div>
                  )}
                  <div className="pt-2 border-t border-[var(--border)]">
                    <p className="text-[12px]" style={{ color: "var(--fg4)" }}>
                      Shared by <strong style={{ color: "var(--fg2)" }}>{n.sharedBy}</strong> · {new Date(n.sharedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
