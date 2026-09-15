"use client";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  RotateCcw,
  Check,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import {
  playPress,
  playCorrect,
  playComplete,
  playEncourage,
} from "@/lib/sound";
import { speak } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import type { SupportedLocale } from "@/lib/gameI18n";
import { BAZAAR_PRODUCTS, BAZAAR_I18N, BazaarProduct } from "./bazaarI18n";
import { useErrorlessScaffold } from "@/hooks/useErrorlessScaffold";
import { CaregiverCoPlayPrompt } from "@/components/ui/CaregiverCoPlayPrompt";

function getProduceEmoji(id: string): string {
  switch (id) {
    case "lemon":
      return "🍋";
    case "fern":
      return "🌿";
    case "banana":
      return "🍌";
    case "tea":
      return "🍵";
    case "pottery":
      return "🏺";
    case "rice":
      return "🌾";
    case "pickle":
      return "🌶️";
    case "oil":
      return "🌻";
    default:
      return "🧺";
  }
}

// Short, clear names without descriptions or parentheses
function getShortName(product: BazaarProduct, locale: string): string {
  switch (product.id) {
    case "lemon":
      return locale === "as" ? "কাজী নেমু" : locale === "hi" ? "काज़ी नींबू" : "Kaji Nemu";
    case "fern":
      return locale === "as" ? "ঢেকীয়া শাক" : locale === "hi" ? "ढेकीया साग" : "Dhekia Saag";
    case "banana":
      return locale === "as" ? "ভীম কল" : locale === "hi" ? "भीम केला" : "Bhim Kol";
    case "tea":
      return locale === "as" ? "অসম চাহ" : locale === "hi" ? "असम चाय" : "Assam Tea";
    case "pottery":
      return locale === "as" ? "মাটিৰ কলহ" : locale === "hi" ? "मिट्टी का घड़ा" : "Clay Pot";
    case "rice":
      return locale === "as" ? "জোহা চাউল" : locale === "hi" ? "जोहा चावल" : "Joha Rice";
    case "pickle":
      return locale === "as" ? "জলকীয়া আচাৰ" : locale === "hi" ? "मिर्च अचार" : "Chili Pickle";
    case "oil":
      return locale === "as" ? "সৰিয়হ তেল" : locale === "hi" ? "सरसों तेल" : "Mustard Oil";
    default:
      return product.name.en.split("(")[0].trim();
  }
}

function noteStyle(note: number) {
  switch (note) {
    case 10:
      return "bg-[#795548] text-white border-black hover:brightness-110";
    case 20:
      return "bg-[#C0CA33] text-black border-black hover:brightness-95";
    case 50:
      return "bg-[#00897B] text-white border-black hover:brightness-110";
    case 100:
      return "bg-[#5E35B1] text-white border-black hover:brightness-110";
    case 200:
      return "bg-[#F4511E] text-white border-black hover:brightness-110";
    case 500:
      return "bg-[#546E7A] text-white border-black hover:brightness-110";
    default:
      return "bg-surface text-ink border-black";
  }
}

function getChangeNotes(amount: number): number[] {
  const notes: number[] = [];
  let rem = amount;
  const denoms = [500, 200, 100, 50, 20, 10];
  for (const d of denoms) {
    while (rem >= d) {
      notes.push(d);
      rem -= d;
    }
  }
  return notes;
}

function generateChangeChoices(correctChange: number): number[] {
  if (correctChange <= 0) return [10, 20, 30, 40];

  const set = new Set<number>();
  set.add(correctChange);

  const offsets = [-10, 10, -20, 20, -30, 30, 40];
  for (const off of offsets) {
    const val = correctChange + off;
    if (val > 0) {
      set.add(val);
    }
    if (set.size >= 4) break;
  }

  let fallback = 10;
  while (set.size < 4) {
    set.add(fallback);
    fallback += 10;
  }

  return Array.from(set).slice(0, 4).sort((a, b) => a - b);
}

function generateTargetIds(count = 4): string[] {
  while (true) {
    const shuffled = [...BAZAAR_PRODUCTS].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);
    const sum = selected.reduce((s, p) => s + p.price, 0);
    // Ensure sum is not 200 or 500 so change is always strictly > 0
    if (sum !== 200 && sum !== 500) {
      return selected.map((p) => p.id);
    }
  }
}

export function BazaarBuddiesGame() {
  const locale = useLocale();
  const normLocale = (locale?.split("-")[0]?.toLowerCase() || "en") as SupportedLocale;
  const t = BAZAAR_I18N[normLocale] || BAZAAR_I18N.en;

  const { detail, loading, error, reload, patientId } = usePatientDetail();
  const level = resolveAdaptiveLevel(patientId, "bazaarBuddies", startLevel(detail));
  const rate = speechRate(detail);

  // Core Game State
  const [phase, setPhase] = useState<"market" | "cashier" | "done">("market");
  const [targetIds, setTargetIds] = useState<string[]>(() => generateTargetIds(4));
  const [basket, setBasket] = useState<string[]>([]);

  // Cashier State
  const [givenNote, setGivenNote] = useState<number | null>(null);
  const [changeCalculated, setChangeCalculated] = useState(false);
  const [wrongAttempt, setWrongAttempt] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Telemetry
  const [startedAt, setStartedAt] = useState<string>(() => new Date().toISOString());
  const [taps, setTaps] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  // Target products lookup (4 items)
  const targetProducts = useMemo(() => {
    return targetIds
      .map((id) => BAZAAR_PRODUCTS.find((p) => p.id === id))
      .filter((p): p is BazaarProduct => Boolean(p));
  }, [targetIds]);

  // Basket total
  const total = useMemo(() => {
    return basket.reduce((sum, id) => {
      const p = BAZAAR_PRODUCTS.find((item) => item.id === id);
      return sum + (p?.price ?? 0);
    }, 0);
  }, [basket]);

  // Check if all 4 requested items are in basket
  const allTargetsInBasket = useMemo(() => {
    return targetIds.length > 0 && targetIds.every((id) => basket.includes(id));
  }, [targetIds, basket]);

  // Expected change
  const expectedChange = useMemo(() => {
    if (!givenNote) return 0;
    return Math.max(0, givenNote - total);
  }, [givenNote, total]);

  // 4 choices for change
  const changeChoices = useMemo(() => {
    return generateChangeChoices(expectedChange);
  }, [expectedChange]);

  // Rupee notes in wallet
  const walletNotes = useMemo(() => {
    return [50, 100, 200, 500];
  }, []);

  const score = basket.length * 20 + (changeCalculated ? 60 : 0);

  const scaffold = useErrorlessScaffold({
    stepKey: `${phase}-${givenNote ?? "none"}-${basket.length}`,
    hesitationThresholdSec: 8,
    caregiverCoPlayHint:
      phase === "market"
        ? "Ask Baba: 'Which fresh item from our village haat should we put in our basket next?'"
        : givenNote === null
        ? `Ask Baba: 'Which note is enough to pay our ₹${total} bill together?'`
        : `Ask Baba: 'If we pay ₹${givenNote} for ₹${total}, how much change should the shopkeeper give back?'`,
    onAutoSpokenHint: () => {
      if (phase === "cashier" && givenNote !== null && !changeCalculated) {
        speak(`Take your time. How much change from ₹${givenNote} for a ₹${total} bill?`, locale, rate);
      }
    },
  });

  // Announce shopping request on game start
  useEffect(() => {
    if (targetProducts.length > 0 && phase === "market" && basket.length === 0) {
      const names = targetProducts
        .map((p) => getShortName(p, normLocale))
        .join(", ");
      speak(`Please buy: ${names}.`, locale, rate);
    }
  }, [targetProducts, phase, basket.length, normLocale, locale, rate]);

  // Toggle item in basket
  const handleProduceClick = useCallback(
    (product: BazaarProduct) => {
      playPress();
      setTaps((t) => t + 1);
      setFeedbackMsg(null);

      const isTarget = targetIds.includes(product.id);
      const name = getShortName(product, normLocale);

      if (!isTarget) {
        playEncourage();
        setErrorCount((e) => e + 1);
        scaffold.recordAttempt(false);
        const missing = targetProducts.filter((p) => !basket.includes(p.id));
        const missingNames = missing
          .map((p) => getShortName(p, normLocale))
          .join(", ");
        setFeedbackMsg(`Not on list. Need: ${missingNames}`);
        speak(`Not on list. Need ${missingNames}`, locale, rate);
        return;
      }

      if (basket.includes(product.id)) {
        setBasket((prev) => prev.filter((x) => x !== product.id));
        speak(`Removed ${name}`, locale, rate);
      } else {
        scaffold.recordAttempt(true);
        setBasket((prev) => [...prev, product.id]);
        playCorrect();
        speak(`Picked ${name}`, locale, rate);
      }
    },
    [targetIds, targetProducts, basket, normLocale, locale, rate, scaffold]
  );

  const handleRemoveFromBasket = useCallback(
    (id: string) => {
      playPress();
      setTaps((t) => t + 1);
      setBasket((prev) => prev.filter((x) => x !== id));
      const p = BAZAAR_PRODUCTS.find((item) => item.id === id);
      if (p) {
        speak(`Removed ${getShortName(p, normLocale)}`, locale, rate);
      }
    },
    [normLocale, locale, rate]
  );

  const handleProceedToCashier = useCallback(() => {
    if (!allTargetsInBasket) return;
    playPress();
    setPhase("cashier");
    setGivenNote(null);
    setChangeCalculated(false);
    setWrongAttempt(null);
    setShowHint(false);
    setFeedbackMsg(null);
    speak(`Total is ₹${total}. Pay with a note.`, locale, rate);
  }, [allTargetsInBasket, total, locale, rate]);

  const handleSelectPaymentNote = useCallback(
    (note: number) => {
      playPress();
      setTaps((t) => t + 1);

      if (note <= total) {
        playEncourage();
        setErrorCount((e) => e + 1);
        const minCover = walletNotes.find((n) => n > total) || 500;
        setFeedbackMsg(`₹${note} is too small. Pay with ₹${minCover} or higher.`);
        speak(`₹${note} is too small. Pay with ₹${minCover}.`, locale, rate);
        return;
      }

      setGivenNote(note);
      setChangeCalculated(false);
      setWrongAttempt(null);
      setShowHint(false);
      setFeedbackMsg(null);
      speak(`Paid ₹${note} for ₹${total}. How much change?`, locale, rate);
    },
    [total, walletNotes, locale, rate]
  );

  const handleSelectChangeChoice = useCallback(
    (choice: number) => {
      playPress();
      setTaps((t) => t + 1);

      if (choice === expectedChange) {
        playCorrect();
        playComplete();
        scaffold.recordAttempt(true);
        setChangeCalculated(true);
        setWrongAttempt(null);
        setFeedbackMsg(null);
        speak(`Correct! ₹${expectedChange} change.`, locale, rate);
      } else {
        playEncourage();
        scaffold.recordAttempt(false);
        setWrongAttempt(choice);
        setErrorCount((e) => e + 1);
        setFeedbackMsg(`Try again: ₹${givenNote} − ₹${total}`);
        speak(`What is ₹${givenNote} minus ₹${total}?`, locale, rate);
      }
    },
    [expectedChange, givenNote, total, locale, rate, scaffold]
  );

  const handleFinishShopping = useCallback(() => {
    playPress();
    playComplete();
    setPhase("done");

    recordGameSession(patientId, {
      gameId: "bazaarBuddies",
      level,
      outcome: "completed",
      score: 100,
      startedAt,
      taps: taps + 1,
      errorCount,
    });
  }, [patientId, level, startedAt, taps, errorCount]);

  const restartGame = useCallback(() => {
    playPress();
    setPhase("market");
    setTargetIds(generateTargetIds(4));
    setBasket([]);
    setGivenNote(null);
    setChangeCalculated(false);
    setWrongAttempt(null);
    setShowHint(false);
    setFeedbackMsg(null);
    setStartedAt(new Date().toISOString());
    setTaps(0);
    setErrorCount(0);
  }, []);

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "bazaarBuddies",
    level,
    startedAt,
    taps,
    errorCount,
  });

  if (loading) {
    return (
      <section className="pb-12 min-h-screen bg-canvas">
        <GameHeader
          title={t.title}
          score={0}
          backHref="/patient/games"
          bgColor="bg-tea"
          gameId="bazaar-buddies"
        />
        <div className="mx-auto max-w-3xl px-4 pt-8">
          <GameLoading />
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pb-12 min-h-screen bg-canvas">
        <GameHeader
          title={t.title}
          score={0}
          backHref="/patient/games"
          bgColor="bg-tea"
          gameId="bazaar-buddies"
        />
        <div className="mx-auto max-w-3xl px-4 pt-8">
          <GameError onRetry={reload} />
        </div>
      </section>
    );
  }

  return (
    <section className="pb-16 min-h-screen bg-canvas">
      {/* Header */}
      <GameHeader
        title={t.title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-tea"
        gameId="bazaar-buddies"
      />

      <div className="mx-auto max-w-3xl px-3 sm:px-4 pt-3">
        {/* ─── STEP 1: MARKET ─── */}
        {phase === "market" && (
          <div className="flex flex-col gap-2.5">
            {/* Simple Compact Shopping List */}
            <div className="rounded-2xl border-3 border-black bg-[#FFF9E6] p-3 shadow-[3px_3px_0px_#000]">
              <div className="flex items-center justify-between mb-2">
                <span className="font-black text-ink text-sm sm:text-base flex items-center gap-1.5">
                  <span>📋</span>
                  <span>Shopping List</span>
                </span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${
                    allTargetsInBasket
                      ? "bg-emerald-100 border-emerald-800 text-emerald-950"
                      : "bg-white border-black/20 text-ink-secondary"
                  }`}
                >
                  {allTargetsInBasket
                    ? "✓ All 4 Found"
                    : `${targetIds.filter((id) => basket.includes(id)).length} of 4 found`}
                </span>
              </div>

              {/* 4 Items in 2x2 / 4-col Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {targetProducts.map((p) => {
                  const isCollected = basket.includes(p.id);
                  const name = getShortName(p, normLocale);
                  const emoji = getProduceEmoji(p.id);

                  return (
                    <div
                      key={p.id}
                      className={`flex items-center justify-between rounded-xl border-2 px-2 py-1.5 transition-all ${
                        isCollected
                          ? "border-emerald-700 bg-emerald-100 text-emerald-950 font-black shadow-xs"
                          : "border-black/20 bg-white text-ink font-bold"
                      }`}
                    >
                      <span className="truncate flex items-center gap-1 text-xs sm:text-sm">
                        <span>{emoji}</span>
                        <span className="truncate">{name}</span>
                      </span>
                      <span className="text-xs font-black ml-1 text-tea">
                        {isCollected ? "✓" : `₹${p.price}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Small & Simple Basket */}
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-2.5 shadow-[3px_3px_0px_#000] flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-ink text-xs sm:text-sm">
                  <span>🧺</span>
                  <span>Basket</span>
                  <span className="text-xs font-bold text-ink-secondary">
                    ({basket.length}/4)
                  </span>
                </div>

                <div className="rounded-xl border-2 border-emerald-900/30 bg-emerald-100 px-2.5 py-0.5 text-emerald-950 font-black text-sm shadow-xs">
                  ₹{total}
                </div>
              </div>

              {/* Basket Items Visual Slot */}
              <div className="min-h-[40px] rounded-xl border-2 border-dashed border-amber-900/30 bg-white/80 p-1 flex items-center gap-1.5 overflow-x-auto">
                {basket.length === 0 ? (
                  <span className="text-xs font-semibold text-ink-secondary/70 italic px-2">
                    Basket is empty
                  </span>
                ) : (
                  basket.map((id) => {
                    const product = BAZAAR_PRODUCTS.find((p) => p.id === id);
                    if (!product) return null;
                    const emoji = getProduceEmoji(id);
                    const name = getShortName(product, normLocale);

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleRemoveFromBasket(id)}
                        className="btn-tactile inline-flex items-center gap-1 rounded-lg border-2 border-black bg-amber-50 hover:bg-rose-50 px-2 py-0.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] shrink-0 cursor-pointer animate-in zoom-in-75"
                        title="Tap to remove"
                      >
                        <span>{emoji}</span>
                        <span className="truncate max-w-[80px]">{name}</span>
                        <span className="text-tea font-bold">₹{product.price}</span>
                        <span className="text-rose-600 font-bold ml-0.5">×</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Feedback Alert */}
            {feedbackMsg && (
              <div className="rounded-xl border-2 border-amber-500 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-950 text-center animate-fade-in">
                {feedbackMsg}
              </div>
            )}

            {/* Produce Grid - Clean, Large & Simple (NO DESCRIPTIONS, NO EXTRA TEXT) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {BAZAAR_PRODUCTS.map((product) => {
                const inBasket = basket.includes(product.id);
                const isTarget = targetIds.includes(product.id);
                const name = getShortName(product, normLocale);
                const emoji = getProduceEmoji(product.id);
                const isScaffolded = scaffold.isGuiding && isTarget && !inBasket;

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleProduceClick(product)}
                    className={`btn-tactile flex flex-col items-center justify-center rounded-2xl border-3 p-3 text-center transition-all cursor-pointer relative min-h-[110px] ${
                      inBasket
                        ? "bg-emerald-100 border-emerald-950 shadow-[3px_3px_0px_#047857] ring-2 ring-emerald-600"
                        : isScaffolded
                        ? "bg-amber-100 border-amber-600 shadow-[3px_3px_0px_#D97706] ring-4 ring-amber-400/80 animate-pulse"
                        : isTarget
                        ? "bg-[#FFFDF5] border-amber-600 shadow-[3px_3px_0px_#D97706] hover:bg-amber-50"
                        : scaffold.shouldDimOthers
                        ? "bg-white/60 border-black/20 opacity-50 shadow-xs"
                        : "bg-white border-black/30 shadow-[2px_2px_0px_#000] opacity-80 hover:opacity-100"
                    }`}
                  >
                    {isTarget && !inBasket && (
                      <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-amber-400 border border-black text-[10px] font-black text-black shadow-xs">
                        Needed
                      </span>
                    )}

                    {inBasket && (
                      <span className="absolute -top-2.5 px-2 py-0.5 rounded-full bg-emerald-600 border border-black text-[10px] font-black text-white shadow-xs">
                        ✓ In Basket
                      </span>
                    )}

                    <span className="text-3xl sm:text-4xl my-1 select-none">{emoji}</span>
                    <span className="text-xs sm:text-sm font-black text-ink leading-tight line-clamp-1">
                      {name}
                    </span>
                    <span className="text-xs sm:text-sm font-black text-tea mt-0.5">
                      ₹{product.price}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Pay Button */}
            <div className="pt-1">
              <ChunkyButton
                variant="tea"
                size="xl"
                disabled={!allTargetsInBasket}
                onClick={handleProceedToCashier}
                className="w-full justify-center"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>
                    {allTargetsInBasket
                      ? `Pay ₹${total}`
                      : `Pick 4 items (${targetIds.filter((id) => basket.includes(id)).length}/4)`}
                  </span>
                  <ArrowRight className="h-5 w-5 stroke-[2.5]" />
                </span>
              </ChunkyButton>
            </div>

            {/* Caregiver Co-Play Guidance */}
            {scaffold.caregiverTip && (
              <CaregiverCoPlayPrompt tip={scaffold.caregiverTip} className="mt-1" />
            )}
          </div>
        )}

        {/* ─── STEP 2: CASHIER ─── */}
        {phase === "cashier" && (
          <div className="flex flex-col gap-3.5">
            {/* Bill Summary */}
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-3.5 shadow-[3px_3px_0px_#000]">
              <div className="flex items-center justify-between">
                <div>
                  <span className="block text-xs font-black uppercase text-ink-secondary">
                    Total Bill
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-tea">
                    ₹{total}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 items-center justify-end max-w-[200px]">
                  {targetProducts.map((p) => (
                    <span
                      key={p.id}
                      className="inline-flex items-center gap-0.5 rounded-md border border-black/20 bg-white px-1.5 py-0.5 text-xs font-bold text-ink"
                    >
                      <span>{getProduceEmoji(p.id)}</span>
                      <span>₹{p.price}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Counter Tray */}
            <div className="rounded-2xl border-3 border-amber-900/40 bg-[#EFE5D5] p-3.5 shadow-[3px_3px_0px_#000]">
              <div className="flex items-center justify-between pb-1.5 border-b border-amber-900/20 mb-2.5 text-xs font-black uppercase text-amber-950">
                <span>Counter Tray</span>
                {givenNote !== null && !changeCalculated && (
                  <button
                    type="button"
                    onClick={() => {
                      playPress();
                      setGivenNote(null);
                      setWrongAttempt(null);
                      setFeedbackMsg(null);
                    }}
                    className="text-xs font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer"
                  >
                    ↺ Change Note
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Note Given Box */}
                <div className="rounded-xl border-2 border-dashed border-amber-900/30 bg-white/70 p-2.5 flex flex-col items-center justify-center min-h-[90px] text-center">
                  <span className="text-[10px] font-black uppercase text-ink-secondary mb-1">
                    Note Paid
                  </span>
                  {givenNote === null ? (
                    <p className="text-xs font-semibold text-ink-secondary/70 italic">
                      Tap a note below
                    </p>
                  ) : (
                    <div
                      className={`btn-tactile rounded-xl border-2 px-4 py-2 text-center shadow-[2px_2px_0px_#000] animate-in zoom-in-75 ${noteStyle(
                        givenNote
                      )}`}
                    >
                      <span className="text-xl font-black">₹{givenNote}</span>
                    </div>
                  )}
                </div>

                {/* Change Box */}
                <div className="rounded-xl border-2 border-dashed border-amber-900/30 bg-white/70 p-2.5 flex flex-col items-center justify-center min-h-[90px] text-center">
                  <span className="text-[10px] font-black uppercase text-ink-secondary mb-1">
                    Change
                  </span>
                  {!changeCalculated ? (
                    <span className="text-xl font-black text-ink-secondary">❓</span>
                  ) : (
                    <div className="flex flex-col items-center gap-1 animate-in zoom-in-75">
                      <div className="flex flex-wrap items-center justify-center gap-1">
                        {getChangeNotes(expectedChange).map((note, idx) => (
                          <span
                            key={idx}
                            className={`rounded-md border border-black px-2 py-0.5 text-xs font-black shadow-xs ${noteStyle(
                              note
                            )}`}
                          >
                            ₹{note}
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-700">
                        ₹{expectedChange}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Give Note Section */}
            {givenNote === null && (
              <div className="rounded-2xl border-3 border-black bg-surface p-3.5 shadow-[3px_3px_0px_#000]">
                <div className="flex items-center gap-1.5 mb-2">
                  <Wallet className="h-4 w-4 text-amber-700" />
                  <span className="text-xs sm:text-sm font-black text-ink">
                    Tap a note to pay ₹{total}:
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 pt-1">
                  {walletNotes.map((note) => {
                    const isEnough = note > total;
                    return (
                      <button
                        key={note}
                        type="button"
                        onClick={() => handleSelectPaymentNote(note)}
                        className={`btn-tactile rounded-xl border-2 border-black py-3 px-1 text-center shadow-[2px_2px_0px_#000] cursor-pointer flex flex-col items-center justify-center ${noteStyle(
                          note
                        )} ${!isEnough ? "opacity-50 hover:opacity-70" : "hover:scale-105 active:scale-95"}`}
                      >
                        <span className="text-lg font-black">₹{note}</span>
                        <span className="text-[9px] font-bold opacity-80 mt-0.5">
                          {isEnough ? "Pay" : "Small"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {feedbackMsg && (
                  <div className="mt-2 rounded-lg border border-rose-500 bg-rose-50 p-1.5 text-center text-xs font-bold text-rose-900 animate-fade-in">
                    {feedbackMsg}
                  </div>
                )}
              </div>
            )}

            {/* Calculate Change Section */}
            {givenNote !== null && !changeCalculated && (
              <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] flex flex-col gap-2.5 text-center">
                <p className="text-sm sm:text-base font-black text-ink">
                  How much change should you get back?
                </p>
                <div className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-100 border border-amber-800/30 px-3 py-1 text-sm font-black text-amber-950 mx-auto">
                  <span>₹{givenNote}</span>
                  <span>−</span>
                  <span>₹{total}</span>
                  <span>=</span>
                  <span className="text-amber-700 underline">?</span>
                </div>

                {/* 4 Choices */}
                <div className="grid grid-cols-4 gap-2 pt-1">
                  {changeChoices.map((choice) => {
                    const isWrong = wrongAttempt === choice;
                    const isCorrectChoice = choice === expectedChange;
                    const isScaffolded = scaffold.isGuiding && isCorrectChoice;
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={() => handleSelectChangeChoice(choice)}
                        className={`btn-tactile rounded-xl border-2 py-3 text-center text-xl font-black shadow-[2px_2px_0px_#000] transition-all cursor-pointer ${
                          isWrong
                            ? "bg-rose-100 border-rose-600 text-rose-800 animate-shake"
                            : isScaffolded
                            ? "bg-amber-100 border-amber-600 text-amber-950 ring-4 ring-amber-400/80 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                            : scaffold.shouldDimOthers && !isCorrectChoice
                            ? "bg-white/60 border-black/30 text-ink/60"
                            : "bg-white border-black hover:bg-amber-100 text-ink active:scale-95"
                        }`}
                      >
                        ₹{choice}
                      </button>
                    );
                  })}
                </div>

                {/* Hint */}
                <div className="flex flex-col items-center pt-1 border-t border-black/10">
                  {showHint ? (
                    <div className="rounded-lg border border-amber-600 bg-amber-50 p-1.5 text-xs font-black text-amber-950 animate-fade-in w-full">
                      Hint: ₹{givenNote} − ₹{total} = ₹{expectedChange}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        playPress();
                        setShowHint(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-ink-secondary hover:text-ink cursor-pointer underline"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                      <span>Need a hint?</span>
                    </button>
                  )}

                  {feedbackMsg && (
                    <div className="mt-1.5 rounded-lg border border-rose-500 bg-rose-50 p-1.5 text-center text-xs font-bold text-rose-900 animate-fade-in w-full">
                      {feedbackMsg}
                    </div>
                  )}
                </div>

                {/* Caregiver Co-Play Guidance */}
                {scaffold.caregiverTip && (
                  <CaregiverCoPlayPrompt tip={scaffold.caregiverTip} className="mt-2 text-left" />
                )}
              </div>
            )}

            {/* Change Done */}
            {givenNote !== null && changeCalculated && (
              <div className="rounded-2xl border-3 border-emerald-700 bg-emerald-50 p-4 shadow-[3px_3px_0px_#047857] text-center space-y-2.5 animate-fade-in">
                <div className="flex items-center justify-center gap-1.5 text-emerald-900">
                  <CheckCircle2 className="h-5 w-5 text-emerald-700 stroke-[2.5]" />
                  <span className="text-sm sm:text-base font-black">
                    Change: ₹{expectedChange}
                  </span>
                </div>

                <ChunkyButton
                  variant="tea"
                  size="xl"
                  onClick={handleFinishShopping}
                  className="w-full justify-center"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>Finish Shopping</span>
                    <Check className="h-5 w-5 stroke-[2.5]" />
                  </span>
                </ChunkyButton>
              </div>
            )}

            {/* Back Button */}
            {!changeCalculated && (
              <div>
                <button
                  type="button"
                  onClick={() => {
                    playPress();
                    setPhase("market");
                  }}
                  className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-white px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-slate-100 cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Stall</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 3: CELEBRATION ─── */}
        {phase === "done" && (
          <Celebration
            title="Shopping Done!"
            subtitle={`You bought all 4 items and calculated ₹${expectedChange} change!`}
            xpEarned={120}
            accuracy="100%"
          >
            <div className="flex flex-col items-center gap-3 max-w-xs mx-auto text-center w-full pt-2">
              {/* Receipt */}
              <div className="w-full rounded-xl border-2 border-black/30 bg-[#FAF5EE] p-2.5 text-left space-y-1 shadow-inner text-xs font-bold text-ink">
                {targetProducts.map((p) => (
                  <div key={p.id} className="flex justify-between">
                    <span>
                      {getProduceEmoji(p.id)} {getShortName(p, normLocale)}
                    </span>
                    <span className="font-black text-tea">₹{p.price}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-black/10 pt-1 font-black">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex justify-between text-ink-secondary text-[11px]">
                  <span>Paid</span>
                  <span>₹{givenNote}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-800">
                  <span>Change</span>
                  <span>₹{expectedChange}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-2.5 w-full pt-1">
                <ChunkyButton variant="tea" size="xl" onClick={restartGame}>
                  <span className="flex items-center gap-1.5">
                    <RotateCcw className="h-4 w-4" /> Shop Again
                  </span>
                </ChunkyButton>
                <Link
                  href="/patient/games"
                  className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-4 py-2 text-xs sm:text-sm font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
                >
                  Back to Games
                </Link>
              </div>
            </div>
          </Celebration>
        )}
      </div>
    </section>
  );
}
