"use client";

import { playMechanicalClick, playSuccessChime } from "@/lib/sound";
import { ScrapbookCard } from "@/components/ui/ScrapbookCard";

interface HydrationTrackerProps {
  glasses: boolean[];
  onToggle?: (index: number) => void;
}

export function HydrationTracker({ glasses, onToggle }: HydrationTrackerProps) {
  const filled = glasses.filter(Boolean).length;

  return (
    <ScrapbookCard className="!p-3.5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink">
          💧 Water Today
        </h2>
        <span className="font-bold text-sm text-tea">
          {filled} / {glasses.length}
        </span>
      </div>
      <div className="flex gap-2">
        {glasses.map((isFilled, i) => {
          const glass = (
            <div
              className={`w-10 h-12 rounded-lg border-3 border-border flex items-end justify-center overflow-hidden ${
                isFilled ? "bg-marigold-light" : "bg-surface-muted"
              }`}
            >
              {isFilled ? (
                <div
                  className="w-full bg-marigold water-fill rounded-b-sm"
                  style={{ "--fill": "80%" } as React.CSSProperties}
                />
              ) : (
                <div className="text-base mb-0.5 opacity-30">💧</div>
              )}
            </div>
          );

          if (!onToggle) return <div key={i}>{glass}</div>;

          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (!isFilled) playSuccessChime();
                else playMechanicalClick();
                onToggle(i);
              }}
              className="btn-tactile"
              aria-label={`Water glass ${i + 1}`}
              aria-pressed={isFilled}
            >
              {glass}
            </button>
          );
        })}
      </div>
    </ScrapbookCard>
  );
}