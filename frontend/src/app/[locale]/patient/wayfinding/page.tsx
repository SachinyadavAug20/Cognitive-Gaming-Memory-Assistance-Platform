"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ScrapbookCard } from "@/components/ui/ScrapbookCard";
import { BigButton } from "@/components/ui/BigButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { GameHeader } from "@/components/layout/GameHeader";
import { LANDMARKS, ROUTE } from "@/data/wayfindingData";
import { useTranslations, useLocale } from "next-intl";

type Phase = "explore" | "recall";

export default function WayfindingGame() {
  const t = useTranslations("wayfinding");
  const locale = useLocale();
  const [phase, setPhase] = useState<Phase>("explore");
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedSteps, setHighlightedSteps] = useState<number[]>([0]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [recallStep, setRecallStep] = useState(1);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const advanceExplore = useCallback(() => {
    const next = currentStep + 1;
    if (next >= ROUTE.length) {
      setPhase("recall");
      setRecallStep(1);
      return;
    }
    setCurrentStep(next);
    setHighlightedSteps((prev) => [...prev, next]);
  }, [currentStep]);

  const checkRecall = useCallback(
    (answerIndex: number) => {
      setSelectedAnswer(answerIndex);
      const correct = answerIndex === recallStep;
      if (correct) setScore((s) => s + 20);

      setTimeout(() => {
        setSelectedAnswer(null);
        if (recallStep + 1 >= ROUTE.length) {
          setCompleted(true);
        } else {
          setRecallStep(recallStep + 1);
        }
      }, 1500);
    },
    [recallStep]
  );

  return (
    <div className="min-h-screen pb-8">
      <GameHeader title={t("title")} score={score} backHref="/patient" bgColor="bg-tea" />

      <div className="max-w-3xl mx-auto px-6 mt-8 space-y-8">
        {/* ── Map View ── */}
        <ScrapbookCard className="!p-6">
          <div className="bg-tea-light rounded-xl p-6 relative">
            <div className="flex items-center justify-between relative">
              {LANDMARKS.map((lm, i) => {
                const isActive = highlightedSteps.includes(i);
                const isCurrent = phase === "explore" && i === currentStep;
                return (
                  <div key={lm.id} className="flex flex-col items-center gap-2 flex-1 relative">
                    {i > 0 && (
                      <div
                        className={`absolute top-8 right-1/2 w-full h-1 rounded ${
                          isActive && highlightedSteps.includes(i - 1)
                            ? "bg-terracotta"
                            : "bg-border-soft"
                        }`}
                      />
                    )}
                    <div
                      className={`relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-2xl border-3 flex items-center justify-center text-3xl md:text-4xl transition-all ${
                        isCurrent
                          ? "bg-terracotta-light border-terracotta scale-110 shadow-lg"
                          : isActive
                          ? "bg-surface border-tea"
                          : "bg-surface-muted border-border-soft opacity-50"
                      }`}
                    >
                      {lm.emoji}
                      {isActive && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-tea rounded-full border-2 border-surface" />
                      )}
                    </div>
                    <span className="text-sm font-bold text-ink text-center leading-tight">
                      {lm.name}
                    </span>
                    <span className="text-xs text-ink-secondary text-center">
                      {lm.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrapbookCard>

        {/* ── Explore Phase ── */}
        {phase === "explore" && (
          <div className="space-y-6 text-center">
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-2xl text-ink">
              {t("explore")}
            </h2>
            <p className="text-ink-secondary text-lg">
              {t("step", { current: String(currentStep + 1), total: String(ROUTE.length) })}:{" "}
              <strong>{LANDMARKS[currentStep].name}</strong>
            </p>

            <AudioPrompt
              text={`You are at ${LANDMARKS[currentStep].name}. Next, you walk to ${currentStep + 1 < ROUTE.length ? LANDMARKS[currentStep + 1].name : "the clinic"}. Remember this route.`}
              lang={locale === "en" ? "en-US" : `${locale}-IN`}
              label="Listen to directions"
            />

            <BigButton variant="terracotta" size="xl" onClick={advanceExplore}>
              {currentStep + 1 < ROUTE.length
                ? t("walkTo", { name: LANDMARKS[currentStep + 1].name })
                : t("reached")}
            </BigButton>
          </div>
        )}

        {/* ── Recall Phase ── */}
        {phase === "recall" && !completed && (
          <div className="space-y-6 text-center">
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-2xl text-ink">
              {t("recall.label")}
            </h2>
            <p className="text-ink-secondary text-lg">
              {t("recall.desc", { prev: LANDMARKS[recallStep - 1].name })}
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              {LANDMARKS.map((lm, i) => {
                if (i === recallStep - 1) return null;
                const isSelected = selectedAnswer === i;
                const isCorrect = i === recallStep;
                return (
                  <button
                    key={lm.id}
                    onClick={() => checkRecall(i)}
                    disabled={selectedAnswer !== null}
                    className={`btn-tactile text-lg px-4 py-5 min-h-[72px] rounded-2xl flex flex-col items-center gap-2 ${
                      isSelected
                        ? isCorrect
                          ? "bg-tea text-ink-inverse border-border"
                          : "bg-brick text-ink-inverse border-border"
                        : "bg-surface text-ink border-border hover:bg-surface-muted"
                    }`}
                  >
                    <span className="text-3xl">{lm.emoji}</span>
                    <span className="font-bold">{lm.name}</span>
                  </button>
                );
              })}
            </div>

            {selectedAnswer !== null && (
              <p className="text-xl font-bold text-ink">
                {selectedAnswer === recallStep
                  ? "Correct! You remembered the way!"
                  : `Not quite — the next stop was ${LANDMARKS[recallStep].name}.`}
              </p>
            )}
          </div>
        )}

        {/* ── Completed ── */}
        {completed && (
          <div className="space-y-6 text-center">
            <div className="text-6xl">🏆</div>
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-3xl text-ink">
              {t("complete")}
            </h2>
            <p className="text-xl text-ink-secondary">
              {t("score", { score: String(score), total: String(ROUTE.length * 20) })}
            </p>
            <Link href="/patient">
              <BigButton variant="terracotta" size="xl">
                {t("title")}
              </BigButton>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
