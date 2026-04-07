"use client";

import { useRef, useState, DragEvent } from "react";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  progress: number;
}

export default function FileUpload({
  onFileSelect,
  isUploading,
  progress,
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        className="relative overflow-hidden cursor-pointer transition-all"
        style={{
          borderRadius: "var(--radius-lg)",
          border: `2px dashed ${isDragging ? "var(--accent)" : "var(--border)"}`,
          background: isDragging ? "var(--accent-light)" : "var(--bg-secondary)",
          padding: "2rem",
          textAlign: "center",
          transition: "all var(--transition-fast)",
        }}
        onClick={() => inputRef.current?.click()}
      >
        <div className="flex flex-col items-center gap-3">
          <div
            className="h-10 w-10 rounded-full flex items-center justify-center"
            style={{
              background: isDragging ? "var(--accent-glow)" : "var(--bg-card)",
              border: "1px solid var(--border-light)",
              transition: "all var(--transition-fast)",
            }}
          >
            <svg
              width="20" height="20" viewBox="0 0 24 24" fill="none"
              style={{ color: isDragging ? "var(--accent)" : "var(--text-tertiary)" }}
            >
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
              Drop a file here or{" "}
              <span style={{ color: "var(--accent)" }}>browse</span>
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
              PDF, images, documents &middot; up to 10 MB
            </p>
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
            e.target.value = "";
          }}
          disabled={isUploading}
        />
      </div>

      {isUploading && (
        <div
          className="animate-fade-in p-3"
          style={{
            background: "var(--accent-light)",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>
              Uploading...
            </span>
            <span className="text-xs font-medium" style={{ color: "var(--accent)" }}>
              {progress}%
            </span>
          </div>
          <div
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "var(--accent-glow)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: "var(--accent)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
