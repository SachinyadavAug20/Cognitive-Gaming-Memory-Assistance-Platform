"use client";

import React from "react";
import {
  Hand,
  Volume2,
  Keyboard,
  Eye,
  Sliders,
  X,
  MousePointer,
  Sparkles,
  Camera,
  ShieldAlert,
  Crosshair,
  MousePointerClick,
  Timer,
  Check,
  Zap,
  ShieldCheck,
  Magnet,
  Bell,
  Speech,
  MoveHorizontal,
} from "lucide-react";
import { playPress, playTapFeedback } from "@/lib/sound";

export interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputMode: "physical" | "virtual";
  onInputModeChange: (mode: "physical" | "virtual") => void;
  airMouseActive: boolean;
  onToggleAirMouse: (on: boolean) => void;
  clickMethod?: "dwell" | "pinch" | "key";
  onClickMethodChange?: (method: "dwell" | "pinch" | "key") => void;
  dwellTimeMs: number;
  onDwellTimeChange: (ms: number) => void;
  smoothing: number;
  onSmoothingChange: (val: number) => void;
  motionReach?: number;
  onMotionReachChange?: (val: number) => void;
  cursorSize: "normal" | "large" | "giant";
  onCursorSizeChange: (size: "normal" | "large" | "giant") => void;
  cursorPace?: "calm" | "gentle" | "standard";
  onCursorPaceChange?: (pace: "calm" | "gentle" | "standard") => void;
  cameraViewMode?: "pip" | "minimized" | "hidden";
  onCameraViewModeChange?: (mode: "pip" | "minimized" | "hidden") => void;
  handoffPolicy?: "auto" | "strict";
  onHandoffPolicyChange?: (policy: "auto" | "strict") => void;
  stickyMagnetism?: boolean;
  onStickyMagnetismChange?: (on: boolean) => void;
  audioTicks?: boolean;
  onAudioTicksChange?: (on: boolean) => void;
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
  inputMode,
  onInputModeChange,
  airMouseActive: _airMouseActive,
  onToggleAirMouse,
  clickMethod = "dwell",
  onClickMethodChange,
  dwellTimeMs,
  onDwellTimeChange,
  smoothing,
  onSmoothingChange,
  motionReach = 1.0,
  onMotionReachChange,
  cursorSize,
  onCursorSizeChange,
  cursorPace = "calm",
  onCursorPaceChange,
  cameraViewMode = "pip",
  onCameraViewModeChange,
  handoffPolicy = "auto",
  onHandoffPolicyChange,
  stickyMagnetism = true,
  onStickyMagnetismChange,
  audioTicks = true,
  onAudioTicksChange,
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
                Input Mode Isolation • OpenCV Vision • Voice Narration
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
          {/* ── 1. MUTUAL EXCLUSION INPUT MODE SELECTOR (ONE AT A TIME) ── */}
          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-tea">
                  <Crosshair className="h-4 w-4 shrink-0" />
                  <span>Primary Input Mode (One at a Time)</span>
                </span>
                <span className="text-[10px] font-black rounded bg-amber-100 px-2 py-0.5 text-amber-900 border border-amber-300">
                  Zero Dual-Cursor Conflict
                </span>
              </div>
              <p className="text-xs font-bold text-ink-secondary mt-0.5">
                Choose either standard physical mouse or OpenCV in-air hand tracking. Both will never conflict simultaneously.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Mode A: Physical Mouse */}
              <button
                type="button"
                onClick={() => {
                  playPress();
                  onInputModeChange("physical");
                  onToggleAirMouse(false);
                }}
                className={`flex flex-col items-start p-3 rounded-2xl border-3 border-black text-left transition-all cursor-pointer ${
                  inputMode === "physical"
                    ? "bg-tea text-white shadow-[3px_3px_0px_#000] scale-[1.01]"
                    : "bg-white text-ink hover:bg-surface-muted opacity-80"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <MousePointer className="h-4 w-4 stroke-[2.5]" />
                  <span className="text-sm font-black">1. Physical Mouse</span>
                </div>
                <p className={`text-[11px] font-semibold leading-tight ${inputMode === "physical" ? "text-white/90" : "text-ink-secondary"}`}>
                  Standard OS mouse, trackpad, or touchscreen. Zero camera overhead.
                </p>
                {inputMode === "physical" && (
                  <span className="mt-2 text-[10px] font-black rounded bg-white text-tea px-2 py-0.5 inline-flex items-center gap-1">
                    <span>Active Driver</span>
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </button>

              {/* Mode B: Virtual Air Mouse */}
              <button
                type="button"
                onClick={() => {
                  playPress();
                  onInputModeChange("virtual");
                  onToggleAirMouse(true);
                }}
                className={`flex flex-col items-start p-3 rounded-2xl border-3 border-black text-left transition-all cursor-pointer ${
                  inputMode === "virtual"
                    ? "bg-amber-300 text-black shadow-[3px_3px_0px_#000] scale-[1.01] ring-2 ring-amber-400"
                    : "bg-white text-ink hover:bg-surface-muted opacity-80"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Hand className="h-4 w-4 stroke-[2.5]" />
                  <span className="text-sm font-black">2. Virtual Air Mouse</span>
                </div>
                <p className={`text-[11px] font-semibold leading-tight ${inputMode === "virtual" ? "text-black/90" : "text-ink-secondary"}`}>
                  OpenCV hand tracking. Physical pointer is hidden; single in-air pointer.
                </p>
                {inputMode === "virtual" && (
                  <span className="mt-2 text-[10px] font-black rounded bg-black text-amber-300 px-2 py-0.5 inline-flex items-center gap-1">
                    <span>Active Driver</span>
                    <Check className="h-3 w-3" />
                    <span>(Esc to exit)</span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── 2. VIRTUAL AIR MOUSE OPTIONS SUITE ── */}
          {inputMode === "virtual" && (
            <div className="rounded-2xl border-3 border-black bg-amber-50/70 p-4 shadow-[3px_3px_0px_#000] space-y-4 animate-fade-in">
              <div className="flex items-center justify-between border-b-2 border-black/15 pb-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-tea" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-ink">
                    Virtual Air Mouse Configuration Options
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-ink-secondary">
                  Key: M or Esc
                </span>
              </div>

              {/* Option A: Click Action Method */}
              <div>
                <span className="flex items-center gap-1.5 text-xs font-black mb-1.5">
                  <MousePointerClick className="h-4 w-4 text-tea" />
                  <span>Click Trigger Method:</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "dwell", label: "Dwell Click", desc: "Hold steady to click", icon: Timer },
                    { id: "pinch", label: "Pinch Click", desc: "Thumb & finger pinch", icon: Hand },
                    { id: "key", label: "Tap Key", desc: "Space / Enter to click", icon: Keyboard },
                  ].map((item) => {
                    const IconComp = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          playTapFeedback();
                          onClickMethodChange?.(item.id as "dwell" | "pinch" | "key");
                        }}
                        className={`flex flex-col items-start p-2 rounded-xl border-2 border-black text-left transition-colors cursor-pointer ${
                          clickMethod === item.id
                            ? "bg-tea text-white shadow-[2px_2px_0px_#000]"
                            : "bg-white text-ink hover:bg-amber-100"
                        }`}
                      >
                        <div className="flex items-center gap-1 mb-0.5">
                          <IconComp className="h-3.5 w-3.5 shrink-0" />
                          <span className="text-xs font-black">{item.label}</span>
                        </div>
                        <span className={`text-[9px] font-semibold ${clickMethod === item.id ? "text-white/80" : "text-ink-secondary"}`}>
                          {item.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Option B: Dwell Time Slider (if dwell mode) */}
              {clickMethod === "dwell" && (
                <div className="rounded-xl border-2 border-black/20 bg-white p-2.5">
                  <div className="flex items-center justify-between text-xs font-bold mb-1">
                    <span>⏱️ Dwell Click Speed:</span>
                    <span className="font-black text-tea">{(dwellTimeMs / 1000).toFixed(1)} seconds</span>
                  </div>
                  <input
                    type="range"
                    min="600"
                    max="2200"
                    step="100"
                    value={dwellTimeMs}
                    onChange={(e) => onDwellTimeChange(Number(e.target.value))}
                    className="w-full accent-tea cursor-pointer"
                    aria-label="Dwell Click Time"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-ink-secondary">
                    <span>Fast (0.6s)</span>
                    <span>Standard (1.0s)</span>
                    <span>Relaxed Elder (2.2s)</span>
                  </div>
                </div>
              )}

              {/* Option C: Tremor Damping / Parkinson's Filter */}
              <div className="rounded-xl border-2 border-black/20 bg-white p-2.5">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-tea" />
                    <span>Anti-Tremor Damping (Parkinson&apos;s Filter):</span>
                  </span>
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
                  <span>Moderate (Standard)</span>
                  <span>Heavy (Max anti-shake)</span>
                </div>
              </div>

              {/* Option D: Motion Reach Sensitivity */}
              <div className="rounded-xl border-2 border-black/20 bg-white p-2.5">
                <span className="flex items-center gap-1.5 text-xs font-bold mb-1.5">
                  <MoveHorizontal className="h-3.5 w-3.5 text-tea" />
                  <span>Motion Reach (Range of Arm Movement):</span>
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playTapFeedback();
                      onMotionReachChange?.(1.0);
                    }}
                    className={`flex-1 rounded-xl border-2 border-black py-1.5 text-xs font-black transition-colors cursor-pointer ${
                      motionReach === 1.0
                        ? "bg-tea text-white shadow-[2px_2px_0px_#000]"
                        : "bg-white text-ink hover:bg-amber-100"
                    }`}
                  >
                    Standard (1.0x)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playTapFeedback();
                      onMotionReachChange?.(1.5);
                    }}
                    className={`flex-1 rounded-xl border-2 border-black py-1.5 text-xs font-black transition-colors cursor-pointer ${
                      motionReach === 1.5
                        ? "bg-tea text-white shadow-[2px_2px_0px_#000]"
                        : "bg-white text-ink hover:bg-amber-100"
                    }`}
                  >
                    Wide Reach (1.5x) - Small moves cover screen
                  </button>
                </div>
              </div>

              {/* Option: Movement Pace (Speed Limiter & Smoothing) */}
              <div className="rounded-xl border-2 border-black/20 bg-white p-2.5">
                <span className="flex items-center gap-1.5 text-xs font-bold mb-1.5">
                  <Sliders className="h-3.5 w-3.5 text-tea" />
                  <span>Cursor Movement Pace (Speed &amp; Smoothness):</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "calm", label: "Calm & Slow", sub: "Elder Friendly (Max Steady)", icon: ShieldCheck },
                    { id: "gentle", label: "Gentle", sub: "Standard Fluid Glide", icon: Sliders },
                    { id: "standard", label: "Responsive", sub: "Fast Response", icon: Zap },
                  ].map((pace) => {
                    const IconComp = pace.icon;
                    return (
                      <button
                        key={pace.id}
                        type="button"
                        onClick={() => {
                          playTapFeedback();
                          onCursorPaceChange?.(pace.id as "calm" | "gentle" | "standard");
                        }}
                        className={`flex flex-col items-center justify-center rounded-xl border-2 border-black py-2 px-1 text-center transition-colors cursor-pointer ${
                          cursorPace === pace.id
                            ? "bg-tea text-white shadow-[2px_2px_0px_#000]"
                            : "bg-white text-ink hover:bg-amber-100"
                        }`}
                      >
                        <IconComp className="h-4 w-4" />
                        <span className="text-xs font-black leading-tight mt-0.5">{pace.label}</span>
                        <span className="text-[9px] opacity-80">{pace.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Option E: Camera View Display Mode */}
              <div className="rounded-xl border-2 border-black/20 bg-white p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold">
                  <Camera className="h-3.5 w-3.5 text-tea" />
                  <span>Webcam Preview HUD:</span>
                </div>
                <div className="flex gap-2">
                  {[
                    { id: "pip", label: "Full Camera PIP" },
                    { id: "minimized", label: "Compact Badge" },
                    { id: "hidden", label: "Hidden (Discreet)" },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        playTapFeedback();
                        onCameraViewModeChange?.(mode.id as "pip" | "minimized" | "hidden");
                      }}
                      className={`flex-1 rounded-xl border-2 border-black py-1.5 text-[11px] font-black transition-colors cursor-pointer ${
                        cameraViewMode === mode.id
                          ? "bg-amber-300 text-black shadow-[2px_2px_0px_#000]"
                          : "bg-surface text-ink hover:bg-surface-muted"
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
                {cameraViewMode === "hidden" && (
                  <p className="mt-1 text-[10px] font-bold text-amber-900">
                    Discreet mode: Zero camera video is shown on screen; only the hand pointer moves. Ideal for patients with anxiety.
                  </p>
                )}
              </div>

              {/* Option F: Physical Mouse Conflict & Handoff Policy */}
              <div className="rounded-xl border-2 border-black/20 bg-white p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold">
                  <ShieldAlert className="h-3.5 w-3.5 text-tea" />
                  <span>Physical Mouse Handoff Policy:</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      playTapFeedback();
                      onHandoffPolicyChange?.("auto");
                    }}
                    className={`flex-1 rounded-xl border-2 border-black py-1.5 text-[11px] font-black transition-colors cursor-pointer ${
                      handoffPolicy === "auto"
                        ? "bg-tea text-white shadow-[2px_2px_0px_#000]"
                        : "bg-surface text-ink hover:bg-surface-muted"
                    }`}
                  >
                    Auto-Switch (Moving mouse returns to mouse)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playTapFeedback();
                      onHandoffPolicyChange?.("strict");
                    }}
                    className={`flex-1 rounded-xl border-2 border-black py-1.5 text-[11px] font-black transition-colors cursor-pointer ${
                      handoffPolicy === "strict"
                        ? "bg-tea text-white shadow-[2px_2px_0px_#000]"
                        : "bg-surface text-ink hover:bg-surface-muted"
                    }`}
                  >
                    Strict Lockout (Exit via Esc or M only)
                  </button>
                </div>
              </div>

              {/* Option G: Sticky Target Magnetism (Tremor Lock) */}
              <div className="rounded-xl border-2 border-black/20 bg-white p-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Magnet className="h-4 w-4 text-tea shrink-0" />
                    <span>Sticky Target Magnetism (Tremor Lock)</span>
                    <span className="text-[9px] font-black uppercase rounded bg-tea-light px-1 text-tea border border-tea/30">
                      WCAG AAA
                    </span>
                  </div>
                  <p className="text-[10px] text-ink-secondary mt-0.5">
                    Gently pulls pointer towards buttons to keep dwell steady against hand tremors
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playPress();
                    onStickyMagnetismChange?.(!stickyMagnetism);
                  }}
                  className={`rounded-xl border-2 border-black px-3 py-1 text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer transition-colors ${
                    stickyMagnetism ? "bg-emerald-400 text-black" : "bg-surface text-ink hover:bg-surface-muted"
                  }`}
                >
                  {stickyMagnetism ? (
                    <span className="inline-flex items-center gap-1">
                      <span>Enabled</span>
                      <Check className="h-3 w-3" />
                    </span>
                  ) : (
                    "Turn On"
                  )}
                </button>
              </div>

              {/* Option H: Auditory Dwell Progress Ticks */}
              <div className="rounded-xl border-2 border-black/20 bg-white p-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Bell className="h-4 w-4 text-tea shrink-0" />
                    <span>Auditory Dwell Ticks</span>
                  </div>
                  <p className="text-[10px] text-ink-secondary mt-0.5">
                    Subtle rising audio ticks at 25%, 50%, 75% as the dwell ring fills
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playPress();
                    onAudioTicksChange?.(!audioTicks);
                  }}
                  className={`rounded-xl border-2 border-black px-3 py-1 text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer transition-colors ${
                    audioTicks ? "bg-emerald-400 text-black" : "bg-surface text-ink hover:bg-surface-muted"
                  }`}
                >
                  {audioTicks ? (
                    <span className="inline-flex items-center gap-1">
                      <span>Enabled</span>
                      <Check className="h-3 w-3" />
                    </span>
                  ) : (
                    "Turn On"
                  )}
                </button>
              </div>

              {/* Option I: Pointer Size Selector */}
              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold mb-1.5">
                  <Crosshair className="h-3.5 w-3.5 text-tea" />
                  <span>Pointer Size:</span>
                </span>
                <div className="flex gap-2">
                  {(["normal", "large", "giant"] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        playTapFeedback();
                        onCursorSizeChange(size);
                      }}
                      className={`flex-1 rounded-xl border-2 border-black py-1.5 text-xs font-black capitalize transition-colors cursor-pointer ${
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

          {/* ── 3. "LISTEN-FIRST" SPOKEN SCREEN READER ── */}
          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-amber-300 text-ink">
                <Volume2 className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black flex items-center gap-1.5">
                  <Speech className="h-4 w-4 text-tea" />
                  <span>Listen-First Audio Narration</span>
                </h3>
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
              {listenFirstEnabled ? (
                <span className="inline-flex items-center gap-1">
                  <span>Enabled</span>
                  <Check className="h-3 w-3" />
                </span>
              ) : (
                "Turn On"
              )}
            </button>
          </div>

          {/* ── 4. KEYBOARD & SWITCH NAVIGATION ── */}
          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-amber-300 text-ink">
                <Keyboard className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black flex items-center gap-1.5">
                  <Keyboard className="h-4 w-4 text-tea" />
                  <span>Keyboard Switch Shortcuts</span>
                </h3>
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
                <kbd className="rounded bg-black px-2 py-0.5 text-white font-mono font-black">Esc</kbd>
                <span>Exit Air Mouse</span>
              </div>
            </div>
          </div>

          {/* ── 5. VISION & CONTRAST MODES ── */}
          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-amber-300 text-ink">
                <Eye className="h-5 w-5 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-sm font-black flex items-center gap-1.5">
                  <Eye className="h-4 w-4 text-tea" />
                  <span>Visual Ergonomics</span>
                </h3>
                <p className="text-xs font-bold text-ink-secondary">
                  High contrast WCAG 7:1 ratio and text magnification
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-black">High Contrast Mode</span>
              <button
                type="button"
                onClick={() => {
                  playPress();
                  onToggleHighContrast();
                }}
                className={`btn-tactile rounded-xl border-2 border-black px-4 py-1.5 text-xs font-black shadow-[2px_2px_0px_#000] cursor-pointer transition-colors ${
                  highContrast ? "bg-amber-400 text-black" : "bg-white text-ink hover:bg-amber-100"
                }`}
              >
                {highContrast ? (
                  <span className="inline-flex items-center gap-1">
                    <span>Enabled</span>
                    <Check className="h-3 w-3" />
                  </span>
                ) : (
                  "Turn On"
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-black">Font Size Magnifier</span>
              <div className="flex items-center gap-1 rounded-xl border-2 border-black bg-surface p-1">
                {(["sm", "md", "lg"] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => {
                      playTapFeedback();
                      onFontSizeChange(lvl);
                    }}
                    className={`px-3 py-1 text-xs font-black rounded-lg cursor-pointer ${
                      fontSizeLevel === lvl
                        ? "bg-tea text-white shadow-[1px_1px_0px_#000]"
                        : "hover:bg-surface-muted text-ink"
                    }`}
                  >
                    {lvl === "sm" ? "A-" : lvl === "md" ? "A" : "A+"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-6 flex justify-end border-t-2 border-black/15 pt-4">
          <button
            type="button"
            onClick={() => {
              playPress();
              onClose();
            }}
            className="btn-tactile rounded-2xl border-3 border-black bg-tea px-6 py-2.5 text-sm font-black text-white shadow-[3px_3px_0px_#000] hover:bg-emerald-800 cursor-pointer"
          >
            Save & Return to Care
          </button>
        </div>
      </div>
    </div>
  );
}
