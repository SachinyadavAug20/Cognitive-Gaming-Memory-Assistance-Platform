"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocale } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  Award,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  Paperclip,
} from "lucide-react";

interface CelebrationProps {
  icon?: LucideIcon | React.ComponentType<{ className?: string; size?: number | string }>;
  emoji?: string;
  title: string;
  subtitle?: string;
  xpEarned?: number;
  accuracy?: string;
  pieces?: number;
  children?: ReactNode;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  vRot: number;
  shape: "rect" | "circle" | "star";
  alpha: number;
}

const PARTICLE_COLORS = [
  "#1B4D3E", // Deep Tea
  "#D97706", // Marigold
  "#EA580C", // Terracotta
  "#059669", // Emerald
  "#DC2626", // Brick
  "#F59E0B", // Gold
  "#7C3AED", // Violet
];

const CELEBRATION_I18N: Record<
  string,
  {
    milestoneProtocol: string;
    objectiveComplete: string;
    defaultSubtitle: string;
    reminiscenceExp: string;
    precisionScore: string;
    cognitiveStatus: string;
    statusEngaged: string;
  }
> = {
  en: {
    milestoneProtocol: "Clinical Milestone Protocol // Verified",
    objectiveComplete: "Therapeutic Objective Complete",
    defaultSubtitle: "Cognitive engagement session verified and recorded into digital clinical record.",
    reminiscenceExp: "Reminiscence Experience",
    precisionScore: "Precision Score",
    cognitiveStatus: "Cognitive Status",
    statusEngaged: "Engaged",
  },
  as: {
    milestoneProtocol: "চিকিৎসাগত মাইলষ্টোন প্ৰট’কল // সত্যায়িত",
    objectiveComplete: "থেৰাপিউটিক লক্ষ্য সমাপ্ত",
    defaultSubtitle: "জ্ঞানমূলক সংযোগ সত্ৰ পৰীক্ষা কৰি ডিজিটেল ক্লিনিকেল ৰেকৰ্ডত সংৰক্ষণ কৰা হৈছে।",
    reminiscenceExp: "স্মৃতি অনুভৱ",
    precisionScore: "সঠিকতা স্ক’ৰ",
    cognitiveStatus: "জ্ঞানমূলক স্থিতি",
    statusEngaged: "সক্ৰিয়",
  },
  hi: {
    milestoneProtocol: "नैदानिक मील का पत्थर प्रोटोकॉल // सत्यापित",
    objectiveComplete: "चिकित्सीय उद्देश्य पूर्ण",
    defaultSubtitle: "संज्ञानात्मक सहभागिता सत्र सत्यापित और डिजिटल मेडिकल रिकॉर्ड में दर्ज किया गया।",
    reminiscenceExp: "स्मृति अनुभव",
    precisionScore: "सटीकता स्कोर",
    cognitiveStatus: "संज्ञानात्मक स्थिति",
    statusEngaged: "सक्रिय",
  },
  bn: {
    milestoneProtocol: "ক্লিনিকাল মাইলফলক প্রোটোকল // যাচাইকৃত",
    objectiveComplete: "থেরাপিউটিক লক্ষ্য সম্পন্ন",
    defaultSubtitle: "জ্ঞানীয় সম্পৃক্ততার অধিবেশন যাচাই করা হয়েছে এবং ডিজিটাল ক্লিনিকাল রেকর্ডে নথিবদ্ধ করা হয়েছে।",
    reminiscenceExp: "স্মৃতিচারণ অভিজ্ঞতা",
    precisionScore: "নির্ভুলতা স্কোর",
    cognitiveStatus: "জ্ঞানীয় অবস্থা",
    statusEngaged: "সক্রিয়",
  },
  mr: {
    milestoneProtocol: "वैद्यकीय टप्पा प्रोटोकॉल // सत्यापित",
    objectiveComplete: "उपचारात्मक उद्दिष्ट पूर्ण",
    defaultSubtitle: "संज्ञानात्मक सहभागिता सत्र सत्यापित करून डिजिटल वैद्यकीय नोंदवहीत नोंदवले गेले.",
    reminiscenceExp: "स्मरण अनुभव",
    precisionScore: "अचूकता गुण",
    cognitiveStatus: "संज्ञानात्मक स्थिती",
    statusEngaged: "सक्रिय",
  },
  ne: {
    milestoneProtocol: "चिकित्सीय माइलस्टोन प्रोटोकल // प्रमाणित",
    objectiveComplete: "उपचारात्मक उद्देश्य सम्पन्न",
    defaultSubtitle: "संज्ञानात्मक संलग्नता सत्र प्रमाणित गरी डिजिटल क्लिनिकल अभिलेखमा दर्ता गरियो।",
    reminiscenceExp: "स्मरण अनुभव",
    precisionScore: "शुद्धता अङ्क",
    cognitiveStatus: "संज्ञानात्मक अवस्था",
    statusEngaged: "सक्रिय",
  },
  mni: {
    milestoneProtocol: "ক্লিনিকল মাইলস্টোন প্রোটোকোল // চৎনবা য়ারবা",
    objectiveComplete: "থেরাপ্যুটিক পান্দম লোইশিনখ্রে",
    defaultSubtitle: "ৱাখলগী থবক-থৌরমশিং লেপখ্রে অমসুং দিজিতেল রেকোর্দতা ইনখ্রে।",
    reminiscenceExp: "নিংথিংবা ৱাখল খঙহনবা",
    precisionScore: "চুংশিনবা স্কোর",
    cognitiveStatus: "ৱাখলগী ফীভম",
    statusEngaged: "য়াওশিনবা",
  },
  brx: {
    milestoneProtocol: "फाहामथाय बिथांखि दाबि // थার जाबाय",
    objectiveComplete: "फाहामथाय थांखि फोजोबबाय",
    defaultSubtitle: "मेमोरी बाहागो लानायखौ नायबिजिरबाय आरो डिजिटल रेकर्डआव दोनबाय।",
    reminiscenceExp: "गोसोखां महर",
    precisionScore: "गेबेंथि स्क'र",
    cognitiveStatus: "मेमोरी थाथाय",
    statusEngaged: "नाजाबाय थानाय",
  },
  grt: {
    milestoneProtocol: "Sanani Gadang Gimin Tik Ka∙gimin",
    objectiveComplete: "Sanani Miksonganiko Matchotata",
    defaultSubtitle: "Chanchiani kamo bak ra∙aniko nina man∙aha aro digital clinical records-o rakkiaha.",
    reminiscenceExp: "Gisik Ra∙pilani Man∙ani",
    precisionScore: "Tik ong∙ani Skol",
    cognitiveStatus: "Gisikni Gadang",
    statusEngaged: "Bak ra∙enga",
  },
  kha: {
    milestoneProtocol: "Ka Rukom Pynkhiah ba la Pynshisha",
    objectiveComplete: "La Dep ka Jingthmu Jingpynkhiah",
    defaultSubtitle: "La pynshisha ia ka jingtreikam jong ka jingmut bad buh ha ka rekod digital.",
    reminiscenceExp: "Ka Jingkynmaw Kynshew",
    precisionScore: "Ka Jingbha ka jingkhein",
    cognitiveStatus: "Ka Jingmut Jingpyrkhat",
    statusEngaged: "Mynjur",
  },
  lus: {
    milestoneProtocol: "Inenkawlna Hlawhtlinna // Nemngheh",
    objectiveComplete: "Inenkawlna Tum Puitlin A Ni",
    defaultSubtitle: "Hriatna chak zawk nana inhmanna chu finfiah a ni a, digital clinical record-ah ziah luh a ni.",
    reminiscenceExp: "Hriatpui Hriatrengna",
    precisionScore: "Dikna Score",
    cognitiveStatus: "Hriatna Dinhmun",
    statusEngaged: "Tel Mek",
  },
};

export function Celebration({
  icon: Icon = Award,
  title,
  subtitle,
  xpEarned = 100,
  accuracy = "100%",
  children,
}: CelebrationProps) {
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");
  const c18n = CELEBRATION_I18N[normLoc] || CELEBRATION_I18N.en;
  const resolvedSubtitle = subtitle || c18n.defaultSubtitle;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [xpDisplay, setXpDisplay] = useState(0);

  // Animated count-up for XP
  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.floor(xpEarned / 25));
    const interval = setInterval(() => {
      current += step;
      if (current >= xpEarned) {
        setXpDisplay(xpEarned);
        clearInterval(interval);
      } else {
        setXpDisplay(current);
      }
    }, 30);
    return () => clearInterval(interval);
  }, [xpEarned]);

  // Canvas particle physics engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const width = (canvas.width = canvas.offsetWidth || 600);
    const height = (canvas.height = canvas.offsetHeight || 500);

    const particles: Particle[] = [];
    const count = 90;

    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 4 + Math.random() * 8;
      particles.push({
        x: width / 2,
        y: height / 3,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 5 + Math.random() * 7,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2,
        shape: i % 3 === 0 ? "star" : i % 2 === 0 ? "rect" : "circle",
        alpha: 1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.16; // gravity
        p.vx *= 0.98; // air resistance
        p.rotation += p.vRot;
        p.alpha -= 0.005;

        if (p.alpha > 0) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          ctx.fillStyle = p.color;

          if (p.shape === "circle") {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else if (p.shape === "rect") {
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.6);
          } else {
            // Draw 4-point star
            ctx.beginPath();
            ctx.moveTo(0, -p.size);
            ctx.lineTo(p.size * 0.3, -p.size * 0.3);
            ctx.lineTo(p.size, 0);
            ctx.lineTo(p.size * 0.3, p.size * 0.3);
            ctx.lineTo(0, p.size);
            ctx.lineTo(-p.size * 0.3, p.size * 0.3);
            ctx.lineTo(-p.size, 0);
            ctx.lineTo(-p.size * 0.3, -p.size * 0.3);
            ctx.closePath();
            ctx.fill();
          }

          ctx.restore();
        }
      }

      if (alive) {
        animId = requestAnimationFrame(render);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center gap-5 py-6 text-center max-w-xl mx-auto w-full">
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 w-full h-full z-0"
      />

      {/* Official Government Dossier Ribbon */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
        <div className="flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-ink" />
          <span className="text-[11px] font-black uppercase tracking-wider text-ink">
            {c18n.milestoneProtocol}
          </span>
        </div>
        <ShieldCheck className="h-4 w-4 text-tea" />
      </div>

      {/* Hero Badge Box */}
      <div className="relative z-10 flex flex-col items-center gap-3">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-tea text-white shadow-[4px_4px_0px_#000] animate-bounce">
          <Icon className="h-10 w-10 stroke-[2.5]" />
          <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-black bg-marigold text-white shadow-sm">
            <Sparkles className="h-4 w-4" />
          </span>
        </div>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-tea-light px-3 py-1 text-xs font-black text-ink shadow-[2px_2px_0px_#000]">
            <CheckCircle2 className="h-3.5 w-3.5 text-tea" />
            <span>{c18n.objectiveComplete}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-ink font-serif">
            {title}
          </h2>
          <p className="text-xs font-semibold text-ink-secondary max-w-md mx-auto">
            {resolvedSubtitle}
          </p>
        </div>
      </div>

      {/* Gamified Stat Progression Bar (Boot.dev Inspired) */}
      <div className="relative z-10 w-full max-w-md rounded-2xl border-3 border-black bg-surface p-3.5 shadow-[4px_4px_0px_#000] text-left">
        <div className="flex items-center justify-between border-b-2 border-black/10 pb-2 mb-2.5">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-tea">
            <Zap className="h-4 w-4 text-marigold fill-marigold" />
            <span>{c18n.reminiscenceExp}</span>
          </div>
          <span className="text-xs font-black text-ink bg-marigold/20 border border-marigold px-2 py-0.5 rounded-md">
            +{xpDisplay} XP
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-center text-xs font-black">
          <div className="rounded-xl border-2 border-black bg-tea-light/40 p-2">
            <span className="text-[10px] text-ink-secondary block uppercase">{c18n.precisionScore}</span>
            <span className="text-base text-tea">{accuracy}</span>
          </div>
          <div className="rounded-xl border-2 border-black bg-amber-50 p-2">
            <span className="text-[10px] text-ink-secondary block uppercase">{c18n.cognitiveStatus}</span>
            <span className="text-base text-amber-900">{c18n.statusEngaged}</span>
          </div>
        </div>
      </div>

      {/* Custom Game Milestone Content */}
      {children && <div className="relative z-10 flex flex-col items-center gap-4 w-full">{children}</div>}
    </div>
  );
}
