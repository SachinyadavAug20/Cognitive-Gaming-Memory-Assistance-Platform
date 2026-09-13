"use client";

import { useLocale } from "next-intl";
import { Smile, Meh, HeartHandshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MoodKey = "peaceful" | "okay" | "caretaker";

interface DailyMoodTrackerProps {
  lastMood: MoodKey | null;
  onChooseMood: (key: MoodKey) => void;
  title: string;
  thanksMessage?: string;
  feedbackMessage?: string;
  moodLabels: Record<MoodKey, string>;
}

const MOODS: { key: MoodKey; icon: LucideIcon; color: string }[] = [
  { key: "peaceful", icon: Smile, color: "bg-emerald-700 text-white hover:bg-emerald-800" },
  { key: "okay", icon: Meh, color: "bg-amber-600 text-white hover:bg-amber-700" },
  { key: "caretaker", icon: HeartHandshake, color: "bg-brick text-white hover:bg-red-700" },
];

const CARD = "border-3 border-black rounded-3xl shadow-[4px_4px_0px_rgba(0,0,0,1)]";

const MOOD_I18N: Record<string, {
  subtitle: string;
  tapPrompt: string;
  defaultThanks: string;
}> = {
  en: {
    subtitle: "Check in with your loved ones and health worker",
    tapPrompt: "Tap any emotion above to check in with family",
    defaultThanks: "Thank you for sharing your mood today.",
  },
  as: {
    subtitle: "আপোনাৰ আত্মীয় আৰু স্বাস্থ্যকৰ্মীৰ সৈতে মনৰ কথা জনাওক",
    tapPrompt: "পৰিয়ালক জনাবলৈ ওপৰৰ যিকোনো এটা ভাৱত স্পৰ্শ কৰক",
    defaultThanks: "আজি আপোনাৰ অনুভৱ প্ৰকাশ কৰাৰ বাবে ধন্যবাদ।",
  },
  hi: {
    subtitle: "अपने परिजनों और स्वास्थ्य कार्यकर्ता के साथ साझा करें",
    tapPrompt: "परिवार को बताने के लिए ऊपर किसी भी भाव पर टैप करें",
    defaultThanks: "आज अपने मन की बात साझा करने के लिए धन्यवाद।",
  },
  bn: {
    subtitle: "আপনার প্রিয়জন ও স্বাস্থ্যকর্মীর সাথে অনুভূতি ভাগ করুন",
    tapPrompt: "পরিবারকে জানাতে উপরের যেকোনো অনুভূতিতে ট্যাপ করুন",
    defaultThanks: "আজ আপনার অনুভূতি জানানোর জন্য ধন্যবাদ।",
  },
  mr: {
    subtitle: "आपल्या प्रियजनांशी आणि आरोग्य सेविकेशी संवाद साधा",
    tapPrompt: "कुटुंबाला कळवण्यासाठी वरील कोणत्याही भावनेवर टॅप करा",
    defaultThanks: "आज तुमची भावना सांगितल्याबद्दल धन्यवाद.",
  },
  ne: {
    subtitle: "आफ्ना परिवार र स्वास्थ्यकर्मीसँग कुरा साट्नुहोस्",
    tapPrompt: "परिवारलाई जानकारी दिन माथिको कुनै पनि भावमा ट्याप गर्नुहोस्",
    defaultThanks: "आज आफ्नो मनको भावना साझा गर्नुभएकोमा धन्यवाद।",
  },
  mni: {
    subtitle: "ইমুংগী মীওই অমসুং আশাগা ৱারী শানবিয়ু",
    tapPrompt: "ইমুংদা খঙহন্নবা মথক্কী অপাম্বা অমদা নম্বিয়ু",
    defaultThanks: "ঙসিগী অপাম্বা ফোঙদোকপগীদমক থাগৎচরি।",
  },
  brx: {
    subtitle: "नखरनि सुबुं आरो आसाजों गोसोनि खोथा सावराय",
    tapPrompt: "नखरनो खोनथानो गोग्लैनाय मोनसेयाव थु",
    defaultThanks: "दिनै गोसोनि खोथा बुंनायनि थाखाय साबायखर।",
  },
  grt: {
    subtitle: "Nokdang aro ASHA baksa agangrikani",
    tapPrompt: "Nokdangna aganna kosako nang·atbo",
    defaultThanks: "Da·al an·sengani aganani gimin mittelaha.",
  },
  kha: {
    subtitle: "Iasyllok bad kiba ha iing bad nongtrei koit khiah",
    tapPrompt: "Ktiat ha kawei na ki jingbuh ban pyntip sha iing",
    defaultThanks: "Khublei shibun ba phi la iathuh ia ka jingsngew.",
  },
  lus: {
    subtitle: "Chhungkua leh hriselna thawktute hnenah i rilru hriattir rawh",
    tapPrompt: "Chhungte hriattir nan a chunga mi hi hmet rawh",
    defaultThanks: "Vawiin i rilru puthmang i sawi avangin ka lawm e.",
  },
};

export function DailyMoodTracker({
  lastMood,
  onChooseMood,
  title,
  thanksMessage,
  feedbackMessage,
  moodLabels,
}: DailyMoodTrackerProps) {
  const locale = useLocale();
  const normLoc = locale?.split("-")[0]?.toLowerCase() || "en";
  const loc = MOOD_I18N[normLoc] || MOOD_I18N.en;

  return (
    <div className={`${CARD} bg-[#FFFDF9] p-5 sm:p-6 flex flex-col justify-between text-left h-full min-h-[260px]`}>
      <div>
        <div className="flex items-center gap-2.5 border-b-2 border-black/10 pb-2.5">
          <Smile className="h-5 w-5 text-tea" />
          <h3 className="font-serif text-xl sm:text-2xl font-black text-ink">{title}</h3>
        </div>
        <p className="mt-2 text-xs sm:text-sm font-bold text-ink-secondary">
          {loc.subtitle}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2.5 sm:gap-3">
          {MOODS.map((mood) => {
            const IconComponent = mood.icon;
            const isSelected = lastMood === mood.key;
            return (
              <button
                key={mood.key}
                type="button"
                onClick={() => onChooseMood(mood.key)}
                aria-label={moodLabels[mood.key]}
                className={`btn-tactile flex min-h-[105px] sm:min-h-[115px] flex-col items-center justify-center gap-2 rounded-2xl border-2 sm:border-3 border-black p-2.5 sm:p-3 text-sm font-black shadow-[3px_3px_0px_#000] cursor-pointer transition-all ${
                  mood.color
                } ${isSelected ? "ring-4 ring-black scale-105" : "hover:scale-[1.02]"}`}
              >
                <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 stroke-[2.2]" />
                <span className="leading-tight text-center text-xs sm:text-sm font-black">
                  {moodLabels[mood.key]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-3 border-t-2 border-black/10">
        {lastMood ? (
          <div className={`p-2.5 sm:p-3 rounded-2xl border-2 flex items-center gap-2.5 ${
            lastMood === "peaceful"
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : lastMood === "okay"
                ? "bg-amber-50 border-amber-300 text-amber-950"
                : "bg-rose-50 border-rose-300 text-rose-950"
          }`}>
            {lastMood === "peaceful" && <Smile className="h-5 w-5 text-emerald-700 shrink-0" />}
            {lastMood === "okay" && <Meh className="h-5 w-5 text-amber-700 shrink-0" />}
            {lastMood === "caretaker" && <HeartHandshake className="h-5 w-5 text-rose-700 shrink-0" />}
            <p className="text-xs sm:text-sm font-bold leading-tight">
              {feedbackMessage || thanksMessage || loc.defaultThanks}
            </p>
          </div>
        ) : (
          <div className="p-2.5 sm:p-3 rounded-2xl bg-black/5 border border-black/10 text-center">
            <span className="text-xs sm:text-sm font-bold text-ink-secondary">
              {loc.tapPrompt}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
