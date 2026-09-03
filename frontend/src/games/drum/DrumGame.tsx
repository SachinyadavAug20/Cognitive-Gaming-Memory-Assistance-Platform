"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Music,
  Paperclip,
  ShieldCheck,
  Activity,
  Camera,
  Sliders,
  UserCheck,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playTapFeedback } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { OpticalMotionTracker, type MotionEvent } from "@/lib/vision";
import { DrumScene3D } from "./DrumScene3D";
import { getGameStrings } from "@/lib/gameI18n";

type DrumState = "ARMED" | "COOLDOWN" | "WAITING_LIFT";

// Traditional Assamese Bihu Dhol Rhythm Sequence (Call & Response Pattern)
const BIHU_BEAT_SEQUENCE: ("left" | "right")[] = [
  "left",  // Dhum
  "right", // Taak
  "left",  // Dhum
  "right", // Taak
  "left",  // Dhum
  "left",  // Dhum
  "right", // Taak
  "right", // Taak
  "left",  // Dhum
  "right", // Taak
  "left",  // Dhum
  "right", // Taak
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
    <section className="pb-12 min-h-screen bg-[#FAF6F0]">
      <GameHeader
        title={title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-marigold"
        gameId="drum"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

export function DrumGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "drum", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [hitsCount, setHitsCount] = useState(0);
  const [lastHitSide, setLastHitSide] = useState<"left" | "right" | null>(null);
  const [lastHitTime, setLastHitTime] = useState(0);
  const [leftHits, setLeftHits] = useState(0);
  const [rightHits, setRightHits] = useState(0);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  // Vision Air-Drumming State & Settings
  const [isVisionActive, setIsVisionActive] = useState(false);
  const [leftMotionLevel, setLeftMotionLevel] = useState(0);
  const [rightMotionLevel, setRightMotionLevel] = useState(0);
  const [leftDrumVisualState, setLeftDrumVisualState] = useState<DrumState>("ARMED");
  const [rightDrumVisualState, setRightDrumVisualState] = useState<DrumState>("ARMED");
  const [showVisionSettings, setShowVisionSettings] = useState(false);

  // Calibrated Clinical Settings (Calm tempo for elders, high threshold against face motion)
  const [strikeThreshold, setStrikeThreshold] = useState(0.60); // 60% optimal calibrated threshold
  const [strikePaceMs, setStrikePaceMs] = useState(600); // 600ms calm cadence (~90 BPM)

  const trackerRef = useRef<OpticalMotionTracker | null>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // State Machine refs
  const leftDrumStateRef = useRef<DrumState>("ARMED");
  const rightDrumStateRef = useRef<DrumState>("ARMED");
  const lastStrikeTimeRef = useRef<{ left: number; right: number }>({ left: 0, right: 0 });

  const TARGET_HITS = 12;
  const score = Math.round((hitsCount / TARGET_HITS) * 100);
  const currentTargetSide = BIHU_BEAT_SEQUENCE[hitsCount % BIHU_BEAT_SEQUENCE.length];

  const handleDrumHit = useCallback(
    (side: "left" | "right") => {
      setHitsCount((prevHits) => {
        if (prevHits >= TARGET_HITS) return prevHits;

        setTaps((t) => t + 1);
        stopSpeaking();
        playTapFeedback();

        setLastHitSide(side);
        setLastHitTime(Date.now());

        if (side === "left") setLeftHits((l) => l + 1);
        else setRightHits((r) => r + 1);

        const nextHits = prevHits + 1;

        if (nextHits === TARGET_HITS) {
          setTimeout(() => {
            playComplete();
            setPhase("done");
            if (startedAt) {
              recordGameSession(patientId, {
                gameId: "drum",
                level,
                outcome: "completed",
                score: 100,
                startedAt,
                taps: taps + 1,
                errorCount: 0,
              });
            }
          }, 800);
        } else {
          if (nextHits % 3 === 0) {
            playCorrect();
          }
        }
        return nextHits;
      });
    },
    [TARGET_HITS, level, patientId, startedAt, taps]
  );

  // Vision motion callback handler (Percussion State Machine with Arming & Rebound)
  const handleMotionEvent = useCallback(
    (evt: MotionEvent) => {
      // Use head-excluded drum energies (or fallback)
      const leftVal = evt.drumLeftEnergy !== undefined ? evt.drumLeftEnergy : evt.leftEnergy;
      const rightVal = evt.drumRightEnergy !== undefined ? evt.drumRightEnergy : evt.rightEnergy;

      setLeftMotionLevel(leftVal);
      setRightMotionLevel(rightVal);

      const now = Date.now();
      const RESET_ENERGY_THRESHOLD = 0.32; // Hand must relax / lift below 32% to re-arm

      // 1. LEFT DRUM STATE MACHINE
      const leftElapsed = now - lastStrikeTimeRef.current.left;
      let nextLeftState = leftDrumStateRef.current;

      if (leftDrumStateRef.current === "COOLDOWN") {
        if (leftElapsed >= strikePaceMs) {
          nextLeftState = leftVal < RESET_ENERGY_THRESHOLD ? "ARMED" : "WAITING_LIFT";
        }
      } else if (leftDrumStateRef.current === "WAITING_LIFT") {
        if (leftVal < RESET_ENERGY_THRESHOLD) {
          nextLeftState = "ARMED";
        }
      } else if (leftDrumStateRef.current === "ARMED") {
        if (leftVal >= strikeThreshold && leftElapsed >= strikePaceMs) {
          nextLeftState = "COOLDOWN";
          lastStrikeTimeRef.current.left = now;
          handleDrumHit("left");
        }
      }

      leftDrumStateRef.current = nextLeftState;
      setLeftDrumVisualState(nextLeftState);

      // 2. RIGHT DRUM STATE MACHINE
      const rightElapsed = now - lastStrikeTimeRef.current.right;
      let nextRightState = rightDrumStateRef.current;

      if (rightDrumStateRef.current === "COOLDOWN") {
        if (rightElapsed >= strikePaceMs) {
          nextRightState = rightVal < RESET_ENERGY_THRESHOLD ? "ARMED" : "WAITING_LIFT";
        }
      } else if (rightDrumStateRef.current === "WAITING_LIFT") {
        if (rightVal < RESET_ENERGY_THRESHOLD) {
          nextRightState = "ARMED";
        }
      } else if (rightDrumStateRef.current === "ARMED") {
        if (rightVal >= strikeThreshold && rightElapsed >= strikePaceMs) {
          nextRightState = "COOLDOWN";
          lastStrikeTimeRef.current.right = now;
          handleDrumHit("right");
        }
      }

      rightDrumStateRef.current = nextRightState;
      setRightDrumVisualState(nextRightState);

      // 3. RENDER LIVE CAMERA PREVIEW WITH DRUM TARGET OVERLAYS
      if (pipCanvasRef.current) {
        const canvas = pipCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const videoEl = trackerRef.current?.getVideoElement();
          if (videoEl && videoEl.readyState >= 2) {
            ctx.save();
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            ctx.restore();
          } else {
            ctx.fillStyle = "#1e1b18";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          const w = canvas.width;
          const h = canvas.height;

          // Dotted Face Exclusion Corridor (Reassurance that head is ignored)
          ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(w * 0.28, h * 0.04, w * 0.44, h * 0.38);

          ctx.fillStyle = "rgba(148, 163, 184, 0.75)";
          ctx.font = "bold 9px sans-serif";
          ctx.fillText("FACE ZONE (IGNORED)", w * 0.33, h * 0.12);

          // Left Drum Zone
          ctx.setLineDash([]);
          const isLeftStruck = nextLeftState === "COOLDOWN";
          ctx.strokeStyle = isLeftStruck ? "#f59e0b" : "rgba(245, 158, 11, 0.6)";
          ctx.lineWidth = isLeftStruck ? 3 : 2;
          ctx.fillStyle = isLeftStruck ? "rgba(245, 158, 11, 0.25)" : "rgba(245, 158, 11, 0.08)";
          ctx.fillRect(w * 0.04, h * 0.42, w * 0.40, h * 0.54);
          ctx.strokeRect(w * 0.04, h * 0.42, w * 0.40, h * 0.54);

          ctx.fillStyle = isLeftStruck ? "#fef08a" : "#fcd34d";
          ctx.font = "black 10px sans-serif";
          ctx.fillText(isLeftStruck ? "DHUM (BASS)!" : "LEFT DRUM (BASS)", w * 0.07, h * 0.50);

          // Right Drum Zone
          const isRightStruck = nextRightState === "COOLDOWN";
          ctx.strokeStyle = isRightStruck ? "#ef4444" : "rgba(239, 68, 68, 0.6)";
          ctx.lineWidth = isRightStruck ? 3 : 2;
          ctx.fillStyle = isRightStruck ? "rgba(239, 68, 68, 0.25)" : "rgba(239, 68, 68, 0.08)";
          ctx.fillRect(w * 0.56, h * 0.42, w * 0.40, h * 0.54);
          ctx.strokeRect(w * 0.56, h * 0.42, w * 0.40, h * 0.54);

          ctx.fillStyle = isRightStruck ? "#fecaca" : "#fca5a5";
          ctx.font = "black 10px sans-serif";
          ctx.fillText(isRightStruck ? "TAAK (TREBLE)!" : "RIGHT DRUM (TREBLE)", w * 0.59, h * 0.50);
        }
      }
    },
    [handleDrumHit, strikePaceMs, strikeThreshold]
  );

  const toggleVisionMode = async () => {
    playPress();
    if (isVisionActive) {
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
      setIsVisionActive(false);
      leftDrumStateRef.current = "ARMED";
      rightDrumStateRef.current = "ARMED";
    } else {
      const tracker = new OpticalMotionTracker(handleMotionEvent, 0.4);
      const success = await tracker.start();
      if (success) {
        trackerRef.current = tracker;
        setIsVisionActive(true);
        leftDrumStateRef.current = "ARMED";
        rightDrumStateRef.current = "ARMED";
        speak(
          "Air drumming camera activated. Move your left or right hand down to strike the drum. Face motion is ignored.",
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

  const startGame = useCallback(() => {
    playPress();
    setPhase("play");
    setHitsCount(0);
    setLeftHits(0);
    setRightHits(0);
    setLastHitSide(null);
    leftDrumStateRef.current = "ARMED";
    rightDrumStateRef.current = "ARMED";
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
  }, []);

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "drum",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const str = getGameStrings("drum", locale);

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
                Auditory-Motor Entrainment // Module CDTx-17
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-marigold" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-marigold text-white shadow-[4px_4px_0px_#000]">
            <Music className="h-10 w-10 stroke-[2.5]" />
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
            <span className="text-xs font-black uppercase tracking-wider text-marigold block mb-2">
              Clinical Benefits:
            </span>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-marigold" />
                <span>Auditory-motor rhythm synchronization & temporal anticipation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-tea" />
                <span>Bilateral motor symmetry tracking across left & right hemispheres</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-marigold" />
                <span>OpenCV kinetic velocity strike detector with face movement filtering</span>
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
        <div className="flex flex-col items-center gap-3 py-1">
          {/* DRUM STATUS BAR & VISION TOGGLE */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-marigold flex items-center gap-1.5">
                <Activity className="h-4 w-4" /> {str.hudProgress}: {hitsCount} / {TARGET_HITS}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-ink-secondary bg-surface-muted px-1.5 py-0.5 rounded border border-black/20">
                L: {leftHits} &bull; R: {rightHits}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Sensitivity Tuning Gear */}
              <button
                type="button"
                onClick={() => setShowVisionSettings((prev) => !prev)}
                className={`btn-tactile p-1.5 rounded-lg border-2 border-black text-xs font-black shadow-xs transition-all cursor-pointer ${
                  showVisionSettings ? "bg-amber-200" : "bg-surface hover:bg-surface-muted"
                }`}
                title="Air-Drum Strike Sensitivity Settings"
              >
                <Sliders className="h-3.5 w-3.5" />
              </button>

              {/* Air-Drumming Camera Toggle */}
              <button
                type="button"
                onClick={toggleVisionMode}
                className={`btn-tactile inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-black text-xs font-black shadow-xs transition-all cursor-pointer ${
                  isVisionActive
                    ? "bg-marigold text-white animate-pulse"
                    : "bg-surface-muted text-ink hover:bg-surface"
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>{isVisionActive ? "Air Camera: ON" : "Enable Air Camera"}</span>
              </button>
            </div>
          </div>

          {/* SENSITIVITY & TEMPO TUNING PANEL (DROPDOWN) */}
          {showVisionSettings && (
            <div className="w-full max-w-md rounded-2xl border-2 border-black bg-amber-50 p-3.5 shadow-[2px_2px_0px_#000] text-xs space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between font-black text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-marigold" />
                  Air-Drum Strike Calibration
                </span>
                <span className="text-[10px] text-amber-800">Face Filter: Active</span>
              </div>

              {/* Threshold Preset */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-ink-secondary mb-1">
                  <span>Strike Force Threshold (%):</span>
                  <span className="font-black text-ink">{Math.round(strikeThreshold * 100)}%</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { label: "Gentle (50%)", val: 0.50 },
                    { label: "Optimal (60%)", val: 0.60 },
                    { label: "Firm (72%)", val: 0.72 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setStrikeThreshold(preset.val)}
                      className={`py-1 rounded-lg border text-[11px] font-black cursor-pointer transition-all ${
                        strikeThreshold === preset.val
                          ? "bg-marigold text-white border-black shadow-xs"
                          : "bg-white text-ink border-black/30 hover:border-black"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tempo / Pace Preset */}
              <div>
                <div className="flex justify-between text-[11px] font-bold text-ink-secondary mb-1">
                  <span>Strike Cadence / Cooldown:</span>
                  <span className="font-black text-ink">{strikePaceMs}ms</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { label: "Calm (650ms)", val: 650 },
                    { label: "Normal (500ms)", val: 500 },
                    { label: "Fast (350ms)", val: 350 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setStrikePaceMs(preset.val)}
                      className={`py-1 rounded-lg border text-[11px] font-black cursor-pointer transition-all ${
                        strikePaceMs === preset.val
                          ? "bg-tea text-white border-black shadow-xs"
                          : "bg-white text-ink border-black/30 hover:border-black"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VISUAL RHYTHM CONDUCTOR (CALL & RESPONSE FOR DEMENTIA PATIENTS) */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-[#FAF5EE] p-3 shadow-[3px_3px_0px_#000] text-center space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-black uppercase text-ink-secondary">
              <span className="flex items-center gap-1.5">
                <Music className="h-3.5 w-3.5 text-marigold" />
                <span>Bihu Rhythm Conductor</span>
              </span>
              <span className="text-marigold font-mono">Beat {(hitsCount % 4) + 1} of 4</span>
            </div>

            <div className="flex items-center justify-center py-0.5">
              {currentTargetSide === "left" ? (
                <div className="flex items-center gap-2 rounded-xl border-2 border-amber-600 bg-amber-100 px-4 py-1.5 text-amber-950 font-black text-xs sm:text-sm animate-pulse shadow-xs">
                  <ArrowLeft className="h-4 w-4 stroke-[3]" />
                  <span>HIT LEFT HEAD! (Bass Dhum)</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-xl border-2 border-red-600 bg-red-100 px-4 py-1.5 text-red-950 font-black text-xs sm:text-sm animate-pulse shadow-xs">
                  <span>HIT RIGHT HEAD! (Treble Taak)</span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </div>
              )}
            </div>

            {/* 4-Beat Measure Dots */}
            <div className="flex items-center justify-center gap-2 pt-0.5">
              {[0, 1, 2, 3].map((b) => (
                <span
                  key={b}
                  className={`h-2.5 w-2.5 rounded-full border border-black transition-all ${
                    (hitsCount % 4) === b ? "bg-marigold scale-125 shadow-xs" : "bg-black/20"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* THREE.JS 3D DRUM CANVAS */}
          <div className="relative w-full max-w-md aspect-4/3 rounded-2xl border-3 border-black overflow-hidden shadow-[5px_5px_0px_#000] bg-black select-none">
            <DrumScene3D
              onDrumHit={handleDrumHit}
              lastHitSide={lastHitSide}
              lastHitTime={lastHitTime}
            />

            {/* In-Game Status HUD Overlay */}
            {isVisionActive ? (
              <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                <div className="bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Face Motion Filtered &bull; Hands Active</span>
                </div>
                <div className="bg-black/75 backdrop-blur-xs px-2 py-1 rounded-lg border border-white/20 text-[10px] font-mono font-bold text-amber-300">
                  Cutoff: {Math.round(strikeThreshold * 100)}%
                </div>
              </div>
            ) : null}
          </div>

          {/* LIVE PIP CAMERA FEED WITH DRUM TARGETS (Visible when Vision Active) */}
          {isVisionActive && (
            <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-3 shadow-[4px_4px_0px_#000] space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-black text-ink">
                <span className="flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-marigold" />
                  Live Camera Guide & Kinetic Strike Meters
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-tea bg-tea-light px-2 py-0.5 rounded border border-tea/30">
                  <UserCheck className="h-3 w-3" /> Face Protected
                </span>
              </div>

              {/* Camera Video Canvas */}
              <div className="relative w-full aspect-16/9 rounded-xl border-2 border-black overflow-hidden bg-black shadow-inner">
                <canvas
                  ref={pipCanvasRef}
                  width={320}
                  height={180}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Real-Time Kinetic Strike Force Meters */}
              <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
                {/* Left Drum Meter */}
                <div className="rounded-xl border-2 border-amber-600/40 bg-amber-50 p-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-black text-amber-950">Left Bass Force:</span>
                    <span className="font-mono font-black text-amber-800">
                      {Math.round(leftMotionLevel * 100)}%
                    </span>
                  </div>
                  {/* Gauge Bar */}
                  <div className="relative h-3 w-full rounded-full border border-black/40 bg-amber-200/50 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-75 ${
                        leftMotionLevel >= strikeThreshold ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.round(leftMotionLevel * 100))}%` }}
                    />
                    {/* Threshold Line at 60% */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-black z-10"
                      style={{ left: `${Math.round(strikeThreshold * 100)}%` }}
                      title={`Strike Line: ${Math.round(strikeThreshold * 100)}%`}
                    />
                  </div>
                  {/* Status Tag */}
                  <div className="text-[10px] font-black flex items-center justify-between pt-0.5">
                    <span>State:</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                        leftDrumVisualState === "ARMED"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-500"
                          : leftDrumVisualState === "COOLDOWN"
                          ? "bg-amber-300 text-black border border-black font-black"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {leftDrumVisualState === "ARMED"
                        ? "Ready (Strike)"
                        : leftDrumVisualState === "COOLDOWN"
                        ? "Hit! Relaxing"
                        : "Lift Hand Up"}
                    </span>
                  </div>
                </div>

                {/* Right Drum Meter */}
                <div className="rounded-xl border-2 border-red-600/40 bg-red-50 p-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-black text-red-950">Right Treble Force:</span>
                    <span className="font-mono font-black text-red-800">
                      {Math.round(rightMotionLevel * 100)}%
                    </span>
                  </div>
                  {/* Gauge Bar */}
                  <div className="relative h-3 w-full rounded-full border border-black/40 bg-red-200/50 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-75 ${
                        rightMotionLevel >= strikeThreshold ? "bg-emerald-500" : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, Math.round(rightMotionLevel * 100))}%` }}
                    />
                    {/* Threshold Line at 60% */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-black z-10"
                      style={{ left: `${Math.round(strikeThreshold * 100)}%` }}
                      title={`Strike Line: ${Math.round(strikeThreshold * 100)}%`}
                    />
                  </div>
                  {/* Status Tag */}
                  <div className="text-[10px] font-black flex items-center justify-between pt-0.5">
                    <span>State:</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                        rightDrumVisualState === "ARMED"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-500"
                          : rightDrumVisualState === "COOLDOWN"
                          ? "bg-red-300 text-black border border-black font-black"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {rightDrumVisualState === "ARMED"
                        ? "Ready (Strike)"
                        : rightDrumVisualState === "COOLDOWN"
                        ? "Hit! Relaxing"
                        : "Lift Hand Up"}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] font-medium text-ink-secondary text-center pt-0.5 flex items-center justify-center gap-1.5">
                <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span><strong>How to play:</strong> Wave your hand downward into either drum zone. Once you strike, lift your hand back up to play the next beat.</span>
              </p>
            </div>
          )}

          {/* DUAL DRUM HEAD HIT PADS (Touch / Mouse / Air Support) */}
          <div className="w-full max-w-md grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleDrumHit("left")}
              className={`btn-tactile flex flex-col items-center justify-center gap-1.5 rounded-2xl border-3 border-black p-4 shadow-[4px_4px_0px_#000] active:translate-y-1 cursor-pointer transition-all ${
                currentTargetSide === "left"
                  ? "bg-amber-200 ring-4 ring-amber-400 animate-pulse"
                  : "bg-amber-100 hover:bg-amber-200"
              }`}
            >
              <span className="text-sm font-black text-amber-950">LEFT DRUM HEAD</span>
              <span className="text-[10px] font-bold text-amber-800 uppercase">Bass Dhum (Dhaa)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDrumHit("right")}
              className={`btn-tactile flex flex-col items-center justify-center gap-1.5 rounded-2xl border-3 border-black p-4 shadow-[4px_4px_0px_#000] active:translate-y-1 cursor-pointer transition-all ${
                currentTargetSide === "right"
                  ? "bg-red-200 ring-4 ring-red-400 animate-pulse"
                  : "bg-red-100 hover:bg-red-200"
              }`}
            >
              <span className="text-sm font-black text-red-950">RIGHT DRUM HEAD</span>
              <span className="text-[10px] font-bold text-red-800 uppercase">Treble Snare (Taak)</span>
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
