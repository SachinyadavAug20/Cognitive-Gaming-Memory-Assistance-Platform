"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Brain,
  ScanEye,
  ListOrdered,
  CheckCircle2,
  XCircle,
  Flower2,
  Sun,
  Moon,
  Star,
  Heart,
  Trees,
  Bird,
  Fish,
  Cat,
  Dog,
  Apple,
  CloudRain,
  Check,
  Leaf,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import {
  playPress,
  playCorrect,
  playComplete,
  playEncourage,
  playTapFeedback,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";

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
        bgColor="bg-tea"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

interface GardenItem {
  id: string;
}

const GARDEN_ITEMS: GardenItem[] = [
  { id: "flower" },
  { id: "sun" },
  { id: "moon" },
  { id: "star" },
  { id: "heart" },
  { id: "tree" },
  { id: "bird" },
  { id: "fish" },
  { id: "cat" },
  { id: "dog" },
  { id: "apple" },
  { id: "rain" },
];

function renderGardenIcon(id: string, className = "h-10 w-10") {
  switch (id) {
    case "flower":
      return <Flower2 className={`${className} text-rose-500`} />;
    case "sun":
      return <Sun className={`${className} text-amber-500`} />;
    case "moon":
      return <Moon className={`${className} text-indigo-400`} />;
    case "star":
      return <Star className={`${className} text-yellow-500`} />;
    case "heart":
      return <Heart className={`${className} text-red-500`} />;
    case "tree":
      return <Trees className={`${className} text-emerald-600`} />;
    case "bird":
      return <Bird className={`${className} text-sky-500`} />;
    case "fish":
      return <Fish className={`${className} text-cyan-500`} />;
    case "cat":
      return <Cat className={`${className} text-amber-600`} />;
    case "dog":
      return <Dog className={`${className} text-amber-700`} />;
    case "apple":
      return <Apple className={`${className} text-red-600`} />;
    case "rain":
      return <CloudRain className={`${className} text-blue-500`} />;
    default:
      return <Leaf className={`${className} text-emerald-600`} />;
  }
}

const _SUB_GAMES = ["memoryMatch", "whatChanged", "sequence"] as const;
type SubGame = (typeof _SUB_GAMES)[number];

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function pairsForLevel(level: number): number {
  return [3, 4, 5, 6][Math.min(Math.max(level - 1, 0), 3)] ?? 3;
}

function changeItemCount(level: number): number {
  return level <= 2 ? 4 : 5;
}

function sequenceLength(level: number): number {
  return Math.min(Math.max(level + 2, 3), 5);
}

function previewSecondsFor(level: number): number {
  return 3 + level;
}

export function MemoryGardenGame() {
  const locale = useLocale();
  const t = useTranslations("games.memoryGarden");
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "memoryGarden", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "preview" | "play" | "play2">(
    "intro"
  );
  const [subGame, setSubGame] = useState<SubGame | null>(null);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [errors, setErrors] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  // Memory Match state
  const [cards, setCards] = useState<GardenItem[]>([]);
  const [matchFlipped, setMatchFlipped] = useState<number[]>([]);
  const [matchMatched, setMatchMatched] = useState<boolean[]>([]);
  const [matchLocked, setMatchLocked] = useState(false);

  // What Changed state
  const [changeGrid, setChangeGrid] = useState<GardenItem[]>([]);
  const [changeChangedIndex, setChangeChangedIndex] = useState(0);
  const [changeFeedback, setChangeFeedback] = useState<
    "idle" | "correct" | "wrong"
  >("idle");

  // Sequence state
  const [sequenceItems, setSequenceItems] = useState<GardenItem[]>([]);
  const [sequenceOptions, setSequenceOptions] = useState<GardenItem[]>([]);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [sequenceFeedback, setSequenceFeedback] = useState<
    "idle" | "correct" | "wrong"
  >("idle");

  const resultRef = useRef<{ score: number; errors: number; taps: number }>({
    score: 0,
    errors: 0,
    taps: 0,
  });

  useEffect(() => stopSpeaking, []);

  // ─── ACTIVITY SETUP ────────────────────────────────────────────────
  const startMemoryMatch = useCallback(
    (lvl: number) => {
      stopSpeaking();
      playPress();
      const pairCount = pairsForLevel(lvl);
      const chosen = shuffle(GARDEN_ITEMS).slice(0, pairCount);
      const deck = shuffle(chosen.flatMap((item) => [item, item]));
      setCards(deck);
      setMatchFlipped([]);
      setMatchMatched(new Array(deck.length).fill(false));
      setMatchLocked(false);
      setSubGame("memoryMatch");
      setCountdown(previewSecondsFor(lvl));
      setPhase("preview");
      speak(t("memoryMatch.look"), locale, rate);
    },
    [locale, rate, t]
  );

  const startWhatChanged = useCallback(
    (lvl: number) => {
      stopSpeaking();
      playPress();
      const count = changeItemCount(lvl);
      const chosen = shuffle(GARDEN_ITEMS).slice(0, count);
      const changedIndex = Math.floor(Math.random() * count);
      const others = GARDEN_ITEMS.filter(
        (item) => !chosen.some((c) => c.id === item.id)
      );
      const replacement = shuffle(others)[0];
      const grid = chosen.map((item, i) =>
        i === changedIndex ? replacement : item
      );
      setChangeGrid(grid);
      setChangeChangedIndex(changedIndex);
      setChangeFeedback("idle");
      setSubGame("whatChanged");
      setCountdown(previewSecondsFor(lvl));
      setPhase("preview");
      speak(t("whatChanged.look"), locale, rate);
    },
    [locale, rate, t]
  );

  const startSequence = useCallback(
    (lvl: number) => {
      stopSpeaking();
      playPress();
      const len = sequenceLength(lvl);
      const chosen = shuffle(GARDEN_ITEMS).slice(0, len);
      setSequenceItems(chosen);
      setSequenceOptions(shuffle(chosen));
      setSequenceIndex(0);
      setSequenceFeedback("idle");
      setSubGame("sequence");
      setCountdown(previewSecondsFor(lvl));
      setPhase("preview");
      speak(t("sequence.look"), locale, rate);
    },
    [locale, rate, t]
  );

  const launch = useCallback(
    (kind: SubGame) => {
      if (!startedAt) setStartedAt(new Date().toISOString());
      if (kind === "memoryMatch") startMemoryMatch(level);
      else if (kind === "whatChanged") startWhatChanged(level);
      else startSequence(level);
    },
    [startedAt, level, startMemoryMatch, startWhatChanged, startSequence]
  );

  const showIntro = useCallback(() => {
    stopSpeaking();
    playEncourage();
    setPhase("intro");
    setSubGame(null);
    setMatchFlipped([]);
    setMatchMatched([]);
    setChangeFeedback("idle");
    setSequenceFeedback("idle");
  }, []);

  // ─── MEMORY MATCH ──────────────────────────────────────────────────
  const matchComplete = useCallback(() => {
    setPhase("play2");
    playComplete();
    speak(t("memoryMatch.complete"), locale, rate);
    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "memoryGarden",
        level,
        outcome: "completed",
        score: resultRef.current.score,
        startedAt,
        taps: resultRef.current.taps,
        errorCount: resultRef.current.errors,
      });
    }
    window.setTimeout(showIntro, 2600);
  }, [startedAt, patientId, level, locale, rate, t, showIntro]);

  const onMatchFlip = useCallback(
    (index: number) => {
      if (matchLocked || phase !== "play") return;
      if (matchMatched[index]) return;
      if (matchFlipped.includes(index)) return;
      playTapFeedback();
      setTaps((v) => v + 1);
      resultRef.current.taps = taps + 1;

      const next = [...matchFlipped, index];
      setMatchFlipped(next);
      if (next.length === 2) {
        setMatchLocked(true);
        const [a, b] = next;
        if (cards[a].id === cards[b].id) {
          window.setTimeout(() => {
            playCorrect();
            speak(t("memoryMatch.match"), locale, rate);
            setMatchMatched((prev) => {
              const up = [...prev];
              up[a] = true;
              up[b] = true;
              const totalMatched = up.filter(Boolean).length;
              if (totalMatched === cards.length) {
                setTimeout(matchComplete, 500);
              }
              return up;
            });
            setMatchFlipped([]);
            setMatchLocked(false);
            setScore((s) => {
              const ns = s + 10;
              resultRef.current.score = ns;
              return ns;
            });
          }, 400);
        } else {
          playEncourage();
          setErrors((e) => {
            const ne = e + 1;
            resultRef.current.errors = ne;
            return ne;
          });
          speak(t("memoryMatch.mismatch"), locale, rate);
          window.setTimeout(() => {
            setMatchFlipped([]);
            setMatchLocked(false);
          }, 1000);
        }
      }
    },
    [
      matchLocked,
      phase,
      matchMatched,
      matchFlipped,
      cards,
      taps,
      locale,
      rate,
      t,
      matchComplete,
    ]
  );

  useEffect(() => {
    if (phase !== "preview" || !subGame) return;
    const id = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(id);
          stopSpeaking();
          playPress();
          setPhase("play");
          if (subGame === "memoryMatch") {
            speak(t("memoryMatch.find"), locale, rate);
          } else if (subGame === "whatChanged") {
            speak(t("whatChanged.find"), locale, rate);
          } else {
            speak(t("sequence.find"), locale, rate);
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, subGame]);

  // ─── WHAT CHANGED ──────────────────────────────────────────────────
  const onChangeTap = useCallback(
    (index: number) => {
      if (phase !== "play" || changeFeedback !== "idle") return;
      playTapFeedback();
      setTaps((v) => v + 1);
      resultRef.current.taps = taps + 1;
      if (index === changeChangedIndex) {
        setChangeFeedback("correct");
        playCorrect();
        setScore((s) => {
          const ns = s + 15;
          resultRef.current.score = ns;
          return ns;
        });
        speak(t("whatChanged.correct"), locale, rate);
        window.setTimeout(() => {
          playComplete();
          if (startedAt) {
            recordGameSession(patientId, {
              gameId: "memoryGarden",
              level,
              outcome: "completed",
              score: resultRef.current.score,
              startedAt,
              taps: resultRef.current.taps,
              errorCount: resultRef.current.errors,
            });
          }
          setPhase("play2");
          window.setTimeout(showIntro, 2600);
        }, 1400);
      } else {
        setChangeFeedback("wrong");
        setErrors((e) => {
          const ne = e + 1;
          resultRef.current.errors = ne;
          return ne;
        });
        playEncourage();
        speak(t("whatChanged.wrong"), locale, rate);
        window.setTimeout(() => setChangeFeedback("idle"), 1500);
      }
    },
    [
      phase,
      changeFeedback,
      changeChangedIndex,
      startedAt,
      patientId,
      level,
      taps,
      locale,
      rate,
      t,
      showIntro,
    ]
  );

  // ─── SEQUENCE ──────────────────────────────────────────────────────
  const onSequenceTap = useCallback(
    (index: number) => {
      if (phase !== "play" || sequenceFeedback !== "idle") return;
      playTapFeedback();
      setTaps((v) => v + 1);
      resultRef.current.taps = taps + 1;
      const current = sequenceIndex;
      const tapped = sequenceOptions[index];
      if (tapped.id === sequenceItems[current].id) {
        playCorrect();
        setScore((s) => {
          const ns = s + 5;
          resultRef.current.score = ns;
          return ns;
        });
        setSequenceFeedback("correct");
        speak(t("sequence.correct"), locale, rate);
        window.setTimeout(() => {
          setSequenceFeedback("idle");
          const next = current + 1;
          if (next >= sequenceItems.length) {
            playComplete();
            if (startedAt) {
              recordGameSession(patientId, {
                gameId: "memoryGarden",
                level,
                outcome: "completed",
                score: resultRef.current.score,
                startedAt,
                taps: resultRef.current.taps,
                errorCount: resultRef.current.errors,
              });
            }
            setPhase("play2");
            window.setTimeout(showIntro, 2600);
          } else {
            setSequenceIndex(next);
          }
        }, 600);
      } else {
        setSequenceFeedback("wrong");
        setErrors((e) => {
          const ne = e + 1;
          resultRef.current.errors = ne;
          return ne;
        });
        playEncourage();
        speak(t("sequence.wrong"), locale, rate);
        window.setTimeout(() => setSequenceFeedback("idle"), 1200);
      }
    },
    [
      phase,
      sequenceFeedback,
      sequenceIndex,
      sequenceOptions,
      sequenceItems,
      startedAt,
      patientId,
      level,
      taps,
      locale,
      rate,
      t,
      showIntro,
    ]
  );

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "memoryGarden",
    level,
    startedAt,
    taps,
    errorCount: errors,
  });

  if (loading)
    return (
      <GameShell title={t("title")} score={0}>
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title={t("title")} score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title={t("title")} score={score}>
      {/* ─── INTRO: MENU OF 3 SUB-GAMES ─── */}
      {phase === "intro" && (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-tea text-white shadow-[4px_4px_0px_#000]">
            <Brain className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {t("title")}
            </h2>
            <p className="max-w-md text-lg font-semibold text-ink-secondary leading-relaxed">
              {t("desc")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
            <button
              type="button"
              onClick={() => launch("memoryMatch")}
              className="btn-tactile flex flex-col items-center gap-2 rounded-2xl border-3 border-black bg-surface p-5 text-center shadow-[4px_4px_0px_#000] hover:bg-tea-light transition-transform active:translate-y-0.5 cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-tea text-white">
                <Brain className="h-6 w-6" />
              </div>
              <p className="font-serif text-lg font-black text-ink">
                {t("subgames.memoryMatch.name")}
              </p>
              <p className="text-base font-bold text-ink-secondary">
                {t("subgames.memoryMatch.desc")}
              </p>
            </button>

            <button
              type="button"
              onClick={() => launch("whatChanged")}
              className="btn-tactile flex flex-col items-center gap-2 rounded-2xl border-3 border-black bg-surface p-5 text-center shadow-[4px_4px_0px_#000] hover:bg-tea-light transition-transform active:translate-y-0.5 cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-marigold text-black">
                <ScanEye className="h-6 w-6" />
              </div>
              <p className="font-serif text-lg font-black text-ink">
                {t("subgames.whatChanged.name")}
              </p>
              <p className="text-base font-bold text-ink-secondary">
                {t("subgames.whatChanged.desc")}
              </p>
            </button>

            <button
              type="button"
              onClick={() => launch("sequence")}
              className="btn-tactile flex flex-col items-center gap-2 rounded-2xl border-3 border-black bg-surface p-5 text-center shadow-[4px_4px_0px_#000] hover:bg-tea-light transition-transform active:translate-y-0.5 cursor-pointer"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-black bg-clay text-white">
                <ListOrdered className="h-6 w-6" />
              </div>
              <p className="font-serif text-lg font-black text-ink">
                {t("subgames.sequence.name")}
              </p>
              <p className="text-base font-bold text-ink-secondary">
                {t("subgames.sequence.desc")}
              </p>
            </button>
          </div>
        </div>
      )}

      {/* ─── MEMORY MATCH ─── */}
      {subGame === "memoryMatch" && phase === "preview" && (
        <div className="flex flex-col items-center gap-5 py-6">
          <p className="font-serif text-2xl font-black text-ink">
            {t("memoryMatch.name")}
          </p>
          <p className="text-lg font-semibold text-ink-secondary max-w-md text-center">
            {t("memoryMatch.look")}
          </p>
          <AudioPrompt
            text={t("memoryMatch.look")}
            label={t("memoryMatch.look")}
            size="md"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md">
            {cards.map((card, i) => (
              <div
                key={i}
                className="aspect-square flex items-center justify-center rounded-2xl border-3 border-black bg-surface shadow-[4px_4px_0px_#000]"
              >
                {renderGardenIcon(card.id, "h-12 w-12")}
              </div>
            ))}
          </div>
          {countdown > 0 && (
            <p className="text-lg font-black text-tea">{countdown}s</p>
          )}
        </div>
      )}

      {subGame === "memoryMatch" && phase === "play" && (
        <div className="flex flex-col items-center gap-5 py-6">
          <p className="font-serif text-2xl font-black text-ink">
            {t("memoryMatch.find")}
          </p>
          <AudioPrompt
            text={t("memoryMatch.find")}
            label={t("memoryMatch.find")}
            size="md"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md">
            {cards.map((card, i) => {
              const flipped = matchFlipped.includes(i) || matchMatched[i];
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onMatchFlip(i)}
                  disabled={matchMatched[i] || matchLocked}
                  className={`aspect-square flex items-center justify-center rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] transition-transform btn-tactile ${
                    flipped
                      ? "bg-tea-light border-tea"
                      : "bg-surface hover:scale-[1.02] active:translate-y-0.5 cursor-pointer"
                  }`}
                >
                  {flipped ? (
                    renderGardenIcon(card.id, "h-12 w-12")
                  ) : (
                    <Flower2 className="h-10 w-10 text-rose-300" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── WHAT CHANGED ─── */}
      {subGame === "whatChanged" && phase === "preview" && (
        <div className="flex flex-col items-center gap-5 py-6">
          <p className="font-serif text-2xl font-black text-ink">
            {t("whatChanged.name")}
          </p>
          <p className="text-lg font-semibold text-ink-secondary max-w-md text-center">
            {t("whatChanged.look")}
          </p>
          <AudioPrompt
            text={t("whatChanged.look")}
            label={t("whatChanged.look")}
            size="md"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md">
            {changeGrid.map((item, i) => (
              <div
                key={i}
                className="aspect-square flex items-center justify-center rounded-2xl border-3 border-black bg-surface shadow-[4px_4px_0px_#000]"
              >
                {renderGardenIcon(item.id, "h-14 w-14")}
              </div>
            ))}
          </div>
          {countdown > 0 && (
            <p className="text-lg font-black text-tea">{countdown}s</p>
          )}
        </div>
      )}

      {subGame === "whatChanged" && phase === "play" && (
        <div className="flex flex-col items-center gap-5 py-6">
          <p className="font-serif text-2xl font-black text-ink">
            {t("whatChanged.find")}
          </p>
          <AudioPrompt
            text={t("whatChanged.find")}
            label={t("whatChanged.find")}
            size="md"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md">
            {changeGrid.map((item, i) => {
              const isChanged =
                changeFeedback === "correct" && i === changeChangedIndex;
              const isWrong =
                changeFeedback === "wrong" && i !== changeChangedIndex;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onChangeTap(i)}
                  disabled={changeFeedback !== "idle"}
                  className={`aspect-square flex items-center justify-center rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] transition-transform btn-tactile ${
                    isChanged
                      ? "bg-tea-light border-tea"
                      : isWrong
                      ? "bg-red-50 border-red-400"
                      : "bg-surface hover:scale-[1.02] active:translate-y-0.5 cursor-pointer"
                  }`}
                >
                  {renderGardenIcon(item.id, "h-14 w-14")}
                </button>
              );
            })}
          </div>
          {changeFeedback === "correct" && (
            <p className="flex items-center gap-2 text-base font-black text-tea">
              <CheckCircle2 className="h-5 w-5" /> {t("whatChanged.correct")}
            </p>
          )}
          {changeFeedback === "wrong" && (
            <p className="flex items-center gap-2 text-base font-black text-red-500">
              <XCircle className="h-5 w-5" /> {t("whatChanged.wrong")}
            </p>
          )}
        </div>
      )}

      {/* ─── SEQUENCE ─── */}
      {subGame === "sequence" && phase === "preview" && (
        <div className="flex flex-col items-center gap-5 py-6">
          <p className="font-serif text-2xl font-black text-ink">
            {t("sequence.name")}
          </p>
          <p className="text-lg font-semibold text-ink-secondary max-w-md text-center">
            {t("sequence.look")}
          </p>
          <AudioPrompt
            text={t("sequence.look")}
            label={t("sequence.look")}
            size="md"
          />
          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
            {sequenceItems.map((item, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-1 rounded-2xl border-3 border-black bg-surface px-5 py-4 shadow-[4px_4px_0px_#000]"
              >
                {renderGardenIcon(item.id, "h-12 w-12")}
                <span className="text-base font-black text-tea">{i + 1}</span>
              </div>
            ))}
          </div>
          {countdown > 0 && (
            <p className="text-lg font-black text-tea">{countdown}s</p>
          )}
        </div>
      )}

      {subGame === "sequence" && phase === "play" && (
        <div className="flex flex-col items-center gap-5 py-6">
          <p className="font-serif text-2xl font-black text-ink">
            {t("sequence.find")}
          </p>
          <AudioPrompt
            text={t("sequence.find")}
            label={t("sequence.find")}
            size="md"
          />
          <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
            {sequenceItems.map((_, i) => (
              <div
                key={i}
                className={`flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] ${
                  i < sequenceIndex
                    ? "bg-tea-light"
                    : "bg-surface text-tea"
                }`}
              >
                {i < sequenceIndex ? (
                  <Check className="h-8 w-8 text-emerald-700" />
                ) : (
                  <Leaf className="h-8 w-8 text-tea" />
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md">
            {sequenceOptions.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSequenceTap(i)}
                disabled={sequenceFeedback !== "idle"}
                className={`aspect-square flex items-center justify-center rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] transition-transform btn-tactile ${
                  sequenceFeedback === "wrong" &&
                  item.id === sequenceItems[sequenceIndex]?.id
                    ? "bg-tea-light border-tea ring-2 ring-tea"
                    : "bg-surface hover:scale-[1.02] active:translate-y-0.5 cursor-pointer"
                }`}
              >
                {renderGardenIcon(item.id, "h-12 w-12")}
              </button>
            ))}
          </div>
          {sequenceFeedback === "correct" && (
            <p className="flex items-center gap-2 text-base font-black text-tea">
              <CheckCircle2 className="h-5 w-5" /> {t("sequence.correct")}
            </p>
          )}
          {sequenceFeedback === "wrong" && (
            <p className="flex items-center gap-2 text-base font-black text-red-500">
              <XCircle className="h-5 w-5" /> {t("sequence.wrong")}
            </p>
          )}
        </div>
      )}

      {/* ─── BRIEF RESULT / RETURN ─── */}
      {phase === "play2" && (
        <Celebration icon={Leaf} title={
          score >= 40
            ? t("result.excellent")
            : score >= 15
            ? t("result.good")
            : t("result.tryAgain")
        }>
          <p className="text-lg font-semibold text-ink-secondary">
            {t("stats.score")}: {score}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
            <ChunkyButton variant="tea" size="xl" onClick={showIntro}>
              {t("playAgain")}
            </ChunkyButton>
            <Link
              href="/patient/games"
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-base font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
            >
              {t("backToHub")}
            </Link>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
