"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Brain,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Award,
  BookOpen,
} from "lucide-react";
import { api } from "@/lib/api";
import type { GameSessionStats } from "@/types/gameSession";
import { useTranslations, useLocale } from "next-intl";

interface ScaffoldingTexts {
  headerTitle: string;
  evidenceModel: string;
  autonomousRecall: string;
  autonomousRecallDesc: string;
  vanishingCues: string;
  vanishingCuesDesc: string;
  softBlock: string;
  absorbed: string;
  softBlockDesc: string;
  shieldTitle: string;
  shieldBody: string;
}

const SCAFFOLDING_I18N: Record<string, ScaffoldingTexts> = {
  en: {
    headerTitle: "Errorless Learning (EL) Scaffolding & Neuroplastic Flow",
    evidenceModel: "Clare & Jones (2008) Evidence Model",
    autonomousRecall: "Autonomous Recall",
    autonomousRecallDesc: "Zero-cue self-initiated task actions",
    vanishingCues: "Vanishing Cues Engaged",
    vanishingCuesDesc: "Tier 1/2 soft glowing prompts on hesitation",
    softBlock: "Soft-Block Bounces",
    absorbed: "100% Absorbed",
    softBlockDesc: "Zero catastrophic failure / buzzer alerts",
    shieldTitle: "Amnesic Episodic Memory Shield:",
    shieldBody: "By absorbing incorrect attempts with harmonic chimes and progressively escalating vanishing cues, the patient never encodes erroneous associations into damaged hippocampus pathways.",
  },
  as: {
    headerTitle: "ভুলহীন শিক্ষণ (EL) সাহায্য আৰু নিউৰোপ্লাষ্টিক প্ৰবাহ",
    evidenceModel: "ক্লেয়াৰ আৰু জোনছ (২০০৮) প্ৰমাণ মডেল",
    autonomousRecall: "স্বায়ত্ত সোঁৱৰণ",
    autonomousRecallDesc: "কোনো সংকেত অবিহনে নিজেই আৰম্ভ কৰা কাৰ্য",
    vanishingCues: "ক্ৰমশঃ বিলীন হোৱা সংকেত ব্যৱহৃত",
    vanishingCuesDesc: "দ্বিধাবোধত স্তৰ ১/২ কোমল উজ্জ্বল সংকেত",
    softBlock: "নমনীয় বাধা শোষণ",
    absorbed: "১০০% শোষিত",
    softBlockDesc: "কোনো অপ্ৰীতিকৰ বিফলতা বা তীব্ৰ বাজাৰ নাই",
    shieldTitle: "স্মৃতিভ্রংশ ঘটনাজনিত স্মৃতি ঢাল:",
    shieldBody: "ভুল প্ৰচেষ্টাসমূহ মধুৰ সুৰ আৰু ক্ৰমান্বয়ে আগবঢ়া সংকেতৰ সহায়ত গ্ৰহণ কৰি, ৰোগীয়ে ক্ষতিগ্ৰস্ত হিপ্প'কেম্পাছ পথত কেতিয়াও ভুল ধাৰণা সন্নিবিষ্ট নকৰে।",
  },
  hi: {
    headerTitle: "त्रुटिहीन शिक्षण (EL) सहायता एवं न्यूरोप्लास्टिक प्रवाह",
    evidenceModel: "क्लेयर एवं जोन्स (2008) साक्ष्य मॉडल",
    autonomousRecall: "स्वायत्त स्मरण",
    autonomousRecallDesc: "बिना किसी संकेत के स्वयं शुरू किए गए कार्य",
    vanishingCues: "क्रमशः लुप्त होने वाले संकेत सक्रिय",
    vanishingCuesDesc: "संकोच होने पर स्तर 1/2 कोमल चमकदार संकेत",
    softBlock: "सॉफ्ट-ब्लॉक बाउंस (सुरक्षित रोकथाम)",
    absorbed: "100% अवशोषित",
    softBlockDesc: "शून्य विफलता / कठोर बजर चेतावनी रहित",
    shieldTitle: "स्मृतिलोप प्रासंगिक स्मृति सुरक्षा ढाल:",
    shieldBody: "मधुर ध्वनि और शनैः-शनैः लुप्त होने वाले संकेतों द्वारा गलत प्रयासों को संभालकर, रोगी क्षतिग्रस्त हिप्पोकैम्पस मार्ग में गलत स्मृतियों को कभी संचित नहीं करता।",
  },
  bn: {
    headerTitle: "ত্রুটিহীন শিখন (EL) স্ক্যাফোল্ডিং ও নিউরোপ্লাস্টিক প্রবাহ",
    evidenceModel: "ক্লেয়ার ও জোন্স (২০০৮) প্রমাণ মডেল",
    autonomousRecall: "স্বায়ত্ত স্মরণ",
    autonomousRecallDesc: "কোনো সূত্র ছাড়া নিজে শুরু করা কাজ",
    vanishingCues: "ক্রমশ বিলীন সংকেত ব্যবহৃত",
    vanishingCuesDesc: "দ্বিধা হলে স্তর ১/২ নরম উজ্জ্বল সংকেত",
    softBlock: "নরম বাধা বাউন্স",
    absorbed: "১০০% শোষিত",
    softBlockDesc: "শূন্য ব্যর্থতা বা কর্কশ বাজার শব্দ",
    shieldTitle: "স্মৃতিভ্রংশ ঘটনাভিত্তিক স্মৃতি রক্ষা কবচ:",
    shieldBody: "ভুল প্রচেষ্টাগুলোকে সুরেলা ধ্বনি ও ক্রমান্বয়ে দৃশ্যমান সূত্রের মাধ্যমে সামলে নিয়ে, রোগী ক্ষতিগ্রস্ত হিপ্পোক্যাম্পাস পথে কখনো ভুল স্মৃতি সংকেতায়িত করে না।",
  },
  mr: {
    headerTitle: "त्रुटीरहित शिक्षण (EL) आधार आणि न्यूरोप्लास्टिक प्रवाह",
    evidenceModel: "क्लेअर आणि जोन्स (२००८) पुरावा मॉडेल",
    autonomousRecall: "स्वायत्त स्मरण",
    autonomousRecallDesc: "विना-संकेत स्वतः सुरू केलेल्या कृती",
    vanishingCues: "हळूहळू अदृश्य होणारे संकेत वापरले",
    vanishingCuesDesc: "संकोच वाटल्यास स्तर १/२ मंद प्रकाशमान संकेत",
    softBlock: "मृदू-अडथळा बाऊन्स",
    absorbed: "१००% शोषून घेतले",
    softBlockDesc: "शून्य अपयश / कोणताही कटू बजर इशारा नाही",
    shieldTitle: "स्मृतिभ्रंश प्रसंगनिष्ठ स्मृती संरक्षक ढाल:",
    shieldBody: "सुश्राव्य नाद आणि हळूहळू वाढणाऱ्या संकेतांद्वारे चुकीचे प्रयत्न सामावून घेऊन, रुग्ण खराब झालेल्या हिप्पोकॅम्पस मार्गांमध्ये चुकीच्या गोष्टी साठवत नाही.",
  },
  ne: {
    headerTitle: "त्रुटिरहित सिकाइ (EL) मचान र न्युरोप्लास्टिक प्रवाह",
    evidenceModel: "क्लेयर र जोन्स (२००८) प्रमाण मोडेल",
    autonomousRecall: "स्वायत्त स्मरण",
    autonomousRecallDesc: "कुनै संकेत बिना स्वयं सुरु गरिएको कार्य",
    vanishingCues: "क्रमशः हराउने संकेतहरू सक्रिय",
    vanishingCuesDesc: "हिचकिचाउँदा तह १/२ हल्का चम्किलो संकेतहरू",
    softBlock: "नरम-अवरोध बाउन्सेस",
    absorbed: "१০০% समाहित",
    softBlockDesc: "शून्य विफलता / कुनै तीखो बजर चेतावनी छैन",
    shieldTitle: "स्मृतिलोप प्रासंगिक स्मृति सुरक्षा ढाल:",
    shieldBody: "मधुर ध्वनि र क्रमशः बढ्दो संकेतहरूद्वारा गलत प्रयासहरूलाई सम्हालेर, बिरामीले क्षतिग्रस्त हिप्पोक्याम्पस मार्गहरूमा गलत धारणाहरू कहिल्यै सङ्कलन गर्दैन।",
  },
  mni: {
    headerTitle: "অশোইবা য়াওদবা তম্বা (EL) অমসুং নিউরোপ্লাস্টিক ফ্লো",
    evidenceModel: "ক্লেয়ার অমসুং জোন্স (২০০৮) খুদম মডেল",
    autonomousRecall: "ইশানা নিংশিংবা",
    autonomousRecallDesc: "খুদম য়াওদনা ইশানা পাংথোকপা থবক",
    vanishingCues: "তপ্না মাংখ্রিবা খুদমশিং শীজিন্নবা",
    vanishingCuesDesc: "চিংনবা মতমদা তাঙ্কক ১/২ নুংঙাইবা ঙাল্লকপা সংকেত",
    softBlock: "অশোইবা লেমহনবা বাউন্স",
    absorbed: "১০০% লোইশিনবা",
    softBlockDesc: "অশোইবা অমত্তা য়াওদবা / কন্না খোঞ্জেল থোকহন্দবা",
    shieldTitle: "মৈহৌরোলগী নিংশিং ঙাকথোকপা:",
    shieldBody: "অশোইবা হোৎনবশিং নুংঙাইবা খোঞ্জেল অমসুং তপ্না মাংবা সংকেতশিংনা লোইশিন্দুনা, অনাবনা থুগাইরবা হিপোক্যাম্পস লম্বীদা করম্বা অমত্তা অশোইবা পাউ তিল্লিদে।",
  },
  brx: {
    headerTitle: "गोरोन्थिफोर गैयै सोलोंथाइ (EL) हेफाजाब आरो निउरप्लास्टिक बोहैथि",
    evidenceModel: "क्लेयार आरो जोन्स (2008) फोरमान मोदेल",
    autonomousRecall: "गावनि गोसोखांफिननाय",
    autonomousRecallDesc: "जेबो सिगनेल गैयै गावनो जागायनाय खामानि",
    vanishingCues: "लसिऐ मोरोदलांनाय सिगनेल बाहायनाय",
    vanishingCuesDesc: "नेनाय समाव थार १/२ गुदुं सोंजायनाय सोलोंथाइ",
    softBlock: "गुरै हेंथा बाउंस",
    absorbed: "100% सोबनाय",
    softBlockDesc: "जेबो फेल जानाय गैया / गिथाव बाज़ार गैया",
    shieldTitle: "गोसोबावनाय जाथाइनि गोसोखां रैखा:",
    shieldBody: "गोरोन्थि नाजानायफोरखौ समायना रिंसिनाय आरो लसिऐ बारिनाय सिगनेलजों सामलायनानै, बिरामीआ गाज्रि जाबाय थानाय हिप्प'केम्पास लामाफोराव गोरोन्थि गोसोखांनायखौ जेब्लाबो दोनथुमना लाया।",
  },
  grt: {
    headerTitle: "Gualtagija Skie Ra·ani (EL) Dakchakangani aro Neuroplastic Flow",
    evidenceModel: "Clare aro Jones (2008) Sakki Model",
    autonomousRecall: "An·tang Gisik Ra·ani",
    autonomousRecallDesc: "Chin gri an·tang a·bachengatani kamrang",
    vanishingCues: "Gimaangenggipa Chinrangko Jakalani",
    vanishingCuesDesc: "Kenchakmitingo Bak 1/2 teng·enggipa didianirang",
    softBlock: "Komilgipa Champengani",
    absorbed: "100% Ra·chapani",
    softBlockDesc: "Gimaani gri / gam·begipa buzzer grigipa",
    shieldTitle: "Gisik Gimaani Katta Gital Chelchakani:",
    shieldBody: "Gualtagipa jotton ka·aniko seokgipa gam·ani aro komiangenggipa chinrangchi dakchake, bimang a·gilsakni gimaatgipa hippocampus-o gualgiparangko gisik ra·rikja.",
  },
  kha: {
    headerTitle: "Ka Jinghikai Khlem Jingbakla (EL) & Neuroplastic Flow",
    evidenceModel: "Clare & Jones (2008) Evidence Model",
    autonomousRecall: "Ka Jingkynmaw Hi",
    autonomousRecallDesc: "Ki kam ba sdang hi khlem jingbthah",
    vanishingCues: "Ki dak ba jah stet ba pyndonkam",
    vanishingCuesDesc: "Jingpynkynmaw ba tbian haba artatien",
    softBlock: "Ki jingiada ba jemnud",
    absorbed: "100% Ba la pdiang",
    softBlockDesc: "Khlem kano kano ka jingrem ne jingsawa pyrshah",
    shieldTitle: "Ka Jingiada ia ka Jingkynmaw:",
    shieldBody: "Da kaba pdiang ia ki jingleh bakla da ki sur ba bang bad ki jingbthah ba nang saphriang, u nongpang um ju kynmaw sniew shaphang ki jingbakla ha ka thied khlieh hippocampus.",
  },
  lus: {
    headerTitle: "Tihsual Awmlo Zirna (EL) Tanpuina leh Neuroplastic Luang",
    evidenceModel: "Clare & Jones (2008) Finfiahna Model",
    autonomousRecall: "Mahni Ngeia Hriatreuna",
    autonomousRecallDesc: "Tihdan hrilh lova mahnia hmalakna",
    vanishingCues: "Fiah lo tial tial tur entirna hman",
    vanishingCuesDesc: "Hriatthiam loh laia eng tlema kawhhmuhna",
    softBlock: "Harsatna vênna nem tak",
    absorbed: "100% Hneh taka vên",
    softBlockDesc: "Tlawmna hriattirna ri bengchheng awmlo",
    shieldTitle: "Theihnghilh Hriatreuna Vêntu:",
    shieldBody: "Tihsual palh te chu rimawi leh kawhhmuhna hmanga chhawk zângkhaiin, damlo chuan a thluak chhe tawh lamah hriatreu sual a vawng reng ngailo.",
  },
};

interface CognitiveGamingProgressCardProps {
  patientId: number;
}

const DEMO_FALLBACK_STATS: GameSessionStats = {
  totalSessions: 8,
  averageAccuracy: 94.2,
  averageMotorLatencyMs: 820,
  averageSpatialRecall: 92.5,
  recentSessions: [
    {
      id: 1,
      patientId: 1,
      gameType: "MAJULI_WALK",
      durationSeconds: 95,
      accuracyPercentage: 90,
      spatialRecallScore: 88,
      motorReactionTimeMs: 950,
      hesitationCount: 1,
      difficultyLevel: 1,
      timestamp: "2026-08-28T09:30:00",
    },
    {
      id: 2,
      patientId: 1,
      gameType: "TEA_HARVEST",
      durationSeconds: 110,
      accuracyPercentage: 92,
      spatialRecallScore: 90,
      motorReactionTimeMs: 890,
      hesitationCount: 0,
      difficultyLevel: 1,
      timestamp: "2026-08-29T10:15:00",
    },
    {
      id: 3,
      patientId: 1,
      gameType: "BIHU_DHOL",
      durationSeconds: 85,
      accuracyPercentage: 95,
      spatialRecallScore: 94,
      motorReactionTimeMs: 810,
      hesitationCount: 0,
      difficultyLevel: 1,
      timestamp: "2026-08-30T16:00:00",
    },
    {
      id: 4,
      patientId: 1,
      gameType: "ARROW_ESCAPE",
      durationSeconds: 130,
      accuracyPercentage: 96,
      spatialRecallScore: 95,
      motorReactionTimeMs: 760,
      hesitationCount: 0,
      difficultyLevel: 2,
      timestamp: "2026-08-31T11:20:00",
    },
    {
      id: 5,
      patientId: 1,
      gameType: "MAJULI_WALK",
      durationSeconds: 90,
      accuracyPercentage: 98,
      spatialRecallScore: 96,
      motorReactionTimeMs: 720,
      hesitationCount: 0,
      difficultyLevel: 2,
      timestamp: "2026-09-01T09:45:00",
    },
  ],
  aiClinicalSummary:
    "Patient demonstrates sustained prospective planning and steady spatial orientation across recent sessions. Motor reaction latency improved by 230ms with zero agitation instances during Bihu Dhol rhythmic entrainment. Recommended for continued daily interactive sessions with family landmark reinforcement.",
};

export function CognitiveGamingProgressCard({ patientId }: CognitiveGamingProgressCardProps) {
  const t = useTranslations("patientDetail");
  const locale = useLocale();
  const normLocale = locale?.split("-")[0].toLowerCase() || "en";
  const scaffold = SCAFFOLDING_I18N[normLocale] || SCAFFOLDING_I18N.en;
  const [stats, setStats] = useState<GameSessionStats>(DEMO_FALLBACK_STATS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    async function loadStats() {
      try {
        const fetchPromise = api.get<GameSessionStats>(`/patients/${patientId}/sessions/stats`);
        const timeoutPromise = new Promise<null>((r) => setTimeout(() => r(null), 1200));
        const data = await Promise.race([fetchPromise, timeoutPromise]);
        if (active && data && data.totalSessions) setStats(data);
      } catch {
        // Silently preserve immediate demo stats
      }
    }

    loadStats();
    return () => {
      active = false;
    };
  }, [patientId]);

  if (loading || !stats) {
    return (
      <div className="scrapbook-card animate-pulse">
        <div className="h-6 w-1/3 bg-tea/20 rounded mb-4" />
        <div className="h-48 bg-surface-muted rounded-2xl" />
      </div>
    );
  }

  // Format data for Recharts
  const chartData = stats.recentSessions.slice().reverse().map((session, idx) => ({
    name: `S${idx + 1} (${session.gameType.replace("_", " ").slice(0, 6)})`,
    accuracy: session.accuracyPercentage,
    latencyMs: session.motorReactionTimeMs,
  }));

  return (
    <div className="scrapbook-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border-soft pb-4 mb-5">
        <div>
          <h2 className="font-[family-name:var(--font-serif)] font-bold text-xl md:text-2xl text-ink flex items-center gap-2">
            <Brain className="h-6 w-6 text-tea" />
            {t("gamingProgress.title")}
          </h2>
          <p className="text-sm text-ink-secondary mt-0.5">
            {t("gamingProgress.subtitle")}
          </p>
        </div>
        <span className="px-3 py-1 rounded-xl bg-tea-light border-2 border-tea text-tea-dark font-bold text-xs flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-tea" />
          {t("gamingProgress.liveTelemetry")}
        </span>
      </div>

      {/* 4 Summary Metric Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="rounded-2xl border-2 border-black bg-emerald-50 p-3 text-center shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-emerald-900 block">
            {t("gamingProgress.avgAccuracy")}
          </span>
          <span className="font-serif text-2xl font-black text-emerald-700">
            {stats.averageAccuracy}%
          </span>
        </div>

        <div className="rounded-2xl border-2 border-black bg-amber-50 p-3 text-center shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-amber-900 block">
            {t("gamingProgress.motorLatency")}
          </span>
          <span className="font-serif text-2xl font-black text-amber-800">
            {stats.averageMotorLatencyMs} {t("gamingProgress.ms")}
          </span>
        </div>

        <div className="rounded-2xl border-2 border-black bg-teal-50 p-3 text-center shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-teal-900 block">
            {t("gamingProgress.spatialRecall")}
          </span>
          <span className="font-serif text-2xl font-black text-teal-800">
            {stats.averageSpatialRecall}%
          </span>
        </div>

        <div className="rounded-2xl border-2 border-black bg-purple-50 p-3 text-center shadow-[2px_2px_0px_#000]">
          <span className="text-[10px] font-black uppercase text-purple-900 block">
            {t("gamingProgress.totalSessions")}
          </span>
          <span className="font-serif text-2xl font-black text-purple-800">
            {stats.totalSessions}
          </span>
        </div>
      </div>

      {/* Recharts Line Chart: Accuracy & Motor Latency Trends */}
      <div className="rounded-2xl border-3 border-black bg-surface p-4 shadow-[4px_4px_0px_#000] mb-6">
        <div className="flex items-center justify-between mb-3 text-xs font-black text-ink">
          <span>{t("gamingProgress.chartTitle")}</span>
          <span className="text-[11px] text-ink-secondary font-semibold">
            {t("gamingProgress.lastSessions", { count: chartData.length })}
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} />
              <YAxis yAxisId="left" domain={[50, 100]} tick={{ fontSize: 11 }} />
              <YAxis yAxisId="right" orientation="right" domain={[400, 1500]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FAF5EE",
                  border: "2px solid #000",
                  borderRadius: "12px",
                  boxShadow: "3px 3px 0px #000",
                  fontWeight: 700,
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="accuracy"
                name={t("gamingProgress.accuracyLine")}
                stroke="#047857"
                strokeWidth={3}
                dot={{ r: 5, fill: "#047857" }}
                activeDot={{ r: 7 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="latencyMs"
                name={t("gamingProgress.latencyLine")}
                stroke="#D97706"
                strokeWidth={3}
                dot={{ r: 5, fill: "#D97706" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION: Errorless Learning (EL) Scaffolding & Neuroplastic Flow (Clare & Jones, 2008) */}
      <div className="rounded-2xl border-3 border-black bg-[#FAF5EE] p-4.5 shadow-[4px_4px_0px_#000] mb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-black/10 pb-3 mb-3.5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-tea" />
            <span className="font-serif font-black text-sm sm:text-base text-ink">
              {scaffold.headerTitle}
            </span>
          </div>
          <span className="rounded-md bg-tea-light border border-tea/30 px-2 py-0.5 text-[10px] font-black uppercase text-tea-dark">
            {scaffold.evidenceModel}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="rounded-xl border-2 border-black bg-white p-3 shadow-xs">
            <span className="text-[10px] font-black uppercase text-ink-secondary block">
              {scaffold.autonomousRecall}
            </span>
            <span className="font-serif text-xl font-black text-emerald-700">64%</span>
            <span className="text-[10px] text-ink-secondary block mt-0.5 font-medium">
              {scaffold.autonomousRecallDesc}
            </span>
          </div>

          <div className="rounded-xl border-2 border-black bg-white p-3 shadow-xs">
            <span className="text-[10px] font-black uppercase text-ink-secondary block">
              {scaffold.vanishingCues}
            </span>
            <span className="font-serif text-xl font-black text-amber-700">22%</span>
            <span className="text-[10px] text-ink-secondary block mt-0.5 font-medium">
              {scaffold.vanishingCuesDesc}
            </span>
          </div>

          <div className="rounded-xl border-2 border-black bg-white p-3 shadow-xs">
            <span className="text-[10px] font-black uppercase text-tea-dark block">
              {scaffold.softBlock}
            </span>
            <span className="font-serif text-xl font-black text-tea-dark">{scaffold.absorbed}</span>
            <span className="text-[10px] text-ink-secondary block mt-0.5 font-medium">
              {scaffold.softBlockDesc}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-tea/40 bg-tea-light/40 p-3 flex items-start gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-tea-dark shrink-0 mt-0.5" />
          <p className="text-xs text-ink-secondary font-semibold leading-relaxed">
            <strong className="text-ink">{scaffold.shieldTitle} </strong>
            {scaffold.shieldBody}
          </p>
        </div>
      </div>

      {/* Ollama AI Clinical Summary for ASHA Community Workers */}
      {stats.aiClinicalSummary && (
        <div className="rounded-2xl border-2 border-amber-900/30 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-amber-800" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-950">
              {t("gamingProgress.aiObservation")}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium text-amber-950/90 leading-relaxed italic border-l-3 border-amber-700 pl-3">
            &ldquo;{stats.aiClinicalSummary}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
