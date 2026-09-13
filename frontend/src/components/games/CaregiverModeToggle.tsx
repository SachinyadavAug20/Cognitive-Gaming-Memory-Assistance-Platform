"use client";

import React from "react";
import { ShieldCheck, UserCheck } from "lucide-react";
import { useLocale } from "next-intl";
import { useGameVerificationStore } from "@/store/useGameVerificationStore";

const CAREGIVER_TOGGLE_I18N: Record<string, {
  active: string;
  inactive: string;
  titleActive: string;
  titleInactive: string;
}> = {
  en: {
    active: "Caregiver Mode: Active",
    inactive: "Caregiver Stamping",
    titleActive: "Caregiver Verification Mode is ON. Click to switch to Patient view.",
    titleInactive: "Enable Caregiver Verification Mode to endorse or stamp games.",
  },
  as: {
    active: "তত্ত্বাৱধায়ক ম'ড: সক্ৰিয়",
    inactive: "তত্ত্বাৱধায়ক মোহৰ",
    titleActive: "তত্ত্বাৱধায়ক পৰীক্ষণ ম'ড সক্ৰিয়। ৰোগীৰ দৃশ্যলৈ সলনি কৰিবলৈ ক্লিক কৰক।",
    titleInactive: "খেলসমূহ প্ৰত্যায়িত কৰিবলৈ তত্ত্বাৱধায়ক ম'ড সক্ৰিয় কৰক।",
  },
  hi: {
    active: "देखभालकर्ता मोड: सक्रिय",
    inactive: "देखभालकर्ता मुहर",
    titleActive: "देखभालकर्ता सत्यापन मोड चालू है। रोगी दृश्य पर स्विच करने के लिए क्लिक करें।",
    titleInactive: "खेलों को प्रमाणित करने के लिए देखभालकर्ता मोड सक्षम करें।",
  },
  bn: {
    active: "পরিচর্যাকারী মোড: সক্রিয়",
    inactive: "পরিচর্যাকারী সিল",
    titleActive: "পরিচর্যাকারী যাচাইকরণ মোড চালু রয়েছে। রোগী ভিউতে যেতে ক্লিক করুন।",
    titleInactive: "গেম প্রত্যয়ন করতে পরিচর্যাকারী মোড সক্রিয় করুন।",
  },
  mr: {
    active: "काळजीवाहू मोड: सक्रिय",
    inactive: "काळजीवाहू शिक्का",
    titleActive: "काळजीवाहू पडताळणी मोड चालू आहे. रुग्ण दृश्यावर जाण्यासाठी क्लिक करा.",
    titleInactive: "खेळ प्रमाणित करण्यासाठी काळजीवाहू मोड सक्षम करा.",
  },
  ne: {
    active: "हेरचाहकर्ता मोड: सक्रिय",
    inactive: "हेरचाहकर्ता प्रमाणीकरण",
    titleActive: "हेरचाहकर्ता प्रमाणीकरण मोड सक्रिय छ। बिरामी दृश्यमा जान क्लिक गर्नुहोस्।",
    titleInactive: "खेलहरू प्रमाणित गर्न हेरचाहकर्ता मोड सक्षम गर्नुहोस्।",
  },
  mni: {
    active: "য়েংশিনবগী মোদ: চৎনরে",
    inactive: "য়েংশিনবগী মোহর",
    titleActive: "য়েংশিনবগী মোদ চৎনরি। অনাবগী ভ্যুদা ওনবা ক্লিক তৌউ।",
    titleInactive: "শান্নপোৎশিং সর্তিফাই তৌনবগীদমক মোদ অসি হাংদোকউ।",
  },
  brx: {
    active: "नायदिंग्रा म'ड: साख्रि",
    inactive: "नायदिंग्रा महर",
    titleActive: "नायदिंग्रा म'ड साख्रि जानानै दं। बेरामी नुथायाव थांनो थु।",
    titleInactive: "गेलेनायफोरखौ सार्टिफाइ खालामनो बे म'डखौ साख्रि खालाम।",
  },
  grt: {
    active: "Nirokgipa Mode: Kam Ka·enga",
    inactive: "Nirokgipani Mohor",
    titleActive: "Nirokgipani mode kam ka·enga. Sagipani nikanina jotbo.",
    titleInactive: "Kal·anirangko sakki on·na nirokgipa mode-ko a·bachengbo.",
  },
  kha: {
    active: "Rukom Nongsumar: Trei kam",
    inactive: "Mohor Nongsumar",
    titleActive: "Ka rukom nongsumar la trei kam. Thb ban leit sha ka dur nongpang.",
    titleInactive: "Plie ia ka rukom nongsumar ban pynshisha ia ki jingialehkai.",
  },
  lus: {
    active: "Enkawltu Mode: A Nung",
    inactive: "Enkawltu Nemnghehna",
    titleActive: "Enkawltu finfiahna a nung e. Damlo ennaa let leh turin hmet rawh.",
    titleInactive: "Infiamnate nemngheh nan enkawltu mode on rawh.",
  },
};

export function CaregiverModeToggle() {
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const t = CAREGIVER_TOGGLE_I18N[normLoc] || CAREGIVER_TOGGLE_I18N.en;
  const { caregiverMode, toggleCaregiverMode } = useGameVerificationStore();

  return (
    <button
      type="button"
      onClick={toggleCaregiverMode}
      title={caregiverMode ? t.titleActive : t.titleInactive}
      className={`btn-tactile flex items-center gap-2 rounded-2xl border-2 border-black px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
        caregiverMode
          ? "bg-tea text-white scale-[1.02] shadow-[3px_3px_0px_#000]"
          : "bg-surface text-ink hover:bg-surface-muted"
      }`}
    >
      {caregiverMode ? (
        <>
          <ShieldCheck className="h-4 w-4 text-emerald-200" />
          <span>{t.active}</span>
          <span className="h-2 w-2 rounded-full bg-emerald-300 animate-ping" />
        </>
      ) : (
        <>
          <UserCheck className="h-4 w-4 text-ink-secondary" />
          <span>{t.inactive}</span>
        </>
      )}
    </button>
  );
}
