"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Waves,
  Eraser,
  Undo2,
  Flower2,
  Activity,
} from "lucide-react";
import { GameShell } from "@/components/games/GameShell";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playTapFeedback } from "@/lib/sound";
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

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  id: number;
  points: Point[];
  color: string;
  width: number;
}

interface BloomedLotus {
  id: number;
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
  const [bloomedLotuses, setBloomedLotuses] = useState<BloomedLotus[]>([]);
  const targetLotuses = 5;

  // Selected Brush Styling
  const [activeColor, setActiveColor] = useState("#F59E0B"); // Sacred Gold
  const [brushWidth, setBrushWidth] = useState(8); // 4 = Fine, 8 = Calligraphy, 14 = Ribbon

  // Line Painting State (Permanent, Multi-Stroke)
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStrokeRef = useRef<Point[]>([]);
  const [totalLineDistance, setTotalLineDistance] = useState(0);
  const lastLineBloomDistanceRef = useRef(0);

  // OpenCV Vision & Video States
  const [cameraActive, setCameraActive] = useState(false);
  const [motionEvent, setMotionEvent] = useState<MotionEvent | null>(null);

  // Drawing Canvas Refs
  const paintCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const hudCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<OpticalMotionTracker | null>(null);
  const isPointerDrawingRef = useRef(false);
  const lastPointRef = useRef<Point | null>(null);

  // Clinical Telemetry
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const score = Math.min(100, Math.round((bloomedLotuses.length / targetLotuses) * 60 + Math.min(40, totalLineDistance / 40)));

  // Redraw all persistent strokes on the canvas
  const renderAllStrokes = useCallback(
    (strokeList: Stroke[], livePoints?: Point[], liveColor?: string, liveWidth?: number) => {
      const canvas = paintCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const drawStrokePath = (points: Point[], color: string, width: number) => {
        if (points.length < 2) return;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.shadowColor = color;
        ctx.shadowBlur = width * 1.2;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2;
          const yc = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        }
        const last = points[points.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.stroke();
        ctx.restore();
      };

      // Draw all saved strokes
      strokeList.forEach((s) => drawStrokePath(s.points, s.color, s.width));

      // Draw current live stroke
      if (livePoints && livePoints.length >= 2 && liveColor && liveWidth) {
        drawStrokePath(livePoints, liveColor, liveWidth);
      }
    },
    []
  );

  // Spawn a sacred lotus flower along the drawn line
  const spawnLotusAtCoord = useCallback(
    (nx: number, ny: number, color = activeColor) => {
      setBloomedLotuses((prev) => {
        // Prevent stacking flowers exactly on top of each other
        if (prev.some((l) => Math.hypot(l.x - nx, l.y - ny) < 0.12)) return prev;
        playCorrect();
        const next = [
          ...prev,
          {
            id: Date.now() + Math.random(),
            x: nx,
            y: ny,
            color,
          },
        ];
        return next;
      });
    },
    [activeColor]
  );

  // Append a point to the active line stroke
  const appendPointToActiveLine = useCallback(
    (rawX: number, rawY: number) => {
      const canvas = paintCanvasRef.current;
      if (!canvas) return;

      const px = Math.max(4, Math.min(canvas.width - 4, rawX));
      const py = Math.max(4, Math.min(canvas.height - 4, rawY));

      if (lastPointRef.current) {
        const dx = px - lastPointRef.current.x;
        const dy = py - lastPointRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Filter tiny jitter
        if (dist < 4) return;

        setTotalLineDistance((d) => {
          const nextDist = d + dist;
          // Every 240px of deliberate line drawn, bloom a sacred water lotus along the stroke!
          if (nextDist - lastLineBloomDistanceRef.current > 240) {
            lastLineBloomDistanceRef.current = nextDist;
            const normX = px / canvas.width;
            const normY = py / canvas.height;
            spawnLotusAtCoord(normX, normY);
          }
          return nextDist;
        });
      }

      lastPointRef.current = { x: px, y: py };
      currentStrokeRef.current.push({ x: px, y: py });

      // Live update canvas
      renderAllStrokes(strokes, currentStrokeRef.current, activeColor, brushWidth);
    },
    [activeColor, brushWidth, renderAllStrokes, spawnLotusAtCoord, strokes]
  );

  // Finish current stroke
  const finalizeActiveStroke = useCallback(() => {
    if (currentStrokeRef.current.length >= 2) {
      const newStroke: Stroke = {
        id: Date.now(),
        points: [...currentStrokeRef.current],
        color: activeColor,
        width: brushWidth,
      };
      setStrokes((prev) => {
        const next = [...prev, newStroke];
        renderAllStrokes(next);
        return next;
      });
      playTapFeedback();
    }
    currentStrokeRef.current = [];
    lastPointRef.current = null;
  }, [activeColor, brushWidth, renderAllStrokes]);

  // Handle OpenCV Camera Motion Event (Air Hand Drawing)
  const handleMotionEvent = useCallback(
    (evt: MotionEvent) => {
      setMotionEvent(evt);

      const canvas = paintCanvasRef.current;
      if (!canvas) return;

      // 1:1 camera viewport mapping to canvas (reaches all 4 corners)
      const hand = evt.rightHand || evt.leftHand;
      const effectiveY = hand ? hand.y : evt.y;
      const effectiveX = hand ? hand.x : evt.x;

      if (evt.hasMotion && evt.energy > 0.12) {
        const px = Math.max(0, Math.min(canvas.width, effectiveX * canvas.width));
        const py = Math.max(0, Math.min(canvas.height, effectiveY * canvas.height));
        appendPointToActiveLine(px, py);
      } else {
        if (currentStrokeRef.current.length > 0) {
          finalizeActiveStroke();
        }
      }
    },
    [appendPointToActiveLine, finalizeActiveStroke]
  );

  // Initialize OpenCV Motion Tracker
  useEffect(() => {
    if (cameraActive && phase === "painting") {
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

  // Render OpenCV HUD Overlay
  useEffect(() => {
    if (!hudCanvasRef.current || !motionEvent || phase !== "painting") return;
    drawOpenCvOverlay(hudCanvasRef.current, motionEvent, {
      showHands: true,
      showGrid: false,
      showMetrics: true,
      videoEl: trackerRef.current?.getVideoElement(),
    });
  }, [motionEvent, phase]);

  // Touch / Mouse Pointer Handlers for Direct Canvas Drawing
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    isPointerDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (canvas.width / rect.width);
    const py = (e.clientY - rect.top) * (canvas.height / rect.height);
    currentStrokeRef.current = [{ x: px, y: py }];
    lastPointRef.current = { x: px, y: py };
    setTaps((t) => t + 1);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isPointerDrawingRef.current) return;
    const canvas = paintCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = (e.clientX - rect.left) * (canvas.width / rect.width);
    const py = (e.clientY - rect.top) * (canvas.height / rect.height);
    appendPointToActiveLine(px, py);
  };

  const handlePointerUp = () => {
    if (isPointerDrawingRef.current) {
      isPointerDrawingRef.current = false;
      finalizeActiveStroke();
    }
  };

  // Undo Last Line
  const undoLastStroke = () => {
    playPress();
    setStrokes((prev) => {
      const next = prev.slice(0, -1);
      renderAllStrokes(next);
      return next;
    });
  };

  // Clear All Lines
  const clearAllLines = () => {
    playPress();
    setStrokes([]);
    currentStrokeRef.current = [];
    lastPointRef.current = null;
    setTotalLineDistance(0);
    lastLineBloomDistanceRef.current = 0;
    const canvas = paintCanvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

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
        taps: taps + strokes.length + bloomedLotuses.length,
        errorCount: 0,
      });
    }
  }, [bloomedLotuses.length, level, patientId, startedAt, strokes.length, taps]);

  const startGame = useCallback(() => {
    playPress();
    setPhase("painting");
    setBloomedLotuses([]);
    setStrokes([]);
    currentStrokeRef.current = [];
    lastPointRef.current = null;
    setTotalLineDistance(0);
    lastLineBloomDistanceRef.current = 0;
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    setCameraActive(true);

    speak(
      "Welcome to the Brahmaputra Water Canvas. Draw lines with your finger or in the air to paint radiant water strokes and bloom sacred lotuses.",
      locale,
      rate
    );
  }, [locale, rate]);

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "lotus-painter",
    level,
    startedAt,
    taps: taps + strokes.length,
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
                Kinesthetic Line Drawing // Module CDTx-22
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

          {/* Line Drawing Features */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000] space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-teal-900 block">
              Continuous Line & Calligraphy Features:
            </span>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Multi-Stroke Line Engine: Paint rich, continuous lines across water</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              <span>Lotus Line Milestones: Sacred flowers bloom along your painted lines</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-teal-500" />
              <span>Dual Input: Air hand motion or direct smooth touch/pointer drawing</span>
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
        <div className="flex flex-col items-center gap-3 py-1">
          {/* TOP BAR: LINE METRICS & TOOLS */}
          <div className="w-full max-w-lg rounded-2xl border-3 border-black bg-surface p-3 shadow-[4px_4px_0px_#000] flex flex-wrap items-center justify-between gap-2.5">
            {/* Lotus & Line Counter */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black bg-teal-100 font-serif font-black text-teal-950 text-xs">
                  {bloomedLotuses.length}/{targetLotuses}
                </span>
                <span className="text-xs font-black text-teal-950">Lotuses</span>
              </div>

              <div className="h-4 w-px bg-black/20" />

              <div className="flex items-center gap-1 text-xs font-bold text-ink-secondary">
                <Activity className="h-3.5 w-3.5 text-teal-800" />
                <span>Lines: <strong>{strokes.length}</strong></span>
                <span className="text-[10px]">({Math.round(totalLineDistance / 10)}cm)</span>
              </div>
            </div>

            {/* Quick Actions: Undo & Clear */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={undoLastStroke}
                disabled={strokes.length === 0}
                className="btn-tactile flex items-center gap-1 rounded-xl border-2 border-black bg-surface px-2.5 py-1 text-xs font-black text-ink shadow-xs hover:bg-surface-muted disabled:opacity-40 cursor-pointer"
                title="Undo Last Line"
              >
                <Undo2 className="h-3 w-3" />
                <span>Undo</span>
              </button>

              <button
                type="button"
                onClick={clearAllLines}
                className="btn-tactile flex items-center gap-1 rounded-xl border-2 border-black bg-surface-muted px-2.5 py-1 text-xs font-black text-ink shadow-xs hover:bg-surface cursor-pointer"
                title="Clear All Lines"
              >
                <Eraser className="h-3 w-3" />
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* PALETTE & BRUSH WIDTH SELECTOR */}
          <div className="w-full max-w-lg flex items-center justify-between gap-2 px-1">
            {/* Color Swatches */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase text-teal-950">Palette:</span>
              <div className="flex items-center gap-1.5">
                {[
                  { hex: "#F59E0B", name: "Sacred Gold" },
                  { hex: "#EC4899", name: "Lotus Rose" },
                  { hex: "#10B981", name: "Brahmaputra Teal" },
                  { hex: "#8B5CF6", name: "Sunset Violet" },
                  { hex: "#FDFBF7", name: "Sacred Chalk" },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setActiveColor(c.hex)}
                    style={{ backgroundColor: c.hex }}
                    className={`h-6 w-6 rounded-full border-2 border-black transition-all cursor-pointer ${
                      activeColor === c.hex ? "scale-125 ring-2 ring-black shadow-xs" : "opacity-75 hover:scale-110"
                    }`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            {/* Brush Width Pills */}
            <div className="flex items-center gap-1">
              {[
                { label: "Fine", val: 4 },
                { label: "Med", val: 8 },
                { label: "Ribbon", val: 14 },
              ].map((w) => (
                <button
                  key={w.val}
                  type="button"
                  onClick={() => setBrushWidth(w.val)}
                  className={`rounded-lg border px-2 py-0.5 text-[10px] font-black transition-all cursor-pointer ${
                    brushWidth === w.val
                      ? "border-black bg-teal-900 text-white shadow-xs"
                      : "border-black/30 bg-surface text-ink hover:border-black"
                  }`}
                >
                  {w.label}
                </button>
              ))}
            </div>
          </div>

          {/* MAIN INTERACTIVE WATER CANVAS STAGE */}
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden border-4 border-black bg-[#061D15] shadow-[8px_8px_0px_#000] select-none touch-none">
            {/* Water Ripple Background */}
            <div className="absolute inset-0 bg-[radial-gradient(#10B981_1px,transparent_1px)] [background-size:18px_18px] opacity-25 pointer-events-none" />

            {/* Paint Layer Canvas */}
            <canvas
              ref={paintCanvasRef}
              width={480}
              height={360}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className="absolute inset-0 w-full h-full cursor-crosshair z-10"
            />

            {/* OpenCV HUD Reticle Canvas */}
            <canvas
              ref={hudCanvasRef}
              width={320}
              height={240}
              className="absolute inset-0 w-full h-full pointer-events-none opacity-80 z-20"
            />

            {/* Bloomed Sacred Lotus Flowers Along Drawn Lines */}
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
                <Flower2 className="w-10 h-10 sm:w-12 sm:h-12 text-pink-500 fill-pink-300 drop-shadow-[0_0_14px_rgba(236,72,153,0.9)]" />
                <span
                  style={{ backgroundColor: l.color }}
                  className="rounded-full px-2 py-0.2 text-[8px] font-black text-white border border-black shadow-xs mt-0.5"
                >
                  Bloomed Lotus
                </span>
              </div>
            ))}

            {/* In-Game Status HUD */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-30 pointer-events-none">
              <span className="rounded-xl border-2 border-black bg-white/90 px-2.5 py-1 text-[11px] font-black text-ink shadow-[2px_2px_0px_#000]">
                {cameraActive
                  ? motionEvent?.hasMotion
                    ? "Painting In-Air Lines"
                    : "Wave Hand Downward to Paint Lines"
                  : "Drag Finger or Pointer to Paint Lines"}
              </span>

              <span className="rounded-full border border-teal-400 bg-teal-950/80 px-2.5 py-0.5 text-[10px] font-black text-teal-300">
                Brahmaputra Canvas
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS & FLOWER SPAWN */}
          <div className="w-full max-w-lg flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() =>
                spawnLotusAtCoord(
                  0.25 + Math.random() * 0.5,
                  0.35 + Math.random() * 0.35,
                  activeColor
                )
              }
              className="btn-tactile flex-1 flex items-center justify-center gap-2 rounded-2xl border-3 border-black bg-teal-100 p-3 text-ink shadow-[3px_3px_0px_#000] hover:bg-teal-200 active:translate-y-0.5 cursor-pointer"
            >
              <Flower2 className="h-5 w-5 text-teal-900" />
              <div className="text-left">
                <span className="text-[10px] font-bold text-teal-900 uppercase block">
                  Add Water Lotus
                </span>
                <span className="text-xs font-black text-ink block">
                  Bloom on Water
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={handleFinishGame}
              className="btn-tactile flex-1 flex items-center justify-center gap-2 rounded-2xl border-3 border-black bg-marigold p-3 text-white shadow-[3px_3px_0px_#000] hover:bg-amber-600 active:translate-y-0.5 cursor-pointer"
            >
              <CheckCircle2 className="h-5 w-5 text-white" />
              <div className="text-left">
                <span className="text-[10px] font-bold text-white/90 uppercase block">
                  Complete Painting
                </span>
                <span className="text-xs font-black text-white block">
                  Finish Masterpiece
                </span>
              </div>
            </button>
          </div>
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
