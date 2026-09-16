"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { CaregiverCoPlayPrompt } from "@/components/ui/CaregiverCoPlayPrompt";
import type { ErrorlessScaffoldReturn } from "@/hooks/useErrorlessScaffold";
import { BAZAAR_PRODUCTS, type BazaarProduct } from "./bazaarI18n";
import { getProduceEmoji, getShortName } from "./bazaarHelpers";

interface BazaarMarketStallViewProps {
  targetIds: string[];
  targetProducts: BazaarProduct[];
  basket: string[];
  total: number;
  allTargetsInBasket: boolean;
  normLocale: string;
  feedbackMsg: string | null;
  scaffold: ErrorlessScaffoldReturn;
  onProduceClick: (product: BazaarProduct) => void;
  onRemoveFromBasket: (id: string) => void;
  onProceedToCashier: () => void;
}

export function BazaarMarketStallView({
  targetIds,
  targetProducts,
  basket,
  total,
  allTargetsInBasket,
  normLocale,
  feedbackMsg,
  scaffold,
  onProduceClick,
  onRemoveFromBasket,
  onProceedToCashier,
}: BazaarMarketStallViewProps) {
  return (
    <div className="flex flex-col gap-2.5">
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
                  onClick={() => onRemoveFromBasket(id)}
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

      {feedbackMsg && (
        <div className="rounded-xl border-2 border-amber-500 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-950 text-center animate-fade-in">
          {feedbackMsg}
        </div>
      )}

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
              onClick={() => onProduceClick(product)}
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

      <div className="pt-1">
        <ChunkyButton
          variant="tea"
          size="xl"
          disabled={!allTargetsInBasket}
          onClick={onProceedToCashier}
          className="w-full justify-center"
        >
          <span className="flex items-center gap-2">
            <span>Proceed to Cashier (₹{total})</span>
            <ArrowRight className="h-5 w-5" />
          </span>
        </ChunkyButton>
      </div>

      {scaffold.caregiverTip && (
        <CaregiverCoPlayPrompt tip={scaffold.caregiverTip} className="mt-2" />
      )}
    </div>
  );
}
