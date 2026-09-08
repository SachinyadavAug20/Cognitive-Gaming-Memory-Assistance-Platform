"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Brain } from "lucide-react";
import { api } from "@/lib/api";
import { useTranslations } from "next-intl";
import { MemoryLightbox } from "@/components/ui/MemoryLightbox";
import { patientLangCode } from "@/lib/i18n";
import { speechRate } from "@/games/config";
import { ageFromDob, type PatientDetailRecord } from "@/types";
import { PatientHeroCard } from "@/components/patient-detail/PatientHeroCard";
import { PatientVitalsRow } from "@/components/patient-detail/PatientVitalsRow";
import { ClinicalSummaryCard } from "@/components/patient-detail/ClinicalSummaryCard";
import { FamilyNetworkCard } from "@/components/patient-detail/FamilyNetworkCard";
import { FamiliarPlacesCard } from "@/components/patient-detail/FamiliarPlacesCard";
import { PatientLifeStoryCard } from "@/components/patient-detail/PatientLifeStoryCard";
import { DemographicsAdminCard } from "@/components/patient-detail/DemographicsAdminCard";
import { getFallbackPatient } from "@/data/mockPatients";
import { DEMO_PATIENT_RECORD } from "@/data/demoPatient";

import { BiomarkerRadarChart } from "@/components/biomarkers/BiomarkerRadarChart";
import { TrajectoryHeatmap } from "@/components/biomarkers/TrajectoryHeatmap";
import { CognitiveGamingProgressCard } from "@/components/patient-detail/CognitiveGamingProgressCard";
import { CaregiverGameVerificationCard } from "@/components/patient-detail/CaregiverGameVerificationCard";
import { CaregiverCapsuleVaultCard } from "@/components/capsule/CaregiverCapsuleVaultCard";

function getStageBadgeStyle(stage?: string | null) {
  if (!stage) return "bg-surface-muted text-ink-secondary border-border-soft";
  const s = stage.toLowerCase();
  if (s.includes("mci") || s.includes("mild cognitive")) {
    return "bg-tea-light text-tea-dark border-tea";
  }
  if (s.includes("early")) {
    return "bg-marigold-light text-marigold-dark border-marigold";
  }
  if (s.includes("mod")) {
    return "bg-terracotta-light text-terracotta border-terracotta";
  }
  if (s.includes("sev")) {
    return "bg-brick-light text-brick border-brick";
  }
  return "bg-surface-muted text-ink border-border-soft";
}

function getImpairmentBadgeStyle(level?: string | null) {
  if (!level) return "bg-surface-muted text-ink-secondary border-border-soft";
  const l = level.toLowerCase();
  if (l === "severe") return "bg-brick-light text-brick border-brick";
  if (l === "moderate") return "bg-terracotta-light text-terracotta border-terracotta";
  if (l === "mild") return "bg-marigold-light text-marigold-dark border-marigold";
  return "bg-tea-light text-tea-dark border-tea";
}

export function CaregiverPatientDetailClient({ patientId }: { patientId?: string } = {}) {
  const t = useTranslations("patientDetail");
  const params = useParams<{ id?: string }>();
  const id = patientId || params?.id || "1";

  // 1. Immediately initialize with full patient record - zero waiting, zero infinite loading
  const [patient, setPatient] = useState<PatientDetailRecord>(() => {
    return getFallbackPatient(id);
  });
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState<{
    title: string;
    text?: string | null;
    photoUrl?: string | null;
  } | null>(null);

  useEffect(() => {
    let ignore = false;
    // Immediate fallback on mount / route change
    const fallback = getFallbackPatient(id);
    setPatient(fallback);
    setLoading(false);

    // Fast background sync with backend (1.5s max wait)
    async function syncPatient() {
      try {
        const fetchPromise = api.get<PatientDetailRecord>(`/patients/${id}`);
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 1500)
        );
        const data = await Promise.race([fetchPromise, timeoutPromise]);
        if (!ignore && data && data.name) {
          setPatient(data);
        }
      } catch {
        // Silently keep pre-rendered fallback
      }
    }

    syncPatient();
    return () => {
      ignore = true;
    };
  }, [id]);

  const age = patient ? ageFromDob(patient.dob) : null;
  const med = patient?.medicalProfile;
  const life = patient?.lifeStory;
  const stage = med?.clinicalStage ?? "MCI";
  const stageStyle = getStageBadgeStyle(stage);

  // Subscale scores list
  const subscales = med?.subscaleScores
    ? Object.entries(med.subscaleScores).map(([key, val]) => ({
        key,
        label: key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        score: val.score,
        max: val.max,
        pct: val.max > 0 ? Math.round((val.score / val.max) * 100) : 0,
      }))
    : [];

  // Parse deficits if string
  let primaryDeficitsList: Array<{ domain: string; impairment_level: string; evidence?: string; score_pct?: number }> = [];
  if (med?.primaryDeficits) {
    try {
      primaryDeficitsList = typeof med.primaryDeficits === "string"
        ? JSON.parse(med.primaryDeficits)
        : med.primaryDeficits;
    } catch {
      primaryDeficitsList = [];
    }
  }

  return (
    <div className="min-h-screen pb-16 bg-canvas paper-texture">
      {/* Patient Banner & Header */}
      <PatientHeroCard
        patient={patient}
        stage={stage}
        stageStyle={stageStyle}
        age={age}
        loading={loading}
      />

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8 space-y-8">
        {patient && (
          <>
            {/* Top Vitals & Clinical Snapshot Cards */}
            <PatientVitalsRow
              patientId={patient.id}
              med={med}
              stage={stage}
            />

            {/* SECTION 1: Comprehensive Medical & Cognitive Record */}
            <ClinicalSummaryCard
              med={med}
              subscales={subscales}
              primaryDeficitsList={primaryDeficitsList}
              getImpairmentBadgeStyle={getImpairmentBadgeStyle}
            />

            {/* SECTION: Continuous Neuropsychological Biomarkers & Motor Trajectory */}
            <div className="scrapbook-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border-soft pb-4 mb-5">
                <div>
                  <h2 className="flex items-center gap-2 font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink">
                    <Brain className="h-6 w-6 text-tea" />
                    <span>{t("biomarkers.title")}</span>
                  </h2>
                  <p className="text-sm text-ink-secondary mt-0.5">
                    {t("biomarkers.subtitle")}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-tea-light border-2 border-tea text-tea-dark font-bold text-sm">
                  {t("biomarkers.activeTelemetry")}
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                {/* 5-Axis Clinical Radar */}
                <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000]">
                  <BiomarkerRadarChart />
                </div>

                {/* Motor Trajectory Visualizer */}
                <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000]">
                  <TrajectoryHeatmap />
                </div>
              </div>
            </div>

            {/* SECTION: Cognitive Gaming Telemetry & Adaptive AI Progress */}
            <CognitiveGamingProgressCard patientId={patient.id} />

            {/* SECTION: Field Expert & Caregiver Game Verifications */}
            <CaregiverGameVerificationCard patientId={patient.id} />

            {/* FEATURE 1: Echoes of Home — Multi-Sensory Memory Capsules Vault */}
            <CaregiverCapsuleVaultCard
              patientId={patient.id}
              patientName={patient.name}
            />

            {/* SECTION 2: Family & Care Network */}
            <FamilyNetworkCard
              familyMembers={patient.familyMembers}
              onOpenLightbox={setLightbox}
            />

            {/* SECTION 3: Familiar Places & Wayfinding Landmarks */}
            <FamiliarPlacesCard
              familiarPlaces={patient.familiarPlaces}
              onOpenLightbox={setLightbox}
            />

            {/* SECTION 4: Life Story, Hobbies & Personalization */}
            <PatientLifeStoryCard
              life={life}
              joyTriggers={patient.joyTriggers}
            />

            {/* SECTION 5: Demographics & Administration */}
            <DemographicsAdminCard
              patient={patient}
              age={age}
            />
          </>
        )}

        <MemoryLightbox
          open={lightbox ? true : false}
          onClose={() => setLightbox(null)}
          photoUrl={lightbox?.photoUrl}
          title={lightbox?.title ?? ""}
          text={lightbox?.text}
          langCode={patientLangCode(patient?.preferredLanguage ?? null)}
          rate={speechRate(patient)}
          closeLabel={t("lightbox.close")}
          listenLabel={t("lightbox.listen")}
          speakingLabel={t("lightbox.speaking")}
        />
      </div>
    </div>
  );
}
