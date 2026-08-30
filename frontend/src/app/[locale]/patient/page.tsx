"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  Smile,
  Meh,
  HeartHandshake,
  User,
  Grid3X3,
  Compass,
  Brain,
  Volume2,
  Music,
  Clock,
  Sparkles,
  Coffee,
  Search,
  BookOpen,
  Leaf,
  Radio,
  Flower2,
  Utensils,
  GitFork,
  ArrowRight,
  ShieldCheck,
  Paperclip,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
  at: string;
}

const MOODS: { key: MoodKey; icon: LucideIcon; color: string }[] = [
  { key: "peaceful", icon: Smile, color: "bg-tea text-white" },
  { key: "okay", icon: Meh, color: "bg-marigold text-ink" },
  { key: "caretaker", icon: HeartHandshake, color: "bg-brick text-white" },
];

const MOOD_LABEL_KEY: Record<MoodKey, string> = {
  peaceful: "wellbeing.moodPeaceful",
  okay: "wellbeing.moodOkay",
  caretaker: "wellbeing.moodCare",
};

const CARD =
  "border-3 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)]";

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

  return (
    <div className="min-h-[100vh] pb-8 flex flex-col bg-[#FAF6F0]">
      {/* Official Government Header Banner */}
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
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarPhoto}
                  alt={patientName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl md:text-2xl font-black text-tea">
                  {avatarInitials || <User className="h-8 w-8 text-tea" />}
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
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3.5 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000]"
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
        <section aria-labelledby="games-title">
          <div className="flex items-center justify-between border-b-2 border-black/15 pb-2">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-tea" />
              <h2
                id="games-title"
                className="font-serif text-xl font-black text-ink"
              >
                {t("gamesTitle")}
              </h2>
            </div>
            <Link
              href="/patient/games"
              className="text-xs font-black text-tea flex items-center gap-1 hover:underline"
            >
              <span>View All 12 Modules</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-3.5 grid gap-4 md:grid-cols-2">
            {/* AI Reminiscence Card */}
            <Link
              href="/patient/games/grandchild-chat"
              className={`${CARD} btn-tactile group flex flex-col justify-between gap-3 bg-tea p-5 text-white transition-transform hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-white/40 bg-white/20 shadow-sm text-white">
                  <Coffee className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-lg font-black tracking-tight text-white">
                      The Grandchild&apos;s Teatime Chat
                    </span>
                    <span className="rounded-full bg-marigold px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-sm flex items-center gap-0.5">
                      <ShieldCheck className="h-2.5 w-2.5" /> AI CDTx
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-white/90 line-clamp-2 leading-relaxed">
                    Have a warm morning tea dialogue, share stories, and illuminate nostalgic family memories.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/20 pt-2 text-xs font-bold text-white/90">
                <span>Multi-Turn Dialogue</span>
                <span className="rounded-lg bg-white px-3 py-1 text-xs font-black text-tea shadow-sm group-hover:bg-surface-muted flex items-center gap-1">
                  <span>Start Chat</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>

            {/* AI Detective Card */}
            <Link
              href="/patient/games/memory-detective"
              className={`${CARD} btn-tactile group flex flex-col justify-between gap-3 bg-[#2D3748] p-5 text-white transition-transform hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-white/40 bg-white/20 shadow-sm text-white">
                  <Search className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-lg font-black tracking-tight text-amber-300">
                      The Memory Detective
                    </span>
                    <span className="rounded-full bg-marigold px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
                      3-Tier Recall
                    </span>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-white/90 line-clamp-2 leading-relaxed">
                    Listen to gentle clues from personal history and identify loved ones from verified portraits.
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-white/20 pt-2 text-xs font-bold text-white/90">
                <span>Face Recognition</span>
                <span className="rounded-lg bg-marigold px-3 py-1 text-xs font-black text-white shadow-sm group-hover:bg-amber-600 flex items-center gap-1">
                  <span>Identify</span>
                  <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Access horizontal pills */}
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            <Link
              href="/patient/games/storybook"
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-800/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-amber-800/20 shadow-sm"
            >
              <BookOpen className="h-3.5 w-3.5 text-amber-800" /> Living Chronicle
            </Link>
            <Link
              href="/patient/games/jigsaw"
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-tea/20 shadow-sm"
            >
              <Grid3X3 className="h-3.5 w-3.5 text-tea" /> Jigsaw Puzzle
            </Link>
            <Link
              href="/patient/games/wayfinding"
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-emerald-800/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-emerald-800/20 shadow-sm"
            >
              <Compass className="h-3.5 w-3.5 text-emerald-800" /> Wayfinding
            </Link>
            <Link
              href="/patient/games/tea-harvest"
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-emerald-600/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-emerald-600/20 shadow-sm"
            >
              <Leaf className="h-3.5 w-3.5 text-emerald-600" /> Tea Harvest
            </Link>
            <Link
              href="/patient/games/radio"
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-800/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-amber-800/20 shadow-sm"
            >
              <Radio className="h-3.5 w-3.5 text-amber-800" /> Akashvani Radio
            </Link>
            <Link
              href="/patient/games/lotus-lake"
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-teal-600/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-teal-600/20 shadow-sm"
            >
              <Flower2 className="h-3.5 w-3.5 text-teal-600" /> Lotus Lake
            </Link>
            <Link
              href="/patient/games/heritage-kitchen"
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-terracotta/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-terracotta/20 shadow-sm"
            >
              <Utensils className="h-3.5 w-3.5 text-terracotta" /> Kitchen
            </Link>
            <Link
              href="/patient/games/root-bridge"
              className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-green-800/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-green-800/20 shadow-sm"
            >
              <GitFork className="h-3.5 w-3.5 text-green-800" /> Root Bridge
            </Link>
          </div>
        </section>

        {/* WELLBEING & COGNITIVE MEMORY SECTION */}
        <section aria-labelledby="wellbeing-title">
          <div className="flex items-center gap-2 border-b-2 border-black/15 pb-2">
            <HeartHandshake className="h-5 w-5 text-tea" />
            <h2
              id="wellbeing-title"
              className="font-serif text-xl font-black text-ink"
            >
              {t("wellbeing.title")}
            </h2>
          </div>

          <div className={`${CARD} mt-3.5 bg-surface p-4`}>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-tea" />
              <h3 className="font-serif text-lg font-black text-ink">
                {t("wellbeing.memoryTitle")}
              </h3>
            </div>
            {memoryOfDay ? (
              <>
                <div className="mt-3 flex flex-col items-center gap-3.5 rounded-2xl border-2 border-dashed border-tea bg-tea-light/40 p-5 text-center">
                  {memoryOfDay.photoUrl && (
                    <button
                      type="button"
                      onClick={() => setMemoryView(true)}
                      aria-label={t("wellbeing.memoryView")}
                      className="btn-tactile block w-full max-w-xs overflow-hidden rounded-2xl border-2 border-black shadow-[3px_3px_0px_#000]"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getMediaUrl(memoryOfDay.photoUrl) ?? ""}
                        alt={memoryOfDay.text}
                        className="h-36 w-full object-cover"
                      />
                      <span className="block bg-ink px-3 py-1.5 text-xs font-black text-white flex items-center justify-center gap-1">
                        <Search className="h-3.5 w-3.5" /> {t("wellbeing.memoryView")}
                      </span>
                    </button>
                  )}
                  <p className="max-w-xl text-lg sm:text-xl font-black leading-snug text-ink">
                    {memoryOfDay.text}
                  </p>
                </div>
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => speak(memoryOfDay.text, langCode, rate)}
                    className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-tea px-4 py-2 text-xs font-black text-white shadow-[2px_2px_0px_#000]"
                  >
                    <Volume2 className="h-4 w-4" />
                    <span>{t("wellbeing.memoryListen")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={shuffleMemory}
                    className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-4 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted"
                  >
                    <Sparkles className="h-4 w-4 text-tea" />
                    <span>{t("wellbeing.memoryAnother")}</span>
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm font-semibold text-ink-secondary">
                {t("wellbeing.memoryEmpty")}
              </p>
            )}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className={`${CARD} bg-surface p-4 flex flex-col justify-between`}>
              <div>
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-tea" />
                  <h3 className="font-serif text-lg font-black text-ink">
                    {t("wellbeing.calmTitle")}
                  </h3>
                </div>
                <p className="mt-1 text-xs font-semibold text-ink-secondary">
                  {t("wellbeing.calmHint")}
                </p>
                <p className="mt-2 text-sm font-bold text-ink">{comfortText}</p>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={playCalmTone}
                  className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-tea px-3.5 py-2 text-xs font-black text-white shadow-[2px_2px_0px_#000]"
                >
                  <Music className="h-4 w-4" />
                  <span>{t("wellbeing.calmPlay")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => speak(comfortText, langCode, rate)}
                  className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-3.5 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted"
                >
                  <Volume2 className="h-4 w-4 text-tea" />
                  <span>{t("wellbeing.calmListen")}</span>
                </button>
              </div>
            </div>

            <div className={`${CARD} bg-surface p-4 flex flex-col justify-between`}>
              <div>
                <div className="flex items-center gap-2">
                  <Smile className="h-4 w-4 text-tea" />
                  <h3 className="font-serif text-lg font-black text-ink">
                    {t("wellbeing.moodTitle")}
                  </h3>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {MOODS.map((mood) => {
                    const IconComponent = mood.icon;
                    return (
                      <button
                        key={mood.key}
                        type="button"
                        onClick={() => chooseMood(mood.key)}
                        aria-label={t(MOOD_LABEL_KEY[mood.key])}
                        className={`btn-tactile flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-xl border-2 border-black p-2 text-xs font-black shadow-[2px_2px_0px_#000] ${
                          mood.color
                        } ${lastMood === mood.key ? "ring-3 ring-black" : ""}`}
                      >
                        <IconComponent className="h-6 w-6" />
                        <span className="leading-tight text-center">
                          {t(MOOD_LABEL_KEY[mood.key])}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              {lastMood && (
                <p className="mt-3 text-center text-xs font-bold text-ink border-t border-black/10 pt-2">
                  {t("wellbeing.moodThanks", {
                    name: patientName || t("wellbeing.moodDear"),
                  })}
                </p>
              )}
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
