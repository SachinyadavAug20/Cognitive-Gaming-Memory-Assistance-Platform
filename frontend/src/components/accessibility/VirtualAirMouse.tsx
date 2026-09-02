"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Hand,
  X,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { OpticalMotionTracker, type MotionEvent } from "@/lib/vision";
import { playPress, playTapFeedback, unlockAudio } from "@/lib/sound";

interface VirtualAirMouseProps {
  active: boolean;
  onClose: () => void;
  dwellTimeMs?: number;
  smoothing?: number;
  cursorSize?: "normal" | "large" | "giant";
  onDwellClick?: (target: HTMLElement) => void;
  onHoverTarget?: (target: HTMLElement | null) => void;
}

export function VirtualAirMouse({
  active,
  onClose,
  dwellTimeMs = 1000,
  smoothing = 0.35,
  cursorSize = "large",
  onDwellClick,
  onHoverTarget,
}: VirtualAirMouseProps) {
  // Pointer Screen Coordinates (Pixels)
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 400,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 300,
  });

  // Dwell Progress (0 to 100)
  const [dwellProgress, setDwellProgress] = useState(0);
  const [isDwellActive, setIsDwellActive] = useState(false);
  const [lastClickedElement, setLastClickedElement] = useState<string | null>(null);
  const [isPipMinimized, setIsPipMinimized] = useState(false);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Vision Tracker References
  const trackerRef = useRef<OpticalMotionTracker | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const prevCoordsRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const dwellStartRef = useRef<number | null>(null);
  const dwellTargetRef = useRef<HTMLElement | null>(null);
  const dwellAnchorPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Cursor Dimensions based on accessibility size
  const cursorDimensions = {
    normal: { size: 36, ring: 44, stroke: 3 },
    large: { size: 48, ring: 60, stroke: 4 },
    giant: { size: 64, ring: 80, stroke: 5 },
  }[cursorSize];

  // Motion Event Handler from OpenCV / Optical Tracker
  const handleMotionEvent = useCallback(
    (evt: MotionEvent) => {
      if (!evt.hasMotion || typeof window === "undefined") return;

      // Inverted X for mirror webcam experience
      const targetNormX = 1 - evt.x;
      const targetNormY = evt.y;

      // Exponential Moving Average (EMA) smoothing for tremor reduction
      const smoothFactor = Math.max(0.1, Math.min(0.8, 1 - smoothing));
      const currentX =
        prevCoordsRef.current.x + (targetNormX - prevCoordsRef.current.x) * smoothFactor;
      const currentY =
        prevCoordsRef.current.y + (targetNormY - prevCoordsRef.current.y) * smoothFactor;

      prevCoordsRef.current = { x: currentX, y: currentY };

      // Convert to window screen pixels with safety edge clamping
      const margin = 20;
      const screenX = Math.max(margin, Math.min(window.innerWidth - margin, currentX * window.innerWidth));
      const screenY = Math.max(margin, Math.min(window.innerHeight - margin, currentY * window.innerHeight));

      setPointerPos({ x: screenX, y: screenY });

      // Draw tracking HUD to PIP canvas
      if (videoCanvasRef.current) {
        const canvas = videoCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          // Hand tracking ring
          ctx.beginPath();
          ctx.arc(evt.x * canvas.width, evt.y * canvas.height, 14, 0, Math.PI * 2);
          ctx.strokeStyle = "#F59E0B";
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(evt.x * canvas.width, evt.y * canvas.height, 4, 0, Math.PI * 2);
          ctx.fillStyle = "#EF4444";
          ctx.fill();
        }
      }
    },
    [smoothing]
  );

  // Initialize OpenCV Optical Motion Tracker
  useEffect(() => {
    let isMounted = true;

    if (!active) {
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
      return;
    }

    unlockAudio();
    const tracker = new OpticalMotionTracker(handleMotionEvent, 0.32);
    trackerRef.current = tracker;

    tracker
      .start()
      .then((started) => {
        if (!isMounted) return;
        if (started) {
          setCameraStarted(true);
          setCameraError(null);
        } else {
          setCameraStarted(false);
          setCameraError("Camera permission denied or camera not found.");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setCameraStarted(false);
        setCameraError(String(err));
      });

    return () => {
      isMounted = false;
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
    };
  }, [active, handleMotionEvent]);

  // Dwell-Click Animation & Hit Detection Loop
  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const checkDwell = () => {
      const { x, y } = pointerPos;

      // Find interactive element under cursor (ignoring the virtual air mouse overlay itself)
      const elements = document.elementsFromPoint(x, y);
      const targetElement = (elements.find((el) => {
        if (el.closest("#virtual-air-mouse-overlay") || el.closest("#air-mouse-pip-card")) {
          return false;
        }
        return (
          el.tagName === "BUTTON" ||
          el.tagName === "A" ||
          el.getAttribute("role") === "button" ||
          el.getAttribute("tabIndex") !== null ||
          el.classList.contains("cursor-pointer") ||
          el.classList.contains("btn-tactile") ||
          el.classList.contains("game-card") ||
          el.tagName === "INPUT" ||
          el.tagName === "SELECT"
        );
      }) || null) as HTMLElement | null;

      onHoverTarget?.(targetElement);

      if (targetElement) {
        // Distance check from initial dwell anchor to allow natural hand tremor (28px radius)
        const dx = x - dwellAnchorPosRef.current.x;
        const dy = y - dwellAnchorPosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (!dwellStartRef.current || dwellTargetRef.current !== targetElement || dist > 28) {
          // Start or reset dwell timer
          dwellStartRef.current = performance.now();
          dwellTargetRef.current = targetElement;
          dwellAnchorPosRef.current = { x, y };
          setIsDwellActive(true);
          setDwellProgress(0);
        } else {
          // Progress dwell fill
          const elapsed = performance.now() - dwellStartRef.current;
          const pct = Math.min(100, Math.round((elapsed / dwellTimeMs) * 100));
          setDwellProgress(pct);

          if (pct >= 100) {
            // FIRE DWELL CLICK!
            playPress();
            targetElement.click();
            targetElement.focus();
            onDwellClick?.(targetElement);

            const elText =
              targetElement.getAttribute("aria-label") ||
              targetElement.innerText?.slice(0, 30) ||
              targetElement.tagName;
            setLastClickedElement(elText);

            // Cooldown reset
            dwellStartRef.current = performance.now() + 600;
            setDwellProgress(0);
            setIsDwellActive(false);
          }
        }
      } else {
        // Reset dwell when hovering over neutral space
        dwellStartRef.current = null;
        dwellTargetRef.current = null;
        setIsDwellActive(false);
        setDwellProgress(0);
      }

      animationFrameRef.current = requestAnimationFrame(checkDwell);
    };

    animationFrameRef.current = requestAnimationFrame(checkDwell);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [active, pointerPos, dwellTimeMs, onDwellClick, onHoverTarget]);

  if (!active) return null;

  return (
    <div id="virtual-air-mouse-overlay" className="pointer-events-none fixed inset-0 z-9999 select-none">
      {/* ── 1. GLOWING HIGH-CONTRAST AIR POINTER CURSOR ── */}
      <div
        className="pointer-events-none fixed transition-transform duration-75 ease-out"
        style={{
          left: `${pointerPos.x}px`,
          top: `${pointerPos.y}px`,
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* Outer Pulsing Glow */}
        <div
          className={`absolute rounded-full transition-all duration-300 ${
            isDwellActive
              ? "bg-amber-400/40 ring-4 ring-amber-400 animate-pulse scale-110"
              : "bg-teal-400/25 ring-2 ring-teal-300"
          }`}
          style={{
            width: `${cursorDimensions.ring}px`,
            height: `${cursorDimensions.ring}px`,
            top: `-${cursorDimensions.ring / 2}px`,
            left: `-${cursorDimensions.ring / 2}px`,
          }}
        />

        {/* SVG Radial Dwell Progress Ring */}
        <svg
          className="absolute -rotate-90 pointer-events-none"
          width={cursorDimensions.ring}
          height={cursorDimensions.ring}
          style={{
            top: `-${cursorDimensions.ring / 2}px`,
            left: `-${cursorDimensions.ring / 2}px`,
          }}
        >
          {/* Track Background */}
          <circle
            cx={cursorDimensions.ring / 2}
            cy={cursorDimensions.ring / 2}
            r={cursorDimensions.ring / 2 - 4}
            fill="none"
            stroke="rgba(0,0,0,0.5)"
            strokeWidth={cursorDimensions.stroke}
          />
          {/* Active Fill Ring */}
          <circle
            cx={cursorDimensions.ring / 2}
            cy={cursorDimensions.ring / 2}
            r={cursorDimensions.ring / 2 - 4}
            fill="none"
            stroke="#F59E0B"
            strokeWidth={cursorDimensions.stroke}
            strokeDasharray={Math.PI * (cursorDimensions.ring - 8)}
            strokeDashoffset={
              Math.PI * (cursorDimensions.ring - 8) * (1 - dwellProgress / 100)
            }
            strokeLinecap="round"
            className="transition-all duration-75"
          />
        </svg>

        {/* Inner Tactile Hand Pointer Icon */}
        <div
          className="flex items-center justify-center rounded-full border-3 border-black bg-amber-300 text-black shadow-[3px_3px_0px_#000]"
          style={{
            width: `${cursorDimensions.size}px`,
            height: `${cursorDimensions.size}px`,
            marginLeft: `-${cursorDimensions.size / 2}px`,
            marginTop: `-${cursorDimensions.size / 2}px`,
          }}
        >
          <Hand className="h-5 w-5 stroke-[2.5]" />
        </div>

        {/* Live Dwell Percentage Badge */}
        {isDwellActive && dwellProgress > 10 && (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-black bg-white px-2 py-0.5 text-[10px] font-black text-ink shadow-[2px_2px_0px_#000]">
            {dwellProgress}%
          </div>
        )}
      </div>

      {/* ── 2. PICTURE-IN-PICTURE (PIP) CAMERA TRACKING HUD ── */}
      <div
        id="air-mouse-pip-card"
        className="pointer-events-auto fixed bottom-6 left-6 z-10000 flex flex-col rounded-2xl border-4 border-black bg-[#FAF6F0] p-3 shadow-[6px_6px_0px_#000] transition-all"
        style={{ width: isPipMinimized ? "180px" : "240px" }}
      >
        {/* PIP Header */}
        <div className="flex items-center justify-between border-b-2 border-black/15 pb-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-black uppercase text-ink">
              🖐️ Air Pointer
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => {
                playTapFeedback();
                setIsPipMinimized(!isPipMinimized);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-lg border border-black bg-white text-ink hover:bg-amber-100"
              title={isPipMinimized ? "Expand Camera HUD" : "Minimize Camera HUD"}
            >
              {isPipMinimized ? (
                <Maximize2 className="h-3 w-3 stroke-[2.5]" />
              ) : (
                <Minimize2 className="h-3 w-3 stroke-[2.5]" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                playPress();
                onClose();
              }}
              className="flex h-6 w-6 items-center justify-center rounded-lg border border-black bg-white text-ink hover:bg-rose-500 hover:text-white"
              title="Close Virtual Air Mouse"
            >
              <X className="h-3 w-3 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Camera Canvas Stream & Status */}
        {!isPipMinimized && (
          <>
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border-2 border-black bg-black">
              {cameraStarted ? (
                <canvas
                  ref={videoCanvasRef}
                  width={240}
                  height={180}
                  className="h-full w-full object-cover -scale-x-100"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center text-white">
                  <Hand className="h-8 w-8 animate-bounce text-amber-400" />
                  <span className="mt-1 text-[11px] font-bold">
                    {cameraError || "Initializing Web Vision..."}
                  </span>
                </div>
              )}

              {/* Dwell Action Pulse overlay on camera */}
              {isDwellActive && (
                <div className="absolute top-1.5 right-1.5 rounded-md border border-black bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-black animate-pulse">
                  DWELLING ({dwellProgress}%)
                </div>
              )}
            </div>

            <div className="mt-2 space-y-1 text-[10px] font-bold text-ink-secondary">
              <div className="flex items-center justify-between">
                <span>Dwell Threshold:</span>
                <span className="font-black text-ink">{(dwellTimeMs / 1000).toFixed(1)}s</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tremor Damping:</span>
                <span className="font-black text-ink">{Math.round(smoothing * 100)}%</span>
              </div>
              {lastClickedElement && (
                <div className="truncate rounded bg-amber-100 px-1.5 py-0.5 text-amber-950">
                  Last click: <span className="font-black">{lastClickedElement}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
