"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Utensils, Music } from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import {
  playPress,
  playCorrect,
  playComplete,
  playSizzle,
  playPineBreeze,
  playLifeSong,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { getGameStrings } from "@/lib/gameI18n";

export interface RecipeStep {
  id: string;
  name: string;
  emoji: string;
  actionDesc: string;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  steps: RecipeStep[];
}

const RECIPES: Recipe[] = [
  {
    id: "tenga",
    title: "Assamese Masor Tenga",
    subtitle: "Tangy fresh river curry with fragrant Kaji Nemu lemon",
    emoji: "🍲",
    steps: [
      { id: "oil", name: "Pure Mustard Oil", emoji: "🫒", actionDesc: "Pour golden mustard oil into hot pan" },
      { id: "spices", name: "Panch Phoron & Ginger", emoji: "🫚", actionDesc: "Add fragrant five spices and crushed ginger" },
      { id: "turmeric", name: "Golden Turmeric", emoji: "🧂", actionDesc: "Sprinkle turmeric and sea salt" },
      { id: "fish", name: "Fresh River Fish", emoji: "🐟", actionDesc: "Gently add fresh tender fish pieces" },
      { id: "lemon", name: "Kaji Nemu Lemon Juice", emoji: "🍋", actionDesc: "Squeeze fresh tangy Kaji Nemu juice" },
    ],
  },
  {
    id: "jadoh",
    title: "Khasi Fragrant Jadoh",
    subtitle: "Traditional Shillong rice stew with turmeric & herbs",
    emoji: "🍚",
    steps: [
      { id: "oil", name: "Mustard Oil", emoji: "🫒", actionDesc: "Heat the clay pot" },
      { id: "onion", name: "Chopped Onions & Ginger", emoji: "🧅", actionDesc: "Sauté onions till golden" },
      { id: "bay", name: "Bay Leaves & Cardamom", emoji: "🍃", actionDesc: "Add aromatic hill spices" },
      { id: "rice", name: "Highland Sticky Rice", emoji: "🍚", actionDesc: "Stir in the washed local rice" },
    ],
  },
  {
    id: "thukpa",
    title: "Sikkimese Mountain Thukpa",
    subtitle: "Warming Himalayan noodle broth with mountain herbs",
    emoji: "🍜",
    steps: [
      { id: "broth", name: "Clear Mountain Broth", emoji: "🥣", actionDesc: "Simmer fragrant herb broth" },
      { id: "veggies", name: "Bok Choy & Carrots", emoji: "🥬", actionDesc: "Add crisp mountain greens" },
      { id: "noodles", name: "Handmade Wheat Noodles", emoji: "🍜", actionDesc: "Drop in fresh soft noodles" },
      { id: "garlic", name: "Fried Mountain Garlic", emoji: "🧄", actionDesc: "Garnish with golden crispy garlic" },
    ],
  },
  {
    id: "bai",
    title: "Mizo Herbal Bai",
    subtitle: "Soothing indigenous vegetable & bamboo shoot stew",
    emoji: "🌱",
    steps: [
      { id: "water", name: "Spring Water Base", emoji: "💧", actionDesc: "Bring fresh hill spring water to boil" },
      { id: "bamboo", name: "Fresh Bamboo Shoots", emoji: "🎍", actionDesc: "Add tender sliced mountain bamboo shoots" },
      { id: "greens", name: "Local Mustard Greens", emoji: "🥬", actionDesc: "Fold in freshly harvested greens" },
      { id: "herbs", name: "Steamed Fermented Soya", emoji: "🌿", actionDesc: "Season with fragrant mountain herbs" },
    ],
  },
];

function deterministicShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function HeritageKitchenGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "heritage-kitchen", startLevel(detail));
  const rate = speechRate(detail);

  const [recipeIdx, setRecipeIdx] = useState(0);
  const [phase, setPhase] = useState<"intro" | "cook" | "done">("intro");
  const [stepIdx, setStepIdx] = useState(0);
  const [potIngredients, setPotIngredients] = useState<RecipeStep[]>([]);
  const [isSizzling, setIsSizzling] = useState(false);
  const [hintActive, setHintActive] = useState(false);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const hintTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const recipe = RECIPES[recipeIdx] ?? RECIPES[0];
  const currentStep = recipe.steps[stepIdx] ?? null;

  const guard = useSessionGuard({
    patientId,
    gameId: "heritage-kitchen",
    level,
    startedAt,
    taps,
    errorCount,
  });

  // Distractor ingredients pool
  const ingredientOptions = useMemo(() => {
    if (!currentStep) return [];
    const allStepsInRecipe = recipe.steps;
    const remainingSteps = allStepsInRecipe.filter((_, idx) => idx >= stepIdx);
    const options = [currentStep, ...remainingSteps.filter((s) => s.id !== currentStep.id).slice(0, 2)];
    return deterministicShuffle(options, stepIdx + recipeIdx);
  }, [currentStep, recipe, stepIdx, recipeIdx]);

  useEffect(() => {
    return () => {
      stopSpeaking();
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, []);

  const announceStep = useCallback(
    (step: RecipeStep) => {
      stopSpeaking();
      speak(`Next step: Add ${step.name}. ${step.actionDesc}`, locale, rate);
    },
    [locale, rate]
  );

  function startCooking(selectedRecipeIdx = 0) {
    stopSpeaking();
    playPress();
    setRecipeIdx(selectedRecipeIdx);
    setStepIdx(0);
    setPotIngredients([]);
    setIsSizzling(false);
    setHintActive(false);
    setScore(0);
    setTaps(0);
    setErrorCount(0);
    setStartedAt(new Date().toISOString());
    setPhase("cook");
  }

  // Automatic errorless scaffolding hint after 10s idle
  useEffect(() => {
    if (phase === "cook" && currentStep && !hintActive) {
      if (hintTimer.current) clearTimeout(hintTimer.current);
      hintTimer.current = setTimeout(() => {
        setHintActive(true);
        playPineBreeze();
      }, 10000);
    }
    return () => {
      if (hintTimer.current) clearTimeout(hintTimer.current);
    };
  }, [phase, currentStep, hintActive]);

  function handleAddIngredient(chosen: RecipeStep) {
    if (!currentStep || isSizzling) return;
    setTaps((v) => v + 1);

    const isCorrect = chosen.id === currentStep.id;

    if (isCorrect) {
      playSizzle();
      playCorrect();
      setIsSizzling(true);
      setScore((s) => s + 1);
      setPotIngredients((prev) => [...prev, chosen]);
      setHintActive(false);

      setTimeout(() => {
        setIsSizzling(false);
        const nextIdx = stepIdx + 1;
        if (nextIdx >= recipe.steps.length) {
          completeRecipe();
        } else {
          setStepIdx(nextIdx);
          announceStep(recipe.steps[nextIdx]);
        }
      }, 1000);
    } else {
      // Errorless Scaffolding
      setErrorCount((e) => e + 1);
      playPineBreeze();
      setHintActive(true);
      speak(`Let us first add the ${currentStep.name}.`, locale, rate);
    }
  }

  function completeRecipe() {
    stopSpeaking();
    playComplete();
    setPhase("done");
    guard.markCompleted();

    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "heritage-kitchen",
        level,
        outcome: "completed",
        score: recipe.steps.length,
        startedAt,
        taps,
        errorCount,
      });
    }
    speak(
      `Delicious! Your ${recipe.title} is freshly prepared, steaming, and ready to serve with love!`,
      locale,
      rate
    );
  }

  const str = getGameStrings("heritage-kitchen", locale);

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
      <GameHeader title={str.title} score={score} backHref="/patient/games" bgColor="bg-tea" />
      <div className="mx-auto max-w-3xl px-4 pt-6">
        {phase === "intro" ? (
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <div className="text-6xl animate-bounce">🍲</div>
            <p className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </p>
            <p className="max-w-md text-lg font-semibold text-ink-secondary">
              {str.introSubtitle}
            </p>

            {/* Recipe Selection Cards */}
            <div className="w-full max-w-md space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-tea">
                {str.hudAction}
              </span>
              <div className="grid gap-3">
                {RECIPES.map((r, idx) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => startCooking(idx)}
                    className="btn-tactile group flex items-center justify-between rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-transform hover:scale-102 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{r.emoji}</span>
                      <div>
                        <p className="text-base font-black text-ink">{r.title}</p>
                        <p className="text-xs font-semibold text-ink-secondary">{r.subtitle}</p>
                      </div>
                    </div>
                    <span className="text-xl text-tea font-black">→</span>
                  </button>
                ))}
              </div>
            </div>

            <AudioPrompt
              text={str.audioPrompt}
              label={str.listenLabel}
              size="md"
            />

            <ChunkyButton variant="tea" size="2xl" onClick={() => startCooking(0)}>
              Start Cooking 🍲
            </ChunkyButton>
          </div>
        ) : phase === "cook" ? (
          <div className="flex flex-col items-center gap-5 py-4">
            {/* RECIPE PROGRESS HEADER */}
            <div className="w-full max-w-md flex items-center justify-between rounded-2xl border-2 border-black bg-surface px-4 py-2 shadow-sm">
              <span className="text-sm font-black text-tea">{recipe.title}</span>
              <span className="text-xs font-bold text-ink-secondary">
                Step {stepIdx + 1} of {recipe.steps.length}
              </span>
            </div>

            {/* CLAY STOVE & BRASS KARAHI STAGE */}
            <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl border-4 border-[#3A1D0E] bg-[#221008] p-5 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] overflow-hidden select-none flex flex-col items-center justify-center min-h-[260px]">
              {/* Cooking Pot Glow */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#F97316_1px,transparent_1px)] [background-size:12px_12px]" />

              {/* Sizzling Steam Effect */}
              {isSizzling && (
                <div className="absolute top-4 text-3xl animate-ping pointer-events-none">
                  ♨️
                </div>
              )}

              {/* The Brass Karahi / Cooking Vessel */}
              <div className="relative z-10 flex flex-col items-center justify-center h-44 w-44 rounded-full border-4 border-amber-600 bg-gradient-to-b from-amber-950 via-amber-900 to-black shadow-2xl p-3 text-center">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Brass Cooking Pot
                </span>

                {/* Added Ingredients inside the pot */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 max-w-[120px]">
                  {potIngredients.map((item, idx) => (
                    <span key={idx} className="text-2xl animate-bounce" title={item.name}>
                      {item.emoji}
                    </span>
                  ))}
                </div>

                {isSizzling && (
                  <span className="mt-1 text-[11px] font-black text-amber-400 animate-pulse">
                    ♨️ Sizzling & Simmering...
                  </span>
                )}
              </div>

              {/* TACTILE WOODEN LADLE STIR BUTTON */}
              <div className="mt-3 flex items-center justify-center gap-2 z-10">
                <button
                  type="button"
                  onClick={() => {
                    playSizzle();
                    setIsSizzling(true);
                    setTimeout(() => setIsSizzling(false), 900);
                  }}
                  className="btn-tactile flex items-center gap-1.5 rounded-full border-2 border-amber-500 bg-amber-900/80 px-3 py-1 text-xs font-black text-amber-200 shadow-md hover:bg-amber-800 active:translate-y-0.5 cursor-pointer"
                >
                  <span>🥄 Stir with Ladle</span>
                </button>

                {currentStep && (
                  <span className="text-xs font-black text-amber-200 bg-black/60 px-3 py-1 rounded-full border border-amber-500/40">
                    Next: {currentStep.name}
                  </span>
                )}
              </div>
            </div>

            {/* HINT BANNER IF ACTIVE */}
            {hintActive && currentStep && (
              <div className="rounded-xl border-2 border-marigold bg-marigold-light p-3 text-center text-sm font-bold text-ink shadow-sm animate-pulse max-w-md w-full">
                💡 Tap the {currentStep.name} ({currentStep.emoji}) to add to the pan!
              </div>
            )}

            {/* INGREDIENTS TRAY */}
            <div className="w-full max-w-md space-y-2 text-center pt-2">
              <p className="text-sm font-black text-ink-secondary uppercase tracking-wider">
                Select Ingredient to Add
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {ingredientOptions.map((item) => {
                  const isTarget = item.id === currentStep?.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAddIngredient(item)}
                      disabled={isSizzling}
                      className={`btn-tactile group relative flex flex-col items-center gap-1 rounded-2xl border-3 border-black p-3 transition-all duration-200 cursor-pointer shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-0.5 ${
                        hintActive && isTarget
                          ? "ring-4 ring-marigold bg-marigold-light scale-105"
                          : "bg-surface text-ink hover:bg-surface-muted"
                      }`}
                    >
                      <span className="text-3xl sm:text-4xl">{item.emoji}</span>
                      <span className="text-xs font-black leading-tight truncate max-w-[90px]">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* PHASE: DONE CELEBRATION */
          <Celebration icon={Utensils} title={str.celebrationTitle}>
            <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left">
              <div className="relative w-full rounded-3xl border-4 border-black bg-[#FAF5EE] p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-ink select-none">
                <h3 className="font-serif text-2xl font-black text-tea">
                  {recipe.title}
                </h3>
                <p className="text-xs font-bold text-ink-secondary mt-1">
                  {str.celebrationSubtitle}
                </p>

                {/* Recipe Ingredients Summary */}
                <div className="mt-3 space-y-1 border-t border-border pt-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-ink-secondary">
                    {str.hudProgress}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.steps.map((s) => (
                      <span key={s.id} className="rounded-lg bg-tea-light border border-tea px-2 py-0.5 text-xs font-bold text-ink">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Music Button */}
                <div className="mt-4 flex items-center justify-between pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => playLifeSong()}
                    className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3.5 py-2 text-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 cursor-pointer"
                  >
                    <Music className="h-4 w-4 text-ink" />
                    <span className="text-xs font-black">Play Kitchen Folk Tune</span>
                  </button>
                  <span className="text-xs font-bold text-ink-secondary">
                    Score: {score}/{recipe.steps.length}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <ChunkyButton variant="tea" size="xl" onClick={() => startCooking((recipeIdx + 1) % RECIPES.length)}>
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
