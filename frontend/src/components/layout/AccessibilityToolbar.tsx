"use client";

import { useSyncExternalStore, useCallback, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import {
  Moon,
  Hand,
  Volume2,
  Sliders,
  MousePointer,
} from "lucide-react";
import dynamic from "next/dynamic";
import { useListenFirst } from "@/components/accessibility/useListenFirst";
import { playPress, unlockAudio } from "@/lib/sound";
import { usePathname } from "@/i18n/navigation";
import { useHyperCustomizationStore } from "@/store/useHyperCustomizationStore";

const HyperCustomizationStudio = dynamic(
  () => import("@/components/accessibility/HyperCustomizationStudio").then((m) => m.HyperCustomizationStudio),
  { ssr: false }
);

const TOOLBAR_I18N: Record<string, {
  seniorLabel: string;
  textSize: string;
  readAloud: string;
  audioOn: string;
  nightMode: string;
  nightOn: string;
  govtSub: string;
  mouse: string;
  airMouse: string;
  airOn: string;
  contrastMode: string;
  contrastOn: string;
  settings: string;
}> = {
  en: {
    seniorLabel: "Senior Reading & Accessibility",
    textSize: "Text Size:",
    readAloud: "Read Aloud",
    audioOn: "Audio: ON",
    nightMode: "Night Mode",
    nightOn: "Night: ON",
    govtSub: "Cognitive Digital Therapeutics (CDTx)",
    mouse: "Mouse",
    airMouse: "Air Mouse",
    airOn: "Air: ON",
    contrastMode: "Contrast Mode",
    contrastOn: "Contrast: ON",
    settings: "Settings",
  },
  hi: {
    seniorLabel: "वरिष्ठ पाठन एवं सुगमता",
    textSize: "अक्षर आकार:",
    readAloud: "बोलकर सुनाएं",
    audioOn: "ध्वनि: चालू",
    nightMode: "रात्रि मोड",
    nightOn: "रात: चालू",
    govtSub: "संज्ञानात्मक डिजिटल थेरेप्यूटिक्स (CDTx)",
    mouse: "माउस",
    airMouse: "एयर माउस",
    airOn: "एयर: चालू",
    contrastMode: "कंट्रास्ट मोड",
    contrastOn: "कंट्रास्ट: चालू",
    settings: "सेटिंग्स",
  },
  as: {
    seniorLabel: "জেষ্ঠ্য পঠন আৰু সুচলতা",
    textSize: "আখৰৰ আকাৰ:",
    readAloud: "পঢ়ি শুনাওক",
    audioOn: "ধ্বনি: চলি আছে",
    nightMode: "ৰাতিৰ ম'ড",
    nightOn: "ৰাতি: চলি আছে",
    govtSub: "জ্ঞানমূলক ডিজিটেল চিকিৎসা (CDTx)",
    mouse: "মাউছ",
    airMouse: "এয়াৰ মাউছ",
    airOn: "এয়াৰ: চলি আছে",
    contrastMode: "কনট্ৰাষ্ট ম'ড",
    contrastOn: "কনট্ৰাষ্ট: চলি আছে",
    settings: "ছেটিংছ",
  },
  bn: {
    seniorLabel: "জ্যেষ্ঠ পাঠ ও সহজগম্যতা",
    textSize: "হরফের আকার:",
    readAloud: "পড়ে শোনান",
    audioOn: "শব্দ: চালু",
    nightMode: "রাত্রি মোড",
    nightOn: "রাত: চালু",
    govtSub: "কগনিটিভ ডিজিটাল থেরাপিউটিক্স (CDTx)",
    mouse: "মাউস",
    airMouse: "এয়ার মাউস",
    airOn: "এয়ার: চালু",
    contrastMode: "কনট্রাস্ট মোড",
    contrastOn: "কনট্রাস্ট: চালু",
    settings: "সেটিংস",
  },
  mr: {
    seniorLabel: "ज्येष्ठ वाचन व सुलभता",
    textSize: "अक्षर आकार:",
    readAloud: "वाचून दाखवा",
    audioOn: "आवाज: चालू",
    nightMode: "रात्र मोड",
    nightOn: "रात्र: चालू",
    govtSub: "कॉग्निटिव्ह डिजिटल थेरॅप्युटिक्स (CDTx)",
    mouse: "माऊस",
    airMouse: "एअर माऊस",
    airOn: "एअर: चालू",
    contrastMode: "कॉन्ट्रास्ट मोड",
    contrastOn: "कॉन्ट्रास्ट: चालू",
    settings: "सेटिंग्ज",
  },
  ne: {
    seniorLabel: "ज्येष्ठ पठन र पहुँच",
    textSize: "अक्षरको आकार:",
    readAloud: "पढेर सुनाउनुहोस्",
    audioOn: "ध्वनि: चालू",
    nightMode: "रातको मोड",
    nightOn: "रात: चालू",
    govtSub: "संज्ञानात्मक डिजिटल थेराप्यूटिक्स (CDTx)",
    mouse: "माउस",
    airMouse: "एयर माउस",
    airOn: "एयर: चालू",
    contrastMode: "कन्ट्रास्ट मोड",
    contrastOn: "कन्ट्रास्ट: चालू",
    settings: "सेटिङहरू",
  },
  mni: {
    seniorLabel: "অহলশিংগী পাভী-সুচলতা",
    textSize: "ময়েক্কী অচৌ-অচা:",
    readAloud: "পাথোকউ",
    audioOn: "খোল্লাক: য়াওরে",
    nightMode: "অহিং মোড",
    nightOn: "অহিং: য়াওরে",
    govtSub: "কগনিটিভ দিজিতেল থেরাপী (CDTx)",
    mouse: "মাউস",
    airMouse: "এয়ার মাউস",
    airOn: "এয়ার: য়াওরে",
    contrastMode: "কনত্রাষ্ট মোড",
    contrastOn: "কনত্রাষ্ট: য়াওরে",
    settings: "সেতিংশিং",
  },
  brx: {
    seniorLabel: "गिदिरफोरनि फरायनाय आरो हेफाजाब",
    textSize: "हांखो महर:",
    readAloud: "फरायना खोनथा",
    audioOn: "सोदोब: जागायबाय",
    nightMode: "हरनि महर",
    nightOn: "हर: जागायबाय",
    govtSub: "कगनिथिव दिजिथेल थेरापि (CDTx)",
    mouse: "माउस",
    airMouse: "एयार माउस",
    airOn: "एयार: जाबाय",
    contrastMode: "कनत्रास्ट महर",
    contrastOn: "कनत्रास्ट: जागायबाय",
    settings: "सेटिंफोर",
  },
  grt: {
    seniorLabel: "Balgipani Poriani & Dakchakaniko",
    textSize: "Okkorni dal·ani:",
    readAloud: "Porie Knatimatbo",
    audioOn: "Gam·ani: ON",
    nightMode: "Walo Ni·ani",
    nightOn: "Wal: ON",
    govtSub: "Cognitive Digital Therapeutics (CDTx)",
    mouse: "Mouse",
    airMouse: "Air Mouse",
    airOn: "Air: ON",
    contrastMode: "Contrast Mode",
    contrastOn: "Contrast: ON",
    settings: "Settings",
  },
  kha: {
    seniorLabel: "Ka Jingpule Ki Rangbah & Jingiarap",
    textSize: "Ka jingheh dak:",
    readAloud: "Pule ia nga",
    audioOn: "Sur: ON",
    nightMode: "Rukom Miet",
    nightOn: "Miet: ON",
    govtSub: "Cognitive Digital Therapeutics (CDTx)",
    mouse: "Mouse",
    airMouse: "Air Mouse",
    airOn: "Air: ON",
    contrastMode: "Contrast Mode",
    contrastOn: "Contrast: ON",
    settings: "Settings",
  },
  lus: {
    seniorLabel: "Upate Chhiarna leh Puihna",
    textSize: "Hawrawp Len Zawng:",
    readAloud: "Chhiar Rawh",
    audioOn: "Ri: ON",
    nightMode: "Zan Thim Rim",
    nightOn: "Zan: ON",
    govtSub: "Cognitive Digital Therapeutics (CDTx)",
    mouse: "Mouse",
    airMouse: "Air Mouse",
    airOn: "Air: ON",
    contrastMode: "Contrast Mode",
    contrastOn: "Contrast: ON",
    settings: "Settings",
  },
};

const VirtualAirMouse = dynamic(
  () => import("@/components/accessibility/VirtualAirMouse").then((m) => m.VirtualAirMouse),
  { ssr: false }
);
const AccessibilityModal = dynamic(
  () => import("@/components/accessibility/AccessibilityModal").then((m) => m.AccessibilityModal),
  { ssr: false }
);

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
    const hyperState = localStorage.getItem("cognicare-hyper-customization");
    if (hyperState) {
      const parsed = JSON.parse(hyperState)?.state?.textScale;
      if (parsed === "small") return "sm";
      if (parsed === "elder_giant" || parsed === "extra_large" || parsed === "large") return "lg";
    }
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

const emptySubscribe = () => () => {};

export function AccessibilityToolbar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHyperStudioOpen, setIsHyperStudioOpen] = useState(false);
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

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

  // Global interceptor for harmless aborted media fetch / audio navigation cancellations
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason?.name || String(event.reason);
      if (
        reason.includes("AbortError") ||
        reason.includes("aborted by the user agent") ||
        reason.includes("media resource") ||
        reason.includes("The play() request was interrupted") ||
        reason.includes("interrupted by a call to pause()")
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Initial Theme & Accessibility Setup on Client Mount
    try {
      const s = getFontSizeSnapshot();
      const root = document.documentElement;
      root.classList.remove(
        "font-scale-sm",
        "font-scale-md",
        "font-scale-lg",
        "scale-pref-small",
        "scale-pref-normal",
        "scale-pref-large",
        "scale-pref-extra-large",
        "scale-pref-elder-giant"
      );

      if (s === "sm") {
        root.classList.add("font-scale-sm", "scale-pref-small");
        root.style.setProperty("font-size", "15px", "important");
      } else if (s === "lg") {
        root.classList.add("font-scale-lg", "scale-pref-elder-giant");
        root.style.setProperty("font-size", "25px", "important");
      } else {
        root.classList.add("font-scale-md", "scale-pref-normal");
        root.style.setProperty("font-size", "18px", "important");
      }

      if (localStorage.getItem("cognicare_high_contrast") === "true") {
        document.documentElement.classList.add("high-contrast-mode", "dark");
      }

      const K = ["Tab", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Escape", " "];
      const h = document.documentElement;
      const off = () => h.classList.remove("keyboard-user");
      const on = (e: KeyboardEvent) => {
        if (K.indexOf(e.key) !== -1) h.classList.add("keyboard-user");
      };
      window.addEventListener("mousedown", off);
      window.addEventListener("keydown", on);

      return () => {
        window.removeEventListener("unhandledrejection", handleUnhandledRejection);
        window.removeEventListener("mousedown", off);
        window.removeEventListener("keydown", on);
      };
    } catch {
      return () => {
        window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      };
    }
  }, []);

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
      unlockAudio();
      playPress();
      localStorage.setItem("cognicare_font_size", level);
      const root = document.documentElement;

      root.classList.remove(
        "font-scale-sm",
        "font-scale-md",
        "font-scale-lg",
        "scale-pref-small",
        "scale-pref-normal",
        "scale-pref-large",
        "scale-pref-extra-large",
        "scale-pref-elder-giant"
      );

      if (level === "sm") {
        root.classList.add("font-scale-sm", "scale-pref-small");
        root.style.setProperty("font-size", "15px", "important");
        useHyperCustomizationStore.getState().setTextScale("small");
      } else if (level === "lg") {
        root.classList.add("font-scale-lg", "scale-pref-elder-giant");
        root.style.setProperty("font-size", "25px", "important");
        useHyperCustomizationStore.getState().setTextScale("elder_giant");
      } else {
        root.classList.add("font-scale-md", "scale-pref-normal");
        root.style.setProperty("font-size", "18px", "important");
        useHyperCustomizationStore.getState().setTextScale("normal");
      }

      window.dispatchEvent(new Event("cognicare_accessibility_change"));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Ignore
    }
  }, []);

  const toggleHighContrast = useCallback(() => {
    try {
      const next = !getHighContrastSnapshot();
      localStorage.setItem("cognicare_high_contrast", String(next));
      if (next) {
        document.documentElement.classList.add("high-contrast-mode", "dark");
      } else {
        document.documentElement.classList.remove("high-contrast-mode", "dark");
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

  const activeFontSizeLevel = mounted ? fontSizeLevel : "md";
  const activeHighContrast = mounted ? highContrast : false;
  const activeInputMode = mounted ? inputMode : "physical";
  const activeListenFirst = mounted ? listenFirstActive : false;
  const pathname = usePathname();
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const a11y = TOOLBAR_I18N[normLoc] || TOOLBAR_I18N.en;
  const isPatientRoute = pathname.startsWith("/patient") || pathname.startsWith("/kiosk");

  return (
    <>
      {/* ── TOP GOVERNMENT & ACCESSIBILITY COMMAND BAR ── */}
      {isPatientRoute ? (
        <div
          suppressHydrationWarning
          className="w-full border-b-2 border-black/20 bg-surface px-3 sm:px-6 py-2 text-xs sm:text-sm text-ink select-none"
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            {/* Senior Label */}
            <div className="flex items-center gap-2 font-bold shrink-0">
              <span className="flex items-center gap-2 text-sm sm:text-base font-black text-tea whitespace-nowrap">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-tea" />
                {a11y.seniorLabel}
              </span>
            </div>

            {/* Clean Senior Controls */}
            <div className="flex items-center gap-2.5 shrink-0">
              {/* Font Size Scaler */}
              <div className="flex items-center gap-1 rounded-xl border-2 border-black/40 bg-surface p-1 shadow-xs shrink-0">
                <span className="text-xs sm:text-sm font-black px-2 text-ink hidden sm:inline">{a11y.textSize}</span>
                <button
                  type="button"
                  onClick={() => setFontSize("sm")}
                  className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-black rounded-lg cursor-pointer transition-all active:scale-95 ${
                    activeFontSizeLevel === "sm" ? "bg-tea text-white shadow-[2px_2px_0px_#000] border-2 border-black" : "border-2 border-transparent hover:bg-surface-muted text-ink"
                  }`}
                  title="Smaller Text (15px)"
                  aria-label="Set smaller text"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("md")}
                  className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-black rounded-lg cursor-pointer transition-all active:scale-95 ${
                    activeFontSizeLevel === "md" ? "bg-tea text-white shadow-[2px_2px_0px_#000] border-2 border-black" : "border-2 border-transparent hover:bg-surface-muted text-ink"
                  }`}
                  title="Standard Text (18px)"
                  aria-label="Set standard text"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("lg")}
                  className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-black rounded-lg cursor-pointer transition-all active:scale-95 ${
                    activeFontSizeLevel === "lg" ? "bg-tea text-white shadow-[2px_2px_0px_#000] border-2 border-black ring-1 ring-amber-400" : "border-2 border-transparent hover:bg-surface-muted text-ink"
                  }`}
                  title="Large Text for Elders (25px)"
                  aria-label="Set large text"
                >
                  A+
                </button>
              </div>

              {/* Read-Aloud Audio Toggle */}
              <button
                type="button"
                onClick={() => {
                  playPress();
                  toggleListenFirst();
                }}
                aria-pressed={activeListenFirst}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-black border-2 transition-all cursor-pointer shrink-0 ${
                  activeListenFirst
                    ? "bg-emerald-400 text-black border-black shadow-xs ring-1 ring-emerald-500"
                    : "bg-surface text-ink border-black/40 hover:border-black shadow-xs"
                }`}
                title="Toggle Voice Read Aloud on Hover or Touch"
              >
                <Volume2 className="h-4.5 w-4.5 stroke-[2.5]" />
                <span>{activeListenFirst ? a11y.audioOn : a11y.readAloud}</span>
              </button>

              {/* Circadian Night Mode Toggle */}
              <button
                type="button"
                onClick={toggleHighContrast}
                aria-pressed={activeHighContrast}
                className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-black border-2 transition-all cursor-pointer shrink-0 ${
                  activeHighContrast
                    ? "bg-amber-400 text-black border-black shadow-xs"
                    : "bg-surface text-ink border-black/40 hover:border-black shadow-xs"
                }`}
                title="Toggle High Contrast Night Mode"
              >
                <Moon className="h-4.5 w-4.5" />
                <span>{activeHighContrast ? a11y.nightOn : a11y.nightMode}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
      <div
        suppressHydrationWarning
        className="w-full border-b border-black/15 bg-surface px-2 sm:px-4 md:px-6 py-1 text-xs text-ink select-none overflow-x-auto"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-1.5 sm:gap-2 flex-nowrap">
          {/* Government of India / MDoNER Mandate Badge */}
          <div className="flex items-center gap-1.5 font-bold shrink-0">
            <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-tea whitespace-nowrap">
              <span className="inline-block h-2 w-2 rounded-full bg-tea animate-pulse" />
              MoHFW &bull; MDoNER
            </span>
            <span className="text-black/30 hidden 2xl:inline">|</span>
            <span className="text-[11px] text-ink-secondary hidden 2xl:inline whitespace-nowrap">
              {a11y.govtSub}
            </span>
          </div>

          {/* Quick Accessibility Controls */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Input Mode Segmented Toggle (Physical vs Virtual Air Mouse) */}
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
                aria-pressed={activeInputMode === "physical"}
                className={`flex items-center gap-1 rounded-lg px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
                  activeInputMode === "physical"
                    ? "bg-tea text-white shadow-xs"
                    : "text-ink hover:bg-surface-muted"
                }`}
                title="Physical Mouse & Touch Mode (Standard OS Cursor)"
              >
                <MousePointer className="h-3 w-3 stroke-[2.5]" />
                <span className="hidden md:inline">{a11y.mouse}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playPress();
                  setInputMode("virtual");
                }}
                aria-pressed={activeInputMode === "virtual"}
                className={`flex items-center gap-1 rounded-lg px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
                  activeInputMode === "virtual"
                    ? "bg-amber-400 text-black shadow-xs ring-2 ring-amber-300 animate-pulse"
                    : "text-ink hover:bg-surface-muted"
                }`}
                title="OpenCV Virtual Air Mouse (In-Air Hand Tracking, Esc to exit)"
              >
                <Hand className="h-3 w-3 stroke-[2.5]" />
                <span className="hidden md:inline">
                  {activeInputMode === "virtual" ? a11y.airOn : a11y.airMouse}
                </span>
                <span className="md:hidden">
                  {activeInputMode === "virtual" ? a11y.airOn : a11y.airMouse}
                </span>
              </button>
            </div>

            {/* Listen-First Quick Toggle */}
            <button
              type="button"
              onClick={() => {
                playPress();
                toggleListenFirst();
              }}
              aria-pressed={activeListenFirst}
              className={`flex items-center gap-1 rounded-lg px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-black border-2 transition-all cursor-pointer shrink-0 ${
                activeListenFirst
                  ? "bg-emerald-400 text-black border-black shadow-xs"
                  : "bg-surface text-ink border-black/40 hover:border-black shadow-xs"
              }`}
              title="Toggle Listen-First Auto-Narration on Hover/Focus"
            >
              <Volume2 className="h-3.5 w-3.5 stroke-[2.5]" />
              <span className="hidden lg:inline">
                {activeListenFirst ? a11y.audioOn : a11y.readAloud}
              </span>
            </button>

            {/* Accessibility Suite Settings Modal */}
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
              <span className="hidden lg:inline">{a11y.settings}</span>
            </button>

            {/* Arch-Style Hyper-Customization Studio */}
            <button
              type="button"
              onClick={() => {
                playPress();
                setIsHyperStudioOpen(true);
              }}
              className="flex items-center gap-1 rounded-lg border-2 border-black bg-amber-200 px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-black text-black hover:bg-amber-300 shadow-[1.5px_1.5px_0px_#000] cursor-pointer shrink-0"
              title="Arch Linux-Style Hyper-Customization Studio (Theme, Typography, Layout, Widgets)"
            >
              <Sliders className="h-3.5 w-3.5 stroke-[2.5] text-tea" />
              <span className="hidden sm:inline">Arch Studio</span>
            </button>

            {/* Circadian Night Mode Toggle */}
            <button
              type="button"
              onClick={toggleHighContrast}
              aria-pressed={activeHighContrast}
              className={`flex items-center gap-1 rounded-lg px-1.5 sm:px-2 py-0.5 text-[11px] sm:text-xs font-black border-2 transition-all cursor-pointer shrink-0 ${
                activeHighContrast
                  ? "bg-amber-400 text-black border-black shadow-xs"
                  : "bg-surface text-ink border-black/40 hover:border-black shadow-xs"
              }`}
              title="Toggle Circadian Night Mode (Zero Blue Light, Sleep-Safe)"
            >
              <Moon className="h-3.5 w-3.5" />
              <span className="hidden lg:inline">{activeHighContrast ? a11y.contrastOn : a11y.contrastMode}</span>
            </button>

            {/* Font Size Scaler */}
            <div className="flex items-center gap-1 rounded border-2 border-black/30 bg-surface p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setFontSize("sm")}
                className={`px-2 py-0.5 text-xs font-black rounded cursor-pointer transition-all active:scale-95 ${
                  activeFontSizeLevel === "sm" ? "bg-tea text-white shadow-xs" : "hover:bg-surface-muted text-ink"
                }`}
                title="Small Text (15px)"
              >
                A-
              </button>
              <button
                type="button"
                onClick={() => setFontSize("md")}
                className={`px-2 py-0.5 text-xs font-black rounded cursor-pointer transition-all active:scale-95 ${
                  activeFontSizeLevel === "md" ? "bg-tea text-white shadow-xs" : "hover:bg-surface-muted text-ink"
                }`}
                title="Standard Text (18px)"
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize("lg")}
                className={`px-2 py-0.5 text-xs font-black rounded cursor-pointer transition-all active:scale-95 ${
                  activeFontSizeLevel === "lg" ? "bg-tea text-white shadow-xs ring-1 ring-amber-400" : "hover:bg-surface-muted text-ink"
                }`}
                title="Large Text for Elders (25px)"
              >
                A+
              </button>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* ── GLOBAL ACTIVE ACCESSIBILITY RUNTIMES ── */}
      {/* 1. OpenCV Virtual Air Mouse (Strict Mutual Exclusion - Lazy Loaded On Demand) */}
      {mounted && inputMode === "virtual" && (
        <VirtualAirMouse
          active={true}
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
      )}

      {/* 2. Keyboard & Switch Access Controller — removed: elder patients do not
          use keyboard shortcuts, and the global handler hijacked paste/arrow/typing
          (e.g. Ctrl+V in forms). Elders interact via physical mouse or the Air Mouse. */}

      {/* 3. Elder Accessibility Settings Modal (Lazy Loaded On Demand) */}
      {isModalOpen && (
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
      )}

      {isHyperStudioOpen && (
        <HyperCustomizationStudio
          isOpen={isHyperStudioOpen}
          onClose={() => setIsHyperStudioOpen(false)}
        />
      )}
    </>
  );
}
