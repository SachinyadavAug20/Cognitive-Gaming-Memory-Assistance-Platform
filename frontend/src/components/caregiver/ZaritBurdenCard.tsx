"use client";

import { useState, useEffect } from "react";
import {
  HeartHandshake,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ClipboardList,
  PhoneCall,
  CheckCircle2,
  X,
  ArrowRight,
} from "lucide-react";
import {
  ZBI_12_QUESTIONS,
  evaluateZaritBurden,
  type ZBIResult,
} from "@/lib/errorlessLearning";

interface ZaritBurdenCardProps {
  patientId?: number | string;
  patientName?: string;
}

const STORAGE_KEY = "cognicare_caregiver_zbi_state";

const DEFAULT_ANSWERS: Record<number, number> = {
  1: 1, // Rarely
  2: 2, // Sometimes
  3: 1, // Rarely
  4: 1, // Rarely
  5: 1, // Rarely
  6: 1, // Rarely
  7: 1, // Rarely
  8: 2, // Sometimes
  9: 1, // Rarely
  10: 1, // Rarely
  11: 2, // Sometimes
  12: 1, // Rarely
};

const ANSWER_LABELS = [
  { val: 0, label: "Never" },
  { val: 1, label: "Rarely" },
  { val: 2, label: "Sometimes" },
  { val: 3, label: "Frequently" },
  { val: 4, label: "Nearly Always" },
];

export function ZaritBurdenCard({
  patientId,
  patientName = "Patient",
}: ZaritBurdenCardProps) {
  const [answers, setAnswers] = useState<Record<number, number>>(DEFAULT_ANSWERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${patientId || "default"}`);
      if (saved) {
        setAnswers(JSON.parse(saved));
      }
    } catch {
      // Use defaults
    }
  }, [patientId]);

  const evaluation: ZBIResult = evaluateZaritBurden(answers);

  const handleSelectAnswer = (qId: number, val: number) => {
    const updated = { ...answers, [qId]: val };
    setAnswers(updated);
    try {
      localStorage.setItem(`${STORAGE_KEY}_${patientId || "default"}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 10) return "text-emerald-700 bg-emerald-100 border-emerald-300";
    if (score <= 20) return "text-amber-700 bg-amber-100 border-amber-300";
    return "text-rose-700 bg-rose-100 border-rose-300";
  };

  return (
    <div className="rounded-3xl border-4 border-black bg-surface p-5 sm:p-6 shadow-[6px_6px_0px_#000]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-black/15 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-6 w-6 text-rose-600" />
            <h2 className="font-serif text-xl sm:text-2xl font-black text-ink">
              Caregiver Strain & Resilience Index (ZBI-12)
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-ink-secondary mt-1">
            Standardized Zarit Burden Interview (ZBI-12) clinical assessment for informal family caregivers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveStep(0);
            setIsModalOpen(true);
          }}
          className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white hover:bg-rose-50 px-4 py-2 text-xs sm:text-sm font-black text-ink shadow-[2px_2px_0px_#000] cursor-pointer shrink-0"
        >
          <ClipboardList className="h-4 w-4 text-rose-600" />
          <span>Take ZBI-12 Screening</span>
        </button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Total Score */}
        <div className="rounded-2xl border-3 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
          <div className="text-[11px] font-black uppercase tracking-wider text-ink-secondary">
            Zarit Burden Score
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-black text-ink">
              {evaluation.totalScore}
            </span>
            <span className="text-xs font-bold text-ink-secondary">/ 48 pts</span>
          </div>
          <div className="mt-2.5">
            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-black border ${getScoreColor(evaluation.totalScore)}`}>
              {evaluation.burdenCategory}
            </span>
          </div>
        </div>

        {/* Clinical Interpretation */}
        <div className="md:col-span-2 rounded-2xl border-3 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
          <div className="text-[11px] font-black uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-tea" />
            <span>Clinical Evaluation & Coping Equilibrium</span>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-semibold text-ink leading-relaxed">
            {evaluation.clinicalInterpretation}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {evaluation.peerSupportRecommended && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[11px] font-bold">
                <AlertTriangle className="h-3 w-3 text-amber-700" /> CARES Peer Support Recommended
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-md bg-tea-light text-tea-dark border border-tea/30 px-2 py-0.5 text-[11px] font-bold">
              <Sparkles className="h-3 w-3 text-tea" /> Psychoeducational Interventions Active
            </span>
          </div>
        </div>
      </div>

      {/* Prescribed Non-Pharmacological Interventions */}
      <div className="rounded-2xl border-2 border-black/20 bg-[#FAF6F0] p-4">
        <div className="text-xs font-black uppercase tracking-wider text-ink mb-2.5 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-tea" />
          <span>Recommended Evidence-Based Burnout Mitigation Steps:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {evaluation.prescribedInterventions.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 rounded-xl bg-white border border-black/15 p-2.5 text-xs font-medium text-ink shadow-xs"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Peer Support & Tele-MANAS Emergency Net */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-black bg-rose-50/70 p-3.5">
        <div className="flex items-center gap-2.5">
          <PhoneCall className="h-5 w-5 text-rose-600 shrink-0" />
          <div>
            <div className="text-xs font-black text-ink">
              Tele-MANAS National Mental Health Helpline (24x7 Free)
            </div>
            <p className="text-[11px] font-medium text-ink-secondary">
              Dial <strong className="text-rose-700">14416</strong> or <strong className="text-rose-700">1800-891-4416</strong> for confidential caregiver counseling in 11 North Eastern dialects.
            </p>
          </div>
        </div>
        <a
          href="tel:14416"
          className="btn-tactile rounded-xl border-2 border-black bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] cursor-pointer shrink-0"
        >
          Call 14416 Helpline
        </a>
      </div>

      {/* ZBI-12 Assessment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border-4 border-black bg-surface p-5 sm:p-7 shadow-[8px_8px_0px_#000] max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-black/15 pb-3 mb-4">
              <div>
                <span className="rounded-full bg-rose-100 text-rose-900 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border border-rose-300">
                  Standardized ZBI-12 Questionnaire
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-black text-ink mt-1">
                  Caregiver Burden Assessment
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-tactile rounded-xl border-2 border-black bg-surface hover:bg-surface-muted p-2 text-ink shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {ZBI_12_QUESTIONS.map((q, idx) => {
                const currentVal = answers[q.id] ?? 0;
                return (
                  <div
                    key={q.id}
                    className="rounded-2xl border-2 border-black/20 bg-white p-3.5 shadow-xs"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-black text-white">
                        {q.id}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-ink leading-relaxed">
                        {q.text}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mt-2">
                      {ANSWER_LABELS.map((opt) => {
                        const isSelected = currentVal === opt.val;
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, opt.val)}
                            className={`rounded-xl border-2 px-2 py-2 text-xs font-black transition-all cursor-pointer text-center ${
                              isSelected
                                ? "border-black bg-rose-600 text-white shadow-[2px_2px_0px_#000]"
                                : "border-black/20 bg-surface hover:bg-rose-50 text-ink"
                            }`}
                          >
                            <span className="block text-[10px] opacity-75">({opt.val})</span>
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex items-center justify-between border-t-2 border-black/15 pt-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-bold text-ink-secondary">Total Burden Score:</span>
                <span className="font-serif text-2xl font-black text-rose-700">
                  {evaluation.totalScore} / 48
                </span>
                <span className="text-xs font-bold text-ink">({evaluation.burdenCategory})</span>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-tactile rounded-xl border-2 border-black bg-tea px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-800 cursor-pointer"
              >
                Save & Apply Caregiver Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
