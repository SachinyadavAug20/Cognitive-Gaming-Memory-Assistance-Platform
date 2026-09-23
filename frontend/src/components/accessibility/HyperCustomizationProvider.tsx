"use client";

import { useEffect, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useHyperCustomizationStore } from "@/store/useHyperCustomizationStore";

const HyperCustomizationStudio = dynamic(
  () => import("@/components/accessibility/HyperCustomizationStudio").then((m) => m.HyperCustomizationStudio),
  { ssr: false }
);

interface Props {
  children: ReactNode;
}

export function HyperCustomizationProvider({ children }: Props) {
  const {
    theme,
    fontFamily,
    textScale,
    cornerRadius,
    borderWidth,
    highContrast,
    reducedMotion,
    isStudioOpen,
    setStudioOpen,
  } = useHyperCustomizationStore();

  // Guarantee studio overlay is NEVER open on page refresh or initial load
  useEffect(() => {
    setStudioOpen(false);
    try {
      const raw = localStorage.getItem("cognicare-hyper-customization");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.isStudioOpen) {
          parsed.state.isStudioOpen = false;
          localStorage.setItem("cognicare-hyper-customization", JSON.stringify(parsed));
        }
      }
    } catch {}
  }, [setStudioOpen]);

  useEffect(() => {
    const root = document.documentElement;

    // Remove existing theme classes
    root.classList.remove(
      "theme-muga-silk",
      "theme-arch-monochrome",
      "theme-terracotta-clay",
      "theme-nordic-clean",
      "theme-high-contrast-yellow",
      "theme-cyber-dark",
      "font-pref-sans",
      "font-pref-serif",
      "font-pref-dyslexic",
      "font-pref-mono",
      "scale-pref-small",
      "scale-pref-normal",
      "scale-pref-large",
      "scale-pref-extra-large",
      "scale-pref-elder-giant",
      "font-scale-sm",
      "font-scale-md",
      "font-scale-lg"
    );

    // Apply active classes
    root.classList.add(`theme-${theme.replace(/_/g, "-")}`);
    root.classList.add(`font-pref-${fontFamily}`);
    root.classList.add(`scale-pref-${textScale.replace(/_/g, "-")}`);

    // Font Scale synchronization with documentElement style
    if (textScale === "small") {
      root.classList.add("font-scale-sm");
      root.style.setProperty("font-size", "15px", "important");
      try {
        localStorage.setItem("cognicare_font_size", "sm");
        window.dispatchEvent(new Event("cognicare_accessibility_change"));
      } catch {}
    } else if (textScale === "elder_giant" || textScale === "extra_large" || textScale === "large") {
      root.classList.add("font-scale-lg");
      root.style.setProperty("font-size", "25px", "important");
      try {
        localStorage.setItem("cognicare_font_size", "lg");
        window.dispatchEvent(new Event("cognicare_accessibility_change"));
      } catch {}
    } else {
      root.classList.add("font-scale-md");
      root.style.setProperty("font-size", "18px", "important");
      try {
        localStorage.setItem("cognicare_font_size", "md");
        window.dispatchEvent(new Event("cognicare_accessibility_change"));
      } catch {}
    }

    // Set dynamic CSS variables for Arch Linux vs Rounded dials
    const radiusMap: Record<string, string> = {
      sharp: "0px",
      standard: "8px",
      soft: "16px",
      pill: "28px",
    };
    root.style.setProperty("--app-radius", radiusMap[cornerRadius] || "16px");

    const borderMap: Record<string, string> = {
      thin: "1px",
      tactile: "2px",
      heavy: "3px",
      bold: "4px",
    };
    root.style.setProperty("--app-border-width", borderMap[borderWidth] || "2px");

    if (reducedMotion) {
      root.classList.add("reduce-motion");
    } else {
      root.classList.remove("reduce-motion");
    }

    const isDarkTheme =
      highContrast ||
      theme === "arch_monochrome" ||
      theme === "cyber_dark" ||
      theme === "high_contrast_yellow";

    if (isDarkTheme) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (highContrast) {
      root.classList.add("high-contrast-override");
    } else {
      root.classList.remove("high-contrast-override");
    }
  }, [theme, fontFamily, textScale, cornerRadius, borderWidth, highContrast, reducedMotion]);

  return (
    <>
      {children}
      {isStudioOpen && (
        <HyperCustomizationStudio
          isOpen={isStudioOpen}
          onClose={() => setStudioOpen(false)}
        />
      )}
    </>
  );
}
