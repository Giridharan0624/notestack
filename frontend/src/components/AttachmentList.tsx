"use client";

import { Attachment } from "@/lib/types";
import Button from "./ui/Button";

interface AttachmentListProps {
  attachments: Attachment[];
  onDelete: (attachmentId: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentList({
  attachments,
  onDelete,
}: AttachmentListProps) {
  if (attachments.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700">
        Attachments ({attachments.length})
      </h3>
      <ul className="divide-y divide-gray-100">
        {attachments.map((att) => (
          <li
            key={att.attachmentId}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm text-gray-800 truncate">
                {att.fileName}
              </span>
              <span className="text-xs text-gray-400 shrink-0">
                {formatFileSize(att.fileSize)}
              </span>
            </div>
            <Button
              variant="danger"
              className="text-xs px-2 py-1"
              onClick={() => onDelete(att.attachmentId)}
            >
              Delete
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
