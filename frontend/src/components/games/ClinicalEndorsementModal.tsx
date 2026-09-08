"use client";

import React from "react";
import Image from "next/image";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Stethoscope,
  HeartHandshake,
  Brain,
  Sparkles,
  Edit3,
  Award,
} from "lucide-react";
import type { GameVerification } from "@/store/useGameVerificationStore";

interface ClinicalEndorsementModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification?: GameVerification;
  gameTitle?: string;
  gameDomain?: string;
  onOpenEdit?: () => void;
}

export function ClinicalEndorsementModal({
  isOpen,
  onClose,
  verification,
  gameTitle,
  gameDomain,
  onOpenEdit,
}: ClinicalEndorsementModalProps) {
  if (!isOpen || !verification) return null;

  const getRoleBadge = (role: GameVerification["role"]) => {
    switch (role) {
      case "clinician":
        return {
          label: "Geriatrician / Neurologist",
          color: "bg-teal-100 text-teal-900 border-teal-500",
          icon: Stethoscope,
        };
      case "occupational_therapist":
        return {
          label: "Occupational Therapist",
          color: "bg-blue-100 text-blue-900 border-blue-500",
          icon: Award,
        };
      case "asha_worker":
        return {
          label: "Community ASHA Worker",
          color: "bg-amber-100 text-amber-900 border-amber-500",
          icon: Sparkles,
        };
      case "caregiver":
      default:
        return {
          label: "Certified Caregiver",
          color: "bg-emerald-100 text-emerald-900 border-emerald-500",
          icon: HeartHandshake,
        };
    }
  };

  const roleInfo = getRoleBadge(verification.role);
  const RoleIcon = roleInfo.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border-4 border-black bg-surface p-6 shadow-[8px_8px_0px_#000] text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-surface-muted text-ink hover:bg-brick-light hover:text-brick transition-colors cursor-pointer shadow-[2px_2px_0px_#000]"
          aria-label="Close clinical endorsement modal"
        >
          <X className="h-5 w-5 stroke-[2.5]" />
        </button>

        {/* Header with Official Stamp Seal & Title */}
        <div className="flex items-start gap-4 pb-4 border-b-2 border-black/10">
          <div className="relative h-20 w-20 shrink-0 select-none">
            <Image
              src="/sample-images/101-removebg-preview.png"
              alt="Field Expert Verified Stamp"
              fill
              className="object-contain drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] rotate-[-6deg]"
              priority
            />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wide">
              <ShieldCheck className="h-4 w-4" />
              <span>Digital Therapeutics Certification</span>
            </div>
            <h2 className="mt-0.5 text-lg sm:text-xl font-black text-ink leading-tight">
              {gameTitle || "Cognitive Gaming Module"}
            </h2>
            {gameDomain && (
              <span className="inline-flex items-center gap-1 mt-1 rounded bg-tea-light px-2 py-0.5 text-[10px] font-extrabold text-tea border border-tea/40">
                <Brain className="h-3 w-3" /> {gameDomain}
              </span>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="mt-4 space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {/* Verifier Badge */}
          <div className="rounded-2xl border-2 border-black/15 bg-surface-muted p-3.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase text-ink-secondary tracking-wider">
                Endorsing Field Expert / Caregiver
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black border ${roleInfo.color}`}
              >
                <RoleIcon className="h-3 w-3" />
                {roleInfo.label}
              </span>
            </div>
            <div className="mt-1 text-sm font-black text-ink">
              {verification.verifiedBy}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-ink-secondary">
              <Calendar className="h-3.5 w-3.5" />
              <span>Certified on {verification.verifiedAt}</span>
            </div>
          </div>

          {/* Staging Calibration */}
          {verification.targetStage && (
            <div className="rounded-xl border-2 border-amber-900/20 bg-amber-50/80 p-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                Target Staging & Clinical Domain
              </span>
              <div className="mt-0.5 text-xs font-bold text-amber-950">
                {verification.targetStage}
              </div>
            </div>
          )}

          {/* Clinical Rationale */}
          <div className="rounded-2xl border-2 border-emerald-900/20 bg-emerald-50/60 p-3.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">
              Clinical & Caregiver Rationale
            </span>
            <p className="mt-1 text-xs sm:text-sm font-medium text-emerald-950 leading-relaxed border-l-2 border-emerald-600 pl-2.5 italic">
              &ldquo;{verification.clinicalRationale}&rdquo;
            </p>
          </div>

          {/* Safety & Ergonomic Assurances */}
          {verification.safetyAssurances && verification.safetyAssurances.length > 0 && (
            <div className="rounded-2xl border-2 border-black/10 bg-white p-3.5 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-ink-secondary">
                Dementia Safety Assurances
              </span>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {verification.safetyAssurances.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-xs font-bold text-ink"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-between border-t-2 border-black/10 pt-4 gap-2">
          {onOpenEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEdit();
              }}
              className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface-muted px-3 py-2 text-xs font-black text-ink hover:bg-amber-100 cursor-pointer shadow-[2px_2px_0px_#000]"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>Edit Endorsement</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="btn-tactile ml-auto rounded-xl border-2 border-black bg-tea px-4 py-2 text-xs font-black text-white hover:bg-emerald-800 cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
