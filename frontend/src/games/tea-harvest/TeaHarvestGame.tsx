"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Leaf, Music, ShoppingBag } from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import {
  playPress,
  playCorrect,
  playComplete,
  playLeafPluck,
  playPineBreeze,
  playLifeSong,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";

export interface TeaItem {
  id: string;
  isTenderShoot: boolean; // True = Two Leaves and a Bud (Target)
  label: string;
  emoji: string;
  description: string;
}

const TEA_ITEMS_POOL: TeaItem[] = [
  { id: "shoot-1", isTenderShoot: true, label: "Tender Two Leaves & Bud", emoji: "🌱", description: "Fresh morning golden shoot" },
  { id: "shoot-2", isTenderShoot: true, label: "Tender Golden Tip", emoji: "🌿", description: "Young top bud with 2 leaves" },
  { id: "shoot-3", isTenderShoot: true, label: "Fresh Green Shoot", emoji: "🌱", description: "Pristine first flush harvest" },
  { id: "shoot-4", isTenderShoot: true, label: "Two Leaves & Bud", emoji: "🌿", description: "Crisp tea bud" },
  { id: "coarse-1", isTenderShoot: false, label: "Mature Coarse Leaf", emoji: "🍃", description: "Tough lower branch leaf" },
  { id: "coarse-2", isTenderShoot: false, label: "Wilted Dry Leaf", emoji: "🍂", description: "Dry fallen leaf" },
  { id: "pebble", isTenderShoot: false, label: "Tea Garden Pebble", emoji: "🪨", description: "Garden stone" },
];

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
    <section className="pb-12">
      <GameHeader title={title} score={score} backHref="/patient/games" bgColor="bg-tea" />
      <div className="mx-auto max-w-3xl px-4 pt-6">{children}</div>
    </section>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function TeaHarvestGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "tea-harvest", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "pluck" | "done">("intro");
  const [basketCount, setBasketCount] = useState(0);
  const [targetGoal] = useState(6); // Pluck 6 tender shoots to complete morning basket
  const [activeItems, setActiveItems] = useState<TeaItem[]>([]);
  const [pluckedIds, setPluckedIds] = useState<string[]>([]);
  const [hintActive, setHintActive] = useState(false);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const guard = useSessionGuard({
    patientId,
    gameId: "tea-harvest",
    level,
    startedAt,
    taps,
    errorCount,
  });

  const generateTeaBush = useCallback(() => {
    const targets = TEA_ITEMS_POOL.filter((i) => i.isTenderShoot).map((item, idx) => ({
      ...item,
      id: `target-${idx}-${Date.now()}`,
    }));
    const distractors = level === 1
      ? []
      : TEA_ITEMS_POOL.filter((i) => !i.isTenderShoot).slice(0, level === 2 ? 2 : 3).map((item, idx) => ({
          ...item,
          id: `distractor-${idx}-${Date.now()}`,
        }));

    const pool = shuffle([...targets.slice(0, 3), ...distractors]);
    setActiveItems(pool);
    setPluckedIds([]);
    setHintActive(false);
  }, [level]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, []);

  function startHarvest() {
    stopSpeaking();
    playPress();
    setBasketCount(0);
    setScore(0);
    setTaps(0);
    setErrorCount(0);
    setStartedAt(new Date().toISOString());
    setPhase("pluck");
    generateTeaBush();
  }

  // Automatic errorless scaffolding visual hint after 10s idle
  useEffect(() => {
    if (phase === "pluck" && !hintActive) {
      if (hintTimer.current) clearTimeout(hintTimer.current);
      hintTimer.current = setTimeout(() => {
        setHintActive(true);
        playPineBreeze();
      }, 10000);
    }
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, [phase, hintActive]);

  function handleLeafPluck(item: TeaItem) {
    if (pluckedIds.includes(item.id) || phase !== "pluck") return;
    setTaps((v) => v + 1);

    if (item.isTenderShoot) {
      playLeafPluck();
      playCorrect();
      setPluckedIds((prev) => [...prev, item.id]);
      setScore((s) => s + 1);
      const nextBasketCount = basketCount + 1;
      setBasketCount(nextBasketCount);

      if (nextBasketCount >= targetGoal) {
        completeHarvest();
      } else {
        // If all active targets are plucked, spawn new flush
        const remainingTargets = activeItems.filter(
          (i) => i.isTenderShoot && !pluckedIds.includes(i.id) && i.id !== item.id
        );
        if (remainingTargets.length === 0) {
          setTimeout(() => generateTeaBush(), 600);
        }
      }
    } else {
      // Errorless Scaffolding for distractors
      setErrorCount((e) => e + 1);
      playPineBreeze();
      setHintActive(true);
      speak(
        "That is a coarse leaf. Let's pluck only the fresh tender shoots with two leaves and a bud.",
        locale,
        rate
      );
    }
  }

  function completeHarvest() {
    stopSpeaking();
    playComplete();
    setPhase("done");
    guard.markCompleted();

    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "tea-harvest",
        level,
        outcome: "completed",
        score: targetGoal,
        startedAt,
        taps,
        errorCount,
      });
    }
    speak(
      "Wonderful! Your morning bamboo basket is filled with pristine golden tea shoots!",
      locale,
      rate
    );
  }

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell title="Two Leaves & A Bud" score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title="Two Leaves & A Bud 🌿" score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-8 text-center">
          <div className="text-6xl animate-bounce">🌱</div>
          <p className="font-serif text-3xl font-black text-ink">
            Two Leaves & A Bud
          </p>
          <p className="max-w-md text-lg font-semibold text-ink-secondary">
            Harvest fresh morning tea shoots across the rolling green slopes of Upper Assam into your traditional woven basket.
          </p>

          {/* Educational Target Showcase */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black uppercase tracking-wider text-tea">
              What to Pluck (The Golden Rule)
            </span>
            <div className="mt-2 flex items-center gap-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-tea-light text-3xl shadow-sm">
                🌱
              </div>
              <div>
                <p className="text-sm font-black text-ink">Two Leaves and a Bud (দুটি পাত আৰু এটি কলি)</p>
                <p className="text-xs font-semibold text-ink-secondary">
                  Tender young green top shoots with pristine morning aroma.
                </p>
              </div>
            </div>
          </div>

          <AudioPrompt
            text="Welcome to the Tea Harvest. Spot and pluck the fresh two leaves and a bud into your basket."
            label="Listen"
            size="md"
          />

          <ChunkyButton variant="tea" size="2xl" onClick={startHarvest}>
            Start Morning Harvest 🌿
          </ChunkyButton>
        </div>
      ) : phase === "pluck" ? (
        <div className="flex flex-col items-center gap-5 py-4">
          {/* BASKET PROGRESS & HEADER */}
          <div className="w-full max-w-md flex items-center justify-between rounded-2xl border-2 border-black bg-surface px-4 py-2 shadow-sm">
            <span className="text-sm font-black text-tea">🧺 Khorahi Basket</span>
            <span className="text-xs font-bold text-ink-secondary">
              {basketCount} / {targetGoal} Shoots Collected
            </span>
          </div>

          {/* TEA GARDEN BUSH STAGE */}
          <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl border-4 border-[#1E3A18] bg-[#0F230C] p-5 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] overflow-hidden select-none min-h-[300px] flex flex-col justify-between">
            {/* Misty Green Tea Hills Ambient Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#86EFAC_1px,transparent_1px)] [background-size:14px_14px]" />
            <div className="absolute top-2 right-4 text-xs font-black uppercase tracking-wider text-emerald-300/80">
              🍃 Upper Assam Tea Garden
            </div>

            {/* Instruction Callout */}
            <div className="relative z-10 text-center py-1">
              <span className="rounded-full bg-black/60 border border-white/20 px-3 py-1 text-xs font-black text-white/90 backdrop-blur-sm">
                Tap the Tender Green Shoots 👇
              </span>
            </div>

            {/* Interactive Leaves on the Tea Bush */}
            <div className="relative z-10 grid grid-cols-3 gap-3 my-4">
              {activeItems.map((item) => {
                const isPlucked = pluckedIds.includes(item.id);
                const isTarget = item.isTenderShoot;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleLeafPluck(item)}
                    disabled={isPlucked}
                    className={`btn-tactile group relative flex flex-col items-center justify-center gap-1 rounded-2xl border-3 p-3 transition-all duration-300 cursor-pointer ${
                      isPlucked
                        ? "opacity-0 scale-50 pointer-events-none"
                        : hintActive && isTarget
                        ? "border-amber-400 bg-amber-400/20 ring-4 ring-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.9)] scale-105"
                        : "border-black bg-[#1B3815] hover:bg-[#254D1E] shadow-[3px_3px_0px_rgba(0,0,0,1)] active:scale-95"
                    }`}
                  >
                    <span className="text-4xl sm:text-5xl transition-transform group-hover:scale-110">
                      {item.emoji}
                    </span>
                    <span className="text-[10px] font-black text-white/90 truncate max-w-[80px]">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bamboo Basket Bottom Bar */}
            <div className="relative z-10 flex items-center justify-between rounded-xl border-2 border-amber-900/60 bg-[#3D2614] px-4 py-2 text-amber-100 shadow-inner">
              <div className="flex items-center gap-2">
                <span className="text-xl">🧺</span>
                <span className="text-xs font-black">Woven Bamboo Khorahi</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: targetGoal }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-3 w-3 rounded-full border ${
                      i < basketCount ? "bg-emerald-400 border-emerald-300" : "bg-black/40 border-white/20"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* HINT BANNER IF ACTIVE */}
          {hintActive && (
            <div className="rounded-xl border-2 border-marigold bg-marigold-light p-3 text-center text-sm font-bold text-ink shadow-sm animate-pulse max-w-md w-full">
              Look for the tender green shoot with two leaves and a bud!
            </div>
          )}
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration icon={Leaf} title="Morning Harvest Completed!">
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left">
            <div className="relative w-full rounded-3xl border-4 border-black bg-[#FAF5EE] p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-ink select-none">
              <h3 className="font-serif text-2xl font-black text-tea">
                Upper Assam Golden Flush
              </h3>
              <p className="text-xs font-bold text-ink-secondary mt-1">
                Freshly plucked tender shoots ready for steaming fragrant tea.
              </p>

              {/* Harvest Basket Graphic */}
              <div className="mt-4 flex items-center justify-center gap-3 py-4 bg-[#0F230C] rounded-2xl border-3 border-black text-white">
                <ShoppingBag className="h-12 w-12 text-amber-300" />
                <div>
                  <p className="text-lg font-black text-amber-300">{targetGoal} Shoots Collected</p>
                  <p className="text-xs text-white/80">100% Pure First Flush Quality</p>
                </div>
              </div>

              {/* Folk Melody Button */}
              <div className="mt-4 flex items-center justify-between pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3.5 py-2 text-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-xs font-black">Play Tea Garden Song</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  Harvest Score: {score}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startHarvest}>
                Harvest Another Flush
              </ChunkyButton>
              <Link
                href="/patient"
                className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-surface px-6 py-3 font-extrabold text-ink hover:bg-surface-muted shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
