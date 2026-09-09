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
}

const CARD = "border-3 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)]";

export function SensoryCalmCard({
  title,
  hint,
  comfortText,
  playLabel,
  listenLabel,
  onPlayTone,
  onListenText,
  onPlayGamma,
}: SensoryCalmCardProps) {
  return (
    <div className={`${CARD} bg-surface p-5 sm:p-6 flex flex-col justify-between text-left min-h-[250px]`}>
      <div>
        <div className="flex items-center gap-2.5 border-b-2 border-black/10 pb-2.5">
          <Music className="h-5 w-5 text-tea" />
          <h3 className="font-serif text-xl sm:text-2xl font-black text-ink">{title}</h3>
        </div>
        <p className="mt-2 text-xs sm:text-sm font-bold text-ink-secondary">{hint}</p>
        <p className="mt-2.5 text-sm sm:text-base font-bold text-ink leading-relaxed line-clamp-3">
          {comfortText}
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2.5 pt-3 border-t-2 border-black/10">
        <button
          type="button"
          onClick={onPlayTone}
          className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-tea px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-800 cursor-pointer"
        >
          <Music className="h-4.5 w-4.5" />
          <span>{playLabel}</span>
        </button>
        {onPlayGamma && (
          <button
            type="button"
            onClick={onPlayGamma}
            className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-amber-400 px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-black text-black shadow-[2px_2px_0px_#000] hover:bg-amber-300 cursor-pointer"
          >
            <Sparkles className="h-4.5 w-4.5 text-black" />
            <span>Calming Waves</span>
          </button>
        )}
        <button
          type="button"
          onClick={() => onListenText(comfortText)}
          className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
        >
          <Volume2 className="h-4.5 w-4.5 text-tea" />
          <span>{listenLabel}</span>
        </button>
      </div>
    </div>
  );
}
