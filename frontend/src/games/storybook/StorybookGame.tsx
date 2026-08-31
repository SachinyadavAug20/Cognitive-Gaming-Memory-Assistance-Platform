"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  BookOpen,
  Volume2,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Music,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Sun,
  Trees,
  Ship,
  Compass,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import {
  playPress,
  playCorrect,
  playComplete,
  playLifeSong,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { api, type AiStoryResponse, type AiStoryChoice } from "@/lib/api";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";

function GameShell({
  title,
  score,
  children,
}: {
  title: string;
  score: number;
  children: React.ReactNode;
}) {
  return (
    <section className="pb-12 min-h-screen bg-[#FAF6F0]">
      <GameHeader title={title} score={score} backHref="/patient/games" bgColor="bg-tea" />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

const STORY_THEMES = [
  {
    id: "tea-morning",
    title: "Morning in the Upper Assam Tea Hills",
    icon: Trees,
    desc: "A walk through sunlit green tea slopes and misty bamboo groves.",
  },
  {
    id: "brahmaputra-ferry",
    title: "The Brahmaputra Sunset Ferry to Majuli",
    icon: Ship,
    desc: "Golden river currents, river dolphins, and peaceful evening bells.",
  },
  {
    id: "shillong-pine",
    title: "Pine Forest Walk at Shillong Peak",
    icon: Compass,
    desc: "Crisp mountain breeze, cherry blossoms, and distant church chimes.",
  },
];

export function StorybookGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "storybook", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "story" | "done">("intro");
  const [selectedTheme, setSelectedTheme] = useState(STORY_THEMES[0]);
  const [chapterIndex, setChapterIndex] = useState(1);
  const [currentChapter, setCurrentChapter] = useState<AiStoryResponse | null>(null);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const totalChapters = 4;
  const score = chapterIndex * 25;

  const loadChapter = useCallback(
    async (themeTitle: string, index: number, choiceMade?: string) => {
      setIsLoadingChapter(true);
      try {
        const res = await api.aiStoryChapter({
          patientId,
          theme: themeTitle,
          currentChapterIndex: index,
          previousChoiceMade: choiceMade || "Begin Story",
        });
        setCurrentChapter(res);
      } catch {
        const fallback: AiStoryResponse = {
          chapterNumber: index,
          chapterTitle: `Chapter ${index}: Golden Morning Sun`,
          chapterNarrative:
            "The warm morning sun illuminates the green hills. A gentle mountain breeze touches your face with the sweet scent of tea leaves and pine trees.",
          sensoryAtmosphere: "Crisp mountain breeze & fresh tea aroma",
          storyEmoji: "Sun",
          choices: [
            { id: "c1", label: "Walk across the wooden bridge", emoji: "Compass" },
            { id: "c2", label: "Sit and enjoy sweet cardamom tea", emoji: "Coffee" },
          ],
          isFinale: index >= totalChapters,
        };
        setCurrentChapter(fallback);
      } finally {
        setIsLoadingChapter(false);
      }
    },
    [patientId]
  );

  const startStory = useCallback(
    (theme = STORY_THEMES[0]) => {
      playPress();
      setSelectedTheme(theme);
      setPhase("story");
      setChapterIndex(1);
      const nowIso = new Date().toISOString();
      setStartedAt(nowIso);
      setTaps(0);
      loadChapter(theme.title, 1);
    },
    [loadChapter]
  );

  const handleChoice = useCallback(
    (choice: AiStoryChoice) => {
      setTaps((t) => t + 1);
      playCorrect();
      stopSpeaking();

      const nextIndex = chapterIndex + 1;
      setChapterIndex(nextIndex);

      if (nextIndex > totalChapters) {
        setTimeout(() => {
          playComplete();
          setPhase("done");
          if (startedAt) {
            recordGameSession(patientId, {
              gameId: "storybook",
              level,
              outcome: "completed",
              score: 100,
              startedAt,
              taps: taps + 1,
              errorCount: 0,
            });
          }
        }, 100);
      } else {
        loadChapter(selectedTheme.title, nextIndex, choice.label);
      }
    },
    [chapterIndex, loadChapter, patientId, level, selectedTheme.title, totalChapters, startedAt, taps]
  );

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "storybook",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  if (loading)
    return (
      <GameShell title="Living Heritage Chronicle Protocol" score={0}>
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title="Living Heritage Chronicle Protocol" score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  const ThemeIcon = selectedTheme.icon;

  return (
    <GameShell title="Living Heritage Chronicle & Storytelling" score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          {/* Government Paperclip Header */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                Heritage Reminiscence // Module CDTx-03
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-tea" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-amber-800 text-white shadow-[4px_4px_0px_#000]">
            <BookOpen className="h-10 w-10" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              The Living Heritage Chronicle
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              Step into an adaptive nostalgic narrative woven from North Eastern landscapes and cultural heritage. Make choices that steer how your story unfolds.
            </p>
          </div>

          {/* Theme Selection Cards */}
          <div className="w-full max-w-md space-y-2.5 text-left">
            <span className="text-xs font-black uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-tea" /> Select Narrative Expedition:
            </span>
            <div className="grid gap-2.5">
              {STORY_THEMES.map((theme) => {
                const IconComponent = theme.icon;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => startStory(theme)}
                    className="btn-tactile group flex items-center justify-between rounded-2xl border-3 border-black bg-surface p-3.5 text-left shadow-[3px_3px_0px_#000] hover:bg-tea-light hover:border-tea transition-transform active:translate-y-0.5 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-amber-100 text-ink shadow-sm">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-ink">{theme.title}</p>
                        <p className="text-[11px] font-semibold text-ink-secondary leading-tight">
                          {theme.desc}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-tea font-black shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          <AudioPrompt
            text="Welcome to the Living Heritage Chronicle. Select a tale and choose how your journey unfolds."
            label="Listen to Instructions"
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={() => startStory(STORY_THEMES[0])}>
            Open Living Chronicle
          </ChunkyButton>
        </div>
      ) : phase === "story" ? (
        <div className="flex flex-col items-center gap-4 py-1">
          {/* STORYBOOK CHAPTER STATUS */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-tea" />
              <span className="text-xs font-black text-ink truncate max-w-[220px]">
                {selectedTheme.title}
              </span>
            </div>
            <span className="text-[11px] font-bold text-ink-secondary">
              Chapter {chapterIndex} of {totalChapters}
            </span>
          </div>

          {/* LIVING BOOK OPEN SPREAD STAGE */}
          <div className="relative w-full max-w-md rounded-2xl border-3 border-black bg-[#FAF3E0] p-5 shadow-[5px_5px_0px_#000] text-left select-none overflow-hidden">
            {/* Book Spine Texture Ribbon */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-[#3D2B1F] border-r border-black" />

            <div className="pl-3">
              <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <ThemeIcon className="h-4 w-4 text-amber-900" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#3D2B1F]">
                    {currentChapter?.chapterTitle || `Chapter ${chapterIndex}`}
                  </span>
                </div>
                {isLoadingChapter && (
                  <span className="text-[10px] font-bold text-ink-secondary animate-pulse">
                    Generating narrative...
                  </span>
                )}
              </div>

              {/* Narrative Text */}
              <p className="font-serif text-sm sm:text-base font-bold text-[#2A1D15] leading-relaxed">
                &ldquo;{currentChapter?.chapterNarrative}&rdquo;
              </p>

              {/* Sensory Atmosphere Badge */}
              {currentChapter?.sensoryAtmosphere && (
                <div className="mt-3.5 rounded-xl bg-[#EFE3C3] p-2.5 border-2 border-black/20 text-xs font-bold text-[#4A3324] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-800 shrink-0" />
                  <span>{currentChapter.sensoryAtmosphere}</span>
                </div>
              )}

              {/* Read Aloud Button */}
              <div className="mt-4 flex items-center justify-start pt-2 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => speak(currentChapter?.chapterNarrative || "", locale, rate)}
                  className="group flex items-center gap-1.5 rounded-xl border-2 border-tea bg-tea-light px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-tea hover:text-white transition-all cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Listen to Chapter</span>
                </button>
              </div>
            </div>
          </div>

          {/* BRANCHING DECISION CHOICES */}
          <div className="w-full max-w-md space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-ink-secondary flex items-center gap-1">
              <Compass className="h-3.5 w-3.5 text-tea" /> What path do you take next?
            </span>
            <div className="grid gap-2.5">
              {currentChapter?.choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  disabled={isLoadingChapter}
                  onClick={() => handleChoice(choice)}
                  className="btn-tactile group flex items-center justify-between rounded-2xl border-3 border-black bg-surface p-3.5 text-left shadow-[3px_3px_0px_#000] hover:bg-tea-light hover:border-tea transition-transform active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-amber-100 text-ink shadow-sm">
                      <Sun className="h-5 w-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-ink">{choice.label}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-tea font-black shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration title="Chronicle Journey Complete">
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Living Chronicle Concluded
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-tea text-white px-2 py-0.5">
                  Score: 100%
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                A Peaceful Memory Journey
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1 leading-relaxed">
                You completed the story of {selectedTheme.title}. Your choices guided a calm, nostalgic narrative through North East India.
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-xs font-black">Play Folk Melody</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  Journey Complete
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={() => setPhase("intro")}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> Read Another Story
                </span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
              >
                ← Back to Therapy Suite
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
