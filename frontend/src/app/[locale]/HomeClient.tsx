"use client";

import dynamic from "next/dynamic";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { PortalCard } from "@/components/home/PortalCard";
import { Sun, QrCode } from "lucide-react";
import { useTranslations } from "next-intl";

const Hero3DLandscape = dynamic(
  () => import("@/components/home/Hero3DLandscape").then((mod) => mod.Hero3DLandscape),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[380px] sm:h-[460px] md:h-[500px] rounded-3xl border-3 border-black bg-surface-muted animate-pulse flex flex-col items-center justify-center gap-2 text-xs font-black text-ink-secondary shadow-[6px_6px_0px_#000]">
        <div className="w-8 h-8 rounded-full border-3 border-tea border-t-transparent animate-spin" />
        <span>Loading 3D Brahmaputra Heritage Biome...</span>
      </div>
    ),
  }
);

export function HomeClient() {
  const t = useTranslations("home");

  return (
    <div className="space-y-4">
      {/* 1. Warm Greeting & Primary Patient Check-In CTA */}
      <div className="text-center">
        <h1 className="font-serif font-black text-3xl md:text-5xl text-ink leading-tight flex items-center justify-center gap-2.5">
          <span>{t("greeting")}</span>
          <Sun className="h-8 w-8 md:h-11 md:w-11 text-amber-500 stroke-[2.2]" />
        </h1>
        <p className="text-base md:text-lg text-ink-secondary mt-1 max-w-xl mx-auto font-medium">
          {t("ready")}
        </p>
      </div>

      {/* Centered Primary Action: Patient Kiosk Check-In */}
      <div className="max-w-xl mx-auto w-full">
        <PortalCard
          headerBg="bg-marigold"
          icon={QrCode}
          title={t("kiosk.title")}
          subtitle={t("kiosk.subtitle")}
          description={t("kiosk.description")}
          href="/kiosk/login"
          actionButton={
            <ChunkyButton
              variant="marigold"
              size="xl"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                  <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                  <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                  <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                  <path d="M7 12h10M7 8h10M7 16h10" />
                </svg>
              }
              className="w-full text-base cursor-pointer"
            >
              {t("kiosk.cta")}
            </ChunkyButton>
          }
        >
          <div className="space-y-2.5 flex-1 py-1">
            <div className="flex items-center gap-3 rounded-xl bg-amber-50/70 px-3.5 py-2 border border-black/15 shadow-xs">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marigold text-white font-black text-xs">1</span>
              <span className="font-bold text-xs sm:text-sm text-ink">{t("kiosk.showCard")}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-amber-50/70 px-3.5 py-2 border border-black/15 shadow-xs">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-700 text-white font-black text-xs">2</span>
              <span className="font-bold text-xs sm:text-sm text-ink">{t("kiosk.scan")}</span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-amber-50/70 px-3.5 py-2 border border-black/15 shadow-xs">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white font-black text-xs">3</span>
              <span className="font-bold text-xs sm:text-sm text-ink">{t("kiosk.start")}</span>
            </div>
          </div>
        </PortalCard>
      </div>

      {/* 2. Sensory Calming 3D Three.js Diorama (Brahmaputra Valley & Tea Hills) */}
      <div className="pt-8">
        <Hero3DLandscape />
      </div>
    </div>
  );
}