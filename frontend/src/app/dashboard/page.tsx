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

  const handleCreate = async (title: string, content: string) => {
    const note = await createNote(title, content);
    setShowCreate(false);
    router.push(`/notes/${note.noteId}`);
  };

  return (
    <ProtectedRoute>
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">My Notes</h2>
          <Button onClick={() => setShowCreate(true)}>New Note</Button>
        </div>

        {isLoading ? (
          <Spinner className="mt-12" />
        ) : error ? (
          <p className="text-red-600 text-center mt-12">{error}</p>
        ) : (
          <NoteList notes={notes} />
        )}

        <Modal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          title="Create Note"
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
