"use client";

import { useState } from "react";
import { uploadApi, attachmentsApi } from "@/lib/api";
import { Attachment } from "@/lib/types";

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (
    noteId: string,
    file: File
  ): Promise<Attachment> => {
    setIsUploading(true);
    setProgress(0);

    try {
      // Step 1: Get pre-signed URL
      setProgress(20);
      const { uploadUrl, fileKey } = await uploadApi.getUploadUrl(
        noteId,
        file.name,
        file.type
      );

      // Step 2: Upload directly to S3
      setProgress(50);
      await uploadApi.uploadFile(uploadUrl, file);

      // Step 3: Create attachment record
      setProgress(80);
      const attachment = await attachmentsApi.create(noteId, {
        fileName: file.name,
        fileKey,
        fileSize: file.size,
        contentType: file.type,
      });

      setProgress(100);
      return attachment;
    } finally {
      setIsUploading(false);
      setProgress(0);
    }
  };

  return { uploadFile, isUploading, progress };
}
