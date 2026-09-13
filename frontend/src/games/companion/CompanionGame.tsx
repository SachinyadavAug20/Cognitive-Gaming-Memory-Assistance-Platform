"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  User,
  Gamepad2,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  Mic,
  MicOff,
  Coffee,
  CloudRain,
  Music,
  Flower2,
  Wind,
  Smile,
  RotateCcw,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import {
  playPress,
  playCorrect,
  playEncourage,
  playTapFeedback,
} from "@/lib/sound";
import { speak, stopSpeaking, speechSupported } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { getGameStrings } from "@/lib/gameI18n";

interface ConversationTopic {
  id: string;
  icon: typeof Coffee;
  label: { en: string; hi: string; as: string };
  saathiPrompt: { en: string; hi: string; as: string };
  patientReplies: { en: string; hi: string; as: string }[];
  followUp: { en: string; hi: string; as: string };
}

const TOPICS: ConversationTopic[] = [
  {
    id: "tea",
    icon: Coffee,
    label: {
      en: "Morning Chai",
      hi: "सुबह की कुल्हड़ चाय",
      as: "ৰাতিপুৱাৰ গৰম চাহ",
    },
    saathiPrompt: {
      en: "Nothing warms the heart like fresh Assam tea brewed with ginger and cardamom. How do you like your tea?",
      hi: "अदरक और इलायची वाली ताज़ा असमिया चाय की महक मन को खुश कर देती है। आपको कैसी चाय पसंद है?",
      as: "আদা আৰু ইলাচী দিয়া গৰম অসমীয়া চাহৰ সুবাসে মনটো জুৰ পেলায়। আপুনি কেনেকুৱা চাহ ভাল পায়?",
    },
    patientReplies: [
      {
        en: "With ginger and milk",
        hi: "अदरक और दूध वाली",
        as: "আদা আৰু গাখীৰ দিয়া",
      },
      {
        en: "Strong and sweet",
        hi: "मीठी और कड़क चाय",
        as: "কাহুন্দী আৰু মিঠা",
      },
      {
        en: "A small warm cup is nice",
        hi: "एक छोटा कुल्हड़ काफी है",
        as: "এটা সৰু বাতি হলেই ভাল",
      },
    ],
    followUp: {
      en: "Wonderful! Taking time to sip warm tea brings such peaceful comfort to our mornings.",
      hi: "बहुत बढ़िया! गरमा-गरम चाय की चुस्की सुबह के पलों को सुकून और आनंद से भर देती है।",
      as: "বৰ সুন্দৰ! পুৱা এঢোক গৰম চাহে মন আৰু শৰীৰ দুয়োটাই জুৰ পেলায়।",
    },
  },
  {
    id: "rain",
    icon: CloudRain,
    label: {
      en: "Rain in the Hills",
      hi: "पहाड़ों की बारिश",
      as: "পাহাৰৰ বৰষুণ",
    },
    saathiPrompt: {
      en: "Listen to the rain gently drumming on the rooftop in the hills. The earth smells so fresh after the rain.",
      hi: "सुनिए, पहाड़ों में छत पर बारिश की बूँदों की कैसी मीठी आवाज़ आ रही है। मिट्टी की खुशबू कितनी भीनी है।",
      as: "শুনকচোন, টিনৰ চালত বৰষুণৰ টোপালবোৰ কিমান সুন্দৰকৈ পৰিছে। বৰষুণৰ পিছত মাটিৰ সুবাস কিমান মিঠা।",
    },
    patientReplies: [
      {
        en: "I love the sound of rain",
        hi: "बारिश की आवाज़ पसंद है",
        as: "বৰষুণৰ শব্দ ভাল পাওঁ",
      },
      {
        en: "It feels so cool and calm",
        hi: "मौसम बहुत सुहावना है",
        as: "বতাহজাক শীতল লাগিছে",
      },
      {
        en: "The hills look greener",
        hi: "पहाड़ हरे-भरे दिखते हैं",
        as: "পাহাৰবোৰ সেউজীয়া হৈছে",
      },
    ],
    followUp: {
      en: "It really is calming. The mountain mist wraps around the valleys like a gentle embrace.",
      hi: "बिल्कुल सही! बादलों की चादर और ठंडी हवा मन को बहुत शांति देती है।",
      as: "হয়, বৰ শান্তিময়! পাহাৰৰ কুঁৱলীয়ে গোটেই উপত্যকাটো মৰমেৰে আৱৰি লয়।",
    },
  },
  {
    id: "songs",
    icon: Music,
    label: {
      en: "Folk Songs",
      hi: "मधुर लोकगीत",
      as: "সুৰীয়া লোকগীত",
    },
    saathiPrompt: {
      en: "Music connects us to the happiest days of our youth. Goalparia songs and Bihu dhol beats bring joy to everyone.",
      hi: "संगीत हमारे दिल को सबसे पुरानी और प्यारी यादों से जोड़ता है। क्या आपको पुराने लोकगीत याद हैं?",
      as: "গানে আমাৰ মনলৈ যৌৱনৰ ধুনীয়া দিনবোৰ ঘূৰাই আনে। গোৱালপৰীয়া লোকগীত আৰু বিহুৰ ঢোলে মন নাচাই তোলে।",
    },
    patientReplies: [
      {
        en: "Hum a gentle melody",
        hi: "एक मीठी धुन गुनगुनाएं",
        as: "এটা মিঠা সুৰ গুণগুণাওক",
      },
      {
        en: "I remember the Bihu tunes",
        hi: "मुझे लोकगीत पसंद हैं",
        as: "বিহুৰ সুৰ মনত পৰে",
      },
      {
        en: "Music brings me peace",
        hi: "संगीत से सुकून मिलता है",
        as: "গানে মন জুৰায়",
      },
    ],
    followUp: {
      en: "Humming together... La la la... Your warm smile brings so much brightness to my heart today.",
      hi: "ला ला ला... आपके साथ यह पल बिताना बहुत सुखद लग रहा है। आप मुस्कुराते हुए बहुत अच्छे लगते हैं।",
      as: "লা লা লা... আপোনাৰ লগত এই সময়খিনি কটোৱাটো মোৰ বাবে বৰ আনন্দৰ। আপুনি হাঁহিলে বৰ ভাল লাগে।",
    },
  },
  {
    id: "garden",
    icon: Flower2,
    label: {
      en: "Village Garden",
      hi: "बगीचे के फूल",
      as: "কপৌ ফুল আৰু ফুলনি",
    },
    saathiPrompt: {
      en: "Have you noticed the wild orchids blooming on the trees? In Assam, Kopou phool blooms with vibrant purple petals.",
      hi: "क्या आपने पेड़ों पर खिले सुंदर जंगली फूल देखे हैं? वसंत में खिलने वाले फूलों की सुंदरता मन मोह लेती है।",
      as: "গছৰ ডালত ফুলা কপৌ ফুলবোৰ দেখিছেনে? বসন্ত কালত এই বেঙুনীয়া ফুলবোৰে গোটেই গাঁওখন শুৱনি কৰে।",
    },
    patientReplies: [
      {
        en: "The purple orchids are lovely",
        hi: "फूल बहुत सुंदर हैं",
        as: "কপৌ ফুলবোৰ বৰ ধুনীয়া",
      },
      {
        en: "I enjoy tending flowers",
        hi: "मुझे पौधे लगाना पसंद है",
        as: "ফুলৰ যতন লৈ ভাল পাওঁ",
      },
      {
        en: "Nature is peaceful",
        hi: "प्रकृति बहुत शांत है",
        as: "প্ৰকৃতি বৰ অপৰূপ",
      },
    ],
    followUp: {
      en: "Nature never rushes, yet everything blooms beautifully. You have such a kind and gentle heart.",
      hi: "प्रकृति की हर चीज़ में एक सादगी और सुंदरता है। आपके साथ बात करके बहुत अच्छा लगा।",
      as: "প্ৰকৃতিৰ সকলো বস্তুৱেই সুন্দৰ। আপোনাৰ মনটোও বৰ সৰল আৰু মৰমিয়াল।",
    },
  },
  {
    id: "breath",
    icon: Wind,
    label: {
      en: "Calming Breath",
      hi: "शांत गहरी साँस",
      as: "শান্তিৰে উশাহ লওক",
    },
    saathiPrompt: {
      en: "Let us take a slow, gentle breath together. Breathe in the cool mountain breeze... and gently let it out. You are safe.",
      hi: "आइए साथ में एक धीमी और गहरी साँस लें। ताज़ा हवा अंदर लें... और धीरे से छोड़ें। आप सुरक्षित और शांत हैं।",
      as: "আহকচোন আমি একেলগে এটা দীঘল আৰু শান্ত উশাহ লওঁ। শীতল বতাহ উশাহত লওক... আৰু লাহেকৈ এৰি দিয়ক। আপুনি সম্পূৰ্ণ শান্তিত আছে।",
    },
    patientReplies: [
      {
        en: "I feel peaceful now",
        hi: "मुझे बहुत शांति मिली",
        as: "মনটো শান্ত হ'ল",
      },
      {
        en: "Let's breathe once more",
        hi: "एक बार फिर साँस लेते हैं",
        as: "আকৌ এবাৰ উশাহ লওঁ",
      },
      {
        en: "Thank you, Saathi",
        hi: "धन्यवाद साथी",
        as: "ধন্যবাদ সাৰথি",
      },
    ],
    followUp: {
      en: "Rest your shoulders and relax. I am always right here beside you whenever you want a friend to talk to.",
      hi: "अपने कंधों को ढीला छोड़ें। जब भी आपको किसी दोस्त की ज़रूरत हो, मैं हमेशा आपके साथ हूँ।",
      as: "শৰীৰটো পাতল কৰি দিয়ক। যেতিয়াই কথা পাতিবলৈ মন যায়, মই সদায় আপোনাৰ কাষতেই আছোঁ।",
    },
  },
];

export function CompanionGame() {
  const t = useTranslations("games");
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "companion", startLevel(detail));
  const rate = speechRate(detail);

  const [message, setMessage] = useState("");
  const [activeTopic, setActiveTopic] = useState<ConversationTopic | null>(null);
  const [replies, setReplies] = useState<{ en: string; hi: string; as: string }[]>([]);
  const [interactionCount, setInteractionCount] = useState(0);
  const [mood, setMood] = useState<"welcoming" | "listening" | "happy" | "peaceful">("welcoming");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const loc = (locale === "hi" || locale === "as" ? locale : "en") as "en" | "hi" | "as";
  const gameStrings = useMemo(() => getGameStrings("companion", locale), [locale]);

  // Personal joy prompts if configured in patient chart
  const joyPrompts = useMemo<string[]>(() => {
    const fromJoy = (detail?.joyTriggers ?? "")
      .split(/[.,;，。;]/)
      .map((s) => s.trim())
      .filter(Boolean);
    return fromJoy;
  }, [detail]);

  // Initialize companion greeting
  useEffect(() => {
    const now = new Date().toISOString();
    setStartedAt(now);

    let greeting = "";
    if (loc === "hi") {
      greeting = detail?.name
        ? `नमस्ते ${detail.name} जी! मैं आपका प्यारा साथी हूँ। आज आप कैसा महसूस कर रहे हैं?`
        : "नमस्ते! मैं आपका प्यारा साथी हूँ। आज आप कैसा महसूस कर रहे हैं?";
    } else if (loc === "as") {
      greeting = detail?.name
        ? `নমস্কাৰ ${detail.name} ডাঙৰীয়া! মই আপোনাৰ মৰমৰ সাৰথি। আজি আপোনাৰ মনটো কেনে আছে?`
        : "নমস্কাৰ! মই আপোনাৰ মৰমৰ সাৰথি। আজি আপোনাৰ মনটো কেনে আছে?";
    } else {
      greeting = detail?.name
        ? `Hello ${detail.name}! I am your friendly companion Saathi. How are you feeling today?`
        : "Hello! I am your friendly companion Saathi. How are you feeling today?";
    }

    setMessage(greeting);
    playEncourage();

    if (!isVoiceMuted && speechSupported()) {
      setIsSpeaking(true);
      speak(greeting, locale, rate);
      const timer = window.setTimeout(() => setIsSpeaking(false), 3500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, loc]);

  // Session guard for abandonment / telemetry
  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "companion",
    level,
    startedAt,
    taps: interactionCount,
    errorCount: 0,
  });

  const speakAloud = useCallback(
    (text: string) => {
      if (isVoiceMuted || !speechSupported()) return;
      stopSpeaking();
      setIsSpeaking(true);
      speak(text, locale, rate);
      const estimatedDuration = Math.max(2000, (text.length / 15) * 1000);
      window.setTimeout(() => setIsSpeaking(false), estimatedDuration);
    },
    [isVoiceMuted, locale, rate]
  );

  const selectTopic = (topic: ConversationTopic) => {
    playPress();
    setActiveTopic(topic);
    setMood("listening");
    const promptText = topic.saathiPrompt[loc];
    setMessage(promptText);
    setReplies(topic.patientReplies);
    setInteractionCount((c) => c + 1);
    speakAloud(promptText);
  };

  const handlePatientReply = (reply: { en: string; hi: string; as: string }) => {
    playCorrect();
    setMood("happy");
    const followUpText = activeTopic
      ? activeTopic.followUp[loc]
      : loc === "hi"
      ? "आपकी यह बात सुनकर दिल खुश हो गया! आप बहुत प्यारे हैं।"
      : loc === "as"
      ? "আপোনাৰ কথা শুনি মনটো জুৰ পৰিল! আপুনি বৰ মৰমিয়াল।"
      : "That warms my heart! Talking with you always brings joy.";

    setMessage(followUpText);
    setReplies([]);
    const nextCount = interactionCount + 1;
    setInteractionCount(nextCount);
    speakAloud(followUpText);

    // After 4 meaningful exchanges, offer a gentle celebration milestone
    if (nextCount >= 4 && !showCelebration) {
      window.setTimeout(() => {
        if (patientId && startedAt) {
          recordGameSession(patientId, {
            gameId: "companion",
            level,
            outcome: "completed",
            score: 100,
            startedAt,
            taps: nextCount,
            errorCount: 0,
          });
        }
        setShowCelebration(true);
      }, 3000);
    }
  };

  const triggerJoyAffirmation = () => {
    playPress();
    setMood("happy");
    let line = "";
    if (joyPrompts.length > 0) {
      line = joyPrompts[interactionCount % joyPrompts.length];
    } else if (loc === "hi") {
      line = "आप हमारे परिवार का सबसे अनमोल हिस्सा हैं। आपकी मुस्कान ही हमारी खुशी है!";
    } else if (loc === "as") {
      line = "আপুনি আমাৰ পৰিয়ালৰ আটাইতকৈ মৰমৰ মানুহ। আপোনাৰ হাঁহিয়ে আমাক শক্তি দিয়ে!";
    } else {
      line = "You are cherished, deeply loved, and a blessing to everyone around you.";
    }

    setMessage(line);
    setInteractionCount((c) => c + 1);
    speakAloud(line);
  };

  // Speech-to-text Web Speech API integration
  const toggleSpeechRecognition = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = loc === "as" ? "as-IN" : loc === "hi" ? "hi-IN" : "en-IN";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          playTapFeedback();
          const response =
            loc === "hi"
              ? `मैंने सुना: "${transcript}"! आपसे बात करके बहुत अच्छा लग रहा है।`
              : loc === "as"
              ? `মই শুনিলোঁ: "${transcript}"! আপোনাৰ মাতটো শুনি বৰ ভাল লাগিল।`
              : `I heard: "${transcript}"! Your voice always brings warmth.`;
          setMessage(response);
          setInteractionCount((c) => c + 1);
          speakAloud(response);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
      setIsListening(true);
    } catch {
      setIsListening(false);
    }
  };

  const restartConversation = () => {
    setShowCelebration(false);
    setActiveTopic(null);
    setReplies([]);
    setMood("welcoming");
    const greeting =
      loc === "hi"
        ? "आइए फिर से बात करते हैं! आपको कौन सी बात अच्छी लगती है?"
        : loc === "as"
        ? "আহক আকৌ কথা পাতোঁ! আপুনি কিহৰ বিষয়ে কথা পাতি ভাল পাব?"
        : "Let us talk again! What topic would you like to explore?";
    setMessage(greeting);
    speakAloud(greeting);
  };

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell>
      {showCelebration ? (
        <Celebration
          title={gameStrings.celebrationTitle}
          subtitle={gameStrings.celebrationSubtitle}
          emoji="🌸"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <ChunkyButton
              variant="marigold"
              size="xl"
              onClick={restartConversation}
              icon={<RotateCcw className="h-5 w-5" />}
            >
              {gameStrings.playAgainButton}
            </ChunkyButton>
            <Link
              href="/patient/games"
              className="btn-chunky btn-chunky-outline inline-flex min-h-[52px] items-center gap-2 px-6 py-3 font-black text-ink"
            >
              <Gamepad2 className="h-5 w-5" />
              <span>{gameStrings.backToHub}</span>
            </Link>
          </div>
        </Celebration>
      ) : (
        <div className="flex flex-col items-center gap-6 py-4">
          {/* Saathi Companion Avatar Card */}
          <div className="relative flex w-full max-w-lg flex-col items-center justify-center gap-3 rounded-3xl border-2 border-tea/50 bg-amber-50/70 p-6 text-center shadow-sm">
            {/* Audio narration mute / speech toggle */}
            <div className="absolute right-4 top-4 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (!isVoiceMuted) stopSpeaking();
                  setIsVoiceMuted((v) => !v);
                }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white text-ink shadow-sm hover:bg-tea-light/40"
                aria-label={isVoiceMuted ? "Unmute Saathi" : "Mute Saathi"}
                title={isVoiceMuted ? "Turn Voice On" : "Turn Voice Off"}
              >
                {isVoiceMuted ? (
                  <VolumeX className="h-5 w-5 text-ink-muted" />
                ) : (
                  <Volume2 className={`h-5 w-5 ${isSpeaking ? "text-tea animate-pulse" : "text-ink"}`} />
                )}
              </button>
            </div>

            {/* Avatar Circle with expressive aura */}
            <div className="relative">
              <div
                className={`flex h-28 w-28 items-center justify-center rounded-full border-4 border-tea bg-gradient-to-b from-white to-amber-100 shadow-md transition-all duration-300 ${
                  isSpeaking
                    ? "scale-105 ring-8 ring-tea/20"
                    : mood === "happy"
                    ? "scale-105 ring-4 ring-emerald-300/40"
                    : "hover:scale-102"
                }`}
              >
                {mood === "happy" ? (
                  <Smile className="h-16 w-16 text-emerald-600 animate-pulse" />
                ) : mood === "peaceful" ? (
                  <Heart className="h-16 w-16 text-rose-500 animate-pulse" />
                ) : (
                  <User className="h-16 w-16 text-tea" />
                )}
              </div>
              {isSpeaking && (
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-tea text-white shadow">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                </span>
              )}
            </div>

            {/* Companion Name & Supportive Tagline */}
            <div>
              <h2 className="text-xl font-black text-ink">
                {loc === "hi" ? "साथी (सखा)" : loc === "as" ? "সাৰথি (মৰমৰ বন্ধু)" : "Saathi (Friendly Companion)"}
              </h2>
              <p className="text-sm font-semibold text-ink-secondary">
                {loc === "hi"
                  ? "हमेशा आपकी बात सुनने और साथ देने के लिए तैयार"
                  : loc === "as"
                  ? "আপোনাৰ কথা শুনিবলৈ আৰু সংগ দিবলৈ সদায় সাজু"
                  : "Here to listen, converse, and share a gentle smile"}
              </p>
            </div>

            {/* Speech Bubble / Message display */}
            {message && (
              <div
                className="mt-2 w-full rounded-2xl border-2 border-tea/40 bg-white px-5 py-4 text-center text-lg font-bold leading-relaxed text-ink shadow-sm"
                role="status"
                aria-live="polite"
              >
                <p>{message}</p>
                <button
                  type="button"
                  onClick={() => speakAloud(message)}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-tea-light/40 px-3 py-1 text-xs font-bold text-tea-dark hover:bg-tea-light"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>{loc === "hi" ? "फिर से सुनें" : loc === "as" ? "পুনৰ শুনক" : "Listen Again"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick-reply chips (Errorless conversational scaffolding for aphasia/hesitation) */}
          {replies.length > 0 && (
            <div className="flex w-full max-w-lg flex-col items-center gap-2">
              <p className="text-sm font-bold text-ink-muted">
                {loc === "hi"
                  ? "एक उत्तर चुनें (टैप करें):"
                  : loc === "as"
                  ? "এটা উত্তৰ বাছক (টিপক):"
                  : "Choose a quick reply:"}
              </p>
              <div className="flex flex-wrap justify-center gap-2.5">
                {replies.map((rep, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handlePatientReply(rep)}
                    className="min-h-[50px] rounded-2xl border-2 border-emerald-600 bg-white px-5 py-2.5 text-base font-bold text-ink shadow-sm hover:border-emerald-700 hover:bg-emerald-50 active:scale-95 transition-all"
                  >
                    {rep[loc]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Culturally grounded reminiscence topic buttons (CST Spector et al. Lancet 2003) */}
          <div className="flex w-full max-w-lg flex-col gap-2.5">
            <p className="text-center text-sm font-bold text-ink-secondary">
              {loc === "hi"
                ? "बातचीत के विषय चुनें:"
                : loc === "as"
                ? "কথা-বতৰাৰ বিষয় বাছক:"
                : "Choose a conversation topic:"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {TOPICS.map((topic) => {
                const IconComponent = topic.icon;
                const isSelected = activeTopic?.id === topic.id;
                return (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => selectTopic(topic)}
                    className={`flex min-h-[64px] flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2.5 text-center transition-all ${
                      isSelected
                        ? "border-tea bg-tea-light/50 font-black text-tea-dark shadow-sm"
                        : "border-border bg-white font-bold text-ink hover:border-tea hover:bg-amber-50/50"
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 ${isSelected ? "text-tea-dark" : "text-ink-secondary"}`} />
                    <span className="text-xs leading-tight">{topic.label[loc]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Row: Cheer Me Up Affirmation, Voice Input, Games Navigation */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <ChunkyButton
              variant="marigold"
              size="xl"
              onClick={triggerJoyAffirmation}
              icon={<Sparkles className="h-5 w-5" />}
            >
              {loc === "hi" ? "मुस्कान बांटें" : loc === "as" ? "হাঁহি বিলাওক" : "Cheer Me Up"}
            </ChunkyButton>

            {/* Optional Speech-to-Text Microphone button if supported */}
            {typeof window !== "undefined" &&
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) && (
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`inline-flex min-h-[52px] items-center gap-2 rounded-2xl border-2 px-4 py-2.5 font-bold shadow-sm transition-all ${
                    isListening
                      ? "border-red-500 bg-red-50 text-red-700 animate-pulse"
                      : "border-border bg-white text-ink hover:bg-slate-50"
                  }`}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-tea" />}
                  <span>
                    {isListening
                      ? loc === "hi"
                        ? "सुन रहा हूँ..."
                        : loc === "as"
                        ? "শুনি আছোঁ..."
                        : "Listening..."
                      : loc === "hi"
                      ? "बोलकर कहें"
                      : loc === "as"
                      ? "কৈ শুনক"
                      : "Speak to Saathi"}
                  </span>
                </button>
              )}

            <Link
              href="/patient/games"
              className="btn-chunky btn-chunky-outline inline-flex min-h-[52px] items-center gap-2 px-4 py-2.5"
            >
              <Gamepad2 className="h-5 w-5" />
              <span>{t("companion.games")}</span>
            </Link>
          </div>
        </div>
      )}
    </GameShell>
  );

  function GameShell({ children }: { children: React.ReactNode }) {
    return (
      <section className="pb-10 min-h-screen bg-canvas">
        <GameHeader
          title={gameStrings.title}
          score={Math.min(100, interactionCount * 25)}
          backHref="/patient/games"
          bgColor="bg-tea"
          gameId="companion"
        />
        <div className="mx-auto max-w-3xl px-4">{children}</div>
      </section>
    );
  }
}