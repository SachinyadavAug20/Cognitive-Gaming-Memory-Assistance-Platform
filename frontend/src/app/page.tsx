"use client";

import { useState } from "react";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { LANGUAGES, ROUTINE } from "@/data/homeData";
import { Navbar } from "@/components/layout/Navbar";
import { PortalCard } from "@/components/home/PortalCard";
import { GamePreviewTile } from "@/components/home/GamePreviewTile";
import { RoutineItem } from "@/components/home/RoutineItem";
import { FooterBar } from "@/components/home/FooterBar";

export default function Home() {
  const [lang, setLang] = useState("en");
  const [isOnline] = useState(true);

  return (
    <div className="min-h-[100vh] flex flex-col md:overflow-hidden">
      <Navbar lang={lang} onLangChange={setLang} isOnline={isOnline} languages={LANGUAGES} />

      <main className="flex-1 px-4 py-3 md:px-6 md:py-3 overflow-y-auto md:overflow-y-hidden">
        <div className="max-w-6xl mx-auto space-y-3">
          <div className="text-center md:text-left">
            <h1 className="font-[family-name:var(--font-serif)] font-bold text-2xl md:text-3xl text-ink leading-tight">
              Good Day! 🌞
            </h1>
            <p className="text-base md:text-lg text-ink-secondary">
              Ready for your daily memory exercises?
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            <div className="md:col-span-3">
              <PortalCard
                headerBg="bg-terracotta"
                emoji="🧑‍🦳"
                title="I am a Patient"
                subtitle="মই এজন ৰোগী"
                description="Start your daily memory games, view reminders, and track your progress."
                href="/patient"
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
                    className="w-full text-lg md:text-xl"
                  >
                    START TODAY&apos;S EXERCISES →
                  </ChunkyButton>
                }
              >
                <div className="grid grid-cols-3 gap-2">
                  <GamePreviewTile emoji="🧩" name="Memory Game" subtitle="Level 2" bgColor="bg-terracotta-light" borderColor="border-terracotta/20" />
                  <GamePreviewTile emoji="🗺️" name="Wayfinding" subtitle="8 min" bgColor="bg-tea-light" borderColor="border-tea/20" />
                  <GamePreviewTile emoji="📷" name="Photo Quiz" subtitle="New!" bgColor="bg-marigold-light" borderColor="border-marigold/20" />
                </div>
              </PortalCard>
            </div>

            <div className="md:col-span-2">
              <PortalCard
                headerBg="bg-tea"
                emoji="👨‍⚕️"
                title="Caregiver &amp; Health Worker"
                subtitle="ASHA / PHC Portal"
                description="Monitor patient progress, upload family photos, manage medications."
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
                    OPEN DASHBOARD
                  </ChunkyButton>
                }
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center justify-between bg-surface-muted rounded-lg px-3 py-1.5 border-2 border-border-soft">
                    <span className="font-bold text-sm text-ink">Patients</span>
                    <span className="font-bold text-tea text-base">3</span>
                  </div>
                  <div className="flex items-center justify-between bg-surface-muted rounded-lg px-3 py-1.5 border-2 border-border-soft">
                    <span className="font-bold text-sm text-ink">Sessions Today</span>
                    <span className="font-bold text-terracotta text-base">5</span>
                  </div>
                  <div className="flex items-center justify-between bg-surface-muted rounded-lg px-3 py-1.5 border-2 border-border-soft">
                    <span className="font-bold text-sm text-ink">Alerts</span>
                    <span className="font-bold text-brick text-base">1</span>
                  </div>
                </div>
              </PortalCard>
            </div>
          </div>

          <section>
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink mb-2">
              Today&apos;s Routine
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
