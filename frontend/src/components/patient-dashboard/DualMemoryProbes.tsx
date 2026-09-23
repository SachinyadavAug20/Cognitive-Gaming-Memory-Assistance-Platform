"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Coffee,
  Sparkles,
  Volume2,
  CheckCircle2,
  Heart,
  History,
  Clock,
  Utensils,
  ChevronRight,
  Smile,
} from "lucide-react";
import { playTapFeedback, playEncourage, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { useLocale } from "next-intl";
import { useHyperCustomizationStore } from "@/store/useHyperCustomizationStore";
import { useCareSyncStore } from "@/lib/careSyncStore";

interface DualMemoryProbesProps {
  patientName?: string;
  langCode?: string;
  rate?: number;
}

interface BreakfastOption {
  id: string;
  emoji: string;
  labels: Record<string, string>;
}

const BREAKFAST_OPTIONS: BreakfastOption[] = [
  {
    id: "roti_sabji",
    emoji: "🫓",
    labels: {
      en: "Roti & Sabji",
      hi: "रोटी और सब्जी",
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
  },
  {
    id: "pitha_tea",
    emoji: "🍵",
    labels: {
      en: "Pitha & Red Tea",
      hi: "पीठा और लाल चाय",
      as: "পিঠা আৰু ৰঙা চাহ",
      bn: "পিঠে ও লাল চা",
      mr: "पीठा आणि लाल चहा",
      ne: "पिठा र रातो चिया",
      mni: "পীথা অমসুং চাহ",
      brx: "पिथा आरो साहा",
      grt: "Pitha aro cha",
      kha: "Pitha bad sha saw",
      lus: "Pitha leh thingpui sen",
    },
  },
  {
    id: "pohe_upma",
    emoji: "🥣",
    labels: {
      en: "Pohe / Upma / Rice",
      hi: "पोहा / उपमा",
      as: "চিৰা / জলপান",
      bn: "চিঁড়ে / উপমা",
      mr: "पोहे / उपमा",
      ne: "चिउरा / उपमा",
      mni: "চিরা / উপমা",
      brx: "सिरा / उपमा",
      grt: "Chira / Upma",
      kha: "Chira / Upma",
      lus: "Chira / Upma",
    },
  },
  {
    id: "fruits_milk",
    emoji: "🍌",
    labels: {
      en: "Banana & Warm Milk",
      hi: "केला और गर्म दूध",
      as: "কল আৰু গৰম গাখীৰ",
      bn: "কলা ও গরম দুধ",
      mr: "केळे आणि गरम दूध",
      ne: "केरा र तातो दूध",
      mni: "কোম্বিরেই অমসুং সঙোম",
      brx: "थालाइ आरो गाइखेर",
      grt: "Te·rik aro sok",
      kha: "Kait bad dud",
      lus: "Balhla leh hnute lum",
    },
  },
  {
    id: "bread_eggs",
    emoji: "🍞",
    labels: {
      en: "Toast Bread / Egg",
      hi: "टोस्ट ब्रेड / अंडा",
      as: "টোষ্ট পাউৰুটী / কণী",
      bn: "টোস্ট পাউরুটি / ডিম",
      mr: "टोस्ट ब्रेड / अंडे",
      ne: "टोस्ट पाउरोटी / अण्डा",
      mni: "ব্রেদ / য়েরুম",
      brx: "फाउरुथि / दावदै",
      grt: "Roti gital / Do·chi",
      kha: "Ruti / Pylleng",
      lus: "Chhangper / Tui",
    },
  },
];

interface RemoteMemoryCard {
  id: string;
  emoji: string;
  title: Record<string, string>;
  prompt: Record<string, string>;
  decade: string;
}

const REMOTE_MEMORIES: RemoteMemoryCard[] = [
  {
    id: "childhood_home",
    emoji: "🏡",
    decade: "1960s–1970s",
    title: {
      en: "Ancestral Village Home",
      hi: "पुश्तैनी गांव का घर",
      as: "পূৰ্বপুৰুষৰ গাঁৱৰ ঘৰ",
      bn: "পৈতৃক গ্রামের বাড়ি",
      mr: "वडिलोपार्जित गावाचे घर",
      ne: "पुर्ख्यौली गाउँको घर",
      mni: "ইপা-ইপুগী খুঙ্গংগী য়ুম",
      brx: "आबौ-आबानि गामिनि न'",
      grt: "A·ba songni nok",
      kha: "Ka iing tynrai ha shnong",
      lus: "Pi leh pute khua",
    },
    prompt: {
      en: "Do you remember the thatched bamboo roof and the gentle breeze from the riverside courtyard?",
      hi: "क्या आपको बांस की छत और नदी किनारे वाले आंगन की ठंडी हवा याद है?",
      as: "নৈৰ পাৰৰ চোতালখন আৰু বাঁহৰ চালিৰ শীতল বতাহজাক মনত পৰেনে?",
      bn: "নদীর ধারের উঠোন আর বাঁশের চালার ঠান্ডা বাতাস মনে পড়ে?",
      mr: "नदीकाठचे अंगण आणि बांबूच्या छतावरची मंद झुळूक आठवते का?",
      ne: "नदी किनारको आँगन र बाँसको छानाको चिसो हावा याद छ?",
      mni: "তুরেল মপানগী সুমং অমসুং ৱাগী য়ুমথক মনীংথম্বা য়াইফবা নুংশিৎ নিংশিংবীরব্রা?",
      brx: "दैसा सेरनि आंगोन आरो औवानि अखान्द्रायाव बारनाय बारखौ गोसोखांओ नामा?",
      grt: "Chibima rikani sara aro noktepangni balwa namako gisik ra·ama?",
      kha: "Kynmaw ia ka lyer ba thiang na madan wah bad ka tnum siej?",
      lus: "Luikam zawl leh rua in chung khaw vawt chu i la hria em?",
    },
  },
  {
    id: "first_school",
    emoji: "🏫",
    decade: "1950s–1960s",
    title: {
      en: "First Village School & Brass Bell",
      hi: "पहला गांव का स्कूल और पीतल की घंटी",
      as: "প্ৰাথমিক বিদ্যালয় আৰু পিতলৰ ঘণ্টা",
      bn: "প্রাথমিক বিদ্যালয় ও পিতলের ঘণ্টা",
      mr: "पहिली शाळा आणि पितळी घंटा",
      ne: "पहिलो गाउँको स्कूल र घण्टी",
      mni: "অহানবা স্কুল অমসুং পিত্তলগী ঘন্টা",
      brx: "गिबिसिन फरायसालि आरो कंहानि घन्टा",
      grt: "Skanggipa skul aro brass konta",
      kha: "Ka skul banyngkong bad ka klok",
      lus: "Khawpuia sikul hmasa leh darri",
    },
    prompt: {
      en: "The sound of the morning bell ringing across the open green fields with slate and chalk.",
      hi: "स्लेट-बत्ती लेकर खुले हरे-भरे खेतों में सुबह की घंटी की गूंजती आवाज।",
      as: "শ্লেট-পেঞ্চিল হাতত লৈ সেউজীয়া পথাৰৰ মাজেৰে শুনা পুৱাৰ ঘণ্টাৰ শব্দ।",
      bn: "স্লেট-পেন্সিল হাতে সবুজ মাঠ পেরিয়ে সকালের ঘণ্টার সেই মিষ্টি শব্দ।",
      mr: "पाटी-पेन्सिल घेऊन हिरव्यागार शेतातून जाणारी सकाळच्या घंटेची किणकिण।",
      ne: "स्लेट-चक लिएर हरियाली खेत पार गर्दा बिहानको घण्टीको आवाज।",
      mni: "স্লেৎ পেঞ্চিল পায়রগা অহিংবদা খেনচবা অয়ুক্কী ঘন্টাগী মখোণ।",
      brx: "स्लेत आरो पेन्सिल लाना गांसे हाग्रामा गेजेरजों खोनानाय फुंनि घन्टा।",
      grt: "Slate aro pencil ra·e pringni konta ring·ako gisik ra·ama?",
      kha: "Ka jingriew ka klok mynstep ha madan lyngkha bad u mawthoh.",
      lus: "Zing darri leh thil ziahna lehkha bu kengin.",
    },
  },
  {
    id: "festival_feast",
    emoji: "🍲",
    decade: "Decades of Festivals",
    title: {
      en: "Mother's Festival Feast",
      hi: "मां के हाथ का त्योहार का खाना",
      as: "আইৰ হাতৰ উৎসৱৰ এসাঁজ",
      bn: "মায়ের হাতের উৎসবের রান্না",
      mr: "आईच्या हातचा सणाचा स्वयंपाक",
      ne: "आमाको हातको चाडपर्वको खाना",
      mni: "ইমাগী মখুৎকী কুমহৈগী চানা-থক্নবা",
      brx: "आइनि आखायनि फालिनायनि संनाय",
      grt: "Amani jakchi aro cha·ani",
      kha: "Ka jingbam lehniam ba shet ka kmie",
      lus: "Kût chawchhum tui tak nu siam",
    },
    prompt: {
      en: "The aroma of pure ghee, freshly steamed pitha, and fragrant Joha rice cooking on earthen stove.",
      hi: "मिट्टी के चूल्हे पर पकती देसी घी की खुशबू, गर्म पीठा और सुगंधित जोहा चावल।",
      as: "মাটিৰ চৌকাত পকা ঘিউৰ সুবাস, গৰম তিলপিঠা আৰু সুগন্ধি জোহা চাউলৰ ভাত।",
      bn: "মাটির উনুনে দেশি ঘিয়ের গন্ধ, গরম তিলপিঠে আর সুগন্ধি জোহা চালের অন্ন।",
      mr: "मातीच्या चुलीवरचे साजूक तूप, गरम मोदक आणि सुगंधी तांदळाचा भात।",
      ne: "माटोको चुलोमा पाकेको शुद्ध घिउ, तातो पिठा र बास्नादार चामलको भात।",
      mni: "লৈপাক্কী ফুগাদা থোংবা থৌগী মনম অমসুং হৌবী পীথা।",
      brx: "हादाउनि अखायाव संनाय घिउ, गोलोम पिथा आरो जौहा मैखामनि मोदोमनाय।",
      grt: "A·ani cha·chako song·gipa ghee aro pitha namgipa se·ani.",
      kha: "Ka jingiwbih u ghee bad u kba Joha ha ka dpei khyndew.",
      lus: "Leilung chawchhum leh hriak rimtui tak chu.",
    },
  },
];

export function DualMemoryProbes({ patientName = "Baba", langCode = "en", rate = 0.85 }: DualMemoryProbesProps) {
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || langCode || "en");
  const widgets = useHyperCustomizationStore((s) => s.widgets);

  const morningMedicineTaken = useCareSyncStore((s) => s.morningMedicineTaken);
  const setMorningMedicineTaken = useCareSyncStore((s) => s.setMorningMedicineTaken);
  const toggleMealTaken = useCareSyncStore((s) => s.toggleMealTaken);
  const familyPhotos = useCareSyncStore((s) => s.familyPhotos);

  // Storage states
  const [selectedBreakfast, setSelectedBreakfast] = useState<string | null>(null);
  const [activeRemoteIdx, setActiveRemoteIdx] = useState<number>(0);
  const [completedBreakfastToday, setCompletedBreakfastToday] = useState<boolean>(false);

  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const saved = localStorage.getItem(`cognicare_breakfast_${today}`);
      if (saved) {
        setSelectedBreakfast(saved);
        setCompletedBreakfastToday(true);
      }
    } catch {
      // ignore storage failure
    }
  }, []);

  if (!widgets.showDualRecall) return null;

  const handleToggleMedicine = () => {
    playTapFeedback();
    const nextState = !morningMedicineTaken;
    setMorningMedicineTaken(nextState);
    if (nextState) {
      playEncourage();
      const praise =
        normLoc === "hi"
          ? "बहुत अच्छा! आपने सुबह की दवा ले ली है।"
          : normLoc === "as"
          ? "বৰ সুন্দৰ! আপুনি পুৱাৰ ঔষধ সেৱন কৰিলে।"
          : "Very good! You took your morning medication.";
      speak(praise, normLoc, rate);
    }
  };

  const handleSelectBreakfast = (id: string, label: string) => {
    playTapFeedback();
    unlockAudio();
    setSelectedBreakfast(id);
    setCompletedBreakfastToday(true);
    toggleMealTaken("breakfast");

    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(`cognicare_breakfast_${today}`, id);
    } catch {
      // ignore
    }

    playEncourage();
    const praise =
      normLoc === "hi"
        ? `बहुत बढ़िया! आपने नाश्ते में ${label} खाया। पौष्टिक आहार याददाश्त तेज रखता है।`
        : normLoc === "as"
        ? `বৰ সুন্দৰ! আপুনি পুৱা ${label} খালে। এনে পুষ্টিকৰ খাদ্যই মন সুস্থিৰ ৰাখে।`
        : normLoc === "bn"
        ? `খুব ভালো! আপনি সকালে ${label} খেয়েছেন। পুষ্টিকর খাদ্য স্মৃতিশক্তি সতেজ রাখে।`
        : `Wonderful! You had ${label} for breakfast. Nourishing food keeps your memory sharp.`;

    speak(praise, normLoc, rate);
  };

  const allMemories = useMemo(() => {
    const list: Array<{
      id: string;
      emoji: string;
      title: string;
      decade: string;
      prompt: string;
      img?: string;
    }> = REMOTE_MEMORIES.map((m) => ({
      id: m.id,
      emoji: m.emoji,
      title: m.title[normLoc] || m.title.en,
      decade: m.decade,
      prompt: m.prompt[normLoc] || m.prompt.en,
    }));

    for (const fp of familyPhotos) {
      list.push({
        id: fp.id,
        emoji: "📸",
        title: fp.title,
        decade: fp.decade,
        prompt: fp.prompt,
        img: fp.img,
      });
    }
    return list;
  }, [familyPhotos, normLoc]);

  const activeRemote = allMemories[activeRemoteIdx % allMemories.length];
  const remoteTitle = activeRemote.title;
  const remotePrompt = activeRemote.prompt;

  const handleSpeakRemote = () => {
    unlockAudio();
    playTapFeedback();
    speak(remotePrompt, normLoc, rate);
  };

  const handleNextRemote = () => {
    playTapFeedback();
    setActiveRemoteIdx((prev) => (prev + 1) % allMemories.length);
  };

  return (
    <div className="space-y-4">
      {/* ── 1. INSTANT MEMORY PROBE (TODAY'S BREAKFAST) ── */}
      <div className="border-3 border-black bg-surface rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_#000]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-black flex items-center justify-center text-2xl shrink-0 shadow-[2px_2px_0px_#000]">
              🍳
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-amber-400 text-black px-2 py-0.5 rounded border border-black">
                  {normLoc === "hi" ? "ताजा याद" : normLoc === "as" ? "শেহতীয়া সোঁৱৰণি" : "Instant Recall"}
                </span>
                {completedBreakfastToday && (
                  <span className="flex items-center gap-1 text-xs font-bold text-tea bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>{normLoc === "hi" ? "दर्ज हो गया" : normLoc === "as" ? "সম্পূৰ্ণ হ’ল" : "Answered Today"}</span>
                  </span>
                )}
              </div>
              <h3 className="font-serif font-black text-xl sm:text-2xl text-ink mt-1">
                {normLoc === "hi"
                  ? "आज नाश्ते में क्या खाया था?"
                  : normLoc === "as"
                  ? "আজি পুৱাৰ আহাৰত কি খালে?"
                  : normLoc === "bn"
                  ? "আজ প্রাতঃরাশে কি খেয়েছেন?"
                  : "What did you have for breakfast today?"}
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              unlockAudio();
              const q =
                normLoc === "hi"
                  ? "आज सुबह नाश्ते में क्या खाया था? नीचे दिए विकल्पों में से चुनें।"
                  : normLoc === "as"
                  ? "আজি পুৱা আহাৰত কি খালে? তলৰ ছবিখন স্পৰ্শ কৰক।"
                  : "What did you have for breakfast today? Tap an option below.";
              speak(q, normLoc, rate);
            }}
            className="p-2.5 rounded-xl border-2 border-black bg-white hover:bg-amber-100 shadow-[2px_2px_0px_#000] cursor-pointer active:scale-95 shrink-0"
            title="Listen to question"
          >
            <Volume2 className="h-5 w-5 text-tea" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-ink-secondary mt-2">
          {normLoc === "hi"
            ? "अपनी याददाश्त को ताजगी दें — जो भी खाया हो उस पर स्पर्श करें:"
            : normLoc === "as"
            ? "পুৱাৰ খাদ্য মনত পেলাওক — যি খালে তাত আঙুলিৰে স্পৰ্শ কৰক:"
            : "Gentle episodic memory check — tap what you enjoyed this morning:"}
        </p>

        {/* 1-Tap Breakfast Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mt-4">
          {BREAKFAST_OPTIONS.map((opt) => {
            const isSelected = selectedBreakfast === opt.id;
            const label = opt.labels[normLoc] || opt.labels.en;
            return (
              <button
                key={opt.id}
                onClick={() => handleSelectBreakfast(opt.id, label)}
                className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center text-center transition-all cursor-pointer active:scale-95 ${
                  isSelected
                    ? "border-tea bg-tea/20 shadow-[3px_3px_0px_#000] scale-[1.02] font-black ring-2 ring-tea text-ink"
                    : "border-border/30 bg-surface hover:border-border hover:bg-surface-muted text-ink"
                }`}
              >
                <span className="text-3xl mb-1.5">{opt.emoji}</span>
                <span className="text-xs sm:text-sm font-bold text-ink leading-snug">{label}</span>
                {isSelected && (
                  <span className="mt-1.5 inline-block text-[10px] bg-tea text-white font-bold px-1.5 py-0.5 rounded-full">
                    ✓ {normLoc === "hi" ? "चुना गया" : "Selected"}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Medicine Quick Log Row */}
        <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-border/20">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-ink">
              {normLoc === "hi" ? "💊 सुबह की दवा:" : normLoc === "as" ? "💊 পুৱাৰ ঔষধ:" : "💊 Morning Medicine:"}
            </span>
            <span className="text-xs text-ink-secondary">
              {morningMedicineTaken
                ? (normLoc === "hi" ? "समय पर ले ली गई" : "Completed on time")
                : (normLoc === "hi" ? "अभी लेनी है" : "Pending")}
            </span>
          </div>
          <button
            onClick={handleToggleMedicine}
            className={`px-3.5 py-1.5 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              morningMedicineTaken
                ? "border-tea bg-tea text-white shadow-[2px_2px_0px_#000]"
                : "border-border/30 bg-surface hover:bg-surface-muted text-ink"
            }`}
          >
            <CheckCircle2 className={`h-4 w-4 ${morningMedicineTaken ? "text-white" : "text-neutral-400"}`} />
            <span>{morningMedicineTaken ? (normLoc === "hi" ? "ले ली गई ✓" : "Taken ✓") : (normLoc === "hi" ? "दवा ली? स्पर्श करें" : "Mark as Taken")}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
