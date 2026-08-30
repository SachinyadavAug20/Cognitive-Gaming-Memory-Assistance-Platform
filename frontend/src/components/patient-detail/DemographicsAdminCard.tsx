"use client";

import type { PatientDetailRecord } from "@/types";

interface DemographicsAdminCardProps {
  patient: PatientDetailRecord;
  age?: number | null;
}

export function DemographicsAdminCard({ patient, age }: DemographicsAdminCardProps) {
  return (
    <div className="scrapbook-card">
      <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl text-ink mb-4">
        👤 Demographics & Registration Details
      </h2>
      <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            Full Legal Name
          </dt>
          <dd className="font-bold text-ink">{patient.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            Date of Birth & Age
          </dt>
          <dd className="font-bold text-ink">
            {patient.dob ? `${patient.dob} (${age} years)` : "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            Gender
          </dt>
          <dd className="font-bold text-ink capitalize">
            {patient.gender || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            Primary Phone Number
          </dt>
          <dd className="font-bold text-ink">{patient.phone || "—"}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            Relationship to Caregiver
          </dt>
          <dd className="font-bold text-ink capitalize">
            {patient.relationship || "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
            Preferred Language
          </dt>
          <dd className="font-bold text-ink uppercase">
            {patient.preferredLanguage || "EN"}
          </dd>
        </div>
        {patient.culturalBackground && (
          <div className="sm:col-span-2 md:col-span-3 bg-surface-muted/50 p-3 rounded-xl border border-border-soft">
            <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
              Cultural & Community Background
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
