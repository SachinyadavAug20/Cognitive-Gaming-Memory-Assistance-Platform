"use client";

import { useState } from "react";
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
  Stethoscope,
  Smile,
  Compass,
} from "lucide-react";
import { mapTelemetryToMoCA } from "@/lib/errorlessLearning";

interface CogaChecklistItem {
  criteria: string;
  level: string;
  title: string;
  implementation: string;
}

const COGA_WCAG_CHECKLIST: CogaChecklistItem[] = [
  {
    criteria: "W3C COGA 4.1",
    level: "AAA",
    title: "Errorless Learning & Zero Frustration Traps",
    implementation: "Soft-blocking replaces failure buzzers with soothing harmonic water ripples; vanishing golden cues guide correct choices after 6s.",
  },
  {
    criteria: "WCAG 2.2 3.3.8",
    level: "AAA",
    title: "Accessible Authentication",
    implementation: "Zero cognitive test authentication: QR Health Card scan with 30-day persistent session cookies and 1-tap scanner resumption.",
  },
  {
    criteria: "WCAG 2.2 2.5.8",
    level: "AAA",
    title: "Target Size (Minimum 48px to 64px)",
    implementation: "All interactive buttons, routine cards, and game elements have touch targets >= 48px, preventing motor tremor mis-clicks.",
  },
  {
    criteria: "WCAG 2.2 2.5.7",
    level: "AAA",
    title: "Dragging Movements Alternative",
    implementation: "Single-tap fallback provided for all spatial manipulation, sorting, and puzzle mechanics so tremors do not block progression.",
  },
  {
    criteria: "W3C COGA 4.2",
    level: "AAA",
    title: "Zero Reliance on Working Memory",
    implementation: "Persistent breadcrumbs, active routine cards, and audio-first voice narration guide the patient through every single step.",
  },
  {
    criteria: "WCAG 2.2 1.4.6",
    level: "AAA",
    title: "Contrast (Enhanced 7:1+)",
    implementation: "Paper-grain parchment palette with jet ink typography (#1A1A1A on #FAF6F0), exceeds 11:1 contrast ratio with high-contrast toggle.",
  },
  {
    criteria: "W3C COGA 4.5",
    level: "AAA",
    title: "Multilingual Speech & Audio-First Pacing",
    implementation: "Native TTS narration in 11 North Eastern languages with 0.82x slowed speech pacing calibrated for cognitive processing speed.",
  },
  {
    criteria: "WCAG 2.2 2.2.1",
    level: "AAA",
    title: "Timing Adjustable & Self-Paced",
    implementation: "No countdown timers or ticking panic clocks during cognitive therapy; patient controls pace completely.",
  },
];

type SectionTab = "overview" | "errorless" | "moca" | "finger" | "coga" | "ner" | "references";

export function ClinicalEvidenceClient() {
  const [activeTab, setActiveTab] = useState<SectionTab>("overview");

  // Sample MoCA translation calculation demo
  const sampleMoCA = mapTelemetryToMoCA({
    visuospatialAccuracyPct: 78,
    languageFluencyPct: 82,
    delayedRecallPct: 65,
    attentionReactionPct: 74,
    abstractionSortingPct: 85,
    orientationAccuracyPct: 88,
  });

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-ink pb-24">
      {/* Top Hero Banner */}
      <div className="border-b-4 border-black bg-ink px-4 py-8 md:py-12 text-white shadow-md">
        <div className="max-w-5xl mx-auto space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-tea px-3 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
              <Stethoscope className="h-3.5 w-3.5" />
              <span>Clinical Evidence & R&D Analysis</span>
            </span>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-200">
              Smart India Hackathon 2026 // Problem Statement 26003
            </span>
            <span className="rounded-full bg-emerald-400/20 border border-emerald-400/40 px-3 py-1 text-xs font-black uppercase tracking-wider text-emerald-300">
              Cognition-Oriented Treatments (COTs)
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
            AI-Driven Cognitive Digital Therapeutics (CDTx) for Dementia Care
          </h1>
          <p className="max-w-3xl text-sm sm:text-base font-semibold text-white/80 leading-relaxed">
            A comprehensive neuropsychological, clinical, and gerontological framework governing serious cognitive gaming, multisensory reminiscence therapy, and zero-touch behavioral telemetry in North East India.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/caregiver"
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-white bg-tea px-4 py-2 text-xs sm:text-sm font-black text-white hover:bg-emerald-800 shadow-[2px_2px_0px_#fff]"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Open Caregiver Portal</span>
            </Link>
            <Link
              href="/patient/games"
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-white/40 bg-white/10 px-4 py-2 text-xs sm:text-sm font-black text-white hover:bg-white/20 shadow-[2px_2px_0px_rgba(255,255,255,0.3)]"
            >
              <Brain className="h-4 w-4 text-amber-300" />
              <span>Explore 25+ Therapy Modules</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Body with Tab Navigation */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar border-b-3 border-black/15">
          {[
            { id: "overview", label: "1. The CDTx Imperative", icon: BookOpen },
            { id: "errorless", label: "2. Errorless Learning (EL)", icon: Sparkles },
            { id: "moca", label: "3. MoCA 6-Domain Telemetry", icon: Activity },
            { id: "finger", label: "4. Multidomain (FINGER)", icon: HeartHandshake },
            { id: "coga", label: "5. W3C COGA / AAA UX", icon: ShieldCheck },
            { id: "ner", label: "6. North East India Protocol", icon: Compass },
            { id: "references", label: "7. Clinical Citations", icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as SectionTab)}
                className={`btn-tactile inline-flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-xs sm:text-sm font-black whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "border-black bg-tea text-white shadow-[3px_3px_0px_#000]"
                    : "border-black/20 bg-white text-ink hover:bg-amber-100/60"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── TAB 1: THE CDTX IMPERATIVE ── */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-3xl border-3 border-black bg-surface p-6 sm:p-8 shadow-[6px_6px_0px_#000] space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black uppercase">
                <Brain className="h-3.5 w-3.5 text-amber-800" />
                <span>The Global & Regional Neurocognitive Crisis</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-ink">
                From Pharmacological Limitations to Precision Digital Therapeutics
              </h2>
              <p className="text-sm sm:text-base font-medium text-ink-secondary leading-relaxed">
                Global dementia cases exceed 55 million and are projected to nearly triple to 139 million by 2050. Conventional pharmacotherapies (such as cholinesterase inhibitors and NMDA receptor antagonists) offer modest symptomatic relief but exhibit negligible disease-modifying capacity and carry substantial adverse effect profiles. Consequently, global consensus guidelines from the WHO, NICE, and Lancet Commission emphasize non-pharmacological <strong>Cognition-Oriented Treatments (COTs)</strong>.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 pt-2">
                <div className="rounded-2xl border-2 border-black bg-[#FAF5EE] p-4 shadow-[3px_3px_0px_#000]">
                  <span className="text-xs font-black uppercase tracking-wider text-tea">Modality A</span>
                  <h4 className="font-serif text-base font-black text-ink mt-1">Cognitive Stimulation (CS)</h4>
                  <p className="text-xs font-semibold text-ink-secondary mt-1">
                    Multisensory, social engagement and reality orientation to preserve neuroplasticity without confrontational memory testing.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-black bg-[#FAF5EE] p-4 shadow-[3px_3px_0px_#000]">
                  <span className="text-xs font-black uppercase tracking-wider text-terracotta">Modality B</span>
                  <h4 className="font-serif text-base font-black text-ink mt-1">Cognitive Training (CT)</h4>
                  <p className="text-xs font-semibold text-ink-secondary mt-1">
                    Structured, computer-adaptive gamified drills targeting specific cognitive domains (working memory, visual search, executive control).
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-black bg-[#FAF5EE] p-4 shadow-[3px_3px_0px_#000]">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800">Modality C</span>
                  <h4 className="font-serif text-base font-black text-ink mt-1">Cognitive Rehabilitation (CR)</h4>
                  <p className="text-xs font-semibold text-ink-secondary mt-1">
                    Errorless learning protocols focused on real-world functional independence (IADLs, making tea, recognizing family, medication compliance).
                  </p>
                </div>
              </div>
            </div>

            {/* Problem Statement 26003 Alignment */}
            <div className="rounded-3xl border-3 border-black bg-gradient-to-r from-teal-900 to-emerald-950 p-6 sm:p-8 text-white shadow-[6px_6px_0px_#000] space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-teal-200 text-xs font-black uppercase">
                <Compass className="h-3.5 w-3.5 text-amber-300" />
                <span>Problem Statement 26003 (MDoNER / SIH)</span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl font-black text-white">
                Addressing North East India&apos;s Healthcare Accessibility Chasm
              </h3>
              <p className="text-xs sm:text-sm font-normal text-teal-100 leading-relaxed max-w-3xl">
                The 8 North Eastern states face profound geographic isolation, rugged mountainous terrain, and an acute deficit of neurologists and psychogeriatricians (less than 1 per 1.5 million residents in remote hill tracts). Families rely heavily on Community Health Workers (ASHAs and ANMs). CogniCare bridges this divide through:
              </p>
              <ul className="grid sm:grid-cols-2 gap-3 text-xs sm:text-sm font-semibold pt-2 text-white">
                <li className="flex items-center gap-2 bg-black/30 p-2.5 rounded-xl border border-white/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Zero-Touch QR Health Card Kiosk Authentication</span>
                </li>
                <li className="flex items-center gap-2 bg-black/30 p-2.5 rounded-xl border border-white/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>100% Offline PWA Functionality for Remote Hills</span>
                </li>
                <li className="flex items-center gap-2 bg-black/30 p-2.5 rounded-xl border border-white/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>11 Regional Dialects with Voice-First Narration</span>
                </li>
                <li className="flex items-center gap-2 bg-black/30 p-2.5 rounded-xl border border-white/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Biomarker Telemetry for Ayushman Bharat (ABDM) Integration</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* ── TAB 2: ERRORLESS LEARNING & CST ── */}
        {activeTab === "errorless" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-3xl border-3 border-black bg-surface p-6 sm:p-8 shadow-[6px_6px_0px_#000] space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-950 text-xs font-black uppercase">
                <Sparkles className="h-3.5 w-3.5 text-emerald-800" />
                <span>Neuropsychological Rehabilitation Engine</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-ink">
                Errorless Learning (EL) vs. Errorful Learning
              </h2>
              <p className="text-sm sm:text-base font-medium text-ink-secondary leading-relaxed">
                In individuals with Alzheimer&apos;s disease, <strong>episodic and declarative memory</strong> circuits (hippocampal-entorhinal axis) are severely compromised. When an elderly amnesic patient makes an error during traditional trial-and-error tasks, their impaired executive system fails to recognize the error; instead, <em>the wrong answer is mistakenly consolidated into their fragile memory trace</em>.
              </p>

              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl border-3 border-rose-300 bg-rose-50/70 p-5 space-y-2">
                  <h4 className="font-serif text-lg font-black text-rose-900 flex items-center gap-2">
                    <span>❌ Traditional Gaming (Harmful in Dementia)</span>
                  </h4>
                  <ul className="text-xs font-semibold text-rose-950 space-y-1.5 list-disc list-inside">
                    <li>Harsh red &quot;X&quot; marks, loud failure buzzers, or game over screens.</li>
                    <li>Rapid countdown clocks that induce acute cortisol spikes and panic.</li>
                    <li>Trial-and-error demands high executive self-monitoring, which patients lack.</li>
                    <li>Results in cognitive withdrawal, agitation, and platform abandonment.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border-3 border-emerald-400 bg-emerald-50/70 p-5 space-y-2">
                  <h4 className="font-serif text-lg font-black text-emerald-900 flex items-center gap-2">
                    <span>✅ CogniCare Errorless Learning (Clinically Validated)</span>
                  </h4>
                  <ul className="text-xs font-semibold text-emerald-950 space-y-1.5 list-disc list-inside">
                    <li><strong>Vanishing Cues:</strong> Subtle golden halos pulse after 6s hesitation.</li>
                    <li><strong>Soft-Blocking:</strong> Incorrect taps gently trigger harmonic water ripples without punishment.</li>
                    <li><strong>Procedural Scaffolding:</strong> Leverages intact striatal procedural memory.</li>
                    <li><strong>Self-Generation (EL-SG):</strong> Patient guided to succeed independently.</li>
                  </ul>
                </div>
              </div>

              {/* Cognitive Stimulation Therapy Section */}
              <div className="rounded-2xl border-2 border-black bg-[#FAF5EE] p-5 mt-4 space-y-2">
                <h4 className="font-serif text-lg font-black text-ink flex items-center gap-2">
                  <HeartHandshake className="h-5 w-5 text-tea" />
                  <span>Cognitive Stimulation Therapy (CST) &amp; Multisensory Reminiscence</span>
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-ink-secondary leading-relaxed">
                  Meta-analyses of randomized controlled trials indicate that structured CST protocols yield improvements in global cognition and language equivalent to acetylcholinesterase inhibitor drugs. CogniCare integrates CST via culturally rooted auditory and visual triggers: procedural rain on tin roofs, Brahmaputra riverboat oars, Buddhist monastery gongs, and authentic family memory albums.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: MOCA 6-DOMAIN TRANSLATION ── */}
        {activeTab === "moca" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-3xl border-3 border-black bg-surface p-6 sm:p-8 shadow-[6px_6px_0px_#000] space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 border border-teal-300 text-teal-950 text-xs font-black uppercase">
                <Activity className="h-3.5 w-3.5 text-teal-800" />
                <span>Clinical Telemetry Translation Matrix</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-ink">
                Translating Serious Game Interactions into MoCA Equivalents
              </h2>
              <p className="text-sm sm:text-base font-medium text-ink-secondary leading-relaxed">
                Rather than subjecting fragile dementia patients to stressful paper-and-pencil examinations, CogniCare passively maps non-invasive in-game telemetry directly to Montreal Cognitive Assessment (MoCA) 6-domain clinical metrics.
              </p>

              {/* Sample Live Calculation Table */}
              <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-sm overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm border-collapse">
                  <thead>
                    <tr className="border-b-2 border-black/20 text-ink-secondary font-black">
                      <th className="py-2 px-3">MoCA Domain</th>
                      <th className="py-2 px-3">Clinical Subtest</th>
                      <th className="py-2 px-3">CogniCare Digital Mapping</th>
                      <th className="py-2 px-3 text-center">Score / Max</th>
                      <th className="py-2 px-3 text-center">Clinical Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/10 font-bold">
                    {sampleMoCA.domains.map((dom) => (
                      <tr key={dom.domainKey} className="hover:bg-amber-50/50">
                        <td className="py-2.5 px-3 font-black text-ink">{dom.domainTitle}</td>
                        <td className="py-2.5 px-3 text-ink-secondary">{dom.clinicalSubtest}</td>
                        <td className="py-2.5 px-3 text-tea font-semibold">{dom.digitalGameMapping}</td>
                        <td className="py-2.5 px-3 text-center font-black">
                          {dom.estimatedScore} / {dom.maxScore}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase ${
                              dom.status === "optimal"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                : dom.status === "mild_monitoring"
                                ? "bg-amber-100 text-amber-900 border border-amber-300"
                                : "bg-rose-100 text-rose-800 border border-rose-300"
                            }`}
                          >
                            {dom.status.replace("_", " ")}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-3 border-black bg-[#FAF5EE] font-black text-sm">
                      <td colSpan={3} className="py-3 px-3 text-ink">
                        Composite Estimated MoCA Score (Peer-Reviewed Telemetry Model):
                      </td>
                      <td className="py-3 px-3 text-center text-tea text-base font-black">
                        {sampleMoCA.totalEstimatedScore} / 30
                      </td>
                      <td className="py-3 px-3 text-center text-xs font-black text-emerald-800">
                        {sampleMoCA.clinicalTier}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: FINGER MULTIDOMAIN & ZARIT BURDEN ── */}
        {activeTab === "finger" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-3xl border-3 border-black bg-surface p-6 sm:p-8 shadow-[6px_6px_0px_#000] space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 border border-purple-300 text-purple-950 text-xs font-black uppercase">
                <HeartHandshake className="h-3.5 w-3.5 text-purple-800" />
                <span>Multidomain Preventive Architecture</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-ink">
                FINGER Model &amp; Caregiver Zarit Burden Integration
              </h2>
              <p className="text-sm sm:text-base font-medium text-ink-secondary leading-relaxed">
                The landmark Finnish Geriatric Intervention Study to Prevent Cognitive Impairment and Disability (<strong>FINGER</strong>, Lancet 2015) demonstrated that cognitive training is most potent when embedded in a multidomain lifestyle paradigm.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                <div className="rounded-2xl border-2 border-black bg-white p-5 space-y-2 shadow-xs">
                  <span className="text-xs font-black uppercase tracking-wider text-tea">FINGER Pillar 1 &amp; 2</span>
                  <h4 className="font-serif text-base font-black text-ink">Cognitive Drills + Motor Exergames</h4>
                  <p className="text-xs font-semibold text-ink-secondary leading-relaxed">
                    Exergames like <em>Tea Harvest Vision</em> and <em>Hornbill Flight</em> demand real-time physical gesture coordination (MediaPipe webcam hand tracking), stimulating cerebellar and prefrontal neuroplasticity simultaneously.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-black bg-white p-5 space-y-2 shadow-xs">
                  <span className="text-xs font-black uppercase tracking-wider text-amber-800">FINGER Pillar 3 &amp; 4</span>
                  <h4 className="font-serif text-base font-black text-ink">Vascular Monitoring + Social Connection</h4>
                  <p className="text-xs font-semibold text-ink-secondary leading-relaxed">
                    Interactive roleplay therapies like <em>Grandchild Chat</em> and <em>Bazaar Buddies</em> counteract profound social isolation, while daily routine tracking monitors hydration and hypertensive medication adherence.
                  </p>
                </div>
              </div>

              {/* Zarit Burden Scale */}
              <div className="rounded-2xl border-2 border-black bg-[#FAF5EE] p-5 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-rose-800">Caregiver Clinical Support</span>
                <h4 className="font-serif text-base font-black text-ink">Zarit Burden Interview (ZBI-12) Telemetry</h4>
                <p className="text-xs sm:text-sm font-semibold text-ink-secondary leading-relaxed">
                  Caregiver burnout directly precipitates early institutionalization and accelerates patient cognitive decline. CogniCare embeds the validated ZBI-12 questionnaire directly inside the Caregiver Portal, alerting community health workers when strain indices exceed clinical thresholds (&gt;17/48).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 5: W3C COGA & WCAG 2.2 AAA ── */}
        {activeTab === "coga" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-3xl border-3 border-black bg-surface p-6 sm:p-8 shadow-[6px_6px_0px_#000] space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-300 text-blue-950 text-xs font-black uppercase">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-800" />
                <span>W3C WAI COGA &amp; WCAG 2.2 AAA Guidelines</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-ink">
                Digital Health UX Engineering for Cognitive Disabilities
              </h2>
              <p className="text-sm sm:text-base font-medium text-ink-secondary leading-relaxed">
                Standard web accessibility guidelines focus on sensory (blindness/deafness) and physical handicaps. CogniCare strictly complies with the W3C Cognitive and Learning Disabilities Accessibility Task Force (COGA) note: <em>&quot;Making Content Usable for People with Cognitive and Learning Disabilities&quot;</em>.
              </p>

              <div className="grid sm:grid-cols-2 gap-3 pt-2">
                {COGA_WCAG_CHECKLIST.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border-2 border-black bg-white p-4 shadow-xs flex items-start gap-3"
                  >
                    <div className="h-7 w-7 rounded-xl bg-tea-light border border-tea text-tea flex items-center justify-center shrink-0 font-black text-xs">
                      ✓
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase text-tea">{item.criteria}</span>
                        <span className="text-[10px] font-bold text-ink-secondary">({item.level})</span>
                      </div>
                      <h4 className="font-serif text-sm font-black text-ink">{item.title}</h4>
                      <p className="text-xs font-semibold text-ink-secondary leading-relaxed">{item.implementation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 6: NORTH EAST INDIA CULTURAL ARCHITECTURE ── */}
        {activeTab === "ner" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-3xl border-3 border-black bg-surface p-6 sm:p-8 shadow-[6px_6px_0px_#000] space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-950 text-xs font-black uppercase">
                <Compass className="h-3.5 w-3.5 text-amber-800" />
                <span>Indigenous Neuro-Therapeutic Localization</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-ink">
                Culturally Grounded Cognitive Interventions Across 8 NER States
              </h2>
              <p className="text-sm sm:text-base font-medium text-ink-secondary leading-relaxed">
                Generic cognitive software featuring Western or generic metro-Indian concepts fails to activate deep autobiographical memory circuits in North Eastern elders. CogniCare weaves authentic regional living heritage into each game mechanic:
              </p>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                {[
                  { state: "Assam", theme: "Brahmaputra Boat, Bihu Dhol, Muga Silk", domain: "Sensory & Rhythm Grounding" },
                  { state: "Meghalaya", theme: "Living Root Bridges & Sohra Rain", domain: "Spatial Navigation" },
                  { state: "Nagaland", theme: "Dzukou Lily Botanist & Hornbill Flight", domain: "Visual Discrimination" },
                  { state: "Manipur", theme: "Loktak Phumdi Floating Biomarker", domain: "Working Memory" },
                  { state: "Mizoram", theme: "Bamboo Dance Rhythm (Cheraw)", domain: "Bimanual Coordination" },
                  { state: "Arunachal", theme: "Tawang Monastery Prayer Wheels", domain: "Mindfulness & Attention" },
                  { state: "Tripura", theme: "Neermahal Water Palace Labyrinth", domain: "Visuospatial Planning" },
                  { state: "Sikkim", theme: "Khangchendzonga Mountain Tea Garden", domain: "Fine Motor Tracking" },
                ].map((ner) => (
                  <div key={ner.state} className="rounded-2xl border-2 border-black bg-white p-3.5 space-y-1 shadow-xs">
                    <span className="rounded-md bg-amber-100 border border-amber-300 text-amber-950 px-2 py-0.5 text-[10px] font-black uppercase">
                      {ner.state}
                    </span>
                    <h5 className="font-serif text-sm font-black text-ink">{ner.theme}</h5>
                    <p className="text-[11px] font-semibold text-ink-secondary">{ner.domain}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 7: CLINICAL CITATIONS ── */}
        {activeTab === "references" && (
          <div className="space-y-6 animate-fade-in">
            <div className="rounded-3xl border-3 border-black bg-surface p-6 sm:p-8 shadow-[6px_6px_0px_#000] space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tea-light border border-tea/30 text-tea-dark text-xs font-black uppercase">
                <Award className="h-3.5 w-3.5 text-tea" />
                <span>Landmark Clinical Trials &amp; Peer-Reviewed Literature</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-black text-ink">
                Peer-Reviewed Clinical Literature &amp; Evidence Base
              </h2>

              <div className="space-y-3 pt-2 text-xs sm:text-sm font-medium text-ink-secondary">
                <div className="rounded-2xl border-2 border-black bg-white p-4 space-y-1 shadow-xs">
                  <h5 className="font-serif text-sm font-black text-ink">
                    1. The ACTIVE Study (Advanced Cognitive Training for Independent and Vital Elderly)
                  </h5>
                  <p className="text-xs text-ink-secondary">
                    <em>Ball et al., JAMA (2002); Rebok et al., J Am Geriatr Soc (2014).</em> Demonstrated that targeted cognitive interventions produce durable cognitive enhancements maintained across a 10-year follow-up, significantly preserving IADLs.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-black bg-white p-4 space-y-1 shadow-xs">
                  <h5 className="font-serif text-sm font-black text-ink">
                    2. The FINGER Landmark Randomized Controlled Trial
                  </h5>
                  <p className="text-xs text-ink-secondary">
                    <em>Ngandu et al., The Lancet (2015).</em> Proved that a multidomain lifestyle intervention (cognitive training + physical exercise + vascular tracking) significantly prevents cognitive decline in older adults at risk of dementia.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-black bg-white p-4 space-y-1 shadow-xs">
                  <h5 className="font-serif text-sm font-black text-ink">
                    3. Errorless Learning in Cognitive Rehabilitation
                  </h5>
                  <p className="text-xs text-ink-secondary">
                    <em>Clare, L., &amp; Jones, R. S. (2008). Neuropsychological Rehabilitation, 18(1), 1-23.</em> Detailed the efficacy of vanishing cues and errorless learning paradigms in bypassing episodic deficits to strengthen procedural memory in early-stage Alzheimer&apos;s.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-black bg-white p-4 space-y-1 shadow-xs">
                  <h5 className="font-serif text-sm font-black text-ink">
                    4. Cognitive Stimulation Therapy (CST) Cochrane Review
                  </h5>
                  <p className="text-xs text-ink-secondary">
                    <em>Woods et al., Cochrane Database of Systematic Reviews (2012).</em> Established that structured CST sessions provide statistically significant benefits for cognition and quality of life in dementia, matching anticholinesterase drug efficacy.
                  </p>
                </div>

                <div className="rounded-2xl border-2 border-black bg-white p-4 space-y-1 shadow-xs">
                  <h5 className="font-serif text-sm font-black text-ink">
                    5. W3C Cognitive Accessibility Guidance
                  </h5>
                  <p className="text-xs text-ink-secondary">
                    <em>W3C Working Group Note (2023). &quot;Making Content Usable for People with Cognitive and Learning Disabilities.&quot;</em> Defines the 8 design objectives for dementia, memory loss, and age-related executive decline.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
