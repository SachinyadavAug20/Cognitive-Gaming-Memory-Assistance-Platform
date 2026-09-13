"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import {
  Activity,
  Paperclip,
  ShieldCheck,
  MapPin,
  Users,
  CheckCircle2,
  Brain,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  BookOpen,
  ExternalLink,
  FileText,
} from "lucide-react";

interface StateTelemetry {
  id: string;
  name: string;
  capital: string;
  registeredPatients: number;
  adherenceRate: number;
  stabilityIndex: number; // 0..100
  activePHCs: number;
  topModule: string;
  districts: { name: string; patients: number; adherence: number }[];
}

const NE_STATES_DATA: StateTelemetry[] = [
  {
    id: "assam",
    name: "Assam",
    capital: "Dispur / Guwahati",
    registeredPatients: 1420,
    adherenceRate: 93.2,
    stabilityIndex: 91.4,
    activePHCs: 64,
    topModule: "The 3D Heritage Loom & Brahmaputra River",
    districts: [
      { name: "Kamrup Metropolitan (Guwahati)", patients: 520, adherence: 94.5 },
      { name: "Dibrugarh", patients: 310, adherence: 92.1 },
      { name: "Sonitpur (Tezpur)", patients: 280, adherence: 93.0 },
      { name: "Cachar (Silchar)", patients: 310, adherence: 91.8 },
    ],
  },
  {
    id: "meghalaya",
    name: "Meghalaya",
    capital: "Shillong",
    registeredPatients: 640,
    adherenceRate: 91.8,
    stabilityIndex: 89.6,
    activePHCs: 32,
    topModule: "Ward's Lake Lotus Bloom & Khasi Ksing Drum",
    districts: [
      { name: "East Khasi Hills (Shillong)", patients: 380, adherence: 93.4 },
      { name: "West Garo Hills (Tura)", patients: 140, adherence: 89.2 },
      { name: "West Jaintia Hills (Jowai)", patients: 120, adherence: 90.5 },
    ],
  },
  {
    id: "manipur",
    name: "Manipur",
    capital: "Imphal",
    registeredPatients: 510,
    adherenceRate: 94.1,
    stabilityIndex: 92.0,
    activePHCs: 26,
    topModule: "Ima Keithel Bazaar Barter & Meitei Pung",
    districts: [
      { name: "Imphal West", patients: 260, adherence: 95.2 },
      { name: "Imphal East", patients: 150, adherence: 93.8 },
      { name: "Churachandpur", patients: 100, adherence: 92.1 },
    ],
  },
  {
    id: "mizoram",
    name: "Mizoram",
    capital: "Aizawl",
    registeredPatients: 420,
    adherenceRate: 95.0,
    stabilityIndex: 93.2,
    activePHCs: 22,
    topModule: "Mizo Thufing Proverb Cloze & Puanbu Weaving",
    districts: [
      { name: "Aizawl District", patients: 280, adherence: 96.1 },
      { name: "Lunglei", patients: 90, adherence: 93.4 },
      { name: "Champhai", patients: 50, adherence: 94.0 },
    ],
  },
  {
    id: "nagaland",
    name: "Nagaland",
    capital: "Kohima",
    registeredPatients: 380,
    adherenceRate: 89.5,
    stabilityIndex: 88.4,
    activePHCs: 20,
    topModule: "Rhythm of the Hills & Vintage Akashvani Radio",
    districts: [
      { name: "Kohima", patients: 190, adherence: 91.2 },
      { name: "Dimapur", patients: 130, adherence: 88.9 },
      { name: "Mokokchung", patients: 60, adherence: 87.5 },
    ],
  },
  {
    id: "tripura",
    name: "Tripura",
    capital: "Agartala",
    registeredPatients: 460,
    adherenceRate: 90.8,
    stabilityIndex: 90.1,
    activePHCs: 24,
    topModule: "Living Heritage Storybook & Memory Jigsaw",
    districts: [
      { name: "West Tripura (Agartala)", patients: 270, adherence: 92.0 },
      { name: "Gomati (Udaipur)", patients: 110, adherence: 89.4 },
      { name: "North Tripura (Dharmanagar)", patients: 80, adherence: 90.2 },
    ],
  },
  {
    id: "arunachal",
    name: "Arunachal Pradesh",
    capital: "Itanagar",
    registeredPatients: 320,
    adherenceRate: 88.6,
    stabilityIndex: 87.9,
    activePHCs: 18,
    topModule: "Village Wayfinding Walk & Living Root Bridge",
    districts: [
      { name: "Papum Pare (Itanagar)", patients: 160, adherence: 90.1 },
      { name: "Tawang", patients: 90, adherence: 87.4 },
      { name: "East Siang (Pasighat)", patients: 70, adherence: 88.0 },
    ],
  },
  {
    id: "sikkim",
    name: "Sikkim",
    capital: "Gangtok",
    registeredPatients: 290,
    adherenceRate: 93.8,
    stabilityIndex: 92.5,
    activePHCs: 16,
    topModule: "3D Living River & Voice Reminiscence Scribe",
    districts: [
      { name: "East Sikkim (Gangtok)", patients: 180, adherence: 94.6 },
      { name: "South Sikkim (Namchi)", patients: 70, adherence: 92.8 },
      { name: "West Sikkim (Geyzing)", patients: 40, adherence: 93.0 },
    ],
  },
];

const LIVE_SESSION_FEED = [
  { id: 1, text: "Patient #AS-104 (Guwahati) completed 3D Heritage Loom", metric: "100% Precision", time: "4s ago", state: "Assam" },
  { id: 2, text: "ASHA Worker (Shillong PHC) registered new Elder Profile", metric: "ABHA Linked", time: "16s ago", state: "Meghalaya" },
  { id: 3, text: "Patient #MN-209 (Imphal) completed Folk Proverb Cloze", metric: "+100 XP Gain", time: "32s ago", state: "Manipur" },
  { id: 4, text: "Patient #MZ-088 (Aizawl) engaged in 3D Living River Gestures", metric: "89.4% Path Eff.", time: "55s ago", state: "Mizoram" },
  { id: 5, text: "Doctor Review (Kohima District Hospital) validated Biomarker Radar", metric: "Status: Stable", time: "1m ago", state: "Nagaland" },
];

const CC_I18N: Record<string, {
  headerBadge: string;
  headerTitle: string;
  headerSubtitle: string;
  connectedBadge: string;
  caregiverPortal: string;
  totalPatients: string;
  activeNesStates: string;
  avgAdherence: string;
  weeklyGoal: string;
  connectedPhcs: string;
  facilities: string;
  ashaNodes: string;
  activeModules: string;
  cdtxSuite: string;
  localTech: string;
  selectState: string;
}> = {
  as: {
    headerBadge: "MDoNER ৮-ৰাজ্যৰ এপিডেমিঅ'লজী আৰু টেলিমেট্ৰি কমাণ্ড চেণ্টাৰ",
    headerTitle: "আঞ্চলিক জ্ঞানীয় স্বাস্থ্য টেলিমেট্ৰি",
    headerSubtitle: "উত্তৰ-পূব ভাৰতৰ বাস্তৱ-সময়ৰ ক্লিনিকেল নিৰীক্ষণ, জিলা চিকিৎসা নিয়মীয়াতা আৰু আশা নেটৱৰ্ক টেলিমেট্ৰি",
    connectedBadge: "৮ খন ৰাজ্য সংযুক্ত",
    caregiverPortal: "যত্নকৰ্তা পোৰ্টেল",
    totalPatients: "মুঠ ৰোগী",
    activeNesStates: "৮ খন উত্তৰ-পূব ৰাজ্যত সক্ৰিয়",
    avgAdherence: "গড় নিয়মীয়াতা",
    weeklyGoal: "সাপ্তাহিক সেশন লক্ষ্য",
    connectedPhcs: "সংযুক্ত পিএইচচি",
    facilities: "কেন্দ্ৰ",
    ashaNodes: "আশা টেবলেট ন'ড",
    activeModules: "সক্ৰিয় মডিউল",
    cdtxSuite: "১৮ টা CDTx চুইট",
    localTech: "স্থানীয় Ollama আৰু ৩ডি WebGL",
    selectState: "পৰীক্ষাৰ বাবে উত্তৰ-পূবৰ ৰাজ্য বাছক:"
  },
  hi: {
    headerBadge: "MDoNER 8-राज्यीय महामारी विज्ञान एवं टेलीमेट्री कमांड सेंटर",
    headerTitle: "क्षेत्रीय संज्ञानात्मक स्वास्थ्य टेलीमेट्री",
    headerSubtitle: "पूर्वोत्तर भारत में वास्तविक समय की नैदानिक निगरानी, जिला चिकित्सा निरंतरता और आशा नेटवर्क टेलीमेट्री",
    connectedBadge: "8 राज्य जुड़े हुए",
    caregiverPortal: "देखभालकर्ता पोर्टल",
    totalPatients: "कुल मरीज़",
    activeNesStates: "8 पूर्वोत्तर राज्यों में सक्रिय",
    avgAdherence: "औसत निरंतरता",
    weeklyGoal: "साप्ताहिक सत्र लक्ष्य",
    connectedPhcs: "जुड़े पीएचसी केंद्र",
    facilities: "सुविधाएं",
    ashaNodes: "आशा टैबलेट नोड्स",
    activeModules: "सक्रिय मॉड्यूल",
    cdtxSuite: "18 CDTx सुइट",
    localTech: "स्थानीय Ollama और 3D WebGL",
    selectState: "निरीक्षण हेतु पूर्वोत्तर राज्य चुनें:"
  },
  en: {
    headerBadge: "MDoNER 8-State Epidemiology & Telemetry Command Center",
    headerTitle: "Regional Cognitive Health Telemetry",
    headerSubtitle: "Real-time clinical monitoring, district therapy adherence, and ASHA network telemetry across North East India",
    connectedBadge: "8 States Connected",
    caregiverPortal: "Caregiver Portal",
    totalPatients: "Total Patients",
    activeNesStates: "Active across 8 NES States",
    avgAdherence: "Avg Adherence",
    weeklyGoal: "Weekly Session Goal",
    connectedPhcs: "Connected PHCs",
    facilities: "Facilities",
    ashaNodes: "ASHA Tablet Nodes",
    activeModules: "Active Modules",
    cdtxSuite: "18 CDTx Suite",
    localTech: "Local Ollama & 3D WebGL",
    selectState: "Select North Eastern State to Inspect:"
  },
  bn: {
    headerBadge: "MDoNER ৮-রাজ্যের মহামারী বিজ্ঞান ও টেলিমেট্রি কমান্ড সেন্টার",
    headerTitle: "আঞ্চলিক জ্ঞানীয় স্বাস্থ্য টেলিমেট্রি",
    headerSubtitle: "উত্তর-পূর্ব ভারতের রিয়েল-টাইম ক্লিনিক্যাল পর্যবেক্ষণ, জেলা থেরাপি নিয়মিততা এবং আশা নেটওয়ার্ক টেলিমেট্রি",
    connectedBadge: "৮টি রাজ্য সংযুক্ত",
    caregiverPortal: "সেবাকারী পোর্টাল",
    totalPatients: "মোট রোগী",
    activeNesStates: "৮টি রাজ্যে সক্রিয়",
    avgAdherence: "গড় নিয়মিততা",
    weeklyGoal: "সাপ্তাহিক সেশন লক্ষ্য",
    connectedPhcs: "সংযুক্ত পিএইচসি",
    facilities: "কেন্দ্র",
    ashaNodes: "আশা ট্যাবলেট নোড",
    activeModules: "সক্রিয় মডিউল",
    cdtxSuite: "১৮টি CDTx স্যুট",
    localTech: "স্থানীয় Ollama ও ৩ডি WebGL",
    selectState: "পরিদর্শনের জন্য উত্তর-পূর্বের রাজ্য নির্বাচন করুন:"
  },
  mr: {
    headerBadge: "MDoNER 8-राज्यीय महामारी विज्ञान व टेलिमेट्री कमांड सेंटर",
    headerTitle: "प्रादेशिक संज्ञानात्मक आरोग्य टेलिमेट्री",
    headerSubtitle: "ईशान्य भारतात वास्तविक-वेळ क्लिनिकल निरीक्षण, जिल्हा उपचार नियमितता आणि आशा नेटवर्क टेलिमेट्री",
    connectedBadge: "8 राज्ये जोडलेली",
    caregiverPortal: "काळजीवाहक पोर्टल",
    totalPatients: "एकूण रुग्ण",
    activeNesStates: "8 ईशान्य राज्यांमध्ये सक्रिय",
    avgAdherence: "सरासरी नियमितता",
    weeklyGoal: "साप्ताहिक सत्र उद्दिष्ट",
    connectedPhcs: "जोडलेली पीएचसी",
    facilities: "सुविधा",
    ashaNodes: "आशा टॅब्लेट नोड्स",
    activeModules: "सक्रिय मॉड्यूल",
    cdtxSuite: "18 CDTx संच",
    localTech: "स्थानिक Ollama आणि 3D WebGL",
    selectState: "तपासणीसाठी ईशान्येकडील राज्य निवडा:"
  },
  ne: {
    headerBadge: "MDoNER ८-राज्यीय महामारी विज्ञान र टेलिमेट्री कमान्ड सेन्टर",
    headerTitle: "क्षेत्रीय संज्ञानात्मक स्वास्थ्य टेलिमेट्री",
    headerSubtitle: "पूर्वोत्तर भारतमा वास्तविक समयको क्लिनिकल अनुगमन, जिल्ला उपचार नियमितता र आशा नेटवर्क टेलिमेट्री",
    connectedBadge: "८ राज्यहरू जोडिएका",
    caregiverPortal: "हेरचाहकर्ता पोर्टल",
    totalPatients: "कुल बिरामी",
    activeNesStates: "८ पूर्वोत्तर राज्यहरूमा सक्रिय",
    avgAdherence: "औसत नियमितता",
    weeklyGoal: "साप्ताहिक सत्र लक्ष्य",
    connectedPhcs: "जोडिएका पीएचसी",
    facilities: "सुविधाहरू",
    ashaNodes: "आशा ट्याब्लेट नोडहरू",
    activeModules: "सक्रिय मोड्युलहरू",
    cdtxSuite: "१८ CDTx सुइट",
    localTech: "स्थानीय Ollama र ३डी WebGL",
    selectState: "निरीक्षणका लागि पूर्वोत्तर राज्य छान्नुहोस्:"
  },
  mni: {
    headerBadge: "MDoNER রাজ্য ৮ গী এপিদেমিওলোজি অমসুং তেলিমেত্রি কমান্দ সেন্তর",
    headerTitle: "লমদমগী ৱাখলগী হকশেল তেলিমেত্রি",
    headerSubtitle: "অৱাং-নোংপোক ভারতকী ক্লিনিকেল য়েংশিনবা অমসুং আশা নেতৱার্ক তেলিমেত্রি",
    connectedBadge: "রাজ্য ৮ শম্নরে",
    caregiverPortal: "য়োকখৎপীবা পোর্তাল",
    totalPatients: "অপুনবা অনাবা",
    activeNesStates: "রাজ্য ৮ দা চত্থরি",
    avgAdherence: "চাপ চাবা",
    weeklyGoal: "হপ্তাগী পান্দম",
    connectedPhcs: "পিঐচসি ক্লিনিকশিং",
    facilities: "মফমশিং",
    ashaNodes: "আশা তেব্লেত নোদ",
    activeModules: "মডিউলশিং",
    cdtxSuite: "১৮ CDTx চুইট",
    localTech: "Ollama অমসুং ৩ডি WebGL",
    selectState: "য়েংশিন্নবা রাজ্য খল্লু:"
  },
  brx: {
    headerBadge: "MDoNER ८-राज्योरि टेलिमेट्रि कमान्द सेनतार",
    headerTitle: "जायगायारि गोसोखांथि सावस्रि टेलिमेट्रि",
    headerSubtitle: "सानजा-सा भारतआव क्लिनिकेल नायदिंनाय आरो आशा नेतवर्क टेलिमेट्रि",
    connectedBadge: "८ राज्यो फोनांजाबबाय",
    caregiverPortal: "सामलायग्रा पोर्टल",
    totalPatients: "गासै बेमारिफोर",
    activeNesStates: "८ राज्योआव सोलिगासिनो दं",
    avgAdherence: "नेमो बादियै",
    weeklyGoal: "सप्ताहनि थांखि",
    connectedPhcs: "पीएचसी क्लिनिकफोर",
    facilities: "थावनि",
    ashaNodes: "आशा टेबलेत नद",
    activeModules: "सोलिफुं मडिउल",
    cdtxSuite: "१८ CDTx सुइट",
    localTech: "गावनि Ollama आरो ३डी WebGL",
    selectState: "नायनो थाखाय राज्यो सायख:"
  },
  grt: {
    headerBadge: "MDoNER 8-State Epidemiology & Telemetry Command Center",
    headerTitle: "Regional Cognitive Health Telemetry",
    headerSubtitle: "Real-time clinical monitoring, district therapy adherence, and ASHA network telemetry.",
    connectedBadge: "State 8 Nangrima",
    caregiverPortal: "Caregiver Portal",
    totalPatients: "Total Sa·giparang",
    activeNesStates: "State 8-o Kam Ka·enga",
    avgAdherence: "Avg Adherence",
    weeklyGoal: "Weekly Goal",
    connectedPhcs: "Connected PHCs",
    facilities: "Facilities",
    ashaNodes: "ASHA Tablet Nodes",
    activeModules: "Active Modules",
    cdtxSuite: "18 CDTx Suite",
    localTech: "Local Ollama & 3D WebGL",
    selectState: "Select North Eastern State:"
  },
  kha: {
    headerBadge: "MDoNER 8-State Epidemiology & Telemetry Command Center",
    headerTitle: "Regional Cognitive Health Telemetry",
    headerSubtitle: "Real-time clinical monitoring, district therapy adherence, bad ka ASHA network telemetry.",
    connectedBadge: "8 State La Iasoh",
    caregiverPortal: "Portal Nongri",
    totalPatients: "Baroh ki Nongpang",
    activeNesStates: "Dang trei ha ki 8 State",
    avgAdherence: "Jingiaid Ryntih",
    weeklyGoal: "Thong Shitaiew",
    connectedPhcs: "Ki PHC ba Iasoh",
    facilities: "Jaka",
    ashaNodes: "ASHA Tablet Nodes",
    activeModules: "Modules ba Trei",
    cdtxSuite: "18 CDTx Suite",
    localTech: "Local Ollama & 3D WebGL",
    selectState: "Jied ia ka State:"
  },
  lus: {
    headerBadge: "MDoNER 8-State Epidemiology & Telemetry Command Center",
    headerTitle: "Regional Cognitive Health Telemetry",
    headerSubtitle: "Real-time clinical monitoring, district therapy adherence, leh ASHA network telemetry.",
    connectedBadge: "State 8 Thlun Zawm",
    caregiverPortal: "Enkawltu Portal",
    totalPatients: "Damlo Zawng Zawng",
    activeNesStates: "State 8-ah hman mek a ni",
    avgAdherence: "Inzawmna Tha",
    weeklyGoal: "Kar Tih Tur",
    connectedPhcs: "PHC Zawmte",
    facilities: "Hmun",
    ashaNodes: "ASHA Tablet Nodes",
    activeModules: "Module Hman Mek",
    cdtxSuite: "18 CDTx Suite",
    localTech: "Local Ollama & 3D WebGL",
    selectState: "En turin State thlang rawh:"
  }
};

export function CommandCenterClient() {
  const locale = useLocale();
  const c18n = CC_I18N[locale] || CC_I18N.en;
  const [selectedStateId, setSelectedStateId] = useState<string>("assam");

  const activeState = NE_STATES_DATA.find((s) => s.id === selectedStateId) || NE_STATES_DATA[0];

  const totalPatients = NE_STATES_DATA.reduce((acc, s) => acc + s.registeredPatients, 0);
  const totalPHCs = NE_STATES_DATA.reduce((acc, s) => acc + s.activePHCs, 0);
  const avgAdherence = (
    NE_STATES_DATA.reduce((acc, s) => acc + s.adherenceRate, 0) / NE_STATES_DATA.length
  ).toFixed(1);

  return (
    <div className="min-h-screen bg-canvas pb-16">
      <main className="mx-auto max-w-6xl px-4 pt-6 space-y-6">
        {/* TOP COMMAND CENTER HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-3 border-black bg-surface p-5 shadow-[4px_4px_0px_#000]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Paperclip className="h-4 w-4 text-tea" />
              <span className="text-xs font-black uppercase tracking-wider text-ink">
                {c18n.headerBadge}
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-black text-ink flex items-center gap-2">
              <Activity className="h-7 w-7 text-tea" /> {c18n.headerTitle}
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-ink-secondary mt-1">
              {c18n.headerSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-green-100 px-3 py-1.5 text-xs font-black text-green-900 shadow-[2px_2px_0px_#000]">
              <span className="h-2.5 w-2.5 rounded-full bg-green-600 animate-pulse" />
              <span>{c18n.connectedBadge}</span>
            </span>
            <Link
              href="/caregiver"
              className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-tea px-3.5 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-tea-dark"
            >
              <span>{c18n.caregiverPortal}</span> <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* HIGH-LEVEL REGIONAL MACRO METRICS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] text-left">
            <div className="flex items-center justify-between text-ink-secondary mb-1">
              <span className="text-xs font-black uppercase tracking-wider">{c18n.totalPatients}</span>
              <Users className="h-4 w-4 text-tea" />
            </div>
            <div className="font-serif text-2xl font-black text-ink">{totalPatients.toLocaleString()}</div>
            <span className="text-[10px] font-bold text-green-700 mt-1 block">{c18n.activeNesStates}</span>
          </div>

          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] text-left">
            <div className="flex items-center justify-between text-ink-secondary mb-1">
              <span className="text-xs font-black uppercase tracking-wider">{c18n.avgAdherence}</span>
              <TrendingUp className="h-4 w-4 text-green-700" />
            </div>
            <div className="font-serif text-2xl font-black text-green-800">{avgAdherence}%</div>
            <span className="text-[10px] font-bold text-ink-secondary mt-1 block">{c18n.weeklyGoal}</span>
          </div>

          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] text-left">
            <div className="flex items-center justify-between text-ink-secondary mb-1">
              <span className="text-xs font-black uppercase tracking-wider">{c18n.connectedPhcs}</span>
              <MapPin className="h-4 w-4 text-amber-700" />
            </div>
            <div className="font-serif text-2xl font-black text-ink">{totalPHCs} {c18n.facilities}</div>
            <span className="text-[10px] font-bold text-ink-secondary mt-1 block">{c18n.ashaNodes}</span>
          </div>

          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[3px_3px_0px_#000] text-left">
            <div className="flex items-center justify-between text-ink-secondary mb-1">
              <span className="text-xs font-black uppercase tracking-wider">{c18n.activeModules}</span>
              <Brain className="h-4 w-4 text-purple-700" />
            </div>
            <div className="font-serif text-2xl font-black text-purple-900">{c18n.cdtxSuite}</div>
            <span className="text-[10px] font-bold text-tea mt-1 block">{c18n.localTech}</span>
          </div>
        </div>

        {/* STATE SELECTOR PILLS */}
        <div className="space-y-2 text-left">
          <span className="text-xs font-black uppercase tracking-wider text-tea block">
            {c18n.selectState}
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {NE_STATES_DATA.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedStateId(s.id)}
                className={`btn-tactile rounded-xl border-2 px-3.5 py-1.5 text-xs font-black transition-all cursor-pointer ${
                  selectedStateId === s.id
                    ? "border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
                    : "border-black bg-surface text-ink hover:bg-surface-muted shadow-[1px_1px_0px_#000]"
                }`}
              >
                {s.name} ({s.registeredPatients})
              </button>
            ))}
          </div>
        </div>

        {/* SELECTED STATE DEEP-DIVE & LIVE STREAM GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* STATE CLINICAL DETAILS (2 COLS) */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <div className="rounded-2xl border-3 border-black bg-surface p-5 shadow-[4px_4px_0px_#000] space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black/10 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-tea block">
                    State Health Network
                  </span>
                  <h2 className="font-serif text-2xl font-black text-ink">
                    {activeState.name} • {activeState.capital}
                  </h2>
                </div>
                <span className="rounded-lg border-2 border-black bg-[#FAF5EE] px-3 py-1 text-xs font-black text-ink">
                  Stability Index: {activeState.stabilityIndex}%
                </span>
              </div>

              {/* District Adherence Table */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-ink-secondary mb-2">
                  District Clinical Adherence & Patient Clusters:
                </h3>
                <div className="space-y-2">
                  {activeState.districts.map((d, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-black/20 bg-[#FAF5EE] p-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-tea shrink-0" />
                        <span className="font-black text-ink">{d.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-ink-secondary">{d.patients} Patients</span>
                        <span className="rounded bg-teal-100 px-2 py-0.5 font-black text-teal-800 border border-teal-300">
                          {d.adherence}% Adherence
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* State Highlight Info Card */}
              <div className="rounded-xl border-2 border-black bg-tea-light p-3.5 text-xs text-ink space-y-1">
                <span className="font-black text-tea-dark block">
                  Top Prescribed Therapeutic Module:
                </span>
                <p className="font-bold text-tea-dark inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 shrink-0 text-tea-dark" />
                  <span>{activeState.topModule}</span>
                </p>
              </div>
            </div>

            {/* ABDM & ABHA INTEGRATION ARCHITECTURE CARD */}
            <div className="rounded-2xl border-3 border-black bg-[#FFFBF0] p-5 shadow-[4px_4px_0px_#000] text-left space-y-2.5">
              <div className="flex items-center justify-between border-b-2 border-amber-300 pb-2">
                <span className="text-xs font-black uppercase text-amber-950 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-amber-700" /> Ayushman Bharat (ABDM / ABHA) Readiness
                </span>
                <span className="text-[10px] font-black uppercase rounded bg-amber-200 text-amber-950 px-2 py-0.5 border border-amber-400">
                  FHIR Interoperable
                </span>
              </div>
              <p className="text-xs font-medium text-ink leading-relaxed">
                CogniCare is engineered to bind continuous digital biomarkers to the patient&apos;s 14-digit <strong>Ayushman Bharat Health Account (ABHA ID)</strong>. Clinical milestones, MMSE trajectory data, and motor reaction times can be seamlessly synced with State Hospital EMRs using standardized HL7/FHIR protocols.
              </p>
            </div>
          </div>

          {/* REAL-TIME SESSION ACTIVITY FEED (1 COL) */}
          <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000] text-left space-y-3">
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-2">
              <span className="text-xs font-black uppercase tracking-wider text-tea flex items-center gap-1.5">
                <Clock className="h-4 w-4" /> Live Field Stream
              </span>
              <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
            </div>

            <div className="space-y-2.5">
              {LIVE_SESSION_FEED.map((feed) => (
                <div
                  key={feed.id}
                  className="rounded-xl border border-black/20 bg-[#FAF5EE] p-2.5 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[10px] text-ink-secondary font-bold">
                    <span className="font-black text-tea">{feed.state}</span>
                    <span>{feed.time}</span>
                  </div>
                  <p className="font-bold text-ink leading-snug">{feed.text}</p>
                  <div className="flex items-center gap-1 text-[10px] font-black text-teal-800">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{feed.metric}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-black/10 text-center">
              <span className="text-[10px] font-bold text-ink-secondary">
                Simulated real-time WebSocket telemetry feed
              </span>
            </div>
          </div>
        </div>

        {/* STATUTORY CLINICAL GOVERNANCE & SCIENTIFIC CITATIONS */}
        <section className="rounded-3xl border-3 border-black bg-white p-5 sm:p-6 shadow-[5px_5px_0px_#000] text-left space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-black bg-emerald-100 text-emerald-900">
                <ShieldCheck className="h-4 w-4 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="font-serif font-black text-base text-ink">
                  Statutory Healthcare Governance &amp; Clinical Telemetry Standards
                </h3>
                <p className="text-[11px] text-ink-secondary">
                  Aligned with official CDSCO, ICMR, ABDM, and WHO regulatory mandates
                </p>
              </div>
            </div>

            <Link
              href="/clinical-evidence"
              className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea px-3 py-1.5 text-xs font-black text-white shadow-[2px_2px_0px_#000] hover:bg-emerald-900 transition-colors"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>SaMD Class B Dossier</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="rounded-2xl border-2 border-black/20 bg-stone-50 p-3 space-y-1.5">
              <span className="font-black text-rose-800 text-[11px] uppercase tracking-wide">CDSCO SaMD Class B</span>
              <p className="text-[11px] text-stone-600 leading-snug">
                Medical Device Rules 2017 framework governing non-invasive digital screening software tools.
              </p>
              <a
                href="https://cdsco.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-800 hover:underline"
              >
                <span>CDSCO Official Portal</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>

            <div className="rounded-2xl border-2 border-black/20 bg-stone-50 p-3 space-y-1.5">
              <span className="font-black text-emerald-800 text-[11px] uppercase tracking-wide">ICMR AI Ethics 2023</span>
              <p className="text-[11px] text-stone-600 leading-snug">
                National biomedical AI guidelines mandating patient autonomy, zero cloud egress, and data privacy.
              </p>
              <a
                href="https://main.icmr.nic.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 hover:underline"
              >
                <span>ICMR Guidelines (2023)</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>

            <div className="rounded-2xl border-2 border-black/20 bg-stone-50 p-3 space-y-1.5">
              <span className="font-black text-indigo-800 text-[11px] uppercase tracking-wide">ABDM FHIR R4 NHA</span>
              <p className="text-[11px] text-stone-600 leading-snug">
                Standardized HL7/FHIR longitudinal health record architecture binding telemetry to ABHA IDs.
              </p>
              <a
                href="https://abdm.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-800 hover:underline"
              >
                <span>ABDM Architecture</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>

            <div className="rounded-2xl border-2 border-black/20 bg-stone-50 p-3 space-y-1.5">
              <span className="font-black text-teal-800 text-[11px] uppercase tracking-wide">Geronto-Neurology</span>
              <p className="text-[11px] text-stone-600 leading-snug">
                Bedside cognitive telemetry and non-pharmacological care in rural Indian districts.
              </p>
              <a
                href="https://practicalneurology.com/articles/2021-june/clinical-approach-to-dementia"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-800 hover:underline"
              >
                <span>Bouchachi &amp; Kataki (2021)</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
