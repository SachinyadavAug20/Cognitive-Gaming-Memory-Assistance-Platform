"use client";

import { api } from "@/lib/api";
import type { GameSessionPayload } from "@/types/gameSession";

const OFFLINE_SESSIONS_KEY = "cognicare-offline-game-sessions";

export async function submitGameSessionTelemetry(
  payload: GameSessionPayload
): Promise<boolean> {
  // Always cache locally for offline telemetry
  try {
    const raw = localStorage.getItem(OFFLINE_SESSIONS_KEY);
    const existing = raw ? (JSON.parse(raw) as GameSessionPayload[]) : [];
    existing.push({ ...payload });
    localStorage.setItem(OFFLINE_SESSIONS_KEY, JSON.stringify(existing.slice(-100)));
  } catch {
    // Ignore storage issues
  }

  // Attempt live sync to Spring Boot backend
  if (!payload.patientId || payload.patientId <= 0) {
    return true; // Guest session recorded offline
  }

  try {
    await api.post(`/patients/${payload.patientId}/sessions`, payload);
    return true;
  } catch {
    // Graceful offline fallback
    return false;
  }
}
