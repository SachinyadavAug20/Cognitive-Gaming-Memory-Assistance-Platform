"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  ShieldCheck,
  Brain,
  Sparkles,
  Volume2,
  Calendar,
  Play,
  Footprints,
  Camera,
  Activity,
  UserCheck,
  MapPin,
  Clock,
  ArrowRight,
  X,
  Layers,
  CheckCircle2,
} from "lucide-react";
import dynamic from "next/dynamic";
import { DEMO_PATIENT_RECORD } from "@/data/demoPatient";
import { useAuthStore } from "@/store/useAuthStore";
import { speakText, unlockAudio } from "@/lib/sound";
import { GameLoading } from "@/components/games/GameState";
import { SaathiVoiceCompanion } from "@/components/patient-dashboard/SaathiVoiceCompanion";
import { DailyMoodTracker, type MoodKey } from "@/components/patient-dashboard/DailyMoodTracker";
import { VerifiedStampBadge } from "@/components/games/VerifiedStampBadge";
import {
  LOCALIZED_NAMES,
  LOCALIZED_RELATIONS,
  LOCALIZED_FAMILY_NOTES,
  LOCALIZED_PLACES,
  LOCALIZED_CATEGORIES,
  LOCALIZED_JOY_TRIGGERS,
} from "../page";

const DayInMyWorld3D = dynamic(
  () => import("@/components/games/DayInMyWorld3D").then((m) => m.DayInMyWorld3D),
  { loading: () => <GameLoading />, ssr: false }
);
const MajuliWalk3D = dynamic(
  () => import("@/components/games/MajuliWalk3D").then((m) => m.MajuliWalk3D),
  { loading: () => <GameLoading />, ssr: false }
);
const TeaHarvestVision = dynamic(
  () => import("@/components/games/TeaHarvestVision").then((m) => m.TeaHarvestVision),
  { loading: () => <GameLoading />, ssr: false }
);
const ArrowEscape = dynamic(
  () => import("@/components/games/ArrowEscape").then((m) => m.ArrowEscape),
  { loading: () => <GameLoading />, ssr: false }
);
const BihuDholBeats = dynamic(
  () => import("@/components/games/BihuDholBeats").then((m) => m.BihuDholBeats),
  { loading: () => <GameLoading />, ssr: false }
);

type ActiveModalGame =
  | "day-in-my-world"
  | "majuli-walk"
  | "tea-harvest-vision"
  | "arrow-escape"
  | "bihu-dhol"
  | null;


const DEMO_I18N: Record<string, {
  evalMode: string;
  sessionActive: string;
  preloaded: string;
  standardView: string;
  gamesHub: string;
  patientNum: string;
  mildMemory: string;
  bilingual: string;
  ageJob: string;
  caregiverLabel: string;
  listenGuide: string;
  joyTriggers: string;
  culturalNarrative: string;
  flagshipBadge: string;
  flagshipTitle: string;
  flagshipDesc: string;
  launchStory: string;
  familyPhotosTitle: string;
  familyPhotosDesc: string;
  openPhotos: string;
  featuredGamesTitle: string;
  viewAllGames: string;
  play3D: string;
  playVision: string;
  playDrum: string;
  closeGame: string;
  familiarFacesTitle: string;
  relativesCount: string;
  familiarPlacesTitle: string;
  placesSub: string;
  tapToHear: string;
  routineTitle: string;
  routineCompleted: string;
  routineActivity1: string;
  routineActivity2: string;
  routineActivity3: string;
  routineActivity4: string;
  moodTitle: string;
  moodThanks: string;
  moodPeaceful: string;
  moodSteady: string;
  moodHelp: string;
}> = {
  as: {
    evalMode: "মূল্যায়ন আৰু জুৰী ডেমো ম'ড",
    sessionActive: "সক্ৰিয় অধিবেশন (১০০% অফলাইন-সুৰক্ষিত)",
    preloaded: "বীৰেন বৰাৰ সৈতে প্ৰি-লোড কৰা হৈছে (৭২ বছৰ • মৃদু স্মৃতি সহায় • শিলপুখুৰী, গুৱাহাটী)",
    standardView: "সাধাৰণ দিনচৰ্যা দৃশ্য",
    gamesHub: "সম্পূৰ্ণ ২৫+ খেল হাব",
    patientNum: "ৰোগী #১০১",
    mildMemory: "মৃদু স্মৃতি সহায়",
    bilingual: "বহুভাষিক: অসমীয়া / ইংৰাজী / হিন্দী",
    ageJob: "৭২ বছৰীয়া • শিলপুখুৰী, গুৱাহাটীৰ বাসিন্দা • অৱসৰপ্ৰাপ্ত অসম কৃষি বিষয়া",
    caregiverLabel: "যত্নকৰ্তা: পুত্ৰ মানস বৰা (+৯১ ৯৮৬৪০ ১২৩৪৫)",
    listenGuide: "পৰিচিতি শুনক",
    joyTriggers: "ব্যক্তিগত আনন্দৰ স্মৃতি:",
    culturalNarrative: "সাংস্কৃতিক পটভূমি:",
    flagshipBadge: "পাৰস্পৰিক গল্প • সাথী ভয়েচ সংগী",
    flagshipTitle: "মোৰ পৃথিৱীত এটা দিন",
    flagshipDesc: "সাথী এআই সংগীৰ সৈতে অসমৰ গাঁৱৰ এটা শান্ত পুৱাৰ মাজেৰে ৬-অধ্যায়ৰ ৩ডি গল্প যাত্ৰা।",
    launchStory: "৩ডি গল্প আৰম্ভ কৰক",
    familyPhotosTitle: "পৰিয়ালৰ ফটো আৰু শান্ত সুৰ",
    familyPhotosDesc: "পৰিয়ালৰ ফটো চাওক আৰু বৰষুণ, চৰাই, নামঘৰৰ ডবা আৰু ঘৰৰ মৰমৰ মাত শুনক।",
    openPhotos: "ফটো আৰু সুৰ খোলক",
    featuredGamesTitle: "দৈনিক বিশেষ মগজুৰ খেল",
    viewAllGames: "সকলো ২৫+ খেল চাওক",
    play3D: "৩ডি খেলক",
    playVision: "ভিজন খেলক",
    playDrum: "ঢোল বজাওক",
    closeGame: "খেল বন্ধ কৰক",
    familiarFacesTitle: "পৰিচিত মুখ আৰু পৰিয়াল চক্ৰ",
    relativesCount: "৫ জন পৰিয়ালৰ সদস্য",
    familiarPlacesTitle: "পৰিচিত সাংস্কৃতিক স্থানসমূহ",
    placesSub: "শিলপুখুৰী আৰু গুৱাহাটীৰ স্মৃতি",
    tapToHear: "স্মৃতি শুনিবলৈ টিপক",
    routineTitle: "বীৰেন বৰাৰ দৈনিক দিনচৰ্যা",
    routineCompleted: "আজি ৪ টাৰ ৩ টা কাৰ্য্যসূচী সম্পূৰ্ণ",
    routineActivity1: "তাজা চিটিচি চাহ আৰু চোতালত শান্ত খোজ",
    routineActivity2: "বিহু ঢোলৰ তাল আৰু শ্ৰৱণ-চালক সমন্বয়",
    routineActivity3: "মাজুলী ৩ডি স্থানিক খোজ আৰু নদীৰ স্মৃতি",
    routineActivity4: "নামঘৰৰ সন্ধিয়াৰ ঘোষা আৰু নাতি-নাতিনীৰ সৈতে ফোন",
    moodTitle: "আজি পুৱা বীৰেন বৰাৰ কেনে লাগিছে?",
    moodThanks: "ধন্যবাদ, বীৰেন-দা। আপোনাৰ পৰিয়াল আৰু চিকিৎসকে আপোনাৰ স্থিতি চাব পাৰে।",
    moodPeaceful: "শান্ত",
    moodSteady: "স্থিৰ",
    moodHelp: "সহায় লাগে"
  },
  hi: {
    evalMode: "मूल्यांकन एवं जूरी डेमो मोड",
    sessionActive: "सत्र सक्रिय (100% ऑफलाइन-सुरक्षित)",
    preloaded: "बीरेन बोरा के साथ प्री-लोडेड (72 वर्ष • माइल्ड मेमोरी सपोर्ट • सिलपुखुरी, गुवाहाटी)",
    standardView: "मानक दिनचर्या दृश्य",
    gamesHub: "संपूर्ण 25+ खेल हब",
    patientNum: "मरीज़ #101",
    mildMemory: "माइल्ड मेमोरी सपोर्ट",
    bilingual: "द्विभाषी: असमी / अंग्रेज़ी / हिंदी",
    ageJob: "72 वर्ष • सिलपुखुरी, गुवाहाटी निवासी • सेवानिवृत्त असम कृषि अधिकारी",
    caregiverLabel: "देखभालकर्ता: पुत्र मानस बोरा (+91 98640 12345)",
    listenGuide: "परिचय सुनें",
    joyTriggers: "व्यक्तिगत आनंद स्मृतियाँ:",
    culturalNarrative: "सांस्कृतिक पृष्ठभूमि:",
    flagshipBadge: "संवादात्मक कहानी • साथी आवाज़ साथी",
    flagshipTitle: "मेरी दुनिया में एक दिन",
    flagshipDesc: "साथी एआई संग असमिया गाँव की शांत सुबह का 6-अध्यायों का 3डी कहानी सफर।",
    launchStory: "3डी कहानी शुरू करें",
    familyPhotosTitle: "पारिवारिक तस्वीरें और शांत ध्वनियाँ",
    familyPhotosDesc: "पारिवारिक तस्वीरें देखें और बारिश, पक्षियों, मंदिर की घंटियों और घर की आवाज़ें सुनें।",
    openPhotos: "तस्वीरें व ध्वनियाँ खोलें",
    featuredGamesTitle: "दैनिक विशेष दिमागी खेल",
    viewAllGames: "सभी 25+ खेल देखें",
    play3D: "3डी खेलें",
    playVision: "विज़न खेलें",
    playDrum: "ढोल बजाएं",
    closeGame: "खेल बंद करें",
    familiarFacesTitle: "परिचित चेहरे और परिवार",
    relativesCount: "5 पारिवारिक सदस्य",
    familiarPlacesTitle: "परिचित सांस्कृतिक स्थल",
    placesSub: "सिलपुखुरी एवं गुवाहाटी की यादें",
    tapToHear: "स्मृति सुनने के लिए टैप करें",
    routineTitle: "बीरेन बोरा की दैनिक दिनचर्या",
    routineCompleted: "आज 4 में से 3 गतिविधियाँ पूर्ण",
    routineActivity1: "ताज़ा सीटीसी चाय और आंगन में हल्की सैर",
    routineActivity2: "बिहू ढोल ताल और श्रवण-चालक समन्वय",
    routineActivity3: "माजुली 3डी स्थानिक सैर और नदी की यादें",
    routineActivity4: "नामघर संध्या प्रार्थना और पोते-पोतियों से बातचीत",
    moodTitle: "आज सुबह बीरेन कैसा महसूस कर रहे हैं?",
    moodThanks: "धन्यवाद, बीरेन-दा। आपका परिवार और देखभाल टीम आपकी स्थिति देख सकते हैं।",
    moodPeaceful: "शांत",
    moodSteady: "स्थिर",
    moodHelp: "मदद चाहिए"
  },
  en: {
    evalMode: "Evaluation & Jury Demo Mode",
    sessionActive: "Session Active (100% Offline-Safe)",
    preloaded: "Pre-loaded with Biren Borah (72y • Mild Cognitive Support • Guwahati)",
    standardView: "Standard Routine View",
    gamesHub: "Full 25+ Games Hub",
    patientNum: "Patient #101",
    mildMemory: "Mild Cognitive Support",
    bilingual: "Multilingual: Assamese / English / Hindi",
    ageJob: "72 years old • Resident of Silpukhuri, Guwahati • Retired Assam Agriculture Officer",
    caregiverLabel: "Caregiver: Son Manash Borah (+91 98640 12345)",
    listenGuide: "Listen Guide",
    joyTriggers: "Personal Joy Triggers:",
    culturalNarrative: "Cultural Narrative:",
    flagshipBadge: "Interactive Story • Saathi Companion",
    flagshipTitle: "A Day in My World",
    flagshipDesc: "A 6-chapter 3D sensory story journey through an Assamese village morning with Saathi AI companion.",
    launchStory: "Launch 3D Story",
    familyPhotosTitle: "Family Photos & Peaceful Sounds",
    familyPhotosDesc: "View family photographs and listen to rain, birds, namghar bells, and warm voices from home.",
    openPhotos: "Open Photos & Sounds",
    featuredGamesTitle: "Featured Daily Brain Games",
    viewAllGames: "View All 25+ Games",
    play3D: "Play 3D",
    playVision: "Play Vision",
    playDrum: "Play Drum",
    closeGame: "Close Game",
    familiarFacesTitle: "Familiar Faces & Family Network",
    relativesCount: "5 Calibrated Relatives",
    familiarPlacesTitle: "Familiar Cultural Landmarks",
    placesSub: "Silpukhuri & Guwahati Memory Anchors",
    tapToHear: "Tap to hear memory",
    routineTitle: "Biren's Daily Routine Schedule",
    routineCompleted: "3 of 4 Activities Completed Today",
    routineActivity1: "Fresh CTC Morning Tea & Light Courtyard Stroll",
    routineActivity2: "Bihu Dhol Beats & Auditory-Motor Entrainment",
    routineActivity3: "Majuli 3D Spatial Walk & River Remembrance",
    routineActivity4: "Namghar Evening Hymns & Grandchild Video Call",
    moodTitle: "How is Biren feeling this morning?",
    moodThanks: "Thank you, Biren-da. Your family and care team can see your wellbeing status.",
    moodPeaceful: "Peaceful",
    moodSteady: "Steady",
    moodHelp: "Need Help"
  },
  bn: {
    evalMode: "মূল্যায়ন ও জুরি ডেমো মোড",
    sessionActive: "সক্রিয় সেশন (১০০% অফলাইন-নিরাপদ)",
    preloaded: "বীরেন বরার সাথে প্রি-লোডেড (৭২ বছর • মৃদু স্মৃতি সহায়তা • শিলপুখুরী, গুয়াহাটি)",
    standardView: "সাধারণ রুটিন দৃশ্য",
    gamesHub: "সম্পূর্ণ ২৫+ গেমস হাব",
    patientNum: "রোগী #১০১",
    mildMemory: "মৃদু স্মৃতি সহায়তা",
    bilingual: "বহুভাষিক: অসমীয়া / ইংরেজি / বাংলা",
    ageJob: "৭২ বছর বয়সী • শিলপুখুরী, গুয়াহাটির বাসিন্দা • অবসরপ্রাপ্ত অসম কৃষি কর্মকর্তা",
    caregiverLabel: "সেবাকারী: পুত্র মানস বরা (+৯১ ৯৮৬৪০ ১২৩৪৫)",
    listenGuide: "পরিচিতি শুনুন",
    joyTriggers: "ব্যক্তিগত আনন্দের স্মৃতি:",
    culturalNarrative: "সাংস্কৃতিক পটভূমি:",
    flagshipBadge: "ইন্টারেক্টিভ গল্প • সাথী ভয়েস সঙ্গী",
    flagshipTitle: "আমার পৃথিবীতে একটি দিন",
    flagshipDesc: "সাথী এআই সঙ্গীর সাথে আসামের গ্রামের একটি শান্ত সকালের মধ্য দিয়ে ৬-অধ্যায়ের ৩ডি গল্প যাত্রা।",
    launchStory: "৩ডি গল্প শুরু করুন",
    familyPhotosTitle: "পারিবারিক ছবি ও শান্ত সুর",
    familyPhotosDesc: "পারিবারিক ছবি দেখুন এবং বৃষ্টি, পাখি, মন্দিরের ঘণ্টা ও বাড়ির ভালোবাসার কণ্ঠ শুনুন।",
    openPhotos: "ছবি ও সুর খুলুন",
    featuredGamesTitle: "দৈনিক বিশেষ মস্তিষ্কের খেলা",
    viewAllGames: "সমস্ত ২৫+ খেলা দেখুন",
    play3D: "৩ডি খেলুন",
    playVision: "ভিশন খেলুন",
    playDrum: "ঢোল বাজান",
    closeGame: "খেলা বন্ধ করুন",
    familiarFacesTitle: "পরিচিত মুখ ও পরিবার মণ্ডল",
    relativesCount: "৫ জন পারিবারিক সদস্য",
    familiarPlacesTitle: "পরিচিত সাংস্কৃতিক স্থান",
    placesSub: "শিলপুখুরী ও গুয়াহাটির স্মৃতি",
    tapToHear: "স্মৃতি শুনতে চাপ দিন",
    routineTitle: "বীরেন বরার দৈনিক রুটিন সময়সূচী",
    routineCompleted: "আজ ৪টির মধ্যে ৩টি কার্যকলাপ সম্পন্ন",
    routineActivity1: "তাজা সিটিসি চা ও উঠোনে শান্ত পদচারণা",
    routineActivity2: "বিহু ঢোলের তাল ও শ্রবণ-চালক সমন্বয়",
    routineActivity3: "মাজুলি ৩ডি স্থানিক হাঁটা ও নদীর স্মৃতি",
    routineActivity4: "নামঘরের সান্ধ্য প্রার্থনা ও নাতি-নাতনির সাথে কল",
    moodTitle: "আজ সকালে বীরেন কেমন অনুভব করছেন?",
    moodThanks: "ধন্যবাদ, বীরেন-দা। আপনার পরিবার ও চিকিৎসক আপনার অবস্থা দেখতে পাচ্ছেন।",
    moodPeaceful: "শান্ত",
    moodSteady: "স্থির",
    moodHelp: "সাহায্য চাই"
  },
  mr: {
    evalMode: "मूल्यांकन व ज्युरी डेमो मोड",
    sessionActive: "सत्र सक्रिय (100% ऑफलाइन-सुरक्षित)",
    preloaded: "बिरेन बोरा यांच्यासह प्री-लोड केलेले (72 वर्षे • सौम्य स्मृती साहाय्य • सिलपुखुरी, गुवाहाटी)",
    standardView: "मानक दिनचर्या दृश्य",
    gamesHub: "संपूर्ण 25+ खेळ केंद्र",
    patientNum: "रुग्ण #101",
    mildMemory: "सौम्य स्मृती साहाय्य",
    bilingual: "द्विभाषिक: असमी / इंग्रजी / हिंदी",
    ageJob: "72 वर्षे • सिलपुखुरी, गुवाहाटी रहिवासी • निवृत्त कृषी अधिकारी",
    caregiverLabel: "काळजीवाहक: मुलगा मानस बोरा (+91 98640 12345)",
    listenGuide: "परिचय ऐका",
    joyTriggers: "वैयक्तिक आनंददायी स्मृती:",
    culturalNarrative: "सांस्कृतिक पार्श्वभूमी:",
    flagshipBadge: "परस्परसंवादी कथा • साथी आवाज साथीदार",
    flagshipTitle: "माझ्या विश्वातील एक दिवस",
    flagshipDesc: "साथी एआय सह आसामच्या खेड्यातील शांत सकाळचा 6-प्रकरणांचा 3D कथा प्रवास.",
    launchStory: "3D कथा सुरू करा",
    familyPhotosTitle: "कौटुंबिक छायाचित्रे व शांत ध्वनी",
    familyPhotosDesc: "कौटुंबिक छायाचित्रे पहा आणि पाऊस, पक्षी, घंटा व आपुलकीचे आवाज ऐका.",
    openPhotos: "छायाचित्रे व ध्वनी उघडा",
    featuredGamesTitle: "दैनिक विशेष मेंदूचे खेळ",
    viewAllGames: "सर्व 25+ खेळ पहा",
    play3D: "3D खेळा",
    playVision: "व्हिजन खेळा",
    playDrum: "ढोल वाजवा",
    closeGame: "खेळ बंद करा",
    familiarFacesTitle: "परिचित चेहरे व नातेवाईक",
    relativesCount: "5 कौटुंबिक नातेवाईक",
    familiarPlacesTitle: "परिचित सांस्कृतिक स्थळे",
    placesSub: "सिलपुखुरी व गुवाहाटी स्मृती",
    tapToHear: "स्मृती ऐकण्यासाठी टॅप करा",
    routineTitle: "बिरेन यांचे दैनंदिन वेळापत्रक",
    routineCompleted: "आज 4 पैकी 3 कृती पूर्ण",
    routineActivity1: "ताजी सीटीसी चहा व अंगणात फेरफटका",
    routineActivity2: "बिहू ढोल ताल आणि श्रवण-चालक समन्वय",
    routineActivity3: "माजुली 3D स्थानिक चालणे व नदी स्मृती",
    routineActivity4: "संध्याकाळची प्रार्थना व नातवंडांशी संवाद",
    moodTitle: "आज सकाळी बिरेन यांना कसे वाटत आहे?",
    moodThanks: "धन्यवाद, बिरेन-दा. तुमचे कुटुंब व वैद्यकीय पथक तुमची स्थिती पाहू शकतात.",
    moodPeaceful: "शांत",
    moodSteady: "स्थिर",
    moodHelp: "मदत हवी"
  },
  ne: {
    evalMode: "मूल्याङ्कन तथा जुरी डेमो मोड",
    sessionActive: "सत्र सक्रिय (१००% अफलाइन-सुरक्षित)",
    preloaded: "बिरेन बोरासँग पूर्व-लोड गरिएको (७२ वर्ष • हल्का स्मृति सहयोग • सिलपुखुरी, गुवाहाटी)",
    standardView: "मानक तालिका दृश्य",
    gamesHub: "सम्पूर्ण २५+ खेल केन्द्र",
    patientNum: "बिरामी #१०१",
    mildMemory: "हल्का स्मृति सहयोग",
    bilingual: "द्विभाषिक: असमी / अंग्रेजी / नेपाली",
    ageJob: "७२ वर्ष • सिलपुखुरी, गुवाहाटी निवासी • सेवानिवृत्त कृषि अधिकृत",
    caregiverLabel: "हेरचाहकर्ता: छोरा मानस बोरा (+९१ ९८६४० १२३४५)",
    listenGuide: "परिचय सुन्नुहोस्",
    joyTriggers: "व्यक्तिगत आनन्दका सम्झनाहरू:",
    culturalNarrative: "सांस्कृतिक पृष्ठभूमि:",
    flagshipBadge: "अन्तरक्रियात्मक कथा • साथी आवाज साथी",
    flagshipTitle: "मेरो संसारमा एक दिन",
    flagshipDesc: "साथी एआईसँग असमको गाउँको शान्त बिहानीको ६-अध्यायको ३डी कथा यात्रा।",
    launchStory: "३डी कथा सुरु गर्नुहोस्",
    familyPhotosTitle: "पारिवारिक तस्बिरहरू र शान्त धुनहरू",
    familyPhotosDesc: "पारिवारिक तस्बिरहरू हेर्नुहोस् र वर्षा, चरा, मन्दिरको घन्टी र मायालु आवाजहरू सुन्नुहोस्।",
    openPhotos: "तस्बिर र धुन खोल्नुहोस्",
    featuredGamesTitle: "दैनिक विशेष मस्तिष्क खेलहरू",
    viewAllGames: "सबै २५+ खेलहरू हेर्नुहोस्",
    play3D: "३डी खेल्नुहोस्",
    playVision: "भिजन खेल्नुहोस्",
    playDrum: "ढोल बजाउनुहोस्",
    closeGame: "खेल बन्द गर्नुहोस्",
    familiarFacesTitle: "परिचित मुहारहरू र परिवार",
    relativesCount: "५ पारिवारिक सदस्यहरू",
    familiarPlacesTitle: "परिचित सांस्कृतिक स्थलहरू",
    placesSub: "सिलपुखुरी र गुवाहाटीका सम्झनाहरू",
    tapToHear: "सम्झना सुन्न छुनुहोस्",
    routineTitle: "बिरेनको दैनिक कार्यतालिका",
    routineCompleted: "आज ४ मध्ये ३ गतिविधिहरू सम्पन्न",
    routineActivity1: "तातो सिटिसी चिया र आँगनमा बिहानी हिँडाइ",
    routineActivity2: "बिहु ढोल ताल र श्रवण-चालक समन्वय",
    routineActivity3: "माजुली ३डी स्थानिक हिँडाइ र नदीको सम्झना",
    routineActivity4: "नामघरको साँझको प्रार्थना र नातिनातिनासँग कुराकानी",
    moodTitle: "आज बिहान बिरेनलाई कस्तो महसुस भइरहेको छ?",
    moodThanks: "धन्यवाद, बिरेन-दा। तपाईंको परिवार र हेरचाह टोलीले तपाईंको अवस्था देख्न सक्छन्।",
    moodPeaceful: "शान्त",
    moodSteady: "स्थिर",
    moodHelp: "मद्दत चाहिन्छ"
  },
  mni: {
    evalMode: "ইভাল্যুএসন অমসুং জুরী দেমো মোদ",
    sessionActive: "সেসন চত্থরি (১০০% অফলাইন-সেফ)",
    preloaded: "বীরেন বরাগা লোয়ননা প্রি-লোদ তৌরে (৭২ চহী • মাইল্দ মেমোরি সপোর্ত • শিলপুখুরী, গুৱাহাটী)",
    standardView: "রুতিন ভ্যু",
    gamesHub: "২৫+ শান্নপোৎ হাব",
    patientNum: "অনাবা #১০১",
    mildMemory: "মাইল্দ মেমোরি সপোর্ত",
    bilingual: "অসমীয়া / ইংলিশ / মৈতৈ",
    ageJob: "৭২ চহী • শিলপুখুরী, গুৱাহাটীগী মীওই • পোথারবা এগ্রিকলচর ওফিসার",
    caregiverLabel: "য়োকখৎপীবা: ইবুংঙো মানস বরা (+৯১ ৯৮৬৪০ ১২৩৪৫)",
    listenGuide: "পারিচিতি তারো",
    joyTriggers: "নুংঙাইবা নিংশিংবা:",
    culturalNarrative: "সংস্কৃতিগী ৱাফম:",
    flagshipBadge: "ৱারী • সাথী খোন্থোক মরুপ",
    flagshipTitle: "ঐগী পুন্সিগী নুমিৎ অমা",
    flagshipDesc: "সাথী এআইগা লোয়ননা অহৌবদগী অরোইবা ফাওবা ৩ডি ৱারী খোঙচৎ।",
    launchStory: "৩ডি ৱারী হৌরো",
    familyPhotosTitle: "ইমুংগী ফোতো অমসুং শান্তিগী সুর",
    familyPhotosDesc: "ইমুংগী ফোতো য়েংউ অমসুং নোংচুবা, উচেক, লাইশং ঘন্তা তারো।",
    openPhotos: "ফোতো অমসুং সুর হাংদোকউ",
    featuredGamesTitle: "অখন্নবা ৱাখলগী শান্নপোৎ",
    viewAllGames: "২৫+ শান্নপোৎ য়েংউ",
    play3D: "৩ডি শান্নৌ",
    playVision: "ভিজন শান্নৌ",
    playDrum: "ঢোল বাজাও",
    closeGame: "শান্নপোৎ থিংশিল্লু",
    familiarFacesTitle: "খঙনবা মশকশিং অমসুং ইমুং",
    relativesCount: "মীওই ৫",
    familiarPlacesTitle: "খঙনবা মফমশিং",
    placesSub: "শিলপুখুরী অমসুং গুৱাহাটী",
    tapToHear: "নিংশিংবা তানবা নম্মু",
    routineTitle: "বীরেনগী নুমিৎ খুদিংগী রুতিন",
    routineCompleted: "ঙসি ৪ গী মনুংদা ৩ লোইরে",
    routineActivity1: "অয়ুক্কী চা অমসুং খোঙচৎ",
    routineActivity2: "বিহু ঢোল তান্নবা",
    routineActivity3: "মাজুলি ৩ডি চৎপা",
    routineActivity4: "লাইশং অমসুং ৱারী শাবা",
    moodTitle: "ঙসি অয়ুক বীরেনদা করম তৌরি?",
    moodThanks: "থাগৎচরি, বীরেন-দা। ইমুংনা নহাকপু য়েংশিনগনি।",
    moodPeaceful: "শান্তি",
    moodSteady: "স্থির",
    moodHelp: "মতেং পাম্মি"
  },
  brx: {
    evalMode: "जुरि देमो म'द",
    sessionActive: "सेसन सोलिगासिनो दं (१००% अफलाइन-रैखा)",
    preloaded: "बिरेन बरा जों प्रिल'द (७२ बोसोर • गोसोखांथि हेफाजात • सिलपुखुरी, गुवाहाटी)",
    standardView: "फारिलाइ नुथाय",
    gamesHub: "गासै २५+ गेलेनाय",
    patientNum: "बेमारि #१०१",
    mildMemory: "हल्का गोसोखांथि",
    bilingual: "बर' / इंराजि / हिन्दी",
    ageJob: "७२ बोसोर • सिलपुखुरी, गुवाहाटीनि • अबसरप्राप्त कृषि बिफान",
    caregiverLabel: "सामलायग्रा: मानस बरा (+९१ ९८६४० १२३४५)",
    listenGuide: "सिनायथि खोनासं",
    joyTriggers: "मोजां मोन्नाय गोसोखांथि:",
    culturalNarrative: "हारिमुनि सल':",
    flagshipBadge: "सल' • साथी राव लोगो",
    flagshipTitle: "आंनि मुलुगआव मोनसे सान",
    flagshipDesc: "साथी एआई जों गामिनि मोजां फुंनि ३डी सल' दावबायनाय।",
    launchStory: "३डी सल' जागाय",
    familyPhotosTitle: "नख'रनि फथ' आरो गोजोन रिंखांनाय",
    familyPhotosDesc: "नख'रनि फथ' नाय आरो अखा, दाव, घण्टी आरो न'नि मोजां राव खोनासं।",
    openPhotos: "फथ' आरो रिंखांनाय खुलि",
    featuredGamesTitle: "सानफ्रोमबोनि गोसो गेलेनाय",
    viewAllGames: "गासै २५+ गेलेनाय नाय",
    play3D: "३डी गेले",
    playVision: "भिजन गेले",
    playDrum: "दाम गेले",
    closeGame: "गेलेनाय फजोब",
    familiarFacesTitle: "सिनायथि महर आरो नख'र",
    relativesCount: "५ सा सुबुं",
    familiarPlacesTitle: "सिनायथि जायगाफोर",
    placesSub: "सिलपुखुरी आरो गुवाहाटी",
    tapToHear: "खोनासंनो सु",
    routineTitle: "बिरेन्नि सानफ्रोमबोनि फारिलाइ",
    routineCompleted: "दिनै ४ नि ३ टा हाबा जाबाय",
    routineActivity1: "फुंनि गुदुं साहा आरो थाबायनाय",
    routineActivity2: "बिहु ढोलनि ताल गेलेनाय",
    routineActivity3: "माजुलि ३डी थाबायनाय",
    routineActivity4: "फुजानि प्रार्थना आरो नाथिजों रायज्लायनाय",
    moodTitle: "दिनै फुङाव बिरेना माबोरै मोन्दों?",
    moodThanks: "गोजोन्थों, बिरेन-दा। नख'रा नोंथांखौ नायनो हागोन।",
    moodPeaceful: "गोजोन",
    moodSteady: "थि",
    moodHelp: "हेफाजात नांगौ"
  },
  grt: {
    evalMode: "Jury Demo Mode",
    sessionActive: "Session Active (100% Offline-Safe)",
    preloaded: "Pre-loaded Biren Borah (72y • Mild Cognitive Support • Guwahati)",
    standardView: "Routine View",
    gamesHub: "25+ Games Hub",
    patientNum: "Sa·gipa #101",
    mildMemory: "Mild Memory",
    bilingual: "A·chik / English / Hindi",
    ageJob: "Bilsi 72 • Silpukhuri, Guwahati • Retired Agri Officer",
    caregiverLabel: "Naljokgipa: Manash Borah (+91 98640 12345)",
    listenGuide: "Knatimatbo",
    joyTriggers: "Kusi Gisik Ra·anirang:",
    culturalNarrative: "Dakbewal Golpo:",
    flagshipBadge: "Interactive Story • Saathi Companion",
    flagshipTitle: "Angni A·song Sal",
    flagshipDesc: "Saathi AI baksa 3D golpo re·ani.",
    launchStory: "3D Golpo A·bachengbo",
    familyPhotosTitle: "Nokdang Photo & Tom·toma Git",
    familyPhotosDesc: "Nokdang photoko nibo aro mikka, do·o, ghanti knatimatbo.",
    openPhotos: "Photo & Git Pliebo",
    featuredGamesTitle: "Salanti Gisik Kal·ani",
    viewAllGames: "25+ Kal·aniko Nibo",
    play3D: "3D Kal·bo",
    playVision: "Vision Kal·bo",
    playDrum: "Dama Dokbo",
    closeGame: "Chipbo",
    familiarFacesTitle: "Nokdang & Ripeng",
    relativesCount: "Mande 5",
    familiarPlacesTitle: "U·igimin Biaprang",
    placesSub: "Silpukhuri & Guwahati",
    tapToHear: "Knana krakbo",
    routineTitle: "Biren-ni Salanti Kam",
    routineCompleted: "Da·al 4-oni 3 matchotaha",
    routineActivity1: "Pringni cha ringani & re·ama",
    routineActivity2: "Bihu dama dokani",
    routineActivity3: "Majuli 3D re·ama",
    routineActivity4: "Attam bi·ani & su·gipa baksa agangrikbo",
    moodTitle: "Da·al pring Biren maika·e an·sengenga?",
    moodThanks: "Mittan, Biren-da. Nokdang aro doctor nang·ko nigen.",
    moodPeaceful: "Tom·toma",
    moodSteady: "Namgipa",
    moodHelp: "Dakchakna nanga"
  },
  kha: {
    evalMode: "Jury Demo Mode",
    sessionActive: "Session Active (100% Offline-Safe)",
    preloaded: "Pre-loaded Biren Borah (72y • Mild Cognitive Support • Guwahati)",
    standardView: "Routine View",
    gamesHub: "25+ Games Hub",
    patientNum: "Nongpang #101",
    mildMemory: "Mild Memory",
    bilingual: "Khasi / English / Hindi",
    ageJob: "72 Snem • Silpukhuri, Guwahati • Retired Agri Officer",
    caregiverLabel: "Nongri: Manash Borah (+91 98640 12345)",
    listenGuide: "Sngap ia ka jingtip",
    joyTriggers: "Jingkynmaw ba kmen:",
    culturalNarrative: "Parom tynrai:",
    flagshipBadge: "Interactive Story • Saathi Companion",
    flagshipTitle: "Kawei ka Sngi ha ka Pyrthei Jong Nga",
    flagshipDesc: "Ka jingiaid 3D story bad i Saathi AI companion.",
    launchStory: "Sdang 3D Story",
    familyPhotosTitle: "Dur Ba Haiing & Sur Jingsuk",
    familyPhotosDesc: "Peit dur ba haiing bad sngap slap, sim, shakuriaw bad jingieit.",
    openPhotos: "Plie Dur & Sur",
    featuredGamesTitle: "Jingialehkai Jingmut",
    viewAllGames: "Peit Lut 25+ Games",
    play3D: "Ialehkai 3D",
    playVision: "Ialehkai Vision",
    playDrum: "Tem Ksing",
    closeGame: "Khang",
    familiarFacesTitle: "Ki Khmat Ba Haiing",
    relativesCount: "5 Ngut",
    familiarPlacesTitle: "Ki Jaka Tynrai",
    placesSub: "Silpukhuri & Guwahati",
    tapToHear: "Thab ban sngap",
    routineTitle: "Ka Jingpynbeit Kam u Biren",
    routineCompleted: "4 na 3 tylli la dep mynta",
    routineActivity1: "Dih sha saw step & iaid kai",
    routineActivity2: "Bihu dhol drum",
    routineActivity3: "Majuli 3D iaid kai",
    routineActivity4: "Jingduwai janmiet & iakren bad ki khun ksiew",
    moodTitle: "Kumno i Biren i sngew mynta ka step?",
    moodThanks: "Khublei, Biren-da. Ka iing bad ki doctor kin peit ia phi.",
    moodPeaceful: "Jingsuk",
    moodSteady: "Biang",
    moodHelp: "Donkam jingiarap"
  },
  lus: {
    evalMode: "Jury Demo Mode",
    sessionActive: "Session Active (100% Offline-Safe)",
    preloaded: "Pre-loaded Biren Borah (72y • Mild Cognitive Support • Guwahati)",
    standardView: "Routine View",
    gamesHub: "25+ Games Hub",
    patientNum: "Damlo #101",
    mildMemory: "Mild Memory",
    bilingual: "Mizo / English / Hindi",
    ageJob: "Kum 72 • Silpukhuri, Guwahati • Retired Agri Officer",
    caregiverLabel: "Enkawltu: Manash Borah (+91 98640 12345)",
    listenGuide: "Ngaithla rawh",
    joyTriggers: "Hriat Rengna Hlimawm:",
    culturalNarrative: "Nunphung Chanchin:",
    flagshipBadge: "Interactive Story • Saathi Companion",
    flagshipTitle: "Ka Khawvela Ni Khat",
    flagshipDesc: "Saathi AI nen 3D story zin kawng zawhna.",
    launchStory: "3D Story Tan Rawh",
    familyPhotosTitle: "Chhungkaw Thlalak & Thlamuanna Aw",
    familyPhotosDesc: "Chhungkaw thlalak en la, ruah sur, sava hram, dar ri ngaithla rawh.",
    openPhotos: "Thlalak & Rimawi Hawng Rawh",
    featuredGamesTitle: "Ni Tin Hriatna Game-te",
    viewAllGames: "25+ Game En Vevek Rawh",
    play3D: "3D Khel Rawh",
    playVision: "Vision Khel Rawh",
    playDrum: "Khuang Tum Rawh",
    closeGame: "Khar Rawh",
    familiarFacesTitle: "Hmel Hriatte & Chhungte",
    relativesCount: "Chhungte 5",
    familiarPlacesTitle: "Hmun Hriat Larte",
    placesSub: "Silpukhuri & Guwahati",
    tapToHear: "Ngaihthlak nan hmet rawh",
    routineTitle: "Biren-a Ni Tin Hun Ruahman",
    routineCompleted: "Tih tur 4 zinga 3 zo tawh",
    routineActivity1: "Zing thingpui sen in & kawtlaia len harh",
    routineActivity2: "Bihu khuang tum & hriatna tihchak",
    routineActivity3: "Majuli 3D len harh & luipui hriat rengna",
    routineActivity4: "Tlai tawngtai & tu leh fate biak",
    moodTitle: "Tukin chu Biren-a engtin nge a awm?",
    moodThanks: "Ka lawm e, Biren-da. I chhungte leh doctor ten an hmu thei ang.",
    moodPeaceful: "Thlamuang",
    moodSteady: "Tha pangngai",
    moodHelp: "Puih mamawh"
  }
};

const LOCALIZED_CULTURAL_NARRATIVE: Record<string, string> = {
  en: "Assamese, native of Silpukhuri, Guwahati. Retired Assam State Agricultural Officer.",
  hi: "असमिया, सिल्पुखुरी, गुवाहाटी के निवासी। असम सरकार के सेवानिवृत्त वरिष्ठ कृषि अधिकारी।",
  as: "অসমীয়া, গুৱাহাটীৰ শিলপুখুৰীৰ বাসিন্দা। অসম চৰকাৰৰ অৱসৰপ্ৰাপ্ত জ্যেষ্ঠ কৃষি বিষয়া।",
  bn: "অসমীয়া, গুয়াহাটির শিলপুকুরির বাসিন্দা। আসাম সরকারের অবসরপ্রাপ্ত প্রবীণ কৃষি আধিকারিক।",
  mr: "आसामी, सिल्पुखुरी, गुवाहाटी येथील रहिवासी. आसाम राज्य सरकारचे सेवानिवृत्त वरिष्ठ कृषी अधिकारी.",
  ne: "असमिया, सिल्पुखुरी, गुवाहाटीका बासिन्दा। असम राज्यका सेवानिवृत्त वरिष्ठ कृषि अधिकृत।",
  mni: "অসামিয়া, সিলপুখুরী, গুৱাহাটীগী মচা। অসাম রাজ্য সরকারগী পোথারবা লৌউ-শিংউ ওফিসার।",
  brx: "आसामी, सिल्पुखुरि, गुवाहाटीनि बासिन्दा। आसाम सरकारनि जिरोबोर गेदेर आबाद अफिसार।",
  grt: "Assamese, Silpukhuri, Guwahati-oni songdonggipa. Assam State Agriculture Office-o kamo neng·takgipa.",
  kha: "U nong-Assam, uba sah ha Silpukhuri, Guwahati. U heh sorkar barim ka Agriculture Office ka sorkar Assam.",
  lus: "Assam mi, Silpukhuri, Guwahati-a cheng. Assam State Loneitu Officer thawk chhuak tawh.",
};

const DEMO_EXTRAS_I18N: Record<string, {
  dayInWorldModal: string;
  majuliWalkModal: string;
  teaHarvestModal: string;
  arrowEscapeModal: string;
  bihuDholModal: string;
  profileSpeech: string;
  listenProfileAria: string;
  listenPhotosAria: string;
  familyPhotosVoice: string;
  ch1: string;
  ch2: string;
  ch3: string;
  ch4: string;
  ch5: string;
  ch6: string;
  tagPhotos: string;
  tagScenes: string;
  tagSounds: string;
  tagVoices: string;
  majuliBadge: string;
  majuliTitle: string;
  majuliDesc: string;
  majuliTech: string;
  teaBadge: string;
  teaTitle: string;
  teaDesc: string;
  teaTech: string;
  bihuBadge: string;
  bihuTitle: string;
  bihuDesc: string;
  bihuTech: string;
  moodVoicePeaceful: string;
  moodVoiceSteady: string;
  moodVoiceHelp: string;
}> = {
  en: {
    dayInWorldModal: "A Day in My World (3D Story Campaign)",
    majuliWalkModal: "Majuli Village Walk (3D Spatial Memory)",
    teaHarvestModal: "Tea Garden Harvest (Webcam Motion Tracking)",
    arrowEscapeModal: "River Rapids Arrow Escape",
    bihuDholModal: "Bihu Dhol Beats & Grounding",
    profileSpeech: "Demo Patient Profile: Biren Borah, seventy-two years old, retired agricultural officer residing in Silpukhuri, Guwahati. Diagnosed with mild cognitive impairment. Joy triggers include Bhupen Hazarika folk songs, terrace orchids, and morning tea.",
    listenProfileAria: "Listen to Profile Guide",
    listenPhotosAria: "Listen to Guide",
    familyPhotosVoice: "Family Photos and Peaceful Sounds. Look at beloved family memories and listen to soothing rain, birds, temple bells, and loving voices.",
    ch1: "Ch 1: Morning",
    ch2: "Ch 2: Tea Essentials",
    ch3: "Ch 3: Majuli Walk",
    ch4: "Ch 4: Market Barter",
    ch5: "Ch 5: Courtyard",
    ch6: "Ch 6: Evening Calm",
    tagPhotos: "Family Photos",
    tagScenes: "Peaceful Scenes",
    tagSounds: "Nature Sounds",
    tagVoices: "Loving Voices",
    majuliBadge: "3D Spatial",
    majuliTitle: "Majuli Village Walk",
    majuliDesc: "Stroll along the sunrise path on Majuli Island and recognize sacred landmarks.",
    majuliTech: "GSAP Camera",
    teaBadge: "Motion Vision",
    teaTitle: "Tea Garden Harvest",
    teaDesc: "Wave your hand in front of the camera to pluck fresh tea buds into your basket.",
    teaTech: "1:1 Reach",
    bihuBadge: "Web Audio Drum",
    bihuTitle: "Bihu Dhol Beats",
    bihuDesc: "Tap in sync with traditional Assamese rhythms to stimulate auditory-motor neural synchrony.",
    bihuTech: "Adaptive BPM",
    moodVoicePeaceful: "Feeling peaceful and calm with the sweet sounds of Assam.",
    moodVoiceSteady: "Feeling steady and balanced today.",
    moodVoiceHelp: "Caregiver alert noted. Reaching out to Manash.",
  },
  as: {
    dayInWorldModal: "মোৰ পৃথিৱীত এদিন (৩ডি কাহিনী অভিযান)",
    majuliWalkModal: "মাজুলী গাঁৱৰ খোজ (৩ডি স্থানিক স্মৃতি)",
    teaHarvestModal: "চাহ বাগিচাৰ পাত তোলা (ৱেবকেম গতি অনুসৰণ)",
    arrowEscapeModal: "নৈৰ সোঁতৰ ধনু তীৰ ৰক্ষা",
    bihuDholModal: "বিহু ঢোলৰ তাল আৰু মানসিক স্থিৰতা",
    profileSpeech: "ৰোগীৰ পৰিচয়: বীৰেন বৰা, ৭২ বছৰ, গুৱাহাটীৰ শিলপুখুৰীৰ অৱসৰপ্ৰাপ্ত কৃষি বিষয়া। মৃদু স্মৃতিৰোগত আক্ৰান্ত। আনন্দৰ উৎস: ড° ভূপেন হাজৰিকাৰ বিহু গীত, ফুলনিৰ কপৌফুল আৰু পুৱাৰ সতেজ চাহ।",
    listenProfileAria: "পৰিচয় নিৰ্দেশনা শুনক",
    listenPhotosAria: "নিৰ্দেশনা শুনক",
    familyPhotosVoice: "পৰিয়ালৰ ফটো আৰু প্ৰশান্তিৰ সুৰ। মৰমৰ পৰিয়ালৰ স্মৃতি চাওক আৰু বৰষুণ, চৰাইৰ কাকলি, নামঘৰৰ ডবা আৰু আত্মীয়ৰ মাত শুনক।",
    ch1: "অধ্যায় ১: পুৱা",
    ch2: "অধ্যায় ২: পুৱাৰ চাহ",
    ch3: "অধ্যায় ৩: মাজুলী ভ্ৰমণ",
    ch4: "অধ্যায় ৪: বজাৰৰ দিন",
    ch5: "অধ্যায় ৫: ঘৰৰ চোতাল",
    ch6: "অধ্যায় ৬: সন্ধিয়াৰ প্ৰশান্তি",
    tagPhotos: "পৰিয়ালৰ ফটো",
    tagScenes: "প্ৰশান্ত দৃশ্য",
    tagSounds: "প্ৰকৃতিৰ ধ্বনি",
    tagVoices: "মৰমৰ মাত",
    majuliBadge: "৩ডি স্থানিক",
    majuliTitle: "মাজুলী গাঁৱৰ খোজ",
    majuliDesc: "মাজুলী দ্বীপৰ পুৱাৰ বাটেৰে খোজ কাঢ়ক আৰু পৱিত্ৰ স্থানসমূহ চিনাক্ত কৰক।",
    majuliTech: "GSAP কেমেৰা",
    teaBadge: "গতি দৰ্শন",
    teaTitle: "চাহ বাগিচাৰ পাত তোলা",
    teaDesc: "কেমেৰাৰ সন্মুখত হাত লৰাই সতেজ চাহৰ কুঁহিপাত পাচিত তোলক।",
    teaTech: "১:১ বিস্তাৰ",
    bihuBadge: "ৱেব অডিঅ' ঢোল",
    bihuTitle: "বিহু ঢোলৰ তাল",
    bihuDesc: "শ্ৰৱণ-গতিশীল সমন্বয় উদ্দীপিত কৰিবলৈ পৰম্পৰাগত অসমীয়া তালত স্পৰ্শ কৰক।",
    bihuTech: "অনুকূলিত BPM",
    moodVoicePeaceful: "অসমৰ মিঠা ধ্বনিৰে প্ৰশান্ত আৰু শান্ত অনুভৱ হৈছে।",
    moodVoiceSteady: "আজি সুস্থিৰ আৰু ভাৰসাম্যপূৰ্ণ অনুভৱ হৈছে।",
    moodVoiceHelp: "শুশ্ৰূষাকাৰীক সতৰ্কবাৰ্তা দিয়া হ'ল। মানসৰ সৈতে যোগাযোগ কৰা হৈছে।",
  },
  hi: {
    dayInWorldModal: "मेरी दुनिया में एक दिन (3D कहानी अभियान)",
    majuliWalkModal: "माजुली गांव की सैर (3D स्थानिक स्मृति)",
    teaHarvestModal: "चाय बागान तुड़ाई (वेबकैम मोशन ट्रैकिंग)",
    arrowEscapeModal: "नदी के बहाव से तीर बचाव",
    bihuDholModal: "बिहू ढोल की ताल व मानसिक शांति",
    profileSpeech: "रोगी प्रोफ़ाइल: बीरेन बोरा, 72 वर्ष, सिल्पुखुरी, गुवाहाटी के सेवानिवृत्त कृषि अधिकारी। हल्के स्मृति दोष से ग्रस्त। खुशी के पल: भूपेन हजारिका के बिहू गीत, बालकनी के ऑर्किड और सुबह की चाय।",
    listenProfileAria: "प्रोफ़ाइल विवरण सुनें",
    listenPhotosAria: "विवरण सुनें",
    familyPhotosVoice: "पारिवारिक तस्वीरें और शांत धुनें। परिवार की सुखद यादें देखें और सुखद बारिश, पक्षियों की चहचहाहट, मंदिर की घंटियों और स्नेही आवाज़ों को सुनें।",
    ch1: "अध्याय 1: सुबह",
    ch2: "अध्याय 2: सुबह की चाय",
    ch3: "अध्याय 3: माजुली की सैर",
    ch4: "अध्याय 4: बाज़ार की चहलपहल",
    ch5: "अध्याय 5: घर का आंगन",
    ch6: "अध्याय 6: शाम की शांति",
    tagPhotos: "पारिवारिक तस्वीरें",
    tagScenes: "शांत दृश्य",
    tagSounds: "प्रकृति की ध्वनियां",
    tagVoices: "स्नेही आवाज़ें",
    majuliBadge: "3D स्थानिक",
    majuliTitle: "माजुली गांव की सैर",
    majuliDesc: "माजुली द्वीप पर सुबह के रास्ते पर टहलें और पवित्र स्थलों को पहचानें।",
    majuliTech: "GSAP कैमरा",
    teaBadge: "मोशन विज़न",
    teaTitle: "चाय बागान तुड़ाई",
    teaDesc: "टोकरी में ताज़ी चाय की पत्तियां तोड़ने के लिए कैमरे के सामने हाथ हिलाएं।",
    teaTech: "1:1 पहुंच",
    bihuBadge: "वेब ऑडियो ढोल",
    bihuTitle: "बिहू ढोल ताल",
    bihuDesc: "पारंपरिक असमिया ताल के साथ मिलकर टैप करें और श्रवण-गति तंत्रिका को सक्रिय करें।",
    bihuTech: "अनुकूलित BPM",
    moodVoicePeaceful: "असम की मधुर ध्वनियों से शांति और सुकून का अनुभव हो रहा है।",
    moodVoiceSteady: "आज मन संतुलित और स्थिर महसूस कर रहा है।",
    moodVoiceHelp: "देखभालकर्ता को सूचना भेज दी गई है। मानस से संपर्क किया जा रहा है।",
  },
  bn: {
    dayInWorldModal: "আমার পৃথিবীতে একদিন (3D গল্প অভিযান)",
    majuliWalkModal: "মাজুলী গ্রামের হাঁটা (3D স্থানিক স্মৃতি)",
    teaHarvestModal: "চা বাগান ফসল তোলা (ওয়েবক্যাম মোশন ট্র্যাকিং)",
    arrowEscapeModal: "নদীর স্রোত ও তীর আত্মরক্ষা",
    bihuDholModal: "বিহু ঢোলের তাল ও মানসিক স্থৈর্য",
    profileSpeech: "রোগীর বিবরণ: বীরেন বোরা, ৭২ বছর, গুয়াহাটির শিলপুকুরির অবসরপ্রাপ্ত কৃষি আধিকারিক। মৃদু স্মৃতি হ্রাস। আনন্দের বিষয়: ভূপেন হাজারিকার গান, বারান্দার অর্কিড ও সকালের চা।",
    listenProfileAria: "বিবরণ শুনুন",
    listenPhotosAria: "বিবরণ শুনুন",
    familyPhotosVoice: "পারিবারিক ছবি ও শান্ত সুর। প্রিয় পরিবারের স্মৃতি দেখুন এবং বৃষ্টি, পাখির ডাক, মন্দিরের ঘণ্টা ও প্রিয়জনদের কণ্ঠস্বর শুনুন।",
    ch1: "অধ্যায় ১: সকাল",
    ch2: "অধ্যায় ২: সকালের চা",
    ch3: "অধ্যায় ৩: মাজুলী ভ্রমণ",
    ch4: "অধ্যায় ৪: বাজারের দিন",
    ch5: "অধ্যায় ৫: ঘরের উঠোন",
    ch6: "অধ্যায় ৬: সন্ধ্যার প্রশান্তি",
    tagPhotos: "পারিবারিক ছবি",
    tagScenes: "প্রশান্ত দৃশ্য",
    tagSounds: "প্রকৃতির শব্দ",
    tagVoices: "স্নেহের কণ্ঠস্বর",
    majuliBadge: "3D স্থানিক",
    majuliTitle: "মাজুলী গ্রামের হাঁটা",
    majuliDesc: "মাজুলী দ্বীপের ভোরের পথে হাঁটুন এবং পবিত্র স্থানগুলি চিনুন।",
    majuliTech: "GSAP ক্যামেরা",
    teaBadge: "মোশন ভিশন",
    teaTitle: "চা বাগান ফসল তোলা",
    teaDesc: "ক্যামেরার সামনে হাত নেড়ে ঝুড়িতে তাজা চা পাতা তুলুন।",
    teaTech: "১:১ নাগাল",
    bihuBadge: "ওয়েব অডিও ঢোল",
    bihuTitle: "বিহু ঢোলের তাল",
    bihuDesc: "শ্রবণ ও চলাচলের সামঞ্জস্য বাড়াতে ঐতিহ্যবাহী অসমীয়া তালে তাল মিলিয়ে স্পর্শ করুন।",
    bihuTech: "অভিযোজিত BPM",
    moodVoicePeaceful: "আসামের মধুর শব্দে শান্ত ও প্রশান্ত অনুভব করছি।",
    moodVoiceSteady: "আজ মন শান্ত ও ভারসাম্যপূর্ণ লাগছে।",
    moodVoiceHelp: "যত্নশীলকে সতর্কবার্তা পাঠানো হয়েছে। মানসের সাথে যোগাযোগ করা হচ্ছে।",
  },
  mr: {
    dayInWorldModal: "माझ्या जगात एक दिवस (3D कथा मोहीम)",
    majuliWalkModal: "माजुली गावाची सफर (3D स्थानिक स्मृती)",
    teaHarvestModal: "चहाच्या बागेतील तोडणी (वेबकॅम मोशन ट्रॅकिंग)",
    arrowEscapeModal: "नदीच्या प्रवाहातून बाण सुटका",
    bihuDholModal: "बिहू ढोल ताल आणि मानसिक शांतता",
    profileSpeech: "रुग्ण तपशील: बिरेन बोरा, ७२ वर्षे, सिल्पुखुरी, गुवाहाटी येथील सेवानिवृत्त कृषी अधिकारी. सौम्य स्मृती विकार. आनंदाचे क्षण: भूपेन हजारिकांची गाणी, बालकनीतील ऑर्किड आणि सकाळचा चहा.",
    listenProfileAria: "तपशील ऐका",
    listenPhotosAria: "तपशील ऐका",
    familyPhotosVoice: "कौटुंबिक छायाचित्रे आणि शांत सूर. कुटुंबाच्या सुखद आठवणी पहा आणि पाऊस, पक्ष्यांचे मंजूळ आवाज, मंदिराच्या घंटा आणि आपुलकीचे आवाज ऐका.",
    ch1: "भाग १: सकाळ",
    ch2: "भाग २: चहाची वेळ",
    ch3: "भाग ३: माजुली सफर",
    ch4: "भाग ४: बाजाराची वेळ",
    ch5: "भाग ५: घराचे अंगण",
    ch6: "भाग ६: संध्याकाळची शांतता",
    tagPhotos: "कौटुंबिक छायाचित्रे",
    tagScenes: "शांत दृश्ये",
    tagSounds: "निसर्गाचे नाद",
    tagVoices: "मायाळू आवाज",
    majuliBadge: "3D स्थानिक",
    majuliTitle: "माजुली गावाची सफर",
    majuliDesc: "माजुली बेटावरील सकाळच्या वाटेवर चाला आणि पवित्र ठिकाणे ओळखा.",
    majuliTech: "GSAP कॅमेरा",
    teaBadge: "मोशन व्हिजन",
    teaTitle: "चहा बागेतील तोडणी",
    teaDesc: "टोपलीत ताजी चहाची पाने तोडण्यासाठी कॅमेऱ्यासमोर हात हलवा.",
    teaTech: "१:१ पोहोच",
    bihuBadge: "वेब ऑडिओ ढोल",
    bihuTitle: "बिहू ढोल ताल",
    bihuDesc: "पारंपारिक आसामी लयीसोबत टॅप करा आणि मेंदूतील श्रवण-मोटर समन्वय वाढवा.",
    bihuTech: "अनुकूलित BPM",
    moodVoicePeaceful: "आसामच्या गोड सुरांनी शांत आणि प्रसन्न वाटत आहे.",
    moodVoiceSteady: "आज स्थिर आणि संतुलित वाटत आहे.",
    moodVoiceHelp: "काळजीवाहकाला संदेश पाठवला आहे. मानसशी संपर्क साधत आहे.",
  },
  ne: {
    dayInWorldModal: "मेरो संसारमा एक दिन (3D कथा अभियान)",
    majuliWalkModal: "माजुली गाउँको पैदल यात्रा (3D स्थानिक स्मृति)",
    teaHarvestModal: "चिया बगान फसल (वेबक्याम मोशन ट्र्याकिङ)",
    arrowEscapeModal: "नदीको बहावबाट तीर बचाउ",
    bihuDholModal: "बिहु ढोलको ताल र मानसिक शान्ति",
    profileSpeech: "बिरामी प्रोफाइल: बिरेन बोरा, ७२ वर्ष, सिल्पुखुरी, गुवाहाटीका सेवानिवृत्त कृषि अधिकृत। हल्का स्मरण कमजोरी। खुसीका विषय: भूपेन हजारिकाका गीत, बगैँचाको हेरचाह र बिहानीको चिया।",
    listenProfileAria: "विवरण सुन्नुहोस्",
    listenPhotosAria: "विवरण सुन्नुहोस्",
    familyPhotosVoice: "पारिवारिक तस्बिरहरू र शान्त धुनहरू। परिवारका सुखद सम्झनाहरू हेर्नुहोस् र वर्षा, चराहरूको चिरबिर, मन्दिरको घण्टी र मायालु आवाजहरू सुन्नुहोस्।",
    ch1: "अध्याय १: बिहान",
    ch2: "अध्याय २: चिया समय",
    ch3: "अध्याय ३: माजुली यात्रा",
    ch4: "अध्याय ४: बजारको चहलपहल",
    ch5: "अध्याय ५: घरको आँगन",
    ch6: "अध्याय ६: साँझको शान्ति",
    tagPhotos: "पारिवारिक तस्बिरहरू",
    tagScenes: "शान्त दृश्यहरू",
    tagSounds: "प्रकृतिको आवाज",
    tagVoices: "मायालु आवाजहरू",
    majuliBadge: "3D स्थानिक",
    majuliTitle: "माजुली गाउँको पैदल यात्रा",
    majuliDesc: "माजुली टापुमा बिहानको बाटोमा हिंड्नुहोस् र पवित्र स्थलहरू पहिचान गर्नुहोस्।",
    majuliTech: "GSAP क्यामेरा",
    teaBadge: "मोशन भिजन",
    teaTitle: "चिया बगान फसल",
    teaDesc: "टोकरीमा ताजा चियाको मुना टिप्न क्यामेरा अगाडि हात हल्लाउनुहोस्।",
    teaTech: "१:१ पहुँच",
    bihuBadge: "वेब अडियो ढोल",
    bihuTitle: "बिहु ढोलको ताल",
    bihuDesc: "परम्परागत असमिया लयसँगै ट्याप गर्नुहोस् र श्रवण-गति समन्वय सक्रिय गर्नुहोस्।",
    bihuTech: "अनुकूलित BPM",
    moodVoicePeaceful: "असमका मधुर आवाजहरूसँग शान्ति र आनन्दको अनुभूति हुँदैछ।",
    moodVoiceSteady: "आज मन स्थिर र सन्तुलित महसुस भइरहेको छ।",
    moodVoiceHelp: "हेरचाहकर्तालाई सतर्कता पठाइयो। मानससँग सम्पर्क गरिँदैछ।",
  },
  mni: {
    dayInWorldModal: "ঐগী তাইবংদা নুমিৎ অমা (3D ৱারী খোঙচৎ)",
    majuliWalkModal: "মাজুলী খুঙ্গং চৎপা (3D মফম নীংশিংবা)",
    teaHarvestModal: "চা পাম্বী হেতপা (ৱেবকেম খোঙজেল য়েংশিনবা)",
    arrowEscapeModal: "তুরেল খোঙজেলদা তেন নান্থোকপা",
    bihuDholModal: "বিহু ঢোলগী খোঞ্জেল অমসুং পুক্নিং শান্তী",
    profileSpeech: "অনাবগী প্রোফাইল: বীরেন বোরা, চহী ৭২, সিলপুখুরী, গুৱাহাটীগী পোথারবা লৌউ-শিংউ ওফিসার। মৃদু নীংশিংবা হন্থবা। নুংঙাইবা মরম: ভূপেন হাজরিকাগী ঈশৈ, লৈকোলগী লৈ অমসুং অয়ুক্কী চা।",
    listenProfileAria: "পাউতাক তাবা",
    listenPhotosAria: "পাউতাক তাবা",
    familyPhotosVoice: "ইমুংগী ফোতো অমসুং শান্তীগী খোঞ্জেল। ইমুংগী নীংশিংবা শক্তমশিং য়েংবিয়ু অমসুং নোংচুবা, উচেক্কী খোঞ্জেল, লাইশংগী শঙ্খ অমসুং নুংশিরবা খোঞ্জেল তাবিয়ু।",
    ch1: "পান্দুপ ১: অয়ুক",
    ch2: "পান্দুপ ২: চা থকপা",
    ch3: "পান্দুপ ৩: মাজুলী খোঙচৎ",
    ch4: "পান্দুপ ৪: কৈথেল চৎপা",
    ch5: "পান্দুপ ৫: য়ুমগী শুমবাং",
    ch6: "পান্দুপ ৬: নুমিদাংগী শান্তী",
    tagPhotos: "ইমুংগী ফোতো",
    tagScenes: "শান্তী ওইবা শক্তম",
    tagSounds: "মহৌশাগী খোঞ্জেল",
    tagVoices: "নুংশিবা খোঞ্জেল",
    majuliBadge: "3D মফম",
    majuliTitle: "মাজুলী খুঙ্গং চৎপা",
    majuliDesc: "মাজুলী ত্বীপ্তা অয়ুক্কী লম্বীদা খোঙচৎ চৎলু অমসুং শেংলবা মফমশিং শকখঙলু।",
    majuliTech: "GSAP কেমেরা",
    teaBadge: "মোশন ভিজিয়ন",
    teaTitle: "চা পাম্বী হেতপা",
    teaDesc: "কেমেরাগী মাংদা খুৎ খোঙজেল হাপ্লগা তোংঙানবা চা পাম্বী পলোদা হেতশিনলু।",
    teaTech: "১:১ য়ৌবা",
    bihuBadge: "ৱেব ওডিও ঢোল",
    bihuTitle: "বিহু ঢোলগী খোঞ্জেল",
    bihuDesc: "অহৌবা অসামগী খোঞ্জেলগা লোয়ননা থাবদুনা পুক্নিং অমসুং হৌবা সিন্দোকলু।",
    bihuTech: "মতমগী বিপিএম",
    moodVoicePeaceful: "অসামগী হৌবা খোঞ্জেলনা পুক্নিং শান্তী অমসুং নুংঙাইবা ফাওই।",
    moodVoiceSteady: "ঙসি পুক্নিং লেংদনা ফনা লৈরি।",
    moodVoiceHelp: "য়েংশিনবীরিবদা পাউ পীখ্রে। মানসকা লোয়ননা পাউ ফাওনরি।",
  },
  brx: {
    dayInWorldModal: "आंनि मुलुगआव मोनसे सान (3D सल' हाबाफारि)",
    majuliWalkModal: "माजुलि गामियाव थाबायनाय (3D जायगानि गोसोखां)",
    teaHarvestModal: "साहा बागानाव बिलाइ खायनाय (वेबकेम मोसन ट्रेकिं)",
    arrowEscapeModal: "दैमा बोहैनायाव थिरजों रैखा",
    bihuDholModal: "बिहु खामनि बाथाब आरो गोसो शान्ति",
    profileSpeech: "सानेनि सिनायथि: बिरेन बरा, 72 बोसोर, सिल्पुखुरि, गुवाहाटीनि जिरोबोर आबाद अफिसार। उन्दै गोसोखां खहा। मोजां मोननाय: भुपेन हाजारिकानि रोजाबनाय, बिबार आरो फुंनि साहा।",
    listenProfileAria: "सिनायथि खोनासं",
    listenPhotosAria: "बिथोन खोनासं",
    familyPhotosVoice: "नखरनि फोटो आरो गोसो शान्ति रोजाबनाय। मोजां मोननाय नखरनि गोसोखांथि नाय आरो अखा, दाउस्रि, पुजा जायगानि घन्टी खोनासं।",
    ch1: "खोलोब 1: फुं",
    ch2: "खोलोब 2: साहा",
    ch3: "खोलोब 3: माजुलि थाबायनाय",
    ch4: "खोलोब 4: बाजार",
    ch5: "खोलोब 5: न'नि आंगोन",
    ch6: "खोलोब 6: बेलासेनि शान्ति",
    tagPhotos: "नखरनि फोटो",
    tagScenes: "गोसो शान्ति नुथाय",
    tagSounds: "मिथिंगानि सोदोब",
    tagVoices: "अननायनि राव",
    majuliBadge: "3D जायगानि",
    majuliTitle: "माजुलि गामियाव थाबायनाय",
    majuliDesc: "माजुलि द्वीपआव फुंनि लामाजों थाबाय आरो गोथार जायगाफोरखौ सिनायथ' खालाम।",
    majuliTech: "GSAP केमेरा",
    teaBadge: "मोसन भिजन",
    teaTitle: "साहा बागानाव बिलाइ खायनाय",
    teaDesc: "केमेरानि साखाथियाव आखाइ हखावनानै साहा बिलाइ खांना ला।",
    teaTech: "1:1 सौहैनाय",
    bihuBadge: "वेब अडिअ' खाम",
    bihuTitle: "बिहु खामनि बाथाब",
    bihuDesc: "आसामनि हारिमु बाथाबजों लोगोसे आखाइ थुनानै गोसो गोहो बांहो।",
    bihuTech: "गोरोबथि गोनां BPM",
    moodVoicePeaceful: "आसामनि गोदै सोदोबजों गोसो शान्ति मोनदों।",
    moodVoiceSteady: "दिनै गोसोआ थामहिन्था आरो मोजां मोनदों।",
    moodVoiceHelp: "हेफाजाबगिरिनो खौरां हरबाय। मानसजों रायज्लायनाय जागोन।",
  },
  grt: {
    dayInWorldModal: "Angni Gipin Sal (3D Golpo Re·ani)",
    majuliWalkModal: "Majuli Songni Re·ama (3D Biap Gisik Ra·ani)",
    teaHarvestModal: "Cha Bagan Ra·ani (Webcam Motion Tracking)",
    arrowEscapeModal: "Chibima Soko Te·teng Katani",
    bihuDholModal: "Bihu Dama Doka aro Gisik Santi",
    profileSpeech: "Sagirangni bidingo: Biren Borah, bilsi 72, Silpukhuri, Guwahati-oni kamo neng·takgipa. Chonbegipa gisik ra·ani dingtangani. Kusi ong·ani: Bhupen Hazarikani ring·ani, bagan aro pringni cha.",
    listenProfileAria: "Knana gimin",
    listenPhotosAria: "Knana gimin",
    familyPhotosVoice: "Nokdangni Noksa aro Tomtom Gam·anirang. Ka·sagipa nokdangni noksarangko nibo aro mikka, do·o, namghar aro ka·sagipa ku·rangko knabo.",
    ch1: "Adha 1: Pring",
    ch2: "Adha 2: Cha",
    ch3: "Adha 3: Majuli Re·ani",
    ch4: "Adha 4: Bazaar Re·ani",
    ch5: "Adha 5: Sara/A·dam",
    ch6: "Adha 6: Attam Tomtom",
    tagPhotos: "Nokdangni Noksa",
    tagScenes: "Tomtomgipa Nikanirang",
    tagSounds: "A·gilsakni Gam·anirang",
    tagVoices: "Ka·sagipa Ku·rang",
    majuliBadge: "3D Biap",
    majuliTitle: "Majuli Songni Re·ama",
    majuliDesc: "Majuli Island-o pringo re·e rongtalgipa biaprangko u·ie ra·bo.",
    majuliTech: "GSAP Camera",
    teaBadge: "Motion Vision",
    teaTitle: "Cha Bagan Ra·ani",
    teaDesc: "Camera-ni mikkango jakko mo·e cha bijakko kok-o ra·chapbo.",
    teaTech: "1:1 Sokani",
    bihuBadge: "Web Audio Dama",
    bihuTitle: "Bihu Dama Doka",
    bihuDesc: "Assam-ni gitni gam·ani baksa dok·e gisik aro jakni kamko mangrakatbo.",
    bihuTech: "Adaptive BPM",
    moodVoicePeaceful: "Assam-ni gam·anirangchi tomtom aro kusi ong·enga.",
    moodVoiceSteady: "Da·alo tomtom aro kakket ong·e gisik nanga.",
    moodVoiceHelp: "Ni·gipana u·iatmanaha. Manash-na aganna chol dakenga.",
  },
  kha: {
    dayInWorldModal: "Shisngi ha ka Pyrthei Jong Nga (3D Jingiathuhkhana)",
    majuliWalkModal: "Majuli Shnong Jingiaid (3D Jingkynmaw Jaka)",
    teaHarvestModal: "Kheit Sla Sha (Webcam Motion Tracking)",
    arrowEscapeModal: "Jingphet na ka Wah pyrshah Khnam",
    bihuDholModal: "Ki Sur Dhol Bihu bad Jingsuk Jingmut",
    profileSpeech: "Ka jingtip u nongpang: Biren Borah, 72 snem, u nongtrei sorkar ba la shongthait na Silpukhuri, Guwahati. Duna ka jingkynmaw. Ki jingkmen: ki jingrwai Bhupen Hazarika, syntiew kper bad sha step.",
    listenProfileAria: "Sngap ia ka jingpyniaid",
    listenPhotosAria: "Sngap ia ka jingbthah",
    familyPhotosVoice: "Dur Ba Haiing & Sur Jingsuk. Peit ia ki jingkynmaw ba ieit jong ka iing bad sngap slap, sim, shakuriaw bad sur ba thiang.",
    ch1: "Lynnong 1: Mynstep",
    ch2: "Lynnong 2: Sha Step",
    ch3: "Lynnong 3: Majuli Jingiaid",
    ch4: "Lynnong 4: Ka Iew",
    ch5: "Lynnong 5: Ka Rynsan Iing",
    ch6: "Lynnong 6: Jingsuk Janmiet",
    tagPhotos: "Dur Kpa-iing",
    tagScenes: "Ki Dur Jingsuk",
    tagSounds: "Sur Mariang",
    tagVoices: "Ki Sur Ba Maya",
    majuliBadge: "3D Jaka",
    majuliTitle: "Majuli Shnong Jingiaid",
    majuliDesc: "Iaid kai ha ka lynti step ha Majuli Island bad ithuh ia ki jaka kyntang.",
    majuliTech: "GSAP Camera",
    teaBadge: "Motion Vision",
    teaTitle: "Kheit Sla Sha",
    teaDesc: "Padoh ia ka kti ha khmat camera ban kheit ia ki thied sla sha ha ka shang.",
    teaTech: "1:1 Kot",
    bihuBadge: "Web Audio Ksing",
    bihuTitle: "Ki Sur Dhol Bihu",
    bihuDesc: "Thab ryngkat bad ki sur tynrai Assam ban pynkhlain ia ka bor sngap bad pyniaid.",
    bihuTech: "BPM Ba Iada",
    moodVoicePeaceful: "Sngew shukor bad jingsuk ryngkat bad ki sur ba thiang jong ka Assam.",
    moodVoiceSteady: "Sngew skhem bad biang mynta ka sngi.",
    moodVoiceHelp: "La pynbna sha u nongri. Dang iakren bad u Manash.",
  },
  lus: {
    dayInWorldModal: "Ka Khawvela Ni Khat (3D Thawnthu Zin)",
    majuliWalkModal: "Majuli Khua Kalna (3D Hmun Hriatna)",
    teaHarvestModal: "Thingpui Huan Seng (Webcam Motion Tracking)",
    arrowEscapeModal: "Lui Fawn Thalthal Araw Khelhna",
    bihuDholModal: "Bihu Khuang Tum leh Rilru Hahdam",
    profileSpeech: "Damlo Chanchin: Biren Borah, kum 72, Silpukhuri, Guwahati-a loneitu thawk chhuak tawh. Hriatna tlem hloh. Hlimna thlen thute: Bhupen Hazarika hla, huan pangpar leh zing thingpui.",
    listenProfileAria: "Chanchin ngaihthlakna",
    listenPhotosAria: "Kaihhruaina ngaithla rawh",
    familyPhotosVoice: "Chhungkaw Thlalak & Thlamuanna Aw. Chhungkaw thlalak hlute en la, ruah sur ri, sava hram, dar ri leh aw duhawmte ngaithla rawh.",
    ch1: "Bung 1: Zing",
    ch2: "Bung 2: Zing Thingpui",
    ch3: "Bung 3: Majuli Lenvel",
    ch4: "Bung 4: Bazar Kal",
    ch5: "Bung 5: Kawtlaia Inkhawm",
    ch6: "Bung 6: Tlai Thlamuanna",
    tagPhotos: "Chhungkaw Thlalak",
    tagScenes: "Hmun Ralmuang",
    tagSounds: "Siamtu Rimawi",
    tagVoices: "Hmangaihna Aw",
    majuliBadge: "3D Hmun",
    majuliTitle: "Majuli Khua Kalna",
    majuliDesc: "Majuli thliarkara zing ni chhuak kawngah leng harh la, hmun thianghlimte hre chhuak rawh.",
    majuliTech: "GSAP Camera",
    teaBadge: "Motion Vision",
    teaTitle: "Thingpui Huan Seng",
    teaDesc: "Camera hmaah i kut vaiin thingpui hnah tharlam chu i bawmah thun rawh.",
    teaTech: "1:1 Banphak",
    bihuBadge: "Web Audio Khuang",
    bihuTitle: "Bihu Khuang Tum",
    bihuDesc: "Hnam rimawi mil zela hmetin thluak leh taksa chakna tichak rawh.",
    bihuTech: "BPM Remchan",
    moodVoicePeaceful: "Assam rimawi mawi takte nen rilru thlamuang takin ka awm.",
    moodVoiceSteady: "Vawiin chu ka pangngaiin ka ziaawm khawp mai.",
    moodVoiceHelp: "Enkawltu hriattirna thawn a ni tawh. Manash-a biak pawh mek a ni.",
  },
};

export default function PatientDemoPage() {
  const locale = useLocale();
  const d18n = DEMO_I18N[locale] || DEMO_I18N.en;
  const extras = DEMO_EXTRAS_I18N[locale] || DEMO_EXTRAS_I18N.en;
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [activeModalGame, setActiveModalGame] = useState<ActiveModalGame>(null);
  const [activeRelative, setActiveRelative] = useState<number | null>(null);
  const [activePlace, setActivePlace] = useState<number | null>(null);
  const [lastMood, setLastMood] = useState<MoodKey | null>(null);

  // Auto-authenticate as Biren Borah on demo entry
  useEffect(() => {
    if (!isAuthenticated) {
      login("demo-patient-token-101", {
        id: 101,
        name: "Biren Borah",
        languagePreference: "as",
      });
    }
  }, [isAuthenticated, login]);

  const p = DEMO_PATIENT_RECORD;

  const handleSpeak = (text: string) => {
    unlockAudio();
    speakText(text, locale, 0.82);
  };

  const todayDateStr = new Date().toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#FAF6F0] pb-24 text-ink">
      {/* Active Modal Fullscreen Game Overlay */}
      {activeModalGame && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-6 animate-fade-in flex flex-col items-center justify-start">
          <div className="sticky top-2 z-50 w-full max-w-4xl flex items-center justify-between bg-ink/90 border-3 border-black text-white p-3 rounded-2xl shadow-[4px_4px_0px_#000] mb-3">
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-base sm:text-lg">
                {activeModalGame === "day-in-my-world" && extras.dayInWorldModal}
                {activeModalGame === "majuli-walk" && extras.majuliWalkModal}
                {activeModalGame === "tea-harvest-vision" && extras.teaHarvestModal}
                {activeModalGame === "arrow-escape" && extras.arrowEscapeModal}
                {activeModalGame === "bihu-dhol" && extras.bihuDholModal}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveModalGame(null)}
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-rose-500 hover:bg-rose-600 px-4 py-2 text-xs sm:text-sm font-black text-white shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>{d18n.closeGame}</span>
            </button>
          </div>

          <div className="w-full max-w-4xl rounded-3xl border-4 border-black bg-[#FAF6F0] p-3 sm:p-6 shadow-[8px_8px_0px_#000] text-ink overflow-hidden">
            {activeModalGame === "day-in-my-world" && <DayInMyWorld3D />}
            {activeModalGame === "majuli-walk" && <MajuliWalk3D />}
            {activeModalGame === "tea-harvest-vision" && <TeaHarvestVision />}
            {activeModalGame === "arrow-escape" && <ArrowEscape />}
            {activeModalGame === "bihu-dhol" && <BihuDholBeats />}
          </div>
        </div>
      )}

      {/* TOP CLINICAL DEMO BANNER */}
      <div className="border-b-4 border-black bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 px-4 py-4 text-white shadow-md">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-amber-200 text-amber-950 font-black shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                  {d18n.evalMode}
                </span>
                <span className="rounded-full bg-emerald-300 text-emerald-950 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  {d18n.sessionActive}
                </span>
              </div>
              <p className="text-xs font-bold text-amber-100 mt-0.5">
                {d18n.preloaded}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/patient"
              className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-100"
            >
              <span>{d18n.standardView}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/patient/games"
              className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-200 px-3 py-1.5 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000] hover:bg-amber-300"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>{d18n.gamesHub}</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 1. DEMO ACCOUNT PROFILE CARD */}
        <div className="rounded-3xl border-4 border-black bg-surface p-5 sm:p-6 shadow-[6px_6px_0px_#000]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-3 border-black bg-amber-100 overflow-hidden shrink-0 shadow-[3px_3px_0px_#000] flex items-center justify-center">
                <Image
                  src={p.photoUrl || "/sample-images/patient_1_biren_borah/patient_profile_photo_biren_borah.jpg"}
                  alt={p.name}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-black bg-amber-200 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-950">
                    {d18n.patientNum}
                  </span>
                  <span
                    suppressHydrationWarning
                    className="rounded-full bg-emerald-100 border border-emerald-800/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-900"
                  >
                    {d18n.mildMemory}
                  </span>
                  <span
                    suppressHydrationWarning
                    className="hidden sm:inline-flex rounded-full bg-purple-100 border border-purple-800/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-purple-900"
                  >
                    {d18n.bilingual}
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-black text-ink">
                  {p.name}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-ink-secondary">
                  {d18n.ageJob}
                </p>

                <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-ink-secondary">
                  <span suppressHydrationWarning className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-teal-800" /> {todayDateStr}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-black">
                    {d18n.caregiverLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleSpeak(
                    `Demo Patient Profile: ${p.name}, seventy-two years old, retired agricultural officer residing in Silpukhuri, Guwahati. Diagnosed with mild cognitive impairment. Joy triggers include Bhupen Hazarika folk songs, terrace orchids, and morning tea.`
                  )
                }
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-amber-100 hover:bg-amber-200 px-3.5 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] cursor-pointer"
                title="Listen to Profile Guide"
              >
                <Volume2 className="h-4 w-4 text-amber-900" />
                <span>{d18n.listenGuide}</span>
              </button>
            </div>
          </div>

          {/* Joy Triggers & Cultural Background Highlights */}
          <div className="mt-4 pt-4 border-t-2 border-black/10 grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-xl bg-amber-50/80 p-3 border border-amber-900/20">
              <span className="font-black text-amber-950 uppercase text-[10px] block mb-1">
                {d18n.joyTriggers}
              </span>
              <p className="font-medium text-ink leading-relaxed">
                {p.joyTriggers}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50/80 p-3 border border-emerald-900/20">
              <span className="font-black text-emerald-950 uppercase text-[10px] block mb-1">
                {d18n.culturalNarrative}
              </span>
              <p className="font-medium text-ink leading-relaxed">
                {p.culturalBackground}
              </p>
            </div>
          </div>
        </div>

        {/* 2. FLAGSHIP 3D STORY CAMPAIGN (HERO EXPERIENCE) */}
        <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 p-6 text-white shadow-[6px_6px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              <span>{d18n.flagshipBadge}</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
              {d18n.flagshipTitle}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-amber-100 max-w-xl leading-relaxed">
              {d18n.flagshipDesc}
            </p>

            <div className="hidden sm:flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-black uppercase tracking-wider text-amber-100">
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 1: Morning</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 2: Tea Essentials</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 3: Majuli Walk</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 4: Market Barter</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 5: Courtyard</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 6: Evening Calm</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveModalGame("day-in-my-world")}
              className="btn-tactile rounded-2xl border-3 border-black bg-white px-5 py-3 text-sm font-black text-amber-950 shadow-[4px_4px_0px_#000] hover:bg-amber-100 flex items-center gap-2 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-amber-950" />
              <span>{d18n.launchStory}</span>
            </button>
            <VerifiedStampBadge
              gameId="day-in-my-world"
              gameTitle="A Day in My World"
              gameDomain="Memories & Daily Life"
              size="lg"
            />
          </div>
        </div>

        {/* FEATURE 1: FAMILY PHOTOS & PEACEFUL SOUNDS */}
        <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-900 p-6 text-white shadow-[6px_6px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
              {d18n.familyPhotosTitle}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-teal-100 max-w-xl leading-relaxed">
              {d18n.familyPhotosDesc}
            </p>

            <div className="hidden sm:flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-black uppercase tracking-wider text-teal-200">
              <span className="rounded-md bg-black/30 px-2 py-0.5">Family Photos</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Peaceful Scenes</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Nature Sounds</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Loving Voices</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => handleSpeak("Family Photos and Peaceful Sounds. {d18n.familyPhotosDesc}")}
              className="btn-tactile rounded-2xl border-3 border-black bg-teal-300 p-3.5 text-black shadow-[4px_4px_0px_#000] hover:bg-teal-200 cursor-pointer"
              title="Listen to Guide"
            >
              <Volume2 className="h-5 w-5" />
            </button>
            <Link
              href="/patient/echoes-of-home"
              className="btn-tactile rounded-2xl border-3 border-black bg-white px-5 py-3 text-sm font-black text-teal-950 shadow-[4px_4px_0px_#000] hover:bg-teal-50 flex items-center gap-2 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-teal-950" />
              <span>{d18n.openPhotos}</span>
            </Link>
          </div>
        </div>

        {/* 3. FEATURED MODAL GAMES SHOWCASE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-teal-800" />
              <h2 className="font-serif text-xl font-black text-ink">
                {d18n.featuredGamesTitle}
              </h2>
            </div>
            <Link
              href="/patient/games"
              className="text-xs font-black text-tea hover:underline inline-flex items-center gap-1"
            >
              <span>{d18n.viewAllGames}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-3">
            {/* Card 1: Majuli Village Walk */}
            <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-br from-[#2D5A27] to-[#1E3F1A] p-5 text-white shadow-[6px_6px_0px_#000] flex flex-col justify-between">
              <div>
                <span className="rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black uppercase text-amber-950 shadow-sm inline-flex items-center gap-1 mb-2">
                  <Footprints className="h-3.5 w-3.5" /> 3D Spatial
                </span>
                <h3 className="font-serif text-lg font-black text-white">
                  Majuli Village Walk
                </h3>
                <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                  Stroll along the sunrise path on Majuli Island and recognize sacred landmarks.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-white/70">GSAP Camera</span>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveModalGame("majuli-walk")}
                    className="btn-tactile rounded-xl border-2 border-black bg-amber-400 px-3.5 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_#000] hover:bg-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="h-3 w-3 fill-black" />
                    <span>{d18n.play3D}</span>
                  </button>
                  <VerifiedStampBadge
                    gameId="majuli-walk"
                    gameTitle="Majuli Village Walk"
                    gameDomain="3D Spatial Memory"
                    size="md"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Tea Garden Harvest */}
            <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-br from-[#14532D] to-[#064E3B] p-5 text-white shadow-[6px_6px_0px_#000] flex flex-col justify-between">
              <div>
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-[10px] font-black uppercase text-emerald-950 shadow-sm inline-flex items-center gap-1 mb-2">
                  <Camera className="h-3.5 w-3.5" /> Motion Vision
                </span>
                <h3 className="font-serif text-lg font-black text-white">
                  Tea Garden Harvest
                </h3>
                <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                  Wave your hand in front of the camera to pluck fresh tea buds into your basket.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-white/70">1:1 Reach</span>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveModalGame("tea-harvest-vision")}
                    className="btn-tactile rounded-xl border-2 border-black bg-emerald-400 px-3.5 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_#000] hover:bg-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="h-3 w-3 fill-black" />
                    <span>{d18n.playVision}</span>
                  </button>
                  <VerifiedStampBadge
                    gameId="tea-harvest"
                    gameTitle="Tea Garden Harvest"
                    gameDomain="Motion Vision Kinematics"
                    size="md"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Bihu Dhol Beats */}
            <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-br from-[#78350F] to-[#451A03] p-5 text-white shadow-[6px_6px_0px_#000] flex flex-col justify-between">
              <div>
                <span className="rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black uppercase text-amber-950 shadow-sm inline-flex items-center gap-1 mb-2">
                  <Activity className="h-3.5 w-3.5" /> Web Audio Drum
                </span>
                <h3 className="font-serif text-lg font-black text-white">
                  Bihu Dhol Beats
                </h3>
                <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                  Tap in sync with traditional Assamese rhythms to stimulate auditory-motor neural synchrony.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold text-amber-200">Adaptive BPM</span>
                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveModalGame("bihu-dhol")}
                    className="btn-tactile rounded-xl border-2 border-black bg-amber-300 px-3.5 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_#000] hover:bg-amber-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="h-3 w-3 fill-black" />
                    <span>{d18n.playDrum}</span>
                  </button>
                  <VerifiedStampBadge
                    gameId="bihu-dhol"
                    gameTitle="Bihu Dhol Beats"
                    gameDomain="Auditory-Motor Drum"
                    size="md"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FAMILIAR FACES & FAMILY NETWORK (REMINISCENCE THERAPY) */}
        <div className="rounded-3xl border-4 border-black bg-surface p-5 sm:p-6 shadow-[6px_6px_0px_#000] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-tea" />
              <h2 className="font-serif text-xl font-black text-ink">
                {d18n.familiarFacesTitle}
              </h2>
            </div>
            <span className="text-xs font-bold text-ink-secondary">
              {d18n.relativesCount}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {p.familyMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => {
                  setActiveRelative(member.id);
                  handleSpeak(`${member.name}, ${member.relation}. ${member.notes}`);
                }}
                className={`group rounded-2xl border-3 border-black p-2.5 text-center cursor-pointer transition-all shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] ${
                  activeRelative === member.id ? "bg-amber-100 border-amber-800" : "bg-[#FAF6F0]"
                }`}
              >
                <div className="aspect-square w-full rounded-xl border-2 border-black overflow-hidden mb-2 bg-black/5">
                  <Image
                    src={member.photoUrl || "/sample-images/patient_1_biren_borah/relatives/01_son_manash_borah.jpg"}
                    alt={member.name}
                    width={140}
                    height={140}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="inline-block rounded-md bg-amber-200 px-1.5 py-0.5 text-[9px] font-black text-amber-950 uppercase mb-0.5">
                  {member.relation}
                </span>
                <h4 className="font-serif font-black text-xs text-ink truncate">
                  {member.name}
                </h4>
                <p className="text-[10px] text-ink-secondary line-clamp-2 mt-0.5">
                  {member.notes}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. FAMILIAR CULTURAL PLACES */}
        <div className="rounded-3xl border-4 border-black bg-surface p-5 sm:p-6 shadow-[6px_6px_0px_#000] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-800" />
              <h2 className="font-serif text-xl font-black text-ink">
                {d18n.familiarPlacesTitle}
              </h2>
            </div>
            <span className="text-xs font-bold text-ink-secondary">
              {d18n.placesSub}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {p.familiarPlaces.map((place) => (
              <div
                key={place.id}
                onClick={() => {
                  setActivePlace(place.id);
                  handleSpeak(`${place.name}. ${place.description}`);
                }}
                className={`group rounded-2xl border-3 border-black p-3 cursor-pointer transition-all shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] flex flex-col justify-between ${
                  activePlace === place.id ? "bg-emerald-50 border-emerald-800" : "bg-[#FAF6F0]"
                }`}
              >
                <div>
                  <div className="aspect-[4/3] w-full rounded-xl border-2 border-black overflow-hidden mb-2 bg-black/5">
                    <Image
                      src={place.photoUrl || "/sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg"}
                      alt={place.name}
                      width={200}
                      height={150}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="inline-block rounded-md bg-emerald-200 px-1.5 py-0.5 text-[9px] font-black text-emerald-950 uppercase mb-1">
                    {place.category}
                  </span>
                  <h4 className="font-serif font-black text-xs sm:text-sm text-ink leading-tight">
                    {place.name}
                  </h4>
                  <p className="text-[11px] text-ink-secondary mt-1 line-clamp-3">
                    {place.description}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] font-black text-emerald-800">
                  <span>{d18n.tapToHear}</span>
                  <Volume2 className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. DAILY ROUTINE SCHEDULE & SAATHI COMPANION */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Daily Schedule */}
          <div className="rounded-3xl border-4 border-black bg-surface p-5 shadow-[6px_6px_0px_#000] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-800" />
                <h3 className="font-serif text-lg font-black text-ink">
                  {d18n.routineTitle}
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 rounded-xl border-2 border-black/20 bg-[#FAF6F0] p-2.5">
                  <span className="rounded-md bg-amber-200 px-2 py-0.5 font-mono font-black text-amber-950">
                    07:00 AM
                  </span>
                  <span className="font-bold text-ink">
                    {d18n.routineActivity1}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border-2 border-black/20 bg-[#FAF6F0] p-2.5">
                  <span className="rounded-md bg-emerald-200 px-2 py-0.5 font-mono font-black text-emerald-950">
                    10:30 AM
                  </span>
                  <span className="font-bold text-ink">
                    {d18n.routineActivity2}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border-2 border-black/20 bg-[#FAF6F0] p-2.5">
                  <span className="rounded-md bg-purple-200 px-2 py-0.5 font-mono font-black text-purple-950">
                    02:00 PM
                  </span>
                  <span className="font-bold text-ink">
                    {d18n.routineActivity3}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border-2 border-black/20 bg-[#FAF6F0] p-2.5">
                  <span className="rounded-md bg-teal-200 px-2 py-0.5 font-mono font-black text-teal-950">
                    06:00 PM
                  </span>
                  <span className="font-bold text-ink">
                    {d18n.routineActivity4}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-bold text-ink-secondary">
              <span className="flex items-center gap-1 text-emerald-700 font-black">
                <CheckCircle2 className="h-3.5 w-3.5" /> {d18n.routineCompleted}
              </span>
            </div>
          </div>

          {/* Saathi Voice Companion Card */}
          <div className="rounded-3xl border-4 border-black bg-surface p-5 shadow-[6px_6px_0px_#000]">
            <SaathiVoiceCompanion
              patientName={p.name}
              currentLocale={locale}
              familyMembers={p.familyMembers.map((r) => ({ name: r.name, relation: r.relation }))}
              familiarPlaces={p.familiarPlaces.map((pl) => ({ name: pl.name }))}
              joyTriggers={p.joyTriggers ?? undefined}
            />
          </div>
        </div>

        {/* 7. DAILY WELLBEING MOOD TRACKER */}
        <div className="rounded-3xl border-4 border-black bg-surface p-5 sm:p-6 shadow-[6px_6px_0px_#000]">
          <DailyMoodTracker
            lastMood={lastMood}
            onChooseMood={(m: MoodKey) => {
              setLastMood(m);
              handleSpeak(
                m === "peaceful"
                  ? "Feeling peaceful and calm with the sweet sounds of Assam."
                  : m === "okay"
                  ? "Feeling steady and balanced today."
                  : "Caregiver alert noted. Reaching out to Manash."
              );
            }}
            title={d18n.moodTitle}
            thanksMessage={d18n.moodThanks}
            moodLabels={{
              peaceful: d18n.moodPeaceful,
              okay: d18n.moodSteady,
              caretaker: d18n.moodHelp,
            }}
          />
        </div>
      </div>
    </div>
  );
}
