"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  Music,
  MessageSquare,
  Leaf,
  Sparkles,
  Activity,
  Zap,
} from "lucide-react";
import { BihuDholIcon } from "@/components/ui/CulturalIcons";
import { GameHeader } from "@/components/layout/GameHeader";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { useGameVoice } from "@/hooks/useGameVoice";
import { submitGameSessionTelemetry } from "@/lib/gameTelemetry";
import { useAuthStore } from "@/store/useAuthStore";
import { playComplete, playLifeSong, playDholBeat, unlockAudio } from "@/lib/sound";

interface BihuDholStrings {
  proprioceptionVerified: string;
  points: (p: number) => string;
  adaptiveTempoSettled: string;
  restingPulse: (bpm: number) => string;
  beatsEntrained: string;
  pulsesRatio: (c: number, t: number) => string;
  playFlute: string;
  calmGrounding: string;
  unmute: string;
  mute: string;
  beatsRatio: (c: number, t: number) => string;
  rhythmCycle: (t: number) => string;
  streakSync: (s: number) => string;
  beatNumber: (n: number) => string;
  tapInRhythm: string;
  tapToStart: string;
  tempoLabel: string;
  tempoCalm: string;
  tempoStandard: string;
  tempoLively: string;
  tempoAdaptive: string;
  groundingRhythm: string;
  dismiss: string;
  calmSensory: string;
}

const BIHU_DHOL_I18N: Record<string, BihuDholStrings> = {
  en: {
    proprioceptionVerified: "Proprioception & Rhythm Entrainment",
    points: (p) => `+${p} Points`,
    adaptiveTempoSettled: "Adaptive Tempo Settled:",
    restingPulse: (bpm) => `${bpm} BPM (Resting Pulse)`,
    beatsEntrained: "Beats Entrained:",
    pulsesRatio: (c, t) => `${c} / ${t} Pulses`,
    playFlute: "Play Bihu Flute Tune",
    calmGrounding: "Calm Grounding",
    unmute: "Unmute Voice",
    mute: "Mute Voice",
    beatsRatio: (c, t) => `${c} / ${t} Beats`,
    rhythmCycle: (t) => `Rhythm Cycle (${t} Pulses):`,
    streakSync: (s) => `${s} Beats In Sync!`,
    beatNumber: (n) => `Beat ${n}`,
    tapInRhythm: "Tap In Rhythm",
    tapToStart: "Tap to Start",
    tempoLabel: "Tempo:",
    tempoCalm: "Calm 46 BPM",
    tempoStandard: "Festive 55 BPM",
    tempoLively: "Lively 65 BPM",
    tempoAdaptive: "Adaptive",
    groundingRhythm: "Grounding Rhythm: Breathe gently and tap naturally with each dhol beat.",
    dismiss: "Dismiss",
    calmSensory: "Calm Sensory Entrainment:",
  },
  as: {
    proprioceptionVerified: "স্নায়ৱিক অনুভূতি আৰু তাল সমন্বয় প্ৰমাণিত",
    points: (p) => `+${p} নম্বৰ`,
    adaptiveTempoSettled: "স্থিৰ হোৱা ছন্দৰ গতি:",
    restingPulse: (bpm) => `${bpm} BPM (শান্ত হৃদস্পন্দন)`,
    beatsEntrained: "সমন্বিত ঢোলৰ কোব:",
    pulsesRatio: (c, t) => `${c} / ${t} স্পন্দন`,
    playFlute: "বিহু পেঁপা/বাঁহীৰ সুৰ শুনাওক",
    calmGrounding: "মনৰ স্থিৰতা",
    unmute: "শব্দ শুনক",
    mute: "শব্দ বন্ধ কৰক",
    beatsRatio: (c, t) => `${c} / ${t} কোব`,
    rhythmCycle: (t) => `তালৰ চক্ৰ (${t} স্পন্দন):`,
    streakSync: (s) => `${s} টা কোব নিখুঁত সমলয়ত!`,
    beatNumber: (n) => `কোব ${n}`,
    tapInRhythm: "তালত আঙুলি বুলাওক",
    tapToStart: "আৰম্ভ কৰিবলৈ স্পৰ্শ কৰক",
    tempoLabel: "ছন্দৰ গতি:",
    tempoCalm: "শান্ত ৪৬ BPM",
    tempoStandard: "উৎসৱী ৫৫ BPM",
    tempoLively: "চঞ্চল ৬৫ BPM",
    tempoAdaptive: "স্বয়ংক্ৰিয় অনুকূল",
    groundingRhythm: "শান্ত ছন্দ: শান্তভাৱে উশাহ লওক আৰু প্ৰতিটো ঢোলৰ কোবত স্বাভাৱিকভাৱে স্পৰ্শ কৰক।",
    dismiss: "বাতিল কৰক",
    calmSensory: "শান্ত ইন্দ্ৰিয় উদ্দীপন:",
  },
  hi: {
    proprioceptionVerified: "गतिक संवेदन व ताल समन्वय सत्यापित",
    points: (p) => `+${p} अंक`,
    adaptiveTempoSettled: "स्थिर गति दर:",
    restingPulse: (bpm) => `${bpm} BPM (शांत नाड़ी दर)`,
    beatsEntrained: "समन्वित ताल थाप:",
    pulsesRatio: (c, t) => `${c} / ${t} स्पंदन`,
    playFlute: "बिहू बांसुरी की धुन बजाएं",
    calmGrounding: "शांत स्थिरता",
    unmute: "आवाज़ चालू करें",
    mute: "आवाज़ बंद करें",
    beatsRatio: (c, t) => `${c} / ${t} थाप`,
    rhythmCycle: (t) => `ताल चक्र (${t} स्पंदन):`,
    streakSync: (s) => `${s} थाप सटीक ताल में!`,
    beatNumber: (n) => `थाप ${n}`,
    tapInRhythm: "ताल पर थपथपाएं",
    tapToStart: "शुरू करने के लिए स्पर्श करें",
    tempoLabel: "ताल गति:",
    tempoCalm: "शांत 46 BPM",
    tempoStandard: "उत्सवी 55 BPM",
    tempoLively: "उमंग 65 BPM",
    tempoAdaptive: "अनुकूलनीय",
    groundingRhythm: "स्थिरता ताल: धीरे-धीरे सांस लें और प्रत्येक ढोल की थाप पर सहज रूप से स्पर्श करें।",
    dismiss: "हटाएं",
    calmSensory: "शांत संवेदी समन्वय:",
  },
  bn: {
    proprioceptionVerified: "শারীরিক অনুভূতি ও ছন্দ সমন্বয় যাচাইকৃত",
    points: (p) => `+${p} পয়েন্ট`,
    adaptiveTempoSettled: "স্থির হওয়া ছন্দ:",
    restingPulse: (bpm) => `${bpm} BPM (শান্ত স্পন্দন)`,
    beatsEntrained: "সমন্বিত ঢোলের তাল:",
    pulsesRatio: (c, t) => `${c} / ${t} স্পন্দন`,
    playFlute: "বিহু বাঁশির সুর বাজান",
    calmGrounding: "মন শান্ত রাখা",
    unmute: "শব্দ চালু",
    mute: "শব্দ বন্ধ",
    beatsRatio: (c, t) => `${c} / ${t} তাল`,
    rhythmCycle: (t) => `ছন্দ চক্র (${t} স্পন্দন):`,
    streakSync: (s) => `${s} টি তাল নিখুঁত মিল!`,
    beatNumber: (n) => `তাল ${n}`,
    tapInRhythm: "তালে তালে ট্যাপ করুন",
    tapToStart: "শুরু করতে স্পর্শ করুন",
    tempoLabel: "ছন্দের গতি:",
    tempoCalm: "শান্ত ৪৬ BPM",
    tempoStandard: "উৎসবমুখর ৫৫ BPM",
    tempoLively: "প্রাণবন্ত ৬৫ BPM",
    tempoAdaptive: "অনুকূলিত",
    groundingRhythm: "শান্ত ছন্দ: ধীরে ধীরে শ্বাস নিন এবং প্রতিটি ঢোলের বোলে সহজে ট্যাপ করুন।",
    dismiss: "মুছে ফেলুন",
    calmSensory: "শান্ত সংবেদনশীল চর্চা:",
  },
  mr: {
    proprioceptionVerified: "शारीरिक जाणीव व ताल सुसंवाद प्रमाणित",
    points: (p) => `+${p} गुण`,
    adaptiveTempoSettled: "स्थिर झालेला ताल वेग:",
    restingPulse: (bpm) => `${bpm} BPM (शांत नाडी)`,
    beatsEntrained: "समन्वित ढोल ठोके:",
    pulsesRatio: (c, t) => `${c} / ${t} ठोके`,
    playFlute: "बिहू बासरी धून ऐका",
    calmGrounding: "शांत स्थिरता",
    unmute: "आवाज सुरू",
    mute: "आवाज बंद",
    beatsRatio: (c, t) => `${c} / ${t} ठोके`,
    rhythmCycle: (t) => `ताल चक्र (${t} ठोके):`,
    streakSync: (s) => `${s} ठोके परिपूर्ण तालात!`,
    beatNumber: (n) => `ठोका ${n}`,
    tapInRhythm: "तालावर टॅप करा",
    tapToStart: "सुरू करण्यासाठी स्पर्श करा",
    tempoLabel: "ताल गती:",
    tempoCalm: "शांत ४६ BPM",
    tempoStandard: "उत्सवी ५५ BPM",
    tempoLively: "उत्साही ६५ BPM",
    tempoAdaptive: "अनुकूल",
    groundingRhythm: "शांत लय: हळुवार श्वास घ्या आणि प्रत्येक ढोलाच्या तालावर सहज टॅप करा.",
    dismiss: "बंद करा",
    calmSensory: "शांत संवेदी सुसंवाद:",
  },
  ne: {
    proprioceptionVerified: "शारीरिक सन्तुलन र लय समन्वय प्रमाणित",
    points: (p) => `+${p} अंक`,
    adaptiveTempoSettled: "स्थिर भएको गति:",
    restingPulse: (bpm) => `${bpm} BPM (शान्त नाडी)`,
    beatsEntrained: "समन्वित ढोल ताल:",
    pulsesRatio: (c, t) => `${c} / ${t} स्पन्दन`,
    playFlute: "बिहू बाँसुरी धुन बजाउनुहोस्",
    calmGrounding: "शान्त स्थिरता",
    unmute: "आवाज खोल्नुहोस्",
    mute: "आवाज बन्द गर्नुहोस्",
    beatsRatio: (c, t) => `${c} / ${t} ताल`,
    rhythmCycle: (t) => `ताल चक्र (${t} स्पन्दन):`,
    streakSync: (s) => `${s} ताल ठ्याक्कै मिल्यो!`,
    beatNumber: (n) => `ताल ${n}`,
    tapInRhythm: "लयमा ट्याप गर्नुहोस्",
    tapToStart: "सुरु गर्न छुनुहोस्",
    tempoLabel: "लय गति:",
    tempoCalm: "शान्त ४६ BPM",
    tempoStandard: "चाडपर्व ५५ BPM",
    tempoLively: "उत्साही ६५ BPM",
    tempoAdaptive: "अनुकूलन",
    groundingRhythm: "शान्त लय: बिस्तारै सास फेर्नुहोस् र प्रत्येक ढोलको तालमा सहजै ट्याप गर्नुहोस्।",
    dismiss: "हटाउनुहोस्",
    calmSensory: "शान्त संवेदी समन्वय:",
  },
  mni: {
    proprioceptionVerified: "হকচাংগী ৱাখল অমসুং তান শম্নবা য়েংশিল্লবা",
    points: (p) => `+${p} পোইন্ট`,
    adaptiveTempoSettled: "লেপ্লিবা তানগী খোঙজেল:",
    restingPulse: (bpm) => `${bpm} BPM (শান্ত ওইবা থম্মোয় কাখল)`,
    beatsEntrained: "শম্নরবা ধোল খোন্থোক:",
    pulsesRatio: (c, t) => `${c} / ${t} স্পন্দন`,
    playFlute: "বিহু বাঁশীগী সুর তাউ",
    calmGrounding: "ৱাখল তোংবা",
    unmute: "খোন্থোক থোকহল্লু",
    mute: "খোন্থোক লেপ্পু",
    beatsRatio: (c, t) => `${c} / ${t} তান`,
    rhythmCycle: (t) => `তানগী খোঙচৎ (${t} স্পন্দন):`,
    streakSync: (s) => `${s} তান চুননা য়ারে!`,
    beatNumber: (n) => `তান ${n}`,
    tapInRhythm: "তানদা চিংশিল্লু",
    tapToStart: "হৌনবা থম্মু",
    tempoLabel: "তানগী খোঙজেল:",
    tempoCalm: "শান্ত ৪৬ BPM",
    tempoStandard: "কুহ্মৈ ৫৫ BPM",
    tempoLively: "হরাওবা ৬৫ BPM",
    tempoAdaptive: "মশানা চুনবা",
    groundingRhythm: "শান্ত ওইবা তান: তপ্না শ্বাশ লৌউ অমসুং ধোলগী তান খুদিংদা তপ্না চিংশিল্লু।",
    dismiss: "লৌথোকউ",
    calmSensory: "শান্ত সংবেদনশীল শক্তি:",
  },
  brx: {
    proprioceptionVerified: "मोदोमनि सोदोब आरो तालनि फोनांजामुं जाबाय",
    points: (p) => `+${p} नम्बर`,
    adaptiveTempoSettled: "थाद'नाय तालनि गोख्रैथि:",
    restingPulse: (bpm) => `${bpm} BPM (गोजोन बिखा सोदोब)`,
    beatsEntrained: "फोनांजाबनाय ढोलनि सोदोब:",
    pulsesRatio: (c, t) => `${c} / ${t} स्पन्दन`,
    playFlute: "बिहु सिफुं सुर दाम",
    calmGrounding: "गोसो गोजोन होनाय",
    unmute: "राव खोनासंनाय",
    mute: "राव बन्द",
    beatsRatio: (c, t) => `${c} / ${t} सोदोब`,
    rhythmCycle: (t) => `ताल सोदोब चक्र (${t} स्पन्दन):`,
    streakSync: (s) => `${s} सोदोब गोजोनै मिलिबाय!`,
    beatNumber: (n) => `सोदोब ${n}`,
    tapInRhythm: "तालाव थु",
    tapToStart: "जागायनो दां",
    tempoLabel: "ताल गोख्रैथि:",
    tempoCalm: "गोजोन ४६ BPM",
    tempoStandard: "फोसावनाय ५५ BPM",
    tempoLively: "रंजानाय ৬৫ BPM",
    tempoAdaptive: "गावआरि गोरोबनाय",
    groundingRhythm: "गोजोन ताल: लिरै हासा ला आरो गासै ढोल सोदोबाव सरासनस्रायै थु।",
    dismiss: "गार",
    calmSensory: "गोजोन मोन्दांथि गोरोबथि:",
  },
  grt: {
    proprioceptionVerified: "Be·en u·iani aro git dokani kakket ong·a",
    points: (p) => `+${p} Point-rang`,
    adaptiveTempoSettled: "Kakket ong·gipa tempo:",
    restingPulse: (bpm) => `${bpm} BPM (Ka·dongani ka·tong moa)`,
    beatsEntrained: "Dambolo Dambok Doka:",
    pulsesRatio: (c, t) => `${c} / ${t} Dokarang`,
    playFlute: "Bihu Bangsi Git Ringo Dokbo",
    calmGrounding: "Tomi Tomi Gisik Donani",
    unmute: "Ku·rang Khnaatbo",
    mute: "Ku·rang Dingtangatbo",
    beatsRatio: (c, t) => `${c} / ${t} Dokarang`,
    rhythmCycle: (t) => `Gitani Rolo (${t} Dokarang):`,
    streakSync: (s) => `${s} Dokarang Kakket Ringo!`,
    beatNumber: (n) => `Doka ${n}`,
    tapInRhythm: "Ringo Jaksichi Dokbo",
    tapToStart: "A·bachengna Nang·atbo",
    tempoLabel: "Tempo:",
    tempoCalm: "Tomi Tomi 46 BPM",
    tempoStandard: "A·alani 55 BPM",
    tempoLively: "Katchaani 65 BPM",
    tempoAdaptive: "Adaptive",
    groundingRhythm: "Gisik tomi dokani: Rang·sit tomi donbo aro dambok doka gita jaksichi nang·atbo.",
    dismiss: "Gimaatbo",
    calmSensory: "Tomi Git Moani:",
  },
  kha: {
    proprioceptionVerified: "Ka Jingtip Met bad ka Sur Ksing La Pynshisha",
    points: (p) => `+${p} Point`,
    adaptiveTempoSettled: "Ka Jingstet Sur ba la pynskhem:",
    restingPulse: (bpm) => `${bpm} BPM (Sur Klongsnam ba Jem)`,
    beatsEntrained: "Ki jingtem ksing ba la iada:",
    pulsesRatio: (c, t) => `${c} / ${t} Jingkyntiew`,
    playFlute: "Tem Sur Besli Bihu",
    calmGrounding: "Ka Jingpynjem Jingmut",
    unmute: "Plie Sur",
    mute: "Kylliang Sur",
    beatsRatio: (c, t) => `${c} / ${t} Jingshon`,
    rhythmCycle: (t) => `Tawiar Sur (${t} Jingshon):`,
    streakSync: (s) => `${s} Jingshon ba biang pura!`,
    beatNumber: (n) => `Jingshon ${n}`,
    tapInRhythm: "Shon ryngkat ka Sur",
    tapToStart: "Ktah ban Sdang",
    tempoLabel: "Ka Jingstet:",
    tempoCalm: "Jem 46 BPM",
    tempoStandard: "Lehkmen 55 BPM",
    tempoLively: "Kmen bha 65 BPM",
    tempoAdaptive: "Adaptive",
    groundingRhythm: "Sur Jem: Ring mynsiem jem nud bad shon ha man la ka jingshon ksing.",
    dismiss: "Wad noh",
    calmSensory: "Jingiada Sur ba Jem:",
  },
  lus: {
    proprioceptionVerified: "Taksa Hriatna leh Khuang Vuak Rem Fiah a ni",
    points: (p) => `+${p} Points`,
    adaptiveTempoSettled: "Khuang Vuak Rang Chin:",
    restingPulse: (bpm) => `${bpm} BPM (Lungphu Dam Chi)`,
    beatsEntrained: "Khuang Vuak Mil:",
    pulsesRatio: (c, t) => `${c} / ${t} Vuak`,
    playFlute: "Bihu Rawchham Hla Ti-ri rawh",
    calmGrounding: "Thlamuanna",
    unmute: "Aw ti-chhuak rawh",
    mute: "Aw ti-tawp rawh",
    beatsRatio: (c, t) => `${c} / ${t} Vuak`,
    rhythmCycle: (t) => `Khuang Vuak Kalhmang (${t} Vuak):`,
    streakSync: (s) => `${s} Vuak Mil Thlap!`,
    beatNumber: (n) => `Vuak ${n}`,
    tapInRhythm: "Rimawi milin hmet rawh",
    tapToStart: "Tan nan hmet rawh",
    tempoLabel: "Ran Zawng:",
    tempoCalm: "Dam Chi 46 BPM",
    tempoStandard: "Kut Hlimawm 55 BPM",
    tempoLively: "Phurawm 65 BPM",
    tempoAdaptive: "Inrem Rem",
    groundingRhythm: "Thlamuanna Rimawi: Thawk la vang vang la, khuang vuak tinah nem takin hmet rawh.",
    dismiss: "Tibia rawh",
    calmSensory: "Hriatna Tidamna:",
  },
};

export function BihuDholBeats() {
  const t = useTranslations("games.bihuDhol");
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const m = BIHU_DHOL_I18N[normLoc] || BIHU_DHOL_I18N.en;

  const patient = useAuthStore((s) => s.patient);
  const patientId = patient?.id ?? 0;

  const { speakVoice, stopVoice, isMuted, toggleMute, currentSubtitle } = useGameVoice();

  const [bpm, setBpm] = useState(55); // Calming resting tempo
  const [tempoMode, setTempoMode] = useState<"calm" | "standard" | "lively" | "adaptive">("standard");
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatIndex, setBeatIndex] = useState(0);
  const [targetBeats] = useState(16);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [beatHits, setBeatHits] = useState<Array<"perfect" | "gentle" | "miss">>([]);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [breathingGuide, setBreathingGuide] = useState(true);
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Telemetry references
  const startTimeRef = useRef<number>(0);
  const lastBeatTimeRef = useRef<number>(0);
  const tapLatenciesRef = useRef<number[]>([]);
  const tapIntervalsRef = useRef<number[]>([]);
  const lastTapTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Set tempo preset
  const handleTempoPreset = (mode: "calm" | "standard" | "lively" | "adaptive") => {
    setTempoMode(mode);
    if (mode === "calm") setBpm(46);
    else if (mode === "standard") setBpm(55);
    else if (mode === "lively") setBpm(65);
  };

  // Synthesize traditional Assamese Dhol Hand-Drum Acoustic Pulse
  const triggerDholSound = useCallback((accent = false) => {
    unlockAudio();
    playDholBeat(accent);
  }, []);

  // Metronome Pulse Loop
  useEffect(() => {
    if (!isPlaying || isFinished) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = (60 / bpm) * 1000;
    timerRef.current = setInterval(() => {
      setBeatIndex((idx) => {
        const next = idx + 1;
        lastBeatTimeRef.current = Date.now();
        triggerDholSound(next % 4 === 0);

        // Add automated visual pulse ripple
        setRipples((prev) => [
          ...prev.slice(-4),
          { id: Date.now(), x: 50, y: 50 },
        ]);

        if (next >= targetBeats) {
          setIsPlaying(false);
          setIsFinished(true);
          playComplete();

          // Submit Session Telemetry
          const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
          const avgLatency =
            tapLatenciesRef.current.length > 0
              ? tapLatenciesRef.current.reduce((a, b) => a + b, 0) /
                tapLatenciesRef.current.length
              : 220;

          void submitGameSessionTelemetry({
            patientId,
            gameType: "BIHU_DHOL",
            durationSeconds: duration,
            accuracyPercentage: Math.min(100, Math.round((score / (targetBeats * 20)) * 100)),
            motorReactionTimeMs: Math.round(avgLatency),
            hesitationCount: Math.max(0, targetBeats - tapLatenciesRef.current.length),
            difficultyLevel: 1,
          });

          speakVoice(t("calmSubtitle"));
        }
        return next;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, bpm, isFinished, targetBeats, triggerDholSound, score, patientId, speakVoice, t]);

  // Initial welcome speech and timer baseline
  useEffect(() => {
    startTimeRef.current = Date.now();
    lastBeatTimeRef.current = Date.now();
    lastTapTimeRef.current = Date.now();

    speakVoice(
      locale === "as"
        ? "বিহু ঢোলৰ তাললৈ স্বাগতম। ঢোলৰ তালে তালে পৰ্দাত লাহেকৈ স্পৰ্শ কৰক।"
        : locale === "hi"
        ? "बिहू ढोल ताल में आपका स्वागत है। ढोल की आवाज़ के साथ स्क्रीन पर धीरे से स्पर्श करें।"
        : "Welcome to Bihu Dhol Beats. Tap the drum in rhythm with the soothing Assamese beat."
    );
    return () => {
      stopVoice();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [locale, speakVoice, stopVoice]);

  // Handle Player Drum Tap
  const handleDrumTap = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    if (isFinished) return;

    if (!isPlaying) {
      setIsPlaying(true);
      startTimeRef.current = Date.now();
    }

    const now = Date.now();
    const intervalFromLastTap = now - lastTapTimeRef.current;
    lastTapTimeRef.current = now;

    // Measure deviation from nearest metronome beat
    const beatInterval = (60 / bpm) * 1000;
    const timeSinceLastBeat = now - lastBeatTimeRef.current;
    const timeToNextBeat = beatInterval - timeSinceLastBeat;
    const offset = Math.min(timeSinceLastBeat, timeToNextBeat);

    tapLatenciesRef.current.push(offset);
    tapIntervalsRef.current.push(intervalFromLastTap);

    // Adaptive Pacing if enabled
    if (tempoMode === "adaptive") {
      if (intervalFromLastTap > beatInterval * 1.35 && bpm > 44) {
        setBpm((b) => Math.max(44, b - 3));
      } else if (offset < 100 && bpm < 65) {
        setBpm((b) => Math.min(65, b + 1));
      }
    }

    triggerDholSound(true);

    // Coordinate ripple on click position
    const rect = e.currentTarget.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    setRipples((prev) => [...prev.slice(-6), { id: now, x, y }]);

    // Rhythmic scoring and streak tracking without harsh penalties
    if (offset < 180) {
      setScore((s) => s + 25);
      setStreak((st) => st + 1);
      setBeatHits((prev) => [...prev.slice(-15), "perfect"]);
      setFeedbackText(streak >= 2 ? `${streak + 1} in Rhythm!` : t("goodRhythm"));
    } else {
      setScore((s) => s + 10);
      setStreak(0);
      setBeatHits((prev) => [...prev.slice(-15), "gentle"]);
      setFeedbackText(t("gentleTouch"));
    }
  };

  const restartSession = () => {
    setBeatIndex(0);
    setScore(0);
    setStreak(0);
    setBeatHits([]);
    setBpm(tempoMode === "calm" ? 46 : tempoMode === "lively" ? 65 : 55);
    setIsFinished(false);
    setIsPlaying(true);
    startTimeRef.current = Date.now();
    lastBeatTimeRef.current = Date.now();
    tapLatenciesRef.current = [];
    speakVoice(t("tapPrompt"));
  };

  return (
    <section className="min-h-screen bg-[#FAF6F0] pb-12 select-none">
      <GameHeader
        title={t("title")}
        score={score}
        backHref="/patient/games"
        bgColor="bg-[#78350F]"
      />

      <div className="mx-auto max-w-xl px-4 pt-4">
        {/* Visual Subtitle Pill Fallback */}
        {currentSubtitle && (
          <div className="mb-4 flex items-center justify-center animate-fade-in">
            <span className="rounded-full border-2 border-amber-900/40 bg-amber-100 px-4 py-1.5 text-xs font-black text-amber-950 shadow-sm inline-flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-amber-900" />
              <span>{currentSubtitle}</span>
            </span>
          </div>
        )}

        {isFinished ? (
          <Celebration
            title={t("calmComplete")}
            subtitle={t("calmSubtitle")}
            xpEarned={120}
            accuracy={`${Math.min(100, Math.round((score / (targetBeats * 20)) * 100))}%`}
          >
            <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 text-left">
              <div className="w-full rounded-3xl border-4 border-black bg-[#FAF5EE] p-5 shadow-[6px_6px_0px_#000]">
                <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-3">
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {m.proprioceptionVerified}
                  </span>
                  <span className="rounded bg-amber-200 px-2.5 py-0.5 text-xs font-black text-amber-950 border border-amber-900/30">
                    {m.points(score)}
                  </span>
                </div>

                <div className="space-y-2 text-xs font-bold text-ink">
                  <div className="flex items-center justify-between">
                    <span>{m.adaptiveTempoSettled}</span>
                    <span className="font-black text-amber-800">{m.restingPulse(bpm)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{m.beatsEntrained}</span>
                    <span className="font-black text-emerald-700">
                      {m.pulsesRatio(targetBeats, targetBeats)}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t-2 border-black/10 pt-3">
                  <button
                    type="button"
                    onClick={() => playLifeSong()}
                    className="group flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-200 px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer hover:bg-amber-300"
                  >
                    <Music className="h-4 w-4" />
                    <span>{m.playFlute}</span>
                  </button>
                  <span className="text-[11px] font-black text-ink-secondary">
                    {m.calmGrounding}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                <ChunkyButton variant="tea" size="xl" onClick={restartSession}>
                  <span className="flex items-center gap-1.5">
                    <RotateCcw className="h-5 w-5" /> {t("playAgain")}
                  </span>
                </ChunkyButton>
                <Link
                  href="/patient/games"
                  className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-surface px-5 py-3 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted"
                >
                  {t("backToHub")}
                </Link>
              </div>
            </div>
          </Celebration>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {/* Top Navigation HUD */}
            <div className="flex w-full items-center justify-between rounded-2xl border-3 border-black bg-[#FAF3E0] px-4 py-3 shadow-[3px_3px_0px_#000]">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-amber-400 text-amber-950 font-black">
                  <BihuDholIcon className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase text-ink-secondary">
                    {t("title")}
                  </span>
                  <div className="text-xs sm:text-sm font-black text-ink">
                    {bpm} BPM • {tempoMode === "calm" ? m.tempoCalm : tempoMode === "standard" ? m.tempoStandard : tempoMode === "lively" ? m.tempoLively : m.tempoAdaptive}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="btn-tactile flex items-center gap-1 rounded-xl border-2 border-black bg-surface px-2.5 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
                  title={isMuted ? m.unmute : m.mute}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-rose-600" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-emerald-600" />
                  )}
                </button>

                <div className="rounded-xl border-2 border-black bg-amber-100 px-3 py-1 text-xs font-black text-amber-950">
                  {m.beatsRatio(beatIndex, targetBeats)}
                </div>
              </div>
            </div>

            {/* 16-Beat Visual Entrainment Track */}
            <div className="w-full rounded-2xl border-2 border-black/20 bg-surface p-3 shadow-xs">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-ink-secondary mb-2">
                <span>{m.rhythmCycle(targetBeats)}</span>
                {streak >= 2 && (
                  <span className="text-emerald-700 font-black flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> {m.streakSync(streak)}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-16 gap-1 sm:gap-1.5">
                {Array.from({ length: targetBeats }).map((_, idx) => {
                  const isPast = idx < beatIndex;
                  const isCurrent = idx === beatIndex - 1;
                  const hitType = beatHits[idx];
                  return (
                    <div
                      key={idx}
                      className={`h-4 sm:h-5 rounded-md border border-black transition-all flex items-center justify-center ${
                        isCurrent
                          ? "bg-amber-400 scale-110 shadow-sm border-2 animate-pulse"
                          : isPast
                          ? hitType === "perfect"
                            ? "bg-emerald-500"
                            : "bg-amber-200"
                          : "bg-black/5"
                      }`}
                      title={m.beatNumber(idx + 1)}
                    />
                  );
                })}
              </div>
            </div>

            {/* Main Interactive Dhol Drum Target */}
            <div
              onClick={handleDrumTap}
              onTouchStart={handleDrumTap}
              className="group relative flex aspect-square w-full max-w-xs items-center justify-center rounded-full border-8 border-[#78350F] bg-gradient-to-b from-[#FFFDF9] via-[#FAF5EE] to-[#E6CCB2] p-6 shadow-[8px_8px_0px_#3E1F0F] cursor-pointer active:scale-95 transition-transform overflow-hidden"
              style={{
                boxShadow: "0 0 0 6px #B45309, 8px 8px 0px #3E1F0F",
              }}
            >
              {/* Assamese Gamosa Woven Red Border Texture */}
              <div
                className="absolute inset-0 rounded-full border-8 border-dashed border-red-600/60 pointer-events-none opacity-80"
                style={{
                  borderSpacing: "8px",
                }}
              />

              {/* Visual Rhythm Metronome Pulse Ring */}
              {isPlaying && (
                <div
                  className="absolute inset-4 rounded-full border-4 border-amber-400/50 pointer-events-none animate-ping opacity-30"
                  style={{
                    animationDuration: `${(60 / bpm) * 1000}ms`,
                  }}
                />
              )}

              {/* Concentric Beat Ripples */}
              {ripples.map((rip) => (
                <span
                  key={rip.id}
                  style={{
                    left: `${rip.x}%`,
                    top: `${rip.y}%`,
                  }}
                  className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full bg-amber-400/50 animate-ping"
                />
              ))}

              {/* Center Drum Head Emblem */}
              <div className="relative z-10 flex flex-col items-center justify-center text-center">
                <span className="drop-shadow-md group-hover:scale-110 transition-transform text-amber-950">
                  <BihuDholIcon className="w-16 h-16 sm:w-20 sm:h-20" />
                </span>
                <span className="mt-2 text-xs font-black text-amber-950 uppercase tracking-wider bg-amber-200/90 px-3.5 py-1 rounded-full border-2 border-amber-900/40 shadow-xs">
                  {isPlaying ? m.tapInRhythm : m.tapToStart}
                </span>

                {feedbackText && (
                  <span className="mt-2 text-xs font-black text-emerald-800 animate-bounce">
                    {feedbackText}
                  </span>
                )}
              </div>
            </div>

            {/* Tempo Presets Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 w-full">
              <span className="text-[10px] font-black uppercase text-ink-secondary mr-1">
                {m.tempoLabel}
              </span>
              <button
                type="button"
                onClick={() => handleTempoPreset("calm")}
                className={`btn-tactile rounded-xl border-2 border-black px-3 py-1.5 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  tempoMode === "calm"
                    ? "bg-teal-700 text-white shadow-[2px_2px_0px_#000]"
                    : "bg-surface text-ink hover:bg-surface-muted"
                }`}
              >
                <Leaf className="h-3.5 w-3.5" />
                <span>{m.tempoCalm}</span>
              </button>
              <button
                type="button"
                onClick={() => handleTempoPreset("standard")}
                className={`btn-tactile rounded-xl border-2 border-black px-3 py-1.5 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  tempoMode === "standard"
                    ? "bg-amber-600 text-white shadow-[2px_2px_0px_#000]"
                    : "bg-surface text-ink hover:bg-surface-muted"
                }`}
              >
                <Music className="h-3.5 w-3.5" />
                <span>{m.tempoStandard}</span>
              </button>
              <button
                type="button"
                onClick={() => handleTempoPreset("lively")}
                className={`btn-tactile rounded-xl border-2 border-black px-3 py-1.5 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  tempoMode === "lively"
                    ? "bg-rose-700 text-white shadow-[2px_2px_0px_#000]"
                    : "bg-surface text-ink hover:bg-surface-muted"
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>{m.tempoLively}</span>
              </button>
              <button
                type="button"
                onClick={() => handleTempoPreset("adaptive")}
                className={`btn-tactile rounded-xl border-2 border-black px-3 py-1.5 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                  tempoMode === "adaptive"
                    ? "bg-purple-700 text-white shadow-[2px_2px_0px_#000]"
                    : "bg-surface text-ink hover:bg-surface-muted"
                }`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{m.tempoAdaptive}</span>
              </button>
            </div>

            {/* Grounding Respiration Guide */}
            {breathingGuide && (
              <div className="flex w-full items-center justify-between rounded-2xl border-2 border-black/20 bg-amber-50 px-4 py-2.5 text-xs text-amber-950 shadow-xs">
                <div className="flex items-center gap-2">
                  <Leaf className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span className="font-bold">
                    {m.groundingRhythm}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setBreathingGuide(false)}
                  className="text-[10px] font-black uppercase text-amber-900/60 hover:text-amber-950 cursor-pointer"
                >
                  {m.dismiss}
                </button>
              </div>
            )}

            {/* Action Guide & Calibration Notice */}
            <div className="flex w-full items-center gap-3 rounded-2xl border-2 border-black/20 bg-surface p-3 text-left shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-emerald-100 text-emerald-800">
                <Leaf className="w-5 h-5" />
              </span>
              <p className="text-xs font-semibold text-ink">
                <span className="font-black text-amber-900 uppercase text-[10px] block">
                  {m.calmSensory}
                </span>
                {t("subtitle")}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default BihuDholBeats;
