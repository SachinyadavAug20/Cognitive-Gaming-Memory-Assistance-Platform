"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
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
  Hand,
  ArrowRight,
  Heart,
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
        bgColor="bg-teal-800"
        gameId="river-lanterns"
      />
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
    return list.length >= 2 ? list.slice(0, 3) : FALLBACK_TARGETS;
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

  // Optical Motion Tracker
  useEffect(() => {
    let tracker: OpticalMotionTracker | null = null;

    if (cameraActive && phase === "river") {
      tracker = new OpticalMotionTracker((evt: MotionEvent) => {
        // 1:1 viewport reach across all corners
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
    speak(
      `Welcome to the Brahmaputra River. Touch the glowing golden lantern floating near the shore to bring back your memories with ${targets[0]?.name || "your family"}.`,
      locale,
      rate
    );
  }, [locale, rate, targets]);

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
      speak(`Wonderful! Now touch the glowing lantern for ${targets[nextIdx].name}.`, locale, rate);
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

  const str = getGameStrings("river-lanterns", locale);

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
                3D Optical Reminiscence // Module CDTx-19
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-teal-800" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-teal-800 text-white shadow-[4px_4px_0px_#000]">
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

          {/* Simple 3-Step Guide */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000] space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 block">
              How to Play (Very Easy):
            </span>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-800 text-white font-black text-xs shrink-0">1</span>
              <span>Watch the glowing golden lanterns float gently along the Brahmaputra river.</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-800 text-white font-black text-xs shrink-0">2</span>
              <span>Tap the water, tap the floating lantern, or press the big button below.</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-800 text-white font-black text-xs shrink-0">3</span>
              <span>Reconnect with warm family photos and hear peaceful memories.</span>
            </div>
          </div>

          <AudioPrompt
            text={str.audioPrompt}
            label={str.listenLabel}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startRiverGame}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "river" ? (
        <div className="flex flex-col items-center gap-4 py-1">
          {/* STEP PROGRESS BREADCRUMB */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-3 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between text-xs font-black mb-2">
              <span className="text-teal-800 uppercase tracking-wider">
                Progress: Lantern {currentTargetIndex + 1} of {targets.length}
              </span>
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-teal-900 border border-teal-400 text-[10px]">
                {unlockedLanterns.length}/{targets.length} Illuminated
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {targets.map((tgt, idx) => {
                const isCompleted = unlockedLanterns.some((l) => l.id === tgt.id);
                const isCurrent = idx === currentTargetIndex;
                return (
                  <button
                    key={tgt.id}
                    type="button"
                    onClick={() => {
                      setCurrentTargetIndex(idx);
                      handleSelectLantern(tgt);
                    }}
                    className={`flex items-center gap-1.5 p-1.5 rounded-xl border-2 text-[11px] font-black cursor-pointer transition-all ${
                      isCompleted
                        ? "bg-emerald-100 border-emerald-600 text-emerald-950"
                        : isCurrent
                        ? "bg-amber-100 border-amber-600 text-amber-950 shadow-sm animate-pulse"
                        : "bg-surface-muted border-black/20 text-ink-muted"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                    ) : (
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black/10 text-[9px]">
                        {idx + 1}
                      </span>
                    )}
                    <span className="truncate">{tgt.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* THREE.JS 3D RIVER CANVAS WITH PULSING BEACON */}
          <div className="w-full max-w-md relative">
            <RiverScene3D
              targets={targets}
              activeTargetIndex={currentTargetIndex}
              motionCoords={motionCoords}
              onSelectTarget={handleSelectLantern}
            />

            {/* FLOATING HINT BADGE OVER RIVER */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="rounded-xl border-2 border-black bg-white/90 backdrop-blur px-3 py-1 text-xs font-black text-ink shadow-[2px_2px_0px_#000] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                Target: {currentTarget.name} ({currentTarget.relationOrType})
              </span>

              {cameraActive && (
                <span className={`rounded-xl border-2 border-black px-2.5 py-1 text-[10px] font-black shadow-[2px_2px_0px_#000] ${motionDetected ? "bg-teal-300 text-teal-950" : "bg-white/90 text-ink"}`}>
                  {motionDetected ? (
                    <span className="inline-flex items-center gap-1">
                      <Waves className="h-3 w-3 text-teal-950" />
                      <span>Ripple Cast</span>
                    </span>
                  ) : (
                    "Vision Active"
                  )}
                </span>
              )}
            </div>
          </div>

          {/* GIANT HIGH-CONTRAST TACTILE CATCH BUTTON */}
          <div className="w-full max-w-md space-y-2.5">
            <button
              type="button"
              onClick={() => handleSelectLantern(currentTarget)}
              className="btn-tactile w-full flex items-center justify-center gap-3 rounded-2xl border-4 border-black bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 p-4 text-ink shadow-[6px_6px_0px_#000] hover:scale-[1.02] active:translate-y-1 transition-all cursor-pointer select-none"
            >
              <Hand className="h-6 w-6 text-amber-900 shrink-0" />
              <div className="text-left">
                <span className="text-xs font-black uppercase text-amber-950 block">
                  Tap to Catch Floating Lantern:
                </span>
                <span className="font-serif text-lg font-black text-ink">
                  Catch {currentTarget.name}&apos;s Memory Lantern
                </span>
              </div>
            </button>

            {/* Optional Camera Motion Toggle */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => setCameraActive(!cameraActive)}
                className="flex items-center gap-1 text-[11px] font-bold text-ink-secondary hover:text-ink cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>{cameraActive ? "Disable Camera Wave" : "Optional: Wave Hand at Camera"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  speak(
                    `Touch the water or press the yellow button to catch ${currentTarget.name}'s lantern.`,
                    locale,
                    rate
                  )
                }
                className="flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:underline cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>Voice Guidance</span>
              </button>
            </div>
          </div>

          {/* REVEALED LANTERN MEMORY CAPSULE MODAL */}
          {activeRevealedTarget && (
            <div className="w-full max-w-md rounded-3xl border-4 border-black bg-surface p-5 shadow-[6px_6px_0px_#000] text-left animate-in fade-in zoom-in-95 duration-200 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
                <span className="text-xs font-black uppercase text-teal-800 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" /> Lantern Memory Illuminated
                </span>
                <span className="text-xs font-black uppercase rounded-full bg-teal-100 text-teal-900 px-3 py-0.5 border border-teal-400 flex items-center gap-1">
                  <Heart className="h-3 w-3 text-rose-600 fill-rose-600" />
                  {activeRevealedTarget.relationOrType}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeRevealedTarget.photoUrl}
                  alt={activeRevealedTarget.name}
                  className="h-20 w-20 rounded-2xl border-3 border-black object-cover shadow-[2px_2px_0px_#000] shrink-0"
                />
                <div>
                  <h3 className="font-serif text-xl font-black text-ink leading-tight">
                    {activeRevealedTarget.name}
                  </h3>
                  <p className="text-xs font-semibold text-ink-secondary mt-1.5 leading-relaxed">
                    {activeRevealedTarget.notes}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => speak(activeRevealedTarget.notes, locale, rate)}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <Volume2 className="h-4 w-4 text-teal-800" />
                  <span>Hear Story</span>
                </button>

                <button
                  type="button"
                  onClick={advanceNextTarget}
                  className="btn-tactile flex items-center gap-2 rounded-xl border-2 border-black bg-tea px-5 py-2.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-800 cursor-pointer"
                >
                  <span>
                    {currentTargetIndex + 1 < targets.length ? "Next Memory Lantern" : "Complete Ceremony"}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title={str.celebrationTitle}
          subtitle={str.celebrationSubtitle}
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
                  {unlockedLanterns.length} {str.hudProgress}
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                All Memory Lanterns Gathered
              </h3>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 border-t border-black/10 pt-3">
                {unlockedLanterns.map((l, i) => (
                  <div key={i} className="flex items-center gap-2.5 rounded-xl border-2 border-black bg-white p-2 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.photoUrl} alt={l.name} className="h-10 w-10 rounded-lg object-cover border border-black" />
                    <div>
                      <span className="text-xs font-black block truncate">{l.name}</span>
                      <span className="text-[10px] font-bold text-teal-800 uppercase">{l.relationOrType}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3.5 py-2 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-xs font-black">Play Folk Flute</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  Ceremony Complete
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startRiverGame}>
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
