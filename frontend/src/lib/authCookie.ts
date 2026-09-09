/**
 * 30-Day Client & Kiosk Session Cookie Management
 * Ensures QR scan sessions persist for a full month (30 days) across browser restarts
 * and supports 1-click auto-login on kiosk scanner.
 */

import type { PatientProfile } from "@/types/auth";

export const AUTH_COOKIE_NAME = "cognicare_session";
export const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days = 2,592,000 seconds

export interface SessionCookieData {
  token: string;
  patient: {
    id: number;
    name: string;
    languagePreference?: string | null;
  };
  expiresAt: number; // epoch ms
}

/**
 * Persist the active patient authentication session into a 30-day cookie.
 */
export function setSessionCookie(
  token: string,
  patient: PatientProfile,
  customExpiresAt?: number
): void {
  if (typeof document === "undefined") return;

  const expiresAt = customExpiresAt ?? Date.now() + COOKIE_MAX_AGE_SECONDS * 1000;
  const payload: SessionCookieData = {
    token,
    patient: {
      id: patient.id,
      name: patient.name,
      languagePreference: patient.languagePreference,
    },
    expiresAt,
  };

  try {
    const serialized = encodeURIComponent(JSON.stringify(payload));
    document.cookie = `${AUTH_COOKIE_NAME}=${serialized}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  } catch (err) {
    console.warn("Failed to write session cookie:", err);
  }
}

/**
 * Retrieve active session data from cookie, verifying 30-day expiration window.
 */
export function getSessionCookie(): SessionCookieData | null {
  if (typeof document === "undefined") return null;

  try {
    const cookies = document.cookie.split(";").map((c) => c.trim());
    const match = cookies.find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
    if (!match) return null;

    const rawValue = match.substring(AUTH_COOKIE_NAME.length + 1);
    if (!rawValue) return null;

    const parsed: SessionCookieData = JSON.parse(decodeURIComponent(rawValue));
    if (!parsed || !parsed.token || !parsed.patient?.id) {
      clearSessionCookie();
      return null;
    }

    // Check if session has expired past 30 days
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      clearSessionCookie();
      return null;
    }

    return parsed;
  } catch {
    clearSessionCookie();
    return null;
  }
}

/**
 * Clear the session cookie immediately (for caregiver/switch patient logout).
 */
export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}
