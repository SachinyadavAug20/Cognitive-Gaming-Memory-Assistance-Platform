"use client";

import { Music, Volume2 } from "lucide-react";

interface SensoryCalmCardProps {
  title: string;
  hint: string;
  comfortText: string;
  playLabel: string;
  listenLabel: string;
  onPlayTone: () => void;
  onListenText: (text: string) => void;
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
}: SensoryCalmCardProps) {
  return (
    <div className={`${CARD} bg-surface p-4 flex flex-col justify-between text-left`}>
      <div>
        <div className="flex items-center gap-2">
          <Music className="h-4 w-4 text-tea" />
          <h3 className="font-serif text-lg font-black text-ink">{title}</h3>
        </div>
        <p className="mt-1 text-xs font-semibold text-ink-secondary">{hint}</p>
        <p className="mt-2 text-sm font-bold text-ink">{comfortText}</p>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onPlayTone}
          className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-tea px-3.5 py-2 text-xs font-black text-white shadow-[2px_2px_0px_#000] cursor-pointer"
        >
          <Music className="h-4 w-4" />
          <span>{playLabel}</span>
        </button>
        <button
          type="button"
          onClick={() => onListenText(comfortText)}
          className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-3.5 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
        >
          <Volume2 className="h-4 w-4 text-tea" />
          <span>{listenLabel}</span>
        </button>
      </div>
    </div>
  );
}
