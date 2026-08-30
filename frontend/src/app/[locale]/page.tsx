"use client";

import { useEffect, useState } from "react";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { ROUTINE } from "@/data/homeData";
import { AppHeader } from "@/components/layout/AppHeader";
import { PortalCard } from "@/components/home/PortalCard";
import { RoutineItem } from "@/components/home/RoutineItem";
import { FooterBar } from "@/components/home/FooterBar";
import { api } from "@/lib/api";
import type { PatientSummary } from "@/types";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("home");

  const [patientCount, setPatientCount] = useState(0);

  useEffect(() => {
    let ignore = false;
    api
      .get<PatientSummary[]>("/patients")
      .then((data) => {
        if (!ignore) setPatientCount(data.length);
      })
      .catch(() => {
        /* keep 0 for a fresh, accurate system state */
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="min-h-[100vh] flex flex-col md:overflow-hidden">
      <AppHeader />

      <main className="flex-1 px-4 py-3 md:px-6 md:py-3 overflow-y-auto md:overflow-y-hidden">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="text-center md:text-left">
            <h1 className="font-[family-name:var(--font-serif)] font-bold text-2xl md:text-3xl text-ink leading-tight">
              {t("greeting")} 🌞
            </h1>
            <p className="text-base md:text-lg text-ink-secondary">
              {t("ready")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <PortalCard
              headerBg="bg-tea"
              emoji="👨‍⚕️"
              title={t("caregiver.title")}
              subtitle={t("caregiver.subtitle")}
              description={t("caregiver.description")}
              href="/caregiver"
              actionButton={
                <ChunkyButton
                  variant="tea"
                  size="xl"
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 3v18h18" />
                      <path d="M7 16l4-6 4 4 4-8" />
                    </svg>
                  }
                  className="w-full text-base"
                >
                  {t("caregiver.cta")}
                </ChunkyButton>
              }
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between bg-surface-muted rounded-lg px-3 py-1.5 border-2 border-border-soft">
                  <span className="font-bold text-sm text-ink">{t("caregiver.patients")}</span>
                  <span className="font-bold text-tea text-base">{patientCount}</span>
                </div>
                <div className="flex items-center justify-between bg-surface-muted rounded-lg px-3 py-1.5 border-2 border-border-soft">
                  <span className="font-bold text-sm text-ink">{t("caregiver.sessions")}</span>
                  <span className="font-bold text-terracotta text-base">0</span>
                </div>
                <div className="flex items-center justify-between bg-surface-muted rounded-lg px-3 py-1.5 border-2 border-border-soft">
                  <span className="font-bold text-sm text-ink">{t("caregiver.alerts")}</span>
                  <span className="font-bold text-brick text-base">0</span>
                </div>
              </div>
            </PortalCard>

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
                  className="w-full text-base"
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

          <section>
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink mb-2">
              {t("routine.label")}
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {ROUTINE.map((item) => (
                <RoutineItem key={item.title} item={item} />
              ))}
            </div>
          </section>

          <FooterBar />
        </div>
      </main>
    </div>
  );
}