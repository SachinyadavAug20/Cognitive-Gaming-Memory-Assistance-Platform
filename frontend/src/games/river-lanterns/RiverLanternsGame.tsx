"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Sparkles,
  Camera,
  RotateCcw,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Music,
  Waves,
  Volume2,
  Hand,
  ArrowRight,
  Heart,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete, playLifeSong } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { OpticalMotionTracker, type MotionEvent } from "@/lib/vision";
import { RiverScene3D, type RiverTarget } from "./RiverScene3D";
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
        bgColor="bg-teal-800"
        gameId="river-lanterns"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

interface LanternI18nEntry {
  fallbacks: RiverTarget[];
  howToPlayTitle: string;
  step1: string;
  step2: string;
  step3: string;
  progress: (curr: number, total: number) => string;
  illuminated: (count: number, total: number) => string;
  targetBadge: (name: string, relation: string) => string;
  rippleCast: string;
  visionActive: string;
  tapToCatch: string;
  catchButton: (name: string) => string;
  disableCamera: string;
  enableCamera: string;
  voiceGuidance: string;
  lanternIlluminated: string;
  hearStory: string;
  nextLantern: string;
  completeCeremony: string;
  archiveTitle: string;
  allGathered: string;
  playFlute: string;
  ceremonyComplete: string;
  audioPrompt1: (name: string) => string;
  audioCaught: (name: string, notes: string) => string;
  audioNext: (name: string) => string;
  audioGuide: (name: string) => string;
}

const LANTERNS_I18N: Record<SupportedLocale, LanternI18nEntry> = {
  as: {
    fallbacks: [
      { id: "f1", name: "মানস বৰা", relationOrType: "ল'ৰা", photoUrl: "/photos/manash.png", notes: "আপোনাৰ মৰমৰ ডাঙৰ পুত্ৰ, যিয়ে আপোনাক গুৱাহাটীত সন্ধিয়া চাহ খাবলৈ লৈ যায়।" },
      { id: "f2", name: "অনিতা বৰা", relationOrType: "পত্নী", photoUrl: "/photos/anita.png", notes: "আপোনাৰ আজীৱন সংগী, যিয়ে সুস্বাদু পিঠা আৰু এলাচী চাহ তৈয়াৰ কৰে।" },
      { id: "f3", name: "গুৱাহাটীৰ পৈতৃক ঘৰ", relationOrType: "ঘৰ", photoUrl: "/photos/home.png", notes: "মহাবাহু ব্ৰহ্মপুত্ৰৰ পাৰত থকা আপোনাৰ শান্তিময় বাগিচাৰে ভৰা ঘৰ।" },
    ],
    howToPlayTitle: "কেনেকৈ খেলিব (অতি সহজ):",
    step1: "ব্ৰহ্মপুত্ৰৰ পানীত সোণালী চাকিবোৰ ধীৰে ধীৰে ওপঙি থকা চাওক।",
    step2: "পানীত বা ওপঙি থকা চাকিত টিপক, নাইবা তলৰ ডাঙৰ বুটামত টিপক।",
    step3: "পৰিয়ালৰ মৰমৰ ছবি আৰু পুৰণি মিঠা স্মৃতিবোৰ স্মৰণ কৰক।",
    progress: (c, t) => `চাকি ${c} / ${t}`,
    illuminated: (c, t) => `${c}/${t} আলোকিত`,
    targetBadge: (n, r) => `লক্ষ্য: ${n} (${r})`,
    rippleCast: "ঢৌ উঠিল",
    visionActive: "কেমেৰা সক্ৰিয়",
    tapToCatch: "ওপঙা চাকি ধৰিবলৈ টিপক:",
    catchButton: (n) => `${n}ৰ স্মৃতি চাকি ধৰক`,
    disableCamera: "কেমেৰা বন্ধ কৰক",
    enableCamera: "ঐচ্ছিক: কেমেৰাৰ সন্মুখত হাত লৰাওক",
    voiceGuidance: "শব্দৰ নিৰ্দেশনা",
    lanternIlluminated: "স্মৃতিৰ চাকি পোহৰ হৈ উঠিল",
    hearStory: "কাহিনী শুনক",
    nextLantern: "পৰৱৰ্তী স্মৃতি চাকি",
    completeCeremony: "অনুষ্ঠান সম্পূৰ্ণ কৰক",
    archiveTitle: "৩ডি চাকি সংগ্ৰহালয়",
    allGathered: "সকলো স্মৃতিৰ চাকি একত্ৰিত কৰা হ'ল",
    playFlute: "বাঁহীৰ সুৰ শুনক",
    ceremonyComplete: "স্মৃতি অনুষ্ঠান সমাপ্ত",
    audioPrompt1: (n) => `ব্ৰহ্মপুত্ৰ নদীলৈ স্বাগতম। পাৰত ওপঙি থকা সোণালী চাকিটো স্পৰ্শ কৰি ${n}ৰ স্মৃতি জগাই তোলক।`,
    audioCaught: (n, notes) => `আপুনি ${n}ৰ চাকিটো ধৰিলে! ${notes}`,
    audioNext: (n) => `অতি সুন্দৰ! এতিয়া ${n}ৰ সোণালী চাকিটো স্পৰ্শ কৰক।`,
    audioGuide: (n) => `পানীত স্পৰ্শ কৰক বা হালধীয়া বুটামত টিপি ${n}ৰ চাকিটো ধৰক।`,
  },
  hi: {
    fallbacks: [
      { id: "f1", name: "मानस बोरा", relationOrType: "बेटा", photoUrl: "/photos/manash.png", notes: "आपका प्रिय बड़ा बेटा, जो आपको गुवाहाटी में शाम की चाय की सैर पर ले जाता है।" },
      { id: "f2", name: "अनीता बोरा", relationOrType: "पत्नी", photoUrl: "/photos/anita.png", notes: "आपकी जीवन संगिनी, जो आपके लिए ताज़ा पीठा और इलायची वाली चाय बनाती हैं।" },
      { id: "f3", name: "गुवाहाटी का पैतृक घर", relationOrType: "घर", photoUrl: "/photos/home.png", notes: "ब्रह्मपुत्र नदी के किनारे बसा आपका शांत और सुंदर घर।" },
    ],
    howToPlayTitle: "कैसे खेलें (बहुत आसान):",
    step1: "ब्रह्मपुत्र की लहरों पर तैरते सुनहरे दीयों को ध्यान से देखें।",
    step2: "पानी पर, तैरते दीये पर या नीचे दिए गए बड़े बटन पर टैप करें।",
    step3: "परिवार की प्यारी तस्वीरों और सुखद यादों को फिर से जिएं।",
    progress: (c, t) => `दीपक ${c} / ${t}`,
    illuminated: (c, t) => `${c}/${t} प्रज्वलित`,
    targetBadge: (n, r) => `लक्ष्य: ${n} (${r})`,
    rippleCast: "लहर बनी",
    visionActive: "कैमरा सक्रिय",
    tapToCatch: "तैरता दीया पकड़ने के लिए टैप करें:",
    catchButton: (n) => `${n} का स्मृति दीया पकड़ें`,
    disableCamera: "कैमरा बंद करें",
    enableCamera: "वैकल्पिक: कैमरे के सामने हाथ हिलाएं",
    voiceGuidance: "ध्वनि मार्गदर्शन",
    lanternIlluminated: "स्मृति का दीया प्रज्वलित हुआ",
    hearStory: "कहानी सुनें",
    nextLantern: "अगला स्मृति दीया",
    completeCeremony: "समारोह पूरा करें",
    archiveTitle: "3D दीया संग्रह",
    allGathered: "सभी स्मृति दीये एकत्रित हो गए",
    playFlute: "बांसुरी की धुन सुनें",
    ceremonyComplete: "समारोह संपन्न",
    audioPrompt1: (n) => `ब्रह्मपुत्र नदी में आपका स्वागत है। किनारे पर तैरते सुनहरे दीये को छूकर ${n} की यादों को जगाएं।`,
    audioCaught: (n, notes) => `आपने ${n} का दीया पकड़ लिया! ${notes}`,
    audioNext: (n) => `बहुत बढ़िया! अब ${n} का सुनहरा दीया छुएं।`,
    audioGuide: (n) => `पानी पर टैप करें या पीले बटन को दबाकर ${n} का दीया पकड़ें।`
  },
  en: {
    fallbacks: [
      { id: "f1", name: "Manash Borah", relationOrType: "Son", photoUrl: "/photos/manash.png", notes: "Your loving eldest son who takes you for evening tea walks in Guwahati." },
      { id: "f2", name: "Anita Borah", relationOrType: "Wife", photoUrl: "/photos/anita.png", notes: "Your devoted life companion who loves preparing fresh Pitha and morning cardamom tea." },
      { id: "f3", name: "Guwahati Ancestral Home", relationOrType: "Home", photoUrl: "/photos/home.png", notes: "Your peaceful garden home near the banks of the mighty Brahmaputra river." },
    ],
    howToPlayTitle: "How to Play (Very Easy):",
    step1: "Watch the glowing golden lanterns float gently along the Brahmaputra river.",
    step2: "Tap the water, tap the floating lantern, or press the big button below.",
    step3: "Reconnect with warm family photos and hear peaceful memories.",
    progress: (c, t) => `Progress: Lantern ${c} of ${t}`,
    illuminated: (c, t) => `${c}/${t} Illuminated`,
    targetBadge: (n, r) => `Target: ${n} (${r})`,
    rippleCast: "Ripple Cast",
    visionActive: "Vision Active",
    tapToCatch: "Tap to Catch Floating Lantern:",
    catchButton: (n) => `Catch ${n}'s Memory Lantern`,
    disableCamera: "Disable Camera Wave",
    enableCamera: "Optional: Wave Hand at Camera",
    voiceGuidance: "Voice Guidance",
    lanternIlluminated: "Lantern Memory Illuminated",
    hearStory: "Hear Story",
    nextLantern: "Next Memory Lantern",
    completeCeremony: "Complete Ceremony",
    archiveTitle: "3D Lantern Archive",
    allGathered: "All Memory Lanterns Gathered",
    playFlute: "Play Folk Flute",
    ceremonyComplete: "Ceremony Complete",
    audioPrompt1: (n) => `Welcome to the Brahmaputra River. Touch the glowing golden lantern floating near the shore to bring back your memories with ${n}.`,
    audioCaught: (n, notes) => `You caught ${n}'s lantern! ${notes}`,
    audioNext: (n) => `Wonderful! Now touch the glowing lantern for ${n}.`,
    audioGuide: (n) => `Touch the water or press the yellow button to catch ${n}'s lantern.`,
  },
  bn: {
    fallbacks: [
      { id: "f1", name: "মানস বোরা", relationOrType: "ছেলে", photoUrl: "/photos/manash.png", notes: "আপনার স্নেহের জ্যেষ্ঠ পুত্র, যিনি আপনাকে গুয়াহাটিতে বৈকালিক চায়ের ভ্রমণে নিয়ে যান।" },
      { id: "f2", name: "অনিতা বোরা", relationOrType: "স্ত্রী", photoUrl: "/photos/anita.png", notes: "আপনার জীবনসঙ্গিনী, যিনি সুস্বাদু পিঠে ও এলাচ চা তৈরি করেন।" },
      { id: "f3", name: "গুয়াহাটির পৈতৃক ভিটে", relationOrType: "বাড়ি", photoUrl: "/photos/home.png", notes: "মহাবাহু ব্রহ্মপুত্রের তীরে অবস্থিত আপনার শান্তিময় বাগানবাড়ি।" },
    ],
    howToPlayTitle: "কীভাবে খেলবেন (খুব সহজ):",
    step1: "ব্রহ্মপুত্রের জলে ভাসমান সোনালী প্রদীপগুলো দেখুন।",
    step2: "জলে বা ভাসমান প্রদীপে স্পর্শ করুন, অথবা নিচের বড় বোতামটি টিপুন।",
    step3: "পরিবারের মধুর ছবি ও স্মৃতিগুলো পুনরায় অনুভব করুন।",
    progress: (c, t) => `প্রদীপ ${c} / ${t}`,
    illuminated: (c, t) => `${c}/${t} প্রজ্জ্বলিত`,
    targetBadge: (n, r) => `উদ্দেশ্য: ${n} (${r})`,
    rippleCast: "তরঙ্গ সৃষ্টি",
    visionActive: "ক্যামেরা সক্রিয়",
    tapToCatch: "ভাসমান প্রদীপ ধরতে চাপুন:",
    catchButton: (n) => `${n}-এর স্মৃতি প্রদীপ ধরুন`,
    disableCamera: "ক্যামেরা বন্ধ করুন",
    enableCamera: "ঐচ্ছিক: ক্যামেরায় হাত নাড়ান",
    voiceGuidance: "কণ্ঠ নির্দেশিকা",
    lanternIlluminated: "স্মৃতির প্রদীপ উদ্ভাসিত",
    hearStory: "স্মৃতি শুনুন",
    nextLantern: "পরবর্তী স্মৃতি প্রদীপ",
    completeCeremony: "অনুষ্ঠান সম্পন্ন করুন",
    archiveTitle: "৩ডি প্রদীপ সংগ্রহ",
    allGathered: "সকল স্মৃতি প্রদীপ সংগৃহীত",
    playFlute: "বাঁশির সুর শুনুন",
    ceremonyComplete: "অনুষ্ঠান সমাপ্ত",
    audioPrompt1: (n) => `ব্রহ্মপুত্র নদীতে স্বাগতম। তীরের কাছে ভাসমান সোনালী প্রদীপটি স্পর্শ করে ${n}-এর স্মৃতি মনে করুন।`,
    audioCaught: (n, notes) => `আপনি ${n}-এর প্রদীপটি ধরলেন! ${notes}`,
    audioNext: (n) => `চমৎকার! এবার ${n}-এর সোনালী প্রদীপটি স্পর্শ করুন।`,
    audioGuide: (n) => `জলে স্পর্শ করুন বা হলুদ বোতাম চেপে ${n}-এর প্রদীপ ধরুন।`,
  },
  mr: {
    fallbacks: [
      { id: "f1", name: "मानस बोरा", relationOrType: "मुलगा", photoUrl: "/photos/manash.png", notes: "तुमचा लाडका मोठा मुलगा, जो तुम्हाला संध्याकाळी गुवाहाटीमध्ये चहाच्या फेरीसाठी घेऊन जातो." },
      { id: "f2", name: "अनिता बोरा", relationOrType: "पत्नी", photoUrl: "/photos/anita.png", notes: "तुमची प्रेमळ जीवनसाथी, जी चवदार पिठा आणि वेलची चहा बनवते." },
      { id: "f3", name: "गुवाहाटीचे वडिलोपार्जित घर", relationOrType: "घर", photoUrl: "/photos/home.png", notes: "ब्रह्मपुत्रा नदीकाठचे तुमचे शांत आणि सुंदर घराणे." },
    ],
    howToPlayTitle: "कसे खेळायचे (अतिशय सोपे):",
    step1: "ब्रह्मपुत्रेच्या पाण्यावर तरंगणारे सोनेरी दिवे पाहा.",
    step2: "पाण्यावर, तरंगत्या दिव्यावर किंवा खालच्या मोठ्या बटनावर टॅप करा.",
    step3: "कुटुंबाच्या सुंदर आठवणी आणि छायाचित्रे पुन्हा अनुभवा.",
    progress: (c, t) => `दिवा ${c} / ${t}`,
    illuminated: (c, t) => `${c}/${t} प्रज्वलित`,
    targetBadge: (n, r) => `लक्ष्य: ${n} (${r})`,
    rippleCast: "लाट उमटली",
    visionActive: "कॅमेरा सुरू",
    tapToCatch: "तरंगता दिवा पकडण्यासाठी टॅप करा:",
    catchButton: (n) => `${n} चा आठवणींचा दिवा पकडा`,
    disableCamera: "कॅमेरा बंद करा",
    enableCamera: "पर्यायी: कॅमेऱ्यासमोर हात हलवा",
    voiceGuidance: "आवाज मार्गदर्शन",
    lanternIlluminated: "आठवणींचा दिवा उजळला",
    hearStory: "कथा ऐका",
    nextLantern: "पुढील आठवणींचा दिवा",
    completeCeremony: "सोहळा पूर्ण करा",
    archiveTitle: "3D दिवा संग्रह",
    allGathered: "सर्व आठवणींचे दिवे गोळा झाले",
    playFlute: "बासरीचे सूर ऐका",
    ceremonyComplete: "सोहळा संपन्न",
    audioPrompt1: (n) => `ब्रह्मपुत्रा नदीवर स्वागत आहे. किनाऱ्याजवळचा सोनेरी दिवा स्पर्शून ${n} च्या आठवणी जाग्या करा.`,
    audioCaught: (n, notes) => `तुम्ही ${n} चा दिवा पकडला! ${notes}`,
    audioNext: (n) => `छान! आता ${n} चा सोनेरी दिवा स्पर्श करा.`,
    audioGuide: (n) => `पाण्यावर टॅप करा किंवा पिवळे बटण दाबून ${n} चा दिवा पकडा.`,
  },
  ne: {
    fallbacks: [
      { id: "f1", name: "मानस बोरा", relationOrType: "छोरा", photoUrl: "/photos/manash.png", notes: "तपाईंको प्यारो जेठो छोरा, जसले तपाईंलाई साँझ गुवाहाटीमा चिया पिउन लैजान्छ।" },
      { id: "f2", name: "अनिता बोरा", relationOrType: "पत्नी", photoUrl: "/photos/anita.png", notes: "तपाईंको जीवनसाथी, जसले स्वादिष्ट पिठा र अलैंची चिया बनाउँछिन्।" },
      { id: "f3", name: "गुवाहाटीको पुर्ख्यौली घर", relationOrType: "घर", photoUrl: "/photos/home.png", notes: "ब्रह्मपुत्र नदीको किनारमा रहेको तपाईंको शान्त घर।" },
    ],
    howToPlayTitle: "कसरी खेल्ने (धेरै सजिलो):",
    step1: "ब्रह्मपुत्र नदीमा तैरिरहेका चम्किला सुनौला बत्तीहरू हेर्नुहोस्।",
    step2: "पानीमा, तैरिरहेको बत्तीमा वा तलको ठूलो बटनमा ट्याप गर्नुहोस्।",
    step3: "परिवारका पुराना तस्बिरहरू र मीठा सम्झनाहरू पुनः ताजा गर्नुहोस्।",
    progress: (c, t) => `बत्ती ${c} / ${t}`,
    illuminated: (c, t) => `${c}/${t} प्रज्वलित`,
    targetBadge: (n, r) => `लक्ष्य: ${n} (${r})`,
    rippleCast: "छाल उठ्यो",
    visionActive: "क्यामेरा सक्रिय",
    tapToCatch: "तैरिरहेको बत्ती समात्न ट्याप गर्नुहोस्:",
    catchButton: (n) => `${n} को सम्झना बत्ती समात्नुहोस्`,
    disableCamera: "क्यामेरा बन्द गर्नुहोस्",
    enableCamera: "वैकल्पिक: क्यामेरामा हात हल्लाउनुहोस्",
    voiceGuidance: "आवाज निर्देशन",
    lanternIlluminated: "सम्झनाको बत्ती प्रज्वलित भयो",
    hearStory: "कथा सुन्नुहोस्",
    nextLantern: "अर्को सम्झना बत्ती",
    completeCeremony: "समारोह सम्पन्न गर्नुहोस्",
    archiveTitle: "३डी बत्ती सङ्ग्रह",
    allGathered: "सबै सम्झना बत्तीहरू संकलित भए",
    playFlute: "बाँसुरीको धुन सुन्नुहोस्",
    ceremonyComplete: "समारोह समाप्त",
    audioPrompt1: (n) => `ब्रह्मपुत्र नदीमा स्वागत छ। किनारमा तैरिरहेको सुनौलो बत्ती छोएर ${n} को सम्झना ताजा गर्नुहोस्।`,
    audioCaught: (n, notes) => `तपाईंले ${n} को बत्ती समात्नुभयो! ${notes}`,
    audioNext: (n) => `धेरै राम्रो! अब ${n} को सुनौलो बत्ती छुनुहोस्।`,
    audioGuide: (n) => `पानीमा ट्याप गर्नुहोस् वा पहेँलो बटन थिचेर ${n} को बत्ती समात्नुहोस्।`,
  },
  mni: {
    fallbacks: [
      { id: "f1", name: "মানস বোরা", relationOrType: "মচানুপা", photoUrl: "/photos/manash.png", notes: "অদোমগী নুংশিবা অহানবা মচানুপা, মহাক্না অদোমবু নুমিদাংৱাই চাগী চৎমিন্নৈ।" },
      { id: "f2", name: "অনিতা বোরা", relationOrType: "নুপী", photoUrl: "/photos/anita.png", notes: "অদোমগী পুনশিগী লোইনবী, মহাক্না হাৱা পিথা অমসুং এলাচি চা শেম্বী।" },
      { id: "f3", name: "গুৱাহাতীগী য়ুম", relationOrType: "য়ুম", photoUrl: "/photos/home.png", notes: "ব্রহ্মপুত্র তুরেলগী তোর্বান্দা লৈবা অদোমগী শান্তিগী য়ুম।" },
    ],
    howToPlayTitle: "কমদৌনা শানাগনি (য়াম্না লাইবা):",
    step1: "ব্রহ্মপুত্র তুরেলদা তিংশিল্লকপা সনাগী থাউমৈশিং য়েংবীয়ু।",
    step2: "ঈশিংদা, থাউমৈদা নত্রগা মখাগী চাউবা বটনদা নম্বীয়ু।",
    step3: "ইমুংগী নুংশিরবা শক্তম অমসুং নীংশিংবা ৱাফমশিং উবীয়ু।",
    progress: (c, t) => `থাউমৈ ${c} / ${t}`,
    illuminated: (c, t) => `${c}/${t} মঙাল খাইরে`,
    targetBadge: (n, r) => `পান্দম: ${n} (${r})`,
    rippleCast: "ঈপাক থোক্লে",
    visionActive: "কেমেরা এক্তিব",
    tapToCatch: "থাউমৈ ফাবগীদমক নম্বীয়ু:",
    catchButton: (n) => `${n}গী নীংশিং থাউমৈ ফাবীয়ু`,
    disableCamera: "কেমেরা লেপহন্নবা",
    enableCamera: "কেমেরাদা খুৎ নুংশিবীয়ু",
    voiceGuidance: "খোন্থোক লমজিং",
    lanternIlluminated: "নীংশিংবা থাউমৈ মঙাল খাইরে",
    hearStory: "ৱারী তাবীয়ু",
    nextLantern: "মথংগী নীংশিং থাউমৈ",
    completeCeremony: "থাউমৈ থৌরম লোইশিনবীয়ু",
    archiveTitle: "৩ডি থাউমৈ খোমজিনবা",
    allGathered: "নীংশিং থাউমৈ পুম্নমক খোমজিনখ্রে",
    playFlute: "তুলিবাবু শুনবীয়ু",
    ceremonyComplete: "থৌরম লোইরে",
    audioPrompt1: (n) => `ব্রহ্মপুত্র তুরেলদা তরাম্না ওকচরি। সনাগী থাউমৈদা নম্বীয়ু অমসুং ${n}বু নীংশিংবীয়ু।`,
    audioCaught: (n, notes) => `অদোম্না ${n}গী থাউমৈ ফারবনি! ${notes}`,
    audioNext: (n) => `য়াম্না ফরে! হৌজিক ${n}গী সনাগী থাউমৈদা নম্বীয়ু।`,
    audioGuide: (n) => `ঈশিংদা নত্রগা য়ালো বটনদা নম্বীয়ু অমসুং ${n}গী থাউমৈ ফাবীয়ু।`,
  },
  brx: {
    fallbacks: [
      { id: "f1", name: "मानास बरा", relationOrType: "फिसाज्ला", photoUrl: "/photos/manash.png", notes: "नोंथांनि अनसुला गिबि फिसाज्ला, जाय नोंथांखौ गवाहाटियाव साहा लोंनो लाङो।" },
      { id: "f2", name: "अनिता बरा", relationOrType: "बिसि", photoUrl: "/photos/anita.png", notes: "नोंथांनि जिउ-लारु, जाय गोथाव पिथा आरो एलाइसि साहा बानायो।" },
      { id: "f3", name: "गवाहाटिनि नो", relationOrType: "नो", photoUrl: "/photos/home.png", notes: "ब्रह्मपुत्र दैमानि सेराव थानाय नोंथांनि गोजोनै थानाय नो।" },
    ],
    howToPlayTitle: "माबोरै गेलेनांगौ (जोबोर गोरलै):",
    step1: "ब्रह्मपुत्र दैमायाव गोजावबाय थानाय सनानि बाथि बाथि मोखांफोरखौ नाय।",
    step2: "दैयाव, बाथियाव एबा गाहायनि गेदेर बुथामाव थु।",
    step3: "नख'रनि मोजां सावगारिफोर आरो गोसोखांफोरखौ मोनफिन।",
    progress: (c, t) => `बाथि ${c} / ${t}`,
    illuminated: (c, t) => `${c}/${t} सोरां जाबाय`,
    targetBadge: (n, r) => `थांखि: ${n} (${r})`,
    rippleCast: "दै ओंखारबाय",
    visionActive: "केमेरा सालायबाय",
    tapToCatch: "गोजावनाय बाथि हमनो थु:",
    catchButton: (n) => `${n} नि गोसोखां बाथि हम`,
    disableCamera: "केमेरा बन्द खालाम",
    enableCamera: "केमेरायाव आखाइ दैखां",
    voiceGuidance: "रावजों दिन्थिनाय",
    lanternIlluminated: "गोसोखां बाथिया सोरां जाबाय",
    hearStory: "खोनथा खोनासं",
    nextLantern: "उनाव थानाय गोसोखां बाथि",
    completeCeremony: "हाबाफारिखौ जोबनाय खालाम",
    archiveTitle: "3D बाथि थुमनाय",
    allGathered: "गासै गोसोखां बाथि थुमबाय",
    playFlute: "सिफुं दाम",
    ceremonyComplete: "हाबाफारि जोबबाय",
    audioPrompt1: (n) => `ब्रह्मपुत्र दैमायाव बरायबाय। सनानि बाथियाव थु आरो ${n} खौ गोसोखां।`,
    audioCaught: (n, notes) => `नोंथाङा ${n} नि बाथिखौ हमबाय! ${notes}`,
    audioNext: (n) => `जोबोर मोजां! दा ${n} नि बाथियाव थु।`,
    audioGuide: (n) => `दैयाव एबा गोमो बुथामाव थु आरो ${n} नि बाथि हम।`
  },
  grt: {
    fallbacks: [
      { id: "f1", name: "Manash Borah", relationOrType: "Depante", photoUrl: "/photos/manash.png", notes: "Nang'ko pring-waltim cha ringna Guwahati-ona rimbagipa depante." },
      { id: "f2", name: "Anita Borah", relationOrType: "Jik", photoUrl: "/photos/anita.png", notes: "Nang'ni janggina ripeng, nama pitha aro cha ding'ko dakgipa." },
      { id: "f3", name: "Guwahati Nok", relationOrType: "Nok", photoUrl: "/photos/home.png", notes: "Brahmaputra chibima rikamni rongtal-tom'toma nok." },
    ],
    howToPlayTitle: "Maikai Kal'na (Rongtal Begang):",
    step1: "Brahmaputra chio sona baidomko balchokako nibo.",
    step2: "Chio, baidomo ba ka'mani dal'gipa button-o nang'atbo.",
    step3: "Nokdangni photo aro gisik ra'aniko man'pilbo.",
    progress: (c, t) => `Baidom ${c} / ${t}`,
    illuminated: (c, t) => `${c}/${t} Teng'sokgimin`,
    targetBadge: (n, r) => `Miksongani: ${n} (${r})`,
    rippleCast: "Chiboko chipit",
    visionActive: "Camera donga",
    tapToCatch: "Baidomko rim'na jotbo:",
    catchButton: (n) => `${n} ni Gisik Ra'ani Baidomko Rim'bo`,
    disableCamera: "Camerako chipbo",
    enableCamera: "Camera-ona jak wetwetbo",
    voiceGuidance: "Ku'rang Gital",
    lanternIlluminated: "Gisik Ra'ani Teng'sokaha",
    hearStory: "Golpoko knabo",
    nextLantern: "Gipin Gisik Ra'ani Baidom",
    completeCeremony: "Maniako Matchotbo",
    archiveTitle: "3D Baidom Chimongani",
    allGathered: "Pilak Baidomko Rim'manaha",
    playFlute: "Bangsi Siko Knabo",
    ceremonyComplete: "Maniako Matchotaha",
    audioPrompt1: (n) => `Brahmaputra Chibimaona rimnapbeani. Sonani baidomko nang'atbo aro ${n} ko gisik ra'bo.`,
    audioCaught: (n, notes) => `Na'a ${n} ni baidomko rim'aha! ${notes}`,
    audioNext: (n) => `Nama! Da'o ${n} ni sonani baidomko nang'atbo.`,
    audioGuide: (n) => `Chio nang'atbo ba rimit button-ko sin'e ${n} ni baidomko rim'bo.`
  },
  kha: {
    fallbacks: [
      { id: "f1", name: "Manash Borah", relationOrType: "Khun Shynrang", photoUrl: "/photos/manash.png", notes: "U khun rangbah uba ieit, uba ju ialam ia phi sha dukan sha ha Guwahati." },
      { id: "f2", name: "Anita Borah", relationOrType: "Lok", photoUrl: "/photos/anita.png", notes: "Ka lok kaba ieit, kaba shet ia ki kpu pitha bad shaha." },
      { id: "f3", name: "Iing Thymmai Guwahati", relationOrType: "Iing", photoUrl: "/photos/home.png", notes: "Ka iing kaba shongsuk ha rud Wah Brahmaputra." },
    ],
    howToPlayTitle: "Kumno ban ialeh (Kaba jem bha):",
    step1: "Peit ia ki sharak ksiar kiba per suki ha Wah Brahmaputra.",
    step2: "Tba ia ka um, ia ka sharak lane shon ia u button heh.",
    step3: "Kynmaw biang ia ki dur jong kiba ieit bad ki kyntien kiba bang.",
    progress: (c, t) => `Sharak ${c} / ${t}`,
    illuminated: (c, t) => `${c}/${t} Kiba Tyngshaiñ`,
    targetBadge: (n, r) => `Thong: ${n} (${r})`,
    rippleCast: "Kyllon ka um",
    visionActive: "Camera ka trei",
    tapToCatch: "Shon ban kem ia ka sharak:",
    catchButton: (n) => `Kem ia ka Sharak Jingkynmaw jong u/ka ${n}`,
    disableCamera: "Khang ia ka Camera",
    enableCamera: "Kynroi kti sha Camera",
    voiceGuidance: "Jingpynshai da ka Sur",
    lanternIlluminated: "Sharak Jingkynmaw ka lah Tyngshaiñ",
    hearStory: "Sngap ia ka Jingiathuhkhana",
    nextLantern: "Ka Sharak Jingkynmaw kaba bud",
    completeCeremony: "Pynkut ia ka Lehñiam",
    archiveTitle: "3D Sharak Kynmaw",
    allGathered: "La lum lang ia baroh ki Sharak",
    playFlute: "Put Besli",
    ceremonyComplete: "Ka Lehñiam ka la kut",
    audioPrompt1: (n) => `Pdiang sngewbha sha Wah Brahmaputra. Tba ia ka sharak ksiar ban kynmaw ia ${n}.`,
    audioCaught: (n, notes) => `Phi la kem ia ka sharak jong u/ka ${n}! ${notes}`,
    audioNext: (n) => `Kaba bha shisha! Mynta tba ia ka sharak ksiar jong ${n}.`,
    audioGuide: (n) => `Tba ia ka um lane shon ia u button stem ban kem ia ka sharak jong ${n}.`
  },
  lus: {
    fallbacks: [
      { id: "f1", name: "Manash Borah", relationOrType: "Fapa", photoUrl: "/photos/manash.png", notes: "I fapa upa ber, Guwahati khawpui a thingpui in tura hruai thin tu che." },
      { id: "f2", name: "Anita Borah", relationOrType: "Nupui", photoUrl: "/photos/anita.png", notes: "I kawppui rinawm, chhang thlum leh thingpui tui tak siam thin tu." },
      { id: "f3", name: "Guwahati In", relationOrType: "In", photoUrl: "/photos/home.png", notes: "Brahmaputra lui kam a in nuam leh hahdam tak." },
    ],
    howToPlayTitle: "Engtin nge khelh tur (A awlsam lutuk):",
    step1: "Brahmaputra lui a khawnvar rangkachak eng mawi tak lo langte chu en rawh.",
    step2: "Tui khawih la, khawnvar hmet la, a nih loh leh a hnuai a button lian hmet rawh.",
    step3: "Chhungkaw thlalak mawi tak leh hriatrengna hlu takte chhar thar leh rawh.",
    progress: (c, t) => `Khawnvar ${c} / ${t}`,
    illuminated: (c, t) => `${c}/${t} Tihengin`,
    targetBadge: (n, r) => `Tum: ${n} (${r})`,
    rippleCast: "Tui fawn vel",
    visionActive: "Camera a nung",
    tapToCatch: "Khawnvar man turin hmet rawh:",
    catchButton: (n) => `${n} Hriatrengna Khawnvar Man Rawh`,
    disableCamera: "Camera tihtawp",
    enableCamera: "Camera hmaah kut vai rawh",
    voiceGuidance: "Aw rawngbawlna",
    lanternIlluminated: "Hriatrengna Khawnvar a eng ta",
    hearStory: "Thawnthu ngaithla rawh",
    nextLantern: "A dawt hriatrengna khawnvar",
    completeCeremony: "Kutpui tihtawpna",
    archiveTitle: "3D Khawnvar Dahkhawmna",
    allGathered: "Hriatrengna Khawnvar zawng zawng lakkhawm a ni ta",
    playFlute: "Hrawmchan Tum Rawh",
    ceremonyComplete: "Hun hman zawh a ni ta",
    audioPrompt1: (n) => `Brahmaputra lui ah kan lo lawm a che. Lui kam a khawnvar eng mawi tak khawih la ${n} hriatrengna chhar chhuak rawh.`,
    audioCaught: (n, notes) => `${n} khawnvar i man ta! ${notes}`,
    audioNext: (n) => `A tha lutuk! Tunah ${n} khawnvar eng mawi tak kha khawih leh rawh.`,
    audioGuide: (n) => `Tui khawih la emaw a eng button hmetin ${n} khawnvar man rawh.`
  },
};

export function RiverLanternsGame() {
  const locale = useLocale();
  const normLocale = (locale?.split("-")[0]?.toLowerCase() || "en") as SupportedLocale;
  const lanternUi = LANTERNS_I18N[normLocale] || LANTERNS_I18N.en;
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "river-lanterns", startLevel(detail));
  const rate = speechRate(detail);

  const targets: RiverTarget[] = useMemo(() => {
    if (!detail) return lanternUi.fallbacks;
    const list: RiverTarget[] = [];
    if (detail.familyMembers && detail.familyMembers.length > 0) {
      detail.familyMembers.forEach((m, idx) => {
        list.push({
          id: `fam-${m.id || idx}`,
          name: m.name,
          relationOrType: m.relation || "Family",
          photoUrl: m.photoUrl || (idx % 2 === 0 ? "/photos/manash.png" : "/photos/anita.png"),
          notes: m.notes || "A cherished member of your family.",
        });
      });
    }
    if (detail.familiarPlaces && detail.familiarPlaces.length > 0) {
      detail.familiarPlaces.forEach((p, idx) => {
        list.push({
          id: `place-${p.id || idx}`,
          name: p.name,
          relationOrType: "Place",
          photoUrl: p.photoUrl || "/photos/home.png",
          notes: p.description || "A peaceful place filled with warm memories.",
        });
      });
    }
    return list.length >= 2 ? list.slice(0, 3) : lanternUi.fallbacks;
  }, [detail, lanternUi.fallbacks]);

  const [phase, setPhase] = useState<"intro" | "river" | "done">("intro");
  const [currentTargetIndex, setCurrentTargetIndex] = useState(0);
  const [unlockedLanterns, setUnlockedLanterns] = useState<RiverTarget[]>([]);
  const [activeRevealedTarget, setActiveRevealedTarget] = useState<RiverTarget | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [motionCoords, setMotionCoords] = useState<{ x: number; y: number } | null>(null);
  const [motionDetected, setMotionDetected] = useState(false);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const currentTarget = targets[currentTargetIndex] || targets[0];
  const score = unlockedLanterns.length * 35;

  // Optical Motion Tracker
  useEffect(() => {
    let tracker: OpticalMotionTracker | null = null;

    if (cameraActive && phase === "river") {
      tracker = new OpticalMotionTracker((evt: MotionEvent) => {
        // 1:1 viewport reach across all corners
        if (evt.hasMotion) {
          setMotionCoords({ x: evt.x, y: evt.y });
          setMotionDetected(true);
          setTimeout(() => setMotionDetected(false), 300);
        }
      });
      tracker.start().then((started) => {
        if (!started) setCameraActive(false);
      });
    }

    return () => {
      if (tracker) tracker.stop();
    };
  }, [cameraActive, phase]);

  const startRiverGame = useCallback(() => {
    playPress();
    setPhase("river");
    setCurrentTargetIndex(0);
    setUnlockedLanterns([]);
    setActiveRevealedTarget(null);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    speak(
      lanternUi.audioPrompt1(targets[0]?.name || "your family"),
      locale,
      rate
    );
  }, [locale, rate, targets, lanternUi]);

  const handleSelectLantern = (target: RiverTarget) => {
    setTaps((t) => t + 1);
    stopSpeaking();
    playCorrect();

    setActiveRevealedTarget(target);
    if (!unlockedLanterns.some((l) => l.id === target.id)) {
      setUnlockedLanterns((prev) => [...prev, target]);
    }
    speak(lanternUi.audioCaught(target.name, target.notes), locale, rate);
  };

  const advanceNextTarget = () => {
    playPress();
    setActiveRevealedTarget(null);

    if (currentTargetIndex + 1 < targets.length) {
      const nextIdx = currentTargetIndex + 1;
      setCurrentTargetIndex(nextIdx);
      speak(lanternUi.audioNext(targets[nextIdx].name), locale, rate);
    } else {
      playComplete();
      setPhase("done");
      if (startedAt) {
        recordGameSession(patientId, {
          gameId: "river-lanterns",
          level,
          outcome: "completed",
          score: 100,
          startedAt,
          taps: taps + 1,
          errorCount: 0,
        });
      }
    }
  };

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "river-lanterns",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const str = getGameStrings("river-lanterns", locale);

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

  return (
    <GameShell title={str.title} score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          {/* Government Paperclip Header */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                {str.title}
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-teal-800" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-teal-800 text-white shadow-[4px_4px_0px_#000]">
            <Waves className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {str.introSubtitle}
            </p>
          </div>

          {/* Simple 3-Step Guide */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000] space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-teal-800 block">
              {lanternUi.howToPlayTitle}
            </span>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-800 text-white font-black text-xs shrink-0">1</span>
              <span>{lanternUi.step1}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-800 text-white font-black text-xs shrink-0">2</span>
              <span>{lanternUi.step2}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-800 text-white font-black text-xs shrink-0">3</span>
              <span>{lanternUi.step3}</span>
            </div>
          </div>

          <AudioPrompt
            text={str.audioPrompt}
            label={str.listenLabel}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startRiverGame}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "river" ? (
        <div className="flex flex-col items-center gap-4 py-1">
          {/* STEP PROGRESS BREADCRUMB */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-3 shadow-[4px_4px_0px_#000]">
            <div className="flex items-center justify-between text-xs font-black mb-2">
              <span className="text-teal-800 uppercase tracking-wider">
                {lanternUi.progress(currentTargetIndex + 1, targets.length)}
              </span>
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-teal-900 border border-teal-400 text-[10px]">
                {lanternUi.illuminated(unlockedLanterns.length, targets.length)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {targets.map((tgt, idx) => {
                const isCompleted = unlockedLanterns.some((l) => l.id === tgt.id);
                const isCurrent = idx === currentTargetIndex;
                return (
                  <button
                    key={tgt.id}
                    type="button"
                    onClick={() => {
                      setCurrentTargetIndex(idx);
                      handleSelectLantern(tgt);
                    }}
                    className={`flex items-center gap-1.5 p-1.5 rounded-xl border-2 text-[11px] font-black cursor-pointer transition-all ${
                      isCompleted
                        ? "bg-emerald-100 border-emerald-600 text-emerald-950"
                        : isCurrent
                        ? "bg-amber-100 border-amber-600 text-amber-950 shadow-sm animate-pulse"
                        : "bg-surface-muted border-black/20 text-ink-muted"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                    ) : (
                      <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black/10 text-[9px]">
                        {idx + 1}
                      </span>
                    )}
                    <span className="truncate">{tgt.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* THREE.JS 3D RIVER CANVAS WITH PULSING BEACON */}
          <div className="w-full max-w-md relative">
            <RiverScene3D
              targets={targets}
              activeTargetIndex={currentTargetIndex}
              motionCoords={motionCoords}
              onSelectTarget={handleSelectLantern}
            />

            {/* FLOATING HINT BADGE OVER RIVER */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
              <span className="rounded-xl border-2 border-black bg-white/90 backdrop-blur px-3 py-1 text-xs font-black text-ink shadow-[2px_2px_0px_#000] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-500 animate-spin" />
                {lanternUi.targetBadge(currentTarget.name, currentTarget.relationOrType)}
              </span>

              {cameraActive && (
                <span className={`rounded-xl border-2 border-black px-2.5 py-1 text-[10px] font-black shadow-[2px_2px_0px_#000] ${motionDetected ? "bg-teal-300 text-teal-950" : "bg-white/90 text-ink"}`}>
                  {motionDetected ? (
                    <span className="inline-flex items-center gap-1">
                      <Waves className="h-3 w-3 text-teal-950" />
                      <span>{lanternUi.rippleCast}</span>
                    </span>
                  ) : (
                    lanternUi.visionActive
                  )}
                </span>
              )}
            </div>
          </div>

          {/* GIANT HIGH-CONTRAST TACTILE CATCH BUTTON */}
          <div className="w-full max-w-md space-y-2.5">
            <button
              type="button"
              onClick={() => handleSelectLantern(currentTarget)}
              className="btn-tactile w-full flex items-center justify-center gap-3 rounded-2xl border-4 border-black bg-gradient-to-r from-amber-300 via-amber-200 to-amber-300 p-4 text-ink shadow-[6px_6px_0px_#000] hover:scale-[1.02] active:translate-y-1 transition-all cursor-pointer select-none"
            >
              <Hand className="h-6 w-6 text-amber-900 shrink-0" />
              <div className="text-left">
                <span className="text-xs font-black uppercase text-amber-950 block">
                  {lanternUi.tapToCatch}
                </span>
                <span className="font-serif text-lg font-black text-ink">
                  {lanternUi.catchButton(currentTarget.name)}
                </span>
              </div>
            </button>

            {/* Optional Camera Motion Toggle */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                onClick={() => setCameraActive(!cameraActive)}
                className="flex items-center gap-1 text-[11px] font-bold text-ink-secondary hover:text-ink cursor-pointer"
              >
                <Camera className="h-3.5 w-3.5" />
                <span>{cameraActive ? lanternUi.disableCamera : lanternUi.enableCamera}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  speak(
                    lanternUi.audioGuide(currentTarget.name),
                    locale,
                    rate
                  )
                }
                className="flex items-center gap-1 text-[11px] font-bold text-teal-800 hover:underline cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>{lanternUi.voiceGuidance}</span>
              </button>
            </div>
          </div>

          {/* REVEALED LANTERN MEMORY CAPSULE MODAL */}
          {activeRevealedTarget && (
            <div className="w-full max-w-md rounded-3xl border-4 border-black bg-surface p-5 shadow-[6px_6px_0px_#000] text-left animate-in fade-in zoom-in-95 duration-200 space-y-4">
              <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
                <span className="text-xs font-black uppercase text-teal-800 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-500" /> {lanternUi.lanternIlluminated}
                </span>
                <span className="text-xs font-black uppercase rounded-full bg-teal-100 text-teal-900 px-3 py-0.5 border border-teal-400 flex items-center gap-1">
                  <Heart className="h-3 w-3 text-rose-600 fill-rose-600" />
                  {activeRevealedTarget.relationOrType}
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeRevealedTarget.photoUrl}
                  alt={activeRevealedTarget.name}
                  className="h-20 w-20 rounded-2xl border-3 border-black object-cover shadow-[2px_2px_0px_#000] shrink-0"
                />
                <div>
                  <h3 className="font-serif text-xl font-black text-ink leading-tight">
                    {activeRevealedTarget.name}
                  </h3>
                  <p className="text-xs font-semibold text-ink-secondary mt-1.5 leading-relaxed">
                    {activeRevealedTarget.notes}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => speak(activeRevealedTarget.notes, locale, rate)}
                  className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000] cursor-pointer"
                >
                  <Volume2 className="h-4 w-4 text-teal-800" />
                  <span>{lanternUi.hearStory}</span>
                </button>

                <button
                  type="button"
                  onClick={advanceNextTarget}
                  className="btn-tactile flex items-center gap-2 rounded-xl border-2 border-black bg-tea px-5 py-2.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-800 cursor-pointer"
                >
                  <span>
                    {currentTargetIndex + 1 < targets.length ? lanternUi.nextLantern : lanternUi.completeCeremony}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title={str.celebrationTitle}
          subtitle={str.celebrationSubtitle}
          xpEarned={120}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {lanternUi.archiveTitle}
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-teal-800 text-white px-2 py-0.5">
                  {unlockedLanterns.length} {str.hudProgress}
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                {lanternUi.allGathered}
              </h3>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5 border-t border-black/10 pt-3">
                {unlockedLanterns.map((l, i) => (
                  <div key={i} className="flex items-center gap-2.5 rounded-xl border-2 border-black bg-white p-2 shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.photoUrl} alt={l.name} className="h-10 w-10 rounded-lg object-cover border border-black" />
                    <div>
                      <span className="text-xs font-black block truncate">{l.name}</span>
                      <span className="text-[10px] font-bold text-teal-800 uppercase">{l.relationOrType}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3.5 py-2 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-xs font-black">{lanternUi.playFlute}</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  {lanternUi.ceremonyComplete}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startRiverGame}>
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
