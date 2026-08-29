"use client";

import { useTranslations } from "next-intl";
import type { DiagnosticData } from "@/types/intake";

interface DiagnosisBannerProps {
  data: DiagnosticData;
}

export function DiagnosisBanner({ data }: DiagnosisBannerProps) {
  const t = useTranslations("intake.medical");

  return (
    <div className="border-3 border-ink rounded-2xl bg-surface p-5 shadow-[4px_4px_0_var(--color-border)] space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <span className="text-xs font-black uppercase tracking-wider text-terracotta">
            {t("diagnosis")}
          </span>
          <h3 className="text-xl md:text-2xl font-[family-name:var(--font-serif)] font-black text-ink leading-tight">
            {data.diagnosis || "Not Specified"}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {data.icd10 && (
              <span className="px-2 py-0.5 bg-surface-cream border border-ink rounded text-[10px] font-black text-ink">
                ICD-10: {data.icd10}
              </span>
            )}
            {data.dateOfDiagnosis && (
              <span className="text-xs font-bold text-ink-secondary">{data.dateOfDiagnosis}</span>
            )}
          </div>
          {(data.examiningPhysician || data.clinicOrHospital) && (
            <p className="text-xs font-semibold text-ink-secondary mt-1">
              {data.examiningPhysician}
              {data.examiningPhysician && data.clinicOrHospital ? " • " : ""}
              {data.clinicOrHospital}
            </p>
          )}
        </div>

        {/* Score Badge */}
        <div className="px-4 py-3 bg-cream border-2 border-ink rounded-xl text-center shadow-[0_2px_0_var(--color-border)] flex-shrink-0">
          <span className="text-[10px] font-black text-ink block uppercase">
            {data.testType || "MMSE"} {t("score")}
          </span>
          <span className="text-3xl font-black text-marigold">
            {data.score ?? "--"}
            <span className="text-base text-ink-secondary">/{data.maxScore ?? 30}</span>
          </span>
          {data.stage && (
            <span className="block text-[10px] font-black text-terracotta-deep mt-0.5 uppercase">
              {data.stage}
            </span>
          )}
        </div>
      </div>

      {/* Biomarker Chips */}
      {(data.mtaScore || data.fazekasGrade) && (
        <div className="border-t-2 border-border-soft pt-3 flex flex-wrap gap-2">
          {data.mtaScore && (
            <span className="px-3 py-1 bg-warm-surface border border-ink rounded-lg text-xs font-bold text-ink">
              🧬 MRI MTA: {data.mtaScore}
            </span>
          )}
          {data.fazekasGrade && (
            <span className="px-3 py-1 bg-warm-surface border border-ink rounded-lg text-xs font-bold text-ink">
              🧬 Fazekas: {data.fazekasGrade}
            </span>
          )}
        </div>
      )}

      {/* Medications */}
      {data.medications && data.medications.length > 0 && (
        <div className="border-t-2 border-border-soft pt-3">
          <span className="text-xs font-black uppercase tracking-wider text-ink">
            {t("activePrescriptions", { count: data.medications.length })}
          </span>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {data.medications.map((med, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-warm-surface border border-ink rounded-lg text-xs font-bold text-ink"
              >
                💊 {med}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Clinical Summary */}
      {data.physicianNotes && (
        <div className="border-t-2 border-border-soft pt-3">
          <span className="text-xs font-black uppercase tracking-wider text-ink">
            {t("clinicalSummary")}
          </span>
          <p className="text-sm text-ink-secondary font-medium mt-1 leading-relaxed">
            {data.physicianNotes}
          </p>
        </div>
      )}
    </div>
  );
}
