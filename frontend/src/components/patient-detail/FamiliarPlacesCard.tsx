"use client";

import { useState } from "react";
import Image from "next/image";
import { MapPin, Home, ShoppingBag, Landmark, Building2, Trees } from "lucide-react";
import { useTranslations } from "next-intl";
import { getMediaUrl } from "@/lib/api";
import type { FamiliarPlaceItem } from "@/types";

interface FamiliarPlacesCardProps {
  familiarPlaces: FamiliarPlaceItem[];
  onOpenLightbox: (item: { title: string; text?: string | null; photoUrl?: string | null }) => void;
}

function CategoryIcon({ category, className }: { category?: string | null; className?: string }) {
  const cat = (category || "").toLowerCase();
  if (cat.includes("home")) return <Home className={className} />;
  if (cat.includes("market") || cat.includes("shop")) return <ShoppingBag className={className} />;
  if (cat.includes("worship") || cat.includes("cathedral") || cat.includes("temple") || cat.includes("monastery")) return <Landmark className={className} />;
  if (cat.includes("clinic") || cat.includes("hospital")) return <Building2 className={className} />;
  if (cat.includes("park") || cat.includes("lake")) return <Trees className={className} />;
  return <MapPin className={className} />;
}

function PlacePhoto({
  photoUrl,
  name,
  category,
  onClick,
}: {
  photoUrl?: string | null;
  name: string;
  category?: string | null;
  onClick: () => void;
}) {
  const t = useTranslations("patientDetail");
  const [hasError, setHasError] = useState(false);
  const photo = photoUrl ? getMediaUrl(photoUrl) : null;

  if (!photo || hasError) {
    return (
      <div className="w-14 h-14 rounded-xl border-2 border-border bg-amber-100 text-amber-900 font-bold flex items-center justify-center shrink-0 shadow-xs">
        <CategoryIcon category={category} className="h-6 w-6 stroke-[2]" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-tactile shrink-0 cursor-pointer overflow-hidden rounded-xl"
      aria-label={t("places.view", { name })}
    >
      <Image
        src={photo}
        alt=""
        width={56}
        height={56}
        sizes="56px"
        className="w-14 h-14 rounded-xl border-2 border-border object-cover bg-surface-muted"
        onError={() => setHasError(true)}
      />
    </button>
  );
}

export function FamiliarPlacesCard({ familiarPlaces, onOpenLightbox }: FamiliarPlacesCardProps) {
  const t = useTranslations("patientDetail");

  return (
    <div className="scrapbook-card">
      <div className="flex items-center justify-between border-b-2 border-border-soft pb-4 mb-5">
        <div>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink flex items-center gap-2">
            <MapPin className="h-6 w-6 text-tea" />
            <span>{t("places.title")}</span>
          </h2>
          <p className="text-sm text-ink-secondary mt-0.5">
            {t("places.subtitle")}
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-surface-muted border-2 border-border-soft text-ink font-bold text-sm">
          {familiarPlaces.length} {t("places.landmarks")}
        </span>
      </div>

      {familiarPlaces.length === 0 ? (
        <div className="text-center py-8 text-ink-secondary text-sm">
          {t("places.empty")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {familiarPlaces.map((place) => {
            return (
              <div
                key={place.id}
                className="bg-surface rounded-xl border-3 border-border p-4 shadow-[3px_3px_0px_var(--color-border)] flex flex-col justify-between"
              >
                <div className="flex items-start gap-3">
                  <PlacePhoto
                    photoUrl={place.photoUrl}
                    name={place.name}
                    category={place.category}
                    onClick={() =>
                      onOpenLightbox({
                        title: place.name,
                        text: place.description,
                        photoUrl: place.photoUrl,
                      })
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-base text-ink leading-tight">
                      {place.name}
                    </h3>
                    {place.category && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-ink-secondary mt-1">
                        <CategoryIcon category={place.category} className="h-3 w-3 stroke-[2.2]" />
                        <span>{place.category}</span>
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
