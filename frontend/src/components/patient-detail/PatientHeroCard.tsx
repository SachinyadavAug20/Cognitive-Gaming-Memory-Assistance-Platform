"use client";

import { Link } from "@/i18n/navigation";
import { ClinicalDossierExport } from "@/components/clinical/ClinicalDossierExport";
import { ClinicalReportExportModal } from "@/components/patient-detail/ClinicalReportExportModal";
import type { PatientDetailRecord } from "@/types";

interface PatientHeroCardProps {
  patient: PatientDetailRecord | null;
  stage: string;
  stageStyle: string;
  age?: number | null;
  loading: boolean;
}

export function PatientHeroCard({
  patient,
  stage,
  stageStyle,
  age,
  loading,
}: PatientHeroCardProps) {
  return (
    <div className="bg-ink border-b-4 border-border px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/caregiver"
          className="text-ink-inverse/60 hover:text-ink-inverse font-bold text-base transition-colors mb-4 inline-block"
        >
          ← Back to Dashboard
        </Link>

        {loading && (
          <div className="flex items-center gap-4 mt-2">
            <div className="w-16 h-16 rounded-full border-3 border-ink-inverse/20 bg-ink-secondary/20 flex items-center justify-center animate-pulse" />
            <div className="space-y-2 flex-1">
              <div className="h-7 w-48 bg-ink-secondary/30 rounded-lg animate-pulse" />
              <div className="h-4 w-64 bg-ink-secondary/20 rounded-lg animate-pulse" />
            </div>
          </div>
        )}

        {patient && (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mt-2">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl border-3 border-tea bg-tea/20 flex items-center justify-center text-3xl text-tea font-bold shrink-0 shadow-[2px_2px_0px_var(--color-tea)]">
                {patient.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-[family-name:var(--font-serif)] font-bold text-2xl md:text-3xl text-ink-inverse">
                    {patient.name}
                  </h1>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${stageStyle}`}>
                    {stage} Stage
                  </span>
                </div>
                <p className="text-ink-inverse/70 text-sm md:text-base mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Patient #{patient.id}</span>
                  {age != null && <span>• Age {age}</span>}
                  {patient.gender && <span>• {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}</span>}
                  {patient.preferredLanguage && <span>• {patient.preferredLanguage.toUpperCase()}</span>}
                  {patient.relationship && <span>• Filled by {patient.relationship}</span>}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <ClinicalReportExportModal patient={patient} age={age ?? null} stage={stage} />
              <ClinicalDossierExport patient={patient} age={age} />
              <Link
                href={`/caregiver/patients/${patient.id}/card`}
                className="btn-chunky btn-chunky-marigold btn-chunky-xl"
              >
                🖨 Print ID Card
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
