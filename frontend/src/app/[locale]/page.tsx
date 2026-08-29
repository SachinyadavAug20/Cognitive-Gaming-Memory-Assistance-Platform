"use client";

import { useEffect, useState } from "react";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { ROUTINE } from "@/data/homeData";
import { Navbar } from "@/components/layout/Navbar";
import { PortalCard } from "@/components/home/PortalCard";
import { GamePreviewTile } from "@/components/home/GamePreviewTile";
import { RoutineItem } from "@/components/home/RoutineItem";
import { FooterBar } from "@/components/home/FooterBar";
import { api } from "@/lib/api";
import type { PatientSummary } from "@/types";
import { useTranslations } from "next-intl";

const COMING_SOON_MESSAGE =
  "This game module is currently in development for the hackathon.";

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
      <Navbar />

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

          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-3">
              <PortalCard
                headerBg="bg-terracotta"
                emoji="🧑‍🦳"
                title={t("patient.title")}
                subtitle={t("patient.subtitle")}
                description={t("patient.description")}
                actionButton={
                  <ChunkyButton
                    variant="terracotta"
                    size="xl"
                    icon={
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2a7 7 0 017 7c0 3-1.5 5-3 6.5V18a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.5C6.5 14 5 12 5 9a7 7 0 017-7z" />
                        <path d="M10 10h4M12 8v4" strokeWidth="2" />
                      </svg>
                    }
                    className="w-full text-lg md:text-xl opacity-80 cursor-not-allowed"
                    onClick={() => alert(COMING_SOON_MESSAGE)}
                  >
                    <span className="inline-flex items-center gap-2">
                      {t("patient.cta")}
                      <span className="px-1.5 py-0.5 rounded-full bg-ink/15 text-ink text-[10px] font-bold uppercase tracking-wide whitespace-nowrap">
                        {t("comingSoon")}
                      </span>
                    </span>
                  </ChunkyButton>
                }
              >
                <div className="grid grid-cols-3 gap-2">
                  <GamePreviewTile
                    emoji="🧩"
                    name="Memory Game"
                    subtitle="Level 2"
                    bgColor="bg-terracotta-light"
                    borderColor="border-terracotta/20"
                    comingSoonLabel={t("comingSoon")}
                  />
                  <GamePreviewTile
                    emoji="🗺️"
                    name="Wayfinding"
                    subtitle="8 min"
                    bgColor="bg-tea-light"
                    borderColor="border-tea/20"
                    comingSoonLabel={t("comingSoon")}
                  />
                  <GamePreviewTile
                    emoji="📷"
                    name="Photo Quiz"
                    subtitle="New!"
                    bgColor="bg-marigold-light"
                    borderColor="border-marigold/20"
                    comingSoonLabel={t("comingSoon")}
                  />
                </div>
              </PortalCard>
            </div>

            <div className="md:col-span-2">
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
            </div>
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