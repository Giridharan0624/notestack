"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import PublicNoteCard from "@/components/PublicNoteCard";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
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
      .then(([p, n]) => {
        setProfile(p);
        setNotes(n.notes);
      })
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [userId]);

  return (
    <>
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-10">
        {isLoading ? (
          <Spinner className="mt-16" />
        ) : error ? (
          <div
            className="text-center mt-16 p-4 rounded-[var(--radius-md)]"
            style={{ background: "var(--danger-light)", color: "var(--danger)" }}
          >
            {error}
          </div>
        ) : profile ? (
          <div className="animate-fade-in-up">
            {/* Profile header */}
            <div
              className="p-6 sm:p-8 mb-8"
              style={{
                background: "var(--bg-card)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div className="flex items-start gap-5">
                <div
                  className="h-16 w-16 rounded-full flex items-center justify-center text-2xl font-bold shrink-0"
                  style={{
                    background: "var(--accent-light)",
                    color: "var(--accent)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {(profile.displayName || "S")[0].toUpperCase()}
                </div>
                <div>
                  <h2
                    className="text-2xl font-semibold tracking-tight"
                    style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
                  >
                    {profile.displayName || "Student"}
                  </h2>
                  {profile.university && (
                    <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                      {profile.university}
                    </p>
                  )}
                  {profile.bio && (
                    <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      {profile.bio}
                    </p>
                  )}
                  <p className="text-xs mt-2" style={{ color: "var(--text-tertiary)" }}>
                    {notes.length} public note{notes.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Public notes */}
            <h3
              className="text-lg font-semibold mb-4"
              style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
            >
              Public Notes
            </h3>
            {notes.length === 0 ? (
              <p className="text-sm py-8 text-center" style={{ color: "var(--text-tertiary)" }}>
                No public notes yet
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {notes.map((note, i) => (
                  <PublicNoteCard key={note.noteId} note={note} index={i} />
                ))}
              </div>
            )}
          </div>
        ) : null}
      </main>
    </>
  );
}
