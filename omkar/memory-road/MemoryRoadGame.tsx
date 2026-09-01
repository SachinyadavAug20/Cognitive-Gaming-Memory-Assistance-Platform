"use client";

import { useCallback, useState, useMemo } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  Route,
  Eye,
  HelpCircle,
  RotateCcw,
  ArrowRight,
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

type Localized = { en: string; hi: string; mr: string };

interface GameObject {
  id: string;
  type: "target" | "filler";
  emoji: string;
  name: Localized;
}

const OBJECTS: GameObject[] = [
  { id: "traffic", type: "target", emoji: "🚦", name: { en: "Traffic Signal", hi: "ट्रैफिक सिग्नल", mr: "ट्रॅफिक सिग्नल" } },
  { id: "zebra", type: "target", emoji: "🚸", name: { en: "Zebra Crossing", hi: "ज़ेब्रा क्रॉसिंग", mr: "झेब्रा क्रॉसिंग" } },
  { id: "stop", type: "target", emoji: "🛑", name: { en: "STOP Sign", hi: "स्टॉप साइन", mr: "स्टॉप चिन्ह" } },
  { id: "home", type: "target", emoji: "🏠", name: { en: "Home", hi: "घर", mr: "घर" } },
  { id: "hospital", type: "target", emoji: "🏥", name: { en: "Hospital", hi: "अस्पताल", mr: "रुग्णालय" } },
  { id: "person", type: "target", emoji: "🧍", name: { en: "Person", hi: "व्यक्ति", mr: "व्यक्ती" } },
  { id: "shop", type: "target", emoji: "🏪", name: { en: "Shop", hi: "दुकान", mr: "दुकान" } },
  { id: "car", type: "filler", emoji: "🚗", name: { en: "Car", hi: "गाड़ी", mr: "गाडी" } },
  { id: "bus", type: "filler", emoji: "🚌", name: { en: "Bus", hi: "बस", mr: "बस" } },
  { id: "bicycle", type: "filler", emoji: "🚲", name: { en: "Bicycle", hi: "साइकिल", mr: "सायकल" } },
  { id: "tree", type: "filler", emoji: "🌳", name: { en: "Tree", hi: "पेड़", mr: "झाड" } },
  { id: "clock", type: "filler", emoji: "🕐", name: { en: "Clock", hi: "घड़ी", mr: "घडी" } },
];

const LEVELS = [
  { level: 1, targetId: "traffic", targetName: "Traffic Signal", count: 2, gridSize: 9 },
  { level: 2, targetId: "traffic", targetName: "Traffic Signal", count: 3, gridSize: 12 },
  { level: 3, targetId: "zebra", targetName: "Zebra Crossing", count: 3, gridSize: 12 },
  { level: 4, targetId: "stop", targetName: "STOP Sign", count: 3, gridSize: 12 },
  { level: 5, targetId: "home", targetName: "Home", count: 3, gridSize: 12 },
  { level: 6, targetId: "hospital", targetName: "Hospital", count: 4, gridSize: 16 },
  { level: 7, targetId: "person", targetName: "Person", count: 4, gridSize: 16 },
  { level: 8, targetId: "shop", targetName: "Shop", count: 5, gridSize: 16 },
];

interface Tile {
  uid: string;
  object: GameObject;
  found: boolean;
  wrongFlash: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let tileUidCounter = 0;
function nextTileUid(): string {
  return `tile-${++tileUidCounter}`;
}

function buildBoard(levelConfig: (typeof LEVELS)[number]): Tile[] {
  const targetObj = OBJECTS.find((o) => o.id === levelConfig.targetId)!;
  const fillers = OBJECTS.filter((o) => o.type === "filler");

  const tiles: Tile[] = [];

  for (let i = 0; i < levelConfig.count; i++) {
    tiles.push({ uid: nextTileUid(), object: targetObj, found: false, wrongFlash: false });
  }

  const fillerCount = levelConfig.gridSize - levelConfig.count;
  const selectedFillers: GameObject[] = [];
  const shuffledFillers = shuffle(fillers);
  for (let i = 0; i < fillerCount; i++) {
    selectedFillers.push(shuffledFillers[i % shuffledFillers.length]);
  }
  for (const f of selectedFillers) {
    tiles.push({ uid: nextTileUid(), object: f, found: false, wrongFlash: false });
  }

  return shuffle(tiles);
}

export function MemoryRoadGame() {
  const locale = useLocale();
  const t = useTranslations("games.memoryRoad");
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "memoryRoad", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "playing" | "levelDone" | "gameDone">("intro");
  const [currentLevelIdx, setCurrentLevelIdx] = useState(0);
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [score, setScore] = useState(0);
  const [foundCount, setFoundCount] = useState(0);
  const [hintUsed, setHintUsed] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [taps, setTaps] = useState(0);
  const [errors, setErrors] = useState(0);

  const localeKey = locale === "hi" || locale === "mr" ? locale : "en";

  const levelConfig = LEVELS[currentLevelIdx];
  const targetObj = OBJECTS.find((o) => o.id === levelConfig.targetId)!;

  const gridCols =
    levelConfig.gridSize <= 9 ? 2 : levelConfig.gridSize <= 12 ? 3 : 4;

  const localizedName = (obj: GameObject) => obj.name[localeKey] ?? obj.name.en;

  const startGame = useCallback(() => {
    playPress();
    const config = LEVELS[0];
    setTiles(buildBoard(config));
    setFoundCount(0);
    setCurrentLevelIdx(0);
    setScore(0);
    setErrors(0);
    setTaps(0);
    setHintUsed(false);
    setStartedAt(new Date().toISOString());
    setPhase("playing");
    stopSpeaking();
    speak(`${t("instruction")} ${targetObj.name[localeKey] ?? targetObj.name.en}`, locale, rate);
  }, [locale, rate, t, targetObj, localeKey]);

  const completeLevel = useCallback(() => {
    playComplete();
    setScore((s) => s + 100);
    stopSpeaking();
    speak(t("levelComplete"), locale, rate);

    if (currentLevelIdx >= LEVELS.length - 1) {
      if (startedAt) {
        recordGameSession(patientId, {
          gameId: "memoryRoad",
          level: levelConfig.level,
          outcome: "completed",
          score: score + foundCount * 25 + 100,
          startedAt,
          taps,
          errorCount: errors,
        });
      }
      setPhase("gameDone");
    } else {
      setPhase("levelDone");
    }
  }, [currentLevelIdx, score, foundCount, startedAt, patientId, levelConfig.level, taps, errors, locale, rate, t]);

  const tapTile = useCallback(
    (uid: string) => {
      playTapFeedback();
      setTaps((t) => t + 1);

      setTiles((prev) => {
        const idx = prev.findIndex((tile) => tile.uid === uid);
        if (idx === -1) return prev;
        const tile = prev[idx];
        if (tile.found || tile.wrongFlash) return prev;

        if (tile.object.type === "target") {
          playCorrect();
          speak(`${t("correct")} ${localizedName(tile.object)}`, locale, rate);
          const updated = [...prev];
          updated[idx] = { ...tile, found: true };
          const newFoundCount = foundCount + 1;
          setFoundCount(newFoundCount);
          setScore((s) => s + 25);

          if (newFoundCount >= levelConfig.count) {
            setTimeout(() => completeLevel(), 800);
          }
          return updated;
        } else {
          playEncourage();
          speak(t("wrong"), locale, rate);
          setErrors((e) => e + 1);
          const updated = [...prev];
          updated[idx] = { ...tile, wrongFlash: true };
          setTimeout(() => {
            setTiles((p) => p.map((t) => (t.uid === uid ? { ...t, wrongFlash: false } : t)));
          }, 450);
          return updated;
        }
      });
    },
    [foundCount, completeLevel, locale, rate, t, levelConfig.count, localizedName]
  );

  const useHint = useCallback(() => {
    playPress();
    setHintUsed(true);
    const unfoundTarget = tiles.find((tile) => tile.object.type === "target" && !tile.found);
    if (unfoundTarget) {
      speak(`${t("hint")} ${localizedName(unfoundTarget.object)}`, locale, rate);
    }
  }, [tiles, locale, rate, t, localizedName]);

  const nextLevel = useCallback(() => {
    playPress();
    const nextIdx = currentLevelIdx + 1;
    const config = LEVELS[nextIdx];
    setCurrentLevelIdx(nextIdx);
    setTiles(buildBoard(config));
    setFoundCount(0);
    setHintUsed(false);
    setPhase("playing");
    stopSpeaking();
    speak(`${t("instruction")} ${config.targetName}`, locale, rate);
  }, [currentLevelIdx, locale, rate, t]);

  const restartGame = useCallback(() => {
    playPress();
    setPhase("intro");
    setTiles([]);
    setCurrentLevelIdx(0);
    setScore(0);
    setFoundCount(0);
    setHintUsed(false);
    setStartedAt(null);
    setTaps(0);
    setErrors(0);
    stopSpeaking();
  }, []);

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "memoryRoad",
    level,
    startedAt,
    taps,
    errorCount: errors,
  });

  if (loading)
    return (
      <GameShell title="Memory Road 95" score={0}>
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title="Memory Road 95" score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title="Memory Road 95" score={score}>
      {/* ─── INTRO ─── */}
      {phase === "intro" && (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-tea text-white shadow-[4px_4px_0px_#000]">
            <Route className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              Memory Road 95
            </h2>
            <p className="max-w-md text-lg font-semibold text-ink-secondary leading-relaxed">
              {t("welcome")}
            </p>
          </div>

          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="text-base font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> {t("welcome")}
              </span>
              <span className="text-[10px] font-black uppercase rounded bg-tea text-white px-2 py-0.5">
                {t("level")} 1/{LEVELS.length}
              </span>
            </div>
            <p className="text-base font-bold text-ink-secondary leading-relaxed">
              {t("instruction")}
            </p>
          </div>

          <AudioPrompt
            text={t("instruction")}
            label={t("welcome")}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startGame}>
            {t("found")}
          </ChunkyButton>
        </div>
      )}

      {/* ─── PLAYING ─── */}
      {phase === "playing" && (
        <div className="flex flex-col items-center gap-4 sm:gap-5 py-1">
          <div className="w-full max-w-2xl rounded-2xl border-3 border-black bg-surface p-4 sm:p-5 shadow-[4px_4px_0px_#000]">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black pb-2 mb-3">
              <span className="text-base sm:text-lg font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                <Eye className="h-4 w-4 sm:h-5 sm:w-5" /> {t("level")} {levelConfig.level}{" "}
                <span className="ml-1 text-base font-bold text-ink/50 normal-case">
                  / {LEVELS.length}
                </span>
              </span>
              <span className="text-base sm:text-lg font-black text-ink">
                {t("found")}: <strong className="text-tea">{foundCount}/{levelConfig.count}</strong>
              </span>
            </div>
            <div className="rounded-xl border-2 border-black bg-tea/10 px-3 py-3 sm:py-4 flex items-center justify-center gap-3 sm:gap-4">
              <span className="text-5xl sm:text-6xl drop-shadow-sm">{targetObj.emoji}</span>
              <div className="text-left">
                <p className="text-sm sm:text-base font-black uppercase tracking-wider text-tea">
                  {t("find")}
                </p>
                <p className="text-2xl sm:text-3xl font-black text-ink leading-tight">
                  {localizedName(targetObj)}
                </p>
              </div>
            </div>
          </div>

          <div
            className="grid gap-3 sm:gap-4 w-full max-w-2xl"
            style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
          >
            {tiles.map((tile) => {
              let tileBg = "bg-surface";
              let tileBorder = "border-black";
              let tileShadow = "shadow-[4px_4px_0px_#000]";
              let animationClass = "";
              const tileText =
                gridCols >= 4
                  ? "text-3xl sm:text-4xl"
                  : gridCols === 3
                  ? "text-4xl sm:text-5xl"
                  : "text-5xl sm:text-6xl";

              if (tile.found) {
                tileBg = "bg-green-200";
                tileBorder = "border-green-600";
                tileShadow = "shadow-[4px_4px_0px_#16a34a]";
              } else if (tile.wrongFlash) {
                tileBg = "bg-red-200";
                tileBorder = "border-red-500";
                tileShadow = "shadow-[4px_4px_0px_#dc2626]";
              }

              if (hintUsed && tile.object.type === "target" && !tile.found) {
                animationClass = "animate-pulse";
              }

              return (
                <button
                  key={tile.uid}
                  type="button"
                  onClick={() => tapTile(tile.uid)}
                  disabled={tile.found}
                  className={`btn-tactile flex items-center justify-center rounded-2xl border-3 ${tileBorder} ${tileBg} ${tileShadow} aspect-square ${tileText} transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#000] active:translate-y-0.5 active:shadow-none cursor-pointer disabled:cursor-default disabled:opacity-90 ${animationClass}`}
                >
                  {tile.found ? (
                    <span className="relative flex items-center justify-center">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-30" />
                      <span className="relative">{tile.object.emoji}</span>
                    </span>
                  ) : (
                    <span>{tile.object.emoji}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full max-w-2xl">
            {!hintUsed && (
              <button
                type="button"
                onClick={useHint}
                className="btn-tactile flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-4 sm:px-5 py-2.5 sm:py-3 text-base sm:text-lg font-black text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
              >
                <HelpCircle className="h-5 w-5" />
                {t("hint")}
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                playPress();
                const config = LEVELS[currentLevelIdx];
                setTiles(buildBoard(config));
                setFoundCount(0);
                setHintUsed(false);
              }}
              className="btn-tactile flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-4 sm:px-5 py-2.5 sm:py-3 text-base sm:text-lg font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted transition-transform active:translate-y-0.5 cursor-pointer ml-auto"
            >
              <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5" />
              {t("playAgain")}
            </button>
          </div>
        </div>
      )}

      {/* ─── LEVEL DONE ─── */}
      {phase === "levelDone" && (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-green-200 text-green-700 shadow-[4px_4px_0px_#000]">
            <span className="text-4xl">✓</span>
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-black text-ink">
              {t("levelComplete")}
            </h2>
            <p className="text-lg font-semibold text-ink-secondary">
              {t("level")} {levelConfig.level} {t("complete")}
            </p>
          </div>

          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <div className="space-y-2 text-base font-black text-ink">
              <div className="flex justify-between">
                <span>{t("level")}</span>
                <span className="text-tea">{levelConfig.level}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("score")}</span>
                <span className="text-tea">{score}</span>
              </div>
              <div className="flex justify-between border-t-2 border-black/10 pt-2">
                <span>{t("found")}</span>
                <span className="text-green-600">{levelConfig.count}/{levelConfig.count}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <ChunkyButton variant="tea" size="xl" onClick={nextLevel}>
              <span className="flex items-center gap-2">
                {t("nextLevel")} <ArrowRight className="h-4 w-4" />
              </span>
            </ChunkyButton>
            <button
              type="button"
              onClick={restartGame}
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-base font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" /> {t("playAgain")}
            </button>
          </div>
        </div>
      )}

      {/* ─── GAME DONE ─── */}
      {phase === "gameDone" && (
        <Celebration
          title={t("complete")}
          subtitle={t("welcome")}
          xpEarned={score}
          accuracy={`${Math.max(0, 100 - errors * 5)}%`}
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-base font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                  <Route className="h-4 w-4" /> Memory Road 95
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-tea text-white px-2 py-0.5">
                  {LEVELS.length} {t("level")}
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                {t("complete")}
              </h3>

              <div className="mt-3 space-y-1.5 border-t border-black/10 pt-2">
                {LEVELS.map((lv) => (
                  <div
                    key={lv.level}
                    className="flex items-center justify-between text-base font-black text-ink"
                  >
                    <span>
                      {OBJECTS.find((o) => o.id === lv.targetId)?.emoji}{" "}
                      {t("level")} {lv.level}
                    </span>
                    <span className="text-green-600">✓</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <span className="text-lg font-black text-tea">
                  {t("score")}: {score}
                </span>
                <span className="text-base font-bold text-ink-secondary">
                  {t("complete")}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={restartGame}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> {t("playAgain")}
                </span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-base font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
              >
                ← {t("backToHub")}
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
