"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { FileText, Image as ImageIcon, Check } from "lucide-react";
import { useTranslations } from "next-intl";

interface FileUploadZoneProps {
  accept: string;
  maxSizeMB: number;
  label: string;
  description: string;
  onFileSelect: (file: File | null) => void;
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
  const t = useTranslations("intake");
  const tc = useTranslations("common");

  const validateFile = useCallback(
    (file: File): string | null => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        return t("fileUpload.tooLarge", { maxSizeMB });
      }
      if (accept === ".pdf" && file.type !== "application/pdf") {
        return t("fileUpload.pdfOnly");
      }
      if (accept === "image/*" && !file.type.startsWith("image/")) {
        return t("fileUpload.imageOnly");
      }
      return null;
    },
    [accept, maxSizeMB, t]
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
            <p className="font-bold text-ink text-lg">{tc("analyzing.label")}</p>
            <p className="text-ink-secondary text-sm">{tc("analyzing.desc")}</p>
          </>
        ) : currentFile ? (
          <>
            {preview && isPdf ? (
              <FileText className="w-10 h-10 text-tea" />
            ) : preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={preview}
                alt={t("fileUpload.preview")}
                className="w-20 h-20 rounded-xl object-cover border-2 border-border"
              />
            ) : isPdf ? (
              <FileText className="w-10 h-10 text-tea" />
            ) : (
              <ImageIcon className="w-10 h-10 text-tea" />
            )}
            <p className="font-bold text-ink">{currentFile.name}</p>
            <p className="text-sm text-ink-secondary">
              {(currentFile.size / 1024 / 1024).toFixed(1)}MB
            </p>
            <p className="text-sm text-tea font-bold inline-flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>{t("fileUpload.uploadedReplace")}</span>
            </p>
          </>
        ) : (
          <>
            {isPdf ? <FileText className="w-12 h-12 text-ink-secondary/60" /> : <ImageIcon className="w-12 h-12 text-ink-secondary/60" />}
            <p className="font-bold text-ink text-lg">{label}</p>
            <p className="text-ink-secondary text-sm text-center">{description}</p>
            <p className="text-xs text-ink-secondary/60 mt-1">
              {tc("maxSize", { size: maxSizeMB })} • {isPdf ? tc("pdfOnly") : tc("imagesOnly")}
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
