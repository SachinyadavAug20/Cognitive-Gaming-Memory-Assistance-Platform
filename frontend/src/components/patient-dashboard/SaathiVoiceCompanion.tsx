"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Mic,
  MicOff,
  Sparkles,
  Bot,
  X,
  Globe,
} from "lucide-react";
import { speak, stopSpeaking } from "@/lib/speech";
import { playPress, playTapFeedback, playCalmTone, unlockAudio } from "@/lib/sound";

export interface SaathiLanguageOption {
  code: string;
  name: string;
  bcp47: string;
}

export const SAATHI_LANGUAGES: SaathiLanguageOption[] = [
  { code: "en", name: "English", bcp47: "en-IN" },
  { code: "as", name: "অসমীয়া (Assamese)", bcp47: "as-IN" },
  { code: "hi", name: "हिन्दी (Hindi)", bcp47: "hi-IN" },
  { code: "bn", name: "বাংলা (Bengali)", bcp47: "bn-IN" },
  { code: "mr", name: "मराठी (Marathi)", bcp47: "mr-IN" },
  { code: "ne", name: "नेपाली (Nepali)", bcp47: "ne-NP" },
  { code: "mni", name: "মৈতৈলোন্ (Manipuri)", bcp47: "mni-IN" },
  { code: "brx", name: "बड़ो (Bodo)", bcp47: "brx-IN" },
  { code: "grt", name: "Garo (A·chik)", bcp47: "grt-IN" },
  { code: "kha", name: "Khasi", bcp47: "kha-IN" },
  { code: "lus", name: "Mizo (Duhlian)", bcp47: "lus-IN" },
];

const REGIONAL_GREETINGS: Record<string, string> = {
  en: "Namaskar! I am Saathi, your memory companion. How can I help you feel safe and comfortable today?",
  as: "নমস্কাৰ! মই আপোনাৰ সাৰথি। মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?",
  hi: "नमस्ते! मैं आपका साथी हूँ। मैं आज आपकी क्या सहायता कर सकता हूँ?",
  bn: "নমস্কার! আমি আপনার সাথী। আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
  mr: "नमस्कार! मी तुमचा साथी आहे. मी तुम्हाला कशी मदत करू शकतो?",
  ne: "नमस्ते! म तपाईंको साथी हुँ। म तपाईंलाई कसरी मद्दत गर्न सक्छु?",
  mni: "খুরুমজরি! ঐহাক নহাক্কী সাথীনি। ঐহাক্না করম্না মতেং পাংগদগে?",
  brx: "खुसुम! आं नोंनि साथि। आं नोंनो माबोरै हेफाजाब होनो हागोन?",
  grt: "Salam! Anga nang·ni Saathi. Anga maikai dakchakna man·gen?",
  kha: "Khublei! Nga dei u Saathi jong phi. Kumno nga lah ban iarap?",
  lus: "Chibai! I thian Saathi ka ni. Engtin nge ka puih theih ang che?",
};

const REGIONAL_QUICK_PROMPTS: Record<string, Array<{ text: string; query: string }>> = {
  en: [
    { text: "🌅 What day is today?", query: "what_day" },
    { text: "🏡 Where am I right now?", query: "where_am_i" },
    { text: "👨‍👩‍👧 Tell me about my family", query: "family" },
    { text: "🫖 Afternoon tea & rest", query: "tea" },
    { text: "🎵 Play soothing flute", query: "flute" },
  ],
  as: [
    { text: "🌅 আজি কি বাৰ?", query: "what_day" },
    { text: "🏡 মই ক'ত আছোঁ?", query: "where_am_i" },
    { text: "👨‍👩‍👧 পৰিয়ালৰ কথা কওক", query: "family" },
    { text: "🫖 চাহ আৰু জিৰণি", query: "tea" },
    { text: "🎵 শান্ত বাঁহীৰ সুৰ", query: "flute" },
  ],
  hi: [
    { text: "🌅 आज कौन सा दिन है?", query: "what_day" },
    { text: "🏡 मैं कहाँ हूँ?", query: "where_am_i" },
    { text: "👨‍👩‍👧 परिवार के बारे में बताएं", query: "family" },
    { text: "🫖 चाय और आराम", query: "tea" },
    { text: "🎵 शांत बांसुरी धुन", query: "flute" },
  ],
  bn: [
    { text: "🌅 আজ কী বার?", query: "what_day" },
    { text: "🏡 আমি এখন কোথায়?", query: "where_am_i" },
    { text: "👨‍👩‍👧 পরিবারের কথা বলুন", query: "family" },
    { text: "🫖 এক কাপ চা ও বিশ্রাম", query: "tea" },
    { text: "🎵 শান্ত বাঁশির সুর", query: "flute" },
  ],
  mr: [
    { text: "🌅 आज कोणता वार आहे?", query: "what_day" },
    { text: "🏡 मी सध्या कुठे आहे?", query: "where_am_i" },
    { text: "👨‍👩‍👧 कुटुंबाबद्दल सांगा", query: "family" },
    { text: "🫖 चहा आणि विश्रांती", query: "tea" },
    { text: "🎵 शांत बासरीची धून", query: "flute" },
  ],
  ne: [
    { text: "🌅 आज कुन दिन हो?", query: "what_day" },
    { text: "🏡 म अहिले कहाँ छु?", query: "where_am_i" },
    { text: "👨‍👩‍👧 परिवारको बारेमा भन्नुहोस्", query: "family" },
    { text: "🫖 चिया र आराम", query: "tea" },
    { text: "🎵 शान्त बाँसुरीको धुन", query: "flute" },
  ],
  mni: [
    { text: "🌅 ঙসি করি নুমিৎনো?", query: "what_day" },
    { text: "🏡 ঐহাক কদায়দা লৈবগে?", query: "where_am_i" },
    { text: "👨‍👩‍👧 ইমুংগী মরমদা হায়বীয়ু", query: "family" },
    { text: "🫖 চা অমসুং পোথারবা", query: "tea" },
    { text: "🎵 নুংশিবা ৱাকুল শক্লোন", query: "flute" },
  ],
  brx: [
    { text: "🌅 दिनै मा सान?", query: "what_day" },
    { text: "🏡 आं बबेयाव दं?", query: "where_am_i" },
    { text: "👨‍👩‍👧 नखरनि बाथ्रा बुं", query: "family" },
    { text: "🫖 साहा आरो सुफुंथि", query: "tea" },
    { text: "🎵 गोसो गोजोन सिफुं", query: "flute" },
  ],
  grt: [
    { text: "🌅 Da·alo ma·ganda sal?", query: "what_day" },
    { text: "🏡 Anga bano donga?", query: "where_am_i" },
    { text: "👨‍👩‍👧 Nokdangni gimin agangrikbo", query: "family" },
    { text: "🫖 Cha aro neng·takaniko", query: "tea" },
    { text: "🎵 Bangsi sikaniko", query: "flute" },
  ],
  kha: [
    { text: "🌅 Ka sngi aiu kine?", query: "what_day" },
    { text: "🏡 Nga don hangno?", query: "where_am_i" },
    { text: "👨‍👩‍👧 Iathuh shaphang ka iing", query: "family" },
    { text: "🫖 Sha bad ka shongthait", query: "tea" },
    { text: "🎵 Ka sur besli kaba jai jai", query: "flute" },
  ],
  lus: [
    { text: "🌅 Vawiin eng ni nge?", query: "what_day" },
    { text: "🏡 Khawiah nge ka awm?", query: "where_am_i" },
    { text: "👨‍👩‍👧 Ka chhungte chanchin", query: "family" },
    { text: "🫖 Thingpui leh hahchawlhna", query: "tea" },
    { text: "🎵 Hla mawi tak", query: "flute" },
  ],
};

interface SaathiVoiceCompanionProps {
  patientName: string;
  langCode?: string;
  currentLocale?: string;
  rate?: number;
  familyMembers?: Array<{ name: string; relation?: string }>;
  familiarPlaces?: Array<{ name: string }>;
  joyTriggers?: string;
}

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
      text: REGIONAL_GREETINGS[initialLangCode] || REGIONAL_GREETINGS.en,
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
    const newGreeting = REGIONAL_GREETINGS[newLang] || REGIONAL_GREETINGS.en;
    
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

        // Localized intelligence according to selected language
        if (selectedLang === "as") {
          if (q.includes("নাম") || q.includes("name") || q.includes("who are you") || q.includes("আপুনি কোন")) {
            reply = `মই সাৰথি (Saathi), আপোনাৰ মৰমৰ AI স্মৃতি সংগী। মই আপোনাৰ পৰিয়াল, আপোনাৰ পুৰণি স্মৃতি আৰু দিনটোৰ সকলো দিশত সংগ দিবলৈ সদায় উপস্থিত আছোঁ।`;
          } else if (q.includes("বাৰ") || q.includes("day") || q.includes("সময়")) {
            reply = `আজি হৈছে শান্তিময় ${today}। পুৱাৰ ৰ'দ বৰ ধুনীয়া, আৰু আপুনি আজি ২টা স্মৃতি ব্যায়াম সম্পন্ন কৰিছে!`;
          } else if (q.includes("ক'ত") || q.includes("where") || q.includes("ঘৰ")) {
            reply = `আপুনি ${place}ত নিজৰ ঘৰত সম্পূর্ণ সুৰক্ষিত আছে। আপোনাৰ লগত আপোন পৰিয়াল আছে।`;
          } else if (q.includes("পৰিয়াল") || q.includes("family")) {
            reply = names
              ? `আপোনাৰ মৰমৰ পৰিয়ালৰ সদস্যসকল হ'ল ${names}। তেওঁলোকে আপোনাক অতিশয় ভাল পায়!`
              : `আপোনাৰ পৰিয়াল আপোনাৰ লগত আছে আৰু সকলোৱে আপোনাক ভাল পায়।`;
          } else if (q.includes("চাহ") || q.includes("tea")) {
            reply = `একাপ গৰম আৰু সুগন্ধি অসমৰ চাহ তৈয়াৰ হৈ আছে। লাহেকৈ উশাহ লওক আৰু শান্তিত বহক।`;
          } else if (q.includes("বাঁহী") || q.includes("music")) {
            playCalmTone();
            reply = `ব্ৰহ্মপুত্ৰৰ মৃদু বতাহৰ দৰে শান্ত বাঁহীৰ সুৰ বজাইছোঁ। জিৰণি লওক।`;
          } else {
            reply = `মই আপোনাৰ লগতে আছোঁ, ${patientName || "আইতা / ককা"}। আপুনি আজি বৰ ভাল কৰিছে।`;
          }
        } else if (selectedLang === "hi") {
          if (q.includes("नाम") || q.includes("name") || q.includes("who are you") || q.includes("कौन")) {
            reply = `मैं 'साथी' (Saathi) हूँ, आपका प्यारा AI स्मृति साथी। मैं आपको परिवार की यादें दिलाने और आपके साथ सुखद समय बिताने के लिए यहाँ हूँ।`;
          } else if (q.includes("दिन") || q.includes("day") || q.includes("तारीख")) {
            reply = `आज एक शांत और सुखद ${today} है। आज आपने अपने 2 मेमोरी गेम्स पूरे कर लिए हैं!`;
          } else if (q.includes("कहाँ") || q.includes("where") || q.includes("घर")) {
            reply = `आप ${place} में अपने घर पर सुरक्षित और अपनों के साथ हैं। सब कुछ शांत है।`;
          } else if (q.includes("परिवार") || q.includes("family")) {
            reply = names
              ? `आपके प्यारे परिवार के सदस्य हैं: ${names}। वे आपसे बहुत प्यार करते हैं!`
              : `आपका परिवार आपके साथ है और आपका पूरा ख्याल रखता है।`;
          } else if (q.includes("चाय") || q.includes("tea")) {
            reply = `ताज़ा और गरमा-गरम असम की चाय तैयार है। गहरी सांस लें और आराम महसूस करें।`;
          } else if (q.includes("बांसुरी") || q.includes("music")) {
            playCalmTone();
            reply = `ब्रह्मपुत्र की ठंडी हवा जैसी शांत बांसुरी की धुन बज रही है। मन को शांत करें।`;
          } else {
            reply = `मैं हमेशा आपके साथ हूँ, ${patientName || "जी"}। आज का दिन बहुत अच्छा है।`;
          }
        } else if (selectedLang === "bn") {
          if (q.includes("নাম") || q.includes("name") || q.includes("who are you") || q.includes("কে")) {
            reply = `আমি 'সাথী' (Saathi), আপনার বিশ্বস্ত AI স্মৃতি সঙ্গী। আমি আপনাকে পরিবার ও পুরানো সুখস্মৃতি মনে করিয়ে দিতে সবসময় পাশে আছি।`;
          } else if (q.includes("বার") || q.includes("day") || q.includes("দিন")) {
            reply = `আজ একটি শান্তিময় ${today}। আপনি আজ ২ টি স্মৃতি ব্যায়াম সম্পন্ন করেছেন!`;
          } else if (q.includes("কোথায়") || q.includes("where")) {
            reply = `আপনি ${place}-এ নিজের বাড়িতে সম্পূর্ণ নিরাপদে আছেন।`;
          } else if (q.includes("পরিবার") || q.includes("family")) {
            reply = names
              ? `আপনার ভালোবাসার পরিবারের সদস্যরা হলেন: ${names}।`
              : `আপনার পরিবার সবসময় আপনার পাশে আছে।`;
          } else if (q.includes("চা") || q.includes("tea")) {
            reply = `গরম আসামের চা প্রস্তুত। ধীরে ধীরে শ্বাস নিন এবং বিশ্রাম উপভোগ করুন।`;
          } else if (q.includes("বাঁশি") || q.includes("music")) {
            playCalmTone();
            reply = `মন শান্ত করার মতো স্নিগ্ধ বাঁশির সুর বাজছে।`;
          } else {
            reply = `আমি আপনার সাথেই আছি, ${patientName || "বন্ধু"}। আপনার দিনটি শুভ হোক।`;
          }
        } else {
          // English & default
          if (q.includes("name") || q.includes("who are you") || q.includes("your name") || q.includes("who r u") || q.includes("identity")) {
            reply = `I am Saathi, your caring memory companion! I am here to walk alongside you, talk about your loved ones, and help you remember your day.`;
          } else if (q.includes("day") || q.includes("date") || q.includes("time")) {
            reply = `Today is a peaceful ${today}. The morning sun is bright, and you have completed 2 memory exercises today!`;
          } else if (q.includes("where") || q.includes("place") || q.includes("home")) {
            reply = `You are safe at home in ${place}. Everything is calm and your loved ones are with you.`;
          } else if (q.includes("family") || q.includes("daughter") || q.includes("son") || q.includes("husband") || q.includes("wife")) {
            reply = names
              ? `Your loving family members are ${names}. They care deeply about you and send their love!`
              : `Your family loves you very much and is always by your side.`;
          } else if (q.includes("tea") || q.includes("drink") || q.includes("rest")) {
            reply = `A warm cup of fresh Assam CTC tea is brewing. Take a slow, deep breath and enjoy this peaceful afternoon.`;
          } else if (q.includes("music") || q.includes("flute") || q.includes("calm")) {
            playCalmTone();
            reply = `Playing gentle, serene flute music inspired by the Brahmaputra breeze. Relax your shoulders.`;
          } else {
            reply = `I am here with you, ${patientName || "my friend"}. You are doing wonderful today. Let us take a deep breath together.`;
          }
        }

        const saathiMsg: Message = {
          id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          sender: "saathi",
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, saathiMsg]);
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
            <span className="block text-[10px] font-black uppercase tracking-wider text-amber-950">
              AI Companion ({activeLangConfig.name.split(" ")[0]})
            </span>
            <span className="font-serif text-sm font-black text-ink">
              Talk to Saathi 🗣️
            </span>
          </div>
          <span className="sm:hidden font-serif text-xs font-black text-ink">
            Saathi 🗣️
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
                    <span className="rounded-full bg-tea px-2 py-0.5 text-[10px] font-black uppercase text-white">
                      Online
                    </span>
                  </div>
                  <p className="text-xs font-bold text-ink-secondary">
                    Elderly Reassurance & Memory Orientation
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

            {/* 🌐 Interactive Language Switcher Bar */}
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
                  {isSpeaking
                    ? `🗣️ Saathi is speaking (${activeLangConfig.name.split(" ")[0]})...`
                    : isListening
                    ? "🎙️ Listening... Speak slowly and gently"
                    : "Tap the mic or touch a query below"}
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
                    <span className="mt-1 block text-[10px] font-bold opacity-60 text-right">
                      {msg.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Touch Query Chips */}
            <div className="pt-2 border-t-2 border-black/10">
              <span className="block text-[10px] font-black uppercase tracking-wider text-ink-secondary mb-1.5">
                Quick Prompts ({activeLangConfig.name.split(" ")[0]}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {promptList.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickPrompt(p)}
                    className="btn-tactile rounded-xl border-2 border-black bg-surface px-2.5 py-1 text-[11px] font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-100 transition-transform active:translate-y-0.5 cursor-pointer"
                  >
                    {p.text}
                  </button>
                ))}
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
                    <span>Tap to Speak ({activeLangConfig.name.split(" ")[0]})</span>
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
