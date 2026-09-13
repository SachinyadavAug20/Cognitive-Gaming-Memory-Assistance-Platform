"use client";

import { useCallback, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Bell,
  RotateCcw,
  Sparkles,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Music,
  Disc,
  Wind,
  Headphones,
  Play,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playLifeSong, playMonasteryBell, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { getGameStrings, type SupportedLocale } from "@/lib/gameI18n";

function GameShell({
  title,
  score,
  children,
}: {
  title: string;
  score: number;
  children: React.ReactNode;
}) {
  return (
    <section className="pb-12 min-h-screen bg-canvas">
      <GameHeader
        title={title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-purple-900"
        gameId="monastery-bell"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

interface BellInstrument {
  id: number;
  iconType: "gong" | "bowl" | "chime" | "bell";
  color: string;
  activeColor: string;
  frequency: number; // Hz
}

const SACRED_BELLS: BellInstrument[] = [
  {
    id: 0,
    iconType: "gong",
    color: "bg-amber-100 border-amber-600 text-amber-950",
    activeColor: "bg-amber-400 border-amber-800 text-black ring-4 ring-amber-300 scale-105",
    frequency: 220,
  },
  {
    id: 1,
    iconType: "bowl",
    color: "bg-emerald-100 border-emerald-600 text-emerald-950",
    activeColor: "bg-emerald-400 border-emerald-800 text-black ring-4 ring-emerald-300 scale-105",
    frequency: 330,
  },
  {
    id: 2,
    iconType: "chime",
    color: "bg-amber-100 border-amber-600 text-amber-950",
    activeColor: "bg-amber-400 border-amber-800 text-black ring-4 ring-amber-300 scale-105",
    frequency: 440,
  },
  {
    id: 3,
    iconType: "bell",
    color: "bg-rose-100 border-rose-600 text-rose-950",
    activeColor: "bg-rose-400 border-rose-800 text-black ring-4 ring-rose-300 scale-105",
    frequency: 550,
  },
];

interface BellI18nEntry {
  clinicalTitle: string;
  benefit1: string;
  benefit2: string;
  benefit3: string;
  listenCarefully: string;
  yourTurn: string;
  listenAgain: string;
  chimesCompleted: string;
  attentionPeak: string;
  memorySpanTitle: string;
  memorySpanDesc: string;
  hymnButton: string;
  audioYourTurn: string;
  audioListenAgain: string;
  audioWonderful: string;
  instruments: {
    gong: { name: string; subname: string };
    bowl: { name: string; subname: string };
    chime: { name: string; subname: string };
    bell: { name: string; subname: string };
  };
}

const BELL_I18N: Record<SupportedLocale, BellI18nEntry> = {
  as: {
    clinicalTitle: "চিকিৎসাগত লাভ:",
    benefit1: "শ্ৰৱণ কাৰ্য্যকৰী স্মৃতি আৰু ক্ৰমিক সুৰ ধৰি ৰখাৰ ক্ষমতা",
    benefit2: "শব্দৰ সুৰ পাৰ্থক্য চিনি পোৱা আৰু সংবেদনশীল সমন্বয়",
    benefit3: "পৱিত্ৰ গুঞ্জনৰ জৰিয়তে মনৰ গভীৰ প্ৰশান্তি আৰু মনোযোগ",
    listenCarefully: "মনোযোগেৰে শুনক...",
    yourTurn: "আপোনাৰ পাল!",
    listenAgain: "সুৰ পুনৰ শুনক",
    chimesCompleted: "৩টা পৱিত্ৰ সুৰ সম্পন্ন হ'ল",
    attentionPeak: "শীৰ্ষ মনোযোগ স্তৰ",
    memorySpanTitle: "শ্ৰৱণ স্মৃতি সীমা: ৫টা ক্ৰমিক ধ্বনি",
    memorySpanDesc: "সুৰৰ ধাৰাবাহিকতা সঠিকভাৱে স্মৰণ কৰি মগজুৰ কাৰ্যক্ষমতা আৰু স্মৃতি শক্তি উন্নত হৈছে।",
    hymnButton: "তাৱাং সত্ৰৰ প্ৰাৰ্থনা সুৰ শুনক",
    audioYourTurn: "এতিয়া আপোনাৰ পাল! সেই একে ক্ৰমত পৱিত্ৰ ঘণ্টাবোৰ বজাওক।",
    audioListenAgain: "আহক পুনৰবাৰ এই পৱিত্ৰ সুৰ শুনোঁ।",
    audioWonderful: "বৰ সুন্দৰ ছন্দ! পৰৱৰ্তী সুৰলৈ আগবাঢ়িছোঁ।",
    instruments: {
      gong: { name: "সোণালী কাঁহ", subname: "গভীৰ অনুৰণিত ধ্বনি" },
      bowl: { name: "কাঁহৰ বাটি", subname: "অনন্য মিঠা সুৰ" },
      chime: { name: "তাৱাঙৰ বতাহৰ ঘণ্টা", subname: "কোমল সুৰীয়া ধ্বনি" },
      bell: { name: "পৱিত্ৰ সত্ৰৰ ঘণ্টা", subname: "স্পষ্ট উচ্চ ধ্বনি" },
    },
  },
  hi: {
    clinicalTitle: "चिकित्सीय लाभ:",
    benefit1: "श्रवण कार्यशील स्मृति और क्रमबद्ध ध्वनि प्रतिधारण",
    benefit2: "ध्वनि स्वर पहचान और संवेदी समन्वय में सुधार",
    benefit3: "पवित्र घंटियों का शांत गूंज और मानसिक शांति",
    listenCarefully: "ध्यान से सुनें...",
    yourTurn: "आपकी बारी!",
    listenAgain: "धुन दोबारा सुनें",
    chimesCompleted: "3 पवित्र धुनें पूरी हुईं",
    attentionPeak: "शीर्ष एकाग्रता स्तर",
    memorySpanTitle: "श्रवण स्मृति विस्तार: 5 क्रमिक स्वर",
    memorySpanDesc: "क्रमबद्ध मधुर धुनों को याद रखने से मस्तिष्क की सक्रियता और स्मृति मजबूत हुई।",
    hymnButton: "तवांग मठ का पावन भजन सुनें",
    audioYourTurn: "आपकी बारी! पवित्र घंटियों को उसी क्रम में बजाएं।",
    audioListenAgain: "आइए एक बार फिर से इस पावन धुन को सुनते हैं।",
    audioWonderful: "बहुत सुंदर लय! आइए अगली पवित्र धुन सुनते हैं।",
    instruments: {
      gong: { name: "सुनहरा गोंग", subname: "गंभीर गूंजता नाद" },
      bowl: { name: "कांस्य गायन पात्र", subname: "मधुर शांत तरंग" },
      chime: { name: "तवांग पवन घंटी", subname: "झंकृत कोमल नाद" },
      bell: { name: "पवित्र मंदिर घंटी", subname: "स्पष्ट पावन स्वर" },
    },
  },
  en: {
    clinicalTitle: "Clinical Benefits:",
    benefit1: "Auditory working memory span & temporal sequence retention",
    benefit2: "Acoustic pitch discrimination & sensorimotor synchronization",
    benefit3: "Meditative harmonic resonance and mindfulness de-escalation",
    listenCarefully: "Listen Carefully...",
    yourTurn: "Your Turn to Play!",
    listenAgain: "Listen Again",
    chimesCompleted: "3 Sacred Chimes Completed",
    attentionPeak: "MoCA Attention Peak",
    memorySpanTitle: "Auditory Memory Span: 5 Sequential Tones",
    memorySpanDesc: "Acoustic tone sequence retention demonstrated active temporal lobe and working memory encoding.",
    hymnButton: "Play Tawang Monastery Hymn",
    audioYourTurn: "Your turn! Tap the sacred bells in the same melodic order.",
    audioListenAgain: "Listen once more to the sacred bell sequence.",
    audioWonderful: "Wonderful rhythm! Advancing to the next sacred chime.",
    instruments: {
      gong: { name: "Golden Gong", subname: "Deep Resonant Bass" },
      bowl: { name: "Bronze Singing Bowl", subname: "Harmonic Overtone" },
      chime: { name: "Tawang Wind Chime", subname: "High Shimmer" },
      bell: { name: "Sacred Temple Bell", subname: "Clear High Chime" },
    },
  },
  bn: {
    clinicalTitle: "চিকিৎসাগত উপকারিতা:",
    benefit1: "শ্রবণভিত্তিক কার্যকরী স্মৃতি ও ক্রমিক সুর স্মরণের ক্ষমতা",
    benefit2: "শব্দের সুরের পার্থক্য নির্ণয় ও সংবেদনশীল সমন্বয়",
    benefit3: "পবিত্র অনুরণনের মাধ্যমে গভীর মানসিক প্রশান্তি ও একাগ্রতা",
    listenCarefully: "মনোযোগ দিয়ে শুনুন...",
    yourTurn: "আপনার পালা!",
    listenAgain: "সুর আবার শুনুন",
    chimesCompleted: "৩টি পবিত্র সুর সম্পন্ন",
    attentionPeak: "শীর্ষ মনোযোগ স্তর",
    memorySpanTitle: "শ্রবণ স্মৃতি সীমা: ৫টি ধারাবাহিক ধ্বনি",
    memorySpanDesc: "সুরধারার সঠিক অনুসরণে মস্তিষ্কের কর্মক্ষমতা ও স্মৃতিশক্তি বৃদ্ধি পেয়েছে।",
    hymnButton: "তাওয়াং মঠের স্তোত্র শুনুন",
    audioYourTurn: "আপনার পালা! ঠিক একই ক্রমে পবিত্র ঘণ্টাগুলি বাজান।",
    audioListenAgain: "আসুন আরও একবার এই পবিত্র সুরটি শুনি।",
    audioWonderful: "চমৎকার তাল! পরবর্তী সুরে অগ্রসর হচ্ছি।",
    instruments: {
      gong: { name: "সোনালী গং", subname: "গভীর গম্ভীর নাদ" },
      bowl: { name: "ব্রোঞ্জের সুরেলা পাত্র", subname: "অনুপম সুমধুর সুর" },
      chime: { name: "তাওয়াং হাওয়া ঘণ্টা", subname: "কোমল মধুর ধ্বনি" },
      bell: { name: "পবিত্র মন্দিরের ঘণ্টা", subname: "নির্মল উচ্চ সুর" },
    },
  },
  mr: {
    clinicalTitle: "उपचारात्मक फायदे:",
    benefit1: "ध्वनी स्मृती आणि क्रमवार नाद लक्षात ठेवण्याची क्षमता",
    benefit2: "नाद भेद ओळख आणि संवेदी समन्वय",
    benefit3: "पवित्र घंटानादाने मिळणारी मानसिक शांतता आणि एकाग्रता",
    listenCarefully: "लक्षपूर्वक ऐका...",
    yourTurn: "तुमची पाळी!",
    listenAgain: "नाद पुन्हा ऐका",
    chimesCompleted: "३ पवित्र घंटानाद पूर्ण",
    attentionPeak: "उत्कृष्ट एकाग्रता स्तर",
    memorySpanTitle: "ध्वनी स्मृती: ५ सलग स्वर",
    memorySpanDesc: "क्रमवार स्वर लक्षात ठेवल्याने मेंदूची सजगता आणि स्मृती अधिक दृढ झाली.",
    hymnButton: "तवांग मठाचे स्तोत्र ऐका",
    audioYourTurn: "तुमची पाळी! त्याच क्रमाने पवित्र घंटा वाजवा.",
    audioListenAgain: "हा पवित्र नाद पुन्हा एकदा ऐकूया.",
    audioWonderful: "छान लय! पुढच्या पवित्र नादाकडे जाऊया.",
    instruments: {
      gong: { name: "सुवर्ण गॉंग", subname: "गंभीर घुमणारा नाद" },
      bowl: { name: "कांस्य गायन पात्र", subname: "मधुर शांत तरंग" },
      chime: { name: "तवांग पवन घंटा", subname: "मृदू मंद नाद" },
      bell: { name: "पवित्र मंदिर घंटा", subname: "स्पष्ट उच्च स्वर" },
    },
  },
  ne: {
    clinicalTitle: "उपचारात्मक फाइदाहरू:",
    benefit1: "श्रवण कार्यशील स्मृति र क्रमबद्ध धुन सम्झने क्षमता",
    benefit2: "ध्वनिको स्वर पहिचान र संवेदी समन्वय",
    benefit3: "पवित्र घण्टीको अनुनादले मनलाई दिने शान्ति र एकाग्रता",
    listenCarefully: "ध्यान दिएर सुन्नुहोस्...",
    yourTurn: "तपाईंको पालो!",
    listenAgain: "धुन फेरि सुन्नुहोस्",
    chimesCompleted: "३ पवित्र धुनहरू सम्पन्न",
    attentionPeak: "उच्च एकाग्रता स्तर",
    memorySpanTitle: "श्रवण स्मृति विस्तार: ५ क्रमिक स्वरहरू",
    memorySpanDesc: "क्रमिक धुनहरू सम्झेर मस्तिष्कको स्मरणशक्ति र एकाग्रता सुदृढ भयो।",
    hymnButton: "तावाङ गुम्बाको भजन सुन्नुहोस्",
    audioYourTurn: "तपाईंको पालो! पवित्र घण्टीहरूलाई उही क्रममा बजाउनुहोस्।",
    audioListenAgain: "आउनुहोस् एकपटक फेरि यो पवित्र धुन सुनौँ।",
    audioWonderful: "धेरै राम्रो लय! अब अर्को पवित्र धुनमा जाऔँ।",
    instruments: {
      gong: { name: "सुनौलो गोंग", subname: "गम्भीर गुञ्जिने स्वर" },
      bowl: { name: "कांस्य गायन कचौरा", subname: "मधुर शान्त तरंग" },
      chime: { name: "तावाङ हावा घण्टी", subname: "कोमल चम्किलो नाद" },
      bell: { name: "पवित्र मन्दिर घण्टी", subname: "स्पष्ट उच्च धुन" },
    },
  },
  mni: {
    clinicalTitle: "লাইয়েংগী কান্নবশিং:",
    benefit1: "তাবগী নীংশিংবা অমসুং পরিং নাইনা স্বর নীংশিংবা",
    benefit2: "খোন্থোক খেন্নবা খঙবা অমসুং হকচাংগী চৎনবী শান্নবা",
    benefit3: "থাউমৈ অমসুং ঘণ্টাগী খোন্থোক্না থম্মোয়বু শান্তি পীবা",
    listenCarefully: "তপ্না তাবীয়ু...",
    yourTurn: "অদোমগী তাঞ্জা!",
    listenAgain: "সুর অমুক হন্না তাবীয়ু",
    chimesCompleted: "পৱিত্র ঘণ্টা ৩ লোইরে",
    attentionPeak: "খ্বাইদগী ফবা পুক্নিং চঙবা",
    memorySpanTitle: "তাবগী নীংশিংবা: পরিং নাইবা খোন্থোক ৫",
    memorySpanDesc: "সুরগী পরিং নীংশিংদুনা ৱাখলবু হেন্না লুপ্পা অমসুং নীংশিংবা কনখৎহল্লে।",
    hymnButton: "তাৱাং মনাস্ট্রিগী ঈশ্বর সেবা ঈশৈ তাবীয়ু",
    audioYourTurn: "অদোমগী তাঞ্জা! মদুগী পরিং অদুমক পৱিত্র ঘণ্টাদা নম্বীয়ু।",
    audioListenAgain: "লাকউ পৱিত্র সুর অসি অমুক হন্না তাশি।",
    audioWonderful: "য়াম্না ফবা সুর! মথংগী পৱিত্র ঘণ্টাদা চঙশিল্লসি।",
    instruments: {
      gong: { name: "সনাগী গং", subname: "লুপ্পা অমসুং লিরবা খোন্থোক" },
      bowl: { name: "কঁহাগী বোল", subname: "ইংনা চৎপা নুংশি খোন্থোক" },
      chime: { name: "তাৱাং নূংশিৎ ঘণ্টা", subname: "মলংবগী লৈতেং সুর" },
      bell: { name: "পৱিত্র লাইশঙ ঘণ্টা", subname: "শেংলবা ৱাংবা সুর" },
    },
  },
  brx: {
    clinicalTitle: "फाहामथाइनि मुलाम्फाफोर:",
    benefit1: "खोनासं गोसोखां आरो फारियारि रोजाबनाय गोसोआव लाखिनाय",
    benefit2: "रिंखांथि सोदोब सिनैनाय आरो मोखां खौसेथि",
    benefit3: "मन्दिरनि घन्टा रिंखांनायजों गोसोखौ गोजोन खालामनाय",
    listenCarefully: "सावधाने खोनासं...",
    yourTurn: "नोंथांनि पालि!",
    listenAgain: "रोजाबनायखौ फिन खोनासं",
    chimesCompleted: "3 थार घन्टा रिंखांनाय जोबबाय",
    attentionPeak: "जोबोर मोजां गोसो होनाय",
    memorySpanTitle: "खोनासं गोसोखां: 5 फारियारि रिंखांथि",
    memorySpanDesc: "फारियारि रोजाबनायखौ गोसोखांना मेहेराव गोसो होनाय बांबाय।",
    hymnButton: "तावाङ गुम्बानि इसोर रोजाबनाय दाम",
    audioYourTurn: "नोंथांनि पालि! बै रोखोमैनो घन्टाफोरखौ दाम।",
    audioListenAgain: "फै फै बे मोजां रोजाबनायखौ फिन खोनासंनो।",
    audioWonderful: "जोबोर मोजां! दा उननि घन्टायाव थांनि।",
    instruments: {
      gong: { name: "सनानि गं", subname: "गोथौ रिंखांनाय सोदोब" },
      bowl: { name: "कांसा बाथि", subname: "गोजोन रोजाबनाय" },
      chime: { name: "तावाङ बारनि घन्टा", subname: "रेबगोन मोजां सोदोब" },
      bell: { name: "पवित्र मन्दिर घन्टा", subname: "गोजौ गेबें सोदोब" },
    },
  },
  grt: {
    clinicalTitle: "Sanani Namgimin:",
    benefit1: "Knaani gisik ra'ani aro suriko sulsul donani",
    benefit2: "Gam'ako ma'siani aro jak-a'ako nangrimgimin",
    benefit3: "Kintani gam'aoniko tom'tomani man'ani",
    listenCarefully: "Namae Knabo...",
    yourTurn: "Nang'ni Pring!",
    listenAgain: "Gam'ako Pil'kna",
    chimesCompleted: "Ge 3 Kinta Matchotaha",
    attentionPeak: "Gisik Rongtalani Chu'sokaha",
    memorySpanTitle: "Knaani Gisik Ra'ani: Sulsul Ge 5 Gam'ani",
    memorySpanDesc: "Suriko sulsul gisik ra'e taningko bilakatani chu'sokaha.",
    hymnButton: "Tawang Monastery Gitko Knabo",
    audioYourTurn: "Nang'ni pring! Ua apsan sulsulo kintako dokbo.",
    audioListenAgain: "Namgipa gam'ako pil'kna na'simang re'babo.",
    audioWonderful: "Katchabeani! Gipin kintaona re'angna.",
    instruments: {
      gong: { name: "Sonani Gong", subname: "Tu'gipa gam'ani" },
      bowl: { name: "Turi Rongsong", subname: "Tom'tomgipa suri" },
      chime: { name: "Tawang Balwa Kinta", subname: "Seol-selgipa gam'ani" },
      bell: { name: "Rongtalgipa Kinta", subname: "Teng'sokgipa chugipa kinta" },
    },
  },
  kha: {
    clinicalTitle: "Ki Jingmyntoi ha ka Koit ka Khiah:",
    benefit1: "Ka jingkynmaw ha kaba sngap bad ka jingpynsah ia ki sur sulsul",
    benefit2: "Ka jingithuh ia ka sur bad jingiatreilang ki bor met",
    benefit3: "Ka jingkyndit kaba pyngngad ia ka jingmut jingpyrkhat",
    listenCarefully: "Sngap Bha...",
    yourTurn: "Ka Pali jong Phi!",
    listenAgain: "Sngap Biang",
    chimesCompleted: "3 tylli ki Jingriew Kyntang la dep",
    attentionPeak: "Ka Jingpyrkhat kaba Jur Bha",
    memorySpanTitle: "Jingkynmaw da kaba Sngap: 5 tylli ki Sur Sulsul",
    memorySpanDesc: "Ka jingkynmaw ia ki sur sulsul ka pynkhlain ia ka jabieng bad bor kynmaw.",
    hymnButton: "Put Jingrwai Mane Tawang Monastery",
    audioYourTurn: "Ka pali jong phi! Tied ia ki klok kyntang ha kajuh ka rukom sulsul.",
    audioListenAgain: "To ngin sngap biang ia kane ka sur kyntang.",
    audioWonderful: "Ka rukom tem kaba itynnad! Leit sha kawei pat ka sur kyntang.",
    instruments: {
      gong: { name: "Gong Ksiar", subname: "Sur riew shynrang kaba jylliew" },
      bowl: { name: "Plaing Rupa", subname: "Sur rwai kaba thiang" },
      chime: { name: "Sharak Lyer Tawang", subname: "Sur riew jem ban sngap" },
      bell: { name: "Klok Kyntang Iingmane", subname: "Sur riew shai kaba shlem" },
    },
  },
  lus: {
    clinicalTitle: "Hriselna Lam Hlawkpuinate:",
    benefit1: "Rik hriatna atanga thil hriatreng theihna leh zawn nei zela vawnna",
    benefit2: "Rik thliarhranna leh taksa chetzia inkungkaihna",
    benefit3: "Dar ri mawi tak avanga rilru thlamuanna leh hahdamna",
    listenCarefully: "Ngun takin ngaithla rawh...",
    yourTurn: "I Hun a Thleng Ta!",
    listenAgain: "Ngaithla Nawn Leh Rawh",
    chimesCompleted: "Dar Ri Mawi 3 Zawh a Ni Ta",
    attentionPeak: "Rilru Ngaihtuahna Tha Ber",
    memorySpanTitle: "Hriatna Hman Thiamna: Ri 5 Inzawm Zelin",
    memorySpanDesc: "Ri inzawm zela hriat reng theihna hian rilru chakna a tithar takzet.",
    hymnButton: "Tawang Monastery Hla Ngaithla Rawh",
    audioYourTurn: "I hun a thleng ta! Dar thianghlim chu a ri ngai char charin hmet rawh.",
    audioListenAgain: "Dar ri thianghlim hi ngaithla nawn leh ang u.",
    audioWonderful: "Tukzal tak a ni! A dawtleh a dar ri mawi ah i kal ang u.",
    instruments: {
      gong: { name: "Dar Rangkachak", subname: "Ri thuk leh fan raih" },
      bowl: { name: "Thikhar Lengkhawm Dar", subname: "Ri zaidawh leh dam" },
      chime: { name: "Tawang Thli Dar", subname: "Ri thiang leh themthem" },
      bell: { name: "Biat In Dar Thianghlim", subname: "Ri fiah leh sang" },
    },
  },
};

export function MonasteryBellGame() {
  const locale = useLocale();
  const normLocale = (locale?.split("-")[0]?.toLowerCase() || "en") as SupportedLocale;
  const bellUi = BELL_I18N[normLocale] || BELL_I18N.en;
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "monastery-bell", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "demonstrate" | "reproduce" | "done">("intro");
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [activeHighlightId, setActiveHighlightId] = useState<number | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const TOTAL_ROUNDS = 3;

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "monastery-bell",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  // Synthesize rich harmonic bell chime using Web Audio API
  const playChimeTone = useCallback((freq: number) => {
    unlockAudio();
    playMonasteryBell(freq);
  }, []);

  // Generate sequence for current round
  const generateSequenceForRound = useCallback((round: number) => {
    const seqLen = 2 + round; // Round 1: 3 items, Round 2: 4 items, Round 3: 5 items
    const seq: number[] = [];
    for (let i = 0; i < seqLen; i++) {
      seq.push(Math.floor(Math.random() * 4));
    }
    return seq;
  }, []);

  // Play sequence demonstration to elder
  const playSequenceDemo = useCallback(
    (seq: number[]) => {
      setPhase("demonstrate");
      setUserSequence([]);

      seq.forEach((bellId, index) => {
        setTimeout(() => {
          setActiveHighlightId(bellId);
          playChimeTone(SACRED_BELLS[bellId].frequency);

          setTimeout(() => {
            setActiveHighlightId(null);
            if (index === seq.length - 1) {
              setPhase("reproduce");
              speak(bellUi.audioYourTurn, locale, rate);
            }
          }, 600);
        }, index * 900 + 400);
      });
    },
    [bellUi.audioYourTurn, locale, playChimeTone, rate]
  );

  const startRound = useCallback(
    (roundNum: number) => {
      const seq = generateSequenceForRound(roundNum);
      setSequence(seq);
      playSequenceDemo(seq);
    },
    [generateSequenceForRound, playSequenceDemo]
  );

  const startChimeSession = useCallback(() => {
    playPress();
    setCurrentRound(1);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    startRound(1);
  }, [startRound]);

  const handleBellTap = (bellId: number) => {
    if (phase !== "reproduce") return;
    setTaps((t) => t + 1);

    // Play tone & tactile highlight
    playChimeTone(SACRED_BELLS[bellId].frequency);
    setActiveHighlightId(bellId);
    setTimeout(() => setActiveHighlightId(null), 300);

    const nextUserSeq = [...userSequence, bellId];
    setUserSequence(nextUserSeq);

    const currentStep = nextUserSeq.length - 1;

    // Check if match
    if (nextUserSeq[currentStep] !== sequence[currentStep]) {
      // Gentle errorless feedback: immediately pause input and replay sequence
      setPhase("demonstrate");
      setUserSequence([]);
      speak(bellUi.audioListenAgain, locale, rate);
      setTimeout(() => {
        playSequenceDemo(sequence);
      }, 1200);
      return;
    }

    // Sequence completed successfully
    if (nextUserSeq.length === sequence.length) {
      playCorrect();
      if (currentRound < TOTAL_ROUNDS) {
        speak(bellUi.audioWonderful, locale, rate);
        setTimeout(() => {
          const nextR = currentRound + 1;
          setCurrentRound(nextR);
          startRound(nextR);
        }, 1500);
      } else {
        setTimeout(() => {
          playComplete();
          setPhase("done");
          if (startedAt) {
            recordGameSession(patientId, {
              gameId: "monastery-bell",
              level,
              outcome: "completed",
              score: 100,
              startedAt,
              taps: taps + 1,
              errorCount: 0,
            });
          }
        }, 800);
      }
    }
  };

  const str = getGameStrings("monastery-bell", locale);

  if (loading) return <GameShell title={str.title} score={0}><GameLoading /></GameShell>;
  if (error) return <GameShell title={str.title} score={0}><GameError onRetry={reload} /></GameShell>;

  return (
    <GameShell title={str.title} score={currentRound * 33}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                {str.title}
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-purple-900" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-purple-900 text-white shadow-[4px_4px_0px_#000]">
            <Bell className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {str.introSubtitle}
            </p>
          </div>

          {/* Clinical Benefits */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-purple-900 block mb-2">
              {bellUi.clinicalTitle}
            </span>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-700" />
                <span>{bellUi.benefit1}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-tea" />
                <span>{bellUi.benefit2}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-marigold" />
                <span>{bellUi.benefit3}</span>
              </div>
            </div>
          </div>

          <AudioPrompt
            text={str.audioPrompt}
            label={str.listenLabel}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startChimeSession}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "demonstrate" || phase === "reproduce" ? (
        <div className="flex flex-col items-center gap-4 py-1 text-center">
          {/* ROUND HUD */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-purple-950 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-purple-700" /> {str.hudProgress}: {currentRound} / {TOTAL_ROUNDS}
            </span>
            <span className="text-xs font-black px-2 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300 inline-flex items-center gap-1">
              {phase === "demonstrate" ? (
                <>
                  <Headphones className="w-3.5 h-3.5" />
                  <span>{bellUi.listenCarefully}</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>{bellUi.yourTurn}</span>
                </>
              )}
            </span>
          </div>

          {/* SACRED BELLS 2X2 GRID */}
          <div className="w-full max-w-md grid grid-cols-2 gap-3.5 pt-2">
            {SACRED_BELLS.map((bell) => {
              const isLit = activeHighlightId === bell.id;
              const instrumentInfo = bellUi.instruments[bell.iconType];
              return (
                <button
                  key={bell.id}
                  type="button"
                  onClick={() => handleBellTap(bell.id)}
                  disabled={phase === "demonstrate"}
                  className={`btn-tactile flex flex-col items-center justify-center gap-2 rounded-3xl border-3 p-5 transition-all shadow-[4px_4px_0px_#000] cursor-pointer ${
                    isLit ? bell.activeColor : bell.color
                  }`}
                >
                  <span className="flex h-12 w-12 items-center justify-center">
                    {bell.iconType === "gong" ? (
                      <Disc className="w-10 h-10" />
                    ) : bell.iconType === "bowl" ? (
                      <Bell className="w-10 h-10 rotate-180" />
                    ) : bell.iconType === "chime" ? (
                      <Wind className="w-10 h-10" />
                    ) : (
                      <Bell className="w-10 h-10" />
                    )}
                  </span>
                  <div>
                    <span className="font-serif text-base font-black block leading-tight">
                      {instrumentInfo.name}
                    </span>
                    <span className="text-[10px] font-bold opacity-80 uppercase block mt-0.5">
                      {instrumentInfo.subname}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* SEQUENCE STEP DOTS */}
          <div className="flex items-center gap-2 pt-2">
            {sequence.map((_, i) => (
              <span
                key={i}
                className={`h-3 w-3 rounded-full border-2 border-black transition-all ${
                  i < userSequence.length ? "bg-purple-900 scale-110" : "bg-white"
                }`}
              />
            ))}
          </div>

          {phase === "reproduce" && (
            <button
              type="button"
              onClick={() => {
                setPhase("demonstrate");
                setUserSequence([]);
                playSequenceDemo(sequence);
              }}
              className="flex items-center gap-1.5 rounded-xl border-2 border-purple-800 bg-purple-50 px-3.5 py-1.5 text-xs font-black text-purple-950 shadow-[1px_1px_0px_#000] hover:bg-purple-100 transition-transform active:translate-y-0.5 cursor-pointer mt-1"
            >
              <Headphones className="w-3.5 h-3.5 text-purple-800" />
              <span>{bellUi.listenAgain}</span>
            </button>
          )}
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title={str.celebrationTitle}
          subtitle={str.celebrationSubtitle}
          xpEarned={135}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {bellUi.chimesCompleted}
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-purple-900 text-white px-2 py-0.5">
                  {bellUi.attentionPeak}
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                {bellUi.memorySpanTitle}
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1">
                {bellUi.memorySpanDesc}
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-purple-100 px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-purple-900" />
                  <span className="text-xs font-black">{bellUi.hymnButton}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startChimeSession}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> {str.playAgainButton}
                </span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
              >
                {str.backToHub}
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
