"use client";

import { Smile, Meh, HeartHandshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MoodKey = "peaceful" | "okay" | "caretaker";

interface DailyMoodTrackerProps {
  lastMood: MoodKey | null;
  onChooseMood: (key: MoodKey) => void;
  title: string;
  thanksMessage?: string;
  moodLabels: Record<MoodKey, string>;
}

const MOODS: { key: MoodKey; icon: LucideIcon; color: string }[] = [
  { key: "peaceful", icon: Smile, color: "bg-emerald-700 text-white hover:bg-emerald-800" },
  { key: "okay", icon: Meh, color: "bg-amber-600 text-white hover:bg-amber-700" },
  { key: "caretaker", icon: HeartHandshake, color: "bg-brick text-white hover:bg-red-700" },
];

const CARD = "border-3 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)]";

export function DailyMoodTracker({
  lastMood,
  onChooseMood,
  title,
  thanksMessage,
  moodLabels,
}: DailyMoodTrackerProps) {
  return (
    <div className={`${CARD} bg-surface p-4 flex flex-col justify-between text-left min-h-[220px]`}>
      <div>
        <div className="flex items-center gap-2">
          <Smile className="h-4 w-4 text-tea" />
          <h3 className="font-serif text-lg font-black text-ink">{title}</h3>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {MOODS.map((mood) => {
            const IconComponent = mood.icon;
            const isSelected = lastMood === mood.key;
            return (
              <button
                key={mood.key}
                type="button"
                onClick={() => onChooseMood(mood.key)}
                aria-label={moodLabels[mood.key]}
                className={`btn-tactile flex min-h-[82px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-black p-2 text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all ${
                  mood.color
                } ${isSelected ? "ring-3 ring-black scale-105" : ""}`}
              >
                <IconComponent className="h-6 w-6 shrink-0" />
                <span className="leading-tight text-center text-[11px] font-black">
                  {moodLabels[mood.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {lastMood && thanksMessage && (
        <p className="mt-3 text-center text-xs font-black text-ink border-t border-black/10 pt-2">
          {thanksMessage}
        </p>
      )}
    </div>
  );
}
