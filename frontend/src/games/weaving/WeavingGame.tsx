"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Sparkles, Music } from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import {
  playPress,
  playCorrect,
  playComplete,
  playShuttleClack,
  playPineBreeze,
  playLifeSong,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";

export interface YarnColor {
  id: string;
  name: string;
  hex: string;
  borderHex: string;
  accentClass: string;
  emoji: string;
}

export const YARNS: YarnColor[] = [
  { id: "gold", name: "Muga Gold", hex: "#F59E0B", borderHex: "#B45309", accentClass: "bg-amber-500", emoji: "🟡" },
  { id: "red", name: "Crimson Red", hex: "#EF4444", borderHex: "#B91C1C", accentClass: "bg-red-500", emoji: "🔴" },
  { id: "green", name: "Forest Green", hex: "#10B981", borderHex: "#047857", accentClass: "bg-emerald-500", emoji: "🟢" },
  { id: "white", name: "Eri Silk White", hex: "#F8FAFC", borderHex: "#94A3B8", accentClass: "bg-slate-100", emoji: "⚪" },
];

export interface WeavingPattern {
  id: string;
  title: string;
  subtitle: string;
  grid: string[][]; // [row][col] -> yarn.id
}

const PATTERNS: WeavingPattern[] = [
  {
    id: "gamosa",
    title: "Assamese Gamosa Diamond",
    subtitle: "Sacred crimson floral phool on white Eri silk",
    grid: [
      ["white", "red", "white"],
      ["red", "red", "red"],
      ["white", "red", "white"],
    ],
  },
  {
    id: "ryndia",
    title: "Khasi Ryndia Chevron",
    subtitle: "Traditional organic dyed gold and emerald silk weave",
    grid: [
      ["gold", "green", "gold"],
      ["green", "gold", "green"],
      ["gold", "green", "gold"],
    ],
  },
  {
    id: "phanek",
    title: "Manipuri Temple Motif",
    subtitle: "Heritage royal crimson and gold border tapestry",
    grid: [
      ["red", "gold", "red"],
      ["gold", "white", "gold"],
      ["red", "gold", "red"],
    ],
  },
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

export function WeavingGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "weaving", startLevel(detail));
  const rate = speechRate(detail);

  const [patternIdx, setPatternIdx] = useState(0);
  const [phase, setPhase] = useState<"intro" | "weave" | "done">("intro");
  const [currentStep, setCurrentStep] = useState(0); // linear index: row * cols + col
  const [wovenGrid, setWovenGrid] = useState<string[]>([]); // flat array of placed yarn IDs
  const [activeShuttle, setActiveShuttle] = useState<string | null>(null);
  const [isThrowingShuttle, setIsThrowingShuttle] = useState(false);
  const [hintActive, setHintActive] = useState(false);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pattern = PATTERNS[patternIdx] ?? PATTERNS[0];
  const flatTarget = useMemo(() => pattern.grid.flat(), [pattern]);
  const totalCells = flatTarget.length;
  const numCols = pattern.grid[0]?.length ?? 3;

  const guard = useSessionGuard({
    patientId,
    gameId: "weaving",
    level,
    startedAt,
    taps,
    errorCount,
  });

  const targetYarnId = flatTarget[currentStep] ?? null;

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, []);

  const announceStep = useCallback(
    (step: number) => {
      stopSpeaking();
      const targetId = flatTarget[step];
      const yarn = YARNS.find((y) => y.id === targetId);
      if (yarn) {
        speak(
          `Pass the shuttle with ${yarn.name} yarn.`,
          locale,
          rate
        );
      }
    },
    [flatTarget, locale, rate]
  );

  function startWeaving(selectedPatternIndex = 0) {
    stopSpeaking();
    playPress();
    setPatternIdx(selectedPatternIndex);
    setCurrentStep(0);
    setWovenGrid([]);
    setActiveShuttle(null);
    setHintActive(false);
    setScore(0);
    setTaps(0);
    setErrorCount(0);
    setStartedAt(new Date().toISOString());
    setPhase("weave");

    speak(
      `Welcome to the Loom of Memories. Let us weave the traditional ${PATTERNS[selectedPatternIndex].title}. Tap the shuttle with the matching color for each thread.`,
      locale,
      rate
    );
  }

  // Automatic errorless scaffolding hint after 10s idle
  useEffect(() => {
    if (phase === "weave" && targetYarnId && !hintActive) {
      if (hintTimer.current) clearTimeout(hintTimer.current);
      hintTimer.current = setTimeout(() => {
        setHintActive(true);
        playPineBreeze();
        const yarn = YARNS.find((y) => y.id === targetYarnId);
        if (yarn) {
          speak(
            `Notice the pattern. Pass the ${yarn.name} shuttle.`,
            locale,
            rate
          );
        }
      }, 10000);
    }
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, [phase, targetYarnId, hintActive, locale, rate]);

  function handleShuttleTap(yarnId: string) {
    if (isThrowingShuttle || phase !== "weave" || !targetYarnId) return;
    setTaps((v) => v + 1);
    setActiveShuttle(yarnId);

    const isCorrect = yarnId === targetYarnId;

    if (isCorrect) {
      playShuttleClack();
      setIsThrowingShuttle(true);
      setScore((s) => s + 1);

      setTimeout(() => {
        playCorrect();
        setWovenGrid((prev) => [...prev, yarnId]);
        setActiveShuttle(null);
        setIsThrowingShuttle(false);
        setHintActive(false);

        const nextStep = currentStep + 1;
        if (nextStep >= totalCells) {
          completeTapestry();
        } else {
          setCurrentStep(nextStep);
          announceStep(nextStep);
        }
      }, 600);
    } else {
      // Errorless Scaffolding
      setErrorCount((e) => e + 1);
      playPineBreeze();
      setHintActive(true);
      const yarn = YARNS.find((y) => y.id === targetYarnId);
      if (yarn) {
        speak(
          `Look closely at the pattern above. Choose the ${yarn.name} yarn.`,
          locale,
          rate
        );
      }
      setTimeout(() => setActiveShuttle(null), 600);
    }
  }

  function completeTapestry() {
    stopSpeaking();
    playComplete();
    setPhase("done");
    guard.markCompleted();

    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "weaving",
        level,
        outcome: "completed",
        score: totalCells,
        startedAt,
        taps,
        errorCount,
      });
    }
    speak(
      `Magnificent! You have woven the entire ${pattern.title} tapestry with perfect harmony.`,
      locale,
      rate
    );
  }

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell title="The Loom of Memories" score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title="The Loom of Memories 🧵" score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-8 text-center">
          <div className="text-6xl animate-pulse">🧵</div>
          <p className="font-serif text-3xl font-black text-ink">
            The Loom of Memories
          </p>
          <p className="max-w-md text-lg font-semibold text-ink-secondary">
            Weave traditional North-Eastern silk tapestries thread-by-thread with rhythmic wooden shuttle taps.
          </p>

          {/* Pattern Selection Cards */}
          <div className="w-full max-w-md space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-ink-secondary">
              Choose a Heritage Tapestry to Weave
            </span>
            <div className="grid gap-3">
              {PATTERNS.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => startWeaving(idx)}
                  className="btn-tactile group flex items-center justify-between rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-transform hover:scale-102"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">
                      {idx === 0 ? "🧣" : idx === 1 ? "🌿" : "👑"}
                    </span>
                    <div>
                      <p className="text-base font-black text-ink">{p.title}</p>
                      <p className="text-xs font-semibold text-ink-secondary">{p.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-xl text-tea font-black">→</span>
                </button>
              ))}
            </div>
          </div>

          <AudioPrompt
            text="Welcome to the Loom of Memories. Choose a traditional motif and weave with colorful silk shuttles."
            label="Listen"
            size="md"
          />

          <ChunkyButton variant="tea" size="2xl" onClick={() => startWeaving(0)}>
            Begin Weaving 🧵
          </ChunkyButton>
        </div>
      ) : phase === "weave" ? (
        <div className="flex flex-col items-center gap-5 py-4">
          {/* LOOM HEADER & PROGRESS */}
          <div className="w-full max-w-md flex items-center justify-between rounded-2xl border-2 border-black bg-surface px-4 py-2 shadow-sm">
            <span className="text-sm font-black text-tea">{pattern.title}</span>
            <span className="text-xs font-bold text-ink-secondary">
              Thread {currentStep + 1} of {totalCells}
            </span>
          </div>

          {/* TRADITIONAL WOODEN LOOM STAGE */}
          <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl border-4 border-[#2A241F] bg-[#181512] p-5 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] overflow-hidden select-none">
            {/* Wooden Loom Frame Top & Bottom Beams */}
            <div className="absolute top-0 inset-x-0 h-4 bg-[#4A3324] border-b-2 border-black shadow-inner" />
            <div className="absolute bottom-0 inset-x-0 h-4 bg-[#4A3324] border-t-2 border-black shadow-inner" />

            {/* Vertical Warp Threads Background */}
            <div className="absolute inset-x-6 inset-y-4 flex justify-between pointer-events-none opacity-25">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="w-[1.5px] h-full bg-amber-100/60" />
              ))}
            </div>

            {/* Target Blueprint (Master Pattern Reference) */}
            <div className="relative z-10 mx-auto mb-4 flex flex-col items-center gap-1.5 rounded-xl border-2 border-white/20 bg-black/60 p-3 backdrop-blur-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                Target Pattern Blueprint
              </span>
              <div
                className="grid gap-1.5"
                style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}
              >
                {flatTarget.map((yarnId, idx) => {
                  const yarn = YARNS.find((y) => y.id === yarnId);
                  const isCurrentTarget = idx === currentStep;
                  const isWoven = idx < currentStep;

                  return (
                    <div
                      key={`target-${idx}`}
                      className={`h-7 w-7 sm:h-8 sm:w-8 rounded-lg border-2 transition-all flex items-center justify-center ${
                        isCurrentTarget
                          ? "ring-4 ring-amber-400 scale-110 shadow-[0_0_12px_rgba(245,158,11,1)]"
                          : isWoven
                          ? "opacity-80"
                          : "opacity-40"
                      }`}
                      style={{
                        backgroundColor: yarn?.hex ?? "#888",
                        borderColor: isCurrentTarget ? "#FFF" : yarn?.borderHex ?? "#000",
                      }}
                    >
                      {isWoven && <span className="text-[10px] font-black text-black">✓</span>}
                      {isCurrentTarget && (
                        <span className="h-2 w-2 rounded-full bg-white animate-ping" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Woven Cloth Stage */}
            <div className="relative z-10 mx-auto flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/60 mb-2">
                Your Handwoven Tapestry
              </span>
              <div
                className="grid gap-2 p-3 rounded-2xl border-3 border-amber-900/60 bg-[#241A14] shadow-inner min-h-[140px] items-center"
                style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}
              >
                {Array.from({ length: totalCells }).map((_, idx) => {
                  const wovenYarnId = wovenGrid[idx];
                  const yarn = YARNS.find((y) => y.id === wovenYarnId);
                  const isCurrentSlot = idx === currentStep;

                  return (
                    <div
                      key={`woven-${idx}`}
                      className={`h-12 w-12 sm:h-14 sm:w-14 rounded-xl border-2 transition-all flex items-center justify-center overflow-hidden ${
                        wovenYarnId
                          ? "border-black shadow-md scale-100"
                          : isCurrentSlot
                          ? "border-dashed border-amber-400 bg-amber-400/10 animate-pulse"
                          : "border-dashed border-white/20 bg-black/20"
                      }`}
                      style={{
                        backgroundColor: yarn?.hex ?? "transparent",
                        borderColor: yarn?.borderHex ?? (isCurrentSlot ? "#F59E0B" : "rgba(255,255,255,0.2)"),
                      }}
                    >
                      {wovenYarnId && (
                        <span className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/30 pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* HINT BANNER IF ACTIVE */}
          {hintActive && targetYarnId && (
            <div className="rounded-xl border-2 border-marigold bg-marigold-light p-3 text-center text-sm font-bold text-ink shadow-sm animate-pulse max-w-md w-full">
              💡 Choose the {YARNS.find((y) => y.id === targetYarnId)?.name} shuttle below!
            </div>
          )}

          {/* INTERACTIVE WOODEN YARN SHUTTLES */}
          <div className="w-full max-w-md space-y-2 text-center pt-2">
            <p className="text-sm font-black text-ink-secondary uppercase tracking-wider">
              Pass Matching Shuttle Through the Loom
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {YARNS.map((yarn) => {
                const isTarget = yarn.id === targetYarnId;
                const isSelected = activeShuttle === yarn.id;

                return (
                  <button
                    key={yarn.id}
                    type="button"
                    onClick={() => handleShuttleTap(yarn.id)}
                    disabled={isThrowingShuttle}
                    className={`btn-tactile group relative flex flex-col items-center gap-1.5 rounded-2xl border-3 border-black p-3 transition-all duration-200 cursor-pointer shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-0.5 ${
                      isSelected
                        ? "scale-105 ring-4 ring-tea bg-tea text-white"
                        : hintActive && isTarget
                        ? "scale-105 ring-4 ring-marigold bg-marigold-light"
                        : "bg-surface text-ink hover:bg-surface-muted"
                    }`}
                  >
                    {/* Spool Preview */}
                    <div
                      className="h-8 w-14 rounded-full border-2 border-black flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: yarn.hex }}
                    >
                      <div className="h-full w-2 bg-amber-900/40 rounded-sm" />
                    </div>
                    <span className="text-xs font-black leading-tight truncate">
                      {yarn.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration icon={Sparkles} title="Tapestry Completed!">
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left">
            <div className="relative w-full rounded-3xl border-4 border-black bg-[#FAF5EE] p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-ink select-none">
              <h3 className="font-serif text-2xl font-black text-tea">
                {pattern.title}
              </h3>
              <p className="text-xs font-bold text-ink-secondary mt-1">
                Handwoven with Muga silk and heritage North-Eastern dyes.
              </p>

              {/* Complete Woven Tapestry Showcase */}
              <div className="mt-4 flex justify-center py-4 bg-[#181512] rounded-2xl border-3 border-black">
                <div
                  className="grid gap-2"
                  style={{ gridTemplateColumns: `repeat(${numCols}, minmax(0, 1fr))` }}
                >
                  {wovenGrid.map((yarnId, i) => {
                    const yarn = YARNS.find((y) => y.id === yarnId);
                    return (
                      <div
                        key={`done-${i}`}
                        className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl border-2 border-black shadow-md"
                        style={{ backgroundColor: yarn?.hex ?? "#888" }}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Folk Song Button */}
              <div className="mt-4 flex items-center justify-between pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3.5 py-2 text-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-xs font-black">Play Weaving Song</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  Score: {score}/{totalCells}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={() => startWeaving((patternIdx + 1) % PATTERNS.length)}>
                Weave Next Tapestry
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
