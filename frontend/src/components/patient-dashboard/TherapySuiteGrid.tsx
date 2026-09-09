"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Brain,
  Coffee,
  Search,
  ArrowRight,
  Music,
  Sparkles,
  Volume2,
  Play,
} from "lucide-react";
import { getGameStrings } from "@/lib/gameI18n";
import { speakText, unlockAudio } from "@/lib/sound";

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
      <div className="flex items-center justify-between border-b-2 border-black/15 pb-2.5">
        <div className="flex items-center gap-2.5">
          <Brain className="h-6 w-6 text-tea" />
          <h2 id="games-title" className="font-serif text-2xl sm:text-3xl font-black text-ink">
            {gamesTitle}
          </h2>
        </div>
        <Link
          href="/patient/games"
          className="text-xs sm:text-sm font-black text-tea flex items-center gap-1 hover:underline group cursor-pointer"
        >
          <span>View All Games</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Featured Calming Memories & Sounds */}
      <div className="mt-4 rounded-2xl border-3 border-black bg-gradient-to-r from-teal-900 via-teal-800 to-cyan-900 p-5 text-white shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-serif text-xl sm:text-2xl font-black text-white">
            Echoes of Home — Peaceful Sounds & Memories
          </h3>
          <p className="text-sm sm:text-base text-teal-100/95 font-medium max-w-lg leading-relaxed">
            Relax with soothing sounds of rain, rivers, and temple bells. Look through cherished family photos and listen to loving voice notes.
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSpeak("Echoes of Home. Peaceful sounds and family memories. Relax with sounds of rain, rivers, temple bells, and loving family voices.");
            }}
            className="btn-tactile flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-teal-300 text-teal-950 hover:bg-teal-200 shadow-xs cursor-pointer"
            title="Listen to Guide"
          >
            <Volume2 className="h-5 w-5" />
          </button>
          <Link
            href="/patient/echoes-of-home"
            className="btn-tactile flex items-center gap-2 rounded-xl border-2 border-black bg-white px-5 py-2.5 text-sm font-black text-teal-950 shadow-[2px_2px_0px_#000] hover:bg-teal-50 cursor-pointer"
          >
            <Play className="h-4 w-4 fill-teal-950" />
            <span>Open Memories</span>
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {/* 1. AI Reminiscence Card */}
        <Link
          href="/patient/games/grandchild-chat"
          data-voice-desc={`${chatStrings.title}. ${chatStrings.audioPrompt}`}
          className={`${CARD} game-card btn-tactile group flex flex-col justify-between gap-3 bg-tea p-5 text-white transition-transform hover:scale-[1.01]`}
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/20 shadow-sm text-white">
              <Coffee className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                  {chatStrings.title}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSpeak(`${chatStrings.title}. ${chatStrings.audioPrompt}`);
                  }}
                  className="btn-tactile flex h-8 w-8 items-center justify-center rounded-xl border border-white/40 bg-white/20 text-white hover:bg-white/40 shadow-xs cursor-pointer shrink-0"
                  title="Listen to Game Audio Guide"
                  aria-label={`Listen to ${chatStrings.title}`}
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-1.5 text-sm sm:text-base font-medium text-white/95 line-clamp-2 leading-relaxed">
                {chatStrings.introSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end border-t border-white/20 pt-2.5 text-xs font-bold text-white/90">
            <span className="rounded-xl bg-white px-4 py-2 text-sm font-black text-tea shadow-sm group-hover:bg-surface-muted flex items-center gap-1.5">
              <span>{chatStrings.startButton || "Start Chat"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>

        {/* 2. AI Detective Card */}
        <Link
          href="/patient/games/memory-detective"
          data-voice-desc={`${detectiveStrings.title}. ${detectiveStrings.audioPrompt}`}
          className={`${CARD} game-card btn-tactile group flex flex-col justify-between gap-3 bg-[#2D3748] p-5 text-white transition-transform hover:scale-[1.01]`}
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/20 shadow-sm text-white">
              <Search className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-amber-300 leading-tight">
                  {detectiveStrings.title}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSpeak(`${detectiveStrings.title}. ${detectiveStrings.audioPrompt}`);
                  }}
                  className="btn-tactile flex h-8 w-8 items-center justify-center rounded-xl border border-white/40 bg-white/20 text-white hover:bg-white/40 shadow-xs cursor-pointer shrink-0"
                  title="Listen to Game Audio Guide"
                  aria-label={`Listen to ${detectiveStrings.title}`}
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-1.5 text-sm sm:text-base font-medium text-white/95 line-clamp-2 leading-relaxed">
                {detectiveStrings.introSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end border-t border-white/20 pt-2.5 text-xs font-bold text-white/90">
            <span className="rounded-xl bg-marigold px-4 py-2 text-sm font-black text-white shadow-sm group-hover:bg-amber-600 flex items-center gap-1.5">
              <span>{detectiveStrings.startButton || "Find Family"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>

        {/* 3. 3D Bihu Dhol Drummer */}
        <Link
          href="/patient/games/drum"
          data-voice-desc={`${drumStrings.title}. ${drumStrings.audioPrompt}`}
          className={`${CARD} game-card btn-tactile group flex flex-col justify-between gap-3 bg-[#D97706] p-5 text-white transition-transform hover:scale-[1.01]`}
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/20 shadow-sm text-white">
              <Music className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                  {drumStrings.title}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSpeak(`${drumStrings.title}. ${drumStrings.audioPrompt}`);
                  }}
                  className="btn-tactile flex h-8 w-8 items-center justify-center rounded-xl border border-white/40 bg-white/20 text-white hover:bg-white/40 shadow-xs cursor-pointer shrink-0"
                  title="Listen to Game Audio Guide"
                  aria-label={`Listen to ${drumStrings.title}`}
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-1.5 text-sm sm:text-base font-medium text-white/95 line-clamp-2 leading-relaxed">
                {drumStrings.introSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end border-t border-white/20 pt-2.5 text-xs font-bold text-white/90">
            <span className="rounded-xl bg-white px-4 py-2 text-sm font-black text-amber-900 shadow-sm group-hover:bg-surface-muted flex items-center gap-1.5">
              <span>{drumStrings.startButton || "Play Beats"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>

        {/* 4. Sacred Alpana Sand Drawing */}
        <Link
          href="/patient/games/alpana"
          data-voice-desc={`${alpanaStrings.title}. ${alpanaStrings.audioPrompt}`}
          className={`${CARD} game-card btn-tactile group flex flex-col justify-between gap-3 bg-[#581C87] p-5 text-white transition-transform hover:scale-[1.01]`}
        >
          <div className="flex items-start gap-3.5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-white/40 bg-white/20 shadow-sm text-white">
              <Sparkles className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
                  {alpanaStrings.title}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleSpeak(`${alpanaStrings.title}. ${alpanaStrings.audioPrompt}`);
                  }}
                  className="btn-tactile flex h-8 w-8 items-center justify-center rounded-xl border border-white/40 bg-white/20 text-white hover:bg-white/40 shadow-xs cursor-pointer shrink-0"
                  title="Listen to Game Audio Guide"
                  aria-label={`Listen to ${alpanaStrings.title}`}
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-1.5 text-sm sm:text-base font-medium text-white/95 line-clamp-2 leading-relaxed">
                {alpanaStrings.introSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-end border-t border-white/20 pt-2.5 text-xs font-bold text-white/90">
            <span className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-black text-purple-950 shadow-sm group-hover:bg-amber-300 flex items-center gap-1.5">
              <span>{alpanaStrings.startButton || "Start Drawing"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </Link>
      </div>

      {/* Clear View All Games Call-to-Action for Elders */}
      <div className="mt-4">
        <Link
          href="/patient/games"
          className="btn-tactile w-full flex items-center justify-center gap-3 rounded-2xl border-3 border-black bg-surface hover:bg-tea hover:text-white p-4 text-base sm:text-lg font-black text-ink shadow-[4px_4px_0px_#000] transition-colors cursor-pointer group"
        >
          <span>Explore All Brain Games & Activities</span>
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
