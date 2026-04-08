"use client";
import { Suspense, useEffect, useState } from "react"; import { useSearchParams } from "next/navigation";
import Header from "@/components/Header"; import PublicNoteCard from "@/components/PublicNoteCard"; import Spinner from "@/components/ui/Spinner";
import { profileApi, feedApi } from "@/lib/api"; import { UserSearchResult, Note } from "@/lib/types";
import Link from "next/link";

const GS = ["var(--g1)","var(--g2)","var(--g3)","var(--g4)","var(--g5)","var(--g6)","var(--g7)","var(--g8)"];
function pick(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h+s.charCodeAt(i))|0; return GS[Math.abs(h)%GS.length]; }

export default function SearchPage() {
  return <Suspense fallback={<><Header /><Spinner className="mt-20" /></>}><SearchContent /></Suspense>;
}

function SearchContent() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const [users, setUsers] = useState<UserSearchResult[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"all"|"users"|"notes">("all");

  useEffect(() => {
    if (!q || q.length < 2) { setLoading(false); return; }
    setLoading(true);
    Promise.all([
      profileApi.searchUsers(q).then(r => setUsers(r.users)).catch(() => setUsers([])),
      feedApi.list(undefined, 50).then(r => {
        const lower = q.toLowerCase();
        setNotes(r.notes.filter(n =>
          n.title.toLowerCase().includes(lower) ||
          n.tags.some(t => t.includes(lower)) ||
          (n.description || "").toLowerCase().includes(lower) ||
          (n.authorDisplayName || "").toLowerCase().includes(lower)
        ));
      }).catch(() => setNotes([])),
    ]).finally(() => setLoading(false));
  }, [q]);

  const showUsers = tab === "all" || tab === "users";
  const showNotes = tab === "all" || tab === "notes";

  return (
    <><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        <div className="mb-6 up">
          <h1 className="text-[28px] font-extrabold tracking-tight">
            {q ? <>Results for &ldquo;{q}&rdquo;</> : "Search"}
          </h1>
          <p className="text-[14px] mt-0.5" style={{ color: "var(--fg3)" }}>
            {q ? `${users.length} users · ${notes.length} notes` : "Search for students or notes"}
          </p>
        </div>

        {/* Tabs */}
        {q && (
          <div className="flex items-center gap-1 mb-6">
            {(["all", "users", "notes"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="text-[13px] font-semibold px-3 py-1.5 rounded-[var(--r-sm)] cursor-pointer transition-all capitalize"
                style={{ background: tab === t ? "var(--hover)" : "transparent", color: tab === t ? "var(--fg)" : "var(--fg3)" }}>
                {t === "all" ? "All" : t === "users" ? `Students · ${users.length}` : `Notes · ${notes.length}`}
              </button>
            ))}
          </div>
        )}

        {loading ? <Spinner className="mt-16" /> : !q ? (
          <div className="flex flex-col items-center py-20">
            <div className="text-3xl mb-3">🔍</div>
            <p className="text-[14px]" style={{ color: "var(--fg3)" }}>Type something in the search bar above</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Users */}
            {showUsers && users.length > 0 && (
              <div>
                {tab === "all" && <h2 className="text-[15px] font-bold mb-3">Students</h2>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {users.map((u, i) => (
                    <Link key={u.userId} href={`/profile/${u.userId}`}
                      className={`bg-white rounded-[var(--r)] p-4 border border-[var(--border)] flex items-center gap-3 hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-sm)] transition-all up d${Math.min(i+1,8)}`}>
                      <div className="h-10 w-10 rounded-full flex items-center justify-center text-[13px] font-extrabold text-white shrink-0" style={{ background: pick(u.userId) }}>
                        {(u.displayName || "S")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold truncate">{u.displayName || "Student"}</p>
                        {u.username && <p className="text-[12px]" style={{ color: "var(--fg4)" }}>@{u.username}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {showNotes && notes.length > 0 && (
              <div>
                {tab === "all" && <h2 className="text-[15px] font-bold mb-3">Notes</h2>}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {notes.map((n, i) => <PublicNoteCard key={n.noteId} note={n} index={i} />)}
                </div>
              </div>
            )}

            {/* No results */}
            {users.length === 0 && notes.length === 0 && (
              <div className="flex flex-col items-center py-20">
                <div className="text-3xl mb-3">🔍</div>
                <p className="text-[16px] font-bold mb-1">No results</p>
                <p className="text-[14px]" style={{ color: "var(--fg3)" }}>Try different keywords</p>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
