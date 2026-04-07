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
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { uploadFile, isUploading, progress } = useUpload();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [noteData, attachData] = await Promise.all([
        notesApi.get(noteId),
        attachmentsApi.list(noteId),
      ]);
      setNote(noteData);
      setAttachments(attachData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load note");
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdate = async (data: {
    title: string;
    content: string;
    description: string;
    subject: string;
    visibility: string;
  }) => {
    const updated = await notesApi.update(noteId, data);
    setNote(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleDelete = async () => {
    await notesApi.delete(noteId);
    router.push("/dashboard");
  };

  const handleFileUpload = async (file: File) => {
    try {
      const attachment = await uploadFile(noteId, file);
      setAttachments((prev) => [...prev, attachment]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    await attachmentsApi.delete(noteId, attachmentId);
    setAttachments((prev) =>
      prev.filter((a) => a.attachmentId !== attachmentId)
    );
  };

  return (
    <ProtectedRoute>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        {isLoading ? (
          <Spinner className="mt-16" />
        ) : error ? (
          <div
            className="text-center mt-16 p-4 rounded-[var(--radius-md)]"
            style={{ background: "var(--danger-light)", color: "var(--danger)" }}
          >
            {error}
          </div>
        ) : note ? (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to notes
              </Button>

              <div className="flex items-center gap-2">
                {saveSuccess && (
                  <span
                    className="text-xs font-medium px-2.5 py-1 rounded-full animate-fade-in"
                    style={{ background: "var(--success-light)", color: "var(--success)" }}
                  >
                    Saved
                  </span>
                )}
                {note.visibility === "public" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => window.open(`/feed/notes/${note.noteId}`, "_blank")}
                  >
                    View public link
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={handleDelete} style={{ color: "var(--danger)" }}>
                  Delete
                </Button>
              </div>
            </div>

            <div
              className="p-6 sm:p-8"
              style={{
                background: "var(--bg-card)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <NoteForm
                initialTitle={note.title}
                initialContent={note.content}
                initialDescription={note.description}
                initialSubject={note.subject}
                initialVisibility={note.visibility}
                submitLabel="Save changes"
                onSubmit={handleUpdate}
              />
            </div>

            <div
              className="p-6 sm:p-8 space-y-5"
              style={{
                background: "var(--bg-card)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <h3
                className="text-lg font-semibold tracking-tight"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
              >
                Files
              </h3>
              <FileUpload
                onFileSelect={handleFileUpload}
                isUploading={isUploading}
                progress={progress}
              />
              <AttachmentList
                attachments={attachments}
                onDelete={handleDeleteAttachment}
              />
            </div>
          </div>
        ) : null}
      </main>
    </ProtectedRoute>
  );
}
