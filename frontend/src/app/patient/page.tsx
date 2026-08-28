"use client";

import Link from "next/link";
import { REMINDERS, WATER_GLASSES } from "@/data/patientData";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { ReminderRow } from "@/components/patient/ReminderRow";
import { HydrationTracker } from "@/components/patient/HydrationTracker";
import { ExerciseBanner } from "@/components/patient/ExerciseBanner";
import { useTranslation } from "@/hooks/useTranslation";

export default function PatientHome() {
  const { t, locale } = useTranslation();

  return (
    <div className="min-h-[100vh] pb-4 md:overflow-hidden flex flex-col">
      <div className="bg-terracotta border-b-4 border-border px-4 py-2.5 md:px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-3 border-ink bg-surface-muted flex items-center justify-center text-2xl shrink-0">
            🧓
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink-inverse leading-tight">
              {t("patient.greeting")}
            </h1>
            <p className="text-ink-inverse/80 text-sm">{t("patient.date")}</p>
          </div>
          <AudioPrompt
            text={t("patient.audio.greeting")}
            lang={locale === "en" ? "en-US" : `${locale}-IN`}
            label={t("audio.listen")}
            size="md"
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-3 mt-3 flex-1 overflow-y-auto md:overflow-y-hidden w-full">
        <section>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink mb-2">
            {t("patient.schedule")}
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
            label={t("patient.exercise.daily")}
            labelColor="text-marigold"
            bgColor="bg-marigold-light"
            emoji="🧠"
            title={t("patient.exercise.daily.title")}
            description={t("patient.exercise.daily.desc")}
            href="/patient/puzzle"
            buttonText={t("patient.exercise.daily.cta")}
            buttonVariant="terracotta"
          />
        </section>

        <section>
          <ExerciseBanner
            label={t("patient.exercise.bonus")}
            labelColor="text-tea"
            bgColor="bg-tea-light"
            emoji="🗺️"
            title={t("patient.exercise.bonus.title")}
            description={t("patient.exercise.bonus.desc")}
            href="/patient/wayfinding"
            buttonText={t("patient.exercise.bonus.cta")}
            buttonVariant="tea"
          />
        </section>

        <div className="pt-1 pb-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-ink-secondary hover:text-ink font-bold text-sm transition-colors">
            {t("patient.back")}
          </Link>
        </div>
      </div>
    </div>
  );
}
