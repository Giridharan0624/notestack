"use client";
import { useState, useEffect, useRef } from "react";
import { sharingApi } from "@/lib/api";
import { ShareNotification } from "@/lib/types";
import Link from "next/link";

export default function NotificationBell() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<ShareNotification[]>([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sharingApi.getUnreadCount().then(r => setCount(r.count)).catch(() => {});
    const i = setInterval(() => { sharingApi.getUnreadCount().then(r => setCount(r.count)).catch(() => {}); }, 30000);
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
      const r = await sharingApi.getNotifications();
      setNotifs(r.notifications);
      setLoaded(true);
    }
  };

  const markRead = async (n: ShareNotification) => {
    if (!n.read) {
      await sharingApi.markRead(n.shareId).catch(() => {});
      setNotifs(p => p.map(x => x.shareId === n.shareId ? { ...x, read: true } : x));
      setCount(p => Math.max(0, p - 1));
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="relative p-1.5 rounded-[8px] hover:bg-[var(--hover)] cursor-pointer transition-colors" style={{ color: "var(--fg3)" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 8A6 6 0 106 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] flex items-center justify-center text-[9px] font-bold text-white rounded-full px-1" style={{ background: "var(--red)" }}>{count}</span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-[var(--r)] border border-[var(--border)] overflow-hidden pop" style={{ boxShadow: "var(--shadow-lg)", zIndex: 50 }}>
          <div className="px-4 py-2.5 border-b border-[var(--border)]">
            <p className="text-[13px] font-bold">Notifications</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifs.length === 0 ? (
              <p className="text-[13px] py-8 text-center" style={{ color: "var(--fg4)" }}>No notifications</p>
            ) : notifs.map(n => (
              <Link key={n.shareId} href={`/shared/${n.noteId}`} onClick={() => { markRead(n); setOpen(false); }}
                className="block px-4 py-3 hover:bg-[var(--hover)] transition-colors border-b border-[var(--border)] last:border-0"
                style={{ background: n.read ? "transparent" : "rgba(79,110,247,0.03)" }}>
                <p className="text-[13px]"><strong>{n.senderName}</strong> shared <strong>&ldquo;{n.noteTitle}&rdquo;</strong></p>
                <p className="text-[11px] mt-0.5" style={{ color: "var(--fg4)" }}>{new Date(n.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
