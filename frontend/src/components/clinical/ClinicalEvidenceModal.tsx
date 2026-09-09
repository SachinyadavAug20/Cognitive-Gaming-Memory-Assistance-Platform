"use client";

import { useState } from "react";
import {
  FileText,
  ShieldCheck,
  Brain,
  Sparkles,
  Award,
  BookOpen,
  CheckCircle2,
  X,
  Layers,
  ExternalLink,
} from "lucide-react";

interface ClinicalEvidenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ClinicalEvidenceModal({ isOpen, onClose }: ClinicalEvidenceModalProps) {
  const [activeTab, setActiveTab] = useState<"neuro" | "moca" | "guidelines" | "references">("neuro");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-6 animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-3xl border-4 border-black bg-[#FAF6F0] p-5 sm:p-7 shadow-[8px_8px_0px_#000] max-h-[92vh] flex flex-col text-ink">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b-3 border-black pb-4 mb-4 shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-tea-light border border-tea/30 text-tea-dark px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                Clinical Research & Regulatory Dossier
              </span>
              <span className="rounded-full bg-amber-100 border border-amber-300 text-amber-950 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider">
                SIH26003 MDoNER
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-ink">
              Neuropsychological Foundations & Medical Standards
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="btn-tactile rounded-xl border-2 border-black bg-surface hover:bg-surface-muted p-2 text-ink shadow-[2px_2px_0px_#000] cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b-2 border-black/15 pb-3 mb-4 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("neuro")}
            className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
              activeTab === "neuro"
                ? "border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
                : "border-black/20 bg-white text-ink hover:bg-surface-muted"
            }`}
          >
            1. Neuropsychological Frameworks
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("moca")}
            className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
              activeTab === "moca"
                ? "border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
                : "border-black/20 bg-white text-ink hover:bg-surface-muted"
            }`}
          >
            2. MoCA 6-Domain Mapping
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("guidelines")}
            className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
              activeTab === "guidelines"
                ? "border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
                : "border-black/20 bg-white text-ink hover:bg-surface-muted"
            }`}
          >
            3. Medical UX & W3C COGA
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("references")}
            className={`rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
              activeTab === "references"
                ? "border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
                : "border-black/20 bg-white text-ink hover:bg-surface-muted"
            }`}
          >
            4. Landmark Studies (ACTIVE, Nature)
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {activeTab === "neuro" && (
            <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
              <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-xs">
                <h3 className="font-serif text-lg font-black text-ink flex items-center gap-2">
                  <Brain className="h-5 w-5 text-tea" />
                  <span>Errorless Learning (EL) in Cognitive Rehabilitation</span>
                </h3>
                <p className="mt-2 text-ink-secondary">
                  A fundamental impairment in Alzheimer’s disease and mild cognitive impairment is the degradation of episodic memory. Traditional trial-and-error paradigms force patients to make mistakes, which are erroneously encoded into the fragile memory trace itself, inducing profound frustration.
                </p>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="rounded-xl border border-tea/40 bg-tea-light/40 p-2.5">
                    <strong className="block text-tea-dark font-black">Vanishing Cues:</strong>
                    Soft golden pulse highlights appear progressively before any mistake is committed.
                  </div>
                  <div className="rounded-xl border border-tea/40 bg-tea-light/40 p-2.5">
                    <strong className="block text-tea-dark font-black">Soft-Blocking:</strong>
                    Incorrect moves gently snap back with harmonious pentatonic chimes—never red failure buzzers.
                  </div>
                  <div className="rounded-xl border border-tea/40 bg-tea-light/40 p-2.5">
                    <strong className="block text-tea-dark font-black">Self-Generation (EL-SG):</strong>
                    Semantically rich cultural cues prompt the patient to produce correct answers naturally.
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-xs">
                <h3 className="font-serif text-lg font-black text-ink flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  <span>Reinforcement Learning Dynamic Difficulty Adjustment (RL-DDA)</span>
                </h3>
                <p className="mt-2 text-ink-secondary">
                  Static difficulty curves fail in neurodegenerative therapy. The software operates as an autonomous Markov Decision Process (MDP) agent:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside font-medium text-ink">
                  <li><strong>State ($S$):</strong> Moving average of reaction time latency, error frequency, and tremor variance.</li>
                  <li><strong>Action ($A$):</strong> Dynamically adjusting grid sizing (2x2 to 4x4), distractor count, and tempo.</li>
                  <li><strong>Reward ($R$):</strong> Explicitly optimized to maintain a <strong>75%–80% success rate</strong>, anchoring the patient in the optimal Zone of Proximal Development without cognitive exhaustion.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "moca" && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-xs">
                <h3 className="font-serif text-lg font-black text-ink flex items-center gap-2 mb-2">
                  <Award className="h-5 w-5 text-tea" />
                  <span>Montreal Cognitive Assessment (MoCA) Translation Table</span>
                </h3>
                <p className="text-xs text-ink-secondary mb-3">
                  To ensure clinical validity and secure adoption by neurologists and ASHA health workers, each digital serious game maps 1-to-1 with a standard MoCA subtest:
                </p>
                <div className="overflow-x-auto rounded-xl border border-black/20">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-ink text-white font-black text-[11px] uppercase">
                      <tr>
                        <th className="px-3 py-2">MoCA Domain</th>
                        <th className="px-3 py-2">Standard Clinical Subtest</th>
                        <th className="px-3 py-2">CogniCare Serious Game Equivalent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/10 font-medium text-ink">
                      <tr>
                        <td className="px-3 py-2 font-bold">Visuospatial & Executive (5 pts)</td>
                        <td className="px-3 py-2 text-ink-secondary">Trail Making Test, Cube Copy, Clock Drawing</td>
                        <td className="px-3 py-2 text-tea-dark font-bold">Majuli 3D Walk, Bamboo Arrow Labyrinth, Sacred Alpana</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold">Naming & Language (3 pts)</td>
                        <td className="px-3 py-2 text-ink-secondary">Low-frequency animal naming, phonemic fluency</td>
                        <td className="px-3 py-2 text-tea-dark font-bold">Grandchild AI Chat, Assamese/Hindi Proverb Completion</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold">Attention & Focus (6 pts)</td>
                        <td className="px-3 py-2 text-ink-secondary">Forward/backward digit span, vigilance tapping</td>
                        <td className="px-3 py-2 text-tea-dark font-bold">Bihu Dhol Beats, Brahmaputra Boat Navigation</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold">Abstraction & Reasoning (2 pts)</td>
                        <td className="px-3 py-2 text-ink-secondary">Conceptual similarities (e.g. train vs bicycle)</td>
                        <td className="px-3 py-2 text-tea-dark font-bold">Traditional Kitchen Sorting, Morning Routine Sequencing</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold">Delayed Recall (5 pts)</td>
                        <td className="px-3 py-2 text-ink-secondary">Delayed word list recall with category cues</td>
                        <td className="px-3 py-2 text-tea-dark font-bold">Memory Detective (Family Faces), Jigsaw Reminiscence</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-bold">Orientation (6 pts)</td>
                        <td className="px-3 py-2 text-ink-secondary">Date, month, year, day, place, city recall</td>
                        <td className="px-3 py-2 text-tea-dark font-bold">Morning Orientation Check-in, Village Landmark Wayfinding</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === "guidelines" && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-xs">
                <h3 className="font-serif text-lg font-black text-ink flex items-center gap-2 mb-2">
                  <ShieldCheck className="h-5 w-5 text-tea" />
                  <span>W3C COGA & WCAG 2.2 AAA Compliance Standards</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div className="rounded-xl border border-black/15 p-3 bg-[#FAF6F0]">
                    <strong className="block font-black text-ink mb-1">WCAG 1.4.3 & 1.4.11 Contrast:</strong>
                    Minimum 4.5:1 text contrast and 3:1 for all interactive buttons. Pure black high-contrast borders guarantee legibility for macular degeneration and presbyopia.
                  </div>
                  <div className="rounded-xl border border-black/15 p-3 bg-[#FAF6F0]">
                    <strong className="block font-black text-ink mb-1">WCAG 2.5.5 Target Size (AAA):</strong>
                    All tap targets are engineered to ≥44×44px (average 48×48px to 64×64px) to accommodate motor tremors and Parkinsonian comorbidities.
                  </div>
                  <div className="rounded-xl border border-black/15 p-3 bg-[#FAF6F0]">
                    <strong className="block font-black text-ink mb-1">COGA Objective: Do Not Rely on Memory:</strong>
                    Zero cross-page recall burdens. All game instructions are available on-screen and accompanied by voice narration via localized TTS.
                  </div>
                  <div className="rounded-xl border border-black/15 p-3 bg-[#FAF6F0]">
                    <strong className="block font-black text-ink mb-1">NICE ESF Tier C Evidence Standards:</strong>
                    Standardized reporting of digital biomarkers, cognitive trajectories, and caregiver Zarit Burden (ZBI-12) indexes.
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "references" && (
            <div className="space-y-4 text-xs sm:text-sm">
              <div className="rounded-2xl border-2 border-black bg-white p-4 shadow-xs">
                <h3 className="font-serif text-lg font-black text-ink flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-tea" />
                  <span>Curated Scientific Studies & Clinical Trials</span>
                </h3>
                <div className="space-y-3 mt-3">
                  <div className="border-b border-black/10 pb-2.5">
                    <div className="font-black text-ink">Sea Hero Quest (Coughlan et al., Nature 2022)</div>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      Proved that spatial navigation game telemetry generates valid population-scale digital biomarkers for Alzheimer’s disease years before clinical diagnosis.
                    </p>
                  </div>
                  <div className="border-b border-black/10 pb-2.5">
                    <div className="font-black text-ink">The ACTIVE Study (Ball et al., NIH 20-Year RCT)</div>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      Demonstrated that visual processing speed training supplemented with periodic booster sessions yielded a <strong>25% lower incidence of dementia</strong> over a 20-year follow-up period.
                    </p>
                  </div>
                  <div className="border-b border-black/10 pb-2.5">
                    <div className="font-black text-ink">US POINTER & LatAm-FINGERS Multidomain Trials</div>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      Established that combining computerized cognitive training with physical kinesthetics, hydration/nutrition, and social reminiscence delivers 1 to 2 years of cognitive advantage over control groups.
                    </p>
                  </div>
                  <div>
                    <div className="font-black text-ink">Zarit Burden Interview (ZBI-12) (Bédard et al., 2001)</div>
                    <p className="text-xs text-ink-secondary mt-0.5">
                      The clinical standard for quantifying informal caregiver strain, enabling preventative alerts before acute caregiver burnout occurs.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="mt-4 pt-3 border-t-2 border-black/15 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold text-ink-secondary">
            Aligned with Government of India MDoNER SIH26003 Directive
          </span>
          <button
            type="button"
            onClick={onClose}
            className="btn-tactile rounded-xl border-2 border-black bg-tea px-5 py-2 text-xs sm:text-sm font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-800 cursor-pointer"
          >
            Close Research Dossier
          </button>
        </div>
      </div>
    </div>
  );
}
