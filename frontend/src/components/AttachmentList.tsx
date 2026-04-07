"use client";

import { Attachment } from "@/lib/types";
import Button from "./ui/Button";

function formatSize(b: number) { if (b < 1024) return `${b}B`; if (b < 1048576) return `${(b / 1024).toFixed(1)}KB`; return `${(b / 1048576).toFixed(1)}MB`; }

export default function AttachmentList({ attachments, onDelete }: { attachments: Attachment[]; onDelete: (id: string) => void }) {
  if (attachments.length === 0) return null;

  return (
    <div className="space-y-2 animate-fade-in">
      <h4 className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
        Attachments · {attachments.length}
      </h4>
      <div className="space-y-1">
        {attachments.map((att) => (
          <div key={att.attachmentId} className="group flex items-center justify-between px-3 py-2 rounded-[var(--radius-md)] transition-colors"
            style={{ border: "1px solid var(--border)", background: "var(--bg-surface)" }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-overlay)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-surface)"; }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "var(--text-tertiary)", flexShrink: 0 }}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-xs truncate" style={{ color: "var(--text-primary)" }}>{att.fileName}</span>
              <span className="text-[10px] shrink-0" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{formatSize(att.fileSize)}</span>
            </div>
            <button onClick={() => onDelete(att.attachmentId)}
              className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer p-1 rounded hover:bg-[var(--red-subtle)]"
              style={{ color: "var(--red)" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
