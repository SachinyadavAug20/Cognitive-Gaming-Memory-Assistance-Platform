"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { StepHeader } from "./StepHeader";
import { DynamicList } from "./DynamicList";
import { PhotoPicker } from "./PhotoPicker";
import {
  Home,
  ShoppingBag,
  Landmark,
  Building2,
  GraduationCap,
  Trees,
  Bus,
  Store,
  Mountain,
  Waves,
  MapPin,
} from "lucide-react";
import { LANDMARK_ICONS } from "@/types/intake";
import type { LandmarkEntry } from "@/types/intake";

const ICON_COMPONENTS: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  market: ShoppingBag,
  temple: Landmark,
  clinic: Building2,
  school: GraduationCap,
  park: Trees,
  bus: Bus,
  store: Store,
  hills: Mountain,
  lake: Waves,
};

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

      {/* Vector Icon selector */}
      <div>
        <p className="text-xs font-bold text-ink-secondary mb-1.5 uppercase tracking-wider">
          {tIcon("icon")}
        </p>
        <div
          className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1"
          role="radiogroup"
          aria-label={tIcon("icon")}
        >
          {LANDMARK_ICONS.map((item) => {
            const IconComp = ICON_COMPONENTS[item.id] || MapPin;
            const isSelected = landmark.emoji === item.id;

            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onUpdate({ ...landmark, emoji: item.id })}
                title={item.label}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl border-3 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-marigold-light border-marigold scale-105 text-ink font-bold shadow-xs"
                    : "bg-surface border-border-soft hover:border-border hover:bg-surface-muted text-ink-secondary"
                }`}
              >
                <IconComp className="h-5 w-5 stroke-[2.2]" />
                <span className="text-[9px] font-bold mt-1 line-clamp-1">{item.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
