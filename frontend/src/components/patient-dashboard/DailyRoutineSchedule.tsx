"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Droplets,
  Pill,
  Image as ImageIcon,
  Volume2,
  CalendarCheck,
  PhoneCall,
  Plus,
  Minus,
  AlertCircle,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { playTapFeedback, playCorrect, playPineBreeze, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";

interface RoutineTask {
  id: string;
  titleKey: string;
  defaultTitle: string;
  timeKey: string;
  defaultTime: string;
  icon: "pill" | "water" | "photo" | "appointment";
  defaultDone: boolean;
}

const INITIAL_ROUTINE: RoutineTask[] = [
  {
    id: "morning_medicine",
    titleKey: "morning_medicine",
    defaultTitle: "Morning Medicine (BP & Vitamin)",
    timeKey: "medicine_time",
    defaultTime: "8:00 AM • 1 Pill with Water",
    icon: "pill",
    defaultDone: true,
  },
  {
    id: "water_reminder",
    titleKey: "water_reminder",
    defaultTitle: "Hydration Check-In",
    timeKey: "water_count",
    defaultTime: "4 of 6 glasses today",
    icon: "water",
    defaultDone: false,
  },
  {
    id: "doctor_appointment",
    titleKey: "doctor_appointment",
    defaultTitle: "PHC Medical Check-Up",
    timeKey: "appointment_time",
    defaultTime: "Dr. B. K. Sarma • Dispur PHC",
    icon: "appointment",
    defaultDone: false,
  },
  {
    id: "family_photos",
    titleKey: "family_photos",
    defaultTitle: "Family Memory Recall",
    timeKey: "memories_count",
    defaultTime: "12 memories with Sunita",
    icon: "photo",
    defaultDone: false,
  },
];

const CARD = "border-3 border-black rounded-2xl shadow-[4px_4px_0px_rgba(0,0,0,1)]";

const ROUTINE_I18N: Record<
  string,
  {
    listen: string;
    completed: string;
    scheduled: string;
    tapToggle: string;
    waterOf: string;
    glasses: string;
    caregiverBadge: string;
    caregiverTitle: string;
    callCaregiver: string;
    caregiverAlertSent: string;
    sosSpeech: string;
  }
> = {
  en: {
    listen: "Listen",
    completed: "✓ Completed",
    scheduled: "● Scheduled",
    tapToggle: "Tap to toggle",
    waterOf: "{glasses} of 6 glasses today",
    glasses: "{glasses} Glasses",
    caregiverBadge: "Caregiver Direct Connect",
    caregiverTitle: "Need assistance? Connect with Sunita Borah (Daughter) or Dispur PHC ASHA Worker",
    callCaregiver: "Call Family Caregiver",
    caregiverAlertSent: "✓ Caregiver Alert Sent",
    sosSpeech: "Connecting you with your primary caregiver Sunita and your local ASHA health worker. Please rest comfortably.",
  },
  hi: {
    listen: "सुनें",
    completed: "✓ पूर्ण हुआ",
    scheduled: "● निर्धारित",
    tapToggle: "टैप करें",
    waterOf: "आज 6 में से {glasses} गिलास",
    glasses: "{glasses} गिलास",
    caregiverBadge: "देखभालकर्ता सीधा संपर्क",
    caregiverTitle: "सहायता चाहिए? सुनीता बोरा (बेटी) या आशा कार्यकर्ता से संपर्क करें",
    callCaregiver: "परिवार को कॉल करें",
    caregiverAlertSent: "✓ संदेश भेजा गया",
    sosSpeech: "आपकी देखभालकर्ता सुनीता और आशा कार्यकर्ता से संपर्क किया जा रहा है। कृपया शांत रहें।",
  },
  as: {
    listen: "শুনক",
    completed: "✓ সম্পন্ন",
    scheduled: "● নিৰ্ধাৰিত",
    tapToggle: "স্পৰ্শ কৰক",
    waterOf: "আজি ৬ গিলাচৰ {glasses} গিলাচ",
    glasses: "{glasses} গিলাচ",
    caregiverBadge: "পৰিচৰ্যাকাৰীৰ সৈতে যোগাযোগ",
    caregiverTitle: "সহায়ৰ প্ৰয়োজন নেকি? সুনীতা বৰা (জীয়াৰী) বা আশা কৰ্মীৰ সৈতে যোগাযোগ কৰক",
    callCaregiver: "পৰিয়ালক ফোন কৰক",
    caregiverAlertSent: "✓ খবৰ পঠোৱা হ'ল",
    sosSpeech: "আপোনাৰ পৰিচৰ্যাকাৰী সুনীতা আৰু আশা কৰ্মীৰ সৈতে যোগাযোগ কৰা হৈছে। অনুগ্ৰহ কৰি বিশ্ৰাম লওক।",
  },
  bn: {
    listen: "শুনুন",
    completed: "✓ সম্পন্ন",
    scheduled: "● নির্ধারিত",
    tapToggle: "ট্যাপ করুন",
    waterOf: "আজ ৬ গ্লাসের {glasses} গ্লাস",
    glasses: "{glasses} গ্লাস",
    caregiverBadge: "পরিচর্যাকারীর সাথে যোগাযোগ",
    caregiverTitle: "সহায়তা প্রয়োজন? সুনীতা বোরা (মেয়ে) বা আশা কর্মীর সাথে যোগাযোগ করুন",
    callCaregiver: "পরিবারকে কল করুন",
    caregiverAlertSent: "✓ বার্তা পাঠানো হয়েছে",
    sosSpeech: "আপনার পরিচর্যাকারী সুনীতা ও আশা কর্মীর সাথে যোগাযোগ করা হচ্ছে। অনুগ্রহ করে বিশ্রাম নিন।",
  },
  mr: {
    listen: "ऐका",
    completed: "✓ पूर्ण झाले",
    scheduled: "● नियोजित",
    tapToggle: "टॅप करा",
    waterOf: "आज 6 पैकी {glasses} ग्लास",
    glasses: "{glasses} ग्लास",
    caregiverBadge: "देखभालकर्ता थेट संपर्क",
    caregiverTitle: "मदत हवी आहे? सुनीता बोरा (मुलगी) किंवा आशा सेविकेशी संपर्क साधा",
    callCaregiver: "कुटुंबाला कॉल करा",
    caregiverAlertSent: "✓ संदेश पाठवला",
    sosSpeech: "तुमची काळजी घेणाऱ्या सुनीता आणि आशा सेविकेशी संपर्क साधला जात आहे. कृपया शांत राहा.",
  },
  ne: {
    listen: "सुन्नुहोस्",
    completed: "✓ सम्पन्न",
    scheduled: "● निर्धारित",
    tapToggle: "ट्याप गर्नुहोस्",
    waterOf: "आज ६ मध्ये {glasses} गिलास",
    glasses: "{glasses} गिलास",
    caregiverBadge: "हेरचाहकर्ता प्रत्यक्ष सम्पर्क",
    caregiverTitle: "सहयोग चाहिन्छ? सुनिता बोरा (छोरी) वा आशा कार्यकर्तालाई सम्पर्क गर्नुहोस्",
    callCaregiver: "परिवारलाई कल गर्नुहोस्",
    caregiverAlertSent: "✓ सन्देश पठाइयो",
    sosSpeech: "तपाईंको हेरचाहकर्ता सुनिता र आशा कार्यकर्तासँग सम्पर्क गरिँदैछ। कृपया आराम गर्नुहोस्।",
  },
  mni: {
    listen: "তাবীয়ু",
    completed: "✓ লোইরে",
    scheduled: "● লেপ্নবা",
    tapToggle: "নম্বীয়ু",
    waterOf: "ঙসি গ্লাস ৬ গী মনুংদা {glasses}",
    glasses: "{glasses} গ্লাস",
    caregiverBadge: "য়েংশিনবগী হকথেংনবা পাউ",
    caregiverTitle: "মতেং পাম্বীৰা? সুনীতা বোরা (মচা নুপী) নত্রগা আশা ৱার্করগা পাউ ফাওনবীয়ু",
    callCaregiver: "ইমুংদা কোল তৌবীয়ু",
    caregiverAlertSent: "✓ পাউ থাখ্রে",
    sosSpeech: "নহাকপু য়েংশিনবীরিবা সুনীতা অমসুং আশা ৱার্করগা পাউ ফাওনরি। শান্তি ওইনা পোথারবীয়ু।",
  },
  brx: {
    listen: "खोनासं",
    completed: "✓ जोबबाय",
    scheduled: "● थि खालामनाय",
    tapToggle: "नांगौ",
    waterOf: "दिनै 6 ग्लानि {glasses} ग्लास",
    glasses: "{glasses} ग्लास",
    caregiverBadge: "नायबिजिरगिरि लोगो",
    caregiverTitle: "हेफाजाब नांगौ नामा? सुनिता बोरा (फिसाय) जों लोगो लाय",
    callCaregiver: "नखरनो कल हर",
    caregiverAlertSent: "✓ खौरां दैथायहरबाय",
    sosSpeech: "नोंनि नायगिरि सुनिता आरो आसा खामानि मावग्रा जों फोनांजाबबाय।",
  },
  grt: {
    listen: "Knatimbo",
    completed: "✓ Machotok",
    scheduled: "● Tikat",
    tapToggle: "Nenbo",
    waterOf: "Da·al glass 6-oni {glasses}",
    glasses: "{glasses} Glass",
    caregiverBadge: "Ni-rokgipa Baksa Agangrikna",
    caregiverTitle: "Dakchakna nanggama? Sunita Borah baksa ba ASHA worker baksa agangrikbo",
    callCaregiver: "Noktangna Ring·bo",
    caregiverAlertSent: "✓ Katta watataha",
    sosSpeech: "Nang·ni ni-rokgipa Sunita aro ASHA worker baksa agangrikatenga.",
  },
  kha: {
    listen: "Sngap",
    completed: "✓ Dep",
    scheduled: "● Buh Por",
    tapToggle: "Ktiat",
    waterOf: "Mynta ka sngi {glasses} na 6 klat",
    glasses: "{glasses} Klat",
    caregiverBadge: "Ia u Nongsumar",
    caregiverTitle: "Donkam jingiarap? Kren bad i Sunita Borah lane ASHA worker",
    callCaregiver: "Phone Sha Iing",
    caregiverAlertSent: "✓ Khubor la phah",
    sosSpeech: "Ngi la pyntip sha i Sunita bad i ASHA worker jong phi.",
  },
  lus: {
    listen: "Ngaithla rawh",
    completed: "✓ Zo ta",
    scheduled: "● Hun ruat",
    tapToggle: "Hmet rawh",
    waterOf: "Vawiin no 6 zinga no {glasses}",
    glasses: "No {glasses}",
    caregiverBadge: "Enkawltu Biak Pawhna",
    caregiverTitle: "Tanpuina i mamawh em? Sunita Borah emaw ASHA thawktu be rawh",
    callCaregiver: "Chhungte Be Rawh",
    caregiverAlertSent: "✓ Hriattirna thawn ta",
    sosSpeech: "I enkawltu Sunita leh ASHA thawktute kan be pawp e.",
  },
};

interface DailyRoutineScheduleProps {
  langCode: string;
  rate: number;
}

export function DailyRoutineSchedule({ langCode, rate }: DailyRoutineScheduleProps) {
  const locale = useLocale();
  const t = useTranslations("home.routine");
  const normLocale = (locale?.split("-")[0]?.toLowerCase() || "en");
  const locStrings = ROUTINE_I18N[normLocale] || ROUTINE_I18N.en;

  const [tasks, setTasks] = useState(INITIAL_ROUTINE);
  const [glasses, setGlasses] = useState(4);
  const [sosActive, setSosActive] = useState(false);

  const toggleTask = (id: string) => {
    playTapFeedback();
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === id) {
          const next = !task.defaultDone;
          if (next) playCorrect();
          return { ...task, defaultDone: next };
        }
        return task;
      })
    );
  };

  const addWater = (e: React.MouseEvent) => {
    e.stopPropagation();
    playPineBreeze();
    setGlasses((g) => {
      const next = Math.min(8, g + 1);
      if (next >= 6) {
        setTasks((prev) =>
          prev.map((tItem) => (tItem.id === "water_reminder" ? { ...tItem, defaultDone: true } : tItem))
        );
      }
      return next;
    });
  };

  const removeWater = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTapFeedback();
    setGlasses((g) => Math.max(0, g - 1));
  };

  const handleSos = () => {
    playCorrect();
    setSosActive(true);
    unlockAudio();
    speak(locStrings.sosSpeech, langCode, rate);
  };

  const speakRoutine = () => {
    playTapFeedback();
    unlockAudio();
    const text = tasks
      .map((tItem) => {
        const title = taskTitle(tItem);
        const time = taskTime(tItem);
        return `${title}, ${time}`;
      })
      .join(". ");
    speak(text, langCode, rate);
  };

  const taskTitle = (task: RoutineTask) => {
    return task.titleKey && t.has(task.titleKey) ? t(task.titleKey) : task.defaultTitle;
  };

  const taskTime = (task: RoutineTask) => {
    if (task.id === "water_reminder") {
      return locStrings.waterOf.replace("{glasses}", String(glasses));
    }
    return task.timeKey && t.has(task.timeKey) ? t(task.timeKey) : task.defaultTime;
  };

  return (
    <section aria-labelledby="routine-title" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-black/15 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-tea" />
          <h2 id="routine-title" className="font-serif text-xl font-black text-ink">
            {t.has("title") ? t("title") : t.has("label") ? t("label") : "Today's Daily Routine & Care Reminders"}
          </h2>
        </div>
        <button
          type="button"
          onClick={speakRoutine}
          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
        >
          <Volume2 className="h-3.5 w-3.5 text-tea" />
          <span>{locStrings.listen}</span>
        </button>
      </div>

      {/* Routine Cards Grid (4 Essential Reminders) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {tasks.map((task) => {
          const title = taskTitle(task);
          const time = taskTime(task);

          return (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`${CARD} btn-tactile flex flex-col justify-between p-3.5 transition-all cursor-pointer select-none ${
                task.defaultDone
                  ? "bg-tea-light/80 border-tea text-ink"
                  : "bg-surface text-ink hover:bg-surface-muted"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-surface shadow-sm">
                  {task.icon === "pill" && <Pill className="h-5 w-5 text-terracotta" />}
                  {task.icon === "water" && <Droplets className="h-5 w-5 text-teal-600" />}
                  {task.icon === "appointment" && <CalendarCheck className="h-5 w-5 text-purple-700" />}
                  {task.icon === "photo" && <ImageIcon className="h-5 w-5 text-marigold" />}
                </div>

                <button
                  type="button"
                  className={`flex h-7 w-7 items-center justify-center rounded-lg border-2 border-black font-black transition-colors ${
                    task.defaultDone ? "bg-tea text-white" : "bg-white text-transparent"
                  }`}
                  aria-label={task.defaultDone ? locStrings.completed : locStrings.scheduled}
                >
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3">
                <h3 className="font-bold text-sm text-ink leading-tight">{title}</h3>
                <p className="text-xs text-ink-secondary mt-0.5 font-semibold">{time}</p>
              </div>

              {/* Special Interactive Water Counter */}
              {task.id === "water_reminder" && (
                <div className="mt-2.5 flex items-center justify-between bg-white/70 rounded-xl p-1 border border-black/20">
                  <button
                    type="button"
                    onClick={removeWater}
                    className="h-6 w-6 rounded-lg bg-surface border border-black flex items-center justify-center text-xs font-black hover:bg-surface-muted cursor-pointer"
                    aria-label="Decrease water"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-[11px] font-black text-teal-800">
                    💧 {locStrings.glasses.replace("{glasses}", String(glasses))}
                  </span>
                  <button
                    type="button"
                    onClick={addWater}
                    className="h-6 w-6 rounded-lg bg-teal-600 text-white border border-black flex items-center justify-center text-xs font-black hover:bg-teal-700 cursor-pointer"
                    aria-label="Drink a glass of water"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              )}

              <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center justify-between text-[11px] font-black">
                <span className={task.defaultDone ? "text-tea" : "text-marigold-dark"}>
                  {task.defaultDone ? locStrings.completed : locStrings.scheduled}
                </span>
                <span className="text-[10px] text-ink-secondary/70">{locStrings.tapToggle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Caregiver & ASHA Worker Quick-Connect SOS */}
      <div className="rounded-2xl border-3 border-black bg-gradient-to-r from-red-50 via-amber-50 to-orange-50 p-4 shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-brick text-white shadow-xs">
            <PhoneCall className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-brick flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> {locStrings.caregiverBadge}
              </span>
            </div>
            <h3 className="font-serif text-sm sm:text-base font-black text-ink">
              {locStrings.caregiverTitle}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSos}
          className={`btn-tactile w-full sm:w-auto px-4 py-2.5 rounded-xl border-2 border-black font-black text-xs shadow-[2px_2px_0px_#000] cursor-pointer flex items-center justify-center gap-2 ${
            sosActive ? "bg-emerald-700 text-white" : "bg-brick text-white hover:bg-red-700"
          }`}
        >
          <PhoneCall className="h-4 w-4" />
          <span>{sosActive ? locStrings.caregiverAlertSent : locStrings.callCaregiver}</span>
        </button>
      </div>
    </section>
  );
}

