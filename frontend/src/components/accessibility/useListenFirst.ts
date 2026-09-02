"use client";

import { useEffect, useRef, useCallback } from "react";
import { useLocale } from "next-intl";
import { speakText, stopSpeaking } from "@/lib/sound";

export function useListenFirst(enabled: boolean) {
  const locale = useLocale();
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSpokenTextRef = useRef<string | null>(null);

  const speakElement = useCallback(
    (el: HTMLElement | null) => {
      if (!enabled || !el || typeof window === "undefined") return;

      // Extract accessible text
      const voiceText =
        el.getAttribute("data-voice-desc") ||
        el.getAttribute("aria-label") ||
        el.getAttribute("title") ||
        el.innerText?.trim().slice(0, 120);

      if (!voiceText || voiceText === lastSpokenTextRef.current) return;

      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

      hoverTimerRef.current = setTimeout(() => {
        lastSpokenTextRef.current = voiceText;
        speakText(voiceText, locale, 0.85);
      }, 450);
    },
    [enabled, locale]
  );

  useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      stopSpeaking();
      return;
    }

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement | null;
      speakElement(target);
    };

    const handlePointerOver = (e: PointerEvent) => {
      const target = (e.target as HTMLElement | null)?.closest(
        'button, a, [role="button"], .game-card, .btn-tactile, [data-voice-desc]'
      ) as HTMLElement | null;
      if (target) {
        speakElement(target);
      }
    };

    window.addEventListener("focusin", handleFocusIn);
    window.addEventListener("pointerover", handlePointerOver);

    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      window.removeEventListener("focusin", handleFocusIn);
      window.removeEventListener("pointerover", handlePointerOver);
    };
  }, [enabled, speakElement]);

  return { speakElement };
}
