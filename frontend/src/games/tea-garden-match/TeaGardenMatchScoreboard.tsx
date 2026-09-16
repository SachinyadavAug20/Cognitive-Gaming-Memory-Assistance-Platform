"use client";

import React from "react";
import { HelpCircle } from "lucide-react";

interface TeaGardenMatchScoreboardProps {
  locale: string;
  matchesCount: number;
  goalMatches: number;
  progressPct: number;
  isProcessing: boolean;
  onManualHint: () => void;
  comboBanner: string | null;
}

export function TeaGardenMatchScoreboard({
  locale,
  matchesCount,
  goalMatches,
  progressPct,
  isProcessing,
  onManualHint,
  comboBanner,
}: TeaGardenMatchScoreboardProps) {
  return (
    <>
      <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-3 shadow-[3px_3px_0px_#000] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl select-none">🧺</span>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-ink leading-tight">
                {locale === "as" ? "চাহ সংগ্ৰহ" : locale === "hi" ? "चाय संग्रह" : "Tea Harvest Goal"}
              </h2>
              <span className="text-xs font-bold text-ink-secondary">
                {matchesCount} / {goalMatches} {locale === "as" ? "সংগ্ৰহ হ'ল" : "collected"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onManualHint}
            disabled={isProcessing}
            className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-amber-200 hover:bg-amber-300 px-3 py-1.5 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>{locale === "as" ? "সহায়" : locale === "hi" ? "संकेत" : "Hint"}</span>
          </button>
        </div>

        <div className="w-full h-3 rounded-full bg-black/10 overflow-hidden border border-black/20">
          <div
            className="h-full bg-emerald-600 transition-all duration-500 rounded-full shadow-inner"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {comboBanner && (
        <div className="py-1.5 px-4 rounded-xl border-2 border-amber-600 bg-amber-100 text-amber-950 font-black text-xs sm:text-sm text-center shadow-md animate-bounce">
          {comboBanner}
        </div>
      )}
    </>
  );
}
