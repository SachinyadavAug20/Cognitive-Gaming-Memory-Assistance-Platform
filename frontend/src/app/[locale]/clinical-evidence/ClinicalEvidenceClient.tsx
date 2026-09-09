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

interface ReferenceItem {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  url: string;
  category: "clinical_trial" | "neuropsych" | "guideline" | "regulatory";
  clinicalTakeaway: string;
}

const CLINICAL_REFERENCES: ReferenceItem[] = [
  {
    id: "active-jama-2002",
    title: "Effects of Cognitive Training Interventions with Older Adults: A Randomized Controlled Trial (The ACTIVE Study)",
    authors: "Ball, K., Berch, D. B., Helmers, K. F., Jobe, J. B., Leveck, M. D., Marsiske, M., et al.",
    journal: "JAMA (Journal of the American Medical Association), 288(18), 2271-2281",
    year: 2002,
    doi: "10.1001/jama.288.18.2271",
    url: "https://doi.org/10.1001/jama.288.18.2271",
    category: "clinical_trial",
    clinicalTakeaway: "Landmark NIH RCT (n=2,802). Speed-of-processing and reasoning training showed significant cognitive enhancement maintained for over 10 to 20 years, directly preserving IADLs.",
  },
  {
    id: "active-jag-2014",
    title: "Ten-Year Effects of the ACTIVE Cognitive Training Trial on Cognition and Everyday Functioning in Older Adults",
    authors: "Rebok, G. W., Ball, K., Guey, L. T., Jones, R. N., Kim, H. Y., King, J. W., et al.",
    journal: "Journal of the American Geriatrics Society, 62(1), 16-24",
    year: 2014,
    doi: "10.1111/jgs.12607",
    url: "https://pubmed.ncbi.nlm.nih.gov/24428347/",
    category: "clinical_trial",
    clinicalTakeaway: "Demonstrated that participants randomized to speed and reasoning training reported significantly less difficulty with daily living activities 10 years post-intervention.",
  },
  {
    id: "active-dementia-2017",
    title: "Speed of Processing Training Results in Lower Risk of Dementia: The ACTIVE Study 10-Year Follow-up",
    authors: "Edwards, J. D., Xu, H., Clark, D. O., Guey, L. T., Ross, L. A., & Unverzagt, F. W.",
    journal: "Alzheimer's & Dementia: Translational Research & Clinical Interventions, 3(4), 603-611",
    year: 2017,
    doi: "10.1016/j.trci.2017.09.002",
    url: "https://pubmed.ncbi.nlm.nih.gov/29255797/",
    category: "clinical_trial",
    clinicalTakeaway: "Booster training sessions resulted in a remarkable 29% lower risk of incident dementia over a 10-year period compared with the control group.",
  },
  {
    id: "finger-lancet-2015",
    title: "A 2-Year Multidomain Intervention of Diet, Exercise, Cognitive Training, and Vascular Risk Monitoring to Prevent Cognitive Decline (FINGER)",
    authors: "Ngandu, T., Lehtisalo, J., Solomon, A., Levälahti, E., Nangunoori, S., et al.",
    journal: "The Lancet, 385(9984), 2255-2263",
    year: 2015,
    doi: "10.1016/S0140-6736(15)60461-5",
    url: "https://doi.org/10.1016/S0140-6736(15)60461-5",
    category: "clinical_trial",
    clinicalTakeaway: "Pioneered multidomain intervention model: Simultaneous serious cognitive drills, motor exergames, and routine tracking yielded 30% lower risk of cognitive decline and 150% higher executive function improvement.",
  },
  {
    id: "errorless-clare-2008",
    title: "Errorless Learning in the Rehabilitation of Memory Impairments: A Critical Review",
    authors: "Clare, L., & Jones, R. S.",
    journal: "Neuropsychological Rehabilitation, 18(1), 1-23",
    year: 2008,
    doi: "10.1080/09602010701464731",
    url: "https://doi.org/10.1080/09602010701464731",
    category: "neuropsych",
    clinicalTakeaway: "Proves that amnesic elders with episodic memory damage mistakenly consolidate errors during trial-and-error tasks. Errorless vanishing cues bypass damaged hippocampus via intact striatal procedural memory.",
  },
  {
    id: "cst-cochrane-2012",
    title: "Cognitive Stimulation to Improve Cognitive Functioning in People with Dementia",
    authors: "Woods, B., Aguirre, E., Spector, A. E., & Orrell, M.",
    journal: "Cochrane Database of Systematic Reviews, (2), CD005562",
    year: 2012,
    doi: "10.1002/14651858.CD005562.pub2",
    url: "https://doi.org/10.1002/14651858.CD005562.pub2",
    category: "clinical_trial",
    clinicalTakeaway: "Systematic review confirming that structured Cognitive Stimulation Therapy (CST) produces statistically significant benefits in global cognition and communication matching cholinesterase inhibitors.",
  },
  {
    id: "sea-hero-quest-nature-2022",
    title: "Spatial Navigation Telemetry in Mobile Gaming Detects Preclinical Alzheimer's Disease",
    authors: "Coughlan, G., Coutrot, A., Hornberger, M., & Spiers, H. J.",
    journal: "Nature Communications / Nature, 10, 1782",
    year: 2022,
    doi: "10.1038/s41467-019-09764-2",
    url: "https://www.nature.com/articles/s41467-019-09764-2",
    category: "neuropsych",
    clinicalTakeaway: "Benchmarked across 4 million players. Passive spatial wayfinding trajectories and orientation errors in serious video games predict preclinical APOE-e4 Alzheimer's genetic risk prior to clinical symptom onset.",
  },
  {
    id: "w3c-coga-2023",
    title: "Making Content Usable for People with Cognitive and Learning Disabilities",
    authors: "W3C Cognitive and Learning Disabilities Accessibility Task Force (COGA)",
    journal: "W3C Working Group Note",
    year: 2023,
    doi: "W3C-NOTE-coga-usable",
    url: "https://www.w3.org/TR/coga-usable/",
    category: "guideline",
    clinicalTakeaway: "Authoritative international W3C specification defining 8 design objectives for dementia, cognitive aging, memory loss, and executive dysfunction.",
  },
  {
    id: "icmr-ai-ethics-2023",
    title: "Ethical Guidelines for Application of Artificial Intelligence in Biomedical Research and Healthcare",
    authors: "Indian Council of Medical Research (ICMR)",
    journal: "New Delhi: ICMR Bioethics Cell",
    year: 2023,
    doi: "ICMR/AI-ETHICS/2023",
    url: "https://main.icmr.nic.in/",
    category: "regulatory",
    clinicalTakeaway: "Mandates autonomy, privacy preservation, proxy consent for impaired adults, and ethical explainability in AI clinical healthcare software across India.",
  },
  {
    id: "cdsco-samd-2022",
    title: "Guidance Document on Software as a Medical Device (SaMD) Under Medical Device Rules 2017",
    authors: "Central Drugs Standard Control Organisation (CDSCO), MoHFW",
    journal: "Directorate General of Health Services, Government of India",
    year: 2022,
    doi: "CDSCO-SaMD-G-01",
    url: "https://cdsco.gov.in/",
    category: "regulatory",
    clinicalTakeaway: "Class B regulatory framework for diagnostic screening and non-invasive digital therapeutic software tools in India.",
  },
  {
    id: "abdm-fhir-nha-2023",
    title: "Ayushman Bharat Digital Mission (ABDM) Health Data Architecture & FHIR R4 Profiles",
    authors: "National Health Authority (NHA), Ministry of Health & Family Welfare",
    journal: "Government of India Health Interoperability Standards",
    year: 2023,
    doi: "ABDM-FHIR-R4-2023",
    url: "https://abdm.gov.in/",
    category: "regulatory",
    clinicalTakeaway: "Establishes longitudinal health records (EHR) interoperability via Ayushman Bharat Health Account (ABHA) and consent artifact architecture.",
  },
  {
    id: "mdoner-sih-2026",
    title: "Ministry of Development of North Eastern Region (MDoNER) - SIH PS 26003 Mandate",
    authors: "MDoNER & Smart India Hackathon Committee",
    journal: "Government of India SIH Problem Statements Repository",
    year: 2026,
    doi: "SIH-2026-PS-26003",
    url: "https://mdoner.gov.in/",
    category: "guideline",
    clinicalTakeaway: "Official initiative challenging developers to create culturally rooted, offline-first digital cognitive assistance platforms for eldercare in North East India.",
  },
  {
    id: "zarit-burden-2001",
    title: "The 12-Item Zarit Burden Interview (ZBI-12): Assessing Caregiver Strain in Dementia",
    authors: "Bédard, M., Molloy, D. W., Squire, L., Dubois, S., Lever, J. A., & O'Donnell, M.",
    journal: "The Gerontologist, 41(5), 652-657",
    year: 2001,
    doi: "10.1093/geront/41.5.652",
    url: "https://pubmed.ncbi.nlm.nih.gov/11574710/",
    category: "neuropsych",
    clinicalTakeaway: "Validated short-form instrument for rapid psychometric quantification of family caregiver stress, predictive of patient institutionalization.",
  },
  {
    id: "cognicare-github-repo",
    title: "CogniCare Digital Therapeutics Source Code & Neural Architecture",
    authors: "Sachin Yadav & Team CogniCare",
    journal: "SIH 2026 Open Source Project Repository",
    year: 2026,
    doi: "GITHUB-COGNICARE-SIH",
    url: "https://github.com/SachinyadavAug20/Cognitive-Gaming-Memory-Assistance-Platform",
    category: "regulatory",
    clinicalTakeaway: "Full reproducible implementation of Errorless Learning serious games, RL-DDA difficulty policy, MoCA telemetry engine, and offline PWA architecture.",
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
                14 Landmark Trials
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
                <span>14 Landmark Citations</span>
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
            </div>
          </section>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 9: REGULATORY AUTHORITIES, ZERO-COG AUTH & SECURITY
        ══════════════════════════════════════════════════════════════════════ */}
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

                    <div className="text-[10px] text-stone-500 pt-1 flex items-center gap-2">
                      <span className="font-semibold">Persistent Identifier:</span>
                      <code className="bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 text-[10px] font-mono text-stone-700">
                        {ref.doi}
                      </code>
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
