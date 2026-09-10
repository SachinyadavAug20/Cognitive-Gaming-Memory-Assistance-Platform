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
import { playTapFeedback, playCorrect, playWaterRipple, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { useAuthStore } from "@/store/useAuthStore";
import { api } from "@/lib/api";

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
    defaultTitle: "Drink Fresh Water",
    timeKey: "water_count",
    defaultTime: "4 of 6 glasses today",
    icon: "water",
    defaultDone: false,
  },
  {
    id: "doctor_appointment",
    titleKey: "doctor_appointment",
    defaultTitle: "Doctor's Visit",
    timeKey: "appointment_time",
    defaultTime: "Dr. B. K. Sarma • Dispur PHC",
    icon: "appointment",
    defaultDone: false,
  },
  {
    id: "family_photos",
    titleKey: "family_photos",
    defaultTitle: "Family Photos & Memories",
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
    completed: "Completed",
    scheduled: "Scheduled",
    tapToggle: "Tap to toggle",
    waterOf: "{glasses} of 6 glasses today",
    glasses: "{glasses} Glasses",
    caregiverBadge: "Family & Nurse Safety Net",
    caregiverTitle: "Need a hand or want to chat? Connect anytime with Sunita Borah (Daughter) or Dispur PHC Nurse",
    callCaregiver: "Call Sunita (Daughter)",
    caregiverAlertSent: "Caregiver Alert Sent",
    sosSpeech: "Connecting you with your daughter Sunita and your local nurse. Please rest comfortably.",
  },
  hi: {
    listen: "सुनें",
    completed: "पूर्ण हुआ",
    scheduled: "निर्धारित",
    tapToggle: "टैप करें",
    waterOf: "आज 6 में से {glasses} गिलास",
    glasses: "{glasses} गिलास",
    caregiverBadge: "परिवार और स्वास्थ्य सहायता",
    caregiverTitle: "सहायता चाहिए या बात करनी है? बेटी सुनीता बोरा या आशा नर्स से कभी भी जुड़ें",
    callCaregiver: "सुनीता (बेटी) को कॉल करें",
    caregiverAlertSent: "संदेश भेजा गया",
    sosSpeech: "आपकी देखभालकर्ता सुनीता और आशा कार्यकर्ता से संपर्क किया जा रहा है। कृपया शांत रहें।",
  },
  as: {
    listen: "শুনক",
    completed: "সম্পন্ন",
    scheduled: "নিৰ্ধাৰিত",
    tapToggle: "স্পৰ্শ কৰক",
    waterOf: "আজি ৬ গিলাচৰ {glasses} গিলাচ",
    glasses: "{glasses} গিলাচ",
    caregiverBadge: "পৰিচৰ্যা আৰু পৰিয়ালৰ সহায়",
    caregiverTitle: "সহায়ৰ প্ৰয়োজন নেকি? জীয়াৰী সুনীতা বৰা বা দিছপুৰ স্বাস্থ্য কৰ্মীৰ সৈতে কথা পাতক",
    callCaregiver: "সুনীতা (জীয়াৰী)ক ফোন কৰক",
    caregiverAlertSent: "খবৰ পঠোৱা হ'ল",
    sosSpeech: "আপোনাৰ জীয়াৰী সুনীতা আৰু আশা কৰ্মীৰ সৈতে যোগাযোগ কৰা হৈছে। অনুগ্ৰহ কৰি বিশ্ৰাম লওক।",
  },
  bn: {
    listen: "শুনুন",
    completed: "সম্পন্ন",
    scheduled: "নির্ধারিত",
    tapToggle: "ট্যাপ করুন",
    waterOf: "আজ ৬ গ্লাসের {glasses} গ্লাস",
    glasses: "{glasses} গ্লাস",
    caregiverBadge: "পরিবার ও নার্স সহায়তা",
    caregiverTitle: "সহায়তা প্রয়োজন? মেয়ে সুনীতা বোরা বা স্বাস্থ্য কর্মীর সাথে কথা বলুন",
    callCaregiver: "সুনীতা (মেয়ে)কে কল করুন",
    caregiverAlertSent: "বার্তা পাঠানো হয়েছে",
    sosSpeech: "আপনার পরিচর্যাকারী সুনীতা ও আশা কর্মীর সাথে যোগাযোগ করা হচ্ছে। অনুগ্রহ করে বিশ্রাম নিন।",
  },
  mr: {
    listen: "ऐका",
    completed: "पूर्ण झाले",
    scheduled: "नियोजित",
    tapToggle: "टॅप करा",
    waterOf: "आज 6 पैकी {glasses} ग्लास",
    glasses: "{glasses} ग्लास",
    caregiverBadge: "देखभालकर्ता थेट संपर्क",
    caregiverTitle: "मदत हवी आहे? सुनीता बोरा (मुलगी) किंवा आशा सेविकेशी संपर्क साधा",
    callCaregiver: "कुटुंबाला कॉल करा",
    caregiverAlertSent: "संदेश पाठवला",
    sosSpeech: "तुमची काळजी घेणाऱ्या सुनीता आणि आशा सेविकेशी संपर्क साधला जात आहे. कृपया शांत राहा.",
  },
  ne: {
    listen: "सुन्नुहोस्",
    completed: "सम्पन्न",
    scheduled: "निर्धारित",
    tapToggle: "ट्याप गर्नुहोस्",
    waterOf: "आज ६ मध्ये {glasses} गिलास",
    glasses: "{glasses} गिलास",
    caregiverBadge: "हेरचाहकर्ता प्रत्यक्ष सम्पर्क",
    caregiverTitle: "सहयोग चाहिन्छ? सुनिता बोरा (छोरी) वा आशा कार्यकर्तालाई सम्पर्क गर्नुहोस्",
    callCaregiver: "परिवारलाई कल गर्नुहोस्",
    caregiverAlertSent: "सन्देश पठाइयो",
    sosSpeech: "तपाईंको हेरचाहकर्ता सुनिता र आशा कार्यकर्तासँग सम्पर्क गरिँदैछ। कृपया आराम गर्नुहोस्।",
  },
  mni: {
    listen: "তাবীয়ু",
    completed: "লোইরে",
    scheduled: "লেপ্নবা",
    tapToggle: "নম্বীয়ু",
    waterOf: "ঙসি গ্লাস ৬ গী মনুংদা {glasses}",
    glasses: "{glasses} গ্লাস",
    caregiverBadge: "য়েংশিনবগী হকথেংনবা পাউ",
    caregiverTitle: "মতেং পাম্বীৰা? সুনীতা বোরা (মচা নুপী) নত্রগা আশা ৱার্করগা পাউ ফাওনবীয়ু",
    callCaregiver: "ইমুংদা কোল তৌবীয়ু",
    caregiverAlertSent: "পাউ থাখ্রে",
    sosSpeech: "নহাকপু য়েংশিনবীরিবা সুনীতা অমসুং আশা ৱার্করগা পাউ ফাওনরি। শান্তি ওইনা পোথারবীয়ু।",
  },
  brx: {
    listen: "खोनासं",
    completed: "जोबबाय",
    scheduled: "थि खालामनाय",
    tapToggle: "नांगौ",
    waterOf: "दिनै 6 ग्लानि {glasses} ग्लास",
    glasses: "{glasses} ग्लास",
    caregiverBadge: "नायबिजिरगिरि लोगो",
    caregiverTitle: "हेफाजाब नांगौ नामा? सुनिता बोरा (फिसाय) जों लोगो लाय",
    callCaregiver: "नखरनो कल हर",
    caregiverAlertSent: "खौरां दैथायहरबाय",
    sosSpeech: "नोंनि नायगिरि सुनिता आरो आसा खामानि मावग्रा जों फोनांजाबबाय।",
  },
  grt: {
    listen: "Knatimbo",
    completed: "Machotok",
    scheduled: "Tikat",
    tapToggle: "Nenbo",
    waterOf: "Da·al glass 6-oni {glasses}",
    glasses: "{glasses} Glass",
    caregiverBadge: "Ni-rokgipa Baksa Agangrikna",
    caregiverTitle: "Dakchakna nanggama? Sunita Borah baksa ba ASHA worker baksa agangrikbo",
    callCaregiver: "Noktangna Ring·bo",
    caregiverAlertSent: "Katta watataha",
    sosSpeech: "Nang·ni ni-rokgipa Sunita aro ASHA worker baksa agangrikatenga.",
  },
  kha: {
    listen: "Sngap",
    completed: "Dep",
    scheduled: "Buh Por",
    tapToggle: "Ktiat",
    waterOf: "Mynta ka sngi {glasses} na 6 klat",
    glasses: "{glasses} Klat",
    caregiverBadge: "Ia u Nongsumar",
    caregiverTitle: "Donkam jingiarap? Kren bad i Sunita Borah lane ASHA worker",
    callCaregiver: "Phone Sha Iing",
    caregiverAlertSent: "Khubor la phah",
    sosSpeech: "Ngi la pyntip sha i Sunita bad i ASHA worker jong phi.",
  },
  lus: {
    listen: "Ngaithla rawh",
    completed: "Zo ta",
    scheduled: "Hun ruat",
    tapToggle: "Hmet rawh",
    waterOf: "Vawiin no 6 zinga no {glasses}",
    glasses: "No {glasses}",
    caregiverBadge: "Enkawltu Biak Pawhna",
    caregiverTitle: "Tanpuina i mamawh em? Sunita Borah emaw ASHA thawktu be raw",
    callCaregiver: "Chhungte Be Rawh",
    caregiverAlertSent: "Hriattirna thawn ta",
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

  const patient = useAuthStore((s) => s.patient);
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
    playWaterRipple();
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
    if (patient?.id) {
      api
        .post(`/surveillance/patients/${patient.id}/sos`, {
          patientLat: null,
          patientLng: null,
          locationLabel: "Patient Routine Portal",
        })
        .catch(() => {});
    }
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
      <div className="flex items-center justify-between border-b-2 border-black/15 pb-2.5">
        <div className="flex items-center gap-2.5">
          <Clock className="h-6 w-6 text-tea" />
          <h2 id="routine-title" className="font-serif text-2xl sm:text-3xl font-black text-ink">
            {t.has("title") ? t("title") : t.has("label") ? t("label") : "Today's Daily Routine & Care Reminders"}
          </h2>
        </div>
        <button
          type="button"
          onClick={speakRoutine}
          className="btn-tactile flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-4 py-2 text-sm font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
        >
          <Volume2 className="h-4 w-4 text-tea" />
          <span>{locStrings.listen}</span>
        </button>
      </div>

      {/* Routine Cards Grid (4 Essential Reminders) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tasks.map((task) => {
          const title = taskTitle(task);
          const time = taskTime(task);

          return (
            <div
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className={`${CARD} btn-tactile flex flex-col justify-between p-4 sm:p-5 transition-all cursor-pointer select-none ${
                task.defaultDone
                  ? "bg-tea-light/80 border-tea text-ink"
                  : "bg-surface text-ink hover:bg-surface-muted"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-black bg-surface shadow-sm">
                  {task.icon === "pill" && <Pill className="h-6 w-6 text-terracotta" />}
                  {task.icon === "water" && <Droplets className="h-6 w-6 text-teal-600" />}
                  {task.icon === "appointment" && <CalendarCheck className="h-6 w-6 text-purple-700" />}
                  {task.icon === "photo" && <ImageIcon className="h-6 w-6 text-marigold" />}
                </div>

                <button
                  type="button"
                  className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border-2 border-black font-black transition-colors ${
                    task.defaultDone ? "bg-tea text-white" : "bg-white text-transparent"
                  }`}
                  aria-label={task.defaultDone ? locStrings.completed : locStrings.scheduled}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-3.5">
                <h3 className="font-bold text-base sm:text-lg text-ink leading-tight">{title}</h3>
                <p className="text-xs sm:text-sm text-ink-secondary mt-1 font-bold">{time}</p>
              </div>

              {/* Special Interactive Water Counter with 6 Visual Cups */}
              {task.id === "water_reminder" && (
                <div className="mt-3 space-y-2.5">
                  {/* Visual 6-Cup Hydration Progress Indicator */}
                  <div className="flex items-center justify-between gap-1 rounded-2xl bg-sky-50 p-2 border-2 border-sky-200">
                    {[1, 2, 3, 4, 5, 6].map((cup) => (
                      <div
                        key={cup}
                        className={`flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border-2 transition-all ${
                          cup <= glasses
                            ? "border-sky-700 bg-sky-500 text-white shadow-xs scale-105"
                            : "border-black/20 bg-white text-black/25"
                        }`}
                        title={`Glass ${cup} of 6`}
                      >
                        <Droplets className={`h-4 w-4 sm:h-4.5 sm:w-4.5 ${cup <= glasses ? "fill-white" : ""}`} />
                      </div>
                    ))}
                  </div>

                  {/* Elder-Sized +/- Buttons */}
                  <div className="flex items-center justify-between bg-white rounded-2xl p-1.5 border-2 border-black/20">
                    <button
                      type="button"
                      onClick={removeWater}
                      className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-surface border-2 border-black flex items-center justify-center text-sm font-black hover:bg-surface-muted cursor-pointer shadow-xs active:scale-95 transition-transform"
                      aria-label="Decrease water"
                    >
                      <Minus className="h-5 w-5 stroke-[2.5]" />
                    </button>
                    <span className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-sky-950">
                      <Droplets className="h-4 w-4 text-sky-600 shrink-0" />
                      <span>{locStrings.glasses.replace("{glasses}", String(glasses))}</span>
                    </span>
                    <button
                      type="button"
                      onClick={addWater}
                      className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-sky-600 text-white border-2 border-black flex items-center justify-center text-sm font-black hover:bg-sky-700 cursor-pointer shadow-xs active:scale-95 transition-transform"
                      aria-label="Drink a glass of water"
                    >
                      <Plus className="h-5 w-5 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              )}

              <div className="mt-3 pt-2.5 border-t border-black/10 flex items-center justify-between text-xs sm:text-sm font-black">
                <span className={`inline-flex items-center gap-1.5 ${task.defaultDone ? "text-emerald-800" : "text-amber-800"}`}>
                  {task.defaultDone ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                      <span>{locStrings.completed}</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 shrink-0 text-amber-600" />
                      <span>{locStrings.scheduled}</span>
                    </>
                  )}
                </span>
                <span className="text-[11px] font-bold text-ink-secondary">
                  {task.defaultDone ? "✓ Completed" : "Tap to complete"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Reassuring Family Caregiver & PHC Nurse Connect */}
      <div className="rounded-3xl border-3 border-black bg-[#FFF9EE] p-5 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-amber-400 text-ink shadow-xs">
            <PhoneCall className="h-7 w-7 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border border-emerald-800/40 px-3 py-0.5 text-xs font-black text-emerald-950 uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                {locStrings.caregiverBadge}
              </span>
            </div>
            <h3 className="font-serif text-base sm:text-lg font-black text-ink mt-1">
              {locStrings.caregiverTitle}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSos}
          className={`btn-tactile w-full sm:w-auto px-7 py-3.5 rounded-2xl border-3 border-black font-black text-sm sm:text-base shadow-[3px_3px_0px_#000] cursor-pointer flex items-center justify-center gap-2.5 transition-all active:scale-95 ${
            sosActive ? "bg-emerald-600 text-white" : "bg-tea text-white hover:bg-emerald-800"
          }`}
        >
          {sosActive ? <CheckCircle2 className="h-5 w-5" /> : <PhoneCall className="h-5 w-5" />}
          <span>{sosActive ? locStrings.caregiverAlertSent : locStrings.callCaregiver}</span>
        </button>
      </div>
    </section>
  );
}

