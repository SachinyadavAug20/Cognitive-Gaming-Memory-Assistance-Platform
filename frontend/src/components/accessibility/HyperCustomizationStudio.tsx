"use client";

import { useState } from "react";
import {
  Sliders,
  Sparkles,
  Type,
  Layout,
  Eye,
  Volume2,
  RotateCcw,
  Check,
  Terminal,
  Sun,
  Palette,
  Shield,
  Layers,
} from "lucide-react";
import {
  useHyperCustomizationStore,
  type ThemePreset,
  type FontFamilyChoice,
  type TextScaleChoice,
  type CornerRadiusChoice,
  type BorderWidthChoice,
  type LayoutDensityChoice,
} from "@/store/useHyperCustomizationStore";
import { playTapFeedback, playPress, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { useLocale } from "next-intl";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: { id: ThemePreset; name: string; desc: string; colors: string[] }[] = [
  {
    id: "muga_silk",
    name: "Golden Silk & Tea",
    desc: "Heritage Assamese warm gold and lush tea garden green",
    colors: ["#1B663E", "#E66A00", "#FAF7F2", "#16120E"],
  },
  {
    id: "arch_monochrome",
    name: "Arch Monochrome",
    desc: "Sharp terminal high-contrast black & crisp white borders",
    colors: ["#000000", "#FFFFFF", "#1E1E1E", "#38BDF8"],
  },
  {
    id: "terracotta_clay",
    name: "Terracotta Earth",
    desc: "Warm earthen clay, sunset marigold, and raw river silt",
    colors: ["#C2410C", "#D97706", "#FFFBEB", "#431407"],
  },
  {
    id: "nordic_clean",
    name: "Nordic Clean Slate",
    desc: "Cool slate, muted teal, and gentle daylight paper",
    colors: ["#0F766E", "#0284C7", "#F8FAFC", "#0F172A"],
  },
  {
    id: "high_contrast_yellow",
    name: "High-Contrast Solar",
    desc: "Acre-bright yellow on pitch obsidian for low-vision clarity",
    colors: ["#FACC15", "#000000", "#18181B", "#FEF08A"],
  },
  {
    id: "cyber_dark",
    name: "OLED Cyber Dark",
    desc: "Deep night battery-saver with soft mint luminescent accents",
    colors: ["#10B981", "#059669", "#09090B", "#F4F4F5"],
  },
];

const FONT_OPTIONS: { id: FontFamilyChoice; name: string; preview: string }[] = [
  { id: "sans", name: "Modern Clear Sans", preview: "Abc 123 - Easy Everyday Reading" },
  { id: "serif", name: "Heritage Classic Serif", preview: "Abc 123 - Newspaper & Story Feel" },
  { id: "dyslexic", name: "High-Legibility Reader", preview: "Abc 123 - Heavy Bottom Letters" },
  { id: "mono", name: "Arch Terminal Mono", preview: "Abc 123 - Fixed-Width Console Font" },
];

const SCALE_OPTIONS: { id: TextScaleChoice; label: string; px: string }[] = [
  { id: "small", label: "Compact", px: "14px" },
  { id: "normal", label: "Standard", px: "16px" },
  { id: "large", label: "Comfort", px: "18px" },
  { id: "extra_large", label: "Large", px: "22px" },
  { id: "elder_giant", label: "Elder Giant", px: "28px" },
];

const RADIUS_OPTIONS: { id: CornerRadiusChoice; label: string; previewClass: string }[] = [
  { id: "sharp", label: "Arch Sharp (0px)", previewClass: "rounded-none" },
  { id: "standard", label: "Subtle (8px)", previewClass: "rounded-lg" },
  { id: "soft", label: "Comfort (16px)", previewClass: "rounded-2xl" },
  { id: "pill", label: "Pill Soft (28px)", previewClass: "rounded-full" },
];

const BORDER_OPTIONS: { id: BorderWidthChoice; label: string }[] = [
  { id: "thin", label: "1px Subtle" },
  { id: "tactile", label: "2px Tactile" },
  { id: "heavy", label: "3px High-Contrast" },
  { id: "bold", label: "4px Ultra-Bold" },
];

export function HyperCustomizationStudio({ isOpen, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<"presets" | "theme" | "typography" | "layout" | "widgets" | "sensory">("presets");
  const locale = useLocale();

  const {
    theme,
    fontFamily,
    textScale,
    cornerRadius,
    borderWidth,
    layoutDensity,
    highContrast,
    reducedMotion,
    soundscape,
    speechRate,
    widgets,
    setTheme,
    setFontFamily,
    setTextScale,
    setCornerRadius,
    setBorderWidth,
    setLayoutDensity,
    setHighContrast,
    setReducedMotion,
    setSoundscape,
    setSpeechRate,
    toggleWidget,
    resetToDefaults,
    applyArchPreset,
    applyElderFriendlyPreset,
  } = useHyperCustomizationStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-surface rounded-3xl border-4 border-black shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden">
        {/* Studio Header */}
        <div className="bg-tea text-white px-6 py-4 border-b-4 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-black/20 rounded-xl border border-white/20">
              <Sliders className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-black flex items-center gap-2">
                Hyper-Customization Studio
                <span className="text-xs font-mono font-normal uppercase tracking-wider bg-black/30 px-2 py-0.5 rounded border border-white/30 text-amber-200">
                  Arch-Style
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-white/80">
                Tailor UI themes, typography, layout density, and component visibility for this patient
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              playPress();
              onClose();
            }}
            className="w-10 h-10 rounded-xl bg-white text-black font-black text-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-amber-100 flex items-center justify-center cursor-pointer active:scale-95"
            aria-label="Close studio"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-black/20 bg-muted/30 overflow-x-auto shrink-0 p-2 gap-2">
          {[
            { id: "presets", label: "Quick Presets", icon: Sparkles },
            { id: "theme", label: "Theme & Palette", icon: Palette },
            { id: "typography", label: "Typography", icon: Type },
            { id: "layout", label: "Layout & Borders", icon: Layout },
            { id: "widgets", label: "Widget Controls", icon: Layers },
            { id: "sensory", label: "Sensory & Speech", icon: Volume2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playTapFeedback();
                  setActiveTab(tab.id as typeof activeTab);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-black text-white shadow-[2px_2px_0px_#000]"
                    : "bg-surface border-2 border-black/20 text-ink hover:bg-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: QUICK PRESETS */}
          {activeTab === "presets" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-ink">Choose a Ready-Made Profile</h3>
                <p className="text-sm text-ink-secondary">
                  One-tap presets configured for specific senior needs or power users.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Arch Linux Power User */}
                <div className="border-3 border-black bg-surface rounded-2xl p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Terminal className="h-5 w-5 text-sky-600" />
                      <h4 className="font-mono font-black text-base text-ink">Arch Linux Power-User</h4>
                    </div>
                    <p className="text-xs text-ink-secondary">
                      Zero rounded corners, monospace terminal typography, heavy crisp borders, maximum contrast, high information density.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      playPress();
                      applyArchPreset();
                    }}
                    className="mt-4 w-full py-2.5 px-4 bg-black text-white font-mono font-bold text-xs uppercase tracking-wider rounded border-2 border-black hover:bg-neutral-800 active:scale-95 shadow-[2px_2px_0px_#000]"
                  >
                    Apply Arch Preset
                  </button>
                </div>

                {/* Elder Zen Zero-Friction */}
                <div className="border-3 border-black bg-surface rounded-2xl p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Sun className="h-5 w-5 text-amber-500" />
                      <h4 className="font-serif font-black text-base text-ink">Elder Zen Flow</h4>
                    </div>
                    <p className="text-xs text-ink-secondary">
                      Giant 28px text, pill-soft friendly cards, calm slow speech (0.75x), single-stream focus without confusing secondary widgets.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      playPress();
                      applyElderFriendlyPreset();
                    }}
                    className="mt-4 w-full py-2.5 px-4 bg-tea text-white font-bold text-xs uppercase tracking-wider rounded-full border-2 border-black hover:bg-emerald-800 active:scale-95 shadow-[2px_2px_0px_#000]"
                  >
                    Apply Elder Zen Preset
                  </button>
                </div>
              </div>

              {/* Reset to Factory Defaults */}
              <div className="pt-4 border-t border-black/10 flex justify-end">
                <button
                  onClick={() => {
                    playTapFeedback();
                    resetToDefaults();
                  }}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-black/30 rounded-xl text-xs font-bold text-ink-secondary hover:bg-white hover:text-black cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset All to Defaults</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: THEME & PALETTE */}
          {activeTab === "theme" && (
            <div className="space-y-4">
              <h3 className="text-lg font-black text-ink">Colorway & Aesthetic Theme</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {THEME_OPTIONS.map((item) => {
                  const isSelected = theme === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        playTapFeedback();
                        setTheme(item.id);
                      }}
                      className={`text-left p-4 rounded-2xl border-3 transition-all cursor-pointer ${
                        isSelected
                          ? "border-tea bg-tea/15 shadow-[4px_4px_0px_#000] ring-2 ring-tea"
                          : "border-border/30 bg-surface hover:border-border/60 hover:bg-surface-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-ink">{item.name}</span>
                        {isSelected && <Check className="h-5 w-5 text-tea stroke-[3]" />}
                      </div>
                      <p className="text-xs text-ink-secondary mt-1">{item.desc}</p>
                      <div className="flex gap-1.5 mt-3">
                        {item.colors.map((c, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full border border-black/30 shadow-sm"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: TYPOGRAPHY */}
          {activeTab === "typography" && (
            <div className="space-y-6">
              {/* Font Family */}
              <div>
                <h3 className="text-base font-black text-ink mb-2">Font Family</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {FONT_OPTIONS.map((f) => {
                    const isSelected = fontFamily === f.id;
                    return (
                      <button
                        key={f.id}
                        onClick={() => {
                          playTapFeedback();
                          setFontFamily(f.id);
                        }}
                        className={`text-left p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "border-tea bg-tea/15 shadow-[3px_3px_0px_#000] ring-2 ring-tea"
                            : "border-border/30 bg-surface hover:bg-surface-muted"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-ink">{f.name}</span>
                          {isSelected && <Check className="h-4 w-4 text-tea stroke-[3]" />}
                        </div>
                        <p className="text-xs text-ink-secondary mt-1 italic">{f.preview}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Text Scale */}
              <div>
                <h3 className="text-base font-black text-ink mb-2">Text Scale Multiplier</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {SCALE_OPTIONS.map((s) => {
                    const isSelected = textScale === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          playTapFeedback();
                          setTextScale(s.id);
                        }}
                        className={`py-2 px-3 rounded-xl border-2 font-bold text-center transition-all cursor-pointer ${
                          isSelected
                            ? "border-tea bg-tea text-white shadow-[2px_2px_0px_#000]"
                            : "border-border/30 bg-surface text-ink hover:bg-surface-muted"
                        }`}
                      >
                        <div className="text-xs">{s.label}</div>
                        <div className="text-[10px] opacity-80">{s.px}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LAYOUT & BORDERS */}
          {activeTab === "layout" && (
            <div className="space-y-6">
              {/* Corner Radius */}
              <div>
                <h3 className="text-base font-black text-ink mb-2">Corner Radius ("Arch vs Round")</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {RADIUS_OPTIONS.map((r) => {
                    const isSelected = cornerRadius === r.id;
                    return (
                      <button
                        key={r.id}
                        onClick={() => {
                          playTapFeedback();
                          setCornerRadius(r.id);
                        }}
                        className={`p-3 border-2 transition-all text-center cursor-pointer ${r.previewClass} ${
                          isSelected
                            ? "border-tea bg-tea/15 shadow-[3px_3px_0px_#000] font-black ring-2 ring-tea"
                            : "border-border/30 bg-surface hover:bg-surface-muted"
                        }`}
                      >
                        <div className="text-xs font-bold text-ink">{r.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Border Width */}
              <div>
                <h3 className="text-base font-black text-ink mb-2">Border Tactility</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {BORDER_OPTIONS.map((b) => {
                    const isSelected = borderWidth === b.id;
                    return (
                      <button
                        key={b.id}
                        onClick={() => {
                          playTapFeedback();
                          setBorderWidth(b.id);
                        }}
                        className={`p-2.5 rounded-xl border-2 transition-all text-center cursor-pointer ${
                          isSelected
                            ? "border-tea bg-tea text-white shadow-[2px_2px_0px_#000] font-black"
                            : "border-border/30 bg-surface text-ink hover:bg-surface-muted"
                        }`}
                      >
                        <div className="text-xs font-bold">{b.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Layout Density */}
              <div>
                <h3 className="text-base font-black text-ink mb-2">Layout Flow</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "standard", label: "Standard Dashboard Grid", desc: "Structured cards side-by-side" },
                    { id: "single_stream", label: "Single-Stream Zero Distraction", desc: "One giant vertical flow designed for severe cognitive impairment" },
                  ].map((d) => {
                    const isSelected = layoutDensity === d.id;
                    return (
                      <button
                        key={d.id}
                        onClick={() => {
                          playTapFeedback();
                          setLayoutDensity(d.id as LayoutDensityChoice);
                        }}
                        className={`p-3.5 rounded-xl border-2 text-left cursor-pointer transition-all ${
                          isSelected
                            ? "border-tea bg-tea/15 shadow-[3px_3px_0px_#000] ring-2 ring-tea"
                            : "border-border/30 bg-surface hover:bg-surface-muted"
                        }`}
                      >
                        <div className="text-sm font-bold text-ink">{d.label}</div>
                        <div className="text-xs text-ink-secondary mt-1">{d.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: WIDGET CONTROLS */}
          {activeTab === "widgets" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-black text-ink">Component Visibility Toggles</h3>
                <p className="text-xs text-ink-secondary">
                  Toggle individual widgets on or off to create the exact distraction-free experience for this patient.
                </p>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2">
                {[
                  { key: "showAutonomousGuide", title: "Saathi Auto-Guide Banner", desc: "One-click 'What to do today' journey" },
                  { key: "showDualRecall", title: "Dual Memory Recall Probes", desc: "Instant breakfast recall & ancestral memories" },
                  { key: "showDietTracker", title: "Meal Snap & Nutrition Score", desc: "Food photo check & gentle memory advice" },
                  { key: "showBiomarkerChart", title: "Biomarker Radar Chart", desc: "Scientific MoCA & cognitive domains" },
                  { key: "showCommunityWall", title: "Gentle Community Circles", desc: "Mid-user non-competitive peer encouragement" },
                  { key: "showSocialAppreciation", title: "Social Appreciation Wall", desc: "Family love notes & streak praise" },
                  { key: "showSensoryMusic", title: "Sensory Audio & 40Hz Tone", desc: "Calming flute and neuro-stimulation" },
                  { key: "showRoutineSchedule", title: "Daily Routine & Medicine", desc: "Care schedule and medication alarms" },
                  { key: "showQuickGamesGrid", title: "Therapy Games Suite", desc: "Card Mastery, Lotus, 3D Walk, etc." },
                ].map((w) => {
                  const isVisible = widgets[w.key as keyof typeof widgets];
                  return (
                    <button
                      key={w.key}
                      onClick={() => {
                        playTapFeedback();
                        toggleWidget(w.key as keyof typeof widgets);
                      }}
                      className={`p-3 rounded-xl border-2 flex items-center justify-between text-left cursor-pointer transition-all ${
                        isVisible
                          ? "border-tea bg-tea/15 shadow-[2px_2px_0px_#000] ring-1 ring-tea"
                          : "border-border/15 bg-surface/50 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <div className="pr-3">
                        <div className="text-xs font-bold text-ink">{w.title}</div>
                        <div className="text-[11px] text-ink-secondary">{w.desc}</div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-md border-2 border-border flex items-center justify-center font-bold text-xs ${
                          isVisible ? "bg-tea text-white" : "bg-surface text-transparent"
                        }`}
                      >
                        ✓
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: SENSORY & SPEECH */}
          {activeTab === "sensory" && (
            <div className="space-y-6">
              {/* Speech Speed */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-black text-ink">Voice Guidance Speed</h3>
                  <span className="text-xs font-mono font-bold bg-black text-white px-2 py-0.5 rounded">
                    {speechRate}x
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0.65, 0.8, 1.0, 1.15].map((rate) => {
                    const isSelected = Math.abs(speechRate - rate) < 0.05;
                    return (
                      <button
                        key={rate}
                        onClick={() => {
                          playTapFeedback();
                          setSpeechRate(rate);
                        }}
                        className={`py-2 px-3 rounded-xl border-2 text-center font-bold text-xs cursor-pointer ${
                          isSelected
                            ? "border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
                            : "border-black/20 bg-surface hover:bg-white text-ink"
                        }`}
                      >
                        {rate}x {rate < 0.85 ? "(Elder Slow)" : rate === 1.0 ? "(Normal)" : "(Fast)"}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => {
                    unlockAudio();
                    speak("Namaste! This is your personalized CogniCare voice rate.", locale, speechRate);
                  }}
                  className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-black bg-white text-xs font-bold shadow-[2px_2px_0px_#000] hover:bg-amber-100 cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5 text-tea" />
                  <span>Test Voice Speed</span>
                </button>
              </div>

              {/* Ambient Soundscape */}
              <div>
                <h3 className="text-base font-black text-ink mb-2">Ambient Background Soundscape</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "none", label: "Silence (No Ambient)" },
                    { id: "brahmaputra_waves", label: "Brahmaputra Gentle River" },
                    { id: "morning_birds", label: "Morning Garden Birds" },
                    { id: "flute_drone", label: "Calm Bamboo Flute" },
                  ].map((s) => {
                    const isSelected = soundscape === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => {
                          playTapFeedback();
                          setSoundscape(s.id as typeof soundscape);
                        }}
                        className={`p-2.5 rounded-xl border-2 text-left text-xs font-bold cursor-pointer ${
                          isSelected
                            ? "border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
                            : "border-black/20 bg-surface text-ink hover:bg-white"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-muted/40 border-t-2 border-black/20 flex items-center justify-between shrink-0">
          <span className="text-xs text-ink-secondary">
            Settings saved automatically to this profile.
          </span>
          <button
            onClick={() => {
              playPress();
              onClose();
            }}
            className="py-2.5 px-6 rounded-xl bg-black text-white font-bold text-sm border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-neutral-800 active:scale-95 cursor-pointer"
          >
            Done & Apply
          </button>
        </div>
      </div>
    </div>
  );
}
