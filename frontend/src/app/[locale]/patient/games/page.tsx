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
import { GameError, GameLoading } from "@/components/games/GameState";
import { MajuliWalk3D } from "@/components/games/MajuliWalk3D";
import { TeaHarvestVision } from "@/components/games/TeaHarvestVision";
import { ArrowEscape } from "@/components/games/ArrowEscape";
import { BihuDholBeats } from "@/components/games/BihuDholBeats";
import { DayInMyWorld3D } from "@/components/games/DayInMyWorld3D";
import { speakText, unlockAudio } from "@/lib/sound";
import { getGameStrings, getHubStrings } from "@/lib/gameI18n";

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

  const handleSpeak = (text: string) => {
    unlockAudio();
    speakText(text, locale, 0.82);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Active Modal Fullscreen Game Overlay with Clear Elderly-Friendly Exit Button */}
      {activeModalGame && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-6 animate-fade-in flex flex-col items-center justify-start">
          <div className="sticky top-2 z-50 w-full max-w-4xl flex items-center justify-between bg-ink/90 border-3 border-black text-white p-3 rounded-2xl shadow-[4px_4px_0px_#000] mb-3">
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-base sm:text-lg">
                {activeModalGame === "day-in-my-world" && dayInWorld.title}
                {activeModalGame === "majuli-walk" && majuliWalk.title}
                {activeModalGame === "tea-harvest-vision" && teaHarvest.title}
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

      {/* Header */}
      <div className="mb-6 rounded-3xl border-4 border-black bg-surface p-5 sm:p-6 shadow-[6px_6px_0px_#000]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-amber-200 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-amber-950 shadow-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-800" />
                {hub.headerSub}
              </span>
              <span className="rounded-full bg-emerald-100 border border-emerald-800/30 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-900">
                Clinical CDTx Protocol
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-black text-ink flex items-center gap-2.5 pt-1">
              <Brain className="h-8 w-8 text-tea shrink-0" /> {hub.headerTitle}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-ink-secondary leading-relaxed">
              {hub.headerDesc}
            </p>

            {/* Clinical Highlights Pill Strip */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-[11px] font-bold text-ink-secondary">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 4 Flagship Interactive Modules
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 25+ Clinically Calibrated Therapies
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> 11 Regional Dialects
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSpeak(`${hub.headerTitle}. ${hub.headerDesc}`)}
              className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-100 px-3 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-200 cursor-pointer"
              title={hub.listenGuide}
            >
              <Volume2 className="h-4 w-4 text-amber-900" />
              <span className="hidden sm:inline">{hub.listenGuide}</span>
            </button>

            <Link
              href="/patient"
              className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-4 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Routine</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FEATURED SPATIAL & COMPUTER VISION EXPERIENCES HERO SHOWCASE              */}
      {/* ========================================================================= */}
      <div className="mb-8 space-y-4">
        {/* Flagship: A Day in My World 3D Story Campaign Banner */}
        <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 p-6 text-white shadow-[6px_6px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              <span>{hub.flagshipBadge}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
              {dayInWorld.introTitle || dayInWorld.title}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-amber-100 max-w-xl leading-relaxed">
              {dayInWorld.introSubtitle}
            </p>

            {/* Chapter progress preview pills */}
            <div className="hidden sm:flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-black uppercase tracking-wider text-amber-100">
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 1: Morning</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 2: Tea Essentials</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 3: Majuli Walk</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 4: Market Barter</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 5: Courtyard</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 6: Evening Calm</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleSpeak(`${dayInWorld.title}. ${dayInWorld.audioPrompt}`)}
              className="btn-tactile rounded-2xl border-3 border-black bg-amber-200 p-3.5 text-black shadow-[4px_4px_0px_#000] hover:bg-amber-300 cursor-pointer"
              title={hub.listenGuide}
            >
              <Volume2 className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setActiveModalGame("day-in-my-world")}
              className="btn-tactile rounded-2xl border-3 border-black bg-white px-6 py-3.5 text-sm font-black text-amber-950 shadow-[4px_4px_0px_#000] hover:bg-amber-100 flex items-center gap-2 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-amber-950" />
              <span>{hub.flagshipCta}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-black uppercase tracking-wider text-ink">
            {hub.featuredSectionTitle}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Majuli Village Walk (3D Spatial Memory) */}
          <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-br from-[#2D5A27] to-[#1E3F1A] p-5 text-white shadow-[6px_6px_0px_#000] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black uppercase text-amber-950 shadow-sm flex items-center gap-1">
                  <Footprints className="h-3.5 w-3.5" /> 3D Spatial
                </span>
                <button
                  type="button"
                  onClick={() => handleSpeak(`${majuliWalk.title}. ${majuliWalk.audioPrompt}`)}
                  className="btn-tactile flex h-6 w-6 items-center justify-center rounded-lg border border-white/40 bg-white/20 text-white hover:bg-white/40 shadow-xs cursor-pointer"
                  title={hub.listenGuide}
                >
                  <Volume2 className="h-3 w-3" />
                </button>
              </div>

              <h2 className="font-serif text-lg font-black text-white">
                {majuliWalk.title}
              </h2>
              <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                {majuliWalk.introSubtitle}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/70">GSAP Camera</span>
              <button
                type="button"
                onClick={() => setActiveModalGame("majuli-walk")}
                className="btn-tactile rounded-xl border-2 border-black bg-amber-400 px-3.5 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_#000] hover:bg-amber-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="h-3 w-3 fill-black" />
                <span>{hub.play3D}</span>
              </button>
            </div>
          </div>

          {/* 2. Tea Garden Harvest (Webcam Motion Tracking) */}
          <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-br from-[#14532D] to-[#064E3B] p-5 text-white shadow-[6px_6px_0px_#000] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-[10px] font-black uppercase text-emerald-950 shadow-sm flex items-center gap-1">
                  <Camera className="h-3.5 w-3.5" /> Motion Vision
                </span>
                <button
                  type="button"
                  onClick={() => handleSpeak(`${teaHarvest.title}. ${teaHarvest.audioPrompt}`)}
                  className="btn-tactile flex h-6 w-6 items-center justify-center rounded-lg border border-white/40 bg-white/20 text-white hover:bg-white/40 shadow-xs cursor-pointer"
                  title={hub.listenGuide}
                >
                  <Volume2 className="h-3 w-3" />
                </button>
              </div>

              <h2 className="font-serif text-lg font-black text-white">
                {teaHarvest.title}
              </h2>
              <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                {teaHarvest.introSubtitle}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/70">Webcam Flow</span>
              <button
                type="button"
                onClick={() => setActiveModalGame("tea-harvest-vision")}
                className="btn-tactile rounded-xl border-2 border-black bg-emerald-400 px-3.5 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_#000] hover:bg-emerald-300 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="h-3 w-3 fill-black" />
                <span>{hub.playVision}</span>
              </button>
            </div>
          </div>

          {/* 3. Bihu Dhol Beats & Grounding (Rhythm & Auditory-Motor) */}
          <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-br from-[#78350F] to-[#451A03] p-5 text-white shadow-[6px_6px_0px_#000] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black uppercase text-amber-950 shadow-sm flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5" /> Web Audio Drum
                </span>
                <button
                  type="button"
                  onClick={() => handleSpeak(`${bihuDhol.title}. ${bihuDhol.audioPrompt}`)}
                  className="btn-tactile flex h-6 w-6 items-center justify-center rounded-lg border border-white/40 bg-white/20 text-white hover:bg-white/40 shadow-xs cursor-pointer"
                  title={hub.listenGuide}
                >
                  <Volume2 className="h-3 w-3" />
                </button>
              </div>

              <h2 className="font-serif text-lg font-black text-white">
                {bihuDhol.title}
              </h2>
              <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                {bihuDhol.introSubtitle}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-200">Adaptive BPM</span>
              <button
                type="button"
                onClick={() => setActiveModalGame("bihu-dhol")}
                className="btn-tactile rounded-xl border-2 border-black bg-amber-300 px-3.5 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_#000] hover:bg-amber-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="h-3 w-3 fill-black" />
                <span>{hub.playDrum}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 5 Evidence-Based Clinical Domain Filter Tabs */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedFilter("all")}
          className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "all"
              ? "border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>{hub.filterAll} ({GAMES.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("vision-3d")}
          className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "vision-3d"
              ? "border-black bg-teal-800 text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{hub.filterVision3D} ({GAMES.filter((g) => g.category === "vision-3d").length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("reminiscence")}
          className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "reminiscence"
              ? "border-black bg-purple-700 text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
          }`}
        >
          <Brain className="h-3.5 w-3.5" />
          <span>{hub.filterReminiscence} ({GAMES.filter((g) => g.category === "reminiscence").length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("attention")}
          className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "attention"
              ? "border-black bg-emerald-700 text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
          }`}
        >
          <Compass className="h-3.5 w-3.5" />
          <span>{hub.filterAttention} ({GAMES.filter((g) => g.category === "attention").length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("iadl")}
          className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "iadl"
              ? "border-black bg-amber-700 text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
          }`}
        >
          <Utensils className="h-3.5 w-3.5" />
          <span>{hub.filterIadl} ({GAMES.filter((g) => g.category === "iadl").length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedFilter("calm")}
          className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
            selectedFilter === "calm"
              ? "border-black bg-teal-700 text-white shadow-[2px_2px_0px_#000]"
              : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
          }`}
        >
          <Flower2 className="h-3.5 w-3.5" />
          <span>{hub.filterCalm} ({GAMES.filter((g) => g.category === "calm").length})</span>
        </button>
      </div>

      {loading ? (
        <GameLoading />
      ) : error ? (
        <GameError onRetry={reload} />
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
                className="game-card btn-tactile group flex flex-col justify-between gap-3 rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000] transition-transform hover:scale-[1.02] cursor-pointer relative"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-3 border-black text-white shadow-[3px_3px_0px_#000] ${game.accent}`}
                  >
                    <Icon className="h-7 w-7 text-white stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-black text-ink leading-tight">
                          {cardTitle}
                        </span>
                        {game.recommended && (
                          <span className="rounded-full bg-marigold px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm flex items-center gap-1">
                            <ShieldCheck className="h-2.5 w-2.5" /> CDTx
                          </span>
                        )}
                      </div>

                      {/* Quick Audio Preview Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSpeak(voiceText);
                        }}
                        className="btn-tactile flex h-7 w-7 items-center justify-center rounded-lg border border-black/30 bg-amber-100 text-ink hover:bg-amber-300 hover:border-black cursor-pointer shadow-xs"
                        title={hub.listenGuide}
                        aria-label={`Listen to description of ${cardTitle}`}
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <span className="inline-flex items-center gap-1 mt-1 rounded bg-tea-light px-2 py-0.5 text-[10px] font-extrabold text-tea border border-tea/30">
                      <Activity className="h-3 w-3" /> {game.domain}
                    </span>
                    <p className="mt-1.5 text-xs font-semibold text-ink-secondary line-clamp-2 leading-relaxed">
                      {cardDesc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t-2 border-black/10 pt-2 text-[11px] font-bold text-ink-secondary">
                  <span>{levelLabel}</span>
                  <span className="rounded-lg bg-tea px-2.5 py-1 text-xs font-black text-white group-hover:bg-emerald-800 flex items-center gap-1">
                    <span>{hub.startSession}</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
