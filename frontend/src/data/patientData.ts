import type { Reminder } from "@/types";

export const REMINDERS: Reminder[] = [
  { emoji: "💊", time: "8:00 AM", title: "Blood Pressure Medicine", status: "completed" },
  { emoji: "💧", time: "10:00 AM", title: "Drink Water", status: "completed" },
  { emoji: "💊", time: "12:00 PM", title: "Afternoon Medicine", status: "due" },
  { emoji: "💧", time: "2:00 PM", title: "Drink Water", status: "upcoming" },
];

export const WATER_GLASSES = [true, true, true, true, false, false];
