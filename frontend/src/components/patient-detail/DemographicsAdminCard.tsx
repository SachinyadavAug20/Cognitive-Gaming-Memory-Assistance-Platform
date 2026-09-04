"use client";

import type { PatientDetailRecord } from "@/types";
import { User } from "lucide-react";
import { useTranslations } from "next-intl";

interface DemographicsAdminCardProps {
  patient: PatientDetailRecord;
  age?: number | null;
}

export function DemographicsAdminCard({ patient, age }: DemographicsAdminCardProps) {
  const t = useTranslations("patientDetail");
  return (
    <div className="scrapbook-card">
      <h2 className="flex items-center gap-2 font-[family-name:var(--font-serif)] font-bold text-xl text-ink mb-4">
        <User className="h-5 w-5 text-tea" />
        <span>{t("demographics.title")}</span>
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            {t("demographics.fullName")}
          </dt>
          <dd className="font-bold text-ink">{patient.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            {t("demographics.dobAge")}
          </dt>
          <dd className="font-bold text-ink">
            {patient.dob ? `${patient.dob} (${t("demographics.years", { age: age ?? 0 })})` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            {t("demographics.gender")}
          </dt>
          <dd className="font-bold text-ink capitalize">
            {patient.gender || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            {t("demographics.phone")}
          </dt>
          <dd className="font-bold text-ink">{patient.phone || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            {t("demographics.relationship")}
          </dt>
          <dd className="font-bold text-ink capitalize">
            {patient.relationship || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            {t("demographics.language")}
          </dt>
          <dd className="font-bold text-ink uppercase">
            {patient.preferredLanguage || t("demographics.languageFallback")}
          </dd>
        </div>
        {patient.culturalBackground && (
          <div className="sm:col-span-2 md:col-span-3 bg-surface-muted/50 p-3 rounded-xl border border-border-soft">
            <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
              {t("demographics.background")}
            </dt>
            <dd className="text-ink text-sm font-medium">
              {patient.culturalBackground}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}
