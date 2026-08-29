"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { PatientProfile } from "@/types/auth";

export const AUTH_STORAGE_KEY = "cognicare-auth";

interface AuthState {
  token: string | null;
  patient: PatientProfile | null;
  isAuthenticated: boolean;
  login: (token: string, patient: PatientProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      patient: null,
      isAuthenticated: false,
      login: (token: string, patient: PatientProfile) =>
        set({ token, patient, isAuthenticated: true }),
      logout: () =>
        set({ token: null, patient: null, isAuthenticated: false }),
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        patient: state.patient,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);