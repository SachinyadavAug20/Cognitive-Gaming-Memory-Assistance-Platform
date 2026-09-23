"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Palette,
  Type,
  Sparkles,
  RotateCcw,
  Check,
  X,
  Sun,
  Terminal,
} from "lucide-react";
import {
  useHyperCustomizationStore,
  type ThemePreset,
  type TextScaleChoice,
} from "@/store/useHyperCustomizationStore";
import { playTapFeedback, playPress } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { useLocale } from "next-intl";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const THEME_OPTIONS: { id: ThemePreset; name: string; desc: string; colors: string[] }[] = [
  {
    id: "muga_silk",
    name: "Assam Silk & Tea",
    desc: "Gentle warm gold and lush tea garden green (Default)",
    colors: ["#1B663E", "#E66A00", "#FAF7F2", "#16120E"],
  },
  {
    id: "high_contrast_yellow",
    name: "High-Contrast Solar",
    desc: "Bright yellow on pitch black for low-vision clarity",
    colors: ["#FACC15", "#000000", "#18181B", "#FEF08A"],
  },
  {
    id: "cyber_dark",
    name: "Deep Night OLED",
    desc: "Dark sleep-safe charcoal with soft mint accents",
    colors: ["#10B981", "#059669", "#09090B", "#F4F4F5"],
  },
  {
    id: "arch_monochrome",
    name: "Arch Clean Minimal",
    desc: "Sharp terminal high-contrast black & crisp white borders",
    colors: ["#000000", "#FFFFFF", "#1E1E1E", "#38BDF8"],
  },
];

const SCALE_OPTIONS: { id: TextScaleChoice; label: string; px: string; desc: string }[] = [
  { id: "normal", label: "Standard", px: "16px", desc: "Default size" },
  { id: "large", label: "Comfort", px: "20px", desc: "Easier reading" },
  { id: "elder_giant", label: "Giant", px: "26px", desc: "Senior friendly" },
];

export function HyperCustomizationStudio({ isOpen, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const locale = useLocale();
  const normLoc = locale?.split("-")[0]?.toLowerCase() || "en";

  const {
    theme,
    textScale,
    setTheme,
    setTextScale,
    resetToDefaults,
    applyArchPreset,
    applyElderFriendlyPreset,
  } = useHyperCustomizationStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling while open to keep modal pinned on screen
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSelectTheme = (item: (typeof THEME_OPTIONS)[0]) => {
    playTapFeedback();
    setTheme(item.id);
    const speechText =
      normLoc === "hi"
        ? `${item.name} थीम चुनी गई`
        : normLoc === "as"
        ? `${item.name} থিম বাছনি কৰা হ'ল`
        : `${item.name} theme selected`;
    speak(speechText, normLoc, 0.85);
  };

  const handleSelectScale = (scale: (typeof SCALE_OPTIONS)[0]) => {
    playTapFeedback();
    setTextScale(scale.id);
    const speechText =
      normLoc === "hi"
        ? `लिखावट का आकार ${scale.label} किया गया`
        : normLoc === "as"
        ? `আখৰৰ আকাৰ ${scale.label} কৰা হ'ল`
        : `Text size set to ${scale.label}`;
    speak(speechText, normLoc, 0.85);
  };

  const modalContent = (
    /* NO BLUR: Clean translucent dark backdrop that lets user see live page behind */
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          playPress();
          onClose();
        }
      }}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-150 select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="customization-studio-title"
    >
      <div className="relative w-full max-w-xl max-h-[92vh] my-auto bg-surface rounded-3xl border-4 border-black shadow-[8px_8px_0px_#000] flex flex-col overflow-hidden text-ink animate-in zoom-in-95 duration-150">
        {/* Simple Header */}
        <div className="bg-tea text-white px-5 py-4 border-b-4 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center text-xl shadow-[2px_2px_0px_#000] shrink-0 text-black">
              🎨
            </div>
            <div>
              <h2
                id="customization-studio-title"
                className="text-lg sm:text-xl font-serif font-black flex items-center gap-2 leading-tight"
              >
                {normLoc === "hi"
                  ? "थीम और लिखावट सेटिंग्स"
                  : normLoc === "as"
                  ? "থিম আৰু আখৰ ছেটিংছ"
                  : "Theme & Display Settings"}
              </h2>
              <p className="text-xs text-white/90">
                {normLoc === "hi"
                  ? "अपनी पसंद के अनुसार रंग और लिखावट का आकार चुनें"
                  : normLoc === "as"
                  ? "আপোনাৰ সুবিধা অনুসৰি ৰং আৰু আকাৰ বাছক"
                  : "Choose comfortable colors and text size"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              playPress();
              onClose();
            }}
            className="w-10 h-10 rounded-xl bg-white text-black font-black text-lg border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-amber-100 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            aria-label="Close settings"
            title="Close"
          >
            <X className="h-5 w-5 stroke-[3]" />
          </button>
        </div>

        {/* Scrollable Simple Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* 1. Color Themes */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Palette className="h-4 w-4 text-tea" />
              <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                {normLoc === "hi" ? "रंग थीम (1-टैप)" : normLoc === "as" ? "ৰং থিম" : "Color Theme"}
              </h3>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {THEME_OPTIONS.map((item) => {
                const isSelected = theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelectTheme(item)}
                    className={`text-left p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? "border-tea bg-tea/15 shadow-[3px_3px_0px_#000] ring-2 ring-tea"
                        : "border-border/40 bg-surface hover:border-black/50 hover:bg-surface-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-ink">{item.name}</span>
                      {isSelected && <Check className="h-4 w-4 text-tea stroke-[3]" />}
                    </div>
                    <p className="text-[11px] text-ink-secondary mt-0.5 leading-snug">
                      {item.desc}
                    </p>
                    <div className="flex gap-1.5 mt-2.5">
                      {item.colors.map((c, i) => (
                        <div
                          key={i}
                          className="w-5 h-5 rounded-full border border-black/30 shadow-2xs"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Text Size */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Type className="h-4 w-4 text-tea" />
              <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                {normLoc === "hi" ? "लिखावट का आकार" : normLoc === "as" ? "আখৰৰ আকাৰ" : "Text Size"}
              </h3>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {SCALE_OPTIONS.map((s) => {
                const isSelected = textScale === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectScale(s)}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      isSelected
                        ? "border-tea bg-tea text-white shadow-[3px_3px_0px_#000]"
                        : "border-border/40 bg-surface text-ink hover:border-black/50 hover:bg-surface-muted"
                    }`}
                  >
                    <div className="text-xs font-black">{s.label}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{s.px}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Ready Presets */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles className="h-4 w-4 text-tea" />
              <h3 className="text-sm font-black uppercase tracking-wider text-ink">
                {normLoc === "hi" ? "सरल प्रोफाइल" : normLoc === "as" ? "প্ৰ'ফাইল" : "Quick Profiles"}
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Elder Friendly */}
              <button
                type="button"
                onClick={() => {
                  playPress();
                  applyElderFriendlyPreset();
                  speak(
                    normLoc === "hi"
                      ? "बुजुर्गों के लिए सरल थीम लागू की गई"
                      : "Elder friendly profile applied",
                    normLoc,
                    0.85
                  );
                }}
                className="p-3 rounded-2xl border-2 border-black bg-amber-50 hover:bg-amber-100 text-left cursor-pointer transition-all active:scale-95 shadow-[2px_2px_0px_#000]"
              >
                <div className="flex items-center gap-2 text-amber-900 font-black text-xs">
                  <Sun className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>👵 Elder Zen Flow</span>
                </div>
                <p className="text-[11px] text-amber-800 mt-1">
                  Giant text, soft cards, warm colors.
                </p>
              </button>

              {/* Arch Minimal */}
              <button
                type="button"
                onClick={() => {
                  playPress();
                  applyArchPreset();
                  speak(
                    normLoc === "hi"
                      ? "आर्च टर्मिनल प्रोफाइल लागू किया गया"
                      : "Arch minimal profile applied",
                    normLoc,
                    0.85
                  );
                }}
                className="p-3 rounded-2xl border-2 border-black bg-neutral-900 text-white hover:bg-black text-left cursor-pointer transition-all active:scale-95 shadow-[2px_2px_0px_#000]"
              >
                <div className="flex items-center gap-2 text-sky-300 font-mono font-black text-xs">
                  <Terminal className="h-4 w-4 text-sky-400 shrink-0" />
                  <span>⚡ Arch Minimal</span>
                </div>
                <p className="text-[11px] text-neutral-300 mt-1">
                  Crisp monochrome borders, terminal font.
                </p>
              </button>
            </div>
          </div>
        </div>

        {/* Footer: Reset & Done Buttons */}
        <div className="p-4 bg-muted/20 border-t-2 border-black/15 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              playTapFeedback();
              resetToDefaults();
              speak("Settings reset to default", normLoc, 0.85);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border-2 border-black/30 bg-surface text-xs font-bold text-ink hover:bg-white hover:border-black cursor-pointer active:scale-95 shadow-2xs"
          >
            <RotateCcw className="h-3.5 w-3.5 text-ink-secondary" />
            <span>{normLoc === "hi" ? "रीसेट" : normLoc === "as" ? "পূৰ্বৰ অৱস্থা" : "Reset Default"}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playPress();
              onClose();
            }}
            className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-tea text-white border-2 border-black text-xs sm:text-sm font-black shadow-[2px_2px_0px_#000] hover:bg-emerald-800 cursor-pointer active:scale-95"
          >
            <Check className="h-4 w-4 stroke-[3]" />
            <span>{normLoc === "hi" ? "पूर्ण" : normLoc === "as" ? "সম্পূৰ্ণ" : "Done"}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
