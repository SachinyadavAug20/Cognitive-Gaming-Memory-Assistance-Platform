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

export interface DomainDetail {
  needs_help: boolean;
  evidence: string | null;
}

export type ClinicalDomains = Record<string, DomainDetail>;

export interface DiagnosticData {
  diagnosis: string;
  diagnosisDate: string;
  cognitiveScore: string;
  cognitiveScoreType: string;
  medications: string[];
  physicianNotes: string;
  physicianName: string;
  score?: number | null;
  maxScore?: number | null;
  domains?: ClinicalDomains;
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
  { code: "hi", label: "हिन्दी" },
  { code: "as", label: "অসমীয়া" },
  { code: "bn", label: "বাংলা" },
  { code: "mni", label: "মৈতৈলোন্" },
  { code: "kha", label: "Khasi" },
  { code: "lus", label: "Mizo" },
  { code: "nep", label: "नेपाली" },
  { code: "brx", label: "बड़ो" },
  { code: "trl", label: "Kokborok" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "mr", label: "मराठी" },
  { code: "ml", label: "മലയാളം" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "pa", label: "ਪੰਜਾਬੀ" },
  { code: "od", label: "ଓଡ଼ିଆ" },
  { code: "ur", label: "اردو" },
  { code: "mai", label: "मैथिली" },
  { code: "sat", label: "ᱥᱟᱨᱤᱡ" },
  { code: "sd", label: "سنڌي" },
  { code: "ks", label: "कश्मीरी" },
  { code: "dog", label: "डोगरी" },
  { code: "kok", label: "कोंकणी" },
  { code: "sa", label: "संस्कृतम्" },
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
