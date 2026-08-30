import type { PatientDetailRecord } from "@/types";

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function startLevel(detail: PatientDetailRecord | null): number {
  return clamp(
    detail?.medicalProfile?.gameConfig?.startLevel ??
      detail?.medicalProfile?.recommendedStartDifficulty ??
      1,
    1,
    3
  );
}

export function speechRate(detail: PatientDetailRecord | null): number {
  return detail?.medicalProfile?.gameConfig?.audioSpeechRate ?? 0.85;
}

export function memoryGridSize(detail: PatientDetailRecord | null): number {
  return clamp(detail?.medicalProfile?.gameConfig?.memoryGridSize ?? 3, 2, 4);
}

export function memoryPreviewSeconds(
  detail: PatientDetailRecord | null
): number {
  return clamp(detail?.medicalProfile?.gameConfig?.memoryPreviewSeconds ?? 10, 0, 30);
}

export function memoryShowHints(detail: PatientDetailRecord | null): boolean {
  return detail?.medicalProfile?.gameConfig?.memoryShowHints ?? true;
}

export function wayfindingRouteLength(
  detail: PatientDetailRecord | null
): number {
  return clamp(detail?.medicalProfile?.gameConfig?.wayfindingRouteLength ?? 3, 2, 8);
}