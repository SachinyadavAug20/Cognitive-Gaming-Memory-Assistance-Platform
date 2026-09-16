"use client";

import React from "react";
import { Wallet, HelpCircle, CheckCircle2, Check, ArrowLeft } from "lucide-react";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { CaregiverCoPlayPrompt } from "@/components/ui/CaregiverCoPlayPrompt";
import type { ErrorlessScaffoldReturn } from "@/hooks/useErrorlessScaffold";
import type { BazaarProduct } from "./bazaarI18n";
import { getProduceEmoji, getChangeNotes, noteStyle } from "./bazaarHelpers";

interface BazaarCashierCounterViewProps {
  total: number;
  targetProducts: BazaarProduct[];
  givenNote: number | null;
  changeCalculated: boolean;
  expectedChange: number;
  walletNotes: number[];
  changeChoices: number[];
  wrongAttempt: number | null;
  showHint: boolean;
  feedbackMsg: string | null;
  scaffold: ErrorlessScaffoldReturn;
  onSelectPaymentNote: (note: number) => void;
  onSelectChangeChoice: (choice: number) => void;
  onChangeNote: () => void;
  onShowHint: () => void;
  onFinishShopping: () => void;
  onBackToMarket: () => void;
}

export function BazaarCashierCounterView({
  total,
  targetProducts,
  givenNote,
  changeCalculated,
  expectedChange,
  walletNotes,
  changeChoices,
  wrongAttempt,
  showHint,
  feedbackMsg,
  scaffold,
  onSelectPaymentNote,
  onSelectChangeChoice,
  onChangeNote,
  onShowHint,
  onFinishShopping,
  onBackToMarket,
}: BazaarCashierCounterViewProps) {
  return (
    <div className="flex flex-col gap-3.5">
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

      <div className="rounded-2xl border-3 border-amber-900/40 bg-[#EFE5D5] p-3.5 shadow-[3px_3px_0px_#000]">
        <div className="flex items-center justify-between pb-1.5 border-b border-amber-900/20 mb-2.5 text-xs font-black uppercase text-amber-950">
          <span>Counter Tray</span>
          {givenNote !== null && !changeCalculated && (
            <button
              type="button"
              onClick={onChangeNote}
              className="text-xs font-bold text-amber-800 underline hover:text-amber-950 cursor-pointer"
            >
              ↺ Change Note
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
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
                  onClick={() => onSelectPaymentNote(note)}
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

          <div className="grid grid-cols-4 gap-2 pt-1">
            {changeChoices.map((choice) => {
              const isWrong = wrongAttempt === choice;
              const isCorrectChoice = choice === expectedChange;
              const isScaffolded = scaffold.isGuiding && isCorrectChoice;
              return (
                <button
                  key={choice}
                  type="button"
                  onClick={() => onSelectChangeChoice(choice)}
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

          <div className="flex flex-col items-center pt-1 border-t border-black/10">
            {showHint ? (
              <div className="rounded-lg border border-amber-600 bg-amber-50 p-1.5 text-xs font-black text-amber-950 animate-fade-in w-full">
                Hint: ₹{givenNote} − ₹{total} = ₹{expectedChange}
              </div>
            ) : (
              <button
                type="button"
                onClick={onShowHint}
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

          {scaffold.caregiverTip && (
            <CaregiverCoPlayPrompt tip={scaffold.caregiverTip} className="mt-2 text-left" />
          )}
        </div>
      )}

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
            onClick={onFinishShopping}
            className="w-full justify-center"
          >
            <span className="flex items-center justify-center gap-2">
              <span>Finish Shopping</span>
              <Check className="h-5 w-5 stroke-[2.5]" />
            </span>
          </ChunkyButton>
        </div>
      )}

      {!changeCalculated && (
        <div>
          <button
            type="button"
            onClick={onBackToMarket}
            className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-1.5 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Stalls</span>
          </button>
        </div>
      )}
    </div>
  );
}
