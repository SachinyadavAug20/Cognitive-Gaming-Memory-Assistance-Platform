"use client";

import { INTEREST_OPTIONS, LANGUAGE_OPTIONS } from "@/types/intake";
import type { LifeStory, LifeEvent } from "@/types/intake";

interface StepLifeStoryProps {
  data: LifeStory;
  errors: Record<string, string>;
  onChange: (field: string, value: string | string[] | LifeEvent[]) => void;
}

export function StepLifeStory({ data, errors, onChange }: StepLifeStoryProps) {
  const toggleInterest = (interest: string) => {
    const current = data.interests;
    const updated = current.includes(interest)
      ? current.filter((i) => i !== interest)
      : [...current, interest];
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
      <div className="text-center space-y-1">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl md:text-3xl font-bold text-ink">
          Life Story & Interests
        </h2>
        <p className="text-ink-secondary text-base">
          These details help us create personalized games and reminiscence activities.
        </p>
      </div>

      {/* Occupation */}
      <div>
        <label htmlFor="occupation" className="block font-bold text-ink mb-1.5">
          Occupation
        </label>
        <input
          id="occupation"
          type="text"
          value={data.occupation}
          onChange={(e) => onChange("occupation", e.target.value)}
          placeholder="e.g., School teacher, farmer"
          className="w-full min-h-[56px] px-4 rounded-xl border-3 border-border-soft bg-surface text-ink text-lg font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors"
        />
      </div>

      {/* Life Events */}
      <div>
        <label className="block font-bold text-ink mb-1.5">
          Key Life Events
        </label>
        <div className="space-y-2">
          {data.lifeEvents.map((event, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input
                type="text"
                value={event.event}
                onChange={(e) => updateLifeEvent(i, "event", e.target.value)}
                placeholder="Event"
                className="flex-1 min-h-[48px] px-3 rounded-lg border-3 border-border-soft bg-surface text-ink font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors"
              />
              <input
                type="text"
                value={event.year}
                onChange={(e) => updateLifeEvent(i, "year", e.target.value)}
                placeholder="Year"
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
            + Add Life Event
          </button>
        </div>
      </div>

      {/* Interests */}
      <div>
        <label className="block font-bold text-ink mb-1.5">
          Interests & Hobbies
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Interests">
          {INTEREST_OPTIONS.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`min-h-[48px] px-4 rounded-xl border-3 font-bold transition-all ${
                data.interests.includes(interest)
                  ? "bg-terracotta text-white border-border"
                  : "bg-surface text-ink border-border-soft hover:border-border hover:bg-surface-muted"
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Favorite Music */}
      <div>
        <label htmlFor="music" className="block font-bold text-ink mb-1.5">
          Favorite Music or Artists
        </label>
        <input
          id="music"
          type="text"
          value={data.favoriteMusic}
          onChange={(e) => onChange("favoriteMusic", e.target.value)}
          placeholder="e.g., Bhupen Hazarika songs"
          className="w-full min-h-[56px] px-4 rounded-xl border-3 border-border-soft bg-surface text-ink text-lg font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors"
        />
      </div>

      {/* Cultural Background */}
      <div>
        <label htmlFor="culture" className="block font-bold text-ink mb-1.5">
          Cultural Background
        </label>
        <input
          id="culture"
          type="text"
          value={data.culturalBackground}
          onChange={(e) => onChange("culturalBackground", e.target.value)}
          placeholder="e.g., Assamese, Bihu traditions"
          className="w-full min-h-[56px] px-4 rounded-xl border-3 border-border-soft bg-surface text-ink text-lg font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors"
        />
      </div>

      {/* Preferred Language */}
      <div>
        <label className="block font-bold text-ink mb-1.5">
          Preferred Language <span className="text-brick">*</span>
        </label>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Preferred language">
          {LANGUAGE_OPTIONS.map((lang) => (
            <button
              key={lang.code}
              type="button"
              role="radio"
              aria-checked={data.preferredLanguage === lang.code}
              onClick={() => onChange("preferredLanguage", lang.code)}
              className={`min-h-[56px] px-5 rounded-xl border-3 font-bold text-lg transition-all ${
                data.preferredLanguage === lang.code
                  ? "bg-marigold text-white border-border"
                  : "bg-surface text-ink border-border-soft hover:border-border hover:bg-surface-muted"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
        {errors.preferredLanguage && (
          <p role="alert" className="mt-1 text-brick text-sm font-bold">
            {errors.preferredLanguage}
          </p>
        )}
      </div>

      {/* Joy Note */}
      <div>
        <label htmlFor="joy" className="block font-bold text-ink mb-1.5">
          What brings them joy?
        </label>
        <textarea
          id="joy"
          value={data.joyNote}
          onChange={(e) => onChange("joyNote", e.target.value)}
          placeholder="e.g., She lights up when looking at old family photos..."
          rows={3}
          className="w-full px-4 rounded-xl border-3 border-border-soft bg-surface text-ink text-lg font-medium placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors resize-none"
        />
      </div>
    </div>
  );
}
