"use client";

import React from "react";
import { CaregiverCoPlayPrompt } from "@/components/ui/CaregiverCoPlayPrompt";
import type { GridCell, SwapAnimationState, BustState, FloatingScore } from "./types";
import { TILE_DEFS } from "./types";

interface TeaGardenMatchGridProps {
  board: GridCell[][];
  rows: number;
  cols: number;
  selectedCoord: [number, number] | null;
  hintCoords: [[number, number], [number, number]] | null;
  bustState: BustState | null;
  swapAnim: SwapAnimationState | null;
  floatingScores: FloatingScore[];
  isProcessing: boolean;
  locale: string;
  onTileClick: (r: number, c: number) => void;
  onTouchStart: (e: React.TouchEvent, r: number, c: number) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export function TeaGardenMatchGrid({
  board,
  rows,
  cols,
  selectedCoord,
  hintCoords,
  bustState,
  swapAnim,
  floatingScores,
  isProcessing,
  locale,
  onTileClick,
  onTouchStart,
  onTouchEnd,
}: TeaGardenMatchGridProps) {
  return (
    <div className="rounded-3xl border-3 border-black bg-[#EFE5D5] p-3 shadow-[4px_4px_0px_#000] flex flex-col items-center justify-center relative overflow-hidden">
      <div
        className={`grid gap-2 w-full max-w-[340px] aspect-square relative ${
          cols === 5 ? "grid-cols-5" : "grid-cols-4"
        }`}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isSelected = selectedCoord && selectedCoord[0] === r && selectedCoord[1] === c;
            const isHint =
              hintCoords &&
              ((hintCoords[0][0] === r && hintCoords[0][1] === c) ||
                (hintCoords[1][0] === r && hintCoords[1][1] === c));

            const isBusting = bustState?.coords.has(`${r},${c}`);
            const bustPhase = bustState?.phase;

            let transformStyle = "";
            let isSwapping = false;

            if (swapAnim) {
              const { r1, c1, r2, c2, phase: sPhase } = swapAnim;
              if (r === r1 && c === c1) {
                isSwapping = true;
                if (sPhase === "sliding") {
                  const dx = (c2 - c1) * 100;
                  const dy = (r2 - r1) * 100;
                  transformStyle = `translate(${dx}%, ${dy}%)`;
                }
              } else if (r === r2 && c === c2) {
                isSwapping = true;
                if (sPhase === "sliding") {
                  const dx = (c1 - c2) * 100;
                  const dy = (r1 - r2) * 100;
                  transformStyle = `translate(${dx}%, ${dy}%)`;
                }
              }
            }

            const def = TILE_DEFS[cell.type] || TILE_DEFS.tea_leaf;

            return (
              <div
                key={cell.id}
                className="relative aspect-square"
                style={{
                  transform: transformStyle,
                  transition: isSwapping ? "transform 220ms cubic-bezier(0.4, 0, 0.2, 1)" : "none",
                  zIndex: isSwapping ? 30 : isSelected ? 20 : 1,
                }}
              >
                <button
                  type="button"
                  onClick={() => onTileClick(r, c)}
                  onTouchStart={(e) => onTouchStart(e, r, c)}
                  onTouchEnd={onTouchEnd}
                  disabled={isProcessing}
                  className={`btn-tactile w-full h-full flex flex-col items-center justify-center rounded-2xl border-3 transition-all cursor-pointer select-none ${
                    isBusting && bustPhase === "highlight"
                      ? "scale-110 ring-4 ring-amber-400 bg-amber-200 border-amber-600 shadow-[0_0_15px_#F59E0B] z-20"
                      : isBusting && bustPhase === "burst"
                      ? "scale-0 opacity-0 rotate-45 transition-all duration-200 ease-out"
                      : isSelected
                      ? "bg-emerald-200 border-emerald-950 ring-4 ring-emerald-500 scale-105 shadow-[3px_3px_0px_#000]"
                      : isHint
                      ? "bg-amber-100 border-amber-600 ring-4 ring-amber-400 animate-pulse scale-105 shadow-[3px_3px_0px_#D97706]"
                      : `${def.bg} ${def.border} shadow-[2px_2px_0px_#000] hover:scale-102 active:scale-95`
                  }`}
                >
                  <span
                    className={`text-3xl sm:text-4xl select-none leading-none transition-transform duration-200 ${
                      isBusting && bustPhase === "highlight" ? "animate-bounce" : ""
                    }`}
                  >
                    {def.emoji}
                  </span>
                </button>
              </div>
            );
          })
        )}

        {floatingScores.map((scoreItem) => {
          const leftPct = (scoreItem.x / (cols - 1)) * 80 + 10;
          const topPct = (scoreItem.y / (rows - 1)) * 80 + 10;
          return (
            <div
              key={scoreItem.id}
              className="absolute pointer-events-none font-black text-sm sm:text-base px-2.5 py-1 rounded-full bg-amber-300 border-2 border-black text-amber-950 shadow-md animate-out fade-out slide-out-to-top-8 duration-700 z-40"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {scoreItem.text}
            </div>
          );
        })}
      </div>

      <p className="text-[11px] font-bold text-amber-950/70 mt-2 text-center">
        {locale === "as"
          ? "আঙুলিৰে টানক বা দুটা কাষৰ বস্তু চুই সলনি কৰক।"
          : locale === "hi"
          ? "उंगली से स्वाइप करें या दो पास की वस्तुएं छूकर बदलें।"
          : "Swipe or tap two adjacent items to swap and match 3!"}
      </p>

      <CaregiverCoPlayPrompt
        tip={
          locale === "as"
            ? "যত্নকৰ্তাৰ পৰামৰ্শ: বাবাৰ সৈতে একেলগে ৩টা একে ৰঙৰ ফুল বা পাত বিচাৰক।"
            : locale === "hi"
            ? "देखभालकर्ता सुझाव: बड़े-बुजुर्गों के साथ मिलकर एक ही रंग की 3 पत्तियां या फूल खोजें।"
            : "Caregiver Co-Play Tip: Point out 3 matching tea leaves or orchids in a row together to encourage calm visual search."
        }
        className="mt-3"
      />
    </div>
  );
}
