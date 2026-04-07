"use client";
import { useEffect, useState } from "react"; import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header"; import ProtectedRoute from "@/components/ProtectedRoute";
import Button from "@/components/ui/Button"; import Input from "@/components/ui/Input"; import Modal from "@/components/ui/Modal"; import Spinner from "@/components/ui/Spinner";
import { groupsApi, profileApi, notesApi } from "@/lib/api"; import { GroupDetail, UserSearchResult, Note } from "@/lib/types";
import { useAuth } from "@/context/AuthContext"; import Link from "next/link";

const GS = ["var(--g1)","var(--g2)","var(--g3)","var(--g4)","var(--g5)","var(--g6)","var(--g7)","var(--g8)"];
function pick(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h+s.charCodeAt(i))|0; return GS[Math.abs(h)%GS.length]; }

export default function GroupDetailPage() {
  const { groupId } = useParams() as { groupId: string }; const router = useRouter();
  const [detail, setDetail] = useState<GroupDetail|null>(null); const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false); const [showShareNote, setShowShareNote] = useState(false);
  const [query, setQuery] = useState(""); const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [myNotes, setMyNotes] = useState<Note[]>([]);

  useEffect(() => { groupsApi.getDetail(groupId).then(setDetail).finally(() => setLoading(false)); }, [groupId]);

  useEffect(() => {
    if (query.length < 2) { setSearchResults([]); return; }
    const t = setTimeout(() => { profileApi.searchUsers(query).then(r => setSearchResults(r.users)).catch(() => {}); }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const isAdmin = detail?.members.some(m => m.role === "admin") || false;

  const handleInvite = async (userId: string) => {
    await groupsApi.addMember(groupId, userId);
    setShowInvite(false); setQuery("");
    const d = await groupsApi.getDetail(groupId); setDetail(d);
  };

  const handleRemove = async (userId: string) => {
    await groupsApi.removeMember(groupId, userId);
    const d = await groupsApi.getDetail(groupId); setDetail(d);
  };

  const handleShareNote = async (noteId: string) => {
    await groupsApi.shareNote(groupId, noteId);
    setShowShareNote(false);
    const d = await groupsApi.getDetail(groupId); setDetail(d);
  };

  const openShareNote = async () => {
    const notes = await notesApi.list();
    setMyNotes(notes);
    setShowShareNote(true);
  };

  return (
    <ProtectedRoute><Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10">
        {loading ? <Spinner className="mt-16" /> : !detail ? <p className="text-[14px] mt-16 text-center" style={{ color: "var(--red)" }}>Group not found</p> : (
          <div className="up">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.push("/groups")}>← Back</Button>
                <h1 className="text-[24px] font-extrabold tracking-tight">{detail.group.name}</h1>
                <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "var(--pop-light)", color: "var(--blue)" }}>{detail.group.memberCount} members</span>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={openShareNote}>Share a note</Button>
                {isAdmin && <Button size="sm" onClick={() => setShowInvite(true)}>Invite</Button>}
                {detail.group.creatorId && isAdmin && (
                  <Button variant="danger" size="sm" onClick={async () => { await groupsApi.deleteGroup(groupId); router.push("/groups"); }}>Delete</Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Notes */}
              <div className="lg:col-span-2">
                <h3 className="text-[14px] font-bold mb-3">Shared Notes · {detail.notes.length}</h3>
                {detail.notes.length === 0 ? (
                  <div className="bg-white rounded-[var(--r)] border border-[var(--border)] p-8 text-center">
                    <p className="text-[14px]" style={{ color: "var(--fg4)" }}>No notes shared yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {detail.notes.map(n => (
                      <Link key={`${n.noteId}-${n.sharedAt}`} href={`/feed/notes/${n.noteId}`}
                        className="flex items-center gap-3 bg-white rounded-[var(--r-sm)] border border-[var(--border)] p-3 hover:border-[var(--border-hover)] hover:shadow-[var(--shadow-sm)] transition-all">
                        <div className="h-10 w-10 rounded-[8px] flex items-center justify-center text-[12px] font-extrabold text-white shrink-0" style={{ background: pick(n.noteId) }}>
                          {n.noteTitle[0]?.toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-semibold truncate">{n.noteTitle}</p>
                          <p className="text-[12px]" style={{ color: "var(--fg4)" }}>Shared by {n.sharedByName} · {new Date(n.sharedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Members */}
              <div>
                <h3 className="text-[14px] font-bold mb-3">Members · {detail.members.length}</h3>
                <div className="bg-white rounded-[var(--r)] border border-[var(--border)] divide-y divide-[var(--border)]">
                  {detail.members.map(m => (
                    <div key={m.userId} className="flex items-center gap-3 px-3 py-2.5 group">
                      <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: pick(m.userId) }}>
                        {(m.displayName||"S")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-medium truncate">{m.displayName || "Student"}</p>
                        {m.role === "admin" && <span className="text-[10px] font-bold" style={{ color: "var(--blue)" }}>Admin</span>}
                      </div>
                      {isAdmin && m.role !== "admin" && (
                        <button onClick={() => handleRemove(m.userId)}
                          className="opacity-0 group-hover:opacity-100 text-[11px] font-semibold cursor-pointer px-2 py-0.5 rounded" style={{ color: "var(--red)", background: "#fef2f2" }}>
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Invite modal */}
            <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="Invite member">
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name..." autoFocus />
              <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
                {searchResults.map(u => (
                  <div key={u.userId} className="flex items-center gap-3 px-3 py-2 rounded-[var(--r-sm)] hover:bg-[var(--hover)] cursor-pointer" onClick={() => handleInvite(u.userId)}>
                    <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: "var(--g1)" }}>{(u.displayName||"S")[0].toUpperCase()}</div>
                    <span className="text-[13px] font-medium">{u.displayName}</span>
                  </div>
                ))}
              </div>
            </Modal>

            {/* Share note modal */}
            <Modal isOpen={showShareNote} onClose={() => setShowShareNote(false)} title="Share a note to this group">
              <div className="max-h-64 overflow-y-auto space-y-1">
                {myNotes.length === 0 ? <p className="text-[13px] py-4 text-center" style={{ color: "var(--fg4)" }}>No notes to share</p> : myNotes.map(n => (
                  <div key={n.noteId} className="flex items-center gap-3 px-3 py-2 rounded-[var(--r-sm)] hover:bg-[var(--hover)] cursor-pointer" onClick={() => handleShareNote(n.noteId)}>
                    <div className="h-8 w-8 rounded-[6px] flex items-center justify-center text-[11px] font-extrabold text-white shrink-0" style={{ background: pick(n.noteId) }}>{n.title[0]?.toUpperCase()}</div>
                    <div className="min-w-0"><p className="text-[13px] font-medium truncate">{n.title}</p><p className="text-[11px]" style={{ color: "var(--fg4)" }}>{n.visibility}</p></div>
                  </div>
                ))}
              </div>
            </Modal>
          </div>
        )}
      </main>
    </ProtectedRoute>
  );
}
