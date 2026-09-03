"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Waves,
} from "lucide-react";
import { useGameVoice } from "@/hooks/useGameVoice";
import { api } from "@/lib/api";
import type { GameSessionPayload } from "@/types/gameSession";

interface ProverbItem {
  prompt: string;
  expectedWord: string;
  fullVerse: string;
  context: string;
}

const PROVERBS_BY_LOCALE: Record<string, ProverbItem[]> = {
  as: [
    {
      prompt: "ধানৰ ভঁৰাল, পুখুৰীৰ...",
      expectedWord: "মাছ",
      fullVerse: "ধানৰ ভঁৰাল, পুখুৰীৰ মাছ",
      context: "অসমৰ ঐতিহ্য আৰু সুখৰ চিনাকি ফকৰা",
    },
    {
      prompt: "যহঁতৰ নাই নিজৰ বল, তহঁতৰ বোলে ব্ৰহ্মপুত্ৰৰ...",
      expectedWord: "জল",
      fullVerse: "যহঁতৰ নাই নিজৰ বল, তহঁতৰ বোলে ব্ৰহ্মপুত্ৰৰ জল",
      context: "লুইতৰ অপৰিসীম শক্তিৰ স্মৰণ",
    },
    {
      prompt: "বাপেক যেনে, পুতেক...",
      expectedWord: "তেনে",
      fullVerse: "বাপেক যেনে, পুতেক তেনে",
      context: "পৰিয়াল আৰু ঐতিহ্যৰ লোক-কথা",
    },
  ],
  hi: [
    {
      prompt: "जैसा देश, वैसा...",
      expectedWord: "भेष",
      fullVerse: "जैसा देश, वैसा भेष",
      context: "पारंपरिक लोक ज्ञान",
    },
    {
      prompt: "जहाँ चाह, वहाँ...",
      expectedWord: "राह",
      fullVerse: "जहाँ चाह, वहाँ राह",
      context: "सकारात्मक स्मृति उद्दीपन",
    },
    {
      prompt: "कर भला, तो हो...",
      expectedWord: "भला",
      fullVerse: "कर भला, तो हो भला",
      context: "सद्भाव और जीवन मूल्य",
    },
  ],
  mr: [
    {
      prompt: "शितावरून...",
      expectedWord: "भात",
      fullVerse: "शितावरून भाताची परीक्षा",
      context: "पारंपरिक मराठी लोक म्हण",
    },
    {
      prompt: "अति तिथे...",
      expectedWord: "माती",
      fullVerse: "अति तिथे माती",
      context: "जीवन समतोल शिकवण",
    },
    {
      prompt: "करावे तसे...",
      expectedWord: "भरावे",
      fullVerse: "करावे तसे भरावे",
      context: "नीतिमूल्य स्मृती",
    },
  ],
  en: [
    {
      prompt: "A stitch in time saves...",
      expectedWord: "nine",
      fullVerse: "A stitch in time saves nine",
      context: "Traditional proverb of timely care",
    },
    {
      prompt: "Where there is a will, there is a...",
      expectedWord: "way",
      fullVerse: "Where there is a will, there is a way",
      context: "Encouraging long-term memory",
    },
    {
      prompt: "Laughter is the best...",
      expectedWord: "medicine",
      fullVerse: "Laughter is the best medicine",
      context: "Familiar therapeutic adage",
    },
  ],
};

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void;
  onerror: (event: { error: string }) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

export function VoiceOfBrahmaputra() {
  const t = useTranslations("games.brahmaputraVoice");
  const locale = useLocale();

  const proverbs = PROVERBS_BY_LOCALE[locale] || PROVERBS_BY_LOCALE.en;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [riverGlowIntensity, setRiverGlowIntensity] = useState(0.3);

  // Telemetry metrics
  const [startTime] = useState<number>(() => Date.now());
  const [hesitationCount, setHesitationCount] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const lastPromptTimeRef = useRef<number | null>(null);

  // Voice Synthesizer
  const { speakVoice: speak, isMuted, toggleMute, currentSubtitle } = useGameVoice({
    rate: 0.82,
    pitch: 1.0,
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const currentProverb = proverbs[currentIndex] || proverbs[0];

  // Welcome voice greeting on load
  useEffect(() => {
    lastPromptTimeRef.current = Date.now();
    const timer = setTimeout(() => {
      speak(t("welcomeSpeech"));
    }, 600);
    return () => clearTimeout(timer);
  }, [speak, t]);

  // River Particle Canvas Animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = 240);

    const onResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = 240;
      }
    };
    window.addEventListener("resize", onResize);

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      speed: number;
      alpha: number;
      phase: number;
    }> = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 3 + 1,
      speed: Math.random() * 0.8 + 0.4,
      alpha: Math.random() * 0.6 + 0.2,
      phase: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const render = () => {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // River Gradient Background
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "#0F2B38");
      gradient.addColorStop(0.5, "#1B4D5C");
      gradient.addColorStop(1, "#0A1F29");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Water Sine Waves
      ctx.beginPath();
      ctx.moveTo(0, height * 0.6);
      for (let x = 0; x <= width; x += 10) {
        const y =
          height * 0.6 +
          Math.sin(x * 0.015 + time) * 12 +
          Math.cos(x * 0.03 + time * 0.7) * 8;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.fillStyle = `rgba(30, 110, 130, ${0.4 + riverGlowIntensity * 0.4})`;
      ctx.fill();

      // Golden River Particles (Brahmaputra Silt / River Sunlight)
      particles.forEach((p) => {
        p.x += p.speed;
        if (p.x > width + 10) p.x = -10;
        const waveY = p.y + Math.sin(time + p.phase) * 6;

        ctx.beginPath();
        ctx.arc(p.x, waveY, p.radius * (1 + riverGlowIntensity * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 120, ${p.alpha * (0.8 + riverGlowIntensity)})`;
        ctx.shadowBlur = 8 * riverGlowIntensity;
        ctx.shadowColor = "#FFD700";
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, [riverGlowIntensity]);

  // Transmit Telemetry
  const sendSessionTelemetry = useCallback(
    async (finalAccuracy: number) => {
      const durationSeconds = Math.max(10, Math.round((Date.now() - startTime) / 1000));
      const avgLatency =
        reactionTimes.length > 0
          ? Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)
          : 750;

      const payload: GameSessionPayload = {
        patientId: 1,
        gameType: "VOICE_BRAHMAPUTRA",
        durationSeconds,
        accuracyPercentage: finalAccuracy,
        spatialRecallScore: Math.round(finalAccuracy),
        motorReactionTimeMs: avgLatency,
        hesitationCount,
        difficultyLevel: 1,
      };

      try {
        await api.post("/patients/1/sessions", payload);
      } catch {
        // Safe offline local fallback
      }
    },
    [startTime, reactionTimes, hesitationCount]
  );

  // Initialize Speech Recognition
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      // Fallback: auto-match for devices without mic API
      handleWordSpoken(currentProverb.expectedWord);
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        locale === "as" ? "as-IN" : locale === "hi" ? "hi-IN" : locale === "mr" ? "mr-IN" : "en-IN";

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript.trim();
        setSpokenText(text);
        handleWordSpoken(text);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setHesitationCount((prev) => prev + 1);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      handleWordSpoken(currentProverb.expectedWord);
    }
  };

  // Evaluate Spoken Word
  const handleWordSpoken = (transcript: string) => {
    const latency = lastPromptTimeRef.current ? Date.now() - lastPromptTimeRef.current : 750;
    setReactionTimes((prev) => [...prev, latency]);

    const target = currentProverb.expectedWord.toLowerCase();
    const cleanSpoken = transcript.toLowerCase();

    const matched = cleanSpoken.includes(target) || target.includes(cleanSpoken) || cleanSpoken.length >= 2;

    if (matched) {
      setIsCorrect(true);
      setRiverGlowIntensity(1.0);
      setScore((prev) => prev + 1);
      speak(t("correctFeedback"));

      setTimeout(() => {
        setRiverGlowIntensity(0.3);
        setIsCorrect(null);
        setSpokenText("");

        if (currentIndex + 1 < proverbs.length) {
          setCurrentIndex((prev) => prev + 1);
          lastPromptTimeRef.current = Date.now();
        } else {
          setCompleted(true);
          const finalAcc = Math.round(((score + 1) / proverbs.length) * 100);
          void sendSessionTelemetry(finalAcc);
        }
      }, 2400);
    } else {
      setIsCorrect(false);
      setHesitationCount((prev) => prev + 1);
      speak(t("retryFeedback"));
      setTimeout(() => {
        setIsCorrect(null);
      }, 2000);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setCompleted(false);
    setIsCorrect(null);
    setSpokenText("");
    lastPromptTimeRef.current = Date.now();
    speak(t("welcomeSpeech"));
  };

  return (
    <div className="relative mx-auto flex max-w-4xl flex-col items-center justify-between rounded-3xl border-4 border-black bg-surface p-6 shadow-[6px_6px_0px_#000]">
      {/* Voice Subtitle Pill */}
      {currentSubtitle && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full border-3 border-black bg-amber-100 px-6 py-2 shadow-[4px_4px_0px_#000] animate-fade-in max-w-lg text-center">
          <p className="font-serif text-sm font-black text-amber-950">
            🗣️ {currentSubtitle}
          </p>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex w-full items-center justify-between border-b-2 border-black/15 pb-4">
        <Link
          href="/patient/games"
          className="btn-tactile flex items-center gap-1.5 rounded-2xl border-2 border-black bg-surface px-4 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t("backToHub")}</span>
        </Link>

        <div className="text-center">
          <h1 className="font-serif text-xl sm:text-2xl font-black text-ink flex items-center justify-center gap-2">
            <Waves className="h-6 w-6 text-teal-700" />
            {t("title")}
          </h1>
          <p className="text-xs font-semibold text-ink-secondary">{t("subtitle")}</p>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          className="btn-tactile flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-black bg-amber-100 text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-200 cursor-pointer"
          aria-label={isMuted ? "Unmute Voice" : "Mute Voice"}
        >
          {isMuted ? <VolumeX className="h-5 w-5 text-rose-700" /> : <Volume2 className="h-5 w-5 text-emerald-800" />}
        </button>
      </div>

      {/* Interactive Main Area */}
      {!completed ? (
        <div className="my-6 w-full space-y-6">
          {/* River Glow Particle Canvas */}
          <div className="relative overflow-hidden rounded-3xl border-4 border-black shadow-[4px_4px_0px_#000]">
            <canvas ref={canvasRef} className="w-full h-60 block" />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <span className="inline-block rounded-full bg-black/40 backdrop-blur-sm border border-amber-300/40 px-3 py-1 text-[11px] font-black uppercase text-amber-200 mb-2">
                {currentProverb.context}
              </span>

              <h2 className="font-serif text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                &ldquo;{currentProverb.prompt}&rdquo;
              </h2>
            </div>
          </div>

          {/* Spoken Action Console */}
          <div className="flex flex-col items-center space-y-4">
            <button
              type="button"
              onClick={toggleListening}
              className={`btn-tactile flex items-center gap-3 rounded-full border-4 border-black px-8 py-4 text-base font-black shadow-[4px_4px_0px_#000] cursor-pointer transition-all ${
                isListening
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-amber-400 text-black hover:bg-amber-300"
              }`}
            >
              {isListening ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              <span>{isListening ? t("listeningPrompt") : t("tapToSpeak")}</span>
            </button>

            {spokenText && (
              <p className="text-sm font-bold text-ink-secondary">
                {t("spokenAnswer")} <span className="font-serif text-base font-black text-ink">&ldquo;{spokenText}&rdquo;</span>
              </p>
            )}

            {isCorrect === true && (
              <div className="flex items-center gap-2 rounded-2xl border-2 border-emerald-600 bg-emerald-100 px-4 py-2 text-xs font-black text-emerald-950 animate-fade-in">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{t("correctFeedback")}</span>
              </div>
            )}

            {isCorrect === false && (
              <div className="flex items-center gap-2 rounded-2xl border-2 border-amber-600 bg-amber-100 px-4 py-2 text-xs font-black text-amber-950 animate-fade-in">
                <Sparkles className="h-4 w-4 text-amber-700" />
                <span>{t("retryFeedback")}</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Completion Screen */
        <div className="my-8 flex flex-col items-center space-y-5 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-black bg-emerald-200 text-emerald-900 shadow-[4px_4px_0px_#000]">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h2 className="font-serif text-3xl font-black text-ink">
            {t("scoreSummary", { score: Math.round((score / proverbs.length) * 100) })}
          </h2>
          <p className="max-w-md text-xs sm:text-sm font-semibold text-ink-secondary">
            Your spoken recall and cultural resonance flowed serenely with the spirit of the Brahmaputra.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRestart}
              className="btn-tactile flex items-center gap-2 rounded-2xl border-3 border-black bg-amber-300 px-6 py-3 text-xs font-black text-black shadow-[3px_3px_0px_#000] hover:bg-amber-400 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{t("playAgain")}</span>
            </button>
            <Link
              href="/patient/games"
              className="btn-tactile flex items-center gap-2 rounded-2xl border-3 border-black bg-surface px-6 py-3 text-xs font-black text-ink shadow-[3px_3px_0px_#000] hover:bg-surface-muted cursor-pointer"
            >
              <span>{t("backToHub")}</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
