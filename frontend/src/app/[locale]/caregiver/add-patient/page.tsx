import { Link } from "@/i18n/navigation";
import { DevImportTools } from "./DevImportTools";

export const metadata = {
  title: "Add New Patient — CogniCare",
  description: "Add a new patient profile to the cognitive care platform",
};

type Props = { params: Promise<{ locale: string }> };

const ADD_PATIENT_I18N: Record<string, { title: string; subtitle: string; back: string }> = {
  as: { title: "নতুন ৰোগী যোগ কৰক", subtitle: "জ্ঞানীয় যত্নৰ বাবে ব্যক্তিগত প্ৰফাইল সৃষ্টি কৰক", back: "← ঘূৰি যাওক" },
  hi: { title: "नया मरीज़ जोड़ें", subtitle: "संज्ञानात्मक देखभाल हेतु व्यक्तिगत प्रोफ़ाइल बनाएँ", back: "← वापस" },
  en: { title: "Add New Patient", subtitle: "Create a personalized profile for cognitive care", back: "← Back" },
  bn: { title: "নতুন রোগী যোগ করুন", subtitle: "জ্ঞানীয় যত্নের জন্য ব্যক্তিগত প্রোফাইল তৈরি করুন", back: "← ফিরে যান" },
  mr: { title: "नवीन रुग्ण जोडा", subtitle: "संज्ञानात्मक काळजीसाठी वैयक्तिक प्रोफाइल तयार करा", back: "← मागे" },
  ne: { title: "नयाँ बिरामी थप्नुहोस्", subtitle: "संज्ञानात्मक हेरचाहका लागि व्यक्तिगत प्रोफाइल सिर्जना गर्नुहोस्", back: "← पछाडि" },
  mni: { title: "অনৌবা অনাবা হাপচিল্লু", subtitle: "ৱাখলগী য়েংশিনবগীদমক মশাগী প্রোফাইল শেম্মু", back: "← হল্লু" },
  brx: { title: "गोदान बेमारि दाजाब", subtitle: "गोसोखांथि हेफाजातनि थाखाय गावनि प्रफाइल बानाय", back: "← थांफिन" },
  grt: { title: "Gital Sa·gipako On·dapbo", subtitle: "Gisik ra·ani dakchakanina an·tangni profile taribo", back: "← Re·angtaibo" },
  kha: { title: "Pyniasoh Nongpang Bathymmai", subtitle: "Shna ia ka profile kyrpang ban iarap ia ka jingkynmaw", back: "← Leit Dien" },
  lus: { title: "Damlo Thar Dah Lut Rawh", subtitle: "Hriatna puih nan profile siam rawh", back: "← Let Leh Rawh" },
};

export default async function AddPatientPage({ params }: Props) {
  const { locale } = await params;
  const str = ADD_PATIENT_I18N[locale] || ADD_PATIENT_I18N.en;

  return (
    <div className="min-h-screen pb-8">
      <div className="bg-ink border-b-4 border-border px-4 py-2.5 md:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink-inverse">
              {str.title}
            </h1>
            <p className="text-ink-inverse/60 text-xs mt-0.5">
              {str.subtitle}
            </p>
          </div>
          <Link
            href="/caregiver"
            className="text-ink-inverse/60 hover:text-ink-inverse font-bold text-sm transition-colors"
          >
            {str.back}
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        <DevImportTools />
      </div>
    </div>
  );
}
