"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Flower2, Music } from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import {
  playPress,
  playWaterRipple,
  playComplete,
  playLifeSong,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { getMediaUrl } from "@/lib/api";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { getGameStrings } from "@/lib/gameI18n";

export interface LotusLily {
  id: number;
  x: number; // percentage
  y: number; // percentage
  bloomed: boolean;
  color: string;
}

export function LotusLakeGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "lotus-lake", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [bloomedCount, setBloomedCount] = useState(0);
  const [lotuses, setLotuses] = useState<LotusLily[]>([]);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const guard = useSessionGuard({
    patientId,
    gameId: "lotus-lake",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const targetBlooms = 6;

  // Family / Landmark photo hidden beneath the clear water
  const lakePhoto = useMemo(() => {
    const places = detail?.familiarPlaces ?? [];
    const members = detail?.familyMembers ?? [];
    if (places.length > 0) {
      return { title: places[0].name, url: places[0].photoUrl ?? "", note: places[0].description ?? "" };
    }
    if (members.length > 0) {
      return { title: members[0].name, url: members[0].photoUrl ?? "", note: members[0].notes ?? "" };
    }
    return null;
  }, [detail]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  function startLake() {
    stopSpeaking();
    playPress();
    setBloomedCount(0);
    setTaps(0);
    setRipples([]);
    setStartedAt(new Date().toISOString());

    // Generate 6 lotus positions
    const initialLotuses: LotusLily[] = [
      { id: 1, x: 25, y: 30, bloomed: false, color: "#F472B6" },
      { id: 2, x: 70, y: 25, bloomed: false, color: "#FB7185" },
      { id: 3, x: 45, y: 55, bloomed: false, color: "#F472B6" },
      { id: 4, x: 20, y: 75, bloomed: false, color: "#FDA4AF" },
      { id: 5, x: 80, y: 65, bloomed: false, color: "#F472B6" },
      { id: 6, x: 50, y: 85, bloomed: false, color: "#FB7185" },
    ];
    setLotuses(initialLotuses);
    setPhase("play");
  }

  function handleLakeTouch(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    playWaterRipple();
    setTaps((v) => v + 1);

    const newRippleId = Date.now();
    setRipples((prev) => [...prev.slice(-5), { id: newRippleId, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRippleId));
    }, 1200);
  }

  function handleLotusTouch(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    setTaps((v) => v + 1);
    playWaterRipple();

    setLotuses((prev) =>
      prev.map((l) => {
        if (l.id === id && !l.bloomed) {
          const nextCount = bloomedCount + 1;
          setBloomedCount(nextCount);
          if (nextCount >= targetBlooms) {
            setTimeout(() => completeLakeSession(), 1200);
          }
          return { ...l, bloomed: true };
        }
        return l;
      })
    );
  }

  function completeLakeSession() {
    stopSpeaking();
    playComplete();
    setPhase("done");
    guard.markCompleted();

    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "lotus-lake",
        level,
        outcome: "completed",
        score: targetBlooms,
        startedAt,
        taps,
      });
    }
    speak(
      "Peaceful and serene! All water lilies on Ward's Lake have blossomed in radiant harmony.",
      locale,
      rate
    );
  }

  const str = getGameStrings("lotus-lake", locale);

  if (loading) return <GameLoading />;
  if (error)
    return (
      <section className="pb-12">
        <GameHeader title={str.title} score={0} backHref="/patient/games" bgColor="bg-tea" />
        <div className="mx-auto max-w-3xl px-4 pt-6">
          <GameError onRetry={reload} />
        </div>
      </section>
    );

  return (
    <section className="pb-12">
      <GameHeader title={str.title} score={bloomedCount} backHref="/patient/games" bgColor="bg-tea" />
      <div className="mx-auto max-w-3xl px-4 pt-6">
        {phase === "intro" ? (
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <div className="text-6xl animate-pulse">🪷</div>
            <p className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </p>
            <p className="max-w-md text-lg font-semibold text-ink-secondary">
              {str.introSubtitle}
            </p>

            <AudioPrompt
              text={str.audioPrompt}
              label={str.listenLabel}
              size="md"
            />

            <ChunkyButton variant="tea" size="2xl" onClick={startLake}>
              {str.startButton}
            </ChunkyButton>
          </div>
        ) : phase === "play" ? (
          <div className="flex flex-col items-center gap-4 py-4">
            {/* LAKE HEADER */}
            <div className="w-full max-w-md flex items-center justify-between rounded-2xl border-2 border-black bg-surface px-4 py-2 shadow-sm">
              <span className="text-sm font-black text-teal-800">💧 Ward&apos;s Lake Waters</span>
              <span className="text-xs font-bold text-ink-secondary">
                {bloomedCount} / {targetBlooms} Lotuses Blossomed
              </span>
            </div>

            {/* INTERACTIVE LAKE WATER SURFACE */}
            <div
              onClick={handleLakeTouch}
              className="relative w-full max-w-sm sm:max-w-md aspect-square rounded-3xl border-4 border-[#0F2F38] bg-gradient-to-b from-[#0A2229] via-[#0D343E] to-[#081B20] p-4 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] overflow-hidden select-none cursor-pointer"
            >
              {/* Subtle Ambient Swimming Fish */}
              <div className="absolute top-1/3 left-1/4 text-2xl opacity-40 animate-pulse pointer-events-none">
                🐟
              </div>
              <div className="absolute bottom-1/4 right-1/4 text-xl opacity-30 animate-pulse pointer-events-none">
                🐠
              </div>

              {/* Water Ripples Rings */}
              {ripples.map((r) => (
                <div
                  key={r.id}
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-cyan-300/60 animate-ping"
                  style={{
                    left: `${r.x}%`,
                    top: `${r.y}%`,
                    width: "80px",
                    height: "80px",
                  }}
                />
              ))}

              {/* Floating Lotus Lilies */}
              {lotuses.map((lotus) => (
                <button
                  key={lotus.id}
                  type="button"
                  onClick={(e) => handleLotusTouch(lotus.id, e)}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-700 cursor-pointer ${
                    lotus.bloomed
                      ? "scale-125 rotate-12 filter drop-shadow-[0_0_15px_rgba(244,114,182,0.9)]"
                      : "scale-95 hover:scale-105 animate-bounce"
                  }`}
                  style={{
                    left: `${lotus.x}%`,
                    top: `${lotus.y}%`,
                  }}
                >
                  <span className="text-4xl sm:text-5xl">
                    {lotus.bloomed ? "🪷" : "🌱"}
                  </span>
                </button>
              ))}

              {/* Gentle Helper Badge */}
              <div className="absolute bottom-3 inset-x-4 text-center pointer-events-none">
                <span className="rounded-full bg-black/60 border border-white/20 px-3 py-1 text-xs font-black text-cyan-200 backdrop-blur-sm">
                  ✨ Touch any bud to make it bloom
                </span>
              </div>
            </div>

            {/* Bottom Gentle Actions */}
            <div className="pt-2">
              <ChunkyButton variant="marigold" size="xl" onClick={() => playLifeSong()}>
                Play Serene Harp Melodies 🎵
              </ChunkyButton>
            </div>
          </div>
        ) : (
          /* PHASE: DONE CELEBRATION */
          <Celebration icon={Flower2} title={str.celebrationTitle}>
            <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left">
              <div className="relative w-full rounded-3xl border-4 border-black bg-[#FAF5EE] p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-ink select-none">
                <h3 className="font-serif text-2xl font-black text-teal-800">
                  Ward&apos;s Lake Sanctuary
                </h3>
                <p className="text-xs font-bold text-ink-secondary mt-1">
                  {str.celebrationSubtitle}
                </p>

                {lakePhoto && lakePhoto.url ? (
                  <div className="mt-4 overflow-hidden rounded-2xl border-3 border-black bg-black">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getMediaUrl(lakePhoto.url) ?? ""}
                      alt={lakePhoto.title}
                      className="h-40 w-full object-cover"
                    />
                    <div className="p-3 bg-teal-900 text-white">
                      <p className="text-sm font-black">{lakePhoto.title}</p>
                      <p className="text-xs text-white/80">{lakePhoto.note}</p>
                    </div>
                  </div>
                ) : null}

                {/* Music Button */}
                <div className="mt-4 flex items-center justify-between pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => playLifeSong()}
                    className="group flex items-center gap-2 rounded-xl border-2 border-black bg-teal-100 px-3.5 py-2 text-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 cursor-pointer"
                  >
                    <Music className="h-4 w-4 text-teal-900" />
                    <span className="text-xs font-black">Play Calming Flute</span>
                  </button>
                  <span className="text-xs font-bold text-ink-secondary">
                    Calming Score: {bloomedCount}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <ChunkyButton variant="tea" size="xl" onClick={startLake}>
                  {str.playAgainButton}
                </ChunkyButton>
                <Link
                  href="/patient/games"
                  className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-surface px-6 py-3 font-extrabold text-ink hover:bg-surface-muted shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                >
                  {str.backToHub}
                </Link>
              </div>
            </div>
          </Celebration>
        )}
      </div>
    </section>
  );
}
