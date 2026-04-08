"use client";
import { Attachment } from "@/lib/types";
import { attachmentsApi } from "@/lib/api";

const GRADIENTS = ["var(--g1)", "var(--g2)", "var(--g3)", "var(--g4)", "var(--g5)", "var(--g6)", "var(--g7)", "var(--g8)"];
function pick(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return GRADIENTS[Math.abs(h) % GRADIENTS.length]; }
function fmtSize(b: number) { if (b < 1024) return `${b}B`; if (b < 1048576) return `${(b/1024).toFixed(1)}KB`; return `${(b/1048576).toFixed(1)}MB`; }
function fmtType(t: string) { if (t === "application/pdf") return "PDF"; if (t.startsWith("image/")) return "IMG"; if (t.includes("word")) return "DOC"; return "FILE"; }

export default function AttachmentList({ attachments, onDelete, noteId }: { attachments: Attachment[]; onDelete: (id: string) => void; noteId?: string }) {
  if (!attachments.length) return null;

  const handleDownload = async (a: Attachment) => {
    if (!noteId) return;
    try {
      const { downloadUrl } = await attachmentsApi.getDownloadUrl(noteId, a.attachmentId);
      window.open(downloadUrl, "_blank");
    } catch {}
  };

  return (
    <div className="space-y-2">
      {attachments.map((a) => (
        <div key={a.attachmentId} className="group flex items-center gap-3 p-3 rounded-[var(--r-sm)] border border-[var(--border)] hover:border-[#d4d4dc] hover:shadow-[var(--shadow-sm)] transition-all bg-white">
          <div className="h-10 w-10 rounded-[10px] flex items-center justify-center text-[11px] font-extrabold text-white shrink-0" style={{ background: pick(a.fileName) }}>
            {fmtType(a.contentType)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold truncate">{a.fileName}</p>
            <p className="text-[12px]" style={{ color: "var(--fg4)" }}>{fmtSize(a.fileSize)}</p>
          </div>
          <div className="flex gap-1.5">
            {noteId && (
              <button onClick={() => handleDownload(a)}
                className="text-[12px] font-semibold px-3 py-1 rounded-[8px] cursor-pointer"
                style={{ background: "rgba(79,110,247,0.08)", color: "var(--blue)" }}>
                Download
              </button>
            )}
            <button onClick={() => onDelete(a.attachmentId)}
              className="text-[12px] font-semibold px-3 py-1 rounded-[8px] cursor-pointer"
              style={{ background: "#fef2f2", color: "var(--red)" }}>
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
