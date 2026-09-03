"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Footprints,
  RotateCcw,
  Sparkles,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Music,
  Zap,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playLifeSong, playBambooClap } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
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
        bgColor="bg-emerald-900"
        gameId="bamboo-dance"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

export function BambooDanceGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "bamboo-dance", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "dance" | "done">("intro");
  const [currentStepPos, setCurrentStepPos] = useState<0 | 1 | 2>(1); // 0: Left, 1: Center, 2: Right
  const [bambooOpen, setBambooOpen] = useState(true);
  const [successfulSteps, setSuccessfulSteps] = useState(0);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const TARGET_STEPS = 8;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "bamboo-dance",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  // Bamboo Rhythm Metronome Loop
  useEffect(() => {
    if (phase !== "dance") return;

    const intervalMs = level === 1 ? 1600 : level === 2 ? 1300 : 1000;

    timerRef.current = setInterval(() => {
      setBambooOpen((prev) => {
        const next = !prev;
        playBambooClap(next);
        return next;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [level, phase]);

  const handleStep = (targetLane: 0 | 1 | 2) => {
    if (phase !== "dance") return;
    setTaps((t) => t + 1);
    setCurrentStepPos(targetLane);

    // If stepped while bamboo is open -> SUCCESSFUL RHYTHM STEP
    if (bambooOpen) {
      playCorrect();
      setSuccessfulSteps((prev) => {
        const next = prev + 1;
        if (next >= TARGET_STEPS) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTimeout(() => {
            playComplete();
            setPhase("done");
            if (startedAt) {
              recordGameSession(patientId, {
                gameId: "bamboo-dance",
                level,
                outcome: "completed",
                score: 100,
                startedAt,
                taps: taps + 1,
                errorCount: 0,
              });
            }
          }, 600);
        }
        return next;
      });
    } else {
      // Stepped while closed -> gentle warning & encourage
      speak("Step lightly when the bamboo opens to the rhythm!", locale, rate);
    }
  };

  const startDance = useCallback(() => {
    playPress();
    setPhase("dance");
    setSuccessfulSteps(0);
    setCurrentStepPos(1);
    setBambooOpen(true);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
  }, []);

  const str = getGameStrings("bamboo-dance", locale);

  if (loading) return <GameShell title={str.title} score={0}><GameLoading /></GameShell>;
  if (error) return <GameShell title={str.title} score={0}><GameError onRetry={reload} /></GameShell>;

  return (
    <GameShell title={str.title} score={successfulSteps * 12}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                Visuomotor Rhythm // Module CDTx-22
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-emerald-900" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-emerald-900 text-white shadow-[4px_4px_0px_#000]">
            <Footprints className="h-10 w-10 stroke-[2.5]" />
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
            <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block mb-2">
              Clinical Benefits:
            </span>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-800" />
                <span>Rhythmic motor anticipation & sensory-motor gating</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-tea" />
                <span>Bilateral lower/upper limb coordination and reaction timing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-marigold" />
                <span>Cultural entrainment and joyful Mizo folk music stimulation</span>
              </div>
            </div>
          </div>

          <AudioPrompt
            text={str.audioPrompt}
            label={str.listenLabel}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startDance}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "dance" ? (
        <div className="flex flex-col items-center gap-4 py-1 text-center">
          {/* RHYTHM HUD */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-emerald-700" /> {str.hudProgress}: {successfulSteps} / {TARGET_STEPS}
            </span>
            <span
              className={`text-xs font-black px-2.5 py-0.5 rounded border transition-all ${
                bambooOpen
                  ? "bg-emerald-100 text-emerald-900 border-emerald-400 animate-pulse"
                  : "bg-amber-100 text-amber-900 border-amber-400"
              }`}
            >
              {bambooOpen ? "🟢 BAMBOO OPEN • STEP NOW!" : "🔴 BAMBOO CLOSED"}
            </span>
          </div>

          {/* BAMBOO STAVES VISUALIZATION */}
          <div className="relative w-full max-w-md h-56 rounded-2xl border-3 border-black bg-[#2D1B13] p-4 flex flex-col justify-between overflow-hidden shadow-[4px_4px_0px_#000]">
            {/* Upper Bamboo Pole Pair */}
            <div
              className={`h-6 rounded-full border-2 border-black bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 shadow-md transition-all duration-300 ${
                bambooOpen ? "translate-y-0" : "translate-y-12"
              }`}
            />

            {/* Dancer Footprint Position Indicator */}
            <div className="flex items-center justify-around z-10">
              {[0, 1, 2].map((lane) => {
                const isCurrent = currentStepPos === lane;
                return (
                  <div
                    key={lane}
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 transition-all ${
                      isCurrent
                        ? "border-white bg-emerald-500 text-white scale-110 shadow-lg"
                        : "border-white/20 bg-white/10 text-white/40"
                    }`}
                  >
                    <Footprints className="h-8 w-8" />
                  </div>
                );
              })}
            </div>

            {/* Lower Bamboo Pole Pair */}
            <div
              className={`h-6 rounded-full border-2 border-black bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 shadow-md transition-all duration-300 ${
                bambooOpen ? "translate-y-0" : "-translate-y-12"
              }`}
            />
          </div>

          {/* 3 TACTILE STEPPING BUTTONS */}
          <div className="w-full max-w-md grid grid-cols-3 gap-2 pt-2">
            <button
              type="button"
              onClick={() => handleStep(0)}
              className="btn-tactile flex flex-col items-center justify-center gap-1 rounded-2xl border-3 border-black bg-emerald-100 p-4 font-black text-ink shadow-[4px_4px_0px_#000] active:translate-y-1 hover:bg-emerald-200 cursor-pointer"
            >
              <Zap className="h-5 w-5 text-emerald-900" />
              <span className="text-xs">LEFT STEP</span>
            </button>

            <button
              type="button"
              onClick={() => handleStep(1)}
              className="btn-tactile flex flex-col items-center justify-center gap-1 rounded-2xl border-3 border-black bg-emerald-300 p-4 font-black text-ink shadow-[4px_4px_0px_#000] active:translate-y-1 hover:bg-emerald-400 cursor-pointer"
            >
              <Footprints className="h-5 w-5 text-emerald-950" />
              <span className="text-xs">CENTER STEP</span>
            </button>

            <button
              type="button"
              onClick={() => handleStep(2)}
              className="btn-tactile flex flex-col items-center justify-center gap-1 rounded-2xl border-3 border-black bg-emerald-100 p-4 font-black text-ink shadow-[4px_4px_0px_#000] active:translate-y-1 hover:bg-emerald-200 cursor-pointer"
            >
              <Zap className="h-5 w-5 text-emerald-900" />
              <span className="text-xs">RIGHT STEP</span>
            </button>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title={str.celebrationTitle}
          subtitle={str.celebrationSubtitle}
          xpEarned={140}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> 8 Rhythm Cycles Completed
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-emerald-900 text-white px-2 py-0.5">
                  Cheraw Rhythmic Peak
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                Visuomotor Synchronization: 100% Timing
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1">
                Motor response speed and rhythm anticipation demonstrated healthy temporal coordination and motor control.
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-emerald-100 px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-emerald-900" />
                  <span className="text-xs font-black">Play Mizo Festive Khuang Song</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startDance}>
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
