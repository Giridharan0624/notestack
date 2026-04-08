"use client";
import { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import { profileApi, sharingApi, groupsApi } from "@/lib/api";
import { UserSearchResult, Group } from "@/lib/types";

const GS = ["var(--g1)","var(--g2)","var(--g3)","var(--g4)","var(--g5)","var(--g6)","var(--g7)","var(--g8)"];
function pick(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h+s.charCodeAt(i))|0; return GS[Math.abs(h)%GS.length]; }

interface Props { isOpen: boolean; onClose: () => void; noteId: string; }

export default function ShareModal({ isOpen, onClose, noteId }: Props) {
  const [tab, setTab] = useState<"user" | "group">("user");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) { setQuery(""); setResults([]); setSent(false); setError(""); setTab("user"); return; }
    groupsApi.listMine().then(r => setGroups(r.groups)).catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const t = setTimeout(() => { profileApi.searchUsers(query).then(r => setResults(r.users)).catch(() => {}); }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const shareToUser = async (userId: string) => {
    setSending(true); setError("");
    try { await sharingApi.shareNote(noteId, userId); setSent(true); setTimeout(() => { onClose(); setSent(false); }, 1500); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setSending(false); }
  };

  const shareToGroup = async (groupId: string) => {
    setSending(true); setError("");
    try { await groupsApi.shareNote(groupId, noteId); setSent(true); setTimeout(() => { onClose(); setSent(false); }, 1500); }
    catch (e) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setSending(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share note">
      {sent ? (
        <div className="text-center py-8">
          <div className="h-14 w-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ background: "var(--green-bg)" }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--green)" }}><path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <p className="text-[16px] font-bold">Shared successfully!</p>
          <p className="text-[13px] mt-1" style={{ color: "var(--fg3)" }}>They&apos;ll get a notification</p>
        </div>
      ) : (
        <div>
          {/* Tab switch */}
          <div className="flex rounded-xl overflow-hidden border mb-5" style={{ borderColor: "var(--border)" }}>
            {(["user", "group"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 h-10 text-[13px] font-semibold cursor-pointer transition-all"
                style={{ background: tab === t ? "var(--hover)" : "white", color: tab === t ? "var(--fg)" : "var(--fg4)" }}>
                {t === "user" ? "To a Student" : "To a Group"}
              </button>
            ))}
          </div>

          {error && <div className="text-[13px] px-3.5 py-2.5 rounded-xl mb-4 font-medium" style={{ background: "var(--red-bg)", color: "var(--red)" }}>{error}</div>}

          {tab === "user" ? (
            <div>
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
              <div className="min-h-[100px] max-h-52 overflow-y-auto">
                {query.length < 2 ? (
                  <div className="flex flex-col items-center py-6">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: "var(--fg4)" }} className="mb-2">
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <p className="text-[13px]" style={{ color: "var(--fg4)" }}>Type to search for a student</p>
                  </div>
                ) : results.length === 0 ? (
                  <div className="flex flex-col items-center py-6">
                    <p className="text-[13px] font-medium" style={{ color: "var(--fg3)" }}>No students found</p>
                    <p className="text-[12px] mt-0.5" style={{ color: "var(--fg4)" }}>Try a different search</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {results.map(u => (
                      <div key={u.userId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--hover)] cursor-pointer transition-colors"
                        onClick={() => shareToUser(u.userId)}>
                        <div className="h-9 w-9 rounded-full flex items-center justify-center text-[12px] font-bold text-white shrink-0" style={{ background: pick(u.userId) }}>
                          {(u.displayName || "S")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-medium truncate">{u.displayName}</p>
                          {u.username && <p className="text-[12px]" style={{ color: "var(--fg4)" }}>@{u.username}</p>}
                        </div>
                        {sending ? (
                          <span className="text-[12px] shrink-0" style={{ color: "var(--fg4)" }}>Sending...</span>
                        ) : (
                          <span className="text-[12px] font-semibold shrink-0" style={{ color: "#4f46e5" }}>Send</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="min-h-[100px] max-h-52 overflow-y-auto">
              {groups.length === 0 ? (
                <div className="flex flex-col items-center py-6">
                  <p className="text-[13px] font-medium" style={{ color: "var(--fg3)" }}>No groups yet</p>
                  <p className="text-[12px] mt-0.5" style={{ color: "var(--fg4)" }}>Create a group first to share notes</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {groups.map(g => (
                    <div key={g.groupId} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--hover)] cursor-pointer transition-colors"
                      onClick={() => shareToGroup(g.groupId)}>
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center text-[12px] font-bold text-white shrink-0" style={{ background: pick(g.groupId) }}>
                        {g.name[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[14px] font-medium truncate">{g.name}</p>
                        <p className="text-[12px]" style={{ color: "var(--fg4)" }}>{g.memberCount} member{g.memberCount !== 1 ? "s" : ""}</p>
                      </div>
                      {sending ? (
                        <span className="text-[12px] shrink-0" style={{ color: "var(--fg4)" }}>Sending...</span>
                      ) : (
                        <span className="text-[12px] font-semibold shrink-0" style={{ color: "#4f46e5" }}>Share</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
