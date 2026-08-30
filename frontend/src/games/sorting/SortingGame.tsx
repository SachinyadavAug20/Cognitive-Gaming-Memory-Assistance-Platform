"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { playMechanicalClick, playSuccessChime } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { recordGameSession } from "@/lib/telemetry";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate } from "@/games/config";

interface SortItem {
  key: string;
  emoji: string;
  morning: boolean;
}

const ITEMS: SortItem[] = [
  { key: "medicine", emoji: "💊", morning: true },
  { key: "tea", emoji: "🍵", morning: true },
  { key: "radio", emoji: "📻", morning: true },
  { key: "japi", emoji: "🧢", morning: false },
  { key: "glass", emoji: "💧", morning: false },
  { key: "pray", emoji: "🙏", morning: false },
];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function SortingGame() {
  const t = useTranslations("games");
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const rate = speechRate(detail);
  const [queue] = useState<SortItem[]>(() => shuffle(ITEMS));
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [wrong, setWrong] = useState(false);
  const [taps, setTaps] = useState(0);
  const startedAt = useRef<string>(new Date().toISOString());

  const current = useMemo(() => queue[Math.min(index, queue.length - 1)], [queue, index]);

  function choose(morning: boolean) {
    if (!current || done) return;
    setTaps((v) => v + 1);
    if (morning === current.morning) {
      playSuccessChime();
      setScore((s) => s + 1);
      speak(t("sorting.correctName", { item: t(`sorting.items.${current.key}`) }), locale, rate);
      if (index + 1 >= queue.length) {
        finish();
      } else {
        setIndex((i) => i + 1);
      }
    } else {
      playMechanicalClick();
      setWrong(true);
      speak(t("sorting.hint"), locale, rate);
      window.setTimeout(() => setWrong(false), 700);
    }
  }

  function finish() {
    playSuccessChime();
    setDone(true);
    recordGameSession(patientId, {
      gameId: "sorting",
      level: 1,
      outcome: "completed",
      score: queue.length,
      startedAt: startedAt.current,
      taps,
    });
  }

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell>
      {done ? (
        <Celebration emoji="🧺" title={t("sorting.complete")}>
          <p className="text-xl font-bold text-ink">
            {t("score", { score: `${score}/${queue.length}` })}
          </p>
          <Link
            href="/patient"
            className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-border bg-tea px-6 py-3 font-bold text-ink-inverse"
          >
            {t("backToRoutine")}
          </Link>
        </Celebration>
      ) : (
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="flex items-center gap-2">
            {queue.map((_, i) => (
              <span
                key={i}
                className={`h-3 w-3 rounded-full ${
                  i < index ? "bg-tea" : i === index ? "bg-terracotta" : "bg-border-soft"
                }`}
              />
            ))}
          </div>

          <p className="text-lg font-bold text-ink-secondary">{t("sorting.pick")}</p>

          <div
            className={`flex min-h-[160px] w-full max-w-sm flex-col items-center justify-center gap-3 rounded-3xl border-2 border-marigold bg-marigold/15 p-6 ${
              wrong ? "animate-shake" : ""
            }`}
          >
            <div className="text-8xl">{current.emoji}</div>
            <p className="text-2xl font-extrabold text-ink">
              {t(`sorting.items.${current.key}`)}
            </p>
          </div>

          <div className="grid w-full max-w-md grid-cols-2 gap-4">
            <button
              onClick={() => choose(true)}
              className="btn-chunky btn-chunky-marigold flex flex-col items-center gap-1"
            >
              <span className="text-4xl">☀️</span>
              <span className="font-bold">{t("sorting.morning")}</span>
            </button>
            <button
              onClick={() => choose(false)}
              className="btn-chunky btn-chunky-tea flex flex-col items-center gap-1"
            >
              <span className="text-4xl">🌙</span>
              <span className="font-bold">{t("sorting.evening")}</span>
            </button>
          </div>
        </div>
      )}
    </GameShell>
  );

  function GameShell({ children }: { children: React.ReactNode }) {
    return (
      <section className="pb-10">
        <GameHeader title={t("sorting.title")} score={score} backHref="/patient/games" bgColor="bg-tea" />
        <div className="mx-auto max-w-3xl px-4">{children}</div>
      </section>
    );
  }
}