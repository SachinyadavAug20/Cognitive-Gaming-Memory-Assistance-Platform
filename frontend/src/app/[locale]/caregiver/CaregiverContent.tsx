"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { PatientCard } from "@/components/caregiver/PatientCard";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { AudioToggle } from "@/components/ui/AudioToggle";
import { CreditCard } from "lucide-react";
import type { PatientSummary } from "@/types";

import { getAllPatientSummaries } from "@/data/mockPatients";

export function CaregiverContent() {
  const t = useTranslations("caregiver");

  // Immediately initialize with all patient summaries - zero loading delay
  const [patients, setPatients] = useState<PatientSummary[]>(() => getAllPatientSummaries());
  const [loading, setLoading] = useState(false);
  const [reloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function fetchPatients() {
      try {
        const fetchPromise = api.get<PatientSummary[]>("/patients");
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 1200)
        );
        const data = await Promise.race([fetchPromise, timeoutPromise]);
        if (!ignore && Array.isArray(data) && data.length > 0) {
          const localList = getAllPatientSummaries();
          const seenIds = new Set<number>();
          const seenNames = new Set<string>();
          const merged: PatientSummary[] = [];

          for (const p of [...data, ...localList]) {
            if (!p || !p.name) continue;
            const norm = p.name.trim().toLowerCase();
            if (seenIds.has(p.id) || seenNames.has(norm)) continue;
            seenIds.add(p.id);
            seenNames.add(norm);
            merged.push(p);
          }

          setPatients(merged);
        }
      } catch {
        // Silently retain pre-loaded patients
      }
    }
    fetchPatients();
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  return (
    <>
      <div className="bg-ink border-b-4 border-border px-4 py-2.5 md:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink-inverse">
              {t("title")}
            </h1>
            <p className="text-ink-inverse/60 text-xs mt-0.5">{t("subtitle")}</p>
          </div>
          <div className="flex items-center gap-3">
            <AudioToggle />
            <Link href="/caregiver/add-patient">
              <ChunkyButton variant="marigold" size="xl">
                {t("addPatient")}
              </ChunkyButton>
            </Link>
            <Link
              href="/"
              className="text-ink-inverse/60 hover:text-ink-inverse font-bold text-sm transition-colors"
            >
              ← {t("home")}
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-3 space-y-3 flex-1 overflow-y-auto md:overflow-y-hidden w-full">
        <div>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink mb-2">
            {t("yourPatients")}
          </h2>

          {patients.length === 0 ? (
            <div className="scrapbook-card text-center py-14">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-tea-light border-3 border-tea flex items-center justify-center text-tea">
                  <CreditCard className="h-8 w-8 stroke-[2.2]" />
                </div>
              </div>
              <p className="font-[family-name:var(--font-serif)] font-bold text-2xl text-ink mb-1">
                {t("emptyTitle")}
              </p>
              <p className="text-ink-secondary font-bold text-base">
                {t("emptyList")}
              </p>
              <div className="mt-6">
                <Link href="/caregiver/add-patient">
                  <ChunkyButton variant="marigold" size="xl">
                    {t("addPatient")}
                  </ChunkyButton>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3 flex gap-2 flex-col">
              {patients.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/caregiver/patients/${patient.id}`}
                >
                  <PatientCard patient={patient} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}