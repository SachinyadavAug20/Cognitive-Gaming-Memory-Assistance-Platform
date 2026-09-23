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
  Trophy,
  CheckCircle2,
  Send,
  Smile,
  MessageCircle,
} from "lucide-react";
import { playEncourage, playTapFeedback, unlockAudio } from "@/lib/sound";
import { speak } from "@/lib/speech";
import { usePatientDetail } from "@/games/usePatientDetail";
import { useCareSyncStore } from "@/lib/careSyncStore";

interface SimpleMessage {
  id: string;
  sender: string;
  relation: string;
  avatar: string;
  text: string;
  time: string;
  hearts: number;
  isMe?: boolean;
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

const SENDER_COLORS: Record<string, string> = {
  "Manash Borah": "text-[#008069] dark:text-[#25D366]",
  "Pratima Devi": "text-[#9C27B0] dark:text-[#CE93D8]",
  "Arnav": "text-[#D4441C] dark:text-[#FF8A65]",
};

export default function PatientCommunityPage() {
  const locale = useLocale();
  const normLoc = locale?.split("-")[0]?.toLowerCase() || "en";
  const { detail } = usePatientDetail();
  const patientName = detail?.name || "Biren Borah";

  const [messages, setMessages] = useState<SimpleMessage[]>(INITIAL_MESSAGES);
  const [photos, setPhotos] = useState<SimplePhoto[]>(INITIAL_PHOTOS);
  const [inputText, setInputText] = useState("");

  const communityAchievements = useCareSyncStore((s) => s.communityAchievements);
  const cheerAchievement = useCareSyncStore((s) => s.cheerAchievement);
  const shareAchievement = useCareSyncStore((s) => s.shareAchievement);
  const [justShared, setJustShared] = useState(false);

  const handleShareTodayMilestone = () => {
    playTapFeedback();
    playEncourage();
    shareAchievement({
      patientName: `${patientName} (Baba)`,
      gameTitle: "Heritage Playing Cards (Taash)",
      gameId: "card-mastery",
      levelText: "Level 8 Mastered",
      scoreText: "100% Accuracy • 5-Day Streak",
      badgeEmoji: "🏆",
    });
    setJustShared(true);
    setTimeout(() => setJustShared(false), 3500);
  };

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
    const timeStr = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const newMsg: SimpleMessage = {
      id: `m-${Date.now()}`,
      sender: "You",
      relation: "Baba",
      avatar: "👴",
      text,
      time: timeStr,
      hearts: 1,
      isMe: true,
    };
    setMessages((prev) => [...prev, newMsg]);
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
        {/* ── 1. FAMILY WHATSAPP GROUP CHAT (MINIMAL & FAMILIAR) ── */}
        <section
          aria-labelledby="family-whatsapp-title"
          className="rounded-3xl border-3 border-black overflow-hidden shadow-[4px_4px_0px_#000] bg-surface"
        >
          {/* WhatsApp Group Top Header Bar */}
          <div className="bg-[#075E54] dark:bg-[#1F2C34] text-white px-4 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-xl shrink-0">
                👨‍👩‍👧‍👦
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 id="family-whatsapp-title" className="font-serif font-black text-base sm:text-lg text-white leading-tight">
                    {normLoc === "hi"
                      ? `${patientName} का परिवार (WhatsApp)`
                      : normLoc === "as"
                      ? `${patientName}ৰ পৰিয়াল গোট (WhatsApp)`
                      : `${patientName}'s Family Circle`}
                  </h2>
                  <span className="text-[10px] bg-emerald-400 text-black font-black px-1.5 py-0.5 rounded font-mono">
                    GROUP
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 font-medium">
                  Manash, Pratima, Arnav, Baba • active today
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const chatNarration = messages
                    .map((m) => `${m.sender} says: ${m.text}`)
                    .join(". ");
                  handleListen(chatNarration);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                title="Listen to full chat"
              >
                <Volume2 className="h-4 w-4" />
                <span className="hidden sm:inline">Listen</span>
              </button>
              <a
                href={`https://api.whatsapp.com/send?text=${whatsappShareText}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => playTapFeedback()}
                className="px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                title="Open in WhatsApp"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>Open in WhatsApp</span>
              </a>
            </div>
          </div>

          {/* WhatsApp Chat Area (Authentic Wallpaper & Bubbles) */}
          <div className="bg-[#EFEAE2] dark:bg-[#0B141A] p-4 sm:p-5 space-y-3.5 min-h-[300px] max-h-[480px] overflow-y-auto no-scrollbar relative">
            {/* WhatsApp Day Separator Pill */}
            <div className="flex justify-center my-1">
              <span className="bg-white/90 dark:bg-[#182229] text-neutral-600 dark:text-neutral-300 text-[11px] font-bold px-3 py-1 rounded-lg shadow-2xs uppercase tracking-wider">
                {normLoc === "hi" ? "आज" : normLoc === "as" ? "আজি" : "TODAY"}
              </span>
            </div>

            {/* Chat Bubbles Stream */}
            {messages.map((m) => {
              const isMe = m.isMe || m.sender.includes("You");
              const senderColor = SENDER_COLORS[m.sender] || "text-[#008069] dark:text-[#25D366]";

              return (
                <div
                  key={m.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fadeIn`}
                >
                  <div
                    className={`relative max-w-[88%] sm:max-w-[78%] rounded-2xl px-3.5 py-2.5 shadow-xs ${
                      isMe
                        ? "bg-[#D9FDD3] dark:bg-[#005C4B] rounded-tr-xs text-neutral-900 dark:text-white"
                        : "bg-white dark:bg-[#202C33] rounded-tl-xs text-neutral-900 dark:text-neutral-100"
                    }`}
                  >
                    {/* Incoming sender name header */}
                    {!isMe && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-sm">{m.avatar}</span>
                        <span className={`text-xs font-black ${senderColor}`}>
                          {m.sender}
                        </span>
                        <span className="text-[10px] text-neutral-400 font-medium">
                          ({m.relation})
                        </span>
                      </div>
                    )}

                    {/* Message text */}
                    <p className="text-sm sm:text-base font-medium leading-relaxed break-words">
                      {m.text}
                    </p>

                    {/* Bubble footer: Time, listen, heart reactions, double checks */}
                    <div className="flex items-center justify-end gap-2 mt-1.5 pt-0.5 text-[10px] text-neutral-500 dark:text-neutral-300 font-mono select-none">
                      <button
                        type="button"
                        onClick={() => handleListen(m.text)}
                        className="hover:text-tea p-0.5 rounded cursor-pointer"
                        title="Listen to this message"
                      >
                        <Volume2 className="h-3.5 w-3.5 text-tea" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleCheerMessage(m.id)}
                        className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-bold hover:scale-105 active:scale-95 cursor-pointer"
                        title="Give love"
                      >
                        <Heart className="h-3 w-3 fill-rose-600 text-rose-600" />
                        <span>{m.hearts}</span>
                      </button>

                      <span>{m.time}</span>

                      {/* WhatsApp Double Blue Checkmarks */}
                      <span className="text-[#53BDEB] font-bold text-[11px] leading-none">
                        ✓✓
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* WhatsApp Bottom 1-Tap Quick Action Bar & Input */}
          <div className="bg-[#F0F2F5] dark:bg-[#1F2C34] border-t border-black/15 p-3 space-y-2.5">
            {/* Quick 1-Tap Reply Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 shrink-0">
                ⚡ 1-Tap:
              </span>
              {QUICK_BLESSINGS.map((qb, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSendQuickReply(qb.text)}
                  className="px-3 py-1 rounded-xl bg-white dark:bg-[#2A3942] border border-black/20 text-xs font-bold text-neutral-800 dark:text-neutral-100 whitespace-nowrap hover:bg-neutral-100 dark:hover:bg-[#32444f] cursor-pointer shadow-2xs active:scale-95 shrink-0 transition-transform"
                >
                  <span className="mr-1">{qb.emoji}</span>
                  <span>{qb.text}</span>
                </button>
              ))}
            </div>

            {/* Input Bar Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputText.trim()) {
                  handleSendQuickReply(inputText.trim());
                  setInputText("");
                }
              }}
              className="flex items-center gap-2"
            >
              <div className="flex-1 flex items-center gap-2 bg-white dark:bg-[#2A3942] rounded-2xl px-3.5 py-2 border border-black/20 shadow-2xs">
                <Smile className="h-5 w-5 text-neutral-400 shrink-0" />
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    normLoc === "hi"
                      ? "परिवार को संदेश लिखें..."
                      : normLoc === "as"
                      ? "পৰিয়াললৈ বাৰ্তা লিখক..."
                      : "Type a warm message to family..."
                  }
                  className="w-full bg-transparent text-sm font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim()}
                className="w-10 h-10 rounded-full bg-[#00A884] hover:bg-[#008f70] disabled:opacity-40 text-white flex items-center justify-center shadow-xs cursor-pointer active:scale-90 transition-all shrink-0"
                title="Send"
              >
                <Send className="h-4.5 w-4.5 stroke-[2.5]" />
              </button>
            </form>
          </div>
        </section>

        {/* ── 2. COMMUNITY GAME MILESTONES & LEVEL CHEERS ── */}
        <section aria-labelledby="community-achievements-title" className="space-y-3 pt-2">
          <div className="flex items-center justify-between border-b-2 border-border/20 pb-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500 fill-amber-500" />
              <h2 id="community-achievements-title" className="font-serif font-black text-xl text-ink">
                {normLoc === "hi"
                  ? "खेल सफलता एवं साथी मंच"
                  : normLoc === "as"
                  ? "সতীৰ্থৰ খেল সাফল্য আৰু সংযোগ"
                  : "Community Game Milestones"}
              </h2>
            </div>
            <span className="text-xs font-bold text-tea bg-tea/10 border border-tea/30 px-2.5 py-0.5 rounded-full">
              {communityAchievements.length} Shared
            </span>
          </div>

          <div className="space-y-3">
            {communityAchievements.map((item) => {
              const itemShareText = encodeURIComponent(
                `🎉 Cheering for ${item.patientName}! Completed ${item.levelText} in ${item.gameTitle} (${item.scoreText})! 🏆 Sending love & good health! ❤️`
              );
              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border-2 border-border/30 bg-surface shadow-xs space-y-3 transition-all"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-950/60 border-2 border-border flex items-center justify-center text-xl shrink-0">
                        {item.badgeEmoji}
                      </div>
                      <div>
                        <h3 className="font-serif font-black text-sm text-ink leading-tight">
                          {item.patientName}
                        </h3>
                        <p className="text-[11px] font-mono text-ink-secondary">
                          {item.gameTitle} • {item.timestamp}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg bg-tea-light dark:bg-tea/20 text-tea text-xs font-black border border-tea/30">
                        {item.levelText}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-canvas/60 rounded-xl p-2.5 border border-border/20">
                    <span className="text-xs font-bold text-ink">
                      🎯 {item.scoreText}
                    </span>
                    <span className="text-[11px] font-bold text-ink-secondary">
                      Verified Clinical Protocol
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => {
                        const narration = `${item.patientName} completed ${item.levelText} in ${item.gameTitle}. ${item.cheers} people cheered them.`;
                        handleListen(narration);
                      }}
                      className="p-1.5 rounded-lg border border-border/30 bg-surface hover:bg-surface-muted cursor-pointer shadow-xs flex items-center gap-1 text-xs font-bold text-ink"
                      title="Listen"
                    >
                      <Volume2 className="h-4 w-4 text-tea" />
                      <span className="hidden sm:inline">Listen</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://api.whatsapp.com/send?text=${itemShareText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => playTapFeedback()}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs font-bold hover:bg-emerald-100 cursor-pointer active:scale-95"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                        <span>Share</span>
                      </a>

                      <button
                        onClick={() => {
                          playTapFeedback();
                          playEncourage();
                          cheerAchievement(item.id);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border-2 border-border text-xs font-bold cursor-pointer active:scale-95 shadow-xs transition-all ${
                          item.cheeredByMe
                            ? "bg-amber-300 dark:bg-amber-900 text-amber-950 dark:text-amber-100 ring-1 ring-amber-400"
                            : "bg-surface text-ink hover:bg-surface-muted"
                        }`}
                      >
                        <span>👏</span>
                        <span>{item.cheers} Cheers</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 3. DAILY PHOTO MEMORIES ── */}
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

        {/* ── 4. TODAY'S MILESTONE CARD ── */}
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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShareTodayMilestone}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 border-border shadow-xs cursor-pointer active:scale-95 transition-all ${
                justShared
                  ? "bg-emerald-600 text-white"
                  : "bg-amber-500 text-white hover:bg-amber-600"
              }`}
            >
              {justShared ? "✓ Shared to Wall! 🎉" : "Share to Wall 🤝"}
            </button>
            <a
              href={`https://api.whatsapp.com/send?text=${whatsappShareText}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => playTapFeedback()}
              className="px-3.5 py-2 rounded-xl bg-tea text-white font-bold text-xs border-2 border-border shadow-xs hover:bg-emerald-800 cursor-pointer active:scale-95 shrink-0"
            >
              WhatsApp 💬
            </a>
          </div>
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
