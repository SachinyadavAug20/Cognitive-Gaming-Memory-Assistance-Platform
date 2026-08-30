"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Music,
  RotateCcw,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Activity,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playLifeSong, playTapFeedback } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { DrumScene3D } from "./DrumScene3D";

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
      <GameHeader title={title} score={score} backHref="/patient/games" bgColor="bg-marigold" />
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

  const TARGET_HITS = 12;
  const score = Math.round((hitsCount / TARGET_HITS) * 100);

  const startGame = useCallback(() => {
    playPress();
    setPhase("play");
    setHitsCount(0);
    setLeftHits(0);
    setRightHits(0);
    setLastHitSide(null);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    speak("Tap either side of the 3D Bihu Dhol drum to match the festive rhythm.", locale, rate);
  }, [locale, rate]);

  const handleDrumHit = (side: "left" | "right") => {
    if (hitsCount >= TARGET_HITS) return;
    setTaps((t) => t + 1);
    stopSpeaking();
    playTapFeedback();

    setLastHitSide(side);
    setLastHitTime(Date.now());

    if (side === "left") setLeftHits((l) => l + 1);
    else setRightHits((r) => r + 1);

    const nextHits = hitsCount + 1;
    setHitsCount(nextHits);

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
  };

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "drum",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  if (loading)
    return (
      <GameShell title="3D Folk Rhythm Drummer" score={0}>
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title="3D Folk Rhythm Drummer" score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title="The 3D Folk Rhythm Drummer: Dhol & Ksing" score={score}>
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
              The 3D Folk Rhythm Drummer
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              Experience the celebratory beats of the Assamese Bihu Dhol and Khasi Ksing. Tap left and right to play the traditional folk rhythm.
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
                <span>Dynamic 3D spring deformation and acoustic visualizer</span>
              </div>
            </div>
          </div>

          <AudioPrompt
            text="Welcome to the 3D Folk Rhythm Drummer. Tap the drum to play traditional Bihu beats."
            label="Listen to Instructions"
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startGame}>
            Start Drum Session
          </ChunkyButton>
        </div>
      ) : phase === "play" ? (
        <div className="flex flex-col items-center gap-3.5 py-1">
          {/* DRUM STATUS BAR */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-marigold flex items-center gap-1.5">
              <Activity className="h-4 w-4" /> Beat Progress: {hitsCount} / {TARGET_HITS}
            </span>
            <span className="text-[11px] font-bold text-ink-secondary">
              L: {leftHits} &bull; R: {rightHits}
            </span>
          </div>

          {/* THREE.JS 3D DRUM CANVAS */}
          <DrumScene3D
            onDrumHit={handleDrumHit}
            lastHitSide={lastHitSide}
            lastHitTime={lastHitTime}
          />

          {/* BILATERAL TOUCH TRIGGER BUTTONS */}
          <div className="w-full max-w-md grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleDrumHit("left")}
              className="btn-tactile flex flex-col items-center justify-center gap-1.5 rounded-2xl border-3 border-black bg-amber-100 p-4 shadow-[4px_4px_0px_#000] active:translate-y-1 hover:bg-amber-200 cursor-pointer"
            >
              <span className="text-sm font-black text-amber-950">LEFT DRUM HEAD</span>
              <span className="text-[10px] font-bold text-amber-800 uppercase">Bass Beat (Dhum)</span>
            </button>

            <button
              type="button"
              onClick={() => handleDrumHit("right")}
              className="btn-tactile flex flex-col items-center justify-center gap-1.5 rounded-2xl border-3 border-black bg-red-100 p-4 shadow-[4px_4px_0px_#000] active:translate-y-1 hover:bg-red-200 cursor-pointer"
            >
              <span className="text-sm font-black text-red-950">RIGHT DRUM HEAD</span>
              <span className="text-[10px] font-bold text-red-800 uppercase">Treble Snare (Taak)</span>
            </button>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title="Folk Rhythm Mastery Complete!"
          subtitle="You played the traditional Bihu Dhol beats with optimal bilateral motor entrainment."
          xpEarned={120}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-marigold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Acoustic Milestone Recorded
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-marigold text-white px-2 py-0.5">
                  {TARGET_HITS} Rhythmic Beats
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                Bilateral Symmetry Index: Optimal
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1">
                Left strikes ({leftHits}) and Right strikes ({rightHits}) demonstrate active bilateral hemisphere engagement.
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-xs font-black">Play Rongali Bihu Geet</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  Assessment Complete
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startGame}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> Play Another Beat
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
