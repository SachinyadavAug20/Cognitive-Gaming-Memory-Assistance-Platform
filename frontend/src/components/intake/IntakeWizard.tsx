"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ProgressBar } from "./ProgressBar";
import { StepPersonalInfo } from "./StepPersonalInfo";
import { StepDiagnosticReport } from "./StepDiagnosticReport";
import { StepFamilyMembers } from "./StepFamilyMembers";
import { StepLifeStory } from "./StepLifeStory";
import { StepFamiliarPlaces } from "./StepFamiliarPlaces";
import { StepReview } from "./StepReview";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { api } from "@/lib/api";
import { EMPTY_FORM } from "@/types/intake";
import { parseAnalyzeReport, buildOnboardPayload } from "@/lib/intake";
import type { IntakeFormData, Relative, LandmarkEntry } from "@/types/intake";

const STORAGE_KEY = "cognicare:intake:draft";
const STEP_ICONS = ["👤", "🏥", "👨‍👩‍👧", "📖", "📍", "✅"] as const;

export function IntakeWizard() {
  const t = useTranslations("intake");
  const tWizard = useTranslations("intake.wizard");
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<IntakeFormData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...EMPTY_FORM,
          ...parsed,
          diagnostic: { ...EMPTY_FORM.diagnostic, ...parsed.diagnostic, file: null },
        };
      }
    } catch {
      /* ignore corrupted data */
    }
    return EMPTY_FORM;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stepMeta = useMemo(
    () =>
      STEP_ICONS.map((icon, i) => {
        const keys = ["personal", "medical", "family", "life", "places", "review"] as const;
        return { icon, label: tWizard(keys[i]) };
      }),
    [tWizard]
  );

  /* ── Auto-save to localStorage ── */
  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
    try {
      const toSave = {
        ...formData,
        diagnostic: { ...formData.diagnostic, file: null },
        relatives: formData.relatives.map(({ fileRef: _, ...r }) => r),
        landmarks: formData.landmarks.map(({ fileRef: _, ...l }) => l),
      };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      } catch {
        /* ignore storage errors */
      }
    }, 1000);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [formData]);

  /* ── Scroll to top on step change ── */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  /* ── Generic field updater ── */
  const updateField = useCallback(
    (section: string, field: string, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section as keyof IntakeFormData] as Record<string, unknown>),
          [field]: value,
        },
      }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  /* ── PDF file handler → calls real backend ── */
  const handleFileSelect = useCallback(async (file: File | null) => {
    if (!file) {
      setFormData((prev) => ({
        ...prev,
        diagnostic: {
          ...prev.diagnostic,
          file: null,
          fileName: "",
          extractedData: null,
          isProcessing: false,
        },
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      diagnostic: {
        ...prev.diagnostic,
        file,
        fileName: file.name,
        isProcessing: true,
        skipped: false,
      },
    }));

    try {
      const payload = new FormData();
      payload.append("reportFile", file);
      const response = await api.postMultipart<Record<string, unknown>>("/patients/analyze-pdf", payload);

      setFormData((prev) => ({
        ...prev,
        diagnostic: {
          ...prev.diagnostic,
          extractedData: parseAnalyzeReport(response as Parameters<typeof parseAnalyzeReport>[0]),
          isProcessing: false,
        },
      }));
    } catch (err) {
      console.error("PDF analysis failed:", err);
      setFormData((prev) => ({
        ...prev,
        diagnostic: { ...prev.diagnostic, isProcessing: false },
      }));
    }
  }, []);

  const handleAnalyze = useCallback(() => {
    if (formData.diagnostic.file) handleFileSelect(formData.diagnostic.file);
  }, [formData.diagnostic.file, handleFileSelect]);

  const handleSkipDiagnostic = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      diagnostic: { ...prev.diagnostic, skipped: true, extractedData: null, isProcessing: false },
    }));
  }, []);

  /* ── Relative handlers ── */
  const handleAddRelative = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      relatives: [...prev.relatives, { name: "", relationship: "", photoUrl: "", notes: "" }],
    }));
  }, []);

  const handleRemoveRelative = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      relatives: prev.relatives.filter((_, i) => i !== index),
    }));
  }, []);

  const handleUpdateRelative = useCallback((index: number, item: Relative) => {
    setFormData((prev) => ({
      ...prev,
      relatives: prev.relatives.map((r, i) => (i === index ? item : r)),
    }));
  }, []);

  /* ── Life story handler ── */
  const handleLifeStoryChange = useCallback(
    (field: string, value: string | string[] | { event: string; year: string }[]) => {
      setFormData((prev) => {
        const ls = prev.lifeStory;
        if (field === "interests") {
          return { ...prev, lifeStory: { ...ls, interests: value as string[] } };
        }
        if (field === "lifeEvents") {
          return { ...prev, lifeStory: { ...ls, lifeEvents: value as { event: string; year: string }[] } };
        }
        return { ...prev, lifeStory: { ...ls, [field]: value as string } };
      });
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  /* ── Landmark handlers ── */
  const handleAddLandmark = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      landmarks: [...prev.landmarks, { name: "", description: "", emoji: "📍" }],
    }));
  }, []);

  const handleRemoveLandmark = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      landmarks: prev.landmarks.filter((_, i) => i !== index),
    }));
  }, []);

  const handleUpdateLandmark = useCallback((index: number, item: LandmarkEntry) => {
    setFormData((prev) => ({
      ...prev,
      landmarks: prev.landmarks.map((l, i) => (i === index ? item : l)),
    }));
  }, []);

  /* ── Validation ── */
  const validateStep = useCallback(
    (step: number): Record<string, string> => {
      const errs: Record<string, string> = {};

      if (step === 0) {
        if (!formData.personal.fullName || formData.personal.fullName.length < 2)
          errs.fullName = "Name must be at least 2 characters";
        if (!formData.personal.dateOfBirth) errs.dateOfBirth = "Date of birth is required";
        if (!formData.personal.gender) errs.gender = "Gender is required";
        if (!formData.personal.phone || formData.personal.phone.length < 10)
          errs.phone = "Phone must be at least 10 digits";
        if (!formData.personal.relationship) errs.relationship = "Please select your relationship";
      }

      if (step === 2) {
        if (formData.relatives.length === 0) errs.relatives = "Add at least one family member";
      }

      if (step === 4) {
        if (formData.landmarks.length < 3)
          errs.landmarks = "Add at least 3 landmarks for the Wayfinding game";
      }

      return errs;
    },
    [formData]
  );

  /* ── Navigation ── */
  const handleNext = useCallback(() => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep((s) => Math.min(s + 1, stepMeta.length - 1));
  }, [currentStep, validateStep, stepMeta.length]);

  const handleBack = useCallback(() => {
    setErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleGoToStep = useCallback(
    (step: number) => {
      if (step <= currentStep) {
        setErrors({});
        setCurrentStep(step);
      }
    },
    [currentStep]
  );

  /* ── Form submission ── */
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = buildOnboardPayload(formData);
      const response = await api.postMultipart<{ patientId: number }>("/patients/onboard", payload);

      setIsSubmitting(false);
      setIsComplete(true);
      setPatientId(response.patientId);
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(
        err instanceof Error ? err.message : "Failed to create patient profile. Please try again."
      );
    }
  }, [formData]);

  /* ── Completion screen ── */
  if (isComplete) {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="text-6xl">🎉</div>
        <h2 className="font-[family-name:var(--font-serif)] text-3xl font-bold text-ink">
          {t("complete.title")}
        </h2>
        <p className="text-ink-secondary text-lg max-w-md mx-auto">
          {t("complete.desc", { name: formData.personal.fullName || "The patient" })}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {patientId && (
            <ChunkyButton
              variant="terracotta"
              onClick={() => router.push(`/caregiver/patients/${patientId}`)}
            >
              View Patient Profile →
            </ChunkyButton>
          )}
          <ChunkyButton variant="tea" onClick={() => router.push("/caregiver")}>
            {t("complete.dashboard")}
          </ChunkyButton>
        </div>
      </div>
    );
  }

  /* ── Main render ── */
  return (
    <div className="max-w-2xl mx-auto">
      <ProgressBar
        currentStep={currentStep}
        totalSteps={stepMeta.length}
        steps={stepMeta}
        onStepClick={handleGoToStep}
      />

      <div className="min-h-[400px]">
        {currentStep === 0 && (
          <StepPersonalInfo
            data={formData.personal}
            errors={errors}
            onChange={(field, value) => updateField("personal", field, value)}
          />
        )}
        {currentStep === 1 && (
          <StepDiagnosticReport
            data={formData.diagnostic}
            errors={errors}
            onFileSelect={handleFileSelect}
            onAnalyze={handleAnalyze}
            onSkip={handleSkipDiagnostic}
          />
        )}
        {currentStep === 2 && (
          <StepFamilyMembers
            data={formData.relatives}
            errors={errors}
            onAdd={handleAddRelative}
            onRemove={handleRemoveRelative}
            onUpdate={handleUpdateRelative}
          />
        )}
        {currentStep === 3 && (
          <StepLifeStory
            data={formData.lifeStory}
            errors={errors}
            onChange={handleLifeStoryChange}
          />
        )}
        {currentStep === 4 && (
          <StepFamiliarPlaces
            data={formData.landmarks}
            errors={errors}
            onAdd={handleAddLandmark}
            onRemove={handleRemoveLandmark}
            onUpdate={handleUpdateLandmark}
          />
        )}
        {currentStep === 5 && (
          <StepReview data={formData} onEditStep={handleGoToStep} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8 pt-6 border-t-3 border-border-soft">
        {currentStep > 0 && (
          <ChunkyButton variant="outline" onClick={handleBack}>
            {t("back")}
          </ChunkyButton>
        )}
        <div className="flex-1" />
        {currentStep < stepMeta.length - 1 ? (
          <ChunkyButton variant="terracotta" onClick={handleNext}>
            {t("continue")}
          </ChunkyButton>
        ) : (
          <ChunkyButton variant="tea" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t("creating") : t("submit")}
          </ChunkyButton>
        )}
      </div>

      {submitError && (
        <div className="mt-4 p-3 rounded-xl bg-brick-light border-2 border-brick text-brick text-sm font-bold text-center">
          {submitError}
        </div>
      )}
    </div>
  );
}
