"use client";
import Header from "@/components/Header"; import PublicNoteCard from "@/components/PublicNoteCard"; import Button from "@/components/ui/Button"; import Spinner from "@/components/ui/Spinner";
import { useFeed } from "@/hooks/useFeed";

export default function ExplorePage() {
  const { notes, isLoading, error, hasMore, loadMore } = useFeed();
  return (
    <><Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="mb-8 up">
          <h1 className="text-[28px] font-extrabold tracking-tight">Explore</h1>
          <p className="text-[14px] mt-0.5" style={{ color: "var(--fg3)" }}>Discover notes shared by students around the world</p>
        </div>
        {isLoading ? <Spinner className="mt-16" /> : error ? <p className="text-[14px] mt-16 text-center" style={{ color: "var(--red)" }}>{error}</p> : !notes.length ? (
          <div className="flex flex-col items-center py-24 up">
            <div className="h-20 w-20 rounded-[20px] flex items-center justify-center mb-5" style={{ background: "var(--g3)" }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="white" strokeWidth="2" strokeLinecap="round"/></svg>
            </div>
            <p className="text-[16px] font-bold mb-1">No public notes yet</p>
            <p className="text-[14px]" style={{ color: "var(--fg3)" }}>Be the first to share your study materials</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">{notes.map((n, i) => <PublicNoteCard key={n.noteId} note={n} index={i} />)}</div>
            {hasMore && <div className="flex justify-center mt-8"><Button variant="secondary" size="lg" onClick={loadMore}>Load more</Button></div>}
          </>
        )}
      </main>
    </>
  );
}
