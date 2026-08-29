"use client";

import { useTranslations } from "next-intl";
import { ScrapbookCard } from "@/components/ui/ScrapbookCard";
import { ageFromDob, type PatientSummary } from "@/types";

interface PatientCardProps {
  patient: PatientSummary;
}

export function PatientCard({ patient }: PatientCardProps) {
  const t = useTranslations("caregiver");
  const age = ageFromDob(patient.dob);

  return (
    <ScrapbookCard className="!p-4 py-5 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform cursor-pointer">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-full border-3 border-border bg-surface-muted flex items-center justify-center text-lg font-bold shrink-0">
          {patient.name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-base text-ink truncate">{patient.name}</h3>
          <p className="text-ink-secondary text-xs">
            {age != null ? `${t("age", { age })}` : t("ageUnknown")}
            {patient.languagePreference
              ? ` • ${t("language")}: ${patient.languagePreference}`
              : ""}
          </p>
        </div>
        <span aria-hidden className="text-ink-secondary font-bold text-xl shrink-0">
          →
        </span>
      </div>
    </ScrapbookCard>
  );
}