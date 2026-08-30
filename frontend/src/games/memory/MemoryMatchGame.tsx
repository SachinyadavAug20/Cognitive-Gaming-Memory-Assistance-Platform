"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playMechanicalClick, playSuccessChime } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { getMediaUrl } from "@/lib/api";
import { recordGameSession } from "@/lib/telemetry";
import { usePatientDetail } from "@/games/usePatientDetail";
import {
  memoryGridSize,
  memoryPreviewSeconds,
  memoryShowHints,
  speechRate,
  startLevel,
} from "@/games/config";
import type { FamilyMemberItem } from "@/types";

interface Card {
  member: FamilyMemberItem;
  key: number;
}

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function MemoryMatchGame() {
  const t = useTranslations("games");
  const relT = useTranslations("options.relativeRelationship");
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = startLevel(detail);
  const rate = speechRate(detail);
  const gridSize = memoryGridSize(detail);
  const previewSeconds = memoryPreviewSeconds(detail);
  const showHints = memoryShowHints(detail);

  const members = detail?.familyMembers ?? [];
  const playingMembers = members.slice(0, gridSize);

  const [phase, setPhase] = useState<"preview" | "play" | "done">("preview");
  const [count, setCount] = useState(previewSeconds);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [locked, setLocked] = useState(false);
  const [matched, setMatched] = useState<Set<number>>(new Set());
  const [taps, setTaps] = useState(0);
  const [hintOn, setHintOn] = useState(false);

  const startedAt = useRef<string | null>(null);

  const cards = useMemo<Card[]>(
    () => {
      if (!members.length) return [];
      return shuffle(
        playingMembers.flatMap((member, i) => [
          { member, key: i * 2 },
          { member, key: i * 2 + 1 },
        ])
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [patientId, phase === "done"]
  );

  const colsClass = ["", "", "grid-cols-2", "grid-cols-2 sm:grid-cols-3", "grid-cols-3 sm:grid-cols-4"][
    gridSize
  ];

  useEffect(() => stopSpeaking, []);

  useEffect(() => {
    if (phase !== "preview" || previewSeconds <= 0) return;
    const id = window.setInterval(() => {
      setCount((c) => {
        if (c <= 1) {
          window.clearInterval(id);
          startPlay();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase, previewSeconds]);

  useEffect(() => {
    if (phase === "preview" && playingMembers.length) {
      speak(t("memory.preview"), locale, rate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  function startPlay() {
    stopSpeaking();
    playMechanicalClick();
    setPhase("play");
    startedAt.current = new Date().toISOString();
  }

  const finish = useCallback(() => {
    stopSpeaking();
    playSuccessChime();
    setPhase("done");
    if (startedAt.current) {
      recordGameSession(patientId, {
        gameId: "memory",
        level,
        outcome: "completed",
        score: playingMembers.length,
        startedAt: startedAt.current,
        taps,
      });
    }
  }, [patientId, level, playingMembers.length, taps]);

  useEffect(() => {
    if (phase === "play" && matched.size === playingMembers.length && playingMembers.length > 0) {
      finish();
    }
  }, [phase, matched, playingMembers.length, finish]);

  function onFlip(index: number) {
    if (locked || phase !== "play") return;
    if (matched.has(cards[index].member.id)) return;
    if (flipped.includes(index)) return;
    playMechanicalClick();
    setTaps((v) => v + 1);

    const next = [...flipped, index];
    setFlipped(next);
    if (next.length === 2) {
      setLocked(true);
      const [a, b] = next;
      if (cards[a].member.id === cards[b].member.id) {
        window.setTimeout(() => {
          playSuccessChime();
          const member = cards[a].member;
          const relationLabel = relT.has(member.relation)
            ? relT(member.relation)
            : member.relation;
          speak(
            t("memory.matched", { relation: relationLabel, name: member.name }),
            locale,
            rate
          );
          setMatched((prev) => new Set(prev).add(member.id));
          setFlipped([]);
          setLocked(false);
        }, 300);
      } else {
        window.setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 900);
      }
    }
  }

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell>
        <GameError onRetry={reload} />
      </GameShell>
    );

  if (!members.length) {
    return (
      <GameShell>
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <div className="text-6xl">👨‍👩‍👧</div>
          <p className="max-w-xs text-lg font-semibold text-ink-secondary">
            Add family photos in the caregiver portal to play this game.
          </p>
          <Link
            href="/patient/games"
            className="text-lg font-bold text-terracotta underline"
          >
            ← {t("backToHub")}
          </Link>
        </div>
      </GameShell>
    );
  }

  return (
    <GameShell>
      {phase === "preview" ? (
        <div className="flex flex-col items-center gap-6 py-8">
          <p className="text-2xl font-bold text-ink">{t("memory.preview")}</p>
          <p className="text-base text-ink-secondary">{t("memory.previewNote")} (Level {level})</p>
          <AudioPrompt text={t("memory.preview")} label={t("listen")} size="md" />
          <div className={`grid w-full max-w-xl gap-3 ${colsClass}`}>
            {cards.map((card) => (
              <CardFace key={card.key} member={card.member} showImage />
            ))}
          </div>
          <div className="flex items-center gap-8">
            {previewSeconds > 0 && (
              <div className="relative flex h-16 w-16 items-center justify-center">
                <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    className="stroke-surface-muted"
                    strokeWidth="4"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeDasharray={`${(count / previewSeconds) * 97.4} 97.4`}
                    className="text-terracotta"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-2xl font-extrabold text-terracotta">{count}</span>
              </div>
            )}
            <ChunkyButton variant="terracotta" size="2xl" onClick={startPlay}>
              {t("memory.start")}
            </ChunkyButton>
          </div>
        </div>
      ) : phase === "done" ? (
        <Celebration emoji="💛" title={t("memory.complete")}>
          <p className="text-xl font-bold text-ink">
            {t("score", { score: `${matched.size}/${playingMembers.length}` })}
          </p>
          <Link
            href="/patient"
            className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-border bg-tea px-6 py-3 font-bold text-ink-inverse"
          >
            {t("backToRoutine")}
          </Link>
        </Celebration>
      ) : (
        <div className="flex flex-col items-center gap-5 py-8">
          <p className="text-lg font-bold text-ink">{t("memory.pairs")}</p>
          {showHints && (
            <button
              onClick={() => {
                playMechanicalClick();
                setHintOn((v) => !v);
              }}
              className="rounded-xl border-2 border-border bg-surface px-4 py-2 font-bold text-ink"
            >
              {hintOn ? t("memory.hintHide") : t("memory.hintShow")}
            </button>
          )}
          <div className={`grid w-full max-w-xl gap-3 ${colsClass}`}>
            {cards.map((card, i) => {
              const isMatched = matched.has(card.member.id);
              const isFlipped = isMatched || flipped.includes(i) || hintOn;
              return (
                <button
                  key={card.key}
                  onClick={() => onFlip(i)}
                  disabled={isMatched}
                  className={`aspect-square w-full overflow-hidden rounded-2xl border-2 border-border transition-transform duration-200 ${
                    isMatched ? "opacity-90" : "btn-tactile hover:scale-[1.02]"
                  } ${isFlipped ? "" : "bg-tea"}`}
                  aria-label={isFlipped ? card.member.name : t("memory.cardHidden")}
                >
                  {isFlipped ? (
                    <CardFace member={card.member} showImage />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-5xl">
                      ?
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-sm font-semibold text-ink-secondary">
            {t("memory.matchedCount", {
              matched: matched.size,
              total: playingMembers.length,
            })}
          </p>
        </div>
      )}
    </GameShell>
  );

  function CardFace({ member, showImage }: { member: FamilyMemberItem; showImage: boolean }) {
    const photo = getMediaUrl(member.photoUrl);
    return (
      <div className="flex h-full w-full flex-col overflow-hidden bg-surface">
        {showImage && photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={member.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-marigold/20 text-5xl">
            👤
          </div>
        )}
        {showImage && (
          <div className="bg-surface px-1 py-1 text-center text-xs font-bold text-ink sm:text-sm">
            {member.name}
          </div>
        )}
      </div>
    );
  }

  function GameShell({ children }: { children: React.ReactNode }) {
    return (
      <section className="pb-10">
        <GameHeader
          title={t("memory.title")}
          score={matched.size}
          backHref="/patient/games"
          bgColor="bg-tea"
        />
        <div className="mx-auto max-w-3xl px-4">{children}</div>
      </section>
    );
  }
}