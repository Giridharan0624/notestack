"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import PublicNoteCard from "@/components/PublicNoteCard";
import Spinner from "@/components/ui/Spinner";
import { profileApi, feedApi } from "@/lib/api";
import { UserProfile, Note } from "@/lib/types";

export default function ProfilePage() {
  const params = useParams();
  const userId = params.userId as string;
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([profileApi.get(userId), feedApi.userNotes(userId)])
      .then(([p, n]) => { setProfile(p); setNotes(n.notes); })
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, [userId]);

  return (
    <>
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-5 py-8">
        {isLoading ? <Spinner className="mt-16" /> : error ? (
          <div className="text-center mt-16 p-3 rounded-[var(--radius-md)] text-xs" style={{ background: "var(--red-subtle)", color: "var(--red)" }}>{error}</div>
        ) : profile ? (
          <div className="animate-fade-up">
            <div className="glass p-5 mb-6" style={{ boxShadow: "var(--shadow-sm)" }}>
              <div className="flex items-start gap-4">
                <div className="h-14 w-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                  style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
                  {(profile.displayName || "S")[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">{profile.displayName || "Student"}</h2>
                  {profile.university && <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>{profile.university}</p>}
                  {profile.bio && <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{profile.bio}</p>}
                  <p className="text-[10px] mt-2 uppercase tracking-wider font-bold" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{notes.length} public note{notes.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
            </div>

            {notes.length === 0 ? (
              <p className="text-sm py-10 text-center" style={{ color: "var(--text-tertiary)" }}>No public notes yet</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {notes.map((n, i) => <PublicNoteCard key={n.noteId} note={n} index={i} />)}
              </div>
            )}
          </div>
        ) : null}
      </main>
    </>
  );
}
