"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Save,
  Sparkles,
  Stethoscope,
  HeartHandshake,
  Award,
} from "lucide-react";
import {
  useGameVerificationStore,
  type GameVerification,
} from "@/store/useGameVerificationStore";
import { ensureAudioContext } from "@/lib/sound";

interface CaregiverVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameTitle?: string;
  gameDomain?: string;
}

const COMMON_SAFETY_ASSURANCES = [
  "Zero Blue-Light Exhaustion",
  "Fall-Safe Seated Kinematics",
  "Low Cognitive Stress Timers",
  "Culturally Congruent Grounding",
  "Paced Multi-Sensory Prompts",
  "Tremor-Compensated Gestures",
];

function playTactileStampSound() {
  try {
    const audioCtx = ensureAudioContext();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch {
    // AudioContext not supported or blocked
  }
}

export function CaregiverVerifyModal({
  isOpen,
  onClose,
  gameId,
  gameTitle,
  gameDomain,
}: CaregiverVerifyModalProps) {
  const { getVerification, setVerification, removeVerification } =
    useGameVerificationStore();
  const existing = getVerification(gameId);

  const [verifiedBy, setVerifiedBy] = useState(
    existing?.verifiedBy || "Sunita Borah (Primary Caregiver)"
  );
  const [role, setRole] = useState<GameVerification["role"]>(
    existing?.role || "caregiver"
  );
  const [targetStage, setTargetStage] = useState(
    existing?.targetStage || "Mild Cognitive Impairment (CDR 0.5)"
  );
  const [clinicalRationale, setClinicalRationale] = useState(
    existing?.clinicalRationale ||
      "Evaluated for daily cognitive stimulation. Demonstrates strong engagement and calm mood retention."
  );
  const [safetyAssurances, setSafetyAssurances] = useState<string[]>(
    existing?.safetyAssurances || [
      "Zero Blue-Light Exhaustion",
      "Fall-Safe Seated Kinematics",
      "Low Cognitive Stress Timers",
    ]
  );
  const [isStampSuccess, setIsStampSuccess] = useState(false);

  useEffect(() => {
    if (existing) {
      setVerifiedBy(existing.verifiedBy);
      setRole(existing.role);
      setTargetStage(existing.targetStage);
      setClinicalRationale(existing.clinicalRationale);
      setSafetyAssurances(existing.safetyAssurances || []);
    } else {
      setVerifiedBy("Sunita Borah (Primary Caregiver)");
      setRole("caregiver");
      setTargetStage("Mild Cognitive Impairment (CDR 0.5)");
      setClinicalRationale(
        "Evaluated for daily cognitive stimulation. Demonstrates strong engagement and calm mood retention."
      );
      setSafetyAssurances([
        "Zero Blue-Light Exhaustion",
        "Fall-Safe Seated Kinematics",
        "Low Cognitive Stress Timers",
      ]);
    }
  }, [existing, isOpen]);

  if (!isOpen) return null;

  const handleToggleSafety = (item: string) => {
    setSafetyAssurances((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const handleSave = () => {
    const today = new Date().toISOString().split("T")[0];
    const newVerification: GameVerification = {
      gameId,
      isVerified: true,
      verifiedBy: verifiedBy.trim() || "Sunita Borah (Caregiver)",
      role,
      verifiedAt: today,
      clinicalRationale:
        clinicalRationale.trim() ||
        "Clinically certified for targeted cognitive therapy.",
      targetStage: targetStage.trim() || "Mild Cognitive Impairment (CDR 0.5)",
      safetyAssurances,
    };

    setVerification(newVerification);
    playTactileStampSound();
    setIsStampSuccess(true);

    setTimeout(() => {
      setIsStampSuccess(false);
      onClose();
    }, 600);
  };

  const handleRevoke = () => {
    removeVerification(gameId);
    onClose();
  };

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
          aria-label="Close modal"
        >
          <X className="h-5 w-5 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pb-3 border-b-2 border-black/10">
          <div className="relative h-14 w-14 shrink-0">
            <Image
              src="/sample-images/101-removebg-preview.png"
              alt="Verification Stamp"
              fill
              className={`object-contain drop-shadow transition-transform duration-300 ${
                isStampSuccess ? "scale-125 rotate-0" : "-rotate-6"
              }`}
            />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
              Caregiver & Clinician Endorsement
            </span>
            <h2 className="text-lg font-black text-ink leading-tight">
              Certify: {gameTitle || gameId}
            </h2>
            {gameDomain && (
              <span className="text-xs font-bold text-ink-secondary">
                Domain: {gameDomain}
              </span>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="mt-4 space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {/* Verifier Name */}
          <div>
            <label className="block text-xs font-black uppercase text-ink-secondary tracking-wider mb-1">
              Endorser Name & Credentials
            </label>
            <input
              type="text"
              value={verifiedBy}
              onChange={(e) => setVerifiedBy(e.target.value)}
              placeholder="e.g. Dr. B. K. Sarma or Sunita Borah"
              className="w-full rounded-xl border-2 border-black bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-ink shadow-[2px_2px_0px_#000] focus:outline-hidden focus:ring-2 focus:ring-tea"
            />
          </div>

          {/* Endorser Role */}
          <div>
            <label className="block text-xs font-black uppercase text-ink-secondary tracking-wider mb-1">
              Endorser Role
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "caregiver", label: "Caregiver", icon: HeartHandshake },
                { id: "clinician", label: "Clinician / Doctor", icon: Stethoscope },
                {
                  id: "occupational_therapist",
                  label: "Occupational Therapist",
                  icon: Award,
                },
                { id: "asha_worker", label: "ASHA Worker", icon: Sparkles },
              ].map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as GameVerification["role"])}
                    className={`flex items-center gap-1.5 rounded-xl border-2 border-black p-2 text-xs font-black transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                      isSelected
                        ? "bg-tea text-white scale-[1.02]"
                        : "bg-surface-muted text-ink hover:bg-tea-light"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Stage */}
          <div>
            <label className="block text-xs font-black uppercase text-ink-secondary tracking-wider mb-1">
              Recommended Staging
            </label>
            <input
              type="text"
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value)}
              placeholder="e.g. Mild Cognitive Impairment (CDR 0.5)"
              className="w-full rounded-xl border-2 border-black bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-ink shadow-[2px_2px_0px_#000] focus:outline-hidden focus:ring-2 focus:ring-tea"
            />
          </div>

          {/* Clinical Rationale */}
          <div>
            <label className="block text-xs font-black uppercase text-ink-secondary tracking-wider mb-1">
              Clinical Rationale & Observations
            </label>
            <textarea
              rows={3}
              value={clinicalRationale}
              onChange={(e) => setClinicalRationale(e.target.value)}
              placeholder="Explain why this serious game benefits this patient..."
              className="w-full rounded-xl border-2 border-black bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-ink shadow-[2px_2px_0px_#000] focus:outline-hidden focus:ring-2 focus:ring-tea"
            />
          </div>

          {/* Safety Assurances */}
          <div>
            <label className="block text-xs font-black uppercase text-ink-secondary tracking-wider mb-1">
              Verified Safety Assurances
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {COMMON_SAFETY_ASSURANCES.map((item) => {
                const isChecked = safetyAssurances.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleSafety(item)}
                    className={`flex items-center gap-2 rounded-lg border-2 border-black/20 p-2 text-left text-xs font-bold transition-all cursor-pointer ${
                      isChecked
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950"
                        : "bg-surface-muted text-ink-secondary hover:bg-surface"
                    }`}
                  >
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${
                        isChecked ? "text-emerald-700" : "text-black/30"
                      }`}
                    />
                    <span className="leading-tight">{item}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-between border-t-2 border-black/10 pt-4 gap-2">
          {existing && (
            <button
              type="button"
              onClick={handleRevoke}
              className="btn-tactile flex items-center gap-1 rounded-xl border-2 border-black bg-brick-light px-3 py-2 text-xs font-black text-brick hover:bg-brick hover:text-white cursor-pointer shadow-[2px_2px_0px_#000]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Revoke</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="btn-tactile rounded-xl border-2 border-black bg-surface-muted px-3.5 py-2 text-xs font-black text-ink hover:bg-black/5 cursor-pointer shadow-[2px_2px_0px_#000]"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea px-4 py-2 text-xs font-black text-white hover:bg-emerald-800 cursor-pointer shadow-[2px_2px_0px_#000]"
            >
              <Save className="h-4 w-4" />
              <span>{existing ? "Update Certification" : "Apply Expert Stamp"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
