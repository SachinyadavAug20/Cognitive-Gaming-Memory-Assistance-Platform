"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api, getMediaUrl } from "@/lib/api";
import { AppHeader } from "@/components/layout/AppHeader";
import { ageFromDob, type PatientDetailRecord } from "@/types";

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

export default function CaregiverPatientDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [patient, setPatient] = useState<PatientDetailRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

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
      <AppHeader />
      {/* Header Banner */}
      <div className="bg-ink border-b-4 border-border px-4 py-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/caregiver"
            className="text-ink-inverse/60 hover:text-ink-inverse font-bold text-base transition-colors mb-4 inline-block"
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 mt-2">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl border-3 border-tea bg-tea/20 flex items-center justify-center text-3xl text-tea font-bold shrink-0 shadow-[2px_2px_0px_var(--color-tea)]">
                  {patient.name.charAt(0)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="font-[family-name:var(--font-serif)] font-bold text-2xl md:text-3xl text-ink-inverse">
                      {patient.name}
                    </h1>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide border ${stageStyle}`}>
                      {stage} Stage
                    </span>
                  </div>
                  <p className="text-ink-inverse/70 text-sm md:text-base mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span>Patient #{patient.id}</span>
                    {age != null && <span>• Age {age}</span>}
                    {patient.gender && <span>• {patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1)}</span>}
                    {patient.preferredLanguage && <span>• {patient.preferredLanguage.toUpperCase()}</span>}
                    {patient.relationship && <span>• Filled by {patient.relationship}</span>}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/caregiver/patients/${patient.id}/card`}
                  className="btn-chunky btn-chunky-marigold btn-chunky-xl"
                >
                  🖨 Print ID Card
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 mt-8 space-y-8">
        {error && !loading && (
          <div
            role="alert"
            className="rounded-2xl bg-brick-light border-3 border-brick p-8 text-brick font-bold text-center shadow-[4px_4px_0px_var(--color-brick)]"
          >
            <p className="text-4xl mb-2">🙁</p>
            <p className="font-[family-name:var(--font-serif)] text-2xl">
              Patient not found.
            </p>
            <p className="text-base mt-1 text-brick/80">
              The patient record may have been removed, or the link is invalid.
            </p>
          </div>
        )}

        {patient && (
          <>
            {/* Top Vitals & Clinical Snapshot Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Cognitive Score Card */}
              <div className="bg-surface rounded-2xl border-3 border-border p-4 shadow-[4px_4px_0px_var(--color-border)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
                    <span>Cognitive Score</span>
                    <span className="text-tea font-bold">{med?.testType ?? "MMSE"}</span>
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
                    Clinical Stage
                  </span>
                  <div className="text-xl md:text-2xl font-black text-ink mt-1 truncate">
                    {stage}
                  </div>
                </div>
                <div className="mt-2 text-xs font-bold text-ink-secondary bg-surface-muted px-2.5 py-1 rounded-lg border border-border-soft inline-block">
                  🎯 Game Level {med?.recommendedStartDifficulty ?? 1}
                </div>
              </div>

              {/* Biomarkers / Imaging */}
              <div className="bg-surface rounded-2xl border-3 border-border p-4 shadow-[4px_4px_0px_var(--color-border)] flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-ink-secondary">
                    Brain Biomarkers
                  </span>
                  <div className="space-y-1 mt-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-ink-secondary font-bold">MTA:</span>
                      <span className="font-bold text-ink">{med?.mtaScore ?? "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-secondary font-bold">Fazekas:</span>
                      <span className="font-bold text-ink">{med?.fazekasGrade ?? "—"}</span>
                    </div>
                  </div>
                </div>
                <div className="text-[11px] font-bold text-ink-secondary mt-1">
                  {med?.icd10 ? `ICD: ${med.icd10}` : "Biomarker baseline"}
                </div>
              </div>

              {/* QR Kiosk Status */}
              <div className="bg-surface rounded-2xl border-3 border-border p-4 shadow-[4px_4px_0px_var(--color-border)] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-secondary">
                    <span>QR Health Card</span>
                    <span className="inline-block w-2.5 h-2.5 rounded-full bg-tea animate-pulse" />
                  </div>
                  <div className="text-base font-bold text-tea mt-1">
                    ✓ Active & Ready
                  </div>
                </div>
                <Link
                  href={`/caregiver/patients/${patient.id}/card`}
                  className="text-xs font-bold text-marigold hover:underline mt-2 inline-flex items-center gap-1"
                >
                  View / Print Badge →
                </Link>
              </div>
            </div>

            {/* SECTION 1: Comprehensive Medical & Cognitive Record */}
            <div className="scrapbook-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border-soft pb-4 mb-5">
                <div>
                  <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink">
                    🩺 Medical & Clinical Profile
                  </h2>
                  <p className="text-sm text-ink-secondary mt-0.5">
                    Cognitive assessment, clinical diagnosis, and physician notes
                  </p>
                </div>
                {med?.diagnosis && (
                  <span className="px-3 py-1 rounded-xl bg-tea-light border-2 border-tea text-tea-dark font-bold text-sm">
                    {med.diagnosis}
                  </span>
                )}
              </div>

              <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm mb-6">
                <div className="bg-surface-muted/60 p-3 rounded-xl border border-border-soft">
                  <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
                    Diagnosis & ICD Code
                  </dt>
                  <dd className="font-bold text-ink">
                    {med?.diagnosis ?? "Cognitive Impairment Baseline"}{" "}
                    {med?.icd10 ? `(${med.icd10})` : ""}
                  </dd>
                </div>

                <div className="bg-surface-muted/60 p-3 rounded-xl border border-border-soft">
                  <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
                    Examining Physician
                  </dt>
                  <dd className="font-bold text-ink">
                    {med?.examiningPhysician || "Attending Physician"}
                  </dd>
                </div>

                <div className="bg-surface-muted/60 p-3 rounded-xl border border-border-soft">
                  <dt className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
                    Hospital / Clinic & Date
                  </dt>
                  <dd className="font-bold text-ink">
                    {med?.clinicOrHospital || "Civil Hospital"}{" "}
                    {med?.dateOfDiagnosis ? `• ${med.dateOfDiagnosis}` : ""}
                  </dd>
                </div>
              </dl>

              {/* Physician / LLM Clinical Summary */}
              {med?.llmSummary && (
                <div className="bg-canvas p-4 rounded-xl border-2 border-border-soft mb-6">
                  <h3 className="font-bold text-sm text-ink mb-1.5 flex items-center gap-2">
                    <span>📋</span> Clinical Summary & Caretaker Guidance:
                  </h3>
                  <p className="text-ink-secondary text-sm leading-relaxed">
                    {med.llmSummary}
                  </p>
                </div>
              )}

              {/* Prescribed Medications */}
              {med?.medications && med.medications.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-2">
                    Prescribed Medications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {med.medications.map((medItem, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted border-2 border-border-soft font-bold text-sm text-ink"
                      >
                        <span>💊</span> {medItem}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* MMSE Cognitive Subscales */}
              {subscales.length > 0 && (
                <div className="mb-6 pt-4 border-t-2 border-border-soft">
                  <h3 className="font-bold text-base text-ink mb-3">
                    Cognitive Subscale Breakdown ({med?.testType ?? "MMSE"})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {subscales.map((sub) => (
                      <div
                        key={sub.key}
                        className="bg-surface p-3 rounded-xl border-2 border-border-soft flex flex-col justify-between"
                      >
                        <div className="flex justify-between items-center text-xs font-bold text-ink mb-1.5">
                          <span className="truncate pr-2">{sub.label}</span>
                          <span className="text-tea shrink-0">
                            {sub.score} / {sub.max}
                          </span>
                        </div>
                        <div className="w-full bg-surface-muted h-2 rounded-full overflow-hidden border border-border-soft">
                          <div
                            className="bg-tea h-full rounded-full"
                            style={{ width: `${sub.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Impaired Domains & Primary Deficits */}
              {primaryDeficitsList.length > 0 && (
                <div className="pt-4 border-t-2 border-border-soft">
                  <h3 className="font-bold text-base text-ink mb-3">
                    Identified Deficits & Assistance Needs
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {primaryDeficitsList.map((d, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-surface-muted/50 border-2 border-border-soft text-sm flex items-start gap-3"
                      >
                        <span
                          className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase tracking-wider border shrink-0 ${getImpairmentBadgeStyle(
                            d.impairment_level
                          )}`}
                        >
                          {d.impairment_level}
                        </span>
                        <div>
                          <div className="font-bold text-ink capitalize">
                            {d.domain.replace(/_/g, " ")}
                          </div>
                          {d.evidence && (
                            <p className="text-xs text-ink-secondary mt-0.5">
                              {d.evidence}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Family & Loved Ones (Photo Cards Grid) */}
            <div className="scrapbook-card">
              <div className="flex items-center justify-between border-b-2 border-border-soft pb-4 mb-5">
                <div>
                  <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink">
                    🧑‍🤝‍🧑 Family Members & Care Network
                  </h2>
                  <p className="text-sm text-ink-secondary mt-0.5">
                    Recognized faces and personal caregiver notes for memory games
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-surface-muted border-2 border-border-soft text-ink font-bold text-sm">
                  {patient.familyMembers.length} Saved
                </span>
              </div>

              {patient.familyMembers.length === 0 ? (
                <div className="text-center py-8 text-ink-secondary text-sm">
                  No family members registered yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patient.familyMembers.map((member) => {
                    const photo = getMediaUrl(member.photoUrl);
                    return (
                      <div
                        key={member.id}
                        className="bg-surface rounded-xl border-3 border-border p-4 shadow-[3px_3px_0px_var(--color-border)] flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-3">
                          {photo ? (
                            <img
                              src={photo}
                              alt={member.name}
                              className="w-14 h-14 rounded-xl border-2 border-border object-cover shrink-0 bg-surface-muted"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl border-2 border-border bg-tea/20 text-tea font-bold flex items-center justify-center text-xl shrink-0">
                              {member.name.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-base text-ink truncate">
                              {member.name}
                            </h3>
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-surface-muted border border-border-soft text-xs font-bold text-ink-secondary uppercase tracking-wider mt-1">
                              {member.relation}
                            </span>
                          </div>
                        </div>

                        {member.notes && (
                          <p className="mt-3 text-xs text-ink-secondary bg-surface-muted/60 p-2.5 rounded-lg border border-border-soft leading-snug">
                            {member.notes}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 3: Familiar Places & Wayfinding Landmarks */}
            <div className="scrapbook-card">
              <div className="flex items-center justify-between border-b-2 border-border-soft pb-4 mb-5">
                <div>
                  <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink">
                    📍 Familiar Places & Landmarks
                  </h2>
                  <p className="text-sm text-ink-secondary mt-0.5">
                    Visual wayfinding cues and daily walking route memories
                  </p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-surface-muted border-2 border-border-soft text-ink font-bold text-sm">
                  {patient.familiarPlaces.length} Landmarks
                </span>
              </div>

              {patient.familiarPlaces.length === 0 ? (
                <div className="text-center py-8 text-ink-secondary text-sm">
                  No familiar places registered yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {patient.familiarPlaces.map((place) => {
                    const photo = getMediaUrl(place.photoUrl);
                    return (
                      <div
                        key={place.id}
                        className="bg-surface rounded-xl border-3 border-border p-4 shadow-[3px_3px_0px_var(--color-border)] flex flex-col justify-between"
                      >
                        <div className="flex items-start gap-3">
                          {photo ? (
                            <img
                              src={photo}
                              alt={place.name}
                              className="w-14 h-14 rounded-xl border-2 border-border object-cover shrink-0 bg-surface-muted"
                            />
                          ) : (
                            <div className="w-14 h-14 rounded-xl border-2 border-border bg-marigold/20 text-ink font-bold flex items-center justify-center text-2xl shrink-0">
                              {place.emoji || "🏠"}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-base text-ink leading-tight">
                              {place.name}
                            </h3>
                            {place.category && (
                              <span className="inline-block text-xs font-bold text-ink-secondary mt-1">
                                {place.emoji} {place.category}
                              </span>
                            )}
                          </div>
                        </div>

                        {place.description && (
                          <p className="mt-3 text-xs text-ink-secondary bg-surface-muted/60 p-2.5 rounded-lg border border-border-soft leading-snug">
                            {place.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SECTION 4: Life Story, Hobbies & Personalization */}
            <div className="scrapbook-card">
              <div className="border-b-2 border-border-soft pb-4 mb-5">
                <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink">
                  📖 Life Story & Cognitive Personalization
                </h2>
                <p className="text-sm text-ink-secondary mt-0.5">
                  Career, music, hobbies, and emotional calming cues
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                {/* Career & Hobbies */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1">
                      Occupation & Background
                    </h3>
                    <p className="font-bold text-ink text-base">
                      {life?.occupation || "Not specified"}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-1.5">
                      Favorite Music & Audio Cues
                    </h3>
                    <div className="bg-surface-muted/70 p-3 rounded-xl border border-border-soft text-sm text-ink font-medium">
                      🎵 {life?.favoriteMusic || "Traditional folk & gospel melodies"}
                    </div>
                  </div>

                  {life?.hobbies && life.hobbies.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-2">
                        Hobbies & Interests
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {life.hobbies.map((h, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-xl bg-terracotta-light text-terracotta border border-terracotta/30 text-xs font-bold"
                          >
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Joy Triggers Box */}
                <div>
                  <div className="rounded-2xl bg-marigold-light border-3 border-marigold p-5 shadow-[3px_3px_0px_var(--color-marigold)]">
                    <h3 className="font-[family-name:var(--font-serif)] font-bold text-base text-ink mb-2 flex items-center gap-2">
                      <span>🌟</span> Joy Triggers & Calming Cues
                    </h3>
                    <p className="text-ink text-sm leading-relaxed font-medium">
                      {patient.joyTriggers ||
                        "Listening to familiar church hymns, sitting in the morning sun, and looking at family photo albums."}
                    </p>
                    <div className="mt-3 pt-3 border-t border-marigold/30 text-[11px] font-bold text-ink-secondary">
                      💡 Tip: Use these topics to soothe agitation or prompt joyful recall during exercises.
                    </div>
                  </div>
                </div>
              </div>

              {/* Life Milestones Timeline */}
              {life?.lifeEvents && life.lifeEvents.length > 0 && (
                <div className="pt-4 border-t-2 border-border-soft">
                  <h3 className="font-bold text-base text-ink mb-4">
                    Key Life Milestones & Timeline
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    {life.lifeEvents.map((ev, idx) => (
                      <div
                        key={idx}
                        className="bg-surface-muted/60 p-3.5 rounded-xl border-2 border-border-soft flex flex-col justify-between"
                      >
                        <span className="text-xs font-black text-marigold-dark uppercase tracking-wider">
                          Year {ev.year}
                        </span>
                        <p className="font-bold text-sm text-ink mt-1">
                          {ev.event}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 5: Demographics & Administration */}
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
          </>
        )}
      </div>
    </div>
  );
}