"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocale } from "next-intl";
import {
  Hand,
  X,
  Minimize2,
  Maximize2,
  MousePointer,
  Sparkles,
  Pause,
  Play,
  Magnet,
  Crosshair,
} from "lucide-react";
import { OpticalMotionTracker, type MotionEvent } from "@/lib/vision";
import { OneEuroFilter2D } from "@/lib/one-euro-filter";
import { playPress, playTapFeedback, playDwellTick, unlockAudio } from "@/lib/sound";

export interface VirtualAirMouseProps {
  active: boolean;
  onClose: (reason?: string) => void;
  dwellTimeMs?: number;
  smoothing?: number;
  motionReach?: number; // 1.0 (standard) to 1.5 (wide reach)
  cursorSize?: "normal" | "large" | "giant";
  cursorPace?: "calm" | "gentle" | "standard";
  clickMethod?: "dwell" | "pinch" | "key";
  cameraViewMode?: "pip" | "minimized" | "hidden";
  handoffPolicy?: "auto" | "strict";
  stickyMagnetism?: boolean;
  audioTicks?: boolean;
  onDwellClick?: (target: HTMLElement) => void;
  onHoverTarget?: (target: HTMLElement | null) => void;
}

interface TargetMatch {
  element: HTMLElement;
  rect: DOMRect;
  cx: number;
  cy: number;
  distance: number;
  isDirectHit: boolean;
}

// Find the nearest interactive target within snapRadius
function findNearestInteractiveTarget(x: number, y: number, snapRadius = 90): TargetMatch | null {
  if (typeof document === "undefined") return null;

  const candidates = document.querySelectorAll<HTMLElement>(
    'button, a, input, select, textarea, [role="button"], [tabIndex="0"], .btn-tactile, .game-card, .cursor-pointer'
  );

  let bestMatch: TargetMatch | null = null;
  let minDistance = snapRadius;

  for (let i = 0; i < candidates.length; i++) {
    const el = candidates[i];
    if (
      el.closest("#virtual-air-mouse-overlay") ||
      el.closest("#air-mouse-pip-card") ||
      el.closest("#air-mouse-rest-dock")
    ) {
      continue;
    }

    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) continue;
    if (
      rect.bottom < 0 ||
      rect.top > window.innerHeight ||
      rect.right < 0 ||
      rect.left > window.innerWidth
    ) {
      continue;
    }

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    // Direct hit inside bounding box
    if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
      return {
        element: el,
        rect,
        cx,
        cy,
        distance: 0,
        isDirectHit: true,
      };
    }

    // Distance to closest point on rectangle
    const clampedX = Math.max(rect.left, Math.min(x, rect.right));
    const clampedY = Math.max(rect.top, Math.min(y, rect.bottom));
    const dist = Math.hypot(x - clampedX, y - clampedY);

    if (dist < minDistance) {
      minDistance = dist;
      bestMatch = {
        element: el,
        rect,
        cx,
        cy,
        distance: dist,
        isDirectHit: false,
      };
    }
  }

  return bestMatch;
}

interface AirMouseStrings {
  restModeBadge: string;
  pinchBadge: string;
  snappedBadge: string;
  pinchToClick: string;
  pressSpaceEnter: string;
  snappedToButton: string;
  raiseHandPrompt: string;
  resumeClickingBtn: string;
  restBtn: string;
  recenterBtn: string;
  autoSnapBadge: string;
  useMouseBtn: string;
  pausedTitle: string;
  activeTitle: string;
  initVision: string;
  pausedStatus: string;
  noHandStatus: string;
  pinchStatus: string;
  dwellingStatus: string;
  pinchReadyStatus: string;
  fullscreen100: string;
  triggerMode: string;
  reach: string;
  reachActive: string;
  smoothingEngine: string;
  filterName: string;
  lastClick: string;
  modeMinimized: string;
  escToExit: string;
  toastPhysMouse: string;
  toastPhysClick: string;
  toastRecentered: string;
  toastRecenteredShort: string;
  titleResume: string;
  titlePause: string;
  titleRecenter: string;
  titleTargetMag: string;
  titleReturnMouse: string;
  titleExpandHud: string;
  titleMinHud: string;
  titleExitAir: string;
}

const AIR_MOUSE_I18N: Record<string, AirMouseStrings> = {
  en: {
    restModeBadge: "REST MODE (P to resume)",
    pinchBadge: "PINCH!",
    snappedBadge: "SNAPPED",
    pinchToClick: "Pinch to click",
    pressSpaceEnter: "Press Space/Enter",
    snappedToButton: "Snapped to button",
    raiseHandPrompt: "Raise hand in view of camera",
    resumeClickingBtn: "Resume Clicking (P)",
    restBtn: "Rest (P)",
    recenterBtn: "Recenter (C)",
    autoSnapBadge: "Auto-Snap",
    useMouseBtn: "Use Mouse",
    pausedTitle: "Air Mouse (Paused)",
    activeTitle: "Air Mouse (Active)",
    initVision: "Initializing Web Vision...",
    pausedStatus: "PAUSED",
    noHandStatus: "NO HAND IN VIEW",
    pinchStatus: "PINCH",
    dwellingStatus: "DWELLING",
    pinchReadyStatus: "PINCH READY",
    fullscreen100: "FULL SCREEN 100%",
    triggerMode: "Trigger Mode:",
    reach: "Full Screen Reach:",
    reachActive: "Active (100%)",
    smoothingEngine: "Smoothing Engine:",
    filterName: "1€ Filter (Zero-Lag)",
    lastClick: "Last click:",
    modeMinimized: "Mode:",
    escToExit: "Esc to exit",
    toastPhysMouse: "Physical mouse detected — switched to standard mouse mode",
    toastPhysClick: "Physical click detected — returned to physical mouse",
    toastRecentered: "Cursor Recentered to Screen Center",
    toastRecenteredShort: "Cursor Recentered",
    titleResume: "Resume in-air clicking (Key: P)",
    titlePause: "Pause clicking for arm rest (Key: P)",
    titleRecenter: "Recenter cursor to center of screen (Key: C)",
    titleTargetMag: "Target Magnetism: Automatically snaps pointer to nearby buttons",
    titleReturnMouse: "Return to Physical Mouse",
    titleExpandHud: "Expand Camera HUD",
    titleMinHud: "Minimize Camera HUD",
    titleExitAir: "Exit Virtual Air Mouse (Return to Physical Mouse)",
  },
  as: {
    restModeBadge: "বিৰতি ম'ড (পুনৰ আৰম্ভ কৰিবলৈ P)",
    pinchBadge: "টিপ মৰা হ'ল!",
    snappedBadge: "সংলগ্ন",
    pinchToClick: "ক্লিক কৰিবলৈ টিপক",
    pressSpaceEnter: "স্পেচ/এণ্টাৰ টিপক",
    snappedToButton: "বুটামত সংলগ্ন হ'ল",
    raiseHandPrompt: "কেমেৰাৰ সন্মুখত হাত দাঙক",
    resumeClickingBtn: "ক্লিক পুনৰাৰম্ভ (P)",
    restBtn: "বিৰতি (P)",
    recenterBtn: "কেন্দ্ৰীকৰণ (C)",
    autoSnapBadge: "স্বয়ং-সংলগ্ন",
    useMouseBtn: "মাউছ ব্যৱহাৰ",
    pausedTitle: "এয়াৰ মাউছ (স্থগিত)",
    activeTitle: "এয়াৰ মাউছ (সক্ৰিয়)",
    initVision: "কেমেৰা দৃষ্টি আৰম্ভ হৈছে...",
    pausedStatus: "স্থগিত",
    noHandStatus: "হাত দেখা পোৱা নাই",
    pinchStatus: "টিপ",
    dwellingStatus: "স্থিৰ ক্লিক",
    pinchReadyStatus: "টিপৰ বাবে প্ৰস্তুত",
    fullscreen100: "পূৰ্ণ স্ক্ৰিন ১০০%",
    triggerMode: "ট্ৰিগাৰ ম'ড:",
    reach: "স্ক্ৰিন পৰিসৰ:",
    reachActive: "সক্ৰিয় (১০০%)",
    smoothingEngine: "মসৃণতা ইঞ্জিন:",
    filterName: "১€ ফিল্টাৰ (বিলম্বহীন)",
    lastClick: "শেহতীয়া ক্লিক:",
    modeMinimized: "ম'ড:",
    escToExit: "ওলাই যাবলৈ Esc",
    toastPhysMouse: "ভৌতিক মাউছ ধৰা পৰিছে — সাধাৰণ মাউছলৈ পৰিবৰ্তন কৰা হ'ল",
    toastPhysClick: "ভৌতিক ক্লিক ধৰা পৰিছে — মাউছলৈ ঘূৰি গ'ল",
    toastRecentered: "কাৰ্ছাৰ স্ক্ৰিনৰ মাজলৈ অনা হ'ল",
    toastRecenteredShort: "কাৰ্ছাৰ পুনৰ কেন্দ্ৰীকৃত",
    titleResume: "বায়বীয় ক্লিক পুনৰাৰম্ভ (কী: P)",
    titlePause: "হাত জিৰণিৰ বাবে ক্লিক স্থগিত (কী: P)",
    titleRecenter: "কাৰ্ছাৰ স্ক্ৰিনৰ কেন্দ্ৰলৈ আনক (কী: C)",
    titleTargetMag: "লক্ষ্য চুম্বকত্ব: ওচৰৰ বুটামত স্বয়ংক্ৰিয়ভাৱে সংলগ্ন হয়",
    titleReturnMouse: "ভৌতিক মাউছলৈ ঘূৰি যাওক",
    titleExpandHud: "কেমেৰা HUD প্ৰসাৰণ",
    titleMinHud: "কেমেৰা HUD সংকোচন",
    titleExitAir: "ভাৰ্চুৱেল এয়াৰ মাউছৰ পৰা ওলাই যাওক",
  },
  hi: {
    restModeBadge: "विश्राम मोड (जारी रखने के लिए P दबाएं)",
    pinchBadge: "चुटकी क्लिक!",
    snappedBadge: "स्नैप हुआ",
    pinchToClick: "क्लिक करने के लिए चुटकी बनाएं",
    pressSpaceEnter: "Space/Enter दबाएं",
    snappedToButton: "बटन पर लॉक हुआ",
    raiseHandPrompt: "कैमरे के सामने हाथ उठाएं",
    resumeClickingBtn: "क्लिक शुरू करें (P)",
    restBtn: "विश्राम (P)",
    recenterBtn: "पुनः केंद्रित (C)",
    autoSnapBadge: "ऑटो-स्नैप",
    useMouseBtn: "माउस उपयोग",
    pausedTitle: "एयर माउस (रोका गया)",
    activeTitle: "एयर माउस (सक्रिय)",
    initVision: "वेब दृष्टि आरंभ हो रही है...",
    pausedStatus: "रोका गया",
    noHandStatus: "कैमरे में हाथ नहीं दिखा",
    pinchStatus: "चुटकी",
    dwellingStatus: "स्थिर क्लिक",
    pinchReadyStatus: "चुटकी तैयार",
    fullscreen100: "पूर्ण स्क्रीन 100%",
    triggerMode: "ट्रिगर मोड:",
    reach: "स्क्रीन पहुंच:",
    reachActive: "सक्रिय (100%)",
    smoothingEngine: "स्मूथिंग इंजन:",
    filterName: "1€ फ़िल्टर (शून्य विलंब)",
    lastClick: "अंतिम क्लिक:",
    modeMinimized: "मोड:",
    escToExit: "बाहर निकलने के लिए Esc",
    toastPhysMouse: "भौतिक माउस का पता चला — मानक माउस मोड सक्रिय",
    toastPhysClick: "भौतिक क्लिक का पता चला — भौतिक माउस पर लौटे",
    toastRecentered: "कर्सर स्क्रीन के केंद्र में लाया गया",
    toastRecenteredShort: "कर्सर पुनः केंद्रित हुआ",
    titleResume: "एयर क्लिक पुनः आरंभ करें (कुंजी: P)",
    titlePause: "हाथ के आराम के लिए क्लिक रोकें (कुंजी: P)",
    titleRecenter: "कर्सर स्क्रीन के मध्य लाएं (कुंजी: C)",
    titleTargetMag: "टारगेट मैग्नेटिज़्म: बटन पर स्वतः आकर्षित होता है",
    titleReturnMouse: "भौतिक माउस पर लौटें",
    titleExpandHud: "कैमरा HUD बड़ा करें",
    titleMinHud: "कैमरा HUD छोटा करें",
    titleExitAir: "वर्चुअल एयर माउस से बाहर निकलें",
  },
  bn: {
    restModeBadge: "বিশ্রাম মোড (চালু করতে P টিপুন)",
    pinchBadge: "চিমটি ক্লিক!",
    snappedBadge: "সংযুক্ত",
    pinchToClick: "ক্লিক করতে আঙুলের চিমটি কাটুন",
    pressSpaceEnter: "Space/Enter টিপুন",
    snappedToButton: "বোতামে সংযুক্ত হয়েছে",
    raiseHandPrompt: "ক্যামেরার সামনে হাত তুলুন",
    resumeClickingBtn: "ক্লিক চালু করুন (P)",
    restBtn: "বিশ্রাম (P)",
    recenterBtn: "কেন্দ্রীকরণ (C)",
    autoSnapBadge: "অটো-স্ন্যাপ",
    useMouseBtn: "মাউস ব্যবহার",
    pausedTitle: "এয়ার মাউস (স্থগিত)",
    activeTitle: "এয়ার মাউস (সক্রিয়)",
    initVision: "ক্যামেরা ভিশন শুরু হচ্ছে...",
    pausedStatus: "স্থগিত",
    noHandStatus: "হাত দেখা যাচ্ছে না",
    pinchStatus: "চিমটি",
    dwellingStatus: "স্থির ক্লিক",
    pinchReadyStatus: "চিমটি প্রস্তুত",
    fullscreen100: "পূর্ণ স্ক্রিন ১০০%",
    triggerMode: "ট্রিগার মোড:",
    reach: "স্ক্রিন বিস্তার:",
    reachActive: "সক্রিয় (১০০%)",
    smoothingEngine: "মসৃণকরণ ইঞ্জিন:",
    filterName: "১€ ফিল্টার (শূন্য বিলম্ব)",
    lastClick: "সর্বশেষ ক্লিক:",
    modeMinimized: "মোড:",
    escToExit: "বের হতে Esc",
    toastPhysMouse: "ভৌত মাউস সনাক্ত হয়েছে — সাধারণ মাউস মোডে পরিবর্তিত",
    toastPhysClick: "ভৌত ক্লিক সনাক্ত হয়েছে — মাউসে ফিরে আসা হয়েছে",
    toastRecentered: "কার্সার স্ক্রিনের কেন্দ্রে আনা হয়েছে",
    toastRecenteredShort: "কার্সার পুনঃকেন্দ্রীকৃত",
    titleResume: "বাতাসে ক্লিক পুনরায় শুরু (কি: P)",
    titlePause: "হাতের বিশ্রামের জন্য ক্লিক স্থগিত (কি: P)",
    titleRecenter: "কার্সার স্ক্রিনের কেন্দ্রে আনুন (কি: C)",
    titleTargetMag: "টার্গেট চুম্বকত্ব: বোতামে স্বয়ংক্রিয়ভাবে লেগে যায়",
    titleReturnMouse: "ভৌত মাউসে ফিরে যান",
    titleExpandHud: "ক্যামেরা HUD প্রসারিত করুন",
    titleMinHud: "ক্যামেরা HUD সংকুচিত করুন",
    titleExitAir: "ভার্চুয়াল এয়ার মাউস থেকে প্রস্থান",
  },
  mr: {
    restModeBadge: "विश्रांती मोड (सुरू करण्यासाठी P दाबा)",
    pinchBadge: "चिमटी क्लिक!",
    snappedBadge: "जोडले गेले",
    pinchToClick: "क्लिक करण्यासाठी बोटांची चिमटी करा",
    pressSpaceEnter: "Space/Enter दाबा",
    snappedToButton: "बटनावर लॉक झाले",
    raiseHandPrompt: "कॅमेऱ्यासमोर हात वर करा",
    resumeClickingBtn: "क्लिक पुन्हा सुरू (P)",
    restBtn: "विश्रांती (P)",
    recenterBtn: "पुन्हा मध्यभागी (C)",
    autoSnapBadge: "ऑटो-स्नॅप",
    useMouseBtn: "माउस वापरा",
    pausedTitle: "एअर माउस (थांबवले)",
    activeTitle: "एअर माउस (सक्रिय)",
    initVision: "कॅमेरा व्हिजन सुरू होत आहे...",
    pausedStatus: "थांबवले",
    noHandStatus: "हात दिसत नाही",
    pinchStatus: "चिमटी",
    dwellingStatus: "स्थिर क्लिक",
    pinchReadyStatus: "चिमटी तयार",
    fullscreen100: "पूर्ण स्क्रीन १००%",
    triggerMode: "ट्रिगर मोड:",
    reach: "स्क्रीन पोहोच:",
    reachActive: "सक्रिय (१००%)",
    smoothingEngine: "स्मूथिंग इंजिन:",
    filterName: "१€ फिल्टर (शून्य विलंब)",
    lastClick: "शेवटचे क्लिक:",
    modeMinimized: "मोड:",
    escToExit: "बाहेर पडण्यासाठी Esc",
    toastPhysMouse: "भौतिक माउस आढळला — मानक माउस मोड सुरू",
    toastPhysClick: "भौतिक क्लिक आढळले — मूळ माउसवर परतले",
    toastRecentered: "कर्सर स्क्रीनच्या मध्यभागी आणला",
    toastRecenteredShort: "कर्सर पुन्हा मध्यभागी",
    titleResume: "एअर क्लिक सुरू करा (की: P)",
    titlePause: "हाताच्या विश्रांतीसाठी क्लिक थांबवा (की: P)",
    titleRecenter: "कर्सर मध्यभागी आणा (की: C)",
    titleTargetMag: "लक्ष्य चुंबकत्व: जवळच्या बटनावर आपोआप लॉक होते",
    titleReturnMouse: "भौतिक माउसवर परत जा",
    titleExpandHud: "कॅमेरा HUD मोठा करा",
    titleMinHud: "कॅमेरा HUD लहान करा",
    titleExitAir: "व्हर्च्युअल एअर माउसमधून बाहेर पडा",
  },
  ne: {
    restModeBadge: "विश्राम मोड (जारी राख्न P थिच्नुहोस्)",
    pinchBadge: "चिमोटी क्लिक!",
    snappedBadge: "जोडियो",
    pinchToClick: "क्लिक गर्न औंलाले चिमोट्नुहोस्",
    pressSpaceEnter: "Space/Enter थिच्नुहोस्",
    snappedToButton: "बटनमा जोडियो",
    raiseHandPrompt: "क्यामेराको अगाडि हात उठाउनुहोस्",
    resumeClickingBtn: "क्लिक पुन: सुरु (P)",
    restBtn: "विश्राम (P)",
    recenterBtn: "केन्द्रमा ल्याउनुहोस् (C)",
    autoSnapBadge: "स्वत: स्न्याप",
    useMouseBtn: "माउस प्रयोग",
    pausedTitle: "एयर माउस (रोकिएको)",
    activeTitle: "एयर माउस (सक्रिय)",
    initVision: "क्यामेरा दृष्टि सुरु हुँदैछ...",
    pausedStatus: "रोकिएको",
    noHandStatus: "हात देखिएन",
    pinchStatus: "चिमोटी",
    dwellingStatus: "स्थिर क्लिक",
    pinchReadyStatus: "चिमोटी तयार",
    fullscreen100: "पूरा स्क्रिन १००%",
    triggerMode: "ट्रिगर मोड:",
    reach: "स्क्रिन दायरा:",
    reachActive: "सक्रिय (१००%)",
    smoothingEngine: "स्मूथिंग इन्जिन:",
    filterName: "१€ फिल्टर (शून्य ढिलाइ)",
    lastClick: "पछिल्लो क्लिक:",
    modeMinimized: "मोड:",
    escToExit: "निस्कन Esc थिच्नुहोस्",
    toastPhysMouse: "भौतिक माउस भेटियो — सामान्य माउस मोडमा बदलियो",
    toastPhysClick: "भौतिक क्लिक भेटियो — माउसमा फर्कियो",
    toastRecentered: "कर्सर स्क्रिनको केन्द्रमा ल्याइयो",
    toastRecenteredShort: "कर्सर केन्द्रित भयो",
    titleResume: "हावामा क्लिक पुन: सुरु गर्नुहोस् (कुञ्जी: P)",
    titlePause: "हातको विश्रामका लागि क्लिक रोक्नुहोस् (कुञ्जी: P)",
    titleRecenter: "कर्सर स्क्रिनको केन्द्रमा ल्याउनुहोस् (कुञ्जी: C)",
    titleTargetMag: "लक्ष्य चुम्बकत्व: नजिकको बटनमा स्वत: जोडिन्छ",
    titleReturnMouse: "भौतिक माउसमा फर्कनुहोस्",
    titleExpandHud: "क्यामेरा HUD ठूलो बनाउनुहोस्",
    titleMinHud: "क्यामेरा HUD सानो बनाउनुहोस्",
    titleExitAir: "भर्चुअल एयर माउसबाट बाहिर निस्कनुहोस्",
  },
  mni: {
    restModeBadge: "পোথাবা মোদ (হৌদোক্নবা P নম্বিয়ু)",
    pinchBadge: "পিন্চ ক্লিক!",
    snappedBadge: "শম্নরে",
    pinchToClick: "ক্লিক তৌনবা খুৎচাং চিম্বিয়ু",
    pressSpaceEnter: "Space/Enter নম্বিয়ু",
    snappedToButton: "বটনদা শম্নরে",
    raiseHandPrompt: "কেমেরাগী মাংদা খুৎ য়াংখৎলু",
    resumeClickingBtn: "ক্লিক অমুক হৌবা (P)",
    restBtn: "পোথাবা (P)",
    recenterBtn: "ময়ায়দা পুরকপা (C)",
    autoSnapBadge: "ওতো-স্নেপ",
    useMouseBtn: "মাউস শিজিন্নবা",
    pausedTitle: "এয়র মাউস (লেপ্লি)",
    activeTitle: "এয়র মাউস (চৎলি)",
    initVision: "কেমেরা ভিজেন হৌরে...",
    pausedStatus: "লেপ্লি",
    noHandStatus: "খুৎ উদে",
    pinchStatus: "পিন্চ",
    dwellingStatus: "লেপ্পা ক্লিক",
    pinchReadyStatus: "পিন্চ শেম্লে",
    fullscreen100: "স্ক্রিন পুম্বা ১০০%",
    triggerMode: "ট্রিগর মোদ:",
    reach: "স্ক্রিনগী পন্থ:",
    reachActive: "চৎলি (১০০%)",
    smoothingEngine: "স্মুথিং ইঞ্জিন:",
    filterName: "১€ ফিল্তর (লেগ য়াওদবা)",
    lastClick: "অরোইবা ক্লিক:",
    modeMinimized: "মোদ:",
    escToExit: "থোক্নবা Esc নম্বিয়ু",
    toastPhysMouse: "মাউস থেংনরে — স্তেন্দর্দ মাউস মোদতা হোংলে",
    toastPhysClick: "মাউস ক্লিক থেংনরে — মাউসতা হঞ্জিন্লে",
    toastRecentered: "কর্সর স্ক্রিনগী ময়ায়দা পুরক্লে",
    toastRecenteredShort: "কর্সর ময়ায়দা হঞ্জিন্লে",
    titleResume: "হিংলবা ক্লিক অমুক হৌবা (কী: P)",
    titlePause: "খুৎ পোথানবা ক্লিক লেপ্লি (কী: P)",
    titleRecenter: "কর্সর ময়ায়দা পুরকপু (কী: C)",
    titleTargetMag: "টার্গেত মেগনেতিজম: বটনদা মশানা শম্নৈ",
    titleReturnMouse: "মাউসতা হঞ্জিল্লু",
    titleExpandHud: "কেমেরা HUD পাকথোকউ",
    titleMinHud: "কেমেরা HUD অপিকপা তৌ",
    titleExitAir: "ভর্চুএল এয়র মাউস থাদোকউ",
  },
  brx: {
    restModeBadge: "जिरायनाय म'ड (जाउनायनो P थु)",
    pinchBadge: "सुनाय क्लिक!",
    snappedBadge: "फोनांजाबाय",
    pinchToClick: "क्लिक खालामनो सुनानै हम",
    pressSpaceEnter: "Space/Enter थु",
    snappedToButton: "बथामाव फोनांजाबाय",
    raiseHandPrompt: "केमेरानि सिगाङाव आखाइ देखां",
    resumeClickingBtn: "क्लिक जागायफिन (P)",
    restBtn: "जिराय (P)",
    recenterBtn: "गेजेराव लाबो (C)",
    autoSnapBadge: "अत'-स्नेप",
    useMouseBtn: "माउस बाहाय",
    pausedTitle: "बार माउस (थाथ'नाय)",
    activeTitle: "बार माउस (मावफुं)",
    initVision: "केमेरा नुनाय जागायगासिनो...",
    pausedStatus: "थाथ'नाय",
    noHandStatus: "आखाइ नुनो मोनाखै",
    pinchStatus: "सुनाय",
    dwellingStatus: "थाथनाय क्लिक",
    pinchReadyStatus: "सुनायनो थियारि",
    fullscreen100: "गासै स्क्रिन १००%",
    triggerMode: "ट्रिगार म'ड:",
    reach: "स्क्रिननि सिमा:",
    reachActive: "मावफुं (१००%)",
    smoothingEngine: "स्मूथिंग इन्जिन:",
    filterName: "१€ फिल्टर (लेट गैयि)",
    lastClick: "जोबथा क्लिक:",
    modeMinimized: "म'ड:",
    escToExit: "ओंखारनो Esc थु",
    toastPhysMouse: "माउस मोन्दों — सरासनस्रा माउस म'डाव सोलायबाय",
    toastPhysClick: "माउस क्लिक मोन्दों — माउसाव गिदिंफिनबाय",
    toastRecentered: "कर्सरखौ स्क्रिननि गेजेराव लाबोबाय",
    toastRecenteredShort: "कर्सर गेजेराव लाबोबाय",
    titleResume: "बार क्लिक जागायफिन (P)",
    titlePause: "आखाइ जिरायनो क्लिक थाथ'हो (P)",
    titleRecenter: "कर्सरखौ गेजेराव लाबो (C)",
    titleTargetMag: "थामखि चुम्बकत्व: बथामाव गावआरि फोनांजायो",
    titleReturnMouse: "माउसाव थांफिन",
    titleExpandHud: "केमेरा HUD फेहेर",
    titleMinHud: "केमेरा HUD फिसा खालाम",
    titleExitAir: "बार माउसनिफ्राय ओंखार",
  },
  grt: {
    restModeBadge: "Neng·takaniko (P ko nang·atbo)",
    pinchBadge: "Pinch Doka!",
    snappedBadge: "Nangchaptokaha",
    pinchToClick: "Dokna jaksi pinch ka·bo",
    pressSpaceEnter: "Space/Enter ko nang·atbo",
    snappedToButton: "Button-o nangchaptokaha",
    raiseHandPrompt: "Camera mikkango jak de·do·bo",
    resumeClickingBtn: "Dokna A·bachengtaibo (P)",
    restBtn: "Neng·takbo (P)",
    recenterBtn: "Jatchio Donbo (C)",
    autoSnapBadge: "Auto-Snap",
    useMouseBtn: "Mouse ko Jakkalbo",
    pausedTitle: "Air Mouse (Dingtangataha)",
    activeTitle: "Air Mouse (Kam Ka·enga)",
    initVision: "Web Vision a·bachengenga...",
    pausedStatus: "DINGTANGATAHA",
    noHandStatus: "JAK NIKJA",
    pinchStatus: "PINCH",
    dwellingStatus: "DWELLING",
    pinchReadyStatus: "PINCH TARIAHA",
    fullscreen100: "FULL SCREEN 100%",
    triggerMode: "Trigger Mode:",
    reach: "Screen Sokani:",
    reachActive: "Kam Ka·enga (100%)",
    smoothingEngine: "Smoothing Engine:",
    filterName: "1€ Filter (Zero-Lag)",
    lastClick: "Bon·kamgipa click:",
    modeMinimized: "Mode:",
    escToExit: "Ong·katna Esc",
    toastPhysMouse: "Mouse nikaha — standard mouse mode-ona dingtangataha",
    toastPhysClick: "Mouse click nikaha — mouse-ona re·bapiltaiaha",
    toastRecentered: "Cursor-ko screen jatchio ditaiaha",
    toastRecenteredShort: "Cursor Jatchio Dona",
    titleResume: "Ku·chotgipa air click a·bachengtaibo (Key: P)",
    titlePause: "Jak neng·takna click dingtangatbo (Key: P)",
    titleRecenter: "Cursor-ko jatchio donbo (Key: C)",
    titleTargetMag: "Target Magnetism: Button-ona nangchapa",
    titleReturnMouse: "Mouse-ona re·bapilbo",
    titleExpandHud: "Camera HUD Dal·atbo",
    titleMinHud: "Camera HUD Chon·atbo",
    titleExitAir: "Virtual Air Mouse-ko watbo",
  },
  kha: {
    restModeBadge: "Shongthait Mode (P ban bteng)",
    pinchBadge: "Pinch Shon!",
    snappedBadge: "La snoh",
    pinchToClick: "Kti pinch ban shon",
    pressSpaceEnter: "Shon Space/Enter",
    snappedToButton: "La snoh ha ka button",
    raiseHandPrompt: "Rah kti hakhmat camera",
    resumeClickingBtn: "Bteng ban Shon (P)",
    restBtn: "Shongthait (P)",
    recenterBtn: "Pynphai Pdeng (C)",
    autoSnapBadge: "Auto-Snap",
    useMouseBtn: "Pyndonkam Mouse",
    pausedTitle: "Air Mouse (Pynsangeh)",
    activeTitle: "Air Mouse (Trei kam)",
    initVision: "Plie Web Vision...",
    pausedStatus: "PYNSANGEH",
    noHandStatus: "YM IOHI KTI",
    pinchStatus: "PINCH",
    dwellingStatus: "DWELLING",
    pinchReadyStatus: "PINCH LA KLOI",
    fullscreen100: "FULL SCREEN 100%",
    triggerMode: "Trigger Mode:",
    reach: "Jingkot Screen:",
    reachActive: "Trei kam (100%)",
    smoothingEngine: "Smoothing Engine:",
    filterName: "1€ Filter (Khlem sangeh)",
    lastClick: "Jingshon ba khatduh:",
    modeMinimized: "Mode:",
    escToExit: "Mih noh da Esc",
    toastPhysMouse: "Shem ia ka mouse — kylla sha standard mouse mode",
    toastPhysClick: "Shem jingkynjoh mouse — phai sha mouse",
    toastRecentered: "Kylliang cursor sha pdeng screen",
    toastRecenteredShort: "Cursor ha Pdeng",
    titleResume: "Bteng biang ban air click (Key: P)",
    titlePause: "Pynsangeh ban pynshait kti (Key: P)",
    titleRecenter: "Pynphai cursor sha pdeng (Key: C)",
    titleTargetMag: "Target Magnetism: Snoh hi ha ki button",
    titleReturnMouse: "Phai biang sha Mouse",
    titleExpandHud: "Pynheh Camera HUD",
    titleMinHud: "Pynrit Camera HUD",
    titleExitAir: "Mih na Virtual Air Mouse",
  },
  lus: {
    restModeBadge: "Chawlhhahdam Mode (Chhunzawm nan P hmet rawh)",
    pinchBadge: "Pinch Click!",
    snappedBadge: "Betei",
    pinchToClick: "Click turin kut zung chal leh zungpui chuktuah rawh",
    pressSpaceEnter: "Space/Enter hmet rawh",
    snappedToButton: "Button-ah a bet ta",
    raiseHandPrompt: "Camera hmaah kut phar rawh",
    resumeClickingBtn: "Click Chhunzawm (P)",
    restBtn: "Chawlhhahdam (P)",
    recenterBtn: "Lairila Dah (C)",
    autoSnapBadge: "Auto-Snap",
    useMouseBtn: "Mouse Hmang Rawh",
    pausedTitle: "Air Mouse (Chawlhlawk)",
    activeTitle: "Air Mouse (A kal mek)",
    initVision: "Web Vision buatsaih mek...",
    pausedStatus: "CHAWLHLAWK",
    noHandStatus: "KUT HMUH A NI LO",
    pinchStatus: "PINCH",
    dwellingStatus: "DWELLING",
    pinchReadyStatus: "PINCH THEIH TAWH",
    fullscreen100: "FULL SCREEN 100%",
    triggerMode: "Trigger Mode:",
    reach: "Screen Phak Chin:",
    reachActive: "Kal mek (100%)",
    smoothingEngine: "Smoothing Engine:",
    filterName: "1€ Filter (Tlai khawmuang lo)",
    lastClick: "Hmeh hnuhnun ber:",
    modeMinimized: "Mode:",
    escToExit: "Chhuah nan Esc",
    toastPhysMouse: "Mouse hmuh a ni — standard mouse mode-ah thlak a ni",
    toastPhysClick: "Mouse hmeh a ni — mouse pangngaiah let leh a ni",
    toastRecentered: "Cursor screen lairil-ah dah a ni",
    toastRecenteredShort: "Cursor Lairila Dah a ni",
    titleResume: "Borbanga click chhunzawmna (Hmeh tur: P)",
    titlePause: "Bana chawlhhahdam nana click chawlhlawk (Hmeh tur: P)",
    titleRecenter: "Cursor screen lai taka dah nan (Hmeh tur: C)",
    titleTargetMag: "Target Magnetism: Button hnaiha cursor man bet nghal",
    titleReturnMouse: "Mouse pangngaiah let leh rawh",
    titleExpandHud: "Camera HUD Tizau Rawh",
    titleMinHud: "Camera HUD Tite Rawh",
    titleExitAir: "Virtual Air Mouse chhuahsan rawh",
  },
};

export function VirtualAirMouse({
  active,
  onClose,
  dwellTimeMs = 1000,
  smoothing = 0.35,
  motionReach = 1.0,
  cursorSize = "large",
  cursorPace = "calm",
  clickMethod = "pinch", // Method B: Pinch Gesture Click default
  cameraViewMode = "pip",
  handoffPolicy = "auto",
  stickyMagnetism = true,
  audioTicks = true,
  onDwellClick,
  onHoverTarget,
}: VirtualAirMouseProps) {
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const t = AIR_MOUSE_I18N[normLoc] || AIR_MOUSE_I18N.en;

  // Cursor Screen Coordinates (Pixels)
  const [pointerPos, setPointerPos] = useState<{ x: number; y: number }>({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 400,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 300,
  });

  // Dwell, Snap, & Gesture State
  const [dwellProgress, setDwellProgress] = useState(0);
  const [isDwellActive, setIsDwellActive] = useState(false);
  const [isSnapped, setIsSnapped] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // Midas Touch Prevention (Rest Mode)
  const [lastClickedElement, setLastClickedElement] = useState<string | null>(null);
  const [isPinchingActive, setIsPinchingActive] = useState(false);
  const [isLocalMinimized, setIsLocalMinimized] = useState(false);
  const pipViewMode =
    cameraViewMode === "hidden" ? "hidden" : isLocalMinimized ? "minimized" : cameraViewMode;
  const [cameraStarted, setCameraStarted] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [hasHandInView, setHasHandInView] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Vision Tracker References & 1€ Filter State
  const trackerRef = useRef<OpticalMotionTracker | null>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const cursorDomRef = useRef<HTMLDivElement | null>(null);
  const filterRef = useRef<OneEuroFilter2D>(new OneEuroFilter2D(1.1, 0.025));

  const currentPosRef = useRef<{ x: number; y: number }>({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 400,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 300,
  });
  const lockedTargetRef = useRef<HTMLElement | null>(null);
  const dwellStartRef = useRef<number | null>(null);
  const dwellTargetRef = useRef<HTMLElement | null>(null);
  const highlightedElementRef = useRef<HTMLElement | null>(null);
  const lastTickQuarterRef = useRef<number>(0);
  const wasPinchingRef = useRef(false);
  const lastPinchTimeRef = useRef<number>(0);
  const lastMotionTimestampRef = useRef<number>(0);
  const activationTimeRef = useRef<number>(0);

  // Dynamic recalibration offset (centered when pressing 'C')
  const centerOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Update 1€ Filter parameters dynamically based on cursorPace & anti-tremor smoothing
  useEffect(() => {
    const baseCutoff = cursorPace === "calm" ? 0.9 : cursorPace === "gentle" ? 1.3 : 1.7;
    const tunedCutoff = Math.max(0.4, baseCutoff - smoothing * 0.5);
    const beta = cursorPace === "calm" ? 0.022 : cursorPace === "gentle" ? 0.038 : 0.06;
    filterRef.current.setParams(tunedCutoff, beta);
  }, [cursorPace, smoothing]);

  // Cursor Dimensions based on accessibility size
  const cursorDimensions = {
    normal: { size: 36, ring: 44, stroke: 3 },
    large: { size: 48, ring: 60, stroke: 4 },
    giant: { size: 64, ring: 80, stroke: 5 },
  }[cursorSize];

  // 1. MUTUAL EXCLUSION: Inject 'virtual-mouse-active' class on document to hide OS cursor
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (active) {
      activationTimeRef.current = performance.now();
      document.documentElement.classList.add("virtual-mouse-active");
      document.body.classList.add("virtual-mouse-active");
    } else {
      document.documentElement.classList.remove("virtual-mouse-active");
      document.body.classList.remove("virtual-mouse-active");
    }
    return () => {
      document.documentElement.classList.remove("virtual-mouse-active");
      document.body.classList.remove("virtual-mouse-active");
    };
  }, [active]);

  // Clean up highlighted target outline on unmount
  useEffect(() => {
    return () => {
      if (highlightedElementRef.current) {
        highlightedElementRef.current.style.removeProperty("outline");
        highlightedElementRef.current.style.removeProperty("boxShadow");
        highlightedElementRef.current = null;
      }
    };
  }, []);

  // 2. PHYSICAL MOUSE HANDOFF & KEYBOARD SHORTCUTS (ESC to Exit, P to Pause, C to Recenter)
  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    let lastPhysicalX = 0;
    let lastPhysicalY = 0;
    let accumulatedDist = 0;
    let lastMoveTime = performance.now();

    const handlePointerMove = (e: PointerEvent) => {
      if (!e.isTrusted) return;

      // Ignore physical mouse moves during the first 2000ms grace period
      if (performance.now() - activationTimeRef.current < 2000) {
        lastPhysicalX = e.clientX;
        lastPhysicalY = e.clientY;
        accumulatedDist = 0;
        return;
      }

      if (handoffPolicy === "auto") {
        const now = performance.now();
        if (lastPhysicalX !== 0 || lastPhysicalY !== 0) {
          const dx = e.clientX - lastPhysicalX;
          const dy = e.clientY - lastPhysicalY;
          const dist = Math.hypot(dx, dy);

          if (now - lastMoveTime < 400) {
            accumulatedDist += dist;
          } else {
            accumulatedDist = dist;
          }

          if (accumulatedDist > 120) {
            setToastMessage(t.toastPhysMouse);
            setTimeout(() => {
              onClose("physical_mouse_moved");
            }, 300);
            return;
          }
        }
        lastPhysicalX = e.clientX;
        lastPhysicalY = e.clientY;
        lastMoveTime = now;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (!e.isTrusted) return;

      if (performance.now() - activationTimeRef.current < 2000) {
        return;
      }

      const target = e.target as HTMLElement | null;
      if (
        target?.closest("#virtual-air-mouse-overlay") ||
        target?.closest("#air-mouse-pip-card") ||
        target?.closest("#air-mouse-rest-dock") ||
        target?.closest("button")?.innerText?.includes("Air Mouse")
      ) {
        return;
      }

      if (handoffPolicy === "auto") {
        setToastMessage(t.toastPhysClick);
        setTimeout(() => {
          onClose("physical_mouse_clicked");
        }, 200);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        playTapFeedback();
        onClose("escape_key");
      } else if (e.key === "p" || e.key === "P") {
        playTapFeedback();
        setIsPaused((prev) => !prev);
      } else if (e.key === "c" || e.key === "C") {
        // Recenter cursor
        playTapFeedback();
        centerOffsetRef.current = { x: 0, y: 0 };
        currentPosRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        setPointerPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        setToastMessage(t.toastRecentered);
        setTimeout(() => setToastMessage(null), 1800);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown, { capture: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown, { capture: true });
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [active, handoffPolicy, onClose]);

  // Helper to trigger target element click with visual tactile ripple
  const triggerClick = useCallback(
    (el: HTMLElement, source = "Dwell Click") => {
      playPress();

      el.classList.add("dwell-ripple-effect");
      setTimeout(() => {
        el.classList.remove("dwell-ripple-effect");
      }, 450);

      el.click();
      el.focus();
      onDwellClick?.(el);

      const elText =
        el.getAttribute("aria-label") ||
        el.innerText?.slice(0, 30) ||
        el.tagName;
      setLastClickedElement(`${source}: ${elText}`);
    },
    [onDwellClick]
  );

  // 3. Motion Event Handler from Vision Tracker with Full Screen Mapping & 1€ Filter
  const handleMotionEvent = useCallback(
    (evt: MotionEvent) => {
      if (!evt.hasMotion || typeof window === "undefined") {
        if (
          lastMotionTimestampRef.current !== 0 &&
          performance.now() - lastMotionTimestampRef.current > 1200
        ) {
          setHasHandInView(false);
        }
        return;
      }

      setHasHandInView(true);
      lastMotionTimestampRef.current = performance.now();

      // evt.x and evt.y are already remapped from the active camera box to full-screen space (0..1)
      let targetNormX = evt.x;
      let targetNormY = evt.y;

      // Apply reach multiplier centered at 0.5
      if (motionReach !== 1.0) {
        targetNormX = Math.max(0, Math.min(1, (targetNormX - 0.5) * motionReach + 0.5));
        targetNormY = Math.max(0, Math.min(1, (targetNormY - 0.5) * motionReach + 0.5));
      }

      // Convert to full-screen window screen pixels (spanning edge-to-edge!)
      const edgeMargin = 12;
      const targetPxX = Math.max(
        edgeMargin,
        Math.min(window.innerWidth - edgeMargin, targetNormX * window.innerWidth + centerOffsetRef.current.x)
      );
      const targetPxY = Math.max(
        edgeMargin,
        Math.min(window.innerHeight - edgeMargin, targetNormY * window.innerHeight + centerOffsetRef.current.y)
      );

      // 1€ Filter Smoothing: removes jitter at rest, zero lag when moving fast
      const smoothed = filterRef.current.filter(targetPxX, targetPxY, performance.now());
      let finalX = smoothed.x;
      let finalY = smoothed.y;
      let isTargetSnapped = false;

      // ── STICKY TARGET MAGNETISM WITH HYSTERESIS LOCK ──
      if (stickyMagnetism && !isPaused) {
        // If already locked on a target button, maintain hysteresis lock until deliberate pull-out
        if (lockedTargetRef.current && document.body.contains(lockedTargetRef.current)) {
          const rect = lockedTargetRef.current.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const distToCenter = Math.hypot(smoothed.x - centerX, smoothed.y - centerY);
          const breakoutRadius = Math.max(rect.width, rect.height) / 2 + 36;

          if (distToCenter < breakoutRadius) {
            // Strong hold inside button to absorb tremors
            finalX = centerX + (smoothed.x - centerX) * 0.18;
            finalY = centerY + (smoothed.y - centerY) * 0.18;
            isTargetSnapped = true;
          } else {
            // User intentionally pulled away: release lock
            lockedTargetRef.current = null;
          }
        }

        if (!isTargetSnapped) {
          // Proximity scan for nearest button within 85px
          const nearest = findNearestInteractiveTarget(smoothed.x, smoothed.y, 85);
          if (nearest) {
            if (nearest.isDirectHit || nearest.distance < 24) {
              lockedTargetRef.current = nearest.element;
              finalX = nearest.cx + (smoothed.x - nearest.cx) * 0.20;
              finalY = nearest.cy + (smoothed.y - nearest.cy) * 0.20;
              isTargetSnapped = true;
            } else {
              // Gentle magnetic glide towards target
              const pull = Math.pow(1 - nearest.distance / 85, 1.3) * 0.36;
              finalX = smoothed.x + (nearest.cx - smoothed.x) * pull;
              finalY = smoothed.y + (nearest.cy - smoothed.y) * pull;
            }
          }
        }
      }

      setIsSnapped(isTargetSnapped);

      // Direct GPU Transform Update (silky 60 FPS zero-lag rendering)
      if (cursorDomRef.current) {
        cursorDomRef.current.style.transform = `translate3d(${finalX}px, ${finalY}px, 0)`;
      }
      currentPosRef.current = { x: finalX, y: finalY };
      setPointerPos({ x: finalX, y: finalY });

      // Check Pinch Gesture Click (Method B)
      const isCurrentlyPinching = Boolean(
        evt.isPinching ||
        evt.gesture === "PINCH_GRAB" ||
        evt.leftHand?.isPinching ||
        evt.rightHand?.isPinching
      );
      setIsPinchingActive(isCurrentlyPinching);

      if (clickMethod === "pinch" && isCurrentlyPinching && !wasPinchingRef.current && !isPaused) {
        const now = performance.now();
        if (now - lastPinchTimeRef.current > 320) {
          lastPinchTimeRef.current = now;
          const target =
            lockedTargetRef.current ||
            dwellTargetRef.current ||
            findNearestInteractiveTarget(finalX, finalY, 60)?.element;

          if (target) {
            triggerClick(target, "Pinch Gesture");
          }
        }
      }
      wasPinchingRef.current = isCurrentlyPinching;

      // Draw live mirror webcam video and hand tracking reticle to PIP canvas
      if (videoCanvasRef.current && pipViewMode === "pip") {
        const canvas = videoCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const videoEl = trackerRef.current?.getVideoElement();
          if (videoEl && videoEl.readyState >= 2) {
            ctx.save();
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
            ctx.restore();
          } else {
            ctx.fillStyle = "#111827";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          // Draw Active Interaction Bounding Box (Visual Map to Full Screen)
          if (evt.camBounds) {
            const b = evt.camBounds;
            const bx = b.minX * canvas.width;
            const by = b.minY * canvas.height;
            const bw = (b.maxX - b.minX) * canvas.width;
            const bh = (b.maxY - b.minY) * canvas.height;

            ctx.save();
            ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(bx, by, bw, bh);
            ctx.restore();
          }

          // Draw Tracking Markers on Hand
          if (evt.thumbTip && evt.indexTip) {
            const tX = evt.thumbTip.x * canvas.width;
            const tY = evt.thumbTip.y * canvas.height;
            const iX = evt.indexTip.x * canvas.width;
            const iY = evt.indexTip.y * canvas.height;

            // Pinch Connection Line
            ctx.beginPath();
            ctx.moveTo(tX, tY);
            ctx.lineTo(iX, iY);
            ctx.strokeStyle = isCurrentlyPinching ? "#10B981" : "#F59E0B";
            ctx.lineWidth = isCurrentlyPinching ? 4 : 2;
            ctx.stroke();

            // Thumb marker (Blue)
            ctx.beginPath();
            ctx.arc(tX, tY, 5, 0, Math.PI * 2);
            ctx.fillStyle = "#3B82F6";
            ctx.fill();

            // Index marker (Amber or Emerald upon Pinch)
            ctx.beginPath();
            ctx.arc(iX, iY, 5, 0, Math.PI * 2);
            ctx.fillStyle = isCurrentlyPinching ? "#10B981" : "#F59E0B";
            ctx.fill();
          } else {
            const reticleX = (evt.rawCamX ?? evt.x) * canvas.width;
            const reticleY = (evt.rawCamY ?? evt.y) * canvas.height;

            ctx.beginPath();
            ctx.arc(reticleX, reticleY, 15, 0, Math.PI * 2);
            ctx.strokeStyle = isCurrentlyPinching ? "#10B981" : isTargetSnapped ? "#3B82F6" : "#F59E0B";
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(reticleX, reticleY, 4, 0, Math.PI * 2);
            ctx.fillStyle = isCurrentlyPinching ? "#10B981" : "#EF4444";
            ctx.fill();
          }
        }
      }
    },
    [motionReach, clickMethod, stickyMagnetism, pipViewMode, isPaused, triggerClick]
  );

  // 4. Initialize Optical / MediaPipe Motion Tracker
  useEffect(() => {
    let isMounted = true;

    if (!active) {
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
      return;
    }

    unlockAudio();
    const tracker = new OpticalMotionTracker(handleMotionEvent, 0.32);
    trackerRef.current = tracker;

    tracker
      .start()
      .then((started) => {
        if (!isMounted) return;
        if (started) {
          setCameraStarted(true);
          setCameraError(null);
        } else {
          setCameraStarted(false);
          setCameraError("Camera permission denied or camera not found.");
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setCameraStarted(false);
        setCameraError(String(err));
      });

    return () => {
      isMounted = false;
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
    };
  }, [active, handleMotionEvent]);

  // 5. Hit Detection, Target Highlighting, & Dwell-Click Loop
  useEffect(() => {
    if (!active || typeof window === "undefined") return;

    const checkDwell = () => {
      const cur = currentPosRef.current;
      const x = cur.x;
      const y = cur.y;

      const elements = document.elementsFromPoint(x, y);
      let targetElement = (elements.find((el) => {
        if (
          el.closest("#virtual-air-mouse-overlay") ||
          el.closest("#air-mouse-pip-card") ||
          el.closest("#air-mouse-rest-dock")
        ) {
          return false;
        }
        return (
          el.tagName === "BUTTON" ||
          el.tagName === "A" ||
          el.getAttribute("role") === "button" ||
          el.getAttribute("tabIndex") !== null ||
          el.classList.contains("cursor-pointer") ||
          el.classList.contains("btn-tactile") ||
          el.classList.contains("game-card") ||
          el.tagName === "INPUT" ||
          el.tagName === "SELECT"
        );
      }) || null) as HTMLElement | null;

      if (!targetElement && lockedTargetRef.current) {
        targetElement = lockedTargetRef.current;
      }

      onHoverTarget?.(targetElement);

      // Manage high-contrast target highlight outline
      if (highlightedElementRef.current && highlightedElementRef.current !== targetElement) {
        highlightedElementRef.current.style.removeProperty("outline");
        highlightedElementRef.current.style.removeProperty("boxShadow");
        highlightedElementRef.current = null;
      }

      if (targetElement && !isPaused) {
        targetElement.style.outline = "3px solid #F59E0B";
        targetElement.style.boxShadow = "0 0 16px rgba(245, 158, 11, 0.5)";
        highlightedElementRef.current = targetElement;
        dwellTargetRef.current = targetElement;

        // In Dwell Click Mode, run timer if not paused
        if (clickMethod === "dwell") {
          const rect = targetElement.getBoundingClientRect();
          const isInsideTolerance =
            x >= rect.left - 18 &&
            x <= rect.right + 18 &&
            y >= rect.top - 18 &&
            y <= rect.bottom + 18;

          if (!dwellStartRef.current || !isInsideTolerance) {
            dwellStartRef.current = performance.now();
            lastTickQuarterRef.current = 0;
            setIsDwellActive(true);
            setDwellProgress(0);
          } else {
            const elapsed = performance.now() - dwellStartRef.current;
            const pct = Math.min(100, Math.round((elapsed / dwellTimeMs) * 100));
            setDwellProgress(pct);

            if (audioTicks) {
              const currentQuarter = Math.floor(pct / 25);
              if (currentQuarter > lastTickQuarterRef.current && currentQuarter < 4) {
                lastTickQuarterRef.current = currentQuarter;
                playDwellTick(pct);
              }
            }

            if (pct >= 100) {
              triggerClick(targetElement, "Dwell");
              dwellStartRef.current = performance.now() + 650;
              lastTickQuarterRef.current = 0;
              setDwellProgress(0);
              setIsDwellActive(false);
            }
          }
        } else {
          setIsDwellActive(true);
          setDwellProgress(100);
        }
      } else {
        dwellStartRef.current = null;
        dwellTargetRef.current = null;
        lastTickQuarterRef.current = 0;
        setIsDwellActive(false);
        setDwellProgress(0);
      }
    };

    const intervalId = setInterval(checkDwell, 25);
    return () => clearInterval(intervalId);
  }, [
    active,
    dwellTimeMs,
    clickMethod,
    isPaused,
    audioTicks,
    onHoverTarget,
    triggerClick,
  ]);

  // 6. Keyboard Tap-to-Click in 'key' mode
  useEffect(() => {
    if (!active || clickMethod !== "key" || typeof window === "undefined" || isPaused) return;

    const handleKeyClick = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "Enter") {
        if (
          document.activeElement?.tagName === "INPUT" ||
          document.activeElement?.tagName === "TEXTAREA"
        ) {
          return;
        }
        if (dwellTargetRef.current) {
          e.preventDefault();
          triggerClick(dwellTargetRef.current, "Key Tap");
        }
      }
    };

    window.addEventListener("keydown", handleKeyClick);
    return () => window.removeEventListener("keydown", handleKeyClick);
  }, [active, clickMethod, isPaused, triggerClick]);

  if (!active) return null;

  const ringColor = dwellProgress > 70 ? "#10B981" : "#F59E0B";

  return (
    <div id="virtual-air-mouse-overlay" className="pointer-events-none fixed inset-0 z-9999 select-none">
      {/* ── 1. GLOWING HIGH-CONTRAST AIR POINTER CURSOR (GPU HARDWARE ACCELERATED) ── */}
      <div
        ref={cursorDomRef}
        className="pointer-events-none fixed top-0 left-0 will-change-transform"
        style={{
          transform: `translate3d(${pointerPos.x}px, ${pointerPos.y}px, 0)`,
        }}
      >
        {/* Outer Pulsing Glow */}
        <div
          className={`absolute rounded-full transition-all duration-200 ${
            isPaused
              ? "bg-slate-400/30 ring-2 ring-slate-400"
              : isSnapped
              ? "bg-sky-400/50 ring-4 ring-sky-400 scale-110 animate-pulse"
              : isPinchingActive
              ? "bg-emerald-400/60 ring-6 ring-emerald-400 animate-pulse scale-130"
              : isDwellActive
              ? dwellProgress > 70
                ? "bg-emerald-400/40 ring-4 ring-emerald-400 animate-pulse scale-115"
                : "bg-amber-400/40 ring-4 ring-amber-400 animate-pulse scale-110"
              : "bg-teal-400/25 ring-2 ring-teal-300"
          }`}
          style={{
            width: `${cursorDimensions.ring}px`,
            height: `${cursorDimensions.ring}px`,
            top: `-${cursorDimensions.ring / 2}px`,
            left: `-${cursorDimensions.ring / 2}px`,
          }}
        />

        {/* SVG Radial Dwell Progress Ring */}
        {clickMethod === "dwell" && !isPaused && (
          <svg
            className="absolute -rotate-90 pointer-events-none"
            width={cursorDimensions.ring}
            height={cursorDimensions.ring}
            style={{
              top: `-${cursorDimensions.ring / 2}px`,
              left: `-${cursorDimensions.ring / 2}px`,
            }}
          >
            <circle
              cx={cursorDimensions.ring / 2}
              cy={cursorDimensions.ring / 2}
              r={cursorDimensions.ring / 2 - 4}
              fill="none"
              stroke="rgba(0,0,0,0.5)"
              strokeWidth={cursorDimensions.stroke}
            />
            <circle
              cx={cursorDimensions.ring / 2}
              cy={cursorDimensions.ring / 2}
              r={cursorDimensions.ring / 2 - 4}
              fill="none"
              stroke={ringColor}
              strokeWidth={cursorDimensions.stroke}
              strokeDasharray={Math.PI * (cursorDimensions.ring - 8)}
              strokeDashoffset={
                Math.PI * (cursorDimensions.ring - 8) * (1 - dwellProgress / 100)
              }
              strokeLinecap="round"
              className="transition-all duration-75"
            />
          </svg>
        )}

        {/* Inner Tactile Hand Pointer Icon */}
        <div
          className={`flex items-center justify-center rounded-full border-3 border-black text-black shadow-[3px_3px_0px_#000] ${
            isPaused
              ? "bg-slate-200 text-slate-700"
              : isPinchingActive
              ? "bg-emerald-400 ring-2 ring-emerald-500 scale-110"
              : isSnapped
              ? "bg-sky-300 ring-2 ring-sky-400"
              : dwellProgress > 70
              ? "bg-emerald-300"
              : "bg-amber-300"
          }`}
          style={{
            width: `${cursorDimensions.size}px`,
            height: `${cursorDimensions.size}px`,
            marginLeft: `-${cursorDimensions.size / 2}px`,
            marginTop: `-${cursorDimensions.size / 2}px`,
          }}
        >
          {isPaused ? (
            <Pause className="h-4 w-4 stroke-[2.5]" />
          ) : isSnapped ? (
            <Magnet className="h-4 w-4 stroke-[2.5] text-sky-950" />
          ) : clickMethod === "pinch" ? (
            <Sparkles className="h-5 w-5 stroke-[2.5]" />
          ) : (
            <Hand className="h-5 w-5 stroke-[2.5]" />
          )}
        </div>

        {/* Live Action Hint / Percentage Badge */}
        {isPaused ? (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-black bg-slate-100 px-2 py-0.5 text-[10px] font-black text-slate-800 shadow-[2px_2px_0px_#000]">
            {t.restModeBadge}
          </div>
        ) : isPinchingActive ? (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-black bg-emerald-300 px-2 py-0.5 text-[10px] font-black text-emerald-950 shadow-[2px_2px_0px_#000] animate-bounce">
            {t.pinchBadge}
          </div>
        ) : isDwellActive ? (
          <div
            className={`absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-black px-2 py-0.5 text-[10px] font-black shadow-[2px_2px_0px_#000] ${
              dwellProgress > 70
                ? "bg-emerald-200 text-emerald-950"
                : isSnapped
                ? "bg-sky-100 text-sky-950"
                : "bg-white text-ink"
            }`}
          >
            {clickMethod === "dwell"
              ? isSnapped ? `${t.snappedBadge} ${dwellProgress}%` : `${dwellProgress}%`
              : clickMethod === "pinch"
              ? t.pinchToClick
              : t.pressSpaceEnter}
          </div>
        ) : isSnapped ? (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-black bg-sky-100 px-2 py-0.5 text-[10px] font-black text-sky-950 shadow-[2px_2px_0px_#000]">
            {t.snappedToButton}
          </div>
        ) : !hasHandInView ? (
          <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-black bg-amber-100 px-2 py-0.5 text-[10px] font-black text-amber-950 shadow-[2px_2px_0px_#000] animate-bounce">
            {t.raiseHandPrompt}
          </div>
        ) : null}
      </div>

      {/* ── 2. TOAST NOTIFICATION (Physical Handoff Alert / Center Toast) ── */}
      {toastMessage && (
        <div className="pointer-events-none fixed top-16 left-1/2 -translate-x-1/2 z-10001 animate-bounce rounded-2xl border-3 border-black bg-white px-4 py-2 text-xs font-black text-ink shadow-[4px_4px_0px_#000] flex items-center gap-2">
          <MousePointer className="h-4 w-4 text-tea" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ── 3. FLOATING REST & RECENTER DOCK ── */}
      <div
        id="air-mouse-rest-dock"
        className="pointer-events-auto fixed top-12 left-1/2 -translate-x-1/2 z-10000 flex items-center gap-2 rounded-2xl border-3 border-black bg-white/95 px-3 py-1.5 shadow-[4px_4px_0px_#000] backdrop-blur-xs"
      >
        <button
          type="button"
          onClick={() => {
            playTapFeedback();
            setIsPaused(!isPaused);
          }}
          className={`flex items-center gap-1.5 rounded-xl border-2 border-black px-2.5 py-1 text-xs font-black cursor-pointer transition-colors ${
            isPaused
              ? "bg-emerald-400 text-black shadow-xs ring-2 ring-emerald-300"
              : "bg-amber-300 text-black hover:bg-amber-400 shadow-xs"
          }`}
          title={isPaused ? t.titleResume : t.titlePause}
        >
          {isPaused ? <Play className="h-3.5 w-3.5 fill-black" /> : <Pause className="h-3.5 w-3.5" />}
          <span>{isPaused ? t.resumeClickingBtn : t.restBtn}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTapFeedback();
            centerOffsetRef.current = { x: 0, y: 0 };
            currentPosRef.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
            setPointerPos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
            setToastMessage(t.toastRecenteredShort);
            setTimeout(() => setToastMessage(null), 1500);
          }}
          className="flex items-center gap-1 rounded-xl border border-black/40 bg-surface px-2 py-1 text-[11px] font-bold text-ink hover:bg-surface-muted cursor-pointer"
          title={t.titleRecenter}
        >
          <Crosshair className="h-3 w-3 text-tea" />
          <span>{t.recenterBtn}</span>
        </button>

        {stickyMagnetism && (
          <span
            className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-tea bg-tea-light rounded-lg px-2 py-0.5 border border-tea/30"
            title={t.titleTargetMag}
          >
            <Magnet className="h-3 w-3 text-sky-600" /> {t.autoSnapBadge}
          </span>
        )}

        <button
          type="button"
          onClick={() => {
            playPress();
            onClose("rest_dock_exit");
          }}
          className="flex items-center gap-1 rounded-xl border border-black/40 bg-surface px-2 py-1 text-[11px] font-bold text-ink hover:bg-surface-muted cursor-pointer"
          title={t.titleReturnMouse}
        >
          <span>{t.useMouseBtn}</span>
        </button>
      </div>

      {/* ── 4. PICTURE-IN-PICTURE (PIP) CAMERA TRACKING HUD ── */}
      {pipViewMode !== "hidden" && (
        <div
          id="air-mouse-pip-card"
          className="pointer-events-auto fixed bottom-6 left-6 z-10000 flex max-w-[calc(100vw-1.5rem)] flex-col rounded-2xl border-4 border-black bg-[#FAF6F0] p-3 shadow-[6px_6px_0px_#000] transition-all"
          style={{ width: pipViewMode === "minimized" ? "190px" : "250px" }}
        >
          {/* PIP Header */}
          <div className="flex items-center justify-between border-b-2 border-black/15 pb-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-2.5 w-2.5 rounded-full ${
                  isPaused
                    ? "bg-slate-400"
                    : hasHandInView
                    ? "bg-emerald-500 animate-ping"
                    : "bg-amber-500 animate-pulse"
                }`}
              />
              <span className="text-xs font-black uppercase text-ink flex items-center gap-1">
                <Hand className="h-3.5 w-3.5 text-tea" />
                <span>{isPaused ? t.pausedTitle : t.activeTitle}</span>
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  playTapFeedback();
                  setIsLocalMinimized(!isLocalMinimized);
                }}
                className="flex h-6 w-6 items-center justify-center rounded-lg border border-black bg-white text-ink hover:bg-amber-100 cursor-pointer"
                title={pipViewMode === "minimized" ? t.titleExpandHud : t.titleMinHud}
              >
                {pipViewMode === "minimized" ? (
                  <Maximize2 className="h-3 w-3 stroke-[2.5]" />
                ) : (
                  <Minimize2 className="h-3 w-3 stroke-[2.5]" />
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  playPress();
                  onClose("close_button");
                }}
                className="flex h-6 w-6 items-center justify-center rounded-lg border border-black bg-white text-ink hover:bg-rose-500 hover:text-white cursor-pointer"
                title={t.titleExitAir}
              >
                <X className="h-3 w-3 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Camera Canvas Stream & Status */}
          {pipViewMode === "pip" && (
            <>
              <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border-2 border-black bg-black">
                {cameraStarted ? (
                  <canvas
                    ref={videoCanvasRef}
                    width={240}
                    height={180}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center p-2 text-center text-white">
                    <Hand className="h-8 w-8 animate-bounce text-amber-400" />
                    <span className="mt-1 text-[11px] font-bold">
                      {cameraError || t.initVision}
                    </span>
                  </div>
                )}

                {/* Status overlay on camera */}
                <div className="absolute top-1.5 right-1.5 rounded-md border border-black bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-black">
                  {isPaused
                    ? t.pausedStatus
                    : !hasHandInView
                    ? t.noHandStatus
                    : isSnapped
                    ? t.snappedBadge
                    : isPinchingActive
                    ? t.pinchStatus
                    : isDwellActive
                    ? clickMethod === "dwell"
                      ? `${t.dwellingStatus} (${dwellProgress}%)`
                      : t.pinchReadyStatus
                    : t.fullscreen100}
                </div>
              </div>

              <div className="mt-2 space-y-1 text-[10px] font-bold text-ink-secondary">
                <div className="flex items-center justify-between">
                  <span>{t.triggerMode}</span>
                  <span className="font-black text-tea uppercase">{clickMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t.reach}</span>
                  <span className="font-black text-emerald-600">{t.reachActive}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>{t.smoothingEngine}</span>
                  <span className="font-black text-ink">{t.filterName}</span>
                </div>
                {lastClickedElement && (
                  <div className="truncate rounded bg-amber-100 px-1.5 py-0.5 text-amber-950">
                    {t.lastClick} <span className="font-black">{lastClickedElement}</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Minimal View Footer */}
          {pipViewMode === "minimized" && (
            <div className="text-[10px] font-bold text-ink-secondary flex items-center justify-between">
              <span>{isPaused ? t.pausedStatus : `${t.modeMinimized} ${clickMethod.toUpperCase()}`}</span>
              <span className="text-black/50">{t.escToExit}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
