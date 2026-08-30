"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { MemoryLightbox } from "@/components/ui/MemoryLightbox";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playCorrect, playTapFeedback } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { getMediaUrl } from "@/lib/api";
import { recordGameSession } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import type { LifeEventItem } from "@/types";

function yearValue(event: LifeEventItem): number {
  const n = Number.parseInt(String(event.year), 10);
  return Number.isFinite(n) ? n : Number.MAX_SAFE_INTEGER;
}

function eventLabel(event: LifeEventItem): string {
  return event.year ? `${event.year}: ${event.event}` : event.event;
}

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
      <GameHeader
        title={title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-terracotta"
      />
      <div className="mx-auto max-w-3xl px-4 pt-6">{children}</div>
    </section>
  );
}

export function TimelineGame() {
  const t = useTranslations("games");
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = startLevel(detail);
  const rate = speechRate(detail);

  const ordered = useMemo<LifeEventItem[]>(() => {
    const events = detail?.lifeStory?.lifeEvents ?? [];
    return [...events]
      .sort((a, b) => yearValue(a) - yearValue(b) || a.event.localeCompare(b.event))
      .slice(0, 3);
  }, [detail]);

  const [phase, setPhase] = useState<"play" | "done">("play");
  const [completedCount, setCompletedCount] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [taps, setTaps] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [lightbox, setLightbox] = useState<{ event: LifeEventItem } | null>(null);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const guard = useSessionGuard({
    patientId,
    gameId: "timeline",
    level,
    startedAt,
    taps,
    errorCount,
  });

  useEffect(() => {
    if (phase === "play" && ordered.length) {
      speak(t("timeline.intro"), locale, rate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => () => stopSpeaking(), []);

  const onPick = (event: LifeEventItem) => {
    if (phase !== "play") return;
    setTaps((v) => v + 1);
    if (!startedAt) setStartedAt(new Date().toISOString());
    const next = ordered[completedCount];
    if (event.event === next.event) {
      playCorrect();
      setHint(null);
      const count = completedCount + 1;
      setCompletedCount(count);
      speak(
        `${t("timeline.correct", {
          year: event.year || "—",
          event: event.event,
        })}`,
        locale,
        rate
      );
      if (count >= ordered.length) {
        window.setTimeout(() => finish(), 600);
      }
    } else {
      playTapFeedback();
      setErrorCount((v) => v + 1);
      const label = eventLabel(event);
      setHint(t("timeline.wrong", { event: label }));
      speak(t("timeline.wrongSpeech"), locale, rate);
      window.setTimeout(() => setHint(null), 3500);
    }
  };

  const finish = useCallback(() => {
    playCorrect();
    setPhase("done");
    guard.markCompleted();
    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "timeline",
        level,
        outcome: "completed",
        score: ordered.length,
        startedAt,
        taps,
        errorCount,
      });
    }
    const sequence = ordered
      .map((e) => e.year || t("timeline.longAgo"))
      .join(", ");
    speak(`${t("timeline.completeSpeech")} ${sequence}`, locale, rate);
  }, [ordered, patientId, level, taps, errorCount, startedAt, locale, rate, t]);

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell title={t("timeline.title")} score={completedCount}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  if (!ordered.length) {
    return (
      <GameShell title={t("timeline.title")} score={completedCount}>
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <div className="text-6xl">📜</div>
          <p className="max-w-xs text-lg font-semibold text-ink-secondary">
            {t("timeline.noData")}
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

  const placed = ordered.slice(0, completedCount);
  const remaining = ordered.slice(completedCount);
  const lightboxEvent = lightbox?.event;

  return (
    <GameShell title={t("timeline.title")} score={completedCount}>
      {phase === "done" ? (
        <Celebration emoji="📅" title={t("timeline.complete")}>
          <div className="mx-auto flex max-w-xl flex-wrap justify-center gap-3 px-4">
            {ordered.map((event) => (
              <EventBadge
                key={event.event}
                event={event}
                onView={() => setLightbox({ event })}
              />
            ))}
          </div>
          <Link
            href="/patient"
            className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-border bg-tea px-6 py-3 font-bold text-ink-inverse"
          >
            {t("backToRoutine")}
          </Link>
        </Celebration>
      ) : (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          <p className="text-xl font-bold text-ink">
            {t("timeline.prompt", {
              current: String(Math.max(completedCount, 1)),
              total: String(ordered.length),
            })}
          </p>
          <AudioPrompt text={t("timeline.introSpeech")} label={t("listen")} size="md" />

          {hint && (
            <p
              role="status"
              className="max-w-lg rounded-2xl border-2 border-marigold bg-marigold-light px-4 py-3 text-lg font-bold text-ink"
            >
              🕰️ {hint}
            </p>
          )}

          <div className="grid w-full max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
            {remaining.map((event) => {
              const src = getMediaUrl(event.photoUrl ?? undefined);
              return (
                <button
                  key={event.event}
                  onClick={() => onPick(event)}
                  className="group flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-black bg-surface p-4 shadow-[3px_3px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5"
                >
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt={event.event}
                      className="h-16 w-16 rounded-xl border-2 border-border object-cover"
                    />
                  ) : (
                    <span className="flex h-16 w-16 items-center justify-center rounded-xl border-2 border-border bg-terracotta-light text-3xl">
                      🕰️
                    </span>
                  )}
                  <span className="text-lg font-extrabold leading-tight text-ink">
                    {eventLabel(event)}
                  </span>
                </button>
              );
            })}
          </div>

          {placed.length > 0 && (
            <div className="w-full max-w-xl">
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-ink-secondary">
                {t("timeline.storySoFar")}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {placed.map((event) => (
                  <EventBadge
                    key={event.event}
                    event={event}
                    onView={() => setLightbox({ event })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <MemoryLightbox
        open={lightboxEvent ? true : false}
        onClose={() => setLightbox(null)}
        photoUrl={lightboxEvent?.photoUrl}
        title={lightboxEvent ? eventLabel(lightboxEvent) : ""}
        text={lightboxEvent?.event}
        langCode={locale}
        rate={rate}
        closeLabel={t("lightbox.close")}
        listenLabel={t("lightbox.listen")}
        speakingLabel={t("listening")}
      />
    </GameShell>
  );
}

function EventBadge({
  event,
  onView,
}: {
  event: LifeEventItem;
  onView: () => void;
}) {
  const src = getMediaUrl(event.photoUrl ?? undefined);
  return (
    <button
      type="button"
      onClick={onView}
      className={`btn-tactile flex items-center gap-2 rounded-2xl border-2 border-tea bg-tea-light px-3 py-2 font-bold text-ink ${
        src ? "" : "pointer-events-none cursor-default"
      }`}
      aria-label={eventLabel(event)}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={event.event}
          className="h-10 w-10 rounded-lg border-2 border-border object-cover"
        />
      ) : (
        <span className="text-2xl">🕰️</span>
      )}
      <span className="text-sm leading-tight">{eventLabel(event)}</span>
    </button>
  );
}