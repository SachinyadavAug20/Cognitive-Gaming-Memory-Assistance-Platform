"use client";

import { useCallback, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  BookOpen,
  Volume2,
  Send,
  RotateCcw,
  Sparkles,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Music,
  Lightbulb,
  Quote,
  Check,
  X,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playLifeSong } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { api, type AiProverbResponse } from "@/lib/api";
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
      <GameHeader title={title} score={score} backHref="/patient/games" bgColor="bg-tea" />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

const CATEGORIES = ["WISDOM", "BIHU_SONG", "NATURE_HARVEST", "FAMILY_LOVE"];

export function ProverbGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "proverb", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [round, setRound] = useState(0);
  const [currentChallenge, setCurrentChallenge] = useState<AiProverbResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null);
  const [score, setScore] = useState(0);
  const [completedProverbs, setCompletedProverbs] = useState<string[]>([]);
  const [taps, setTaps] = useState(0);
  const [errors, setErrors] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const TOTAL_ROUNDS = 3;

  const loadChallenge = useCallback(
    async (roundNum: number) => {
      setIsAiLoading(true);
      setFeedback(null);
      setTypedAnswer("");
      const cat = CATEGORIES[roundNum % CATEGORIES.length];
      try {
        const res = await api.aiProverb({
          patientId,
          language: locale,
          category: cat,
        });
        setCurrentChallenge(res);
      } catch {
        const PROVERB_BANK: AiProverbResponse[] = [
          {
            id: "as-1",
            category: "BIHU_SONG",
            partialVerseWithBlank: "Rongali Bihu marks the arrival of spring and _____ in every home.",
            correctWord: "Joy",
            candidateOptions: ["Joy", "Frost", "Rain"],
            fullProverb: "Rongali Bihu marks the arrival of spring and joy in every home.",
            explanationAndWisdom: "Traditional Assamese springtime saying celebrating renewal and family reunions.",
            regionOrigin: "Assam Valley Heritage",
          },
          {
            id: "me-2",
            category: "NATURE_HARVEST",
            partialVerseWithBlank: "Like the living root bridges of Cherrapunji, family bonds grow _____ across generations.",
            correctWord: "Stronger",
            candidateOptions: ["Stronger", "Weaker", "Hollow"],
            fullProverb: "Like the living root bridges of Cherrapunji, family bonds grow stronger across generations.",
            explanationAndWisdom: "Khasi indigenous wisdom celebrating deep root resilience and ancestral unity.",
            regionOrigin: "Meghalaya Hill Heritage",
          },
          {
            id: "mz-3",
            category: "WISDOM",
            partialVerseWithBlank: "When neighbors share mountain tea and rice, the whole village finds _____ and peace.",
            correctWord: "Harmony",
            candidateOptions: ["Harmony", "Dispute", "Winter"],
            fullProverb: "When neighbors share mountain tea and rice, the whole village finds harmony and peace.",
            explanationAndWisdom: "Mizo Tlawmngaihna proverb on selfless community kindness and shared blessings.",
            regionOrigin: "Mizoram Living Heritage",
          },
          {
            id: "mn-4",
            category: "FAMILY_LOVE",
            partialVerseWithBlank: "Like the floating islands of Loktak Lake, a patient heart stays _____ in every tide.",
            correctWord: "Peaceful",
            candidateOptions: ["Peaceful", "Restless", "Heavy"],
            fullProverb: "Like the floating islands of Loktak Lake, a patient heart stays peaceful in every tide.",
            explanationAndWisdom: "Manipuri folk saying celebrating serenity, gentle breathing, and spiritual calm.",
            regionOrigin: "Manipur Valley Heritage",
          },
        ];
        const selected = PROVERB_BANK[roundNum % PROVERB_BANK.length];
        setCurrentChallenge(selected);
      } finally {
        setIsAiLoading(false);
      }
    },
    [patientId, locale]
  );

  const startGame = useCallback(() => {
    playPress();
    setPhase("play");
    setRound(0);
    setScore(0);
    setErrors(0);
    setCompletedProverbs([]);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    loadChallenge(0);
  }, [loadChallenge]);

  const submitAnswer = (userWord: string) => {
    if (!currentChallenge || feedback !== null || !userWord.trim()) return;
    setTaps((t) => t + 1);
    stopSpeaking();

    const normalizedUser = userWord.trim().toLowerCase();
    const normalizedCorrect = currentChallenge.correctWord.trim().toLowerCase();

    if (normalizedUser === normalizedCorrect) {
      playCorrect();
      setFeedback("correct");
      setScore((s) => s + 35);
      const updated = [...completedProverbs, currentChallenge.fullProverb];
      setCompletedProverbs(updated);
      speak(`Correct! ${currentChallenge.fullProverb}`, locale, rate);

      setTimeout(() => {
        if (round + 1 < TOTAL_ROUNDS) {
          const nextR = round + 1;
          setRound(nextR);
          loadChallenge(nextR);
        } else {
          playComplete();
          setPhase("done");
          if (startedAt) {
            recordGameSession(patientId, {
              gameId: "proverb",
              level,
              outcome: "completed",
              score: 100,
              startedAt,
              taps: taps + 1,
              errorCount: errors,
            });
          }
        }
      }, 2500);
    } else {
      playPress();
      setErrors((e) => e + 1);
      setFeedback("incorrect");
      speak("Give it another try! Listen to the hints.", locale, rate);
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "proverb",
    level,
    startedAt,
    taps,
    errorCount: errors,
  });

  const str = getGameStrings("proverb", locale);

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
                Semantic Recall // Module CDTx-12
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-tea" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-tea text-white shadow-[4px_4px_0px_#000]">
            <Quote className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {str.introSubtitle}
            </p>
          </div>

          {/* Module Benefits */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-tea block mb-2">
              Cognitive Benefits:
            </span>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-tea" />
                <span>Activates long-term semantic associations & cultural recall</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-marigold" />
                <span>Stimulates language synthesis with AI-generated hints</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-tea" />
                <span>Offers flexible voice/typing or one-tap multiple choice</span>
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
        <div className="flex flex-col items-center gap-4 py-1">
          {/* STAGE STATUS */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Verse {round + 1} of {TOTAL_ROUNDS}
            </span>
            <span className="text-[10px] font-black uppercase rounded bg-tea-light px-2 py-0.5 text-tea border border-tea/30">
              {currentChallenge?.regionOrigin || "Living Folklore"}
            </span>
          </div>

          {/* VERSE CARD */}
          <div className="relative w-full max-w-md rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[4px_4px_0px_#000] text-left select-none">
            <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-marigold" />
                <span className="text-xs font-black uppercase tracking-wider text-ink-secondary">
                  Fill in the missing word:
                </span>
              </div>
              {isAiLoading && (
                <span className="text-[10px] font-bold text-ink-secondary animate-pulse">
                  Loading verse...
                </span>
              )}
            </div>

            <p className="font-serif text-lg sm:text-xl font-black text-ink leading-relaxed">
              &ldquo;
              {feedback === "correct"
                ? currentChallenge?.fullProverb
                : currentChallenge?.partialVerseWithBlank}
              &rdquo;
            </p>

            {/* Wisdom Explanation Banner on Correct */}
            {feedback === "correct" && (
              <div className="mt-3.5 rounded-xl bg-tea-light/80 p-3 border-2 border-tea text-xs font-black text-ink flex items-start gap-2">
                <Check className="h-4 w-4 text-tea shrink-0 mt-0.5" />
                <div>
                  <strong className="text-tea block uppercase text-[10px]">
                    Wisdom & Cultural Significance:
                  </strong>
                  <span>{currentChallenge?.explanationAndWisdom}</span>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {feedback === "incorrect" && (
              <div className="mt-3.5 rounded-xl bg-red-100 p-2.5 border-2 border-brick text-xs font-black text-brick flex items-center gap-2">
                <X className="h-4 w-4 text-brick shrink-0" />
                <span>Not quite! Try choosing one of the words below.</span>
              </div>
            )}

            <div className="mt-4 flex items-center justify-between pt-2 border-t-2 border-black/10">
              <button
                type="button"
                onClick={() =>
                  speak(
                    currentChallenge?.partialVerseWithBlank.replace("_____", "blank") || "",
                    locale,
                    rate
                  )
                }
                className="group flex items-center gap-1.5 rounded-xl border-2 border-tea bg-tea-light px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-tea hover:text-white transition-all cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>Hear Verse</span>
              </button>
              <span className="text-xs font-black text-tea bg-tea-light px-2.5 py-1 rounded-lg border border-tea/30">
                +35 XP Reward
              </span>
            </div>
          </div>

          {/* DUAL INPUT CONTROLS */}
          <div className="w-full max-w-md space-y-2.5">
            {/* 1. Typing Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitAnswer(typedAnswer);
              }}
              className="flex items-center gap-1.5 rounded-2xl border-3 border-black bg-surface p-1.5 shadow-[3px_3px_0px_#000]"
            >
              <input
                type="text"
                maxLength={40}
                value={typedAnswer}
                disabled={feedback !== null || isAiLoading}
                onChange={(e) => setTypedAnswer(e.target.value)}
                placeholder="Type the missing word here..."
                className="flex-1 rounded-xl bg-transparent px-3 py-2 text-xs sm:text-sm font-black text-ink placeholder:text-ink-secondary/60 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!typedAnswer.trim() || feedback !== null || isAiLoading}
                className="btn-tactile flex items-center gap-1 rounded-xl border-2 border-black bg-tea px-3.5 py-2 text-xs font-black text-white shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit</span>
              </button>
            </form>

            {/* 2. One-Tap Candidate Word Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-ink-secondary flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-tea" /> Select Word:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {currentChallenge?.candidateOptions.map((word, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={feedback !== null || isAiLoading}
                    onClick={() => submitAnswer(word)}
                    className="btn-tactile group flex items-center justify-center rounded-xl border-2 border-black bg-surface px-3 py-3 text-center text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-tea hover:text-white transition-transform active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{word}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title={str.celebrationTitle}
          subtitle={str.celebrationSubtitle}
          xpEarned={105}
          accuracy={`${Math.max(0, Math.round(((taps - errors) / Math.max(1, taps)) * 100))}%`}
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Living Heritage Preserved
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-tea text-white px-2 py-0.5">
                  {completedProverbs.length} {str.hudProgress}
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                Completed Proverbs Archive
              </h3>
              <div className="mt-3 space-y-2 border-t border-black/10 pt-2">
                {completedProverbs.map((p, i) => (
                  <div key={i} className="text-xs font-extrabold text-ink leading-relaxed">
                    &bull; &ldquo;{p}&rdquo;
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
                  <span className="text-xs font-black">Play Bihu Tune</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  Assessment Complete
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startGame}>
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
