"use client";

import React, { useState } from "react";
import { HeartHandshake, ChevronDown, ChevronUp, Sparkles } from "lucide-react";

interface CaregiverCoPlayPromptProps {
  tip: string;
  className?: string;
}

/**
 * CaregiverCoPlayPrompt:
 * Based on Cognitive Stimulation Therapy (CST; Woods et al., Cochrane 2012).
 * Empowers family caregivers and ASHA healthcare workers to co-play with the elder,
 * prompting natural conversation, validation, and shared joy instead of isolated screen time.
 */
export function CaregiverCoPlayPrompt({ tip, className = "" }: CaregiverCoPlayPromptProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!tip) return null;

  return (
    <div
      className={`rounded-2xl border-2 border-amber-800/30 bg-[#FFFBEB] p-3 text-ink shadow-[2px_2px_0px_rgba(180,83,9,0.2)] transition-all ${className}`}
      role="region"
      aria-label="Caregiver Co-Play Guidance"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-200 border border-amber-700 text-amber-900">
            <HeartHandshake className="h-4 w-4" />
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-950">
            Caregiver / Family Co-Play Tip
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex h-6 w-6 items-center justify-center rounded-md border border-amber-900/20 text-amber-900 hover:bg-amber-100 transition-colors"
          title={isExpanded ? "Collapse tip" : "Expand tip"}
        >
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2 flex items-start gap-2 pt-2 border-t border-amber-800/15">
          <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-semibold text-amber-950 leading-relaxed">
            {tip}
          </p>
        </div>
      )}
    </div>
  );
}
