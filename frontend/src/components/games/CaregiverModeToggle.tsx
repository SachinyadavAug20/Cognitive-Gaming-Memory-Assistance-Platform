"use client";

import React from "react";
import { ShieldCheck, UserCheck } from "lucide-react";
import { useGameVerificationStore } from "@/store/useGameVerificationStore";

export function CaregiverModeToggle() {
  const { caregiverMode, toggleCaregiverMode } = useGameVerificationStore();

  return (
    <button
      type="button"
      onClick={toggleCaregiverMode}
      title={
        caregiverMode
          ? "Caregiver Verification Mode is ON. Click to switch to Patient view."
          : "Enable Caregiver Verification Mode to endorse or stamp games."
      }
      className={`btn-tactile flex items-center gap-2 rounded-2xl border-2 border-black px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
        caregiverMode
          ? "bg-tea text-white scale-[1.02] shadow-[3px_3px_0px_#000]"
          : "bg-surface text-ink hover:bg-surface-muted"
      }`}
    >
      {caregiverMode ? (
        <>
          <ShieldCheck className="h-4 w-4 text-emerald-200" />
          <span>Caregiver Mode: Active</span>
          <span className="h-2 w-2 rounded-full bg-emerald-300 animate-ping" />
        </>
      ) : (
        <>
          <UserCheck className="h-4 w-4 text-ink-secondary" />
          <span>Caregiver Stamping</span>
        </>
      )}
    </button>
  );
}
