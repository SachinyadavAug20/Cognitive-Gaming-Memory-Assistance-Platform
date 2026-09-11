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

type ActiveModalGame =
  | "day-in-my-world"
  | "majuli-walk"
  | "tea-harvest-vision"
  | "arrow-escape"
  | "bihu-dhol"
  | null;

// Color Hunt Palette 6040 (whiteyellowbeigebrowngreennaturefallfoodsummer):
// #597E52 (Sage Forest Green), #C6A969 (Golden Khaki), #F1E4C3 (Warm Linen Beige), #FFFFEC (Warm Ivory Cream)
function getGameCardTheme(id: string): { bg: string; isDark: boolean } {
  switch (id) {
    // 1. Sage Forest Green (#597E52) - Crisp White Text
    case "majuli-walk":
    case "tea-harvest":
    case "dzukou-botanist":
    case "companion":
    case "root-bridge":
    case "brahmaputra-boat":
    case "tea-harvest-vision":
    case "wayfinding":
    case "tea-garden-catch":
      return { bg: "bg-[#597E52]", isDark: true };

    // 2. Warm Golden Khaki (#C6A969) - Bold Black Text
    case "jigsaw":
    case "lotus-painter":
    case "rhythm-hills":
    case "memory-road":
    case "arrow-escape":
    case "pathways":
    case "bazaar-buddies":
    case "hornbill-flight":
      return { bg: "bg-[#C6A969]", isDark: false };

    // 3. Warm Linen Beige (#F1E4C3) - Bold Black Text
    case "loom":
    case "weaving":
    case "majuli-pottery":
    case "heritage-kitchen":
    case "drum":
    case "bihu-dhol":
    case "daily-tasks":
    case "river-lanterns":
      return { bg: "bg-[#F1E4C3]", isDark: false };

    // 4. Warm Ivory Cream (#FFFFEC) - Bold Black Text
    case "butterfly-sanctuary":
    case "monastery-bell":
    case "daily-routine":
    case "tuned-drum":
    case "storybook":
    case "radio":
    case "grandchild-chat":
    case "memory-detective":
    case "timeline":
    case "alpana":
    case "sorting":
    case "memory-garden":
    case "day-in-my-world":
    default:
      return { bg: "bg-[#FFFFEC]", isDark: false };
  }
}

export default function GamesHubPage() {
  const locale = useLocale();
  const t = useTranslations("games");
  const hub = getHubStrings(locale);
  const { detail, loading, error, reload } = usePatientDetail();
  const [activeModalGame, setActiveModalGame] = useState<ActiveModalGame>(null);

  // Localized Strings for Featured Games
  const dayInWorld = getGameStrings("day-in-my-world", locale);
  const majuliWalk = getGameStrings("majuli-walk", locale);
  const teaHarvest = getGameStrings("tea-harvest", locale);
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
                const { bg: cardBg, isDark } = getGameCardTheme(game.id);

                return (
                  <Link
                    key={game.id}
                    href={`/patient/games/${game.id}`}
                    data-voice-desc={voiceText}
                    className={`game-card btn-tactile group flex flex-col justify-between items-center text-center gap-4 rounded-3xl border-3 border-black ${cardBg} p-5 shadow-[5px_5px_0px_#000] transition-transform hover:scale-[1.01] cursor-pointer relative`}
                  >
                    {/* Header: Title, Icon & Voice Preview */}
                    <div className={`w-full flex items-center justify-between gap-2.5 border-b-2 ${isDark ? "border-white/20" : "border-black/20"} pb-2.5`}>
                      <div className={`flex items-center gap-2.5 font-black text-sm sm:text-base tracking-wide truncate ${isDark ? "text-white" : "text-black"}`}>
                        <Icon className={`h-7 w-7 stroke-[2.5] shrink-0 ${isDark ? "text-white" : "text-black"}`} />
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
                        className="btn-tactile flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border-2 border-black bg-white text-black hover:bg-[#FFFFEC] cursor-pointer shadow-[2px_2px_0px_#000] shrink-0"
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
                    <div className="w-full rounded-2xl border-2 border-black bg-white py-3 px-4 text-xs sm:text-sm font-black text-black shadow-[3px_3px_0px_#000] tracking-wide flex items-center justify-center gap-2 group-hover:bg-[#FFFFEC] transition-all">
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
