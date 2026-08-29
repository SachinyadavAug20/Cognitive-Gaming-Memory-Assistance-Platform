"use client";

import { useTranslations } from "next-intl";
import { StepHeader } from "./StepHeader";
import { Field, INPUT_CLASS } from "./Field";
import { SelectChip } from "./SelectChip";
import { LANGUAGE_OPTIONS } from "@/types/intake";
import type { LifeStory, LifeEvent } from "@/types/intake";

const INTEREST_KEYS = ["music", "sports", "cooking", "gardening", "reading", "travel", "religious", "art", "other"] as const;

interface StepLifeStoryProps {
  data: LifeStory;
  errors: Record<string, string>;
  onChange: (field: string, value: string | string[] | LifeEvent[]) => void;
}

export function StepLifeStory({ data, errors, onChange }: StepLifeStoryProps) {
  const t = useTranslations("intake.life");
  const tInterest = useTranslations("options.interests");

  const toggleInterest = (interest: string) => {
    const updated = data.interests.includes(interest)
      ? data.interests.filter((i) => i !== interest)
      : [...data.interests, interest];
    onChange("interests", updated);
  };

  const addLifeEvent = () => {
    onChange("lifeEvents", [...data.lifeEvents, { event: "", year: "" }]);
  };

  const updateLifeEvent = (index: number, field: string, value: string) => {
    const updated = data.lifeEvents.map((e, i) =>
      i === index ? { ...e, [field]: value } : e
    );
    onChange("lifeEvents", updated);
  };

  const removeLifeEvent = (index: number) => {
    const updated = data.lifeEvents.filter((_, i) => i !== index);
    onChange("lifeEvents", updated);
  };

  return (
    <div className="space-y-6">
      <StepHeader title={t("title")} subtitle={t("subtitle")} />

      <Field label={t("occupation.label")} htmlFor="occupation">
        <input
          id="occupation"
          type="text"
          value={data.occupation}
          onChange={(e) => onChange("occupation", e.target.value)}
          placeholder={t("occupation.placeholder")}
          className={INPUT_CLASS}
        />
      </Field>

      {/* Life Events */}
      <div>
        <label className="block font-bold text-ink mb-1.5">{t("events.label")}</label>
        <div className="space-y-2">
          {data.lifeEvents.map((event, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={event.event}
                onChange={(e) => updateLifeEvent(i, "event", e.target.value)}
                placeholder={t("events.event.placeholder")}
                className="flex-1 min-h-[48px] px-3 rounded-lg border-3 border-border-soft bg-surface text-ink font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors"
              />
              <input
                type="text"
                value={event.year}
                onChange={(e) => updateLifeEvent(i, "year", e.target.value)}
                placeholder={t("events.year.placeholder")}
                className="w-24 min-h-[48px] px-3 rounded-lg border-3 border-border-soft bg-surface text-ink font-medium text-center placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors"
              />
              <button
                onClick={() => removeLifeEvent(i)}
                className="w-10 h-10 rounded-lg bg-brick-light text-brick border-2 border-brick font-bold text-lg hover:bg-brick hover:text-white transition-colors flex items-center justify-center flex-shrink-0"
                aria-label={`Remove ${event.event}`}
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addLifeEvent}
            className="w-full min-h-[48px] rounded-lg border-3 border-dashed border-border-soft bg-surface text-ink-secondary font-bold text-sm hover:border-border hover:bg-surface-muted transition-colors"
          >
            {t("events.add")}
          </button>
        </div>
      </div>

      <Field label={t("interests")}>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Interests">
          {INTEREST_KEYS.map((key) => (
            <SelectChip
              key={key}
              label={tInterest(key)}
              selected={data.interests.includes(key)}
              tone="terracotta"
              onClick={() => toggleInterest(key)}
            />
          ))}
        </div>
      </Field>

      <Field label={t("music.label")} htmlFor="music">
        <input
          id="music"
          type="text"
          value={data.favoriteMusic}
          onChange={(e) => onChange("favoriteMusic", e.target.value)}
          placeholder={t("music.placeholder")}
          className={INPUT_CLASS}
        />
      </Field>

      <Field label={t("culture.label")} htmlFor="culture">
        <input
          id="culture"
          type="text"
          value={data.culturalBackground}
          onChange={(e) => onChange("culturalBackground", e.target.value)}
          placeholder={t("culture.placeholder")}
          className={INPUT_CLASS}
        />
      </Field>

      <Field label={t("language")} error={errors.preferredLanguage} required>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Preferred language">
          {LANGUAGE_OPTIONS.map((lang) => (
            <SelectChip
              key={lang.code}
              label={lang.label}
              selected={data.preferredLanguage === lang.code}
              tone="marigold"
              onClick={() => onChange("preferredLanguage", lang.code)}
            />
          ))}
        </div>
      </Field>

      <Field label={t("joy.label")} htmlFor="joy">
        <textarea
          id="joy"
          value={data.joyNote}
          onChange={(e) => onChange("joyNote", e.target.value)}
          placeholder={t("joy.placeholder")}
          rows={3}
          className={`${INPUT_CLASS} min-h-[80px] resize-none`}
        />
      </Field>
    </div>
  );
}
