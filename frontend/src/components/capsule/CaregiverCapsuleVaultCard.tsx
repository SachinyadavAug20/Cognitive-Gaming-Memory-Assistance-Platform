"use client";

import React, { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Sparkles,
  Plus,
  Play,
  Volume2,
  Heart,
  Eye,
  Camera,
  Layers,
  Bird,
  CloudRain,
  Waves,
  Bell,
  Music,
  Store,
  Clock,
  Lock,
  Shield,
  Smile,
  Calendar,
} from "lucide-react";
import type { MemoryCapsule, AmbientSoundType, FutureTimeCapsule } from "@/types/capsule";
import { getAllCapsulesForPatient, getCapsuleSessionLogs, getFutureTimeCapsules } from "@/data/defaultCapsules";
import { CreateCapsuleModal } from "./CreateCapsuleModal";
import { FutureTimeCapsuleModal } from "./FutureTimeCapsuleModal";
import { speak, stopSpeaking } from "@/lib/speech";

interface CaregiverCapsuleVaultCardProps {
  patientId: number;
  patientName: string;
}

interface CapsuleVaultTexts {
  title: string;
  subtitle: string;
  launchPlayer: string;
  new3DScene: string;
  sealTimeCapsule: string;
  tabScenes: string;
  tabTimeCapsules: string;
  capsulesReady: string;
  spatialAudioActive: string;
  gazeTrackingCalibrated: string;
  latestSession: string;
  completedStatus: string;
  autoRecordedTelemetry: string;
  hotspots: string;
  scene3D: string;
  voiceNoteFrom: string;
  experienceBtn: string;
  futureIdentityTitle: string;
  futureIdentityDesc: string;
  byAuthor: string;
  forRecipient: string;
  listenNote: string;
  playing: string;
  stageView: string;
  sounds: Record<AmbientSoundType, string>;
}

const CAPSULE_VAULT_I18N: Record<string, CapsuleVaultTexts> = {
  en: {
    title: "Family Memories & Peaceful Sounds (Echoes of Home)",
    subtitle: "Living 3D spatial scenes, peaceful regional soundscapes, and sealed future messages",
    launchPlayer: "Launch Player",
    new3DScene: "New 3D Scene",
    sealTimeCapsule: "Seal New Time Capsule",
    tabScenes: "3D Living Scenes",
    tabTimeCapsules: "Future Time Capsules",
    capsulesReady: "Living Capsules Ready",
    spatialAudioActive: "3D Spatial Audio: Active",
    gazeTrackingCalibrated: "Webcam Gaze Tracking: Calibrated",
    latestSession: "Latest Session",
    completedStatus: "Completed",
    autoRecordedTelemetry: "Gaze engagement & emotional reactions automatically recorded",
    hotspots: "Hotspots",
    scene3D: "3D Scene",
    voiceNoteFrom: "Voice Note from",
    experienceBtn: "Experience",
    futureIdentityTitle: "Identity Anchors & Messages for Future Days",
    futureIdentityDesc: "These sealed time capsules provide emotional orientation and reassurance when the patient feels disoriented or during festive milestones (Rongali Bihu, family reunions).",
    byAuthor: "By",
    forRecipient: "For",
    listenNote: "Listen Note",
    playing: "Playing...",
    stageView: "Stage View",
    sounds: { rain: "Rain", river: "River", namghar: "Namghar", flute: "Flute", bazaar: "Bazaar", birds: "Birds" },
  },
  as: {
    title: "পৰিয়ালৰ স্মৃতি আৰু শান্ত ধ্বনি (গৃহৰ প্ৰতিধ্বনি)",
    subtitle: "জীৱন্ত ৩ডি স্থানিক দৃশ্য, শান্ত আঞ্চলিক প্ৰাকৃতিক ধ্বনি, আৰু মোহৰ মৰা ভৱিষ্যত বাৰ্তা",
    launchPlayer: "প্লেয়াৰ আৰম্ভ কৰক",
    new3DScene: "নতুন ৩ডি দৃশ্য",
    sealTimeCapsule: "নতুন সময় কেপচুল মোহৰ মাৰক",
    tabScenes: "৩ডি জীৱন্ত দৃশ্য",
    tabTimeCapsules: "ভৱিষ্যত সময় কেপচুল",
    capsulesReady: "জীৱন্ত কেপচুল প্ৰস্তুত",
    spatialAudioActive: "৩ডি স্থানিক ধ্বনি: সক্ৰিয়",
    gazeTrackingCalibrated: "ৱেবকেম দৃষ্টি নিৰীক্ষণ: কেলিব্ৰেট কৰা হৈছে",
    latestSession: "শেহতীয়া সত্ৰ",
    completedStatus: "সম্পূৰ্ণ",
    autoRecordedTelemetry: "দৃষ্টি সংযোগ আৰু আৱেগিক প্ৰতিক্ৰিয়া স্বয়ংক্ৰিয়ভাৱে সংৰক্ষিত হয়",
    hotspots: "হটস্পট",
    scene3D: "৩ডি দৃশ্য",
    voiceNoteFrom: "কণ্ঠ বাৰ্তা প্ৰেৰক",
    experienceBtn: "অভিজ্ঞতা লওক",
    futureIdentityTitle: "ভৱিষ্যত দিনৰ বাবে পৰিচয়ৰ ভেটি আৰু বাৰ্তা",
    futureIdentityDesc: "ৰোগীয়ে অস্থিৰ বা বিভ্ৰান্ত অনুভৱ কৰিলে নাইবা উৎসৱ-পাৰ্বণত এই মোহৰ মৰা কেপচুলে মানসিক সকাহ আৰু আস্থা দিয়ে।",
    byAuthor: "দ্বাৰা",
    forRecipient: "বাবে",
    listenNote: "বাৰ্তা শুনক",
    playing: "বাজি আছে...",
    stageView: "মঞ্চ দৰ্শন",
    sounds: { rain: "বৰষুণ", river: "নৈৰ ঢৌ", namghar: "নামঘৰ", flute: "বাঁহী", bazaar: "বজাৰ", birds: "চৰাইৰ কাকলি" },
  },
  hi: {
    title: "पारिवारिक स्मृतियां और शांत ध्वनियां (घर की प्रतिध्वनि)",
    subtitle: "जीवंत 3D स्थानिक दृश्य, शांत क्षेत्रीय ध्वनियां, और सुरक्षित भविष्य संदेश",
    launchPlayer: "प्लेयर शुरू करें",
    new3DScene: "नया 3D दृश्य",
    sealTimeCapsule: "नया टाइम कैप्सूल सील करें",
    tabScenes: "3D जीवंत दृश्य",
    tabTimeCapsules: "भविष्य टाइम कैप्सूल",
    capsulesReady: "जीवंत कैप्सूल तैयार",
    spatialAudioActive: "3D स्थानिक ध्वनि: सक्रिय",
    gazeTrackingCalibrated: "वेबकैम दृष्टि ट्रैकिंग: कैलिब्रेटेड",
    latestSession: "नवीनतम सत्र",
    completedStatus: "पूर्ण",
    autoRecordedTelemetry: "दृष्टि जुड़ाव और भावनात्मक प्रतिक्रियाएं स्वचालित रूप से दर्ज होती हैं",
    hotspots: "हॉटस्पॉट",
    scene3D: "3D दृश्य",
    voiceNoteFrom: "ध्वनि संदेश प्रेषक",
    experienceBtn: "अनुभव करें",
    futureIdentityTitle: "भविष्य के दिनों के लिए पहचान और संबल संदेश",
    futureIdentityDesc: "जब रोगी भ्रमित महसूस करें या त्योहारों पर, ये सीलबंद कैप्सूल भावनात्मक संबल और सुरक्षा प्रदान करते हैं।",
    byAuthor: "द्वारा",
    forRecipient: "के लिए",
    listenNote: "संदेश सुनें",
    playing: "बज रहा है...",
    stageView: "मंच देखें",
    sounds: { rain: "बारिश", river: "नदी", namghar: "नामघर", flute: "बांसुरी", bazaar: "बाजार", birds: "पक्षी" },
  },
  bn: {
    title: "পারিবারিক স্মৃতি ও শান্ত সুর (ঘরের প্রতিধ্বনি)",
    subtitle: "জীবন্ত ৩ডি স্থানিক দৃশ্য, শান্ত আঞ্চলিক প্রাকৃতিক সুর এবং ভবিষ্যতের বার্তা",
    launchPlayer: "প্লেয়ার শুরু করুন",
    new3DScene: "নতুন ৩ডি দৃশ্য",
    sealTimeCapsule: "নতুন টাইম ক্যাপসুল সিল করুন",
    tabScenes: "৩ডি জীবন্ত দৃশ্য",
    tabTimeCapsules: "ভবিষ্যত টাইম ক্যাপসুল",
    capsulesReady: "জীবন্ত ক্যাপসুল প্রস্তুত",
    spatialAudioActive: "৩ডি স্থানিক শব্দ: সক্রিয়",
    gazeTrackingCalibrated: "ওয়েবক্যাম দৃষ্টি ট্র্যাকিং: ক্যালিব্রেট করা হয়েছে",
    latestSession: "সর্বশেষ সেশন",
    completedStatus: "সম্পন্ন",
    autoRecordedTelemetry: "দৃষ্টির একাগ্রতা ও মানসিক অনুভূতি স্বয়ংক্রিয়ভাবে নথিভুক্ত হয়",
    hotspots: "হটস্পট",
    scene3D: "৩ডি দৃশ্য",
    voiceNoteFrom: "কণ্ঠবার্তা প্রেরক",
    experienceBtn: "অভিজ্ঞতা নিন",
    futureIdentityTitle: "ভবিষ্যতের দিনের জন্য পরিচয়ের মূল ভিত্তি ও বার্তা",
    futureIdentityDesc: "রোগী বিভ্রান্ত বোধ করলে বা উৎসবের দিনে এই সিল করা ক্যাপসুল মানসিক আশ্বাস ও সান্ত্বনা যোগায়।",
    byAuthor: "দ্বারা",
    forRecipient: "জন্য",
    listenNote: "বার্তা শুনুন",
    playing: "বাজছে...",
    stageView: "মঞ্চ দর্শন",
    sounds: { rain: "বৃষ্টি", river: "নদী", namghar: "নামঘর", flute: "বাঁশি", bazaar: "বাজার", birds: "পাখি" },
  },
  mr: {
    title: "कौटुंबिक आठवणी आणि शांत सूर (घराचा प्रतिसाद)",
    subtitle: "जिवंत 3D दृश्ये, शांत प्रादेशिक ध्वनी आणि सुरक्षित भविष्यातील संदेश",
    launchPlayer: "प्लेअर सुरू करा",
    new3DScene: "नवीन 3D दृश्य",
    sealTimeCapsule: "नवीन टाइम कॅप्सूल सील करा",
    tabScenes: "3D जिवंत दृश्ये",
    tabTimeCapsules: "भविष्य टाइम कॅप्सूल",
    capsulesReady: "जिवंत कॅप्सूल सज्ज",
    spatialAudioActive: "3D स्थानिक ध्वनी: सक्रिय",
    gazeTrackingCalibrated: "वेबकॅम नजर ट्रॅकिंग: कॅलिब्रेटेड",
    latestSession: "नवीनतम सत्र",
    completedStatus: "पूर्ण",
    autoRecordedTelemetry: "नजरेची एकाग्रता आणि भावनिक प्रतिक्रिया आपोआप नोंदवल्या जातात",
    hotspots: "हॉटस्पॉट",
    scene3D: "3D दृश्य",
    voiceNoteFrom: "व्हॉइस संदेश",
    experienceBtn: "अनुभव घ्या",
    futureIdentityTitle: "भविष्यातील दिवसांसाठी ओळख आणि आश्वासक संदेश",
    futureIdentityDesc: "जेव्हा रुग्ण गोंधळलेले असतात किंवा सणांच्या वेळी, या सीलबंद कॅप्सूल भावनिक आधार देतात.",
    byAuthor: "द्वारे",
    forRecipient: "साठी",
    listenNote: "संदेश ऐका",
    playing: "चालू आहे...",
    stageView: "मंच पहा",
    sounds: { rain: "पाऊस", river: "नदी", namghar: "नामघर", flute: "बासरी", bazaar: "बाजार", birds: "पक्षी" },
  },
  ne: {
    title: "पारिवारिक सम्झना र शान्त ध्वनि (घरको प्रतिध्वनि)",
    subtitle: "जीवन्त ३डी दृश्यहरू, शान्त क्षेत्रीय ध्वनिहरू र सुरक्षित भविष्यका सन्देशहरू",
    launchPlayer: "प्लेयर सुरु गर्नुहोस्",
    new3DScene: "नयाँ ३डी दृश्य",
    sealTimeCapsule: "नयाँ टाइम क्याप्सुल सिल गर्नुहोस्",
    tabScenes: "३डी जीवन्त दृश्यहरू",
    tabTimeCapsules: "भविष्यका टाइम क्याप्सुलहरू",
    capsulesReady: "जीवन्त क्याप्सुलहरू तयार",
    spatialAudioActive: "३डी स्थानिक ध्वनि: सक्रिय",
    gazeTrackingCalibrated: "वेबक्याम दृष्टि ट्र्याकिङ: क्यालिब्रेट गरिएको",
    latestSession: "पछिल्लो सत्र",
    completedStatus: "सम्पन्न",
    autoRecordedTelemetry: "दृष्टि संलग्नता र भावनात्मक प्रतिक्रिया स्वतः रेकर्ड हुन्छ",
    hotspots: "हटस्पटहरू",
    scene3D: "३डी दृश्य",
    voiceNoteFrom: "ध्वनि सन्देश प्रेषक",
    experienceBtn: "अनुभव लिनुहोस्",
    futureIdentityTitle: "भविष्यका दिनहरूका लागि पहिचान र ढाडसका सन्देशहरू",
    futureIdentityDesc: "जब बिरामी अन्योलमा पर्छन् वा चाडपर्वहरूमा, यी बन्द क्याप्सुलहरूले भावनात्मक भरोसा दिन्छन्।",
    byAuthor: "द्वारा",
    forRecipient: "का लागि",
    listenNote: "सन्देश सुन्नुहोस्",
    playing: "बज्दै छ...",
    stageView: "मञ्च हेर्नुहोस्",
    sounds: { rain: "वर्षा", river: "नदी", namghar: "नामघर", flute: "बाँसुरी", bazaar: "बजार", birds: "चरा" },
  },
  mni: {
    title: "ইমুংগী নীংশিংবা অমসুং তন্থাদুনা লৈবা ঈখোল (য়ুমগী খোঞ্জেল)",
    subtitle: "হিংলিবা ৩ডি শক্তমশিং, শান্তি ওইবা লমদমগী ঈখোলশিং অমসুং তুংগী পাউজেলশিং",
    launchPlayer: "প্লেয়ার হাংদোকউ",
    new3DScene: "অনৌবা ৩ডি শক্তম",
    sealTimeCapsule: "অনৌবা মতম কেপসুল লোইশিল্লু",
    tabScenes: "৩ডি হিংলিবা শক্তমশিং",
    tabTimeCapsules: "তুংগী মতম কেপসুলশিং",
    capsulesReady: "হিংলিবা কেপসুল শেম-শাদুনা লৈরে",
    spatialAudioActive: "৩ডি মফমগী ঈখোল: চৎনরে",
    gazeTrackingCalibrated: "ৱেবকেম য়েংবগী চাং: চপ চারে",
    latestSession: "অরোইবা সেসন",
    completedStatus: "লোইরে",
    autoRecordedTelemetry: "য়েংবগী চাং অমসুং পুক্নিংগী ৱাখল্লোন মথন্তা ইশিনখ্রে",
    hotspots: "হটস্পট",
    scene3D: "৩ডি শক্তম",
    voiceNoteFrom: "খোঞ্জেলগী পাউজেল পীরিবা",
    experienceBtn: "তেংবাং খঙউ",
    futureIdentityTitle: "তুংগী নুমিৎশিংগী শক্তাক অমসুং পাউজেলশিং",
    futureIdentityDesc: "নাহাক্কী অনাবা ৱাখল খাংদবা মতমদা নত্রগা হরাও-কুমহৈগী মতমদা মসিগী কেপসুল অসিনা পুক্নিংদা থৌনা হাপ্পা ওইগনি।",
    byAuthor: "নাকন্দগী",
    forRecipient: "গীদমক",
    listenNote: "খোঞ্জেল তাউ",
    playing: "খোঞ্জেল হৌরে...",
    stageView: "মফম য়েংবা",
    sounds: { rain: "নোং", river: "তুরেল", namghar: "নামঘর", flute: "তৌরোং", bazaar: "কৈথেল", birds: "উচেক" },
  },
  brx: {
    title: "नखरनि गोसोखांथि आरो शान्ति रिंखांथि (न'नि रिंखांथि)",
    subtitle: "थांना थानाय ३डी नुथाय, गोजोन थासारिनि रिंखांथि आरो सिगोननि खौरां",
    launchPlayer: "प्लेयर जागाय",
    new3DScene: "गोदान ३डी नुथाय",
    sealTimeCapsule: "गोदान सम क्यापसुल बन्द खालाम",
    tabScenes: "३डी नुथायफोर",
    tabTimeCapsules: "इउननि सम क्यापसुल",
    capsulesReady: "क्यापसुल थियारि जानानै दं",
    spatialAudioActive: "३डी जायगानि खोनासंथि: साख्रि",
    gazeTrackingCalibrated: "वेबकेम मेगन नायथिं: ठिक खालामनाय जाबाय",
    latestSession: "गोदानथार बाहागो",
    completedStatus: "जोबबाय",
    autoRecordedTelemetry: "मेगन नायनाय आरो गोसोनि सोलोंथाय गावआरियै दानो जादों",
    hotspots: "हटस्पट",
    scene3D: "३डी नुथाय",
    voiceNoteFrom: "राव खौरां हरग्रा",
    experienceBtn: "नुथाय नाय",
    futureIdentityTitle: "इउननि दिनाव सिनायथि आरो गोजोन खौरां",
    futureIdentityDesc: "जेब्ला बेरामी गोसोआव गोमोहाबनाय मोनो, बे खौरांफोरा गोसोखौ गोजोन खालामो।",
    byAuthor: "जों",
    forRecipient: "नि थाखाय",
    listenNote: "खौरां खोनासं",
    playing: "दामबाय थादों...",
    stageView: "स्टेज नुथाय",
    sounds: { rain: "अखा", river: "दैसा", namghar: "नामघर", flute: "सिफुं", bazaar: "हात", birds: "दाव" },
  },
  grt: {
    title: "Nokgimmikni Gisik Ra·ani aro Tom·tomna Ku·rang (Nokni Gam·ani)",
    subtitle: "Tangkanigipa 3D nikani, tom·tomanio ku·rang aro mikkangchina sea kattarang",
    launchPlayer: "Player-ko A·bachengbo",
    new3DScene: "Gital 3D Nikani",
    sealTimeCapsule: "Gital Somoi Capsule-ko Chipbo",
    tabScenes: "3D Tangkani Nikanirang",
    tabTimeCapsules: "Mikkangchi Somoi Capsulerang",
    capsulesReady: "Capsulerang Tariaha",
    spatialAudioActive: "3D Gam·ani: Kam Ka·enga",
    gazeTrackingCalibrated: "Webcam Mikron Nirikani: Namataha",
    latestSession: "Gitalba Session",
    completedStatus: "Matchotaha",
    autoRecordedTelemetry: "Mikron nirikani aro chanchiani an·tangari record ong·a",
    hotspots: "Hotspotrang",
    scene3D: "3D Nikani",
    voiceNoteFrom: "Ku·rang Knatani Nokgipa",
    experienceBtn: "U·i-masie Nibo",
    futureIdentityTitle: "Mikkangchina An·tangko U·iani aro Katta Pattiani",
    futureIdentityDesc: "Saenggipa manderang gisik brangon ba manianirango, ia chipgimin capsulerang kusi ong·ataniko on·a.",
    byAuthor: "Dakgipa",
    forRecipient: "On·gipa",
    listenNote: "Ku·rangko Knabo",
    playing: "Ring·enga...",
    stageView: "Mikkang Nibo",
    sounds: { rain: "Mikka", river: "Chibima", namghar: "Namghar", flute: "Bangsi", bazaar: "Anti", birds: "Do·o" },
  },
  kha: {
    title: "Ki Jingkynmaw Kmie-Kpa & Jingriew Jai-Jai (Jingriew na Ing)",
    subtitle: "Ki dur 3D ba im, ki sur jai-jai jong ka ri-lum, bad ki khubor ba la song na ka bynta ka lawei",
    launchPlayer: "Plie ia ka Jingpule",
    new3DScene: "Dur 3D ba Thymmai",
    sealTimeCapsule: "Khang ia ka Time Capsule Thymmai",
    tabScenes: "Ki Dur 3D ba Im",
    tabTimeCapsules: "Ki Time Capsule ka Lawei",
    capsulesReady: "Ki Capsule ba Im la biang",
    spatialAudioActive: "Suriew 3D: Trei kam",
    gazeTrackingCalibrated: "Jingpeit Khmat Webcam: La pynbiang bha",
    latestSession: "Ka Jingialang ba Khatduh",
    completedStatus: "La Dep",
    autoRecordedTelemetry: "Ka jingpeit bad jingsngew la riew pynsah hi marwei",
    hotspots: "Ki jaka ba paw",
    scene3D: "Dur 3D",
    voiceNoteFrom: "Khubor ktien na",
    experienceBtn: "Mad ia kane",
    futureIdentityTitle: "Jingshisha jong ka Jingim bad Khubor sha ka Lawei",
    futureIdentityDesc: "Haba u nongpang u dum ka jingmut ne ha ki por leh-kmen, kine ki capsule ki ai ka jingsuk bad jingkyrmen.",
    byAuthor: "Da",
    forRecipient: "Na ka bynta",
    listenNote: "Sngap ia ka Ktien",
    playing: "Dang sawa...",
    stageView: "Peit Rynsan",
    sounds: { rain: "Slap", river: "Wah", namghar: "Namghar", flute: "Besli", bazaar: "Iew", birds: "Sim" },
  },
  lus: {
    title: "Chhungkua Hriatrengna leh Thawm Ralmuang (In Lam Thawm)",
    subtitle: "3D thil awmze nei, hmarchhak thawm ralmuang, leh nakin zela tan thuchah vawn thratte",
    launchPlayer: "Player Hawng Rawh",
    new3DScene: "3D Lem Tharlam",
    sealTimeCapsule: "Hun Bawm Tharlam Chhin Rawh",
    tabScenes: "3D Nunphung Lemte",
    tabTimeCapsules: "Nakin Zela Hun Bawmte",
    capsulesReady: "Hun Bawm Hman Theih",
    spatialAudioActive: "3D Thawm: A Nung",
    gazeTrackingCalibrated: "Webcam Mithluk Enzuihna: A Fim Tawk",
    latestSession: "Zirna Hnai Ber",
    completedStatus: "Zo Ta",
    autoRecordedTelemetry: "Mit fawhna leh rilru chetvelna chu amahin a in-record vek e",
    hotspots: "Hmun Pawimawhte",
    scene3D: "3D Lem",
    voiceNoteFrom: "Aw Thuchah Petu",
    experienceBtn: "Tem Chhin Rawh",
    futureIdentityTitle: "Nakin Zela Mahni Inhriatfiahna leh Thlamuanna Thuchah",
    futureIdentityDesc: "Damlo a lo buai chang emaw kutpui hunah, he hun bawm hian rilru thlamuanna leh chakna a pe thin.",
    byAuthor: "Ziaktu",
    forRecipient: "Tan",
    listenNote: "Thuchah Ngaithla Rawh",
    playing: "A ri mek...",
    stageView: "Lem Enna",
    sounds: { rain: "Ruah", river: "Lui", namghar: "Namghar", flute: "Rauhlung", bazaar: "Dawr", birds: "Sava" },
  },
};

function SoundIcon({ type }: { type: AmbientSoundType }) {
  if (type === "rain") return <CloudRain className="h-3.5 w-3.5 text-emerald-700" />;
  if (type === "river") return <Waves className="h-3.5 w-3.5 text-teal-700" />;
  if (type === "namghar") return <Bell className="h-3.5 w-3.5 text-amber-700" />;
  if (type === "flute") return <Music className="h-3.5 w-3.5 text-teal-700" />;
  if (type === "bazaar") return <Store className="h-3.5 w-3.5 text-orange-700" />;
  return <Bird className="h-3.5 w-3.5 text-emerald-700" />;
}

export function CaregiverCapsuleVaultCard({
  patientId,
  patientName,
}: CaregiverCapsuleVaultCardProps) {
  const locale = useLocale();
  const t = CAPSULE_VAULT_I18N[locale] || CAPSULE_VAULT_I18N.en;

  const [activeTab, setActiveTab] = useState<"scenes" | "timeCapsules">("scenes");
  const [capsules, setCapsules] = useState<MemoryCapsule[]>(() =>
    getAllCapsulesForPatient(patientId)
  );
  const [timeCapsules, setTimeCapsules] = useState<FutureTimeCapsule[]>(() =>
    getFutureTimeCapsules(patientId)
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTimeCapsuleModalOpen, setIsTimeCapsuleModalOpen] = useState(false);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const logs = getCapsuleSessionLogs(patientId);

  const handleCreated = (newCapsule: MemoryCapsule) => {
    setCapsules((prev) => [newCapsule, ...prev]);
  };

  const handleTimeCapsuleClose = () => {
    setIsTimeCapsuleModalOpen(false);
    setTimeCapsules(getFutureTimeCapsules(patientId));
  };

  const handlePlayVoice = (cap: FutureTimeCapsule) => {
    if (playingVoiceId === cap.id) {
      stopSpeaking();
      setPlayingVoiceId(null);
      return;
    }
    stopSpeaking();
    setPlayingVoiceId(cap.id);
    speak(cap.messageText, locale, 0.82, undefined, () => {
      setPlayingVoiceId(null);
    });
  };

  return (
    <div className="scrapbook-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border-soft pb-4 mb-4">
        <div>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-600" />
            <span>{t.title}</span>
          </h2>
          <p className="text-sm text-ink-secondary mt-0.5">
            {t.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/patient/echoes-of-home?capsuleId=${capsules[0]?.id || ""}`}
            className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3.5 py-1.5 text-xs font-black text-ink shadow-[2px_2px_0px_#000] hover:bg-amber-50 cursor-pointer"
          >
            <Play className="h-3.5 w-3.5 text-tea fill-tea" />
            <span>{t.launchPlayer}</span>
          </Link>

          {activeTab === "scenes" ? (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea px-3.5 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-tea-dark cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{t.new3DScene}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsTimeCapsuleModalOpen(true)}
              className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-600 px-3.5 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-amber-700 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>{t.sealTimeCapsule}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab("scenes")}
          className={`px-4 py-2 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "scenes"
              ? "bg-tea text-white shadow-[2px_2px_0px_#000]"
              : "bg-surface text-ink hover:bg-surface-muted shadow-xs"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>{t.tabScenes} ({capsules.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("timeCapsules")}
          className={`px-4 py-2 rounded-xl text-xs font-black border-2 border-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "timeCapsules"
              ? "bg-amber-600 text-white shadow-[2px_2px_0px_#000]"
              : "bg-surface text-ink hover:bg-surface-muted shadow-xs"
          }`}
        >
          <Clock className="h-4 w-4" />
          <span>{t.tabTimeCapsules} ({timeCapsules.length})</span>
        </button>
      </div>

      {/* Clinical Telemetry & Engagement Strip */}
      <div className="mb-5 rounded-2xl border-2 border-black bg-amber-50/70 p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-ink">
              <strong>{capsules.length}</strong> {t.capsulesReady}
            </span>
          </div>
          <span className="text-ink-secondary hidden sm:inline">•</span>
          <span className="font-bold text-ink hidden sm:inline">
            {t.spatialAudioActive}
          </span>
          <span className="text-ink-secondary hidden sm:inline">•</span>
          <span className="font-bold text-ink hidden md:inline">
            {t.gazeTrackingCalibrated}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-ink-secondary font-bold">
          {logs.length > 0 ? (
            <span className="text-emerald-900 bg-emerald-100 border border-emerald-300 rounded-lg px-2.5 py-0.5 font-black text-[11px]">
              {t.latestSession}: {logs[0].caregiverObservation ? `Patient ${logs[0].caregiverObservation}` : t.completedStatus} ({logs[0].durationSeconds}s)
            </span>
          ) : (
            <span className="text-[11px] text-ink-secondary">
              {t.autoRecordedTelemetry}
            </span>
          )}
        </div>
      </div>

      {/* Grid of Capsules or Time Capsules */}
      {activeTab === "scenes" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {capsules.map((cap) => (
            <div
              key={cap.id}
              className="group relative rounded-2xl border-3 border-black bg-surface p-3.5 shadow-[4px_4px_0px_#000] flex flex-col justify-between hover:translate-y-[-2px] transition-transform"
            >
              <div>
                {/* Photo Banner with Badges */}
                <div className="relative h-36 w-full rounded-xl overflow-hidden border-2 border-black mb-3 bg-slate-900">
                  <img
                    src={cap.photoUrl}
                    alt={cap.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <span className="inline-flex items-center gap-1 rounded-full border border-black/40 bg-white/90 px-2 py-0.5 text-[10px] font-black text-ink backdrop-blur-xs">
                      <SoundIcon type={cap.ambientSoundType} />
                      <span className="capitalize">{t.sounds[cap.ambientSoundType] || cap.ambientSoundType}</span>
                    </span>
                    {cap.hotspots && cap.hotspots.length > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-600 bg-amber-300 px-2 py-0.5 text-[10px] font-black text-amber-950">
                        <Sparkles className="h-3 w-3" />
                        <span>{cap.hotspots.length} {t.hotspots}</span>
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2 right-2">
                    <span className="inline-flex items-center gap-1 rounded-full border border-black/40 bg-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-950">
                      <Layers className="h-3 w-3" />
                      <span>{t.scene3D}</span>
                    </span>
                  </div>

                  {/* Bottom Photo Title */}
                  <div className="absolute bottom-2 left-2 right-2 text-white">
                    <span className="text-[10px] font-semibold text-white/80 block truncate">
                      {cap.locationName}
                    </span>
                    <h3 className="font-serif text-sm font-black text-white leading-tight line-clamp-1">
                      {cap.title}
                    </h3>
                  </div>
                </div>

                {/* Family voice note preview */}
                <div className="rounded-xl border border-black/10 bg-amber-50/70 p-2.5 mb-3 text-xs">
                  <div className="flex items-center gap-1.5 text-amber-900 font-bold mb-1">
                    <Volume2 className="h-3.5 w-3.5 text-amber-800 shrink-0" />
                    <span className="text-[11px] font-black">
                      {t.voiceNoteFrom} {cap.familyMemberName} ({cap.relationship})
                    </span>
                  </div>
                  <p className="text-[11px] text-ink italic line-clamp-2 leading-relaxed">
                    "{cap.voiceNoteText}"
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-black/10">
                <span className="text-[10px] font-bold text-ink-secondary capitalize">
                  {cap.seasonOrTime}
                </span>
                <Link
                  href={`/patient/echoes-of-home?capsuleId=${cap.id}`}
                  className="btn-tactile inline-flex items-center gap-1.5 rounded-lg border-2 border-black bg-tea-light px-3 py-1 text-xs font-black text-tea-dark shadow-[1px_1px_0px_#000] hover:bg-tea hover:text-white cursor-pointer transition-colors"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{t.experienceBtn}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border-2 border-amber-300 bg-amber-50/80 p-3 text-xs text-amber-950 flex items-start gap-2.5">
            <Clock className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                {t.futureIdentityTitle}
              </p>
              <p className="text-amber-900/90 text-[11px] mt-0.5 leading-relaxed">
                {t.futureIdentityDesc}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeCapsules.map((tc) => {
              const isPlaying = playingVoiceId === tc.id;
              return (
                <div
                  key={tc.id}
                  className="group rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000] flex flex-col justify-between hover:translate-y-[-2px] transition-transform"
                >
                  <div>
                    {/* Header badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 rounded-full border border-black/20 bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-900">
                        <Lock className="h-3 w-3" />
                        <span className="capitalize">{tc.milestone.replace("_", " ")}</span>
                      </span>
                      <span className="text-[10px] font-bold text-ink-secondary">
                        {new Date(tc.sealedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="font-serif text-base font-black text-ink mb-1">
                      {tc.title}
                    </h3>
                    <p className="text-[11px] font-bold text-ink-secondary mb-3">
                      {t.byAuthor} {tc.authorName} • {t.forRecipient} {tc.recipient.replace("_", " ")}
                    </p>

                    {/* Photo if present */}
                    {tc.photoUrl && (
                      <div className="relative h-32 w-full rounded-xl overflow-hidden border-2 border-black mb-3">
                        <img
                          src={tc.photoUrl}
                          alt={tc.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Message Card */}
                    <div className="rounded-xl border border-black/10 bg-amber-50/60 p-3 mb-3 text-xs leading-relaxed text-ink italic font-serif">
                      "{tc.messageText}"
                    </div>
                  </div>

                  {/* Audio note button */}
                  <div className="pt-2 border-t border-black/10 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handlePlayVoice(tc)}
                      className={`btn-tactile inline-flex items-center gap-1.5 rounded-lg border-2 border-black px-2.5 py-1 text-xs font-black cursor-pointer ${
                        isPlaying
                          ? "bg-emerald-500 text-white"
                          : "bg-white text-ink hover:bg-amber-100 shadow-[1px_1px_0px_#000]"
                      }`}
                    >
                      <Volume2 className={`h-3.5 w-3.5 ${isPlaying ? "animate-bounce" : ""}`} />
                      <span>{isPlaying ? t.playing : t.listenNote}</span>
                    </button>

                    <Link
                      href="/patient/echoes-of-home"
                      className="text-xs font-black text-tea hover:underline inline-flex items-center gap-1"
                    >
                      <span>{t.stageView}</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <CreateCapsuleModal
        patientId={patientId}
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleCreated}
      />

      <FutureTimeCapsuleModal
        patientId={patientId}
        patientName={patientName}
        isOpen={isTimeCapsuleModalOpen}
        onClose={handleTimeCapsuleClose}
        langCode={locale}
      />
    </div>
  );
}
