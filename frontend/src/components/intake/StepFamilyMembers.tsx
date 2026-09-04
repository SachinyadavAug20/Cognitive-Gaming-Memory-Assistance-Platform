"use client";

import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { StepHeader } from "./StepHeader";
import { DynamicList } from "./DynamicList";
import { SelectChip } from "./SelectChip";
import { PhotoPicker } from "./PhotoPicker";
import { useCallback } from "react";
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
      <StepHeader title={t("title")} subtitle={t("subtitle")} />

      {errors.relatives && (
        <p role="alert" className="text-brick text-sm font-bold text-center">
          {errors.relatives}
        </p>
      )}

      <DynamicList
        items={data}
        onAdd={onAdd}
        onRemove={onRemove}
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
  const tName = useTranslations("intake.family.name");
  const tNotes = useTranslations("intake.family.notes");
  const tRel = useTranslations("options.relativeRelationship");
  const tFamily = useTranslations("intake.family");

  const handlePhoto = useCallback(
    (_file: File, dataUrl: string) => {
      onUpdate({ ...relative, photoUrl: dataUrl, fileRef: _file });
    },
    [relative, onUpdate]
  );

  const handleClearPhoto = useCallback(() => {
    if (relative.photoUrl?.startsWith("blob:")) URL.revokeObjectURL(relative.photoUrl);
    onUpdate({ ...relative, photoUrl: "", fileRef: undefined });
  }, [relative, onUpdate]);

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-4">
        <PhotoPicker
          preview={relative.photoUrl || null}
          size="lg"
          onPick={handlePhoto}
          onClearPhoto={handleClearPhoto}
          label={`${relative.name || tFamily("title")}`}
        />

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
              <SelectChip
                key={key}
                label={tRel(key)}
                selected={relative.relationship === key}
                tone="tea"
                size="sm"
                onClick={() => onUpdate({ ...relative, relationship: key })}
              />
            ))}
          </div>
        </div>
      </div>

      <input
        type="text"
        value={relative.notes}
        onChange={(e) => onUpdate({ ...relative, notes: e.target.value })}
        placeholder={tNotes("placeholder")}
        className="w-full min-h-[48px] px-3 rounded-lg border-3 border-border-soft bg-surface text-ink text-sm font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors"
      />

      <button
        type="button"
        onClick={onRemove}
        className="w-full min-h-[48px] rounded-lg border-2 border-brick-light bg-brick-light text-brick font-bold text-sm hover:bg-brick hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
      >
        <Trash2 className="w-4 h-4" />
        <span>{tFamily("remove")}</span>
      </button>
    </div>
  );
}
