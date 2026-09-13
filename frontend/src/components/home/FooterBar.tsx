"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { ExternalLink, BookOpen, ShieldCheck, FileText } from "lucide-react";


const FOOTER_I18N: Record<string, {
  platformTitle: string;
  initiative: string;
  clinicalDossier: string;
  telemetry: string;
  officialRef: string;
}> = {
  as: {
    platformTitle: "CogniCare • এআই মগজুৰ খেল আৰু স্মৃতি সহায়ক প্লেটফৰ্ম",
    initiative: "উত্তৰ-পূব অঞ্চল উন্নয়ন মন্ত্ৰালয় (MDoNER) পদক্ষেপ • স্মাৰ্ট ইণ্ডিয়া হেকাহন ২০২৬ (PS 26003)",
    clinicalDossier: "ক্লিনিকেল প্ৰমাণ নথি (SaMD Class B)",
    telemetry: "জনস্বাস্থ্য নিৰীক্ষণ টেলিমেট্ৰি",
    officialRef: "স্বীকৃত ক্লিনিকেল তথ্যসূত্ৰ:"
  },
  hi: {
    platformTitle: "CogniCare • एआई संज्ञानात्मक खेल एवं स्मृति सहायता मंच",
    initiative: "पूर्वोत्तर क्षेत्र विकास मंत्रालय (MDoNER) की पहल • स्मार्ट इंडिया हैकथॉन 2026 (PS 26003)",
    clinicalDossier: "नैदानिक साक्ष्य डोज़ियर (SaMD Class B)",
    telemetry: "सार्वजनिक स्वास्थ्य टेलीमेट्री",
    officialRef: "आधिकारिक नैदानिक संदर्भ:"
  },
  en: {
    platformTitle: "CogniCare • AI Serious Gaming & Memory Assistance Platform",
    initiative: "Ministry of Development of North Eastern Region (MDoNER) Initiative • Smart India Hackathon 2026 (PS 26003)",
    clinicalDossier: "Clinical Evidence Dossier (SaMD Class B)",
    telemetry: "Public Health Telemetry",
    officialRef: "Official Clinical References:"
  },
  bn: {
    platformTitle: "CogniCare • এআই মস্তিষ্কের খেলা ও স্মৃতি সহায়ক প্ল্যাটফর্ম",
    initiative: "উত্তর-পূর্বাঞ্চল উন্নয়ন মন্ত্রক (MDoNER) উদ্যোগ • স্মার্ট ইন্ডিয়া হ্যাকাথন ২০২৬ (PS 26003)",
    clinicalDossier: "ক্লিনিক্যাল প্রমাণ ডসিয়ার (SaMD Class B)",
    telemetry: "জনস্বাস্থ্য নজরদারি টেলিমেট্রি",
    officialRef: "অফিসিয়াল ক্লিনিক্যাল তথ্যসূত্র:"
  },
  mr: {
    platformTitle: "CogniCare • एआय मेंदूचे खेळ आणि स्मृती साहाय्य प्लॅटफॉर्म",
    initiative: "ईशान्य क्षेत्र विकास मंत्रालय (MDoNER) उपक्रम • स्मार्ट इंडिया हॅकेथॉन 2026 (PS 26003)",
    clinicalDossier: "क्लिनिकल पुरावा दस्तऐवज (SaMD Class B)",
    telemetry: "सार्वजनिक आरोग्य टेलिमेट्री",
    officialRef: "अधिकृत क्लिनिकल संदर्भ:"
  },
  ne: {
    platformTitle: "CogniCare • एआई मस्तिष्क खेल र स्मृति सहायता मञ्च",
    initiative: "पूर्वोत्तर क्षेत्र विकास मन्त्रालय (MDoNER) पहल • स्मार्ट इन्डिया ह्याकाथन २०२६ (PS 26003)",
    clinicalDossier: "क्लिनिकल प्रमाण कागजात (SaMD Class B)",
    telemetry: "सार्वजनिक स्वास्थ्य टेलिमेट्री",
    officialRef: "आधिकारिक क्लिनिकल सन्दर्भहरू:"
  },
  mni: {
    platformTitle: "CogniCare • এআই শান্নপোৎ অমসুং নিংশিংবা মতেং প্লেতফোর্ম",
    initiative: "MDoNER অমসুং স্মার্ত ইন্দিয়া হেকাহন ২০২৬ (PS 26003)",
    clinicalDossier: "ক্লিনিকেল প্রমান দোসিঅর (SaMD Class B)",
    telemetry: "পব্লিক হেলথ তেলিমেত্রি",
    officialRef: "অফিসিয়েল ক্লিনিকেল রেফরেন্স:"
  },
  brx: {
    platformTitle: "CogniCare • एआई गोसोखांथि हेफाजात प्लेतफर्म",
    initiative: "MDoNER आरो स्मार्ट इन्डिया हेकाथन २०२६ (PS 26003)",
    clinicalDossier: "क्लिनिकेल डसियार (SaMD Class B)",
    telemetry: "सावस्रि नायदिंनाय टेलिमेट्रि",
    officialRef: "गाहाइ क्लिनिकेल रिफारेन्स:"
  },
  grt: {
    platformTitle: "CogniCare • AI Serious Gaming & Memory Assistance Platform",
    initiative: "MDoNER Initiative • Smart India Hackathon 2026 (PS 26003)",
    clinicalDossier: "Clinical Evidence Dossier (SaMD Class B)",
    telemetry: "Public Health Telemetry",
    officialRef: "Official Clinical References:"
  },
  kha: {
    platformTitle: "CogniCare • AI Serious Gaming & Memory Assistance Platform",
    initiative: "MDoNER Initiative • Smart India Hackathon 2026 (PS 26003)",
    clinicalDossier: "Clinical Evidence Dossier (SaMD Class B)",
    telemetry: "Public Health Telemetry",
    officialRef: "Official Clinical References:"
  },
  lus: {
    platformTitle: "CogniCare • AI Serious Gaming & Memory Assistance Platform",
    initiative: "MDoNER Initiative • Smart India Hackathon 2026 (PS 26003)",
    clinicalDossier: "Clinical Evidence Dossier (SaMD Class B)",
    telemetry: "Public Health Telemetry",
    officialRef: "Official Clinical References:"
  }
};

export function FooterBar() {
  const locale = useLocale();
  const f18n = FOOTER_I18N[locale] || FOOTER_I18N.en;
  return (
    <footer className="border-t-2 border-border-soft pt-6 pb-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <p className="font-serif font-black text-sm text-ink">
            {f18n.platformTitle}
          </p>
          <p className="text-xs text-ink-secondary">
            {f18n.initiative}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/clinical-evidence"
            className="inline-flex items-center gap-1 font-bold text-tea hover:underline"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{f18n.clinicalDossier}</span>
          </Link>
          <span className="text-stone-300">|</span>
          <Link
            href="/command-center"
            className="inline-flex items-center gap-1 font-bold text-ink-secondary hover:text-ink"
          >
            <span>{f18n.telemetry}</span>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-black/10 text-[11px] text-stone-600">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="font-bold text-stone-800">{f18n.officialRef}</span>
          <a
            href="https://www.ncbi.nlm.nih.gov/books/NBK557444/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 hover:text-tea underline"
          >
            <span>NIH StatPearls (NBK557444)</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <a
            href="https://pubmed.ncbi.nlm.nih.gov/12425705/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 hover:text-tea underline"
          >
            <span>ACTIVE Study (JAMA 2002)</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <a
            href="https://pubmed.ncbi.nlm.nih.gov/25771249/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 hover:text-tea underline"
          >
            <span>FINGER Trial (Lancet 2015)</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <a
            href="https://www.w3.org/TR/coga-usable/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 hover:text-tea underline"
          >
            <span>W3C COGA Guidelines</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <a
            href="https://cdsco.gov.in/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 hover:text-tea underline"
          >
            <span>CDSCO SaMD Class B</span>
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
        </div>

        <p className="text-[10px] text-stone-500 font-medium">
          Zero fiction &bull; Strictly peer-reviewed clinical protocols &bull; HIPAA &amp; ICMR AI Ethics aligned
        </p>
      </div>
    </footer>
  );
}
