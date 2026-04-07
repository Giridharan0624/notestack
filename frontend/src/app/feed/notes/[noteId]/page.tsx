"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Spinner from "@/components/ui/Spinner";
import { feedApi, attachmentsApi } from "@/lib/api";
import { Note, Attachment } from "@/lib/types";
import Link from "next/link";

function formatSize(b: number) { if (b < 1024) return `${b}B`; if (b < 1048576) return `${(b / 1024).toFixed(1)}KB`; return `${(b / 1048576).toFixed(1)}MB`; }

function getFileIcon(type: string) {
  if (type === "application/pdf") return "PDF";
  if (type.startsWith("image/")) return "IMG";
  if (type.includes("word") || type.includes("document")) return "DOC";
  if (type.includes("sheet") || type.includes("excel")) return "XLS";
  return "FILE";
}

export default function PublicNotePage() {
  const params = useParams();
  const noteId = params.noteId as string;
  const [note, setNote] = useState<Note | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    feedApi.getNote(noteId)
      .then((n) => { setNote(n); return attachmentsApi.list(noteId).catch(() => []); })
      .then((a) => setAttachments(a as Attachment[]))
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [noteId]);

  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-8">
        {isLoading ? <Spinner className="mt-16" /> : error ? (
          <div className="text-center mt-16 p-3 rounded-[var(--radius-md)] text-xs" style={{ background: "var(--red-subtle)", color: "var(--red)" }}>{error}</div>
        ) : note ? (
          <article className="animate-fade-up">
            <Link href="/explore" className="text-xs font-medium flex items-center gap-1 mb-5" style={{ color: "var(--text-tertiary)" }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              Explore
            </Link>

            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {note.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                  {tag}
                </span>
              ))}
              <span className="text-[10px]" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                {new Date(note.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight mb-2">{note.title}</h1>
            {note.description && <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>{note.description}</p>}

            <Link href={`/profile/${note.userId}`} className="inline-flex items-center gap-2 mb-6 group">
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                {(note.authorDisplayName || "S")[0].toUpperCase()}
              </div>
              <span className="text-xs group-hover:underline" style={{ color: "var(--text-secondary)" }}>{note.authorDisplayName || "Student"}</span>
            </Link>

            {/* Files */}
            <div className="glass p-5 space-y-3" style={{ boxShadow: "var(--shadow-sm)" }}>
              <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                Files · {attachments.length}
              </h3>
              {attachments.length === 0 ? (
                <p className="text-xs py-4 text-center" style={{ color: "var(--text-tertiary)" }}>No files attached</p>
              ) : (
                <div className="space-y-2">
                  {attachments.map((att) => (
                    <div key={att.attachmentId} className="flex items-center gap-3 px-3 py-3 rounded-[var(--radius-md)]" style={{ background: "var(--bg-surface)", border: "1px solid var(--border)" }}>
                      <div className="h-9 w-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
                        style={{ background: "var(--accent-subtle)", fontFamily: "var(--font-mono)" }}>
                        <span className="text-[9px] font-bold" style={{ color: "var(--accent)" }}>{getFileIcon(att.contentType)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>{att.fileName}</p>
                        <p className="text-[10px]" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{formatSize(att.fileSize)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>
        ) : null}
      </main>
    </>
  );
}
