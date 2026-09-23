"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useLocale } from "next-intl";
import {
  Heart,
  Share2,
  Volume2,
  Sparkles,
  ArrowLeft,
  Award,
} from "lucide-react";
import { playEncourage, playTapFeedback, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { usePatientDetail } from "@/games/usePatientDetail";

interface SimpleMessage {
  id: string;
  sender: string;
  relation: string;
  avatar: string;
  text: string;
  time: string;
  hearts: number;
}

interface SimplePhoto {
  id: string;
  src: string;
  title: string;
  caption: string;
  author: string;
  hearts: number;
}

const INITIAL_MESSAGES: SimpleMessage[] = [
  {
    id: "m-1",
    sender: "Manash Borah",
    relation: "Son",
    avatar: "👨",
    text: "Baba, we saw your morning report! Your memory game score was 100% today! We are so proud of you! ❤️",
    time: "8:00 AM",
    hearts: 16,
  },
  {
    id: "m-2",
    sender: "Pratima Devi",
    relation: "Wife",
    avatar: "👵",
    text: "Morning prayer and namghar bells completed. Wishing you peace, good health, and joy today. 🌸",
    time: "8:15 AM",
    hearts: 14,
  },
  {
    id: "m-3",
    sender: "Arnav",
    relation: "Grandson",
    avatar: "👦",
    text: "Dadu! I am practicing the playing card tricks you taught me! When I visit, we will play together! 🃏",
    time: "8:40 AM",
    hearts: 21,
  },
];

const INITIAL_PHOTOS: SimplePhoto[] = [
  {
    id: "p-1",
    src: "/sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg",
    title: "Silpukhuri Courtyard",
    caption: "Morning sunrise and garden roses from our home veranda. Peaceful start to the day. 🌹",
    author: "Family Garden",
    hearts: 24,
  },
  {
    id: "p-2",
    src: "/sample-images/patient_1_biren_borah/relatives/04_grandchild_arnav_borah.jpg",
    title: "Arnav with Dadu",
    caption: "Grandson Arnav learning the 54 playing cards with Dadu in the study room. ❤️",
    author: "Manash Borah",
    hearts: 45,
  },
];

const QUICK_BLESSINGS = [
  { text: "☀️ Good Morning! / শুভ প্ৰভাত", emoji: "☀️" },
  { text: "🙏 Namaste / নমস্কাৰ", emoji: "🙏" },
  { text: "❤️ Love & Blessings to all!", emoji: "❤️" },
  { text: "🍵 Finished morning tea & medicine!", emoji: "🍵" },
];

export default function PatientCommunityPage() {
  const locale = useLocale();
  const normLoc = locale?.split("-")[0]?.toLowerCase() || "en";
  const { detail } = usePatientDetail();
  const patientName = detail?.name || "Biren Borah";

  const [messages, setMessages] = useState<SimpleMessage[]>(INITIAL_MESSAGES);
  const [photos, setPhotos] = useState<SimplePhoto[]>(INITIAL_PHOTOS);

  const handleListen = (text: string) => {
    unlockAudio();
    playTapFeedback();
    speak(text, normLoc, 0.85);
  };

  const handleCheerMessage = (id: string) => {
    playTapFeedback();
    playEncourage();
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, hearts: m.hearts + 1 } : m))
    );
  };

  const handleCheerPhoto = (id: string) => {
    playTapFeedback();
    playEncourage();
    setPhotos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, hearts: p.hearts + 1 } : p))
    );
  };

  const handleSendQuickReply = (text: string) => {
    playTapFeedback();
    playEncourage();
    const newMsg: SimpleMessage = {
      id: `m-${Date.now()}`,
      sender: `${patientName} (You)`,
      relation: "Elder",
      avatar: "👴",
      text,
      time: "Just now",
      hearts: 1,
    };
    setMessages((prev) => [newMsg, ...prev]);
  };

  const whatsappShareText = encodeURIComponent(
    `🌸 Warm greetings from ${patientName}! Baba completed today's 54 Playing Cards memory challenge with 100% accuracy and took his morning tea! Sending love and blessings to all family and friends! ❤️🍵`
  );

  return (
    <div className="min-h-screen bg-canvas pb-20 text-ink">
      {/* ── SIMPLE MINIMAL HEADER ── */}
      <header className="bg-surface border-b-2 border-border/20 px-4 py-5 shadow-xs">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 border-2 border-border flex items-center justify-center text-2xl shadow-[2px_2px_0px_#000] shrink-0 text-black">
              🤝
            </div>
            <div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl text-ink leading-tight">
                {normLoc === "hi"
                  ? "परिवार एवं साथी"
                  : normLoc === "as"
                  ? "পৰিয়াল আৰু সতীৰ্থ"
                  : "Family & Community"}
              </h1>
              <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
                {normLoc === "hi"
                  ? "परिवार के प्यार भरे संदेश और सुंदर यादें।"
                  : normLoc === "as"
                  ? "পৰিয়ালৰ স্নেহভৰা বাৰ্তা আৰু স্মৃতি।"
                  : "Heartfelt love notes and daily memories from family."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                const intro =
                  normLoc === "hi"
                    ? "परिवार और साथी पृष्ठ में आपका स्वागत है। यहां आपके परिवार के संदेश और यादें हैं।"
                    : normLoc === "as"
                    ? "পৰিয়াল আৰু সতীৰ্থ পৃষ্ঠালৈ স্বাগতম। ইয়াত আপোনাৰ পৰিয়ালৰ বাৰ্তা আৰু স্মৃতি আছে।"
                    : "Welcome to your family circle. Here are warm messages and memories from your family.";
                handleListen(intro);
              }}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface border-2 border-border text-xs sm:text-sm font-bold text-ink shadow-[2px_2px_0px_#000] hover:bg-surface-muted cursor-pointer active:scale-95"
            >
              <Volume2 className="h-4 w-4 text-tea" />
              <span>{normLoc === "hi" ? "सुनें" : normLoc === "as" ? "শুনক" : "Listen"}</span>
            </button>

            <a
              href={`https://api.whatsapp.com/send?text=${whatsappShareText}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playTapFeedback()}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white border-2 border-border text-xs sm:text-sm font-black shadow-[2px_2px_0px_#000] hover:bg-emerald-700 cursor-pointer active:scale-95"
            >
              <Share2 className="h-4 w-4" />
              <span>WhatsApp Share</span>
            </a>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT (SINGLE-STREAM, ZERO CLUTTER) ── */}
      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* ── 1. FAMILY LOVE NOTES ── */}
        <section aria-labelledby="family-notes-title" className="space-y-3">
          <div className="flex items-center justify-between border-b-2 border-border/20 pb-2">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-600 fill-rose-600" />
              <h2 id="family-notes-title" className="font-serif font-black text-xl text-ink">
                {normLoc === "hi"
                  ? "परिवार के संदेश"
                  : normLoc === "as"
                  ? "পৰিয়ালৰ বাৰ্তা"
                  : "Family Love Messages"}
              </h2>
            </div>
            <a
              href={`https://api.whatsapp.com/send?text=${whatsappShareText}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-tea hover:underline cursor-pointer"
            >
              Open in WhatsApp →
            </a>
          </div>

          {/* Quick Reply Blessing Chips for Elder */}
          <div className="p-3 bg-surface border-2 border-border/20 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-ink-secondary flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Tap to send a warm reply back:</span>
            </span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              {QUICK_BLESSINGS.map((qb, i) => (
                <button
                  key={i}
                  onClick={() => handleSendQuickReply(qb.text)}
                  className="px-3 py-1.5 rounded-xl bg-surface border-2 border-border text-xs font-bold text-ink whitespace-nowrap hover:bg-surface-muted cursor-pointer shadow-xs active:scale-95 shrink-0"
                >
                  <span className="mr-1">{qb.emoji}</span>
                  <span>{qb.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl border-2 border-border/30 bg-surface shadow-xs flex flex-col justify-between gap-2.5 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{m.avatar}</span>
                    <div>
                      <h3 className="font-serif font-black text-sm text-ink leading-tight">
                        {m.sender}
                      </h3>
                      <span className="text-[10px] text-ink-secondary font-mono">
                        {m.relation} • {m.time}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleListen(m.text)}
                      className="p-1.5 rounded-lg border border-border/30 bg-surface hover:bg-surface-muted cursor-pointer shadow-xs"
                      title="Listen"
                    >
                      <Volume2 className="h-4 w-4 text-tea" />
                    </button>
                    <button
                      onClick={() => handleCheerMessage(m.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-border bg-rose-100 dark:bg-rose-950 text-rose-950 dark:text-rose-200 text-xs font-bold cursor-pointer active:scale-95 shadow-xs"
                      title="Cheer"
                    >
                      <Heart className="h-3.5 w-3.5 fill-rose-600 text-rose-600" />
                      <span>{m.hearts}</span>
                    </button>
                  </div>
                </div>

                <p className="text-sm font-medium text-ink leading-relaxed">
                  "{m.text}"
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 2. DAILY PHOTO MEMORIES ── */}
        <section aria-labelledby="photo-memories-title" className="space-y-3 pt-2">
          <div className="flex items-center gap-2 border-b-2 border-border/20 pb-2">
            <span className="text-xl">📸</span>
            <h2 id="photo-memories-title" className="font-serif font-black text-xl text-ink">
              {normLoc === "hi"
                ? "दैनिक यादें"
                : normLoc === "as"
                ? "দৈনিক স্মৃতি"
                : "Daily Memories & Photos"}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.map((p) => (
              <div
                key={p.id}
                className="border-2 border-border/30 bg-surface rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="relative h-48 w-full bg-neutral-200">
                  <Image
                    src={p.src}
                    alt={p.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </div>
                <div className="p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-ink">
                    <span className="font-serif font-black">{p.title}</span>
                    <span className="text-[10px] text-ink-secondary">{p.author}</span>
                  </div>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {p.caption}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-border/10">
                    <button
                      onClick={() => handleListen(p.caption)}
                      className="p-1.5 rounded-lg border border-border/30 bg-surface hover:bg-surface-muted cursor-pointer shadow-xs"
                      title="Listen"
                    >
                      <Volume2 className="h-4 w-4 text-tea" />
                    </button>
                    <button
                      onClick={() => handleCheerPhoto(p.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-border bg-rose-100 dark:bg-rose-950 text-rose-950 dark:text-rose-200 text-xs font-bold cursor-pointer active:scale-95 shadow-xs"
                    >
                      <Heart className="h-3.5 w-3.5 fill-rose-600 text-rose-600" />
                      <span>{p.hearts} Cheers</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 3. TODAY'S MILESTONE CARD ── */}
        <section className="p-4 rounded-2xl border-2 border-border/30 bg-surface shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 border-2 border-border flex items-center justify-center text-xl shrink-0 text-black">
              🏆
            </div>
            <div>
              <h3 className="font-serif font-black text-sm text-ink">
                {patientName}'s Daily Milestone
              </h3>
              <p className="text-xs text-ink-secondary">
                54 Playing Cards Level 8 Cleared • 5-Day Routine Streak
              </p>
            </div>
          </div>

          <a
            href={`https://api.whatsapp.com/send?text=${whatsappShareText}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playTapFeedback()}
            className="px-3.5 py-2 rounded-xl bg-tea text-white font-bold text-xs border-2 border-border shadow-xs hover:bg-emerald-800 cursor-pointer active:scale-95 shrink-0"
          >
            Share Milestone 💬
          </a>
        </section>

        {/* ── BOTTOM RETURN TO ROUTINE LINK ── */}
        <div className="pt-4 text-center">
          <Link
            href="/patient"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ink-secondary hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to My Routine</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
