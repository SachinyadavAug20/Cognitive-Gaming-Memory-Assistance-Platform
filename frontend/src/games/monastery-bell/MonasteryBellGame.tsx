"use client";

import { useCallback, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Bell,
  RotateCcw,
  Sparkles,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Music,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playLifeSong, playMonasteryBell, unlockAudio } from "@/lib/sound";
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
        bgColor="bg-purple-900"
        gameId="monastery-bell"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

interface BellInstrument {
  id: number;
  name: string;
  subname: string;
  emoji: string;
  color: string;
  activeColor: string;
  frequency: number; // Hz
}

const SACRED_BELLS: BellInstrument[] = [
  {
    id: 0,
    name: "Golden Gong",
    subname: "Deep Resonant Bass",
    emoji: "🥁",
    color: "bg-amber-100 border-amber-600 text-amber-950",
    activeColor: "bg-amber-400 border-amber-800 text-black ring-4 ring-amber-300 scale-105",
    frequency: 220,
  },
  {
    id: 1,
    name: "Bronze Singing Bowl",
    subname: "Harmonic Overtone",
    emoji: "🥣",
    color: "bg-emerald-100 border-emerald-600 text-emerald-950",
    activeColor: "bg-emerald-400 border-emerald-800 text-black ring-4 ring-emerald-300 scale-105",
    frequency: 330,
  },
  {
    id: 2,
    name: "Tawang Wind Chime",
    subname: "High Shimmer",
    emoji: "🎐",
    color: "bg-sky-100 border-sky-600 text-sky-950",
    activeColor: "bg-sky-400 border-sky-800 text-black ring-4 ring-sky-300 scale-105",
    frequency: 440,
  },
  {
    id: 3,
    name: "Sacred Temple Bell",
    subname: "Clear High Chime",
    emoji: "🔔",
    color: "bg-rose-100 border-rose-600 text-rose-950",
    activeColor: "bg-rose-400 border-rose-800 text-black ring-4 ring-rose-300 scale-105",
    frequency: 550,
  },
];

export function MonasteryBellGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "monastery-bell", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "demonstrate" | "reproduce" | "done">("intro");
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activeHighlightId, setActiveHighlightId] = useState<number | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const TOTAL_ROUNDS = 3;

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "monastery-bell",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  // Synthesize rich harmonic bell chime using Web Audio API
  const playChimeTone = useCallback((freq: number) => {
    unlockAudio();
    playMonasteryBell(freq);
  }, []);

  // Generate sequence for current round
  const generateSequenceForRound = useCallback((round: number) => {
    const seqLen = 2 + round; // Round 1: 3 items, Round 2: 4 items, Round 3: 5 items
    const seq: number[] = [];
    for (let i = 0; i < seqLen; i++) {
      seq.push(Math.floor(Math.random() * 4));
    }
    return seq;
  }, []);

  // Play sequence demonstration to elder
  const playSequenceDemo = useCallback(
    (seq: number[]) => {
      setPhase("demonstrate");
      setUserSequence([]);

      seq.forEach((bellId, index) => {
        setTimeout(() => {
          setActiveHighlightId(bellId);
          playChimeTone(SACRED_BELLS[bellId].frequency);

          setTimeout(() => {
            setActiveHighlightId(null);
            if (index === seq.length - 1) {
              setPhase("reproduce");
              speak("Your turn! Tap the sacred bells in the same melodic order.", locale, rate);
            }
          }, 600);
        }, index * 900 + 400);
      });
    },
    [locale, playChimeTone, rate]
  );

  const startRound = useCallback(
    (roundNum: number) => {
      const seq = generateSequenceForRound(roundNum);
      setSequence(seq);
      playSequenceDemo(seq);
    },
    [generateSequenceForRound, playSequenceDemo]
  );

  const startChimeSession = useCallback(() => {
    playPress();
    setCurrentRound(1);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    startRound(1);
  }, [startRound]);

  const handleBellTap = (bellId: number) => {
    if (phase !== "reproduce") return;
    setTaps((t) => t + 1);

    // Play tone & tactile highlight
    playChimeTone(SACRED_BELLS[bellId].frequency);
    setActiveHighlightId(bellId);
    setTimeout(() => setActiveHighlightId(null), 300);

    const nextUserSeq = [...userSequence, bellId];
    setUserSequence(nextUserSeq);

    const currentStep = nextUserSeq.length - 1;

    // Check if match
    if (nextUserSeq[currentStep] !== sequence[currentStep]) {
      // Gentle errorless feedback: replay sequence
      speak("Listen once more to the sacred bell sequence.", locale, rate);
      setTimeout(() => {
        playSequenceDemo(sequence);
      }, 1200);
      return;
    }

    // Sequence completed successfully
    if (nextUserSeq.length === sequence.length) {
      playCorrect();
      if (currentRound < TOTAL_ROUNDS) {
        speak("Wonderful rhythm! Advancing to the next sacred chime.", locale, rate);
        setTimeout(() => {
          const nextR = currentRound + 1;
          setCurrentRound(nextR);
          startRound(nextR);
        }, 1500);
      } else {
        setTimeout(() => {
          playComplete();
          setPhase("done");
          if (startedAt) {
            recordGameSession(patientId, {
              gameId: "monastery-bell",
              level,
              outcome: "completed",
              score: 100,
              startedAt,
              taps: taps + 1,
              errorCount: 0,
            });
          }
        }, 800);
      }
    }
  };

  const str = getGameStrings("monastery-bell", locale);

  if (loading) return <GameShell title={str.title} score={0}><GameLoading /></GameShell>;
  if (error) return <GameShell title={str.title} score={0}><GameError onRetry={reload} /></GameShell>;

  return (
    <GameShell title={str.title} score={currentRound * 33}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                Auditory Working Memory // Module CDTx-21
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-purple-900" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-purple-900 text-white shadow-[4px_4px_0px_#000]">
            <Bell className="h-10 w-10 stroke-[2.5]" />
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
            <span className="text-xs font-black uppercase tracking-wider text-purple-900 block mb-2">
              Clinical Benefits:
            </span>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-700" />
                <span>Auditory working memory span & temporal sequence retention</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-tea" />
                <span>Acoustic pitch discrimination & sensorimotor synchronization</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-marigold" />
                <span>Meditative harmonic resonance and mindfulness de-escalation</span>
              </div>
            </div>
          </div>

          <AudioPrompt
            text={str.audioPrompt}
            label={str.listenLabel}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startChimeSession}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "demonstrate" || phase === "reproduce" ? (
        <div className="flex flex-col items-center gap-4 py-1 text-center">
          {/* ROUND HUD */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-700" /> {str.hudProgress}: {currentRound} / {TOTAL_ROUNDS}
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300">
              {phase === "demonstrate" ? "🎧 Listen Carefully..." : "👉 Your Turn to Play!"}
            </span>
          </div>

          {/* SACRED BELLS 2X2 GRID */}
          <div className="w-full max-w-md grid grid-cols-2 gap-3.5 pt-2">
            {SACRED_BELLS.map((bell) => {
              const isLit = activeHighlightId === bell.id;
              return (
                <button
                  key={bell.id}
                  type="button"
                  onClick={() => handleBellTap(bell.id)}
                  disabled={phase === "demonstrate"}
                  className={`btn-tactile flex flex-col items-center justify-center gap-2 rounded-3xl border-3 p-5 transition-all shadow-[4px_4px_0px_#000] cursor-pointer ${
                    isLit ? bell.activeColor : bell.color
                  }`}
                >
                  <span className="text-4xl">{bell.emoji}</span>
                  <div>
                    <span className="font-serif text-base font-black block leading-tight">
                      {bell.name}
                    </span>
                    <span className="text-[10px] font-bold opacity-80 uppercase block mt-0.5">
                      {bell.subname}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* SEQUENCE STEP DOTS */}
          <div className="flex items-center gap-2 pt-2">
            {sequence.map((_, i) => (
              <span
                key={i}
                className={`h-3 w-3 rounded-full border-2 border-black transition-all ${
                  i < userSequence.length ? "bg-purple-900 scale-110" : "bg-white"
                }`}
              />
            ))}
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title={str.celebrationTitle}
          subtitle={str.celebrationSubtitle}
          xpEarned={135}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> 3 Sacred Chimes Completed
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-purple-900 text-white px-2 py-0.5">
                  MoCA Attention Peak
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                Auditory Memory Span: 5 Sequential Tones
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1">
                Acoustic tone sequence retention demonstrated active temporal lobe and working memory encoding.
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-purple-100 px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-purple-900" />
                  <span className="text-xs font-black">Play Tawang Monastery Hymn</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startChimeSession}>
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
