"use client";

import { useSyncExternalStore, useCallback, useState } from "react";
import {
  Eye,
  Hand,
  Volume2,
  Sliders,
  MousePointer,
} from "lucide-react";
import { VirtualAirMouse } from "@/components/accessibility/VirtualAirMouse";
import { KeyboardSwitchController } from "@/components/accessibility/KeyboardSwitchController";
import { AccessibilityModal } from "@/components/accessibility/AccessibilityModal";
import { useListenFirst } from "@/components/accessibility/useListenFirst";
import { playPress, unlockAudio } from "@/lib/sound";

function subscribeStorage(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("cognicare_accessibility_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("cognicare_accessibility_change", callback);
  };
}

function getFontSizeSnapshot(): "sm" | "md" | "lg" {
  try {
    const s = localStorage.getItem("cognicare_font_size");
    if (s === "sm" || s === "md" || s === "lg") return s;
  } catch {
    // Ignore read errors
  }
  return "md";
}

function getHighContrastSnapshot(): boolean {
  try {
    return localStorage.getItem("cognicare_high_contrast") === "true";
  } catch {
    // Ignore read errors
  }
  return false;
}

function getInputModeSnapshot(): "physical" | "virtual" {
  try {
    const v = localStorage.getItem("cognicare_input_mode");
    if (v === "virtual" || v === "physical") return v;
    if (localStorage.getItem("cognicare_air_mouse") === "true") return "virtual";
  } catch {
    // Ignore
  }
  return "physical";
}

function getListenFirstSnapshot(): boolean {
  try {
    return localStorage.getItem("cognicare_listen_first") === "true";
  } catch {
    // Ignore
  }
  return false;
}

function getDwellTimeSnapshot(): number {
  try {
    const v = localStorage.getItem("cognicare_dwell_time");
    if (v) return Number(v);
  } catch {
    // Ignore
  }
  return 1000;
}

function getSmoothingSnapshot(): number {
  try {
    const v = localStorage.getItem("cognicare_smoothing");
    if (v) return Number(v);
  } catch {
    // Ignore
  }
  return 0.35;
}

function getMotionReachSnapshot(): number {
  try {
    const v = localStorage.getItem("cognicare_motion_reach");
    if (v) return Number(v);
  } catch {
    // Ignore
  }
  return 1.0;
}

function getClickMethodSnapshot(): "dwell" | "pinch" | "key" {
  try {
    const v = localStorage.getItem("cognicare_click_method");
    if (v === "dwell" || v === "pinch" || v === "key") return v;
  } catch {
    // Ignore
  }
  return "pinch"; // Method B: Pinch Gesture Click is the primary default
}

function getCameraViewModeSnapshot(): "pip" | "minimized" | "hidden" {
  try {
    const v = localStorage.getItem("cognicare_camera_view");
    if (v === "pip" || v === "minimized" || v === "hidden") return v;
  } catch {
    // Ignore
  }
  return "pip";
}

function getHandoffPolicySnapshot(): "auto" | "strict" {
  try {
    const v = localStorage.getItem("cognicare_handoff_policy");
    if (v === "auto" || v === "strict") return v;
  } catch {
    // Ignore
  }
  return "auto";
}

function getStickyMagnetismSnapshot(): boolean {
  try {
    const v = localStorage.getItem("cognicare_sticky_magnetism");
    if (v !== null) return v === "true";
  } catch {
    // Ignore
  }
  return true;
}

function getAudioTicksSnapshot(): boolean {
  try {
    const v = localStorage.getItem("cognicare_audio_ticks");
    if (v !== null) return v === "true";
  } catch {
    // Ignore
  }
  return true;
}

function getCursorSizeSnapshot(): "normal" | "large" | "giant" {
  try {
    const v = localStorage.getItem("cognicare_cursor_size");
    if (v === "normal" || v === "large" || v === "giant") return v;
  } catch {
    // Ignore
  }
  return "large";
}

function getCursorPaceSnapshot(): "calm" | "gentle" | "standard" {
  try {
    const v = localStorage.getItem("cognicare_cursor_pace");
    if (v === "calm" || v === "gentle" || v === "standard") return v;
  } catch {
    // Ignore
  }
  return "calm"; // Default: Slow, calm, steady movement for elders
}

export function AccessibilityToolbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fontSizeLevel = useSyncExternalStore<"sm" | "md" | "lg">(
    subscribeStorage,
    getFontSizeSnapshot,
    () => "md"
  );

  const highContrast = useSyncExternalStore<boolean>(
    subscribeStorage,
    getHighContrastSnapshot,
    () => false
  );

  const inputMode = useSyncExternalStore<"physical" | "virtual">(
    subscribeStorage,
    getInputModeSnapshot,
    () => "physical"
  );

  const listenFirstActive = useSyncExternalStore<boolean>(
    subscribeStorage,
    getListenFirstSnapshot,
    () => false
  );

  const dwellTimeMs = useSyncExternalStore<number>(
    subscribeStorage,
    getDwellTimeSnapshot,
    () => 1000
  );

  const smoothing = useSyncExternalStore<number>(
    subscribeStorage,
    getSmoothingSnapshot,
    () => 0.35
  );

  const motionReach = useSyncExternalStore<number>(
    subscribeStorage,
    getMotionReachSnapshot,
    () => 1.0
  );

  const clickMethod = useSyncExternalStore<"dwell" | "pinch" | "key">(
    subscribeStorage,
    getClickMethodSnapshot,
    () => "pinch"
  );

  const cameraViewMode = useSyncExternalStore<"pip" | "minimized" | "hidden">(
    subscribeStorage,
    getCameraViewModeSnapshot,
    () => "pip"
  );

  const handoffPolicy = useSyncExternalStore<"auto" | "strict">(
    subscribeStorage,
    getHandoffPolicySnapshot,
    () => "auto"
  );

  const stickyMagnetism = useSyncExternalStore<boolean>(
    subscribeStorage,
    getStickyMagnetismSnapshot,
    () => true
  );

  const audioTicks = useSyncExternalStore<boolean>(
    subscribeStorage,
    getAudioTicksSnapshot,
    () => true
  );

  const cursorSize = useSyncExternalStore<"normal" | "large" | "giant">(
    subscribeStorage,
    getCursorSizeSnapshot,
    () => "large"
  );

  const cursorPace = useSyncExternalStore<"calm" | "gentle" | "standard">(
    subscribeStorage,
    getCursorPaceSnapshot,
    () => "calm"
  );

  // Mount listen-first narration hook
  const { speakElement } = useListenFirst(listenFirstActive);

  // Mutators
  const setCursorPace = useCallback((pace: "calm" | "gentle" | "standard") => {
    try {
      localStorage.setItem("cognicare_cursor_pace", pace);
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore
    }
  }, []);
  const setStickyMagnetism = useCallback((on: boolean) => {
    try {
      localStorage.setItem("cognicare_sticky_magnetism", String(on));
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore
    }
  }, []);

  const setAudioTicks = useCallback((on: boolean) => {
    try {
      localStorage.setItem("cognicare_audio_ticks", String(on));
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore
    }
  }, []);
  const setFontSize = useCallback((level: "sm" | "md" | "lg") => {
    try {
      localStorage.setItem("cognicare_font_size", level);
      const root = document.documentElement;
      if (level === "sm") root.style.fontSize = "16px";
      else if (level === "lg") root.style.fontSize = "22px";
      else root.style.fontSize = "18px";
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore
    }
  }, []);

  const toggleHighContrast = useCallback(() => {
    try {
      const next = !getHighContrastSnapshot();
      localStorage.setItem("cognicare_high_contrast", String(next));
      if (next) {
        document.documentElement.classList.add("high-contrast-mode");
      } else {
        document.documentElement.classList.remove("high-contrast-mode");
      }
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore
    }
  }, []);

  const setInputMode = useCallback((mode: "physical" | "virtual") => {
    try {
      unlockAudio();
      localStorage.setItem("cognicare_input_mode", mode);
      localStorage.setItem("cognicare_air_mouse", String(mode === "virtual"));
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore
    }
  }, []);

  const toggleAirMouse = useCallback((forceVal?: boolean) => {
    try {
      unlockAudio();
      const current = getInputModeSnapshot() === "virtual";
      const next = typeof forceVal === "boolean" ? forceVal : !current;
      setInputMode(next ? "virtual" : "physical");
    } catch {
      // Ignore
    }
  }, [setInputMode]);

  const toggleListenFirst = useCallback((forceVal?: boolean) => {
    try {
      unlockAudio();
      const current = getListenFirstSnapshot();
      const next = typeof forceVal === "boolean" ? forceVal : !current;
      localStorage.setItem("cognicare_listen_first", String(next));
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore
    }
  }, []);

  const setDwellTime = useCallback((ms: number) => {
    try {
      localStorage.setItem("cognicare_dwell_time", String(ms));
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore
    }
  }, []);

  const setSmoothing = useCallback((val: number) => {
    try {
      localStorage.setItem("cognicare_smoothing", String(val));
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore
    }
  }, []);

  const setMotionReach = useCallback((val: number) => {
    try {
      localStorage.setItem("cognicare_motion_reach", String(val));
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore
    }
  }, []);

  const setClickMethod = useCallback((method: "dwell" | "pinch" | "key") => {
    try {
      localStorage.setItem("cognicare_click_method", method);
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore
    }
  }, []);

  const setCameraViewMode = useCallback((mode: "pip" | "minimized" | "hidden") => {
    try {
      localStorage.setItem("cognicare_camera_view", mode);
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore
    }
  }, []);

  const setHandoffPolicy = useCallback((policy: "auto" | "strict") => {
    try {
      localStorage.setItem("cognicare_handoff_policy", policy);
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore
    }
  }, []);

  const setCursorSize = useCallback((size: "normal" | "large" | "giant") => {
    try {
      localStorage.setItem("cognicare_cursor_size", size);
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore
    }
  }, []);

  return (
    <>
      {/* ── TOP GOVERNMENT & ACCESSIBILITY COMMAND BAR ── */}
      <div className="w-full border-b border-black/15 bg-[#F5EFE6] px-2 sm:px-4 md:px-6 py-1 text-xs text-ink select-none overflow-x-clip">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-1.5 sm:gap-2 flex-nowrap">
          {/* Government of India / MDoNER Mandate Badge */}
          <div className="flex items-center gap-1.5 font-bold shrink-0">
            <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-tea whitespace-nowrap">
              <span className="inline-block h-2 w-2 rounded-full bg-tea animate-pulse" />
              MoHFW &bull; MDoNER
            </span>
            <span className="text-black/30 hidden 2xl:inline">|</span>
            <span className="text-[11px] text-ink-secondary hidden 2xl:inline whitespace-nowrap">
              Cognitive Digital Therapeutics (CDTx)
            </span>
          </div>

          {/* Quick Accessibility Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* 🖱️ / 🖐️ INPUT MODE SEGMENTED TOGGLE (STRICT MUTUAL EXCLUSION: ONE AT A TIME) */}
            <div
              className="flex items-center rounded-xl border-2 border-black/50 bg-surface p-0.5 shadow-xs shrink-0"
              title="Input Mode: Either Physical Mouse or OpenCV Virtual Air Mouse (One at a time)"
            >
              <button
                type="button"
                onClick={() => {
                  playPress();
                  setInputMode("physical");
                }}
                aria-pressed={inputMode === "physical"}
                className={`flex items-center gap-1 rounded-lg px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
                  inputMode === "physical"
                    ? "bg-tea text-white shadow-xs"
                    : "text-ink hover:bg-surface-muted"
                }`}
                title="Physical Mouse & Touch Mode (Standard OS Cursor)"
              >
                <MousePointer className="h-3 w-3 stroke-[2.5]" />
                <span className="hidden md:inline">Mouse</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playPress();
                  setInputMode("virtual");
                }}
                aria-pressed={inputMode === "virtual"}
                className={`flex items-center gap-1 rounded-lg px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
                  inputMode === "virtual"
                    ? "bg-amber-400 text-black shadow-xs ring-2 ring-amber-300 animate-pulse"
                    : "text-ink hover:bg-surface-muted"
                }`}
                title="OpenCV Virtual Air Mouse (In-Air Hand Tracking, Esc to exit)"
              >
                <Hand className="h-3 w-3 stroke-[2.5]" />
                <span className="hidden md:inline">
                  {inputMode === "virtual" ? "Air (ON)" : "Air Mouse"}
                </span>
                <span className="md:hidden">
                  {inputMode === "virtual" ? "Air: ON" : "Air"}
                </span>
              </button>
            </div>

            {/* 🗣️ Listen-First Quick Toggle */}
            <button
              type="button"
              onClick={() => {
                playPress();
                toggleListenFirst();
              }}
              aria-pressed={listenFirstActive}
              className={`flex items-center gap-1 rounded-lg px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-black border-2 transition-all cursor-pointer shrink-0 ${
                listenFirstActive
                  ? "bg-emerald-400 text-black border-black shadow-xs"
                  : "bg-surface text-ink border-black/40 hover:border-black shadow-xs"
              }`}
              title="Toggle Listen-First Auto-Narration on Hover/Focus"
            >
              <Volume2 className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="hidden lg:inline">
                {listenFirstActive ? "Listen: ON" : "Listen-First"}
              </span>
            </button>

            {/* ⚙️ Accessibility Suite Settings Modal */}
            <button
              type="button"
              onClick={() => {
                playPress();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1 rounded-lg border-2 border-black/40 bg-surface px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-black text-ink hover:border-black shadow-xs cursor-pointer shrink-0"
              title="Open Elder Accessibility Suite (WCAG AAA Settings)"
            >
              <Sliders className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="hidden lg:inline">Settings</span>
            </button>

            {/* High Contrast Toggle */}
            <button
              type="button"
              onClick={toggleHighContrast}
              aria-pressed={highContrast}
              className={`flex items-center gap-1 rounded-lg px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-black border-2 transition-all cursor-pointer shrink-0 ${
                highContrast
                  ? "bg-amber-400 text-black border-black shadow-xs"
                  : "bg-surface text-ink border-black/40 hover:border-black shadow-xs"
              }`}
              title="Toggle High Contrast Mode"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{highContrast ? "Contrast: ON" : "Contrast"}</span>
            </button>

            {/* Font Size Scaler */}
            <div className="flex items-center gap-0.5 rounded border border-black/30 bg-surface p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setFontSize("sm")}
                className={`px-1.5 py-0.5 text-[10px] font-black rounded cursor-pointer ${
                  fontSizeLevel === "sm" ? "bg-tea text-white" : "hover:bg-surface-muted text-ink"
                }`}
                title="Small Text"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize("md")}
                className={`px-1.5 py-0.5 text-[10px] font-black rounded cursor-pointer ${
                  fontSizeLevel === "md" ? "bg-tea text-white" : "hover:bg-surface-muted text-ink"
                }`}
                title="Standard Text"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize("lg")}
                className={`px-1.5 py-0.5 text-[10px] font-black rounded cursor-pointer ${
                  fontSizeLevel === "lg" ? "bg-tea text-white" : "hover:bg-surface-muted text-ink"
                }`}
                title="Large Text (Elder Assist)"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── GLOBAL ACTIVE ACCESSIBILITY RUNTIMES ── */}
      {/* 1. OpenCV Virtual Air Mouse (Strict Mutual Exclusion) */}
      <VirtualAirMouse
        active={inputMode === "virtual"}
        onClose={() => setInputMode("physical")}
        dwellTimeMs={dwellTimeMs}
        smoothing={smoothing}
        motionReach={motionReach}
        cursorSize={cursorSize}
        cursorPace={cursorPace}
        clickMethod={clickMethod}
        cameraViewMode={cameraViewMode}
        handoffPolicy={handoffPolicy}
        stickyMagnetism={stickyMagnetism}
        audioTicks={audioTicks}
        onHoverTarget={(el) => {
          if (listenFirstActive && el) {
            speakElement(el);
          }
        }}
      />

      {/* 2. Keyboard & Switch Access Controller */}
      <KeyboardSwitchController
        active={true}
        onToggleAirMouse={() => setInputMode(inputMode === "virtual" ? "physical" : "virtual")}
        onSpeakFocus={() => {
          const el = document.activeElement as HTMLElement | null;
          if (el) speakElement(el);
        }}
      />

      {/* 3. Elder Accessibility Settings Modal */}
      <AccessibilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        inputMode={inputMode}
        onInputModeChange={setInputMode}
        airMouseActive={inputMode === "virtual"}
        onToggleAirMouse={toggleAirMouse}
        clickMethod={clickMethod}
        onClickMethodChange={setClickMethod}
        dwellTimeMs={dwellTimeMs}
        onDwellTimeChange={setDwellTime}
        smoothing={smoothing}
        onSmoothingChange={setSmoothing}
        motionReach={motionReach}
        onMotionReachChange={setMotionReach}
        cursorSize={cursorSize}
        onCursorSizeChange={setCursorSize}
        cursorPace={cursorPace}
        onCursorPaceChange={setCursorPace}
        cameraViewMode={cameraViewMode}
        onCameraViewModeChange={setCameraViewMode}
        handoffPolicy={handoffPolicy}
        onHandoffPolicyChange={setHandoffPolicy}
        stickyMagnetism={stickyMagnetism}
        onStickyMagnetismChange={setStickyMagnetism}
        audioTicks={audioTicks}
        onAudioTicksChange={setAudioTicks}
        listenFirstEnabled={listenFirstActive}
        onToggleListenFirst={toggleListenFirst}
        highContrast={highContrast}
        onToggleHighContrast={toggleHighContrast}
        fontSizeLevel={fontSizeLevel}
        onFontSizeChange={setFontSize}
      />
    </>
  );
}
