"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

interface KioskScannerProps {
  onScan: (text: string) => void;
  paused: boolean;
}

export function KioskScanner({ onScan, paused }: KioskScannerProps) {
  const id = useId();
  const containerId = "qr-reader-" + id.replace(/[^a-zA-Z0-9]/g, "");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);
  const [cameraOn, setCameraOn] = useState(false);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

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

    scanner
      .start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
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
        setCameraOn(true);
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

  return (
    <div className="w-full max-w-[440px] mx-auto">
      <div
        id={containerId}
        className="rounded-2xl border-4 border-border overflow-hidden bg-ink shadow-[6px_6px_0px_var(--color-border)]"
        aria-label="QR code camera view"
      />
      {cameraOn && !paused && (
        <p className="text-center mt-3 font-bold text-ink-secondary text-base">
          Point the camera at the QR card to log in
        </p>
      )}
      {paused && (
        <p className="text-center mt-3 font-bold text-marigold text-base pulse-gentle">
          Scan recognized — signing in...
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="mt-3 rounded-xl bg-brick-light border-2 border-brick p-4 text-brick font-bold text-center"
        >
          {error}
        </div>
      )}
    </div>
  );
}