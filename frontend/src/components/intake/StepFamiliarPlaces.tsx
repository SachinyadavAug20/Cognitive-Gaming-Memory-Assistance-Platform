"use client";

import { useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import { StepHeader } from "./StepHeader";
import { DynamicList } from "./DynamicList";
import { PhotoPicker } from "./PhotoPicker";
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
  const t = useTranslations("intake.places");

  return (
    <div className="space-y-6">
      <StepHeader title={t("title")} subtitle={t("subtitle")} />

      {errors.landmarks && (
        <p role="alert" className="text-brick text-sm font-bold text-center">
          {errors.landmarks}
        </p>
      )}

      <DynamicList
        items={data}
        onAdd={onAdd}
        onRemove={onRemove}
        minItems={3}
        addLabel={t("add")}
        emptyMessage={t("empty")}
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
  const tName = useTranslations("intake.places.name");
  const tDesc = useTranslations("intake.places.desc");
  const tIcon = useTranslations("intake.places");

  const handlePhoto = useCallback(
    (_file: File, dataUrl: string) => {
      onUpdate({ ...landmark, photoUrl: dataUrl, fileRef: _file });
    },
    [landmark, onUpdate]
  );

  const handleClearPhoto = useCallback(() => {
    if (landmark.photoUrl?.startsWith("blob:")) URL.revokeObjectURL(landmark.photoUrl);
    onUpdate({ ...landmark, photoUrl: "", fileRef: undefined });
  }, [landmark, onUpdate]);

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <PhotoPicker
          preview={landmark.photoUrl || null}
          size="md"
          onPick={handlePhoto}
          onClearPhoto={handleClearPhoto}
        />

        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={landmark.name}
            onChange={(e) => onUpdate({ ...landmark, name: e.target.value })}
            placeholder={tName("placeholder")}
            className="w-full min-h-[48px] px-3 rounded-lg border-3 border-border-soft bg-surface text-ink font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors"
          />
          <input
            type="text"
            value={landmark.description}
            onChange={(e) => onUpdate({ ...landmark, description: e.target.value })}
            placeholder={tDesc("placeholder")}
            className="w-full min-h-[48px] px-3 rounded-lg border-3 border-border-soft bg-surface text-ink text-sm font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors"
          />
        </div>
      </div>

      {/* Emoji selector */}
      <div>
        <p className="text-xs font-bold text-ink-secondary mb-1.5 uppercase tracking-wider">
          {tIcon("icon")}
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
