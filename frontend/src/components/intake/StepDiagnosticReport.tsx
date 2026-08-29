"use client";

import { useTranslations } from "next-intl";
import { FileUploadZone } from "./FileUploadZone";
import type { DiagnosticData, ClinicalDomains, SubscaleScore } from "@/types/intake";

interface StepDiagnosticReportProps {
  data: {
    file: File | null;
    fileName: string;
    extractedData: DiagnosticData | null;
    isProcessing: boolean;
    skipped: boolean;
  };
  errors: Record<string, string>;
  onFileSelect: (file: File | null) => void;
  onAnalyze: () => void;
  onSkip: () => void;
}

const CATEGORY_GROUPS: Record<string, string[]> = {
  categoryCognitive: [
    "memory", "attention", "executive_function", "orientation", "language", "visuospatial", "decision_making",
  ],
  categoryIadls: [
    "medication_management", "financial_management", "navigation", "meal_preparation", "driving", "household_tasks",
  ],
  categoryBehavioral: [
    "apathy", "agitation", "social_withdrawal", "sleep_disturbance",
  ],
};

const DOMAIN_ICONS: Record<string, string> = {
  categoryCognitive: "🧠",
  categoryIadls: "🏠",
  categoryBehavioral: "🌿",
};

const DOMAIN_LABELS: Record<string, string> = {
  memory: "Memory",
  attention: "Attention",
  executive_function: "Executive Function",
  orientation: "Orientation",
  language: "Language",
  visuospatial: "Visuospatial",
  decision_making: "Decision Making",
  medication_management: "Medication Mgmt",
  financial_management: "Financial Mgmt",
  navigation: "Navigation",
  meal_preparation: "Meal Preparation",
  driving: "Driving",
  household_tasks: "Household Tasks",
  apathy: "Apathy",
  agitation: "Agitation",
  social_withdrawal: "Social Withdrawal",
};

export function StepDiagnosticReport({
  data,
  errors,
  onFileSelect,
  onAnalyze,
  onSkip,
}: StepDiagnosticReportProps) {
  const t = useTranslations("intake.medical");
  const preview = data.file ? URL.createObjectURL(data.file) : undefined;
  const ext = data.extractedData;
  const domains: ClinicalDomains = ext?.domains || {};
  const subscales: Record<string, SubscaleScore> = ext?.subscaleScores || {};

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl md:text-3xl font-bold text-ink">
          {t("title")}
        </h2>
        <p className="text-ink-secondary text-base">
          {t("subtitle")}
        </p>
      </div>

      {!ext && (
        <FileUploadZone
          accept=".pdf"
          maxSizeMB={10}
          label={t("upload.label")}
          description={t("upload.desc")}
          onFileSelect={onFileSelect}
          currentFile={data.file}
          preview={preview}
          isProcessing={data.isProcessing}
        />
      )}

      {data.file && !ext && !data.isProcessing && (
        <button
          onClick={onAnalyze}
          className="w-full min-h-[56px] rounded-xl bg-marigold text-white border-3 border-border font-bold text-lg hover:bg-marigold-hover transition-colors"
        >
          {t("analyze")}
        </button>
      )}

      {ext && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink text-lg">{t("extracted")}</h3>
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border-2 border-border rounded-xl text-xs font-bold text-ink hover:bg-surface-muted shadow-[2px_2px_0_var(--color-border)] active:translate-y-0.5 transition-all cursor-pointer"
            >
              📄 {t("replace") || "Upload different file"}
            </button>
          </div>

          {/* ── Header Banner: Diagnosis + ICD-10 + Score ── */}
          <div className="border-3 border-[#16120E] rounded-2xl bg-white p-5 shadow-[4px_4px_0_#16120E] space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-black uppercase tracking-wider text-[#D4441C]">{t("diagnosis")}</span>
                <h3 className="text-xl md:text-2xl font-[family-name:var(--font-serif)] font-black text-[#16120E] leading-tight">
                  {ext.diagnosis || "Not Specified"}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {ext.icd10 && (
                    <span className="px-2 py-0.5 bg-[#E8E4DB] border border-[#16120E] rounded text-[10px] font-black text-[#16120E]">
                      ICD-10: {ext.icd10}
                    </span>
                  )}
                  {ext.dateOfDiagnosis && (
                    <span className="text-xs font-bold text-[#4A4036]">{ext.dateOfDiagnosis}</span>
                  )}
                </div>
                {(ext.examiningPhysician || ext.clinicOrHospital) && (
                  <p className="text-xs font-semibold text-[#4A4036] mt-1">
                    {ext.examiningPhysician}{ext.examiningPhysician && ext.clinicOrHospital ? " • " : ""}{ext.clinicOrHospital}
                  </p>
                )}
              </div>

              {/* Score Badge */}
              <div className="px-4 py-3 bg-[#FEF3C7] border-2 border-[#16120E] rounded-xl text-center shadow-[0_2px_0_#16120E] flex-shrink-0">
                <span className="text-[10px] font-black text-[#16120E] block uppercase">
                  {ext.testType || "MMSE"} {t("score")}
                </span>
                <span className="text-3xl font-black text-[#E66A00]">
                  {ext.score ?? "--"}
                  <span className="text-base text-[#4A4036]">/{ext.maxScore ?? 30}</span>
                </span>
                {ext.stage && (
                  <span className="block text-[10px] font-black text-[#C24E26] mt-0.5 uppercase">
                    {ext.stage}
                  </span>
                )}
              </div>
            </div>

            {/* Biomarker Chips */}
            {(ext.mtaScore || ext.fazekasGrade) && (
              <div className="border-t-2 border-[#D9CEBF] pt-3 flex flex-wrap gap-2">
                {ext.mtaScore && (
                  <span className="px-3 py-1 bg-[#F2ECE1] border border-[#16120E] rounded-lg text-xs font-bold text-[#16120E]">
                    🧬 MRI MTA: {ext.mtaScore}
                  </span>
                )}
                {ext.fazekasGrade && (
                  <span className="px-3 py-1 bg-[#F2ECE1] border border-[#16120E] rounded-lg text-xs font-bold text-[#16120E]">
                    🧬 Fazekas: {ext.fazekasGrade}
                  </span>
                )}
              </div>
            )}

            {/* Medications */}
            {ext.medications && ext.medications.length > 0 && (
              <div className="border-t-2 border-[#D9CEBF] pt-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#16120E]">
                  {t("activePrescriptions", { count: ext.medications.length })}
                </span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {ext.medications.map((med, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#F2ECE1] border border-[#16120E] rounded-lg text-xs font-bold text-[#16120E]"
                    >
                      💊 {med}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Physician Notes / Clinical Summary */}
            {ext.physicianNotes && (
              <div className="border-t-2 border-[#D9CEBF] pt-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#16120E]">
                  {t("clinicalSummary")}
                </span>
                <p className="text-sm text-[#4A4036] font-medium mt-1 leading-relaxed">
                  {ext.physicianNotes}
                </p>
              </div>
            )}
          </div>

          {/* ── Standardized Subscales Progress Grid ── */}
          {Object.keys(subscales).length > 0 && (
            <div className="border-3 border-[#16120E] rounded-2xl bg-white p-5 shadow-[4px_4px_0_#16120E]">
              <h4 className="font-[family-name:var(--font-serif)] font-black text-lg text-[#16120E] mb-3">
                {t("subscales")}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {Object.entries(subscales).map(([key, val]) => (
                  <div key={key} className="text-center bg-[#F8F5EE] border border-[#16120E] rounded-xl p-2">
                    <span className="text-[10px] font-black uppercase text-[#4F473D] block truncate">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-lg font-black text-[#16120E]">
                      {val.score}<span className="text-xs text-[#4A4036]">/{val.max}</span>
                    </span>
                    <div className="w-full bg-white h-2 rounded-full border border-[#16120E] overflow-hidden mt-1">
                      <div
                        className="h-full bg-[#D97706]"
                        style={{ width: `${val.max > 0 ? (val.score / val.max) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── 17-Domain Clinical Assessment Matrix ── */}
          {domains && Object.keys(domains).length > 0 && (
            <div className="border-3 border-border rounded-2xl bg-surface p-5 md:p-6 shadow-[4px_4px_0_var(--color-border)] space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-border-soft pb-3 gap-2">
                <div>
                  <h4 className="font-[family-name:var(--font-serif)] font-black text-xl text-ink">
                    {t("assessment") || "17-Domain Clinical Assessment"}
                  </h4>
                  <p className="text-xs font-semibold text-ink-secondary">
                    {t("assessmentDesc") || "Quantified cognitive & functional breakdown extracted by local AI"}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-tea" /> {t("intact") || "Intact"}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-marigold" /> Mild
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-terracotta" /> Moderate
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-brick" /> Severe
                  </span>
                </div>
              </div>

              {Object.entries(CATEGORY_GROUPS).map(([categoryKey, domainKeys]) => {
                const activeKeys = domainKeys.filter((k) => domains[k]);
                if (activeKeys.length === 0) return null;

                const categoryTitle = t(categoryKey as "categoryCognitive" | "categoryIadls" | "categoryBehavioral") || categoryKey;

                return (
                  <div key={categoryKey} className="space-y-3">
                    <h5 className="font-bold text-xs uppercase tracking-wider text-ink-secondary flex items-center gap-2">
                      <span>{DOMAIN_ICONS[categoryKey]} {categoryTitle}</span>
                      <span className="flex-1 h-[1px] bg-border-soft" />
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeKeys.map((key) => {
                        const item = domains[key];
                        const isImpaired = (item as unknown as { needs_help?: boolean; needsHelp?: boolean }).needs_help ?? (item as unknown as { needs_help?: boolean; needsHelp?: boolean }).needsHelp ?? false;
                        const rawLevel = (((item as unknown as { impairment_level?: string; impairmentLevel?: string }).impairment_level ?? (item as unknown as { impairment_level?: string; impairmentLevel?: string }).impairmentLevel ?? (isImpaired ? "Moderate" : "None"))).toLowerCase();
                        const dataScorePct = (item as unknown as { score_pct?: number; scorePct?: number }).score_pct ?? (item as unknown as { score_pct?: number; scorePct?: number }).scorePct;

                        let badgeColor = "bg-tea text-white";
                        let barColor = "bg-tea";
                        let badgeLabel = t("intact") || "Intact";

                        if (rawLevel.includes("severe")) {
                          badgeColor = "bg-brick text-white";
                          barColor = "bg-brick";
                          badgeLabel = "Severe";
                        } else if (rawLevel.includes("mod")) {
                          badgeColor = "bg-terracotta text-white";
                          barColor = "bg-terracotta";
                          badgeLabel = "Moderate";
                        } else if (rawLevel.includes("mild")) {
                          badgeColor = "bg-marigold text-white";
                          barColor = "bg-marigold";
                          badgeLabel = "Mild";
                        }

                        const scorePct =
                          dataScorePct !== undefined && dataScorePct !== null && Number.isFinite(dataScorePct)
                            ? Math.max(0, Math.min(100, dataScorePct))
                            : rawLevel.includes("severe")
                            ? 15
                            : rawLevel.includes("mod")
                            ? 40
                            : rawLevel.includes("mild")
                            ? 70
                            : 100;

                        const evidenceText = item.evidence && item.evidence !== "No evidence provided" && item.evidence !== "null" ? item.evidence : null;

                        return (
                          <div
                            key={key}
                            className="p-3.5 rounded-xl border-2 border-border bg-surface-muted/60 hover:bg-surface-muted transition-colors flex flex-col justify-between gap-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-bold text-xs uppercase tracking-wider text-ink">
                                {DOMAIN_LABELS[key] || key.replace(/_/g, " ")}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
                                {badgeLabel}
                              </span>
                            </div>

                            {/* Visual Retention Bar */}
                            <div className="w-full bg-surface h-2 rounded-full border border-border-soft overflow-hidden">
                              <div
                                className={`h-full ${barColor} transition-all duration-500`}
                                style={{ width: `${scorePct}%` }}
                              />
                            </div>

                            {/* Verbatim Clinical Quote */}
                            {evidenceText ? (
                              <p className="text-[11px] text-ink-secondary italic leading-relaxed border-l-2 border-border/40 pl-2 bg-white/40 p-1 rounded-r">
                                &ldquo;{evidenceText}&rdquo;
                              </p>
                            ) : (
                              <span className="text-[10px] text-ink-secondary/50 italic">
                                No clinical deficit noted in report
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!ext && (
        <button
          type="button"
          onClick={onSkip}
          className="w-full min-h-[56px] rounded-xl border-3 border-border-soft bg-surface text-ink-secondary font-bold text-lg hover:bg-surface-muted transition-colors cursor-pointer"
        >
          {t("skip")}
        </button>
      )}

      {errors.skipped && (
        <p role="alert" className="text-brick text-sm font-bold text-center">
          {errors.skipped}
        </p>
      )}
    </div>
  );
}
