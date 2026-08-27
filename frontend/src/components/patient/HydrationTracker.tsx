import { ScrapbookCard } from "@/components/ui/ScrapbookCard";

interface HydrationTrackerProps {
  glasses: boolean[];
}

export function HydrationTracker({ glasses }: HydrationTrackerProps) {
  return (
    <ScrapbookCard className="!p-3.5">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink">
          💧 Water Today
        </h2>
        <span className="font-bold text-sm text-tea">
          {glasses.filter(Boolean).length} / {glasses.length}
        </span>
      </div>
      <div className="flex gap-2">
        {glasses.map((filled, i) => (
          <div key={i}
            className={`w-10 h-12 rounded-lg border-3 border-border flex items-end justify-center overflow-hidden ${filled ? "bg-marigold-light" : "bg-surface-muted"}`}
          >
            {filled ? (
              <div className="w-full bg-marigold water-fill rounded-b-sm"
                style={{ "--fill": "80%" } as React.CSSProperties}
              />
            ) : (
              <div className="text-base mb-0.5 opacity-30">💧</div>
            )}
          </div>
        ))}
      </div>
    </ScrapbookCard>
  );
}
