"use client";

import { useTranslations } from "next-intl";
import { StepHeader } from "./StepHeader";
import { FileUploadZone } from "./FileUploadZone";
import { DiagnosisBanner } from "./DiagnosisBanner";
import { SubscaleGrid } from "./SubscaleGrid";
import { DomainMatrix } from "./DomainMatrix";
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
  onFileSelect: (file: File | null) => void;
  onAnalyze: () => void;
  onSkip: () => void;
}

export function StepDiagnosticReport({
  data,
  errors,
  onFileSelect,
  onAnalyze,
  onSkip,
}: StepDiagnosticReportProps) {
  const tMedical = useTranslations("intake.medical");
  const preview = data.file ? URL.createObjectURL(data.file) : undefined;
  const ext = data.extractedData;

  return (
    <div className="space-y-6">
      <StepHeader title={tMedical("title")} subtitle={tMedical("subtitle")} />

      {!ext && (
        <FileUploadZone
          accept=".pdf"
          maxSizeMB={10}
          label={tMedical("upload.label")}
          description={tMedical("upload.desc")}
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
          {tMedical("analyze")}
        </button>
      )}

      {ext && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-ink text-lg">{tMedical("extracted")}</h3>
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface border-2 border-border rounded-xl text-xs font-bold text-ink hover:bg-surface-muted shadow-[2px_2px_0_var(--color-border)] active:translate-y-0.5 transition-all cursor-pointer"
            >
              📄 {tMedical("replace") || "Upload different file"}
            </button>
          </div>
          <DiagnosisBanner data={ext} />
          <SubscaleGrid subscales={ext.subscaleScores || {}} />
          <DomainMatrix domains={ext.domains || {}} />
        </div>
      )}

      {!ext && (
        <button
          type="button"
          onClick={onSkip}
          className="w-full min-h-[56px] rounded-xl border-3 border-border-soft bg-surface text-ink-secondary font-bold text-lg hover:bg-surface-muted transition-colors cursor-pointer"
        >
          {tMedical("skip")}
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
