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
    <div className={`${CARD} bg-surface p-5 sm:p-6 flex flex-col justify-between text-left min-h-[250px]`}>
      <div>
        <div className="flex items-center gap-2.5 border-b-2 border-black/10 pb-2.5">
          <Smile className="h-5 w-5 text-tea" />
          <h3 className="font-serif text-xl sm:text-2xl font-black text-ink">{title}</h3>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {MOODS.map((mood) => {
            const IconComponent = mood.icon;
            const isSelected = lastMood === mood.key;
            return (
              <button
                key={mood.key}
                type="button"
                onClick={() => onChooseMood(mood.key)}
                aria-label={moodLabels[mood.key]}
                className={`btn-tactile flex min-h-[110px] sm:min-h-[125px] flex-col items-center justify-center gap-2 rounded-2xl border-3 border-black p-3 text-sm font-black shadow-[3px_3px_0px_#000] cursor-pointer transition-all ${
                  mood.color
                } ${isSelected ? "ring-4 ring-black scale-105" : "hover:scale-[1.02]"}`}
              >
                <IconComponent className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 stroke-[2.2]" />
                <span className="leading-tight text-center text-xs sm:text-sm font-black">
                  {moodLabels[mood.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      {lastMood && thanksMessage && (
        <p className="mt-4 text-center text-sm sm:text-base font-black text-tea-dark border-t-2 border-black/10 pt-3">
          {thanksMessage}
        </p>
      )}
    </div>
  );
}
