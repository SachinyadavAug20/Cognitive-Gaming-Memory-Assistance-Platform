"use client";

import { useSyncExternalStore, useCallback } from "react";
import Link from "next/link";
import { Eye, Paperclip, Activity } from "lucide-react";

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

export function AccessibilityToolbar() {
  const fontSizeLevel = useSyncExternalStore(
    subscribeStorage,
    getFontSizeSnapshot,
    () => "md"
  );

  const highContrast = useSyncExternalStore(
    subscribeStorage,
    getHighContrastSnapshot,
    () => false
  );

  const setFontSize = useCallback((level: "sm" | "md" | "lg") => {
    try {
      localStorage.setItem("cognicare_font_size", level);
      const root = document.documentElement;
      if (level === "sm") root.style.fontSize = "16px";
      else if (level === "lg") root.style.fontSize = "22px";
      else root.style.fontSize = "18px";
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
    } catch {
      // Ignore write errors
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
      // Ignore write errors
    }
  }, []);

  return (
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
        <div className="flex items-center gap-3">
          {/* Public Health Command Center Link */}
          <Link
            href="/command-center"
            className="flex items-center gap-1 text-[11px] font-black text-tea hover:underline"
          >
            <Activity className="h-3.5 w-3.5" />
            <span className="hidden md:inline">8-State NE Telemetry</span>
            <span className="md:hidden">Telemetry</span>
          </Link>

          <span className="text-black/30">|</span>

          {/* High Contrast Toggle */}
          <button
            type="button"
            onClick={toggleHighContrast}
            className={`flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-black border transition-all cursor-pointer ${
              highContrast
                ? "bg-black text-amber-300 border-black"
                : "bg-surface text-ink border-black/30 hover:border-black"
            }`}
            title="Toggle High Contrast Mode (GIGW Standard)"
          >
            <Eye className="h-3 w-3" />
            <span>{highContrast ? "Contrast: ON" : "Contrast"}</span>
          </button>

          {/* Font Size Scaler (A- / A / A+) */}
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
  );
}
