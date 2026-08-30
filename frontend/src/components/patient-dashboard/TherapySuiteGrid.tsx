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
          className="text-xs font-black text-tea flex items-center gap-1 hover:underline"
        >
          <span>View All Modules</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-3.5 grid gap-4 md:grid-cols-2">
        {/* AI Reminiscence Card */}
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

        {/* AI Detective Card */}
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
      </div>

      {/* Quick Access horizontal pills */}
      <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
        <Link
          href="/patient/games/storybook"
          className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-800/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-amber-800/20 shadow-sm"
        >
          <BookOpen className="h-3.5 w-3.5 text-amber-800" /> Living Chronicle
        </Link>
        <Link
          href="/patient/games/jigsaw"
          className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-tea/20 shadow-sm"
        >
          <Grid3X3 className="h-3.5 w-3.5 text-tea" /> Jigsaw Puzzle
        </Link>
        <Link
          href="/patient/games/wayfinding"
          className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-emerald-800/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-emerald-800/20 shadow-sm"
        >
          <Compass className="h-3.5 w-3.5 text-emerald-800" /> Wayfinding
        </Link>
        <Link
          href="/patient/games/tea-harvest"
          className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-emerald-600/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-emerald-600/20 shadow-sm"
        >
          <Leaf className="h-3.5 w-3.5 text-emerald-600" /> Tea Harvest
        </Link>
        <Link
          href="/patient/games/radio"
          className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-800/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-amber-800/20 shadow-sm"
        >
          <Radio className="h-3.5 w-3.5 text-amber-800" /> Akashvani Radio
        </Link>
        <Link
          href="/patient/games/lotus-lake"
          className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-teal-600/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-teal-600/20 shadow-sm"
        >
          <Flower2 className="h-3.5 w-3.5 text-teal-600" /> Lotus Lake
        </Link>
        <Link
          href="/patient/games/heritage-kitchen"
          className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-terracotta/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-terracotta/20 shadow-sm"
        >
          <Utensils className="h-3.5 w-3.5 text-terracotta" /> Kitchen
        </Link>
        <Link
          href="/patient/games/root-bridge"
          className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-green-800/10 px-3 py-1.5 text-xs font-black text-ink shrink-0 hover:bg-green-800/20 shadow-sm"
        >
          <GitFork className="h-3.5 w-3.5 text-green-800" /> Root Bridge
        </Link>
      </div>
    </section>
  );
}
