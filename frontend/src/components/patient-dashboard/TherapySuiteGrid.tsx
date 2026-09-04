"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Brain,
  Coffee,
  Search,
  BookOpen,
  Grid3X3,
  Compass,
  Leaf,
  Radio,
  Utensils,
  GitFork,
  ArrowRight,
  ShieldCheck,
  Music,
  Sparkles,
  Waves,
  Volume2,
} from "lucide-react";
import { getGameStrings } from "@/lib/gameI18n";
import { speakText, unlockAudio } from "@/lib/sound";
import { GAMES } from "@/games/registry";

interface TherapySuiteGridProps {
  gamesTitle: string;
}

const CARD = "border-3 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)]";

export function TherapySuiteGrid({ gamesTitle }: TherapySuiteGridProps) {
  const locale = useLocale();

  // Localized game definitions
  const chatStrings = getGameStrings("grandchild-chat", locale);
  const detectiveStrings = getGameStrings("memory-detective", locale);
  const drumStrings = getGameStrings("drum", locale);
  const alpanaStrings = getGameStrings("alpana", locale);

  const handleSpeak = (text: string) => {
    unlockAudio();
    speakText(text, locale, 0.82);
  };

  return (
    <section aria-labelledby="games-title">
      <div className="flex items-center justify-between border-b-2 border-black/15 pb-2">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-tea" />
          <h2 id="games-title" className="font-serif text-xl font-black text-ink">
            {gamesTitle}
          </h2>
        </div>
        <Link
          href="/patient/games"
          className="text-xs font-black text-tea flex items-center gap-1 hover:underline group cursor-pointer"
        >
          <span>View All {GAMES.length} Modules</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="mt-3.5 grid gap-4 sm:grid-cols-2">
        {/* 1. AI Reminiscence Card */}
        <Link
          href="/patient/games/grandchild-chat"
          data-voice-desc={`${chatStrings.title}. ${chatStrings.audioPrompt}`}
          className={`${CARD} game-card btn-tactile group flex flex-col justify-between gap-3 bg-tea p-5 text-white transition-transform hover:scale-[1.01]`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-white/40 bg-white/20 shadow-sm text-white">
              <Coffee className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white">
                    {chatStrings.title}
                  </span>
                  <span className="rounded-full bg-marigold px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-sm flex items-center gap-0.5">
                    <ShieldCheck className="h-2.5 w-2.5" /> CDTx
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSpeak(`${chatStrings.title}. ${chatStrings.audioPrompt}`);
                  }}
                  className="btn-tactile flex h-7 w-7 items-center justify-center rounded-lg border border-white/40 bg-white/20 text-white hover:bg-white/40 shadow-xs cursor-pointer"
                  title="Listen to Game Audio Guide"
                  aria-label={`Listen to ${chatStrings.title}`}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="mt-1 text-xs font-semibold text-white/90 line-clamp-2 leading-relaxed">
                {chatStrings.introSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/20 pt-2 text-xs font-bold text-white/90">
            <span>Multi-Turn Dialogue</span>
            <span className="rounded-lg bg-white px-3 py-1 text-xs font-black text-tea shadow-sm group-hover:bg-surface-muted flex items-center gap-1">
              <span>{chatStrings.startButton || "Start Chat"}</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>

        {/* 2. AI Detective Card */}
        <Link
          href="/patient/games/memory-detective"
          data-voice-desc={`${detectiveStrings.title}. ${detectiveStrings.audioPrompt}`}
          className={`${CARD} game-card btn-tactile group flex flex-col justify-between gap-3 bg-[#2D3748] p-5 text-white transition-transform hover:scale-[1.01]`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-white/40 bg-white/20 shadow-sm text-white">
              <Search className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-amber-300">
                    {detectiveStrings.title}
                  </span>
                  <span className="rounded-full bg-marigold px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
                    3-Tier Recall
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSpeak(`${detectiveStrings.title}. ${detectiveStrings.audioPrompt}`);
                  }}
                  className="btn-tactile flex h-7 w-7 items-center justify-center rounded-lg border border-white/40 bg-white/20 text-white hover:bg-white/40 shadow-xs cursor-pointer"
                  title="Listen to Game Audio Guide"
                  aria-label={`Listen to ${detectiveStrings.title}`}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="mt-1 text-xs font-semibold text-white/90 line-clamp-2 leading-relaxed">
                {detectiveStrings.introSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/20 pt-2 text-xs font-bold text-white/90">
            <span>Face Recognition</span>
            <span className="rounded-lg bg-marigold px-3 py-1 text-xs font-black text-white shadow-sm group-hover:bg-amber-600 flex items-center gap-1">
              <span>{detectiveStrings.startButton || "Identify"}</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>

        {/* 3. 3D Bihu Dhol Drummer */}
        <Link
          href="/patient/games/drum"
          data-voice-desc={`${drumStrings.title}. ${drumStrings.audioPrompt}`}
          className={`${CARD} game-card btn-tactile group flex flex-col justify-between gap-3 bg-[#D97706] p-5 text-white transition-transform hover:scale-[1.01]`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-white/40 bg-white/20 shadow-sm text-white">
              <Music className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white">
                    {drumStrings.title}
                  </span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-black uppercase text-amber-900 shadow-sm">
                    Air-Drum
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSpeak(`${drumStrings.title}. ${drumStrings.audioPrompt}`);
                  }}
                  className="btn-tactile flex h-7 w-7 items-center justify-center rounded-lg border border-white/40 bg-white/20 text-white hover:bg-white/40 shadow-xs cursor-pointer"
                  title="Listen to Game Audio Guide"
                  aria-label={`Listen to ${drumStrings.title}`}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="mt-1 text-xs font-semibold text-white/90 line-clamp-2 leading-relaxed">
                {drumStrings.introSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/20 pt-2 text-xs font-bold text-white/90">
            <span>Bilateral Motor</span>
            <span className="rounded-lg bg-white px-3 py-1 text-xs font-black text-amber-900 shadow-sm group-hover:bg-surface-muted flex items-center gap-1">
              <span>{drumStrings.startButton || "Play Beats"}</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>

        {/* 4. Sacred Alpana Sand Drawing */}
        <Link
          href="/patient/games/alpana"
          data-voice-desc={`${alpanaStrings.title}. ${alpanaStrings.audioPrompt}`}
          className={`${CARD} game-card btn-tactile group flex flex-col justify-between gap-3 bg-[#581C87] p-5 text-white transition-transform hover:scale-[1.01]`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-white/40 bg-white/20 shadow-sm text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-white">
                    {alpanaStrings.title}
                  </span>
                  <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black uppercase text-purple-950 shadow-sm">
                    Air-Canvas
                  </span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSpeak(`${alpanaStrings.title}. ${alpanaStrings.audioPrompt}`);
                  }}
                  className="btn-tactile flex h-7 w-7 items-center justify-center rounded-lg border border-white/40 bg-white/20 text-white hover:bg-white/40 shadow-xs cursor-pointer"
                  title="Listen to Game Audio Guide"
                  aria-label={`Listen to ${alpanaStrings.title}`}
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <p className="mt-1 text-xs font-semibold text-white/90 line-clamp-2 leading-relaxed">
                {alpanaStrings.introSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/20 pt-2 text-xs font-bold text-white/90">
            <span>Visuospatial Flow</span>
            <span className="rounded-lg bg-amber-400 px-3 py-1 text-xs font-black text-purple-950 shadow-sm group-hover:bg-amber-300 flex items-center gap-1">
              <span>{alpanaStrings.startButton || "Draw Motif"}</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Access horizontal pills for additional games */}
      <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        {[
          { id: "river-lanterns", icon: Waves, color: "bg-teal-800/15 text-teal-800" },
          { id: "storybook", icon: BookOpen, color: "bg-amber-800/15 text-amber-800" },
          { id: "jigsaw", icon: Grid3X3, color: "bg-tea/15 text-tea" },
          { id: "wayfinding", icon: Compass, color: "bg-emerald-800/15 text-emerald-800" },
          { id: "tea-harvest", icon: Leaf, color: "bg-emerald-600/15 text-emerald-600" },
          { id: "radio", icon: Radio, color: "bg-amber-800/15 text-amber-800" },
          { id: "heritage-kitchen", icon: Utensils, color: "bg-terracotta/15 text-terracotta" },
          { id: "root-bridge", icon: GitFork, color: "bg-green-800/15 text-green-800" },
        ].map((item) => {
          const itemStrings = getGameStrings(item.id, locale);
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.id}
              href={`/patient/games/${item.id}`}
              data-voice-desc={`${itemStrings.title}. ${itemStrings.audioPrompt}`}
              className={`btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black px-3.5 py-2 text-xs font-black text-ink shrink-0 hover:bg-amber-100 shadow-xs ${item.color}`}
            >
              <ItemIcon className="h-3.5 w-3.5" />
              <span>{itemStrings.title}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
