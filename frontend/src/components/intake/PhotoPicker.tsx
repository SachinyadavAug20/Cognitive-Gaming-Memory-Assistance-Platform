"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getMediaUrl } from "@/lib/api";

interface PhotoPickerProps {
  label?: string;
  preview: string | null;
  size?: "md" | "lg";
  onPick: (file: File, dataUrl: string) => void;
  onClearPhoto?: () => void;
}

const SIZE_CLASSES: Record<string, string> = {
  md: "w-20 h-20",
  lg: "w-24 h-24",
};

export function PhotoPicker({
  label,
  preview,
  size = "md",
  onPick,
  onClearPhoto,
}: PhotoPickerProps) {
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resolvedPreview = getMediaUrl(preview);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setError(null);

      if (file.size > 5 * 1024 * 1024) {
        setError("Photo must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        onPick(file, reader.result as string);
        setViewerOpen(false);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    },
    [onPick]
  );

  const clearPhoto = useCallback(() => {
    setViewerOpen(false);
    onClearPhoto?.();
  }, [onClearPhoto]);

  useEffect(() => {
    if (!viewerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setViewerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerOpen]);

  return (
    <div className="flex-shrink-0">
      {label && (
        <p className="text-xs font-bold text-ink-secondary mb-1 uppercase tracking-wider">
          {label}
        </p>
      )}

      {resolvedPreview ? (
        <div className="group relative w-fit">
          <button
            type="button"
            onClick={() => setViewerOpen(true)}
            aria-label={label ? `View photo for ${label}` : "View photo"}
            title="View photo"
            className={`relative block cursor-pointer rounded-xl border-3 border-tea overflow-hidden transition-all hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-marigold ${SIZE_CLASSES[size]}`}
          >
            <img
              src={resolvedPreview}
              alt={label || "Photo preview"}
              className="w-full h-full object-cover"
            />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/50 text-white text-xs font-bold opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              🔍 View
            </span>
          </button>

          <button
            type="button"
            onClick={clearPhoto}
            aria-label="Remove photo"
            title="Remove photo"
            className="absolute -top-2 -right-2 z-10 w-6 h-6 rounded-full bg-brick border-2 border-surface text-white text-xs font-bold leading-none flex items-center justify-center shadow-md hover:brightness-110 hover:scale-110 transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>
      ) : (
        <label
          className={`flex-shrink-0 cursor-pointer rounded-xl border-3 flex items-center justify-center transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-marigold ${SIZE_CLASSES[size]} border-dashed border-border-soft bg-surface-muted hover:border-border hover:bg-surface`}
          aria-label={label || "Upload photo"}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="sr-only"
          />
          <span>📷</span>
        </label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />

      {error && (
        <p role="alert" className="mt-1 text-brick text-xs font-bold">{error}</p>
      )}

      {viewerOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label ? `Photo: ${label}` : "Photo preview"}
          onClick={() => setViewerOpen(false)}
          className="lightbox-backdrop fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="lightbox-card relative w-full max-w-md bg-surface rounded-2xl shadow-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setViewerOpen(false)}
              aria-label="Close photo viewer"
              className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-ink/60 text-white text-base font-bold leading-none flex items-center justify-center hover:bg-ink transition-colors cursor-pointer"
            >
              ✕
            </button>

            <img
              src={resolvedPreview ?? undefined}
              alt={label || "Photo preview"}
              className="w-full aspect-square object-cover"
            />

            <div className="flex items-center gap-2 p-3">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex-1 min-h-[48px] px-4 rounded-xl border-2 border-tea bg-tea-light text-ink font-bold text-sm hover:bg-tea hover:text-white transition-colors cursor-pointer"
              >
                🔄 Change Photo
              </button>
              <button
                type="button"
                onClick={clearPhoto}
                className="min-h-[48px] px-4 rounded-xl border-2 border-brick-light bg-brick-light text-brick font-bold text-sm hover:bg-brick hover:text-white transition-colors cursor-pointer"
              >
                🗑 Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}