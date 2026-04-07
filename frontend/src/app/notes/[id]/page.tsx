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

  const handleUpdate = async (title: string, content: string) => {
    const updated = await notesApi.update(noteId, { title, content });
    setNote(updated);
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
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        {isLoading ? (
          <Spinner className="mt-12" />
        ) : error ? (
          <p className="text-red-600 text-center mt-12">{error}</p>
        ) : note ? (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <Button
                variant="secondary"
                onClick={() => router.push("/dashboard")}
              >
                Back
              </Button>
              <Button variant="danger" onClick={handleDelete}>
                Delete Note
              </Button>
            </div>

            <NoteForm
              initialTitle={note.title}
              initialContent={note.content}
              submitLabel="Update"
              onSubmit={handleUpdate}
            />

            <hr className="border-gray-200" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Files</h3>
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
