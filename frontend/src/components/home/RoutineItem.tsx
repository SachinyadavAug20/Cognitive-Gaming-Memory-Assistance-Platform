import type { RoutineItem as RoutineItemType } from "@/types";

interface RoutineItemProps {
  item: RoutineItemType;
}

export function RoutineItem({ item }: RoutineItemProps) {
  return (
    <div
      className={`scrapbook-card !p-3 flex items-center gap-3 ${item.status === "due" ? "!border-marigold !border-4" : ""}`}
    >
      <div className="text-2xl shrink-0">{item.emoji}</div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-ink leading-tight">{item.title}</div>
        <div className="text-xs text-ink-secondary">{item.time}</div>
      </div>
      {item.status === "completed" && (
        <span className="w-7 h-7 rounded-full bg-tea-light border-2 border-tea flex items-center justify-center text-tea shrink-0">
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
            <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      )}
      {item.status === "due" && (
        <span className="px-2.5 py-1 rounded-full bg-marigold-light border-2 border-marigold text-marigold text-xs font-bold pulse-gentle">
          NOW
        </span>
      )}
    </div>
  );
}
