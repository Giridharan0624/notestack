"use client";
import { ReactNode, useEffect } from "react";

export default function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-[var(--r)] shadow-[var(--shadow-lg)] pop flex flex-col" style={{ maxHeight: "min(85vh, 640px)" }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border)] shrink-0">
          <h2 className="text-[16px] font-bold">{title}</h2>
          <button onClick={onClose} className="h-8 w-8 flex items-center justify-center rounded-[8px] hover:bg-[var(--hover)] cursor-pointer transition-colors" style={{ color: "var(--fg3)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto overscroll-contain">{children}</div>
      </div>
    </div>
  );
}
