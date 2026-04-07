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
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const { notes, isLoading, error, createNote } = useNotes();
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();

  const handleCreate = async (data: {
    title: string;
    content: string;
    description: string;
    subject: string;
    visibility: string;
  }) => {
    const note = await createNote(data);
    setShowCreate(false);
    router.push(`/notes/${note.noteId}`);
  };

  return (
    <ProtectedRoute>
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="flex items-end justify-between mb-8 animate-fade-in-up">
          <div>
            <h2
              className="text-3xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              My Notes
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
              {notes.length > 0
                ? `${notes.length} note${notes.length === 1 ? "" : "s"}`
                : "Your personal workspace"}
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} size="md">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            New note
          </Button>
        </div>

        {isLoading ? (
          <Spinner className="mt-16" />
        ) : error ? (
          <div
            className="text-center mt-16 p-4 rounded-[var(--radius-md)]"
            style={{ background: "var(--danger-light)", color: "var(--danger)" }}
          >
            {error}
          </div>
        ) : (
          <NoteList notes={notes} />
        )}

        <Modal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          title="Create a new note"
        >
          <NoteForm
            submitLabel="Create"
            onSubmit={handleCreate}
            onCancel={() => setShowCreate(false)}
          />
        </Modal>
      </main>
    </ProtectedRoute>
  );
}
