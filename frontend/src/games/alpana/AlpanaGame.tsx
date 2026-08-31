"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Sparkles,
  Camera,
  RotateCcw,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Brush,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playLifeSong } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { OpticalMotionTracker, type MotionEvent } from "@/lib/vision";

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
      <GameHeader title={title} score={score} backHref="/patient/games" bgColor="bg-purple-900" />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

interface Point {
  x: number;
  y: number;
  hit: boolean;
}

const LOTUS_MOTIF_POINTS: { x: number; y: number }[] = [
  { x: 0.5, y: 0.2 },
  { x: 0.38, y: 0.32 },
  { x: 0.62, y: 0.32 },
  { x: 0.28, y: 0.5 },
  { x: 0.72, y: 0.5 },
  { x: 0.35, y: 0.68 },
  { x: 0.65, y: 0.68 },
  { x: 0.5, y: 0.8 },
];

export function AlpanaGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "alpana", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "draw" | "done">("intro");
  const [isVisionActive, setIsVisionActive] = useState(false);
  const [coveragePct, setCoveragePct] = useState(0);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<OpticalMotionTracker | null>(null);
  const motifPointsRef = useRef<Point[]>(
    LOTUS_MOTIF_POINTS.map((p) => ({ ...p, hit: false }))
  );
  const trailRef = useRef<{ x: number; y: number; age: number }[]>([]);

  // Particle & Canvas Drawing Loop
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Dark sacred floor background
    ctx.fillStyle = "#1E1428";
    ctx.fillRect(0, 0, w, h);

    // Sacred Guidelines Pattern
    ctx.strokeStyle = "rgba(251, 191, 36, 0.25)";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Motif Nodes
    motifPointsRef.current.forEach((pt) => {
      const px = pt.x * w;
      const py = pt.y * h;
      ctx.beginPath();
      ctx.arc(px, py, pt.hit ? 14 : 10, 0, Math.PI * 2);
      ctx.fillStyle = pt.hit ? "#FBBF24" : "rgba(255, 255, 255, 0.3)";
      ctx.fill();
      if (pt.hit) {
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    });

    // Draw Glow Dust Trail
    for (let i = trailRef.current.length - 1; i >= 0; i--) {
      const p = trailRef.current[i];
      p.age += 0.035;
      if (p.age > 1) {
        trailRef.current.splice(i, 1);
        continue;
      }

      const alpha = 1 - p.age;
      const radius = (1 - p.age) * 18 + 4;
      const grad = ctx.createRadialGradient(
        p.x * w,
        p.y * h,
        0,
        p.x * w,
        p.y * h,
        radius
      );
      grad.addColorStop(0, `rgba(254, 240, 138, ${alpha})`);
      grad.addColorStop(0.5, `rgba(234, 88, 12, ${alpha * 0.6})`);
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }, []);

  // Update touch or optical point
  const handlePointInput = useCallback(
    (nx: number, ny: number) => {
      trailRef.current.push({ x: nx, y: ny, age: 0 });

      let newlyHit = false;
      motifPointsRef.current.forEach((pt) => {
        if (!pt.hit) {
          const dist = Math.hypot(pt.x - nx, pt.y - ny);
          if (dist < 0.12) {
            pt.hit = true;
            newlyHit = true;
            playCorrect();
          }
        }
      });

      const totalHit = motifPointsRef.current.filter((p) => p.hit).length;
      const pct = Math.round((totalHit / motifPointsRef.current.length) * 100);
      setCoveragePct(pct);

      if (totalHit === motifPointsRef.current.length) {
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
              taps: taps + 1,
              errorCount: 0,
            });
          }
        }, 500);
      }

      if (newlyHit) drawCanvas();
    },
    [drawCanvas, level, patientId, startedAt, taps]
  );

  const handleMotionEvent = useCallback(
    (evt: MotionEvent) => {
      if (evt.hasMotion && evt.energy > 0.15) {
        handlePointInput(evt.x, evt.y);
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
      const tracker = new OpticalMotionTracker(handleMotionEvent, 0.35);
      const success = await tracker.start();
      if (success) {
        trackerRef.current = tracker;
        setIsVisionActive(true);
        speak("Air Canvas activated. Wave your hand in the air to trace the sacred lotus.", locale, rate);
      }
    }
  };

  useEffect(() => {
    let animId: number;
    const loop = () => {
      drawCanvas();
      animId = requestAnimationFrame(loop);
    };
    if (phase === "draw") {
      animId = requestAnimationFrame(loop);
    }
    return () => {
      cancelAnimationFrame(animId);
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
    };
  }, [drawCanvas, phase]);

  const startGame = useCallback(() => {
    playPress();
    setPhase("draw");
    motifPointsRef.current = LOTUS_MOTIF_POINTS.map((p) => ({ ...p, hit: false }));
    trailRef.current = [];
    setCoveragePct(0);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
  }, []);

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "alpana",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  if (loading)
    return (
      <GameShell title="Sacred Alpana Sand Drawing" score={0}>
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title="Sacred Alpana Sand Drawing" score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title="Sacred Alpana Sand Drawing" score={coveragePct}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                Visuospatial Air-Canvas // Module CDTx-18
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-purple-700" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-purple-900 text-white shadow-[4px_4px_0px_#000]">
            <Brush className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              Sacred Alpana Sand Drawing
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              Trace sacred festive floor art using camera hand motion or touch. Connect the glowing nodes to reveal the traditional North Eastern lotus motif.
            </p>
          </div>

          {/* Clinical Benefits */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-purple-900 block mb-2">
              Clinical Benefits:
            </span>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-700" />
                <span>Gross motor shoulder abduction & continuous kinesthetic flow</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-tea" />
                <span>Visuospatial constructional praxis and mental rotation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-marigold" />
                <span>Multi-sensory particle feedback and culturally soothing music</span>
              </div>
            </div>
          </div>

          <AudioPrompt
            text="Welcome to Sacred Alpana Sand Drawing. Wave your hand in the air to trace the sacred lotus pattern."
            label="Listen to Instructions"
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startGame}>
            Start Drawing Session
          </ChunkyButton>
        </div>
      ) : phase === "draw" ? (
        <div className="flex flex-col items-center gap-3.5 py-1">
          {/* STATUS BAR & CAMERA TOGGLE */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" /> Motif Completion: {coveragePct}%
            </span>

            <button
              type="button"
              onClick={toggleVisionMode}
              className={`btn-tactile inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-black text-xs font-black shadow-xs transition-all cursor-pointer ${
                isVisionActive
                  ? "bg-purple-900 text-white"
                  : "bg-surface-muted text-ink hover:bg-surface"
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>{isVisionActive ? "Air Canvas Active" : "Enable Air Canvas"}</span>
            </button>
          </div>

          {/* INTERACTIVE CANVAS */}
          <div className="relative w-full max-w-md aspect-square rounded-2xl border-3 border-black overflow-hidden shadow-[5px_5px_0px_#000] select-none touch-none">
            <canvas
              ref={canvasRef}
              width={400}
              height={400}
              className="w-full h-full cursor-crosshair"
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const nx = (e.clientX - rect.left) / rect.width;
                const ny = (e.clientY - rect.top) / rect.height;
                handlePointInput(nx, ny);
              }}
            />

            <div className="absolute bottom-2.5 left-2.5 pointer-events-none bg-surface/90 backdrop-blur-xs px-2.5 py-1 rounded-lg border-2 border-black text-[10px] font-black text-ink shadow-xs">
              {isVisionActive ? "👋 Wave hand in air" : "👆 Drag finger across nodes"}
            </div>
          </div>
        </div>
      ) : (
        <Celebration
          title="Sacred Alpana Revealed!"
          subtitle="You traced the North Eastern festive lotus motif with fluid kinesthetic coordination."
          xpEarned={140}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Motif Mandala Completed
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-purple-900 text-white px-2 py-0.5">
                  100% Symmetry
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                Kinesthetic Flow Score: Exceptional
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1">
                Continuous shoulder and elbow range of motion logged successfully to clinical telemetry.
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-purple-100 px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-purple-900" />
                  <span className="text-xs font-black">Play Festive Flute Audio</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startGame}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> Draw Another Motif
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
