"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { HeartHandshake, Paperclip, Volume2 } from "lucide-react";
import { usePatientDetail } from "@/games/usePatientDetail";
import { useAuthStore } from "@/store/useAuthStore";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { getMediaUrl } from "@/lib/api";
import { patientLangCode } from "@/lib/i18n";
import { MemoryLightbox } from "@/components/ui/MemoryLightbox";
import { playEncourage, playCalmTone, playTapFeedback } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { speechRate } from "@/games/config";
import { AudioToggle } from "@/components/ui/AudioToggle";
import { TherapySuiteGrid } from "@/components/patient-dashboard/TherapySuiteGrid";
import { MemorySpotlightCard } from "@/components/patient-dashboard/MemorySpotlightCard";
import { SensoryCalmCard } from "@/components/patient-dashboard/SensoryCalmCard";
import { DailyMoodTracker, type MoodKey } from "@/components/patient-dashboard/DailyMoodTracker";
import { DailyRoutineSchedule } from "@/components/patient-dashboard/DailyRoutineSchedule";

interface MoodLogEntry {
  mood: string;
  at: string;
}

const MOOD_LABEL_KEY: Record<MoodKey, string> = {
  peaceful: "wellbeing.moodPeaceful",
  okay: "wellbeing.moodOkay",
  caretaker: "wellbeing.moodCare",
};

function initialsFrom(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function moodStorageKey(patientId: number): string {
  return `cognicare-mood-${patientId}`;
}

function logMood(patientId: number, entry: MoodLogEntry): void {
  if (!patientId) return;
  try {
    const key = moodStorageKey(patientId);
    const raw = window.localStorage.getItem(key);
    const list: MoodLogEntry[] = raw ? (JSON.parse(raw) as MoodLogEntry[]) : [];
    list.push(entry);
    window.localStorage.setItem(key, JSON.stringify(list.slice(-200)));
  } catch {
    // ignore storage failures
  }
}

export default function PatientHome() {
  const t = useTranslations("patient");
  const locale = useLocale();
  const patient = useAuthStore((s) => s.patient);
  const patientId = patient?.id ?? 0;
  const { detail } = usePatientDetail();

  useIdleTimeout();

  const patientName = detail?.name ?? patient?.name ?? "";
  const langCode = patientLangCode(
    detail?.preferredLanguage ?? patient?.languagePreference ?? locale
  );
  const rate = speechRate(detail);

  const greeting = patientName
    ? t("greetingName", { name: patientName })
    : t("greeting");
  const heroText = `${greeting} ${t("audio.todayIs", {
    date: t("date"),
  })} ${t("orientation")} ${t("heroPrompt")}`;
  const avatarPhoto = detail ? getMediaUrl(detail.photoUrl) : null;
  const avatarInitials = patientName ? initialsFrom(patientName) : "";

  const joyTriggers =
    detail?.joyTriggers?.trim() || t("wellbeing.calmFallbackTriggers");
  const favoriteMusic = detail?.lifeStory?.favoriteMusic?.trim();
  const comfortText = favoriteMusic
    ? `${t("wellbeing.calmMusic", { music: favoriteMusic })} ${t(
        "wellbeing.calmTriggers",
        { triggers: joyTriggers }
      )}`
    : t("wellbeing.calmTriggers", { triggers: joyTriggers });

  const memoryItems = useMemo(() => {
    if (!detail) return [];
    const items: { text: string; photoUrl: string | null }[] = [];
    if (detail.familyMembers) {
      for (const m of detail.familyMembers) {
        items.push({
          text: `${m.name} (${m.relation || "Family"}): ${m.notes || "Beloved family member"}`,
          photoUrl: m.photoUrl ?? null,
        });
      }
    }
    if (detail.familiarPlaces) {
      for (const p of detail.familiarPlaces) {
        items.push({
          text: `${p.name}: ${p.description || "Cherished place"}`,
          photoUrl: p.photoUrl ?? null,
        });
      }
    }
    return items;
  }, [detail]);

  const [memoryIndex, setMemoryIndex] = useState(0);
  const [memoryView, setMemoryView] = useState(false);
  const [lastMood, setLastMood] = useState<MoodKey | null>(null);

  const memoryOfDay =
    memoryItems.length > 0
      ? memoryItems[memoryIndex % memoryItems.length]
      : null;

  const shuffleMemory = () => {
    playTapFeedback();
    if (memoryItems.length > 1) {
      setMemoryIndex((prev) => (prev + 1) % memoryItems.length);
    }
  };

  const chooseMood = (key: MoodKey) => {
    playEncourage();
    setLastMood(key);
    logMood(patientId, { mood: key, at: new Date().toISOString() });
    speak(t(MOOD_LABEL_KEY[key]), langCode, rate);
  };

  const moodLabels: Record<MoodKey, string> = {
    peaceful: t("wellbeing.moodPeaceful"),
    okay: t("wellbeing.moodOkay"),
    caretaker: t("wellbeing.moodCare"),
  };

  return (
    <div className="min-h-[100vh] pb-8 flex flex-col bg-[#FAF6F0]">
      {/* Patient Header Banner */}
      <div className="bg-tea border-b-4 border-black px-4 pt-5 pb-5 md:px-6 text-white shadow-sm">
        <div className="max-w-3xl mx-auto flex flex-col gap-3.5">
          <div className="flex items-center gap-2 text-white/80">
            <Paperclip className="h-4 w-4" />
            <span className="text-[11px] font-black uppercase tracking-wider">
              National Health Mission // MDoNER Cognitive Assistance Platform
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-3 border-black bg-surface overflow-hidden flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#000]">
              {avatarPhoto ? (
                <Image
                  src={avatarPhoto}
                  alt={patientName || "Patient Portrait"}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <span className="text-xl md:text-2xl font-black text-tea">
                  {avatarInitials || "P"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif font-black text-2xl md:text-3xl text-white leading-tight">
                {greeting}
              </h1>
              <p className="text-white/90 text-sm md:text-base font-semibold mt-0.5">
                {t("orientation")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-1">
            <button
              type="button"
              onClick={() => speak(heroText, langCode, rate)}
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3.5 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              <Volume2 className="h-4 w-4 text-tea" />
              <span>{t("listen")}</span>
            </button>
            <AudioToggle />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-6 flex-1 w-full">
        {/* THERAPY SUITE SECTION */}
        <TherapySuiteGrid gamesTitle={t("gamesTitle")} />

        {/* TODAY'S ROUTINE & MEDICATION SCHEDULE */}
        <DailyRoutineSchedule langCode={langCode} rate={rate} />

        {/* WELLBEING & COGNITIVE MEMORY SECTION */}
        <section aria-labelledby="wellbeing-title">
          <div className="flex items-center gap-2 border-b-2 border-black/15 pb-2">
            <HeartHandshake className="h-5 w-5 text-tea" />
            <h2 id="wellbeing-title" className="font-serif text-xl font-black text-ink">
              {t("wellbeing.title")}
            </h2>
          </div>

          <div className="mt-3.5 space-y-4">
            {/* Memory of the Day Spotlight */}
            <MemorySpotlightCard
              memoryOfDay={memoryOfDay}
              onListen={(text) => speak(text, langCode, rate)}
              onShuffle={shuffleMemory}
              onOpenLightbox={() => setMemoryView(true)}
              title={t("wellbeing.memoryTitle")}
              emptyText={t("wellbeing.memoryEmpty")}
              listenLabel={t("wellbeing.memoryListen")}
              anotherLabel={t("wellbeing.memoryAnother")}
              viewPhotoLabel={t("wellbeing.memoryView")}
            />

            <div className="grid gap-4 md:grid-cols-2">
              {/* Sensory Calming Flute Audio */}
              <SensoryCalmCard
                title={t("wellbeing.calmTitle")}
                hint={t("wellbeing.calmHint")}
                comfortText={comfortText}
                playLabel={t("wellbeing.calmPlay")}
                listenLabel={t("wellbeing.calmListen")}
                onPlayTone={playCalmTone}
                onListenText={(text) => speak(text, langCode, rate)}
              />

              {/* Mood Check-In Tracker */}
              <DailyMoodTracker
                lastMood={lastMood}
                onChooseMood={chooseMood}
                title={t("wellbeing.moodTitle")}
                moodLabels={moodLabels}
                thanksMessage={
                  lastMood
                    ? t("wellbeing.moodThanks", {
                        name: patientName || t("wellbeing.moodDear"),
                      })
                    : undefined
                }
              />
            </div>
          </div>
        </section>

        <div className="pt-2 pb-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-ink-secondary hover:text-ink font-bold text-xs transition-colors"
          >
            ← {t("back")}
          </Link>
        </div>
      </div>

      <MemoryLightbox
        open={memoryView}
        onClose={() => setMemoryView(false)}
        photoUrl={memoryOfDay?.photoUrl}
        title={t("wellbeing.memoryTitle")}
        text={memoryOfDay?.text}
        langCode={langCode}
        rate={rate}
        closeLabel="Close"
        listenLabel="Listen"
        speakingLabel="Speaking..."
      />
    </div>
  );
}
