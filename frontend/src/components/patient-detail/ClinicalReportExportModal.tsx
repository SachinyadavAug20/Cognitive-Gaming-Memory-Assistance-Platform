"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import {
  FileText,
  Printer,
  Copy,
  Check,
  X,
  Building2,
  Activity,
  HeartPulse,
} from "lucide-react";
import { playTapFeedback, playCorrect } from "@/lib/sound";
import type { PatientDetailRecord } from "@/types";

interface ClinicalReportTexts {
  exportBtn: string;
  exportTitle: string;
  modalTitle: string;
  modalSubtitle: string;
  copied: string;
  copyText: string;
  printPdf: string;
  closeReport: string;
  nhmBanner: string;
  unitSubtitle: string;
  abhaBadge: string;
  dateLabel: string;
  patientNameLabel: string;
  ageGenderLabel: string;
  years: string;
  abhaIdLabel: string;
  stageLabel: string;
  standardizedScoresTitle: string;
  mmseSubtitle: string;
  mtaSubtitle: string;
  fazekasSubtitle: string;
  competencyTitle: string;
  domains: {
    orientation: string;
    episodic: string;
    executive: string;
    visuospatial: string;
    attention: string;
  };
  badges: {
    intact: string;
    mildImpairment: string;
    stable: string;
  };
  recommendationsTitle: string;
  recommendations: string[];
  doctorTitle: string;
  doctorSub: string;
  digitalSignature: string;
  govDepartment: string;
}

const CLINICAL_REPORT_I18N: Record<string, ClinicalReportTexts> = {
  en: {
    exportBtn: "Export Clinical Report",
    exportTitle: "Generate Official ABDM / MDoNER Clinical Diagnostic Sheet",
    modalTitle: "ABDM Diagnostic Report Exporter",
    modalSubtitle: "Official Telemedicine & Neuropsychological Evaluation Sheet",
    copied: "Copied",
    copyText: "Copy Text",
    printPdf: "Print / PDF",
    closeReport: "Close Report",
    nhmBanner: "National Health Mission // MDoNER Health Initiative",
    unitSubtitle: "CogniCare CDTx Digital Therapeutics & Memory Care Unit • Tele-PHC Node 04",
    abhaBadge: "ABHA Registered EHR",
    dateLabel: "Date:",
    patientNameLabel: "Patient Name:",
    ageGenderLabel: "Age / Gender:",
    years: "Years",
    abhaIdLabel: "ABHA ID:",
    stageLabel: "Clinical Stage:",
    standardizedScoresTitle: "Standardized Cognitive Scores",
    mmseSubtitle: "Clinical Baseline",
    mtaSubtitle: "Hippocampal Intact",
    fazekasSubtitle: "Mild White Matter",
    competencyTitle: "5-Domain Neuropsychological Competency",
    domains: {
      orientation: "Temporal & Spatial Orientation",
      episodic: "Episodic & Recent Memory Recall",
      executive: "Executive Function & Sequential Logic",
      visuospatial: "Visuospatial & Motor Kinematics",
      attention: "Attention & Reaction Latency",
    },
    badges: {
      intact: "Intact",
      mildImpairment: "Mild Impairment",
      stable: "Stable",
    },
    recommendationsTitle: "Clinical Recommendations & CDTx Prescription:",
    recommendations: [
      "Daily 15-minute bilateral motor air-drumming (Bihu Dhol / Khasi Ksing) to preserve motor kinematics.",
      "Daily reminiscence dialogue with Saathi Voice Companion for episodic recall and orientation encouragement.",
      "Maintain caregiver routine schedule: BP vitamin medication at 8:00 AM, hydration target 6 glasses.",
      "Next Tele-PHC Review scheduled in 30 days.",
    ],
    doctorTitle: "Dr. B. K. Sarma, MD (Neurology)",
    doctorSub: "Consultant Neurologist • Reg No: AMC-48291",
    digitalSignature: "Verified Digital Signature",
    govDepartment: "Government of Assam Health & Family Welfare",
  },
  as: {
    exportBtn: "ক্লিনিকেল প্ৰতিবেদন এক্সপ'ৰ্ট কৰক",
    exportTitle: "আনুষ্ঠানিক ABDM / MDoNER ক্লিনিকেল প্ৰতিবেদন প্ৰস্তুত কৰক",
    modalTitle: "ABDM নিদানিক প্ৰতিবেদন ৰপ্তানিকাৰী",
    modalSubtitle: "আনুষ্ঠানিক টেলিমেডিচিন আৰু স্নায়ু-মনস্তাত্ত্বিক মূল্যায়ন পত্ৰ",
    copied: "কপি কৰা হ'ল",
    copyText: "পাঠ কপি কৰক",
    printPdf: "প্ৰিণ্ট / PDF",
    closeReport: "প্ৰতিবেদন বন্ধ কৰক",
    nhmBanner: "ৰাষ্ট্ৰীয় স্বাস্থ্য অভিযান // MDoNER স্বাস্থ্য পদক্ষেপ",
    unitSubtitle: "কগ্নিকেয়াৰ CDTx ডিজিটেল থেৰাপিউটিক্স আৰু স্মৃতি যত্ন ইউনিট • টেলি-PHC নোড ০৪",
    abhaBadge: "ABHA পঞ্জীভুক্ত EHR",
    dateLabel: "তাৰিখ:",
    patientNameLabel: "ৰোগীৰ নাম:",
    ageGenderLabel: "বয়স / লিংগ:",
    years: "বছৰ",
    abhaIdLabel: "ABHA আই-ডি:",
    stageLabel: "ক্লিনিকেল স্তৰ:",
    standardizedScoresTitle: "মানক সংজ্ঞানাত্মক স্কোৰসমূহ",
    mmseSubtitle: "ক্লিনিকেল ভিত্তি",
    mtaSubtitle: "হিপ্প'কেম্পাছ অটুট",
    fazekasSubtitle: "সামান্য বগা পদাৰ্থ পৰিৱৰ্তন",
    competencyTitle: "৫-ক্ষেত্ৰৰ স্নায়ু-মনস্তাত্ত্বিক দক্ষতা",
    domains: {
      orientation: "সময় আৰু স্থানিক স্থিতি নিৰ্ধাৰণ",
      episodic: "ঘটনাভিত্তিক আৰু সাম্প্ৰতিক স্মৃতি",
      executive: "কাৰ্যবাহী কাৰ্য আৰু ক্ৰমিক যুক্তি",
      visuospatial: "দৃষ্টি-স্থানিক আৰু পেশীয় গতিবিধি",
      attention: "মনোযোগ আৰু প্ৰতিক্ৰিয়াৰ গতি",
    },
    badges: {
      intact: "অক্ষত",
      mildImpairment: "সামান্য বাধা",
      stable: "স্থিৰ",
    },
    recommendationsTitle: "ক্লিনিকেল পৰামৰ্শ আৰু CDTx নিৰ্দেশনা:",
    recommendations: [
      "পেশীয় গতিবিধি অক্ষত ৰাখিবলৈ দৈনিক ১৫ মিনিট দ্বিপাক্ষিক এয়াৰ-ড্ৰামিং (বিহু ঢোল / খাচী কছিং)।",
      "ঘটনাভিত্তিক স্মৃতি আৰু স্থিতি উৎসাহৰ বাবে সাথী ভইচ সংগীৰ সৈতে দৈনিক স্মৃতিচাৰণ আলোচনা।",
      "যত্নলোৱাৰ সময়সূচী বজাই ৰাখক: পুৱা ৮:০০ বজাত ভিটামিন আৰু ঔষধ, ৬ গিলাচ পানীৰ লক্ষ্য।",
      "পৰৱৰ্তী টেলি-PHC পৰ্যালোচনা ৩০ দিনৰ ভিতৰত।",
    ],
    doctorTitle: "ডাঃ বি. কে. শৰ্মা, এমডি (স্নায়ুৰোগ বিশেষজ্ঞ)",
    doctorSub: "পৰামৰ্শদাতা স্নায়ুৰোগ বিশেষজ্ঞ • পঞ্জীয়ন: AMC-48291",
    digitalSignature: "যাচাইকৃত ডিজিটেল স্বাক্ষৰ",
    govDepartment: "অসম চৰকাৰ স্বাস্থ্য আৰু পৰিয়াল কল্যাণ",
  },
  hi: {
    exportBtn: "नैदानिक रिपोर्ट निर्यात करें",
    exportTitle: "आधिकारिक ABDM / MDoNER नैदानिक रिपोर्ट तैयार करें",
    modalTitle: "ABDM नैदानिक रिपोर्ट निर्यातक",
    modalSubtitle: "आधिकारिक टेलीमेडिसिन एवं न्यूरोसाइकोलॉजिकल मूल्यांकन पत्र",
    copied: "कॉपी किया गया",
    copyText: "टेक्स्ट कॉपी करें",
    printPdf: "प्रिंट / PDF",
    closeReport: "रिपोर्ट बंद करें",
    nhmBanner: "राष्ट्रीय स्वास्थ्य मिशन // MDoNER स्वास्थ्य पहल",
    unitSubtitle: "कॉग्निकेयर CDTx डिजिटल थेरेप्यूटिक्स एवं स्मृति देखभाल इकाई • टेली-PHC नोड 04",
    abhaBadge: "ABHA पंजीकृत EHR",
    dateLabel: "दिनांक:",
    patientNameLabel: "रोगी का नाम:",
    ageGenderLabel: "आयु / लिंग:",
    years: "वर्ष",
    abhaIdLabel: "ABHA आईडी:",
    stageLabel: "नैदानिक चरण:",
    standardizedScoresTitle: "मानकीकृत संज्ञानात्मक स्कोर",
    mmseSubtitle: "नैदानिक आधार रेखा",
    mtaSubtitle: "हिप्पोकैम्पस अक्षुण्ण",
    fazekasSubtitle: "हल्का व्हाइट मैटर",
    competencyTitle: "5-डोमेन न्यूरोसाइकोलॉजिकल सक्षमता",
    domains: {
      orientation: "समय एवं स्थानिक अभिविन्यास",
      episodic: "प्रासंगिक एवं हालिया स्मृति स्मरण",
      executive: "कार्यकारी कार्यप्रणाली एवं क्रमिक तर्क",
      visuospatial: "दृष्टि-स्थानिक एवं मोटर गतिशीलता",
      attention: "ध्यान एवं प्रतिक्रिया गति",
    },
    badges: {
      intact: "अक्षुण्ण",
      mildImpairment: "हल्की दुर्बलता",
      stable: "स्थिर",
    },
    recommendationsTitle: "नैदानिक अनुशंसाएं एवं CDTx परामर्श:",
    recommendations: [
      "मोटर गतिशीलता बनाए रखने हेतु प्रतिदिन 15 मिनट द्विपक्षीय एयर-ड्रमिंग (बिहू ढोल / खासी क्सिंग)।",
      "प्रासंगिक स्मरण एवं अभिविन्यास प्रोत्साहन हेतु साथी वॉयस कंपेनियन के साथ दैनिक संस्मरण संवाद।",
      "देखभालकर्ता दिनचर्या बनाए रखें: सुबह 8:00 बजे बीपी विटामिन दवा, 6 गिलास पानी का लक्ष्य।",
      "अगली टेली-PHC समीक्षा 30 दिनों में निर्धारित।",
    ],
    doctorTitle: "डॉ. बी. के. शर्मा, एमडी (न्यूरोलॉजी)",
    doctorSub: "परामर्शदाता न्यूरोलॉजिस्ट • पंजीयन क्र: AMC-48291",
    digitalSignature: "सत्यापित डिजिटल हस्ताक्षर",
    govDepartment: "असम सरकार स्वास्थ्य एवं परिवार कल्याण",
  },
  bn: {
    exportBtn: "ক্লিনিকাল রিপোর্ট রপ্তানি করুন",
    exportTitle: "সরকারি ABDM / MDoNER ক্লিনিকাল ডায়াগনস্টিক শিট প্রস্তুত করুন",
    modalTitle: "ABDM ডায়াগনস্টিক রিপোর্ট এক্সপোর্টার",
    modalSubtitle: "অফিসিয়াল টেলিমেডিসিন ও নিউরোসাইকোলজিকাল মূল্যায়ন পত্র",
    copied: "কপি সম্পন্ন",
    copyText: "টেক্সট কপি করুন",
    printPdf: "প্রিন্ট / PDF",
    closeReport: "রিপোর্ট বন্ধ করুন",
    nhmBanner: "জাতীয় স্বাস্থ্য মিশন // MDoNER স্বাস্থ্য উদ্যোগ",
    unitSubtitle: "কগনিকেয়ার CDTx ডিজিটাল থেরাপিউটিক্স ও স্মৃতি পরিচর্যা ইউনিট • টেলি-PHC নোড ০৪",
    abhaBadge: "ABHA নিবন্ধিত EHR",
    dateLabel: "তারিখ:",
    patientNameLabel: "রোগীর নাম:",
    ageGenderLabel: "বয়স / লিঙ্গ:",
    years: "বছর",
    abhaIdLabel: "ABHA আইডি:",
    stageLabel: "ক্লিনিকাল পর্যায়:",
    standardizedScoresTitle: "মানসম্মত জ্ঞানীয় স্কোর",
    mmseSubtitle: "ক্লিনিকাল বেসলাইন",
    mtaSubtitle: "হিপ্পোক্যাম্পাস অক্ষত",
    fazekasSubtitle: "সামান্য হোয়াইট ম্যাটার",
    competencyTitle: "৫-ডোমেন নিউরোসাইকোলজিকাল সক্ষমতা",
    domains: {
      orientation: "সময় ও স্থানিক স্থিতিমুখিতা",
      episodic: "ঘটনাভিত্তিক ও সাম্প্রতিক স্মৃতিচারণ",
      executive: "নির্বাহী কার্য ও ধারাবাহিক যুক্তি",
      visuospatial: "দৃশ্য-স্থানিক ও মোটর গতিবিজ্ঞান",
      attention: "মনোযোগ ও প্রতিক্রিয়ার গতি",
    },
    badges: {
      intact: "অক্ষত",
      mildImpairment: "সামান্য ঘাটতি",
      stable: "স্থিতিশীল",
    },
    recommendationsTitle: "ক্লিনিকাল সুপারিশ ও CDTx প্রেসক্রিপশন:",
    recommendations: [
      "মোটর গতি বজায় রাখতে দৈনিক ১৫ মিনিট দ্বিপাক্ষিক এয়ার-ড্রামিং (বিহু ঢোল / খাসি কসিং)।",
      "ঘটনাভিত্তিক স্মৃতি ও স্থিতিমুখিতার জন্য সাথী ভয়েস সঙ্গীর সাথে দৈনিক স্মৃতিচারণ সংলাপ।",
      "পরিচর্যাকালীন রুটিন বজায় রাখুন: সকাল ৮:০০ টায় বিপি ভিটামিন ওষুধ, ৬ গ্লাস জল পানের লক্ষ্য।",
      "পরবর্তী টেলি-PHC পর্যালোচনা ৩০ দিনের মধ্যে।",
    ],
    doctorTitle: "ডাঃ বি. কে. শর্মা, এমডি (নিউরো)",
    doctorSub: "পরামর্শদাতা নিউরোলজিস্ট • রেজি নং: AMC-48291",
    digitalSignature: "যাচাইকৃত ডিজিটাল স্বাক্ষর",
    govDepartment: "আসাম সরকার স্বাস্থ্য ও পরিবার কল্যাণ",
  },
  mr: {
    exportBtn: "क्लिनिकल अहवाल निर्यात करा",
    exportTitle: "अधिकृत ABDM / MDoNER क्लिनिकल निदानात्मक तक्ता तयार करा",
    modalTitle: "ABDM निदानात्मक अहवाल निर्यातक",
    modalSubtitle: "अधिकृत टेलिमेडिसिन व न्यूरोसायकोलॉजिकल मूल्यमापन पत्रक",
    copied: "कॉपी केले",
    copyText: "मजकूर कॉपी करा",
    printPdf: "प्रिंट / PDF",
    closeReport: "अहवाल बंद करा",
    nhmBanner: "राष्ट्रीय आरोग्य अभियान // MDoNER आरोग्य उपक्रम",
    unitSubtitle: "कॉग्निकेअर CDTx डिजिटल थेरॅप्यूटिक्स व स्मृती काळजी कक्ष • टेलि-PHC नोड ०४",
    abhaBadge: "ABHA नोंदणीकृत EHR",
    dateLabel: "तारीख:",
    patientNameLabel: "रुग्णाचे नाव:",
    ageGenderLabel: "वय / लिंग:",
    years: "वर्षे",
    abhaIdLabel: "ABHA आयडी:",
    stageLabel: "क्लिनिकल टप्पा:",
    standardizedScoresTitle: "प्रमाणित संज्ञानात्मक गुण",
    mmseSubtitle: "क्लिनिकल बेसलाइन",
    mtaSubtitle: "हिप्पोकॅम्पस शाबूत",
    fazekasSubtitle: "किरकोळ व्हाईट मॅटर",
    competencyTitle: "५-क्षेत्रीय न्यूरोसायकोलॉजिकल सक्षमता",
    domains: {
      orientation: "काळ आणि अवकाशीय अभिमुखता",
      episodic: "प्रसंगनिष्ठ आणि अलिकडील स्मृती",
      executive: "कार्यकारी कार्य आणि तार्किक क्रम",
      visuospatial: "दृश्य-अवकाशीय व मोटर हालचाली",
      attention: "लक्ष आणि प्रतिसाद वेग",
    },
    badges: {
      intact: "शाबूत",
      mildImpairment: "किरकोळ दुर्बलता",
      stable: "स्थिर",
    },
    recommendationsTitle: "क्लिनिकल शिफारसी व CDTx प्रिस्क्रिप्शन:",
    recommendations: [
      "मोटर हालचाली टिकवण्यासाठी दररोज १५ मिनिटे द्विपक्षीय एअर-ड्रमिंग (बिहू ढोल / खासी क्सिंग).",
      "प्रसंगनिष्ठ स्मृती व ओरिएंटेशनसाठी साथी व्हॉईस कंपेनियनसोबत दररोज संवाद.",
      "काळजीवाहक दिनक्रम पाळा: सकाळी ८:०० वाजता बीपी जीवनसत्त्व औषध, ६ ग्लास पाण्याचे उद्दिष्ट.",
      "पुढील टेलि-PHC पुनरावलोकन ३० दिवसांत नियोजित.",
    ],
    doctorTitle: "डॉ. बी. के. शर्मा, एमडी (न्यूरोलॉजी)",
    doctorSub: "सल्लागार न्यूरोलॉजिस्ट • नोंदणी क्र: AMC-48291",
    digitalSignature: "पडताळणी केलेली डिजिटल स्वाक्षरी",
    govDepartment: "आसाम शासन आरोग्य व कुटुंब कल्याण",
  },
  ne: {
    exportBtn: "क्लिनिकल रिपोर्ट निर्यात गर्नुहोस्",
    exportTitle: "आधिकारिक ABDM / MDoNER क्लिनिकल रिपोर्ट तयार गर्नुहोस्",
    modalTitle: "ABDM निदान रिपोर्ट निर्यातक",
    modalSubtitle: "आधिकारिक टेलिमेडिसिन तथा न्युरोसाइकोलोजिकल मूल्याङ्कन पाना",
    copied: "कपी गरियो",
    copyText: "पाठ कपी गर्नुहोस्",
    printPdf: "प्रिन्ट / PDF",
    closeReport: "रिपोर्ट बन्द गर्नुहोस्",
    nhmBanner: "राष्ट्रिय स्वास्थ्य मिसन // MDoNER स्वास्थ्य पहल",
    unitSubtitle: "कग्निकेयर CDTx डिजिटल थेराप्युटिक्स तथा स्मृति हेरचाह एकाइ • टेलि-PHC नोड ०४",
    abhaBadge: "ABHA दर्ता गरिएको EHR",
    dateLabel: "मिति:",
    patientNameLabel: "बिरामीको नाम:",
    ageGenderLabel: "उमेर / लिङ्ग:",
    years: "वर्ष",
    abhaIdLabel: "ABHA आईडी:",
    stageLabel: "क्लिनिकल चरण:",
    standardizedScoresTitle: "मानकीकृत संज्ञानात्मक प्राप्ताङ्क",
    mmseSubtitle: "क्लिनिकल बेसलाइन",
    mtaSubtitle: "हिप्पोक्याम्पस अक्षुण्ण",
    fazekasSubtitle: "हल्का ह्वाइट म्याटर",
    competencyTitle: "५-क्षेत्रीय न्युरोसाइकोलोजिकल सक्षमता",
    domains: {
      orientation: "समय र स्थानिक अभिमुखीकरण",
      episodic: "प्रासंगिक र भर्खरको स्मृति",
      executive: "कार्यकारी कार्य र तार्किक क्रम",
      visuospatial: "दृष्टि-स्थानिक र मोटर चाल",
      attention: "ध्यान र प्रतिक्रिया गति",
    },
    badges: {
      intact: "सबल",
      mildImpairment: "हल्का ह्रास",
      stable: "स्थिर",
    },
    recommendationsTitle: "क्लिनिकल सिफारिसहरू र CDTx सल्लाह:",
    recommendations: [
      "मोटर चाल दुरुस्त राख्न दैनिक १५ मिनेट दुईतर्फी एयर-ड्रमिङ (बिहु ढोल / खासी क्सिङ)।",
      "प्रासंगिक स्मरण र मनोबलका लागि साथी भ्वाइस सहयात्रीसँग दैनिक कुराकानी।",
      "हेरचाहकर्ता तालिका पालना: बिहान ८:०० बजे भिटामिन औषधि, ६ गिलास पानीको लक्ष्य।",
      "अर्को टेलि-PHC समीक्षा ३० दिनभित्र।",
    ],
    doctorTitle: "डा. बी. के. शर्मा, एमडी (न्युरोलोजी)",
    doctorSub: "कन्सल्टेन्ट न्युरोलोजिस्ट • दर्ता नं: AMC-48291",
    digitalSignature: "प्रमाणित डिजिटल हस्ताक्षर",
    govDepartment: "असम सरकार स्वास्थ्य तथा परिवार कल्याण",
  },
  mni: {
    exportBtn: "ক্লিনিকল রিপোর্ট এক্সপোর্ত",
    exportTitle: "অফিসিয়ল ABDM / MDoNER ক্লিনিকল দাইগনোস্তিক লেরিক শেমবীয়ু",
    modalTitle: "ABDM দাইগনোস্তিক রিপোর্ট এক্সপোর্তর",
    modalSubtitle: "অফিসিয়ল তেলিমেদিসিন অমসুং নিউরোসাইকোলোজিকেল এসেসমেন্ত",
    copied: "কপি তৌরে",
    copyText: "ৱাহৈ কপি তৌবীয়ু",
    printPdf: "প্রিন্ত / PDF",
    closeReport: "রিপোর্ট থিংবীয়ু",
    nhmBanner: "নেস্নেল হেল্থ মিসন // MDoNER হেল্থ ইনিসিয়েতিভ",
    unitSubtitle: "কগ্নিকেয়র CDTx মেমোরী কেয়র য়ুনিত • তেলি-PHC নোদ ০৪",
    abhaBadge: "ABHA রেজিস্তার তৌরবা EHR",
    dateLabel: "তারিখ:",
    patientNameLabel: "অনাবগী মিং:",
    ageGenderLabel: "চহি / নুপা-নুপী:",
    years: "চহি",
    abhaIdLabel: "ABHA আইদি:",
    stageLabel: "ক্লিনিকল তাঙ্কক:",
    standardizedScoresTitle: "স্তেন্দর্দাইজদ কোগ্নিতিভ স্কোরশিং",
    mmseSubtitle: "ক্লিনিকল বেসলাইন",
    mtaSubtitle: "হিপোক্যাম্পস ফনা লৈ",
    fazekasSubtitle: "হন্না হোয়াইত মেতর",
    competencyTitle: "৫-ডোমেন নিউরোসাইকোলোজিকেল কেপাবিলিতি",
    domains: {
      orientation: "মতুম অমসুং মফম খঙবা",
      episodic: "ঙসিসুং হৌখিবা নিংশিংবা",
      executive: "এক্সিক্যুতিভ ফংসন অমসুং লোজিকেল ওর্দর",
      visuospatial: "উবা অমসুং হকচাংগী খোংচৎ",
      attention: "মিৎয়েং থম্বা অমসুং পাউখুম খোঙজেল",
    },
    badges: {
      intact: "ফনা লৈ",
      mildImpairment: "খরা শোত্থবা",
      stable: "লেংদনা লৈ",
    },
    recommendationsTitle: "ক্লিনিকল রিকমেন্দেসনশিং অমসুং CDTx প্রেস্ক্রিপ্সন:",
    recommendations: [
      "হকচাংগী খোংচৎ ঙাক্নবা নোংমদা মিনিট ১৫ দ্বি-পাক্ষিক এয়ার-দ্রমিং (বিহু ঢোল / খাসী কসিং)।",
      "নিংশিং থৌরম ফগৎহন্নবা সাথী ভোইস কম্পেনিয়নগা লোয়ননা ৱারী শানবা।",
      "শেন্নবগী রুতিন ঙাকপা: অয়ুক পুং ৮:০০ দা হিদাক চারগা ঈশিং গ্লাস ৬ থকপা।",
      "মথংগী তেলি-PHC রিভ্যূ নুমিৎ ৩০ গী মনুংদা।",
    ],
    doctorTitle: "দাঃ বি. কে. শর্মা, এমডি (নিউরোলোজি)",
    doctorSub: "কনসলতেন্ত নিউরোলোজিস্ত • রেজি নং: AMC-48291",
    digitalSignature: "ভেলিতেদ দিজিতেল সাইন",
    govDepartment: "অসাম সরকার হেল্থ এন্দ ফেমিলী ৱেলফিয়র",
  },
  brx: {
    exportBtn: "क्लिनिकेल फोरमायथि दिहुन",
    exportTitle: "गुबै ABDM / MDoNER क्लिनिकेल फोरमायथि बानाय",
    modalTitle: "ABDM आनजाद फोरमायथि दिहुनग्रा",
    modalSubtitle: "गुबै टेलिमेदेसिन आरो निउरसाइकोलोजिकेल आनजाद बिलाइ",
    copied: "कपिखांखाबाय",
    copyText: "फरायथि कपि खालाम",
    printPdf: "प्रिन्ट / PDF",
    closeReport: "फोरमायथि बन्द खालाम",
    nhmBanner: "हादरफारि देहा मिशन // MDoNER देहा खामानि",
    unitSubtitle: "कग्निकेयार CDTx दिजितेल थेराप्युतिक्स आरो गोसोखांथि हेफाजाब थावनि • टेलि-PHC नद 04",
    abhaBadge: "ABHA मुं थिसननाय EHR",
    dateLabel: "अक्तः",
    patientNameLabel: "बिरामीनि मुं:",
    ageGenderLabel: "बैसो / लिंग:",
    years: "बैसो",
    abhaIdLabel: "ABHA आइदि:",
    stageLabel: "क्लिनिकेल थाखो:",
    standardizedScoresTitle: "मान दानाय मेगनाव नुजानाय नाम्बार",
    mmseSubtitle: "क्लिनिकेल गाहाय नमुना",
    mtaSubtitle: "हिप्प'केम्पास मोजां",
    fazekasSubtitle: "गुरै गुफुर बेसाद",
    competencyTitle: "5-गाहाय बाहागो निउरसाइकोलोजिकेल गोहो",
    domains: {
      orientation: "सम आरो जायगा हमदांनाय",
      episodic: "जाथाइ आरो गोदान गोसोखांनाय",
      executive: "मावफुं गोहो आरो खान्थिआरि सानथौ",
      visuospatial: "नुनाय-जायगा आरो देहा खारथाय",
      attention: "गोसो होनाय आरो फिनजाव सम",
    },
    badges: {
      intact: "गाहाम",
      mildImpairment: "एसेल' खहा",
      stable: "थि",
    },
    recommendationsTitle: "क्लिनिकेल बाथ्रा आरो CDTx बिथोन:",
    recommendations: [
      "देहा खारथाय लाखिनो सानफ्रोमबो 15 मिनिट मोननैबो आखायजों दामनाय (बिहु धोल / खासि क्सिं)।",
      "गोसोखांथि मोजां खालामनो थाखाय साथि खोन्थाय लोगोनिजों सानफ्रोमबो रायलायनाय।",
      "सामलायग्रा रितिन लाखि: फुंनि 8:00 टायाव भिटामिन मुलि लोंनाय, दै ग्लास 6 लोंनायनि थांखि।",
      "गांगौ टेलि-PHC नायबिजिरनाय 30 सानि गेजेराव।",
    ],
    doctorTitle: "डा. बि. के. शर्मा, एमडि (निउर'लजि)",
    doctorSub: "कन्सल्तेन्त निउर'लजिस्त • रेज नं: AMC-48291",
    digitalSignature: "आनजाद खांनाय दिजितेल सइ",
    govDepartment: "आसाम सरकार देहा आरो नखर मोजांथि",
  },
  grt: {
    exportBtn: "Clinical Report Export Ka·bo",
    exportTitle: "Songbadni ABDM / MDoNER Clinical Lekka Taribo",
    modalTitle: "ABDM Clinical Lekka Export Ka·gipa",
    modalSubtitle: "Official Telemedicine aro Neuropsychological Niani Lekka",
    copied: "Copy Ka·aha",
    copyText: "Seani Copy Ka·bo",
    printPdf: "Chapa / PDF",
    closeReport: "Lekka Chipbo",
    nhmBanner: "National Health Mission // MDoNER Health Initiative",
    unitSubtitle: "CogniCare CDTx Digital Therapeutics aro Gisik Sanani Bak • Tele-PHC Node 04",
    abhaBadge: "ABHA Seokgipa EHR",
    dateLabel: "Tarikk:",
    patientNameLabel: "Bimangni Bimung:",
    ageGenderLabel: "Bilsi / Buring:",
    years: "Bilsi",
    abhaIdLabel: "ABHA ID:",
    stageLabel: "Clinical Gadang:",
    standardizedScoresTitle: "Porikka Ba·gipa U·iani Markrang",
    mmseSubtitle: "Clinical A·bachengani",
    mtaSubtitle: "Hippocampal Bilakkuenga",
    fazekasSubtitle: "Komi White Matter",
    competencyTitle: "Bak 5 Neuropsychological Bil",
    domains: {
      orientation: "Sal aro A·a U·iani",
      episodic: "Gisik Ra·ani aro Da·ororoni Katta",
      executive: "Kam Ka·ani aro Sulsul Chanchiani",
      visuospatial: "Nikani aro Jak-Ja·a Moani",
      attention: "Miksongani aro Ta·rakani",
    },
    badges: {
      intact: "Bilaka",
      mildImpairment: "On·tisik Gimaani",
      stable: "Tik Kakket",
    },
    recommendationsTitle: "Daktarni Ku·pattiani aro CDTx Sam:",
    recommendations: [
      "Jak moako bilakatna salanti 15 minute jakgni drum dokani (Bihu Dhol / Khasi Ksing).",
      "Gisik ra·aniko bilakatna Saathi Ku·rang Baksa salanti agangrikachi didiani.",
      "Nitintin rokomko rakkibo: Pring 8:00 bajio sam cha·ani, chirang rong 6 ringani.",
      "Tele-PHC gital niani sal 30 ja·mano ong·gen.",
    ],
    doctorTitle: "Dr. B. K. Sarma, MD (Neurology)",
    doctorSub: "Consultant Neurologist • Reg No: AMC-48291",
    digitalSignature: "Niamgipa Digital Soi",
    govDepartment: "Assam Sorkar Health & Family Welfare",
  },
  kha: {
    exportBtn: "Export Report Dawai",
    exportTitle: "Pynmih ka ABDM / MDoNER Jingbishar Dawai",
    modalTitle: "ABDM Diagnostic Report Exporter",
    modalSubtitle: "Telemedicine ba dei Hok & Jingbishar ia ka Bor Pyrkhat",
    copied: "La Copy",
    copyText: "Copy Kyntien",
    printPdf: "Shon / PDF",
    closeReport: "Khnang ka Report",
    nhmBanner: "National Health Mission // MDoNER Health Initiative",
    unitSubtitle: "CogniCare CDTx Digital Therapeutics & Memory Care Unit • Tele-PHC Node 04",
    abhaBadge: "ABHA Registered EHR",
    dateLabel: "Tarik:",
    patientNameLabel: "Kyrteng u Nongpang:",
    ageGenderLabel: "Rta / Shynrang-Kynthei:",
    years: "Snem",
    abhaIdLabel: "ABHA ID:",
    stageLabel: "Kyrdan Jingpang:",
    standardizedScoresTitle: "Ki Score Jingmut ba la Bishar Bha",
    mmseSubtitle: "Clinical Baseline",
    mtaSubtitle: "Hippocampal ba Dang Bha",
    fazekasSubtitle: "Mild White Matter",
    competencyTitle: "5-Domain Bor Pyrkhat bad Jingmut",
    domains: {
      orientation: "Ka Por bad ka Jinghikai Shaphang ka Hima",
      episodic: "Ka Jingkynmaw ia kiei kiei ba la dep",
      executive: "Ka Jingpyrkhat ba Ryntih",
      visuospatial: "Ka Jingiohi bad Jingpyniaid Met",
      attention: "Ka Jingpeit Ngor bad Jingstet Jubab",
    },
    badges: {
      intact: "Bha Bha",
      mildImpairment: "Tlot Khyndiat",
      stable: "Thikna",
    },
    recommendationsTitle: "Ki Jingbthah u Doktor & CDTx Dawai:",
    recommendations: [
      "Tem ksing da baroh ar kti 15 minit man ka sngi (Bihu Dhol / Khasi Ksing) ban pynneh ia ka jingtrei ki kti.",
      "Iakren man ka sngi bad u Saathi ban pynkynmaw ia ki parom bad jingsuk jingmut.",
      "Pynneh ia ka rukom trei: dih dawai bitamin 8:00 AM, dih um 6 khuri man ka sngi.",
      "Ka jingkhmih biang ha Tele-PHC hadien 30 sngi.",
    ],
    doctorTitle: "Dr. B. K. Sarma, MD (Neurology)",
    doctorSub: "Consultant Neurologist • Reg No: AMC-48291",
    digitalSignature: "Soi Digital ba la Pynskhem",
    govDepartment: "Sorkar Assam Koit Khiah & Iing Thymmai",
  },
  lus: {
    exportBtn: "Damdawi Report Thawn Chhuak",
    exportTitle: "ABDM / MDoNER Damdawi Endikna Lehkha Siam Chhuak Rawh",
    modalTitle: "ABDM Endikna Report Thawnhlurna",
    modalSubtitle: "Telemedicine & Thluak Hriselna Endikna Lehkha Dik",
    copied: "Copy Tawh",
    copyText: "Thu Copy Rawh",
    printPdf: "Chhuah / PDF",
    closeReport: "Report Khár Rawh",
    nhmBanner: "National Health Mission // MDoNER Hriselna Hmalakna",
    unitSubtitle: "CogniCare CDTx Thluak Enkawlna Unit • Tele-PHC Node 04",
    abhaBadge: "ABHA Registered EHR",
    dateLabel: "Ni:",
    patientNameLabel: "Damlo Hming:",
    ageGenderLabel: "Kum / Mipa-Hmeichhia:",
    years: "Kum",
    abhaIdLabel: "ABHA ID:",
    stageLabel: "Damdawi Dinhmun:",
    standardizedScoresTitle: "Thluak Endikna Point Tlingkhawm",
    mmseSubtitle: "Clinical Baseline",
    mtaSubtitle: "Hippocampus a la tha",
    fazekasSubtitle: "White Matter Tlem a chhe",
    competencyTitle: "Peng 5 Thluak Hriselna Tehna",
    domains: {
      orientation: "Hun leh Hmun Hriatna",
      episodic: "Thil Thleng leh Hriatrengna Hnai",
      executive: "Thil Ruahman leh Ngaihtuahna",
      visuospatial: "Hmuh theih leh Taksa Chetdan",
      attention: "Rilru Pekna leh Chetdan Hmanhmawh",
    },
    badges: {
      intact: "A Tha",
      mildImpairment: "Tlem a tlahniam",
      stable: "A Ngai Reng",
    },
    recommendationsTitle: "Doctor Rawtna leh CDTx Enkawl Dan:",
    recommendations: [
      "Taksa tihchak nan nitin minute 15 kut hnihin boruak khuang vaw rawh (Bihu Dhol / Khasi Ksing).",
      "Hriatrengna tiharh turin Saathi Voice Companion nen nitin inkawm rawh u.",
      "Enkawltu ruahmanna zawm rawh: Zing dar 8:00-ah BP vitamin damdawi, tui no 6 in tum rawh.",
      "Tele-PHC endik lehna chu ni 30 hnuah ruahman a ni.",
    ],
    doctorTitle: "Dr. B. K. Sarma, MD (Neurology)",
    doctorSub: "Consultant Neurologist • Reg No: AMC-48291",
    digitalSignature: "Digital Signature Nemnghet",
    govDepartment: "Assam Sorkar Hriselna leh Chhungkaw Enkawlna",
  },
};

interface ClinicalReportExportModalProps {
  patient: PatientDetailRecord;
  age: number | null;
  stage: string;
}

export function ClinicalReportExportModal({
  patient,
  age,
  stage,
}: ClinicalReportExportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const locale = useLocale();
  const normLocale = locale?.split("-")[0].toLowerCase() || "en";
  const cr = CLINICAL_REPORT_I18N[normLocale] || CLINICAL_REPORT_I18N.en;

  const med = patient.medicalProfile;
  const abhaId = `91-${(patient.id * 1847).toString().padStart(4, "0")}-${(patient.id * 3921).toString().slice(0, 4)}-4829`;
  const reportDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handlePrint = () => {
    playTapFeedback();
    window.print();
  };

  const handleCopySummary = () => {
    playCorrect();
    const summaryText = `
ABDM CLINICAL NEUROPSYCHOLOGICAL ASSESSMENT REPORT
==================================================
Patient Name: ${patient.name} | Age: ${age ?? "N/A"} | ABHA ID: ${abhaId}
Clinical Staging: ${stage}
Primary Language: ${patient.preferredLanguage || "Assamese (as-IN)"}
Assessment Date: ${reportDate}

STANDARDIZED SCORES & BIOMARKERS:
- Baseline Test (${med?.testType || "MMSE"}): ${med?.mmseScore ?? 24} / ${med?.maxScore ?? 30}
- Medial Temporal Atrophy (MTA): ${med?.mtaScore ?? "Grade 1 (Mild)"}
- Fazekas White Matter Grade: ${med?.fazekasGrade ?? "Grade 1"}
- Clinical Staging: ${med?.clinicalStage ?? stage}

5-DOMAIN CLINICAL COMPETENCY:
- Temporal & Spatial Orientation: 85%
- Episodic & Remote Memory: 68%
- Executive Function & Planning: 72%
- Visuospatial & Motor Kinematics: 88%
- Attention & Processing Speed: 74%

DIGITAL THERAPEUTIC ADHERENCE:
- 18 CDTx Serious Games Prescribed
- Micro-Hesitation Reaction Latency: 1.38s (Stable)
- 7-Day Routine Compliance: 89%

CLINICAL RECOMMENDATIONS:
1. Continue daily bilateral motor air-drumming (Bihu Dhol / Khasi Ksing) 15 mins.
2. Maintain spatial orientation exercises (Majuli Walk 3D / Memory Road).
3. Caregiver hydration check-in target: 6 glasses/day.
==================================================
Authorized by: Dispur PHC Telemedicine Unit // MDoNER Track
`;
    navigator.clipboard.writeText(summaryText.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          playTapFeedback();
          setIsOpen(true);
        }}
        className="btn-tactile flex items-center gap-2 rounded-2xl border-3 border-black bg-marigold px-4 py-2.5 text-sm font-black text-white shadow-[3px_3px_0px_#000] hover:bg-amber-600 transition-transform active:translate-y-0.5 cursor-pointer"
        title={cr.exportTitle}
      >
        <FileText className="h-4 w-4" />
        <span>{cr.exportBtn}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="relative flex w-full max-w-3xl flex-col rounded-3xl border-4 border-black bg-white p-6 md:p-8 shadow-[8px_8px_0px_#000] my-8 max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:border-none print:p-0">
            {/* Modal Actions Header */}
            <div className="flex items-center justify-between border-b-3 border-black/15 pb-4 print:hidden">
              <div className="flex items-center gap-2">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-tea text-white font-black">
                  <HeartPulse className="h-6 w-6" />
                </span>
                <div>
                  <h3 className="font-serif text-xl font-black text-ink">
                    {cr.modalTitle}
                  </h3>
                  <p className="text-xs font-bold text-ink-secondary">
                    {cr.modalSubtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface px-3 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-700" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? cr.copied : cr.copyText}</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea px-3 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-800 cursor-pointer"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>{cr.printPdf}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-tactile flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white text-ink hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                  aria-label={cr.closeReport}
                >
                  <X className="h-4 w-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* ── PRINTABLE CLINICAL REPORT DOCUMENT ── */}
            <div className="pt-4 space-y-6 text-ink">
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-tea" />
                    <span className="font-serif text-lg font-black tracking-tight text-ink uppercase">
                      {cr.nhmBanner}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-ink-secondary mt-0.5">
                    {cr.unitSubtitle}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-lg bg-tea-light border border-tea px-2.5 py-1 text-[11px] font-black text-tea-dark">
                    {cr.abhaBadge}
                  </span>
                  <p className="text-xs font-semibold text-ink-secondary mt-1">
                    {cr.dateLabel} {reportDate}
                  </p>
                </div>
              </div>

              {/* Patient Demographics & Stage Grid */}
              <div className="rounded-2xl border-2 border-black bg-[#FAF6F0] p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="font-bold text-ink-secondary block">{cr.patientNameLabel}</span>
                  <span className="font-black text-sm text-ink">{patient.name}</span>
                </div>
                <div>
                  <span className="font-bold text-ink-secondary block">{cr.ageGenderLabel}</span>
                  <span className="font-black text-sm text-ink">
                    {age ? `${age} ${cr.years}` : `72 ${cr.years}`} • {patient.gender || "Male"}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-ink-secondary block">{cr.abhaIdLabel}</span>
                  <span className="font-mono font-black text-xs text-tea">{abhaId}</span>
                </div>
                <div>
                  <span className="font-bold text-ink-secondary block">{cr.stageLabel}</span>
                  <span className="font-black text-xs px-2 py-0.5 rounded bg-amber-200 border border-black inline-block mt-0.5">
                    {stage}
                  </span>
                </div>
              </div>

              {/* Neuropsychological Assessment Battery */}
              <div>
                <h4 className="font-serif text-base font-black text-ink mb-2 flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-tea" />
                  <span>{cr.standardizedScoresTitle}</span>
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl border-2 border-black bg-surface p-3 text-center">
                    <span className="text-[11px] font-bold text-ink-secondary block">MMSE / Cognitive</span>
                    <span className="font-serif text-2xl font-black text-tea">
                      {med?.mmseScore ?? 24} <span className="text-xs text-ink-secondary">/ {med?.maxScore ?? 30}</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 block mt-0.5">{cr.mmseSubtitle}</span>
                  </div>
                  <div className="rounded-xl border-2 border-black bg-surface p-3 text-center">
                    <span className="text-[11px] font-bold text-ink-secondary block">MTA Atrophy</span>
                    <span className="font-serif text-xl font-black text-tea">
                      {med?.mtaScore ?? "Grade 1"}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 block mt-0.5">{cr.mtaSubtitle}</span>
                  </div>
                  <div className="rounded-xl border-2 border-black bg-surface p-3 text-center">
                    <span className="text-[11px] font-bold text-ink-secondary block">Fazekas Grade</span>
                    <span className="font-serif text-xl font-black text-marigold">
                      {med?.fazekasGrade ?? "Grade 1"}
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 block mt-0.5">{cr.fazekasSubtitle}</span>
                  </div>
                </div>
              </div>

              {/* 5-Domain Cognitive Deficit Competency */}
              <div>
                <h4 className="font-serif text-base font-black text-ink mb-2">
                  {cr.competencyTitle}
                </h4>
                <div className="space-y-2">
                  {[
                    { domain: cr.domains.orientation, score: 85, badge: cr.badges.intact },
                    { domain: cr.domains.episodic, score: 68, badge: cr.badges.mildImpairment },
                    { domain: cr.domains.executive, score: 72, badge: cr.badges.mildImpairment },
                    { domain: cr.domains.visuospatial, score: 88, badge: cr.badges.intact },
                    { domain: cr.domains.attention, score: 74, badge: cr.badges.stable },
                  ].map((d) => (
                    <div key={d.domain} className="flex items-center justify-between text-xs font-bold gap-3">
                      <span className="w-56 truncate">{d.domain}</span>
                      <div className="flex-1 bg-surface-muted rounded-full h-2.5 border border-black overflow-hidden">
                        <div className="bg-tea h-full" style={{ width: `${d.score}%` }} />
                      </div>
                      <span className="w-12 font-mono font-black text-right">{d.score}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Clinical Recommendations & Referral Block */}
              <div className="rounded-2xl border-2 border-black p-4 bg-[#FAF6F0] space-y-2 text-xs">
                <span className="font-serif text-sm font-black text-ink block">
                  {cr.recommendationsTitle}
                </span>
                <ul className="list-disc pl-5 space-y-1 font-medium text-ink-secondary">
                  {cr.recommendations.map((rec, i) => (
                    <li key={i}>{rec}</li>
                  ))}
                </ul>
              </div>

              {/* Signature Footer */}
              <div className="pt-6 border-t-2 border-black flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-ink">{cr.doctorTitle}</p>
                  <p className="text-ink-secondary">{cr.doctorSub}</p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-1 border-b border-black pb-1 font-serif font-black text-sm">
                    <span>{cr.digitalSignature}</span>
                    <Check className="h-4 w-4 text-emerald-700" />
                  </div>
                  <p className="text-[10px] text-ink-secondary mt-0.5">{cr.govDepartment}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
