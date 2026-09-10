"use client";

import { Smile, Meh, HeartHandshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MoodKey = "peaceful" | "okay" | "caretaker";

interface DailyMoodTrackerProps {
  lastMood: MoodKey | null;
  onChooseMood: (key: MoodKey) => void;
  title: string;
  thanksMessage?: string;
  feedbackMessage?: string;
  moodLabels: Record<MoodKey, string>;
}

const MOODS: { key: MoodKey; icon: LucideIcon; color: string }[] = [
  { key: "peaceful", icon: Smile, color: "bg-emerald-700 text-white hover:bg-emerald-800" },
  { key: "okay", icon: Meh, color: "bg-amber-600 text-white hover:bg-amber-700" },
  { key: "caretaker", icon: HeartHandshake, color: "bg-brick text-white hover:bg-red-700" },
];

const CARD = "border-3 border-black rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)]";

export function DailyMoodTracker({
  lastMood,
  onChooseMood,
  title,
  thanksMessage,
  feedbackMessage,
  moodLabels,
}: DailyMoodTrackerProps) {
  return (
    <div className={`${CARD} bg-[#FFFDF9] p-5 sm:p-6 flex flex-col justify-between text-left h-full min-h-[260px]`}>
      <div>
        <div className="flex items-center gap-2.5 border-b-2 border-black/10 pb-2.5">
          <Smile className="h-5 w-5 text-tea" />
          <h3 className="font-serif text-xl sm:text-2xl font-black text-ink">{title}</h3>
        </div>
        <p className="mt-2 text-xs sm:text-sm font-bold text-ink-secondary">
          Check in with your loved ones and health worker
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
          {MOODS.map((mood) => {
            const IconComponent = mood.icon;
            const isSelected = lastMood === mood.key;
            return (
              <button
                key={mood.key}
                type="button"
                onClick={() => onChooseMood(mood.key)}
                aria-label={moodLabels[mood.key]}
                className={`btn-tactile flex min-h-[105px] sm:min-h-[115px] flex-col items-center justify-center gap-2 rounded-2xl border-2 sm:border-3 border-black p-2.5 sm:p-3 text-sm font-black shadow-[3px_3px_0px_#000] cursor-pointer transition-all ${
                  mood.color
                } ${isSelected ? "ring-4 ring-black scale-105" : "hover:scale-[1.02]"}`}
              >
                <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 stroke-[2.2]" />
                <span className="leading-tight text-center text-xs sm:text-sm font-black">
                  {moodLabels[mood.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t-2 border-black/10">
        {lastMood ? (
          <div className={`p-2.5 sm:p-3 rounded-2xl border-2 flex items-center gap-2.5 ${
            lastMood === "peaceful"
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : lastMood === "okay"
                ? "bg-amber-50 border-amber-300 text-amber-950"
                : "bg-rose-50 border-rose-300 text-rose-950"
          }`}>
            {lastMood === "peaceful" && <Smile className="h-5 w-5 text-emerald-700 shrink-0" />}
            {lastMood === "okay" && <Meh className="h-5 w-5 text-amber-700 shrink-0" />}
            {lastMood === "caretaker" && <HeartHandshake className="h-5 w-5 text-rose-700 shrink-0" />}
            <p className="text-xs sm:text-sm font-bold leading-tight">
              {feedbackMessage || thanksMessage || "Thank you for sharing your mood today."}
            </p>
          </div>
        ) : (
          <div className="p-2.5 sm:p-3 rounded-2xl bg-black/5 border border-black/10 text-center">
            <span className="text-xs sm:text-sm font-bold text-ink-secondary">
              Tap any emotion above to check in with family
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
