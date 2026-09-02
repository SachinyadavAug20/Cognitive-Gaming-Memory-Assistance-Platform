"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import {
  ShoppingBag,
  Wallet,
  Store,
  Tag,
  RotateCcw,
  Music,
  CheckCircle2,
  HelpCircle,
  Trash2,
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
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";

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
    <section className="pb-12 min-h-screen bg-[#FAF6F0]">
      <GameHeader
        title={title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-tea"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

type Localized = { en: string; hi: string; mr: string };

interface Product {
  id: string;
  name: Localized;
  price: number;
  emoji: string;
}

const PRODUCTS: Product[] = [
  {
    id: "rice",
    name: { en: "Basmati Rice (1 kg)", hi: "बासमती चावल (१ किलो)", mr: "बासमती तांदूळ (१ किलो)" },
    price: 80,
    emoji: "🍚",
  },
  {
    id: "dal",
    name: { en: "Toor Dal (500 g)", hi: "तूर दाल (५०० ग्रॅम)", mr: "तूर डाळ (५०० ग्रॅम)" },
    price: 65,
    emoji: "🫘",
  },
  {
    id: "oil",
    name: { en: "Mustard Oil (1 L)", hi: "सरसों का तेल (१ लीटर)", mr: "मोहरीचे तेल (१ लीटर)" },
    price: 90,
    emoji: "🫙",
  },
  {
    id: "sugar",
    name: { en: "Sugar (1 kg)", hi: "चीनी (१ किलो)", mr: "साखर (१ किलो)" },
    price: 45,
    emoji: "🍬",
  },
  {
    id: "salt",
    name: { en: "Salt (1 kg)", hi: "नमक (१ किलो)", mr: "मीठ (१ किलो)" },
    price: 25,
    emoji: "🧂",
  },
  {
    id: "tea",
    name: { en: "Tea Powder (250 g)", hi: "चाय पत्ती (२५० ग्रॅम)", mr: "चहापावडी (२५० ग्रॅम)" },
    price: 55,
    emoji: "🍵",
  },
  {
    id: "atta",
    name: { en: "Wheat Atta (5 kg)", hi: "गेहूं का आटा (५ किलो)", mr: "गहू पीठ (५ किलो)" },
    price: 140,
    emoji: "🪨",
  },
  {
    id: "spices",
    name: { en: "Masala Box (6 spices)", hi: "मसाला बॉक्स (६ मसाले)", mr: "मसाला पेटी (६ मसाले)" },
    price: 100,
    emoji: "🫚",
  },
];

const PAYMENT_NOTES = [10, 20, 50, 100, 200, 500];

const BUDGET = 500;

export function BazaarBuddiesGame() {
  const locale = useLocale();
  const t = useTranslations("games.bazaarBuddies");
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "bazaarBuddies", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<
    "intro" | "shop" | "payment" | "change" | "done"
  >("intro");
  const [basket, setBasket] = useState<string[]>([]);
  const [paymentNotes, setPaymentNotes] = useState<number[]>([]);
  const [changeGiven, setChangeGiven] = useState<number | null>(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [taps, setTaps] = useState(0);
  const [errors, setErrors] = useState(0);

  const localeKey = (locale === "hi" || locale === "mr") ? locale : "en";

  const total = basket.reduce((sum, id) => {
    const p = PRODUCTS.find((pr) => pr.id === id);
    return sum + (p?.price ?? 0);
  }, 0);

  const paidAmount = paymentNotes.reduce((s, n) => s + n, 0);
  const correctChange = paidAmount - total;
  const remaining = BUDGET - total;
  const score = basket.length * 12 + (phase === "done" ? 100 : 0);

  const productName = (p: Product) => p.name[localeKey] ?? p.name.en;

  const addToBasket = useCallback(
    (id: string) => {
      playPress();
      setTaps((t) => t + 1);
      if (basket.includes(id) || basket.length >= 8) return;
      const product = PRODUCTS.find((p) => p.id === id);
      if (!product) return;
      if (total + product.price > BUDGET) {
        playEncourage();
        return;
      }
      const updated = [...basket, id];
      setBasket(updated);
      speak(t("added"), locale, rate);
    },
    [basket, total, locale, rate, t]
  );

  const removeFromBasket = useCallback(
    (id: string) => {
      playPress();
      setTaps((t) => t + 1);
      setBasket((prev) => prev.filter((x) => x !== id));
      speak(t("removed"), locale, rate);
    },
    [locale, rate, t]
  );

  const goPayment = useCallback(() => {
    if (basket.length === 0) return;
    playPress();
    setPhase("payment");
    setPaymentNotes([]);
    setChangeGiven(null);
  }, [basket]);

  const addNote = useCallback(
    (value: number) => {
      playPress();
      setTaps((t) => t + 1);
      setPaymentNotes((prev) => [...prev, value]);
    },
    []
  );

  const submitPayment = useCallback(() => {
    if (paidAmount < total) {
      playEncourage();
      return;
    }
    playCorrect();
    setPhase("change");
    setPaymentNotes((prev) => [...prev]);
  }, [paidAmount, total]);

  const submitChange = useCallback(
    (value: number) => {
      setTaps((t) => t + 1);
      setChangeGiven(value);
      if (value === correctChange) {
        playCorrect();
        speak(t("correct"), locale, rate);
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
        playEncourage();
        setErrors((e) => e + 1);
        speak(t("wrong"), locale, rate);
        setTimeout(() => setChangeGiven(null), 1500);
      }
    },
    [correctChange, startedAt, patientId, level, taps, errors, locale, rate, t]
  );

  const showHint = useCallback(() => {
    playPress();
    setHintUsed(true);
    speak(t("hint", { amount: correctChange }), locale, rate);
  }, [correctChange, locale, rate, t]);

  const restartGame = useCallback(() => {
    playPress();
    setPhase("intro");
    setBasket([]);
    setPaymentNotes([]);
    setChangeGiven(null);
    setHintUsed(false);
    setStartedAt(null);
    setTaps(0);
    setErrors(0);
  }, []);

  const startGame = useCallback(() => {
    playPress();
    setPhase("shop");
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

  if (loading)
    return (
      <GameShell title={t("title")} score={0}>
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title={t("title")} score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title={t("title")} score={score}>
      {/* ─── INTRO ─── */}
      {phase === "intro" && (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-tea text-white shadow-[4px_4px_0px_#000]">
            <Store className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {t("title")}
            </h2>
            <p className="max-w-md text-lg font-semibold text-ink-secondary leading-relaxed">
              {t("desc")}
            </p>
          </div>

          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="text-base font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5" /> {t("welcome")}
              </span>
              <span className="text-[10px] font-black uppercase rounded bg-tea text-white px-2 py-0.5">
                ₹{BUDGET}
              </span>
            </div>
            <p className="text-base font-bold text-ink-secondary leading-relaxed">
              {t("instruction")}
            </p>
          </div>

          <AudioPrompt
            text={t("instruction")}
            label={t("welcome")}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startGame}>
            {t("shopNow")}
          </ChunkyButton>
        </div>
      )}

      {/* ─── SHOP ─── */}
      {phase === "shop" && (
        <div className="flex flex-col items-center gap-4 py-1">
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-tea" />
              <span className="text-base font-black text-ink">
                {t("remaining")}:{" "}
                <strong className="text-tea">₹{remaining}</strong>
              </span>
            </div>
            <span className="text-base font-black text-ink">
              {t("total")}: <strong className="text-tea">₹{total}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5 w-full max-w-md">
            {PRODUCTS.map((product) => {
              const inBasket = basket.includes(product.id);
              const wouldExceed = total + product.price > BUDGET;
              return (
                <button
                  key={product.id}
                  type="button"
                  disabled={inBasket || wouldExceed}
                  onClick={() =>
                    inBasket
                      ? removeFromBasket(product.id)
                      : addToBasket(product.id)
                  }
                  className={`btn-tactile flex items-center gap-2.5 rounded-xl border-3 border-black px-3 py-3 text-left shadow-[4px_4px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer disabled:opacity-40 ${
                    inBasket
                      ? "bg-tea-light border-tea"
                      : "bg-surface hover:bg-tea-light"
                  }`}
                >
                  <span className="text-2xl shrink-0">{product.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-black text-ink leading-tight truncate">
                      {productName(product)}
                    </p>
                    <p className="text-[11px] font-bold text-tea mt-0.5">
                      ₹{product.price}
                    </p>
                  </div>
                  {inBasket && (
                    <span className="text-[10px] font-black text-tea shrink-0">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-[#FAF5EE] p-4 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-2.5">
              <span className="text-base font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5" /> {t("total")}
              </span>
              <span className="text-lg font-black text-tea">₹{total}</span>
            </div>
            {basket.length === 0 ? (
              <p className="text-base font-bold text-ink-secondary text-center py-2">
                {t("basketEmpty")}
              </p>
            ) : (
              <div className="space-y-1.5">
                {basket.map((id) => {
                  const p = PRODUCTS.find((pr) => pr.id === id);
                  if (!p) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between text-base font-black text-ink"
                    >
                      <span>
                        {p.emoji} {productName(p)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-tea">₹{p.price}</span>
                        <button
                          type="button"
                          onClick={() => removeFromBasket(id)}
                          className="text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <ChunkyButton
            variant="tea"
            size="xl"
            onClick={goPayment}
            disabled={basket.length === 0}
          >
            {t("payment")}
          </ChunkyButton>
        </div>
      )}

      {/* ─── PAYMENT ─── */}
      {phase === "payment" && (
        <div className="flex flex-col items-center gap-4 py-1">
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-3">
              <span className="text-base font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Wallet className="h-4 w-4" /> {t("payment")}
              </span>
              <span className="text-lg font-black text-tea">₹{total}</span>
            </div>
            <div className="space-y-1.5 mb-3">
              {basket.map((id) => {
                const p = PRODUCTS.find((pr) => pr.id === id);
                if (!p) return null;
                return (
                  <div
                    key={id}
                    className="flex items-center justify-between text-base font-black text-ink"
                  >
                    <span>
                      {p.emoji} {productName(p)}
                    </span>
                    <span className="text-tea">₹{p.price}</span>
                  </div>
                );
              })}
            </div>
            <div className="border-t-2 border-black/10 pt-2 flex items-center justify-between">
              <span className="text-base font-black text-ink">
                {t("total")}
              </span>
              <span className="text-lg font-black text-tea">₹{total}</span>
            </div>
          </div>

          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000]">
            <p className="text-base font-black uppercase tracking-wider text-ink-secondary mb-3">
              {t("paid")}: ₹{paidAmount}
            </p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_NOTES.map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => addNote(note)}
                  className="btn-tactile rounded-xl border-2 border-black bg-surface px-3 py-2 text-base font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-tea-light transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  ₹{note}
                </button>
              ))}
            </div>
            {paymentNotes.length > 0 && (
              <div className="mt-3 border-t-2 border-black/10 pt-2 space-y-1">
                {paymentNotes.map((n, i) => (
                  <span
                    key={i}
                    className="inline-block mr-1.5 rounded-lg border border-black bg-tea-light px-2 py-0.5 text-[11px] font-black text-ink"
                  >
                    ₹{n}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 w-full max-w-md">
            <button
              type="button"
              onClick={() => {
                playPress();
                setPaymentNotes([]);
              }}
              className="btn-tactile flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-surface px-4 py-2.5 text-base font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted transition-transform active:translate-y-0.5 cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t("clearBtn")}
            </button>
            <ChunkyButton
              variant="tea"
              size="xl"
              onClick={submitPayment}
              disabled={paidAmount < total}
            >
              {t("change")}
            </ChunkyButton>
          </div>
        </div>
      )}

      {/* ─── CHANGE ─── */}
      {phase === "change" && (
        <div className="flex flex-col items-center gap-4 py-1">
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-3">
              <span className="text-base font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> {t("change")}
              </span>
            </div>
            <div className="space-y-1.5 text-base font-black text-ink">
              <div className="flex justify-between">
                <span>{t("total")}</span>
                <span className="text-tea">₹{total}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("paid")}</span>
                <span className="text-tea">₹{paidAmount}</span>
              </div>
              <div className="border-t-2 border-black/10 pt-1.5 flex justify-between text-lg">
                <span>{t("change")}</span>
                <span className="text-tea">
                  {changeGiven !== null ? `₹${changeGiven}` : "?"}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000]">
            <p className="text-base font-black uppercase tracking-wider text-ink-secondary mb-3">
              {t("change")}
            </p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_NOTES.map((note) => (
                <button
                  key={note}
                  type="button"
                  onClick={() => submitChange(note)}
                  disabled={changeGiven !== null}
                  className="btn-tactile rounded-xl border-2 border-black bg-surface px-3 py-2 text-base font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-tea-light transition-transform active:translate-y-0.5 cursor-pointer disabled:opacity-40"
                >
                  ₹{note}
                </button>
              ))}
            </div>
            {changeGiven !== null && changeGiven !== correctChange && (
              <p className="mt-3 text-base font-bold text-red-600 text-center">
                {t("wrong")}
              </p>
            )}
          </div>

          {!hintUsed && (
            <button
              type="button"
              onClick={showHint}
              className="flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-4 py-2 text-base font-black text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
            >
              <HelpCircle className="h-4 w-4" />
              {t("hintBtn")}
            </button>
          )}
        </div>
      )}

      {/* ─── DONE ─── */}
      {phase === "done" && (
        <Celebration
          title={t("complete")}
          subtitle={t("desc")}
          xpEarned={basket.length * 12 + 100}
          accuracy={`${Math.max(0, 100 - errors * 20)}%`}
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-base font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {t("complete")}
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-tea text-white px-2 py-0.5">
                  {t("remaining")}: ₹{remaining}
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                {t("title")}
              </h3>
              <div className="mt-3 space-y-1.5 border-t border-black/10 pt-2">
                {basket.map((id) => {
                  const p = PRODUCTS.find((pr) => pr.id === id);
                  if (!p) return null;
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between text-base font-black text-ink"
                    >
                      <span>
                        {p.emoji} {productName(p)}
                      </span>
                      <span className="text-tea">₹{p.price}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-base font-black">🎵</span>
                </button>
                <span className="text-base font-bold text-ink-secondary">
                  {t("complete")}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={restartGame}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> {t("playAgain")}
                </span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-base font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
              >
                ← {t("backToHub")}
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
