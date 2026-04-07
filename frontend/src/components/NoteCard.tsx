"use client";

import { Note } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function NoteCard({ note }: { note: Note }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/notes/${note.noteId}`)}
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <h3 className="font-semibold text-gray-900 truncate">{note.title}</h3>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2">
        {note.content || "No content"}
      </p>
      <p className="text-xs text-gray-400 mt-3">
        {new Date(note.updatedAt).toLocaleDateString()}
      </p>
    </div>
  );
}
