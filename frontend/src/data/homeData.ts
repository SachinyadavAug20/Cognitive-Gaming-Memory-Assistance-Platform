import type { RoutineItem } from "@/types";

export const ROUTINE: RoutineItem[] = [
  { key: "morning_medicine", timeKey: "medicine_time", emoji: "💊", title: "Morning Medicine", time: "8:00 AM", status: "completed" },
  { key: "water_reminder", timeKey: "water_count", emoji: "💧", title: "Water Reminder", time: "4 glasses today", status: "due" },
  { key: "family_photos", timeKey: "memories_count", emoji: "👨‍👩‍👧", title: "Family Photos", time: "12 memories saved", status: "info" },
];
