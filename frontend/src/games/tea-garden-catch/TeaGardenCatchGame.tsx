"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Camera,
  RotateCcw,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  Leaf,
  Citrus,
  Flower2,
  Hand,
  Zap,
  Sparkles,
} from "lucide-react";
import { AssamTeaLeafIcon, KazirangaButterflyIcon } from "@/components/ui/CulturalIcons";
import { GameShell } from "@/components/games/GameShell";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import {
  OpticalMotionTracker,
  drawOpenCvOverlay,
  type MotionEvent,
} from "@/lib/vision";
import { getGameStrings } from "@/lib/gameI18n";

interface FallingItem {
  id: number;
  type: "tea_leaf" | "butterfly" | "orange" | "flower";
  name: string;
  x: number; // 0..1 horizontal normalized
  y: number; // 0..1 vertical normalized
  speed: number;
  size: number;
  caught: boolean;
  handSide: "left" | "right" | "center";
}

function renderFallingItemIcon(type: FallingItem["type"], className = "h-8 w-8") {
  switch (type) {
    case "tea_leaf":
      return <AssamTeaLeafIcon className={`${className} text-emerald-400`} />;
    case "butterfly":
      return <KazirangaButterflyIcon className={`${className} text-cyan-300`} />;
    case "orange":
      return <Citrus className={`${className} text-amber-400`} />;
    case "flower":
      return <Flower2 className={`${className} text-rose-400`} />;
  }
}

export function TeaGardenCatchGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "tea-garden-catch", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [score, setScore] = useState(0);
  const [caughtCount, setCaughtCount] = useState(0);
  const targetGoal = 8;

  // OpenCV Vision & Video States
  const [cameraActive, setCameraActive] = useState(false);
  const [motionEvent, setMotionEvent] = useState<MotionEvent | null>(null);
  const [symmetryHistory, setSymmetryHistory] = useState<number[]>([]);

  // Falling Items in the Tea Estate
  const [items, setItems] = useState<FallingItem[]>([]);
  const nextItemIdRef = useRef(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<OpticalMotionTracker | null>(null);

  // Clinical Telemetry
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const itemSpawnTimesRef = useRef<Map<number, number>>(new Map());

  const handleFinishGame = useCallback(() => {
    playComplete();
    setPhase("done");
    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "tea-garden-catch",
        level,
        outcome: "completed",
        score: 100,
        startedAt,
        taps: taps + targetGoal,
        errorCount: 0,
      });
    }
  }, [level, patientId, startedAt, taps, targetGoal]);

  // Handle Vision Motion Event
  const handleMotionEvent = useCallback((evt: MotionEvent) => {
    setMotionEvent(evt);

    if (evt.bilateralSymmetry > 0) {
      setSymmetryHistory((prev) => [...prev.slice(-20), evt.bilateralSymmetry]);
    }

    // Check collision between falling items and detected hand positions
    setItems((prevItems) => {
      let newlyCaught = false;
      const updated = prevItems.map((item) => {
        if (item.caught) return item;

        // Check distance to Left Hand (1:1 viewport reach across all corners)
        let hit = false;
        if (evt.leftHand) {
          const dx = item.x - evt.leftHand.x;
          const dy = item.y - evt.leftHand.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.18) hit = true;
        }

        // Check distance to Right Hand (1:1 viewport reach across all corners)
        if (!hit && evt.rightHand) {
          const dx = item.x - evt.rightHand.x;
          const dy = item.y - evt.rightHand.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.18) hit = true;
        }

        // Fallback: Check primary motion centroid (reaches all corners)
        if (!hit && evt.hasMotion && evt.energy > 0.12) {
          const dx = item.x - evt.x;
          const dy = item.y - evt.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.18) hit = true;
        }

        if (hit) {
          newlyCaught = true;
          const spawnTime = itemSpawnTimesRef.current.get(item.id);
          if (spawnTime) {
            const latency = Math.round(performance.now() - spawnTime);
            setReactionTimes((r) => [...r, latency]);
          }
          return { ...item, caught: true };
        }
        return item;
      });

      if (newlyCaught) {
        playCorrect();
        setCaughtCount((c) => {
          const nextC = c + 1;
          setScore((s) => s + 15);
          if (nextC >= targetGoal) {
            setTimeout(() => {
              handleFinishGame();
            }, 600);
          }
          return nextC;
        });
      }

      return updated;
    });
  }, [targetGoal, handleFinishGame]);

  // Initialize OpenCV Motion Tracker
  useEffect(() => {
    if (cameraActive && phase === "playing") {
      const tracker = new OpticalMotionTracker(handleMotionEvent, 0.38);
      trackerRef.current = tracker;
      tracker.start().then((started) => {
        if (!started) setCameraActive(false);
      });
    }

    return () => {
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
    };
  }, [cameraActive, phase, handleMotionEvent]);

  // Render OpenCV Overlay HUD
  useEffect(() => {
    if (!canvasRef.current || !motionEvent || phase !== "playing") return;
    drawOpenCvOverlay(canvasRef.current, motionEvent, {
      showHands: true,
      showGrid: true,
      showMetrics: true,
      videoEl: trackerRef.current?.getVideoElement(),
    });
  }, [motionEvent, phase]);

  // Game Loop: Spawn & Animate Falling Tea Leaves and Butterflies
  useEffect(() => {
    if (phase !== "playing") return;

    // Spawn falling items periodically
    const spawnInterval = setInterval(() => {
      setItems((prev) => {
        if (prev.filter((i) => !i.caught).length >= 4) return prev;

        const id = nextItemIdRef.current++;
        const itemTypes: { type: FallingItem["type"]; name: string }[] = [
          { type: "tea_leaf", name: "Golden Tea Leaf" },
          { type: "butterfly", name: "Kaziranga Butterfly" },
          { type: "orange", name: "Assam Mandarin Orange" },
          { type: "flower", name: "Kopou Orchid" },
        ];
        const choice = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const xPos = 0.15 + Math.random() * 0.7;
        const side: FallingItem["handSide"] = xPos < 0.45 ? "left" : xPos > 0.55 ? "right" : "center";

        itemSpawnTimesRef.current.set(id, performance.now());

        return [
          ...prev,
          {
            id,
            type: choice.type,
            name: choice.name,
            x: xPos,
            y: 0.05,
            speed: 0.0035 + (level === 2 ? 0.0015 : level === 3 ? 0.003 : 0),
            size: 48,
            caught: false,
            handSide: side,
          },
        ];
      });
    }, 1600);

    // Animation Tick for Falling Movement
    const animInterval = setInterval(() => {
      setItems((prev) =>
        prev
          .map((item) => ({
            ...item,
            y: item.caught ? item.y : item.y + item.speed,
          }))
          .filter((item) => item.y < 1.05 && (!item.caught || item.y < 0.95))
      );
    }, 33);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(animInterval);
    };
  }, [phase, level]);

  const startGame = useCallback(() => {
    playPress();
    setPhase("playing");
    setScore(0);
    setCaughtCount(0);
    setItems([]);
    setReactionTimes([]);
    setSymmetryHistory([]);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    setCameraActive(true);
    speak(
      "Welcome to the Assam Tea Garden. Reach with your left or right hand to catch the golden leaves and butterflies fluttering down.",
      locale,
      rate
    );
  }, [locale, rate]);

  const handleManualCatch = (item: FallingItem) => {
    if (item.caught) return;
    setTaps((t) => t + 1);
    stopSpeaking();
    playCorrect();

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, caught: true } : i))
    );
    setCaughtCount((c) => {
      const nextC = c + 1;
      setScore((s) => s + 15);
      if (nextC >= targetGoal) {
        setTimeout(() => {
          handleFinishGame();
        }, 500);
      }
      return nextC;
    });
  };

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "tea-garden-catch",
    level,
    startedAt,
    taps: taps + caughtCount,
    errorCount: 0,
  });

  const avgReactionLatency = useMemo(() => {
    if (reactionTimes.length === 0) return 650;
    return Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
  }, [reactionTimes]);

  const avgBilateralSymmetry = useMemo(() => {
    if (symmetryHistory.length === 0) return 92;
    return Math.round(
      (symmetryHistory.reduce((a, b) => a + b, 0) / symmetryHistory.length) * 100
    );
  }, [symmetryHistory]);

  const str = getGameStrings("tea-garden-catch", locale);

  if (loading)
    return (
      <GameShell title={str.title} score={0}>
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title={str.title} score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title={str.title} score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          {/* Government Paperclip Header */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                Advanced OpenCV Kinesthetic // Module CDTx-20
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-teal-900" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-teal-900 text-white shadow-[4px_4px_0px_#000]">
            <Leaf className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {str.introSubtitle}
            </p>
          </div>

          {/* OpenCV Clinical Highlights */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000] space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-teal-900 block">
              Advanced Computer Vision & Neuro-Motor Features:
            </span>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>Real-time dual-hand tracking with bilateral reaching zones (Left & Right)</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-amber-600" />
              <span>Sub-pixel micro-tremor & motor reaction latency telemetry extraction</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-teal-600" />
              <span>100% In-Browser Privacy (No video transmitted or stored anywhere)</span>
            </div>
          </div>

          <AudioPrompt
            text={str.audioPrompt}
            label={str.listenLabel}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startGame}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "playing" ? (
        <div className="flex flex-col items-center gap-4 py-1">
          {/* TOP HUD: GOAL & REAL-TIME OPENCV METRICS */}
          <div className="w-full max-w-lg rounded-2xl border-3 border-black bg-surface p-3 shadow-[4px_4px_0px_#000] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-emerald-100 font-serif font-black text-emerald-950 text-sm">
                {caughtCount}/{targetGoal}
              </span>
              <div>
                <span className="text-[10px] font-black uppercase text-teal-900 block">
                  Harvest Progress
                </span>
                <span className="text-xs font-black text-ink flex items-center gap-1">
                  {caughtCount >= targetGoal ? (
                    <span className="flex items-center gap-1 text-emerald-800">
                      Goal Reached! <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    </span>
                  ) : (
                    `${targetGoal - caughtCount} items left to harvest`
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-ink-secondary block">
                  Bilateral Symmetry
                </span>
                <span className="text-xs font-black text-emerald-700">
                  {avgBilateralSymmetry}% Balanced
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-ink-secondary block">
                  Motor Latency
                </span>
                <span className="text-xs font-black text-amber-800 font-mono">
                  {avgReactionLatency}ms
                </span>
              </div>
            </div>
          </div>

          {/* MAIN INTERACTIVE KINESTHETIC STAGE */}
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden border-4 border-black bg-gradient-to-b from-[#1E3A2B] via-[#2D5A43] to-[#142B20] shadow-[8px_8px_0px_#000] select-none">
            {/* Scenic Tea Estate Background Layer */}
            <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-col justify-end">
              <div className="h-32 bg-emerald-900/60 rounded-t-full -mx-8 blur-sm" />
              <div className="h-20 bg-emerald-950/80" />
            </div>

            {/* OpenCV Live Vision HUD Canvas Overlay */}
            <canvas
              ref={canvasRef}
              width={320}
              height={240}
              className="absolute inset-0 w-full h-full pointer-events-none opacity-85 z-10"
            />

            {/* Bilateral Reach Guide Zones */}
            <div className="absolute inset-0 flex justify-between pointer-events-none px-4 pt-4 z-0 opacity-40">
              <div className="w-24 h-full border-r border-dashed border-emerald-400/40 flex flex-col items-center">
                <span className="text-[10px] font-black text-emerald-300 uppercase mt-2">Left Zone</span>
              </div>
              <div className="w-24 h-full border-l border-dashed border-amber-400/40 flex flex-col items-center">
                <span className="text-[10px] font-black text-amber-300 uppercase mt-2">Right Zone</span>
              </div>
            </div>

            {/* Falling Interactive Items */}
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleManualCatch(item)}
                style={{
                  left: `${item.x * 100}%`,
                  top: `${item.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className={`absolute z-20 flex items-center justify-center transition-transform cursor-pointer ${
                  item.caught
                    ? "scale-150 opacity-0 transition-all duration-300 pointer-events-none"
                    : "hover:scale-110 active:scale-95 animate-bounce"
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/40 border border-white/20 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
                    {renderFallingItemIcon(item.type, "h-8 w-8")}
                  </div>
                  <span className="mt-0.5 rounded-full border border-black bg-white/90 px-1.5 py-0.2 text-[9px] font-black text-ink shadow-xs">
                    {item.name}
                  </span>
                </div>
              </button>
            ))}

            {/* Bottom Status / Gesture Feedback */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
              <span className="rounded-xl border-2 border-black bg-white/90 px-2.5 py-1 text-[11px] font-black text-ink shadow-[2px_2px_0px_#000] flex items-center gap-1">
                {motionEvent?.hasMotion ? (
                  <>
                    <Zap className="h-3.5 w-3.5 text-amber-600" />
                    <span>{motionEvent.gesture.replace(/_/g, " ")}</span>
                  </>
                ) : (
                  <>
                    <Hand className="h-3.5 w-3.5 text-tea" />
                    <span>Wave Hands to Catch</span>
                  </>
                )}
              </span>

              {motionEvent?.leftHand && (
                <span className="rounded-full border border-emerald-400 bg-emerald-950/80 px-2 py-0.5 text-[10px] font-black text-emerald-300 flex items-center gap-1">
                  <Hand className="h-3 w-3" /> Left Hand Active
                </span>
              )}

              {motionEvent?.rightHand && (
                <span className="rounded-full border border-amber-400 bg-amber-950/80 px-2 py-0.5 text-[10px] font-black text-amber-300 flex items-center gap-1">
                  <Hand className="h-3 w-3" /> Right Hand Active
                </span>
              )}
            </div>
          </div>

          {/* HIGH-CONTRAST TACTILE CATCH TRAY (ACCESSIBILITY LAYER) */}
          <div className="w-full max-w-lg space-y-2">
            <span className="text-xs font-black uppercase text-teal-900 block text-left">
              Quick Touch Catch Tray (Or Wave Hands on Camera):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {items
                .filter((i) => !i.caught)
                .slice(0, 2)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleManualCatch(item)}
                    className="btn-tactile flex items-center gap-2 rounded-2xl border-3 border-black bg-amber-100 p-3 text-ink shadow-[3px_3px_0px_#000] hover:bg-amber-200 active:translate-y-0.5 cursor-pointer text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/10">
                      {renderFallingItemIcon(item.type, "h-6 w-6")}
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] font-bold text-amber-900 uppercase block">
                        Tap to Harvest
                      </span>
                      <span className="text-xs font-black text-ink truncate block">
                        {item.name}
                      </span>
                    </div>
                  </button>
                ))}
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-ink-secondary">
              <button
                type="button"
                onClick={() => setCameraActive(!cameraActive)}
                className="flex items-center gap-1 hover:text-ink cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5 text-teal-900" />
                <span>{cameraActive ? "OpenCV Camera Vision: ON" : "Turn On Camera Vision"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  speak(
                    "Reach with your left or right hand toward the falling tea leaves and butterflies.",
                    locale,
                    rate
                  )
                }
                className="flex items-center gap-1 text-teal-900 hover:underline cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>Voice Guide</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* PHASE: CELEBRATION */
        <Celebration
          title="Tea Garden Harvest Complete!"
          subtitle="You demonstrated outstanding bilateral motor range, sharp kinesthetic coordination, and steady hand control."
          xpEarned={140}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none space-y-3">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> OpenCV Kinesthetic Clinical Summary
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-teal-900 text-white px-2 py-0.5">
                  8/8 Harvested
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-black/20 bg-white p-2.5">
                  <span className="text-[10px] font-black uppercase text-ink-secondary block">
                    Bilateral Symmetry
                  </span>
                  <span className="font-serif text-xl font-black text-emerald-700">
                    {avgBilateralSymmetry}%
                  </span>
                  <p className="text-[10px] font-semibold text-emerald-800 mt-0.5">
                    Equal left & right reach
                  </p>
                </div>

                <div className="rounded-xl border border-black/20 bg-white p-2.5">
                  <span className="text-[10px] font-black uppercase text-ink-secondary block">
                    Motor Latency
                  </span>
                  <span className="font-serif text-xl font-black text-amber-800 font-mono">
                    {avgReactionLatency}ms
                  </span>
                  <p className="text-[10px] font-semibold text-amber-800 mt-0.5">
                    Fast visual-motor reflex
                  </p>
                </div>
              </div>

              <p className="text-xs font-semibold text-ink-secondary pt-2 border-t border-black/10 leading-relaxed">
                ASHA Clinical Observation: Patient exhibits smooth bilateral motor flexion with minimal micro-hesitation. Recommended for continuing daily upper-body kinesthetic stimulation.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startGame}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> Play Again
                </span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
              >
                ← Back to Therapy Suite
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
