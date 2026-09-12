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
  BookOpen,
  ExternalLink,
  FileText,
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
import {
  COGNITIVE_DOMAINS,
  type CognitiveDomainKey,
  getDomainForGame,
} from "@/lib/cognitiveDomains";

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

// Vibrant Regional Colors (Terracotta Saffron, Assam Tea Forest, Muga Amber Gold, Kopou Orchid)
function getGameCardBg(id: string): string {
  switch (id) {
    // 1. Vibrant Terracotta / Saffron
    case "jigsaw":
    case "hornbill-flight":
    case "day-in-my-world":
      return "bg-[#E05316]"; // vibrant river terracotta
    case "weaving":
    case "river-lanterns":
    case "bihu-dhol":
    case "daily-tasks":
      return "bg-[#EA580C]"; // vibrant festive drum & craft terracotta
    case "drum":
    case "majuli-pottery":
    case "heritage-kitchen":
      return "bg-[#D4380D]"; // vibrant artisan terracotta

    // 2. Vibrant Assam Tea Forest & River Jade
    case "majuli-walk":
    case "companion":
    case "tea-harvest":
    case "dzukou-botanist":
    case "brahmaputra-boat":
      return "bg-[#15803D]"; // vibrant Assam tea garden forest
    case "wayfinding":
    case "tea-harvest-vision":
    case "root-bridge":
      return "bg-[#16803D]"; // vibrant rainforest canopy
    case "rhythm-hills":
    case "tea-garden-catch":
    case "lotus-painter":
      return "bg-[#16A34A]"; // vibrant bamboo & hills meadow

    // 3. Vibrant Golden Muga Amber
    case "loom":
    case "butterfly-sanctuary":
    case "storybook":
    case "timeline":
      return "bg-[#C25E00]"; // vibrant golden muga amber
    case "tuned-drum":
    case "monastery-bell":
    case "daily-routine":
    case "bazaar-buddies":
    case "arrow-escape":
    case "pathways":
      return "bg-[#D97706]"; // vibrant brass gong & amber market
    case "radio":
    case "sorting":
      return "bg-[#B85B00]"; // vibrant vintage teak bronze

    // 4. Vibrant Kopou Orchid & Wild Berry Plum
    case "memory-road":
    case "alpana":
      return "bg-[#9D246C]"; // vibrant Kopou orchid plum
    case "grandchild-chat":
      return "bg-[#BE123C]"; // vibrant warm rose
    case "memory-detective":
      return "bg-[#A21CAF]"; // vibrant royal berry orchid
    case "memory-garden":
      return "bg-[#9D174D]"; // vibrant courtyard mulberry

    default:
      return "bg-[#15803D]"; // vibrant tea forest fallback
  }
}

export default function GamesHubPage() {
  const locale = useLocale();
  const t = useTranslations("games");
  const hub = getHubStrings(locale);
  const { detail, loading, error, reload } = usePatientDetail();
  const [activeModalGame, setActiveModalGame] = useState<ActiveModalGame>(null);
  const [selectedDomain, setSelectedDomain] = useState<CognitiveDomainKey>("all");

  // Localized Strings for Featured Games
  const dayInWorld = getGameStrings("day-in-my-world", locale);
  const majuliWalk = getGameStrings("majuli-walk", locale);
  const teaHarvest = getGameStrings("tea-harvest", locale);
  const bihuDhol = getGameStrings("bihu-dhol", locale);
  const arrowEscape = getGameStrings("arrow-escape", locale);

  const activeDomainInfo =
    COGNITIVE_DOMAINS.find((d) => d.key === selectedDomain) || COGNITIVE_DOMAINS[0];

  const filteredGames =
    selectedDomain === "all"
      ? GAMES
      : GAMES.filter((game) => activeDomainInfo.gameIds.includes(game.id));

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

      {/* ── Minimal Cognitive Domain Filter Tabs ── */}
      <div
        className="mb-5 flex flex-wrap items-center gap-2 sm:gap-2.5"
        role="tablist"
        aria-label="Filter games by cognitive domain"
      >
        {COGNITIVE_DOMAINS.map((domain) => {
          const isSelected = domain.key === selectedDomain;
          const DomainIcon = domain.icon;
          const count = domain.key === "all" ? GAMES.length : domain.gameIds.length;

          return (
            <button
              key={domain.key}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                unlockAudio();
                setSelectedDomain(domain.key);
              }}
              className={`btn-tactile inline-flex min-h-[46px] sm:min-h-[50px] items-center gap-2.5 px-4 py-2 rounded-2xl border-2 font-black text-xs sm:text-sm transition-all cursor-pointer ${
                isSelected
                  ? "border-black bg-tea text-white shadow-[3px_3px_0px_#000] scale-[1.02]"
                  : "border-black/25 bg-white hover:border-black hover:bg-amber-50 text-ink shadow-xs"
              }`}
            >
              <DomainIcon
                className={`h-4.5 w-4.5 shrink-0 stroke-[2.3] ${
                  isSelected ? "text-amber-300" : "text-tea"
                }`}
              />
              <span className="whitespace-nowrap">{domain.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-black shrink-0 ${
                  isSelected ? "bg-white/25 text-white" : "bg-black/10 text-ink-secondary"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <GameLoading />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          {filteredGames.map((game) => {
            const Icon = game.icon || Brain;
            const gameStrings = getGameStrings(game.id, locale);
            const cardTitle = gameStrings.title || (t.has(game.titleKey) ? t(game.titleKey) : game.domain);
            const cardDesc = gameStrings.introSubtitle || (t.has(game.descKey) ? t(game.descKey) : "");
            const voiceText = `${cardTitle}. ${gameStrings.audioPrompt || cardDesc}`;
            const cardBg = getGameCardBg(game.id);
            const gameDomain = getDomainForGame(game.id);

            return (
              <Link
                key={game.id}
                href={`/patient/games/${game.id}`}
                data-voice-desc={voiceText}
                className={`game-card btn-tactile group flex flex-col justify-between items-center text-center gap-4 rounded-3xl border-3 border-black ${cardBg} p-5 shadow-[5px_5px_0px_#000] transition-transform hover:scale-[1.01] cursor-pointer relative`}
              >
                {/* Header: Title, Icon, Domain Tag & Voice Preview */}
                <div className="w-full flex items-center justify-between gap-2.5 border-b-2 border-white/20 pb-2.5">
                  <div className="flex items-center gap-2.5 text-white font-black text-sm sm:text-base tracking-wide truncate">
                    <Icon className="h-7 w-7 text-white stroke-[2.5] shrink-0" />
                    <div className="truncate text-left">
                      <span className="block truncate">{cardTitle}</span>
                      <span className="block text-[11px] font-black text-amber-200 uppercase tracking-wider">
                        {gameDomain.label}
                      </span>
                    </div>
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

      {/* Evidence-Based Neuropsychological Rationale & Research Links */}
      <section className="mt-8 rounded-3xl border-3 border-black bg-white p-5 sm:p-6 shadow-[5px_5px_0px_#000] space-y-4 text-ink">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black bg-tea/10 text-tea">
              <BookOpen className="h-4 w-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-serif font-black text-sm sm:text-base text-ink">
                Neuropsychological Architecture &amp; Clinical Evidence
              </h3>
              <p className="text-[11px] text-ink-secondary">
                Grounded in peer-reviewed RCTs, DSM-5 domain mapping, and errorless learning
              </p>
            </div>
          </div>

          <Link
            href="/clinical-evidence"
            className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-400 hover:bg-amber-300 px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] transition-colors cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Full SaMD Dossier</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div className="rounded-2xl border-2 border-black/15 bg-[#FAF6F0] p-3 space-y-1.5 text-ink">
            <div className="flex items-center justify-between">
              <span className="font-black text-ink text-[11px] uppercase tracking-wide">Errorless Learning</span>
              <span className="text-[10px] text-ink-secondary font-mono">PMID: 18080977</span>
            </div>
            <p className="text-[11px] text-ink-secondary leading-snug">
              Bypasses damaged hippocampal episodic memory using vanishing visual cues to prevent error consolidation.
            </p>
            <a
              href="https://doi.org/10.1080/09602010701464731"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-tea hover:underline"
            >
              <span>Clare &amp; Jones (2008)</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          <div className="rounded-2xl border-2 border-black/15 bg-[#FAF6F0] p-3 space-y-1.5 text-ink">
            <div className="flex items-center justify-between">
              <span className="font-black text-ink text-[11px] uppercase tracking-wide">10-Yr Transfer (ACTIVE)</span>
              <span className="text-[10px] text-ink-secondary font-mono">PMID: 24428347</span>
            </div>
            <p className="text-[11px] text-ink-secondary leading-snug">
              NIH landmark trial proving speed &amp; reasoning drills preserve IADLs and reduce dementia risk by 29%.
            </p>
            <a
              href="https://pubmed.ncbi.nlm.nih.gov/24428347/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-tea hover:underline"
            >
              <span>Rebok et al. (JAGS 2014)</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>

          <div className="rounded-2xl border-2 border-black/15 bg-[#FAF6F0] p-3 space-y-1.5 text-ink">
            <div className="flex items-center justify-between">
              <span className="font-black text-ink text-[11px] uppercase tracking-wide">Spatial Biomarkers</span>
              <span className="text-[10px] text-ink-secondary font-mono">PMID: 31836709</span>
            </div>
            <p className="text-[11px] text-ink-secondary leading-snug">
              Virtual navigation wayfinding deviations detect preclinical entorhinal cortex changes without white-coat anxiety.
            </p>
            <a
              href="https://www.nature.com/articles/s41467-019-13619-3"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] font-bold text-tea hover:underline"
            >
              <span>Coughlan et al. (Nature 2019)</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      </section>

      {/* Discreet bottom caregiver / user-switch logout with confirmation */}
      <PatientBottomLogout />
    </div>
  );
}
