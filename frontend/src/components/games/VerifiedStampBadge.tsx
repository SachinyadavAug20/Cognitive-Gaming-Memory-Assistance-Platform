"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { PlusCircle, ShieldCheck } from "lucide-react";
import { useLocale } from "next-intl";
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

const STAMP_BADGE_I18N: Record<string, {
  verifiedTitle: string;
  srOnly: string;
  certifyBtn: string;
  certifyTitle: string;
}> = {
  en: {
    verifiedTitle: "Field Expert Verified: Click to view clinical certification.",
    srOnly: "Verified by Field Expert & Caregiver",
    certifyBtn: "Certify",
    certifyTitle: "Certify as Caregiver",
  },
  as: {
    verifiedTitle: "ক্ষেত্ৰ বিশেষজ্ঞ দ্বাৰা প্ৰত্যায়িত: ক্লিনিকেল প্ৰমাণপত্ৰ চাবলৈ ক্লিক কৰক।",
    srOnly: "ক্ষেত্ৰ বিশেষজ্ঞ আৰু তত্ত্বাৱধায়ক দ্বাৰা প্ৰত্যায়িত",
    certifyBtn: "প্ৰত্যায়িত কৰক",
    certifyTitle: "তত্ত্বাবধায়ক হিচাপে প্ৰত্যায়িত কৰক",
  },
  hi: {
    verifiedTitle: "क्षेत्र विशेषज्ञ द्वारा सत्यापित: नैदानिक प्रमाण पत्र देखने के लिए क्लिक करें।",
    srOnly: "क्षेत्र विशेषज्ञ और देखभालकर्ता द्वारा सत्यापित",
    certifyBtn: "प्रमाणित करें",
    certifyTitle: "देखभालकर्ता के रूप में प्रमाणित करें",
  },
  bn: {
    verifiedTitle: "ক্ষেত্র বিশেষজ্ঞ দ্বারা প্রত্যয়িত: ক্লিনিক্যাল প্রশংসাপত্র দেখতে ক্লিক করুন।",
    srOnly: "ক্ষেত্র বিশেষজ্ঞ ও পরিচর্যাকারী দ্বারা প্রত্যয়িত",
    certifyBtn: "প্রত্যয়ন করুন",
    certifyTitle: "পরিচর্যাকারী হিসেবে প্রত্যয়ন করুন",
  },
  mr: {
    verifiedTitle: "क्षेत्र तज्ज्ञांद्वारे सत्यापित: क्लिनिकल प्रमाणपत्र पाहण्यासाठी क्लिक करा.",
    srOnly: "क्षेत्र तज्ज्ञ आणि काळजीवाहू द्वारे सत्यापित",
    certifyBtn: "प्रमाणित करा",
    certifyTitle: "काळजीवाहू म्हणून प्रमाणित करा",
  },
  ne: {
    verifiedTitle: "क्षेत्र विशेषज्ञद्वारा प्रमाणित: क्लिनिकल प्रमाणपत्र हेर्न क्लिक गर्नुहोस्।",
    srOnly: "क्षेत्र विशेषज्ञ र हेरचाहकर्ताद्वारा प्रमाणित",
    certifyBtn: "प्रमाणित गर्नुहोस्",
    certifyTitle: "हेरचाहकर्ताको रूपमा प्रमाणित गर्नुहोस्",
  },
  mni: {
    verifiedTitle: "লমদমগী এক্সপার্টনা চেকিং তৌরবা: ক্লিনিকেল সর্তিফিকেট য়েংনবগীদমক ক্লিক তৌউ।",
    srOnly: "লমদমগী এক্সপার্ট অমসুং য়েংশিনবিরিবনা চেকিং তৌরবা",
    certifyBtn: "সর্তিফাই তৌউ",
    certifyTitle: "য়েংশিনবিরিবা ওইনা সর্তিফাই তৌউ",
  },
  brx: {
    verifiedTitle: "बिजिरगिरिजों थार आनजाद खालामनाय: क्लिनिकেল सार्टिफिकेट नायनो थु।",
    srOnly: "बिजिरगिरि आरो नायदिंग्राजों थार आनजाद खालामनाय",
    certifyBtn: "सार्टिफाइ खालाम",
    certifyTitle: "नायदिंग्रा हिसाबै सार्टिफाइ खालाम",
  },
  grt: {
    verifiedTitle: "Field Expert Sakki On·gimin: Certificate-ko nina jotbo.",
    srOnly: "Field Expert aro Nirokgipachi Sakki On·gimin",
    certifyBtn: "Sakki On·bo",
    certifyTitle: "Nirokgipa gita Sakki On·bo",
  },
  kha: {
    verifiedTitle: "La pynshisha da ki Expert: Thb ban peit ia ka certificate.",
    srOnly: "La pynshisha da ki Expert bad u Nongsumar",
    certifyBtn: "Pynshisha",
    certifyTitle: "Pynshisha kum u Nongsumar",
  },
  lus: {
    verifiedTitle: "Mithiamte Nemngheh: Certificate en nan hmet rawh.",
    srOnly: "Mithiamte leh Enkawltu Nemngheh",
    certifyBtn: "Nemngheh Rawh",
    certifyTitle: "Enkawltu anga Nemngheh Rawh",
  },
};

export function VerifiedStampBadge({
  gameId,
  gameTitle,
  gameDomain,
  className = "inline-flex items-center shrink-0",
  size = "md",
  forceShowUnverifiedInCaregiverMode = true,
}: VerifiedStampBadgeProps) {
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const t = STAMP_BADGE_I18N[normLoc] || STAMP_BADGE_I18N.en;
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
            title={`${t.verifiedTitle} (${gameTitle || gameId})`}
            aria-label={`${t.verifiedTitle} (${gameTitle || gameId})`}
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
            <span className="sr-only">{t.srOnly}</span>
          </button>
        ) : (
          /* Caregiver quick-stamp ghost button when in Caregiver Mode */
          <button
            type="button"
            onClick={handleClick}
            title={`${t.certifyTitle}: ${gameTitle || gameId}`}
            className="flex items-center gap-1 rounded-full border-2 border-dashed border-emerald-700/80 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-900 shadow-sm hover:bg-emerald-100 hover:border-emerald-800 transition-all cursor-pointer"
          >
            <PlusCircle className="h-3.5 w-3.5 text-emerald-700" />
            <span>{t.certifyBtn}</span>
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
