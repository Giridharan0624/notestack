"use client";

import { useState } from "react";
import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";
import NoteList from "@/components/NoteList";
import NoteForm from "@/components/NoteForm";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useNotes } from "@/hooks/useNotes";
import { useUpload } from "@/hooks/useUpload";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { notes, isLoading, error, createNote } = useNotes();
  const { uploadFile } = useUpload();
  const [showCreate, setShowCreate] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const router = useRouter();

  const handleCreate = async (data: {
    title: string;
    content: string;
    description: string;
    tags: string[];
    visibility: string;
    file?: File;
  }) => {
    // Create the note first
    const note = await createNote({
      title: data.title,
      content: data.content,
      description: data.description,
      tags: data.tags,
      visibility: data.visibility,
    });

    // Upload file if provided
    if (data.file) {
      try {
        await uploadFile(note.noteId, data.file);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "File upload failed");
      }
    }

    setShowCreate(false);
    router.push(`/notes/${note.noteId}`);
  };

  return (
    <ProtectedRoute>
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-5 py-8">
        <div className="flex items-end justify-between mb-6 animate-fade-up">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">My Notes</h2>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
              {notes.length > 0 ? `${notes.length} note${notes.length === 1 ? "" : "s"}` : "upload your first note"}
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Upload note
          </Button>
        </div>

        {uploadError && (
          <div className="mb-4 text-xs px-3 py-2 rounded-[var(--radius-md)]" style={{ background: "var(--yellow-subtle)", color: "var(--yellow)" }}>
            Note created but file upload failed: {uploadError}
          </div>
        )}

        {isLoading ? <Spinner className="mt-16" /> : error ? (
          <div className="text-center mt-16 p-3 rounded-[var(--radius-md)] text-xs" style={{ background: "var(--red-subtle)", color: "var(--red)" }}>{error}</div>
        ) : <NoteList notes={notes} />}

        <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Upload a note">
          <NoteForm
            submitLabel="Upload"
            showFileUpload
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </Modal>
      </main>
    </ProtectedRoute>
  );
}
