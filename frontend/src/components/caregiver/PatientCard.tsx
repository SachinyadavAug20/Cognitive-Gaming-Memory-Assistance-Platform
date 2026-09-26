"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { ScrapbookCard } from "@/components/ui/ScrapbookCard";
import { ageFromDob, type PatientSummary } from "@/types";

interface PatientCardProps {
  patient: PatientSummary;
}

export function PatientCard({ patient }: PatientCardProps) {
  const t = useTranslations("caregiver");
  const age = ageFromDob(patient.dob);

  return (
    <ScrapbookCard className="!p-3.5 sm:!p-4 py-4 hover:translate-x-[-2px] hover:translate-y-[-2px] transition-transform cursor-pointer">
      <div className="flex items-center gap-3 sm:gap-3.5 flex-1 min-w-0">
        <div className="w-12 h-12 rounded-2xl border-2 border-black bg-surface-muted flex items-center justify-center text-lg font-bold shrink-0 shadow-[2px_2px_0px_#000] overflow-hidden">
          {patient.photoUrl ? (
            <Image
              src={patient.photoUrl}
              alt={patient.name}
              width={48}
              height={48}
              sizes="48px"
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-tea font-serif font-black">{patient.name.charAt(0)}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-serif font-black text-base sm:text-lg text-ink truncate leading-tight">
            {patient.name}
          </h3>
          <p className="text-ink-secondary text-xs mt-0.5 font-bold">
            {age != null ? `${t("age", { age })}` : t("ageUnknown")}
            {patient.languagePreference
              ? ` • ${t("language")}: ${patient.languagePreference}`
              : ""}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-ink-secondary stroke-[2.5] shrink-0" />
      </div>
    </ScrapbookCard>
  );
}