"use client";

import dynamic from "next/dynamic";
import { useRouter } from "@/i18n/navigation";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { PortalCard } from "@/components/home/PortalCard";
import { useAuthStore } from "@/store/useAuthStore";
import { playScanSuccess, playTapFeedback } from "@/lib/sound";
import { Sparkles, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import type { KioskScanResponse } from "@/types/auth";

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
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleLaunchDemo = async () => {
    playTapFeedback();
    playScanSuccess();
    try {
      const res = await api.post<KioskScanResponse>("/auth/kiosk/demo", {});
      login(res.token, res.patient);
    } catch {
      // Backend offline fallback: enter the demo patient session with mock data
      login("demo-offline-session", {
        id: 2,
        name: "Biren Borah",
        languagePreference: "as",
      });
    }
    setTimeout(() => {
      router.push("/patient");
    }, 300);
  };

  return (
    <div className="space-y-4">
      {/* 1. Warm Greeting & Primary Patient Check-In CTA */}
      <div className="text-center">
        <h1 className="font-serif font-black text-3xl md:text-5xl text-ink leading-tight">
          {t("greeting")} 🌞
        </h1>
        <p className="text-base md:text-lg text-ink-secondary mt-1 max-w-xl mx-auto font-medium">
          {t("ready")}
        </p>
      </div>

      {/* Centered Primary Action: Patient Kiosk Check-In */}
      <div className="max-w-xl mx-auto w-full">
        <PortalCard
          headerBg="bg-marigold"
          emoji="🔍"
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

      {/* Small Discrete Demo Pass Button */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={handleLaunchDemo}
          className="btn-tactile inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 border-black bg-surface hover:bg-tea-light hover:border-tea text-ink text-xs font-black shadow-[2px_2px_0px_#000] transition-all cursor-pointer group"
          title="Instant Demo Patient Access for Testing & Evaluation"
        >
          <Sparkles className="h-3.5 w-3.5 text-marigold animate-pulse" />
          <span>Try Demo Patient (Biren Borah &bull; 72y &bull; MCI)</span>
          <ArrowRight className="h-3 w-3 text-tea group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 2. Sensory Calming 3D Three.js Diorama (Brahmaputra Valley & Tea Hills) */}
      <div className="pt-8">
        <Hero3DLandscape />
      </div>
    </div>
  );
}