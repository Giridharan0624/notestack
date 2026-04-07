"use client";

import Header from "@/components/Header";
import PublicNoteCard from "@/components/PublicNoteCard";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import { useFeed } from "@/hooks/useFeed";

export default function ExplorePage() {
  const { notes, isLoading, error, hasMore, loadMore } = useFeed();

  return (
    <>
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="mb-8 animate-fade-in-up">
          <h2
            className="text-3xl font-semibold tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
          >
            Explore Notes
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-tertiary)" }}>
            Discover study materials shared by students
          </p>
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
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center mb-5"
              style={{ background: "var(--accent-light)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent)" }}>
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h3
              className="text-xl font-semibold mb-2"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              No public notes yet
            </h3>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              Be the first to share your study materials
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map((note, i) => (
                <PublicNoteCard key={note.noteId} note={note} index={i} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-8">
                <Button variant="secondary" onClick={loadMore}>
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
