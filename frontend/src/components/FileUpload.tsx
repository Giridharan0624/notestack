"use client";

import { useRef, useState, DragEvent } from "react";

interface FileUploadProps { onFileSelect: (file: File) => void; isUploading: boolean; progress: number; }

export default function FileUpload({ onFileSelect, isUploading, progress }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="space-y-2">
      <div
        onDrop={(e: DragEvent) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) onFileSelect(f); }}
        onDragOver={(e: DragEvent) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer transition-all text-center py-6 px-4 rounded-[var(--radius-lg)]"
        style={{
          border: `2px dashed ${isDragging ? "var(--accent)" : "var(--border)"}`,
          background: isDragging ? "var(--accent-subtle)" : "var(--bg-surface)",
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mx-auto mb-2" style={{ color: isDragging ? "var(--accent)" : "var(--text-tertiary)" }}>
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Drop file or <span style={{ color: "var(--accent)" }}>browse</span></p>
        <p className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>PDF, images, docs · max 10MB</p>
        <input ref={inputRef} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect(f); e.target.value = ""; }} disabled={isUploading} />
      </div>
      {isUploading && (
        <div className="px-3 py-2 rounded-[var(--radius-md)] animate-fade-in" style={{ background: "var(--accent-subtle)" }}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>Uploading</span>
            <span className="text-[10px] font-bold" style={{ color: "var(--accent)", fontFamily: "var(--font-mono)" }}>{progress}%</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-overlay)" }}>
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: "var(--accent-gradient)" }} />
          </div>
        </div>
      )}
    </div>
  );
}
