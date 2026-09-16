"use client";

import React from "react";
import { Pill, CheckCircle2, Volume2 } from "lucide-react";

interface RoutineMedicineCardProps {
  medicineDone: boolean;
  medTag: string;
  medTimeSub: string;
  medTitle: string;
  medDetail: string;
  medTaken: string;
  medTapTake: string;
  listenAriaLabel: string;
  onToggleMedicine: () => void;
  onSpeakMedicine: () => void;
}

export function RoutineMedicineCard({
  medicineDone,
  medTag,
  medTimeSub,
  medTitle,
  medDetail,
  medTaken,
  medTapTake,
  listenAriaLabel,
  onToggleMedicine,
  onSpeakMedicine,
}: RoutineMedicineCardProps) {
  return (
    <div className="border-3 border-black rounded-3xl bg-[#FFFDF9] p-5 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between text-left transition-all">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl border-2 border-black bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs">
              <Pill className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="inline-flex items-center rounded-full bg-rose-50 border border-rose-300 px-2.5 py-0.5 text-[11px] font-black uppercase text-rose-900 tracking-wider">
                {medTag}
              </span>
              <div className="text-xs font-bold text-ink-secondary mt-0.5">{medTimeSub}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onSpeakMedicine}
            className="btn-tactile h-12 w-12 rounded-2xl border-2 border-black bg-white flex items-center justify-center text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-100 cursor-pointer active:scale-95 transition-transform shrink-0"
            title={listenAriaLabel}
            aria-label={listenAriaLabel}
          >
            <Volume2 className="h-6 w-6 text-tea stroke-[2.5]" />
          </button>
        </div>

        <div className="mt-3.5">
          <h3 className="font-serif text-lg sm:text-xl font-black text-ink leading-snug">
            {medTitle}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-ink-secondary mt-1 leading-relaxed">
            {medDetail}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t-2 border-black/10">
        {medicineDone ? (
          <button
            type="button"
            onClick={onToggleMedicine}
            className="w-full min-h-[48px] py-2.5 px-4 rounded-2xl border-2 border-black bg-emerald-100 text-emerald-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] hover:bg-emerald-200 cursor-pointer transition-all active:scale-98"
            aria-label="Medicine taken. Tap to toggle."
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
            <span>{medTaken}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleMedicine}
            className="w-full min-h-[48px] py-2.5 px-4 rounded-2xl border-2 border-black bg-rose-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] hover:bg-rose-700 cursor-pointer transition-all active:scale-98"
            aria-label="Medicine pending. Tap when taken."
          >
            <Pill className="h-5 w-5 shrink-0" />
            <span>{medTapTake}</span>
          </button>
        )}
      </div>
    </div>
  );
}
