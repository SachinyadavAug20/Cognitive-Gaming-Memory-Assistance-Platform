"use client";

import { useEffect, useMemo, useState } from "react";
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
import { useSessionGuard } from "@/games/useSessionGuard";
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
  const [startedAt] = useState(() => new Date().toISOString());

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

  function addStep() {
    playEncourage();
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
        <Celebration emoji="🍵" title={t("dailyTasks.complete")}>
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                  ☕ Lal Saah Tea Freshly Brewed
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
              <ChunkyButton variant="tea" size="xl" onClick={() => window.location.reload()}>
                <span>{locale === "hi" ? "फिर से चाय बनाएं ☕" : locale === "as" ? "পুনৰ চাহ বনাওক ☕" : "Brew Another Cup ☕"}</span>
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
            {steps.map((step, i) => (
              <div
                key={step.key}
                className={`flex h-12 w-12 items-center justify-center rounded-2xl border-3 text-2xl transition-all shadow-[2px_2px_0px_#000] ${
                  i < progress
                    ? "border-tea bg-tea-light text-tea"
                    : i === progress
                    ? "scale-110 border-terracotta bg-terracotta-light ring-4 ring-amber-400"
                    : "border-black/20 bg-surface-muted opacity-50"
                }`}
              >
                {step.emoji}
              </div>
            ))}
          </div>

          <p className="text-xs font-black uppercase tracking-wider text-ink-secondary">
            {t("dailyTasks.step", {
              current: String(progress + 1),
              total: String(steps.length),
            })}
          </p>

          {/* INTERACTIVE BRASS TEA POT CONTAINER */}
          <div className="relative flex min-h-[220px] w-full max-w-md flex-col items-center justify-center gap-3 rounded-3xl border-3 border-black bg-gradient-to-b from-[#FAF3E0] to-[#EFE3C3] p-6 shadow-[5px_5px_0px_#000] overflow-hidden">
            <div className="text-8xl animate-bounce" style={{ animationDuration: "2s" }}>
              {current.emoji}
            </div>

            <p className="font-serif text-lg font-black text-ink">
              {t(`dailyTasks.actions.${current.key}`)}
            </p>
          </div>

          <ChunkyButton
            variant="terracotta"
            size="2xl"
            icon={<span className="text-3xl">👉</span>}
            onClick={addStep}
          >
            {t(`dailyTasks.actions.${current.key}`)}
          </ChunkyButton>
        </div>
      )}
    </GameShell>
  );
}