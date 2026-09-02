"use client";

import { useState, useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { speakText, unlockAudio } from "@/lib/sound";

interface AudioPromptProps {
  text: string;
  lang?: string;
  label?: string;
  size?: "md" | "lg";
}

export function AudioPrompt({
  text,
  lang,
  label = "Speak",
  size = "lg",
}: AudioPromptProps) {
  const locale = useLocale();
  const t = useTranslations("games");
  const [speaking, setSpeaking] = useState(false);

  const speak = useCallback(() => {
    unlockAudio();
    speakText(
      text,
      lang || locale,
      0.82,
      () => setSpeaking(true),
      () => setSpeaking(false)
    );
  }, [text, lang, locale]);

  const sizes = {
    md: "text-base px-5 py-3 min-h-[56px] rounded-xl",
    lg: "text-lg px-6 py-4 min-h-[64px] rounded-xl",
  };

  return (
    <button
      type="button"
      onClick={speak}
      className={`btn-tactile bg-surface text-ink border-border inline-flex items-center gap-3 font-bold cursor-pointer ${sizes[size]} ${
        speaking
          ? "ring-4 ring-marigold/70 animate-pulse border-2 border-marigold"
          : ""
      }`}
      aria-label={label}
    >
      <span className="flex items-center gap-0.5">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-6 h-6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 010 7.07" />
          <path d="M19.07 4.93a10 10 0 010 14.14" />
        </svg>
        {speaking && (
          <span className="flex items-end gap-[2px] h-5 ml-1">
            {[1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="w-[3px] bg-terracotta rounded-full speak-bar"
              />
            ))}
          </span>
        )}
      </span>
      {speaking ? t("listening") : label}
    </button>
  );
}
