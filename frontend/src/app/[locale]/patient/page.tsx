"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { usePatientDetail } from "@/games/usePatientDetail";
import { useAuthStore } from "@/store/useAuthStore";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { getMediaUrl } from "@/lib/api";
import { patientLangCode } from "@/lib/i18n";
import { MemoryLightbox } from "@/components/ui/MemoryLightbox";
import {
  playEncourage,
  playCalmTone,
  playTapFeedback,
} from "@/lib/sound";
import { speak } from "@/lib/speech";
import { AudioToggle } from "@/components/ui/AudioToggle";
import { speechRate } from "@/games/config";

type MoodKey = "peaceful" | "okay" | "caretaker";

interface MoodLogEntry {
  mood: string;
  emoji: string;
  at: string;
}

const MOODS: { key: MoodKey; emoji: string; color: string }[] = [
  { key: "peaceful", emoji: "😊", color: "bg-tea text-white" },
  { key: "okay", emoji: "😐", color: "bg-marigold text-ink" },
  { key: "caretaker", emoji: "😟", color: "bg-brick text-white" },
];

const MOOD_LABEL_KEY: Record<MoodKey, string> = {
  peaceful: "wellbeing.moodPeaceful",
  okay: "wellbeing.moodOkay",
  caretaker: "wellbeing.moodCare",
};

const CARD =
  "border-2 border-black rounded-2xl shadow-[3px_3px_0px_rgba(0,0,0,1)]";

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

  const memberCount = detail?.familyMembers?.length ?? 0;
  const memoryDesc =
    memberCount > 0
      ? t("cards.memory.desc", { count: String(memberCount) })
      : t("cards.memory.descZero");

  const joyTriggers =
    detail?.joyTriggers?.trim() || t("wellbeing.calmFallbackTriggers");
  const favoriteMusic = detail?.lifeStory?.favoriteMusic?.trim();
  const comfortText = favoriteMusic
    ? `${t("wellbeing.calmMusic", { music: favoriteMusic })} ${t(
        "wellbeing.calmTriggers",
        { triggers: joyTriggers }
      )}`
    : t("wellbeing.calmTriggers", { triggers: joyTriggers });

  const memoryCandidates = useMemo(() => {
    const items: {
      icon: string;
      text: string;
      photoUrl?: string | null;
    }[] = [];
    (detail?.lifeStory?.lifeEvents ?? []).forEach((event) => {
      items.push({
        icon: "🕰️",
        text: event.year ? `${event.year}: ${event.event}` : event.event,
        photoUrl: event.photoUrl ?? null,
      });
    });
    items.push({
      icon: "🌿",
      text: joyTriggers,
      photoUrl: null,
    });
    return items;
  }, [detail, joyTriggers]);

  const [memoryIndex, setMemoryIndex] = useState(0);
  const memoryOfDay =
    memoryCandidates.length > 0
      ? memoryCandidates[memoryIndex % memoryCandidates.length]
      : null;

  const shuffleMemory = () => {
    playTapFeedback();
    if (memoryCandidates.length > 0) {
      setMemoryIndex(Math.floor(Math.random() * memoryCandidates.length));
    }
  };

  const [memoryView, setMemoryView] = useState(false);

  const [lastMood, setLastMood] = useState<MoodKey | null>(null);

  const chooseMood = (mood: MoodKey, emoji: string) => {
    if (!patientId) return;
    if (mood === "peaceful") playEncourage();
    else playTapFeedback();
    logMood(patientId, { mood, emoji, at: new Date().toISOString() });
    setLastMood(mood);
    speak(t(`wellbeing.moodFeedback.${mood}`), langCode, rate);
  };

  return (
    <div className="min-h-[100vh] pb-6 md:overflow-hidden flex flex-col">
      <div className="bg-terracotta border-b-4 border-border px-4 pt-5 pb-5 md:px-6">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-3 border-ink bg-surface overflow-hidden flex items-center justify-center shrink-0">
              {avatarPhoto ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPhoto}
                  alt={patientName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl md:text-3xl font-black text-tea">
                  {avatarInitials || "🧓"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-[family-name:var(--font-serif)] font-bold text-2xl md:text-3xl text-ink-inverse leading-tight">
                {greeting}
              </h1>
              <p className="text-ink-inverse/90 text-base font-semibold mt-1">
                {t("orientation")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <SpeakButton
              text={heroText}
              langCode={langCode}
              rate={rate}
              label={t("listen")}
              speakingLabel={t("speaking")}
            />
            <AudioToggle />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-5 flex-1 overflow-y-auto md:overflow-y-hidden w-full">
        <section aria-labelledby="games-title">
          <h2
            id="games-title"
            className="font-[family-name:var(--font-serif)] text-xl font-bold text-ink flex items-center gap-2"
          >
            <span className="text-2xl">🧠</span> {t("gamesTitle")}
          </h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <GameCard
              href="/patient/games/memory"
              emoji="🧩"
              accent="bg-tea-light"
              title={t("cards.memory.title")}
              desc={memoryDesc}
            />
            <GameCard
              href="/patient/games/wayfinding"
              emoji="🗺️"
              accent="bg-marigold-light"
              title={t("cards.wayfinding.title")}
              desc={t("cards.wayfinding.desc")}
            />
            <GameCard
              href="/patient/games/jigsaw"
              emoji="🧩"
              accent="bg-tea-light"
              title={t("cards.jigsaw.title")}
              desc={t("cards.jigsaw.desc")}
            />
            <GameCard
              href="/patient/games/timeline"
              emoji="📅"
              accent="bg-marigold-light"
              title={t("cards.timeline.title")}
              desc={t("cards.timeline.desc")}
            />
            <GameCard
              href="/patient/games/daily-tasks"
              emoji="🍵"
              accent="bg-terracotta-light"
              title={t("cards.dailyTasks.title")}
              desc={t("cards.dailyTasks.desc")}
            />
            <Link
              href="/patient/games"
              className={`${CARD} btn-tactile flex min-h-[88px] items-center justify-center gap-3 rounded-2xl border-2 border-black bg-terracotta px-6 text-xl font-extrabold text-white`}
            >
              <span className="text-2xl">🎮</span>
              {t("cards.exploreAll")}
            </Link>
          </div>
        </section>

        <section aria-labelledby="wellbeing-title">
          <h2
            id="wellbeing-title"
            className="font-[family-name:var(--font-serif)] text-xl font-bold text-ink flex items-center gap-2"
          >
            <span className="text-2xl">🌼</span> {t("wellbeing.title")}
          </h2>

          <div className={`${CARD} mt-3 bg-surface p-4`}>
            <h3 className="font-[family-name:var(--font-serif)] text-lg font-bold text-ink flex items-center gap-2">
              <span className="text-xl">🕰️</span> {t("wellbeing.memoryTitle")}
            </h3>
            {memoryOfDay ? (
              <>
                <div className="mt-3 flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-tea bg-tea-light/40 p-6 text-center">
                  {memoryOfDay.photoUrl ? (
                    <button
                      type="button"
                      onClick={() => setMemoryView(true)}
                      aria-label={t("wellbeing.memoryView")}
                      className="btn-tactile block w-full max-w-xs overflow-hidden rounded-2xl border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,1)]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getMediaUrl(memoryOfDay.photoUrl) ?? ""}
                        alt={memoryOfDay.text}
                        className="h-40 w-full object-cover"
                      />
                      <span className="block bg-ink/80 px-3 py-1.5 text-sm font-bold text-white">
                        🔍 {t("wellbeing.memoryView")}
                      </span>
                    </button>
                  ) : (
                    <span className="text-6xl">{memoryOfDay.icon}</span>
                  )}
                  <p className="max-w-xl text-2xl font-bold leading-snug text-ink">
                    {memoryOfDay.text}
                  </p>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <SpeakButton
                    text={memoryOfDay.text}
                    langCode={langCode}
                    rate={rate}
                    label={t("wellbeing.memoryListen")}
                    speakingLabel={t("speaking")}
                  />
                  <button
                    type="button"
                    onClick={shuffleMemory}
                    className={`${CARD} btn-tactile inline-flex min-h-[60px] items-center gap-2 rounded-xl bg-surface px-4 text-base font-extrabold text-ink`}
                  >
                    ✨ {t("wellbeing.memoryAnother")}
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-3 text-base font-semibold text-ink-secondary">
                {t("wellbeing.memoryEmpty")}
              </p>
            )}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className={`${CARD} bg-surface p-4 flex flex-col`}>
              <h3 className="font-[family-name:var(--font-serif)] text-lg font-bold text-ink flex items-center gap-2">
                <span className="text-xl">🎶</span> {t("wellbeing.calmTitle")}
              </h3>
              <p className="mt-1 text-sm font-semibold text-ink-secondary">
                {t("wellbeing.calmHint")}
              </p>
              <p className="mt-2 text-base font-bold text-ink">{comfortText}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={playCalmTone}
                  className={`${CARD} btn-tactile inline-flex min-h-[60px] items-center gap-2 rounded-xl bg-tea px-4 text-base font-extrabold text-white`}
                >
                  <span className="text-xl">🎵</span> {t("wellbeing.calmPlay")}
                </button>
                <SpeakButton
                  text={comfortText}
                  langCode={langCode}
                  rate={rate}
                  label={t("wellbeing.calmListen")}
                  speakingLabel={t("speaking")}
                />
              </div>
            </div>

            <div className={`${CARD} bg-surface p-4 flex flex-col`}>
              <h3 className="font-[family-name:var(--font-serif)] text-lg font-bold text-ink flex items-center gap-2">
                <span className="text-xl">💛</span> {t("wellbeing.moodTitle")}
              </h3>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {MOODS.map((mood) => (
                  <button
                    key={mood.key}
                    type="button"
                    onClick={() => chooseMood(mood.key, mood.emoji)}
                    aria-label={t(MOOD_LABEL_KEY[mood.key])}
                    className={`${CARD} btn-tactile flex min-h-[88px] flex-col items-center justify-center gap-1 rounded-2xl px-1 text-base font-extrabold ${
                      mood.color
                    } ${lastMood === mood.key ? "ring-4 ring-marigold" : ""}`}
                  >
                    <span className="text-3xl">{mood.emoji}</span>
                    <span className="leading-tight">
                      {t(MOOD_LABEL_KEY[mood.key])}
                    </span>
                  </button>
                ))}
              </div>
              {lastMood && (
                <p className="mt-3 text-center text-sm font-bold text-ink">
                  {t("wellbeing.moodThanks", {
                    name: patientName || t("wellbeing.moodDear"),
                  })}
                </p>
              )}
            </div>
          </div>
        </section>

        <div className="pt-1 pb-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-ink-secondary hover:text-ink font-bold text-sm transition-colors"
          >
            {t("back")}
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
        closeLabel={t("audio.close")}
        listenLabel={t("wellbeing.memoryListen")}
        speakingLabel={t("speaking")}
      />
    </div>
  );
}

interface GameCardProps {
  href: string;
  emoji: string;
  accent: string;
  title: string;
  desc: string;
}

function GameCard({ href, emoji, accent, title, desc }: GameCardProps) {
  return (
    <Link
      href={href}
      className={`${CARD} btn-tactile group flex min-h-[112px] items-center gap-4 rounded-2xl bg-surface p-4`}
    >
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-black text-3xl ${accent}`}
      >
        {emoji}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-lg font-extrabold text-ink leading-tight">
          {title}
        </div>
        <div className="mt-1 text-sm font-semibold text-ink-secondary leading-snug">
          {desc}
        </div>
      </div>
      <span className="text-2xl text-terracotta transition-transform group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}

interface SpeakButtonProps {
  text: string;
  langCode: string;
  rate: number;
  label: string;
  speakingLabel: string;
}

function SpeakButton({
  text,
  langCode,
  rate,
  label,
  speakingLabel,
}: SpeakButtonProps) {
  const [speaking, setSpeaking] = useState(false);

  const speakIt = () => {
    speak(text, langCode, rate, () => setSpeaking(true), () => setSpeaking(false));
  };

  return (
    <button
      type="button"
      onClick={speakIt}
      aria-label={speaking ? speakingLabel : label}
      className={`${CARD} btn-tactile inline-flex min-h-[60px] items-center gap-3 rounded-xl bg-surface px-5 text-lg font-extrabold text-ink ${
        speaking ? "ring-4 ring-marigold/70 animate-pulse" : ""
      }`}
    >
      <span className="text-2xl">🔊</span>
      {speaking && (
        <span className="flex items-end gap-[3px] h-5 mr-1">
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="w-[3px] bg-terracotta rounded-full speak-bar"
            />
          ))}
        </span>
      )}
      <span>{speaking ? speakingLabel : label}</span>
    </button>
  );
}