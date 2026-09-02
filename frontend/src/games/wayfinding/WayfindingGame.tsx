"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Compass, Music, MapPin } from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { MemoryLightbox } from "@/components/ui/MemoryLightbox";
import {
  playPress,
  playCorrect,
  playComplete,
  playLandmarkChime,
  playPineBreeze,
  playStepSound,
  playLifeSong,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { getMediaUrl } from "@/lib/api";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel, wayfindingRouteLength } from "@/games/config";
import type { FamiliarPlaceItem } from "@/types";

const DEFAULT_PLACES: FamiliarPlaceItem[] = [
  {
    id: -1,
    name: "Home (Heritage Cottage)",
    category: "🏠",
    description: "Where we live — wooden-roof cottage surrounded by pine trees and blooming orchids.",
    emoji: "🏠",
    photoUrl: null,
  },
  {
    id: -2,
    name: "Village Tea Stall",
    category: "🍵",
    description: "Where we meet friends for hot spiced tea and morning news.",
    emoji: "🍵",
    photoUrl: null,
  },
  {
    id: -3,
    name: "Community Prayer Hall (Namghar / Church)",
    category: "🛕",
    description: "Place of worship with ringing chimes and peaceful gardens.",
    emoji: "🛕",
    photoUrl: null,
  },
  {
    id: -4,
    name: "Pine Lake Promenade",
    category: "🌲",
    description: "Scenic lakeside path with wooden bridge and gentle mountain breeze.",
    emoji: "🌲",
    photoUrl: null,
  },
  {
    id: -5,
    name: "Local Market & Dispensary",
    category: "🏪",
    description: "Fresh fruits, vegetables, and neighborhood medical dispensary.",
    emoji: "🏪",
    photoUrl: null,
  },
];

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
    <section className="pb-12">
      <GameHeader title={title} score={score} backHref="/patient/games" bgColor="bg-tea" />
      <div className="mx-auto max-w-3xl px-4 pt-6">{children}</div>
    </section>
  );
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function WayfindingGame() {
  const t = useTranslations("games");
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "wayfinding", startLevel(detail));
  const rate = speechRate(detail);

  // Available places pool
  const placesPool = useMemo<FamiliarPlaceItem[]>(() => {
    if ((detail?.familiarPlaces?.length ?? 0) >= 2) return detail!.familiarPlaces;
    return DEFAULT_PLACES;
  }, [detail]);

  // Generate an ordered route that finishes at "Home"
  const route = useMemo<FamiliarPlaceItem[]>(() => {
    const pool = [...placesPool];
    // Find home or place matching 'home' / 'cottage' / id 1
    const homeIdx = pool.findIndex(
      (p) =>
        (p.category ?? "").toLowerCase().includes("home") ||
        p.name.toLowerCase().includes("home") ||
        p.name.toLowerCase().includes("cottage")
    );
    let homePlace: FamiliarPlaceItem;
    if (homeIdx > -1) {
      [homePlace] = pool.splice(homeIdx, 1);
    } else {
      homePlace = pool.pop() ?? DEFAULT_PLACES[0];
    }

    const shuffledWaypoints = shuffle(pool);
    const maxWaypoints = Math.max(2, Math.min(wayfindingRouteLength(detail) - 1, shuffledWaypoints.length));
    const selectedWaypoints = shuffledWaypoints.slice(0, maxWaypoints);

    // Route = [Station 1, Station 2, ..., Home]
    return [...selectedWaypoints, homePlace];
  }, [placesPool, detail]);

  const [mode, setMode] = useState<"scenic" | "recall">("recall");
  const [phase, setPhase] = useState<"intro" | "walk" | "done">("intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [selectedFork, setSelectedFork] = useState<number | null>(null);
  const [hintActive, setHintActive] = useState(false);
  const [lightboxPlace, setLightboxPlace] = useState<FamiliarPlaceItem | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [isWalkingAnimation, setIsWalkingAnimation] = useState(false);

  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const guard = useSessionGuard({
    patientId,
    gameId: "wayfinding",
    level,
    startedAt,
    taps,
    errorCount,
  });

  const currentPlace = route[stepIndex] ?? route[0];
  const nextTargetPlace = route[stepIndex + 1] ?? null;
  const isLastStation = stepIndex >= route.length - 1;

  // Fork choices for recall mode
  const signpostChoices = useMemo<FamiliarPlaceItem[]>(() => {
    if (!nextTargetPlace) return [];
    const correct = nextTargetPlace;
    const distractors = placesPool
      .filter((p) => p.name !== correct.name && p.name !== currentPlace.name)
      .slice(0, 2);
    const pool = [correct, ...distractors];
    return shuffle(pool);
  }, [nextTargetPlace, placesPool, currentPlace]);

  // Clean up speech and timers on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, []);

  const announceCurrentStation = useCallback(
    (station: FamiliarPlaceItem, nextDest: FamiliarPlaceItem | null) => {
      stopSpeaking();
      playLandmarkChime();
      const desc = station.description || "";
      if (nextDest) {
        speak(
          `${t("wayfinding.speechArrived", { name: station.name, description: desc })} ${t("wayfinding.speechTurn", { target: nextDest.name })}`,
          locale,
          rate
        );
      } else {
        speak(
          `${t("wayfinding.speechFinish")} ${station.name}. ${desc}`,
          locale,
          rate
        );
      }
    },
    [locale, rate, t]
  );

  function startJourney() {
    stopSpeaking();
    playPress();
    setStepIndex(0);
    setScore(0);
    setTaps(0);
    setErrorCount(0);
    setSelectedFork(null);
    setHintActive(false);
    setStartedAt(new Date().toISOString());
    setPhase("walk");

    const first = route[0];
    if (first) {
      speak(
        t("wayfinding.speechIntro", {
          start: first.name,
          home: route[route.length - 1]?.name ?? "",
        }),
        locale,
        rate
      );
    }
  }

  // Automatic errorless scaffolding hint after 12s idle
  useEffect(() => {
    if (phase === "walk" && mode === "recall" && nextTargetPlace && !hintActive) {
      if (hintTimer.current) clearTimeout(hintTimer.current);
      hintTimer.current = setTimeout(() => {
        setHintActive(true);
        playPineBreeze();
        speak(
          t("wayfinding.hintWhisper", { name: nextTargetPlace.name }),
          locale,
          rate
        );
      }, 12000);
    }
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, [phase, mode, nextTargetPlace, hintActive, locale, rate, t]);

  function handleScenicAdvance() {
    if (isWalkingAnimation) return;
    playStepSound();
    setTaps((v) => v + 1);
    setIsWalkingAnimation(true);

    setTimeout(() => {
      setIsWalkingAnimation(false);
      const nextIdx = stepIndex + 1;
      if (nextIdx >= route.length) {
        completeJourney();
      } else {
        setStepIndex(nextIdx);
        setHintActive(false);
        announceCurrentStation(route[nextIdx], route[nextIdx + 1] ?? null);
      }
    }, 700);
  }

  function handleForkChoice(chosen: FamiliarPlaceItem, choiceIndex: number) {
    if (selectedFork !== null || isWalkingAnimation || !nextTargetPlace) return;
    setTaps((v) => v + 1);
    setSelectedFork(choiceIndex);

    const isCorrect = chosen.name === nextTargetPlace.name;

    if (isCorrect) {
      playCorrect();
      setScore((s) => s + 1);
      speak(t("wayfinding.speechSuccess", { name: chosen.name }), locale, rate);
      setIsWalkingAnimation(true);

      setTimeout(() => {
        setSelectedFork(null);
        setIsWalkingAnimation(false);
        setHintActive(false);
        const nextIdx = stepIndex + 1;
        if (nextIdx >= route.length - 1) {
          // Reached Home!
          setStepIndex(nextIdx);
          completeJourney();
        } else {
          setStepIndex(nextIdx);
          announceCurrentStation(route[nextIdx], route[nextIdx + 1] ?? null);
        }
      }, 1200);
    } else {
      // Errorless Learning: Soft whisper scaffolding, never a harsh error buzzer
      setErrorCount((e) => e + 1);
      playPineBreeze();
      setHintActive(true);
      speak(
        t("wayfinding.hintWhisper", { name: nextTargetPlace.name }),
        locale,
        rate
      );
      setTimeout(() => {
        setSelectedFork(null);
      }, 800);
    }
  }

  function completeJourney() {
    stopSpeaking();
    playComplete();
    setPhase("done");
    guard.markCompleted();

    const home = route[route.length - 1];
    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "wayfinding",
        level,
        outcome: "completed",
        score: score + 1,
        startedAt,
        taps,
        errorCount,
      });
    }
    speak(
      `${t("wayfinding.speechFinish")} ${home?.name ?? ""}.`,
      locale,
      rate
    );
  }

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell title={t("wayfinding.title")} score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  const home = route[route.length - 1];

  return (
    <GameShell title={t("wayfinding.title")} score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-8 text-center">
          <div className="text-6xl">🗺️</div>
          <p className="font-serif text-3xl font-black text-ink">
            {t("wayfinding.title")}
          </p>
          <p className="max-w-md text-lg font-semibold text-ink-secondary">
            {t("wayfinding.desc")}
          </p>

          {/* Mode Selection Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                playPress();
                setMode("recall");
              }}
              className={`rounded-2xl border-2 px-5 py-2.5 text-base font-extrabold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                mode === "recall"
                  ? "border-black bg-tea text-white scale-105"
                  : "border-border bg-surface text-ink hover:bg-surface-muted"
              }`}
            >
              {t("wayfinding.modeRecall")}
            </button>
            <button
              type="button"
              onClick={() => {
                playPress();
                setMode("scenic");
              }}
              className={`rounded-2xl border-2 px-5 py-2.5 text-base font-extrabold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                mode === "scenic"
                  ? "border-black bg-marigold text-white scale-105"
                  : "border-border bg-surface text-ink hover:bg-surface-muted"
              }`}
            >
              {t("wayfinding.modeScenic")}
            </button>
          </div>

          {/* Route Overview Preview */}
          <div className="w-full max-w-lg rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black uppercase tracking-wider text-ink-secondary">
              Today&apos;s Trail ({route.length} Landmarks)
            </span>
            <div className="mt-3 flex items-center justify-between gap-2 overflow-x-auto py-2">
              {route.map((p, i) => {
                const src = getMediaUrl(p.photoUrl);
                return (
                  <div key={p.id} className="flex flex-col items-center gap-1 shrink-0">
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-2 border-black bg-tea-light shadow-sm">
                      {src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-2xl">{p.emoji || "📍"}</span>
                      )}
                    </div>
                    <span className="max-w-[70px] truncate text-[11px] font-extrabold text-ink">
                      {i === route.length - 1 ? "🏠 " : ""}{p.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <AudioPrompt
            text={t("wayfinding.speechIntro", {
              start: route[0]?.name ?? "",
              home: home?.name ?? "",
            })}
            label={t("listen")}
            size="md"
          />

          <ChunkyButton variant="tea" size="2xl" onClick={startJourney}>
            {t("wayfinding.startJourney")}
          </ChunkyButton>
        </div>
      ) : phase === "walk" ? (
        <div className="flex flex-col items-center gap-5 py-4">
          {/* LUSH 2.5D INTERACTIVE VILLAGE MAP TRAIL */}
          <div className="relative w-full overflow-hidden rounded-3xl border-4 border-[#2A241F] bg-[#1F291E] p-4 shadow-[6px_6px_0px_rgba(0,0,0,0.9)] select-none">
            {/* Ambient Mountain Terrain Background Elements */}
            <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#4ADE80_1px,transparent_1px)] [background-size:16px_16px]" />
            <div className="absolute top-2 right-4 text-xs font-black uppercase tracking-wider text-emerald-300/80">
              🌲 Pine Hills Trail
            </div>

            {/* Stepping Trail Path Nodes */}
            <div className="relative z-10 flex items-center justify-between gap-2 overflow-x-auto py-3 px-2">
              {route.map((step, idx) => {
                const isVisited = idx < stepIndex;
                const isCurrent = idx === stepIndex;
                const src = getMediaUrl(step.photoUrl);

                return (
                  <div key={step.id} className="relative flex flex-1 flex-col items-center gap-1 min-w-[70px]">
                    {/* Connecting Stepping Stone Path Line */}
                    {idx > 0 && (
                      <div
                        className={`absolute top-7 right-1/2 -left-1/2 h-1.5 -z-0 rounded-full transition-all duration-500 ${
                          idx <= stepIndex ? "bg-marigold" : "bg-white/20 border-dashed"
                        }`}
                      />
                    )}

                    {/* Milestone Pin Icon */}
                    <button
                      type="button"
                      onClick={() => setLightboxPlace(step)}
                      className={`relative z-10 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center overflow-hidden rounded-2xl border-3 transition-all duration-300 cursor-pointer ${
                        isCurrent
                          ? "border-marigold scale-115 ring-4 ring-marigold/80 bg-surface shadow-[0_0_15px_rgba(245,158,11,0.9)]"
                          : isVisited
                          ? "border-tea bg-tea-light opacity-90"
                          : "border-white/30 bg-black/40 opacity-50"
                      }`}
                    >
                      {src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src} alt={step.name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-2xl">{step.emoji || "📍"}</span>
                      )}

                      {/* Visited Checkmark */}
                      {isVisited && (
                        <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-tea text-[10px] font-black text-white">
                          ✓
                        </span>
                      )}

                      {/* Current Walker Avatar Pin */}
                      {isCurrent && (
                        <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-marigold border-2 border-black text-xs font-black text-white animate-pulse">
                          🚶
                        </span>
                      )}
                    </button>

                    <span
                      className={`max-w-[80px] text-center text-xs font-black truncate leading-tight ${
                        isCurrent ? "text-amber-300" : isVisited ? "text-white/90" : "text-white/40"
                      }`}
                    >
                      {idx === route.length - 1 ? "🏠 " : ""}
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STATION HEADER & VISUAL PORTAL */}
          <div className="w-full max-w-xl text-center space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-surface px-4 py-1 shadow-sm">
              <span className="text-xs font-black text-tea uppercase tracking-wide">
                {t("wayfinding.stepCounter", {
                  current: String(stepIndex + 1),
                  total: String(route.length),
                })}
              </span>
              <span className="text-xs text-ink-secondary">•</span>
              <span className="text-xs font-extrabold text-ink">
                {currentPlace.name}
              </span>
            </div>

            {/* HIGH-CONTRAST IMMERSIVE PHOTO PORTAL */}
            <div className="relative mx-auto w-full aspect-video sm:aspect-[16/10] overflow-hidden rounded-3xl border-4 border-black bg-[#181512] shadow-[6px_6px_0px_rgba(0,0,0,1)]">
              {currentPlace.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={getMediaUrl(currentPlace.photoUrl) ?? ""}
                  alt={currentPlace.name}
                  className={`h-full w-full object-cover transition-transform duration-700 ${
                    isWalkingAnimation ? "scale-105 blur-[1px]" : "scale-100"
                  }`}
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#181512] text-white">
                  <span className="text-6xl">{currentPlace.emoji || "📍"}</span>
                  <span className="text-lg font-black">{currentPlace.name}</span>
                </div>
              )}

              {/* Station Name & Reminiscence Banner */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 text-left text-white">
                <p className="text-lg sm:text-xl font-black">{currentPlace.name}</p>
                {currentPlace.description && (
                  <p className="text-xs sm:text-sm font-semibold text-white/90 line-clamp-2">
                    {currentPlace.description}
                  </p>
                )}
              </div>

              {/* View Full Lightbox Button */}
              <button
                type="button"
                onClick={() => setLightboxPlace(currentPlace)}
                className="absolute top-3 right-3 rounded-full border-2 border-black bg-surface/90 px-3 py-1 text-xs font-extrabold text-ink shadow-md backdrop-blur-sm hover:bg-surface cursor-pointer"
              >
                🔍 {t("wayfinding.viewScrapbook")}
              </button>
            </div>

            <AudioPrompt
              text={`${currentPlace.name}. ${currentPlace.description || ""} ${
                nextTargetPlace
                  ? t("wayfinding.signpostPrompt", { target: nextTargetPlace.name })
                  : t("wayfinding.arrive")
              }`}
              label={t("listen")}
              size="md"
            />
          </div>

          {/* INTERACTION AREA */}
          {!isLastStation ? (
            mode === "recall" ? (
              /* Directional Signposts Area */
              <div className="w-full max-w-xl space-y-3 pt-2">
                <div className="text-center">
                  <p className="text-base sm:text-lg font-black text-ink">
                    {t("wayfinding.signpostPrompt", {
                      target: nextTargetPlace?.name ?? "",
                    })}
                  </p>
                </div>

                {/* Scaffolding Hint Banner if active */}
                {hintActive && nextTargetPlace && (
                  <div className="rounded-xl border-2 border-marigold bg-marigold-light p-3 text-center text-sm font-bold text-ink shadow-sm animate-pulse">
                    {t("wayfinding.hintWhisper", { name: nextTargetPlace.name })}
                  </div>
                )}

                {/* 2-3 High-Contrast Directional Signposts */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {signpostChoices.map((choice, i) => {
                    const isSelected = selectedFork === i;
                    const isTarget = choice.name === nextTargetPlace?.name;
                    const choicePhoto = getMediaUrl(choice.photoUrl);

                    return (
                      <button
                        key={`${choice.id}-${stepIndex}`}
                        type="button"
                        onClick={() => handleForkChoice(choice, i)}
                        disabled={selectedFork !== null || isWalkingAnimation}
                        className={`group relative flex items-center gap-3 rounded-2xl border-3 border-black p-3.5 text-left transition-all duration-200 cursor-pointer shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-0.5 ${
                          isSelected
                            ? isTarget
                              ? "bg-tea text-white scale-102 ring-4 ring-tea"
                              : "bg-brick text-white scale-98"
                            : hintActive && isTarget
                            ? "bg-marigold-light border-marigold ring-4 ring-marigold scale-102"
                            : "bg-surface text-ink hover:bg-surface-muted"
                        }`}
                      >
                        {/* Thumbnail or Category Icon */}
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-black bg-tea-light">
                          {choicePhoto ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={choicePhoto}
                              alt={choice.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">{choice.emoji || "📍"}</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-extrabold text-sm sm:text-base leading-tight truncate">
                            {choice.name}
                          </p>
                          <span className="text-[11px] font-bold opacity-80">
                            {i === 0 ? "👈 Take Left Path" : i === 1 ? "👉 Take Right Path" : "👆 Straight Path"}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Scenic Walk Action Button */
              <div className="pt-2">
                <ChunkyButton
                  variant="tea"
                  size="2xl"
                  onClick={handleScenicAdvance}
                  disabled={isWalkingAnimation}
                >
                  {isWalkingAnimation
                    ? "Walking Along Path... 🚶"
                    : t("wayfinding.walkButton")}
                </ChunkyButton>
              </div>
            )
          ) : (
            /* Arrived Home Button */
            <div className="pt-2">
              <ChunkyButton variant="marigold" size="2xl" onClick={completeJourney}>
                {t("wayfinding.arrive")} 🏡
              </ChunkyButton>
            </div>
          )}
        </div>
      ) : (
        /* PHASE: DONE — HERITAGE SCRAPBOOK POSTCARD CELEBRATION */
        <Celebration
          icon={Compass}
          title={t("wayfinding.celebrationTitle")}
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto">
            {/* DIGITAL HERITAGE POSTCARD */}
            <div className="relative w-full rounded-3xl border-4 border-black bg-[#FAF5EE] p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-ink text-left select-none">
              {/* Vintage Postage Stamp Corner */}
              <div className="absolute top-4 right-4 flex flex-col items-center border-2 border-dashed border-terracotta bg-surface p-1 rounded-lg shadow-sm">
                <div className="h-14 w-14 overflow-hidden rounded border border-black bg-tea-light flex items-center justify-center">
                  {home?.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getMediaUrl(home.photoUrl) ?? ""}
                      alt={home.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <MapPin className="h-8 w-8 text-tea" />
                  )}
                </div>
                <span className="text-[9px] font-black text-terracotta tracking-wider uppercase">
                  Home Stamp
                </span>
              </div>

              <h3 className="font-serif text-2xl font-black text-tea pr-20">
                {t("wayfinding.postcardTitle")}
              </h3>
              <p className="mt-1 text-xs font-bold text-ink-secondary">
                {t("wayfinding.completedJourneyDesc", {
                  count: String(route.length),
                  home: home?.name ?? "Home",
                })}
              </p>

              {/* Route Itinerary Recap */}
              <div className="mt-4 space-y-1.5 border-t-2 border-dashed border-border pt-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-ink-secondary">
                  Your Path Today:
                </span>
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-extrabold text-ink">
                  {route.map((p, idx) => (
                    <span key={p.id} className="flex items-center gap-1">
                      <span className="rounded bg-tea-light px-2 py-0.5 border border-tea">
                        {p.name}
                      </span>
                      {idx < route.length - 1 && <span>→</span>}
                    </span>
                  ))}
                </div>
              </div>

              {/* Reminiscence Folk Melody Button */}
              <div className="mt-4 flex items-center justify-between pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3.5 py-2 text-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-xs font-black">{t("wayfinding.musicCta")}</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  Score: {score}/{Math.max(1, route.length - 1)}
                </span>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startJourney}>
                {t("wayfinding.walkAgain")}
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-surface px-6 py-3 font-extrabold text-ink hover:bg-surface-muted shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              >
                {locale === "hi" ? "← थेरेपी केंद्र" : locale === "as" ? "← থেৰাপী কক্ষ" : "← Back to Therapy Suite"}
              </Link>
            </div>
          </div>
        </Celebration>
      )}

      {/* Memory Lightbox Modal */}
      <MemoryLightbox
        open={lightboxPlace !== null}
        onClose={() => setLightboxPlace(null)}
        photoUrl={lightboxPlace?.photoUrl}
        title={lightboxPlace?.name ?? ""}
        text={lightboxPlace?.description ?? null}
        langCode={locale}
        rate={rate}
        closeLabel={t("lightbox.close")}
        listenLabel={t("lightbox.listen")}
        speakingLabel={t("listening")}
      />
    </GameShell>
  );
}