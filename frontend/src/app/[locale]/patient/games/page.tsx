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
import { GAMES, type ClinicalDomain } from "@/games/registry";
import { usePatientDetail } from "@/games/usePatientDetail";
import { startLevel } from "@/games/config";
import { GameLoading } from "@/components/games/GameState";
import { MajuliWalk3D } from "@/components/games/MajuliWalk3D";
import { TeaHarvestVision } from "@/components/games/TeaHarvestVision";
import { ArrowEscape } from "@/components/games/ArrowEscape";
import { BihuDholBeats } from "@/components/games/BihuDholBeats";
import { DayInMyWorld3D } from "@/components/games/DayInMyWorld3D";
import { speakText, unlockAudio } from "@/lib/sound";
import { getGameStrings, getHubStrings } from "@/lib/gameI18n";
import { PatientBottomLogout } from "@/components/patient/PatientBottomLogout";

type FilterKey = "all" | ClinicalDomain;
type ActiveModalGame =
  | "day-in-my-world"
  | "majuli-walk"
  | "tea-harvest-vision"
  | "arrow-escape"
  | "bihu-dhol"
  | null;

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

      {/* Page Title Bar - Minimal & Accessible (No redundant card box, no duplicate back button) */}
      <div className="mb-5 flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl sm:text-3xl font-black text-ink flex items-center gap-2.5">
          <Brain className="h-7 w-7 sm:h-8 sm:w-8 text-tea shrink-0" />
          <span>{hub.headerTitle}</span>
        </h1>
        <button
          type="button"
          onClick={() => handleSpeak(hub.headerTitle)}
          className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-amber-100 px-3.5 py-2 text-xs sm:text-sm font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-200 cursor-pointer"
          title={hub.listenGuide}
          aria-label={hub.listenGuide}
        >
          <Volume2 className="h-4 w-4 text-amber-900" />
          <span>{hub.listenGuide}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* FEATURED SPATIAL & COMPUTER VISION EXPERIENCES HERO SHOWCASE              */}
      {/* ========================================================================= */}
      {/* Featured Experiences: A Day in My Village & Echoes of Home */}
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        {/* Flagship: A Day in My Village 3D Story Campaign */}
        <div className="relative overflow-hidden rounded-3xl border-3 border-black bg-gradient-to-br from-amber-600 to-amber-700 p-5 sm:p-6 text-white shadow-[5px_5px_0px_#000] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-amber-300 px-3 py-1 text-[11px] font-black uppercase text-amber-950">
                ⭐ Featured Story
              </span>
              <button
                type="button"
                onClick={() => handleSpeak(`${dayInWorld.title}. ${dayInWorld.audioPrompt}`)}
                className="btn-tactile flex h-9 w-9 items-center justify-center rounded-xl border border-white/40 bg-white/20 text-white hover:bg-white/30 cursor-pointer shadow-xs"
                title={hub.listenGuide}
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-black text-white leading-tight">
              {dayInWorld.introTitle || dayInWorld.title}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-amber-100 leading-relaxed">
              {dayInWorld.introSubtitle}
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-end">
            <button
              type="button"
              onClick={() => setActiveModalGame("day-in-my-world")}
              className="btn-tactile rounded-2xl border-2 border-black bg-white px-5 py-2.5 text-xs sm:text-sm font-black text-amber-950 shadow-[3px_3px_0px_#000] hover:bg-amber-100 flex items-center gap-2 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-amber-950" />
              <span>{hub.flagshipCta}</span>
            </button>
          </div>
        </div>

        {/* Feature 2: Echoes of Home — Peaceful Sounds & Memories */}
        <div className="relative overflow-hidden rounded-3xl border-3 border-black bg-gradient-to-br from-teal-800 to-cyan-900 p-5 sm:p-6 text-white shadow-[5px_5px_0px_#000] flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-teal-300 px-3 py-1 text-[11px] font-black uppercase text-teal-950">
                🌿 Calming Memories
              </span>
              <button
                type="button"
                onClick={() => handleSpeak("Echoes of Home. Reconnect with memories with sounds of rain, rivers, temple bells, and family voices.")}
                className="btn-tactile flex h-9 w-9 items-center justify-center rounded-xl border border-white/40 bg-white/20 text-white hover:bg-white/30 cursor-pointer shadow-xs"
                title={hub.listenGuide}
              >
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-black text-white leading-tight">
              Echoes of Home
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-teal-100 leading-relaxed">
              Step inside family photos brought gently to life. Listen to soothing sounds of rain, rivers, temple bells, and loving family voices.
            </p>
          </div>

          <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-end">
            <Link
              href="/patient/echoes-of-home"
              className="btn-tactile rounded-2xl border-2 border-black bg-white px-5 py-2.5 text-xs sm:text-sm font-black text-teal-950 shadow-[3px_3px_0px_#000] hover:bg-teal-50 flex items-center gap-2 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-teal-950" />
              <span>Open Memories</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Friendly Domain Filter Tabs */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedFilter("all")}
          className={`rounded-xl border-2 px-4 py-2 text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "all"
              ? "border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
            }`}
        >
          <Layers className="h-4 w-4" />
          <span>{hub.filterAll} ({GAMES.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("vision-3d")}
          className={`rounded-xl border-2 px-4 py-2 text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "vision-3d"
              ? "border-black bg-teal-800 text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
            }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>{hub.filterVision3D} ({GAMES.filter((g) => g.category === "vision-3d").length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("reminiscence")}
          className={`rounded-xl border-2 px-4 py-2 text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "reminiscence"
              ? "border-black bg-purple-700 text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
            }`}
        >
          <Brain className="h-4 w-4" />
          <span>{hub.filterReminiscence} ({GAMES.filter((g) => g.category === "reminiscence").length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("attention")}
          className={`rounded-xl border-2 px-4 py-2 text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "attention"
              ? "border-black bg-emerald-700 text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
            }`}
        >
          <Compass className="h-4 w-4" />
          <span>{hub.filterAttention} ({GAMES.filter((g) => g.category === "attention").length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("iadl")}
          className={`rounded-xl border-2 px-4 py-2 text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "iadl"
              ? "border-black bg-amber-700 text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
            }`}
        >
          <Utensils className="h-4 w-4" />
          <span>{hub.filterIadl} ({GAMES.filter((g) => g.category === "iadl").length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("calm")}
          className={`rounded-xl border-2 px-4 py-2 text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "calm"
              ? "border-black bg-teal-700 text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
            }`}
        >
          <Flower2 className="h-4 w-4" />
          <span>{hub.filterCalm} ({GAMES.filter((g) => g.category === "calm").length})</span>
        </button>
      </div>

      {loading ? (
        <GameLoading />
      ) : (
        <div className="grid gap-3.5 sm:grid-cols-2">
          {filteredGames.map((game) => {
            const Icon = game.icon || Brain;
            const gameStrings = getGameStrings(game.id, locale);
            const cardTitle = gameStrings.title || (t.has(game.titleKey) ? t(game.titleKey) : game.domain);
            const cardDesc = gameStrings.introSubtitle || (t.has(game.descKey) ? t(game.descKey) : "");
            const voiceText = `${cardTitle}. ${gameStrings.audioPrompt || cardDesc}`;
            const levelLabel = hub.levelAdaptive.replace("{level}", String(startLevel(detail)));

            return (
              <Link
                key={game.id}
                href={`/patient/games/${game.id}`}
                data-voice-desc={voiceText}
                className="game-card btn-tactile group flex flex-col justify-between gap-4 rounded-3xl border-3 border-black bg-surface p-5 shadow-[4px_4px_0px_#000] transition-transform hover:scale-[1.01] cursor-pointer relative"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-3 border-black text-white shadow-[3px_3px_0px_#000] ${game.accent}`}
                  >
                    <Icon className="h-8 w-8 text-white stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-lg sm:text-xl font-black text-ink leading-snug">
                        {cardTitle}
                      </span>

                      {/* Quick Audio Preview Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSpeak(voiceText);
                        }}
                        className="btn-tactile flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border-2 border-black bg-amber-100 text-ink hover:bg-amber-200 cursor-pointer shadow-[2px_2px_0px_#000] shrink-0"
                        title={hub.listenGuide}
                        aria-label={`Listen to description of ${cardTitle}`}
                      >
                        <Volume2 className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-amber-900" />
                      </button>
                    </div>

                    <p className="mt-2 text-sm sm:text-base font-semibold text-ink-secondary line-clamp-2 leading-relaxed">
                      {cardDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t-2 border-black/15 pt-3 text-xs sm:text-sm font-bold text-ink-secondary">
                  <span className="text-tea font-black">{levelLabel}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="btn-tactile rounded-xl bg-tea px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-black text-white group-hover:bg-emerald-800 border-2 border-black shadow-[2px_2px_0px_#000] flex items-center gap-2">
                      <span>{hub.startSession}</span>
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
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
