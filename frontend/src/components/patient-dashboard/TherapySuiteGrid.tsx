"use client";

import Link from "next/link";
import {
  Brain,
  Coffee,
  Search,
  BookOpen,
  Grid3X3,
  Compass,
  Leaf,
  Radio,
  Flower2,
  Utensils,
  GitFork,
  ArrowRight,
  ShieldCheck,
  Music,
  Sparkles,
  Waves,
} from "lucide-react";

interface TherapySuiteGridProps {
  gamesTitle: string;
}

const CARD = "border-3 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)]";

export function TherapySuiteGrid({ gamesTitle }: TherapySuiteGridProps) {
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
          <span>View All 18 Modules</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="mt-3.5 grid gap-4 sm:grid-cols-2">
        {/* 1. AI Reminiscence Card */}
        <Link
          href="/patient/games/grandchild-chat"
          className={`${CARD} btn-tactile group flex flex-col justify-between gap-3 bg-tea p-5 text-white transition-transform hover:scale-[1.01]`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-white/40 bg-white/20 shadow-sm text-white">
              <Coffee className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">
                  The Grandchild&apos;s Teatime Chat
                </span>
                <span className="rounded-full bg-marigold px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-sm flex items-center gap-0.5">
                  <ShieldCheck className="h-2.5 w-2.5" /> AI CDTx
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-white/90 line-clamp-2 leading-relaxed">
                Have a warm morning tea dialogue, share stories, and illuminate nostalgic family memories.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/20 pt-2 text-xs font-bold text-white/90">
            <span>Multi-Turn Dialogue</span>
            <span className="rounded-lg bg-white px-3 py-1 text-xs font-black text-tea shadow-sm group-hover:bg-surface-muted flex items-center gap-1">
              <span>Start Chat</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>

        {/* 2. AI Detective Card */}
        <Link
          href="/patient/games/memory-detective"
          className={`${CARD} btn-tactile group flex flex-col justify-between gap-3 bg-[#2D3748] p-5 text-white transition-transform hover:scale-[1.01]`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-white/40 bg-white/20 shadow-sm text-white">
              <Search className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-amber-300">
                  The Memory Detective
                </span>
                <span className="rounded-full bg-marigold px-2 py-0.5 text-[9px] font-black uppercase text-white shadow-sm">
                  3-Tier Recall
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-white/90 line-clamp-2 leading-relaxed">
                Listen to gentle clues from personal history and identify loved ones from verified portraits.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/20 pt-2 text-xs font-bold text-white/90">
            <span>Face Recognition</span>
            <span className="rounded-lg bg-marigold px-3 py-1 text-xs font-black text-white shadow-sm group-hover:bg-amber-600 flex items-center gap-1">
              <span>Identify</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>

        {/* 3. 3D Bihu Dhol Drummer */}
        <Link
          href="/patient/games/drum"
          className={`${CARD} btn-tactile group flex flex-col justify-between gap-3 bg-[#D97706] p-5 text-white transition-transform hover:scale-[1.01]`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-white/40 bg-white/20 shadow-sm text-white">
              <Music className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">
                  3D Folk Rhythm Drummer
                </span>
                <span className="rounded-full bg-white px-2 py-0.5 text-[9px] font-black uppercase text-amber-900 shadow-sm">
                  Air-Drum Vision
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-white/90 line-clamp-2 leading-relaxed">
                Play celebratory Bihu Dhol and Khasi Ksing beats with bilateral webcam air-drumming.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/20 pt-2 text-xs font-bold text-white/90">
            <span>Bilateral Motor</span>
            <span className="rounded-lg bg-white px-3 py-1 text-xs font-black text-amber-900 shadow-sm group-hover:bg-surface-muted flex items-center gap-1">
              <span>Play Beats</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>

        {/* 4. Sacred Alpana Sand Drawing */}
        <Link
          href="/patient/games/alpana"
          className={`${CARD} btn-tactile group flex flex-col justify-between gap-3 bg-[#581C87] p-5 text-white transition-transform hover:scale-[1.01]`}
        >
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-white/40 bg-white/20 shadow-sm text-white">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-white">
                  Sacred Alpana Sand Drawing
                </span>
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-black uppercase text-purple-950 shadow-sm">
                  Air-Canvas
                </span>
              </div>
              <p className="mt-1 text-xs font-semibold text-white/90 line-clamp-2 leading-relaxed">
                Wave your hand to trace sacred North Eastern lotus and festive floor motifs with stardust particles.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between border-t border-white/20 pt-2 text-xs font-bold text-white/90">
            <span>Visuospatial Flow</span>
            <span className="rounded-lg bg-amber-400 px-3 py-1 text-xs font-black text-purple-950 shadow-sm group-hover:bg-amber-300 flex items-center gap-1">
              <span>Draw Motif</span>
              <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
      </div>

      {/* Quick Access horizontal pills for additional games */}
      <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
        <Link
          href="/patient/games/river-lanterns"
          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-teal-800/15 px-3.5 py-2 text-xs font-black text-ink shrink-0 hover:bg-teal-800/25 shadow-xs"
        >
          <Waves className="h-3.5 w-3.5 text-teal-800" /> River Lanterns
        </Link>
        <Link
          href="/patient/games/storybook"
          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-800/15 px-3.5 py-2 text-xs font-black text-ink shrink-0 hover:bg-amber-800/25 shadow-xs"
        >
          <BookOpen className="h-3.5 w-3.5 text-amber-800" /> Living Chronicle
        </Link>
        <Link
          href="/patient/games/jigsaw"
          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea/15 px-3.5 py-2 text-xs font-black text-ink shrink-0 hover:bg-tea/25 shadow-xs"
        >
          <Grid3X3 className="h-3.5 w-3.5 text-tea" /> Jigsaw Puzzle
        </Link>
        <Link
          href="/patient/games/wayfinding"
          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-emerald-800/15 px-3.5 py-2 text-xs font-black text-ink shrink-0 hover:bg-emerald-800/25 shadow-xs"
        >
          <Compass className="h-3.5 w-3.5 text-emerald-800" /> Wayfinding
        </Link>
        <Link
          href="/patient/games/tea-harvest"
          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-emerald-600/15 px-3.5 py-2 text-xs font-black text-ink shrink-0 hover:bg-emerald-600/25 shadow-xs"
        >
          <Leaf className="h-3.5 w-3.5 text-emerald-600" /> Tea Harvest
        </Link>
        <Link
          href="/patient/games/radio"
          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-800/15 px-3.5 py-2 text-xs font-black text-ink shrink-0 hover:bg-amber-800/25 shadow-xs"
        >
          <Radio className="h-3.5 w-3.5 text-amber-800" /> Akashvani Radio
        </Link>
        <Link
          href="/patient/games/lotus-lake"
          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-teal-600/15 px-3.5 py-2 text-xs font-black text-ink shrink-0 hover:bg-teal-600/25 shadow-xs"
        >
          <Flower2 className="h-3.5 w-3.5 text-teal-600" /> Lotus Lake
        </Link>
        <Link
          href="/patient/games/heritage-kitchen"
          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-terracotta/15 px-3.5 py-2 text-xs font-black text-ink shrink-0 hover:bg-terracotta/25 shadow-xs"
        >
          <Utensils className="h-3.5 w-3.5 text-terracotta" /> Kitchen
        </Link>
        <Link
          href="/patient/games/root-bridge"
          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-green-800/15 px-3.5 py-2 text-xs font-black text-ink shrink-0 hover:bg-green-800/25 shadow-xs"
        >
          <GitFork className="h-3.5 w-3.5 text-green-800" /> Root Bridge
        </Link>
      </div>
    </section>
  );
}
