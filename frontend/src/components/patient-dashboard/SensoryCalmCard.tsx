"use client";

import { Music, Volume2, Sparkles } from "lucide-react";

interface SensoryCalmCardProps {
  title: string;
  hint: string;
  comfortText: string;
  playLabel: string;
  listenLabel: string;
  onPlayTone: () => void;
  onListenText: (text: string) => void;
  onPlayGamma?: () => void;
  favoriteMusic?: string;
  joyTriggers?: string;
}

const CARD = "border-3 border-black rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)]";

export function SensoryCalmCard({
  title,
  hint,
  comfortText,
  playLabel,
  listenLabel,
  onPlayTone,
  onListenText,
  onPlayGamma,
  favoriteMusic,
  joyTriggers,
}: SensoryCalmCardProps) {
  return (
    <div className={`${CARD} bg-[#FFFDF9] p-5 sm:p-6 flex flex-col justify-between text-left h-full min-h-[260px]`}>
      <div>
        <div className="flex items-center gap-2.5 border-b-2 border-black/10 pb-2.5">
          <Music className="h-5 w-5 text-tea" />
          <h3 className="font-serif text-xl sm:text-2xl font-black text-ink">{title}</h3>
        </div>
        <p className="mt-2 text-xs sm:text-sm font-bold text-ink-secondary">{hint}</p>

        {favoriteMusic ? (
          <div className="mt-3 space-y-2">
            <div className="flex items-center gap-2 rounded-2xl bg-tea/10 border border-tea/25 px-3.5 py-2 text-xs sm:text-sm font-black text-tea-dark">
              <Music className="h-4 w-4 shrink-0 text-tea" />
              <span className="truncate">{favoriteMusic}</span>
            </div>
            {joyTriggers && (
              <div className="flex items-start gap-2 rounded-2xl bg-amber-50 border border-amber-200 px-3.5 py-2 text-xs sm:text-sm font-bold text-amber-950">
                <Sparkles className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <span className="line-clamp-2">{joyTriggers}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="mt-2.5 text-sm sm:text-base font-semibold text-ink leading-relaxed">
            {comfortText}
          </p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3 border-t-2 border-black/10">
        <button
          type="button"
          onClick={onPlayTone}
          className="btn-tactile min-h-[48px] inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-tea px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-800 cursor-pointer active:scale-95 transition-all"
        >
          <Music className="h-4.5 w-4.5 shrink-0" />
          <span>{playLabel}</span>
        </button>
        <button
          type="button"
          onClick={() => onListenText(comfortText)}
          className="btn-tactile min-h-[48px] inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-white px-4 py-2.5 text-xs sm:text-sm font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-100 cursor-pointer active:scale-95 transition-all"
        >
          <Volume2 className="h-4.5 w-4.5 text-tea shrink-0" />
          <span>{listenLabel}</span>
        </button>
      </div>
    </div>
  );
}
