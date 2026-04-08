"use client";
import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

export default function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isOpen) return;
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", h); document.body.style.overflow = ""; };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.08)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "440px",
          maxWidth: "calc(100vw - 32px)",
          maxHeight: "calc(100vh - 80px)",
          background: "#ffffff",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 100px rgba(0,0,0,0.18), 0 12px 36px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>{title}</h2>
          <button onClick={onClose}
            style={{ height: "32px", width: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", color: "#9ca3af" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div style={{ padding: "20px 24px 24px", overflowY: "auto", overscrollBehavior: "contain" }}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
