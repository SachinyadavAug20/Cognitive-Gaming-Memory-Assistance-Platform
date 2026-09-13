"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { BookOpen, ExternalLink, ShieldCheck, CheckCircle2, Award, FileText } from "lucide-react";
import { CLINICAL_REFERENCES } from "@/lib/clinicalReferences";


const EVIDENCE_SHOWCASE_I18N: Record<string, {
  badge: string;
  title: string;
  subtitle: string;
  dossierBtn: string;
  readPaper: string;
  viewAll: string;
}> = {
  as: {
    badge: "চিকিৎসা-পৰীক্ষিত ক্লিনিকেল ভেটি",
    title: "ক্লিনিকেল গৱেষণাৰ ওপৰত প্ৰতিষ্ঠিত, কাল্পনিক নহয়",
    subtitle: "CogniCare ৰ প্ৰতিটো খেল, অভিযোজিত কঠিনতা আৰু সুবিধা চিকিৎসাগত নিয়ন্ত্ৰিত পৰীক্ষা আৰু স্বীকৃত মেডিকেল জাৰ্নেলৰ ওপৰত ভিত্তি কৰি তৈয়াৰ কৰা হৈছে।",
    dossierBtn: "SaMD Class B নথি চাওক",
    readPaper: "অফিচিয়েল গৱেষণা-পত্ৰ পঢ়ক",
    viewAll: "সকলো ২০+ স্বীকৃতিপ্ৰাপ্ত প্ৰসংগ চাওক →"
  },
  hi: {
    badge: "सहकर्मी-समीक्षित नैदानिक आधार",
    title: "नैदानिक अनुसंधानों पर आधारित, कल्पना पर नहीं",
    subtitle: "CogniCare का प्रत्येक संज्ञानात्मक अभ्यास, अनुकूलनीय कठिनाई और सुगमता सुविधा ऐतिहासिक नियंत्रित परीक्षणों और मान्यता प्राप्त चिकित्सा पत्रिकाओं पर आधारित है।",
    dossierBtn: "SaMD Class B डोज़ियर देखें",
    readPaper: "आधिकारिक शोध-पत्र पढ़ें",
    viewAll: "सभी 20+ सहकर्मी-समीक्षित संदर्भ देखें →"
  },
  en: {
    badge: "Peer-Reviewed Clinical Foundation",
    title: "{e18n.title}",
    subtitle: "{e18n.subtitle}",
    dossierBtn: "Explore SaMD Class B Dossier",
    readPaper: "Read Official Paper",
    viewAll: "View all 20+ peer-reviewed citations →"
  },
  bn: {
    badge: "পিয়ার-রিভিউড ক্লিনিক্যাল ভিত্তি",
    title: "ক্লিনিক্যাল গবেষণার ওপর প্রতিষ্ঠিত, কোনো কল্পনা নয়",
    subtitle: "CogniCare-এর প্রতিটি ব্যায়াম, অভিযোজিত কঠিনতা এবং অ্যাক্সেসিবিলিটি সুবিধা স্বীকৃত নিয়ন্ত্রিত পরীক্ষা এবং অফিসিয়াল মেডিকেল জার্নালের ওপর প্রতিষ্ঠিত।",
    dossierBtn: "SaMD Class B ডসিয়ার দেখুন",
    readPaper: "অফিসিয়াল পেপার পড়ুন",
    viewAll: "সমস্ত ২০+ পিয়ার-রিভিউড তথ্যসূত্র দেখুন →"
  },
  mr: {
    badge: "तज्ज्ञ-समीक्षित क्लिनिकल पाया",
    title: "क्लिनिकल संशोधनावर आधारित, कल्पनेवर नाही",
    subtitle: "CogniCare चा प्रत्येक सराव, अनुकूल अडचण पातळी आणि सुलभता वैशिष्ट्ये प्रमाणित वैद्यकीय चाचण्या आणि नियतकालिकांवर आधारित आहेत.",
    dossierBtn: "SaMD Class B दस्तऐवज पहा",
    readPaper: "अधिकृत शोधनिबंध वाचा",
    viewAll: "सर्व 20+ तज्ज्ञ-समीक्षित संदर्भ पहा →"
  },
  ne: {
    badge: "सहकर्मी-समीक्षित क्लिनिकल आधार",
    title: "क्लिनिकल अनुसन्धानमा आधारित, कल्पना होइन",
    subtitle: "CogniCare को प्रत्येक अभ्यास, अनुकूलनीय कठिनाइ र पहुँच सुविधा प्रमाणित चिकित्सा अनुसन्धान र पत्रिकाहरूमा आधारित छ।",
    dossierBtn: "SaMD Class B कागजात हेर्नुहोस्",
    readPaper: "आधिकारिक शोधपत्र पढ्नुहोस्",
    viewAll: "सबै २०+ सहकर्मी-समीक्षित सन्दर्भहरू हेर्नुहोस् →"
  },
  mni: {
    badge: "ক্লিনিকেল য়ুম্ফম",
    title: "ক্লিনিকেল রিসার্সতা য়ুম্ফম ওইবা",
    subtitle: "CogniCare গী শান্নপোৎ অমসুং অ্যালগোরিদম পুম্নমক সাইন্তিফিক ওইবা রিসার্সতা য়ুম্ফম ওইবনি।",
    dossierBtn: "SaMD Class B দোসিঅর য়েংউ",
    readPaper: "রিসার্স পেপার পাবীয়ু",
    viewAll: "রিসার্স রেফরেন্স ২০+ পুম্নমক য়েংউ →"
  },
  brx: {
    badge: "क्लिनिकेल ओंथि",
    title: "क्लिनिकेल आनजादनि सायाव सोनारनाय",
    subtitle: "CogniCare नि गासै गेलेनाय आरो बिथोनफोरा क्लिनिकेल आनजादनि सायाव गायसननाय।",
    dossierBtn: "SaMD Class B डसियार नाय",
    readPaper: "गाहाइ बिलाइ फराय",
    viewAll: "गासै २०+ रिफारेन्स नाय →"
  },
  grt: {
    badge: "Peer-Reviewed Clinical Foundation",
    title: "Clinical Research-o Pangchakgimin",
    subtitle: "CogniCare-ni serious games aro accessibility randomized clinical trials-o pangchaka.",
    dossierBtn: "SaMD Class B Dossier Nibo",
    readPaper: "Official Paper Poraibo",
    viewAll: "20+ Citations-ko Nibo →"
  },
  kha: {
    badge: "Clinical Tynrai ba la Pynskhem",
    title: "Seng halor ka Jingwad Bniah Clinical",
    subtitle: "Ki jingialehkai bad ka rukom sumar ha CogniCare la pynshong nongrim halor ki jingwad bniah ba shisha.",
    dossierBtn: "Peit ia ka SaMD Class B Dossier",
    readPaper: "Pule ia ka Kot Bniah",
    viewAll: "Peit Lut 20+ Citations →"
  },
  lus: {
    badge: "Clinical Foundation Rintlak",
    title: "Clinical Research-a Innghat",
    subtitle: "CogniCare game leh algorithm zawng zawngte hi clinical trial leh medical journal rintlaka innghat a ni.",
    dossierBtn: "SaMD Class B Dossier En Rawh",
    readPaper: "Official Paper Chhiar Rawh",
    viewAll: "Citation 20+ En Rawh →"
  }
};

export function ClinicalEvidenceShowcase() {
  const locale = useLocale();
  const e18n = EVIDENCE_SHOWCASE_I18N[locale] || EVIDENCE_SHOWCASE_I18N.en;
  const highlightRefs = [
    CLINICAL_REFERENCES.find((r) => r.id === "nih-statpearls-dementia-2022")!,
    CLINICAL_REFERENCES.find((r) => r.id === "finger-lancet-2015")!,
    CLINICAL_REFERENCES.find((r) => r.id === "active-jama-2002")!,
    CLINICAL_REFERENCES.find((r) => r.id === "errorless-clare-2008")!,
    CLINICAL_REFERENCES.find((r) => r.id === "sea-hero-quest-natcomm-2019")!,
    CLINICAL_REFERENCES.find((r) => r.id === "w3c-coga-2023")!,
  ].filter(Boolean);

  return (
    <section className="w-full rounded-3xl border-3 border-black bg-surface p-6 sm:p-8 shadow-[5px_5px_0px_#000] space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-tea-light border border-tea/30 text-tea text-xs font-black uppercase tracking-wider mb-2">
            <Award className="h-3.5 w-3.5" />
            <span>{e18n.badge}</span>
          </div>
          <h2 className="font-serif font-black text-2xl sm:text-3xl text-ink leading-tight">
            {e18n.title}
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary mt-1 max-w-2xl font-medium leading-relaxed">
            {e18n.subtitle}
          </p>
        </div>

        <Link
          href="/clinical-evidence"
          className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-black bg-tea px-4 py-2.5 text-xs sm:text-sm font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-900 transition-colors"
        >
          <FileText className="h-4 w-4" />
          <span>{e18n.dossierBtn}</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Grid of Verified References */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlightRefs.map((ref) => (
          <article
            key={ref.id}
            className="flex flex-col justify-between rounded-2xl border-2 border-black bg-white p-4 shadow-[3px_3px_0px_#000] hover:translate-y-[-2px] transition-transform"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md bg-stone-100 border border-stone-200 px-2 py-0.5 text-[10px] font-mono font-bold text-stone-700">
                  {ref.publisher.split("/")[0].trim()}
                </span>
                <span className="text-[11px] font-bold text-stone-500">
                  {ref.year}
                </span>
              </div>

              <h3 className="font-serif text-xs sm:text-sm font-bold text-stone-900 line-clamp-2">
                {ref.title}
              </h3>

              <p className="text-[11px] text-stone-600 line-clamp-1">
                {ref.authors} &bull; <em>{ref.journal.split(",")[0]}</em>
              </p>

              <p className="text-[11px] text-stone-700 font-medium leading-relaxed line-clamp-3 bg-stone-50 p-2 rounded-lg border border-stone-200/60">
                {ref.clinicalTakeaway}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1 font-mono text-stone-500 text-[10px]">
                {ref.pmid ? (
                  <span>PMID: {ref.pmid}</span>
                ) : ref.bookshelfId ? (
                  <span>NCBI: {ref.bookshelfId}</span>
                ) : (
                  <span>Official Spec</span>
                )}
              </div>

              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-tea hover:text-emerald-900 underline"
              >
                <span>{e18n.readPaper}</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </article>
        ))}
      </div>

      <div className="rounded-2xl border-2 border-black/15 bg-amber-50/70 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-950 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-800 shrink-0" />
          <span>
            Complies with CDSCO SaMD Class B Rules 2017 &bull; ICMR AI Ethics Guidelines 2023 &bull; W3C COGA AAA Standards
          </span>
        </div>
        <Link
          href="/clinical-evidence"
          className="font-bold underline hover:text-amber-900 text-xs"
        >
          {e18n.viewAll}
        </Link>
      </div>
    </section>
  );
}
