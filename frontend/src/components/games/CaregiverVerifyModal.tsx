"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Save,
  Sparkles,
  Stethoscope,
  HeartHandshake,
  Award,
} from "lucide-react";
import {
  useGameVerificationStore,
  type GameVerification,
} from "@/store/useGameVerificationStore";
import { ensureAudioContext } from "@/lib/sound";

interface CaregiverVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameTitle?: string;
  gameDomain?: string;
}

const COMMON_SAFETY_ASSURANCES = [
  "Zero Blue-Light Exhaustion",
  "Fall-Safe Seated Kinematics",
  "Low Cognitive Stress Timers",
  "Culturally Congruent Grounding",
  "Paced Multi-Sensory Prompts",
  "Tremor-Compensated Gestures",
];

interface VerifyModalTexts {
  subHeader: string;
  certifyTitle: (title: string) => string;
  domainLabel: (domain: string) => string;
  endorserNameLabel: string;
  endorserNamePlaceholder: string;
  endorserRoleLabel: string;
  roles: {
    caregiver: string;
    clinician: string;
    occupational_therapist: string;
    asha_worker: string;
  };
  recommendedStagingLabel: string;
  stagingPlaceholder: string;
  clinicalRationaleLabel: string;
  rationalePlaceholder: string;
  safetyAssurancesLabel: string;
  safetyAssurances: Record<string, string>;
  revokeBtn: string;
  cancelBtn: string;
  updateBtn: string;
  applyStampBtn: string;
  closeAria: string;
}

const VERIFY_MODAL_I18N: Record<string, VerifyModalTexts> = {
  en: {
    subHeader: "Caregiver & Clinician Endorsement",
    certifyTitle: (title) => `Certify: ${title}`,
    domainLabel: (domain) => `Domain: ${domain}`,
    endorserNameLabel: "Endorser Name & Credentials",
    endorserNamePlaceholder: "e.g. Dr. B. K. Sarma or Sunita Borah",
    endorserRoleLabel: "Endorser Role",
    roles: {
      caregiver: "Caregiver",
      clinician: "Clinician / Doctor",
      occupational_therapist: "Occupational Therapist",
      asha_worker: "ASHA Worker",
    },
    recommendedStagingLabel: "Recommended Staging",
    stagingPlaceholder: "e.g. Mild Cognitive Impairment (CDR 0.5)",
    clinicalRationaleLabel: "Clinical Rationale & Observations",
    rationalePlaceholder: "Explain why this serious game benefits this patient...",
    safetyAssurancesLabel: "Verified Safety Assurances",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "Zero Blue-Light Exhaustion",
      "Fall-Safe Seated Kinematics": "Fall-Safe Seated Kinematics",
      "Low Cognitive Stress Timers": "Low Cognitive Stress Timers",
      "Culturally Congruent Grounding": "Culturally Congruent Grounding",
      "Paced Multi-Sensory Prompts": "Paced Multi-Sensory Prompts",
      "Tremor-Compensated Gestures": "Tremor-Compensated Gestures",
    },
    revokeBtn: "Revoke",
    cancelBtn: "Cancel",
    updateBtn: "Update Certification",
    applyStampBtn: "Apply Expert Stamp",
    closeAria: "Close modal",
  },
  as: {
    subHeader: "যত্নকৰ্তা আৰু চিকিৎসকৰ অনুমোদন",
    certifyTitle: (title) => `প্ৰমাণিত কৰক: ${title}`,
    domainLabel: (domain) => `ক্ষেত্ৰ: ${domain}`,
    endorserNameLabel: "অনুমোদনকাৰীৰ নাম আৰু পৰিচয়",
    endorserNamePlaceholder: "যেনে- ডাঃ বি. কে. শৰ্মা বা সুনীতা বৰা",
    endorserRoleLabel: "অনুমোদনকাৰীৰ ভূমিকা",
    roles: {
      caregiver: "যত্নকৰ্তা",
      clinician: "চিকিৎসক / ডাক্তৰ",
      occupational_therapist: "অকুপেচনেল থেৰাপিষ্ট",
      asha_worker: "আশা কৰ্মী",
    },
    recommendedStagingLabel: "পৰামৰ্শিত স্তৰ (Staging)",
    stagingPlaceholder: "যেনে- মৃদু সংজ্ঞানাত্মক দুৰ্বলতা (CDR ০.৫)",
    clinicalRationaleLabel: "চিকিৎসাগত কাৰণ আৰু পৰ্যবেক্ষণ",
    rationalePlaceholder: "এই থেরাপিউটিক খেলখনে ৰোগীজনক কেনেদৰে সহায় কৰে ব্যাখ্যা কৰক...",
    safetyAssurancesLabel: "যাচাইকৃত সুৰক্ষা নিশ্চয়তা",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "নীলা পোহৰজনিত ভাগৰহীন",
      "Fall-Safe Seated Kinematics": "পৰি যোৱাৰ পৰা সুৰক্ষিত বহি খেলা গতিবিধি",
      "Low Cognitive Stress Timers": "কম সংজ্ঞানাত্মক মানসিক চাপৰ টাইমাৰ",
      "Culturally Congruent Grounding": "সাংস্কৃতিকভাৱে সামঞ্জস্যপূৰ্ণ স্থায়িত্ব",
      "Paced Multi-Sensory Prompts": "নিয়ন্ত্ৰিত বহু-ইন্দ্ৰিয় উদ্দীপক",
      "Tremor-Compensated Gestures": "কম্পন-সমান্তৰাল হস্তচালনা সহায়",
    },
    revokeBtn: "প্ৰত্যাহাৰ কৰক",
    cancelBtn: "বাতিল",
    updateBtn: "প্ৰমাণীকৰণ নৱীকৰণ",
    applyStampBtn: "বিশেষজ্ঞৰ মোহৰ মাৰক",
    closeAria: "মডেল বন্ধ কৰক",
  },
  hi: {
    subHeader: "देखभालकर्ता एवं चिकित्सक अनुमोदन",
    certifyTitle: (title) => `प्रमाणित करें: ${title}`,
    domainLabel: (domain) => `डोमेन: ${domain}`,
    endorserNameLabel: "अनुमोदनकर्ता का नाम एवं साख",
    endorserNamePlaceholder: "उदा. डॉ. बी. के. शर्मा या सुनीता बोरा",
    endorserRoleLabel: "अनुमोदनकर्ता की भूमिका",
    roles: {
      caregiver: "देखभालकर्ता",
      clinician: "चिकित्सक / डॉक्टर",
      occupational_therapist: "ऑक्यूपेशनल थेरेपिस्ट",
      asha_worker: "आशा कार्यकर्ता",
    },
    recommendedStagingLabel: "अनुशंसित चरण (Staging)",
    stagingPlaceholder: "उदा. हल्का संज्ञानात्मक विकार (CDR 0.5)",
    clinicalRationaleLabel: "चिकित्सीय औचित्य एवं अवलोकन",
    rationalePlaceholder: "बताएं कि यह चिकित्सीय खेल इस मरीज को कैसे लाभ पहुँचाता है...",
    safetyAssurancesLabel: "सत्यापित सुरक्षा आश्वासन",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "शून्य ब्लू-लाइट थकावट",
      "Fall-Safe Seated Kinematics": "बैठकर खेलने हेतु गिरन-सुरक्षित गतिविधि",
      "Low Cognitive Stress Timers": "तनाव-मुक्त संज्ञानात्मक टाइमर",
      "Culturally Congruent Grounding": "सांस्कृतिक रूप से अनुकूल आधार",
      "Paced Multi-Sensory Prompts": "गति-नियंत्रित बहु-संवेदी संकेत",
      "Tremor-Compensated Gestures": "कंपन-संतुलित स्पर्श नियंत्रण",
    },
    revokeBtn: "वापस लें",
    cancelBtn: "रद्द करें",
    updateBtn: "प्रमाणीकरण अपडेट करें",
    applyStampBtn: "विशेषज्ञ मुहर लगाएं",
    closeAria: "संवाद बंद करें",
  },
  bn: {
    subHeader: "পরিচর্যাকারী ও চিকিৎসকের অনুমোদন",
    certifyTitle: (title) => `স্বীকৃতি দিন: ${title}`,
    domainLabel: (domain) => `ডোমেন: ${domain}`,
    endorserNameLabel: "অনুমোদনকারীর নাম ও শংসাপত্র",
    endorserNamePlaceholder: "যেমন- ডাঃ বি. কে. শর্মা বা সুনীতা বরা",
    endorserRoleLabel: "অনুমোদনকারীর ভূমিকা",
    roles: {
      caregiver: "পরিচর্যাকারী",
      clinician: "চিকিৎসক / ডাক্তার",
      occupational_therapist: "অকুপেশনাল থেরাপিস্ট",
      asha_worker: "আশা কর্মী",
    },
    recommendedStagingLabel: "প্রস্তাবিত পর্যায়",
    stagingPlaceholder: "যেমন- মৃদু জ্ঞানীয় দুর্বলতা (CDR ০.৫)",
    clinicalRationaleLabel: "ক্লিনিকাল যুক্তি ও পর্যবেক্ষণ",
    rationalePlaceholder: "এই থেরাপিউটিক গেমটি রোগীকে কীভাবে সহায়তা করে তা ব্যাখ্যা করুন...",
    safetyAssurancesLabel: "যাচাইকৃত সুরক্ষা নিশ্চয়তা",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "নীল আলোর ক্লান্তিহীনতা",
      "Fall-Safe Seated Kinematics": "পড়ে যাওয়া থেকে সুরক্ষিত বসে খেলার গতিবিধি",
      "Low Cognitive Stress Timers": "কম মানসিক চাপের টাইমার",
      "Culturally Congruent Grounding": "সাংস্কৃতিক সংগতিপূর্ণ স্থিতিশীলতা",
      "Paced Multi-Sensory Prompts": "নিয়ন্ত্রিত বহু-সংবেদনশীল সংকেত",
      "Tremor-Compensated Gestures": "কম্পন-সহায়ক স্পর্শ গতিবিধি",
    },
    revokeBtn: "প্রত্যাহার করুন",
    cancelBtn: "বাতিল",
    updateBtn: "স্বীকৃতি আপডেট করুন",
    applyStampBtn: "বিশেষজ্ঞ সিলমোহর দিন",
    closeAria: "মডেল বন্ধ করুন",
  },
  mr: {
    subHeader: "काळजीवाहू आणि डॉक्टर शिफारस",
    certifyTitle: (title) => `प्रमाणित करा: ${title}`,
    domainLabel: (domain) => `क्षेत्र: ${domain}`,
    endorserNameLabel: "शिफारसकर्त्याचे नाव व पात्रता",
    endorserNamePlaceholder: "उदा. डॉ. बी. के. शर्मा किंवा सुनिता बोरा",
    endorserRoleLabel: "शिफारसकर्त्याची भूमिका",
    roles: {
      caregiver: "काळजीवाहू",
      clinician: "डॉक्टर / वैद्यकीय तज्ज्ञ",
      occupational_therapist: "ऑक्युपेशनल थेरपिस्ट",
      asha_worker: "आशा सेविका",
    },
    recommendedStagingLabel: "शिफारस केलेला टप्पा",
    stagingPlaceholder: "उदा. सौम्य संज्ञानात्मक कमजोरी (CDR ०.५)",
    clinicalRationaleLabel: "वैद्यकीय कारणे आणि निरीक्षणे",
    rationalePlaceholder: "हा खेळ रुग्णाला कसा फायदेशीर ठरतो हे स्पष्ट करा...",
    safetyAssurancesLabel: "सत्यापित सुरक्षा मानके",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "शून्य ब्लू-लाइट थकवा",
      "Fall-Safe Seated Kinematics": "बसून खेळताना पडण्यापासून सुरक्षित हालचाली",
      "Low Cognitive Stress Timers": "कमी मानसिक ताणाचे टायमर",
      "Culturally Congruent Grounding": "सांस्कृतिकदृष्ट्या सुसंगत आधार",
      "Paced Multi-Sensory Prompts": "संतुलित बहु-संवेदी इशारे",
      "Tremor-Compensated Gestures": "कंपन-समायोजित हातवारे",
    },
    revokeBtn: "मागे घ्या",
    cancelBtn: "रद्द करा",
    updateBtn: "प्रमाणीकरण अद्यतनित करा",
    applyStampBtn: "तज्ज्ञ शिक्का मारा",
    closeAria: "खिडकी बंद करा",
  },
  ne: {
    subHeader: "हेरचाहकर्ता र चिकित्सक अनुमोदन",
    certifyTitle: (title) => `प्रमाणित गर्नुहोस्: ${title}`,
    domainLabel: (domain) => `क्षेत्र: ${domain}`,
    endorserNameLabel: "अनुमोदनकर्ताको नाम र योग्यता",
    endorserNamePlaceholder: "जस्तै डा. बी. के. शर्मा वा सुनिता बोरा",
    endorserRoleLabel: "अनुमोदनकर्ताको भूमिका",
    roles: {
      caregiver: "हेरचाहकर्ता",
      clinician: "चिकित्सक / डाक्टर",
      occupational_therapist: "अकुपेशनल थेरापिस्ट",
      asha_worker: "आशा कार्यकर्ता",
    },
    recommendedStagingLabel: "सिफारिस गरिएको अवस्था (Staging)",
    stagingPlaceholder: "जस्तै हल्का संज्ञानात्मक कमजोरी (CDR ०.५)",
    clinicalRationaleLabel: "चिकित्सकीय औचित्य र अवलोकन",
    rationalePlaceholder: "यो चिकित्सीय खेलले बिरामीलाई कसरी मद्दत गर्छ व्याख्या गर्नुहोस्...",
    safetyAssurancesLabel: "प्रमाणित सुरक्षा सुनिश्चितता",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "शून्य निलो प्रकाश थकान",
      "Fall-Safe Seated Kinematics": "लड्नबाट सुरक्षित बसेर गरिने गतिविधि",
      "Low Cognitive Stress Timers": "कम मानसिक तनाव टाइमर",
      "Culturally Congruent Grounding": "सांस्कृतिक रूपमा अनुकूल आधार",
      "Paced Multi-Sensory Prompts": "नियन्त्रित बहु-संवेदी संकेत",
      "Tremor-Compensated Gestures": "काँप्ने हातका लागि सन्तुलित इसारा",
    },
    revokeBtn: "फिर्ता लिनुहोस्",
    cancelBtn: "रद्द गर्नुहोस्",
    updateBtn: "प्रमाणीकरण अद्यावधिक गर्नुहोस्",
    applyStampBtn: "विशेषज्ञ छाप लगाउनुहोस्",
    closeAria: "मोडल बन्द गर्नुहोस्",
  },
  mni: {
    subHeader: "য়েন্থোকপা অমসুং লাইয়েংবগী অয়াবা",
    certifyTitle: (title) => `অয়াবা পীবীবা: ${title}`,
    domainLabel: (domain) => `লম: ${domain}`,
    endorserNameLabel: "অয়াবা পীবা মীওইগী মমিং অমসুং থাক",
    endorserNamePlaceholder: "খুদম ওয়না ডাঃ বি. কে. শর্মা নত্রগা সুনিলা বরা",
    endorserRoleLabel: "অয়াবা পীবগী থৌদাং",
    roles: {
      caregiver: "য়েন্থোকপা",
      clinician: "লাইয়েংবা / দাক্তর",
      occupational_therapist: "ওকুপেসনেল থেরাপিষ্ট",
      asha_worker: "আশা থবক তৌবী",
    },
    recommendedStagingLabel: "পীবগী থাক (Staging)",
    stagingPlaceholder: "খুদম ওয়না খরা নিংশিংবা হন্থবা (CDR ০.৫)",
    clinicalRationaleLabel: "লাইয়েংবগী মরম অমসুং য়েংশিনবা",
    rationalePlaceholder: "শান্নবা অসিনা অনাবদা করম্না কান্নবগে হায়বা ফোংদোকপীয়ু...",
    safetyAssurancesLabel: "চেক তৌরবা অকি-তুজুং থোকহন্দবা ৱাফম",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "ব্লু-লাইতকী ৱাবা লৈতবা",
      "Fall-Safe Seated Kinematics": "ফমদুনা শান্নবদা তাদবা সুৰক্ষা",
      "Low Cognitive Stress Timers": "ৱাখলদা অৱাবা পীহন্দবা মতম",
      "Culturally Congruent Grounding": "নাৎকা চুনবা থৌওং",
      "Paced Multi-Sensory Prompts": "নিয়ম চুম্না খোন্থোক অমসুং উবা খঙহনবা",
      "Tremor-Compensated Gestures": "খুৎ খুৎখৎপদা চুনহন্দুনা শান্নবা",
    },
    revokeBtn: "লৌথোকপা",
    cancelBtn: "তৌদবা",
    updateBtn: "অয়াবা অনৌবা শেম্বা",
    applyStampBtn: "বিশেষজ্ঞগী চপ মাৰকপা",
    closeAria: "মোডেল থিংজিনবা",
  },
  brx: {
    subHeader: "सांग्रां खालामग्रा आरो डाक्टरनि गोरोबनाय",
    certifyTitle: (title) => `गोरोबनाय होनाय: ${title}`,
    domainLabel: (domain) => `मुलुग: ${domain}`,
    endorserNameLabel: "गोरोबनाय होग्रानि मुं आरो मान",
    endorserNamePlaceholder: "जेरै डा. बि. के. शर्मा एबा सुनिता बरा",
    endorserRoleLabel: "गोरोबनाय होग्रानि बिफांव",
    roles: {
      caregiver: "सांग्रां खालामग्रा",
      clinician: "डाक्टर / मुलिग्रा",
      occupational_therapist: "अक्युपेशनल थेरापिस्ट",
      asha_worker: "आशा मावग्रा",
    },
    recommendedStagingLabel: "सुफारिस खालामनाय थाखो",
    stagingPlaceholder: "जेरै खम गोसोखां गोहो खम जानाय (CDR 0.5)",
    clinicalRationaleLabel: "मुलिगिरिनि जाहोन आरो नोजोर",
    rationalePlaceholder: "बे गेलेनाया बेमारिनो माबोरै हेफाजाब होयो बेखौ फोरमाय...",
    safetyAssurancesLabel: "आनजाद खालामनाय रैखाथि",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "निला सोरांनि थाव गैया",
      "Fall-Safe Seated Kinematics": "जिरायना गेलेनायाव गोग्लैनायनिफ्राय रैखाथि",
      "Low Cognitive Stress Timers": "खम गोसोनि नारथाइनि समाव",
      "Culturally Congruent Grounding": "हारिमु बादियै गोरोबनाय थासारि",
      "Paced Multi-Sensory Prompts": "गोरोबनाय गोबां-इन्द्रिय सिग्नल",
      "Tremor-Compensated Gestures": "गोजावनाय आखाइनि हेफाजाब",
    },
    revokeBtn: "दानखारनाय",
    cancelBtn: "नेवसि",
    updateBtn: "गोरोबनाय गोदान खालाम",
    applyStampBtn: "गिबि मुहर मारि",
    closeAria: "मोडेल बन्द खालाम",
  },
  grt: {
    subHeader: "Ni∙rokenggipa aro Daktorni Sakki On∙ani",
    certifyTitle: (title) => `Sakki On∙bo: ${title}`,
    domainLabel: (domain) => `Bak: ${domain}`,
    endorserNameLabel: "Sakki On∙gipani Biming aro Gadang",
    endorserNamePlaceholder: "Jekai Dr. B. K. Sarma ba Sunita Borah",
    endorserRoleLabel: "Sakki On∙gipani Kam",
    roles: {
      caregiver: "Ni∙rokenggipa",
      clinician: "Daktor / Sam Sanigipa",
      occupational_therapist: "Occupational Therapist",
      asha_worker: "ASHA Kam Ka∙gipa",
    },
    recommendedStagingLabel: "Gisikni Gadang",
    stagingPlaceholder: "Jekai Chonbegipa Gisik Bilgriani (CDR 0.5)",
    clinicalRationaleLabel: "Sanna-Banani Gimin aro Niani",
    rationalePlaceholder: "Ia kal∙ani saenggipana maikai dakchakgen talate on∙bo...",
    safetyAssurancesLabel: "Kenani Gri Kakket Sakki",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "Teng∙ani Neng∙ani Gri",
      "Fall-Safe Seated Kinematics": "Asongpile kal∙on gogrena kene dongja",
      "Low Cognitive Stress Timers": "Gisik neng∙nikani gri somoi",
      "Culturally Congruent Grounding": "Jatni bewal baksa meliachi",
      "Paced Multi-Sensory Prompts": "Ka∙sinbee gipin u∙ianiko mesokani",
      "Tremor-Compensated Gestures": "Jak til∙tilon dakchakani",
    },
    revokeBtn: "Ra∙galbo",
    cancelBtn: "Watgalbo",
    updateBtn: "Sakkiko Gital Dakbo",
    applyStampBtn: "Muhurko Suapbo",
    closeAria: "Chipbo",
  },
  kha: {
    subHeader: "Ka Jingmynjur U Nongsumar bad U Doktor",
    certifyTitle: (title) => `Pynskhem: ${title}`,
    domainLabel: (domain) => `Ka Bynta: ${domain}`,
    endorserNameLabel: "Kyrteng bad Kyrdan U Nongpynskhem",
    endorserNamePlaceholder: "Kumba Dr. B. K. Sarma lane Sunita Borah",
    endorserRoleLabel: "Ka Kam U Nongpynskhem",
    roles: {
      caregiver: "Nongsumar",
      clinician: "Doktor / Nongai Dawai",
      occupational_therapist: "Occupational Therapist",
      asha_worker: "Nongtrei ASHA",
    },
    recommendedStagingLabel: "Ka Kyrdan ba la Ai Jingmut",
    stagingPlaceholder: "Kumba Mild Cognitive Impairment (CDR 0.5)",
    clinicalRationaleLabel: "Ka Daw ba Pynshongdor bad Jingiohi",
    rationalePlaceholder: "Batai kumno kane ka jingialehkai ka iarap ia u nongpang...",
    safetyAssurancesLabel: "Ki Jingiada ba la Pynshisha",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "Ym thait na ka jingshai blue",
      "Fall-Safe Seated Kinematics": "Shong thikna khlem don jingma ban khyllem",
      "Low Cognitive Stress Timers": "Ka por khlem jingpynshitom ia ka jingmut",
      "Culturally Congruent Grounding": "Iadei dur bad ka riti dustur tynrai",
      "Paced Multi-Sensory Prompts": "Ki dak jingbatai ba iadei beit",
      "Tremor-Compensated Gestures": "Kaba pynsuk wat lada kti kyiuh",
    },
    revokeBtn: "Wadnoh",
    cancelBtn: "Kyntait",
    updateBtn: "Pynbna Thymmai Jingpynskhem",
    applyStampBtn: "Buh Stamp Tynrai",
    closeAria: "Khad ia ka Modal",
  },
  lus: {
    subHeader: "Enkawltu leh Vantlang Daktor Hriatpuina",
    certifyTitle: (title) => `Nemnghet Rawh: ${title}`,
    domainLabel: (domain) => `Huam Chhung: ${domain}`,
    endorserNameLabel: "Hriatpuitu Hming leh Nihna",
    endorserNamePlaceholder: "Entirnan: Dr. B. K. Sarma emaw Sunita Borah",
    endorserRoleLabel: "Hriatpuitu Nihna",
    roles: {
      caregiver: "Enkawltu",
      clinician: "Daktor / Damdawi Thiam",
      occupational_therapist: "Occupational Therapist",
      asha_worker: "ASHA Thawktu",
    },
    recommendedStagingLabel: "Hman Tura Ruahmanna (Staging)",
    stagingPlaceholder: "Entirnan: Hriatna Tlem Chauh Hloh (CDR 0.5)",
    clinicalRationaleLabel: "Damdawi Lam Chhan leh Enchianna",
    rationalePlaceholder: "He infiamna hian damlo tan engtin nge tangkaina a neih hrilhfiah rawh...",
    safetyAssurancesLabel: "Himna Tichiangtu Hriatpuinate",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "Eng pawl rimhaina awm lo",
      "Fall-Safe Seated Kinematics": "Thut chunga chet vel thal lo tura him",
      "Low Cognitive Stress Timers": "Hriatna tichau lo tura hun bi neih",
      "Culturally Congruent Grounding": "Hnam zia leh nunphung nena inrem",
      "Paced Multi-Sensory Prompts": "Hriat theihna hrang hrang dam deuha hrilhfiahna",
      "Tremor-Compensated Gestures": "Kut khur vanga chetsual venna",
    },
    revokeBtn: "Hlip Rawh",
    cancelBtn: "Sutna",
    updateBtn: "Hriatpuina Tithar Rawh",
    applyStampBtn: "Thiamna Stamp Chhu Rawh",
    closeAria: "Khar Rawh",
  },
};

function playTactileStampSound() {
  try {
    const audioCtx = ensureAudioContext();
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(440, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.15);
  } catch {
    // AudioContext not supported or blocked
  }
}

export function CaregiverVerifyModal({
  isOpen,
  onClose,
  gameId,
  gameTitle,
  gameDomain,
}: CaregiverVerifyModalProps) {
  const locale = useLocale();
  const t = VERIFY_MODAL_I18N[locale] || VERIFY_MODAL_I18N.en;

  const { getVerification, setVerification, removeVerification } =
    useGameVerificationStore();
  const existing = getVerification(gameId);

  const [verifiedBy, setVerifiedBy] = useState(
    existing?.verifiedBy || "Sunita Borah (Primary Caregiver)"
  );
  const [role, setRole] = useState<GameVerification["role"]>(
    existing?.role || "caregiver"
  );
  const [targetStage, setTargetStage] = useState(
    existing?.targetStage || "Mild Cognitive Impairment (CDR 0.5)"
  );
  const [clinicalRationale, setClinicalRationale] = useState(
    existing?.clinicalRationale ||
      "Evaluated for daily cognitive stimulation. Demonstrates strong engagement and calm mood retention."
  );
  const [safetyAssurances, setSafetyAssurances] = useState<string[]>(
    existing?.safetyAssurances || [
      "Zero Blue-Light Exhaustion",
      "Fall-Safe Seated Kinematics",
      "Low Cognitive Stress Timers",
    ]
  );
  const [isStampSuccess, setIsStampSuccess] = useState(false);

  useEffect(() => {
    if (existing) {
      setVerifiedBy(existing.verifiedBy);
      setRole(existing.role);
      setTargetStage(existing.targetStage);
      setClinicalRationale(existing.clinicalRationale);
      setSafetyAssurances(existing.safetyAssurances || []);
    } else {
      setVerifiedBy("Sunita Borah (Primary Caregiver)");
      setRole("caregiver");
      setTargetStage("Mild Cognitive Impairment (CDR 0.5)");
      setClinicalRationale(
        "Evaluated for daily cognitive stimulation. Demonstrates strong engagement and calm mood retention."
      );
      setSafetyAssurances([
        "Zero Blue-Light Exhaustion",
        "Fall-Safe Seated Kinematics",
        "Low Cognitive Stress Timers",
      ]);
    }
  }, [existing, isOpen]);

  if (!isOpen) return null;

  const handleToggleSafety = (item: string) => {
    setSafetyAssurances((prev) =>
      prev.includes(item) ? prev.filter((s) => s !== item) : [...prev, item]
    );
  };

  const handleSave = () => {
    const today = new Date().toISOString().split("T")[0];
    const newVerification: GameVerification = {
      gameId,
      isVerified: true,
      verifiedBy: verifiedBy.trim() || "Sunita Borah (Caregiver)",
      role,
      verifiedAt: today,
      clinicalRationale:
        clinicalRationale.trim() ||
        "Clinically certified for targeted cognitive therapy.",
      targetStage: targetStage.trim() || "Mild Cognitive Impairment (CDR 0.5)",
      safetyAssurances,
    };

    setVerification(newVerification);
    playTactileStampSound();
    setIsStampSuccess(true);

    setTimeout(() => {
      setIsStampSuccess(false);
      onClose();
    }, 600);
  };

  const handleRevoke = () => {
    removeVerification(gameId);
    onClose();
  };

  const roleOptions: { id: GameVerification["role"]; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "caregiver", label: t.roles.caregiver, icon: HeartHandshake },
    { id: "clinician", label: t.roles.clinician, icon: Stethoscope },
    { id: "occupational_therapist", label: t.roles.occupational_therapist, icon: Award },
    { id: "asha_worker", label: t.roles.asha_worker, icon: Sparkles },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border-4 border-black bg-surface p-6 shadow-[8px_8px_0px_#000] text-ink"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-surface-muted text-ink hover:bg-brick-light hover:text-brick transition-colors cursor-pointer shadow-[2px_2px_0px_#000]"
          aria-label={t.closeAria}
        >
          <X className="h-5 w-5 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 pb-3 border-b-2 border-black/10">
          <div className="relative h-14 w-14 shrink-0">
            <Image
              src="/sample-images/101-removebg-preview.png"
              alt="Verification Stamp"
              fill
              className={`object-contain drop-shadow transition-transform duration-300 ${
                isStampSuccess ? "scale-125 rotate-0" : "-rotate-6"
              }`}
            />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
              {t.subHeader}
            </span>
            <h2 className="text-lg font-black text-ink leading-tight">
              {t.certifyTitle(gameTitle || gameId)}
            </h2>
            {gameDomain && (
              <span className="text-xs font-bold text-ink-secondary">
                {t.domainLabel(gameDomain)}
              </span>
            )}
          </div>
        </div>

        {/* Form Fields */}
        <div className="mt-4 space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {/* Verifier Name */}
          <div>
            <label className="block text-xs font-black uppercase text-ink-secondary tracking-wider mb-1">
              {t.endorserNameLabel}
            </label>
            <input
              type="text"
              value={verifiedBy}
              onChange={(e) => setVerifiedBy(e.target.value)}
              placeholder={t.endorserNamePlaceholder}
              className="w-full rounded-xl border-2 border-black bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-ink shadow-[2px_2px_0px_#000] focus:outline-hidden focus:ring-2 focus:ring-tea"
            />
          </div>

          {/* Endorser Role */}
          <div>
            <label className="block text-xs font-black uppercase text-ink-secondary tracking-wider mb-1">
              {t.endorserRoleLabel}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roleOptions.map((r) => {
                const Icon = r.icon;
                const isSelected = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`flex items-center gap-1.5 rounded-xl border-2 border-black p-2 text-xs font-black transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                      isSelected
                        ? "bg-tea text-white scale-[1.02]"
                        : "bg-surface-muted text-ink hover:bg-tea-light"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Stage */}
          <div>
            <label className="block text-xs font-black uppercase text-ink-secondary tracking-wider mb-1">
              {t.recommendedStagingLabel}
            </label>
            <input
              type="text"
              value={targetStage}
              onChange={(e) => setTargetStage(e.target.value)}
              placeholder={t.stagingPlaceholder}
              className="w-full rounded-xl border-2 border-black bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-ink shadow-[2px_2px_0px_#000] focus:outline-hidden focus:ring-2 focus:ring-tea"
            />
          </div>

          {/* Clinical Rationale */}
          <div>
            <label className="block text-xs font-black uppercase text-ink-secondary tracking-wider mb-1">
              {t.clinicalRationaleLabel}
            </label>
            <textarea
              rows={3}
              value={clinicalRationale}
              onChange={(e) => setClinicalRationale(e.target.value)}
              placeholder={t.rationalePlaceholder}
              className="w-full rounded-xl border-2 border-black bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-ink shadow-[2px_2px_0px_#000] focus:outline-hidden focus:ring-2 focus:ring-tea"
            />
          </div>

          {/* Safety Assurances */}
          <div>
            <label className="block text-xs font-black uppercase text-ink-secondary tracking-wider mb-1">
              {t.safetyAssurancesLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {COMMON_SAFETY_ASSURANCES.map((item) => {
                const isChecked = safetyAssurances.includes(item);
                const displayLabel = t.safetyAssurances[item] || item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleSafety(item)}
                    className={`flex items-center gap-2 rounded-lg border-2 border-black/20 p-2 text-left text-xs font-bold transition-all cursor-pointer ${
                      isChecked
                        ? "border-emerald-600 bg-emerald-50 text-emerald-950"
                        : "bg-surface-muted text-ink-secondary hover:bg-surface"
                    }`}
                  >
                    <CheckCircle2
                      className={`h-4 w-4 shrink-0 ${
                        isChecked ? "text-emerald-700" : "text-black/30"
                      }`}
                    />
                    <span className="leading-tight">{displayLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-between border-t-2 border-black/10 pt-4 gap-2">
          {existing && (
            <button
              type="button"
              onClick={handleRevoke}
              className="btn-tactile flex items-center gap-1 rounded-xl border-2 border-black bg-brick-light px-3 py-2 text-xs font-black text-brick hover:bg-brick hover:text-white cursor-pointer shadow-[2px_2px_0px_#000]"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t.revokeBtn}</span>
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="btn-tactile rounded-xl border-2 border-black bg-surface-muted px-3.5 py-2 text-xs font-black text-ink hover:bg-black/5 cursor-pointer shadow-[2px_2px_0px_#000]"
            >
              {t.cancelBtn}
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea px-4 py-2 text-xs font-black text-white hover:bg-emerald-800 cursor-pointer shadow-[2px_2px_0px_#000]"
            >
              <Save className="h-4 w-4" />
              <span>{existing ? t.updateBtn : t.applyStampBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
