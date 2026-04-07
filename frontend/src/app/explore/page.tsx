"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header"; import PublicNoteCard from "@/components/PublicNoteCard"; import Button from "@/components/ui/Button"; import Spinner from "@/components/ui/Spinner";
import ShareModal from "@/components/ShareModal";
import { useFeed } from "@/hooks/useFeed"; import { useSocial } from "@/hooks/useSocial"; import { useAuth } from "@/context/AuthContext";

export default function ExplorePage() {
  const { notes, isLoading, error, hasMore, loadMore } = useFeed();
  const { isAuthenticated } = useAuth();
  const { status, loadStatus, toggleLike, toggleBookmark } = useSocial();
  const [search, setSearch] = useState("");
  const [shareNoteId, setShareNoteId] = useState<string|null>(null);

  useEffect(() => {
    if (isAuthenticated && notes.length) loadStatus(notes.map(n => n.noteId), []);
  }, [isAuthenticated, notes, loadStatus]);

  const filtered = search
    ? notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase()) || n.tags.some(t => t.includes(search.toLowerCase())) || (n.description || "").toLowerCase().includes(search.toLowerCase()))
    : notes;

  return (
    <><Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        <div className="mb-6 up">
          <h1 className="text-[28px] font-extrabold tracking-tight">Explore</h1>
          <p className="text-[14px] mt-0.5 mb-4" style={{ color: "var(--fg3)" }}>Discover notes shared by students</p>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, tag, or description..."
            className="w-full px-4 py-3 text-[14px] rounded-[var(--r)] border-2 outline-none transition-all placeholder:text-[var(--fg4)]"
            style={{ background: "var(--white)", borderColor: "var(--border)", color: "var(--fg)" }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(79,110,247,0.1)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
          />
        </div>

        {isLoading ? <Spinner className="mt-16" /> : error ? <p className="text-[14px] mt-16 text-center" style={{ color: "var(--red)" }}>{error}</p> : !filtered.length ? (
          <div className="flex flex-col items-center py-20 up">
            <div className="text-3xl mb-3">{search ? "🔍" : "📝"}</div>
            <p className="text-[16px] font-bold mb-1">{search ? "No matches" : "No public notes yet"}</p>
            <p className="text-[14px]" style={{ color: "var(--fg3)" }}>{search ? "Try different keywords" : "Be the first to share"}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((n, i) => (
                <PublicNoteCard key={n.noteId} note={n} index={i}
                  liked={status.likes[n.noteId]} bookmarked={status.bookmarks[n.noteId]}
                  onLike={isAuthenticated ? () => toggleLike(n.noteId) : undefined}
                  onBookmark={isAuthenticated ? () => toggleBookmark(n.noteId) : undefined}
                  onShare={isAuthenticated ? () => setShareNoteId(n.noteId) : undefined} />
              ))}
            </div>
            {hasMore && !search && <div className="flex justify-center mt-8"><Button variant="secondary" size="lg" onClick={loadMore}>Load more</Button></div>}
          </>
        )}
        {shareNoteId && <ShareModal isOpen={!!shareNoteId} onClose={() => setShareNoteId(null)} noteId={shareNoteId} />}
      </main>
    </>
  );
}
