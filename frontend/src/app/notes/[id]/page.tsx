"use client";
import { useEffect, useState, useCallback } from "react"; import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header"; import ProtectedRoute from "@/components/ProtectedRoute"; import NoteForm from "@/components/NoteForm";
import FileUpload from "@/components/FileUpload"; import AttachmentList from "@/components/AttachmentList";
import Button from "@/components/ui/Button"; import Spinner from "@/components/ui/Spinner";
import { notesApi, attachmentsApi } from "@/lib/api"; import { useUpload } from "@/hooks/useUpload"; import { Note, Attachment } from "@/lib/types";

export default function NoteDetailPage() {
  const { id } = useParams() as { id: string }; const router = useRouter();
  const [note, setNote] = useState<Note|null>(null); const [atts, setAtts] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true); const [err, setErr] = useState<string|null>(null); const [saved, setSaved] = useState(false);
  const { uploadFile, isUploading, progress } = useUpload();
  const load = useCallback(async () => { setLoading(true); try { const [n,a] = await Promise.all([notesApi.get(id), attachmentsApi.list(id)]); setNote(n); setAtts(a); } catch(e) { setErr(e instanceof Error ? e.message : "Failed"); } finally { setLoading(false); } }, [id]);
  useEffect(() => { load(); }, [load]);

  return (
    <ProtectedRoute><Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {loading ? <Spinner className="mt-16" /> : err ? <p className="text-[14px] mt-16 text-center" style={{ color: "var(--red)" }}>{err}</p> : note ? (
          <div className="space-y-5 up">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>← Back</Button>
              <div className="flex items-center gap-2">
                {saved && <span className="text-[12px] font-bold px-3 py-1 rounded-full" style={{ background: "rgba(16,185,129,0.08)", color: "var(--green)" }}>Saved ✓</span>}
                {note.visibility === "public" && <Button variant="secondary" size="sm" onClick={() => window.open(`/feed/notes/${note.noteId}`, "_blank")}>View public</Button>}
                <Button variant="danger" size="sm" onClick={async () => { await notesApi.delete(id); router.push("/dashboard"); }}>Delete</Button>
              </div>
            </div>

            <div className="bg-white rounded-[var(--r)] p-6 border border-[var(--border)]" style={{ boxShadow: "var(--shadow-sm)" }}>
              <h3 className="text-[14px] font-bold mb-4" style={{ color: "var(--fg2)" }}>📎 Files · {atts.length}</h3>
              <AttachmentList attachments={atts} noteId={id} onDelete={async (aid) => { await attachmentsApi.delete(id, aid); setAtts(p => p.filter(a => a.attachmentId !== aid)); }} />
              <div className={atts.length ? "mt-4" : ""}>
                <FileUpload onFileSelect={async (f) => { try { const a = await uploadFile(id, f); setAtts(p => [...p, a]); } catch {} }} isUploading={isUploading} progress={progress} />
              </div>
            </div>

            <div className="bg-white rounded-[var(--r)] p-6 border border-[var(--border)]" style={{ boxShadow: "var(--shadow-sm)" }}>
              <h3 className="text-[14px] font-bold mb-4" style={{ color: "var(--fg2)" }}>📝 Note details</h3>
              <NoteForm initialTitle={note.title} initialDescription={note.description} initialTags={note.tags} initialVisibility={note.visibility} submitLabel="Save changes"
                onSubmit={async (d) => { const u = await notesApi.update(id, d); setNote(u); setSaved(true); setTimeout(() => setSaved(false), 2000); }} />
            </div>
          </div>
        ) : null}
      </main>
    </ProtectedRoute>
  );
}
