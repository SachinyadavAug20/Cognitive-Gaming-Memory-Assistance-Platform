"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { REMINDERS, WATER_GLASSES } from "@/data/patientData";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { ReminderRow } from "@/components/patient/ReminderRow";
import { HydrationTracker } from "@/components/patient/HydrationTracker";
import { ExerciseBanner } from "@/components/patient/ExerciseBanner";
import { playMechanicalClick, playSuccessChime } from "@/lib/sound";
import { getMediaUrl } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { usePatientDetail } from "@/games/usePatientDetail";
import { useTranslations, useLocale } from "next-intl";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import type { Reminder, ReminderStatus } from "@/types";

type RoutineStatus = ReminderStatus;

function routineKey(patientId: number): string {
  return `cognicare-routine-${patientId}`;
}

function initialsFrom(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function PatientHome() {
  const t = useTranslations("patient");
  const locale = useLocale();
  const patient = useAuthStore((s) => s.patient);
  const patientId = patient?.id ?? 0;
  const { detail } = usePatientDetail();

  useIdleTimeout();

  const patientName = detail?.name ?? patient?.name ?? "";
  const greeting = patientName
    ? t("greetingName", { name: patientName })
    : t("greeting");
  const greetingAudio = patientName
    ? t("audio.greetingName", { name: patientName })
    : t("audio.greeting");
  const avatarPhoto = detail ? getMediaUrl(detail.photoUrl) : null;
  const avatarInitials = patientName ? initialsFrom(patientName) : "";

  const [glasses, setGlasses] = useState<boolean[]>(WATER_GLASSES);
  const [statuses, setStatuses] = useState<Record<number, RoutineStatus>>({});

  // Load persisted routine state once per patient
  useEffect(() => {
    if (!patientId) return;
    const timer = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(routineKey(patientId));
        if (raw) {
          const saved = JSON.parse(raw) as {
            glasses?: boolean[];
            statuses?: Record<number, RoutineStatus>;
          };
          if (Array.isArray(saved.glasses)) {
            setGlasses(saved.glasses.slice(0, WATER_GLASSES.length));
          }
          if (saved.statuses) setStatuses(saved.statuses);
        }
      } catch {
        // ignore storage failures
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [patientId]);

  // Persist routine state
  useEffect(() => {
    if (!patientId) return;
    try {
      window.localStorage.setItem(
        routineKey(patientId),
        JSON.stringify({ glasses, statuses })
      );
    } catch {
      // ignore storage failures
    }
  }, [glasses, statuses, patientId]);

  const reminders: Reminder[] = REMINDERS.map((r, i) => ({
    ...r,
    status: statuses[i] ?? r.status,
  }));

  const toggleReminder = (reminder: Reminder) => {
    const index = REMINDERS.findIndex(
      (r) => r.title === reminder.title && r.time === reminder.time
    );
    if (index === -1) return;
    const next = reminder.status === "completed" ? "due" : "completed";
    if (next === "completed") playSuccessChime();
    else playMechanicalClick();
    setStatuses((prev) => ({ ...prev, [index]: next }));
  };

  const toggleGlass = (index: number) => {
    setGlasses((prev) =>
      prev.map((filled, i) => (i === index ? !filled : filled))
    );
  };

  return (
    <div className="min-h-[100vh] pb-4 md:overflow-hidden flex flex-col">
      <div className="bg-terracotta border-b-4 border-border px-4 py-2.5 md:px-6">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full border-3 border-ink bg-surface-muted overflow-hidden flex items-center justify-center shrink-0">
            {avatarPhoto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPhoto}
                alt={patientName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-xl md:text-2xl font-black text-tea">
                {avatarInitials || "🧓"}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink-inverse leading-tight">
              {greeting}
            </h1>
            <p className="text-ink-inverse/80 text-sm">{t("date")}</p>
          </div>
          <AudioPrompt
            text={greetingAudio}
            lang={locale === "en" ? "en-US" : `${locale}-IN`}
            label={t("listen")}
            size="md"
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 space-y-3 mt-3 flex-1 overflow-y-auto md:overflow-y-hidden w-full">
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink">
              {t("schedule")}
            </h2>
            <AudioPrompt
              text={listenScheduleText()}
              lang={locale === "en" ? "en-US" : `${locale}-IN`}
              label={t("listen")}
              size="md"
            />
          </div>
          <div className="space-y-2">
            {reminders.map((r) => (
              <ReminderRow
                key={r.title + r.time}
                reminder={r}
                interactive
                onToggle={toggleReminder}
              />
            ))}
          </div>
        </section>

        <section>
          <HydrationTracker glasses={glasses} onToggle={toggleGlass} />
        </section>

        <section>
          <ExerciseBanner
            label={t("exercise.daily.label")}
            labelColor="text-marigold"
            bgColor="bg-marigold-light"
            emoji="🧠"
            title={t("exercise.daily.title")}
            description={t("exercise.daily.desc")}
            href="/patient/games/memory"
            buttonText={t("exercise.daily.cta")}
            buttonVariant="terracotta"
          />
        </section>

        <section>
          <ExerciseBanner
            label={t("exercise.bonus.label")}
            labelColor="text-tea"
            bgColor="bg-tea-light"
            emoji="🗺️"
            title={t("exercise.bonus.title")}
            description={t("exercise.bonus.desc")}
            href="/patient/games/wayfinding"
            buttonText={t("exercise.bonus.cta")}
            buttonVariant="tea"
          />
        </section>

        <section>
          <ExerciseBanner
            label={t("moreGames.label")}
            labelColor="text-terracotta"
            bgColor="bg-terracotta-light"
            emoji="🎮"
            title={t("moreGames.title")}
            description={t("moreGames.desc")}
            href="/patient/games"
            buttonText={t("moreGames.cta")}
            buttonVariant="terracotta"
          />
        </section>

        <div className="pt-1 pb-2">
          <Link href="/" className="inline-flex items-center gap-1.5 text-ink-secondary hover:text-ink font-bold text-sm transition-colors">
            {t("back")}
          </Link>
        </div>
      </div>
    </div>
  );

  function listenScheduleText(): string {
    return [
      t("schedule"),
      ...reminders.map((r) => `${r.title}, ${r.time}`),
      `${t("waterToday")}: ${glasses.filter(Boolean).length}`,
    ].join(". ");
  }
}