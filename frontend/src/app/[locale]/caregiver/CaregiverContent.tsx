"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { PatientCard } from "@/components/caregiver/PatientCard";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { useTranslations } from "next-intl";
import { api } from "@/lib/api";
import { AudioToggle } from "@/components/ui/AudioToggle";
import { CreditCard, FileText, BookOpen, ExternalLink, ShieldCheck } from "lucide-react";
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
            <Link
              href="/clinical-evidence"
              className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-white/30 bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-black text-white shadow-xs"
              title="Clinical Evidence & Neuropsychological R&D Dossier"
            >
              <FileText className="h-4 w-4 text-amber-300" />
              <span className="hidden sm:inline">Clinical R&D</span>
            </Link>
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

          {/* Evidence-Based Clinical Guidance for Caregivers */}
          <div className="mt-8 rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-tea-light border-2 border-black flex items-center justify-center text-tea">
                  <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base text-ink">
                    Evidence-Based Clinical Guidelines for Caregivers
                  </h3>
                  <p className="text-[11px] text-ink-secondary">
                    Peer-reviewed non-pharmacological care protocols &amp; distress reduction
                  </p>
                </div>
              </div>

              <Link
                href="/clinical-evidence"
                className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea px-3 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-900 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>SaMD R&amp;D Dossier</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-1">
                <span className="font-bold text-tea text-[11px] uppercase">Zarit Burden (ZBI-12)</span>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Validated scale for caregiver emotional strain. Scores &gt;17 predict high burnout risk.
                </p>
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/11574710/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-tea text-[10px] hover:underline"
                >
                  <span>Bédard 2001 (PMID: 11574710)</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-1">
                <span className="font-bold text-emerald-800 text-[11px] uppercase">NIH StatPearls Care</span>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Never argue or confront delusions; validate emotional feelings and gently redirect.
                </p>
                <a
                  href="https://www.ncbi.nlm.nih.gov/books/NBK557444/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-emerald-800 text-[10px] hover:underline"
                >
                  <span>Emmady 2022 (NBK557444)</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-1">
                <span className="font-bold text-indigo-800 text-[11px] uppercase">ASHA Practice Portal</span>
                <p className="text-[11px] text-stone-600 leading-snug">
                  Responsive behaviors express unmet needs (hunger, fear, pain). Use visual aids.
                </p>
                <a
                  href="https://www.asha.org/practice-portal/clinical-topics/dementia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-indigo-800 text-[10px] hover:underline"
                >
                  <span>ASHA Guidelines (2023)</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-1">
                <span className="font-bold text-purple-800 text-[11px] uppercase">Lancet Commission</span>
                <p className="text-[11px] text-stone-600 leading-snug">
                  45% of dementia cases prevented or delayed by addressing 14 lifestyle risk factors.
                </p>
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/39096926/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-purple-800 text-[10px] hover:underline"
                >
                  <span>Livingston 2024 (PMID: 39096926)</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}