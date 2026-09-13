"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Camera,
  RotateCcw,
  CheckCircle2,
  Hand,
  Music,
  Volume2,
  VolumeX,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Leaf,
} from "lucide-react";
import { AssamTeaLeafIcon } from "@/components/ui/CulturalIcons";
import { GameHeader } from "@/components/layout/GameHeader";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { useGameVoice } from "@/hooks/useGameVoice";
import { submitGameSessionTelemetry } from "@/lib/gameTelemetry";
import { useAuthStore } from "@/store/useAuthStore";
import { remapCamToScreen, drawCroppedCameraFeed } from "@/lib/vision";
import {
  playPress,
  playCorrect,
  playComplete,
  playLeafPluck,
  playLifeSong,
} from "@/lib/sound";

export interface TeaShoot {
  id: number;
  xPct: number;
  yPct: number;
  scale: number;
  isPlucked: boolean;
  leafType: "orthodox_bud" | "green_leaf" | "tender_sprout";
}

const INITIAL_SHOOTS: TeaShoot[] = [
  { id: 1, xPct: 22, yPct: 35, scale: 1, isPlucked: false, leafType: "orthodox_bud" },
  { id: 2, xPct: 45, yPct: 25, scale: 1, isPlucked: false, leafType: "orthodox_bud" },
  { id: 3, xPct: 78, yPct: 32, scale: 1, isPlucked: false, leafType: "orthodox_bud" },
  { id: 4, xPct: 30, yPct: 68, scale: 1, isPlucked: false, leafType: "green_leaf" },
  { id: 5, xPct: 60, yPct: 62, scale: 1, isPlucked: false, leafType: "orthodox_bud" },
  { id: 6, xPct: 82, yPct: 74, scale: 1, isPlucked: false, leafType: "tender_sprout" },
];

interface TeaHarvestStrings {
  bilateralVerified: string;
  points: (p: number) => string;
  shootsRatio: (p: number, t: number) => string;
  playFolkSong: string;
  mindfulnessPluck: string;
  khorahiBasket: string;
  unmute: string;
  mute: string;
  trackingActive: string;
  touchMode: string;
  twoLeavesAria: string;
  pluck: string;
  handDetectedPrompt: string;
  motionPhysicalExercise: string;
}

const TEA_HARVEST_I18N: Record<string, TeaHarvestStrings> = {
  en: {
    bilateralVerified: "Bilateral Motion Entrainment Verified",
    points: (p) => `+${p} Points`,
    shootsRatio: (p, t) => `${p} / ${t} Shoots`,
    playFolkSong: "Play Tea Garden Folk Song",
    mindfulnessPluck: "Mindfulness Pluck",
    khorahiBasket: "Khorahi Basket",
    unmute: "Unmute Voice",
    mute: "Mute Voice",
    trackingActive: "Tracking Active",
    touchMode: "Touch Mode",
    twoLeavesAria: "Two leaves and a bud",
    pluck: "Pluck",
    handDetectedPrompt: "Hand detected: Hover over leaves to pluck",
    motionPhysicalExercise: "Motion Physical Exercise:",
  },
  as: {
    bilateralVerified: "উভয়হাতৰ সমন্বিত চালনা প্ৰমাণিত",
    points: (p) => `+${p} নম্বৰ`,
    shootsRatio: (p, t) => `${p} / ${t} খিলা কলি`,
    playFolkSong: "চাহ বাগিচাৰ ঝুমুৰ গীত শুনাওক",
    mindfulnessPluck: "মনোযোগপূৰ্ণ পাত তোলা",
    khorahiBasket: "খোৰাহী বাস্কেট",
    unmute: "শব্দ শুনক",
    mute: "শব্দ বন্ধ কৰক",
    trackingActive: "কেমেৰা দৃষ্টি সক্ৰিয়",
    touchMode: "স্পৰ্শ ম'ড",
    twoLeavesAria: "দুটি পাত আৰু এটা কলি",
    pluck: "তোলক",
    handDetectedPrompt: "হাত দেখা পোৱা গৈছে: পাত তোলাৰ বাবে হাতখন পাতৰ ওপৰলৈ আনক",
    motionPhysicalExercise: "শাৰীৰিক গতি ব্যায়াম:",
  },
  hi: {
    bilateralVerified: "द्विपक्षीय गति समन्वय सत्यापित",
    points: (p) => `+${p} अंक`,
    shootsRatio: (p, t) => `${p} / ${t} पत्तियां`,
    playFolkSong: "चाय बागान लोकगीत बजाएं",
    mindfulnessPluck: "सजगता से पत्ती तोड़ना",
    khorahiBasket: "खोराही टोकरी",
    unmute: "आवाज़ चालू करें",
    mute: "आवाज़ बंद करें",
    trackingActive: "कैमरा ट्रैकिंग सक्रिय",
    touchMode: "स्पर्श मोड",
    twoLeavesAria: "दो पत्तियां और एक कली",
    pluck: "तोड़ें",
    handDetectedPrompt: "हाथ की पहचान हुई: तोड़ने के लिए पत्तियों के ऊपर हाथ लाएं",
    motionPhysicalExercise: "गतिशील शारीरिक व्यायाम:",
  },
  bn: {
    bilateralVerified: "উভয় হাতের গতি সমন্বয় যাচাইকৃত",
    points: (p) => `+${p} পয়েন্ট`,
    shootsRatio: (p, t) => `${p} / ${t} পাতা`,
    playFolkSong: "চা বাগানের লোকগীতি বাজান",
    mindfulnessPluck: "মনোযোগ সহকারে তোলা",
    khorahiBasket: "খোরাহী ঝুড়ি",
    unmute: "শব্দ চালু",
    mute: "শব্দ বন্ধ",
    trackingActive: "ক্যামেরা ট্র্যাকিং সক্রিয়",
    touchMode: "টাচ মোড",
    twoLeavesAria: "দুটি পাতা ও একটি কুঁড়ি",
    pluck: "তুলুন",
    handDetectedPrompt: "হাত চিহ্নিত হয়েছে: তোলার জন্য পাতার উপর হাত আনুন",
    motionPhysicalExercise: "শারীরিক ব্যায়াম:",
  },
  mr: {
    bilateralVerified: "दोन्ही हातांचा समन्वय प्रमाणित",
    points: (p) => `+${p} गुण`,
    shootsRatio: (p, t) => `${p} / ${t} चहाची पाने`,
    playFolkSong: "चहाच्या मळ्याचे लोकगीत ऐका",
    mindfulnessPluck: "शांततेने पाने खुडणे",
    khorahiBasket: "खोराही टोपली",
    unmute: "आवाज सुरू",
    mute: "आवाज बंद",
    trackingActive: "कॅमेरा ट्रॅकिंग सुरू",
    touchMode: "स्पर्श मोड",
    twoLeavesAria: "दोन पाने आणि एक कळी",
    pluck: "खुडा",
    handDetectedPrompt: "हात ओळखला गेला: पाने खुडण्यासाठी हात पानांवर आणा",
    motionPhysicalExercise: "शारीरिक हालचालीचा व्यायाम:",
  },
  ne: {
    bilateralVerified: "दुवै हातको गति समन्वय प्रमाणित",
    points: (p) => `+${p} अंक`,
    shootsRatio: (p, t) => `${p} / ${t} मुनाहरू`,
    playFolkSong: "चिया बगानको लोकगीत बजाउनुहोस्",
    mindfulnessPluck: "सजग भएर टिप्ने",
    khorahiBasket: "खोराही टोकरी",
    unmute: "आवाज खोल्नुहोस्",
    mute: "आवाज बन्द गर्नुहोस्",
    trackingActive: "क्यामेरा ट्र्याकिङ सक्रिय",
    touchMode: "टच मोड",
    twoLeavesAria: "दुई पात र एक मुना",
    pluck: "टिप्नुहोस्",
    handDetectedPrompt: "हात देखियो: पात टिप्न हात पातमाथि लैजानुहोस्",
    motionPhysicalExercise: "शारीरिक अभ्यास:",
  },
  mni: {
    bilateralVerified: "খুৎ অনিমক্কী চৎন-লোন য়েংশিল্লবা",
    points: (p) => `+${p} পোইন্ট`,
    shootsRatio: (p, t) => `${p} / ${t} মনাশিং`,
    playFolkSong: "চা পাম্বীগী সেইহৌ শাইয়ু",
    mindfulnessPluck: "ৱাখল তমদুনা লৌবা",
    khorahiBasket: "খোরাহী থুম্বক",
    unmute: "খোন্থোক থোকহল্লু",
    mute: "খোন্থোক লেপ্পু",
    trackingActive: "কেমেরা ত্রেকিং চৎলি",
    touchMode: "তেচ মোদ",
    twoLeavesAria: "মনা অনি অমসুং অপিকপা মকোল",
    pluck: "লৌউ",
    handDetectedPrompt: "খুৎ উরে: মনা লৌনবা খুৎ মথক্তা থম্মু",
    motionPhysicalExercise: "হকচাংগী এক্সরসাইজ:",
  },
  brx: {
    bilateralVerified: "मोननै आखायनि लोरसोर सोदोब जाबाय",
    points: (p) => `+${p} नम्बर`,
    shootsRatio: (p, t) => `${p} / ${t} बिलाइफोर`,
    playFolkSong: "साहा बारिनि मेथाइ दाम",
    mindfulnessPluck: "गोसो होनानै बिलाइ खावनाय",
    khorahiBasket: "खोराही संब्रा",
    unmute: "राव खोनासंनाय",
    mute: "राव बन्द",
    trackingActive: "केमेरा नायारनाय मावफुं",
    touchMode: "दांनाय म'ड",
    twoLeavesAria: "मोननै बिलाइ आरो मोनसे बुरसुं",
    pluck: "खाव",
    handDetectedPrompt: "आखाइ नुबाय: खावनो आखाइखौ बिलाइनि सायाव लाबो",
    motionPhysicalExercise: "गाहोम मोदोमनि बेयाम:",
  },
  grt: {
    bilateralVerified: "Jakgni moani kakket ong·a",
    points: (p) => `+${p} Point-rang`,
    shootsRatio: (p, t) => `${p} / ${t} Bijakrang`,
    playFolkSong: "Cha A·ba Git Ringo Dokbo",
    mindfulnessPluck: "Gisik Nang·e Bijak Ak·ani",
    khorahiBasket: "Khorahi Kok",
    unmute: "Ku·rang Khnaatbo",
    mute: "Ku·rang Dingtangatbo",
    trackingActive: "Camera Tracking Kam Ka·enga",
    touchMode: "Nang·atani Mode",
    twoLeavesAria: "Bijak ge·gni aro komilgipa jaksi",
    pluck: "Ak·bo",
    handDetectedPrompt: "Jak nikaha: Ak·na gita jakko bijak kosako donbo",
    motionPhysicalExercise: "Be·en Bimang Moani Exercise:",
  },
  kha: {
    bilateralVerified: "Ka Jingpynkhih Kti Baroh Ar La Pynshisha",
    points: (p) => `+${p} Point`,
    shootsRatio: (p, t) => `${p} / ${t} Sla Sha`,
    playFolkSong: "Tem Jingrwai Shnong Sha",
    mindfulnessPluck: "Kheit Sla da ka Jingmut ba Jem",
    khorahiBasket: "Khanglang Khorahi",
    unmute: "Plie Sur",
    mute: "Kylliang Sur",
    trackingActive: "Camera Tracking Trei Kam",
    touchMode: "Kti Shon Mode",
    twoLeavesAria: "Ar sla bad uwei u thnam",
    pluck: "Kheit",
    handDetectedPrompt: "La iohi ia ka kti: Pynhiar kti halor sla ban kheit",
    motionPhysicalExercise: "Jingpynkhih Met:",
  },
  lus: {
    bilateralVerified: "Kut Hnih Chettir Inremna Fiah a ni",
    points: (p) => `+${p} Points`,
    shootsRatio: (p, t) => `${p} / ${t} Hnah`,
    playFolkSong: "Thingpui Hmun Hla Ti-ri rawh",
    mindfulnessPluck: "Rilru Nuam Taka Thingpui Hnah Lohtheihna",
    khorahiBasket: "Khorahi Bawm",
    unmute: "Aw ti-chhuak rawh",
    mute: "Aw ti-tawp rawh",
    trackingActive: "Camera Tracking Kal Mek",
    touchMode: "Hmeh Chi Mode",
    twoLeavesAria: "Hnah hnih leh a chawr no pakhat",
    pluck: "Loh Rawh",
    handDetectedPrompt: "Kut hmuh a ni: Thingpui hnah loh turin kut dah hnai rawh",
    motionPhysicalExercise: "Taksa Chettirna Insawizawina:",
  },
};

export function TeaHarvestVision() {
  const t = useTranslations("games.teaHarvest");
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const m = TEA_HARVEST_I18N[normLoc] || TEA_HARVEST_I18N.en;

  const patient = useAuthStore((s) => s.patient);
  const patientId = patient?.id ?? 0;

  const { speakVoice, stopVoice, isMuted, toggleMute, currentSubtitle } = useGameVoice();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const prevFrameDataRef = useRef<Uint8ClampedArray | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [shoots, setShoots] = useState<TeaShoot[]>(INITIAL_SHOOTS);
  const [handPos, setHandPos] = useState<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });
  const [pluckedCount, setPluckedCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [score, setScore] = useState(0);

  // Telemetry session tracking
  const startTimeRef = useRef<number>(0);
  const reactionTimesRef = useRef<number[]>([]);
  const lastPluckTimeRef = useRef<number>(0);

  // Frame processing loop for optical motion tracking (1:1 viewport reach to all corners)
  const processFrame = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      video: HTMLVideoElement,
      width: number,
      height: number
    ): { handX: number; handY: number; isTracking: boolean } => {
      // 1:1 Mirrored & Cropped camera feed matching screen viewport
      drawCroppedCameraFeed(ctx, video, width, height);

      ctx.fillStyle = "rgba(20, 83, 45, 0.15)";
      ctx.fillRect(0, 0, width, height);

      let motionX = width / 2;
      let motionY = height / 2;
      let hasMotion = false;

      try {
        const frame = ctx.getImageData(0, 0, width, height);
        const data = frame.data;
        const prev = prevFrameDataRef.current;

        if (prev && prev.length === data.length) {
          let sumX = 0;
          let sumY = 0;
          let motionPixels = 0;

          const step = 8;
          for (let y = 0; y < height; y += step) {
            for (let x = 0; x < width; x += step) {
              const i = (y * width + x) * 4;
              const diff =
                Math.abs(data[i] - prev[i]) +
                Math.abs(data[i + 1] - prev[i + 1]) +
                Math.abs(data[i + 2] - prev[i + 2]);

              if (diff > 85) {
                sumX += x;
                sumY += y;
                motionPixels++;
              }
            }
          }

          if (motionPixels > 40) {
            motionX = sumX / motionPixels;
            motionY = sumY / motionPixels;
            hasMotion = true;
          }
        }
        prevFrameDataRef.current = new Uint8ClampedArray(data);
      } catch {
        // Ignore canvas security errors on raw streams
      }

      let finalHandX = width / 2;
      let finalHandY = height / 2;

      if (hasMotion) {
        // 1:1 camera viewport mapping so motion in front of camera reaches all 4 corners of the game
        const normX = motionX / width;
        const normY = motionY / height;
        const remapped = remapCamToScreen(normX, normY);
        finalHandX = remapped.screenX * width;
        finalHandY = remapped.screenY * height;

        ctx.beginPath();
        ctx.arc(finalHandX, finalHandY, 32, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(250, 204, 21, 0.4)";
        ctx.fill();
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#F59E0B";
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(finalHandX, finalHandY, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#FFFFFF";
        ctx.fill();
      }

      return { handX: finalHandX, handY: finalHandY, isTracking: hasMotion };
    },
    []
  );

  // Initialize camera and animation loop
  useEffect(() => {
    let active = true;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: "user" },
          audio: false,
        });

        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            if (active) {
              videoRef.current?.play().catch(() => {});
              setCameraActive(true);
            }
          };
        }
      } catch {
        // Touch fallback
      }
    }

    startCamera();
    startTimeRef.current = Date.now();
    lastPluckTimeRef.current = Date.now();

    speakVoice(t("welcomeSpeech"));

    const renderLoop = () => {
      animFrameRef.current = requestAnimationFrame(renderLoop);

      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video || video.readyState < 2) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      const { handX, handY, isTracking } = processFrame(ctx, video, w, h);
      setHandPos({ x: handX, y: handY, active: isTracking });

      if (isTracking) {
        setShoots((currentShoots) => {
          let updated = false;
          const next = currentShoots.map((shoot) => {
            if (shoot.isPlucked) return shoot;

            const shootPxX = (shoot.xPct / 100) * w;
            const shootPxY = (shoot.yPct / 100) * h;
            const dist = Math.hypot(handX - shootPxX, handY - shootPxY);

            if (dist < 58) {
              updated = true;
              playLeafPluck();
              playCorrect();

              const now = Date.now();
              reactionTimesRef.current.push(now - lastPluckTimeRef.current);
              lastPluckTimeRef.current = now;

              return { ...shoot, isPlucked: true, scale: 0 };
            }
            return shoot;
          });

          if (updated) {
            const count = next.filter((s) => s.isPlucked).length;
            setPluckedCount(count);
            setScore(count * 25);

            // Encouragement speech at milestones (every 5 leaves or halfway)
            if (count === 5) {
              speakVoice(t("encouragement"));
            }

            if (count === next.length) {
              setTimeout(() => {
                playComplete();
                setIsFinished(true);

                // Submit Session Telemetry
                const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
                const avgReaction =
                  reactionTimesRef.current.length > 0
                    ? reactionTimesRef.current.reduce((a, b) => a + b, 0) /
                      reactionTimesRef.current.length
                    : 1400;

                void submitGameSessionTelemetry({
                  patientId,
                  gameType: "TEA_HARVEST",
                  durationSeconds: duration,
                  accuracyPercentage: 100,
                  motorReactionTimeMs: Math.round(avgReaction),
                  hesitationCount: 0,
                  difficultyLevel: 1,
                });

                speakVoice(t("basketFull"));
              }, 400);
            }
          }

          return updated ? next : currentShoots;
        });
      }
    };

    renderLoop();

    return () => {
      active = false;
      stopVoice();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [processFrame, speakVoice, stopVoice, t, patientId]);

  const handleTouchShoot = (id: number) => {
    setShoots((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, isPlucked: true, scale: 0 } : s));
      const count = next.filter((s) => s.isPlucked).length;
      playLeafPluck();
      playCorrect();
      setPluckedCount(count);
      setScore(count * 25);

      if (count === 5) {
        speakVoice(t("encouragement"));
      }

      if (count === next.length) {
        setTimeout(() => {
          playComplete();
          setIsFinished(true);

          const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
          void submitGameSessionTelemetry({
            patientId,
            gameType: "TEA_HARVEST",
            durationSeconds: duration,
            accuracyPercentage: 100,
            motorReactionTimeMs: 1200,
            hesitationCount: 0,
            difficultyLevel: 1,
          });

          speakVoice(t("basketFull"));
        }, 400);
      }
      return next;
    });
  };

  const resetHarvest = () => {
    playPress();
    setShoots(INITIAL_SHOOTS);
    setPluckedCount(0);
    setScore(0);
    setIsFinished(false);
    startTimeRef.current = Date.now();
    lastPluckTimeRef.current = Date.now();
    reactionTimesRef.current = [];
    speakVoice(t("welcomeSpeech"));
  };

  return (
    <section className="min-h-screen bg-[#FAF6F0] pb-12 select-none">
      <GameHeader
        title={t("title")}
        score={score}
        backHref="/patient/games"
        bgColor="bg-[#14532D]"
      />

      <div className="mx-auto max-w-3xl px-4 pt-4">
        {/* Visual Subtitle Pill Fallback */}
        {currentSubtitle && (
          <div className="mb-3 flex items-center justify-center animate-fade-in">
            <span className="rounded-full border-2 border-emerald-900/40 bg-emerald-100 px-4 py-1.5 text-xs font-black text-emerald-950 shadow-sm inline-flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{currentSubtitle}</span>
            </span>
          </div>
        )}

        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="hidden"
          width={640}
          height={480}
        />

        {isFinished ? (
          <Celebration
            title={t("basketFull")}
            subtitle={t("subtitle")}
            xpEarned={150}
            accuracy="100%"
          >
            <div className="mx-auto flex w-full max-w-md flex-col items-center gap-5 text-left">
              <div className="w-full rounded-3xl border-4 border-black bg-[#FAF5EE] p-5 shadow-[6px_6px_0px_#000]">
                <div className="flex items-center justify-between border-b-2 border-black/15 pb-2 mb-3">
                  <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    {m.bilateralVerified}
                  </span>
                  <span className="rounded bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-950 border border-emerald-900/30">
                    {m.points(score)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-ink py-1">
                  <span>{t("leavesPlucked")}:</span>
                  <span className="font-black text-emerald-700">
                    {m.shootsRatio(shoots.length, shoots.length)}
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between border-t-2 border-black/10 pt-3">
                  <button
                    type="button"
                    onClick={() => playLifeSong()}
                    className="group flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-200 px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] active:translate-y-0.5 cursor-pointer hover:bg-amber-300"
                  >
                    <Music className="h-4 w-4" />
                    <span>{m.playFolkSong}</span>
                  </button>
                  <span className="text-[11px] font-black text-ink-secondary">
                    {m.mindfulnessPluck}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                <ChunkyButton variant="tea" size="xl" onClick={resetHarvest}>
                  <span className="flex items-center gap-1.5">
                    <RotateCcw className="h-5 w-5" /> {t("playAgain")}
                  </span>
                </ChunkyButton>
                <Link
                  href="/patient/games"
                  className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-surface px-5 py-3 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted"
                >
                  {t("backToHub")}
                </Link>
              </div>
            </div>
          </Celebration>
        ) : (
          <div className="flex flex-col items-center gap-4">
            {/* Top HUD Banner */}
            <div className="flex w-full items-center justify-between rounded-2xl border-3 border-black bg-[#FAF3E0] px-4 py-2.5 shadow-[3px_3px_0px_#000]">
              <div className="flex items-center gap-2">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-emerald-400 text-emerald-950 font-black">
                  <ShoppingBag className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-[10px] font-black uppercase text-ink-secondary">
                    {m.khorahiBasket}
                  </span>
                  <div className="text-xs sm:text-sm font-black text-emerald-800">
                    {pluckedCount} / {shoots.length} {t("leavesPlucked")}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMute}
                  className="btn-tactile flex items-center gap-1 rounded-xl border-2 border-black bg-surface px-2.5 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
                  title={isMuted ? m.unmute : m.mute}
                >
                  {isMuted ? (
                    <VolumeX className="h-4 w-4 text-rose-600" />
                  ) : (
                    <Volume2 className="h-4 w-4 text-emerald-600" />
                  )}
                </button>

                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-black border ${
                    cameraActive
                      ? "bg-emerald-100 text-emerald-900 border-emerald-400"
                      : "bg-amber-100 text-amber-900 border-amber-400"
                  }`}
                >
                  {cameraActive ? <Camera className="h-3.5 w-3.5" /> : <Hand className="h-3.5 w-3.5" />}
                  <span>{cameraActive ? m.trackingActive : m.touchMode}</span>
                </span>
              </div>
            </div>

            {/* Main Interactive AR Canvas Container */}
            <div className="relative w-full overflow-hidden rounded-3xl border-4 border-black bg-[#064E3B] shadow-[8px_8px_0px_#000]">
              <canvas
                ref={canvasRef}
                width={640}
                height={420}
                className="h-[340px] sm:h-[420px] w-full object-cover"
              />

              {shoots.map((shoot) => {
                if (shoot.isPlucked) return null;

                return (
                  <button
                    key={shoot.id}
                    type="button"
                    onClick={() => handleTouchShoot(shoot.id)}
                    style={{
                      left: `${shoot.xPct}%`,
                      top: `${shoot.yPct}%`,
                      transform: `translate(-50%, -50%) scale(${shoot.scale})`,
                    }}
                    className="group absolute flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-125"
                    aria-label={m.twoLeavesAria}
                  >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl border-3 border-black bg-emerald-400 text-emerald-950 shadow-[3px_3px_0px_#000] animate-bounce ring-4 ring-yellow-300">
                      <AssamTeaLeafIcon className="w-8 h-8 text-emerald-950" />
                    </span>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-black/80 px-2 py-0.5 text-[9px] font-black text-yellow-300 border border-yellow-300/40">
                      <Sparkles className="w-2.5 h-2.5 text-yellow-300" />
                      <span>{m.pluck}</span>
                    </span>
                  </button>
                );
              })}

              {handPos.active && (
                <div className="absolute top-3 left-3 rounded-full bg-black/60 border border-white/20 px-3 py-1 text-xs font-black text-amber-300 backdrop-blur-sm pointer-events-none inline-flex items-center gap-1.5">
                  <Hand className="w-3.5 h-3.5 text-amber-300" />
                  <span>{m.handDetectedPrompt}</span>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="flex w-full items-center gap-3 rounded-2xl border-2 border-black/20 bg-surface p-3 text-left shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-emerald-100 text-emerald-800">
                <Leaf className="w-5 h-5" />
              </span>
              <p className="text-xs font-semibold text-ink">
                <span className="font-black text-emerald-900 uppercase text-[10px] block">
                  {m.motionPhysicalExercise}
                </span>
                {t("gentleHint")}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default TeaHarvestVision;
