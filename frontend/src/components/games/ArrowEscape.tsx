"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  BrainCircuit,
  ChevronRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import {
  useArrowEscapeStore,
  type ArrowTile,
  type Direction,
  isArrowPathClear,
} from "@/store/useArrowEscapeStore";
import { GameHeader } from "@/components/layout/GameHeader";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import {
  playPress,
  playCorrect,
  playPineBreeze,
  playComplete,
  playLeafPluck,
  playCalmTone,
  playLifeSong,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";

// ---------------------------------------------------------------------------
// Multilingual UI & Voice Localization for North Eastern & Indian Regional Dialects
// ---------------------------------------------------------------------------
const I18N = {
  en: {
    title: "Pathways: Bamboo Arrow Labyrinth",
    subtitle: "Tap each arrow to slide it off the board into freedom",
    level: "Level",
    escaped: "Freed",
    remaining: "Remaining",
    streak: "Calm Streak",
    bestStreak: "Best Streak",
    score: "Score",
    hintButton: "Show Pathway",
    hintActive: "Follow the glowing arrow!",
    resetButton: "Reset Board",
    listenButton: "Voice Guide",
    muteVoice: "Mute Voice",
    unmuteVoice: "Unmute Voice",
    welcomeSpeech: "Welcome to Pathways. Tap any arrow that has a clear path out of the woven bamboo tray.",
    freedSpeech: "Wonderful! The arrow slid freely into the open air.",
    blockedSpeech: "This path is currently resting. Look for an arrow with a clear road ahead.",
    levelClearedTitle: "Bamboo Pathway Cleared!",
    levelClearedSubtitle: "All arrows have gracefully found their way out.",
    nextLevelButton: "Next Bamboo Tray",
    playAgainButton: "Play Level Again",
    backToHub: "Back to Therapy Suite",
    aiAnalyzing: "AI Clinical Model Evaluating Cognitive Flow...",
    aiProfileTitle: "Adaptive Cognitive Metrics",
    spatialScore: "Spatial Vector Recognition",
    planningScore: "Pre-planning Accuracy",
    impulsivity: "Collision Rate",
    directionLabels: {
      up: "North",
      down: "South",
      left: "West",
      right: "East",
    },
  },
  as: {
    title: "দিশাঁৰি: বাঁহৰ কাঁড়ৰ পথ",
    subtitle: "প্ৰতিডাল কাঁড় টিপি বাঁহৰ চালনীৰ পৰা মুক্ত কৰক",
    level: "স্তৰ",
    escaped: "মুক্ত",
    remaining: "বাকী আছে",
    streak: "ধাৰাবাহিক",
    bestStreak: "শ্ৰেষ্ঠ ধাৰাবাহিক",
    score: "স্কোৰ",
    hintButton: "মুক্ত পথ দেখুৱাওক",
    hintActive: "উজলি থকা কাঁড়ডাল টিপক!",
    resetButton: "পুনৰ সজাওক",
    listenButton: "কথা শুনক",
    muteVoice: "মাত বন্ধ কৰক",
    unmuteVoice: "মাত খোলক",
    welcomeSpeech: "দিশাঁৰিলৈ স্বাগতম। যিডাল কাঁড়ৰ আগফালে কোনো বাধা নাই, সেইডাল টিপি মুক্ত কৰক।",
    freedSpeech: "সুন্দৰ! কাঁড়ডাল মুক্ত হৈ ওলাই গ'ল।",
    blockedSpeech: "এই পথত বাধা আছে। অন্য এডাল মুক্ত কাঁড় বাছক।",
    levelClearedTitle: "সকলো কাঁড় মুক্ত হ'ল!",
    levelClearedSubtitle: "আপুনি সফলতাৰে সকলো পথ পৰিষ্কাৰ কৰিলে।",
    nextLevelButton: "পৰৱৰ্তী স্তৰ",
    playAgainButton: "পুনৰ খেলক",
    backToHub: "থেৰাপী কক্ষলৈ উভতি যাওক",
    aiAnalyzing: "AI স্মৃতি আৰু স্থানিক ক্ষমতা বিশ্লেষণ হৈ আছে...",
    aiProfileTitle: "অনুকূলিত জ্ঞানমূলক প্ৰতিবেদন",
    spatialScore: "স্থানিক দিশ নিৰ্ণয়",
    planningScore: "পূৰ্ব-পৰিকল্পনা নিখুঁততা",
    impulsivity: "বাধাৰ মাত্ৰা",
    directionLabels: {
      up: "ওপৰলৈ",
      down: "তললৈ",
      left: "বাওঁফালে",
      right: "সোঁফালে",
    },
  },
  hi: {
    title: "दिशारी: बाँस के तीरों का रास्ता",
    subtitle: "प्रत्येक तीर को छूकर बाँस की थाली से बाहर निकालें",
    level: "स्तर",
    escaped: "मुक्त",
    remaining: "शेष",
    streak: "सटीक क्रम",
    bestStreak: "सर्वश्रेष्ठ क्रम",
    score: "अंक",
    hintButton: "रास्ता दिखाएँ",
    hintActive: "चमकते हुए तीर पर स्पर्श करें!",
    resetButton: "फिर से सजाएँ",
    listenButton: "आवाज़ सुनें",
    muteVoice: "आवाज़ बंद",
    unmuteVoice: "आवाज़ चालू",
    welcomeSpeech: "दिशारी में आपका स्वागत है। उस तीर पर टैप करें जिसका रास्ता पूरी तरह खुला है।",
    freedSpeech: "शाबाश! तीर आसानी से बाहर निकल गया।",
    blockedSpeech: "यह रास्ता अभी बंद है। किसी खुले रास्ते वाले तीर को चुनें।",
    levelClearedTitle: "सभी तीर सफलतापूर्वक मुक्त हुए!",
    levelClearedSubtitle: "आपने धैर्य और एकाग्रता से सारे रास्ते खोल दिए।",
    nextLevelButton: "अगला स्तर",
    playAgainButton: "फिर से खेलें",
    backToHub: "थेरेपी केंद्र पर लौटें",
    aiAnalyzing: "AI स्थानिक व संज्ञानात्मक विश्लेषण कर रहा है...",
    aiProfileTitle: "अनुकूलित संज्ञानात्मक रिपोर्ट",
    spatialScore: "स्थानिक दिशा पहचान",
    planningScore: "योजना सटीकता",
    impulsivity: "टकराव दर",
    directionLabels: {
      up: "उत्तर (ऊपर)",
      down: "दक्षिण (नीचे)",
      left: "पश्चिम (बाएँ)",
      right: "पूर्व (दाएँ)",
    },
  },
  bn: {
    title: "দিশারি: বাঁশের তীরের পথ",
    subtitle: "প্রতিটি তীর স্পর্শ করে বাঁশের থালা থেকে মুক্ত করুন",
    level: "স্তর",
    escaped: "মুক্ত",
    remaining: "বাকি",
    streak: "ধারাবাহিক",
    bestStreak: "সেরা ধারাবাহিক",
    score: "স্কোর",
    hintButton: "খোলা পথ দেখান",
    hintActive: "উজ্জ্বল তীরে স্পর্শ করুন!",
    resetButton: "পুনরায় সাজান",
    listenButton: "নির্দেশনা শুনুন",
    muteVoice: "শব্দ বন্ধ",
    unmuteVoice: "শব্দ চালু",
    welcomeSpeech: "দিশারিতে স্বাগতম। যে তীরের সামনে কোনো বাধা নেই, সেটি স্পর্শ করে মুক্ত করুন।",
    freedSpeech: "চমৎকার! তীরটি উন্মুক্ত বাতাসে মুক্ত হয়ে গেল।",
    blockedSpeech: "এই পথটি এখন বন্ধ। খোলা পথের কোনো তীর বেছে নিন।",
    levelClearedTitle: "সব তীর সফলভাবে মুক্ত হয়েছে!",
    levelClearedSubtitle: "আপনি ধৈর্য ও একাগ্রতার সাথে সমস্ত পথ খুলে দিয়েছেন।",
    nextLevelButton: "পরবর্তী স্তর",
    playAgainButton: "আবার খেলুন",
    backToHub: "থেরাপি কক্ষে ফিরে যান",
    aiAnalyzing: "AI স্মৃতি ও স্থানিক ক্ষমতা বিশ্লেষণ করছে...",
    aiProfileTitle: "অনুকূলিত জ্ঞানীয় প্রতিবেদন",
    spatialScore: "স্থানিক দিক নির্ণয়",
    planningScore: "পরিকল্পনার নির্ভুলতা",
    impulsivity: "বাধার হার",
    directionLabels: {
      up: "উত্তর (উপরে)",
      down: "দক্ষিণ (নিচে)",
      left: "পশ্চিম (বামে)",
      right: "পূর্ব (ডানে)",
    },
  },
  mni: {
    title: "দিশারি: ৱাগী তেনগী লম্বী",
    subtitle: "তেন খুদিংমক নমদুনা ৱাগী ফমদগী নান্থোকহল্লু",
    level: "থাক",
    escaped: "নান্থোকখে",
    remaining: "লেমহৌরি",
    streak: "লেপ্তনা",
    bestStreak: "খ্বাইদগী ফবা",
    score: "স্কোর",
    hintButton: "লম্বী তাকপিয়ু",
    hintActive: "ঙাল্লিবা তেন অদু নম্মু!",
    resetButton: "অমুক হন্না শেম্বা",
    listenButton: "ৱাখল তাবিয়ু",
    muteVoice: "খোন্থোক থিংবা",
    unmuteVoice: "খোন্থোক হাংদোকপা",
    welcomeSpeech: "দিশারিদা তরাম্না ওকচরি। লম্বী থিংদবা তেন অদু নমদুনা থাদোকপিয়ু।",
    freedSpeech: "য়াম্না ফরে! তেন অদু নিংতম্বা ফংনা নান্থোকখে।",
    blockedSpeech: "লম্বী অসি থিংজিল্লি। লম্বী হাংলিবা তেন অমা খনবিয়ু।",
    levelClearedTitle: "তেন পুম্নমক নান্থোক্লে!",
    levelClearedSubtitle: "নহাক্না লম্বী পুম্নমক মপুং ফানা শেংদোক্লে।",
    nextLevelButton: "মথংগী থাক",
    playAgainButton: "অমুক হন্না শানবা",
    backToHub: "থেরাপী কা লোমহন্দা হনবা",
    aiAnalyzing: "AI না ৱাখলগী লম্বী নৈনরি...",
    aiProfileTitle: "ৱাখলগী ফীভম রিপোর্ত",
    spatialScore: "মাইকৈ খঙবা",
    planningScore: "থৌরাং য়াম্না চপ চাবা",
    impulsivity: "থেংনরকপগী চাং",
    directionLabels: {
      up: "অৱাংবা (নোংপোম্ব)",
      down: "মখা (মখোং)",
      left: "নোংচুপ (ওইরোম)",
      right: "নোংপোক (য়েৎলোম)",
    },
  },
  kha: {
    title: "Ki Lynti: Ki Khnam Siej",
    subtitle: "Shon ia ki khnam ban pynmih noh na ka prah siej sha ka laitluid",
    level: "Kyrdan",
    escaped: "Lait",
    remaining: "Sah",
    streak: "Ka jingbha",
    bestStreak: "Kaba bha tam",
    score: "Score",
    hintButton: "Pyni ia ka lynti",
    hintActive: "Shon ia u khnam ba tyngshain!",
    resetButton: "Pynbna biang",
    listenButton: "Sngap ia ka ktien",
    muteVoice: "Pynlip jingsawa",
    unmuteVoice: "Pynmeh jingsawa",
    welcomeSpeech: "Khublei bad sngewbha sha Ki Lynti. Shon ia u khnam ba don ka lynti kaba lait khlem kano kano ka jingeh.",
    freedSpeech: "Bha shibun! U khnam u la mih noh sha ka laitluid.",
    blockedSpeech: "Kane ka lynti ka don jingeh. Wad ia u khnam ba lait ka lynti.",
    levelClearedTitle: "Baroh ki khnam ki la lait!",
    levelClearedSubtitle: "Phi la pynlait ia baroh ki lynti da ka jingsuk bad jingeh.",
    nextLevelButton: "Kyrdan bud",
    playAgainButton: "Lehkai biang",
    backToHub: "Leh sha ka Therapy Suite",
    aiAnalyzing: "AI ka dang bishar ia ka jabieng...",
    aiProfileTitle: "Ka Kaiphod Jabieng",
    spatialScore: "Jingtip ia ki Dong",
    planningScore: "Jingthmu kaba beit",
    impulsivity: "Ka jingiatyngkhuh",
    directionLabels: {
      up: "Shatei (Shaneng)",
      down: "Shathie (Sharum)",
      left: "Sepngi (Kadiang)",
      right: "Mihngi (Kamon)",
    },
  },
  lus: {
    title: "Kawngte: Mau Thaliang",
    subtitle: "Thaliang tin hmetin thil danna awm lohna lamah chhuah rawh",
    level: "Level",
    escaped: "Chhuak",
    remaining: "La bang",
    streak: "Zawm zatah",
    bestStreak: "Tha ber",
    score: "Mark",
    hintButton: "Kawng en rawh",
    hintActive: "Thaliang eng hi hmet rawh!",
    resetButton: "Siam tha leh rawh",
    listenButton: "Thu ngaithla rawh",
    muteVoice: "Aw tihtawp",
    unmuteVoice: "Aw tichhuak",
    welcomeSpeech: "Kawngte ah kan lo lawm a che. Thaliang kawng awl zawn hmet la chhuah rawh le.",
    freedSpeech: "A va tha em! Thaliang chu a chhuak ta e.",
    blockedSpeech: "He kawng hi a la ping rih a ni. Kawng awl dang zawng rawh le.",
    levelClearedTitle: "Thaliang zawng zawng an chhuak ta!",
    levelClearedSubtitle: "Dam te leh fimkhur takin kawng zawng zawng i hawng ta e.",
    nextLevelButton: "Level dawt leh",
    playAgainButton: "Khel leh rawh",
    backToHub: "Therapy pindanah let leh rawh",
    aiAnalyzing: "AI in thluak hman dan a zirchiang mek...",
    aiProfileTitle: "Hriatna Zirchianna",
    spatialScore: "Hmun leh Awmna Hriatna",
    planningScore: "Ruahmanna Dik",
    impulsivity: "Insuh Tam Lam",
    directionLabels: {
      up: "Hmar (Chung)",
      down: "Chhim (Hnuai)",
      left: "Thlang (Vei)",
      right: "Chhak (Ding)",
    },
  },
  brx: {
    title: "लामाफोर: औवा थिरनि लामा",
    subtitle: "मोनफ्रोम थिरखौ थुनानै औवानि दालानि फ्राय उदां खालाम",
    level: "थाखो",
    escaped: "उदां जाबाय",
    remaining: "थालांबाय",
    streak: "रोखा सारि",
    bestStreak: "साबसिन",
    score: "नम्बर",
    hintButton: "लामा दिनथि",
    hintActive: "जोंनाय थिरखौ थु!",
    resetButton: "फिन साजाय",
    listenButton: "खोनासं",
    muteVoice: "राव बन्द",
    unmuteVoice: "राव जागाय",
    welcomeSpeech: "लामाफोराव बरायबाय। जेरावबो हेंथा गयै थिरखौ थुनानै उदां खालाम।",
    freedSpeech: "जोबोद मोजां! थिरा उदां जाबाय।",
    blockedSpeech: "बे लामाया बन्द दं। उदां लामा थानाय थिरखौ सायख।",
    levelClearedTitle: "गासै थिरफोरा उदां जाबाय!",
    levelClearedSubtitle: "नोंथाङा गासै लामाफोरखौ साबसिनै उदां खालामबाय।",
    nextLevelButton: "उनाव थाखो",
    playAgainButton: "फिन गेले",
    backToHub: "थेरापी रुमाव थांफिन",
    aiAnalyzing: "AI मेमोरि नायबिजिरगासिनो दं...",
    aiProfileTitle: "मेमोरि नायबिजिरनाय",
    spatialScore: "दिग मिथियारि",
    planningScore: "थियारि जाथाय",
    impulsivity: "हेंथा खमनाय",
    directionLabels: {
      up: "सा (साहा)",
      down: "खोला (खोलाहा)",
      left: "सोनाब (आगसि)",
      right: "सानजा (आगदा)",
    },
  },
  grt: {
    title: "Ramani: Wa·ani Bram",
    subtitle: "Bramko jot·e wa·ani daladoni gital a·ongona watata",
    level: "Gadang",
    escaped: "Watata",
    remaining: "Donga",
    streak: "Riting",
    bestStreak: "Nambatsranggipa",
    score: "Score",
    hintButton: "Ramako mesokbo",
    hintActive: "Ching·gipa bramko jotbo!",
    resetButton: "Tari·taibo",
    listenButton: "Knikatbo",
    muteVoice: "Gam·ako chipbo",
    unmuteVoice: "Gam·ako kulibo",
    welcomeSpeech: "Ramano rimchaksoa. Champengani grigipa bramko jot·e watatbo.",
    freedSpeech: "Namkhalata! Bram gital a·ongona katangaha.",
    blockedSpeech: "Ia rama champenga. Rama bangbangko am·bo.",
    levelClearedTitle: "Pilak bramrang watatgimin ong·aha!",
    levelClearedSubtitle: "Na·simang pilak ramako namtongaha.",
    nextLevelButton: "Gipin gadang",
    playAgainButton: "Kaltaibo",
    backToHub: "Therapy Suite-ona re·bapilbo",
    aiAnalyzing: "AI gisik am·rikrikenba donga...",
    aiProfileTitle: "Gisikni Ripot",
    spatialScore: "Bikrokna u·iani",
    planningScore: "Kakket ong·ani",
    impulsivity: "Champengani biding",
    directionLabels: {
      up: "Salgro (Kosan)",
      down: "Salgro (Ka·man)",
      left: "Saliram (Gasi)",
      right: "Salgimin (Jaksik)",
    },
  },
  ne: {
    title: "दिशारी: बाँसको तीरको बाटो",
    subtitle: "प्रत्येक तीरलाई छोएर बाँसको नाङ्लोबाट बाहिर निकाल्नुहोस्",
    level: "तह",
    escaped: "मुक्त",
    remaining: "बाँकी",
    streak: "क्रम",
    bestStreak: "उत्कृष्ट क्रम",
    score: "अंक",
    hintButton: "खुला बाटो देखाउनुहोस्",
    hintActive: "चम्किलो तीरमा छुनुहोस्!",
    resetButton: "फेरि मिलाउनुहोस्",
    listenButton: "आवाज सुन्नुहोस्",
    muteVoice: "आवाज बन्द",
    unmuteVoice: "आवाज सुरु",
    welcomeSpeech: "दिशारीमा स्वागत छ। जुन तीरको अगाडि कुनै अवरोध छैन, त्यसमा ट्याप गरी बाहिर निकाल्नुहोस्।",
    freedSpeech: "अति उत्तम! तीर सजिलै बाहिर निस्कियो।",
    blockedSpeech: "यो बाटो अहिले बन्द छ। खुला बाटो भएको अर्को तीर छान्नुहोस्।",
    levelClearedTitle: "सबै तीरहरू सफलतापूर्वक मुक्त भए!",
    levelClearedSubtitle: "तपाईंले धैर्य र एकाग्रताका साथ सबै बाटोहरू खोल्नुभयो।",
    nextLevelButton: "अर्को तह",
    playAgainButton: "फेरि खेल्नुहोस्",
    backToHub: "थेरापी कोठामा फर्कनुहोस्",
    aiAnalyzing: "AI ले संज्ञानात्मक क्षमता विश्लेषण गर्दैछ...",
    aiProfileTitle: "अनुकूलित संज्ञानात्मक विवरण",
    spatialScore: "स्थानिक दिशा पहिचान",
    planningScore: "योजना सटीकता",
    impulsivity: "अवरोध दर",
    directionLabels: {
      up: "उत्तर (माथि)",
      down: "दक्षिण (तल)",
      left: "पश्चिम (बायाँ)",
      right: "पूर्व (दायाँ)",
    },
  },
  mr: {
    title: "दिशारी: बांबूच्या बाणांचा मार्ग",
    subtitle: "प्रत्येक बाणावर स्पर्श करून त्याला बांबूच्या पाटीतून बाहेर काढा",
    level: "पातळी",
    escaped: "मुक्त",
    remaining: "उर्वरित",
    streak: "अचूक क्रम",
    bestStreak: "सर्वोत्कृष्ट क्रम",
    score: "गुण",
    hintButton: "मार्ग दाखवा",
    hintActive: "चमकणाऱ्या बाणावर स्पर्श करा!",
    resetButton: "पुन्हा लावा",
    listenButton: "सूचना ऐका",
    muteVoice: "आवाज बंद",
    unmuteVoice: "आवाज चालू",
    welcomeSpeech: "दिशारीमध्ये आपले स्वागत आहे. ज्या बाणाच्या मार्गात कोणतीही अडचण नाही, त्यावर स्पर्श करून त्याला मुक्त करा.",
    freedSpeech: "छान! बाण सहजरीत्या बाहेर पडला.",
    blockedSpeech: "हा मार्ग सध्या बंद आहे. मोकळा मार्ग असलेला बाण निवडा.",
    levelClearedTitle: "सर्व बाण यशस्वीरीत्या मुक्त झाले!",
    levelClearedSubtitle: "आपण संयम आणि एकाग्रतेने सर्व मार्ग मोकळे केले.",
    nextLevelButton: "पुढील पातळी",
    playAgainButton: "पुन्हा खेळा",
    backToHub: "थेरपी कक्षाकडे परत जा",
    aiAnalyzing: "AI स्थानिक व स्मृती क्षमतांचे विश्लेषण करत आहे...",
    aiProfileTitle: "संज्ञानात्मक विश्लेषण अहवाल",
    spatialScore: "स्थानिक दिशा ओळख",
    planningScore: "नियोजन अचूकता",
    impulsivity: "अडथळा दर",
    directionLabels: {
      up: "उत्तर (वर)",
      down: "दक्षिण (खाली)",
      left: "पश्चिम (डावीकडे)",
      right: "पूर्व (उजवीकडे)",
    },
  },
};

export function ArrowEscape() {
  const locale = useLocale();
  const strings = I18N[locale as keyof typeof I18N] || I18N.en;

  const {
    level,
    gridSize,
    arrows,
    totalArrowsInLevel,
    escapedCount,
    status,
    score,
    streak,
    bestStreak,
    hintActive,
    hintedArrowId,
    aiRecommendation,
    isAiEvaluating,
    initLevel,
    tapArrow,
    clearExitedArrow,
    clearJiggle,
    toggleHint,
    resetLevel,
    nextLevel,
    evaluatePerformance,
  } = useArrowEscapeStore();

  const [voiceMuted, setVoiceMuted] = useState(false);
  const [activeBlockerId, setActiveBlockerId] = useState<string | null>(null);
  const blockerTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);

  // Initialize level on mount once
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      if (status === "idle" || arrows.length === 0) {
        initLevel(level);
      }
      if (!voiceMuted) {
        speak(strings.welcomeSpeech, locale, 0.9);
      }
    }
    return () => {
      stopSpeaking();
      if (blockerTimeoutRef.current) clearTimeout(blockerTimeoutRef.current);
    };
  }, [initLevel, level, locale, status, arrows.length, voiceMuted, strings.welcomeSpeech]);

  // Handle Level Victory Transition
  useEffect(() => {
    if (status === "level_cleared") {
      playComplete();
      void evaluatePerformance();
      if (!voiceMuted) {
        speak(
          `${strings.levelClearedTitle} ${strings.levelClearedSubtitle}`,
          locale,
          0.9
        );
      }
    }
  }, [status, evaluatePerformance, voiceMuted, locale, strings.levelClearedTitle, strings.levelClearedSubtitle]);

  // Handle arrow tap with sensory audio feedback and slide triggers
  const handleTileClick = useCallback(
    (arrow: ArrowTile) => {
      if (status !== "playing" || arrow.isExiting) return;

      playPress();
      const result = tapArrow(arrow.id);

      if (result.success) {
        playLeafPluck();
        playCorrect();
        if (!voiceMuted && Math.random() > 0.6) {
          speak(strings.freedSpeech, locale, 0.95);
        }

        // Remove from DOM after smooth slide completes
        setTimeout(() => {
          clearExitedArrow(arrow.id);
        }, 500);
      } else {
        // Blocked collision
        playPineBreeze();
        if (result.blocker) {
          setActiveBlockerId(result.blocker.id);
          if (blockerTimeoutRef.current) clearTimeout(blockerTimeoutRef.current);
          blockerTimeoutRef.current = setTimeout(() => {
            setActiveBlockerId(null);
          }, 900);
        }

        if (!voiceMuted) {
          speak(strings.blockedSpeech, locale, 0.9);
        }

        // Clear jiggle animation
        setTimeout(() => {
          clearJiggle(arrow.id);
        }, 400);
      }
    },
    [
      status,
      tapArrow,
      clearExitedArrow,
      clearJiggle,
      voiceMuted,
      strings.freedSpeech,
      strings.blockedSpeech,
      locale,
    ]
  );

  // Trigger voice guide manually
  const triggerVoiceGuide = useCallback(() => {
    playCalmTone();
    const remaining = totalArrowsInLevel - escapedCount;
    const msg = `${strings.welcomeSpeech} ${remaining} ${strings.remaining.toLowerCase()}.`;
    speak(msg, locale, 0.9);
  }, [strings, totalArrowsInLevel, escapedCount, locale]);

  // Map 2D grid cells for the layout
  const gridCells = useMemo(() => {
    const cells: { row: number; col: number; arrow: ArrowTile | null }[] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const found = arrows.find((a) => a.row === r && a.col === c);
        cells.push({ row: r, col: c, arrow: found || null });
      }
    }
    return cells;
  }, [gridSize, arrows]);

  // Render Arrow Icon based on direction
  const renderArrowGlyph = (dir: Direction) => {
    switch (dir) {
      case "up":
        return <ArrowUp className="h-8 w-8 sm:h-10 sm:w-10 stroke-[3.5] drop-shadow-sm" />;
      case "down":
        return <ArrowDown className="h-8 w-8 sm:h-10 sm:w-10 stroke-[3.5] drop-shadow-sm" />;
      case "left":
        return <ArrowLeft className="h-8 w-8 sm:h-10 sm:w-10 stroke-[3.5] drop-shadow-sm" />;
      case "right":
        return <ArrowRight className="h-8 w-8 sm:h-10 sm:w-10 stroke-[3.5] drop-shadow-sm" />;
    }
  };

  // Get translation transform for sliding out of the board
  const getExitTransform = (dir?: Direction) => {
    switch (dir) {
      case "up":
        return "translate-y-[-240px] opacity-0 scale-90";
      case "down":
        return "translate-y-[240px] opacity-0 scale-90";
      case "left":
        return "translate-x-[-240px] opacity-0 scale-90";
      case "right":
        return "translate-x-[240px] opacity-0 scale-90";
      default:
        return "";
    }
  };

  // Color styles corresponding to North Eastern cultural palettes
  const getTileColorClasses = (theme: ArrowTile["colorTheme"]) => {
    switch (theme) {
      case "muga":
        return "bg-gradient-to-t from-amber-500 via-amber-400 to-yellow-200 text-amber-950 border-amber-900";
      case "teal":
        return "bg-gradient-to-b from-teal-500 via-teal-400 to-emerald-200 text-teal-950 border-teal-900";
      case "scarlet":
        return "bg-gradient-to-l from-red-500 via-rose-400 to-amber-100 text-red-950 border-red-900";
      case "emerald":
        return "bg-gradient-to-r from-emerald-600 via-emerald-400 to-lime-200 text-emerald-950 border-emerald-900";
      default:
        return "bg-amber-400 text-black border-black";
    }
  };

  return (
    <section className="min-h-screen bg-[#FAF6F0] pb-14 select-none">
      {/* Platform Header */}
      <GameHeader
        title={strings.title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-[#5C3D2E]"
      />

      <div className="mx-auto max-w-3xl px-4 pt-4 sm:pt-6">
        {status === "level_cleared" ? (
          /* ========================================================================= */
          /* CELEBRATION & AI COGNITIVE PROFILE DASHBOARD                             */
          /* ========================================================================= */
          <Celebration
            title={strings.levelClearedTitle}
            subtitle={strings.levelClearedSubtitle}
            xpEarned={45 + streak * 10}
            accuracy={`${Math.round(
              (escapedCount / Math.max(1, escapedCount + (bestStreak > 0 ? 0 : 1))) * 100
            )}%`}
          >
            <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 text-left">
              {/* Regional Cultural Token */}
              <div className="relative w-full rounded-3xl border-4 border-black bg-[#FAF5EE] p-5 shadow-[6px_6px_0px_#000]">
                <div className="flex items-center justify-between border-b-2 border-black/15 pb-2.5 mb-3">
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {strings.level} {level} Complete
                  </span>
                  <span className="rounded bg-amber-200 px-2.5 py-0.5 text-xs font-black text-amber-950 border border-amber-900/40">
                    +{score} Points
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-ink">
                    <span>{strings.escaped}:</span>
                    <span className="font-black text-emerald-700">
                      {totalArrowsInLevel} / {totalArrowsInLevel} Arrows
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-bold text-ink">
                    <span>{strings.bestStreak}:</span>
                    <span className="font-black text-amber-800">{bestStreak} in a row</span>
                  </div>
                </div>

                {/* Adaptive AI Cognitive Telemetry Card */}
                {isAiEvaluating ? (
                  <div className="mt-4 flex items-center justify-center gap-2 rounded-2xl border-2 border-amber-900/30 bg-amber-50 p-4 text-xs font-bold text-amber-950">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-800" />
                    <span>{strings.aiAnalyzing}</span>
                  </div>
                ) : aiRecommendation ? (
                  <div className="mt-4 rounded-2xl border-2 border-amber-900/30 bg-amber-50 p-3.5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <BrainCircuit className="h-4 w-4 text-amber-900" />
                      <span className="text-[11px] font-black uppercase tracking-wider text-amber-950">
                        {strings.aiProfileTitle}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-black">
                      <div className="rounded-xl bg-white p-2 border border-amber-200">
                        <div className="text-amber-700 text-base">
                          {aiRecommendation.cognitiveProfile.spatialOrientationScore}%
                        </div>
                        <div className="text-[9px] text-ink-secondary leading-tight mt-0.5">
                          {strings.spatialScore}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white p-2 border border-amber-200">
                        <div className="text-emerald-700 text-base">
                          {aiRecommendation.cognitiveProfile.planningAccuracy}%
                        </div>
                        <div className="text-[9px] text-ink-secondary leading-tight mt-0.5">
                          {strings.planningScore}
                        </div>
                      </div>
                      <div className="rounded-xl bg-white p-2 border border-amber-200">
                        <div className="text-rose-700 text-base">
                          {aiRecommendation.cognitiveProfile.impulsivityIndex}/10
                        </div>
                        <div className="text-[9px] text-ink-secondary leading-tight mt-0.5">
                          {strings.impulsivity}
                        </div>
                      </div>
                    </div>

                    <p className="mt-2 text-[11px] font-medium text-amber-950/80 italic leading-relaxed border-t border-amber-200/60 pt-1.5">
                      &ldquo;{aiRecommendation.clinicalObservation}&rdquo;
                    </p>
                  </div>
                ) : null}

                {/* Folk Melody button */}
                <div className="mt-4 flex items-center justify-between border-t-2 border-black/10 pt-3">
                  <button
                    type="button"
                    onClick={() => playLifeSong()}
                    className="group flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-200 px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer hover:bg-amber-300"
                  >
                    <span>🎵 Play Bihu Flute Tune</span>
                  </button>
                  <span className="text-[11px] font-black text-ink-secondary">
                    Calm Intervention
                  </span>
                </div>
              </div>

              {/* Navigation Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                <ChunkyButton variant="tea" size="xl" onClick={nextLevel}>
                  <span className="flex items-center gap-1.5">
                    {strings.nextLevelButton} <ChevronRight className="h-5 w-5" />
                  </span>
                </ChunkyButton>
                <button
                  type="button"
                  onClick={resetLevel}
                  className="btn-tactile inline-flex items-center gap-1.5 rounded-2xl border-2 border-black bg-surface px-5 py-3 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{strings.playAgainButton}</span>
                </button>
                <Link
                  href="/patient/games"
                  className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-surface px-5 py-3 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted"
                >
                  {strings.backToHub}
                </Link>
              </div>
            </div>
          </Celebration>
        ) : (
          /* ========================================================================= */
          /* ACTIVE GAMEPLAY SCREEN                                                    */
          /* ========================================================================= */
          <div className="flex flex-col items-center gap-4">
            {/* Top HUD Card */}
            <div className="flex w-full max-w-lg items-center justify-between rounded-2xl border-3 border-black bg-[#FAF3E0] px-4 py-2.5 shadow-[3px_3px_0px_#000]">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black bg-amber-400 text-xs font-black text-black">
                  {level}
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase text-ink-secondary">
                    {strings.level}
                  </span>
                  <div className="text-xs font-black text-ink">
                    {gridSize}x{gridSize} Bamboo Grid
                  </div>
                </div>
              </div>

              {/* Escape Progress Counter */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-ink-secondary">
                    {strings.escaped}
                  </span>
                  <div className="text-sm font-black text-emerald-700">
                    {escapedCount} / {totalArrowsInLevel}
                  </div>
                </div>

                <div className="h-7 w-[2px] bg-black/15" />

                <div className="text-right">
                  <span className="text-[10px] font-black uppercase text-ink-secondary">
                    {strings.streak}
                  </span>
                  <div className="text-sm font-black text-amber-700">
                    🔥 {streak}
                  </div>
                </div>
              </div>
            </div>

            {/* Helper Action Ribbons */}
            <div className="flex w-full max-w-lg items-center justify-between gap-2">
              <button
                type="button"
                onClick={toggleHint}
                className={`btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all ${
                  hintActive
                    ? "bg-amber-400 text-amber-950 animate-pulse ring-2 ring-amber-500"
                    : "bg-amber-100 text-ink hover:bg-amber-200"
                }`}
              >
                <Lightbulb className="h-4 w-4 text-amber-800" />
                <span>{hintActive ? strings.hintActive : strings.hintButton}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVoiceMuted((v) => !v)}
                  className="btn-tactile flex items-center gap-1 rounded-xl border-2 border-black bg-surface px-2.5 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
                  title={voiceMuted ? strings.unmuteVoice : strings.muteVoice}
                >
                  {voiceMuted ? <VolumeX className="h-4 w-4 text-rose-600" /> : <Volume2 className="h-4 w-4 text-emerald-600" />}
                </button>

                <button
                  type="button"
                  onClick={triggerVoiceGuide}
                  className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
                  title="Read Aloud"
                >
                  <Sparkles className="h-4 w-4 text-amber-600" />
                  <span>{strings.listenButton}</span>
                </button>

                <button
                  type="button"
                  onClick={resetLevel}
                  className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
                  title="Reset Level"
                >
                  <RotateCcw className="h-4 w-4 text-ink-secondary" />
                  <span className="hidden sm:inline">{strings.resetButton}</span>
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* TRADITIONAL NORTH EASTERN WOVEN BAMBOO CANE BOARD                        */}
            {/* ========================================================================= */}
            <div className="relative mt-2 w-full max-w-lg rounded-3xl border-4 border-[#5C3D2E] bg-[#D4A373] p-4 sm:p-6 shadow-[8px_8px_0px_#2B1A12] overflow-hidden">
              {/* Bamboo Weave Lattice Texture Background */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(#43281C 1.5px, transparent 1.5px), radial-gradient(#43281C 1.5px, #FAF5EE 1.5px)`,
                  backgroundSize: "24px 24px",
                  backgroundPosition: "0 0, 12px 12px",
                }}
              />

              {/* Decorative Corner Brass Studs */}
              <div className="absolute top-2 left-2 h-3.5 w-3.5 rounded-full border-2 border-[#2B1A12] bg-yellow-400 shadow-sm" />
              <div className="absolute top-2 right-2 h-3.5 w-3.5 rounded-full border-2 border-[#2B1A12] bg-yellow-400 shadow-sm" />
              <div className="absolute bottom-2 left-2 h-3.5 w-3.5 rounded-full border-2 border-[#2B1A12] bg-yellow-400 shadow-sm" />
              <div className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full border-2 border-[#2B1A12] bg-yellow-400 shadow-sm" />

              {/* Internal Woven Tray Mat */}
              <div className="relative rounded-2xl border-3 border-[#8C5338] bg-[#F7EBE1] p-3 sm:p-4 shadow-inner">
                {/* 2D Grid Layout */}
                <div
                  className="grid gap-2 sm:gap-3.5"
                  style={{
                    gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${gridSize}, minmax(0, 1fr))`,
                  }}
                >
                  {gridCells.map(({ row, col, arrow }) => {
                    const cellKey = `cell-${row}-${col}`;

                    if (!arrow) {
                      // Empty Slot on the Woven Mat
                      return (
                        <div
                          key={cellKey}
                          className="flex aspect-square items-center justify-center rounded-2xl border-2 border-dashed border-[#B08968]/40 bg-[#E6CCB2]/20 shadow-inner"
                        >
                          <span className="h-2 w-2 rounded-full bg-[#B08968]/30" />
                        </div>
                      );
                    }

                    const isClear = isArrowPathClear(arrow, arrows, gridSize);
                    const isHinted = arrow.id === hintedArrowId;
                    const isBlockerActive = arrow.id === activeBlockerId;
                    const exitClass = arrow.isExiting ? getExitTransform(arrow.exitDir) : "";
                    const jiggleClass = arrow.isJiggling ? "animate-bounce ring-4 ring-rose-500" : "";
                    const colorClasses = getTileColorClasses(arrow.colorTheme);

                    return (
                      <button
                        key={arrow.id}
                        type="button"
                        onClick={() => handleTileClick(arrow)}
                        disabled={arrow.isExiting}
                        aria-label={`${strings.directionLabels[arrow.direction]} Arrow`}
                        className={`group relative flex aspect-square flex-col items-center justify-center rounded-2xl border-3 sm:border-4 shadow-[4px_4px_0px_#2B1A12] transition-all duration-450 cursor-pointer active:translate-y-1 active:shadow-[1px_1px_0px_#2B1A12] ${colorClasses} ${exitClass} ${jiggleClass} ${
                          isHinted ? "ring-4 ring-yellow-400 ring-offset-2 animate-pulse scale-105" : ""
                        } ${
                          isBlockerActive ? "ring-4 ring-red-500 bg-red-300" : ""
                        }`}
                      >
                        {/* Direction Glyph */}
                        <div className="transition-transform group-hover:scale-110">
                          {renderArrowGlyph(arrow.direction)}
                        </div>

                        {/* High-Contrast Directional Subtitle */}
                        <span className="mt-0.5 text-[9px] sm:text-[10px] font-black uppercase tracking-wider opacity-90">
                          {strings.directionLabels[arrow.direction]}
                        </span>

                        {/* Unblocked Free Path Indicator Glow */}
                        {isClear && !arrow.isExiting && (
                          <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-black/40" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Instruction Card & Cultural Lore */}
            <div className="flex w-full max-w-lg items-center gap-3 rounded-2xl border-2 border-black/20 bg-surface p-3 text-left shadow-sm">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-amber-100 text-lg">
                🎋
              </div>
              <div className="flex-1 text-xs font-semibold text-ink">
                <span className="font-black text-amber-900 block uppercase text-[10px]">
                  Calm Dementia Practice:
                </span>
                <span>{strings.subtitle}. There is no timer—take all the time you need.</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ArrowEscape;
