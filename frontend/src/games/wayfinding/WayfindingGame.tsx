"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { BigButton } from "@/components/ui/BigButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { ScrapbookCard } from "@/components/ui/ScrapbookCard";
import { MemoryLightbox } from "@/components/ui/MemoryLightbox";
import { playPress, playCorrect, playIncorrect, playComplete } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { getMediaUrl } from "@/lib/api";
import { LOCALE_MAP } from "@/lib/i18n";
import { recordGameSession } from "@/lib/telemetry";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel, wayfindingRouteLength } from "@/games/config";
import type { FamiliarPlaceItem } from "@/types";

const DEFAULT_PLACES: FamiliarPlaceItem[] = [
  { id: -1, name: "Home", category: "home", description: "Assam-type house", emoji: "🏠", photoUrl: null },
  { id: -2, name: "Tea Stall", category: "tea", description: "Ranjan Dai's shop", emoji: "🍵", photoUrl: null },
  { id: -3, name: "Namghar", category: "temple", description: "Village prayer hall", emoji: "🛕", photoUrl: null },
  { id: -4, name: "Clinic", category: "clinic", description: "Dr. Baruah's clinic", emoji: "🏥", photoUrl: null },
];

interface RouteStep {
  place: FamiliarPlaceItem;
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

  const level = startLevel(detail);
  const rate = speechRate(detail);

  const places = useMemo<FamiliarPlaceItem[]>(() => {
    if ((detail?.familiarPlaces?.length ?? 0) >= 2) return detail!.familiarPlaces;
    return DEFAULT_PLACES;
  }, [detail]);

  const route = useMemo<RouteStep[]>(() => {
    const pool = places.length >= 2 ? places : DEFAULT_PLACES;
    const shuffled = shuffle(pool);
    const homeIdx = shuffled.findIndex((p) => (p.category ?? "").toLowerCase().includes("home"));
    if (homeIdx > -1 && homeIdx < shuffled.length - 1) {
      const [home] = shuffled.splice(homeIdx, 1);
      shuffled.push(home);
    }
    return shuffled
      .slice(0, Math.min(wayfindingRouteLength(detail), pool.length))
      .map((place) => ({ place }));
  }, [places, detail]);

  const [phase, setPhase] = useState<"explore" | "recall" | "done">("explore");
  const [currentStep, setCurrentStep] = useState(0);
  const [recallStep, setRecallStep] = useState(1);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [wiggle, setWiggle] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<FamiliarPlaceItem | null>(null);
  const startedAt = useRef<string>(new Date().toISOString());

  const exploreStarted = useRef(false);

  useEffect(() => {
    if (phase === "explore" && !exploreStarted.current && route.length) {
      exploreStarted.current = true;
      speak(`${t("wayfinding.explore")} ${route[0].place.name}`, locale, rate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, route]);

  const options = useMemo(() => {
    if (recallStep <= 0 || recallStep >= route.length) return [];
    const correct = route[recallStep].place;
    const distractors = places
      .filter((p) => p.name !== correct.name)
      .filter((p) => p.name !== route[recallStep - 1].place.name)
      .slice(0, 2);
    const pool = [correct, ...distractors];
    return pool.sort(() => Math.random() - 0.5);
  }, [recallStep, route, places]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        window.speechSynthesis?.cancel?.();
      }
    };
  }, []);

  function advanceExplore() {
    playPress();
    setTaps((v) => v + 1);
    const next = currentStep + 1;
    if (next >= route.length) {
      startRecall();
      return;
    }
    setCurrentStep(next);
    speak(
      `${t("wayfinding.walkTo", { name: route[next].place.name })}`,
      locale,
      rate
    );
  }

  function startRecall() {
    setPhase("recall");
    setRecallStep(1);
    speak(t("wayfinding.recallStart"), locale, rate);
  }

  function checkRecall(index: number) {
    if (selected !== null) return;
    setSelected(index);
    setTaps((v) => v + 1);
    const correct = options[index].name === route[recallStep].place.name;
    if (correct) {
      playCorrect();
      setScore((s) => s + 1);
      speak(
        `${t("wayfinding.correct")} ${options[index].name}`,
        locale,
        rate
      );
    } else {
      playIncorrect();
      setWiggle(index);
      speak(t("wayfinding.wrong"), locale, rate);
    }

    window.setTimeout(() => {
      setSelected(null);
      setWiggle(null);
      if (!correct) return;
      if (recallStep + 1 >= route.length) {
        finish();
      } else {
        setRecallStep((s) => s + 1);
      }
    }, 900);
  }

  function finish() {
    playComplete();
    setPhase("done");
    if (startedAt.current) {
      recordGameSession(patientId, {
        gameId: "wayfinding",
        level,
        outcome: "completed",
        score: score + 1,
        startedAt: startedAt.current,
        taps,
      });
    }
  }

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell>
      <div className="space-y-8">
        <ScrapbookCard className="!p-6">
          <div className="rounded-xl bg-tea-light p-6">
            <div className="relative flex items-center justify-between">
              {route.map((step, i) => {
                const isVisited = phase === "recall" || phase === "done" || i <= currentStep;
                const isCurrent = phase === "explore" && i === currentStep;
                return (
                  <div key={step.place.id} className="relative flex flex-1 flex-col items-center gap-2">
                    {i > 0 && (
                      <div
                        className={`absolute top-8 right-1/2 h-1 w-full rounded ${
                          isVisited && i - 1 <= currentStep ? "bg-tea" : "bg-border-soft"
                        }`}
                      />
                    )}
                    <div
                      className={`relative z-10 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-[3px] transition-all md:h-20 md:w-20 ${
                        isCurrent
                          ? "scale-110 border-terracotta bg-terracotta-light shadow-lg"
                          : isVisited
                          ? "border-tea bg-surface"
                          : "opacity-50 border-border-soft bg-surface-muted"
                      }`}
                    >
                      {step.place.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getMediaUrl(step.place.photoUrl) ?? ""}
                          alt={step.place.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl md:text-4xl">
                          {step.place.emoji ?? "📍"}
                        </span>
                      )}
                      {isVisited && (
                        <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full border-2 border-surface bg-tea" />
                      )}
                    </div>
                    <span className="text-center text-sm font-bold leading-tight text-ink">
                      {step.place.name}
                    </span>
                    {step.place.description && (
                      <span className="w-full max-w-[120px] text-center text-[11px] font-semibold leading-tight text-ink-secondary">
                        {step.place.description}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrapbookCard>

        {phase === "explore" && (
          <div className="space-y-6 text-center">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl font-bold text-ink">
              {t("wayfinding.explore")}
            </h2>
            <p className="text-lg text-ink-secondary">
              {t("wayfinding.step", {
                current: String(currentStep + 1),
                total: String(route.length),
              })}
              : <strong>{route[currentStep].place.name}</strong>
            </p>
            <AudioPrompt
              text={`${t("wayfinding.towards", {
                name: route[currentStep].place.name,
              })} ${
                route[currentStep].place.description
                  ? `${route[currentStep].place.description}. `
                  : ""
              }${
                currentStep + 1 < route.length
                  ? `${t("wayfinding.then")} ${route[currentStep + 1].place.name}`
                  : t("wayfinding.arrive")
              }`}
              lang={LOCALE_MAP[locale] ?? "en-US"}
              label={t("wayfinding.listenDirections")}
            />
            {route[currentStep].place.photoUrl ? (
              <button
                type="button"
                onClick={() => setLightbox(route[currentStep].place)}
                className="btn-tactile relative mx-auto block w-full max-w-md overflow-hidden rounded-2xl border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,1)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getMediaUrl(route[currentStep].place.photoUrl) ?? ""}
                  alt={route[currentStep].place.name}
                  className="h-52 w-full object-cover"
                />
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full border-2 border-black bg-ink/80 px-4 py-1.5 text-sm font-bold text-white">
                  🔍 {t("wayfinding.viewPhoto")}
                </span>
              </button>
            ) : null}
            <BigButton variant="terracotta" size="xl" onClick={advanceExplore}>
              {currentStep + 1 < route.length
                ? t("wayfinding.walkTo", { name: route[currentStep + 1].place.name })
                : t("wayfinding.reached")}
            </BigButton>
          </div>
        )}

        {phase === "recall" && (
          <div className="space-y-6 text-center">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl font-bold text-ink">
              {t("wayfinding.recallLabel")}
            </h2>
            <p className="text-lg text-ink-secondary">
              {t("wayfinding.recallDesc", { prev: route[recallStep - 1].place.name })}
            </p>
            <div className="mx-auto grid max-w-lg grid-cols-2 gap-4">
              {options.map((place, i) => (
                <button
                  key={`${place.id}-${recallStep}`}
                  onClick={() => checkRecall(i)}
                  disabled={selected !== null}
                  className={`btn-tactile flex min-h-[72px] flex-col items-center gap-1 overflow-hidden rounded-2xl border-2 px-4 py-5 text-lg ${
                    wiggle === i ? "animate-bounce bg-marigold/30" : ""
                  } ${
                    selected === i
                      ? place.name === route[recallStep].place.name
                        ? "border-border bg-tea text-ink-inverse"
                        : "border-border bg-brick text-ink-inverse"
                      : "border-border bg-surface text-ink hover:bg-surface-muted"
                  }`}
                >
                  {place.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={getMediaUrl(place.photoUrl) ?? ""}
                      alt={place.name}
                      className="h-14 w-14 rounded-xl border-2 border-border object-cover"
                    />
                  ) : (
                    <span className="text-3xl">{place.emoji ?? "📍"}</span>
                  )}
                  <span className="font-bold">{place.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "done" && (
          <Celebration emoji="🏡" title={t("wayfinding.complete")}>
            <p className="text-xl font-bold text-ink">
              {t("score", { score: `${score}/${route.length - 1}` })}
            </p>
            <Link
              href="/patient"
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-border bg-tea px-6 py-3 font-bold text-ink-inverse"
            >
              {t("backToRoutine")}
            </Link>
          </Celebration>
        )}
      </div>

      <MemoryLightbox
        open={lightbox ? true : false}
        onClose={() => setLightbox(null)}
        photoUrl={lightbox?.photoUrl}
        title={lightbox?.name ?? ""}
        text={lightbox?.description ?? null}
        langCode={locale}
        rate={rate}
        closeLabel={t("lightbox.close")}
        listenLabel={t("lightbox.listen")}
        speakingLabel={t("listening")}
      />
    </GameShell>
  );

  function GameShell({ children }: { children: React.ReactNode }) {
    return (
      <section className="pb-10">
        <GameHeader title={t("wayfinding.title")} score={score} backHref="/patient/games" bgColor="bg-tea" />
        <div className="mx-auto max-w-3xl px-4 pt-6">{children}</div>
      </section>
    );
  }
}