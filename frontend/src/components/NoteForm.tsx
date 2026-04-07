"use client";
import { FormEvent, useState, useRef, KeyboardEvent } from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";

interface Props {
  initialTitle?: string; initialDescription?: string; initialTags?: string[]; initialVisibility?: "public" | "private";
  submitLabel?: string; showFileUpload?: boolean;
  onSubmit: (d: { title: string; content: string; description: string; tags: string[]; visibility: string; file?: File }) => Promise<void>;
  onCancel?: () => void;
}

const GRADIENTS = ["var(--g1)","var(--g2)","var(--g3)","var(--g4)","var(--g5)","var(--g6)","var(--g7)","var(--g8)"];

export default function NoteForm({ initialTitle = "", initialDescription = "", initialTags = [], initialVisibility = "private", submitLabel = "Save", showFileUpload = false, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [desc, setDesc] = useState(initialDescription);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [tagIn, setTagIn] = useState("");
  const [vis, setVis] = useState<"public"|"private">(initialVisibility);
  const [file, setFile] = useState<File|null>(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const fRef = useRef<HTMLInputElement>(null);
  const tRef = useRef<HTMLInputElement>(null);

  const addTag = (v: string) => { const t = v.trim().toLowerCase(); if (t && !tags.includes(t) && tags.length < 10) setTags([...tags, t]); setTagIn(""); };
  const rmTag = (t: string) => setTags(tags.filter(x => x !== t));
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagIn); } else if (e.key === "Backspace" && !tagIn && tags.length) rmTag(tags[tags.length-1]); };

  const handle = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setErr("Title is required"); return; }
    if (showFileUpload && !file) { setErr("Select a file"); return; }
    setErr(""); setLoading(true);
    try { await onSubmit({ title, content: "", description: desc, tags, visibility: vis, file: file || undefined }); }
    catch (e) { setErr(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  };

  const inputStyle: React.CSSProperties = { background: "var(--white)", borderColor: "var(--border)", color: "var(--fg)" };

  return (
    <form onSubmit={handle} className="flex flex-col gap-3.5">
      {/* Row 1: File upload (left) + Title & Description (right) */}
      {showFileUpload ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-[13px] font-semibold block mb-1.5" style={{ color: "var(--fg2)" }}>File</label>
            <div onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^/.]+$/,"")); } }}
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onClick={() => fRef.current?.click()}
              className="cursor-pointer rounded-[var(--r)] px-4 text-center border-2 border-dashed transition-all flex-1 flex items-center justify-center"
              style={{ borderColor: drag ? "var(--blue)" : file ? "var(--green)" : "var(--border)", background: drag ? "rgba(79,110,247,0.04)" : file ? "rgba(16,185,129,0.04)" : "var(--white)" }}>
              {file ? (
                <div className="flex flex-col items-center gap-1 py-3">
                  <div className="h-10 w-10 rounded-[10px] flex items-center justify-center text-[12px] font-extrabold text-white" style={{ background: GRADIENTS[Math.abs(file.name.length) % 8] }}>{file.name.split(".").pop()?.toUpperCase().slice(0,3)}</div>
                  <p className="text-[13px] font-semibold truncate max-w-full">{file.name}</p>
                  <p className="text-[11px]" style={{ color: "var(--fg3)" }}>{(file.size/1048576).toFixed(1)} MB</p>
                  <button type="button" className="text-[11px] font-semibold cursor-pointer" style={{ color: "var(--blue)" }} onClick={(e) => { e.stopPropagation(); setFile(null); }}>Change</button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 py-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: "var(--fg3)" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <p className="text-[13px] font-medium" style={{ color: "var(--fg2)" }}>Drop or <span style={{ color: "var(--blue)" }}>browse</span></p>
                  <p className="text-[11px]" style={{ color: "var(--fg4)" }}>PDF, images, docs · 10MB</p>
                </div>
              )}
              <input ref={fRef} type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg,.gif,.webp,.doc,.docx,.xls,.xlsx,.txt"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^/.]+$/,"")); } e.target.value = ""; }} />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Input id="title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" required />
            <div className="flex-1 flex flex-col">
              <label className="text-[13px] font-semibold block mb-1.5" style={{ color: "var(--fg2)" }}>Description</label>
              <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What's in this note?" maxLength={200}
                className="w-full flex-1 px-4 py-2.5 text-[14px] rounded-[var(--r-sm)] border-2 outline-none resize-none placeholder:text-[var(--fg4)] transition-all"
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(79,110,247,0.1)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
              <p className="text-[11px] mt-0.5" style={{ color: "var(--fg4)" }}>{desc.length}/200</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <Input id="title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Note title" required />
          <div>
            <label className="text-[13px] font-semibold block mb-1.5" style={{ color: "var(--fg2)" }}>Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="What's in this note?" maxLength={200} rows={1}
              className="w-full px-4 py-2.5 text-[14px] rounded-[var(--r-sm)] border-2 outline-none resize-none placeholder:text-[var(--fg4)] transition-all"
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = "var(--blue)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(79,110,247,0.1)"; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.boxShadow = "none"; }} />
            <p className="text-[11px] mt-0.5" style={{ color: "var(--fg4)" }}>{desc.length}/200</p>
          </div>
        </div>
      )}

      {/* Row 2: Tags + Visibility */}
      <div className="grid grid-cols-2 gap-4 items-start">
        <div>
          <label className="text-[13px] font-semibold block mb-1.5" style={{ color: "var(--fg2)" }}>Tags</label>
          <div className="flex flex-wrap items-center gap-1.5 px-3 py-[9px] rounded-[var(--r-sm)] border-2 cursor-text transition-all"
            style={{ background: "var(--white)", borderColor: "var(--border)" }} onClick={() => tRef.current?.focus()}>
            {tags.map(t => (
              <span key={t} className="inline-flex items-center gap-1 text-[12px] font-semibold px-2.5 py-0.5 rounded-full" style={{ background: "rgba(79,110,247,0.08)", color: "var(--blue)" }}>
                {t}<button type="button" className="cursor-pointer hover:opacity-60" onClick={(e) => { e.stopPropagation(); rmTag(t); }}>×</button>
              </span>
            ))}
            <input ref={tRef} value={tagIn} onChange={(e) => setTagIn(e.target.value)} onKeyDown={onKey} onBlur={() => { if (tagIn) addTag(tagIn); }}
              placeholder={!tags.length ? "calculus, midterm..." : ""} disabled={tags.length >= 10}
              className="flex-1 min-w-[60px] text-[13px] bg-transparent border-none outline-none placeholder:text-[var(--fg4)]" style={{ color: "var(--fg)" }} />
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: "var(--fg4)" }}>Enter to add · {tags.length}/10</p>
        </div>

        <div>
          <label className="text-[13px] font-semibold block mb-1.5" style={{ color: "var(--fg2)" }}>Visibility</label>
          <div className="flex rounded-[var(--r-sm)] overflow-hidden border-2" style={{ borderColor: "var(--border)" }}>
            {(["private","public"] as const).map(v => (
              <button key={v} type="button" onClick={() => setVis(v)}
                className="flex-1 py-[9px] text-[13px] font-semibold cursor-pointer transition-all"
                style={{ background: vis === v ? (v === "public" ? "rgba(16,185,129,0.08)" : "var(--hover)") : "var(--white)", color: vis === v ? (v === "public" ? "var(--green)" : "var(--fg)") : "var(--fg4)" }}>
                {v === "public" ? "🌍 Public" : "🔒 Private"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {err && <p className="text-[12px] font-medium" style={{ color: "var(--red)" }}>{err}</p>}

      <div className="flex gap-2 justify-end pt-1">
        {onCancel && <Button variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button isLoading={loading}>{submitLabel}</Button>
      </div>
    </form>
  );
}
