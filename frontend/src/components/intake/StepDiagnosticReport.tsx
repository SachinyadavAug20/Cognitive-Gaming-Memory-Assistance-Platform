"use client";

import { useCallback, useState } from "react";
import { FileUploadZone } from "./FileUploadZone";
import { SCORE_TYPE_OPTIONS, SCORE_MAX } from "@/types/intake";
import type { DiagnosticData, ClinicalDomains } from "@/types/intake";

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
  onEditField: (field: string, value: string) => void;
}

const CATEGORY_GROUPS: Record<string, string[]> = {
  "🧠 Cognitive Functions": [
    "memory", "attention", "executive_function", "orientation", "language", "visuospatial", "decision_making",
  ],
  "🏠 Activities of Daily Living (IADLs)": [
    "medication_management", "financial_management", "navigation", "meal_preparation", "driving", "household_tasks",
  ],
  "🌿 Behavioral & Mood Markers": [
    "apathy", "agitation", "social_withdrawal", "sleep_disturbance",
  ],
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

export function StepDiagnosticReport({
  data,
  errors,
  onFileSelect,
  onAnalyze,
  onSkip,
  onEditField,
}: StepDiagnosticReportProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleEdit = useCallback((field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  }, []);

  const handleSave = useCallback(
    (field: string) => {
      onEditField(field, editValue);
      setEditingField(null);
    },
    [editValue, onEditField]
  );

  const preview = data.file ? URL.createObjectURL(data.file) : undefined;
  const domains: ClinicalDomains = data.extractedData?.domains || {};

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <h2 className="font-[family-name:var(--font-serif)] text-2xl md:text-3xl font-bold text-ink">
          Diagnostic Report
        </h2>
        <p className="text-ink-secondary text-base">
          Upload any medical report. Our AI will read it and fill in the medical details for you.
        </p>
      </div>

      {!data.extractedData && (
        <FileUploadZone
          accept=".pdf"
          maxSizeMB={10}
          label="Drop PDF here or click to browse"
          description="Upload the patient's diagnostic report (MMSE, MoCA, or similar)"
          onFileSelect={onFileSelect}
          currentFile={data.file}
          preview={preview}
          isProcessing={data.isProcessing}
        />
      )}

      {data.file && !data.extractedData && !data.isProcessing && (
        <button
          onClick={onAnalyze}
          className="w-full min-h-[56px] rounded-xl bg-marigold text-white border-3 border-border font-bold text-lg hover:bg-marigold-hover transition-colors"
        >
          Analyze Report
        </button>
      )}

      {data.extractedData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink text-lg">Extracted Information</h3>
            <button
              onClick={() => onFileSelect(data.file!)}
              className="text-sm text-sky font-bold hover:underline"
            >
              Upload different file
            </button>
          </div>

          {/* Core Diagnosis Card */}
          <div className="border-3 border-[#16120E] rounded-2xl bg-white p-5 shadow-[4px_4px_0_#16120E] space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-black uppercase tracking-wider text-[#D4441C]">Diagnosis</span>
                <h3 className="text-2xl font-[family-name:var(--font-serif)] font-black text-[#16120E] truncate">
                  {data.extractedData.diagnosis || "Not Specified"}
                </h3>
                <p className="text-sm font-bold text-[#4A4036] mt-0.5">
                  Date: {data.extractedData.diagnosisDate || "Recent"}
                </p>
              </div>
              <div className="px-4 py-2 bg-[#FEF3C7] border-2 border-[#16120E] rounded-xl text-center shadow-[0_2px_0_#16120E] flex-shrink-0 ml-3">
                <span className="text-xs font-black text-[#16120E] block">
                  {data.extractedData.cognitiveScoreType || "MMSE"} Score
                </span>
                <span className="text-2xl font-black text-[#E66A00]">
                  {data.extractedData.cognitiveScore ?? "--"}
                  <span className="text-sm text-[#4A4036]">
                    /{SCORE_MAX[data.extractedData.cognitiveScoreType] || 30}
                  </span>
                </span>
              </div>
            </div>

            {data.extractedData.medications && data.extractedData.medications.length > 0 && (
              <div className="border-t-2 border-[#D9CEBF] pt-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#16120E]">
                  Active Prescriptions
                </span>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {data.extractedData.medications.map((med, idx) => (
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

            {data.extractedData.physicianNotes && (
              <div className="border-t-2 border-[#D9CEBF] pt-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#16120E]">
                  Clinical &amp; Imaging Notes
                </span>
                <p className="text-sm text-[#4A4036] font-medium mt-1 leading-relaxed">
                  {data.extractedData.physicianNotes}
                </p>
              </div>
            )}
          </div>

          {/* Editable Summary Rows */}
          <div className="space-y-3">
            <EditableRow
              label="Physician"
              value={data.extractedData.physicianName}
              isEditing={editingField === "physicianName"}
              editValue={editValue}
              onEdit={() => handleEdit("physicianName", data.extractedData!.physicianName)}
              onSave={() => handleSave("physicianName")}
              onCancel={() => setEditingField(null)}
              onChange={setEditValue}
            />
          </div>

          {/* 17-Domain Clinical Assessment Matrix */}
          {Object.keys(domains).length > 0 && (
            <div className="border-3 border-[#16120E] rounded-2xl bg-white p-5 shadow-[4px_4px_0_#16120E] space-y-5">
              <div className="flex items-center justify-between border-b-2 border-[#D9CEBF] pb-3">
                <div>
                  <h4 className="font-[family-name:var(--font-serif)] font-black text-xl text-[#16120E]">
                    Clinical Deficit &amp; Needs Matrix
                  </h4>
                  <p className="text-xs font-semibold text-[#4A4036]">
                    Extracted from neurological assessment by local AI
                  </p>
                </div>
                <div className="flex gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-[#D4441C]" /> Needs Help
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-[#1B663E]" /> Intact
                  </span>
                </div>
              </div>

              {Object.entries(CATEGORY_GROUPS).map(([categoryTitle, domainKeys]) => (
                <div key={categoryTitle} className="space-y-2.5">
                  <h5 className="font-bold text-sm text-[#16120E] uppercase tracking-wide">
                    {categoryTitle}
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {domainKeys.map((key) => {
                      const item = domains[key];
                      if (!item) return null;
                      return (
                        <div
                          key={key}
                          className={`p-3 rounded-xl border-2 border-[#16120E] flex flex-col justify-between transition-all ${
                            item.needs_help ? "bg-[#FEECE6]" : "bg-[#E7F4EC]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs uppercase tracking-wider text-[#16120E]">
                              {DOMAIN_LABELS[key] || key.replace(/_/g, " ")}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase border border-[#16120E] flex-shrink-0 ${
                                item.needs_help
                                  ? "bg-[#D4441C] text-white"
                                  : "bg-[#1B663E] text-white"
                              }`}
                            >
                              {item.needs_help ? "Needs Help" : "Intact"}
                            </span>
                          </div>
                          {item.evidence && (
                            <p className="text-[11px] text-[#4A4036] font-medium italic mt-1.5 leading-snug border-l-2 border-[#16120E]/30 pl-2">
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
        {data.extractedData
          ? "Continue without report"
          : "I don&apos;t have a report — skip this step"}
      </button>

      {errors.skipped && (
        <p role="alert" className="text-brick text-sm font-bold text-center">
          {errors.skipped}
        </p>
      )}
    </div>
  );
}

function EditableRow({
  label,
  value,
  isEditing,
  editValue,
  onEdit,
  onSave,
  onCancel,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  isEditing: boolean;
  editValue: string;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <div className="border-3 border-border-soft rounded-xl bg-surface p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-bold text-ink-secondary text-sm uppercase tracking-wider">
          {label}
        </span>
        {!isEditing && (
          <button onClick={onEdit} className="text-sky text-sm font-bold hover:underline">
            Edit
          </button>
        )}
      </div>
      {isEditing ? (
        <div className="space-y-2">
          {multiline ? (
            <textarea
              value={editValue}
              onChange={(e) => onChange(e.target.value)}
              rows={3}
              className="w-full px-3 rounded-lg border-3 border-marigold bg-surface text-ink font-medium focus:outline-none resize-none"
            />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => onChange(e.target.value)}
              className="w-full min-h-[48px] px-3 rounded-lg border-3 border-marigold bg-surface text-ink text-lg font-medium focus:outline-none"
            />
          )}
          <div className="flex gap-2">
            <button onClick={onSave} className="text-tea font-bold text-sm">
              Save
            </button>
            <button onClick={onCancel} className="text-ink-secondary font-bold text-sm">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-ink text-base">{value || "—"}</p>
      )}
    </div>
  );
}
