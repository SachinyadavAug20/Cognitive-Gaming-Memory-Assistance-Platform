"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Music, Bell, Sparkles } from "lucide-react";
import { BihuDholIcon, KhasiKsingIcon } from "@/components/ui/CulturalIcons";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import {
  playPress,
  playComplete,
  playDholBeat,
  playLandmarkChime,
  playLifeSong,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";

export interface DrumPad {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string; size?: number | string }>;
  color: string;
  borderColor: string;
  soundType: "dhol-low" | "dhol-high" | "chime";
}

const DRUMS: DrumPad[] = [
  { id: "dhol-low", name: "Bihu Dhol (Bass)", icon: BihuDholIcon, color: "#B45309", borderColor: "#78350F", soundType: "dhol-low" },
  { id: "ksing", name: "Khasi Ksing (Snare)", icon: KhasiKsingIcon, color: "#DC2626", borderColor: "#991B1B", soundType: "dhol-high" },
  { id: "chime", name: "Sacred Bell Chime", icon: Bell, color: "#16A34A", borderColor: "#166534", soundType: "chime" },
];

export function RhythmHillsGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "rhythm-hills", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [rhythmHits, setRhythmHits] = useState(0);
  const [activePadId, setActivePadId] = useState<string | null>(null);
  const [pulseIndex, setPulseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const targetHits = 12; // 12 rhythmic beats to complete folk song

  const pulseTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const guard = useSessionGuard({
    patientId,
    gameId: "rhythm-hills",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (pulseTimer.current) clearInterval(pulseTimer.current);
    };
  }, []);

  function startRhythm() {
    stopSpeaking();
    playPress();
    setRhythmHits(0);
    setScore(0);
    setTaps(0);
    setStartedAt(new Date().toISOString());
    setPhase("play");

    // Start rhythmic visual pulse every 1.5s
    if (pulseTimer.current) clearInterval(pulseTimer.current);
    pulseTimer.current = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % DRUMS.length);
    }, 1500);
  }

  function handleDrumTap(drum: DrumPad) {
    if (phase !== "play") return;
    setTaps((v) => v + 1);
    setActivePadId(drum.id);

    if (drum.soundType === "dhol-low") {
      playDholBeat(true);
    } else if (drum.soundType === "dhol-high") {
      playDholBeat(false);
    } else {
      playLandmarkChime();
    }

    const nextHits = rhythmHits + 1;
    setRhythmHits(nextHits);
    setScore(nextHits);

    setTimeout(() => setActivePadId(null), 250);

    if (nextHits >= targetHits) {
      if (pulseTimer.current) clearInterval(pulseTimer.current);
      completeRhythmSession();
    }
  }

  function completeRhythmSession() {
    stopSpeaking();
    playComplete();
    setPhase("done");
    guard.markCompleted();

    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "rhythm-hills",
        level,
        outcome: "completed",
        score: targetHits,
        startedAt,
        taps,
      });
    }
    speak(
      "Wonderful rhythm! You brought joyful music and harmony to the hills today.",
      locale,
      rate
    );
  }

  if (loading) return <GameLoading />;
  if (error)
    return (
      <section className="pb-12">
        <GameHeader title="Rhythm of the Hills" score={0} backHref="/patient/games" bgColor="bg-tea" />
        <div className="mx-auto max-w-3xl px-4 pt-6">
          <GameError onRetry={reload} />
        </div>
      </section>
    );

  return (
    <section className="pb-12">
      <GameHeader title="Rhythm of the Hills" score={score} backHref="/patient/games" bgColor="bg-tea" />
      <div className="mx-auto max-w-3xl px-4 pt-6">
        {phase === "intro" ? (
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl border-3 border-black bg-amber-200 text-amber-950 shadow-[4px_4px_0px_#000] animate-bounce">
              <BihuDholIcon className="h-14 w-14" />
            </div>
            <p className="font-serif text-3xl font-black text-ink">
              Rhythm of the Hills
            </p>
            <p className="max-w-md text-lg font-semibold text-ink-secondary">
              Play traditional Assamese Dhol, Khasi Ksing, and mountain chimes in rhythm to uplift your spirits and motor coordination.
            </p>

            <AudioPrompt
              text="Welcome to Rhythm of the Hills. Tap the traditional drums to play along with the timeless folk beats."
              label="Listen"
              size="md"
            />

            <ChunkyButton variant="tea" size="2xl" onClick={startRhythm} icon={<BihuDholIcon className="h-6 w-6" />}>
              Play Folk Rhythms
            </ChunkyButton>
          </div>
        ) : phase === "play" ? (
          <div className="flex flex-col items-center gap-5 py-4">
            {/* RHYTHM PROGRESS HEADER */}
            <div className="w-full max-w-md flex items-center justify-between rounded-2xl border-2 border-black bg-surface px-4 py-2 shadow-sm">
              <span className="text-sm font-black text-tea flex items-center gap-1.5">
                <Music className="h-4 w-4" />
                <span>Folk Rhythm Stage</span>
              </span>
              <span className="text-xs font-bold text-ink-secondary">
                {rhythmHits} / {targetHits} Beats Played
              </span>
            </div>

            {/* DRUMMING STAGE */}
            <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl border-4 border-[#3B2212] bg-[#1E0F07] p-5 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] overflow-hidden select-none flex flex-col items-center justify-center min-h-[280px]">
              <div className="absolute top-2 right-4 text-xs font-black uppercase tracking-wider text-amber-300/80 flex items-center gap-1.5">
                <BihuDholIcon className="h-3.5 w-3.5" />
                <span>Bihu & Khasi Rhythms</span>
              </div>

              {/* 3 Large Tactile Ethnic Drum Pads */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full my-4 z-10">
                {DRUMS.map((drum, idx) => {
                  const isPulsing = pulseIndex === idx;
                  const isTapped = activePadId === drum.id;
                  const DrumIcon = drum.icon;

                  return (
                    <button
                      key={drum.id}
                      type="button"
                      onClick={() => handleDrumTap(drum)}
                      className={`btn-tactile group relative flex flex-col items-center justify-center gap-2 rounded-3xl border-4 p-4 transition-all duration-150 cursor-pointer aspect-square ${
                        isTapped
                          ? "scale-95 bg-white border-black text-black"
                          : isPulsing
                          ? "scale-105 ring-4 ring-amber-400 shadow-[0_0_20px_rgba(245,158,11,1)] text-white"
                          : "shadow-[4px_4px_0px_rgba(0,0,0,1)] active:scale-95 text-white"
                      }`}
                      style={{
                        backgroundColor: isTapped ? "#FFFFFF" : drum.color,
                        borderColor: drum.borderColor,
                      }}
                    >
                      <div className="h-12 w-12 flex items-center justify-center">
                        <DrumIcon className="h-10 w-10 stroke-[2.2]" />
                      </div>
                      <span className={`text-[10px] font-black text-center leading-tight ${isTapped ? "text-black" : "text-white"}`}>
                        {drum.name}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="relative z-10 text-center">
                <span className="rounded-full bg-black/60 border border-white/20 px-3 py-1 text-xs font-black text-amber-200 inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Tap any drum to create joyful music</span>
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2">
              <ChunkyButton variant="marigold" size="xl" onClick={() => playLifeSong()}>
                <span className="flex items-center gap-2">
                  <Music className="h-4 w-4" /> Play Folk Melody
                </span>
              </ChunkyButton>
            </div>
          </div>
        ) : (
          /* PHASE: DONE CELEBRATION */
          <Celebration icon={Music} title="Folk Symphony Complete!">
            <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left">
              <div className="relative w-full rounded-3xl border-4 border-black bg-[#FAF5EE] p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-ink select-none">
                <h3 className="font-serif text-2xl font-black text-tea">
                  Symphony of the North East
                </h3>
                <p className="text-xs font-bold text-ink-secondary mt-1">
                  You completed {targetHits} rhythmic folk beats in perfect tempo.
                </p>

                {/* Music Button */}
                <div className="mt-4 flex items-center justify-between pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => playLifeSong()}
                    className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3.5 py-2 text-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 cursor-pointer"
                  >
                    <Music className="h-4 w-4 text-ink" />
                    <span className="text-xs font-black">Play Life Song Melody</span>
                  </button>
                  <span className="text-xs font-bold text-ink-secondary">
                    Score: {score}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <ChunkyButton variant="tea" size="xl" onClick={startRhythm}>
                  Play Rhythms Again
                </ChunkyButton>
                <Link
                  href="/patient/games"
                  className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-surface px-6 py-3 font-extrabold text-ink hover:bg-surface-muted shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                >
                  {locale === "hi" ? "← थेरेपी केंद्र" : locale === "as" ? "← থেৰাপী কক্ষ" : "← Back to Therapy Suite"}
                </Link>
              </div>
            </div>
          </Celebration>
        )}
      </div>
    </section>
  );
}
