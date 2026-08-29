"use client";

import { create } from "zustand";
import type { PatientProfile } from "@/types/auth";

interface AuthState {
  token: string | null;
  patient: PatientProfile | null;
  isAuthenticated: boolean;
  login: (token: string, patient: PatientProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  patient: null,
  isAuthenticated: false,
  login: (token: string, patient: PatientProfile) =>
    set({ token, patient, isAuthenticated: true }),
  logout: () =>
    set({ token: null, patient: null, isAuthenticated: false }),
}));