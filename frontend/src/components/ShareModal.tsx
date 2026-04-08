"use client";
import { useState, useEffect } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Input from "./ui/Input";
import { profileApi, sharingApi, groupsApi } from "@/lib/api";
import { UserSearchResult, Group } from "@/lib/types";

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
    if (!isOpen) { setQuery(""); setResults([]); setSent(false); setError(""); return; }
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
        <div className="text-center py-6">
          <div className="text-3xl mb-2">✅</div>
          <p className="text-[14px] font-semibold">Shared!</p>
        </div>
      ) : (
        <>
          <div className="flex rounded-[var(--r-sm)] overflow-hidden border mb-4" style={{ borderColor: "var(--border)" }}>
            {(["user", "group"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2 text-[13px] font-semibold cursor-pointer transition-all capitalize"
                style={{ background: tab === t ? "var(--hover)" : "var(--white)", color: tab === t ? "var(--fg)" : "var(--fg4)" }}>
                {t === "user" ? "To a Student" : "To a Group"}
              </button>
            ))}
          </div>

          {error && <p className="text-[12px] mb-3" style={{ color: "var(--red)" }}>{error}</p>}

          {tab === "user" ? (
            <>
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or @username..." autoFocus />
              <div className="mt-3 max-h-48 overflow-y-auto space-y-1">
                {results.map(u => (
                  <div key={u.userId} className="flex items-center gap-3 px-3 py-2 rounded-[var(--r-sm)] hover:bg-[var(--hover)] cursor-pointer transition-colors"
                    onClick={() => shareToUser(u.userId)}>
                    <div className="h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0" style={{ background: "var(--g1)" }}>
                      {(u.displayName || "S")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[13px] font-medium block truncate">{u.displayName}</span>
                      {u.userId && (u as any).username && <span className="text-[11px]" style={{ color: "var(--fg4)" }}>@{(u as any).username}</span>}
                    </div>
                    {sending && <span className="text-[11px] ml-auto shrink-0" style={{ color: "var(--fg4)" }}>Sending...</span>}
                  </div>
                ))}
                {query.length >= 2 && results.length === 0 && (
                  <p className="text-[13px] py-4 text-center" style={{ color: "var(--fg4)" }}>No users found</p>
                )}
              </div>
            </>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1">
              {groups.length === 0 ? (
                <p className="text-[13px] py-4 text-center" style={{ color: "var(--fg4)" }}>No groups yet</p>
              ) : groups.map(g => (
                <div key={g.groupId} className="flex items-center gap-3 px-3 py-2 rounded-[var(--r-sm)] hover:bg-[var(--hover)] cursor-pointer transition-colors"
                  onClick={() => shareToGroup(g.groupId)}>
                  <div className="h-7 w-7 rounded-[6px] flex items-center justify-center text-[10px] font-bold" style={{ background: "var(--pop-light)", color: "var(--blue)" }}>
                    {g.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium truncate">{g.name}</p>
                    <p className="text-[11px]" style={{ color: "var(--fg4)" }}>{g.memberCount} member{g.memberCount !== 1 ? "s" : ""}</p>
                  </div>
                  {sending && <span className="text-[11px] ml-auto" style={{ color: "var(--fg4)" }}>Sending...</span>}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Modal>
  );
}
