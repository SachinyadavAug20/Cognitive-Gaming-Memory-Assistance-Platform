"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  ShieldCheck,
  CheckCircle2,
  Filter,
  Search,
  Stethoscope,
  HeartHandshake,
  Award,
  Sparkles,
  Edit3,
  Check,
  Brain,
  AlertCircle,
} from "lucide-react";
import { GAMES } from "@/games/registry";
import {
  useGameVerificationStore,
  type GameVerification,
} from "@/store/useGameVerificationStore";
import { CaregiverVerifyModal } from "@/components/games/CaregiverVerifyModal";
import { ClinicalEndorsementModal } from "@/components/games/ClinicalEndorsementModal";

interface VerifyCardTexts {
  subHeader: string;
  headerTitle: string;
  headerDesc: (patientId: number) => string;
  stampedBadge: (count: number) => string;
  clinicianBadge: (count: number) => string;
  caregiverBadge: (count: number) => string;
  searchPlaceholder: string;
  filterAll: (count: number) => string;
  filterVerified: (count: number) => string;
  filterUnstamped: (count: number) => string;
  noGames: string;
  expertVerifiedBadge: string;
  certificateBtn: string;
  editBtn: string;
  certifyBtn: string;
  removeStampTitle: string;
  quickStampTitle: string;
}

const VERIFY_CARD_I18N: Record<string, VerifyCardTexts> = {
  en: {
    subHeader: "Field Expert & Caregiver Certifications",
    headerTitle: "Verified CDTx Prescriptions",
    headerDesc: (id) => `Caregiver & clinician endorsed serious games calibrated for Patient #${id}`,
    stampedBadge: (c) => `${c} Stamped`,
    clinicianBadge: (c) => `${c} Clinician`,
    caregiverBadge: (c) => `${c} Caregiver`,
    searchPlaceholder: "Search games or cognitive domains...",
    filterAll: (c) => `All (${c})`,
    filterVerified: (c) => `Verified (${c})`,
    filterUnstamped: (c) => `Unstamped (${c})`,
    noGames: "No games found matching your filter criteria.",
    expertVerifiedBadge: "Field Expert Verified",
    certificateBtn: "Certificate",
    editBtn: "Edit",
    certifyBtn: "Certify",
    removeStampTitle: "Remove verification stamp",
    quickStampTitle: "Quick-stamp as verified",
  },
  as: {
    subHeader: "ক্ষেত্ৰ বিশেষজ্ঞ আৰু যত্নকৰ্তাৰ প্ৰমাণীকৰণ",
    headerTitle: "যাচাইকৃত CDTx প্ৰেছক্ৰিপশ্বন",
    headerDesc: (id) => `ৰোগী #${id} ৰ বাবে যত্নকৰ্তা আৰু চিকিৎসকৰ দ্বাৰা অনুমোদিত খেলসমূহ`,
    stampedBadge: (c) => `${c} মোহৰাংকিত`,
    clinicianBadge: (c) => `${c} চিকিৎসক`,
    caregiverBadge: (c) => `${c} যত্নকৰ্তা`,
    searchPlaceholder: "খেল বা সংজ্ঞানাত্মক ক্ষেত্ৰ সন্ধান কৰক...",
    filterAll: (c) => `সকলো (${c})`,
    filterVerified: (c) => `যাচাইকৃত (${c})`,
    filterUnstamped: (c) => `মোহৰবিহীন (${c})`,
    noGames: "আপোনাৰ সন্ধানৰ সৈতে কোনো খেল পোৱা নগ'ল।",
    expertVerifiedBadge: "বিশেষজ্ঞৰ দ্বাৰা প্ৰমাণিত",
    certificateBtn: "প্ৰমাণপত্ৰ",
    editBtn: "সম্পাদনা",
    certifyBtn: "প্ৰমাণিত কৰক",
    removeStampTitle: "প্ৰমাণীকৰণ মোহৰ আঁতৰাওক",
    quickStampTitle: "দ্ৰুত প্ৰমাণীকৰণ মোহৰ মাৰক",
  },
  hi: {
    subHeader: "क्षेत्रीय विशेषज्ञ एवं देखभालकर्ता प्रमाणीकरण",
    headerTitle: "सत्यापित CDTx प्रिस्क्रिप्शन",
    headerDesc: (id) => `रोगी #${id} हेतु देखभालकर्ता एवं चिकित्सक द्वारा अनुमोदित सुधारात्मक खेल`,
    stampedBadge: (c) => `${c} मुहरबंद`,
    clinicianBadge: (c) => `${c} चिकित्सक`,
    caregiverBadge: (c) => `${c} देखभालकर्ता`,
    searchPlaceholder: "खेल या संज्ञानात्मक डोमेन खोजें...",
    filterAll: (c) => `सभी (${c})`,
    filterVerified: (c) => `सत्यापित (${c})`,
    filterUnstamped: (c) => `बिना मुहर (${c})`,
    noGames: "खोज मानदंडों से मेल खाता कोई खेल नहीं मिला।",
    expertVerifiedBadge: "विशेषज्ञ सत्यापित",
    certificateBtn: "प्रमाणपत्र",
    editBtn: "संशोधन",
    certifyBtn: "प्रमाणित करें",
    removeStampTitle: "सत्यापन मुहर हटाएं",
    quickStampTitle: "त्वरित मुहर लगाएं",
  },
  bn: {
    subHeader: "ক্ষেত্র বিশেষজ্ঞ ও পরিচর্যাকারীর স্বীকৃতি",
    headerTitle: "যাচাইকৃত CDTx প্রেসক্রিপশন",
    headerDesc: (id) => `রোগী #${id} এর জন্য পরিচর্যাকারী ও চিকিৎসকের অনুমোদিত গেমস`,
    stampedBadge: (c) => `${c} সিলমোহরকৃত`,
    clinicianBadge: (c) => `${c} চিকিৎসক`,
    caregiverBadge: (c) => `${c} পরিচর্যাকারী`,
    searchPlaceholder: "গেম বা জ্ঞানীয় ডোমেন অনুসন্ধান করুন...",
    filterAll: (c) => `সব (${c})`,
    filterVerified: (c) => `যাচাইকৃত (${c})`,
    filterUnstamped: (c) => `সিলহীন (${c})`,
    noGames: "আপনার অনুসন্ধানের সাথে কোনো গেমের মিল নেই।",
    expertVerifiedBadge: "বিশেষজ্ঞ দ্বারা যাচাইকৃত",
    certificateBtn: "শংসাপত্র",
    editBtn: "সম্পাদনা",
    certifyBtn: "স্বীকৃতি দিন",
    removeStampTitle: "যাচাইকরণ সিল সরান",
    quickStampTitle: "দ্রুত সিলমোহর দিন",
  },
  mr: {
    subHeader: "तज्ज्ञ व काळजीवाहू प्रमाणीकरण",
    headerTitle: "सत्यापित CDTx प्रिस्क्रिप्शन",
    headerDesc: (id) => `रुग्ण #${id} साठी काळजीवाहू आणि डॉक्टरांनी मंजूर केलेले खेळ`,
    stampedBadge: (c) => `${c} शिक्कामोर्तब`,
    clinicianBadge: (c) => `${c} डॉक्टर`,
    caregiverBadge: (c) => `${c} काळजीवाहू`,
    searchPlaceholder: "खेळ किंवा संज्ञानात्मक क्षेत्र शोधा...",
    filterAll: (c) => `सर्व (${c})`,
    filterVerified: (c) => `सत्यापित (${c})`,
    filterUnstamped: (c) => `अशिक्काकृत (${c})`,
    noGames: "मापदंडांनुसार कोणतेही खेळ आढळले नाहीत.",
    expertVerifiedBadge: "तज्ज्ञ प्रमाणित",
    certificateBtn: "प्रमाणपत्र",
    editBtn: "बदला",
    certifyBtn: "प्रमाणित करा",
    removeStampTitle: "प्रमाणीकरण शिक्का काढा",
    quickStampTitle: "त्वरित शिक्का मारा",
  },
  ne: {
    subHeader: "विशेषज्ञ तथा हेरचाहकर्ता प्रमाणीकरण",
    headerTitle: "प्रमाणित CDTx प्रेस्क्रिप्सन",
    headerDesc: (id) => `बिरामी #${id} का लागि हेरचाहकर्ता र चिकित्सकद्वारा अनुमोदित खेलहरू`,
    stampedBadge: (c) => `${c} छाप लगाइएको`,
    clinicianBadge: (c) => `${c} चिकित्सक`,
    caregiverBadge: (c) => `${c} हेरचाहकर्ता`,
    searchPlaceholder: "खेल वा संज्ञानात्मक क्षेत्र खोज्नुहोस्...",
    filterAll: (c) => `सबै (${c})`,
    filterVerified: (c) => `प्रमाणित (${c})`,
    filterUnstamped: (c) => `छाप नलगाइएको (${c})`,
    noGames: "कुनै खेल फेला परेन।",
    expertVerifiedBadge: "विशेषज्ञ प्रमाणित",
    certificateBtn: "प्रमाणपत्र",
    editBtn: "सम्पादन",
    certifyBtn: "प्रमाणित गर्नुहोस्",
    removeStampTitle: "प्रमाणीकरण छाप हटाउनुहोस्",
    quickStampTitle: "तुरुन्त छाप लगाउनुहोस्",
  },
  mni: {
    subHeader: "এক্সপার্ত অমসুং শেন্নবগী সর্তিফিকেসন",
    headerTitle: "ভেলিতেদ CDTx প্রেস্ক্রিপ্সন",
    headerDesc: (id) => `অনাবা #${id} গীদমক দোক্তর অমসুং শেন্নবনা রেকমেম্দ তৌবা শান-খোৎনবা`,
    stampedBadge: (c) => `${c} সীল তৌরবা`,
    clinicianBadge: (c) => `${c} দোক্তর`,
    caregiverBadge: (c) => `${c} শেন্নবা`,
    searchPlaceholder: "শান-খোৎনবা থিবীয়ু...",
    filterAll: (c) => `পুম্নমক (${c})`,
    filterVerified: (c) => `ভেলিতেদ (${c})`,
    filterUnstamped: (c) => `সীল তৌদবা (${c})`,
    noGames: "শান-খোৎনবা অমত্তা ফংদে।",
    expertVerifiedBadge: "এক্সপার্ত ভেলিতেদ",
    certificateBtn: "সর্তিফিকেত",
    editBtn: "শেমদোকপা",
    certifyBtn: "সর্তিফাই তৌবীয়ু",
    removeStampTitle: "সীল লৌমথোকউ",
    quickStampTitle: "সীল থম্লকউ",
  },
  brx: {
    subHeader: "बिहाबग्रा आरो सामलायग्रानि फोरमान",
    headerTitle: "आनजाद खांनाय CDTx बिथोन",
    headerDesc: (id) => `बिरामी #${id} नि थाखाय डाक्टर आरो सामलायग्रानि गनायथि जानाय गेलेमु`,
    stampedBadge: (c) => `${c} छाप होनाय`,
    clinicianBadge: (c) => `${c} डाक्टर`,
    caregiverBadge: (c) => `${c} सामलायग्रा`,
    searchPlaceholder: "गेलेमुफोर नागिर...",
    filterAll: (c) => `गासै (${c})`,
    filterVerified: (c) => `आनजाद खांनाय (${c})`,
    filterUnstamped: (c) => `छाप गैयै (${c})`,
    noGames: "जेबो गेलेमु मोनाखै।",
    expertVerifiedBadge: "बिहाबग्रानि आनजाद खांनाय",
    certificateBtn: "फोरमान बिलाइ",
    editBtn: "सोलाय",
    certifyBtn: "फोरमान खालाम",
    removeStampTitle: "छाप बोखार",
    quickStampTitle: "गोख्रै छाप हो",
  },
  grt: {
    subHeader: "Expert aro Sanni Gualgitani Lekka",
    headerTitle: "Niamgipa CDTx Lekkarang",
    headerDesc: (id) => `Bimang #${id} na daktar aro sanni gualgipani seokgipa kal·anirang`,
    stampedBadge: (c) => `${c} Seal Ong·gimin`,
    clinicianBadge: (c) => `${c} Daktar`,
    caregiverBadge: (c) => `${c} Sanigipa`,
    searchPlaceholder: "Kal·anirangko sandibo...",
    filterAll: (c) => `Pilakkon (${c})`,
    filterVerified: (c) => `Sakki Gnang (${c})`,
    filterUnstamped: (c) => `Seal Gri (${c})`,
    noGames: "Maming kal·aniko man·ja.",
    expertVerifiedBadge: "Expert Sakki Gnang",
    certificateBtn: "Certificate",
    editBtn: "Taria",
    certifyBtn: "Sakki On·bo",
    removeStampTitle: "Seal-ko Galbo",
    quickStampTitle: "Bakat Seal On·bo",
  },
  kha: {
    subHeader: "Jingpynskhem Ki Riewstad & Nongsumar",
    headerTitle: "Ki CDTx ba la Pynskhem",
    headerDesc: (id) => `Ki jingialehkai ba la mynjur da u doktor & nongsumar ia u nongpang #${id}`,
    stampedBadge: (c) => `${c} Ba la Shon Mohor`,
    clinicianBadge: (c) => `${c} Doktor`,
    caregiverBadge: (c) => `${c} Nongsumar`,
    searchPlaceholder: "Wad ki jingialehkai...",
    filterAll: (c) => `Baroh (${c})`,
    filterVerified: (c) => `Ba la Pynskhem (${c})`,
    filterUnstamped: (c) => `Khlem Mohor (${c})`,
    noGames: "Ym shem jingialehkai satia.",
    expertVerifiedBadge: "Riewstad ba la Pynskhem",
    certificateBtn: "Salit",
    editBtn: "Pynkylla",
    certifyBtn: "Pynskhem",
    removeStampTitle: "Weng ia ka Mohor",
    quickStampTitle: "Shon Mohor Wut-wut",
  },
  lus: {
    subHeader: "Mithiam leh Enkawltu Nemnghehna",
    headerTitle: "CDTx Enkawlna Nemngheh Tawh",
    headerDesc: (id) => `Damlo #${id} tana doctor leh enkawltu thlan infiamnate`,
    stampedBadge: (c) => `${c} Chhinchhiah Tawh`,
    clinicianBadge: (c) => `${c} Doctor`,
    caregiverBadge: (c) => `${c} Enkawltu`,
    searchPlaceholder: "Infiamna zawnna...",
    filterAll: (c) => `A Vaiin (${c})`,
    filterVerified: (c) => `Nemngheh (${c})`,
    filterUnstamped: (c) => `Nemngheh Loh (${c})`,
    noGames: "Infiamna hmuh a ni lo.",
    expertVerifiedBadge: "Mithiam Nemngheh",
    certificateBtn: "Lehkha Pawimawh",
    editBtn: "Siamthatna",
    certifyBtn: "Nemngheh Rawh",
    removeStampTitle: "Nemnghehna Hlip Rawh",
    quickStampTitle: "Nemngheh nghal rawh",
  },
};

interface CaregiverGameVerificationCardProps {
  patientId: number;
}

export function CaregiverGameVerificationCard({
  patientId,
}: CaregiverGameVerificationCardProps) {
  const locale = useLocale();
  const normLocale = locale?.split("-")[0].toLowerCase() || "en";
  const vc = VERIFY_CARD_I18N[normLocale] || VERIFY_CARD_I18N.en;

  const { verifications, toggleVerification, isGameVerified, getVerification } =
    useGameVerificationStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "verified" | "unverified">(
    "all"
  );
  const [editingGameId, setEditingGameId] = useState<string | null>(null);
  const [viewingCertificateGameId, setViewingCertificateGameId] = useState<
    string | null
  >(null);

  const verifiedGamesCount = GAMES.filter((g) => isGameVerified(g.id)).length;
  const clinicianCount = Object.values(verifications).filter(
    (v) => v.isVerified && v.role === "clinician"
  ).length;
  const caregiverCount = Object.values(verifications).filter(
    (v) => v.isVerified && v.role === "caregiver"
  ).length;

  const filteredGames = GAMES.filter((game) => {
    const isVer = isGameVerified(game.id);
    if (filterMode === "verified" && !isVer) return false;
    if (filterMode === "unverified" && isVer) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = game.titleKey.toLowerCase().includes(q) || game.id.toLowerCase().includes(q);
      const matchDomain = game.domain.toLowerCase().includes(q);
      return matchTitle || matchDomain;
    }
    return true;
  });

  const selectedGameForEdit = GAMES.find((g) => g.id === editingGameId);
  const selectedGameForView = GAMES.find((g) => g.id === viewingCertificateGameId);
  const selectedVerification = viewingCertificateGameId
    ? getVerification(viewingCertificateGameId)
    : undefined;

  return (
    <div className="rounded-3xl border-3 border-black bg-surface p-5 sm:p-6 shadow-[6px_6px_0px_#000] text-ink">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black/10 pb-4">
        <div className="flex items-start gap-3">
          <div className="relative h-12 w-12 shrink-0 select-none">
            <Image
              src="/sample-images/101-removebg-preview.png"
              alt="Verification Badge Seal"
              fill
              className="object-contain drop-shadow -rotate-6"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800 uppercase tracking-wide">
              <ShieldCheck className="h-4 w-4" />
              <span>{vc.subHeader}</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-ink leading-tight">
              {vc.headerTitle}
            </h2>
            <p className="text-xs font-medium text-ink-secondary mt-0.5">
              {vc.headerDesc(patientId)}
            </p>
          </div>
        </div>

        {/* Stats Summary Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="rounded-xl border-2 border-black bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-950 shadow-[2px_2px_0px_#000]">
            {vc.stampedBadge(verifiedGamesCount)}
          </span>
          <span className="rounded-xl border-2 border-black bg-teal-100 px-2.5 py-1 text-xs font-black text-teal-950 shadow-[2px_2px_0px_#000]">
            {vc.clinicianBadge(clinicianCount)}
          </span>
          <span className="rounded-xl border-2 border-black bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-950 shadow-[2px_2px_0px_#000]">
            {vc.caregiverBadge(caregiverCount)}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={vc.searchPlaceholder}
            className="w-full rounded-xl border-2 border-black bg-white pl-9 pr-3 py-1.5 text-xs font-bold text-ink shadow-[2px_2px_0px_#000] focus:outline-hidden focus:ring-2 focus:ring-tea"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(["all", "verified", "unverified"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilterMode(mode)}
              className={`rounded-xl border-2 border-black px-3 py-1.5 text-xs font-black capitalize transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                filterMode === mode
                  ? "bg-tea text-white"
                  : "bg-surface-muted text-ink hover:bg-black/5"
              }`}
            >
              {mode === "all"
                ? vc.filterAll(GAMES.length)
                : mode === "verified"
                ? vc.filterVerified(verifiedGamesCount)
                : vc.filterUnstamped(GAMES.length - verifiedGamesCount)}
            </button>
          ))}
        </div>
      </div>

      {/* Games List Table */}
      <div className="mt-4 divide-y divide-black/10 max-h-96 overflow-y-auto rounded-2xl border-2 border-black/20 bg-surface-muted/40 pr-1">
        {filteredGames.length === 0 ? (
          <div className="p-8 text-center text-xs font-bold text-ink-secondary">
            {vc.noGames}
          </div>
        ) : (
          filteredGames.map((game) => {
            const isVer = isGameVerified(game.id);
            const verData = getVerification(game.id);

            return (
              <div
                key={game.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 hover:bg-surface transition-colors"
              >
                {/* Left: Info & Stamp Preview */}
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-black bg-white shadow-[2px_2px_0px_#000]">
                    {isVer ? (
                      <div className="relative h-9 w-9 -rotate-6">
                        <Image
                          src="/sample-images/101-removebg-preview.png"
                          alt="Verified Stamp"
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <Brain className="h-5 w-5 text-ink-secondary" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs sm:text-sm font-black text-ink capitalize">
                        {game.id.replace(/-/g, " ")}
                      </span>
                      <span className="rounded bg-tea-light px-1.5 py-0.2 text-[10px] font-extrabold text-tea border border-tea/30">
                        {game.domain}
                      </span>
                      {isVer && (
                        <span className="rounded-full bg-emerald-100 border border-emerald-600 px-2 py-0.2 text-[9px] font-black text-emerald-900 flex items-center gap-1">
                          <Check className="h-2.5 w-2.5 stroke-[3]" /> {vc.expertVerifiedBadge}
                        </span>
                      )}
                    </div>

                    {isVer && verData && (
                      <p className="mt-1 text-[11px] font-medium text-ink-secondary line-clamp-1 italic">
                        &ldquo;{verData.clinicalRationale}&rdquo; &mdash;{" "}
                        <span className="font-bold text-ink">{verData.verifiedBy}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {isVer && (
                    <button
                      type="button"
                      onClick={() => setViewingCertificateGameId(game.id)}
                      className="btn-tactile rounded-xl border-2 border-black bg-surface px-2.5 py-1 text-xs font-black text-ink hover:bg-tea-light cursor-pointer shadow-[2px_2px_0px_#000]"
                      title="View Clinical Certificate"
                    >
                      {vc.certificateBtn}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setEditingGameId(game.id)}
                    className="btn-tactile flex items-center gap-1 rounded-xl border-2 border-black bg-surface-muted px-2.5 py-1 text-xs font-black text-ink hover:bg-amber-100 cursor-pointer shadow-[2px_2px_0px_#000]"
                    title="Customize Verification & Clinical Notes"
                  >
                    <Edit3 className="h-3 w-3" />
                    <span>{isVer ? vc.editBtn : vc.certifyBtn}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleVerification(game.id)}
                    className={`btn-tactile flex h-7 w-7 items-center justify-center rounded-xl border-2 border-black cursor-pointer shadow-[2px_2px_0px_#000] transition-colors ${
                      isVer
                        ? "bg-tea text-white hover:bg-emerald-800"
                        : "bg-surface-muted text-black/30 hover:text-ink hover:bg-surface"
                    }`}
                    title={isVer ? vc.removeStampTitle : vc.quickStampTitle}
                    aria-label={`Toggle verification for ${game.id}`}
                  >
                    <Check className={`h-4 w-4 stroke-[3] ${isVer ? "opacity-100" : "opacity-30"}`} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      {editingGameId && (
        <CaregiverVerifyModal
          isOpen={true}
          onClose={() => setEditingGameId(null)}
          gameId={editingGameId}
          gameTitle={selectedGameForEdit ? selectedGameForEdit.id.replace(/-/g, " ") : editingGameId}
          gameDomain={selectedGameForEdit?.domain}
        />
      )}

      {/* Certificate Viewer Modal */}
      {viewingCertificateGameId && selectedVerification && (
        <ClinicalEndorsementModal
          isOpen={true}
          onClose={() => setViewingCertificateGameId(null)}
          verification={selectedVerification}
          gameTitle={selectedGameForView ? selectedGameForView.id.replace(/-/g, " ") : viewingCertificateGameId}
          gameDomain={selectedGameForView?.domain}
          onOpenEdit={() => {
            const gid = viewingCertificateGameId;
            setViewingCertificateGameId(null);
            setEditingGameId(gid);
          }}
        />
      )}
    </div>
  );
}
