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
  Wand2,
  Gauge,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete } from "@/lib/sound";
import { ensureAudioContext, getVolume, isEnabled } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { OpticalMotionTracker, drawCroppedCameraFeed, type MotionEvent } from "@/lib/vision";
import { getGameStrings } from "@/lib/gameI18n";

type DrumState = "ARMED" | "COOLDOWN" | "WAITING_LIFT";

const TARGET_HITS = 16;
const BPM = 92;
const SIXTEENTH_SEC = 60 / BPM / 4;

/** Pentatonic ladder for the auto-tune melodic layer (C major pentatonic). */
const PENTATONIC = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99];

// ---------------------------------------------------------------------------
// Tiny "look-ahead" Web Audio scheduler that runs a fixed grid. Player strikes
// are queued and quantized (snapped) onto this grid so every note lands on a
// beat — the auto-tuner that makes off-timed playing still sound musical.
// ---------------------------------------------------------------------------
class TunedDrumEngine {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private running = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextNoteTime = 0; // seconds on the ctx clock
  private step = 0;
  private strikes: number[] = []; // steps scheduled for a player strike
  private readonly lookahead = 0.12;
  private readonly scheduleAhead = 0.1;
  onDiagnostics?: (d: { step: number; nextInMs: number; quantInMs: number }) => void;

  start() {
    const ctx = ensureAudioContext();
    if (!ctx || this.running) return;
    this.ctx = ctx;
    this.out = ctx.createGain();
    this.out.gain.value = 0.5;
    this.out.connect(ctx.destination);
    this.nextNoteTime = ctx.currentTime + 0.06;
    this.step = 0;
    this.strikes = [];
    this.running = true;
    this.timer = setInterval(() => this.tick(), 25);
  }

  stop() {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /** Queue a strike to be auto-tuned onto the upcoming grid slot. */
  strike() {
    if (!this.running || !this.ctx) return;
    // Snap to the next (or current) 16th-note slot on or after now.
    const now = this.ctx.currentTime;
    const ahead = Math.max(0, this.nextNoteTime - now);
    const slotIndex = this.step + Math.ceil(ahead / SIXTEENTH_SEC);
    this.strikes.push(slotIndex);
  }

  private getVolume() {
    const enabled = typeof isEnabled === "function" ? isEnabled() : true;
    const vol = typeof getVolume === "function" ? getVolume() : 0.8;
    return enabled ? Math.max(0.05, vol) : 0;
  }

  private playDhol(freq: number, at: number, gain: number, dur: number) {
    if (!this.ctx || !this.out) return;
    try {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, at);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.28, at + dur);
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(gain, at + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      osc.connect(g);
      g.connect(this.out);
      osc.start(at);
      osc.stop(at + dur + 0.02);
    } catch {
      // Ignore node errors
    }
  }

  private playMelody(freq: number, at: number, gain = 0.12, dur = 0.3) {
    if (!this.ctx || !this.out) return;
    try {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(gain, at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      osc.connect(g);
      g.connect(this.out);
      osc.start(at);
      osc.stop(at + dur + 0.02);
    } catch {
      // Ignore node errors
    }
  }

  private tick() {
    if (!this.ctx || !this.out || !this.running) return;
    const vol = this.getVolume();
    this.out.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);

    while (this.nextNoteTime < this.ctx.currentTime + this.lookahead) {
      const at = this.nextNoteTime;
      const s = this.step;
      const isBeat = s % 4 === 0; // quarter-note downbeat
      const isHalf = s % 8 === 0; // backbeat/section

      // Backing folk grid: soft tick on every beat, bass accent on downbeats.
      if (isBeat && !this.playCentralTick(at, s)) {
        // central tick handled below
      }
      if (s % 2 === 0) {
        this.playDhol(isHalf ? 96 : 72, at, isHalf ? 0.28 : 0.2, 0.3);
      }

      // Player strikes quantized onto this slot.
      const idx = this.strikes.indexOf(s);
      if (idx !== -1) {
        const note = PENTATONIC[(s / 2) % PENTATONIC.length];
        const leftSide = (Math.floor(s / 2) % 2) === 0;
        this.playDhol(leftSide ? 148 : 220, at, 0.5, 0.34);
        this.playMelody(note, at, 0.16);
        this.strikes.splice(idx, 1);
      }

      this.nextNoteTime += SIXTEENTH_SEC;
      this.step++;
    }

    if (this.onDiagnostics && this.ctx) {
      const now = this.ctx.currentTime;
      this.onDiagnostics({
        step: this.step,
        nextInMs: Math.round(Math.max(0, this.nextNoteTime - now) * 1000),
        quantInMs: this.strikes.length > 0 ? Math.round(SIXTEENTH_SEC * 1000) : 0,
      });
    }
  }

  private playCentralTick(at: number, s: number): boolean {
    if (!this.ctx || !this.out) return false;
    try {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const isDown = s % 4 === 0;
      osc.type = "square";
      // Keep it subtle so the player's tuned drums are the hero.
      osc.frequency.value = isDown ? 1600 : 1200;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(isDown ? 0.04 : 0.025, at + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.03);
      osc.connect(g);
      g.connect(this.out);
      osc.start(at);
      osc.stop(at + 0.035);
      return true;
    } catch {
      return false;
    }
  }
}

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
        bgColor="bg-indigo-700"
        gameId="tuned-drum"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

export function TunedDrumGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "tuned-drum", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [hitsCount, setHitsCount] = useState(0);
  const [lastHitSide, setLastHitSide] = useState<"left" | "right" | null>(null);
  const [leftHits, setLeftHits] = useState(0);
  const [rightHits, setRightHits] = useState(0);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const [isVisionActive, setIsVisionActive] = useState(false);
  const [leftMotionLevel, setLeftMotionLevel] = useState(0);
  const [rightMotionLevel, setRightMotionLevel] = useState(0);
  const [leftDrumVisualState, setLeftDrumVisualState] = useState<DrumState>("ARMED");
  const [rightDrumVisualState, setRightDrumVisualState] = useState<DrumState>("ARMED");
  const [showVisionSettings, setShowVisionSettings] = useState(false);
  const [autoTuneOn, setAutoTuneOn] = useState(true);
  const [gridStep, setGridStep] = useState(0);
  const [quantizedMs, setQuantizedMs] = useState(0);

  const [strikeThreshold, setStrikeThreshold] = useState(0.6);
  const [strikePaceMs, setStrikePaceMs] = useState(600);

  const engineRef = useRef<TunedDrumEngine | null>(null);
  const trackerRef = useRef<OpticalMotionTracker | null>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDiagnosticsRef = useRef<{ step: number; quantInMs: number }>({ step: 0, quantInMs: 0 });

  const leftDrumStateRef = useRef<DrumState>("ARMED");
  const rightDrumStateRef = useRef<DrumState>("ARMED");
  const lastStrikeTimeRef = useRef<{ left: number; right: number }>({ left: 0, right: 0 });

  const score = Math.round((hitsCount / TARGET_HITS) * 100);

  const handleDrumHit = useCallback(
    (side: "left" | "right") => {
      setHitsCount((prevHits) => {
        if (prevHits >= TARGET_HITS) return prevHits;

        setTaps((t) => t + 1);
        setLastHitSide(side);
        if (side === "left") setLeftHits((l) => l + 1);
        else setRightHits((r) => r + 1);

        // Auto-tuner: snap the strike onto the upcoming grid slot so it always
        // lands cleanly on a beat. Read the last known grid offset for realism.
        const q = lastDiagnosticsRef.current;
        setQuantizedMs(q.quantInMs || Math.round(SIXTEENTH_SEC * 1000));
        if (autoTuneOn && engineRef.current) {
          engineRef.current.strike();
        } else {
          playPress();
        }

        const nextHits = prevHits + 1;
        if (nextHits === TARGET_HITS) {
          setTimeout(() => {
            playComplete();
            setPhase("done");
            if (startedAt) {
              recordGameSession(patientId, {
                gameId: "tuned-drum",
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
          if (nextHits % 4 === 0) {
            playCorrect();
          }
        }
        return nextHits;
      });
    },
    [TARGET_HITS, autoTuneOn, level, patientId, startedAt, taps]
  );

  const handleMotionEvent = useCallback(
    (evt: MotionEvent) => {
      const leftVal = evt.drumLeftEnergy !== undefined ? evt.drumLeftEnergy : evt.leftEnergy;
      const rightVal = evt.drumRightEnergy !== undefined ? evt.drumRightEnergy : evt.rightEnergy;

      setLeftMotionLevel(leftVal);
      setRightMotionLevel(rightVal);

      const now = Date.now();
      const RESET_ENERGY_THRESHOLD = 0.32;

      const leftElapsed = now - lastStrikeTimeRef.current.left;
      let nextLeftState = leftDrumStateRef.current;
      if (leftDrumStateRef.current === "COOLDOWN") {
        if (leftElapsed >= strikePaceMs) nextLeftState = leftVal < RESET_ENERGY_THRESHOLD ? "ARMED" : "WAITING_LIFT";
      } else if (leftDrumStateRef.current === "WAITING_LIFT") {
        if (leftVal < RESET_ENERGY_THRESHOLD) nextLeftState = "ARMED";
      } else if (leftDrumStateRef.current === "ARMED") {
        if (leftVal >= strikeThreshold && leftElapsed >= strikePaceMs) {
          nextLeftState = "COOLDOWN";
          lastStrikeTimeRef.current.left = now;
          handleDrumHit("left");
        }
      }
      leftDrumStateRef.current = nextLeftState;
      setLeftDrumVisualState(nextLeftState);

      const rightElapsed = now - lastStrikeTimeRef.current.right;
      let nextRightState = rightDrumStateRef.current;
      if (rightDrumStateRef.current === "COOLDOWN") {
        if (rightElapsed >= strikePaceMs) nextRightState = rightVal < RESET_ENERGY_THRESHOLD ? "ARMED" : "WAITING_LIFT";
      } else if (rightDrumStateRef.current === "WAITING_LIFT") {
        if (rightVal < RESET_ENERGY_THRESHOLD) nextRightState = "ARMED";
      } else if (rightDrumStateRef.current === "ARMED") {
        if (rightVal >= strikeThreshold && rightElapsed >= strikePaceMs) {
          nextRightState = "COOLDOWN";
          lastStrikeTimeRef.current.right = now;
          handleDrumHit("right");
        }
      }
      rightDrumStateRef.current = nextRightState;
      setRightDrumVisualState(nextRightState);

      if (pipCanvasRef.current) {
        const canvas = pipCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const videoEl = trackerRef.current?.getVideoElement();
          if (videoEl && videoEl.readyState >= 2) {
            drawCroppedCameraFeed(ctx, videoEl, canvas.width, canvas.height);
          } else {
            ctx.fillStyle = "#1e1b18";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          const w = canvas.width;
          const h = canvas.height;

          ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(w * 0.28, h * 0.04, w * 0.44, h * 0.38);
          ctx.fillStyle = "rgba(148, 163, 184, 0.75)";
          ctx.font = "bold 9px sans-serif";
          ctx.fillText("FACE ZONE (IGNORED)", w * 0.33, h * 0.12);

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
          "Auto-tuned air drumming activated. Move your left or right hand down to strike the drum. The tuner keeps you on the beat.",
          locale,
          rate
        );
      } else {
        setIsVisionActive(false);
      }
    }
  };

  const startGame = useCallback(() => {
    playPress();
    ensureAudioContext();
    if (!engineRef.current) {
      const engine = new TunedDrumEngine();
      engine.onDiagnostics = (d) => {
        lastDiagnosticsRef.current = { step: d.step, quantInMs: d.quantInMs };
        setGridStep(d.step);
      };
      engineRef.current = engine;
    }
    engineRef.current.start();
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

  useEffect(() => {
    return () => {
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
  }, []);

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "tuned-drum",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const str = getGameStrings("tuned-drum", locale);
  const beatPos = gridStep % 4;
  const tuneWidth = autoTuneOn ? quantizedMs : 0;

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
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                Auto-Tuned Rhythmic Entrainment // Module CDTx-19
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-indigo-700" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-indigo-700 text-white shadow-[4px_4px_0px_#000]">
            <Music className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">{str.introTitle}</h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {str.introSubtitle}
            </p>
          </div>

          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-700 block mb-2">
              Clinical Benefits:
            </span>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-indigo-600" />
                <span>OpenCV left/right hand drum-strike tracking with face-motion filtering</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-violet-600" />
                <span>Auto-tuned beat grid — off-timed hits snap onto the beat so output always sounds musical</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-fuchsia-600" />
                <span>Reduced performance anxiety &amp; frustration while training motor timing</span>
              </div>
            </div>
          </div>

          <AudioPrompt text={str.audioPrompt} label={str.listenLabel} size="md" />

          <ChunkyButton variant="tea" size="xl" onClick={startGame}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "play" ? (
        <div className="flex flex-col items-center gap-3 py-1">
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <Activity className="h-4 w-4" /> {str.hudProgress}: {hitsCount} / {TARGET_HITS}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-ink-secondary bg-surface-muted px-1.5 py-0.5 rounded border border-black/20">
                L: {leftHits} &bull; R: {rightHits}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
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

              <button
                type="button"
                onClick={toggleVisionMode}
                className={`btn-tactile inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-black text-xs font-black shadow-xs transition-all cursor-pointer ${
                  isVisionActive ? "bg-indigo-700 text-white animate-pulse" : "bg-surface-muted text-ink hover:bg-surface"
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>{isVisionActive ? "Air Camera: ON" : "Enable Air Camera"}</span>
              </button>
            </div>
          </div>

          {showVisionSettings && (
            <div className="w-full max-w-md rounded-2xl border-2 border-black bg-amber-50 p-3.5 shadow-[2px_2px_0px_#000] text-xs space-y-2.5 animate-fade-in">
              <div className="flex items-center justify-between font-black text-amber-950">
                <span className="flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-indigo-700" />
                  Air-Drum Strike Calibration
                </span>
                <span className="text-[10px] text-amber-800">Face Filter: Active</span>
              </div>
              <div>
                <div className="flex justify-between text-[11px] font-bold text-ink-secondary mb-1">
                  <span>Strike Force Threshold (%):</span>
                  <span className="font-black text-ink">{Math.round(strikeThreshold * 100)}%</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { label: "Gentle (50%)", val: 0.5 },
                    { label: "Optimal (60%)", val: 0.6 },
                    { label: "Firm (72%)", val: 0.72 },
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setStrikeThreshold(p.val)}
                      className={`py-1 rounded-lg border text-[11px] font-black cursor-pointer transition-all ${
                        strikeThreshold === p.val ? "bg-indigo-700 text-white border-black shadow-xs" : "bg-white text-ink border-black/30 hover:border-black"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
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
                  ].map((p) => (
                    <button
                      key={p.val}
                      type="button"
                      onClick={() => setStrikePaceMs(p.val)}
                      className={`py-1 rounded-lg border text-[11px] font-black cursor-pointer transition-all ${
                        strikePaceMs === p.val ? "bg-tea text-white border-black shadow-xs" : "bg-white text-ink border-black/30 hover:border-black"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AUTO-TUNER STATUS + BEAT GRID */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-[#FAF5EE] p-3 shadow-[3px_3px_0px_#000] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-black uppercase">
              <span className="flex items-center gap-1.5 text-indigo-900">
                <Wand2 className="h-3.5 w-3.5 text-indigo-600" />
                Auto-Tuner: {autoTuneOn ? "ON" : "OFF"}
              </span>
              <button
                type="button"
                onClick={() => {
                  playPress();
                  setAutoTuneOn((v) => !v);
                }}
                className={`px-2 py-0.5 rounded-lg border-2 border-black text-[10px] font-black cursor-pointer transition-all ${
                  autoTuneOn ? "bg-emerald-500 text-white" : "bg-surface text-ink"
                }`}
                title="Toggle rhythm snap-to-grid auto-tuning"
              >
                {autoTuneOn ? "Tuned" : "Raw"}
              </button>
            </div>

            {/* 4-beat measure rail; current beat pulses */}
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((b) => (
                <div
                  key={b}
                  className={`h-2.5 rounded-full border border-black transition-all ${
                    beatPos === b ? "bg-indigo-600 scale-110 shadow-xs" : "bg-black/15"
                  }`}
                />
              ))}
            </div>

            {/* Quantize meter: shows how much the tuner corrected your last strike */}
            <div className="flex items-center justify-between text-[10px] font-bold text-ink-secondary gap-2">
              <span className="flex items-center gap-1 shrink-0">
                <Gauge className="h-3 w-3 text-tea" /> Snap-to-grid: {quantizedMs}ms
              </span>
              <span className="text-right leading-tight">
                {autoTuneOn ? (
                  <span className="text-emerald-700">Auto-corrects timing &mdash; always on the beat</span>
                ) : (
                  <span className="text-amber-700">Living dangerously &mdash; raw timing</span>
                )}
              </span>
            </div>
          </div>

          {/* CONDUCTOR CUE */}
          <div className="flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-1.5 text-xs sm:text-sm font-black text-white shadow-xs animate-pulse ${
            (Math.floor(gridStep / 2) % 2) === 0 ? "bg-orange-500 border-orange-700" : "bg-red-500 border-red-700"
          }">
            {(Math.floor(gridStep / 2) % 2) === 0 ? (
              <>
                <ArrowLeft className="h-4 w-4 stroke-[3]" />
                <span>HIT LEFT! (Bass)</span>
              </>
            ) : (
              <>
                <span>HIT RIGHT! (Treble)</span>
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </>
            )}
          </div>

          {/* LIVE PIP CAMERA FEED */}
          {isVisionActive && (
            <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-3 shadow-[4px_4px_0px_#000] space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-black text-ink">
                <span className="flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-indigo-700" />
                  Live Camera Guide &amp; Force Meters
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-tea bg-tea-light px-2 py-0.5 rounded border border-tea/30">
                  <UserCheck className="h-3 w-3" /> Face Protected
                </span>
              </div>
              <div className="relative w-full aspect-16/9 rounded-xl border-2 border-black overflow-hidden bg-black shadow-inner">
                <canvas ref={pipCanvasRef} width={320} height={180} className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
                <div className="rounded-xl border-2 border-orange-600/40 bg-orange-50 p-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-black text-orange-950">Left Bass:</span>
                    <span className="font-mono font-black text-orange-800">{Math.round(leftMotionLevel * 100)}%</span>
                  </div>
                  <div className="relative h-3 w-full rounded-full border border-black/40 bg-orange-200/50 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-75 ${leftMotionLevel >= strikeThreshold ? "bg-emerald-500" : "bg-orange-500"}`}
                      style={{ width: `${Math.min(100, Math.round(leftMotionLevel * 100))}%` }}
                    />
                    <div className="absolute top-0 bottom-0 w-0.5 bg-black z-10" style={{ left: `${Math.round(strikeThreshold * 100)}%` }} />
                  </div>
                  <div className="text-[10px] font-black flex items-center justify-between pt-0.5">
                    <span>State:</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                        leftDrumVisualState === "ARMED"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-500"
                          : leftDrumVisualState === "COOLDOWN"
                          ? "bg-orange-300 text-black border border-black font-black"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {leftDrumVisualState === "ARMED" ? "Ready" : leftDrumVisualState === "COOLDOWN" ? "Hit!" : "Lift"}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border-2 border-red-600/40 bg-red-50 p-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-black text-red-950">Right Treble:</span>
                    <span className="font-mono font-black text-red-800">{Math.round(rightMotionLevel * 100)}%</span>
                  </div>
                  <div className="relative h-3 w-full rounded-full border border-black/40 bg-red-200/50 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-75 ${rightMotionLevel >= strikeThreshold ? "bg-emerald-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min(100, Math.round(rightMotionLevel * 100))}%` }}
                    />
                    <div className="absolute top-0 bottom-0 w-0.5 bg-black z-10" style={{ left: `${Math.round(strikeThreshold * 100)}%` }} />
                  </div>
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
                      {rightDrumVisualState === "ARMED" ? "Ready" : rightDrumVisualState === "COOLDOWN" ? "Hit!" : "Lift"}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-[11px] font-medium text-ink-secondary text-center flex items-center justify-center gap-1.5">
                <Wand2 className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
                <span>
                  <strong>OpenCV drums:</strong> wave your hand down into a zone. The auto-tuner snaps each hit to the beat.
                </span>
              </p>
            </div>
          )}

          {/* DUAL DRUM HIT PADS */}
          <div className="w-full max-w-md grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => handleDrumHit("left")}
              className={`btn-tactile flex flex-col items-center justify-center gap-1.5 rounded-2xl border-3 border-black p-4 shadow-[4px_4px_0px_#000] active:translate-y-1 cursor-pointer transition-all ${
                (Math.floor(gridStep / 2) % 2) === 0 ? "bg-orange-200 ring-4 ring-orange-400 animate-pulse" : "bg-orange-100 hover:bg-orange-200"
              }`}
            >
              <span className="text-sm font-black text-orange-950">LEFT DRUM</span>
              <span className="text-[10px] font-bold text-orange-800 uppercase">Bass (Tuned)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDrumHit("right")}
              className={`btn-tactile flex flex-col items-center justify-center gap-1.5 rounded-2xl border-3 border-black p-4 shadow-[4px_4px_0px_#000] active:translate-y-1 cursor-pointer transition-all ${
                (Math.floor(gridStep / 2) % 2) === 1 ? "bg-red-200 ring-4 ring-red-400 animate-pulse" : "bg-red-100 hover:bg-red-200"
              }`}
            >
              <span className="text-sm font-black text-red-950">RIGHT DRUM</span>
              <span className="text-[10px] font-bold text-red-800 uppercase">Treble (Tuned)</span>
            </button>
          </div>
        </div>
      ) : (
        <Celebration title={str.celebrationTitle} subtitle={str.celebrationSubtitle} xpEarned={100} accuracy="100%">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto text-center pt-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={startGame}
                className="btn-tactile rounded-xl border-2 border-black bg-indigo-700 px-5 py-2.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] cursor-pointer"
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
