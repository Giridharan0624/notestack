"use client";
import { useState, useEffect, useRef } from "react";
import { sharingApi, groupsApi } from "@/lib/api";
import { ShareNotification, GroupInvite } from "@/lib/types";
import Link from "next/link";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<ShareNotification[]>([]);
  const [invites, setInvites] = useState<GroupInvite[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const loadCount = () => {
    Promise.all([
      sharingApi.getUnreadCount().then(r => r.count).catch(() => 0),
      groupsApi.getMyInvites().then(r => r.invites.length).catch(() => 0),
    ]).then(([shares, invs]) => setCount(shares + invs));
  };

  useEffect(() => {
    loadCount();
    const i = setInterval(loadCount, 30000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = async () => {
    setOpen(!open);
    if (!open && !loaded) {
      const [n, inv] = await Promise.all([
        sharingApi.getNotifications().then(r => r.notifications).catch(() => []),
        groupsApi.getMyInvites().then(r => r.invites).catch(() => []),
      ]);
      setNotifs(n); setInvites(inv); setLoaded(true);
    }
  };

  const markRead = async (n: ShareNotification) => {
    if (!n.read) {
      await sharingApi.markRead(n.shareId).catch(() => {});
      setNotifs(p => p.map(x => x.shareId === n.shareId ? { ...x, read: true } : x));
      setCount(p => Math.max(0, p - 1));
    }
  };

  const handleAccept = async (groupId: string) => {
    await groupsApi.acceptInvite(groupId);
    setInvites(p => p.filter(i => i.groupId !== groupId));
    setCount(p => Math.max(0, p - 1));
  };

  const handleDecline = async (groupId: string) => {
    await groupsApi.declineInvite(groupId);
    setInvites(p => p.filter(i => i.groupId !== groupId));
    setCount(p => Math.max(0, p - 1));
  };

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button onClick={toggle} style={{ position: "relative", padding: "6px", borderRadius: "8px", border: "none", background: "transparent", cursor: "pointer", color: "#6b7280", transition: "background 0.15s" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {count > 0 && (
          <span style={{ position: "absolute", top: "-2px", right: "-2px", height: "18px", minWidth: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700, color: "white", background: "#ef4444", borderRadius: "9999px", padding: "0 4px" }}>{count}</span>
        )}
      </button>

      {open && (
        <div style={{ position: "absolute", right: 0, top: "100%", marginTop: "8px", width: "360px", background: "white", borderRadius: "16px", border: "1px solid #e5e7eb", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 8px 24px rgba(0,0,0,0.08)", zIndex: 50 }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #e5e7eb" }}>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#111827", margin: 0 }}>Notifications</p>
          </div>
          <div style={{ maxHeight: "380px", overflowY: "auto" }}>
            {/* Group invites */}
            {invites.map(inv => (
              <div key={inv.groupId} style={{ padding: "14px 16px", borderBottom: "1px solid #f3f4f6", background: "#fefce8" }}>
                <p style={{ fontSize: "13px", color: "#111827", margin: "0 0 4px 0" }}>
                  <strong>{inv.invitedByName}</strong> invited you to join <strong>{inv.groupName}</strong>
                </p>
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 10px 0" }}>
                  {new Date(inv.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => handleAccept(inv.groupId)}
                    style={{ flex: 1, height: "32px", fontSize: "13px", fontWeight: 600, border: "none", borderRadius: "8px", cursor: "pointer", background: "#4f46e5", color: "white" }}>
                    Accept
                  </button>
                  <button onClick={() => handleDecline(inv.groupId)}
                    style={{ flex: 1, height: "32px", fontSize: "13px", fontWeight: 600, border: "1px solid #e5e7eb", borderRadius: "8px", cursor: "pointer", background: "white", color: "#374151" }}>
                    Decline
                  </button>
                </div>
              </div>
            ))}

            {/* Share notifications */}
            {notifs.map(n => (
              <Link key={n.shareId} href={`/shared/${n.noteId}`} onClick={() => { markRead(n); setOpen(false); }}
                style={{ display: "block", padding: "14px 16px", borderBottom: "1px solid #f3f4f6", background: n.read ? "transparent" : "#eff6ff", textDecoration: "none", color: "inherit", transition: "background 0.15s" }}>
                <p style={{ fontSize: "13px", color: "#111827", margin: "0 0 2px 0" }}>
                  <strong>{n.senderName}</strong> shared <strong>&ldquo;{n.noteTitle}&rdquo;</strong>
                </p>
                <p style={{ fontSize: "11px", color: "#9ca3af", margin: 0 }}>
                  {new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </Link>
            ))}

            {invites.length === 0 && notifs.length === 0 && (
              <div style={{ padding: "40px 16px", textAlign: "center" }}>
                <p style={{ fontSize: "13px", color: "#9ca3af" }}>No notifications</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
