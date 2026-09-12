"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Heart,
  Smile,
  Sun,
  Sparkles,
  Volume2,
  RotateCcw,
  CheckCircle2,
  Users,
  Eye,
  HandHeart,
  Flame,
} from "lucide-react";
import { GameShell } from "@/components/games/GameShell";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import {
  playPress,
  playCorrect,
  playComplete,
  playWaterRipple,
  playLifeSong,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { calculateVanishingCue, validateMoveErrorless } from "@/lib/errorlessLearning";

export type EmotionKey = "joy" | "peace" | "affection" | "wonder" | "gratitude";

export interface EmotionScenario {
  id: string;
  targetEmotion: EmotionKey;
  personName: { en: string; hi: string; as: string };
  relation: { en: string; hi: string; as: string };
  scenarioTitle: { en: string; hi: string; as: string };
  description: { en: string; hi: string; as: string };
  facialCues: { en: string; hi: string; as: string };
  audioPrompt: { en: string; hi: string; as: string };
  avatarColor: string;
  avatarBg: string;
  scenarioIcon: typeof Smile;
}

export interface EmotionOption {
  key: EmotionKey;
  label: { en: string; hi: string; as: string };
  tagline: { en: string; hi: string; as: string };
  icon: typeof Smile;
  color: string;
  bg: string;
}

export const EMOTIONS: EmotionOption[] = [
  {
    key: "joy",
    label: { en: "Joy & Smiles", hi: "आनंद और मुस्कान", as: "আনন্দ আৰু হাঁহি" },
    tagline: { en: "Warm cheerful celebration", hi: "उल्लास और खिलखिलाहट", as: "উলাহ আৰু আনন্দ" },
    icon: Smile,
    color: "text-amber-800",
    bg: "bg-amber-100",
  },
  {
    key: "peace",
    label: { en: "Peace & Calm", hi: "शांति और सुकून", as: "শান্তি আৰু প্ৰশান্তি" },
    tagline: { en: "Quiet, tranquil mind", hi: "शांत और स्थिर मन", as: "স্থিৰ আৰু শান্ত মন" },
    icon: Sun,
    color: "text-emerald-800",
    bg: "bg-emerald-100",
  },
  {
    key: "affection",
    label: { en: "Love & Care", hi: "स्नेह और अपनापन", as: "মৰম আৰু স্নেহ" },
    tagline: { en: "Tender family hug", hi: "दुलार और ममता", as: "পৰিয়ালৰ মৰম আৰু আদৰ" },
    icon: Heart,
    color: "text-rose-800",
    bg: "bg-rose-100",
  },
  {
    key: "wonder",
    label: { en: "Wonder & Surprise", hi: "आश्चर्य और कौतूहल", as: "আশ্চৰ্য আৰু বিস্ময়" },
    tagline: { en: "Wide bright joyful eyes", hi: "आँखों में चमक और उत्साह", as: "চকুৰ উজ্জ্বল বিস্ময়" },
    icon: Sparkles,
    color: "text-purple-800",
    bg: "bg-purple-100",
  },
  {
    key: "gratitude",
    label: { en: "Blessing & Gratitude", hi: "आशीर्वाद और आभार", as: "আশীর্বাদ আৰু কৃতজ্ঞতা" },
    tagline: { en: "Folded hands & thankful heart", hi: "हाथ जोड़कर धन्यवाद", as: "হাত যোৰ কৰি প্ৰাৰ্থনা" },
    icon: HandHeart,
    color: "text-orange-800",
    bg: "bg-orange-100",
  },
];

const SCENARIOS: EmotionScenario[] = [
  {
    id: "grandchild-laugh",
    targetEmotion: "joy",
    personName: { en: "Little Rahul", hi: "छोटा राहुल", as: "মৰমৰ ৰাহুল" },
    relation: { en: "Grandson", hi: "नाती", as: "নাতি" },
    scenarioTitle: {
      en: "Festive Bihu Dhol & Sweet Pitha",
      hi: "बिहू उत्सव और मीठे पीठे की खुशी",
      as: "বিহুৰ ঢোল আৰু তিলপিঠাৰ আনন্দ",
    },
    description: {
      en: "Rahul is laughing heartily as he plays the rhythm on his miniature folk drum and shares a hot sweet sesame pitha with you.",
      hi: "राहुल अपने छोटे ढोल पर ताल बजाते हुए खिलखिलाकर हँस रहा है और आपको गरम तिल का पीठा खिला रहा है।",
      as: "ৰাহুলে সৰু ঢোলটোত চাপৰি বজাই মনৰ আনন্দেৰে হাঁহিছে আৰু আপোনাক গৰম তিলপিঠা খাবলৈ দিছে।",
    },
    facialCues: {
      en: "Sparkling crinkled eyes, wide bright smile, teeth showing with laughter.",
      hi: "आँखों के कोनों पर खुशी की चमक और चेहरे पर खिली हुई चौड़ी मुस्कान।",
      as: "চকুৰ কোণত আনন্দৰ উজ্বলতা আৰু মুখত হাঁহি বিৰিঙি উঠিছে।",
    },
    audioPrompt: {
      en: "Look at your grandson Rahul's face as he laughs and shares sweets. Which warm emotion is he expressing?",
      hi: "अपने नाती राहुल के हँसते हुए चेहरे को देखें। वह कौन सा सुखद भाव प्रकट कर रहा है?",
      as: "আপোনাৰ নাতি ৰাহুলৰ হাঁহিমুখীয়া মুখখনলৈ চাওক। সি কেনেকুৱা মনৰ ভাৱ প্ৰকাশ কৰিছে?",
    },
    avatarColor: "text-amber-800",
    avatarBg: "bg-amber-100",
    scenarioIcon: Smile,
  },
  {
    id: "daughter-tea",
    targetEmotion: "affection",
    personName: { en: "Priyanka", hi: "प्रियंका", as: "প্ৰিয়ংকা" },
    relation: { en: "Daughter", hi: "बेटी", as: "মৰমৰ জীয়াৰী" },
    scenarioTitle: {
      en: "Warm Gamosa Shawl & Morning Tea",
      hi: "गर्म गमोसा शॉल और सुबह की चाय",
      as: "উমল গামোচা আৰু পুৱাৰ ৰঙা চাহ",
    },
    description: {
      en: "Your daughter Priyanka gently places a hand-woven warm cotton gamosa around your shoulders and hands you a steaming cup of cardamom red tea.",
      hi: "आपकी बेटी प्रियंका आपके कंधों पर प्यार से हाथ से बुनी गमोसा शॉल ओढ़ाती है और आदर से चाय का प्याला देती है।",
      as: "আপোনাৰ জীয়াৰী প্ৰিয়ংকাই অতি মৰমেৰে আপোনাৰ গাত এখন ফুলাম গামোচা মেৰিয়াই দিছে আৰু একাপ গৰম চাহ আগবঢ়াইছে।",
    },
    facialCues: {
      en: "Soft tender gaze, gentle loving smile, caring hands placed warmly.",
      hi: "कोमल स्नेहमयी आँखें और चेहरे पर गहरा अपनापन।",
      as: "স্নেহভৰা কোমল দৃষ্টি আৰু মৰমিয়াল মৃদু হাঁহি।",
    },
    audioPrompt: {
      en: "Look at your daughter Priyanka draping the warm shawl around you. Which deep family emotion is in her eyes?",
      hi: "प्रियंका को प्यार से शॉल ओढ़ाते हुए देखें। उसकी आँखों में परिवार का कौन सा पवित्र भाव है?",
      as: "প্ৰিয়ংকাই আপোনাক গামোচাখন মেৰিয়াই দিয়াৰ সময়ত তাইৰ চকুত কি ভাৱ ফুটি উঠিছে?",
    },
    avatarColor: "text-rose-800",
    avatarBg: "bg-rose-100",
    scenarioIcon: Heart,
  },
  {
    id: "monastery-sunrise",
    targetEmotion: "peace",
    personName: { en: "Grandmother Minati", hi: "दादी मीनाती", as: "আইতা মিনতি" },
    relation: { en: "Elder Matriarch", hi: "दादी", as: "বৰ আইতা" },
    scenarioTitle: {
      en: "Morning Sunlight Over River Hills",
      hi: "नदी और पहाड़ियों पर सुबह की सुनहरी धूप",
      as: "ব্ৰহ্মপুত্ৰৰ বুকুত পুৱাৰ ৰ'দ আৰু শান্তি",
    },
    description: {
      en: "Grandmother Minati sits quietly in the front veranda looking out at the calm river mist, gently taking slow, rhythmic breaths in the cool breeze.",
      hi: "दादी बरामदे में बैठकर नदी के शांत पानी और सुबह की ताज़ी हवा को निहार रही हैं, उनका मन पूरी तरह शांत है।",
      as: "আইতাই বাৰাণ্ডাত বহি নদীৰ শান্ত পানী আৰু শীতল বতাহজাক অনুভৱ কৰিছে। মনটো একেবাৰে নিস্তব্ধ আৰু শান্ত।",
    },
    facialCues: {
      en: "Relaxed forehead, steady peaceful breath, serene resting smile.",
      hi: "माथे पर कोई शिकन नहीं, शांत साँसें और चेहरे पर सुखद शांति।",
      as: "কপালত কোনো চিন্তাৰ ৰেখা নাই, স্থিৰ উশাহ আৰু পৰম শান্তিৰ মুখাৱয়ব।",
    },
    audioPrompt: {
      en: "Look at grandmother taking peaceful deep breaths in the morning sunlight. Which emotion describes her calm mind?",
      hi: "सुबह की धूप में शांत बैठी दादी को देखें। उनके चेहरे पर कौन सा सुकून भरा भाव है?",
      as: "পুৱাৰ ৰ'দত শান্ত হৈ বহি থকা আইতাৰ মুখলৈ চাওক। এইটো কি মনৰ ভাৱ?",
    },
    avatarColor: "text-emerald-800",
    avatarBg: "bg-emerald-100",
    scenarioIcon: Sun,
  },
  {
    id: "hornbill-bird",
    targetEmotion: "wonder",
    personName: { en: "Young Manash", hi: "छोटा मानस", as: "সৰু মানস" },
    relation: { en: "Grandchild", hi: "नाती", as: "নাতি" },
    scenarioTitle: {
      en: "Great Hornbill Lands on the Mango Tree",
      hi: "आम के पेड़ पर बैठा सुंदर धनेश पक्षी",
      as: "আমজোপাত পৰা ধুনীয়া ধনেশ পক্ষী",
    },
    description: {
      en: "Young Manash points up at the mango branch where a majestic great hornbill bird has just landed, its golden feathers glowing in the sun.",
      hi: "मानस आम के पेड़ पर बैठे सुंदर धनेश पक्षी को देखकर आँखें फैलाकर विस्मय से उंगली उठा रहा है।",
      as: "আমজোপাত এটা ধুনীয়া ধনেশ পক্ষী পৰা দেখি মানসে চকু দুটা ডাঙৰকৈ মেলি আচৰিত হৈ আঙুলিয়াই দেখুৱাইছে।",
    },
    facialCues: {
      en: "Wide rounded eyes, slightly parted lips, delighted curiosity.",
      hi: "आश्चर्य से खुली आँखें और चेहरे पर कौतूहल भरी उत्सुकता।",
      as: "বিস্ময়ত ডাঙৰ হোৱা দুচকু আৰু আনন্দৰ কৌতূহল।",
    },
    audioPrompt: {
      en: "Look at young Manash discovering the beautiful bird in the tree. Which emotion is shining in his open eyes?",
      hi: "पेड़ पर पक्षी को देखकर मानस की फैली हुई आँखों को देखें। वह कौन सा भाव प्रकट कर रहा है?",
      as: "গছজোপাত ধুনীয়া চৰাইটোক দেখি মানসৰ মুখত কি ভাৱ ফুটি উঠিছে?",
    },
    avatarColor: "text-purple-800",
    avatarBg: "bg-purple-100",
    scenarioIcon: Sparkles,
  },
  {
    id: "evening-prayer",
    targetEmotion: "gratitude",
    personName: { en: "Elder Bhupen", hi: "बुजुर्ग भूपेन", as: "বৰদেউতা ভূপেন" },
    relation: { en: "Elder Patriarch", hi: "बुजुर्ग", as: "পৰিয়ালৰ জ্যেষ্ঠ" },
    scenarioTitle: {
      en: "Mati Saki Twilight Prayer & Folded Hands",
      hi: "संध्या आरती और कृतज्ञता का दीया",
      as: "সন্ধ্যাৰ নামঘৰৰ চাকি আৰু সেৱা",
    },
    description: {
      en: "Bhupen lights the mustard oil lamp at the home prayer altar, folding his palms with heartfelt reverence and blessing all children.",
      hi: "भूपेन संध्या के समय मिट्टी का दीया जलाकर दोनों हाथ जोड़कर परिवार के सभी बच्चों के लिए आशीर्वाद मांग रहे हैं।",
      as: "ভূপেনে সন্ধ্যাৰ মাটিৰ চাকিখন জ্বলাই ভক্তিভাৱেৰে হাত যোৰ কৰি পৰিয়ালৰ সকলোৰে মংগলৰ বাবে আশীৰ্বাদ কৰিছে।",
    },
    facialCues: {
      en: "Gently bowed head, folded palms near chest, grateful serene expression.",
      hi: "हाथ जुड़े हुए, सिर झुका हुआ और चेहरे पर आभार व आशीर्वाद का पावन भाव।",
      as: "হাত যোৰ কৰি মূৰ দোৱাই থকা আৰু মুখত ভক্তি আৰু কৃতজ্ঞতাৰ ভাৱ।",
    },
    audioPrompt: {
      en: "Look at elder Bhupen offering evening prayers with folded hands. Which noble emotion represents this moment of blessing?",
      hi: "हाथ जोड़कर संध्या वंदना कर रहे बुजुर्ग को देखें। यह कौन सा पावन आशीर्वाद और आभार का भाव है?",
      as: "হাত যোৰ কৰি সন্ধিয়া প্ৰাৰ্থনা কৰা বৰদেউতালৈ চাওক। এইটো কি আধ্যাত্মিক মনৰ ভাৱ?",
    },
    avatarColor: "text-orange-800",
    avatarBg: "bg-orange-100",
    scenarioIcon: Flame,
  },
];

export function FamilyEmotionsGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "family-emotions", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [selectedKey, setSelectedKey] = useState<EmotionKey | null>(null);
  const [hesitationSeconds, setHesitationSeconds] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const normLocale = locale === "hi" ? "hi" : locale === "as" ? "as" : "en";
  const currentScenario = SCENARIOS[scenarioIdx] || SCENARIOS[0];

  const guard = useSessionGuard({
    patientId,
    gameId: "family-emotions",
    level,
    startedAt,
    taps,
    errorCount,
  });

  // Track hesitation seconds for errorless vanishing cues
  useEffect(() => {
    if (phase !== "play") return;
    setHesitationSeconds(0);
    const interval = setInterval(() => {
      setHesitationSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, scenarioIdx]);

  const scaffold = calculateVanishingCue(hesitationSeconds, attemptCount);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  const startEmotionsGame = useCallback(() => {
    playPress();
    setPhase("play");
    setScenarioIdx(0);
    setSelectedKey(null);
    setHesitationSeconds(0);
    setAttemptCount(0);
    setScore(0);
    setTaps(0);
    setErrorCount(0);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    const firstScenario = SCENARIOS[0];
    speak(firstScenario.audioPrompt[normLocale], locale, rate);
  }, [normLocale, locale, rate]);

  const handleSelectEmotion = (chosenKey: EmotionKey) => {
    setTaps((t) => t + 1);
    setSelectedKey(chosenKey);

    const validation = validateMoveErrorless(chosenKey, currentScenario.targetEmotion);

    if (validation.isCorrect) {
      playCorrect();
      setScore((s) => s + 20);
      speak(
        normLocale === "hi"
          ? `बिल्कुल सही! यह ${currentScenario.personName[normLocale]} के चेहरे पर सच्चा भाव है।`
          : normLocale === "as"
          ? `অতি নিখুঁত! এইয়া ${currentScenario.personName[normLocale]}ৰ মুখৰ প্ৰকৃত ভাৱ।`
          : `Splendid! You recognized ${currentScenario.personName.en}'s true emotion.`,
        locale,
        rate
      );

      setTimeout(() => {
        const nextIdx = scenarioIdx + 1;
        if (nextIdx < SCENARIOS.length) {
          setScenarioIdx(nextIdx);
          setSelectedKey(null);
          setHesitationSeconds(0);
          setAttemptCount(0);
          speak(SCENARIOS[nextIdx].audioPrompt[normLocale], locale, rate);
        } else {
          stopSpeaking();
          playComplete();
          setPhase("done");
          guard.markCompleted();

          if (startedAt) {
            recordGameSession(patientId, {
              gameId: "family-emotions",
              level,
              outcome: "completed",
              score: 100,
              startedAt,
              taps: taps + 1,
              errorCount,
            });
          }
        }
      }, 2200);
    } else {
      // Errorless Scaffolding soft-blocking
      playWaterRipple();
      setErrorCount((e) => e + 1);
      setAttemptCount((a) => a + 1);
      speak(
        normLocale === "hi"
          ? `आराम से देखें। चेहरे के भाव को पहचानें। सुनहरे मार्गदर्शन वाले विकल्प को चुनें।`
          : normLocale === "as"
          ? `লাহেকৈ চাওক। মুখৰ ভাৱটোলৈ লক্ষ্য কৰক। সোণালী পোহৰৰ বিকল্পটো বাচক।`
          : `Take your time. Notice the facial cues. Select the gently highlighted emotion.`,
        locale,
        rate
      );
    }
  };

  if (loading) {
    return (
      <GameShell title="Family Emotions & Social Warmth" score={0}>
        <GameLoading />
      </GameShell>
    );
  }

  if (error) {
    return (
      <GameShell title="Family Emotions & Social Warmth" score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );
  }

  return (
    <GameShell
      title={
        normLocale === "hi"
          ? "भाव-मिलन: चेहरे के भाव और पारिवारिक स्नेह"
          : normLocale === "as"
          ? "ভাব-মিলন: মুখাবয়ব ও মনৰ ভাৱ"
          : "Family Emotions & Social Warmth"
      }
      score={score}
    >
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          {/* Header Badge */}
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-rose-600 text-white shadow-[4px_4px_0px_#000]">
            <Heart className="h-10 w-10 fill-white stroke-[2.2]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {normLocale === "hi"
                ? "भाव-मिलन: चेहरे के भाव और अपनापन"
                : normLocale === "as"
                ? "ভাব-মিলন: মুখাবয়ব ও মনৰ ভাৱ"
                : "Family Emotions & Social Warmth"}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {normLocale === "hi"
                ? "परिवार के सदस्यों के चेहरे के सुंदर भावों—आनंद, शांति, स्नेह और आश्चर्य—को पहचानें और मन को सुकून दें।"
                : normLocale === "as"
                ? "পৰিয়ালৰ সদস্যসকলৰ মুখৰ হাঁহি, মৰম, শান্তি আৰু আনন্দৰ ভাৱসমূহ চিনি লৈ মন শান্ত কৰক।"
                : "Cultivate emotional connection and social cognition by recognizing facial expressions of loved ones in familiar daily moments."}
            </p>
          </div>

          {/* DSM-5 Clinical Domain Explainer */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-rose-800 block mb-2">
              DSM-5 Social Cognition & Empathy Goals:
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-50 border border-amber-200">
                <Smile className="h-4 w-4 text-amber-700" />
                <span>Joy Recognition</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                <Sun className="h-4 w-4 text-emerald-700" />
                <span>Calm & Serenity</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-50 border border-rose-200">
                <Heart className="h-4 w-4 text-rose-700" />
                <span>Caregiver Empathy</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-purple-50 border border-purple-200">
                <Eye className="h-4 w-4 text-purple-700" />
                <span>Facial Affect</span>
              </div>
            </div>
          </div>

          <AudioPrompt
            text={
              normLocale === "hi"
                ? "भाव-मिलन अभ्यास में आपका स्वागत है। चलिए परिवार के सदस्यों के चेहरों को देखकर उनके मन के भावों को पहचानते हैं।"
                : normLocale === "as"
                ? "ভাব-মিলন খেললৈ স্বাগতম। আহক আমি পৰিয়ালৰ মুখৰ মৰম আৰু আনন্দৰ ভাৱবোৰ চিনি পাওঁ।"
                : "Welcome to Family Emotions. Look at each family scenario and select the emotion that fills their heart."
            }
            label="Listen to Audio"
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startEmotionsGame}>
            {normLocale === "hi"
              ? "अभ्यास शुरू करें 💖"
              : normLocale === "as"
              ? "খেল আৰম্ভ কৰক 💖"
              : "Start Emotion Journey 💖"}
          </ChunkyButton>
        </div>
      ) : phase === "play" && currentScenario ? (
        <div className="flex flex-col items-center gap-4 py-1 text-center">
          {/* PROGRESS STATUS BAR */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-rose-700" />
              <span className="font-serif text-xs sm:text-sm font-black text-ink">
                {currentScenario.personName[normLocale]} ({currentScenario.relation[normLocale]})
              </span>
            </div>
            <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300">
              Scenario {scenarioIdx + 1} of {SCENARIOS.length}
            </span>
          </div>

          {/* FAMILY SCENARIO NARRATIVE CARD */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[4px_4px_0px_#000] text-left space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 fill-rose-600 text-rose-600" />
                {currentScenario.scenarioTitle[normLocale]}
              </span>
              <button
                type="button"
                onClick={() => speak(currentScenario.audioPrompt[normLocale], locale, rate)}
                className="p-1 rounded-lg border border-black bg-amber-100 hover:bg-amber-200 cursor-pointer"
                title="Hear scenario readout"
              >
                <Volume2 className="h-4 w-4 text-ink" />
              </button>
            </div>

            {/* AVATAR & SCENARIO TEXT */}
            <div className="flex items-start gap-3.5">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-3 border-black ${currentScenario.avatarBg} shadow-xs animate-bounce`}
                style={{ animationDuration: "3s" }}
              >
                <currentScenario.scenarioIcon
                  className={`h-9 w-9 ${currentScenario.avatarColor} stroke-[2.3]`}
                />
              </div>

              <div className="space-y-1">
                <p className="font-serif text-sm sm:text-base font-bold text-ink leading-snug">
                  {currentScenario.description[normLocale]}
                </p>
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-ink-secondary bg-white/70 px-2 py-0.5 rounded-md border border-black/10">
                  <Eye className="h-3 w-3 text-rose-700 shrink-0" />
                  <span>{currentScenario.facialCues[normLocale]}</span>
                </div>
              </div>
            </div>
          </div>

          {/* EMOTION CHOICE BUTTONS */}
          <div className="w-full max-w-md space-y-2.5 pt-1">
            <p className="text-xs font-black uppercase tracking-wider text-ink-secondary text-left px-1">
              {normLocale === "hi"
                ? "चेहरे का सही भाव चुनें:"
                : normLocale === "as"
                ? "সঠিক মনৰ ভাৱ বাচক:"
                : "Select the matching emotion:"}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {EMOTIONS.map((emotion) => {
                const isTarget = emotion.key === currentScenario.targetEmotion;
                const isSelected = selectedKey === emotion.key;
                const isCueActive = isTarget && (scaffold.intensity !== "none" || attemptCount > 0);
                const EmotionIcon = emotion.icon;

                return (
                  <button
                    key={emotion.key}
                    type="button"
                    onClick={() => handleSelectEmotion(emotion.key)}
                    className={`btn-tactile relative flex items-center gap-3 rounded-2xl border-3 p-3.5 text-left shadow-[3px_3px_0px_#000] transition-all cursor-pointer ${
                      isSelected
                        ? isTarget
                          ? "bg-emerald-200 border-emerald-800 text-ink ring-4 ring-emerald-300"
                          : "bg-amber-100 border-amber-600 text-ink"
                        : isCueActive
                        ? scaffold.intensity === "guided_highlight" || attemptCount >= 2
                          ? "bg-amber-100 border-amber-600 ring-4 ring-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse scale-105"
                          : "bg-amber-50 border-amber-500 ring-4 ring-amber-400/80 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse"
                        : "bg-surface border-black hover:bg-amber-50/60"
                    }`}
                  >
                    {isCueActive && (
                      <span className="absolute -top-2.5 right-2 rounded-full bg-amber-200 border border-amber-500 px-1.5 py-0.2 text-[9px] font-black text-amber-950 uppercase tracking-tight shadow-xs">
                        Gentle Guide ✨
                      </span>
                    )}

                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 ${
                        isCueActive ? "border-amber-500 bg-amber-100" : "border-black/20 " + emotion.bg
                      }`}
                    >
                      <EmotionIcon className={`h-6 w-6 ${isCueActive ? "text-amber-800" : emotion.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-xs sm:text-sm font-black text-ink leading-tight truncate">
                        {emotion.label[normLocale]}
                      </p>
                      <p className="text-[10px] font-bold text-ink-secondary leading-tight truncate mt-0.5">
                        {emotion.tagline[normLocale]}
                      </p>
                    </div>

                    {isSelected && isTarget && (
                      <CheckCircle2 className="h-5 w-5 text-emerald-800 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title={
            normLocale === "hi"
              ? "भाव-मिलन अभ्यास संपन्न!"
              : normLocale === "as"
              ? "ভাব-মিলন খেল সুকলমে সম্পূৰ্ণ!"
              : "Social Cognition Journey Mastered!"
          }
          subtitle={
            normLocale === "hi"
              ? "आपने परिवार के सदस्यों के चेहरों के सभी भावों को प्रेम और समझ के साथ पहचाना।"
              : normLocale === "as"
              ? "আপুনি পৰিয়ালৰ সকলো মৰম আৰু হাঁহিৰ ভাৱ অতি সুন্দৰভাৱে চিনি পালে।"
              : "You successfully recognized all family facial expressions with empathy, warmth, and accuracy."
          }
          xpEarned={150}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-rose-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> 5/5 Emotional Scenarios Synchronized
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-rose-800 text-white px-2 py-0.5">
                  DSM-5 Domain 6
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                Affective Resonance & Empathy Validated
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1">
                Facial expression recognition, positive social reading, and warmth towards family members demonstrated intact social cognition and emotional equilibrium.
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-rose-100 px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Heart className="h-4 w-4 text-rose-900 fill-rose-600" />
                  <span className="text-xs font-black">Play Gentle Family Song</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startEmotionsGame}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  {normLocale === "hi" ? "फिर से खेलें" : normLocale === "as" ? "পুনৰ খেলক" : "Play Journey Again"}
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
