"use client";

import { FormEvent, useState } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";

const SUBJECTS = ["CS", "Math", "Biology", "Physics", "English", "History", "Business", "Engineering", "Other"];

interface NoteFormProps {
  initialTitle?: string;
  initialContent?: string;
  initialDescription?: string;
  initialSubject?: string;
  initialVisibility?: "public" | "private";
  submitLabel?: string;
  onSubmit: (data: {
    title: string;
    content: string;
    description: string;
    subject: string;
    visibility: string;
  }) => Promise<void>;
  onCancel?: () => void;
}

export default function NoteForm({
  initialTitle = "",
  initialContent = "",
  initialDescription = "",
  initialSubject = "",
  initialVisibility = "private",
  submitLabel = "Save",
  onSubmit,
  onCancel,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [description, setDescription] = useState(initialDescription);
  const [subject, setSubject] = useState(initialSubject);
  const [visibility, setVisibility] = useState<"public" | "private">(initialVisibility);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      await onSubmit({ title, content, description, subject, visibility });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        id="title"
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Give your note a title"
        required
      />

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
          Description
        </label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief summary (shown in feed)"
          maxLength={200}
          className="w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-md)] border transition-all placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-1 focus:border-transparent"
          style={{
            borderColor: "var(--border)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
          }}
        />
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
          {description.length}/200
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
            Subject
          </label>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-md)] border transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-1 focus:border-transparent cursor-pointer"
            style={{
              borderColor: "var(--border)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-body)",
            }}
          >
            <option value="">Select subject</option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
            Visibility
          </label>
          <div className="flex rounded-[var(--radius-md)] overflow-hidden border" style={{ borderColor: "var(--border)" }}>
            {(["private", "public"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v)}
                className="flex-1 py-2.5 text-sm font-medium transition-all cursor-pointer"
                style={{
                  background: visibility === v
                    ? (v === "public" ? "var(--success-light)" : "var(--bg-secondary)")
                    : "var(--bg-card)",
                  color: visibility === v
                    ? (v === "public" ? "var(--success)" : "var(--text-primary)")
                    : "var(--text-tertiary)",
                }}
              >
                {v === "public" ? "Public" : "Private"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="content" className="text-sm font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
          Content
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Start writing..."
          rows={14}
          className="w-full px-3.5 py-3 text-sm leading-relaxed resize-y transition-all"
          style={{
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: "var(--bg-card)",
            color: "var(--text-primary)",
            fontFamily: "var(--font-body)",
            outline: "none",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--accent)";
            e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-light)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>

      {error && (
        <div
          className="text-sm px-3 py-2 rounded-[var(--radius-sm)]"
          style={{ background: "var(--danger-light)", color: "var(--danger)" }}
        >
          {error}
        </div>
      )}

      <div className="flex gap-2.5 justify-end pt-1">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
