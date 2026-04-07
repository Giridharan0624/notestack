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
      <main className="flex-1 max-w-6xl mx-auto w-full px-5 py-8">
        <div className="mb-6 animate-fade-up">
          <h2 className="text-2xl font-bold tracking-tight">
            Explore <span className="gradient-text">Notes</span>
          </h2>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
            study materials shared by students
          </p>
        </div>

        {isLoading ? <Spinner className="mt-16" /> : error ? (
          <div className="text-center mt-16 p-3 rounded-[var(--radius-md)] text-xs" style={{ background: "var(--red-subtle)", color: "var(--red)" }}>{error}</div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="h-14 w-14 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--accent-subtle)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--accent)" }}><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>No public notes yet</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Be the first to share</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {notes.map((note, i) => <PublicNoteCard key={note.noteId} note={note} index={i} />)}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button variant="secondary" onClick={loadMore}>Load more</Button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
