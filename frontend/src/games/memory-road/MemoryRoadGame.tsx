"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Check,
  Sparkles,
  Volume2,
  MapPin,
  Footprints,
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
import {
  calculateVanishingCue,
  type ScaffoldingIntensity,
} from "@/lib/errorlessLearning";

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
    <section className="pb-12 min-h-screen bg-canvas">
      <GameHeader
        title={title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-[#9D246C]"
        gameId="memory-road"
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
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  labelColor: string;
}

/* ─── Culturally Relevant NE India Objects ─── */
const OBJECTS: GameObject[] = [
  {
    id: "temple",
    type: "target",
    name: {
      en: "Temple",
      hi: "मंदिर",
      mr: "मंदिर",
      as: "মন্দিৰ",
      bn: "মন্দির",
      ne: "मन्दिर",
      mni: "শীব মন্দিপ",
      brx: "मन्दिर",
      grt: "Monjir",
      kha: "Iing sad",
      lus: "In sihna",
    },
    emoji: "🛕",
    color: "text-orange-700",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-400",
    labelColor: "text-orange-800",
  },
  {
    id: "church",
    type: "target",
    name: {
      en: "Church",
      hi: "चर्च",
      mr: "चर्च",
      as: "গিৰ্জাঘৰ",
      bn: "গির্জাঘর",
      ne: "गिर्जाघर",
      mni: "চৰ্চ",
      brx: "चर्च",
      grt: "Church",
      kha: "Jingtylleng",
      lus: "Cristian Kumman",
    },
    emoji: "⛪",
    color: "text-purple-700",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-400",
    labelColor: "text-purple-800",
  },
  {
    id: "tea_garden",
    type: "target",
    name: {
      en: "Tea Garden",
      hi: "चाय बागान",
      mr: "चहातील बाग",
      as: "চাহ বাগিচা",
      bn: "চা বাগান",
      ne: "चिया बगैंचा",
      mni: "চাহ বাগিচা",
      brx: "चाह बगैंचा",
      grt: "Chah bagicha",
      kha: "Khleit dieng",
      lus: "Chen thuh khawm",
    },
    emoji: "🍵",
    color: "text-emerald-700",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-400",
    labelColor: "text-emerald-800",
  },
  {
    id: "hand_pump",
    type: "target",
    name: {
      en: "Hand Pump",
      hi: "हैंड पंप",
      mr: "हँड पंप",
      as: "হেণ্ড পাম্প",
      bn: "হ্যান্ড পাম্প",
      ne: "ह्यान्ड पम्प",
      mni: "হেণ্ড পাম্প",
      brx: "ह्यान्ड पम्प",
      grt: "Hand pump",
      kha: "Tyrpniap",
      lus: "Hand pump",
    },
    emoji: "🚰",
    color: "text-blue-700",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-400",
    labelColor: "text-blue-800",
  },
  {
    id: "bamboo_bridge",
    type: "target",
    name: {
      en: "Bamboo Bridge",
      hi: "बांस का पुल",
      mr: "बांसाचा पूल",
      as: "বেঁচা পুল",
      bn: "বাঁশের পুল",
      ne: "बाँसको पुल",
      mni: "বাঁশ পুল",
      brx: "बाँस पुल",
      grt: "Baans pul",
      kha: "Jingsngew tam",
      lus: "Vawng zawng",
    },
    emoji: "🌉",
    color: "text-yellow-700",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-400",
    labelColor: "text-yellow-800",
  },
  {
    id: "market",
    type: "target",
    name: {
      en: "Village Market",
      hi: "गाँव की मंडी",
      mr: "गावाची बाजारपेठ",
      as: "গাঁওৰ বজাৰ",
      bn: "গ্রামের বাজার",
      ne: "गाउँको बजार",
      mni: "গাঁওগী শিল",
      brx: "गाँव बजार",
      grt: "Gaon bazaar",
      kha: "Iing stad",
      lus: "Zawngkai",
    },
    emoji: "🏪",
    color: "text-rose-700",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-400",
    labelColor: "text-rose-800",
  },
  {
    id: "school",
    type: "target",
    name: {
      en: "School",
      hi: "स्कूल",
      mr: "शाळा",
      as: "স্কুল",
      bn: "স্কুল",
      ne: "विद्यालय",
      mni: "স্কুল",
      brx: "स्कुल",
      grt: "School",
      kha: "Iing pylleit",
      lus: "Primary school",
    },
    emoji: "🏫",
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-400",
    labelColor: "text-indigo-800",
  },
  {
    id: "auto",
    type: "target",
    name: {
      en: "Auto Rickshaw",
      hi: "ऑटो रिक्शा",
      mr: "ऑटो रिक्शा",
      as: "অটো ৰিক্সা",
      bn: "অটো রিকশা",
      ne: "अटो रिक्सा",
      mni: "অটো ৰিক্সা",
      brx: "अटो रिक्सा",
      grt: "Auto ricksha",
      kha: "Ka ryksa",
      lus: "Auto",
    },
    emoji: "🛺",
    color: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-400",
    labelColor: "text-amber-800",
  },
  /* ─── Filler Items (familiar but not the target) ─── */
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
    emoji: "🌳",
    color: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-300",
    labelColor: "text-green-700",
  },
  {
    id: "cow",
    type: "filler",
    name: {
      en: "Cow",
      hi: "गाय",
      mr: "गाय",
      as: "গাই",
      bn: "গরু",
      ne: "गाई",
      mni: "গাই",
      brx: "गाइ",
      grt: "Gai",
      kha: "Kyrtieng",
      lus: "Sang",
    },
    emoji: "🐄",
    color: "text-stone-700",
    bgColor: "bg-stone-50",
    borderColor: "border-stone-300",
    labelColor: "text-stone-700",
  },
  {
    id: "flower",
    type: "filler",
    name: {
      en: "Flower",
      hi: "फूल",
      mr: "फूल",
      as: "ফুল",
      bn: "ফুল",
      ne: "फूल",
      mni: "শিরৈ",
      brx: "फुल",
      grt: "Phul",
      kha: "Dienglias",
      lus: "Pawl",
    },
    emoji: "🌸",
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    borderColor: "border-pink-300",
    labelColor: "text-pink-700",
  },
  {
    id: "bird",
    type: "filler",
    name: {
      en: "Bird",
      hi: "पक्षी",
      mr: "पक्षी",
      as: "চাই চৰাই",
      bn: "পাখি",
      ne: "चरा",
      mni: "চৰা",
      brx: "चरा",
      grt: "Chara",
      kha: "Synrang",
      lus: "Phaichhah",
    },
    emoji: "🐦",
    color: "text-sky-600",
    bgColor: "bg-sky-50",
    borderColor: "border-sky-300",
    labelColor: "text-sky-700",
  },
  {
    id: "mountain",
    type: "filler",
    name: {
      en: "Mountain",
      hi: "पहाड़",
      mr: "डोंगर",
      as: "পাহাৰ",
      bn: "পাহাড়",
      ne: "हिमाल",
      mni: "লাং",
      brx: "रिं बर",
      grt: "Ri",
      kha: "Dieng",
      lus: "Tlang",
    },
    emoji: "⛰️",
    color: "text-slate-600",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-300",
    labelColor: "text-slate-700",
  },
  {
    id: "sun",
    type: "filler",
    name: {
      en: "Sun",
      hi: "सूरज",
      mr: "सूर्य",
      as: "ৰুই পোৱা",
      bn: "সূর্য",
      ne: "सूर्य",
      mni: "নু",
      brx: "सूर्य",
      grt: "Suja",
      kha: "Batong",
      lus: "Tla",
    },
    emoji: "☀️",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-300",
    labelColor: "text-yellow-700",
  },
];

const LEVELS = [
  {
    level: 1,
    targetId: "temple",
    targetName: "Temple",
    story: { en: "Amma needs to find the Temple for morning prayer.", hi: "अम्मा को सुबह की प्रार्थना के लिए मंदिर ढूंढना है।" },
    count: 2,
    gridSize: 6,
  },
  {
    level: 2,
    targetId: "tea_garden",
    targetName: "Tea Garden",
    story: { en: "Baba wants to visit the Tea Garden today.", hi: "बाबा आज चाय बागान जाना चाहते हैं।" },
    count: 3,
    gridSize: 9,
  },
  {
    level: 3,
    targetId: "hand_pump",
    targetName: "Hand Pump",
    story: { en: "The Hand Pump near the banyan tree has clean water.", hi: "बरगद के पास वाले हैंड पंप में साफ पानी है।" },
    count: 3,
    gridSize: 9,
  },
  {
    level: 4,
    targetId: "bamboo_bridge",
    targetName: "Bamboo Bridge",
    story: { en: "To cross the river, find the Bamboo Bridge.", hi: "नदी पार करने के लिए बांस का पुल ढूंढें।" },
    count: 3,
    gridSize: 12,
  },
  {
    level: 5,
    targetId: "market",
    targetName: "Village Market",
    story: { en: "It is market day! Find the Village Market.", hi: "आज बाजार का दिन है! गाँव की मंडी ढूंढें।" },
    count: 3,
    gridSize: 12,
  },
  {
    level: 6,
    targetId: "church",
    targetName: "Church",
    story: { en: "Sunday service begins soon. Find the Church.", hi: "रविवार की सेवा जल्द शुरू होगी। चर्च ढूंढें।" },
    count: 4,
    gridSize: 16,
  },
  {
    level: 7,
    targetId: "school",
    targetName: "School",
    story: { en: "The children need to reach School on time.", hi: "बच्चों को समय पर स्कूल पहुंचना है।" },
    count: 4,
    gridSize: 16,
  },
  {
    level: 8,
    targetId: "auto",
    targetName: "Auto Rickshaw",
    story: { en: "The Auto Rickshaw is waiting to take you home.", hi: "ऑटो रिक्शा आपको घर ले जाने के लिए इंतज़ार कर रहा है।" },
    count: 5,
    gridSize: 16,
  },
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

/* ─── Road Scene SVG ─── */
function RoadScene({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative w-full h-32 sm:h-40 rounded-2xl border-3 border-black overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-green-200 shadow-[4px_4px_0px_#000] mb-4">
      {/* Sky */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 to-sky-100" />
      {/* Hills */}
      <svg className="absolute bottom-0 w-full" viewBox="0 0 400 80" preserveAspectRatio="none">
        <path d="M0,40 Q50,10 100,35 Q150,5 200,30 Q250,0 300,25 Q350,5 400,20 L400,80 L0,80 Z" fill="#86efac" opacity="0.6" />
        <path d="M0,50 Q80,25 160,45 Q240,15 320,40 Q380,20 400,35 L400,80 L0,80 Z" fill="#4ade80" opacity="0.5" />
      </svg>
      {/* Road */}
      <div className="absolute bottom-0 w-full h-14 sm:h-16 bg-gradient-to-t from-gray-500 to-gray-400">
        {/* Dashed center line */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full flex gap-3 px-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-1 w-6 sm:w-8 bg-yellow-300 rounded-full shrink-0" />
          ))}
        </div>
      </div>
      {/* Content overlay (target preview, etc.) */}
      {children}
    </div>
  );
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
  const [hesitationSeconds, setHesitationSeconds] = useState(0);
  const [encourageMsg, setEncourageMsg] = useState<string | null>(null);

  useEffect(() => {
    if (phase !== "playing") return;
    const timer = setInterval(() => {
      setHesitationSeconds((h) => h + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, foundCount, currentLevelIdx]);

  const vanishingCue = useMemo(() => {
    if (phase !== "playing") return { intensity: "none" as ScaffoldingIntensity, glowOpacity: 0 };
    return calculateVanishingCue(hesitationSeconds, errors);
  }, [phase, hesitationSeconds, errors]);

  const localeKey = locale ?? "en";

  const levelConfig = LEVELS[currentLevelIdx];
  const targetObj = OBJECTS.find((o) => o.id === levelConfig.targetId)!;

  const gridCols = levelConfig.gridSize <= 6 ? 2 : levelConfig.gridSize <= 9 ? 3 : 4;

  const localizedName = useCallback(
    (obj: GameObject) => (obj.name as Record<string, string>)[localeKey] ?? obj.name.en,
    [localeKey]
  );

  const encouragingMessages = useMemo(
    () => ({
      en: ["Almost there!", "Keep looking!", "You can do it!", "Look carefully!", "Try again!"],
      hi: ["बिल्कुल पास!", "देखते रहो!", "आप कर सकते हैं!", "ध्यान से देखें!", "फिर से कोशिश करें!"],
      as: ["প্ৰায় পালে!", "চাই চালাওক!", "আপুনি পাৰে!", "মনোযোগেৰে চাওক!", "পুনৰ চেষ্টা কৰক!"],
    }),
    []
  );

  const getEncourageMessage = useCallback(() => {
    const msgs = encouragingMessages[localeKey as keyof typeof encouragingMessages] || encouragingMessages.en;
    return msgs[Math.floor(Math.random() * msgs.length)];
  }, [localeKey, encouragingMessages]);

  const startGame = useCallback(() => {
    playPress();
    const config = LEVELS[0];
    setTiles(buildBoard(config));
    setFoundCount(0);
    setCurrentLevelIdx(0);
    setScore(0);
    setErrors(0);
    setTaps(0);
    setHesitationSeconds(0);
    setHintUsed(false);
    setStartedAt(new Date().toISOString());
    setPhase("playing");
    stopSpeaking();
    const story = (config.story as Record<string, string>)[localeKey] || config.story.en;
    speak(`${story} ${t("findPrompt")} ${(targetObj.name as Record<string, string>)[localeKey] ?? targetObj.name.en}`, locale, rate);
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
          setHesitationSeconds(0);
          setEncourageMsg(null);
          speak(t("found"), locale, rate);

          if (newFound >= levelConfig.count) {
            setTimeout(completeLevel, 600);
          }
        } else {
          playEncourage();
          setErrors((e) => e + 1);
          setHesitationSeconds(8);
          setEncourageMsg(getEncourageMessage());
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
    [phase, foundCount, levelConfig, completeLevel, locale, rate, t, getEncourageMessage]
  );

  const nextLevel = useCallback(() => {
    playPress();
    const nextIdx = currentLevelIdx + 1;
    const config = LEVELS[nextIdx];
    setCurrentLevelIdx(nextIdx);
    setTiles(buildBoard(config));
    setFoundCount(0);
    setHesitationSeconds(0);
    setHintUsed(false);
    setEncourageMsg(null);
    setPhase("playing");
    const nextTarget = OBJECTS.find((o) => o.id === config.targetId)!;
    stopSpeaking();
    const story = (config.story as Record<string, string>)[localeKey] || config.story.en;
    speak(`${story} ${t("findPrompt")} ${(nextTarget.name as Record<string, string>)[localeKey] ?? nextTarget.name.en}`, locale, rate);
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
    setHesitationSeconds(0);
    setHintUsed(false);
    setStartedAt(null);
    setTaps(0);
    setErrors(0);
    setEncourageMsg(null);
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
        <div className="flex flex-col items-center gap-5 py-6 text-center">
          <RoadScene>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex items-center gap-2 bg-white/90 rounded-xl px-4 py-2 border-2 border-black shadow-lg">
                <span className="text-3xl">{targetObj.emoji}</span>
                <span className="font-black text-ink text-lg">{localizedName(targetObj)}</span>
              </div>
            </div>
          </RoadScene>

          <div className="space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-ink">
              {t("introTitle")}
            </h2>
            <p className="max-w-md text-base sm:text-lg font-semibold text-ink-secondary leading-relaxed">
              {t("introSubtitle")}
            </p>
          </div>

          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="text-sm font-black uppercase tracking-wider text-[#9D246C] flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {t("welcome")}
              </span>
              <span className="text-[10px] font-black uppercase rounded bg-[#9D246C] text-white px-2.5 py-1 border border-black shadow-[1px_1px_0px_#000]">
                Level {levelConfig.level} of {LEVELS.length}
              </span>
            </div>
            <p className="text-base font-bold text-ink-secondary leading-relaxed">
              {(levelConfig.story as Record<string, string>)[localeKey] || levelConfig.story.en}
            </p>
            <div className="mt-3 flex items-center gap-2 bg-amber-50 rounded-xl border-2 border-amber-300 p-3">
              <span className="text-2xl">{targetObj.emoji}</span>
              <div>
                <span className="text-[10px] font-black uppercase text-amber-600 block">{t("findTarget")}</span>
                <span className="text-lg font-black text-ink">{localizedName(targetObj)}</span>
              </div>
            </div>
          </div>

          <AudioPrompt
            text={`${(levelConfig.story as Record<string, string>)[localeKey] || levelConfig.story.en} ${t("findPrompt")} ${localizedName(targetObj)}`}
            label={t("listenLabel")}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startGame}>
            {t("startButton")}
          </ChunkyButton>
        </div>
      )}

      {/* ─── PLAYING ─── */}
      {phase === "playing" && (
        <div className="flex flex-col items-center gap-4 py-2">
          {/* Target HUD */}
          <div className="w-full max-w-md flex items-center justify-between rounded-2xl border-3 border-black bg-surface px-4 py-3 shadow-[3px_3px_0px_#000]">
            <div className="flex items-center gap-3">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${targetObj.bgColor} border-2 border-black shadow-[2px_2px_0px_#000]`}>
                <span className="text-2xl">{targetObj.emoji}</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-ink-secondary block">
                  {t("findTarget")}
                </span>
                <span className="text-base sm:text-lg font-black text-ink leading-tight">
                  {localizedName(targetObj)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  stopSpeaking();
                  const story = (levelConfig.story as Record<string, string>)[localeKey] || levelConfig.story.en;
                  speak(`${story} ${t("findPrompt")} ${localizedName(targetObj)}`, locale, rate);
                }}
                className="btn-tactile flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-amber-200 text-amber-950 hover:bg-amber-300 shadow-[2px_2px_0px_#000] cursor-pointer"
                title={t("listenLabel")}
                aria-label={t("listenLabel")}
              >
                <Volume2 className="h-5 w-5 stroke-[2.5]" />
              </button>
              <span className="rounded-xl border-2 border-black bg-[#9D246C] px-3 py-1.5 text-sm font-black text-white shadow-[2px_2px_0px_#000]">
                {foundCount} / {levelConfig.count}
              </span>
            </div>
          </div>

          {/* Encouragement message */}
          {encourageMsg && (
            <div className="w-full max-w-md rounded-xl border-2 border-amber-400 bg-amber-50 px-4 py-2 text-center shadow-[2px_2px_0px_#000] animate-bounce">
              <span className="text-sm font-black text-amber-700">{encourageMsg}</span>
            </div>
          )}

          {/* Game Grid */}
          <div
            className={`grid gap-3 w-full max-w-md ${
              gridCols === 2
                ? "grid-cols-2"
                : gridCols === 3
                ? "grid-cols-3"
                : "grid-cols-4"
            }`}
          >
            {tiles.map((tile) => {
              const isTarget = tile.object.id === levelConfig.targetId && !tile.found;
              const isTargetHinted = isTarget && (hintUsed || vanishingCue.intensity !== "none");
              const cueClass = isTarget && isTargetHinted
                ? vanishingCue.intensity === "guided_highlight"
                  ? "ring-4 ring-amber-400 animate-pulse bg-amber-100 border-amber-600 scale-105 shadow-[0_0_16px_rgba(245,158,11,0.85)]"
                  : "ring-2 ring-amber-300 animate-pulse bg-amber-50 border-amber-500 scale-[1.02]"
                : "";

              return (
                <button
                  key={tile.uid}
                  type="button"
                  disabled={tile.found}
                  onClick={() => tapTile(tile.uid)}
                  className={`btn-tactile flex flex-col items-center justify-center gap-1.5 aspect-square rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] transition-all active:translate-y-0.5 cursor-pointer disabled:opacity-50 ${
                    tile.found
                      ? "bg-tea-light border-tea ring-2 ring-tea"
                      : isTargetHinted
                      ? cueClass
                      : tile.wrongFlash
                      ? "bg-amber-100 border-amber-500 animate-shake"
                      : `${tile.object.bgColor} hover:scale-[1.03] hover:shadow-[6px_6px_0px_#000]`
                  }`}
                >
                  {tile.found ? (
                    <Check className="h-8 w-8 sm:h-10 sm:w-10 text-emerald-700" />
                  ) : (
                    <>
                      <span className="text-2xl sm:text-3xl">{tile.object.emoji}</span>
                      <span className={`text-[9px] sm:text-[10px] font-black ${tile.object.labelColor} leading-tight text-center px-0.5`}>
                        {localizedName(tile.object)}
                      </span>
                    </>
                  )}
                </button>
              );
            })}
          </div>

          {!hintUsed && (
            <button
              type="button"
              onClick={showHint}
              className="flex items-center gap-2 rounded-xl border-2 border-black bg-amber-100 px-4 py-2 text-base font-black text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
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
          <div className="relative">
            <Sparkles className="h-16 w-16 text-amber-500 animate-bounce" />
            <span className="absolute -top-2 -right-2 text-3xl">{targetObj.emoji}</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-black text-ink">
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
          title={t("celebrationTitle")}
          subtitle={t("celebrationSubtitle")}
          xpEarned={score}
          accuracy={`${Math.max(0, 100 - errors * 10)}%`}
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-center w-full">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={restartGame}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> {t("playAgainButton")}
                </span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-base font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
              >
                <Footprints className="h-4 w-4" /> {t("backToHub")}
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
