"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { calculateVanishingCue, ScaffoldingIntensity } from "@/lib/errorlessLearning";

export interface ErrorlessScaffoldConfig {
  stepKey: string | number;
  onAutoSpokenHint?: () => void;
  hesitationThresholdSec?: number;
  caregiverCoPlayHint?: string;
}

export interface ErrorlessScaffoldReturn {
  hesitationSeconds: number;
  attemptCount: number;
  scaffoldIntensity: ScaffoldingIntensity;
  isGuiding: boolean;
  glowOpacity: number;
  shouldDimOthers: boolean;
  caregiverTip: string | null;
  recordAttempt: (isCorrect: boolean) => void;
  resetHesitation: () => void;
}

/**
 * useErrorlessScaffold:
 * Grounded in Clare & Jones (2008) Errorless Learning Neuropsychological Rehabilitation.
 * 
 * Amnesic dementia patients consolidate mistakes if allowed to repeatedly fail via trial-and-error.
 * This hook passively monitors hesitation latency and incorrect taps to progressively scaffold
 * the correct option via soft golden pulsing highlights ("vanishing cues") before frustration sets in.
 */
export function useErrorlessScaffold({
  stepKey,
  onAutoSpokenHint,
  hesitationThresholdSec = 8,
  caregiverCoPlayHint,
}: ErrorlessScaffoldConfig): ErrorlessScaffoldReturn {
  const [hesitationSeconds, setHesitationSeconds] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const autoHintFiredRef = useRef(false);

  // Reset counters when the task step changes
  useEffect(() => {
    setHesitationSeconds(0);
    setAttemptCount(0);
    autoHintFiredRef.current = false;
  }, [stepKey]);

  // Passive hesitation clock (1 tick per second)
  useEffect(() => {
    const timer = setInterval(() => {
      setHesitationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute vanishing cue intensity
  const scaffoldState = calculateVanishingCue(hesitationSeconds, attemptCount);

  // Auto-speak gentle reminder after prolonged hesitation (> 14s)
  useEffect(() => {
    if (hesitationSeconds >= 14 && !autoHintFiredRef.current) {
      autoHintFiredRef.current = true;
      onAutoSpokenHint?.();
    }
  }, [hesitationSeconds, onAutoSpokenHint]);

  const recordAttempt = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      setHesitationSeconds(0);
      setAttemptCount(0);
      autoHintFiredRef.current = false;
    } else {
      setAttemptCount((prev) => prev + 1);
      // Immediately elevate hesitation to trigger guided highlight
      setHesitationSeconds((prev) => Math.max(prev, hesitationThresholdSec));
    }
  }, [hesitationThresholdSec]);

  const resetHesitation = useCallback(() => {
    setHesitationSeconds(0);
  }, []);

  const isGuiding =
    scaffoldState.intensity === "forward_pulse" ||
    scaffoldState.intensity === "guided_highlight" ||
    hesitationSeconds >= hesitationThresholdSec;

  const shouldDimOthers =
    scaffoldState.intensity === "guided_highlight" || attemptCount >= 2;

  const caregiverTip = isGuiding
    ? caregiverCoPlayHint || "Take your time. Gently point towards the golden highlighted option together."
    : null;

  return {
    hesitationSeconds,
    attemptCount,
    scaffoldIntensity: scaffoldState.intensity,
    isGuiding,
    glowOpacity: scaffoldState.glowOpacity,
    shouldDimOthers,
    caregiverTip,
    recordAttempt,
    resetHesitation,
  };
}
