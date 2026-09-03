"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Hand,
  X,
  Minimize2,
  Maximize2,
  MousePointer,
  Sparkles,
  Pause,
  Play,
  Magnet,
  Crosshair,
} from "lucide-react";
import { OpticalMotionTracker, type MotionEvent } from "@/lib/vision";
import { OneEuroFilter2D } from "@/lib/one-euro-filter";
import { playPress, playTapFeedback, playDwellTick, unlockAudio } from "@/lib/sound";

export interface VirtualAirMouseProps {
  active: boolean;
  onClose: (reason?: string) => void;
  dwellTimeMs?: number;
  smoothing?: number;
  motionReach?: number; // 1.0 (standard) to 1.5 (wide reach)
  cursorSize?: "normal" | "large" | "giant";
  cursorPace?: "calm" | "gentle" | "standard";
  clickMethod?: "dwell" | "pinch" | "key";
  cameraViewMode?: "pip" | "minimized" | "hidden";
  handoffPolicy?: "auto" | "strict";
  stickyMagnetism?: boolean;
  audioTicks?: boolean;
  onDwellClick?: (target: HTMLElement) => void;
  onHoverTarget?: (target: HTMLElement | null) => void;
}

interface TargetMatch {
  element: HTMLElement;
  rect: DOMRect;
  cx: number;
  cy: number;
  distance: number;
  isDirectHit: boolean;
}

// Find the nearest interactive target within snapRadius
function findNearestInteractiveTarget(x: number, y: number, snapRadius = 90): TargetMatch | null {
  if (typeof document === "undefined") return null;

  const candidates = document.querySelectorAll<HTMLElement>(
    'button, a, input, select, textarea, [role="button"], [tabIndex="0"], .btn-tactile, .game-card, .cursor-pointer'
  );

  let bestMatch: TargetMatch | null = null;
  let minDistance = snapRadius;

  for (let i = 0; i < candidates.length; i++) {
    const el = candidates[i];
    if (
      el.closest("#virtual-air-mouse-overlay") ||
      el.closest("#air-mouse-pip-card") ||
      el.closest("#air-mouse-rest-dock")
    ) {
      continue;
    }

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    if (
      rect.bottom < 0 ||
      rect.top > window.innerHeight ||
      rect.right < 0 ||
      rect.left > window.innerWidth
    ) {
      continue;
    }

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Direct hit inside bounding box
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return {
        element: el,
        rect,
        cx,
        cy,
        distance: 0,
        isDirectHit: true,
      };
    }

    // Distance to closest point on rectangle
    const clampedX = Math.max(rect.left, Math.min(x, rect.right));
    const clampedY = Math.max(rect.top, Math.min(y, rect.bottom));
    const dist = Math.hypot(x - clampedX, y - clampedY);

    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = {
        element: el,
        rect,
        cx,
        cy,
        distance: dist,
        isDirectHit: false,
      };
    }
  }

  return bestMatch;
}

export function VirtualAirMouse({
  active,
  onClose,
  dwellTimeMs = 1000,
  smoothing = 0.35,
  motionReach = 1.0,
  cursorSize = "large",
  cursorPace = "calm",
  clickMethod = "pinch", // Method B: Pinch Gesture Click default
  cameraViewMode = "pip",
  handoffPolicy = "auto",
  stickyMagnetism = true,
  audioTicks = true,
  onDwellClick,
  onHoverTarget,
}: VirtualAirMouseProps) {
  // Cursor Screen Coordinates (Pixels)
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 400,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 300,
  });

  // Dwell, Snap, & Gesture State
  const [dwellProgress, setDwellProgress] = useState(0);
  const [isDwellActive, setIsDwellActive] = useState(false);
  const [isSnapped, setIsSnapped] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Midas Touch Prevention (Rest Mode)
  const [lastClickedElement, setLastClickedElement] = useState<string | null>(null);
  const [isPinchingActive, setIsPinchingActive] = useState(false);
  const [isLocalMinimized, setIsLocalMinimized] = useState(false);
  const pipViewMode =
    cameraViewMode === "hidden" ? "hidden" : isLocalMinimized ? "minimized" : cameraViewMode;
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasHandInView, setHasHandInView] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Vision Tracker References & 1€ Filter State
  const trackerRef = useRef<OpticalMotionTracker | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorDomRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<OneEuroFilter2D>(new OneEuroFilter2D(1.1, 0.025));

  const currentPosRef = useRef<{ x: number; y: number }>({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 400,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 300,
  });
  const lockedTargetRef = useRef<HTMLElement | null>(null);
  const dwellStartRef = useRef<number | null>(null);
  const dwellTargetRef = useRef<HTMLElement | null>(null);
  const highlightedElementRef = useRef<HTMLElement | null>(null);
  const lastTickQuarterRef = useRef<number>(0);
  const wasPinchingRef = useRef(false);
  const lastPinchTimeRef = useRef<number>(0);
  const lastMotionTimestampRef = useRef<number>(0);
  const activationTimeRef = useRef<number>(0);

  // Dynamic recalibration offset (centered when pressing 'C')
  const centerOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update 1€ Filter parameters dynamically based on cursorPace & anti-tremor smoothing
  useEffect(() => {
    const baseCutoff = cursorPace === "calm" ? 0.9 : cursorPace === "gentle" ? 1.3 : 1.7;
    const tunedCutoff = Math.max(0.4, baseCutoff - smoothing * 0.5);
    const beta = cursorPace === "calm" ? 0.022 : cursorPace === "gentle" ? 0.038 : 0.06;
    filterRef.current.setParams(tunedCutoff, beta);
  }, [cursorPace, smoothing]);

  // Cursor Dimensions based on accessibility size
  const cursorDimensions = {
    normal: { size: 36, ring: 44, stroke: 3 },
    large: { size: 48, ring: 60, stroke: 4 },
    giant: { size: 64, ring: 80, stroke: 5 },
  }[cursorSize];

  // 1. MUTUAL EXCLUSION: Inject 'virtual-mouse-active' class on document to hide OS cursor
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (active) {
      activationTimeRef.current = performance.now();
      document.documentElement.classList.add("virtual-mouse-active");
      document.body.classList.add("virtual-mouse-active");
    } else {
      document.documentElement.classList.remove("virtual-mouse-active");
      document.body.classList.remove("virtual-mouse-active");
    }
    return () => {
      document.documentElement.classList.remove("virtual-mouse-active");
      document.body.classList.remove("virtual-mouse-active");
    };
  }, [active]);

  // Clean up highlighted target outline on unmount
  useEffect(() => {
    return () => {
      if (highlightedElementRef.current) {
        highlightedElementRef.current.style.removeProperty("outline");
        highlightedElementRef.current.style.removeProperty("boxShadow");
        highlightedElementRef.current = null;
      }
    };
  }, []);

  // 2. PHYSICAL MOUSE HANDOFF & KEYBOARD SHORTCUTS (ESC to Exit, P to Pause, C to Recenter)
  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    let lastPhysicalX = 0;
    let lastPhysicalY = 0;
    let accumulatedDist = 0;
    let lastMoveTime = performance.now();

    const handlePointerMove = (e: PointerEvent) => {
      if (!e.isTrusted) return;

      // Ignore physical mouse moves during the first 2000ms grace period
      if (performance.now() - activationTimeRef.current < 2000) {
        lastPhysicalX = e.clientX;
        lastPhysicalY = e.clientY;
        accumulatedDist = 0;
        return;
      }

      if (handoffPolicy === "auto") {
        const now = performance.now();
        if (lastPhysicalX !== 0 || lastPhysicalY !== 0) {
          const dx = e.clientX - lastPhysicalX;
          const dy = e.clientY - lastPhysicalY;
          const dist = Math.hypot(dx, dy);

          if (now - lastMoveTime < 400) {
            accumulatedDist += dist;
          } else {
            accumulatedDist = dist;
          }

          if (accumulatedDist > 120) {
            setToastMessage("Physical mouse detected — switched to standard mouse mode");
            setTimeout(() => {
              onClose("physical_mouse_moved");
            }, 300);
            return;
          }
        }
        lastPhysicalX = e.clientX;
        lastPhysicalY = e.clientY;
        lastMoveTime = now;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!e.isTrusted) return;

      if (performance.now() - activationTimeRef.current < 2000) {
        return;
      }

      const target = e.target as HTMLElement | null;
      if (
        target?.closest("#virtual-air-mouse-overlay") ||
        target?.closest("#air-mouse-pip-card") ||
        target?.closest("#air-mouse-rest-dock") ||
        target?.closest("button")?.innerText?.includes("Air Mouse")
      ) {
        return;
      }

      if (handoffPolicy === "auto") {
        setToastMessage("Physical click detected — returned to physical mouse");
        setTimeout(() => {
          onClose("physical_mouse_clicked");
        }, 200);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playTapFeedback();
        onClose("escape_key");
      } else if (e.key === "p" || e.key === "P") {
        playTapFeedback();
        setIsPaused((prev) => !prev);
      } else if (e.key === "c" || e.key === "C") {
        // Recenter cursor
        playTapFeedback();
        centerOffsetRef.current = { x: 0, y: 0 };
        currentPosRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        setPointerPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        setToastMessage("Cursor Recentered to Screen Center");
        setTimeout(() => setToastMessage(null), 1800);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { capture: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown, { capture: true });
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, handoffPolicy, onClose]);

  // Helper to trigger target element click with visual tactile ripple
  const triggerClick = useCallback(
    (el: HTMLElement, source = "Dwell Click") => {
      playPress();

      el.classList.add("dwell-ripple-effect");
      setTimeout(() => {
        el.classList.remove("dwell-ripple-effect");
      }, 450);

      el.click();
      el.focus();
      onDwellClick?.(el);

      const elText =
        el.getAttribute("aria-label") ||
        el.innerText?.slice(0, 30) ||
        el.tagName;
      setLastClickedElement(`${source}: ${elText}`);
    },
    [onDwellClick]
  );

  // 3. Motion Event Handler from Vision Tracker with Full Screen Mapping & 1€ Filter
  const handleMotionEvent = useCallback(
    (evt: MotionEvent) => {
      if (!evt.hasMotion || typeof window === "undefined") {
        if (
          lastMotionTimestampRef.current !== 0 &&
          performance.now() - lastMotionTimestampRef.current > 1200
        ) {
          setHasHandInView(false);
        }
        return;
      }

      setHasHandInView(true);
      lastMotionTimestampRef.current = performance.now();

      // evt.x and evt.y are already remapped from the active camera box to full-screen space (0..1)
      let targetNormX = evt.x;
      let targetNormY = evt.y;

      // Apply reach multiplier centered at 0.5
      if (motionReach !== 1.0) {
        targetNormX = Math.max(0, Math.min(1, (targetNormX - 0.5) * motionReach + 0.5));
        targetNormY = Math.max(0, Math.min(1, (targetNormY - 0.5) * motionReach + 0.5));
      }

      // Convert to full-screen window screen pixels (spanning edge-to-edge!)
      const edgeMargin = 12;
      const targetPxX = Math.max(
        edgeMargin,
        Math.min(window.innerWidth - edgeMargin, targetNormX * window.innerWidth + centerOffsetRef.current.x)
      );
      const targetPxY = Math.max(
        edgeMargin,
        Math.min(window.innerHeight - edgeMargin, targetNormY * window.innerHeight + centerOffsetRef.current.y)
      );

      // 1€ Filter Smoothing: removes jitter at rest, zero lag when moving fast
      const smoothed = filterRef.current.filter(targetPxX, targetPxY, performance.now());
      let finalX = smoothed.x;
      let finalY = smoothed.y;
      let isTargetSnapped = false;

      // ── STICKY TARGET MAGNETISM WITH HYSTERESIS LOCK ──
      if (stickyMagnetism && !isPaused) {
        // If already locked on a target button, maintain hysteresis lock until deliberate pull-out
        if (lockedTargetRef.current && document.body.contains(lockedTargetRef.current)) {
          const rect = lockedTargetRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distToCenter = Math.hypot(smoothed.x - centerX, smoothed.y - centerY);
          const breakoutRadius = Math.max(rect.width, rect.height) / 2 + 36;

          if (distToCenter < breakoutRadius) {
            // Strong hold inside button to absorb tremors
            finalX = centerX + (smoothed.x - centerX) * 0.18;
            finalY = centerY + (smoothed.y - centerY) * 0.18;
            isTargetSnapped = true;
          } else {
            // User intentionally pulled away: release lock
            lockedTargetRef.current = null;
          }
        }

        if (!isTargetSnapped) {
          // Proximity scan for nearest button within 85px
          const nearest = findNearestInteractiveTarget(smoothed.x, smoothed.y, 85);
          if (nearest) {
            if (nearest.isDirectHit || nearest.distance < 24) {
              lockedTargetRef.current = nearest.element;
              finalX = nearest.cx + (smoothed.x - nearest.cx) * 0.20;
              finalY = nearest.cy + (smoothed.y - nearest.cy) * 0.20;
              isTargetSnapped = true;
            } else {
              // Gentle magnetic glide towards target
              const pull = Math.pow(1 - nearest.distance / 85, 1.3) * 0.36;
              finalX = smoothed.x + (nearest.cx - smoothed.x) * pull;
              finalY = smoothed.y + (nearest.cy - smoothed.y) * pull;
            }
          }
        }
      }

      setIsSnapped(isTargetSnapped);

      // Direct GPU Transform Update (silky 60 FPS zero-lag rendering)
      if (cursorDomRef.current) {
        cursorDomRef.current.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;
      }
      currentPosRef.current = { x: finalX, y: finalY };
      setPointerPos({ x: finalX, y: finalY });

      // Check Pinch Gesture Click (Method B)
      const isCurrentlyPinching = Boolean(
        evt.isPinching ||
        evt.gesture === "PINCH_GRAB" ||
        evt.leftHand?.isPinching ||
        evt.rightHand?.isPinching
      );
      setIsPinchingActive(isCurrentlyPinching);

      if (clickMethod === "pinch" && isCurrentlyPinching && !wasPinchingRef.current && !isPaused) {
        const now = performance.now();
        if (now - lastPinchTimeRef.current > 320) {
          lastPinchTimeRef.current = now;
          const target =
            lockedTargetRef.current ||
            dwellTargetRef.current ||
            findNearestInteractiveTarget(finalX, finalY, 60)?.element;

          if (target) {
            triggerClick(target, "Pinch Gesture");
          }
        }
      }
      wasPinchingRef.current = isCurrentlyPinching;

      // Draw live mirror webcam video and hand tracking reticle to PIP canvas
      if (videoCanvasRef.current && pipViewMode === "pip") {
        const canvas = videoCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const videoEl = trackerRef.current?.getVideoElement();
          if (videoEl && videoEl.readyState >= 2) {
            ctx.save();
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            ctx.restore();
          } else {
            ctx.fillStyle = "#111827";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Draw Active Interaction Bounding Box (Visual Map to Full Screen)
          if (evt.camBounds) {
            const b = evt.camBounds;
            const bx = b.minX * canvas.width;
            const by = b.minY * canvas.height;
            const bw = (b.maxX - b.minX) * canvas.width;
            const bh = (b.maxY - b.minY) * canvas.height;

            ctx.save();
            ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(bx, by, bw, bh);
            ctx.restore();
          }

          // Draw Tracking Markers on Hand
          if (evt.thumbTip && evt.indexTip) {
            const tX = evt.thumbTip.x * canvas.width;
            const tY = evt.thumbTip.y * canvas.height;
            const iX = evt.indexTip.x * canvas.width;
            const iY = evt.indexTip.y * canvas.height;

            // Pinch Connection Line
            ctx.beginPath();
            ctx.moveTo(tX, tY);
            ctx.lineTo(iX, iY);
            ctx.strokeStyle = isCurrentlyPinching ? "#10B981" : "#F59E0B";
            ctx.lineWidth = isCurrentlyPinching ? 4 : 2;
            ctx.stroke();

            // Thumb marker (Blue)
            ctx.beginPath();
            ctx.arc(tX, tY, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#3B82F6";
            ctx.fill();

            // Index marker (Amber or Emerald upon Pinch)
            ctx.beginPath();
            ctx.arc(iX, iY, 5, 0, Math.PI * 2);
            ctx.fillStyle = isCurrentlyPinching ? "#10B981" : "#F59E0B";
            ctx.fill();
          } else {
            const reticleX = (evt.rawCamX ?? evt.x) * canvas.width;
            const reticleY = (evt.rawCamY ?? evt.y) * canvas.height;

            ctx.beginPath();
            ctx.arc(reticleX, reticleY, 15, 0, Math.PI * 2);
            ctx.strokeStyle = isCurrentlyPinching ? "#10B981" : isTargetSnapped ? "#3B82F6" : "#F59E0B";
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(reticleX, reticleY, 4, 0, Math.PI * 2);
            ctx.fillStyle = isCurrentlyPinching ? "#10B981" : "#EF4444";
            ctx.fill();
          }
        }
      }
    },
    [motionReach, clickMethod, stickyMagnetism, pipViewMode, isPaused, triggerClick]
  );

  // 4. Initialize Optical / MediaPipe Motion Tracker
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

  // 5. Hit Detection, Target Highlighting, & Dwell-Click Loop
  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const checkDwell = () => {
      const cur = currentPosRef.current;
      const x = cur.x;
      const y = cur.y;

      const elements = document.elementsFromPoint(x, y);
      let targetElement = (elements.find((el) => {
        if (
          el.closest("#virtual-air-mouse-overlay") ||
          el.closest("#air-mouse-pip-card") ||
          el.closest("#air-mouse-rest-dock")
        ) {
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

      if (!targetElement && lockedTargetRef.current) {
        targetElement = lockedTargetRef.current;
      }

      onHoverTarget?.(targetElement);

      // Manage high-contrast target highlight outline
      if (highlightedElementRef.current && highlightedElementRef.current !== targetElement) {
        highlightedElementRef.current.style.removeProperty("outline");
        highlightedElementRef.current.style.removeProperty("boxShadow");
        highlightedElementRef.current = null;
      }

      if (targetElement && !isPaused) {
        targetElement.style.outline = "3px solid #F59E0B";
        targetElement.style.boxShadow = "0 0 16px rgba(245, 158, 11, 0.5)";
        highlightedElementRef.current = targetElement;
        dwellTargetRef.current = targetElement;

        // In Dwell Click Mode, run timer if not paused
        if (clickMethod === "dwell") {
          const rect = targetElement.getBoundingClientRect();
          const isInsideTolerance =
            x >= rect.left - 18 &&
            x <= rect.right + 18 &&
            y >= rect.top - 18 &&
            y <= rect.bottom + 18;

          if (!dwellStartRef.current || !isInsideTolerance) {
            dwellStartRef.current = performance.now();
            lastTickQuarterRef.current = 0;
            setIsDwellActive(true);
            setDwellProgress(0);
          } else {
            const elapsed = performance.now() - dwellStartRef.current;
            const pct = Math.min(100, Math.round((elapsed / dwellTimeMs) * 100));
            setDwellProgress(pct);

            if (audioTicks) {
              const currentQuarter = Math.floor(pct / 25);
              if (currentQuarter > lastTickQuarterRef.current && currentQuarter < 4) {
                lastTickQuarterRef.current = currentQuarter;
                playDwellTick(pct);
              }
            }

            if (pct >= 100) {
              triggerClick(targetElement, "Dwell");
              dwellStartRef.current = performance.now() + 650;
              lastTickQuarterRef.current = 0;
              setDwellProgress(0);
              setIsDwellActive(false);
            }
          }
        } else {
          setIsDwellActive(true);
          setDwellProgress(100);
        }
      } else {
        dwellStartRef.current = null;
        dwellTargetRef.current = null;
        lastTickQuarterRef.current = 0;
        setIsDwellActive(false);
        setDwellProgress(0);
      }
    };

    const intervalId = setInterval(checkDwell, 25);
    return () => clearInterval(intervalId);
  }, [
    active,
    dwellTimeMs,
    clickMethod,
    isPaused,
    audioTicks,
    onHoverTarget,
    triggerClick,
  ]);

  // 6. Keyboard Tap-to-Click in 'key' mode
  useEffect(() => {
    if (!active || clickMethod !== "key" || typeof window === "undefined" || isPaused) return;

    const handleKeyClick = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA"
        ) {
          return;
        }
        if (dwellTargetRef.current) {
          e.preventDefault();
          triggerClick(dwellTargetRef.current, "Key Tap");
        }
      }
    };

    window.addEventListener("keydown", handleKeyClick);
    return () => window.removeEventListener("keydown", handleKeyClick);
  }, [active, clickMethod, isPaused, triggerClick]);

  if (!active) return null;

  const ringColor = dwellProgress > 70 ? "#10B981" : "#F59E0B";

  return (
    <div id="virtual-air-mouse-overlay" className="pointer-events-none fixed inset-0 z-9999 select-none">
      {/* ── 1. GLOWING HIGH-CONTRAST AIR POINTER CURSOR (GPU HARDWARE ACCELERATED) ── */}
      <div
        ref={cursorDomRef}
        className="pointer-events-none fixed top-0 left-0 will-change-transform"
        style={{
          transform: `translate3d(${pointerPos.x}px, ${pointerPos.y}px, 0)`,
        }}
      >
        {/* Outer Pulsing Glow */}
        <div
          className={`absolute rounded-full transition-all duration-200 ${
            isPaused
              ? "bg-slate-400/30 ring-2 ring-slate-400"
              : isSnapped
              ? "bg-sky-400/50 ring-4 ring-sky-400 scale-110 animate-pulse"
              : isPinchingActive
              ? "bg-emerald-400/60 ring-6 ring-emerald-400 animate-pulse scale-130"
              : isDwellActive
              ? dwellProgress > 70
                ? "bg-emerald-400/40 ring-4 ring-emerald-400 animate-pulse scale-115"
                : "bg-amber-400/40 ring-4 ring-amber-400 animate-pulse scale-110"
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
        {clickMethod === "dwell" && !isPaused && (
          <svg
            className="absolute -rotate-90 pointer-events-none"
            width={cursorDimensions.ring}
            height={cursorDimensions.ring}
            style={{
              top: `-${cursorDimensions.ring / 2}px`,
              left: `-${cursorDimensions.ring / 2}px`,
            }}
          >
            <circle
              cx={cursorDimensions.ring / 2}
              cy={cursorDimensions.ring / 2}
              r={cursorDimensions.ring / 2 - 4}
              fill="none"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth={cursorDimensions.stroke}
            />
            <circle
              cx={cursorDimensions.ring / 2}
              cy={cursorDimensions.ring / 2}
              r={cursorDimensions.ring / 2 - 4}
              fill="none"
              stroke={ringColor}
              strokeWidth={cursorDimensions.stroke}
              strokeDasharray={Math.PI * (cursorDimensions.ring - 8)}
              strokeDashoffset={
                Math.PI * (cursorDimensions.ring - 8) * (1 - dwellProgress / 100)
              }
              strokeLinecap="round"
              className="transition-all duration-75"
            />
          </svg>
        )}

        {/* Inner Tactile Hand Pointer Icon */}
        <div
          className={`flex items-center justify-center rounded-full border-3 border-black text-black shadow-[3px_3px_0px_#000] ${
            isPaused
              ? "bg-slate-200 text-slate-700"
              : isPinchingActive
              ? "bg-emerald-400 ring-2 ring-emerald-500 scale-110"
              : isSnapped
              ? "bg-sky-300 ring-2 ring-sky-400"
              : dwellProgress > 70
              ? "bg-emerald-300"
              : "bg-amber-300"
          }`}
          style={{
            width: `${cursorDimensions.size}px`,
            height: `${cursorDimensions.size}px`,
            marginLeft: `-${cursorDimensions.size / 2}px`,
            marginTop: `-${cursorDimensions.size / 2}px`,
          }}
        >
          {isPaused ? (
            <Pause className="h-4 w-4 stroke-[2.5]" />
          ) : isSnapped ? (
            <Magnet className="h-4 w-4 stroke-[2.5] text-sky-950" />
          ) : clickMethod === "pinch" ? (
            <Sparkles className="h-5 w-5 stroke-[2.5]" />
          ) : (
            <Hand className="h-5 w-5 stroke-[2.5]" />
          )}
        </div>

        {/* Live Action Hint / Percentage Badge */}
        {isPaused ? (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-black bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-800 shadow-[2px_2px_0px_#000]">
            REST MODE (P to resume)
          </div>
        ) : isPinchingActive ? (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-black bg-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-950 shadow-[2px_2px_0px_#000] animate-bounce">
            PINCH!
          </div>
        ) : isDwellActive ? (
          <div
            className={`absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-black px-2 py-0.5 text-[10px] font-black shadow-[2px_2px_0px_#000] ${
              dwellProgress > 70
                ? "bg-emerald-200 text-emerald-950"
                : isSnapped
                ? "bg-sky-100 text-sky-950"
                : "bg-white text-ink"
            }`}
          >
            {clickMethod === "dwell"
              ? isSnapped ? `SNAPPED ${dwellProgress}%` : `${dwellProgress}%`
              : clickMethod === "pinch"
              ? "Pinch to click"
              : "Press Space/Enter"}
          </div>
        ) : isSnapped ? (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-black bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-950 shadow-[2px_2px_0px_#000]">
            Snapped to button
          </div>
        ) : !hasHandInView ? (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-black bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-950 shadow-[2px_2px_0px_#000] animate-bounce">
            Raise hand in view of camera
          </div>
        ) : null}
      </div>

      {/* ── 2. TOAST NOTIFICATION (Physical Handoff Alert / Center Toast) ── */}
      {toastMessage && (
        <div className="pointer-events-none fixed top-16 left-1/2 -translate-x-1/2 z-10001 animate-bounce rounded-2xl border-3 border-black bg-white px-4 py-2 text-xs font-black text-ink shadow-[4px_4px_0px_#000] flex items-center gap-2">
          <MousePointer className="h-4 w-4 text-tea" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 3. FLOATING REST & RECENTER DOCK ── */}
      <div
        id="air-mouse-rest-dock"
        className="pointer-events-auto fixed top-12 left-1/2 -translate-x-1/2 z-10000 flex items-center gap-2 rounded-2xl border-3 border-black bg-white/95 px-3 py-1.5 shadow-[4px_4px_0px_#000] backdrop-blur-xs"
      >
        <button
          type="button"
          onClick={() => {
            playTapFeedback();
            setIsPaused(!isPaused);
          }}
          className={`flex items-center gap-1.5 rounded-xl border-2 border-black px-2.5 py-1 text-xs font-black cursor-pointer transition-colors ${
            isPaused
              ? "bg-emerald-400 text-black shadow-xs ring-2 ring-emerald-300"
              : "bg-amber-300 text-black hover:bg-amber-400 shadow-xs"
          }`}
          title={isPaused ? "Resume in-air clicking (Key: P)" : "Pause clicking for arm rest (Key: P)"}
        >
          {isPaused ? <Play className="h-3.5 w-3.5 fill-black" /> : <Pause className="h-3.5 w-3.5" />}
          <span>{isPaused ? "Resume Clicking (P)" : "Rest (P)"}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTapFeedback();
            centerOffsetRef.current = { x: 0, y: 0 };
            currentPosRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            setPointerPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
            setToastMessage("Cursor Recentered");
            setTimeout(() => setToastMessage(null), 1500);
          }}
          className="flex items-center gap-1 rounded-xl border border-black/40 bg-surface px-2 py-1 text-[11px] font-bold text-ink hover:bg-surface-muted cursor-pointer"
          title="Recenter cursor to center of screen (Key: C)"
        >
          <Crosshair className="h-3 w-3 text-tea" />
          <span>Recenter (C)</span>
        </button>

        {stickyMagnetism && (
          <span
            className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-tea bg-tea-light rounded-lg px-2 py-0.5 border border-tea/30"
            title="Target Magnetism: Automatically snaps pointer to nearby buttons"
          >
            <Magnet className="h-3 w-3 text-sky-600" /> Auto-Snap
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            playPress();
            onClose("rest_dock_exit");
          }}
          className="flex items-center gap-1 rounded-xl border border-black/40 bg-surface px-2 py-1 text-[11px] font-bold text-ink hover:bg-surface-muted cursor-pointer"
          title="Return to Physical Mouse"
        >
          <span>Use Mouse</span>
        </button>
      </div>

      {/* ── 4. PICTURE-IN-PICTURE (PIP) CAMERA TRACKING HUD ── */}
      {pipViewMode !== "hidden" && (
        <div
          id="air-mouse-pip-card"
          className="pointer-events-auto fixed bottom-6 left-6 z-10000 flex max-w-[calc(100vw-1.5rem)] flex-col rounded-2xl border-4 border-black bg-[#FAF6F0] p-3 shadow-[6px_6px_0px_#000] transition-all"
          style={{ width: pipViewMode === "minimized" ? "190px" : "250px" }}
        >
          {/* PIP Header */}
          <div className="flex items-center justify-between border-b-2 border-black/15 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-2.5 w-2.5 rounded-full ${
                  isPaused
                    ? "bg-slate-400"
                    : hasHandInView
                    ? "bg-emerald-500 animate-ping"
                    : "bg-amber-500 animate-pulse"
                }`}
              />
              <span className="text-xs font-black uppercase text-ink flex items-center gap-1">
                <Hand className="h-3.5 w-3.5 text-tea" />
                <span>{isPaused ? "Air Mouse (Paused)" : "Air Mouse (Active)"}</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  playTapFeedback();
                  setIsLocalMinimized(!isLocalMinimized);
                }}
                className="flex h-6 w-6 items-center justify-center rounded-lg border border-black bg-white text-ink hover:bg-amber-100 cursor-pointer"
                title={pipViewMode === "minimized" ? "Expand Camera HUD" : "Minimize Camera HUD"}
              >
                {pipViewMode === "minimized" ? (
                  <Maximize2 className="h-3 w-3 stroke-[2.5]" />
                ) : (
                  <Minimize2 className="h-3 w-3 stroke-[2.5]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  playPress();
                  onClose("close_button");
                }}
                className="flex h-6 w-6 items-center justify-center rounded-lg border border-black bg-white text-ink hover:bg-rose-500 hover:text-white cursor-pointer"
                title="Exit Virtual Air Mouse (Return to Physical Mouse)"
              >
                <X className="h-3 w-3 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Camera Canvas Stream & Status */}
          {pipViewMode === "pip" && (
            <>
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border-2 border-black bg-black">
                {cameraStarted ? (
                  <canvas
                    ref={videoCanvasRef}
                    width={240}
                    height={180}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center text-white">
                    <Hand className="h-8 w-8 animate-bounce text-amber-400" />
                    <span className="mt-1 text-[11px] font-bold">
                      {cameraError || "Initializing Web Vision..."}
                    </span>
                  </div>
                )}

                {/* Status overlay on camera */}
                <div className="absolute top-1.5 right-1.5 rounded-md border border-black bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-black">
                  {isPaused
                    ? "PAUSED"
                    : !hasHandInView
                    ? "NO HAND IN VIEW"
                    : isSnapped
                    ? "SNAPPED"
                    : isPinchingActive
                    ? "PINCH"
                    : isDwellActive
                    ? clickMethod === "dwell"
                      ? `DWELLING (${dwellProgress}%)`
                      : "PINCH READY"
                    : "FULL SCREEN 100%"}
                </div>
              </div>

              <div className="mt-2 space-y-1 text-[10px] font-bold text-ink-secondary">
                <div className="flex items-center justify-between">
                  <span>Trigger Mode:</span>
                  <span className="font-black text-tea uppercase">{clickMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Full Screen Reach:</span>
                  <span className="font-black text-emerald-600">Active (100%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Smoothing Engine:</span>
                  <span className="font-black text-ink">1€ Filter (Zero-Lag)</span>
                </div>
                {lastClickedElement && (
                  <div className="truncate rounded bg-amber-100 px-1.5 py-0.5 text-amber-950">
                    Last click: <span className="font-black">{lastClickedElement}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Minimal View Footer */}
          {pipViewMode === "minimized" && (
            <div className="text-[10px] font-bold text-ink-secondary flex items-center justify-between">
              <span>{isPaused ? "Paused" : "Mode: " + clickMethod.toUpperCase()}</span>
              <span className="text-black/50">Esc to exit</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
