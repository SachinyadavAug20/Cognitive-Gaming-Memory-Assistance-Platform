"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import * as THREE from "three";
import {
  Sun,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  Image as ImageIcon,
  Compass,
  Award,
  Key,
  Check,
  CheckCircle2,
  Search,
  BookOpen,
  Lightbulb,
  Droplets,
  Sunrise,
  Speech,
  Train,
  Home,
  Building2,
  Sailboat,
  Car,
  Trees,
} from "lucide-react";
import { useGameVoice } from "@/hooks/useGameVoice";
import { api } from "@/lib/api";
import type { GameSessionPayload } from "@/types/gameSession";
import { playPress, playCorrect, playComplete, playMonasteryBell, unlockAudio } from "@/lib/sound";

export type DayChapter = 1 | 2 | 3 | 4 | 5 | 6;

interface CollectibleItem {
  id: "key" | "cap" | "bag";
  name: string;
  pos: [number, number, number];
  collected: boolean;
  mesh?: THREE.Group;
}

function ItemIcon({ id, className = "h-7 w-7" }: { id: string; className?: string }) {
  if (id === "key") return <Key className={`${className} text-amber-600`} />;
  if (id === "bag") return <ShoppingBag className={`${className} text-teal-700`} />;
  return <Compass className={`${className} text-indigo-600`} />;
}

interface DayWorldStrings {
  chapterOf: (c: number, total: number) => string;
  title: string;
  subTitle: string;
  voiceOn: string;
  muted: string;
  unmuteAria: string;
  muteAria: string;
  score: (s: number) => string;
  welcomeTitle: string;
  welcomeDesc: string;
  beginDayButton: string;
  finalDayCompleteTitle: string;
  finalDayCompleteDesc: string;
  reliveDayButton: string;
  backToHub: string;
  ch1Title: string;
  ch2Title: string;
  ch3Title: string;
  ch4Title: string;
  ch5Title: string;
  ch6Title: string;
  ch1ItemKey: string;
  ch1ItemCap: string;
  ch1ItemBag: string;
  ch1MemorizeTitle: string;
  ch1MemorizeDesc: string;
  ch1ReadyButton: string;
  ch1FindTitle: string;
  ch1TapDesc: string;
  ch1Collected: string;
  ch1TakeItem: (name: string) => string;
  ch2Prompt: string;
  ch2Subtext: string;
  ch2OptTrain: string;
  ch2OptCourtyard: string;
  ch2OptOffice: string;
  ch2FeedbackCorrect: string;
  ch2FeedbackRetry: string;
  ch3Question: string;
  ch3Subtext: string;
  ch3OptRiver: string;
  ch3OptHighway: string;
  ch3OptForest: string;
  ch3FeedbackCorrect: string;
  ch3FeedbackRetry: string;
  ch4Prompt: string;
  ch4Subtext: string;
  ch4ChangeOption: (amt: number) => string;
  ch4FeedbackCorrect: string;
  ch4FeedbackRetry: string;
  ch5Prompt: string;
  ch5Subtext: string;
  ch5OptRest: string;
  ch5OptRun: string;
  ch5FeedbackCorrect: string;
  ch5FeedbackRetry: string;
  ch6Prompt: string;
  ch6Subtext: string;
  ch6Step1: string;
  ch6Step2: string;
  ch6Step3: string;
  ch6Step4: string;
  ch6RecalledCount: (c: number) => string;
  saathiWakeup: string;
  ch1Complete: string;
  ch1FindPrompt: string;
  ch2Intro: string;
  ch2Success: string;
  ch3Intro: string;
  ch3Success: string;
  ch4Intro: string;
  ch4Success: string;
  ch5Intro: string;
  ch5Success: string;
  ch6Intro: string;
  completionVoice: string;
}

const DAY_WORLD_I18N: Record<string, DayWorldStrings> = {
  en: {
    chapterOf: (c, t) => `Chapter ${c} of ${t}`,
    title: "A Day in My World",
    subTitle: "Reminiscence & Routine Recall",
    voiceOn: "Voice ON",
    muted: "Muted",
    unmuteAria: "Unmute Voice",
    muteAria: "Mute Voice",
    score: (s) => `Score: ${s}`,
    welcomeTitle: "A Morning to Remember",
    welcomeDesc: "The morning sun fills the room with gentle warmth. Saathi is here to walk with you through every moment of the day.",
    beginDayButton: "Begin Morning Journey",
    finalDayCompleteTitle: "Journey Complete: The Memory Restored",
    finalDayCompleteDesc: "You completed the entire 6-chapter journey alongside Saathi with flying colors.",
    reliveDayButton: "Relive the Day Again",
    backToHub: "← Back to Therapy Suite",
    ch1Title: "Morning Memory",
    ch2Title: "The Missing Photograph",
    ch3Title: "The Way to the Market",
    ch4Title: "The Market Mission",
    ch5Title: "Afternoon Routine",
    ch6Title: "The Sunset Memory",
    ch1ItemKey: "House Key",
    ch1ItemCap: "Sun Cap",
    ch1ItemBag: "Cloth Bag",
    ch1MemorizeTitle: "Remember These Three Essentials",
    ch1MemorizeDesc: "Take a moment to look at your Key, Cap, and Cloth Bag before leaving the room.",
    ch1ReadyButton: "I've Memorized Them",
    ch1FindTitle: "Find & Pick Up the 3 Items",
    ch1TapDesc: "Tap each item to collect it into your bag:",
    ch1Collected: "Collected",
    ch1TakeItem: (name) => `Take ${name}`,
    ch2Prompt: "Choose the Family Photo for the Album",
    ch2Subtext: "Look at the options and choose the peaceful courtyard family gathering.",
    ch2OptTrain: "Busy Train Station",
    ch2OptCourtyard: "Majuli Family Courtyard",
    ch2OptOffice: "Office Meeting Room",
    ch2FeedbackCorrect: "Correct! The beautiful Majuli family reunion photo!",
    ch2FeedbackRetry: "Take a closer look at the traditional courtyard picture.",
    ch3Question: "Choose the Riverbank Path",
    ch3Subtext: "You pass by the red Namghar temple. Which path leads to the river marketplace?",
    ch3OptRiver: "Riverbank Path (Along Brahmaputra)",
    ch3OptHighway: "Highway Overpass",
    ch3OptForest: "Dark Forest Trail",
    ch3FeedbackCorrect: "Correct! The peaceful riverbank road leading straight to the bazaar!",
    ch3FeedbackRetry: "That path leads to the forest hills. Choose the riverbank road.",
    ch4Prompt: "Calculate the Correct Change",
    ch4Subtext: "Items bought: Assam Tea (₹60) + Joha Rice (₹80) = ₹140 Total. You give the shopkeeper a ₹200 note. What change should you receive?",
    ch4ChangeOption: (amt) => `₹${amt} Change`,
    ch4FeedbackCorrect: "Correct! ₹200 - ₹140 = ₹60 returned perfectly!",
    ch4FeedbackRetry: "Total bill is ₹140 (₹60 tea + ₹80 rice). Out of ₹200, what is left?",
    ch5Prompt: "Afternoon Rest & Hydration",
    ch5Subtext: "You have walked home with your fresh tea. What is the best step right now?",
    ch5OptRest: "Drink a glass of water & rest on verandah",
    ch5OptRun: "Go outside and run immediately",
    ch5FeedbackCorrect: "Perfect! Hydrating with clean water and relaxing on the verandah!",
    ch5FeedbackRetry: "After a warm morning walk, resting and drinking water is recommended.",
    ch6Prompt: "Reconstruct Your Day Chronologically",
    ch6Subtext: "Tap each memory in order from morning to evening:",
    ch6Step1: "1. Morning Keys & Bag",
    ch6Step2: "2. Majuli Family Photo",
    ch6Step3: "3. River Market Walk",
    ch6Step4: "4. Sunset Verandah Rest",
    ch6RecalledCount: (c) => `${c} of 4 moments recalled!`,
    saathiWakeup: "Good morning! Let us remember the day together.",
    ch1Complete: "Splendid! You have collected all three morning essentials.",
    ch1FindPrompt: "Now find your key, cap, and bag around the house to get ready for the day.",
    ch2Intro: "Before we head outside, let us place the right family memory into the album.",
    ch2Success: "Wonderful! The family album is whole again.",
    ch3Intro: "Let us stroll down to the village market along the riverbank path.",
    ch3Success: "Excellent navigation! We have reached the market stalls safely.",
    ch4Intro: "Time to buy fresh groceries with our budget.",
    ch4Success: "Exact calculation! Your basket is packed with fresh groceries.",
    ch5Intro: "Back at home, let us complete our afternoon relaxation routine.",
    ch5Success: "Very well done! You are refreshed and well-rested.",
    ch6Intro: "As the sun sets, let us recount our day's journey from morning to evening.",
    completionVoice: "Wonderful journey! You have reconstructed your entire day with clarity and peace.",
  },
  as: {
    chapterOf: (c, t) => `অধ্যায় ${c} (${t} ৰ ভিতৰত)`,
    title: "মোৰ পৃথিৱীৰ এটি দিন",
    subTitle: "স্মৃতি সোঁৱৰণ আৰু দিনচৰ্যা",
    voiceOn: "শব্দ অন",
    muted: "শব্দ বন্ধ",
    unmuteAria: "শব্দ শুনক",
    muteAria: "শব্দ বন্ধ কৰক",
    score: (s) => `নম্বৰ: ${s}`,
    welcomeTitle: "এটি স্মৃতিময় সুপ্ৰভাত",
    welcomeDesc: "ৰাতিপুৱাৰ সোণালী ৰ’দে কোঠাটো ভৰাই তুলিছে। সাৰথি আজি গোটেই দিনটো আপোনাৰ লগত খোজ কাঢ়িবলৈ সাজু।",
    beginDayButton: "ৰাতিপুৱাৰ যাত্ৰা আৰম্ভ কৰক",
    finalDayCompleteTitle: "যাত্ৰা সম্পন্ন: স্মৃতিৰ সুন্দৰ পুনৰুদ্ধাৰ",
    finalDayCompleteDesc: "আপুনি সাৰথিৰ সৈতে অতি সফলতাৰে ৬ টা অধ্যায়ৰ যাত্ৰা সম্পন্ন কৰিলে।",
    reliveDayButton: "দিনটো পুনৰ অনুভৱ কৰক",
    backToHub: "← থেৰাপী কক্ষলৈ উভতি যাওক",
    ch1Title: "ৰাতিপুৱাৰ স্মৃতি",
    ch2Title: "হেৰোৱা আলোকচিত্ৰ",
    ch3Title: "বজাৰলৈ যোৱা বাট",
    ch4Title: "বজাৰৰ দায়িত্ব",
    ch5Title: "দুপৰীয়াৰ বিশ্ৰাম",
    ch6Title: "গধূলিৰ স্মৃতি সাঁচন",
    ch1ItemKey: "ঘৰৰ চাবি",
    ch1ItemCap: "ৰ’দৰ টুপি",
    ch1ItemBag: "কাপোৰৰ মোনা",
    ch1MemorizeTitle: "এই ৩ বিধ প্ৰয়োজনীয় বস্তু মনত ৰাখক",
    ch1MemorizeDesc: "কোঠাৰ পৰা ওলোৱাৰ আগতে চাবি, টুপি আৰু মোনাটো ভালদৰে চাই মনত ৰাখক।",
    ch1ReadyButton: "মোৰ মনত আছে",
    ch1FindTitle: "বস্তু ৩ বিধ বিচাৰি হাতত লওক",
    ch1TapDesc: "মোনাৰ ভিতৰত ভৰাবলৈ প্ৰতিটো বস্তুত টিপক:",
    ch1Collected: "সংগ্ৰহ কৰা হ’ল",
    ch1TakeItem: (name) => `${name} লওক`,
    ch2Prompt: "এলবামৰ বাবে পৰিয়ালৰ ছবিখন বাছক",
    ch2Subtext: "বিকল্পবোৰ চাই চোতালত একেলগে বহা পৰিয়ালৰ শান্ত ছবিখন নিৰ্বাচন কৰক।",
    ch2OptTrain: "ব্যস্ত ৰে'ল ষ্টেচন",
    ch2OptCourtyard: "মাজুলীৰ পৰিয়ালৰ চোতাল",
    ch2OptOffice: "কাৰ্যালয়ৰ সভা কোঠা",
    ch2FeedbackCorrect: "সঠিক! মাজুলীৰ পৰিয়ালৰ মিলনৰ অপূৰ্ব ছবিখন!",
    ch2FeedbackRetry: "পাৰম্পৰিক চোতালৰ ছবিখনলৈ আৰু এবাৰ ভালদৰে চাওক।",
    ch3Question: "নদীৰ পাৰৰ বাটটো বাছক",
    ch3Subtext: "আপুনি ৰঙা নামঘৰটো পাৰ হৈ আহিছে। নদীৰ বজাৰলৈ কোনটো বাটেৰে যাব?",
    ch3OptRiver: "নৈৰ পাৰৰ বাট (ব্ৰহ্মপুত্ৰৰ কাষেৰে)",
    ch3OptHighway: "ডাঙৰ পকী ঘাইপথ",
    ch3OptForest: "ঘন জংঘলৰ কেঁচা আলি",
    ch3FeedbackCorrect: "সঠিক উত্তৰ! নদীৰ কাষেৰে পোনে পোনে বজাৰলৈ যোৱা শান্ত বাট!",
    ch3FeedbackRetry: "সেই বাটটো পাহাৰলৈ যায়। নদীৰ কাষৰ বাটটো বাছক।",
    ch4Prompt: "উভতি পোৱা পইচাৰ সঠিক হিচাপ কৰক",
    ch4Subtext: "কিনা সামগ্ৰী: অসম চাহ (₹৬০) + জহা চাউল (₹৮০) = মুঠ ₹১৪০। আপুনি দোকানীজনক ₹২০০ টকা দিলে। দোকানীয়ে কিমান ঘূৰাই দিব লাগিব?",
    ch4ChangeOption: (amt) => `₹${amt} ঘূৰাই পাব`,
    ch4FeedbackCorrect: "একদম সঠিক! ₹২০০ - ₹১৪০ = ₹৬০ সঠিকভাৱে ঘূৰাই পোৱা গ’ল!",
    ch4FeedbackRetry: "মুঠ বিল ₹১৪০ (₹৬০ চাহ + ₹৮০ চাউল)। ₹২০০ ৰ পৰা কিমান বাকী থাকে?",
    ch5Prompt: "দুপৰীয়াৰ বিশ্ৰাম আৰু পানী গ্ৰহণ",
    ch5Subtext: "বজাৰৰ পৰা সতেজ চাহ লৈ আপুনি ঘৰ পালেহি। এতিয়া আটাইতকৈ উচিত কাম কি?",
    ch5OptRest: "এগিলাচ পানী খাই বাৰাণ্ডাত জিৰণি লোৱা",
    ch5OptRun: "লগে লগে বাহিৰলৈ গৈ দৌৰা",
    ch5FeedbackCorrect: "বৰ সুন্দৰ! বিশুদ্ধ পানী খোৱা আৰু বাৰাণ্ডাত শান্তিপূৰ্ণ জিৰণি লোৱা!",
    ch5FeedbackRetry: "খোজ কাঢ়ি অহাৰ পিছত জিৰণি লোৱা আৰু পানী খোৱাটো স্বাস্থ্যৰ বাবে ভাল।",
    ch6Prompt: "দিনটোৰ স্মৃতিসমূহ ক্ৰমানুসাৰে সজাওক",
    ch6Subtext: "ৰাতিপুৱাৰ পৰা গধূলিলৈকে ক্ৰম অনুসৰি প্ৰতিটো স্মৃতিত টিপক:",
    ch6Step1: "১. ৰাতিপুৱাৰ চাবি আৰু মোনা",
    ch6Step2: "২. মাজুলীৰ পৰিয়ালৰ ফটো",
    ch6Step3: "৩. নদীৰ কাষৰ বজাৰলৈ খোজ",
    ch6Step4: "৪. বেলি লহিওৱা সময়ত বাৰাণ্ডাত জিৰণি",
    ch6RecalledCount: (c) => `৪ টাৰ ভিতৰত ${c} টা স্মৃতি ক্ৰমত সজোৱা হ’ল!`,
    saathiWakeup: "সুপ্ৰভাত! চিন্তা নকৰিব, আহক আমি দিনটোৰ স্মৃতি একেলগে সোঁৱৰণ কৰোঁ।",
    ch1Complete: "বৰ ধুনীয়া! আপুনি ৰাতিপুৱাৰ তিনিওবিধ প্ৰয়োজনীয় সামগ্ৰী সংগ্ৰহ কৰিলে।",
    ch1FindPrompt: "এতিয়া দিনটো আৰম্ভ কৰিবলৈ ঘৰৰ পৰা চাবি, টুপি আৰু মোনাটো তুলি লওক।",
    ch2Intro: "বাহিৰলৈ যোৱাৰ আগতে আহক পৰিয়ালৰ সঠিক ছবিখন এলবামখনত সজাওঁ।",
    ch2Success: "বৰ আনন্দৰ কথা! পৰিয়ালৰ এলবামখন আকৌ পূৰ্ণ হ’ল।",
    ch3Intro: "আহক নদীৰ কাষৰ সুন্দৰ বাটেৰে গাঁৱৰ বজাৰখনলৈ যাওঁ।",
    ch3Success: "চমৎকার বাট চিনিলে! আমি বজাৰত সুকলমে উপস্থিত হ’লোঁ।",
    ch4Intro: "আমাৰ হাতত থকা ধনেৰে ঘৰুৱা খাদ্য-সামগ্ৰী কিনাৰ সময় হ’ল।",
    ch4Success: "নিখুঁত হিচাপ! আপোনাৰ মোনাখন সতেজ বস্তুৰে ভৰি পৰিল।",
    ch5Intro: "ঘৰলৈ ঘূৰি আহি আহক দুপৰীয়াৰ শান্ত বিশ্ৰাম লওঁ।",
    ch5Success: "অতি উত্তম! জিৰণি আৰু পানীয়ে আপোনাক সতেজ কৰি তুলিলে।",
    ch6Intro: "বেলি লহিওৱাৰ লগে লগে আহক ৰাতিপুৱাৰ পৰা গধূলিলৈ দিনটোৰ যাত্ৰা সোঁৱৰণ কৰোঁ।",
    completionVoice: "অপূৰ্ব যাত্ৰা! আপুনি অতি শান্ত আৰু স্পষ্টভাৱে সম্পূৰ্ণ দিনটো সোঁৱৰণ কৰিলে।",
  },
  hi: {
    chapterOf: (c, t) => `अध्याय ${c} (${t} में से)`,
    title: "मेरी दुनिया का एक दिन",
    subTitle: "स्मृति संस्मरण एवं दिनचर्या",
    voiceOn: "आवाज़ चालू",
    muted: "आवाज़ बंद",
    unmuteAria: "आवाज़ सुनें",
    muteAria: "आवाज़ म्यूट करें",
    score: (s) => `अंक: ${s}`,
    welcomeTitle: "एक यादगार प्रभात",
    welcomeDesc: "सुबह की सुनहरी धूप कमरे में सौम्य गर्माहट भर रही है। साथी आपके साथ दिन के हर पल को याद करने के लिए तैयार है।",
    beginDayButton: "सुबह की यात्रा शुरू करें",
    finalDayCompleteTitle: "यात्रा पूर्ण: स्मृतियों की सुंदर पुनर्बहाली",
    finalDayCompleteDesc: "आपने साथी के साथ सभी ६ अध्यायों की यात्रा बड़े स्नेह और सफलता के साथ पूरी की।",
    reliveDayButton: "दिन को फिर से जीएं",
    backToHub: "← चिकित्सा कक्ष में वापस",
    ch1Title: "सुबह की यादें",
    ch2Title: "खोई हुई तस्वीर",
    ch3Title: "बाज़ार का रास्ता",
    ch4Title: "बाज़ार की खरीदारी",
    ch5Title: "दोपहर का विश्राम",
    ch6Title: "संध्या की स्मृतियां",
    ch1ItemKey: "घर की चाबी",
    ch1ItemCap: "धूप की टोपी",
    ch1ItemBag: "कपड़े का थैला",
    ch1MemorizeTitle: "इन ३ ज़रूरी चीज़ों को याद रखें",
    ch1MemorizeDesc: "कमरे से बाहर जाने से पहले अपनी चाबी, टोपी और थैले को ध्यान से देख लें।",
    ch1ReadyButton: "मुझे याद हो गया",
    ch1FindTitle: "तीनों चीज़ों को ढूंढकर उठाएं",
    ch1TapDesc: "थैले में रखने के लिए प्रत्येक वस्तु पर टैप करें:",
    ch1Collected: "एकत्रित",
    ch1TakeItem: (name) => `${name} लें`,
    ch2Prompt: "एल्बम के लिए परिवार की तस्वीर चुनें",
    ch2Subtext: "विकल्पों को देखकर आंगन में बैठे परिवार के सुखद मिलन की तस्वीर चुनें।",
    ch2OptTrain: "व्यस्त रेलवे स्टेशन",
    ch2OptCourtyard: "माजुली का पारिवारिक आंगन",
    ch2OptOffice: "कार्यालय का सभा कक्ष",
    ch2FeedbackCorrect: "सही! माजुली के परिवार के सुंदर मिलन की तस्वीर!",
    ch2FeedbackRetry: "पारंपरिक आंगन वाली तस्वीर को और ध्यान से देखें।",
    ch3Question: "नदी किनारे का रास्ता चुनें",
    ch3Subtext: "आप लाल नामघर मंदिर के पास से गुज़र रहे हैं। नदी के बाज़ार तक कौन सा रास्ता जाता है?",
    ch3OptRiver: "नदी किनारे का रास्ता (ब्रह्मपुत्र के साथ)",
    ch3OptHighway: "बड़ा राजमार्ग ओवरपास",
    ch3OptForest: "घने जंगल की पगडंडी",
    ch3FeedbackCorrect: "बिल्कुल सही! नदी किनारे का शांत रास्ता जो सीधा बाज़ार ले जाता है!",
    ch3FeedbackRetry: "वह रास्ता जंगल की पहाड़ियों की ओर जाता है। नदी किनारे का रास्ता चुनें।",
    ch4Prompt: "बचे हुए पैसों का सही हिसाब करें",
    ch4Subtext: "सामान खरीदा: असम चाय (₹६०) + जोहा चावल (₹८०) = कुल ₹१४०। आपने दुकानदार को ₹२०० का नोट दिया। आपको कितने रुपये वापस मिलने चाहिए?",
    ch4ChangeOption: (amt) => `₹${amt} वापस`,
    ch4FeedbackCorrect: "बिल्कुल सही! ₹२०० - ₹१४० = ₹६० एकदम सही बचे!",
    ch4FeedbackRetry: "कुल बिल ₹१४० है (₹६० चाय + ₹८० चावल)। ₹२०० में से कितना बचा?",
    ch5Prompt: "दोपहर का विश्राम और जलपान",
    ch5Subtext: "आप ताज़ी चाय लेकर घर आ गए हैं। इस समय सबसे अच्छा कदम क्या है?",
    ch5OptRest: "एक गिलास पानी पिएं और बरामदे में आराम करें",
    ch5OptRun: "तुरंत बाहर जाकर दौड़ें",
    ch5FeedbackCorrect: "बहुत बढ़िया! शीतल जल पीना और बरामदे में शांत विश्राम करना!",
    ch5FeedbackRetry: "धूप में चलने के बाद पानी पीना और विश्राम करना सेहत के लिए सबसे अच्छा है।",
    ch6Prompt: "दिन के पलों को क्रमानुसार सजाएं",
    ch6Subtext: "सुबह से शाम तक के क्रम में प्रत्येक स्मृति पर टैप करें:",
    ch6Step1: "१. सुबह की चाबी और थैला",
    ch6Step2: "२. माजुली परिवार की तस्वीर",
    ch6Step3: "३. नदी किनारे बाज़ार की सैर",
    ch6Step4: "४. सूर्यास्त पर बरामदे में विश्राम",
    ch6RecalledCount: (c) => `४ में से ${c} पल क्रमानुसार सजाए गए!`,
    saathiWakeup: "सुप्रभात! चिंता न करें, हम मिलकर दिन की स्मृतियों को याद करेंगे।",
    ch1Complete: "अति उत्तम! आपने सुबह की तीनों आवश्यक वस्तुएं एकत्र कर लीं।",
    ch1FindPrompt: "अब दिन की शुरुआत के लिए चाबी, टोपी और थैला उठा लें।",
    ch2Intro: "बाहर जाने से पहले आइए सही पारिवारिक तस्वीर को एल्बम में लगाएं।",
    ch2Success: "बहुत सुंदर! परिवार का एल्बम फिर से पूरा हो गया।",
    ch3Intro: "आइए नदी किनारे के सुंदर रास्ते से गांव के बाज़ार की ओर चलें।",
    ch3Success: "शानदार दिशा-बोध! हम सुरक्षित रूप से बाज़ार पहुंच गए हैं।",
    ch4Intro: "आइए अपने बजट से ताज़ा घरेलू सामान खरीदें।",
    ch4Success: "सटीक गणना! आपका थैला ताज़ा सामान से भर गया है।",
    ch5Intro: "घर लौटकर आइए दोपहर का सुखद विश्राम लें।",
    ch5Success: "बहुत अच्छे! विश्राम और पानी से आप तरोताज़ा हो गए हैं।",
    ch6Intro: "सूरज ढलने पर आइए सुबह से शाम तक की पूरी यात्रा को याद करें।",
    completionVoice: "शानदार यात्रा! आपने पूरे दिन को स्पष्टता और शांति के साथ याद किया।",
  },
  bn: {
    chapterOf: (c, t) => `অধ্যায় ${c} (${t} এর মধ্যে)`,
    title: "আমার পৃথিবীর একটি দিন",
    subTitle: "স্মৃতি রোমন্থন ও দৈনন্দিন রুটিন",
    voiceOn: "শব্দ চালু",
    muted: "শব্দ বন্ধ",
    unmuteAria: "শব্দ শুনুন",
    muteAria: "শব্দ মিউট করুন",
    score: (s) => `স্কোর: ${s}`,
    welcomeTitle: "একটি স্মরণীয় সকাল",
    welcomeDesc: "সকালের মিষ্টি রোদ ঘর ভরিয়ে তুলেছে। সারথি আপনার সাথে প্রতিটি মুহূর্ত ভাগ করে নিতে প্রস্তুত।",
    beginDayButton: "সকালের যাত্রা শুরু করুন",
    finalDayCompleteTitle: "যাত্রা সম্পূর্ণ: স্মৃতির সুন্দর পুনরুদ্ধার",
    finalDayCompleteDesc: "আপনি সারথির সাথে সম্পূর্ণ ৬টি অধ্যায় আনন্দের সাথে সফলভাবে শেষ করেছেন।",
    reliveDayButton: "দিনটি পুনরায় অনুভব করুন",
    backToHub: "← থেরাপি কেন্দ্রে ফিরে যান",
    ch1Title: "সকালের স্মৃতি",
    ch2Title: "হারানো ছবি",
    ch3Title: "বাজারের পথ",
    ch4Title: "বাজারের কেনাকাটা",
    ch5Title: "দুপুরের বিশ্রাম",
    ch6Title: "সূর্যাস্তের স্মৃতি",
    ch1ItemKey: "ঘরের চাবি",
    ch1ItemCap: "রোদের টুপি",
    ch1ItemBag: "কাপড়ের থলি",
    ch1MemorizeTitle: "এই ৩টি প্রয়োজনীয় জিনিস মনে রাখুন",
    ch1MemorizeDesc: "ঘর থেকে বের হওয়ার আগে চাবি, টুপি ও থলিটি ভালো করে দেখে মনে রাখুন।",
    ch1ReadyButton: "আমি মনে রেখেছি",
    ch1FindTitle: "জিনিস ৩টি খুঁজে তুলে নিন",
    ch1TapDesc: "ব্যাগে রাখার জন্য প্রতিটি জিনিসে স্পর্শ করুন:",
    ch1Collected: "সংগৃহীত",
    ch1TakeItem: (name) => `${name} নিন`,
    ch2Prompt: "অ্যালবামের জন্য পরিবারের ছবিটি বাছুন",
    ch2Subtext: "বিকল্পগুলি দেখে উঠোনে পরিবারের শান্ত মুহূর্তের ছবিটি বেছে নিন।",
    ch2OptTrain: "ব্যস্ত রেল স্টেশন",
    ch2OptCourtyard: "মাজুলির পরিবারের উঠোন",
    ch2OptOffice: "অফিসের সভা কক্ষ",
    ch2FeedbackCorrect: "সঠিক! মাজুলির পরিবারের মিলনের অপূর্ব ছবি!",
    ch2FeedbackRetry: "ঐতিহ্যবাহী উঠোনের ছবিটি আর একবার ভালো করে দেখুন।",
    ch3Question: "নদীর তীরের পথটি বেছে নিন",
    ch3Subtext: "আপনি লাল নামঘরের পাশ দিয়ে যাচ্ছেন। কোন পথটি নদীর বাজারে নিয়ে যায়?",
    ch3OptRiver: "নদীর তীরের পথ (ব্রহ্মপুত্রের ধার দিয়ে)",
    ch3OptHighway: "বড় রাজপথ ওভারপাস",
    ch3OptForest: "গভীর বনের কাঁচা পথ",
    ch3FeedbackCorrect: "সঠিক! নদী তীরের শান্ত পথ যা সরাসরি বাজারে পৌঁছে দেয়!",
    ch3FeedbackRetry: "ওই পথটি পাহাড়ের দিকে যায়। নদীর ধারের পথটি বাছুন।",
    ch4Prompt: "ফেরত টাকার সঠিক হিসাব করুন",
    ch4Subtext: "কেনা জিনিস: আসাম চা (₹৬০) + জোহা চাল (₹৮০) = মোট ₹১৪০। আপনি দোকানদারকে ₹২০০ টাকার নোট দিলেন। কত টাকা ফেরত পাবেন?",
    ch4ChangeOption: (amt) => `₹${amt} ফেরত`,
    ch4FeedbackCorrect: "একদম সঠিক! ₹২০০ - ₹১৪০ = ₹৬০ সঠিকভাবে ফেরত এল!",
    ch4FeedbackRetry: "মোট বিল ₹১৪০ (₹৬০ চা + ₹৮০ চাল)। ₹২০০ থেকে কত বাকি থাকে?",
    ch5Prompt: "দুপুরের বিশ্রাম ও জলপান",
    ch5Subtext: "তাজা চা নিয়ে আপনি বাড়ি ফিরেছেন। এখন সবচেয়ে ভালো পদক্ষেপ কোনটি?",
    ch5OptRest: "এক গ্লাস জল খেয়ে বারান্দায় বিশ্রাম নেওয়া",
    ch5OptRun: "তৎক্ষণাৎ বাইরে গিয়ে দৌড়ানো",
    ch5FeedbackCorrect: "খুব ভালো! বিশুদ্ধ জল পান করা এবং বারান্দায় শান্ত বিশ্রাম নেওয়া!",
    ch5FeedbackRetry: "হাঁটার পরে বিশ্রাম নেওয়া এবং জল পান করা স্বাস্থ্যের পক্ষে উত্তম।",
    ch6Prompt: "দিনের স্মৃতিগুলি ক্রমানুসারে সাজান",
    ch6Subtext: "সকাল থেকে সন্ধ্যা পর্যন্ত প্রতিটি স্মৃতিতে পর্যায়ক্রমে চাপুন:",
    ch6Step1: "১. সকালের চাবি ও থলি",
    ch6Step2: "২. মাজুলির পারিবারিক ছবি",
    ch6Step3: "৩. নদী তীরের বাজারে হাঁটা",
    ch6Step4: "৪. সূর্যাস্তে বারান্দায় বিশ্রাম",
    ch6RecalledCount: (c) => `৪টির মধ্যে ${c}টি স্মৃতি সাজানো হয়েছে!`,
    saathiWakeup: "সুপ্রভাত! কোনো চিন্তা নেই, আসুন একসাথে আজকের দিনটি মনে করি।",
    ch1Complete: "চমৎকার! আপনি সকালের তিনটি প্রয়োজনীয় সামগ্রী সংগ্রহ করেছেন।",
    ch1FindPrompt: "এবার দিন শুরু করার জন্য ঘরের চারপাশ থেকে চাবি, টুপি ও ব্যাগ তুলে নিন।",
    ch2Intro: "বাইরে বেরোনোর আগে আসুন অ্যালবামে সঠিক পারিবারিক ছবিটি সাজাই।",
    ch2Success: "খুব আনন্দদায়ক! পারিবারিক অ্যালবাম আবার সম্পূর্ণ হলো।",
    ch3Intro: "আসুন নদীর ধারের সুন্দর পথ ধরে গ্রামের বাজারের দিকে যাই।",
    ch3Success: "চমৎকার পথ চিনেছেন! আমরা নিরাপদে বাজারে পৌঁছে গেছি।",
    ch4Intro: "আমাদের বাজেট থেকে তাজা জিনিসপত্র কেনার সময় হয়েছে।",
    ch4Success: "নিখুঁত হিসাব! আপনার থলি তাজা জিনিসে ভরে গেছে।",
    ch5Intro: "বাড়ি ফিরে আসুন দুপুরের শান্ত বিশ্রাম নেওয়া যাক।",
    ch5Success: "খুব ভালো! বিশ্রাম এবং জল আপনাকে সতেজ করে তুলেছে।",
    ch6Intro: "সূর্য ডোবার সাথে সাথে আসুন সকাল থেকে সন্ধ্যার পুরো যাত্রাটি মনে করি।",
    completionVoice: "অপূর্ব যাত্রা! আপনি সম্পূর্ণ দিনটি স্পষ্টতা ও শান্তির সাথে স্মরণ করলেন।",
  },
  mr: {
    chapterOf: (c, t) => `प्रकरण ${c} (${t} पैकी)`,
    title: "माझ्या विश्वातील एक दिवस",
    subTitle: "स्मृती पुनरुज्जीवन आणि दिनचर्या",
    voiceOn: "आवाज चालू",
    muted: "आवाज बंद",
    unmuteAria: "आवाज ऐका",
    muteAria: "आवाज बंद करा",
    score: (s) => `गुण: ${s}`,
    welcomeTitle: "एक संस्मरणीय प्रभात",
    welcomeDesc: "सकाळचे कोवळे ऊन खोलीत आनंद पसरवत आहे. साथी तुमच्यासोबत दिवसाचा प्रत्येक क्षण आठवण्यासाठी सज्ज आहे.",
    beginDayButton: "सकाळचा प्रवास सुरू करा",
    finalDayCompleteTitle: "प्रवास पूर्ण: स्मृतींची सुंदर पुनर्स्थापना",
    finalDayCompleteDesc: "तुम्ही साथीसोबत सर्व ६ प्रकरणांचा प्रवास अत्यंत कौशल्याने पूर्ण केला.",
    reliveDayButton: "दिवस पुन्हा अनुभवा",
    backToHub: "← थेरपी कक्षाकडे परत",
    ch1Title: "सकाळची आठवण",
    ch2Title: "हरवलेले छायाचित्र",
    ch3Title: "बाजाराची वाट",
    ch4Title: "बाजारातील खरेदी",
    ch5Title: "दुपारची विश्रांती",
    ch6Title: "संध्याकाळची आठवण",
    ch1ItemKey: "घराची किल्ली",
    ch1ItemCap: "उन्हाची टोपी",
    ch1ItemBag: "कापडी पिशवी",
    ch1MemorizeTitle: "या ३ आवश्यक वस्तू लक्षात ठेवा",
    ch1MemorizeDesc: "खोलीबाहेर पडण्यापूर्वी किल्ली, टोपी आणि पिशवी नीट पाहून लक्षात ठेवा.",
    ch1ReadyButton: "माझ्या लक्षात राहिले",
    ch1FindTitle: "३ वस्तू शोधून उचला",
    ch1TapDesc: "पिशवीत भरण्यासाठी प्रत्येक वस्तूवर टॅप करा:",
    ch1Collected: "गोळा केले",
    ch1TakeItem: (name) => `${name} घ्या`,
    ch2Prompt: "अल्बमसाठी कौटुंबिक छायाचित्र निवडा",
    ch2Subtext: "पर्याय पाहा आणि अंगणातील कुटुंबाच्या शांत एकत्र बसलेल्या फोटोची निवड करा.",
    ch2OptTrain: "गजबजलेले रेल्वे स्थानक",
    ch2OptCourtyard: "माजुलीतील कौटुंबिक अंगण",
    ch2OptOffice: "कार्यालयीन बैठक कक्ष",
    ch2FeedbackCorrect: "बरोबर! माजुलीतील कौटुंबिक मेळाव्याचा सुंदर फोटो!",
    ch2FeedbackRetry: "पारंपरिक अंगणातील फोटोकडे अधिक बारकाईने पाहा.",
    ch3Question: "नदीकाठचा रस्ता निवडा",
    ch3Subtext: "तुम्ही लाल नामघर मंदिरावरून जात आहात. नदीच्या बाजाराकडे कोणता रस्ता जातो?",
    ch3OptRiver: "नदीकाठचा रस्ता (ब्रह्मपुत्रेच्या कडेने)",
    ch3OptHighway: "मोठा महामार्ग ओव्हरपास",
    ch3OptForest: "दाट जंगलाची पायवाट",
    ch3FeedbackCorrect: "बरोबर! नदीकाठचा शांत रस्ता जो थेट बाजाराकडे घेऊन जातो!",
    ch3FeedbackRetry: "तो रस्ता जंगलाच्या टेकड्यांकडे जातो. नदीकाठचा मार्ग निवडा.",
    ch4Prompt: "उरलेल्या पैशांचा अचूक हिशोब करा",
    ch4Subtext: "वस्तू खरेदी: आसाम चहा (₹६०) + जोहा तांदूळ (₹८०) = एकूण ₹१४०. तुम्ही दुकानदाराला ₹२०० ची नोट दिली. तुम्हाला किती पैसे परत मिळायला हवेत?",
    ch4ChangeOption: (amt) => `₹${amt} परत`,
    ch4FeedbackCorrect: "अगदी बरोबर! ₹२०० - ₹१४० = ₹६० योग्य प्रकारे परत मिळाले!",
    ch4FeedbackRetry: "एकूण बिल ₹१४० आहे (₹६० चहा + ₹८० तांदूळ). ₹२०० मधून किती उरतात?",
    ch5Prompt: "दुपारची विश्रांती आणि पाणी पिणे",
    ch5Subtext: "ताजा चहा घेऊन तुम्ही घरी पोहोचला आहात. आता सर्वात योग्य कृती कोणती?",
    ch5OptRest: "एक ग्लास पाणी पिणे आणि व्हरांड्यात आराम करणे",
    ch5OptRun: "लगेच बाहेर जाऊन धावणे",
    ch5FeedbackCorrect: "उत्तम! शुद्ध पाणी पिणे आणि व्हरांड्यात शांत विश्रांती घेणे!",
    ch5FeedbackRetry: "उन्हात चालून आल्यानंतर विश्रांती घेणे आणि पाणी पिणे आरोग्यासाठी चांगले आहे.",
    ch6Prompt: "दिवसाचे क्षण कालक्रमानुसार लावा",
    ch6Subtext: "सकाळपासून संध्याकाळपर्यंत क्रमाने प्रत्येक आठवणीवर टॅप करा:",
    ch6Step1: "१. सकाळची किल्ली आणि पिशवी",
    ch6Step2: "२. माजुलीचा कौटुंबिक फोटो",
    ch6Step3: "३. नदीकाठच्या बाजारात चालणे",
    ch6Step4: "४. सूर्यास्ताच्या वेळी व्हरांड्यात विश्रांती",
    ch6RecalledCount: (c) => `४ पैकी ${c} क्षण क्रमाने आठवले!`,
    saathiWakeup: "सुप्रभात! काळजी करू नका, आपण मिळून दिवसाच्या आठवणी ताज्या करूया.",
    ch1Complete: "उत्कृष्ट! तुम्ही सकाळच्या तीनही आवश्यक वस्तू गोळा केल्या.",
    ch1FindPrompt: "आता दिवसाची सुरुवात करण्यासाठी किल्ली, टोपी आणि पिशवी उचलून घ्या.",
    ch2Intro: "बाहेर पडण्यापूर्वी योग्य कौटुंबिक आठवण अल्बममध्ये लावूया.",
    ch2Success: "खूप छान! कौटुंबिक अल्बम पुन्हा पूर्ण झाला.",
    ch3Intro: "चला नदीकाठच्या शांत वाटेने गावाच्या बाजाराकडे जाऊया.",
    ch3Success: "उत्कृष्ट दिशाज्ञान! आपण सुखरूपपणे बाजारात पोहोचलो आहोत.",
    ch4Intro: "आपल्या बजेटमधून ताजा किराणा सामान खरेदी करण्याची वेळ आली आहे.",
    ch4Success: "अचूक हिशोब! तुमची पिशवी ताज्या वस्तूंनी भरली आहे.",
    ch5Intro: "घरी परतल्यावर दुपारची शांत विश्रांती घेऊया.",
    ch5Success: "फार छान! विश्रांती आणि पाण्याने तुम्ही ताजेतवाने झाला आहात.",
    ch6Intro: "सूर्य मावळत असताना सकाळपासून संध्याकाळपर्यंतचा प्रवास आठवूया.",
    completionVoice: "अद्भुत प्रवास! तुम्ही संपूर्ण दिवस स्पष्टता आणि शांततेने आठवला.",
  },
  ne: {
    chapterOf: (c, t) => `अध्याय ${c} (${t} मध्ये)`,
    title: "मेरो संसारको एक दिन",
    subTitle: "स्मृति स्मरण र दैनिक तालिका",
    voiceOn: "आवाज अन",
    muted: "आवाज बन्द",
    unmuteAria: "आवाज सुन्नुहोस्",
    muteAria: "आवाज म्यूट गर्नुहोस्",
    score: (s) => `अङ्क: ${s}`,
    welcomeTitle: "एक अविस्मरणीय बिहानी",
    welcomeDesc: "बिहानीको न्यानो घामले कोठा भरिएको छ। साथी तपाईंसँग दिनको हरेक पल स्मरण गर्न तयार छ।",
    beginDayButton: "बिहानी यात्रा सुरु गर्नुहोस्",
    finalDayCompleteTitle: "यात्रा सम्पन्न: स्मृतिहरूको सुन्दर पुनरावृत्ति",
    finalDayCompleteDesc: "तपाईंले साथीसँग सबै ६ अध्यायहरूको यात्रा सफलतापूर्वक पूरा गर्नुभयो।",
    reliveDayButton: "यो दिन फेरि अनुभव गर्नुहोस्",
    backToHub: "← थेरापी केन्द्रमा फर्कनुहोस्",
    ch1Title: "बिहानीको सम्झना",
    ch2Title: "हराएको तस्वीर",
    ch3Title: "बजारको बाटो",
    ch4Title: "बजारको किनमेल",
    ch5Title: "दिउँसोको आराम",
    ch6Title: "साँझको स्मृति",
    ch1ItemKey: "घरको साँचो",
    ch1ItemCap: "घामको टोपी",
    ch1ItemBag: "कपडाको झोला",
    ch1MemorizeTitle: "यी ३ महत्त्वपूर्ण वस्तुहरू सम्झनुहोस्",
    ch1MemorizeDesc: "कोठाबाट बाहिर जानुअघि साँचो, टोपी र झोलालाई ध्यानपूर्वक हेर्नुहोस्।",
    ch1ReadyButton: "मैले सम्झिएँ",
    ch1FindTitle: "तीनवटै वस्तुहरू खोजेर उठाउनुहोस्",
    ch1TapDesc: "झोलामा राख्न प्रत्येक वस्तुमा थिच्नुहोस्:",
    ch1Collected: "सङ्कलन भयो",
    ch1TakeItem: (name) => `${name} लिनुहोस्`,
    ch2Prompt: "एल्बमका लागि पारिवारिक फोटो छान्नुहोस्",
    ch2Subtext: "विकल्पहरू हेरेर आँगनमा बसेको परिवारको शान्त फोटो छान्नुहोस्।",
    ch2OptTrain: "व्यस्त रेल स्टेशन",
    ch2OptCourtyard: "माजुलीको पारिवारिक आँगन",
    ch2OptOffice: "कार्यालयको सभा कक्ष",
    ch2FeedbackCorrect: "सही! माजुलीको पारिवारिक भेटघाटको सुन्दर फोटो!",
    ch2FeedbackRetry: "पारम्परिक आँगनको फोटोलाई अझ ध्यान दिएर हेर्नुहोस्।",
    ch3Question: "नदी किनारको बाटो रोज्नुहोस्",
    ch3Subtext: "तपाईं रातो नामघर मन्दिर भएर जाँदै हुनुहुन्छ। कुन बाटोले नदीको बजारतर्फ डोर्‍याउँछ?",
    ch3OptRiver: "नदी किनारको बाटो (ब्रह्मपुत्रको किनारै-किनार)",
    ch3OptHighway: "ठूलो राजमार्ग ओभरपास",
    ch3OptForest: "बाक्लो जङ्गलको गोरेटो",
    ch3FeedbackCorrect: "सही! नदी किनारको शान्त बाटो जसले सीधै बजार पुर्‍याउँछ!",
    ch3FeedbackRetry: "त्यो बाटो जङ्गलतिर जान्छ। नदी किनारको बाटो रोज्नुहोस्।",
    ch4Prompt: "फिर्ता रकमको सही हिसाब गर्नुहोस्",
    ch4Subtext: "सामान किनेको: असम चिया (₹६०) + जोहा चामल (₹८०) = जम्मा ₹१४०। तपाईंले पसलेलाई ₹२०० को नोट दिनुभयो। कति फिर्ता पाउनुपर्छ?",
    ch4ChangeOption: (amt) => `₹${amt} फिर्ता`,
    ch4FeedbackCorrect: "एकदम सही! ₹२०० - ₹१४० = ₹६० सही हिसाब फिर्ता पाइयो!",
    ch4FeedbackRetry: "जम्मा बिल ₹१४० हो (₹६० चिया + ₹८० चामल)। ₹२०० बाट कति बाँकी रहन्छ?",
    ch5Prompt: "दिउँसोको आराम र पानी पिउने",
    ch5Subtext: "ताजा चिया लिएर तपाईं घर फर्कनुभएको छ। अबको सबैभन्दा राम्रो कदम के हो?",
    ch5OptRest: "एक गिलास पानी पिउनु र बरण्डामा आराम गर्नु",
    ch5OptRun: "तुरुन्तै बाहिर गएर दौडनु",
    ch5FeedbackCorrect: "उत्तम! शुद्ध पानी पिउनु र बरण्डामा शान्तपूर्वक आराम गर्नु!",
    ch5FeedbackRetry: "हिँडेर आएपछि आराम गर्नु र पानी पिउनु स्वास्थ्यका लागि राम्रो हुन्छ।",
    ch6Prompt: "दिनका पलहरूलाई क्रमानुसार मिलाउनुहोस्",
    ch6Subtext: "बिहानदेखि साँझसम्मको क्रममा प्रत्येक स्मृतिमा थिच्नुहोस्:",
    ch6Step1: "१. बिहानीको साँचो र झोला",
    ch6Step2: "२. माजुली परिवारको फोटो",
    ch6Step3: "३. नदी किनार बजारको यात्रा",
    ch6Step4: "४. सूर्यास्तमा बरण्डाको आराम",
    ch6RecalledCount: (c) => `४ मध्ये ${c} पल क्रमानुसार मिलाइयो!`,
    saathiWakeup: "शुभ प्रभात! चिन्ता नगर्नुहोस्, हामी मिलेर दिनका सम्झनाहरू ताजा गर्नेछौं।",
    ch1Complete: "अति राम्रो! तपाईंले बिहानका तीनवटै आवश्यक वस्तुहरू सङ्कलन गर्नुभयो।",
    ch1FindPrompt: "अब दिन सुरु गर्न साँचो, टोपी र झोला उठाइहाल्नुहोस्।",
    ch2Intro: "बाहिर जानुअघि पारिवारिक फोटोलाई एल्बममा मिलाएर राखौं।",
    ch2Success: "धेरै राम्रो! पारिवारिक एल्बम फेरि पूरा भयो।",
    ch3Intro: "आउनुहोस् नदी किनारको बाटो हुँदै गाउँको बजारतर्फ लागौं।",
    ch3Success: "उत्कृष्ट बाटो पहिचान! हामी सुरक्षित रूपमा बजार पुग्यौं।",
    ch4Intro: "हाम्रो बजेटबाट ताजा घरायसी सामान किन्ने बेला भयो।",
    ch4Success: "सटीक हिसाब! तपाईंको झोला ताजा सामानले भरियो।",
    ch5Intro: "घर फर्केर दिउँसोको शान्त आराम गरौं।",
    ch5Success: "धेरै राम्रो! आराम र पानीले तपाईंलाई ताजा बनाइदियो।",
    ch6Intro: "घाम अस्ताउँदै गर्दा बिहानदेखि साँझसम्मको यात्रा स्मरण गरौं।",
    completionVoice: "अद्भुत यात्रा! तपाईंले पूरै दिनलाई स्पष्टता र शान्तिपूर्वक स्मरण गर्नुभयो।",
  },
  mni: {
    chapterOf: (c, t) => `অধ্যায় ${c} (${t} গী মনুংদা)`,
    title: "ঐগী পৃথিবীগী নুমিৎ অমা",
    subTitle: "নীংশিংবা অমসুং নোংমগী থবক",
    voiceOn: "খোঞ্জেল অন",
    muted: "খোঞ্জেল মুৎথৎপা",
    unmuteAria: "খোঞ্জেল তাউ",
    muteAria: "খোঞ্জেল লোইশিনবা",
    score: (s) => `নম্বর: ${s}`,
    welcomeTitle: "নীংশিংনিংঙাই ওইবা অয়ুক",
    welcomeDesc: "অয়ুক্কী নুংশিৎনা কা অদুদা নুংঙাইবা হাপ্লি। সাথীনা নহাক্কা লোয়ননা নোংমগী পুংফম খুদিংমক নীংশিংবা হোৎনরি।",
    beginDayButton: "অয়ুক্কী খোঙচৎ হৌবা",
    finalDayCompleteTitle: "খোঙচৎ লোইশিনখ্রে: নীংশিংবা মপুং ফারবা",
    finalDayCompleteDesc: "নহাক্না সাথীগা লোয়ননা অধ্যায় ৬ মপুং ফানা লোইশিনখ্রে।",
    reliveDayButton: "নুমিৎ অসি অমুক হন্না তৌবা",
    backToHub: "← থেরাপি কা অমুক হল্লকপা",
    ch1Title: "অয়ুক্কী নীংশিংবা",
    ch2Title: "মাংখ্রবা ফটো",
    ch3Title: "কৈথেল চৎনবা লম্বী",
    ch4Title: "কৈথেলদা পোৎ লৈবা",
    ch5Title: "নুমিৎ য়ুংবা মতমগী পোথারবা",
    ch6Title: "নুমিৎ তাথোকপগী নীংশিংবা",
    ch1ItemKey: "য়ুমগী শাবি",
    ch1ItemCap: "নুমিৎ কোপ",
    ch1ItemBag: "ফি চংবগী মোনা",
    ch1MemorizeTitle: "মরুওইবা পোৎ ৩ অসি নীংশিংবীয়ু",
    ch1MemorizeDesc: "কাদগী থোকত্রিঙৈদা শাবি, কোপ অমসুং মোনা অদু য়েংদুনা নীংশিংবীয়ু।",
    ch1ReadyButton: "ঐ নীংশিংলে",
    ch1FindTitle: "পোৎ ৩ অদু থিদুনা লৌবীয়ু",
    ch1TapDesc: "মোনাদা হাপ্নবা পোৎ খুদিংমক্তা নম্বীয়ু:",
    ch1Collected: "লৌখ্রে",
    ch1TakeItem: (name) => `${name} লৌবীয়ু`,
    ch2Prompt: "এলবমগীদমক ইমুংগী ফটো খল্লু",
    ch2Subtext: "শুমবাংদা ইমুংগী মীওইশিং লোয়ননা ফম্বগী শান্ত ওইবা ফটো অদু খল্লু।",
    ch2OptTrain: "রেল ষ্টেশন",
    ch2OptCourtyard: "মাজুলিগী ইমুং শুমবাং",
    ch2OptOffice: "ওফিস মিটিংসেন",
    ch2FeedbackCorrect: "চুম্মে! মাজুলিগী ইমুংগী নুংশিবা ফটো!",
    ch2FeedbackRetry: "শুমবাংগী ফটো অদু অমুক হন্না কুপ্না য়েংবীয়ু।",
    ch3Question: "তুরেল নাকলগী লম্বী খল্লু",
    ch3Subtext: "নহাক্না অঙাংবা নামঘর থাদোক্তুনা লাক্লে। তুরেল কৈথেলদা করম্বা লম্বীনা চৎকনি?",
    ch3OptRiver: "তুরেল নাকলগী লম্বী (ব্রহ্মপুত্র নাকল)",
    ch3OptHighway: "অচৌবা হাইৱে",
    ch3OptForest: "উমং মনুংগী লম্বী",
    ch3FeedbackCorrect: "চুম্মে! তুরেল নাকলগী লম্বীনা কৈথেলদা হকথেংননা য়ৌহল্লি!",
    ch3FeedbackRetry: "লম্বী অদুনা চীংদা চৎকনি। তুরেল নাকলগী লম্বী খল্লু।",
    ch4Prompt: "হন্নগদবা শেল চুম্না হিসাপ তৌ",
    ch4Subtext: "লৈখিবা পোৎ: অসাম চা (₹৬০) + জোহা চেং (₹৮০) = অপুনবা ₹১৪০। নহাক্না ₹২০০ গী নোট পীখি। দোকানদারনা কয়াম হনগদগে?",
    ch4ChangeOption: (amt) => `₹${amt} হন্নবা`,
    ch4FeedbackCorrect: "একদম চুম্মে! ₹২০০ - ₹১৪০ = ₹৬০ চুম্না হল্লক্লে!",
    ch4FeedbackRetry: "বিল ₹১৪০ নি (₹৬০ চা + ₹৮০ চেং)। ₹২০০ দগী কয়াম ৱাৎলে?",
    ch5Prompt: "নুমিৎ য়ুংবা মতমদা ঈশিং থকপা অমসুং পোথাবা",
    ch5Subtext: "চা লৈরগা নহাক য়ুমদা য়ৌরে। হৌজিক খ্বাইদগী ফবা থবক করি তৌগনি?",
    ch5OptRest: "ঈশিং গ্লাস অমা থক্তুনা বারান্দাদা পোথাবা",
    ch5OptRun: "মপান্দা চত্থোক্লগা য়াদ্রিঙৈদা চেনবা",
    ch5FeedbackCorrect: "য়াম্না ফৈ! শেংলবা ঈশিং থকপা অমসুং বারান্দাদা শান্তিনা পোথাবা!",
    ch5FeedbackRetry: "চৎলকপগী তুংদা পোথাবা অমসুং ঈশিং থকপনা হকচাংগী ফৈ।",
    ch6Prompt: "নোংমগী থবকশিং পরিং নায়না শেমজিনবীয়ু",
    ch6Subtext: "অয়ুক্তগী নুমিদাং ফাওবগী নীংশিংবা পরিং নায়না নম্বীয়ু:",
    ch6Step1: "১. অয়ুক্কী শাবি অমসুং মোনা",
    ch6Step2: "২. মাজুলিগী ইমুং ফটো",
    ch6Step3: "৩. তুরেল কৈথেলদা চৎপা",
    ch6Step4: "৪. নুমিৎ তাথোকপদা বারান্দাদা পোথাবা",
    ch6RecalledCount: (c) => `৪ গী মনুংদা ${c} পরিং চুম্না শেমজিল্লে!`,
    saathiWakeup: "সুপ্ৰভাত! অৱাবা পোক্তনু, পুন্না নোংমগী পুংফম নীংশিংসি।",
    ch1Complete: "য়াম্না ফরে! নহাক্না অয়ুক্কী দরকার ওইবা পোৎ ৩ মপুং ফানা খোমজিল্লে।",
    ch1FindPrompt: "হৌজিক নোংমগী থবক হৌনবা শাবি, কোপ অমসুং মোনা লৌবীয়ু।",
    ch2Intro: "মপান্দা থোকত্রিঙৈদা এলবমদা ইমুংগী ফটো চুম্না হাপসি।",
    ch2Success: "য়াম্না নুংঙাইরে! ইমুংগী এলবম অমুক মপুং ফারে।",
    ch3Intro: "তুরেল নাকলগী লম্বীদা খোঙচৎ চৎসি।",
    ch3Success: "লম্বী চুম্না খঙলে! ঐখোয় কৈথেলদা শেংনা য়ৌরে।",
    ch4Intro: "বজেট মতুং ইন্না পোৎ লৈবগী মতম ওইরে।",
    ch4Success: "হিসাপ চুম্লে! মোনাদা পোৎ য়াম্না থল্লে।",
    ch5Intro: "য়ুমদা হল্লক্লগা নুমিৎ য়ুংবা মতমদা পোথাসি।",
    ch5Success: "য়াম্না ফরে! ঈশিং থকপা অমসুং পোথাবনা নুংঙাইহল্লে।",
    ch6Intro: "নুমিৎ তাথোকপদা নোংমগী খোঙচৎ নীংশিংসি।",
    completionVoice: "অপূৰ্ব খোঙচৎ! নহাক্না নোংমগী পুংফম পুম্নমক ময়েক শেংনা নীংশিংলে।",
  },
  brx: {
    chapterOf: (c, t) => `खोन्दो ${c} (${t} नि गेजेराव)`,
    title: "आंनि मुलुगनि मोनसे सान",
    subTitle: "गोसोखांथि आरो सानफ्रोमबोनि बिथांखि",
    voiceOn: "राव अन",
    muted: "राव बन्द",
    unmuteAria: "राव खोनासंनाय",
    muteAria: "राव खोबथेनाय",
    score: (s) => `नम्बर: ${s}`,
    welcomeTitle: "गोसोआव लाखिनो गोनां फुं",
    welcomeDesc: "फुंनि साननि रोदाया खथायाव गुदुं महर लाबोदों। साथिया दिनै नोंथांजों लोगोसे गोसोखांथिनि थाखाय साजावदों।",
    beginDayButton: "फुंनि दावबायनाय जागाय",
    finalDayCompleteTitle: "दावबायनाय जोबबाय: गोसोखांथिखौ मोजाङै लाबोफिनबाय",
    finalDayCompleteDesc: "नोंथाङा साथिजों लोगोसे गासैबो ६ खोन्दोखौ जोबोद मोजाङै फोजोबबाय।",
    reliveDayButton: "सानखौ आरोबाव सोरजिफिन",
    backToHub: "← फाहामथाय खलियाव फैफिन",
    ch1Title: "फुंनि गोसोखांथि",
    ch2Title: "गोमानाय फोटो",
    ch3Title: "बजारनि लामा",
    ch4Title: "बजारनि हाबा",
    ch5Title: "सानजौफानि जिरायनाय",
    ch6Title: "बेलासिनि गोसोखांथि",
    ch1ItemKey: "न'नि साबि",
    ch1ItemCap: "सानदुंनि थुपि",
    ch1ItemBag: "खामब्रुनि थुख्रि बैग",
    ch1MemorizeTitle: "बे मोन ३ गोनांथार मुवाफोरखौ गोसोआव लाखि",
    ch1MemorizeDesc: "खथानिफ्राय ओंखारनायनि सिगां साबि, थुपि आरो बैगखौ मोजाङै नायनानै गोसोआव लाखि।",
    ch1ReadyButton: "आं गोसोआव लाखिबाय",
    ch1FindTitle: "मुवा ३ खौ नागिरनानै ला",
    ch1TapDesc: "बैगआव दोननो मोनफ्रोमबो मुवायाव थु:",
    ch1Collected: "बुथुमबाय",
    ch1TakeItem: (name) => `${name} ला`,
    ch2Prompt: "एल्बामनि थाखाय नखरनि फोटो सायख'",
    ch2Subtext: "अखंआव जिरायनाय नखरनि गोजोन फोटोखौ बासि।",
    ch2OptTrain: "गोबां मानसि थानाय रेल स्टेसन",
    ch2OptCourtyard: "माजुलि नखरनि अखं",
    ch2OptOffice: "अफिसनि मिथिं खथा",
    ch2FeedbackCorrect: "थि! माजुलि नखरनि अनज्लायनायनि साबसिन फोटो!",
    ch2FeedbackRetry: "अखंआव थानाय फोटोखौ आरोबाव मोजाङै नाय।",
    ch3Question: "दैसा सेरनि लामाखौ सायख'",
    ch3Subtext: "नोंथाङा गोजा नामघर बारबोबाय। बबे लामाया दैसा बजारसिम थाङो?",
    ch3OptRiver: "दैसा सेरनि लामा (ब्रह्मपुत्र सेरजों)",
    ch3OptHighway: "गेदेर राजफार",
    ch3OptForest: "हाग्रामा हाजोनि लामा",
    ch3FeedbackCorrect: "थि! दैसा सेरनि गोजोन लामा जाय बजारसिम थोंजों थाङो!",
    ch3FeedbackRetry: "बे लामाया हाजोसिम थाङो। दैसा सेरनि लामाखौ सायख'।",
    ch4Prompt: "थालांनाय रांनि थि हिसाब खालाम",
    ch4Subtext: "बायनाय बेसाद: आसाम साहा (₹60) + जहा माइ (₹80) = गासै ₹140। नोंथाङा ₹200 नि नोट हरबाय। कय रां फिथाय मोनगोन?",
    ch4ChangeOption: (amt) => `₹${amt} फिथाय मोनगोन`,
    ch4FeedbackCorrect: "जोबोद मोजां! ₹200 - ₹140 = ₹60 थि मोनफिनबाय!",
    ch4FeedbackRetry: "गासै बिल ₹140 (₹60 साहा + ₹80 माइ)। ₹200 निफ्राय बेसेबां थालाङो?",
    ch5Prompt: "सानजौफानि जिरायनाय आरो दै लोंनाय",
    ch5Subtext: "गोदान साहा लानानै नोंथाङा न'आव सौफैबाय। दा मा खालामनाया साबसिन?",
    ch5OptRest: "मोनसे ग्लास दै लोंनानै बारान्दायाव जिरायनाय",
    ch5OptRun: "ओंखारलांनानै थाबैनो खारनाय",
    ch5FeedbackCorrect: "जोबोद मोजां! दै लोंनाय आरो बारान्दायाव गोजोन जिरायनाय!",
    ch5FeedbackRetry: "दावबायनायनि उनाव जिरायनाय आरो दै लोंनाया देहानि थाखाय मोजां।",
    ch6Prompt: "साननि समाव जानायफोरखौ थि सारिजों साजाय",
    ch6Subtext: "फुंनिफ्राय बेलासिसिम फारि-फारि मोनफ्रोमबो गोसोखांथियाव थु:",
    ch6Step1: "1. फुंनि साबि आरो बैग",
    ch6Step2: "2. माजुलि नखरनि फोटो",
    ch6Step3: "3. दैसा बजारसिम दावबायनाय",
    ch6Step4: "4. सान हासिनायाव बारान्दायाव जिरायनाय",
    ch6RecalledCount: (c) => `4 नि गेजेराव ${c} गोसोखांथि साजायबाय!`,
    saathiWakeup: "मोजां फुं! गिनाङा, साननि गोसोखांथिफोरखौ जों लोगोसे गोसोखांफिनगोन।",
    ch1Complete: "जोबोद मोजां! नोंथाङा फुंनि मोनथामबो मुवाफोरखौ बुथुमबाय।",
    ch1FindPrompt: "दा सानखौ जागायनो साबि, थुपि आरो बैगखौ ला।",
    ch2Intro: "सिगां नखरनि फोटोखौ एल्बामआव थि जायगायाव दोननो फै।",
    ch2Success: "जोबोद मोजां! नखरनि एल्बामा आबुं जाफिनबाय।",
    ch3Intro: "दैसा सेरनि लामाजों बजारसिम फै।",
    ch3Success: "मोजां लामा सायख'बाय! जों बजारसिम सौफैबाय।",
    ch4Intro: "बजेट बादियै न'नि बेसाद बायनायनि सम जाबाय।",
    ch4Success: "थि हिसाब! बैगआव गोदान बेसाद बुथुमबाय।",
    ch5Intro: "न'आव सौफैनानै सानजौफानि जिरायनाय लागोन।",
    ch5Success: "मोजां हाबा! जिरायनाया नोंथांखौ गोदान खालामबाय।",
    ch6Intro: "सान हासिनायाव गासै साननि दावबायनायखौ गोसोखांफिननो फै।",
    completionVoice: "मोजां दावबायनाय! नोंथाङा गासै सानखौ गोजोनै गोसोखांफिनबाय।",
  },
  grt: {
    chapterOf: (c, t) => `Bak ${c} (${t} oni)`,
    title: "Angni Salni Re·ani",
    subTitle: "Gisik Ra·atani aro Salanti Katta",
    voiceOn: "Ku·rang On",
    muted: "Ku·rang Chipa",
    unmuteAria: "Ku·rang Khnaatbo",
    muteAria: "Ku·rang Dingtangatbo",
    score: (s) => `Point: ${s}`,
    welcomeTitle: "Pringni Seng·ani",
    welcomeDesc: "Pringni sal nambegipa ding·aniko noko on·tenga. Saathi na·simang baksa salgimik re·ani salo gisik ra·china donga.",
    beginDayButton: "Pringni Re·aniko A·bachengbo",
    finalDayCompleteTitle: "Re·ani Machotaha: Gisik Ra·taipilaha",
    finalDayCompleteDesc: "Na·a Saathi baksa bak 6 gimikko kusi aro saksingoniko man·e machotaha.",
    reliveDayButton: "Salko A·bachengtaibo",
    backToHub: "← An·sengani Kothana Re·bapilbo",
    ch1Title: "Pringni Gisik Ra·ani",
    ch2Title: "Gimagipa Noksa",
    ch3Title: "Bazarona Re·ani Rama",
    ch4Title: "Bazaro Brena Re·ani",
    ch5Title: "Attam Neng·takaniko Ra·ani",
    ch6Title: "Salnapani Gisik Ra·ani",
    ch1ItemKey: "Nokni Chabi",
    ch1ItemCap: "Salni Tupi",
    ch1ItemBag: "Bara Bag",
    ch1MemorizeTitle: "Ia Mongol 3 Bosturangko Gisik Ra·bo",
    ch1MemorizeDesc: "Kothani ong·katna skang chabi, tupi aro bagko name nina gisik ra·bo.",
    ch1ReadyButton: "Anga Gisik Ra·aha",
    ch1FindTitle: "Bostu 3 ko Sandie Ra·bo",
    ch1TapDesc: "Bago chipna gita bostuko thikbo:",
    ch1Collected: "Ra·manaha",
    ch1TakeItem: (name) => `${name} ko ra·bo`,
    ch2Prompt: "Albumna Nokdangni Noksako Seokbo",
    ch2Subtext: "Sarao asongenggipa nokdangni tom·bimonganiko seokbo.",
    ch2OptTrain: "Train Station",
    ch2OptCourtyard: "Majuli Nokdangni Sara",
    ch2OptOffice: "Office Meeting Kotha",
    ch2FeedbackCorrect: "Kakket! Majuli nokdangni tom·bimongani nitogipa noksa!",
    ch2FeedbackRetry: "Sarao donggipa noksako name nitaibo.",
    ch3Question: "Chibima Rikam Rama Seokbo",
    ch3Subtext: "Na·a gitchak Namgharko re·ange katangaha. Boni rama bazarona re·anggen?",
    ch3OptRiver: "Chibima Rikam Rama (Brahmaputra rikam)",
    ch3OptHighway: "Dal·gipa Rama Overpass",
    ch3OptForest: "Buringni Rama",
    ch3FeedbackCorrect: "Kakket! Chibima rikamni tomi rama bazarona direct re·anga!",
    ch3FeedbackRetry: "Ua rama abri buringona re·anga. Chibima rikamko seokbo.",
    ch4Prompt: "Tangka Ra·pilgipako Chanchibo",
    ch4Subtext: "Bregimin bosturang: Assam Cha (₹60) + Joha Mi (₹80) = ₹140. Na·a ₹200 note on·aha. Tangka badita man·pilna nanga?",
    ch4ChangeOption: (amt) => `₹${amt} Man·pila`,
    ch4FeedbackCorrect: "Kakket! ₹200 - ₹140 = ₹60 thik man·pilaha!",
    ch4FeedbackRetry: "Bill gimik ₹140 (₹60 cha + ₹80 mi). ₹200 oni badita dongkua?",
    ch5Prompt: "Attamo Neng·takani aro Chi Ringani",
    ch5Subtext: "Cha brena re·bae noko sokaha. Da·o mikkangchi mai nambata?",
    ch5OptRest: "Glass sa chi ringe barandao neng·takani",
    ch5OptRun: "A·palona re·onge bakbak katani",
    ch5FeedbackCorrect: "Nambegipa! Rongtalgipa chi ringani aro barandao neng·takani!",
    ch5FeedbackRetry: "Re·baani ja·man neng·takani aro chi ringania an·sengna namchongmota.",
    ch6Prompt: "Salni Kattamitingko Sulsul Donbo",
    ch6Subtext: "Pringoni salnapona sulsul gisik ra·aniko thikbo:",
    ch6Step1: "1. Pringni Chabi aro Bag",
    ch6Step2: "2. Majuli Nokdangni Noksa",
    ch6Step3: "3. Chibima Bazaro Re·ani",
    ch6Step4: "4. Salnap Barandao Neng·takani",
    ch6RecalledCount: (c) => `4 oni ${c} sulsul gisik ra·manaha!`,
    saathiWakeup: "Namgipa pring! Kene donga nangja, ching salni gisik ra·aniko re·na tike donga.",
    ch1Complete: "Nambegipa! Na·a pringni nanggipa bostu gittamko man·aha.",
    ch1FindPrompt: "Chabi, tupi aro bagko ra·bo sal a·bachengna gita.",
    ch2Intro: "A·palona ong·katna skang albumo nokdang noksako donbo.",
    ch2Success: "Kusi ong·aniko man·aha! Album matchotaha.",
    ch3Intro: "Chibima rikam ramachi bazarona re·angna mai.",
    ch3Success: "Ramako kakket u·iama! Bazaro sokaha.",
    ch4Intro: "Budget gita mi-cha brena somoi sokaha.",
    ch4Success: "Hisaab kakket ong·a! Bag gital bosturango gapa.",
    ch5Intro: "Nokona re·bae neng·takaniko ra·na somoi ong·aha.",
    ch5Success: "Nambegipa! Chi ringani na·ako an·sengataha.",
    ch6Intro: "Salnapao salgimikni re·aniko gisik ra·taibo.",
    completionVoice: "Nama re·ani! Salgimikko na·a tomi aro talbegipa gisikchi ra·aha.",
  },
  kha: {
    chapterOf: (c, t) => `Lynnong ${c} (${t} na)`,
    title: "Kawei Ka Sngi Ha Shnong Jong Nga",
    subTitle: "Kynmaw Jingmut & Jingtrei Man Ka Sngi",
    voiceOn: "Sur On",
    muted: "Sur Off",
    unmuteAria: "Sur On",
    muteAria: "Sur Khang",
    score: (s) => `Score: ${s}`,
    welcomeTitle: "Ka Step Ba Kynmaw",
    welcomeDesc: "Ka jingshai ka sngi ka la pyndap ia ka kamra. U Saathi u don hangne ban iaid ryngkat bad phi baroh shi sngi.",
    beginDayButton: "Sdang Ka Jingiaid Step",
    finalDayCompleteTitle: "Kaba Kut Ka Jingiaid: Jingkynmaw Ba La Pynphai Pat",
    finalDayCompleteDesc: "Phi la pyndep ia baroh 6 tylli ki lynnong ryngkat bad u Saathi da ka jingjop kaba khraw.",
    reliveDayButton: "Pynkynmaw Pat Ia Ka Sngi",
    backToHub: "← Phai Sha Kamra Therapy",
    ch1Title: "Jingkynmaw Step",
    ch2Title: "Ka Dur Ba La Jah",
    ch3Title: "Ka Lynti Sha Iew",
    ch4Title: "Ka Jingthied Jingpet Ha Iew",
    ch5Title: "Ka Jingjahthait Janmiet",
    ch6Title: "Ka Jingkynmaw Sep-sngi",
    ch1ItemKey: "Shabiat Iing",
    ch1ItemCap: "Tupi Sngi",
    ch1ItemBag: "Mula Jain",
    ch1MemorizeTitle: "Kynmaw Ia Kine Ki 3 Tylli Ki Jingdonkam",
    ch1MemorizeDesc: "Shwa ban mih na ka kamra, peit bad kynmaw ia ka shabiat, ka tupi bad ka pla mula jain.",
    ch1ReadyButton: "Nga La Kynmaw",
    ch1FindTitle: "Wad & Shim Ia Kine Ki 3 Tylli",
    ch1TapDesc: "Khyndiat ban thep ha ka pla:",
    ch1Collected: "La Lum",
    ch1TakeItem: (name) => `Shim ia ka ${name}`,
    ch2Prompt: "Jied Ia Ka Dur Iing Na Ka Bynta Ka Album",
    ch2Subtext: "Peit ia ki jingjied bad jied ia ka dur kaba suk ha kaba iing baroh ki shong ha phyllaw.",
    ch2OptTrain: "Station Rel Ba Khapngiah",
    ch2OptCourtyard: "Phyllaw Iing Majuli",
    ch2OptOffice: "Kamra Jingialang Office",
    ch2FeedbackCorrect: "Dei! Ka dur baitynnat jong ka jingiashem iing Majuli!",
    ch2FeedbackRetry: "Peit bniah ia ka dur ha phyllaw.",
    ch3Question: "Jied Ia Ka Lynti Rud Wah",
    ch3Subtext: "Phi la iaid lyngba ka Namghar basaw. Kaba kino ka lynti kaba leit sha iew rud wah?",
    ch3OptRiver: "Lynti Rud Wah (Brahmaputra)",
    ch3OptHighway: "Highway Ba Heh",
    ch3OptForest: "Lynti Khlaw Ba Dum",
    ch3FeedbackCorrect: "Dei! Ka lynti rud wah kaba jem kaba leit beit beit sha iew!",
    ch3FeedbackRetry: "Kato ka lynti ka leit sha lum. Jied ia ka lynti rud wah.",
    ch4Prompt: "Khein Ia Ka Pisa Ba Dei Ban Ioh Pat",
    ch4Subtext: "Ki mar ba la thied: Sha Assam (₹60) + Khaw Joha (₹80) = ₹140 Baroh. Phi ai ₹200. Katno ka pisa ban ioh pat?",
    ch4ChangeOption: (amt) => `₹${amt} Pisa Pat`,
    ch4FeedbackCorrect: "Dei bha! ₹200 - ₹140 = ₹60 ba la ioh pat pura!",
    ch4FeedbackRetry: "Ka bill baroh ₹140 (₹60 sha + ₹80 khaw). Na ka ₹200 katno sah?",
    ch5Prompt: "Shongthait Janmiet & Dih Um",
    ch5Subtext: "Phi la poi sha iing ryngkat bad ka sha bathymmai. Kiei kaba dei ban leh mynta?",
    ch5OptRest: "Dih shi klat ka um & shongthait ha baranda",
    ch5OptRun: "Mih shabar ban mareh mar-mar",
    ch5FeedbackCorrect: "Bha bha! Ka um ba khuid bad ka jingshongthait ha baranda!",
    ch5FeedbackRetry: "Hadien ba la iaid, ka jingdih um bad jingshongthait ka long kaba bha.",
    ch6Prompt: "Buh Ia Ki Por Sulsul Shi Sngi",
    ch6Subtext: "Tep ia kawei pa kawei ka jingkynmaw naduh step haduh miet:",
    ch6Step1: "1. Shabiat & Pla Step",
    ch6Step2: "2. Dur Iing Majuli",
    ch6Step3: "3. Jingiaid Sha Iew Rud Wah",
    ch6Step4: "4. Shongthait Sep-sngi Baranda",
    ch6RecalledCount: (c) => `4 na ${c} kiba la buh beit!`,
    saathiWakeup: "Khublei step! Wat khuslai, ngin kynmaw lang ia ka sngi.",
    ch1Complete: "Bha bha! Phi la lum ia kine ki lai tylli ki jingdonkam step.",
    ch1FindPrompt: "Mynta shim ia ka shabiat, tupi bad pla ban pynkhreh.",
    ch2Intro: "Shwa ban mih, ngin thep ia ka dur iing ha ka album.",
    ch2Success: "Kmen bha! Ka album ka la biang pat.",
    ch3Intro: "Ngin iaid lyngba ka lynti rud wah sha iew.",
    ch3Success: "Phin shem beit ia ka lynti! Ngi la poi suk ha iew.",
    ch4Intro: "Ka por ban thied jingbam katkum ka budget.",
    ch4Success: "Khein kaba thikna! Ka pla ka la dap da ki mar bathymmai.",
    ch5Intro: "La poi iing ban jahthait ha ka janmiet.",
    ch5Success: "Bha bha! Ka jingshongthait ka la pynkhlain pat ia phi.",
    ch6Intro: "Ha ka sepsngi, ngin kynmaw ia ka jingiaid baroh shi sngi.",
    completionVoice: "Jingiaid ba phylla! Phi la kynmaw ia ka sngi baroh da ka jingsuk.",
  },
  lus: {
    chapterOf: (c, t) => `Bung ${c} (${t} zinga)`,
    title: "Ka Khawvel Ni Khat",
    subTitle: "Hriatrengna & Nitintin Mamawh",
    voiceOn: "Aw On",
    muted: "Aw Mute",
    unmuteAria: "Aw ti-chhuak rawh",
    muteAria: "Aw ti-tawp rawh",
    score: (s) => `Score: ${s}`,
    welcomeTitle: "Tuk Hriatreng Tlak",
    welcomeDesc: "Zing ni eng mawi tak chuan pindan a chhun eng nuam hle. Saathi chu vawiin ni pumpuia i bula kal ve zel turin a inpeih reng e.",
    beginDayButton: "Zing Zin Kawng Tan Rawh",
    finalDayCompleteTitle: "Zin Kawng Zo Ta: Hriatrengna Hlu Hmuhkir Leh A Ni",
    finalDayCompleteDesc: "Saathi nen bung 6 pumhlum chu hlawhtling takin in zawh ta e.",
    reliveDayButton: "He Ni Hi Chen Leh Rawh",
    backToHub: "← Enkawlna Hmunah Kir Leh Rawh",
    ch1Title: "Zing Hriatrengna",
    ch2Title: "Thlalak Bo",
    ch3Title: "Bazar Panna Kawng",
    ch4Title: "Bazar Chawhmeh Lei",
    ch5Title: "Chhun Chawlhahdamna",
    ch6Title: "Tlai Ni Len Hriatrengna",
    ch1ItemKey: "In Chabi",
    ch1ItemCap: "Ni Hliahna Lukhum",
    ch1ItemBag: "Puan Ipte",
    ch1MemorizeTitle: "Heng Thil Pawimawh 3 Hi Vawng Reng Rawh",
    ch1MemorizeDesc: "Pindan atanga i chhuah hmain chabi, lukhum leh ipte hi uluk takin en la vawng rawh.",
    ch1ReadyButton: "Ka Vawng Hman E",
    ch1FindTitle: "Thil 3 Te Hi Zawng La Chhar Rawh",
    ch1TapDesc: "I iptea khung turin anmahni theuh hmet rawh:",
    ch1Collected: "Lak Kim A Ni",
    ch1TakeItem: (name) => `${name} La Rawh`,
    ch2Prompt: "Album Atan Chhungkaw Thlalak Thlang Rawh",
    ch2Subtext: "Tualzawla chhungkua thlamuan taka an awm lai thlalak thlang rawh.",
    ch2OptTrain: "Rel Chawlhna Phusa",
    ch2OptCourtyard: "Majuli Chhungkaw Tualzawl",
    ch2OptOffice: "Hna thawhna Meeting Pindan",
    ch2FeedbackCorrect: "Dik e! Majuli chhungkaw inhmuhkhawm thlalak mawi tak chu!",
    ch2FeedbackRetry: "Tualzawl thlalak kha uluk zawkin en leh teh.",
    ch3Question: "Lui Kam Kawng Thlang Rawh",
    ch3Subtext: "Biak in sen (Namghar) i kal pel e. Khawi kawng hian nge lui kam bazar panna kawng dik chu ni?",
    ch3OptRiver: "Lui Kam Kawng (Brahmaputra kam)",
    ch3OptHighway: "Kawngpui Lian",
    ch3OptForest: "Ramhnuai Thim Kawng",
    ch3FeedbackCorrect: "Dik e! Lui kam kawng reh nuam tak bazar panna dik chu!",
    ch3FeedbackRetry: "Kha kawng kha tlang lamah a kal. Lui kam kawng thlang rawh.",
    ch4Prompt: "Pawisa Kir Tur Chhut Dik Rawh",
    ch4Subtext: "Thil lei: Assam Thingpui (₹60) + Joha Buh (₹80) = ₹140 Baroh. ₹200 note i pe a. Pawisa kir engzat nge i hmuh ang?",
    ch4ChangeOption: (amt) => `₹${amt} Kir`,
    ch4FeedbackCorrect: "A dik chiah! ₹200 - ₹140 = ₹60 kir dik thlap!",
    ch4FeedbackRetry: "Man zawng zawng chu ₹140 a ni (₹60 thingpui + ₹80 buh). ₹200 atangin engzat nge bang?",
    ch5Prompt: "Chhuna Chawlhahdam leh Tui In",
    ch5Subtext: "Thingpui tharlam nen in i thleng ta. Tunah eng nge tih hmasak ber tur?",
    ch5OptRest: "Tui in thianghlim no khat in a verandah-ah chawlh hahdam",
    ch5OptRun: "Pawnah chhuak a tlan nghal",
    ch5FeedbackCorrect: "Tha lutuk! Tui thianghlim in leh verandah-a thlamuan taka chawlh hahdam!",
    ch5FeedbackRetry: "Kea kal hnuah chawlh hahdam leh tui in hi taksa tan a tha ber.",
    ch6Prompt: "Ni Khat Thil Thleng Indawtin Rem Rawh",
    ch6Subtext: "Zing atanga tlai thleng a indawtin hmet rawh:",
    ch6Step1: "1. Zing Chabi & Ipte",
    ch6Step2: "2. Majuli Chhungkaw Thlalak",
    ch6Step3: "3. Lui Kam Bazar Len",
    ch6Step4: "4. Tlai Ni Len Verandah Chawlh",
    ch6RecalledCount: (c) => `4 zinga ${c} rem dik a ni ta!`,
    saathiWakeup: "Zing chibai! Lungngai suh, vawiin hun hi kan kutzungtang chhiarin kan hre reng dawn alawm.",
    ch1Complete: "A va ropui em! Zing thil pawimawh pathumte chu i la kim ta e.",
    ch1FindPrompt: "Tunah ni bul tan nan chabi, lukhum leh ipte zawng chhuak rawh le.",
    ch2Intro: "Pawn chhuah hmain album-ah chhungkaw thlalak dik tak dah ang le.",
    ch2Success: "A lawmawm lutuk! Chhungkaw album chu a kim leh ta.",
    ch3Intro: "Lui kam kawng nuam tak atangin khawpui bazar lam pan ang le.",
    ch3Success: "Kawng i zawng thiam hle mai! Him takin bazar kan thleng ta.",
    ch4Intro: "Kan pawisa neih atangin chawhmeh tharlam lei a hun ta e.",
    ch4Success: "Chhut dik thlap! I ipte chu thil tharlam tak takin a khat ta.",
    ch5Intro: "Inah kan kir a, chawlhahdam a hun ta.",
    ch5Success: "A tha e! Tui in leh chawlhin a ti-harh sawng sawng che.",
    ch6Intro: "Ni a tlak rualin tukin atanga tlai thlenga kan zinna thawnthu hi chhui kir leh ang le.",
    completionVoice: "Zin kawng mawi tak a ni! Ni khat thil thlengte chu chiang tak leh thlamuang takin i hre chhuak leh ta vek e.",
  },
};

function getItemName(id: "key" | "cap" | "bag", m: DayWorldStrings): string {
  if (id === "key") return m.ch1ItemKey;
  if (id === "cap") return m.ch1ItemCap;
  return m.ch1ItemBag;
}

export function DayInMyWorld3D() {
  const t = useTranslations("games.dayInMyWorld");
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const m = DAY_WORLD_I18N[normLoc] || DAY_WORLD_I18N.en;

  // Fallback-safe translation resolver so raw keys NEVER leak on screen
  const getT = useCallback(
    (key: string, fallback: string): string => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const val = t(key as any);
        if (val && !val.includes("games.dayInMyWorld")) return val;
      } catch {
        // Safe fallback
      }
      return fallback;
    },
    [t]
  );

  const { speakVoice, isMuted, toggleMute, currentSubtitle } = useGameVoice({
    rate: 0.82,
    pitch: 1.0,
  });

  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Game state
  const [currentChapter, setCurrentChapter] = useState<DayChapter>(1);
  const [hasStarted, setHasStarted] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Chapter 1: Morning Memorize & Collect
  const [ch1Memorized, setCh1Memorized] = useState(false);
  const [ch1Items, setCh1Items] = useState<CollectibleItem[]>([
    { id: "key", name: "House Key", pos: [-2, 1.3, 0], collected: false },
    { id: "cap", name: "Sun Cap", pos: [0, 1.3, 0], collected: false },
    { id: "bag", name: "Cloth Bag", pos: [2, 1.3, 0], collected: false },
  ]);

  // Chapter 2: Missing Photograph
  const [ch2SelectedPhoto, setCh2SelectedPhoto] = useState<number | null>(null);
  const [ch2Feedback, setCh2Feedback] = useState<string | null>(null);

  // Chapter 3: Spatial Navigation / Detour
  const [ch3Choice, setCh3Choice] = useState<number | null>(null);
  const [ch3Feedback, setCh3Feedback] = useState<string | null>(null);

  // Chapter 4: Market Shopping & Budget
  const [ch4ChangeAnswer, setCh4ChangeAnswer] = useState<number | null>(null);
  const [ch4Feedback, setCh4Feedback] = useState<string | null>(null);

  // Chapter 5: Everyday Problem Solving
  const [ch5Selected, setCh5Selected] = useState<number | null>(null);
  const [ch5Feedback, setCh5Feedback] = useState<string | null>(null);

  // Chapter 6: Final Chronological Day Reconstruction
  const [ch6Slots, setCh6Slots] = useState<number[]>([]);

  // Telemetry
  const startTimeRef = useRef<number | null>(null);
  const hesitationCountRef = useRef<number>(0);

  // Procedural Web Audio Sound Generator
  const playSound = useCallback((type: "click" | "correct" | "fanfare" | "bell") => {
    unlockAudio();
    if (type === "click") {
      playPress();
    } else if (type === "correct") {
      playCorrect();
    } else if (type === "fanfare") {
      playComplete();
    } else if (type === "bell") {
      playMonasteryBell(880);
    }
  }, []);

  // 3D Scene Initialization with Rich Interactive Low-Poly Diorama
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = 220;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Sky gradient & Lighting by chapter
    const skyColors: Record<number, string> = {
      1: "#FED7AA", // Morning warm golden sunrise
      2: "#FEF08A", // Bright sunlit room
      3: "#FDE68A", // Midday warm golden sunlight over river
      4: "#FEF08A", // Lively market square
      5: "#FDBA74", // Late afternoon golden hour
      6: "#FB923C", // Sunset twilight
    };
    const skyColor = skyColors[currentChapter] || "#FED7AA";
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(skyColor, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.8, 7.5);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Warm Ambient and Sun Lighting
    const ambientLight = new THREE.AmbientLight("#FFFBEB", 1.3);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight("#F59E0B", 2.2);
    sunLight.position.set(10, 15, 8);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // Warm Wooden Floor
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: currentChapter <= 2 ? "#B45309" : currentChapter === 3 ? "#15803D" : "#78350F",
      roughness: 0.7,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Back Wall with Sunlit Window (For Room Chapters 1, 2, 5, 6)
    if (currentChapter <= 2 || currentChapter >= 5) {
      const wallGeo = new THREE.PlaneGeometry(24, 12);
      const wallMat = new THREE.MeshStandardMaterial({ color: "#FEF3C7", roughness: 0.9 });
      const wall = new THREE.Mesh(wallGeo, wallMat);
      wall.position.set(0, 5, -4);
      scene.add(wall);

      // Window Frame
      const windowFrameGeo = new THREE.BoxGeometry(4, 3, 0.1);
      const windowFrameMat = new THREE.MeshStandardMaterial({ color: "#78350F" });
      const windowFrame = new THREE.Mesh(windowFrameGeo, windowFrameMat);
      windowFrame.position.set(0, 4.5, -3.9);
      scene.add(windowFrame);

      // Windowpane Sunlight
      const paneGeo = new THREE.PlaneGeometry(3.6, 2.6);
      const paneMat = new THREE.MeshBasicMaterial({ color: "#FEF3C7" });
      const pane = new THREE.Mesh(paneGeo, paneMat);
      pane.position.set(0, 4.5, -3.8);
      scene.add(pane);

      // Wooden Table
      const tableTopGeo = new THREE.BoxGeometry(6, 0.3, 3);
      const tableMat = new THREE.MeshStandardMaterial({ color: "#92400E", roughness: 0.6 });
      const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
      tableTop.position.set(0, 1.1, 0);
      scene.add(tableTop);

      // Table Legs
      const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.1, 8);
      const legPositions = [
        [-2.7, 0.55, -1.2],
        [2.7, 0.55, -1.2],
        [-2.7, 0.55, 1.2],
        [2.7, 0.55, 1.2],
      ];
      legPositions.forEach(([x, y, z]) => {
        const leg = new THREE.Mesh(legGeo, tableMat);
        leg.position.set(x, y, z);
        scene.add(leg);
      });

      // Steaming Tea Glass
      const cupGeo = new THREE.CylinderGeometry(0.2, 0.15, 0.45, 16);
      const cupMat = new THREE.MeshStandardMaterial({ color: "#D97706", roughness: 0.2 });
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.set(-1.8, 1.45, -0.6);
      scene.add(cup);

      // 3D Collectible Items on the Table (Chapter 1)
      if (currentChapter === 1) {
        // 1. Golden Key
        const keyGroup = new THREE.Group();
        const ringGeo = new THREE.TorusGeometry(0.18, 0.05, 8, 16);
        const keyMat = new THREE.MeshStandardMaterial({ color: "#FACC15", metalness: 0.8, roughness: 0.2 });
        const ring = new THREE.Mesh(ringGeo, keyMat);
        ring.rotation.x = Math.PI / 2;
        const shaftGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.5, 8);
        const shaft = new THREE.Mesh(shaftGeo, keyMat);
        shaft.position.set(0.3, 0, 0);
        shaft.rotation.z = Math.PI / 2;
        keyGroup.add(ring);
        keyGroup.add(shaft);
        keyGroup.position.set(-1.5, 1.35, 0.4);
        scene.add(keyGroup);

        // 2. Red/Orange Sun Cap
        const capGroup = new THREE.Group();
        const domeGeo = new THREE.SphereGeometry(0.32, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
        const capMat = new THREE.MeshStandardMaterial({ color: "#EF4444", roughness: 0.8 });
        const dome = new THREE.Mesh(domeGeo, capMat);
        const visorGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.04, 16, 1, false, 0, Math.PI);
        const visor = new THREE.Mesh(visorGeo, capMat);
        visor.position.set(0, 0, 0.2);
        capGroup.add(dome);
        capGroup.add(visor);
        capGroup.position.set(0, 1.35, 0.4);
        scene.add(capGroup);

        // 3. Green Cloth Gamusa Bag
        const bagGroup = new THREE.Group();
        const bagBodyGeo = new THREE.BoxGeometry(0.6, 0.5, 0.3);
        const bagMat = new THREE.MeshStandardMaterial({ color: "#10B981", roughness: 0.7 });
        const bagBody = new THREE.Mesh(bagBodyGeo, bagMat);
        const handleGeo = new THREE.TorusGeometry(0.2, 0.03, 8, 16, Math.PI);
        const handle = new THREE.Mesh(handleGeo, bagMat);
        handle.position.set(0, 0.3, 0);
        bagGroup.add(bagBody);
        bagGroup.add(handle);
        bagGroup.position.set(1.5, 1.45, 0.4);
        scene.add(bagGroup);
      }
    } else if (currentChapter === 3) {
      // Village Walking Path Scene
      const pathGeo = new THREE.PlaneGeometry(3.5, 30);
      const pathMat = new THREE.MeshStandardMaterial({ color: "#D97706", roughness: 0.8 });
      const path = new THREE.Mesh(pathGeo, pathMat);
      path.rotation.x = -Math.PI / 2;
      path.position.set(0, 0.02, 0);
      scene.add(path);

      // Namghar Landmark
      const namgharGeo = new THREE.BoxGeometry(3, 2.5, 3);
      const namgharMat = new THREE.MeshStandardMaterial({ color: "#DC2626" });
      const namghar = new THREE.Mesh(namgharGeo, namgharMat);
      namghar.position.set(-4, 1.25, -2);
      scene.add(namghar);

      // Green Tea Bushes
      for (let i = -8; i <= 8; i += 3) {
        const bushGeo = new THREE.DodecahedronGeometry(0.8, 1);
        const bushMat = new THREE.MeshStandardMaterial({ color: "#166534" });
        const bush = new THREE.Mesh(bushGeo, bushMat);
        bush.position.set(3.5, 0.6, i);
        scene.add(bush);
      }
    } else if (currentChapter === 4) {
      // Marketplace Stalls
      const stallGeo = new THREE.BoxGeometry(2.5, 1.8, 2);
      const stallMat = new THREE.MeshStandardMaterial({ color: "#B45309" });
      const stall = new THREE.Mesh(stallGeo, stallMat);
      stall.position.set(-2.5, 0.9, -1);
      scene.add(stall);

      const canopyGeo = new THREE.ConeGeometry(2, 0.8, 4);
      const canopyMat = new THREE.MeshStandardMaterial({ color: "#EF4444" });
      const canopy = new THREE.Mesh(canopyGeo, canopyMat);
      canopy.position.set(-2.5, 2.2, -1);
      canopy.rotation.y = Math.PI / 4;
      scene.add(canopy);
    }

    // Animation Loop with Gentle Camera Sway
    let clock = 0;
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);
      clock += 0.015;
      camera.position.x = Math.sin(clock * 0.4) * 0.4;
      camera.lookAt(0, 1.2, 0);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener("resize", handleResize);
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const m = Array.isArray(obj.material) ? obj.material : [obj.material];
          m.forEach((mm) => mm.dispose());
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [currentChapter]);

  // Transmit Session Telemetry
  const sendSessionTelemetry = useCallback(
    async (finalAccuracy: number) => {
      const durationSeconds = startTimeRef.current
        ? Math.max(15, Math.round((Date.now() - startTimeRef.current) / 1000))
        : 60;
      const payload: GameSessionPayload = {
        patientId: 1,
        gameType: "DAY_IN_MY_WORLD",
        durationSeconds,
        accuracyPercentage: finalAccuracy,
        spatialRecallScore: Math.round(finalAccuracy),
        motorReactionTimeMs: 780,
        hesitationCount: hesitationCountRef.current,
        difficultyLevel: currentChapter,
      };

      try {
        await api.post("/patients/1/sessions", payload);
      } catch {
        // Safe offline fallback
      }
    },
    [currentChapter]
  );

  // Start Journey
  const handleStartGame = () => {
    setHasStarted(true);
    startTimeRef.current = Date.now();
    playSound("bell");
    speakVoice(m.saathiWakeup);
  };

  // Chapter 1: Collect Item
  const handleCollectItem = (id: "key" | "cap" | "bag") => {
    playSound("correct");
    setCh1Items((prev) =>
      prev.map((it) => (it.id === id ? { ...it, collected: true } : it))
    );

    const updated = ch1Items.map((it) => (it.id === id ? { ...it, collected: true } : it));
    const allDone = updated.every((it) => it.collected);

    if (allDone) {
      setScore((s) => s + 20);
      playSound("fanfare");
      speakVoice(m.ch1Complete);
      setTimeout(() => {
        setCurrentChapter(2);
        speakVoice(m.ch2Intro);
      }, 2000);
    }
  };

  // Chapter 2: Choose Photo
  const handleChoosePhoto = (index: number) => {
    setCh2SelectedPhoto(index);
    if (index === 1) {
      playSound("fanfare");
      setScore((s) => s + 20);
      setCh2Feedback(m.ch2FeedbackCorrect);
      speakVoice(m.ch2Success);
      setTimeout(() => {
        setCurrentChapter(3);
        setCh2Feedback(null);
        speakVoice(m.ch3Intro);
      }, 2200);
    } else {
      playSound("click");
      setCh2Feedback(m.ch2FeedbackRetry);
    }
  };

  // Chapter 3: Spatial Path Decision
  const handlePathChoice = (choiceIndex: number) => {
    setCh3Choice(choiceIndex);
    if (choiceIndex === 0) {
      playSound("fanfare");
      setScore((s) => s + 20);
      setCh3Feedback(m.ch3FeedbackCorrect);
      speakVoice(m.ch3Success);
      setTimeout(() => {
        setCurrentChapter(4);
        setCh3Feedback(null);
        speakVoice(m.ch4Intro);
      }, 2200);
    } else {
      playSound("click");
      setCh3Feedback(m.ch3FeedbackRetry);
    }
  };

  // Chapter 4: Market Payment & Change
  const handleMarketChangeAnswer = (ans: number) => {
    setCh4ChangeAnswer(ans);
    // Bill = 60 (Tea) + 80 (Rice) = 140. Paid = 200. Change = 60.
    if (ans === 60) {
      playSound("fanfare");
      setScore((s) => s + 20);
      setCh4Feedback(m.ch4FeedbackCorrect);
      speakVoice(m.ch4Success);
      setTimeout(() => {
        setCurrentChapter(5);
        setCh4Feedback(null);
        speakVoice(m.ch5Intro);
      }, 2200);
    } else {
      playSound("click");
      setCh4Feedback(m.ch4FeedbackRetry);
    }
  };

  // Chapter 5: Routine Decision
  const handleCh5Choice = (index: number) => {
    setCh5Selected(index);
    if (index === 0) {
      playSound("fanfare");
      setScore((s) => s + 20);
      setCh5Feedback(m.ch5FeedbackCorrect);
      speakVoice(m.ch5Success);
      setTimeout(() => {
        setCurrentChapter(6);
        setCh5Feedback(null);
        speakVoice(m.ch6Intro);
      }, 2200);
    } else {
      playSound("click");
      setCh5Feedback(m.ch5FeedbackRetry);
    }
  };

  // Chapter 6: Chronological Memory Slots
  const handleCh6Reconstruct = (stepId: number) => {
    if (ch6Slots.includes(stepId)) return;
    playSound("click");
    const nextSlots = [...ch6Slots, stepId];
    setCh6Slots(nextSlots);

    if (nextSlots.length === 4) {
      playSound("bell");
      setScore((s) => s + 20);
      setTimeout(() => {
        setIsCompleted(true);
        playSound("fanfare");
        sendSessionTelemetry(100);
        speakVoice(m.completionVoice);
      }, 1000);
    }
  };

  const handleRestart = () => {
    setCurrentChapter(1);
    setHasStarted(false);
    setIsCompleted(false);
    setScore(0);
    setCh1Memorized(false);
    setCh1Items([
      { id: "key", name: "House Key", pos: [-2, 1.3, 0], collected: false },
      { id: "cap", name: "Sun Cap", pos: [0, 1.3, 0], collected: false },
      { id: "bag", name: "Cloth Bag", pos: [2, 1.3, 0], collected: false },
    ]);
    setCh6Slots([]);
  };

  return (
    <div className="relative flex flex-col items-center p-3 sm:p-5 text-ink">
      {/* Floating Spoken Voice Subtitles (Positioned safely below navigation bars) */}
      {currentSubtitle && (
        <div className="fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-full border-3 border-black bg-amber-200 px-6 py-2 shadow-[4px_4px_0px_#000] animate-fade-in max-w-lg text-center pointer-events-none">
          <p className="font-serif text-sm sm:text-base font-black text-amber-950 flex items-center justify-center gap-2">
            <Speech className="h-4 w-4 text-tea shrink-0" />
            <span>Saathi: &ldquo;{currentSubtitle}&rdquo;</span>
          </p>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="flex w-full items-center justify-between border-b-2 border-black/15 pb-2.5 mb-2">
        <div className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000]">
          <Sparkles className="h-3.5 w-3.5 text-tea" />
          <span>{m.chapterOf(currentChapter, 6)}</span>
        </div>

        <div className="text-center">
          <h1 className="font-serif text-lg sm:text-xl font-black text-ink">
            {m.title}
          </h1>
          <p className="text-[10px] font-bold text-ink-secondary uppercase tracking-wider">
            {m.subTitle}
          </p>
        </div>

        <button
          type="button"
          onClick={toggleMute}
          className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-100 px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-200 cursor-pointer"
          aria-label={isMuted ? m.unmuteAria : m.muteAria}
        >
          {isMuted ? (
            <>
              <VolumeX className="h-4 w-4 text-rose-700" />
              <span>{m.muted}</span>
            </>
          ) : (
            <>
              <Volume2 className="h-4 w-4 text-emerald-800" />
              <span>{m.voiceOn}</span>
            </>
          )}
        </button>
      </div>

      {/* 3D Cinematic Scene Viewport (Compact Height to ensure full playability) */}
      <div className="w-full overflow-hidden rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] mb-3">
        <div ref={mountRef} className="w-full h-44 sm:h-52 bg-amber-100 block" />
      </div>

      {/* Narrative Interactive Play Area */}
      {!hasStarted ? (
        /* Start Screen */
        <div className="my-2 flex flex-col items-center text-center space-y-3 max-w-lg">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-black bg-amber-300 text-amber-950 shadow-[3px_3px_0px_#000]">
            <Sun className="h-9 w-9" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-ink">
            {m.welcomeTitle}
          </h2>
          <p className="text-sm sm:text-base font-bold text-ink-secondary leading-relaxed max-w-md">
            {m.welcomeDesc}
          </p>

          <button
            type="button"
            onClick={handleStartGame}
            className="btn-tactile flex items-center justify-center gap-2 rounded-full border-3 border-black bg-amber-400 px-8 py-3 text-base sm:text-lg font-black text-black shadow-[4px_4px_0px_#000] hover:bg-amber-300 cursor-pointer transition-transform active:translate-y-0.5"
          >
            <span>{m.beginDayButton}</span>
            <Sunrise className="h-5 w-5" />
          </button>
        </div>
      ) : isCompleted ? (
        /* Complete Screen */
        <div className="my-3 flex flex-col items-center text-center space-y-4 max-w-lg animate-fade-in">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-3 border-black bg-emerald-200 text-emerald-950 shadow-[4px_4px_0px_#000]">
            <Award className="h-10 w-10 text-emerald-800" />
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-ink">
            {m.finalDayCompleteTitle}
          </h2>
          <p className="text-xs sm:text-sm font-bold text-ink-secondary">
            {m.finalDayCompleteDesc}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleRestart}
              className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-300 px-6 py-2.5 text-sm font-black text-black shadow-[3px_3px_0px_#000] hover:bg-amber-400 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{m.reliveDayButton}</span>
            </button>
            <Link
              href="/patient/games"
              className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-6 py-2.5 text-sm font-black text-ink shadow-[3px_3px_0px_#000] hover:bg-surface-muted cursor-pointer"
            >
              <span>{m.backToHub}</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Active Chapter Interactive Area */
        <div className="w-full space-y-3">
          {/* Chapter Stepper Ribbon */}
          <div className="flex items-center justify-between rounded-xl border-2 border-black bg-amber-100/90 px-3 py-1.5 text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-tea shrink-0" />
              <span>{m.chapterOf(currentChapter, 6)}:{" "}</span>
              <strong className="font-serif text-sm font-black text-ink">
                {currentChapter === 1
                  ? m.ch1Title
                  : currentChapter === 2
                  ? m.ch2Title
                  : currentChapter === 3
                  ? m.ch3Title
                  : currentChapter === 4
                  ? m.ch4Title
                  : currentChapter === 5
                  ? m.ch5Title
                  : m.ch6Title}
              </strong>
            </span>
            <span className="font-serif font-black text-xs bg-surface px-2.5 py-0.5 rounded-lg border border-black">
              {m.score(score)}
            </span>
          </div>

          {/* CHAPTER 1: Memorize & Collect Morning Essentials */}
          {currentChapter === 1 && (
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-4 sm:p-5 text-center space-y-3 shadow-[3px_3px_0px_#000]">
              {!ch1Memorized ? (
                <>
                  <h3 className="font-serif text-lg sm:text-xl font-black text-ink flex items-center justify-center gap-1.5">
                    <Key className="h-5 w-5 text-amber-600 shrink-0" />
                    <span>{m.ch1MemorizeTitle}</span>
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-ink-secondary">
                    {m.ch1MemorizeDesc}
                  </p>

                  <div className="grid grid-cols-3 gap-2.5 py-2 max-w-sm mx-auto">
                    {ch1Items.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col items-center rounded-xl border-2 border-black bg-surface p-3 shadow-[2px_2px_0px_#000]"
                      >
                        <div className="h-10 flex items-center justify-center">
                          <ItemIcon id={item.id} />
                        </div>
                        <span className="font-serif text-xs font-black text-ink mt-1">
                          {getItemName(item.id, m)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setCh1Memorized(true);
                      playSound("click");
                      speakVoice(m.ch1FindPrompt);
                    }}
                    className="btn-tactile inline-flex items-center gap-2 rounded-full border-3 border-black bg-amber-400 px-6 py-2.5 text-sm sm:text-base font-black text-black shadow-[3px_3px_0px_#000] hover:bg-amber-300 cursor-pointer"
                  >
                    <span>{m.ch1ReadyButton}</span>
                    <CheckCircle2 className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <h3 className="font-serif text-lg sm:text-xl font-black text-ink flex items-center justify-center gap-1.5">
                    <Search className="h-5 w-5 text-tea shrink-0" />
                    <span>{m.ch1FindTitle}</span>
                  </h3>
                  <p className="text-xs font-bold text-ink-secondary">
                    {m.ch1TapDesc}
                  </p>

                  <div className="grid grid-cols-3 gap-2.5 py-2 max-w-sm mx-auto">
                    {ch1Items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        disabled={item.collected}
                        onClick={() => handleCollectItem(item.id)}
                        className={`btn-tactile flex flex-col items-center rounded-xl border-2 border-black p-3 shadow-[2px_2px_0px_#000] transition-all cursor-pointer ${
                          item.collected
                            ? "bg-emerald-100 opacity-60 cursor-not-allowed"
                            : "bg-surface hover:bg-amber-200"
                        }`}
                      >
                        <div className="h-10 flex items-center justify-center">
                          <ItemIcon id={item.id} />
                        </div>
                        <span className="font-serif text-xs font-black text-ink mt-1 flex items-center gap-1">
                          {item.collected ? (
                            <>
                              <span>{m.ch1Collected}</span>
                              <Check className="h-3 w-3 text-emerald-700" />
                            </>
                          ) : (
                            m.ch1TakeItem(getItemName(item.id, m))
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* CHAPTER 2: Missing Photograph */}
          {currentChapter === 2 && (
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-4 sm:p-5 text-center space-y-3 shadow-[3px_3px_0px_#000]">
              <h3 className="font-serif text-lg sm:text-xl font-black text-ink flex items-center justify-center gap-1.5">
                <ImageIcon className="h-5 w-5 text-tea" />
                <span>{m.ch2Prompt}</span>
              </h3>
              <p className="text-xs sm:text-sm font-bold text-ink-secondary">
                {m.ch2Subtext}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {[
                  { id: 0, label: m.ch2OptTrain, icon: Train },
                  { id: 1, label: m.ch2OptCourtyard, icon: Home },
                  { id: 2, label: m.ch2OptOffice, icon: Building2 },
                ].map((ph) => {
                  const IconComp = ph.icon;
                  return (
                    <button
                      key={ph.id}
                      type="button"
                      onClick={() => handleChoosePhoto(ph.id)}
                      className={`btn-tactile flex items-center justify-center gap-2 rounded-xl border-2 border-black p-3 text-xs sm:text-sm font-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                        ch2SelectedPhoto === ph.id && ph.id === 1
                          ? "bg-emerald-200 text-emerald-950"
                          : "bg-surface hover:bg-amber-100 text-ink"
                      }`}
                    >
                      <IconComp className="h-4 w-4 shrink-0 text-tea" />
                      <span>{ph.label}</span>
                    </button>
                  );
                })}
              </div>

              {ch2Feedback && (
                <p className="text-xs font-black text-tea-dark">{ch2Feedback}</p>
              )}
            </div>
          )}

          {/* CHAPTER 3: Spatial Road Navigation */}
          {currentChapter === 3 && (
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-4 sm:p-5 text-center space-y-3 shadow-[3px_3px_0px_#000]">
              <h3 className="font-serif text-lg sm:text-xl font-black text-ink flex items-center justify-center gap-1.5">
                <Compass className="h-5 w-5 text-tea" />
                <span>{m.ch3Question}</span>
              </h3>
              <p className="text-xs sm:text-sm font-bold text-ink-secondary">
                {m.ch3Subtext}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                {[
                  { id: 0, label: m.ch3OptRiver, icon: Sailboat },
                  { id: 1, label: m.ch3OptHighway, icon: Car },
                  { id: 2, label: m.ch3OptForest, icon: Trees },
                ].map((p) => {
                  const IconComp = p.icon;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handlePathChoice(p.id)}
                      className={`btn-tactile flex items-center justify-center gap-2 rounded-xl border-2 border-black p-3 text-xs sm:text-sm font-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                        ch3Choice === p.id && p.id === 0
                          ? "bg-emerald-200 text-emerald-950"
                          : "bg-surface hover:bg-amber-100 text-ink"
                      }`}
                    >
                      <IconComp className="h-4 w-4 shrink-0 text-tea" />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>

              {ch3Feedback && (
                <p className="text-xs font-black text-tea-dark">{ch3Feedback}</p>
              )}
            </div>
          )}

          {/* CHAPTER 4: Market Shopping & Currency Calculation */}
          {currentChapter === 4 && (
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-4 sm:p-5 text-center space-y-3 shadow-[3px_3px_0px_#000]">
              <h3 className="font-serif text-lg sm:text-xl font-black text-ink flex items-center justify-center gap-1.5">
                <ShoppingBag className="h-5 w-5 text-tea" />
                <span>{m.ch4Prompt}</span>
              </h3>
              <p className="text-xs font-bold text-ink-secondary leading-relaxed">
                {m.ch4Subtext}
              </p>

              <div className="grid grid-cols-3 gap-2.5 pt-1 max-w-sm mx-auto">
                {[40, 60, 80].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleMarketChangeAnswer(amt)}
                    className={`btn-tactile rounded-xl border-2 border-black p-3 text-sm font-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                      ch4ChangeAnswer === amt && amt === 60
                        ? "bg-emerald-200 text-emerald-950"
                        : "bg-surface hover:bg-amber-100 text-ink"
                    }`}
                  >
                    {m.ch4ChangeOption(amt)}
                  </button>
                ))}
              </div>

              {ch4Feedback && (
                <p className="text-xs font-black text-tea-dark">{ch4Feedback}</p>
              )}
            </div>
          )}

          {/* CHAPTER 5: Routine Decision */}
          {currentChapter === 5 && (
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-4 sm:p-5 text-center space-y-3 shadow-[3px_3px_0px_#000]">
              <h3 className="font-serif text-lg sm:text-xl font-black text-ink flex items-center justify-center gap-1.5">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <span>{m.ch5Prompt}</span>
              </h3>
              <p className="text-xs sm:text-sm font-bold text-ink-secondary">
                {m.ch5Subtext}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 max-w-md mx-auto">
                {[
                  { id: 0, label: m.ch5OptRest, icon: Droplets },
                  { id: 1, label: m.ch5OptRun, icon: Sun },
                ].map((c) => {
                  const IconComp = c.icon;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleCh5Choice(c.id)}
                      className={`btn-tactile flex items-center justify-center gap-2 rounded-xl border-2 border-black p-3 text-xs sm:text-sm font-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                        ch5Selected === c.id && c.id === 0
                          ? "bg-emerald-200 text-emerald-950"
                          : "bg-surface hover:bg-amber-100 text-ink"
                      }`}
                    >
                      <IconComp className="h-4 w-4 shrink-0 text-tea" />
                      <span>{c.label}</span>
                    </button>
                  );
                })}
              </div>

              {ch5Feedback && (
                <p className="text-xs font-black text-tea-dark">{ch5Feedback}</p>
              )}
            </div>
          )}

          {/* CHAPTER 6: Chronological Ordering */}
          {currentChapter === 6 && (
            <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-4 sm:p-5 text-center space-y-3 shadow-[3px_3px_0px_#000]">
              <h3 className="font-serif text-lg sm:text-xl font-black text-ink flex items-center justify-center gap-1.5">
                <Sunrise className="h-5 w-5 text-amber-600" />
                <span>{m.ch6Prompt}</span>
              </h3>
              <p className="text-xs font-bold text-ink-secondary">
                {m.ch6Subtext}
              </p>

              <div className="grid grid-cols-2 gap-2 max-w-md mx-auto pt-1">
                {[
                  { id: 1, label: m.ch6Step1 },
                  { id: 2, label: m.ch6Step2 },
                  { id: 3, label: m.ch6Step3 },
                  { id: 4, label: m.ch6Step4 },
                ].map((step) => {
                  const isSelected = ch6Slots.includes(step.id);
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => handleCh6Reconstruct(step.id)}
                      className={`btn-tactile flex items-center justify-center gap-1.5 rounded-xl border-2 border-black p-2.5 text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer ${
                        isSelected
                          ? "bg-emerald-200 text-emerald-950 border-emerald-700"
                          : "bg-surface hover:bg-amber-100 text-ink"
                      }`}
                    >
                      <span>{step.label}</span>
                      {isSelected && <Check className="h-3 w-3 text-emerald-800" />}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-black text-tea-dark pt-1">
                {m.ch6RecalledCount(ch6Slots.length)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
