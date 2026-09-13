"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  RotateCcw,
  Sparkles,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
  Disc3,
  Flame,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playComplete, playLifeSong } from "@/lib/sound";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { startLevel } from "@/games/config";
import { getGameStrings, SupportedLocale } from "@/lib/gameI18n";

function GameShell({
  title,
  score,
  children,
}: {
  title: string;
  score: number;
  children: React.ReactNode;
}) {
  return (
    <section className="pb-12 min-h-screen bg-canvas">
      <GameHeader
        title={title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-amber-900"
        gameId="majuli-pottery"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

interface PotteryUiStrings {
  clinicalTitle: string;
  benefit1: string;
  benefit2: string;
  benefit3: string;
  pressInward: string;
  flareOutward: string;
  sacredKiln: string;
  terracottaReady: string;
  targetMatch: (score: number) => string;
  riverFlute: string;
  vessels: {
    doiHari: { name: string; desc: string };
    saki: { name: string; desc: string };
  };
  points: {
    rim: string;
    neck: string;
    belly: string;
    base: string;
  };
}

const POTTERY_I18N: Record<SupportedLocale, PotteryUiStrings> = {
  en: {
    clinicalTitle: "Clinical Benefits:",
    benefit1: "Bilateral fine-motor pressure calibration & finger dexterity",
    benefit2: "Constructional shape recognition & visual-spatial matching",
    benefit3: "Centering meditation and soothing sensory lathe rotation",
    pressInward: "Press Inward",
    flareOutward: "Flare Outward",
    sacredKiln: "Clay Fired in Sacred Kiln",
    terracottaReady: "Terracotta Vessel Ready",
    targetMatch: (score) => `Artisanal Form: ${score}% Target Match`,
    riverFlute: "Play Majuli River Flute",
    vessels: {
      doiHari: { name: "Assamese Doi Hari (Curd Vessel)", desc: "A wide-bellied traditional earthen pot crafted for cool curd fermentation on Majuli Island." },
      saki: { name: "Sacred Bihu Clay Lamp (Mati Saki)", desc: "An open, flared earthen oil lamp lighted during Kati Bihu harvest prayers." },
    },
    points: { rim: "Smooth Top Rim", neck: "Curved Neck", belly: "Wide Round Belly", base: "Stable Solid Base" },
  },
  as: {
    clinicalTitle: "চিকিৎসাজনিত উপকাৰিতা:",
    benefit1: "হাতৰ আঙুলিৰ সূক্ষ্ম সঞ্চালন আৰু স্পৰ্শ অনুভূতি উন্নত কৰে",
    benefit2: "আকৃতি আৰু স্থানিক ভাৰসাম্য চিনাক্তকৰণত সহায় কৰে",
    benefit3: "চকা ঘূৰোৱাৰ প্ৰশান্তিদায়ক অনুভূতিয়ে মন স্থিৰ ৰাখে",
    pressInward: "ভিতৰলৈ চাপক",
    flareOutward: "বাহিৰলৈ বহলাওক",
    sacredKiln: "আৱেলিৰ পৱিত্ৰ শালিত মাটিৰ পাত্ৰ পুৰা হ'ল",
    terracottaReady: "মাটিৰ পাত্ৰ প্ৰস্তুত",
    targetMatch: (score) => `শিল্পকলাৰ নিখুঁততা: ${score}% মিল পাইছে`,
    riverFlute: "মাজুলীৰ বাঁহীৰ সুৰ শুনক",
    vessels: {
      doiHari: { name: "মাজুলীৰ দৈৰ হাড়ি", desc: "মাজুলীৰ কুমাৰসকলে দৈ গোটাবলৈ বনোৱা পৰম্পৰাগত মাটিৰ বহল পাত্ৰ।" },
      saki: { name: "কাতি বিহুৰ মাটিৰ চাকি", desc: "কাতি বিহুত পথাৰত আৰু তুলসীৰ তলত জ্বলোৱা পৱিত্ৰ মাটিৰ চাকি।" },
    },
    points: { rim: "পাত্ৰৰ ওপৰৰ মুখ", neck: "সুন্দৰ ডিঙি", belly: "গোল ডাঙৰ পেট", base: "দৃঢ় মজবুত তলনি" },
  },
  hi: {
    clinicalTitle: "चिकित्सीय लाभ:",
    benefit1: "उंगलियों की सूक्ष्म गतिशीलता और दबाव नियंत्रण में सुधार",
    benefit2: "स्थानिक दृष्टि और आकार पहचानने की क्षमता मजबूत करता है",
    benefit3: "चाक का घूमना मन को शांत और एकाग्र बनाता है",
    pressInward: "अंदर की ओर दबाएं",
    flareOutward: "बाहर की ओर फैलाएं",
    sacredKiln: "पवित्र भट्टी में मिट्टी का बर्तन पक गया",
    terracottaReady: "मिट्टी का सुंदर बर्तन तैयार",
    targetMatch: (score) => `शिल्पकला का मिलान: ${score}% सटीक`,
    riverFlute: "माजुली की बांसुरी की धुन सुनें",
    vessels: {
      doiHari: { name: "माजुली की दही की हांडी", desc: "माजुली द्वीप पर दही जमाने के लिए बनाई जाने वाली पारंपरिक मिट्टी की हांडी।" },
      saki: { name: "पवित्र बिहू मिट्टी का दीया", desc: "काति बिहू पर जलाया जाने वाला पारंपरिक पवित्र मिट्टी का दीया।" },
    },
    points: { rim: "ऊपरी किनारा", neck: "मुड़ी हुई गर्दन", belly: "गोल चौड़ा पेट", base: "मजबूत तल" },
  },
  bn: {
    clinicalTitle: "চিকিৎসাগত উপকারিতা:",
    benefit1: "আঙুলের সূক্ষ্ম সঞ্চালন ও স্পর্শ অনুভূতির উন্নতি ঘটায়",
    benefit2: "স্থানিক দৃষ্টি ও আকৃতি মেলানোর ক্ষমতা বাড়ায়",
    benefit3: "চাকার ঘূর্ণন মনকে শান্ত ও একাগ্র রাখে",
    pressInward: "ভেতরে চাপুন",
    flareOutward: "বাইরে ছড়ান",
    sacredKiln: "পবিত্র ভাঁটিতে পোড়ানো সম্পন্ন",
    terracottaReady: "পোড়ামাটির পাত্র প্রস্তুত",
    targetMatch: (score) => `শিল্পকলার নিখুঁত রূপ: ${score}% মিল`,
    riverFlute: "মাজুলীর বাঁশির সুর শুনুন",
    vessels: {
      doiHari: { name: "মাজুলীর দইয়ের হাঁড়ি", desc: "মাজুলী দ্বীপে সুস্বাদু দই পাতার জন্য তৈরি ঐতিহ্যবাহী মাটির হাঁড়ি।" },
      saki: { name: "পবিত্র মাটির প্রদীপ (সাকি)", desc: "বিহু উৎসবে প্রজ্বলিত শুভ মাটির মঙ্গল প্রদীপ।" },
    },
    points: { rim: "মসৃণ উপরের মুখ", neck: "বাঁকানো গলা", belly: "প্রশস্ত গোল পেট", base: "দৃঢ় ভারী তলা" },
  },
  mr: {
    clinicalTitle: "उपचारात्मक फायदे:",
    benefit1: "बोटांच्या हालचाली आणि दाबावर नियंत्रण वाढवते",
    benefit2: "आकार ओळख आणि अवकाशीय अचूकता सुधारते",
    benefit3: "चाकाची मंद गती मनाला शांतता प्रदान करते",
    pressInward: "आत दाबा",
    flareOutward: "बाहेर पसरा",
    sacredKiln: "मातीचे भांडे भट्टीत भाजून तयार",
    terracottaReady: "मातीचे सुंदर भांडे तयार",
    targetMatch: (score) => `कलात्मक आकार: ${score}% अचूकता`,
    riverFlute: "माजुली बासरीचे सूर ऐका",
    vessels: {
      doiHari: { name: "माजुली दह्याची मटकी", desc: "माजुली बेटावर थंडगार दही लावण्यासाठी बनवली जाणारी पारंपरिक मातीची मटकी." },
      saki: { name: "मातीचा पवित्र दिवा", desc: "उत्सवात लावला जाणारा पारंपरिक मातीचा दिवा." },
    },
    points: { rim: "वरचा काठ", neck: "वळणदार मान", belly: "रुंद गोल पोट", base: "भक्कम तळ" },
  },
  ne: {
    clinicalTitle: "उपचारात्मक फाइदाहरू:",
    benefit1: "औंलाहरूको सूक्ष्म गतिशीलता र दबाब सन्तुलन सुधार्छ",
    benefit2: "आकार पहिचान र स्थानिक तालमेल बलियो बनाउँछ",
    benefit3: "घुम्ने चक्रले मनलाई शान्त र ध्यानमग्न बनाउँछ",
    pressInward: "भित्र थिच्नुहोस्",
    flareOutward: "बाहिर फैलाउनुहोस्",
    sacredKiln: "भट्टीमा माटोको भाँडो तयार भयो",
    terracottaReady: "माटोको भाँडो तयार",
    targetMatch: (score) => `कलात्मक रूप: ${score}% मिलेको`,
    riverFlute: "माजुलीको बाँसुरी सुन्नुहोस्",
    vessels: {
      doiHari: { name: "माजुली दहीको हाँडी", desc: "माजुली टापुमा दही जमाउन बनाइने परम्परागत माटोको भाँडो।" },
      saki: { name: "पवित्र माटोको दियो", desc: "पूजा तथा चाडपर्वमा बालिने परम्परागत माटोको दियो।" },
    },
    points: { rim: "माथिल्लो किनारा", neck: "घुमेको घाँटी", belly: "फराकिलो पेट", base: "बलियो पिँध" },
  },
  mni: {
    clinicalTitle: "লাইয়েংগী কান্নবশিং:",
    benefit1: "খুৎশাগী খোঙজেল অমসুং চপ চাবা ফগৎহল্লি",
    benefit2: "মওং মতৌ খঙদোকপা অমসুং য়েংবা ফগৎহল্লি",
    benefit3: "চাক্কা খোঙবা উবদা পুক্নিং শান্ত ওইহল্লি",
    pressInward: "মনুংদা নমথীয়ু",
    flareOutward: "মপান্দা পাকথোকউ",
    sacredKiln: "লৈপাক পুখম শাবা লোইশিনখ্রে",
    terracottaReady: "লৈপাক্কী পুখম শেম-শারে",
    targetMatch: (score) => `মওং মান্নবা: ${score}% চপ চারে`,
    riverFlute: "মাজুলীগী তৌরেল ইশৈ তারসি",
    vessels: {
      doiHari: { name: "মাজুলীগী শঙ্গোম পুখম", desc: "মাজুলী দ্বীপতা শঙ্গোম থম্বদা শীজিন্নবা লৈপাক্কী পুখম।" },
      saki: { name: "বিহুগী লৈপাক্কী থাবা", desc: "কাতি বিহুগী চাকুন্না থাবদা শীজিন্নবা লৈপাক থাবা।" },
    },
    points: { rim: "মথক্কী লোইশিনফম", neck: "ঙাক্লম", belly: "পাকপা পুম", base: "কনবা মখা" },
  },
  brx: {
    clinicalTitle: "फाहामनायनि मुलाम्फा:",
    benefit1: "आसिफोरनि दावबायनाय आरो थुनायखौ मोजां खालामो",
    benefit2: "महोरखौ मिथिनो आरो रोखोम सायख'नो हाहोयो",
    benefit3: "चाक्का गिदिंनाया गोसोखौ गोजोन होयो",
    pressInward: "सिंआव थु",
    flareOutward: "बायजोआव फेहेर",
    sacredKiln: "हायानि थाइखौ सावनाय जाबाय",
    terracottaReady: "हायानि थाइ थियारि",
    targetMatch: (score) => `शिल्पनि महोर: ${score}% मिलिदों`,
    riverFlute: "माजुलिनि बांहि खोनासोन",
    vessels: {
      doiHari: { name: "माजुलिनि दहि हादुर", desc: "माजुलियाव दहि दोननो बाहायनाय हायानि हादुर।" },
      saki: { name: "साखि बाथि", desc: "काति बिहुआव सावनो बाहायनाय हायानि साखि।" },
    },
    points: { rim: "सायाव थानाय सिमा", neck: "गिदिंनाय गलो", belly: "गुवार उदौ", base: "गोरा हासा" },
  },
  grt: {
    clinicalTitle: "Nama·atna namgipa:",
    benefit1: "Jakkolchini kam aro rim·aniko namatani",
    benefit2: "Bimang aro gadangko u·iani",
    benefit3: "Wheel wilwilani gisikko tom·tomatani",
    pressInward: "Ning·china sinjetbo",
    flareOutward: "A·palchina dal·atbo",
    sacredKiln: "A·ani sam·dikko wa·alo song·aha",
    terracottaReady: "A·ani Sam·dik Tariaha",
    targetMatch: (score) => `Bimang: ${score}% matchotaha`,
    riverFlute: "Majuli buringni bangsi knabo",
    vessels: {
      doiHari: { name: "Majulini Dahi Dikte", desc: "Majulio dahi donchakani a·ani dikte." },
      saki: { name: "Kati Bihuni Seng·gipa Saki", desc: "Kati Bihuo so·gipa a·ani saki." },
    },
    points: { rim: "Kosakni Riking", neck: "Gittok", belly: "Ok Dal·gipa", base: "Mangrakgipa Ja·pang" },
  },
  kha: {
    clinicalTitle: "Ki jingmyntoi ba pynbait:",
    benefit1: "Pynbha ia ka bor kti bad ki shympriah kti",
    benefit2: "Ka jingbatai dur bad ka jingthikna kti",
    benefit3: "Ka jingshad ka shaka ka wanrah jingjai-jai",
    pressInward: "Khem shapoh",
    flareOutward: "Pyniar shabar",
    sacredKiln: "U Khiew Khyndew La Shet Bha",
    terracottaReady: "U Khiew Khyndew La Biang",
    targetMatch: (score) => `Ka Dur Kti: ${score}% Ba Iasyndam`,
    riverFlute: "Sngap sharati Majuli",
    vessels: {
      doiHari: { name: "Khiew Doi Majuli", desc: "U khiew khyndew ba shna ha Majuli ban pynkhriat ia ka doi." },
      saki: { name: "Ka Sharak Khyndew Bihu", desc: "Ka sharak khyndew ba thang ha ka por Bihu." },
    },
    points: { rim: "Ka Rud Bahalor", neck: "Ka Ryndang", belly: "Ka Kpoh Ba Heh", base: "Ka Trai Ba Khlain" },
  },
  lus: {
    clinicalTitle: "Taksa tana hlawkna:",
    benefit1: "Kutzung chetdan leh hmeh nat zawng vawn dikna",
    benefit2: "Hmunhma leh thil awm dan hriatpawh theihna",
    benefit3: "Thil vir hian rilru a tithawveng",
    pressInward: "Chhung lamah hmet lut rawh",
    flareOutward: "Pawn lamah zauh rawh",
    sacredKiln: "Hlum bel chu rawh hmin a ni ta",
    terracottaReady: "Hlum Bel A Inpeih Ta",
    targetMatch: (score) => `A pian dan: ${score}% a inmil`,
    riverFlute: "Majuli phenglawng ri ngaihthlakna",
    vessels: {
      doiHari: { name: "Majuli Dahi Bel", desc: "Majuli thliarkara dahi siam nana hlum bel lian an siam thin." },
      saki: { name: "Bihu Khawnvar Hlum", desc: "Kati Bihu laia khawnvar hlum an chhit thin chu." },
    },
    points: { rim: "A Kam Chunglam", neck: "A Nghawng Kual", belly: "A Pum Lian", base: "A Mawng Nghet" },
  },
};

interface ContourPoint {
  id: string;
  label: string;
  yRatio: number; // 0 (top) to 1 (bottom)
  currentRadius: number; // Current width ratio
  targetRadius: number;  // Ideal target width ratio
}

const POTTERY_VESSELS = [
  {
    name: "Assamese Doi Hari (Curd Vessel)",
    desc: "A wide-bellied traditional earthen pot crafted for cool curd fermentation on Majuli Island.",
    points: [
      { id: "rim", label: "Smooth Top Rim", yRatio: 0.15, currentRadius: 0.25, targetRadius: 0.45 },
      { id: "neck", label: "Curved Neck", yRatio: 0.35, currentRadius: 0.3, targetRadius: 0.32 },
      { id: "belly", label: "Wide Round Belly", yRatio: 0.65, currentRadius: 0.35, targetRadius: 0.65 },
      { id: "base", label: "Stable Solid Base", yRatio: 0.88, currentRadius: 0.3, targetRadius: 0.4 },
    ],
  },
  {
    name: "Sacred Bihu Clay Lamp (Mati Saki)",
    desc: "An open, flared earthen oil lamp lighted during Kati Bihu harvest prayers.",
    points: [
      { id: "rim", label: "Flared Open Rim", yRatio: 0.2, currentRadius: 0.3, targetRadius: 0.7 },
      { id: "neck", label: "Gently Sloped Body", yRatio: 0.5, currentRadius: 0.35, targetRadius: 0.5 },
      { id: "base", label: "Thick Heavy Base", yRatio: 0.85, currentRadius: 0.3, targetRadius: 0.35 },
    ],
  },
];

export function MajuliPotteryGame() {
  const locale = useLocale();
  const normLocale = (locale?.split("-")[0]?.toLowerCase() || "en") as SupportedLocale;
  const potteryUi = POTTERY_I18N[normLocale] || POTTERY_I18N.en;
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "majuli-pottery", startLevel(detail));

  const [phase, setPhase] = useState<"intro" | "shape" | "done">("intro");
  const [vesselIdx] = useState(0);
  const [contour, setContour] = useState<ContourPoint[]>(POTTERY_VESSELS[0].points);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [accuracyScore, setAccuracyScore] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "majuli-pottery",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  // Clay Lathe Render Loop (Immediate Mode Canvas)
  useEffect(() => {
    if (phase !== "shape") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const render = () => {
      animId = requestAnimationFrame(render);
      tick++;

      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;

      // 1. Potter's Workshop Background
      ctx.fillStyle = "#261914";
      ctx.fillRect(0, 0, w, h);

      // 2. Spinning Potter's Wheel Base
      const wheelY = h * 0.92;
      const wheelW = w * 0.75;
      ctx.beginPath();
      ctx.ellipse(cx, wheelY, wheelW / 2, 22, 0, 0, Math.PI * 2);
      ctx.fillStyle = "#78350F";
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#451A03";
      ctx.stroke();

      // Spinning Wheel Lines
      ctx.strokeStyle = "rgba(251, 191, 36, 0.3)";
      ctx.lineWidth = 2;
      for (let a = 0; a < 6; a++) {
        const angle = tick * 0.05 + (a * Math.PI) / 3;
        ctx.beginPath();
        ctx.moveTo(cx, wheelY);
        ctx.lineTo(cx + Math.cos(angle) * (wheelW / 2), wheelY + Math.sin(angle) * 16);
        ctx.stroke();
      }

      // 3. Draw Clay Pot Profile (Smooth Bezier Lathe)
      ctx.save();

      // Golden River Clay Gradient
      const clayGrad = ctx.createLinearGradient(cx - 100, 0, cx + 100, 0);
      clayGrad.addColorStop(0, "#9A3412");
      clayGrad.addColorStop(0.5, "#EA580C");
      clayGrad.addColorStop(0.8, "#F97316");
      clayGrad.addColorStop(1, "#7C2D12");

      ctx.fillStyle = clayGrad;
      ctx.beginPath();

      // Left Profile
      const startPt = contour[0];
      ctx.moveTo(cx - (startPt.currentRadius * w) / 2, startPt.yRatio * h);

      for (let i = 1; i < contour.length; i++) {
        const pt = contour[i];
        const prev = contour[i - 1];
        const midY = ((prev.yRatio + pt.yRatio) / 2) * h;
        const midX = cx - (((prev.currentRadius + pt.currentRadius) / 2) * w) / 2;
        ctx.quadraticCurveTo(midX, midY, cx - (pt.currentRadius * w) / 2, pt.yRatio * h);
      }

      // Bottom connecting line
      const lastPt = contour[contour.length - 1];
      ctx.lineTo(cx + (lastPt.currentRadius * w) / 2, lastPt.yRatio * h);

      // Right Profile (Reverse)
      for (let i = contour.length - 2; i >= 0; i--) {
        const pt = contour[i];
        const prev = contour[i + 1];
        const midY = ((prev.yRatio + pt.yRatio) / 2) * h;
        const midX = cx + (((prev.currentRadius + pt.currentRadius) / 2) * w) / 2;
        ctx.quadraticCurveTo(midX, midY, cx + (pt.currentRadius * w) / 2, pt.yRatio * h);
      }

      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#431407";
      ctx.stroke();

      // Surface Clay Glaze Rings
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 1.5;
      contour.forEach((pt) => {
        const py = pt.yRatio * h;
        const rx = (pt.currentRadius * w) / 2;
        ctx.beginPath();
        ctx.ellipse(cx, py, rx, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
      });

      ctx.restore();

      // 4. Target Guideline Ghost Outline
      ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      const firstTarget = contour[0];
      ctx.moveTo(cx - (firstTarget.targetRadius * w) / 2, firstTarget.yRatio * h);
      for (let i = 1; i < contour.length; i++) {
        const pt = contour[i];
        ctx.lineTo(cx - (pt.targetRadius * w) / 2, pt.yRatio * h);
      }
      for (let i = contour.length - 1; i >= 0; i--) {
        const pt = contour[i];
        ctx.lineTo(cx + (pt.targetRadius * w) / 2, pt.yRatio * h);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [contour, phase]);

  const adjustRadius = (idx: number, delta: number) => {
    playPress();
    setTaps((t) => t + 1);

    setContour((prev) => {
      const next = [...prev];
      const pt = { ...next[idx] };
      pt.currentRadius = Math.max(0.15, Math.min(0.85, pt.currentRadius + delta));
      next[idx] = pt;

      // Calculate total shape match accuracy
      let totalErr = 0;
      next.forEach((p) => {
        totalErr += Math.abs(p.currentRadius - p.targetRadius);
      });
      const avgErr = totalErr / next.length;
      const accuracy = Math.max(0, Math.min(100, Math.round((1 - avgErr / 0.5) * 100)));
      setAccuracyScore(accuracy);

      if (accuracy >= 88) {
        setTimeout(() => {
          playComplete();
          setPhase("done");
          if (startedAt) {
            recordGameSession(patientId, {
              gameId: "majuli-pottery",
              level,
              outcome: "completed",
              score: accuracy,
              startedAt,
              taps: taps + 1,
              errorCount: 0,
            });
          }
        }, 800);
      }
      return next;
    });
  };

  const startShaping = useCallback(() => {
    playPress();
    setPhase("shape");
    setContour(POTTERY_VESSELS[vesselIdx].points.map((p) => ({ ...p })));
    setAccuracyScore(45);
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
  }, [vesselIdx]);

  const str = getGameStrings("majuli-pottery", locale);

  if (loading) return <GameShell title={str.title} score={0}><GameLoading /></GameShell>;
  if (error) return <GameShell title={str.title} score={0}><GameError onRetry={reload} /></GameShell>;

  const vesselKey = vesselIdx === 0 ? "doiHari" : "saki";
  const currentVessel = potteryUi.vessels[vesselKey];

  return (
    <GameShell title={str.title} score={accuracyScore}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                {str.title}
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-amber-900" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-amber-900 text-white shadow-[4px_4px_0px_#000]">
            <Disc3 className="h-10 w-10 stroke-[2.5] animate-spin" style={{ animationDuration: "12s" }} />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">
              {str.introTitle}
            </h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {str.introSubtitle}
            </p>
          </div>

          {/* Clinical Benefits */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 block mb-2">
              {potteryUi.clinicalTitle}
            </span>
            <div className="space-y-2 text-xs font-bold text-ink">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-800" />
                <span>{potteryUi.benefit1}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-tea" />
                <span>{potteryUi.benefit2}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-marigold" />
                <span>{potteryUi.benefit3}</span>
              </div>
            </div>
          </div>

          <AudioPrompt
            text={str.audioPrompt}
            label={str.listenLabel}
            size="md"
          />

          <ChunkyButton variant="tea" size="xl" onClick={startShaping}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "shape" ? (
        <div className="flex flex-col items-center gap-3.5 py-1">
          {/* POTTERY STATUS HUD */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <span className="text-xs font-black uppercase tracking-wider text-amber-950 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-700" /> {str.hudProgress}: {accuracyScore}%
            </span>
            <span className="text-[11px] font-bold text-amber-900">
              {currentVessel.name.split("(")[0].trim()}
            </span>
          </div>

          {/* CLAY LATHE CANVAS */}
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-3 border-black shadow-[4px_4px_0px_#000] bg-black">
            <canvas
              ref={canvasRef}
              width={480}
              height={380}
              className="w-full h-[320px] sm:h-[360px] block"
            />
          </div>

          {/* TACTILE SHAPING CONTROLS PER CONTOUR NODE */}
          <div className="w-full max-w-md space-y-2 bg-surface p-3 rounded-2xl border-3 border-black shadow-[3px_3px_0px_#000]">
            <span className="text-xs font-black uppercase text-amber-900 block text-center">
              {str.hudAction}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {contour.map((pt, idx) => {
                const ptLabel = potteryUi.points[pt.id as keyof typeof potteryUi.points] || pt.label;
                return (
                  <div
                    key={pt.id}
                    className="flex items-center justify-between gap-2 p-2 rounded-xl border-2 border-black bg-amber-50"
                  >
                    <span className="text-xs font-bold text-ink truncate">{ptLabel}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => adjustRadius(idx, -0.06)}
                        className="btn-tactile flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-amber-200 font-black text-sm text-ink shadow-xs cursor-pointer"
                        title={potteryUi.pressInward}
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustRadius(idx, 0.06)}
                        className="btn-tactile flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-amber-400 font-black text-sm text-ink shadow-xs cursor-pointer"
                        title={potteryUi.flareOutward}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration
          title={str.celebrationTitle}
          subtitle={str.celebrationSubtitle}
          xpEarned={125}
          accuracy={`${accuracyScore}%`}
        >
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left w-full">
            <div className="relative w-full rounded-2xl border-3 border-black bg-[#FAF5EE] p-5 shadow-[5px_5px_0px_#000] text-ink select-none">
              <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                <span className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> {potteryUi.sacredKiln}
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-amber-800 text-white px-2 py-0.5">
                  {potteryUi.terracottaReady}
                </span>
              </div>

              <h3 className="font-serif text-xl font-black text-ink">
                {potteryUi.targetMatch(accuracyScore)}
              </h3>
              <p className="text-xs font-semibold text-ink-secondary mt-1">
                {currentVessel.desc}
              </p>

              <div className="mt-4 flex items-center justify-between pt-3 border-t-2 border-black/10">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-amber-100 px-3 py-1.5 text-ink shadow-[2px_2px_0px_#000] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Flame className="h-4 w-4 text-amber-900" />
                  <span className="text-xs font-black">{potteryUi.riverFlute}</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startShaping}>
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" /> {str.playAgainButton}
                </span>
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-surface px-5 py-2.5 text-xs font-black text-ink hover:bg-surface-muted shadow-[2px_2px_0px_#000]"
              >
                {str.backToHub}
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
