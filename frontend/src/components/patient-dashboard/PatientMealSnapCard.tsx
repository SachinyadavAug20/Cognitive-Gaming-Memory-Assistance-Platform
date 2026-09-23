"use client";

import { useState, useRef, useId } from "react";
import {
  Camera,
  Sparkles,
  Volume2,
  CheckCircle2,
  RotateCcw,
  Heart,
  Droplets,
  Utensils,
  ChevronRight,
  Smile,
} from "lucide-react";
import { playTapFeedback, playEncourage, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { useLocale } from "next-intl";
import { useCareSyncStore } from "@/lib/careSyncStore";

interface MealPreset {
  id: string;
  name: Record<string, string>;
  emoji: string;
  score: number;
  badge: Record<string, string>;
  advice: Record<string, string>;
  imagePlaceholder: string;
}

const PRESET_MEALS: MealPreset[] = [
  {
    id: "dal_rice_veg",
    emoji: "🍛",
    name: {
      en: "Rice, Dal & Leafy Greens",
      hi: "दाल, चावल और हरी सब्जी",
      as: "ভাত, মগু ডাইল আৰু সেউজীয়া শাক",
      bn: "ভাত, ডাল ও সবুজ শাক",
      mr: "वरण-भात आणि पालेभाजी",
      ne: "दाल, भात र हरियो साग",
      mni: "চেঙুম, খাংহৌ অমসুং হৌবী",
      brx: "मैखाम, दाल आरो गोथां बेगर",
      grt: "Mi, dal aro sam gital",
      kha: "Ja, dai bad jhur",
      lus: "Chaw, dal leh thlai hnah",
    },
    score: 94,
    badge: {
      en: "🌟 Gold Brain Food",
      hi: "🌟 उत्तम मस्तिष्क आहार",
      as: "🌟 শ্ৰেষ্ঠ মস্তিষ্ক খাদ্য",
      bn: "🌟 সেরা মস্তিষ্ক পুষ্টি",
      mr: "🌟 उत्तम पोषण",
      ne: "🌟 उत्कृष्ट मस्तिष्क पोषण",
      mni: "🌟 অকনবা পুষ্টি",
      brx: "🌟 गाहाম गोसोनि आदार",
      grt: "🌟 Namgipa cha·ani",
      kha: "🌟 Jingbam ba bha tam",
      lus: "🌟 Chaw tha tak",
    },
    advice: {
      en: "Superb plate! Green spinach and lentils nourish memory cells and keep blood sugar very steady. Drink 1 glass of warm water after eating.",
      hi: "बहुत बढ़िया भोजन! हरी सब्जियां और दाल मस्तिष्क की कोशिकाओं को पोषण देती हैं और शर्करा को स्थिर रखती हैं। खाने के बाद एक गिलास गुनगुना पानी पिएं।",
      as: "বৰ পুষ্টিকৰ সাজ! সেউজীয়া শাক আৰু মগু ডালে স্মৃতিশক্তি সতেজ ৰাখে আৰু তেজৰ চেনিৰ মাত্ৰা নিয়ন্ত্ৰণত ৰাখে। খোৱাৰ পিছত এগিলাচ কুহুমীয়া পানী খাব।",
      bn: "চমৎকার খাবার! সবুজ শাক ও ডাল মস্তিষ্কের স্মৃতিশক্তি সতেজ রাখে এবং সুগার নিয়ন্ত্রণে রাখে। খাওয়ার পর এক গ্লাস জল খাবেন।",
      mr: "उत्कृष्ट आहार! पालेभाज्या आणि डाळ स्मरणशक्ती सुधारतात. जेवणानंतर एक ग्लास पाणी नक्की प्या.",
      ne: "धेरै राम्रो खाना! हरियो साग र दालले स्मरणशक्ति ताजा राख्छ। खानापछि एक गिलास मनतातो पानी पिउनुहोस्।",
      mni: "য়াম্না ফবা চানা-থক্নবা! সেউজীয়া শাক অমসুং দালনা ৱাখলবু মপাঙ্গল কনহল্লি। চাবা লোইবা মতমদা ঈশিং গ্লাস অমা থকপীয়ু।",
      brx: "जोबोद मोजां आदार! दाल आरो साखआ गोसोखौ मोजां लाखियो। जानायनि उनाव गांसे लोटा दै लों।",
      grt: "Namgipa cha·ani! Sam aro dal gisikko taridapna dakchaka. Cha·a ja·mano chi ringbo.",
      kha: "Ka jingbam ba shisha bha! U dai bad ki jhur ki pynshait ia ka bor pyrkhat. Dih shiklas ka um hadien ba la dep bam.",
      lus: "Chaw tha tak a ni! Thlai hnah leh dal hian hriatna a tichak. Chaw ei khamah tui lum no khat in rawh.",
    },
    imagePlaceholder: "/sample-images/patient_1_biren_borah/places/02_silpukhuri_daily_market.jpg",
  },
  {
    id: "roti_sabji",
    emoji: "🫓",
    name: {
      en: "Roti & Mixed Vegetables",
      hi: "रोटी और ताजी सब्जी",
      as: "ৰুটী আৰু ভাজি",
      bn: "রুটি ও তরকারি",
      mr: "पोळी आणि भाजी",
      ne: "रोटी र तरकारी",
      mni: "রোতি অমসুং ইঞ্চি",
      brx: "रुथि आरो बेगर",
      grt: "Roti aro sam",
      kha: "Ruti bad jhur",
      lus: "Chhangpui leh chawhmeh",
    },
    score: 88,
    badge: {
      en: "🌿 Steady Energy",
      hi: "🌿 स्थिर ऊर्जा",
      as: "🌿 নিৰৱচ্ছিন্ন শক্তি",
      bn: "🌿 ধীর ও শান্ত শক্তি",
      mr: "🌿 स्थिर ऊर्जा",
      ne: "🌿 स्थिर ऊर्जा",
      mni: "🌿 মপাঙ্গল",
      brx: "🌿 मोजां गोहो",
      grt: "🌿 Bil namgipa",
      kha: "🌿 Ka bor ba neh",
      lus: "🌿 Chakna nghet",
    },
    advice: {
      en: "Whole grains and spiced seasonal vegetables support good blood flow to the brain. Take gentle bites and enjoy every flavor.",
      hi: "साबुत अनाज और मौसमी सब्जियां दिमाग में रक्त संचार को स्वस्थ रखती हैं। धीरे-धीरे चबाकर खाएं और स्वाद का आनंद लें।",
      as: "আটাৰ ৰুটী আৰু বতৰৰ পাচলি মগজুৰ ৰক্ত চলাচলৰ বাবে অতি হিতকৰ। লাহে লাহে চোবাই খোৱাৰ তৃপ্তি লওক।",
      bn: "আটার রুটি এবং মরসুমি সবজি মস্তিষ্কের রক্ত সঞ্চালন ভালো রাখে। ধীরে ধীরে চিবিয়ে খান।",
      mr: "धान्य आणि ताज्या भाज्या मेंदूसाठी उत्तम असतात. शांतपणे खा आणि आनंद घ्या.",
      ne: "गहुँको रोटी र ताजा तरकारीले दिमागमा रक्तसञ्चार राम्रो बनाउँछ। राम्ररी चपाएर खानुहोस्।",
      mni: "রোতি অমসুং ইঞ্চি অসিনা হকচাংদা নুংঙাইবা পী। তপ্না চাউ।",
      brx: "रुथि आरो बेगरा गोसोनि थाखाय गाहाम। लासै लासै जा।",
      grt: "Roti aro sam gisikna namgipa ong·a. Ka·sinen cha·bo.",
      kha: "Ka ruti bad ki jhur ki pynkiew ia ka snam sha ka khlieh. Bam suki bad pynhun ia lade.",
      lus: "Chhangpui leh thlai hian thluak thisen kal a ti tha. Muangchangin ei rawh.",
    },
    imagePlaceholder: "/sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg",
  },
  {
    id: "khichdi_curd",
    emoji: "🍲",
    name: {
      en: "Warm Khichdi & Curd",
      hi: "गर्म खिचड़ी और ताजा दही",
      as: "গৰম খিচিৰি আৰু সতেজ দৈ",
      bn: "গরম খিচুড়ি ও টক দই",
      mr: "गरम खिचडी आणि ताजे दही",
      ne: "तातो खिचडी र दही",
      mni: "খিচিরি অমসুং দহি",
      brx: "गोलोम खिस्रि आरो दै",
      grt: "Khichdi aro dahi",
      kha: "Khichdi bad dahi",
      lus: "Khichdi lum leh dahi",
    },
    score: 91,
    badge: {
      en: "🌸 Gentle & Calming",
      hi: "🌸 सुपाच्य एवं शांतिकर",
      as: "🌸 সুপাচ্য আৰু শান্তিদায়ক",
      bn: "🌸 সহজে হজম ও শান্তিময়",
      mr: "🌸 पचनास हलके",
      ne: "🌸 सजिलै पच्ने र शान्त",
      mni: "🌸 নুংঙাইবা অমসুং হৌবা",
      brx: "🌸 गोसो गोरोन्थाय",
      grt: "🌸 Ka·sengatgipa",
      kha: "🌸 Jem ban tylliat",
      lus: "🌸 Pumpui tan tha",
    },
    advice: {
      en: "Gentle on your stomach! Curd provides friendly probiotics that directly communicate with brain neurotransmitters to reduce anxiety.",
      hi: "पेट के लिए बहुत हल्का और सुपाच्य! दही के गुण मस्तिष्क को शांत रखते हैं और मन को प्रसन्न करते हैं।",
      as: "পেটৰ বাবে অতি সুচল! দৈৰ প্ৰাকৃতিক উপাদানে মন শান্ত আৰু চিন্তামুক্ত ৰাখিবলৈ সহায় কৰে।",
      bn: "সহজপাচ্য ও আরামদায়ক! দই মনের উদ্বেগ কমায় এবং মনকে প্রফুল্ল রাখে।",
      mr: "पोटासाठी हलके! दही मेंदूला शांत ठेवण्यास मदत करते आणि ताण कमी करते.",
      ne: "पेटको लागि धेरै हल्का! दहीले दिमाग शान्त राख्न र चिन्ता कम गर्न मद्दत गर्छ।",
      mni: "পুক্কীদমক য়াম্না ফই! দহিনা ৱাখলবু শান্ত ওইহল্লি।",
      brx: "उदैखौ मोजां लाखियो! दहिया गोसोखौ गोजोन खालामो।",
      grt: "Okkina namgipa! Dahi gisikko tom·tomata.",
      kha: "Jem ban tylliat! Ka dahi ka pynjem ia ka jingmut jingpyrkhat.",
      lus: "Pumpui tan a tha em em! Dahi hian thluak a ti dam sawng sawng thin.",
    },
    imagePlaceholder: "/sample-images/patient_1_biren_borah/places/03_silpukhuri_hari_namghar.jpg",
  },
  {
    id: "fruits_milk",
    emoji: "🍌",
    name: {
      en: "Fresh Fruit & Warm Milk",
      hi: "ताजे फल और गर्म दूध",
      as: "পকা ফল আৰু গৰম গাখীৰ",
      bn: "তাজা ফল ও গরম দুধ",
      mr: "ताजी फळे आणि गरम दूध",
      ne: "ताजा फलफूल र तातो दूध",
      mni: "হৈহৌ অমসুং সঙোম",
      brx: "गोथां फिथाइ आरो गाइखेर",
      grt: "Bite gital aro sok",
      kha: "Ki soh bad ka dud lum",
      lus: "Thei thar leh hnute lum",
    },
    score: 92,
    badge: {
      en: "✨ Antioxidant Glow",
      hi: "✨ एंटीऑक्सीडेंट से भरपूर",
      as: "✨ এন্টিঅক্সিডেন্ট ভৰপূৰ",
      bn: "✨ অ্যান্টিঅক্সিডেন্টে ভরপুর",
      mr: "✨ जीवनसत्त्वयुक्त",
      ne: "✨ भिटामिनयुक्त",
      mni: "✨ পুষ্টি লৈরবা",
      brx: "✨ गोसो मोजां खालामग्रा",
      grt: "✨ Namgipa bil",
      kha: "✨ Ka jingbam pynshait",
      lus: "✨ Thluak enkawlna",
    },
    advice: {
      en: "Antioxidants from fresh fruits protect memory connections. Warm milk relaxes muscles and prepares you for deep, peaceful rest.",
      hi: "फलों के पोषक तत्व याददाश्त को सुरक्षित रखते हैं। गर्म दूध शरीर को आराम देता है और गहरी शांति लाता है।",
      as: "ফলৰ ভিটামিনে মগজুৰ স্মৃতিকোষবোৰ সজীৱ কৰে। গৰম গাখীৰে দেহা জুৰাই গভীৰ শান্তি আৰু নিদ্ৰা আনে।",
      bn: "তাজা ফলের পুষ্টি স্মৃতিশক্তি বাড়ায় এবং গরম দুধ শরীরকে আরাম দিয়ে শান্ত ঘুম এনে দেয়।",
      mr: "फळे स्मरणशक्ती वाढवतात आणि गरम दूध शरीराला शांत करून गाढ झोप देते.",
      ne: "फलफूलले स्मरणशक्ति बलियो बनाउँछ। तातो दूधले शरीरलाई आराम दिन्छ।",
      mni: "হৈহৌ অসিনা নিংশিং মপাঙ্গল পীরি। সঙোম অসিনা হকচাংবু শান্ত ওইহল্লি।",
      brx: "फिथाइया गोसोखौ मोजां लाखियो आरो गाइखेरा गोसोखौ गोजोन खालामो।",
      grt: "Biterang gisikko namata aro sok an·sengata.",
      kha: "Ki soh ki pynshait ia ka bor kynmaw bad ka dud ka pynjem ia ka met.",
      lus: "Thei hian hriatna a vawng tha a, hnute lum hian taksa a ti hahdam thin.",
    },
    imagePlaceholder: "/sample-images/patient_1_biren_borah/places/05_dighalipukhuri_lake_park.jpg",
  },
];

export function PatientMealSnapCard({ patientName = "Baba" }: { patientName?: string }) {
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toggleMealTaken = useCareSyncStore((s) => s.toggleMealTaken);
  const uniqueInputId = useId();

  const [activeMeal, setActiveMeal] = useState<MealPreset>(PRESET_MEALS[0]);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const currentName = activeMeal.name[normLoc] || activeMeal.name.en;
  const currentBadge = activeMeal.badge[normLoc] || activeMeal.badge.en;
  const currentAdvice = activeMeal.advice[normLoc] || activeMeal.advice.en;

  const handleCapturePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playTapFeedback();
    setAnalyzing(true);

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setCustomPhotoUrl(reader.result);

        // Intelligent simulated food score & encouragement
        setTimeout(() => {
          setAnalyzing(false);
          playEncourage();
          toggleMealTaken("lunch");

          const praiseMsg =
            normLoc === "hi"
              ? `शाबाश ${patientName} जी! आपके भोजन की तस्वीर दर्ज हो गई है। यह आपकी याददाश्त के लिए 92 प्रतिशत उत्तम है!`
              : normLoc === "as"
              ? `বৰ সুন্দৰ ${patientName}! আপোনাৰ আহাৰৰ ছবিখন সংৰক্ষণ কৰা হ'ল। ই মস্তিষ্কৰ বাবে ৯২ নম্বৰ পাইছে!`
              : `Great job ${patientName}! Your meal photo has been saved. It scored 92 out of 100 for healthy memory!`;

          unlockAudio();
          speak(praiseMsg, normLoc, 0.85);
        }, 1200);
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
    const fullSpeech = `${currentName}. ${currentBadge}. ${currentAdvice}`;
    speak(fullSpeech, normLoc, 0.85);
  };

  const handleReset = () => {
    playTapFeedback();
    setCustomPhotoUrl(null);
  };

  return (
    <div className="border-3 border-black bg-gradient-to-br from-amber-50 via-emerald-50 to-teal-50 rounded-3xl p-5 sm:p-7 shadow-[5px_5px_0px_#000] space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center text-3xl shrink-0 shadow-[2px_2px_0px_#000]">
            📸
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider bg-tea text-white px-2 py-0.5 rounded border border-black">
                {normLoc === "hi" ? "सरल भोजन जांच" : normLoc === "as" ? "আহাৰ পৰীক্ষা" : "Simple Meal Check"}
              </span>
              <span className="text-xs font-bold text-amber-800 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>Memory Food</span>
              </span>
            </div>
            <h3 className="font-serif font-black text-2xl sm:text-3xl text-ink mt-0.5">
              {normLoc === "hi"
                ? "थाली की तस्वीर लें"
                : normLoc === "as"
                ? "আপোনাৰ আহাৰৰ ছবি তোলক"
                : "Snap What You Eat"}
            </h3>
          </div>
        </div>

        {/* Big Camera Snap CTA */}
        <label
          htmlFor={uniqueInputId}
          className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-tea text-white font-serif font-black text-sm sm:text-base border-3 border-black shadow-[3px_3px_0px_#000] hover:bg-emerald-800 active:scale-95 cursor-pointer transition-all shrink-0"
        >
          <Camera className="h-5 w-5 text-amber-300 stroke-[2.5]" />
          <span>
            {normLoc === "hi"
              ? "कैमरा खोलें 📸"
              : normLoc === "as"
              ? "কেমেৰা তোলক 📸"
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

      <p className="text-sm font-bold text-ink-secondary">
        {normLoc === "hi"
          ? "भोजन की तस्वीर लें या नीचे से चुनें — हम तुरंत बताएंगे यह आपकी याददाश्त के लिए कितना अच्छा है!"
          : normLoc === "as"
          ? "আহাৰৰ ছবি তোলক বা তলৰ পৰা বাছক — আমি জনাম ই আপোনাৰ স্মৃতিশক্তিৰ বাবে কিমান উপকাৰী!"
          : "Snap a photo of your plate or tap what you are eating to get an instant healthy score and friendly advice!"}
      </p>

      {/* Preset 1-Tap Food Choices */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {PRESET_MEALS.map((meal) => {
          const isSelected = !customPhotoUrl && activeMeal.id === meal.id;
          const label = meal.name[normLoc] || meal.name.en;
          return (
            <button
              key={meal.id}
              onClick={() => handleSelectPreset(meal)}
              className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 active:scale-95 ${
                isSelected
                  ? "border-black bg-amber-200 shadow-[3px_3px_0px_#000] scale-[1.02]"
                  : "border-black/20 bg-white hover:border-black/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{meal.emoji}</span>
                <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/5">
                  {meal.score}/100
                </span>
              </div>
              <span className="text-xs font-bold text-ink leading-tight">
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Score & Advice Spotlight Banner */}
      <div className="border-3 border-black bg-white rounded-3xl p-5 sm:p-6 shadow-[3px_3px_0px_#000] space-y-4">
        {analyzing ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-12 h-12 border-4 border-tea border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-serif font-black text-lg text-ink">
              {normLoc === "hi" ? "भोजन की जांच हो रही है..." : normLoc === "as" ? "আহাৰ পৰীক্ষা কৰা হৈছে..." : "Checking your plate nutrients..."}
            </p>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            {/* Left: Plate Photo Thumbnail */}
            <div className="w-full md:w-44 h-40 rounded-2xl border-2 border-black overflow-hidden bg-neutral-100 shrink-0 relative shadow-sm">
              <img
                src={customPhotoUrl || activeMeal.imagePlaceholder}
                alt="Meal on Plate"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/75 text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-full backdrop-blur-xs">
                {customPhotoUrl ? "Your Plate 📸" : activeMeal.emoji + " Today's Plate"}
              </div>
            </div>

            {/* Middle: Big Score & Advice */}
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2.5 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-xl bg-tea text-white font-mono font-black text-sm border-2 border-black shadow-[2px_2px_0px_#000]">
                  <span>🌟 Score:</span>
                  <span className="text-amber-300 text-base">{customPhotoUrl ? 92 : activeMeal.score} / 100</span>
                </span>
                <span className="text-xs font-black uppercase tracking-wider text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-xl border border-emerald-500">
                  {currentBadge}
                </span>
              </div>

              <h4 className="font-serif font-black text-xl text-ink">
                {customPhotoUrl ? (normLoc === "hi" ? "आपकी स्वादिष्ट थाली" : normLoc === "as" ? "আপোনাৰ পুষ্টিকৰ থালি" : "Your Fresh Plate") : currentName}
              </h4>

              <p className="text-sm font-medium text-ink leading-relaxed italic bg-amber-50/80 p-3 rounded-xl border border-black/15">
                "{currentAdvice}"
              </p>
            </div>

            {/* Right: Audio Listen Button */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleListenAdvice}
                className="w-16 h-16 rounded-2xl bg-amber-400 text-black border-3 border-black shadow-[3px_3px_0px_#000] hover:bg-amber-300 active:scale-95 flex flex-col items-center justify-center cursor-pointer transition-all"
                title="Listen to advice"
              >
                <Volume2 className="h-6 w-6 text-black stroke-[2.5]" />
                <span className="text-[10px] font-black uppercase tracking-wider mt-0.5">
                  {normLoc === "hi" ? "सुनें" : normLoc === "as" ? "শুনক" : "Listen"}
                </span>
              </button>
              <span className="text-[10px] text-ink-secondary font-mono">
                Tap to hear
              </span>
            </div>
          </div>
        )}

        {customPhotoUrl && (
          <div className="pt-2 border-t border-black/10 flex justify-end">
            <button
              onClick={handleReset}
              className="text-xs font-bold text-ink-secondary hover:text-black flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{normLoc === "hi" ? "दूसरी तस्वीर लें" : normLoc === "as" ? "আন এখন তোলক" : "Snap Another Photo"}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
