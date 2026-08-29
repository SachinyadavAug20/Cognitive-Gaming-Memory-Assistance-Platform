import type {
  IntakeFormData,
  DiagnosticData,
  ClinicalDomains,
  SubscaleScore,
  GameConfig,
} from "@/types/intake";

/* ── API response types ── */

export interface AnalyzeReportResponse {
  diagnosis?: string | null;
  icd10?: string | null;
  dateOfDiagnosis?: string | null;
  examiningPhysician?: string | null;
  clinicOrHospital?: string | null;
  clinicalStage?: string | null;
  recommendedStartDifficulty?: number | null;
  llmSummary?: string | null;
  testType?: string | null;
  mmseScore?: number | null;
  maxScore?: number | null;
  mtaScore?: string | null;
  fazekasGrade?: string | null;
  medications?: string[];
  subscaleScores?: Record<string, SubscaleScore>;
  domains?: ClinicalDomains;
  gameConfig?: GameConfig;
}

export interface OnboardResponse {
  patientId: number;
  medicalProfile: {
    clinicalStage: string;
    recommendedStartDifficulty: number;
    llmSummary: string;
  };
  familyCount: number;
  placesCount: number;
}

/* ── Mapping functions ── */

export function parseAnalyzeReport(response: AnalyzeReportResponse): DiagnosticData {
  return {
    diagnosis: response.diagnosis || "Undetermined Diagnosis",
    icd10: response.icd10 ?? undefined,
    dateOfDiagnosis: response.dateOfDiagnosis || "",
    examiningPhysician: response.examiningPhysician ?? undefined,
    clinicOrHospital: response.clinicOrHospital ?? undefined,
    testType: response.testType ?? "Unknown",
    score: response.mmseScore ?? null,
    maxScore: response.maxScore ?? (response.mmseScore != null ? 30 : null),
    stage: response.clinicalStage ?? "MCI",
    recommendedStartLevel: response.recommendedStartDifficulty ?? 1,
    mtaScore: response.mtaScore ?? undefined,
    fazekasGrade: response.fazekasGrade ?? undefined,
    medications: response.medications ?? [],
    subscaleScores: response.subscaleScores ?? undefined,
    domains: response.domains ?? undefined,
    gameConfig: response.gameConfig ?? undefined,
    physicianNotes: response.llmSummary ?? "",
  };
}

/* ── Serialization (strips File refs for localStorage / API payload) ── */

export function serializeFormData(formData: IntakeFormData) {
  return {
    personal: formData.personal,
    relatives: formData.relatives.map(({ fileRef: _fileRef, ...rest }) => rest),
    lifeStory: {
      occupation: formData.lifeStory.occupation,
      favoriteMusic: formData.lifeStory.favoriteMusic,
      interests: formData.lifeStory.interests,
      lifeEvents: formData.lifeStory.lifeEvents,
      culturalBackground: formData.lifeStory.culturalBackground,
      preferredLanguage: formData.lifeStory.preferredLanguage,
      joyNote: formData.lifeStory.joyNote,
    },
    landmarks: formData.landmarks.map(({ fileRef: _fileRef, ...rest }) => rest),
    diagnostic: formData.diagnostic.extractedData,
    caregiverId: 1,
  };
}

/* ── Build FormData for /patients/onboard ── */

export function buildOnboardPayload(formData: IntakeFormData): FormData {
  const payload = new FormData();

  const dataBlob = serializeFormData(formData);
  payload.append(
    "data",
    new Blob([JSON.stringify(dataBlob)], { type: "application/json" })
  );

  if (formData.diagnostic.file) {
    payload.append("reportFile", formData.diagnostic.file);
  }

  for (const r of formData.relatives) {
    if (r.fileRef) payload.append("photos", r.fileRef);
  }
  for (const l of formData.landmarks) {
    if (l.fileRef) payload.append("photos", l.fileRef);
  }

  return payload;
}
