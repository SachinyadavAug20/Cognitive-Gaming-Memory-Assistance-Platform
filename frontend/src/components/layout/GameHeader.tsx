import { useState, useCallback } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Award, Paperclip, Volume2 } from "lucide-react";
import { AudioToggle } from "@/components/ui/AudioToggle";
import { speakText, stopSpeaking, unlockAudio } from "@/lib/sound";
import { getGameStrings, getHubStrings } from "@/lib/gameI18n";

interface GameHeaderProps {
  title: string;
  score: number;
  backHref: string;
  bgColor: string;
  audioPrompt?: string;
  gameId?: string;
}

export function GameHeader({
  title,
  score,
  backHref,
  bgColor,
  audioPrompt,
  gameId,
}: GameHeaderProps) {
  const locale = useLocale();
  const hub = getHubStrings(locale);
  const t = useTranslations("game");
  const rawBack = t("back") || hub.back;
  const cleanBack = rawBack.replace(/^[←\s]+/, "").trim();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const promptText =
    audioPrompt ||
    (gameId ? getGameStrings(gameId, locale).audioPrompt : undefined);

  const handlePlayGuide = useCallback(() => {
    if (!promptText) return;
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }
    unlockAudio();
    speakText(
      promptText,
      locale,
      0.82,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  }, [promptText, locale, isPlayingAudio]);

  return (
    <div className={`${bgColor} border-b-3 border-black px-4 sm:px-6 py-3.5 text-white shadow-sm select-none`}>
      <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
        <Link
          href={backHref}
          className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white/20 px-3 py-1.5 text-xs font-black text-white hover:bg-white/30 shadow-[2px_2px_0px_#000]"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{cleanBack}</span>
        </Link>
        <div className="flex items-center gap-2 min-w-0">
          <Paperclip className="h-4 w-4 text-white/80 shrink-0 hidden sm:inline" />
          <h1 className="font-serif font-black text-base sm:text-lg text-white truncate text-center">
            {title}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {promptText && (
            <button
              type="button"
              onClick={handlePlayGuide}
              className={`btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black px-2.5 py-1 text-xs font-black transition-all cursor-pointer ${
                isPlayingAudio
                  ? "bg-amber-400 text-black shadow-[2px_2px_0px_#000] ring-2 ring-white animate-pulse"
                  : "bg-white/20 text-white hover:bg-white/30 shadow-[2px_2px_0px_#000]"
              }`}
              title="Listen to Spoken Audio Guide (Key: V)"
              aria-label="Listen to Audio Guide"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {isPlayingAudio ? "..." : hub.listenGuide}
              </span>
            </button>
          )}
          <AudioToggle />
          <div className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-1 text-xs font-black text-ink shadow-[2px_2px_0px_#000]">
            <Award className="h-3.5 w-3.5 text-tea" />
            <span>{score} {hub.pts}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

