"use client";

import { useRef, useState, DragEvent } from "react";
import Button from "./ui/Button";

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
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setIsDragging(false)}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
      >
        <p className="text-sm text-gray-600">
          Drag & drop a file here, or{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="text-blue-600 hover:underline"
            disabled={isUploading}
          >
            browse
          </button>
        </p>
        <p className="text-xs text-gray-400 mt-1">
          PDF, images, documents up to 10MB
        </p>
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
        <div className="mt-2">
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Uploading... {progress}%</p>
        </div>
      )}
    </div>
  );
}
