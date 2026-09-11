"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Sprout,
  Sparkles,
  CheckCircle2,
  HeartHandshake,
  RotateCcw,
  Volume2,
  Leaf,
  Sun,
  Flame,
  Droplets,
  BookOpen,
  Check,
  ChevronRight,
  ShieldCheck,
  Activity,
  Wind,
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
  playEncourage,
  playPineBreeze,
  playTapFeedback,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";

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
        bgColor="bg-[#2D5A27]"
        gameId="ancestral-herbalist"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

export interface HerbalReminiscenceItem {
  id: string;
  name: string;
  localName: string;
  region: string;
  category: "memory" | "warmth" | "vitality" | "calm" | "respiratory";
  tagline: string;
  reminiscencePrompt: string;
  clueHint: string;
  grandmotherRemedy: string;
  sensoryAroma: string;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    badge: string;
  };
}

const HERBS_CATALOGUE: HerbalReminiscenceItem[] = [
  {
    id: "manimuni",
    name: "Indian Pennywort (Centella)",
    localName: "Manimuni (মানিমুনি)",
    region: "Assam & Meghalaya",
    category: "memory",
    tagline: "The Ancient Herb of Mind Clarity",
    reminiscencePrompt: "Which fresh morning leaf did grandmother boil into light green broth to sharpen memory and soothe the stomach?",
    clueHint: "Look for the small rounded fan-shaped leaves that grow in moist morning garden soil.",
    grandmotherRemedy: "A gentle morning bowl of mashed Manimuni with warm steamed rice, prized for centuries across Assam and the Khasi hills for nourishing memory and peaceful digestion.",
    sensoryAroma: "Earthy, verdant morning dew with crisp fresh-clipped garden notes.",
    colorTheme: {
      bg: "bg-emerald-50",
      border: "border-emerald-600",
      text: "text-emerald-950",
      badge: "bg-emerald-100 text-emerald-800",
    },
  },
  {
    id: "lakadong",
    name: "Lakadong Golden Turmeric",
    localName: "Lakadong Shynrai (ল্যাডং)",
    region: "Jaintia Hills, Meghalaya",
    category: "warmth",
    tagline: "World's Highest Curcumin Golden Root",
    reminiscencePrompt: "Which glowing golden root harvested in the autumn sun is boiled with sweet buffalo milk to warm tired joints?",
    clueHint: "Look for the intense deep-gold highland root known across the Jaintia Hills for natural warmth.",
    grandmotherRemedy: "Fresh golden root pounded on river stone, simmered gently with warm milk and a teaspoon of wild honey before bedtime to banish chill and strengthen body joints.",
    sensoryAroma: "Rich, warm spicy amber scent carrying highland red soil freshness.",
    colorTheme: {
      bg: "bg-amber-50",
      border: "border-amber-600",
      text: "text-amber-950",
      badge: "bg-amber-100 text-amber-900",
    },
  },
  {
    id: "kajinemu",
    name: "Assam King Lemon",
    localName: "Kaji Nemu (কাজী নেমু)",
    region: "Brahmaputra Valley, Assam",
    category: "vitality",
    tagline: "The Fragrant Royal Citrus",
    reminiscencePrompt: "Which crisp fragrant oblong lemon is freshly sliced over afternoon fish curry to refresh the spirit and awaken appetite?",
    clueHint: "Look for the prized dark-green royal lemon whose thin fragrant peel gives off an instant zesty aroma.",
    grandmotherRemedy: "A freshly squeezed wedge of Kaji Nemu over warm steamed Joha rice or sour fish broth (Masor Tenga) on sunny family afternoons.",
    sensoryAroma: "Vibrant, sparkling citrus burst that instantly awakens mental alertness.",
    colorTheme: {
      bg: "bg-lime-50",
      border: "border-lime-600",
      text: "text-lime-950",
      badge: "bg-lime-100 text-lime-900",
    },
  },
  {
    id: "bhedailata",
    name: "Skunk Vine / Paederia",
    localName: "Bhedailata (ভেদাইলতা)",
    region: "Assam & Manipur",
    category: "warmth",
    tagline: "The Restorative Monsoon Vine",
    reminiscencePrompt: "Which traditional climbing vine was tenderly cooked into comforting medicinal soup after heavy monsoon rains?",
    clueHint: "Look for the tender twining green vine leaves cherished for restoring strength after fatigue.",
    grandmotherRemedy: "Tender vine leaves crushed and cooked with roasted garlic, black pepper, and small freshwater river fish to rejuvenate elders after illness.",
    sensoryAroma: "Deeply comforting herbal aroma rich in restorative organic sulfur compounds.",
    colorTheme: {
      bg: "bg-teal-50",
      border: "border-teal-600",
      text: "text-teal-950",
      badge: "bg-teal-100 text-teal-900",
    },
  },
  {
    id: "tulsi",
    name: "Krishna Holy Basil",
    localName: "Kala Tulsi (কৃষ্ণ তুলসী)",
    region: "Barak Valley & Tripura",
    category: "respiratory",
    tagline: "The Sacred Courtyard Healer",
    reminiscencePrompt: "Which purple-tinged courtyard basil leaves were brewed with crushed ginger and bee honey for peaceful breathing?",
    clueHint: "Look for the aromatic dark purple-green leaves revered near the front doorway of family homes.",
    grandmotherRemedy: "Five fresh dark Tulsi leaves gently rolled between warm palms, brewed with crushed mountain ginger to ease coughs and bring tranquil breath.",
    sensoryAroma: "Spicy, sweet clove and camphor fragrance that cleanses and opens the airways.",
    colorTheme: {
      bg: "bg-purple-50",
      border: "border-purple-600",
      text: "text-purple-950",
      badge: "bg-purple-100 text-purple-900",
    },
  },
  {
    id: "mishmitita",
    name: "Mishmi Teeta Bitter Root",
    localName: "Coptis Teeta (মিশমি তিতা)",
    region: "Mishmi Hills, Arunachal Pradesh",
    category: "calm",
    tagline: "The Golden Alpine Elixir",
    reminiscencePrompt: "Which revered golden medicinal root from high Himalayan ridges is cherished by mountain elders for purifying cooling energy?",
    clueHint: "Look for the rare golden-threaded alpine roots collected by Mishmi mountain herbalists.",
    grandmotherRemedy: "A tiny infusion of wild golden root taken at daybreak to clear internal fever, calm body heat, and maintain lifelong longevity.",
    sensoryAroma: "Intense, clean woody root scent with high-altitude alpine notes.",
    colorTheme: {
      bg: "bg-orange-50",
      border: "border-orange-600",
      text: "text-orange-950",
      badge: "bg-orange-100 text-orange-900",
    },
  },
];

export function AncestralHerbalistGame() {
  const locale = useLocale();
  const { detail, loading: patientLoading, patientId } = usePatientDetail();
  const level = resolveAdaptiveLevel(patientId, "ancestral-herbalist", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "playing" | "remedy" | "celebration">("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedHerbId, setSelectedHerbId] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showHintBeacon, setShowHintBeacon] = useState(false);
  const [hesitationSeconds, setHesitationSeconds] = useState(0);
  const [errorsThisRound, setErrorsThisRound] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const currentHerb = useMemo(() => {
    return HERBS_CATALOGUE[roundIndex % HERBS_CATALOGUE.length];
  }, [roundIndex]);

  // Generate 3 choices for the round: current target + 2 distractors
  const roundChoices = useMemo(() => {
    const distractors = HERBS_CATALOGUE.filter((h) => h.id !== currentHerb.id);
    const shuffledDistractors = [...distractors].sort(() => 0.5 - Math.random());
    const choices = [currentHerb, shuffledDistractors[0], shuffledDistractors[1]];
    return choices.sort(() => 0.5 - Math.random());
  }, [currentHerb]);

  // Errorless Learning Scaffolding: 6-second hesitation activates vanishing cue
  useEffect(() => {
    if (phase !== "playing") {
      setHesitationSeconds(0);
      return;
    }
    const timer = setInterval(() => {
      setHesitationSeconds((prev) => {
        const next = prev + 1;
        if (next >= 6 && !showHintBeacon) {
          setShowHintBeacon(true);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, showHintBeacon]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Voice narration when entering round
  useEffect(() => {
    if (phase === "playing" && currentHerb) {
      stopSpeaking();
      playPineBreeze();
      speak(
        `${currentHerb.reminiscencePrompt} Look for ${currentHerb.localName}.`,
        locale,
        rate
      );
    }
  }, [phase, roundIndex, currentHerb, locale, rate]);

  const handleStartGame = useCallback(() => {
    playPress();
    stopSpeaking();
    setStartedAt(new Date().toISOString());
    setRoundIndex(0);
    setScore(0);
    setPhase("playing");
    setShowHintBeacon(false);
    setSelectedHerbId(null);
    setIsCorrect(null);
    setErrorsThisRound(0);
  }, []);

  const handleManualHint = useCallback(() => {
    playPress();
    setShowHintBeacon(true);
    speak(currentHerb.clueHint, locale, rate);
  }, [currentHerb, locale, rate]);

  const handleSelectHerb = useCallback(
    (herb: HerbalReminiscenceItem) => {
      playTapFeedback();
      setSelectedHerbId(herb.id);

      if (herb.id === currentHerb.id) {
        // Correct match!
        playCorrect();
        setIsCorrect(true);
        setScore((s) => s + 20);
        speak(`Wonderful! You recognized ${herb.localName}.`, locale, rate);

        // Transition to Remedy Reminiscence Story Card
        window.setTimeout(() => {
          setPhase("remedy");
          speak(herb.grandmotherRemedy, locale, rate);
        }, 1200);
      } else {
        // Errorless Gentle Redirection (Never scold or trigger alarm)
        playEncourage();
        setIsCorrect(false);
        setErrorsThisRound((e) => e + 1);
        setShowHintBeacon(true); // Automatically light up golden beacon
        speak(
          `That is a wonderful herb too. Look at the glowing leaf for grandmother's ${currentHerb.name}.`,
          locale,
          rate
        );

        // Reset wrong choice highlight after 1.5s
        window.setTimeout(() => {
          setSelectedHerbId(null);
          setIsCorrect(null);
        }, 1500);
      }
    },
    [currentHerb, locale, rate]
  );

  const handleNextRound = useCallback(() => {
    playPress();
    stopSpeaking();

    const nextIndex = roundIndex + 1;
    if (nextIndex >= 4) {
      // Completed 4 rich herbal reminiscence rounds
      playComplete();
      setPhase("celebration");

      if (startedAt && patientId) {
        recordGameSession(patientId, {
          gameId: "ancestral-herbalist",
          level,
          outcome: "completed",
          score: score + 20,
          startedAt,
          taps: nextIndex * 2,
          errorCount: errorsThisRound,
        });
      }
    } else {
      setRoundIndex(nextIndex);
      setSelectedHerbId(null);
      setIsCorrect(null);
      setShowHintBeacon(false);
      setErrorsThisRound(0);
      setPhase("playing");
    }
  }, [roundIndex, startedAt, patientId, level, score, errorsThisRound]);

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "ancestral-herbalist",
    level,
    startedAt,
    taps: roundIndex * 2,
    errorCount: errorsThisRound,
  });

  if (patientLoading) {
    return <GameLoading />;
  }

  return (
    <GameShell title="Ancestral Healing Herbs" score={score}>
      {/* ── INTRO SCREEN ── */}
      {phase === "intro" && (
        <div className="rounded-3xl border-3 border-stone-800 bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#2D5A27] space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#2D5A27] text-white shadow-sm">
              <Sprout className="h-8 w-8" />
            </div>
            <div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-[#2D5A27] uppercase tracking-wide">
                Ethnobotany Reminiscence &amp; Semantic Memory
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 mt-1">
                Ancestral Herbalist Garden
              </h2>
            </div>
          </div>

          <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-medium">
            Step into the sunlit garden of grandmother's kitchen memories. Recognize traditional North Eastern healing herbs—Manimuni leaves, golden Lakadong turmeric, fragrant Kaji Nemu, and calming courtyard Tulsi—and match them to family healing remedies.
          </p>

          <div className="rounded-2xl border-2 border-emerald-200 bg-[#F4F9F4] p-4 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#2D5A27] text-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>Evidence-Based Memory Scaffolding (NIH StatPearls &amp; Practical Neurology)</span>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Designed with errorless learning: gentle golden auras guide you if you pause, with no rush, no harsh buzzers, and soothing voice guidance in your dialect.
            </p>
          </div>

          <div className="pt-2">
            <ChunkyButton
              onClick={handleStartGame}
              variant="tea"
              size="xl"
              className="w-full justify-center bg-[#2D5A27] text-white border-black"
            >
              <Sprout className="h-5 w-5 mr-2" />
              <span>Enter Healing Garden</span>
            </ChunkyButton>
          </div>
        </div>
      )}

      {/* ── PLAYING ROUND ── */}
      {phase === "playing" && currentHerb && (
        <div className="space-y-5">
          {/* Progress & Round Tracker */}
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-stone-100 border border-stone-300 px-2.5 py-1 text-xs font-bold text-stone-700">
                Reminiscence Round {roundIndex + 1} of 4
              </span>
              <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${currentHerb.colorTheme.badge}`}>
                {currentHerb.region}
              </span>
            </div>
            <span className="text-xs font-semibold text-stone-500">
              Score: {score}
            </span>
          </div>

          {/* Grandmother's Reminiscence Clue Prompt Card */}
          <div className="rounded-3xl border-3 border-stone-800 bg-white p-6 shadow-[5px_5px_0px_#2D5A27] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D5A27]">
                <HeartHandshake className="h-4 w-4" />
                <span>Childhood Memory &amp; Remedy Clue</span>
              </div>
              <AudioPrompt
                text={currentHerb.reminiscencePrompt}
                label="Listen to Clue"
                size="md"
              />
            </div>

            <p className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug">
              "{currentHerb.reminiscencePrompt}"
            </p>

            <p className="text-xs text-stone-500 flex items-center gap-1.5">
              <Wind className="h-3.5 w-3.5 text-stone-400" />
              <span>Aroma: {currentHerb.sensoryAroma}</span>
            </p>
          </div>

          {/* Errorless Clue Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleManualHint}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-amber-600 bg-amber-50 px-3.5 py-1.5 text-xs font-black text-amber-900 shadow-[2px_2px_0px_#D97706] hover:bg-amber-100 active:translate-y-0.5 cursor-pointer transition-all"
            >
              <Sparkles className="h-4 w-4 text-amber-600" />
              <span>Show Herbal Clue</span>
            </button>
          </div>

          {/* 3 Choice Cards Grid */}
          <div className="grid gap-3.5">
            {roundChoices.map((herb) => {
              const isTarget = herb.id === currentHerb.id;
              const isSelected = selectedHerbId === herb.id;
              const isGlowingBeacon = showHintBeacon && isTarget;

              return (
                <button
                  key={herb.id}
                  type="button"
                  onClick={() => handleSelectHerb(herb)}
                  disabled={selectedHerbId !== null && isCorrect === true}
                  className={`w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border-3 border-stone-800 text-left transition-all cursor-pointer ${
                    isSelected && isCorrect === true
                      ? "bg-emerald-100 border-emerald-700 shadow-[4px_4px_0px_#047857]"
                      : isSelected && isCorrect === false
                      ? "bg-stone-100 border-stone-300 opacity-60 shadow-none"
                      : isGlowingBeacon
                      ? "bg-amber-50 border-amber-600 ring-4 ring-amber-400 animate-pulse shadow-[4px_4px_0px_#D97706] scale-[1.01]"
                      : "bg-white hover:bg-stone-50 shadow-[4px_4px_0px_#2D5A27] active:translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0 pr-3">
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-stone-800 ${
                        isGlowingBeacon ? "bg-amber-300" : "bg-emerald-100"
                      }`}
                    >
                      <Leaf className="h-6 w-6 text-[#2D5A27]" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-serif text-base sm:text-lg font-bold text-stone-900 truncate">
                        {herb.name}
                      </div>
                      <div className="text-xs sm:text-sm font-semibold text-[#2D5A27]">
                        {herb.localName} &bull; {herb.region}
                      </div>
                    </div>
                  </div>

                  {isGlowingBeacon ? (
                    <span className="shrink-0 flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-200/80 px-2.5 py-1 rounded-lg border border-amber-400">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Clue</span>
                    </span>
                  ) : (
                    <ChevronRight className="h-5 w-5 shrink-0 text-stone-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback Banner */}
          {selectedHerbId && isCorrect === true && (
            <div className="rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-3.5 text-center text-emerald-950 font-bold text-sm flex items-center justify-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-700" />
              <span>Splendid! You found the ancestral remedy!</span>
            </div>
          )}
        </div>
      )}

      {/* ── REMEDY REMINISCENCE CARD SCREEN ── */}
      {phase === "remedy" && currentHerb && (
        <div className="rounded-3xl border-3 border-stone-800 bg-white p-6 sm:p-8 shadow-[6px_6px_0px_#2D5A27] space-y-5 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 border-2 border-stone-800 text-[#2D5A27]">
                <Check className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#2D5A27] uppercase tracking-wider">
                  Traditional Botanical Wisdom
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-black text-stone-900">
                  {currentHerb.name}
                </h3>
              </div>
            </div>
            <AudioPrompt
              text={currentHerb.grandmotherRemedy}
              label="Listen to Story"
              size="md"
            />
          </div>

          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/70 p-4.5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase">
              <HeartHandshake className="h-4 w-4" />
              <span>Grandmother's Healing Memory</span>
            </div>
            <p className="text-sm sm:text-base text-stone-800 leading-relaxed font-serif italic">
              "{currentHerb.grandmotherRemedy}"
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-1">
              <span className="font-bold text-stone-700 block">Regional Dialects:</span>
              <span className="text-stone-900 font-semibold">{currentHerb.localName}</span>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-1">
              <span className="font-bold text-stone-700 block">Sensory Fragrance:</span>
              <span className="text-stone-900 font-medium">{currentHerb.sensoryAroma}</span>
            </div>
          </div>

          <div className="pt-3">
            <ChunkyButton
              onClick={handleNextRound}
              variant="tea"
              size="xl"
              className="w-full justify-center bg-[#2D5A27] text-white border-black"
            >
              <span>Continue Through Garden</span>
              <ChevronRight className="h-5 w-5 ml-2" />
            </ChunkyButton>
          </div>
        </div>
      )}

      {/* ── CELEBRATION SCREEN ── */}
      {phase === "celebration" && (
        <Celebration
          icon={Sprout}
          title="Garden Remedy Master!"
          subtitle={`You recognized the ancestral healing plants of North East India with a score of ${score}.`}
        >
          <div className="w-full max-w-sm space-y-3 pt-4">
            <ChunkyButton
              onClick={handleStartGame}
              variant="tea"
              size="xl"
              className="w-full justify-center bg-[#2D5A27] text-white border-black"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              <span>Visit Garden Again</span>
            </ChunkyButton>
            <Link href="/patient/games" className="block w-full">
              <ChunkyButton
                variant="outline"
                size="xl"
                className="w-full justify-center bg-white text-stone-800 border-black"
              >
                <span>Return to Games Hub</span>
              </ChunkyButton>
            </Link>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
