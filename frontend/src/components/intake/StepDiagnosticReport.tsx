"use client";

import { useCallback, useState } from "react";
import { FileUploadZone } from "./FileUploadZone";
import { SCORE_TYPE_OPTIONS, SCORE_MAX } from "@/types/intake";
import type { DiagnosticData } from "@/types/intake";

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

          <div className="space-y-3">
            {/* Diagnosis */}
            <EditableRow
              label="Diagnosis"
              value={data.extractedData.diagnosis}
              isEditing={editingField === "diagnosis"}
              editValue={editValue}
              onEdit={() => handleEdit("diagnosis", data.extractedData!.diagnosis)}
              onSave={() => handleSave("diagnosis")}
              onCancel={() => setEditingField(null)}
              onChange={setEditValue}
            />

            {/* Diagnosis Date */}
            <EditableRow
              label="Date of Diagnosis"
              value={data.extractedData.diagnosisDate}
              isEditing={editingField === "diagnosisDate"}
              editValue={editValue}
              onEdit={() => handleEdit("diagnosisDate", data.extractedData!.diagnosisDate)}
              onSave={() => handleSave("diagnosisDate")}
              onCancel={() => setEditingField(null)}
              onChange={setEditValue}
            />

            {/* Cognitive Score */}
            <div className="border-3 border-border-soft rounded-xl bg-surface p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-ink-secondary text-sm uppercase tracking-wider">
                  Cognitive Score
                </span>
                <div className="flex gap-2">
                  {SCORE_TYPE_OPTIONS.map((type) => (
                    <button
                      key={type}
                      onClick={() => onEditField("cognitiveScoreType", type)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border-2 transition-all ${
                        data.extractedData!.cognitiveScoreType === type
                          ? "bg-marigold text-white border-marigold"
                          : "bg-surface text-ink-secondary border-border-soft"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editingField === "cognitiveScore" ? (
                  <>
                    <input
                      type="number"
                      min={0}
                      max={SCORE_MAX[data.extractedData!.cognitiveScoreType] || 30}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-20 min-h-[48px] px-3 rounded-lg border-3 border-marigold bg-surface text-ink text-lg font-bold text-center focus:outline-none"
                      aria-label="Cognitive score"
                    />
                    <span className="text-ink-secondary font-bold">
                      / {SCORE_MAX[data.extractedData!.cognitiveScoreType] || 30}
                    </span>
                    <button
                      onClick={() => handleSave("cognitiveScore")}
                      className="ml-2 text-tea font-bold text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="text-ink-secondary font-bold text-sm"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-ink">
                      {data.extractedData!.cognitiveScore}
                    </span>
                    <span className="text-ink-secondary font-bold">
                      / {SCORE_MAX[data.extractedData!.cognitiveScoreType] || 30}
                    </span>
                    <button
                      onClick={() =>
                        handleEdit("cognitiveScore", data.extractedData!.cognitiveScore)
                      }
                      className="ml-2 text-sky text-sm font-bold hover:underline"
                    >
                      Edit
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Medications */}
            <div className="border-3 border-border-soft rounded-xl bg-surface p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-ink-secondary text-sm uppercase tracking-wider">
                  Medications
                </span>
                <button
                  onClick={() =>
                    handleEdit("medications", data.extractedData!.medications.join(", "))
                  }
                  className="text-sky text-sm font-bold hover:underline"
                >
                  Edit
                </button>
              </div>
              {editingField === "medications" ? (
                <div className="space-y-2">
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    placeholder="One medication per line"
                    rows={3}
                    className="w-full px-3 rounded-lg border-3 border-marigold bg-surface text-ink font-medium focus:outline-none resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        onEditField("medications", editValue);
                        setEditingField(null);
                      }}
                      className="text-tea font-bold text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="text-ink-secondary font-bold text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <ul className="space-y-1">
                  {data.extractedData!.medications.map((med, i) => (
                    <li key={i} className="text-ink text-base flex items-start gap-2">
                      <span className="text-marigold mt-1">•</span>
                      {med}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Physician Notes */}
            <EditableRow
              label="Physician Notes"
              value={data.extractedData!.physicianNotes}
              isEditing={editingField === "physicianNotes"}
              editValue={editValue}
              onEdit={() =>
                handleEdit("physicianNotes", data.extractedData!.physicianNotes)
              }
              onSave={() => handleSave("physicianNotes")}
              onCancel={() => setEditingField(null)}
              onChange={setEditValue}
              multiline
            />

            {/* Physician Name */}
            <EditableRow
              label="Physician"
              value={data.extractedData!.physicianName}
              isEditing={editingField === "physicianName"}
              editValue={editValue}
              onEdit={() =>
                handleEdit("physicianName", data.extractedData!.physicianName)
              }
              onSave={() => handleSave("physicianName")}
              onCancel={() => setEditingField(null)}
              onChange={setEditValue}
            />
          </div>
        </div>
      )}

      <button
        onClick={onSkip}
        className="w-full min-h-[56px] rounded-xl border-3 border-border-soft bg-surface text-ink-secondary font-bold text-lg hover:bg-surface-muted transition-colors"
      >
        {data.extractedData ? "Continue without report" : "I don&apos;t have a report — skip this step"}
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
