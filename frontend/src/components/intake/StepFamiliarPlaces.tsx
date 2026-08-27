"use client";

import { useState, useCallback } from "react";
import { DynamicList } from "./DynamicList";
import { LANDMARK_EMOJIS } from "@/types/intake";
import type { LandmarkEntry } from "@/types/intake";

interface StepFamiliarPlacesProps {
  data: LandmarkEntry[];
  errors: Record<string, string>;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, item: LandmarkEntry) => void;
}

export function StepFamiliarPlaces({
  data,
  errors,
  onAdd,
  onRemove,
  onUpdate,
}: StepFamiliarPlacesProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl md:text-3xl font-bold text-ink">
          Familiar Places
        </h2>
        <p className="text-ink-secondary text-base">
          Add places the patient knows well. These are used in the Wayfinding game — the patient practices navigating routes through familiar locations.
        </p>
      </div>

      {errors.landmarks && (
        <p role="alert" className="text-brick text-sm font-bold text-center">
          {errors.landmarks}
        </p>
      )}

      <DynamicList
        items={data}
        onAdd={onAdd}
        onRemove={onRemove}
        onUpdate={onUpdate}
        minItems={3}
        addLabel="Add a Place"
        emptyMessage="Add at least 3 landmarks for the Wayfinding game."
        renderItem={(landmark, index) => (
          <LandmarkCard
            landmark={landmark}
            onUpdate={(updated) => onUpdate(index, updated)}
          />
        )}
      />
    </div>
  );
}

function LandmarkCard({
  landmark,
  onUpdate,
}: {
  landmark: LandmarkEntry;
  onUpdate: (l: LandmarkEntry) => void;
}) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    landmark.photoUrl || null
  );

  const handlePhoto = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        alert("Photo must be under 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPhotoPreview(dataUrl);
        onUpdate({ ...landmark, photoUrl: dataUrl, fileRef: file });
      };
      reader.readAsDataURL(file);
    },
    [landmark, onUpdate]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        {/* Photo */}
        <label className="flex-shrink-0 cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="sr-only"
          />
          <div
            className={`w-16 h-16 rounded-xl border-3 flex items-center justify-center text-2xl transition-all ${
              photoPreview
                ? "border-tea overflow-hidden"
                : "border-dashed border-border-soft bg-surface-muted hover:border-border"
            }`}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt={`Photo of ${landmark.name}`}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              "📷"
            )}
          </div>
        </label>

        {/* Name and description */}
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={landmark.name}
            onChange={(e) => onUpdate({ ...landmark, name: e.target.value })}
            placeholder="Place name (e.g., Kamakhya Temple)"
            className="w-full min-h-[48px] px-3 rounded-lg border-3 border-border-soft bg-surface text-ink font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors"
          />
          <input
            type="text"
            value={landmark.description}
            onChange={(e) => onUpdate({ ...landmark, description: e.target.value })}
            placeholder="Description (e.g., Where we pray every morning)"
            className="w-full min-h-[48px] px-3 rounded-lg border-3 border-border-soft bg-surface text-ink text-sm font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors"
          />
        </div>
      </div>

      {/* Emoji selector — inline scrollable row */}
      <div>
        <p className="text-xs font-bold text-ink-secondary mb-1.5 uppercase tracking-wider">
          Choose an icon
        </p>
        <div
          className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1"
          role="radiogroup"
          aria-label="Landmark icon"
        >
          {LANDMARK_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              role="radio"
              aria-checked={landmark.emoji === emoji}
              onClick={() => onUpdate({ ...landmark, emoji })}
              className={`flex-shrink-0 w-12 h-12 rounded-xl text-xl flex items-center justify-center border-3 transition-all ${
                landmark.emoji === emoji
                  ? "bg-marigold-light border-marigold scale-110"
                  : "bg-surface border-border-soft hover:border-border hover:bg-surface-muted"
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
