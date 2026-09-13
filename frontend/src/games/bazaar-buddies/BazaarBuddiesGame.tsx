"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  ShoppingBag,
  Wallet,
  Store,
  RotateCcw,
  Music,
  CheckCircle2,
  HelpCircle,
  Trash2,
  Check,
  Sparkles,
  Volume2,
  ArrowRight,
  Plus,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import {
  playPress,
  playCorrect,
  playComplete,
  playEncourage,
  playLifeSong,
  playTapFeedback,
} from "@/lib/sound";
import { speak } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import type { SupportedLocale } from "@/lib/gameI18n";
import {
  calculateVanishingCue,
  validateMoveErrorless,
  type ScaffoldingIntensity,
} from "@/lib/errorlessLearning";

import {
  BAZAAR_PRODUCTS,
  BAZAAR_I18N,
  type BazaarProduct,
} from "./bazaarI18n";

const PAYMENT_NOTES = [10, 20, 50, 100, 200, 500];
const BUDGET = 500;

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

function noteStyle(note: number) {
  switch (note) {
    case 10:
      return "bg-[#795548] text-white border-black hover:brightness-110";
    case 20:
      return "bg-[#CDDC39] text-black border-black hover:brightness-95";
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

export function BazaarBuddiesGame() {
  const locale = useLocale();
  const normLocale = (locale?.split("-")[0]?.toLowerCase() || "en") as SupportedLocale;
  const t = BAZAAR_I18N[normLocale] || BAZAAR_I18N.en;

  const { detail, loading, error, reload, patientId } = usePatientDetail();
  const level = resolveAdaptiveLevel(patientId, "bazaarBuddies", startLevel(detail));
  const rate = speechRate(detail);

  // Game Phases
  const [phase, setPhase] = useState<"family" | "market" | "cashier" | "change" | "done">("family");

  // Shopping & Basket State
  const [basket, setBasket] = useState<string[]>([]);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  // Currency & Math State
  const [paymentNotes, setPaymentNotes] = useState<number[]>([]);
  const [changeGiven, setChangeGiven] = useState<number | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [changeHesitation, setChangeHesitation] = useState(0);
  const [changeAttempts, setChangeAttempts] = useState(0);
  const [softBounceFeedback, setSoftBounceFeedback] = useState<string | null>(null);

  // Telemetry
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [taps, setTaps] = useState(0);
  const [errors, setErrors] = useState(0);

  // Monitor hesitation during change calculation for Errorless Learning
  useEffect(() => {
    if (phase !== "change" || changeGiven !== null) return;
    const timer = setInterval(() => {
      setChangeHesitation((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, changeGiven]);

  const vanishingCue = useMemo(() => {
    if (phase !== "change") {
      return { intensity: "none" as ScaffoldingIntensity, glowOpacity: 0 };
    }
    return calculateVanishingCue(changeHesitation, changeAttempts);
  }, [phase, changeHesitation, changeAttempts]);

  // Calculations
  const total = useMemo(() => {
    return basket.reduce((sum, id) => {
      const p = BAZAAR_PRODUCTS.find((item) => item.id === id);
      return sum + (p?.price ?? 0);
    }, 0);
  }, [basket]);

  const paidAmount = useMemo(() => {
    return paymentNotes.reduce((sum, n) => sum + n, 0);
  }, [paymentNotes]);

  const correctChange = Math.max(0, paidAmount - total);
  const remainingBudget = BUDGET - total;
  const score = basket.length * 15 + (phase === "done" ? 100 : 0);

  // Add / Remove from Basket
  const handleToggleItem = useCallback(
    (id: string) => {
      playPress();
      setTaps((t) => t + 1);

      const product = BAZAAR_PRODUCTS.find((p) => p.id === id);
      if (!product) return;

      const pName = product.name[normLocale] || product.name.en;

      if (basket.includes(id)) {
        setBasket((prev) => prev.filter((x) => x !== id));
        speak(t.itemRemovedVoice(pName), locale, rate);
      } else {
        if (total + product.price > BUDGET) {
          playEncourage();
          return;
        }
        setBasket((prev) => [...prev, id]);
        speak(t.itemAddedVoice(pName, product.price), locale, rate);
      }
    },
    [basket, total, normLocale, locale, rate, t]
  );

  const addNote = useCallback((note: number) => {
    playPress();
    setTaps((t) => t + 1);
    setPaymentNotes((prev) => [...prev, note]);
  }, []);

  const clearNotes = useCallback(() => {
    playPress();
    setPaymentNotes([]);
  }, []);

  const suggestExactNotes = useCallback(() => {
    playPress();
    let rem = total;
    const notes: number[] = [];
    const denoms = [500, 200, 100, 50, 20, 10];

    for (const d of denoms) {
      while (rem >= d) {
        notes.push(d);
        rem -= d;
      }
    }
    if (rem > 0) {
      const cover = [...denoms].reverse().find((d) => d >= rem) || 10;
      notes.push(cover);
    }
    setPaymentNotes(notes);
    playCorrect();
    const sum = notes.reduce((a, b) => a + b, 0);
    speak(`Selected ₹${sum} notes for cashier.`, locale, rate);
  }, [total, locale, rate]);

  const submitCashierPayment = useCallback(() => {
    if (paidAmount < total) {
      playEncourage();
      speak(t.needMoreNotes(total), locale, rate);
      return;
    }
    playCorrect();

    if (paidAmount === total) {
      setChangeGiven(0);
      setPhase("done");
      playComplete();
      if (startedAt) {
        recordGameSession(patientId, {
          gameId: "bazaarBuddies",
          level,
          outcome: "completed",
          score: 100,
          startedAt,
          taps: taps + 1,
          errorCount: errors,
        });
      }
    } else {
      setPhase("change");
      setChangeHesitation(0);
      setChangeAttempts(0);
      setSoftBounceFeedback(null);
      speak(t.changePromptAudio(paidAmount, total, correctChange), locale, rate);
    }
  }, [paidAmount, total, correctChange, startedAt, patientId, level, taps, errors, locale, rate, t]);

  const submitChange = useCallback(
    (value: number) => {
      setTaps((t) => t + 1);
      const validation = validateMoveErrorless(value, correctChange);

      if (validation.isCorrect) {
        setChangeGiven(value);
        setSoftBounceFeedback(null);
        playCorrect();
        speak(t.changeCorrect(value), locale, rate);
        setTimeout(() => {
          setPhase("done");
          playComplete();
          if (startedAt) {
            recordGameSession(patientId, {
              gameId: "bazaarBuddies",
              level,
              outcome: "completed",
              score: 100,
              startedAt,
              taps: taps + 1,
              errorCount: errors,
            });
          }
        }, 1200);
      } else {
        setErrors((e) => e + 1);
        setChangeAttempts((a) => a + 1);
        playEncourage();
        const hint = t.errorlessHintMsg(correctChange);
        setSoftBounceFeedback(hint);
        speak(hint, locale, rate);
      }
    },
    [correctChange, startedAt, patientId, level, taps, errors, locale, rate, t]
  );

  const showHint = useCallback(() => {
    playPress();
    setHintUsed(true);
    speak(t.errorlessHintMsg(correctChange), locale, rate);
  }, [correctChange, locale, rate, t]);

  const restartGame = useCallback(() => {
    playPress();
    setPhase("family");
    setBasket([]);
    setPaymentNotes([]);
    setChangeGiven(null);
    setHintUsed(false);
    setStartedAt(null);
    setTaps(0);
    setErrors(0);
    setChangeHesitation(0);
    setChangeAttempts(0);
    setSoftBounceFeedback(null);
  }, []);

  const startMarketPhase = useCallback(() => {
    playPress();
    setPhase("market");
    setStartedAt(new Date().toISOString());
  }, []);

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "bazaarBuddies",
    level,
    startedAt,
    taps,
    errorCount: errors,
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
    <section className="pb-20 min-h-screen bg-canvas">
      {/* Main Game Header */}
      <GameHeader
        title={t.title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-tea"
        gameId="bazaar-buddies"
      />

      {/* Unified Top Dashboard Bar (Market Title + Financial State) - Only shown during active market phases */}
      {(phase === "market" || phase === "cashier" || phase === "change") && (
        <div className="mx-auto max-w-4xl px-4 pt-3">
          <div className="w-full flex items-center justify-between gap-3 rounded-2xl border-3 border-black bg-surface px-4 py-2.5 shadow-[3px_3px_0px_#000]">
            {/* Village Stall Title */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-ink">
              <Store className="h-4 w-4 text-tea shrink-0" />
              <span className="truncate">{t.stallHeading}</span>
            </div>

            {/* Running Financial State */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-black shrink-0">
              <div className="flex items-center gap-1.5 rounded-xl border border-black/20 bg-amber-50 px-3 py-1 text-ink">
                <Wallet className="h-4 w-4 text-amber-800" />
                <span>
                  {t.remainingLabel}: <strong className="text-amber-900 font-black">₹{remainingBudget}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5 rounded-xl border border-emerald-900/30 bg-emerald-50 px-3 py-1 text-emerald-950">
                <ShoppingBag className="h-4 w-4 text-emerald-700" />
                <span>
                  {t.totalLabel}: <strong className="text-emerald-800 font-black text-sm">₹{total}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 pt-4">
        {/* ─── PHASE 1: FAMILY PROMPT & AUTOBIOGRAPHICAL MEMORY ANCHOR ─── */}
        {phase === "family" && (
          <div className="flex flex-col items-center justify-center py-4 sm:py-6 px-2">
            <div className="w-full max-w-lg rounded-3xl border-3 border-black bg-[#FAF5EE] p-5 sm:p-6 shadow-[5px_5px_0px_#000] flex flex-col gap-4">
              {/* Header: Store Icon + Title & Subtitle + Budget Pill */}
              <div className="flex items-start justify-between gap-3 border-b-2 border-black/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black bg-tea text-white shadow-[2px_2px_0px_#000] shrink-0">
                    <Store className="h-6 w-6 stroke-[2.5]" />
                  </div>
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl font-black text-ink leading-tight">
                      {t.familyPromptTitle}
                    </h2>
                    <p className="text-xs font-semibold text-ink-secondary mt-0.5">
                      {t.subtitle}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 rounded-xl border-2 border-emerald-900/30 bg-emerald-100 px-3 py-1 text-right">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    {t.budgetLabel}
                  </span>
                  <span className="text-sm sm:text-base font-black text-emerald-950">
                    ₹{BUDGET}
                  </span>
                </div>
              </div>

              {/* Loving Family Request Message */}
              <div className="rounded-2xl border-2 border-amber-900/15 bg-amber-50/70 p-4">
                <blockquote className="font-serif text-base sm:text-lg font-bold text-ink italic leading-relaxed">
                  {t.familyMessage}
                </blockquote>
              </div>

              {/* Actions: Listen Audio & Enter Market Button */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <div className="sm:w-auto">
                  <AudioPrompt
                    text={t.familyAudioText}
                    label="Listen"
                    size="md"
                  />
                </div>
                <div className="flex-1">
                  <ChunkyButton
                    variant="tea"
                    size="xl"
                    onClick={startMarketPhase}
                    className="w-full justify-center"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <span>{t.startMarketBtn}</span>
                      <ArrowRight className="h-5 w-5 stroke-[2.5]" />
                    </span>
                  </ChunkyButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── PHASE 2: 2D VILLAGE MARKET STALL & PRODUCE GATHERING ─── */}
        {phase === "market" && (
          <div className="flex flex-col items-center gap-4 py-1">
            {/* Market Stall Banner & Shelf */}
            <div className="w-full rounded-3xl border-3 border-black bg-[#FAF5EE] p-4 sm:p-5 shadow-[4px_4px_0px_#000]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black/15 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-tea text-white shadow-[2px_2px_0px_#000] shrink-0">
                    <Store className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-ink leading-tight">
                      {t.stallHeading}
                    </h3>
                    <p className="text-xs font-semibold text-ink-secondary">
                      Tap fresh produce to place it into your cane basket (খৰাহী)
                    </p>
                  </div>
                </div>

                <div className="self-start sm:self-center text-xs font-black rounded-xl border-2 border-amber-900/30 bg-amber-100 px-3 py-1.5 text-amber-950 shadow-xs">
                  {basket.length > 0 ? (
                    <span>{t.itemsSelectedCount(basket.length)} • ₹{total}</span>
                  ) : (
                    <span>Basket Empty</span>
                  )}
                </div>
              </div>

              {/* 8 Fresh North-Eastern Regional Produce Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {BAZAAR_PRODUCTS.map((product) => {
                  const inBasket = basket.includes(product.id);
                  const wouldExceed = total + product.price > BUDGET;
                  const name = product.name[normLocale] || product.name.en;
                  const desc = product.categoryDesc[normLocale] || product.categoryDesc.en;
                  const emoji = getProduceEmoji(product.id);

                  return (
                    <button
                      key={product.id}
                      type="button"
                      disabled={!inBasket && wouldExceed}
                      onClick={() => handleToggleItem(product.id)}
                      className={`btn-tactile flex flex-col justify-between rounded-2xl border-3 border-black p-3 text-left shadow-[3px_3px_0px_#000] transition-all cursor-pointer disabled:opacity-40 min-h-[120px] ${
                        inBasket
                          ? "bg-emerald-100 border-emerald-950 ring-3 ring-emerald-600 shadow-[4px_4px_0px_#047857]"
                          : "bg-white hover:bg-amber-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 w-full">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-black/20 bg-amber-50 text-2xl select-none">
                          {emoji}
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded-xl border-2 text-xs sm:text-sm font-black shadow-xs ${
                            inBasket
                              ? "bg-emerald-700 text-white border-emerald-950"
                              : "bg-[#FAF5EE] text-tea border-black/20"
                          }`}
                        >
                          ₹{product.price}
                        </span>
                      </div>

                      <div className="mt-2 w-full">
                        <p className="text-xs sm:text-sm font-black text-ink leading-snug line-clamp-1">
                          {name}
                        </p>
                        <p className="text-[11px] font-semibold text-ink-secondary mt-0.5 line-clamp-1">
                          {desc}
                        </p>
                        <div className="mt-2 pt-1.5 border-t border-black/10 flex items-center justify-between text-[11px] font-black">
                          {inBasket ? (
                            <span className="text-emerald-800 flex items-center gap-1">
                              <Check className="h-3.5 w-3.5 stroke-[3]" /> In Basket
                            </span>
                          ) : (
                            <span className="text-tea flex items-center gap-0.5">
                              <Plus className="h-3 w-3 stroke-[3]" /> Add to basket
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cane Basket (খৰাহী) & Direct Checkout Bar */}
            <div className="w-full rounded-3xl border-3 border-black bg-[#FAF5EE] p-4 sm:p-5 shadow-[4px_4px_0px_#000]">
              <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-3">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" /> {t.basketTitle}
                </span>
                <span className="text-sm sm:text-base font-black text-tea">
                  ₹{total} ({t.itemsSelectedCount(basket.length)})
                </span>
              </div>

              {basket.length === 0 ? (
                <div className="text-center py-4 space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-ink-secondary">
                    {t.basketEmpty}
                  </p>
                  <p className="text-xs font-semibold text-amber-800/80">
                    💡 Tip: Pratima suggested Kaji Nemu lemons & Joha rice!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {basket.map((id) => {
                      const product = BAZAAR_PRODUCTS.find((p) => p.id === id);
                      if (!product) return null;
                      const name = product.name[normLocale] || product.name.en;
                      const emoji = getProduceEmoji(id);

                      return (
                        <div
                          key={id}
                          className="inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3 py-1.5 shadow-[2px_2px_0px_#000] text-xs sm:text-sm font-black text-ink"
                        >
                          <span>{emoji} {name}</span>
                          <span className="text-tea font-bold">₹{product.price}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleItem(id);
                            }}
                            className="text-rose-600 hover:text-rose-800 p-0.5 cursor-pointer ml-1"
                            title="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Prominent Checkout Action */}
                  <div className="pt-2 border-t border-black/10 flex justify-end">
                    <ChunkyButton
                      variant="tea"
                      size="xl"
                      onClick={() => {
                        playPress();
                        setPhase("cashier");
                        setPaymentNotes([]);
                        setChangeGiven(null);
                        speak(t.cashierAudioPrompt(total), locale, rate);
                      }}
                    >
                      {t.proceedCashierBtn}
                    </ChunkyButton>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── PHASE 3: CASHIER COUNTER & CURRENCY MATH ─── */}
        {phase === "cashier" && (
          <div className="flex flex-col items-center gap-4 py-1">
            {/* Shopkeeper Dialogue Banner */}
            <div className="w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[4px_4px_0px_#000]">
              <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-3">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                  <Store className="h-4 w-4" /> {t.stallHeading}
                </span>
                <span className="text-base sm:text-lg font-black text-tea">
                  {t.totalLabel}: ₹{total}
                </span>
              </div>

              <blockquote className="font-serif text-base sm:text-lg font-bold text-ink italic leading-relaxed">
                {t.cashierGreeting(total)}
              </blockquote>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-black/10 pt-2.5">
                {basket.map((id) => {
                  const product = BAZAAR_PRODUCTS.find((p) => p.id === id);
                  if (!product) return null;
                  const name = product.name[normLocale] || product.name.en;
                  const emoji = getProduceEmoji(id);
                  return (
                    <span
                      key={id}
                      className="rounded-lg border border-black/20 bg-white/80 px-2 py-0.5 text-xs font-bold text-ink"
                    >
                      {emoji} {name} • ₹{product.price}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Rupee Notes Laid on Counter */}
            <div className="w-full rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000]">
              <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-3">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-ink-secondary">
                  {t.counterNotesLabel}
                </span>
                <span className="text-sm sm:text-base font-black text-ink">
                  {t.amountPaid}:{" "}
                  <strong
                    className={`font-black ${
                      paidAmount >= total ? "text-emerald-700" : "text-amber-800"
                    }`}
                  >
                    ₹{paidAmount}
                  </strong>{" "}
                  / ₹{total}
                </span>
              </div>

              <div className="min-h-[64px] rounded-xl border-2 border-amber-800 bg-[#E8DCC9] p-3 shadow-inner flex flex-wrap items-center gap-2">
                {paymentNotes.length === 0 ? (
                  <p className="text-xs sm:text-sm font-bold text-amber-900/60 italic w-full text-center py-2">
                    Tap or air-point to rupee notes below to place them on the counter.
                  </p>
                ) : (
                  paymentNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className={`inline-flex items-center gap-1.5 rounded-xl border-2 border-black px-3 py-1.5 text-base font-black shadow-[2px_2px_0px_#000] animate-fade-in ${noteStyle(
                        note
                      )}`}
                    >
                      <span>₹{note}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Rupee Notes Wallet Picker */}
            <div className="w-full rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000]">
              <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-ink-secondary mb-3">
                {t.walletNotesLabel}
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {PAYMENT_NOTES.map((note) => (
                  <button
                    key={note}
                    type="button"
                    onClick={() => addNote(note)}
                    className={`btn-tactile rounded-2xl border-3 border-black py-3 px-2 text-lg font-black shadow-[3px_3px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer flex flex-col items-center justify-center ${noteStyle(
                      note
                    )}`}
                  >
                    <span>₹{note}</span>
                    <span className="text-[10px] font-bold opacity-80 mt-0.5">+ Add</span>
                  </button>
                ))}
              </div>

              {/* Cashier Helper Actions */}
              <div className="mt-4 flex flex-wrap gap-2.5 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={clearNotes}
                  className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3.5 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-slate-100 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>{t.clearNotesBtn}</span>
                </button>

                <button
                  type="button"
                  onClick={suggestExactNotes}
                  className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-amber-600 bg-amber-100 px-3.5 py-2 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000] hover:bg-amber-200 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-amber-700" />
                  <span>{t.autoSuggestBtn}</span>
                </button>
              </div>
            </div>

            {/* Pay Cashier Button */}
            <ChunkyButton
              variant="tea"
              size="xl"
              onClick={submitCashierPayment}
              disabled={paidAmount < total}
            >
              {t.payCashierBtn}
            </ChunkyButton>
          </div>
        )}

        {/* ─── PHASE 4: CHANGE VERIFICATION & ERRORLESS LEARNING ─── */}
        {phase === "change" && (
          <div className="flex flex-col items-center gap-4 py-1">
            {/* Calculation Equation Card */}
            <div className="w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[4px_4px_0px_#000]">
              <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-3">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> {t.changeSelectLabel}
                </span>
              </div>

              {/* Large Legible Visual Math Equation */}
              <div className="p-4 rounded-xl border-2 border-black/20 bg-white flex flex-col sm:flex-row items-center justify-around gap-2 text-center">
                <div>
                  <span className="block text-[11px] font-bold text-ink-secondary uppercase">
                    {t.amountPaid}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-ink">₹{paidAmount}</span>
                </div>
                <span className="text-2xl font-black text-ink-secondary">−</span>
                <div>
                  <span className="block text-[11px] font-bold text-ink-secondary uppercase">
                    {t.totalLabel}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-tea">₹{total}</span>
                </div>
                <span className="text-2xl font-black text-ink-secondary">=</span>
                <div className="rounded-xl border-2 border-dashed border-amber-600 bg-amber-50 px-4 py-1">
                  <span className="block text-[11px] font-bold text-amber-900 uppercase">
                    Change Due
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-amber-900">
                    {changeGiven !== null ? `₹${changeGiven}` : `₹?`}
                  </span>
                </div>
              </div>
            </div>

            {/* Note Picker for Change */}
            <div className="w-full rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000]">
              <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-ink-secondary mb-3">
                {t.changeSelectLabel}
              </p>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {PAYMENT_NOTES.map((note) => {
                  const isTarget = note === correctChange;
                  const isHinted =
                    isTarget &&
                    (hintUsed ||
                      changeAttempts > 0 ||
                      vanishingCue.intensity !== "none");

                  const cueRing =
                    isTarget && isHinted
                      ? "ring-4 ring-amber-400 animate-pulse scale-105 border-amber-600 shadow-[0_0_18px_rgba(245,158,11,0.85)]"
                      : "";

                  return (
                    <button
                      key={note}
                      type="button"
                      onClick={() => submitChange(note)}
                      disabled={changeGiven !== null && changeGiven === correctChange}
                      className={`btn-tactile rounded-2xl border-3 border-black py-3.5 px-2 text-lg font-black shadow-[3px_3px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer disabled:opacity-40 flex flex-col items-center justify-center ${noteStyle(
                        note
                      )} ${cueRing}`}
                    >
                      <span>₹{note}</span>
                    </button>
                  );
                })}
              </div>

              {softBounceFeedback && (
                <div className="mt-3 rounded-xl border-2 border-amber-500 bg-amber-50 p-3 text-center animate-fade-in">
                  <p className="text-xs sm:text-sm font-bold text-amber-950">
                    {softBounceFeedback}
                  </p>
                </div>
              )}
            </div>

            {!hintUsed && (
              <button
                type="button"
                onClick={showHint}
                className="btn-tactile flex items-center gap-2 rounded-xl border-2 border-black bg-amber-100 hover:bg-amber-200 px-4 py-2 text-xs sm:text-sm font-black text-amber-950 shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <HelpCircle className="h-4 w-4 text-amber-800" />
                <span>{t.needHintBtn}</span>
              </button>
            )}
          </div>
        )}

        {/* ─── PHASE 5: JOYFUL CELEBRATION & RECEIPT ─── */}
        {phase === "done" && (
          <Celebration
            title={t.celebrationTitle}
            subtitle={t.celebrationSubtitle}
            xpEarned={basket.length * 15 + 100}
            accuracy={`${Math.max(0, 100 - errors * 15)}%`}
          >
            <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
              <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
                <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4" /> {t.receiptTitle}
                  </span>
                  <span className="text-[10px] font-black uppercase rounded bg-tea text-white px-2 py-0.5">
                    PAID IN FULL
                  </span>
                </div>

                <p className="text-xs font-semibold text-ink-secondary mb-3">
                  {t.receiptSubtitle}
                </p>

                <div className="space-y-1.5 border-t border-black/10 pt-2 text-xs sm:text-sm font-black">
                  {basket.map((id) => {
                    const product = BAZAAR_PRODUCTS.find((p) => p.id === id);
                    if (!product) return null;
                    const name = product.name[normLocale] || product.name.en;
                    const emoji = getProduceEmoji(id);
                    return (
                      <div key={id} className="flex items-center justify-between">
                        <span>{emoji} {name}</span>
                        <span className="text-tea">₹{product.price}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 border-t-2 border-black/15 pt-2 text-xs sm:text-sm font-black space-y-1">
                  <div className="flex justify-between">
                    <span>{t.totalLabel}:</span>
                    <span className="text-tea">₹{total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{t.amountPaid}:</span>
                    <span>₹{paidAmount}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800">
                    <span>Change Returned:</span>
                    <span>₹{changeGiven ?? correctChange}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                  <button
                    type="button"
                    onClick={() => playLifeSong()}
                    className="btn-tactile flex items-center gap-2 rounded-xl border-2 border-black bg-amber-200 hover:bg-amber-300 px-3.5 py-1.5 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000] cursor-pointer"
                  >
                    <Music className="h-4 w-4" />
                    <span>{t.playMelodyBtn}</span>
                  </button>
                  <span className="text-xs font-bold text-ink-secondary">
                    {t.itemsSelectedCount(basket.length)}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                <ChunkyButton variant="tea" size="xl" onClick={restartGame}>
                  <span className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" /> {t.playAgainBtn}
                  </span>
                </ChunkyButton>
                <Link
                  href="/patient/games"
                  className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-surface px-5 py-3 text-xs sm:text-sm font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
                >
                  {t.backToHubBtn}
                </Link>
              </div>
            </div>
          </Celebration>
        )}
      </div>
    </section>
  );
}
