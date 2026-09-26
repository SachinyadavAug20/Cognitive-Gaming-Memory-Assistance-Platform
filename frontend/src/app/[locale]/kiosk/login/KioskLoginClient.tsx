"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  Paperclip,
  CheckCircle2,
  Check,
  RotateCcw,
  AlertTriangle,
  QrCode,
  HeartHandshake,
} from "lucide-react";
import { KioskScanner } from "@/components/kiosk/KioskScanner";
import { useAuthStore } from "@/store/useAuthStore";
import { playScanSuccess, playTapFeedback } from "@/lib/sound";
import type { PatientProfile } from "@/types/auth";
import { getCustomOnboardedPatients } from "@/data/mockPatients";

type ScanStatus = "scanning" | "loading" | "success" | "error";

const KIOSK_PAGE_I18N: Record<
  string,
  {
    headerTag: string;
    returnHome: string;
    qrBadge: string;
    activeSession: string;
    welcomeBack: (name: string) => string;
    tapAutoLogin: string;
    scannerHint: string;
    cardVerified: string;
    signingIn: string;
    notRecognized: string;
    scanAgain: string;
    abdmTag: string;
    chwAssisted: string;
  }
> = {
  en: {
    headerTag: "MDoNER Health Kiosk // QR Card Terminal",
    returnHome: "← Return to Home",
    qrBadge: "Health Card QR Login",
    activeSession: "Active 30-Day Session Found",
    welcomeBack: (name) => `Welcome back, ${name}`,
    tapAutoLogin: "Tap Scanner to Auto-Login",
    scannerHint: "Click scanner below to enter • Or hold a new card to switch patient",
    cardVerified: "Card Verified",
    signingIn: "Signing you into your daily therapy session...",
    notRecognized: "Health Card Not Recognized",
    scanAgain: "Scan Again",
    abdmTag: "Ayushman Bharat Digital Mission (ABDM) Compatible Kiosk",
    chwAssisted: "Community Health Worker Assisted",
  },
  as: {
    headerTag: "MDoNER স্বাস্থ্য কিয়স্ক // কিউআৰ কাৰ্ড টাৰ্মিনেল",
    returnHome: "← ঘৰলৈ উভতি যাওক",
    qrBadge: "স্বাস্থ্য কাৰ্ড কিউআৰ প্ৰৱেশ",
    activeSession: "সক্ৰিয় ৩০ দিনৰ অধিৱেশন পোৱা গ'ল",
    welcomeBack: (name) => `স্বাগতম, ${name}`,
    tapAutoLogin: "স্বয়ংক্ৰিয় প্ৰৱেশৰ বাবে স্কেনাৰত স্পৰ্শ কৰক",
    scannerHint: "প্ৰৱেশ কৰিবলৈ তলৰ স্কেনাৰত টিপক • বা নতুন কাৰ্ড ধৰক",
    cardVerified: "কাৰ্ড সত্যায়িত হৈছে",
    signingIn: "আপোনাক দৈনিক থেৰাপী অধিবেশনলৈ প্ৰৱেশ কৰোৱা হৈছে...",
    notRecognized: "স্বাস্থ্য কাৰ্ড চিনাক্ত নহ'ল",
    scanAgain: "পুনৰ স্কেন কৰক",
    abdmTag: "আয়ুষ্মান ভাৰত ডিজিটেল মিছন (ABDM) সমৰ্থিত কিয়স্ক",
    chwAssisted: "আশা আৰু স্বাস্থ্যকৰ্মী সহায়ক",
  },
  hi: {
    headerTag: "MDoNER स्वास्थ्य कियोस्क // क्यूआर कार्ड टर्मिनल",
    returnHome: "← मुख्य पृष्ठ पर लौटें",
    qrBadge: "हेल्थ कार्ड क्यूआर लॉगिन",
    activeSession: "सक्रिय 30-दिवसीय सत्र मिला",
    welcomeBack: (name) => `स्वागत है, ${name}`,
    tapAutoLogin: "ऑटो-लॉगिन के लिए स्कैनर दबाएं",
    scannerHint: "प्रवेश के लिए स्कैनर पर टैप करें • या नया कार्ड दिखाएं",
    cardVerified: "कार्ड सत्यापित",
    signingIn: "आपको दैनिक थेरेपी सत्र में प्रवेश कराया जा रहा है...",
    notRecognized: "हेल्थ कार्ड पहचाना नहीं गया",
    scanAgain: "फिर से स्कैन करें",
    abdmTag: "आयुष्मान भारत डिजिटल मिशन (ABDM) अनुकूल कियोस्क",
    chwAssisted: "सामुदायिक स्वास्थ्य कार्यकर्ता सहायतित",
  },
  bn: {
    headerTag: "MDoNER স্বাস্থ্য কিয়স্ক // কিউআর কার্ড টার্মিনাল",
    returnHome: "← হোমে ফিরে যান",
    qrBadge: "স্বাস্থ্য কার্ড কিউআর লগইন",
    activeSession: "সক্রিয় ৩০ দিনের সেশন পাওয়া গেছে",
    welcomeBack: (name) => `স্বাগতম, ${name}`,
    tapAutoLogin: "অটো-লগইনের জন্য স্ক্যানারে ট্যাপ করুন",
    scannerHint: "প্রবেশ করতে স্ক্যানারে ট্যাপ করুন • বা নতুন কার্ড ধরুন",
    cardVerified: "কার্ড যাচাইকৃত",
    signingIn: "আপনার দৈনিক থেরাপি সেশনে প্রবেশ করানো হচ্ছে...",
    notRecognized: "স্বাস্থ্য কার্ড চিহ্নিত হয়নি",
    scanAgain: "আবার স্ক্যান করুন",
    abdmTag: "আয়ুষ্মান ভারত ডিজিটাল মিশন (ABDM) সমর্থিত কিয়স্ক",
    chwAssisted: "স্বাস্থ্যকর্মী সহায়তাপ্রাপ্ত",
  },
  mr: {
    headerTag: "MDoNER आरोग्य किऑस्क // क्यूआर कार्ड टर्मिनल",
    returnHome: "← मुख्यपृष्ठावर परत जा",
    qrBadge: "आरोग्य कार्ड क्यूआर लॉगिन",
    activeSession: "सक्रिय ३० दिवसांचे सत्र सापडले",
    welcomeBack: (name) => `स्वागत आहे, ${name}`,
    tapAutoLogin: "ऑटो-लॉगिनसाठी स्कॅनरवर टॅप करा",
    scannerHint: "प्रवेशासाठी स्कॅनरवर टॅप करा • किंवा नवीन कार्ड दाखवा",
    cardVerified: "कार्ड पडताळले",
    signingIn: "तुमच्या दैनंदिन थेरपी सत्रात लॉगिन केले जात आहे...",
    notRecognized: "आरोग्य कार्ड ओळखले नाही",
    scanAgain: "पुन्हा स्कॅन करा",
    abdmTag: "आयुष्मान भारत डिजिटल मिशन (ABDM) सुसंगत किऑस्क",
    chwAssisted: "समुदाय आरोग्य कार्यकर्ता सहाय्यक",
  },
  ne: {
    headerTag: "MDoNER स्वास्थ्य कियोस्क // क्यूआर कार्ड टर्मिनल",
    returnHome: "← गृहपृष्ठमा फर्कनुहोस्",
    qrBadge: "स्वास्थ्य कार्ड क्यूआर लगइन",
    activeSession: "सक्रिय ३०-दिने सत्र फेला पर्यो",
    welcomeBack: (name) => `स्वागत छ, ${name}`,
    tapAutoLogin: "स्वतः लगइनका लागि स्क्यानर थिच्नुहोस्",
    scannerHint: "प्रवेश गर्न स्क्यानरमा थिच्नुहोस् • वा नयाँ कार्ड देखाउनुहोस्",
    cardVerified: "कार्ड प्रमाणित",
    signingIn: "तपाईंलाई दैनिक थेरापी सत्रमा प्रवेश गराइँदैछ...",
    notRecognized: "स्वास्थ्य कार्ड चिनिएन"  ,
    scanAgain: "फेरि स्क्यान गर्नुहोस्",
    abdmTag: "आयुष्मान भारत डिजिटल मिसन (ABDM) अनुकूल कियोस्क",
    chwAssisted: "सामुदायिक स्वास्थ्य कार्यकर्ता समर्थित",
  },
  mni: {
    headerTag: "MDoNER হকশেল কিয়োস্ক // ক্যুরার কার্দ তরমিনেল",
    returnHome: "← ময়ুমদা হল্লকপা",
    qrBadge: "হকশেল কার্দ ক্যুরার চঙবা",
    activeSession: "নুমিৎ ৩০গী সেসন থেংনরে",
    welcomeBack: (name) => `তরাম্না ওকচরি, ${name}`,
    tapAutoLogin: "ইশানা চঙনবগীদমক স্ক্যানার নম্বীয়ু",
    scannerHint: "চঙনবগীদমক নম্বীয়ু • নত্রগা অনৌবা কার্দ পুথোকউ",
    cardVerified: "কার্দ চেক তৌরে",
    signingIn: "নুমিৎ খুদিংগী থেরাপী সেসন্দা চঙহল্লি...",
    notRecognized: "হকশেল কার্দ খঙদ্রে",
    scanAgain: "অমুক হন্না স্ক্যান তৌউ",
    abdmTag: "আয়ুশ্মান ভারত দিজিতেল মিশন (ABDM) কিওস্ক",
    chwAssisted: "হকশেল মীহুৎনা মতেং পাংবা",
  },
  brx: {
    headerTag: "MDoNER देहा कियस्क // क्यूआर कार्ड तार्मिनैल",
    returnHome: "← नआव थांफिन",
    qrBadge: "देहा कार्ड क्यूआर हाबनाय",
    activeSession: "३०-साननि सेसन मोनबाय",
    welcomeBack: (name) => `बरायबाय, ${name}`,
    tapAutoLogin: "गावनो हाबनो स्कॅनार आव थु",
    scannerHint: "हाबनो स्कॅनार आव थु • एबा गोदान कार्ड दिन्थि",
    cardVerified: "कार्ड थार जाबाय",
    signingIn: "सानफ्रोमबोनि थांखियाव थिसनगासिनो...",
    notRecognized: "देहा कार्ड सिनायियाखै",
    scanAgain: "आरोबाव स्कैन खालाम",
    abdmTag: "आयुष्मान भारत डिजिटल मिसन (ABDM) कियस्क",
    chwAssisted: "देहा हेफाजाबगिरिजों लोगोसे",
  },
  grt: {
    headerTag: "MDoNER An∙sengani Kiosk // QR Card Terminal",
    returnHome: "← Nokona Re∙bapilbo",
    qrBadge: "Health Card QR Napani",
    activeSession: "Sal 30-na session nikaha",
    welcomeBack: (name) => `Rimdapsogimin, ${name}`,
    tapAutoLogin: "Napna gita Scannero nangatbo",
    scannerHint: "Napna scannero nangatbo • Gital cardko mesokbo",
    cardVerified: "Cardko nina man∙aha",
    signingIn: "Salanti sanani kamo napenga...",
    notRecognized: "Health Cardko U∙ina man∙ja",
    scanAgain: "Pil∙ta Scan Ka∙bo",
    abdmTag: "Ayushman Bharat Digital Mission (ABDM) Kiosk",
    chwAssisted: "Sam Sa∙gipani Dakchakani",
  },
  kha: {
    headerTag: "MDoNER Kiosk Jingkoit-Jingkhiah // Terminal QR Card",
    returnHome: "← Phai sha Iing",
    qrBadge: "Jingrung lyngba ka QR Card",
    activeSession: "La lap ia ka session 30 sngi",
    welcomeBack: (name) => `Pdiang burom, ${name}`,
    tapAutoLogin: "Khad ia ka scanner ban rung noh",
    scannerHint: "Khad ban rung • lane pyni da kawei pat ka card",
    cardVerified: "La Pynshisha ia ka Card",
    signingIn: "Dang pynrung ia phi sha ka jingpynkhiah...",
    notRecognized: "Ym Ithuh ia ka Health Card",
    scanAgain: "Scan Pat Sa Shisien",
    abdmTag: "Ayushman Bharat Digital Mission (ABDM) Kiosk",
    chwAssisted: "Yarap da ki Nongtrei Jingkoit-Jingkhiah",
  },
  lus: {
    headerTag: "MDoNER Hriselna Kiosk // QR Card Terminal",
    returnHome: "← In lamah kir leh raw",
    qrBadge: "Health Card QR Luhna",
    activeSession: "Ni 30 chhung atan session hmuh a ni",
    welcomeBack: (name) => `Lo lawm leh rawh le, ${name}`,
    tapAutoLogin: "Luh nan Scanner hmet rawh",
    scannerHint: "Luh nan hmet rawh • Card thar hmangin damlo thlak theih",
    cardVerified: "Card Finfiah A Ni Ta",
    signingIn: "Nitin inenkawlnaah hruai luh mek i ni...",
    notRecognized: "Health Card Hriat A Ni Lo",
    scanAgain: "Scan Leh Rawh",
    abdmTag: "Ayushman Bharat Digital Mission (ABDM) Kiosk",
    chwAssisted: "Khawtlang Hriselna Thawktu Puihna",
  },
};

export function KioskLoginClient() {
  const router = useRouter();
  const t = useTranslations("kiosk");
  const locale = useLocale();
  const kp18n = KIOSK_PAGE_I18N[locale] || KIOSK_PAGE_I18N.en;
  const login = useAuthStore((s) => s.login);

  const [status, setStatus] = useState<ScanStatus>("scanning");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [verifiedPatient, setVerifiedPatient] = useState<{
    name: string;
    id: number;
    language?: string;
  } | null>(null);

  const busyRef = useRef(false);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason?.name || String(event.reason);
      if (
        reason.includes("AbortError") ||
        reason.includes("aborted by the user agent") ||
        reason.includes("media resource")
      ) {
        event.preventDefault();
      }
    };
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    return () => window.removeEventListener("unhandledrejection", handleUnhandledRejection);
  }, []);

  const completeLoginSuccess = useCallback(
    (token: string, patient: PatientProfile) => {
      playScanSuccess();
      setVerifiedPatient({
        name: patient.name,
        id: patient.id,
        language: patient.languagePreference || "en",
      });
      setStatus("success");

      login(token, patient);

      // Smooth auto-redirect after celebration card animation
      setTimeout(() => {
        router.push("/patient");
      }, 1100);
    },
    [login, router]
  );

  const handleScan = useCallback(
    (text: string) => {
      if (busyRef.current) return;
      busyRef.current = true;
      setStatus("loading");
      playTapFeedback();

      const trimmed = text.trim();
      // Check custom onboarded patients
      const custom = getCustomOnboardedPatients();
      const found = custom.find(
        (p) =>
          p.card?.secureToken === trimmed ||
          String(p.id) === trimmed ||
          `demo-token-${p.id}` === trimmed
      );
      if (found) {
        completeLoginSuccess("demo-jwt-token-custom", {
          id: found.id,
          name: found.name,
          languagePreference: found.preferredLanguage || "en",
        });
        return;
      }

      // Default demo login as Biren Borah
      completeLoginSuccess("demo-jwt-token-biren", {
        id: 2,
        name: "Biren Borah",
        languagePreference: "as",
      });
    },
    [completeLoginSuccess]
  );

  const resetScanner = () => {
    playTapFeedback();
    busyRef.current = false;
    setErrorMsg(null);
    setStatus("scanning");
  };

  return (
    <main className="min-h-screen bg-canvas paper-texture flex flex-col justify-between px-4 pt-5 pb-24 md:py-8">
      {/* Top Header Navigation */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between pb-3 border-b-2 border-black/10">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-tea" />
          <span className="text-xs font-black uppercase tracking-wider text-ink">
            {kp18n.headerTag}
          </span>
        </div>
        <Link
          href="/"
          className="text-xs font-black text-ink-secondary hover:text-ink transition-colors"
        >
          {kp18n.returnHome}
        </Link>
      </div>

      {/* Main Kiosk Center Section */}
      <div className="w-full max-w-xl mx-auto my-auto flex flex-col items-center text-center py-4">
        <div className="mb-4 w-full">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tea-light border border-tea/30 text-tea-dark text-xs font-black mb-2 shadow-sm">
            <QrCode className="h-3.5 w-3.5" />
            <span>{kp18n.qrBadge}</span>
          </div>
          <h1 className="font-serif font-black text-2xl md:text-4xl text-ink leading-tight">
            {t("title")}
          </h1>
          <p className="mt-1 text-sm md:text-base font-bold text-ink-secondary max-w-md mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Scanner Container with Overlay States */}
        <div className="relative w-full max-w-[420px] mx-auto">
          <KioskScanner
            onScan={handleScan}
            paused={status !== "scanning"}
            isError={status === "error"}
          />

          {/* ── SUCCESS OVERLAY MODAL ── */}
          {status === "success" && verifiedPatient && (
            <div className="absolute inset-0 bg-surface rounded-2xl border-3 border-black p-6 shadow-[6px_6px_0px_#000] flex flex-col items-center justify-between z-30 scan-success-overlay">
              <div className="w-full flex flex-col items-center my-auto">
                {/* Green Check Shield Animation */}
                <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-white flex items-center justify-center border-3 border-black shadow-[3px_3px_0px_#000] mb-3 scan-check-pop">
                  <CheckCircle2 className="h-10 w-10 stroke-[2.5]" />
                </div>

                <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black uppercase tracking-wider mb-2">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                  <span>{kp18n.cardVerified}</span>
                </span>

                <h2 className="font-serif font-black text-2xl md:text-3xl text-ink">
                  {verifiedPatient.name}
                </h2>
                <p className="text-xs font-bold text-ink-secondary mt-1">
                  {kp18n.signingIn}
                </p>
              </div>

              {/* Progress Redirect Bar */}
              <div className="w-full mt-4">
                <div className="w-full bg-surface-muted h-2.5 rounded-full overflow-hidden border-2 border-black">
                  <div className="bg-tea h-full w-full rounded-full transition-all duration-1000 animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* ── ERROR ALERT STATE ── */}
          {status === "error" && errorMsg && (
            <div className="absolute inset-0 bg-surface/95 backdrop-blur-xs rounded-2xl border-3 border-brick p-6 shadow-[5px_5px_0px_var(--color-brick)] flex flex-col items-center justify-center text-center z-30">
              <div className="w-14 h-14 rounded-2xl bg-brick text-white flex items-center justify-center mb-3 shadow-md">
                <AlertTriangle className="h-8 w-8 stroke-[2.5]" />
              </div>
              <h3 className="font-serif font-black text-lg text-brick">
                {kp18n.notRecognized}
              </h3>
              <p className="text-xs font-bold text-ink-secondary mt-1.5 max-w-xs leading-relaxed">
                {errorMsg}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                <button
                  type="button"
                  onClick={resetScanner}
                  className="btn-chunky btn-chunky-tea text-xs font-black cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>{kp18n.scanAgain}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Footer Details */}
      <footer className="w-full max-w-3xl mx-auto pt-3 text-center text-xs font-bold text-ink-secondary/70 flex flex-wrap items-center justify-between gap-2 border-t-2 border-black/10">
        <div className="flex items-center gap-1">
          <HeartHandshake className="h-3.5 w-3.5 text-tea" />
          <span>{kp18n.abdmTag}</span>
        </div>
        <div>
          <span>{kp18n.chwAssisted}</span>
        </div>
      </footer>
    </main>
  );
}
