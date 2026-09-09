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
        // Expire only if 30 days have elapsed
        if (state.expiresAt && Date.now() > state.expiresAt) {
          state.logout();
        } else if (state.isAuthenticated && state.token && state.patient) {
          // Re-sync cookie with existing active session
          setSessionCookie(state.token, state.patient, state.expiresAt || undefined);
        } else if (!state.isAuthenticated) {
          // Check if a 30-day cookie exists to restore session
          const cookieData = getSessionCookie();
          if (cookieData && cookieData.token && cookieData.patient) {
            state.login(cookieData.token, cookieData.patient as PatientProfile);
          }
        }
      },
    }
  )
);