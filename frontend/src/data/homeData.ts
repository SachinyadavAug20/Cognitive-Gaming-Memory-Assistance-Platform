import type { Language, RoutineItem } from "@/types";

export const LANGUAGES: Language[] = [
  { code: "en", label: "ENG", full: "English" },
  { code: "as", label: "অস", full: "অসমীয়া" },
  { code: "hi", label: "हि", full: "हिन्दी" },
  { code: "mni", label: "মৈ", full: "Meitei" },
];

export const ROUTINE: RoutineItem[] = [
  { emoji: "💊", title: "Morning Medicine", time: "8:00 AM", status: "completed" },
  { emoji: "💧", title: "Water Reminder", time: "4 glasses today", status: "due" },
  { emoji: "👨‍👩‍👧", title: "Family Photos", time: "12 memories saved", status: "info" },
];
