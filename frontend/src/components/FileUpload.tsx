"use client";
import { useRef, useState, DragEvent } from "react";

export default function FileUpload({ onFileSelect, isUploading, progress }: { onFileSelect: (f: File) => void; isUploading: boolean; progress: number }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <div>
      <div onDrop={(e: DragEvent) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFileSelect(f); }}
        onDragOver={(e: DragEvent) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onClick={() => ref.current?.click()}
        className="cursor-pointer text-center py-6 px-4 rounded-[var(--r)] border-2 border-dashed transition-all"
        style={{ borderColor: drag ? "var(--blue)" : "var(--border)", background: drag ? "rgba(79,110,247,0.04)" : "var(--white)" }}>
        <div className="h-10 w-10 rounded-[10px] flex items-center justify-center mx-auto mb-2" style={{ background: drag ? "rgba(79,110,247,0.1)" : "var(--hover)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ color: drag ? "var(--blue)" : "var(--fg3)" }}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <p className="text-[14px] font-medium" style={{ color: "var(--fg2)" }}>Drop file or <span style={{ color: "var(--blue)" }}>browse</span></p>
        <p className="text-[12px] mt-0.5" style={{ color: "var(--fg4)" }}>PDF, images, docs · max 10MB</p>
        <input ref={ref} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileSelect(f); e.target.value = ""; }} disabled={isUploading} />
      </div>
      {isUploading && (
        <div className="mt-3 p-3 rounded-[var(--r-sm)] fade" style={{ background: "rgba(79,110,247,0.06)" }}>
          <div className="flex justify-between text-[12px] font-semibold mb-1.5" style={{ color: "var(--blue)" }}><span>Uploading...</span><span>{progress}%</span></div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(79,110,247,0.12)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--blue)" }} /></div>
        </div>
      )}
    </div>
  );
}
