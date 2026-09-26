"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { PatientCard } from "@/components/caregiver/PatientCard";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { useTranslations, useLocale } from "next-intl";
import { api } from "@/lib/api";
import { AudioToggle } from "@/components/ui/AudioToggle";
import { CreditCard, FileText, BookOpen, ExternalLink, ShieldCheck, Radio, WifiOff } from "lucide-react";
import type { PatientSummary } from "@/types";
import { useSystemStatus } from "@/hooks/useSystemStatus";

import { getAllPatientSummaries } from "@/data/mockPatients";

const CAREGIVER_EXTRA_I18N: Record<string, {
  clinicalRd: string;
  guidelinesTitle: string;
  guidelinesSubtitle: string;
  samdDossier: string;
  card1Title: string;
  card1Desc: string;
  card2Title: string;
  card2Desc: string;
  card3Title: string;
  card3Desc: string;
  card4Title: string;
  card4Desc: string;
}> = {
  as: {
    clinicalRd: "ক্লিনিক্যাল আৰ এণ্ড ডি",
    guidelinesTitle: "যত্নকৰ্তাৰ বাবে প্ৰমাণ-ভিত্তিক নিৰ্দেশনা",
    guidelinesSubtitle: "চিকিৎসা-পৰীক্ষিত অপৌৰুষিক যত্ন প্ৰট'কল আৰু মানসিক চাপ হ্ৰাস",
    samdDossier: "SaMD আৰ এণ্ড ডি নথি",
    card1Title: "জাৰিট মানসিক চাপ মাপনী (ZBI-12)",
    card1Desc: "যত্নকৰ্তাৰ মানসিক চাপৰ মান্য স্কেল। ১৭-তকৈ অধিক নম্বৰে উচ্চ ভাগৰুৱা অৱস্থাৰ আশংকা নিৰ্দেশ কৰে।",
    card2Title: "NIH ষ্টেটপাৰ্লছ যত্ন বিধি",
    card2Desc: "ভ্ৰান্ত ধাৰণাৰ সৈতে কেতিয়াও তৰ্ক নকৰিব; অনুভূতিক সমৰ্থন কৰি মৰমেৰে মনোযোগ অন্য দিশলৈ নিয়ক।",
    card3Title: "ASHA নিৰ্দেশাৱলী",
    card3Desc: "আচৰণৰ পৰিৱৰ্তনে অপূৰ্ণ প্ৰয়োজনীয়তা (ভোক, ভয়, বিষ) প্ৰকাশ কৰে। দৃশ্যমান সহায় ব্যৱহাৰ কৰক।",
    card4Title: "লেনচেট কমিছন",
    card4Desc: "১৪টা জীৱনশৈলীৰ বিপদাশংকা নিয়ন্ত্ৰণ কৰি ৪৫% স্মৃতিভ্ৰংশ প্ৰতিৰোধ বা পলম কৰিব পাৰি।",
  },
  hi: {
    clinicalRd: "क्लीनिकल आर एंड डी",
    guidelinesTitle: "देखभालकर्ताओं के लिए साक्ष्य-आधारित नैदानिक दिशा-निर्देश",
    guidelinesSubtitle: "समीक्षित गैर-औषधीय देखभाल प्रोटोकॉल और तनाव निवारण",
    samdDossier: "SaMD आर एंड डी डोज़ियर",
    card1Title: "ज़ारिट बर्डन स्केल (ZBI-12)",
    card1Desc: "देखभालकर्ता के मानसिक तनाव का प्रमाणित पैमाना। 17 से अधिक अंक उच्च तनाव व थकान का संकेत देते हैं।",
    card2Title: "NIH स्टेटपर्ल्स देखभाल",
    card2Desc: "भ्रम की स्थिति में कभी बहस न करें; भावनाओं को स्वीकार करें और धीरे से ध्यान दूसरी ओर ले जाएं।",
    card3Title: "ASHA अभ्यास पोर्टल",
    card3Desc: "असामान्य व्यवहार अधूरी ज़रूरतों (भूख, डर, दर्द) को दर्शाते हैं। दृश्य संकेतों का उपयोग करें।",
    card4Title: "लैंसेट कमीशन रिपोर्ट",
    card4Desc: "14 जीवनशैली जोखिम कारकों को नियंत्रित करके 45% मनोभ्रंश के मामलों को रोका या टाला जा सकता है।",
  },
  en: {
    clinicalRd: "Clinical R&D",
    guidelinesTitle: "Evidence-Based Clinical Guidelines for Caregivers",
    guidelinesSubtitle: "Peer-reviewed non-pharmacological care protocols & distress reduction",
    samdDossier: "SaMD R&D Dossier",
    card1Title: "Zarit Burden (ZBI-12)",
    card1Desc: "Validated scale for caregiver emotional strain. Scores >17 predict high burnout risk.",
    card2Title: "NIH StatPearls Care",
    card2Desc: "Never argue or confront delusions; validate emotional feelings and gently redirect.",
    card3Title: "ASHA Practice Portal",
    card3Desc: "Responsive behaviors express unmet needs (hunger, fear, pain). Use visual aids.",
    card4Title: "Lancet Commission",
    card4Desc: "45% of dementia cases prevented or delayed by addressing 14 lifestyle risk factors.",
  },
  bn: {
    clinicalRd: "ক্লিনিক্যাল আর অ্যান্ড ডি",
    guidelinesTitle: "সেবাকারীদের জন্য প্রমাণ-ভিত্তিক ক্লিনিক্যাল নির্দেশিকা",
    guidelinesSubtitle: "পর্যালোচিত অ-ঔষধীয় যত্ন প্রোটোকল ও মানসিক চাপ হ্রাস",
    samdDossier: "SaMD আর অ্যান্ড ডি ডসিয়ার",
    card1Title: "জারিট মানসিক চাপ মাপকাঠি (ZBI-12)",
    card1Desc: "সেবাকারীর মানসিক চাপের যাচাইকৃত স্কেল। ১৭-এর বেশি স্কোর অতিরিক্ত ক্লান্তির ঝুঁকি নির্দেশ করে।",
    card2Title: "NIH স্টেটপার্লস যত্ন বিধি",
    card2Desc: "ভ্রান্ত ধারণায় কখনো তর্ক করবেন না; অনুভূতির মর্যাদা দিয়ে ধীরে ধীরে দৃষ্টি অন্য দিকে সরিয়ে নিন।",
    card3Title: "ASHA ক্লিনিক্যাল পোর্টাল",
    card3Desc: "আচরণগত পরিবর্তন অপ্রাপ্ত চাহিদা (ক্ষুধা, ভয়, ব্যথা) প্রকাশ করে। ভিজ্যুয়াল সহায়ক ব্যবহার করুন।",
    card4Title: "ল্যানসেট কমিশন",
    card4Desc: "১৪টি জীবনযাত্রার ঝুঁকি নিয়ন্ত্রণের মাধ্যমে ৪৫% ডিমেনশিয়া প্রতিরোধ বা বিলম্বিত করা সম্ভব।",
  },
  mr: {
    clinicalRd: "क्लिनिकल आर अँड डी",
    guidelinesTitle: "काळजीवाहकांसाठी पुरावा-आधारित क्लिनिकल मार्गदर्शक तत्त्वे",
    guidelinesSubtitle: "समीक्षित गैर-औषधी काळजी प्रोटोकॉल आणि ताण निवारण",
    samdDossier: "SaMD आर अँड डी दस्तऐवज",
    card1Title: "झारिट बर्डन स्केल (ZBI-12)",
    card1Desc: "काळजीवाहकाच्या भावनिक ताणाचे प्रमाणित प्रमाण. १७ पेक्षा जास्त गुण अति-थकव्याचा धोका दर्शवतात.",
    card2Title: "NIH स्टेटपर्ल्स केअर",
    card2Desc: "भ्रमाच्या स्थितीत कधीही वाद घालू नका; भावना समजून घेऊन हळूच लक्ष दुसरीकडे वळवा.",
    card3Title: "ASHA प्रॅक्टिस पोर्टल",
    card3Desc: "बदललेले वर्तन अपूर्ण गरजा (भूक, भीती, वेदना) दर्शवते. दृश्य साधनांचा वापर करा.",
    card4Title: "लॅन्सेट कमिशन",
    card4Desc: "१४ जीवनशैली जोखीम घटक नियंत्रित करून ४५% डिमेंशियाची प्रकरणे टाळता किंवा लांबवता येतात.",
  },
  ne: {
    clinicalRd: "क्लिनिकल आर एन्ड डी",
    guidelinesTitle: "हेरचाहकर्ताहरूका लागि प्रमाण-आधारित क्लिनिकल मार्गदर्शन",
    guidelinesSubtitle: "समीक्षित गैर-औषधीय हेरचाह प्रोटोकल र तनाव न्यूनीकरण",
    samdDossier: "SaMD आर एन्ड डी कागजात",
    card1Title: "जारिट बर्डन स्केल (ZBI-12)",
    card1Desc: "हेरचाहकर्ताको भावनात्मक तनावको प्रमाणित मापन। १७ भन्दा बढी अंकले उच्च थकानको जोखिम देखाउँछ।",
    card2Title: "NIH स्टेटपर्ल्स हेरचाह",
    card2Desc: "भ्रम वा शंकामा कहिल्यै विवाद नगर्नुहोस्; भावनालाई बुझेर बिस्तारै ध्यान अन्यत्र मोड्नुहोस्।",
    card3Title: "ASHA अभ्यास पोर्टल",
    card3Desc: "अनौठो व्यवहारले अपूरा आवश्यकताहरू (भोक, डर, दुखाइ) व्यक्त गर्दछ। दृश्य सामग्री प्रयोग गर्नुहोस्।",
    card4Title: "ल्यान्सेट कमिसन",
    card4Desc: "१४ जीवनशैली जोखिम कारकहरूलाई सम्बोधन गरेर ४५% डिमेन्सियाका घटनाहरू रोक्न वा ढिलाइ गर्न सकिन्छ।",
  },
  mni: {
    clinicalRd: "ক্লিনিকল আর এন্দ দি",
    guidelinesTitle: "য়োকখৎপীবশিংগীদমক প্রমান-য়ুম্ফম ওইবা ক্লিনিকেল গাইদলাইন",
    guidelinesSubtitle: "হিদাক য়াওদবা য়েংশিন থৌরাং অমসুং ৱাখলগী অৱাবা হন্থহনবা",
    samdDossier: "SaMD আর এন্দ দি দোসিঅর",
    card1Title: "জারিট বর্দন স্কেল (ZBI-12)",
    card1Desc: "য়োকখৎপীবগী ৱাখলগী অৱাবা চাংয়েং তৌবগী স্কেল। ১৭ গী ৱাংনা য়ৌবনা য়াম্না শোত্থবগী মতৌ তাকই।",
    card2Title: "NIH স্তেতপার্লস য়েংশিনবা",
    card2Desc: "অরানবা ৱাখলগা কদাইদসু ৱা য়ারোইদবনি; ফাওরিবা ফীভমবু য়াশিনবীয়ু অমসুং তোঙানবা নাকন্দা পুশিল্লু।",
    card3Title: "ASHA প্রাক্তিস পোর্তাল",
    card3Desc: "মথৌ তারবা পোৎলম (চাবা, কিবা, অনাবা) তাকই। উবা য়াবা খুদম শিজিন্নৌ।",
    card4Title: "লান্সেত কম্মিসন",
    card4Desc: "পুন্সি মহিংগী ওইবা মরম ১৪ শেমদোক্তুনা ডিমেন্সিয়াগী চাদা ৪৫ থিংবা নৎত্রগা থেংথহনবা ঙম্মি।",
  },
  brx: {
    clinicalRd: "क्लिनिकेल आर एन्द दि",
    guidelinesTitle: "सामलायग्राफोरनि थाखाय क्लिनिकेल बिथोन",
    guidelinesSubtitle: "मुलि नङै सामलायनाय आरो गोसोनि खस्थ खम खालामनाय",
    samdDossier: "SaMD आर एन्द दि डसियार",
    card1Title: "जारित बर्डेन स्केल (ZBI-12)",
    card1Desc: "सामलायग्रानि गोसोनि खस्थ'नि आनजाद। १७ नि बांसिन बांद्रा गिलिर खस्थ'नि दिन्थि।",
    card2Title: "NIH स्टेटपर्ल्स सामलायनाय",
    card2Desc: "गोरोन्थि साननायजों जेब्लाबो वाद दाखालाम; गोसोखौ बुजिना गुबुन फारसे गोसोखौ मोखां खालाम।",
    card3Title: "ASHA सोलोंथाय पोर्टल",
    card3Desc: "आखलनि सोलायनाया आंखाल (उखैनाय, गिनाय, सानाय) खौ दिन्थियो। मेगनजों नुनाय हेफाजात बाहाय।",
    card4Title: "ल्यानसेट कमिसन",
    card4Desc: "जिउ खान्थिनि १४ जाहोनखौ सामलायना ४५% दिमेन्सियानि खहाखौ होबथानो हायो।",
  },
  grt: {
    clinicalRd: "Clinical R&D",
    guidelinesTitle: "Naljokgiparangna Evidence-Based Guidelines",
    guidelinesSubtitle: "Sam gri naljokatani aro duk komaniko dakchakatani",
    samdDossier: "SaMD R&D Dossier",
    card1Title: "Zarit Burden Scale (ZBI-12)",
    card1Desc: "Naljokgipani duk aro jikjikaniko tona ma·ani. Score 17-na bate ong·ode duk dal·bata.",
    card2Title: "NIH StatPearls Care",
    card2Desc: "Katta jegrikna nangja; an·tangko kema ka·e gipinchin gisikko re·atbo.",
    card3Title: "ASHA Practice Portal",
    card3Desc: "Bobil dake kam ka·aniara nanganirangko (okriani, kenani, sadikani) mesoka. Chinrangko jakkalbo.",
    card4Title: "Lancet Commission",
    card4Desc: "Janggi tangani bewalo 14 a·selrangko champengani gimin 45% dementia-ko champengna man·a.",
  },
  kha: {
    clinicalRd: "Clinical R&D",
    guidelinesTitle: "Ki Jingbthah Tynrai na ka bynta ki Nongri",
    guidelinesSubtitle: "Rukom sumar ba khlem dawai ban pynduna ia ka jingshitom",
    samdDossier: "SaMD R&D Dossier",
    card1Title: "Zarit Burden Scale (ZBI-12)",
    card1Desc: "Ka rukom thew ia ka jingshitom jingmut u nongri. Lada palat 17 ka pyni ia ka jingshitom kaba khraw.",
    card2Title: "NIH StatPearls Sumar",
    card2Desc: "Wat iania lada u nongpang u bakla jingmut; pdiang ia ka jingmut bad pynphai sha kaba bha.",
    card3Title: "ASHA Practice Portal",
    card3Desc: "Ki rukom leh ki pyni ia kaba donkam (thngan, sheptieng, pang). Pyndonkam ki dur ban iarap.",
    card4Title: "Lancet Commission",
    card4Desc: "Lah ban khanglad 45% na ki jingpang dementia da kaba pynbeit ia ki 14 tylli ki rukom im.",
  },
  lus: {
    clinicalRd: "Clinical R&D",
    guidelinesTitle: "Enkawltute tana Evidence-Based Inkaihhruaina",
    guidelinesSubtitle: "Damdawi tel lova inenkawlna leh rilru hahdamna",
    samdDossier: "SaMD R&D Dossier",
    card1Title: "Zarit Burden Scale (ZBI-12)",
    card1Desc: "Enkawltu hahdam lohna tehna. Point 17 aia sang a nih chuan hah lutuk theihna a awm.",
    card2Title: "NIH StatPearls Enkawlna",
    card2Desc: "Rilru buai laiin inhnialpui suh; an rilru hriatthiampui la, thil dangah rilru pengthlak sak rawh.",
    card3Title: "ASHA Practice Portal",
    card3Desc: "Chezia danglam hian mamawh (rilttam, hlauhna, natna) a lantir. Hmuh theih thil hmangin pui rawh.",
    card4Title: "Lancet Commission",
    card4Desc: "Nunphung atanga harsatna 14 siamthat hian dementia 45% vel thleng a veng thei a ni.",
  },
};

export function CaregiverContent() {
  const t = useTranslations("caregiver");
  const locale = useLocale();
  const c18n = CAREGIVER_EXTRA_I18N[locale] || CAREGIVER_EXTRA_I18N.en;
  const systemStatus = useSystemStatus();

  // Immediately initialize with all patient summaries - zero loading delay
  const [patients, setPatients] = useState<PatientSummary[]>(() => getAllPatientSummaries());
  const [loading, setLoading] = useState(false);
  const [reloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;
    async function fetchPatients() {
      try {
        const fetchPromise = api.get<PatientSummary[]>("/patients");
        const timeoutPromise = new Promise<null>((resolve) =>
          setTimeout(() => resolve(null), 1200)
        );
        const data = await Promise.race([fetchPromise, timeoutPromise]);
        if (!ignore && Array.isArray(data) && data.length > 0) {
          const localList = getAllPatientSummaries();
          const seenIds = new Set<number>();
          const seenNames = new Set<string>();
          const merged: PatientSummary[] = [];

          for (const p of [...data, ...localList]) {
            if (!p || !p.name) continue;
            const norm = p.name.trim().toLowerCase();
            if (seenIds.has(p.id) || seenNames.has(norm)) continue;
            seenIds.add(p.id);
            seenNames.add(norm);
            merged.push(p);
          }

          setPatients(merged);
        }
      } catch {
        // Silently retain pre-loaded patients
      }
    }
    fetchPatients();
    return () => {
      ignore = true;
    };
  }, [reloadKey]);

  return (
    <>
      <div className="bg-ink border-b-4 border-border px-3 py-3 md:px-6 md:py-3.5">
        <div className="max-w-5xl mx-auto flex flex-col gap-2.5 sm:gap-3">
          {/* Mobile Top Action Row: Back to Home + Audio + Add Patient */}
          <div className="flex items-center justify-between sm:hidden">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-ink-inverse/70 hover:text-ink-inverse font-bold text-xs transition-colors cursor-pointer"
            >
              ← {t("home")}
            </Link>
            <div className="flex items-center gap-2">
              <AudioToggle size="md" />
              <Link
                href="/caregiver/add-patient"
                className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-marigold px-3 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-amber-600 transition-colors shrink-0"
              >
                {t("addPatient")}
              </Link>
            </div>
          </div>

          {/* Desktop & Mobile Main Heading Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="font-serif font-black text-xl md:text-2xl text-ink-inverse leading-tight">
                {t("title")}
              </h1>
              <p className="text-ink-inverse/60 text-xs mt-0.5">{t("subtitle")}</p>
            </div>

            {/* Desktop Actions */}
            <div className="hidden sm:flex items-center gap-2.5">
              <div
                suppressHydrationWarning
                className={`inline-flex items-center gap-1.5 rounded-xl border-2 border-black px-2.5 py-1 text-xs font-black shadow-[2px_2px_0px_#000] ${
                  systemStatus.isSpringOnline
                    ? "bg-emerald-100 text-emerald-950"
                    : "bg-rose-100 text-rose-950"
                }`}
                title={systemStatus.isSpringOnline ? "Spring Backend Online" : "Spring Backend Offline"}
              >
                {systemStatus.isSpringOnline ? (
                  <Radio className="h-3 w-3 text-emerald-700 animate-pulse" />
                ) : (
                  <WifiOff className="h-3 w-3 text-rose-700" />
                )}
                <span>{systemStatus.isSpringOnline ? "Spring Online" : "Spring Offline"}</span>
              </div>

              <AudioToggle />
              <Link
                href="/clinical-evidence"
                className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-white/30 bg-white/10 hover:bg-white/20 px-3 py-2 text-xs font-black text-white shadow-xs"
                title="Clinical Evidence & Neuropsychological R&D Dossier"
              >
                <FileText className="h-4 w-4 text-amber-300" />
                <span className="hidden sm:inline">{c18n.clinicalRd}</span>
              </Link>
              <Link href="/caregiver/add-patient">
                <ChunkyButton variant="marigold" size="xl">
                  {t("addPatient")}
                </ChunkyButton>
              </Link>
              <Link
                href="/"
                className="text-ink-inverse/60 hover:text-ink-inverse font-bold text-xs sm:text-sm transition-colors ml-2"
              >
                ← {t("home")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-3 pb-32 sm:pb-24 space-y-3 flex-1 w-full">
        <div>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-lg text-ink mb-2">
            {t("yourPatients")}
          </h2>

          {patients.length === 0 ? (
            <div className="scrapbook-card text-center py-14">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-2xl bg-tea-light border-3 border-tea flex items-center justify-center text-tea">
                  <CreditCard className="h-8 w-8 stroke-[2.2]" />
                </div>
              </div>
              <p className="font-[family-name:var(--font-serif)] font-bold text-2xl text-ink mb-1">
                {t("emptyTitle")}
              </p>
              <p className="text-ink-secondary font-bold text-base">
                {t("emptyList")}
              </p>
              <div className="mt-6">
                <Link href="/caregiver/add-patient">
                  <ChunkyButton variant="marigold" size="xl">
                    {t("addPatient")}
                  </ChunkyButton>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-3 flex gap-2 flex-col">
              {patients.map((patient) => (
                <Link
                  key={patient.id}
                  href={`/caregiver/patients/${patient.id}`}
                >
                  <PatientCard patient={patient} />
                </Link>
              ))}
            </div>
          )}

          {/* Evidence-Based Clinical Guidance for Caregivers */}
          <div className="mt-8 rounded-2xl border-2 border-black bg-white p-5 shadow-[4px_4px_0px_#000] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-tea-light border-2 border-black flex items-center justify-center text-tea">
                  <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base text-ink">
                    {c18n.guidelinesTitle}
                  </h3>
                  <p className="text-[11px] text-ink-secondary">
                    {c18n.guidelinesSubtitle}
                  </p>
                </div>
              </div>

              <Link
                href="/clinical-evidence"
                className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea px-3 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-900 transition-colors"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>{c18n.samdDossier}</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-1">
                <span className="font-bold text-tea text-[11px] uppercase">{c18n.card1Title}</span>
                <p className="text-[11px] text-stone-600 leading-snug">
                  {c18n.card1Desc}
                </p>
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/11574710/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-tea text-[10px] hover:underline"
                >
                  <span>Bédard 2001 (PMID: 11574710)</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-1">
                <span className="font-bold text-emerald-800 text-[11px] uppercase">{c18n.card2Title}</span>
                <p className="text-[11px] text-stone-600 leading-snug">
                  {c18n.card2Desc}
                </p>
                <a
                  href="https://www.ncbi.nlm.nih.gov/books/NBK557444/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-emerald-800 text-[10px] hover:underline"
                >
                  <span>Emmady 2022 (NBK557444)</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-1">
                <span className="font-bold text-indigo-800 text-[11px] uppercase">{c18n.card3Title}</span>
                <p className="text-[11px] text-stone-600 leading-snug">
                  {c18n.card3Desc}
                </p>
                <a
                  href="https://www.asha.org/practice-portal/clinical-topics/dementia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-indigo-800 text-[10px] hover:underline"
                >
                  <span>ASHA Guidelines (2023)</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-1">
                <span className="font-bold text-purple-800 text-[11px] uppercase">{c18n.card4Title}</span>
                <p className="text-[11px] text-stone-600 leading-snug">
                  {c18n.card4Desc}
                </p>
                <a
                  href="https://pubmed.ncbi.nlm.nih.gov/39096926/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-bold text-purple-800 text-[10px] hover:underline"
                >
                  <span>Livingston 2024 (PMID: 39096926)</span>
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}