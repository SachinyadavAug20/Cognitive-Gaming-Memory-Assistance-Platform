"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  Droplets,
  Pill,
  Image as ImageIcon,
  Volume2,
  CalendarCheck,
  Plus,
  Minus,
  Sparkles,
} from "lucide-react";
import { useLocale } from "next-intl";
import { playTapFeedback, playCorrect, playWaterRipple, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";

interface DailyRoutineScheduleProps {
  langCode: string;
  rate: number;
}

interface RoutineTranslations {
  title: string;
  subtitle: string;
  listenAll: string;
  listen: string;
  // Medicine
  medTag: string;
  medTitle: string;
  medDetail: string;
  medTaken: string;
  medTapTake: string;
  medSpoken: string;
  // Hydration
  waterTag: string;
  waterTitle: string;
  waterDetail: string;
  waterGoal: string;
  waterGoalDone: string;
  waterGlasses: string;
  waterDrinkBtn: string;
  waterSpoken: string;
  // Daily Activity
  actTag: string;
  actTitle: string;
  actDetail: string;
  actDone: string;
  actTapDo: string;
  actSpoken: string;
  // Appointment
  aptTag: string;
  aptTitle: string;
  aptDetail: string;
  aptVisited: string;
  aptScheduled: string;
  aptMarkVisited: string;
  aptSpoken: string;
  allSpoken: string;
}

const ROUTINE_DATA: Record<string, RoutineTranslations> = {
  en: {
    title: "Today's Daily Routine",
    subtitle: "Simple, easy reminders for your comfort & health",
    listenAll: "Read Routine for Me",
    listen: "Read for Me",
    medTag: "Medicines",
    medTitle: "Morning Medicine (BP & Vitamin)",
    medDetail: "8:00 AM • 1 Pill with warm water after breakfast",
    medTaken: "✓ Taken at 8:00 AM",
    medTapTake: "Take Medicine • Tap when taken",
    medSpoken: "It is time for your morning medicine. Please take 1 BP and vitamin pill with warm water after breakfast.",
    waterTag: "Hydration",
    waterTitle: "Drink Fresh Water",
    waterDetail: "Daily Goal: 6 glasses of clean water",
    waterGoal: "of 6 glasses ({pct}%)",
    waterGoalDone: "✓ Daily Goal Reached!",
    waterGlasses: "{n} of 6 Glasses",
    waterDrinkBtn: "Drink 1 Glass",
    waterSpoken: "Stay hydrated. You have had {glasses} of 6 glasses of fresh water today. Please drink a glass now.",
    actTag: "Daily Activity",
    actTitle: "Family Photos & Reminiscence",
    actDetail: "11:00 AM • Look at cherished memories with Sunita",
    actDone: "✓ Activity Completed",
    actTapDo: "Family Album • Tap when done",
    actSpoken: "At 11:00 AM, spend a few peaceful minutes looking through your family photos and memories with Sunita.",
    aptTag: "Medical Appointment",
    aptTitle: "Doctor's Visit (Dispur PHC)",
    aptDetail: "2:30 PM • Routine check-up with Dr. B. K. Sarma",
    aptVisited: "✓ Clinic Visit Completed",
    aptScheduled: "2:30 PM • ASHA Notified",
    aptMarkVisited: "Mark as Visited",
    aptSpoken: "You have an appointment today at 2:30 PM at Dispur PHC Health Center with Dr. B. K. Sarma. Your daughter Sunita and the local nurse are notified.",
    allSpoken: "Today's Routine. 1: Morning medicine taken with water. 2: Stay hydrated with fresh water. 3: Family memory activity at 11:00 AM. 4: Doctor visit at 2:30 PM at Dispur PHC.",
  },
  as: {
    title: "আজিৰ দৈনিক নিয়মসূচী",
    subtitle: "আপোনাৰ আৰাম আৰু স্বাস্থ্যৰ বাবে সহজ সোঁৱৰণি",
    listenAll: "মোক নিয়মসূচী পঢ়ি শুনাওক",
    listen: "মোক পঢ়ি শুনাওক",
    medTag: "ঔষধ",
    medTitle: "ৰাতিপুৱাৰ ঔষধ (বিপি আৰু ভিটামিন)",
    medDetail: "পুৱা ৮:০০ বজাত • আহাৰৰ পিছত ১ টা বড়ি পানীৰে খাব",
    medTaken: "✓ পুৱা ৮ বজাত খোৱা হ'ল",
    medTapTake: "ঔষধ খাওক • খোৱাৰ পিছত স্পৰ্শ কৰক",
    medSpoken: "ৰাতিপুৱাৰ ঔষধ খোৱাৰ সময় হ'ল। অনুগ্ৰহ কৰি ১ টা ঔষধৰ বড়ি কুহুমীয়া পানীৰে খাওক।",
    waterTag: "পানীৰ পৰিমাণ",
    waterTitle: "পৰিষ্কাৰ পানী খাওক",
    waterDetail: "দৈনিক লক্ষ্য: ৬ গিলাচ পৰিষ্কাৰ পানী",
    waterGoal: "৬ গিলাচৰ ({pct}%)",
    waterGoalDone: "✓ আজিৰ লক্ষ্য সম্পূৰ্ণ!",
    waterGlasses: "৬ গিলাচৰ {n} গিলাচ",
    waterDrinkBtn: "১ গিলাচ পানী",
    waterSpoken: "পানী খাবলৈ নাপাহৰিব। আজি আপুনি ৬ গিলাচৰ ভিতৰত {glasses} গিলাচ পানী খাইছে।",
    actTag: "দৈনিক কাৰ্য্য",
    actTitle: "পৰিয়ালৰ স্মৃতি আৰু পুৰণি ফটো",
    actDetail: "পুৱা ১১:০০ বজাত • সুনীতাৰ সৈতে পৰিয়ালৰ স্মৃতি উপভোগ কৰক",
    actDone: "✓ কামটো সম্পূৰ্ণ হ'ল",
    actTapDo: "ফটো চাওক • হোৱাৰ পিছত স্পৰ্শ কৰক",
    actSpoken: "পুৱা ১১ বজাত সুনীতাৰ সৈতে পৰিয়ালৰ পুৰণি ফটোবোৰ চাওক আৰু আনন্দ উপভোগ কৰক।",
    aptTag: "স্বাস্থ্য পৰীক্ষা",
    aptTitle: "ডাক্তৰৰ সাক্ষাৎকাৰ (দিছপুৰ পিএইচচি)",
    aptDetail: "দুপৰীয়া ২:৩০ বজাত • ডাঃ বি কে শৰ্মাৰ সৈতে ৰুটিন পৰীক্ষা",
    aptVisited: "✓ ডাক্তৰক দেখুওৱা হ'ল",
    aptScheduled: "দুপৰীয়া ২:৩০ বজাত • আশা কৰ্মী জ্ঞাত",
    aptMarkVisited: "সম্পন্ন বুলি চিহ্নিত কৰক",
    aptSpoken: "আজি দুপৰীয়া ২:৩০ বজাত দিছপুৰ প্ৰাথমিক স্বাস্থ্য কেন্দ্ৰত ডাঃ বি কে শৰ্মাৰ সৈতে আপোনাৰ স্বাস্থ্য পৰীক্ষা আছে।",
    allSpoken: "আজিৰ দিনচৰ্যা। প্ৰথমতে, পুৱাৰ ঔষধ পানীৰে খাব। দ্বিতীয়তে, দিনটোত ৬ গিলাচ পানী খাব। তৃতীয়তে, ১১ বজাত পুৰণি ফটো চাওক। চতুৰ্থতে, দুপৰীয়া ২:৩০ বজাত দিছপুৰ স্বাস্থ্য কেন্দ্ৰলৈ যাব।",
  },
  hi: {
    title: "आज की दैनिक दिनचर्या",
    subtitle: "आपके स्वास्थ्य और सुविधा के लिए सरल अनुस्मारक",
    listenAll: "मुझे दिनचर्या पढ़कर सुनाएं",
    listen: "मुझे पढ़कर सुनाएं",
    medTag: "दवाई",
    medTitle: "सुबह की दवाई (बीपी और विटामिन)",
    medDetail: "सुबह 8:00 बजे • नाश्ते के बाद 1 गोली पानी के साथ",
    medTaken: "✓ सुबह 8:00 बजे ले ली गई",
    medTapTake: "दवाई लें • लेने के बाद टैप करें",
    medSpoken: "सुबह की दवाई का समय हो गया है। कृपया नाश्ते के बाद 1 गोली गुनगुने पानी के साथ लें।",
    waterTag: "जल सेवन",
    waterTitle: "ताज़ा पानी पिएं",
    waterDetail: "दैनिक लक्ष्य: दिन में 6 गिलास साफ़ पानी",
    waterGoal: "6 गिलास में से ({pct}%)",
    waterGoalDone: "✓ आज का लक्ष्य पूरा हुआ!",
    waterGlasses: "6 में से {n} गिलास",
    waterDrinkBtn: "1 गिलास पानी",
    waterSpoken: "पर्याप्त पानी पिएं। आज आपने 6 में से {glasses} गिलास पानी पिया है। एक गिलास पानी अभी पिएं।",
    actTag: "दैनिक गतिविधि",
    actTitle: "परिवार की यादें और पुरानी तस्वीरें",
    actDetail: "सुबह 11:00 बजे • बेटी सुनीता के साथ पारिवारिक यादें देखें",
    actDone: "✓ गतिविधि पूरी हुई",
    actTapDo: "तस्वीरें देखें • पूरा होने पर टैप करें",
    actSpoken: "सुबह 11:00 बजे बेटी सुनीता के साथ बैठकर परिवार के पुराने फोटो और खूबसूरत यादें देखें।",
    aptTag: "चिकित्सक परामर्श",
    aptTitle: "डॉक्टर से मुलाकात (दिसपुर पीएचसी)",
    aptDetail: "दोपहर 2:30 बजे • डॉ. बी. के. शर्मा के साथ नियमित जांच",
    aptVisited: "✓ अस्पताल की जांच पूरी हुई",
    aptScheduled: "दोपहर 2:30 बजे • आशा कार्यकर्ता सूचित",
    aptMarkVisited: "जांच पूरी हुई",
    aptSpoken: "दोपहर 2:30 बजे दिसपुर स्वास्थ्य केंद्र में डॉ. बी. के. शर्मा के साथ आपकी जांच निर्धारित है।",
    allSpoken: "आज की दिनचर्या। 1: सुबह 8:00 बजे दवाई लें। 2: दिन भर में 6 गिलास पानी पिएं। 3: 11:00 बजे पुरानी तस्वीरें देखें। 4: दोपहर 2:30 बजे दिसपुर स्वास्थ्य केंद्र में डॉक्टर से मिलें।",
  },
  bn: {
    title: "আজকের দৈনন্দিন রুটিন",
    subtitle: "আপনার স্বাস্থ্য ও স্বাচ্ছন্দ্যের জন্য সহজ অনুস্মারক",
    listenAll: "আমাকে রুটিন পড়ে শোনান",
    listen: "আমাকে পড়ে শোনান",
    medTag: "ওষুধ",
    medTitle: "সকালের ওষুধ (বিপি ও ভিটামিন)",
    medDetail: "সকাল ৮:০০ টায় • নাস্তার পর ১টি ওষুধ জলের সাথে",
    medTaken: "✓ সকাল ৮:০০ টায় নেওয়া হয়েছে",
    medTapTake: "ওষুধ নিন • নেওয়ার পর ট্যাপ করুন",
    medSpoken: "সকালের ওষুধ খাওয়ার সময় হয়েছে। অনুগ্রহ করে নাস্তার পর ১টি ওষুধ জলের সাথে নিন।",
    waterTag: "জল পান",
    waterTitle: "তাজা জল পান করুন",
    waterDetail: "দৈনিক লক্ষ্য: দিনে ৬ গ্লাস পরিষ্কার জল",
    waterGoal: "৬ গ্লাসের মধ্যে ({pct}%)",
    waterGoalDone: "✓ আজকের লক্ষ্য সম্পন্ন!",
    waterGlasses: "৬ গ্লাসের {n} গ্লাস",
    waterDrinkBtn: "১ গ্লাস জল",
    waterSpoken: "পর্যাপ্ত জল পান করুন। আজ আপনি ৬ গ্লাসের মধ্যে {glasses} গ্লাস জল খেয়েছেন।",
    actTag: "দৈনিক কার্যকলাপ",
    actTitle: "পারিবারিক স্মৃতি ও পুরনো ছবি",
    actDetail: "বেলা ১১:০০ টায় • মেয়ে সুনীতার সাথে মধুর স্মৃতি স্মরণ",
    actDone: "✓ কার্যকলাপ সম্পন্ন",
    actTapDo: "ছবি দেখুন • সম্পন্ন হলে ট্যাপ করুন",
    actSpoken: "বেলা ১১:০০ টায় মেয়ে সুনীতার সাথে পরিবারের পুরনো ছবি ও সুন্দর স্মৃতিগুলো দেখুন।",
    aptTag: "ডাক্তারের পরামর্শ",
    aptTitle: "ডাক্তারের সাথে সাক্ষাৎ (দিসপুর পিএইচসি)",
    aptDetail: "দুপুর ২:৩০ টায় • ডাঃ বি কে শর্মার সাথে রুটিন চেকআপ",
    aptVisited: "✓ হাসপাতালে দেখা হয়েছে",
    aptScheduled: "দুপুর ২:৩০ টায় • আশা কর্মী অবহিত",
    aptMarkVisited: "দেখা হয়েছে চিহ্নিত করুন",
    aptSpoken: "দুপুর ২:৩০ টায় দিসপুর প্রাথমিক স্বাস্থ্য কেন্দ্রে ডাঃ বি কে শর্মার সাথে আপনার চেকআপ নির্ধারিত আছে।",
    allSpoken: "আজকের রুটিন। ১: সকাল ৮:০০ টায় ওষুধ খান। ২: দিনে ৬ গ্লাস জল পান করুন। ৩: বেলা ১১:০০ টায় পুরনো ছবি দেখুন। ৪: দুপুর ২:৩০ টায় দিসপুর স্বাস্থ্য কেন্দ্রে ডাক্তার দেখান।",
  },
  mr: {
    title: "आजची दैनंदिन दिनचर्या",
    subtitle: "तुमच्या आरोग्यासाठी सोप्या आठवणी",
    listenAll: "मला दिनचर्या वाचून दाखवा",
    listen: "मला वाचून दाखवा",
    medTag: "औषध",
    medTitle: "सकाळचे औषध (बीपी व जीवनसत्त्व)",
    medDetail: "सकाळी ८:०० वाजता • नाष्ट्यानंतर १ गोळी पाण्यासोबत",
    medTaken: "✓ सकाळी ८:०० वाजता घेतले",
    medTapTake: "औषध घ्या • घेतल्यावर टॅप करा",
    medSpoken: "सकाळचे औषध घेण्याची वेळ झाली आहे. कृपया १ गोळी पाण्यासोबत घ्या.",
    waterTag: "पाणी पिणे",
    waterTitle: "ताजे पाणी प्या",
    waterDetail: "दररोजचे उद्दिष्ट: ६ ग्लास स्वच्छ पाणी",
    waterGoal: "६ ग्लासपैकी ({pct}%)",
    waterGoalDone: "✓ उद्दिष्ट पूर्ण झाले!",
    waterGlasses: "६ पैकी {n} ग्लास",
    waterDrinkBtn: "१ ग्लास पाणी",
    waterSpoken: "पाणी प्यायला विसरू नका. आज तुम्ही {glasses} ग्लास पाणी प्यायले आहे.",
    actTag: "दैनंदिन कृती",
    actTitle: "कुटुंबाचे फोटो आणि आठवणी",
    actDetail: "सकाळी ११:०० वाजता • सुनीतासोबत जुन्या आठवणी",
    actDone: "✓ कृती पूर्ण झाली",
    actTapDo: "फोटो पहा • झाल्यावर टॅप करा",
    actSpoken: "सकाळी ११:०० वाजता कुटुंबाचे जुने फोटो पहा आणि आनंद घ्या.",
    aptTag: "डॉक्टरांची भेट",
    aptTitle: "डॉक्टरांची भेट (दिसपूर पीएचसी)",
    aptDetail: "दुपारी २:३० वाजता • डॉ. बी. के. शर्मा यांच्याकडे तपासणी",
    aptVisited: "✓ तपासणी झाली",
    aptScheduled: "दुपारी २:३० वाजता • आशा सेविका सूचित",
    aptMarkVisited: "झाले म्हणून खूण करा",
    aptSpoken: "दुपारी २:३० वाजता दिसपूर आरोग्य केंद्रात डॉ. शर्मा यांच्याशी भेट आहे.",
    allSpoken: "आजची दिनचर्या. औषध घ्या, पाणी प्या, फोटो पहा, आणि दुपारी डॉक्टरांना भेटा.",
  },
  ne: {
    title: "आजको दैनिक दिनचर्या",
    subtitle: "तपाईंको स्वास्थ्य र सहजताका लागि सरल सम्झनाहरू",
    listenAll: "मलाई दिनचर्या पढेर सुनाउनुहोस्",
    listen: "मलाई पढेर सुनाउनुहोस्",
    medTag: "औषधि",
    medTitle: "बिहानको औषधि (बीपी र भिटामिन)",
    medDetail: "बिहान ८:०० बजे • खाजा खाएपछि १ चक्की पानीसँग",
    medTaken: "✓ बिहान ८:०० बजे लिइयो",
    medTapTake: "औषधि लिनुहोस् • लिएपछि ट्याप गर्नुहोस्",
    medSpoken: "बिहानको औषधि खाने समय भयो। कृपया १ चक्की पानीसँग लिनुहोस्।",
    waterTag: "पानी पिउने",
    waterTitle: "ताजा पानी पिउनुहोस्",
    waterDetail: "दैनिक लक्ष्य: दिनमा ६ गिलास सफा पानी",
    waterGoal: "६ गिलासमा ({pct}%)",
    waterGoalDone: "✓ आजको लक्ष्य पूरा भयो!",
    waterGlasses: "६ मध्ये {n} गिलास",
    waterDrinkBtn: "१ गिलास पानी",
    waterSpoken: "ताजा पानी पिउनुहोस्। आज तपाईंले {glasses} गिलास पानी पिउनुभएको छ।",
    actTag: "दैनिक गतिविधि",
    actTitle: "परिवारका तस्बिर र पुराना सम्झना",
    actDetail: "बिहान ११:०० बजे • सुनितासँग पुराना तस्बिर हेर्नुहोस्",
    actDone: "✓ गतिविधि पूरा भयो",
    actTapDo: "तस्बिर हेर्नुहोस् • पूरा भएपछि ट्याप गर्नुहोस्",
    actSpoken: "बिहान ११:०० बजे छोरी सुनितासँग बसेर परिवारका पुराना तस्बिरहरू हेर्नुहोस्।",
    aptTag: "चिकित्सक भेट",
    aptTitle: "डाक्टरको भेट (दिसपुर पीएचसी)",
    aptDetail: "दिउँसो २:३० बजे • डा. बी. के. शर्मासँग नियमित जाँच",
    aptVisited: "✓ जाँच सम्पन्न भयो",
    aptScheduled: "दिउँसो २:३० बजे • आशा कार्यकर्ता सूचित",
    aptMarkVisited: "सम्पन्न भएको चिन्ह लगाउनुहोस्",
    aptSpoken: "दिउँसो २:३० बजे दिसपुर स्वास्थ्य केन्द्रमा डा. शर्मासँग तपाईंको जाँच छ।",
    allSpoken: "आजको दिनचर्या। बिहान औषधि खानुहोस्, पानी पिउनुहोस्, तस्बिर हेर्नुहोस् र डाक्टरलाई भेट्नुहोस्।",
  },
  mni: {
    title: "ঙসিগী নুমিৎ খুদিংগী থবক",
    subtitle: "নহাক্কী হকচাংগীদমক লাইবা পাউতাকশিং",
    listenAll: "ঐহাকপু রুটিন পাথম্বীয়ু",
    listen: "ঐহাকপু পাথম্বীয়ু",
    medTag: "হিদাক",
    medTitle: "অয়ুক্কী হিদাক (বিপি অমসুং ভিটামিন)",
    medDetail: "অয়ুক পুং ৮:০০ দা • চা চাবা মতুংদা হিদাক ১",
    medTaken: "✓ পুং ৮ দা চারে",
    medTapTake: "হিদাক চাবীয়ু • চারগা নম্বীয়ু",
    medSpoken: "অয়ুক্কী হিদাক চাবা মতম ওইরে। ঈশিংগা পুন্না হিদাক ১ চাবীয়ু।",
    waterTag: "ঈশিং থকপা",
    waterTitle: "অশেংবা ঈশিং থকপীয়ু",
    waterDetail: "নুমিৎ অমগী পান্দম: গ্লাস ৬",
    waterGoal: "গ্লাস ৬ গী মনুংদা ({pct}%)",
    waterGoalDone: "✓ ঙসিগী পান্দম শুখ্রে!",
    waterGlasses: "গ্লাস ৬ গী মনুংদা {n}",
    waterDrinkBtn: "ঈশিং গ্লাস ১",
    waterSpoken: "ঈশিং থকপীয়ু। ঙসি নহাক্না গ্লাস {glasses} থকখ্রে।",
    actTag: "নুমিৎ খুদিংগী থবক",
    actTitle: "ইমুংগী ফোতো অমসুং নিংশিংবা",
    actDetail: "অয়ুক পুং ১১:০০ দা • সুনীতাগা লোয়ননা ফোতো য়েংবীয়ু",
    actDone: "✓ লোইরে",
    actTapDo: "ফোতো য়েংবীয়ু",
    actSpoken: "অয়ুক পুং ১১ দা সুনীতাগা লোয়ননা ইমুংগী ফোতো য়েংবীয়ু।",
    aptTag: "দোক্তর উনবা",
    aptTitle: "দোক্তরদা য়েংশিনবা (দিসপুর পিএইচসি)",
    aptDetail: "নুমিদাংৱাই পুং ২:৩০ দা • ডাঃ বি কে শৰ্মা",
    aptVisited: "✓ দোক্তরদা য়েংখ্রে",
    aptScheduled: "পুং ২:৩০ দা • আশা ৱার্করদা পাউ পীখ্রে",
    aptMarkVisited: "য়েংখ্রে হায়না নম্বীয়ু",
    aptSpoken: "নুমিদাংৱাই পুং ২:৩০ দা দিসপুর হকশেল য়াওলদা দোক্তর শৰ্মাগা উনগনি।",
    allSpoken: "ঙসিগী থবকশিং। হিদাক চাবীয়ু, ঈশিং থকপীয়ু, ফোতো য়েংবীয়ু অমসুং দোক্তর উনবীয়ু।",
  },
  brx: {
    title: "दिनैनि सानफ्रोमबोनि बिथांखि",
    subtitle: "नोंनि देहानि थाखाय गोरलै गोसोखां होनाय",
    listenAll: "आंनो बिथांखि फरायना खोनथा",
    listen: "आंनो फरायना खोनथा",
    medTag: "मुलि",
    medTitle: "फुंनि मुलि (बिपी आरो भिटामिन)",
    medDetail: "फुंनि 8:00 रिंगायाव • 1 दाना मुलि दैजों जा",
    medTaken: "✓ 8:00 रिंगायाव जाबाय",
    medTapTake: "मुलि जा • जानानै नांगौ",
    medSpoken: "फुंनि मुलि जानो समा जाबाय। अनुग्रह खालामना मुलि जा।",
    waterTag: "दै लोंनाय",
    waterTitle: "गोथार दै लों",
    waterDetail: "सानसेनि थांखि: 6 ग्लास दै",
    waterGoal: "6 ग्लानि ({pct}%)",
    waterGoalDone: "✓ दिनैनि थांखि जाबाय!",
    waterGlasses: "6 ग्लानि {n} ग्लास",
    waterDrinkBtn: "1 ग्लास दै",
    waterSpoken: "दै लोंनो गोसोखां। नों दिनै {glasses} ग्लास दै लोंबाय।",
    actTag: "सानफ्रोमबोनि खामानि",
    actTitle: "नखरनि सावगारि आरो गोसोखां",
    actDetail: "फुंनि 11:00 रिंगायाव • सुनिताजों लोगोसे सावगारि नाय",
    actDone: "✓ खामानि जाबाय",
    actTapDo: "सावगारि नाय",
    actSpoken: "फुंनि 11:00 रिंगायाव सुनिताजों लोगोसे नखरनि सावगारि नाय।",
    aptTag: "डाक्टर लोगो हमनाय",
    aptTitle: "डाक्टरनि नायबिजिरनाय (दिसपुर पीएचसि)",
    aptDetail: "बेलासे 2:30 रिंगायाव • डा. बि के शर्मा",
    aptVisited: "✓ डाक्टर नायबाय",
    aptScheduled: "2:30 रिंगायाव • आसा मिथिबाय",
    aptMarkVisited: "जाबाय होनना लिर",
    aptSpoken: "बेलासिनि 2:30 रिंगायाव दिसपुर पीएचसि आव डाक्टर शर्माजों लोगो हमनांगौ।",
    allSpoken: "दिनैनि सानफ्रोमनि बिथांखि। मुलि जा, दै लों, सावगारि नाय आरो डाक्टर लोगो हम।",
  },
  grt: {
    title: "Da·alni Salanti Tikat",
    subtitle: "An·sengani aro toromna altua bichol",
    listenAll: "Angna tikatko porie knatimatbo",
    listen: "Angna porie knatimatbo",
    medTag: "Sam",
    medTitle: "Pringni Sam (BP & Vitamin)",
    medDetail: "Pring 8:00 bajio • Cha·ani jamano chi baksa ring·bo",
    medTaken: "✓ Pring 8 bajio ring·man·aha",
    medTapTake: "Samko ring·bo • Ring·e nenbo",
    medSpoken: "Pringni samko ring·na somoi ong·aha. Chi baksa samko ring·bo.",
    waterTag: "Chi Ring·ani",
    waterTitle: "Rong·talgipa Chi Ring·bo",
    waterDetail: "Salantina: Glass 6 chi",
    waterGoal: "Glass 6-oni ({pct}%)",
    waterGoalDone: "✓ Da·alni miksongani machotaha!",
    waterGlasses: "Glass 6-oni {n}",
    waterDrinkBtn: "Chi Glass 1",
    waterSpoken: "Chiko ring·na gualnabe. Da·al na·a {glasses} glass chiko ring·aha.",
    actTag: "Salanti Kam",
    actTitle: "Nokdangni Noksa aro Gisik Ra·ani",
    actDetail: "Pring 11:00 bajio • Sunita baksa noksarangko nibo",
    actDone: "✓ Kam matchotaha",
    actTapDo: "Noksarangko Nibo",
    actSpoken: "Pring 11 bajio Sunita baksa noksarangko nibo.",
    aptTag: "Daktarna Mesokani",
    aptTitle: "Daktarna Mesokani (Dispur PHC)",
    aptDetail: "Attam 2:30 bajio • Dr. B. K. Sarma baksa",
    aptVisited: "✓ Daktarna mesokaha",
    aptScheduled: "Attam 2:30 bajio • ASHA u·i-aha",
    aptMarkVisited: "Machotaha",
    aptSpoken: "Attam 2:30 bajio Dispur PHC-o Dr. Sarma baksa an·sengani sandiani donga.",
    allSpoken: "Da·alni kamrang. Sam ring·bo, chi ring·bo, noksa nibo, aro daktarna mesokbo.",
  },
  kha: {
    title: "Ka Jingbuh Por Man Ka Sngi",
    subtitle: "Ki jingkynmaw kiba jem na ka bynta ka jingkoit jingkhiah",
    listenAll: "Pule ia nga ka rukom",
    listen: "Pule ia nga",
    medTag: "Dawai",
    medTitle: "Dawai Mynstep (BP & Vitamin)",
    medDetail: "8:00 mynstep • 1 tylli bad ka um shit",
    medTaken: "✓ La dih ha ka 8:00 mynstep",
    medTapTake: "Dih Dawai • Ktiat ynda la dih",
    medSpoken: "Ka por ban dih dawai mynta ka step. Dih ia u dawai bad ka um.",
    waterTag: "Dih Um",
    waterTitle: "Dih Um Kaba Khuid",
    waterDetail: "Ka thong: 6 klat man ka sngi",
    waterGoal: "na 6 klat ({pct}%)",
    waterGoalDone: "✓ La dap ka thong!",
    waterGlasses: "{n} na 6 Klat",
    waterDrinkBtn: "1 Klat Um",
    waterSpoken: "Kynmaw ban dih um. Mynta ka sngi phi la dih {glasses} klat.",
    actTag: "Kam Man Ka Sngi",
    actTitle: "Dur Iing bad Jingkynmaw",
    actDetail: "11:00 mynstep • Peit dur bad i Sunita",
    actDone: "✓ La dep",
    actTapDo: "Peit Dur",
    actSpoken: "11:00 mynstep peit dur bad i Sunita.",
    aptTag: "Khmih Doctor",
    aptTitle: "Iakynduh Doctor (Dispur PHC)",
    aptDetail: "2:30 janmiet • Bad i Dr. B. K. Sarma",
    aptVisited: "✓ La dep khmih",
    aptScheduled: "2:30 janmiet • ASHA la tip",
    aptMarkVisited: "Buh Dak La Dep",
    aptSpoken: "Phi don jingiakynduh doctor ha ka 2:30 janmiet ha Dispur PHC bad Dr. Sarma.",
    allSpoken: "Ka jingbuh por man ka sngi. Dih dawai, dih um, peit dur iing bad leit sha doctor.",
  },
  lus: {
    title: "Vawiin Ni Khatah Tih Turte",
    subtitle: "Hriselna atana hriattirna awlsam takte",
    listenAll: "Ka tan hunbi chhiar rawh",
    listen: "Ka tan chhiar rawh",
    medTag: "Damdawi",
    medTitle: "Zing Damdawi (BP & Vitamin)",
    medDetail: "Zing dar 8:00 • Tukthuan eikhamah tui lum nen mu 1",
    medTaken: "✓ Zing dar 8:00 ah ei tawh",
    medTapTake: "Damdawi Ei Rawh • Ei hnuah hmet rawh",
    medSpoken: "Zing damdawi ei a hun ta. Khawngaihin tui lum nen mu khat ei rawh le.",
    waterTag: "Tui In",
    waterTitle: "Tui Thianghlim In Rawh",
    waterDetail: "Ni tin tum: Ni khatah no 6",
    waterGoal: "no 6 zinga ({pct}%)",
    waterGoalDone: "✓ Vawiin tum a thleng ta!",
    waterGlasses: "No 6 zinga {n}",
    waterDrinkBtn: "Tui No 1",
    waterSpoken: "Tui in theihnghilh suh. Vawiinah no {glasses} i in tawh e.",
    actTag: "Ni Tin Tih Tur",
    actTitle: "Chhungkua Thlalak En",
    actDetail: "Chawhma dar 11:00 • Sunita nen thlalak hlui en dun rawh",
    actDone: "✓ Tih zawh a ni e",
    actTapDo: "Thlalak En Rawh",
    actSpoken: "Chawhma dar 11:00 ah Sunita nen thlalak hlui en dun rawh le.",
    aptTag: "Doctor Inentir",
    aptTitle: "Doctor Inentir (Dispur PHC)",
    aptDetail: "Chawhnu dar 2:30 • Dr. B. K. Sarma nen inentirna",
    aptVisited: "✓ Inentir tawh a ni",
    aptScheduled: "Chawhnu dar 2:30 • ASHA hriattir tawh",
    aptMarkVisited: "Entir tawh tih chhinchhiah",
    aptSpoken: "Chawhnu dar 2:30 ah Dispur PHC ah Dr. Sarma nen inentir tur a ni e.",
    allSpoken: "Vawiin tih turte. Damdawi ei la, tui in la, thlalak en la, doctor inentir rawh le.",
  },
};

export function DailyRoutineSchedule({ langCode, rate }: DailyRoutineScheduleProps) {
  const locale = useLocale();
  const normLocale = (locale?.split("-")[0]?.toLowerCase() || "en");
  const loc = ROUTINE_DATA[normLocale] || ROUTINE_DATA.en;

  // 4 Core Clinical & Routine Reminders from Problem Statement
  const [medicineDone, setMedicineDone] = useState(true);
  const [glasses, setGlasses] = useState(4);
  const [activityDone, setActivityDone] = useState(false);
  const [appointmentDone, setAppointmentDone] = useState(false);

  // Audio helpers
  const playVoice = (text: string) => {
    playTapFeedback();
    unlockAudio();
    speak(text, locale || langCode, rate);
  };

  const handleSpeakAll = () => {
    playVoice(loc.allSpoken);
  };

  const toggleMedicine = () => {
    playTapFeedback();
    const next = !medicineDone;
    if (next) playCorrect();
    setMedicineDone(next);
  };

  const addWater = (e: React.MouseEvent) => {
    e.stopPropagation();
    playWaterRipple();
    setGlasses((g) => Math.min(8, g + 1));
  };

  const removeWater = (e: React.MouseEvent) => {
    e.stopPropagation();
    playTapFeedback();
    setGlasses((g) => Math.max(0, g - 1));
  };

  const toggleActivity = () => {
    playTapFeedback();
    const next = !activityDone;
    if (next) playCorrect();
    setActivityDone(next);
  };

  const toggleAppointment = () => {
    playTapFeedback();
    const next = !appointmentDone;
    if (next) playCorrect();
    setAppointmentDone(next);
  };

  const waterPct = Math.min(100, Math.round((glasses / 6) * 100));

  return (
    <section id="routine-schedule" aria-labelledby="routine-title" className="space-y-4 text-left scroll-mt-24">
      {/* Section Header with "Listen to All" Accessibility Voice Button */}
      <div className="flex items-center justify-between gap-3 border-b-2 border-black/15 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-black bg-tea/15 text-tea shadow-2xs">
            <Clock className="h-5 w-5 stroke-[2.5]" />
          </div>
          <div>
            <h2 id="routine-title" className="font-serif text-2xl sm:text-3xl font-black text-ink leading-tight">
              {loc.title}
            </h2>
            <p className="text-xs sm:text-sm font-bold text-ink-secondary mt-0.5">
              {loc.subtitle}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSpeakAll}
          className="btn-tactile shrink-0 flex min-h-[50px] items-center gap-2.5 rounded-2xl border-3 border-black bg-white px-5 py-3 text-sm sm:text-base font-black text-ink shadow-[3px_3px_0px_#000] hover:bg-amber-100 cursor-pointer active:scale-95 transition-all"
          title={loc.listenAll}
          aria-label={loc.listenAll}
        >
          <Volume2 className="h-6 w-6 text-tea shrink-0 stroke-[2.5]" />
          <span className="hidden sm:inline">{loc.listenAll}</span>
          <span className="sm:hidden">{loc.listen}</span>
        </button>
      </div>

      {/* 2x2 Wide Accessible Reminder Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        
        {/* 1. MEDICINES REMINDER */}
        <div className="border-3 border-black rounded-3xl bg-[#FFFDF9] p-5 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between text-left transition-all">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-13 w-13 rounded-2xl border-2 border-black bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs shrink-0">
                  <Pill className="h-7 w-7 stroke-[2.5]" />
                </div>
                <div>
                  <span className="inline-flex items-center rounded-full bg-rose-50 border border-rose-300 px-2.5 py-0.5 text-[11px] font-black uppercase text-rose-900 tracking-wider">
                    {loc.medTag}
                  </span>
                  <div className="text-xs font-bold text-ink-secondary mt-0.5">8:00 AM • Morning</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => playVoice(loc.medSpoken)}
                className="btn-tactile h-12 w-12 rounded-2xl border-2 border-black bg-white flex items-center justify-center text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-100 cursor-pointer active:scale-95 transition-transform shrink-0"
                title={loc.listen}
                aria-label={loc.listen}
              >
                <Volume2 className="h-6 w-6 text-tea stroke-[2.5]" />
              </button>
            </div>

            <div className="mt-3.5">
              <h3 className="font-serif text-lg sm:text-xl font-black text-ink leading-snug">
                {loc.medTitle}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-ink-secondary mt-1 leading-relaxed">
                {loc.medDetail}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t-2 border-black/10">
            {medicineDone ? (
              <button
                type="button"
                onClick={toggleMedicine}
                className="w-full min-h-[48px] py-2.5 px-4 rounded-2xl border-2 border-black bg-emerald-100 text-emerald-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] hover:bg-emerald-200 cursor-pointer transition-all active:scale-98"
                aria-label="Medicine taken. Tap to toggle."
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
                <span>{loc.medTaken}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleMedicine}
                className="w-full min-h-[48px] py-2.5 px-4 rounded-2xl border-2 border-black bg-rose-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] hover:bg-rose-700 cursor-pointer transition-all active:scale-98"
                aria-label="Medicine pending. Tap when taken."
              >
                <Pill className="h-5 w-5 shrink-0" />
                <span>{loc.medTapTake}</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. HYDRATION TRACKER */}
        <div className="border-3 border-black rounded-3xl bg-[#FFFDF9] p-5 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between text-left transition-all">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl border-2 border-black bg-emerald-100 text-emerald-800 flex items-center justify-center shadow-xs">
                  <Droplets className="h-6 w-6 stroke-[2.2]" />
                </div>
                <div>
                  <span className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-black uppercase text-emerald-900 tracking-wider">
                    {loc.waterTag}
                  </span>
                  <div className="text-xs font-bold text-ink-secondary mt-0.5">All Day • 6 Glasses</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => playVoice(loc.waterSpoken.replace("{glasses}", String(glasses)))}
                className="btn-tactile h-12 w-12 rounded-2xl border-2 border-black bg-white flex items-center justify-center text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-100 cursor-pointer active:scale-95 transition-transform shrink-0"
                title={loc.listen}
                aria-label={loc.listen}
              >
                <Volume2 className="h-6 w-6 text-tea stroke-[2.5]" />
              </button>
            </div>

            <div className="mt-3.5">
              <h3 className="font-serif text-lg sm:text-xl font-black text-ink leading-snug">
                {loc.waterTitle}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-ink-secondary mt-1 leading-relaxed">
                {loc.waterDetail}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t-2 border-black/10 space-y-3">
            {/* Visual 6 Glasses Progress Display */}
            <div className="flex items-center justify-between gap-1.5 bg-emerald-50/90 p-2 rounded-2xl border-2 border-emerald-200">
              {[1, 2, 3, 4, 5, 6].map((cup) => (
                <div
                  key={cup}
                  className={`flex-1 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${
                    cup <= glasses
                      ? "bg-emerald-600 border-emerald-800 text-white shadow-xs scale-102"
                      : "bg-white border-black/20 text-black/20"
                  }`}
                  title={`Glass ${cup} of 6`}
                >
                  <Droplets className={`h-3.5 w-3.5 ${cup <= glasses ? "fill-white" : ""}`} />
                </div>
              ))}
            </div>

            {/* Accessible +/- Water Controls */}
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={removeWater}
                disabled={glasses <= 0}
                className="h-11 w-11 rounded-xl border-2 border-black bg-white text-ink flex items-center justify-center font-black hover:bg-surface-muted disabled:opacity-30 disabled:cursor-not-allowed shadow-[2px_2px_0px_#000] cursor-pointer active:scale-95"
                aria-label="Decrease water"
              >
                <Minus className="h-4 w-4 stroke-[3]" />
              </button>
              
              <div className="text-center flex-1">
                <span className="text-xs sm:text-sm font-black text-emerald-950 block">
                  {loc.waterGlasses.replace("{n}", String(glasses))}
                </span>
                <span className="text-[11px] font-bold text-emerald-800">
                  {glasses >= 6 ? loc.waterGoalDone : loc.waterGoal.replace("{pct}", String(waterPct))}
                </span>
              </div>

              <button
                type="button"
                onClick={addWater}
                disabled={glasses >= 8}
                className="h-11 px-3.5 sm:px-4 rounded-xl border-2 border-black bg-emerald-700 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-[2px_2px_0px_#000] hover:bg-emerald-800 active:scale-95 cursor-pointer disabled:opacity-40"
                aria-label="Drink a glass of water"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>{loc.waterDrinkBtn}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. DAILY ACTIVITIES REMINDER */}
        <div className="border-3 border-black rounded-3xl bg-[#FFFDF9] p-5 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between text-left transition-all">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-13 w-13 rounded-2xl border-2 border-black bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs shrink-0">
                  <ImageIcon className="h-7 w-7 stroke-[2.5]" />
                </div>
                <div>
                  <span className="inline-flex items-center rounded-full bg-amber-50 border border-amber-300 px-2.5 py-0.5 text-[11px] font-black uppercase text-amber-900 tracking-wider">
                    {loc.actTag}
                  </span>
                  <div className="text-xs font-bold text-ink-secondary mt-0.5">11:00 AM • 15 Mins</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => playVoice(loc.actSpoken)}
                className="btn-tactile h-12 w-12 rounded-2xl border-2 border-black bg-white flex items-center justify-center text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-100 cursor-pointer active:scale-95 transition-transform shrink-0"
                title={loc.listen}
                aria-label={loc.listen}
              >
                <Volume2 className="h-6 w-6 text-tea stroke-[2.5]" />
              </button>
            </div>

            <div className="mt-3.5">
              <h3 className="font-serif text-lg sm:text-xl font-black text-ink leading-snug">
                {loc.actTitle}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-ink-secondary mt-1 leading-relaxed">
                {loc.actDetail}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t-2 border-black/10">
            {activityDone ? (
              <button
                type="button"
                onClick={toggleActivity}
                className="w-full min-h-[48px] py-2.5 px-4 rounded-2xl border-2 border-black bg-emerald-100 text-emerald-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] hover:bg-emerald-200 cursor-pointer transition-all active:scale-98"
                aria-label="Activity completed. Tap to toggle."
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
                <span>{loc.actDone}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={toggleActivity}
                className="w-full min-h-[48px] py-2.5 px-4 rounded-2xl border-2 border-black bg-amber-400 text-ink font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] hover:bg-amber-300 cursor-pointer transition-all active:scale-98"
                aria-label="Activity pending. Tap when done."
              >
                <Sparkles className="h-5 w-5 text-ink shrink-0" />
                <span>{loc.actTapDo}</span>
              </button>
            )}
          </div>
        </div>

        {/* 4. MEDICAL APPOINTMENT REMINDER */}
        <div className="border-3 border-black rounded-3xl bg-[#FFFDF9] p-5 sm:p-6 shadow-[4px_4px_0px_#000] flex flex-col justify-between text-left transition-all">
          <div>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-13 w-13 rounded-2xl border-2 border-black bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs shrink-0">
                  <CalendarCheck className="h-7 w-7 stroke-[2.5]" />
                </div>
                <div>
                  <span className="inline-flex items-center rounded-full bg-purple-50 border border-purple-300 px-2.5 py-0.5 text-[11px] font-black uppercase text-purple-900 tracking-wider">
                    {loc.aptTag}
                  </span>
                  <div className="text-xs font-bold text-ink-secondary mt-0.5">2:30 PM • Dispur PHC</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => playVoice(loc.aptSpoken)}
                className="btn-tactile h-12 w-12 rounded-2xl border-2 border-black bg-white flex items-center justify-center text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-100 cursor-pointer active:scale-95 transition-transform shrink-0"
                title={loc.listen}
                aria-label={loc.listen}
              >
                <Volume2 className="h-6 w-6 text-tea stroke-[2.5]" />
              </button>
            </div>

            <div className="mt-3.5">
              <h3 className="font-serif text-lg sm:text-xl font-black text-ink leading-snug">
                {loc.aptTitle}
              </h3>
              <p className="text-xs sm:text-sm font-medium text-ink-secondary mt-1 leading-relaxed">
                {loc.aptDetail}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3.5 border-t-2 border-black/10">
            {appointmentDone ? (
              <button
                type="button"
                onClick={toggleAppointment}
                className="w-full min-h-[48px] py-2.5 px-4 rounded-2xl border-2 border-black bg-emerald-100 text-emerald-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] hover:bg-emerald-200 cursor-pointer transition-all active:scale-98"
                aria-label="Doctor visit completed. Tap to toggle."
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0" />
                <span>{loc.aptVisited}</span>
              </button>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-purple-950 bg-purple-100/90 px-3 py-2.5 rounded-xl border border-purple-300 flex-1 min-w-0 truncate">
                  <Clock className="h-4 w-4 text-purple-700 shrink-0" />
                  <span className="truncate">{loc.aptScheduled}</span>
                </div>
                <button
                  type="button"
                  onClick={toggleAppointment}
                  className="h-11 px-3 sm:px-4 rounded-xl border-2 border-black bg-purple-700 text-white font-black text-xs sm:text-sm shadow-[2px_2px_0px_#000] hover:bg-purple-800 cursor-pointer active:scale-95 transition-all shrink-0"
                  aria-label="Mark clinic visit as completed"
                >
                  <span>{loc.aptMarkVisited}</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
