"use client";
import { useEffect, useState } from "react"; import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header"; import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button"; import Input from "@/components/ui/Input"; import Modal from "@/components/ui/Modal"; import Spinner from "@/components/ui/Spinner";
import { groupsApi, profileApi, notesApi } from "@/lib/api"; import { GroupDetail, UserSearchResult, Note } from "@/lib/types";
import Link from "next/link";

const GS = ["var(--g1)","var(--g2)","var(--g3)","var(--g4)","var(--g5)","var(--g6)","var(--g7)","var(--g8)"];
function pick(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h+s.charCodeAt(i))|0; return GS[Math.abs(h)%GS.length]; }

export default function GroupDetailPage() {
  const { groupId } = useParams() as { groupId: string }; const router = useRouter();
  const [detail, setDetail] = useState<GroupDetail|null>(null); const [loading, setLoading] = useState(true); const [err, setErr] = useState("");
  const [showInvite, setShowInvite] = useState(false); const [showShareNote, setShowShareNote] = useState(false);
  const [query, setQuery] = useState(""); const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [myNotes, setMyNotes] = useState<Note[]>([]);

  const reload = () => groupsApi.getDetail(groupId).then(setDetail).catch(e => setErr(e.message));

  useEffect(() => { reload().finally(() => setLoading(false)); }, [groupId]);

  useEffect(() => {
    if (query.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(() => { profileApi.searchUsers(query).then(r => setSearchResults(r.users)).catch(() => {}); }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const isAdmin = detail?.members.some(m => m.role === "admin") || false;

  return (
    <ProtectedRoute><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
        {loading ? <Spinner className="mt-16" /> : err && !detail ? (
          <div className="text-center mt-16">
            <p className="text-[14px] font-medium" style={{ color: "var(--red)" }}>{err}</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => router.push("/groups")}>Back to groups</Button>
          </div>
        ) : detail ? (
          <div className="up">
            {/* Header */}
            <div className="mb-6">
              <Button variant="ghost" size="sm" onClick={() => router.push("/groups")} className="mb-3">← Back to groups</Button>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-[14px] font-bold text-white shrink-0" style={{ background: pick(groupId) }}>
                    {detail.group.name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h1 className="text-[22px] sm:text-[24px] font-bold tracking-tight">{detail.group.name}</h1>
                    <p className="text-[12px]" style={{ color: "var(--fg3)" }}>{detail.group.memberCount} member{detail.group.memberCount !== 1 ? "s" : ""} · Created {new Date(detail.group.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button variant="secondary" size="sm" onClick={async () => { const notes = await notesApi.list(); setMyNotes(notes); setShowShareNote(true); }}>Share a note</Button>
                  {isAdmin && <Button size="sm" onClick={() => setShowInvite(true)}>Invite</Button>}
                  {isAdmin && (
                    <Button variant="danger" size="sm" onClick={async () => { if (!confirm("Delete this group?")) return; await groupsApi.deleteGroup(groupId); router.push("/groups"); }}>Delete</Button>
                  )}
                </div>
              </div>
            </div>

            {err && <div className="mb-4 text-[13px] px-4 py-3 rounded-xl font-medium" style={{ background: "var(--red-bg)", color: "var(--red)" }}>{err}</div>}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Shared Notes */}
              <div className="lg:col-span-2">
                <h3 className="text-[13px] font-semibold mb-3" style={{ color: "var(--fg3)" }}>Shared Notes · {detail.notes.length}</h3>
                {detail.notes.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-[var(--border)] p-10 text-center">
                    <p className="text-[14px]" style={{ color: "var(--fg4)" }}>No notes shared yet</p>
                    <p className="text-[12px] mt-1" style={{ color: "var(--fg4)" }}>Click &ldquo;Share a note&rdquo; to add one</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {detail.notes.map((n, i) => (
                      <Link key={`${n.noteId}-${n.sharedAt}`} href={`/feed/notes/${n.noteId}`}
                        className={`flex items-center gap-3 bg-white rounded-xl border border-[var(--border)] p-3.5 hover:border-[var(--border-hover)] hover:shadow-sm transition-all up d${Math.min(i+1,8)}`}>
                        <div className="h-10 w-10 rounded-lg flex items-center justify-center text-[12px] font-bold text-white shrink-0" style={{ background: pick(n.noteId) }}>
                          {n.noteTitle[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold truncate">{n.noteTitle}</p>
                          <p className="text-[12px]" style={{ color: "var(--fg4)" }}>Shared by {n.sharedByName || "Student"} · {new Date(n.sharedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0" style={{ color: "var(--fg4)" }}><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Members */}
              <div>
                <h3 className="text-[13px] font-semibold mb-3" style={{ color: "var(--fg3)" }}>Members · {detail.members.length}</h3>
                <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
                  {detail.members.map((m, i) => (
                    <div key={m.userId} className={`flex items-center gap-3 px-4 py-3 group ${i > 0 ? "border-t border-[var(--border)]" : ""}`}>
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: pick(m.userId) }}>
                        {(m.displayName||"S")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium truncate">{m.displayName || "Student"}</p>
                        {m.role === "admin" && <span className="text-[10px] font-semibold" style={{ color: "var(--blue)" }}>Admin</span>}
                      </div>
                      {isAdmin && m.role !== "admin" && (
                        <button onClick={() => { groupsApi.removeMember(groupId, m.userId).then(reload); }}
                          className="opacity-0 group-hover:opacity-100 text-[11px] font-semibold cursor-pointer px-2.5 py-1 rounded-lg transition-opacity"
                          style={{ color: "var(--red)", background: "var(--red-bg)" }}>
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Invite modal */}
            <Modal isOpen={showInvite} onClose={() => { setShowInvite(false); setQuery(""); setSearchResults([]); }} title="Invite a member">
              <div>
                <p className="text-[13px] mb-4" style={{ color: "var(--fg3)" }}>Search for a student to add to <strong style={{ color: "var(--fg)" }}>{detail.group.name}</strong></p>
                <div className="relative mb-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--fg4)" }}>
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or @username..."
                    autoFocus
                    className="w-full h-11 pl-10 pr-4 text-[14px] rounded-xl border outline-none transition-all placeholder:text-[var(--fg4)]"
                    style={{ background: "var(--hover)", borderColor: "transparent", color: "var(--fg)" }}
                    onFocus={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#4f46e5"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.background = "var(--hover)"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
                <div className="min-h-[120px] max-h-52 overflow-y-auto">
                  {query.length < 2 ? (
                    <div className="flex flex-col items-center py-8">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ color: "var(--fg4)" }} className="mb-2">
                        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p className="text-[13px]" style={{ color: "var(--fg4)" }}>Type at least 2 characters to search</p>
                    </div>
                  ) : searchResults.length === 0 ? (
                    <div className="flex flex-col items-center py-8">
                      <p className="text-[13px] font-medium" style={{ color: "var(--fg3)" }}>No students found</p>
                      <p className="text-[12px] mt-0.5" style={{ color: "var(--fg4)" }}>Try a different name or username</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {searchResults.map(u => (
                        <div key={u.userId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--hover)] cursor-pointer transition-colors"
                          onClick={async () => { await groupsApi.inviteUser(groupId, u.userId); setShowInvite(false); setQuery(""); setSearchResults([]); }}>
                          <div className="h-9 w-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0" style={{ background: pick(u.userId) }}>
                            {(u.displayName||"S")[0].toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px] font-medium truncate">{u.displayName || "Student"}</p>
                            {u.username && <p className="text-[12px]" style={{ color: "var(--fg4)" }}>@{u.username}</p>}
                          </div>
                          <span className="text-[12px] font-semibold shrink-0" style={{ color: "#4f46e5" }}>Invite</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </Modal>

            {/* Share note modal */}
            <Modal isOpen={showShareNote} onClose={() => setShowShareNote(false)} title="Share a note to this group">
              <div className="max-h-72 overflow-y-auto space-y-1">
                {myNotes.length === 0 ? (
                  <p className="text-[13px] py-6 text-center" style={{ color: "var(--fg4)" }}>No notes to share. Upload a note first.</p>
                ) : myNotes.map(n => (
                  <div key={n.noteId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--hover)] cursor-pointer transition-colors"
                    onClick={async () => { await groupsApi.shareNote(groupId, n.noteId); setShowShareNote(false); reload(); }}>
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center text-[11px] font-bold text-white shrink-0" style={{ background: pick(n.noteId) }}>
                      {n.title[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium truncate">{n.title}</p>
                      <p className="text-[11px]" style={{ color: "var(--fg4)" }}>{n.visibility} · {n.tags.slice(0,2).join(", ") || "no tags"}</p>
                    </div>
                    <span className="text-[12px] font-medium shrink-0" style={{ color: "var(--blue)" }}>Share</span>
                  </div>
                ))}
              </div>
            </Modal>
          </div>
        ) : null}
      </main>
    </ProtectedRoute>
  );
}
