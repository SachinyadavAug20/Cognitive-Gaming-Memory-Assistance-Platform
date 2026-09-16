"use client";

import React from "react";
import { Image as ImageIcon, CheckCircle2, Sparkles, Volume2 } from "lucide-react";

interface RoutineActivityCardProps {
  activityDone: boolean;
  actTag: string;
  actTimeSub: string;
  actTitle: string;
  actDetail: string;
  actDone: string;
  actTapDo: string;
  listenAriaLabel: string;
  onToggleActivity: () => void;
  onSpeakActivity: () => void;
}

export function RoutineActivityCard({
  activityDone,
  actTag,
  actTimeSub,
  actTitle,
  actDetail,
  actDone,
  actTapDo,
  listenAriaLabel,
  onToggleActivity,
  onSpeakActivity,
}: RoutineActivityCardProps) {
  return (
    <div className="border-3 border-black rounded-3xl bg-[#FFFDF9] p-5 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between text-left transition-all">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-13 w-13 rounded-2xl border-2 border-black bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs shrink-0">
              <ImageIcon className="h-7 w-7 stroke-[2.5]" />
            </div>
            <div>
              <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-300 px-2.5 py-0.5 text-[11px] font-black uppercase text-amber-900 tracking-wider">
                {actTag}
              </span>
              <div className="text-xs font-bold text-ink-secondary mt-0.5">{actTimeSub}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onSpeakActivity}
            className="btn-tactile h-12 w-12 rounded-2xl border-2 border-black bg-white flex items-center justify-center text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-100 cursor-pointer active:scale-95 transition-transform shrink-0"
            title={listenAriaLabel}
            aria-label={listenAriaLabel}
          >
            <Volume2 className="h-6 w-6 text-tea stroke-[2.5]" />
          </button>
        </div>

        <div className="mt-3.5">
          <h3 className="font-serif text-lg sm:text-xl font-black text-ink leading-snug">
            {actTitle}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-ink-secondary mt-1 leading-relaxed">
            {actDetail}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t-2 border-black/10">
        {activityDone ? (
          <button
            type="button"
            onClick={onToggleActivity}
            className="w-full min-h-[48px] py-2.5 px-4 rounded-2xl border-2 border-black bg-emerald-100 text-emerald-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] hover:bg-emerald-200 cursor-pointer transition-all active:scale-98"
            aria-label="Activity completed. Tap to toggle."
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
            <span>{actDone}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleActivity}
            className="w-full min-h-[48px] py-2.5 px-4 rounded-2xl border-2 border-black bg-amber-400 text-ink font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] hover:bg-amber-300 cursor-pointer transition-all active:scale-98"
            aria-label="Activity pending. Tap when done."
          >
            <Sparkles className="h-5 w-5 text-ink shrink-0" />
            <span>{actTapDo}</span>
          </button>
        )}
      </div>
    </div>
  );
}
