"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { GameShell } from "@/components/games/GameShell";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { Droplets, Milk, Sparkles, ArrowRight, RotateCcw, Flame } from "lucide-react";
import { AssamTeaLeafIcon, ClayKulharIcon } from "@/components/ui/CulturalIcons";
import {
  playEncourage,
  playComplete,
  playWaterRipple,
  playLeafPluck,
  playSizzle,
  playTapFeedback,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { calculateVanishingCue, validateMoveErrorless } from "@/lib/errorlessLearning";

const ALL_STEPS = [
  { key: "water", icon: Droplets, color: "text-emerald-700" },
  { key: "leaves", icon: AssamTeaLeafIcon, color: "text-emerald-700" },
  { key: "milk", icon: Milk, color: "text-amber-800" },
  { key: "sugar", icon: Sparkles, color: "text-amber-500" },
  { key: "cup", icon: ClayKulharIcon, color: "text-terracotta" },
] as const;

function stepsFor(level: number) {
  // Boil water -> Add tea leaves -> [milk] -> [sugar] -> Pour into cup
  const count = level >= 3 ? 5 : level === 2 ? 4 : 3;
  return ALL_STEPS.slice(0, count);
}

export function MakeMyTeaGame() {
  const t = useTranslations("games");
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "daily-tasks", startLevel(detail));
  const rate = speechRate(detail);
  const steps = useMemo(() => stepsFor(level), [level]);

  const joyTrigger = useMemo(
    () => detail?.joyTriggers?.trim() || t("dailyTasks.defaultJoy"),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [detail]
  );

  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [taps, setTaps] = useState(0);
  const [hintActive, setHintActive] = useState(false);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [hesitationSeconds, setHesitationSeconds] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);

  const guard = useSessionGuard({
    patientId,
    gameId: "daily-tasks",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const current = steps[Math.min(progress, steps.length - 1)];

  // Candidate choices for active executive sequencing
  const choices = useMemo(() => {
    if (!current) return [];
    const others = ALL_STEPS.filter((s) => s.key !== current.key);
    const distractorCount = level === 1 ? 1 : 2;
    const selectedDistractors = others.slice(0, distractorCount);
    const pool = [current, ...selectedDistractors];
    // Deterministic shuffle by progress
    return [...pool].sort((a, b) => (a.key.charCodeAt(0) * (progress + 3)) % 7 - (b.key.charCodeAt(0) * (progress + 3)) % 7);
  }, [current, level, progress]);

  // Track hesitation time for clinical vanishing cue progression (Clare & Jones, 2008)
  useEffect(() => {
    if (done) return;
    setHesitationSeconds(0);
    const timer = setInterval(() => {
      setHesitationSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [progress, done]);

  const scaffold = calculateVanishingCue(hesitationSeconds, attemptCount);

  useEffect(() => () => stopSpeaking(), []);

  function resetGame() {
    setStartedAt(new Date().toISOString());
    setProgress(0);
    setDone(false);
    setTaps(0);
    setHintActive(false);
    setHesitationSeconds(0);
    setAttemptCount(0);
  }

  function handleChooseChoice(stepKey: typeof ALL_STEPS[number]["key"]) {
    setTaps((v) => v + 1);

    const validation = validateMoveErrorless(stepKey, current.key);

    if (validation.isCorrect) {
      if (current.key === "water") {
        playWaterRipple();
      } else if (current.key === "leaves") {
        playLeafPluck();
        playEncourage();
      } else if (current.key === "milk") {
        playSizzle();
        playEncourage();
      } else if (current.key === "sugar") {
        playTapFeedback();
        playEncourage();
      } else {
        playWaterRipple();
      }

      setHintActive(false);
      setAttemptCount(0);
      setHesitationSeconds(0);

      if (progress + 1 >= steps.length) {
        stopSpeaking();
        playComplete();
        setDone(true);
        guard.markCompleted();
        recordGameSession(patientId, {
          gameId: "daily-tasks",
          level,
          outcome: "completed",
          score: steps.length,
          startedAt,
          taps: taps + 1,
        });
        speak(
          t("dailyTasks.completeSpeech", { activity: joyTrigger }),
          locale,
          rate
        );
      } else {
        setProgress((p) => p + 1);
        const nextStep = steps[progress + 1];
        if (nextStep) {
          speak(t(`dailyTasks.actions.${nextStep.key}`), locale, rate);
        }
      }
    } else {
      // Errorless Scaffolding soft-blocking (absorbs error without negative buzzer)
      playWaterRipple();
      setAttemptCount((a) => a + 1);
      setHintActive(true);
      speak(
        locale === "hi"
          ? `पहले ${t(`dailyTasks.actions.${current.key}`)}। सुनहरी चमक वाली वस्तु को चुनें।`
          : locale === "as"
          ? `প্ৰথমে ${t(`dailyTasks.actions.${current.key}`)}। সোণালী পোহৰ হৈ থকা বস্তুটো বাচক।`
          : `Let's first ${t(`dailyTasks.actions.${current.key}`)}. Select the softly glowing item.`,
        locale,
        rate
      );
    }
  }

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell title={t("dailyTasks.title")} score={progress}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title={t("dailyTasks.title")} score={progress}>
      {done ? (
        <Celebration icon={ClayKulharIcon} title={t("dailyTasks.complete")}>
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                  <ClayKulharIcon className="h-4 w-4 text-tea shrink-0" />
                  <span>Lal Saah Tea Freshly Brewed</span>
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-tea text-white px-2 py-0.5">
                  5/5 Steps Complete
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                Warm Cardamom Red Tea is Ready!
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1">
                You followed every step of the authentic morning tea recipe. Sit back, relax, and take a warm sip.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={resetGame} icon={<RotateCcw className="h-5 w-5" />}>
                <span>{locale === "hi" ? "फिर से चाय बनाएं" : locale === "as" ? "পুনৰ চাহ বনাওক" : "Brew Another Cup"}</span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
              >
                {locale === "hi" ? "← थेरेपी केंद्र" : locale === "as" ? "← থেৰাপী কক্ষ" : "← Back to Therapy Suite"}
              </Link>
            </div>
          </div>
        </Celebration>
      ) : (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <AudioPrompt
            text={t("dailyTasks.intro", { activity: joyTrigger })}
            label={t("listen")}
            size="md"
          />

          {/* STEP PROGRESS ICONS */}
          <div className="flex items-center gap-2.5">
            {steps.map((step, i) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.key}
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl border-3 transition-all shadow-[2px_2px_0px_#000] ${
                    i < progress
                      ? "border-tea bg-tea-light text-tea"
                      : i === progress
                      ? "scale-110 border-terracotta bg-terracotta-light ring-4 ring-amber-400"
                      : "border-black/20 bg-surface-muted opacity-50"
                  }`}
                >
                  <StepIcon className={`h-6 w-6 stroke-[2.2] ${step.color}`} />
                </div>
              );
            })}
          </div>

          <p className="text-xs font-black uppercase tracking-wider text-ink-secondary">
            {t("dailyTasks.step", {
              current: String(progress + 1),
              total: String(steps.length),
            })}
          </p>

          {/* INTERACTIVE BRASS TEA POT CONTAINER */}
          <div className="relative flex min-h-[220px] w-full max-w-md flex-col items-center justify-center gap-3 rounded-3xl border-3 border-black bg-gradient-to-b from-[#FAF3E0] to-[#EFE3C3] p-6 shadow-[5px_5px_0px_#000] overflow-hidden">
            {/* Gentle tea aroma steam curls */}
            <div className="absolute top-3 flex gap-4 text-xl opacity-60 pointer-events-none">
              <Flame className="h-5 w-5 text-amber-600 animate-pulse" />
              <Flame className="h-5 w-5 text-amber-600 animate-pulse" />
            </div>
            <div className="h-24 flex items-center justify-center animate-bounce" style={{ animationDuration: "2s" }}>
              <current.icon className={`h-20 w-20 stroke-[2] ${current.color}`} />
            </div>

            <p className="font-serif text-lg font-black text-ink">
              {t(`dailyTasks.actions.${current.key}`)}
            </p>
          </div>

          {/* CANDIDATE INGREDIENT/ACTION CHOICES */}
          <div className="w-full max-w-md">
            <p className="text-xs font-black uppercase tracking-wider text-ink-secondary mb-2.5">
              {locale === "hi" ? "अगला कदम चुनें:" : locale === "as" ? "পৰৱৰ্তী পদক্ষেপ বাচক:" : "Select the next step:"}
            </p>
            <div className={`grid gap-3 w-full ${choices.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
              {choices.map((step) => {
                const StepIcon = step.icon;
                const isTarget = step.key === current.key;
                const isCueActive = isTarget && (hintActive || scaffold.intensity !== "none" || attemptCount > 0);

                return (
                  <button
                    key={step.key}
                    type="button"
                    onClick={() => handleChooseChoice(step.key)}
                    className={`btn-tactile relative flex flex-col items-center justify-center gap-2 rounded-2xl border-3 border-black p-3.5 text-center shadow-[3px_3px_0px_#000] transition-all active:translate-y-0.5 cursor-pointer ${
                      isCueActive
                        ? scaffold.intensity === "guided_highlight" || attemptCount >= 2
                          ? "bg-amber-100 ring-4 ring-amber-500 border-amber-700 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse scale-105"
                          : scaffold.intensity === "forward_pulse" || attemptCount === 1
                          ? "bg-amber-50 ring-4 ring-amber-400/80 border-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse scale-[1.02]"
                          : "bg-amber-50/70 border-amber-500 ring-2 ring-amber-300"
                        : "bg-surface hover:bg-[#FAF5EE]"
                    }`}
                  >
                    {isCueActive && (
                      <span className="absolute -top-2.5 right-1 rounded-full bg-amber-200 border border-amber-500 px-1.5 py-0.2 text-[9px] font-black text-amber-950 uppercase tracking-tight shadow-xs">
                        Guide ✨
                      </span>
                    )}
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${isCueActive ? "bg-amber-100" : "bg-black/5"}`}>
                      <StepIcon className={`h-7 w-7 stroke-[2.2] ${step.color}`} />
                    </div>
                    <span className="text-xs font-black text-ink leading-tight">
                      {t(`dailyTasks.items.${step.key}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {!hintActive && scaffold.intensity === "none" && attemptCount === 0 && (
            <button
              type="button"
              onClick={() => {
                setHintActive(true);
                setAttemptCount(1);
              }}
              className="flex items-center gap-1.5 rounded-xl border-2 border-amber-700 bg-amber-50 px-3.5 py-1.5 text-xs font-black text-amber-950 shadow-[1px_1px_0px_#000] hover:bg-amber-100 transition-transform active:translate-y-0.5 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-700" />
              <span>{locale === "hi" ? "संकेत दिखाएं" : locale === "as" ? "সংকেত চাওক" : "Show Gentle Hint"}</span>
            </button>
          )}
        </div>
      )}
    </GameShell>
  );
}