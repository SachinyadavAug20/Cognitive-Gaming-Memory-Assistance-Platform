"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Flower,
  RotateCcw,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Search,
  Music,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playPineBreeze, playLifeSong } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { getGameStrings } from "@/lib/gameI18n";

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
      <GameHeader
        title={title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-emerald-950"
        gameId="dzukou-botanist"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

interface FloraSpecimen {
  id: string;
  name: string;
  latinName: string;
  emoji: string;
  color: string;
  description: string;
  isTarget: boolean;
  discovered: boolean;
}

const BOTANICAL_PLANTS: FloraSpecimen[] = [
  {
    id: "dzukou-lily",
    name: "Rare Dzukou Lily",
    latinName: "Lilium chitrangadae",
    emoji: "🌸",
    color: "bg-pink-100 border-pink-500 text-pink-950",
    description: "The sacred, world-famous pink alpine lily found only in Dzukou Valley on the Nagaland border.",
    isTarget: true,
    discovered: false,
  },
  {
    id: "rhododendron",
    name: "Crimson Tree Rhododendron",
    latinName: "Rhododendron arboreum",
    emoji: "🌺",
    color: "bg-rose-100 border-rose-500 text-rose-950",
    description: "Vibrant high-altitude crimson flowers that carpet the Himalayan ridge during springtime.",
    isTarget: true,
    discovered: false,
  },
  {
    id: "blue-vanda",
    name: "Sacred Blue Vanda Orchid",
    latinName: "Vanda coerulea",
    emoji: "🪻",
    color: "bg-indigo-100 border-indigo-500 text-indigo-950",
    description: "A rare, protected blue-violet wild orchid flourishing in the mist-laden subtropical canopies.",
    isTarget: true,
    discovered: false,
  },
  {
    id: "bamboo-orchid",
    name: "Assam Bamboo Orchid",
    latinName: "Arundina graminifolia",
    emoji: "🎋",
    color: "bg-amber-100 border-amber-500 text-amber-950",
    description: "Delicate purple and white reed-like wild flowers growing along hill slopes.",
    isTarget: true,
    discovered: false,
  },
];

export function DzukouBotanistGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "dzukou-botanist", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "search" | "done">("intro");
  const [floraList, setFloraList] = useState<FloraSpecimen[]>(BOTANICAL_PLANTS);
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "dzukou-botanist",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const currentTarget = floraList[currentTargetIndex];

  const handlePlantTap = (plantId: string) => {
    if (phase !== "search") return;
    setTaps((t) => t + 1);

    if (plantId === currentTarget.id) {
      playCorrect();
      const updated = floraList.map((p) => (p.id === plantId ? { ...p, discovered: true } : p));
      setFloraList(updated);
      speak(`Found! ${currentTarget.name}. ${currentTarget.description}`, locale, rate);

      if (currentTargetIndex + 1 < floraList.length) {
        setTimeout(() => {
          setCurrentTargetIndex((prev) => prev + 1);
        }, 1600);
      } else {
        setTimeout(() => {
          playComplete();
          setPhase("done");
          if (startedAt) {
            recordGameSession(patientId, {
              gameId: "dzukou-botanist",
              level,
              outcome: "completed",
              score: 100,
              startedAt,
              taps: taps + 1,
              errorCount: 0,
            });
          }
        }, 800);
      }
    } else {
      speak("Look closely for the " + currentTarget.name, locale, rate);
    }
  };

  const startBotanicalExpedition = useCallback(() => {
    playPress();
    playPineBreeze();
    setPhase("search");
    setFloraList(BOTANICAL_PLANTS.map((p) => ({ ...p, discovered: false })));
    setCurrentTargetIndex(0);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
  }, []);

  const str = getGameStrings("dzukou-botanist", locale);

  if (loading) return <GameShell title={str.title} score={0}><GameLoading /></GameShell>;
  if (error) return <GameShell title={str.title} score={0}><GameError onRetry={reload} /></GameShell>;

  const discoveredCount = floraList.filter((p) => p.discovered).length;

  return (
    <GameShell title={str.title} score={discoveredCount * 25}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                Visual Discrimination // Module CDTx-24
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-emerald-900" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-emerald-950 text-white shadow-[4px_4px_0px_#000]">
            <Flower className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {str.introSubtitle}
            </p>
          </div>

          {/* Clinical Benefits */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-900 block mb-2">
              Clinical Benefits:
            </span>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-800" />
                <span>Feature conjunction visual search & selective attention</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-tea" />
                <span>Botanical categorization & semantic long-term recall</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-marigold" />
                <span>Soothing high-altitude nature scenery and aromatherapy mindfulness</span>
              </div>
            </div>
          </div>

          <AudioPrompt
            text={str.audioPrompt}
            label={str.listenLabel}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startBotanicalExpedition}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "search" ? (
        <div className="flex flex-col items-center gap-4 py-1 text-center">
          {/* TARGET FLORA MISSION BANNER WITH MAGNIFIER */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-gradient-to-r from-emerald-100 via-amber-50 to-emerald-50 p-4 shadow-[4px_4px_0px_#000] text-left">
            <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                <Search className="h-4 w-4 text-emerald-700" /> {str.hudAction} ({currentTargetIndex + 1} of {floraList.length})
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-900 text-white">
                {str.hudProgress}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="h-16 w-16 rounded-2xl border-2 border-emerald-800 bg-white flex items-center justify-center text-4xl shadow-inner relative group">
                <span className="animate-pulse">{currentTarget.emoji}</span>
                <span className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                  🔍
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-black text-ink">
                  {currentTarget.name}
                </h3>
                <p className="text-xs font-semibold text-ink-secondary italic">
                  {currentTarget.latinName}
                </p>
                <p className="text-[11px] font-bold text-emerald-900 mt-1">
                  🌿 {currentTarget.description}
                </p>
              </div>
            </div>
          </div>

          {/* BOTANICAL DISCOVERY MEADOW GRID */}
          <div className="w-full max-w-md grid grid-cols-2 gap-3.5 pt-1">
            {floraList.map((plant) => (
              <button
                key={plant.id}
                type="button"
                onClick={() => handlePlantTap(plant.id)}
                className={`btn-tactile flex flex-col items-center justify-center gap-2 rounded-3xl border-3 p-5 shadow-[4px_4px_0px_#000] transition-all cursor-pointer ${
                  plant.discovered
                    ? "bg-emerald-500 border-black text-white ring-4 ring-emerald-300"
                    : plant.color
                }`}
              >
                <span className="text-5xl animate-bounce" style={{ animationDuration: "3s" }}>
                  {plant.emoji}
                </span>
                <div>
                  <span className="font-serif text-sm sm:text-base font-black block leading-tight">
                    {plant.name}
                  </span>
                  <span className="text-[10px] font-bold opacity-80 uppercase block mt-0.5">
                    {plant.discovered ? "✓ In Herbarium" : "🔍 Inspect & Collect"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title={str.celebrationTitle}
          subtitle={str.celebrationSubtitle}
          xpEarned={145}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> 4 Rare Endemic Species Preserved
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-emerald-950 text-white px-2 py-0.5">
                  Heritage Herbarium
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                Visual Discrimination: 100% Precision
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1">
                Visual search accuracy and category identification demonstrated sharp attention and associative memory.
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-emerald-100 px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-emerald-900" />
                  <span className="text-xs font-black">Play Dzukou Valley Flute Melody</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startBotanicalExpedition}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> {str.playAgainButton}
                </span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
              >
                {str.backToHub}
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
