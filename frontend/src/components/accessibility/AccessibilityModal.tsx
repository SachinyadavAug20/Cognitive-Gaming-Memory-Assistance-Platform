"use client";

import React from "react";
import { useLocale } from "next-intl";
import {
  Hand,
  Volume2,
  Keyboard,
  Eye,
  Moon,
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

interface A11yModalStrings {
  title: string;
  badge: string;
  sub: string;
  closeAria: string;
  primaryModeTitle: string;
  noConflictBadge: string;
  primaryModeDesc: string;
  physicalTitle: string;
  physicalDesc: string;
  airTitle: string;
  airDesc: string;
  activeDriver: string;
  escToExit: string;
  airOptionsTitle: string;
  keyHelp: string;
  clickMethodTitle: string;
  dwellLabel: string;
  dwellDesc: string;
  pinchLabel: string;
  pinchDesc: string;
  tapKeyLabel: string;
  tapKeyDesc: string;
  dwellSpeedTitle: string;
  seconds: string;
  dwellFast: string;
  dwellStd: string;
  dwellElder: string;
  antiTremorTitle: string;
  tremorLight: string;
  tremorStd: string;
  tremorHeavy: string;
  motionReachTitle: string;
  motionStd: string;
  motionWide: string;
  paceTitle: string;
  paceCalmLabel: string;
  paceCalmSub: string;
  paceGentleLabel: string;
  paceGentleSub: string;
  paceRespLabel: string;
  paceRespSub: string;
  camHudTitle: string;
  camPip: string;
  camBadge: string;
  camHidden: string;
  camDiscreetNote: string;
  handoffTitle: string;
  handoffAuto: string;
  handoffStrict: string;
  stickyTitle: string;
  stickyBadge: string;
  stickyDesc: string;
  audioTicksTitle: string;
  audioTicksDesc: string;
  pointerSizeTitle: string;
  sizeNormal: string;
  sizeLarge: string;
  sizeGiant: string;
  enabled: string;
  turnOn: string;
  listenTitle: string;
  listenDesc: string;
  kbdTitle: string;
  kbdDesc: string;
  kbdFocus: string;
  kbdSelect: string;
  kbdToggleAir: string;
  kbdExitAir: string;
  visionTitle: string;
  visionDesc: string;
  nightTitle: string;
  nightDesc: string;
  nightOn: string;
  enableNight: string;
  fontSizeTitle: string;
  saveReturn: string;
}

const A11Y_MODAL_I18N: Record<string, A11yModalStrings> = {
  en: {
    title: "Elder Accessibility Suite",
    badge: "WCAG AAA",
    sub: "Input Mode Isolation • OpenCV Vision • Voice Narration",
    closeAria: "Close Accessibility Settings",
    primaryModeTitle: "Primary Input Mode (One at a Time)",
    noConflictBadge: "Zero Dual-Cursor Conflict",
    primaryModeDesc: "Choose either standard physical mouse or OpenCV in-air hand tracking. Both will never conflict simultaneously.",
    physicalTitle: "1. Physical Mouse",
    physicalDesc: "Standard OS mouse, trackpad, or touchscreen. Zero camera overhead.",
    airTitle: "2. Virtual Air Mouse",
    airDesc: "OpenCV hand tracking. Physical pointer is hidden; single in-air pointer.",
    activeDriver: "Active Driver",
    escToExit: "(Esc to exit)",
    airOptionsTitle: "Virtual Air Mouse Configuration Options",
    keyHelp: "Key: M or Esc",
    clickMethodTitle: "Click Trigger Method:",
    dwellLabel: "Dwell Click",
    dwellDesc: "Hold steady to click",
    pinchLabel: "Pinch Click",
    pinchDesc: "Thumb & finger pinch",
    tapKeyLabel: "Tap Key",
    tapKeyDesc: "Space / Enter to click",
    dwellSpeedTitle: "Dwell Click Speed:",
    seconds: "seconds",
    dwellFast: "Fast (0.6s)",
    dwellStd: "Standard (1.0s)",
    dwellElder: "Relaxed Elder (2.2s)",
    antiTremorTitle: "Anti-Tremor Damping (Parkinson's Filter):",
    tremorLight: "Light (Fast response)",
    tremorStd: "Moderate (Standard)",
    tremorHeavy: "Heavy (Max anti-shake)",
    motionReachTitle: "Motion Reach (Range of Arm Movement):",
    motionStd: "Standard (1.0x)",
    motionWide: "Wide Reach (1.5x) - Small moves cover screen",
    paceTitle: "Cursor Movement Pace (Speed & Smoothness):",
    paceCalmLabel: "Calm & Slow",
    paceCalmSub: "Elder Friendly (Max Steady)",
    paceGentleLabel: "Gentle",
    paceGentleSub: "Standard Fluid Glide",
    paceRespLabel: "Responsive",
    paceRespSub: "Fast Response",
    camHudTitle: "Webcam Preview HUD:",
    camPip: "Full Camera PIP",
    camBadge: "Compact Badge",
    camHidden: "Hidden (Discreet)",
    camDiscreetNote: "Discreet mode: Zero camera video is shown on screen; only the hand pointer moves. Ideal for patients with anxiety.",
    handoffTitle: "Physical Mouse Handoff Policy:",
    handoffAuto: "Auto-Switch (Moving mouse returns to mouse)",
    handoffStrict: "Strict Lockout (Exit via Esc or M only)",
    stickyTitle: "Sticky Target Magnetism (Tremor Lock)",
    stickyBadge: "WCAG AAA",
    stickyDesc: "Gently pulls pointer towards buttons to keep dwell steady against hand tremors",
    audioTicksTitle: "Auditory Dwell Ticks",
    audioTicksDesc: "Subtle rising audio ticks at 25%, 50%, 75% as the dwell ring fills",
    pointerSizeTitle: "Pointer Size:",
    sizeNormal: "Normal",
    sizeLarge: "Large",
    sizeGiant: "Giant",
    enabled: "Enabled",
    turnOn: "Turn On",
    listenTitle: "Listen-First Audio Narration",
    listenDesc: "Automatically speaks hovered cards & focused elements in active regional language",
    kbdTitle: "Keyboard Switch Shortcuts",
    kbdDesc: "Direct physical keyboard and assistive switch controller mapping",
    kbdFocus: "Move Focus",
    kbdSelect: "Select / Click",
    kbdToggleAir: "Toggle Air Mouse",
    kbdExitAir: "Exit Air Mouse",
    visionTitle: "Visual & Circadian Ergonomics",
    visionDesc: "Circadian night readability (zero blue light, sleep-safe) and text magnifier",
    nightTitle: "Circadian Night Mode",
    nightDesc: "Deep espresso, roasted walnut & zero blue/cyan light",
    nightOn: "Night: ON",
    enableNight: "Enable Night Mode",
    fontSizeTitle: "Font Size Magnifier",
    saveReturn: "Save & Return to Care",
  },
  as: {
    title: "জেষ্ঠ্য সুচলতা আৰু প্ৰৱেশাধিকাৰ চুইট",
    badge: "WCAG AAA",
    sub: "ইনপুট ম'ড সুৰক্ষা • অপেন-চিভি দৃষ্টি • কথন সহায়",
    closeAria: "সুচলতা ছেটিংছ বন্ধ কৰক",
    primaryModeTitle: "মুখ্য ইনপুট ম'ড (এক সময়ত এটা)",
    noConflictBadge: "দ্বৈত-কাৰ্ছাৰ সংঘাতহীন",
    primaryModeDesc: "সাধাৰণ মাউছ বা অপেন-চিভি বায়বীয় হাতৰ ট্ৰেকিং বাছক। দুয়োটা কেতিয়াও একেলগে সংঘাত নকৰে।",
    physicalTitle: "১. ভৌতিক মাউছ",
    physicalDesc: "সাধাৰণ মাউছ, ট্ৰেকপেড বা টাচস্ক্ৰিন। কেমেৰাৰ প্ৰয়োজন নাই।",
    airTitle: "২. ভাৰ্চুৱেল এয়াৰ মাউছ",
    airDesc: "অপেন-চিভি হাতৰ ভংগীমা। ভৌতিক পইণ্টাৰ লুকাই থাকে; কেৱল শূন্যত হাতৰ পইণ্টাৰ।",
    activeDriver: "সক্ৰিয় ড্ৰাইভাৰ",
    escToExit: "(ওলাই যাবলৈ Esc)",
    airOptionsTitle: "ভাৰ্চুৱেল এয়াৰ মাউছ সংৰূপ বিকল্প",
    keyHelp: "কী: M বা Esc",
    clickMethodTitle: "ক্লিক ট্ৰিগাৰ পদ্ধতি:",
    dwellLabel: "স্থিৰ ক্লিক (Dwell)",
    dwellDesc: "ক্লিক কৰিবলৈ স্থিৰ ৰাখক",
    pinchLabel: "টিপ মৰা ক্লিক (Pinch)",
    pinchDesc: "বুঢ়া আৰু তৰ্জনী আঙুলিৰ টিপ",
    tapKeyLabel: "কী টিপক (Tap Key)",
    tapKeyDesc: "স্পেচ / এণ্টাৰ টিপি ক্লিক",
    dwellSpeedTitle: "স্থিৰ ক্লিকৰ গতি:",
    seconds: "ছেকেণ্ড",
    dwellFast: "দ্ৰুত (০.৬ ছে.)",
    dwellStd: "সাধাৰণ (১.০ ছে.)",
    dwellElder: "জ্যেষ্ঠ প্ৰশস্ত (২.২ ছে.)",
    antiTremorTitle: "কম্পন প্ৰতিৰোধক ফিল্টাৰ (পাৰ্কিনছন ফিল্টাৰ):",
    tremorLight: "লঘু (দ্ৰুত সঁহাৰি)",
    tremorStd: "মধ্যম (মান্য)",
    tremorHeavy: "গধুৰ (সৰ্বাধিক স্থিৰতা)",
    motionReachTitle: "হাত লৰচৰৰ সীমা (Motion Reach):",
    motionStd: "সাধাৰণ (১.০x)",
    motionWide: "প্ৰশস্ত পৰিসৰ (১.৫x) - সামান্য লৰচৰতে স্ক্ৰিন আৱৰে",
    paceTitle: "কাৰ্ছাৰ গতিৰ ছন্দ (গতি আৰু মসৃণতা):",
    paceCalmLabel: "শান্ত আৰু ধীৰ",
    paceCalmSub: "জ্যেষ্ঠ অনুকূল (সৰ্বোচ্চ স্থিৰ)",
    paceGentleLabel: "নম্ৰ",
    paceGentleSub: "মানক মসৃণ চলন",
    paceRespLabel: "দ্ৰুত সঁহাৰিদায়ক",
    paceRespSub: "চঞ্চল সঁহাৰি",
    camHudTitle: "ৱেবকেম পূৰ্বদৃশ্য HUD:",
    camPip: "পূৰ্ণ কেমেৰা PIP",
    camBadge: "সংক্ষিপ্ত ব্যাজ",
    camHidden: "গোপন (শান্ত)",
    camDiscreetNote: "গোপন ম'ড: স্ক্ৰিনত কোনো কেমেৰা ভিডিঅ' নেদেখুৱায়; কেৱল পইণ্টাৰ চলে। উদ্বিগ্ন ৰোগীৰ বাবে উত্তম।",
    handoffTitle: "মাউছ সলনিৰ নীতি:",
    handoffAuto: "স্বয়ং সলনি (মাউছ লৰালে মাউছলৈ ওভতে)",
    handoffStrict: "কঠোৰ লক (কেৱল Esc বা M টিপিলে ওলায়)",
    stickyTitle: "চুম্বকীয় লক্ষ্য আকৰ্ষণ (Tremor Lock)",
    stickyBadge: "WCAG AAA",
    stickyDesc: "হাত কঁপিলেও বুটামত সহজে স্থিৰ হৈ থাকিবলৈ পইণ্টাৰক আকৰ্ষণ কৰে",
    audioTicksTitle: "শ্ৰৱণযোগ্য ক্লিক প্ৰগতি টিক",
    audioTicksDesc: "ক্লিক ৰিং পূৰ্ণ হোৱাৰ লগে লগে ২৫%, ৫০%, ৭৫% ত কোমল ধ্বনি",
    pointerSizeTitle: "পইণ্টাৰৰ আকাৰ:",
    sizeNormal: "সাধাৰণ",
    sizeLarge: "ডাঙৰ",
    sizeGiant: "অতি বৃহৎ",
    enabled: "সক্ৰিয়",
    turnOn: "অন কৰক",
    listenTitle: "শ্ৰৱণ-প্ৰথম কথন সহায় (Listen-First)",
    listenDesc: "মাউছ নিয়া কাৰ্ড আৰু উপাদানসমূহ স্বয়ংক্ৰিয়ভাৱে আঞ্চলিক ভাষাত পঢ়ি শুনায়",
    kbdTitle: "কীবোৰ্ড ছুইচ চৰ্টকাট",
    kbdDesc: "ভৌতিক কীবোৰ্ড আৰু সহায়ক ছুইচ নিয়ন্ত্ৰক সংযোগ",
    kbdFocus: "ফ'কাচ সলনি",
    kbdSelect: "বাছক / ক্লিক",
    kbdToggleAir: "এয়াৰ মাউছ অন/অফ",
    kbdExitAir: "এয়াৰ মাউছ বন্ধ",
    visionTitle: "দৃষ্টি আৰু বৃত্তীয় এৰ্গ'নমিক্স",
    visionDesc: "ৰাতিৰ পাঠযোগ্যতা (নীলা পোহৰহীন, সুনিদ্ৰা সুৰক্ষিত) আৰু ফন্ট বিবৰ্ধক",
    nightTitle: "বৃত্তীয় ৰাতিৰ ম'ড",
    nightDesc: "গাঢ় কফি, আখৰোট ৰং আৰু নীলা পোহৰ শূন্য",
    nightOn: "ৰাতি: সক্ৰিয়",
    enableNight: "ৰাতিৰ ম'ড অন কৰক",
    fontSizeTitle: "আখৰৰ আকাৰ বিবৰ্ধক",
    saveReturn: "সংৰক্ষণ কৰি চিকিৎসালৈ উভতি যাওক",
  },
  hi: {
    title: "वरिष्ठ सुगमता एवं अभिगम्यता सुइट",
    badge: "WCAG AAA",
    sub: "इनपुट मोड पृथक्करण • ओपन-सीवी दृष्टि • स्वर वाचन",
    closeAria: "सुगमता सेटिंग्स बंद करें",
    primaryModeTitle: "प्राथमिक इनपुट मोड (एक समय में एक)",
    noConflictBadge: "शून्य दोहरा कर्सर टकराव",
    primaryModeDesc: "मानक माउस या ओपन-सीवी हवा में हाथ ट्रैकिंग चुनें। दोनों कभी एक साथ नहीं टकराएंगे।",
    physicalTitle: "1. भौतिक माउस",
    physicalDesc: "मानक माउस, ट्रैकपैड या टचस्क्रीन। शून्य कैमरा उपयोग।",
    airTitle: "2. वर्चुअल एयर माउस",
    airDesc: "ओपन-सीवी हाथ ट्रैकिंग। भौतिक पॉइंटर छुपा रहेगा; केवल हवा में पॉइंटर।",
    activeDriver: "सक्रिय ड्राइवर",
    escToExit: "(बाहर निकलने हेतु Esc)",
    airOptionsTitle: "वर्चुअल एयर माउस कॉन्फ़िगरेशन विकल्प",
    keyHelp: "कुंजी: M या Esc",
    clickMethodTitle: "क्लिक ट्रिगर विधि:",
    dwellLabel: "स्थिर क्लिक (Dwell)",
    dwellDesc: "क्लिक करने हेतु रोकें",
    pinchLabel: "चुटकी क्लिक (Pinch)",
    pinchDesc: "अंगूठे और उंगली से चुटकी",
    tapKeyLabel: "कुंजी दबाएं (Tap Key)",
    tapKeyDesc: "स्पेस / एंटर दबाकर क्लिक",
    dwellSpeedTitle: "स्थिर क्लिक गति:",
    seconds: "सेकंड",
    dwellFast: "तेज़ (0.6 से.)",
    dwellStd: "मानक (1.0 से.)",
    dwellElder: "वरिष्ठ अनुकूल (2.2 से.)",
    antiTremorTitle: "कंपन-रोधी डैम्पिंग (पार्किंसंस फ़िल्टर):",
    tremorLight: "हल्का (त्वरित प्रतिक्रिया)",
    tremorStd: "मध्यम (मानक)",
    tremorHeavy: "भारी (अधिकतम स्थिरता)",
    motionReachTitle: "गति पहुंच दायरा (हाथ हिलाने की सीमा):",
    motionStd: "मानक (1.0x)",
    motionWide: "विस्तृत पहुंच (1.5x) - छोटी हलचल में पूरी स्क्रीन",
    paceTitle: "कर्सर चाल गति (गति एवं सहजता):",
    paceCalmLabel: "शांत एवं धीमा",
    paceCalmSub: "वरिष्ठ अनुकूल (स्थिरतम)",
    paceGentleLabel: "सौम्य",
    paceGentleSub: "मानक सहज ग्लाइड",
    paceRespLabel: "फुर्तीला",
    paceRespSub: "त्वरित प्रतिक्रिया",
    camHudTitle: "वेबकैम पूर्वावलोकन HUD:",
    camPip: "पूर्ण कैमरा PIP",
    camBadge: "छोटा बैज",
    camHidden: "छिपा हुआ (शांत)",
    camDiscreetNote: "शांत मोड: स्क्रीन पर कोई कैमरा वीडियो नहीं दिखेगा; केवल पॉइंटर चलेगा। घबराहट वाले मरीजों हेतु उत्तम।",
    handoffTitle: "माउस अदला-बदली नीति:",
    handoffAuto: "स्वचालित (माउस हिलाने पर माउस पर लौटें)",
    handoffStrict: "सख्त लॉक (केवल Esc या M दबाकर निकलें)",
    stickyTitle: "चुंबकीय लक्ष्य आकर्षण (कंपन लॉक)",
    stickyBadge: "WCAG AAA",
    stickyDesc: "हाथ कांपने पर भी बटन पर स्थिर रहने हेतु पॉइंटर को धीरे से खींचता है",
    audioTicksTitle: "श्रव्य क्लिक प्रगति टिक",
    audioTicksDesc: "क्लिक चक्र भरते समय 25%, 50%, 75% पर सूक्ष्म आवाज",
    pointerSizeTitle: "पॉइंटर आकार:",
    sizeNormal: "सामान्य",
    sizeLarge: "बड़ा",
    sizeGiant: "विशाल",
    enabled: "सक्रिय",
    turnOn: "चालू करें",
    listenTitle: "बोलकर सुनाएं (Listen-First)",
    listenDesc: "माउस घुमाने पर कार्डों और बटनों को क्षेत्रीय भाषा में बोलकर सुनाता है",
    kbdTitle: "कीबोर्ड स्विच शॉर्टकट",
    kbdDesc: "भौतिक कीबोर्ड एवं सहायक स्विच नियंत्रक मैपिंग",
    kbdFocus: "फोकस बदलें",
    kbdSelect: "चुनें / क्लिक करें",
    kbdToggleAir: "एयर माउस चालू/बंद",
    kbdExitAir: "एयर माउस से बाहर",
    visionTitle: "दृश्य एवं सर्कैडियन एर्गोनॉमिक्स",
    visionDesc: "सर्कैडियन रात्रि पठन (शून्य नीली रोशनी, सुरक्षित नींद) और अक्षर आवर्धक",
    nightTitle: "सर्कैडियन रात्रि मोड",
    nightDesc: "गहरा एस्प्रेसो, भुना अखरोट एवं शून्य नीली रोशनी",
    nightOn: "रात: चालू",
    enableNight: "रात्रि मोड चालू करें",
    fontSizeTitle: "अक्षर आकार आवर्धक",
    saveReturn: "सहेजें और देखभाल पर लौटें",
  },
  bn: {
    title: "জ্যেষ্ঠ সহজগম্যতা ও প্রবেশাধিকার স্যুট",
    badge: "WCAG AAA",
    sub: "ইনপুট মোড আইসোলেশন • ওপেন-সিভি ভিশন • ভয়েস সহায়তা",
    closeAria: "সহজগম্যতা সেটিংস বন্ধ করুন",
    primaryModeTitle: "প্রাথমিক ইনপুট মোড (এক সময়ে একটি)",
    noConflictBadge: "দ্বৈত-কার্সার সংঘাতহীন",
    primaryModeDesc: "সাধারণ মাউস বা ওপেন-সিভি শূন্যে হাতের ট্র্যাকিং বেছে নিন। উভয়ই কখনো একসঙ্গে বিরোধ করবে না।",
    physicalTitle: "১. শারীরিক মাউস",
    physicalDesc: "সাধারণ মাউস, ট্র্যাকপ্যাড বা টাচস্ক্রিন। কোনো ক্যামেরা ওভারহেড নেই।",
    airTitle: "২. ভার্চুয়াল এয়ার মাউস",
    airDesc: "ওপেন-সিভি হাতের ভঙ্গি। মাউস পয়েন্টার লুকানো থাকে; শুধুমাত্র শূন্যে হাত দিয়ে নিয়ন্ত্রণ।",
    activeDriver: "সক্রিয় ড্রাইভার",
    escToExit: "(বের হতে Esc)",
    airOptionsTitle: "ভার্চুয়াল এয়ার মাউস কনফিগারেশন বিকল্প",
    keyHelp: "কী: M অথবা Esc",
    clickMethodTitle: "ক্লিক ট্রিগার পদ্ধতি:",
    dwellLabel: "স্থির ক্লিক (Dwell)",
    dwellDesc: "ক্লিক করতে স্থির রাখুন",
    pinchLabel: "চিমটি ক্লিক (Pinch)",
    pinchDesc: "বুড়ো ও তর্জনী আঙুলের চিমটি",
    tapKeyLabel: "কী চাপুন (Tap Key)",
    tapKeyDesc: "স্পেস / এন্টার চেপে ক্লিক",
    dwellSpeedTitle: "স্থির ক্লিকের গতি:",
    seconds: "সেকেন্ড",
    dwellFast: "দ্রুত (০.৬ সে.)",
    dwellStd: "সাধারণ (১.০ সে.)",
    dwellElder: "জ্যেষ্ঠ উপযোগী (২.২ সে.)",
    antiTremorTitle: "কম্পন প্রতিরোধী ফিল্টার (পারকিনসন ফিল্টার):",
    tremorLight: "হালকা (দ্রুত প্রতিক্রিয়া)",
    tremorStd: "মাঝারি (সাধারণ)",
    tremorHeavy: "ভারী (সর্বোচ্চ স্থায়িত্ব)",
    motionReachTitle: "হাত নাড়ানোর পরিধি (Motion Reach):",
    motionStd: "সাধারণ (১.০x)",
    motionWide: "প্রশস্ত পরিধি (১.৫x) - সামান্য নাড়াচাড়ায় পুরো পর্দা",
    paceTitle: "কার্সারের চলাচলের গতি (গতি ও মসৃণতা):",
    paceCalmLabel: "শান্ত ও ধীর",
    paceCalmSub: "জ্যেষ্ঠ উপযোগী (সর্বাধিক স্থির)",
    paceGentleLabel: "নম্র",
    paceGentleSub: "মানক মসৃণ চলাচল",
    paceRespLabel: "চটপটে",
    paceRespSub: "দ্রুত প্রতিক্রিয়া",
    camHudTitle: "ওয়েবক্যাম প্রিভিউ HUD:",
    camPip: "পূর্ণ ক্যামেরা PIP",
    camBadge: "ছোট ব্যাজ",
    camHidden: "লুকানো (শান্ত)",
    camDiscreetNote: "শান্ত মোড: পর্দায় কোনো ক্যামেরা ভিডিও দেখানো হয় না; কেবল পয়েন্টার চলে। উদ্বেগের রোগীদের জন্য আদর্শ।",
    handoffTitle: "মাউস পরিবর্তনের নীতি:",
    handoffAuto: "স্বয়ংক্রিয় (মাউস নাড়ালে মাউসে ফেরে)",
    handoffStrict: "কঠোর লক (কেবল Esc বা M দিয়ে প্রস্থান)",
    stickyTitle: "চৌম্বকীয় লক্ষ্য আকর্ষণ (Tremor Lock)",
    stickyBadge: "WCAG AAA",
    stickyDesc: "হাত কাঁপলেও বোতামে সহজে স্থির থাকতে পয়েন্টারকে আলতোভাবে আকর্ষণ করে",
    audioTicksTitle: "শ্রবণযোগ্য ক্লিক অগ্রগতি টিক",
    audioTicksDesc: "ক্লিক চক্র পূর্ণ হওয়ার সময় ২৫%, ৫০%, ৭৫% তে হালকা শব্দ",
    pointerSizeTitle: "পয়েন্টারের আকার:",
    sizeNormal: "সাধারণ",
    sizeLarge: "বড়",
    sizeGiant: "বিশাল",
    enabled: "সক্রিয়",
    turnOn: "চালু করুন",
    listenTitle: "শুনুন-প্রথম ভয়েস বর্ণনা (Listen-First)",
    listenDesc: "মাউস নিলে কার্ড ও বোতামগুলি সক্রিয় আঞ্চলিক ভাষায় পড়ে শোনায়",
    kbdTitle: "কীবোর্ড সুইচ শর্টকাট",
    kbdDesc: "শারীরিক কীবোর্ড ও সহায়ক সুইচ নিয়ন্ত্রক ম্যাপিং",
    kbdFocus: "ফোকাস বদলান",
    kbdSelect: "বাছাই / ক্লিক",
    kbdToggleAir: "এয়ার মাউস চালু/বন্ধ",
    kbdExitAir: "এয়ার মাউস বন্ধ",
    visionTitle: "দৃষ্টি ও সার্কাডিয়ান এরগনোমিক্স",
    visionDesc: "সার্কাডিয়ান রাত্রি পাঠযোগ্যতা (নীল আলোহীন, নিরাপদ ঘুম) এবং হরফ বিবর্ধক",
    nightTitle: "সার্কাডিয়ান রাত্রি মোড",
    nightDesc: "গাঢ় কফি, আখরোট রঙ ও নীল আলো শূন্য",
    nightOn: "রাত: চালু",
    enableNight: "রাত্রি মোড চালু করুন",
    fontSizeTitle: "হরফের আকার বিবর্ধক",
    saveReturn: "সংরক্ষণ করুন এবং যত্নে ফিরুন",
  },
  mr: {
    title: "ज्येष्ठ सुलभता आणि प्रवेश सुइट",
    badge: "WCAG AAA",
    sub: "इनपुट मोड अलगीकरण • ओपन-सीव्ही व्हिजन • व्हॉईस सहाय्य",
    closeAria: "सुलभता सेटिंग्ज बंद करा",
    primaryModeTitle: "प्राथमिक इनपुट मोड (एका वेळी एक)",
    noConflictBadge: "दोन कर्सरचा वाद नाही",
    primaryModeDesc: "मानक माउस किंवा ओपन-सीव्ही हवेतील हात ट्रॅकिंग निवडा. दोन्ही एकाच वेळी कधीही टकराणार नाहीत.",
    physicalTitle: "१. प्रत्यक्ष माऊस",
    physicalDesc: "मानक माउस, ट्रॅक Ulrich किंवा टचस्क्रीन. कॅमेरा वापर नाही.",
    airTitle: "२. व्हर्च्युअल एअर माउस",
    airDesc: "ओपन-सीव्ही हात ट्रॅकिंग. प्रत्यक्ष पॉइंटर लपवला जातो; फक्त हवेतील पॉइंटर.",
    activeDriver: "सक्रिय ड्रायव्हर",
    escToExit: "(बाहेर पडण्यासाठी Esc)",
    airOptionsTitle: "व्हर्च्युअल एअर माउस पर्याय",
    keyHelp: "की: M किंवा Esc",
    clickMethodTitle: "क्लिक ट्रिगर पद्धत:",
    dwellLabel: "स्थिर क्लिक (Dwell)",
    dwellDesc: "क्लिक करण्यासाठी स्थिर ठेवा",
    pinchLabel: "चिमटी क्लिक (Pinch)",
    pinchDesc: "अंगठा आणि बोटाची चिमटी",
    tapKeyLabel: "की दाबा (Tap Key)",
    tapKeyDesc: "स्पेस / एंटर दाबून क्लिक",
    dwellSpeedTitle: "स्थिर क्लिक गती:",
    seconds: "सेकंद",
    dwellFast: "वेगवान (०.६ से.)",
    dwellStd: "मानक (१.० से.)",
    dwellElder: "ज्येष्ठांसाठी अनुकूल (२.२ से.)",
    antiTremorTitle: "कंपन-प्रतिबंधक डॅम्पिंग (पार्किन्सन्स फिल्टर):",
    tremorLight: "हलका (जलद प्रतिसाद)",
    tremorStd: "मध्यम (मानक)",
    tremorHeavy: "जास्त (कमाल स्थिरता)",
    motionReachTitle: "हालचालीची मर्यादा (हाताची हालचाल):",
    motionStd: "मानक (१.०x)",
    motionWide: "विस्तृत मर्यादा (१.५x) - छोट्या हालचालीत पूर्ण स्क्रीन",
    paceTitle: "कर्सर हालचालीची गती (गती व सहजता):",
    paceCalmLabel: "शांत आणि मंद",
    paceCalmSub: "ज्येष्ठ अनुकूल (सर्वात स्थिर)",
    paceGentleLabel: "सौम्य",
    paceGentleSub: "मानक सुरळीत हालचाल",
    paceRespLabel: "चपळ",
    paceRespSub: "जलद प्रतिसाद",
    camHudTitle: "वेबकॅम पूर्वावलोकन HUD:",
    camPip: "पूर्ण कॅमेरा PIP",
    camBadge: "लहान बॅज",
    camHidden: "लपविलेला (शांत)",
    camDiscreetNote: "शांत मोड: स्क्रीनवर कोणताही कॅमेरा व्हिडिओ दिसत नाही; फक्त पॉइंटर हलतो. चिंताग्रस्त रुग्णांसाठी सर्वोत्तम.",
    handoffTitle: "माऊस अदलाबदल धोरण:",
    handoffAuto: "स्वयंचलित (माउस हलवल्यास माउसवर परत या)",
    handoffStrict: "कडक लॉक (फक्त Esc किंवा M दाबून बाहेर पडा)",
    stickyTitle: "चुंबकीय लक्ष्य आकर्षण (Tremor Lock)",
    stickyBadge: "WCAG AAA",
    stickyDesc: "हात थरथरला तरी बटणावर स्थिर राहण्यासाठी पॉइंटरला हळूच आकर्षित करतो",
    audioTicksTitle: "ऐकू येणारे क्लिक प्रगती टिक",
    audioTicksDesc: "क्लिक चक्र पूर्ण होताना २५%, ५०%, ७५% वर हलका आवाज",
    pointerSizeTitle: "पॉइंटर आकार:",
    sizeNormal: "सामान्य",
    sizeLarge: "मोठा",
    sizeGiant: "अति मोठा",
    enabled: "सक्रिय",
    turnOn: "चालू करा",
    listenTitle: "वाचून दाखवा (Listen-First)",
    listenDesc: "घटक आणि बटणांवर फिरवल्यावर प्रादेशिक भाषेत बोलून दाखवतो",
    kbdTitle: "कीबोर्ड स्विच शॉर्टकट",
    kbdDesc: "प्रत्यक्ष कीबोर्ड आणि सहाय्यक स्विच नियंत्रक मॅपिंग",
    kbdFocus: "फोकस बदला",
    kbdSelect: "निवडा / क्लिक",
    kbdToggleAir: "एअर माउस चालू/बंद",
    kbdExitAir: "एअर माउस बंद",
    visionTitle: "दृष्टी व सर्केडियन अर्गोनॉमिक्स",
    visionDesc: "सर्केडियन रात्र वाचन (शून्य निळा प्रकाश, झोपेसाठी सुरक्षित) आणि फॉन्ट भिंग",
    nightTitle: "सर्केडियन रात्र मोड",
    nightDesc: "गडद एस्प्रेसो, अक्रोड रंग आणि शून्य निळा प्रकाश",
    nightOn: "रात्र: चालू",
    enableNight: "रात्र मोड चालू करा",
    fontSizeTitle: "अक्षर आकार भिंग",
    saveReturn: "जतन करा आणि परत जा",
  },
  ne: {
    title: "ज्येष्ठ पहुँच तथा सुगमता सुइट",
    badge: "WCAG AAA",
    sub: "इनपुट मोड पृथक्करण • ओपन-सीभी दृष्टि • ध्वनि सहायता",
    closeAria: "पहुँच सेटिङहरू बन्द गर्नुहोस्",
    primaryModeTitle: "प्राथमिक इनपुट मोड (एक पटकमा एउटा)",
    noConflictBadge: "शून्य दोहोरो कर्सर द्वन्द्व",
    primaryModeDesc: "मानक माउस वा ओपन-सीभी हावामा हात ट्र्याकिङ रोज्नुहोस्। दुवै कहिल्यै एकैपटक द्वन्द्वमा आउँदैनन्।",
    physicalTitle: "१. भौतिक माउस",
    physicalDesc: "मानक माउस, ट्र्याकप्याड वा टचस्क्रिन। शून्य क्यामेरा प्रयोग।",
    airTitle: "२. भर्चुअल एयर माउस",
    airDesc: "ओपन-सीभी हात ट्र्याकिङ। भौतिक पोइन्टर लुकिन्छ; केवल हावामा पोइन्टर।",
    activeDriver: "सक्रिय ड्राइभर",
    escToExit: "(निस्कन Esc)",
    airOptionsTitle: "भर्चुअल एयर माउस विकल्पहरू",
    keyHelp: "कुञ्जी: M वा Esc",
    clickMethodTitle: "क्लिक ट्रिगर विधि:",
    dwellLabel: "स्थिर क्लिक (Dwell)",
    dwellDesc: "क्लिक गर्न स्थिर राख्नुहोस्",
    pinchLabel: "चिम्टी क्लिक (Pinch)",
    pinchDesc: "बुढी र चोर औंलाको चिम्टी",
    tapKeyLabel: "कुञ्जी थिच्नुहोस् (Tap Key)",
    tapKeyDesc: "स्पेस / इन्टर थिचेर क्लिक",
    dwellSpeedTitle: "स्थिर क्लिक गति:",
    seconds: "सेकेन्ड",
    dwellFast: "छिटो (०.६ से.)",
    dwellStd: "मानक (१.० से.)",
    dwellElder: "ज्येष्ठमैत्री (२.२ से.)",
    antiTremorTitle: "कम्पन-विरोधी ड्याम्पिङ (पार्किन्सन्स फिल्टर):",
    tremorLight: "हल्का (छिटो प्रतिक्रिया)",
    tremorStd: "मध्यम (मानक)",
    tremorHeavy: "भारी (अधिकतम स्थिरता)",
    motionReachTitle: "गति पहुँच दायरा (हात हल्लाउने सीमा):",
    motionStd: "मानक (१.०x)",
    motionWide: "फराकिलो पहुँच (१.५x) - सानो चालमा पूरै स्क्रिन",
    paceTitle: "कर्सर चाल गति (गति र सहजता):",
    paceCalmLabel: "शान्त र ढिलो",
    paceCalmSub: "ज्येष्ठमैत्री (स्थिरतम)",
    paceGentleLabel: "सौम्य",
    paceGentleSub: "मानक सहज चाल",
    paceRespLabel: "स्फूर्त",
    paceRespSub: "छिटो प्रतिक्रिया",
    camHudTitle: "वेबक्याम पूर्वावलोकन HUD:",
    camPip: "पूर्ण क्यामेरा PIP",
    camBadge: "सानो ब्याज",
    camHidden: "लुकेको (शान्त)",
    camDiscreetNote: "शान्त मोड: स्क्रिनमा कुनै क्यामेरा भिडियो देखिँदैन; केवल पोइन्टर चल्छ। चिन्तित बिरामीहरूका लागि उपयुक्त।",
    handoffTitle: "माउस अदलाबदली नीति:",
    handoffAuto: "स्वचालित (माउस हल्लाउँदा माउसमा फर्कने)",
    handoffStrict: "कडा लक (केवल Esc वा M थिचेर बाहिर निस्कने)",
    stickyTitle: "चुम्बकीय लक्ष्य आकर्षण (Tremor Lock)",
    stickyBadge: "WCAG AAA",
    stickyDesc: "हात काम्दा पनि बटनमा स्थिर रहन पोइन्टरलाई बिस्तारै तान्छ",
    audioTicksTitle: "सुनिने क्लिक प्रगति टिक",
    audioTicksDesc: "क्लिक चक्र पूरा हुँदै जाँदा २५%, ५०%, ७५% मा मसिनो ध्वनि",
    pointerSizeTitle: "पोइन्टरको आकार:",
    sizeNormal: "सामान्य",
    sizeLarge: "ठूलो",
    sizeGiant: "विशाल",
    enabled: "सक्रिय",
    turnOn: "चालू गर्नुहोस्",
    listenTitle: "पढेर सुनाउनुहोस् (Listen-First)",
    listenDesc: "माउस लैजाँदा कार्ड र बटनहरू सक्रिय क्षेत्रीय भाषामा बोलेर सुनाउँछ",
    kbdTitle: "किबोर्ड स्विच सर्टकटहरू",
    kbdDesc: "भौतिक किबोर्ड र सहायक स्विच नियन्त्रक म्यापिङ",
    kbdFocus: "फोकस सार्नुहोस्",
    kbdSelect: "छान्नुहोस् / क्लिक",
    kbdToggleAir: "एयर माउस चालू/बन्द",
    kbdExitAir: "एयर माउस बन्द",
    visionTitle: "दृष्टि तथा सर्क्याडियन एर्गोनोमिक्स",
    visionDesc: "सर्क्याडियन रात्रि पठन (शून्य नीलो प्रकाश, निद्रा-सुरक्षित) र अक्षर म्याग्निफायर",
    nightTitle: "सर्क्याडियन रात्रि मोड",
    nightDesc: "गाढा एस्प्रेसो, ओखरको रंग र शून्य नीलो प्रकाश",
    nightOn: "रात: चालू",
    enableNight: "रात्रि मोड चालू गर्नुहोस्",
    fontSizeTitle: "अक्षर आकार म्याग्निफायर",
    saveReturn: "बचत गर्नुहोस् र फर्कनुहोस्",
  },
  mni: {
    title: "অহলশিংগী সুচলতা অমসুং খুদোংচাবগী সুইত",
    badge: "WCAG AAA",
    sub: "ইনপুত মোদ তোঙানবা • ওপেন-সিভি মীতৌ • খোন্থাং মতেং",
    closeAria: "সুচলতা সেতিংশিং থিংজিনবা",
    primaryModeTitle: "মরুওইবা ইনপুত মোদ (অমমম তৌবা)",
    noConflictBadge: "অনি মখলগী কাৰ্সার শোক্নদবা",
    primaryModeDesc: "অফবা মাউস নত্রগা ওপেন-সিভি নুংশিৎকী খুৎ শিজিন্নউ। অনিনা অমগা অমগা কাওদনা থবক তৌই।",
    physicalTitle: "১. হকচাংগী মাউস",
    physicalDesc: "অফবা মাউস, ত্রেকপেদ নত্রগা তচস্ক্রিন। কেমেরা মথৌ তাদে।",
    airTitle: "২. ভর্চুয়েল এয়ার মাউস",
    airDesc: "ওপেন-সিভি খুৎ য়েংশিনবা। অফবা মাউস লোৎতুনা লৈ; নুংশিৎকী খুৎখক শিজিন্নৈ।",
    activeDriver: "চৎনরিবা দ্রাইভর",
    escToExit: "(Esc নমদুনা থোকপা)",
    airOptionsTitle: "ভর্চুয়েল এয়ার মাউসগী সেতিংশিং",
    keyHelp: "কী: M নত্রগা Esc",
    clickMethodTitle: "ক্লিক তৌবগী মওং:",
    dwellLabel: "লেপতুনা ক্লিক (Dwell)",
    dwellDesc: "ক্লিক তৌনবগীদমক লেপউ",
    pinchLabel: "খোৎতুনা ক্লিক (Pinch)",
    pinchDesc: "খুৎশা খোৎতুনা ক্লিক",
    tapKeyLabel: "কী নম্মু (Tap Key)",
    tapKeyDesc: "স্পেস / এন্তার নমদুনা ক্লিক",
    dwellSpeedTitle: "লেপতুনা ক্লিক তৌবগী খোঙজেল:",
    seconds: "সেকেন্ড",
    dwellFast: "য়াংবা (০.৬ সে.)",
    dwellStd: "চুম্বা (১.০ সে.)",
    dwellElder: "অহলগী পন্থবা (২.২ সে.)",
    antiTremorTitle: "খুৎ খুৎখৎপা থিংবা ফিল্তর (পার্কিনসন্স ফিল্তর):",
    tremorLight: "লৌবা (য়াংবা)",
    tremorStd: "ময়ায় ওইবা (চুম্বা)",
    tremorHeavy: "অকনবা (খ্বাইদগী স্থিতি)",
    motionReachTitle: "খুৎ লেংবগী পন্থ (Motion Reach):",
    motionStd: "চুম্বা (১.০x)",
    motionWide: "পাকথোকপা (১.৫x) - অপিকপা লেংবদা স্ক্রিন পুম্বদা য়ৌবা",
    paceTitle: "কাৰ্সার চৎপগী খোঙজেল (খোঙজেল অমসুং তাংবা):",
    paceCalmLabel: "শান্ত অমসুং তাংবা",
    paceCalmSub: "অহলগী অনুকূল (খ্বাইদগী স্থিতি)",
    paceGentleLabel: "নম্র",
    paceGentleSub: "মানক মসৃণ চৎপা",
    paceRespLabel: "য়াংবা",
    paceRespSub: "চঞ্চল সঁহাৰি",
    camHudTitle: "ৱেবকেম প্রিভ্যু HUD:",
    camPip: "মপুং ফাবা কেমেরা PIP",
    camBadge: "অপিকপা বেজ",
    camHidden: "লোৎশিনবা (শান্ত)",
    camDiscreetNote: "লোৎশিনবা মোদ: স্ক্রিন্দা কেমেরা ভিদিও উদে; কাৰ্সারখক চৎলি।",
    handoffTitle: "মাউস ওন্থোক-ওনশিনগী নিয়ম:",
    handoffAuto: "ইশানা ওনবা (মাউস লেংলগা মাউসতা হল্লকপা)",
    handoffStrict: "অকনবা থিংবা (Esc নত্রগা M খক্তদা ওনবা)",
    stickyTitle: "চুম্বক ওইনা চিংশিনবা (Tremor Lock)",
    stickyBadge: "WCAG AAA",
    stickyDesc: "খুৎ খুৎখৎলবসু বতমদা চপ চানা লেপহন্নবা চিংশিল্লি",
    audioTicksTitle: "তাবা য়ারবা ক্লিক ফীভমগী খোন্থোক",
    audioTicksDesc: "রিং মপুং ফারকপদা ২৫%, ৫০%, ৭৫% দা খোন্থোক তাগনি",
    pointerSizeTitle: "কাৰ্সারগী অচৌবা:",
    sizeNormal: "নোর্মেframe",
    sizeLarge: "অচৌবা",
    sizeGiant: "য়াম্না অচৌবা",
    enabled: "য়াওরে",
    turnOn: "হাংদোকউ",
    listenTitle: "তাহনবা-অহানবা কথন মতেং (Listen-First)",
    listenDesc: "মাউস তাথবা কার্দশিং অমসুং বতমশিং ইমারোমগী লোলদা স্বয়ংক্ৰীয় ওইনা পাথম্মী",
    kbdTitle: "কীবোর্দ স্বিচ শোৰ্টকত",
    kbdDesc: "হকচাংগী কীবোর্দ অমসুং সহায়ক স্বিচ মেপিং",
    kbdFocus: "ফোকাস হোংদোকপা",
    kbdSelect: "খল্লু / ক্লিক",
    kbdToggleAir: "এয়ার মাউস অন/অফ",
    kbdExitAir: "এয়ার মাউস থিংবা",
    visionTitle: "উবা অমসুং অহিংগী এরগোনমিক্স",
    visionDesc: "অহিংদা পাফম ফবা (ব্লু-লাইত য়াওদবা, তুম্বগী শাফবা) অমসুং ময়েক অচৌবা",
    nightTitle: "অহিংগী মোদ",
    nightDesc: "গাঢ় কফি, অখরোত মচু অমসুং ব্লু-লাইত লৈতবা",
    nightOn: "অহিং: য়াওরে",
    enableNight: "অহিংগী মোদ হাংদোকউ",
    fontSizeTitle: "ময়েক অচৌ-অচা হেনগৎহনবা",
    saveReturn: "সেভ তৌদুনা অনাবা য়েংশিনবদা হল্লকউ",
  },
  brx: {
    title: "गिदिरफोरनि सुबिदा आरो हेफाजाब सुइट",
    badge: "WCAG AAA",
    sub: "इनपुट म'ड आलादा • ओपन-सिभि नोजोर • राव हेफाजाब",
    closeAria: "सुबिदा सेटिं बन्द खालाम",
    primaryModeTitle: "गाहाय इनपुट म'ड (मोनसे सम आव मोनसेल')",
    noConflictBadge: "कर्सर नांग्रोबनाय गैया",
    primaryModeDesc: "माउस एबा ओपन-सिभि बार आव आखाइ ट्रेकिं सायख। मोननैबो जेब्लाबो नांग्रोबा।",
    physicalTitle: "१. बेलायनि माउस",
    physicalDesc: "सरासनस्रा माउस, ट्रेकपेड एबा टाचस्क्रिन। केमेरा नाङा।",
    airTitle: "२. भर्चुयेल एयार माउस",
    airDesc: "ओपन-सिभि आखाइ ट्रेकिं। सरासनस्रा कर्सर खोमाना थागोन; बार आव आखाइ कर्सरल'।",
    activeDriver: "साख्रि ड्राइभर",
    escToExit: "(ओंखारनो Esc)",
    airOptionsTitle: "भर्चुयेल एयार माउस सायखनाय",
    keyHelp: "की: M एबा Esc",
    clickMethodTitle: "क्लिक खालामनाय खान्थि:",
    dwellLabel: "दिस्रनाय क्लिक (Dwell)",
    dwellDesc: "क्लिक खालामनो थादना दो",
    pinchLabel: "इन्सुनाय क्लिक (Pinch)",
    pinchDesc: "आसि जों इन्सुनाय",
    tapKeyLabel: "की थु (Tap Key)",
    tapKeyDesc: "स्पेस / इन्टार थुनानै क्लिक",
    dwellSpeedTitle: "दिस्रनाय क्लिकनि गोख्रैथि:",
    seconds: "सेकेन्ड",
    dwellFast: "गोख्रै (०.६ से.)",
    dwellStd: "सरासनस्रा (१.० से.)",
    dwellElder: "गिदिरफोरनि (२.२ से.)",
    antiTremorTitle: "आखाइ गोजावनाय होबथाग्रा (पार्किन्सन्स फिल्टर):",
    tremorLight: "रेजे (गोख्रै)",
    tremorStd: "गेजेर (मानक)",
    tremorHeavy: "गोब्राब (गोहो गोनां)",
    motionReachTitle: "आखाइ लोरसोर खालामनायनि सिमा:",
    motionStd: "सरासनस्रा (१.०x)",
    motionWide: "गुवार (१.५x) - खम लोरसोर आव गासै स्क्रिन",
    paceTitle: "कर्सर दावबायनायनि खोम (गोख्रैथि आरो गुरैथि):",
    paceCalmLabel: "गोजोन आरो लासै",
    paceCalmSub: "गिदिरफोरनि समायना",
    paceGentleLabel: "गुरै",
    paceGentleSub: "सरासनस्रा गुरै",
    paceRespLabel: "गोख्रै",
    paceRespSub: "गोख्रै फिननाय",
    camHudTitle: "वेबकेमेरा नायनाय HUD:",
    camPip: "गासै केमेरा PIP",
    camBadge: "फिसा बेज",
    camHidden: "खोमानाय (गोजोन)",
    camDiscreetNote: "खोमानाय म'ड: स्क्रिन आव केमेरा नुवा; कर्सरल' दावबायगोन।",
    handoffTitle: "माउस सोलायनाय नेम:",
    handoffAuto: "गावआरि (माउस लोरसोर खालामब्ला माउस आव थांफिनगोन)",
    handoffStrict: "कठोर (केबोल Esc एबा M जों ओंखार)",
    stickyTitle: "चुम्बक बादि बोनाय (Tremor Lock)",
    stickyBadge: "WCAG AAA",
    stickyDesc: "आखाइ गोजावब्लाबो बथामाव रोखायै दोननो कर्सरखौ बोयो",
    audioTicksTitle: "खोनानाय क्लिक सोदोब टिक",
    audioTicksDesc: "क्लिक जायोब्ला २५%, ५०%, ७५% आव सोदोब खालामगोन",
    pointerSizeTitle: "कर्सरनि महर:",
    sizeNormal: "सरासनस्रा",
    sizeLarge: "गेदेर",
    sizeGiant: "जोबोद गेदेर",
    enabled: "जागायबाय",
    turnOn: "सुरु खालाम",
    listenTitle: "खोनासं-गिबि राव सावरायनाय (Listen-First)",
    listenDesc: "माउस दोननाय कार्ड आरो बुथुंखौ हारिमुनि राव आव फरायना खोनथायो",
    kbdTitle: "कीबोर्ड स्विच सर्टकाट",
    kbdDesc: "कीबोर्ड आरो स्विच बाहायनाय",
    kbdFocus: "फ'कास सोलाय",
    kbdSelect: "सायख / क्लिक",
    kbdToggleAir: "एयार माउस जागाय/बन्द",
    kbdExitAir: "एयार माउस ओंखार",
    visionTitle: "नोजोर आरो हरनि महर",
    visionDesc: "हरनि फरायनाय (निला सोरां गैया, उन्दुनाय रैखाथि) आरो हांखो गेदेर खालामग्रा",
    nightTitle: "हरनि म'ड",
    nightDesc: "गासै कफि, अख्रुत गाब आरो निला सोरां गैया",
    nightOn: "हर: जागायबाय",
    enableNight: "हरनि म'ड जागाय",
    fontSizeTitle: "हांखो गेदेर खालामग्रा",
    saveReturn: "दोनथुम आरो थांफिन",
  },
  grt: {
    title: "Balgipani Poriani & Nambegipa Suite",
    badge: "WCAG AAA",
    sub: "Input Bewal Dingtang • OpenCV Nikanichi • Ku·rangchi Poriani",
    closeAria: "Settings-ko Chipbo",
    primaryModeTitle: "Skanggipa Input Bewal (Mitang san)",
    noConflictBadge: "Cursor Ding·chrikgriani Gri",
    primaryModeDesc: "Standard physical mouse ba OpenCV balpak jak trackingko seokbo. Gnioni dingtanggrik dongjawa.",
    physicalTitle: "1. Physical Mouse",
    physicalDesc: "Standard OS mouse, trackpad ba touchscreen. Camera nangja.",
    airTitle: "2. Virtual Air Mouse",
    airDesc: "OpenCV jak tracking. Physical pointer dongnuenga; balpako sansan pointer.",
    activeDriver: "Kam Ka·enggipa Driver",
    escToExit: "(Ong·katna Esc)",
    airOptionsTitle: "Virtual Air Mouse Configuration Options",
    keyHelp: "Key: M ba Esc",
    clickMethodTitle: "Click Dakani Bewal:",
    dwellLabel: "Dwell Click",
    dwellDesc: "Click dakatna deng·e donbo",
    pinchLabel: "Pinch Click",
    pinchDesc: "Jaksking aro jaksi pinch",
    tapKeyLabel: "Tap Key",
    tapKeyDesc: "Space / Enter jot·e click",
    dwellSpeedTitle: "Dwell Click Ta·rakani:",
    seconds: "seconds",
    dwellFast: "Ta·rakbegipa (0.6s)",
    dwellStd: "Standard (1.0s)",
    dwellElder: "Ka·sinbee (2.2s)",
    antiTremorTitle: "Jak Moani Champengani (Parkinson's Filter):",
    tremorLight: "Reng·si (Ta·rak)",
    tremorStd: "Krak (Standard)",
    tremorHeavy: "Simteng (Kakket steady)",
    motionReachTitle: "Jak Moani Ari (Motion Reach):",
    motionStd: "Standard (1.0x)",
    motionWide: "Gipeng (1.5x) - On·titi mooba screen gimikko man·a",
    paceTitle: "Cursor Re·ani Bewal (Ta·rakani aro Ka·sinani):",
    paceCalmLabel: "Tomi aro Ka·sin",
    paceCalmSub: "Budepana Nambatgipa (Steady)",
    paceGentleLabel: "Nom·gipa",
    paceGentleSub: "Standard Fluid Glide",
    paceRespLabel: "Ta·rakgipa",
    paceRespSub: "Ta·rakbee Aganchakani",
    camHudTitle: "Webcam Preview HUD:",
    camPip: "Gimik Camera PIP",
    camBadge: "Chonbegipa Badge",
    camHidden: "Donnue (Discreet)",
    camDiscreetNote: "Donnue donani: Camera video mesokja; pointer-san moa. Gisik neng·nikgipana nambegipa.",
    handoffTitle: "Mouse Dingtangataniko Niani:",
    handoffAuto: "Auto-Switch (Mouse-ko moon mouse-ona re·bapilgen)",
    handoffStrict: "Strict Lock (Esc ba M-chisan re·ongkatbo)",
    stickyTitle: "Sticky Target Magnetism (Tremor Lock)",
    stickyBadge: "WCAG AAA",
    stickyDesc: "Jak tiltilon button-ona pointer-ko saloba click dakna dakchaka",
    audioTicksTitle: "Knatigipa Dwell Ticks",
    audioTicksDesc: "Dwell ring gapon 25%, 50%, 75%-o sul gam·a",
    pointerSizeTitle: "Pointer-ni Dal·ani:",
    sizeNormal: "Normal",
    sizeLarge: "Dal·gipa",
    sizeGiant: "Dal·begipa",
    enabled: "Kam Ka·enga",
    turnOn: "Kulibo",
    listenTitle: "Skanggipa Knatiani (Listen-First)",
    listenDesc: "Element-rangko ku·rangchi porie knatimata",
    kbdTitle: "Keyboard Switch Shortcuts",
    kbdDesc: "Keyboard aro switch controller baksa kam ka·ani",
    kbdFocus: "Focus Dingtangata",
    kbdSelect: "Seokbo / Click",
    kbdToggleAir: "Air Mouse Kulibo/Chipbo",
    kbdExitAir: "Air Mouse Watbo",
    visionTitle: "Niani & Circadian Ergonomics",
    visionDesc: "Walo poriani (blue light gri, tusina namgipa) aro okkor dal·atgipa",
    nightTitle: "Circadian Walo Ni·ani",
    nightDesc: "Espresso aro blue light gri",
    nightOn: "Wal: ON",
    enableNight: "Walo Ni·aniko Kulibo",
    fontSizeTitle: "Okkor Dal·atani",
    saveReturn: "Rakkie Re·bapilbo",
  },
  kha: {
    title: "Ki Lad Jingiarap Ki Rangbah & Accessibility",
    badge: "WCAG AAA",
    sub: "Input Mode Isolation • OpenCV Vision • Sur Jingbatai",
    closeAria: "Khad ia ki Settings",
    primaryModeTitle: "Ka Rukom Input ba Kongsan (Mano kawei)",
    noConflictBadge: "Khlem jingiawit Cursor",
    primaryModeDesc: "Jied ia ka mouse tynrai lane ka OpenCV kti pynkhih. Baroh ar kin ym iawit.",
    physicalTitle: "1. Ka Mouse Tynrai",
    physicalDesc: "Mouse, trackpad lane touchscreen. Khlem kamera.",
    airTitle: "2. Virtual Air Mouse",
    airDesc: "OpenCV kti pynkhih ha suin. Ka mouse tynrai kan jah; tang u pointer ha suin.",
    activeDriver: "Driver ba Trei kam",
    escToExit: "(Shon Esc ban mih)",
    airOptionsTitle: "Ki Rukom Jied Virtual Air Mouse",
    keyHelp: "Key: M lane Esc",
    clickMethodTitle: "Rukom Click:",
    dwellLabel: "Dwell Click",
    dwellDesc: "Pynsangeh ban click",
    pinchLabel: "Pinch Click",
    pinchDesc: "Khmih shon kti ban click",
    tapKeyLabel: "Tap Key",
    tapKeyDesc: "Shon Space / Enter ban click",
    dwellSpeedTitle: "Ka Jingstet Dwell Click:",
    seconds: "seconds",
    dwellFast: "Stet (0.6s)",
    dwellStd: "Bait (1.0s)",
    dwellElder: "Suki Rangbah (2.2s)",
    antiTremorTitle: "Jingiada Kti Kyiuh (Parkinson's Filter):",
    tremorLight: "Stet sngewbha",
    tremorStd: "Bait (Standard)",
    tremorHeavy: "Khia (Kti khlem kyiuh)",
    motionReachTitle: "Ka Jingpynkhih Kti (Motion Reach):",
    motionStd: "Standard (1.0x)",
    motionWide: "Piar bha (1.5x) - Khih khyndiat phriang baroh",
    paceTitle: "Jingstet u Cursor (Speed & Smoothness):",
    paceCalmLabel: "Jai jai & Suki",
    paceCalmSub: "Ba biang ia ki Tymmen",
    paceGentleLabel: "Jemnud",
    paceGentleSub: "Standard Fluid Glide",
    paceRespLabel: "Kloi",
    paceRespSub: "Jingstet kloi",
    camHudTitle: "Webcam Preview HUD:",
    camPip: "Full Camera PIP",
    camBadge: "Badge barit",
    camHidden: "Buhrieh (Discreet)",
    camDiscreetNote: "Rukom buhrieh: Khlem pyni dur kamera; tang u pointer u khih.",
    handoffTitle: "Ka Rukom Kylla Sha ka Mouse:",
    handoffAuto: "Auto-Switch (Khih mouse phai sha mouse)",
    handoffStrict: "Strict Lock (Mih tang da Esc lane M)",
    stickyTitle: "Sticky Target Magnetism (Tremor Lock)",
    stickyBadge: "WCAG AAA",
    stickyDesc: "Ring beit sha ki button ban khanglad ia ka kyiuh kti",
    audioTicksTitle: "Auditory Dwell Ticks",
    audioTicksDesc: "Sur sawa jem ha ka 25%, 50%, 75% haba pyndep ia u ring",
    pointerSizeTitle: "Jingheh Pointer:",
    sizeNormal: "Normal",
    sizeLarge: "Heh",
    sizeGiant: "Heh Shibun",
    enabled: "La Plie",
    turnOn: "Plie",
    listenTitle: "Pule ia nga (Listen-First)",
    listenDesc: "Pule beit ia ki card bad ki button ha ka ktien tynrai",
    kbdTitle: "Keyboard Switch Shortcuts",
    kbdDesc: "Direct physical keyboard bad assistive switch mapping",
    kbdFocus: "Pynkhih Focus",
    kbdSelect: "Jied / Click",
    kbdToggleAir: "Plie/Khad Air Mouse",
    kbdExitAir: "Mih na Air Mouse",
    visionTitle: "Jingiohi & Circadian Ergonomics",
    visionDesc: "Pule miet (khlem jingshai blue) bad pynheh dak",
    nightTitle: "Rukom Miet Circadian",
    nightDesc: "Espresso bad khlem jingshai blue",
    nightOn: "Miet: ON",
    enableNight: "Plie Rukom Miet",
    fontSizeTitle: "Pynheh ia ki Dak",
    saveReturn: "Kynshew & Phai Sha Jingiarap",
  },
  lus: {
    title: "Upate Chhiarna leh Puihna Hmanruate",
    badge: "WCAG AAA",
    sub: "Input Hrang Hranna • OpenCV Hmuhna • Aw Puihna",
    closeAria: "Accessibility Settings Khar Rawh",
    primaryModeTitle: "Hman Bik Tur Input (A Mala Hman Tur)",
    noConflictBadge: "Cursor Inbakkawlh Lo",
    primaryModeDesc: "Mouse pangngai emaw boruaka kut chet OpenCV hmangin thlang rawh. A rualin a inbak kawlh ngai lo vang.",
    physicalTitle: "1. Kut Hman Mouse",
    physicalDesc: "OS mouse pangngai, trackpad emaw touchscreen. Camera a ngai lo.",
    airTitle: "2. Boruaka Hman Air Mouse",
    airDesc: "OpenCV kut zui. Mouse pointer thup a ni a; boruaka kut pointer chauh a lang.",
    activeDriver: "Hman Mek A Ni",
    escToExit: "(Chhuah nan Esc)",
    airOptionsTitle: "Air Mouse Siamremna Duhthlan Turte",
    keyHelp: "Hmeh tur: M emaw Esc",
    clickMethodTitle: "Click Dan Tur:",
    dwellLabel: "Chawl Click (Dwell)",
    dwellDesc: "Click nan chawl deuh rawh",
    pinchLabel: "Kut Zung Hmet (Pinch)",
    pinchDesc: "Kutzungpui leh kutzungchal hmeh kawp",
    tapKeyLabel: "Hmeh Hmet (Tap Key)",
    tapKeyDesc: "Click nan Space / Enter hmet rawh",
    dwellSpeedTitle: "Chawl Click Chak Lam:",
    seconds: "seconds",
    dwellFast: "Chak (0.6s)",
    dwellStd: "Pangngai (1.0s)",
    dwellElder: "Upate Tan Dam Deuh (2.2s)",
    antiTremorTitle: "Kut Khur Venna (Parkinson's Filter):",
    tremorLight: "Zang (Chak)",
    tremorStd: "Pangngai (Standard)",
    tremorHeavy: "Chak Tha (Khur veng tha ber)",
    motionReachTitle: "Kut Chettir Zau Zawng (Motion Reach):",
    motionStd: "Pangngai (1.0x)",
    motionWide: "Zau Deuh (1.5x) - Che tlem pawhin screen a khuh vek",
    paceTitle: "Cursor Kal Dan (Chak Lam leh Dam Lam):",
    paceCalmLabel: "Dam leh Muang",
    paceCalmSub: "Upate Tan Thalo Ber",
    paceGentleLabel: "Dam Deuh",
    paceGentleSub: "Standard Fluid Glide",
    paceRespLabel: "Chak",
    paceRespSub: "Chhanna Rang",
    camHudTitle: "Webcam Hmuhna HUD:",
    camPip: "Camera Pum PIP",
    camBadge: "Badge Te",
    camHidden: "Thup (Discreet)",
    camDiscreetNote: "Thupna mode: Screen-ah camera video a lang lo; pointer chauh a che. Rilru hah hma damlo tan a tha.",
    handoffTitle: "Mouse Inthlak Thleng Dan:",
    handoffAuto: "Auto-Switch (Mouse chetin mouse-ah a let)",
    handoffStrict: "Strict Lock (Esc emaw M chauhvin chhuak rawh)",
    stickyTitle: "Hmetna Bika Hnuhna (Tremor Lock)",
    stickyBadge: "WCAG AAA",
    stickyDesc: "Kut khur vanga chetsual loh nan button zawnah a hnuk hnai zel",
    audioTicksTitle: "Dwell Progress Ri Tete",
    audioTicksDesc: "Dwell ring a khah tial tial laiin 25%, 50%, 75%-ah ri a siam",
    pointerSizeTitle: "Pointer Len Zawng:",
    sizeNormal: "Pangngai",
    sizeLarge: "Lian",
    sizeGiant: "Lian Em Em",
    enabled: "Hman Mek",
    turnOn: "On Rawh",
    listenTitle: "Ngaithla Hmasa Rawh (Listen-First)",
    listenDesc: "Thil awmte chu mahni hnam tawng ngeiin a sawi chhuak zung zung",
    kbdTitle: "Keyboard Switch Shortcuts",
    kbdDesc: "Keyboard leh switch controller nena hman kawp dan",
    kbdFocus: "Focus Sawn",
    kbdSelect: "Thlang / Click",
    kbdToggleAir: "Air Mouse On/Off",
    kbdExitAir: "Air Mouse Chhuahsan",
    visionTitle: "Hmuhna & Circadian Ergonomics",
    visionDesc: "Zan thim chhiarna (eng pawl awm lo, muttui nan) leh hawrawp tihlenna",
    nightTitle: "Zan Thim Rim Mode",
    nightDesc: "Espresso thim leh eng pawl awm lo",
    nightOn: "Zan: ON",
    enableNight: "Zan Mode On Rawh",
    fontSizeTitle: "Hawrawp Tihlenna",
    saveReturn: "Vawng la Let Leh Rawh",
  },
};

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
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const m = A11Y_MODAL_I18N[normLoc] || A11Y_MODAL_I18N.en;

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
                  {m.title}
                </h2>
                <span className="rounded-full bg-tea px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
                  {m.badge}
                </span>
              </div>
              <p className="text-xs font-bold text-ink-secondary">
                {m.sub}
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
            aria-label={m.closeAria}
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
                  <span>{m.primaryModeTitle}</span>
                </span>
                <span className="text-[10px] font-black rounded bg-amber-100 px-2 py-0.5 text-amber-900 border border-amber-300">
                  {m.noConflictBadge}
                </span>
              </div>
              <p className="text-xs font-bold text-ink-secondary mt-0.5">
                {m.primaryModeDesc}
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
                  <span className="text-sm font-black">{m.physicalTitle}</span>
                </div>
                <p className={`text-[11px] font-semibold leading-tight ${inputMode === "physical" ? "text-white/90" : "text-ink-secondary"}`}>
                  {m.physicalDesc}
                </p>
                {inputMode === "physical" && (
                  <span className="mt-2 text-[10px] font-black rounded bg-white text-tea px-2 py-0.5 inline-flex items-center gap-1">
                    <span>{m.activeDriver}</span>
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
                  <span className="text-sm font-black">{m.airTitle}</span>
                </div>
                <p className={`text-[11px] font-semibold leading-tight ${inputMode === "virtual" ? "text-black/90" : "text-ink-secondary"}`}>
                  {m.airDesc}
                </p>
                {inputMode === "virtual" && (
                  <span className="mt-2 text-[10px] font-black rounded bg-black text-amber-300 px-2 py-0.5 inline-flex items-center gap-1">
                    <span>{m.activeDriver}</span>
                    <Check className="h-3 w-3" />
                    <span>{m.escToExit}</span>
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
                    {m.airOptionsTitle}
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-ink-secondary">
                  {m.keyHelp}
                </span>
              </div>

              {/* Option A: Click Action Method */}
              <div>
                <span className="flex items-center gap-1.5 text-xs font-black mb-1.5">
                  <MousePointerClick className="h-4 w-4 text-tea" />
                  <span>{m.clickMethodTitle}</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "dwell", label: m.dwellLabel, desc: m.dwellDesc, icon: Timer },
                    { id: "pinch", label: m.pinchLabel, desc: m.pinchDesc, icon: Hand },
                    { id: "key", label: m.tapKeyLabel, desc: m.tapKeyDesc, icon: Keyboard },
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
                    <span>{m.dwellSpeedTitle}</span>
                    <span className="font-black text-tea">{(dwellTimeMs / 1000).toFixed(1)} {m.seconds}</span>
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
                    <span>{m.dwellFast}</span>
                    <span>{m.dwellStd}</span>
                    <span>{m.dwellElder}</span>
                  </div>
                </div>
              )}

              {/* Option C: Tremor Damping / Parkinson's Filter */}
              <div className="rounded-xl border-2 border-black/20 bg-white p-2.5">
                <div className="flex items-center justify-between text-xs font-bold mb-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-tea" />
                    <span>{m.antiTremorTitle}</span>
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
                  <span>{m.tremorLight}</span>
                  <span>{m.tremorStd}</span>
                  <span>{m.tremorHeavy}</span>
                </div>
              </div>

              {/* Option D: Motion Reach Sensitivity */}
              <div className="rounded-xl border-2 border-black/20 bg-white p-2.5">
                <span className="flex items-center gap-1.5 text-xs font-bold mb-1.5">
                  <MoveHorizontal className="h-3.5 w-3.5 text-tea" />
                  <span>{m.motionReachTitle}</span>
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
                    {m.motionStd}
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
                    {m.motionWide}
                  </button>
                </div>
              </div>

              {/* Option: Movement Pace (Speed Limiter & Smoothing) */}
              <div className="rounded-xl border-2 border-black/20 bg-white p-2.5">
                <span className="flex items-center gap-1.5 text-xs font-bold mb-1.5">
                  <Sliders className="h-3.5 w-3.5 text-tea" />
                  <span>{m.paceTitle}</span>
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "calm", label: m.paceCalmLabel, sub: m.paceCalmSub, icon: ShieldCheck },
                    { id: "gentle", label: m.paceGentleLabel, sub: m.paceGentleSub, icon: Sliders },
                    { id: "standard", label: m.paceRespLabel, sub: m.paceRespSub, icon: Zap },
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
                  <span>{m.camHudTitle}</span>
                </div>
                <div className="flex gap-2">
                  {[
                    { id: "pip", label: m.camPip },
                    { id: "minimized", label: m.camBadge },
                    { id: "hidden", label: m.camHidden },
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
                    {m.camDiscreetNote}
                  </p>
                )}
              </div>

              {/* Option F: Physical Mouse Conflict & Handoff Policy */}
              <div className="rounded-xl border-2 border-black/20 bg-white p-2.5">
                <div className="flex items-center gap-1.5 mb-1.5 text-xs font-bold">
                  <ShieldAlert className="h-3.5 w-3.5 text-tea" />
                  <span>{m.handoffTitle}</span>
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
                    {m.handoffAuto}
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
                    {m.handoffStrict}
                  </button>
                </div>
              </div>

              {/* Option G: Sticky Target Magnetism (Tremor Lock) */}
              <div className="rounded-xl border-2 border-black/20 bg-white p-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Magnet className="h-4 w-4 text-tea shrink-0" />
                    <span>{m.stickyTitle}</span>
                    <span className="text-[9px] font-black uppercase rounded bg-tea-light px-1 text-tea border border-tea/30">
                      {m.stickyBadge}
                    </span>
                  </div>
                  <p className="text-[10px] text-ink-secondary mt-0.5">
                    {m.stickyDesc}
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
                      <span>{m.enabled}</span>
                      <Check className="h-3 w-3" />
                    </span>
                  ) : (
                    m.turnOn
                  )}
                </button>
              </div>

              {/* Option H: Auditory Dwell Progress Ticks */}
              <div className="rounded-xl border-2 border-black/20 bg-white p-2.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Bell className="h-4 w-4 text-tea shrink-0" />
                    <span>{m.audioTicksTitle}</span>
                  </div>
                  <p className="text-[10px] text-ink-secondary mt-0.5">
                    {m.audioTicksDesc}
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
                      <span>{m.enabled}</span>
                      <Check className="h-3 w-3" />
                    </span>
                  ) : (
                    m.turnOn
                  )}
                </button>
              </div>

              {/* Option I: Pointer Size Selector */}
              <div>
                <span className="flex items-center gap-1.5 text-xs font-bold mb-1.5">
                  <Crosshair className="h-3.5 w-3.5 text-tea" />
                  <span>{m.pointerSizeTitle}</span>
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
                      {size === "normal" ? m.sizeNormal : size === "large" ? m.sizeLarge : m.sizeGiant}
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
                  <span>{m.listenTitle}</span>
                </h3>
                <p className="text-xs font-bold text-ink-secondary">
                  {m.listenDesc}
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
                  <span>{m.enabled}</span>
                  <Check className="h-3 w-3" />
                </span>
              ) : (
                m.turnOn
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
                  <span>{m.kbdTitle}</span>
                </h3>
                <p className="text-xs font-bold text-ink-secondary">
                  {m.kbdDesc}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
              <div className="flex items-center gap-2 rounded-xl border border-black/20 bg-amber-50 p-2">
                <kbd className="rounded bg-black px-2 py-0.5 text-white font-mono font-black">Arrows / Tab</kbd>
                <span>{m.kbdFocus}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-black/20 bg-amber-50 p-2">
                <kbd className="rounded bg-black px-2 py-0.5 text-white font-mono font-black">Space / Enter</kbd>
                <span>{m.kbdSelect}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-black/20 bg-amber-50 p-2">
                <kbd className="rounded bg-black px-2 py-0.5 text-white font-mono font-black">M</kbd>
                <span>{m.kbdToggleAir}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-black/20 bg-amber-50 p-2">
                <kbd className="rounded bg-black px-2 py-0.5 text-white font-mono font-black">Esc</kbd>
                <span>{m.kbdExitAir}</span>
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
                  <Moon className="h-4 w-4 text-tea" />
                  <span>{m.visionTitle}</span>
                </h3>
                <p className="text-xs font-bold text-ink-secondary">
                  {m.visionDesc}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-black block">{m.nightTitle}</span>
                <span className="text-[10px] text-ink-secondary">{m.nightDesc}</span>
              </div>
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
                    <span>{m.nightOn}</span>
                    <Check className="h-3 w-3" />
                  </span>
                ) : (
                  m.enableNight
                )}
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-black">{m.fontSizeTitle}</span>
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
            {m.saveReturn}
          </button>
        </div>
      </div>
    </div>
  );
}
