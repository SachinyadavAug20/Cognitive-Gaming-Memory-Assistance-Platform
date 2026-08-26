"use client";

import Link from "next/link";
import { ScrapbookCard } from "@/components/ui/ScrapbookCard";
import { BigButton } from "@/components/ui/BigButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { StatusBadge } from "@/components/ui/StatusBadge";

const REMINDERS = [
  { emoji: "💊", time: "8:00 AM", title: "Blood Pressure Medicine", status: "completed" as const },
  { emoji: "💧", time: "10:00 AM", title: "Drink Water", status: "completed" as const },
  { emoji: "💊", time: "12:00 PM", title: "Afternoon Medicine", status: "due" as const },
  { emoji: "💧", time: "2:00 PM", title: "Drink Water", status: "upcoming" as const },
];

const WATER_GLASSES = [true, true, true, true, false, false];

export default function PatientHome() {
  return (
    <div className="min-h-[100vh] pb-4 md:overflow-hidden flex flex-col">
      {/* ── Top Greeting Bar ── */}
      <div className="bg-terracotta border-b-4 border-border px-4 py-2.5 md:px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-3 border-ink bg-surface-muted flex items-center justify-center text-2xl shrink-0">
            🧓
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink-inverse leading-tight">
              Good Morning, Dadu!
            </h1>
            <p className="text-ink-inverse/80 text-sm">Wednesday, 26 August</p>
          </div>
          <AudioPrompt
            text="Good Morning, Dadu! It is Wednesday, 26th August. You have 2 tasks remaining today."
            lang="en-US"
            label="Listen"
            size="md"
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-3 mt-3 flex-1 overflow-y-auto md:overflow-y-hidden w-full">
        {/* ── Daily Rhythm: Reminders ── */}
        <section>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink mb-2">
            Today&apos;s Schedule
          </h2>
          <div className="space-y-2">
            {REMINDERS.map((r) => (
              <ScrapbookCard key={r.title + r.time} className="flex items-center gap-3 !p-3">
                <span className="text-2xl shrink-0">{r.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm text-ink leading-tight">{r.title}</div>
                  <div className="text-ink-secondary text-xs">{r.time}</div>
                </div>
                <StatusBadge status={r.status}>
                  {r.status === "completed" ? "Done" : r.status === "due" ? "Now" : "Later"}
                </StatusBadge>
              </ScrapbookCard>
            ))}
          </div>
        </section>

        {/* ── Hydration Tracker ── */}
        <section>
          <ScrapbookCard className="!p-3.5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink">
                💧 Water Today
              </h2>
              <span className="font-bold text-sm text-tea">
                {WATER_GLASSES.filter(Boolean).length} / {WATER_GLASSES.length}
              </span>
            </div>
            <div className="flex gap-2">
              {WATER_GLASSES.map((filled, i) => (
                <div key={i}
                  className={`w-10 h-12 rounded-lg border-3 border-border flex items-end justify-center overflow-hidden ${filled ? "bg-marigold-light" : "bg-surface-muted"}`}
                >
                  {filled ? (
                    <div className="w-full bg-marigold water-fill rounded-b-sm"
                      style={{ "--fill": "80%" } as React.CSSProperties}
                    />
                  ) : (
                    <div className="text-base mb-0.5 opacity-30">💧</div>
                  )}
                </div>
              ))}
            </div>
          </ScrapbookCard>
        </section>

        {/* ── Core Action: Play Today's Game ── */}
        <section>
          <ScrapbookCard className="!p-0 overflow-hidden">
            <div className="bg-marigold-light px-4 py-2 border-b-3 border-border">
              <span className="text-xs font-bold text-marigold uppercase tracking-wider">Daily Exercise</span>
            </div>
            <div className="p-3.5">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="text-4xl shrink-0">🧠</div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl text-ink mb-1">
                    Play Today&apos;s Memory Game
                  </h2>
                  <p className="text-ink-secondary text-sm">
                    Level 2 &bull; 5 Minutes &bull; With photos of your family
                  </p>
                </div>
                <Link href="/patient/puzzle" className="w-full md:w-auto shrink-0">
                  <BigButton variant="terracotta" size="lg" className="w-full md:w-auto text-base min-h-[56px] px-5 py-3">
                    Start Exercise <span className="text-lg">→</span>
                  </BigButton>
                </Link>
              </div>
            </div>
          </ScrapbookCard>
        </section>

        {/* ── Secondary Game Card ── */}
        <section>
          <ScrapbookCard className="!p-0 overflow-hidden">
            <div className="bg-tea-light px-4 py-2 border-b-3 border-border">
              <span className="text-xs font-bold text-tea uppercase tracking-wider">Bonus Exercise</span>
            </div>
            <div className="p-3.5">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="text-4xl shrink-0">🗺️</div>
                <div className="flex-1 min-w-0">
                  <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink mb-1">
                    Remember the Way
                  </h2>
                  <p className="text-ink-secondary text-sm">Navigate familiar routes through the village. 8 minutes.</p>
                </div>
                <Link href="/patient/wayfinding" className="w-full md:w-auto shrink-0">
                  <BigButton variant="tea" size="lg" className="w-full md:w-auto text-base min-h-[56px] px-5 py-3">
                    Start Wayfinding <span className="text-lg">→</span>
                  </BigButton>
                </Link>
              </div>
            </div>
          </ScrapbookCard>
        </section>

        {/* ── Back to Home ── */}
        <div className="pt-1 pb-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-ink-secondary hover:text-ink font-bold text-sm transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
