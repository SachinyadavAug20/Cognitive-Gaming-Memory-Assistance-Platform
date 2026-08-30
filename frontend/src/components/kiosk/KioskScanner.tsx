"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

interface KioskScannerProps {
  onScan: (text: string) => void;
  paused: boolean;
  /** When true, the scanner overlay hides (parent shows error instead) */
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

  const phase: ScanPhase = cameraReady
    ? paused
      ? isError
        ? "scanning" // resume scanning immediately on error
        : "verifying"
      : "scanning"
    : "idle";

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

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
              try { s.clear(); } catch { /* element may already be cleaned up */ }
            })
            .catch(() => { /* camera already released */ });
        }
      } catch {
        /* safely catch synchronous state exceptions */
      }
    };

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
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

        /* Hide the library's own scan-region overlay box (we render our own reticle) */
        const container = document.getElementById(containerId);
        if (container) {
          const scanRegion = container.querySelector("video")?.closest("div");
          if (scanRegion) {
            (scanRegion as HTMLElement).style.border = "none";
          }
        }
      })
      .catch(() => {
        if (disposed) return;
        setError(
          "Camera unavailable. Please allow camera access from browser settings and try again."
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
  }, [containerId]);

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
      /* html5-qrcode throws synchronously when state is mismatched */
    }
  }, [paused]);

  const isScanning = phase === "scanning";
  const isVerifying = phase === "verifying";

  return (
    <div className="w-full max-w-[440px] mx-auto">
      {/* ── Camera card ── */}
      <div className="rounded-2xl border-2 border-border-soft bg-white overflow-hidden shadow-[4px_4px_0px_var(--color-border)]">
        {/* Camera feed area */}
        <div className="relative bg-ink overflow-hidden">
          <div id={containerId} className="w-full" aria-label="QR code camera view" />

          {/* ── Reticle overlay (corner brackets) — only when actively scanning ── */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-[260px] h-[260px]">
                <span className="absolute top-0 left-0 w-8 h-8 border-t-[4px] border-l-[4px] border-white rounded-tl-lg reticle-glow" />
                <span className="absolute top-0 right-0 w-8 h-8 border-t-[4px] border-r-[4px] border-white rounded-tr-lg reticle-glow" />
                <span className="absolute bottom-0 left-0 w-8 h-8 border-b-[4px] border-l-[4px] border-white rounded-bl-lg reticle-glow" />
                <span className="absolute bottom-0 right-0 w-8 h-8 border-b-[4px] border-r-[4px] border-white rounded-br-lg reticle-glow" />
                <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-tea to-transparent laser-line" />
              </div>
            </div>
          )}

          {/* ── Verifying overlay — neutral, no premature celebration ── */}
          {isVerifying && (
            <div className="absolute inset-0 bg-ink/80 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-full border-4 border-white border-t-transparent animate-spin" />
              <p className="text-white font-bold text-lg text-center">
                QR Code Detected
              </p>
              <p className="text-white/70 font-semibold text-sm text-center">
                Verifying with server…
              </p>
            </div>
          )}
        </div>

        {/* ── Instructions bar ── */}
        <div className="px-4 py-3 bg-surface border-t-2 border-border-soft">
          {isScanning && (
            <p className="text-center font-bold text-ink-secondary text-sm leading-snug">
              Align your registered Health Card QR code within the frame.
            </p>
          )}
          {isVerifying && (
            <p className="text-center font-bold text-ink-secondary/70 text-sm pulse-gentle">
              Please wait…
            </p>
          )}
          {!isScanning && !isVerifying && !error && (
            <p className="text-center font-bold text-ink-secondary/50 text-sm">
              Initializing camera…
            </p>
          )}
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div
          role="alert"
          className="mt-4 rounded-xl bg-brick-light border-2 border-brick p-4 text-brick font-bold text-center text-sm"
        >
          {error}
        </div>
      )}

      {/* ── Security footer ── */}
      <p className="text-center text-ink-secondary/40 text-xs font-bold mt-3">
        🔒 Your card data is processed locally and never stored.
      </p>
    </div>
  );
}
