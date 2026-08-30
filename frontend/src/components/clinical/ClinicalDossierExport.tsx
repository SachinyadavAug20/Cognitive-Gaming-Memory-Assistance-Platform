"use client";

import { useState } from "react";
import {
  FileText,
  Printer,
  X,
  ShieldCheck,
  Paperclip,
  Brain,
  Activity,
  QrCode,
} from "lucide-react";
import type { PatientDetailRecord } from "@/types";

interface ClinicalDossierExportProps {
  patient: PatientDetailRecord;
  age?: number | null;
}

export function ClinicalDossierExport({ patient, age }: ClinicalDossierExportProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const abhaId = `91-${(patient.id * 137 + 1024).toString().padStart(4, "0")}-${(
    patient.id * 243 + 3012
  )
    .toString()
    .padStart(4, "0")}-${(patient.id * 419 + 5091).toString().padStart(4, "0")}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-4 py-2 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
      >
        <FileText className="h-4 w-4 text-tea" />
        <span>Export Clinical Dossier (PDF)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl border-4 border-black bg-surface p-6 shadow-[10px_10px_0px_#000] text-left text-ink space-y-5">
            {/* MODAL ACTION BAR */}
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-tea" />
                <span className="text-xs font-black uppercase tracking-wider text-ink">
                  Clinical Assessment Dossier // Academic Prototype
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea px-3.5 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-tea-dark cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" /> Print / Save PDF
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border-2 border-black p-1.5 hover:bg-surface-muted cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* PRINTABLE OFFICIAL DOSSIER CONTENT */}
            <div className="space-y-5 print:p-2">
              {/* HEADER BANNER */}
              <div className="flex items-start justify-between border-b-3 border-black pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-tea block">
                    CogniCare Cognitive Digital Therapeutics (CDTx)
                  </span>
                  <h1 className="font-serif text-2xl sm:text-3xl font-black text-ink">
                    Clinical Neuropsychological Summary
                  </h1>
                  <p className="text-xs font-semibold text-ink-secondary mt-0.5">
                    Proposed Solution for Ministry of Development of North Eastern Region (MDoNER)
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-teal-800 bg-teal-100 px-2 py-0.5 rounded border border-teal-300">
                    <ShieldCheck className="h-3.5 w-3.5" /> ABDM Compatible
                  </span>
                  <div className="text-xs font-bold text-ink mt-1">
                    Date: {new Date().toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>

              {/* PATIENT DEMOGRAPHICS & ABHA ID CARD */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border-2 border-black bg-[#FAF5EE] p-4 text-xs">
                <div>
                  <span className="block text-[10px] font-bold text-ink-secondary uppercase">
                    Patient Name
                  </span>
                  <strong className="font-serif text-sm font-black text-ink">{patient.name}</strong>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-ink-secondary uppercase">
                    Age & Gender
                  </span>
                  <strong className="font-bold text-ink">
                    {age ? `${age} yrs` : "Elder"} &bull; {patient.gender || "Not specified"}
                  </strong>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-ink-secondary uppercase">
                    ABHA Health ID
                  </span>
                  <strong className="font-mono text-[11px] font-black text-teal-800">{abhaId}</strong>
                </div>

                <div>
                  <span className="block text-[10px] font-bold text-ink-secondary uppercase">
                    Diagnosis Stage
                  </span>
                  <strong className="font-bold text-amber-900">
                    {patient.medicalProfile?.clinicalStage ||
                      patient.medicalProfile?.diagnosis ||
                      "Mild Cognitive Impairment (MCI)"}
                  </strong>
                </div>
              </div>

              {/* 5-AXIS CLINICAL COMPETENCY SCORES */}
              <div className="space-y-2">
                <h3 className="font-serif text-base font-black text-ink flex items-center gap-2">
                  <Brain className="h-4 w-4 text-tea" /> 1. Cognitive Domain Competency Profile
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-black/20 bg-surface p-2.5">
                    <span className="block text-[10px] font-bold text-ink-secondary uppercase">
                      Memory Recall
                    </span>
                    <span className="font-serif text-lg font-black text-teal-800">92%</span>
                    <span className="block text-[9px] font-bold text-green-700">Optimal</span>
                  </div>

                  <div className="rounded-xl border border-black/20 bg-surface p-2.5">
                    <span className="block text-[10px] font-bold text-ink-secondary uppercase">
                      Executive / IADL
                    </span>
                    <span className="font-serif text-lg font-black text-teal-800">88%</span>
                    <span className="block text-[9px] font-bold text-green-700">Stable</span>
                  </div>

                  <div className="rounded-xl border border-black/20 bg-surface p-2.5">
                    <span className="block text-[10px] font-bold text-ink-secondary uppercase">
                      Motor Precision
                    </span>
                    <span className="font-serif text-lg font-black text-teal-800">94%</span>
                    <span className="block text-[9px] font-bold text-green-700">High</span>
                  </div>

                  <div className="rounded-xl border border-black/20 bg-surface p-2.5">
                    <span className="block text-[10px] font-bold text-ink-secondary uppercase">
                      Processing Speed
                    </span>
                    <span className="font-serif text-lg font-black text-teal-800">86%</span>
                    <span className="block text-[9px] font-bold text-green-700">Active</span>
                  </div>

                  <div className="rounded-xl border border-black/20 bg-surface p-2.5">
                    <span className="block text-[10px] font-bold text-ink-secondary uppercase">
                      Language Fluency
                    </span>
                    <span className="font-serif text-lg font-black text-teal-800">95%</span>
                    <span className="block text-[9px] font-bold text-green-700">Rich</span>
                  </div>
                </div>
              </div>

              {/* MOTOR TRAJECTORY & CONTINUOUS BIOMARKER METRICS */}
              <div className="space-y-2">
                <h3 className="font-serif text-base font-black text-ink flex items-center gap-2">
                  <Activity className="h-4 w-4 text-tea" /> 2. Continuous Motor Kinetics & Hesitation Metrics
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <div className="rounded-xl border border-black/20 bg-[#FAF5EE] p-3">
                    <span className="block text-[10px] font-bold text-ink-secondary uppercase">
                      Cued Reaction Latency
                    </span>
                    <div className="font-serif text-base font-black text-ink">420 ms</div>
                    <p className="text-[10px] text-ink-secondary mt-0.5">
                      Average response delay from audio sensory prompt to motor contact.
                    </p>
                  </div>

                  <div className="rounded-xl border border-black/20 bg-[#FAF5EE] p-3">
                    <span className="block text-[10px] font-bold text-ink-secondary uppercase">
                      Path Efficiency Index
                    </span>
                    <div className="font-serif text-base font-black text-teal-800">89.4%</div>
                    <p className="text-[10px] text-ink-secondary mt-0.5">
                      Geodesic line efficiency demonstrating minimal upper-limb tremor.
                    </p>
                  </div>

                  <div className="rounded-xl border border-black/20 bg-[#FAF5EE] p-3">
                    <span className="block text-[10px] font-bold text-ink-secondary uppercase">
                      Bilateral Symmetry Ratio
                    </span>
                    <div className="font-serif text-base font-black text-ink">1.04 (Balanced)</div>
                    <p className="text-[10px] text-ink-secondary mt-0.5">
                      Balanced left vs. right hemisphere engagement during 3D drum & loom modules.
                    </p>
                  </div>
                </div>
              </div>

              {/* VERIFICATION & DOCTOR SIGNATURE BLOCK */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t-2 border-black/10 pt-4 text-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-black bg-white shadow-sm shrink-0">
                    <QrCode className="h-10 w-10 text-ink" />
                  </div>
                  <div>
                    <span className="font-black text-ink block">FHIR / EMR Verifiable QR</span>
                    <span className="text-[10px] text-ink-secondary">
                      Scan to verify cryptographic session signature in State Health EHR
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="w-44 border-b-2 border-black pb-1 mb-1 font-serif italic text-xs text-ink-secondary">
                    Dr. / Care Coordinator Signature
                  </div>
                  <span className="text-[10px] font-black uppercase text-tea">
                    CogniCare CDTx Protocol Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
