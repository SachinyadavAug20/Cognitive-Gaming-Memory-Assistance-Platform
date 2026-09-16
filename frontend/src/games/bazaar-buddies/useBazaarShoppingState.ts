"use client";

import { useCallback, useMemo, useState, useEffect } from "react";
import {
  playPress,
  playCorrect,
  playComplete,
  playEncourage,
} from "@/lib/sound";
import { speak } from "@/lib/speech";
import { recordGameSession } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { useErrorlessScaffold } from "@/hooks/useErrorlessScaffold";
import { BAZAAR_PRODUCTS, type BazaarProduct } from "./bazaarI18n";
import {
  generateTargetIds,
  generateChangeChoices,
  getShortName,
} from "./bazaarHelpers";

interface UseBazaarShoppingStateProps {
  patientId: number;
  level: number;
  rate: number;
  locale: string;
  normLocale: string;
}

export function useBazaarShoppingState({
  patientId,
  level,
  rate,
  locale,
  normLocale,
}: UseBazaarShoppingStateProps) {
  const [phase, setPhase] = useState<"market" | "cashier" | "done">("market");
  const [targetIds, setTargetIds] = useState<string[]>(() => generateTargetIds(4));
  const [basket, setBasket] = useState<string[]>([]);

  const [givenNote, setGivenNote] = useState<number | null>(null);
  const [changeCalculated, setChangeCalculated] = useState(false);
  const [wrongAttempt, setWrongAttempt] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const [startedAt, setStartedAt] = useState<string>(() => new Date().toISOString());
  const [taps, setTaps] = useState(0);
  const [errorCount, setErrorCount] = useState(0);

  const targetProducts = useMemo(() => {
    return targetIds
      .map((id) => BAZAAR_PRODUCTS.find((p) => p.id === id))
      .filter((p): p is BazaarProduct => Boolean(p));
  }, [targetIds]);

  const total = useMemo(() => {
    return basket.reduce((sum, id) => {
      const p = BAZAAR_PRODUCTS.find((item) => item.id === id);
      return sum + (p?.price ?? 0);
    }, 0);
  }, [basket]);

  const allTargetsInBasket = useMemo(() => {
    return targetIds.length > 0 && targetIds.every((id) => basket.includes(id));
  }, [targetIds, basket]);

  const expectedChange = useMemo(() => {
    if (!givenNote) return 0;
    return Math.max(0, givenNote - total);
  }, [givenNote, total]);

  const changeChoices = useMemo(() => {
    return generateChangeChoices(expectedChange);
  }, [expectedChange]);

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

  useEffect(() => {
    if (targetProducts.length > 0 && phase === "market" && basket.length === 0) {
      const names = targetProducts
        .map((p) => getShortName(p, normLocale))
        .join(", ");
      speak(`Please buy: ${names}.`, locale, rate);
    }
  }, [targetProducts, phase, basket.length, normLocale, locale, rate]);

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

  const handleResetPaymentNote = useCallback(() => {
    playPress();
    setGivenNote(null);
    setWrongAttempt(null);
    setFeedbackMsg(null);
  }, []);

  const handleReturnToMarketPhase = useCallback(() => {
    playPress();
    setPhase("market");
  }, []);

  return {
    phase,
    targetIds,
    basket,
    givenNote,
    changeCalculated,
    wrongAttempt,
    showHint,
    setShowHint,
    feedbackMsg,
    targetProducts,
    total,
    allTargetsInBasket,
    expectedChange,
    changeChoices,
    walletNotes,
    score,
    scaffold,
    handleProduceClick,
    handleRemoveFromBasket,
    handleProceedToCashier,
    handleSelectPaymentNote,
    handleSelectChangeChoice,
    handleResetPaymentNote,
    handleReturnToMarketPhase,
    handleFinishShopping,
    restartGame,
  };
}
