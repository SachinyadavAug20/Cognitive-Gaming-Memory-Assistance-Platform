"use client";

import React from "react";
import { Droplets, Minus, Plus, Volume2 } from "lucide-react";

interface RoutineHydrationCardProps {
  glasses: number;
  waterPct: number;
  waterTag: string;
  waterTimeSub: string;
  waterTitle: string;
  waterDetail: string;
  waterGlasses: string;
  waterGoalDone: string;
  waterGoal: string;
  waterDrinkBtn: string;
  listenAriaLabel: string;
  onAddWater: (e: React.MouseEvent) => void;
  onRemoveWater: (e: React.MouseEvent) => void;
  onSpeakWater: () => void;
}

export function RoutineHydrationCard({
  glasses,
  waterPct,
  waterTag,
  waterTimeSub,
  waterTitle,
  waterDetail,
  waterGlasses,
  waterGoalDone,
  waterGoal,
  waterDrinkBtn,
  listenAriaLabel,
  onAddWater,
  onRemoveWater,
  onSpeakWater,
}: RoutineHydrationCardProps) {
  return (
    <div className="border-3 border-black rounded-3xl bg-[#FFFDF9] p-5 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between text-left transition-all">
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl border-2 border-black bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
              <Droplets className="h-6 w-6 stroke-[2.2]" />
            </div>
            <div>
              <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-black uppercase text-emerald-900 tracking-wider">
                {waterTag}
              </span>
              <div className="text-xs font-bold text-ink-secondary mt-0.5">{waterTimeSub}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onSpeakWater}
            className="btn-tactile h-12 w-12 rounded-2xl border-2 border-black bg-white flex items-center justify-center text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-100 cursor-pointer active:scale-95 transition-transform shrink-0"
            title={listenAriaLabel}
            aria-label={listenAriaLabel}
          >
            <Volume2 className="h-6 w-6 text-tea stroke-[2.5]" />
          </button>
        </div>

        <div className="mt-3.5">
          <h3 className="font-serif text-lg sm:text-xl font-black text-ink leading-snug">
            {waterTitle}
          </h3>
          <p className="text-xs sm:text-sm font-medium text-ink-secondary mt-1 leading-relaxed">
            {waterDetail}
          </p>
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t-2 border-black/10 space-y-3">
        <div className="flex items-center justify-between gap-1.5 bg-emerald-50/90 p-2 rounded-2xl border-2 border-emerald-200">
          {[1, 2, 3, 4, 5, 6].map((cup) => (
            <div
              key={cup}
              className={`flex-1 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                cup <= glasses
                  ? "bg-emerald-600 border-emerald-800 text-white shadow-xs scale-102"
                  : "bg-white border-black/20 text-black/20"
              }`}
              title={`Glass ${cup} of 6`}
            >
              <Droplets className={`h-3.5 w-3.5 ${cup <= glasses ? "fill-white" : ""}`} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onRemoveWater}
            disabled={glasses <= 0}
            className="h-11 w-11 rounded-xl border-2 border-black bg-white text-ink flex items-center justify-center font-black hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000] cursor-pointer active:scale-95"
            aria-label="Decrease water"
          >
            <Minus className="h-4 w-4 stroke-[3]" />
          </button>

          <div className="text-center flex-1">
            <span className="text-xs sm:text-sm font-black text-emerald-950 block">
              {waterGlasses.replace("{n}", String(glasses))}
            </span>
            <span className="text-[11px] font-bold text-emerald-800">
              {glasses >= 6 ? waterGoalDone : waterGoal.replace("{pct}", String(waterPct))}
            </span>
          </div>

          <button
            type="button"
            onClick={onAddWater}
            disabled={glasses >= 8}
            className="h-11 px-3.5 sm:px-4 rounded-xl border-2 border-black bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[2px_2px_0px_#000] hover:bg-emerald-800 active:scale-95 cursor-pointer disabled:opacity-40"
            aria-label="Drink a glass of water"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>{waterDrinkBtn}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
