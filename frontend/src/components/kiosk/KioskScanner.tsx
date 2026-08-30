"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Camera, Volume2, ShieldCheck, QrCode } from "lucide-react";
import { playTapFeedback } from "@/lib/sound";
import { speak } from "@/lib/speech";

interface KioskScannerProps {
  onScan: (text: string) => void;
  paused: boolean;
  isError?: boolean;
}

type ScanPhase = "idle" | "scanning" | "verifying";

export function KioskScanner({ onScan, paused, isError }: KioskScannerProps) {
  const id = useId();
  const containerId = "qr-reader-" + id.replace(/[^a-zA-Z0-9]/g, "");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const phase: ScanPhase = cameraReady
    ? paused
      ? isError
        ? "scanning"
        : "verifying"
      : "scanning"
    : "idle";

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const speakGuidance = () => {
    playTapFeedback();
    speak("Please hold your CogniCare Health Card QR code in front of the camera.", "en", 0.9);
  };

  /* ── Start / stop camera ── */
  useEffect(() => {
    const scanner = new Html5Qrcode(containerId, { verbose: false });
    scannerRef.current = scanner;
    let disposed = false;
    let hasStarted = false;

    const stopScanner = (s: Html5Qrcode) => {
      try {
        const state = s.getState();
        if (
          state === Html5QrcodeScannerState.SCANNING ||
          state === Html5QrcodeScannerState.PAUSED
        ) {
          s.stop()
            .then(() => {
              try {
                s.clear();
              } catch {
                /* element may already be cleaned up */
              }
            })
            .catch(() => {
              /* camera already released */
            });
        }
      } catch {
        /* safely catch synchronous state exceptions */
      }
    };

    // Start scanner without qrbox to prevent html5-qrcode from injecting duplicate white boxes
    scanner
      .start(
        { facingMode: facingMode },
        { fps: 15 },
        (decodedText) => {
          onScanRef.current(decodedText);
        },
        () => {
          // No-op for unrecognized frames — keep scanning.
        }
      )
      .then(() => {
        if (disposed) {
          stopScanner(scanner);
          return;
        }
        hasStarted = true;
        startedRef.current = true;
        setCameraReady(true);
      })
      .catch(() => {
        if (disposed) return;
        setError(
          "Camera unavailable. Please check your camera permissions in browser settings and reload."
        );
      });

    return () => {
      disposed = true;
      startedRef.current = false;
      scannerRef.current = null;
      if (hasStarted) {
        stopScanner(scanner);
      }
    };
  }, [containerId, facingMode]);

  /* ── Pause / resume ── */
  useEffect(() => {
    const scanner = scannerRef.current;
    if (!scanner || !startedRef.current) return;
    try {
      const state = scanner.getState();
      if (paused) {
        if (state === Html5QrcodeScannerState.SCANNING) {
          scanner.pause(false);
        }
      } else {
        if (state === Html5QrcodeScannerState.PAUSED) {
          scanner.resume();
        }
      }
    } catch {
      /* ignore mismatch */
    }
  }, [paused]);

  const toggleCamera = () => {
    playTapFeedback();
    setCameraReady(false);
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const isScanning = phase === "scanning";
  const isVerifying = phase === "verifying";

  return (
    <div className="w-full max-w-[420px] mx-auto">
      {/* ── Kiosk Viewfinder Card ── */}
      <div className="rounded-2xl border-3 border-black bg-surface overflow-hidden shadow-[5px_5px_0px_#000]">
        {/* Top Scanner HUD Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-ink text-white border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black tracking-wider uppercase">
              {isScanning ? "Scanner Ready" : isVerifying ? "Verifying..." : "Initializing..."}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={speakGuidance}
              title="Voice Guidance"
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggleCamera}
              title="Switch Camera"
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <Camera className="h-3.5 w-3.5" />
              <span className="text-[10px]">Flip</span>
            </button>
          </div>
        </div>

        {/* Camera feed area */}
        <div className="relative bg-black min-h-[300px] flex items-center justify-center overflow-hidden">
          <div id={containerId} className="w-full aspect-square object-cover" aria-label="QR code camera view" />

          {/* ── Clean Single Square Reticle Overlay ── */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-[230px] h-[230px] border border-white/20 rounded-xl">
                {/* 4 Clean Glowing Corner Brackets */}
                <span className="absolute -top-[2px] -left-[2px] w-7 h-7 border-t-[3.5px] border-l-[3.5px] border-emerald-400 rounded-tl-lg shadow-[0_0_8px_#10B981]" />
                <span className="absolute -top-[2px] -right-[2px] w-7 h-7 border-t-[3.5px] border-r-[3.5px] border-emerald-400 rounded-tr-lg shadow-[0_0_8px_#10B981]" />
                <span className="absolute -bottom-[2px] -left-[2px] w-7 h-7 border-b-[3.5px] border-l-[3.5px] border-emerald-400 rounded-bl-lg shadow-[0_0_8px_#10B981]" />
                <span className="absolute -bottom-[2px] -right-[2px] w-7 h-7 border-b-[3.5px] border-r-[3.5px] border-emerald-400 rounded-br-lg shadow-[0_0_8px_#10B981]" />

                {/* Single Sweeping Green Laser Line */}
                <div className="absolute left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent laser-line shadow-[0_0_10px_#10B981]" />
              </div>
            </div>
          )}

          {/* ── Verifying Token HUD Overlay ── */}
          {isVerifying && (
            <div className="absolute inset-0 bg-ink/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20">
              <div className="relative flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-3 border-emerald-400 border-t-transparent animate-spin" />
                <ShieldCheck className="h-7 w-7 text-emerald-400 absolute" />
              </div>
              <div className="text-center px-4">
                <p className="text-white font-serif font-black text-lg tracking-tight">
                  QR Card Detected
                </p>
                <p className="text-emerald-300 font-bold text-xs mt-0.5">
                  Verifying with secure server...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Helper Status Bar ── */}
        <div className="px-3.5 py-2.5 bg-[#FAF6F0] border-t-2 border-black flex items-center justify-center text-center">
          <p className="font-bold text-ink text-xs sm:text-sm flex items-center gap-1.5">
            <QrCode className="h-4 w-4 text-tea shrink-0" />
            <span>
              {isScanning
                ? "Align your Health Card QR code within the frame"
                : isVerifying
                ? "Verifying patient registration..."
                : "Starting camera..."}
            </span>
          </p>
        </div>
      </div>

      {/* ── Camera Error Alert ── */}
      {error && (
        <div
          role="alert"
          className="mt-3 rounded-xl bg-brick-light border-2 border-brick p-3 text-brick font-bold text-center text-xs shadow-[2px_2px_0px_var(--color-brick)]"
        >
          <p className="font-black text-sm mb-0.5">Camera Permission Required</p>
          <p className="text-[11px] text-brick/90">{error}</p>
        </div>
      )}

      {/* ── Security & Privacy Assurance ── */}
      <p className="text-center text-ink-secondary/60 text-xs font-bold mt-2.5">
        🔒 Secure & Private QR Card Authentication
      </p>
    </div>
  );
}
