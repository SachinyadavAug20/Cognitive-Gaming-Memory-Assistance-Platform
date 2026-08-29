export interface Relative {
  name: string;
  relationship: string;
  photoUrl: string;
  notes: string;
  fileRef?: File;
}

export interface LifeEvent {
  event: string;
  year: string;
  photoUrl?: string;
}

export interface LifeStory {
  occupation: string;
  lifeEvents: LifeEvent[];
  interests: string[];
  favoriteMusic: string;
  culturalBackground: string;
  preferredLanguage: string;
  joyNote: string;
}

export interface LandmarkEntry {
  name: string;
  description: string;
  emoji: string;
  photoUrl?: string;
  fileRef?: File;
}

export interface DomainMetric {
  needs_help: boolean;
  impairment_level: "None" | "Mild" | "Moderate" | "Severe";
  score_pct: number;
  evidence: string | null;
}

export type ClinicalDomains = Record<string, DomainMetric>;

export interface SubscaleScore {
  score: number;
  max: number;
}

export interface GameConfig {
  startLevel: number;
  memoryGridSize: number;
  memoryPreviewSeconds: number;
  memoryShowHints: boolean;
  wayfindingRouteLength: number;
  audioSpeechRate: number;
}

export interface DiagnosticData {
  diagnosis: string;
  icd10?: string;
  dateOfDiagnosis: string;
  examiningPhysician?: string;
  clinicOrHospital?: string;
  testType: string;
  score: number | null;
  maxScore: number | null;
  stage: string;
  recommendedStartLevel: number;
  mtaScore?: string;
  fazekasGrade?: string;
  medications: string[];
  subscaleScores?: Record<string, SubscaleScore>;
  domains?: ClinicalDomains;
  gameConfig?: GameConfig;
  physicianNotes: string;
  file?: File | null;
}

export interface IntakeFormData {
  personal: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    relationship: string;
  };
  diagnostic: {
    file: File | null;
    fileName: string;
    extractedData: DiagnosticData | null;
    isProcessing: boolean;
    skipped: boolean;
  };
  relatives: Relative[];
  lifeStory: LifeStory;
  landmarks: LandmarkEntry[];
}

export const EMPTY_FORM: IntakeFormData = {
  personal: {
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    relationship: "",
  },
  diagnostic: {
    file: null,
    fileName: "",
    extractedData: null,
    isProcessing: false,
    skipped: false,
  },
  relatives: [],
  lifeStory: {
    occupation: "",
    lifeEvents: [
      { event: "Marriage", year: "" },
      { event: "Retirement", year: "" },
    ],
    interests: [],
    favoriteMusic: "",
    culturalBackground: "",
    preferredLanguage: "",
    joyNote: "",
  },
  landmarks: [
    { name: "Home", description: "Where we live", emoji: "🏠" },
    { name: "Local Market", description: "Where we shop", emoji: "🍵" },
    { name: "Temple", description: "Place of worship", emoji: "🛕" },
    { name: "Clinic", description: "Doctor's office", emoji: "🏥" },
  ],
};

export const GENDER_OPTIONS = ["Male", "Female", "Other"];

export const RELATIONSHIP_OPTIONS = [
  "Spouse",
  "Child",
  "Sibling",
  "Parent",
  "Self",
  "Other",
];

export const INTEREST_OPTIONS = [
  "Music",
  "Sports",
  "Cooking",
  "Gardening",
  "Reading",
  "Travel",
  "Religious",
  "Art",
  "Other",
];

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "as", label: "অসমীয়া (Assamese)" },
  { code: "mr", label: "मराठी (Marathi)" },
];

export const RELATIVE_RELATIONSHIP_OPTIONS = [
  "Daughter",
  "Son",
  "Spouse",
  "Grandchild",
  "Sibling",
  "Friend",
  "Other",
];

export const LANDMARK_EMOJIS = [
  "🏠", "🍵", "🛕", "🏥", "🏫", "🌳", "🚌", "🏪",
  "🏛️", "⛰️", "🌇", "🏖️", "🎪", "🚉", "🏦", "📿",
  "🕌", "⛩️", "🏞️", "🎑", "🏤", "🏩", "🏰",
  "🗼", "🗽", "🗿", "🏗️", "🛤️", "🌉", "🌃", "💒",
];

export const SCORE_TYPE_OPTIONS = ["MMSE", "MoCA", "Other"];

export const SCORE_MAX: Record<string, number> = {
  MMSE: 30,
  MoCA: 30,
};
