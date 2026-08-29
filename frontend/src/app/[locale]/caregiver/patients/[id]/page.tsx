"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ageFromDob, type PatientSummary } from "@/types";

export default function CaregiverPatientDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [patient, setPatient] = useState<PatientSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let ignore = false;
    async function fetchPatient() {
      try {
        const data = await api.get<PatientSummary>(`/patients/${id}`);
        if (!ignore) setPatient(data);
      } catch {
        if (!ignore) setError(true);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    fetchPatient();
    return () => {
      ignore = true;
    };
  }, [id]);

  const age = patient ? ageFromDob(patient.dob) : null;

  return (
    <div className="min-h-screen pb-8">
      <div className="bg-ink border-b-4 border-border px-6 py-6">
        <div className="max-w-4xl mx-auto">
          <Link
            href="/caregiver"
            className="text-ink-inverse/60 hover:text-ink-inverse font-bold text-base transition-colors mb-3 inline-block"
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
            <div className="flex items-center gap-4 mt-2">
              <div className="w-16 h-16 rounded-full border-3 border-ink-inverse/20 bg-ink-secondary/20 flex items-center justify-center text-2xl text-ink-inverse font-bold shrink-0">
                {patient.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="font-[family-name:var(--font-serif)] font-bold text-2xl md:text-3xl text-ink-inverse">
                  {patient.name}
                </h1>
                <p className="text-ink-inverse/60 text-base">
                  Patient #{patient.id}
                  {age != null ? ` • Age ${age}` : ""}
                  {patient.languagePreference
                    ? ` • ${patient.languagePreference}`
                    : ""}
                </p>
              </div>
              <Link
                href={`/caregiver/patients/${patient.id}/card`}
                className="btn-tactile bg-marigold text-ink border-2 min-h-[52px] text-center shrink-0"
              >
                🖨 Print ID Card
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-8 space-y-8">
        {error && !loading && (
          <div
            role="alert"
            className="rounded-xl bg-brick-light border-2 border-brick p-6 text-brick font-bold text-center"
          >
            <p className="text-2xl mb-2">🙁</p>
            <p className="font-[family-name:var(--font-serif)] text-xl">
              Patient not found.
            </p>
            <p className="text-base mt-1">
              The patient may have been removed, or the link is invalid.
            </p>
          </div>
        )}

        {patient && (
          <div className="scrapbook-card">
            <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl text-ink mb-4">
              Profile
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-base">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
                  Patient ID
                </dt>
                <dd className="font-bold text-ink">{patient.id}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
                  Name
                </dt>
                <dd className="font-bold text-ink">{patient.name}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
                  Age
                </dt>
                <dd className="font-bold text-ink">
                  {age != null ? `${age} years` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
                  Preferred Language
                </dt>
                <dd className="font-bold text-ink">
                  {patient.languagePreference ?? "—"}
                </dd>
              </div>
            </dl>

            <div className="mt-6 pt-5 border-t-2 border-border-soft flex flex-col sm:flex-row gap-3">
              <Link
                href={`/caregiver/patients/${patient.id}/card`}
                className="btn-chunky btn-chunky-marigold btn-chunky-xl"
              >
                🖨 Print ID Card
              </Link>
              <span className="text-sm text-ink-secondary font-bold self-center">
                Generate the QR health card so the patient can scan in at a
                kiosk.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}