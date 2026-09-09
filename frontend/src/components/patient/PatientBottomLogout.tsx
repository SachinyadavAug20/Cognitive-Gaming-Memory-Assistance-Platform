"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { clearSessionCookie } from "@/lib/authCookie";
import { playTapFeedback } from "@/lib/sound";
import { LogOut, ShieldCheck, AlertCircle, X, ArrowLeft } from "lucide-react";

interface PatientBottomLogoutProps {
  className?: string;
}

export function PatientBottomLogout({ className = "" }: PatientBottomLogoutProps) {
  const router = useRouter();
  const patient = useAuthStore((s) => s.patient);
  const logout = useAuthStore((s) => s.logout);
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleOpenModal = () => {
    playTapFeedback();
    setIsConfirming(false);
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    playTapFeedback();
    setIsOpen(false);
  };

  const handleConfirmLogout = useCallback(() => {
    playTapFeedback();
    setIsConfirming(true);

    // Clear 30-day cookie and Zustand auth store
    clearSessionCookie();
    logout();

    // Redirect to kiosk scanner
    setTimeout(() => {
      router.push("/kiosk/login");
    }, 200);
  }, [logout, router]);

  const patientName = patient?.name || "Patient";

  return (
    <>
      {/* Discreet bottom caregiver / user-switch bar */}
      <div className={`mt-8 pt-4 pb-6 border-t-2 border-black/10 text-center ${className}`}>
        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-ink-secondary/80 hover:text-ink hover:bg-black/5 border border-black/20 hover:border-black/40 transition-all cursor-pointer shadow-2xs"
          title="Caregiver: End current session to allow another patient to log in"
          aria-label="Caregiver switch patient or log out"
        >
          <ShieldCheck className="h-4 w-4 text-ink-secondary/70" />
          <span>Caregiver Access: Switch Patient / Log Out</span>
        </button>
      </div>

      {/* Safety Confirmation Modal: Prevents accidental logouts by dementia patients */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseModal();
          }}
        >
          <div className="w-full max-w-md rounded-3xl border-3 border-black bg-white p-6 sm:p-7 shadow-[8px_8px_0px_#000] text-left space-y-4">
            {/* Header with warning icon */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-amber-100 text-amber-800 shadow-[2px_2px_0px_#000]">
                  <AlertCircle className="h-6 w-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 id="logout-dialog-title" className="font-serif text-lg sm:text-xl font-black text-ink">
                    Switch Patient Session?
                  </h3>
                  <p className="text-xs font-bold text-ink-secondary">
                    Active Session: <span className="text-tea font-black">{patientName}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="rounded-xl border-2 border-black/20 p-1.5 text-ink-secondary hover:text-ink hover:border-black transition-colors cursor-pointer"
                aria-label="Cancel and close dialog"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Explanation text tailored for elder safety */}
            <div className="rounded-2xl border-2 border-black/10 bg-[#FAF6F0] p-4 text-xs sm:text-sm font-semibold text-ink-secondary leading-relaxed">
              <p>
                Are you a caregiver or switching users? Ending this session will return to the Health Card scanner so another person can check in.
              </p>
              <p className="mt-2 text-ink font-bold">
                If you are enjoying your games and routine, tap <span className="text-emerald-800 underline">Keep Playing</span>.
              </p>
            </div>

            {/* Action buttons: Safe default vs. Deliberate logout */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {/* Primary Safe Button: Keep Playing */}
              <button
                type="button"
                autoFocus
                onClick={handleCloseModal}
                className="flex-1 btn-tactile flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-tea text-white px-5 py-3 text-sm font-black shadow-[3px_3px_0px_#000] hover:bg-emerald-800 cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Keep Playing</span>
              </button>

              {/* Deliberate Exit Button: Requires intentional click */}
              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isConfirming}
                className="btn-tactile flex items-center justify-center gap-2 rounded-2xl border-2 border-black bg-rose-50 text-rose-700 hover:bg-rose-100 hover:text-rose-800 px-4 py-3 text-xs sm:text-sm font-black shadow-[3px_3px_0px_#000] cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>{isConfirming ? "Exiting..." : "Log Out & Switch"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
