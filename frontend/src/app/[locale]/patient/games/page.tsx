"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Brain,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Activity,
  Layers,
  Sparkles,
  Compass,
  Utensils,
  Flower2,
  Footprints,
  X,
  Play,
  Camera,
  Volume2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { GAMES, type ClinicalDomain } from "@/games/registry";
import { usePatientDetail } from "@/games/usePatientDetail";
import { startLevel } from "@/games/config";
import { GameLoading } from "@/components/games/GameState";
import { speakText, unlockAudio } from "@/lib/sound";
import { getGameStrings, getHubStrings } from "@/lib/gameI18n";
import { PatientBottomLogout } from "@/components/patient/PatientBottomLogout";
import { ActivityIllustration } from "@/components/ui/ActivityIllustrations";

const DayInMyWorld3D = dynamic(
  () => import("@/components/games/DayInMyWorld3D").then((m) => m.DayInMyWorld3D),
  { loading: () => <GameLoading />, ssr: false }
);
const MajuliWalk3D = dynamic(
  () => import("@/components/games/MajuliWalk3D").then((m) => m.MajuliWalk3D),
  { loading: () => <GameLoading />, ssr: false }
);
const TeaHarvestVision = dynamic(
  () => import("@/components/games/TeaHarvestVision").then((m) => m.TeaHarvestVision),
  { loading: () => <GameLoading />, ssr: false }
);
const ArrowEscape = dynamic(
  () => import("@/components/games/ArrowEscape").then((m) => m.ArrowEscape),
  { loading: () => <GameLoading />, ssr: false }
);
const BihuDholBeats = dynamic(
  () => import("@/components/games/BihuDholBeats").then((m) => m.BihuDholBeats),
  { loading: () => <GameLoading />, ssr: false }
);

type FilterKey = "all" | ClinicalDomain;
type ActiveModalGame =
  | "day-in-my-world"
  | "majuli-walk"
  | "tea-harvest-vision"
  | "arrow-escape"
  | "bihu-dhol"
  | null;

function getGameCardBg(id: string): string {
  switch (id) {
    case "jigsaw":
      return "bg-[#C8421A]"; // vibrant river terracotta
    case "majuli-walk":
      return "bg-[#1B663E]"; // vibrant Assam tea forest green
    case "wayfinding":
      return "bg-[#166534]"; // vibrant pine forest
    case "loom":
      return "bg-[#B45309]"; // vibrant golden muga amber
    case "weaving":
      return "bg-[#C2410C]"; // vibrant roasted cinnamon
    case "memory-road":
      return "bg-[#7E2A5D]"; // vibrant wild orchid plum
    case "grandchild-chat":
      return "bg-[#9F1239]"; // vibrant warm rose
    case "memory-detective":
      return "bg-[#A21CAF]"; // vibrant royal berry
    case "timeline":
      return "bg-[#9A3412]"; // vibrant keepsake mahogany
    case "drum":
      return "bg-[#B43818]"; // vibrant bihu drum terracotta
    case "bihu-dhol":
      return "bg-[#C2410C]"; // vibrant festive dhol clay
    case "tuned-drum":
      return "bg-[#A16207]"; // vibrant brass gong bronze
    case "rhythm-hills":
      return "bg-[#1E7345]"; // vibrant mountain pine
    case "alpana":
      return "bg-[#7E2A5D]"; // vibrant festive plum
    case "companion":
      return "bg-[#1B663E]"; // vibrant soothing tea green
    case "lotus-painter":
      return "bg-[#1F7A48]"; // vibrant lotus pond moss
    case "butterfly-sanctuary":
      return "bg-[#B45309]"; // vibrant warm golden amber
    case "tea-harvest":
      return "bg-[#1B663E]"; // vibrant tea garden green
    case "tea-harvest-vision":
      return "bg-[#166534]"; // vibrant canopy emerald
    case "tea-garden-catch":
      return "bg-[#1E7345]"; // vibrant bamboo grove
    case "river-lanterns":
      return "bg-[#C2410C]"; // vibrant river clay rust
    case "monastery-bell":
      return "bg-[#A16207]"; // vibrant monastery bronze ochre
    case "brahmaputra-boat":
      return "bg-[#15803D]"; // vibrant river forest
    case "hornbill-flight":
      return "bg-[#C8421A]"; // vibrant hornbill terracotta
    case "majuli-pottery":
      return "bg-[#B43818]"; // vibrant artisan terracotta
    case "daily-routine":
      return "bg-[#A16207]"; // vibrant warm golden amber
    case "storybook":
      return "bg-[#9A3412]"; // vibrant aged parchment walnut
    case "radio":
      return "bg-[#854D0E]"; // vibrant vintage teak
    case "heritage-kitchen":
      return "bg-[#B43818]"; // vibrant spice terracotta
    case "daily-tasks":
      return "bg-[#C2410C]"; // vibrant lal saah red tea
    case "bazaar-buddies":
      return "bg-[#A16207]"; // vibrant bazaar brass
    case "sorting":
      return "bg-[#854D0E]"; // vibrant pantry cedar
    case "arrow-escape":
    case "pathways":
      return "bg-[#A16207]"; // vibrant archery bronze
    case "dzukou-botanist":
      return "bg-[#1B663E]"; // vibrant Dzukou valley evergreen
    case "memory-garden":
      return "bg-[#831843]"; // vibrant garden mulberry
    case "root-bridge":
      return "bg-[#166534]"; // vibrant Meghalaya canopy green
    case "day-in-my-world":
      return "bg-[#C8421A]"; // vibrant morning village terracotta
    default:
      return "bg-[#1B663E]"; // vibrant tea green fallback
  }
}

export default function GamesHubPage() {
  const locale = useLocale();
  const t = useTranslations("games");
  const hub = getHubStrings(locale);
  const { detail, loading, error, reload } = usePatientDetail();
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("all");
  const [activeModalGame, setActiveModalGame] = useState<ActiveModalGame>(null);

  const filteredGames = GAMES.filter((g) => {
    if (selectedFilter === "all") return true;
    return g.category === selectedFilter;
  });

  // Localized Strings for Featured Games
  const dayInWorld = getGameStrings("day-in-my-world", locale);
  const majuliWalk = getGameStrings("majuli-walk", locale);
  const teaHarvest = getGameStrings("tea-harvest-vision", locale);
  const bihuDhol = getGameStrings("bihu-dhol", locale);
  const arrowEscape = getGameStrings("arrow-escape", locale);

  const handleSpeak = (text: string) => {
    unlockAudio();
    speakText(text, locale, 0.82);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Active Modal Fullscreen Game Overlay with Clear Elderly-Friendly Exit Button */}
      {activeModalGame && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-6 animate-fade-in flex flex-col items-center justify-start">
          <div className="sticky top-2 z-50 w-full max-w-4xl flex items-center justify-between bg-ink/90 border-3 border-black text-white p-3 rounded-2xl shadow-[4px_4px_0px_#000] mb-3">
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-base sm:text-lg">
                {activeModalGame === "day-in-my-world" && dayInWorld.title}
                {activeModalGame === "majuli-walk" && majuliWalk.title}
                {activeModalGame === "tea-harvest-vision" && teaHarvest.title}
                {activeModalGame === "arrow-escape" && arrowEscape.title}
                {activeModalGame === "bihu-dhol" && bihuDhol.title}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveModalGame(null)}
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-rose-500 hover:bg-rose-600 px-4 py-2 text-xs sm:text-sm font-black text-white shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>{hub.back}</span>
            </button>
          </div>

          <div className="w-full max-w-4xl rounded-3xl border-4 border-black bg-[#FAF6F0] p-3 sm:p-6 shadow-[8px_8px_0px_#000] text-ink overflow-hidden">
            {activeModalGame === "day-in-my-world" && <DayInMyWorld3D />}
            {activeModalGame === "majuli-walk" && <MajuliWalk3D />}
            {activeModalGame === "tea-harvest-vision" && <TeaHarvestVision />}
            {activeModalGame === "arrow-escape" && <ArrowEscape />}
            {activeModalGame === "bihu-dhol" && <BihuDholBeats />}
          </div>
        </div>
      )}

      {loading ? (
        <GameLoading />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          {GAMES.map((game) => {
            const Icon = game.icon || Brain;
            const gameStrings = getGameStrings(game.id, locale);
            const cardTitle = gameStrings.title || (t.has(game.titleKey) ? t(game.titleKey) : game.domain);
            const cardDesc = gameStrings.introSubtitle || (t.has(game.descKey) ? t(game.descKey) : "");
            const voiceText = `${cardTitle}. ${gameStrings.audioPrompt || cardDesc}`;
            const levelLabel = hub.levelAdaptive.replace("{level}", String(startLevel(detail)));
            const cardBg = getGameCardBg(game.id);

            return (
              <Link
                key={game.id}
                href={`/patient/games/${game.id}`}
                data-voice-desc={voiceText}
                className={`game-card btn-tactile group flex flex-col justify-between items-center text-center gap-4 rounded-3xl border-3 border-black ${cardBg} p-5 shadow-[5px_5px_0px_#000] transition-transform hover:scale-[1.01] cursor-pointer relative`}
              >
                {/* Header: Title, Icon & Voice Preview */}
                <div className="w-full flex items-center justify-between gap-2.5 border-b-2 border-white/20 pb-2.5">
                  <div className="flex items-center gap-2.5 text-white font-black text-sm sm:text-base tracking-wide truncate">
                    <Icon className="h-7 w-7 text-white stroke-[2.5] shrink-0" />
                    <span className="truncate">{cardTitle}</span>
                  </div>

                  {/* Quick Audio Preview Button - Large Accessible Touch Target */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSpeak(voiceText);
                    }}
                    className="btn-tactile flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border-2 border-black bg-white text-black hover:bg-amber-100 cursor-pointer shadow-[2px_2px_0px_#000] shrink-0"
                    title={hub.listenGuide}
                    aria-label={`${hub.listenGuide}: ${cardTitle}`}
                  >
                    <Volume2 className="h-6 w-6 stroke-[2.5]" />
                  </button>
                </div>

                {/* Center Visual: Thematic Visual Illustration in crisp white framed box */}
                <div className="my-2 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl border-3 border-black bg-white shadow-[3px_3px_0px_#000] p-1.5">
                  <ActivityIllustration gameId={game.id} className="h-12 w-12 sm:h-14 sm:w-14" />
                </div>

                {/* Action Button - Simple Action Text */}
                <div className="w-full rounded-2xl border-2 border-black bg-white py-3 px-4 text-xs sm:text-sm font-black text-black shadow-[3px_3px_0px_#000] tracking-wide flex items-center justify-center gap-2 group-hover:bg-amber-100 transition-all">
                  <span>{gameStrings.startButton || hub.startSession || "Play Now"}</span>
                  <span>➔</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Discreet bottom caregiver / user-switch logout with confirmation */}
      <PatientBottomLogout />
    </div>
  );
}
