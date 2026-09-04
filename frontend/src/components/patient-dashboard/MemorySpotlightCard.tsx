"use client";

import { useState, useEffect } from "react";
import { HeartHandshake, Volume2, Sparkles, Search, Image as ImageIcon } from "lucide-react";
import { getMediaUrl } from "@/lib/api";

interface MemoryItem {
  text: string;
  photoUrl: string | null;
}

interface MemorySpotlightCardProps {
  memoryOfDay: MemoryItem | null;
  onListen: (text: string) => void;
  onShuffle: () => void;
  onOpenLightbox: () => void;
  title: string;
  emptyText: string;
  listenLabel: string;
  anotherLabel: string;
  viewPhotoLabel: string;
}

const CARD = "border-3 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)]";

export function MemorySpotlightCard({
  memoryOfDay,
  onListen,
  onShuffle,
  onOpenLightbox,
  title,
  emptyText,
  listenLabel,
  anotherLabel,
  viewPhotoLabel,
}: MemorySpotlightCardProps) {
  const photo = memoryOfDay ? getMediaUrl(memoryOfDay.photoUrl) : null;
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [photo]);

  return (
    <div className={`${CARD} bg-surface p-4 sm:p-5 text-left`}>
      <div className="flex items-center gap-2 border-b-2 border-black/10 pb-2">
        <HeartHandshake className="h-4 w-4 text-tea" />
        <h3 className="font-serif text-lg font-black text-ink">{title}</h3>
      </div>

      {memoryOfDay ? (
        <>
          <div className="mt-3.5 flex flex-col sm:flex-row items-start gap-4">
            {photo && (
              <button
                type="button"
                onClick={onOpenLightbox}
                className="btn-tactile group shrink-0 overflow-hidden rounded-2xl border-3 border-black bg-amber-50 shadow-[3px_3px_0px_#000] cursor-pointer hover:scale-[1.02] transition-transform"
                title="View Full Memory Photo"
              >
                <div className="relative h-28 w-28 sm:h-32 sm:w-32 bg-black/5 overflow-hidden flex items-center justify-center">
                  {!hasError ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      key={photo}
                      src={photo}
                      alt={title}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                      loading="eager"
                      onError={() => setHasError(true)}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 text-ink-secondary text-center">
                      <ImageIcon className="h-8 w-8 text-tea/60 mb-1" />
                      <span className="text-[10px] font-bold">Memory Photo</span>
                    </div>
                  )}
                </div>
                <span className="block bg-ink px-3 py-1.5 text-xs font-black text-white flex items-center justify-center gap-1 group-hover:bg-tea transition-colors">
                  <Search className="h-3.5 w-3.5" /> {viewPhotoLabel}
                </span>
              </button>
            )}
            <p className="max-w-xl text-lg sm:text-xl font-black leading-snug text-ink">
              {memoryOfDay.text}
            </p>
          </div>
          <div className="mt-3.5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onListen(memoryOfDay.text)}
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-tea px-4 py-2 text-xs font-black text-white shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              <Volume2 className="h-4 w-4" />
              <span>{listenLabel}</span>
            </button>
            <button
              type="button"
              onClick={onShuffle}
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-4 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-tea" />
              <span>{anotherLabel}</span>
            </button>
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm font-semibold text-ink-secondary">
          {emptyText}
        </p>
      )}
    </div>
  );
}
