"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PatientProfile } from "@/types/auth";
import {
  setSessionCookie,
  getSessionCookie,
  clearSessionCookie,
} from "@/lib/authCookie";

export const AUTH_STORAGE_KEY = "cognicare-auth";
export const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days (1 month)

interface AuthState {
  token: string | null;
  patient: PatientProfile | null;
  isAuthenticated: boolean;
  expiresAt: number | null;
  login: (token: string, patient: PatientProfile) => void;
  touchSession: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      patient: null,
      isAuthenticated: false,
      expiresAt: null,
      login: (token: string, patient: PatientProfile) => {
        const expiresAt = Date.now() + SESSION_DURATION_MS;
        set({
          token,
          patient,
          isAuthenticated: true,
          expiresAt,
        });
        setSessionCookie(token, patient, expiresAt);
      },
      touchSession: () => {
        const state = get();
        if (state.isAuthenticated && state.token && state.patient) {
          const expiresAt = Date.now() + SESSION_DURATION_MS;
          set({ expiresAt });
          setSessionCookie(state.token, state.patient, expiresAt);
        }
      },
      logout: () => {
        clearSessionCookie();
        set({
          token: null,
          patient: null,
          isAuthenticated: false,
          expiresAt: null,
        });
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        patient: state.patient,
        isAuthenticated: state.isAuthenticated,
        expiresAt: state.expiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // CRITICAL: Never call login() or logout() here — doing so triggers
        // a state update that fights with the active session and causes
        // redirect loops (dashboard flashes then kicks back to kiosk).
        //
        // Only sync the cookie in one direction: store → cookie.
        // Actual session restoration from cookie is handled by the
        // patient layout and kiosk client on mount.
        if (state.isAuthenticated && state.token && state.patient) {
          if (state.expiresAt && Date.now() > state.expiresAt) {
            // Session expired — clear cookie but do NOT mutate zustand state
            // during rehydration. The layout guard will handle the redirect.
            clearSessionCookie();
          } else {
            setSessionCookie(state.token, state.patient, state.expiresAt || undefined);
          }
        }
      },
    }
  )
);