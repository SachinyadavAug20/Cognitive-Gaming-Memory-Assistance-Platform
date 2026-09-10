"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Brain,
  Grid3X3,
  Footprints,
  Sparkles,
  Route,
  ArrowRight,
  Volume2,
  Play,
} from "lucide-react";
import { getGameStrings } from "@/lib/gameI18n";
import { speakText, unlockAudio } from "@/lib/sound";
import { ActivityIllustration } from "@/components/ui/ActivityIllustrations";

interface TherapySuiteGridProps {
  gamesTitle: string;
}

const CARD = "border-3 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)]";

const LOCALIZED_VIEW_ALL: Record<string, string> = {
  en: "View All Activities",
  hi: "सभी गतिविधियां देखें",
  as: "সকলো কাৰ্যকলাপ চাওক",
  bn: "সকল কার্যকলাপ দেখুন",
  mr: "सर्व उपक्रम पहा",
  ne: "सबै गतिविधिहरू हेर्नुहोस्",
  mni: "পুম্নমক য়েংবা",
  brx: "गासै हाबाफोर नाय",
  grt: "Pilak Kamrangko Nibo",
  kha: "Peit ia Baroh Ki Kam",
  lus: "Hnathawh Zawng Zawng En Rawh",
};

const LOCALIZED_EXPLORE_ALL: Record<string, string> = {
  en: "Explore All Brain Activities",
  hi: "सभी मस्तिष्क गतिविधियां देखें",
  as: "সকলো মগজুৰ কাৰ্যকলাপ চাওক",
  bn: "সকল মস্তিষ্ক কার্যকলাপ দেখুন",
  mr: "सर्व मेंदूचे उपक्रम पहा",
  ne: "सबै मस्तिष्क गतिविधिहरू हेर्नुहोस्",
  mni: "ৱাখলগী থবক পুম্নমক য়েংবা",
  brx: "गासै मेमरि हाबाफोर नाय",
  grt: "Pilak Gisik Kamrangko Nibo",
  kha: "Pule Baroh Ki Jingtrei Ban Pynkhlain Jingmut",
  lus: "Thluak Tihchakna Hnathawh Zawng Zawng En Rawh",
};

export function TherapySuiteGrid({ gamesTitle }: TherapySuiteGridProps) {
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const viewAllText = LOCALIZED_VIEW_ALL[normLoc] || LOCALIZED_VIEW_ALL.en;
  const exploreAllText = LOCALIZED_EXPLORE_ALL[normLoc] || LOCALIZED_EXPLORE_ALL.en;

  // Localized game definitions for the Top 4 featured games on My Routine
  const jigsawStrings = getGameStrings("jigsaw", locale);
  const majuliStrings = getGameStrings("majuli-walk", locale);
  const loomStrings = getGameStrings("loom", locale);
  const roadStrings = getGameStrings("memory-road", locale);

  const handleSpeak = (text: string) => {
    unlockAudio();
    speakText(text, locale, 0.82);
  };

  return (
    <section aria-labelledby="games-title">
      {/* Featured Calming Memories & Sounds */}
      <div className="mt-4 rounded-2xl border-3 border-black bg-gradient-to-r from-emerald-950 via-teal-950 to-emerald-900 p-4 sm:p-5 text-white shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/20 shadow-sm text-white">
            <Sparkles className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl font-black text-white leading-tight">
            Echoes of Home — Peaceful Sounds & Memories
          </h3>
        </div>
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSpeak("Echoes of Home. Peaceful sounds and family memories.");
            }}
            className="btn-tactile flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-2xl border-2 border-black bg-amber-300 text-amber-950 hover:bg-amber-200 shadow-[2px_2px_0px_#000] cursor-pointer"
            title="Read for Me"
            aria-label="Read for Me"
          >
            <Volume2 className="h-6 w-6 stroke-[2.5]" />
          </button>
          <Link
            href="/patient/echoes-of-home"
            className="btn-tactile flex items-center gap-2 rounded-xl border-2 border-black bg-white px-5 py-2.5 text-sm font-black text-emerald-950 shadow-[2px_2px_0px_#000] hover:bg-emerald-50 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-emerald-950" />
            <span>Open Memories</span>
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* 1. Picture Puzzle (jigsaw) - Warm Peach */}
        <Link
          href="/patient/games/jigsaw"
          data-voice-desc={`${jigsawStrings.title}. ${jigsawStrings.audioPrompt}`}
          className={`${CARD} game-card btn-tactile group flex flex-col justify-between items-center text-center gap-4 bg-[#FDBA74] p-5 text-ink transition-transform hover:scale-[1.01]`}
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between gap-2 border-b-2 border-black/20 pb-2.5">
            <div className="flex items-center gap-2.5 text-black font-black text-sm sm:text-base tracking-wider uppercase truncate">
              <Grid3X3 className="h-7 w-7 text-black stroke-[2.5] shrink-0" />
              <span className="truncate">{jigsawStrings.title}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSpeak(`${jigsawStrings.title}. ${jigsawStrings.audioPrompt}`);
              }}
              className="btn-tactile flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border-2 border-black bg-white text-black hover:bg-amber-200 shadow-[2px_2px_0px_#000] cursor-pointer shrink-0"
              title="Read for Me"
              aria-label={`Read for Me: ${jigsawStrings.title}`}
            >
              <Volume2 className="h-6 w-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Center Visual: Picture Puzzle Illustration */}
          <div className="my-2 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl border-3 border-black bg-white shadow-[3px_3px_0px_#000] p-1.5">
            <ActivityIllustration gameId="jigsaw" className="h-12 w-12 sm:h-14 sm:w-14" />
          </div>

          {/* Action Button */}
          <div className="w-full rounded-2xl border-2 border-black bg-white py-3 px-4 text-xs sm:text-sm font-black text-black shadow-[3px_3px_0px_#000] uppercase tracking-wide flex items-center justify-center gap-2 group-hover:bg-black group-hover:text-white transition-all">
            <span>{jigsawStrings.startButton || "Play Puzzle"}</span>
            <span>➔</span>
          </div>
        </Link>

        {/* 2. Walking Through the Village (majuli-walk) - Warm Mint */}
        <Link
          href="/patient/games/majuli-walk"
          data-voice-desc={`${majuliStrings.title}. ${majuliStrings.audioPrompt}`}
          className={`${CARD} game-card btn-tactile group flex flex-col justify-between items-center text-center gap-4 bg-[#6EE7B7] p-5 text-ink transition-transform hover:scale-[1.01]`}
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between gap-2 border-b-2 border-black/20 pb-2.5">
            <div className="flex items-center gap-2.5 text-black font-black text-sm sm:text-base tracking-wider uppercase truncate">
              <Footprints className="h-7 w-7 text-black stroke-[2.5] shrink-0" />
              <span className="truncate">{majuliStrings.title}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSpeak(`${majuliStrings.title}. ${majuliStrings.audioPrompt}`);
              }}
              className="btn-tactile flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border-2 border-black bg-white text-black hover:bg-amber-200 shadow-[2px_2px_0px_#000] cursor-pointer shrink-0"
              title="Read for Me"
              aria-label={`Read for Me: ${majuliStrings.title}`}
            >
              <Volume2 className="h-6 w-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Center Visual: Village Walk Illustration */}
          <div className="my-2 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl border-3 border-black bg-white shadow-[3px_3px_0px_#000] p-1.5">
            <ActivityIllustration gameId="majuli-walk" className="h-12 w-12 sm:h-14 sm:w-14" />
          </div>

          {/* Action Button */}
          <div className="w-full rounded-2xl border-2 border-black bg-white py-3 px-4 text-xs sm:text-sm font-black text-black shadow-[3px_3px_0px_#000] uppercase tracking-wide flex items-center justify-center gap-2 group-hover:bg-black group-hover:text-white transition-all">
            <span>{majuliStrings.startButton || "Start Walk"}</span>
            <span>➔</span>
          </div>
        </Link>

        {/* 3. The Loom of Memories (loom) - Warm Amber Gold */}
        <Link
          href="/patient/games/loom"
          data-voice-desc={`${loomStrings.title}. ${loomStrings.audioPrompt}`}
          className={`${CARD} game-card btn-tactile group flex flex-col justify-between items-center text-center gap-4 bg-[#FCD34D] p-5 text-ink transition-transform hover:scale-[1.01]`}
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between gap-2 border-b-2 border-black/20 pb-2.5">
            <div className="flex items-center gap-2.5 text-black font-black text-sm sm:text-base tracking-wider uppercase truncate">
              <Sparkles className="h-7 w-7 text-black stroke-[2.5] shrink-0" />
              <span className="truncate">{loomStrings.title}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSpeak(`${loomStrings.title}. ${loomStrings.audioPrompt}`);
              }}
              className="btn-tactile flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border-2 border-black bg-white text-black hover:bg-amber-200 shadow-[2px_2px_0px_#000] cursor-pointer shrink-0"
              title="Read for Me"
              aria-label={`Read for Me: ${loomStrings.title}`}
            >
              <Volume2 className="h-6 w-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Center Visual: Weaving Loom Illustration */}
          <div className="my-2 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl border-3 border-black bg-white shadow-[3px_3px_0px_#000] p-1.5">
            <ActivityIllustration gameId="loom" className="h-12 w-12 sm:h-14 sm:w-14" />
          </div>

          {/* Action Button */}
          <div className="w-full rounded-2xl border-2 border-black bg-white py-3 px-4 text-xs sm:text-sm font-black text-black shadow-[3px_3px_0px_#000] uppercase tracking-wide flex items-center justify-center gap-2 group-hover:bg-black group-hover:text-white transition-all">
            <span>{loomStrings.startButton || "Weave Silk"}</span>
            <span>➔</span>
          </div>
        </Link>

        {/* 4. Finding Signs on the Road (memory-road) - Warm Apricot */}
        <Link
          href="/patient/games/memory-road"
          data-voice-desc={`${roadStrings.title}. ${roadStrings.audioPrompt}`}
          className={`${CARD} game-card btn-tactile group flex flex-col justify-between items-center text-center gap-4 bg-[#FED7AA] p-5 text-ink transition-transform hover:scale-[1.01]`}
        >
          {/* Header */}
          <div className="w-full flex items-center justify-between gap-2 border-b-2 border-black/20 pb-2.5">
            <div className="flex items-center gap-2.5 text-black font-black text-sm sm:text-base tracking-wider uppercase truncate">
              <Route className="h-7 w-7 text-black stroke-[2.5] shrink-0" />
              <span className="truncate">{roadStrings.title}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSpeak(`${roadStrings.title}. ${roadStrings.audioPrompt}`);
              }}
              className="btn-tactile flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl border-2 border-black bg-white text-black hover:bg-amber-200 shadow-[2px_2px_0px_#000] cursor-pointer shrink-0"
              title="Read for Me"
              aria-label={`Read for Me: ${roadStrings.title}`}
            >
              <Volume2 className="h-6 w-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Center Visual: Road Sign Illustration */}
          <div className="my-2 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl border-3 border-black bg-white shadow-[3px_3px_0px_#000] p-1.5">
            <ActivityIllustration gameId="memory-road" className="h-12 w-12 sm:h-14 sm:w-14" />
          </div>

          {/* Action Button */}
          <div className="w-full rounded-2xl border-2 border-black bg-white py-3 px-4 text-xs sm:text-sm font-black text-black shadow-[3px_3px_0px_#000] uppercase tracking-wide flex items-center justify-center gap-2 group-hover:bg-black group-hover:text-white transition-all">
            <span>{roadStrings.startButton || "Find Signs"}</span>
            <span>➔</span>
          </div>
        </Link>
      </div>

      {/* Clear View All Activities Call-to-Action for Elders */}
      <div className="mt-4">
        <Link
          href="/patient/games"
          className="btn-tactile w-full flex items-center justify-center gap-3 rounded-2xl border-3 border-black bg-surface hover:bg-tea hover:text-white p-4 text-base sm:text-lg font-black text-ink shadow-[4px_4px_0px_#000] transition-colors cursor-pointer group"
        >
          <span>{exploreAllText}</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
