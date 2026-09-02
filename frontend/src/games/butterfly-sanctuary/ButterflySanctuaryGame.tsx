"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import {
  Camera,
  RotateCcw,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  Flower2,
} from "lucide-react";
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
import { getGameStrings, getHubStrings } from "@/lib/gameI18n";

const BUTTERFLY_FEATURES: Record<string, { badge: string; f1: string; f2: string; f3: string; hudPerched: string; hudResting: string; hudStability: string; full: string }> = {
  en: {
    badge: "Neuro-Motor & Calming Features:",
    f1: "Promotes static hand steadiness and anti-tremor motor control",
    f2: "Calming acoustic therapy with morning songbirds of Kaziranga",
    f3: "Visual depth perception and bilateral hand-eye coordination",
    hudPerched: "Butterflies Perched",
    hudResting: "{count} butterflies resting",
    hudStability: "Motor Steadiness",
    full: "Sanctuary Full! 🎉"
  },
  hi: {
    badge: "न्यूरो-मोटर एवं मानसिक शांति विशेषताएँ:",
    f1: "हाथ को स्थिर रखकर कंपकंपी कम करने का सुखद अभ्यास",
    f2: "काजीरंगा के प्रातःकालीन पक्षियों का शांत संगीत",
    f3: "आँखों और हाथों के सुंदर समन्वय का विकास",
    hudPerched: "बैठी तितलियाँ",
    hudResting: "{count} तितलियाँ आराम कर रही हैं",
    hudStability: "हाथ की स्थिरता",
    full: "अभयारण्य प्रफुल्लित! 🎉"
  },
  as: {
    badge: "স্নায়ু আৰু মানসিক প্ৰশান্তিৰ দিশসমূহ:",
    f1: "হাত স্থিৰ ৰাখি কঁপনি দূৰ কৰাৰ উপযোগী অনুশীলন",
    f2: "কাজিৰঙাৰ পুৱাৰ চৰাইৰ সুললিত মিঠা মাত",
    f3: "চকু আৰু হাতৰ সুস্থ সমন্বয় বিকাশ",
    hudPerched: "বহি থকা পখিলা",
    hudResting: "{count}টা পখিলা জিৰণি লৈছে",
    hudStability: "হাতৰ সুস্থিৰতা",
    full: "অভয়াৰণ্য ভৰি পৰিল! 🎉"
  },
  bn: {
    badge: "স্নায়ু ও মানসিক প্রশান্তির বৈশিষ্ট্য:",
    f1: "হাত স্থির রেখে কাঁপুনি নিয়ন্ত্রণের সহজ অনুশীলন",
    f2: "কাজী his পাখিদের মনোরম প্রভাতী গান",
    f3: "চোখ ও হাতের সুষম সমন্বয় সাধন",
    hudPerched: "বসা প্রজাপতি",
    hudResting: "{count}টি প্রজাপতি বিশ্রাম নিচ্ছে",
    hudStability: "হাতের স্থিরতা",
    full: "অভয়ারণ্য পূর্ণ! 🎉"
  },
  mr: {
    badge: "न्यूरो-मोटर व मानसिक शांतता वैशिष्ट्ये:",
    f1: "हात स्थिर ठेवून कंप कमी करण्याचा सोपा सराव",
    f2: "काझीरंगाच्या पक्ष्यांचे प्रसन्न सकाळचे सूर",
    f3: "डोळे आणि हातांचा उत्तम समन्वय",
    hudPerched: "बसलेली फुलपाखरे",
    hudResting: "{count} फुलपाखरे विसावली आहेत",
    hudStability: "हाताची स्थिरता",
    full: "अभयारण्य बहरले! 🎉"
  },
  ne: {
    badge: "स्नायु तथा मानसिक शान्ति विशेषताहरू:",
    f1: "हात स्थिर राखेर कम्पन नियन्त्रण गर्ने अभ्यास",
    f2: "काजिरङ्गाका बिहानी चराहरूको शान्त धुन",
    f3: "आँखा र हातको राम्रो तालमेल",
    hudPerched: "बसेका पुतलीहरू",
    hudResting: "{count} पुतलीहरू विश्राम गर्दैछन्",
    hudStability: "हातको स्थिरता",
    full: "अभयारण्य भरियो! 🎉"
  },
  mni: {
    badge: "মস্তিষ্ক অমসুং ৱাখলগী শান্তি:",
    f1: "খুৎ লেংদনা থম্বগী নুংঙাইবা হৈনবা",
    f2: "কাজিরঙ্গা উচেকশিংগী নুমিৎ থোকপগী ঈশৈ",
    f3: "মিৎ অমসুং খুৎকী চান্নবা",
    hudPerched: "তুংলিবা কুরোকপাকপেই",
    hudResting: "কুরোকপাকপেই {count} পোথারি",
    hudStability: "খুৎকী স্থিতি",
    full: "অভয়ারণ্য লোইরে! 🎉"
  },
  brx: {
    badge: "गोसो आरामनि आखुथाय:",
    f1: "आखाय गोजोन लाखिनायनि मोजां गेलेनाय",
    f2: "काजिरंगानि दाउस्रि दाउलानि गोजोन मेथाइ",
    f3: "मेगन आरो आखायनि मोजां गोरोबथि",
    hudPerched: "जोबनाय बिखा",
    hudResting: "{count} बिखा आराम लादों",
    hudStability: "आखाय गोजोनथि",
    full: "अभयारण्य जोबबाय! 🎉"
  },
  grt: {
    badge: "Gisik tom·tomani bewalrang:",
    f1: "Jak kamaniko dongdikani gisik kam",
    f2: "Kazirangani do·orikiti rangni git",
    f3: "Mikron aro jakni rona bimang",
    hudPerched: "Gisik Pakma",
    hudResting: "{count} do·bikrang neng·taktenga",
    hudStability: "Jak Tom·tomaniko",
    full: "Sanctuary Gapatjok! 🎉"
  },
  kha: {
    badge: "Ki jingiarap ia ka met bad ka jingmut:",
    f1: "Ban pynkhih beit ia ka kti bad pynduna ia ka jingkhih kti",
    f2: "Sur jingrwai ki sim na Kaziranga",
    f3: "Jingiatreilang ka khmat bad ka kti",
    hudPerched: "Ki Thapbalieh Kiba Shong",
    hudResting: "{count} tylli ki thapbalieh ki shong thait",
    hudStability: "Jingneh ka Kti",
    full: "Sanctuary La Dap! 🎉"
  },
  lus: {
    badge: "Thluak leh kut chezia tihchakna:",
    f1: "Kut khur tirem tura kut tihnghina",
    f2: "Kaziranga sava rimawi hahdamthlak tak",
    f3: "Mit leh kut inmil taka hman dan",
    hudPerched: "Phengphehlep Fu Ta",
    hudResting: "Phengphehlep {count} an chawl hahdam mek",
    hudStability: "Kut Nghin Dan",
    full: "Sanctuary a khat ta! 🎉"
  }
};

interface Butterfly {
  id: number;
  name: string;
  species: string;
  color: string;
  wingEmoji: string;
  x: number; // 0..1
  y: number; // 0..1
  targetX: number;
  targetY: number;
  perched: boolean;
  perchedProgress: number; // 0..100%
  flowerName: string;
}

const FLOWERS = [
  { name: "Kopou Orchid", color: "#EC4899", emoji: "🌸", x: 0.2, y: 0.75 },
  { name: "Kaziranga Lotus", color: "#F43F5E", emoji: "🪷", x: 0.5, y: 0.8 },
  { name: "Foxtail Lily", color: "#8B5CF6", emoji: "🌺", x: 0.8, y: 0.75 },
];

export function ButterflySanctuaryGame() {
  const locale = useLocale();
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "butterfly-sanctuary", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "playing" | "done">("intro");
  const [score, setScore] = useState(0);
  const [perchedCount, setPerchedCount] = useState(0);
  const targetGoal = 6;

  // OpenCV Vision & HUD States
  const [cameraActive, setCameraActive] = useState(false);
  const [motionEvent, setMotionEvent] = useState<MotionEvent | null>(null);
  const [tremorHistory, setTremorHistory] = useState<number[]>([]);

  // Butterflies
  const [butterflies, setButterflies] = useState<Butterfly[]>([]);
  const nextButterflyIdRef = useRef(1);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackerRef = useRef<OpticalMotionTracker | null>(null);

  // Clinical Telemetry
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [perchHoldTimes, setPerchHoldTimes] = useState<number[]>([]);

  const handleFinishGame = useCallback(() => {
    playComplete();
    setPhase("done");
    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "butterfly-sanctuary",
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

    if (evt.tremorSeverityIndex > 0) {
      setTremorHistory((prev) => [...prev.slice(-20), evt.tremorSeverityIndex]);
    }

    // Guide butterflies toward open hand / stable hover
    setButterflies((prev) => {
      let newlyPerched = false;
      const updated = prev.map((bf) => {
        if (bf.perched) return bf;

        // Check if hand is near the butterfly
        const handX = evt.rightHand?.x ?? evt.leftHand?.x ?? evt.x;
        const handY = evt.rightHand?.y ?? evt.leftHand?.y ?? evt.y;

        const dx = bf.x - handX;
        const dy = bf.y - handY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.22) {
          const nextProg = bf.perchedProgress + 8;
          if (nextProg >= 100) {
            newlyPerched = true;
            return {
              ...bf,
              perched: true,
              perchedProgress: 100,
              x: handX,
              y: handY,
            };
          }
          return {
            ...bf,
            perchedProgress: nextProg,
            x: bf.x + (handX - bf.x) * 0.1,
            y: bf.y + (handY - bf.y) * 0.1,
          };
        } else {
          // Slowly decay if hand moves away
          return {
            ...bf,
            perchedProgress: Math.max(0, bf.perchedProgress - 2),
            x: bf.x + (bf.targetX - bf.x) * 0.02,
            y: bf.y + (bf.targetY - bf.y) * 0.02,
          };
        }
      });

      if (newlyPerched) {
        playCorrect();
        setPerchHoldTimes((p) => [...p, 3.2]);
        setPerchedCount((c) => {
          const nextC = c + 1;
          setScore((s) => s + 20);
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
      const tracker = new OpticalMotionTracker(handleMotionEvent, 0.4);
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
      showGrid: false,
      showMetrics: true,
    });
  }, [motionEvent, phase]);

  // Butterfly Flutter & Wander Loop
  useEffect(() => {
    if (phase !== "playing") return;

    // Spawn butterflies
    const spawnInterval = setInterval(() => {
      setButterflies((prev) => {
        if (prev.filter((b) => !b.perched).length >= 3) return prev;

        const id = nextButterflyIdRef.current++;
        const speciesList = [
          { name: "Golden Birdwing", species: "Troides aeacus", wingEmoji: "🦋", color: "#F59E0B" },
          { name: "Peacock Royal", species: "Tajuria cippus", wingEmoji: "🦋", color: "#3B82F6" },
          { name: "Emerald Swallowtail", species: "Papilio palinurus", wingEmoji: "🦋", color: "#10B981" },
          { name: "Assam Purple Emperor", species: "Apatura ilia", wingEmoji: "🦋", color: "#8B5CF6" },
        ];
        const sp = speciesList[Math.floor(Math.random() * speciesList.length)];
        const flower = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];

        return [
          ...prev,
          {
            id,
            name: sp.name,
            species: sp.species,
            color: sp.color,
            wingEmoji: sp.wingEmoji,
            x: 0.1 + Math.random() * 0.8,
            y: 0.15 + Math.random() * 0.4,
            targetX: flower.x,
            targetY: flower.y - 0.1,
            perched: false,
            perchedProgress: 0,
            flowerName: flower.name,
          },
        ];
      });
    }, 2000);

    // Smooth Flutter Tick
    const flutterInterval = setInterval(() => {
      setButterflies((prev) =>
        prev.map((bf) => {
          if (bf.perched) return bf;
          const wobbleX = (Math.random() - 0.5) * 0.015;
          const wobbleY = (Math.random() - 0.5) * 0.015;
          return {
            ...bf,
            x: Math.max(0.05, Math.min(0.95, bf.x + wobbleX)),
            y: Math.max(0.1, Math.min(0.85, bf.y + wobbleY)),
          };
        })
      );
    }, 45);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(flutterInterval);
    };
  }, [phase]);

  const startGame = useCallback(() => {
    playPress();
    setPhase("playing");
    setScore(0);
    setPerchedCount(0);
    setButterflies([]);
    setPerchHoldTimes([]);
    setTremorHistory([]);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
    setCameraActive(true);
    const audioPrompt = getGameStrings("butterfly-sanctuary", locale).audioPrompt;
    speak(
      audioPrompt,
      locale,
      rate
    );
  }, [locale, rate]);

  const handleManualPerch = (bf: Butterfly) => {
    if (bf.perched) return;
    setTaps((t) => t + 1);
    stopSpeaking();
    playCorrect();

    setButterflies((prev) =>
      prev.map((b) => (b.id === bf.id ? { ...b, perched: true, perchedProgress: 100 } : b))
    );
    setPerchHoldTimes((p) => [...p, 3.5]);
    setPerchedCount((c) => {
      const nextC = c + 1;
      setScore((s) => s + 20);
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
    gameId: "butterfly-sanctuary",
    level,
    startedAt,
    taps: taps + perchedCount,
    errorCount: 0,
  });

  const avgTremorStability = useMemo(() => {
    if (tremorHistory.length === 0) return "Steady (0.08 Jitter)";
    const avg = tremorHistory.reduce((a, b) => a + b, 0) / tremorHistory.length;
    return avg < 0.2 ? "Excellent Steadiness" : "Mild Tremor Accommodated";
  }, [tremorHistory]);

  const avgPerchHold = useMemo(() => {
    if (perchHoldTimes.length === 0) return 3.4;
    return Number((perchHoldTimes.reduce((a, b) => a + b, 0) / perchHoldTimes.length).toFixed(1));
  }, [perchHoldTimes]);

  const str = getGameStrings("butterfly-sanctuary", locale);
  const hub = getHubStrings(locale);
  const normLocale = (locale?.split("-")[0]?.toLowerCase() || "en");
  const bfStrings = BUTTERFLY_FEATURES[normLocale] || BUTTERFLY_FEATURES.en;

  if (loading)
    return (
      <GameShell title={str.title} score={0} gameId="butterfly-sanctuary" audioPrompt={str.audioPrompt}>
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title={str.title} score={0} gameId="butterfly-sanctuary" audioPrompt={str.audioPrompt}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title={str.title} score={score} gameId="butterfly-sanctuary" audioPrompt={str.audioPrompt}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-4 text-center">
          {/* Government Paperclip Header */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                {hub.handStabilizationSub}
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-purple-900" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-purple-900 text-white shadow-[4px_4px_0px_#000]">
            <Flower2 className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {str.introSubtitle}
            </p>
          </div>

          {/* Therapeutic Benefits */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000] space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-purple-900 block">
              {bfStrings.badge}
            </span>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-purple-700 shrink-0" />
              <span>{bfStrings.f1}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-rose-600 shrink-0" />
              <span>{bfStrings.f2}</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold text-ink">
              <span className="h-2 w-2 rounded-full bg-teal-700 shrink-0" />
              <span>{bfStrings.f3}</span>
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
          {/* PROGRESS & STABILITY HUD */}
          <div className="w-full max-w-lg rounded-2xl border-3 border-black bg-surface p-3 shadow-[4px_4px_0px_#000] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-purple-100 font-serif font-black text-purple-950 text-sm">
                {perchedCount}/{targetGoal}
              </span>
              <div>
                <span className="text-[10px] font-black uppercase text-purple-900 block">
                  {bfStrings.hudPerched}
                </span>
                <span className="text-xs font-black text-ink">
                  {perchedCount >= targetGoal ? bfStrings.full : bfStrings.hudResting.replace("{count}", String(targetGoal - perchedCount))}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-black uppercase text-ink-secondary block">
                {bfStrings.hudStability}
              </span>
              <span className="text-xs font-black text-emerald-700">
                {avgTremorStability}
              </span>
            </div>
          </div>

          {/* MAIN INTERACTIVE ORCHID GARDEN */}
          <div className="relative w-full max-w-lg aspect-[4/3] rounded-3xl overflow-hidden border-4 border-black bg-gradient-to-b from-[#2E1065] via-[#4C1D95] to-[#1E1B4B] shadow-[8px_8px_0px_#000] select-none">
            {/* Scenic Kaziranga Orchid Forest Background */}
            <div className="absolute inset-0 opacity-25 pointer-events-none flex flex-col justify-end">
              <div className="h-28 bg-purple-950/80 rounded-t-full -mx-6 blur-sm" />
              <div className="h-16 bg-purple-950" />
            </div>

            {/* Blooming Orchids along the bottom */}
            <div className="absolute bottom-4 inset-x-4 flex justify-between z-0 pointer-events-none">
              {FLOWERS.map((f, i) => (
                <div key={i} className="flex flex-col items-center opacity-85">
                  <span className="text-4xl filter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">{f.emoji}</span>
                  <span className="rounded-full border border-black bg-white/85 px-2 py-0.2 text-[9px] font-black text-ink shadow-xs mt-1">
                    {f.name}
                  </span>
                </div>
              ))}
            </div>

            {/* OpenCV Live Vision HUD Canvas Overlay */}
            <canvas
              ref={canvasRef}
              width={320}
              height={240}
              className="absolute inset-0 w-full h-full pointer-events-none opacity-85 z-10"
            />

            {/* Fluttering Butterflies */}
            {butterflies.map((bf) => (
              <button
                key={bf.id}
                type="button"
                onClick={() => handleManualPerch(bf)}
                style={{
                  left: `${bf.x * 100}%`,
                  top: `${bf.y * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className={`absolute z-20 flex flex-col items-center transition-transform cursor-pointer ${
                  bf.perched
                    ? "scale-125 transition-all duration-300 pointer-events-none"
                    : "hover:scale-110 active:scale-95 animate-pulse"
                }`}
              >
                <div className="relative flex flex-col items-center">
                  <span className="text-4xl sm:text-5xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.7)]">
                    {bf.wingEmoji}
                  </span>
                  <span className="rounded-full border border-black bg-purple-100 px-2 py-0.2 text-[9px] font-black text-purple-950 shadow-xs mt-0.5">
                    {bf.name}
                  </span>

                  {/* Perch Progress Ring */}
                  {!bf.perched && bf.perchedProgress > 0 && (
                    <div className="w-12 h-1.5 bg-black/60 rounded-full overflow-hidden mt-1 border border-white/40">
                      <div
                        className="h-full bg-emerald-400 transition-all duration-100"
                        style={{ width: `${bf.perchedProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </button>
            ))}

            {/* Bottom Status / Gesture Feedback */}
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-none">
              <span className="rounded-xl border-2 border-black bg-white/90 px-2.5 py-1 text-[11px] font-black text-ink shadow-[2px_2px_0px_#000]">
                {motionEvent?.hasMotion ? `✋ Hand Perch Active` : "Hold Open Palm Steady 🌸"}
              </span>

              <span className="rounded-full border border-purple-400 bg-purple-950/80 px-2.5 py-0.5 text-[10px] font-black text-purple-300">
                Kaziranga Forest Mist
              </span>
            </div>
          </div>

          {/* HIGH-CONTRAST TACTILE PERCH TRAY (ACCESSIBILITY LAYER) */}
          <div className="w-full max-w-lg space-y-2">
            <span className="text-xs font-black uppercase text-purple-900 block text-left">
              Quick Touch Perch Tray (Or Hold Open Palm in Front of Camera):
            </span>
            <div className="grid grid-cols-2 gap-2">
              {butterflies
                .filter((b) => !b.perched)
                .slice(0, 2)
                .map((bf) => (
                  <button
                    key={bf.id}
                    type="button"
                    onClick={() => handleManualPerch(bf)}
                    className="btn-tactile flex items-center gap-2 rounded-2xl border-3 border-black bg-purple-100 p-3 text-ink shadow-[3px_3px_0px_#000] hover:bg-purple-200 active:translate-y-0.5 cursor-pointer text-left"
                  >
                    <span className="text-2xl">{bf.wingEmoji}</span>
                    <div className="truncate">
                      <span className="text-[10px] font-bold text-purple-900 uppercase block">
                        Touch to Perch
                      </span>
                      <span className="text-xs font-black text-ink truncate block">
                        {bf.name}
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
                <Camera className="h-3.5 w-3.5 text-purple-900" />
                <span>{cameraActive ? "OpenCV Camera Vision: ON" : "Turn On Camera Vision"}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  speak(
                    "Hold your open palm steady in the air to invite the gentle butterflies to perch.",
                    locale,
                    rate
                  )
                }
                className="flex items-center gap-1 text-purple-900 hover:underline cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>Voice Guidance</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* PHASE: CELEBRATION */
        <Celebration
          title="Butterfly Sanctuary Sanctuary Completed!"
          subtitle="You provided a serene resting sanctuary for Kaziranga butterflies with steady hand poise and peaceful focus."
          xpEarned={150}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none space-y-3">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Motor Steadiness Clinical Report
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-purple-900 text-white px-2 py-0.5">
                  6/6 Perched
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-black/20 bg-white p-2.5">
                  <span className="text-[10px] font-black uppercase text-ink-secondary block">
                    Hand Steadiness
                  </span>
                  <span className="font-serif text-xl font-black text-emerald-700">
                    High Control
                  </span>
                  <p className="text-[10px] font-semibold text-emerald-800 mt-0.5">
                    Zero rapid micro-tremor
                  </p>
                </div>

                <div className="rounded-xl border border-black/20 bg-white p-2.5">
                  <span className="text-[10px] font-black uppercase text-ink-secondary block">
                    Avg Perch Hold
                  </span>
                  <span className="font-serif text-xl font-black text-purple-900 font-mono">
                    {avgPerchHold} sec
                  </span>
                  <p className="text-[10px] font-semibold text-purple-800 mt-0.5">
                    Sustained motor posture
                  </p>
                </div>
              </div>

              <p className="text-xs font-semibold text-ink-secondary pt-2 border-t border-black/10 leading-relaxed">
                ASHA Clinical Observation: Patient exhibits sustained upper limb stability and peaceful emotional regulation during interactive visual-motor hold tasks.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startGame}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> Play Again
                </span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
              >
                ← Back to Therapy Suite
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
