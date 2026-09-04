"use client";

import type { LifeStoryData } from "@/types";
import { BookOpen, Music, Sparkles, Lightbulb } from "lucide-react";
import { useTranslations } from "next-intl";

interface PatientLifeStoryCardProps {
  life: LifeStoryData | null | undefined;
  joyTriggers?: string | null;
}

export function PatientLifeStoryCard({ life, joyTriggers }: PatientLifeStoryCardProps) {
  const t = useTranslations("patientDetail");

  return (
    <div className="scrapbook-card">
      <div className="border-b-2 border-border-soft pb-4 mb-5">
        <h2 className="flex items-center gap-2 font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink">
          <BookOpen className="h-6 w-6 text-tea" />
          <span>{t("lifeStory.title")}</span>
        </h2>
        <p className="text-sm text-ink-secondary mt-0.5">
          {t("lifeStory.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Career & Hobbies */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
              {t("lifeStory.occupation")}
            </h3>
            <p className="font-bold text-ink text-base">
              {life?.occupation || t("lifeStory.occupationFallback")}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1.5">
              {t("lifeStory.music")}
            </h3>
            <div className="flex items-center gap-2 bg-surface-muted/70 p-3 rounded-xl border border-border-soft text-sm text-ink font-medium">
              <Music className="h-4 w-4 text-tea shrink-0" />
              <span>{life?.favoriteMusic || t("lifeStory.musicFallback")}</span>
            </div>
          </div>

          {life?.hobbies && life.hobbies.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-2">
                {t("lifeStory.hobbies")}
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
              <Sparkles className="h-4 w-4 text-marigold" />
              <span>{t("lifeStory.joyTriggers")}</span>
            </h3>
            <p className="text-ink text-sm leading-relaxed font-medium">
              {joyTriggers ||
                t("lifeStory.joyFallback")}
            </p>
            <div className="mt-3 pt-3 border-t border-marigold/30 text-[11px] font-bold text-ink-secondary flex items-start gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-tea shrink-0 mt-0.5" />
              <span>{t("lifeStory.tip")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Life Milestones Timeline */}
      {life?.lifeEvents && life.lifeEvents.length > 0 && (
        <div className="pt-4 border-t-2 border-border-soft">
          <h3 className="font-bold text-base text-ink mb-4">
            {t("lifeStory.milestones")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {life.lifeEvents.map((ev, idx) => (
              <div
                key={idx}
                className="bg-surface-muted/60 p-3.5 rounded-xl border-2 border-border-soft flex flex-col justify-between"
              >
                <span className="text-xs font-black text-marigold-dark uppercase tracking-wider">
                  {t("lifeStory.year", { year: ev.year })}
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
