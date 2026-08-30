"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playEncourage, playComplete } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession } from "@/lib/telemetry";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";

function GameShell({ title, score, children }: { title: string; score: number; children: React.ReactNode }) {
  return (
    <section className="pb-10">
      <GameHeader title={title} score={score} backHref="/patient/games" bgColor="bg-terracotta" />
      <div className="mx-auto max-w-3xl px-4 pt-6">{children}</div>
    </section>
  );
}

const ALL_STEPS = [
  { key: "water", emoji: "💧" },
  { key: "leaves", emoji: "🌿" },
  { key: "milk", emoji: "🥛" },
  { key: "sugar", emoji: "🍬" },
  { key: "cup", emoji: "🍵" },
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

  const level = startLevel(detail);
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
  const startedAt = useRef<string>(new Date().toISOString());

  const current = steps[Math.min(progress, steps.length - 1)];

  useEffect(() => {
    if (done || !current) return;
    speak(
      `${t("dailyTasks.intro", { activity: joyTrigger })} ${t(
        `dailyTasks.actions.${current.key}`
      )}`,
      locale,
      rate
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, done, current?.key]);

  useEffect(() => () => stopSpeaking(), []);

  function addStep() {
    playEncourage();
    setTaps((v) => v + 1);
    if (progress + 1 >= steps.length) {
      stopSpeaking();
      playComplete();
      setDone(true);
      recordGameSession(patientId, {
        gameId: "daily-tasks",
        level,
        outcome: "completed",
        score: steps.length,
        startedAt: startedAt.current,
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
        <Celebration emoji="🍵" title={t("dailyTasks.complete")}>
          <p className="text-xl font-bold text-ink">{t("dailyTasks.ready")}</p>
          <Link
            href="/patient"
            className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-border bg-tea px-6 py-3 font-bold text-ink-inverse"
          >
            {t("backToRoutine")}
          </Link>
        </Celebration>
      ) : (
        <div className="flex flex-col items-center gap-8 py-6">
          <AudioPrompt
            text={t("dailyTasks.intro", { activity: joyTrigger })}
            label={t("listen")}
            size="md"
          />

          <div className="flex items-center gap-2">
            {steps.map((step, i) => (
              <div
                key={step.key}
                className={`flex h-12 w-12 items-center justify-center rounded-xl border-2 text-2xl transition-all ${
                  i < progress
                    ? "border-tea bg-tea-light"
                    : i === progress
                    ? "scale-110 border-terracotta bg-terracotta-light"
                    : "border-border-soft bg-surface-muted opacity-50"
                }`}
              >
                {step.emoji}
              </div>
            ))}
          </div>

          <p className="text-lg font-bold text-ink-secondary">
            {t("dailyTasks.step", {
              current: String(progress + 1),
              total: String(steps.length),
            })}
          </p>

          <div className="flex min-h-[240px] w-full max-w-md flex-col items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-tea bg-tea-light/40 p-6">
            {progress === 0 ? (
              <p className="text-lg font-bold text-ink-secondary">
                {t("dailyTasks.intro", { activity: joyTrigger })}
              </p>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-2">
                {steps.slice(0, progress).map((step, i) => (
                  <span
                    key={step.key}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-tea bg-surface text-4xl shadow-sm"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {step.emoji}
                  </span>
                ))}
              </div>
            )}
            <div className="text-8xl">{current.emoji}</div>
          </div>

          <ChunkyButton
            variant="terracotta"
            size="2xl"
            icon={<span className="text-4xl">👉</span>}
            onClick={addStep}
          >
            {t(`dailyTasks.actions.${current.key}`)}
          </ChunkyButton>
        </div>
      )}
    </GameShell>
  );
}