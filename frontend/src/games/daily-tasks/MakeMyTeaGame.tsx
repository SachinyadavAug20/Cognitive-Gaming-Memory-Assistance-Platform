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

const ALL_STEPS = [
  { key: "water", icon: Droplets, color: "text-sky-600" },
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
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());

  const guard = useSessionGuard({
    patientId,
    gameId: "daily-tasks",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const current = steps[Math.min(progress, steps.length - 1)];

  useEffect(() => () => stopSpeaking(), []);

  function resetGame() {
    setStartedAt(new Date().toISOString());
    setProgress(0);
    setDone(false);
    setTaps(0);
  }

  function addStep() {
    const currentKey = current.key;
    if (currentKey === "water") {
      playWaterRipple();
    } else if (currentKey === "leaves") {
      playLeafPluck();
      playEncourage();
    } else if (currentKey === "milk") {
      playSizzle();
      playEncourage();
    } else if (currentKey === "sugar") {
      playTapFeedback();
      playEncourage();
    } else {
      playWaterRipple();
    }
    setTaps((v) => v + 1);
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
        taps,
      });
      speak(
        t("dailyTasks.completeSpeech", { activity: joyTrigger }),
        locale,
        rate
      );
    } else {
      setProgress((p) => p + 1);
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
            <div className="h-28 flex items-center justify-center animate-bounce" style={{ animationDuration: "2s" }}>
              <current.icon className={`h-24 w-24 stroke-[2] ${current.color}`} />
            </div>

            <p className="font-serif text-lg font-black text-ink">
              {t(`dailyTasks.actions.${current.key}`)}
            </p>
          </div>

          <ChunkyButton
            variant="terracotta"
            size="2xl"
            icon={<ArrowRight className="h-6 w-6 stroke-[3]" />}
            onClick={addStep}
          >
            {t(`dailyTasks.actions.${current.key}`)}
          </ChunkyButton>
        </div>
      )}
    </GameShell>
  );
}