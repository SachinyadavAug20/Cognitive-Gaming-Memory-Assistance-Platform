"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
  HeartHandshake,
  Paperclip,
  Volume2,
  Calendar,
  Sparkles,
  TreeDeciduous,
  Flower2,
  Leaf,
  Sprout,
} from "lucide-react";
import { usePatientDetail } from "@/games/usePatientDetail";
import { useAuthStore } from "@/store/useAuthStore";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { getMediaUrl } from "@/lib/api";
import { patientLangCode } from "@/lib/i18n";
import { MemoryLightbox } from "@/components/ui/MemoryLightbox";
import { playEncourage, playCalmTone, playGammaStimulation, playTapFeedback, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { speechRate, getDigitalBonsaiGrowthStage } from "@/games/config";
import { AudioToggle } from "@/components/ui/AudioToggle";
import { TherapySuiteGrid } from "@/components/patient-dashboard/TherapySuiteGrid";
import { MemorySpotlightCard } from "@/components/patient-dashboard/MemorySpotlightCard";
import { SensoryCalmCard } from "@/components/patient-dashboard/SensoryCalmCard";
import { DailyMoodTracker, type MoodKey } from "@/components/patient-dashboard/DailyMoodTracker";
import { DailyRoutineSchedule } from "@/components/patient-dashboard/DailyRoutineSchedule";
import { SaathiVoiceCompanion } from "@/components/patient-dashboard/SaathiVoiceCompanion";

const MOOD_LABEL_KEY: Record<MoodKey, string> = {
  peaceful: "wellbeing.moodPeaceful",
  okay: "wellbeing.moodOkay",
  caretaker: "wellbeing.moodCare",
};

function initialsFrom(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function moodStorageKey(patientId: number): string {
  return `cognicare-mood-${patientId}`;
}

function logMood(patientId: number, entry: { mood: string; at: string }): void {
  if (!patientId) return;
  try {
    const key = moodStorageKey(patientId);
    const raw = window.localStorage.getItem(key);
    const list = raw ? JSON.parse(raw) : [];
    list.push(entry);
    window.localStorage.setItem(key, JSON.stringify(list.slice(-200)));
  } catch {
    // ignore storage failures
  }
}

const PATIENT_BANNER_I18N: Record<
  string,
  {
    nhmSubtitle: string;
    bonsaiBadge: string;
    bonsaiTitle: string;
    bonsaiDesc: string;
    modulesCompleted: string;
    percentDone: string;
  }
> = {
  en: {
    nhmSubtitle: "National Health Mission // MDoNER Cognitive Assistance Platform",
    bonsaiBadge: "Digital Memory Bonsai",
    bonsaiTitle: "Lush Tea Sapling with Tender Leaves",
    bonsaiDesc: "Healthy green shoots are flourishing with every day of cognitive exercises.",
    modulesCompleted: "2 of 3 Modules Completed Today",
    percentDone: "66% Done",
  },
  hi: {
    nhmSubtitle: "राष्ट्रीय स्वास्थ्य मिशन // पूर्वोत्तर विकास मंत्रालय स्मृति सहायता",
    bonsaiBadge: "डिजिटल स्मृति बोनसाई",
    bonsaiTitle: "कोमल पत्तियों वाला हरा-भरा चाय पौधा",
    bonsaiDesc: "दैनिक संज्ञानात्मक अभ्यासों से हरी कोपलें खिल रही हैं।",
    modulesCompleted: "आज 3 में से 2 अभ्यास पूर्ण",
    percentDone: "66% पूर्ण",
  },
  as: {
    nhmSubtitle: "ৰাষ্ট্ৰীয় স্বাস্থ্য অভিযান // উত্তৰ-পূৰ্বাঞ্চল উন্নয়ন মন্ত্ৰালয়",
    bonsaiBadge: "ডিজিটেল স্মৃতি বনচাই",
    bonsaiTitle: "দুটি পাত এটি কুঁহিৰে জাতিষ্কাৰ চাহ পুলি",
    bonsaiDesc: "দৈনিক স্মৃতি অনুশীলনেৰে সেউজীয়া কুঁহিপাত ফুলি উঠিছে।",
    modulesCompleted: "আজি ৩টাৰ ভিতৰত ২টা অনুশীলন সম্পন্ন",
    percentDone: "৬৬% সম্পন্ন",
  },
  bn: {
    nhmSubtitle: "জাতীয় স্বাস্থ্য মিশন // উত্তর-পূর্বাঞ্চল উন্নয়ন মন্ত্রক",
    bonsaiBadge: "ডিজিটাল স্মৃতি বনসাই",
    bonsaiTitle: "কোমল পাতার সতেজ চা চারা",
    bonsaiDesc: "দৈনিক স্মৃতি অনুশীলনের মাধ্যমে সবুজ কুঁড়ি প্রস্ফুটিত হচ্ছে।",
    modulesCompleted: "আজ ৩টির মধ্যে ২টি থেরাপি সম্পন্ন",
    percentDone: "৬৬% সম্পন্ন",
  },
  mr: {
    nhmSubtitle: "राष्ट्रीय आरोग्य अभियान // MDoNER स्मृती मंच",
    bonsaiBadge: "डिजिटल स्मृती बोन्साय",
    bonsaiTitle: "कोवळ्या पानांचे चहाचे रोप",
    bonsaiDesc: "दैनिक मेंदूच्या सरावाने हिरवे कोंब बहरत आहेत.",
    modulesCompleted: "आज 3 पैकी 2 मॉड्यूल पूर्ण",
    percentDone: "66% पूर्ण",
  },
  ne: {
    nhmSubtitle: "राष्ट्रिय स्वास्थ्य मिसन // MDoNER स्मृति मञ्च",
    bonsaiBadge: "डिजिटल स्मृति बोन्साई",
    bonsaiTitle: "कलिलो चियाको बिरुवा",
    bonsaiDesc: "दैनिक अभ्यासले नयाँ पालुवाहरू पलाउँदै छन्।",
    modulesCompleted: "आज ३ मध्ये २ मोड्युल सम्पन्न",
    percentDone: "६६% सम्पन्न",
  },
  mni: {
    nhmSubtitle: "নেশনেল হেলথ মিসন // MDoNER মেমোরি প্লেতফোর্ম",
    bonsaiBadge: "দিজিতেল মেমোরি বোনসাই",
    bonsaiTitle: "অনৌবা চারোং খোম্বা চা পাম্বী",
    bonsaiDesc: "নোংমগী ৱাখলগী থৌরমশিংগা লোয়ননা মচাং লাক্লি।",
    modulesCompleted: "ঙসি ৩ গী মনুংদা ২ লোইরে",
    percentDone: "৬৬% লোইরে",
  },
  brx: {
    nhmSubtitle: "नेसनल हेल्थ मिसन // MDoNER मेमरि लोगो",
    bonsaiBadge: "दिजियेल मेमरि बोन्साइ",
    bonsaiTitle: "गोजां साहा बिफां",
    bonsaiDesc: "सानफ्रोमनि गेलेनायजों गोदान बिलाइ ओंखारबाय।",
    modulesCompleted: "दिनै 3 नि 2 खोन्दो जोबबाय",
    percentDone: "66% जोबबाय",
  },
  grt: {
    nhmSubtitle: "National Health Mission // MDoNER Gisik Dakchakani",
    bonsaiBadge: "Digital Memory Bonsai",
    bonsaiTitle: "Cha Bijakni Bolbi",
    bonsaiDesc: "Salanti gisik kalsusani baksa bolbi dal·batbaenga.",
    modulesCompleted: "Da·al module 3-oni 2 machotaha",
    percentDone: "66% Machotaha",
  },
  kha: {
    nhmSubtitle: "National Health Mission // MDoNER Jingiarap Jingmut",
    bonsaiBadge: "Digital Memory Bonsai",
    bonsaiTitle: "U Tiew Sha Ba Jyrngam",
    bonsaiDesc: "Ki sla ba jyrngam ki nang san man ka sngi.",
    modulesCompleted: "Mynta ka sngi 2 na 3 tylli ki jingialehkai la dep",
    percentDone: "66% La Dep",
  },
  lus: {
    nhmSubtitle: "National Health Mission // MDoNER Hriatrengna Tihchakna",
    bonsaiBadge: "Digital Memory Bonsai",
    bonsaiTitle: "Thingpui Chawrtuai Hring Cham",
    bonsaiDesc: "Nitintin thluak senna avangin chawrtuai hring mawi tak a lo chhuak zel e.",
    modulesCompleted: "Vawiinah module 3 zinga 2 i zo ta",
    percentDone: "66% Zo ta",
  },
};

const LOCALIZED_RELATIONS: Record<string, Record<string, string>> = {
  Son: {
    hi: "बेटा", as: "পুত্ৰ", bn: "ছেলে", mr: "मुलगा", ne: "छोरा", mni: "মচা নুপা", brx: "फिसा", grt: "De·gipa", kha: "Khun", lus: "Fapa", en: "Son"
  },
  Daughter: {
    hi: "बेटी", as: "জীয়াৰী", bn: "মেয়ে", mr: "मुलगी", ne: "छोरी", mni: "মচা নুপী", brx: "फिसोजो", grt: "Me·chik de", kha: "Khun kynthei", lus: "Fanu", en: "Daughter"
  },
  Wife: {
    hi: "पत्नी", as: "পত্নী", bn: "স্ত্রী", mr: "पत्नी", ne: "श्रीमती", mni: "নুপী", brx: "बिसि", grt: "Jik", kha: "Tnga", lus: "Nupui", en: "Wife"
  },
  Husband: {
    hi: "पति", as: "স্বামী", bn: "স্বামী", mr: "पती", ne: "श्रीमान", mni: "নুপা", brx: "हौवा", grt: "Se", kha: "Kpa", lus: "Pasal", en: "Husband"
  },
  Family: {
    hi: "परिवार", as: "পৰিয়াল", bn: "পরিবার", mr: "कुटुंब", ne: "परिवार", mni: "ইমুং", brx: "नखर", grt: "Nokgiparang", kha: "Kha-iiang", lus: "Chhungkua", en: "Family"
  }
};

const LOCALIZED_NAMES: Record<string, Record<string, string>> = {
  "Biren Borah": {
    hi: "बीरेन बोरा",
    as: "বীৰেন বৰা",
    bn: "বীরেন বোরা",
    mr: "बिरेन बोरा",
    ne: "बिरेन बोरा",
    mni: "বীরেন বোরা",
    brx: "बिरेन बरा",
    grt: "Biren Borah",
    kha: "Biren Borah",
    lus: "Biren Borah",
    en: "Biren Borah",
  },
  "Sunita Borah": {
    hi: "सुनीता बोरा",
    as: "সুনীতা বৰা",
    bn: "সুনীতা বোরা",
    mr: "सुनीता बोरा",
    ne: "सुनिता बोरा",
    mni: "সুনীতা বোরা",
    brx: "सुनिता बोरा",
    grt: "Sunita Borah",
    kha: "Sunita Borah",
    lus: "Sunita Borah",
    en: "Sunita Borah",
  },
  "Manash Borah": {
    hi: "मानस बोरा",
    as: "মানস বৰা",
    bn: "মানস বোরা",
    mr: "मानस बोरा",
    ne: "मानस बोरा",
    mni: "মানস বোরা",
    brx: "मानस बरा",
    grt: "Manash Borah",
    kha: "Manash Borah",
    lus: "Manash Borah",
    en: "Manash Borah",
  }
};

export default function PatientHome() {
  const t = useTranslations("patient");
  const locale = useLocale();
  const patient = useAuthStore((s) => s.patient);
  const patientId = patient?.id ?? 0;
  const { detail } = usePatientDetail();

  useIdleTimeout();

  const rawPatientName = detail?.name ?? patient?.name ?? "";
  const langCode = patientLangCode(
    locale || detail?.preferredLanguage || patient?.languagePreference
  );
  const rate = speechRate(detail);

  // Dynamic 11-Language Time of Day
  const hour = new Date().getHours();
  const timeOfDay: "morning" | "afternoon" | "evening" =
    hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  const REGIONAL_TIME_GREETINGS: Record<
    string,
    { morning: string; afternoon: string; evening: string }
  > = {
    en: { morning: "Good Morning", afternoon: "Good Afternoon", evening: "Good Evening" },
    hi: { morning: "शुभ प्रभात", afternoon: "शुभ दोपहर", evening: "शुभ संध्या" },
    as: { morning: "শুভ প্ৰভাত", afternoon: "শুভ দুপৰীয়া", evening: "শুভ গধূলি" },
    bn: { morning: "শুভ সকাল", afternoon: "শুভ দুপুর", evening: "শুভ সন্ধ্যা" },
    mr: { morning: "शुभ सकाळ", afternoon: "शुभ दुपार", evening: "शुभ संध्याकाळ" },
    ne: { morning: "शुभ प्रभात", afternoon: "शुभ दिउँसो", evening: "शुभ सन्ध्या" },
    mni: { morning: "য়াইফবা অয়ুক", afternoon: "য়াইফবা নুমিদাংৱাই", evening: "য়াইফবা নুমিদাং" },
    brx: { morning: "फुंनि गाहाम मोजां", afternoon: "सान्जुफानि मोजां", evening: "बेलासिनि मोजां" },
    grt: { morning: "Pringnam", afternoon: "Salgro nam", evening: "Attam nam" },
    kha: { morning: "Kumno mynstep", afternoon: "Kumno mynsngi", evening: "Kumno mynmiet" },
    lus: { morning: "Chibai zing", afternoon: "Chibai chhun", evening: "Chibai tlaial" },
  };

  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const timeGreeting =
    REGIONAL_TIME_GREETINGS[normLoc]?.[timeOfDay] ||
    REGIONAL_TIME_GREETINGS.en[timeOfDay];

  const localizedPatientName =
    (rawPatientName && LOCALIZED_NAMES[rawPatientName]?.[normLoc]) || rawPatientName;
  const patientName = localizedPatientName;

  const greeting = patientName
    ? `${timeGreeting}, ${patientName}!`
    : `${timeGreeting}!`;

  const heroText = `${greeting} ${t("orientation")} ${t("heroPrompt")}`;
  const avatarPhoto = detail ? getMediaUrl(detail.photoUrl) : null;
  const avatarInitials = rawPatientName ? initialsFrom(rawPatientName) : "";

  const bannerText = PATIENT_BANNER_I18N[normLoc] || PATIENT_BANNER_I18N.en;

  const joyTriggers =
    detail?.joyTriggers?.trim() || t("wellbeing.calmFallbackTriggers");
  const favoriteMusic = detail?.lifeStory?.favoriteMusic?.trim();
  const comfortText = favoriteMusic
    ? `${t("wellbeing.calmMusic", { music: favoriteMusic })} ${t(
        "wellbeing.calmTriggers",
        { triggers: joyTriggers }
      )}`
    : t("wellbeing.calmTriggers", { triggers: joyTriggers });

  const memoryItems = useMemo(() => {
    if (!detail) return [];
    const items: { text: string; photoUrl: string | null }[] = [];
    if (detail.familyMembers && detail.familyMembers.length > 0) {
      for (const m of detail.familyMembers) {
        const rawRel = m.relation || "Family";
        const locRel = LOCALIZED_RELATIONS[rawRel]?.[normLoc] || rawRel;
        const locNotes = m.notes || (normLoc === "hi" ? "प्रिय परिवारजन" : normLoc === "as" ? "মৰমৰ পৰিয়ালৰ সদস্য" : "Beloved family member");
        items.push({
          text: `${m.name} (${locRel}): ${locNotes}`,
          photoUrl: m.photoUrl ?? null,
        });
      }
    } else {
      // Default localized memory
      const defaultMemoryText =
        normLoc === "hi"
          ? "मानस बोरा (बेटा): ज्येष्ठ पुत्र, गुवाहाटी में कार्यरत। प्रत्येक रविवार को परिवार से मिलने आते हैं।"
          : normLoc === "as"
          ? "মানস বৰা (পুত্ৰ): বৰ ল'ৰা, গুৱাহাটীত কৰ্মৰত। প্ৰতি দেওবাৰে ঘৰলৈ আহে।"
          : normLoc === "bn"
          ? "মানস বোরা (ছেলে): বড় ছেলে, গুয়াহাটিতে কর্মরত। প্রতি রবিবার বাড়িতে আসে।"
          : "Manash Borah (Son): Eldest son, mechanical engineer in Guwahati. Visits every Sunday morning.";
      items.push({
        text: defaultMemoryText,
        photoUrl: null,
      });
    }
    if (detail.familiarPlaces) {
      for (const p of detail.familiarPlaces) {
        items.push({
          text: `${p.name}: ${p.description || "Cherished place"}`,
          photoUrl: p.photoUrl ?? null,
        });
      }
    }
    return items;
  }, [detail, normLoc]);

  const [memoryIndex, setMemoryIndex] = useState(0);
  const [memoryView, setMemoryView] = useState(false);
  const [lastMood, setLastMood] = useState<MoodKey | null>(null);

  const memoryOfDay =
    memoryItems.length > 0
      ? memoryItems[memoryIndex % memoryItems.length]
      : null;

  const shuffleMemory = () => {
    playTapFeedback();
    if (memoryItems.length > 1) {
      setMemoryIndex((prev) => (prev + 1) % memoryItems.length);
    }
  };

  const chooseMood = (key: MoodKey) => {
    playEncourage();
    setLastMood(key);
    logMood(patientId, { mood: key, at: new Date().toISOString() });
    speak(t(MOOD_LABEL_KEY[key]), langCode, rate);
  };

  const moodLabels: Record<MoodKey, string> = {
    peaceful: t("wellbeing.moodPeaceful"),
    okay: t("wellbeing.moodOkay"),
    caretaker: t("wellbeing.moodCare"),
  };

  // Formatted date string
  const todayDateStr = new Date().toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  return (
    <div className="min-h-[100vh] pb-32 flex flex-col bg-[#FAF6F0]">
      {/* Patient Header Banner */}
      <div className="bg-tea border-b-4 border-black px-4 pt-5 pb-5 md:px-6 text-white shadow-sm">
        <div className="max-w-3xl mx-auto flex flex-col gap-3.5">
          <div className="flex items-center justify-between gap-2 text-white/90">
            <div className="flex items-center gap-1.5">
              <Paperclip className="h-4 w-4" />
              <span className="text-[11px] font-black uppercase tracking-wider">
                {bannerText.nhmSubtitle}
              </span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 bg-black/20 px-2.5 py-0.5 rounded-lg border border-white/20 text-xs font-bold">
              <Calendar className="h-3.5 w-3.5 text-marigold" />
              <span>{todayDateStr}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-3 border-black bg-surface overflow-hidden flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#000]">
              {avatarPhoto ? (
                <Image
                  src={avatarPhoto}
                  alt={patientName || "Patient Portrait"}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <span className="text-xl md:text-2xl font-black text-tea">
                  {avatarInitials || "P"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-serif font-black text-2xl md:text-3xl text-white leading-tight">
                {greeting}
              </h1>
              <p className="text-white/90 text-sm md:text-base font-semibold mt-0.5">
                {t("orientation")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-1">
            <button
              type="button"
              onClick={() => {
                playTapFeedback();
                unlockAudio();
                speak(heroText, locale || langCode, rate);
              }}
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white px-3.5 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              <Volume2 className="h-4 w-4 text-tea" />
              <span>{t("listen")}</span>
            </button>
            <AudioToggle />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5 space-y-6 flex-1 w-full">
        {/* DAILY BRAIN PROGRESS & DIGITAL MEMORY BONSAI */}
        {(() => {
          const bonsai = getDigitalBonsaiGrowthStage(detail?.medicalProfile?.gameConfig?.startLevel ? 6 : 4);
          return (
            <div className="w-full rounded-2xl border-3 border-black bg-gradient-to-r from-amber-100 via-amber-50 to-emerald-50 p-4 shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-emerald-100 shadow-xs">
                  {bonsai.iconType === "cedar" ? (
                    <TreeDeciduous className="h-6 w-6 text-emerald-800" />
                  ) : bonsai.iconType === "orchid" ? (
                    <Flower2 className="h-6 w-6 text-pink-700" />
                  ) : bonsai.iconType === "sapling" ? (
                    <Leaf className="h-6 w-6 text-emerald-600" />
                  ) : (
                    <Sprout className="h-6 w-6 text-lime-600" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-emerald-700" /> {bannerText.bonsaiBadge} • {bannerText.bonsaiTitle}
                  </span>
                  <h3 className="font-serif text-sm sm:text-base font-black text-ink">
                    {bannerText.modulesCompleted}
                  </h3>
                  <p className="text-[11px] font-semibold text-emerald-800 hidden sm:block">
                    {bannerText.bonsaiDesc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="flex-1 sm:w-28 bg-white rounded-full h-2.5 border-2 border-black overflow-hidden">
                  <div className="bg-tea h-full w-[66%]" />
                </div>
                <span className="text-xs font-black text-tea whitespace-nowrap">{bannerText.percentDone}</span>
              </div>
            </div>
          );
        })()}

        {/* 1. THERAPY SUITE SECTION */}
        <TherapySuiteGrid gamesTitle={t("gamesTitle")} />

        {/* 2. TODAY'S ROUTINE & MEDICATION SCHEDULE */}
        <DailyRoutineSchedule langCode={langCode} rate={rate} />

        {/* 3. WELLBEING & COGNITIVE MEMORY SECTION */}
        <section aria-labelledby="wellbeing-title">
          <div className="flex items-center gap-2 border-b-2 border-black/15 pb-2">
            <HeartHandshake className="h-5 w-5 text-tea" />
            <h2 id="wellbeing-title" className="font-serif text-xl font-black text-ink">
              {t("wellbeing.title")}
            </h2>
          </div>

          <div className="mt-3.5 space-y-4">
            {/* Memory of the Day Spotlight */}
            <MemorySpotlightCard
              memoryOfDay={memoryOfDay}
              onListen={(text) => speak(text, langCode, rate)}
              onShuffle={shuffleMemory}
              onOpenLightbox={() => setMemoryView(true)}
              title={t("wellbeing.memoryTitle")}
              emptyText={t("wellbeing.memoryEmpty")}
              listenLabel={t("wellbeing.memoryListen")}
              anotherLabel={t("wellbeing.memoryAnother")}
              viewPhotoLabel={t("wellbeing.memoryView")}
            />

            <div className="grid gap-4 md:grid-cols-2">
              {/* Sensory Calming Flute Audio & 40Hz Gamma Stimulation */}
              <SensoryCalmCard
                title={t("wellbeing.calmTitle")}
                hint={t("wellbeing.calmHint")}
                comfortText={comfortText}
                playLabel={t("wellbeing.calmPlay")}
                listenLabel={t("wellbeing.calmListen")}
                onPlayTone={playCalmTone}
                onPlayGamma={playGammaStimulation}
                onListenText={(text) => speak(text, langCode, rate)}
              />

              {/* Mood Check-In Tracker */}
              <DailyMoodTracker
                lastMood={lastMood}
                onChooseMood={chooseMood}
                title={t("wellbeing.moodTitle")}
                moodLabels={moodLabels}
                thanksMessage={
                  lastMood
                    ? t("wellbeing.moodThanks", {
                        name: patientName || t("wellbeing.moodDear"),
                      })
                    : undefined
                }
              />
            </div>
          </div>
        </section>

        <div className="pt-2 pb-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-ink-secondary hover:text-ink font-bold text-xs transition-colors"
          >
            {t("back")}
          </Link>
        </div>
      </div>

      <MemoryLightbox
        open={memoryView}
        onClose={() => setMemoryView(false)}
        photoUrl={memoryOfDay?.photoUrl}
        title={t("wellbeing.memoryTitle")}
        text={memoryOfDay?.text}
        langCode={langCode}
        rate={rate}
        closeLabel="Close"
        listenLabel="Listen"
        speakingLabel="Speaking..."
      />

      {/* Interactive Saathi AI Voice Companion */}
      <SaathiVoiceCompanion
        key={locale}
        patientName={patientName}
        langCode={langCode}
        currentLocale={locale}
        rate={rate}
        familyMembers={detail?.familyMembers}
        familiarPlaces={detail?.familiarPlaces}
        joyTriggers={detail?.joyTriggers ?? undefined}
      />
    </div>
  );
}
