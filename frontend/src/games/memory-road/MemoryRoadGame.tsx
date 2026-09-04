"use client";

import { useCallback, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Route,
  Eye,
  HelpCircle,
  RotateCcw,
  ArrowRight,
  TrafficCone,
  Footprints,
  Octagon,
  Home,
  Building2,
  User,
  Store,
  Car,
  Bus,
  Bike,
  Trees,
  Clock,
  Check,
  Sparkles,
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

type Localized = Record<string, string>;

interface GameObject {
  id: string;
  type: "target" | "filler";
  name: Localized;
}

function renderRoadObjectIcon(id: string, className = "h-8 w-8") {
  switch (id) {
    case "traffic":
      return <TrafficCone className={`${className} text-amber-600`} />;
    case "zebra":
      return <Footprints className={`${className} text-stone-700`} />;
    case "stop":
      return <Octagon className={`${className} text-red-600`} />;
    case "home":
      return <Home className={`${className} text-amber-700`} />;
    case "hospital":
      return <Building2 className={`${className} text-blue-700`} />;
    case "person":
      return <User className={`${className} text-teal-700`} />;
    case "shop":
      return <Store className={`${className} text-emerald-700`} />;
    case "car":
      return <Car className={`${className} text-indigo-600`} />;
    case "bus":
      return <Bus className={`${className} text-yellow-600`} />;
    case "bicycle":
      return <Bike className={`${className} text-cyan-700`} />;
    case "tree":
      return <Trees className={`${className} text-emerald-700`} />;
    case "clock":
      return <Clock className={`${className} text-slate-700`} />;
    default:
      return <Route className={className} />;
  }
}

const OBJECTS: GameObject[] = [
  {
    id: "traffic",
    type: "target",
    name: {
      en: "Traffic Signal",
      hi: "ट्रैफिक सिग्नल",
      mr: "ट्रॅफिक सिग्नल",
      as: "ট্ৰেফিক লাইট",
      bn: "ট্রাফিক সিগন্যাল",
      ne: "ट्राफिक संकेत",
      mni: "ত্রাফিক খুদম",
      brx: "ट्राफिक सिनायथि",
      grt: "Traffic chin",
      kha: "Dak traffic",
      lus: "Traffic sign",
    },
  },
  {
    id: "zebra",
    type: "target",
    name: {
      en: "Zebra Crossing",
      hi: "ज़ेब्रा क्रॉसिंग",
      mr: "झेब्रा क्रॉसिंग",
      as: "জেব্ৰা ক্ৰছিং",
      bn: "জেব্রা ক্রসিং",
      ne: "जेब्रा क्रसिङ",
      mni: "জেব্রা ক্রসিং",
      brx: "जेब्रा क्रसिं",
      grt: "Zebra crossing",
      kha: "Zebra crossing",
      lus: "Zebra crossing",
    },
  },
  {
    id: "stop",
    type: "target",
    name: {
      en: "STOP Sign",
      hi: "स्टॉप साइन",
      mr: "स्टॉप चिन्ह",
      as: "ৰওক চিহ্ন",
      bn: "থামুন চিহ্ন",
      ne: "रोकिने चिन्ह",
      mni: "লেপ্নবা খুদম",
      brx: "थाथ' सिनायथि",
      grt: "STOP chin",
      kha: "Dak sangeh",
      lus: "STOP hriatna",
    },
  },
  {
    id: "home",
    type: "target",
    name: {
      en: "Home",
      hi: "घर",
      mr: "घर",
      as: "ঘৰ",
      bn: "বাড়ি",
      ne: "घर",
      mni: "য়ুম",
      brx: "न",
      grt: "Nok",
      kha: "Iing",
      lus: "In",
    },
  },
  {
    id: "hospital",
    type: "target",
    name: {
      en: "Hospital",
      hi: "अस्पताल",
      mr: "रुग्णालय",
      as: "চিকিৎসালয়",
      bn: "হাসপাতাল",
      ne: "अस्पताल",
      mni: "হাস্পাতাল",
      brx: "देहा फाहामसालि",
      grt: "Hospital",
      kha: "Hospital",
      lus: "Damdawi in",
    },
  },
  {
    id: "person",
    type: "target",
    name: {
      en: "Person",
      hi: "व्यक्ति",
      mr: "व्यक्ती",
      as: "পথচাৰী",
      bn: "পথচারী",
      ne: "पैदलयात्री",
      mni: "মীওই",
      brx: "सुबुं",
      grt: "Mandegipa",
      kha: "Nongiaid kjat",
      lus: "Mihring",
    },
  },
  {
    id: "shop",
    type: "target",
    name: {
      en: "Shop",
      hi: "दुकान",
      mr: "दुकान",
      as: "দোকান",
      bn: "দোকান",
      ne: "पसल",
      mni: "দোকান",
      brx: "दुकान",
      grt: "Dokan",
      kha: "Dukan",
      lus: "Dawr",
    },
  },
  {
    id: "car",
    type: "filler",
    name: {
      en: "Car",
      hi: "गाड़ी",
      mr: "गाडी",
      as: "গাড়ী",
      bn: "গাড়ি",
      ne: "गाडी",
      mni: "গাড়ী",
      brx: "गाडी",
      grt: "Gari",
      kha: "Kali",
      lus: "Car",
    },
  },
  {
    id: "bus",
    type: "filler",
    name: {
      en: "Bus",
      hi: "बस",
      mr: "बस",
      as: "বাছ",
      bn: "বাস",
      ne: "बस",
      mni: "বাস",
      brx: "बास",
      grt: "Bas",
      kha: "Bas",
      lus: "Bus",
    },
  },
  {
    id: "bicycle",
    type: "filler",
    name: {
      en: "Bicycle",
      hi: "साइकिल",
      mr: "सायकल",
      as: "চাইকেল",
      bn: "সাইকেল",
      ne: "साइकल",
      mni: "সাইকেল",
      brx: "साइकेल",
      grt: "Cycle",
      kha: "Sna-kali",
      lus: "Thir-leng",
    },
  },
  {
    id: "tree",
    type: "filler",
    name: {
      en: "Tree",
      hi: "पेड़",
      mr: "झाड",
      as: "গছ",
      bn: "গাছ",
      ne: "रूख",
      mni: "উ",
      brx: "बिफां",
      grt: "Bol",
      kha: "Dieng",
      lus: "Thingkung",
    },
  },
  {
    id: "clock",
    type: "filler",
    name: {
      en: "Clock",
      hi: "घड़ी",
      mr: "घडी",
      as: "ঘড়ী",
      bn: "ঘড়ি",
      ne: "घडी",
      mni: "পুং",
      brx: "घडी",
      grt: "Ghodi",
      kha: "Baje",
      lus: "Sana",
    },
  },
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
// Reset counter on module reload to avoid stale IDs
if (typeof window !== "undefined") {
  tileUidCounter = 0;
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

  const localeKey = locale ?? "en";

  const levelConfig = LEVELS[currentLevelIdx];
  const targetObj = OBJECTS.find((o) => o.id === levelConfig.targetId)!;

  const gridCols =
    levelConfig.gridSize <= 9 ? 2 : levelConfig.gridSize <= 12 ? 3 : 4;

  const localizedName = useCallback(
    (obj: GameObject) => (obj.name as Record<string, string>)[localeKey] ?? obj.name.en,
    [localeKey]
  );

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
    speak(`${t("instruction")} ${(targetObj.name as Record<string, string>)[localeKey] ?? targetObj.name.en}`, locale, rate);
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
    (tileUid: string) => {
      if (phase !== "playing") return;
      playTapFeedback();
      setTaps((prev) => prev + 1);

      setTiles((prev) => {
        const next = [...prev];
        const idx = next.findIndex((t) => t.uid === tileUid);
        if (idx === -1) return prev;

        const tile = next[idx];
        if (tile.found) return prev;

        if (tile.object.id === levelConfig.targetId) {
          playCorrect();
          next[idx] = { ...tile, found: true };
          const newFound = foundCount + 1;
          setFoundCount(newFound);
          setScore((s) => s + 25);
          speak(t("found"), locale, rate);

          if (newFound >= levelConfig.count) {
            setTimeout(completeLevel, 600);
          }
        } else {
          playEncourage();
          setErrors((e) => e + 1);
          speak(t("wrong"), locale, rate);
          next[idx] = { ...tile, wrongFlash: true };
          setTimeout(() => {
            setTiles((current) =>
              current.map((t) => (t.uid === tileUid ? { ...t, wrongFlash: false } : t))
            );
          }, 600);
        }
        return next;
      });
    },
    [phase, foundCount, levelConfig, completeLevel, locale, rate, t]
  );

  const nextLevel = useCallback(() => {
    playPress();
    const nextIdx = currentLevelIdx + 1;
    const config = LEVELS[nextIdx];
    setCurrentLevelIdx(nextIdx);
    setTiles(buildBoard(config));
    setFoundCount(0);
    setHintUsed(false);
    setPhase("playing");
    const nextTarget = OBJECTS.find((o) => o.id === config.targetId)!;
    stopSpeaking();
    speak(`${t("instruction")} ${(nextTarget.name as Record<string, string>)[localeKey] ?? nextTarget.name.en}`, locale, rate);
  }, [currentLevelIdx, locale, rate, t, localeKey]);

  const showHint = useCallback(() => {
    playPress();
    setHintUsed(true);
    speak(t("hint", { target: localizedName(targetObj) }), locale, rate);
  }, [targetObj, locale, rate, t, localizedName]);

  const restartGame = useCallback(() => {
    playPress();
    setPhase("intro");
    setTiles([]);
    setScore(0);
    setFoundCount(0);
    setCurrentLevelIdx(0);
    setHintUsed(false);
    setStartedAt(null);
    setTaps(0);
    setErrors(0);
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
      {/* ─── INTRO ─── */}
      {phase === "intro" && (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-tea text-white shadow-[4px_4px_0px_#000]">
            <Route className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {t("title")}
            </h2>
            <p className="max-w-md text-lg font-semibold text-ink-secondary leading-relaxed">
              {t("desc")}
            </p>
          </div>

          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="text-base font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5" /> {t("welcome")}
              </span>
              <span className="text-[10px] font-black uppercase rounded bg-tea text-white px-2 py-0.5">
                Level {levelConfig.level} of {LEVELS.length}
              </span>
            </div>
            <p className="text-base font-bold text-ink-secondary leading-relaxed">
              {t("instruction")} <strong>{localizedName(targetObj)}</strong>
            </p>
          </div>

          <AudioPrompt
            text={`${t("instruction")} ${localizedName(targetObj)}`}
            label={t("welcome")}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startGame}>
            {t("startBtn")}
          </ChunkyButton>
        </div>
      )}

      {/* ─── PLAYING ─── */}
      {phase === "playing" && (
        <div className="flex flex-col items-center gap-4 py-2">
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-4 py-2.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/5">
                {renderRoadObjectIcon(targetObj.id, "h-5 w-5")}
              </div>
              <span className="text-base font-black text-ink">
                Find: <strong className="text-tea">{localizedName(targetObj)}</strong>
              </span>
            </div>
            <span className="text-base font-black text-ink">
              {foundCount} / {levelConfig.count}
            </span>
          </div>

          <div
            className={`grid gap-3 w-full max-w-md ${
              gridCols === 2
                ? "grid-cols-2"
                : gridCols === 3
                ? "grid-cols-3"
                : "grid-cols-4"
            }`}
          >
            {tiles.map((tile) => (
              <button
                key={tile.uid}
                type="button"
                disabled={tile.found}
                onClick={() => tapTile(tile.uid)}
                className={`btn-tactile aspect-square flex items-center justify-center rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer disabled:opacity-50 ${
                  tile.found
                    ? "bg-tea-light border-tea ring-2 ring-tea"
                    : tile.wrongFlash
                    ? "bg-red-100 border-red-500 animate-shake"
                    : "bg-surface hover:bg-tea-light/40"
                }`}
              >
                {tile.found ? (
                  <Check className="h-10 w-10 text-emerald-700" />
                ) : (
                  renderRoadObjectIcon(tile.object.id, "h-10 w-10")
                )}
              </button>
            ))}
          </div>

          {!hintUsed && (
            <button
              type="button"
              onClick={showHint}
              className="flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-4 py-2 text-base font-black text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
            >
              <HelpCircle className="h-4 w-4" />
              {t("hintBtn")}
            </button>
          )}
        </div>
      )}

      {/* ─── LEVEL DONE ─── */}
      {phase === "levelDone" && (
        <div className="flex flex-col items-center gap-5 py-12 text-center">
          <Sparkles className="h-16 w-16 text-amber-500 animate-bounce" />
          <h3 className="font-serif text-3xl font-black text-ink">
            {t("levelComplete")}
          </h3>
          <p className="text-lg font-semibold text-ink-secondary">
            {t("found")} {levelConfig.count} {localizedName(targetObj)}!
          </p>

          <ChunkyButton variant="tea" size="xl" onClick={nextLevel}>
            <span className="flex items-center gap-2">
              <span>{t("nextLevel")}</span>
              <ArrowRight className="h-5 w-5" />
            </span>
          </ChunkyButton>
        </div>
      )}

      {/* ─── GAME DONE ─── */}
      {phase === "gameDone" && (
        <Celebration
          title={t("gameComplete")}
          subtitle={t("desc")}
          xpEarned={score}
          accuracy={`${Math.max(0, 100 - errors * 10)}%`}
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-center w-full">
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
