"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { MemoryLightbox } from "@/components/ui/MemoryLightbox";
import { playPress, playCorrect, playTapFeedback } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { getMediaUrl } from "@/lib/api";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { clamp, speechRate, startLevel } from "@/games/config";
import type { FamilyMemberItem } from "@/types";

function GameShell({ title, score, children }: { title: string; score: number; children: React.ReactNode }) {
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

// Interlocking jigsaw geometry (button-box-normalized 0..1 coordinates).
// Each button box is a grid cell (100 units) plus a 16-unit symmetric overhang
// on every side (button = 132 units), so tabs protrude from the content edge
// (16/132) to the button edge. Even-parity pieces carry tabs on interior
// edges, odd-parity neighbors keep a plain square cut — the checkerboard
// layout guarantees every protruding tab lands on a straight-receiving edge.
const TAB_FRAC = 16 / 132;
const TAB_HALF = 0.14;

function buildPiecePath(g: number, r: number, c: number): string {
  const y0 = TAB_FRAC;
  const x1 = 1 - TAB_FRAC;
  const y1 = 1 - TAB_FRAC;
  const even = (r + c) % 2 === 0;
  const top = r > 0 && even;
  const right = c < g - 1 && even;
  const bottom = r < g - 1 && even;
  const left = c > 0 && even;
  const parts: string[] = [`M ${TAB_FRAC} ${y0}`];
  if (top) {
    parts.push(
      `L ${0.5 - TAB_HALF} ${y0}`,
      `C ${0.5 - TAB_HALF} 0, ${0.5 + TAB_HALF} 0, ${0.5 + TAB_HALF} ${y0}`
    );
  }
  parts.push(`L ${x1} ${y0}`);
  if (right) {
    parts.push(
      `L ${x1} ${0.5 - TAB_HALF}`,
      `C 1 ${0.5 - TAB_HALF}, 1 ${0.5 + TAB_HALF}, ${x1} ${0.5 + TAB_HALF}`
    );
  }
  parts.push(`L ${x1} ${y1}`);
  if (bottom) {
    parts.push(
      `L ${0.5 + TAB_HALF} ${y1}`,
      `C ${0.5 + TAB_HALF} 1, ${0.5 - TAB_HALF} 1, ${0.5 - TAB_HALF} ${y1}`
    );
  }
  parts.push(`L ${TAB_FRAC} ${y1}`);
  if (left) {
    parts.push(
      `L ${TAB_FRAC} ${0.5 + TAB_HALF}`,
      `C 0 ${0.5 + TAB_HALF}, 0 ${0.5 - TAB_HALF}, ${TAB_FRAC} ${0.5 - TAB_HALF}`
    );
  }
  parts.push(`L ${TAB_FRAC} ${y0}`, "Z");
  return parts.join(" ");
}

export function JigsawGame() {
  const t = useTranslations("games");
  const relT = useTranslations("options.relativeRelationship");
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "jigsaw", startLevel(detail));
  const rate = speechRate(detail);
  const gridSize = clamp(level, 1, 3) + 1; // Level 1 => 2x2, Level 2 => 3x3, Level 3 => 4x4
  const pieceCount = gridSize * gridSize;
  const boardUnits = 100 * gridSize + 32; // assembled board span in geometry units

  const members = useMemo(
    () => (detail?.familyMembers ?? []).filter((m) => m.photoUrl),
    [detail]
  );

  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [index, setIndex] = useState(0);
  const [order, setOrder] = useState<number[]>([]);
  const [selectedPos, setSelectedPos] = useState<number | null>(null);
  const [peeking, setPeeking] = useState(false);
  const [taps, setTaps] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [snapping, setSnapping] = useState<number[]>([]);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");

  const guard = useSessionGuard({
    patientId,
    gameId: "jigsaw",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const member = members[index] ?? null;

  const clipDefs = useMemo(() => {
    const defs: { id: string; d: string }[] = [];
    for (let i = 0; i < pieceCount; i++) {
      const r = Math.floor(i / gridSize);
      const c = i % gridSize;
      defs.push({
        id: `${uid}-${gridSize}-${r}-${c}`,
        d: buildPiecePath(gridSize, r, c),
      });
    }
    return defs;
  }, [gridSize, pieceCount, uid]);

  useEffect(() => {
    if (phase === "intro" && members.length) {
      speak(t("jigsaw.intro", { count: String(members.length) }), locale, rate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => () => stopSpeaking(), []);

  const startMember = useCallback(
    (target: FamilyMemberItem) => {
      stopSpeaking();
      playPress();
      let next = makePermutation(pieceCount);
      while (solved(next)) next = makePermutation(pieceCount);
      setOrder(next);
      setSelectedPos(null);
      setPeeking(false);
      setTaps(0);
      setStartedAt(new Date().toISOString());
      setPhase("play");
      speak(
        `${t("jigsaw.startSpeech", { name: target.name })}`,
        locale,
        rate
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pieceCount, locale, rate]
  );

  function begin() {
    if (!member) return;
    setIndex(0);
    startMember(member);
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
    if (snappedNow.length && !nowSolved) {
      playCorrect();
      setSnapping(snappedNow);
      if (snapTimer.current) clearTimeout(snapTimer.current);
      snapTimer.current = setTimeout(() => setSnapping([]), 520);
    }
    if (nowSolved) reveal();
  }

  function revisitLightbox() {
    setLightboxOpen(true);
  }

  function nextMember() {
    const target = members[index + 1];
    if (!target) return;
    setIndex((i) => i + 1);
    startMember(target);
  }

  function reveal() {
    if (!member) return;
    stopSpeaking();
    playCorrect();
    const isLast = index >= members.length - 1;
    setPhase("done");
    setLightboxOpen(true);
    guard.markCompleted();
    const notesText = member.notes?.trim() || t("jigsaw.notesEmpty");
    if (isLast) {
      if (startedAt) {
        recordGameSession(patientId, {
          gameId: "jigsaw",
          level,
          outcome: "completed",
          score: members.length,
          startedAt,
          taps,
        });
      }
      speak(`${t("jigsaw.allCompleteSpeech")} ${notesText}`, locale, rate);
    } else {
      const relationLabel = relT.has(member.relation)
        ? relT(member.relation)
        : member.relation;
      speak(
        `${t("jigsaw.completeSpeech", {
          name: member.name,
          relation: relationLabel,
        })} ${notesText}`,
        locale,
        rate
      );
    }
  }

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell title={t("jigsaw.title")} score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  if (!members.length) {
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

  const photo = member ? getMediaUrl(member.photoUrl) : null;
  const relationLabel =
    member && relT.has(member.relation) ? relT(member.relation) : member?.relation;
  const finishedAll = index >= members.length - 1;

  return (
    <GameShell title={t("jigsaw.title")} score={index + (phase === "done" ? 1 : 0)}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-10 text-center">
          <div className="text-6xl">🧩</div>
          <p className="text-2xl font-bold text-ink">{t("jigsaw.title")}</p>
          <p className="max-w-md text-lg font-semibold text-ink-secondary">
            {t("jigsaw.intro", { count: String(members.length) })}
          </p>
          <AudioPrompt
            text={t("jigsaw.intro", { count: String(members.length) })}
            label={t("listen")}
            size="md"
          />
          <ChunkyButton variant="tea" size="2xl" onClick={begin}>
            {t("jigsaw.start")}
          </ChunkyButton>
        </div>
      ) : phase === "play" ? (
        <div className="flex flex-col items-center gap-5 py-8">
          <div className="flex items-center gap-2">
            {members.map((m, i) => {
              const src = getMediaUrl(m.photoUrl);
              return (
                <div
                  key={m.id}
                  className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 ${
                    i < index
                      ? "border-tea"
                      : i === index
                      ? "border-terracotta scale-110"
                      : "border-border-soft opacity-40"
                  }`}
                >
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={m.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-sm font-black text-tea">{m.name.slice(0, 1)}</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-lg font-bold text-ink">
            {t("jigsaw.face", {
              current: String(index + 1),
              total: String(members.length),
              name: member?.name ?? "",
            })}
          </p>
          <AudioPrompt
            text={t("jigsaw.guidanceSpeech", { name: member?.name ?? "" })}
            label={t("listen")}
            size="md"
          />
          {photo ? (
            <div
              className="relative aspect-square w-full max-w-md overflow-hidden rounded-2xl border-2 border-black bg-surface-muted shadow-[3px_3px_0px_rgba(0,0,0,1)]"
              style={{ padding: `${(16 / boardUnits) * 100}%` }}
            >
              {peeking ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={member?.name} className="h-full w-full object-cover" />
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border-2 border-black bg-ink/70 px-4 py-1 text-sm font-bold text-white">
                    👀 {t("jigsaw.peeking")}
                  </span>
                </>
              ) : (
                <div role="group" aria-label={t("jigsaw.title")} className="absolute inset-0">
                  <svg width={0} height={0} aria-hidden="true" focusable="false">
                    <defs>
                      {clipDefs.map(({ id, d }) => (
                        <clipPath key={id} id={id} clipPathUnits="objectBoundingBox">
                          <path d={d} />
                        </clipPath>
                      ))}
                    </defs>
                  </svg>
                  {order.map((pieceId, pos) => {
                    const r = Math.floor(pos / gridSize);
                    const c = pos % gridSize;
                    const hr = Math.floor(pieceId / gridSize);
                    const hc = pieceId % gridSize;
                    const isSel = selectedPos === pos;
                    return (
                      <button
                        key={`${pieceId}-${pos}`}
                        onClick={() => onCellTap(pos)}
                        aria-pressed={isSel}
                        aria-label={t("jigsaw.piece")}
                        className={`absolute transition-transform duration-150 ${
                          snapping.includes(pos) ? "piece-snap" : ""
                        } ${isSel ? "scale-[1.05]" : "active:scale-95"}`}
                        style={{
                          left: `${((c * 100 - 16) / boardUnits) * 100}%`,
                          top: `${((r * 100 - 16) / boardUnits) * 100}%`,
                          width: `${(132 / boardUnits) * 100}%`,
                          height: `${(132 / boardUnits) * 100}%`,
                          zIndex: (hr + hc) % 2 === 0 ? 2 : 1,
                          clipPath: `url(#${uid}-${gridSize}-${hr}-${hc})`,
                          backgroundImage: `url(${photo})`,
                          backgroundSize: `${((gridSize * 100 * 100) / 132)}% ${((gridSize * 100 * 100) / 132)}%`,
                          backgroundPosition: `${((16 - hc * 100) / (132 - gridSize * 100)) * 100}% ${((16 - hr * 100) / (132 - gridSize * 100)) * 100}%`,
                          filter: isSel
                            ? "drop-shadow(0 0 10px rgba(230,106,0,0.9)) drop-shadow(3px 4px 0 rgba(0,0,0,0.45))"
                            : "drop-shadow(3px 4px 0 rgba(0,0,0,0.45))",
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          ) : null}
          <div className="flex items-center gap-4">
            <ChunkyButton variant="marigold" size="xl" onClick={() => setPeeking((v) => !v)}>
              {peeking ? t("jigsaw.playing") : t("jigsaw.peek")}
            </ChunkyButton>
            <p className="text-base font-semibold text-ink-secondary">{t("jigsaw.tapPrompt")}</p>
          </div>
        </div>
      ) : (
        <Celebration
          emoji="🧩"
          title={
            finishedAll ? t("jigsaw.allComplete") : t("jigsaw.complete", { name: member?.name ?? "" })
          }
        >
          {member && (
            <button
              type="button"
              onClick={revisitLightbox}
              className="group flex flex-col items-center gap-2 rounded-2xl border-2 border-black bg-surface p-3 shadow-[3px_3px_0px_rgba(0,0,0,1)]"
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo}
                  alt={member.name}
                  className="h-36 w-36 rounded-xl border-2 border-border object-cover"
                />
              ) : null}
              <span className="text-base font-bold text-ink">
                {t("jigsaw.viewPicture")} 🔊
              </span>
            </button>
          )}
          {!finishedAll ? (
            <ChunkyButton variant="tea" size="2xl" onClick={nextMember}>
              {t("jigsaw.nextCta", { name: members[index + 1]?.name ?? "" })}
            </ChunkyButton>
          ) : (
            <Link
              href="/patient"
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-border bg-tea px-6 py-3 font-bold text-ink-inverse"
            >
              {t("backToRoutine")}
            </Link>
          )}
        </Celebration>
      )}

      <MemoryLightbox
        open={phase === "done" && lightboxOpen && member ? true : false}
        onClose={() => setLightboxOpen(false)}
        photoUrl={member?.photoUrl}
        title={member ? `${member.name} • ${relationLabel}` : ""}
        text={member?.notes ?? t("jigsaw.notesEmpty")}
        langCode={locale}
        rate={rate}
        closeLabel={t("lightbox.close")}
        listenLabel={t("lightbox.listen")}
        speakingLabel={t("listening")}
      />
    </GameShell>
  );
}