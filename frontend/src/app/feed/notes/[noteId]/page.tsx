"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import { feedApi } from "@/lib/api";
import { Note } from "@/lib/types";
import Link from "next/link";

export default function PublicNotePage() {
  const params = useParams();
  const noteId = params.noteId as string;
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    feedApi
      .getNote(noteId)
      .then(setNote)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [noteId]);

  return (
    <>
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">
        {isLoading ? (
          <Spinner className="mt-16" />
        ) : error ? (
          <div
            className="text-center mt-16 p-4 rounded-[var(--radius-md)]"
            style={{ background: "var(--danger-light)", color: "var(--danger)" }}
          >
            {error}
          </div>
        ) : note ? (
          <article className="animate-fade-in-up">
            <div className="mb-6">
              <Link
                href="/explore"
                className="text-sm font-medium flex items-center gap-1 mb-6"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to explore
              </Link>

              <div className="flex items-center gap-2 mb-3">
                {note.subject && (
                  <span
                    className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ background: "var(--accent-light)", color: "var(--accent)" }}
                  >
                    {note.subject}
                  </span>
                )}
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                  {new Date(note.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h1
                className="text-3xl font-bold tracking-tight mb-3"
                style={{ fontFamily: "var(--font-display)", color: "var(--text-primary)" }}
              >
                {note.title}
              </h1>

              {note.description && (
                <p className="text-base leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                  {note.description}
                </p>
              )}

              <Link
                href={`/profile/${note.userId}`}
                className="inline-flex items-center gap-2 group"
              >
                <div
                  className="h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{
                    background: "var(--accent-light)",
                    color: "var(--accent)",
                    fontFamily: "var(--font-display)",
                  }}
                >
                  {(note.authorDisplayName || "S")[0].toUpperCase()}
                </div>
                <span
                  className="text-sm font-medium group-hover:underline"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {note.authorDisplayName || "Student"}
                </span>
              </Link>
            </div>

            <div
              className="p-6 sm:p-8"
              style={{
                background: "var(--bg-card)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{ color: "var(--text-primary)", fontFamily: "var(--font-body)" }}
              >
                {note.content || "No content."}
              </div>
            </div>
          </article>
        ) : null}
      </main>
    </>
  );
}
