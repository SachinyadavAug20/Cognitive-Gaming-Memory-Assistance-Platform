"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Camera,
  RotateCcw,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  Leaf,
  Citrus,
  Flower2,
  Hand,
  Zap,
  Sparkles,
} from "lucide-react";
import { AssamTeaLeafIcon, KazirangaButterflyIcon } from "@/components/ui/CulturalIcons";
import { GameShell } from "@/components/games/GameShell";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import {
  OpticalMotionTracker,
  drawOpenCvOverlay,
  type MotionEvent,
} from "@/lib/vision";
import { getGameStrings } from "@/lib/gameI18n";

interface FallingItem {
  id: number;
  type: "tea_leaf" | "butterfly" | "orange" | "flower";
  name: string;
  x: number; // 0..1 horizontal normalized
  y: number; // 0..1 vertical normalized
  speed: number;
  size: number;
  caught: boolean;
  handSide: "left" | "right" | "center";
}

function renderFallingItemIcon(type: FallingItem["type"], className = "h-8 w-8") {
  switch (type) {
    case "tea_leaf":
      return <AssamTeaLeafIcon className={`${className} text-emerald-400`} />;
    case "butterfly":
      return <KazirangaButterflyIcon className={`${className} text-amber-300`} />;
    case "orange":
      return <Citrus className={`${className} text-amber-400`} />;
    case "flower":
      return <Flower2 className={`${className} text-rose-400`} />;
  }
}

const TEA_CATCH_I18N: Record<string, {
  paperclip: string;
  cvHeader: string;
  cvFeat1: string;
  cvFeat2: string;
  cvFeat3: string;
  harvestProgress: string;
  goalReached: string;
  itemsLeft: (n: number) => string;
  bilateralSymmetry: string;
  balanced: string;
  motorLatency: string;
  leftZone: string;
  rightZone: string;
  waveHands: string;
  leftActive: string;
  rightActive: string;
  touchTray: string;
  tapToHarvest: string;
  cameraOn: string;
  cameraOff: string;
  voiceGuide: string;
  voiceIntro: string;
  celebTitle: string;
  celebSub: string;
  clinicalSummary: string;
  harvestedTag: string;
  equalReach: string;
  fastReflex: string;
  ashaNote: string;
  playAgain: string;
  backSuite: string;
  items: Record<FallingItem["type"], string>;
}> = {
  en: {
    paperclip: "Hand Movement & Harvest",
    cvHeader: "Advanced Computer Vision & Neuro-Motor Features:",
    cvFeat1: "Real-time dual-hand tracking with bilateral reaching zones (Left & Right)",
    cvFeat2: "Sub-pixel micro-tremor & motor reaction latency telemetry extraction",
    cvFeat3: "100% In-Browser Privacy (No video transmitted or stored anywhere)",
    harvestProgress: "Harvest Progress",
    goalReached: "Goal Reached!",
    itemsLeft: (n: number) => `${n} items left to harvest`,
    bilateralSymmetry: "Bilateral Symmetry",
    balanced: "% Balanced",
    motorLatency: "Motor Latency",
    leftZone: "Left Zone",
    rightZone: "Right Zone",
    waveHands: "Wave Hands to Catch",
    leftActive: "Left Hand Active",
    rightActive: "Right Hand Active",
    touchTray: "Quick Touch Catch Tray (Or Wave Hands on Camera):",
    tapToHarvest: "Tap to Harvest",
    cameraOn: "OpenCV Camera Vision: ON",
    cameraOff: "Turn On Camera Vision",
    voiceGuide: "Voice Guide",
    voiceIntro: "Welcome to the Assam Tea Garden. Reach with your left or right hand to catch the golden leaves and butterflies fluttering down.",
    celebTitle: "Tea Garden Harvest Complete!",
    celebSub: "You demonstrated outstanding bilateral motor range, sharp kinesthetic coordination, and steady hand control.",
    clinicalSummary: "OpenCV Kinesthetic Clinical Summary",
    harvestedTag: "8/8 Harvested",
    equalReach: "Equal left & right reach",
    fastReflex: "Fast visual-motor reflex",
    ashaNote: "ASHA Clinical Observation: Patient exhibits smooth bilateral motor flexion with minimal micro-hesitation. Recommended for continuing daily upper-body kinesthetic stimulation.",
    playAgain: "Play Again",
    backSuite: "← Back to Therapy Suite",
    items: {
      tea_leaf: "Golden Tea Leaf",
      butterfly: "Kaziranga Butterfly",
      orange: "Assam Mandarin Orange",
      flower: "Kopou Orchid",
    },
  },
  as: {
    paperclip: "হাতৰ সঞ্চালন আৰু পাত সংগ্ৰহ",
    cvHeader: "উন্নত কম্পিউটাৰ ভিজন আৰু স্নায়ু-মোটৰ বৈশিষ্ট্য:",
    cvFeat1: "দুয়োখন হাতৰ ৰিয়েল-টাইম ট্ৰেকিং (বাওঁ আৰু সোঁ এলেকা)",
    cvFeat2: "মাইক্ৰ’-ট্ৰেমৰ আৰু প্ৰতিক্ৰিয়া সময়ৰ টেলিমেট্ৰি বিশ্লেষণ",
    cvFeat3: "সম্পূৰ্ণ ব্ৰাউজাৰভিত্তিক গোপনীয়তা (কোনো ভিডিঅ’ সংৰক্ষণ নহয়)",
    harvestProgress: "সংগ্ৰহৰ অগ্ৰগতি",
    goalReached: "লক্ষ্য প্ৰাপ্ত হ'ল!",
    itemsLeft: (n: number) => `আৰু ${n} টা বস্তু তুলিবলৈ বাকী`,
    bilateralSymmetry: "দুয়ো হাতৰ সমতা",
    balanced: "% সমতুল্য",
    motorLatency: "প্ৰতিক্ৰিয়া সময়",
    leftZone: "বাওঁ অংশ",
    rightZone: "সোঁ অংশ",
    waveHands: "ধৰিবলৈ হাত জোকাৰক",
    leftActive: "বাওঁ হাত সক্ৰিয়",
    rightActive: "সোঁ হাত সক্ৰিয়",
    touchTray: "স্পৰ্শ কৰি সংগ্ৰহ কৰক (বা কেমেৰাত হাত জোকাৰক):",
    tapToHarvest: "সংগ্ৰহ কৰিবলৈ স্পৰ্শ কৰক",
    cameraOn: "কেমেৰা ভিজন: অন",
    cameraOff: "কেমেৰা অন কৰক",
    voiceGuide: "শব্দ নিৰ্দেশনা",
    voiceIntro: "অসমৰ চাহ বাগিচালৈ স্বাগতম। সৰি পৰা সোণালী চাহপাত আৰু পখিলাবোৰ ধৰিবলৈ হাত আগবঢ়াওক।",
    celebTitle: "চাহ বাগিচাৰ শস্য চপোৱা সম্পূৰ্ণ!",
    celebSub: "আপুনি দুয়োখন হাতেৰে সুন্দৰ সমন্বয় আৰু নিয়ন্ত্ৰণ প্ৰদৰ্শন কৰিলে।",
    clinicalSummary: "কাইনেস্থেটিক ক্লিনিকেল সাৰাংশ",
    harvestedTag: "৮/৮ সংগৃহীত",
    equalReach: "বাওঁ আৰু সোঁ হাতৰ সমান বিস্তাৰ",
    fastReflex: "দ্ৰুত দৃশ্য-মোটৰ প্ৰতিফলন",
    ashaNote: "আশা স্বাস্থ্য পৰ্যবেক্ষণ: ৰোগীৰ দুই হাতৰ সঞ্চালন অতি মসৃণ। নিতৌ এনে শাৰীৰিক ব্যায়াম অব্যাহত ৰখাৰ পৰামৰ্শ দিয়া হ'ল।",
    playAgain: "পুনৰ খেলক",
    backSuite: "← থেৰাপী কক্ষলৈ উভতি যাওক",
    items: {
      tea_leaf: "সোণালী চাহপাত",
      butterfly: "কাজিৰঙাৰ পখিলা",
      orange: "অসমৰ কমলা",
      flower: "কপৌ ফুল",
    },
  },
  hi: {
    paperclip: "हाथ संचालन और पत्ती संचयन",
    cvHeader: "उन्नत कंप्यूटर विज़न एवं न्यूरो-मोटर विशेषताएं:",
    cvFeat1: "दोनों हाथों की रीयल-टाइम ट्रैकिंग (बायां एवं दायां क्षेत्र)",
    cvFeat2: "माइक्रो-कंपन एवं प्रतिक्रिया समय की टेलीमेट्री माप",
    cvFeat3: "100% ब्राउज़र गोपनीयता (कोई वीडियो सुरक्षित या भेजा नहीं जाता)",
    harvestProgress: "संचयन प्रगति",
    goalReached: "लक्ष्य पूरा हुआ!",
    itemsLeft: (n: number) => `संग्रह के लिए ${n} वस्तुएं शेष`,
    bilateralSymmetry: "द्विपक्षीय संतुलन",
    balanced: "% संतुलित",
    motorLatency: "प्रतिक्रिया समय",
    leftZone: "बायां क्षेत्र",
    rightZone: "दायां क्षेत्र",
    waveHands: "पकड़ने के लिए हाथ हिलाएं",
    leftActive: "बायां हाथ सक्रिय",
    rightActive: "दायां हाथ सक्रिय",
    touchTray: "स्पर्श करके पकड़ें (या कैमरे के सामने हाथ हिलाएं):",
    tapToHarvest: "संग्रह करने के लिए टैप करें",
    cameraOn: "कैमरा विज़न: चालू",
    cameraOff: "कैमरा चालू करें",
    voiceGuide: "आवाज़ मार्गदर्शन",
    voiceIntro: "असम के चाय बागान में स्वागत है। गिरती हुई सुनहरी पत्तियों और तितलियों को पकड़ने के लिए अपने हाथ बढ़ाएं।",
    celebTitle: "चाय बागान संचयन पूर्ण!",
    celebSub: "आपने दोनों हाथों से शानदार समन्वय, गति और संतुलन का प्रदर्शन किया।",
    clinicalSummary: "गतिशील नैदानिक सारांश",
    harvestedTag: "8/8 संचित",
    equalReach: "दाएं और बाएं हाथ की समान पहुंच",
    fastReflex: "तीव्र दृश्य-मोटर प्रतिवर्त",
    ashaNote: "आशा नैदानिक अवलोकन: मरीज का दोनों हाथों का संचालन सहज है। ऊपरी शरीर के नियमित व्यायाम हेतु अनुशंसित।",
    playAgain: "फिर से खेलें",
    backSuite: "← थेरेपी सूची पर वापस",
    items: {
      tea_leaf: "सुनहरी चाय पत्ती",
      butterfly: "काजीरंगा तितली",
      orange: "असम संतरा",
      flower: "कपोऊ फूल",
    },
  },
  bn: {
    paperclip: "হাত সঞ্চালন ও পাতা সংগ্রহ",
    cvHeader: "উন্নত কম্পিউটার ভিশন ও নিউরো-মোটর বৈশিষ্ট্য:",
    cvFeat1: "উভয় হাতের রিয়েল-টাইম ট্র্যাকিং (বাম ও ডান অঞ্চল)",
    cvFeat2: "মাইক্রো-কম্পন ও প্রতিক্রিয়া সময়ের টেলিমেট্রি বিশ্লেষণ",
    cvFeat3: "১০০% ব্রাউজার ভিত্তিক গোপনীয়তা (কোন ভিডিও পাঠানো বা রাখা হয় না)",
    harvestProgress: "সংগ্রহের অগ্রগতি",
    goalReached: "লক্ষ্য পূর্ণ হয়েছে!",
    itemsLeft: (n: number) => `আর ${n} টি জিনিস সংগ্রহ বাকি`,
    bilateralSymmetry: "উভয় হাতের ভারসাম্য",
    balanced: "% ভারসাম্যপূর্ণ",
    motorLatency: "প্রতিক্রিয়া সময়",
    leftZone: "বাম অঞ্চল",
    rightZone: "ডান অঞ্চল",
    waveHands: "ধরতে হাত নাড়ুন",
    leftActive: "বাম হাত সক্রিয়",
    rightActive: "ডান হাত সক্রিয়",
    touchTray: "স্পর্শ করে সংগ্রহ করুন (অথবা ক্যামেরায় হাত নাড়ুন):",
    tapToHarvest: "সংগ্রহ করতে ট্যাপ করুন",
    cameraOn: "ক্যামেরা ভিশন: চালু",
    cameraOff: "ক্যামেরা চালু করুন",
    voiceGuide: "কণ্ঠ নির্দেশিকা",
    voiceIntro: "আসামের চা বাগানে স্বাগতম। ঝরে পড়া সোনালী চা পাতা ও প্রজাপতি ধরতে হাত বাড়ান।",
    celebTitle: "চা বাগানের সংগ্রহ সম্পন্ন!",
    celebSub: "আপনি উভয় হাতে চমৎকার মোটর সমন্বয় এবং নিয়ন্ত্রণ প্রদর্শন করেছেন।",
    clinicalSummary: "কাইনেস্থেটিক ক্লিনিকাল সারাংশ",
    harvestedTag: "৮/৮ সংগৃহীত",
    equalReach: "বাম ও ডান হাতের সমান নাগাল",
    fastReflex: "দ্রুত ভিজ্যুয়াল-মোটর রিফ্লেক্স",
    ashaNote: "আশা ক্লিনিকাল পর্যবেক্ষণ: রোগীর দুই হাতের সঞ্চালন সাবলীল। প্রতিদিন এই ব্যায়াম করার পরামর্শ দেওয়া হলো।",
    playAgain: "আবার খেলুন",
    backSuite: "← থেরাপি স্যুটে ফিরে যান",
    items: {
      tea_leaf: "সোনালী চা পাতা",
      butterfly: "কাজিরাঙা প্রজাপতি",
      orange: "আসামের কমলা",
      flower: "কপৌ ফুল",
    },
  },
  mr: {
    paperclip: "हात हालचाल आणि पान संकलन",
    cvHeader: "प्रगत संगणक दृष्टी आणि न्यूरो-मोटर वैशिष्ट्ये:",
    cvFeat1: "दोन्ही हातांचे रिअल-टाइम ट्रॅकिंग (डावे आणि उजवे क्षेत्र)",
    cvFeat2: "सूक्ष्म कंपन आणि प्रतिसाद वेळ टेलिमेट्री मापन",
    cvFeat3: "१००% ब्राउझर गोपनीयता (कोणताही व्हिडिओ साठवला जात नाही)",
    harvestProgress: "संकलन प्रगती",
    goalReached: "ध्येय पूर्ण झाले!",
    itemsLeft: (n: number) => `गोळा करण्यासाठी आणखी ${n} वस्तू बाकी`,
    bilateralSymmetry: "द्विपक्षीय सममिती",
    balanced: "% संतुलित",
    motorLatency: "प्रतिसाद वेळ",
    leftZone: "डावा भाग",
    rightZone: "उजवा भाग",
    waveHands: "पकडण्यासाठी हात हलवा",
    leftActive: "डावा हात सक्रिय",
    rightActive: "उजवा हात सक्रिय",
    touchTray: "स्पर्श करून गोळा करा (किंवा कॅमेऱ्यावर हात हलवा):",
    tapToHarvest: "गोळा करण्यासाठी टॅप करा",
    cameraOn: "कॅमेरा दृष्टी: चालू",
    cameraOff: "कॅमेरा चालू करा",
    voiceGuide: "आवाज मार्गदर्शन",
    voiceIntro: "आसामच्या चहाच्या बागेत आपले स्वागत आहे. पडणारी पाने आणि फुलपाखरे पकडण्यासाठी हात पुढे करा.",
    celebTitle: "चहा बाग संकलन पूर्ण!",
    celebSub: "तुम्ही दोन्ही हातांचा उत्तम समन्वय आणि नियंत्रण दाखवले आहे.",
    clinicalSummary: "कायनेस्थेटिक क्लिनिकल सारांश",
    harvestedTag: "८/८ संकलित",
    equalReach: "डाव्या आणि उजव्या हाताची समान पोहोच",
    fastReflex: "जलद दृश्य-मोटर प्रतिक्षिप्त क्रिया",
    ashaNote: "आशा क्लिनिकल निरीक्षण: रुग्णाची हालचाल सुलभ आहे. नियमित वरच्या शरीराच्या व्यायामाची शिफारस केली जाते.",
    playAgain: "पुन्हा खेळा",
    backSuite: "← थेरपी कक्षात परत जा",
    items: {
      tea_leaf: "सोनेरी चहाचे पान",
      butterfly: "काझीरंगा फुलपाखरू",
      orange: "आसाम संत्री",
      flower: "कपोऊ फूल",
    },
  },
  ne: {
    paperclip: "हातको चाल र पत्ती संकलन",
    cvHeader: "उन्नत कम्प्युटर दृष्टि र न्यूरो-मोटर सुविधाहरू:",
    cvFeat1: "दुवै हातको प्रत्यक्ष ट्र्याकिङ (बायाँ र दायाँ क्षेत्र)",
    cvFeat2: "सूक्ष्म कम्पन र प्रतिक्रिया समयको मापन",
    cvFeat3: "१००% ब्राउजर गोपनीयता (कुनै भिडियो पठाइँदैन)",
    harvestProgress: "संकलन प्रगति",
    goalReached: "लक्ष्य पूरा भयो!",
    itemsLeft: (n: number) => `संकलन गर्न ${n} वस्तुहरू बाँकी`,
    bilateralSymmetry: "द्विपक्षीय सन्तुलन",
    balanced: "% सन्तुलित",
    motorLatency: "प्रतिक्रिया समय",
    leftZone: "बायाँ क्षेत्र",
    rightZone: "दायाँ क्षेत्र",
    waveHands: "समात्न हात हल्लाउनुहोस्",
    leftActive: "बायाँ हात सक्रिय",
    rightActive: "दायाँ हात सक्रिय",
    touchTray: "छोएर संकलन गर्नुहोस् (वा क्यामेरामा हात हल्लाउनुहोस्):",
    tapToHarvest: "टिप्न ट्याप गर्नुहोस्",
    cameraOn: "क्यामेरा दृष्टि: चालु",
    cameraOff: "क्यामेरा खोल्नुहोस्",
    voiceGuide: "आवाज मार्गदर्शन",
    voiceIntro: "असम चिया बगानमा स्वागत छ। खस्ने पात र पुतलीहरू समात्न हात अगाडि बढाउनुहोस्।",
    celebTitle: "चिया बगान संकलन सम्पन्न!",
    celebSub: "तपाईंले दुवै हातको उत्कृष्ट समन्वय र नियन्त्रण प्रदर्शन गर्नुभयो।",
    clinicalSummary: "किनेस्थेटिक क्लिनिकल सारांश",
    harvestedTag: "८/८ संकलित",
    equalReach: "दायाँ र बायाँ हातको समान पहुँच",
    fastReflex: "छिटो दृश्य-मोटर प्रतिक्रिया",
    ashaNote: "आशा स्वास्थ्य अवलोकन: बिरामीको हातको चाल सहज छ। नियमित व्यायाम जारी राख्न सिफारिस गरिएको छ।",
    playAgain: "फेरि खेल्नुहोस्",
    backSuite: "← थेरापी सूचीमा फर्कनुहोस्",
    items: {
      tea_leaf: "सुनौलो चियाको पात",
      butterfly: "काजिरङ्गा पुतली",
      orange: "असम सुन्तला",
      flower: "कपोऊ फूल",
    },
  },
  mni: {
    paperclip: "খুৎ চৎথোক-চৎশিন অমসুং উনা খোমজিনবা",
    cvHeader: "অৱাংবা থাক্কী কম্প্যুতর ভিজন অমসুং নিউরো-মোটর খোঙথাং:",
    cvFeat1: "খুৎ অনিমক্কী রিয়েল-টাইম ত্রেকিং (য়েৎ অমসুং ওই)",
    cvFeat2: "মাইক্রো-ত্রেমোর অমসুং রিএক্শন তাইমগী চাং য়েংবা",
    cvFeat3: "ব্রাউজর মনুংদা ১০০% লৈবা গোপনীয়তা",
    harvestProgress: "খোমজিনবগী খোঙথাং",
    goalReached: "পান্দম য়ৌরে!",
    itemsLeft: (n: number) => `খোমজিননবা অতৈ ${n} লৈরি`,
    bilateralSymmetry: "খুৎ অনিমক্কী মান্নবা চাং",
    balanced: "% মান্নবা",
    motorLatency: "রিএক্শন তাইম",
    leftZone: "ওইথংবা মফম",
    rightZone: "য়েৎথংবা মফম",
    waveHands: "ফাইনবা খুৎ য়েৎ-ওই নোংগৎলু",
    leftActive: "ওইথংবা খুৎ থবক তৌরি",
    rightActive: "য়েৎথংবা খুৎ থবক তৌরি",
    touchTray: "নমদুনা খোমজিনবিয়ু:",
    tapToHarvest: "লৌনবা নম্বিয়ু",
    cameraOn: "কেমেরা ভিজন: ওন",
    cameraOff: "কেমেরা ওন তৌবিয়ু",
    voiceGuide: "খোল্লাউগী পাউতাক",
    voiceIntro: "অসামগী চা পাম্বী লৈকোলদা তরাম্না ওকচরি। তাবা মনা অমসুং কুরকপোকপী ফানবা খুৎ থাংগৎলু।",
    celebTitle: "চা মনা খোমজিনবা লোইরে!",
    celebSub: "নহাক্না খুৎ অনিমক শিজিন্নদুনা ফজনা হোৎনখি।",
    clinicalSummary: "ক্লিনিকেল অপুনবা ৱাফম",
    harvestedTag: "৮/৮ লৌখ্রে",
    equalReach: "য়েৎ-ওই মান্ননা শিজিন্নবা",
    fastReflex: "য়াংবা রিফ্লেক্স",
    ashaNote: "আশা ক্লিনিককী ৱাফম: অনাবগী খুৎ অনিমক্কী চৎথোক-চৎশিন চপ চানা চত্থরি।",
    playAgain: "অমুক হন্না শান্নবা",
    backSuite: "← থেরাপী কাচাদা হল্লকপা",
    items: {
      tea_leaf: "সনাগী চা মনা",
      butterfly: "কাজিরঙ্গা কুরকপোকপী",
      orange: "অসাম কোমল",
      flower: "কপৌ লৈ",
    },
  },
  brx: {
    paperclip: "आखायनि दावबायनाय आरो बिलाइ बानायनाय",
    cvHeader: "उन्नत कम्प्युटर नुनाय आरो निउरो-मथर गुनफोर:",
    cvFeat1: "सानैबो आखायनि ट्र्याकिं (आगसि आरो आगदा)",
    cvFeat2: "मथर फिनजाथाय समनि नायबिजिरनाय",
    cvFeat3: "१००% ब्राउजारनि गोथौथि (जेबो भिडिओ थाया)",
    harvestProgress: "खुंजिनायनि आगायनाय",
    goalReached: "थांखिया जाफुंबाय!",
    itemsLeft: (n: number) => `खुंजिनो आरोबाव ${n} थाबाय`,
    bilateralSymmetry: "आखाय सानैनि समानथि",
    balanced: "% समानथि",
    motorLatency: "फिनजाथाय सम",
    leftZone: "आगसि बाहागो",
    rightZone: "आगदा बाहागो",
    waveHands: "हुमनो आखाय दैखां",
    leftActive: "आगसि आखाय सोलिबाय",
    rightActive: "आगदा आखाय सोलिबाय",
    touchTray: "दांनानै हम (एबा केमेरानि सिगांआव आखाय दैखां):",
    tapToHarvest: "हमनों थु",
    cameraOn: "केमेरा नुनाय: अन",
    cameraOff: "केमेरा अन खालाम",
    voiceGuide: "रांनि दैदेननाय",
    voiceIntro: "आसामनि साहा बागानआव बरायबाय। गोग्लैनाय बिलाइ आरो फिसाफ्ला हमनो आखाय थिन।",
    celebTitle: "साहा बागाननि खामानि जोबबाय!",
    celebSub: "नोंथाङा मोजां आखायनि समानथि आरो सामलायनाय दिन्थिबाय।",
    clinicalSummary: "क्लिनिकेल सुंदोबोर",
    harvestedTag: "८/८ खुंबाय",
    equalReach: "आगसि आरो आगदा समान",
    fastReflex: "गोख्रों फिनजाथाय",
    ashaNote: "आसा क्लिनिकेल नायबिजिरनाय: आखाय सानैनि खामानिया सुलुं जाबाय।",
    playAgain: "आरोबाव गेले",
    backSuite: "← थेरापि रुमआव थांफिन",
    items: {
      tea_leaf: "सोनारि साहा बिलाइ",
      butterfly: "काजिरंगा फिसाफ्ला",
      orange: "आसाम कमला",
      flower: "कपौ बार",
    },
  },
  grt: {
    paperclip: "Jakoni Moani aro Bijak Ratani",
    cvHeader: "Computer Vision & Neuro-Motor Features:",
    cvFeat1: "Jakgnina Real-time tracking (Jasi aro Jakasi)",
    cvFeat2: "Micro-tremor & Reaction latency extraction",
    cvFeat3: "100% In-Browser Privacy (Video dingtang donja)",
    harvestProgress: "Ratani Matchotangba",
    goalReached: "Nisan Matchotaha!",
    itemsLeft: (n: number) => `${n} dingtang donkuenga`,
    bilateralSymmetry: "Bilateral Symmetry",
    balanced: "% Balanced",
    motorLatency: "Motor Latency",
    leftZone: "Jasi Chipak",
    rightZone: "Jakasi Chipak",
    waveHands: "Rimbana Jak Moatbo",
    leftActive: "Jasi Jak Re·baenga",
    rightActive: "Jakasi Jak Re·baenga",
    touchTray: "Touch ka·e rimbo:",
    tapToHarvest: "Rimbana Nang·atbo",
    cameraOn: "Camera: ON",
    cameraOff: "Camera Kulibo",
    voiceGuide: "Ku·rang Guide",
    voiceIntro: "Assam Cha Baganona rimnapbana. Cha bijak aro me·gup rimna jak snoatbo.",
    celebTitle: "Cha Bagan Ratani Matchotaha!",
    celebSub: "Na·simang sakgnina jakko name chalaina man·aha.",
    clinicalSummary: "Kinesthetic Summary",
    harvestedTag: "8/8 Man·aha",
    equalReach: "Jakgnina apsan reach",
    fastReflex: "Ta·raka reflex",
    ashaNote: "ASHA Observation: Smooth movement. Salanti kal·angkuchina mol·molaha.",
    playAgain: "Ta·raka Kal·taibo",
    backSuite: "← Therapy-ona Re·bapilbo",
    items: {
      tea_leaf: "Sona Cha Bijak",
      butterfly: "Kaziranga Me·gup",
      orange: "Assam Komla",
      flower: "Kopou Bibal",
    },
  },
  kha: {
    paperclip: "Ktieh Jingpynkhih bad Kheit Sla",
    cvHeader: "Computer Vision & Neuro-Motor Features:",
    cvFeat1: "Tracking arliang kti (Kadiang & Kamon)",
    cvFeat2: "Reaction latency & tremor extraction",
    cvFeat3: "100% In-Browser Privacy",
    harvestProgress: "Jingkheit Sla",
    goalReached: "Kut ka thong!",
    itemsLeft: (n: number) => `${n} tylli sah ban kheit`,
    bilateralSymmetry: "Bilateral Symmetry",
    balanced: "% Balanced",
    motorLatency: "Motor Latency",
    leftZone: "Liang Kadiang",
    rightZone: "Liang Kamon",
    waveHands: "Kylliang kti ban kem",
    leftActive: "Kti Kadiang Active",
    rightActive: "Kti Kamon Active",
    touchTray: "Kham ban kheit:",
    tapToHarvest: "Tba ban kheit",
    cameraOn: "Camera Vision: ON",
    cameraOff: "Pynmeh Camera",
    voiceGuide: "Jingpynshai ryngkat sur",
    voiceIntro: "Pdiang sngewbha sha Assam Tea Garden. Kdew kti ban kem ia ki sla sha bad thapbalieh.",
    celebTitle: "Kheit Sla Sha Dep!",
    celebSub: "Phi la pyni ia ka jingkhlain bad jingbiang kti kaba bha.",
    clinicalSummary: "Kinesthetic Summary",
    harvestedTag: "8/8 Dep Kheit",
    equalReach: "Arliang kti kaba biang",
    fastReflex: "Reflex kaba kloi",
    ashaNote: "ASHA Clinical Observation: Kti pynkhih kaba jem bad biang bha.",
    playAgain: "Lehkai Biang",
    backSuite: "← Phai sha Therapy Suite",
    items: {
      tea_leaf: "Sla Sha Ksiar",
      butterfly: "Thapbalieh Kaziranga",
      orange: "Soh Niamtra Assam",
      flower: "Syntiew Kopou",
    },
  },
  lus: {
    paperclip: "Kut Chettirh & Hnah Khawm",
    cvHeader: "Computer Vision & Neuro-Motor Features:",
    cvFeat1: "Kut hnih tracking (Vei leh Ding)",
    cvFeat2: "Khurh & reaction latency endikna",
    cvFeat3: "100% Browser Privacy (Video vawn a awm lo)",
    harvestProgress: "Hnah Khawm Kal Mek",
    goalReached: "Tum ram thleng ta!",
    itemsLeft: (n: number) => `${n} la khawm tur a awm`,
    bilateralSymmetry: "Bilateral Symmetry",
    balanced: "% Balanced",
    motorLatency: "Motor Latency",
    leftZone: "Vei Lam",
    rightZone: "Ding Lam",
    waveHands: "Man turin kut vai rawh",
    leftActive: "Kut Vei Active",
    rightActive: "Kut Ding Active",
    touchTray: "Hmet la khawm rawh:",
    tapToHarvest: "Khawm turin hmet rawh",
    cameraOn: "Camera Vision: ON",
    cameraOff: "Camera On rawh",
    voiceGuide: "Aw Kaihhruaina",
    voiceIntro: "Assam Thingpui huanah kan lo lawm a che. Thingpui hnah leh phengphehlep lo tla chu man rawh.",
    celebTitle: "Thingpui Huan Khawm Zawh a ni ta!",
    celebSub: "Kut pahnih inzawmna tha tak i entir e.",
    clinicalSummary: "Kinesthetic Summary",
    harvestedTag: "8/8 Khawm zo",
    equalReach: "Kut hnih inzat tluk",
    fastReflex: "Mit leh kut inzawm rang",
    ashaNote: "ASHA Observation: Kut chet a zangkhai tha hle.",
    playAgain: "Khel nawn leh rawh",
    backSuite: "← Therapy Suite-ah kir rawh",
    items: {
      tea_leaf: "Thingpui Hnah Rangkachak",
      butterfly: "Kaziranga Phengphehlep",
      orange: "Assam Serthlum",
      flower: "Kopou Pangpar",
    },
  },
};

export function TeaGardenCatchGame() {
  const locale = useLocale();
  const normLoc = locale?.split("-")[0]?.toLowerCase() || "en";
  const tCatch = TEA_CATCH_I18N[normLoc] || TEA_CATCH_I18N.en;

  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "tea-garden-catch", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [score, setScore] = useState(0);
  const [caughtCount, setCaughtCount] = useState(0);
  const targetGoal = 8;

  // OpenCV Vision & Video States
  const [cameraActive, setCameraActive] = useState(false);
  const [motionEvent, setMotionEvent] = useState<MotionEvent | null>(null);
  const [symmetryHistory, setSymmetryHistory] = useState<number[]>([]);

  // Falling Items in the Tea Estate
  const [items, setItems] = useState<FallingItem[]>([]);
  const nextItemIdRef = useRef(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<OpticalMotionTracker | null>(null);

  // Clinical Telemetry
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const itemSpawnTimesRef = useRef<Map<number, number>>(new Map());

  const handleFinishGame = useCallback(() => {
    playComplete();
    setPhase("done");
    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "tea-garden-catch",
        level,
        outcome: "completed",
        score: 100,
        startedAt,
        taps: taps + targetGoal,
        errorCount: 0,
      });
    }
  }, [level, patientId, startedAt, taps, targetGoal]);

  // Handle Vision Motion Event
  const handleMotionEvent = useCallback((evt: MotionEvent) => {
    setMotionEvent(evt);

    if (evt.bilateralSymmetry > 0) {
      setSymmetryHistory((prev) => [...prev.slice(-20), evt.bilateralSymmetry]);
    }

    // Check collision between falling items and detected hand positions
    setItems((prevItems) => {
      let newlyCaught = false;
      const updated = prevItems.map((item) => {
        if (item.caught) return item;

        // Check distance to Left Hand (1:1 viewport reach across all corners)
        let hit = false;
        if (evt.leftHand) {
          const dx = item.x - evt.leftHand.x;
          const dy = item.y - evt.leftHand.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.18) hit = true;
        }

        // Check distance to Right Hand (1:1 viewport reach across all corners)
        if (!hit && evt.rightHand) {
          const dx = item.x - evt.rightHand.x;
          const dy = item.y - evt.rightHand.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.18) hit = true;
        }

        // Fallback: Check primary motion centroid (reaches all corners)
        if (!hit && evt.hasMotion && evt.energy > 0.12) {
          const dx = item.x - evt.x;
          const dy = item.y - evt.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.18) hit = true;
        }

        if (hit) {
          newlyCaught = true;
          const spawnTime = itemSpawnTimesRef.current.get(item.id);
          if (spawnTime) {
            const latency = Math.round(performance.now() - spawnTime);
            setReactionTimes((r) => [...r, latency]);
          }
          return { ...item, caught: true };
        }
        return item;
      });

      if (newlyCaught) {
        playCorrect();
        setCaughtCount((c) => {
          const nextC = c + 1;
          setScore((s) => s + 15);
          if (nextC >= targetGoal) {
            setTimeout(() => {
              handleFinishGame();
            }, 600);
          }
          return nextC;
        });
      }

      return updated;
    });
  }, [targetGoal, handleFinishGame]);

  // Initialize OpenCV Motion Tracker
  useEffect(() => {
    if (cameraActive && phase === "playing") {
      const tracker = new OpticalMotionTracker(handleMotionEvent, 0.38);
      trackerRef.current = tracker;
      tracker.start().then((started) => {
        if (!started) setCameraActive(false);
      });
    }

    return () => {
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
    };
  }, [cameraActive, phase, handleMotionEvent]);

  // Render OpenCV Overlay HUD
  useEffect(() => {
    if (!canvasRef.current || !motionEvent || phase !== "playing") return;
    drawOpenCvOverlay(canvasRef.current, motionEvent, {
      showHands: true,
      showGrid: true,
      showMetrics: true,
      videoEl: trackerRef.current?.getVideoElement(),
    });
  }, [motionEvent, phase]);

  // Game Loop: Spawn & Animate Falling Tea Leaves and Butterflies
  useEffect(() => {
    if (phase !== "playing") return;

    // Spawn falling items periodically
    const spawnInterval = setInterval(() => {
      setItems((prev) => {
        if (prev.filter((i) => !i.caught).length >= 4) return prev;

        const id = nextItemIdRef.current++;
        const itemTypes: { type: FallingItem["type"]; defaultName: string }[] = [
          { type: "tea_leaf", defaultName: "Golden Tea Leaf" },
          { type: "butterfly", defaultName: "Kaziranga Butterfly" },
          { type: "orange", defaultName: "Assam Mandarin Orange" },
          { type: "flower", defaultName: "Kopou Orchid" },
        ];
        const choice = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const localizedName = tCatch.items[choice.type] || choice.defaultName;
        const xPos = 0.15 + Math.random() * 0.7;
        const side: FallingItem["handSide"] = xPos < 0.45 ? "left" : xPos > 0.55 ? "right" : "center";

        itemSpawnTimesRef.current.set(id, performance.now());

        return [
          ...prev,
          {
            id,
            type: choice.type,
            name: localizedName,
            x: xPos,
            y: 0.05,
            speed: 0.0035 + (level === 2 ? 0.0015 : level === 3 ? 0.003 : 0),
            size: 48,
            caught: false,
            handSide: side,
          },
        ];
      });
    }, 1600);

    // Animation Tick for Falling Movement
    const animInterval = setInterval(() => {
      setItems((prev) =>
        prev
          .map((item) => ({
            ...item,
            y: item.caught ? item.y : item.y + item.speed,
          }))
          .filter((item) => item.y < 1.05 && (!item.caught || item.y < 0.95))
      );
    }, 33);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(animInterval);
    };
  }, [phase, level, tCatch]);

  const startGame = useCallback(() => {
    playPress();
    setPhase("playing");
    setScore(0);
    setCaughtCount(0);
    setItems([]);
    setReactionTimes([]);
    setSymmetryHistory([]);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    setCameraActive(true);
    speak(
      tCatch.voiceIntro,
      locale,
      rate
    );
  }, [locale, rate, tCatch.voiceIntro]);

  const handleManualCatch = (item: FallingItem) => {
    if (item.caught) return;
    setTaps((t) => t + 1);
    stopSpeaking();
    playCorrect();

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, caught: true } : i))
    );
    setCaughtCount((c) => {
      const nextC = c + 1;
      setScore((s) => s + 15);
      if (nextC >= targetGoal) {
        setTimeout(() => {
          handleFinishGame();
        }, 500);
      }
      return nextC;
    });
  };

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "tea-garden-catch",
    level,
    startedAt,
    taps: taps + caughtCount,
    errorCount: 0,
  });

  const avgReactionLatency = useMemo(() => {
    if (reactionTimes.length === 0) return 650;
    return Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
  }, [reactionTimes]);

  const avgBilateralSymmetry = useMemo(() => {
    if (symmetryHistory.length === 0) return 92;
    return Math.round(
      (symmetryHistory.reduce((a, b) => a + b, 0) / symmetryHistory.length) * 100
    );
  }, [symmetryHistory]);

  const str = getGameStrings("tea-garden-catch", locale);

  if (loading)
    return (
      <GameShell title={str.title} score={0} gameId="tea-garden-catch">
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title={str.title} score={0} gameId="tea-garden-catch">
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title={str.title} score={score} gameId="tea-garden-catch">
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          {/* Government Paperclip Header */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                {tCatch.paperclip}
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-teal-900" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-teal-900 text-white shadow-[4px_4px_0px_#000]">
            <Leaf className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {str.introSubtitle}
            </p>
          </div>

          {/* OpenCV Clinical Highlights */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000] space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-teal-900 block">
              {tCatch.cvHeader}
            </span>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>{tCatch.cvFeat1}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-amber-600" />
              <span>{tCatch.cvFeat2}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-teal-600" />
              <span>{tCatch.cvFeat3}</span>
            </div>
          </div>

          <AudioPrompt
            text={str.audioPrompt}
            label={str.listenLabel}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startGame}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "playing" ? (
        <div className="flex flex-col items-center gap-4 py-1">
          {/* TOP HUD: GOAL & REAL-TIME OPENCV METRICS */}
          <div className="w-full max-w-lg rounded-2xl border-3 border-black bg-surface p-3 shadow-[4px_4px_0px_#000] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-emerald-100 font-serif font-black text-emerald-950 text-sm">
                {caughtCount}/{targetGoal}
              </span>
              <div>
                <span className="text-[10px] font-black uppercase text-teal-900 block">
                  {tCatch.harvestProgress}
                </span>
                <span className="text-xs font-black text-ink flex items-center gap-1">
                  {caughtCount >= targetGoal ? (
                    <span className="flex items-center gap-1 text-emerald-800">
                      {tCatch.goalReached} <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    </span>
                  ) : (
                    tCatch.itemsLeft(targetGoal - caughtCount)
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-ink-secondary block">
                  {tCatch.bilateralSymmetry}
                </span>
                <span className="text-xs font-black text-emerald-700">
                  {avgBilateralSymmetry}{tCatch.balanced}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-ink-secondary block">
                  {tCatch.motorLatency}
                </span>
                <span className="text-xs font-black text-amber-800 font-mono">
                  {avgReactionLatency}ms
                </span>
              </div>
            </div>
          </div>

          {/* MAIN INTERACTIVE KINESTHETIC STAGE */}
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden border-4 border-black bg-gradient-to-b from-[#1E3A2B] via-[#2D5A43] to-[#142B20] shadow-[8px_8px_0px_#000] select-none">
            {/* Scenic Tea Estate Background Layer */}
            <div className="absolute inset-0 opacity-20 pointer-events-none flex flex-col justify-end">
              <div className="h-32 bg-emerald-900/60 rounded-t-full -mx-8 blur-sm" />
              <div className="h-20 bg-emerald-950/80" />
            </div>

            {/* OpenCV Live Vision HUD Canvas Overlay */}
            <canvas
              ref={canvasRef}
              width={320}
              height={240}
              className="absolute inset-0 w-full h-full pointer-events-none opacity-85 z-10"
            />

            {/* Bilateral Reach Guide Zones */}
            <div className="absolute inset-0 flex justify-between pointer-events-none px-4 pt-4 z-0 opacity-40">
              <div className="w-24 h-full border-r border-dashed border-emerald-400/40 flex flex-col items-center">
                <span className="text-[10px] font-black text-emerald-300 uppercase mt-2">{tCatch.leftZone}</span>
              </div>
              <div className="w-24 h-full border-l border-dashed border-amber-400/40 flex flex-col items-center">
                <span className="text-[10px] font-black text-amber-300 uppercase mt-2">{tCatch.rightZone}</span>
              </div>
            </div>

            {/* Falling Interactive Items */}
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleManualCatch(item)}
                style={{
                  left: `${item.x * 100}%`,
                  top: `${item.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className={`absolute z-20 flex items-center justify-center transition-transform cursor-pointer ${
                  item.caught
                    ? "scale-150 opacity-0 transition-all duration-300 pointer-events-none"
                    : "hover:scale-110 active:scale-95 animate-bounce"
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-black/40 border border-white/20 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.6)]">
                    {renderFallingItemIcon(item.type, "h-8 w-8")}
                  </div>
                  <span className="mt-0.5 rounded-full border border-black bg-white/90 px-1.5 py-0.2 text-[9px] font-black text-ink shadow-xs">
                    {item.name}
                  </span>
                </div>
              </button>
            ))}

            {/* Bottom Status / Gesture Feedback */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
              <span className="rounded-xl border-2 border-black bg-white/90 px-2.5 py-1 text-[11px] font-black text-ink shadow-[2px_2px_0px_#000] flex items-center gap-1">
                {motionEvent?.hasMotion ? (
                  <>
                    <Zap className="h-3.5 w-3.5 text-amber-600" />
                    <span>{motionEvent.gesture.replace(/_/g, " ")}</span>
                  </>
                ) : (
                  <>
                    <Hand className="h-3.5 w-3.5 text-tea" />
                    <span>{tCatch.waveHands}</span>
                  </>
                )}
              </span>

              {motionEvent?.leftHand && (
                <span className="rounded-full border border-emerald-400 bg-emerald-950/80 px-2 py-0.5 text-[10px] font-black text-emerald-300 flex items-center gap-1">
                  <Hand className="h-3 w-3" /> {tCatch.leftActive}
                </span>
              )}

              {motionEvent?.rightHand && (
                <span className="rounded-full border border-amber-400 bg-amber-950/80 px-2 py-0.5 text-[10px] font-black text-amber-300 flex items-center gap-1">
                  <Hand className="h-3 w-3" /> {tCatch.rightActive}
                </span>
              )}
            </div>
          </div>

          {/* HIGH-CONTRAST TACTILE CATCH TRAY (ACCESSIBILITY LAYER) */}
          <div className="w-full max-w-lg space-y-2">
            <span className="text-xs font-black uppercase text-teal-900 block text-left">
              {tCatch.touchTray}
            </span>
            <div className="grid grid-cols-2 gap-2">
              {items
                .filter((i) => !i.caught)
                .slice(0, 2)
                .map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleManualCatch(item)}
                    className="btn-tactile flex items-center gap-2 rounded-2xl border-3 border-black bg-amber-100 p-3 text-ink shadow-[3px_3px_0px_#000] hover:bg-amber-200 active:translate-y-0.5 cursor-pointer text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/10">
                      {renderFallingItemIcon(item.type, "h-6 w-6")}
                    </div>
                    <div className="truncate">
                      <span className="text-[10px] font-bold text-amber-900 uppercase block">
                        {tCatch.tapToHarvest}
                      </span>
                      <span className="text-xs font-black text-ink truncate block">
                        {item.name}
                      </span>
                    </div>
                  </button>
                ))}
            </div>

            <div className="flex items-center justify-between pt-1 text-[11px] font-bold text-ink-secondary">
              <button
                type="button"
                onClick={() => setCameraActive(!cameraActive)}
                className="flex items-center gap-1 hover:text-ink cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5 text-teal-900" />
                <span>{cameraActive ? tCatch.cameraOn : tCatch.cameraOff}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  speak(
                    tCatch.voiceIntro,
                    locale,
                    rate
                  )
                }
                className="flex items-center gap-1 text-teal-900 hover:underline cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>{tCatch.voiceGuide}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* PHASE: CELEBRATION */
        <Celebration
          title={tCatch.celebTitle}
          subtitle={tCatch.celebSub}
          xpEarned={140}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none space-y-3">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {tCatch.clinicalSummary}
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-teal-900 text-white px-2 py-0.5">
                  {tCatch.harvestedTag}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-black/20 bg-white p-2.5">
                  <span className="text-[10px] font-black uppercase text-ink-secondary block">
                    {tCatch.bilateralSymmetry}
                  </span>
                  <span className="font-serif text-xl font-black text-emerald-700">
                    {avgBilateralSymmetry}%
                  </span>
                  <p className="text-[10px] font-semibold text-emerald-800 mt-0.5">
                    {tCatch.equalReach}
                  </p>
                </div>

                <div className="rounded-xl border border-black/20 bg-white p-2.5">
                  <span className="text-[10px] font-black uppercase text-ink-secondary block">
                    {tCatch.motorLatency}
                  </span>
                  <span className="font-serif text-xl font-black text-amber-800 font-mono">
                    {avgReactionLatency}ms
                  </span>
                  <p className="text-[10px] font-semibold text-amber-800 mt-0.5">
                    {tCatch.fastReflex}
                  </p>
                </div>
              </div>

              <p className="text-xs font-semibold text-ink-secondary pt-2 border-t border-black/10 leading-relaxed">
                {tCatch.ashaNote}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startGame}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> {tCatch.playAgain}
                </span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
              >
                {tCatch.backSuite}
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
