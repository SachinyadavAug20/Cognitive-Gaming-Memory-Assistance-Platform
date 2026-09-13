"use client";

import React, { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import {
  X,
  Sparkles,
  Heart,
  Mic,
  Square,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import type { FutureTimeCapsule, TimeCapsuleMilestone, TimeCapsuleTheme } from "@/types/capsule";
import { getFutureTimeCapsules, saveFutureTimeCapsule } from "@/data/defaultCapsules";
import { playTapFeedback, playEncourage, unlockAudio } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";

interface FutureTimeCapsuleModalProps {
  patientId: number;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  langCode?: string;
}

interface TimeCapsuleModalTexts {
  modalTitle: string;
  modalSubtitle: string;
  tabReadListen: string;
  tabLeaveMessage: string;
  allMessagesBtn: string;
  savedOn: string;
  listenToMessage: string;
  stopReading: string;
  tapToOpen: string;
  noSavedMessages: string;
  leaveFirstMessage: string;
  tapToListenArrow: string;
  step1Title: string;
  step2Title: string;
  listenAloud: string;
  placeholderWords: string;
  addVoiceOptional: string;
  listeningVoice: string;
  voicePrompt: string;
  voiceAttached: string;
  doneBtn: string;
  speakBtn: string;
  reRecordBtn: string;
  step3Title: string;
  saveMessageBtn: string;
  savedWithLove: string;
  preset1Label: string;
  preset1Title: string;
  preset1Text: string;
  preset2Label: string;
  preset2Title: string;
  preset2Text: string;
  preset3Label: string;
  preset3Title: string;
  preset3Text: string;
}

const TIME_CAPSULE_MODAL_I18N: Record<string, TimeCapsuleModalTexts> = {
  en: {
    modalTitle: "Loving Messages for Tomorrow",
    modalSubtitle: "Gentle reminders and comforting words from your heart",
    tabReadListen: "Read & Listen",
    tabLeaveMessage: "Leave a New Message",
    allMessagesBtn: "All Messages",
    savedOn: "Saved on",
    listenToMessage: "Listen to Message",
    stopReading: "Stop Reading",
    tapToOpen: "Tap any card to open and listen:",
    noSavedMessages: "No saved messages yet.",
    leaveFirstMessage: "Leave Your First Message",
    tapToListenArrow: "Tap to listen →",
    step1Title: "1. What would you like this message to be about?",
    step2Title: "2. Your Words (Read or Edit)",
    listenAloud: "Listen Aloud",
    placeholderWords: "Write your words here...",
    addVoiceOptional: "Add Your Voice (Optional)",
    listeningVoice: "Listening to your voice...",
    voicePrompt: "Speak in your own comforting voice",
    voiceAttached: "Voice recorded and attached!",
    doneBtn: "Done",
    speakBtn: "Speak",
    reRecordBtn: "Re-record",
    step3Title: "3. Pick a Familiar Photo",
    saveMessageBtn: "Save My Message",
    savedWithLove: "Saved with Love!",
    preset1Label: "Remind Me Who I Am",
    preset1Title: "To Myself When Days Feel Foggy",
    preset1Text: "Dear Biren, if today feels confusing: Remember you are Biren Borah, retired headmaster, beloved father and grandfather. You built your home at Silpukhuri with honest hands. You are safe, loved, and at home.",
    preset2Label: "Blessing for My Children & Grandkids",
    preset2Title: "Blessing for My Family",
    preset2Text: "To my dear children and grandchild: Watching you care for me fills my heart with joy. Never forget to sit together for morning tea, stay truthful in all you do, and remember I love you always.",
    preset3Label: "A Message of Gratitude",
    preset3Title: "Words of Love for Pratima",
    preset3Text: "Pratima, forty-six years together have been my greatest fortune. Even when my memory wanders, my heart always recognizes your warm tea, your footsteps, and your gentle voice. Thank you.",
  },
  as: {
    modalTitle: "অহাকালিৰ বাবে মৰমৰ বাৰ্তা",
    modalSubtitle: "আপোনাৰ হৃদয়ৰ পৰা কোমল আশ্বাস আৰু শান্ত বচন",
    tabReadListen: "পঢ়ক আৰু শুনক",
    tabLeaveMessage: "নতুন বাৰ্তা ৰাখক",
    allMessagesBtn: "সকলো বাৰ্তা",
    savedOn: "সংৰক্ষণৰ তাৰিখ",
    listenToMessage: "বাৰ্তা শুনক",
    stopReading: "পঢ়া বন্ধ কৰক",
    tapToOpen: "খুলিবলৈ আৰু শুনিবলৈ যিকোনো কাৰ্ড স্পৰ্শ কৰক:",
    noSavedMessages: "এতিয়ালৈ কোনো বাৰ্তা সংৰক্ষিত হোৱা নাই।",
    leaveFirstMessage: "আপোনাৰ প্ৰথমটো বাৰ্তা লিখক",
    tapToListenArrow: "শুনিবলৈ স্পৰ্শ কৰক →",
    step1Title: "১. এই বাৰ্তাটো কি বিষয়ক হ’ব?",
    step2Title: "২. আপোনাৰ হৃদয়ৰ কথা (পঢ়ক বা সম্পাদনা কৰক)",
    listenAloud: "স্পষ্টকৈ শুনক",
    placeholderWords: "আপোনাৰ মনৰ কথা ইয়াত লিখক...",
    addVoiceOptional: "আপোনাৰ কণ্ঠ বাৰ্তা যোগ কৰক (ঐচ্ছিক)",
    listeningVoice: "আপোনাৰ মাত ৰেকৰ্ডিং হৈ আছে...",
    voicePrompt: "আপোনাৰ আপোন মৰমৰ মাতেৰে কওক",
    voiceAttached: "কণ্ঠস্বৰ ৰেকৰ্ড কৰি সংলগ্ন কৰা হ'ল!",
    doneBtn: "সম্পূৰ্ণ",
    speakBtn: "কওক",
    reRecordBtn: "পুনৰ কওক",
    step3Title: "৩. চিনাকি ফটো বাছক",
    saveMessageBtn: "মোৰ বাৰ্তা সংৰক্ষণ কৰক",
    savedWithLove: "মৰমেৰে সংৰক্ষিত হ'ল!",
    preset1Label: "মই কোন মোক মনত পেলাই দিয়া",
    preset1Title: "যেতিয়া মনত বিভ্ৰান্তি আহে",
    preset1Text: "মৰমৰ বীৰেন, যদি আজি মনটো অস্থিৰ লাগে: মনত পেলাওক আপুনি বীৰেন বৰা, অৱসৰপ্ৰাপ্ত প্ৰধান শিক্ষক, মৰমৰ দেউতা আৰু ককা। আপুনি নিজৰ শ্ৰমেৰে শিলপুখুৰীত ঘৰ সাজিছিল। আপুনি সম্পূৰ্ণ সুৰক্ষিত আৰু আপোন মানুহৰ মাজত আছে।",
    preset2Label: "সন্তান আৰু নাতি-নাতিনীৰ বাবে আশীৰ্বাদ",
    preset2Title: "পৰিয়ালৰ বাবে আশীৰ্বাদ",
    preset2Text: "মোৰ মৰমৰ ল'ৰা-ছোৱালী আৰু নাতি: তোমালোকে মোক লোৱা যত্নই মোৰ হৃদয় ভৰাই তোলে। ৰাতিপুৱা একেলগে চাহ খাবলৈ নাপাহৰিবা, সদায় সৎ হৈ থাকিবা। মই তোমালোকক বহুত ভাল পাওঁ।",
    preset3Label: "কৃতজ্ঞতাৰ মৰমৰ বাৰ্তা",
    preset3Title: "প্ৰতিমাৰ বাবে মৰমৰ কথা",
    preset3Text: "প্ৰতিমা, ৪৬ বছৰ একেলগে কটোৱাটোৱেই মোৰ জীৱনৰ আটাইতকৈ ডাঙৰ ভাগ্য। মনত কেতিয়াবা স্মৃতি হেৰালেও মোৰ হৃদয়ে সদায় তোমাৰ হাতৰ চাহ, তোমাৰ খোজৰ শব্দ আৰু তোমাৰ মিঠা মাত চিনি পায়। তোমাক অশেষ ধন্যবাদ।",
  },
  hi: {
    modalTitle: "आने वाले कल के लिए स्नेह संदेश",
    modalSubtitle: "आपके दिल से कोमल संबल और सांत्वना भरे शब्द",
    tabReadListen: "पढ़ें और सुनें",
    tabLeaveMessage: "नया संदेश लिखें",
    allMessagesBtn: "सभी संदेश",
    savedOn: "सहेजा गया",
    listenToMessage: "संदेश सुनें",
    stopReading: "वाचन रोकें",
    tapToOpen: "खोलने और सुनने के लिए किसी भी कार्ड को स्पर्श करें:",
    noSavedMessages: "अभी तक कोई संदेश सहेजा नहीं गया है।",
    leaveFirstMessage: "अपना पहला संदेश लिखें",
    tapToListenArrow: "सुनने के लिए टैप करें →",
    step1Title: "1. यह संदेश किस विषय पर होना चाहिए?",
    step2Title: "2. आपके शब्द (पढ़ें या संपादित करें)",
    listenAloud: "बोलकर सुनें",
    placeholderWords: "अपने मन के शब्द यहाँ लिखें...",
    addVoiceOptional: "अपनी आवाज़ जोड़ें (वैकल्पिक)",
    listeningVoice: "आपकी आवाज़ रिकॉर्ड हो रही है...",
    voicePrompt: "अपनी ही स्नेहभरी आवाज़ में बोलें",
    voiceAttached: "आवाज़ रिकॉर्ड कर संलग्न की गई!",
    doneBtn: "पूर्ण",
    speakBtn: "बोलें",
    reRecordBtn: "पुनः बोलें",
    step3Title: "3. एक परिचित तस्वीर चुनें",
    saveMessageBtn: "मेरा संदेश सहेजें",
    savedWithLove: "स्नेहपूर्वक सहेज लिया गया!",
    preset1Label: "मुझे याद दिलाएं कि मैं कौन हूँ",
    preset1Title: "जब मन में धुंधलका सा लगे",
    preset1Text: "प्रिय बीरेन, यदि आज कुछ उलझन लगे: याद रखें आप बीरेन बोरा हैं, सेवानिवृत्त प्रधानाध्यापक, प्रिय पिता और दादा। आपने ईमानदारी से सिलपुखुरी में अपना घर बनाया। आप सुरक्षित, प्रियजनों के बीच और अपने घर पर हैं।",
    preset2Label: "बच्चों और पोते-पोतियों के लिए आशीर्वाद",
    preset2Title: "परिवार के लिए आशीर्वाद",
    preset2Text: "मेरे प्यारे बच्चों: जिस तरह तुम मेरी देखभाल करते हो, उससे मेरा दिल भर आता है। सुबह की चाय साथ पीना मत भूलना, हमेशा सच के रास्ते पर चलना। मेरा प्यार हमेशा तुम्हारे साथ है।",
    preset3Label: "कृतज्ञता भरा संदेश",
    preset3Title: "प्रतिमा के लिए प्रेम के शब्द",
    preset3Text: "प्रतिमा, तुम्हारे साथ छियालीस साल का सफर मेरे जीवन का सबसे बड़ा सौभाग्य रहा है। याददाश्त भले ही भटक जाए, मेरा दिल तुम्हारी गर्म चाय, तुम्हारी आहट और तुम्हारी आवाज़ को हमेशा पहचानता है। धन्यवाद।",
  },
  bn: {
    modalTitle: "আগামীর জন্য ভালোবাসার বার্তা",
    modalSubtitle: "আপনার হৃদয়ের কোমল আশ্বাস ও শান্তির সান্ত্বনা",
    tabReadListen: "পড়ুন ও শুনুন",
    tabLeaveMessage: "নতুন বার্তা রাখুন",
    allMessagesBtn: "সব বার্তা",
    savedOn: "সংরক্ষিত হয়েছে",
    listenToMessage: "বার্তা শুনুন",
    stopReading: "পড়া বন্ধ করুন",
    tapToOpen: "খুলতে ও শুনতে যেকোনো কার্ডে স্পর্শ করুন:",
    noSavedMessages: "এখনও কোনো বার্তা সংরক্ষিত হয়নি।",
    leaveFirstMessage: "আপনার প্রথম বার্তাটি রাখুন",
    tapToListenArrow: "শুনতে স্পর্শ করুন →",
    step1Title: "১. এই বার্তাটি কী বিষয়ক হতে পারে?",
    step2Title: "২. আপনার মনের কথা (পড়ুন বা সম্পাদনা করুন)",
    listenAloud: "উচ্চস্বরে শুনুন",
    placeholderWords: "আপনার মনের কথা এখানে লিখুন...",
    addVoiceOptional: "কণ্ঠস্বর যোগ করুন (ঐচ্ছিক)",
    listeningVoice: "আপনার কথা রেকর্ড হচ্ছে...",
    voicePrompt: "নিজের মমতাময়ী কণ্ঠে বলুন",
    voiceAttached: "কণ্ঠস্বর রেকর্ড করে সংযুক্ত করা হয়েছে!",
    doneBtn: "সম্পন্ন",
    speakBtn: "বলুন",
    reRecordBtn: "পুনরায় বলুন",
    step3Title: "৩. একটি পরিচিত ছবি বেছে নিন",
    saveMessageBtn: "আমার বার্তা সংরক্ষণ করুন",
    savedWithLove: "স্নেহভরে সংরক্ষিত হয়েছে!",
    preset1Label: "আমি কে আমাকে মনে করিয়ে দিন",
    preset1Title: "যখন মন বিভ্রান্ত মনে হয়",
    preset1Text: "প্রিয় বীরেন, আজ যদি মনটা বিভ্রান্ত লাগে: মনে রাখবেন আপনি বীরেন বরা, অবসরপ্রাপ্ত প্রধান শিক্ষক, স্নেহের পিতা ও ঠাকুরদাদা। আপনি সততার সাথে নিজের বাড়ি গড়ে তুলেছেন। আপনি সুরক্ষিত ও ভালোবাসার মানুষের মাঝে আছেন।",
    preset2Label: "সন্তান ও নাতি-নাতনিদের জন্য আশীর্বাদ",
    preset2Title: "পরিবারের জন্য আশীর্বাদ",
    preset2Text: "আমার স্নেহের ছেলেমেয়ে ও নাতি: তোমরা যেভাবে আমার যত্ন নাও তা দেখে আমার হৃদয় ভরে যায়। সকালে একসাথে চা খেতে ভুলো না, সবসময় সৎ থেকো। আমার ভালোবাসা সবসময় তোমাদের সাথে রয়েছে।",
    preset3Label: "কৃতজ্ঞতার বার্তা",
    preset3Title: "প্রতিমার জন্য ভালোবাসার কথা",
    preset3Text: "প্রতিমা, ৪৬ বছর একসাথে কাটানো আমার জীবনের সবচেয়ে বড় সৌভাগ্য। স্মৃতি মাঝে মাঝে হারিয়ে গেলেও আমার হৃদয় সবসময় তোমার হাতের চা, পায়ের শব্দ আর মিষ্টি কথা চিনে নেয়। তোমাকে অনেক ধন্যবাদ।",
  },
  mr: {
    modalTitle: "उद्यासाठी प्रेमाचा संदेश",
    modalSubtitle: "तुमच्या मनातील आपुलकी आणि धीर देणारे शब्द",
    tabReadListen: "वाचा आणि ऐका",
    tabLeaveMessage: "नवीन संदेश ठेवा",
    allMessagesBtn: "सर्व संदेश",
    savedOn: "जतन केले",
    listenToMessage: "संदेश ऐका",
    stopReading: "वाचन थांबवा",
    tapToOpen: "उघडण्यासाठी आणि ऐकण्यासाठी कोणत्याही कार्डावर टॅप करा:",
    noSavedMessages: "अद्याप कोणताही संदेश जतन केलेला नाही.",
    leaveFirstMessage: "तुमचा पहिला संदेश ठेवा",
    tapToListenArrow: "ऐकण्यासाठी टॅप करा →",
    step1Title: "१. हा संदेश कशाबद्दल असावा?",
    step2Title: "२. तुमचे शब्द (वाचा किंवा संपादित करा)",
    listenAloud: "मोठ्याने ऐका",
    placeholderWords: "तुमचे विचार येथे लिहा...",
    addVoiceOptional: "तुमचा आवाज जोडा (पर्यायी)",
    listeningVoice: "तुमचा आवाज रेकॉर्ड होत आहे...",
    voicePrompt: "तुमच्या स्वतःच्या प्रेमळ आवाजात बोला",
    voiceAttached: "आवाज रेकॉर्ड करून जोडला गेला!",
    doneBtn: "पूर्ण",
    speakBtn: "बोला",
    reRecordBtn: "पुन्हा बोला",
    step3Title: "३. एक परिचयाचा फोटो निवडा",
    saveMessageBtn: "माझा संदेश जतन करा",
    savedWithLove: "प्रेमाने जतन केले!",
    preset1Label: "मी कोण आहे हे मला आठवण करून द्या",
    preset1Title: "जेव्हा मनामध्ये गोंधळ उडतो",
    preset1Text: "प्रिय बिरेन, आज काही गोंधळ वाटत असल्यास: आठवा तुम्ही बिरेन बोरा आहात, निवृत्त मुख्याध्यापक, लाडके वडील आणि आजोबा. तुम्ही प्रामाणिक हातांनी सिलपुखुरी येथे घर बांधले. तुम्ही सुरक्षित आणि आप्तस्वकीयांसोबत आहात.",
    preset2Label: "मुलं आणि नातवंडांसाठी आशीर्वाद",
    preset2Title: "कुटुंबासाठी आशीर्वाद",
    preset2Text: "माझ्या प्रिय मुलांनो: तुम्ही माझी काळजी घेता हे पाहून माझे मन भरून येते. सकाळी एकत्र चहा प्यायला विसरू नका, नेहमी सत्याच्या मार्गावर चाला. माझे प्रेम सदैव तुमच्यासोबत आहे.",
    preset3Label: "कृतज्ञतेचा संदेश",
    preset3Title: "प्रतिमासाठी प्रेमाचे शब्द",
    preset3Text: "प्रतिमा, ४६ वर्षे एकत्र राहणे हे माझ्या आयुष्यातील सर्वात मोठे भाग्य आहे. आठवणी कधीकधी विसरल्या तरी माझे हृदय तुझा चहा, तुझी पावले आणि तुझा गोड आवाज नेहमी ओळखते. मनापासून धन्यवाद.",
  },
  ne: {
    modalTitle: "भोलिको लागि मायालु सन्देशहरू",
    modalSubtitle: "तपाईंको हृदयबाट कोमल ढाडस र सान्त्वनाका शब्दहरू",
    tabReadListen: "पढ्नुहोस् र सुन्नुहोस्",
    tabLeaveMessage: "नयाँ सन्देश लेख्नुहोस्",
    allMessagesBtn: "सबै सन्देशहरू",
    savedOn: "सुरक्षित मिति",
    listenToMessage: "सन्देश सुन्नुहोस्",
    stopReading: "वाचन रोक्नुहोस्",
    tapToOpen: "खोल्न र सुन्न कुनै पनि कार्डमा छुनुहोस्:",
    noSavedMessages: "अहिलेसम्म कुनै सन्देश सुरक्षित गरिएको छैन।",
    leaveFirstMessage: "तपाईंको पहिलो सन्देश राख्नुहोस्",
    tapToListenArrow: "सुन्नका लागि छुनुहोस् →",
    step1Title: "१. यो सन्देश के सम्बन्धी हुनुपर्छ?",
    step2Title: "२. तपाईंको मनका शब्दहरू (पढ्नुहोस् वा सच्याउनुहोस्)",
    listenAloud: "बोलेर सुन्नुहोस्",
    placeholderWords: "आफ्नो मनको कुरा यहाँ लेख्नुहोस्...",
    addVoiceOptional: "आफ्नो आवाज थप्नुहोस् (ऐच्छिक)",
    listeningVoice: "तपाईंको आवाज रेकर्ड हुँदैछ...",
    voicePrompt: "आफ्नै न्यानो आवाजमा बोल्नुहोस्",
    voiceAttached: "आवाज रेकर्ड भयो र संलग्न गरियो!",
    doneBtn: "सम्पन्न",
    speakBtn: "बोल्नुहोस्",
    reRecordBtn: "पुनः बोल्नुहोस्",
    step3Title: "३. परिचित तस्बिर छान्नुहोस्",
    saveMessageBtn: "मेरो सन्देश सुरक्षित गर्नुहोस्",
    savedWithLove: "मायाका साथ सुरक्षित गरियो!",
    preset1Label: "म को हुँ मलाई सम्झाउनुहोस्",
    preset1Title: "जब मनमा अन्योल लाग्छ",
    preset1Text: "प्रिय बिरेन, यदि आज केही अन्योल लाग्छ भने: सम्झनुहोस् तपाईं बिरेन बोरा हुनुहुन्छ, सेवानिवृत्त प्रधानाध्यापक, मायालु बुबा र बाजे। तपाईंले इमान्दारिताका साथ सिलपुखुरीमा आफ्नो घर बनाउनुभयो। तपाईं सुरक्षित र आफ्ना मानिसहरूको माझमा हुनुहुन्छ।",
    preset2Label: "छोराछोरी र नातिनातिनाका लागि आशीर्वाद",
    preset2Title: "परिवारका लागि आशीर्वाद",
    preset2Text: "मेरा प्यारा छोराछोरीहरू: तिमीहरूले मेरो हेरचाह गरेको देख्दा मेरो हृदय खुसीले भरिन्छ। बिहानको चिया सँगै पिउन नबिर्सनु, सधैं सत्यको बाटोमा हिँड्नु। मेरो माया सधैं तिमीहरूसँग छ।",
    preset3Label: "कृतज्ञताको सन्देश",
    preset3Title: "प्रतिमाका लागि मायाका शब्दहरू",
    preset3Text: "प्रतिमा, ४६ वर्ष सँगै बिताउनु मेरो जीवनको सबैभन्दा ठूलो भाग्य हो। सम्झनाहरू हराए पनि मेरो मुटुले तिम्रो चिया, तिम्रो पाइला र तिम्रो मिठो आवाज सधैं चिन्दछ। धेरै धेरै धन्यवाद।",
  },
  mni: {
    modalTitle: "হয়েংগীদমক নুংশিবা পাউজেলশিং",
    modalSubtitle: "নহাক্কী থম্মোয়দগী হৌরকপা নুংশিবা অমসুং তন্থাবা ৱাহৈশিং",
    tabReadListen: "পাহৌ অমসুং তাউ",
    tabLeaveMessage: "অনৌবা পাউজেল থম্মু",
    allMessagesBtn: "পাউজেল পুম্নমক",
    savedOn: "থমজিনখিবা নুমিৎ",
    listenToMessage: "পাউজেল তাউ",
    stopReading: "পাব লেপখ্রু",
    tapToOpen: "হাংদোকপা অমসুং তানবা কাৰ্ড অমদা য়েৎলু:",
    noSavedMessages: "হৌজিকফাওবা পাউজেল অমত্তা থমদ্রি।",
    leaveFirstMessage: "অহানবা পাউজেল থম্মু",
    tapToListenArrow: "তানবা য়েৎলু →",
    step1Title: "১. পাউজেল অসিনা করিগী মরমদা ওইগনি?",
    step2Title: "২. নহাক্কী ৱাহৈশিং (পাহৌ নত্রগা শেমদোকউ)",
    listenAloud: "খোঞ্জেল তাউ",
    placeholderWords: "নহাক্কী ৱাহৈশিং মফমসিদা ইরো...",
    addVoiceOptional: "নহাক্কী খোঞ্জেল হাপচিল্লু (পাম্লবদি)",
    listeningVoice: "নহাক্কী খোঞ্জেল খোমহল্লি...",
    voicePrompt: "নহাক্কী মশাগী নুংশিবা খোঞ্জেলদা ঙাংউ",
    voiceAttached: "খোঞ্জেল খোমহৌরে অমসুং হাপচিল্লে!",
    doneBtn: "লোইরে",
    speakBtn: "ঙাংউ",
    reRecordBtn: "অমুক ঙাংউ",
    step3Title: "৩. মশক খঙবা ফোতো অমা খল্লু",
    saveMessageBtn: "ঐগী পাউজেল থম্মু",
    savedWithLove: "নুংশিবগা লোয়ননা থমখ্রে!",
    preset1Label: "ঐ কনাগোনো নীংশিংহল্লু",
    preset1Title: "ৱাখলদা মমি শাম্লবদি",
    preset1Text: "নুংশিবা বীরেন, ঙসি ৱাখলদা খুদোংচাদবা ফাওরবদি: নীংশিংবিয়ু নহাক বীরেন বরাণি, পোথারবা হেডমাষ্টার, নুংশিরবা ইপা অমসুং ইপু। নহাক্না অচুম্বা লম্বীদা শীলপুখুরীদা য়ুম শাবা ঙমখি। নহাক য়ুমদা য়াম্না নুংশিনবা মীওইশিংগা লোয়ননা শান্তিদা লৈরি।",
    preset2Label: "অঙাংশিং অমসুং ইশুশিংগী থৌজান",
    preset2Title: "ইমুং মনুংগী থৌজান",
    preset2Text: "ঐগী নুংশিরবা অঙাংশিং: নকহাক্না ঐবু য়েংশিনবিরিবসিদা ঐগী থম্মোয় হরাওবনা থল্লে। অয়ুক্কী চা পুন্না থকপা কাউরোইদবনি, মতম পুম্নমক্তা অচুম্বা ঙাকউ। ঐগী নুংশিবা মতম পুম্নমক্তা নকহাক্কা লোয়ননা লৈগনি।",
    preset3Label: "থাগৎপগী পাউজেল",
    preset3Title: "প্রতিমাগীদমক নুংশিবা ৱাহৈশিং",
    preset3Text: "প্রতিমা, চহি ৪৬ পুন্না লৈমিন্নরকপসি ঐগী পুন্সিগী খ্বাইদগী চাউবা লাইবকনি। ৱাখলদা নীংশিংবা মাংলবসু ঐগী থম্মোয়না নহাক্কী পুথোকপা চা, নহাক্কী খোঙকাপ অমসুং নহাক্কী নুংশিরবা খোঞ্জেল মতম পুম্নমক্তা খঙই। হন্না-হন্না থাগৎচরি।",
  },
  brx: {
    modalTitle: "गाबोननि थाखाय अननायनि खौरां",
    modalSubtitle: "नोंथांनि गोसोनिफ्राय गोजोन आरो थुलुंगा होनाय बाथ्रा",
    tabReadListen: "फराय आरो खोनासं",
    tabLeaveMessage: "गोदान खौरां दोन",
    allMessagesBtn: "गासै खौरां",
    savedOn: "दोननाय सान",
    listenToMessage: "खौरां खोनासं",
    stopReading: "फरायनाय बन्द खालाम",
    tapToOpen: "खेवनो आरो खोनासंनो कार्डआव थु:",
    noSavedMessages: "दासिमबो खौरां दोननाय जायाखै।",
    leaveFirstMessage: "नोंनि गिबि खौरां दोन",
    tapToListenArrow: "खोनासंनो थु →",
    step1Title: "१. बे खौराङा मानि सोमोन्दै जागोन?",
    step2Title: "२. नोंथांनि राव (फराय एबा दाफाम)",
    listenAloud: "राव खोनासं",
    placeholderWords: "नोंथांनि बाथ्राखौ बेयाव लिर...",
    addVoiceOptional: "नोंथांनि राव सोदेर (लुबैयोब्ला)",
    listeningVoice: "नोंथांनि राव रेकर्ड जाबाय थादों...",
    voicePrompt: "नोंनि अनसुला गारांआव बुं",
    voiceAttached: "राव रेकर्ड खालामनानै सोदेरबाय!",
    doneBtn: "जोबबाय",
    speakBtn: "बुं",
    reRecordBtn: "फिन बुं",
    step3Title: "३. सिनायथि थानाय फोटो सायख'",
    saveMessageBtn: "आंनि खौरां दोन",
    savedWithLove: "अननायजों दोनबाय!",
    preset1Label: "आं सोर आंखौ गोसोखां होना हो",
    preset1Title: "जेब्ला गोसोआव गोमोहाबनाय फैयो",
    preset1Text: "अनजालु बिरेन, दिनै जुदि गोसोआव गोमोहाबनाय फैयोब्ला: गोसोखां नोंथाङा बिरेन बरा, अनजालु बिफा आरो आबौ। नोंथाङा सिलपुखुरियाव सैथोयै न' बानायदोंमोन। नोंथाङा नख'रनि गेजेराव गोजोनै दं।",
    preset2Label: "गथ'फोर आरो नाथि-नाथैनि थाखाय बोर",
    preset2Title: "नखरनि थाखाय बोर",
    preset2Text: "आंनि अनजालु फिसाफोर: नोंसोर आंखौ नायदिंनायाव आंनि गोसोआ गोजोननायजों बुंफबदों। फुंनि साहा लोगोसे लोंनो बावगारनाङा, सदासैथो बादि था। आं नोंसोरखौ अनबाय थागोन।",
    preset3Label: "साबाफोरनि खौरां",
    preset3Title: "प्रतिमानि थाखाय अननायनि बाथ्रा",
    preset3Text: "प्रतिमा, ४६ बोसोर लोगोसे थानाया आंनि जिउनि देरसिन कपालामोन। गोसोखांथिया गोमासाब्लानो आंनि गोसोआ नोंनि साहा आरो नोंनि अनसुला रावखौ सिनायो। रोजा रोजा साबायखर।",
  },
  grt: {
    modalTitle: "Kinaalchina Ka·sani Kattarang",
    modalSubtitle: "Ka·dongani aro ka·sachakani ku·rang",
    tabReadListen: "Poribo aro Knabo",
    tabLeaveMessage: "Gital Katta Donbo",
    allMessagesBtn: "Pillak Kattarang",
    savedOn: "Rakkiachi",
    listenToMessage: "Kattako Knabo",
    stopReading: "Porianiko Donbo",
    tapToOpen: "Kulina aro knana card-ko jotbo:",
    noSavedMessages: "Da·aloba katta dongkuja.",
    leaveFirstMessage: "Skanggipa Kattako Donbo",
    tapToListenArrow: "Knana jotbo →",
    step1Title: "1. Ia kattara maikai ong·na nanga?",
    step2Title: "2. Nang·ni Ka·tongni Kattarang (Poribo ba Taribo)",
    listenAloud: "Ku·rangchi Knabo",
    placeholderWords: "Nang·ni kattarangko iano sebo...",
    addVoiceOptional: "Nang·ni Ku·rangko On·bapbo (Sikode)",
    listeningVoice: "Ku·rangko record ka·enga...",
    voicePrompt: "Nang·ni an·tangni ku·rangchi aganbo",
    voiceAttached: "Ku·rang record ka·e chapataha!",
    doneBtn: "Matchotaha",
    speakBtn: "Aganbo",
    reRecordBtn: "Pil·ta Aganbo",
    step3Title: "3. U·igimin Noksa Seokbo",
    saveMessageBtn: "Angni Kattako Rakkibo",
    savedWithLove: "Ka·saachi Rakkiaha!",
    preset1Label: "Anga Sawa Gisik Ra·atbo",
    preset1Title: "Gisik Brangmitingo",
    preset1Text: "Ka·sara Biren, da·alo gisik brangode: Gisik ra·bo na·a Biren Borah, headmaster, pagipa aro achu ong·a. Silpukhuri-o nang·ni janggiko rikaha. Na·a kusi aro tom·tomanio donga.",
    preset2Label: "Dedrang aro Su·giminrangna Pattiani",
    preset2Title: "Nokgimmikna Pattiani",
    preset2Text: "Angni ka·sara dedrang: Angko nirokanina angni ka·tong kusi ong·bea. Pringni cha-ko apsan ringna gualnabe, toromo thakbo. Anga pangnan ka·sagen.",
    preset3Label: "Mitelpani Katta",
    preset3Title: "Pratima-na Ka·sagipa Katta",
    preset3Text: "Pratima, bilsi 46 apsan dongani rasong ong·a. Gisik gualoba angni ka·tong nang·ni ku·rangko aro cha-ko pangnan u·ia. Mittela.",
  },
  kha: {
    modalTitle: "Ki Khubor Maya Sha ka Lawei",
    modalSubtitle: "Ki kyntien sngewbha bad jingkyrmen na ka dohnud",
    tabReadListen: "Pule & Sngap",
    tabLeaveMessage: "Buh Khubor Thymmai",
    allMessagesBtn: "Baroh ki Khubor",
    savedOn: "La pynsah ha",
    listenToMessage: "Sngap ia ka Khubor",
    stopReading: "Sangeh Pule",
    tapToOpen: "Khyndiat ban plie bad sngap:",
    noSavedMessages: "Ym pat don khubor ba la buh.",
    leaveFirstMessage: "Buh ia ka Khubor Banyngkong",
    tapToListenArrow: "Khyndiat ban sngap →",
    step1Title: "1. Kaei ba phi kwah ba kane ka khubor kan mut?",
    step2Title: "2. Ki Kyntien jong Phi (Pule ne Pynbeit)",
    listenAloud: "Sngap Jam",
    placeholderWords: "Thoh hangne ia ki kyntien...",
    addVoiceOptional: "Buh ia ka Sur Ktien jong Phi",
    listeningVoice: "Dang sngap ia ka sur ktien...",
    voicePrompt: "Kren da ka sur ba jai-jai jong phi",
    voiceAttached: "Sur ktien la riew bad pynsnoh lang!",
    doneBtn: "La Dep",
    speakBtn: "Kren",
    reRecordBtn: "Kren Biang",
    step3Title: "3. Jied Dur ba Mynsaw",
    saveMessageBtn: "Pynsah ia ka Khubor",
    savedWithLove: "La Pynsah da ka Jingieit!",
    preset1Label: "Pynkynmaw ba Uei Nga Long",
    preset1Title: "Haba Dum ka Jingmut",
    preset1Text: "Biren baieit, lada phi sngew kulmar: Kynmaw ba phi dei u Biren Borah, u headmaster ba shongthait, u kpa bad u kpa-rad ba ieit. Phi la tei ia ka ing ha Silpukhuri da ka hok. Phi long ba shngain bad hapdeng ki bahaiing.",
    preset2Label: "Jingkyrkhu ia ki Khun bad ki Ksiew",
    preset2Title: "Jingkyrkhu ia ka Ing ka Sem",
    preset2Text: "Sha ki khun baieit bad ksiew: Ba phi sumar ia nga ka pyndap ia ka dohnud da ka jingkmen. Wat klet ban dih sha step lang, iai bat ia ka hok. Nga ieit ia phi baroh.",
    preset3Label: "Khubor Jingsngewnguh",
    preset3Title: "Ki Kyntien Ieit sha i Pratima",
    preset3Text: "Pratima, 46 snem ryngkat ka long ka bok kaba khraw. Wat la ka jingmut ka jah, ka dohnud ka sngewthuh ia ka sha, ka sur bad ki kjat jong pha. Khublei shibun.",
  },
  lus: {
    modalTitle: "Nakin Zela Tan Duatna Thuchah",
    modalSubtitle: "Rilru chhungril atanga thlamuanna leh duhsakna thute",
    tabReadListen: "Chhiar & Ngaithla",
    tabLeaveMessage: "Thuchah Tharlam Dah Rawh",
    allMessagesBtn: "Thuchah Zawng Zawng",
    savedOn: "Vawn ni",
    listenToMessage: "Thuchah Ngaithla Rawh",
    stopReading: "Chhiar Tawp Rawh",
    tapToOpen: "Hawng a ngaithla turin hmet rawh:",
    noSavedMessages: "Thuchah vawn a la awm lo.",
    leaveFirstMessage: "I Thuchah Hmasaber Dah Rawh",
    tapToListenArrow: "Ngaithla turin hmet rawh →",
    step1Title: "1. He thuchah hi eng chungchang nge ni ang?",
    step2Title: "2. I Kaa Thuchah (Chhiar la siamtha rawh)",
    listenAloud: "Rawn Chhiar Chhuak Rawh",
    placeholderWords: "I thu helai hmunah hian ziak rawh...",
    addVoiceOptional: "I Aw Dah Tel Rawh (Duh chuan)",
    listeningVoice: "I aw a ngaithla mek e...",
    voicePrompt: "Nangma aw ngeiin nem takin sawi rawh",
    voiceAttached: "Aw chu lak a ni a, thlunzawm a ni e!",
    doneBtn: "Zo Ta",
    speakBtn: "Sawi Rawh",
    reRecordBtn: "Sawi Nawn Rawh",
    step3Title: "3. Hmelhriat Thlalak Thlang Rawh",
    saveMessageBtn: "Ka Thuchah Vawng Rawh",
    savedWithLove: "Hmangaihna nen Vawn a ni e!",
    preset1Label: "Tu nge ka nih min hriattir rawh",
    preset1Title: "Rilru A Buai Changin",
    preset1Text: "Ka duhtak Biren, vawiin chu a buai deuh a nih pawhin: Biren Borah, headmaster chawl tawh, pa leh pu duhtak i ni tih hria ang che. Dik takin Silpukhuri-ah in i sa a, i chhungte zingah thlamuang takin i awm e.",
    preset2Label: "Fa leh Tute Thlawpna Thuchah",
    preset2Title: "Chhungkua Tan Malsawmna",
    preset2Text: "Ka fate leh tu duhtakte u: Min enkawl dan ka hmuh hian ka rilru a hlim takzet. Zing thingpui in ho theihnghilh lo ula, dik takin nung zel ang che u. Ka hmangaih reng che u.",
    preset3Label: "Lawmthu Sawi Thuchah",
    preset3Title: "Pratima Tan Duatna Thu",
    preset3Text: "Pratima, kum 46 chhung kan chengdun hi ka vannei takzet. Ka thil theihnghilh chang pawhin, ka thinlung hian i thingpui lum, i kalsawm leh i aw nem chu a hre reng thin. Ka lawm e.",
  },
};

const PHOTO_CHOICES = [
  {
    url: "/sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg",
    label: "Our Home Verandah",
  },
  {
    url: "/sample-images/patient_1_biren_borah/relatives/01_son_manash_borah.jpg",
    label: "Son Manash",
  },
  {
    url: "/sample-images/patient_1_biren_borah/relatives/02_spouse_pratima_borah.jpg",
    label: "Wife Pratima",
  },
  {
    url: "/sample-images/patient_1_biren_borah/places/03_silpukhuri_hari_namghar.jpg",
    label: "Namghar Prayer Hall",
  },
];

export function FutureTimeCapsuleModal({
  patientId,
  patientName,
  isOpen,
  onClose,
  langCode,
}: FutureTimeCapsuleModalProps) {
  const currentLocale = useLocale();
  const activeLocale = langCode || currentLocale || "en";
  const t = TIME_CAPSULE_MODAL_I18N[activeLocale] || TIME_CAPSULE_MODAL_I18N.en;

  const presetIdeas = [
    {
      theme: "identity" as TimeCapsuleTheme,
      icon: "🏡",
      title: t.preset1Title,
      label: t.preset1Label,
      text: t.preset1Text,
      photoUrl: "/sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg",
    },
    {
      theme: "family_love" as TimeCapsuleTheme,
      icon: "🌸",
      title: t.preset2Title,
      label: t.preset2Label,
      text: t.preset2Text,
      photoUrl: "/sample-images/patient_1_biren_borah/relatives/01_son_manash_borah.jpg",
    },
    {
      theme: "gratitude" as TimeCapsuleTheme,
      icon: "💖",
      title: t.preset3Title,
      label: t.preset3Label,
      text: t.preset3Text,
      photoUrl: "/sample-images/patient_1_biren_borah/relatives/02_spouse_pratima_borah.jpg",
    },
  ];

  const [activeTab, setActiveTab] = useState<"messages" | "create">("messages");
  const [capsules, setCapsules] = useState<FutureTimeCapsule[]>(() =>
    getFutureTimeCapsules(patientId)
  );

  // Active message detail view
  const [selectedMessage, setSelectedMessage] = useState<FutureTimeCapsule | null>(null);

  // Form Fields for new message
  const [title, setTitle] = useState(t.preset1Title);
  const [messageText, setMessageText] = useState(t.preset1Text);
  const [selectedPhoto, setSelectedPhoto] = useState(presetIdeas[0].photoUrl);
  const [selectedTheme, setSelectedTheme] = useState<TimeCapsuleTheme>("identity");

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Sealing / saving feedback
  const [isSaved, setIsSaved] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setCapsules(getFutureTimeCapsules(patientId));
  }, [patientId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const existing = getFutureTimeCapsules(patientId);
      setCapsules(existing);
      if (existing.length > 0) {
        setActiveTab("messages");
        setSelectedMessage(null);
      } else {
        setActiveTab("create");
      }
      setIsSaved(false);
      setTitle(t.preset1Title);
      setMessageText(t.preset1Text);
    }
  }, [isOpen, patientId, t.preset1Title, t.preset1Text]);

  if (!isOpen) return null;

  const handleSelectPreset = (p: typeof presetIdeas[0]) => {
    playTapFeedback();
    setTitle(p.title);
    setMessageText(p.text);
    setSelectedPhoto(p.photoUrl);
    setSelectedTheme(p.theme);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
      playTapFeedback();
    } catch {
      alert("Microphone permission was denied. You can still use the written message!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      playTapFeedback();
    }
  };

  const handleListenText = (text: string) => {
    unlockAudio();
    if (isPlayingAudio) {
      stopSpeaking();
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speak(text, activeLocale, 0.85, () => {}, () => setIsPlayingAudio(false));
    }
  };

  const handlePlayVoiceAudio = (audioUrl: string | null | undefined, fallbackText: string) => {
    unlockAudio();
    if (isPlayingAudio) {
      stopSpeaking();
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (audioUrl) {
      setIsPlayingAudio(true);
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsPlayingAudio(false);
        speak(fallbackText, activeLocale, 0.85);
      };
      audio.play().catch(() => {
        setIsPlayingAudio(false);
        speak(fallbackText, activeLocale, 0.85);
      });
    } else {
      setIsPlayingAudio(true);
      speak(fallbackText, activeLocale, 0.85, () => {}, () => setIsPlayingAudio(false));
    }
  };

  const handleSave = () => {
    if (!messageText.trim()) return;
    playEncourage();

    const newCapsule: FutureTimeCapsule = {
      id: `time-capsule-${Date.now()}`,
      patientId,
      authorName: patientName,
      authorRole: "patient",
      title: title || t.preset1Title,
      recipient: "future_self",
      messageText: messageText.trim(),
      photoUrl: selectedPhoto,
      audioUrl: recordedAudioUrl,
      theme: selectedTheme,
      milestone: "anytime",
      milestoneLabel: "Cherished Words",
      sealedAt: new Date().toISOString(),
      isSealed: true,
    };

    const updated = saveFutureTimeCapsule(newCapsule);
    setCapsules(updated);
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
      setActiveTab("messages");
      setSelectedMessage(newCapsule);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl border-3 border-black bg-[#FAF6F0] shadow-[8px_8px_0px_#000] overflow-hidden text-ink">
        
        {/* Header - Clean, gentle, high-contrast */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black/15 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-amber-100 border-2 border-black text-amber-900 flex items-center justify-center font-black">
              <Heart className="h-5 w-5 fill-amber-400 text-amber-900" />
            </div>
            <div>
              <h2 className="font-serif font-black text-lg sm:text-xl text-ink leading-tight">
                {t.modalTitle}
              </h2>
              <p className="text-xs text-ink-secondary font-bold">
                {t.modalSubtitle}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              if (audioPlayerRef.current) audioPlayerRef.current.pause();
              onClose();
            }}
            className="h-10 w-10 rounded-full border-2 border-black bg-white hover:bg-rose-100 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
            title="Close"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-ink" />
          </button>
        </div>

        {/* Minimal 2-Tab Bar */}
        <div className="flex border-b-2 border-black/15 bg-[#FFF9EE] px-4 pt-2">
          <button
            type="button"
            onClick={() => {
              playTapFeedback();
              setActiveTab("messages");
              setSelectedMessage(null);
            }}
            className={`pb-2.5 px-4 text-xs sm:text-sm font-black transition-all border-b-3 cursor-pointer flex items-center gap-2 ${
              activeTab === "messages"
                ? "border-tea text-tea-dark font-black"
                : "border-transparent text-ink-secondary hover:text-ink"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>{t.tabReadListen} ({capsules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTapFeedback();
              setActiveTab("create");
              setSelectedMessage(null);
            }}
            className={`pb-2.5 px-4 text-xs sm:text-sm font-black transition-all border-b-3 cursor-pointer flex items-center gap-2 ${
              activeTab === "create"
                ? "border-tea text-tea-dark font-black"
                : "border-transparent text-ink-secondary hover:text-ink"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>{t.tabLeaveMessage}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === "messages" ? (
            selectedMessage ? (
              /* Single Message Expanded View - Large, clear, readable */
              <div className="space-y-4 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => {
                    playTapFeedback();
                    setSelectedMessage(null);
                  }}
                  className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3.5 py-1.5 text-xs font-black text-ink hover:bg-amber-50 cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{t.allMessagesBtn}</span>
                </button>

                {selectedMessage.photoUrl && (
                  <div className="relative w-full h-44 sm:h-52 rounded-2xl border-2 border-black overflow-hidden shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedMessage.photoUrl}
                      alt={selectedMessage.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="font-serif font-black text-xl sm:text-2xl text-ink leading-tight">
                    {selectedMessage.title}
                  </h3>
                  <p className="text-xs text-ink-secondary font-bold mt-1">
                    {t.savedOn} {new Date(selectedMessage.sealedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Big message text box */}
                <div className="rounded-2xl border-2 border-black/15 bg-white p-4 text-base sm:text-lg font-medium text-ink leading-relaxed whitespace-pre-wrap shadow-xs">
                  {selectedMessage.messageText}
                </div>

                {/* Big Listen Button */}
                <button
                  type="button"
                  onClick={() =>
                    handlePlayVoiceAudio(selectedMessage.audioUrl, selectedMessage.messageText)
                  }
                  className={`btn-tactile w-full py-3.5 rounded-2xl border-3 border-black text-base font-black shadow-[3px_3px_0px_#000] cursor-pointer flex items-center justify-center gap-2.5 transition-all active:scale-95 ${
                    isPlayingAudio
                      ? "bg-amber-400 text-black ring-2 ring-black"
                      : "bg-tea text-white hover:bg-emerald-800"
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="h-5 w-5" />
                      <span>{t.stopReading}</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-5 w-5" />
                      <span>{t.listenToMessage}</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Message List - Simple & Clean */
              <div className="space-y-3">
                <p className="text-xs sm:text-sm font-bold text-ink-secondary">
                  {t.tapToOpen}
                </p>

                {capsules.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-black/30 p-8 text-center bg-white space-y-3">
                    <Heart className="h-10 w-10 text-amber-600 mx-auto" />
                    <p className="font-serif text-base font-bold text-ink">
                      {t.noSavedMessages}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("create")}
                      className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-tea px-4 py-2 text-xs font-black text-white cursor-pointer shadow-xs"
                    >
                      <span>{t.leaveFirstMessage}</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {capsules.map((cap) => (
                      <div
                        key={cap.id}
                        onClick={() => {
                          playTapFeedback();
                          setSelectedMessage(cap);
                        }}
                        className="btn-tactile p-4 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000] hover:bg-amber-50/70 transition-all cursor-pointer flex items-center gap-3.5"
                      >
                        {cap.photoUrl ? (
                          <div className="h-16 w-16 rounded-xl border-2 border-black overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={cap.photoUrl}
                              alt={cap.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-xl border-2 border-black bg-amber-100 flex items-center justify-center shrink-0">
                            <Heart className="h-7 w-7 text-amber-800" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-black text-base text-ink leading-tight truncate">
                            {cap.title}
                          </h4>
                          <p className="text-xs text-ink-secondary line-clamp-1 mt-1 font-medium">
                            {cap.messageText}
                          </p>
                          <span className="text-[11px] font-bold text-tea-dark mt-1 inline-block">
                            {t.tapToListenArrow}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          ) : (
            /* Creation Flow - Ultra-simple, 2-step */
            <div className="space-y-4">
              {/* Step 1: 1-Tap Heartfelt Presets */}
              <div>
                <label className="block text-xs font-black text-ink mb-1.5">
                  {t.step1Title}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {presetIdeas.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(item)}
                      className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                        title === item.title
                          ? "border-black bg-amber-200 shadow-[2px_2px_0px_#000]"
                          : "border-black/20 bg-white hover:bg-amber-50"
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <h4 className="font-serif font-black text-xs text-ink mt-1 leading-snug">
                        {item.label}
                      </h4>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: The Message Words */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-ink">
                    {t.step2Title}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleListenText(messageText)}
                    className="inline-flex items-center gap-1 text-xs font-black text-tea hover:text-tea-dark cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>{t.listenAloud}</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full rounded-2xl border-2 border-black bg-white p-3.5 text-sm sm:text-base font-medium text-ink shadow-[2px_2px_0px_#000] leading-relaxed focus:outline-none focus:ring-2 focus:ring-tea"
                  placeholder={t.placeholderWords}
                />
              </div>

              {/* Optional: Tap to Speak Voice Note */}
              <div className="rounded-2xl border-2 border-black bg-white p-3.5 flex items-center justify-between gap-3 shadow-[2px_2px_0px_#000]">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full border-2 border-black flex items-center justify-center ${
                      isRecording
                        ? "bg-rose-500 text-white animate-pulse"
                        : recordedAudioUrl
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    <Mic className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-ink">
                      {isRecording ? t.listeningVoice : t.addVoiceOptional}
                    </h5>
                    <p className="text-[11px] text-ink-secondary font-bold">
                      {recordedAudioUrl
                        ? t.voiceAttached
                        : t.voicePrompt}
                    </p>
                  </div>
                </div>

                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-rose-600 text-white px-3.5 py-2 text-xs font-black cursor-pointer shadow-xs"
                  >
                    <Square className="h-3.5 w-3.5 fill-white" />
                    <span>{t.doneBtn}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-100 hover:bg-amber-200 text-amber-950 px-3.5 py-2 text-xs font-black cursor-pointer shadow-xs"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <span>{recordedAudioUrl ? t.reRecordBtn : t.speakBtn}</span>
                  </button>
                )}
              </div>

              {/* Step 3: Pick a Photo */}
              <div>
                <label className="block text-xs font-black text-ink mb-1.5">
                  {t.step3Title}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PHOTO_CHOICES.map((photo, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        playTapFeedback();
                        setSelectedPhoto(photo.url);
                      }}
                      className={`relative rounded-xl border-2 overflow-hidden transition-all cursor-pointer aspect-square ${
                        selectedPhoto === photo.url
                          ? "border-tea ring-3 ring-tea/50 scale-102 shadow-xs"
                          : "border-black/30 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.label}
                        className="w-full h-full object-cover"
                      />
                      {selectedPhoto === photo.url && (
                        <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-tea text-white flex items-center justify-center">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!messageText.trim() || isSaved}
                  className="w-full btn-tactile inline-flex items-center justify-center gap-2 rounded-2xl border-3 border-black bg-tea hover:bg-emerald-800 text-white px-6 py-3.5 text-base font-black shadow-[4px_4px_0px_#000] cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>{t.savedWithLove}</span>
                    </>
                  ) : (
                    <>
                      <Heart className="h-5 w-5 fill-white" />
                      <span>{t.saveMessageBtn}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
