"use client";

import { useSyncExternalStore, useCallback, useState } from "react";
import Link from "next/link";
import {
  Eye,
  Paperclip,
  Activity,
  Hand,
  Volume2,
  Sliders,
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

function getAirMouseSnapshot(): boolean {
  try {
    return localStorage.getItem("cognicare_air_mouse") === "true";
  } catch {
    // Ignore
  }
  return false;
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

function getCursorSizeSnapshot(): "normal" | "large" | "giant" {
  try {
    const v = localStorage.getItem("cognicare_cursor_size");
    if (v === "normal" || v === "large" || v === "giant") return v;
  } catch {
    // Ignore
  }
  return "large";
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

  const airMouseActive = useSyncExternalStore<boolean>(
    subscribeStorage,
    getAirMouseSnapshot,
    () => false
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

  const cursorSize = useSyncExternalStore<"normal" | "large" | "giant">(
    subscribeStorage,
    getCursorSizeSnapshot,
    () => "large"
  );

  // Mount listen-first narration hook
  const { speakElement } = useListenFirst(listenFirstActive);

  // Mutators
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

  const toggleAirMouse = useCallback((forceVal?: boolean) => {
    try {
      unlockAudio();
      const current = getAirMouseSnapshot();
      const next = typeof forceVal === "boolean" ? forceVal : !current;
      localStorage.setItem("cognicare_air_mouse", String(next));
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore
    }
  }, []);

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
      <div className="w-full border-b-2 border-black bg-[#EFE9DF] px-3 py-1.5 text-xs text-ink select-none font-bold">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          {/* Left: Problem Statement Label */}
          <div className="flex items-center gap-2">
            <Paperclip className="h-3.5 w-3.5 text-tea shrink-0" />
            <span className="hidden sm:inline text-[11px] font-black uppercase tracking-wider text-ink">
              CogniCare CDTx // Proposed Solution for MDoNER Problem Statement
            </span>
            <span className="sm:hidden text-[10px] font-black uppercase tracking-wider text-ink">
              CogniCare CDTx // MDoNER Track
            </span>
          </div>

          {/* Right: Accessibility Controls & Command Center Link */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Public Health Command Center Link */}
            <Link
              href="/command-center"
              className="flex items-center gap-1 text-[11px] font-black text-tea hover:underline"
            >
              <Activity className="h-3.5 w-3.5" />
              <span className="hidden md:inline">8-State NE Telemetry</span>
              <span className="md:hidden">Telemetry</span>
            </Link>

            <span className="text-black/30 hidden sm:inline">|</span>

            {/* 🖐️ Air Mouse Quick Toggle */}
            <button
              type="button"
              onClick={() => {
                playPress();
                toggleAirMouse();
              }}
              aria-pressed={airMouseActive}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-black border-2 transition-all cursor-pointer ${
                airMouseActive
                  ? "bg-amber-400 text-black border-black ring-2 ring-amber-300 shadow-xs animate-pulse"
                  : "bg-surface text-ink border-black/40 hover:border-black shadow-xs"
              }`}
              title="Toggle OpenCV Virtual Air Mouse (Key: M)"
            >
              <Hand className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">
                {airMouseActive ? "Air Mouse: ON" : "Air Mouse (M)"}
              </span>
              <span className="sm:hidden">
                {airMouseActive ? "Air: ON" : "Air Mouse"}
              </span>
            </button>

            {/* 🗣️ Listen-First Quick Toggle */}
            <button
              type="button"
              onClick={() => {
                playPress();
                toggleListenFirst();
              }}
              aria-pressed={listenFirstActive}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-black border-2 transition-all cursor-pointer ${
                listenFirstActive
                  ? "bg-emerald-400 text-black border-black shadow-xs"
                  : "bg-surface text-ink border-black/40 hover:border-black shadow-xs"
              }`}
              title="Toggle Listen-First Auto-Narration on Hover/Focus"
            >
              <Volume2 className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">
                {listenFirstActive ? "Listen: ON" : "Listen-First"}
              </span>
              <span className="sm:hidden">
                {listenFirstActive ? "Voice: ON" : "Voice"}
              </span>
            </button>

            {/* ⚙️ Accessibility Suite Settings Modal */}
            <button
              type="button"
              onClick={() => {
                playPress();
                setIsModalOpen(true);
              }}
              className="flex items-center gap-1 rounded-lg border-2 border-black/40 bg-surface px-2 py-1 text-xs font-black text-ink hover:border-black shadow-xs cursor-pointer"
              title="Open Elder Accessibility Suite (WCAG AAA Settings)"
            >
              <Sliders className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="hidden md:inline">Settings</span>
            </button>

            <span className="text-black/30 hidden sm:inline">|</span>

            {/* High Contrast Toggle */}
            <button
              type="button"
              onClick={toggleHighContrast}
              aria-pressed={highContrast}
              className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-black border-2 transition-all cursor-pointer ${
                highContrast
                  ? "bg-amber-400 text-black border-black shadow-xs"
                  : "bg-surface text-ink border-black/40 hover:border-black shadow-xs"
              }`}
              title="Toggle High Contrast Mode"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden md:inline">{highContrast ? "Contrast: ON" : "Contrast"}</span>
            </button>

            {/* Font Size Scaler */}
            <div className="flex items-center gap-0.5 rounded border border-black/30 bg-surface p-0.5">
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
                className={`px-1.5 py-0.5 text-[11px] font-black rounded cursor-pointer ${
                  fontSizeLevel === "md" ? "bg-tea text-white" : "hover:bg-surface-muted text-ink"
                }`}
                title="Standard Text"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize("lg")}
                className={`px-1.5 py-0.5 text-[12px] font-black rounded cursor-pointer ${
                  fontSizeLevel === "lg" ? "bg-tea text-white" : "hover:bg-surface-muted text-ink"
                }`}
                title="Large Text (Elderly Friendly)"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── GLOBAL ACTIVE ACCESSIBILITY RUNTIMES ── */}
      {/* 1. OpenCV Virtual Air Mouse */}
      <VirtualAirMouse
        active={airMouseActive}
        onClose={() => toggleAirMouse(false)}
        dwellTimeMs={dwellTimeMs}
        smoothing={smoothing}
        cursorSize={cursorSize}
        onHoverTarget={(el) => {
          if (listenFirstActive && el) {
            speakElement(el);
          }
        }}
      />

      {/* 2. Keyboard & Switch Access Controller */}
      <KeyboardSwitchController
        active={true}
        onToggleAirMouse={() => toggleAirMouse()}
        onSpeakFocus={() => {
          const el = document.activeElement as HTMLElement | null;
          if (el) speakElement(el);
        }}
      />

      {/* 3. Elder Accessibility Settings Modal */}
      <AccessibilityModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        airMouseActive={airMouseActive}
        onToggleAirMouse={toggleAirMouse}
        dwellTimeMs={dwellTimeMs}
        onDwellTimeChange={setDwellTime}
        smoothing={smoothing}
        onSmoothingChange={setSmoothing}
        cursorSize={cursorSize}
        onCursorSizeChange={setCursorSize}
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
