"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { GitFork, Music, Trees, Mountain, Home, Waves, Leaf } from "lucide-react";
import { BambooShootIcon } from "@/components/ui/CulturalIcons";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import {
  playPress,
  playCorrect,
  playComplete,
  playLandmarkChime,
  playPineBreeze,
  playLifeSong,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { getGameStrings } from "@/lib/gameI18n";

export interface RootAnchor {
  id: number;
  name: string;
  x: number; // percentage
  connected: boolean;
  iconType: "tree" | "bamboo" | "rock" | "village";
}

export function RootBridgeGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "root-bridge", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "build" | "done">("intro");
  const [currentAnchorIdx, setCurrentAnchorIdx] = useState(0);
  const [anchors, setAnchors] = useState<RootAnchor[]>([]);
  const [hintActive, setHintActive] = useState(false);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalAnchors = 4;

  const guard = useSessionGuard({
    patientId,
    gameId: "root-bridge",
    level,
    startedAt,
    taps,
    errorCount,
  });

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, []);

  function startBridgeBuilding() {
    stopSpeaking();
    playPress();
    setCurrentAnchorIdx(0);
    setScore(0);
    setTaps(0);
    setErrorCount(0);
    setStartedAt(new Date().toISOString());

    const initialAnchors: RootAnchor[] = [
      { id: 0, name: "Left Riverbank Fig Tree", x: 15, connected: true, iconType: "tree" },
      { id: 1, name: "Bamboo Guiding Frame", x: 40, connected: false, iconType: "bamboo" },
      { id: 2, name: "River Gorge Pillar", x: 65, connected: false, iconType: "rock" },
      { id: 3, name: "Right Village Bank", x: 88, connected: false, iconType: "village" },
    ];
    setAnchors(initialAnchors);
    setPhase("build");
  }

  // Automatic errorless scaffolding hint after 10s idle
  useEffect(() => {
    if (phase === "build" && currentAnchorIdx < totalAnchors && !hintActive) {
      if (hintTimer.current) clearTimeout(hintTimer.current);
      hintTimer.current = setTimeout(() => {
        setHintActive(true);
        playPineBreeze();
        const nextAnchor = anchors[currentAnchorIdx + 1];
        if (nextAnchor) {
          speak(`Tap the next bamboo support at ${nextAnchor.name} to guide the root forward.`, locale, rate);
        }
      }, 10000);
    }
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, [phase, currentAnchorIdx, anchors, hintActive, locale, rate]);

  function handleAnchorTap(targetIdx: number) {
    if (phase !== "build") return;
    setTaps((v) => v + 1);

    const expectedNextIdx = currentAnchorIdx + 1;

    if (targetIdx === expectedNextIdx) {
      playLandmarkChime();
      playCorrect();
      setScore((s) => s + 1);
      setCurrentAnchorIdx(expectedNextIdx);
      setHintActive(false);

      setAnchors((prev) =>
        prev.map((a, i) => (i === expectedNextIdx ? { ...a, connected: true } : a))
      );

      if (expectedNextIdx >= totalAnchors - 1) {
        setTimeout(() => completeBridge(), 1200);
      } else {
        const nextAnchor = anchors[expectedNextIdx + 1];
        if (nextAnchor) {
          speak(`Root connected! Now guide it forward to ${nextAnchor.name}.`, locale, rate);
        }
      }
    } else {
      // Errorless Scaffolding
      setErrorCount((e) => e + 1);
      playPineBreeze();
      setHintActive(true);
      const nextExpected = anchors[expectedNextIdx];
      if (nextExpected) {
        speak(`Let us connect the root step-by-step. Tap ${nextExpected.name}.`, locale, rate);
      }
    }
  }

  function completeBridge() {
    stopSpeaking();
    playComplete();
    setPhase("done");
    guard.markCompleted();

    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "root-bridge",
        level,
        outcome: "completed",
        score: totalAnchors,
        startedAt,
        taps,
        errorCount,
      });
    }
    speak(
      "Incredible! The Living Root Bridge is complete, strong, and connects the entire village across the mountain river!",
      locale,
      rate
    );
  }

  const str = getGameStrings("root-bridge", locale);

  if (loading) return <GameLoading />;
  if (error)
    return (
      <section className="pb-12">
        <GameHeader title={str.title} score={0} backHref="/patient/games" bgColor="bg-tea" />
        <div className="mx-auto max-w-3xl px-4 pt-6">
          <GameError onRetry={reload} />
        </div>
      </section>
    );

  return (
    <section className="pb-12">
      <GameHeader title={str.title} score={score} backHref="/patient/games" bgColor="bg-tea" />
      <div className="mx-auto max-w-3xl px-4 pt-6">
        {phase === "intro" ? (
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <Trees className="h-16 w-16 text-emerald-700 animate-bounce" />
            <p className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </p>
            <p className="max-w-md text-lg font-semibold text-ink-secondary">
              {str.introSubtitle}
            </p>

            <AudioPrompt
              text={str.audioPrompt}
              label={str.listenLabel}
              size="md"
            />

            <ChunkyButton variant="tea" size="2xl" onClick={startBridgeBuilding}>
              {str.startButton}
            </ChunkyButton>
          </div>
        ) : phase === "build" ? (
          <div className="flex flex-col items-center gap-5 py-4">
            {/* BRIDGE PROGRESS HEADER */}
            <div className="w-full max-w-md flex items-center justify-between rounded-2xl border-2 border-black bg-surface px-4 py-2 shadow-sm">
              <span className="text-sm font-black text-emerald-800 flex items-center gap-1.5">
                <GitFork className="h-4 w-4 text-emerald-700" /> Cherrapunji Living Bridge
              </span>
              <span className="text-xs font-bold text-ink-secondary">
                Strands Woven: <strong className="text-tea">{currentAnchorIdx * 3} Lines</strong> ({currentAnchorIdx} / {totalAnchors - 1})
              </span>
            </div>

            {/* MOUNTAIN GORGE & ROOT BRIDGE CANVAS */}
            <div className="relative w-full max-w-sm sm:max-w-md aspect-[16/10] rounded-3xl border-4 border-[#1E3A18] bg-[#0A1A0E] p-4 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] overflow-hidden select-none flex flex-col justify-between">
              <div className="absolute top-2 right-4 text-xs font-black uppercase tracking-wider text-emerald-300/80 flex items-center gap-1">
                <Leaf className="h-3.5 w-3.5 text-emerald-400" /> Meghalaya Botanical Engineering
              </div>

              {/* Blue River Stream at the bottom */}
              <div className="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-cyan-900 via-cyan-800/80 to-transparent flex items-center justify-center opacity-70">
                <span className="text-[11px] font-black text-cyan-200 flex items-center gap-1">
                  <Waves className="h-3.5 w-3.5 text-cyan-300" /> Umshiang River Rapids
                </span>
              </div>

              {/* MULTI-STRAND LIVING ROOT LINES (Woven botanical vines, catenary curves, leaf nodes) */}
              <svg className="absolute inset-0 h-full w-full pointer-events-none z-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                {anchors.map((a, i) => {
                  if (i === 0) return null;
                  const prev = anchors[i - 1];
                  const isLinked = a.connected;
                  const midX = (prev.x + a.x) / 2;

                  return (
                    <g key={`root-strands-${i}`}>
                      {/* 1. Upper Arched Handrail Root Line */}
                      <path
                        d={`M ${prev.x} 42 Q ${midX} 35 ${a.x} 42`}
                        stroke={isLinked ? "#F59E0B" : "rgba(255,255,255,0.18)"}
                        strokeWidth={isLinked ? 3.5 : 1.5}
                        strokeDasharray={isLinked ? "none" : "3,3"}
                        fill="none"
                        className="transition-all duration-700"
                      />

                      {/* 2. Main Heavy Footpath Suspension Root Vine */}
                      <path
                        d={`M ${prev.x} 58 Q ${midX} 65 ${a.x} 58`}
                        stroke={isLinked ? "#B45309" : "rgba(255,255,255,0.15)"}
                        strokeWidth={isLinked ? 4.5 : 2}
                        strokeDasharray={isLinked ? "none" : "4,4"}
                        fill="none"
                        className="transition-all duration-700"
                      />

                      {/* 3. Secondary Braided Reinforcement Root Vine */}
                      <path
                        d={`M ${prev.x} 60 Q ${midX} 68 ${a.x} 60`}
                        stroke={isLinked ? "#78350F" : "rgba(255,255,255,0.1)"}
                        strokeWidth={isLinked ? 3 : 1.5}
                        fill="none"
                        className="transition-all duration-700"
                      />

                      {/* 4. Vertical Hanging Tendril Lines (Cross Lattice Strands) */}
                      {isLinked && (
                        <>
                          <line
                            x1={prev.x + (a.x - prev.x) * 0.25}
                            y1={40}
                            x2={prev.x + (a.x - prev.x) * 0.25}
                            y2={61}
                            stroke="#10B981"
                            strokeWidth={1.5}
                            className="animate-pulse"
                          />
                          <line
                            x1={prev.x + (a.x - prev.x) * 0.5}
                            y1={35}
                            x2={prev.x + (a.x - prev.x) * 0.5}
                            y2={65}
                            stroke="#059669"
                            strokeWidth={2}
                          />
                          <line
                            x1={prev.x + (a.x - prev.x) * 0.75}
                            y1={40}
                            x2={prev.x + (a.x - prev.x) * 0.75}
                            y2={61}
                            stroke="#10B981"
                            strokeWidth={1.5}
                            className="animate-pulse"
                          />
                          {/* Small Botanical Leaf Bud Nodes */}
                          <circle cx={midX} cy={35} r={1.5} fill="#34D399" />
                          <circle cx={midX} cy={65} r={1.8} fill="#F59E0B" />
                        </>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Interactive Root Support Anchors */}
              <div className="relative z-20 flex items-center justify-between h-full px-2">
                {anchors.map((anchor, idx) => {
                  const isExpected = idx === currentAnchorIdx + 1;

                  return (
                    <button
                      key={anchor.id}
                      type="button"
                      onClick={() => handleAnchorTap(idx)}
                      className={`btn-tactile flex flex-col items-center gap-1 transition-all duration-300 cursor-pointer ${
                        anchor.connected
                          ? "scale-110"
                          : isExpected && hintActive
                          ? "ring-4 ring-amber-400 bg-amber-400/30 scale-110 animate-pulse rounded-2xl p-1"
                          : "opacity-60"
                      }`}
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/40 border border-white/20">
                        {anchor.iconType === "tree" && <Trees className="h-8 w-8 text-emerald-400" />}
                        {anchor.iconType === "bamboo" && <BambooShootIcon className="h-8 w-8 text-lime-400" />}
                        {anchor.iconType === "rock" && <Mountain className="h-8 w-8 text-stone-300" />}
                        {anchor.iconType === "village" && <Home className="h-8 w-8 text-amber-300" />}
                      </div>
                      <span className="text-[10px] font-black text-white/90 max-w-[65px] text-center leading-tight">
                        {anchor.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* HINT BANNER IF ACTIVE */}
            {hintActive && anchors[currentAnchorIdx + 1] && (
              <div className="rounded-xl border-2 border-marigold bg-marigold-light p-3 text-center text-sm font-bold text-ink shadow-sm animate-pulse max-w-md w-full">
                Tap the next anchor support to guide the living root forward!
              </div>
            )}
          </div>
        ) : (
          /* PHASE: DONE CELEBRATION */
          <Celebration icon={GitFork} title={str.celebrationTitle}>
            <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left">
              <div className="relative w-full rounded-3xl border-4 border-black bg-[#FAF5EE] p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-ink select-none">
                <h3 className="font-serif text-2xl font-black text-emerald-800">
                  {str.celebrationTitle}
                </h3>
                <p className="text-xs font-bold text-ink-secondary mt-1">
                  {str.celebrationSubtitle}
                </p>

                {/* Music Button */}
                <div className="mt-4 flex items-center justify-between pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => playLifeSong()}
                    className="group flex items-center gap-2 rounded-xl border-2 border-black bg-emerald-100 px-3.5 py-2 text-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 cursor-pointer"
                  >
                    <Music className="h-4 w-4 text-emerald-900" />
                    <span className="text-xs font-black">Play Mountain Folk Tune</span>
                  </button>
                  <span className="text-xs font-bold text-ink-secondary">
                    Score: {score}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <ChunkyButton variant="tea" size="xl" onClick={startBridgeBuilding}>
                  {str.playAgainButton}
                </ChunkyButton>
                <Link
                  href="/patient/games"
                  className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-surface px-6 py-3 font-extrabold text-ink hover:bg-surface-muted shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                >
                  {str.backToHub}
                </Link>
              </div>
            </div>
          </Celebration>
        )}
      </div>
    </section>
  );
}
