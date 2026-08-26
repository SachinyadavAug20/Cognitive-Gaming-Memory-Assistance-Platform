"use client";

import { useState } from "react";
import Link from "next/link";
import { ChunkyButton } from "@/components/ui/ChunkyButton";

const LANGUAGES = [
  { code: "en", label: "ENG", full: "English" },
  { code: "as", label: "অস", full: "অসমীয়া" },
  { code: "hi", label: "हि", full: "हिन्दी" },
  { code: "mni", label: "মৈ", full: "Meitei" },
];

const ROUTINE = [
  { emoji: "💊", title: "Morning Medicine", time: "8:00 AM", status: "completed" as const },
  { emoji: "💧", title: "Water Reminder", time: "4 glasses today", status: "due" as const },
  { emoji: "👨‍👩‍👧", title: "Family Photos", time: "12 memories saved", status: "info" as const },
];

export default function Home() {
  const [lang, setLang] = useState("en");
  const [isOnline] = useState(true);

  return (
    <div className="min-h-[100vh] flex flex-col md:overflow-hidden">
      {/* ═══ TOP UTILITY BAR ═══ */}
      <header className="bg-ink border-b-4 border-border px-4 py-2 md:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-terracotta rounded-lg border-2 border-ink-inverse/20 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-ink-inverse">
                <path d="M12 2a7 7 0 017 7c0 3-1.5 5-3 6.5V18a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.5C6.5 14 5 12 5 9a7 7 0 017-7z" stroke="currentColor" strokeWidth="2" />
                <path d="M10 10h4M12 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <span className="font-[family-name:var(--font-serif)] font-bold text-base text-ink-inverse block leading-tight">
                CogniCare
              </span>
              <span className="text-[10px] text-ink-inverse/50 font-bold">
                MDoNER Cognitive Health Initiative
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border-2 text-[11px] font-bold ${isOnline ? "bg-tea-light border-tea text-tea" : "bg-marigold-light border-marigold text-marigold"}`}>
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-tea status-online" : "bg-marigold"}`} />
              <span className="hidden sm:inline">{isOnline ? "Online" : "Offline"}</span>
            </div>
            <div className="flex bg-ink-secondary/30 rounded-lg border-2 border-ink-inverse/10 overflow-hidden">
              {LANGUAGES.map((l) => (
                <button key={l.code} onClick={() => setLang(l.code)}
                  className={`px-2.5 py-1.5 text-[11px] font-bold transition-colors ${lang === l.code ? "bg-terracotta text-ink-inverse" : "text-ink-inverse/60 hover:text-ink-inverse"}`}
                  title={l.full}
                >{l.label}</button>
              ))}
            </div>
            <Link href="tel:108">
              <button className="btn-chunky bg-brick text-ink-inverse border-ink-inverse/20 rounded-lg px-3 py-1.5 min-h-[38px] text-xs font-bold shadow-none hover:shadow-none hover:translate-y-0 active:translate-y-0">
                🆘
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="flex-1 px-4 py-3 md:px-6 md:py-3 overflow-y-auto md:overflow-y-hidden">
        <div className="max-w-6xl mx-auto space-y-3">
          {/* Greeting */}
          <div className="text-center md:text-left">
            <h1 className="font-[family-name:var(--font-serif)] font-bold text-2xl md:text-3xl text-ink leading-tight">
              Good Day! 🌞
            </h1>
            <p className="text-base md:text-lg text-ink-secondary">
              Ready for your daily memory exercises?
            </p>
          </div>

          {/* TWO-PORTAL LAUNCHPAD */}
          <div className="grid md:grid-cols-5 gap-4">
            {/* PATIENT PORTAL — 60% */}
            <div className="md:col-span-3">
              <Link href="/patient" className="block group">
                <div className="scrapbook-card !p-0 overflow-hidden hover:translate-y-[-2px] transition-transform">
                  <div className="bg-terracotta px-5 py-3 border-b-4 border-border">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">🧑‍🦳</div>
                      <div>
                        <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink-inverse leading-tight">
                          I am a Patient
                        </h2>
                        <p className="text-ink-inverse/70 text-sm mt-0.5">মই এজন ৰোগী</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-base text-ink leading-snug">
                      Start your daily memory games, view reminders, and track your progress.
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-terracotta-light border-2 border-terracotta/20 rounded-lg py-2 px-2.5 text-center">
                        <div className="text-2xl mb-0.5">🧩</div>
                        <div className="text-xs font-bold text-ink">Memory Game</div>
                        <div className="text-[10px] text-ink-secondary">Level 2</div>
                      </div>
                      <div className="bg-tea-light border-2 border-tea/20 rounded-lg py-2 px-2.5 text-center">
                        <div className="text-2xl mb-0.5">🗺️</div>
                        <div className="text-xs font-bold text-ink">Wayfinding</div>
                        <div className="text-[10px] text-ink-secondary">8 min</div>
                      </div>
                      <div className="bg-marigold-light border-2 border-marigold/20 rounded-lg py-2 px-2.5 text-center">
                        <div className="text-2xl mb-0.5">📷</div>
                        <div className="text-xs font-bold text-ink">Photo Quiz</div>
                        <div className="text-[10px] text-ink-secondary">New!</div>
                      </div>
                    </div>
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
                  </div>
                </div>
              </Link>
            </div>

            {/* CAREGIVER PORTAL — 40% */}
            <div className="md:col-span-2">
              <Link href="/caregiver" className="block group">
                <div className="scrapbook-card !p-0 overflow-hidden hover:translate-y-[-2px] transition-transform h-full flex flex-col">
                  <div className="bg-tea px-5 py-3 border-b-4 border-border">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">👨‍⚕️</div>
                      <div>
                        <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg md:text-xl text-ink-inverse leading-tight">
                          Caregiver &amp; Health Worker
                        </h2>
                        <p className="text-ink-inverse/70 text-xs mt-0.5">ASHA / PHC Portal</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1 space-y-3">
                    <p className="text-sm text-ink leading-snug">
                      Monitor patient progress, upload family photos, manage medications.
                    </p>
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
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* DAILY ROUTINE */}
          <section>
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink mb-2">
              Today&apos;s Routine
            </h2>
            <div className="grid sm:grid-cols-3 gap-3">
              {ROUTINE.map((item) => (
                <div key={item.title}
                  className={`scrapbook-card !p-3 flex items-center gap-3 ${item.status === "due" ? "!border-marigold !border-4" : ""}`}
                >
                  <div className="text-2xl shrink-0">{item.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-ink leading-tight">{item.title}</div>
                    <div className="text-xs text-ink-secondary">{item.time}</div>
                  </div>
                  {item.status === "completed" && (
                    <span className="w-7 h-7 rounded-full bg-tea-light border-2 border-tea flex items-center justify-center text-tea shrink-0">
                      <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
                        <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                  {item.status === "due" && (
                    <span className="px-2.5 py-1 rounded-full bg-marigold-light border-2 border-marigold text-marigold text-xs font-bold pulse-gentle">
                      NOW
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* BOTTOM INFO BAR */}
          <footer className="border-t-2 border-border-soft pt-2 pb-1 text-center">
            <p className="text-xs text-ink-secondary">
              CogniCare &bull; MDoNER Cognitive Health Initiative &bull; SIH 2026 PS 26003
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
