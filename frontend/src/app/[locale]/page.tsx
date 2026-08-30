"use client";

import dynamic from "next/dynamic";
import { useRouter } from "@/i18n/navigation";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AppHeader } from "@/components/layout/AppHeader";
import { PortalCard } from "@/components/home/PortalCard";
import { RegionalStatesHub } from "@/components/home/RegionalStatesHub";
import { ClinicalImpactBadges } from "@/components/home/ClinicalImpactBadges";
import { FooterBar } from "@/components/home/FooterBar";
import { useAuthStore } from "@/store/useAuthStore";
import { playScanSuccess, playTapFeedback } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { Sparkles, ArrowRight } from "lucide-react";
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

export default function Home() {
  const t = useTranslations("home");
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleLaunchDemo = () => {
    playTapFeedback();
    playScanSuccess();
    speak("Welcome, Biren Borah! Starting your daily therapy session.", "en", 0.9);
    login("DEMO_JWT_SESSION_TOKEN_2026", {
      id: 101,
      name: "Biren Borah",
      languagePreference: "as",
    });
    setTimeout(() => {
      router.push("/patient");
    }, 400);
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas paper-texture">
      <AppHeader />

      <main className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* 1. Warm Greeting & Primary Patient Check-In CTA */}
          <div className="space-y-4">
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
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3 bg-surface-muted rounded-lg px-3 py-1.5 border-2 border-border-soft">
                    <span className="text-lg">🎫</span>
                    <span className="font-bold text-sm text-ink">{t("kiosk.showCard")}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-surface-muted rounded-lg px-3 py-1.5 border-2 border-border-soft">
                    <span className="text-lg">📷</span>
                    <span className="font-bold text-sm text-ink">{t("kiosk.scan")}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-surface-muted rounded-lg px-3 py-1.5 border-2 border-border-soft">
                    <span className="text-lg">✅</span>
                    <span className="font-bold text-sm text-ink">{t("kiosk.start")}</span>
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
          </div>

          {/* 2. Sensory Calming 3D Three.js Diorama (Brahmaputra Valley & Tea Hills) */}
          <Hero3DLandscape />

          {/* 3. MDoNER 8-State North Eastern Cultural Memory Ecosystem */}
          <RegionalStatesHub />

          {/* 4. Clinical & Public Health Impact Pillars */}
          <ClinicalImpactBadges />

          {/* 5. Footer */}
          <FooterBar />
        </div>
      </main>
    </div>
  );
}
