"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import type { MedicalProfileData } from "@/types";
import { Target, Check, ArrowRight } from "lucide-react";

interface PatientVitalsRowProps {
  patientId: number;
  med: MedicalProfileData | null | undefined;
  stage: string;
}

export function PatientVitalsRow({ patientId, med, stage }: PatientVitalsRowProps) {
  const t = useTranslations("patientDetail");

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {/* Cognitive Score Card */}
      <div className="bg-surface rounded-2xl border-3 border-border p-4 shadow-[4px_4px_0px_var(--color-border)] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            <span>{t("vitals.cognitiveScore")}</span>
            <span className="text-tea font-bold">{med?.testType ?? t("vitals.mmse")}</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl md:text-4xl font-black text-ink">
              {med?.mmseScore ?? "—"}
            </span>
            <span className="text-lg font-bold text-ink-secondary">
              / {med?.maxScore ?? 30}
            </span>
          </div>
        </div>
        {med?.mmseScore != null && (
          <div className="mt-3">
            <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden border border-border-soft">
              <div
                className="bg-tea h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, Math.round(((med.mmseScore) / (med.maxScore ?? 30)) * 100))}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Stage & Game Baseline */}
      <div className="bg-surface rounded-2xl border-3 border-border p-4 shadow-[4px_4px_0px_var(--color-border)] flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ink-secondary">
            {t("vitals.clinicalStage")}
          </span>
          <div className="text-xl md:text-2xl font-black text-ink mt-1 truncate">
            {stage}
          </div>
        </div>
        <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-ink-secondary bg-surface-muted px-2.5 py-1 rounded-lg border border-border-soft">
          <Target className="h-3.5 w-3.5 text-tea" />
          <span>{t("vitals.gameLevel", { difficulty: med?.recommendedStartDifficulty ?? 1 })}</span>
        </div>
      </div>

      {/* Biomarkers / Imaging */}
      <div className="bg-surface rounded-2xl border-3 border-border p-4 shadow-[4px_4px_0px_var(--color-border)] flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ink-secondary">
            {t("vitals.brainBiomarkers")}
          </span>
          <div className="space-y-1 mt-1 text-sm">
            <div className="flex justify-between">
              <span className="text-ink-secondary font-bold">{t("vitals.mta")}</span>
              <span className="font-bold text-ink">{med?.mtaScore ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ink-secondary font-bold">{t("vitals.fazekas")}</span>
              <span className="font-bold text-ink">{med?.fazekasGrade ?? "—"}</span>
            </div>
          </div>
        </div>
        <div className="text-[11px] font-bold text-ink-secondary mt-1">
          {med?.icd10 ? med.icd10 : t("vitals.biomarkerBaseline")}
        </div>
      </div>

      {/* QR Kiosk Status */}
      <div className="bg-surface rounded-2xl border-3 border-border p-4 shadow-[4px_4px_0px_var(--color-border)] flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-secondary">
            <span>{t("vitals.qrHealthCard")}</span>
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-tea animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5 text-base font-bold text-tea mt-1">
            <Check className="h-4 w-4" />
            <span>{t("vitals.activeReady")}</span>
          </div>
        </div>
        <Link
          href={`/caregiver/patients/${patientId}/card`}
          className="text-xs font-bold text-marigold hover:underline mt-2 inline-flex items-center gap-1"
        >
          <span>{t("vitals.viewPrintBadge")}</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
