"use client";
import { useState } from "react"; import { useRouter } from "next/navigation";
import Header from "@/components/Header"; import ProtectedRoute from "@/components/ProtectedRoute"; import NoteList from "@/components/NoteList";
import NoteForm from "@/components/NoteForm"; import Modal from "@/components/ui/Modal"; import Button from "@/components/ui/Button"; import Spinner from "@/components/ui/Spinner";
import { useNotes } from "@/hooks/useNotes"; import { useUpload } from "@/hooks/useUpload";

export default function DashboardPage() {
  const { notes, isLoading, error, createNote } = useNotes(); const { uploadFile } = useUpload();
  const [show, setShow] = useState(false); const router = useRouter();
  return (
    <ProtectedRoute><Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="flex items-end justify-between mb-8 up">
          <div>
            <h1 className="text-[28px] font-extrabold tracking-tight">My Notes</h1>
            <p className="text-[14px] mt-0.5" style={{ color: "var(--fg3)" }}>{notes.length ? `${notes.length} note${notes.length > 1 ? "s" : ""}` : "Upload your first note"}</p>
          </div>
          <Button onClick={() => setShow(true)} size="lg">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Upload note
          </Button>
        </div>
        {isLoading ? <Spinner className="mt-16" /> : error ? <p className="text-[14px] mt-16 text-center" style={{ color: "var(--red)" }}>{error}</p> : <NoteList notes={notes} />}
        <Modal isOpen={show} onClose={() => setShow(false)} title="Upload a note">
          <NoteForm submitLabel="Upload" showFileUpload onCancel={() => setShow(false)}
            onSubmit={async (d) => { const n = await createNote({ title: d.title, description: d.description, tags: d.tags, visibility: d.visibility }); if (d.file) try { await uploadFile(n.noteId, d.file); } catch {} setShow(false); router.push(`/notes/${n.noteId}`); }} />
        </Modal>
      </main>
    </ProtectedRoute>
  );
}
