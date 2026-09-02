"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Compass,
  RotateCcw,
  Sparkles,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Waves,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playComplete, playWaterRipple, playLifeSong } from "@/lib/sound";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { startLevel } from "@/games/config";
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
        bgColor="bg-sky-900"
        gameId="brahmaputra-boat"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

interface RiverItem {
  id: number;
  x: number;
  y: number;
  type: "lotus" | "sandbar";
  collected?: boolean;
}

export function BrahmaputraBoatGame() {
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "brahmaputra-boat", startLevel(detail));

  const [phase, setPhase] = useState<"intro" | "sail" | "done">("intro");
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boatPosRef = useRef({ x: 0.5, y: 0.78, vx: 0 });
  const itemsRef = useRef<RiverItem[]>([]);
  const keysPressedRef = useRef<{ left: boolean; right: boolean }>({ left: false, right: false });
  const TARGET_LOTUSES = 8;

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "brahmaputra-boat",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const initRiverItems = useCallback(() => {
    const items: RiverItem[] = [];
    for (let i = 0; i < TARGET_LOTUSES; i++) {
      items.push({
        id: i,
        x: 0.2 + (i * 0.3) % 0.6,
        y: -0.2 - i * 0.45,
        type: "lotus",
        collected: false,
      });
    }
    itemsRef.current = items;
  }, []);

  // 60 FPS Fluid River Canvas Loop
  useEffect(() => {
    if (phase !== "sail") return;
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

      // 1. Boat Physics Update
      const keys = keysPressedRef.current;
      if (keys.left) boatPosRef.current.vx -= 0.0015;
      if (keys.right) boatPosRef.current.vx += 0.0015;
      boatPosRef.current.x += boatPosRef.current.vx;
      boatPosRef.current.vx *= 0.9;
      boatPosRef.current.x = Math.max(0.12, Math.min(0.88, boatPosRef.current.x));

      // 2. Flowing Brahmaputra River Water
      const waterGrad = ctx.createLinearGradient(0, 0, 0, h);
      waterGrad.addColorStop(0, "#0284C7");
      waterGrad.addColorStop(0.5, "#0369A1");
      waterGrad.addColorStop(1, "#075985");
      ctx.fillStyle = waterGrad;
      ctx.fillRect(0, 0, w, h);

      // River currents / ripples
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 8; i++) {
        const ry = ((tick * 2 + i * 60) % h);
        ctx.beginPath();
        ctx.moveTo(0, ry);
        ctx.bezierCurveTo(w * 0.3, ry + 10, w * 0.7, ry - 10, w, ry);
        ctx.stroke();
      }

      // 3. Render & Collect Floating Lotuses
      let collectedNow = 0;
      itemsRef.current.forEach((item) => {
        item.y += 0.0038; // Current flow speed

        if (!item.collected) {
          const ix = item.x * w;
          const iy = item.y * h;

          // Pink Lotus Blossom
          ctx.beginPath();
          ctx.arc(ix, iy, 14 + Math.sin(tick * 0.1) * 2, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(244, 114, 182, 0.35)";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(ix, iy, 9, 0, Math.PI * 2);
          ctx.fillStyle = "#EC4899";
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = "#FFFFFF";
          ctx.stroke();

          // Collision detection with boat
          const bx = boatPosRef.current.x * w;
          const by = boatPosRef.current.y * h;
          if (Math.hypot(bx - ix, by - iy) < 32) {
            item.collected = true;
            collectedNow++;
            playWaterRipple();
          }
        }
      });

      if (collectedNow > 0) {
        setScore((s) => {
          const next = s + collectedNow;
          if (next >= TARGET_LOTUSES) {
            setTimeout(() => {
              playComplete();
              setPhase("done");
              if (startedAt) {
                recordGameSession(patientId, {
                  gameId: "brahmaputra-boat",
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

      // 4. Draw Traditional Assamese Wooden Naao (Riverboat)
      const bx = boatPosRef.current.x * w;
      const by = boatPosRef.current.y * h;

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(boatPosRef.current.vx * 20);

      // Boat Wake Foam
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.ellipse(0, 20, 16, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Wooden Boat Hull
      ctx.fillStyle = "#78350F";
      ctx.beginPath();
      ctx.moveTo(0, -28); // Sharp bow
      ctx.bezierCurveTo(14, -10, 14, 15, 6, 26);
      ctx.lineTo(-6, 26);
      ctx.bezierCurveTo(-14, 15, -14, -10, 0, -28);
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#451A03";
      ctx.stroke();

      // Bamboo Canopy (Chhoi)
      ctx.fillStyle = "#F59E0B";
      ctx.beginPath();
      ctx.roundRect(-8, -6, 16, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [level, patientId, phase, startedAt, taps]);

  const startSailing = useCallback(() => {
    playPress();
    setPhase("sail");
    setScore(0);
    initRiverItems();
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
  }, [initRiverItems]);

  const locale = useLocale();
  const str = getGameStrings("brahmaputra-boat", locale);

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
                Spatial Navigation // Module CDTx-23
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-sky-900" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-sky-900 text-white shadow-[4px_4px_0px_#000]">
            <Compass className="h-10 w-10 stroke-[2.5]" />
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
            <span className="text-xs font-black uppercase tracking-wider text-sky-900 block mb-2">
              Clinical Benefits:
            </span>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-800" />
                <span>Visuospatial continuous orientation & hand-eye steering</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-tea" />
                <span>Dynamic selective attention across flowing visual streams</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-marigold" />
                <span>Calming water acoustics and heritage river reminiscence</span>
              </div>
            </div>
          </div>

          <AudioPrompt
            text={str.audioPrompt}
            label={str.listenLabel}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startSailing}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "sail" ? (
        <div className="flex flex-col items-center gap-3.5 py-1">
          {/* SAILING STATUS HUD */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-sky-950 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-sky-700" /> {str.hudProgress}: {score} / {TARGET_LOTUSES}
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded bg-sky-100 text-sky-900 border border-sky-300">
              River Current: Calm
            </span>
          </div>

          {/* FLUID RIVER CANVAS */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] bg-black">
            <canvas
              ref={canvasRef}
              width={480}
              height={400}
              className="w-full h-[340px] sm:h-[380px] block cursor-pointer"
              onPointerMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                boatPosRef.current.x = (e.clientX - rect.left) / rect.width;
              }}
            />
          </div>

          {/* TACTILE STEERING BUTTONS */}
          <div className="w-full max-w-md grid grid-cols-2 gap-3">
            <button
              type="button"
              onPointerDown={() => { keysPressedRef.current.left = true; setTaps((t) => t + 1); }}
              onPointerUp={() => { keysPressedRef.current.left = false; }}
              className="btn-tactile flex items-center justify-center gap-2 rounded-2xl border-3 border-black bg-sky-100 p-4 font-black text-ink shadow-[4px_4px_0px_#000] active:translate-y-1 hover:bg-sky-200 cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5 text-sky-900" />
              <span>STEER LEFT</span>
            </button>

            <button
              type="button"
              onPointerDown={() => { keysPressedRef.current.right = true; setTaps((t) => t + 1); }}
              onPointerUp={() => { keysPressedRef.current.right = false; }}
              className="btn-tactile flex items-center justify-center gap-2 rounded-2xl border-3 border-black bg-sky-100 p-4 font-black text-ink shadow-[4px_4px_0px_#000] active:translate-y-1 hover:bg-sky-200 cursor-pointer"
            >
              <span>STEER RIGHT</span>
              <ArrowRight className="h-5 w-5 text-sky-900" />
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
                <span className="text-xs font-black uppercase tracking-wider text-sky-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> River Haven Reached
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-sky-900 text-white px-2 py-0.5">
                  {TARGET_LOTUSES} Lotuses Gathered
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                Spatial Tracking: Excellent Flow
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1">
                Continuous lateral steering demonstrated agile visuomotor anticipation and calm spatial focus.
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-sky-100 px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Waves className="h-4 w-4 text-sky-900" />
                  <span className="text-xs font-black">Play Brahmaputra Boatman Tune</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startSailing}>
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
