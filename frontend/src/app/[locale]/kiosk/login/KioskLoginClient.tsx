"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Paperclip,
  CheckCircle2,
  Check,
  RotateCcw,
  AlertTriangle,
  QrCode,
  HeartHandshake,
} from "lucide-react";
import { KioskScanner } from "@/components/kiosk/KioskScanner";
import { useAuthStore } from "@/store/useAuthStore";
import { api, HttpError } from "@/lib/api";
import { playScanSuccess, playError, playTapFeedback } from "@/lib/sound";
import type { KioskScanResponse, PatientProfile } from "@/types/auth";

type ScanStatus = "scanning" | "loading" | "success" | "error";

export function KioskLoginClient() {
  const t = useTranslations("kiosk");
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const [status, setStatus] = useState<ScanStatus>("scanning");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verifiedPatient, setVerifiedPatient] = useState<{
    name: string;
    id: number;
    language?: string;
  } | null>(null);

  const busyRef = useRef(false);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason?.name || String(event.reason);
      if (
        reason.includes("AbortError") ||
        reason.includes("aborted by the user agent") ||
        reason.includes("media resource")
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  }, []);

  const completeLoginSuccess = useCallback(
    (token: string, patient: PatientProfile) => {
      playScanSuccess();
      setVerifiedPatient({
        name: patient.name,
        id: patient.id,
        language: patient.languagePreference || "en",
      });
      setStatus("success");

      login(token, patient);

      // Smooth auto-redirect after celebration
      setTimeout(() => {
        router.push("/patient");
      }, 1500);
    },
    [login, router]
  );

  const handleScan = useCallback(
    (text: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setStatus("loading");
      playTapFeedback();

      api
        .post<KioskScanResponse>("/auth/kiosk/scan", { qrData: text.trim() })
        .then((res) => {
          completeLoginSuccess(res.token, res.patient);
        })
        .catch((err) => {
          busyRef.current = false;
          playError();
          const unauthorized = err instanceof HttpError && err.status === 401;
          setErrorMsg(
            unauthorized
              ? "Unrecognized Health Card. Please show a valid CogniCare Health Card QR code."
              : "Could not connect to health server. Please try again."
          );
          setStatus("error");
        });
    },
    [completeLoginSuccess]
  );

  const resetScanner = () => {
    playTapFeedback();
    busyRef.current = false;
    setErrorMsg(null);
    setStatus("scanning");
  };

  return (
    <main className="min-h-screen bg-canvas paper-texture flex flex-col justify-between px-4 py-5 md:py-8">
      {/* Top Header Navigation */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between pb-3 border-b-2 border-black/10">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-tea" />
          <span className="text-xs font-black uppercase tracking-wider text-ink">
            MDoNER Health Kiosk // QR Card Terminal
          </span>
        </div>
        <Link
          href="/"
          className="text-xs font-black text-ink-secondary hover:text-ink transition-colors"
        >
          ← Return to Home
        </Link>
      </div>

      {/* Main Kiosk Center Section */}
      <div className="w-full max-w-xl mx-auto my-auto flex flex-col items-center text-center py-4">
        <div className="mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tea-light border border-tea/30 text-tea-dark text-xs font-black mb-2 shadow-sm">
            <QrCode className="h-3.5 w-3.5" />
            <span>Health Card QR Login</span>
          </div>
          <h1 className="font-serif font-black text-2xl md:text-4xl text-ink leading-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm md:text-base font-bold text-ink-secondary max-w-md mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Scanner Container with Overlay States */}
        <div className="relative w-full max-w-[420px] mx-auto">
          <KioskScanner
            onScan={handleScan}
            paused={status !== "scanning"}
            isError={status === "error"}
          />

          {/* ── SUCCESS OVERLAY MODAL ── */}
          {status === "success" && verifiedPatient && (
            <div className="absolute inset-0 bg-surface rounded-2xl border-3 border-black p-6 shadow-[6px_6px_0px_#000] flex flex-col items-center justify-between z-30 scan-success-overlay">
              <div className="w-full flex flex-col items-center my-auto">
                {/* Green Check Shield Animation */}
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center border-3 border-black shadow-[3px_3px_0px_#000] mb-3 scan-check-pop">
                  <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
                </div>

                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                  <span>Card Verified</span>
                </span>

                <h2 className="font-serif font-black text-2xl md:text-3xl text-ink">
                  {verifiedPatient.name}
                </h2>
                <p className="text-xs font-bold text-ink-secondary mt-1">
                  Signing you into your daily therapy session...
                </p>
              </div>

              {/* Progress Redirect Bar */}
              <div className="w-full mt-4">
                <div className="w-full bg-surface-muted h-2.5 rounded-full overflow-hidden border-2 border-black">
                  <div className="bg-tea h-full w-full rounded-full transition-all duration-1000 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* ── ERROR ALERT STATE ── */}
          {status === "error" && errorMsg && (
            <div className="absolute inset-0 bg-surface/95 backdrop-blur-xs rounded-2xl border-3 border-brick p-6 shadow-[5px_5px_0px_var(--color-brick)] flex flex-col items-center justify-center text-center z-30">
              <div className="w-14 h-14 rounded-2xl bg-brick text-white flex items-center justify-center mb-3 shadow-md">
                <AlertTriangle className="h-8 w-8 stroke-[2.5]" />
              </div>
              <h3 className="font-serif font-black text-lg text-brick">
                Health Card Not Recognized
              </h3>
              <p className="text-xs font-bold text-ink-secondary mt-1.5 max-w-xs leading-relaxed">
                {errorMsg}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={resetScanner}
                  className="btn-chunky btn-chunky-tea text-xs font-black cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Scan Again</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Details */}
      <footer className="w-full max-w-3xl mx-auto pt-3 text-center text-xs font-bold text-ink-secondary/70 flex flex-wrap items-center justify-between gap-2 border-t-2 border-black/10">
        <div className="flex items-center gap-1">
          <HeartHandshake className="h-3.5 w-3.5 text-tea" />
          <span>Ayushman Bharat Digital Mission (ABDM) Compatible Kiosk</span>
        </div>
        <div>
          <span>Community Health Worker Assisted</span>
        </div>
      </footer>
    </main>
  );
}
