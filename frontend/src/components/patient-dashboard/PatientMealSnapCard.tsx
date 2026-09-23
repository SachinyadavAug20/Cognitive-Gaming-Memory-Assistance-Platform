"use client";

import { useState, useRef, useId } from "react";
import { Camera, Volume2, RotateCcw, Star } from "lucide-react";
import { playTapFeedback, playEncourage, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { useLocale } from "next-intl";
import { useCareSyncStore } from "@/lib/careSyncStore";

interface MealPreset {
  id: string;
  name: Record<string, string>;
  shortName: Record<string, string>;
  emoji: string;
  stars: number;
  advice: Record<string, string>;
  imagePlaceholder: string;
}

function StarRating({ count, max = 10 }: { count: number; max?: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${count} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => {
        const isFilled = i < count;
        return (
          <Star
            key={i}
            className={`h-5 w-5 transition-transform ${
              isFilled
                ? "text-amber-500 fill-amber-400 drop-shadow-xs"
                : "text-neutral-300 fill-neutral-100 dark:fill-neutral-800 dark:text-neutral-700"
            }`}
          />
        );
      })}
    </div>
  );
}

const PRESET_MEALS: MealPreset[] = [
  {
    id: "dal_rice_veg",
    emoji: "🍛",
    name: {
      en: "Rice, Dal & Leafy Greens",
      hi: "दाल, चावल और हरी सब्जी",
      as: "ভাত, মগু ডাইল আৰু শাক",
    },
    shortName: {
      en: "Rice & Dal",
      hi: "दाल चावल",
      as: "ভাত-ডাইল",
    },
    stars: 10,
    advice: {
      en: "Superb plate! Green spinach and lentils nourish memory cells and keep blood sugar steady. Drink a glass of warm water after eating.",
      hi: "बहुत बढ़िया भोजन! हरी सब्जियां और दाल मस्तिष्क की कोशिकाओं को पोषण देती हैं। खाने के बाद एक गिलास गुनगुना पानी पिएं।",
      as: "বৰ পুষ্টিকৰ সাজ! সেউজীয়া শাক আৰু মগু ডালে স্মৃতিশক্তি সতেজ ৰাখে। খোৱাৰ পিছত এগিলাচ কুহুমীয়া পানী খাব।",
    },
    imagePlaceholder: "/sample-images/meals/dal_rice_veg.jpg",
  },
  {
    id: "roti_sabji",
    emoji: "🫓",
    name: {
      en: "Roti & Mixed Vegetables",
      hi: "रोटी और ताजी सब्जी",
      as: "ৰুটী আৰু ভাজি",
    },
    shortName: {
      en: "Roti & Sabji",
      hi: "रोटी सब्जी",
      as: "ৰুটী-ভাজি",
    },
    stars: 9,
    advice: {
      en: "Whole grains and seasonal vegetables support good blood flow to the brain. Take gentle bites and enjoy every flavor.",
      hi: "साबुत अनाज और मौसमी सब्जियां दिमाग में रक्त संचार को स्वस्थ रखती हैं। धीरे-धीरे चबाकर खाएं।",
      as: "আটাৰ ৰুটী আৰু পাচলি মগজুৰ ৰক্ত চলাচলৰ বাবে অতি হিতকৰ। লাহে লাহে চোবাই খাওক।",
    },
    imagePlaceholder: "/sample-images/meals/roti_sabji.jpg",
  },
  {
    id: "khichdi_curd",
    emoji: "🍲",
    name: {
      en: "Warm Khichdi & Curd",
      hi: "गर्म खिचड़ी और ताजा दही",
      as: "গৰম খিচিৰি আৰু দৈ",
    },
    shortName: {
      en: "Khichdi & Curd",
      hi: "खिचड़ी दही",
      as: "খিচিৰি-দৈ",
    },
    stars: 9,
    advice: {
      en: "Gentle on your stomach! Curd provides probiotics that communicate with the brain to keep you calm and peaceful.",
      hi: "पेट के लिए बहुत हल्का और सुपाच्य! दही के गुण मस्तिष्क को शांत रखते हैं और मन को प्रसन्न करते हैं।",
      as: "পেটৰ বাবে অতি সুচল! দৈৰ প্ৰাকৃতিক উপাদানে মন শান্ত আৰু চিন্তামুক্ত ৰাখিবলৈ সহায় কৰে।",
    },
    imagePlaceholder: "/sample-images/meals/khichdi_curd.jpg",
  },
  {
    id: "fruits_milk",
    emoji: "🍌",
    name: {
      en: "Fresh Fruit & Warm Milk",
      hi: "ताजे फल और गर्म दूध",
      as: "পকা ফল আৰু গাখীৰ",
    },
    shortName: {
      en: "Fruit & Milk",
      hi: "फल व दूध",
      as: "ফল-গাখীৰ",
    },
    stars: 9,
    advice: {
      en: "Antioxidants from fresh fruits protect memory connections. Warm milk relaxes muscles and prepares you for peaceful rest.",
      hi: "फलों के पोषक तत्व याददाश्त को सुरक्षित रखते हैं। गर्म दूध शरीर को आराम देता है और गहरी शांति लाता है।",
      as: "ফলৰ ভিটামিনে মগজুৰ স্মৃতিকোষবোৰ সজীৱ কৰে। গৰম গাখীৰে দেহা জুৰাই গভীৰ শান্তি আনে।",
    },
    imagePlaceholder: "/sample-images/meals/fruits_milk.jpg",
  },
];

export function PatientMealSnapCard({ patientName = "Baba" }: { patientName?: string }) {
  const locale = useLocale();
  const normLoc = locale?.split("-")[0]?.toLowerCase() || "en";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toggleMealTaken = useCareSyncStore((s) => s.toggleMealTaken);
  const uniqueInputId = useId();

  const [activeMeal, setActiveMeal] = useState<MealPreset>(PRESET_MEALS[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const currentName = activeMeal.name[normLoc] || activeMeal.name.en;
  const currentAdvice = activeMeal.advice[normLoc] || activeMeal.advice.en;
  const currentStars = customPhotoUrl ? 9 : activeMeal.stars;

  const handleCapturePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playTapFeedback();
    setAnalyzing(true);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomPhotoUrl(reader.result);

        setTimeout(() => {
          setAnalyzing(false);
          playEncourage();
          toggleMealTaken("lunch");

          const praiseMsg =
            normLoc === "hi"
              ? `शाबाश ${patientName} जी! भोजन की तस्वीर दर्ज हो गई है। इसे 10 में से 9 स्टार मिले हैं!`
              : normLoc === "as"
              ? `বৰ সুন্দৰ ${patientName}! আহাৰৰ ছবিখন সংৰক্ষণ কৰা হ'ল। ই ১০ টাৰ ভিতৰত ৯ টা তৰা পাইছে!`
              : `Great job ${patientName}! Your meal photo has been saved with 9 out of 10 stars!`;

          unlockAudio();
          speak(praiseMsg, normLoc, 0.85);
        }, 800);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (preset: MealPreset) => {
    playTapFeedback();
    setActiveMeal(preset);
    setCustomPhotoUrl(null);
    playEncourage();
    toggleMealTaken(preset.id);
  };

  const handleListenAdvice = () => {
    unlockAudio();
    playTapFeedback();
    const fullSpeech = `${currentName}. ${currentStars} out of 10 stars. ${currentAdvice}`;
    speak(fullSpeech, normLoc, 0.85);
  };

  return (
    <section
      aria-label="Simple Meal Check"
      className="rounded-3xl border-3 border-black bg-surface p-5 sm:p-6 shadow-[4px_4px_0px_#000] space-y-5 text-ink"
    >
      {/* ── TOP: Clean Header + Camera Snap Button ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000] shrink-0 text-black">
            📸
          </div>
          <div>
            <h3 className="font-serif font-black text-xl sm:text-2xl text-ink leading-tight">
              {normLoc === "hi"
                ? "भोजन जांच"
                : normLoc === "as"
                ? "আহাৰ পৰীক্ষা"
                : "Snap What You Eat"}
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary">
              {normLoc === "hi"
                ? "तस्वीर लें या भोजन चुनें — याददाश्त के लिए 10 स्टार रेटिंग पाएं"
                : normLoc === "as"
                ? "ছবি তোলক বা আহাৰ বাছক — ১০ টা তৰাৰ ৰেটিং পাওক"
                : "Snap a photo of your plate or tap what you are eating"}
            </p>
          </div>
        </div>

        {/* 1-Tap Camera Button */}
        <label
          htmlFor={uniqueInputId}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-tea text-white font-serif font-black text-xs sm:text-sm border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-emerald-800 active:scale-95 cursor-pointer transition-transform shrink-0"
        >
          <Camera className="h-4 w-4 text-amber-300 stroke-[2.5]" />
          <span>
            {normLoc === "hi"
              ? "थाली की तस्वीर लें 📸"
              : normLoc === "as"
              ? "আহাৰৰ ছবি তোলক 📸"
              : "Take Plate Photo 📸"}
          </span>
          <input
            id={uniqueInputId}
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleCapturePhoto}
          />
        </label>
      </div>

      {/* ── MIDDLE: 4 Simple Quick Meal Pills ── */}
      <div>
        <span className="text-xs font-bold text-ink-secondary mb-2 block">
          {normLoc === "hi" ? "या आज का भोजन चुनें:" : normLoc === "as" ? "বা আজিৰ আহাৰ বাছক:" : "Or tap what you're eating today:"}
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRESET_MEALS.map((meal) => {
            const isSelected = !customPhotoUrl && activeMeal.id === meal.id;
            const shortTitle = meal.shortName[normLoc] || meal.shortName.en;

            return (
              <button
                key={meal.id}
                type="button"
                onClick={() => handleSelectPreset(meal)}
                className={`py-2 px-3 rounded-xl border-2 flex items-center gap-2 font-bold text-xs sm:text-sm cursor-pointer transition-all active:scale-95 ${
                  isSelected
                    ? "border-black bg-amber-300 text-black shadow-[2px_2px_0px_#000] font-black"
                    : "border-black/25 bg-surface text-ink hover:bg-amber-50 hover:border-black"
                }`}
              >
                <span className="text-lg">{meal.emoji}</span>
                <span className="truncate">{shortTitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── BOTTOM: Result Spotlight (Simple, Single-Card, No Nested Boxes) ── */}
      {analyzing ? (
        <div className="py-6 text-center space-y-2 rounded-2xl bg-amber-50/50 border-2 border-black/15">
          <div className="w-9 h-9 border-3 border-tea border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-serif font-black text-sm text-ink">
            {normLoc === "hi" ? "भोजन की जांच हो रही है..." : normLoc === "as" ? "আহাৰ পৰীক্ষা কৰা হৈছে..." : "Checking your plate nutrients..."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pt-1">
          {/* Plate Image Thumbnail */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl border-2 border-black overflow-hidden bg-neutral-100 shrink-0 shadow-[2px_2px_0px_#000]">
            <img
              src={customPhotoUrl || activeMeal.imagePlaceholder}
              alt={customPhotoUrl ? "Your Plate" : currentName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details & Advice */}
          <div className="flex-1 space-y-2 text-center sm:text-left min-w-0">
            {/* 10-Star Rating & Pill */}
            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              <StarRating count={currentStars} max={10} />
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-amber-400 text-black font-black text-xs border border-black shadow-2xs">
                {currentStars} / 10 Stars
              </span>
            </div>

            {/* Meal Title */}
            <h4 className="font-serif font-black text-lg sm:text-xl text-ink leading-snug">
              {customPhotoUrl
                ? normLoc === "hi" ? "आपकी थाली" : normLoc === "as" ? "আপোনাৰ থালি" : "Your Fresh Plate"
                : currentName}
            </h4>

            {/* Simple Friendly Advice */}
            <p className="text-xs sm:text-sm text-ink font-medium leading-relaxed">
              "{currentAdvice}"
            </p>

            {/* Actions: Listen button + Retake button */}
            <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
              <button
                type="button"
                onClick={handleListenAdvice}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface border-2 border-black text-xs font-bold text-ink shadow-[1.5px_1.5px_0px_#000] hover:bg-surface-muted active:scale-95 cursor-pointer"
              >
                <Volume2 className="h-4 w-4 text-tea stroke-[2.5]" />
                <span>{normLoc === "hi" ? "सुनें" : normLoc === "as" ? "শুনক" : "Listen"}</span>
              </button>

              {customPhotoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    playTapFeedback();
                    setCustomPhotoUrl(null);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-ink-secondary hover:text-black cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>{normLoc === "hi" ? "बदलें" : normLoc === "as" ? "সলনি কৰক" : "Reset"}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
