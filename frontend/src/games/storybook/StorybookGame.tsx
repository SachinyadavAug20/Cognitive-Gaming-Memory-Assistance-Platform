"use client";

import { useCallback, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  BookOpen,
  Volume2,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Music,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Sun,
  Trees,
  Ship,
  Compass,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import {
  playPress,
  playCorrect,
  playComplete,
  playLifeSong,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { api, type AiStoryResponse, type AiStoryChoice } from "@/lib/api";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { getGameStrings } from "@/lib/gameI18n";

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
        bgColor="bg-tea"
        gameId="storybook"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

interface LocalizedStoryContent {
  themes: Array<{
    id: string;
    title: string;
    desc: string;
    icon: typeof Trees;
  }>;
  chapters: Record<number, {
    title: string;
    narrative: string;
    atmosphere: string;
    choices: Array<{ id: string; label: string; emoji: string }>;
  }>;
  ui: {
    selectExpedition: string;
    chapterOf: (curr: number, total: number) => string;
    chapterHeading: (curr: number, title: string) => string;
    listenChapter: string;
    pathQuestion: string;
    generating: string;
    concluded: string;
    score: string;
    playMelody: string;
    journeyComplete: string;
  };
}

const LOCALIZED_STORIES: Record<string, LocalizedStoryContent> = {
  hi: {
    themes: [
      {
        id: "tea-morning",
        title: "ऊपरी असम के चाय बागानों में सुबह",
        desc: "धूप से सजी हरी चाय की ढलानों और बांस के झुरमुटों में एक शांतिपूर्ण सैर।",
        icon: Trees,
      },
      {
        id: "brahmaputra-ferry",
        title: "माजुली के लिए ब्रह्मपुत्र पर शाम की नौका",
        desc: "सुनहरी नदी की लहरें, डॉल्फ़िन और दूर मंदिर की मधुर घंटियां।",
        icon: Ship,
      },
      {
        id: "shillong-pine",
        title: "शिलांग चोटी के चीड़ के जंगलों में सैर",
        desc: "ठंडी पहाड़ी हवा, गुलाबी चेरी के फूल और शांतिदायक माहौल।",
        icon: Compass,
      },
    ],
    chapters: {
      1: {
        title: "अध्याय 1: सुनहरी सुबह की धूप",
        narrative: "सुबह की गुनगुनी धूप हरी-भरी पहाड़ियों को चमका रही है। चाय की ताज़ा पत्तियों और चीड़ की खुशबू से भरी ठंडी हवा चेहरे को छू रही है।",
        atmosphere: "ताज़ा पहाड़ी हवा और भीनी चाय की सुगंध",
        choices: [
          { id: "c1", label: "लकड़ी के छोटे पुल को पार करें", emoji: "Compass" },
          { id: "c2", label: "बैठकर मीठी इलायची वाली चाय पिएं", emoji: "Coffee" },
        ],
      },
      2: {
        title: "अध्याय 2: कल-कल बहता पहाड़ी झरना",
        narrative: "आगे बढ़ते ही पत्थरों से टकराते पानी की मीठी आवाज़ सुनाई देती है। चिड़ियाँ पेड़ों पर चहचहा रही हैं और धूप पत्तियों से छनकर आ रही है।",
        atmosphere: "झरने का ठंडा जल और पंछियों की मधुर चहचहाहट",
        choices: [
          { id: "c1", label: "पानी के किनारे बैठकर हाथ धोएं", emoji: "Droplets" },
          { id: "c2", label: "पगडंडी पर आगे पुराने मंदिर की ओर बढ़ें", emoji: "Sun" },
        ],
      },
      3: {
        title: "अध्याय 3: शांत छांव और गांव की पगडंडी",
        narrative: "दूर एक पुराना लकड़ी का घर दिखता है जहाँ से ताज़ी रोटी और दालचीनी की खुशबू आ रही है। आसपास खुशहाल गेंदे के फूल खिले हैं।",
        atmosphere: "फूलों की खुशबू और मिट्टी की सौंधी महक",
        choices: [
          { id: "c1", label: "बगीचे में सुंदर रंग-बिरंगे फूल देखें", emoji: "Flower" },
          { id: "c2", label: "आँगन में कुर्सी पर बैठकर सुस्ताएं", emoji: "Heart" },
        ],
      },
      4: {
        title: "अध्याय 4: सुखद गोधूलि और घर की यादें",
        narrative: "शाम का सूरज धीरे-धीरे पहाड़ों के पीछे ढल रहा है। शाम की आरती की घंटी बजी और घर का आंगन दीपों की रोशनी से जगमगा उठा।",
        atmosphere: "शाम की मधुर घंटी और शांत वातावरण",
        choices: [
          { id: "c1", label: "दीपक जलाकर शांति का अनुभव करें", emoji: "Sparkles" },
          { id: "c2", label: "परिवार के साथ बैठकर यादें साझा करें", emoji: "Smile" },
        ],
      },
    },
    ui: {
      selectExpedition: "कहानी यात्रा चुनें:",
      chapterOf: (curr, total) => `अध्याय ${curr} / ${total}`,
      chapterHeading: (curr, title) => title,
      listenChapter: "अध्याय सुनकर समझें",
      pathQuestion: "आगे आप क्या करना चाहेंगे?",
      generating: "कहानी तैयार हो रही है...",
      concluded: "स्मृति यात्रा संपन्न",
      score: "अंक: 100%",
      playMelody: "लोक धुन बजाएं",
      journeyComplete: "यात्रा संपन्न",
    },
  },
  as: {
    themes: [
      {
        id: "tea-morning",
        title: "উজনি অসমৰ চাহ বাগিচাত পুৱাৰ বেলি",
        desc: "ৰিবৰিব বতাহ আৰু সেউজীয়া চাহ বাগিচাৰ মাজেৰে পুৱাৰ প্ৰশান্ত খোজ।",
        icon: Trees,
      },
      {
        id: "brahmaputra-ferry",
        title: "মাজুলীলৈ ব্ৰহ্মপুত্ৰৰ আবেলিৰ ফেৰী",
        desc: "সোণালী লুইতৰ ঢৌ, শিহু আৰু নামঘৰৰ ডবা-শংখৰ ধ্বনি।",
        icon: Ship,
      },
      {
        id: "shillong-pine",
        title: "শ্বিলং শৃংগত সৰল গছৰ বনত খোজ",
        desc: "শীতল পাহাৰীয়া বতাহ, চেৰী ফুল আৰু পাহাৰীয়া শান্ত পৰিৱেশ।",
        icon: Compass,
      },
    ],
    chapters: {
      1: {
        title: "অধ্যায় ১: সোণালী ৰ'দালিৰ পুৱা",
        narrative: "পুৱাৰ কোমল ৰ'দজাক সেউজীয়া পাহাৰবোৰৰ ওপৰত বিয়পি পৰিছে। চাহপাতৰ মিঠা গোন্ধ লৈ অহা মলয়া বতাহজাকে মন জুৰাই তুলিছে।",
        atmosphere: "জুৰ মলয়া বতাহ আৰু সতেজ চাহৰ সুবাস",
        choices: [
          { id: "c1", label: "কাঠৰ সাঁকোখন পাৰ হৈ আগবাঢ়ক", emoji: "Compass" },
          { id: "c2", label: "ৰৈ গৰম ৰঙা চাহৰ সোৱাদ লওক", emoji: "Coffee" },
        ],
      },
      2: {
        title: "অধ্যায় ২: কুলু-কুলু বৈ যোৱা জানটো",
        narrative: "আগলৈ যাওঁতে পাহাৰীয়া জানৰ কুলু-কুলু শব্দ শুনা গ'ল। গছৰ ডালত কুলি-কেতেকীৰ সুমধুৰ গান বাজি উঠিছে।",
        atmosphere: "জানৰ শীতল পানী আৰু চৰাইৰ কলকাকলি",
        choices: [
          { id: "c1", label: "জানৰ পানীত হাত-মুখ ধুই জিৰণি লওক", emoji: "Droplets" },
          { id: "c2", label: "পদুলিৰ বাটেৰে নামঘৰৰ ফালে খোজ লওক", emoji: "Sun" },
        ],
      },
      3: {
        title: "অধ্যায় ৩: তামোল-পান আৰু ফুলৰ বাৰী",
        narrative: "বাটৰ কাষত এজোপা তামোল গছ আৰু সুবাসিত কপৌফুল ফুলি থকা দেখা গ'ল। গাঁৱৰ আইসকলে পদূলি মুখত মৰমেৰে মাত দিলে।",
        atmosphere: "মাটিৰ সোঁৱাদ আৰু কপৌফুলৰ সুবাস",
        choices: [
          { id: "c1", label: "বাৰীৰ ফুলবোৰ মৰমেৰে চাই আনন্দ লওক", emoji: "Flower" },
          { id: "c2", label: "চোতালৰ পিৰাত বহি জিৰণি লওক", emoji: "Heart" },
        ],
      },
      4: {
        title: "অধ্যায় ৪: সোণালী গধূলি আৰু ঘৰৰ চেনেহ",
        narrative: "বেলি লহিওৱাৰ লগে লগে নামঘৰত ডবা-কাঁহ বাজি উঠিল। ঘৰৰ চোতালত তুলসীৰ তলত চাকি জ্বলি উঠিল আৰু মন শান্ত হ'ল।",
        atmosphere: "ডবা-কাঁহৰ ধ্বনি আৰু শান্ত গধূলি",
        choices: [
          { id: "c1", label: "চাকি জ্বলাই প্ৰণাম জনাওক", emoji: "Sparkles" },
          { id: "c2", label: "পৰিয়ালৰ সৈতে পুৰণি কথা পাতক", emoji: "Smile" },
        ],
      },
    },
    ui: {
      selectExpedition: "কাহিনীৰ যাত্ৰা বাছনি কৰক:",
      chapterOf: (curr, total) => `অধ্যায় ${curr} / ${total}`,
      chapterHeading: (curr, title) => title,
      listenChapter: "অধ্যায়টো শুনি লওক",
      pathQuestion: "ইয়াৰ পিছত আপুনি কি কৰিব বিচাৰে?",
      generating: "কাহিনী প্ৰস্তুত হৈছে...",
      concluded: "স্মৃতিৰ যাত্ৰা সমাপ্ত হ'ল",
      score: "নম্বৰ: ১০০%",
      playMelody: "লোকগীত বজাওক",
      journeyComplete: "যাত্ৰা সম্পূৰ্ণ হ'ল",
    },
  },
  bn: {
    themes: [
      {
        id: "tea-morning",
        title: "উচ্চ আসামের চা বাগানে সকাল",
        desc: "রোদেলা সবুজ চা বাগান এবং শান্ত বাঁশঝাড়ের মধ্য দিয়ে মনোরম হাঁটা।",
        icon: Trees,
      },
      {
        id: "brahmaputra-ferry",
        title: "মাজুলির দিকে ব্রহ্মপুত্র সূর্যাস্ত ফেরি",
        desc: "সোনালী নদীর ঢেউ, গাঙ্গেয় শুশুক এবং শান্ত মন্দিরের ঘণ্টা।",
        icon: Ship,
      },
      {
        id: "shillong-pine",
        title: "শিলং শৃঙ্গে পাইন বনের পথ",
        desc: "মনোরম পাহাড়ি বাতাস, চেরি ফুল এবং শান্ত পরিমণ্ডল।",
        icon: Compass,
      },
    ],
    chapters: {
      1: {
        title: "অধ্যায় ১: সোনালী সকালের আলো",
        narrative: "সকালের মিষ্টি রোদ সবুজ পাহাড়ের ওপর ছড়িয়ে পড়েছে। বাতাসে তাজা চা পাতা আর পাইনের সুগন্ধ মনকে শান্ত করে দেয়।",
        atmosphere: "শান্ত পাহাড়ি বাতাস ও তাজা চায়ের সুবাস",
        choices: [
          { id: "c1", label: "কাঠের ছোট সেতুটি পার হন", emoji: "Compass" },
          { id: "c2", label: "বসে এলাচ চা উপভোগ করুন", emoji: "Coffee" },
        ],
      },
      2: {
        title: "অধ্যায় ২: কলকল পাহাড়ি ঝরনা",
        narrative: "সামনে এগোতেই স্বচ্ছ নদীর মিষ্টি সুর শোনা যায়। গাছের ডালে পাখির গান ও মিষ্টি আলো ছড়িয়ে পড়েছে।",
        atmosphere: "ঝরনার শীতল জল ও পাখির গান",
        choices: [
          { id: "c1", label: "নদীর তীরে বসে বিশ্রাম নিন", emoji: "Droplets" },
          { id: "c2", label: "পাথুরে পথ ধরে গ্রামের দিকে চলুন", emoji: "Sun" },
        ],
      },
      3: {
        title: "অধ্যায় ৩: গ্রামীণ বাগান ও অর্কিড",
        narrative: "সামনে একটি সুন্দর কাঠের বাড়ি, ফটকের পাশে বুনো অর্কিড ফুটে রয়েছে। উঠোনে আদা চায়ের মিষ্টি সুবাস ভেসে আসছে।",
        atmosphere: "বুনো ফুলের গন্ধ ও ঘরের উষ্ণতা",
        choices: [
          { id: "c1", label: "সুন্দর অর্কিড ফুলগুলো দেখুন", emoji: "Flower" },
          { id: "c2", label: "বারান্দার চেয়ারে আরাম করে বসুন", emoji: "Heart" },
        ],
      },
      4: {
        title: "অধ্যায় ৪: সূর্যাস্তের আলো ও পারিবারিক স্মৃতি",
        narrative: "সোনালী সূর্য পাহাড়ের পেছনে অস্ত গেল। প্রদীপের আলোয় উঠোন আলোকিত হলো, মন শান্তিময় স্মৃতিতে ভরে উঠল।",
        atmosphere: "সন্ধ্যার মধুর ঘণ্টা ও প্রজ্বলিত প্রদীপ",
        choices: [
          { id: "c1", label: "সন্ধ্যার আকাশ দেখুন", emoji: "Sparkles" },
          { id: "c2", label: "পরিবারের সাথে স্মৃতি ভাগ করুন", emoji: "Smile" },
        ],
      },
    },
    ui: {
      selectExpedition: "গল্পের যাত্রা নির্বাচন করুন:",
      chapterOf: (curr, total) => `অধ্যায় ${curr} / ${total}`,
      chapterHeading: (curr, title) => title,
      listenChapter: "অধ্যায়টি শুনুন",
      pathQuestion: "পরবর্তী পদক্ষেপ কোনটি নিতে চান?",
      generating: "গল্প তৈরি হচ্ছে...",
      concluded: "জীবন্ত স্মৃতিযাত্রা সমাপ্ত",
      score: "স্কোর: ১০০%",
      playMelody: "লোকসুর বাজান",
      journeyComplete: "যাত্রা সম্পন্ন",
    },
  },
  en: {
    themes: [
      {
        id: "tea-morning",
        title: "Morning in the Upper Assam Tea Hills",
        desc: "A walk through sunlit green tea slopes and misty bamboo groves.",
        icon: Trees,
      },
      {
        id: "brahmaputra-ferry",
        title: "The Brahmaputra Sunset Ferry to Majuli",
        desc: "Golden river currents, river dolphins, and peaceful evening bells.",
        icon: Ship,
      },
      {
        id: "shillong-pine",
        title: "Pine Forest Walk at Shillong Peak",
        desc: "Crisp mountain breeze, cherry blossoms, and distant church chimes.",
        icon: Compass,
      },
    ],
    chapters: {
      1: {
        title: "Chapter 1: Golden Morning Sun",
        narrative: "The warm morning sun illuminates the green hills. A gentle mountain breeze touches your face with the sweet scent of tea leaves and pine trees.",
        atmosphere: "Crisp mountain breeze & fresh tea aroma",
        choices: [
          { id: "c1", label: "Walk across the wooden bridge", emoji: "Compass" },
          { id: "c2", label: "Sit and enjoy sweet cardamom tea", emoji: "Coffee" },
        ],
      },
      2: {
        title: "Chapter 2: Gentle Mountain Stream",
        narrative: "As you step ahead, clear fresh water ripples over smooth river pebbles. Songbirds sing softly in the canopy above as the light filters through.",
        atmosphere: "Soothing water ripple & birdsong",
        choices: [
          { id: "c1", label: "Rest by the cool river bank", emoji: "Droplets" },
          { id: "c2", label: "Follow the stone pathway toward the village", emoji: "Sun" },
        ],
      },
      3: {
        title: "Chapter 3: Village Garden & Orchids",
        narrative: "A warm homestead appears with wild orchids blooming by the gate. The friendly aroma of freshly brewed ginger tea wafts through the courtyard.",
        atmosphere: "Wild orchid blossoms & warm hearth",
        choices: [
          { id: "c1", label: "Admire the delicate orchid flowers", emoji: "Flower" },
          { id: "c2", label: "Sit comfortably on the veranda chair", emoji: "Heart" },
        ],
      },
      4: {
        title: "Chapter 4: Sunset Glow & Home Reunion",
        narrative: "The golden sun dips behind the distant hills. Evening lamps are lit one by one, filling your heart with peace, warmth, and belonging.",
        atmosphere: "Peaceful evening bells & glowing lamps",
        choices: [
          { id: "c1", label: "Watch the golden evening sky", emoji: "Sparkles" },
          { id: "c2", label: "Share warm memories with loved ones", emoji: "Smile" },
        ],
      },
    },
    ui: {
      selectExpedition: "Select Narrative Expedition:",
      chapterOf: (curr, total) => `Chapter ${curr} of ${total}`,
      chapterHeading: (curr, title) => title,
      listenChapter: "Listen to Chapter",
      pathQuestion: "What path do you take next?",
      generating: "Generating narrative...",
      concluded: "Living Chronicle Concluded",
      score: "Score: 100%",
      playMelody: "Play Folk Melody",
      journeyComplete: "Journey Complete",
    },
  },
  mr: {
    themes: [
      {
        id: "tea-morning",
        title: "वरच्या आसामच्या चहाच्या बागांमध्ये सकाळ",
        desc: "हिरवेगार चहाचे मळे आणि बांबूच्या बागांमध्ये शांत फेरफटका.",
        icon: Trees,
      },
      {
        id: "brahmaputra-ferry",
        title: "माजुलीसाठी ब्रह्मपुत्रा नदीतून सायंकाळची फेरी",
        desc: "सोनेरी लाटा, डॉल्फिन आणि मंदिरातल्या घंट्यांचा नाद.",
        icon: Ship,
      },
      {
        id: "shillong-pine",
        title: "शिलॉंग शिखरावरील पाइन जंगलात चालणे",
        desc: "थंडगार डोंगराळ हवा, गुलाबी चेरी ब्लॉसम आणि शांत परिसर.",
        icon: Compass,
      },
    ],
    chapters: {
      1: {
        title: "अध्याय १: सोनेरी सकाळचे ऊन",
        narrative: "सकाळचे कोवळे ऊन हिरव्या टेकड्यांवर पसरले आहे. ताज्या चहाच्या पानांचा आणि पाइनचा मंद सुगंध सुखद अनुभव देतो.",
        atmosphere: "थंड डोंगराळ वारा आणि ताज्या चहाचा सुगंध",
        choices: [
          { id: "c1", label: "लाकडी पुलावरून पलीकडे जा", emoji: "Compass" },
          { id: "c2", label: "बसून गोड वेलची चहाचा आस्वाद घ्या", emoji: "Coffee" },
        ],
      },
      2: {
        title: "अध्याय २: झुळझुळ वाहणारा झरा",
        narrative: "पुढे जाताच वाहणाऱ्या पाण्याच्या मंजूळ नादाने मन प्रसन्न होते. झाडांवर पक्षी गोड गाणी गात आहेत.",
        atmosphere: "झऱ्याचे थंड पाणी आणि पक्ष्यांचे गुंजन",
        choices: [
          { id: "c1", label: "झऱ्याजवळ बसून विश्रांती घ्या", emoji: "Droplets" },
          { id: "c2", label: "दगडी वाटेने गावाकडे पुढे चला", emoji: "Sun" },
        ],
      },
      3: {
        title: "अध्याय ३: गावचा सुंदर बगीचा",
        narrative: "दाराशी फुललेली सुंदर ऑर्किड फुले आणि ताज्या चहाचा सुवास घराघरातून दरवळत आहे.",
        atmosphere: "फुलांचा सुगंध आणि घराची ऊब",
        choices: [
          { id: "c1", label: "नाजूक ऑर्किड फुले पहा", emoji: "Flower" },
          { id: "c2", label: "व्हरांड्यावर शांतपणे बसा", emoji: "Heart" },
        ],
      },
      4: {
        title: "अध्याय ४: शांत संध्याकाळ व आठवणी",
        narrative: "सोनेरी सूर्य डोंगरांमागे मावळत आहे. मंदिरात घंटानाद सुरू झाला आणि घरात दिवे लागले.",
        atmosphere: "सायंकाळच्या घंटा आणि दिव्यांचा प्रकाश",
        choices: [
          { id: "c1", label: "सोनेरी आभाळ पहा", emoji: "Sparkles" },
          { id: "c2", label: "कुटुंबासोबत जुन्या आठवणी शेअर करा", emoji: "Smile" },
        ],
      },
    },
    ui: {
      selectExpedition: "कथा प्रवास निवडा:",
      chapterOf: (curr, total) => `अध्याय ${curr} / ${total}`,
      chapterHeading: (curr, title) => title,
      listenChapter: "अध्याय ऐका",
      pathQuestion: "पुढे तुम्ही काय कराल?",
      generating: "कथा तयार होत आहे...",
      concluded: "स्मृती प्रवास समाप्त",
      score: "गुण: १००%",
      playMelody: "लोकसंगीत वाजवा",
      journeyComplete: "प्रवास पूर्ण",
    },
  },
  ne: {
    themes: [
      {
        id: "tea-morning",
        title: "माथिल्लो असमको चियाबारीमा बिहानी",
        desc: "हरियाली चियाका पहाड र बाँसका झ्याङहरूमा शान्त बिहानीको यात्रा।",
        icon: Trees,
      },
      {
        id: "brahmaputra-ferry",
        title: "माजुलीका लागि ब्रह्मपुत्र साँझको डुङ्गा यात्रा",
        desc: "सुनौला नदीका छालहरू, डल्फिन र मन्दिरको घन्टीको धुन।",
        icon: Ship,
      },
      {
        id: "shillong-pine",
        title: "शिलोङ डाँडाको सल्लाघारीमा पदयात्रा",
        desc: "चिसो लेकाली बतास, चेरीका फूलहरू र शान्त वातावरण।",
        icon: Compass,
      },
    ],
    chapters: {
      1: {
        title: "अध्याय १: सुनौलो बिहानीको घाम",
        narrative: "बिहानीको न्यानो घामले हरिया डाँडाहरूलाई चम्काइरहेको छ। चियाका मुना र सल्लोको सुगन्धले मन शान्त बनाउँछ।",
        atmosphere: "चिसो लेकाली हावा र चियाको ताजा सुवास",
        choices: [
          { id: "c1", label: "काठको सानो पुल तरेर अघि बढ्नुहोस्", emoji: "Compass" },
          { id: "c2", label: "बसेर मीठो अलैँची चिया पिउनुहोस्", emoji: "Coffee" },
        ],
      },
      2: {
        title: "अध्याय २: कलकल बग्ने पहाडी खोला",
        narrative: "अघि बढ्दा खोलाको मीठो आवाज सुनिन्छ। रुखहरूमा चराचुरुङ्गी मधुर गीत गाइरहेका छन्।",
        atmosphere: "खोलाको चिसो पानी र चराहरूको चिरबिर",
        choices: [
          { id: "c1", label: "खोलाको किनारमा बसेर आराम गर्नुहोस्", emoji: "Droplets" },
          { id: "c2", label: "ढुङ्गे बाटो हुँदै गाउँतिर लाग्नुहोस्", emoji: "Sun" },
        ],
      },
      3: {
        title: "अध्याय ३: गाउँको बगैँचा र सुनाखरी",
        narrative: "ढोकामा सुनाखरीका फूलहरू फुलेका छन् र आँगनमा अदुवा चियाको ताजा बास्ना आइरहेको छ।",
        atmosphere: "सुनाखरीको बास्ना र न्यानो घर",
        choices: [
          { id: "c1", label: "सुन्दर फूलहरूको आनन्द लिनुहोस्", emoji: "Flower" },
          { id: "c2", label: "पिँढीमा बसेर सुस्ताउनुहोस्", emoji: "Heart" },
        ],
      },
      4: {
        title: "अध्याय ४: साँझको गोधूलि र घरको सम्झना",
        narrative: "घाम डाँडापारि डुब्दैछ। मन्दिरमा साँझको घन्टी बज्यो र घरमा बत्तीहरू बालिए।",
        atmosphere: "साँझको घन्टी र शान्त मन",
        choices: [
          { id: "c1", label: "साँझको सुनौलो आकाश हेर्नुहोस्", emoji: "Sparkles" },
          { id: "c2", label: "परिवारसँग पुराना कुरा साट्नुहोस्", emoji: "Smile" },
        ],
      },
    },
    ui: {
      selectExpedition: "कथा यात्रा रोज्नुहोस्:",
      chapterOf: (curr, total) => `अध्याय ${curr} / ${total}`,
      chapterHeading: (curr, title) => title,
      listenChapter: "अध्याय सुनेर बुझ्नुहोस्",
      pathQuestion: "अब तपाईं के गर्न चाहनुहुन्छ?",
      generating: "कथा तयार हुँदैछ...",
      concluded: "स्मृति यात्रा सम्पन्न",
      score: "अङ्क: १००%",
      playMelody: "लोक धुन बजाउनुहोस्",
      journeyComplete: "यात्रा सम्पन्न",
    },
  },
  mni: {
    themes: [
      {
        id: "tea-morning",
        title: "অৱাং আসামগী চা পাম্বী লম্পাক্তা অয়ুক",
        desc: "নুমিৎ য়াংনা থোকপা চা পাম্বী অমসুং ৱা লৈরক্তা শান্ত ওইবা খোংচৎ।",
        icon: Trees,
      },
      {
        id: "brahmaputra-ferry",
        title: "মাজুলীগীদমক ব্রহ্মপুত্রদা নুমিদাংগী হী খোংচৎ",
        desc: "সোনালী ঈচেল, দলফিন অমসুং লাইশঙগী ঘন্টা খোঞ্জেল।",
        icon: Ship,
      },
      {
        id: "shillong-pine",
        title: "শিল্লোং চীংদোন্দা উনশুম উমংদা খোংচৎ",
        desc: "হিংচবা নোংজু নোংশিৎ, লৈরাং অমসুং শান্ত ওইবা মফম।",
        icon: Compass,
      },
    ],
    chapters: {
      1: {
        title: "অধ্যয় ১: সোনালী অয়ুক্কী নুমিৎ",
        narrative: "অয়ুক্কী নুমিৎ ঙাল্লকপনা চীংশিং শেমগৎলে। চা মনাগী সুগন্ধনা পুক্নিংবু শান্ত তৌহল্লে।",
        atmosphere: "চিংশাংগী নোংশিৎ অমসুং চা মনাগী সুগন্ধ",
        choices: [
          { id: "c1", label: "উগী থোং লান্না চৎসি", emoji: "Compass" },
          { id: "c2", label: "ফমদুনা অশাবা চা থকসি", emoji: "Coffee" },
        ],
      },
      2: {
        title: "অধ্যয় ২: তুরেলগী ঈচেল",
        narrative: "মখা চৎলকপদা তুরেলগী ঈচেল খোঞ্জেল তারকই। উচেকশিংগী তান্থা তাদুনা নুঙাইরকই।",
        atmosphere: "তুরেলগী ঈশিং অমসুং উচেক খোঞ্জেল",
        choices: [
          { id: "c1", label: "তুরেল শম্ভালদা পোথারি", emoji: "Droplets" },
          { id: "c2", label: "নুংগী লম্বী ইল্লগা খুলদা চৎসি", emoji: "Sun" },
        ],
      },
      3: {
        title: "অধ্যয় ৩: খুলগী লৈকোল অমসুং লৈরাং",
        narrative: "খুলগী য়ুম অমগী মপানদা লৈরাং শত্থোক্লে অমসুং য়ুমদগী চা সুগন্ধ হৌরকই।",
        atmosphere: "লৈরাং সুবাস অমসুং নুংশিবা মফম",
        choices: [
          { id: "c1", label: "মচু-মচু লৈরাং য়েংসি", emoji: "Flower" },
          { id: "c2", label: "মংগোলদা ফমদুনা পোথাবা", emoji: "Heart" },
        ],
      },
      4: {
        title: "অধ্যয় ৪: নুমিদাংগী নুমিৎ তাবা অমসুং ইমুংগী নিংশিংবা",
        narrative: "সোনালী নুমিৎ তাবা হৌরক্লে। লাইশঙগী ঘন্টা তারক্লে অমসুং য়ুমদা থাবা মৈরা ঙাল্লক্লে।",
        atmosphere: "নুমিদাংগী ঘন্টা অমসুং শান্ত পুক্নিং",
        choices: [
          { id: "c1", label: "নুমিদাংগী অৱাংবা অর্বা য়েংসি", emoji: "Sparkles" },
          { id: "c2", label: "ইমুংগা লোয়ননা ৱারী শানসি", emoji: "Smile" },
        ],
      },
    },
    ui: {
      selectExpedition: "ৱারীগী খোংচৎ খনবিয়ু:",
      chapterOf: (curr, total) => `অধ্যয় ${curr} / ${total}`,
      chapterHeading: (curr, title) => title,
      listenChapter: "অধ্যয় পাথোকপা তারসি",
      pathQuestion: "তুংদা নহাক করি তৌনিংবগে?",
      generating: "ৱারী শেম্লি...",
      concluded: "নীংশিং খোংচৎ লোয়রে",
      score: "স্কোর: ১০০%",
      playMelody: "লোকসঙ্গীত খোঞ্জেল তাবা",
      journeyComplete: "খোংচৎ লোয়রে",
    },
  },
  brx: {
    themes: [
      {
        id: "tea-morning",
        title: "गोजौ आसामनि साहा बागानाव फुं",
        desc: "साननि गोजों आरो अखाफोर गेजेरजों गोजोनै थाबायनाय।",
        icon: Trees,
      },
      {
        id: "brahmaputra-ferry",
        title: "माजुलिनि थाखाय ब्रह्मपुत्रा बेलासेनि नावनि दावबायनाय",
        desc: "सोनारि दैमा, दलफिन आरो मन्दिरनि घन्टा सोदोब।",
        icon: Ship,
      },
      {
        id: "shillong-pine",
        title: "सिलं हाजोमानि पाइन हाग्रायाव थाबायनाय",
        desc: "गुसु बार, चेरि बिबार आरो गोजोन थासारि।",
        icon: Compass,
      },
    ],
    chapters: {
      1: {
        title: "खोन्दो 1: सोनारि फुंनि सान",
        narrative: "फुंनि गुदुं सानाव हाजोफोरा गोजोंखांदों। साहा बिलाइ आरो पाइन बिबारनि मोदोमनाया गोसोखौ गोजोनहोयो।",
        atmosphere: "गुसु बार आरो साहा बिलाइनि मोदोमनाय",
        choices: [
          { id: "c1", label: "दांसे बां दालांखौ बार", emoji: "Compass" },
          { id: "c2", label: "जिरायना गुदुं साहा लों", emoji: "Coffee" },
        ],
      },
      2: {
        title: "खोन्दो 2: जिरजिर बोहैनाय दैसा",
        narrative: "सिगां थांनायाव दैया जिरजिर बोहैनाय सोदोब खोनायो। दावफोरा बिफां दालाइयाव मेथाइ रोजाबदों।",
        atmosphere: "दैसानि गुसु दै आरो दावनि रोजाबनाय",
        choices: [
          { id: "c1", label: "दैसा सेराव जिराय", emoji: "Droplets" },
          { id: "c2", label: "गामिनि लामाजों सिगां थां", emoji: "Sun" },
        ],
      },
      3: {
        title: "खोन्दो 3: गामिनि बागाना आरो बिबार",
        narrative: "न'नि सेराव बिबार बारदों आरो न'निफ्राय साहा मोदोमनाय फैदों।",
        atmosphere: "बिबार मोदोमनाय आरो गोजोन न'",
        choices: [
          { id: "c1", label: "समायना बिबारफोरखौ नाय", emoji: "Flower" },
          { id: "c2", label: "बारान्दायाव जिरायना सुस्ताय", emoji: "Heart" },
        ],
      },
      4: {
        title: "खोन्दो 4: बेलासेनि सान हाबनाय",
        narrative: "सोनारि सान हाबबाय। मन्दिरनि घन्टा रिंखांबाय आरो न'आव बाथि साबाय।",
        atmosphere: "बेलासेनि घन्टा आरो गोजोन गोसो",
        choices: [
          { id: "c1", label: "सोनारि अखाफोरखौ नाय", emoji: "Sparkles" },
          { id: "c2", label: "नखरजों गोजाम खोथा सावराय", emoji: "Smile" },
        ],
      },
    },
    ui: {
      selectExpedition: "सोलोंनि दावबायनाय सायख':",
      chapterOf: (curr, total) => `खोन्दो ${curr} / ${total}`,
      chapterHeading: (curr, title) => title,
      listenChapter: "खोन्दो खोनासं",
      pathQuestion: "उनथां नों मा खालामनो सानो?",
      generating: "सोलो दाफुंफुबाय...",
      concluded: "गोसोखांथि जोबबाय",
      score: "नमबर: 100%",
      playMelody: "मेथाइ दाम",
      journeyComplete: "दावबायनाय जोबबाय",
    },
  },
  grt: {
    themes: [
      {
        id: "tea-morning",
        title: "Assamni Cha Bagicho Pring Re·ani",
        desc: "Pringo cha bagicho aro wa·seko tomi re·atani.",
        icon: Trees,
      },
      {
        id: "brahmaputra-ferry",
        title: "Majulina Brahmaputra Attam Ring Re·ani",
        desc: "Sonani chibima, dolphin aro gonta gam·ani.",
        icon: Ship,
      },
      {
        id: "shillong-pine",
        title: "Shillong A·brini Bolgrim Pring Re·ani",
        desc: "Sin·gipa balwa, gulap bibal aro tom·tomani.",
        icon: Compass,
      },
    ],
    chapters: {
      1: {
        title: "Odhya 1: Sonani Pring Sal",
        narrative: "Pringni sal a·briko teng·atenga. Cha bijak aro bolgrimni se·enggipa balwa kusi ong·atenga.",
        atmosphere: "Sin·gipa balwa aro cha similani",
        choices: [
          { id: "c1", label: "Bolni janggiko batbo", emoji: "Compass" },
          { id: "c2", label: "Asong·e ding·gipa cha ringbo", emoji: "Coffee" },
        ],
      },
      2: {
        title: "Odhya 2: Chi Ring·ani Chiring",
        narrative: "Chiringni riring gam·aniko knaenga. Do·orang bolo git ring·enga.",
        atmosphere: "Kasal gipa chi aro do·orang",
        choices: [
          { id: "c1", label: "Chiring rikam asongbo", emoji: "Droplets" },
          { id: "c2", label: "Songna rama re·angbo", emoji: "Sun" },
        ],
      },
      3: {
        title: "Odhya 3: Songni Bagan & Bibal",
        narrative: "Nokni kolkolo bibal balenga aro pringni cha similani sokbaenga.",
        atmosphere: "Bibal similani aro tomi nok",
        choices: [
          { id: "c1", label: "Nambegipa bibalrangko nibo", emoji: "Flower" },
          { id: "c2", label: "Barandao neng·takbo", emoji: "Heart" },
        ],
      },
      4: {
        title: "Odhya 4: Attam Sal & Nokdangni Gisik",
        narrative: "Sal a·briona napangaha. Walni gonta gam·aha aro noko leka sokbaaha.",
        atmosphere: "Attam gonta aro tomi gisik",
        choices: [
          { id: "c1", label: "Sonani salgiko nibo", emoji: "Sparkles" },
          { id: "c2", label: "Nokdang baksa agangrikbo", emoji: "Smile" },
        ],
      },
    },
    ui: {
      selectExpedition: "Golponi Re·aniko Seokbo:",
      chapterOf: (curr, total) => `Odhya ${curr} / ${total}`,
      chapterHeading: (curr, title) => title,
      listenChapter: "Odhya Knatimbo",
      pathQuestion: "Ja·mano na·a ma·ko dakna sik·enga?",
      generating: "Golpo taria...",
      concluded: "Gisik Ra·ani Matchotaha",
      score: "Score: 100%",
      playMelody: "Git Ring·bo",
      journeyComplete: "Re·ani Matchotaha",
    },
  },
  kha: {
    themes: [
      {
        id: "tea-morning",
        title: "Step ha ki Kper Sha Upper Assam",
        desc: "Ka jingleit iaid ha ki lum kper sha ba jyrngam bad ki siej.",
        icon: Trees,
      },
      {
        id: "brahmaputra-ferry",
        title: "Ka Lieng Brahmaputra sha Majuli",
        desc: "Ki um basngur, ki dolphin bad ki shakuriaw mandir.",
        icon: Ship,
      },
      {
        id: "shillong-pine",
        title: "Ka Jingiaid ha Khlaw Diengkseh Lum Shillong",
        desc: "Ka lyer rit kaba pjah, ki syntiew cherry bad ka jingsuk.",
        icon: Compass,
      },
    ],
    chapters: {
      1: {
        title: "Lynnong 1: Ka Step Basngur Kpa",
        narrative: "Ka sngi kaba shit rhem ka pynshai ia ki lum ba jyrngam. Ka lyer kaba iwbih sla sha ka wan ban pynsngewbha.",
        atmosphere: "Ka lyer rit ba pjah & ka jingiwbih sha",
        choices: [
          { id: "c1", label: "Jam ia ka jingkieng dieng", emoji: "Compass" },
          { id: "c2", label: "Shong bad dih sha thiang", emoji: "Coffee" },
        ],
      },
      2: {
        title: "Lynnong 2: Ka Wahduid ba Tuid",
        narrative: "Ka um kaba sngur ka tuid jai jai halor ki mawlong. Ki sim ki rwai sngewtynnat ha ki tnat dieng.",
        atmosphere: "Ka jingtuid um & ki sur sim",
        choices: [
          { id: "c1", label: "Shong pynngad harud wahduid", emoji: "Droplets" },
          { id: "c2", label: "Bud ia ka lynti maw sha shnong", emoji: "Sun" },
        ],
      },
      3: {
        title: "Lynnong 3: Ka Kper Syntiew ha Shnong",
        narrative: "Ki syntiew orchid ki phuh itynnat ha khyrdop bad ka jingiwbih sha sngur ka wan na iing.",
        atmosphere: "Ka jingiwbih syntiew & ka jingsuk iing",
        choices: [
          { id: "c1", label: "Peit kai ia ki syntiew", emoji: "Flower" },
          { id: "c2", label: "Shong thait ha shawkad", emoji: "Heart" },
        ],
      },
      4: {
        title: "Lynnong 4: Ka Sep Sngi bad Jingkynmaw",
        narrative: "Ka sngi ka la sep sha lyndet ki lum. Ki shakuriaw ki riew bad ki sharak ki la meh.",
        atmosphere: "Ki shakuriaw janmiet & ka jingsuk",
        choices: [
          { id: "c1", label: "Peit ia ka suiñbneng ba saw", emoji: "Sparkles" },
          { id: "c2", label: "Iakren jingkynmaw bad kiba ha iing", emoji: "Smile" },
        ],
      },
    },
    ui: {
      selectExpedition: "Jied ia ka Jingiaid Puriskam:",
      chapterOf: (curr, total) => `Lynnong ${curr} / ${total}`,
      chapterHeading: (curr, title) => title,
      listenChapter: "Sngap ia ka Lynnong",
      pathQuestion: "Kaei kaba phi kwah ban leh bud?",
      generating: "Shna jingpule...",
      concluded: "Kynmaw Jingmut La Kut",
      score: "Score: 100%",
      playMelody: "Tem Jingrwai Tynrai",
      journeyComplete: "Jingiaid La Dep",
    },
  },
  lus: {
    themes: [
      {
        id: "tea-morning",
        title: "Upper Assam Thingpui Huan Zing Iaid Kual",
        desc: "Tlang thingpui huan hring mawi tak leh mau hmun kara zalen taka len harh.",
        icon: Trees,
      },
      {
        id: "brahmaputra-ferry",
        title: "Majuli Panna Brahmaputra Lawng Zin",
        desc: "Lui tui fawn mawi, sangha lian leh biak in dar ri mawi tak.",
        icon: Ship,
      },
      {
        id: "shillong-pine",
        title: "Shillong Tlang Far Hmun Zin Kawng",
        desc: "Tlang boruak vawt thianghlim, cherry par leh hmun nuam tak.",
        icon: Compass,
      },
    ],
    chapters: {
      1: {
        title: "Bung 1: Zing Ni Eng Mawi",
        narrative: "Zing ni eng mawi tak chuan tlang hring nghulh mai chu a chhun eng a. Thingpui hnah rim tui tak boruakah a leng vel e.",
        atmosphere: "Tlang boruak thianghlim & thingpui rim tui",
        choices: [
          { id: "c1", label: "Thing lehlawn chu kal kan rawh", emoji: "Compass" },
          { id: "c2", label: "Thu la thingpui thlum tui tak in rawh", emoji: "Coffee" },
        ],
      },
      2: {
        title: "Bung 2: Tlang Lui Fawn Mawi",
        narrative: "Tui thianghlim tak luang ri her her chuan rilru a ti hahdam a. Sate leh savaten thingzarah hla an sa e.",
        atmosphere: "Lui tui vawt & sava hram ri",
        choices: [
          { id: "c1", label: "Lui kamah hahchawl rawh", emoji: "Droplets" },
          { id: "c2", label: "Khaw panna lung kalkawng chu zawh rawh", emoji: "Sun" },
        ],
      },
      3: {
        title: "Bung 3: Khawte Huan Mawi",
        narrative: "Kawngkhar bulah orchid par mawi takte an lo vul a, in chhung atangin thingpui rim a rawn nam ram ram mai.",
        atmosphere: "Par rim tui & in lum nuam tak",
        choices: [
          { id: "c1", label: "Par mawi takte chu thlir rawh", emoji: "Flower" },
          { id: "c2", label: "Verandah-ah hahdam takin thu rawh", emoji: "Heart" },
        ],
      },
      4: {
        title: "Bung 4: Tlai Ni Tla Leh Chhungte",
        narrative: "Ni chu tlang phenah a liam ta a. Khaw tlai dar ri mawi tak a ri a, in chhungah khawnvar an chhi ta.",
        atmosphere: "Tlai dar ri mawi & rilru hahdamna",
        choices: [
          { id: "c1", label: "Tlai ni tla mawi tak chu thlir rawh", emoji: "Sparkles" },
          { id: "c2", label: "Chhungte nen hriatrengna hlui sawi dun rawh", emoji: "Smile" },
        ],
      },
    },
    ui: {
      selectExpedition: "Thawnthu Zin Kawng Thlang Rawh:",
      chapterOf: (curr, total) => `Bung ${curr} / ${total}`,
      chapterHeading: (curr, title) => title,
      listenChapter: "Bung Ngaihthlakna",
      pathQuestion: "Eng nge i tih zui zel duh ang?",
      generating: "Thawnthu buatsaih mek a ni...",
      concluded: "Hriatrengna Zin Kawng A Zo Ta",
      score: "Hmuh zat: 100%",
      playMelody: "Hnam Hla Tum Rawh",
      journeyComplete: "Zin Kawng Zo Ta",
    },
  },
};

function getStoryData(locale: string): LocalizedStoryContent {
  const norm = (locale?.split("-")[0]?.toLowerCase() || "en");
  return LOCALIZED_STORIES[norm] || LOCALIZED_STORIES.en;
}

export function StorybookGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const storyData = getStoryData(locale);
  const themes = storyData.themes;

  const level = resolveAdaptiveLevel(patientId, "storybook", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "story" | "done">("intro");
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [chapterIndex, setChapterIndex] = useState(1);
  const [currentChapter, setCurrentChapter] = useState<AiStoryResponse | null>(null);
  const [isLoadingChapter, setIsLoadingChapter] = useState(false);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const totalChapters = 4;
  const score = chapterIndex * 25;

  const loadChapter = useCallback(
    async (themeTitle: string, index: number, choiceMade?: string) => {
      setIsLoadingChapter(true);
      const safeIndex = Math.min(Math.max(1, index), totalChapters);
      const fallbackChapter = storyData.chapters[safeIndex] || storyData.chapters[1];
      const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");

      // For regional indigenous & Indian languages, always deliver authentic native text
      if (normLoc !== "en") {
        setCurrentChapter({
          chapterNumber: safeIndex,
          chapterTitle: fallbackChapter.title,
          chapterNarrative: fallbackChapter.narrative,
          sensoryAtmosphere: fallbackChapter.atmosphere,
          storyEmoji: "Sun",
          choices: fallbackChapter.choices,
          isFinale: safeIndex >= totalChapters,
        });
        setIsLoadingChapter(false);
        return;
      }

      try {
        const res = await api.aiStoryChapter({
          patientId,
          theme: themeTitle,
          currentChapterIndex: safeIndex,
          previousChoiceMade: choiceMade || "Begin Story",
        });
        // If Ollama returns empty or generic content, fallback to localized story
        if (!res || !res.chapterNarrative || res.chapterNarrative.trim().length < 10) {
          setCurrentChapter({
            chapterNumber: safeIndex,
            chapterTitle: fallbackChapter.title,
            chapterNarrative: fallbackChapter.narrative,
            sensoryAtmosphere: fallbackChapter.atmosphere,
            storyEmoji: "Sun",
            choices: fallbackChapter.choices,
            isFinale: safeIndex >= totalChapters,
          });
        } else {
          setCurrentChapter(res);
        }
      } catch {
        const fallback: AiStoryResponse = {
          chapterNumber: safeIndex,
          chapterTitle: fallbackChapter.title,
          chapterNarrative: fallbackChapter.narrative,
          sensoryAtmosphere: fallbackChapter.atmosphere,
          storyEmoji: "Sun",
          choices: fallbackChapter.choices,
          isFinale: safeIndex >= totalChapters,
        };
        setCurrentChapter(fallback);
      } finally {
        setIsLoadingChapter(false);
      }
    },
    [patientId, storyData, totalChapters, locale]
  );

  const startStory = useCallback(
    (theme = themes[0]) => {
      playPress();
      setSelectedTheme(theme);
      setPhase("story");
      setChapterIndex(1);
      const nowIso = new Date().toISOString();
      setStartedAt(nowIso);
      setTaps(0);
      loadChapter(theme.title, 1);
    },
    [loadChapter, themes]
  );

  const handleChoice = useCallback(
    (choice: AiStoryChoice) => {
      setTaps((t) => t + 1);
      playCorrect();
      stopSpeaking();

      const nextIndex = chapterIndex + 1;
      setChapterIndex(nextIndex);

      if (nextIndex > totalChapters) {
        setTimeout(() => {
          playComplete();
          setPhase("done");
          if (startedAt) {
            recordGameSession(patientId, {
              gameId: "storybook",
              level,
              outcome: "completed",
              score: 100,
              startedAt,
              taps: taps + 1,
              errorCount: 0,
            });
          }
        }, 100);
      } else {
        loadChapter(selectedTheme.title, nextIndex, choice.label);
      }
    },
    [chapterIndex, loadChapter, patientId, level, selectedTheme.title, totalChapters, startedAt, taps]
  );

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "storybook",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const str = getGameStrings("storybook", locale);

  if (loading)
    return (
      <GameShell title={str.title} score={0}>
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title={str.title} score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  const ThemeIcon = selectedTheme.icon;

  return (
    <GameShell title={str.title} score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          {/* Government Paperclip Header */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                {str.title}
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-tea" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-amber-800 text-white shadow-[4px_4px_0px_#000]">
            <BookOpen className="h-10 w-10" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {str.introSubtitle}
            </p>
          </div>

          {/* Theme Selection Cards */}
          <div className="w-full max-w-md space-y-2.5 text-left">
            <span className="text-xs font-black uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
              <Compass className="h-3.5 w-3.5 text-tea" /> {storyData.ui.selectExpedition}
            </span>
            <div className="grid gap-2.5">
              {themes.map((theme) => {
                const IconComponent = theme.icon;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => startStory(theme)}
                    className="btn-tactile group flex items-center justify-between rounded-2xl border-3 border-black bg-surface p-3.5 text-left shadow-[3px_3px_0px_#000] hover:bg-tea-light hover:border-tea transition-transform active:translate-y-0.5 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-amber-100 text-ink shadow-sm">
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-ink">{theme.title}</p>
                        <p className="text-[11px] font-semibold text-ink-secondary leading-tight">
                          {theme.desc}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-tea font-black shrink-0" />
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

          <ChunkyButton variant="tea" size="xl" onClick={() => startStory(themes[0])}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "story" ? (
        <div className="flex flex-col items-center gap-4 py-1">
          {/* STORYBOOK CHAPTER STATUS */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-tea" />
              <span className="text-xs font-black text-ink truncate max-w-[220px]">
                {selectedTheme.title}
              </span>
            </div>
            <span className="text-[11px] font-bold text-ink-secondary">
              {storyData.ui.chapterOf(chapterIndex, totalChapters)}
            </span>
          </div>

          {/* LIVING BOOK OPEN SPREAD STAGE */}
          <div className="relative w-full max-w-md rounded-2xl border-3 border-black bg-[#FAF3E0] p-5 shadow-[5px_5px_0px_#000] text-left select-none overflow-hidden">
            {/* Book Spine Texture Ribbon */}
            <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-[#3D2B1F] border-r border-black" />

            <div className="pl-3">
              <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <ThemeIcon className="h-4 w-4 text-amber-900" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#3D2B1F]">
                    {currentChapter?.chapterTitle || storyData.ui.chapterHeading(chapterIndex, "")}
                  </span>
                </div>
                {isLoadingChapter && (
                  <span className="text-[10px] font-bold text-ink-secondary animate-pulse">
                    {storyData.ui.generating}
                  </span>
                )}
              </div>

              {/* Narrative Text */}
              <p className="font-serif text-sm sm:text-base font-bold text-[#2A1D15] leading-relaxed">
                &ldquo;{currentChapter?.chapterNarrative}&rdquo;
              </p>

              {/* Sensory Atmosphere Badge */}
              {currentChapter?.sensoryAtmosphere && (
                <div className="mt-3.5 rounded-xl bg-[#EFE3C3] p-2.5 border-2 border-black/20 text-xs font-bold text-[#4A3324] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-800 shrink-0" />
                  <span>{currentChapter.sensoryAtmosphere}</span>
                </div>
              )}

              {/* Read Aloud Button */}
              <div className="mt-4 flex items-center justify-start pt-2 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => speak(currentChapter?.chapterNarrative || "", locale, rate)}
                  className="group flex items-center gap-1.5 rounded-xl border-2 border-tea bg-tea-light px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-tea hover:text-white transition-all cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{storyData.ui.listenChapter}</span>
                </button>
              </div>
            </div>
          </div>

          {/* BRANCHING DECISION CHOICES */}
          <div className="w-full max-w-md space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-ink-secondary flex items-center gap-1">
              <Compass className="h-3.5 w-3.5 text-tea" /> {storyData.ui.pathQuestion}
            </span>
            <div className="grid gap-2.5">
              {currentChapter?.choices.map((choice) => (
                <button
                  key={choice.id}
                  type="button"
                  disabled={isLoadingChapter}
                  onClick={() => handleChoice(choice)}
                  className="btn-tactile group flex items-center justify-between rounded-2xl border-3 border-black bg-surface p-3.5 text-left shadow-[3px_3px_0px_#000] hover:bg-tea-light hover:border-tea transition-transform active:translate-y-0.5 cursor-pointer disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-amber-100 text-ink shadow-sm">
                      <Sun className="h-5 w-5" />
                    </div>
                    <p className="text-xs sm:text-sm font-extrabold text-ink">{choice.label}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-tea font-black shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration title={str.celebrationTitle}>
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {storyData.ui.concluded}
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-tea text-white px-2 py-0.5">
                  {storyData.ui.score}
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                {str.celebrationTitle}
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1 leading-relaxed">
                {str.celebrationSubtitle}
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-xs font-black">{storyData.ui.playMelody}</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  {storyData.ui.journeyComplete}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={() => setPhase("intro")}>
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
