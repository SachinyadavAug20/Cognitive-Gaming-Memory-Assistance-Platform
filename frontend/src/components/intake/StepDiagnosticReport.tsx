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
  onFileSelect: (file: File) => void;
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
  sleep_disturbance: "Sleep Disturbance",
};

function severityColor(level: string): string {
  switch (level) {
    case "None": return "bg-tea text-white";
    case "Mild": return "bg-marigold text-white";
    case "Moderate": return "bg-terracotta text-white";
    case "Severe": return "bg-brick text-white";
    default: return "bg-gray-500 text-white";
  }
}

function barColor(needsHelp: boolean, level?: string): string {
  if (!needsHelp) return "bg-tea";
  switch (level) {
    case "Severe": return "bg-brick";
    case "Moderate": return "bg-terracotta";
    case "Mild": return "bg-marigold";
    default: return "bg-gray-500";
  }
}

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
              onClick={() => onFileSelect(data.file!)}
              className="text-sm text-sky font-bold hover:underline"
            >
              {t("replace")}
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
          {Object.keys(domains).length > 0 && (
            <div className="border-3 border-[#16120E] rounded-2xl bg-white p-5 shadow-[4px_4px_0_#16120E] space-y-5">
              <div className="flex items-center justify-between border-b-2 border-[#D9CEBF] pb-3">
                <div>
                  <h4 className="font-[family-name:var(--font-serif)] font-black text-xl text-[#16120E]">
                    {t("assessment")}
                  </h4>
                  <p className="text-xs font-semibold text-[#4A4036]">
                    {t("assessmentDesc")}
                  </p>
                </div>
                <div className="flex gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-[#1E5136]" /> {t("intact")}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-[#D97706]" /> Mild
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-[#C24E26]" /> Moderate
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-[#9B1C1C]" /> Severe
                  </span>
                </div>
              </div>

              {Object.entries(CATEGORY_GROUPS).map(([categoryKey, domainKeys]) => (
                <div key={categoryKey} className="space-y-2.5">
                  <h5 className="font-bold text-sm text-[#16120E] uppercase tracking-wide">
                    {DOMAIN_ICONS[categoryKey]} {t(categoryKey as "categoryCognitive" | "categoryIadls" | "categoryBehavioral")}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {domainKeys.map((key) => {
                      const item = domains[key];
                      if (!item) return null;
                      const isImpaired = item.needs_help;
                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-xl border-2 border-[#16120E] flex flex-col justify-between transition-all ${
                            isImpaired ? "bg-[#FDEEE9]" : "bg-[#EAF3EC]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs uppercase tracking-wider text-[#16120E]">
                              {DOMAIN_LABELS[key] || key.replace(/_/g, " ")}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black border border-[#16120E] flex-shrink-0 ${severityColor(item.impairment_level)}`}
                            >
                              {item.impairment_level || (isImpaired ? t("impaired") : t("intact"))}
                            </span>
                          </div>

                          {/* Performance Bar */}
                          <div className="w-full bg-white h-1.5 rounded-full border border-[#16120E] overflow-hidden my-2">
                            <div
                              className={`h-full ${barColor(isImpaired, item.impairment_level)}`}
                              style={{ width: `${Math.max(2, item.score_pct)}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-black text-[#4A4036] text-right">
                            {t("retained", { pct: item.score_pct.toString() })}
                          </span>

                          {item.evidence && (
                            <p className="text-[11px] text-[#4F473D] italic mt-1.5 leading-snug border-l-2 border-[#16120E]/40 pl-2">
                              &ldquo;{item.evidence}&rdquo;
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={onSkip}
        className="w-full min-h-[56px] rounded-xl border-3 border-border-soft bg-surface text-ink-secondary font-bold text-lg hover:bg-surface-muted transition-colors"
      >
        {ext ? t("continue") : t("skip")}
      </button>

      {errors.skipped && (
        <p role="alert" className="text-brick text-sm font-bold text-center">
          {errors.skipped}
        </p>
      )}
    </div>
  );
}
