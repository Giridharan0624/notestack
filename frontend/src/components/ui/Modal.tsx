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
    <>
      {/* Clickable backdrop */}
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 50, background: "transparent" }} />

      {/* Modal card — fixed + transform center */}
      <div style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 51,
        width: "440px",
        maxWidth: "calc(100vw - 32px)",
        maxHeight: "min(80vh, 600px)",
        background: "#ffffff",
        borderRadius: "20px",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 32px 100px rgba(0,0,0,0.15), 0 12px 36px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 24px 16px", borderBottom: "1px solid #e5e7eb", flexShrink: 0 }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111827", margin: 0 }}>{title}</h2>
          <button onClick={onClose}
            style={{ height: "32px", width: "32px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "none", background: "transparent", cursor: "pointer", color: "#9ca3af" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#f3f4f6"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}>
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 24px 24px", overflowY: "auto", overscrollBehavior: "contain" }}>{children}</div>
      </div>
    </>
  );
}
