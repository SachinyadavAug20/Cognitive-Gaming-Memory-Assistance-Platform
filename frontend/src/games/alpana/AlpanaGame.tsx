"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Sparkles,
  Camera,
  Paperclip,
  ShieldCheck,
  RotateCcw,
  Activity,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playTapFeedback } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel, smoothKineticTrajectory } from "@/games/config";
import { OpticalMotionTracker, type MotionEvent } from "@/lib/vision";
import { getGameStrings } from "@/lib/gameI18n";

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
    <section className="pb-12 min-h-screen bg-[#FAF6F0]">
      <GameHeader
        title={title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-purple-900"
        gameId="alpana"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

interface NodePoint {
  id: number;
  x: number;
  y: number;
  label: string;
}

interface LineSegment {
  from: number;
  to: number;
  completed: boolean;
}

// Sacred Eight-Petal Lotus Motif Nodes
const LOTUS_NODES: NodePoint[] = [
  { id: 0, x: 0.5, y: 0.15, label: "Top" },
  { id: 1, x: 0.75, y: 0.25, label: "NE" },
  { id: 2, x: 0.85, y: 0.5, label: "East" },
  { id: 3, x: 0.75, y: 0.75, label: "SE" },
  { id: 4, x: 0.5, y: 0.85, label: "South" },
  { id: 5, x: 0.25, y: 0.75, label: "SW" },
  { id: 6, x: 0.15, y: 0.5, label: "West" },
  { id: 7, x: 0.25, y: 0.25, label: "NW" },
  { id: 8, x: 0.5, y: 0.5, label: "Center" },
];

// Sacred Lines to trace (Outer Petal Lines + Inner Radiant Star Lines)
const INITIAL_LINES: LineSegment[] = [
  // Outer Lotus Perimeter Lines
  { from: 0, to: 1, completed: false },
  { from: 1, to: 2, completed: false },
  { from: 2, to: 3, completed: false },
  { from: 3, to: 4, completed: false },
  { from: 4, to: 5, completed: false },
  { from: 5, to: 6, completed: false },
  { from: 6, to: 7, completed: false },
  { from: 7, to: 0, completed: false },
  // Inner Sacred Star Lines to Center Bindu
  { from: 0, to: 8, completed: false },
  { from: 2, to: 8, completed: false },
  { from: 4, to: 8, completed: false },
  { from: 6, to: 8, completed: false },
];

export function AlpanaGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "alpana", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "draw" | "done">("intro");
  const [isVisionActive, setIsVisionActive] = useState(false);
  const [lines, setLines] = useState<LineSegment[]>(INITIAL_LINES);
  const [activeNodeIndex, setActiveNodeIndex] = useState<number | null>(null);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  // Canvas Refs
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<OpticalMotionTracker | null>(null);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const trailRef = useRef<{ x: number; y: number; age: number }[]>([]);
  const isPointerDownRef = useRef(false);

  const completedLinesCount = lines.filter((l) => l.completed).length;
  const score = Math.round((completedLinesCount / lines.length) * 100);

  // Redraw Sacred Alpana Floor, Dots, and Completed Glowing Lines
  const redrawCanvas = useCallback(
    (currentHandPos?: { x: number; y: number }) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Traditional Terracotta / Sacred Altar Dark Background
      ctx.fillStyle = "#1E1428";
      ctx.fillRect(0, 0, w, h);

      // Sacred Concentric Alignment Circles (Dotted)
      ctx.strokeStyle = "rgba(251, 191, 36, 0.2)";
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w * 0.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w * 0.18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Guide Lines (Ghost outlines of uncompleted lines)
      lines.forEach((l) => {
        if (!l.completed) {
          const p1 = LOTUS_NODES[l.from];
          const p2 = LOTUS_NODES[l.to];
          ctx.strokeStyle = "rgba(254, 240, 138, 0.15)";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(p1.x * w, p1.y * h);
          ctx.lineTo(p2.x * w, p2.y * h);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });

      // Draw Completed Sacred Rice-Flour Alpana Lines (Glowing White & Gold)
      lines.forEach((l) => {
        if (l.completed) {
          const p1 = LOTUS_NODES[l.from];
          const p2 = LOTUS_NODES[l.to];

          // Gold outer glow
          ctx.save();
          ctx.strokeStyle = "#F59E0B";
          ctx.lineWidth = 6;
          ctx.shadowColor = "#FBBF24";
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(p1.x * w, p1.y * h);
          ctx.lineTo(p2.x * w, p2.y * h);
          ctx.stroke();

          // White inner sacred chalk core
          ctx.strokeStyle = "#FFFFFF";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(p1.x * w, p1.y * h);
          ctx.lineTo(p2.x * w, p2.y * h);
          ctx.stroke();
          ctx.restore();
        }
      });

      // Draw Dynamic Drag Line from Active Node to Hand Position
      if (activeNodeIndex !== null && currentHandPos) {
        const startPt = LOTUS_NODES[activeNodeIndex];
        ctx.save();
        ctx.strokeStyle = "#EC4899";
        ctx.lineWidth = 3.5;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(startPt.x * w, startPt.y * h);
        ctx.lineTo(currentHandPos.x * w, currentHandPos.y * h);
        ctx.stroke();
        ctx.restore();
      }

      // Draw Sacred Motif Dots (Nodes)
      LOTUS_NODES.forEach((node) => {
        const px = node.x * w;
        const py = node.y * h;
        const isConnected = lines.some(
          (l) => (l.from === node.id || l.to === node.id) && l.completed
        );
        const isActive = activeNodeIndex === node.id;

        ctx.save();
        ctx.beginPath();
        ctx.arc(px, py, isActive ? 16 : isConnected ? 12 : 9, 0, Math.PI * 2);
        ctx.fillStyle = isActive
          ? "#EC4899"
          : isConnected
          ? "#F59E0B"
          : "rgba(254, 240, 138, 0.4)";
        ctx.fill();

        ctx.lineWidth = isActive ? 3.5 : 2;
        ctx.strokeStyle = isActive ? "#FFFFFF" : isConnected ? "#FEF08A" : "#FBBF24";
        ctx.stroke();

        // Little inner pearl
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
        ctx.restore();
      });

      // Draw Kinetic Motion Glow Particles
      for (let i = trailRef.current.length - 1; i >= 0; i--) {
        const p = trailRef.current[i];
        p.age += 0.04;
        if (p.age > 1) {
          trailRef.current.splice(i, 1);
          continue;
        }

        const alpha = 1 - p.age;
        const radius = (1 - p.age) * 14 + 3;
        ctx.fillStyle = `rgba(251, 191, 36, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    },
    [activeNodeIndex, lines]
  );

  // Handle Point Input (Touch, Pointer, or Air Hand)
  const handlePointInput = useCallback(
    (rawNx: number, rawNy: number) => {
      const smoothed = smoothKineticTrajectory(
        { x: rawNx, y: rawNy },
        lastPointRef.current,
        0.35
      );
      lastPointRef.current = smoothed;
      const { x: nx, y: ny } = smoothed;

      trailRef.current.push({ x: nx, y: ny, age: 0 });

      // Find nearest node
      let nearestIndex = -1;
      let minDist = 0.12;

      LOTUS_NODES.forEach((node) => {
        const dist = Math.hypot(node.x - nx, node.y - ny);
        if (dist < minDist) {
          minDist = dist;
          nearestIndex = node.id;
        }
      });

      if (nearestIndex !== -1) {
        if (activeNodeIndex === null) {
          // Select starting node for a line
          setActiveNodeIndex(nearestIndex);
          playTapFeedback();
        } else if (activeNodeIndex !== nearestIndex) {
          // Check if there is a line connecting activeNodeIndex and nearestIndex
          const matchingLine = lines.find(
            (l) =>
              !l.completed &&
              ((l.from === activeNodeIndex && l.to === nearestIndex) ||
                (l.from === nearestIndex && l.to === activeNodeIndex))
          );

          if (matchingLine) {
            playCorrect();
            setLines((prev) => {
              const next = prev.map((l) =>
                (l.from === matchingLine.from && l.to === matchingLine.to) ||
                (l.from === matchingLine.to && l.to === matchingLine.from)
                  ? { ...l, completed: true }
                  : l
              );

              // Check victory
              const allDone = next.every((l) => l.completed);
              if (allDone) {
                setTimeout(() => {
                  playComplete();
                  setPhase("done");
                  if (startedAt) {
                    recordGameSession(patientId, {
                      gameId: "alpana",
                      level,
                      outcome: "completed",
                      score: 100,
                      startedAt,
                      taps: taps + 12,
                      errorCount: 0,
                    });
                  }
                }, 600);
              }
              return next;
            });
            setActiveNodeIndex(nearestIndex); // Continuous drawing into next line!
          } else {
            // Re-anchor to the new node
            setActiveNodeIndex(nearestIndex);
          }
        }
      }

      redrawCanvas({ x: nx, y: ny });
    },
    [activeNodeIndex, level, lines, patientId, redrawCanvas, startedAt, taps]
  );

  // Handle Air-Camera Motion Event
  const handleMotionEvent = useCallback(
    (evt: MotionEvent) => {
      // Exclude face zone: only accept hand movement below head line Y > 0.26
      const hand = evt.rightHand || evt.leftHand;
      const effectiveY = hand ? hand.y : evt.y;
      const effectiveX = hand ? hand.x : evt.x;

      if (effectiveY > 0.26 && evt.hasMotion && evt.energy > 0.12) {
        handlePointInput(effectiveX, effectiveY);
      }
    },
    [handlePointInput]
  );

  const toggleVisionMode = async () => {
    playPress();
    if (isVisionActive) {
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
      setIsVisionActive(false);
    } else {
      const tracker = new OpticalMotionTracker(handleMotionEvent, 0.38);
      const success = await tracker.start();
      if (success) {
        trackerRef.current = tracker;
        setIsVisionActive(true);
        speak(
          "Air camera activated. Move your hand between sacred dots to draw radiant lines.",
          locale,
          rate
        );
      } else {
        setIsVisionActive(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
    };
  }, []);

  // Animation Loop for Smooth Trail Glow
  useEffect(() => {
    if (phase !== "draw") return;
    let animId: number;

    const loop = () => {
      redrawCanvas();
      animId = requestAnimationFrame(loop);
    };
    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [phase, redrawCanvas]);

  const startGame = useCallback(() => {
    playPress();
    setPhase("draw");
    setLines(INITIAL_LINES.map((l) => ({ ...l, completed: false })));
    setActiveNodeIndex(null);
    lastPointRef.current = null;
    trailRef.current = [];
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
  }, []);

  const resetLines = () => {
    playPress();
    setLines(INITIAL_LINES.map((l) => ({ ...l, completed: false })));
    setActiveNodeIndex(null);
    lastPointRef.current = null;
    trailRef.current = [];
  };

  // Direct Pointer Handlers (Touch & Mouse Drawing)
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isPointerDownRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    setTaps((t) => t + 1);
    handlePointInput(nx, ny);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDownRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    handlePointInput(nx, ny);
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
    setActiveNodeIndex(null);
  };

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "alpana",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const str = getGameStrings("alpana", locale);

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
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          {/* Government Paperclip Header */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                Sacred Line Geometry // Module CDTx-08
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-purple-900" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-purple-900 text-white shadow-[4px_4px_0px_#000]">
            <Sparkles className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {str.introSubtitle}
            </p>
          </div>

          {/* Clinical Benefits */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-purple-900 block mb-2">
              Sacred Line Tracing Benefits:
            </span>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-900" />
                <span>Fine-motor praxis and kinetic line connection stability</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-marigold" />
                <span>Visuospatial coordination through sacred mandala line geometry</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-tea" />
                <span>Authentic rice-paste glowing Alpana lines that remain permanently</span>
              </div>
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
      ) : phase === "draw" ? (
        <div className="flex flex-col items-center gap-3 py-1">
          {/* STATUS BAR: PROGRESS & VISION TOGGLE */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                <Activity className="h-4 w-4" /> Lines: {completedLinesCount} / {lines.length}
              </span>
              <span className="text-[10px] font-bold text-ink-secondary bg-surface-muted px-1.5 py-0.5 rounded border border-black/20">
                {score}% Complete
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={resetLines}
                className="btn-tactile p-1.5 rounded-lg border-2 border-black text-xs font-black shadow-xs hover:bg-surface-muted cursor-pointer"
                title="Reset Lines"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={toggleVisionMode}
                className={`btn-tactile inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-black text-xs font-black shadow-xs transition-all cursor-pointer ${
                  isVisionActive
                    ? "bg-purple-900 text-white animate-pulse"
                    : "bg-surface-muted text-ink hover:bg-surface"
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>{isVisionActive ? "Air Camera: ON" : "Enable Air Camera"}</span>
              </button>
            </div>
          </div>

          {/* MAIN SACRED ALPANA LINE CANVAS */}
          <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden border-4 border-black bg-[#1E1428] shadow-[6px_6px_0px_#000] select-none touch-none">
            <canvas
              ref={canvasRef}
              width={420}
              height={420}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute inset-0 w-full h-full cursor-crosshair"
            />

            {/* In-Game Helper Banner */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="rounded-xl border-2 border-black bg-white/90 px-2.5 py-1 text-[11px] font-black text-ink shadow-[2px_2px_0px_#000]">
                {activeNodeIndex !== null
                  ? "✨ Drag line to connecting node"
                  : isVisionActive
                  ? "Wave hand over dots to connect lines"
                  : "Touch a dot and drag to connect lines"}
              </span>

              <span className="rounded-full border border-purple-400 bg-purple-950/90 px-2.5 py-0.5 text-[10px] font-black text-purple-300">
                Lotus Alpana
              </span>
            </div>
          </div>

          <p className="text-xs font-semibold text-ink-secondary text-center max-w-md">
            🌸 <strong>How to draw:</strong> Touch or wave your hand between dots along the dotted guides to draw glowing sacred rice-paste lines. Complete all 12 lines to finish the sacred mandala!
          </p>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title={str.celebrationTitle}
          subtitle={str.celebrationSubtitle}
          xpEarned={100}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto text-center pt-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={startGame}
                className="btn-tactile rounded-xl border-2 border-black bg-marigold px-5 py-2.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                {str.playAgainButton}
              </button>
              <Link
                href="/patient/games"
                className="btn-tactile rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                {str.backToHub}
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
