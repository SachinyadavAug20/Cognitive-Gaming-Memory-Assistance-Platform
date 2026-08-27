import type { Patient, PatientDetail, SessionRecord, TrendDataPoint, Trend } from "@/types";

export const PATIENTS: Patient[] = [
  { id: "1", name: "Ramesh Dutta", age: 72, diagnosis: "Mild Cognitive Impairment", lastSession: "2 hours ago", trend: "improving", scores: { memory: 85, spatial: 62, reaction: 74 } },
  { id: "2", name: "Savitri Devi", age: 68, diagnosis: "Early-Stage Dementia", lastSession: "Yesterday", trend: "stable", scores: { memory: 71, spatial: 58, reaction: 66 } },
  { id: "3", name: "Bhupen Kalita", age: 75, diagnosis: "Mild Cognitive Impairment", lastSession: "3 days ago", trend: "declining", scores: { memory: 64, spatial: 45, reaction: 59 } },
];

export const TREND_COLORS: Record<Trend, string> = {
  improving: "text-tea bg-tea-light",
  stable: "text-marigold bg-marigold-light",
  declining: "text-brick bg-brick-light",
};

export const TREND_LABELS: Record<Trend, string> = {
  improving: "↗ Improving",
  stable: "→ Stable",
  declining: "↘ Needs Attention",
};

export const MOCK_PATIENT: PatientDetail = {
  id: "1",
  name: "Ramesh Dutta",
  age: 72,
  diagnosis: "Mild Cognitive Impairment",
  caregiver: "Priya Dutta (Daughter)",
  startDate: "2026-06-15",
  scores: { memory: 85, spatial: 62, reaction: 74 },
};

export const SESSIONS: SessionRecord[] = [
  { date: "Aug 26", game: "Memory Pieces", score: 88, duration: "11m 23s", status: "completed" },
  { date: "Aug 25", game: "Remember the Way", score: 72, duration: "8m 45s", status: "completed" },
  { date: "Aug 24", game: "Memory Pieces", score: 82, duration: "12m 01s", status: "completed" },
  { date: "Aug 23", game: "Remember the Way", score: 65, duration: "9m 12s", status: "completed" },
  { date: "Aug 22", game: "Memory Pieces", score: 78, duration: "10m 55s", status: "completed" },
];

export const TREND_DATA: TrendDataPoint[] = [
  { week: "W1", memory: 72, spatial: 55, reaction: 68 },
  { week: "W2", memory: 76, spatial: 58, reaction: 70 },
  { week: "W3", memory: 80, spatial: 60, reaction: 72 },
  { week: "W4", memory: 85, spatial: 62, reaction: 74 },
];
