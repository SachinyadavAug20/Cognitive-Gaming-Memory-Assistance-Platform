"use client";

import Link from "next/link";
import { REMINDERS, WATER_GLASSES } from "@/data/patientData";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { ReminderRow } from "@/components/patient/ReminderRow";
import { HydrationTracker } from "@/components/patient/HydrationTracker";
import { ExerciseBanner } from "@/components/patient/ExerciseBanner";

export default function PatientHome() {
  return (
    <div className="min-h-[100vh] pb-4 md:overflow-hidden flex flex-col">
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
        <section>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink mb-2">
            Today&apos;s Schedule
          </h2>
          <div className="space-y-2">
            {REMINDERS.map((r) => (
              <ReminderRow key={r.title + r.time} reminder={r} />
            ))}
          </div>
        </section>

        <section>
          <HydrationTracker glasses={WATER_GLASSES} />
        </section>

        <section>
          <ExerciseBanner
            label="Daily Exercise"
            labelColor="text-marigold"
            bgColor="bg-marigold-light"
            emoji="🧠"
            title="Play Today's Memory Game"
            description="Level 2 • 5 Minutes • With photos of your family"
            href="/patient/puzzle"
            buttonText="Start Exercise"
            buttonVariant="terracotta"
          />
        </section>

        <section>
          <ExerciseBanner
            label="Bonus Exercise"
            labelColor="text-tea"
            bgColor="bg-tea-light"
            emoji="🗺️"
            title="Remember the Way"
            description="Navigate familiar routes through the village. 8 minutes."
            href="/patient/wayfinding"
            buttonText="Start Wayfinding"
            buttonVariant="tea"
          />
        </section>

        <div className="pt-1 pb-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-ink-secondary hover:text-ink font-bold text-sm transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
