"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Feather,
  RotateCcw,
  Sparkles,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Camera,
  ArrowLeft,
  ArrowRight,
  Wind,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playPineBreeze, playLifeSong } from "@/lib/sound";
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
        bgColor="bg-amber-800"
        gameId="hornbill-flight"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

interface TargetFig {
  id: number;
  x: number;
  y: number;
  collected: boolean;
}

export function HornbillFlightGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "hornbill-flight", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [score, setScore] = useState(0);
  const [isVisionActive, setIsVisionActive] = useState(false);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const trackerRef = useRef<OpticalMotionTracker | null>(null);

  const TARGET_GOAL = 10;
  const birdPosRef = useRef({ x: 0.5, y: 0.5, vx: 0, vy: 0, bankAngle: 0 });
  const targetFigsRef = useRef<TargetFig[]>([]);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const keysPressedRef = useRef<{ left: boolean; right: boolean; up: boolean; down: boolean }>({
    left: false,
    right: false,
    up: false,
    down: false,
  });

  // Guard session completion
  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "hornbill-flight",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  // Initialize targets
  const initTargets = useCallback(() => {
    const figs: TargetFig[] = [];
    for (let i = 0; i < TARGET_GOAL; i++) {
      figs.push({
        id: i,
        x: 0.2 + (i * 0.25) % 0.6,
        y: -0.3 - i * 0.45,
        collected: false,
      });
    }
    targetFigsRef.current = figs;
  }, []);

  // Immediate-Mode Render & Physics Loop (Raylib-style)
  useEffect(() => {
    if (phase !== "play") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      tick++;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Physics update for Hornbill glider
      const keys = keysPressedRef.current;
      if (keys.left) birdPosRef.current.vx -= 0.0012;
      if (keys.right) birdPosRef.current.vx += 0.0012;
      if (keys.up) birdPosRef.current.vy -= 0.001;
      if (keys.down) birdPosRef.current.vy += 0.001;

      birdPosRef.current.x += birdPosRef.current.vx;
      birdPosRef.current.y += birdPosRef.current.vy;
      birdPosRef.current.vx *= 0.92; // Damping
      birdPosRef.current.vy *= 0.92;

      // Clamp to screen bounds (1:1 viewport reach across all corners)
      birdPosRef.current.x = Math.max(0.04, Math.min(0.96, birdPosRef.current.x));
      birdPosRef.current.y = Math.max(0.04, Math.min(0.95, birdPosRef.current.y));
      birdPosRef.current.bankAngle = birdPosRef.current.vx * 25;

      // 2. Clear Sky Background (Highland Twilight / Morning Horizon)
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, "#FDE68A");
      skyGrad.addColorStop(0.4, "#FDBA74");
      skyGrad.addColorStop(1, "#38BDF8");
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // 3. Parallax Misty Himalayan Pine Ridges (Immediate Mode Layers)
      // Layer 1: Distant blue ridges
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.65);
      for (let x = 0; x <= w; x += 40) {
        const py = h * 0.65 + Math.sin((x + tick * 0.5) * 0.015) * 25;
        ctx.lineTo(x, py);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // Layer 2: Near Pine Ridge
      ctx.fillStyle = "#1E293B";
      ctx.beginPath();
      ctx.moveTo(0, h * 0.78);
      for (let x = 0; x <= w; x += 30) {
        const py = h * 0.78 + Math.cos((x + tick * 0.8) * 0.02) * 20;
        ctx.lineTo(x, py);
      }
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // 4. Update & Draw Target Golden Figs
      let newlyCollected = 0;
      targetFigsRef.current.forEach((fig) => {
        fig.y += 0.0035; // Downward scroll speed

        if (!fig.collected) {
          const fx = fig.x * w;
          const fy = fig.y * h;

          // Draw Fig glow
          ctx.beginPath();
          ctx.arc(fx, fy, 16 + Math.sin(tick * 0.1) * 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(251, 191, 36, 0.4)";
          ctx.fill();

          // Golden Fig fruit
          ctx.beginPath();
          ctx.arc(fx, fy, 10, 0, Math.PI * 2);
          ctx.fillStyle = "#F59E0B";
          ctx.fill();
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#FFFFFF";
          ctx.stroke();

          // Collision detection with Hornbill beak/body
          const bx = birdPosRef.current.x * w;
          const by = birdPosRef.current.y * h;
          const dist = Math.hypot(bx - fx, by - fy);
          if (dist < 28) {
            fig.collected = true;
            newlyCollected++;
            playCorrect();
          }
        }
      });

      if (newlyCollected > 0) {
        setScore((s) => {
          const next = s + newlyCollected;
          if (next >= TARGET_GOAL) {
            setTimeout(() => {
              playComplete();
              setPhase("done");
              if (startedAt) {
                recordGameSession(patientId, {
                  gameId: "hornbill-flight",
                  level,
                  outcome: "completed",
                  score: 100,
                  startedAt,
                  taps: taps + next,
                  errorCount: 0,
                });
              }
            }, 600);
          }
          return next;
        });
      }

      // 5. Draw Great Indian Hornbill Glider (Raylib Custom Vector Shape)
      const bx = birdPosRef.current.x * w;
      const by = birdPosRef.current.y * h;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate((birdPosRef.current.bankAngle * Math.PI) / 180);

      // Wing Flap oscillation
      const flap = Math.sin(tick * 0.18) * 6;

      // Black & Golden Wings
      ctx.fillStyle = "#18181B";
      // Left Wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-45, -8 + flap);
      ctx.lineTo(-30, 16 + flap);
      ctx.closePath();
      ctx.fill();
      // Right Wing
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(45, -8 + flap);
      ctx.lineTo(30, 16 + flap);
      ctx.closePath();
      ctx.fill();

      // Wing White Band
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(-35, -2 + flap, 12, 6);
      ctx.fillRect(23, -2 + flap, 12, 6);

      // Body & Tail
      ctx.fillStyle = "#18181B";
      ctx.beginPath();
      ctx.ellipse(0, 0, 8, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail white band
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(-6, 14, 12, 8);

      // Majestic Golden Hornbill Beak & Casque
      ctx.fillStyle = "#F59E0B";
      ctx.beginPath();
      ctx.moveTo(-4, -16);
      ctx.lineTo(0, -32);
      ctx.lineTo(4, -16);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#B45309";
      ctx.stroke();

      ctx.restore();
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [level, patientId, phase, startedAt, taps]);

  // Keyboard navigation listeners
  useEffect(() => {
    if (phase !== "play") return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keysPressedRef.current.left = true;
      if (e.key === "ArrowRight" || e.key === "d") keysPressedRef.current.right = true;
      if (e.key === "ArrowUp" || e.key === "w") keysPressedRef.current.up = true;
      if (e.key === "ArrowDown" || e.key === "s") keysPressedRef.current.down = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a") keysPressedRef.current.left = false;
      if (e.key === "ArrowRight" || e.key === "d") keysPressedRef.current.right = false;
      if (e.key === "ArrowUp" || e.key === "w") keysPressedRef.current.up = false;
      if (e.key === "ArrowDown" || e.key === "s") keysPressedRef.current.down = false;
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [phase]);

  // Optical Motion Tracking (1:1 viewport reach across all corners)
  const handleMotionEvent = useCallback((evt: MotionEvent) => {
    if (evt.hasMotion) {
      const activeHand = evt.rightHand || evt.leftHand || { x: evt.x, y: evt.y };
      const smoothed = smoothKineticTrajectory(
        {
          x: Math.max(0.04, Math.min(0.96, activeHand.x)),
          y: Math.max(0.04, Math.min(0.95, activeHand.y)),
        },
        lastPointRef.current,
        0.35
      );
      lastPointRef.current = smoothed;
      birdPosRef.current.x = smoothed.x;
      birdPosRef.current.y = smoothed.y;
    }
  }, []);

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
        speak("Hornbill flight camera active. Move your hand to guide the hornbill.", locale, rate);
      }
    }
  };

  const startGame = useCallback(() => {
    playPress();
    playPineBreeze();
    setPhase("play");
    setScore(0);
    initTargets();
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
  }, [initTargets]);

  const str = getGameStrings("hornbill-flight", locale);

  if (loading) return <GameShell title={str.title} score={0}><GameLoading /></GameShell>;
  if (error) return <GameShell title={str.title} score={0}><GameError onRetry={reload} /></GameShell>;

  return (
    <GameShell title={str.title} score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                Visuomotor Glider // Module CDTx-19
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-amber-800" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-amber-800 text-white shadow-[4px_4px_0px_#000]">
            <Feather className="h-10 w-10 stroke-[2.5]" />
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
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 block mb-2">
              Clinical Benefits:
            </span>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-700" />
                <span>Visuomotor tracking speed & motor anticipation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-tea" />
                <span>Continuous trajectory steering & dynamic spatial attention</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-marigold" />
                <span>Camera optical hand flight or large tactile arrow steering</span>
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
      ) : phase === "play" ? (
        <div className="flex flex-col items-center gap-3.5 py-1">
          {/* FLIGHT STATUS & CONTROLS HUD */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-600" /> {str.hudProgress}: {score} / {TARGET_GOAL}
            </span>

            <button
              type="button"
              onClick={toggleVisionMode}
              className={`btn-tactile inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-black text-xs font-black shadow-xs transition-all cursor-pointer ${
                isVisionActive ? "bg-tea text-white" : "bg-surface-muted text-ink"
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>{isVisionActive ? "Hand Glide Active" : "Camera Glide"}</span>
            </button>
          </div>

          {/* RAYLIB-STYLE IMMEDIATE MODE 2D/3D CANVAS */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] bg-black">
            <canvas
              ref={canvasRef}
              width={480}
              height={420}
              className="w-full h-[360px] sm:h-[400px] block cursor-crosshair"
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const nx = (e.clientX - rect.left) / rect.width;
                const ny = (e.clientY - rect.top) / rect.height;
                birdPosRef.current.x = nx;
                birdPosRef.current.y = ny;
              }}
            />
          </div>

          {/* TACTILE TOUCH FLIGHT CONTROLS */}
          <div className="w-full max-w-md grid grid-cols-2 gap-3">
            <button
              type="button"
              onPointerDown={() => { keysPressedRef.current.left = true; setTaps((t) => t + 1); }}
              onPointerUp={() => { keysPressedRef.current.left = false; }}
              className="btn-tactile flex items-center justify-center gap-2 rounded-2xl border-3 border-black bg-amber-100 p-4 font-black text-ink shadow-[4px_4px_0px_#000] active:translate-y-1 hover:bg-amber-200 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-amber-900" />
              <span>BANK LEFT</span>
            </button>

            <button
              type="button"
              onPointerDown={() => { keysPressedRef.current.right = true; setTaps((t) => t + 1); }}
              onPointerUp={() => { keysPressedRef.current.right = false; }}
              className="btn-tactile flex items-center justify-center gap-2 rounded-2xl border-3 border-black bg-amber-100 p-4 font-black text-ink shadow-[4px_4px_0px_#000] active:translate-y-1 hover:bg-amber-200 cursor-pointer"
            >
              <span>BANK RIGHT</span>
              <ArrowRight className="h-5 w-5 text-amber-900" />
            </button>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title={str.celebrationTitle}
          subtitle={str.celebrationSubtitle}
          xpEarned={130}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Flight Milestones Completed
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-amber-800 text-white px-2 py-0.5">
                  {TARGET_GOAL} Figs Harvested
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                Visuomotor Agility: Excellent
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1">
                Continuous flight trajectory tracking demonstrated robust spatial anticipation and visuomotor coordination.
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-amber-100 px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Wind className="h-4 w-4 text-amber-900" />
                  <span className="text-xs font-black">Play Mountain Breeze Flute</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startGame}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> {str.playAgainButton}
                </span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
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
