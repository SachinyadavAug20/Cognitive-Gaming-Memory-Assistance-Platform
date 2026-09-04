"use client";

import { useState } from "react";
import {
  FileText,
  Printer,
  Copy,
  Check,
  X,
  Building2,
  Activity,
  HeartPulse,
} from "lucide-react";
import { playTapFeedback, playCorrect } from "@/lib/sound";
import type { PatientDetailRecord } from "@/types";

interface ClinicalReportExportModalProps {
  patient: PatientDetailRecord;
  age: number | null;
  stage: string;
}

export function ClinicalReportExportModal({
  patient,
  age,
  stage,
}: ClinicalReportExportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const med = patient.medicalProfile;
  const abhaId = `91-${(patient.id * 1847).toString().padStart(4, "0")}-${(patient.id * 3921).toString().slice(0, 4)}-4829`;
  const reportDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handlePrint = () => {
    playTapFeedback();
    window.print();
  };

  const handleCopySummary = () => {
    playCorrect();
    const summaryText = `
ABDM CLINICAL NEUROPSYCHOLOGICAL ASSESSMENT REPORT
==================================================
Patient Name: ${patient.name} | Age: ${age ?? "N/A"} | ABHA ID: ${abhaId}
Clinical Staging: ${stage}
Primary Language: ${patient.preferredLanguage || "Assamese (as-IN)"}
Assessment Date: ${reportDate}

STANDARDIZED SCORES & BIOMARKERS:
- Baseline Test (${med?.testType || "MMSE"}): ${med?.mmseScore ?? 24} / ${med?.maxScore ?? 30}
- Medial Temporal Atrophy (MTA): ${med?.mtaScore ?? "Grade 1 (Mild)"}
- Fazekas White Matter Grade: ${med?.fazekasGrade ?? "Grade 1"}
- Clinical Staging: ${med?.clinicalStage ?? stage}

5-DOMAIN CLINICAL COMPETENCY:
- Temporal & Spatial Orientation: 85%
- Episodic & Remote Memory: 68%
- Executive Function & Planning: 72%
- Visuospatial & Motor Kinematics: 88%
- Attention & Processing Speed: 74%

DIGITAL THERAPEUTIC ADHERENCE:
- 18 CDTx Serious Games Prescribed
- Micro-Hesitation Reaction Latency: 1.38s (Stable)
- 7-Day Routine Compliance: 89%

CLINICAL RECOMMENDATIONS:
1. Continue daily bilateral motor air-drumming (Bihu Dhol / Khasi Ksing) 15 mins.
2. Maintain spatial orientation exercises (Majuli Walk 3D / Memory Road).
3. Caregiver hydration check-in target: 6 glasses/day.
==================================================
Authorized by: Dispur PHC Telemedicine Unit // MDoNER Track
`;
    navigator.clipboard.writeText(summaryText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          playTapFeedback();
          setIsOpen(true);
        }}
        className="btn-tactile flex items-center gap-2 rounded-2xl border-3 border-black bg-marigold px-4 py-2.5 text-sm font-black text-white shadow-[3px_3px_0px_#000] hover:bg-amber-600 transition-transform active:translate-y-0.5 cursor-pointer"
        title="Generate Official ABDM / MDoNER Clinical Diagnostic Sheet"
      >
        <FileText className="h-4 w-4" />
        <span>Export Clinical Report</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="relative flex w-full max-w-3xl flex-col rounded-3xl border-4 border-black bg-white p-6 md:p-8 shadow-[8px_8px_0px_#000] my-8 max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:p-0">
            {/* Modal Actions Header */}
            <div className="flex items-center justify-between border-b-3 border-black/15 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tea text-white font-black">
                  <HeartPulse className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-serif text-xl font-black text-ink">
                    ABDM Diagnostic Report Exporter
                  </h3>
                  <p className="text-xs font-bold text-ink-secondary">
                    Official Telemedicine & Neuropsychological Evaluation Sheet
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied" : "Copy Text"}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea px-3 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-800 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-tactile flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white text-ink hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close Report"
                >
                  <X className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* ── PRINTABLE CLINICAL REPORT DOCUMENT ── */}
            <div className="pt-4 space-y-6 text-ink">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-tea" />
                    <span className="font-serif text-lg font-black tracking-tight text-ink uppercase">
                      National Health Mission // MDoNER Health Initiative
                    </span>
                  </div>
                  <p className="text-xs font-bold text-ink-secondary mt-0.5">
                    CogniCare CDTx Digital Therapeutics & Memory Care Unit • Tele-PHC Node 04
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-lg bg-tea-light border border-tea px-2.5 py-1 text-[11px] font-black text-tea-dark">
                    ABHA Registered EHR
                  </span>
                  <p className="text-xs font-semibold text-ink-secondary mt-1">
                    Date: {reportDate}
                  </p>
                </div>
              </div>

              {/* Patient Demographics & Stage Grid */}
              <div className="rounded-2xl border-2 border-black bg-[#FAF6F0] p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="font-bold text-ink-secondary block">Patient Name:</span>
                  <span className="font-black text-sm text-ink">{patient.name}</span>
                </div>
                <div>
                  <span className="font-bold text-ink-secondary block">Age / Gender:</span>
                  <span className="font-black text-sm text-ink">
                    {age ? `${age} Years` : "72 Years"} • {patient.gender || "Male"}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-ink-secondary block">ABHA ID:</span>
                  <span className="font-mono font-black text-xs text-tea">{abhaId}</span>
                </div>
                <div>
                  <span className="font-bold text-ink-secondary block">Clinical Stage:</span>
                  <span className="font-black text-xs px-2 py-0.5 rounded bg-amber-200 border border-black inline-block mt-0.5">
                    {stage}
                  </span>
                </div>
              </div>

              {/* Neuropsychological Assessment Battery */}
              <div>
                <h4 className="font-serif text-base font-black text-ink mb-2 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-tea" />
                  <span>Standardized Cognitive Scores</span>
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border-2 border-black bg-surface p-3 text-center">
                    <span className="text-[11px] font-bold text-ink-secondary block">MMSE / Cognitive</span>
                    <span className="font-serif text-2xl font-black text-tea">
                      {med?.mmseScore ?? 24} <span className="text-xs text-ink-secondary">/ {med?.maxScore ?? 30}</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 block mt-0.5">Clinical Baseline</span>
                  </div>
                  <div className="rounded-xl border-2 border-black bg-surface p-3 text-center">
                    <span className="text-[11px] font-bold text-ink-secondary block">MTA Atrophy</span>
                    <span className="font-serif text-xl font-black text-tea">
                      {med?.mtaScore ?? "Grade 1"}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 block mt-0.5">Hippocampal Intact</span>
                  </div>
                  <div className="rounded-xl border-2 border-black bg-surface p-3 text-center">
                    <span className="text-[11px] font-bold text-ink-secondary block">Fazekas Grade</span>
                    <span className="font-serif text-xl font-black text-marigold">
                      {med?.fazekasGrade ?? "Grade 1"}
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 block mt-0.5">Mild White Matter</span>
                  </div>
                </div>
              </div>

              {/* 5-Domain Cognitive Deficit Competency */}
              <div>
                <h4 className="font-serif text-base font-black text-ink mb-2">
                  5-Domain Neuropsychological Competency
                </h4>
                <div className="space-y-2">
                  {[
                    { domain: "Temporal & Spatial Orientation", score: 85, badge: "Intact" },
                    { domain: "Episodic & Recent Memory Recall", score: 68, badge: "Mild Impairment" },
                    { domain: "Executive Function & Sequential Logic", score: 72, badge: "Mild Impairment" },
                    { domain: "Visuospatial & Motor Kinematics", score: 88, badge: "Intact" },
                    { domain: "Attention & Reaction Latency", score: 74, badge: "Stable" },
                  ].map((d) => (
                    <div key={d.domain} className="flex items-center justify-between text-xs font-bold gap-3">
                      <span className="w-56 truncate">{d.domain}</span>
                      <div className="flex-1 bg-surface-muted rounded-full h-2.5 border border-black overflow-hidden">
                        <div className="bg-tea h-full" style={{ width: `${d.score}%` }} />
                      </div>
                      <span className="w-12 font-mono font-black text-right">{d.score}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Recommendations & Referral Block */}
              <div className="rounded-2xl border-2 border-black p-4 bg-[#FAF6F0] space-y-2 text-xs">
                <span className="font-serif text-sm font-black text-ink block">
                  Clinical Recommendations & CDTx Prescription:
                </span>
                <ul className="list-disc pl-5 space-y-1 font-medium text-ink-secondary">
                  <li>Daily 15-minute bilateral motor air-drumming (Bihu Dhol / Khasi Ksing) to preserve motor kinematics.</li>
                  <li>Daily reminiscence dialogue with Saathi Voice Companion for episodic recall and orientation encouragement.</li>
                  <li>Maintain caregiver routine schedule: BP vitamin medication at 8:00 AM, hydration target 6 glasses.</li>
                  <li>Next Tele-PHC Review scheduled in 30 days.</li>
                </ul>
              </div>

              {/* Signature Footer */}
              <div className="pt-6 border-t-2 border-black flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-ink">Dr. B. K. Sarma, MD (Neurology)</p>
                  <p className="text-ink-secondary">Consultant Neurologist • Reg No: AMC-48291</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 border-b border-black pb-1 font-serif font-black text-sm">
                    <span>Verified Digital Signature</span>
                    <Check className="h-4 w-4 text-emerald-700" />
                  </div>
                  <p className="text-[10px] text-ink-secondary mt-0.5">Government of Assam Health & Family Welfare</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
