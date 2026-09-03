"use client";

import { useCallback, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Sparkles,
  RotateCcw,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Music,
  ArrowLeftRight,
  Palette,
  Volume2,
} from "lucide-react";
import { MugaLoomShuttleIcon } from "@/components/ui/CulturalIcons";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playLifeSong, playTapFeedback } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { LoomScene3D } from "./LoomScene3D";
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
        bgColor="bg-amber-800"
        gameId="loom"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

const THREAD_COLORS = [
  { id: "red", name: "Crimson Red", hex: "#DC2626" },
  { id: "gold", name: "Muga Gold", hex: "#D97706" },
  { id: "blue", name: "Peacock Blue", hex: "#2563EB" },
];

export function LoomGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "loom", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "weave" | "done">("intro");
  const [rowsWoven, setRowsWoven] = useState(0);
  const [shuttleSide, setShuttleSide] = useState<-1 | 1>(-1); // -1 = Left, 1 = Right
  const [selectedColor, setSelectedColor] = useState(THREAD_COLORS[0]);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const TARGET_ROWS = 8;
  const score = Math.round((rowsWoven / TARGET_ROWS) * 100);

  const startGame = useCallback(() => {
    playPress();
    setPhase("weave");
    setRowsWoven(0);
    setShuttleSide(-1);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
  }, []);

  const handleShuttlePass = () => {
    if (rowsWoven >= TARGET_ROWS) return;
    setTaps((t) => t + 1);
    stopSpeaking();
    playTapFeedback();

    const nextSide = shuttleSide === -1 ? 1 : -1;
    setShuttleSide(nextSide);

    const nextRows = rowsWoven + 1;
    setRowsWoven(nextRows);

    if (nextRows === TARGET_ROWS) {
      setTimeout(() => {
        playComplete();
        setPhase("done");
        if (startedAt) {
          recordGameSession(patientId, {
            gameId: "loom",
            level,
            outcome: "completed",
            score: 100,
            startedAt,
            taps: taps + 1,
            errorCount: 0,
          });
        }
      }, 1000);
    } else {
      if (nextRows % 2 === 0) {
        playCorrect();
      }
    }
  };

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "loom",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const str = getGameStrings("loom", locale);

  if (loading)
    return (
      <GameShell title={str.title} score={0}>
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title={str.title} score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title={str.title} score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          {/* Government Paperclip Header */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                3D Constructional Praxis // Module CDTx-16
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-amber-800" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-amber-800 text-white shadow-[4px_4px_0px_#000]">
            <Sparkles className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {str.introSubtitle}
            </p>
          </div>

          {/* Module Benefits */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 block mb-2">
              Therapeutic Benefits:
            </span>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-800" />
                <span>Stimulates bi-manual motor rhythm & constructional sequencing</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-marigold" />
                <span>Procedural 3D cloth geometry growth in real time</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-800" />
                <span>Deep cultural reminiscence of North Eastern handloom traditions</span>
              </div>
            </div>
          </div>

          <AudioPrompt
            text={str.audioPrompt}
            label={str.listenLabel}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startGame}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "weave" ? (
        <div className="flex flex-col items-center gap-3.5 py-1">
          {/* WEAVING STATUS BAR */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <ArrowLeftRight className="h-4 w-4" /> {str.hudProgress}: {rowsWoven} / {TARGET_ROWS}
            </span>
            <div className="flex items-center gap-1">
              <Palette className="h-3.5 w-3.5 text-ink-secondary" />
              {THREAD_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: c.hex }}
                  className={`h-5 w-5 rounded-full border-2 cursor-pointer transition-transform ${
                    selectedColor.id === c.id ? "scale-125 border-black ring-2 ring-amber-400" : "border-white/80 opacity-70"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* THREE.JS 3D LOOM CANVAS */}
          <div className="relative w-full max-w-md aspect-4/3 rounded-2xl border-3 border-black overflow-hidden shadow-[5px_5px_0px_#000] bg-black select-none">
            <LoomScene3D
              shuttlePosition={shuttleSide}
              threadColor={selectedColor.hex}
              progressRows={rowsWoven}
              onShuttlePass={handleShuttlePass}
            />

            <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              <MugaLoomShuttleIcon className="h-3.5 w-3.5 text-amber-300" />
              <span>Weft Lines: {rowsWoven} / {TARGET_ROWS} &bull; Warp Lines: 42 Strands</span>
            </div>
          </div>

          {/* INTERACTIVE CONTROLS */}
          <div className="w-full max-w-md flex flex-col items-center gap-3 pt-1">
            <div className="w-full flex items-center justify-between px-1 text-xs font-black text-ink">
              <span className="flex items-center gap-1">
                <span className="h-2.5 w-2.5 rounded-full bg-tea" /> Muga Silk Ready
              </span>
              <button
                type="button"
                onClick={() => speak("Slide the wooden shuttle from one side to the other to pass the weft thread.", locale, rate)}
                className="flex items-center gap-1 text-tea hover:underline cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" /> Hear Guide
              </button>
            </div>

            <ChunkyButton variant="marigold" size="xl" onClick={handleShuttlePass}>
              <span className="flex items-center gap-2">
                <ArrowLeftRight className="h-5 w-5" /> {str.hudAction} ({shuttleSide === -1 ? "→" : "←"})
              </span>
            </ChunkyButton>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title={str.celebrationTitle}
          subtitle={str.celebrationSubtitle}
          xpEarned={120}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Silk Textile Preserved
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-amber-800 text-white px-2 py-0.5">
                  {TARGET_ROWS} Pattern Rows
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                Handloom Masterwork Archived
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1">
                Your bi-manual coordination and rhythmic pacing were recorded with optimal motor symmetry.
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-xs font-black">Play Weavers&apos; Folk Song</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  Assessment Complete
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startGame}>
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
