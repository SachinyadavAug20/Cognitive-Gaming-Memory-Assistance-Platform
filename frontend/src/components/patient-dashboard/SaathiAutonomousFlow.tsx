"use client";

import { useState, useEffect } from "react";
import {
  Compass,
  Play,
  ArrowRight,
  Volume2,
  CheckCircle2,
  Sparkles,
  Heart,
  Layers,
  Sun,
  Coffee,
  Smile,
  X,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { playTapFeedback, playEncourage, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { useLocale } from "next-intl";
import { useCareSyncStore } from "@/lib/careSyncStore";

interface SaathiAutonomousFlowProps {
  patientName?: string;
  langCode?: string;
  rate?: number;
}

export function SaathiAutonomousFlow({
  patientName = "Baba",
  langCode = "en",
  rate = 0.85,
}: SaathiAutonomousFlowProps) {
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || langCode || "en");
  const prescription = useCareSyncStore((s) => s.prescription);
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isIdleAlert, setIsIdleAlert] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsIdleAlert(true);
      unlockAudio();
      const idlePrompt =
        normLoc === "hi"
          ? `नमस्ते ${patientName} जी! अगर उलझन हो रही है तो चिंता न करें, बड़ा बटन दबाएं।`
          : normLoc === "as"
          ? `নমস্কাৰ ${patientName}! যদি কিবা চিন্তা হৈছে, ডাঙৰ বুটামটো স্পৰ্শ কৰক।`
          : `Hello ${patientName}! If you are wondering what to do, tap the big button to begin today.`;
      speak(idlePrompt, normLoc, rate);
    }, 10000); // 10s inactivity auto-guide

    const onUserAction = () => {
      setIsIdleAlert(false);
    };

    window.addEventListener("pointerdown", onUserAction);
    window.addEventListener("keydown", onUserAction);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("pointerdown", onUserAction);
      window.removeEventListener("keydown", onUserAction);
    };
  }, [normLoc, patientName, rate]);

  // Today date formatted
  const todayStr = new Date().toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const STEPS = [
    {
      step: 1,
      badge: normLoc === "hi" ? "चरण 1: स्वागत" : normLoc === "as" ? "১ম খোজ: শুভ দিন" : "Step 1: Daily Orientation",
      title:
        normLoc === "hi"
          ? `नमस्ते ${patientName} जी! आज ${todayStr} है।`
          : normLoc === "as"
          ? `নমস্কাৰ ${patientName}! আজি ${todayStr}।`
          : `Good Morning ${patientName}! Today is ${todayStr}.`,
      description:
        normLoc === "hi"
          ? "आप अपने सुरक्षित घर में हैं। आज का दिन बहुत सुंदर है। चलिए एक साथ आज की हल्की और मजेदार सैर शुरू करते हैं।"
          : normLoc === "as"
          ? "আপুনি নিজৰ ঘৰতে সুৰক্ষিতভাৱে আছে। আজিৰ দিনটো বৰ আনন্দদায়ক। আহক আমি সহজভাৱে দিনটোৰ কাৰ্যসূচী আৰম্ভ কৰোঁ।"
          : "You are safely at home. Today is a peaceful day. Let us begin a gentle guided morning together.",
      actionLabel: normLoc === "hi" ? "आगे बढ़ें →" : normLoc === "as" ? "আগলৈ যাওঁক →" : "Continue →",
      audioText:
        normLoc === "hi"
          ? `नमस्ते ${patientName} जी। आज का दिन बहुत अच्छा है। आप बिल्कुल सुरक्षित हैं। आगे बढ़ने के लिए हरा बटन दबाएं।`
          : normLoc === "as"
          ? `নমস্কাৰ ${patientName}। আজিৰ দিনটো বৰ সুন্দৰ। আপুনি আপোনাৰ মৰমৰ ঘৰতে আছে। আগলৈ যাবলৈ সেউজীয়া বুটামটো টিপক।`
          : `Good morning ${patientName}. Today is a wonderful day. You are safe and loved. Tap the green button to continue.`,
      icon: Sun,
      color: "bg-amber-400",
    },
    {
      step: 2,
      badge: normLoc === "hi" ? "चरण 2: सुबह की चाय" : normLoc === "as" ? "২য় খোজ: পুৱাৰ চাহ" : "Step 2: Morning Nourishment",
      title:
        normLoc === "hi"
          ? "क्या आपने सुबह की गर्म चाय या नाश्ता ले लिया?"
          : normLoc === "as"
          ? "আপুনি পুৱাৰ গৰম চাহ আৰু আহাৰ খালে নে?"
          : "Did you enjoy your warm morning tea and breakfast?",
      description:
        normLoc === "hi"
          ? "पौष्टिक नाश्ता और पर्याप्त पानी आपके मस्तिष्क को ऊर्जा और ताजगी देता है।"
          : normLoc === "as"
          ? "পুষ্টিকৰ আহাৰ আৰু এগিলাচ পানীয়ে আপোনাৰ মন আৰু শৰীৰ দুয়োটাতে প্ৰাণ দিয়ে।"
          : "Warm tea and nourishing breakfast provide steady glucose and sharp focus for the day.",
      actionLabel: normLoc === "hi" ? "हाँ, बहुत अच्छा लगा! →" : normLoc === "as" ? "হয়, বৰ তৃপ্তি পালোঁ! →" : "Yes, feeling good! →",
      audioText:
        normLoc === "hi"
          ? "क्या आपने सुबह की गर्म चाय पी ली? बहुत अच्छा! अब चलिए अगले मजेदार खेल की ओर बढ़ते हैं।"
          : normLoc === "as"
          ? "পুৱাৰ গৰম চাহ কাপ খাই তৃপ্তি পালে নে? বৰ সুন্দৰ কথা! আহক এতিয়া আমি খেললৈ আগবাঢ়োঁ।"
          : "Did you enjoy your morning tea? Wonderful! Let us move to today's brain activity.",
      icon: Coffee,
      color: "bg-orange-400",
    },
    {
      step: 3,
      badge: normLoc === "hi" ? "चरण 3: डॉक्टर द्वारा निर्धारित खेल" : normLoc === "as" ? "৩য় খোজ: ডাক্তৰৰ কাৰ্যসূচী" : "Step 3: Doctor's Prescription",
      title: `${prescription.prescribedGameTitle}`,
      description: `${prescription.doctorNotes} (Daily Target: ${prescription.dailyTargetMinutes} mins • Level ${prescription.assistanceLevel})`,
      actionLabel: normLoc === "hi" ? `खेल शुरू करें: ${prescription.prescribedGameTitle} 🎮` : `Play ${prescription.prescribedGameTitle} 🎮`,
      gameRoute: prescription.prescribedRoute,
      audioText:
        normLoc === "hi"
          ? `डॉक्टर ने आपकी स्मृति के लिए ${prescription.prescribedGameTitle} खेल निर्धारित किया है।`
          : `Your doctor has prescribed ${prescription.prescribedGameTitle} for your session today. Tap to play.`,
      icon: Layers,
      color: "bg-emerald-400",
    },
    {
      step: 4,
      badge: normLoc === "hi" ? "चरण 4: प्रशंसा और आशीर्वाद" : normLoc === "as" ? "৪ৰ্থ খোজ: পৰিয়ালৰ মৰম" : "Step 4: Family Love & Blessing",
      title:
        normLoc === "hi"
          ? `शाबाश ${patientName} जी! आपने आज का सत्र पूरा किया!`
          : normLoc === "as"
          ? `বৰ সুন্দৰ ${patientName}! আজিৰ দিনটো অতি সুন্দৰভাৱে আৰম্ভ কৰিলে!`
          : `Wonderful work ${patientName}! Today's journey is complete!`,
      description:
        normLoc === "hi"
          ? "आपके पूरे परिवार और डॉक्टर को आप पर गर्व है। आपको 100 अंक और 'गोल्डन सनशाइन' बैज मिला है!"
          : normLoc === "as"
          ? "আপোনাৰ পৰিয়াল আৰু ডাক্তৰ সকলো আপোনাক লৈ গৌৰৱান্বিত। আপুনি আজি গোল্ডেন বাজি অৰ্জন কৰিলে!"
          : "Your family and doctor are proud of your daily commitment. You earned the Golden Sunshine Badge!",
      actionLabel: normLoc === "hi" ? "सत्र संपन्न करें 🌸" : normLoc === "as" ? "সম্পূৰ্ণ হ’ল 🌸" : "Finish & Rest 🌸",
      audioText:
        normLoc === "hi"
          ? `शाबाश ${patientName} जी! आपने बहुत अच्छा प्रयास किया। आपका परिवार आपसे बहुत प्यार करता है।`
          : normLoc === "as"
          ? `বৰ প্ৰশংসনীয় ${patientName}! আপোনাৰ পৰিয়াল আপোনাৰ লগত আছে আৰু সকলোৱে আপোনাক মৰম কৰে।`
          : `Congratulations ${patientName}. You did wonderfully today. Your family loves you deeply.`,
      icon: Heart,
      color: "bg-pink-400",
    },
  ];

  const activeStepData = STEPS[currentStep];

  const handleStartFlow = () => {
    playTapFeedback();
    unlockAudio();
    setCurrentStep(0);
    setIsOpen(true);
    speak(STEPS[0].audioText, normLoc, rate);
  };

  const handleNextStep = () => {
    playTapFeedback();
    unlockAudio();
    if (currentStep < STEPS.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      speak(STEPS[nextIdx].audioText, normLoc, rate);
      if (nextIdx === STEPS.length - 1) {
        playEncourage();
      }
    } else {
      setIsOpen(false);
      playEncourage();
    }
  };

  return (
    <>
      {/* ── GIANT ZERO-FRICTION PATIENT HERO CTA ── */}
      <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 p-5 sm:p-7 shadow-[6px_6px_0px_#000] text-black">
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-2 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_#000]">
              <Compass className="h-4 w-4 text-tea animate-spin-slow" />
              <span>
                {normLoc === "hi"
                  ? "सुगम दैनिक मार्गदर्शक"
                  : normLoc === "as"
                  ? "সহজ দৈনন্দিন পথপ্ৰদৰ্শক"
                  : "Saathi Autonomous Guide"}
              </span>
            </div>
            <h2 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-black leading-tight">
              {normLoc === "hi"
                ? "आज क्या करें? (एक स्पर्श में शुरू करें)"
                : normLoc === "as"
                ? "আজি কি কৰিম? (এটা স্পৰ্শতে আৰম্ভ)"
                : "What to do today? (One-Touch Guide)"}
            </h2>
            <p className="text-sm sm:text-base font-bold text-black/85 max-w-xl">
              {normLoc === "hi"
                ? "कोई उलझन नहीं! बस इस बड़े बटन को दबाएं — हम कदम-दर-कदम आपके साथ चलेंगे।"
                : normLoc === "as"
                ? "কোনো চিন্তা নকৰিব! মাত্ৰ এই ডাঙৰ বুটামটো স্পৰ্শ কৰক — আমি খোজলৈ খোজ মিলাই আগবাঢ়িম।"
                : "No confusion or choices needed. Tap this single button and let Saathi guide Amma & Baba step-by-step."}
            </p>
          </div>

          <div className="relative shrink-0">
            {isIdleAlert && (
              <div className="absolute -top-12 sm:-top-14 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white text-ink text-xs sm:text-sm font-black px-3.5 py-1.5 rounded-full border-2 border-black shadow-[3px_3px_0px_#000] animate-bounce z-20 flex items-center gap-1.5">
                <span>👋</span>
                <span>
                  {normLoc === "hi"
                    ? `${patientName} जी, यहाँ दबाएं!`
                    : normLoc === "as"
                    ? `${patientName}, ইয়াত স্পৰ্শ কৰক!`
                    : `${patientName}, tap here to start!`}
                </span>
              </div>
            )}
            <button
              onClick={handleStartFlow}
              className={`flex items-center gap-3.5 px-7 sm:px-9 py-4 sm:py-5 rounded-2xl bg-black text-white font-serif font-black text-lg sm:text-xl border-3 border-black shadow-[4px_4px_0px_#FFF] hover:bg-neutral-800 hover:scale-105 active:scale-95 transition-all cursor-pointer ${
                isIdleAlert ? "ring-4 ring-white animate-pulse" : ""
              }`}
            >
              <Play className="h-7 w-7 text-amber-300 fill-amber-300" />
              <span>
                {normLoc === "hi"
                  ? "सफर शुरू करें →"
                  : normLoc === "as"
                  ? "আৰম্ভ কৰক →"
                  : "Start Today →"}
              </span>
            </button>
          </div>
        </div>

        {/* Decorative corner icon */}
        <div className="absolute -bottom-6 -right-6 text-black/10 select-none pointer-events-none">
          <Sparkles className="h-40 w-40" />
        </div>
      </div>

      {/* ── AUTONOMOUS GUIDED MODAL ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-surface rounded-3xl border-4 border-black shadow-[8px_8px_0px_#000] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-tea text-white px-6 py-4 border-b-4 border-black flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl border-2 border-black ${activeStepData.color} text-black font-black`}>
                  {activeStepData.step} / {STEPS.length}
                </div>
                <div>
                  <span className="text-xs font-mono uppercase tracking-wider text-amber-300 font-bold">
                    {activeStepData.badge}
                  </span>
                  <h3 className="font-serif font-black text-lg sm:text-xl">
                    {normLoc === "hi" ? "साथी दैनिक मार्गदर्शन" : normLoc === "as" ? "সাথী দৈনন্দিন পথনিৰ্দেশ" : "Saathi Daily Flow"}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => {
                  playTapFeedback();
                  setIsOpen(false);
                }}
                className="w-10 h-10 rounded-xl bg-white text-black font-black text-base border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-amber-100 flex items-center justify-center cursor-pointer"
                title="Close"
              >
                ✕
              </button>
            </div>

            {/* Step Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-3">
                <h4 className="font-serif font-black text-2xl sm:text-3xl text-ink leading-snug">
                  {activeStepData.title}
                </h4>
                <p className="text-base sm:text-lg text-ink font-medium leading-relaxed">
                  {activeStepData.description}
                </p>
              </div>

              {/* Step Voice Reader */}
              <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-amber-50 border-2 border-black/20">
                <button
                  onClick={() => {
                    unlockAudio();
                    speak(activeStepData.audioText, normLoc, rate);
                  }}
                  className="p-3 rounded-xl border-2 border-black bg-white hover:bg-amber-100 shadow-[2px_2px_0px_#000] cursor-pointer shrink-0"
                >
                  <Volume2 className="h-6 w-6 text-tea" />
                </button>
                <span className="text-xs sm:text-sm font-bold text-ink-secondary">
                  {normLoc === "hi"
                    ? "आवाज सुनने के लिए स्पीकर दबाएं"
                    : normLoc === "as"
                    ? "কথাখিনি শুনিবলৈ স্পীকাৰটো স্পৰ্শ কৰক"
                    : "Tap the speaker to hear this aloud"}
                </span>
              </div>

              {/* Progress Dots */}
              <div className="flex items-center justify-center gap-2 pt-2">
                {STEPS.map((s, idx) => (
                  <div
                    key={s.step}
                    className={`h-3 rounded-full transition-all ${
                      idx === currentStep
                        ? "w-8 bg-tea border-2 border-black"
                        : idx < currentStep
                        ? "w-3 bg-emerald-500 border border-black"
                        : "w-3 bg-neutral-300"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-6 bg-muted/40 border-t-4 border-black flex items-center justify-between gap-4">
              <button
                onClick={() => {
                  playTapFeedback();
                  setIsOpen(false);
                }}
                className="py-3 px-5 rounded-2xl border-2 border-black bg-white font-bold text-sm text-ink hover:bg-neutral-100 cursor-pointer"
              >
                {normLoc === "hi" ? "बाद में" : normLoc === "as" ? "পিছত কৰিম" : "Skip"}
              </button>

              {activeStepData.gameRoute ? (
                <Link
                  href={activeStepData.gameRoute}
                  onClick={() => {
                    playTapFeedback();
                    setIsOpen(false);
                  }}
                  className="flex-1 py-4 px-6 rounded-2xl border-3 border-black bg-tea text-white font-serif font-black text-lg text-center shadow-[4px_4px_0px_#000] hover:bg-emerald-800 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <span>{activeStepData.actionLabel}</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <button
                  onClick={handleNextStep}
                  className="flex-1 py-4 px-6 rounded-2xl border-3 border-black bg-tea text-white font-serif font-black text-lg text-center shadow-[4px_4px_0px_#000] hover:bg-emerald-800 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{activeStepData.actionLabel}</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
