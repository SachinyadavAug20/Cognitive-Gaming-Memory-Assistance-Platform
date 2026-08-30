"use client";

import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AppHeader } from "@/components/layout/AppHeader";
import { PortalCard } from "@/components/home/PortalCard";
import { FooterBar } from "@/components/home/FooterBar";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("home");

  return (
    <div className="min-h-[100vh] flex flex-col md:overflow-hidden">
      <AppHeader />

      <main className="flex-1 px-4 py-4 md:px-6 md:py-5 overflow-y-auto md:overflow-y-hidden">
        <div className="max-w-4xl mx-auto space-y-5">
          <div className="text-center">
            <h1 className="font-[family-name:var(--font-serif)] font-bold text-2xl md:text-4xl text-ink leading-tight">
              {t("greeting")} 🌞
            </h1>
            <p className="text-base md:text-lg text-ink-secondary mt-1">
              {t("ready")}
            </p>
          </div>

          {/* Single Focused Call to Action: Patient Kiosk Check-In */}
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

          <FooterBar />
        </div>
      </main>
    </div>
  );
}