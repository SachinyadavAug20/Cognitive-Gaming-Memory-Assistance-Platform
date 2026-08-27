export type Trend = "improving" | "stable" | "declining";

export type ReminderStatus = "completed" | "due" | "upcoming" | "skipped";

export type RoutineStatus = "completed" | "due" | "info";

export interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  lastSession: string;
  trend: Trend;
  scores: ScoreData;
}

export interface PatientDetail {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  caregiver: string;
  startDate: string;
  scores: ScoreData;
}

export interface ScoreData {
  memory: number;
  spatial: number;
  reaction: number;
}

export interface SessionRecord {
  date: string;
  game: string;
  score: number;
  duration: string;
  status: string;
}

export interface TrendDataPoint {
  week: string;
  memory: number;
  spatial: number;
  reaction: number;
}

export interface Reminder {
  emoji: string;
  time: string;
  title: string;
  status: ReminderStatus;
}

export interface RoutineItem {
  emoji: string;
  title: string;
  time: string;
  status: RoutineStatus;
}

export interface Landmark {
  id: string;
  emoji: string;
  name: string;
  desc: string;
}

export interface Language {
  code: string;
  label: string;
  full: string;
}

export interface Relative {
  name: string;
  relationship: string;
  photoUrl: string;
  notes: string;
  fileRef?: File;
}

export interface LifeStory {
  occupation: string;
  lifeEvents: { event: string; year: string; photoUrl?: string }[];
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

export interface FullPatient extends Patient {
  dateOfBirth: string;
  gender: string;
  phone: string;
  relationship: string;
  diagnosisDate: string;
  cognitiveScore: string;
  medications: string[];
  physicianNotes: string;
  relatives: Relative[];
  lifeStory: LifeStory;
  landmarks: LandmarkEntry[];
}
