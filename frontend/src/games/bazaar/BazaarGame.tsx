"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  ShoppingBag,
  Volume2,
  Send,
  RotateCcw,
  Sparkles,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Music,
  Wallet,
  Store,
  Tag,
  ArrowRight,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playLifeSong } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { api, type AiBazaarResponse } from "@/lib/api";
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
      <GameHeader title={title} score={score} backHref="/patient/games" bgColor="bg-tea" />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

const MARKET_ITEMS = [
  { id: "tea", name: "Upper Assam Golden Tips Tea", initialPrice: 60, icon: "🍃" },
  { id: "gamusa", name: "Handwoven Muga Silk Gamusa", initialPrice: 70, icon: "🧣" },
  { id: "honey", name: "Shillong Forest Wild Honey", initialPrice: 50, icon: "🍯" },
];

export function BazaarGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "bazaar", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "shop" | "done">("intro");
  const [itemIndex, setItemIndex] = useState(0);
  const [budget, setBudget] = useState(200);
  const [purchasedItems, setPurchasedItems] = useState<string[]>([]);
  const [turnData, setTurnData] = useState<AiBazaarResponse | null>(null);
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [typedMessage, setTypedMessage] = useState("");
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const currentItem = MARKET_ITEMS[itemIndex] || MARKET_ITEMS[0];
  const score = purchasedItems.length * 35;

  const loadMerchantTurn = useCallback(
    async (userMsg: string) => {
      setIsAiResponding(true);
      try {
        const res = await api.aiBazaar({
          patientId,
          marketName: "Guwahati Fancy Bazaar",
          currentItem: currentItem.name,
          budgetRemaining: budget,
          userSpokenMessage: userMsg,
        });
        setTurnData(res);
        speak(res.merchantDialogue, locale, rate);
      } catch {
        const fallback: AiBazaarResponse = {
          merchantName: "Pranab (Shopkeeper)",
          merchantDialogue: `Namaskar, Dadu! For this fresh ${currentItem.name}, our special price is ₹${currentItem.initialPrice - 10}.`,
          itemName: currentItem.name,
          finalPrice: currentItem.initialPrice - 10,
          updatedBudget: Math.max(0, budget - (currentItem.initialPrice - 10)),
          quickOptions: ["I will take it! Thank you.", "Can you give a little discount?"],
          isDealClosed: true,
          culturalFact: "Fresh authentic harvest packaged in natural jute pouches.",
        };
        setTurnData(fallback);
        speak(fallback.merchantDialogue, locale, rate);
      } finally {
        setIsAiResponding(false);
      }
    },
    [patientId, currentItem, budget, locale, rate]
  );

  const startBazaar = useCallback(() => {
    playPress();
    setPhase("shop");
    setItemIndex(0);
    setBudget(200);
    setPurchasedItems([]);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    loadMerchantTurn("Hello shopkeeper! How much for this item?");
  }, [loadMerchantTurn]);

  const handleUserReply = (message: string) => {
    if (!message.trim() || isAiResponding) return;
    setTaps((t) => t + 1);
    stopSpeaking();
    playPress();
    setTypedMessage("");

    // Check if agreeing to purchase
    const isBuying =
      message.toLowerCase().includes("take") ||
      message.toLowerCase().includes("buy") ||
      message.toLowerCase().includes("thank") ||
      message.toLowerCase().includes("yes");

    if (isBuying && turnData) {
      playCorrect();
      const newBudget = Math.max(0, budget - turnData.finalPrice);
      setBudget(newBudget);
      const updated = [...purchasedItems, currentItem.name];
      setPurchasedItems(updated);

      if (itemIndex + 1 < MARKET_ITEMS.length) {
        setTimeout(() => {
          const nextIdx = itemIndex + 1;
          setItemIndex(nextIdx);
          loadMerchantTurn("Hello! What is your price for this next item?");
        }, 1800);
      } else {
        setTimeout(() => {
          playComplete();
          setPhase("done");
          if (startedAt) {
            recordGameSession(patientId, {
              gameId: "bazaar",
              level,
              outcome: "completed",
              score: 100,
              startedAt,
              taps: taps + 1,
              errorCount: 0,
            });
          }
        }, 1800);
      }
    } else {
      loadMerchantTurn(message);
    }
  };

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "bazaar",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  if (loading)
    return (
      <GameShell title="Heritage Bazaar Barter Protocol" score={0}>
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title="Heritage Bazaar Barter Protocol" score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title="The Heritage Bazaar Barter" score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          {/* Government Paperclip Header */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                Market Simulation & IADL // Module CDTx-13
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-tea" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-tea text-white shadow-[4px_4px_0px_#000]">
            <Store className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              The Heritage Bazaar Barter
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              Step into a bustling North East market. Converse with a courteous local shopkeeper, barter for fresh regional delicacies, and manage your budget.
            </p>
          </div>

          {/* Shopping Checklist Card */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                <ShoppingBag className="h-3.5 w-3.5" /> Market Shopping List
              </span>
              <span className="text-[10px] font-black uppercase rounded bg-tea text-white px-2 py-0.5">
                Wallet: ₹200
              </span>
            </div>
            <div className="space-y-2 text-xs font-bold text-ink">
              {MARKET_ITEMS.map((item, idx) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md border border-black bg-amber-100 text-[11px] font-black">
                      {idx + 1}
                    </span>
                    <span>{item.name}</span>
                  </div>
                  <span className="text-tea font-black">~₹{item.initialPrice}</span>
                </div>
              ))}
            </div>
          </div>

          <AudioPrompt
            text="Welcome to the Heritage Bazaar. Speak with the shopkeeper and complete your shopping list."
            label="Listen to Instructions"
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startBazaar}>
            Enter the Bazaar
          </ChunkyButton>
        </div>
      ) : phase === "shop" ? (
        <div className="flex flex-col items-center gap-4 py-1">
          {/* WALLET & ITEM STATUS BAR */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-tea" />
              <span className="text-xs font-black text-ink">
                Wallet Balance: <strong className="text-tea">₹{budget}</strong>
              </span>
            </div>
            <span className="text-[11px] font-bold text-ink-secondary">
              Item {itemIndex + 1} of {MARKET_ITEMS.length}
            </span>
          </div>

          {/* SHOPKEEPER SPEECH STAGE */}
          <div className="relative w-full max-w-md rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[4px_4px_0px_#000] text-left select-none">
            <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-amber-900" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-900">
                  {turnData?.merchantName || "Fancy Bazaar Shopkeeper"}
                </span>
              </div>
              {isAiResponding && (
                <span className="text-[10px] font-bold text-ink-secondary animate-pulse">
                  Shopkeeper thinking...
                </span>
              )}
            </div>

            <p className="text-sm sm:text-base font-extrabold text-ink leading-relaxed">
              &ldquo;{turnData?.merchantDialogue || "Namaskar, Dadu! Welcome to my shop."}&rdquo;
            </p>

            {/* Cultural Fact Badge */}
            {turnData?.culturalFact && (
              <div className="mt-3 rounded-xl bg-amber-100 p-2 border border-black/20 text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 text-amber-800 shrink-0" />
                <span>{turnData.culturalFact}</span>
              </div>
            )}

            <div className="mt-3.5 flex items-center justify-between pt-2 border-t-2 border-black/10">
              <button
                type="button"
                onClick={() => speak(turnData?.merchantDialogue || "", locale, rate)}
                className="group flex items-center gap-1.5 rounded-xl border-2 border-tea bg-tea-light px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-tea hover:text-white transition-all cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>Hear Shopkeeper</span>
              </button>
              <span className="text-xs font-black text-tea bg-tea-light px-2.5 py-1 rounded-lg border border-tea/30">
                Offered: ₹{turnData?.finalPrice || currentItem.initialPrice}
              </span>
            </div>
          </div>

          {/* DUAL INPUT CONTROLS */}
          <div className="w-full max-w-md space-y-2.5">
            {/* 1. Custom Text Input with Limit Counter */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleUserReply(typedMessage);
              }}
              className="flex items-center gap-1.5 rounded-2xl border-3 border-black bg-surface p-1.5 shadow-[3px_3px_0px_#000]"
            >
              <input
                type="text"
                maxLength={120}
                value={typedMessage}
                disabled={isAiResponding}
                onChange={(e) => setTypedMessage(e.target.value)}
                placeholder="Type your barter offer or reply here..."
                className="flex-1 rounded-xl bg-transparent px-3 py-2 text-xs sm:text-sm font-black text-ink placeholder:text-ink-secondary/60 focus:outline-none disabled:opacity-50"
              />
              <span className="text-[10px] font-bold text-ink-secondary pr-1">
                {typedMessage.length}/120
              </span>
              <button
                type="submit"
                disabled={!typedMessage.trim() || isAiResponding}
                className="btn-tactile flex items-center gap-1 rounded-xl border-2 border-black bg-tea px-3.5 py-2 text-xs font-black text-white shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Reply</span>
              </button>
            </form>

            {/* 2. One-Tap AI Quick Recommendation Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-black uppercase tracking-wider text-ink-secondary flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-tea" /> Quick Barter Options:
              </span>
              <div className="grid gap-2">
                {turnData?.quickOptions.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    disabled={isAiResponding}
                    onClick={() => handleUserReply(opt)}
                    className="btn-tactile group flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2.5 text-left text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-tea-light hover:border-tea transition-transform active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                  >
                    <span>{opt}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-tea font-black shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title="Bazaar Shopping Complete!"
          subtitle="You negotiated fair prices for traditional North Eastern goods while managing your personal wallet budget."
          xpEarned={120}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Market Trip Fulfilled
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-tea text-white px-2 py-0.5">
                  Wallet Left: ₹{budget}
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                All Items Collected in Heritage Bag
              </h3>
              <div className="mt-3 space-y-1.5 border-t border-black/10 pt-2">
                {purchasedItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-black text-ink">
                    <span>• {item}</span>
                    <span className="text-tea">Acquired ✓</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-xs font-black">Play Folk Melody</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  Assessment Complete
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startBazaar}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> Visit Market Again
                </span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
              >
                ← Back to Therapy Suite
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
