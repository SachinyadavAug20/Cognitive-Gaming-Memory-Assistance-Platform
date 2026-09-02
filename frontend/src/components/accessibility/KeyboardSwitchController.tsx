"use client";
import { useEffect, useCallback } from "react";
import { playPress, playTapFeedback, unlockAudio } from "@/lib/sound";

interface KeyboardSwitchControllerProps {
  active: boolean;
  onToggleAirMouse?: () => void;
  onSpeakFocus?: () => void;
}

export function KeyboardSwitchController({
  active,
  onToggleAirMouse,
  onSpeakFocus,
}: KeyboardSwitchControllerProps) {

  // Helper to find all interactive focusable elements on current page
  const getFocusableElements = useCallback((): HTMLElement[] => {
    if (typeof document === "undefined") return [];
    const selector =
      'button:not([disabled]):not([tabindex="-1"]), a[href]:not([tabindex="-1"]), input:not([disabled]), select:not([disabled]), [role="button"]:not([disabled]), .btn-tactile, .game-card';
    const rawElements = Array.from(document.querySelectorAll<HTMLElement>(selector));
    return rawElements.filter((el) => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && !el.closest("#virtual-air-mouse-overlay");
    });
  }, []);

  // Move focus to next/prev element
  const moveFocus = useCallback(
    (direction: "next" | "prev") => {
      playTapFeedback();
      unlockAudio();
      const elements = getFocusableElements();
      if (elements.length === 0) return;

      const activeEl = document.activeElement as HTMLElement | null;
      let currentIndex = activeEl ? elements.indexOf(activeEl) : -1;

      if (direction === "next") {
        currentIndex = (currentIndex + 1) % elements.length;
      } else {
        currentIndex = (currentIndex - 1 + elements.length) % elements.length;
      }

      const nextElement = elements[currentIndex];
      if (nextElement) {
        nextElement.focus();
        nextElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    },
    [getFocusableElements]
  );

  // Global Keyboard Event Listener
  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is actively typing in an input text field
      if (
        document.activeElement?.tagName === "INPUT" &&
        (document.activeElement as HTMLInputElement).type === "text"
      ) {
        if (e.key === "Escape") {
          (document.activeElement as HTMLInputElement).blur();
        }
        return;
      }

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        moveFocus("next");
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        moveFocus("prev");
      } else if (e.key === "Enter" || e.key === " ") {
        // Space / Enter activates focused element
        if (document.activeElement && document.activeElement !== document.body) {
          playPress();
        }
      } else if (e.key === "m" || e.key === "M") {
        // M toggles Air Mouse
        e.preventDefault();
        onToggleAirMouse?.();
      } else if (e.key === "v" || e.key === "V") {
        // V speaks active focus
        e.preventDefault();
        onSpeakFocus?.();
      } else if (e.key >= "1" && e.key <= "9") {
        // Number keys for instant selection of game cards (1-9)
        const idx = parseInt(e.key, 10) - 1;
        const elements = getFocusableElements().filter(
          (el) => el.classList.contains("game-card") || el.tagName === "BUTTON"
        );
        if (elements[idx]) {
          e.preventDefault();
          playPress();
          elements[idx].focus();
          elements[idx].click();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [active, moveFocus, onToggleAirMouse, onSpeakFocus, getFocusableElements]);

  if (!active) return null;

  return null;
}
