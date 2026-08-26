// Shared API types — mirrors backend DTOs
// Import in frontend: import { User, Patient } from "../../shared/api-types"

export type UserRole = "PATIENT" | "CAREGIVER" | "ADMIN";

export interface User {
  id: number;
  name: string;
  role: UserRole;
  language: string;
}

export interface Patient {
  id: number;
  age: number;
  userId: number;
  caregiverId: number;
}

export interface Memory {
  id: number;
  patientId: number;
  filePath: string;
  personName: string;
  relationship: string;
  description: string;
}

export type GameType = "PUZZLE" | "WAYFINDING";

export interface GameSession {
  id: number;
  patientId: number;
  gameType: GameType;
  score: number;
  difficultyLevel: number;
  responseTime: number;
  mistakes: number;
  hintsUsed: number;
  createdAt: string;
}

export interface CognitiveProfile {
  patientId: number;
  visualMemory: number;
  recognition: number;
  spatialMemory: number;
  navigation: number;
  reactionTime: number;
}

export interface Reminder {
  id: number;
  patientId: number;
  type: "MEDICINE" | "HYDRATION" | "APPOINTMENT" | "ACTIVITY";
  message: string;
  scheduledAt: string;
  completed: boolean;
}

export interface Alert {
  id: number;
  patientId: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  isRead: boolean;
  createdAt: string;
}
