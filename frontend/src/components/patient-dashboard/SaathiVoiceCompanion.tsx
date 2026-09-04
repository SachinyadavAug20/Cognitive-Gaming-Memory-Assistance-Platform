"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  Bot,
  Stethoscope,
  HeartPulse,
  Pill,
  Wind,
  X,
  Globe,
  Speech,
  CalendarDays,
  MapPin,
  Users,
  Coffee,
  CheckCircle2,
} from "lucide-react";
import { speak, stopSpeaking } from "@/lib/speech";
import { playPress, playTapFeedback, playCalmTone, unlockAudio } from "@/lib/sound";

export interface SaathiLanguageOption {
  code: string;
  name: string;
  bcp47: string;
}

export type DoctorLanguageOption = SaathiLanguageOption;

export const SAATHI_LANGUAGES: readonly SaathiLanguageOption[] = [
  { code: "en", name: "English (NER)", bcp47: "en-IN" },
  { code: "as", name: "অসমীয়া (Assamese)", bcp47: "as-IN" },
  { code: "hi", name: "हिन्दी (Hindi)", bcp47: "hi-IN" },
  { code: "bn", name: "বাংলা (Bengali)", bcp47: "bn-IN" },
  { code: "mr", name: "मराठी (Marathi)", bcp47: "mr-IN" },
  { code: "ne", name: "नेपाली (Nepali)", bcp47: "ne-NP" },
  { code: "mni", name: "মৈতৈলোন্ (Manipuri)", bcp47: "mni-IN" },
  { code: "brx", name: "बर' (Bodo)", bcp47: "brx-IN" },
  { code: "grt", name: "Garo (A·chik)", bcp47: "grt-IN" },
  { code: "kha", name: "Khasi (Ka Ktien)", bcp47: "kha-IN" },
  { code: "lus", name: "Mizo (Mizo ṭawng)", bcp47: "lus-IN" },
] as const;

export const DOCTOR_LANGUAGES = SAATHI_LANGUAGES;

const GREETINGS_BY_LANG: Record<string, string> = {
  en: "Hello! I am Saathi, your cognitive memory companion. I am here to check on your orientation, routine, and health today. How are you feeling right now?",
  as: "নমস্কাৰ! মই আপোনাৰ সংগী সাৰথি (Saathi)। আপোনাৰ স্বাস্থ্য, ঔষধ আৰু মানসিক সুস্থতাৰ বুজ ল'বলৈ মই উপস্থিত আছোঁ। আজি আপোনাৰ কেনে লাগিছে?",
  hi: "नमस्ते! मैं आपका साथी (Saathi) हूँ। आपके स्वास्थ्य, दवाइयों और मानसिक शांति का ध्यान रखने के लिए मैं यहाँ हूँ। आज आपकी तबीयत कैसी है?",
  bn: "নমস্কার! আমি আপনার সঙ্গী সাথী (Saathi)। আপনার শারীরিক সুস্থতা, ওষুধ এবং মানসিক শান্তির খেয়াল রাখতে আমি পাশে আছি। আজ কেমন বোধ করছেন?",
  mr: "नमस्कार! मी तुमचा साथी (Saathi) आहे. तुमच्या आरोग्याची आणि औषधांची काळजी घेण्यासाठी मी सदैव उपस्थित आहे. आज तुमची तब्येत कशी आहे?",
  ne: "नमस्ते! म तपाईंको साथी (Saathi) हुँ। तपाईंको स्वास्थ्य, औषधि र दिनचर्याको हेरचाह गर्न म यहाँ छु। आज तपाईं कस्तो महसुस गर्दै हुनुहुन्छ?",
  mni: "খুরুমজরি! ঐহাক নহাক্কী সাথীনি (Saathi)। নহাক্কী হকচাংগী ফিবম অমসুং হিদাক-লাংথক য়েংশিন্নবা ঐহাক লৈরি। ঙসি নহাক্কী ফিবম করম তৌবগে?",
  brx: "खुसुम! आं नोंनि साथि (Saathi)। नोंनि देहा आरो मुलिनि थाखाय आं दं। नों दिनै माबोरै मोनदों?",
  grt: "Salam! Anga nang·ni Saathi. Nang·ni an·sengbaljokaniko aro sam rangko ni·rikna anga donga. Da·alo maikai dakenga?",
  kha: "Khublei! Nga dei u Saathi jong phi. Ban sumar ia ka koit ka khiah bad ki dawai jong phi. Kumno phi sngew mynta ka sngi?",
  lus: "Chibai! I thian Saathi ka ni. I hriselna leh damdawi ei hun endik turin ka awm e. Vawiin enge i an le?",
};

const PROMPT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  what_day: CalendarDays,
  where_am_i: MapPin,
  medicine: Pill,
  health_check: HeartPulse,
  family: Users,
  breathing: Wind,
  tea: Coffee,
};

const REGIONAL_QUICK_PROMPTS: Record<string, Array<{ text: string; query: string }>> = {
  en: [
    { text: "What day is today?", query: "what_day" },
    { text: "Where am I right now?", query: "where_am_i" },
    { text: "Did I take my medicine?", query: "medicine" },
    { text: "Daily health check-in", query: "health_check" },
    { text: "Calm 4-7-8 breathing", query: "breathing" },
    { text: "Tell me about my family", query: "family" },
  ],
  as: [
    { text: "আজি কি বাৰ?", query: "what_day" },
    { text: "মই ক'ত আছোঁ?", query: "where_am_i" },
    { text: "মই ঔষধ খালোঁনে?", query: "medicine" },
    { text: "স্বাস্থ্য পৰীক্ষা", query: "health_check" },
    { text: "শান্ত শ্বাস-প্ৰশ্বাস", query: "breathing" },
    { text: "পৰিয়ালৰ কথা কওক", query: "family" },
  ],
  hi: [
    { text: "आज कौन सा दिन है?", query: "what_day" },
    { text: "मैं कहाँ हूँ?", query: "where_am_i" },
    { text: "क्या मैंने दवाई ली?", query: "medicine" },
    { text: "दैनिक स्वास्थ्य जांच", query: "health_check" },
    { text: "शांत गहरी साँस व्यायाम", query: "breathing" },
    { text: "परिवार के बारे में बताएं", query: "family" },
  ],
  bn: [
    { text: "আজ কী বার?", query: "what_day" },
    { text: "আমি এখন কোথায়?", query: "where_am_i" },
    { text: "আমি কি ওষুধ খেয়েছি?", query: "medicine" },
    { text: "দৈনিক স্বাস্থ্য পরীক্ষা", query: "health_check" },
    { text: "শান্ত গভীর শ্বাস", query: "breathing" },
    { text: "পরিবারের কথা বলুন", query: "family" },
  ],
  mr: [
    { text: "आज कोणता वार आहे?", query: "what_day" },
    { text: "मी सध्या कुठे आहे?", query: "where_am_i" },
    { text: "मी औषध घेतले का?", query: "medicine" },
    { text: "आरोग्य तपासणी", query: "health_check" },
    { text: "शांत श्वसन व्यायाम", query: "breathing" },
    { text: "कुटुंबाबद्दल सांगा", query: "family" },
  ],
  ne: [
    { text: "आज कुन दिन हो?", query: "what_day" },
    { text: "म अहिले कहाँ छु?", query: "where_am_i" },
    { text: "मैले औषधि खाएँ?", query: "medicine" },
    { text: "दैनिक स्वास्थ्य जाँच", query: "health_check" },
    { text: "शान्त श्वासप्रश्वास", query: "breathing" },
    { text: "परिवारको बारेमा भन्नुहोस्", query: "family" },
  ],
  mni: [
    { text: "ঙসি করি নুমিৎনো?", query: "what_day" },
    { text: "ঐহাক কদায়দা লৈবগে?", query: "where_am_i" },
    { text: "ঐহাক হিদাক চাবা য়ারব্রা?", query: "medicine" },
    { text: "হকচাং য়েংশিনবা", query: "health_check" },
    { text: "নুংশিবা স্বাস লৌবা", query: "breathing" },
    { text: "ইমুংগী মরমদা হায়বীয়ু", query: "family" },
  ],
  brx: [
    { text: "दिनै मा सान?", query: "what_day" },
    { text: "आं बबेयाव दं?", query: "where_am_i" },
    { text: "आं मुलि जाबाय नामा?", query: "medicine" },
    { text: "देहा नायबिजिरनाय", query: "health_check" },
    { text: "गोजोन हाबनाय-हगारनाय", query: "breathing" },
    { text: "नखरनि बाथ्रा बुं", query: "family" },
  ],
  grt: [
    { text: "Da·alo ma·ganda sal?", query: "what_day" },
    { text: "Anga bano donga?", query: "where_am_i" },
    { text: "Anga samko ring·man·aha?", query: "medicine" },
    { text: "An·sengani sandiani", query: "health_check" },
    { text: "Tom·tome rang·sitani", query: "breathing" },
    { text: "Nokdangni gimin agangrikbo", query: "family" },
  ],
  kha: [
    { text: "Ka sngi aiu kine?", query: "what_day" },
    { text: "Nga don hangno?", query: "where_am_i" },
    { text: "Nga la dih dawai mo?", query: "medicine" },
    { text: "Jingkhmih koit khiah", query: "health_check" },
    { text: "Ring mynsiem kaba jem", query: "breathing" },
    { text: "Iathuh shaphang ka iing", query: "family" },
  ],
  lus: [
    { text: "Vawiin eng ni nge?", query: "what_day" },
    { text: "Khawiah nge ka awm?", query: "where_am_i" },
    { text: "Damdawi ka ei tawh em?", query: "medicine" },
    { text: "Hriselna endikna", query: "health_check" },
    { text: "Thawk lak hahdam", query: "breathing" },
    { text: "Ka chhungte chanchin", query: "family" },
  ],
};

export interface SaathiVoiceCompanionProps {
  patientName: string;
  langCode?: string;
  currentLocale?: string;
  rate?: number;
  familyMembers?: Array<{ name: string; relation?: string }>;
  familiarPlaces?: Array<{ name: string }>;
  joyTriggers?: string;
}

export type AiDoctorVoiceCompanionProps = SaathiVoiceCompanionProps;

interface Message {
  id: string;
  sender: "user" | "saathi";
  text: string;
  time: string;
}

interface SpeechRecognitionEventLike {
  results: Array<Array<{ transcript: string }>>;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
}

export function SaathiVoiceCompanion({
  patientName,
  langCode,
  currentLocale = "en",
  rate = 0.82,
  familyMembers = [],
  familiarPlaces = [],
  joyTriggers: _joyTriggers = "fresh morning tea and birds chirping",
}: SaathiVoiceCompanionProps) {
  // Determine initial language based on currently chosen locale
  const initialLangCode = useMemo(() => {
    if (currentLocale && SAATHI_LANGUAGES.some((l) => l.code === currentLocale)) {
      return currentLocale;
    }
    if (langCode) {
      const prefix = langCode.split("-")[0];
      if (SAATHI_LANGUAGES.some((l) => l.code === prefix)) {
        return prefix;
      }
    }
    return "en";
  }, [currentLocale, langCode]);

  const [selectedLang, setSelectedLang] = useState<string>(initialLangCode);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [_transcript, setTranscript] = useState("");

  const activeLangConfig = useMemo(() => {
    return (
      SAATHI_LANGUAGES.find((l) => l.code === selectedLang) ||
      SAATHI_LANGUAGES[0]
    );
  }, [selectedLang]);

  const promptList = REGIONAL_QUICK_PROMPTS[selectedLang] || REGIONAL_QUICK_PROMPTS.en;

  const [messages, setMessages] = useState<Message[]>(() => [
    {
      id: "m-0",
      sender: "saathi",
      text: GREETINGS_BY_LANG[initialLangCode] || GREETINGS_BY_LANG.en,
      time: "Now",
    },
  ]);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  const speakVoice = useCallback(
    (text: string, bcp47Tag?: string) => {
      unlockAudio();
      speak(
        text,
        bcp47Tag || activeLangConfig.bcp47,
        rate,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false)
      );
    },
    [activeLangConfig.bcp47, rate]
  );

  const handleLanguageChange = (newLang: string) => {
    playTapFeedback();
    setSelectedLang(newLang);
    const langData = SAATHI_LANGUAGES.find((l) => l.code === newLang) || SAATHI_LANGUAGES[0];
    const newGreeting = GREETINGS_BY_LANG[newLang] || GREETINGS_BY_LANG.en;

    const switchMsg: Message = {
      id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      sender: "saathi",
      text: newGreeting,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, switchMsg]);
    speakVoice(newGreeting, langData.bcp47);
  };

  const handleUserQuery = useCallback(
    (queryText: string) => {
      const userMsg: Message = {
        id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        sender: "user",
        text: queryText,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsListening(false);

      setTimeout(() => {
        let reply = "";
        const q = queryText.toLowerCase();

        const today = new Date().toLocaleDateString(activeLangConfig.bcp47, {
          weekday: "long",
          month: "long",
          day: "numeric",
        });

        const place = familiarPlaces[0]?.name || "Guwahati, Assam";
        const names = familyMembers.map((m) => `${m.name} (${m.relation || "family"})`).join(", ");

        // Localized companion responses according to selected language
        if (selectedLang === "as") {
          if (q.includes("নাম") || q.includes("name") || q.includes("who are you") || q.includes("আপুনি কোন")) {
            reply = `মই আপোনাৰ সংগী সাৰথি (Saathi)। মই আপোনাৰ স্বাস্থ্যৰ নিৰীক্ষণ, ঔষধৰ সময়সূচী আৰু স্মৃতি সবলীকৰণৰ বাবে আপোনাৰ কাষত আছোঁ।`;
          } else if (q.includes("ঔষধ") || q.includes("দৰব") || q.includes("medicine")) {
            reply = `আপোনাৰ ৰাতিপুৱাৰ ঔষধৰ সময় হৈছে। পৰিচর্যাকাৰীয়ে টেবুলত ৰখা পানী আৰু ঔষধ সময়মতে খাবলৈ অনুৰোধ জনালোঁ।`;
          } else if (q.includes("স্বাস্থ্য") || q.includes("health") || q.includes("check")) {
            reply = `আপোনাৰ স্বাস্থ্য স্থিতি সুষম হৈ আছে। আজি আপুনি ২টা স্মৃতি কাৰ্যসূচী সুস্থভাৱে সম্পূৰ্ণ কৰিছে। লাহেকৈ পানী খাওক।`;
          } else if (q.includes("শ্বাস") || q.includes("বতাহ") || q.includes("breathe") || q.includes("breathing")) {
            playCalmTone();
            reply = `আহক একেলগে শান্ত শ্বাস-প্ৰশ্বাস লওঁ: লাহেকৈ নাকৰে ৪ ছেকেণ্ড উশাহ লওক... ৭ ছেকেণ্ড ধৰি ৰাখক... আৰু মুখৰে ৮ ছেকেণ্ড এৰি দিয়ক। মন শান্ত কৰক।`;
          } else if (q.includes("বাৰ") || q.includes("day") || q.includes("সময়")) {
            reply = `আজি হৈছে শান্তিময় ${today}। পুৱাৰ বতাহ বৰ স্নিগ্ধ, আৰু আপোনাৰ দিনটো শান্তিময় হৈছে।`;
          } else if (q.includes("ক'ত") || q.includes("where") || q.includes("ঘৰ")) {
            reply = `আপুনি ${place}ত নিজৰ ঘৰত সম্পূর্ণ সুৰক্ষিত অৱস্থাত আছে। আপোনাৰ লগত আপোন পৰিয়াল আছে।`;
          } else if (q.includes("পৰিয়াল") || q.includes("family")) {
            reply = names
              ? `আপোনাৰ মৰমৰ পৰিয়ালৰ সদস্যসকল হ'ল ${names}। তেওঁলোকে আপোনাক অতিশয় ভাল পায় আৰু যত্ন লয়।`
              : `আপোনাৰ পৰিয়াল আপোনাৰ লগত আছে আৰু সকলোৱে আপোনাক ভাল পায়।`;
          } else {
            reply = `মই আপোনাৰ সংগী সাৰথি হিচাপে লগতে আছোঁ, ${patientName || "আইতা / ককা"}। আপোনাৰ দিনটো অতি সুন্দৰকৈ পাৰ হৈছে। কোনো চিন্তা নকৰিব।`;
          }
        } else if (selectedLang === "hi") {
          if (q.includes("नाम") || q.includes("name") || q.includes("who are you") || q.includes("कौन")) {
            reply = `मैं आपका समर्पित साथी (Saathi) हूँ। मैं आपके दैनिक स्वास्थ्य, दवाइयों और स्मृति सहायता की निगरानी के लिए यहाँ मौजूद हूँ।`;
          } else if (q.includes("दवाई") || q.includes("दवा") || q.includes("medicine")) {
            reply = `आपकी सुबह की दवाई का समय अनुकूल है। कृपया एक घूंट ताज़ा पानी के साथ अपनी निर्धारित गोलियां ले लें। मैंने इसे नोट कर लिया है।`;
          } else if (q.includes("स्वास्थ्य") || q.includes("तबीयत") || q.includes("health") || q.includes("check")) {
            reply = `आपकी स्वास्थ्य स्थिति पूरी तरह सामान्य और स्थिर है। आज आपने 2 स्मृति अभ्यास बहुत अच्छे से पूरे किए हैं। आराम से बैठें।`;
          } else if (q.includes("साँस") || q.includes("गहरी") || q.includes("breathe") || q.includes("breathing")) {
            playCalmTone();
            reply = `आइए 4-7-8 शांत श्वसन अभ्यास करें: नाक से 4 सेकंड गहरी साँस लें... 7 सेकंड धीरे से रोकें... और मुंह से 8 सेकंड में छोड़ें। कंधे ढीले छोड़ें।`;
          } else if (q.includes("दिन") || q.includes("day") || q.includes("तारीख")) {
            reply = `आज एक शांत और सुखद ${today} है। मौसम अच्छा है और आपका दिन शांतिपूर्ण बीत रहा है।`;
          } else if (q.includes("कहाँ") || q.includes("where") || q.includes("घर")) {
            reply = `आप ${place} में अपने घर पर बिल्कुल सुरक्षित और अपनों के बीच हैं। सब कुछ शांत है।`;
          } else if (q.includes("परिवार") || q.includes("family")) {
            reply = names
              ? `आपके प्यारे परिवार के सदस्य हैं: ${names}। वे आपसे बहुत स्नेह करते हैं!`
              : `आपका परिवार आपके साथ है और आपका पूरा ख्याल रखता है।`;
          } else {
            reply = `मैं आपके साथ हूँ, ${patientName || "जी"}। आपकी सेहत का पूरा ध्यान रखा जा रहा है। गहरी साँस लें और शांत रहें।`;
          }
        } else if (selectedLang === "bn") {
          if (q.includes("নাম") || q.includes("name") || q.includes("who are you") || q.includes("কে")) {
            reply = `আমি আপনার সঙ্গী সাথী (Saathi)। আপনার শারীরিক সুস্থতা, ওষুধ এবং স্মৃতি সুরক্ষায় আমি সবসময় পাশে আছি।`;
          } else if (q.includes("ওষুধ") || q.includes("medicine")) {
            reply = `আপনার সকালের ওষুধের সময় হয়েছে। পরিবারের সহায়তায় ওষুধ ও এক গ্লাস জল গ্রহণ করুন।`;
          } else if (q.includes("স্বাস্থ্য") || q.includes("health")) {
            reply = `আপনার স্বাস্থ্য পরীক্ষার রিপোর্ট স্থিতিশীল। আজ আপনি ২টি স্মৃতি ব্যায়াম সম্পন্ন করেছেন।`;
          } else if (q.includes("শ্বাস") || q.includes("breathe")) {
            playCalmTone();
            reply = `ধীরে ধীরে ৪ সেকেন্ড নাক দিয়ে শ্বাস নিন... ৭ সেকেন্ড ধরে রাখুন... এবং ৮ সেকেন্ডে মুখ দিয়ে ছেড়ে দিন। প্রশান্তি অনুভব করুন।`;
          } else if (q.includes("বার") || q.includes("day") || q.includes("দিন")) {
            reply = `আজ একটি শান্তিময় ${today}। আপনার চারপাশ শান্ত ও নিরাপদ।`;
          } else if (q.includes("কোথায়") || q.includes("where")) {
            reply = `আপনি ${place}-এ নিজের বাড়িতে সম্পূর্ণ নিরাপদে আছেন।`;
          } else if (q.includes("পরিবার") || q.includes("family")) {
            reply = names
              ? `আপনার পরিবারের প্রিয় সদস্যরা হলেন: ${names}।`
              : `আপনার পরিবার সবসময় আপনার পাশে আছে।`;
          } else {
            reply = `আমি আপনার সঙ্গী হিসেবে আছি, ${patientName || "বন্ধু"}। বিশ্রাম নিন এবং সুস্থ থাকুন।`;
          }
        } else {
          // English & default
          if (q.includes("name") || q.includes("who are you") || q.includes("your name") || q.includes("identity")) {
            reply = `I am Saathi, your dedicated cognitive companion. I track your daily cognitive exercises, medication schedule, and orientation to keep your mind safe and peaceful.`;
          } else if (q.includes("medicine") || q.includes("pill") || q.includes("tablet") || q.includes("dose")) {
            reply = `Your morning dosage schedule is prepared on your table. Please take a sip of fresh water with your tablets. I have recorded your routine check.`;
          } else if (q.includes("health") || q.includes("check") || q.includes("vital") || q.includes("feeling")) {
            reply = `Your cognitive and emotional vitals are steady today. You have successfully completed 2 memory therapy modules today. Continue hydrating well and resting comfortably.`;
          } else if (q.includes("breathe") || q.includes("breath") || q.includes("calm") || q.includes("relax")) {
            playCalmTone();
            reply = `Let us do a gentle 4-7-8 relaxation breath together. Inhale gently through your nose for 4 counts... hold lightly for 7 counts... and slowly exhale through your mouth for 8 counts. Feel your tension melt away.`;
          } else if (q.includes("day") || q.includes("date") || q.includes("time") || q.includes("what day")) {
            reply = `Today is a peaceful ${today}. The morning sun is gentle, and you are having a wonderful, steady day.`;
          } else if (q.includes("where") || q.includes("place") || q.includes("home")) {
            reply = `You are safe at home in ${place}. Everything is familiar, secure, and your caregivers are right nearby.`;
          } else if (q.includes("family") || q.includes("daughter") || q.includes("son") || q.includes("husband") || q.includes("wife")) {
            reply = names
              ? `Your loving family circle includes ${names}. They love you deeply and are looking after your comfort.`
              : `Your family is close by and cares deeply for your well-being.`;
          } else if (q.includes("tea") || q.includes("drink") || q.includes("rest")) {
            reply = `A warm, soothing cup of fresh Assam tea is brewing. Take slow, restful sips and enjoy the quiet surroundings.`;
          } else {
            reply = `I am here by your side as your companion Saathi, ${patientName || "my friend"}. You are doing wonderfully today. Take a gentle breath and relax your mind.`;
          }
        }

        const companionMsg: Message = {
          id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sender: "saathi",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, companionMsg]);
        speakVoice(reply);
      }, 400);
    },
    [activeLangConfig.bcp47, familiarPlaces, familyMembers, patientName, selectedLang, speakVoice]
  );

  // Initialize Speech Recognition on active language
  useEffect(() => {
    if (typeof window !== "undefined") {
      const win = window as unknown as {
        SpeechRecognition?: new () => SpeechRecognitionInstance;
        webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
      };
      const SpeechRecognitionConstructor =
        win.SpeechRecognition || win.webkitSpeechRecognition;
      if (SpeechRecognitionConstructor) {
        const recognition = new SpeechRecognitionConstructor();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = activeLangConfig.bcp47;

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          const spokenText = event.results[0][0].transcript;
          setTranscript(spokenText);
          handleUserQuery(spokenText);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [activeLangConfig.bcp47, handleUserQuery]);

  const toggleListening = () => {
    playPress();
    stopSpeaking();
    setIsSpeaking(false);

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript("");
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleQuickPrompt = (prompt: { text: string; query: string }) => {
    playTapFeedback();
    handleUserQuery(prompt.text);
  };

  return (
    <>
      {/* Floating Pill on Patient Dashboard */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => {
            playTapFeedback();
            setIsOpen(true);
          }}
          className="btn-tactile flex items-center gap-2.5 rounded-full border-3 border-black bg-amber-400 px-4 py-2.5 sm:px-5 sm:py-3 text-ink shadow-[4px_4px_0px_#000] hover:bg-amber-300 transition-transform active:translate-y-0.5 cursor-pointer group"
          aria-label="Open Saathi Voice Companion"
        >
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-black text-amber-300 group-hover:scale-105 transition-transform">
            <Bot className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </div>
          <div className="text-left hidden sm:block">

            <span className="flex items-center gap-1.5 font-serif text-sm font-black text-ink">
              Talk to Doctor <Speech className="h-4 w-4 text-tea inline" />
            </span>
          </div>
          <span className="sm:hidden flex items-center gap-1 font-serif text-xs font-black text-ink">
            Saathi <Speech className="h-3.5 w-3.5 text-tea inline" />
          </span>
        </button>
      </div>

      {/* Interactive Saathi Voice Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="relative flex w-full max-w-lg flex-col rounded-3xl border-4 border-black bg-[#FAF6F0] p-5 sm:p-6 shadow-[8px_8px_0px_#000] max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-3 border-black/15 pb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-3 border-black bg-amber-300 text-ink shadow-[2px_2px_0px_#000]">
                  <Bot className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-serif text-lg sm:text-xl font-black text-ink">
                      Saathi Voice Companion
                    </h3>
                    <span className="flex items-center gap-1 rounded-full bg-emerald-700 px-2 py-0.5 text-[10px] font-black uppercase text-white">
                      <CheckCircle2 className="h-3 w-3" />
                      Active
                    </span>
                  </div>
                  <p className="text-xs font-bold text-ink-secondary">
                    Clinical Orientation, Medication & Calming Guidance
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playTapFeedback();
                  stopSpeaking();
                  setIsOpen(false);
                }}
                className="btn-tactile flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white text-ink hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                aria-label="Close Saathi Voice Companion"
              >
                <X className="h-5 w-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Interactive Language Switcher Bar */}
            <div className="my-2.5 flex items-center justify-between gap-2 rounded-2xl border-2 border-black bg-surface p-2 shadow-xs">
              <div className="flex items-center gap-1.5 pl-1 text-xs font-black text-ink">
                <Globe className="h-4 w-4 text-tea" />
                <span>Voice Language:</span>
              </div>

              <select
                value={selectedLang}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="rounded-xl border-2 border-black bg-amber-200 px-3 py-1 text-xs font-black text-ink cursor-pointer focus:outline-hidden hover:bg-amber-300"
                aria-label="Change voice language"
              >
                {SAATHI_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Speaking / Listening Status Indicator */}
            <div className="mb-2 flex items-center justify-between rounded-xl border-2 border-black bg-amber-100 px-3.5 py-1.5 text-xs font-bold text-amber-950">
              <span className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-tea" />
                <span>
                  {isSpeaking ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Speech className="h-3.5 w-3.5 text-tea" />
                      <span>Saathi is speaking ({activeLangConfig.name.split(" ")[0]})...</span>
                    </span>
                  ) : isListening ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Mic className="h-3.5 w-3.5 text-rose-600 animate-pulse" />
                      <span>Listening... Speak gently to Saathi</span>
                    </span>
                  ) : (
                    "Touch a clinical prompt below or tap the mic"
                  )}
                </span>
              </span>

              {isSpeaking && (
                <button
                  type="button"
                  onClick={() => {
                    stopSpeaking();
                    setIsSpeaking(false);
                  }}
                  className="rounded-lg border border-black bg-white px-2 py-0.5 text-[11px] font-black hover:bg-rose-100 text-rose-800"
                >
                  Stop Audio
                </button>
              )}
            </div>

            {/* Conversation Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto space-y-2.5 py-1 pr-1 min-h-[190px] max-h-[280px]">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl border-3 border-black p-3 shadow-[2px_2px_0px_#000] ${
                      msg.sender === "user"
                        ? "bg-amber-300 text-ink"
                        : "bg-surface text-ink"
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-black leading-relaxed">
                      {msg.text}
                    </p>
                    <span className="mt-1 block text-[10px] font-bold text-ink-secondary text-right">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Touch Clinical Prompts */}
            <div className="pt-2 border-t-2 border-black/10">
              <span className="block text-[10px] font-black uppercase tracking-wider text-ink-secondary mb-1.5">
                Clinical Prompts ({activeLangConfig.name.split(" ")[0]}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {promptList.map((p, idx) => {
                  const IconComp = PROMPT_ICONS[p.query] || Sparkles;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickPrompt(p)}
                      className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-2.5 py-1 text-[11px] font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-100 transition-transform active:translate-y-0.5 cursor-pointer"
                    >
                      <IconComp className="h-3.5 w-3.5 text-tea shrink-0" />
                      <span>{p.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Voice Input Big Action Button */}
            <div className="mt-3 flex items-center justify-center pt-1">
              <button
                type="button"
                onClick={toggleListening}
                className={`btn-tactile flex items-center gap-2.5 rounded-full border-4 border-black px-7 py-3 text-sm sm:text-base font-black shadow-[4px_4px_0px_#000] cursor-pointer transition-all ${
                  isListening
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-amber-400 text-black hover:bg-amber-300"
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-5 w-5" />
                    <span>Listening... Tap to Stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-5 w-5" />
                    <span>Tap to Speak with Saathi ({activeLangConfig.name.split(" ")[0]})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Backwards compatibility alias
export { SaathiVoiceCompanion as AiDoctorVoiceCompanion };
