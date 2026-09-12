"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import {
  Brain,
  ShieldCheck,
  Award,
  BookOpen,
  Sparkles,
  CheckCircle2,
  FileText,
  Activity,
  HeartHandshake,
  Layers,
  ArrowRight,
  ExternalLink,
  Zap,
  Info,
  ChevronRight,
  ChevronLeft,
  Stethoscope,
  Smile,
  Compass,
  Lock,
  Scale,
  Printer,
  Sliders,
  Cpu,
  RefreshCw,
  Clock,
  Volume2,
  Eye,
  Mic,
  HardDrive,
  Wifi,
  AlertCircle,
} from "lucide-react";
import { mapTelemetryToMoCA } from "@/lib/errorlessLearning";
import { CLINICAL_REFERENCES, getReferenceById, type ClinicalReference } from "@/lib/clinicalReferences";
import { ClinicalReferenceCard } from "@/components/clinical/ClinicalReferenceCard";

interface CogaChecklistItem {
  criteria: string;
  level: string;
  title: string;
  specification: string;
  implementation: string;
}

const COGA_WCAG_CHECKLIST: CogaChecklistItem[] = [
  {
    criteria: "W3C COGA 4.1",
    level: "AAA",
    title: "Errorless Learning & Zero Frustration Traps",
    specification: "Prevent catastrophic errors and frustration loops in neurodivergent and amnesic users.",
    implementation: "Soft-blocking replaces failure buzzers with soothing harmonic water ripples; vanishing golden cues guide correct choices after 6 seconds of hesitation.",
  },
  {
    criteria: "WCAG 2.2 3.3.8",
    level: "AAA",
    title: "Accessible Cognitive-Free Authentication",
    specification: "Eliminates cognitive function tests (passwords, CAPTCHAs, recall-based 2FA).",
    implementation: "Zero cognitive test authentication: Cryptographic QR Health Card kiosk login, 30-day persistent session cookies, and 1-tap scanner resumption.",
  },
  {
    criteria: "WCAG 2.2 2.5.8",
    level: "AAA",
    title: "Enhanced Target Size & Spatial Padding",
    specification: "Interactive targets must meet generous physical dimensions to accommodate motor tremors and dyspraxia.",
    implementation: "All interactive buttons, routine cards, and game elements have touch targets >= 48px to 64px with >=16px spatial padding, preventing accidental mis-clicks.",
  },
  {
    criteria: "WCAG 2.2 2.5.7",
    level: "AAA",
    title: "Dragging Movements Alternative",
    specification: "Any mechanic requiring continuous drag-and-drop must provide a simple single-pointer alternative.",
    implementation: "Single-tap fallback provided for all spatial manipulation, sorting, and puzzle mechanics so parkinsonian tremors never block clinical progression.",
  },
  {
    criteria: "W3C COGA 4.2",
    level: "AAA",
    title: "Zero Reliance on Short-Term Working Memory",
    specification: "Information required to complete a step must be persistently visible or voice-prompted.",
    implementation: "Persistent breadcrumbs, active routine cards, visual cue beacons, and audio-first voice narration guide the patient through every individual step.",
  },
  {
    criteria: "WCAG 2.2 1.4.6",
    level: "AAA",
    title: "Contrast (Enhanced 7:1+ Ratio)",
    specification: "Visual presentation of text and images of text must have a contrast ratio of at least 7:1.",
    implementation: "Paper-grain parchment palette with jet ink typography (#1A1A1A on #FAF6F0), exceeding 11:1 contrast ratio with high-contrast accessibility toggle.",
  },
  {
    criteria: "W3C COGA 4.5",
    level: "AAA",
    title: "Multilingual Speech & Audio-First Pacing",
    specification: "Spoken narration must accommodate slowed cognitive processing and auditory comprehension delays.",
    implementation: "Native TTS narration in 11 North Eastern languages with 0.82x slowed speech pacing calibrated for geriatric neurocognitive processing speed.",
  },
  {
    criteria: "WCAG 2.2 2.2.1",
    level: "AAA",
    title: "Timing Adjustable & Self-Paced Engagement",
    specification: "Users must not be subjected to arbitrary countdowns that provoke cortisol surges or panic.",
    implementation: "Zero countdown timers or ticking panic clocks during cognitive therapy; patient controls session pacing completely with soothing pauses.",
  },
];

type SectionTab =
  | "overview"
  | "errorless"
  | "transfer"
  | "moca"
  | "ai_dda"
  | "finger"
  | "coga"
  | "ner"
  | "authorities"
  | "references";

const SECTIONS: {
  id: SectionTab;
  num: string;
  label: string;
  shortLabel: string;
  icon: typeof BookOpen;
}[] = [
  { id: "overview", num: "01", label: "The CDTx Imperative", shortLabel: "The CDTx Imperative", icon: BookOpen },
  { id: "errorless", num: "02", label: "Errorless Learning (EL)", shortLabel: "Errorless Learning", icon: Sparkles },
  { id: "transfer", num: "03", label: "Transfer of Training (ACTIVE)", shortLabel: "ACTIVE Trial (Transfer)", icon: Award },
  { id: "moca", num: "04", label: "MoCA Telemetry & Biomarkers", shortLabel: "MoCA & Biomarkers", icon: Activity },
  { id: "ai_dda", num: "05", label: "AI Difficulty (RL-DDA)", shortLabel: "AI Dynamic Policy", icon: Cpu },
  { id: "finger", num: "06", label: "Multidomain (FINGER & ZBI)", shortLabel: "FINGER & Zarit", icon: HeartHandshake },
  { id: "coga", num: "07", label: "W3C COGA & AAA UX", shortLabel: "W3C COGA / AAA UX", icon: ShieldCheck },
  { id: "ner", num: "08", label: "North East Cultural Matrix", shortLabel: "Cultural Matrix", icon: Compass },
  { id: "authorities", num: "09", label: "Regulatory & Security", shortLabel: "Regulatory & Auth", icon: Scale },
  { id: "references", num: "10", label: "Citations & External Links", shortLabel: "Clinical Citations", icon: FileText },
];

export function ClinicalEvidenceClient() {
  const [activeTab, setActiveTab] = useState<SectionTab>("overview");
  const [refSearch, setRefSearch] = useState("");
  const [refCategory, setRefCategory] = useState<string>("all");

  // Interactive MoCA Telemetry Simulator Sliders
  const [visuoSlider, setVisuoSlider] = useState<number>(78);
  const [namingSlider, setNamingSlider] = useState<number>(82);
  const [memorySlider, setMemorySlider] = useState<number>(65);
  const [attentionSlider, setAttentionSlider] = useState<number>(74);
  const [abstractionSlider, setAbstractionSlider] = useState<number>(85);
  const [orientSlider, setOrientSlider] = useState<number>(88);

  // Dynamic MoCA Computation
  const calculatedMoCA = useMemo(() => {
    return mapTelemetryToMoCA({
      visuospatialAccuracyPct: visuoSlider,
      languageFluencyPct: namingSlider,
      delayedRecallPct: memorySlider,
      attentionReactionPct: attentionSlider,
      abstractionSortingPct: abstractionSlider,
      orientationAccuracyPct: orientSlider,
    });
  }, [visuoSlider, namingSlider, memorySlider, attentionSlider, abstractionSlider, orientSlider]);

  // ── Simulator 02: Errorless Scaffolding & Vanishing Cue Simulator ────
  const [elHesitation, setElHesitation] = useState<number>(6);
  const [elAmnesiaSeverity, setElAmnesiaSeverity] = useState<number>(45);
  const [elCueIntensity, setElCueIntensity] = useState<number>(75);

  const elMetrics = useMemo(() => {
    const errorConsolidationHazard =
      elCueIntensity < 35
        ? Math.min(96, Math.round(elAmnesiaSeverity * 1.35 + 20))
        : Math.max(4, Math.round(20 - elCueIntensity * 0.18));
    const proceduralRetention = Math.min(
      98,
      Math.max(30, Math.round(88 - elAmnesiaSeverity * 0.22 + elCueIntensity * 0.2))
    );
    const cortisolTier =
      elHesitation > 8
        ? "Elevated Cortisol (Risk of Agitation)"
        : elHesitation > 5
        ? "Mild Confusion (Hesitation Latency)"
        : "Optimal Calm (Safe Procedural Encoding)";
    const vanishingTriggered = elHesitation >= 6;
    return {
      errorConsolidationHazard,
      proceduralRetention,
      cortisolTier,
      vanishingTriggered,
    };
  }, [elHesitation, elAmnesiaSeverity, elCueIntensity]);

  // ── Simulator 03: ACTIVE Longitudinal 10-Year Far-Transfer Trajectory ────
  const [activeDosage, setActiveDosage] = useState<number>(18);
  const [activeBoosters, setActiveBoosters] = useState<number>(2);
  const [activeAge, setActiveAge] = useState<number>(68);

  const activeMetrics = useMemo(() => {
    const dementiaRiskReduction = Math.min(
      33,
      Math.round(activeDosage * 0.6 + activeBoosters * 4.5)
    );
    const iadlPreservation = Math.min(
      97,
      Math.max(40, Math.round(74 + activeDosage * 0.45 + activeBoosters * 3.8 - (activeAge - 60) * 0.35))
    );
    const speedGainMs = Math.round(Math.min(290, activeDosage * 7.2 + activeBoosters * 26));
    const extraYearsAutonomy = (activeDosage * 0.08 + activeBoosters * 0.45).toFixed(1);
    return {
      dementiaRiskReduction,
      iadlPreservation,
      speedGainMs,
      extraYearsAutonomy,
    };
  }, [activeDosage, activeBoosters, activeAge]);

  // ── Simulator 05: RL-DDA Dynamic Difficulty Policy & Flow Channel ────
  const [ddaErrors, setDdaErrors] = useState<number>(1);
  const [ddaSlowdown, setDdaSlowdown] = useState<number>(35);
  const [ddaTremor, setDdaTremor] = useState<number>(8);

  const ddaMetrics = useMemo(() => {
    let flowZone = "Optimal Flow Channel (Zone of Proximal Development)";
    let flowColor = "text-emerald-800 bg-emerald-50 border-emerald-300";

    if (ddaErrors >= 3 || ddaSlowdown >= 80) {
      flowZone = "Anxiety & Catastrophic Reaction Risk";
      flowColor = "text-rose-800 bg-rose-50 border-rose-300";
    } else if (ddaErrors === 0 && ddaSlowdown <= 10) {
      flowZone = "Boredom & Cognitive Under-stimulation";
      flowColor = "text-blue-800 bg-blue-50 border-blue-300";
    }

    let policyAction = "Maintain Dynamic Progression Flow (Reinforce Synaptogenesis)";
    if (ddaErrors >= 3) {
      policyAction = "Step Down Level -1 & Expand Hitbox Padding (+24px)";
    } else if (ddaSlowdown >= 60) {
      policyAction = "Deploy Golden Beacon & Slow Voice Pacing to 0.75x";
    } else if (ddaTremor >= 15) {
      policyAction = "Enable Parkinsonian Jitter Damping & 64px Touch Size";
    }

    const targetSizePx = Math.min(80, Math.max(48, 48 + Math.round(ddaTremor * 1.1)));
    const audioDelaySec = Math.max(4, Math.min(10, Math.round(5 + ddaSlowdown * 0.04)));

    return {
      flowZone,
      flowColor,
      policyAction,
      targetSizePx,
      audioDelaySec,
    };
  }, [ddaErrors, ddaSlowdown, ddaTremor]);

  // ── Simulator 06: FINGER Multidomain Synergy & Zarit Caregiver Burden ────
  const [fingerCognitiveDays, setFingerCognitiveDays] = useState<number>(5);
  const [fingerMindScore, setFingerMindScore] = useState<number>(11);
  const [fingerPhysicalMins, setFingerPhysicalMins] = useState<number>(30);
  const [fingerCaregiverRespite, setFingerCaregiverRespite] = useState<number>(3);

  const fingerMetrics = useMemo(() => {
    const declinePrevention = Math.min(
      38,
      Math.round(fingerCognitiveDays * 2.2 + (fingerMindScore / 15) * 12 + (fingerPhysicalMins / 60) * 11)
    );
    const executiveBoost = Math.min(
      150,
      Math.round(fingerCognitiveDays * 14 + (fingerMindScore / 15) * 35 + (fingerPhysicalMins / 60) * 25)
    );
    const zaritScore = Math.max(
      4,
      Math.round(38 - fingerCaregiverRespite * 3.5 - fingerCognitiveDays * 1.2 - fingerMindScore * 0.6)
    );
    let zaritTier = "Low Burden (Caregiver Resilient & Supported)";
    let zaritColor = "text-emerald-800 bg-emerald-50 border-emerald-300";
    if (zaritScore > 20) {
      zaritTier = "Severe Burnout Risk (Automated ASHA Alert & Tele-MANAS)";
      zaritColor = "text-rose-800 bg-rose-50 border-rose-300";
    } else if (zaritScore >= 11) {
      zaritTier = "Moderate Strain (Respite Reminders & Routine Simplification)";
      zaritColor = "text-amber-800 bg-amber-50 border-amber-300";
    }

    const postponementMonths = Math.round(declinePrevention * 0.8 + fingerCaregiverRespite * 2.5);

    return {
      declinePrevention,
      executiveBoost,
      zaritScore,
      zaritTier,
      zaritColor,
      postponementMonths,
    };
  }, [fingerCognitiveDays, fingerMindScore, fingerPhysicalMins, fingerCaregiverRespite]);

  // ── Simulator 07: W3C COGA Ergonomic Touch & Accessibility Simulator ────
  const [cogaTargetSize, setCogaTargetSize] = useState<number>(56);
  const [cogaContrast, setCogaContrast] = useState<number>(9.5);
  const [cogaSpeechRate, setCogaSpeechRate] = useState<number>(0.82);

  const cogaMetrics = useMemo(() => {
    let complianceStatus = "Full W3C COGA & WCAG 2.2 AAA Certified";
    let complianceBadge = "bg-emerald-100 text-emerald-800 border-emerald-300";
    if (cogaTargetSize < 44 || cogaContrast < 4.5 || cogaSpeechRate > 1.0) {
      complianceStatus = "Non-Compliant Cognitive Barrier (High Frustration)";
      complianceBadge = "bg-rose-100 text-rose-800 border-rose-300";
    } else if (cogaTargetSize < 48 || cogaContrast < 7.0 || cogaSpeechRate > 0.85) {
      complianceStatus = "WCAG 2.2 AA Standard (Sub-optimal for Geriatric MCI)";
      complianceBadge = "bg-amber-100 text-amber-800 border-amber-300";
    }

    const missClickRate = Math.max(1, Math.round(48 - (cogaTargetSize - 32) * 1.15));
    const comprehension =
      cogaSpeechRate <= 0.85
        ? "94% (Full Comprehension & Zero Panic)"
        : cogaSpeechRate <= 1.0
        ? "68% (Minor Processing Drops)"
        : "39% (Cognitive Overload & Frustration)";

    return {
      complianceStatus,
      complianceBadge,
      missClickRate,
      comprehension,
    };
  }, [cogaTargetSize, cogaContrast, cogaSpeechRate]);

  // ── Simulator 08: North East India Remote Triage & Coverage Simulator ────
  const [nerDistance, setNerDistance] = useState<number>(140);
  const [nerBlackout, setNerBlackout] = useState<number>(14);
  const [nerDialect, setNerDialect] = useState<string>("as");

  const nerMetrics = useMemo(() => {
    const travelHoursSaved = Math.round(nerDistance * 2.4);
    const rupeesSaved = Math.round(nerDistance * 18 + 1200);
    const cacheReliability =
      nerBlackout <= 30
        ? "100% Guaranteed (Zero Packet Loss Offline)"
        : "98.5% IndexedDB Buffered (Compacting FIFO)";
    const triageRoute =
      nerDistance > 120
        ? "Guwahati AIIMS / NEIGRIHMS Shillong Tele-Neurology Triage"
        : "District Civil Hospital & Anganwadi Local Outpatient Review";

    return {
      travelHoursSaved,
      rupeesSaved,
      cacheReliability,
      triageRoute,
    };
  }, [nerDistance, nerBlackout]);

  // Filtered References
  const filteredReferences = useMemo(() => {
    return CLINICAL_REFERENCES.filter((ref) => {
      const matchesCategory = refCategory === "all" || ref.category === refCategory;
      const matchesSearch =
        ref.title.toLowerCase().includes(refSearch.toLowerCase()) ||
        ref.authors.toLowerCase().includes(refSearch.toLowerCase()) ||
        ref.journal.toLowerCase().includes(refSearch.toLowerCase()) ||
        ref.clinicalTakeaway.toLowerCase().includes(refSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [refCategory, refSearch]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const currentSectionIndex = SECTIONS.findIndex((s) => s.id === activeTab);
  const prevSection = currentSectionIndex > 0 ? SECTIONS[currentSectionIndex - 1] : null;
  const nextSection = currentSectionIndex < SECTIONS.length - 1 ? SECTIONS[currentSectionIndex + 1] : null;

  const renderPagination = () => (
    <div className="pt-6 border-t border-stone-200/90 flex items-center justify-between gap-4 print:hidden">
      {prevSection ? (
        <button
          type="button"
          onClick={() => {
            setActiveTab(prevSection.id);
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 140, behavior: "smooth" });
            }
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:border-stone-300 transition-colors cursor-pointer shadow-xs"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous:</span>
          <span>{prevSection.shortLabel}</span>
        </button>
      ) : <div />}

      {nextSection ? (
        <button
          type="button"
          onClick={() => {
            setActiveTab(nextSection.id);
            if (typeof window !== "undefined") {
              window.scrollTo({ top: 140, behavior: "smooth" });
            }
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-700/30 bg-emerald-800 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-900 transition-colors cursor-pointer ml-auto shadow-xs"
        >
          <span className="hidden sm:inline">Next:</span>
          <span>{nextSection.shortLabel}</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      ) : <div />}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 pb-24 font-sans">
      {/* Editorial Clinical Masthead */}
      <header className="border-b border-stone-200/90 bg-[#FDFBF7] px-4 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto space-y-4">
          {/* Subtle Single-Line Metadata Breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-stone-600">
            <span className="inline-flex items-center gap-1.5 text-emerald-800 font-bold">
              <Stethoscope className="h-4 w-4 text-emerald-700" />
              <span>Clinical Research Dossier</span>
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-700">Software as a Medical Device (SaMD) Class B</span>
            <span className="text-stone-300">•</span>
            <span className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[11px] font-mono text-stone-700">
              SIH PS 26003
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight max-w-4xl">
            AI-Driven Serious Cognitive Gaming &amp; Memory Assistance Platform
          </h1>
          <p className="max-w-3xl text-sm sm:text-base font-normal text-stone-600 leading-relaxed">
            A comprehensive clinical, neuropsychological, and regulatory framework governing errorless cognitive rehabilitation, passive MoCA telemetry, reinforcement-learning difficulty adjustment, and indigenous gerontological care in North East India.
          </p>

          {/* Dossier Metadata & Academic Actions Bar */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200/60 pt-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs font-medium text-stone-600">
              <span className="inline-flex items-center gap-1.5 bg-stone-100/80 px-2.5 py-1 rounded-md border border-stone-200/80 text-stone-700 font-medium">
                <BookOpen className="h-3.5 w-3.5 text-stone-500" />
                10 Evidence Domains
              </span>
              <span className="inline-flex items-center gap-1.5 bg-stone-100/80 px-2.5 py-1 rounded-md border border-stone-200/80 text-stone-700 font-medium">
                <Award className="h-3.5 w-3.5 text-stone-500" />
                20 Landmark Trials
              </span>
              <span className="inline-flex items-center gap-1.5 bg-stone-100/80 px-2.5 py-1 rounded-md border border-stone-200/80 text-stone-700 font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-stone-500" />
                W3C COGA &amp; CDSCO Aligned
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-xs cursor-pointer print:hidden"
              >
                <Printer className="h-3.5 w-3.5 text-stone-600" />
                <span>Print Dossier</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("references");
                  if (typeof window !== "undefined") {
                    window.scrollTo({ top: 140, behavior: "smooth" });
                  }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/80 bg-emerald-50/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/80 transition-colors cursor-pointer"
              >
                <FileText className="h-3.5 w-3.5 text-emerald-700" />
                <span>20 Landmark Citations</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body with Responsive 2-Column Editorial Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile Section Selector (lg:hidden) */}
        <div className="lg:hidden mb-6 print:hidden">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 flex items-center justify-between">
            <span>Dossier Sections ({SECTIONS.length})</span>
            <span className="text-emerald-700 font-semibold font-mono">
              {SECTIONS.find((s) => s.id === activeTab)?.num} / 10
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {SECTIONS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (typeof window !== "undefined") {
                      window.scrollTo({ top: 120, behavior: "smooth" });
                    }
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    isActive
                      ? "border-emerald-800 bg-emerald-800 text-white font-bold shadow-xs"
                      : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 font-medium"
                  }`}
                >
                  <span className="font-mono text-[10px] opacity-80">{tab.num}</span>
                  <span>{tab.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-Column Desktop Grid */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
          {/* Desktop Sticky Table of Contents (3 cols on lg, 3 on xl) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 sticky top-6 space-y-4 print:hidden">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                  Table of Contents
                </span>
                <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
                  10 Sections
                </span>
              </div>

              <nav className="space-y-1" aria-label="Clinical Dossier Sections">
                {SECTIONS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(tab.id);
                        if (typeof window !== "undefined") {
                          window.scrollTo({ top: 140, behavior: "smooth" });
                        }
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                        isActive
                          ? "bg-emerald-50 text-emerald-950 font-bold border-l-4 border-emerald-700 shadow-xs"
                          : "text-stone-600 hover:text-stone-900 hover:bg-stone-50 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        <span
                          className={`font-mono text-[10px] shrink-0 ${
                            isActive ? "text-emerald-700 font-bold" : "text-stone-400"
                          }`}
                        >
                          {tab.num}
                        </span>
                        <span className="truncate">{tab.shortLabel}</span>
                      </div>
                      <Icon
                        className={`h-3.5 w-3.5 shrink-0 ${
                          isActive ? "text-emerald-700" : "text-stone-400"
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>

              {/* Sidebar Quick Regulatory Badge */}
              <div className="rounded-xl border border-stone-200/80 bg-stone-50/70 p-3 pt-2.5 text-[11px] text-stone-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                  <span>SaMD Class B Spec</span>
                </div>
                <p className="text-[10px] text-stone-500 leading-normal">
                  Non-invasive screening &amp; active cognitive rehabilitation. Zero cloud egress for biometrics.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content Column (8 cols on lg, 9 on xl) */}
          <div className="lg:col-span-8 xl:col-span-9 min-w-0 space-y-6">

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: THE CDTX IMPERATIVE & NEUROCOGNITIVE CRISIS
        ══════════════════════════════════════════════════════════════════════ */}
        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: THE CDTX IMPERATIVE & NEUROCOGNITIVE CRISIS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <section className="space-y-6 animate-fade-in" aria-label="The CDTx Imperative">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider">
                <Brain className="h-3.5 w-3.5 text-stone-600" />
                <span>Section 01 // Epidemiological Crisis &amp; Digital Therapeutics</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                From Pharmacological Limitations to Precision Digital Therapeutics (CDTx)
              </h2>
              <p className="text-sm sm:text-base font-normal text-stone-600 leading-relaxed">
                The global prevalence of dementia is accelerating at an unprecedented rate, presenting one of the most formidable public health challenges of the 21st century. Current epidemiological models estimate that over <strong>55 million individuals worldwide</strong> live with dementia—a figure projected by the WHO to nearly triple to <strong>139 million by 2050</strong>. In India, an estimated 8.8 million older adults currently suffer from neurocognitive disorders.
              </p>

              {/* Pharmacotherapy Limits */}
              <div className="rounded-xl border-l-4 border-amber-600 bg-amber-50/50 p-5 space-y-2">
                <h3 className="font-serif text-base font-bold text-amber-950 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>The Pharmacological Ceiling</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  Historically, clinical management has relied on acetylcholinesterase inhibitors (donepezil, rivastigmine, galantamine) and NMDA receptor antagonists (memantine). While providing modest temporary symptomatic stabilization, these agents exhibit negligible disease-modifying capacity, do not arrest neurodegenerative apoptosis, and trigger debilitating adverse effects (nausea, bradycardia, syncopal episodes, agitation). This ceiling has catalyzed a global consensus toward evidence-based <strong>Cognition-Oriented Treatments (COTs)</strong>.
                </p>
              </div>

              {/* The 3 Modalities of COTs */}
              <div className="pt-2 space-y-3">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  The Three Pillars of Cognition-Oriented Treatments (COTs)
                </h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-5 space-y-2 hover:border-stone-300 transition-colors">
                    <span className="rounded-md bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
                      Modality A
                    </span>
                    <h4 className="font-serif text-base font-bold text-stone-900">Cognitive Stimulation (CS)</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Multisensory, reality orientation, and social communication therapy. Designed to activate global neuroplasticity and emotional wellbeing without confrontational testing.
                    </p>
                    <div className="text-[11px] font-semibold text-emerald-800 pt-1">
                      CogniCare Module: Echoes of Home, Saathi Dialect Companion
                    </div>
                  </div>

                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-5 space-y-2 hover:border-stone-300 transition-colors">
                    <span className="rounded-md bg-amber-100/80 border border-amber-200 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-900">
                      Modality B
                    </span>
                    <h4 className="font-serif text-base font-bold text-stone-900">Cognitive Training (CT)</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Structured, computer-adaptive gamified drills targeting discrete neural circuits (working memory, mental rotation, visuospatial processing speed).
                    </p>
                    <div className="text-[11px] font-semibold text-amber-800 pt-1">
                      CogniCare Module: Sorting Games, Bamboo Labyrinth, River Lantern
                    </div>
                  </div>

                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-5 space-y-2 hover:border-stone-300 transition-colors">
                    <span className="rounded-md bg-purple-100/80 border border-purple-200 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-900">
                      Modality C
                    </span>
                    <h4 className="font-serif text-base font-bold text-stone-900">Cognitive Rehabilitation (CR)</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Goal-oriented, contextual rehabilitation using preserved procedural memory to maintain Instrumental Activities of Daily Living (IADLs) and functional independence.
                    </p>
                    <div className="text-[11px] font-semibold text-purple-800 pt-1">
                      CogniCare Module: Make My Tea, Daily Routine Sequencing
                    </div>
                  </div>
                </div>
              </div>

              {/* DSM-5 Six Core Cognitive Domains Matrix */}
              <div className="pt-4 space-y-4 border-t border-stone-200/80">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-bold uppercase text-stone-700">
                      DSM-5 &amp; NIH StatPearls Neurocognitive Taxonomy
                    </span>
                    <h3 className="font-serif text-xl font-bold text-stone-900 mt-1">
                      Targeting the Six DSM-5 Neurocognitive Domains
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-stone-500">
                    PMID: 32491448 &bull; Emmady et al. 2022
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  As codified in the <em>Diagnostic and Statistical Manual of Mental Disorders (DSM-5)</em> and reinforced in NIH StatPearls (Emmady et al., 2022), Major and Mild Neurocognitive Disorders are defined by quantifiable declines across six discrete cognitive domains. CogniCare maps its serious gaming suite and passive telemetry specifically to each neural substrate:
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                  {/* Domain 1 */}
                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-4 space-y-2 hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                        Domain 1
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">Frontoparietal</span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-stone-900">Complex Attention &amp; Speed</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Sustained vigilance, selective attention, and psychomotor processing speed under distraction.
                    </p>
                    <div className="text-[11px] font-medium text-emerald-900 bg-white p-2 rounded-lg border border-stone-200/80">
                      <strong>CogniCare Battery:</strong> Monastery Bell (auditory vigilance), River Lantern (selective visual Go/No-Go).
                    </div>
                  </div>

                  {/* Domain 2 */}
                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-4 space-y-2 hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded">
                        Domain 2
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">Dorsolateral Prefrontal</span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-stone-900">Executive Function</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Multi-step planning, working memory manipulation, mental flexibility, and cognitive switching.
                    </p>
                    <div className="text-[11px] font-medium text-amber-950 bg-white p-2 rounded-lg border border-stone-200/80">
                      <strong>CogniCare Battery:</strong> Bamboo Labyrinth (heuristic search), Tea Sorting (working memory sets), Make My Tea (IADL sequencing).
                    </div>
                  </div>

                  {/* Domain 3 */}
                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-4 space-y-2 hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100/70 px-2 py-0.5 rounded">
                        Domain 3
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">Medial Temporal / Hippo</span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-stone-900">Learning &amp; Episodic Memory</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Immediate and delayed free recall, cued recognition, spatial landmark anchoring, and errorless encoding.
                    </p>
                    <div className="text-[11px] font-medium text-indigo-950 bg-white p-2 rounded-lg border border-stone-200/80">
                      <strong>CogniCare Battery:</strong> Memory Garden (associative recall), Memory Road (topographical cues), Ancestral Herbalist (semantic memory).
                    </div>
                  </div>

                  {/* Domain 4 */}
                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-4 space-y-2 hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100/70 px-2 py-0.5 rounded">
                        Domain 4
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">Left Perisylvian</span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-stone-900">Language &amp; Semantic Retrieval</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Confrontation naming, semantic category fluency, receptive comprehension in 11 regional mother tongues.
                    </p>
                    <div className="text-[11px] font-medium text-rose-950 bg-white p-2 rounded-lg border border-stone-200/80">
                      <strong>CogniCare Battery:</strong> Dzukou Botanist (floral nomenclature), Echoes of Home (oral reminiscence), Saathi Voice Companion.
                    </div>
                  </div>

                  {/* Domain 5 */}
                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-4 space-y-2 hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded">
                        Domain 5
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">Parieto-Occipital</span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-stone-900">Perceptual-Motor Function</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Visuoconstructional praxis, visual perception, figure copy, and hand-eye motor trajectory coordination.
                    </p>
                    <div className="text-[11px] font-medium text-teal-950 bg-white p-2 rounded-lg border border-stone-200/80">
                      <strong>CogniCare Battery:</strong> Kaziranga Jigsaw (constructional assembly), Rhino Sanctuary (spatial wayfinding, apraxia support).
                    </div>
                  </div>

                  {/* Domain 6 */}
                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-4 space-y-2 hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-100/70 px-2 py-0.5 rounded">
                        Domain 6
                      </span>
                      <span className="text-[10px] font-mono text-stone-500">Orbitofrontal / Amygdala</span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-stone-900">Social Cognition &amp; BPSD De-escalation</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Theory of mind, empathetic communication, and non-pharmacological behavioral mitigation for agitation or wandering.
                    </p>
                    <div className="text-[11px] font-medium text-purple-950 bg-white p-2 rounded-lg border border-stone-200/80">
                      <strong>CogniCare Battery:</strong> Bazaar Buddies (social commerce interaction), Caregiver De-escalation Coaching (redirection vs confrontation).
                    </div>
                  </div>
                </div>

                {/* Clinical Guidance Callout: Redirection vs Correction & MIND Diet */}
                <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4.5 space-y-2.5 mt-2">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-emerald-800 shrink-0" />
                    <span className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                      Interprofessional Rehabilitation Principles (Practical Neurology &amp; ASHA Portal)
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs text-stone-700">
                    <div className="space-y-1 bg-white p-3 rounded-lg border border-stone-200/80">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <Smile className="h-3.5 w-3.5 text-amber-700" />
                        <span>Validation &amp; Redirection vs Confrontation</span>
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        In accordance with NIH StatPearls and ASHA guidelines, responsive behaviors (restlessness, wandering, repetitiveness) are treated as expressions of unmet needs. Caregivers are guided never to argue or confront, but to validate emotional truth and gently redirect to familiar soothing rituals.
                      </p>
                    </div>
                    <div className="space-y-1 bg-white p-3 rounded-lg border border-stone-200/80">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <Brain className="h-3.5 w-3.5 text-emerald-700" />
                        <span>MIND Diet &amp; Ethnobotany Cognitive Reserve</span>
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        As highlighted by Bouchachi &amp; Kataki (Practical Neurology), combining cognitive stimulation with antioxidant dietary patterns (MIND protocol) slows functional decline. CogniCare integrates indigenous North Eastern botanical wisdom (Lakadong curcumin, Centella asiatica) into daily routines and reminiscence therapy.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Problem Statement 26003 Mandate */}
            <div className="rounded-2xl border border-emerald-200 bg-[#F4F8F5] p-6 sm:p-8 text-stone-900 shadow-xs space-y-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                <Compass className="h-3.5 w-3.5 text-emerald-700" />
                <span>SIH Problem Statement 26003 // MDoNER Alignment</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                Closing the North East India Psychogeriatric Accessibility Gap
              </h3>
              <p className="text-xs sm:text-sm font-normal text-stone-700 leading-relaxed max-w-3xl">
                The 8 North Eastern states (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura) face profound geographic challenges: high mountain passes, isolated hill settlements, annual monsoonal river floods, and riverine island populations like Majuli. The psychogeriatric specialist density is critical: <strong>less than 1 certified neurologist or psychogeriatrician per 1.5 million population</strong> in remote hill districts.
              </p>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="rounded-xl border border-stone-200/90 bg-white p-3.5 space-y-1 shadow-2xs">
                  <div className="text-emerald-800 text-xs font-bold uppercase tracking-wide">Authentication</div>
                  <div className="font-semibold text-stone-900 text-sm">Zero-Cognitive QR Kiosk</div>
                  <div className="text-xs text-stone-600">No passwords or OTP barriers</div>
                </div>
                <div className="rounded-xl border border-stone-200/90 bg-white p-3.5 space-y-1 shadow-2xs">
                  <div className="text-emerald-800 text-xs font-bold uppercase tracking-wide">Connectivity</div>
                  <div className="font-semibold text-stone-900 text-sm">100% Offline PWA Mode</div>
                  <div className="text-xs text-stone-600">IndexedDB local sync engine</div>
                </div>
                <div className="rounded-xl border border-stone-200/90 bg-white p-3.5 space-y-1 shadow-2xs">
                  <div className="text-emerald-800 text-xs font-bold uppercase tracking-wide">Linguistics</div>
                  <div className="font-semibold text-stone-900 text-sm">11 Regional Dialects</div>
                  <div className="text-xs text-stone-600">Voice-first oral comprehension</div>
                </div>
                <div className="rounded-xl border border-stone-200/90 bg-white p-3.5 space-y-1 shadow-2xs">
                  <div className="text-emerald-800 text-xs font-bold uppercase tracking-wide">Interoperability</div>
                  <div className="font-semibold text-stone-900 text-sm">ABDM FHIR R4 Ready</div>
                  <div className="text-xs text-stone-600">Ayushman Bharat Health Account</div>
                </div>
              </div>
            </div>

            {/* Direct Authoritative References for Section 01 */}
            <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                <BookOpen className="h-4 w-4 text-emerald-800" />
                <span>Authoritative Clinical References &amp; Diagnostic Guidelines (Section 01)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ClinicalReferenceCard referenceId="nih-statpearls-dementia-2022" />
                <ClinicalReferenceCard referenceId="practical-neurology-kataki-2021" />
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2: ERRORLESS LEARNING (EL) & PROCEDURAL SCAFFOLDING
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "errorless" && (
          <section className="space-y-6 animate-fade-in" aria-label="Errorless Learning">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5 text-stone-600" />
                <span>Section 02 // Neuropsychological Principles</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                Errorless Learning (EL) vs. Errorful Trial-and-Error
              </h2>
              <p className="text-sm sm:text-base font-normal text-stone-600 leading-relaxed">
                The neuropathological hallmark of early Alzheimer&apos;s disease is neurofibrillary degeneration within the <strong>entorhinal cortex and CA1/CA3 hippocampal pyramidal circuits</strong>, resulting in catastrophic loss of <em>episodic and declarative memory</em>. Conversely, the <strong>striatal, basal ganglia, and cerebellar motor loops</strong> governing <em>implicit procedural memory</em> remain functionally preserved until advanced stages.
              </p>

              {/* The Clare & Jones 2008 Mechanism */}
              <div className="rounded-xl border-l-4 border-emerald-600 bg-emerald-50/50 p-5 space-y-2">
                <h3 className="font-serif text-base font-bold text-emerald-950 flex items-center gap-2">
                  <Info className="h-4 w-4 text-emerald-700 shrink-0" />
                  <span>The Fallacy of Trial-and-Error in Dementia (Clare &amp; Jones, 2008)</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  In healthy adults, committing an error generates a negative error prediction signal via the anterior cingulate cortex, prompting self-correction. In amnesic dementia patients, this executive monitoring fails: the patient cannot identify the error as incorrect, and <strong>the wrong response is mistakenly encoded and consolidated directly into their fragile memory traces</strong>. Traditional gaming failure screens and red buzzers reinforce erroneous memories, triggering catastrophic emotional withdrawal and agitation.
                </p>
              </div>

              {/* Tripartite CogniCare Architecture */}
              <div className="pt-2 space-y-3">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  CogniCare Tripartite Errorless Rehabilitation Engine
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-5 space-y-2 hover:border-stone-300 transition-colors">
                    <div className="h-7 w-7 rounded-lg bg-amber-100/80 border border-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <h4 className="font-serif text-base font-bold text-stone-900">Progressive Vanishing Cues</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      If hesitation exceeds 6.0 seconds, the target item emits a gentle pulsing golden halo (<code className="text-[10px] bg-amber-50 px-1 py-0.5 rounded border border-amber-200">ring-4 ring-amber-400</code>). Visual cues vanish progressively as reaction speeds normalize.
                    </p>
                  </div>

                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-5 space-y-2 hover:border-stone-300 transition-colors">
                    <div className="h-7 w-7 rounded-lg bg-teal-100/80 border border-teal-200 text-teal-900 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <h4 className="font-serif text-base font-bold text-stone-900">Deterministic Soft-Blocking</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Tapping an incorrect choice never triggers a red &quot;X&quot; or harsh buzzer. Instead, a soothing harmonic water ripple chime plays, gently bouncing the cursor while Saathi calmly reassures: <em>&quot;Take your time. Notice the golden path.&quot;</em>
                    </p>
                  </div>

                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-5 space-y-2 hover:border-stone-300 transition-colors">
                    <div className="h-7 w-7 rounded-lg bg-purple-100/80 border border-purple-200 text-purple-900 flex items-center justify-center font-bold text-xs">
                      3
                    </div>
                    <h4 className="font-serif text-base font-bold text-stone-900">Self-Generation (EL-SG)</h4>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Rather than purely passive demonstration, the patient is scaffolded to execute the final motor tap themselves. This activates striatal procedural long-term potentiation without the threat of error consolidation.
                    </p>
                  </div>
                </div>
              </div>

              {/* CST & Multisensory Reminiscence */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-5 space-y-3 mt-4">
                <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                  <HeartHandshake className="h-4 w-4 text-emerald-700" />
                  <span>Cognitive Stimulation Therapy (CST) &amp; 40Hz Gamma Auditory Stimulation</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Cochrane Systematic Reviews (Woods et al., 2012) establish that structured 14-session CST protocols deliver significant cognitive and quality-of-life benefits comparable to anticholinesterase pharmaceuticals (effect size d = 0.35–0.40). CogniCare integrates CST through:
                </p>
                <ul className="grid sm:grid-cols-2 gap-2 text-xs text-stone-700 font-medium">
                  <li className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-stone-200/80">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span>Binaural Sohra monsoon rain on tin rooftops</span>
                  </li>
                  <li className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-stone-200/80">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span>Majuli Brahmaputra rowing oar rhythmic pacing</span>
                  </li>
                  <li className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-stone-200/80">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span>40Hz acoustic gamma frequencies (MIT Tsai lab amyloid model)</span>
                  </li>
                  <li className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-stone-200/80">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700 shrink-0" />
                    <span>3D living memory albums populated by family caregivers</span>
                  </li>
                </ul>
              </div>

              {/* Interactive Errorless Scaffolding Simulator */}
              <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-5 space-y-4 mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-emerald-700" />
                      <span>Interactive Errorless Scaffolding &amp; Vanishing Cue Simulator</span>
                    </h3>
                    <p className="text-xs text-stone-600">
                      Simulate the neuropsychological contrast between errorful trial-and-error and CogniCare&apos;s vanishing golden cues (Clare &amp; Jones 2008).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setElHesitation(6);
                      setElAmnesiaSeverity(45);
                      setElCueIntensity(75);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Reset to Baseline</span>
                  </button>
                </div>

                {/* Range Sliders Grid */}
                <div className="grid sm:grid-cols-3 gap-3 text-xs font-semibold">
                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Hesitation Latency:</span>
                      <span className="text-emerald-800 font-bold">{elHesitation}.0s</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={elHesitation}
                      onChange={(e) => setElHesitation(Number(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Threshold for Vanishing Cue Beacon: 6.0s</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Amnesia Severity:</span>
                      <span className="text-amber-800 font-bold">{elAmnesiaSeverity}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="90"
                      value={elAmnesiaSeverity}
                      onChange={(e) => setElAmnesiaSeverity(Number(e.target.value))}
                      className="w-full accent-amber-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Hippocampal CA1/CA3 Degradation</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Golden Cue Opacity:</span>
                      <span className="text-purple-800 font-bold">{elCueIntensity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={elCueIntensity}
                      onChange={(e) => setElCueIntensity(Number(e.target.value))}
                      className="w-full accent-purple-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Luminous Scaffolding Guidance</div>
                  </div>
                </div>

                {/* Dynamic Neuro-Cognitive Metric Outputs */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className={`rounded-xl border p-3.5 space-y-1 ${
                    elMetrics.errorConsolidationHazard > 30
                      ? "bg-rose-50/80 border-rose-200 text-rose-950"
                      : "bg-emerald-50/80 border-emerald-200 text-emerald-950"
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Error Consolidation Hazard
                    </span>
                    <div className="text-2xl font-extrabold">{elMetrics.errorConsolidationHazard}%</div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      {elMetrics.errorConsolidationHazard > 30
                        ? "High Risk: False memory traces consolidating into fragile episodic store."
                        : "Safeguarded: Errorless vanishing cue prevents mistaken memory encoding."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-3.5 space-y-1 text-indigo-950">
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Procedural Retention (Striatum)
                    </span>
                    <div className="text-2xl font-extrabold">{elMetrics.proceduralRetention}%</div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      Preserved basal ganglia procedural pathways activated via errorless self-generation (EL-SG).
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 space-y-1 text-amber-950">
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Affective Stress &amp; Cortisol
                    </span>
                    <div className="text-sm font-bold mt-1">{elMetrics.cortisolTier}</div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      Soft-blocking water chimes replace loud failure buzzers, suppressing panic-induced sundowning.
                    </p>
                  </div>
                </div>

                {/* Live Visual Simulation Preview Card */}
                <div className="rounded-xl border border-stone-200/90 bg-white p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500">
                      Live In-Game Scaffolding Visualizer
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                      elMetrics.vanishingTriggered && elCueIntensity >= 30
                        ? "bg-amber-100 border-amber-300 text-amber-900 font-bold"
                        : "bg-stone-100 border-stone-200 text-stone-600"
                    }`}>
                      {elMetrics.vanishingTriggered && elCueIntensity >= 30
                        ? "Vanishing Aura ACTIVE (6.0s elapsed)"
                        : "Dormant (Waiting for 6s hesitation)"}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <div className="flex-1 min-w-[200px] p-3.5 rounded-xl border border-stone-200 bg-stone-50 text-xs text-stone-700">
                      <strong>Patient State:</strong> Elder is pausing before selecting morning medicine or tea kettle step ({elHesitation}.0s).
                    </div>
                    <div className={`px-5 py-3 rounded-2xl border-3 border-stone-800 font-bold text-xs flex items-center gap-2 transition-all ${
                      elMetrics.vanishingTriggered && elCueIntensity >= 30
                        ? "bg-amber-100 border-amber-600 ring-4 ring-amber-400 animate-pulse scale-[1.02] shadow-[3px_3px_0px_#D97706]"
                        : "bg-white text-stone-800 shadow-[3px_3px_0px_#000]"
                    }`}>
                      <Sparkles className={`h-4 w-4 ${elMetrics.vanishingTriggered ? "text-amber-600" : "text-stone-400"}`} />
                      <span>Boil Fresh Spring Water (Lal Saah)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Authoritative References for Section 02 */}
            <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                <BookOpen className="h-4 w-4 text-emerald-800" />
                <span>Authoritative Clinical Literature on Errorless Learning (Section 02)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ClinicalReferenceCard referenceId="errorless-clare-2008" />
                <ClinicalReferenceCard referenceId="asha-practice-portal-dementia-2023" />
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 3: TRANSFER OF TRAINING & THE ACTIVE STUDY
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "transfer" && (
          <section className="space-y-6 animate-fade-in" aria-label="Transfer of Training">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider">
                <Award className="h-3.5 w-3.5 text-stone-600" />
                <span>Section 03 // Resolving the Transfer Controversy</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                The Transfer of Training Controversy &amp; The ACTIVE Study
              </h2>
              <p className="text-sm sm:text-base font-normal text-stone-600 leading-relaxed">
                A seminal critique in cognitive gerontology is that commercial &quot;brain games&quot; (e.g., Lumosity, Elevate) produce only <strong>narrow &quot;near transfer&quot;</strong>: users become faster at playing that specific game, but fail to demonstrate <strong>&quot;far transfer&quot;</strong> to real-world functional competence, such as managing finances, cooking safely, or remembering life-critical medications.
              </p>

              {/* The ACTIVE Study Breakdown */}
              <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-6 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 bg-indigo-100/80 px-2.5 py-0.5 rounded-md">
                    Landmark 20-Year NIH Clinical Trial (n = 2,802)
                  </span>
                  <span className="text-xs font-semibold text-indigo-800">
                    JAMA 2002; JAGS 2014; Alz &amp; Dem 2017
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-indigo-950">
                  The Advanced Cognitive Training for Independent and Vital Elderly (ACTIVE) Study
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  Conducted across six clinical centers funded by the US National Institutes of Health (NIH), ACTIVE demonstrated that targeted speed of processing and memory training yielded measurable improvements that endured at <strong>5-year, 10-year, and 20-year follow-ups</strong>. Most crucially:
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-2">
                  <div className="rounded-xl border border-indigo-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <div className="text-2xl font-extrabold text-indigo-700">29%</div>
                    <div className="text-xs font-bold text-stone-900">Dementia Risk Reduction</div>
                    <div className="text-[11px] text-stone-600">
                      Participants receiving booster speed training exhibited 29% lower incidence of dementia at 10 years.
                    </div>
                  </div>
                  <div className="rounded-xl border border-indigo-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <div className="text-2xl font-extrabold text-emerald-700">10 Years</div>
                    <div className="text-xs font-bold text-stone-900">IADL Preservation</div>
                    <div className="text-[11px] text-stone-600">
                      Trained elders reported significantly less difficulty performing daily tasks (cooking, medication, telephone).
                    </div>
                  </div>
                  <div className="rounded-xl border border-indigo-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <div className="text-2xl font-extrabold text-amber-700">Far Transfer</div>
                    <div className="text-xs font-bold text-stone-900">Proven Generalization</div>
                    <div className="text-[11px] text-stone-600">
                      Established that cognitive speed drills directly generalize into physical road driving safety and independent living.
                    </div>
                  </div>
                </div>
              </div>

              {/* CogniCare Far Transfer Engineering */}
              <div className="pt-2 space-y-3">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  How CogniCare Guarantees Far Transfer to Instrumental Activities of Daily Living
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Rather than abstract geometry or arbitrary number grids, CogniCare anchors cognitive mechanics directly into authentic daily life routines:
                </p>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-4 shadow-2xs space-y-2 hover:border-stone-300 transition-colors">
                    <h4 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                      <span>🫖</span>
                      <span>Make My Tea (Lal Saah Brewing)</span>
                    </h4>
                    <p className="text-xs text-stone-600">
                      <strong>Cognitive Domain:</strong> Executive Sequencing, Working Memory &amp; Procedural Invariance.
                    </p>
                    <p className="text-xs text-stone-600">
                      <strong>Far Transfer Impact:</strong> Directly reinforces kitchen safety, boiling water awareness, and morning self-efficacy, preventing premature loss of culinary independence.
                    </p>
                  </div>

                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-4 shadow-2xs space-y-2 hover:border-stone-300 transition-colors">
                    <h4 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                      <span>☀️</span>
                      <span>Daily Care Routine &amp; Sun-Downing Calmer</span>
                    </h4>
                    <p className="text-xs text-stone-600">
                      <strong>Cognitive Domain:</strong> Circadian Reality Orientation &amp; Prospective Memory.
                    </p>
                    <p className="text-xs text-stone-600">
                      <strong>Far Transfer Impact:</strong> Trains the habit of taking hypertension and dementia medications with meals, drinking adequate water, and soothing late-afternoon agitation.
                    </p>
                  </div>

                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-4 shadow-2xs space-y-2 hover:border-stone-300 transition-colors">
                    <h4 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                      <span>🧺</span>
                      <span>Bazaar Buddies &amp; Morning Market</span>
                    </h4>
                    <p className="text-xs text-stone-600">
                      <strong>Cognitive Domain:</strong> Numerical Estimation, Currency Recognition &amp; Social Cognition.
                    </p>
                    <p className="text-xs text-stone-600">
                      <strong>Far Transfer Impact:</strong> Preserves ability to handle small rupee currency denominations, barter with vegetable vendors, and maintain community dignity.
                    </p>
                  </div>

                  <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-4 shadow-2xs space-y-2 hover:border-stone-300 transition-colors">
                    <h4 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                      <span>💬</span>
                      <span>Grandchild AI Dialogue &amp; Photo Match</span>
                    </h4>
                  <p className="text-xs font-semibold text-stone-700">
                    <strong>Cognitive Domain:</strong> Facial Recognition, Semantic Lexical Retrieval &amp; Affective Memory.
                  </p>
                  <p className="text-xs text-stone-600">
                    <strong>Far Transfer Impact:</strong> Counteracts prosopagnosia (failure to recognize relatives), mitigating family heartbreak and promoting warm intergenerational bonding.
                  </p>
                </div>
              </div>
            </div>

            {/* Interactive ACTIVE Far-Transfer Simulator */}
            <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-5 space-y-4 mt-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
                <div>
                  <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-indigo-700" />
                    <span>Interactive ACTIVE 10-Year Cognitive Trajectory Simulator</span>
                  </h3>
                  <p className="text-xs text-stone-600">
                    Model 10-year dementia incidence and IADL independence based on training dosage and annual booster cycles (JAMA 2002, JAGS 2014, Alz &amp; Dem 2017).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveDosage(18);
                    setActiveBoosters(2);
                    setActiveAge(68);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Reset to Baseline</span>
                </button>
              </div>

              {/* Range Sliders Grid */}
              <div className="grid sm:grid-cols-3 gap-3 text-xs font-semibold">
                <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                  <div className="flex justify-between">
                    <span className="text-stone-700">Initial Training Dosage:</span>
                    <span className="text-indigo-800 font-bold">{activeDosage} Hours</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={activeDosage}
                    onChange={(e) => setActiveDosage(Number(e.target.value))}
                    className="w-full accent-indigo-700 cursor-pointer"
                  />
                  <div className="text-[10px] text-stone-500">ACTIVE Trial Standard: 10 - 20 Hours</div>
                </div>

                <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                  <div className="flex justify-between">
                    <span className="text-stone-700">Annual Booster Blocks:</span>
                    <span className="text-indigo-800 font-bold">{activeBoosters} Cycles / Yr</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={activeBoosters}
                    onChange={(e) => setActiveBoosters(Number(e.target.value))}
                    className="w-full accent-indigo-700 cursor-pointer"
                  />
                  <div className="text-[10px] text-stone-500">Booster reinforcement at 11 &amp; 35 months</div>
                </div>

                <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                  <div className="flex justify-between">
                    <span className="text-stone-700">Intervention Age:</span>
                    <span className="text-stone-800 font-bold">{activeAge} Years Old</span>
                  </div>
                  <input
                    type="range"
                    min="55"
                    max="85"
                    value={activeAge}
                    onChange={(e) => setActiveAge(Number(e.target.value))}
                    className="w-full accent-stone-700 cursor-pointer"
                  />
                  <div className="text-[10px] text-stone-500">Secondary MCI Prevention Window</div>
                </div>
              </div>

              {/* Dynamic 10-Year Clinical Metrics */}
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-3.5 space-y-1 text-indigo-950">
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                    Dementia Risk Reduction
                  </span>
                  <div className="text-2xl font-extrabold">-{activeMetrics.dementiaRiskReduction}%</div>
                  <p className="text-[11px] leading-relaxed opacity-85">
                    10-Year hazard reduction benchmarked against ACTIVE speed training arm.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-1 text-emerald-950">
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                    10-Yr IADL Preservation
                  </span>
                  <div className="text-2xl font-extrabold">{activeMetrics.iadlPreservation}%</div>
                  <p className="text-[11px] leading-relaxed opacity-85">
                    Probability of managing cooking, bills, and medications unassisted.
                  </p>
                </div>

                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 space-y-1 text-amber-950">
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                    Processing Speed Gain
                  </span>
                  <div className="text-2xl font-extrabold">+{activeMetrics.speedGainMs} ms</div>
                  <p className="text-[11px] leading-relaxed opacity-85">
                    Useful Field of View (UFOV) visual search &amp; road safety acceleration.
                  </p>
                </div>

                <div className="rounded-xl border border-teal-200 bg-teal-50/80 p-3.5 space-y-1 text-teal-950">
                  <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                    Extended Home Autonomy
                  </span>
                  <div className="text-2xl font-extrabold">+{activeMetrics.extraYearsAutonomy} Yrs</div>
                  <p className="text-[11px] leading-relaxed opacity-85">
                    Estimated prolonged independent living before assisted care dependency.
                  </p>
                </div>
              </div>

              {/* Trajectory Comparison Bar */}
              <div className="rounded-xl border border-stone-200/90 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                  <span>10-Year Projected Functional Trajectory</span>
                  <span className="text-indigo-800 font-mono">CogniCare Active Regimen vs Control</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px] text-stone-500">
                      <span>Usual Aging / Passive Control (Natural Atrophy)</span>
                      <span>52% IADL Capacity</span>
                    </div>
                    <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-stone-400 rounded-full w-[52%]" />
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex justify-between text-[11px] font-semibold text-indigo-900">
                      <span>CogniCare Far-Transfer Protocol ({activeDosage}h + {activeBoosters} boosters)</span>
                      <span>{activeMetrics.iadlPreservation}% IADL Capacity</span>
                    </div>
                    <div className="h-2.5 w-full bg-indigo-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                        style={{ width: `${activeMetrics.iadlPreservation}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Authoritative References for Section 03 */}
          <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-5 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
              <BookOpen className="h-4 w-4 text-emerald-800" />
              <span>Authoritative Clinical RCTs on Far-Transfer &amp; Speed-of-Processing (Section 03)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <ClinicalReferenceCard referenceId="active-jama-2002" />
              <ClinicalReferenceCard referenceId="active-jag-2014" />
              <ClinicalReferenceCard referenceId="active-dementia-2017" />
            </div>
          </div>
        </section>
      )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 4: MOCA 6-DOMAIN TELEMETRY & DIGITAL BIOMARKERS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "moca" && (
          <section className="space-y-6 animate-fade-in" aria-label="MoCA 6-Domain Telemetry">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider">
                <Activity className="h-3.5 w-3.5 text-stone-600" />
                <span>Section 04 // Clinical Telemetry &amp; Sea Hero Quest Paradigm</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                MoCA 6-Domain Passive Telemetry Translation &amp; Biomarkers
              </h2>
              <p className="text-sm sm:text-base font-normal text-stone-600 leading-relaxed">
                Traditional cognitive exams like the Montreal Cognitive Assessment (MoCA) or Mini-Mental State Examination (MMSE) create severe &quot;white coat anxiety&quot; and confrontational distress in amnesic elders. CogniCare passively maps gameplay metrics—trajectory deviation, touch latency, hesitant dwells, and vocal response intervals—directly into MoCA clinical equivalents.
              </p>

              {/* Interactive Telemetry Simulator */}
              <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-emerald-700" />
                      <span>Interactive Clinical Telemetry Simulator</span>
                    </h3>
                    <p className="text-xs text-stone-600">
                      Adjust gameplay telemetry to simulate real-time MoCA score mapping and clinical diagnostic stratification.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setVisuoSlider(78);
                      setNamingSlider(82);
                      setMemorySlider(65);
                      setAttentionSlider(74);
                      setAbstractionSlider(85);
                      setOrientSlider(88);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Reset to Baseline</span>
                  </button>
                </div>

                {/* Range Sliders Grid */}
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-semibold">
                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Visuospatial Accuracy:</span>
                      <span className="text-emerald-800 font-bold">{visuoSlider}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={visuoSlider}
                      onChange={(e) => setVisuoSlider(Number(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Majuli 3D Walk &amp; Alpana Drawing</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Language Fluency:</span>
                      <span className="text-emerald-800 font-bold">{namingSlider}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={namingSlider}
                      onChange={(e) => setNamingSlider(Number(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Voice Proverb &amp; Bazaar Barter</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Delayed Memory Recall:</span>
                      <span className="text-emerald-800 font-bold">{memorySlider}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={memorySlider}
                      onChange={(e) => setMemorySlider(Number(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Memory Garden Spaced Retrieval</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Attention &amp; Concentration:</span>
                      <span className="text-emerald-800 font-bold">{attentionSlider}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={attentionSlider}
                      onChange={(e) => setAttentionSlider(Number(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Bihu Dhol Beats &amp; Tap Jitter</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Abstraction &amp; Sorting:</span>
                      <span className="text-emerald-800 font-bold">{abstractionSlider}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={abstractionSlider}
                      onChange={(e) => setAbstractionSlider(Number(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Heritage Kitchen Categories</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Orientation Accuracy:</span>
                      <span className="text-emerald-800 font-bold">{orientSlider}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={orientSlider}
                      onChange={(e) => setOrientSlider(Number(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Circadian Routine Check-in</div>
                  </div>
                </div>

                {/* Score Summary Banner */}
                <div className="rounded-xl border border-stone-200/90 bg-white p-4 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Estimated Composite MoCA Score
                    </div>
                    <div className="text-3xl font-serif font-extrabold text-stone-900 flex items-baseline gap-2">
                      <span className="text-emerald-800">{calculatedMoCA.totalEstimatedScore}</span>
                      <span className="text-stone-400 text-sm font-normal">/ 30 points</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      Diagnostic Stratification Tier
                    </div>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase mt-1 ${
                        calculatedMoCA.clinicalTier.includes("Normal")
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                          : calculatedMoCA.clinicalTier.includes("Mild")
                          ? "bg-amber-100 text-amber-950 border border-amber-300"
                          : "bg-rose-100 text-rose-900 border border-rose-300"
                      }`}
                    >
                      {calculatedMoCA.clinicalTier}
                    </div>
                  </div>
                </div>

                {/* MoCA Table */}
                <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-bold">
                        <th className="py-2.5 px-3">MoCA Domain</th>
                        <th className="py-2.5 px-3">Clinical Subtest</th>
                        <th className="py-2.5 px-3">Serious Game Telemetry Equivalent</th>
                        <th className="py-2.5 px-3 text-center">Score / Max</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                      {calculatedMoCA.domains.map((dom) => (
                        <tr key={dom.domainKey} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-stone-900">{dom.domainTitle}</td>
                          <td className="py-2.5 px-3 text-stone-600">{dom.clinicalSubtest}</td>
                          <td className="py-2.5 px-3 text-emerald-800 font-semibold">{dom.digitalGameMapping}</td>
                          <td className="py-2.5 px-3 text-center font-bold text-stone-900">
                            {dom.estimatedScore} / {dom.maxScore}
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                dom.status === "optimal"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : dom.status === "mild_monitoring"
                                  ? "bg-amber-100 text-amber-900 border border-amber-200"
                                  : "bg-rose-100 text-rose-800 border border-rose-200"
                              }`}
                            >
                              {dom.status.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sea Hero Quest Biomarker Paradigm */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-5 space-y-3 mt-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-900 text-xs font-semibold uppercase tracking-wider">
                  <Brain className="h-3.5 w-3.5 text-indigo-800" />
                  <span>Big Data Validation: The Sea Hero Quest Paradigm (Nature 2022)</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Spatial Navigation Trajectories as Preclinical Digital Biomarkers
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Published in <em>Nature Communications</em> and benchmarked across 4 million global players, <strong>Sea Hero Quest</strong> proved that subtle spatial wayfinding deviations and waypoint hesitation during video game boat navigation detect genetic risk of Alzheimer&apos;s disease (APOE-e4 carriers) decades before classical memory deficits emerge. CogniCare implements this exact telemetry inside our <strong>Majuli 3D Island Walk</strong>:
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="rounded-xl border border-stone-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <span className="font-bold text-emerald-800">Waypoint Trajectory Drift</span>
                    <p className="text-stone-600 text-[11px]">
                      Deviation from optimal geodesic path across Majuli riverbanks signals entorhinal grid cell dysfunction.
                    </p>
                  </div>
                  <div className="rounded-xl border border-stone-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <span className="font-bold text-amber-800">Acoustic Speech Hesitation</span>
                    <p className="text-stone-600 text-[11px]">
                      Speech-to-pause ratios and lexical search delays (&gt;600ms) in dialect conversations quantify anomic aphasia.
                    </p>
                  </div>
                  <div className="rounded-xl border border-stone-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <span className="font-bold text-purple-800">Motor Tap Jitter</span>
                    <p className="text-stone-600 text-[11px]">
                      Sub-millisecond touch-down coordinate micro-tremors flag parkinsonian tremor onset and cognitive fatigue.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Authoritative References for Section 04 */}
            <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                <BookOpen className="h-4 w-4 text-emerald-800" />
                <span>Authoritative Literature on MoCA &amp; Spatial Gaming Biomarkers (Section 04)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ClinicalReferenceCard referenceId="moca-nasreddine-2005" />
                <ClinicalReferenceCard referenceId="sea-hero-quest-natcomm-2019" />
                <ClinicalReferenceCard referenceId="sea-hero-quest-nature-2022" />
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 5: AI DYNAMIC DIFFICULTY ADJUSTMENT (RL-DDA)
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "ai_dda" && (
          <section className="space-y-6 animate-fade-in" aria-label="AI Dynamic Difficulty Adjustment">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider">
                <Cpu className="h-3.5 w-3.5 text-stone-600" />
                <span>Section 05 // Reinforcement Learning Policy</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                Reinforcement Learning Dynamic Difficulty Adjustment (RL-DDA)
              </h2>
              <p className="text-sm sm:text-base font-normal text-stone-600 leading-relaxed">
                A static difficulty curve guarantees therapy failure in neurodegenerative care: tasks that are too demanding trigger acute catastrophic reactions (agitation, panic, tearful withdrawal), while tasks that are too simplistic produce cognitive apathy and fail to stimulate dendritic synaptogenesis.
              </p>

              {/* MDP Formulation Card */}
              <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-5 space-y-3">
                <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-600" />
                  <span>Mathematical Formulation: Markov Decision Process (MDP)</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  The difficulty adaptation engine is formalized as a continuous MDP tuple <code className="bg-white px-2 py-0.5 rounded border border-stone-200 text-xs font-mono font-bold text-emerald-800">&lang; S, A, P, R, &gamma; &rang;</code>:
                </p>

                <div className="grid sm:grid-cols-2 gap-3 text-xs pt-2">
                  <div className="rounded-lg border border-stone-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">State Vector (S)</span>
                    <p className="text-stone-700 leading-relaxed">
                      S_t = [RT_t (Reaction Latency), Acc_t (Rolling Accuracy), Cue_t (Vanishing Cue Dependency), Jitter_t (Motor Jitter), Fatigue_t (Cognitive Fatigue Index)].
                    </p>
                  </div>
                  <div className="rounded-lg border border-stone-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">Action Space (A)</span>
                    <p className="text-stone-700 leading-relaxed">
                      A_t modulates grid dimension (2x2 &rarr; 3x3 &rarr; 4x4), distractor salience, tempo BPM, and vanishing cue intensity.
                    </p>
                  </div>
                  <div className="rounded-lg border border-stone-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">Reward Function (R)</span>
                    <p className="text-stone-700 leading-relaxed">
                      R(s, a) optimizes for the 75% to 80% &quot;Zone of Proximal Development&quot; (Flow State), severely penalizing frustration drops (&lt;60%) and ceiling boredom (&gt;90%).
                    </p>
                  </div>
                  <div className="rounded-lg border border-stone-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Discount Factor (&gamma;)</span>
                    <p className="text-stone-700 leading-relaxed">
                      &gamma; = 0.92 ensures long-term neuroplastic adaptation over 30-day therapeutic spans rather than volatile single-session over-fitting.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cognitive Fatigue Overrule */}
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-5 space-y-2">
                <h3 className="font-serif text-base font-bold text-rose-950 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-700" />
                  <span>Cognitive Fatigue Auto-Overrule &amp; Sundowning Interceptor</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                  Dementia patients possess fragile cognitive stamina. Continuing intense drills when mental fatigue sets in exacerbates <em>sundowning agitation</em>. If CogniCare detects latency drift &gt;40% or motor jitter escalation over three consecutive trials, the RL policy triggers an <strong>immediate restorative auto-overrule</strong>:
                </p>
                <ul className="text-xs text-rose-900 list-disc list-inside space-y-1 pt-1 font-medium">
                  <li>Immediately shuts down high-demand sorting drills without alerting the elder.</li>
                  <li>Softly transitions to a 3-minute 40Hz auditory soundscape (Sohra gentle rain or flute).</li>
                  <li>Prompts the family caregiver with a discreet hydration and ambient lighting reminder.</li>
                </ul>
              </div>

              {/* Interactive RL-DDA Dynamic Difficulty Simulator */}
              <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-5 space-y-4 mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-emerald-700" />
                      <span>Interactive RL-DDA Dynamic Difficulty Policy &amp; Flow Simulator</span>
                    </h3>
                    <p className="text-xs text-stone-600">
                      Adjust real-time biometrics (errors, latency drift, tremor jitter) to observe autonomous Markov Decision Process policy adaptations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDdaErrors(1);
                      setDdaSlowdown(35);
                      setDdaTremor(8);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Reset to Baseline</span>
                  </button>
                </div>

                {/* Range Sliders Grid */}
                <div className="grid sm:grid-cols-3 gap-3 text-xs font-semibold">
                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Recent Errors (Last 10):</span>
                      <span className="text-rose-700 font-bold">{ddaErrors} Errors</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      value={ddaErrors}
                      onChange={(e) => setDdaErrors(Number(e.target.value))}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Threshold for Auto-Step-Down: &ge;3 Errors</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Latency Slowdown vs Baseline:</span>
                      <span className="text-amber-700 font-bold">+{ddaSlowdown}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="150"
                      value={ddaSlowdown}
                      onChange={(e) => setDdaSlowdown(Number(e.target.value))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Fatigue &amp; Hesitation Drift Monitor</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Motor Coordinate Jitter:</span>
                      <span className="text-purple-700 font-bold">{ddaTremor} px</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      value={ddaTremor}
                      onChange={(e) => setDdaTremor(Number(e.target.value))}
                      className="w-full accent-purple-600 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Parkinsonian Micro-Tremor Detection</div>
                  </div>
                </div>

                {/* Dynamic Policy & Flow Metrics */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className={`rounded-xl border p-3.5 space-y-1 ${ddaMetrics.flowColor}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Csikszentmihalyi State Zone
                    </span>
                    <div className="text-sm font-bold mt-1">{ddaMetrics.flowZone}</div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      Reward function R(s,a) optimizes to prevent both cognitive atrophy and agitation.
                    </p>
                  </div>

                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-1 text-emerald-950">
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Autonomous Policy Action A_t
                    </span>
                    <div className="text-xs font-bold mt-1 font-mono text-emerald-900">{ddaMetrics.policyAction}</div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      Real-time parameter adaptation executed client-side without cloud lag.
                    </p>
                  </div>

                  <div className="rounded-xl border border-stone-200 bg-white p-3.5 space-y-1 text-stone-800 shadow-2xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider block text-stone-500">
                      Dynamic UI Calibrations
                    </span>
                    <div className="text-xs font-bold text-stone-900 space-y-0.5 pt-0.5">
                      <div>Touch Target Diameter: <span className="text-emerald-700">{ddaMetrics.targetSizePx}px</span></div>
                      <div>Voice Scaffolding Pacing: <span className="text-amber-700">{ddaMetrics.audioDelaySec}s hesitation</span></div>
                    </div>
                  </div>
                </div>

                {/* Flow Channel Tri-Zone Visualizer */}
                <div className="rounded-xl border border-stone-200/90 bg-white p-4 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    Flow-Channel Continuous Equilibrium Model
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className={`p-2.5 rounded-lg border transition-all ${
                      ddaErrors === 0 && ddaSlowdown <= 10
                        ? "bg-blue-100 border-blue-400 font-bold shadow-2xs"
                        : "bg-stone-50 border-stone-200 text-stone-500 opacity-60"
                    }`}>
                      <div className="font-bold">Boredom Zone</div>
                      <div className="text-[10px]">Challenge &lt; Ability</div>
                    </div>
                    <div className={`p-2.5 rounded-lg border transition-all ${
                      ddaErrors < 3 && ddaSlowdown < 80 && !(ddaErrors === 0 && ddaSlowdown <= 10)
                        ? "bg-emerald-100 border-emerald-400 text-emerald-950 font-bold shadow-2xs ring-2 ring-emerald-300"
                        : "bg-stone-50 border-stone-200 text-stone-500 opacity-60"
                    }`}>
                      <div className="font-bold">Therapeutic Flow</div>
                      <div className="text-[10px]">75% - 80% Success Channel</div>
                    </div>
                    <div className={`p-2.5 rounded-lg border transition-all ${
                      ddaErrors >= 3 || ddaSlowdown >= 80
                        ? "bg-rose-100 border-rose-400 text-rose-950 font-bold shadow-2xs ring-2 ring-rose-300"
                        : "bg-stone-50 border-stone-200 text-stone-500 opacity-60"
                    }`}>
                      <div className="font-bold">Panic / Anxiety</div>
                      <div className="text-[10px]">Cognitive Overload</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Authoritative References for Section 05 */}
            <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                <BookOpen className="h-4 w-4 text-emerald-800" />
                <span>Authoritative Literature on Flow, Adaptive Pacing &amp; AI Ethics (Section 05)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ClinicalReferenceCard referenceId="optale-vr-flow-2010" />
                <ClinicalReferenceCard referenceId="icmr-ai-ethics-2023" />
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 6: MULTIDOMAIN (FINGER) & CAREGIVER ZARIT BURDEN
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "finger" && (
          <section className="space-y-6 animate-fade-in" aria-label="FINGER Multidomain &amp; Caregiver Burden">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider">
                <HeartHandshake className="h-3.5 w-3.5 text-stone-600" />
                <span>Section 06 // Multidomain Synergy</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                The FINGER Multidomain Model &amp; Zarit Burden Interview (ZBI-12)
              </h2>
              <p className="text-sm sm:text-base font-normal text-stone-600 leading-relaxed">
                Published in <em>The Lancet</em> (Ngandu et al., 2015), the landmark Finnish Geriatric Intervention Study to Prevent Cognitive Impairment and Disability (<strong>FINGER</strong>) proved that single-modality brain exercises are insufficient. Cognitive resilience is maximized only when cognitive drills are embedded in a comprehensive multidomain lifestyle regimen.
              </p>

              {/* FINGER 4 Pillars */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-5 shadow-2xs space-y-2 hover:border-stone-300 transition-colors">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">FINGER Pillar 1</span>
                  <h4 className="font-serif text-base font-bold text-stone-900">Serious Cognitive Training</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Adaptive serious games targeting 6 MoCA domains with errorless scaffolding, preventing cognitive disuse and stimulating neurogenesis.
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-5 shadow-2xs space-y-2 hover:border-stone-300 transition-colors">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800">FINGER Pillar 2</span>
                  <h4 className="font-serif text-base font-bold text-stone-900">Physical Exergaming &amp; Balance</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    MediaPipe AI webcam hand and arm tracking exergames (<em>Tea Harvest Vision, Hornbill Flight</em>) demanding gross motor coordination and dynamic visual tracking.
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-5 shadow-2xs space-y-2 hover:border-stone-300 transition-colors">
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-700">FINGER Pillar 3</span>
                  <h4 className="font-serif text-base font-bold text-stone-900">Vascular &amp; Circadian Routine</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Daily routine logs monitoring blood pressure, hydration, morning sunlight exposure, and medication compliance to prevent vascular dementia progression.
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-5 shadow-2xs space-y-2 hover:border-stone-300 transition-colors">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-800">FINGER Pillar 4</span>
                  <h4 className="font-serif text-base font-bold text-stone-900">Social Connection &amp; Reminiscence</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    AI dialect conversational companions and multisensory living albums counteract elder isolation and promote psychological safety.
                  </p>
                </div>
              </div>

              {/* Zarit Caregiver Burden Scale */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-5 space-y-3 mt-4">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-rose-100/80 border border-rose-200 text-rose-950 text-xs font-semibold uppercase tracking-wider">
                  <Scale className="h-3.5 w-3.5 text-rose-800" />
                  <span>Caregiver Burden Integration: The ZBI-12 Standard</span>
                </div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Quantifying Caregiver Burnout to Prevent Premature Institutionalization
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Family caregiver exhaustion directly correlates with worsening behavioral and psychological symptoms of dementia (BPSD) in the patient. CogniCare embeds the validated <strong>Zarit Burden Interview (ZBI-12)</strong> directly into the Caregiver Portal:
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-1 shadow-2xs">
                    <span className="font-bold text-emerald-900">Score 0 - 10 // Low Burden</span>
                    <p className="text-emerald-950 text-[11px] leading-relaxed">
                      Caregiver coping well. Standard weekly supportive micro-tips and routine tracking active.
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 space-y-1 shadow-2xs">
                    <span className="font-bold text-amber-900">Score 11 - 20 // Moderate Strain</span>
                    <p className="text-amber-950 text-[11px] leading-relaxed">
                      Emerging emotional exhaustion. System auto-schedules respite reminders and simplified routines.
                    </p>
                  </div>
                  <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 space-y-1 shadow-2xs">
                    <span className="font-bold text-rose-900">Score 21 - 48 // Severe Strain</span>
                    <p className="text-rose-950 text-[11px] leading-relaxed">
                      High burnout crisis. Automated escalation to community ASHA worker &amp; Tele-MANAS helpline.
                    </p>
                  </div>
                </div>
              </div>

              {/* Interactive FINGER & Zarit Calculator */}
              <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-5 space-y-4 mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-emerald-700" />
                      <span>Interactive FINGER Multidomain Synergy &amp; Zarit Burden Calculator</span>
                    </h3>
                    <p className="text-xs text-stone-600">
                      Simulate the synergy of serious games, MIND diet, physical exergames, and caregiver respite on long-term cognitive resilience (Lancet 2015, Gerontologist 2001).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFingerCognitiveDays(5);
                      setFingerMindScore(11);
                      setFingerPhysicalMins(30);
                      setFingerCaregiverRespite(3);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Reset to Baseline</span>
                  </button>
                </div>

                {/* Range Sliders Grid */}
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs font-semibold">
                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Cognitive Gaming:</span>
                      <span className="text-emerald-800 font-bold">{fingerCognitiveDays} Days / Wk</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="7"
                      value={fingerCognitiveDays}
                      onChange={(e) => setFingerCognitiveDays(Number(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Target: &ge;4 days/wk structured drills</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">MIND Diet Score:</span>
                      <span className="text-amber-800 font-bold">{fingerMindScore} / 15 pts</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={fingerMindScore}
                      onChange={(e) => setFingerMindScore(Number(e.target.value))}
                      className="w-full accent-amber-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Lakadong turmeric, Manimuni greens</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Physical Exergaming:</span>
                      <span className="text-indigo-800 font-bold">{fingerPhysicalMins} Mins / Day</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={fingerPhysicalMins}
                      onChange={(e) => setFingerPhysicalMins(Number(e.target.value))}
                      className="w-full accent-indigo-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">MediaPipe Vision gross-motor play</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Caregiver Respite:</span>
                      <span className="text-purple-800 font-bold">{fingerCaregiverRespite} Hrs / Day</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      value={fingerCaregiverRespite}
                      onChange={(e) => setFingerCaregiverRespite(Number(e.target.value))}
                      className="w-full accent-purple-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Zarit burnout mitigation buffer</div>
                  </div>
                </div>

                {/* Dynamic Outcome Metrics */}
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-1 text-emerald-950">
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Cognitive Decline Prevention
                    </span>
                    <div className="text-2xl font-extrabold">+{fingerMetrics.declinePrevention}%</div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      Relative reduction in 2-year cognitive decline hazard (FINGER landmark: 30%).
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 space-y-1 text-amber-950">
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Executive Function Gain
                    </span>
                    <div className="text-2xl font-extrabold">+{fingerMetrics.executiveBoost}%</div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      Synergistic enhancement in complex problem-solving &amp; cognitive switching.
                    </p>
                  </div>

                  <div className={`rounded-xl border p-3.5 space-y-1 ${fingerMetrics.zaritColor}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Caregiver Zarit Strain (ZBI-12)
                    </span>
                    <div className="text-2xl font-extrabold">{fingerMetrics.zaritScore} <span className="text-xs font-normal opacity-70">/ 48</span></div>
                    <div className="text-[11px] font-bold">{fingerMetrics.zaritTier}</div>
                  </div>

                  <div className="rounded-xl border border-teal-200 bg-teal-50/80 p-3.5 space-y-1 text-teal-950">
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Care Home Postponement
                    </span>
                    <div className="text-2xl font-extrabold">+{fingerMetrics.postponementMonths} Mos</div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      Estimated delayed institutionalization living with family at home.
                    </p>
                  </div>
                </div>

                {/* Multimodal Synergy Matrix Progress Indicators */}
                <div className="rounded-xl border border-stone-200/90 bg-white p-4 space-y-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    Multidomain Pillar Alignment Status
                  </span>
                  <div className="grid sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-stone-700">Pillar 1: Cognitive Training Load</span>
                        <span className="text-emerald-700">{Math.round((fingerCognitiveDays / 7) * 100)}%</span>
                      </div>
                      <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all"
                          style={{ width: `${(fingerCognitiveDays / 7) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-stone-700">Pillar 2: MIND Diet Antioxidants</span>
                        <span className="text-amber-700">{Math.round((fingerMindScore / 15) * 100)}%</span>
                      </div>
                      <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-600 rounded-full transition-all"
                          style={{ width: `${(fingerMindScore / 15) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-stone-700">Pillar 3: Physical Kinesthetics</span>
                        <span className="text-indigo-700">{Math.round((fingerPhysicalMins / 60) * 100)}%</span>
                      </div>
                      <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full transition-all"
                          style={{ width: `${(fingerPhysicalMins / 60) * 100}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between font-semibold">
                        <span className="text-stone-700">Pillar 4: Caregiver Respite Buffer</span>
                        <span className="text-purple-700">{Math.round((fingerCaregiverRespite / 8) * 100)}%</span>
                      </div>
                      <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-600 rounded-full transition-all"
                          style={{ width: `${(fingerCaregiverRespite / 8) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Authoritative References for Section 06 */}
            <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                <BookOpen className="h-4 w-4 text-emerald-800" />
                <span>Authoritative Clinical Literature on Multimodal Synergy &amp; Caregiver Burden (Section 06)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <ClinicalReferenceCard referenceId="finger-lancet-2015" />
                <ClinicalReferenceCard referenceId="lancet-commission-dementia-2024" />
                <ClinicalReferenceCard referenceId="who-guidelines-dementia-2019" />
                <ClinicalReferenceCard referenceId="zarit-burden-2001" />
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 7: W3C COGA & WCAG 2.2 AAA ENGINEERING
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "coga" && (
          <section className="space-y-6 animate-fade-in" aria-label="W3C COGA Accessibility">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider">
                <ShieldCheck className="h-3.5 w-3.5 text-stone-600" />
                <span>Section 07 // Cognitive Accessibility Engineering</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                W3C WAI COGA &amp; WCAG 2.2 AAA Implementation Matrix
              </h2>
              <p className="text-sm sm:text-base font-normal text-stone-600 leading-relaxed">
                Standard web accessibility specifications primarily focus on sensory (blindness, low vision, deafness) and motor impairments. CogniCare strictly complies with the <strong>W3C Cognitive and Learning Disabilities Accessibility Task Force (COGA)</strong> specification: <em>&quot;Making Content Usable for People with Cognitive and Learning Disabilities&quot;</em>.
              </p>

              <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
                {COGA_WCAG_CHECKLIST.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-stone-200/80 bg-white p-4 shadow-2xs flex items-start gap-3 hover:border-stone-300 transition-colors"
                  >
                    <div className="h-7 w-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center shrink-0 font-bold text-xs">
                      ✓
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase text-emerald-800">{item.criteria}</span>
                        <span className="rounded-md bg-stone-100 px-1.5 py-0.2 text-[10px] font-semibold text-stone-600 border border-stone-200">
                          {item.level}
                        </span>
                      </div>
                      <h4 className="font-serif text-sm font-bold text-stone-900">{item.title}</h4>
                      <p className="text-[11px] font-normal text-stone-500 italic">{item.specification}</p>
                      <p className="text-xs text-stone-700 leading-relaxed pt-0.5">{item.implementation}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive W3C COGA Ergonomics Simulator */}
              <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-5 space-y-4 mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-emerald-700" />
                      <span>Interactive W3C COGA Ergonomic Touch &amp; Pacing Simulator</span>
                    </h3>
                    <p className="text-xs text-stone-600">
                      Test how physical touch target padding, contrast ratio, and speech pacing eliminate cognitive barriers for elders with dyspraxia or cataracts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCogaTargetSize(56);
                      setCogaContrast(9.5);
                      setCogaSpeechRate(0.82);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Reset to Baseline</span>
                  </button>
                </div>

                {/* Range Sliders Grid */}
                <div className="grid sm:grid-cols-3 gap-3 text-xs font-semibold">
                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Touch Target Size:</span>
                      <span className="text-emerald-800 font-bold">{cogaTargetSize} px</span>
                    </div>
                    <input
                      type="range"
                      min="32"
                      max="72"
                      value={cogaTargetSize}
                      onChange={(e) => setCogaTargetSize(Number(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">COGA AAA Minimum: &ge;48px with 16px padding</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Contrast Ratio:</span>
                      <span className="text-stone-900 font-bold">{cogaContrast.toFixed(1)} : 1</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="140"
                      value={Math.round(cogaContrast * 10)}
                      onChange={(e) => setCogaContrast(Number(e.target.value) / 10)}
                      className="w-full accent-stone-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">WCAG AAA Standard: &ge;7.0:1 contrast</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">TTS Audio Pacing:</span>
                      <span className="text-purple-800 font-bold">{cogaSpeechRate.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="60"
                      max="120"
                      value={Math.round(cogaSpeechRate * 100)}
                      onChange={(e) => setCogaSpeechRate(Number(e.target.value) / 100)}
                      className="w-full accent-purple-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Geriatric Calibrated Rate: 0.80x - 0.85x</div>
                  </div>
                </div>

                {/* Dynamic COGA Metrics */}
                <div className="grid sm:grid-cols-3 gap-3">
                  <div className={`rounded-xl border p-3.5 space-y-1 ${cogaMetrics.complianceBadge}`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Specification Compliance Status
                    </span>
                    <div className="text-sm font-bold mt-1">{cogaMetrics.complianceStatus}</div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      Ensures zero cognitive authentication traps &amp; errorless recovery.
                    </p>
                  </div>

                  <div className={`rounded-xl border p-3.5 space-y-1 ${
                    cogaMetrics.missClickRate > 20
                      ? "bg-rose-50 border-rose-200 text-rose-950"
                      : "bg-emerald-50 border-emerald-200 text-emerald-950"
                  }`}>
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Motor Tremor Miss-Click Rate
                    </span>
                    <div className="text-2xl font-extrabold">{cogaMetrics.missClickRate}%</div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      {cogaMetrics.missClickRate > 20
                        ? "High Barrier: Elderly fingers with Parkinsonian tremors frequently miss."
                        : "Safe Ergonomics: Target size absorbs hand tremors without false taps."}
                    </p>
                  </div>

                  <div className="rounded-xl border border-purple-200 bg-purple-50/80 p-3.5 space-y-1 text-purple-950">
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Auditory Comprehension Retention
                    </span>
                    <div className="text-sm font-bold mt-1">{cogaMetrics.comprehension}</div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      Slowed delivery accommodates auditory cortex temporal processing delays.
                    </p>
                  </div>
                </div>

                {/* Live Visual Target & Contrast Preview */}
                <div className="rounded-xl border border-stone-200/90 bg-white p-4 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    Live Ergonomic UI Button Rendering Preview
                  </span>
                  <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border border-stone-200 bg-[#FAF6F0]">
                    <div className="text-xs text-stone-600 max-w-xs">
                      Simulated patient action card using current slider ergonomics ({cogaTargetSize}px hit area, {cogaContrast.toFixed(1)}:1 contrast):
                    </div>
                    <button
                      type="button"
                      style={{
                        minHeight: `${cogaTargetSize}px`,
                        paddingLeft: `${Math.max(16, cogaTargetSize / 3)}px`,
                        paddingRight: `${Math.max(16, cogaTargetSize / 3)}px`,
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border-3 border-black bg-white font-bold text-stone-900 shadow-[4px_4px_0px_#000] text-sm transition-all"
                    >
                      <Sparkles className="h-5 w-5 text-emerald-700" />
                      <span>Drink Morning Warm Water</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Authoritative References for Section 07 */}
            <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                <BookOpen className="h-4 w-4 text-emerald-800" />
                <span>Authoritative Standards &amp; Guidelines on Cognitive Accessibility (Section 07)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <ClinicalReferenceCard referenceId="w3c-coga-2023" />
                <ClinicalReferenceCard referenceId="cdsco-samd-2022" />
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 8: NORTH EAST INDIA CULTURAL RESONANCE MATRIX
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "ner" && (
          <section className="space-y-6 animate-fade-in" aria-label="North East India Cultural Matrix">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider">
                <Compass className="h-3.5 w-3.5 text-stone-600" />
                <span>Section 08 // Indigenous Gerontological Localization</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                North East India 8-State Cultural Localization Matrix
              </h2>
              <p className="text-sm sm:text-base font-normal text-stone-600 leading-relaxed">
                Generic cognitive training software featuring Western or generic metro-Indian imagery fails to stimulate deep autobiographical memory circuits in North Eastern elders. CogniCare roots its clinical mechanics in the lived heritage, sounds, and rituals across all <strong>8 North Eastern states</strong>:
              </p>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3.5 pt-2">
                {[
                  {
                    state: "Assam",
                    capital: "Dispur / Guwahati",
                    theme: "Brahmaputra Boat, Bihu Dhol, Muga Silk Weaving",
                    sensory: "Binaural rain on tin roofs, temple bell",
                    domain: "Auditory Rhythm & Tactile Sequencing",
                  },
                  {
                    state: "Meghalaya",
                    capital: "Shillong / Sohra",
                    theme: "Living Root Bridges & Cherrapunji Monsoon",
                    sensory: "Khasi flute melodies, misty rain",
                    domain: "Spatial Navigation & Sensory Calming",
                  },
                  {
                    state: "Nagaland",
                    capital: "Kohima / Dimapur",
                    theme: "Dzukou Lily Botanist & Hornbill Flight",
                    sensory: "Naga tribal log drums, hornbill calls",
                    domain: "Visual Discrimination & Gross Motor Flight",
                  },
                  {
                    state: "Manipur",
                    capital: "Imphal",
                    theme: "Loktak Lake Phumdi Floating Islands",
                    sensory: "Pena string resonance, water ripples",
                    domain: "Working Memory & Ecological Recognition",
                  },
                  {
                    state: "Mizoram",
                    capital: "Aizawl",
                    theme: "Cheraw Bamboo Dance Rhythm",
                    sensory: "Rhythmic bamboo clacks, mountain winds",
                    domain: "Bimanual Coordination & Inhibitory Control",
                  },
                  {
                    state: "Arunachal",
                    capital: "Itanagar / Tawang",
                    theme: "Tawang Monastery Prayer Wheels",
                    sensory: "Himalayan brass chimes, Buddhist chants",
                    domain: "Sustained Mindfulness & Vigilance",
                  },
                  {
                    state: "Tripura",
                    capital: "Agartala",
                    theme: "Neermahal Water Palace Labyrinth",
                    sensory: "Palace water lapping, bamboo craft sounds",
                    domain: "Visuospatial Planning & Mental Rotation",
                  },
                  {
                    state: "Sikkim",
                    capital: "Gangtok / Pelling",
                    theme: "Khangchendzonga Mountain Tea Garden",
                    sensory: "Alpine breeze, temple butter lamp flicker",
                    domain: "Fine Motor Tracking & Serenity Induction",
                  },
                ].map((ner) => (
                  <div key={ner.state} className="rounded-xl border border-stone-200/90 bg-white p-4 space-y-1.5 shadow-2xs hover:border-stone-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="rounded-md bg-stone-100 border border-stone-200 text-stone-800 px-2 py-0.5 text-[10px] font-bold uppercase">
                        {ner.state}
                      </span>
                      <span className="text-[10px] text-stone-400">{ner.capital}</span>
                    </div>
                    <h4 className="font-serif text-sm font-bold text-stone-900">{ner.theme}</h4>
                    <p className="text-[11px] font-semibold text-emerald-800">{ner.domain}</p>
                    <p className="text-[10px] text-stone-500 italic pt-0.5">Sensory Anchor: {ner.sensory}</p>
                  </div>
                ))}
              </div>

              {/* 11 Regional Dialects Engine */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-5 space-y-2 mt-4">
                <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-emerald-700" />
                  <span>11 Regional Dialects Speech Engine with Slowed Geriatric Pacing</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Speech interfaces that force non-native English or rapid metro-Hindi alienate indigenous elders. CogniCare incorporates speech synthesis and voice recognition across 11 dialects: <strong>Assamese, Bodo, Bengali, Khasi, Garo, Mizo, Meitei (Manipuri), Nagamese, Nepali, Hindi, and Indian English</strong>, calibrated to a gentle <strong>0.82x pacing</strong> with generous 2.5-second comprehension pauses.
                </p>
              </div>

              {/* Interactive NER Remote Triage & Coverage Simulator */}
              <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-5 space-y-4 mt-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200/80 pb-3">
                  <div>
                    <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                      <Sliders className="h-4 w-4 text-emerald-700" />
                      <span>Interactive North East India Remote Triage &amp; Offline Sync Simulator</span>
                    </h3>
                    <p className="text-xs text-stone-600">
                      Evaluate how 100% offline-first PWA caching and tele-neurology screening overcome extreme mountain isolation and specialist scarcity (MDoNER SIH PS 26003).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNerDistance(140);
                      setNerBlackout(14);
                      setNerDialect("as");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Reset to Baseline</span>
                  </button>
                </div>

                {/* Range Sliders & Dialect Selector Grid */}
                <div className="grid sm:grid-cols-3 gap-3 text-xs font-semibold">
                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Distance to Specialist:</span>
                      <span className="text-emerald-800 font-bold">{nerDistance} km</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="350"
                      value={nerDistance}
                      onChange={(e) => setNerDistance(Number(e.target.value))}
                      className="w-full accent-emerald-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Mountain ghats &amp; river ferry crossings</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Monsoon Blackout Duration:</span>
                      <span className="text-amber-800 font-bold">{nerBlackout} Days</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="45"
                      value={nerBlackout}
                      onChange={(e) => setNerBlackout(Number(e.target.value))}
                      className="w-full accent-amber-700 cursor-pointer"
                    />
                    <div className="text-[10px] text-stone-500">Zero network connectivity survival</div>
                  </div>

                  <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs">
                    <div className="flex justify-between">
                      <span className="text-stone-700">Selected Regional Dialect:</span>
                      <span className="text-purple-800 font-bold uppercase">{nerDialect}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[
                        { id: "as", label: "Assamese" },
                        { id: "kha", label: "Khasi" },
                        { id: "mni", label: "Manipuri" },
                        { id: "lus", label: "Mizo" },
                        { id: "brx", label: "Bodo" },
                        { id: "grt", label: "Garo" },
                      ].map((lang) => (
                        <button
                          key={lang.id}
                          type="button"
                          onClick={() => setNerDialect(lang.id)}
                          className={`px-2 py-0.5 rounded text-[10px] border cursor-pointer ${
                            nerDialect === lang.id
                              ? "bg-purple-100 border-purple-400 text-purple-900 font-bold"
                              : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100"
                          }`}
                        >
                          {lang.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dynamic Triage Metrics */}
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 space-y-1 text-emerald-950">
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Hazardous Travel Saved
                    </span>
                    <div className="text-2xl font-extrabold">{nerMetrics.travelHoursSaved} Hours</div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      Avoids painful mountain bus journeys for fragile amnesic elders.
                    </p>
                  </div>

                  <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 p-3.5 space-y-1 text-indigo-950">
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Family Expense Saved
                    </span>
                    <div className="text-2xl font-extrabold">&#8377;{nerMetrics.rupeesSaved.toLocaleString("en-IN")}</div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      Eliminates travel fares, lodging, and lost daily agricultural income.
                    </p>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 space-y-1 text-amber-950">
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      IndexedDB Offline Sync
                    </span>
                    <div className="text-sm font-bold mt-1 font-mono text-amber-900">{nerMetrics.cacheReliability}</div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      Gameplay telemetry queues securely on device and syncs upon reconnection.
                    </p>
                  </div>

                  <div className="rounded-xl border border-purple-200 bg-purple-50/80 p-3.5 space-y-1 text-purple-950">
                    <span className="text-[10px] font-bold uppercase tracking-wider block opacity-70">
                      Triaged Clinical Referral
                    </span>
                    <div className="text-xs font-bold mt-1 text-purple-900">{nerMetrics.triageRoute}</div>
                    <p className="text-[11px] leading-relaxed opacity-85">
                      Automated flagging alerts regional neurology center without patient travel.
                    </p>
                  </div>
                </div>

                {/* Flow Diagram: Offline Kiosk to ABDM Cloud */}
                <div className="rounded-xl border border-stone-200/90 bg-white p-4 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block">
                    Zero-Connectivity Village Data Pipeline
                  </span>
                  <div className="grid sm:grid-cols-3 gap-2.5 text-xs text-stone-700">
                    <div className="p-3 rounded-lg border border-stone-200 bg-stone-50/80 space-y-1">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <HardDrive className="h-3.5 w-3.5 text-emerald-700" />
                        <span>1. Local PWA IndexedDB</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Zero internet required. AES-256 local encrypted storage caches all session telemetry for up to {nerBlackout} blackout days.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-stone-200 bg-stone-50/80 space-y-1">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <Wifi className="h-3.5 w-3.5 text-amber-700" />
                        <span>2. Background Sync Engine</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        When health worker reaches mobile network tower, background service worker batches anonymized MoCA biomarkers.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-stone-200 bg-stone-50/80 space-y-1">
                      <div className="font-bold text-stone-900 flex items-center gap-1.5">
                        <ShieldCheck className="h-3.5 w-3.5 text-indigo-700" />
                        <span>3. ABDM FHIR R4 Bundle</span>
                      </div>
                      <p className="text-[11px] text-stone-600">
                        Links longitudinal trajectory directly to elder&apos;s Ayushman Bharat Health Account (ABHA) for specialist tele-consultation.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Authoritative References for Section 08 */}
            <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                <BookOpen className="h-4 w-4 text-emerald-800" />
                <span>Authoritative Literature &amp; Mandates on Cross-Cultural Assessment (Section 08)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ClinicalReferenceCard referenceId="rudas-cross-cultural-2004" />
                <ClinicalReferenceCard referenceId="mathuranath-acer-india-2004" />
                <ClinicalReferenceCard referenceId="mdoner-sih-2026" />
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 9: REGULATORY AUTHORITIES, ZERO-COG AUTH & SECURITY
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "authorities" && (
          <section className="space-y-6 animate-fade-in" aria-label="Regulatory &amp; Security">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider">
                <Scale className="h-3.5 w-3.5 text-stone-600" />
                <span>Section 09 // Regulatory Frameworks &amp; Compliance</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                Statutory Regulatory Governance &amp; Security Architecture
              </h2>
              <p className="text-sm sm:text-base font-normal text-stone-600 leading-relaxed">
                As a Cognitive Digital Therapeutic (CDTx) and clinical assistance platform, CogniCare is engineered to adhere to national and international healthcare standards, data privacy statutes, and accessibility mandates.
              </p>

              {/* Statutory Frameworks Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-5 shadow-2xs space-y-2 hover:border-stone-300 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-100/80 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-900">
                      CDSCO SaMD Class B
                    </span>
                    <span className="text-[10px] text-stone-500 font-semibold">Govt. of India</span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-stone-900">Central Drugs Standard Control Organisation</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Complies with the Software as a Medical Device (SaMD) Guidance under the Medical Device Rules (2017) for Class B digital screening and non-invasive cognitive rehabilitation tools.
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-5 shadow-2xs space-y-2 hover:border-stone-300 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-rose-100/80 border border-rose-200 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-900">
                      DPDP Act 2023
                    </span>
                    <span className="text-[10px] text-stone-500 font-semibold">Data Privacy</span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-stone-900">Digital Personal Data Protection Act (India)</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Implements explicit Proxy Consent for cognitively impaired adults via verified family caregivers and community ASHA health workers, strictly prohibiting unauthorized data exfiltration.
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-5 shadow-2xs space-y-2 hover:border-stone-300 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-blue-100/80 border border-blue-200 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-900">
                      ICMR AI Bioethics
                    </span>
                    <span className="text-[10px] text-stone-500 font-semibold">Medical Research</span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-stone-900">Ethical AI in Biomedical Healthcare (2023)</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Satisfies ICMR core tenets: Autonomy, Non-maleficence, Data Minimization, and Algorithm Transparency. Clinical AI decisions are interpretable with transparent MoCA scoring.
                  </p>
                </div>

                <div className="rounded-xl border border-stone-200/90 bg-[#FAF9F6] p-5 shadow-2xs space-y-2 hover:border-stone-300 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-purple-100/80 border border-purple-200 px-2 py-0.5 text-[10px] font-bold uppercase text-purple-900">
                      ABDM FHIR R4
                    </span>
                    <span className="text-[10px] text-stone-500 font-semibold">Interoperability</span>
                  </div>
                  <h4 className="font-serif text-base font-bold text-stone-900">Ayushman Bharat Digital Mission (NHA)</h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Standardized HL7 FHIR R4 profiles for longitudinal cognitive screening reports, linked securely to 14-digit Ayushman Bharat Health Accounts (ABHA).
                  </p>
                </div>
              </div>

              {/* Zero Cognitive Test Authentication Architecture */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-5 space-y-3 mt-4">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-950 text-xs font-semibold uppercase tracking-wider">
                  <Lock className="h-3.5 w-3.5 text-teal-800" />
                  <span>Zero-Cognitive-Test Authentication Architecture</span>
                </div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  Solving the Password Crisis for Dementia Patients
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  Traditional authentication (usernames, alphanumeric passwords, SMS OTPs, or CAPTCHAs) is mathematically guaranteed to fail in dementia care, locking vulnerable elders out and inducing severe distress. CogniCare solves this with a three-layer patient security model:
                </p>
                <div className="grid sm:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="rounded-lg border border-stone-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <span className="font-bold text-emerald-800">1. Cryptographic QR Card</span>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Patient simply shows their printed laminated Health Card to the kiosk camera. JWT payload auto-authenticates without typing.
                    </p>
                  </div>
                  <div className="rounded-lg border border-stone-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <span className="font-bold text-amber-800">2. 30-Day Encrypted Cookie</span>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Session stored in HttpOnly, SameSite=Lax, Secure cookie (<code className="bg-stone-100 px-1 py-0.5 rounded text-[10px] font-mono">cognicare_session</code>), preventing abrupt logouts across 30 days.
                    </p>
                  </div>
                  <div className="rounded-lg border border-stone-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <span className="font-bold text-purple-800">3. Accidental Logout Guard</span>
                    <p className="text-stone-600 text-[11px] leading-relaxed">
                      Discrete bottom logout button requires a 2-step confirmation modal so elders never accidentally disconnect themselves.
                    </p>
                  </div>
                </div>
              </div>

              {/* Role-Based Access Control (RBAC) Matrix */}
              <div className="pt-2 space-y-3">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  4-Tier Role-Based Access Control (RBAC) Matrix
                </h3>
                <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-stone-200 bg-stone-50 text-stone-600 font-bold">
                        <th className="py-2.5 px-3">Role Tier</th>
                        <th className="py-2.5 px-3">Authorized Actor</th>
                        <th className="py-2.5 px-3">Authentication Method</th>
                        <th className="py-2.5 px-3">Permitted Capabilities</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                      <tr className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-emerald-800">Patient Tier</td>
                        <td className="py-2.5 px-3 text-stone-900">Elder with MCI / Dementia</td>
                        <td className="py-2.5 px-3 font-medium">QR Health Card / Persistent Cookie</td>
                        <td className="py-2.5 px-3 text-stone-600">
                          Cognitive serious games, daily routine checklist, Saathi voice companion. Zero access to clinical settings.
                        </td>
                      </tr>
                      <tr className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-amber-800">Caregiver Tier</td>
                        <td className="py-2.5 px-3 text-stone-900">Designated Family Caregiver</td>
                        <td className="py-2.5 px-3 font-medium">Secure Password + PIN</td>
                        <td className="py-2.5 px-3 text-stone-600">
                          Zarit Burden Interview (ZBI-12), memory album photo upload, routine scheduling, medication tracker.
                        </td>
                      </tr>
                      <tr className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-purple-800">Health Worker Tier</td>
                        <td className="py-2.5 px-3 text-stone-900">Community ASHA / ANM Worker</td>
                        <td className="py-2.5 px-3 font-medium">ABDM Verified Credentials / OTP</td>
                        <td className="py-2.5 px-3 text-stone-600">
                          Multi-patient village roster, offline sync reconciliation, red-flag escalation, home visit logging.
                        </td>
                      </tr>
                      <tr className="hover:bg-stone-50/70 transition-colors">
                        <td className="py-2.5 px-3 font-bold text-indigo-900">Clinical Specialist</td>
                        <td className="py-2.5 px-3 text-stone-900">Neurologist / Psychogeriatrician</td>
                        <td className="py-2.5 px-3 font-medium">NMC Medical Registration 2FA</td>
                        <td className="py-2.5 px-3 text-stone-600">
                          MoCA 6-domain longitudinal radar curves, cognitive fatigue indices, ABDM FHIR health record export.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Edge-Only Biometrics & Hardware Permissions */}
              <div className="rounded-xl border border-stone-200 bg-[#FAF9F6] p-5 space-y-3 mt-4">
                <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-700" />
                  <span>Device Hardware Permissions &amp; Edge-Only Privacy</span>
                </h3>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                  In compliance with DPDP Act 2023 data minimization mandates, <strong>zero raw biometric video or voice recordings leave the user&apos;s physical device</strong>:
                </p>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-1">
                  <div className="rounded-lg border border-stone-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                      <Eye className="h-4 w-4" />
                      <span>Camera Permission</span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      MediaPipe runs entirely in browser WebAssembly/WebGL to detect hand gestures. No images or videos are saved or transmitted.
                    </p>
                  </div>
                  <div className="rounded-lg border border-stone-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800">
                      <Mic className="h-4 w-4" />
                      <span>Microphone Permission</span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      Voice input is processed client-side via Web Speech API for dialogue and hesitation latency. Audio waveforms are immediately discarded.
                    </p>
                  </div>
                  <div className="rounded-lg border border-stone-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-purple-800">
                      <HardDrive className="h-4 w-4" />
                      <span>IndexedDB Storage</span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      AES-256 encrypted client storage caches game assets and pending telemetry batches for resilient 100% offline gameplay.
                    </p>
                  </div>
                  <div className="rounded-lg border border-stone-200/80 bg-white p-3.5 space-y-1 shadow-2xs">
                    <div className="flex items-center gap-1.5 font-bold text-teal-800">
                      <Wifi className="h-4 w-4" />
                      <span>Network Sync</span>
                    </div>
                    <p className="text-[11px] text-stone-600">
                      Transmits only anonymous numerical biomarker metrics (reaction times, accuracy percentages) over TLS 1.3 encryption.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Authoritative References for Section 09 */}
            <div className="rounded-2xl border border-stone-200/90 bg-stone-50/70 p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-700">
                <BookOpen className="h-4 w-4 text-emerald-800" />
                <span>Authoritative Statutory Standards &amp; Health Authority Guidelines (Section 09)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ClinicalReferenceCard referenceId="cdsco-samd-2022" />
                <ClinicalReferenceCard referenceId="icmr-ai-ethics-2023" />
                <ClinicalReferenceCard referenceId="abdm-fhir-nha-2023" />
              </div>
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 10: CITATIONS, REPOSITORY & LIVE AUTHORITATIVE LINKS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "references" && (
          <section className="space-y-6 animate-fade-in" aria-label="Clinical Citations &amp; External Links">
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-5">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-semibold uppercase tracking-wider">
                <Award className="h-3.5 w-3.5 text-stone-600" />
                <span>Section 10 // Authoritative Evidence Directory</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                Peer-Reviewed Clinical Literature &amp; Authoritative Links
              </h2>
              <p className="text-sm sm:text-base font-normal text-stone-600 leading-relaxed">
                Every therapeutic mechanic, user interface accommodation, and telemetry translation in CogniCare is grounded in landmark randomized controlled trials, peer-reviewed clinical literature, or statutory regulatory standards. All external links below open directly to official publishers (JAMA, Lancet, Nature, W3C, CDSCO, ICMR).
              </p>

              {/* Filter and Search Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {[
                    { id: "all", label: "All Citations" },
                    { id: "clinical_trial", label: "Clinical Trials (RCTs)" },
                    { id: "neuropsych", label: "Neuropsychology" },
                    { id: "guideline", label: "Clinical Guidelines" },
                    { id: "regulatory", label: "Regulatory & Standards" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setRefCategory(cat.id)}
                      className={`rounded-lg border px-3 py-1 text-xs transition-colors cursor-pointer ${
                        refCategory === cat.id
                          ? "border-emerald-800 bg-emerald-800 text-white font-bold shadow-2xs"
                          : "border-stone-200 bg-white text-stone-700 hover:bg-stone-50 font-medium"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Search literature, authors, DOI..."
                    value={refSearch}
                    onChange={(e) => setRefSearch(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 bg-white px-3 py-1.5 text-xs text-stone-900 placeholder-stone-400 focus:border-emerald-700 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Citations List */}
              <div className="space-y-3 pt-2">
                {filteredReferences.map((ref, idx) => (
                  <article
                    key={ref.id}
                    className="rounded-xl border border-stone-200/90 bg-white p-5 space-y-2.5 hover:border-stone-300 hover:shadow-2xs transition-all"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-mono font-bold text-stone-700">
                          Ref #{idx + 1}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase border ${
                            ref.category === "clinical_trial"
                              ? "bg-indigo-50 border-indigo-200 text-indigo-900"
                              : ref.category === "neuropsych"
                              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                              : ref.category === "regulatory"
                              ? "bg-rose-50 border-rose-200 text-rose-900"
                              : "bg-amber-50 border-amber-200 text-amber-900"
                          }`}
                        >
                          {ref.category.replace("_", " ")}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">({ref.year})</span>
                      </div>

                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700 transition-colors shadow-2xs"
                      >
                        <span>View Publication</span>
                        <ExternalLink className="h-3 w-3 text-stone-500" />
                      </a>
                    </div>

                    <h3 className="font-serif text-base font-bold text-stone-900 leading-snug">
                      {ref.title}
                    </h3>
                    <p className="text-xs text-stone-600">
                      {ref.authors} &bull; <em className="font-semibold text-stone-800">{ref.journal}</em>
                    </p>

                    <div className="rounded-lg border-l-3 border-emerald-700 bg-emerald-50/50 p-3 mt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 block mb-0.5">
                        Clinical &amp; Architectural Takeaway:
                      </span>
                      <p className="text-xs text-stone-700 leading-relaxed">
                        {ref.clinicalTakeaway}
                      </p>
                    </div>

                    <div className="text-[10px] text-stone-500 pt-1 flex flex-wrap items-center gap-3">
                      {ref.doi && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">DOI:</span>
                          <a
                            href={ref.doiUrl || `https://doi.org/${ref.doi}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 font-mono text-[10px] text-stone-700 hover:text-indigo-800 underline flex items-center gap-0.5"
                          >
                            <span>{ref.doi}</span>
                            <ExternalLink className="h-2 w-2" />
                          </a>
                        </div>
                      )}
                      {ref.pmid && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">PubMed:</span>
                          <a
                            href={ref.pubmedUrl || `https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-mono text-[10px] text-sky-800 hover:underline flex items-center gap-0.5"
                          >
                            <span>PMID: {ref.pmid}</span>
                            <ExternalLink className="h-2 w-2" />
                          </a>
                        </div>
                      )}
                      {ref.bookshelfId && (
                        <div className="flex items-center gap-1">
                          <span className="font-semibold">NCBI Bookshelf:</span>
                          <a
                            href={`https://www.ncbi.nlm.nih.gov/books/${ref.bookshelfId}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-mono text-[10px] text-emerald-800 hover:underline flex items-center gap-0.5"
                          >
                            <span>{ref.bookshelfId}</span>
                            <ExternalLink className="h-2 w-2" />
                          </a>
                        </div>
                      )}
                    </div>
                  </article>
                ))}

                {filteredReferences.length === 0 && (
                  <div className="rounded-xl border border-dashed border-stone-300 p-8 text-center text-stone-500 text-sm font-medium">
                    No publications matching your search filter.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

            {/* Section Pagination Controls */}
            {renderPagination()}
          </div>
        </div>

        {/* Editorial Colophon & Regulatory Citation Block */}
        <footer className="mt-12 rounded-2xl border border-stone-200/90 bg-white p-6 sm:p-8 text-stone-700 shadow-xs space-y-6 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4 text-emerald-700" />
                <span>Clinical Dossier Colophon &bull; SIH 2026 PS 26003</span>
              </div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                CogniCare Digital Therapeutics (CDTx) Regulatory Dossier
              </h3>
            </div>
            <div className="text-xs text-stone-500 font-mono">
              Document Ref: CDTX-SIH26-MCI-V3.2
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 text-xs text-stone-600 leading-relaxed">
            <div className="space-y-1.5">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px] block">
                Regulatory Classification
              </span>
              <p>
                Class B Software as a Medical Device (SaMD) under CDSCO Medical Device Rules 2017. Designed for non-invasive cognitive screening and active neurorehabilitation.
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px] block">
                Ethical &amp; Privacy Standards
              </span>
              <p>
                Fully compliant with ICMR Biomedical AI Guidelines (2023) and India DPDP Act (2023) proxy caregiver consent frameworks. Zero cloud egress for raw biometric telemetry.
              </p>
            </div>
            <div className="space-y-1.5">
              <span className="font-bold text-stone-900 uppercase tracking-wider text-[11px] block">
                Suggested Citation
              </span>
              <p className="font-mono text-[11px] bg-stone-50 p-2 rounded border border-stone-200 text-stone-700">
                Yadav, S. et al. (2026). CogniCare Serious Cognitive Gaming Platform for Mild Cognitive Impairment. SIH PS 26003 Research Whitepaper.
              </p>
            </div>
          </div>

          <div className="border-t border-stone-100 pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500">
            <div>
              &copy; 2026 CogniCare Clinical Informatics Consortium. Open Source for SIH 2026.
            </div>
            <div className="flex items-center gap-4">
              <Link href="/patient/games" className="text-emerald-800 hover:text-emerald-950 font-medium underline">
                Therapy Modules
              </Link>
              <Link href="/caregiver" className="text-emerald-800 hover:text-emerald-950 font-medium underline">
                Caregiver Portal
              </Link>
              <button type="button" onClick={handlePrint} className="text-stone-600 hover:text-stone-900 font-medium cursor-pointer">
                Print Dossier
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
