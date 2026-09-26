"use client";

import { useEffect, useCallback, useTransition } from "react";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  X,
  Home,
  Brain,
  ShieldCheck,
  Stethoscope,
  Heart,
  QrCode,
  Sparkles,
  Users,
  Gamepad2,
  FileText,
  Sliders,
  Moon,
  Volume2,
  PhoneCall,
  Radio,
  WifiOff,
  ExternalLink,
  ChevronRight,
  BookOpen,
  Coffee,
  Check,
} from "lucide-react";
import { ALL_LANGUAGES, type LanguageDef } from "@/components/ui/LanguageSelector";
import { playPress, playTapFeedback, unlockAudio } from "@/lib/sound";
import { useHyperCustomizationStore } from "@/store/useHyperCustomizationStore";
import { useSystemStatus } from "@/hooks/useSystemStatus";

interface ResponsiveNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const DRAWER_I18N: Record<
  string,
  {
    menuTitle: string;
    portals: string;
    activities: string;
    accessibility: string;
    languages: string;
    emergency: string;
    home: string;
    patient: string;
    patientSub: string;
    caregiver: string;
    caregiverSub: string;
    doctor: string;
    doctorSub: string;
    family: string;
    familySub: string;
    kiosk: string;
    kioskSub: string;
    clinical: string;
    clinicalSub: string;
    routine: string;
    games: string;
    community: string;
    echoes: string;
    diet: string;
    textSize: string;
    nightMode: string;
    readAloud: string;
    themeStudio: string;
    teleManas: string;
    teleManasSub: string;
    ambulance: string;
    ambulanceSub: string;
    activeSession: string;
    systemOnline: string;
    systemOffline: string;
  }
> = {
  en: {
    menuTitle: "Navigation & Portals",
    portals: "Core Clinical Portals",
    activities: "Therapy & Patient Tools",
    accessibility: "Accessibility & Comfort",
    languages: "Regional Languages (MDoNER)",
    emergency: "24/7 Emergency Assistance",
    home: "Home Overview",
    patient: "Patient Memory Care",
    patientSub: "Daily routine, 18+ therapy games, family messages",
    caregiver: "Caregiver Dashboard",
    caregiverSub: "Patient roster, clinical telemetry, intake wizard",
    doctor: "Physician & Clinician Portal",
    doctorSub: "MoCA biomarkers, glucose lag, digital Rx",
    family: "Family Circle Wall",
    familySub: "Send love notes, photo cheer, WhatsApp share",
    kiosk: "Kiosk ABHA Check-In",
    kioskSub: "Scan health card, rapid patient login",
    clinical: "Clinical R&D Dossier",
    clinicalSub: "MoCA & ACTIVE trial scientific validation",
    routine: "My Daily Routine",
    games: "Daily Brain Activities (18 Games)",
    community: "Family Community Wall",
    echoes: "Echoes of Home (Memory Vault)",
    diet: "Brain Nutrition & Meal Snap",
    textSize: "Text Size",
    nightMode: "Circadian Night Mode",
    readAloud: "Read Aloud (Listen-First)",
    themeStudio: "Theme & Display Studio",
    teleManas: "Tele-MANAS Mental Health",
    teleManasSub: "Govt of India 24/7 Helpline: 14416",
    ambulance: "Medical Emergency SOS",
    ambulanceSub: "Immediate Ambulance Helpline: 108",
    activeSession: "Current Route",
    systemOnline: "Spring Backend Online",
    systemOffline: "Spring Backend Offline",
  },
  hi: {
    menuTitle: "नेविगेशन एवं पोर्टल्स",
    portals: "मुख्य चिकित्सीय पोर्टल",
    activities: "थेरेपी एवं रोगी उपकरण",
    accessibility: "सुगमता एवं सुविधा",
    languages: "पूर्वोत्तर एवं राष्ट्रीय भाषाएँ",
    emergency: "24/7 आपातकालीन सहायता",
    home: "मुख्य पृष्ठ",
    patient: "मरीज़ स्मृति सेवा",
    patientSub: "दैनिक दिनचर्या, 18+ दिमागी खेल, परिवार संदेश",
    caregiver: "देखभालकर्ता पोर्टल",
    caregiverSub: "रोगी सूची, चिकित्सीय टेलीमेट्री, नया रोगी",
    doctor: "चिकित्सक एवं डॉक्टर पोर्टल",
    doctorSub: "MoCA बायोमार्कर, डिजिटल प्रिस्क्रिप्शन",
    family: "परिवार साथी सर्कल",
    familySub: "प्यार भरे संदेश, फ़ोटो शेयर, व्हाट्सएप",
    kiosk: "कियोस्क ABHA चेक-इन",
    kioskSub: "हेल्थ कार्ड स्कैन, त्वरित लॉगिन",
    clinical: "चिकित्सा अनुसंधान डोज़ियर",
    clinicalSub: "MoCA एवं ACTIVE वैज्ञानिक साक्ष्य",
    routine: "मेरी दिनचर्या",
    games: "दैनिक गतिविधियां (18 खेल)",
    community: "परिवार एवं समुदाय",
    echoes: "घर की यादें (मेमोरी वॉल्ट)",
    diet: "आहार पोषण एवं मील स्नैप",
    textSize: "अक्षर आकार",
    nightMode: "रात्रि मोड (शून्य नीली रोशनी)",
    readAloud: "बोलकर सुनाएं (ऑडियो)",
    themeStudio: "थीम एवं रंग स्टूडियो",
    teleManas: "टेली-मानस मानसिक स्वास्थ्य",
    teleManasSub: "भारत सरकार हेल्पलाइन: 14416",
    ambulance: "चिकित्सा आपातकालीन SOS",
    ambulanceSub: "एम्बुलेंस सेवा: 108",
    activeSession: "सक्रिय पृष्ठ",
    systemOnline: "सर्वर ऑनलाइन",
    systemOffline: "सर्वर ऑफलाइन",
  },
  as: {
    menuTitle: "নেভিগেচন আৰু প'ৰ্টেলসমূহ",
    portals: "মুখ্য ক্লিনিকেল প'ৰ্টেল",
    activities: "চিকিৎসা আৰু ৰোগী সঁজুলি",
    accessibility: "সুচলতা আৰু বিশেষ সুবিধা",
    languages: "উত্তৰ-পূব আৰু ৰাষ্ট্ৰীয় ভাষা",
    emergency: "২৪/৭ জৰুৰীকালীন সাহায্য",
    home: "গৃহ পৃষ্ঠভূমি",
    patient: "ৰোগী স্মৃতি সেৱা",
    patientSub: "দৈনিক নিয়মসূচী, ১৮+ খেল, পৰিয়ালৰ বাৰ্তা",
    caregiver: "শুশ্ৰূষাকাৰী প'ৰ্টেল",
    caregiverSub: "ৰোগী তালিকা, ক্লিনিকেল টেলিমেট্ৰী",
    doctor: "চিকিৎসক প'ৰ্টেল",
    doctorSub: "MoCA বায়’মাৰ্কাৰ, ডিজিটেল প্ৰেচক্ৰিপচন",
    family: "পৰিয়ালৰ চক্ৰ",
    familySub: "স্নেহভৰা বাৰ্তা, ফটো প্ৰেৰণ, হোৱাটছএপ",
    kiosk: "কিঅ’স্ক ABHA চেক-ইন",
    kioskSub: "স্বাস্থ্য কাৰ্ড স্কেনিং",
    clinical: "ক্লিনিকেল গৱেষণা নথিপত্ৰ",
    clinicalSub: "MoCA আৰু ACTIVE বৈজ্ঞানিক প্ৰমাণ",
    routine: "মোৰ নিয়মসূচী",
    games: "দৈনিক কাৰ্যকলাপ (১৮ খেল)",
    community: "সামাজিক চক্ৰ",
    echoes: "ঘৰৰ স্মৃতি (কেপচুল ভঁৰাল)",
    diet: "পুষ্টি আৰু আহাৰ নিৰীক্ষণ",
    textSize: "আখৰৰ আকাৰ",
    nightMode: "ৰাতিৰ ম'ড",
    readAloud: "পঢ়ি শুনাওক",
    themeStudio: "থীম আৰু ৰূপ সজ্জা",
    teleManas: "টেলি-মানস হেল্পলাইন",
    teleManasSub: "ভাৰত চৰকাৰ হেল্পলাইন: ১৪৪১৬",
    ambulance: "জৰুৰীকালীন এম্বুলেন্স",
    ambulanceSub: "এম্বুলেন্স সাহায্য: ১০৮",
    activeSession: "বৰ্তমানৰ পৃষ্ঠা",
    systemOnline: "স্প্ৰিং অনলাইন",
    systemOffline: "স্প্ৰিং অফলাইন",
  },
  bn: {
    menuTitle: "নেভিগেশন ও পোর্টাল",
    portals: "মূল ক্লিনিক্যাল পোর্টাল",
    activities: "থেরাপি ও রোগীর সরঞ্জাম",
    accessibility: "সহজগম্যতা ও সুবিধা",
    languages: "আঞ্চলিক ও জাতীয় ভাষা",
    emergency: "২৪/৭ জরুরি সাহায্য",
    home: "হোম ওভারভিউ",
    patient: "রোগী স্মৃতি সেবা",
    patientSub: "দৈনিক রুটিন, ১৮+ ব্রেন গেমস, পরিবারের বার্তা",
    caregiver: "সেবাকারী পোর্টাল",
    caregiverSub: "রোগীর তালিকা, ক্লিনিক্যাল টেলিমেট্রি",
    doctor: "চিকিৎসক পোর্টাল",
    doctorSub: "MoCA বায়োমার্কার, ডিজিটাল প্রেসক্রিপশন",
    family: "পরিবার সার্কেল",
    familySub: "স্নেহবার্তা, ছবি শেয়ার, হোয়াটসঅ্যাপ",
    kiosk: "কিয়স্ক ABHA চেক-ইন",
    kioskSub: "হেলথ কার্ড স্ক্যান",
    clinical: "ক্লিনিক্যাল গবেষণা নথি",
    clinicalSub: "MoCA বৈজ্ঞানিক প্রমাণ",
    routine: "আমার রুটিন",
    games: "দৈনিক কার্যকলাপ (১৮ গেমস)",
    community: "সম্প্রদায় ওয়াল",
    echoes: "বাড়ির স্মৃতি ভল্ট",
    diet: "মস্তিষ্কের পুষ্টি ও খাবার স্ন্যাপ",
    textSize: "হরফের আকার",
    nightMode: "রাত্রি মোড",
    readAloud: "পড়ে শোনান",
    themeStudio: "থিম ও স্টাইল স্টুডিও",
    teleManas: "টেলি-মানস হেল্পলাইন",
    teleManasSub: "ভারত সরকার হেল্পলাইন: ১৪৪১৬",
    ambulance: "জরুরি অ্যাম্বুলেন্স",
    ambulanceSub: "অ্যাম্বুলেন্স কল: ১০৮",
    activeSession: "বর্তমান পৃষ্ঠা",
    systemOnline: "সার্ভার অনলাইন",
    systemOffline: "সার্ভার অফলাইন",
  },
};

export function ResponsiveNavDrawer({ isOpen, onClose }: ResponsiveNavDrawerProps) {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const d18n = DRAWER_I18N[normLoc] || DRAWER_I18N.en;

  const systemStatus = useSystemStatus();
  const setStudioOpen = useHyperCustomizationStore((s) => s.setStudioOpen);

  // Close drawer on Escape key and manage body scroll lock safely
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Close drawer on route navigation
  const handleNavigate = useCallback(
    (href: string) => {
      playPress();
      onClose();
    },
    [onClose]
  );

  const handleSelectLanguage = (code: string) => {
    playPress();
    onClose();
    if (code === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: code, scroll: false });
    });
  };

  const handleFontSize = (level: "sm" | "md" | "lg") => {
    try {
      unlockAudio();
      playPress();
      localStorage.setItem("cognicare_font_size", level);
      const root = document.documentElement;
      root.classList.remove("font-scale-sm", "font-scale-md", "font-scale-lg");
      if (level === "sm") {
        root.classList.add("font-scale-sm");
        root.style.setProperty("font-size", "15px", "important");
      } else if (level === "lg") {
        root.classList.add("font-scale-lg");
        root.style.setProperty("font-size", "25px", "important");
      } else {
        root.classList.add("font-scale-md");
        root.style.setProperty("font-size", "18px", "important");
      }
      window.dispatchEvent(new Event("cognicare_accessibility_change"));
      window.dispatchEvent(new Event("storage"));
    } catch {
      // Ignore
    }
  };

  const toggleHighContrast = () => {
    try {
      playPress();
      const current = localStorage.getItem("cognicare_high_contrast") === "true";
      const next = !current;
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
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={d18n.menuTitle}
      className="fixed inset-0 z-50 flex justify-end animate-fade-in"
    >
      {/* Dimmed backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          playTapFeedback();
          onClose();
        }}
        aria-hidden="true"
      />

      {/* Slide-out Navigation Sheet Container */}
      <div className="relative z-50 flex h-full w-full max-w-md flex-col bg-surface border-l-4 border-black text-ink shadow-[-10px_0_25px_rgba(0,0,0,0.25)] overflow-hidden">
        {/* Top Drawer Header */}
        <div className="flex items-center justify-between border-b-3 border-black bg-amber-100/70 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-black bg-tea text-white shadow-[2px_2px_0px_#000]">
              <Brain className="h-6 w-6 stroke-[2.4]" />
            </div>
            <div>
              <h2 className="font-serif text-lg sm:text-xl font-black text-ink leading-tight">
                CogniCare CDTx
              </h2>
              <p className="text-[11px] font-bold text-ink-secondary">
                {d18n.menuTitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              playTapFeedback();
              onClose();
            }}
            className="btn-tactile flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-white hover:bg-rose-500 hover:text-white transition-colors cursor-pointer shadow-[1.5px_1.5px_0px_#000]"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Scrollable Drawer Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
          {/* 1. Core Clinical Portals */}
          <div>
            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-tea px-1">
              {d18n.portals}
            </span>
            <div className="mt-2 space-y-2">
              {[
                {
                  href: "/",
                  label: d18n.home,
                  sub: "Portal landing & MDoNER 8-state cultural hub",
                  icon: Home,
                  bg: "bg-surface",
                },
                {
                  href: "/patient",
                  label: d18n.patient,
                  sub: d18n.patientSub,
                  icon: Brain,
                  bg: "bg-emerald-50",
                },
                {
                  href: "/caregiver",
                  label: d18n.caregiver,
                  sub: d18n.caregiverSub,
                  icon: ShieldCheck,
                  bg: "bg-amber-50",
                },
                {
                  href: "/doctor",
                  label: d18n.doctor,
                  sub: d18n.doctorSub,
                  icon: Stethoscope,
                  bg: "bg-sky-50",
                },
                {
                  href: "/family",
                  label: d18n.family,
                  sub: d18n.familySub,
                  icon: Heart,
                  bg: "bg-rose-50",
                },
                {
                  href: "/kiosk/login",
                  label: d18n.kiosk,
                  sub: d18n.kioskSub,
                  icon: QrCode,
                  bg: "bg-amber-100/50",
                },
                {
                  href: "/clinical-evidence",
                  label: d18n.clinical,
                  sub: d18n.clinicalSub,
                  icon: FileText,
                  bg: "bg-teal-50",
                },
              ].map((portal) => {
                const Icon = portal.icon;
                const isActive = portal.href === "/" ? pathname === "/" : pathname.startsWith(portal.href);

                return (
                  <Link
                    key={portal.href}
                    href={portal.href}
                    onClick={() => handleNavigate(portal.href)}
                    className={`btn-tactile flex items-center justify-between p-3 rounded-2xl border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-black bg-tea text-white shadow-[3px_3px_0px_#000]"
                        : `border-black/20 ${portal.bg} hover:border-black text-ink shadow-xs`
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 transition-all ${
                          isActive
                            ? "border-white bg-white text-tea shadow-xs"
                            : "border-black/30 bg-surface text-ink"
                        }`}
                      >
                        <Icon className="h-5 w-5 stroke-[2.3]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-black text-sm truncate">
                            {portal.label}
                          </span>
                          {isActive && (
                            <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                          )}
                        </div>
                        <p
                          className={`text-[11px] truncate leading-tight ${
                            isActive ? "text-white/80 font-medium" : "text-ink-secondary"
                          }`}
                        >
                          {portal.sub}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 shrink-0 stroke-[2.5] ml-2 ${
                        isActive ? "text-amber-300" : "text-ink-secondary/60"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* 2. Patient Therapy Quick Links */}
          <div>
            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-tea px-1">
              {d18n.activities}
            </span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                href="/patient/games"
                onClick={() => handleNavigate("/patient/games")}
                className="btn-tactile p-3 rounded-2xl border-2 border-black bg-amber-50 hover:bg-amber-100 flex flex-col justify-between shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <Gamepad2 className="h-5 w-5 text-amber-700 stroke-[2.5]" />
                  <span className="text-[10px] font-black uppercase bg-amber-200 px-1.5 py-0.5 rounded border border-black/20">
                    18 Games
                  </span>
                </div>
                <span className="mt-2 text-xs font-black text-ink leading-snug">
                  {d18n.games}
                </span>
              </Link>

              <Link
                href="/patient/community"
                onClick={() => handleNavigate("/patient/community")}
                className="btn-tactile p-3 rounded-2xl border-2 border-black bg-rose-50 hover:bg-rose-100 flex flex-col justify-between shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <Users className="h-5 w-5 text-rose-700 stroke-[2.5]" />
                  <span className="text-[10px] font-black uppercase bg-rose-200 px-1.5 py-0.5 rounded border border-black/20">
                    Live
                  </span>
                </div>
                <span className="mt-2 text-xs font-black text-ink leading-snug">
                  {d18n.community}
                </span>
              </Link>

              <Link
                href="/patient/echoes-of-home"
                onClick={() => handleNavigate("/patient/echoes-of-home")}
                className="btn-tactile p-3 rounded-2xl border-2 border-black bg-emerald-50 hover:bg-emerald-100 flex flex-col justify-between shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <Sparkles className="h-5 w-5 text-emerald-700 stroke-[2.5]" />
                  <span className="text-[10px] font-black uppercase bg-emerald-200 px-1.5 py-0.5 rounded border border-black/20">
                    Vault
                  </span>
                </div>
                <span className="mt-2 text-xs font-black text-ink leading-snug">
                  {d18n.echoes}
                </span>
              </Link>

              <Link
                href="/patient/diet"
                onClick={() => handleNavigate("/patient/diet")}
                className="btn-tactile p-3 rounded-2xl border-2 border-black bg-teal-50 hover:bg-teal-100 flex flex-col justify-between shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <Coffee className="h-5 w-5 text-teal-700 stroke-[2.5]" />
                  <span className="text-[10px] font-black uppercase bg-teal-200 px-1.5 py-0.5 rounded border border-black/20">
                    MIND
                  </span>
                </div>
                <span className="mt-2 text-xs font-black text-ink leading-snug">
                  {d18n.diet}
                </span>
              </Link>
            </div>
          </div>

          {/* 3. Accessibility & Personal Comfort */}
          <div className="rounded-2xl border-2 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] space-y-3">
            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-tea" />
              <span>{d18n.accessibility}</span>
            </span>

            {/* Font Size Row */}
            <div className="flex items-center justify-between gap-2 pt-1 border-t border-black/10">
              <span className="text-xs font-bold text-ink">{d18n.textSize}:</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleFontSize("sm")}
                  className="px-2.5 py-1 rounded-lg border-2 border-black text-xs font-black bg-surface hover:bg-surface-muted cursor-pointer active:scale-95 shadow-2xs"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => handleFontSize("md")}
                  className="px-2.5 py-1 rounded-lg border-2 border-black text-xs font-black bg-surface hover:bg-surface-muted cursor-pointer active:scale-95 shadow-2xs"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => handleFontSize("lg")}
                  className="px-2.5 py-1 rounded-lg border-2 border-black text-xs font-black bg-tea text-white cursor-pointer active:scale-95 shadow-2xs"
                >
                  A+
                </button>
              </div>
            </div>

            {/* Night Mode & Theme Studio */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={toggleHighContrast}
                className="flex-1 btn-tactile inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-black bg-surface px-3 py-2 text-xs font-black text-ink hover:bg-amber-100 cursor-pointer shadow-xs"
              >
                <Moon className="h-4 w-4" />
                <span>Night Mode</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playPress();
                  onClose();
                  setStudioOpen(true);
                }}
                className="flex-1 btn-tactile inline-flex items-center justify-center gap-1.5 rounded-xl border-2 border-black bg-amber-300 hover:bg-amber-400 px-3 py-2 text-xs font-black text-black cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <Sliders className="h-4 w-4 stroke-[2.5]" />
                <span>Theme Studio</span>
              </button>
            </div>
          </div>

          {/* 4. Regional Language Switcher */}
          <div>
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-mono font-black uppercase tracking-wider text-tea">
                {d18n.languages}
              </span>
              <span className="text-[10px] font-bold text-ink-secondary">
                11 Languages
              </span>
            </div>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {ALL_LANGUAGES.map((lang) => {
                const isSelected = locale === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleSelectLanguage(lang.code)}
                    className={`btn-tactile flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? "border-black bg-marigold text-white font-black shadow-[2px_2px_0px_#000]"
                        : "border-black/15 bg-surface hover:border-black text-ink font-bold text-xs"
                    }`}
                  >
                    <div className="flex flex-col truncate pr-1">
                      <span className="text-xs truncate">{lang.native}</span>
                      <span className="text-[9px] opacity-75 truncate">{lang.region}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5 shrink-0 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. 24/7 Emergency SOS Contacts */}
          <div className="rounded-2xl border-2 border-black bg-rose-50 p-4 shadow-[3px_3px_0px_#000] space-y-2.5">
            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-brick flex items-center gap-1.5">
              <PhoneCall className="h-3.5 w-3.5" />
              <span>{d18n.emergency}</span>
            </span>

            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href="tel:14416"
                className="flex-1 btn-tactile flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-surface hover:bg-emerald-100 text-ink px-3 py-2 text-xs font-black shadow-xs"
              >
                <PhoneCall className="h-3.5 w-3.5 text-tea" />
                <span>Tele-MANAS (14416)</span>
              </a>

              <a
                href="tel:108"
                className="flex-1 btn-tactile flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-brick hover:bg-red-700 text-white px-3 py-2 text-xs font-black shadow-[2px_2px_0px_#000]"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Ambulance (108)</span>
              </a>
            </div>
          </div>

          {/* 6. Live Connectivity & Architecture Status */}
          <div className="rounded-xl border border-black/20 bg-neutral-100 p-3 text-[11px] text-ink-secondary flex items-center justify-between">
            <div className="flex items-center gap-2">
              {systemStatus.isSpringOnline ? (
                <Radio className="h-3.5 w-3.5 text-tea animate-pulse" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-rose-700" />
              )}
              <span className="font-bold">
                {systemStatus.isSpringOnline ? d18n.systemOnline : d18n.systemOffline}
              </span>
            </div>
            <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-black/15">
              Port 8080 &bull; Ollama AI
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
