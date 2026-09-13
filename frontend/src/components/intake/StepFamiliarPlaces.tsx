"use client";

import { useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
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

const LANDMARK_ICON_LABELS: Record<string, Record<string, string>> = {
  home: {
    en: "Home", as: "ঘৰ", hi: "घर", bn: "বাড়ি", mr: "घर", ne: "घर", mni: "য়ুম", brx: "न'", grt: "Nok", kha: "Iing", lus: "In"
  },
  market: {
    en: "Market", as: "বজাৰ", hi: "बाज़ार", bn: "বাজার", mr: "बाजार", ne: "बजार", mni: "কৈথেল", brx: "बाजार", grt: "Bazaar", kha: "Iew", lus: "Bazar"
  },
  temple: {
    en: "Temple / Worship", as: "নামঘৰ / মন্দিৰ", hi: "मंदिर / पूजा स्थल", bn: "মন্দির / উপাসনালয়", mr: "मंदिर / पूजा स्थान", ne: "मन्दिर / पूजा स्थल", mni: "লাইশং", brx: "थान / मन्दिर", grt: "Gilja Nok", kha: "Manoir", lus: "Biakin"
  },
  clinic: {
    en: "Clinic / Hospital", as: "চিকিৎসালয় / ক্লিনিক", hi: "अस्पताल / क्लिनिक", bn: "হাসপাতাল / ক্লিনিক", mr: "दवाखाना / रुग्णालय", ne: "अस्पताल / क्लिनिक", mni: "হিদাকফম / লায়েশং", brx: "फाहामथायसाली", grt: "Sam Nok", kha: "Phaidaw", lus: "Damdawi In"
  },
  school: {
    en: "School", as: "বিদ্যালয়", hi: "स्कूल / विद्यालय", bn: "বিদ্যালয়", mr: "शाळा", ne: "विद्यालय", mni: "লাইরিক তমহংবা", brx: "फरायसाली", grt: "School", kha: "Skul", lus: "Sikulpui"
  },
  park: {
    en: "Park / Garden", as: "উদ্যান / ফুলনি", hi: "पार्क / बगीचा", bn: "পার্ক / বাগান", mr: "उद्यान / बाग", ne: "पार्क / बगैँचा", mni: "লৈকোল", brx: "पार्क / बागां", grt: "Bagan", kha: "Kper", lus: "Huan"
  },
  bus: {
    en: "Bus / Transit", as: "বাছ আস্থান", hi: "बस स्टॉप", bn: "বাস স্টপ", mr: "बस थांबा", ne: "बस स्टेसन", mni: "বস ষ্টপ", brx: "बास थासारि", grt: "Bus Station", kha: "Bus Stand", lus: "Bus Stand"
  },
  store: {
    en: "Store / Shop", as: "দোকান", hi: "दुकान", bn: "দোকান", mr: "दुकान", ne: "पसल", mni: "দুকান", brx: "दुकान", grt: "Dokkan", kha: "Dukan", lus: "Dawr"
  },
  hills: {
    en: "Hills / Scenic", as: "পাহাৰ / প্ৰকৃতি", hi: "पहाड़ / प्राकृतिक", bn: "পাহাড় / মনোরম", mr: "टेकडी / निसर्ग", ne: "डाँडा / पहाड", mni: "চিংশাং", brx: "हाजो / मिथिंगा", grt: "A·bri", kha: "Lum", lus: "Tlang"
  },
  lake: {
    en: "Lake / River", as: "নৈ / পুখুৰী", hi: "झील / नदी", bn: "হ্রদ / নদী", mr: "तलाव / नदी", ne: "ताल / नदी", mni: "লমপাক / তুরেল", brx: "दोलं / दैसा", grt: "Chiring", kha: "Wah", lus: "Tuipui / Dil"
  },
};

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
  const locale = useLocale();
  const normLoc = locale?.split("-")[0]?.toLowerCase() || "en";

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
            const locLabel = LANDMARK_ICON_LABELS[item.id]?.[normLoc] || item.label;

            return (
              <button
                key={item.id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => onUpdate({ ...landmark, emoji: item.id })}
                title={locLabel}
                aria-label={locLabel}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-xl border-3 transition-all cursor-pointer ${
                  isSelected
                    ? "bg-marigold-light border-marigold scale-105 text-ink font-bold shadow-xs"
                    : "bg-surface border-border-soft hover:border-border hover:bg-surface-muted text-ink-secondary"
                }`}
              >
                <IconComp className="h-5 w-5 stroke-[2.2]" />
                <span className="text-[9px] font-bold mt-1 line-clamp-1">{locLabel.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
