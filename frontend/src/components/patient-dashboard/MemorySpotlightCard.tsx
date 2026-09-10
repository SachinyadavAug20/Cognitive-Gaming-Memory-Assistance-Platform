"use client";

import { useState } from "react";
import { HeartHandshake, Volume2, Sparkles, Search, Image as ImageIcon, Users } from "lucide-react";
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

const CARD = "border-3 border-black rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)]";

// Helper to gracefully parse "Name (Relation): Story" into warm, accessible pieces
function parseMemory(text: string) {
  const relMatch = text.match(/^([^(]+)\s*\(([^)]+)\)\s*:\s*(.+)$/);
  if (relMatch) {
    return {
      title: relMatch[1].trim(),
      badge: relMatch[2].trim(),
      narrative: relMatch[3].trim(),
    };
  }
  const placeMatch = text.match(/^([^:]+)\s*:\s*(.+)$/);
  if (placeMatch) {
    return {
      title: placeMatch[1].trim(),
      badge: "Cherished Place",
      narrative: placeMatch[2].trim(),
    };
  }
  return {
    title: "",
    badge: "",
    narrative: text,
  };
}

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
  const parsed = memoryOfDay ? parseMemory(memoryOfDay.text) : null;

  return (
    <div className={`${CARD} bg-[#FFFDF9] p-5 sm:p-7 text-left`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
        <div className="flex items-center gap-2.5">
          <HeartHandshake className="h-6 w-6 text-tea" />
          <h3 className="font-serif text-xl sm:text-2xl font-black text-ink">{title}</h3>
        </div>
        <span className="text-xs font-black text-amber-900 bg-amber-100/90 px-3 py-1 rounded-full border border-amber-300 shadow-2xs">
          Family Keepsake
        </span>
      </div>

      {memoryOfDay ? (
        <>
          <div className="mt-5 flex flex-col sm:flex-row items-start gap-5 sm:gap-6">
            {photo && (
              <button
                type="button"
                onClick={onOpenLightbox}
                className="group relative shrink-0 h-36 w-36 sm:h-44 sm:w-44 rounded-2xl overflow-hidden border-2 border-black bg-amber-50 shadow-[3px_3px_0px_#000] cursor-pointer hover:scale-[1.02] active:scale-95 transition-all text-left"
                title="Tap to see larger photo"
                aria-label={viewPhotoLabel}
              >
                {!hasError ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={photo || ""}
                    alt={parsed?.title || title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="eager"
                    onError={() => setHasError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-3 text-ink-secondary text-center">
                    <ImageIcon className="h-10 w-10 text-tea/60 mb-1" />
                    <span className="text-xs font-bold">Family Photo</span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 text-center">
                  <span className="inline-flex items-center gap-1 text-[11px] font-black text-white">
                    <Search className="h-3 w-3" />
                    <span>{viewPhotoLabel}</span>
                  </span>
                </div>
              </button>
            )}

            <div className="flex-1 min-w-0">
              {parsed && parsed.title ? (
                <div>
                  {parsed.badge && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-300 px-3 py-0.5 text-xs font-black text-amber-900 shadow-2xs">
                      <Users className="h-3.5 w-3.5 text-amber-800" />
                      <span>{parsed.badge}</span>
                    </span>
                  )}
                  <h4 className="font-serif text-2xl sm:text-3xl font-black text-ink leading-tight mt-1.5">
                    {parsed.title}
                  </h4>
                  <p className="text-base sm:text-lg font-medium text-ink-secondary leading-relaxed mt-2">
                    {parsed.narrative}
                  </p>
                </div>
              ) : (
                <p className="text-xl sm:text-2xl font-black leading-snug text-ink">
                  {memoryOfDay.text}
                </p>
              )}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 pt-3 border-t-2 border-black/10">
            <button
              type="button"
              onClick={() => onListen(memoryOfDay.text)}
              className="btn-tactile inline-flex items-center gap-2.5 rounded-2xl border-2 border-black bg-tea px-6 py-3 text-sm sm:text-base font-black text-white shadow-[3px_3px_0px_#000] hover:bg-emerald-800 cursor-pointer active:scale-95 transition-all"
            >
              <Volume2 className="h-5 w-5 stroke-[2.5]" />
              <span>{listenLabel}</span>
            </button>
            <button
              type="button"
              onClick={onShuffle}
              className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-white px-5 py-3 text-sm sm:text-base font-black text-ink shadow-[3px_3px_0px_#000] hover:bg-amber-100 cursor-pointer active:scale-95 transition-all"
            >
              <Sparkles className="h-5 w-5 text-amber-600" />
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
