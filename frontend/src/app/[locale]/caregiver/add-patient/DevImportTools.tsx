"use client";

import { useState } from "react";
import { Wrench, AlertTriangle } from "lucide-react";
import { IntakeWizardClient } from "@/components/intake/IntakeWizardClient";
import { Spinner } from "@/components/ui/Spinner";
import { mapSampleJsonToFormData } from "@/lib/sampleData";
import type { IntakeFormData } from "@/types/intake";

export function DevImportTools() {
  const [jsonInput, setJsonInput] = useState("");
  const [prefill, setPrefill] = useState<IntakeFormData | null>(null);
  const [prefillKey, setPrefillKey] = useState(0);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleApply = async () => {
    if (jsonInput.trim() === "") {
      setImportError(
        "Nothing to import — the textarea is empty. Open one of the files in Data/Patient/example_json/ and paste its contents above."
      );
      return;
    }
    setIsImporting(true);
    setImportError(null);
    try {
      const data = await mapSampleJsonToFormData(jsonInput);
      setPrefill(data);
      setPrefillKey((k) => k + 1);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Failed to import JSON.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleClear = () => {
    setPrefill(null);
    setPrefillKey((k) => k + 1);
    setImportError(null);
  };

  return (
    <>
      <details
        className="mb-4 rounded-xl border-2 border-dashed border-border-soft bg-surface/60 backdrop-blur-sm transition-colors open:border-border"
      >
        <summary className="inline-flex items-center gap-1.5 cursor-pointer select-none px-4 py-2.5 font-bold text-sm text-ink-secondary hover:text-ink">
          <Wrench className="h-4 w-4 text-tea" />
          <span>Dev Tools: Import JSON</span>
        </summary>
        <div className="px-4 pb-4 pt-2 space-y-3">
          <p className="text-xs text-ink-secondary leading-snug">
            Paste one of the sample patient JSONs ({" "}
            <code className="font-mono text-ink">
              Data/Patient/example_json/example_patient_1_biren_borah.json
            </code>{" "}
            …{" "}
            <code className="font-mono text-ink">
              example_patient_5_kevichusa_angami.json
            </code>
            ) and click &quot;Apply Data&quot; to pre-fill the wizard. Bundled
            relative and place photos load automatically (via{" "}
            <code className="font-mono text-ink">/sample-images/</code>). If any
            photo is missing, select one to attach it manually.
          </p>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={10}
            spellCheck={false}
            disabled={isImporting}
            placeholder='{ "step_1_about_patient": { ... } }'
            className="w-full font-mono text-xs rounded-lg border-3 border-border-soft bg-surface p-3 text-ink placeholder:text-ink-secondary/40 focus:outline-none focus:border-marigold transition-colors resize-y disabled:opacity-60"
          />
          {importError && (
            <p role="alert" className="flex items-center gap-1.5 text-brick text-xs font-bold">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
              <span>{importError}</span>
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApply}
              disabled={isImporting}
              className="btn-tactile bg-tea text-ink border-2 min-h-[40px] px-5 text-sm font-bold disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isImporting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="scale-[0.35] -mx-2">
                    <Spinner label="Loading images" />
                  </span>
                  Loading images…
                </span>
              ) : (
                "Apply Data"
              )}
            </button>
            {prefill && (
              <button
                type="button"
                onClick={handleClear}
                className="min-h-[40px] px-4 rounded-lg border-2 border-border-soft bg-surface text-ink-secondary font-bold text-sm hover:bg-surface-muted transition-colors cursor-pointer"
              >
                Clear import
              </button>
            )}
          </div>
        </div>
      </details>

      <IntakeWizardClient key={prefillKey} prefill={prefill ?? undefined} />
    </>
  );
}