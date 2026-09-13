"use client";

import React from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Stethoscope,
  HeartHandshake,
  Brain,
  Sparkles,
  Edit3,
  Award,
} from "lucide-react";
import type { GameVerification } from "@/store/useGameVerificationStore";

interface ClinicalEndorsementModalProps {
  isOpen: boolean;
  onClose: () => void;
  verification?: GameVerification;
  gameTitle?: string;
  gameDomain?: string;
  onOpenEdit?: () => void;
}

interface EndorsementModalTexts {
  certificateBadge: string;
  defaultTitle: string;
  endorserHeader: string;
  certifiedOn: (date: string) => string;
  roles: {
    clinician: string;
    occupational_therapist: string;
    asha_worker: string;
    caregiver: string;
  };
  stagingHeader: string;
  rationaleHeader: string;
  safetyHeader: string;
  safetyAssurances: Record<string, string>;
  editBtn: string;
  closeBtn: string;
  closeAria: string;
}

const ENDORSEMENT_MODAL_I18N: Record<string, EndorsementModalTexts> = {
  en: {
    certificateBadge: "Digital Therapeutics Certification",
    defaultTitle: "Cognitive Gaming Module",
    endorserHeader: "Endorsing Field Expert / Caregiver",
    certifiedOn: (d) => `Certified on ${d}`,
    roles: {
      clinician: "Geriatrician / Neurologist",
      occupational_therapist: "Occupational Therapist",
      asha_worker: "Community ASHA Worker",
      caregiver: "Certified Caregiver",
    },
    stagingHeader: "Target Staging & Clinical Domain",
    rationaleHeader: "Clinical & Caregiver Rationale",
    safetyHeader: "Dementia Safety Assurances",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "Zero Blue-Light Exhaustion",
      "Fall-Safe Seated Kinematics": "Fall-Safe Seated Kinematics",
      "Low Cognitive Stress Timers": "Low Cognitive Stress Timers",
      "Culturally Congruent Grounding": "Culturally Congruent Grounding",
      "Paced Multi-Sensory Prompts": "Paced Multi-Sensory Prompts",
      "Tremor-Compensated Gestures": "Tremor-Compensated Gestures",
    },
    editBtn: "Edit Endorsement",
    closeBtn: "Acknowledge & Close",
    closeAria: "Close clinical endorsement modal",
  },
  as: {
    certificateBadge: "ডিজিটেল থেৰাপিউটিকছ প্ৰমাণীকৰণ",
    defaultTitle: "সংজ্ঞানাত্মক গেমিং মডিউল",
    endorserHeader: "অনুমোদনকাৰী ক্ষেত্ৰ বিশেষজ্ঞ / যত্নকৰ্তা",
    certifiedOn: (d) => `${d} তাৰিখে প্ৰমাণিত`,
    roles: {
      clinician: "জেৰিয়াট্ৰিচিয়ান / স্নায়ুৰোগ বিশেষজ্ঞ",
      occupational_therapist: "অকুপেচনেল থেৰাপিষ্ট",
      asha_worker: "সম্প্ৰদায় আশা কৰ্মী",
      caregiver: "প্ৰমাণিত যত্নকৰ্তা",
    },
    stagingHeader: "লক্ষ্য স্তৰ আৰু চিকিৎসাগত ক্ষেত্ৰ",
    rationaleHeader: "চিকিৎসাগত আৰু যত্নকৰ্তাৰ যুক্তি",
    safetyHeader: "ডিমেনচিয়া সুৰক্ষা নিশ্চয়তা",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "নীলা পোহৰজনিত ভাগৰহীন",
      "Fall-Safe Seated Kinematics": "পৰি যোৱাৰ পৰা সুৰক্ষিত বহি খেলা গতিবিধি",
      "Low Cognitive Stress Timers": "কম সংজ্ঞানাত্মক মানসিক চাপৰ টাইমাৰ",
      "Culturally Congruent Grounding": "সাংস্কৃতিকভাৱে সামঞ্জস্যপূৰ্ণ স্থায়িত্ব",
      "Paced Multi-Sensory Prompts": "নিয়ন্ত্ৰিত বহু-ইন্দ্ৰিয় উদ্দীপক",
      "Tremor-Compensated Gestures": "কম্পন-সমান্তৰাল হস্তচালনা সহায়",
    },
    editBtn: "অনুমোদন সম্পাদনা",
    closeBtn: "স্বীকাৰ কৰক আৰু বন্ধ কৰক",
    closeAria: "অনুমোদন মডেল বন্ধ কৰক",
  },
  hi: {
    certificateBadge: "डिजिटल थेराप्यूटिक्स प्रमाणन",
    defaultTitle: "संज्ञानात्मक गेमिंग मॉड्यूल",
    endorserHeader: "अनुमोदनकर्ता क्षेत्रीय विशेषज्ञ / देखभालकर्ता",
    certifiedOn: (d) => `${d} को प्रमाणित`,
    roles: {
      clinician: "वृद्धरोग / न्यूरोलॉजिस्ट विशेषज्ञ",
      occupational_therapist: "ऑक्यूपेशनल थेरेपिस्ट",
      asha_worker: "सामुदायिक आशा कार्यकर्ता",
      caregiver: "प्रमाणित देखभालकर्ता",
    },
    stagingHeader: "लक्षित चरण एवं चिकित्सीय डोमेन",
    rationaleHeader: "चिकित्सीय एवं देखभालकर्ता औचित्य",
    safetyHeader: "डिमेंशिया सुरक्षा आश्वासन",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "शून्य ब्लू-लाइट थकावट",
      "Fall-Safe Seated Kinematics": "बैठकर खेलने हेतु गिरन-सुरक्षित गतिविधि",
      "Low Cognitive Stress Timers": "तनाव-मुक्त संज्ञानात्मक टाइमर",
      "Culturally Congruent Grounding": "सांस्कृतिक रूप से अनुकूल आधार",
      "Paced Multi-Sensory Prompts": "गति-नियंत्रित बहु-संवेदी संकेत",
      "Tremor-Compensated Gestures": "कंपन-संतुलित स्पर्श नियंत्रण",
    },
    editBtn: "अनुमोदन संपादित करें",
    closeBtn: "स्वीकारें और बंद करें",
    closeAria: "अनुमोदन संवाद बंद करें",
  },
  bn: {
    certificateBadge: "ডিজিটাল থেরাপিউটিক্স সার্টিফিকেশন",
    defaultTitle: "কগনিটিভ গেমিং মডিউল",
    endorserHeader: "অনুমোদনকারী ক্ষেত্র বিশেষজ্ঞ / পরিচর্যাকারী",
    certifiedOn: (d) => `${d} তারিখে প্রমাণিত`,
    roles: {
      clinician: "জেরিয়াট্রিশিয়ান / নিউরোলজিস্ট",
      occupational_therapist: "অকুপেশনাল থেরাপিস্ট",
      asha_worker: "কমিউনিটি আশা কর্মী",
      caregiver: "প্রত্যয়িত পরিচর্যাকারী",
    },
    stagingHeader: "লক্ষ্য পর্যায় এবং ক্লিনিকাল ডোমেন",
    rationaleHeader: "ক্লিনিকাল ও পরিচর্যাকারীর যুক্তি",
    safetyHeader: "ডিমেনশিয়া সুরক্ষা নিশ্চয়তা",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "নীল আলোর ক্লান্তিহীনতা",
      "Fall-Safe Seated Kinematics": "পড়ে যাওয়া থেকে সুরক্ষিত বসে খেলার গতিবিধি",
      "Low Cognitive Stress Timers": "কম মানসিক চাপের টাইমার",
      "Culturally Congruent Grounding": "সাংস্কৃতিক সংগতিপূর্ণ স্থিতিশীলতা",
      "Paced Multi-Sensory Prompts": "নিয়ন্ত্রিত বহু-সংবেদনশীল সংকেত",
      "Tremor-Compensated Gestures": "কম্পন-সহায়ক স্পর্শ গতিবিধি",
    },
    editBtn: "অনুমোদন সম্পাদনা",
    closeBtn: "স্বীকার করুন ও বন্ধ করুন",
    closeAria: "অনুমোদন মডেল বন্ধ করুন",
  },
  mr: {
    certificateBadge: "डिजिटल थेरॅप्यूटिक्स प्रमाणपत्र",
    defaultTitle: "संज्ञानात्मक गेमिंग विभाग",
    endorserHeader: "शिफारसकर्ते तज्ज्ञ / काळजीवाहू",
    certifiedOn: (d) => `${d} रोजी प्रमाणित`,
    roles: {
      clinician: "जेरियाट्रिशियन / न्यूरोलॉजिस्ट",
      occupational_therapist: "ऑक्युपेशनल थेरपिस्ट",
      asha_worker: "समुदाय आशा सेविका",
      caregiver: "प्रमाणित काळजीवाहू",
    },
    stagingHeader: "लक्षित टप्पा आणि वैद्यकीय क्षेत्र",
    rationaleHeader: "वैद्यकीय व काळजीवाहू विश्लेषण",
    safetyHeader: "डिमेंशिया सुरक्षा मानके",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "शून्य ब्लू-लाइट थकवा",
      "Fall-Safe Seated Kinematics": "बसून खेळताना पडण्यापासून सुरक्षित हालचाली",
      "Low Cognitive Stress Timers": "कमी मानसिक ताणाचे टायमर",
      "Culturally Congruent Grounding": "सांस्कृतिकदृष्ट्या सुसंगत आधार",
      "Paced Multi-Sensory Prompts": "संतुलित बहु-संवेदी इशारे",
      "Tremor-Compensated Gestures": "कंपन-समायोजित हातवारे",
    },
    editBtn: "शिफारस संपादित करा",
    closeBtn: "मान्य करा आणि बंद करा",
    closeAria: "प्रमाणीकरण खिडकी बंद करा",
  },
  ne: {
    certificateBadge: "डिजिटल थेराप्युटिक्स प्रमाणीकरण",
    defaultTitle: "संज्ञानात्मक गेमिङ मोड्युल",
    endorserHeader: "अनुमोदनकर्ता विशेषज्ञ / हेरचाहकर्ता",
    certifiedOn: (d) => `${d} मा प्रमाणित`,
    roles: {
      clinician: "वृद्धरोग / न्युरोलोजिस्ट",
      occupational_therapist: "अकुपेशनल थेरापिस्ट",
      asha_worker: "सामुदायिक आशा कार्यकर्ता",
      caregiver: "प्रमाणित हेरचाहकर्ता",
    },
    stagingHeader: "लक्षित अवस्था र चिकित्सीय क्षेत्र",
    rationaleHeader: "चिकित्सकीय तथा हेरचाहकर्ता औचित्य",
    safetyHeader: "डिमेन्सिया सुरक्षा सुनिश्चितता",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "शून्य निलो प्रकाश थकान",
      "Fall-Safe Seated Kinematics": "लड्नबाट सुरक्षित बसेर गरिने गतिविधि",
      "Low Cognitive Stress Timers": "कम मानसिक तनाव टाइमर",
      "Culturally Congruent Grounding": "सांस्कृतिक रूपमा अनुकूल आधार",
      "Paced Multi-Sensory Prompts": "नियन्त्रित बहु-संवेदी संकेत",
      "Tremor-Compensated Gestures": "काँप्ने हातका लागि सन्तुलित इसारा",
    },
    editBtn: "अनुमोदन सम्पादन गर्नुहोस्",
    closeBtn: "स्वीकार गर्नुहोस् र बन्द गर्नुहोस्",
    closeAria: "मोडल बन्द गर्नुहोस्",
  },
  mni: {
    certificateBadge: "ডিজিতেল থেরাপিউটিক্স প্রমানপত্র",
    defaultTitle: "ৱাখলগী শান্নবা মডিউল",
    endorserHeader: "অয়াবা পীবা বিশেষজ্ঞ / য়েন্থোকপা",
    certifiedOn: (d) => `${d} দা অয়াবা পীখিবা`,
    roles: {
      clinician: "অহলগী লাইয়েংবা / নিউরোলজিষ্ট",
      occupational_therapist: "ওকুপেসনেল থেরাপিষ্ট",
      asha_worker: "খুঞ্জাগী আশা কর্মী",
      caregiver: "অয়াবা লৈরবা য়েন্থোকপা",
    },
    stagingHeader: "পান্দমগী থাক অমসুং লাইয়েংগী লম",
    rationaleHeader: "লাইয়েংবা অমসুং য়েন্থোকপগী মরম",
    safetyHeader: "ডিমেন্সিয়া অকি-তুজুং থোকহন্দবা ৱাফম",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "ব্লু-লাইতকী ৱাবা লৈতবা",
      "Fall-Safe Seated Kinematics": "ফমদুনা শান্নবদা তাদবা সুৰক্ষা",
      "Low Cognitive Stress Timers": "ৱাখলদা অৱাবা পীহন্দবা মতম",
      "Culturally Congruent Grounding": "নাৎকা চুনবা থৌওং",
      "Paced Multi-Sensory Prompts": "নিয়ম চুম্না খোন্থোক অমসুং উবা খঙহনবা",
      "Tremor-Compensated Gestures": "খুৎ খুৎখৎপদা চুনহন্দুনা শান্নবা",
    },
    editBtn: "অয়াবা শেমদোকপা",
    closeBtn: "য়ারবা অমসুং থিংজিনবা",
    closeAria: "মোডেল থিংজিনবা",
  },
  brx: {
    certificateBadge: "डिजिटेल थेराप्युटिक्स मानहोनाय",
    defaultTitle: "गोसोनि गेलेनाय मडुल",
    endorserHeader: "गोरोबनाय होग्रा गोरोब मानसि / सांग्रां खालामग्रा",
    certifiedOn: (d) => `${d} आव गोरोबनाय जाबाय`,
    roles: {
      clinician: "बैसो जानायनि डाक्टर / न्युरलजिस्ट",
      occupational_therapist: "अक्युपेशनल थेरापिस्ट",
      asha_worker: "गियान आशा मावग्रा",
      caregiver: "गोरोब सांग्रां खालामग्रा",
    },
    stagingHeader: "थांखि थाखो आरो मुलि मुलुग",
    rationaleHeader: "डाक्टर आरो सांग्रां खालामग्रानि जाहोन",
    safetyHeader: "डिमेन्सिया रैखाथिनि मान",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "निला सोरांनि थाव गैया",
      "Fall-Safe Seated Kinematics": "जिरायना गेलेनायाव गोग्लैनायनिफ्राय रैखाथि",
      "Low Cognitive Stress Timers": "खम गोसोनि नारथाइनि समाव",
      "Culturally Congruent Grounding": "हारिमु बादियै गोरोबनाय थासारि",
      "Paced Multi-Sensory Prompts": "गोरोबनाय गोबां-इन्द्रिय सिग्नल",
      "Tremor-Compensated Gestures": "गोजावनाय आखाइनि हेफाजाब",
    },
    editBtn: "गोरोबनाय सोलाय",
    closeBtn: "मानिनानै बन्द खालाम",
    closeAria: "मोडेल बन्द खालाम",
  },
  grt: {
    certificateBadge: "Digital Therapeutics Sakki Lekha",
    defaultTitle: "Gisikni Kal∙ani Bak",
    endorserHeader: "Sakki On∙gipa Field Expert / Ni∙rokenggipa",
    certifiedOn: (d) => `${d} o sakki on∙aha`,
    roles: {
      clinician: "Budepani Daktor / Neurologist",
      occupational_therapist: "Occupational Therapist",
      asha_worker: "Songjinmani ASHA Kam Ka∙gipa",
      caregiver: "Kakket Ni∙rokenggipa",
    },
    stagingHeader: "Gisikni Gadang aro Sanna-Banani Bak",
    rationaleHeader: "Sanna-Banani aro Ni∙rokani Bewal",
    safetyHeader: "Dementia Kenani Gri Kakket Sakki",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "Teng∙ani Neng∙ani Gri",
      "Fall-Safe Seated Kinematics": "Asongpile kal∙on gogrena kene dongja",
      "Low Cognitive Stress Timers": "Gisik neng∙nikani gri somoi",
      "Culturally Congruent Grounding": "Jatni bewal baksa meliachi",
      "Paced Multi-Sensory Prompts": "Ka∙sinbee gipin u∙ianiko mesokani",
      "Tremor-Compensated Gestures": "Jak til∙tilon dakchakani",
    },
    editBtn: "Sakkiko Taridapbo",
    closeBtn: "Ra∙chake Chipbo",
    closeAria: "Chipbo",
  },
  kha: {
    certificateBadge: "Digital Therapeutics Jingpynskhem",
    defaultTitle: "Module Jingialehkai Jingmut",
    endorserHeader: "Nongpynskhem ba Stad / Nongsumar",
    certifiedOn: (d) => `La pynskhem ha ka ${d}`,
    roles: {
      clinician: "Doktor Timon-Tymmen / Neurologist",
      occupational_therapist: "Occupational Therapist",
      asha_worker: "Nongtrei Shnong ASHA",
      caregiver: "Nongsumar ba la pynskhem",
    },
    stagingHeader: "Ka Kyrdan ba la Thmu bad Ka Bynta Dawai",
    rationaleHeader: "Ka Daw ba Pynshongdor na u Doktor bad Nongsumar",
    safetyHeader: "Ki Jingiada Dementia ba la Pynshisha",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "Ym thait na ka jingshai blue",
      "Fall-Safe Seated Kinematics": "Shong thikna khlem don jingma ban khyllem",
      "Low Cognitive Stress Timers": "Ka por khlem jingpynshitom ia ka jingmut",
      "Culturally Congruent Grounding": "Iadei dur bad ka riti dustur tynrai",
      "Paced Multi-Sensory Prompts": "Ki dak jingbatai ba iadei beit",
      "Tremor-Compensated Gestures": "Kaba pynsuk wat lada kti kyiuh",
    },
    editBtn: "Pynbeit ia ka Jingpynskhem",
    closeBtn: "Pdiang bad Khad",
    closeAria: "Khad ia ka Modal",
  },
  lus: {
    certificateBadge: "Digital Therapeutics Hriatpuina Lekha",
    defaultTitle: "Hriatna Tichak Tu Infiamna Module",
    endorserHeader: "Hriatpuitu Thiam Bik / Enkawltu",
    certifiedOn: (d) => `${d} a hriatpui a ni`,
    roles: {
      clinician: "Upate Daktor / Neurologist",
      occupational_therapist: "Occupational Therapist",
      asha_worker: "Khawtlang ASHA Thawktu",
      caregiver: "Hriatpui Enkawltu",
    },
    stagingHeader: "Tum Bika Ruahman leh Damdawi Huang",
    rationaleHeader: "Damdawi leh Enkawltu Lam Chhan",
    safetyHeader: "Dementia Hriatpuina Himna Tichiangtu",
    safetyAssurances: {
      "Zero Blue-Light Exhaustion": "Eng pawl rimhaina awm lo",
      "Fall-Safe Seated Kinematics": "Thut chunga chet vel thal lo tura him",
      "Low Cognitive Stress Timers": "Hriatna tichau lo tura hun bi neih",
      "Culturally Congruent Grounding": "Hnam zia leh nunphung nena inrem",
      "Paced Multi-Sensory Prompts": "Hriat theihna hrang hrang dam deuha hrilhfiahna",
      "Tremor-Compensated Gestures": "Kut khur vanga chetsual venna",
    },
    editBtn: "Hriatpuina Siamrem Rawh",
    closeBtn: "Pawm la Khar Rawh",
    closeAria: "Khar Rawh",
  },
};

export function ClinicalEndorsementModal({
  isOpen,
  onClose,
  verification,
  gameTitle,
  gameDomain,
  onOpenEdit,
}: ClinicalEndorsementModalProps) {
  const locale = useLocale();
  const t = ENDORSEMENT_MODAL_I18N[locale] || ENDORSEMENT_MODAL_I18N.en;

  if (!isOpen || !verification) return null;

  const getRoleBadge = (role: GameVerification["role"]) => {
    switch (role) {
      case "clinician":
        return {
          label: t.roles.clinician,
          color: "bg-teal-100 text-teal-900 border-teal-500",
          icon: Stethoscope,
        };
      case "occupational_therapist":
        return {
          label: t.roles.occupational_therapist,
          color: "bg-amber-100 text-amber-900 border-amber-500",
          icon: Award,
        };
      case "asha_worker":
        return {
          label: t.roles.asha_worker,
          color: "bg-amber-100 text-amber-900 border-amber-500",
          icon: Sparkles,
        };
      case "caregiver":
      default:
        return {
          label: t.roles.caregiver,
          color: "bg-emerald-100 text-emerald-900 border-emerald-500",
          icon: HeartHandshake,
        };
    }
  };

  const roleInfo = getRoleBadge(verification.role);
  const RoleIcon = roleInfo.icon;

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

        {/* Header with Official Stamp Seal & Title */}
        <div className="flex items-start gap-4 pb-4 border-b-2 border-black/10">
          <div className="relative h-20 w-20 shrink-0 select-none">
            <Image
              src="/sample-images/101-removebg-preview.png"
              alt="Field Expert Verified Stamp"
              fill
              className="object-contain drop-shadow-[2px_2px_4px_rgba(0,0,0,0.3)] rotate-[-6deg]"
              priority
            />
          </div>
          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wide">
              <ShieldCheck className="h-4 w-4" />
              <span>{t.certificateBadge}</span>
            </div>
            <h2 className="mt-0.5 text-lg sm:text-xl font-black text-ink leading-tight">
              {gameTitle || t.defaultTitle}
            </h2>
            {gameDomain && (
              <span className="inline-flex items-center gap-1 mt-1 rounded bg-tea-light px-2 py-0.5 text-[10px] font-extrabold text-tea border border-tea/40">
                <Brain className="h-3 w-3" /> {gameDomain}
              </span>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="mt-4 space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
          {/* Verifier Badge */}
          <div className="rounded-2xl border-2 border-black/15 bg-surface-muted p-3.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase text-ink-secondary tracking-wider">
                {t.endorserHeader}
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black border ${roleInfo.color}`}
              >
                <RoleIcon className="h-3 w-3" />
                {roleInfo.label}
              </span>
            </div>
            <div className="mt-1 text-sm font-black text-ink">
              {verification.verifiedBy}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-ink-secondary">
              <Calendar className="h-3.5 w-3.5" />
              <span>{t.certifiedOn(verification.verifiedAt)}</span>
            </div>
          </div>

          {/* Staging Calibration */}
          {verification.targetStage && (
            <div className="rounded-xl border-2 border-amber-900/20 bg-amber-50/80 p-3">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900">
                {t.stagingHeader}
              </span>
              <div className="mt-0.5 text-xs font-bold text-amber-950">
                {verification.targetStage}
              </div>
            </div>
          )}

          {/* Clinical Rationale */}
          <div className="rounded-2xl border-2 border-emerald-900/20 bg-emerald-50/60 p-3.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900">
              {t.rationaleHeader}
            </span>
            <p className="mt-1 text-xs sm:text-sm font-medium text-emerald-950 leading-relaxed border-l-2 border-emerald-600 pl-2.5 italic">
              &ldquo;{verification.clinicalRationale}&rdquo;
            </p>
          </div>

          {/* Safety & Ergonomic Assurances */}
          {verification.safetyAssurances && verification.safetyAssurances.length > 0 && (
            <div className="rounded-2xl border-2 border-black/10 bg-white p-3.5 shadow-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-ink-secondary">
                {t.safetyHeader}
              </span>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {verification.safetyAssurances.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1.5 text-xs font-bold text-ink"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                    <span>{t.safetyAssurances[item] || item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-5 flex items-center justify-between border-t-2 border-black/10 pt-4 gap-2">
          {onOpenEdit && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenEdit();
              }}
              className="btn-tactile flex items-center gap-1.5 rounded-xl border-2 border-black bg-surface-muted px-3 py-2 text-xs font-black text-ink hover:bg-amber-100 cursor-pointer shadow-[2px_2px_0px_#000]"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>{t.editBtn}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="btn-tactile ml-auto rounded-xl border-2 border-black bg-tea px-4 py-2 text-xs font-black text-white hover:bg-emerald-800 cursor-pointer shadow-[2px_2px_0px_#000]"
          >
            {t.closeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
