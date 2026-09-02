"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useLocale } from "next-intl";

interface UseGameVoiceOptions {
  pitch?: number;
  rate?: number;
  initialMuted?: boolean;
}

export function useGameVoice(options: UseGameVoiceOptions = {}) {
  const locale = useLocale();
  const { pitch = 1.0, rate = 0.82, initialMuted = false } = options;

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(initialMuted);
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);

  const subtitleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Map locale to appropriate Indian English / Regional BCP 47 language tag
  const getBcp47Lang = useCallback((loc: string): string => {
    switch (loc) {
      case "as":
        return "as-IN";
      case "hi":
        return "hi-IN";
      case "mr":
        return "mr-IN";
      case "bn":
        return "bn-IN";
      case "mni":
        return "mni-IN";
      case "ne":
        return "ne-NP";
      default:
        return "en-IN";
    }
  }, []);

  // Stop currently playing speech
  const stopVoice = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Speak a sentence with subtitle fallback
  const speakVoice = useCallback(
    (text: string, customRate?: number) => {
      if (!text || typeof window === "undefined") return;

      // Update visual subtitle pill
      setCurrentSubtitle(text);
      if (subtitleTimeoutRef.current) clearTimeout(subtitleTimeoutRef.current);
      subtitleTimeoutRef.current = setTimeout(() => {
        setCurrentSubtitle(null);
      }, Math.max(4000, text.length * 80));

      if (isMuted) return;

      if (!("speechSynthesis" in window)) {
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = getBcp47Lang(locale);
      utterance.rate = customRate ?? rate;
      utterance.pitch = pitch;

      // Attempt matching appropriate voice
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const langPrefix = getBcp47Lang(locale).split("-")[0];
        const match =
          voices.find((v) => v.lang.startsWith(langPrefix)) ||
          voices.find((v) => v.lang.includes("IN")) ||
          voices[0];
        if (match) utterance.voice = match;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [locale, isMuted, pitch, rate, getBcp47Lang]
  );

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (next && typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      return next;
    });
  }, []);

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
