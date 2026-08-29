"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";

interface KioskScannerProps {
  onScan: (text: string) => void;
  paused: boolean;
}

export function KioskScanner({ onScan, paused }: KioskScannerProps) {
  const [containerId] = useState(
    () => `qr-reader-${Math.random().toString(36).slice(2, 9)}`
  );
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
        startedRef.current = true;
        setCameraOn(true);
      })
      .catch(() => {
        setError(
          "Camera unavailable. Please allow camera access from browser settings and try again."
        );
      });

    return () => {
      startedRef.current = false;
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {
          /* camera already released */
        });
      scannerRef.current = null;
    };
  }, [containerId]);

  useEffect(() => {
    const scanner = scannerRef.current;
    if (!scanner || !startedRef.current) return;
    if (paused) {
      scanner.pause(true);
    } else {
      scanner.resume();
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