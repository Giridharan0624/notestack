"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import NoteForm from "@/components/NoteForm";
import FileUpload from "@/components/FileUpload";
import AttachmentList from "@/components/AttachmentList";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { notesApi, attachmentsApi } from "@/lib/api";
import { useUpload } from "@/hooks/useUpload";
import { Note, Attachment } from "@/lib/types";

export default function NoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const noteId = params.id as string;
  const [note, setNote] = useState<Note | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const { uploadFile, isUploading, progress } = useUpload();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [n, a] = await Promise.all([notesApi.get(noteId), attachmentsApi.list(noteId)]);
      setNote(n); setAttachments(a);
    } catch (err) { setError(err instanceof Error ? err.message : "Failed to load"); }
    finally { setIsLoading(false); }
  }, [noteId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdate = async (data: { title: string; content: string; description: string; tags: string[]; visibility: string }) => {
    const updated = await notesApi.update(noteId, data);
    setNote(updated); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <ProtectedRoute>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-8">
        {isLoading ? <Spinner className="mt-16" /> : error ? (
          <div className="text-center mt-16 p-3 rounded-[var(--radius-md)] text-xs" style={{ background: "var(--red-subtle)", color: "var(--red)" }}>{error}</div>
        ) : note ? (
          <div className="space-y-5 animate-fade-up">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Back
              </Button>
              <div className="flex items-center gap-2">
                {saved && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded" style={{ background: "var(--green-subtle)", color: "var(--green)", fontFamily: "var(--font-mono)" }}>saved</span>}
                {note.visibility === "public" && <Button variant="secondary" size="sm" onClick={() => window.open(`/feed/notes/${note.noteId}`, "_blank")}>Public link</Button>}
                <Button variant="ghost" size="sm" onClick={async () => { await notesApi.delete(noteId); router.push("/dashboard"); }} style={{ color: "var(--red)" }}>Delete</Button>
              </div>
            </div>

            {/* Files section — primary content */}
            <div className="glass p-5 space-y-4" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
                  Uploaded Files · {attachments.length}
                </h3>
              </div>

              {attachments.length === 0 && !isUploading && (
                <div className="text-center py-4">
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No files uploaded yet</p>
                </div>
              )}

              <AttachmentList
                attachments={attachments}
                onDelete={async (id) => {
                  await attachmentsApi.delete(noteId, id);
                  setAttachments((p) => p.filter((a) => a.attachmentId !== id));
                }}
              />

              <FileUpload
                onFileSelect={async (f) => {
                  try {
                    const a = await uploadFile(noteId, f);
                    setAttachments((p) => [...p, a]);
                  } catch (e) { setError(e instanceof Error ? e.message : "Upload failed"); }
                }}
                isUploading={isUploading}
                progress={progress}
              />
            </div>

            {/* Note metadata */}
            <div className="glass p-5" style={{ boxShadow: "var(--shadow-sm)" }}>
              <h3 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>Note Details</h3>
              <NoteForm
                initialTitle={note.title}
                initialDescription={note.description}
                initialTags={note.tags}
                initialVisibility={note.visibility}
                submitLabel="Save changes"
                onSubmit={handleUpdate}
              />
            </div>
          </div>
        ) : null}
      </main>
    </ProtectedRoute>
  );
}
