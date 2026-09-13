"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Utensils,
  Music,
  CookingPot,
  Fish,
  Citrus,
  Wheat,
  Soup,
  Carrot,
  Salad,
  Flame,
  Droplets,
  Leaf,
  Sparkles,
} from "lucide-react";
import { BambooShootIcon } from "@/components/ui/CulturalIcons";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import {
  playPress,
  playCorrect,
  playComplete,
  playSizzle,
  playPineBreeze,
  playLifeSong,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { getGameStrings, SupportedLocale } from "@/lib/gameI18n";
import { calculateVanishingCue, validateMoveErrorless } from "@/lib/errorlessLearning";

interface KitchenUiStrings {
  step: (curr: number, total: number) => string;
  brassPot: string;
  sizzling: string;
  stirLadle: string;
  next: (name: string) => string;
  tapToCook: (name: string) => string;
  selectIngredient: string;
  guide: string;
  playFolkTune: string;
  score: (score: number, total: number) => string;
  startCooking: string;
  voiceAnnounce: (name: string, desc: string) => string;
  voiceAddFirst: (name: string) => string;
  voiceComplete: (title: string) => string;
}

const KITCHEN_UI_I18N: Record<SupportedLocale, KitchenUiStrings> = {
  en: {
    step: (c, t) => `Step ${c} of ${t}`,
    brassPot: "Brass Cooking Pot",
    sizzling: "Sizzling & Simmering...",
    stirLadle: "Stir with Ladle",
    next: (n) => `Next: ${n}`,
    tapToCook: (n) => `Tap the ${n} to add to the pan!`,
    selectIngredient: "Select Ingredient to Add",
    guide: "Guide ✨",
    playFolkTune: "Play Kitchen Folk Tune",
    score: (s, t) => `Score: ${s}/${t}`,
    startCooking: "Start Cooking",
    voiceAnnounce: (n, d) => `Next step: Add ${n}. ${d}`,
    voiceAddFirst: (n) => `Let us first add the ${n}. Notice the gentle golden guide.`,
    voiceComplete: (t) => `Delicious! Your ${t} is freshly prepared, steaming, and ready to serve with love!`,
  },
  as: {
    step: (c, t) => `স্তৰ ${c} / ${t}`,
    brassPot: "পিতলৰ কেৰাহী",
    sizzling: "উতলি আছে আৰু সুবাস ওলাইছে...",
    stirLadle: "হেঁতাৰে লৰাই দিয়ক",
    next: (n) => `পৰৱৰ্তী: ${n}`,
    tapToCook: (n) => `কেৰাহীত দিবলৈ ${n} স্পৰ্শ কৰক!`,
    selectIngredient: "কেৰাহীত দিবলৈ উপাদান বাছক",
    guide: "সহায়িকা ✨",
    playFolkTune: "ৰান্ধনিঘৰৰ লোকগীত শুনক",
    score: (s, t) => `নম্বৰ: ${s}/${t}`,
    startCooking: "ৰন্ধন আৰম্ভ কৰক",
    voiceAnnounce: (n, d) => `পৰৱৰ্তী স্তৰ: ${n} দিয়ক। ${d}`,
    voiceAddFirst: (n) => `প্ৰথমে ${n} পাত্ৰত দিয়ক। সোণালী সহায়িকাত মন দিয়ক।` ,
    voiceComplete: (t) => `সুস্বাদু! আপোনাৰ ${t} সুন্দৰকৈ প্ৰস্তুত হ'ল, আনন্দৰে পৰিৱেশন কৰক!`,
  },
  hi: {
    step: (c, t) => `चरण ${c} / ${t}`,
    brassPot: "पीतल की कड़ाही",
    sizzling: "धीमी आंच पर पक रहा है...",
    stirLadle: "कलछी से चलाएं",
    next: (n) => `अगला: ${n}`,
    tapToCook: (n) => `कड़ाही में डालने के लिए ${n} को छुएं!`,
    selectIngredient: "डालने के लिए सामग्री चुनें",
    guide: "मार्गदर्शक ✨",
    playFolkTune: "रसोई का लोकगीत सुनें",
    score: (s, t) => `अंक: ${s}/${t}`,
    startCooking: "पकाना शुरू करें",
    voiceAnnounce: (n, d) => `अगला चरण: ${n} डालें। ${d}`,
    voiceAddFirst: (n) => `पहले ${n} को कड़ाही में डालें। सुनहरे संकेत को देखें।`,
    voiceComplete: (t) => `स्वादिष्ट! आपका ${t} बनकर तैयार है, प्रेम से परोसें!`,
  },
  bn: {
    step: (c, t) => `ধাপ ${c} / ${t}`,
    brassPot: "পিতলের কড়াই",
    sizzling: "আঁচে ফুটছে এবং সুবাস ছড়াচ্ছে...",
    stirLadle: "খুন্তি দিয়ে নাড়ুন",
    next: (n) => `পরবর্তী: ${n}`,
    tapToCook: (n) => `কড়াইতে দিতে ${n} স্পর্শ করুন!`,
    selectIngredient: "যোগ করতে উপাদান নির্বাচন করুন",
    guide: "সহায়িকা ✨",
    playFolkTune: "রান্নাঘরের লোকগীতি শুনুন",
    score: (s, t) => `স্কোর: ${s}/${t}`,
    startCooking: "রান্না শুরু করুন",
    voiceAnnounce: (n, d) => `পরবর্তী ধাপ: ${n} দিন। ${d}`,
    voiceAddFirst: (n) => `প্রথমে ${n} কড়াইতে দিন। সোনালী নির্দেশিকা খেয়াল করুন।`,
    voiceComplete: (t) => `চমৎকার! আপনার ${t} গরম গরম প্রস্তুত, ভালোবাসায় পরিবেশন করুন!`,
  },
  mr: {
    step: (c, t) => `टप्पा ${c} / ${t}`,
    brassPot: "पितळेची कढई",
    sizzling: "मस्त सुगंध येत आहे...",
    stirLadle: "पळीने ढवळा",
    next: (n) => `पुढील: ${n}`,
    tapToCook: (n) => `कढईत टाकण्यासाठी ${n} ला स्पर्श करा!`,
    selectIngredient: "घटक निवडा",
    guide: "मार्गदर्शक ✨",
    playFolkTune: "पारंपरिक संगीत ऐका",
    score: (s, t) => `गुण: ${s}/${t}`,
    startCooking: "स्वयंपाक सुरू करा",
    voiceAnnounce: (n, d) => `पुढील टप्पा: ${n} टाका. ${d}`,
    voiceAddFirst: (n) => `प्रथम कढईत ${n} टाका. सोनेरी मार्गदर्शकाकडे लक्ष द्या.`,
    voiceComplete: (t) => `छान! तुमचे ${t} चविष्ट तयार झाले आहे, प्रेमाने वाढा!`,
  },
  ne: {
    step: (c, t) => `चरण ${c} / ${t}`,
    brassPot: "पित्तलको कराई",
    sizzling: "तातो तातो पाक्दैछ...",
    stirLadle: "डाडुले चलाउनुहोस्",
    next: (n) => `अर्को: ${n}`,
    tapToCook: (n) => `कराईमा हाल्न ${n} छुनुहोस्!`,
    selectIngredient: "सामग्री छान्नुहोस्",
    guide: "मार्गदर्शक ✨",
    playFolkTune: "भान्साको लोकगीत सुन्नुहोस्",
    score: (s, t) => `अङ्क: ${s}/${t}`,
    startCooking: "पकाउन सुरु गर्नुहोस्",
    voiceAnnounce: (n, d) => `अर्को चरण: ${n} हाल्नुहोस्। ${d}`,
    voiceAddFirst: (n) => `पहिले कराईमा ${n} हाल्नुहोस्। सुनौलो सङ्केत हेर्नुहोस्।`,
    voiceComplete: (t) => `मिठो! तपाईंको ${t} तयार भयो, मायाले पस्कनुहोस्!`,
  },
  mni: {
    step: (c, t) => `তাঙ্কক ${c} / ${t}`,
    brassPot: "পিত্তলগী পুখম",
    sizzling: "চাক্না হৌরে অমসুং মহাও থোক্লে...",
    stirLadle: "লৈরেংনা চেল্লু",
    next: (n) => `মথংগী: ${n}`,
    tapToCook: (n) => `পুখমদা হাপ্নবা ${n} থম্বীয়ু!`,
    selectIngredient: "হাপ্নবা মচাক খনবীরসু",
    guide: "লমজিংবা ✨",
    playFolkTune: "ইশৈ তারসি",
    score: (s, t) => `স্কোর: ${s}/${t}`,
    startCooking: "থোংবা হৌরসি",
    voiceAnnounce: (n, d) => `মথংগী তাঙ্কক: ${n} হাপ্পীয়ু। ${d}`,
    voiceAddFirst: (n) => `অহানবদা ${n} হাপ্পীয়ু। সনাগী মৈঙাল য়েংবীয়ু।`,
    voiceComplete: (t) => `হাওই! নহাক্কী ${t} শেম-শারে, নুংশিনা সেংদোকউ!`,
  },
  brx: {
    step: (c, t) => `बाहागो ${c} / ${t}`,
    brassPot: "पितलनि दैहु",
    sizzling: "गोग्लायनानै गुवार जादों...",
    stirLadle: "हाथायाजों बिखाव",
    next: (n) => `उननि: ${n}`,
    tapToCook: (n) => `दैहुआव होनो ${n} खौ थु!`,
    selectIngredient: "जाग्रा मुवा सायख'",
    guide: "मन्थ्रि ✨",
    playFolkTune: "दामनाय मेथाय खोनासोन",
    score: (s, t) => `नम्बर: ${s}/${t}`,
    startCooking: "संनो जागाय",
    voiceAnnounce: (n, d) => `उननि बाहागो: ${n} खौ हो। ${d}`,
    voiceAddFirst: (n) => `सिगां दैहुआव ${n} खौ होग्रो। सोनानि दिन्थिनायखौ नाय।`,
    voiceComplete: (t) => `गोथाव! नोंथांनि ${t} संनाय जाबाय, अननायजों जाहो!`,
  },
  grt: {
    step: (c, t) => `Gadong ${c} / ${t}`,
    brassPot: "Pitolni Sam·dik",
    sizzling: "Song·enga aro buringenga...",
    stirLadle: "Bakkalchi pe·tokbo",
    next: (n) => `Ja·mano: ${n}`,
    tapToCook: (n) => `Sam·diko sonangna ${n}ko neng·taktokbo!`,
    selectIngredient: "Sonangani bostuko seokbo",
    guide: "Dakchakgipa ✨",
    playFolkTune: "Song·ani ring·aniko knabo",
    score: (s, t) => `Score: ${s}/${t}`,
    startCooking: "Song·na a·bachengbo",
    voiceAnnounce: (n, d) => `Ja·mano: ${n}ko sonangbo. ${d}`,
    voiceAddFirst: (n) => `Skang sam·diko ${n}ko sonangchengbo. Sonani chiniko nibo.`,
    voiceComplete: (t) => `Cha·tobea! Nang·ni ${t} song·a matchotaha, kasachakbee on·tokbo!`,
  },
  kha: {
    step: (c, t) => `Kylliang ${c} / ${t}`,
    brassPot: "Khaddei Pittol",
    sizzling: "Dang khluit bad sma bang...",
    stirLadle: "Khlui da u khur",
    next: (n) => `Bud sa: ${n}`,
    tapToCook: (n) => `Kylliang ban theh ${n} ha u khaddei!`,
    selectIngredient: "Jied ia ki jingthaw",
    guide: "Jingpynshai ✨",
    playFolkTune: "Sngap jingrwai shet-ja",
    score: (s, t) => `Score: ${s}/${t}`,
    startCooking: "Sdang ban shet",
    voiceAnnounce: (n, d) => `Kylliang bud: Theh ${n}. ${d}`,
    voiceAddFirst: (n) => `Theh shuwa ia ${n} ha u khaddei. Peit ia ka jingshai ksiar.`,
    voiceComplete: (t) => `Bang shisha! Ka ${t} jong phi la dep bha, buh sngewbha ban bam!`,
  },
  lus: {
    step: (c, t) => `Step ${c} / ${t}`,
    brassPot: "Dar Bel",
    sizzling: "A so bawrh bawrh a, a rim a tui hle...",
    stirLadle: "Fianpuiin chawk rawh",
    next: (n) => `A dawt leh: ${n}`,
    tapToCook: (n) => `Bel chhunga dah turin ${n} hmet rawh!`,
    selectIngredient: "Chawhmeh thlak tur thlang rawh",
    guide: "Puitu ✨",
    playFolkTune: "Choka hla ngaihthlakna",
    score: (s, t) => `Mark: ${s}/${t}`,
    startCooking: "Chhum tan rawh",
    voiceAnnounce: (n, d) => `A dawt leh: ${n} thlak rawh. ${d}`,
    voiceAddFirst: (n) => `A hmasa berin belah ${n} thlak hmasa phawt rawh. En rawh le.`,
    voiceComplete: (t) => `A tui hle mai! I ${t} chu i chhum zo ta e, hlim takin ei rawh u!`,
  },
};

interface LocalizedRecipeMeta {
  title: string;
  subtitle: string;
  steps: Record<string, { name: string; actionDesc: string }>;
}

const KITCHEN_DATA_I18N: Record<string, Partial<Record<SupportedLocale, LocalizedRecipeMeta>>> = {
  tenga: {
    en: {
      title: "Assamese Masor Tenga",
      subtitle: "Tangy fresh river curry with fragrant Kaji Nemu lemon",
      steps: {
        oil: { name: "Pure Mustard Oil", actionDesc: "Pour golden mustard oil into hot pan" },
        spices: { name: "Panch Phoron & Ginger", actionDesc: "Add fragrant five spices and crushed ginger" },
        turmeric: { name: "Golden Turmeric", actionDesc: "Sprinkle turmeric and sea salt" },
        fish: { name: "Fresh River Fish", actionDesc: "Gently add fresh tender fish pieces" },
        lemon: { name: "Kaji Nemu Lemon Juice", actionDesc: "Squeeze fresh tangy Kaji Nemu juice" },
      },
    },
    as: {
      title: "অসমীয়া মাছৰ টেঙা আঞ্জা",
      subtitle: "কাজী নেমুৰ সুগন্ধিৰে সতেজ নদীৰ মাছৰ টেঙা",
      steps: {
        oil: { name: "খাঁটি মিঠাতেল", actionDesc: "গৰম কেৰাহীত সোণালী মিঠাতেল দিয়ক" },
        spices: { name: "পাঁচফোৰণ আৰু আদা", actionDesc: "সুগন্ধি পাঁচফোৰণ আৰু খুন্দা আদা দিয়ক" },
        turmeric: { name: "সোণালী হালধি", actionDesc: "হালধি আৰু নিমখ ছটিয়াই দিয়ক" },
        fish: { name: "সতেজ নদীৰ মাছ", actionDesc: "লাহেকৈ মাছৰ টুকুৰাবোৰ কেৰাহীত দিয়ক" },
        lemon: { name: "কাজী নেমুৰ ৰস", actionDesc: "সুগন্ধি কাজী নেমুৰ ৰস চেপি দিয়ক" },
      },
    },
    hi: {
      title: "असमिया मासोर टेंगा",
      subtitle: "काजी नेमु नींबू और ताज़ी मछली की स्वादिष्ट खट्टी करी",
      steps: {
        oil: { name: "शुद्ध सरसों का तेल", actionDesc: "गर्म कड़ाही में सरसों का तेल डालें" },
        spices: { name: "पांच फोड़न और अदरक", actionDesc: "सुगंधित पांच फोड़न और पिसा अदरक डालें" },
        turmeric: { name: "सुनहरी हल्दी", actionDesc: "हल्दी और स्वादानुसार नमक छिड़कें" },
        fish: { name: "ताज़ी नदी की मछली", actionDesc: "ताज़ी मछली के टुकड़े आराम से डालें" },
        lemon: { name: "काजी नेमु का रस", actionDesc: "ताज़ा खट्टा काजी नेमु नींबू निचोड़ें" },
      },
    },
    bn: {
      title: "আসামের মাছের টেঙ্গা",
      subtitle: "কাজী লেবু দিয়ে টাটকা নদীর মাছের সুস্বাদু টক ঝোল",
      steps: {
        oil: { name: "খাঁটি সরিষার তেল", actionDesc: "গরম কড়াইতে সরিষার তেল ঢালুন" },
        spices: { name: "পাঁচফোড়ন ও আদা", actionDesc: "পাঁচফোড়ন এবং বাটা আদা যোগ করুন" },
        turmeric: { name: "হলুদ গুঁড়ো", actionDesc: "হলুদ গুঁড়ো এবং স্বাদমতো নুন দিন" },
        fish: { name: "নদীর তাজা মাছ", actionDesc: "মাছের টুকরোগুলো সাবধানে কড়াইতে দিন" },
        lemon: { name: "কাজী লেবুর রস", actionDesc: "সতেজ কাজী লেবুর রস চিপে দিন" },
      },
    },
    mr: {
      title: "आसामी मासोर टेंगा",
      subtitle: "काजी नेमु लिंबू घालून केलेली चविष्ट आंबट माशाची करी",
      steps: {
        oil: { name: "शुद्ध मोहरीचे तेल", actionDesc: "गरम कढईत मोहरीचे तेल टाका" },
        spices: { name: "पंच फोडणी व आले", actionDesc: "सुगंधी फोडणी आणि आले टाका" },
        turmeric: { name: "हळद पावडर", actionDesc: "हळद व चवीनुसार मीठ टाका" },
        fish: { name: "ताजे नदीचे मासे", actionDesc: "माशाचे तुकडे हळूच कढईत टाका" },
        lemon: { name: "काजी नेमु लिंबाचा रस", actionDesc: "ताजा सुगंधी लिंबाचा रस पिळा" },
      },
    },
    ne: {
      title: "आसामी माछार तेङ्गा",
      subtitle: "काजी कागती हालेको ताजा माछाको स्वादिलो झोल",
      steps: {
        oil: { name: "शुद्ध तोरीको तेल", actionDesc: "तातो कराईमा तोरीको तेल हाल्नुहोस्" },
        spices: { name: "पाँच फोडन र अदुवा", actionDesc: "पाँच फोडन र कुटेको अदुवा हाल्नुहोस्" },
        turmeric: { name: "बेसार र नुन", actionDesc: "बेसार र नुन छर्कनुहोस्" },
        fish: { name: "ताजा खोलाको माछा", actionDesc: "माछाका टुक्राहरू बिस्तारै कराईमा हाल्नुहोस्" },
        lemon: { name: "काजी कागतीको रस", actionDesc: "ताजा कागतीको रस हाल्नुहोस्" },
      },
    },
    mni: {
      title: "অসামিজ ঙা তোংবা",
      subtitle: "কাজিনীমু নপাউনা শেম্বা ঙাগী মহাও চৈবা",
      steps: {
        oil: { name: "অশেংবা থাও", actionDesc: "পুখমদা থাও হাপ্পীয়ু" },
        spices: { name: "মচলা অমসুং শিং", actionDesc: "সুগন্ধি মচলা অমসুং শিং হাপ্পীয়ু" },
        turmeric: { name: "য়াইঙং", actionDesc: "য়াইঙং অমসুং থুম হাপ্পীয়ু" },
        fish: { name: "তুরেলগী ঙা", actionDesc: "ঙাগী তুক্ৰাশিং পুখমদা হাপ্পীয়ু" },
        lemon: { name: "কাজিনীমুগী মহী", actionDesc: "কাজিনীমু মহী হাপ্পীয়ু" },
      },
    },
    brx: {
      title: "आसामनि ना टेंगा",
      subtitle: "खाजि लेबुजों संनाय ना गोदै आन्जा",
      steps: {
        oil: { name: "थाव", actionDesc: "दैहुआव थाव हो" },
        spices: { name: "मसला आरो हाजिं", actionDesc: "मसला आरो हाजिं हो" },
        turmeric: { name: "हालदै", actionDesc: "हालदै आरो संख्रि हो" },
        fish: { name: "गोथां ना", actionDesc: "ना टुकानि मुवाखौ दैहुआव हो" },
        lemon: { name: "खाजि लेबुनि दै", actionDesc: "खाजि लेबुनि दै सिरना हो" },
      },
    },
    grt: {
      title: "Assamni Na·tok Tenga",
      subtitle: "Kaji Nemu te·chikchi song·gimin na·tok kari",
      steps: {
        oil: { name: "Toko rongtalgipa", actionDesc: "Song·chakgimin sam·diko toko sonangbo" },
        spices: { name: "Mosla aro e·ching", actionDesc: "Mosla aro e·chingko sonangbo" },
        turmeric: { name: "Haldio", actionDesc: "Haldio aro kariko sonangbo" },
        fish: { name: "Na·tok", actionDesc: "Na·tokko sam·diko sonangbo" },
        lemon: { name: "Kaji nemuni chi", actionDesc: "Kaji nemuni chiko sonangbo" },
      },
    },
    kha: {
      title: "Dohkha Tenga jong ka Assam",
      subtitle: "Ka jingshet dohkha bad u sohmynken Kaji Nemu",
      steps: {
        oil: { name: "Umphniang sharak", actionDesc: "Theh ka umphniang ha u khaddei ba khluit" },
        spices: { name: "Ki musla bad u sying", actionDesc: "Theh ki musla bad u sying ba la dung" },
        turmeric: { name: "Shynrai", actionDesc: "Buh ka shynrai bad ka mluh" },
        fish: { name: "Dohkha wah", actionDesc: "Buh ki dkhot dohkha ha u khaddei" },
        lemon: { name: "Ka um sohmynken Kaji Nemu", actionDesc: "Khem ka um sohmynken kaji nemu" },
      },
    },
    lus: {
      title: "Assam Sangha Tenga",
      subtitle: "Kaji Nemu chhum pawlh sangha thak tui tak",
      steps: {
        oil: { name: "Hriak thianghlim", actionDesc: "Bel saah hriak thlak rawh" },
        spices: { name: "Thil al leh thing", actionDesc: "Chawhmeh rimtui leh thing thlak rawh" },
        turmeric: { name: "Aieng", actionDesc: "Aieng leh chi theh rawh" },
        fish: { name: "Sangha tharlam", actionDesc: "Sangha themte chu belah dah rawh" },
        lemon: { name: "Kaji Nemu tui", actionDesc: "Kaji Nemu tui sawr lut rawh" },
      },
    },
  },
  jadoh: {
    en: {
      title: "Khasi Fragrant Jadoh",
      subtitle: "Traditional Shillong rice stew with turmeric & herbs",
      steps: {
        oil: { name: "Mustard Oil", actionDesc: "Heat the clay pot" },
        onion: { name: "Chopped Onions & Ginger", actionDesc: "Sauté onions till golden" },
        bay: { name: "Bay Leaves & Cardamom", actionDesc: "Add aromatic hill spices" },
        rice: { name: "Highland Sticky Rice", actionDesc: "Stir in the washed local rice" },
      },
    },
    as: {
      title: "খাচী সুগন্ধি জাদহ",
      subtitle: "হালধি আৰু সুবাসিত পাহাৰীয়া মচলাৰে ছিলঙৰ পৰম্পৰাগত ভাত",
      steps: {
        oil: { name: "মিঠাতেল", actionDesc: "মাটিৰ পাত্ৰটো গৰম কৰক" },
        onion: { name: "কটা পিয়াঁজ আৰু আদা", actionDesc: "পিয়াঁজ সোণালী হোৱালৈকে ভাজক" },
        bay: { name: "তেজপাত আৰু ইলাচি", actionDesc: "সুগন্ধি পাহাৰীয়া মচলা দিয়ক" },
        rice: { name: "পাহাৰীয়া জহা চাউল", actionDesc: "ধুই থোৱা চাউল পাত্ৰত দি লৰাওক" },
      },
    },
    hi: {
      title: "खासी सुगंधित जादोह",
      subtitle: "शिलांग का पारंपरिक हल्दी और पहाड़ी जड़ी-बूटियों से बना चावल",
      steps: {
        oil: { name: "सरसों का तेल", actionDesc: "मिट्टी की हांडी को गर्म करें" },
        onion: { name: "कटा प्याज और अदरक", actionDesc: "प्याज को सुनहरा होने तक भूनें" },
        bay: { name: "तेजपत्ता और इलायची", actionDesc: "सुगंधित पहाड़ी मसाले डालें" },
        rice: { name: "पहाड़ी चावल", actionDesc: "धुले हुए चावल डालकर चलाएं" },
      },
    },
    bn: {
      title: "খাসি সুগন্ধি জাদোহ",
      subtitle: "হলুদ ও পাহাড়ি ভেষজে তৈরি শিলংয়ের ঐতিহ্যবাহী চালের পদ",
      steps: {
        oil: { name: "সরিষার তেল", actionDesc: "মাটির হাঁড়িটি গরম করুন" },
        onion: { name: "কাঁচা পেঁয়াজ ও আদা", actionDesc: "পেঁয়াজ সোনালী করে ভাজুন" },
        bay: { name: "তেজপাতা ও এলাচ", actionDesc: "সুগন্ধি পাহাড়ি মশলা যোগ করুন" },
        rice: { name: "পাহাড়ি সুগন্ধি চাল", actionDesc: "ধোয়া চাল হাঁড়িতে দিয়ে নাড়ুন" },
      },
    },
    mr: {
      title: "खासी सुगंधी जादोह",
      subtitle: "हळद आणि औषधी वनस्पतींनी युक्त पारंपरिक शिलाँग भाताचा प्रकार",
      steps: {
        oil: { name: "मोहरीचे तेल", actionDesc: "मातीचे भांडे गरम करा" },
        onion: { name: "चिरलेला कांदा व आले", actionDesc: "कांदा सोनेरी होईपर्यंत परता" },
        bay: { name: "तमालपत्र व वेलची", actionDesc: "सुगंधी मसाले घाला" },
        rice: { name: "पहाडी तांदूळ", actionDesc: "धुतलेला तांदूळ घालून ढवळा" },
      },
    },
    ne: {
      title: "खासी जादोह",
      subtitle: "शिलाङको परम्परागत बेसार र जडीबुटीयुक्त चामलको परिकार",
      steps: {
        oil: { name: "तोरीको तेल", actionDesc: "माटोको भाँडो तताउनुहोस्" },
        onion: { name: "काटेको प्याज र अदुवा", actionDesc: "प्याज सुनौलो नहुञ्जेल भुट्नुहोस्" },
        bay: { name: "तेजपात र सुकुमेल", actionDesc: "सुगन्धित मसला हाल्नुहोस्" },
        rice: { name: "पहाडी चामल", actionDesc: "पखालेको चामल हालेर चलाउनुहोस्" },
      },
    },
    mni: {
      title: "খাসী জাদোহ",
      subtitle: "শিলোংগী য়াইঙং অমসুং হিদাক-লাংথক হাপ্পা চেংগী মহাও",
      steps: {
        oil: { name: "থাও", actionDesc: "লৈপাক্কী পুখম শাগৎলু" },
        onion: { name: "তিলহৌ অমসুং শিং", actionDesc: "তিলহৌ ঙাংনা কাংলু" },
        bay: { name: "তেজপাত অমসুং এলাচি", actionDesc: "পাহাড়গী মচলা হাপ্পীয়ু" },
        rice: { name: "চাক চেং", actionDesc: "চেং হাপ্পীয়ু" },
      },
    },
    brx: {
      title: "खासि जाद'ह",
      subtitle: "सिलंनि हारिमु हालदै आरो संनाय माइरंनि आन्जा",
      steps: {
        oil: { name: "थाव", actionDesc: "हायानि दैहुखौ दुंहाव" },
        onion: { name: "फान्थाव आरो हाजिं", actionDesc: "फान्थावखौ फ्राई खालाम" },
        bay: { name: "तेजपात आरो एलाइसि", actionDesc: "मसलाफोरखौ हो" },
        rice: { name: "हाजोनि माइरं", actionDesc: "माइरं होनानै लोरहो" },
      },
    },
    grt: {
      title: "Khasi Jadoh",
      subtitle: "Shillongni haldio aro samrangchi song·gimin me·rong",
      steps: {
        oil: { name: "Toko", actionDesc: "A·ani sam·dikko ding·atbo" },
        onion: { name: "Rasun aro e·ching", actionDesc: "Rasun gitchakgipa ong·ana song·bo" },
        bay: { name: "Tejpat aro elasi", actionDesc: "A·brini moslarangko sonangbo" },
        rice: { name: "Me·rong", actionDesc: "Me·rongko su·ale sonangbo" },
      },
    },
    kha: {
      title: "Jadoh Khasi",
      subtitle: "Ka ja ba la shet bha ha Shillong da ka shynrai bad ki jingthaw",
      steps: {
        oil: { name: "Umphniang sharak", actionDesc: "Pynkhluit ia u khiew khyndew" },
        onion: { name: "Ki pylleng bad u sying", actionDesc: "Shet ia ki rynsun haduh ban da stem" },
        bay: { name: "Ka sla tejpat bad u kynbat", actionDesc: "Theh ia ki musla lum" },
        rice: { name: "U kba Lum", actionDesc: "Theh ia u kba ba la sait bha" },
      },
    },
    lus: {
      title: "Khasi Jadoh",
      subtitle: "Shillong buh chhum dan dik aieng leh hnah tui tak",
      steps: {
        oil: { name: "Hriak", actionDesc: "Hlum bel tihsat hmasak rawh" },
        onion: { name: "Purun leh thing", actionDesc: "Purun a eng thleng kan rawh" },
        bay: { name: "Tejpat leh thil rimtui", actionDesc: "Tlang lam thil rimtui thlak rawh" },
        rice: { name: "Tlang buhfai", actionDesc: "Buhfai sil thianghlim chawh rawh" },
      },
    },
  },
  thukpa: {
    en: {
      title: "Sikkimese Mountain Thukpa",
      subtitle: "Warming Himalayan noodle broth with mountain herbs",
      steps: {
        broth: { name: "Clear Mountain Broth", actionDesc: "Simmer fragrant herb broth" },
        veggies: { name: "Bok Choy & Carrots", actionDesc: "Add crisp mountain greens" },
        noodles: { name: "Handmade Wheat Noodles", actionDesc: "Drop in fresh soft noodles" },
        garlic: { name: "Fried Mountain Garlic", actionDesc: "Garnish with golden crispy garlic" },
      },
    },
    as: {
      title: "ছিক্কিমী পাহাৰীয়া থুকপা",
      subtitle: "হিমালয়ৰ সুগন্ধি পাহাৰীয়া শাক-পাচলি আৰু নুডলছৰ গৰম চুপ",
      steps: {
        broth: { name: "পাহাৰীয়া চুপ", actionDesc: "সুগন্ধি শাকৰ চুপ লাহে লাহে উতলাওক" },
        veggies: { name: "সতেজ গাজৰ আৰু শাক", actionDesc: "কুচি কুচি কটা সতেজ শাক দিয়ক" },
        noodles: { name: "হাতত বনোৱা নুডলছ", actionDesc: "কোমল নুডলছ চুপত পেলাই দিয়ক" },
        garlic: { name: "ভজা পাহাৰীয়া নহৰু", actionDesc: "মচমচীয়া ভজা নহৰুৰে সজাই তোলক" },
      },
    },
    hi: {
      title: "सिक्किमी पहाड़ी थुकपा",
      subtitle: "हिमालयी जड़ी-बूटियों और नूडल्स से बना गर्मागर्म पौष्टिक सूप",
      steps: {
        broth: { name: "स्वादिष्ट हर्बल सूप", actionDesc: "सुगंधित सूप को धीमी आंच पर पकाएं" },
        veggies: { name: "पहाड़ी सब्जियां व गाजर", actionDesc: "ताज़ी कटी हुई हरी सब्जियां डालें" },
        noodles: { name: "हाथ से बने नूडल्स", actionDesc: "ताज़े मुलायम नूडल्स सूप में डालें" },
        garlic: { name: "भुना हुआ लहसुन", actionDesc: "कुरकुरे भुने लहसुन से सजाएं" },
      },
    },
    bn: {
      title: "সিকিমের পাহাড়ি থুকপা",
      subtitle: "হিমালয়ের টাটকা শাকসবজি ও নুডলসের গরম পুষ্টিকর স্যুপ",
      steps: {
        broth: { name: "সুস্বাদু পাহাড়ি স্যুপ", actionDesc: "সুগন্ধি ভেষজ স্যুপটি ধীরে ধীরে ফুটান" },
        veggies: { name: "টাটকা শাকসবজি ও গাজর", actionDesc: "মুচমুচে সবুজ শাকসবজি যোগ করুন" },
        noodles: { name: "হাতে তৈরি নুডলস", actionDesc: "নরম তাজা নুডলস স্যুপে ঢালুন" },
        garlic: { name: "ভাজা পাহাড়ি রসুন", actionDesc: "মুচমুচে সোনালী রসুন ছড়িয়ে দিন" },
      },
    },
    mr: {
      title: "सिक्कीमी पहाडी थुकपा",
      subtitle: "हिमालयातील भाज्या आणि नूडल्सचा गरमागरम पौष्टिक सूप",
      steps: {
        broth: { name: "सुगंधी हर्बल सूप", actionDesc: "सुगंधी सूप मंद आचेवर उकळू द्या" },
        veggies: { name: "हिरव्या भाज्या व गाजर", actionDesc: "ताज्या चिरलेल्या भाज्या टाका" },
        noodles: { name: "हाताने बनवलेले नूडल्स", actionDesc: "ताजे मऊ नूडल्स सूपमध्ये घाला" },
        garlic: { name: "तळलेला लसूण", actionDesc: "कुरकुरीत लसणाने सजवा" },
      },
    },
    ne: {
      title: "सिक्किमी हिमाली थुक्पा",
      subtitle: "हिमाली जडीबुटी र चाउचाउको तातो पोषिलो झोल",
      steps: {
        broth: { name: "तातो हिमाली सुप", actionDesc: "सुगन्धित सुप बिस्तारै उमाल्नुहोस्" },
        veggies: { name: "सागसब्जी र गाजर", actionDesc: "ताजा हरियो तरकारीहरू हाल्नुहोस्" },
        noodles: { name: "हातले बनाएको थुक्पा", actionDesc: "नरम थुक्पा सुपमा हाल्नुहोस्" },
        garlic: { name: "तारेको लसुन", actionDesc: "कुरमुरे लसुनले सजाउनुहोस्" },
      },
    },
    mni: {
      title: "সিক্কিমগী চিংগী থুকপা",
      subtitle: "হিঙ্গোৎ-নাপোৎনা শেম্বা অশাংবা নুডলগী চুপ",
      steps: {
        broth: { name: "চুপ মহী", actionDesc: "হিদাক-লাংথক চুপ অশাবা শাগৎলু" },
        veggies: { name: "উনা-মনা অমসুং গাজর", actionDesc: "সতেজ উনা-মনা হাপ্পীয়ু" },
        noodles: { name: "নুডলস", actionDesc: "নুডলস চুপতা হাপ্পীয়ু" },
        garlic: { name: "ঙাংনা কাংবা চনাম", actionDesc: "চনাম ঙাংবা হাপ্পীয়ু" },
      },
    },
    brx: {
      title: "सिक्किमनि थुकपा",
      subtitle: "हाजोनि संनाय नुडुलसनि गुदुं सूप",
      steps: {
        broth: { name: "हाजोनि सूप", actionDesc: "सूपखौ दुंहाव" },
        veggies: { name: "गाजर आरो बिलाइ", actionDesc: "गोथां बिलाइफोरखौ हो" },
        noodles: { name: "नुडुलस", actionDesc: "नुडुलसखौ सूपआव हो" },
        garlic: { name: "फ्राई सामब्राम", actionDesc: "सामब्रामजों सजाय" },
      },
    },
    grt: {
      title: "Sikkimni Thukpa",
      subtitle: "Himalayani sam aro me·su soup",
      steps: {
        broth: { name: "A·brini soup", actionDesc: "Soupko song·bo" },
        veggies: { name: "Me·su aro gajor", actionDesc: "Tang·gipa me·surangko sonangbo" },
        noodles: { name: "Noodles", actionDesc: "Noodlesko soup-o sonangbo" },
        garlic: { name: "Song·gimin rasun", actionDesc: "Rasunchi taria cha·bo" },
      },
    },
    kha: {
      title: "Thukpa jong ka Sikkim",
      subtitle: "Ka syrwa khluit ba shna da ki kynbat lum bad ki noodles",
      steps: {
        broth: { name: "Ka syrwa lum", actionDesc: "Pynkhluit ia ka syrwa kynbat" },
        veggies: { name: "Ki jhur bad u karot", actionDesc: "Buh ia ki jhur lum" },
        noodles: { name: "Ki noodles kti", actionDesc: "Theh ia ki noodles ha ka syrwa" },
        garlic: { name: "Rynsun ba la pynkhluit", actionDesc: "Buh ia u rynsun ba la shet stem" },
      },
    },
    lus: {
      title: "Sikkim Thukpa",
      subtitle: "Himalaya thil rimtui leh noodles tui tak sa nuam tak",
      steps: {
        broth: { name: "Tlang soup", actionDesc: "Soup chu chhuang so rawh" },
        veggies: { name: "Thlai hnah leh carrot", actionDesc: "Thlai hnah tharlam thlak rawh" },
        noodles: { name: "Kut chhuak noodles", actionDesc: "Noodles nem chu soup-ah thlak rawh" },
        garlic: { name: "Purun var kan rimtui", actionDesc: "Purun var ro kan hmin thlak rawh" },
      },
    },
  },
  bai: {
    en: {
      title: "Mizo Herbal Bai",
      subtitle: "Soothing indigenous vegetable & bamboo shoot stew",
      steps: {
        water: { name: "Spring Water Base", actionDesc: "Bring fresh hill spring water to boil" },
        bamboo: { name: "Fresh Bamboo Shoots", actionDesc: "Add tender sliced mountain bamboo shoots" },
        greens: { name: "Local Mustard Greens", actionDesc: "Fold in freshly harvested greens" },
        herbs: { name: "Steamed Fermented Soya", actionDesc: "Season with fragrant mountain herbs" },
      },
    },
    as: {
      title: "মিজো ভেষজ বাই",
      subtitle: "বাঁহৰ গাজ আৰু বনৌষধি শাক-পাচলিৰে প্ৰস্তুত প্ৰশান্তিদায়ক চুপ",
      steps: {
        water: { name: "পাহাৰীয়া জুৰিৰ পানী", actionDesc: "পাহাৰীয়া নিজৰাৰ সতেজ পানী উতলাওক" },
        bamboo: { name: "সতেজ বাঁহৰ গাজ", actionDesc: "কোমলকৈ কটা বাঁহৰ গাজ দিয়ক" },
        greens: { name: "লাই শাক", actionDesc: "সতেজ স্থানীয় লাই শাক মিহলাই দিয়ক" },
        herbs: { name: "মিজো পাহাৰীয়া ভেষজ", actionDesc: "সুগন্ধি বনৌষধিৰে সুস্বাদু কৰি তোলক" },
      },
    },
    hi: {
      title: "मिज़ो पारंपरिक बाई",
      subtitle: "ताज़े बांस के करील और हरी पत्तियों से बना पारंपरिक पौष्टिक सूप",
      steps: {
        water: { name: "झरने का ताज़ा पानी", actionDesc: "पहाड़ी झरने के पानी को उबालें" },
        bamboo: { name: "ताज़ा बांस का करील", actionDesc: "बारीक कटा कोमल बांस का करील डालें" },
        greens: { name: "हरी पत्तेदार सब्जियां", actionDesc: "ताज़ी हरी पत्तियां सूप में मिलाएं" },
        herbs: { name: "पहाड़ी सुगंधित जड़ी-बूटियां", actionDesc: "स्वादिष्ट पारंपरिक मसालों से सजाएं" },
      },
    },
    bn: {
      title: "মিজো ভেষজ বাই",
      subtitle: "বাঁশের কোড়ল ও পাহাড়ি টাটকা শাকসবজির পুষ্টিকর ঝোল",
      steps: {
        water: { name: "পাহাড়ি ঝর্ণার জল", actionDesc: "পাহাড়ি নির্মল জল ফুটিয়ে নিন" },
        bamboo: { name: "টাটকা বাঁশের কোড়ল", actionDesc: "নরম করে কাটা বাঁশের কোড়ল দিন" },
        greens: { name: "টাটকা সবুজ শাক", actionDesc: "স্থানীয় সতেজ শাকসবজি মেশান" },
        herbs: { name: "পাহাড়ি সুগন্ধি ভেষজ", actionDesc: "সুগন্ধি ভেষজ দিয়ে সুস্বাদু করুন" },
      },
    },
    mr: {
      title: "मिझो हर्बल बाई",
      subtitle: "बांबूचे कोंब आणि ताज्या भाज्यांचा आरोग्यदायी सूप",
      steps: {
        water: { name: "झऱ्याचे शुद्ध पाणी", actionDesc: "पहाडी झऱ्याचे पाणी उकळवा" },
        bamboo: { name: "ताजे बांबूचे कोंब", actionDesc: "बारीक चिरलेले कोवळे बांबूचे कोंब टाका" },
        greens: { name: "ताज्या हिरव्या भाज्या", actionDesc: "स्थानिक हिरव्या पालेभाज्या घाला" },
        herbs: { name: "पहाडी औषधी वनस्पती", actionDesc: "सुगंधी औषधी वनस्पतींनी चव आणा" },
      },
    },
    ne: {
      title: "मिजो हर्बल बाई",
      subtitle: "ताजा तामा (बाँसको टुसा) र जडीबुटीयुक्त पौष्टिक सुप",
      steps: {
        water: { name: "खोलाको सफा पानी", actionDesc: "पहाडी मूलको पानी उमाल्नुहोस्" },
        bamboo: { name: "ताजा बाँसको तामा", actionDesc: "नरम तामा काटेर हाल्नुहोस्" },
        greens: { name: "हरियो रायोको साग", actionDesc: "ताजा स्थानीय साग मिसाउनुहोस्" },
        herbs: { name: "हिमाली जडीबुटी", actionDesc: "सुगन्धित जडीबुटीले स्वादिष्ट बनाउनुहोस्" },
      },
    },
    mni: {
      title: "মিজো হর্বল বাই",
      subtitle: "উশোই অমসুং উনা-মনা হাপ্পা অশাবা মহী",
      steps: {
        water: { name: "ইশিং", actionDesc: "চিংগী ইশিং শাগৎলু" },
        bamboo: { name: "অশেংবা উশোই", actionDesc: "উশোই তুক্ৰা হাপ্পীয়ু" },
        greens: { name: "উনা-মনা", actionDesc: "সতেজ উনা-মনা হাপ্পীয়ু" },
        herbs: { name: "চিংগী মচাক", actionDesc: "সুগন্ধি মচাক হাপ্পীয়ু" },
      },
    },
    brx: {
      title: "मिज' हर्बल बाइ",
      subtitle: "मेवा आरो गोथां बिलाइजों संनाय सूप",
      steps: {
        water: { name: "झोरनानि दै", actionDesc: "हाजोनि दैखौ दुंहाव" },
        bamboo: { name: "गोथां मेवा", actionDesc: "मेवा टुकानि मुवाखौ दैहुआव हो" },
        greens: { name: "गोथां बिलाइ", actionDesc: "गोथां बिलाइफोरखौ हो" },
        herbs: { name: "हाजोनि मुलि", actionDesc: "गोथाव मुलिफोरखौ हो" },
      },
    },
    grt: {
      title: "Mizo Herbal Bai",
      subtitle: "A·brini me·su aro me·wa soup",
      steps: {
        water: { name: "Chikani chi", actionDesc: "Rongtalgipa chiko ding·atbo" },
        bamboo: { name: "Me·wa", actionDesc: "Tanggipa me·wako sonangbo" },
        greens: { name: "Samjak", actionDesc: "Samjakrangko sonangbo" },
        herbs: { name: "A·brini samrang", actionDesc: "Samrangchi taria cha·bo" },
      },
    },
    kha: {
      title: "Bai Mizo",
      subtitle: "Ka syrwa ba shna da u thlu lung bad ki jhur lum",
      steps: {
        water: { name: "Ka um pynthor", actionDesc: "Pynkhluit ia ka um lum" },
        bamboo: { name: "U thlu lung", actionDesc: "Buh ia u thlu lung ba la ot lyngkhot" },
        greens: { name: "Ki jhur krai", actionDesc: "Buh ia ki jhur lum ba shngiam" },
        herbs: { name: "Ki kynbat lum", actionDesc: "Pynsma bang da ki kynbat lum" },
      },
    },
    lus: {
      title: "Mizo Herbal Bai",
      subtitle: "Mizo thlai hnah leh rawtuai bai tui tak",
      steps: {
        water: { name: "Tuikhur tui", actionDesc: "Tlang lam tuikhur tui thianghlim chhuang so rawh" },
        bamboo: { name: "Rawtwai tharlam", actionDesc: "Rawtwai no zai them chu thlak rawh" },
        greens: { name: "Anhnah tharlam", actionDesc: "Antam leh thlai hnah lawh thar thlak rawh" },
        herbs: { name: "Saum rimtui", actionDesc: "Saum rimtui leh thil rimtui thlak rawh" },
      },
    },
  },
};

export interface RecipeStep {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  actionDesc: string;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  steps: RecipeStep[];
}

const RECIPES: Recipe[] = [
  {
    id: "tenga",
    title: "Assamese Masor Tenga",
    subtitle: "Tangy fresh river curry with fragrant Kaji Nemu lemon",
    icon: CookingPot,
    steps: [
      { id: "oil", name: "Pure Mustard Oil", icon: Droplets, actionDesc: "Pour golden mustard oil into hot pan" },
      { id: "spices", name: "Panch Phoron & Ginger", icon: Sparkles, actionDesc: "Add fragrant five spices and crushed ginger" },
      { id: "turmeric", name: "Golden Turmeric", icon: Flame, actionDesc: "Sprinkle turmeric and sea salt" },
      { id: "fish", name: "Fresh River Fish", icon: Fish, actionDesc: "Gently add fresh tender fish pieces" },
      { id: "lemon", name: "Kaji Nemu Lemon Juice", icon: Citrus, actionDesc: "Squeeze fresh tangy Kaji Nemu juice" },
    ],
  },
  {
    id: "jadoh",
    title: "Khasi Fragrant Jadoh",
    subtitle: "Traditional Shillong rice stew with turmeric & herbs",
    icon: Wheat,
    steps: [
      { id: "oil", name: "Mustard Oil", icon: Droplets, actionDesc: "Heat the clay pot" },
      { id: "onion", name: "Chopped Onions & Ginger", icon: Carrot, actionDesc: "Sauté onions till golden" },
      { id: "bay", name: "Bay Leaves & Cardamom", icon: Leaf, actionDesc: "Add aromatic hill spices" },
      { id: "rice", name: "Highland Sticky Rice", icon: Wheat, actionDesc: "Stir in the washed local rice" },
    ],
  },
  {
    id: "thukpa",
    title: "Sikkimese Mountain Thukpa",
    subtitle: "Warming Himalayan noodle broth with mountain herbs",
    icon: Soup,
    steps: [
      { id: "broth", name: "Clear Mountain Broth", icon: Soup, actionDesc: "Simmer fragrant herb broth" },
      { id: "veggies", name: "Bok Choy & Carrots", icon: Salad, actionDesc: "Add crisp mountain greens" },
      { id: "noodles", name: "Handmade Wheat Noodles", icon: Utensils, actionDesc: "Drop in fresh soft noodles" },
      { id: "garlic", name: "Fried Mountain Garlic", icon: Sparkles, actionDesc: "Garnish with golden crispy garlic" },
    ],
  },
  {
    id: "bai",
    title: "Mizo Herbal Bai",
    subtitle: "Soothing indigenous vegetable & bamboo shoot stew",
    icon: BambooShootIcon,
    steps: [
      { id: "water", name: "Spring Water Base", icon: Droplets, actionDesc: "Bring fresh hill spring water to boil" },
      { id: "bamboo", name: "Fresh Bamboo Shoots", icon: BambooShootIcon, actionDesc: "Add tender sliced mountain bamboo shoots" },
      { id: "greens", name: "Local Mustard Greens", icon: Leaf, actionDesc: "Fold in freshly harvested greens" },
      { id: "herbs", name: "Steamed Fermented Soya", icon: Leaf, actionDesc: "Season with fragrant mountain herbs" },
    ],
  },
];

function deterministicShuffle<T>(arr: T[], seed: number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = (seed + i) % (i + 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function HeritageKitchenGame() {
  const locale = useLocale();
  const normLocale = (locale?.split("-")[0]?.toLowerCase() || "en") as SupportedLocale;
  const ui = KITCHEN_UI_I18N[normLocale] || KITCHEN_UI_I18N.en;
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "heritage-kitchen", startLevel(detail));
  const rate = speechRate(detail);

  const [recipeIdx, setRecipeIdx] = useState(0);
  const [phase, setPhase] = useState<"intro" | "cook" | "done">("intro");
  const [stepIdx, setStepIdx] = useState(0);
  const [potIngredients, setPotIngredients] = useState<RecipeStep[]>([]);
  const [isSizzling, setIsSizzling] = useState(false);
  const [hintActive, setHintActive] = useState(false);
  const [hesitationSeconds, setHesitationSeconds] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const recipe = RECIPES[recipeIdx] ?? RECIPES[0];
  const localizedRecipe = KITCHEN_DATA_I18N[recipe.id]?.[normLocale] || KITCHEN_DATA_I18N[recipe.id]?.en;
  const recipeTitle = localizedRecipe?.title || recipe.title;
  const recipeSubtitle = localizedRecipe?.subtitle || recipe.subtitle;

  const getStepLocalized = useCallback(
    (stepId: string) => {
      const currentRecipeSteps = localizedRecipe?.steps?.[stepId];
      if (currentRecipeSteps) return currentRecipeSteps;
      const enStep = KITCHEN_DATA_I18N[recipe.id]?.en?.steps?.[stepId];
      return enStep || { name: stepId, actionDesc: "" };
    },
    [localizedRecipe, recipe.id]
  );

  const currentStep = recipe.steps[stepIdx] ?? null;
  const currentStepLocalized = currentStep ? getStepLocalized(currentStep.id) : null;

  const guard = useSessionGuard({
    patientId,
    gameId: "heritage-kitchen",
    level,
    startedAt,
    taps,
    errorCount,
  });

  // Distractor ingredients pool
  const ingredientOptions = useMemo(() => {
    if (!currentStep) return [];
    const allStepsInRecipe = recipe.steps;
    const remainingSteps = allStepsInRecipe.filter((_, idx) => idx >= stepIdx);
    const options = [currentStep, ...remainingSteps.filter((s) => s.id !== currentStep.id).slice(0, 2)];
    return deterministicShuffle(options, stepIdx + recipeIdx);
  }, [currentStep, recipe, stepIdx, recipeIdx]);

  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Track hesitation for vanishing cues
  useEffect(() => {
    if (phase !== "cook" || !currentStep) return;
    setHesitationSeconds(0);
    const interval = setInterval(() => {
      setHesitationSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, currentStep, stepIdx]);

  const scaffold = calculateVanishingCue(hesitationSeconds, attemptCount);

  const announceStep = useCallback(
    (step: RecipeStep) => {
      stopSpeaking();
      const stepInfo = getStepLocalized(step.id);
      speak(ui.voiceAnnounce(stepInfo.name, stepInfo.actionDesc), locale, rate);
    },
    [locale, rate, getStepLocalized, ui]
  );

  function startCooking(selectedRecipeIdx = 0) {
    stopSpeaking();
    playPress();
    setRecipeIdx(selectedRecipeIdx);
    setStepIdx(0);
    setPotIngredients([]);
    setIsSizzling(false);
    setHintActive(false);
    setHesitationSeconds(0);
    setAttemptCount(0);
    setScore(0);
    setTaps(0);
    setErrorCount(0);
    setStartedAt(new Date().toISOString());
    setPhase("cook");
  }

  function handleAddIngredient(chosen: RecipeStep) {
    if (!currentStep || isSizzling) return;
    setTaps((v) => v + 1);

    const validation = validateMoveErrorless(chosen.id, currentStep.id);

    if (validation.isCorrect) {
      playSizzle();
      playCorrect();
      setIsSizzling(true);
      setScore((s) => s + 1);
      setPotIngredients((prev) => [...prev, chosen]);
      setHintActive(false);
      setHesitationSeconds(0);
      setAttemptCount(0);

      setTimeout(() => {
        setIsSizzling(false);
        const nextIdx = stepIdx + 1;
        if (nextIdx >= recipe.steps.length) {
          completeRecipe();
        } else {
          setStepIdx(nextIdx);
          announceStep(recipe.steps[nextIdx]);
        }
      }, 1000);
    } else {
      // Errorless Scaffolding soft-blocking (gentle harmonic bounce)
      setErrorCount((e) => e + 1);
      setAttemptCount((a) => a + 1);
      playPineBreeze();
      setHintActive(true);
      speak(
        ui.voiceAddFirst(currentStepLocalized?.name || currentStep.name),
        locale,
        rate
      );
    }
  }

  function completeRecipe() {
    stopSpeaking();
    playComplete();
    setPhase("done");
    guard.markCompleted();

    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "heritage-kitchen",
        level,
        outcome: "completed",
        score: recipe.steps.length,
        startedAt,
        taps,
        errorCount,
      });
    }
    speak(
      ui.voiceComplete(recipeTitle),
      locale,
      rate
    );
  }

  const str = getGameStrings("heritage-kitchen", locale);

  if (loading) return <GameLoading />;
  if (error)
    return (
      <section className="pb-12">
        <GameHeader
          title={str.title}
          score={0}
          backHref="/patient/games"
          bgColor="bg-tea"
          gameId="heritage-kitchen"
        />
        <div className="mx-auto max-w-3xl px-4 pt-6">
          <GameError onRetry={reload} />
        </div>
      </section>
    );

  return (
    <section className="pb-12">
      <GameHeader
        title={str.title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-tea"
        gameId="heritage-kitchen"
      />
      <div className="mx-auto max-w-3xl px-4 pt-6">
        {phase === "intro" ? (
          <div className="flex flex-col items-center gap-6 py-8 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-black bg-amber-100 shadow-[3px_3px_0px_#000] animate-bounce">
              <CookingPot className="h-9 w-9 text-amber-900" />
            </div>
            <p className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </p>
            <p className="max-w-md text-lg font-semibold text-ink-secondary">
              {str.introSubtitle}
            </p>

            {/* Recipe Selection Cards */}
            <div className="w-full max-w-md space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-tea">
                {str.hudAction}
              </span>
              <div className="grid gap-3">
                {RECIPES.map((r, idx) => {
                  const locR = KITCHEN_DATA_I18N[r.id]?.[normLocale] || KITCHEN_DATA_I18N[r.id]?.en;
                  const rTitle = locR?.title || r.title;
                  const rSub = locR?.subtitle || r.subtitle;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => startCooking(idx)}
                      className="btn-tactile group flex items-center justify-between rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-transform hover:scale-102 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-black/20 bg-amber-50">
                          <r.icon className="h-6 w-6 text-amber-900" />
                        </div>
                        <div>
                          <p className="text-base font-black text-ink">{rTitle}</p>
                          <p className="text-xs font-semibold text-ink-secondary">{rSub}</p>
                        </div>
                      </div>
                      <span className="text-xl text-tea font-black">→</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <AudioPrompt
              text={str.audioPrompt}
              label={str.listenLabel}
              size="md"
            />

            <ChunkyButton variant="tea" size="2xl" onClick={() => startCooking(0)}>
              {ui.startCooking}
            </ChunkyButton>
          </div>
        ) : phase === "cook" ? (
          <div className="flex flex-col items-center gap-5 py-4">
            {/* RECIPE PROGRESS HEADER */}
            <div className="w-full max-w-md flex items-center justify-between rounded-2xl border-2 border-black bg-surface px-4 py-2 shadow-sm">
              <span className="text-sm font-black text-tea">{recipeTitle}</span>
              <span className="text-xs font-bold text-ink-secondary">
                {ui.step(stepIdx + 1, recipe.steps.length)}
              </span>
            </div>

            {/* CLAY STOVE & BRASS KARAHI STAGE */}
            <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl border-4 border-[#3A1D0E] bg-[#221008] p-5 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] overflow-hidden select-none flex flex-col items-center justify-center min-h-[260px]">
              {/* Cooking Pot Glow */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#F97316_1px,transparent_1px)] [background-size:12px_12px]" />

              {/* Sizzling Steam Effect */}
              {isSizzling && (
                <div className="absolute top-4 pointer-events-none animate-ping">
                  <Flame className="h-8 w-8 text-orange-400" />
                </div>
              )}

              {/* The Brass Karahi / Cooking Vessel */}
              <div className="relative z-10 flex flex-col items-center justify-center h-44 w-44 rounded-full border-4 border-amber-600 bg-gradient-to-b from-amber-950 via-amber-900 to-black shadow-2xl p-3 text-center">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  {ui.brassPot}
                </span>

                {/* Added Ingredients inside the pot */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2 max-w-[120px]">
                  {potIngredients.map((item, idx) => {
                    const itemLoc = getStepLocalized(item.id);
                    const ItemIcon = item.icon;
                    return (
                      <div key={idx} className="p-1 rounded bg-amber-800/90 border border-amber-600 animate-bounce" title={itemLoc.name}>
                        <ItemIcon className="h-4 w-4 text-amber-200" />
                      </div>
                    );
                  })}
                </div>

                {isSizzling && (
                  <span className="mt-1 flex items-center justify-center gap-1 text-[11px] font-black text-amber-400 animate-pulse">
                    <Flame className="h-3 w-3" /> {ui.sizzling}
                  </span>
                )}
              </div>

              {/* TACTILE WOODEN LADLE STIR BUTTON */}
              <div className="mt-3 flex items-center justify-center gap-2 z-10">
                <button
                  type="button"
                  onClick={() => {
                    playSizzle();
                    setIsSizzling(true);
                    setTimeout(() => setIsSizzling(false), 900);
                  }}
                  className="btn-tactile flex items-center gap-1.5 rounded-full border-2 border-amber-500 bg-amber-900/80 px-3 py-1 text-xs font-black text-amber-200 shadow-md hover:bg-amber-800 active:translate-y-0.5 cursor-pointer"
                >
                  <span className="flex items-center gap-1.5"><Utensils className="h-3.5 w-3.5" /> {ui.stirLadle}</span>
                </button>

                {currentStepLocalized && (
                  <span className="text-xs font-black text-amber-200 bg-black/60 px-3 py-1 rounded-full border border-amber-500/40">
                    {ui.next(currentStepLocalized.name)}
                  </span>
                )}
              </div>
            </div>

            {/* HINT BANNER IF ACTIVE */}
            {hintActive && currentStepLocalized && (
              <div className="rounded-xl border-2 border-marigold bg-marigold-light p-3 text-center text-sm font-bold text-ink shadow-sm animate-pulse max-w-md w-full">
                {ui.tapToCook(currentStepLocalized.name)}
              </div>
            )}

            {/* INGREDIENTS TRAY */}
            <div className="w-full max-w-md space-y-2 text-center pt-2">
              <p className="text-sm font-black text-ink-secondary uppercase tracking-wider">
                {ui.selectIngredient}
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {ingredientOptions.map((item) => {
                  const isTarget = item.id === currentStep?.id;
                  const isCueActive = isTarget && (hintActive || scaffold.intensity !== "none" || attemptCount > 0);
                  const ItemIcon = item.icon;
                  const itemLoc = getStepLocalized(item.id);

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleAddIngredient(item)}
                      disabled={isSizzling}
                      className={`btn-tactile group relative flex flex-col items-center gap-1 rounded-2xl border-3 p-3 transition-all duration-200 cursor-pointer shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-0.5 ${
                        isCueActive
                          ? scaffold.intensity === "guided_highlight" || attemptCount >= 2
                            ? "ring-4 ring-amber-500 bg-amber-100 border-amber-700 shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse scale-105"
                            : "ring-4 ring-amber-400/80 bg-amber-50 border-amber-600 animate-pulse scale-[1.02]"
                          : "border-black bg-surface text-ink hover:bg-surface-muted"
                      }`}
                    >
                      {isCueActive && (
                        <span className="absolute -top-2.5 right-1 rounded-full bg-amber-200 border border-amber-500 px-1.5 py-0.2 text-[9px] font-black text-amber-950 uppercase tracking-tight shadow-xs">
                          {ui.guide}
                        </span>
                      )}
                      <div className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border-2 ${isCueActive ? "border-amber-500 bg-amber-100" : "border-black/20 bg-amber-50"}`}>
                        <ItemIcon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-900" />
                      </div>
                      <span className="text-xs font-black leading-tight truncate max-w-[90px]">
                        {itemLoc.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          /* PHASE: DONE CELEBRATION */
          <Celebration icon={Utensils} title={str.celebrationTitle}>
            <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left">
              <div className="relative w-full rounded-3xl border-4 border-black bg-[#FAF5EE] p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-ink select-none">
                <h3 className="font-serif text-2xl font-black text-tea">
                  {recipeTitle}
                </h3>
                <p className="text-xs font-bold text-ink-secondary mt-1">
                  {str.celebrationSubtitle}
                </p>

                {/* Recipe Ingredients Summary */}
                <div className="mt-3 space-y-1 border-t border-border pt-2">
                  <span className="text-[11px] font-black uppercase tracking-wider text-ink-secondary">
                    {str.hudProgress}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {recipe.steps.map((s) => (
                      <span key={s.id} className="rounded-lg bg-tea-light border border-tea px-2 py-0.5 text-xs font-bold text-ink">
                        {getStepLocalized(s.id).name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Music Button */}
                <div className="mt-4 flex items-center justify-between pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => playLifeSong()}
                    className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3.5 py-2 text-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 cursor-pointer"
                  >
                    <Music className="h-4 w-4 text-ink" />
                    <span className="text-xs font-black">{ui.playFolkTune}</span>
                  </button>
                  <span className="text-xs font-bold text-ink-secondary">
                    {ui.score(score, recipe.steps.length)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <ChunkyButton variant="tea" size="xl" onClick={() => startCooking((recipeIdx + 1) % RECIPES.length)}>
                  {str.playAgainButton}
                </ChunkyButton>
                <Link
                  href="/patient/games"
                  className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-surface px-6 py-3 font-extrabold text-ink hover:bg-surface-muted shadow-[2px_2px_0px_rgba(0,0,0,1)]"
                >
                  {str.backToHub}
                </Link>
              </div>
            </div>
          </Celebration>
        )}
      </div>
    </section>
  );
}
