"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface FileUploadZoneProps {
  accept: string;
  maxSizeMB: number;
  label: string;
  description: string;
  onFileSelect: (file: File) => void;
  currentFile?: File | null;
  preview?: string;
  isProcessing?: boolean;
  error?: string;
}

export function FileUploadZone({
  accept,
  maxSizeMB,
  label,
  description,
  onFileSelect,
  currentFile,
  preview,
  isProcessing,
  error,
}: FileUploadZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        return `File is too large. Maximum size is ${maxSizeMB}MB.`;
      }
      if (accept === ".pdf" && file.type !== "application/pdf") {
        return "Please upload a PDF file.";
      }
      if (accept === "image/*" && !file.type.startsWith("image/")) {
        return "Please upload an image file.";
      }
      return null;
    },
    [accept, maxSizeMB]
  );

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        alert(validationError);
        return;
      }
      onFileSelect(file);
    },
    [validateFile, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const isPdf = accept === ".pdf";

  return (
    <div>
      <div
        ref={dropZoneRef}
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-describedby={error ? "upload-error" : undefined}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative cursor-pointer rounded-2xl border-4 border-dashed p-8
          transition-all duration-200 min-h-[140px] flex flex-col items-center justify-center gap-3
          ${isDragOver ? "border-marigold bg-marigold-light scale-[1.02]" : "border-border-soft bg-surface hover:border-border hover:bg-surface-muted"}
          ${currentFile ? "border-tea bg-tea-light" : ""}
          ${error ? "border-brick bg-brick-light" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />

        {isProcessing ? (
          <>
            <div className="w-10 h-10 border-4 border-marigold border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-ink text-lg">Analyzing report...</p>
            <p className="text-ink-secondary text-sm">This takes about 30 seconds</p>
          </>
        ) : currentFile ? (
          <>
            {preview && isPdf ? (
              <span className="text-4xl">📄</span>
            ) : preview ? (
              <img
                src={preview}
                alt="Preview"
                className="w-20 h-20 rounded-xl object-cover border-2 border-border"
              />
            ) : (
              <span className="text-4xl">{isPdf ? "📄" : "🖼️"}</span>
            )}
            <p className="font-bold text-ink">{currentFile.name}</p>
            <p className="text-sm text-ink-secondary">
              {(currentFile.size / 1024 / 1024).toFixed(1)}MB
            </p>
            <p className="text-sm text-tea font-bold">✓ Uploaded — click to replace</p>
          </>
        ) : (
          <>
            <span className="text-5xl">{isPdf ? "📄" : "🖼️"}</span>
            <p className="font-bold text-ink text-lg">{label}</p>
            <p className="text-ink-secondary text-sm text-center">{description}</p>
            <p className="text-xs text-ink-secondary/60 mt-1">
              Max {maxSizeMB}MB • {isPdf ? "PDF only" : "Images only"}
            </p>
          </>
        )}
      </div>

      {error && (
        <p id="upload-error" role="alert" className="mt-2 text-brick font-bold text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
