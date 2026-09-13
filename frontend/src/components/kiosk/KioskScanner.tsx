"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { Camera, Volume2, ShieldCheck, QrCode } from "lucide-react";
import { playTapFeedback } from "@/lib/sound";
import { speak } from "@/lib/speech";

interface KioskScannerProps {
  onScan: (text: string) => void;
  paused: boolean;
  isError?: boolean;
}

type ScanPhase = "idle" | "scanning" | "verifying";

const SCANNER_I18N: Record<
  string,
  {
    guidance: string;
    ready: string;
    verifying: string;
    initializing: string;
    flip: string;
    voiceGuidance: string;
    switchCamera: string;
    detectedTitle: string;
    detectedSub: string;
    alignPrompt: string;
    verifyingPrompt: string;
    startingCamera: string;
    permissionReq: string;
    secureAssurance: string;
  }
> = {
  en: {
    guidance: "Please hold your CogniCare Health Card QR code in front of the camera.",
    ready: "Scanner Ready",
    verifying: "Verifying...",
    initializing: "Initializing...",
    flip: "Flip",
    voiceGuidance: "Voice Guidance",
    switchCamera: "Switch Camera",
    detectedTitle: "QR Card Detected",
    detectedSub: "Verifying with secure server...",
    alignPrompt: "Align your Health Card QR code within the frame",
    verifyingPrompt: "Verifying patient registration...",
    startingCamera: "Starting camera...",
    permissionReq: "Camera Permission Required",
    secureAssurance: "Secure & Private QR Card Authentication",
  },
  as: {
    guidance: "অনুগ্ৰহ কৰি আপোনাৰ কগনিকেয়াৰ স্বাস্থ্য কাৰ্ডৰ কিউআৰ ক'ড কেমেৰাৰ সন্মুখত ধৰক।",
    ready: "স্কেনাৰ সাজু",
    verifying: "যাচাই চলি আছে...",
    initializing: "আৰম্ভ হৈছে...",
    flip: "কেমেৰা সলনি",
    voiceGuidance: "কণ্ঠ নিৰ্দেশনা",
    switchCamera: "কেমেৰা সলনি কৰক",
    detectedTitle: "কিউআৰ কাৰ্ড পোৱা গ'ল",
    detectedSub: "সুৰক্ষিত চাৰ্ভাৰৰ সৈতে পৰীক্ষা চলি আছে...",
    alignPrompt: "আপোনাৰ স্বাস্থ্য কাৰ্ডৰ কিউআৰ ক'ড ফ্ৰেমৰ মাজত ৰাখক",
    verifyingPrompt: "ৰোগীৰ পঞ্জীয়ন পৰীক্ষা কৰা হৈছে...",
    startingCamera: "কেমেৰা আৰম্ভ হৈছে...",
    permissionReq: "কেমেৰাৰ অনুমতি প্ৰয়োজন",
    secureAssurance: "সুৰক্ষিত আৰু ব্যক্তিগত কিউআৰ কাৰ্ড প্ৰমাণীকৰণ",
  },
  hi: {
    guidance: "कृपया अपना कॉग्नीकेयर हेल्थ कार्ड क्यूआर कोड कैमरे के सामने रखें।",
    ready: "स्कैनर तैयार",
    verifying: "सत्यापित हो रहा है...",
    initializing: "शुरू हो रहा है...",
    flip: "कैमरा बदलें",
    voiceGuidance: "आवाज़ मार्गदर्शन",
    switchCamera: "कैमरा बदलें",
    detectedTitle: "क्यूआर कार्ड मिला",
    detectedSub: "सुरक्षित सर्वर से सत्यापन हो रहा है...",
    alignPrompt: "अपने हेल्थ कार्ड का क्यूआर कोड फ्रेम के बीच में रखें",
    verifyingPrompt: "मरीज का पंजीकरण जांचा जा रहा है...",
    startingCamera: "कैमरा शुरू हो रहा है...",
    permissionReq: "कैमरा अनुमति आवश्यक",
    secureAssurance: "सुरक्षित और निजी क्यूआर कार्ड प्रमाणीकरण",
  },
  bn: {
    guidance: "অনুগ্রহ করে আপনার কগনিকেয়ার হেলথ কার্ডের কিউআর কোড ক্যামেরার সামনে ধরুন।",
    ready: "স্ক্যানার প্রস্তুত",
    verifying: "যাচাই করা হচ্ছে...",
    initializing: "শুরু হচ্ছে...",
    flip: "ক্যামেরা বদলান",
    voiceGuidance: "কণ্ঠ নির্দেশিকা",
    switchCamera: "ক্যামেরা পরিবর্তন",
    detectedTitle: "কিউআর কার্ড শনাক্ত হয়েছে",
    detectedSub: "নিরাপদ সার্ভার দিয়ে যাচাই করা হচ্ছে...",
    alignPrompt: "আপনার স্বাস্থ্য কার্ডের কিউআর কোড ফ্রেমের মধ্যে রাখুন",
    verifyingPrompt: "রোগীর নিবন্ধন যাচাই করা হচ্ছে...",
    startingCamera: "ক্যামেরা শুরু হচ্ছে...",
    permissionReq: "ক্যামেরার অনুমতি প্রয়োজন",
    secureAssurance: "নিরাপদ ও ব্যক্তিগত কিউআর কার্ড যাচাইকরণ",
  },
  mr: {
    guidance: "कृपया तुमचे कॉग्नीकेअर हेल्थ कार्ड क्यूआर कोड कॅमेऱ्यासमोर धरा.",
    ready: "स्कॅनर सज्ज",
    verifying: "पडताळणी सुरू आहे...",
    initializing: "सुरू होत आहे...",
    flip: "कॅमेरा बदला",
    voiceGuidance: "ध्वनी मार्गदर्शन",
    switchCamera: "कॅमेरा बदला",
    detectedTitle: "क्यूआर कार्ड आढळले",
    detectedSub: "सुरक्षित सर्व्हरसह पडताळणी सुरू आहे...",
    alignPrompt: "तुमचे आरोग्य कार्ड क्यूआर कोड फ्रेममध्ये ठेवा",
    verifyingPrompt: "रुग्ण नोंदणी पडताळली जात आहे...",
    startingCamera: "कॅमेरा सुरू होत आहे...",
    permissionReq: "कॅमेरा परवानगी आवश्यक",
    secureAssurance: "सुरक्षित आणि खाजगी क्यूआर कार्ड प्रमाणीकरण",
  },
  ne: {
    guidance: "कृपया आफ्नो कग्नीकेयर स्वास्थ्य कार्डको क्यूआर कोड क्यामेराको अगाडि राख्नुहोस्।",
    ready: "स्क्यानर तयार",
    verifying: "प्रमाणीकरण हुँदैछ...",
    initializing: "सुरु हुँदैछ...",
    flip: "क्यामेरा बदल्नुहोस्"  ,
    voiceGuidance: "आवाज निर्देशन",
    switchCamera: "क्यामेरा फेर्नुहोस्",
    detectedTitle: "क्यूआर कार्ड फेला पर्यो",
    detectedSub: "सुरक्षित सर्भरबाट प्रमाणीकरण हुँदैछ...",
    alignPrompt: "आफ्नो स्वास्थ्य कार्ड क्यूआर कोड फ्रेमभित्र मिलाउनुहोस्",
    verifyingPrompt: "बिरामी दर्ता प्रमाणीकरण हुँदैछ...",
    startingCamera: "क्यामेरा सुरु हुँदैछ...",
    permissionReq: "क्यामेरा अनुमति आवश्यक",
    secureAssurance: "सुरक्षित र निजी क्यूआर कार्ड प्रमाणीकरण",
  },
  mni: {
    guidance: "চানবীদুনা অদোমগী কোগনিকেয়র হকশেল কার্দগী ক্যুরার কোদ ক্যামেরাগী মাংদা থম্বীয়ু।",
    ready: "স্ক্যানার শেম-শারে",
    verifying: "লেপ্নরি...",
    initializing: "হৌদোকপগী ফীভম...",
    flip: "ক্যামেরা হোংদোকপা",
    voiceGuidance: "খোন্থোক্কী ৱাফম",
    switchCamera: "ক্যামেরা হোংদোকউ",
    detectedTitle: "ক্যুরার কার্দ থেংনরে",
    detectedSub: "অচেৎপা সর্ভরগা লোয়ননা লেপ্নরি...",
    alignPrompt: "অদোমগী হকশেল কার্দ ক্যুরার কোদ ফ্রেম মনুংদা থম্বীয়ু",
    verifyingPrompt: "অনাবগী মিং চনবা য়েংশিল্লি...",
    startingCamera: "ক্যামেরা হৌরে...",
    permissionReq: "ক্যামেরা অয়াবা চঙই",
    secureAssurance: "অচেৎপা অমসুং লোনচৎপা ক্যুরার কার্দ চেক তৌবা",
  },
  brx: {
    guidance: "अननानै नोंथांनि कगनिकेयार देहा कार्ड क्यूआर कोडखौ केमेरायाव दिन्थि।",
    ready: "स्कैनार थियारि",
    verifying: "नायबिजिरगासिनो...",
    initializing: "जागायगासिनो...",
    flip: "केमेरा सोलाय",
    voiceGuidance: "राव बिथोन",
    switchCamera: "केमेरा सोलाय",
    detectedTitle: "क्यूआर कार्ड मोनबाय",
    detectedSub: "रैखाथि सार्भारजों नायबिजिरगासिनो...",
    alignPrompt: "नोंथांनि देहा कार्ड क्यूआर कोडखौ फ्रेम आव लाखि",
    verifyingPrompt: "मरीज मुं थिसननायखौ नायबिजिरगासिनो...",
    startingCamera: "केमेरा जागायगासिनो...",
    permissionReq: "केमेरा गनायथि नांगौ",
    secureAssurance: "रैखाथि आरो गुबुननि मोनदांङि क्यूआर कार्ड नायबिजिरनाय",
  },
  grt: {
    guidance: "Onsongba CogniCare Health Card QR code-ko camerani skang-o dondapbo.",
    ready: "Scanner Tariaha",
    verifying: "Niena man∙enga...",
    initializing: "A∙bachengenga...",
    flip: "Camera Sregimin",
    voiceGuidance: "Ku∙rangni Niam",
    switchCamera: "Camerako sregrikbo",
    detectedTitle: "QR Card Nikaha",
    detectedSub: "Server baksa tik ka∙enga...",
    alignPrompt: "Na∙simangni health card QR code-ko frame-o dondapbo",
    verifyingPrompt: "Sagipako register ka∙aniko nina man∙enga...",
    startingCamera: "Camerako a∙bachengenga...",
    permissionReq: "Camera bilko nanga",
    secureAssurance: "Tik ong∙gipa aro Srikgipa QR Card Authentication",
  },
  kha: {
    guidance: "Sngewbha pyni ia ka CogniCare Health Card QR code ha khmat ka camera.",
    ready: "La Kloi ka Scanner",
    verifying: "Dang pynshisha...",
    initializing: "Dang sdang...",
    flip: "Pynkylla Camera",
    voiceGuidance: "Jingbthah ha ka Sur",
    switchCamera: "Pynkylla Camera",
    detectedTitle: "La Lap ia ka QR Card",
    detectedSub: "Dang pynshisha bad ka server...",
    alignPrompt: "Buh ia ka QR code jong ka health card ha pdeng ka frame",
    verifyingPrompt: "Dang pynshisha ia ka jingregister u nongpang...",
    startingCamera: "Dang plied ia ka camera...",
    permissionReq: "Donkam jingbit camera",
    secureAssurance: "Ka Jingpynshisha QR Card kaba Skhem bad Barieh",
  },
  lus: {
    guidance: "Khawngaihin i CogniCare Health Card QR code chu camera hmaah hian dah rawh.",
    ready: "Scanner A Inpeih Ta",
    verifying: "Finfiah mek a ni...",
    initializing: "Tih nun mek...",
    flip: "Camera Thlakna",
    voiceGuidance: "Aw Hmanga Hriattirna",
    switchCamera: "Camera Thlak Rawh",
    detectedTitle: "QR Card Hmuh A Ni Ta",
    detectedSub: "Server rintlak nen finfiah mek a ni...",
    alignPrompt: "I health card QR code chu frame chhungah dah rawh",
    verifyingPrompt: "Damlo inziah luhna finfiah mek a ni...",
    startingCamera: "Camera tih nun mek a ni...",
    permissionReq: "Camera Phalna A Ngai",
    secureAssurance: "QR Card Finfiahna Rintlak leh Puanzar Loh",
  },
};

export function KioskScanner({ onScan, paused, isError }: KioskScannerProps) {
  const id = useId();
  const containerId = "qr-reader-" + id.replace(/[^a-zA-Z0-9]/g, "");
  const locale = useLocale();
  const s18n = SCANNER_I18N[locale] || SCANNER_I18N.en;
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const startedRef = useRef(false);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState<string | null>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const phase: ScanPhase = cameraReady
    ? paused
      ? isError
        ? "scanning"
        : "verifying"
      : "scanning"
    : "idle";

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  const speakGuidance = () => {
    playTapFeedback();
    speak(s18n.guidance, locale, 0.9);
  };

  /* ── Start / stop camera ── */
  useEffect(() => {
    const scanner = new Html5Qrcode(containerId, { verbose: false });
    scannerRef.current = scanner;
    let disposed = false;
    let hasStarted = false;

    const stopScanner = (s: Html5Qrcode) => {
      try {
        const state = s.getState();
        if (
          state === Html5QrcodeScannerState.SCANNING ||
          state === Html5QrcodeScannerState.PAUSED
        ) {
          s.stop()
            .then(() => {
              try {
                s.clear();
              } catch {
                /* element may already be cleaned up */
              }
            })
            .catch(() => {
              /* camera already released */
            });
        }
      } catch {
        /* safely catch synchronous state exceptions */
      }
    };

    // Start scanner without qrbox to prevent html5-qrcode from injecting duplicate white boxes
    scanner
      .start(
        { facingMode: facingMode },
        { fps: 15 },
        (decodedText) => {
          onScanRef.current(decodedText);
        },
        () => {
          // No-op for unrecognized frames — keep scanning.
        }
      )
      .then(() => {
        if (disposed) {
          stopScanner(scanner);
          return;
        }
        hasStarted = true;
        startedRef.current = true;
        setCameraReady(true);
      })
      .catch(() => {
        if (disposed) return;
        setError(
          "Camera unavailable. Please check your camera permissions in browser settings and reload."
        );
      });

    return () => {
      disposed = true;
      startedRef.current = false;
      scannerRef.current = null;
      if (hasStarted) {
        stopScanner(scanner);
      }
    };
  }, [containerId, facingMode]);

  /* ── Pause / resume ── */
  useEffect(() => {
    const scanner = scannerRef.current;
    if (!scanner || !startedRef.current) return;
    try {
      const state = scanner.getState();
      if (paused) {
        if (state === Html5QrcodeScannerState.SCANNING) {
          scanner.pause(false);
        }
      } else {
        if (state === Html5QrcodeScannerState.PAUSED) {
          scanner.resume();
        }
      }
    } catch {
      /* ignore mismatch */
    }
  }, [paused]);

  const toggleCamera = () => {
    playTapFeedback();
    setCameraReady(false);
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const isScanning = phase === "scanning";
  const isVerifying = phase === "verifying";

  return (
    <div className="w-full max-w-[420px] mx-auto">
      {/* ── Kiosk Viewfinder Card ── */}
      <div className="rounded-2xl border-3 border-black bg-surface overflow-hidden shadow-[5px_5px_0px_#000]">
        {/* Top Scanner HUD Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-ink text-white border-b-2 border-black">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black tracking-wider uppercase">
              {isScanning ? s18n.ready : isVerifying ? s18n.verifying : s18n.initializing}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={speakGuidance}
              title={s18n.voiceGuidance}
              className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <Volume2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={toggleCamera}
              title={s18n.switchCamera}
              className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
            >
              <Camera className="h-3.5 w-3.5" />
              <span className="text-[10px]">{s18n.flip}</span>
            </button>
          </div>
        </div>

        {/* Camera feed area */}
        <div className="relative bg-black min-h-[300px] flex items-center justify-center overflow-hidden">
          <div id={containerId} className="w-full aspect-square object-cover" aria-label="QR code camera view" />

          {/* ── Clean Single Square Reticle Overlay ── */}
          {isScanning && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="relative w-[230px] h-[230px] border border-white/20 rounded-xl">
                {/* 4 Clean Glowing Corner Brackets */}
                <span className="absolute -top-[2px] -left-[2px] w-7 h-7 border-t-[3.5px] border-l-[3.5px] border-emerald-400 rounded-tl-lg shadow-[0_0_8px_#10B981]" />
                <span className="absolute -top-[2px] -right-[2px] w-7 h-7 border-t-[3.5px] border-r-[3.5px] border-emerald-400 rounded-tr-lg shadow-[0_0_8px_#10B981]" />
                <span className="absolute -bottom-[2px] -left-[2px] w-7 h-7 border-b-[3.5px] border-l-[3.5px] border-emerald-400 rounded-bl-lg shadow-[0_0_8px_#10B981]" />
                <span className="absolute -bottom-[2px] -right-[2px] w-7 h-7 border-b-[3.5px] border-r-[3.5px] border-emerald-400 rounded-br-lg shadow-[0_0_8px_#10B981]" />

                {/* Single Sweeping Green Laser Line */}
                <div className="absolute left-0 right-0 h-[2.5px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent laser-line shadow-[0_0_10px_#10B981]" />
              </div>
            </div>
          )}

          {/* ── Verifying Token HUD Overlay ── */}
          {isVerifying && (
            <div className="absolute inset-0 bg-ink/85 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-20">
              <div className="relative flex items-center justify-center">
                <div className="w-14 h-14 rounded-full border-3 border-emerald-400 border-t-transparent animate-spin" />
                <ShieldCheck className="h-7 w-7 text-emerald-400 absolute" />
              </div>
              <div className="text-center px-4">
                <p className="text-white font-serif font-black text-lg tracking-tight">
                  {s18n.detectedTitle}
                </p>
                <p className="text-emerald-300 font-bold text-xs mt-0.5">
                  {s18n.detectedSub}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Helper Status Bar ── */}
        <div className="px-3.5 py-2.5 bg-[#FAF6F0] border-t-2 border-black flex items-center justify-center text-center">
          <p className="font-bold text-ink text-xs sm:text-sm flex items-center gap-1.5">
            <QrCode className="h-4 w-4 text-tea shrink-0" />
            <span>
              {isScanning
                ? s18n.alignPrompt
                : isVerifying
                ? s18n.verifyingPrompt
                : s18n.startingCamera}
            </span>
          </p>
        </div>
      </div>

      {/* ── Camera Error Alert ── */}
      {error && (
        <div
          role="alert"
          className="mt-3 rounded-xl bg-brick-light border-2 border-brick p-3 text-brick font-bold text-center text-xs shadow-[2px_2px_0px_var(--color-brick)]"
        >
          <p className="font-black text-sm mb-0.5">{s18n.permissionReq}</p>
          <p className="text-[11px] text-brick/90">{error}</p>
        </div>
      )}

      {/* ── Security & Privacy Assurance ── */}
      <p className="flex items-center justify-center gap-1.5 text-center text-ink-secondary/70 text-xs font-bold mt-2.5">
        <ShieldCheck className="h-3.5 w-3.5 text-tea" />
        <span>{s18n.secureAssurance}</span>
      </p>
    </div>
  );
}
