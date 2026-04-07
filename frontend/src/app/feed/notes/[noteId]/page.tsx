"use client";
import { useEffect, useState } from "react"; import { useParams } from "next/navigation";
import Header from "@/components/Header"; import Spinner from "@/components/ui/Spinner";
import { feedApi, attachmentsApi } from "@/lib/api"; import { Note, Attachment } from "@/lib/types"; import Link from "next/link";

const GS = ["var(--g1)","var(--g2)","var(--g3)","var(--g4)","var(--g5)","var(--g6)","var(--g7)","var(--g8)"];
function pick(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = ((h<<5)-h+s.charCodeAt(i))|0; return GS[Math.abs(h)%GS.length]; }
function fmtSize(b: number) { if (b < 1024) return `${b}B`; if (b < 1048576) return `${(b/1024).toFixed(1)}KB`; return `${(b/1048576).toFixed(1)}MB`; }
function fmtType(t: string) { if (t === "application/pdf") return "PDF"; if (t.startsWith("image/")) return "IMG"; if (t.includes("word")) return "DOC"; return "FILE"; }

export default function PublicNotePage() {
  const { noteId } = useParams() as { noteId: string };
  const [note, setNote] = useState<Note|null>(null); const [atts, setAtts] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true); const [err, setErr] = useState<string|null>(null);
  useEffect(() => { feedApi.getNote(noteId).then(n => { setNote(n); return attachmentsApi.list(noteId).catch(() => []); }).then(a => setAtts(a as Attachment[])).catch(e => setErr(e.message)).finally(() => setLoading(false)); }, [noteId]);

  return (
    <><Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {loading ? <Spinner className="mt-16" /> : err ? <p className="text-[14px] mt-16 text-center" style={{ color: "var(--red)" }}>{err}</p> : note ? (
          <article className="up">
            <Link href="/explore" className="text-[13px] font-semibold inline-flex items-center gap-1 mb-6" style={{ color: "var(--fg3)" }}>← Explore</Link>

            {/* Hero gradient banner */}
            <div className="h-40 rounded-[var(--r)] mb-6 relative overflow-hidden" style={{ background: pick(note.noteId) }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white/20 text-[60px] font-extrabold">{note.title[0]?.toUpperCase()}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {note.tags.map(t => <span key={t} className="text-[12px] font-semibold px-3 py-1 rounded-full" style={{ background: "rgba(79,110,247,0.08)", color: "var(--blue)" }}>{t}</span>)}
              <span className="text-[12px] ml-auto self-center" style={{ color: "var(--fg4)" }}>{new Date(note.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            </div>

            <h1 className="text-[26px] font-extrabold tracking-tight mb-2">{note.title}</h1>
            {note.description && <p className="text-[15px] leading-relaxed mb-5" style={{ color: "var(--fg2)" }}>{note.description}</p>}

            <Link href={`/profile/${note.userId}`} className="inline-flex items-center gap-2.5 mb-8 group">
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: pick(note.userId) }}>{(note.authorDisplayName||"S")[0].toUpperCase()}</div>
              <span className="text-[14px] font-semibold group-hover:underline" style={{ color: "var(--fg2)" }}>{note.authorDisplayName || "Student"}</span>
            </Link>

            <div className="bg-white rounded-[var(--r)] p-5 border border-[var(--border)]" style={{ boxShadow: "var(--shadow-sm)" }}>
              <p className="text-[14px] font-bold mb-3" style={{ color: "var(--fg2)" }}>📎 Files · {atts.length}</p>
              {!atts.length ? <p className="text-[14px] py-4 text-center" style={{ color: "var(--fg4)" }}>No files attached</p> : (
                <div className="space-y-2">{atts.map(a => (
                  <div key={a.attachmentId} className="flex items-center gap-3 p-3 rounded-[var(--r-sm)] border border-[var(--border)] bg-[var(--bg)]">
                    <div className="h-10 w-10 rounded-[10px] flex items-center justify-center text-[11px] font-extrabold text-white shrink-0" style={{ background: pick(a.fileName) }}>{fmtType(a.contentType)}</div>
                    <div className="flex-1 min-w-0"><p className="text-[14px] font-semibold truncate">{a.fileName}</p><p className="text-[12px]" style={{ color: "var(--fg4)" }}>{fmtSize(a.fileSize)}</p></div>
                  </div>
                ))}</div>
              )}
            </div>
          </article>
        ) : null}
      </main>
    </>
  );
}
