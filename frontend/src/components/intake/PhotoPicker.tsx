"use client";

import { useState, useCallback } from "react";

interface PhotoPickerProps {
  label?: string;
  preview: string | null;
  size?: "md" | "lg";
  onPick: (file: File, dataUrl: string) => void;
}

const SIZE_CLASSES: Record<string, string> = {
  md: "w-16 h-16 text-2xl",
  lg: "w-20 h-20 text-3xl",
};

export function PhotoPicker({ label, preview, size = "md", onPick }: PhotoPickerProps) {
  const [error, setError] = useState<string | null>(null);

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
      reader.onload = () => onPick(file, reader.result as string);
      reader.readAsDataURL(file);
    },
    [onPick]
  );

  return (
    <div className="flex-shrink-0">
      {label && (
        <p className="text-xs font-bold text-ink-secondary mb-1 uppercase tracking-wider">
          {label}
        </p>
      )}
      <label
        className={`flex-shrink-0 cursor-pointer rounded-xl border-3 flex items-center justify-center transition-all overflow-hidden ${
          SIZE_CLASSES[size]
        } ${
          preview
            ? "border-tea"
            : "border-dashed border-border-soft bg-surface-muted hover:border-border"
        }`}
        aria-label={label || "Upload photo"}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="sr-only"
        />
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <span>📷</span>
        )}
      </label>
      {error && (
        <p role="alert" className="mt-1 text-brick text-xs font-bold">{error}</p>
      )}
    </div>
  );
}
