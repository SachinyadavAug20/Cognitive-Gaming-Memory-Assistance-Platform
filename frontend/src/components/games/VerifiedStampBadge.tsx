"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PlusCircle, ShieldCheck } from "lucide-react";
import {
  useGameVerificationStore,
  INITIAL_VERIFICATIONS,
} from "@/store/useGameVerificationStore";
import { ClinicalEndorsementModal } from "./ClinicalEndorsementModal";
import { CaregiverVerifyModal } from "./CaregiverVerifyModal";

interface VerifiedStampBadgeProps {
  gameId: string;
  gameTitle?: string;
  gameDomain?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  forceShowUnverifiedInCaregiverMode?: boolean;
}

export function VerifiedStampBadge({
  gameId,
  gameTitle,
  gameDomain,
  className = "inline-flex items-center shrink-0",
  size = "md",
  forceShowUnverifiedInCaregiverMode = true,
}: VerifiedStampBadgeProps) {
  const { isGameVerified, getVerification, caregiverMode } =
    useGameVerificationStore();

  const [mounted, setMounted] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showCaregiverModal, setShowCaregiverModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Normalize id for vision variations (e.g. tea-harvest vs tea-harvest-vision)
  const normalizedId = gameId.replace(/-vision$/, "");

  // Safe verification check that works both before and after store hydration
  const verified = mounted
    ? isGameVerified(gameId) || isGameVerified(normalizedId)
    : Boolean(
        INITIAL_VERIFICATIONS[gameId]?.isVerified ||
          INITIAL_VERIFICATIONS[normalizedId]?.isVerified
      );

  const verification =
    getVerification(gameId) ||
    getVerification(normalizedId) ||
    INITIAL_VERIFICATIONS[gameId] ||
    INITIAL_VERIFICATIONS[normalizedId];

  // If not verified and caregiver mode is off, don't show badge
  if (!verified && (!caregiverMode || !forceShowUnverifiedInCaregiverMode)) {
    return null;
  }

  const sizeClasses = {
    sm: "w-8 h-8 min-w-[32px] p-0.5",
    md: "w-11 h-11 sm:w-12 sm:h-12 min-w-[44px] p-1",
    lg: "w-14 h-14 sm:w-15 sm:h-15 min-w-[56px] p-1.5",
  }[size];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (caregiverMode) {
      setShowCaregiverModal(true);
    } else {
      setShowCertificateModal(true);
    }
  };

  return (
    <>
      <div className={className}>
        {verified ? (
          <button
            type="button"
            onClick={handleClick}
            title={`Field Expert Verified: ${gameTitle || gameId}. Click to view clinical certification.`}
            aria-label={`Field Expert Verified: ${gameTitle || gameId}. Click to view clinical certification.`}
            className={`group relative flex items-center justify-center rounded-full bg-white border-2 border-black shadow-[2px_2px_0px_#000] cursor-pointer transition-all duration-200 hover:scale-105 hover:-rotate-6 hover:shadow-[3px_3px_0px_#000] active:scale-95 select-none ${sizeClasses}`}
          >
            <div className="relative w-full h-full">
              <Image
                src="/sample-images/101-removebg-preview.png"
                alt="Verified by Field Experts Seal"
                fill
                sizes="(max-width: 640px) 48px, 60px"
                className="object-contain"
                priority={false}
              />
            </div>
            {/* Pulsing Clinical Emerald Dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600 border border-white" />
            </span>
            <span className="sr-only">Verified by Field Expert & Caregiver</span>
          </button>
        ) : (
          /* Caregiver quick-stamp ghost button when in Caregiver Mode */
          <button
            type="button"
            onClick={handleClick}
            title={`Certify ${gameTitle || gameId} as Caregiver`}
            className="flex items-center gap-1 rounded-full border-2 border-dashed border-emerald-700/80 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-900 shadow-sm hover:bg-emerald-100 hover:border-emerald-800 transition-all cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-700" />
            <span>Certify</span>
          </button>
        )}
      </div>

      {/* Clinical Certificate Modal for Patients & Family */}
      <ClinicalEndorsementModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        verification={verification}
        gameTitle={gameTitle}
        gameDomain={gameDomain}
        onOpenEdit={() => setShowCaregiverModal(true)}
      />

      {/* Caregiver Verification Editing Modal */}
      <CaregiverVerifyModal
        isOpen={showCaregiverModal}
        onClose={() => setShowCaregiverModal(false)}
        gameId={gameId}
        gameTitle={gameTitle}
        gameDomain={gameDomain}
      />
    </>
  );
}
