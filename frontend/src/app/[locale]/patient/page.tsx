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
import dynamic from "next/dynamic";
import { useIdleTimeout } from "@/hooks/useIdleTimeout";
import { getMediaUrl } from "@/lib/api";
import { patientLangCode } from "@/lib/i18n";
import { playEncourage, playCalmTone, playGammaStimulation, playTapFeedback, unlockAudio } from "@/lib/sound";

const MemoryLightbox = dynamic(
  () => import("@/components/ui/MemoryLightbox").then((m) => m.MemoryLightbox),
  { ssr: false }
);
import { speak } from "@/lib/speech";
import { speechRate } from "@/games/config";
import { AudioToggle } from "@/components/ui/AudioToggle";
import { MemorySpotlightCard } from "@/components/patient-dashboard/MemorySpotlightCard";
import { SensoryCalmCard } from "@/components/patient-dashboard/SensoryCalmCard";
import { DailyMoodTracker, type MoodKey } from "@/components/patient-dashboard/DailyMoodTracker";
import { DailyRoutineSchedule } from "@/components/patient-dashboard/DailyRoutineSchedule";
import { TherapySuiteGrid } from "@/components/patient-dashboard/TherapySuiteGrid";
import { SaathiVoiceCompanion } from "@/components/patient-dashboard/SaathiVoiceCompanion";
import { PatientBottomLogout } from "@/components/patient/PatientBottomLogout";
import { PatientMealSnapCard } from "@/components/patient-dashboard/PatientMealSnapCard";
import { useHyperCustomizationStore } from "@/store/useHyperCustomizationStore";

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



export const LOCALIZED_RELATIONS: Record<string, Record<string, string>> = {
  Son: {
    hi: "बेटा", as: "পুত্ৰ", bn: "ছেলে", mr: "मुलगा", ne: "छोरा", mni: "মচা নুপা", brx: "फिसा", grt: "De·gipa", kha: "Khun", lus: "Fapa", en: "Son"
  },
  Daughter: {
    hi: "बेटी", as: "জীয়াৰী", bn: "মেয়ে", mr: "मुलगी", ne: "छोरी", mni: "মচা নুপী", brx: "फिसोजो", grt: "Me·chik de", kha: "Khun kynthei", lus: "Fanu", en: "Daughter"
  },
  Spouse: {
    hi: "जीवनसाथी", as: "জীৱনসংগী", bn: "জীবনসঙ্গী", mr: "जोडीदार", ne: "जीवनसाथी", mni: "লৈমিন্নবী", brx: "जौहर", grt: "Jik/Se", kha: "Lok", lus: "Kawppui", en: "Spouse"
  },
  Wife: {
    hi: "पत्नी", as: "পত্নী", bn: "স্ত্রী", mr: "पत्नी", ne: "श्रीमती", mni: "নুপী", brx: "बिसि", grt: "Jik", kha: "Tnga", lus: "Nupui", en: "Wife"
  },
  Husband: {
    hi: "पति", as: "স্বামী", bn: "স্বামী", mr: "पती", ne: "श्रीमान", mni: "নুপা", brx: "हौवा", grt: "Se", kha: "Kpa", lus: "Pasal", en: "Husband"
  },
  Grandchild: {
    hi: "पोता/पोती", as: "নাতি/নাতিনী", bn: "নাতি/নাতনি", mr: "नातवंड", ne: "नाति/नातिना", mni: "ইশু", brx: "उन्दै फिसा", grt: "Su·gipa", kha: "Khun ksiew", lus: "Tu", en: "Grandchild"
  },
  Brother: {
    hi: "भाई", as: "ভাই/ককায়েক", bn: "ভাই", mr: "भाऊ", ne: "दाजु/भाइ", mni: "ইচল/মনাও", brx: "आदा/फंबाय", grt: "Ada/Jong", kha: "Hymmen rangbah", lus: "Unaupa", en: "Brother"
  },
  Sister: {
    hi: "बहन", as: "ভনী/বাইদেউ", bn: "বোন", mr: "बहीण", ne: "दीदी/बहिनी", mni: "ইচেল", brx: "आबौ/बिब'नां", grt: "Abi/Nokna", kha: "Hymmen kynthei", lus: "Unaunu", en: "Sister"
  },
  Father: {
    hi: "पिता", as: "দেউতা", bn: "বাবা", mr: "वडील", ne: "बुबा", mni: "ইপা", brx: "अफा", grt: "Paa", kha: "Kpa", lus: "Pa", en: "Father"
  },
  Mother: {
    hi: "माता", as: "মা", bn: "মা", mr: "आई", ne: "आमा", mni: "ইমা", brx: "आइ", grt: "Maa", kha: "Kmie", lus: "Nu", en: "Mother"
  },
  Family: {
    hi: "परिवार", as: "পৰিয়াল", bn: "পরিবার", mr: "कुटुंब", ne: "परिवार", mni: "ইমুং", brx: "নखर", grt: "Nokgiparang", kha: "Kha-iiang", lus: "Chhungkua", en: "Family"
  }
};

export const LOCALIZED_NAMES: Record<string, Record<string, string>> = {
  "Biren Borah": {
    hi: "बीरेन बोरा", as: "বীৰেন বৰা", bn: "বীরেন বোরা", mr: "बिरेन बोरा", ne: "बिरेन बोरा", mni: "বীরেন বোরা", brx: "बिरेन बरा", grt: "Biren Borah", kha: "Biren Borah", lus: "Biren Borah", en: "Biren Borah",
  },
  "Sunita Borah": {
    hi: "सुनीता बोरा", as: "সুনীতা বৰা", bn: "সুনীতা বোরা", mr: "सुनीता बोरा", ne: "सुनिता बोरा", mni: "সুনীতা বোরা", brx: "सुनिता बोरा", grt: "Sunita Borah", kha: "Sunita Borah", lus: "Sunita Borah", en: "Sunita Borah",
  },
  "Manash Borah": {
    hi: "मानस बोरा", as: "মানস বৰা", bn: "মানস বোরা", mr: "मानस बोरा", ne: "मानस बोरा", mni: "মানস বোরা", brx: "मानस बरा", grt: "Manash Borah", kha: "Manash Borah", lus: "Manash Borah", en: "Manash Borah",
  },
  "Pratima Borah": {
    hi: "प्रतिमा बोरा", as: "প্ৰতিমা বৰা", bn: "প্রতিমা বোরা", mr: "प्रतिमा बोरा", ne: "प्रतिमा बोरा", mni: "প্রতিমা বোরা", brx: "प्रतिमा बरा", grt: "Pratima Borah", kha: "Pratima Borah", lus: "Pratima Borah", en: "Pratima Borah",
  },
  "Ananya Borah": {
    hi: "अनन्या बोरा", as: "অনন্যা বৰা", bn: "অনন্যা বোরা", mr: "अनन्या बोरा", ne: "अनन्या बोरा", mni: "অনন্যা বোরা", brx: "अनन्या बरा", grt: "Ananya Borah", kha: "Ananya Borah", lus: "Ananya Borah", en: "Ananya Borah",
  },
  "Arnav Borah": {
    hi: "अर्णव बोरा", as: "অৰ্ণৱ বৰা", bn: "অর্ণব বোরা", mr: "अर्णव बोरा", ne: "अर्णव बोरा", mni: "অর্ণব বোরা", brx: "अर्नब बरा", grt: "Arnav Borah", kha: "Arnav Borah", lus: "Arnav Borah", en: "Arnav Borah",
  },
  "Dhireswar Borah": {
    hi: "धीरेस्वर बोरा", as: "ধীৰেশ্বৰ বৰা", bn: "ধীরেশ্বর বোরা", mr: "धीरेस्वर बोरा", ne: "धीरेस्वर बोरा", mni: "ধীরেশ্বর বোরা", brx: "धीरेस्वर बरा", grt: "Dhireswar Borah", kha: "Dhireswar Borah", lus: "Dhireswar Borah", en: "Dhireswar Borah",
  },
};

export const LOCALIZED_FAMILY_NOTES: Record<string, Record<string, string>> = {
  "Manash Borah": {
    en: "Eldest son, mechanical engineer in Guwahati. Visits every Sunday morning.",
    hi: "बड़ा बेटा, गुवाहाटी में मैकेनिकल इंजीनियर। हर रविवार सुबह मिलने आते हैं।",
    as: "বৰ ল'ৰা, গুৱাহাটীত মেকানিকল ইঞ্জিনিয়াৰ। প্ৰতি দেওবাৰে পুৱা ঘৰলৈ আহে।",
    bn: "বড় ছেলে, গুয়াহাটিতে মেকানিক্যাল ইঞ্জিনিয়ার। প্রতি রবিবার সকালে বাড়িতে আসে।",
    mr: "मोठा मुलगा, गुवाहाटीमध्ये मेकॅनिकल इंजिनिअर. प्रत्येक रविवारी सकाळी भेटायला येतो.",
    ne: "जेठो छोरा, गुवाहाटीमा मेकानिकल इन्जिनियर। प्रत्येक आइतबार बिहान भेट्न आउँछन्।",
    mni: "অহানবা মচা নুপা, গুৱাহাটীদা মেকানিকল ইঞ্জিনিয়র। হপ্তা খুদিংগী নোংমাইজিংদা লাকই।",
    brx: "गेदेर फिसा, गुवाहाटीआव मेकानिकेल इन्जिनियार। सानफ्रोमबो रबिबारनि फुंआव फैयो।",
    grt: "Dal·batgipa depante, Guwahati-o engineer. Robibar pringanti re·baenga.",
    kha: "U khun rangbah, u mechanical engineer ha Guwahati. U wan jngoh man ka step sngi U Blei.",
    lus: "Fapa upa ber, Guwahati-ah mechanical engineer a ni. Pathianni zing tin a rawn tlawh thin.",
  },
  "Pratima Borah": {
    en: "Married for 46 years. Loves gardening and cooking traditional Khar together.",
    hi: "46 वर्षों का सुखद वैवाहिक जीवन। साथ में बागवानी और पारंपरिक खार पकाना पसंद है।",
    as: "৪৬ বছৰৰ বৈবাহিক জীৱন। ফুলনিৰ যতন লোৱা আৰু একেলগে পৰম্পৰাগত খাৰ ৰন্ধা পছন্দ কৰে।",
    bn: "৪৬ বছরের দাম্পত্য জীবন। একসাথে বাগান করা ও ঐতিহ্যবাহী ক্ষার রান্না পছন্দ করেন।",
    mr: "४६ वर्षांचे वैवाहिक जीवन. एकत्र बागकाम करणे आणि पारंपरिक खार बनवणे आवडते.",
    ne: "४६ वर्षको वैवाहिक जीवन। सँगै बगैँचाको हेरचाह र परम्परागत खार पकाउन मन पराउँछन्।",
    mni: "চহী ৪৬ লৈমিন্নরক্লবা নুপি। লোয়ননা লৈকোল য়েংশিনবা অমসুং খার থোংবা পাম্বী।",
    brx: "46 बोसोरनि हाबा जानाय। लोगोसे बिबार बागानाव खामानि मावनो मोजां मोनों।",
    grt: "Bilsi 46 jik ong·aha. Bagan ka·ani aro cha·ani song·ani namnika.",
    kha: "46 snem ka jingshongkurim. Sngewbha ban rep kper bad shet jingshet tynrai.",
    lus: "Kum 46 chhung innei tawh. Huan enkawl dun leh hnam chaw chhum dun nuam ti em em.",
  },
  "Ananya Borah": {
    en: "Youngest daughter, teacher at Cotton University. Calls every evening at 7 PM.",
    hi: "सबसे छोटी बेटी, कॉटन यूनिवर्सिटी में शिक्षिका। हर शाम 7 बजे फोन करती हैं।",
    as: "কনিষ্ঠা জীয়াৰী, কটন বিশ্ববিদ্যালয়ৰ শিক্ষয়িত্ৰী। প্ৰতিদিনে সন্ধিয়া ৭ বজাত ফোন কৰে।",
    bn: "ছোট মেয়ে, কটন বিশ্ববিদ্যালয়ের শিক্ষিকা। প্রতিদিন সন্ধ্যা ৭টায় ফোন করে।",
    mr: "लहान मुलगी, कॉटन युनिव्हर्सिटीत शिक्षिका. दररोज संध्याकाळी ७ वाजता फोन करते.",
    ne: "कान्छी छोरी, कटन विश्वविद्यालयमा शिक्षिका। हरेक साँझ ७ बजे फोन गर्छिन्।",
    mni: "অতোনবী মচা নুপী, কটন য়ুনিভর্সিটিতে ওজা। নুমিদাং পুং ৭ তা কোল তৌই।",
    brx: "उन्दै फिसोजो, कटन युनिभार्सिटिनि फोरोंगिरि। बेलासे 7 रिंगायाव कल खालामो।",
    grt: "Me·chik de, Cotton University-o skigipa. Attam 7 bajio call ka·a.",
    kha: "Ka khun khatduh, ka nonghikai ha Cotton University. Ka shait phone man ka 7 janmiet.",
    lus: "Fanu naupang ber, Cotton University zirtirtu. Tlai dar 7 ah a rawn be ziah.",
  },
  "Arnav Borah": {
    en: "8-year-old grandson. Loves hearing bedtime folklore tales about Kaziranga.",
    hi: "8 वर्षीय पोता। काजीरंगा की लोककथाएं और परियों की कहानियां सुनना पसंद है।",
    as: "৮ বছৰীয়া নাতি। শোৱাৰ সময়ত কাজিৰঙাৰ সাধুকথা শুনি ভাল পায়।",
    bn: "৮ বছরের নাতি। কাজিরাঙার রূপকথা ও লোকগাথা শুনতে ভালোবাসে।",
    mr: "८ वर्षांचा नातू. काझीरंगाच्या लोककथा ऐकायला आवडतात.",
    ne: "८ वर्षको नाति। काजिरङ्गाका पुराना लोककथा सुन्न मन पराउँछन्।",
    mni: "চহী ৮ শুরবা ইশু নুপা। কাজিরঙ্গাগী ৱারী তারগা তুম্বা পাম্বী।",
    brx: "8 बोसोरनि उन्दै फिसा। काजिरंगानि सोलो खोनासंनो मोजां मोनों।",
    grt: "Bilsi 8 su·gipa. Kazirangani golpo knana namnika.",
    kha: "U khun ksiew 8 snem. U sngewbha ban sngap ia ki puriskam Kaziranga.",
    lus: "Tupa kum 8 mi. Kaziranga chungchang thawnthu ngaihthlak nuam ti em em.",
  },
  "Dhireswar Borah": {
    en: "Elder brother residing in Jorhat. Frequent telephone chats about family ancestral lands.",
    hi: "जोरहाट में रहने वाले बड़े भाई। पुश्तैनी जमीन और खेती के बारे में अक्सर फोन पर बात करते हैं।",
    as: "যোৰহাটত থকা ককায়েক। পৈতৃক মাটি আৰু ঘৰুৱা বিষয় লৈ প্ৰায়ে টেলিফোনত কথা পাতে।",
    bn: "যোরহাটে বসবাসকারী বড় ভাই। পৈতৃক ভিটেমাটি নিয়ে প্রায়ই ফোনে কথা বলেন।",
    mr: "जोरहाटमध्ये राहणारे मोठे भाऊ. वडिलोपार्जित जमिनीबाबत वारंवार फोनवर चर्चा करतात.",
    ne: "जोरहाटमा बस्ने जेठो दाजु। पुर्ख्यौली जग्गाको बारेमा प्रायः फोनमा कुरा गर्छन्।",
    mni: "যোরহাত্তা লৈবা ইচল। মমা-মপা পৈথ্রিক লমগী মরমদা ফোনদা পাউ ইন্নই।",
    brx: "जोरहातआव थानाय गेदेर आदा। आबौफोरनि हा-हुनि खोथा सावरायो।",
    grt: "Jorhat-o dongipa ada. Nokdangni a·a gimin agangrika.",
    kha: "U hymmen rangbah ba shong ha Jorhat. Ki shait iakren halor ka khyndew kpa.",
    lus: "Jorhat-a cheng unaupa upa ber. Chhungkaw ram chungchang telephone-a sawi dun thin.",
  },
};

export const LOCALIZED_PLACES: Record<string, { name: Record<string, string>; desc: Record<string, string> }> = {
  "Silpukhuri Family Residence": {
    name: {
      en: "Silpukhuri Family Residence",
      hi: "सिल्पुखुरी पारिवारिक आवास",
      as: "শিলপুখুৰীৰ পৰিয়ালৰ বাসভৱন",
      bn: "শিলপুকুরির পারিবারিক বাসভবন",
      mr: "सिल्पुखुरी कौटुंबिक निवास",
      ne: "सिल्पुखुरी पारिवारिक निवास",
      mni: "সিলপুখুরী ইমুংগী য়ুম",
      brx: "सिल्पुखुरि नखरनि थाग्रा न'",
      grt: "Silpukhuri Nokdangni Nok",
      kha: "Iing Silpukhuri",
      lus: "Silpukhuri Chhungkua In",
    },
    desc: {
      en: "Two-story ancestral brick home with betel nut trees and tea garden bushes.",
      hi: "सुपारी के पेड़ों और चाय की क्यारियों से घिरा दो मंजिला पुश्तैनी मकान।",
      as: "তামোল গছ আৰু চাহপাতেৰে আগুৰা দুমহলীয়া পৈতৃক গৃহ।",
      bn: "সুপারি গাছ ও চা গাছে ঘেরা দোতলা পৈতৃক বাড়ি।",
      mr: "सुपारीच्या झाडांनी आणि चहाच्या झुडुपांनी वेढलेले दोन मजली वडिलोपार्जित घर.",
      ne: "सुपारीको रूख र चियाबारीले घेरिएको दुई तले पुर्ख्यौली घर।",
      mni: "কুৱা পাম্বী অমসুং চা পাম্বীনা কোইশিনবা মহক অনি পানবা পৈথ্রিক য়ুম।",
      brx: "गोयो बिफां आरो साहा बिलाइजों बेहेरजानाय नखरनि न'फोर।",
      grt: "Gue bol aro cha bijak donggipa nokdangni nok.",
      kha: "Iing ar mala kaba don ki dieng kwai bad ki sla sha.",
      lus: "Kuva thing leh thingpui huan bula in ding hmun.",
    },
  },
  "Silpukhuri Morning Market": {
    name: {
      en: "Silpukhuri Morning Market",
      hi: "सिल्पुखुरी सुबह का बाज़ार",
      as: "শিলপুখুৰীৰ পুৱাৰ বজাৰ",
      bn: "শিলপুকুরির সকালের বাজার",
      mr: "सिल्पुखुरी सकाळचा बाजार",
      ne: "सिल्पुखुरी बिहानी बजार",
      mni: "সিলপুখুরী অয়ুক্কী কৈথেল",
      brx: "सिल्पुखुरि फुंनि बाजार",
      grt: "Silpukhuri Pringni Bazaar",
      kha: "Iew Mynstep Silpukhuri",
      lus: "Silpukhuri Zing Bazar",
    },
    desc: {
      en: "Local daily bazaar where Biren buys fresh river fish and organic greens every morning.",
      hi: "स्थानीय दैनिक बाज़ार जहां बीरेन हर सुबह ताज़ी नदी की मछली और हरी सब्ज़ियां खरीदते हैं।",
      as: "স্থানীয় দৈনিক বজাৰ য'ৰ পৰা বীৰেনে নিতৌ পুৱা সতেজ নৈৰ মাছ আৰু শাক-পাচলি কিনে।",
      bn: "স্থানীয় বাজার যেখান থেকে বীরেন রোজ সকালে টাটকা নদীর মাছ ও শাকসবজি কেনেন।",
      mr: "स्थानिक बाजार जेथून बिरेन दररोज सकाळी ताजे मासे आणि ताज्या भाज्या आणतात.",
      ne: "स्थानीय दैनिक बजार जहाँ बिरेन हरेक बिहान ताजा खोलाको माछा र हरियो सागसब्जी किन्छन्।",
      mni: "বীৰেন্না নুমিৎ খুদিংগী অশেংবা ঙা অমসুং হৌদোং হিদাক লৈবা কৈথেল।",
      brx: "फुंनि सानफ्रोमनि बाजार जेराव बिरेनआ गोथार ना आरो मैगं-थायगं बाययो।",
      grt: "Biap jelo Biren salanti pringo na·tok aro sam-jak brea.",
      kha: "Ka iew ba u Biren u thied dohkha bad jhur man ka step.",
      lus: "Biren-a'n sangha tharlam leh thlai tharlam a lei ziahna hmun.",
    },
  },
  "Hari Namghar Prayer Hall": {
    name: {
      en: "Hari Namghar Prayer Hall",
      hi: "हरि नामघर प्रार्थना स्थल",
      as: "হৰি নামঘৰ প্ৰাৰ্থনা গৃহ",
      bn: "হরি নামঘর প্রার্থনা গৃহ",
      mr: "हरी नामघर प्रार्थना स्थळ",
      ne: "हरि नामघर प्रार्थना स्थल",
      mni: "হরি নামঘর লাইশং",
      brx: "हरि नामघर पुजा जायगा",
      grt: "Hari Namghar Biap",
      kha: "Hari Namghar Jaka Duwai",
      lus: "Hari Namghar Biak In",
    },
    desc: {
      en: "Traditional Assamese Vaishnavite prayer hall for community hymns and evening Doba.",
      hi: "सामुदायिक भजन-कीर्तन और संध्या आरती के लिए पारंपरिक वैष्णव नामघर।",
      as: "সামূহিক নাম-কীৰ্তন আৰু সন্ধিয়াৰ ডবা-শংখ ধ্বনিৰ বাবে পৰম্পৰাগত বৈষ্ণৱ নামঘৰ।",
      bn: "সম্মিলিত নাম-সংকীর্তন ও সন্ধ্যার উপাসনার ঐতিহ্যবাহী বৈষ্ণব নামঘর।",
      mr: "सामुदायिक भजने आणि संध्याकाळच्या आरतीसाठी पारंपरिक वैष्णव नामघर.",
      ne: "सामूहिक भजन-कीर्तन र सन्ध्या आरतीको लागि परम्परागत वैष्णव नामघर।",
      mni: "মীফমগী শৈথা-ঈশৈ অমসুং নুমিদাংগী আরতিগী বৈষ্ণব লাইশং।",
      brx: "हारिमुनि मेथाइ आरो बेलासेनि आरजि थाखाय बैस्राब नामघर।",
      grt: "Songsalni torom git aro attamni namghar.",
      kha: "Ka jaka mane tynrai na ka bynta ki jingrwai niam bad duwai janmiet.",
      lus: "Hnam hla leh tlai tawngtai inkhawmna biak in hmun thianghlim.",
    },
  },
  "Dighalipukhuri Lake Park": {
    name: {
      en: "Dighalipukhuri Lake Park",
      hi: "दीघलीपुखुरी झील पार्क",
      as: "দীঘলীপুখুৰী হ্ৰদ উদ্যান",
      bn: "দীঘলীপুকুর হ্রদ পার্ক",
      mr: "दीघलीपुखुरी तलाव उद्यान",
      ne: "दीघलीपुखुरी ताल पार्क",
      mni: "দীঘলীপুখুরী পাৎ পার্ক",
      brx: "दीघलीपुखुरि बिलो पार्क",
      grt: "Dighalipukhuri Bil Park",
      kha: "Pung Dighalipukhuri",
      lus: "Dighalipukhuri Dil Park",
    },
    desc: {
      en: "Historic lake surrounded by centuries-old rain trees where Biren takes his daily evening walks.",
      hi: "सैकड़ों वर्ष पुराने विशाल पेड़ों से घिरी ऐतिहासिक झील, जहां बीरेन रोज़ शाम को टहलते हैं।",
      as: "শতিকাৰ পুৰণি গছেৰে আগুৰা ঐতিহাসিক হ্ৰদ য'ত বীৰেনে নিতৌ সন্ধিয়া খোজ কাঢ়ে।",
      bn: "শতবর্ষ প্রাচীন গাছে ঘেরা ঐতিহাসিক হ্রদ যেখানে বীরেনবাবু রোজ বিকেলে হাঁটেন।",
      mr: "शतकानुशतके जुन्या वृक्षांनी वेढलेला ऐतिहासिक तलाव जेथे बिरेन दररोज संध्याकाळी फिरतात.",
      ne: "सयौं वर्ष पुराना रुखहरूले घेरिएको ऐतिहासिक ताल जहाँ बिरेन हरेक साँझ हिंड्छन्।",
      mni: "চহী চাম্বী উনা কোইশিনবা পুৱারি ওইরবা পাৎ মফমদা বীৰেন্না নুমিৎ খুদিংগী চৎই।",
      brx: "बोसोर सानि गोदोनानि बिफांफोरजों बेहेरजानाय बिलो जेराव बिरेनआ बेलासे थाबायो।",
      grt: "Bilsi ritchani bolrangchi dongimin chibima jelo Biren attamo re·a.",
      kha: "Ka pung barim kaba ker da ki dieng heh ba u Biren u leit iaid kai man ka janmiet.",
      lus: "Thingbuk lian tak taka hualvel dil hlun, Biren-a tlai tin a len harhna thin.",
    },
  },
};

export const LOCALIZED_CATEGORIES: Record<string, Record<string, string>> = {
  Home: {
    en: "Home", as: "ঘৰ", hi: "घर", bn: "বাড়ি", mr: "घर", ne: "घर", mni: "য়ুম", brx: "न'", grt: "Nok", kha: "Iing", lus: "In"
  },
  Market: {
    en: "Market", as: "বজাৰ", hi: "बाज़ार", bn: "বাজার", mr: "बाजार", ne: "बजार", mni: "কৈথেল", brx: "बाजार", grt: "Bazaar", kha: "Iew", lus: "Bazar"
  },
  Worship: {
    en: "Worship", as: "উপাসনা / নামঘৰ", hi: "पूजा स्थल", bn: "উপাসনালয়", mr: "पूजास्थान", ne: "पूजास्थल", mni: "লাইশং", brx: "पुजा जायगा", grt: "Ol·akiani", kha: "Jaka Mane", lus: "Biak In"
  },
  Park: {
    en: "Park", as: "উদ্যান", hi: "उद्यान / पार्क", bn: "উদ্যান", mr: "उद्यान", ne: "उद्यान / पार्क", mni: "উদ্যান", brx: "पार्क", grt: "Park", kha: "Kper", lus: "Park"
  },
  Clinic: {
    en: "Clinic", as: "চিকিৎসালয়", hi: "चिकित्सालय", bn: "চিকিৎসালয়", mr: "दवाखाना", ne: "अस्पताल / क्लिनिक", mni: "অনাবগী য়ুম", brx: "फाहामथायसाल'", grt: "Sam Nok", kha: "Klinik", lus: "Damdawi In"
  },
  School: {
    en: "School", as: "বিদ্যালয়", hi: "विद्यालय", bn: "বিদ্যালয়", mr: "शाळा", ne: "विद्यालय", mni: "স্কুল", brx: "फरायसाल'", grt: "School", kha: "Skul", lus: "Sikul"
  }
};

export const LOCALIZED_JOY_TRIGGERS: Record<string, string> = {
  en: "Bihu songs by Bhupen Hazarika, tending to terrace orchids, playing carrom with grandson Arnav, morning fresh CTC tea.",
  hi: "भूपेन हजारिका के बिहू गीत, छत पर ऑर्किड की देखभाल, पोते अर्णव के साथ कैरम, सुबह की ताज़ा कड़क चाय।",
  as: "ভূপেন হাজৰিকাৰ বিহু গীত, ফুলনিৰ কপৌফুলৰ যতন, নাতি অৰ্ণৱৰ সৈতে কেৰম খেল, পুৱাৰ সতেজ গৰম চাহ।",
  bn: "ভূপেন হাজারিকার বিহু গান, বারান্দায় অর্কিডের যত্ন, নাতি অর্ণবের সাথে ক্যারাম খেলা, সকালের তাজা চা।",
  mr: "भूपेन हजारिकांची बिहू गीते, बाल्कनीतील ऑर्किडची काळजी, नातू अर्णवसोबत कॅरम, सकाळचा ताजा कडक चहा.",
  ne: "भूपेन हजारिकाका बिहु गीतहरू, बगैँचाको हेरचाह, नाति अर्णवसँग क्यारम, बिहानीको तातो चिया।",
  mni: "ভূপেন হাজরিকাগী বিহু ঈশৈ, লৈকোলগী লৈ য়েংশিনবা, ইশু অর্ণবগা কেরম শানবা, অয়ুক্কী অশাবা চা।",
  brx: "भुपेन हाजारिकानि बिहु रोजाबनाय, बिबार बागानाव हाबा मावनाय, फिसाज्ला अर्नबजों केरम गेलेनाय, फुंनि गुदुं साहा।",
  grt: "Bhupen Hazarikani gitrang, bagan tarigipa, Arnav baksa carrom kal·ani, pringo cha ringani.",
  kha: "Ki jingrwai Bihu jong u Bhupen Hazarika, kper syntiew, ialeh carrom bad u khun ksiew Arnav, sha saw mynstep.",
  lus: "Bhupen Hazarika Bihu hla, huan enkawl, tupa Arnav nen carrom khelh, zing thingpui sa in.",
};

export const LOCALIZED_FAVORITE_MUSIC: Record<string, string> = {
  en: "Dr. Bhupen Hazarika evergreen classics, Bihu folk songs, Goalparia Loka-Geet",
  hi: "डॉ. भूपेन हजारिका के सदाबहार गीत, बिहू लोकगीत, गोलपड़िया लोकगीत",
  as: "ড° ভূপেন হাজৰিকাৰ কালজয়ী গীত, বিহু লোকগীত, গোৱালপৰীয়া লোকগীত",
  bn: "ডঃ ভূপেন হাজারিকার কালজয়ী গান, বিহু লোকগীতি, গোয়ালপাড়িয়া লোকগীত",
  mr: "डॉ. भूपेन हजारिका यांची सदाबहार गाणी, बिहू लोकगीते, गोलपडिया लोकगीते",
  ne: "डा. भूपेन हजारिकाका सदाबहार गीतहरू, बिहु लोकगीत, गोलपडिया लोकगीत",
  mni: "দা. ভূপেন হাজরিকাগী মতম চুপ্পগী ঈশৈ, বিহু লোকগীত, গোলপরিয়া লোকগীত",
  brx: "डा. भुपेन हाजारिकानि गाबख्रेब रोजाबनाय, बिहु मेथाइ, गोलपडिया मेथाइ",
  grt: "Dr. Bhupen Hazarikani git, Bihu folk ring·ani, Goalparia gitrang",
  kha: "Ki jingrwai tynrai Dr. Bhupen Hazarika, Bihu bad Goalparia",
  lus: "Dr. Bhupen Hazarika hla thlante, Bihu leh Goalparia hnam hla",
};

export default function PatientHome() {
  const t = useTranslations("patient");
  const locale = useLocale();
  const patient = useAuthStore((s) => s.patient);
  const patientId = patient?.id ?? 0;
  const { detail } = usePatientDetail();
  const widgets = useHyperCustomizationStore((s) => s.widgets);

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
    brx: { morning: "फुंनि गाहाम মोजां", afternoon: "सान्जुफानि মोजां", evening: "बेलासिनि মोजां" },
    grt: { morning: "Pringnam", afternoon: "Salgro nam", evening: "Attam nam" },
    kha: { morning: "Kumno mynstep", afternoon: "Kumno mynsngi", evening: "Kumno mynmiet" },
    lus: { morning: "Chibai zing", afternoon: "Chibai chhun", evening: "Chibai tlaial" },
  };

  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const timeGreeting =
    REGIONAL_TIME_GREETINGS[normLoc]?.[timeOfDay] ||
    REGIONAL_TIME_GREETINGS.en[timeOfDay];

  const localizedPatientName =
    (rawPatientName && LOCALIZED_NAMES[rawPatientName]?.[normLoc]) || rawPatientName || "Biren";
  const patientName = localizedPatientName;

  const greeting = patientName
    ? `${timeGreeting}, ${patientName}!`
    : `${timeGreeting}!`;

  const heroText = `${greeting} ${t("orientation")} ${t("heroPrompt")}`;
  const avatarPhoto = detail?.photoUrl
    ? getMediaUrl(detail.photoUrl)
    : "/sample-images/patient_1_biren_borah/patient_profile_photo_biren_borah.jpg";
  const avatarInitials = rawPatientName ? initialsFrom(rawPatientName) : "B";

  const rawJoyTriggers = detail?.joyTriggers?.trim();
  const joyTriggers = (rawJoyTriggers && (rawJoyTriggers.includes("Bihu") || rawJoyTriggers.includes("Bhupen Hazarika")))
    ? (LOCALIZED_JOY_TRIGGERS[normLoc] || rawJoyTriggers)
    : (rawJoyTriggers || t("wellbeing.calmFallbackTriggers"));

  const rawMusic = detail?.lifeStory?.favoriteMusic?.trim();
  const favoriteMusic = (rawMusic && rawMusic.includes("Bhupen Hazarika"))
    ? (LOCALIZED_FAVORITE_MUSIC[normLoc] || rawMusic)
    : rawMusic;

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
        const locName = LOCALIZED_NAMES[m.name]?.[normLoc] || m.name;
        const locNotes =
          LOCALIZED_FAMILY_NOTES[m.name]?.[normLoc] ||
          m.notes ||
          (normLoc === "hi"
            ? "प्रिय परिवारजन"
            : normLoc === "as"
            ? "মৰমৰ পৰিয়ালৰ সদস্য"
            : "Beloved family member");
        items.push({
          text: `${locName} (${locRel}): ${locNotes}`,
          photoUrl: m.photoUrl ?? null,
        });
      }
    } else {
      // Default localized memory across all 11 languages
      const defaultMemoryText =
        normLoc === "hi"
          ? "मानस बोरा (बेटा): बड़ा बेटा, गुवाहाटी में मैकेनिकल इंजीनियर। हर रविवार सुबह मिलने आते हैं।"
          : normLoc === "as"
          ? "মানস বৰা (পুত্ৰ): বৰ ল'ৰা, গুৱাহাটীত মেকানিকল ইঞ্জিনিয়াৰ। প্ৰতি দেওবাৰে পুৱা ঘৰলৈ আহে।"
          : normLoc === "bn"
          ? "মানস বোরা (ছেলে): বড় ছেলে, গুয়াহাটিতে মেকানিক্যাল ইঞ্জিনিয়ার। প্রতি রবিবার সকালে বাড়িতে আসে।"
          : normLoc === "mr"
          ? "मानस बोरा (मुलगा): मोठा मुलगा, गुवाहाटीमध्ये मेकॅनिकल इंजिनिअर. प्रत्येक रविवारी सकाळी भेटायला येतो."
          : normLoc === "ne"
          ? "मानस बोरा (छोरा): जेठो छोरा, गुवाहाटीमा मेकानिकल इन्जिनियर। प्रत्येक आइतबार बिहान भेट्न आउँछन्।"
          : normLoc === "mni"
          ? "মানস বোরা (মচা নুপা): অহানবা মচা নুপা, গুৱাহাটীদা মেকানিকল ইঞ্জিনিয়র। হপ্তা খুদিংগী নোংমাইজিংদা লাকই।"
          : normLoc === "brx"
          ? "मानस बरा (फिसा): गेदेर फिसा, गुवाहाटीआव मेकानिकेल इन्जिनियार। सानफ्रोमबो रबिबारनि फुंआव फैयो।"
          : normLoc === "grt"
          ? "Manash Borah (De·gipa): Dal·batgipa depante, Guwahati-o engineer. Robibar pringanti re·baenga."
          : normLoc === "kha"
          ? "Manash Borah (Khun): U khun rangbah, u mechanical engineer ha Guwahati. U wan jngoh man ka step sngi U Blei."
          : normLoc === "lus"
          ? "Manash Borah (Fapa): Fapa upa ber, Guwahati-ah mechanical engineer a ni. Pathianni zing tin a rawn tlawh thin."
          : "Manash Borah (Son): Eldest son, mechanical engineer in Guwahati. Visits every Sunday morning.";
      items.push({
        text: defaultMemoryText,
        photoUrl: null,
      });
    }
    if (detail.familiarPlaces) {
      for (const p of detail.familiarPlaces) {
        const locPlaceName = LOCALIZED_PLACES[p.name]?.name?.[normLoc] || p.name;
        const locPlaceDesc = LOCALIZED_PLACES[p.name]?.desc?.[normLoc] || p.description || "Cherished place";
        items.push({
          text: `${locPlaceName}: ${locPlaceDesc}`,
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

  const moodLabels: Record<MoodKey, string> = useMemo(
    () => ({
      peaceful: t("wellbeing.moodPeaceful"),
      okay: t("wellbeing.moodOkay"),
      caretaker: t("wellbeing.moodCare"),
    }),
    [t]
  );

  // Formatted date string memoized per locale
  const todayDateStr = useMemo(
    () =>
      new Date().toLocaleDateString(locale, {
        weekday: "long",
        day: "numeric",
        month: "short",
      }),
    [locale]
  );

  const setStudioOpen = useHyperCustomizationStore((s) => s.setStudioOpen);

  return (
    <div className="min-h-[100vh] pb-32 flex flex-col bg-canvas">
      {/* Patient Header Banner */}
      <div className="bg-tea border-b-4 border-black px-3.5 pt-5 pb-5 sm:px-6 md:px-8 text-white shadow-sm">
        <div className="max-w-3xl mx-auto flex flex-col gap-3.5 sm:gap-4">
          {/* Top Bar: Date & Theme Studio */}
          <div className="flex items-center justify-between gap-2">
            <span
              suppressHydrationWarning
              className="inline-flex items-center gap-1.5 sm:gap-2 bg-black/25 px-2.5 sm:px-3 py-1 rounded-xl border border-white/25 text-xs sm:text-sm font-black text-amber-300 min-w-0 truncate"
            >
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-400 shrink-0" />
              <span suppressHydrationWarning className="truncate">{todayDateStr}</span>
            </span>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  playTapFeedback();
                  setStudioOpen(true);
                }}
                className="inline-flex items-center gap-1.5 bg-black/25 hover:bg-black/35 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl border border-white/25 text-xs sm:text-sm font-bold text-amber-200 cursor-pointer active:scale-95"
                title="Theme & Display Settings"
              >
                <span>🎨</span>
                <span className="hidden xs:inline">Theme & Style</span>
                <span className="xs:hidden">Theme</span>
              </button>
            </div>
          </div>

          {/* Patient Portrait & Greeting */}
          <div className="flex items-center gap-3.5 sm:gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl border-3 border-black bg-surface overflow-hidden flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]">
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
                <span className="text-xl sm:text-2xl md:text-3xl font-black text-tea">
                  {avatarInitials || "P"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1
                suppressHydrationWarning
                className="font-serif font-black text-2xl sm:text-3xl md:text-4xl text-white leading-tight"
              >
                {greeting}
              </h1>
              <p className="text-white/90 text-xs sm:text-base font-bold mt-1 leading-snug">
                {t("orientation")}
              </p>
            </div>
          </div>

          {/* Action Row: Read For Me + Audio Toggle (Side-by-side on mobile) */}
          <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-3.5 pt-1">
            <button
              type="button"
              onClick={() => {
                playTapFeedback();
                unlockAudio();
                speak(heroText, locale || langCode, rate);
              }}
              className="btn-tactile flex w-full items-center justify-center gap-2 sm:gap-3 min-h-[46px] sm:min-h-[56px] rounded-xl sm:rounded-2xl border-3 border-border bg-surface px-2.5 sm:px-7 py-2 sm:py-3.5 text-xs sm:text-base md:text-lg font-black text-ink shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000] hover:bg-surface-muted cursor-pointer active:scale-95 transition-all"
            >
              <Volume2 className="h-5 w-5 sm:h-7 sm:w-7 text-tea shrink-0 stroke-[2.5]" />
              <span>{t("listen")}</span>
            </button>
            <div className="w-full sm:w-auto">
              <AudioToggle
                size="lg"
                className="w-full justify-center min-h-[46px] sm:min-h-[56px] !px-2.5 sm:!px-6 !py-2 sm:!py-3.5 !text-xs sm:!text-base md:!text-lg !rounded-xl sm:!rounded-2xl shadow-[3px_3px_0px_#000] sm:shadow-[4px_4px_0px_#000]"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6 flex-1 w-full">
        {/* 1. DAILY BRAIN ACTIVITIES & THERAPY SUITE */}
        {widgets.showQuickGamesGrid && (
          <TherapySuiteGrid gamesTitle={t("gamesTitle")} />
        )}

        {/* 2. TODAY'S ROUTINE & MEDICATION SCHEDULE */}
        {widgets.showRoutineSchedule && (
          <DailyRoutineSchedule langCode={langCode} rate={rate} />
        )}

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
                favoriteMusic={favoriteMusic}
                joyTriggers={joyTriggers}
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
                feedbackMessage={
                  lastMood && t.has(`wellbeing.moodFeedback.${lastMood}`)
                    ? t(`wellbeing.moodFeedback.${lastMood}`)
                    : undefined
                }
              />
            </div>
          </div>
        </section>

        {/* 4. SIMPLE MEAL SNAP & BRAIN NUTRITION SCORE */}
        {widgets.showDietTracker && (
          <PatientMealSnapCard patientName={patientName} />
        )}

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

      {memoryView && (
        <MemoryLightbox
          open={memoryView}
          onClose={() => setMemoryView(false)}
          photoUrl={memoryOfDay?.photoUrl}
          title={t("wellbeing.memoryTitle")}
          text={memoryOfDay?.text}
          langCode={langCode}
          rate={rate}
          closeLabel={t("audio.close")}
          listenLabel={t("listen")}
          speakingLabel={t("speaking")}
        />
      )}

      {/* Interactive Saathi Voice Companion */}
      {widgets.showVoiceCompanion && (
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
      )}
    </div>
  );
}
