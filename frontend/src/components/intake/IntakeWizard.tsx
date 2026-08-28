"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
import type { IntakeFormData, Relative, LandmarkEntry } from "@/types/intake";

const STORAGE_KEY = "intake:draft";
const DEBOUNCE_MS = 300;

const STEP_ICONS = ["👤", "🏥", "👨‍👩‍👧", "📖", "📍", "✅"];

function loadSavedDraft(): IntakeFormData {
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
    // Ignore corrupted data
  }
  return EMPTY_FORM;
}

export function IntakeWizard() {
  const router = useRouter();
  const t = useTranslations("intake");
  const tWizard = useTranslations("intake.wizard");
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<IntakeFormData>(loadSavedDraft);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [patientId, setPatientId] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const STEP_META = [
    { label: tWizard("personal"), icon: STEP_ICONS[0] },
    { label: tWizard("medical"), icon: STEP_ICONS[1] },
    { label: tWizard("family"), icon: STEP_ICONS[2] },
    { label: tWizard("life"), icon: STEP_ICONS[3] },
    { label: tWizard("places"), icon: STEP_ICONS[4] },
    { label: tWizard("review"), icon: STEP_ICONS[5] },
  ];

  // Auto-save to localStorage
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
        // Ignore storage errors
      }
    }, DEBOUNCE_MS);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [formData]);

  // Focus management on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

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

  // Step 2: Diagnostic handlers
  const handleFileSelect = useCallback(
    async (file: File) => {
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
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = (reader.result as string).split(",")[1];
          try {
            const res = await fetch("/api/analyze-report", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ pdfBase64: base64 }),
            });
            if (!res.ok) throw new Error("Analysis failed");
            const data = await res.json();
            setFormData((prev) => ({
              ...prev,
              diagnostic: {
                ...prev.diagnostic,
                extractedData: data,
                isProcessing: false,
              },
            }));
          } catch {
            setFormData((prev) => ({
              ...prev,
              diagnostic: { ...prev.diagnostic, isProcessing: false },
            }));
          }
        };
        reader.readAsDataURL(file);
      } catch {
        setFormData((prev) => ({
          ...prev,
          diagnostic: { ...prev.diagnostic, isProcessing: false },
        }));
      }
    },
    []
  );

  const handleAnalyze = useCallback(() => {
    if (formData.diagnostic.file) {
      handleFileSelect(formData.diagnostic.file);
    }
  }, [formData.diagnostic.file, handleFileSelect]);

  const handleSkipDiagnostic = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      diagnostic: {
        ...prev.diagnostic,
        skipped: true,
        extractedData: null,
        isProcessing: false,
      },
    }));
  }, []);

  // Step 3: Family handlers
  const handleAddRelative = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      relatives: [
        ...prev.relatives,
        { name: "", relationship: "", photoUrl: "", notes: "" },
      ],
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

  // Step 4: Life story handler
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

  // Step 5: Landmark handlers
  const handleAddLandmark = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      landmarks: [
        ...prev.landmarks,
        { name: "", description: "", emoji: "📍" },
      ],
    }));
  }, []);

  const handleRemoveLandmark = useCallback((index: number) => {
    setFormData((prev) => ({
      ...prev,
      landmarks: prev.landmarks.filter((_, i) => i !== index),
    }));
  }, []);

  const handleUpdateLandmark = useCallback(
    (index: number, item: LandmarkEntry) => {
      setFormData((prev) => ({
        ...prev,
        landmarks: prev.landmarks.map((l, i) => (i === index ? item : l)),
      }));
    },
    []
  );

  // Validation
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
        if (formData.relatives.length === 0)
          errs.relatives = "Add at least one family member";
      }

      if (step === 4) {
        if (formData.landmarks.length < 3)
          errs.landmarks = "Add at least 3 landmarks for the Wayfinding game";
      }

      return errs;
    },
    [formData]
  );

  const handleNext = useCallback(() => {
    const stepErrors = validateStep(currentStep);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep((s) => Math.min(s + 1, STEP_META.length - 1));
  }, [currentStep, validateStep]);

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

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const formDataPayload = new FormData();

      const relativesWithIndex = formData.relatives.map((r, i) => ({
        name: r.name,
        relationship: r.relationship,
        notes: r.notes,
        photoIndex: r.fileRef ? i : null,
      }));

      const landmarksWithIndex = formData.landmarks.map((l, i) => {
        const photoOffset = formData.relatives.length;
        return {
          name: l.name,
          description: l.description,
          emoji: l.emoji,
          photoIndex: l.fileRef ? photoOffset + i : null,
        };
      });

      const dataBlob = {
        personal: formData.personal,
        relatives: relativesWithIndex,
        lifeStory: {
          occupation: formData.lifeStory.occupation,
          favoriteMusic: formData.lifeStory.favoriteMusic,
          interests: formData.lifeStory.interests,
          lifeEvents: formData.lifeStory.lifeEvents,
          culturalBackground: formData.lifeStory.culturalBackground,
          preferredLanguage: formData.lifeStory.preferredLanguage,
          joyNote: formData.lifeStory.joyNote,
        },
        landmarks: landmarksWithIndex,
        caregiverId: 1,
      };

      formDataPayload.append(
        "data",
        new Blob([JSON.stringify(dataBlob)], { type: "application/json" })
      );

      if (formData.diagnostic.file) {
        formDataPayload.append("reportFile", formData.diagnostic.file);
      }

      const photos: File[] = [];
      for (const relative of formData.relatives) {
        if (relative.fileRef) {
          photos.push(relative.fileRef);
        }
      }
      for (const landmark of formData.landmarks) {
        if (landmark.fileRef) {
          photos.push(landmark.fileRef);
        }
      }
      for (const photo of photos) {
        formDataPayload.append("photos", photo);
      }

      const response = await api.postMultipart<{
        patientId: number;
        medicalProfile: { clinicalStage: string; recommendedStartDifficulty: number; llmSummary: string };
        familyCount: number;
        placesCount: number;
      }>("/patients/onboard", formDataPayload);

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

  if (isComplete) {
    return (
      <div className="text-center space-y-6 py-12">
        <div className="text-6xl">🎉</div>
        <h2 className="font-[family-name:var(--font-serif)] text-3xl font-bold text-ink">
          {t("complete.title")}
        </h2>
        <p className="text-ink-secondary text-lg max-w-md mx-auto">
          <strong>{formData.personal.fullName}</strong> {t("complete.desc", { name: formData.personal.fullName })}
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
          <ChunkyButton
            variant="tea"
            onClick={() => router.push("/caregiver")}
          >
            {t("complete.dashboard")}
          </ChunkyButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ProgressBar
        currentStep={currentStep}
        totalSteps={STEP_META.length}
        steps={STEP_META}
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

        {currentStep < STEP_META.length - 1 ? (
          <ChunkyButton variant="terracotta" onClick={handleNext}>
            {t("continue")}
          </ChunkyButton>
        ) : (
          <ChunkyButton
            variant="tea"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
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
