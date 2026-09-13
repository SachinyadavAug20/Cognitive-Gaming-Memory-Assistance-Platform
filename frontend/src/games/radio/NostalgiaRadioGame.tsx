"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { Radio, Music, Search, Bell, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { BihuDholIcon } from "@/components/ui/CulturalIcons";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { MemoryLightbox } from "@/components/ui/MemoryLightbox";
import {
  playPress,
  playCorrect,
  playComplete,
  playRadioTune,
  playLifeSong,
  playLandmarkChime,
  playDholBeat,
} from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";
import { getMediaUrl } from "@/lib/api";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { getGameStrings, type SupportedLocale } from "@/lib/gameI18n";

export interface RadioStation {
  id: string;
  freq: number; // e.g. 600 kHz
  title: string;
  stationName: string;
  desc: string;
  soundType: "flute" | "chimes" | "dhol" | "calm";
}

function renderStationIcon(id: string, className = "h-6 w-6") {
  switch (id) {
    case "guwahati":
      return <Music className={className} />;
    case "shillong":
      return <Bell className={className} />;
    case "bihu":
      return <BihuDholIcon className={className} />;
    default:
      return <Radio className={className} />;
  }
}

const STATIONS: RadioStation[] = [
  {
    id: "guwahati",
    freq: 600,
    title: "Akashvani Guwahati",
    stationName: "Folk Airs & Brahmaputra Melodies",
    desc: "Acoustic flute melodies reminiscent of Dr. Bhupen Hazarika.",
    soundType: "flute",
  },
  {
    id: "shillong",
    freq: 840,
    title: "Akashvani Shillong",
    stationName: "Cathedral Chimes & Choral Airs",
    desc: "Peaceful Sunday cathedral bells and evening hymn harmonies.",
    soundType: "chimes",
  },
  {
    id: "bihu",
    freq: 1040,
    title: "Village Gramophone",
    stationName: "Festive Dhol & Spring Rhythms",
    desc: "Heartwarming rhythmic beats of the spring harvest festival.",
    soundType: "dhol",
  },
  {
    id: "tea-news",
    freq: 1300,
    title: "Hilltop Weather & Memories",
    stationName: "Evening Veranda Stories",
    desc: "Soothing acoustic tunes and childhood nostalgic airs.",
    soundType: "calm",
  },
];

interface RadioStationLocalized {
  title: string;
  stationName: string;
  desc: string;
}

interface RadioI18nEntry {
  receiverName: string;
  stationsTuned: (tuned: number, total: number) => string;
  deluxeBadge: string;
  tunePrompt: string;
  tapToTune: string;
  tunedBadge: string;
  replayBroadcast: string;
  scoreText: (score: number, total: number) => string;
  allTunedSpeech: string;
  viewPhoto: string;
  closeLabel: string;
  listenLabel: string;
  speakingLabel: string;
  stations: Record<string, RadioStationLocalized>;
}

const RADIO_I18N: Record<SupportedLocale, RadioI18nEntry> = {
  as: {
    receiverName: "আকাশবাণী ৰেডিঅ'",
    stationsTuned: (c, t) => `${c} / ${t} কেন্দ্ৰ সংযোগ কৰা হ'ল`,
    deluxeBadge: "আকাশবাণী ডিলাক্স",
    tunePrompt: "তলৰ এটা কেন্দ্ৰ বাছক",
    tapToTune: "পুৰণি সুৰীয়া কেন্দ্ৰ সংযোগ কৰক",
    tunedBadge: "সংযুক্ত",
    replayBroadcast: "লোকগীতৰ সম্প্ৰচাৰ পুনৰ শুনক",
    scoreText: (s, t) => `স্ক'ৰ: ${s}/${t}`,
    allTunedSpeech: "আপুনি সকলো আকাশবাণী কেন্দ্ৰ সংযোগ কৰিলে! এই সুৰীয়া স্মৃতি সদায় আপোনাৰ অন্তৰত থাকিব।",
    viewPhoto: "ছবি চাওক",
    closeLabel: "বন্ধ কৰক",
    listenLabel: "শুনক",
    speakingLabel: "শুনি আছে...",
    stations: {
      guwahati: { title: "আকাশবাণী গুৱাহাটী", stationName: "ব্ৰহ্মপুত্ৰৰ সুৰ আৰু লোকগীত", desc: "ড° ভূপেন হাজৰিকাৰ স্মৃতি বিজড়িত বাঁহীৰ সুৰীয়া গীত।" },
      shillong: { title: "আকাশবাণী শ্বিলং", stationName: "গিৰ্জাৰ ঘণ্টা আৰু প্ৰাৰ্থনা সংগীত", desc: "দেওবৰীয়া গিৰ্জাৰ সুৰীয়া ঘণ্টা আৰু সন্ধিয়াৰ শান্ত সংগীত।" },
      bihu: { title: "গাঁৱৰ গ্ৰামোফোন", stationName: "ব'হাগী ঢোল আৰু বসন্তৰ সুৰ", desc: "বসন্তৰ ৰঙালী বিহুৰ মন মতলীয়া কৰা ঢোলৰ চাপ।" },
      "tea-news": { title: "পাহাৰীয়া বতৰ আৰু স্মৃতি", stationName: "সন্ধিয়া চ'ৰাৰ পুৰণি সাধু", desc: "শৈশৱৰ মিঠা স্মৃতি আৰু মন শান্ত কৰা পুৰণি গান।" },
    },
  },
  hi: {
    receiverName: "आकाशवाणी रेडियो",
    stationsTuned: (c, t) => `${c} / ${t} स्टेशन ट्यून हुए`,
    deluxeBadge: "आकाशवाणी डीलक्स",
    tunePrompt: "नीचे से कोई स्टेशन चुनें",
    tapToTune: "पारंपरिक रेडियो स्टेशन ट्यून करें",
    tunedBadge: "ट्यून किया",
    replayBroadcast: "लोकगीत प्रसारण दोबारा सुनें",
    scoreText: (s, t) => `अंक: ${s}/${t}`,
    allTunedSpeech: "आपने सभी पारंपरिक रेडियो स्टेशन सुन लिए! ये मधुर स्मृतियां सदा आपके हृदय में रहेंगी।",
    viewPhoto: "देखें",
    closeLabel: "बंद करें",
    listenLabel: "सुनें",
    speakingLabel: "सुन रहे हैं...",
    stations: {
      guwahati: { title: "आकाशवाणी गुवाहाटी", stationName: "ब्रह्मपुत्र की मधुर धुनें", desc: "डॉ. भूपेन हजारिका की याद दिलाने वाली बांसुरी की धुन।" },
      shillong: { title: "आकाशवाणी शिलांग", stationName: "चर्च की घंटियां और शांत संगीत", desc: "रविवार के चर्च की घंटियां और शांत प्रार्थना के स्वर।" },
      bihu: { title: "गांव का ग्रामोफोन", stationName: "उत्सव का ढोल और बिहू ताल", desc: "वसंत ऋतु के बिहू उत्सव का आनंदमयी ढोल नाद।" },
      "tea-news": { title: "पहाड़ी मौसम और यादें", stationName: "शाम के बरामदे की कहानियां", desc: "बचपन की सुनहरी यादों और मन को छूने वाली धुनें।" },
    },
  },
  en: {
    receiverName: "Akashvani Receiver",
    stationsTuned: (c, t) => `${c} / ${t} Stations Tuned`,
    deluxeBadge: "Akashvani Deluxe",
    tunePrompt: "Tune into a station below",
    tapToTune: "Tap to Tune Into Heritage Frequencies",
    tunedBadge: "Tuned",
    replayBroadcast: "Replay Folk Broadcast",
    scoreText: (s, t) => `Score: ${s}/${t}`,
    allTunedSpeech: "You have tuned into all heritage radio stations! The memories and melodies are forever in your heart.",
    viewPhoto: "View",
    closeLabel: "Close",
    listenLabel: "Listen",
    speakingLabel: "Listening...",
    stations: {
      guwahati: { title: "Akashvani Guwahati", stationName: "Folk Airs & Brahmaputra Melodies", desc: "Acoustic flute melodies reminiscent of Dr. Bhupen Hazarika." },
      shillong: { title: "Akashvani Shillong", stationName: "Cathedral Chimes & Choral Airs", desc: "Peaceful Sunday cathedral bells and evening hymn harmonies." },
      bihu: { title: "Village Gramophone", stationName: "Festive Dhol & Spring Rhythms", desc: "Heartwarming rhythmic beats of the spring harvest festival." },
      "tea-news": { title: "Hilltop Weather & Memories", stationName: "Evening Veranda Stories", desc: "Soothing acoustic tunes and childhood nostalgic airs." },
    },
  },
  bn: {
    receiverName: "আকাশবাণী রিসিভার",
    stationsTuned: (c, t) => `${c} / ${t} স্টেশন যুক্ত হয়েছে`,
    deluxeBadge: "আকাশবাণী ডিলাক্স",
    tunePrompt: "নিচের স্টেশন থেকে পছন্দ করুন",
    tapToTune: "ঐতিহ্যবাহী রেডিও সুর খুঁজুন",
    tunedBadge: "যুক্ত",
    replayBroadcast: "লোকগীতি আবার শুনুন",
    scoreText: (s, t) => `স্কোর: ${s}/${t}`,
    allTunedSpeech: "আপনি সমস্ত ঐতিহ্যবাহী রেডিও স্টেশন শুনেছেন! এই মধুর স্মৃতি আপনার হৃদয়ে চির অম্লান থাকবে।",
    viewPhoto: "ছবি দেখুন",
    closeLabel: "বন্ধ করুন",
    listenLabel: "শুনুন",
    speakingLabel: "শুনছেন...",
    stations: {
      guwahati: { title: "আকাশবাণী গুয়াহাটি", stationName: "ব্রহ্মপুত্রের সুর ও লোকগীতি", desc: "ডঃ ভূপেন হাজারিকার স্মৃতিবিজড়িত বাঁশির সুর।" },
      shillong: { title: "আকাশবাণী শিলং", stationName: "গির্জার ঘণ্টা ও ভক্তিমূলক সুর", desc: "রবিবাসরীয় গির্জার ঘণ্টা ও সান্ধ্য সুরের মূর্ছনা।" },
      bihu: { title: "গ্রামের গ্রামোফোন", stationName: "উৎসবের ঢোল ও বিহু ছন্দ", desc: "বসন্তকালীন বিহু উৎসবের আনন্দময় মধুর তাল।" },
      "tea-news": { title: "পাহাড়ি আবহাওয়া ও স্মৃতি", stationName: "সন্ধ্যার বারান্দার গল্প", desc: "শৈশবের সোনালী দিন ও মন ভালো করা গান।" },
    },
  },
  mr: {
    receiverName: "आकाशवाणी रेडिओ",
    stationsTuned: (c, t) => `${c} / ${t} स्टेशन्स जोडले`,
    deluxeBadge: "आकाशवाणी डिलक्स",
    tunePrompt: "खालील स्टेशन निवडा",
    tapToTune: "पारंपरिक रेडिओ स्टेशन्स ट्यून करा",
    tunedBadge: "जोडले",
    replayBroadcast: "लोकगीत प्रसारण पुन्हा ऐका",
    scoreText: (s, t) => `गुण: ${s}/${t}`,
    allTunedSpeech: "तुम्ही सर्व पारंपरिक रेडिओ स्टेशन्स ट्यून केली आहेत! या गोड आठवणी सदैव तुमच्या मनात राहतील.",
    viewPhoto: "पहा",
    closeLabel: "बंद करा",
    listenLabel: "ऐका",
    speakingLabel: "ऐकत आहे...",
    stations: {
      guwahati: { title: "आकाशवाणी गुवाहाटी", stationName: "ब्रह्मपुत्रेचे सूर आणि लोकगीते", desc: "डॉ. भूपेन हजारिका यांच्या स्मृती जागवणारी बासरीची धून." },
      shillong: { title: "आकाशवाणी शिलाँग", stationName: "चर्चच्या घंटा आणि शांत संगीत", desc: "रविवारच्या प्रार्थनेचे मधुर स्वर आणि घंटा नाद." },
      bihu: { title: "गावचा ग्रामोफोन", stationName: "उत्सवाचा ढोल आणि बिहू ताल", desc: "वसंतोत्सवाचा आनंददायी ढोल ताल." },
      "tea-news": { title: "डोंगराळ हवामान आणि आठवणी", stationName: "संध्याकाळच्या गप्पा", desc: "लहानपणीच्या गोड आठवणी आणि सुखद गाणी." },
    },
  },
  ne: {
    receiverName: "आकाशवाणी रेडियो",
    stationsTuned: (c, t) => `${c} / ${t} स्टेशनहरू ट्युन गरियो`,
    deluxeBadge: "आकाशवाणी डिलक्स",
    tunePrompt: "तलबाट स्टेशन चयन गर्नुहोस्",
    tapToTune: "परम्परागत रेडियो स्टेशन ट्युन गर्नुहोस्",
    tunedBadge: "ट्युन भयो",
    replayBroadcast: "लोकगीत प्रसारण फेरि सुन्नुहोस्",
    scoreText: (s, t) => `अङ्क: ${s}/${t}` ,
    allTunedSpeech: "तपाईंले सबै परम्परागत रेडियो स्टेशनहरू सुन्नुभयो! यी मीठा सम्झनाहरू सधैं तपाईंको हृदयमा रहनेछन्।",
    viewPhoto: "हेर्नुहोस्",
    closeLabel: "बन्द गर्नुहोस्",
    listenLabel: "सुन्नुहोस्",
    speakingLabel: "सुन्दै...",
    stations: {
      guwahati: { title: "आकाशवाणी गुवाहाटी", stationName: "ब्रह्मपुत्रका धुनहरू र लोकगीत", desc: "डा. भूपेन हजारिकाको सम्झना दिलाउने बाँसुरीको धुन।" },
      shillong: { title: "आकाशवाणी शिलोङ", stationName: "चर्चको घण्टी र भजन", desc: "आइतबारको चर्चको घण्टी र शान्त प्रार्थनाको स्वर।" },
      bihu: { title: "गाउँको ग्रामोफोन", stationName: "बिहुको ढोल र वसन्तको ताल", desc: "वसन्त ऋतुको उत्सवमय ढोलको धुन।" },
      "tea-news": { title: "पहाडी मौसम र सम्झनाहरू", stationName: "साँझको बार्दलीका कथाहरू", desc: "बाल्यकालका मीठा सम्झना र मन छुने गीतहरू।" },
    },
  },
  mni: {
    receiverName: "আকাশবাণী রেদিও",
    stationsTuned: (c, t) => `স্তেশন ${c} / ${t} শম্লবনি`,
    deluxeBadge: "আকাশবাণী দিলক্স",
    tunePrompt: "মখাগী স্তেশন অমা খনবীয়ু",
    tapToTune: "অরিবা রেদিও স্তেশনদা নম্বীয়ু",
    tunedBadge: "শম্লে",
    replayBroadcast: "মীয়ামগী ঈশৈ অমুক হন্না তাবীয়ু",
    scoreText: (s, t) => `স্কোর: ${s}/${t}`,
    allTunedSpeech: "অদোম্না পুন্সিগী রেদিও স্তেশন পুম্নমক শমখ্রে! নীংশিংবা সুরশিং অসি থম্মোয়দা চহি চুপ্পা লৈহৌরগনি।",
    viewPhoto: "য়েংবীয়ু",
    closeLabel: "থিংশিনবীয়ু",
    listenLabel: "তাবীয়ু",
    speakingLabel: "তারি...",
    stations: {
      guwahati: { title: "আকাশবাণী গুৱাহাতী", stationName: "ব্রহ্মপুত্রগী সুর অমসুং লোকগীত", desc: "ড০ ভূপেন হাজারিকাগী নীংশিংবা বাঁহীগী সুর।" },
      shillong: { title: "আকাশবাণী শিলং", stationName: "চার্চকী ঘণ্টা অমসুং সেবাকী সুর", desc: "নোংমাইজিংগী চার্চকী ঘণ্টা অমসুং নুমিদাংৱাইগী শান্তি সুর।" },
      bihu: { title: "খুঙ্গংগী গ্রামোফোন", stationName: "বিহুগী ঢোল অমসুং য়েন্থি সুর", desc: "য়েন্থিগী কুহ্মৈগী নুঙাইরবা ঢোলগী খোন্থোক।" },
      "tea-news": { title: "চিঙগী নোংজু-নুংশিৎ অমসুং নীংশিংবা", stationName: "নুমিদাংগী ৱারী", desc: "অঙাং ওইরিঙৈগী নুংশিবা স্মৃতি অমসুং সুর।" },
    },
  },
  brx: {
    receiverName: "आकाशवाणी रेडियो",
    stationsTuned: (c, t) => `स्टेशन ${c} / ${t} सोदोब सुनाय जाबाय`,
    deluxeBadge: "आकाशवाणी डिलाक्स",
    tunePrompt: "गाहायाव थानाय स्टेशन सायख'",
    tapToTune: "आगोलाव थानाय रेडियो सोदोब ट्युन खालाम",
    tunedBadge: "ट्युन जाबाय",
    replayBroadcast: "हारिमुनि रोजाबनायखौ फिन खोनासं",
    scoreText: (s, t) => `नम्बर: ${s}/${t}`,
    allTunedSpeech: "नोंथाङा गासै रेडियो स्टेशनफोरखौ ट्युन खालामजोबबाय! बे मोजां रोजाबनायफोरा नोंथांनि गोसोआव थागोन।",
    viewPhoto: "नाय",
    closeLabel: "बन्द खालाम",
    listenLabel: "खोनासं",
    speakingLabel: "खोनासं सोलिबाय...",
    stations: {
      guwahati: { title: "आकाशवाणी गुवाहाटी", stationName: "ब्रह्मपुत्रनि मोखां आरो हारिमुनि रोजाबनाय", desc: "डा. भूपेन हाजारिकानि गोसोखां सिफुंनि सुंद' सोदोब।" },
      shillong: { title: "आकाशवाणी शिलंग", stationName: "गिरजानि घन्टा आरो सोदोब", desc: "रबिबारनि गिरजानि घन्टा आरो बेलासिनि मोजां सोदोब।" },
      bihu: { title: "गामिनि ग्रामोफोन", stationName: "बिहुनि ढोल आरो बोसाकनि ताल", desc: "बोसाक बिहुनि गोजोन ढोलनि सोदोब।" },
      "tea-news": { title: "जोमै हाजो आरो गोसोखां", stationName: "बेलासिनि बाथ्रा", desc: "उन्दै समाव थानाय मोजां गोसोखां रोजाबनाय।" },
    },
  },
  grt: {
    receiverName: "Akashvani Radio",
    stationsTuned: (c, t) => `Station ${c} / ${t} Tuned`,
    deluxeBadge: "Akashvani Deluxe",
    tunePrompt: "Ka'mao station-ko seokbo",
    tapToTune: "Skango station-ona tunebo",
    tunedBadge: "Tuned",
    replayBroadcast: "Gitko Pil'knabo",
    scoreText: (s, t) => `Score: ${s}/${t}`,
    allTunedSpeech: "Na'a pilak radio station-rangko tune matchotaha! Git aro gisik ra'anirang nang'ni ka'tongo dongaingena.",
    viewPhoto: "Nibo",
    closeLabel: "Chipbo",
    listenLabel: "Knabo",
    speakingLabel: "Knaenga...",
    stations: {
      guwahati: { title: "Akashvani Guwahati", stationName: "Brahmaputra Git", desc: "Dr. Bhupen Hazarika ko gisik ra'ani bangsi git." },
      shillong: { title: "Akashvani Shillong", stationName: "Gilja Kinta aro Git", desc: "Robibar giljani kinta aro attaomitingni tom'toma git." },
      bihu: { title: "Songni Gramophone", stationName: "Bihu Dama aro Git", desc: "A'bachengani somoini katchabeani dama dokani." },
      "tea-news": { title: "A'brini Buring aro Gisik", stationName: "Attam Golporang", desc: "Bikrok somoini nama git aro gisik ra'anirang." },
    },
  },
  kha: {
    receiverName: "Akashvani Radio",
    stationsTuned: (c, t) => `${c} / ${t} ki Station la pyndait`,
    deluxeBadge: "Akashvani Deluxe",
    tunePrompt: "Jied ia ka station harum",
    tapToTune: "Pyntreikam ia ki Station Radio rim",
    tunedBadge: "La Pyndait",
    replayBroadcast: "Put biang ia ki Sur Tynrai",
    scoreText: (s, t) => `Mark: ${s}/${t}`,
    allTunedSpeech: "Phi la sngap ia baroh ki radio station tynrai! Kine ki sur kin sah kynmaw junom ha ka dohnud jong phi.",
    viewPhoto: "Peit",
    closeLabel: "Khang",
    listenLabel: "Sngap",
    speakingLabel: "Dang sngap...",
    stations: {
      guwahati: { title: "Akashvani Guwahati", stationName: "Ki Sur Wah Brahmaputra", desc: "Ka besli kaba pynkynmaw ia i Dr. Bhupen Hazarika." },
      shillong: { title: "Akashvani Shillong", stationName: "Ki Shakuriaw Iingmane Shillong", desc: "Ki shakuriaw sngi u Blei bad ki jingrwai mane hajan janmiet." },
      bihu: { title: "Ka Gramophone Nongkyndong", stationName: "Ka Bom Bihu bad Sur Pyrem", desc: "Ka jingsawa bom kaba kmen ha ka aiom pyrem." },
      "tea-news": { title: "Ka Suinbneng bad Jingkynmaw Lum", stationName: "Ki Jingiathuhkhana Janmiet", desc: "Ki sur kiba pyngngad bad ki jingkynmaw por rit." },
    },
  },
  lus: {
    receiverName: "Akashvani Radio",
    stationsTuned: (c, t) => `Station ${c} / ${t} zawh a ni`,
    deluxeBadge: "Akashvani Deluxe",
    tunePrompt: "A hnuai ami station hi thlang rawh",
    tapToTune: "Hmanlai Radio Station Aw Zawng Rawh",
    tunedBadge: "Zawn Hmuh",
    replayBroadcast: "Hla Ngaihthlak Nawn Leh Rawh",
    scoreText: (s, t) => `Diem: ${s}/${t}`,
    allTunedSpeech: "Radio station zawng zawng i thlang chhuak vek ta! Hemi hla mawi leh hriatrengnate hi i thinlungah a cham reng tawh ang.",
    viewPhoto: "En rawh",
    closeLabel: "Khar rawh",
    listenLabel: "Ngaithla rawh",
    speakingLabel: "Ngaihthlak mek...",
    stations: {
      guwahati: { title: "Akashvani Guwahati", stationName: "Brahmaputra Hla Mawi", desc: "Dr. Bhupen Hazarika hriatrengna hrawmchan ri mawi." },
      shillong: { title: "Akashvani Shillong", stationName: "Kohhran Dar Ri leh Hla", desc: "Pathianni kohhran dar ri leh tlai lam fakna hla." },
      bihu: { title: "Khawte Gramophone", stationName: "Kut Khuang leh Thlasik Hla", desc: "Bihu kut a khuang ri mawi leh lungrun tak." },
      "tea-news": { title: "Tlangram Khua leh Hriatrengna", stationName: "Tlai Lam Ti ti", desc: "Naupan laia hla mawi leh rilru tihahdamtu." },
    },
  },
};

function GameShell({
  title,
  score,
  children,
}: {
  title: string;
  score: number;
  children: React.ReactNode;
}) {
  return (
    <section className="pb-12 bg-canvas min-h-screen">
      <GameHeader
        title={title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-tea"
        gameId="radio"
      />
      <div className="mx-auto max-w-3xl px-4 pt-6">{children}</div>
    </section>
  );
}

export function NostalgiaRadioGame() {
  const locale = useLocale();
  const normLocale = (locale?.split("-")[0]?.toLowerCase() || "en") as SupportedLocale;
  const radioUi = RADIO_I18N[normLocale] || RADIO_I18N.en;
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "radio", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "tune" | "done">("intro");
  const [currentFreq, setCurrentFreq] = useState(530);
  const [tunedStationId, setTunedStationId] = useState<string | null>(null);
  const [discoveredStations, setDiscoveredStations] = useState<string[]>([]);
  const [lightboxPhoto, setLightboxPhoto] = useState<{ title: string; url: string; note: string } | null>(null);
  const [score, setScore] = useState(0);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  const guard = useSessionGuard({
    patientId,
    gameId: "radio",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const activeStation = useMemo(
    () => STATIONS.find((s) => s.id === tunedStationId) ?? null,
    [tunedStationId]
  );

  // Associated memory photo for the tuned station
  const stationMemoryPhoto = useMemo(() => {
    if (!activeStation) return null;
    const places = detail?.familiarPlaces ?? [];
    const members = detail?.familyMembers ?? [];

    if (activeStation.id === "shillong") {
      const church = places.find((p) => p.name.toLowerCase().includes("cathedral") || p.name.toLowerCase().includes("church"));
      if (church) return { title: church.name, url: church.photoUrl ?? "", note: church.description ?? "" };
    }
    if (activeStation.id === "guwahati" && places.length > 0) {
      return { title: places[0].name, url: places[0].photoUrl ?? "", note: places[0].description ?? "" };
    }
    if (members.length > 0) {
      return { title: members[0].name, url: members[0].photoUrl ?? "", note: members[0].notes ?? "" };
    }
    return null;
  }, [activeStation, detail]);

  const playStationAudio = useCallback((station: RadioStation) => {
    playRadioTune();
    if (station.soundType === "flute") {
      playLifeSong();
    } else if (station.soundType === "chimes") {
      playLandmarkChime();
    } else if (station.soundType === "dhol") {
      playDholBeat(false);
      setTimeout(() => playDholBeat(true), 180);
      setTimeout(() => playDholBeat(false), 360);
    } else {
      playLifeSong();
    }
  }, []);

  function startRadio() {
    stopSpeaking();
    playPress();
    setCurrentFreq(600);
    setTunedStationId("guwahati");
    setDiscoveredStations(["guwahati"]);
    setScore(1);
    setTaps(0);
    setStartedAt(new Date().toISOString());
    setPhase("tune");

    playStationAudio(STATIONS[0]);
  }

  function tuneToStation(station: RadioStation) {
    playPress();
    setTaps((v) => v + 1);
    setCurrentFreq(station.freq);
    setTunedStationId(station.id);
    playStationAudio(station);

    if (!discoveredStations.includes(station.id)) {
      playCorrect();
      setScore((s) => s + 1);
      const nextDiscovered = [...discoveredStations, station.id];
      setDiscoveredStations(nextDiscovered);

      if (nextDiscovered.length >= STATIONS.length) {
        setTimeout(() => completeRadioSession(), 4000);
      }
    }

    const stTitle = radioUi.stations[station.id]?.title || station.title;
    const stName = radioUi.stations[station.id]?.stationName || station.stationName;
    const stDesc = radioUi.stations[station.id]?.desc || station.desc;
    speak(`${stTitle}: ${stName}. ${stDesc}`, locale, rate);
  }

  function completeRadioSession() {
    stopSpeaking();
    playComplete();
    setPhase("done");
    guard.markCompleted();

    if (startedAt) {
      recordGameSession(patientId, {
        gameId: "radio",
        level,
        outcome: "completed",
        score: STATIONS.length,
        startedAt,
        taps,
      });
    }
    speak(
      radioUi.allTunedSpeech,
      locale,
      rate
    );
  }

  const str = getGameStrings("radio", locale);

  if (loading) return <GameLoading />;
  if (error)
    return (
      <GameShell title={str.title} score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title={str.title} score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-8 text-center">
          <Radio className="h-16 w-16 text-tea animate-pulse" />
          <p className="font-serif text-3xl font-black text-ink">{str.introTitle}</p>
          <p className="max-w-md text-lg font-semibold text-ink-secondary">
            {str.introSubtitle}
          </p>

          {/* Stations List Preview */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_rgba(0,0,0,1)]">
            <span className="text-xs font-black uppercase tracking-wider text-tea">
              {str.hudAction} ({STATIONS.length} Stations)
            </span>
            <div className="mt-2 space-y-2">
              {STATIONS.map((s) => (
                <div key={s.id} className="flex items-center justify-between border-b border-border/60 pb-1.5 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-tea">{renderStationIcon(s.id, "h-5 w-5")}</span>
                    <span className="text-sm font-bold text-ink">{radioUi.stations[s.id]?.title || s.title}</span>
                  </div>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-black text-amber-900 border border-amber-300">
                    {s.freq} kHz
                  </span>
                </div>
              ))}
            </div>
          </div>

          <AudioPrompt
            text={str.audioPrompt}
            label={str.listenLabel}
            size="md"
          />

          <ChunkyButton variant="tea" size="2xl" onClick={startRadio}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "tune" ? (
        <div className="flex flex-col items-center gap-5 py-4">
          {/* DISCOVERY PROGRESS BAR */}
          <div className="w-full max-w-md flex items-center justify-between rounded-2xl border-2 border-black bg-surface px-4 py-2 shadow-sm">
            <span className="text-sm font-black text-tea flex items-center gap-1.5">
              <Radio className="h-4 w-4" /> {radioUi.receiverName}
            </span>
            <span className="text-xs font-bold text-ink-secondary">
              {radioUi.stationsTuned(discoveredStations.length, STATIONS.length)}
            </span>
          </div>

          {/* VINTAGE WOODEN RADIO CASING */}
          <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl border-4 border-[#3B2212] bg-[#2A1608] p-5 shadow-[8px_8px_0px_rgba(0,0,0,0.9)] overflow-hidden select-none">
            {/* Brass Nameplate */}
            <div className="text-center pb-2">
              <span className="inline-block rounded border border-amber-600 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 px-4 py-0.5 text-[11px] font-black uppercase tracking-widest text-black shadow-inner">
                {radioUi.deluxeBadge}
              </span>
            </div>

            {/* Glowing Frequency Dial Meter */}
            <div className="relative my-3 rounded-2xl border-3 border-amber-900 bg-[#120B04] p-3 shadow-inner">
              <div className="flex justify-between text-[10px] font-black text-amber-400/80 mb-1 px-1">
                <span>530</span>
                <span>700</span>
                <span>900</span>
                <span>1100</span>
                <span>1300</span>
                <span>1600 kHz</span>
              </div>

              {/* Tuning Track & Needle */}
              <div className="relative h-6 w-full rounded-lg bg-black/60 border border-amber-500/40 overflow-hidden flex items-center">
                {/* Dial ticks */}
                <div className="absolute inset-0 flex justify-between px-2 opacity-30">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className={`w-[1px] ${i % 4 === 0 ? "h-full bg-amber-400" : "h-2 bg-white"}`} />
                  ))}
                </div>

                {/* Moving Red Tuning Needle */}
                <div
                  className="absolute top-0 bottom-0 w-1.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,1)] transition-all duration-500"
                  style={{
                    left: `${Math.max(2, Math.min(96, ((currentFreq - 530) / (1600 - 530)) * 100))}%`,
                  }}
                />
              </div>

              {/* Current Station Callout in Dial */}
              <div className="mt-2 text-center flex items-center justify-between px-2">
                <button
                  type="button"
                  onClick={() => {
                    const newFreq = Math.max(530, currentFreq - 50);
                    setCurrentFreq(newFreq);
                    const matching = STATIONS.find((s) => Math.abs(s.freq - newFreq) <= 30);
                    if (matching) tuneToStation(matching);
                    else playRadioTune();
                  }}
                  className="btn-tactile px-2.5 py-1 rounded-lg border border-amber-500 bg-amber-950 text-amber-200 text-xs font-black hover:bg-amber-900 cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <ChevronLeft className="h-3 w-3 inline" />
                  <span>-50 kHz</span>
                </button>

                <span className="font-serif text-base sm:text-lg font-black text-amber-300">
                  {activeStation ? `${radioUi.stations[activeStation.id]?.title || activeStation.title} (${activeStation.freq} kHz)` : `${currentFreq} kHz`}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const newFreq = Math.min(1600, currentFreq + 50);
                    setCurrentFreq(newFreq);
                    const matching = STATIONS.find((s) => Math.abs(s.freq - newFreq) <= 30);
                    if (matching) tuneToStation(matching);
                    else playRadioTune();
                  }}
                  className="btn-tactile px-2.5 py-1 rounded-lg border border-amber-500 bg-amber-950 text-amber-200 text-xs font-black hover:bg-amber-900 cursor-pointer shadow-xs flex items-center gap-1"
                >
                  <span>+50 kHz</span>
                  <ChevronRight className="h-3 w-3 inline" />
                </button>
              </div>
            </div>

            {/* Illuminated Memory Stage (Scrapbook Photo) */}
            {stationMemoryPhoto && stationMemoryPhoto.url ? (
              <div className="relative my-3 overflow-hidden rounded-2xl border-3 border-amber-900/80 bg-black shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getMediaUrl(stationMemoryPhoto.url) ?? ""}
                  alt={stationMemoryPhoto.title}
                  className="h-44 w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 text-white">
                  <p className="text-sm font-black">{stationMemoryPhoto.title}</p>
                  <p className="text-xs text-white/80 line-clamp-1">{stationMemoryPhoto.note}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxPhoto(stationMemoryPhoto)}
                  className="absolute top-2 right-2 rounded-full border border-black bg-surface/90 px-2.5 py-0.5 text-[10px] font-black text-ink shadow cursor-pointer flex items-center gap-1"
                >
                  <Search className="h-3 w-3" />
                  <span>{radioUi.viewPhoto}</span>
                </button>
              </div>
            ) : (
              /* Woven Speaker Grille Pattern */
              <div className="my-3 h-32 w-full rounded-2xl border-2 border-amber-900/60 bg-[radial-gradient(#D97706_1px,transparent_1px)] [background-size:8px_8px] bg-black/40 flex items-center justify-center text-center p-4">
                <p className="text-sm font-bold text-amber-200/90">
                  {activeStation ? (radioUi.stations[activeStation.id]?.desc || activeStation.desc) : radioUi.tunePrompt}
                </p>
              </div>
            )}
          </div>

          {/* STATION PRESET BUTTONS */}
          <div className="w-full max-w-md space-y-2 text-center pt-2">
            <p className="text-sm font-black text-ink-secondary uppercase tracking-wider">
              {radioUi.tapToTune}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {STATIONS.map((station) => {
                const isTuned = tunedStationId === station.id;
                const isDiscovered = discoveredStations.includes(station.id);
                const stationTitle = radioUi.stations[station.id]?.title || station.title;

                return (
                  <button
                    key={station.id}
                    type="button"
                    onClick={() => tuneToStation(station)}
                    className={`btn-tactile group relative flex items-center gap-3 rounded-2xl border-3 border-black p-3 text-left transition-all duration-200 cursor-pointer shadow-[4px_4px_0px_rgba(0,0,0,1)] active:translate-y-0.5 ${
                      isTuned
                        ? "bg-tea text-white scale-102 ring-4 ring-tea"
                        : isDiscovered
                        ? "bg-amber-100 text-ink hover:bg-amber-200"
                        : "bg-surface text-ink hover:bg-surface-muted"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/10">
                      {renderStationIcon(station.id, "h-6 w-6")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-black leading-tight truncate">
                        {stationTitle}
                      </p>
                      <span className="text-[10px] font-bold opacity-80 flex items-center gap-1">
                        {station.freq} kHz {isDiscovered && <Check className="h-3 w-3 text-emerald-700 inline" />}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* PHASE: DONE CELEBRATION */
        <Celebration icon={Radio} title={str.celebrationTitle}>
          <div className="flex flex-col items-center gap-5 max-w-md mx-auto text-left">
            <div className="relative w-full rounded-3xl border-4 border-black bg-[#FAF5EE] p-5 shadow-[6px_6px_0px_rgba(0,0,0,1)] text-ink select-none">
              <h3 className="font-serif text-2xl font-black text-tea">
                {str.celebrationTitle}
              </h3>
              <p className="text-xs font-bold text-ink-secondary mt-1">
                {str.celebrationSubtitle}
              </p>

              {/* Station Recap */}
              <div className="mt-3 space-y-1.5 border-t border-border pt-2">
                {STATIONS.map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs font-extrabold text-ink">
                    <span>{radioUi.stations[s.id]?.title || s.title}</span>
                    <span className="text-tea flex items-center gap-1">
                      {radioUi.tunedBadge} ({s.freq} kHz) <Check className="h-3 w-3 text-emerald-700" />
                    </span>
                  </div>
                ))}
              </div>

              {/* Replay Music */}
              <div className="mt-4 flex items-center justify-between pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => playLifeSong()}
                  className="group flex items-center gap-2 rounded-xl border-2 border-black bg-marigold-light px-3.5 py-2 text-ink shadow-[2px_2px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-0.5 cursor-pointer"
                >
                  <Music className="h-4 w-4 text-ink" />
                  <span className="text-xs font-black">{radioUi.replayBroadcast}</span>
                </button>
                <span className="text-xs font-bold text-ink-secondary">
                  {radioUi.scoreText(score, STATIONS.length)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <ChunkyButton variant="tea" size="xl" onClick={startRadio}>
                {str.playAgainButton}
              </ChunkyButton>
              <Link
                href="/patient/games"
                className="btn-tactile inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-surface px-6 py-3 font-extrabold text-ink hover:bg-surface-muted shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              >
                {str.backToHub}
              </Link>
            </div>
          </div>
        </Celebration>
      )}

      {/* Memory Lightbox */}
      <MemoryLightbox
        open={lightboxPhoto !== null}
        onClose={() => setLightboxPhoto(null)}
        photoUrl={lightboxPhoto?.url}
        title={lightboxPhoto?.title ?? ""}
        text={lightboxPhoto?.note ?? null}
        langCode={locale}
        rate={rate}
        closeLabel={radioUi.closeLabel}
        listenLabel={radioUi.listenLabel}
        speakingLabel={radioUi.speakingLabel}
      />
    </GameShell>
  );
}
