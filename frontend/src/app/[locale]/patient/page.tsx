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
          <div className="flex items-center justify-between">
            <h2
              id="games-title"
              className="font-[family-name:var(--font-serif)] text-xl font-bold text-ink flex items-center gap-2"
            >
              <span className="text-2xl">🧠</span> {t("gamesTitle")}
            </h2>
            <Link
              href="/patient/games"
              className="text-xs font-black text-terracotta underline hover:text-terracotta/80"
            >
              View All Games →
            </Link>
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {/* Memory Pieces Puzzle Card */}
            <Link
              href="/patient/games/jigsaw"
              className={`${CARD} btn-tactile group flex flex-col justify-between gap-3 rounded-2xl border-3 border-black bg-tea p-5 text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-transform hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/20 text-3xl shadow-sm">
                  🧩
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xl font-black tracking-tight">
                      {t("cards.jigsaw.title")}
                    </span>
                    <span className="rounded-full bg-marigold px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
                      ⭐ CDTx
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-white/90 line-clamp-2">
                    {t("cards.jigsaw.desc")}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/20 pt-2 text-xs font-bold text-white/90">
                <span>Adaptive 2×2 • 3×3 • 4×4</span>
                <span className="rounded-lg bg-white px-3 py-1 text-xs font-black text-tea shadow-sm group-hover:bg-surface-muted">
                  Play →
                </span>
              </div>
            </Link>

            {/* Heritage Wayfinding Card */}
            <Link
              href="/patient/games/wayfinding"
              className={`${CARD} btn-tactile group flex flex-col justify-between gap-3 rounded-2xl border-3 border-black bg-[#1F291E] p-5 text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-transform hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/20 text-3xl shadow-sm">
                  🗺️
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xl font-black tracking-tight text-amber-300">
                      {t("cards.wayfinding.title")}
                    </span>
                    <span className="rounded-full bg-tea px-2 py-0.5 text-[10px] font-black uppercase text-white shadow-sm">
                      📍 Spatial
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-white/90 line-clamp-2">
                    {t("cards.wayfinding.desc")}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/20 pt-2 text-xs font-bold text-white/90">
                <span>{detail?.familiarPlaces?.length ?? 5} Local Landmarks</span>
                <span className="rounded-lg bg-marigold px-3 py-1 text-xs font-black text-white shadow-sm group-hover:bg-marigold/90">
                  Walk →
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Access to the rest of the therapy suite */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            <Link
              href="/patient/games/weaving"
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-500/15 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-amber-500/25 shadow-sm"
            >
              <span>🧵</span> Loom of Memories
            </Link>
            <Link
              href="/patient/games/tea-harvest"
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-emerald-500/15 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-emerald-500/25 shadow-sm"
            >
              <span>🌿</span> Two Leaves & A Bud
            </Link>
            <Link
              href="/patient/games/radio"
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-800/15 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-amber-800/25 shadow-sm"
            >
              <span>📻</span> Nostalgia Tuner
            </Link>
            <Link
              href="/patient/games/lotus-lake"
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-teal-500/15 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-teal-500/25 shadow-sm"
            >
              <span>🌸</span> Lotus Ripples
            </Link>
            <Link
              href="/patient/games/heritage-kitchen"
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-terracotta/15 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-terracotta/25 shadow-sm"
            >
              <span>🍲</span> Heritage Kitchen
            </Link>
            <Link
              href="/patient/games/rhythm-hills"
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-marigold/15 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-marigold/25 shadow-sm"
            >
              <span>🪕</span> Rhythm of Hills
            </Link>
            <Link
              href="/patient/games/root-bridge"
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-green-800/15 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-green-800/25 shadow-sm"
            >
              <span>🌳</span> Root Bridge
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