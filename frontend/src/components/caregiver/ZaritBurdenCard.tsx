"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import {
  HeartHandshake,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  ClipboardList,
  PhoneCall,
  CheckCircle2,
  X,
  ArrowRight,
} from "lucide-react";
import {
  ZBI_12_QUESTIONS,
  evaluateZaritBurden,
  type ZBIResult,
} from "@/lib/errorlessLearning";

interface ZaritBurdenCardProps {
  patientId?: number | string;
  patientName?: string;
}

const STORAGE_KEY = "cognicare_caregiver_zbi_state";

const DEFAULT_ANSWERS: Record<number, number> = {
  1: 1, // Rarely
  2: 2, // Sometimes
  3: 1, // Rarely
  4: 1, // Rarely
  5: 1, // Rarely
  6: 1, // Rarely
  7: 1, // Rarely
  8: 2, // Sometimes
  9: 1, // Rarely
  10: 1, // Rarely
  11: 2, // Sometimes
  12: 1, // Rarely
};

interface ZaritTexts {
  title: string;
  subtitle: string;
  btnScreening: string;
  scoreLabel: string;
  ptsLabel: string;
  copingTitle: string;
  peerSupportBadge: string;
  psychoEdBadge: string;
  interventionsTitle: string;
  helplineTitle: string;
  helplineDesc: string;
  helplineBtn: string;
  modalBadge: string;
  modalTitle: string;
  modalScoreLabel: string;
  modalSaveBtn: string;
  answers: Record<number, string>;
}

const ZARIT_I18N: Record<string, ZaritTexts> = {
  en: {
    title: "Caregiver Strain & Resilience Index (ZBI-12)",
    subtitle: "Standardized Zarit Burden Interview (ZBI-12) clinical assessment for informal family caregivers.",
    btnScreening: "Take ZBI-12 Screening",
    scoreLabel: "Zarit Burden Score",
    ptsLabel: "/ 48 pts",
    copingTitle: "Clinical Evaluation & Coping Equilibrium",
    peerSupportBadge: "CARES Peer Support Recommended",
    psychoEdBadge: "Psychoeducational Interventions Active",
    interventionsTitle: "Recommended Evidence-Based Burnout Mitigation Steps:",
    helplineTitle: "Tele-MANAS National Mental Health Helpline (24x7 Free)",
    helplineDesc: "Dial 14416 or 1800-891-4416 for confidential caregiver counseling in 11 North Eastern dialects.",
    helplineBtn: "Call 14416 Helpline",
    modalBadge: "Standardized ZBI-12 Questionnaire",
    modalTitle: "Caregiver Burden Assessment",
    modalScoreLabel: "Total Burden Score:",
    modalSaveBtn: "Save & Apply Caregiver Plan",
    answers: { 0: "Never", 1: "Rarely", 2: "Sometimes", 3: "Frequently", 4: "Nearly Always" },
  },
  as: {
    title: "যত্নকৰ্তাৰ মানসিক চাপ আৰু সহনশীলতা সূচক (ZBI-12)",
    subtitle: "পাৰিবাৰিক যত্নকৰ্তাসকলৰ বাবে মানক জাৰিট বোৰ্ডেন ইন্টাৰভিউ (ZBI-12) ক্লিনিকেল মূল্যায়ন।",
    btnScreening: "ZBI-12 পৰীক্ষা দিয়ক",
    scoreLabel: "জাৰিট বোৰ্ডেন স্কোৰ",
    ptsLabel: "/ ৪৮ নম্বৰ",
    copingTitle: "চিকিৎসাগত মূল্যায়ন আৰু সহনশীলতা",
    peerSupportBadge: "CARES সমনীয়া সমৰ্থনৰ পৰামৰ্শ",
    psychoEdBadge: "মনো-শিক্ষণ কাৰ্যসূচী সক্ৰিয়",
    interventionsTitle: "মানসিক ক্লান্তি প্ৰশমনৰ পৰামৰ্শিত বৈজ্ঞানিক পদক্ষেপসমূহ:",
    helplineTitle: "টেলি-মানস ৰাষ্ট্ৰীয় মানসিক স্বাস্থ্য হেল্পলাইন (২৪x৭ বিনামূলীয়া)",
    helplineDesc: "১১ টা উত্তৰ-পূবৰ ভাষাত গোপনীয় পৰামৰ্শৰ বাবে ১৪৪১৬ বা ১৮০০-৮৯১-৪৪১৬ নম্বৰত ডায়েল কৰক।",
    helplineBtn: "১৪৪১৬ হেল্পলাইনত ফোন কৰক",
    modalBadge: "মানক ZBI-12 প্ৰশ্নাৱলী",
    modalTitle: "যত্নকৰ্তাৰ মানসিক চাপৰ মূল্যায়ন",
    modalScoreLabel: "মুঠ মানসিক চাপ স্কোৰ:",
    modalSaveBtn: "সংৰক্ষণ আৰু পৰিকল্পনা প্ৰয়োগ কৰক",
    answers: { 0: "কেতিয়াও নহয়", 1: "কদাচিৎ", 2: "মাজে মাজে", 3: "সঘনাই", 4: "প্ৰায় সদায়" },
  },
  hi: {
    title: "देखभालकर्ता तनाव एवं लचीलापन सूचकांक (ZBI-12)",
    subtitle: "अनौपचारिक पारिवारिक देखभालकर्ताओं हेतु मानकीकृत ज़ारिट बर्डन इंटरव्यू (ZBI-12) नैदानिक मूल्यांकन।",
    btnScreening: "ZBI-12 स्क्रीनिंग लें",
    scoreLabel: "ज़ारिट बर्डन स्कोर",
    ptsLabel: "/ 48 अंक",
    copingTitle: "नैदानिक मूल्यांकन एवं मुकाबला संतुलन",
    peerSupportBadge: "CARES सहकर्मी सहायता अनुशंसित",
    psychoEdBadge: "मनो-शैक्षणिक हस्तक्षेप सक्रिय",
    interventionsTitle: "तनाव निवारण हेतु अनुशंसित साक्ष्य-आधारित कदम:",
    helplineTitle: "टेली-मानस राष्ट्रीय मानसिक स्वास्थ्य हेल्पलाइन (24x7 निःशुल्क)",
    helplineDesc: "11 पूर्वोत्तर बोलियों में गोपनीय देखभालकर्ता परामर्श हेतु 14416 या 1800-891-4416 डायल करें।",
    helplineBtn: "14416 हेल्पलाइन पर कॉल करें",
    modalBadge: "मानकीकृत ZBI-12 प्रश्नावली",
    modalTitle: "देखभालकर्ता तनाव मूल्यांकन",
    modalScoreLabel: "कुल तनाव स्कोर:",
    modalSaveBtn: "सहेजें और देखभाल योजना लागू करें",
    answers: { 0: "कभी नहीं", 1: "शायद ही कभी", 2: "कभी-कभी", 3: "बार-बार", 4: "लगभग हमेशा" },
  },
  bn: {
    title: "পরিচর্যাকারী ক্লান্তি ও স্থিতিস্থাপকতা সূচক (ZBI-12)",
    subtitle: "পারিবারিক পরিচর্যাকারীদের জন্য প্রমিত জারিট বার্ডেন ইন্টারভিউ (ZBI-12) ক্লিনিকাল মূল্যায়ন।",
    btnScreening: "ZBI-12 স্ক্রিনিং দিন",
    scoreLabel: "জারিট বার্ডেন স্কোর",
    ptsLabel: "/ ৪৮ পয়েন্ট",
    copingTitle: "ক্লিনিক্যাল মূল্যায়ন ও মোকাবিলার ভারসাম্য",
    peerSupportBadge: "CARES সহকর্মী সহায়তা প্রস্তাবিত",
    psychoEdBadge: "মনস্তাত্ত্বিক শিক্ষা কর্মসূচি সক্রিয়",
    interventionsTitle: "ক্লান্তি হ্রাসে প্রস্তাবিত প্রমাণ-ভিত্তিক পদক্ষেপসমূহ:",
    helplineTitle: "টেলি-মানস জাতীয় মানসিক স্বাস্থ্য হেল্পলাইন (২৪x৭ বিনামূল্যে)",
    helplineDesc: "১১টি উত্তর-পূর্বের ভাষায় গোপনীয় পরিচর্যাকারী পরামর্শের জন্য ১৪৪১৬ বা ১৮০০-৮৯১-৪৪১৬ ডায়াল করুন।",
    helplineBtn: "১৪৪১৬ হেল্পলাইনে কল করুন",
    modalBadge: "প্রমিত ZBI-12 প্রশ্নাবলী",
    modalTitle: "পরিচর্যাকারীর চাপের মূল্যায়ন",
    modalScoreLabel: "মোট চাপ স্কোর:",
    modalSaveBtn: "সংরক্ষণ ও পরিচর্যা পরিকল্পনা প্রয়োগ",
    answers: { 0: "কখনই নয়", 1: "খুব কম", 2: "মাঝে মাঝে", 3: "ঘন ঘন", 4: "প্রায় সবসময়" },
  },
  mr: {
    title: "काळजीवाहू ताण व सहनशीलता निर्देशांक (ZBI-12)",
    subtitle: "कौटुंबिक काळजीवाहकांसाठी प्रमाणित झारिट बर्डन इंटरव्ह्यू (ZBI-12) वैद्यकीय मूल्यांकन.",
    btnScreening: "ZBI-12 चाचणी घ्या",
    scoreLabel: "झारिट बर्डन गुण",
    ptsLabel: "/ ४८ गुण",
    copingTitle: "वैद्यकीय मूल्यमापन आणि संतुलन",
    peerSupportBadge: "CARES सहकारी सहाय्य शिफारस",
    psychoEdBadge: "मानसोपचार हस्तक्षेप सक्रिय",
    interventionsTitle: "ताण कमी करण्यासाठी पुरावा-आधारित उपाययोजना:",
    helplineTitle: "टेली-मानस राष्ट्रीय मानसिक आरोग्य हेल्पलाइन (२४x७ मोफत)",
    helplineDesc: "११ ईशान्य बोलींमध्ये गोपनीय काळजीवाहू समुपदेशनासाठी १४४१६ किंवा १८००-८९१-४४१६ डायल करा.",
    helplineBtn: "१४४१६ हेल्पलाइनवर कॉल करा",
    modalBadge: "प्रमाणित ZBI-12 प्रश्नावली",
    modalTitle: "काळजीवाहू ताण मूल्यमापन",
    modalScoreLabel: "एकूण ताण गुण:",
    modalSaveBtn: "जतन करा आणि योजना लागू करा",
    answers: { 0: "कधीच नाही", 1: "क्वचितच", 2: "कधीकधी", 3: "वारंवार", 4: "नेहमीच" },
  },
  ne: {
    title: "हेरचाहकर्ता तनाव तथा सहनशीलता सूचकांक (ZBI-12)",
    subtitle: "पारिवारिक हेरचाहकर्ताहरूका लागि मानकीकृत जारिट बर्डन अन्तर्वार्ता (ZBI-12) क्लिनिकल मूल्यांकन।",
    btnScreening: "ZBI-12 परीक्षण लिनुहोस्",
    scoreLabel: "जारिट बर्डन स्कोर",
    ptsLabel: "/ ४८ अंक",
    copingTitle: "क्लिनिकल मूल्यांकन र सन्तुलन",
    peerSupportBadge: "CARES साथी समर्थन सिफारिस गरिएको",
    psychoEdBadge: "मनो-शिक्षा हस्तक्षेप सक्रिय",
    interventionsTitle: "तनाव न्यूनीकरणका लागि सिफारिस गरिएका कदमहरू:",
    helplineTitle: "टेली-मानस राष्ट्रिय मानसिक स्वास्थ्य हेल्पलाइन (२४x७ निःशुल्क)",
    helplineDesc: "११ पूर्वोत्तर भाषाहरूमा गोपनीय हेरचाहकर्ता परामर्शका लागि १४४१६ वा १८००-८९१-४४१६ डायल गर्नुहोस्।",
    helplineBtn: "१४४१६ हेल्पलाइनमा कल गर्नुहोस्",
    modalBadge: "मानकीकृत ZBI-12 प्रश्नावली",
    modalTitle: "हेरचाहकर्ता तनाव मूल्यांकन",
    modalScoreLabel: "कुल तनाव स्कोर:",
    modalSaveBtn: "बचत गर्नुहोस् र योजना लागू गर्नुहोस्",
    answers: { 0: "कहिल्यै होइन", 1: "कहिलेकाहीँ मात्र", 2: "कहिलेकाहीँ", 3: "प्रायः", 4: "लगभग सधैँ" },
  },
  mni: {
    title: "য়েন্থোকপাগী অৱাবা অমসুং কনবা ময়েক (ZBI-12)",
    subtitle: "ইমুংগী য়েন্থোকপশিংগীদমক জারিত বর্দেন ইন্তরভিউ (ZBI-12) ক্লিনিকেল চাংয়েং।",
    btnScreening: "ZBI-12 চাংয়েং তৌবীয়ু",
    scoreLabel: "জারিত বর্দেন স্কোর",
    ptsLabel: "/ ৪৮ নম্বৰ",
    copingTitle: "ক্লিনিকেল চাংয়েং অমসুং ৱাখলগী শান্তি",
    peerSupportBadge: "CARES মতেং লৌনবগী পাউতাক",
    psychoEdBadge: "ৱাখলগী লাইরিক তম্বগী থবক চত্থরি",
    interventionsTitle: "অৱাবা হন্থহন্নবা বৈজ্ঞানিক খোংথাংশিং:",
    helplineTitle: "তেলি-মানস লৈবাক্কী ৱাখল হকশেল হেল্পলাইন (২৪x৭ ফ্রী)",
    helplineDesc: "অৱাং-নোংপোক্কী লোন ১১দা লোয়ননা ৱারী শান্নবগীদমক ১৪৪১৬ নত্রগা ১৮০০-৮৯১-৪৪১৬ দা কোল তৌবীয়ু।",
    helplineBtn: "১৪৪১৬ হেল্পলাইন্দা কোল তৌউ",
    modalBadge: "নিয়মগী ZBI-12 ৱাহং পরীক",
    modalTitle: "য়েন্থোকপাগী অৱাবা চাংয়েং",
    modalScoreLabel: "অপুনবা অৱাবগী স্কোর:",
    modalSaveBtn: "সেভ তৌউ অমসুং চৎনহনবা",
    answers: { 0: "কৈদৌনুংদা নত্তে", 1: "খরা খক্তা", 2: "মতম অমদা", 3: "লেপ্তনা", 4: "য়াম্না থুনা থুনা" },
  },
  brx: {
    title: "सांग्रां खालामग्रानि नारथाइ आरो गोहो आनजाद (ZBI-12)",
    subtitle: "नख'रनि सांग्रां खालामग्राफोरनि थाखाय मानगोनां जारित बार्डेन इन्टारभिउ (ZBI-12) क्लिनिकेल आनजाद।",
    btnScreening: "ZBI-12 आनजाद ला",
    scoreLabel: "जारित बार्डेन नम्बर",
    ptsLabel: "/ 48 नम्बर",
    copingTitle: "क्लिनिकेल आनजाद आरो गोसोनि गोजोन",
    peerSupportBadge: "CARES हेफाजाबनि सुफारिस",
    psychoEdBadge: "गोसोनि सोलोंथाइ सोलिगासिनो",
    interventionsTitle: "नारथाइ खम खालामनो फोरमान गोनां आगजुफोर:",
    helplineTitle: "टेलि-मानस हादोरारि गोसो सावस्रि हेल्पनां (24x7 फ्रि)",
    helplineDesc: "सान्जा-सा राज्योफोरनि 11 रावजों खौरांगिरि खालामनो 14416 एबा 1800-891-4416 आव कल खालाम।",
    helplineBtn: "14416 आव कल खालाम",
    modalBadge: "मानगोनां ZBI-12 सोंनायफोर",
    modalTitle: "सांग्रां खालामग्रानि नारथाइ आनजाद",
    modalScoreLabel: "गासै नारथाइ नम्बर:",
    modalSaveBtn: "दोनथुम आरो बिथांखि बाहाय",
    answers: { 0: "मालाबाबो नङा", 1: "एसेल'", 2: "मालाबा मालाबा", 3: "गोबां समाव", 4: "जेब्लाबो" },
  },
  grt: {
    title: "Ni∙rokenggipani Neng∙nikani aro Bilni Index (ZBI-12)",
    subtitle: "Nokdangni ni∙rokenggipana Zarit Burden Interview (ZBI-12) clinical assessment.",
    btnScreening: "ZBI-12 Screening-ko Ra∙bo",
    scoreLabel: "Zarit Burden Score",
    ptsLabel: "/ 48 pts",
    copingTitle: "Clinical Evaluation aro Tom∙tomani",
    peerSupportBadge: "CARES Peer Supportko Ku∙pattiani",
    psychoEdBadge: "Psychoeducational Intervention Ong∙enga",
    interventionsTitle: "Neng∙nikaniko Komiatna Namgipa Ja∙kurang:",
    helplineTitle: "Tele-MANAS National Mental Health Helpline (24x7 Free)",
    helplineDesc: "North East ku∙rang 11-chi aganna 14416 ba 1800-891-4416-ona ringbo.",
    helplineBtn: "14416 Helpline-ona Ringbo",
    modalBadge: "Standard ZBI-12 Sing∙anirang",
    modalTitle: "Ni∙rokenggipani Neng∙nikani Assessment",
    modalScoreLabel: "Gimik Score:",
    modalSaveBtn: "Plan-ko Save Ka∙e Jakalbo",
    answers: { 0: "Mamingoba ong∙ja", 1: "Ong∙rongja", 2: "Mitrong", 3: "Pangnan gita", 4: "Pangnan" },
  },
  kha: {
    title: "Ka Jingkit Khia bad Ka Jinglah Ban Shah U Nongsumar (ZBI-12)",
    subtitle: "Ka jingjurip clinical Zarit Burden Interview (ZBI-12) na ka bynta ki nongsumar iing.",
    btnScreening: "Shim ia ka ZBI-12 Screening",
    scoreLabel: "Zarit Burden Score",
    ptsLabel: "/ 48 pts",
    copingTitle: "Ka Jingjurip Clinical bad Jingpyneh Jingmut",
    peerSupportBadge: "Ai Jingmut CARES Peer Support",
    psychoEdBadge: "Ka Jinghikai Jingmut Dang Trei",
    interventionsTitle: "Ki Lad ban Pynduna Jingthait:",
    helplineTitle: "Tele-MANAS National Mental Health Helpline (24x7 Free)",
    helplineDesc: "Tylli ha 14416 lane 1800-891-4416 ban ioh jingiarap ha ki 11 tylli ki ktien North East.",
    helplineBtn: "Phone ha 14416 Helpline",
    modalBadge: "Ki Jingkylli ZBI-12 ba la Pynbeit",
    modalTitle: "Jingjurip ia ka Jingkit Khia Nongsumar",
    modalScoreLabel: "Baroh ka Score:",
    modalSaveBtn: "Kynshew bad Pyntrei kam",
    answers: { 0: "Em re em", 1: "Teng khat", 2: "Teng teng", 3: "Khah khah", 4: "Barobor" },
  },
  lus: {
    title: "Enkawltu Hahna leh Tuarchhelna Index (ZBI-12)",
    subtitle: "Chhungkuaa enkawltute tana Zarit Burden Interview (ZBI-12) clinical tehna.",
    btnScreening: "ZBI-12 Screening Ti Rawh",
    scoreLabel: "Zarit Burden Score",
    ptsLabel: "/ 48 pts",
    copingTitle: "Clinical Endikna leh Rilru Hahdamna",
    peerSupportBadge: "CARES Thian Inpuihna Rawt A Ni",
    psychoEdBadge: "Rilru Hriselna Hmalakna A Kal Mek",
    interventionsTitle: "Chau Lutuk Venna Tura Thawh Dan Turte:",
    helplineTitle: "Tele-MANAS National Mental Health Helpline (24x7 Free)",
    helplineDesc: "North East tawng 11-in thurawn la turin 14416 emaw 1800-891-4416 dial rawh.",
    helplineBtn: "14416 Helpline Call Rawh",
    modalBadge: "ZBI-12 Zawhna Bitukte",
    modalTitle: "Enkawltu Hahna Endikna",
    modalScoreLabel: "Hahna Score Zawng Zawng:",
    modalSaveBtn: "Vawng la Enkawl Dan Hmang Rawh",
    answers: { 0: "Awm ngai lo", 1: "Khat tawk chauhvin", 2: "Chang changin", 3: "Fo mai", 4: "A deuh thawin" },
  },
};

export function ZaritBurdenCard({
  patientId,
  patientName = "Patient",
}: ZaritBurdenCardProps) {
  const locale = useLocale();
  const t = ZARIT_I18N[locale] || ZARIT_I18N.en;

  const [answers, setAnswers] = useState<Record<number, number>>(DEFAULT_ANSWERS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_${patientId || "default"}`);
      if (saved) {
        setAnswers(JSON.parse(saved));
      }
    } catch {
      // Use defaults
    }
  }, [patientId]);

  const evaluation: ZBIResult = evaluateZaritBurden(answers);

  const handleSelectAnswer = (qId: number, val: number) => {
    const updated = { ...answers, [qId]: val };
    setAnswers(updated);
    try {
      localStorage.setItem(`${STORAGE_KEY}_${patientId || "default"}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const getScoreColor = (score: number) => {
    if (score <= 10) return "text-emerald-700 bg-emerald-100 border-emerald-300";
    if (score <= 20) return "text-amber-700 bg-amber-100 border-amber-300";
    return "text-rose-700 bg-rose-100 border-rose-300";
  };

  const answerOptions = [0, 1, 2, 3, 4].map((val) => ({
    val,
    label: t.answers[val] || String(val),
  }));

  return (
    <div className="rounded-3xl border-4 border-black bg-surface p-5 sm:p-6 shadow-[6px_6px_0px_#000]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-black/15 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <HeartHandshake className="h-6 w-6 text-rose-600" />
            <h2 className="font-serif text-xl sm:text-2xl font-black text-ink">
              {t.title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-ink-secondary mt-1">
            {t.subtitle}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setActiveStep(0);
            setIsModalOpen(true);
          }}
          className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-white hover:bg-rose-50 px-4 py-2 text-xs sm:text-sm font-black text-ink shadow-[2px_2px_0px_#000] cursor-pointer shrink-0"
        >
          <ClipboardList className="h-4 w-4 text-rose-600" />
          <span>{t.btnScreening}</span>
        </button>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Total Score */}
        <div className="rounded-2xl border-3 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
          <div className="text-[11px] font-black uppercase tracking-wider text-ink-secondary">
            {t.scoreLabel}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-serif text-3xl font-black text-ink">
              {evaluation.totalScore}
            </span>
            <span className="text-xs font-bold text-ink-secondary">{t.ptsLabel}</span>
          </div>
          <div className="mt-2.5">
            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-black border ${getScoreColor(evaluation.totalScore)}`}>
              {evaluation.burdenCategory}
            </span>
          </div>
        </div>

        {/* Clinical Interpretation */}
        <div className="md:col-span-2 rounded-2xl border-3 border-black bg-white p-4 shadow-[3px_3px_0px_#000]">
          <div className="text-[11px] font-black uppercase tracking-wider text-ink-secondary flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-tea" />
            <span>{t.copingTitle}</span>
          </div>
          <p className="mt-1 text-xs sm:text-sm font-semibold text-ink leading-relaxed">
            {evaluation.clinicalInterpretation}
          </p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {evaluation.peerSupportRecommended && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[11px] font-bold">
                <AlertTriangle className="h-3 w-3 text-amber-700" /> {t.peerSupportBadge}
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-md bg-tea-light text-tea-dark border border-tea/30 px-2 py-0.5 text-[11px] font-bold">
              <Sparkles className="h-3 w-3 text-tea" /> {t.psychoEdBadge}
            </span>
          </div>
        </div>
      </div>

      {/* Prescribed Non-Pharmacological Interventions */}
      <div className="rounded-2xl border-2 border-black/20 bg-[#FAF6F0] p-4">
        <div className="text-xs font-black uppercase tracking-wider text-ink mb-2.5 flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-tea" />
          <span>{t.interventionsTitle}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {evaluation.prescribedInterventions.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 rounded-xl bg-white border border-black/15 p-2.5 text-xs font-medium text-ink shadow-xs"
            >
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Peer Support & Tele-MANAS Emergency Net */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-black bg-rose-50/70 p-3.5">
        <div className="flex items-center gap-2.5">
          <PhoneCall className="h-5 w-5 text-rose-600 shrink-0" />
          <div>
            <div className="text-xs font-black text-ink">
              {t.helplineTitle}
            </div>
            <p className="text-[11px] font-medium text-ink-secondary">
              {t.helplineDesc}
            </p>
          </div>
        </div>
        <a
          href="tel:14416"
          className="btn-tactile rounded-xl border-2 border-black bg-rose-600 hover:bg-rose-700 px-3.5 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] cursor-pointer shrink-0"
        >
          {t.helplineBtn}
        </a>
      </div>

      {/* ZBI-12 Assessment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-3 animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-3xl border-4 border-black bg-surface p-5 sm:p-7 shadow-[8px_8px_0px_#000] max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b-2 border-black/15 pb-3 mb-4">
              <div>
                <span className="rounded-full bg-rose-100 text-rose-900 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border border-rose-300">
                  {t.modalBadge}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-black text-ink mt-1">
                  {t.modalTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-tactile rounded-xl border-2 border-black bg-surface hover:bg-surface-muted p-2 text-ink shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {ZBI_12_QUESTIONS.map((q, idx) => {
                const currentVal = answers[q.id] ?? 0;
                return (
                  <div
                    key={q.id}
                    className="rounded-2xl border-2 border-black/20 bg-white p-3.5 shadow-xs"
                  >
                    <div className="flex items-start gap-2 mb-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[11px] font-black text-white">
                        {q.id}
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-ink leading-relaxed">
                        {q.text}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 mt-2">
                      {answerOptions.map((opt) => {
                        const isSelected = currentVal === opt.val;
                        return (
                          <button
                            key={opt.val}
                            type="button"
                            onClick={() => handleSelectAnswer(q.id, opt.val)}
                            className={`rounded-xl border-2 px-2 py-2 text-xs font-black transition-all cursor-pointer text-center ${
                              isSelected
                                ? "border-black bg-rose-600 text-white shadow-[2px_2px_0px_#000]"
                                : "border-black/20 bg-surface hover:bg-rose-50 text-ink"
                            }`}
                          >
                            <span className="block text-[10px] opacity-75">({opt.val})</span>
                            <span>{opt.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="mt-6 flex items-center justify-between border-t-2 border-black/15 pt-4">
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs font-bold text-ink-secondary">{t.modalScoreLabel}</span>
                <span className="font-serif text-2xl font-black text-rose-700">
                  {evaluation.totalScore} / 48
                </span>
                <span className="text-xs font-bold text-ink">({evaluation.burdenCategory})</span>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-tactile rounded-xl border-2 border-black bg-tea px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-800 cursor-pointer"
              >
                {t.modalSaveBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
