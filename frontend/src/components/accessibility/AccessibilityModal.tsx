"use client";

import React from "react";
import {
  Hand,
  Volume2,
  Keyboard,
  Eye,
  Sliders,
  X,
} from "lucide-react";
import { playPress, playTapFeedback } from "@/lib/sound";

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  airMouseActive: boolean;
  onToggleAirMouse: (on: boolean) => void;
  dwellTimeMs: number;
  onDwellTimeChange: (ms: number) => void;
  smoothing: number;
  onSmoothingChange: (val: number) => void;
  cursorSize: "normal" | "large" | "giant";
  onCursorSizeChange: (size: "normal" | "large" | "giant") => void;
  listenFirstEnabled: boolean;
  onToggleListenFirst: (on: boolean) => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  fontSizeLevel: "sm" | "md" | "lg";
  onFontSizeChange: (level: "sm" | "md" | "lg") => void;
}

export function AccessibilityModal({
  isOpen,
  onClose,
  airMouseActive,
  onToggleAirMouse,
  dwellTimeMs,
  onDwellTimeChange,
  smoothing,
  onSmoothingChange,
  cursorSize,
  onCursorSizeChange,
  listenFirstEnabled,
  onToggleListenFirst,
  highContrast,
  onToggleHighContrast,
  fontSizeLevel,
  onFontSizeChange,
}: AccessibilityModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-10000 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in select-none">
      <div className="relative flex w-full max-w-xl flex-col rounded-3xl border-4 border-black bg-[#FAF6F0] p-6 shadow-[10px_10px_0px_#000] max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b-3 border-black/15 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-3 border-black bg-amber-300 text-ink shadow-[2px_2px_0px_#000]">
              <Sliders className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-xl sm:text-2xl font-black text-ink">
                  Elder Accessibility Suite
                </h2>
                <span className="rounded-full bg-tea px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
                  WCAG AAA
                </span>
              </div>
              <p className="text-xs font-bold text-ink-secondary">
                Hand Tracking • Voice Narration • Switch Control
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playPress();
              onClose();
            }}
            className="btn-tactile flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white text-ink hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
            aria-label="Close Accessibility Settings"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="space-y-5 text-ink">
          {/* ── 1. VIRTUAL AIR MOUSE & HAND GESTURES ── */}
          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-amber-300 text-ink">
                  <Hand className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-black">🖐️ Virtual Air Mouse (OpenCV Tracking)</h3>
                  <p className="text-xs font-bold text-ink-secondary">
                    Control pointer in the air & dwell to click without a physical mouse
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  playPress();
                  onToggleAirMouse(!airMouseActive);
                }}
                className={`btn-tactile rounded-xl border-2 border-black px-4 py-2 text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer transition-colors ${
                  airMouseActive ? "bg-emerald-400 text-black" : "bg-white text-ink hover:bg-amber-100"
                }`}
              >
                {airMouseActive ? "Enabled ✓" : "Turn On"}
              </button>
            </div>

            {airMouseActive && (
              <div className="pt-2 border-t border-black/10 space-y-3">
                {/* Dwell Time Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span>⏱️ Dwell Click Speed:</span>
                    <span className="font-black text-tea">{(dwellTimeMs / 1000).toFixed(1)} seconds</span>
                  </div>
                  <input
                    type="range"
                    min="600"
                    max="2000"
                    step="100"
                    value={dwellTimeMs}
                    onChange={(e) => onDwellTimeChange(Number(e.target.value))}
                    className="w-full accent-tea cursor-pointer"
                    aria-label="Dwell Click Time"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-ink-secondary">
                    <span>Fast (0.6s)</span>
                    <span>Standard (1.0s)</span>
                    <span>Relaxed (2.0s)</span>
                  </div>
                </div>

                {/* Tremor Damping Smoothing Slider */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span>🐢 Anti-Tremor Damping (Parkinson&apos;s Filter):</span>
                    <span className="font-black text-tea">{Math.round(smoothing * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="75"
                    step="5"
                    value={Math.round(smoothing * 100)}
                    onChange={(e) => onSmoothingChange(Number(e.target.value) / 100)}
                    className="w-full accent-tea cursor-pointer"
                    aria-label="Tremor Damping Factor"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-ink-secondary">
                    <span>Light (Fast response)</span>
                    <span>Moderate</span>
                    <span>Heavy (Max anti-shake)</span>
                  </div>
                </div>

                {/* Cursor Size Selector */}
                <div>
                  <span className="block text-xs font-bold mb-1.5">🎯 Pointer Size:</span>
                  <div className="flex gap-2">
                    {(["normal", "large", "giant"] as const).map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          playTapFeedback();
                          onCursorSizeChange(size);
                        }}
                        className={`flex-1 rounded-xl border-2 border-black py-1.5 text-xs font-black capitalize transition-colors ${
                          cursorSize === size
                            ? "bg-amber-300 text-black shadow-[2px_2px_0px_#000]"
                            : "bg-white text-ink hover:bg-amber-50"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── 2. "LISTEN-FIRST" SPOKEN SCREEN READER ── */}
          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-amber-300 text-ink">
                <Volume2 className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black">🗣️ Listen-First Audio Narration</h3>
                <p className="text-xs font-bold text-ink-secondary">
                  Automatically speaks hovered cards & focused elements in active regional language
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                playPress();
                onToggleListenFirst(!listenFirstEnabled);
              }}
              className={`btn-tactile rounded-xl border-2 border-black px-4 py-2 text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer transition-colors ${
                listenFirstEnabled ? "bg-emerald-400 text-black" : "bg-white text-ink hover:bg-amber-100"
              }`}
            >
              {listenFirstEnabled ? "Enabled ✓" : "Turn On"}
            </button>
          </div>

          {/* ── 3. KEYBOARD & SWITCH NAVIGATION ── */}
          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-amber-300 text-ink">
                <Keyboard className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black">⌨️ Keyboard Switch Shortcuts</h3>
                <p className="text-xs font-bold text-ink-secondary">
                  Direct physical keyboard and assistive switch controller mapping
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
              <div className="flex items-center gap-2 rounded-xl border border-black/20 bg-amber-50 p-2">
                <kbd className="rounded bg-black px-2 py-0.5 text-white font-mono font-black">Arrows / Tab</kbd>
                <span>Move Focus</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-black/20 bg-amber-50 p-2">
                <kbd className="rounded bg-black px-2 py-0.5 text-white font-mono font-black">Space / Enter</kbd>
                <span>Select / Click</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-black/20 bg-amber-50 p-2">
                <kbd className="rounded bg-black px-2 py-0.5 text-white font-mono font-black">M</kbd>
                <span>Toggle Air Mouse</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-black/20 bg-amber-50 p-2">
                <kbd className="rounded bg-black px-2 py-0.5 text-white font-mono font-black">V</kbd>
                <span>Speak Audio Guide</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-black/20 bg-amber-50 p-2">
                <kbd className="rounded bg-black px-2 py-0.5 text-white font-mono font-black">1 - 9</kbd>
                <span>Quick Game Launch</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-black/20 bg-amber-50 p-2">
                <kbd className="rounded bg-black px-2 py-0.5 text-white font-mono font-black">Esc</kbd>
                <span>Back / Close</span>
              </div>
            </div>
          </div>

          {/* ── 4. HIGH CONTRAST & FONT SIZE ── */}
          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-amber-300 text-ink">
                <Eye className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black">👁️ Visual Accessibility</h3>
                <p className="text-xs font-bold text-ink-secondary">
                  High-contrast borders and large elder-friendly typography
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleHighContrast}
                className={`btn-tactile rounded-xl border-2 border-black px-3 py-1.5 text-xs font-black shadow-[2px_2px_0px_#000] ${
                  highContrast ? "bg-amber-400 text-black" : "bg-white text-ink"
                }`}
              >
                {highContrast ? "Contrast: ON" : "High Contrast"}
              </button>

              <div className="flex items-center gap-1 rounded-xl border-2 border-black bg-white p-1">
                {(["sm", "md", "lg"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => {
                      playTapFeedback();
                      onFontSizeChange(level);
                    }}
                    className={`px-2 py-0.5 text-xs font-black rounded-lg ${
                      fontSizeLevel === level ? "bg-tea text-white" : "hover:bg-amber-100 text-ink"
                    }`}
                  >
                    {level === "sm" ? "A-" : level === "md" ? "A" : "A+"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Done Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => {
              playPress();
              onClose();
            }}
            className="btn-tactile rounded-2xl border-3 border-black bg-tea px-8 py-3 text-sm font-black text-white shadow-[4px_4px_0px_#000] hover:bg-emerald-700 cursor-pointer"
          >
            Save & Close ✓
          </button>
        </div>
      </div>
    </div>
  );
}
