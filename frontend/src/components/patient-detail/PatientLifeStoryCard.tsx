"use client";

import type { LifeStoryData } from "@/types";

interface PatientLifeStoryCardProps {
  life: LifeStoryData | null | undefined;
  joyTriggers?: string | null;
}

export function PatientLifeStoryCard({ life, joyTriggers }: PatientLifeStoryCardProps) {
  return (
    <div className="scrapbook-card">
      <div className="border-b-2 border-border-soft pb-4 mb-5">
        <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink">
          📖 Life Story & Cognitive Personalization
        </h2>
        <p className="text-sm text-ink-secondary mt-0.5">
          Career, music, hobbies, and emotional calming cues
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Career & Hobbies */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
              Occupation & Background
            </h3>
            <p className="font-bold text-ink text-base">
              {life?.occupation || "Not specified"}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1.5">
              Favorite Music & Audio Cues
            </h3>
            <div className="bg-surface-muted/70 p-3 rounded-xl border border-border-soft text-sm text-ink font-medium">
              🎵 {life?.favoriteMusic || "Traditional folk & gospel melodies"}
            </div>
          </div>

          {life?.hobbies && life.hobbies.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-2">
                Hobbies & Interests
              </h3>
              <div className="flex flex-wrap gap-2">
                {life.hobbies.map((h, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl bg-terracotta-light text-terracotta border border-terracotta/30 text-xs font-bold"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Joy Triggers Box */}
        <div>
          <div className="rounded-2xl bg-marigold-light border-3 border-marigold p-5 shadow-[3px_3px_0px_var(--color-marigold)]">
            <h3 className="font-[family-name:var(--font-serif)] font-bold text-base text-ink mb-2 flex items-center gap-2">
              <span>🌟</span> Joy Triggers & Calming Cues
            </h3>
            <p className="text-ink text-sm leading-relaxed font-medium">
              {joyTriggers ||
                "Listening to familiar church hymns, sitting in the morning sun, and looking at family photo albums."}
            </p>
            <div className="mt-3 pt-3 border-t border-marigold/30 text-[11px] font-bold text-ink-secondary">
              💡 Tip: Use these topics to soothe agitation or prompt joyful recall during exercises.
            </div>
          </div>
        </div>
      </div>

      {/* Life Milestones Timeline */}
      {life?.lifeEvents && life.lifeEvents.length > 0 && (
        <div className="pt-4 border-t-2 border-border-soft">
          <h3 className="font-bold text-base text-ink mb-4">
            Key Life Milestones & Timeline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {life.lifeEvents.map((ev, idx) => (
              <div
                key={idx}
                className="bg-surface-muted/60 p-3.5 rounded-xl border-2 border-border-soft flex flex-col justify-between"
              >
                <span className="text-xs font-black text-marigold-dark uppercase tracking-wider">
                  Year {ev.year}
                </span>
                <p className="font-bold text-sm text-ink mt-1">
                  {ev.event}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
