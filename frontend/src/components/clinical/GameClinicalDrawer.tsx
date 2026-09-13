"use client";

import React, { useState } from "react";
import { BookOpen, X, ExternalLink, ShieldCheck, Sparkles } from "lucide-react";
import { useLocale } from "next-intl";
import { getReferencesForGame, type ClinicalReference } from "@/lib/clinicalReferences";
import { ClinicalReferenceCard } from "./ClinicalReferenceCard";
import { Link } from "@/i18n/navigation";

interface GameClinicalDrawerProps {
  gameId: string;
  gameTitle?: string;
}

interface GameDrawerTexts {
  triggerText: string;
  triggerShort: string;
  triggerTitle: string;
  badge: string;
  title: string;
  subtitle: string;
  closeAria: string;
  compliance: string;
  readDossier: string;
}

const GAME_DRAWER_I18N: Record<string, GameDrawerTexts> = {
  en: {
    triggerText: "Clinical Evidence",
    triggerShort: "R&D",
    triggerTitle: "View Clinical Research, PubMed Citations & Evidence Base",
    badge: "Software as a Medical Device (SaMD) Class B",
    title: "Clinical Evidence & Scientific Basis",
    subtitle: "Peer-reviewed cognitive trial rationale for",
    closeAria: "Close modal",
    compliance: "Aligned with W3C COGA, CDSCO SaMD, and ICMR AI Ethics Guidelines.",
    readDossier: "Read Full SaMD R&D Dossier",
  },
  as: {
    triggerText: "চিকিৎসা প্ৰমাণ",
    triggerShort: "গৱেষণা",
    triggerTitle: "ক্লিনিকেল গৱেষণা, পাবমেড প্ৰমাণ আৰু বৈজ্ঞানিক ভিত্তি চাওক",
    badge: "চিকিৎসা সঁজুলি হিচাপে চফ্টৱেৰ (SaMD) শ্ৰেণী B",
    title: "ক্লিনিকেল প্ৰমাণ আৰু বৈজ্ঞানিক ভিত্তি",
    subtitle: "সমীক্ষিত জ্ঞানীয় পৰীক্ষাৰ ভিত্তি:",
    closeAria: "ম'ডেল বন্ধ কৰক",
    compliance: "W3C COGA, CDSCO SaMD আৰু ICMR এআই নীতি নিৰ্দেশনাৰ সৈতে সংগতিপূৰ্ণ।",
    readDossier: "সম্পূৰ্ণ SaMD গৱেষণা ডছিয়াৰ পঢ়ক",
  },
  hi: {
    triggerText: "नैदानिक साक्ष्य",
    triggerShort: "शोध",
    triggerTitle: "नैदानिक अनुसंधान, पबमेड उद्धरण और साक्ष्य आधार देखें",
    badge: "चिकित्सा उपकरण के रूप में सॉफ्टवेयर (SaMD) वर्ग B",
    title: "नैदानिक साक्ष्य एवं वैज्ञानिक आधार",
    subtitle: "समीक्षित संज्ञानात्मक परीक्षण आधार:",
    closeAria: "मॉडल बंद करें",
    compliance: "W3C COGA, CDSCO SaMD और ICMR एआई नैतिकता दिशानिर्देशों के अनुरूप।",
    readDossier: "पूर्ण SaMD अनुसंधान डोजियर पढ़ें",
  },
  bn: {
    triggerText: "ক্লিনিক্যাল প্রমাণ",
    triggerShort: "গবেষণা",
    triggerTitle: "ক্লিনিক্যাল গবেষণা, পাবমেড উদ্ধৃতি ও প্রমাণের ভিত্তি দেখুন",
    badge: "চিকিৎসা ডিভাইস হিসেবে সফটওয়্যার (SaMD) ক্লাস B",
    title: "ক্লিনিক্যাল প্রমাণ ও বৈজ্ঞানিক ভিত্তি",
    subtitle: "সমীক্ষিত জ্ঞানীয় ট্রায়াল ভিত্তি:",
    closeAria: "মডেল বন্ধ করুন",
    compliance: "W3C COGA, CDSCO SaMD এবং ICMR এআই নীতিমালার সাথে সামঞ্জস্যপূর্ণ।",
    readDossier: "সম্পূর্ণ SaMD গবেষণা ডসিয়ার পড়ুন",
  },
  mr: {
    triggerText: "क्लिनिकल पुरावे",
    triggerShort: "संशोधन",
    triggerTitle: "क्लिनिकल संशोधन, पबमेड संदर्भ आणि वैज्ञानिक आधार पहा",
    badge: "वैद्यकीय साधन म्हणून सॉफ्टवेअर (SaMD) वर्ग B",
    title: "क्लिनिकल पुरावे आणि वैज्ञानिक आधार",
    subtitle: "पुनरावलोकन केलेला संज्ञानात्मक चाचणी आधार:",
    closeAria: "संवाद बंद करा",
    compliance: "W3C COGA, CDSCO SaMD आणि ICMR एआय नीतिनियमांशी सुसंगत.",
    readDossier: "संपूर्ण SaMD संशोधन डॉसियर वाचा",
  },
  ne: {
    triggerText: "क्लिनिकल प्रमाण",
    triggerShort: "अनुसन्धान",
    triggerTitle: "क्लिनिकल अनुसन्धान, पबमेड उद्धरण र प्रमाण आधार हेर्नुहोस्",
    badge: "चिकित्सा उपकरणको रूपमा सफ्टवेयर (SaMD) वर्ग B",
    title: "क्लिनिकल प्रमाण र वैज्ञानिक आधार",
    subtitle: "समीक्षित संज्ञानात्मक परीक्षण आधार:",
    closeAria: "बन्द गर्नुहोस्",
    compliance: "W3C COGA, CDSCO SaMD र ICMR एआई नीति निर्देशिकाहरूसँग मिल्दोजुल्दो।",
    readDossier: "पूर्ण SaMD अनुसन्धान डसियर पढ्नुहोस्",
  },
  mni: {
    triggerText: "ক্লিনিকেল খুদম",
    triggerShort: "থিজিনবা",
    triggerTitle: "ক্লিনিকেল থিজিনবা, পাবমেড খোমহনবা অমসুং সাইন্তিফিক য়ুম্ফম য়েংউ",
    badge: "মেদিকেল খুৎশু ওইনা শিজিন্নবা সোফ্টৱেয়ার (SaMD) ক্লাস B",
    title: "ক্লিনিকেল খুদম অমসুং সাইন্তিফিক য়ুম্ফম",
    subtitle: "পিয়র-রিভিউ তৌবা কগনিটিব ত্রায়েলগী মরম:",
    closeAria: "থোং লোইশিল্লু",
    compliance: "W3C COGA, CDSCO SaMD অমসুং ICMR AI এথিক্স চৎন-পথাপকা চুনবা।",
    readDossier: "অপুনবা SaMD থিজিনবগী দোসিয়র পাহৌ",
  },
  brx: {
    triggerText: "क्लिनिकेल प्रमाण",
    triggerShort: "नायबिजिरनाय",
    triggerTitle: "क्लिनिकेल नायबिजिरनाय, पाबमेड खौरां आरो बिगियानारि ओंथि नाय",
    badge: "फाहामथाय हायला हिसाबै सफ्टवेयार (SaMD) क्लास B",
    title: "क्लिनिकेल प्रमाण आरो बिगियानारि बिथा",
    subtitle: "बिजिरनाय गोसोआरि आनजाद बिथा:",
    closeAria: "बन्द खालाम",
    compliance: "W3C COGA, CDSCO SaMD आरो ICMR AI नेमखान्थिजों गोरोबनाय।",
    readDossier: "आबुं SaMD नायबिजिरनाय डसियार फराय",
  },
  grt: {
    triggerText: "Clinical Sakki",
    triggerShort: "Sandina",
    triggerTitle: "Clinical sandiani, PubMed aro scientific pangchakaniko nibo",
    badge: "Sananina Jakalgipa Software (SaMD) Class B",
    title: "Clinical Sakki aro Scientific Pangchakani",
    subtitle: "Nirikgimin cognitive trial-ni pangchakani:",
    closeAria: "Chipbo",
    compliance: "W3C COGA, CDSCO SaMD aro ICMR AI niamrangchi chalaia.",
    readDossier: "Gimik SaMD Sandiani Dossier-ko Poribo",
  },
  kha: {
    triggerText: "Ki Sakhi Ba Shisha",
    triggerShort: "Jingpule",
    triggerTitle: "Peit ia ki jingpule clinical, PubMed citations bad ki sakhi",
    badge: "Ka Software kum ka tiar sumar (SaMD) Class B",
    title: "Ki Sakhi Ba Shisha & Ka Nongrim Sayans",
    subtitle: "Ka nongrim jong ka jingpule jabieng na ka bynta:",
    closeAria: "Khang",
    compliance: "Iadei bad ki kyndon W3C COGA, CDSCO SaMD bad ICMR AI Ethics.",
    readDossier: "Pule ia ka SaMD R&D Dossier Ba Pura",
  },
  lus: {
    triggerText: "Damdawi Lam Finfiahna",
    triggerShort: "Zirchianna",
    triggerTitle: "Clinical zirchianna, PubMed thuziak leh finfiahna en rawh",
    badge: "Damdawi Hmanrua atana Software (SaMD) Class B",
    title: "Damdawi Lam Finfiahna leh Science Ziarang",
    subtitle: "Thluak hriatna enchhinna hmun nghet:",
    closeAria: "Khar rawh",
    compliance: "W3C COGA, CDSCO SaMD leh ICMR AI Dan nena inmil thlap a ni.",
    readDossier: "SaMD R&D Dossier Kimchang Chhiar Rawh",
  },
};

export function GameClinicalDrawer({ gameId, gameTitle }: GameClinicalDrawerProps) {
  const locale = useLocale();
  const t = GAME_DRAWER_I18N[locale] || GAME_DRAWER_I18N.en;
  const [isOpen, setIsOpen] = useState(false);
  const references: ClinicalReference[] = getReferencesForGame(gameId);

  return (
    <>
      {/* Discreet floating button in top-right / top-bar of game */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black/80 bg-white/95 px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-50 hover:border-black transition-all cursor-pointer z-30"
        title={t.triggerTitle}
        aria-label={t.triggerText}
      >
        <BookOpen className="h-3.5 w-3.5 text-tea stroke-[2.5]" />
        <span className="hidden sm:inline">{t.triggerText}</span>
        <span className="sm:hidden">{t.triggerShort}</span>
      </button>

      {/* Modal / Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border-3 border-black bg-[#FAF8F5] p-5 sm:p-6 shadow-[6px_6px_0px_#000]">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-black/10 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-tea-light border border-tea/30 px-2.5 py-0.5 text-[10px] font-black uppercase text-tea">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{t.badge}</span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                  {t.title}
                </h3>
                <p className="text-xs text-stone-600">
                  {t.subtitle}{" "}
                  <strong className="text-stone-900">{gameTitle || gameId}</strong>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl border-2 border-black bg-white p-1.5 text-black hover:bg-stone-100 shadow-[2px_2px_0px_#000] cursor-pointer"
                aria-label={t.closeAria}
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Citations List */}
            <div className="mt-4 space-y-3">
              {references.map((ref) => (
                <ClinicalReferenceCard key={ref.id} reference={ref} compact={false} />
              ))}
            </div>

            {/* Footer with link to Full Clinical Dossier */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-2 border-black/10 pt-4 text-xs">
              <span className="text-stone-600 text-[11px]">
                {t.compliance}
              </span>
              <Link
                href="/clinical-evidence"
                target="_blank"
                className="inline-flex items-center gap-1.5 font-bold text-emerald-800 hover:text-emerald-950 underline"
              >
                <span>{t.readDossier}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
