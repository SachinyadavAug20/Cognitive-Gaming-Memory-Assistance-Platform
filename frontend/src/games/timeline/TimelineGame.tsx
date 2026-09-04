"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Calendar,
  ScrollText,
  Briefcase,
  Music,
  Puzzle,
  RotateCcw,
  Heart,
  Sun,
  Home,
} from "lucide-react";
import { ClayKulharIcon } from "@/components/ui/CulturalIcons";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { playCorrect, playLifeSong, playPress, playTapFeedback } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { getMediaUrl } from "@/lib/api";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import type { LifeEventItem } from "@/types";

function yearValue(event: LifeEventItem): number {
  const n = Number.parseInt(String(event.year), 10);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

function shuffle<T>(list: T[]): T[] {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

type TimelineIconType = "heart" | "sun" | "tea" | "music" | "home" | "puzzle";

interface Choice {
  key: string;
  text: string;
  iconType: TimelineIconType;
  isCorrect: boolean;
}

function renderTimelineIcon(type?: TimelineIconType, className = "h-8 w-8") {
  switch (type) {
    case "heart":
      return <Heart className={`${className} text-rose-500`} />;
    case "sun":
      return <Sun className={`${className} text-amber-500`} />;
    case "tea":
      return <ClayKulharIcon className={`${className} text-amber-700`} />;
    case "music":
      return <Music className={`${className} text-indigo-500`} />;
    case "home":
      return <Home className={`${className} text-teal-600`} />;
    case "puzzle":
    default:
      return <Puzzle className={`${className} text-terracotta`} />;
  }
}

const GENERIC_CARD_KEYS = ["one", "two", "three", "four", "five"];
const GENERIC_ICONS: TimelineIconType[] = ["heart", "sun", "tea", "music", "home"];

function GameShell({
  title,
  score,
  children,
}: {
  title: string;
  score: number;
  children: React.ReactNode;
}) {
  return (
    <section className="pb-10">
      <GameHeader
        title={title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-terracotta"
      />
      <div className="mx-auto max-w-3xl px-4 pt-6">{children}</div>
    </section>
  );
}

/**
 * Life Story Journey — an Errorless-Learning autobiographical timeline.
 * The patient walks chronologically through their own life events. Wrong taps
 * are never penalised: the tapped card simply fades away and a soft voice
 * guides onward ("Let's look at the other memories"). Choosing the right card
 * blooms it into a warm, multisensory recollection with a gentle melody.
 */
export function TimelineGame() {
  const t = useTranslations("games");
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "timeline", startLevel(detail));
  const rate = speechRate(detail);

  const journey = useMemo<LifeEventItem[]>(() => {
    const events = detail?.lifeStory?.lifeEvents ?? [];
    return [...events]
      .sort((a, b) => yearValue(a) - yearValue(b) || a.event.localeCompare(b.event))
      .slice(0, 6);
  }, [detail]);

  const occupation = detail?.lifeStory?.occupation ?? "";
  const favoriteMusic = detail?.lifeStory?.favoriteMusic ?? "";

  const introSpeech = useMemo(() => {
    const personal = [
      occupation ? t("timeline.occupation", { occupation }) : "",
      favoriteMusic ? t("timeline.favoriteMusic", { favoriteMusic }) : "",
    ]
      .filter(Boolean)
      .join(" ");
    return [t("timeline.introSpeech"), personal].filter(Boolean).join(" ");
  }, [occupation, favoriteMusic, t]);

  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [hiddenKeys, setHiddenKeys] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);
  const [taps, setTaps] = useState(0);
  const [fades, setFades] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const guard = useSessionGuard({
    patientId,
    gameId: "timeline",
    level,
    startedAt,
    taps,
    errorCount: fades,
  });

  useEffect(() => () => stopSpeaking(), []);

  const currentEvent = journey[step] ?? null;
  const currentYear = currentEvent?.year || t("timeline.longAgo");

  function promptSpeechFor(year?: string): string {
    return year
      ? t("timeline.promptSpeech", { year })
      : t("timeline.promptSpeechLongAgo");
  }

  function prepareRound(index: number) {
    const correct = journey[index];
    if (!correct) return;
    const others = journey.filter((_, k) => k !== index);
    const pool: Choice[] = others.map((ev, i) => ({
      key: `event:${ev.event}:${i}`,
      text: ev.event,
      iconType: GENERIC_ICONS[i % GENERIC_ICONS.length] ?? "sun",
      isCorrect: false,
    }));
    let gi = 0;
    while (pool.length < 2) {
      pool.push({
        key: `generic:${gi}`,
        text: t(`timeline.generic.${GENERIC_CARD_KEYS[gi % GENERIC_CARD_KEYS.length]}`),
        iconType: GENERIC_ICONS[gi % GENERIC_ICONS.length] ?? "heart",
        isCorrect: false,
      });
      gi++;
    }
    const placed = shuffle(pool);
    const insertPos = index % (placed.length + 1);
    placed.splice(insertPos, 0, {
      key: `correct:${correct.year}:${correct.event}`,
      text: correct.event,
      iconType: "puzzle",
      isCorrect: true,
    });
    setChoices(placed);
    setHiddenKeys([]);
    setRevealed(false);
  }

  function begin() {
    if (!journey.length) return;
    stopSpeaking();
    playPress();
    setStep(0);
    setStartedAt(new Date().toISOString());
    setPhase("play");
    prepareRound(0);
  }

  function onPick(choice: Choice) {
    if (phase !== "play" || revealed) return;
    setTaps((v) => v + 1);
    if (choice.isCorrect) {
      playCorrect();
      setRevealed(true);
      speak(
        t("timeline.correctSpeech", {
          year: currentYear,
          event: currentEvent?.event ?? "",
        }),
        locale,
        rate
      );
    } else {
      playTapFeedback();
      setFades((v) => v + 1);
      setHiddenKeys((keys) => [...keys, choice.key]);
      speak(t("timeline.wrongSpeech"), locale, rate);
    }
  }

  function finish() {
    playCorrect();
    setPhase("done");
    guard.markCompleted();
    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "timeline",
        level,
        outcome: "completed",
        score: journey.length,
        startedAt,
        taps,
        errorCount: fades,
      });
    }
    speak(t("timeline.completeSpeech"), locale, rate);
  }

  function resetGame() {
    setPhase("intro");
    setStep(0);
    setChoices([]);
    setHiddenKeys([]);
    setRevealed(false);
    setTaps(0);
    setFades(0);
    setStartedAt(null);
  }

  function nextMemory() {
    const nextStep = step + 1;
    if (nextStep >= journey.length) {
      finish();
      return;
    }
    playPress();
    setStep(nextStep);
    prepareRound(nextStep);
  }

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell title={t("timeline.title")} score={step}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  if (!journey.length) {
    return (
      <GameShell title={t("timeline.title")} score={0}>
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <ScrollText className="h-16 w-16 text-amber-700" />
          <p className="text-2xl font-bold text-ink">{t("timeline.moreSoon")}</p>
          <p className="max-w-xs text-lg font-semibold text-ink-secondary">
            {t("timeline.moreSoonHint")}
          </p>
          <Link
            href="/patient/games"
            className="rounded-xl border-2 border-border bg-surface px-4 py-2 text-lg font-bold text-ink"
          >
            ← {t("backToHub")}
          </Link>
        </div>
      </GameShell>
    );
  }

  const promptSpeechText = promptSpeechFor(currentEvent?.year);

  return (
    <GameShell title={t("timeline.title")} score={step + (phase === "done" ? 1 : 0)}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
          <Calendar className="h-16 w-16 text-terracotta" />
          <p className="text-2xl font-bold text-ink">{t("timeline.title")}</p>
          <p className="max-w-md text-lg font-semibold text-ink-secondary">
            {t("timeline.intro")}
          </p>
          {occupation ? (
            <p className="max-w-md text-base font-semibold text-ink-secondary flex items-center justify-center gap-1.5">
              <Briefcase className="h-4 w-4 text-tea" />
              <span>{t("timeline.occupation", { occupation })}</span>
            </p>
          ) : null}
          {favoriteMusic ? (
            <p className="max-w-md text-base font-semibold text-ink-secondary flex items-center justify-center gap-1.5">
              <Music className="h-4 w-4 text-tea" />
              <span>{t("timeline.favoriteMusic", { favoriteMusic })}</span>
            </p>
          ) : null}
          <AudioPrompt text={introSpeech} label={t("listen")} size="md" />
          <ChunkyButton variant="tea" size="2xl" onClick={begin}>
            {t("timeline.start")}
          </ChunkyButton>
        </div>
      ) : phase === "play" ? (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <p className="text-base font-bold uppercase tracking-wide text-ink-secondary">
            {step + 1} / {journey.length}
          </p>

          <div>
            <h2 className="font-serif text-6xl font-black leading-none text-ink sm:text-7xl">
              {currentEvent?.year
                ? t("timeline.promptYear", { year: currentEvent.year })
                : t("timeline.promptYearLongAgo")}
            </h2>
            <p className="mt-3 text-lg font-semibold text-ink-secondary">
              {t("timeline.question")}
            </p>
          </div>

          <AudioPrompt text={promptSpeechText} label={t("listen")} size="md" />

          {!revealed ? (
            <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
              {choices.map((choice) => {
                const hidden = hiddenKeys.includes(choice.key);
                return (
                  <button
                    key={choice.key}
                    type="button"
                    onClick={() => onPick(choice)}
                    tabIndex={hidden ? -1 : 0}
                    aria-hidden={hidden || undefined}
                    className={`flex min-h-[170px] flex-col items-center justify-center gap-3 rounded-2xl border-2 border-black bg-surface p-4 text-center shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-[opacity,transform] duration-700 ease-in-out ${
                      hidden
                        ? "pointer-events-none scale-95 opacity-0"
                        : "active:translate-y-0.5 cursor-pointer"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/5">
                      {renderTimelineIcon(choice.iconType, "h-8 w-8")}
                    </div>
                    <span className="text-lg font-extrabold leading-tight text-ink">
                      {choice.text}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            currentEvent && (
              <div className="journey-reveal flex w-full max-w-xl flex-col items-center gap-4">
                {(() => {
                  const src = getMediaUrl(currentEvent.photoUrl ?? undefined);
                  return src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={currentEvent.event}
                      className="h-40 w-40 rounded-2xl border-4 border-black object-cover shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                    />
                  ) : (
                    <div className="flex h-40 w-40 items-center justify-center rounded-2xl border-4 border-black bg-terracotta-light shadow-[3px_3px_0px_rgba(0,0,0,1)]">
                      <Puzzle className="h-14 w-14 text-terracotta" />
                    </div>
                  );
                })()}

                <p className="rounded-full border-2 border-tea bg-tea-light px-4 py-1 text-base font-black text-ink">
                  {t("timeline.correct")}
                </p>

                <p className="max-w-xl font-serif text-2xl font-black leading-snug text-ink sm:text-3xl">
                  {t("timeline.correctSpeech", {
                    year: currentYear,
                    event: currentEvent.event,
                  })}
                </p>

                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group mt-1 flex flex-col items-center gap-2 cursor-pointer"
                  aria-label={t("timeline.music")}
                >
                  <span className="float-note flex h-16 w-16 items-center justify-center rounded-full border-4 border-marigold bg-marigold-light text-ink shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-transform group-active:translate-y-0.5">
                    <Music className="h-8 w-8" />
                  </span>
                  <span className="text-base font-bold text-ink">{t("timeline.music")}</span>
                  <span className="max-w-xs text-sm font-semibold text-ink-secondary">
                    {t("timeline.musicHint")}
                  </span>
                </button>

                <ChunkyButton variant="tea" size="xl" onClick={nextMemory}>
                  {step + 1 >= journey.length
                    ? t("timeline.finish")
                    : t("timeline.nextCta")}
                </ChunkyButton>
              </div>
            )
          )}
        </div>
      ) : (
        <Celebration icon={Calendar} title={t("timeline.complete")}>
          <p className="mx-auto max-w-lg px-4 text-lg font-semibold text-ink-secondary">
            {journey.length} {t("timeline.memoriesShared")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <ChunkyButton variant="tea" size="xl" onClick={resetGame}>
              <span className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                <span>{locale === "hi" ? "जीवन यात्रा फिर से देखें" : locale === "as" ? "জীৱন যাত্ৰা পুনৰ চাওক" : "Walk Timeline Again"}</span>
              </span>
            </ChunkyButton>
            <Link
              href="/patient/games"
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-border bg-surface px-6 py-3 font-bold text-ink shadow-[2px_2px_0px_#000]"
            >
              {locale === "hi" ? "← थेरेपी केंद्र" : locale === "as" ? "← থেৰাপী কক্ষ" : "← Back to Therapy Suite"}
            </Link>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}