"use client";

import Image from "next/image";
import { getMediaUrl } from "@/lib/api";
import type { FamiliarPlaceItem } from "@/types";

interface FamiliarPlacesCardProps {
  familiarPlaces: FamiliarPlaceItem[];
  onOpenLightbox: (item: { title: string; text?: string | null; photoUrl?: string | null }) => void;
}

export function FamiliarPlacesCard({ familiarPlaces, onOpenLightbox }: FamiliarPlacesCardProps) {
  return (
    <div className="scrapbook-card">
      <div className="flex items-center justify-between border-b-2 border-border-soft pb-4 mb-5">
        <div>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink">
            📍 Familiar Places & Landmarks
          </h2>
          <p className="text-sm text-ink-secondary mt-0.5">
            Visual wayfinding cues and daily walking route memories
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-surface-muted border-2 border-border-soft text-ink font-bold text-sm">
          {familiarPlaces.length} Landmarks
        </span>
      </div>

      {familiarPlaces.length === 0 ? (
        <div className="text-center py-8 text-ink-secondary text-sm">
          No familiar places registered yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {familiarPlaces.map((place) => {
            const photo = getMediaUrl(place.photoUrl);
            return (
              <div
                key={place.id}
                className="bg-surface rounded-xl border-3 border-border p-4 shadow-[3px_3px_0px_var(--color-border)] flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  {photo ? (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenLightbox({
                          title: place.name,
                          text: place.description,
                          photoUrl: place.photoUrl,
                        })
                      }
                      className="btn-tactile shrink-0 cursor-pointer"
                    >
                      <Image
                        src={photo}
                        alt={`Landmark photo of ${place.name}`}
                        width={56}
                        height={56}
                        sizes="56px"
                        className="w-14 h-14 rounded-xl border-2 border-border object-cover bg-surface-muted"
                        loading="lazy"
                      />
                    </button>
                  ) : (
                    <div className="w-14 h-14 rounded-xl border-2 border-border bg-marigold/20 text-ink font-bold flex items-center justify-center text-2xl shrink-0">
                      {place.emoji || "🏠"}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base text-ink leading-tight">
                      {place.name}
                    </h3>
                    {place.category && (
                      <span className="inline-block text-xs font-bold text-ink-secondary mt-1">
                        {place.emoji} {place.category}
                      </span>
                    )}
                  </div>
                </div>

                {place.description && (
                  <p className="mt-3 text-xs text-ink-secondary bg-surface-muted/60 p-2.5 rounded-lg border border-border-soft leading-snug">
                    {place.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
