"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { AlertCircle, Brain } from "lucide-react";
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

// Lazy-loaded below-fold telemetry widgets (recharts / canvas-heavy)
const BiomarkerRadarChart = dynamic(
  () => import("@/components/biomarkers/BiomarkerRadarChart").then((m) => m.BiomarkerRadarChart),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);
const TrajectoryHeatmap = dynamic(
  () => import("@/components/biomarkers/TrajectoryHeatmap").then((m) => m.TrajectoryHeatmap),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);
const CognitiveGamingProgressCard = dynamic(
  () =>
    import("@/components/patient-detail/CognitiveGamingProgressCard").then(
      (m) => m.CognitiveGamingProgressCard
    ),
  {
    ssr: false,
    loading: () => <ChartSkeleton />,
  }
);

function ChartSkeleton() {
  const t = useTranslations("patientDetail");
  return (
    <div className="w-full h-40 rounded-2xl bg-surface-muted animate-pulse border-2 border-black/10 flex items-center justify-center text-xs font-black text-ink-secondary">
      {t("loading")}
    </div>
  );
}

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

export function CaregiverPatientDetailClient() {
  const t = useTranslations("patientDetail");
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [patient, setPatient] = useState<PatientDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lightbox, setLightbox] = useState<{
    title: string;
    text?: string | null;
    photoUrl?: string | null;
  } | null>(null);

  useEffect(() => {
    let ignore = false;
    async function fetchPatient() {
      try {
        const data = await api.get<PatientDetailRecord>(`/patients/${id}`);
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
        {error && !loading && (
          <div
            role="alert"
            className="rounded-2xl bg-brick-light border-3 border-brick p-8 text-brick font-bold text-center shadow-[4px_4px_0px_var(--color-brick)]"
          >
            <AlertCircle className="h-12 w-12 text-brick mx-auto mb-3" />
            <p className="font-[family-name:var(--font-serif)] text-2xl">
              {t("notFound.title")}
            </p>
            <p className="text-base mt-1 text-brick/80">
              {t("notFound.desc")}
            </p>
          </div>
        )}

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
