"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Sparkles, Eye, MousePointer } from "lucide-react";
import { KalmanFilter2D } from "@/lib/vision";

interface WebcamHeadTrackerProps {
  onCoordsChange: (coords: { x: number; y: number }) => void;
  active: boolean;
  onToggleActive: () => void;
  sensitivity?: "gentle" | "normal" | "high";
  onSensitivityChange?: (sens: "gentle" | "normal" | "high") => void;
}

export function WebcamHeadTracker({
  onCoordsChange,
  active,
  onToggleActive,
  sensitivity = "normal",
  onSensitivityChange,
}: WebcamHeadTrackerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const kalmanRef = useRef<KalmanFilter2D>(
    new KalmanFilter2D(
      sensitivity === "gentle" ? 0.003 : 0.006,
      0.08,
      0.05
    )
  );

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [currentCoord, setCurrentCoord] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update kalman process noise when sensitivity changes
  useEffect(() => {
    kalmanRef.current = new KalmanFilter2D(
      sensitivity === "gentle" ? 0.003 : sensitivity === "high" ? 0.012 : 0.006,
      0.08,
      0.05
    );
  }, [sensitivity]);

  useEffect(() => {
    if (!active) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    let isMounted = true;
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            facingMode: "user",
          },
          audio: false,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        setHasPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }

        processVideoFrames();
      } catch (err) {
        console.warn("Camera access denied or unavailable:", err);
        if (isMounted) {
          setHasPermission(false);
          onToggleActive(); // Fallback to pointer mode
        }
      }
    }

    startCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [active]);

  const processVideoFrames = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      animFrameRef.current = requestAnimationFrame(processVideoFrames);
      return;
    }

    if (video.readyState >= 2) {
      const w = 80;
      const h = 60;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      if (ctx) {
        ctx.drawImage(video, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const pixels = imgData.data;

        let sumX = 0;
        let sumY = 0;
        let count = 0;

        // South Asian skin & facial illumination centroid
        for (let i = 0; i < pixels.length; i += 16) {
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];

          // Facial chrominance heuristic: R > G > B and warm chrominance
          if (r > 60 && g > 40 && b > 20 && r > b && (r - g) >= 8) {
            const pxIdx = i / 4;
            const x = pxIdx % w;
            const y = Math.floor(pxIdx / w);
            sumX += x;
            sumY += y;
            count++;
          }
        }

        if (count > 20) {
          const rawNormX = (sumX / count) / w; // 0 .. 1
          const rawNormY = (sumY / count) / h; // 0 .. 1

          // Invert X for natural mirror behavior
          const mirroredX = 1 - rawNormX;
          const kResult = kalmanRef.current.update(mirroredX, rawNormY);

          // Sensitivity multiplier (gentle = tremor damped, high = responsive)
          const mult = sensitivity === "gentle" ? 2.2 : sensitivity === "high" ? 4.2 : 3.0;

          const mappedX = Math.max(-1, Math.min(1, (kResult.x - 0.5) * mult));
          const mappedY = Math.max(-1, Math.min(1, (kResult.y - 0.5) * (mult * 0.85)));

          setCurrentCoord({ x: mappedX, y: mappedY });
          onCoordsChange({ x: mappedX, y: mappedY });
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(processVideoFrames);
  };

  // Determine human-readable gaze direction
  const getGazeDirection = () => {
    if (Math.abs(currentCoord.x) < 0.25 && Math.abs(currentCoord.y) < 0.25) {
      return "Centered • In Focus";
    }
    if (currentCoord.x < -0.25) return "Looking Left";
    if (currentCoord.x > 0.25) return "Looking Right";
    if (currentCoord.y < -0.25) return "Looking Up";
    return "Looking Down";
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Hidden elements for processing */}
      <video ref={videoRef} playsInline muted className="hidden" />
      <canvas ref={canvasRef} className="hidden" />

      {/* Mode Toggle Button */}
      <button
        type="button"
        onClick={onToggleActive}
        className={`btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 px-3 py-1.5 text-xs font-black transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
          active
            ? "border-emerald-700 bg-emerald-100 text-emerald-950"
            : "border-black bg-white text-ink hover:bg-amber-50"
        }`}
        title={active ? "Head tracking is ON" : "Click to enable webcam head tracking"}
      >
        {active ? (
          <>
            <Camera className="h-4 w-4 text-emerald-700 animate-pulse" />
            <span>Webcam Head-Tracking</span>
          </>
        ) : (
          <>
            <MousePointer className="h-4 w-4 text-ink-secondary" />
            <span>Touch / Pointer Drag</span>
          </>
        )}
      </button>

      {/* Real-time Tracking Indicator & Gaze Compass */}
      {active && (
        <div className="flex items-center gap-2 rounded-2xl border-2 border-emerald-700/60 bg-white px-2.5 py-1 shadow-xs">
          <div className="relative h-6 w-6 rounded-full border border-emerald-600/40 bg-emerald-50 flex items-center justify-center overflow-hidden">
            <div
              className="h-2.5 w-2.5 rounded-full bg-emerald-600 shadow-sm transition-all duration-75"
              style={{
                transform: `translate(${currentCoord.x * 7}px, ${currentCoord.y * 7}px)`,
              }}
            />
          </div>
          <span className="text-[11px] font-black text-emerald-950 tracking-tight">
            {getGazeDirection()}
          </span>

          {/* Quick Sensitivity Selector */}
          {onSensitivityChange && (
            <div className="hidden sm:flex items-center gap-1 border-l border-emerald-200 pl-2">
              {(["gentle", "normal", "high"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSensitivityChange(s)}
                  className={`rounded-lg px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                    sensitivity === s
                      ? "bg-emerald-700 text-white"
                      : "text-emerald-800 hover:bg-emerald-100"
                  }`}
                >
                  {s[0]}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
