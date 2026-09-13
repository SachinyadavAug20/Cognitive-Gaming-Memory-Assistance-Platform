"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import {
  Calendar,
  Sparkles,
  Award,
  Footprints,
  Droplet,
  Users,
  Brain,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface MultidomainLifestyleCardProps {
  patientName?: string;
}

interface MultidomainTexts {
  title: string;
  subtitle: string;
  riskBadge: string;
  p1Title: string;
  p1Desc: string;
  p1Completed: string;
  p1Pending: string;
  p2Title: string;
  p2Desc: string;
  p2Completed: string;
  p2Pending: string;
  p3Title: string;
  p3Desc: string;
  p3Completed: string;
  p3Pending: string;
  p4Title: string;
  p4Desc: string;
  p4Completed: string;
  p4Pending: string;
  activeTitle: string;
  activeDesc: string;
  nextBooster: string;
  cadenceStatus: string;
}

const MULTIDOMAIN_I18N: Record<string, MultidomainTexts> = {
  en: {
    title: "Multidomain Lifestyle & ACTIVE Booster Protocol",
    subtitle: "Grounded in the landmark NIH ACTIVE Study (20-year RCT) & LatAm-FINGERS / US POINTER multidomain dementia prevention paradigms.",
    riskBadge: "25% Risk Reduction Cadence",
    p1Title: "1. Cognitive Training",
    p1Desc: "3 serious game sessions weekly (MoCA-mapped memory & visuospatial practice).",
    p1Completed: "Completed Today (35 min)",
    p1Pending: "Pending Today",
    p2Title: "2. Kinesthetic Exergames",
    p2Desc: "Motion plucking & bilateral hand coordination to stimulate motor plasticity.",
    p2Completed: "Completed (Tea Catch 94%)",
    p2Pending: "Pending Today",
    p3Title: "3. Hydration & Diet",
    p3Desc: "6 water milestones + fresh Manimuni pennywort or Lakadong turmeric broth.",
    p3Completed: "Goal Reached (6/6 Cups)",
    p3Pending: "Tap to Mark 6 Cups",
    p4Title: "4. Social & Calm",
    p4Desc: "Family voice notes, nostalgic Bihu folk tunes, and 432 Hz bedtime soundscapes.",
    p4Completed: "Completed (Echoes of Home)",
    p4Pending: "Pending Today",
    activeTitle: "ACTIVE Protocol Longitudinal Booster Milestones",
    activeDesc: "As demonstrated in the 20-year ACTIVE trial, booster reinforcement sessions at systematic intervals maintain neural adaptations and prevent cognitive skill decay over time.",
    nextBooster: "Next Booster: Day 30 Review (In 11 days)",
    cadenceStatus: "Cadence: 100% On-Track",
  },
  as: {
    title: "বহু-ক্ষেত্ৰীয় জীৱনশৈলী আৰু ACTIVE বুষ্টাৰ প্ৰট'কল",
    subtitle: "ঐতিহাসিক NIH ACTIVE অধ্যয়ন (২০ বছৰীয়া RCT) আৰু FINGER ডিমেনচিয়া প্ৰতিৰোধ আৰ্হিৰ ওপৰত প্ৰতিষ্ঠিত।",
    riskBadge: "২৫% বিপদ হ্ৰাস চক্ৰ",
    p1Title: "১. জ্ঞানীয় প্ৰশিক্ষণ",
    p1Desc: "সপ্তাহত ৩টা থেৰাপিউটিক খেল (MoCA-আধাৰিত স্মৃতি আৰু দৃষ্টি-স্থানিক অভ্যাস)।",
    p1Completed: "আজি সম্পূৰ্ণ (৩৫ মিনিট)",
    p1Pending: "আজি বাকী আছে",
    p2Title: "২. শাৰীৰিক গতিশীল খেল",
    p2Desc: "স্নায়ুৰ নমনীয়তাৰ বাবে হাতৰ সমন্বয় আৰু পাত তোলা শাৰীৰিক খেল।",
    p2Completed: "সম্পূৰ্ণ (চাহ পাত তোলা ৯৪%)",
    p2Pending: "আজি বাকী আছে",
    p3Title: "৩. জলপান আৰু পৰম্পৰাগত খাদ্য",
    p3Desc: "৬ গিলাচ পানী + মানিমুনি শাক বা লাকাডং হালধিৰ ঝোল।",
    p3Completed: "লক্ষ্য প্ৰাপ্ত (৬/৬ গিলাচ)",
    p3Pending: "৬ গিলাচ চিহ্নিত কৰিবলৈ টিপক",
    p4Title: "৪. সামাজিক স্মৃতি আৰু শান্তি",
    p4Desc: "পৰিয়ালৰ কণ্ঠস্বৰ বাৰ্তা, পুৰণি বিহুৰ গান আৰু ৪৩২ হাৰ্টজৰ শান্তিময় শব্দ।",
    p4Completed: "সম্পূৰ্ণ (ঘৰৰ অনুৰণন)",
    p4Pending: "আজি বাকী আছে",
    activeTitle: "ACTIVE প্ৰট'কলৰ দীৰ্ঘম্যাদী বুষ্টাৰ লক্ষ্য",
    activeDesc: "২০ বছৰীয়া ACTIVE পৰীক্ষাত প্ৰমাণিত হোৱাৰ দৰে, নিয়মীয়া ব্যৱধানত বুষ্টাৰ সেশনে স্নায়ৱিক ক্ষমতা বাহাল ৰাখে।",
    nextBooster: "পৰৱৰ্তী বুষ্টাৰ: ৩০ দিনৰ পৰ্যালোচনা (১১ দিনত)",
    cadenceStatus: "গতিবিধি: ১০০% সঠিক পথত",
  },
  hi: {
    title: "बहु-क्षेत्रीय जीवनशैली एवं ACTIVE बूस्टर प्रोटोकॉल",
    subtitle: "ऐतिहासिक NIH ACTIVE अध्ययन (20-वर्षीय RCT) एवं FINGER डिमेंशिया रोकथाम मॉडल पर आधारित।",
    riskBadge: "25% जोखिम न्यूनीकरण चक्र",
    p1Title: "1. संज्ञानात्मक प्रशिक्षण",
    p1Desc: "सप्ताह में 3 चिकित्सीय खेल सत्र (MoCA-मानचित्रित स्मृति एवं दृश्य-स्थानिक अभ्यास)।",
    p1Completed: "आज पूर्ण (35 मिनट)",
    p1Pending: "आज लंबित",
    p2Title: "2. गतिज व मोटर खेल",
    p2Desc: "मोटर प्लास्टिसिटी को उत्तेजित करने हेतु द्विपक्षीय हाथ समन्वय व गतिविधि खेल।",
    p2Completed: "पूर्ण (चाय पत्ती पकड़ 94%)",
    p2Pending: "आज लंबित",
    p3Title: "3. जलयोजन एवं पारंपरिक पोषण",
    p3Desc: "6 पानी के मील के पत्थर + ताजा मनिमुनि या लाकाडोंग हल्दी का सूप।",
    p3Completed: "लक्ष्य प्राप्त (6/6 कप)",
    p3Pending: "6 कप चिह्नित करने हेतु टैप करें",
    p4Title: "4. सामाजिक संस्मरण एवं शांति",
    p4Desc: "पारिवारिक वॉइस नोट्स, बिहू लोक धुनें और 432 Hz शांत ध्वनि वातावरण।",
    p4Completed: "पूर्ण (घर की गूंज)",
    p4Pending: "आज लंबित",
    activeTitle: "ACTIVE प्रोटोकॉल अनुदैर्ध्य बूस्टर मील के पत्थर",
    activeDesc: "20-वर्षीय ACTIVE परीक्षण के अनुसार, नियमित बूस्टर सत्र तंत्रिका अनुकूलन बनाए रखते हैं।",
    nextBooster: "अगला बूस्टर: 30 दिवसीय समीक्षा (11 दिनों में)",
    cadenceStatus: "प्रगति: 100% सही राह पर",
  },
  bn: {
    title: "বহু-ডোমেন জীবনধারা ও ACTIVE বুস্টার প্রোটোকল",
    subtitle: "ঐতিহাসিক NIH ACTIVE গবেষণা (২০-বছরের RCT) ও FINGER ডিমেনশিয়া প্রতিরোধ মডেলের ওপর ভিত্তি করে।",
    riskBadge: "২৫% ঝুঁকি হ্রাস চক্র",
    p1Title: "১. জ্ঞানীয় প্রশিক্ষণ",
    p1Desc: "সপ্তাহে ৩টি থেরাপিউটিক গেম (MoCA-ম্যাপ করা স্মৃতি ও দৃষ্টি-স্থানিক অনুশীলন)।",
    p1Completed: "আজ সম্পন্ন (৩৫ মিনিট)",
    p1Pending: "আজ বাকি আছে",
    p2Title: "২. শারীরিক মুভমেন্ট গেম",
    p2Desc: "মোটর প্লাস্টিসিটি উদ্দীপিত করতে দ্বি-পার্শ্বীয় হাতের সমন্বয় ও নাড়াচাড়া।",
    p2Completed: "সম্পন্ন (চা পাতা তোলা ৯৪%)"  ,
    p2Pending: "আজ বাকি আছে",
    p3Title: "৩. জলপান ও ঐতিহ্যবাহী পুষ্টি",
    p3Desc: "৬ গ্লাস জল + মানিমুনি ভেষজ বা লাকাডং হলুদের ঝোল।",
    p3Completed: "লক্ষ্য অর্জিত (৬/৬ গ্লাস)",
    p3Pending: "৬ গ্লাস চিহ্নিত করতে ট্যাপ করুন",
    p4Title: "৪. সামাজিক স্মৃতিচারণ ও প্রশান্তি",
    p4Desc: "পারিবারিক ভয়েস নোট, বিহুর সুর এবং ৪৩২ হার্টজ প্রশান্তিদায়ক সুর।",
    p4Completed: "সম্পন্ন (ঘরের প্রতিধ্বনি)",
    p4Pending: "আজ বাকি আছে",
    activeTitle: "ACTIVE প্রোটোকলের দীর্ঘমেয়াদী বুস্টার মাইলফলক",
    activeDesc: "২০-বছরের ACTIVE পরীক্ষার প্রমাণ অনুযায়ী, নিয়মিত ব্যবধানে বুস্টার সেশন জ্ঞানীয় দক্ষতা ধরে রাখে।",
    nextBooster: "পরবর্তী বুস্টার: ৩০ দিনের পর্যালোচনা (১১ দিনে)",
    cadenceStatus: "গতিবিধি: ১০০% সঠিক পথে",
  },
  mr: {
    title: "बहु-क्षेत्रीय जीवनशैली आणि ACTIVE बूस्टर प्रोटोकॉल",
    subtitle: "ऐतिहासिक NIH ACTIVE अभ्यास (२०-वर्षीय RCT) आणि FINGER डिमेंशिया प्रतिबंध मॉडेलवर आधारित.",
    riskBadge: "२५% धोका निवारण चक्र",
    p1Title: "१. संज्ञानात्मक प्रशिक्षण",
    p1Desc: "आठवड्यातून ३ खेळ सत्रे (MoCA-आधारित स्मृती आणि दृश्य-स्थानिक सराव).",
    p1Completed: "आज पूर्ण (३५ मिनिटे)",
    p1Pending: "आज प्रलंबित",
    p2Title: "२. शारीरिक हालचालींचे खेळ",
    p2Desc: "मेंदूच्या अनुकूलतेसाठी दोन्ही हातांचे संतुलन आणि शारीरिक व्यायाम.",
    p2Completed: "पूर्ण (चहा वेचणे ९४%)",
    p2Pending: "आज प्रलंबित",
    p3Title: "३. जलपान आणि पारंपरिक पोषण",
    p3Desc: "६ ग्लास पाणी + औषधी वनस्पती किंवा हळदीचे सूप.",
    p3Completed: "ध्येय साध्य (६/६ ग्लास)",
    p3Pending: "६ ग्लास चिन्हांकित करण्यासाठी टॅप करा",
    p4Title: "४. सामाजिक आठवणी आणि शांतता",
    p4Desc: "कुटुंबाचे व्हॉइस मेसेज, लोकगीते आणि ४३२ हर्ट्झ शांत संगीत.",
    p4Completed: "पूर्ण (घराच्या आठवणी)",
    p4Pending: "आज प्रलंबित",
    activeTitle: "ACTIVE प्रोटोकॉल दीर्घकालीन बूस्टर टप्पे",
    activeDesc: "२०-वर्षीय ACTIVE अभ्यासानुसार, नियमित बूस्टर सत्रांमुळे मेंदूची क्षमता टिकून राहते.",
    nextBooster: "पुढील बूस्टर: ३० दिवसांचे पुनरावलोकन (११ दिवसांत)",
    cadenceStatus: "प्रगती: १००% योग्य मार्गावर",
  },
  ne: {
    title: "बहु-क्षेत्रीय जीवनशैली र ACTIVE बूस्टर प्रोटोकल",
    subtitle: "ऐतिहासिक NIH ACTIVE अध्ययन (२० वर्षे RCT) र FINGER डिमेन्सिया रोकथाम मोडेलमा आधारित।",
    riskBadge: "२५% जोखिम न्यूनीकरण दर",
    p1Title: "१. संज्ञानात्मक तालिम",
    p1Desc: "हप्तामा ३ खेल सत्र (MoCA-आधारित स्मृति र दृश्य-स्थानिक अभ्यास)।",
    p1Completed: "आज सम्पन्न (३५ मिनेट)",
    p1Pending: "आज बाँकी",
    p2Title: "२. शारीरिक गतिशीलता खेल",
    p2Desc: "हातको सन्तुलन र गतिशीलता बढाउने अभ्यास।",
    p2Completed: "सम्पन्न (चिया टिप्ने ९४%)",
    p2Pending: "आज बाँकी",
    p3Title: "३. जलपान र स्थानीय पोषण",
    p3Desc: "६ गिलास पानी + स्थानीय जडीबुटी वा बेसारको झोल।",
    p3Completed: "लक्ष्य पूरा (६/६ गिलास)",
    p3Pending: "६ गिलास चिह्नित गर्न थिच्नुहोस्",
    p4Title: "४. सामाजिक सम्झना र शान्ति",
    p4Desc: "परिवारको आवाज, लोकधुन र ४३२ हर्जको शान्त ध्वनि।",
    p4Completed: "सम्पन्न (घरको सम्झना)",
    p4Pending: "आज बाँकी",
    activeTitle: "ACTIVE प्रोटोकल दीर्घकालीन बूस्टर चरणहरू",
    activeDesc: "२० वर्षे ACTIVE परीक्षण अनुसार, नियमित बूस्टर सत्रले मानसिक क्षमता जोगाइराख्छ।",
    nextBooster: "अर्को बूस्टर: ३० दिनको समीक्षा (११ दिनमा)",
    cadenceStatus: "प्रगति: १००% सही मार्गमा",
  },
  mni: {
    title: "মখল কয়াগী পুন্সি মহিং অমসুং ACTIVE বুস্তর থৌরাং",
    subtitle: "NIH ACTIVE নৈনবা (চহি ২০গী RCT) অমসুং FINGER ডিমেন্সিয়া থিংবগী মওংদা য়ুম্ফম ওইবা।",
    riskBadge: "২৫% অশোয়বা হন্থহনবগী তাঞ্জা",
    p1Title: "১. ৱাখলগী ত্রেনিং",
    p1Desc: "হপ্তাদা শান্নবা ৩ (MoCA মেমোরী অমসুং উবা খঙবগী প্রাকটিস)।",
    p1Completed: "ঙসি লোইরে (মিনিট ৩৫)",
    p1Pending: "ঙসি ৱাৎলি",
    p2Title: "২. হকচাং চংবা শান্নবা" ,
    p2Desc: "মখুৎ অনিমক শিজিন্নদুনা হকচাংগী ময়েক চুনহনবা শান্নবা।",
    p2Completed: "লোইরে (চা মনা তোল্লি ৯৪%)",
    p2Pending: "ঙসি ৱাৎলি",
    p3Title: "৩. ঈশিং থকপা অমসুং চিঞ্জাক",
    p3Desc: "ঈশিং কাপ ৬ + মনিমুনী শাক নত্রগা য়াংশাং ঈশিং।",
    p3Completed: "পান্দম য়ৌরে (৬/৬ কাপ)",
    p3Pending: "কাপ ৬ তাক্নবা নম্বীয়ু",
    p4Title: "৪. মীগা উনবা অমসুং তোংবা",
    p4Desc: "ইমুংগী খোন্থোক, বিহু ইশৈ অমসুং ৪৩২ হাৰ্টজকী ইংলবা খোন্থোক।",
    p4Completed: "লোইরে (য়ুমগী খোন্থোক)",
    p4Pending: "ঙসি ৱাৎলি",
    activeTitle: "ACTIVE প্রোতোকোলগী তুংগী বুস্তর তাঞ্জা",
    activeDesc: "চহি ২০গী ACTIVE চাংয়েংনা তাকপগুম, মতম মতমগী বুস্তরনা ৱাখলগী শক্তি লৈহনবদা মতেং পাংই।",
    nextBooster: "মথংগী বুস্তর: নুমিৎ ৩০গী য়েংশিনবা (নুমিৎ ১১দা)",
    cadenceStatus: "লমজেল: ১০০% অচুম্বা লাম্বিদা",
  },
  brx: {
    title: "गोबां-मुलुग जिउराहा आरो ACTIVE बुस्टार नेम",
    subtitle: "NIH ACTIVE नायबिजिरनाय (20-सानि RCT) आरो FINGER डिमेन्सिया होबथानाय खान्थिजों गोरोबनाय।",
    riskBadge: "25% खैफोद खम जानाय",
    p1Title: "1. गोसोनि फोरोंथाइ",
    p1Desc: "सप्ताहआव 3 गेलेनाय (MoCA-गोसोखांनाय आरो नोजोरनि सोलोंथाइ)।",
    p1Completed: "दिनै जोबबाय (35 मिनिट)",
    p1Pending: "दिनै थाबाय",
    p2Title: "2. मोदोमनि गेलेनाय",
    p2Desc: "आखाइ मोननैनि गोरोबनाय आरो मोदोमनि हेफाजाब गेलेनाय।",
    p2Completed: "जोबबाय (साहा बिलाइ हमनाय 94%)",
    p2Pending: "दिनै थाबाय",
    p3Title: "3. दै लोंनाय आरो मुलि जानाय",
    p3Desc: "6 कप दै + मनिमूनि एबा हासिं हालदै ओंखाम-दै।",
    p3Completed: "थांखि मोनबाय (6/6 कप)",
    p3Pending: "6 कप थिनो थाखाय थु",
    p4Title: "4. नख'रनि गोसोखां आरो गोजोन",
    p4Desc: "नख'रनि राव, बिहु मेथाइ आरो 432 Hz गोजोन सोदोब।",
    p4Completed: "जोबबाय (न'नि गोसोखां)",
    p4Pending: "दिनै थाबाय",
    activeTitle: "ACTIVE बिखान्थिनि बुस्टार थांखिफोर",
    activeDesc: "20-बोसोरनि ACTIVE आनजाद बादियै, सम सम बुस्टार सिसना गोसोनि गोहोखौ गोजोनै लाखियो।",
    nextBooster: "उननि बुस्टार: 30 साननि बिजिरनाय (11 सान उनाव)",
    cadenceStatus: "थासारि: 100% थार लामायाव",
  },
  grt: {
    title: "Multidomain Janggi Tangani aro ACTIVE Booster Protocol",
    subtitle: "NIH ACTIVE Study (20-year RCT) aro FINGER dementia champengani niamrango pangchaka.",
    riskBadge: "25% Kenani Komiatani",
    p1Title: "1. Gisikni Training",
    p1Desc: "Antio chang 3 kal∙ani (MoCA gisik ra∙ani skani).",
    p1Completed: "Da∙al Matchotaha (minit 35)",
    p1Pending: "Da∙al Dingtangenga",
    p2Title: "2. Jak aro Ja∙ani Kal∙anirang",
    p2Desc: "Jak ge∙gniko jakkalanichi motor plasticity-ko barina dakchakani.",
    p2Completed: "Matchotaha (Cha∙bijak Rim∙ani 94%)",
    p2Pending: "Da∙al Dingtangenga",
    p3Title: "3. Chi Ringani aro Sam-Jakkalani",
    p3Desc: "Chi glass 6 + sam aro haldi ringani.",
    p3Completed: "Chu∙sokaha (Glass 6/6)",
    p3Pending: "Glass 6-na nangatbo",
    p4Title: "4. Nokdangni Gisik Ra∙ani aro Tom∙tomani",
    p4Desc: "Nokdangni ku∙rang, git aro 432 Hz tom∙tomani gam∙anirang.",
    p4Completed: "Matchotaha (Nokni Gam∙ani)",
    p4Pending: "Da∙al Dingtangenga",
    activeTitle: "ACTIVE Protocol Booster Milestones",
    activeDesc: "Bilsi 20-ni ACTIVE trial gita, somoio booster session-rang gisikni bilko rakkia.",
    nextBooster: "Ja∙mano Booster: Sal 30 Review (Sal 11-o)",
    cadenceStatus: "Status: 100% Rama Kakketo",
  },
  kha: {
    title: "Rukom Im Bapher bad ACTIVE Booster Protocol",
    subtitle: "Seng halor ka jingpule NIH ACTIVE (20 snem RCT) bad FINGER ban iada na ka dementia.",
    riskBadge: "25% Jingpynduna Jingma",
    p1Title: "1. Jinghikai Jingmut",
    p1Desc: "3 sien shitaiew ki jingialehkai (MoCA jingkynmaw bad jingiohi).",
    p1Completed: "La Dep Mynta (35 min)",
    p1Pending: "Dang Sah Mynta",
    p2Title: "2. Jingkhih Kti bad Kjat",
    p2Desc: "Jingpynkhih ia ki kti ban pynkhlain ia ka bor jingmut.",
    p2Completed: "La Dep (Kheit Sha 94%)",
    p2Pending: "Dang Sah Mynta",
    p3Title: "3. Jingdih Um bad Bam Tynrai",
    p3Desc: "6 mok ka um + Manimuni lane sying Lakadong.",
    p3Completed: "La Kot Thong (6/6 Mok)",
    p3Pending: "Khad ban thoh 6 mok",
    p4Title: "4. Jingiasylla bad Suk Jingmut",
    p4Desc: "Ki sur kur-kha, ki jingrwai Bihu bad ki sur 432 Hz ban pynsngewbha.",
    p4Completed: "La Dep (Jingsawa na Iing)",
    p4Pending: "Dang Sah Mynta",
    activeTitle: "Ki Thong Booster ACTIVE Protocol",
    activeDesc: "Kumba la pyni ha ka 20 snem ACTIVE trial, ki booster session ki pynneh ia ka bor jingmut.",
    nextBooster: "Booster ba Bud: Jingpeit biang ha ka sngi 30 (Hadien 11 sngi)",
    cadenceStatus: "Jingiaid: 100% Thikna",
  },
  lus: {
    title: "Nundan Hrang Thlunzawm leh ACTIVE Booster Protocol",
    subtitle: "NIH ACTIVE Study (kum 20 RCT) leh FINGER dementia venhimna atanga lak a ni.",
    riskBadge: "25% Harsatna Tihniamtu",
    p1Title: "1. Hriatna Tichak Zirtirna",
    p1Desc: "Kar khatah vawi 3 infiamna (MoCA hriatrengna leh thil thlir thiamna).",
    p1Completed: "Vawiin atan Zo Ta (35 min)",
    p1Pending: "Vawiin atan Tih Tur La Awm",
    p2Title: "2. Taksa Chet Zirtirna",
    p2Desc: "Kut pahnih chet rual thiamna leh taksa chakna tura infiamna.",
    p2Completed: "Zo Ta (Thingpui Hnah Lo 94%)",
    p2Pending: "Vawiin atan Tih Tur La Awm",
    p3Title: "3. Tui In leh Chaw Hrisel",
    p3Desc: "Tui no 6 in + hnahhring leh aieng tui hrisel.",
    p3Completed: "Thleng Ta (No 6/6)",
    p3Pending: "No 6 chhinchhiah nan hmet rawh",
    p4Title: "4. Chhungte Hriatreng leh Rilru Hahdam",
    p4Desc: "Chhungte aw, hla mawi leh 432 Hz thawm ralmuang.",
    p4Completed: "Zo Ta (In Lam Thawm)",
    p4Pending: "Vawiin atan Tih Tur La Awm",
    activeTitle: "ACTIVE Protocol Booster Hriattirnate",
    activeDesc: "Kum 20 ACTIVE trial tarlan ang hian, booster session-te hian hriatna tichak reng turin a pui a ni.",
    nextBooster: "Booster Dawttu: Ni 30 Endikna (Ni 11 hnuah)",
    cadenceStatus: "Kallam: 100% Dik Thlap",
  },
};

export function MultidomainLifestyleCard({
  patientName = "Patient",
}: MultidomainLifestyleCardProps) {
  const locale = useLocale();
  const t = MULTIDOMAIN_I18N[locale] || MULTIDOMAIN_I18N.en;

  const [completedPillars, setCompletedPillars] = useState<Record<string, boolean>>({
    cognitive: true,
    kinesthetic: true,
    nutrition: false,
    social: true,
  });

  const togglePillar = (key: string) => {
    setCompletedPillars((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="rounded-3xl border-4 border-black bg-surface p-5 sm:p-6 shadow-[6px_6px_0px_#000]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-black/15 pb-4 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-tea" />
            <h2 className="font-serif text-xl sm:text-2xl font-black text-ink">
              {t.title}
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-ink-secondary mt-1">
            {t.subtitle}
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-amber-200 px-3 py-1 text-xs font-black uppercase text-amber-950 shadow-xs">
          <Award className="h-4 w-4" />
          <span>{t.riskBadge}</span>
        </div>
      </div>

      {/* 4 Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {/* Pillar 1: Cognitive Training */}
        <div
          onClick={() => togglePillar("cognitive")}
          className={`cursor-pointer rounded-2xl border-3 border-black p-4 transition-all shadow-[3px_3px_0px_#000] flex flex-col justify-between ${
            completedPillars.cognitive ? "bg-teal-900 text-white" : "bg-white text-ink"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-teal-200 text-teal-950 font-black">
                <Brain className="h-5 w-5" />
              </span>
              <CheckCircle2
                className={`h-5 w-5 ${
                  completedPillars.cognitive ? "text-emerald-400" : "text-black/25"
                }`}
              />
            </div>
            <h3 className="font-serif text-base font-black">
              {t.p1Title}
            </h3>
            <p className="mt-1 text-xs font-medium opacity-90 leading-relaxed">
              {t.p1Desc}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-current/20 text-[11px] font-bold">
            {completedPillars.cognitive ? t.p1Completed : t.p1Pending}
          </div>
        </div>

        {/* Pillar 2: Kinesthetic & Motor Exergaming */}
        <div
          onClick={() => togglePillar("kinesthetic")}
          className={`cursor-pointer rounded-2xl border-3 border-black p-4 transition-all shadow-[3px_3px_0px_#000] flex flex-col justify-between ${
            completedPillars.kinesthetic ? "bg-emerald-900 text-white" : "bg-white text-ink"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-emerald-200 text-emerald-950 font-black">
                <Footprints className="h-5 w-5" />
              </span>
              <CheckCircle2
                className={`h-5 w-5 ${
                  completedPillars.kinesthetic ? "text-emerald-400" : "text-black/25"
                }`}
              />
            </div>
            <h3 className="font-serif text-base font-black">
              {t.p2Title}
            </h3>
            <p className="mt-1 text-xs font-medium opacity-90 leading-relaxed">
              {t.p2Desc}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-current/20 text-[11px] font-bold">
            {completedPillars.kinesthetic ? t.p2Completed : t.p2Pending}
          </div>
        </div>

        {/* Pillar 3: Hydration & Ethnobotanical Nutrition */}
        <div
          onClick={() => togglePillar("nutrition")}
          className={`cursor-pointer rounded-2xl border-3 border-black p-4 transition-all shadow-[3px_3px_0px_#000] flex flex-col justify-between ${
            completedPillars.nutrition ? "bg-cyan-900 text-white" : "bg-white text-ink"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-cyan-200 text-cyan-950 font-black">
                <Droplet className="h-5 w-5" />
              </span>
              <CheckCircle2
                className={`h-5 w-5 ${
                  completedPillars.nutrition ? "text-emerald-400" : "text-black/25"
                }`}
              />
            </div>
            <h3 className="font-serif text-base font-black">
              {t.p3Title}
            </h3>
            <p className="mt-1 text-xs font-medium opacity-90 leading-relaxed">
              {t.p3Desc}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-current/20 text-[11px] font-bold">
            {completedPillars.nutrition ? t.p3Completed : t.p3Pending}
          </div>
        </div>

        {/* Pillar 4: Social Reminiscence & Calm */}
        <div
          onClick={() => togglePillar("social")}
          className={`cursor-pointer rounded-2xl border-3 border-black p-4 transition-all shadow-[3px_3px_0px_#000] flex flex-col justify-between ${
            completedPillars.social ? "bg-purple-900 text-white" : "bg-white text-ink"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-purple-200 text-purple-950 font-black">
                <Users className="h-5 w-5" />
              </span>
              <CheckCircle2
                className={`h-5 w-5 ${
                  completedPillars.social ? "text-emerald-400" : "text-black/25"
                }`}
              />
            </div>
            <h3 className="font-serif text-base font-black">
              {t.p4Title}
            </h3>
            <p className="mt-1 text-xs font-medium opacity-90 leading-relaxed">
              {t.p4Desc}
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-current/20 text-[11px] font-bold">
            {completedPillars.social ? t.p4Completed : t.p4Pending}
          </div>
        </div>
      </div>

      {/* ACTIVE Study Booster Cadence Tracker */}
      <div className="rounded-2xl border-2 border-black/20 bg-[#FAF6F0] p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-amber-700" />
            <span className="text-xs font-black uppercase tracking-wider text-ink">
              {t.activeTitle}
            </span>
          </div>
          <p className="text-xs font-medium text-ink-secondary max-w-xl">
            {t.activeDesc}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-1.5 text-xs font-black text-ink shadow-xs">
            <Clock className="h-3.5 w-3.5 text-tea" />
            <span>{t.nextBooster}</span>
          </div>
          <span className="rounded-xl border-2 border-black bg-tea px-3 py-1.5 text-xs font-black text-white shadow-xs">
            {t.cadenceStatus}
          </span>
        </div>
      </div>
    </div>
  );
}
