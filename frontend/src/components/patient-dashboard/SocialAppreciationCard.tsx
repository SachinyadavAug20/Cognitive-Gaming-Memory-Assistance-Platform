"use client";

import { useState } from "react";
import {
  Heart,
  Share2,
  Sparkles,
  MessageCircle,
  Award,
  Volume2,
  Check,
  Send,
  Users,
} from "lucide-react";
import { playEncourage, playTapFeedback, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { useLocale } from "next-intl";

interface SocialMessage {
  id: string;
  sender: string;
  relation: string;
  avatar: string;
  message: Record<string, string>;
  timeAgo: string;
  heartCount: number;
}

const FAMILY_MESSAGES: SocialMessage[] = [
  {
    id: "msg_1",
    sender: "Rahul",
    relation: "Grandson",
    avatar: "👦",
    message: {
      en: "Dadu, I heard you played Card Mastery this morning! You are the best card player! Love you so much! ❤️",
      hi: "दादू, मुझे पता चला कि आपने आज सुबह ताश का खेल खेला! आप सबसे अच्छे खिलाड़ी हैं! बहुत प्यार दादू! ❤️",
      as: "ককা, মই শুনিলোঁ আপুনি আজি পুৱা তাচৰ খেল খেলিলে! আপুনি সঁচাকৈয়ে এজন মহান খেলুৱৈ! বৰ মৰম ককা! ❤️",
      bn: "দাদু, শুনলাম আপনি আজ সকালে তাসের খেলা খেলেছেন! আপনিই সেরা খেলোয়াড়! অনেক ভালোবাসা! ❤️",
    },
    timeAgo: "2 hours ago",
    heartCount: 14,
  },
  {
    id: "msg_2",
    sender: "Meera",
    relation: "Daughter",
    avatar: "👩",
    message: {
      en: "Ma, your memory scores are getting better every day. We are so proud of your consistency! 🌸",
      hi: "माँ, आपकी याददाश्त हर दिन बेहतर हो रही है। हमें आपकी लगन पर बहुत गर्व है! 🌸",
      as: "আই, আপোনাৰ মনটো দিনক দিনে অধিক সতেজ হৈছে। আপোনাৰ এনে নিয়মীয়াতাত আমি অতি আনন্দিত! 🌸",
      bn: "মা, আপনার স্মৃতিশক্তি দিন দিন উজ্জ্বল হচ্ছে। আপনার এই নিয়মিত প্রচেষ্টায় আমরা গর্বিত! 🌸",
    },
    timeAgo: "Yesterday",
    heartCount: 19,
  },
];

import { useCareSyncStore } from "@/lib/careSyncStore";

export function SocialAppreciationCard({ patientName = "Amma" }: { patientName?: string }) {
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");

  const familyNotes = useCareSyncStore((s) => s.familyNotes);
  const likeFamilyNote = useCareSyncStore((s) => s.likeFamilyNote);
  const [copiedShare, setCopiedShare] = useState(false);
  const [lovedIds, setLovedIds] = useState<string[]>([]);

  const handleHeartMessage = (id: string) => {
    playTapFeedback();
    playEncourage();
    if (!lovedIds.includes(id)) {
      setLovedIds((p) => [...p, id]);
    }
    likeFamilyNote(id);
  };

  const handleListenMessage = (text: string) => {
    unlockAudio();
    playTapFeedback();
    speak(text, normLoc, 0.85);
  };

  const shareText =
    normLoc === "hi"
      ? `🌸 हमारे प्रिय ${patientName} ने आज CogniCare पर स्मृति खेल और सुबह की सैर पूरी की! उनका हौसला बढ़ाएं! 💐`
      : normLoc === "as"
      ? `🌸 আমাৰ মৰমৰ ${patientName}ই আজি CogniCare ত স্মৃতি খেল আৰু পুৱাৰ খোজ সম্পন্ন কৰিলে! সকলোৱে আশীৰ্বাদ কৰক! 💐`
      : `🌸 Our beloved ${patientName} completed their daily memory therapy & morning routine on CogniCare! Send your warm love! 💐`;

  const handleShareAchievement = async () => {
    playTapFeedback();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: "CogniCare Milestone",
          text: shareText,
          url: typeof window !== "undefined" ? window.location.origin : "",
        });
        return;
      } catch {
        // Fallback
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="border-3 border-black bg-gradient-to-br from-pink-50 via-rose-50 to-amber-50 rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_#000] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-400 border-2 border-black flex items-center justify-center text-white shrink-0 shadow-[2px_2px_0px_#000]">
            <Heart className="h-6 w-6 fill-white stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded border border-black">
                {normLoc === "hi" ? "पारिवारिक स्नेह" : normLoc === "as" ? "পৰিয়ালৰ মৰম" : "Family Appreciation"}
              </span>
              <span className="text-xs font-bold text-rose-800 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Positive Reinforcement</span>
              </span>
            </div>
            <h3 className="font-serif font-black text-xl sm:text-2xl text-ink mt-0.5">
              {normLoc === "hi"
                ? "परिवार का प्यार एवं उत्साहवर्धन"
                : normLoc === "as"
                ? "পৰিয়ালৰ স্নেহ আৰু প্ৰেৰণা"
                : "Family Love Notes & Social Cheer"}
            </h3>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex items-center gap-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playTapFeedback()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-emerald-700 cursor-pointer active:scale-95 shrink-0"
            title="Share to WhatsApp"
          >
            <span className="text-sm">💬</span>
            <span>WhatsApp</span>
          </a>
          <button
            onClick={handleShareAchievement}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white text-ink font-bold text-xs sm:text-sm border-2 border-black shadow-[3px_3px_0px_#000] hover:bg-amber-100 cursor-pointer active:scale-95 shrink-0"
          >
            {copiedShare ? (
              <>
                <Check className="h-4 w-4 text-tea" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="h-4 w-4 text-rose-600" />
                <span>
                  {normLoc === "hi" ? "साझा करें" : normLoc === "as" ? "শ্বেয়াৰ কৰক" : "Share"}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      <p className="text-xs sm:text-sm text-ink-secondary">
        {normLoc === "hi"
          ? "आपके प्रियजन आपके साथ हैं। हर छोटा प्रयास एक बड़ी जीत है।"
          : normLoc === "as"
          ? "আপোনাৰ সন্তান আৰু নাতি-নাতিনীসকলে আপোনাক প্ৰতিদিনে স্মৰণ কৰে।"
          : "Encouraging voice notes and heartfelt messages from children & grandchildren."}
      </p>

      {/* Messages Stream */}
      <div className="space-y-3">
        {familyNotes.map((m) => {
          const text = m.message;
          const isLoved = lovedIds.includes(m.id);
          return (
            <div
              key={m.id}
              className="p-4 rounded-2xl border-2 border-black/30 bg-white/95 shadow-sm flex flex-col justify-between gap-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 border-2 border-black flex items-center justify-center text-xl shrink-0">
                    {m.avatar || "💌"}
                  </div>
                  <div>
                    <h4 className="font-serif font-black text-sm text-ink flex items-center gap-1.5">
                      <span>{m.sender}</span>
                      <span className="text-[11px] font-mono font-normal text-ink-secondary bg-neutral-100 px-1.5 py-0.2 rounded border border-black/20">
                        {m.relation}
                      </span>
                    </h4>
                    <span className="text-[10px] text-neutral-500 font-mono">{m.timestamp}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleListenMessage(text)}
                  className="p-2 rounded-xl border border-black/30 bg-amber-50 hover:bg-amber-100 cursor-pointer shadow-xs shrink-0"
                  title="Listen to voice note"
                >
                  <Volume2 className="h-4 w-4 text-tea" />
                </button>
              </div>

              <p className="text-sm font-medium text-ink leading-relaxed pl-1 italic">
                "{text}"
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-black/10">
                <span className="text-[11px] text-ink-secondary">
                  Tap heart to send love back
                </span>
                <button
                  onClick={() => handleHeartMessage(m.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                    isLoved
                      ? "border-black bg-rose-200 text-rose-900 shadow-[2px_2px_0px_#000]"
                      : "border-black/20 bg-surface hover:bg-rose-50 text-ink"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isLoved ? "fill-rose-600 text-rose-600" : "text-neutral-500"}`} />
                  <span>{m.hearts}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
