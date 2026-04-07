"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header"; import ProtectedRoute from "@/components/ProtectedRoute";
import Spinner from "@/components/ui/Spinner"; import { socialApi } from "@/lib/api"; import { BookmarkItem } from "@/lib/types";
import Link from "next/link";

const GS = ["var(--g1)","var(--g2)","var(--g3)","var(--g4)","var(--g5)","var(--g6)","var(--g7)","var(--g8)"];
function pick(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h+s.charCodeAt(i))|0; return GS[Math.abs(h)%GS.length]; }

export default function SavedPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { socialApi.getBookmarks().then(r => setBookmarks(r.bookmarks)).finally(() => setLoading(false)); }, []);

  return (
    <ProtectedRoute><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-6 up">
          <h1 className="text-[28px] font-extrabold tracking-tight">Saved</h1>
          <p className="text-[14px]" style={{ color: "var(--fg3)" }}>Notes you bookmarked</p>
        </div>
        {loading ? <Spinner className="mt-16" /> : !bookmarks.length ? (
          <div className="flex flex-col items-center py-24 up">
            <div className="text-3xl mb-3">🔖</div>
            <p className="text-[14px] font-medium" style={{ color: "var(--fg2)" }}>No saved notes yet</p>
            <p className="text-[13px]" style={{ color: "var(--fg4)" }}>Bookmark notes from the explore page</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {bookmarks.map((b, i) => (
              <Link key={b.noteId} href={`/feed/notes/${b.noteId}`}
                className={`bg-white rounded-[var(--r)] overflow-hidden up d${Math.min(i+1,12)}`}
                style={{ boxShadow: "var(--shadow-card)", transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card-hover)"; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-card)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                <div className="h-24 relative" style={{ background: pick(b.noteId) }}>
                  <span className="absolute inset-0 flex items-center justify-center text-white/20 text-[32px] font-extrabold">{b.noteTitle[0]?.toUpperCase()}</span>
                </div>
                <div className="p-4">
                  <h3 className="text-[15px] font-bold truncate mb-0.5">{b.noteTitle}</h3>
                  <p className="text-[12px]" style={{ color: "var(--fg3)" }}>by {b.noteAuthorName || "Student"}</p>
                  <p className="text-[11px] mt-1" style={{ color: "var(--fg4)" }}>Saved {new Date(b.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
