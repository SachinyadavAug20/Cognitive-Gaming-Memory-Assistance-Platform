"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ThemePreset =
  | "arch_monochrome" // Sharp B&W terminal style, maximum clarity
  | "muga_silk" // Warm Assam golden muga silk & forest green (default)
  | "terracotta_clay" // Rich earthen terracotta & warm sand
  | "nordic_clean" // Crisp cool slate & gentle sky blue
  | "high_contrast_yellow" // High accessibility: golden yellow on pitch black
  | "cyber_dark"; // Deep OLED charcoal with mint accents

export type FontFamilyChoice = "sans" | "serif" | "dyslexic" | "mono";
export type TextScaleChoice = "small" | "normal" | "large" | "extra_large" | "elder_giant";
export type CornerRadiusChoice = "sharp" | "standard" | "soft" | "pill";
export type BorderWidthChoice = "thin" | "tactile" | "heavy" | "bold";
export type LayoutDensityChoice = "spacious" | "standard" | "compact" | "single_stream";
export type SoundscapeChoice = "none" | "brahmaputra_waves" | "morning_birds" | "flute_drone";

export interface WidgetVisibilitySettings {
  showAutonomousGuide: boolean;
  showDualRecall: boolean;
  showDietTracker: boolean;
  showBiomarkerChart: boolean;
  showCommunityWall: boolean;
  showSocialAppreciation: boolean;
  showSensoryMusic: boolean;
  showRoutineSchedule: boolean;
  showQuickGamesGrid: boolean;
  showClockPill: boolean;
  showVoiceCompanion: boolean;
}

export interface HyperCustomizationState {
  theme: ThemePreset;
  fontFamily: FontFamilyChoice;
  textScale: TextScaleChoice;
  cornerRadius: CornerRadiusChoice;
  borderWidth: BorderWidthChoice;
  layoutDensity: LayoutDensityChoice;
  highContrast: boolean;
  reducedMotion: boolean;
  soundscape: SoundscapeChoice;
  speechRate: number; // 0.6 .. 1.2
  widgets: WidgetVisibilitySettings;
  isStudioOpen: boolean;

  // Actions
  setTheme: (theme: ThemePreset) => void;
  setFontFamily: (font: FontFamilyChoice) => void;
  setTextScale: (scale: TextScaleChoice) => void;
  setCornerRadius: (radius: CornerRadiusChoice) => void;
  setBorderWidth: (width: BorderWidthChoice) => void;
  setLayoutDensity: (density: LayoutDensityChoice) => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setSoundscape: (soundscape: SoundscapeChoice) => void;
  setSpeechRate: (rate: number) => void;
  toggleWidget: (widgetKey: keyof WidgetVisibilitySettings) => void;
  setStudioOpen: (open: boolean) => void;
  resetToDefaults: () => void;
  applyArchPreset: () => void;
  applyElderFriendlyPreset: () => void;
}

const DEFAULT_WIDGETS: WidgetVisibilitySettings = {
  showAutonomousGuide: true,
  showDualRecall: true,
  showDietTracker: true,
  showBiomarkerChart: true,
  showCommunityWall: true,
  showSocialAppreciation: true,
  showSensoryMusic: true,
  showRoutineSchedule: true,
  showQuickGamesGrid: true,
  showClockPill: true,
  showVoiceCompanion: true,
};

export const useHyperCustomizationStore = create<HyperCustomizationState>()(
  persist(
    (set) => ({
      theme: "muga_silk",
      fontFamily: "sans",
      textScale: "normal",
      cornerRadius: "soft",
      borderWidth: "tactile",
      layoutDensity: "standard",
      highContrast: false,
      reducedMotion: false,
      soundscape: "none",
      speechRate: 0.85,
      widgets: { ...DEFAULT_WIDGETS },
      isStudioOpen: false,

      setTheme: (theme) => set({ theme }),
      setFontFamily: (fontFamily) => set({ fontFamily }),
      setTextScale: (textScale) => set({ textScale }),
      setCornerRadius: (cornerRadius) => set({ cornerRadius }),
      setBorderWidth: (borderWidth) => set({ borderWidth }),
      setLayoutDensity: (layoutDensity) => set({ layoutDensity }),
      setHighContrast: (highContrast) => set({ highContrast }),
      setReducedMotion: (reducedMotion) => set({ reducedMotion }),
      setSoundscape: (soundscape) => set({ soundscape }),
      setSpeechRate: (speechRate) => set({ speechRate }),
      setStudioOpen: (isStudioOpen) => set({ isStudioOpen }),

      toggleWidget: (widgetKey) =>
        set((state) => ({
          widgets: {
            ...state.widgets,
            [widgetKey]: !state.widgets[widgetKey],
          },
        })),

      resetToDefaults: () =>
        set({
          theme: "muga_silk",
          fontFamily: "sans",
          textScale: "normal",
          cornerRadius: "soft",
          borderWidth: "tactile",
          layoutDensity: "standard",
          highContrast: false,
          reducedMotion: false,
          soundscape: "none",
          speechRate: 0.85,
          widgets: { ...DEFAULT_WIDGETS },
        }),

      // Arch Linux Power-User Theme: Sharp boxes, monospace font, zero radius, high contrast
      applyArchPreset: () =>
        set({
          theme: "arch_monochrome",
          fontFamily: "mono",
          textScale: "large",
          cornerRadius: "sharp",
          borderWidth: "heavy",
          layoutDensity: "spacious",
          highContrast: true,
          reducedMotion: true,
          speechRate: 0.9,
          widgets: { ...DEFAULT_WIDGETS },
        }),

      // Elder Gentle Zero-Friction: Giant text, soft edges, warm colors, calm speed
      applyElderFriendlyPreset: () =>
        set({
          theme: "muga_silk",
          fontFamily: "serif",
          textScale: "elder_giant",
          cornerRadius: "pill",
          borderWidth: "heavy",
          layoutDensity: "single_stream",
          highContrast: false,
          reducedMotion: true,
          speechRate: 0.75,
          widgets: {
            ...DEFAULT_WIDGETS,
            showBiomarkerChart: false, // Hide technical charts for elderly
            showCommunityWall: false, // Focus on single tasks
          },
        }),
    }),
    {
      name: "cognicare-hyper-customization",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
