"use client";

import React, { useCallback, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  ShoppingBag,
  RotateCcw,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
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
import { BAZAAR_PRODUCTS, BAZAAR_I18N } from "./bazaarI18n";

const PAYMENT_NOTES = [10, 20, 50, 100, 200, 500];

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

  // Simple 3-phase flow: Market -> Pay -> Done
  const [phase, setPhase] = useState<"market" | "pay" | "done">("market");
  const [basket, setBasket] = useState<string[]>([]);
  const [paymentNotes, setPaymentNotes] = useState<number[]>([]);

  // Telemetry
  const [startedAt, setStartedAt] = useState<string>(() => new Date().toISOString());
  const [taps, setTaps] = useState(0);

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

  const change = Math.max(0, paidAmount - total);
  const score = basket.length * 20 + (phase === "done" ? 100 : 0);

  // Toggle item in basket
  const handleToggleItem = useCallback(
    (id: string) => {
      playPress();
      setTaps((t) => t + 1);

      const product = BAZAAR_PRODUCTS.find((p) => p.id === id);
      if (!product) return;

      const pName = product.name[normLocale] || product.name.en;

      if (basket.includes(id)) {
        setBasket((prev) => prev.filter((x) => x !== id));
      } else {
        setBasket((prev) => [...prev, id]);
        speak(pName, locale, rate);
      }
    },
    [basket, normLocale, locale, rate]
  );

  const addNote = useCallback(
    (note: number) => {
      playPress();
      setTaps((t) => t + 1);
      setPaymentNotes((prev) => [...prev, note]);
      speak(`₹${note}`, locale, rate);
    },
    [locale, rate]
  );

  const removeNote = useCallback(
    (indexToRemove: number) => {
      playPress();
      setTaps((t) => t + 1);
      setPaymentNotes((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    },
    []
  );

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
  }, [total]);

  const handleCompletePayment = useCallback(() => {
    if (paidAmount < total) {
      playEncourage();
      return;
    }
    playCorrect();
    playComplete();
    setPhase("done");

    recordGameSession(patientId, {
      gameId: "bazaarBuddies",
      level,
      outcome: "completed",
      score: 100,
      startedAt,
      taps: taps + 1,
      errorCount: 0,
    });
  }, [paidAmount, total, patientId, level, startedAt, taps]);

  const restartGame = useCallback(() => {
    playPress();
    setPhase("market");
    setBasket([]);
    setPaymentNotes([]);
    setStartedAt(new Date().toISOString());
    setTaps(0);
  }, []);

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "bazaarBuddies",
    level,
    startedAt,
    taps,
    errorCount: 0,
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

      <div className="mx-auto max-w-2xl px-4 pt-4">
        {/* ─── STEP 1: MARKET (PICK PRODUCE) ─── */}
        {phase === "market" && (
          <div className="flex flex-col gap-4">
            {/* Small & Simple Visual Cane Basket (খৰাহী / Basket) */}
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-3 shadow-[4px_4px_0px_#000] flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-ink text-sm sm:text-base">
                  <span className="text-xl select-none">🧺</span>
                  <span>My Basket</span>
                  <span className="text-xs font-bold text-ink-secondary">
                    ({basket.length} {basket.length === 1 ? "item" : "items"})
                  </span>
                </div>

                <div className="rounded-xl border-2 border-emerald-900/30 bg-emerald-100 px-3 py-0.5 text-emerald-950 font-black text-base shadow-xs">
                  ₹{total}
                </div>
              </div>

              {/* Basket Items Visual Slot: Produce chips appearing inside */}
              <div className="min-h-[46px] rounded-xl border-2 border-dashed border-amber-900/30 bg-white/70 p-1.5 flex items-center gap-1.5 overflow-x-auto">
                {basket.length === 0 ? (
                  <p className="text-xs font-semibold text-ink-secondary/70 italic px-2">
                    Your basket is empty. Tap any vegetable below to put it in!
                  </p>
                ) : (
                  basket.map((id) => {
                    const product = BAZAAR_PRODUCTS.find((p) => p.id === id);
                    if (!product) return null;
                    const emoji = getProduceEmoji(id);
                    const name = product.name[normLocale] || product.name.en;

                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => handleToggleItem(id)}
                        className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-50 hover:bg-rose-50 px-2.5 py-1 text-xs font-black text-ink shadow-[2px_2px_0px_#000] transition-all shrink-0 cursor-pointer animate-in zoom-in-75"
                        title="Tap to remove"
                      >
                        <span className="text-base select-none">{emoji}</span>
                        <span className="truncate max-w-[90px]">{name}</span>
                        <span className="text-tea font-bold">₹{product.price}</span>
                        <span className="text-rose-600 font-bold ml-0.5">×</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Produce Grid (8 Large, Beautiful Cards - NO Descriptions, NO Fuzz!) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {BAZAAR_PRODUCTS.map((product) => {
                const inBasket = basket.includes(product.id);
                const name = product.name[normLocale] || product.name.en;
                const emoji = getProduceEmoji(product.id);

                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => handleToggleItem(product.id)}
                    className={`btn-tactile flex flex-col items-center justify-between rounded-2xl border-3 border-black p-3 text-center shadow-[3px_3px_0px_#000] transition-all cursor-pointer min-h-[130px] ${
                      inBasket
                        ? "bg-emerald-100 border-emerald-950 ring-3 ring-emerald-600 shadow-[4px_4px_0px_#047857]"
                        : "bg-white hover:bg-amber-50"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black/20 bg-amber-50 text-3xl select-none">
                      {emoji}
                    </div>

                    <div className="my-1 w-full">
                      <p className="text-xs sm:text-sm font-black text-ink leading-tight line-clamp-1">
                        {name}
                      </p>
                      <p className="text-xs sm:text-sm font-black text-tea mt-0.5">
                        ₹{product.price}
                      </p>
                    </div>

                    <div className="w-full pt-1 border-t border-black/10">
                      {inBasket ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800">
                          <Check className="h-3.5 w-3.5 stroke-[3]" /> Picked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-ink-secondary">
                          <Plus className="h-3 w-3 stroke-[3]" /> Tap to pick
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pay Button */}
            <div className="pt-2">
              <ChunkyButton
                variant="tea"
                size="xl"
                disabled={basket.length === 0}
                onClick={() => {
                  playPress();
                  setPaymentNotes([]);
                  setPhase("pay");
                }}
                className="w-full justify-center"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>Pay ₹{total}</span>
                  <ArrowRight className="h-5 w-5 stroke-[2.5]" />
                </span>
              </ChunkyButton>
            </div>
          </div>
        )}

        {/* ─── STEP 2: PAY WITH RUPEE NOTES ─── */}
        {phase === "pay" && (
          <div className="flex flex-col gap-4">
            {/* Bill & Paid Summary Card with Visual Notes on Counter */}
            <div className="rounded-3xl border-3 border-black bg-[#FAF5EE] p-4 sm:p-5 shadow-[4px_4px_0px_#000] space-y-3">
              <div className="flex items-center justify-around border-b-2 border-black/10 pb-3 text-center">
                <div>
                  <span className="block text-xs font-black uppercase text-ink-secondary">
                    Total Bill
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-tea">
                    ₹{total}
                  </span>
                </div>

                <div className="h-8 w-0.5 bg-black/15" />

                <div>
                  <span className="block text-xs font-black uppercase text-ink-secondary">
                    Paid on Counter
                  </span>
                  <span
                    className={`text-2xl sm:text-3xl font-black ${
                      paidAmount >= total ? "text-emerald-700" : "text-amber-800"
                    }`}
                  >
                    ₹{paidAmount}
                  </span>
                </div>
              </div>

              {/* Giving Notes on Counter Tray */}
              <div className="rounded-2xl border-2 border-amber-900/30 bg-[#EFE5D5] p-3 shadow-inner">
                <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-black/10 text-xs font-black uppercase tracking-wider text-amber-950">
                  <span className="flex items-center gap-1.5">
                    <span>💵</span>
                    <span>Notes Given to Cashier</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-900/70 lowercase">
                    {paymentNotes.length > 0 ? "tap note to take back" : ""}
                  </span>
                </div>

                <div className="min-h-[56px] flex flex-wrap items-center gap-2">
                  {paymentNotes.length === 0 ? (
                    <p className="text-xs font-semibold text-amber-950/60 italic w-full text-center py-2">
                      Tap rupee notes below to place them here on the counter.
                    </p>
                  ) : (
                    paymentNotes.map((note, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => removeNote(idx)}
                        className={`btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black px-3 py-1.5 text-base font-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all hover:scale-105 active:scale-95 animate-in zoom-in-75 ${noteStyle(
                          note
                        )}`}
                        title="Tap to take back note"
                      >
                        <span>₹{note}</span>
                        <span className="text-xs opacity-70 ml-0.5">×</span>
                      </button>
                    ))
                  )}
                </div>
              </div>

              {paidAmount >= total && (
                <div className="rounded-xl border-2 border-emerald-700 bg-emerald-100 py-2 px-3 text-xs sm:text-sm font-black text-emerald-900 animate-fade-in text-center">
                  ✓ Paid in full! {change > 0 ? `Change to take back: ₹${change} 🪙` : "Exact amount given!"}
                </div>
              )}
            </div>

            {/* Rupee Notes Wallet Picker */}
            <div className="rounded-3xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000]">
              <p className="text-xs sm:text-sm font-black uppercase tracking-wider text-ink-secondary text-center mb-3">
                Tap notes to pay:
              </p>

              <div className="grid grid-cols-3 gap-2.5">
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
                    <span className="text-[10px] font-bold opacity-80 mt-0.5">+ Give</span>
                  </button>
                ))}
              </div>

              {/* Note Action Helpers */}
              <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-black/10">
                <button
                  type="button"
                  onClick={clearNotes}
                  className="btn-tactile flex items-center gap-1 rounded-xl border-2 border-black bg-white px-3.5 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-slate-100 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear</span>
                </button>

                <button
                  type="button"
                  onClick={suggestExactNotes}
                  className="btn-tactile flex items-center gap-1 rounded-xl border-2 border-amber-600 bg-amber-100 px-3.5 py-1.5 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000] hover:bg-amber-200 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-700" />
                  <span>Exact Notes</span>
                </button>
              </div>
            </div>

            {/* Pay Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  playPress();
                  setPhase("market");
                }}
                className="btn-tactile flex items-center justify-center gap-1.5 rounded-2xl border-2 border-black bg-white px-4 py-3 text-xs sm:text-sm font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-slate-100 cursor-pointer sm:w-auto"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <div className="flex-1">
                <ChunkyButton
                  variant="tea"
                  size="xl"
                  disabled={paidAmount < total}
                  onClick={handleCompletePayment}
                  className="w-full justify-center"
                >
                  <span className="flex items-center justify-center gap-2">
                    <span>Complete Payment</span>
                    <Check className="h-5 w-5 stroke-[2.5]" />
                  </span>
                </ChunkyButton>
              </div>
            </div>
          </div>
        )}

        {/* ─── STEP 3: CELEBRATION ─── */}
        {phase === "done" && (
          <Celebration
            title={t.celebrationTitle}
            subtitle={`You bought ${basket.length} item${basket.length === 1 ? "" : "s"} for ₹${total}!`}
            xpEarned={basket.length * 20 + 50}
            accuracy="100%"
          >
            <div className="flex flex-col items-center gap-4 max-w-sm mx-auto text-center w-full pt-2">
              <div className="flex flex-wrap items-center justify-center gap-2 py-2">
                {basket.map((id) => {
                  const product = BAZAAR_PRODUCTS.find((p) => p.id === id);
                  if (!product) return null;
                  const name = product.name[normLocale] || product.name.en;
                  const emoji = getProduceEmoji(id);
                  return (
                    <div
                      key={id}
                      className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-[#FAF5EE] px-3 py-1 text-xs font-black text-ink shadow-[2px_2px_0px_#000]"
                    >
                      <span>{emoji}</span>
                      <span>{name}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 w-full pt-2">
                <ChunkyButton variant="tea" size="xl" onClick={restartGame}>
                  <span className="flex items-center gap-2">
                    <RotateCcw className="h-4 w-4" /> Shop Again
                  </span>
                </ChunkyButton>
                <Link
                  href="/patient/games"
                  className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-surface px-5 py-3 text-xs sm:text-sm font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
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
