"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playCorrect, playIncorrect, playComplete, playPress } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate } from "@/games/config";

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
        bgColor="bg-tea"
      />
      <div className="mx-auto max-w-3xl px-4 pt-6">{children}</div>
    </section>
  );
}

type Category = "kitchen" | "prayer";

interface SortItem {
  key: string;
  emoji: string;
  category: Category;
}

const ITEMS: SortItem[] = [
  { key: "teacup", emoji: "🍵", category: "kitchen" },
  { key: "sugar", emoji: "🍯", category: "kitchen" },
  { key: "clock", emoji: "🕰️", category: "kitchen" },
  { key: "incense", emoji: "🪔", category: "prayer" },
  { key: "bell", emoji: "🔔", category: "prayer" },
  { key: "japi", emoji: "🧢", category: "prayer" },
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
  const [picked, setPicked] = useState(false);
  const [placed, setPlaced] = useState<SortItem[]>([]);
  const [shakeCat, setShakeCat] = useState<Category | null>(null);
  const [done, setDone] = useState(false);
  const [taps, setTaps] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [startedAt] = useState(() => new Date().toISOString());

  const current = useMemo(() => queue[Math.min(index, queue.length - 1)], [queue, index]);

  const guard = useSessionGuard({
    patientId,
    gameId: "sorting",
    level: 1,
    startedAt,
    taps,
    errorCount,
  });

  useEffect(() => () => stopSpeaking(), []);

  function pickUp() {
    if (!current || done || picked) return;
    playPress();
    setPicked(true);
    speak(
      `${t("sorting.pickBasket")} ${t(`sorting.items.${current.key}`)}`,
      locale,
      rate
    );
  }

  function placeIn(category: Category) {
    if (!current || done || !picked) return;
    setTaps((v) => v + 1);
    if (category === current.category) {
      playCorrect();
      const items = [...placed, current];
      setPlaced(items);
      setPicked(false);
      speak(
        t("sorting.correctName", { item: t(`sorting.items.${current.key}`) }),
        locale,
        rate
      );
      if (index + 1 >= queue.length) {
        finish(items);
      } else {
        setIndex((i) => i + 1);
      }
    } else {
      playIncorrect();
      setErrorCount((v) => v + 1);
      setShakeCat(category);
      speak(
        t("sorting.wrongSpeech", {
          item: t(`sorting.items.${current.key}`),
          category: t(`sorting.${current.category}`),
        }),
        locale,
        rate
      );
      window.setTimeout(() => setShakeCat(null), 800);
    }
  }

  function finish(items: SortItem[]) {
    playComplete();
    setDone(true);
    guard.markCompleted();
    recordGameSession(patientId, {
      gameId: "sorting",
      level: 1,
      outcome: "completed",
      score: items.length,
      startedAt,
      taps,
      errorCount,
    });
    speak(t("sorting.complete"), locale, rate);
  }

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell title={t("sorting.title")} score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  const inBasket = (category: Category) => placed.filter((i) => i.category === category);

  return (
    <GameShell title={t("sorting.title")} score={placed.length}>
      {done ? (
        <Celebration emoji="🧺" title={t("sorting.complete")}>
          <p className="text-xl font-bold text-ink">
            {t("score", { score: `${placed.length}/${queue.length}` })}
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
          <AudioPrompt
            text={`${t("sorting.intro")} ${t("sorting.pickItem")}`}
            label={t("listen")}
            size="md"
          />

          <div className="grid w-full max-w-xl grid-cols-2 gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => placeIn("kitchen")}
              aria-label={t("sorting.kitchen")}
              className={`flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-3xl border-[3px] border-black bg-surface p-4 shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-transform ${
                shakeCat === "kitchen" ? "animate-shake bg-brick/20" : ""
              }`}
            >
              <span className="text-6xl">🍳</span>
              <span className="text-lg font-extrabold text-ink">
                {t("sorting.kitchen")}
              </span>
              <span className="flex min-h-[40px] flex-wrap items-center justify-center gap-1">
                {inBasket("kitchen").map((item) => (
                  <span key={item.key} className="text-3xl">
                    {item.emoji}
                  </span>
                ))}
              </span>
            </button>

            <button
              type="button"
              onClick={() => placeIn("prayer")}
              aria-label={t("sorting.prayer")}
              className={`flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-3xl border-[3px] border-black bg-surface p-4 shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-transform ${
                shakeCat === "prayer" ? "animate-shake bg-brick/20" : ""
              }`}
            >
              <span className="text-6xl">🪔</span>
              <span className="text-lg font-extrabold text-ink">
                {t("sorting.prayer")}
              </span>
              <span className="flex min-h-[40px] flex-wrap items-center justify-center gap-1">
                {inBasket("prayer").map((item) => (
                  <span key={item.key} className="text-3xl">
                    {item.emoji}
                  </span>
                ))}
              </span>
            </button>
          </div>

          <p className="text-lg font-bold text-ink-secondary">
            {picked
              ? t("sorting.pickBasket")
              : t("sorting.pickItem")}
          </p>

          <div className="flex w-full max-w-xl flex-wrap items-center justify-center gap-3">
            {queue.map((item, i) => {
              const isDone = i < index;
              const isCurrent = i === index && !done;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={isCurrent ? pickUp : undefined}
                  disabled={!isCurrent}
                  aria-label={t(`sorting.items.${item.key}`)}
                  className={`flex max-w-[40%] flex-col items-center gap-1 rounded-2xl border-2 px-4 py-3 transition-all sm:max-w-[30%] ${
                    isCurrent
                      ? picked
                        ? "scale-105 border-terracotta bg-terracotta-light shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                        : "border-black bg-surface shadow-[3px_3px_0px_rgba(0,0,0,1)]"
                      : isDone
                      ? "border-tea bg-tea-light opacity-90"
                      : "border-border-soft bg-surface-muted opacity-40"
                  }`}
                >
                  <span className="text-5xl">{item.emoji}</span>
                  <span
                    className={`text-sm font-bold ${
                      isCurrent ? "text-ink" : "text-ink-secondary"
                    }`}
                  >
                    {t(`sorting.items.${item.key}`)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </GameShell>
  );
}