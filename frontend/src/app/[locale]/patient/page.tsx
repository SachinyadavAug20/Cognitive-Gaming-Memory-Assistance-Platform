"use client";

import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import {
  HeartHandshake,
  Volume2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { usePatientDetail } from "@/games/usePatientDetail";
import { useAuthStore } from "@/store/useAuthStore";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { getMediaUrl } from "@/lib/api";
import { patientLangCode } from "@/lib/i18n";
import { MemoryLightbox } from "@/components/ui/MemoryLightbox";
import { playEncourage, playCalmTone, playGammaStimulation, playTapFeedback, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { speechRate } from "@/games/config";
import { AudioToggle } from "@/components/ui/AudioToggle";
import { TherapySuiteGrid } from "@/components/patient-dashboard/TherapySuiteGrid";
import { MemorySpotlightCard } from "@/components/patient-dashboard/MemorySpotlightCard";
import { SensoryCalmCard } from "@/components/patient-dashboard/SensoryCalmCard";
import { DailyMoodTracker, type MoodKey } from "@/components/patient-dashboard/DailyMoodTracker";
import { DailyRoutineSchedule } from "@/components/patient-dashboard/DailyRoutineSchedule";
import { SaathiVoiceCompanion } from "@/components/patient-dashboard/SaathiVoiceCompanion";
import { PatientBottomLogout } from "@/components/patient/PatientBottomLogout";

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
      <div className="bg-tea border-b-4 border-black px-4 pt-6 pb-6 md:px-8 text-white shadow-sm">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <span
              suppressHydrationWarning
              className="inline-flex items-center gap-2 bg-black/25 px-3 py-1 rounded-xl border border-white/25 text-xs sm:text-sm font-black text-amber-300"
            >
              <Calendar className="h-4 w-4 text-amber-400" />
              <span suppressHydrationWarning>{todayDateStr}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-3 border-black bg-surface overflow-hidden flex items-center justify-center shrink-0 shadow-[4px_4px_0px_#000]">
              {avatarPhoto ? (
                <Image
                  src={avatarPhoto}
                  alt={patientName || "Patient Portrait"}
                  width={96}
                  height={96}
                  sizes="96px"
                  className="h-full w-full object-cover"
                  priority
                />
              ) : (
                <span className="text-2xl sm:text-3xl font-black text-tea">
                  {avatarInitials || "P"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1
                suppressHydrationWarning
                className="font-serif font-black text-3xl sm:text-4xl text-white leading-tight"
              >
                {greeting}
              </h1>
              <p className="text-white text-base sm:text-lg font-bold mt-1 leading-snug">
                {t("orientation")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap pt-2">
            <button
              type="button"
              onClick={() => {
                playTapFeedback();
                unlockAudio();
                speak(heroText, locale || langCode, rate);
              }}
              className="btn-tactile inline-flex items-center gap-2.5 rounded-2xl border-2 border-black bg-white px-5 py-2.5 text-sm font-black text-ink shadow-[3px_3px_0px_#000] hover:bg-amber-100 cursor-pointer"
            >
              <Volume2 className="h-5 w-5 text-tea" />
              <span>{t("listen")}</span>
            </button>
            <AudioToggle />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 flex-1 w-full">
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

        <div className="pt-4 pb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-ink-secondary hover:text-ink font-bold text-sm transition-colors"
          >
            {t("back")}
          </Link>
        </div>

        {/* Discreet bottom caregiver / user-switch logout with confirmation */}
        <PatientBottomLogout />
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

      {/* Interactive Saathi Voice Companion */}
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
