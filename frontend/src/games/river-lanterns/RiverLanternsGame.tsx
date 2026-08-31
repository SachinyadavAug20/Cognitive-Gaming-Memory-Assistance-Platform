"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Sparkles,
  Camera,
  RotateCcw,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Music,
  Waves,
  Volume2,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playLifeSong } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { OpticalMotionTracker, type MotionEvent } from "@/lib/vision";
import { RiverScene3D, type RiverTarget } from "./RiverScene3D";

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
      <GameHeader title={title} score={score} backHref="/patient/games" bgColor="bg-teal-800" />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

const FALLBACK_TARGETS: RiverTarget[] = [
  {
    id: "f1",
    name: "Manash Borah",
    relationOrType: "Son",
    photoUrl: "/photos/manash.png",
    notes: "Your loving eldest son who takes you for evening tea walks in Guwahati.",
  },
  {
    id: "f2",
    name: "Anita Borah",
    relationOrType: "Wife",
    photoUrl: "/photos/anita.png",
    notes: "Your devoted life companion who loves preparing fresh Pitha and morning cardamom tea.",
  },
  {
    id: "f3",
    name: "Guwahati Ancestral Home",
    relationOrType: "Home",
    photoUrl: "/photos/home.png",
    notes: "Your peaceful garden home near the banks of the mighty Brahmaputra river.",
  },
];

export function RiverLanternsGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "river-lanterns", startLevel(detail));
  const rate = speechRate(detail);

  const targets: RiverTarget[] = useMemo(() => {
    if (!detail) return FALLBACK_TARGETS;
    const list: RiverTarget[] = [];
    if (detail.familyMembers && detail.familyMembers.length > 0) {
      detail.familyMembers.forEach((m, idx) => {
        list.push({
          id: `fam-${m.id || idx}`,
          name: m.name,
          relationOrType: m.relation || "Family",
          photoUrl: m.photoUrl || (idx % 2 === 0 ? "/photos/manash.png" : "/photos/anita.png"),
          notes: m.notes || "A cherished member of your family.",
        });
      });
    }
    if (detail.familiarPlaces && detail.familiarPlaces.length > 0) {
      detail.familiarPlaces.forEach((p, idx) => {
        list.push({
          id: `place-${p.id || idx}`,
          name: p.name,
          relationOrType: "Place",
          photoUrl: p.photoUrl || "/photos/home.png",
          notes: p.description || "A peaceful place filled with warm memories.",
        });
      });
    }
    return list.length >= 2 ? list.slice(0, 4) : FALLBACK_TARGETS;
  }, [detail]);

  const [phase, setPhase] = useState<"intro" | "river" | "done">("intro");
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [unlockedLanterns, setUnlockedLanterns] = useState<RiverTarget[]>([]);
  const [activeRevealedTarget, setActiveRevealedTarget] = useState<RiverTarget | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [motionCoords, setMotionCoords] = useState<{ x: number; y: number } | null>(null);
  const [motionDetected, setMotionDetected] = useState(false);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const currentTarget = targets[currentTargetIndex] || targets[0];
  const score = unlockedLanterns.length * 35;

  // Initialize Optical Motion Tracker
  useEffect(() => {
    let tracker: OpticalMotionTracker | null = null;

    if (cameraActive && phase === "river") {
      tracker = new OpticalMotionTracker((evt: MotionEvent) => {
        if (evt.hasMotion) {
          setMotionCoords({ x: evt.x, y: evt.y });
          setMotionDetected(true);
          setTimeout(() => setMotionDetected(false), 300);
        }
      });
      tracker.start().then((started) => {
        if (!started) setCameraActive(false);
      });
    }

    return () => {
      if (tracker) tracker.stop();
    };
  }, [cameraActive, phase]);

  const startRiverGame = useCallback(() => {
    playPress();
    setPhase("river");
    setCurrentTargetIndex(0);
    setUnlockedLanterns([]);
    setActiveRevealedTarget(null);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
  }, []);

  const handleSelectLantern = (target: RiverTarget) => {
    setTaps((t) => t + 1);
    stopSpeaking();
    playCorrect();

    setActiveRevealedTarget(target);
    if (!unlockedLanterns.some((l) => l.id === target.id)) {
      setUnlockedLanterns((prev) => [...prev, target]);
    }
    speak(`You caught ${target.name}'s lantern! ${target.notes}`, locale, rate);
  };

  const advanceNextTarget = () => {
    playPress();
    setActiveRevealedTarget(null);

    if (currentTargetIndex + 1 < targets.length) {
      const nextIdx = currentTargetIndex + 1;
      setCurrentTargetIndex(nextIdx);
      speak(`Now guide the river ripples toward ${targets[nextIdx].name}'s lantern.`, locale, rate);
    } else {
      playComplete();
      setPhase("done");
      if (startedAt) {
        recordGameSession(patientId, {
          gameId: "river-lanterns",
          level,
          outcome: "completed",
          score: 100,
          startedAt,
          taps: taps + 1,
          errorCount: 0,
        });
      }
    }
  };

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "river-lanterns",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  if (loading)
    return (
      <GameShell title="3D Living River of Memories" score={0}>
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title="3D Living River of Memories" score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title="The 3D Living River of Memories" score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          {/* Government Paperclip Header */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                3D WebGL & Optical Vision // Module CDTx-15
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-teal-700" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-teal-800 text-white shadow-[4px_4px_0px_#000]">
            <Waves className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              The 3D Living River of Memories
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              Step beside the sunlit Brahmaputra waters. Watch floating 3D brass lanterns carrying your family memories, and wave your hand to send ripples across the river.
            </p>
          </div>

          {/* Technology Highlights */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 block mb-2">
              Therapeutic Features:
            </span>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-700" />
                <span>3D WebGL dynamic water ripples & floating brass lanterns</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-marigold" />
                <span>Client-side optical camera motion tracking (No video saved)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-700" />
                <span>Encourages gentle upper-body range of motion & visual depth focus</span>
              </div>
            </div>
          </div>

          <AudioPrompt
            text="Welcome to the Living River. Wave your hand or touch the screen to guide the memory lanterns."
            label="Listen to Instructions"
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startRiverGame}>
            Begin 3D River Journey
          </ChunkyButton>
        </div>
      ) : phase === "river" ? (
        <div className="flex flex-col items-center gap-3.5 py-1">
          {/* CAMERA & STAGE STATUS BAR */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <button
              type="button"
              onClick={() => setCameraActive(!cameraActive)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black border-2 border-black transition-all cursor-pointer ${
                cameraActive
                  ? "bg-teal-700 text-white shadow-sm"
                  : "bg-surface text-ink hover:bg-surface-muted"
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>{cameraActive ? "Camera Vision: ON" : "Enable Camera Vision"}</span>
            </button>

            <span className="text-xs font-black text-ink">
              Lantern {currentTargetIndex + 1} of {targets.length}
            </span>
          </div>

          {/* MOTION DETECTED FLASH BADGE */}
          {cameraActive && (
            <div className="w-full max-w-md flex items-center justify-between text-[11px] font-bold text-ink-secondary px-1">
              <span>Wave hands to cast ripples</span>
              <span className={`px-2 py-0.5 rounded border transition-colors ${motionDetected ? "bg-teal-100 text-teal-800 border-teal-500 font-black" : "text-ink-secondary border-transparent"}`}>
                {motionDetected ? "🌊 Hand Motion Detected" : "Watching for gestures..."}
              </span>
            </div>
          )}

          {/* THREE.JS 3D RIVER CANVAS */}
          <RiverScene3D
            targets={targets}
            activeTargetIndex={currentTargetIndex}
            motionCoords={motionCoords}
            onSelectTarget={handleSelectLantern}
          />

          {/* INSTRUCTION PROMPT BAR */}
          <div className="w-full max-w-md rounded-xl border-2 border-black bg-[#FAF5EE] px-4 py-2.5 shadow-[2px_2px_0px_#000] flex items-center justify-between text-left">
            <div>
              <span className="text-[10px] font-black uppercase text-teal-800 block">
                Target Lantern:
              </span>
              <span className="text-sm font-black text-ink">{currentTarget.name}</span>
            </div>
            <button
              type="button"
              onClick={() =>
                speak(
                  `Wave your hand or touch the water to reach ${currentTarget.name}'s lantern.`,
                  locale,
                  rate
                )
              }
              className="flex items-center gap-1.5 rounded-lg border border-black bg-white px-2.5 py-1 text-xs font-bold text-ink hover:bg-surface-muted cursor-pointer"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Listen</span>
            </button>
          </div>

          {/* REVEALED LANTERN MEMORY CAPSULE MODAL */}
          {activeRevealedTarget && (
            <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 shadow-[5px_5px_0px_#000] text-left animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-2 mb-3">
                <span className="text-xs font-black uppercase text-teal-800 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" /> Lantern Memory Unlocked
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-teal-100 text-teal-800 px-2 py-0.5 border border-teal-300">
                  {activeRevealedTarget.relationOrType}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeRevealedTarget.photoUrl}
                  alt={activeRevealedTarget.name}
                  className="h-16 w-16 rounded-xl border-2 border-black object-cover shadow-sm shrink-0"
                />
                <div>
                  <h3 className="font-serif text-lg font-black text-ink leading-tight">
                    {activeRevealedTarget.name}
                  </h3>
                  <p className="text-xs font-semibold text-ink-secondary mt-1 line-clamp-2">
                    {activeRevealedTarget.notes}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-2 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => speak(activeRevealedTarget.notes, locale, rate)}
                  className="flex items-center gap-1.5 text-xs font-bold text-teal-800 hover:underline cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5" /> Hear Memory Story
                </button>
                <ChunkyButton variant="tea" size="xl" onClick={advanceNextTarget}>
                  Next Lantern →
                </ChunkyButton>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title="River of Memories Complete!"
          subtitle="You guided all floating memory lanterns across the living river with visual depth tracking and motor coordination."
          xpEarned={120}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> 3D Lantern Archive
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-teal-800 text-white px-2 py-0.5">
                  {unlockedLanterns.length} Unlocked
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                All Memory Lanterns Gathered
              </h3>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-black/10 pt-2.5">
                {unlockedLanterns.map((l, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl border border-black/20 bg-white p-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.photoUrl} alt={l.name} className="h-8 w-8 rounded-lg object-cover border border-black" />
                    <span className="text-xs font-black truncate">{l.name}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-xs font-black">Play Folk Flute</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  Assessment Complete
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startRiverGame}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> Revisit 3D River
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
