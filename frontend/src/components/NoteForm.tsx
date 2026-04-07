"use client";

import { FormEvent, useState, useRef, KeyboardEvent } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";

interface NoteFormProps {
  initialTitle?: string;
  initialDescription?: string;
  initialTags?: string[];
  initialVisibility?: "public" | "private";
  submitLabel?: string;
  showFileUpload?: boolean;
  onSubmit: (data: {
    title: string;
    content: string;
    description: string;
    tags: string[];
    visibility: string;
    file?: File;
  }) => Promise<void>;
  onCancel?: () => void;
}

export default function NoteForm({
  initialTitle = "",
  initialDescription = "",
  initialTags = [],
  initialVisibility = "private",
  submitLabel = "Save",
  showFileUpload = false,
  onSubmit,
  onCancel,
}: NoteFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagInput, setTagInput] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">(initialVisibility);
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const tagInputRef = useRef<HTMLInputElement>(null);

  const addTag = (value: string) => {
    const tag = value.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Title is required"); return; }
    if (showFileUpload && !file) { setError("Please select a file to upload"); return; }
    setError(""); setIsLoading(true);
    try {
      await onSubmit({ title, content: "", description, tags, visibility, file: file || undefined });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally { setIsLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* File upload */}
      {showFileUpload && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>File</label>
          <div
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^/.]+$/, "")); } }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onClick={() => fileRef.current?.click()}
            className="cursor-pointer transition-all rounded-[var(--radius-lg)] py-8 px-4 text-center"
            style={{
              border: `2px dashed ${isDragging ? "var(--accent)" : file ? "var(--green)" : "var(--border)"}`,
              background: isDragging ? "var(--accent-subtle)" : file ? "var(--green-subtle)" : "var(--bg-surface)",
            }}
          >
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: "var(--green)" }}>
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M14 2v6h6M9 15l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{file.name}</p>
                <p className="text-[10px]" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                <button type="button" className="text-[10px] font-bold uppercase tracking-wider cursor-pointer" style={{ color: "var(--text-tertiary)" }}
                  onClick={(e) => { e.stopPropagation(); setFile(null); }}>Change file</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ color: isDragging ? "var(--accent)" : "var(--text-tertiary)" }}>
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>Drop your file here or <span style={{ color: "var(--accent)" }}>browse</span></p>
                <p className="text-[10px]" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>PDF, images, documents · max 10MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx,.txt"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^/.]+$/, "")); } e.target.value = ""; }} />
          </div>
        </div>
      )}

      <Input id="title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" required />

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What's in this note? Help others find it..." maxLength={200} rows={2}
          className="w-full px-3.5 py-2.5 text-sm rounded-[var(--radius-md)] border transition-all focus:outline-none placeholder:text-[var(--text-tertiary)] resize-y"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border)", color: "var(--text-primary)" }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--accent)"; e.currentTarget.style.boxShadow = "0 0 0 2px var(--accent-subtle)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }}
        />
        <span className="text-[10px]" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>{description.length}/200</span>
      </div>

      {/* Tags input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Tags</label>
        <div
          className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-[var(--radius-md)] border transition-all cursor-text"
          style={{ background: "var(--bg-surface)", borderColor: "var(--border)", minHeight: "42px" }}
          onClick={() => tagInputRef.current?.focus()}
        >
          {tags.map((tag) => (
            <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
              style={{ background: "var(--accent-subtle)", color: "var(--accent)" }}>
              {tag}
              <button type="button" onClick={(e) => { e.stopPropagation(); removeTag(tag); }}
                className="cursor-pointer hover:opacity-70" style={{ color: "var(--accent)" }}>
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none"><path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
              </button>
            </span>
          ))}
          <input
            ref={tagInputRef}
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => { if (tagInput) addTag(tagInput); }}
            placeholder={tags.length === 0 ? "e.g. calculus, midterm, chapter-5" : tags.length < 10 ? "Add tag..." : ""}
            disabled={tags.length >= 10}
            className="flex-1 min-w-[100px] text-sm bg-transparent border-none outline-none placeholder:text-[var(--text-tertiary)]"
            style={{ color: "var(--text-primary)" }}
          />
        </div>
        <span className="text-[10px]" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
          press enter or comma to add · {tags.length}/10
        </span>
      </div>

      {/* Visibility */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--text-tertiary)" }}>Visibility</label>
        <div className="flex rounded-[var(--radius-md)] overflow-hidden border" style={{ borderColor: "var(--border)" }}>
          {(["private", "public"] as const).map((v) => (
            <button key={v} type="button" onClick={() => setVisibility(v)}
              className="flex-1 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all"
              style={{
                background: visibility === v ? (v === "public" ? "var(--green-subtle)" : "var(--bg-overlay)") : "var(--bg-surface)",
                color: visibility === v ? (v === "public" ? "var(--green)" : "var(--text-primary)") : "var(--text-tertiary)",
                fontFamily: "var(--font-mono)",
              }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="text-xs px-3 py-2 rounded-[var(--radius-sm)]" style={{ background: "var(--red-subtle)", color: "var(--red)" }}>{error}</div>}

      <div className="flex gap-2 justify-end pt-1">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" isLoading={isLoading}>
          {showFileUpload && <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
