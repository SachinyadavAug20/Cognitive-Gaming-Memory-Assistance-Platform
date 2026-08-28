"use client";

import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { DynamicList } from "./DynamicList";
import type { Relative } from "@/types/intake";

const REL_KEYS = ["daughter", "son", "spouse", "grandchild", "sibling", "friend", "other"] as const;

interface StepFamilyMembersProps {
  data: Relative[];
  errors: Record<string, string>;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onUpdate: (index: number, item: Relative) => void;
}

export function StepFamilyMembers({
  data,
  errors,
  onAdd,
  onRemove,
  onUpdate,
}: StepFamilyMembersProps) {
  const t = useTranslations("intake.family");

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl md:text-3xl font-bold text-ink">
          {t("title")}
        </h2>
        <p className="text-ink-secondary text-base">
          {t("subtitle")}
        </p>
      </div>

      {errors.relatives && (
        <p role="alert" className="text-brick text-sm font-bold text-center">
          {errors.relatives}
        </p>
      )}

      <DynamicList
        items={data}
        onAdd={onAdd}
        onRemove={onRemove}
        onUpdate={onUpdate}
        minItems={1}
        addLabel={t("add")}
        emptyMessage={t("empty")}
        renderItem={(relative, index) => (
          <RelativeCard
            relative={relative}
            onRemove={() => onRemove(index)}
            onUpdate={(updated) => onUpdate(index, updated)}
          />
        )}
      />
    </div>
  );
}

function RelativeCard({
  relative,
  onRemove,
  onUpdate,
}: {
  relative: Relative;
  onRemove: () => void;
  onUpdate: (r: Relative) => void;
}) {
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    relative.photoUrl || null
  );
  const tName = useTranslations("intake.family.name");
  const tNotes = useTranslations("intake.family.notes");
  const tRel = useTranslations("options.relativeRelationship");
  const tFamily = useTranslations("intake.family");

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
        onUpdate({ ...relative, photoUrl: dataUrl, fileRef: file });
      };
      reader.readAsDataURL(file);
    },
    [relative, onUpdate]
  );

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        {/* Photo upload */}
        <label
          className="flex-shrink-0 cursor-pointer"
          aria-label={`Upload photo for ${relative.name || "family member"}`}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="sr-only"
          />
          <div
            className={`w-20 h-20 rounded-xl border-3 flex items-center justify-center text-3xl transition-all ${
              photoPreview
                ? "border-tea overflow-hidden"
                : "border-dashed border-border-soft bg-surface-muted hover:border-border"
            }`}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt={`Photo of ${relative.name}`}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              "📷"
            )}
          </div>
        </label>

        {/* Name and relationship */}
        <div className="flex-1 space-y-2">
          <input
            type="text"
            value={relative.name}
            onChange={(e) => onUpdate({ ...relative, name: e.target.value })}
            placeholder={tName("placeholder")}
            className="w-full min-h-[48px] px-3 rounded-lg border-3 border-border-soft bg-surface text-ink font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors"
          />

          <div className="flex flex-wrap gap-1.5">
            {REL_KEYS.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => onUpdate({ ...relative, relationship: key })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                  relative.relationship === key
                    ? "bg-tea text-white border-tea"
                    : "bg-surface text-ink-secondary border-border-soft hover:border-border"
                }`}
              >
                {tRel(key)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes */}
      <input
        type="text"
        value={relative.notes}
        onChange={(e) => onUpdate({ ...relative, notes: e.target.value })}
        placeholder={tNotes("placeholder")}
        className="w-full min-h-[48px] px-3 rounded-lg border-3 border-border-soft bg-surface text-ink text-sm font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors"
      />

      {/* Remove button */}
      <button
        type="button"
        onClick={onRemove}
        className="w-full min-h-[48px] rounded-lg border-2 border-brick-light bg-brick-light text-brick font-bold text-sm hover:bg-brick hover:text-white transition-colors flex items-center justify-center gap-2"
      >
        ✕ {tFamily("remove")}
      </button>
    </div>
  );
}
