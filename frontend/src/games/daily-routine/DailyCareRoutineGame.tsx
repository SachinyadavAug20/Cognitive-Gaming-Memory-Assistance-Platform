"use client";

import { useCallback, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Clock,
  Pill,
  Droplets,
  Calendar,
  CheckCircle2,
  Sparkles,
  Paperclip,
  ShieldCheck,
  RotateCcw,
  Sun,
  Sunset,
  Moon,
  Heart,
  Volume2,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playWaterRipple, playLifeSong } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { getGameStrings } from "@/lib/gameI18n";

function GameShell({
  title,
  score,
  children,
}: {
  title: string;
  score: number;
  children: React.ReactNode;
}) {
  return (
    <section className="pb-12 min-h-screen bg-[#FAF6F0]">
      <GameHeader title={title} score={score} backHref="/patient/games" bgColor="bg-amber-800" />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

export interface RoutineTask {
  id: string;
  timeLabel: string;
  timePeriod: "morning" | "afternoon" | "evening" | "night";
  iconType: "medicine" | "hydration" | "activity" | "appointment";
  title: { en: string; hi: string; as: string };
  question: { en: string; hi: string; as: string };
  options: {
    id: string;
    label: { en: string; hi: string; as: string };
    emoji: string;
    isCorrect: boolean;
  }[];
  educationalFact: { en: string; hi: string; as: string };
}

const ROUTINE_TASKS: RoutineTask[] = [
  {
    id: "morning-meds",
    timeLabel: "8:00 AM",
    timePeriod: "morning",
    iconType: "medicine",
    title: {
      en: "Morning Blood Pressure & Memory Medicine",
      hi: "सुबह की रक्तचाप और स्मृति दवा",
      as: "ৰাতিপুৱাৰ ৰক্তচাপ আৰু স্মৃতিবৰ্ধক ঔষধ",
    },
    question: {
      en: "It is 8:00 AM after breakfast. Which morning medicine box should you open?",
      hi: "सुबह के 8:00 बजे नाश्ते के बाद, आपको कौन सी सुबह की दवा लेनी चाहिए?",
      as: "ৰাতিপুৱা ৮:০০ বজাত জলপান খোৱাৰ পিছত কোনটো ঔষধৰ বাকচ খুলিব লাগিব?",
    },
    options: [
      {
        id: "am-pill",
        label: {
          en: "Morning Sun Pill Box (BP & Vitamin D)",
          hi: "सुबह का सूर्य दवा बॉक्स (बीपी और विटामिन)",
          as: "ৰাতিপুৱাৰ সূৰ্য্য ঔষধৰ বাকচ (বিপি আৰু ভিটামিন)",
        },
        emoji: "💊",
        isCorrect: true,
      },
      {
        id: "pm-pill",
        label: {
          en: "Bedtime Moon Pill Box (Night Only)",
          hi: "रात का चंद्र दवा बॉक्स (केवल रात)",
          as: "ৰাতিৰ চন্দ্ৰ ঔষধৰ বাকচ (কেৱল ৰাতিৰ বাবে)",
        },
        emoji: "🌙",
        isCorrect: false,
      },
      {
        id: "candy",
        label: {
          en: "Sweet Pitha Snack Box",
          hi: "मीठा पीठा नाश्ता बॉक्स",
          as: "মিঠা পিঠা আৰু লাডুৰ টেমা",
        },
        emoji: "🥮",
        isCorrect: false,
      },
    ],
    educationalFact: {
      en: "Consistent morning medicine timing maintains steady neuro-vascular health.",
      hi: "नियमित समय पर सुबह की दवा लेने से मानसिक व शारीरिक स्वास्थ्य स्थिर रहता है।",
      as: "নিয়মীয়াকৈ সময়মতে ঔষধ খালে মগজু আৰু শৰীৰ সুস্থ থাকে।",
    },
  },
  {
    id: "morning-water",
    timeLabel: "10:30 AM",
    timePeriod: "morning",
    iconType: "hydration",
    title: {
      en: "Morning Hydration Water Glass",
      hi: "सुबह का जलपान एवं जल संतुलन",
      as: "ৰাতিপুৱাৰ পৰ্যাপ্ত পানী সেৱন",
    },
    question: {
      en: "It is mid-morning tea break. How much fresh spring water should we drink to prevent confusion & fatigue?",
      hi: "सुबह 10:30 बजे, मानसिक एकाग्रता और ताजगी के लिए कितना पानी पीना आवश्यक है?",
      as: "ৰাতিপুৱা ১০:৩০ বজাত মগজু সতেজ ৰাখিবলৈ কিমান পানী খোৱা প্ৰয়োজন?",
    },
    options: [
      {
        id: "glass-full",
        label: {
          en: "1 Full Brass Glass (250 ml Fresh Spring Water)",
          hi: "1 पूरा पीतल का गिलास (250 मिली शुद्ध जल)",
          as: "১ কাঁহৰ গিলাচ (২৫০ মিলিলিটাৰ বিশুদ্ধ পানী)",
        },
        emoji: "🥛",
        isCorrect: true,
      },
      {
        id: "empty",
        label: {
          en: "Skip water and wait till night",
          hi: "पानी न पिएं और रात तक इंतज़ार करें",
          as: "পানী নোখোৱাকৈ ৰাতিলৈ বাট চাওক",
        },
        emoji: "🚫",
        isCorrect: false,
      },
    ],
    educationalFact: {
      en: "Drinking 8 glasses of water daily prevents delirium, dehydration headaches, and brain fog.",
      hi: "दिन में पर्याप्त पानी पीने से सिरदर्द, भ्रम और थकान से बचाव होता है।",
      as: "পৰ্যাপ্ত পানী সেৱনে মগজুৰ দুৰ্বলতা, মূৰৰ বিষ আৰু ক্লান্তি দূৰ কৰে।",
    },
  },
  {
    id: "afternoon-appt",
    timeLabel: "2:30 PM",
    timePeriod: "afternoon",
    iconType: "appointment",
    title: {
      en: "Village ASHA Healthcare Worker Visit",
      hi: "आशा स्वास्थ्य कार्यकर्ता से परामर्श",
      as: "আশা বাইদেউৰ স্বাস্থ্য পৰিদৰ্শন আৰু পৰামৰ্শ",
    },
    question: {
      en: "The ASHA health worker is visiting today for your health card checkup. What card should we keep ready?",
      hi: "आशा कार्यकर्ता आज स्वास्थ्य जांच के लिए आ रही हैं। कौन सा कार्ड तैयार रखना चाहिए?",
      as: "আজি আশা বাইদেউ স্বাস্থ্য পৰীক্ষাৰ বাবে আহিব। কোনটো কাৰ্ড সাজু কৰি ৰাখিব লাগিব?",
    },
    options: [
      {
        id: "abha-card",
        label: {
          en: "Digital ABHA Health Card & Medical Diary",
          hi: "डिजिटल आभा (ABHA) स्वास्थ्य कार्ड व डायरी",
          as: "ডিজিটেল আভা (ABHA) স্বাস্থ্য কাৰ্ড আৰু ডায়েৰী",
        },
        emoji: "🪪",
        isCorrect: true,
      },
      {
        id: "postage",
        label: {
          en: "Old Postage Envelope",
          hi: "पुराना डाक लिफाफा",
          as: "পুৰণি ডাক খাম",
        },
        emoji: "✉️",
        isCorrect: false,
      },
    ],
    educationalFact: {
      en: "Keeping your 14-digit ABHA card accessible ensures seamless healthcare records at the PHC.",
      hi: "आभा कार्ड पास रखने से प्राथमिक स्वास्थ्य केंद्र (PHC) पर इलाज में आसानी होती है।",
      as: "আভা কাৰ্ড লগত ৰাখিলে প্ৰাথমিক স্বাস্থ্য কেন্দ্ৰত চিকিৎসা সেৱা সুচল হয়।",
    },
  },
  {
    id: "evening-prayer",
    timeLabel: "6:30 PM",
    timePeriod: "evening",
    iconType: "activity",
    title: {
      en: "Dusk Sandhya Prayer & Mati Saki Lamp",
      hi: "संध्या आरती और मिट्टी का दीया",
      as: "সন্ধ্যা প্ৰাৰ্থনা আৰু মাটিৰ চাকি প্ৰজ্বলন",
    },
    question: {
      en: "The sun is setting across the hills. What calming daily spiritual activity brings evening peace?",
      hi: "शाम ढल रही है। शाम को मन की शांति के लिए कौन सा पावन कार्य करना चाहिए?",
      as: "বেলি লহিওৱাৰ সময়ত মন শান্ত কৰিবলৈ কোনটো পবিত্ৰ কাম কৰা হয়?",
    },
    options: [
      {
        id: "lamp-prayer",
        label: {
          en: "Light Mustard Oil Lamp & Evening Dihanaam Prayer",
          hi: "दीया जलाकर संध्या वंदना व शांत प्रार्थना",
          as: "মাটিৰ চাকি জ্বলাই নামঘৰত সন্ধিয়া প্ৰাৰ্থনা আৰু দিহানাম",
        },
        emoji: "🪔",
        isCorrect: true,
      },
      {
        id: "loud-tv",
        label: {
          en: "Watch loud aggressive TV news",
          hi: "तेज़ आवाज़ में टीवी देखना",
          as: "উচ্চ শব্দত টেলিভিছন চোৱা",
        },
        emoji: "📺",
        isCorrect: false,
      },
    ],
    educationalFact: {
      en: "Calm evening spiritual routines reduce sunset anxiety (sundowning) in dementia patients.",
      hi: "शाम की शांत प्रार्थना से सूर्यास्त के समय होने वाली घबराहट (Sundowning) शांत होती है।",
      as: "সন্ধ্যাৰ শান্ত ভক্তিমূলক কাৰ্য্যই সূৰ্যাস্তৰ সময়ৰ মানসিক অস্থিৰতা আৰু উদ্বেগ হ্ৰাস কৰে।",
    },
  },
];

export function DailyCareRoutineGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "daily-routine", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [taskIdx, setTaskIdx] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "daily-routine",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const currentTask = ROUTINE_TASKS[taskIdx];
  const normLocale = locale === "hi" ? "hi" : locale === "as" ? "as" : "en";

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const startRoutineGame = useCallback(() => {
    playPress();
    setPhase("play");
    setTaskIdx(0);
    setSelectedOptionId(null);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    const firstTask = ROUTINE_TASKS[0];
    speak(firstTask.question[normLocale], locale, rate);
  }, [locale, normLocale, rate]);

  const handleOptionSelect = (optionId: string, isCorrect: boolean) => {
    setTaps((t) => t + 1);
    setSelectedOptionId(optionId);

    if (isCorrect) {
      playCorrect();
      if (currentTask.iconType === "hydration") {
        playWaterRipple();
      }
      speak(currentTask.educationalFact[normLocale], locale, rate);

      setTimeout(() => {
        const nextIdx = taskIdx + 1;
        if (nextIdx < ROUTINE_TASKS.length) {
          setTaskIdx(nextIdx);
          setSelectedOptionId(null);
          speak(ROUTINE_TASKS[nextIdx].question[normLocale], locale, rate);
        } else {
          playComplete();
          setPhase("done");
          if (startedAt) {
            recordGameSession(patientId, {
              gameId: "daily-routine",
              level,
              outcome: "completed",
              score: 100,
              startedAt,
              taps: taps + 1,
              errorCount: 0,
            });
          }
        }
      }, 2000);
    } else {
      speak("Let's look for the healthiest daily choice for your routine.", locale, rate);
    }
  };

  const str = getGameStrings("daily-routine", locale);

  if (loading) return <GameShell title="Elder Daily Care Routine" score={0}><GameLoading /></GameShell>;
  if (error) return <GameShell title="Elder Daily Care Routine" score={0}><GameError onRetry={reload} /></GameShell>;

  return (
    <GameShell title={currentTask ? currentTask.title[normLocale] : str.title} score={(taskIdx + 1) * 25}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                Prospective Memory & IADL // Module CDTx-25
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-amber-800" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-amber-800 text-white shadow-[4px_4px_0px_#000]">
            <Clock className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {normLocale === "hi"
                ? "दैनिक दिनचर्या और स्वास्थ्य देखभाल"
                : normLocale === "as"
                ? "দৈনন্দিন দিনচৰ্যা আৰু স্বাস্থ্য ৰক্ষা"
                : "Daily Care Routine & Wellness Clock"}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {normLocale === "hi"
                ? "दवाइयों का सही समय, पर्याप्त जलपान, आशा कार्यकर्ता से भेंट और शाम की शांतिपूर्ण प्रार्थना की स्मृति को ताज़ा करें।"
                : normLocale === "as"
                ? "সময়মতে ঔষধ খোৱা, পৰ্যাপ্ত পানী সেৱন, আশা বাইদেউৰ কাৰ্ড আৰু সন্ধ্যা প্ৰাৰ্থনাৰ নিয়মীয়া অভ্যাস সুঁৱৰি লওক।"
                : "Strengthen prospective memory by walking through your essential daily health routine: morning medicines, hydration glasses, clinic checkups, and evening serenity."}
            </p>
          </div>

          {/* Clinical Reminders Overview */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 block mb-2">
              Clinical Memory Goals:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200">
                <Pill className="h-4 w-4 text-amber-800" />
                <span>Medicine Timing</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-sky-50 border border-sky-200">
                <Droplets className="h-4 w-4 text-sky-800" />
                <span>Water Hydration</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <Calendar className="h-4 w-4 text-emerald-800" />
                <span>ASHA Care Visits</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-purple-50 border border-purple-200">
                <Heart className="h-4 w-4 text-purple-800" />
                <span>Sundowning Relief</span>
              </div>
            </div>
          </div>

          <AudioPrompt
            text={
              normLocale === "hi"
                ? "दैनिक दिनचर्या अभ्यास में आपका स्वागत है। चलिए समय पर दवा, पानी और स्वास्थ्य देखभाल के नियमों को दोहराते हैं।"
                : normLocale === "as"
                ? "দৈনন্দিন দিনচৰ্যাৰ খেললৈ স্বাগতম। আহক সময়মতে ঔষধ, পানী আৰু স্বাস্থ্য সেৱাৰ নিয়মবোৰ অভ্যাস কৰোঁ।"
                : "Welcome to Daily Care Routine. Walk through the daily clock to keep your medicines, hydration, and appointments sharp."
            }
            label="Listen to Audio"
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startRoutineGame}>
            {normLocale === "hi" ? "दिनचर्या शुरू करें ⏰" : normLocale === "as" ? "দিনচৰ্যা আৰম্ভ কৰক ⏰" : "Start Daily Routine ⏰"}
          </ChunkyButton>
        </div>
      ) : phase === "play" && currentTask ? (
        <div className="flex flex-col items-center gap-4 py-1 text-center">
          {/* DAILY CLOCK HUD */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              {currentTask.timePeriod === "morning" ? (
                <Sun className="h-5 w-5 text-amber-500 animate-spin" style={{ animationDuration: "20s" }} />
              ) : currentTask.timePeriod === "afternoon" ? (
                <Sun className="h-5 w-5 text-amber-600" />
              ) : currentTask.timePeriod === "evening" ? (
                <Sunset className="h-5 w-5 text-rose-500" />
              ) : (
                <Moon className="h-5 w-5 text-indigo-500" />
              )}
              <span className="font-serif text-sm font-black text-ink">
                {currentTask.timeLabel}
              </span>
            </div>

            <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              Task {taskIdx + 1} of {ROUTINE_TASKS.length}
            </span>
          </div>

          {/* QUESTION PROMPT CARD */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-white p-5 shadow-[4px_4px_0px_#000] text-left space-y-2">
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-amber-600" /> {currentTask.title[normLocale]}
              </span>
              <button
                type="button"
                onClick={() => speak(currentTask.question[normLocale], locale, rate)}
                className="p-1 rounded-lg border border-black bg-amber-100 hover:bg-amber-200 cursor-pointer"
                title="Listen to question"
              >
                <Volume2 className="h-4 w-4 text-ink" />
              </button>
            </div>

            <p className="font-serif text-base sm:text-lg font-bold text-ink leading-snug">
              {currentTask.question[normLocale]}
            </p>
          </div>

          {/* DEDICATED TACTILE MINI-STATION WIDGET */}
          {currentTask.id === "morning-meds" && (
            <div className="w-full max-w-md rounded-2xl border-3 border-black bg-[#FAF5EE] p-4 shadow-[4px_4px_0px_#000]">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block mb-2 text-left">
                📦 7-Day Pill Organizer Box:
              </span>
              <div className="grid grid-cols-4 gap-2">
                <div className="p-2.5 rounded-xl border-2 border-emerald-800 bg-amber-200 text-center font-black text-xs shadow-xs animate-pulse">
                  <span className="text-xl block">☀️</span>
                  <span className="text-[10px] uppercase text-amber-950">Morning (AM)</span>
                  <span className="text-xs block text-emerald-950 mt-1 font-bold">BP + Memory 💊</span>
                </div>
                <div className="p-2.5 rounded-xl border-2 border-black/30 bg-white/70 text-center font-bold text-xs opacity-75">
                  <span className="text-xl block">🌤️</span>
                  <span className="text-[10px] uppercase text-ink-secondary">Noon</span>
                  <span className="text-[10px] block text-ink-secondary mt-1">Water 🥛</span>
                </div>
                <div className="p-2.5 rounded-xl border-2 border-black/30 bg-white/70 text-center font-bold text-xs opacity-75">
                  <span className="text-xl block">🌆</span>
                  <span className="text-[10px] uppercase text-ink-secondary">Evening</span>
                  <span className="text-[10px] block text-ink-secondary mt-1">Prayer 🪔</span>
                </div>
                <div className="p-2.5 rounded-xl border-2 border-black/30 bg-white/70 text-center font-bold text-xs opacity-75">
                  <span className="text-xl block">🌙</span>
                  <span className="text-[10px] uppercase text-ink-secondary">Night</span>
                  <span className="text-[10px] block text-ink-secondary mt-1">Rest 💤</span>
                </div>
              </div>
            </div>
          )}

          {currentTask.id === "morning-water" && (
            <div className="w-full max-w-md rounded-2xl border-3 border-black bg-[#EFF6FF] p-4 shadow-[4px_4px_0px_#000]">
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-900 block mb-2 text-left">
                💧 Himalayan Spring Hydration Tracker:
              </span>
              <div className="flex items-center justify-center gap-4 py-2">
                <div className="relative h-28 w-16 rounded-b-2xl border-3 border-sky-900 bg-white overflow-hidden shadow-inner flex flex-col justify-end p-1">
                  <div
                    className="w-full bg-gradient-to-t from-sky-500 to-sky-300 rounded-b-xl transition-all duration-700 relative overflow-hidden"
                    style={{ height: selectedOptionId === "glass-full" ? "92%" : "30%" }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                  <span className="absolute top-1 left-0 right-0 text-[10px] font-black text-sky-900 text-center">
                    {selectedOptionId === "glass-full" ? "250 ml (Full)" : "Low"}
                  </span>
                </div>
                <div className="text-left text-xs font-bold text-sky-950 space-y-1">
                  <p className="font-serif font-black text-sm text-sky-900">Optimal Hydration</p>
                  <p className="text-ink-secondary">1. Boosts neuro-cognition</p>
                  <p className="text-ink-secondary">2. Prevents midday fatigue</p>
                </div>
              </div>
            </div>
          )}

          {currentTask.id === "afternoon-appt" && (
            <div className="w-full max-w-md rounded-2xl border-3 border-black bg-[#ECFDF5] p-4 shadow-[4px_4px_0px_#000]">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-900 block mb-2 text-left">
                🪪 Government of India ABHA Health Registry Card:
              </span>
              <div className="rounded-xl border-2 border-emerald-800 bg-white p-3 shadow-xs flex items-center justify-between text-left">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">
                    Ayushman Bharat Digital Mission
                  </span>
                  <p className="font-serif text-xs sm:text-sm font-black text-ink">
                    ABHA No: 91-4820-3918-4720
                  </p>
                  <p className="text-[11px] font-bold text-ink-secondary">
                    Status: <span className="text-emerald-700 font-black">ASHA Checkup Synchronized ✓</span>
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full border-2 border-emerald-700 bg-emerald-100 flex items-center justify-center font-black text-emerald-900 text-xs shadow-inner">
                  SEAL
                </div>
              </div>
            </div>
          )}

          {currentTask.id === "evening-prayer" && (
            <div className="w-full max-w-md rounded-2xl border-3 border-black bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 p-4 shadow-[4px_4px_0px_#000]">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-950 block mb-2 text-left">
                🪔 Sandhya Aarti & Mustard Oil Diya Lamp:
              </span>
              <div className="flex items-center justify-center gap-3 py-1">
                <div className="relative text-5xl animate-bounce" style={{ animationDuration: "2.5s" }}>
                  🪔
                </div>
                <div className="text-left">
                  <p className="font-serif font-black text-sm text-amber-950">
                    Sacred Light at Twilight
                  </p>
                  <p className="text-xs font-semibold text-amber-900">
                    Wards off sundowning anxiety with peaceful calm.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* INTERACTIVE ROUTINE CHOICES */}
          <div className="w-full max-w-md space-y-3 pt-1">
            {currentTask.options.map((opt) => {
              const isSelected = selectedOptionId === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleOptionSelect(opt.id, opt.isCorrect)}
                  className={`btn-tactile w-full flex items-center gap-4 rounded-2xl border-3 border-black p-4 text-left shadow-[3px_3px_0px_#000] transition-all cursor-pointer ${
                    isSelected
                      ? opt.isCorrect
                        ? "bg-emerald-200 border-emerald-800 text-ink ring-4 ring-emerald-300"
                        : "bg-rose-100 border-rose-800 text-ink"
                      : "bg-surface hover:bg-amber-50"
                  }`}
                >
                  <span className="text-4xl shrink-0">{opt.emoji}</span>
                  <div className="flex-1">
                    <span className="font-serif text-sm sm:text-base font-black text-ink block leading-tight">
                      {opt.label[normLocale]}
                    </span>
                  </div>
                  {isSelected && opt.isCorrect && (
                    <CheckCircle2 className="h-6 w-6 text-emerald-800 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title={
            normLocale === "hi"
              ? "दैनिक दिनचर्या पूर्ण हुई!"
              : normLocale === "as"
              ? "দৈনন্দিন দিনচৰ্যা সফলভাৱে সম্পন্ন!"
              : "Daily Routine & Wellness Mastered!"
          }
          subtitle={
            normLocale === "hi"
              ? "आपने दवाइयों का समय, जल संतुलन और दैनिक देखभाल के नियमों को सटीकता से पूरा किया।"
              : normLocale === "as"
              ? "আপুনি সময়মতে ঔষধ, পানী সেৱন আৰু স্বাস্থ্যৰ সকলো নিয়ম অতি সুন্দৰভাৱে সুঁৱৰি ল'লে।"
              : "You successfully completed today's daily medication, hydration, and clinical wellness routine."
          }
          xpEarned={140}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> 4/4 Health Milestones Synchronized
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-amber-800 text-white px-2 py-0.5">
                  IADL Mastery
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                Prospective Memory: 100% Adherence
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1">
                Medicine clock sequencing, hydration intake, and calendar task recall demonstrated robust executive function and independent living capacity.
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-amber-100 px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Heart className="h-4 w-4 text-amber-900" />
                  <span className="text-xs font-black">Play Soothing Daily Song</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startRoutineGame}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  {normLocale === "hi" ? "फिर से अभ्यास करें" : normLocale === "as" ? "পুনৰ অভ্যাস কৰক" : "Practice Routine Again"}
                </span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
              >
                {normLocale === "hi" ? "← थेरेपी केंद्र" : normLocale === "as" ? "← থেৰাপী কক্ষ" : "← Back to Therapy Suite"}
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
