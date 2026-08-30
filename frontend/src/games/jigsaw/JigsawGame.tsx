"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Grid3X3, Volume2, Music } from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { MemoryLightbox } from "@/components/ui/MemoryLightbox";
import { JigsawPieceBoard } from "./JigsawPieceBoard";
import {
  playPress,
  playCorrect,
  playTapFeedback,
  playComplete,
  playLifeSong,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { getMediaUrl } from "@/lib/api";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import type { FamilyMemberItem, FamiliarPlaceItem } from "@/types";

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
    <section className="pb-10">
      <GameHeader title={title} score={score} backHref="/patient/games" bgColor="bg-tea" />
      <div className="mx-auto max-w-3xl px-4 pt-6">{children}</div>
    </section>
  );
}

function makePermutation(size: number): number[] {
  const out = Array.from({ length: size }, (_, i) => i);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function solved(order: number[]): boolean {
  return order.length > 0 && order.every((piece, pos) => piece === pos);
}

export type GridDimension = 2 | 3 | 4;

export interface PuzzleTarget {
  id: string | number;
  name: string;
  subtitle: string;
  photoUrl: string;
  notes: string;
  emoji?: string;
  type: "family" | "place";
}

export function JigsawGame() {
  const t = useTranslations("games");
  const relT = useTranslations("options.relativeRelationship");
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "jigsaw", startLevel(detail));
  const rate = speechRate(detail);

  // Content targets: Family Members & Familiar Places
  const familyTargets = useMemo<PuzzleTarget[]>(() => {
    return (detail?.familyMembers ?? [])
      .filter((m): m is FamilyMemberItem & { photoUrl: string } => !!m.photoUrl)
      .map((m) => {
        const rel = relT.has(m.relation) ? relT(m.relation) : m.relation;
        return {
          id: `fam-${m.id}`,
          name: m.name,
          subtitle: rel ? `${m.name} • ${rel}` : m.name,
          photoUrl: m.photoUrl,
          notes: m.notes?.trim() || t("jigsaw.notesEmpty"),
          emoji: "🧑‍🤝‍🧑",
          type: "family",
        };
      });
  }, [detail, relT, t]);

  const placeTargets = useMemo<PuzzleTarget[]>(() => {
    return (detail?.familiarPlaces ?? [])
      .filter((p): p is FamiliarPlaceItem & { photoUrl: string } => !!p.photoUrl)
      .map((p) => {
        const cat = p.category ? ` • ${p.category}` : "";
        return {
          id: `place-${p.id}`,
          name: p.name,
          subtitle: `${p.name}${cat}`,
          photoUrl: p.photoUrl,
          notes: p.description?.trim() || t("jigsaw.notesEmpty"),
          emoji: p.emoji || "📍",
          type: "place",
        };
      });
  }, [detail, t]);

  const [category, setCategory] = useState<"family" | "places">("family");

  // Fallback if selected category is empty
  const activeTargets = useMemo(() => {
    if (category === "places" && placeTargets.length > 0) return placeTargets;
    if (familyTargets.length > 0) return familyTargets;
    if (placeTargets.length > 0) return placeTargets;
    return [];
  }, [category, familyTargets, placeTargets]);

  const defaultGridSize: GridDimension = level === 1 ? 2 : level === 2 ? 3 : 4;
  const [userGridSize, setUserGridSize] = useState<GridDimension | null>(null);
  const gridSize: GridDimension = userGridSize ?? defaultGridSize;

  const [ghostGuide, setGhostGuide] = useState<boolean>(true);
  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [order, setOrder] = useState<number[]>([]);
  const [selectedPos, setSelectedPos] = useState<number | null>(null);
  const [snapping, setSnapping] = useState<number[]>([]);
  const [peeking, setPeeking] = useState(false);
  const [taps, setTaps] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const guard = useSessionGuard({
    patientId,
    gameId: "jigsaw",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const currentTarget = activeTargets[index] ?? null;

  useEffect(() => {
    if (phase === "intro" && activeTargets.length) {
      speak(t("jigsaw.intro", { count: String(activeTargets.length) }), locale, rate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, activeTargets.length]);

  useEffect(() => () => stopSpeaking(), []);

  const startPuzzleFor = useCallback(
    (target: PuzzleTarget, gSize: GridDimension) => {
      stopSpeaking();
      playPress();
      const count = gSize * gSize;
      let next = makePermutation(count);
      while (solved(next)) next = makePermutation(count);
      setOrder(next);
      setSelectedPos(null);
      setSnapping([]);
      setPeeking(false);
      setTaps(0);
      setStartedAt(new Date().toISOString());
      setPhase("play");
      speak(`${t("jigsaw.startSpeech", { name: target.name })}`, locale, rate);
    },
    [locale, rate, t]
  );

  function begin() {
    if (!currentTarget) return;
    setIndex(0);
    startPuzzleFor(currentTarget, gridSize);
  }

  function changeGridSize(newSize: GridDimension) {
    if (newSize === gridSize) return;
    playPress();
    setUserGridSize(newSize);
    if (phase === "play" && currentTarget) {
      startPuzzleFor(currentTarget, newSize);
    }
  }

  function onCellTap(pos: number) {
    if (phase !== "play") return;
    if (peeking) {
      setPeeking(false);
      playTapFeedback();
      return;
    }
    if (selectedPos === null) {
      setSelectedPos(pos);
      playTapFeedback();
      return;
    }
    if (selectedPos === pos) {
      setSelectedPos(null);
      playTapFeedback();
      return;
    }

    setTaps((v) => v + 1);
    const next = [...order];
    [next[selectedPos], next[pos]] = [next[pos], next[selectedPos]];
    setOrder(next);
    setSelectedPos(null);

    const nowSolved = solved(next);
    const snappedNow = [selectedPos, pos].filter((p) => next[p] === p);

    if (nowSolved) {
      reveal();
    } else if (snappedNow.length) {
      playCorrect();
      setSnapping(snappedNow);
      if (snapTimer.current) clearTimeout(snapTimer.current);
      snapTimer.current = setTimeout(() => setSnapping([]), 520);
    } else {
      playTapFeedback();
    }
  }

  function revisitLightbox() {
    setLightboxOpen(true);
  }

  function nextTarget() {
    const nextItem = activeTargets[index + 1];
    if (!nextItem) return;
    setIndex((i) => i + 1);
    startPuzzleFor(nextItem, gridSize);
  }

  function reveal() {
    if (!currentTarget) return;
    stopSpeaking();
    playComplete();
    const isLast = index >= activeTargets.length - 1;
    setPhase("done");
    setLightboxOpen(true);
    guard.markCompleted();

    const notesText = currentTarget.notes || t("jigsaw.notesEmpty");

    if (isLast) {
      if (startedAt) {
        recordGameSession(patientId, {
          gameId: "jigsaw",
          level,
          outcome: "completed",
          score: activeTargets.length,
          startedAt,
          taps,
        });
      }
      const finishSpeech =
        currentTarget.type === "family"
          ? t("jigsaw.allCompleteSpeech")
          : t("jigsaw.allCompletePlacesSpeech");
      speak(`${finishSpeech} ${notesText}`, locale, rate);
    } else {
      const speech =
        currentTarget.type === "family"
          ? t("jigsaw.completeSpeech", {
              name: currentTarget.name,
              relation: currentTarget.subtitle,
            })
          : t("jigsaw.placeCompleteSpeech", {
              name: currentTarget.name,
              description: notesText,
            });
      speak(`${speech} ${notesText}`, locale, rate);
    }
  }

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell title={t("jigsaw.title")} score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  if (!activeTargets.length) {
    return (
      <GameShell title={t("jigsaw.title")} score={0}>
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <div className="text-6xl">🖼️</div>
          <p className="max-w-xs text-lg font-semibold text-ink-secondary">
            {t("jigsaw.noPhoto")}
          </p>
          <Link
            href="/patient/games"
            className="rounded-xl border-2 border-border bg-surface px-4 py-2 text-lg font-bold text-ink"
          >
            ← {t("backToHub")}
          </Link>
        </div>
      </GameShell>
    );
  }

  const photo = currentTarget ? getMediaUrl(currentTarget.photoUrl) : null;
  const finishedAll = index >= activeTargets.length - 1;

  return (
    <GameShell title={t("jigsaw.title")} score={index + (phase === "done" ? 1 : 0)}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-8 text-center">
          <div className="text-6xl">🧩</div>
          <p className="font-serif text-3xl font-black text-ink">{t("jigsaw.title")}</p>
          <p className="max-w-md text-lg font-semibold text-ink-secondary">
            {t("jigsaw.intro", { count: String(activeTargets.length) })}
          </p>

          {familyTargets.length > 0 && placeTargets.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setCategory("family")}
                className={`rounded-2xl border-2 px-5 py-2.5 text-base font-extrabold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                  category === "family"
                    ? "border-black bg-tea text-white scale-105"
                    : "border-border bg-surface text-ink hover:bg-surface-muted"
                }`}
              >
                {t("jigsaw.categoryFamily")} ({familyTargets.length})
              </button>
              <button
                type="button"
                onClick={() => setCategory("places")}
                className={`rounded-2xl border-2 px-5 py-2.5 text-base font-extrabold transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                  category === "places"
                    ? "border-black bg-marigold text-white scale-105"
                    : "border-border bg-surface text-ink hover:bg-surface-muted"
                }`}
              >
                {t("jigsaw.categoryPlaces")} ({placeTargets.length})
              </button>
            </div>
          )}

          <div className="flex flex-col items-center gap-2">
            <span className="text-sm font-bold uppercase tracking-wider text-ink-secondary">
              Grid Size / Difficulty
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUserGridSize(2)}
                className={`rounded-xl border-2 px-4 py-2 text-sm font-black transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                  gridSize === 2
                    ? "border-black bg-marigold text-white scale-105"
                    : "border-border bg-surface text-ink"
                }`}
              >
                {t("jigsaw.levelGentle")}
              </button>
              <button
                type="button"
                onClick={() => setUserGridSize(3)}
                className={`rounded-xl border-2 px-4 py-2 text-sm font-black transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                  gridSize === 3
                    ? "border-black bg-tea text-white scale-105"
                    : "border-border bg-surface text-ink"
                }`}
              >
                {t("jigsaw.levelClassic")}
              </button>
              <button
                type="button"
                onClick={() => setUserGridSize(4)}
                className={`rounded-xl border-2 px-4 py-2 text-sm font-black transition-all shadow-[2px_2px_0px_rgba(0,0,0,1)] ${
                  gridSize === 4
                    ? "border-black bg-terracotta text-white scale-105"
                    : "border-border bg-surface text-ink"
                }`}
              >
                {t("jigsaw.levelMaster")}
              </button>
            </div>
          </div>

          <AudioPrompt
            text={t("jigsaw.intro", { count: String(activeTargets.length) })}
            label={t("listen")}
            size="md"
          />

          <ChunkyButton variant="tea" size="2xl" onClick={begin}>
            {t("jigsaw.start")}
          </ChunkyButton>
        </div>
      ) : phase === "play" ? (
        <div className="flex flex-col items-center gap-4 py-4">
          {/* Target Thumbnails Progression Bar */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
            {activeTargets.map((item, i) => {
              const src = getMediaUrl(item.photoUrl);
              return (
                <div
                  key={item.id}
                  className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border-3 transition-transform ${
                    i < index
                      ? "border-tea bg-tea-light"
                      : i === index
                      ? "border-marigold scale-110 shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                      : "border-border-soft opacity-40"
                  }`}
                >
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={item.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-black text-tea">{item.name.slice(0, 1)}</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Target Header */}
          <div className="text-center">
            <h2 className="font-serif text-2xl font-black text-ink">
              {currentTarget?.type === "family"
                ? t("jigsaw.face", {
                    current: String(index + 1),
                    total: String(activeTargets.length),
                    name: currentTarget?.name ?? "",
                  })
                : t("jigsaw.landmark", {
                    current: String(index + 1),
                    total: String(activeTargets.length),
                    name: currentTarget?.name ?? "",
                  })}
            </h2>
            <p className="text-sm font-bold text-ink-secondary">{currentTarget?.subtitle}</p>
          </div>

          {/* Difficulty & Helper Controls Toolbar */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex items-center rounded-xl border-2 border-black bg-surface p-1 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
              {([2, 3, 4] as GridDimension[]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => changeGridSize(size)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-black transition-colors ${
                    gridSize === size
                      ? "bg-marigold text-white shadow-sm"
                      : "text-ink hover:bg-surface-muted"
                  }`}
                >
                  {size}×{size}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setGhostGuide((g) => !g)}
              className={`rounded-xl border-2 border-black px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 ${
                ghostGuide ? "bg-tea text-white" : "bg-surface text-ink"
              }`}
            >
              {ghostGuide ? t("jigsaw.guideOn") : t("jigsaw.guideOff")}
            </button>

            <AudioPrompt
              text={t("jigsaw.guidanceSpeech", { name: currentTarget?.name ?? "" })}
              label={t("listen")}
              size="md"
            />
          </div>

          {/* AUTHENTIC INTERLOCKING JIGSAW PUZZLE BOARD */}
          {photo ? (
            <JigsawPieceBoard
              gridSize={gridSize}
              order={order}
              selectedPos={selectedPos}
              snappingPos={snapping}
              photoUrl={photo}
              peeking={peeking}
              ghostGuide={ghostGuide}
              onPieceTap={onCellTap}
            />
          ) : null}

          {/* Action Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <ChunkyButton
              variant="marigold"
              size="xl"
              onClick={() => setPeeking((v) => !v)}
            >
              {peeking ? t("jigsaw.playing") : t("jigsaw.peek")}
            </ChunkyButton>
            <p className="text-base font-bold text-ink-secondary">
              {t("jigsaw.tapPrompt")}
            </p>
          </div>
        </div>
      ) : (
        <Celebration
          icon={Grid3X3}
          title={
            finishedAll
              ? t("jigsaw.allComplete")
              : currentTarget?.type === "family"
              ? t("jigsaw.complete", { name: currentTarget?.name ?? "" })
              : t("jigsaw.placeComplete", { name: currentTarget?.name ?? "" })
          }
        >
          {currentTarget && (
            <div className="flex flex-col items-center gap-4">
              <button
                type="button"
                onClick={revisitLightbox}
                className="group flex flex-col items-center gap-2 rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-transform hover:scale-102 cursor-pointer"
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo}
                    alt={currentTarget.name}
                    className="h-44 w-44 rounded-xl border-2 border-border object-cover"
                  />
                ) : null}
                <span className="text-lg font-black text-ink">
                  {currentTarget.subtitle}
                </span>
                <span className="rounded-full bg-tea-light border border-tea px-3 py-1 text-xs font-bold text-tea flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{t("jigsaw.viewPicture")}</span>
                </span>
              </button>

              {/* Reminiscence Folk Melody Button */}
              <button
                type="button"
                onClick={() => playLifeSong()}
                className="group flex items-center gap-2 rounded-2xl border-2 border-black bg-marigold-light px-4 py-2 text-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 cursor-pointer"
              >
                <Music className="h-4 w-4 text-ink" />
                <span className="text-sm font-black">{t("jigsaw.music")}</span>
              </button>
            </div>
          )}

          <div className="mt-4">
            {!finishedAll ? (
              <ChunkyButton variant="tea" size="2xl" onClick={nextTarget}>
                {t("jigsaw.nextCta", {
                  name: activeTargets[index + 1]?.name ?? "",
                })}
              </ChunkyButton>
            ) : (
              <Link
                href="/patient"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-border bg-tea px-6 py-3 font-bold text-ink-inverse"
              >
                {t("backToRoutine")}
              </Link>
            )}
          </div>
        </Celebration>
      )}

      {/* Memory Lightbox Modal */}
      <MemoryLightbox
        open={phase === "done" && lightboxOpen && !!currentTarget}
        onClose={() => setLightboxOpen(false)}
        photoUrl={currentTarget?.photoUrl}
        title={currentTarget ? currentTarget.subtitle : ""}
        text={currentTarget?.notes ?? t("jigsaw.notesEmpty")}
        langCode={locale}
        rate={rate}
        closeLabel={t("lightbox.close")}
        listenLabel={t("lightbox.listen")}
        speakingLabel={t("listening")}
      />
    </GameShell>
  );
}