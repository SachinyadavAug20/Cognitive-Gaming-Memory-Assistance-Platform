"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  ShieldCheck,
  Brain,
  Sparkles,
  Volume2,
  Calendar,
  Play,
  Footprints,
  Camera,
  Activity,
  UserCheck,
  MapPin,
  Clock,
  ArrowRight,
  X,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { DEMO_PATIENT_RECORD } from "@/data/demoPatient";
import { useAuthStore } from "@/store/useAuthStore";
import { speakText, unlockAudio } from "@/lib/sound";
import { MajuliWalk3D } from "@/components/games/MajuliWalk3D";
import { TeaHarvestVision } from "@/components/games/TeaHarvestVision";
import { BihuDholBeats } from "@/components/games/BihuDholBeats";
import { DayInMyWorld3D } from "@/components/games/DayInMyWorld3D";
import { ArrowEscape } from "@/components/games/ArrowEscape";
import { SaathiVoiceCompanion } from "@/components/patient-dashboard/SaathiVoiceCompanion";
import { DailyMoodTracker, type MoodKey } from "@/components/patient-dashboard/DailyMoodTracker";

type ActiveModalGame =
  | "day-in-my-world"
  | "majuli-walk"
  | "tea-harvest-vision"
  | "arrow-escape"
  | "bihu-dhol"
  | null;

export default function PatientDemoPage() {
  const locale = useLocale();
  const login = useAuthStore((s) => s.login);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [activeModalGame, setActiveModalGame] = useState<ActiveModalGame>(null);
  const [activeRelative, setActiveRelative] = useState<number | null>(null);
  const [activePlace, setActivePlace] = useState<number | null>(null);
  const [lastMood, setLastMood] = useState<MoodKey | null>(null);

  // Auto-authenticate as Biren Borah on demo entry
  useEffect(() => {
    if (!isAuthenticated) {
      login("demo-patient-token-101", {
        id: 101,
        name: "Biren Borah",
        languagePreference: "as",
      });
    }
  }, [isAuthenticated, login]);

  const p = DEMO_PATIENT_RECORD;

  const handleSpeak = (text: string) => {
    unlockAudio();
    speakText(text, locale, 0.82);
  };

  const todayDateStr = new Date().toLocaleDateString(locale, {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#FAF6F0] pb-24 text-ink">
      {/* Active Modal Fullscreen Game Overlay */}
      {activeModalGame && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md p-2 sm:p-6 animate-fade-in flex flex-col items-center justify-start">
          <div className="sticky top-2 z-50 w-full max-w-4xl flex items-center justify-between bg-ink/90 border-3 border-black text-white p-3 rounded-2xl shadow-[4px_4px_0px_#000] mb-3">
            <div className="flex items-center gap-2">
              <span className="font-serif font-black text-base sm:text-lg">
                {activeModalGame === "day-in-my-world" && "A Day in My World (3D Story Campaign)"}
                {activeModalGame === "majuli-walk" && "Majuli Village Walk (3D Spatial Memory)"}
                {activeModalGame === "tea-harvest-vision" && "Tea Garden Harvest (Webcam Motion Tracking)"}
                {activeModalGame === "arrow-escape" && "River Rapids Arrow Escape"}
                {activeModalGame === "bihu-dhol" && "Bihu Dhol Beats & Grounding"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setActiveModalGame(null)}
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-rose-500 hover:bg-rose-600 px-4 py-2 text-xs sm:text-sm font-black text-white shadow-[2px_2px_0px_#000] cursor-pointer"
            >
              <X className="h-4 w-4" />
              <span>Close Game</span>
            </button>
          </div>

          <div className="w-full max-w-4xl rounded-3xl border-4 border-black bg-[#FAF6F0] p-3 sm:p-6 shadow-[8px_8px_0px_#000] text-ink overflow-hidden">
            {activeModalGame === "day-in-my-world" && <DayInMyWorld3D />}
            {activeModalGame === "majuli-walk" && <MajuliWalk3D />}
            {activeModalGame === "tea-harvest-vision" && <TeaHarvestVision />}
            {activeModalGame === "arrow-escape" && <ArrowEscape />}
            {activeModalGame === "bihu-dhol" && <BihuDholBeats />}
          </div>
        </div>
      )}

      {/* TOP CLINICAL DEMO BANNER */}
      <div className="border-b-4 border-black bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 px-4 py-4 text-white shadow-md">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-amber-200 text-amber-950 font-black shadow-xs">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                  Evaluation & Jury Demo Mode
                </span>
                <span className="rounded-full bg-emerald-300 text-emerald-950 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                  Session Active (100% Offline-Safe)
                </span>
              </div>
              <p className="text-xs font-bold text-amber-100 mt-0.5">
                Pre-loaded with Biren Borah (72y • Mild Cognitive Impairment • Silpukhuri, Guwahati)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/patient"
              className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-100"
            >
              <span>Standard Routine View</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/patient/games"
              className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-200 px-3 py-1.5 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000] hover:bg-amber-300"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Full 25+ Games Hub</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 1. DEMO ACCOUNT PROFILE CARD */}
        <div className="rounded-3xl border-4 border-black bg-surface p-5 sm:p-6 shadow-[6px_6px_0px_#000]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border-3 border-black bg-amber-100 overflow-hidden shrink-0 shadow-[3px_3px_0px_#000] flex items-center justify-center">
                <Image
                  src={p.photoUrl || "/sample-images/patient_1_biren_borah/profile.jpg"}
                  alt={p.name}
                  width={96}
                  height={96}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-black bg-amber-200 px-2.5 py-0.5 text-[10px] font-black uppercase text-amber-950">
                    Patient #101
                  </span>
                  <span className="rounded-full bg-emerald-100 border border-emerald-800/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-900">
                    Diagnosis: MCI (CDR 0.5)
                  </span>
                  <span className="hidden sm:inline-flex rounded-full bg-purple-100 border border-purple-800/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-purple-900">
                    Bilingual: As / En / Hi
                  </span>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-black text-ink">
                  {p.name}
                </h1>
                <p className="text-xs sm:text-sm font-semibold text-ink-secondary">
                  72 Years Old • Native of Silpukhuri, Guwahati • Retired Assam State Agricultural Officer
                </p>

                <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-ink-secondary">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-teal-800" /> {todayDateStr}
                  </span>
                  <span>•</span>
                  <span className="text-emerald-700 font-black">
                    Caregiver: Son Manash Borah (+91 98640 12345)
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                type="button"
                onClick={() =>
                  handleSpeak(
                    `Demo Patient Profile: ${p.name}, seventy-two years old, retired agricultural officer residing in Silpukhuri, Guwahati. Diagnosed with mild cognitive impairment. Joy triggers include Bhupen Hazarika folk songs, terrace orchids, and morning tea.`
                  )
                }
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-amber-100 hover:bg-amber-200 px-3.5 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] cursor-pointer"
                title="Listen to Profile Guide"
              >
                <Volume2 className="h-4 w-4 text-amber-900" />
                <span>Listen Guide</span>
              </button>
            </div>
          </div>

          {/* Joy Triggers & Cultural Background Highlights */}
          <div className="mt-4 pt-4 border-t-2 border-black/10 grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-xl bg-amber-50/80 p-3 border border-amber-900/20">
              <span className="font-black text-amber-950 uppercase text-[10px] block mb-1">
                Personalized Joy Triggers:
              </span>
              <p className="font-medium text-ink leading-relaxed">
                {p.joyTriggers}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50/80 p-3 border border-emerald-900/20">
              <span className="font-black text-emerald-950 uppercase text-[10px] block mb-1">
                Cultural Narrative:
              </span>
              <p className="font-medium text-ink leading-relaxed">
                {p.culturalBackground}
              </p>
            </div>
          </div>
        </div>

        {/* 2. FLAGSHIP 3D STORY CAMPAIGN (HERO EXPERIENCE) */}
        <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 p-6 text-white shadow-[6px_6px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-amber-200" />
              <span>Flagship 3D Story Campaign • Saathi Companion</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-white">
              A Day in My World
            </h2>
            <p className="text-xs sm:text-sm font-medium text-amber-100 max-w-xl leading-relaxed">
              Immersive 6-chapter 3D story taking Biren Borah through a nostalgic morning in an Assam village with Saathi AI companion.
            </p>

            <div className="hidden sm:flex flex-wrap items-center gap-1.5 pt-1 text-[10px] font-black uppercase tracking-wider text-amber-100">
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 1: Morning</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 2: Tea Essentials</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 3: Majuli Walk</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 4: Market Barter</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 5: Courtyard</span>
              <span className="rounded-md bg-black/30 px-2 py-0.5">Ch 6: Evening Calm</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveModalGame("day-in-my-world")}
              className="btn-tactile rounded-2xl border-3 border-black bg-white px-6 py-3.5 text-sm font-black text-amber-950 shadow-[4px_4px_0px_#000] hover:bg-amber-100 flex items-center gap-2 cursor-pointer"
            >
              <Play className="h-4 w-4 fill-amber-950" />
              <span>Launch 3D Story</span>
            </button>
          </div>
        </div>

        {/* 3. FEATURED MODAL GAMES SHOWCASE */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-teal-800" />
              <h2 className="font-serif text-xl font-black text-ink">
                Featured Cognitive Therapy Modules
              </h2>
            </div>
            <Link
              href="/patient/games"
              className="text-xs font-black text-tea hover:underline inline-flex items-center gap-1"
            >
              <span>View All 25+ Games</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1: Majuli Village Walk */}
            <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-br from-[#2D5A27] to-[#1E3F1A] p-5 text-white shadow-[6px_6px_0px_#000] flex flex-col justify-between">
              <div>
                <span className="rounded-full bg-amber-400 px-3 py-1 text-[10px] font-black uppercase text-amber-950 shadow-sm inline-flex items-center gap-1 mb-2">
                  <Footprints className="h-3.5 w-3.5" /> 3D Spatial
                </span>
                <h3 className="font-serif text-lg font-black text-white">
                  Majuli Village Walk
                </h3>
                <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                  Stroll along the sunrise path on Majuli Island and recognize sacred landmarks.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/70">GSAP Camera</span>
                <button
                  type="button"
                  onClick={() => setActiveModalGame("majuli-walk")}
                  className="btn-tactile rounded-xl border-2 border-black bg-amber-400 px-3.5 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_#000] hover:bg-amber-300 flex items-center gap-1 cursor-pointer"
                >
                  <Play className="h-3 w-3 fill-black" />
                  <span>Play 3D</span>
                </button>
              </div>
            </div>

            {/* Card 2: Tea Garden Harvest */}
            <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-br from-[#14532D] to-[#064E3B] p-5 text-white shadow-[6px_6px_0px_#000] flex flex-col justify-between">
              <div>
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-[10px] font-black uppercase text-emerald-950 shadow-sm inline-flex items-center gap-1 mb-2">
                  <Camera className="h-3.5 w-3.5" /> Motion Vision
                </span>
                <h3 className="font-serif text-lg font-black text-white">
                  Tea Garden Harvest
                </h3>
                <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                  Wave your hand in front of the camera to pluck fresh tea buds into your basket.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white/70">1:1 Reach</span>
                <button
                  type="button"
                  onClick={() => setActiveModalGame("tea-harvest-vision")}
                  className="btn-tactile rounded-xl border-2 border-black bg-emerald-400 px-3.5 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_#000] hover:bg-emerald-300 flex items-center gap-1 cursor-pointer"
                >
                  <Play className="h-3 w-3 fill-black" />
                  <span>Play Vision</span>
                </button>
              </div>
            </div>

            {/* Card 3: Bihu Dhol Beats */}
            <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-br from-[#78350F] to-[#451A03] p-5 text-white shadow-[6px_6px_0px_#000] flex flex-col justify-between">
              <div>
                <span className="rounded-full bg-amber-300 px-3 py-1 text-[10px] font-black uppercase text-amber-950 shadow-sm inline-flex items-center gap-1 mb-2">
                  <Activity className="h-3.5 w-3.5" /> Web Audio Drum
                </span>
                <h3 className="font-serif text-lg font-black text-white">
                  Bihu Dhol Beats
                </h3>
                <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                  Tap in sync with traditional Assamese rhythms to stimulate auditory-motor neural synchrony.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-200">Adaptive BPM</span>
                <button
                  type="button"
                  onClick={() => setActiveModalGame("bihu-dhol")}
                  className="btn-tactile rounded-xl border-2 border-black bg-amber-300 px-3.5 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_#000] hover:bg-amber-200 flex items-center gap-1 cursor-pointer"
                >
                  <Play className="h-3 w-3 fill-black" />
                  <span>Play Drum</span>
                </button>
              </div>
            </div>

            {/* Card 4: River Rapids Arrow Escape */}
            <div className="relative overflow-hidden rounded-3xl border-4 border-black bg-gradient-to-br from-[#0F2B38] to-[#0A1F29] p-5 text-white shadow-[6px_6px_0px_#000] flex flex-col justify-between">
              <div>
                <span className="rounded-full bg-cyan-300 px-3 py-1 text-[10px] font-black uppercase text-cyan-950 shadow-sm inline-flex items-center gap-1 mb-2">
                  <Sparkles className="h-3.5 w-3.5" /> Executive Attention
                </span>
                <h3 className="font-serif text-lg font-black text-white">
                  River Rapids Arrow Escape
                </h3>
                <p className="text-xs font-medium text-white/80 mt-1 leading-relaxed">
                  Navigate traditional Brahmaputra bamboo currents by tapping non-blocked directional streams.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 flex items-center justify-between">
                <span className="text-[10px] font-bold text-cyan-200">Fluid Attention</span>
                <button
                  type="button"
                  onClick={() => setActiveModalGame("arrow-escape")}
                  className="btn-tactile rounded-xl border-2 border-black bg-cyan-300 px-3.5 py-1.5 text-xs font-black text-black shadow-[2px_2px_0px_#000] hover:bg-cyan-200 flex items-center gap-1 cursor-pointer"
                >
                  <Play className="h-3 w-3 fill-black" />
                  <span>Play Rapids</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 4. FAMILIAR FACES & FAMILY NETWORK (REMINISCENCE THERAPY) */}
        <div className="rounded-3xl border-4 border-black bg-surface p-5 sm:p-6 shadow-[6px_6px_0px_#000] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-tea" />
              <h2 className="font-serif text-xl font-black text-ink">
                Familiar Faces & Family Network
              </h2>
            </div>
            <span className="text-xs font-bold text-ink-secondary">
              5 Calibrated Relatives
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {p.familyMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => {
                  setActiveRelative(member.id);
                  handleSpeak(`${member.name}, ${member.relation}. ${member.notes}`);
                }}
                className={`group rounded-2xl border-3 border-black p-2.5 text-center cursor-pointer transition-all shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] ${
                  activeRelative === member.id ? "bg-amber-100 border-amber-800" : "bg-[#FAF6F0]"
                }`}
              >
                <div className="aspect-square w-full rounded-xl border-2 border-black overflow-hidden mb-2 bg-black/5">
                  <Image
                    src={member.photoUrl || "/sample-images/patient_1_biren_borah/relatives/relative_1.jpg"}
                    alt={member.name}
                    width={140}
                    height={140}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="inline-block rounded-md bg-amber-200 px-1.5 py-0.5 text-[9px] font-black text-amber-950 uppercase mb-0.5">
                  {member.relation}
                </span>
                <h4 className="font-serif font-black text-xs text-ink truncate">
                  {member.name}
                </h4>
                <p className="text-[10px] text-ink-secondary line-clamp-2 mt-0.5">
                  {member.notes}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. FAMILIAR CULTURAL PLACES */}
        <div className="rounded-3xl border-4 border-black bg-surface p-5 sm:p-6 shadow-[6px_6px_0px_#000] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-800" />
              <h2 className="font-serif text-xl font-black text-ink">
                Familiar Cultural Landmarks
              </h2>
            </div>
            <span className="text-xs font-bold text-ink-secondary">
              Silpukhuri & Guwahati Memory Anchors
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {p.familiarPlaces.map((place) => (
              <div
                key={place.id}
                onClick={() => {
                  setActivePlace(place.id);
                  handleSpeak(`${place.name}. ${place.description}`);
                }}
                className={`group rounded-2xl border-3 border-black p-3 cursor-pointer transition-all shadow-[2px_2px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#000] flex flex-col justify-between ${
                  activePlace === place.id ? "bg-emerald-50 border-emerald-800" : "bg-[#FAF6F0]"
                }`}
              >
                <div>
                  <div className="aspect-[4/3] w-full rounded-xl border-2 border-black overflow-hidden mb-2 bg-black/5">
                    <Image
                      src={place.photoUrl || "/sample-images/patient_1_biren_borah/places/place_1.jpg"}
                      alt={place.name}
                      width={200}
                      height={150}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="inline-block rounded-md bg-emerald-200 px-1.5 py-0.5 text-[9px] font-black text-emerald-950 uppercase mb-1">
                    {place.category}
                  </span>
                  <h4 className="font-serif font-black text-xs sm:text-sm text-ink leading-tight">
                    {place.name}
                  </h4>
                  <p className="text-[11px] text-ink-secondary mt-1 line-clamp-3">
                    {place.description}
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-black/10 flex items-center justify-between text-[10px] font-black text-emerald-800">
                  <span>Tap to hear memory</span>
                  <Volume2 className="h-3 w-3" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. DAILY ROUTINE SCHEDULE & SAATHI COMPANION */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Daily Schedule */}
          <div className="rounded-3xl border-4 border-black bg-surface p-5 shadow-[6px_6px_0px_#000] flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-800" />
                <h3 className="font-serif text-lg font-black text-ink">
                  Biren&apos;s Daily Routine Schedule
                </h3>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2.5 rounded-xl border-2 border-black/20 bg-[#FAF6F0] p-2.5">
                  <span className="rounded-md bg-amber-200 px-2 py-0.5 font-mono font-black text-amber-950">
                    07:00 AM
                  </span>
                  <span className="font-bold text-ink">
                    Fresh CTC Morning Tea & Light Courtyard Stroll
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border-2 border-black/20 bg-[#FAF6F0] p-2.5">
                  <span className="rounded-md bg-emerald-200 px-2 py-0.5 font-mono font-black text-emerald-950">
                    10:30 AM
                  </span>
                  <span className="font-bold text-ink">
                    Bihu Dhol Beats & Auditory-Motor Entrainment
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border-2 border-black/20 bg-[#FAF6F0] p-2.5">
                  <span className="rounded-md bg-purple-200 px-2 py-0.5 font-mono font-black text-purple-950">
                    02:00 PM
                  </span>
                  <span className="font-bold text-ink">
                    Majuli 3D Spatial Walk & River Remembrance
                  </span>
                </div>
                <div className="flex items-center gap-2.5 rounded-xl border-2 border-black/20 bg-[#FAF6F0] p-2.5">
                  <span className="rounded-md bg-teal-200 px-2 py-0.5 font-mono font-black text-teal-950">
                    06:00 PM
                  </span>
                  <span className="font-bold text-ink">
                    Namghar Evening Hymns & Grandchild Video Call
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-black/10 flex items-center justify-between text-xs font-bold text-ink-secondary">
              <span className="flex items-center gap-1 text-emerald-700 font-black">
                <CheckCircle2 className="h-3.5 w-3.5" /> 3 of 4 Activities Completed Today
              </span>
            </div>
          </div>

          {/* Saathi Voice Companion Card */}
          <div className="rounded-3xl border-4 border-black bg-surface p-5 shadow-[6px_6px_0px_#000]">
            <SaathiVoiceCompanion
              patientName={p.name}
              currentLocale={locale}
              familyMembers={p.familyMembers.map((r) => ({ name: r.name, relation: r.relation }))}
              familiarPlaces={p.familiarPlaces.map((pl) => ({ name: pl.name }))}
              joyTriggers={p.joyTriggers ?? undefined}
            />
          </div>
        </div>

        {/* 7. DAILY WELLBEING MOOD TRACKER */}
        <div className="rounded-3xl border-4 border-black bg-surface p-5 sm:p-6 shadow-[6px_6px_0px_#000]">
          <DailyMoodTracker
            lastMood={lastMood}
            onChooseMood={(m: MoodKey) => {
              setLastMood(m);
              handleSpeak(
                m === "peaceful"
                  ? "Feeling peaceful and calm with the sweet sounds of Assam."
                  : m === "okay"
                  ? "Feeling steady and balanced today."
                  : "Caregiver alert noted. Reaching out to Manash."
              );
            }}
            title="How is Biren feeling this morning?"
            thanksMessage="Thank you, Biren-da. Your family and care team can see your wellbeing status."
            moodLabels={{
              peaceful: "Peaceful",
              okay: "Steady",
              caretaker: "Need Help",
            }}
          />
        </div>
      </div>
    </div>
  );
}
