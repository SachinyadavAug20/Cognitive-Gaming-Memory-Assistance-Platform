"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { RotateCcw } from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { resolveAdaptiveLevel } from "@/lib/telemetry";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import type { SupportedLocale } from "@/lib/gameI18n";
import { BAZAAR_I18N } from "./bazaarI18n";
import { getProduceEmoji, getShortName } from "./bazaarHelpers";
import { useBazaarShoppingState } from "./useBazaarShoppingState";
import { BazaarMarketStallView } from "./BazaarMarketStallView";
import { BazaarCashierCounterView } from "./BazaarCashierCounterView";

export function BazaarBuddiesGame() {
  const locale = useLocale();
  const normalizedLocale = (locale?.split("-")[0]?.toLowerCase() || "en") as SupportedLocale;
  const translationStrings = BAZAAR_I18N[normalizedLocale] || BAZAAR_I18N.en;

  const { detail, loading, error, reload, patientId } = usePatientDetail();
  const adaptiveGameLevel = resolveAdaptiveLevel(patientId, "bazaarBuddies", startLevel(detail));
  const patientSpeechRate = speechRate(detail);

  const shoppingState = useBazaarShoppingState({
    patientId: patientId ?? 0,
    level: adaptiveGameLevel,
    rate: patientSpeechRate,
    locale,
    normLocale: normalizedLocale,
  });

  if (loading) {
    return (
      <section className="pb-12 min-h-screen bg-canvas">
        <GameHeader
          title={translationStrings.title}
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
          title={translationStrings.title}
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
      <GameHeader
        title={translationStrings.title}
        score={shoppingState.score}
        backHref="/patient/games"
        bgColor="bg-tea"
        gameId="bazaar-buddies"
      />

      <div className="mx-auto max-w-3xl px-3 sm:px-4 pt-3">
        {shoppingState.phase === "market" && (
          <BazaarMarketStallView
            targetIds={shoppingState.targetIds}
            targetProducts={shoppingState.targetProducts}
            basket={shoppingState.basket}
            total={shoppingState.total}
            allTargetsInBasket={shoppingState.allTargetsInBasket}
            normLocale={normalizedLocale}
            feedbackMsg={shoppingState.feedbackMsg}
            scaffold={shoppingState.scaffold}
            onProduceClick={shoppingState.handleProduceClick}
            onRemoveFromBasket={shoppingState.handleRemoveFromBasket}
            onProceedToCashier={shoppingState.handleProceedToCashier}
          />
        )}

        {shoppingState.phase === "cashier" && (
          <BazaarCashierCounterView
            total={shoppingState.total}
            targetProducts={shoppingState.targetProducts}
            givenNote={shoppingState.givenNote}
            changeCalculated={shoppingState.changeCalculated}
            expectedChange={shoppingState.expectedChange}
            walletNotes={shoppingState.walletNotes}
            changeChoices={shoppingState.changeChoices}
            wrongAttempt={shoppingState.wrongAttempt}
            showHint={shoppingState.showHint}
            feedbackMsg={shoppingState.feedbackMsg}
            scaffold={shoppingState.scaffold}
            onSelectPaymentNote={shoppingState.handleSelectPaymentNote}
            onSelectChangeChoice={shoppingState.handleSelectChangeChoice}
            onChangeNote={shoppingState.handleResetPaymentNote}
            onShowHint={() => shoppingState.setShowHint(true)}
            onFinishShopping={shoppingState.handleFinishShopping}
            onBackToMarket={shoppingState.handleReturnToMarketPhase}
          />
        )}

        {shoppingState.phase === "done" && (
          <Celebration
            title="Shopping Done!"
            subtitle={`You bought all 4 items and calculated ₹${shoppingState.expectedChange} change!`}
            xpEarned={120}
            accuracy="100%"
          >
            <div className="flex flex-col items-center gap-3 max-w-xs mx-auto text-center w-full pt-2">
              <div className="w-full rounded-xl border-2 border-black/30 bg-[#FAF5EE] p-2.5 text-left space-y-1 shadow-inner text-xs font-bold text-ink">
                {shoppingState.targetProducts.map((p) => (
                  <div key={p.id} className="flex justify-between">
                    <span>
                      {getProduceEmoji(p.id)} {getShortName(p, normalizedLocale)}
                    </span>
                    <span className="font-black text-tea">₹{p.price}</span>
                  </div>
                ))}
                <div className="flex justify-between border-t border-black/10 pt-1 font-black">
                  <span>Total</span>
                  <span>₹{shoppingState.total}</span>
                </div>
                <div className="flex justify-between text-ink-secondary text-[11px]">
                  <span>Paid</span>
                  <span>₹{shoppingState.givenNote}</span>
                </div>
                <div className="flex justify-between font-black text-emerald-800">
                  <span>Change</span>
                  <span>₹{shoppingState.expectedChange}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5 w-full pt-1">
                <ChunkyButton variant="tea" size="xl" onClick={shoppingState.restartGame}>
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
