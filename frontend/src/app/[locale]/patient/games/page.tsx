"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Brain,
  Paperclip,
  ShieldCheck,
  ArrowRight,
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
} from "lucide-react";
import { GAMES, type ClinicalDomain } from "@/games/registry";
import { usePatientDetail } from "@/games/usePatientDetail";
import { startLevel } from "@/games/config";
import { GameError, GameLoading } from "@/components/games/GameState";
import { MajuliWalk3D } from "@/components/games/MajuliWalk3D";
import { TeaHarvestVision } from "@/components/games/TeaHarvestVision";
import { ArrowEscape } from "@/components/games/ArrowEscape";
import { BihuDholBeats } from "@/components/games/BihuDholBeats";
import { VoiceOfBrahmaputra } from "@/components/games/VoiceOfBrahmaputra";

type FilterKey = "all" | ClinicalDomain;
type ActiveModalGame = "majuli-walk" | "tea-harvest-vision" | "arrow-escape" | "bihu-dhol" | "brahmaputra-voice" | null;

export default function GamesHubPage() {
  const t = useTranslations("games");
  const { detail, loading, error, reload } = usePatientDetail();
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>("all");
  const [activeModalGame, setActiveModalGame] = useState<ActiveModalGame>(null);

  const filteredGames = GAMES.filter((g) => {
    if (selectedFilter === "all") return true;
    return g.category === selectedFilter;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Active Modal Fullscreen Game Overlay with Clear Elderly-Friendly Exit Button */}
      {activeModalGame && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-6 animate-fade-in flex flex-col items-center justify-start">
          <div className="sticky top-2 z-50 w-full max-w-4xl flex items-center justify-between bg-ink/90 border-3 border-black text-white p-3 rounded-2xl shadow-[4px_4px_0px_#000] mb-3">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-serif font-black text-sm sm:text-base text-white">
                {activeModalGame === "majuli-walk"
                  ? "🏞️ Majuli Village Walk (3D Spatial Memory)"
                  : activeModalGame === "tea-harvest-vision"
                  ? "🌿 Tea Garden Harvest (Motion Tracking)"
                  : activeModalGame === "bihu-dhol"
                  ? "🥁 Bihu Dhol Beats (Rhythm & Grounding)"
                  : activeModalGame === "brahmaputra-voice"
                  ? "🌊 Voice of the Brahmaputra (Spoken Recall)"
                  : "🎋 Pathways: Bamboo Arrow Labyrinth"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveModalGame(null)}
              className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-white bg-rose-600 px-4 py-2 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-rose-700 cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>Exit Game / Back to Hub</span>
            </button>
          </div>

          <div className="w-full max-w-4xl rounded-3xl overflow-hidden bg-[#FAF6F0] shadow-2xl border-4 border-black">
            {activeModalGame === "majuli-walk" && <MajuliWalk3D />}
            {activeModalGame === "tea-harvest-vision" && <TeaHarvestVision />}
            {activeModalGame === "arrow-escape" && <ArrowEscape />}
            {activeModalGame === "bihu-dhol" && <BihuDholBeats />}
            {activeModalGame === "brahmaputra-voice" && <VoiceOfBrahmaputra />}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b-3 border-black pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 text-tea">
            <Paperclip className="h-4 w-4 text-ink" />
            <span className="text-[11px] font-black uppercase tracking-wider text-ink">
              MDoNER Cognitive Digital Therapeutics (CDTx) Suite
            </span>
          </div>
          <h1 className="font-serif text-3xl font-black text-ink flex items-center gap-2">
            <Brain className="h-8 w-8 text-tea shrink-0" /> Cognitive Therapy Modules
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-ink-secondary mt-1">
            Culturally tailored spatial, kinesthetic, and memory games for elderly dementia care in North East India
          </p>
        </div>

        <Link
          href="/patient"
          className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-4 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted"
        >
          {t("backToRoutine")}
        </Link>
      </div>

      {/* ========================================================================= */}
      {/* FEATURED SPATIAL & COMPUTER VISION EXPERIENCES HERO SHOWCASE              */}
      {/* ========================================================================= */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-600" />
          <span className="text-xs font-black uppercase tracking-wider text-ink">
            Featured Spatial & Motion Interactive Modules
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
                <span className="text-xs font-black text-white/80">Majuli Island</span>
              </div>

              <h2 className="font-serif text-lg font-black text-white">
                Majuli Village Walk
              </h2>
              <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                Take a serene 3D sunrise walk along the Brahmaputra riverbank and recall traditional landmarks.
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
                <span>Play 3D</span>
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
                <span className="text-xs font-black text-white/80">Assam Hills</span>
              </div>

              <h2 className="font-serif text-lg font-black text-white">
                Tea Garden Harvest
              </h2>
              <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                Wave your hand in the air to pluck tender two leaves and a bud into your traditional basket.
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
                <span>Play Vision</span>
              </button>
            </div>
          </div>

          {/* 3. Bihu Dhol Beats (Rhythm & Grounding) */}
          <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-br from-[#78350F] to-[#451A03] p-5 text-white shadow-[6px_6px_0px_#000] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black uppercase text-amber-950 shadow-sm flex items-center gap-1">
                  <Activity className="h-3.5 w-3.5" /> Web Audio Drum
                </span>
                <span className="text-xs font-black text-white/80">Folk Rhythm</span>
              </div>

              <h2 className="font-serif text-lg font-black text-white">
                Bihu Dhol Beats
              </h2>
              <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                Tap the traditional dhol in sync with gentle Assamese beats to reduce agitation and ground motor rhythm.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/70">Adaptive BPM</span>
              <button
                type="button"
                onClick={() => setActiveModalGame("bihu-dhol")}
                className="btn-tactile rounded-xl border-2 border-black bg-amber-300 px-3.5 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_#000] hover:bg-amber-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="h-3 w-3 fill-black" />
                <span>Play Drum</span>
              </button>
            </div>
          </div>

          {/* 4. Voice of the Brahmaputra (Spoken Recall & River Glow Canvas) */}
          <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-br from-[#0F2B38] to-[#0A1F29] p-5 text-white shadow-[6px_6px_0px_#000] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-cyan-300 px-3 py-1 text-[10px] font-black uppercase text-cyan-950 shadow-sm flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Speech Recall
                </span>
                <span className="text-xs font-black text-white/80">River Glow</span>
              </div>

              <h2 className="font-serif text-lg font-black text-white">
                Voice of Brahmaputra
              </h2>
              <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                Listen to the sacred river breeze and speak the completing word of the traditional folk verse.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
              <span className="text-[10px] font-bold text-white/70">Voice AI</span>
              <button
                type="button"
                onClick={() => setActiveModalGame("brahmaputra-voice")}
                className="btn-tactile rounded-xl border-2 border-black bg-cyan-300 px-3.5 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_#000] hover:bg-cyan-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Play className="h-3 w-3 fill-black" />
                <span>Play Voice</span>
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
          <span>All Modules ({GAMES.length})</span>
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
          <span>3D & Vision ({GAMES.filter((g) => g.category === "vision-3d").length})</span>
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
          <span>Reminiscence & Memory ({GAMES.filter((g) => g.category === "reminiscence").length})</span>
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
          <span>Attention & Spatial ({GAMES.filter((g) => g.category === "attention").length})</span>
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
          <span>Daily Living IADL ({GAMES.filter((g) => g.category === "iadl").length})</span>
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
          <span>Sensory Calming ({GAMES.filter((g) => g.category === "calm").length})</span>
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
            return (
              <Link
                key={game.id}
                href={`/patient/games/${game.id}`}
                className="btn-tactile group flex flex-col justify-between gap-3 rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000] transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-3 border-black text-white shadow-[3px_3px_0px_#000] ${game.accent}`}
                  >
                    <Icon className="h-7 w-7 text-white stroke-[2.5]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-black text-ink leading-tight">
                        {t.has(game.titleKey) ? t(game.titleKey) : game.domain}
                      </span>
                      {game.recommended && (
                        <span className="rounded-full bg-marigold px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white shadow-sm flex items-center gap-1">
                          <ShieldCheck className="h-2.5 w-2.5" /> CDTx
                        </span>
                      )}
                    </div>
                    <span className="inline-flex items-center gap-1 mt-1 rounded bg-tea-light px-2 py-0.5 text-[10px] font-extrabold text-tea border border-tea/30">
                      <Activity className="h-3 w-3" /> {game.domain}
                    </span>
                    <p className="mt-1.5 text-xs font-semibold text-ink-secondary line-clamp-2 leading-relaxed">
                      {t.has(game.descKey) ? t(game.descKey) : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t-2 border-black/10 pt-2 text-[11px] font-bold text-ink-secondary">
                  <span>Level {startLevel(detail)} Adaptive</span>
                  <span className="rounded-lg bg-tea px-2.5 py-1 text-xs font-black text-white group-hover:bg-emerald-800 flex items-center gap-1">
                    <span>Start Session</span>
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
