"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocale } from "next-intl";
import {
  speakText,
  stopSpeaking,
  isEnabled,
  setSoundsEnabled,
  unlockAudio,
} from "@/lib/sound";

interface UseGameVoiceOptions {
  pitch?: number;
  rate?: number;
  initialMuted?: boolean;
}

export function useGameVoice(options: UseGameVoiceOptions = {}) {
  const locale = useLocale();
  const { rate = 0.82, initialMuted = false } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(() => initialMuted || !isEnabled());
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);

  const subtitleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stop currently playing speech
  const stopVoice = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  // Speak a sentence with subtitle fallback
  const speakVoice = useCallback(
    (text: string, customRate?: number) => {
      if (!text || typeof window === "undefined") return;

      unlockAudio();

      // Update visual subtitle pill
      setCurrentSubtitle(text);
      if (subtitleTimeoutRef.current) clearTimeout(subtitleTimeoutRef.current);
      subtitleTimeoutRef.current = setTimeout(() => {
        setCurrentSubtitle(null);
      }, Math.max(4000, text.length * 85));

      if (isMuted || !isEnabled()) return;

      speakText(
        text,
        locale,
        customRate ?? rate,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    },
    [locale, isMuted, rate]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next) {
        stopVoice();
        setSoundsEnabled(false);
      } else {
        setSoundsEnabled(true);
        unlockAudio();
      }
      return next;
    });
  }, [stopVoice]);

  useEffect(() => {
    return () => {
      stopVoice();
      if (subtitleTimeoutRef.current) clearTimeout(subtitleTimeoutRef.current);
    };
  }, [stopVoice]);

  return {
    speakVoice,
    stopVoice,
    isSpeaking,
    isMuted,
    toggleMute,
    currentSubtitle,
  };
}
