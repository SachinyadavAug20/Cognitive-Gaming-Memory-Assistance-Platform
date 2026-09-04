"use client";

import type { MedicalProfileData } from "@/types";
import { Stethoscope, ClipboardList, Pill } from "lucide-react";
import { useTranslations } from "next-intl";

interface SubscaleDisplayItem {
  key: string;
  label: string;
  score: number;
  max: number;
  pct: number;
}

interface DeficitDisplayItem {
  domain: string;
  impairment_level: string;
  evidence?: string | null;
}

interface ClinicalSummaryCardProps {
  med: MedicalProfileData | null | undefined;
  subscales: SubscaleDisplayItem[];
  primaryDeficitsList: DeficitDisplayItem[];
  getImpairmentBadgeStyle: (level: string) => string;
}

export function ClinicalSummaryCard({
  med,
  subscales,
  primaryDeficitsList,
  getImpairmentBadgeStyle,
}: ClinicalSummaryCardProps) {
  const t = useTranslations("patientDetail");

  return (
    <div className="scrapbook-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border-soft pb-4 mb-5">
        <div>
          <h2 className="flex items-center gap-2 font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink">
            <Stethoscope className="h-6 w-6 text-tea" />
            <span>{t("clinicalSummary.title")}</span>
          </h2>
          <p className="text-sm text-ink-secondary mt-0.5">
            {t("clinicalSummary.subtitle")}
          </p>
        </div>
        {med?.diagnosis && (
          <span className="px-3 py-1 rounded-xl bg-tea-light border-2 border-tea text-tea-dark font-bold text-sm">
            {med.diagnosis}
          </span>
        )}
      </div>

      <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-6">
        <div className="bg-surface-muted/60 p-3 rounded-xl border border-border-soft">
          <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            {t("clinicalSummary.diagnosisIcd")}
          </dt>
          <dd className="font-bold text-ink">
            {med?.diagnosis ?? t("clinicalSummary.diagnosisFallback")}{" "}
            {med?.icd10 ? `(${med.icd10})` : ""}
          </dd>
        </div>

        <div className="bg-surface-muted/60 p-3 rounded-xl border border-border-soft">
          <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            {t("clinicalSummary.physician")}
          </dt>
          <dd className="font-bold text-ink">
            {med?.examiningPhysician || t("clinicalSummary.physicianFallback")}
          </dd>
        </div>

        <div className="bg-surface-muted/60 p-3 rounded-xl border border-border-soft">
          <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            {t("clinicalSummary.hospitalDate")}
          </dt>
          <dd className="font-bold text-ink">
            {med?.clinicOrHospital || t("clinicalSummary.hospitalFallback")}{" "}
            {med?.dateOfDiagnosis ? `• ${med.dateOfDiagnosis}` : ""}
          </dd>
        </div>
      </dl>

      {/* Physician / LLM Clinical Summary */}
      {med?.llmSummary && (
        <div className="bg-canvas p-4 rounded-xl border-2 border-border-soft mb-6">
          <h3 className="font-bold text-sm text-ink mb-1.5 flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-tea" />
            <span>{t("clinicalSummary.summaryHeading")}</span>
          </h3>
          <p className="text-ink-secondary text-sm leading-relaxed">
            {med.llmSummary}
          </p>
        </div>
      )}

      {/* Prescribed Medications */}
      {med?.medications && med.medications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-2">
            {t("clinicalSummary.medications")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {med.medications.map((medItem, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted border-2 border-border-soft font-bold text-sm text-ink"
              >
                <Pill className="h-4 w-4 text-tea shrink-0" />
                <span>{medItem}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* MMSE Cognitive Subscales */}
      {subscales.length > 0 && (
        <div className="mb-6 pt-4 border-t-2 border-border-soft">
          <h3 className="font-bold text-base text-ink mb-3">
            {t("clinicalSummary.subscaleBreakdown")} ({med?.testType ?? "MMSE"})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {subscales.map((sub) => (
              <div
                key={sub.key}
                className="bg-surface p-3 rounded-xl border-2 border-border-soft flex flex-col justify-between"
              >
                <div className="flex justify-between items-center text-xs font-bold text-ink mb-1.5">
                  <span className="truncate pr-2">{sub.label}</span>
                  <span className="text-tea shrink-0">
                    {sub.score} / {sub.max}
                  </span>
                </div>
                <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden border border-border-soft">
                  <div
                    className="bg-tea h-full rounded-full"
                    style={{ width: `${sub.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Impaired Domains & Primary Deficits */}
      {primaryDeficitsList.length > 0 && (
        <div className="pt-4 border-t-2 border-border-soft">
          <h3 className="font-bold text-base text-ink mb-3">
            {t("clinicalSummary.deficits")}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {primaryDeficitsList.map((d, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-surface-muted/50 border-2 border-border-soft text-sm flex items-start gap-3"
              >
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border shrink-0 ${getImpairmentBadgeStyle(
                    d.impairment_level
                  )}`}
                >
                  {d.impairment_level}
                </span>
                <div>
                  <div className="font-bold text-ink capitalize">
                    {d.domain.replace(/_/g, " ")}
                  </div>
                  {d.evidence && (
                    <p className="text-xs text-ink-secondary mt-0.5">
                      {d.evidence}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
