"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Camera,
  RotateCcw,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  Waves,
  Brush,
  Eraser,
} from "lucide-react";
import { GameShell } from "@/components/games/GameShell";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete } from "@/lib/sound";
import { speak } from "@/lib/speech";
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

interface BloomedLotus {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  scale: number;
}

interface StrokePoint {
  x: number;
  y: number;
  color: string;
}

export function LotusPainterGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "lotus-painter", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "painting" | "done">("intro");
  const [score, setScore] = useState(0);
  const [bloomedLotuses, setBloomedLotuses] = useState<BloomedLotus[]>([]);
  const targetLotuses = 5;

  // Selected Brush Color (Parchment Gold, Lotus Pink, Teal River, Orchid Violet)
  const [activeColor, setActiveColor] = useState("#F59E0B");

  // OpenCV Vision & Video States
  const [cameraActive, setCameraActive] = useState(false);
  const [motionEvent, setMotionEvent] = useState<MotionEvent | null>(null);

  // Drawing Canvas
  const paintCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hudCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<OpticalMotionTracker | null>(null);
  const strokesRef = useRef<StrokePoint[]>([]);
  const lastDrawPointRef = useRef<{ x: number; y: number } | null>(null);

  // Clinical Telemetry
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const handleFinishGame = useCallback(() => {
    playComplete();
    setPhase("done");
    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "lotus-painter",
        level,
        outcome: "completed",
        score: 100,
        startedAt,
        taps: taps + targetLotuses,
        errorCount: 0,
      });
    }
  }, [level, patientId, startedAt, taps, targetLotuses]);

  // Bloom a lotus at normalized coords (nx, ny)
  const spawnLotus = useCallback((nx: number, ny: number, color = "#EC4899") => {
    setBloomedLotuses((prev) => {
      if (prev.some((l) => Math.hypot(l.x - nx, l.y - ny) < 0.12)) return prev;
      playCorrect();
      const newLotuses = [
        ...prev,
        {
          id: Date.now(),
          x: nx,
          y: ny,
          color,
          size: 40,
          scale: 1,
        },
      ];
      setScore((s) => s + 20);
      if (newLotuses.length >= targetLotuses) {
        setTimeout(() => {
          handleFinishGame();
        }, 800);
      }
      return newLotuses;
    });
  }, [targetLotuses, handleFinishGame]);

  // Handle OpenCV Motion Event
  const handleMotionEvent = useCallback((evt: MotionEvent) => {
    setMotionEvent(evt);

    const pCanvas = paintCanvasRef.current;
    if (!pCanvas) return;
    const ctx = pCanvas.getContext("2d");
    if (!ctx) return;

    // 1. If Open Palm Gesture detected, bloom a water lotus!
    if (evt.gesture === "OPEN_PALM" || (evt.rightHand?.isOpenPalm) || (evt.leftHand?.isOpenPalm)) {
      const hx = evt.rightHand?.x ?? evt.leftHand?.x ?? evt.x;
      const hy = evt.rightHand?.y ?? evt.leftHand?.y ?? evt.y;
      spawnLotus(hx, hy, activeColor);
    }

    // 2. Continuous Air-Drawing with finger / hand centroid
    if (evt.hasMotion && evt.energy > 0.08) {
      const activeHand = evt.rightHand || evt.leftHand || { x: evt.x, y: evt.y };
      const px = activeHand.x * pCanvas.width;
      const py = activeHand.y * pCanvas.height;

      strokesRef.current.push({ x: px, y: py, color: activeColor });
      if (strokesRef.current.length > 300) strokesRef.current.shift();

      if (lastDrawPointRef.current) {
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = 6;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = activeColor;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.moveTo(lastDrawPointRef.current.x, lastDrawPointRef.current.y);
        ctx.lineTo(px, py);
        ctx.stroke();
      }
      lastDrawPointRef.current = { x: px, y: py };
    } else {
      lastDrawPointRef.current = null;
    }
  }, [activeColor, spawnLotus]);

  // Initialize OpenCV Motion Tracker
  useEffect(() => {
    if (cameraActive && phase === "painting") {
      const tracker = new OpticalMotionTracker(handleMotionEvent, 0.4);
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

  // Render OpenCV HUD Overlay
  useEffect(() => {
    if (!hudCanvasRef.current || !motionEvent || phase !== "painting") return;
    drawOpenCvOverlay(hudCanvasRef.current, motionEvent, {
      showHands: true,
      showGrid: false,
      showMetrics: true,
    });
  }, [motionEvent, phase]);

  const startGame = useCallback(() => {
    playPress();
    setPhase("painting");
    setScore(0);
    setBloomedLotuses([]);
    strokesRef.current = [];
    lastDrawPointRef.current = null;
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    setCameraActive(true);

    if (paintCanvasRef.current) {
      const ctx = paintCanvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, paintCanvasRef.current.width, paintCanvasRef.current.height);
    }

    speak(
      "Welcome to the Brahmaputra Water Canvas. Point your finger or open your hand to paint glowing water lotuses.",
      locale,
      rate
    );
  }, [locale, rate]);

  const clearCanvas = () => {
    playPress();
    strokesRef.current = [];
    lastDrawPointRef.current = null;
    if (paintCanvasRef.current) {
      const ctx = paintCanvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, paintCanvasRef.current.width, paintCanvasRef.current.height);
    }
  };

  const handleCanvasPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    setTaps((t) => t + 1);
    spawnLotus(nx, ny, activeColor);
  };

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "lotus-painter",
    level,
    startedAt,
    taps: taps + bloomedLotuses.length,
    errorCount: 0,
  });

  const str = getGameStrings("lotus-painter", locale);

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
                OpenCV Optical Air-Canvas // Module CDTx-22
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-teal-900" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-teal-950 text-white shadow-[4px_4px_0px_#000]">
            <Waves className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {str.introSubtitle}
            </p>
          </div>

          {/* OpenCV Features */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000] space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-teal-900 block">
              Optical Gesture Controls:
            </span>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Point Finger: Weave radiant golden water strokes across the river</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Open Palm: Instantly blooms a sacred floating lotus at your hand</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              <span>Touch Screen: Touch directly to plant lotuses anywhere on the water</span>
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
      ) : phase === "painting" ? (
        <div className="flex flex-col items-center gap-4 py-1">
          {/* COLOR PALETTE & LOTUS PROGRESS HUD */}
          <div className="w-full max-w-lg rounded-2xl border-3 border-black bg-surface p-3 shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-teal-100 font-serif font-black text-teal-950 text-sm">
                {bloomedLotuses.length}/{targetLotuses}
              </span>
              <div>
                <span className="text-[10px] font-black uppercase text-teal-900 block">
                  Lotuses Bloomed
                </span>
                <span className="text-xs font-black text-ink">
                  {bloomedLotuses.length >= targetLotuses ? "Mandala Complete! 🎉" : `${targetLotuses - bloomedLotuses.length} more lotuses to bloom`}
                </span>
              </div>
            </div>

            {/* Radiant Color Selectors */}
            <div className="flex items-center gap-1.5">
              {[
                { hex: "#F59E0B", name: "Gold" },
                { hex: "#EC4899", name: "Lotus Pink" },
                { hex: "#10B981", name: "Teal" },
                { hex: "#8B5CF6", name: "Orchid" },
              ].map((c) => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setActiveColor(c.hex)}
                  style={{ backgroundColor: c.hex }}
                  className={`h-7 w-7 rounded-full border-2 border-black transition-transform cursor-pointer ${
                    activeColor === c.hex ? "scale-125 ring-2 ring-black shadow-sm" : "opacity-80 hover:scale-110"
                  }`}
                  title={c.name}
                />
              ))}

              <button
                type="button"
                onClick={clearCanvas}
                className="ml-2 flex items-center gap-1 rounded-xl border border-black bg-surface-muted px-2 py-1 text-[10px] font-black text-ink hover:bg-surface"
              >
                <Eraser className="h-3 w-3" /> Clear
              </button>
            </div>
          </div>

          {/* MAIN INTERACTIVE WATER CANVAS STAGE */}
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden border-4 border-black bg-[#061D15] shadow-[8px_8px_0px_#000] select-none">
            {/* Water Ripple Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />

            {/* Paint Layer Canvas */}
            <canvas
              ref={paintCanvasRef}
              width={480}
              height={360}
              onPointerDown={handleCanvasPointerDown}
              className="absolute inset-0 w-full h-full cursor-crosshair z-10"
            />

            {/* OpenCV HUD Reticle Canvas */}
            <canvas
              ref={hudCanvasRef}
              width={320}
              height={240}
              className="absolute inset-0 w-full h-full pointer-events-none opacity-80 z-20"
            />

            {/* Bloomed Sacred Lotus Flowers */}
            {bloomedLotuses.map((l) => (
              <div
                key={l.id}
                style={{
                  left: `${l.x * 100}%`,
                  top: `${l.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className="absolute z-15 pointer-events-none flex flex-col items-center animate-in zoom-in-75 duration-300"
              >
                <span className="text-4xl sm:text-5xl filter drop-shadow-[0_0_12px_rgba(236,72,153,0.8)]">
                  🪷
                </span>
                <span
                  style={{ backgroundColor: l.color }}
                  className="rounded-full px-2 py-0.2 text-[8px] font-black text-white border border-black shadow-xs mt-0.5"
                >
                  Sacred Lotus
                </span>
              </div>
            ))}

            {/* Bottom HUD Hint */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-30 pointer-events-none">
              <span className="rounded-xl border-2 border-black bg-white/90 px-2.5 py-1 text-[11px] font-black text-ink shadow-[2px_2px_0px_#000]">
                {motionEvent?.hasMotion ? `⚡ ${motionEvent.gesture.replace(/_/g, " ")}` : "Point Finger or Open Palm to Paint 🪷"}
              </span>

              <span className="rounded-full border border-teal-400 bg-teal-950/80 px-2.5 py-0.5 text-[10px] font-black text-teal-300">
                Brahmaputra Tides
              </span>
            </div>
          </div>

          {/* QUICK TOUCH TACTILE FLOWER SPAWN (ACCESSIBILITY LAYER) */}
          <div className="w-full max-w-lg space-y-2">
            <span className="text-xs font-black uppercase text-teal-900 block text-left">
              Quick Touch Controls (Or Wave/Point Hand at Camera):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => spawnLotus(0.3 + Math.random() * 0.4, 0.4 + Math.random() * 0.3, activeColor)}
                className="btn-tactile flex items-center justify-center gap-2 rounded-2xl border-3 border-black bg-teal-100 p-3 text-ink shadow-[3px_3px_0px_#000] hover:bg-teal-200 active:translate-y-0.5 cursor-pointer text-left"
              >
                <span className="text-2xl">🪷</span>
                <div>
                  <span className="text-[10px] font-bold text-teal-900 uppercase block">
                    Plant Lotus Flower
                  </span>
                  <span className="text-xs font-black text-ink block">
                    Touch to Bloom
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={clearCanvas}
                className="btn-tactile flex items-center justify-center gap-2 rounded-2xl border-3 border-black bg-surface p-3 text-ink shadow-[3px_3px_0px_#000] hover:bg-surface-muted active:translate-y-0.5 cursor-pointer text-left"
              >
                <Brush className="h-5 w-5 text-teal-900" />
                <div>
                  <span className="text-[10px] font-bold text-ink-secondary uppercase block">
                    Fresh Canvas
                  </span>
                  <span className="text-xs font-black text-ink block">
                    Clear River
                  </span>
                </div>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-ink-secondary">
              <button
                type="button"
                onClick={() => setCameraActive(!cameraActive)}
                className="flex items-center gap-1 hover:text-ink cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5 text-teal-900" />
                <span>{cameraActive ? "OpenCV Air-Draw: ON" : "Turn On Air-Draw Vision"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  speak(
                    "Point your finger to draw radiant golden strokes, or open your palm to bloom a sacred lotus.",
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
          title="Sacred Lotus Mandala Completed!"
          subtitle="You wove magnificent radiant lotuses and golden water mandalas upon the sacred Brahmaputra."
          xpEarned={160}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none space-y-3">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Fine-Motor Praxic Report
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-teal-950 text-white px-2 py-0.5">
                  5/5 Bloomed
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-black/20 bg-white p-2.5">
                  <span className="text-[10px] font-black uppercase text-ink-secondary block">
                    Motor Control
                  </span>
                  <span className="font-serif text-xl font-black text-emerald-700">
                    Smooth Curve
                  </span>
                  <p className="text-[10px] font-semibold text-emerald-800 mt-0.5">
                    Continuous finger stroke
                  </p>
                </div>

                <div className="rounded-xl border border-black/20 bg-white p-2.5">
                  <span className="text-[10px] font-black uppercase text-ink-secondary block">
                    Gesture Accuracy
                  </span>
                  <span className="font-serif text-xl font-black text-teal-900 font-mono">
                    100%
                  </span>
                  <p className="text-[10px] font-semibold text-teal-800 mt-0.5">
                    Open palm & pointing
                  </p>
                </div>
              </div>

              <p className="text-xs font-semibold text-ink-secondary pt-2 border-t border-black/10 leading-relaxed">
                ASHA Clinical Observation: Patient exhibits excellent fine-motor fingertip isolation, wrist flexibility, and deep artistic engagement with calming water mandalas.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startGame}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> Paint More Lotuses
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
