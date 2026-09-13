"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Music,
  Paperclip,
  ShieldCheck,
  Activity,
  Camera,
  Sliders,
  UserCheck,
  ArrowLeft,
  ArrowRight,
  Wand2,
  Gauge,
  Play,
  Square,
} from "lucide-react";
import { GameHeader } from "@/components/layout/GameHeader";
import { GameError, GameLoading } from "@/components/games/GameState";
import { Celebration } from "@/components/games/Celebration";
import { TunedDhol3D } from "@/components/games/TunedDhol3D";
import { ChunkyButton } from "@/components/ui/ChunkyButton";
import { AudioPrompt } from "@/components/ui/AudioPrompt";
import { playPress, playCorrect, playComplete } from "@/lib/sound";
import { ensureAudioContext, getVolume, isEnabled } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { recordGameSession, resolveAdaptiveLevel } from "@/lib/telemetry";
import { useSessionGuard } from "@/games/useSessionGuard";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speechRate, startLevel } from "@/games/config";
import { OpticalMotionTracker, drawCroppedCameraFeed, type MotionEvent } from "@/lib/vision";
import { getGameStrings } from "@/lib/gameI18n";

type DrumState = "ARMED" | "COOLDOWN" | "WAITING_LIFT";

const TARGET_HITS = 16;

export interface SongNote {
  freq: number;
  noteName: string;
  lyric: { en: string; hi: string; as: string };
  bol: { en: string; hi: string; as: string };
  side: "left" | "right";
}

export interface IndianSongTrack {
  id: string;
  title: { en: string; hi: string; as: string };
  subtitle: { en: string; hi: string; as: string };
  region: { en: string; hi: string; as: string };
  taal: { en: string; hi: string; as: string };
  bpm: number;
  instrument: "bansuri" | "pepa";
  notes: SongNote[];
}

export const INDIAN_SONGS: IndianSongTrack[] = [
  {
    id: "o-mur-apunar-desh",
    title: {
      en: "O Mur Apunar Desh",
      hi: "ओ मोर आपोनार देश",
      as: "অ' মোৰ আপোনাৰ দেশ",
    },
    subtitle: {
      en: "Beloved Assam Folk Anthem by Lakshminath Bezbaroa",
      hi: "असम का सुप्रसिद्ध एवं प्रिय लोकगान",
      as: "অসমৰ চিৰ চেনেহী জাতীয় সংগীত",
    },
    region: {
      en: "Assam & Brahmaputra Valley",
      hi: "असम एवं ब्रह्मपुत्र घाटी",
      as: "অসম আৰু ব্ৰহ্মপুত্ৰ উপত্যকা",
    },
    taal: {
      en: "Kaharwa Taal (8 Beats)",
      hi: "कहरवा ताल (8 मात्रा)",
      as: "কাহাৰৱা তাল (৮ মাত্ৰা)",
    },
    bpm: 84,
    instrument: "bansuri",
    notes: [
      { freq: 392.0, noteName: "Pa", lyric: { en: "O", hi: "ओ", as: "অ'" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "left" },
      { freq: 440.0, noteName: "Dha", lyric: { en: "Mur", hi: "मोर", as: "মোৰ" }, bol: { en: "Ghe", hi: "घे", as: "ঘে" }, side: "right" },
      { freq: 523.25, noteName: "Sa'", lyric: { en: "A-", hi: "आ-", as: "আ-" }, bol: { en: "Na", hi: "ना", as: "না" }, side: "left" },
      { freq: 523.25, noteName: "Sa'", lyric: { en: "pu-", hi: "पो-", as: "পো-" }, bol: { en: "Tin", hi: "तिन", as: "তিন" }, side: "right" },
      { freq: 440.0, noteName: "Dha", lyric: { en: "nar", hi: "नार", as: "নাৰ" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "left" },
      { freq: 392.0, noteName: "Pa", lyric: { en: "Desh", hi: "देश", as: "দেশ" }, bol: { en: "Ghe", hi: "घे", as: "ঘে" }, side: "right" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "O", hi: "ओ", as: "অ'" }, bol: { en: "Na", hi: "ना", as: "না" }, side: "left" },
      { freq: 392.0, noteName: "Pa", lyric: { en: "Mur", hi: "मोर", as: "মোৰ" }, bol: { en: "Tin", hi: "तिन", as: "তিন" }, side: "right" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "Shi-", hi: "चि-", as: "চি-" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "left" },
      { freq: 293.66, noteName: "Re", lyric: { en: "ko-", hi: "कु-", as: "কু-" }, bol: { en: "Ta", hi: "ता", as: "তা" }, side: "right" },
      { freq: 261.63, noteName: "Sa", lyric: { en: "nee-", hi: "ली-", as: "লী-" }, bol: { en: "Ghe", hi: "घे", as: "ঘে" }, side: "left" },
      { freq: 293.66, noteName: "Re", lyric: { en: "Desh", hi: "देश", as: "দেশ" }, bol: { en: "Na", hi: "ना", as: "না" }, side: "right" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "E-", hi: "ए-", as: "এ-" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "left" },
      { freq: 392.0, noteName: "Pa", lyric: { en: "ne", hi: "ने", as: "নে" }, bol: { en: "Ghe", hi: "घे", as: "ঘে" }, side: "right" },
      { freq: 440.0, noteName: "Dha", lyric: { en: "Mee-", hi: "मी-", as: "মি-" }, bol: { en: "Na", hi: "ना", as: "না" }, side: "left" },
      { freq: 523.25, noteName: "Sa'", lyric: { en: "tha", hi: "ठा", as: "ঠা" }, bol: { en: "Dhin", hi: "धिं", as: "ধিন" }, side: "right" },
    ],
  },
  {
    id: "bihu-dhol-pepa",
    title: {
      en: "Rongali Bihu Spring Beat",
      hi: "रोंगाली बिहू धुन और ढोल",
      as: "ৰঙালী বিহু ঢোল আৰু পেঁপা",
    },
    subtitle: {
      en: "Joyous Assamese Spring Festival Dhol & Buffalo-Horn Pepa Melody",
      hi: "असम के पारंपरिक बिहू ढोल और सींग की पेपा की मधुर धुन",
      as: "বসন্তৰ আনন্দময় বিহু ঢোল আৰু ম'হৰ শিঙৰ পেঁপাৰ সুৰ",
    },
    region: {
      en: "Upper Assam & Kaziranga",
      hi: "ऊपरी असम एवं काजीरंगा",
      as: "উজনি অসম আৰু কাজিৰঙা",
    },
    taal: {
      en: "Bihu Khemta (Fast 6 Beats)",
      hi: "बिहू खेमटा ताल (द्रुत ६ मात्रा)",
      as: "বিহু খেমটা তাল (দ্ৰুত ৬ মাত্ৰা)",
    },
    bpm: 96,
    instrument: "pepa",
    notes: [
      { freq: 523.25, noteName: "Sa'", lyric: { en: "Bihu-", hi: "बिहू-", as: "বিহু-" }, bol: { en: "Dhei", hi: "धई", as: "ধেই" }, side: "left" },
      { freq: 587.33, noteName: "Re'", lyric: { en: "re", hi: "रे", as: "ৰে" }, bol: { en: "Dhen", hi: "धेन", as: "ধেন" }, side: "right" },
      { freq: 659.25, noteName: "Ga'", lyric: { en: "Bihu", hi: "बिहू", as: "বিহু" }, bol: { en: "Ta", hi: "ता", as: "তা" }, side: "left" },
      { freq: 587.33, noteName: "Re'", lyric: { en: "Lagil", hi: "लागि", as: "লাগিল" }, bol: { en: "Ta", hi: "ता", as: "তা" }, side: "right" },
      { freq: 523.25, noteName: "Sa'", lyric: { en: "Oi", hi: "ओई", as: "ঐ" }, bol: { en: "Dhei", hi: "धई", as: "ধেই" }, side: "left" },
      { freq: 440.0, noteName: "Dha", lyric: { en: "Gachor", hi: "गाछर", as: "গছৰ" }, bol: { en: "Dhen", hi: "धेन", as: "ধেন" }, side: "right" },
      { freq: 392.0, noteName: "Pa", lyric: { en: "Daalot", hi: "डाल", as: "ডালত" }, bol: { en: "Ta", hi: "ता", as: "তা" }, side: "left" },
      { freq: 440.0, noteName: "Dha", lyric: { en: "Kopou", hi: "कपौ", as: "কপৌ" }, bol: { en: "Ta", hi: "ता", as: "তা" }, side: "right" },
      { freq: 523.25, noteName: "Sa'", lyric: { en: "Phool", hi: "फूल", as: "ফুল" }, bol: { en: "Dhei", hi: "धई", as: "ধেই" }, side: "left" },
      { freq: 587.33, noteName: "Re'", lyric: { en: "Phulil", hi: "फूला", as: "ফুলিল" }, bol: { en: "Dhen", hi: "धेन", as: "ধেন" }, side: "right" },
      { freq: 659.25, noteName: "Ga'", lyric: { en: "Gaot", hi: "गांव", as: "গাঁৱত" }, bol: { en: "Ta", hi: "ता", as: "তা" }, side: "left" },
      { freq: 587.33, noteName: "Re'", lyric: { en: "Oi", hi: "ओई", as: "ঐ" }, bol: { en: "Ta", hi: "ता", as: "তা" }, side: "right" },
      { freq: 523.25, noteName: "Sa'", lyric: { en: "Dholor", hi: "ढोलर", as: "ঢোলৰ" }, bol: { en: "Dhei", hi: "धई", as: "ধেই" }, side: "left" },
      { freq: 440.0, noteName: "Dha", lyric: { en: "Sa-", hi: "चा-", as: "চা-" }, bol: { en: "Dhen", hi: "धेन", as: "ধেন" }, side: "right" },
      { freq: 392.0, noteName: "Pa", lyric: { en: "pori", hi: "परी", as: "পৰি" }, bol: { en: "Ta", hi: "ता", as: "তা" }, side: "left" },
      { freq: 523.25, noteName: "Sa'", lyric: { en: "Baaje!", hi: "बाजे!", as: "বাজে!" }, bol: { en: "Khor!", hi: "खर!", as: "খৰ!" }, side: "right" },
    ],
  },
  {
    id: "mahut-bandhu-re",
    title: {
      en: "O Mur Mahut Bandhu Re",
      hi: "ओ मोर माहुत बंधु रे",
      as: "ও মোৰ মাহুত বন্ধুৰে",
    },
    subtitle: {
      en: "Evergreen Goalparia Folk Ballad immortalized by Pratima Barua Pandey",
      hi: "प्रतिमा बरुआ पांडेय द्वारा गाया गया सदाबहार गोवालपारीया लोकगीत",
      as: "প্ৰতিমা বৰুৱা পাণ্ডেৰ অমৰ গোৱালপৰীয়া লোকগীত",
    },
    region: {
      en: "Goalpara & Western Assam",
      hi: "गोवालपारा एवं पश्चिमी असम",
      as: "গোৱালপাৰা আৰু পশ্চিম অসম",
    },
    taal: {
      en: "Dadra Taal (6 Beats)",
      hi: "दादरा ताल (6 मात्रा)",
      as: "দাদৰা তাল (৬ মাত্ৰা)",
    },
    bpm: 78,
    instrument: "bansuri",
    notes: [
      { freq: 392.0, noteName: "Pa", lyric: { en: "O", hi: "ओ", as: "ও" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "left" },
      { freq: 440.0, noteName: "Dha", lyric: { en: "Mur", hi: "मोर", as: "মোৰ" }, bol: { en: "Dhi", hi: "धी", as: "ধী" }, side: "right" },
      { freq: 392.0, noteName: "Pa", lyric: { en: "Ma-", hi: "मा-", as: "মা-" }, bol: { en: "Na", hi: "ना", as: "না" }, side: "left" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "hut", hi: "हुत", as: "হুত" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "right" },
      { freq: 293.66, noteName: "Re", lyric: { en: "Ban-", hi: "बंधु", as: "ব-" }, bol: { en: "Ti", hi: "ती", as: "তী" }, side: "left" },
      { freq: 261.63, noteName: "Sa", lyric: { en: "dhu", hi: "रे", as: "ন্ধু" }, bol: { en: "Na", hi: "ना", as: "না" }, side: "right" },
      { freq: 293.66, noteName: "Re", lyric: { en: "Re", hi: "रे", as: "ৰে" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "left" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "Has-", hi: "हस्ती", as: "হ-" }, bol: { en: "Dhi", hi: "धी", as: "ধী" }, side: "right" },
      { freq: 392.0, noteName: "Pa", lyric: { en: "ti", hi: "धरार", as: "স্তী" }, bol: { en: "Na", hi: "ना", as: "না" }, side: "left" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "Dha-", hi: "फांदे", as: "ধ-" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "right" },
      { freq: 293.66, noteName: "Re", lyric: { en: "rar", hi: "परिया", as: "ৰাৰ" }, bol: { en: "Ti", hi: "ती", as: "তী" }, side: "left" },
      { freq: 261.63, noteName: "Sa", lyric: { en: "Fande", hi: "रे", as: "ফান্দে" }, bol: { en: "Na", hi: "ना", as: "না" }, side: "right" },
      { freq: 293.66, noteName: "Re", lyric: { en: "Mon", hi: "मन", as: "মন" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "left" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "A-", hi: "आ-", as: "আ-" }, bol: { en: "Dhi", hi: "धी", as: "ধী" }, side: "right" },
      { freq: 392.0, noteName: "Pa", lyric: { en: "mar", hi: "मार", as: "মাৰ" }, bol: { en: "Na", hi: "ना", as: "না" }, side: "left" },
      { freq: 261.63, noteName: "Sa", lyric: { en: "Kande", hi: "कांदे", as: "কান্দে" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "right" },
    ],
  },
  {
    id: "raghupati-raghav",
    title: {
      en: "Raghupati Raghav Raja Ram",
      hi: "रघुपति राघव राजा राम",
      as: "ৰঘুপতি ৰাঘৱ ৰাজা ৰাম",
    },
    subtitle: {
      en: "Timeless Calming Bhajan & Peace Dhun across India",
      hi: "मन को असीम शांति देने वाला सर्वकालिक पावन भजन",
      as: "মন শান্ত কৰা চিৰন্তন ভক্তিমূলক সুৰ",
    },
    region: {
      en: "Pan-India Heritage & Devotion",
      hi: "अखिल भारतीय सांस्कृतिक धरोहर",
      as: "সৰ্বভাৰতীয় ভক্তিমূলক ঐতিহ্য",
    },
    taal: {
      en: "Kaharwa Bhajan Taal (8 Beats)",
      hi: "कहरवा भजन ताल (8 मात्रा)",
      as: "কাহাৰৱা ভজন তাল (৮ মাত্ৰা)",
    },
    bpm: 80,
    instrument: "bansuri",
    notes: [
      { freq: 261.63, noteName: "Sa", lyric: { en: "Ra-", hi: "र-", as: "ৰ-" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "left" },
      { freq: 293.66, noteName: "Re", lyric: { en: "ghu-", hi: "घु-", as: "ঘু-" }, bol: { en: "Ghe", hi: "घे", as: "ঘে" }, side: "right" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "pa-", hi: "प-", as: "প-" }, bol: { en: "Na", hi: "ना", as: "না" }, side: "left" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "ti", hi: "ति", as: "তি" }, bol: { en: "Tin", hi: "तिन", as: "তিন" }, side: "right" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "Ra-", hi: "रा-", as: "ৰা-" }, bol: { en: "Na", hi: "ना", as: "না" }, side: "left" },
      { freq: 293.66, noteName: "Re", lyric: { en: "ghav", hi: "घव", as: "ঘৱ" }, bol: { en: "Ke", hi: "के", as: "কে" }, side: "right" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "Ra-", hi: "रा-", as: "ৰা-" }, bol: { en: "Dhin", hi: "धिं", as: "ধিন" }, side: "left" },
      { freq: 349.23, noteName: "Ma", lyric: { en: "ja", hi: "जा", as: "জা" }, bol: { en: "Na", hi: "ना", as: "না" }, side: "right" },
      { freq: 392.0, noteName: "Pa", lyric: { en: "Ram", hi: "राम", as: "ৰাম" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "left" },
      { freq: 392.0, noteName: "Pa", lyric: { en: "Pa-", hi: "प-", as: "প-" }, bol: { en: "Ghe", hi: "घे", as: "ঘে" }, side: "right" },
      { freq: 349.23, noteName: "Ma", lyric: { en: "ti-", hi: "ति-", as: "তি-" }, bol: { en: "Na", hi: "ना", as: "না" }, side: "left" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "ta", hi: "त", as: "ত" }, bol: { en: "Tin", hi: "तिन", as: "তিন" }, side: "right" },
      { freq: 293.66, noteName: "Re", lyric: { en: "Pa-", hi: "पा-", as: "পা-" }, bol: { en: "Na", hi: "ना", as: "না" }, side: "left" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "van", hi: "वन", as: "ৱন" }, bol: { en: "Ke", hi: "के", as: "কে" }, side: "right" },
      { freq: 293.66, noteName: "Re", lyric: { en: "Si-", hi: "सी-", as: "সী-" }, bol: { en: "Dhin", hi: "धिं", as: "ধিন" }, side: "left" },
      { freq: 261.63, noteName: "Sa", lyric: { en: "ta Ram", hi: "ता राम", as: "তা ৰাম" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "right" },
    ],
  },
  {
    id: "hare-krishna-kirtan",
    title: {
      en: "Namghar Folk Kirtan",
      hi: "नामघर हरे कृष्ण कीर्तन",
      as: "নামঘৰৰ হৰি কীৰ্তন ধুন",
    },
    subtitle: {
      en: "Joyous Assamese Kirtan Dhun with Khol Drum & Taal Cymbals",
      hi: "असम के नामघर में बजने वाली खोल और करताल की मधुर धुन",
      as: "অসমৰ নামঘৰত বাজি থকা খোল আৰু তালৰ সুমধুৰ ধ্বনি",
    },
    region: {
      en: "Majuli & Assam Namghars",
      hi: "माजुली एवं असम के नामघर",
      as: "মাজুলী আৰু অসমৰ নামঘৰসমূহ",
    },
    taal: {
      en: "Kirtan Theka (8 Beats)",
      hi: "कीर्तन ठेका (8 मात्रा)",
      as: "কীৰ্তন ঠেকা (৮ মাত্ৰা)",
    },
    bpm: 88,
    instrument: "bansuri",
    notes: [
      { freq: 261.63, noteName: "Sa", lyric: { en: "Ha-", hi: "ह-", as: "হ-" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "left" },
      { freq: 293.66, noteName: "Re", lyric: { en: "re", hi: "रे", as: "ৰে" }, bol: { en: "Dhin", hi: "धिं", as: "ধিন" }, side: "right" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "Krish-", hi: "कृ-", as: "কৃ-" }, bol: { en: "Ta", hi: "ता", as: "তা" }, side: "left" },
      { freq: 293.66, noteName: "Re", lyric: { en: "na", hi: "ष्णा", as: "ষ্ণ" }, bol: { en: "Tin", hi: "तिन", as: "তিন" }, side: "right" },
      { freq: 261.63, noteName: "Sa", lyric: { en: "Ha-", hi: "ह-", as: "হ-" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "left" },
      { freq: 293.66, noteName: "Re", lyric: { en: "re", hi: "रे", as: "ৰে" }, bol: { en: "Dhin", hi: "धिं", as: "ধিন" }, side: "right" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "Ra-", hi: "रा-", as: "ৰা-" }, bol: { en: "Ta", hi: "ता", as: "তা" }, side: "left" },
      { freq: 392.0, noteName: "Pa", lyric: { en: "ma", hi: "म", as: "ম" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "right" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "Ra-", hi: "रा-", as: "ৰা-" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "left" },
      { freq: 293.66, noteName: "Re", lyric: { en: "ma", hi: "म", as: "ম" }, bol: { en: "Dhin", hi: "धिं", as: "ধিন" }, side: "right" },
      { freq: 261.63, noteName: "Sa", lyric: { en: "Ha-", hi: "ह-", as: "হ-" }, bol: { en: "Ta", hi: "ता", as: "তা" }, side: "left" },
      { freq: 293.66, noteName: "Re", lyric: { en: "re", hi: "रे", as: "ৰে" }, bol: { en: "Tin", hi: "तिन", as: "তিন" }, side: "right" },
      { freq: 329.63, noteName: "Ga", lyric: { en: "Krish-", hi: "कृ-", as: "কৃ-" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "left" },
      { freq: 293.66, noteName: "Re", lyric: { en: "na", hi: "ष्णा", as: "ষ্ণ" }, bol: { en: "Dhin", hi: "धिं", as: "ধিন" }, side: "right" },
      { freq: 261.63, noteName: "Sa", lyric: { en: "Ha-", hi: "ह-", as: "হ-" }, bol: { en: "Ta", hi: "তা", as: "তা" }, side: "left" },
      { freq: 261.63, noteName: "Sa", lyric: { en: "re", hi: "रे", as: "ৰে" }, bol: { en: "Dha", hi: "धा", as: "ধা" }, side: "right" },
    ],
  },
];

// ---------------------------------------------------------------------------
// Indian Rhythmic & Melodic Auto-Tuner Engine
// ---------------------------------------------------------------------------
class TunedDrumEngine {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private running = false;
  private timer: ReturnType<typeof setInterval> | null = null;
  private nextNoteTime = 0; // seconds on the ctx clock
  private step = 0;
  private songIndex = 0;
  private currentSong: IndianSongTrack = INDIAN_SONGS[0];
  private currentNoteIndex = 0;
  private strikes: Array<{ slot: number; side: "left" | "right" }> = [];
  private readonly lookahead = 0.12;

  onDiagnostics?: (d: { step: number; nextInMs: number; quantInMs: number }) => void;
  onNoteTriggered?: (note: SongNote, index: number) => void;

  setSong(songId: string) {
    const found = INDIAN_SONGS.find((s) => s.id === songId);
    if (found) {
      this.currentSong = found;
      this.currentNoteIndex = 0;
    }
  }

  getSong(): IndianSongTrack {
    return this.currentSong;
  }

  getNoteIndex(): number {
    return this.currentNoteIndex;
  }

  start() {
    const ctx = ensureAudioContext();
    if (!ctx || this.running) return;
    this.ctx = ctx;
    this.out = ctx.createGain();
    this.out.gain.value = 0.55;
    this.out.connect(ctx.destination);
    this.nextNoteTime = ctx.currentTime + 0.08;
    this.step = 0;
    this.strikes = [];
    this.running = true;
    this.timer = setInterval(() => this.tick(), 25);
  }

  stop() {
    this.running = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Auto-tune strike: quantizes the hit to the next grid subdivision
   * so every strike is in rhythm and plays the next note of the Indian song.
   */
  strike(side: "left" | "right", autoTune = true) {
    if (!this.running || !this.ctx) return;
    const now = this.ctx.currentTime;
    const sixteenthSec = 60 / this.currentSong.bpm / 4;

    if (!autoTune) {
      // Immediate raw hit
      this.executeSongStrike(side, now);
      return;
    }

    // Snap to the upcoming 16th-note slot on or after now
    const ahead = Math.max(0, this.nextNoteTime - now);
    const slotIndex = this.step + Math.ceil(ahead / sixteenthSec);
    this.strikes.push({ slot: slotIndex, side });
  }

  private getVolume() {
    const enabled = typeof isEnabled === "function" ? isEnabled() : true;
    const vol = typeof getVolume === "function" ? getVolume() : 0.8;
    return enabled ? Math.max(0.05, vol) : 0;
  }

  /**
   * Resonant Indian Dhol Bass (Bayan): Deep pitch drop + soft wooden body
   */
  private playDholBass(at: number, gain = 0.6) {
    if (!this.ctx || !this.out) return;
    try {
      const osc = this.ctx.createOscillator();
      const subOsc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const subG = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(138, at);
      osc.frequency.exponentialRampToValueAtTime(54, at + 0.32);

      subOsc.type = "triangle";
      subOsc.frequency.setValueAtTime(69, at);
      subOsc.frequency.exponentialRampToValueAtTime(36, at + 0.22);

      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(gain, at + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.34);

      subG.gain.setValueAtTime(0.0001, at);
      subG.gain.exponentialRampToValueAtTime(gain * 0.45, at + 0.008);
      subG.gain.exponentialRampToValueAtTime(0.0001, at + 0.24);

      osc.connect(g);
      subOsc.connect(subG);
      g.connect(this.out);
      subG.connect(this.out);

      osc.start(at);
      subOsc.start(at);
      osc.stop(at + 0.36);
      subOsc.stop(at + 0.26);
    } catch {
      // AudioContext protection
    }
  }

  /**
   * Crisp Indian Dhol Treble (Dayan / Rim): High metallic snap + resonant wood
   */
  private playDholTreble(at: number, gain = 0.5) {
    if (!this.ctx || !this.out) return;
    try {
      const osc = this.ctx.createOscillator();
      const snap = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(380, at);
      osc.frequency.exponentialRampToValueAtTime(210, at + 0.16);

      snap.type = "triangle";
      snap.frequency.setValueAtTime(840, at);
      snap.frequency.exponentialRampToValueAtTime(320, at + 0.06);

      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(gain, at + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, at + 0.18);

      osc.connect(g);
      snap.connect(g);
      g.connect(this.out);

      osc.start(at);
      snap.start(at);
      osc.stop(at + 0.2);
      snap.stop(at + 0.08);
    } catch {
      // AudioContext protection
    }
  }

  /**
   * Authentic Indian Melodic Voice:
   * - Bansuri (Warm bamboo flute with gentle vibrato)
   * - Pepa (Authentic buffalo-horn reed resonance of Bihu)
   */
  private playIndianMelody(freq: number, at: number, instrument: "bansuri" | "pepa", gain = 0.28, dur = 0.42) {
    if (!this.ctx || !this.out) return;
    try {
      const osc = this.ctx.createOscillator();
      const overtone = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      if (instrument === "pepa") {
        // Hornbill Pepa: piercing, celebratory nasal reed
        osc.type = "sawtooth";
        overtone.type = "triangle";
        filter.type = "bandpass";
        filter.frequency.value = 1600;
        filter.Q.value = 3.2;
      } else {
        // Bansuri Flute: warm, rounded bamboo with soft harmonic
        osc.type = "triangle";
        overtone.type = "sine";
        filter.type = "lowpass";
        filter.frequency.value = 2400;
        filter.Q.value = 1.0;
      }

      osc.frequency.setValueAtTime(freq, at);
      overtone.frequency.setValueAtTime(freq * 2, at);

      // Gentle vibrato LFO (5 Hz) for emotional warmth
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.value = 5.2;
      lfoGain.gain.value = 4.5;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start(at);
      lfo.stop(at + dur + 0.05);

      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(gain, at + 0.025);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);

      osc.connect(filter);
      overtone.connect(filter);
      filter.connect(g);
      g.connect(this.out);

      osc.start(at);
      overtone.start(at);
      osc.stop(at + dur + 0.05);
      overtone.stop(at + dur + 0.05);
    } catch {
      // AudioContext protection
    }
  }

  /**
   * Backing Indian Taal accompaniment: gentle Dha, Ghe, Na, Tin groove
   */
  private playTaalTheka(at: number, step: number) {
    if (!this.ctx || !this.out) return;
    const isDownbeat = step % 4 === 0;
    const isCycleStart = step % 8 === 0;

    if (isCycleStart) {
      // Sam (Beat 1): Soft bass anchor
      this.playDholBass(at, 0.18);
    } else if (isDownbeat) {
      // Beats 2, 3, 4: Gentle rim pulse
      this.playDholTreble(at, 0.1);
    }
  }

  private executeSongStrike(side: "left" | "right", at: number) {
    const song = this.currentSong;
    const note = song.notes[this.currentNoteIndex % song.notes.length];

    if (side === "left") {
      this.playDholBass(at, 0.58);
    } else {
      this.playDholTreble(at, 0.48);
    }

    this.playIndianMelody(note.freq, at, song.instrument, 0.32, 0.45);

    if (this.onNoteTriggered) {
      this.onNoteTriggered(note, this.currentNoteIndex);
    }

    this.currentNoteIndex = (this.currentNoteIndex + 1) % song.notes.length;
  }

  private tick() {
    if (!this.ctx || !this.out || !this.running) return;
    const vol = this.getVolume();
    this.out.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.05);
    const sixteenthSec = 60 / this.currentSong.bpm / 4;

    while (this.nextNoteTime < this.ctx.currentTime + this.lookahead) {
      const at = this.nextNoteTime;
      const s = this.step;

      // Play subtle Indian Taal backing groove
      this.playTaalTheka(at, s);

      // Check for quantized auto-tuned player strikes on this slot
      const strikeIdx = this.strikes.findIndex((st) => st.slot === s);
      if (strikeIdx !== -1) {
        const item = this.strikes[strikeIdx];
        this.executeSongStrike(item.side, at);
        this.strikes.splice(strikeIdx, 1);
      }

      this.nextNoteTime += sixteenthSec;
      this.step++;
    }

    if (this.onDiagnostics && this.ctx) {
      const now = this.ctx.currentTime;
      this.onDiagnostics({
        step: this.step,
        nextInMs: Math.round(Math.max(0, this.nextNoteTime - now) * 1000),
        quantInMs: this.strikes.length > 0 ? Math.round(sixteenthSec * 1000) : 0,
      });
    }
  }
}

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
    <section className="pb-12 min-h-screen bg-canvas">
      <GameHeader
        title={title}
        score={score}
        backHref="/patient/games"
        bgColor="bg-amber-800"
        gameId="tuned-drum"
      />
      <div className="mx-auto max-w-2xl px-4 pt-5">{children}</div>
    </section>
  );
}

export function TunedDrumGame() {
  const locale = useLocale();
  const loc = (locale === "hi" || locale === "as" ? locale : "en") as "en" | "hi" | "as";
  const { detail, loading, error, reload, patientId } = usePatientDetail();

  const level = resolveAdaptiveLevel(patientId, "tuned-drum", startLevel(detail));
  const rate = speechRate(detail);

  const [phase, setPhase] = useState<"intro" | "play" | "done">("intro");
  const [running, setRunning] = useState(false);
  const [hitsCount, setHitsCount] = useState(0);
  const [leftHits, setLeftHits] = useState(0);
  const [rightHits, setRightHits] = useState(0);
  const [taps, setTaps] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);

  // Indian Song Selection & Auto-Tuner state
  const [selectedSongId, setSelectedSongId] = useState<string>("o-mur-apunar-desh");
  const currentSong = useMemo(
    () => INDIAN_SONGS.find((s) => s.id === selectedSongId) || INDIAN_SONGS[0],
    [selectedSongId]
  );
  const [activeNote, setActiveNote] = useState<SongNote | null>(INDIAN_SONGS[0].notes[0]);
  const [activeNoteIndex, setActiveNoteIndex] = useState(0);

  // 3D dhol strike impulse counters (incremented on each left/right hit).
  const [leftImpulse, setLeftImpulse] = useState(0);
  const [rightImpulse, setRightImpulse] = useState(0);

  const [isVisionActive, setIsVisionActive] = useState(false);
  const [leftMotionLevel, setLeftMotionLevel] = useState(0);
  const [rightMotionLevel, setRightMotionLevel] = useState(0);
  const [leftDrumVisualState, setLeftDrumVisualState] = useState<DrumState>("ARMED");
  const [rightDrumVisualState, setRightDrumVisualState] = useState<DrumState>("ARMED");
  const [showVisionSettings, setShowVisionSettings] = useState(false);
  const [autoTuneOn, setAutoTuneOn] = useState(true);
  const [gridStep, setGridStep] = useState(0);
  const [quantizedMs, setQuantizedMs] = useState(0);

  const [strikeThreshold, setStrikeThreshold] = useState(0.6);
  const [strikePaceMs, setStrikePaceMs] = useState(600);

  const engineRef = useRef<TunedDrumEngine | null>(null);
  const trackerRef = useRef<OpticalMotionTracker | null>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const lastDiagnosticsRef = useRef<{ step: number; quantInMs: number }>({ step: 0, quantInMs: 0 });

  const leftDrumStateRef = useRef<DrumState>("ARMED");
  const rightDrumStateRef = useRef<DrumState>("ARMED");
  const lastStrikeTimeRef = useRef<{ left: number; right: number }>({ left: 0, right: 0 });

  const score = Math.round((hitsCount / TARGET_HITS) * 100);

  const selectSong = (songId: string) => {
    playPress();
    setSelectedSongId(songId);
    const song = INDIAN_SONGS.find((s) => s.id === songId) || INDIAN_SONGS[0];
    setActiveNoteIndex(0);
    setActiveNote(song.notes[0]);
    if (engineRef.current) {
      engineRef.current.setSong(songId);
    }
  };

  const handleDrumHit = useCallback(
    (side: "left" | "right") => {
      setHitsCount((prevHits) => {
        if (prevHits >= TARGET_HITS) return prevHits;

        setTaps((t) => t + 1);
        if (side === "left") {
          setLeftHits((l) => l + 1);
          setLeftImpulse((n) => n + 1);
        } else {
          setRightHits((r) => r + 1);
          setRightImpulse((n) => n + 1);
        }

        // Auto-tuner: snap the strike onto the upcoming grid slot so it always
        // lands cleanly on a beat and sounds the authentic Indian song note.
        const q = lastDiagnosticsRef.current;
        const sixteenthSec = 60 / currentSong.bpm / 4;
        setQuantizedMs(q.quantInMs || Math.round(sixteenthSec * 1000));
        if (engineRef.current) {
          engineRef.current.strike(side, autoTuneOn);
        } else {
          playPress();
        }

        const nextHits = prevHits + 1;
        if (nextHits === TARGET_HITS) {
          setTimeout(() => {
            playComplete();
            setPhase("done");
            if (startedAt) {
              recordGameSession(patientId, {
                gameId: "tuned-drum",
                level,
                outcome: "completed",
                score: 100,
                startedAt,
                taps: taps + 1,
                errorCount: 0,
              });
            }
          }, 800);
        } else {
          if (nextHits % 4 === 0) {
            playCorrect();
          }
        }
        return nextHits;
      });
    },
    [autoTuneOn, currentSong.bpm, level, patientId, startedAt, taps]
  );

  const handleMotionEvent = useCallback(
    (evt: MotionEvent) => {
      const leftVal = evt.drumLeftEnergy !== undefined ? evt.drumLeftEnergy : evt.leftEnergy;
      const rightVal = evt.drumRightEnergy !== undefined ? evt.drumRightEnergy : evt.rightEnergy;

      setLeftMotionLevel(leftVal);
      setRightMotionLevel(rightVal);

      const now = Date.now();
      const RESET_ENERGY_THRESHOLD = 0.32;

      const leftElapsed = now - lastStrikeTimeRef.current.left;
      let nextLeftState = leftDrumStateRef.current;
      if (leftDrumStateRef.current === "COOLDOWN") {
        if (leftElapsed >= strikePaceMs) nextLeftState = leftVal < RESET_ENERGY_THRESHOLD ? "ARMED" : "WAITING_LIFT";
      } else if (leftDrumStateRef.current === "WAITING_LIFT") {
        if (leftVal < RESET_ENERGY_THRESHOLD) nextLeftState = "ARMED";
      } else if (leftDrumStateRef.current === "ARMED") {
        if (leftVal >= strikeThreshold && leftElapsed >= strikePaceMs) {
          nextLeftState = "COOLDOWN";
          lastStrikeTimeRef.current.left = now;
          handleDrumHit("left");
        }
      }
      leftDrumStateRef.current = nextLeftState;
      setLeftDrumVisualState(nextLeftState);

      const rightElapsed = now - lastStrikeTimeRef.current.right;
      let nextRightState = rightDrumStateRef.current;
      if (rightDrumStateRef.current === "COOLDOWN") {
        if (rightElapsed >= strikePaceMs) nextRightState = rightVal < RESET_ENERGY_THRESHOLD ? "ARMED" : "WAITING_LIFT";
      } else if (rightDrumStateRef.current === "WAITING_LIFT") {
        if (rightVal < RESET_ENERGY_THRESHOLD) nextRightState = "ARMED";
      } else if (rightDrumStateRef.current === "ARMED") {
        if (rightVal >= strikeThreshold && rightElapsed >= strikePaceMs) {
          nextRightState = "COOLDOWN";
          lastStrikeTimeRef.current.right = now;
          handleDrumHit("right");
        }
      }
      rightDrumStateRef.current = nextRightState;
      setRightDrumVisualState(nextRightState);

      if (pipCanvasRef.current) {
        const canvas = pipCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          const videoEl = trackerRef.current?.getVideoElement();
          if (videoEl && videoEl.readyState >= 2) {
            drawCroppedCameraFeed(ctx, videoEl, canvas.width, canvas.height);
          } else {
            ctx.fillStyle = "#1e1b18";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          const w = canvas.width;
          const h = canvas.height;

          ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(w * 0.28, h * 0.04, w * 0.44, h * 0.38);
          ctx.fillStyle = "rgba(148, 163, 184, 0.75)";
          ctx.font = "bold 9px sans-serif";
          ctx.fillText("FACE ZONE (IGNORED)", w * 0.33, h * 0.12);

          ctx.setLineDash([]);
          const isLeftStruck = nextLeftState === "COOLDOWN";
          ctx.strokeStyle = isLeftStruck ? "#f59e0b" : "rgba(245, 158, 11, 0.6)";
          ctx.lineWidth = isLeftStruck ? 3 : 2;
          ctx.fillStyle = isLeftStruck ? "rgba(245, 158, 11, 0.25)" : "rgba(245, 158, 11, 0.08)";
          ctx.fillRect(w * 0.04, h * 0.42, w * 0.40, h * 0.54);
          ctx.strokeRect(w * 0.04, h * 0.42, w * 0.40, h * 0.54);
          ctx.fillStyle = isLeftStruck ? "#fef08a" : "#fcd34d";
          ctx.font = "black 10px sans-serif";
          ctx.fillText(isLeftStruck ? "DHA (BASS)!" : "LEFT DHOL (BASS)", w * 0.07, h * 0.50);

          const isRightStruck = nextRightState === "COOLDOWN";
          ctx.strokeStyle = isRightStruck ? "#ef4444" : "rgba(239, 68, 68, 0.6)";
          ctx.lineWidth = isRightStruck ? 3 : 2;
          ctx.fillStyle = isRightStruck ? "rgba(239, 68, 68, 0.25)" : "rgba(239, 68, 68, 0.08)";
          ctx.fillRect(w * 0.56, h * 0.42, w * 0.40, h * 0.54);
          ctx.strokeRect(w * 0.56, h * 0.42, w * 0.40, h * 0.54);
          ctx.fillStyle = isRightStruck ? "#fecaca" : "#fca5a5";
          ctx.font = "black 10px sans-serif";
          ctx.fillText(isRightStruck ? "TA (TREBLE)!" : "RIGHT DHOL (TREBLE)", w * 0.59, h * 0.50);
        }
      }
    },
    [handleDrumHit, strikePaceMs, strikeThreshold]
  );

  const toggleVisionMode = async () => {
    playPress();
    if (isVisionActive) {
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
      setIsVisionActive(false);
      leftDrumStateRef.current = "ARMED";
      rightDrumStateRef.current = "ARMED";
    } else {
      const tracker = new OpticalMotionTracker(handleMotionEvent, 0.4);
      const success = await tracker.start();
      if (success) {
        trackerRef.current = tracker;
        setIsVisionActive(true);
        leftDrumStateRef.current = "ARMED";
        rightDrumStateRef.current = "ARMED";
        const promptMsg =
          loc === "hi"
            ? "ढोल वादन सक्रिय। हाथ ऊपर-नीचे हिलाकर थाप लगाएं, ऑटो-ट्यूनर आपकी हर थाप को भारतीय सुर में मिला देगा।"
            : loc === "as"
            ? "ঢোল বাদন সক্ৰিয় হ'ল। হাত ওপৰ-তল কৰি চাপৰি মাৰক, অটো-টিউনাৰে সুৰ আৰু তাল মিলাই দিব।"
            : "Auto-tuned Indian drumming active. Move your left or right hand down to strike the drum. The tuner keeps you on the song beat.";
        speak(promptMsg, locale, rate);
      } else {
        setIsVisionActive(false);
      }
    }
  };

  const startGame = useCallback(() => {
    playPress();
    ensureAudioContext();
    if (!engineRef.current) {
      const engine = new TunedDrumEngine();
      engine.setSong(selectedSongId);
      engine.onDiagnostics = (d) => {
        lastDiagnosticsRef.current = { step: d.step, quantInMs: d.quantInMs };
        setGridStep(d.step);
      };
      engine.onNoteTriggered = (note, index) => {
        setActiveNote(note);
        setActiveNoteIndex(index);
      };
      engineRef.current = engine;
    } else {
      engineRef.current.setSong(selectedSongId);
    }

    engineRef.current.start();
    setRunning(true);
    setPhase("play");
    setHitsCount(0);
    setLeftHits(0);
    setRightHits(0);
    setActiveNoteIndex(0);
    setActiveNote(currentSong.notes[0]);
    leftDrumStateRef.current = "ARMED";
    rightDrumStateRef.current = "ARMED";
    const nowIso = new Date().toISOString();
    setStartedAt(nowIso);
    setTaps(0);
  }, [currentSong.notes, selectedSongId]);

  const stopGame = useCallback(() => {
    playPress();
    if (engineRef.current) {
      engineRef.current.stop();
    }
    setRunning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (trackerRef.current) {
        trackerRef.current.stop();
        trackerRef.current = null;
      }
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
    };
  }, []);

  useSessionGuard({
    patientId: patientId ?? 0,
    gameId: "tuned-drum",
    level,
    startedAt,
    taps,
    errorCount: 0,
  });

  const str = getGameStrings("tuned-drum", locale);
  const beatPos = gridStep % 4;

  const nextRecommendedSide = activeNote?.side || "left";

  if (loading)
    return (
      <GameShell title={str.title} score={0}>
        <GameLoading />
      </GameShell>
    );

  if (error)
    return (
      <GameShell title={str.title} score={0}>
        <GameError onRetry={reload} />
      </GameShell>
    );

  return (
    <GameShell title={str.title} score={score}>
      {phase === "intro" ? (
        <div className="flex flex-col items-center gap-6 py-6 text-center">
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-[#EFE9DF] px-3.5 py-1.5 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <Paperclip className="h-4 w-4 text-ink" />
              <span className="text-[11px] font-black uppercase tracking-wider text-ink">
                {str.title}
              </span>
            </div>
            <ShieldCheck className="h-4 w-4 text-amber-800" />
          </div>

          <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-3 border-black bg-amber-800 text-white shadow-[4px_4px_0px_#000]">
            <Music className="h-10 w-10 stroke-[2.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="font-serif text-3xl font-black text-ink">{str.introTitle}</h2>
            <p className="max-w-md text-sm font-semibold text-ink-secondary leading-relaxed">
              {loc === "hi"
                ? "असमिया लोकगीत, बिहू धुन और भारतीय भजनों के सुरों पर ढोल बजाएं। ऑटो-ट्यूनर आपकी हर थाप को सुर और ताल में सजा देता है।"
                : loc === "as"
                ? "অসমীয়া জাতীয় সংগীত, ৰঙালী বিহু আৰু গোৱালপৰীয়া লোকগীতৰ সুৰত ঢোল বজাওক। অটো-টিউনাৰে প্ৰতিটো চাপৰি তাল আৰু সুৰত ৰাখে।"
                : "Play authentic Assamese folk songs, Bihu rhythms, and Indian bhajans. The auto-tuner snaps every strike to the Indian song melody."}
            </p>
          </div>

          {/* Song Selection Carousel / Grid in Intro */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-4 text-left shadow-[4px_4px_0px_#000] space-y-2.5">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 block">
              {loc === "hi" ? "गीत या धुन चुनें:" : loc === "as" ? "সংগীত বা সুৰ বাছক:" : "Choose an Indian Song / Melody:"}
            </span>
            <div className="grid grid-cols-1 gap-2">
              {INDIAN_SONGS.map((song) => {
                const isSelected = selectedSongId === song.id;
                return (
                  <button
                    key={song.id}
                    type="button"
                    onClick={() => selectSong(song.id)}
                    className={`flex items-center justify-between rounded-xl border-2 p-2.5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-black bg-amber-200 text-amber-950 font-black shadow-[2px_2px_0px_#000]"
                        : "border-black/25 bg-white text-ink hover:bg-amber-50 font-bold"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-black">{song.title[loc]}</div>
                      <div className="text-[10px] text-ink-secondary">{song.taal[loc]} • {song.region[loc]}</div>
                    </div>
                    {isSelected && (
                      <span className="rounded-full bg-amber-800 px-2 py-0.5 text-[9px] font-black text-white uppercase">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <AudioPrompt text={str.audioPrompt} label={str.listenLabel} size="md" />

          <ChunkyButton variant="tea" size="xl" onClick={startGame}>
            {str.startButton}
          </ChunkyButton>
        </div>
      ) : phase === "play" ? (
        <div className="flex flex-col items-center gap-3 py-1">
          {/* Top Progress Bar & Camera Trigger */}
          <div className="w-full max-w-md flex items-center justify-between rounded-xl border-2 border-black bg-surface px-3.5 py-2 shadow-[2px_2px_0px_#000]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <Activity className="h-4 w-4" /> {str.hudProgress}: {hitsCount} / {TARGET_HITS}
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-ink-secondary bg-surface-muted px-1.5 py-0.5 rounded border border-black/20">
                L: {leftHits} &bull; R: {rightHits}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setShowVisionSettings((prev) => !prev)}
                className={`btn-tactile p-1.5 rounded-lg border-2 border-black text-xs font-black shadow-xs transition-all cursor-pointer ${
                  showVisionSettings ? "bg-amber-200" : "bg-surface hover:bg-surface-muted"
                }`}
                title="Air-Drum Strike Sensitivity Settings"
              >
                <Sliders className="h-3.5 w-3.5" />
              </button>

              <button
                type="button"
                onClick={toggleVisionMode}
                className={`btn-tactile inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-2 border-black text-xs font-black shadow-xs transition-all cursor-pointer ${
                  isVisionActive ? "bg-amber-800 text-white animate-pulse" : "bg-surface-muted text-ink hover:bg-surface"
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                <span>{isVisionActive ? "Air Camera: ON" : "Air Camera"}</span>
              </button>
            </div>
          </div>

          {/* INDIAN SONG SELECTION QUICK TABS */}
          <div className="w-full max-w-md flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {INDIAN_SONGS.map((song) => {
              const isSelected = selectedSongId === song.id;
              return (
                <button
                  key={song.id}
                  type="button"
                  onClick={() => selectSong(song.id)}
                  className={`shrink-0 rounded-xl border-2 px-3 py-1.5 text-[11px] font-black transition-all cursor-pointer ${
                    isSelected
                      ? "border-black bg-amber-800 text-white shadow-[2px_2px_0px_#000]"
                      : "border-black/30 bg-white text-ink hover:border-black"
                  }`}
                >
                  {song.title[loc]}
                </button>
              );
            })}
          </div>

          {/* ACTIVE INDIAN SONG & LIVE BOL BANNER */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 p-3.5 shadow-[3px_3px_0px_#000] space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-base font-black text-amber-950">
                  {currentSong.title[loc]}
                </h3>
                <p className="text-[11px] font-bold text-amber-900/80">
                  {currentSong.taal[loc]} • {currentSong.bpm} BPM
                </p>
              </div>
              {/* Pulsing Bol Badge */}
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-800">
                  {loc === "hi" ? "वर्तमान बोल" : loc === "as" ? "বোল" : "Indian Bol"}
                </span>
                <span className="rounded-xl border-2 border-black bg-amber-400 px-2.5 py-1 text-base font-black text-ink shadow-[2px_2px_0px_#000] animate-bounce">
                  {activeNote ? activeNote.bol[loc] : currentSong.notes[0].bol[loc]}
                </span>
              </div>
            </div>

            {/* Current Song Lyric Line & Musical Note */}
            <div className="rounded-xl border-2 border-amber-900/20 bg-white/90 p-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink-secondary">
                  {loc === "hi" ? "सुर / शब्द:" : loc === "as" ? "সুৰ / শব্দ:" : "Lyric / Tone:"}
                </span>
                <span className="text-base font-black text-emerald-800">
                  &ldquo;{activeNote ? activeNote.lyric[loc] : currentSong.notes[0].lyric[loc]}&rdquo;
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-md bg-amber-200 px-2 py-0.5 text-xs font-mono font-black text-amber-950">
                  {activeNote ? activeNote.noteName : currentSong.notes[0].noteName}
                </span>
                <span className="text-[10px] font-bold text-ink-secondary">
                  ({Math.round(activeNote ? activeNote.freq : currentSong.notes[0].freq)} Hz)
                </span>
              </div>
            </div>

            {/* 16-Syllable Phrase Rail */}
            <div className="grid grid-cols-8 gap-1 pt-1">
              {currentSong.notes.map((n: SongNote, idx: number) => {
                const isCurrent = idx === activeNoteIndex;
                const isPassed = idx < activeNoteIndex;
                return (
                  <div
                    key={idx}
                    className={`h-2 rounded-full border transition-all ${
                      isCurrent
                        ? "border-black bg-amber-600 scale-125 shadow-xs ring-2 ring-amber-400"
                        : isPassed
                        ? "border-black/30 bg-emerald-500"
                        : "border-black/20 bg-black/10"
                    }`}
                    title={`${n.lyric[loc]} (${n.bol[loc]})`}
                  />
                );
              })}
            </div>
          </div>

          {/* AUTO-TUNER STATUS & QUANTIZATION FEEDBACK */}
          <div className="w-full max-w-md rounded-2xl border-3 border-black bg-[#FAF5EE] p-3 shadow-[3px_3px_0px_#000] space-y-2">
            <div className="flex items-center justify-between text-[11px] font-black uppercase">
              <span className="flex items-center gap-1.5 text-amber-900">
                <Wand2 className="h-3.5 w-3.5 text-amber-700" />
                Auto-Tuner: {autoTuneOn ? "ON (Rhythm & Melody Snapped)" : "RAW TIMING"}
              </span>
              <button
                type="button"
                onClick={() => {
                  playPress();
                  setAutoTuneOn((v) => !v);
                }}
                className={`px-2 py-0.5 rounded-lg border-2 border-black text-[10px] font-black cursor-pointer transition-all ${
                  autoTuneOn ? "bg-emerald-600 text-white" : "bg-surface text-ink"
                }`}
                title="Toggle Indian song rhythm snap auto-tuning"
              >
                {autoTuneOn ? "Tuned" : "Raw"}
              </button>
            </div>

            {/* 4-beat measure rail; current beat pulses */}
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 1, 2, 3].map((b) => (
                <div
                  key={b}
                  className={`h-2.5 rounded-full border border-black transition-all ${
                    beatPos === b ? "bg-amber-600 scale-110 shadow-xs" : "bg-black/15"
                  }`}
                />
              ))}
            </div>

            {/* Quantize meter: shows how much the tuner corrected your last strike */}
            <div className="flex items-center justify-between text-[10px] font-bold text-ink-secondary gap-2">
              <span className="flex items-center gap-1 shrink-0">
                <Gauge className="h-3 w-3 text-tea" /> Auto-Tune Timing Correction: {quantizedMs}ms
              </span>
              <span className="text-right leading-tight">
                {autoTuneOn ? (
                  <span className="text-emerald-700 font-bold">
                    {loc === "hi"
                      ? "आपकी हर थाप सुर और ताल में बंधती है"
                      : loc === "as"
                      ? "চাপৰি স্বয়ংক্ৰিয়ভাৱে তালত মিলি যায়"
                      : "Off-timed hits snap seamlessly to the song"}
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold">Raw unquantized</span>
                )}
              </span>
            </div>
          </div>

          {/* CONDUCTOR CUE */}
          <div
            className={`flex items-center justify-center gap-2 rounded-xl border-2 px-4 py-2 text-xs sm:text-sm font-black text-white shadow-xs ${
              running
                ? nextRecommendedSide === "left"
                  ? "bg-orange-600 border-orange-800 animate-pulse"
                  : "bg-red-600 border-red-800 animate-pulse"
                : "bg-gray-400 border-gray-500"
            }`}
          >
            {running ? (
              nextRecommendedSide === "left" ? (
                <>
                  <ArrowLeft className="h-4 w-4 stroke-[3]" />
                  <span>
                    {loc === "hi"
                      ? `बायां ढोल बजाएं! (थाप: ${activeNote?.bol[loc] || "धा"})`
                      : loc === "as"
                      ? `বাওঁ ঢোলত চাপৰি মাৰক! (বোল: ${activeNote?.bol[loc] || "ধা"})`
                      : `STRIKE LEFT! (Bol: ${activeNote?.bol[loc] || "Dha"})`}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {loc === "hi"
                      ? `दायां ढोल बजाएं! (थाप: ${activeNote?.bol[loc] || "ता"})`
                      : loc === "as"
                      ? `সোঁ ঢোলত চাপৰি মাৰক! (বোল: ${activeNote?.bol[loc] || "তা"})`
                      : `STRIKE RIGHT! (Bol: ${activeNote?.bol[loc] || "Ta"})`}
                  </span>
                  <ArrowRight className="h-4 w-4 stroke-[3]" />
                </>
              )
            ) : (
              <span>{loc === "hi" ? "ढोल बजाने के लिए 'आरंभ करें' दबाएं" : loc === "as" ? "ঢোল বজাবলৈ 'আৰম্ভ' টিপক" : "Press Start to begin drumming"}</span>
            )}
          </div>

          {/* 3D DHOL MODEL */}
          <div className="w-full max-w-md">
            <TunedDhol3D leftStrike={leftImpulse} rightStrike={rightImpulse} running={running} />
          </div>

          {/* START / STOP CONTROLS */}
          <div className="w-full max-w-md flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={running ? stopGame : startGame}
              className={`btn-tactile inline-flex items-center gap-2 px-8 py-3 rounded-xl border-3 border-black text-sm font-black shadow-[4px_4px_0px_#000] active:translate-y-1 cursor-pointer transition-all ${
                running
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {running ? (
                <>
                  <Square className="h-4 w-4 fill-white" />
                  {loc === "hi" ? "विराम (Stop)" : loc === "as" ? "থামক (Stop)" : "Stop"}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-white" />
                  {loc === "hi" ? "आरंभ करें (Start)" : loc === "as" ? "আৰম্ভ কৰক (Start)" : "Start"}
                </>
              )}
            </button>
          </div>

          {/* LIVE PIP CAMERA FEED */}
          {isVisionActive && (
            <div className="w-full max-w-md rounded-2xl border-3 border-black bg-surface p-3 shadow-[4px_4px_0px_#000] space-y-2 animate-fade-in">
              <div className="flex items-center justify-between text-xs font-black text-ink">
                <span className="flex items-center gap-1.5">
                  <Camera className="h-3.5 w-3.5 text-amber-800" />
                  Live Air-Drumming Guide
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] text-tea bg-tea-light px-2 py-0.5 rounded border border-tea/30">
                  <UserCheck className="h-3 w-3" /> Face Protected
                </span>
              </div>
              <div className="relative w-full aspect-16/9 rounded-xl border-2 border-black overflow-hidden bg-black shadow-inner">
                <canvas ref={pipCanvasRef} width={320} height={180} className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold pt-1">
                <div className="rounded-xl border-2 border-orange-600/40 bg-orange-50 p-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-black text-orange-950">Left Dhol:</span>
                    <span className="font-mono font-black text-orange-800">{Math.round(leftMotionLevel * 100)}%</span>
                  </div>
                  <div className="relative h-3 w-full rounded-full border border-black/40 bg-orange-200/50 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-75 ${leftMotionLevel >= strikeThreshold ? "bg-emerald-500" : "bg-orange-500"}`}
                      style={{ width: `${Math.min(100, Math.round(leftMotionLevel * 100))}%` }}
                    />
                    <div className="absolute top-0 bottom-0 w-0.5 bg-black z-10" style={{ left: `${Math.round(strikeThreshold * 100)}%` }} />
                  </div>
                  <div className="text-[10px] font-black flex items-center justify-between pt-0.5">
                    <span>State:</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                        leftDrumVisualState === "ARMED"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-500"
                          : leftDrumVisualState === "COOLDOWN"
                          ? "bg-orange-300 text-black border border-black font-black"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {leftDrumVisualState === "ARMED" ? "Ready" : leftDrumVisualState === "COOLDOWN" ? "Hit!" : "Lift"}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl border-2 border-red-600/40 bg-red-50 p-2 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-black text-red-950">Right Dhol:</span>
                    <span className="font-mono font-black text-red-800">{Math.round(rightMotionLevel * 100)}%</span>
                  </div>
                  <div className="relative h-3 w-full rounded-full border border-black/40 bg-red-200/50 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-75 ${rightMotionLevel >= strikeThreshold ? "bg-emerald-500" : "bg-red-500"}`}
                      style={{ width: `${Math.min(100, Math.round(rightMotionLevel * 100))}%` }}
                    />
                    <div className="absolute top-0 bottom-0 w-0.5 bg-black z-10" style={{ left: `${Math.round(strikeThreshold * 100)}%` }} />
                  </div>
                  <div className="text-[10px] font-black flex items-center justify-between pt-0.5">
                    <span>State:</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] uppercase ${
                        rightDrumVisualState === "ARMED"
                          ? "bg-emerald-100 text-emerald-900 border border-emerald-500"
                          : rightDrumVisualState === "COOLDOWN"
                          ? "bg-red-300 text-black border border-black font-black"
                          : "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {rightDrumVisualState === "ARMED" ? "Ready" : rightDrumVisualState === "COOLDOWN" ? "Hit!" : "Lift"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DUAL DRUM HIT PADS WITH AUTHENTIC INDIAN BOLS */}
          <div className="w-full max-w-md grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => running && handleDrumHit("left")}
              disabled={!running}
              className={`btn-tactile flex flex-col items-center justify-center gap-1.5 rounded-2xl border-3 p-4 shadow-[4px_4px_0px_#000] transition-all min-h-[96px] ${
                !running
                  ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                  : nextRecommendedSide === "left"
                  ? "border-black bg-orange-200 ring-4 ring-orange-500 animate-pulse cursor-pointer"
                  : "border-black bg-orange-100 hover:bg-orange-200 active:translate-y-1 cursor-pointer"
              }`}
            >
              <span className={`text-base font-black ${running ? "text-orange-950" : "text-gray-400"}`}>
                {loc === "hi" ? "बायां ढोल" : loc === "as" ? "বাওঁ ঢোল" : "LEFT DHOL"}
              </span>
              <span className={`text-xs font-black uppercase tracking-wide rounded-lg px-2 py-0.5 ${
                running ? "bg-orange-300 text-orange-950 border border-orange-600" : "text-gray-400"
              }`}>
                {loc === "hi" ? "धा / घे (Bass)" : loc === "as" ? "ধা / ঘে (Bass)" : "Dha / Ghe (Bass)"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => running && handleDrumHit("right")}
              disabled={!running}
              className={`btn-tactile flex flex-col items-center justify-center gap-1.5 rounded-2xl border-3 p-4 shadow-[4px_4px_0px_#000] transition-all min-h-[96px] ${
                !running
                  ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
                  : nextRecommendedSide === "right"
                  ? "border-black bg-red-200 ring-4 ring-red-500 animate-pulse cursor-pointer"
                  : "border-black bg-red-100 hover:bg-red-200 active:translate-y-1 cursor-pointer"
              }`}
            >
              <span className={`text-base font-black ${running ? "text-red-950" : "text-gray-400"}`}>
                {loc === "hi" ? "दायां ढोल" : loc === "as" ? "সোঁ ঢোল" : "RIGHT DHOL"}
              </span>
              <span className={`text-xs font-black uppercase tracking-wide rounded-lg px-2 py-0.5 ${
                running ? "bg-red-300 text-red-950 border border-red-600" : "text-gray-400"
              }`}>
                {loc === "hi" ? "ता / तिन (Treble)" : loc === "as" ? "তা / তিন (Treble)" : "Ta / Tin (Treble)"}
              </span>
            </button>
          </div>
        </div>
      ) : (
        <Celebration
          title={str.celebrationTitle}
          subtitle={
            loc === "hi"
              ? `बहुत सुंदर! आपने ${currentSong.title[loc]} की धुन पूरी सुर और ताल में बजाई।`
              : loc === "as"
              ? `অতি সুন্দৰ! আপুনি ${currentSong.title[loc]}ৰ সুৰ সুমধুৰ তালেৰে সম্পূৰ্ণ কৰিলে।`
              : `Wonderful! You played ${currentSong.title[loc]} in perfect Indian rhythm and tune.`
          }
          xpEarned={100}
          accuracy="100%"
        >
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto text-center pt-3">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={startGame}
                className="btn-tactile rounded-xl border-2 border-black bg-amber-800 px-6 py-3 text-xs font-black text-white shadow-[2px_2px_0px_#000] cursor-pointer hover:bg-amber-900"
              >
                {str.playAgainButton}
              </button>
              <button
                type="button"
                onClick={() => {
                  const currIdx = INDIAN_SONGS.findIndex((s) => s.id === selectedSongId);
                  const nextSong = INDIAN_SONGS[(currIdx + 1) % INDIAN_SONGS.length];
                  selectSong(nextSong.id);
                  startGame();
                }}
                className="btn-tactile rounded-xl border-2 border-black bg-emerald-600 px-6 py-3 text-xs font-black text-white shadow-[2px_2px_0px_#000] cursor-pointer hover:bg-emerald-700"
              >
                {loc === "hi" ? "अगला गीत बजाएं ➔" : loc === "as" ? "পৰৱৰ্তী গীত বজাওক ➔" : "Play Next Song ➔"}
              </button>
              <Link
                href="/patient/games"
                className="btn-tactile rounded-xl border-2 border-black bg-surface px-6 py-3 text-xs font-black text-ink shadow-[2px_2px_0px_#000] cursor-pointer"
              >
                {str.backToHub}
              </Link>
            </div>
          </div>
        </Celebration>
      )}
    </GameShell>
  );
}
