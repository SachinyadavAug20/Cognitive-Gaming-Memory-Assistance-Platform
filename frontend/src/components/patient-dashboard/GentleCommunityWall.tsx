"use client";

import { useState } from "react";
import {
  Users,
  Award,
  Sparkles,
  Share2,
  Heart,
  CheckCircle2,
  Coffee,
  Sun,
  Flame,
  Shield,
} from "lucide-react";
import { playEncourage, playTapFeedback } from "@/lib/sound";
import { useLocale } from "next-intl";

interface CommunitySenior {
  name: string;
  location: string;
  avatar: string;
  streakDays: number;
  circle: "Golden Morning" | "Silver Tea" | "Bronze Blossom";
  favoriteGame: string;
  todayStatus: string;
}

const COMMUNITY_MEMBERS: CommunitySenior[] = [
  {
    name: "Hemanta Saikia",
    location: "Tezpur",
    avatar: "👴",
    streakDays: 5,
    circle: "Golden Morning",
    favoriteGame: "Brahmaputra Boat",
    todayStatus: "Completed Morning Walk",
  },
  {
    name: "Biren Borah (You)",
    location: "Guwahati",
    avatar: "👴",
    streakDays: 4,
    circle: "Silver Tea",
    favoriteGame: "Card Mastery (Taash)",
    todayStatus: "Active Today! 🃏",
  },
  {
    name: "Pratima Devi",
    location: "Majuli",
    avatar: "👵",
    streakDays: 4,
    circle: "Silver Tea",
    favoriteGame: "Lotus Painter",
    todayStatus: "Drew Lotus Flowers",
  },
  {
    name: "Dhiren Kalita",
    location: "Jorhat",
    avatar: "👴",
    streakDays: 3,
    circle: "Silver Tea",
    favoriteGame: "Heritage Kitchen",
    todayStatus: "Brewed Morning Tea",
  },
  {
    name: "Anjana Barua",
    location: "Silchar",
    avatar: "👵",
    streakDays: 2,
    circle: "Bronze Blossom",
    favoriteGame: "Tea Garden Match",
    todayStatus: "Morning Gentle Routine",
  },
];

export function GentleCommunityWall() {
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");

  const [filterCircle, setFilterCircle] = useState<"all" | "Silver Tea">("Silver Tea");
  const [cheeredNames, setCheeredNames] = useState<string[]>([]);

  const handleCheer = (name: string) => {
    playTapFeedback();
    playEncourage();
    if (!cheeredNames.includes(name)) {
      setCheeredNames((p) => [...p, name]);
    }
  };

  const filtered =
    filterCircle === "all"
      ? COMMUNITY_MEMBERS
      : COMMUNITY_MEMBERS.filter((m) => m.circle === "Silver Tea");

  return (
    <div className="border-3 border-black bg-surface rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_#000] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center text-2xl shrink-0 shadow-[2px_2px_0px_#000]">
            🤝
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider bg-tea text-white px-2 py-0.5 rounded border border-black">
                {normLoc === "hi" ? "साथी समुदाय" : normLoc === "as" ? "মৃদু সম্প্ৰদায়" : "Gentle Community Circles"}
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-500">
                Non-Competitive Peer Care
              </span>
            </div>
            <h3 className="font-serif font-black text-xl sm:text-2xl text-ink mt-0.5">
              {normLoc === "hi"
                ? "सिल्वर टी कम्युनिटी सर्कल (Silver Tea Circle)"
                : normLoc === "as"
                ? "ৰূপালী চাহ সম্প্ৰদায় চক্ৰ"
                : "Silver Tea Community Circle"}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
              "🌟 Warm greetings! Baba is on a 4-day healthy memory streak in the CogniCare Silver Tea Circle with fellow elders! Sending love! 🍵🌸"
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playTapFeedback()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-emerald-700 cursor-pointer active:scale-95"
            title="Share circle streak on WhatsApp"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span>WhatsApp Share</span>
          </a>

          <div className="flex items-center gap-1.5 bg-amber-50 border-2 border-black/30 rounded-xl p-1">
            <button
              onClick={() => setFilterCircle("Silver Tea")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterCircle === "Silver Tea"
                  ? "bg-tea text-white shadow-xs"
                  : "text-ink-secondary hover:text-black"
              }`}
            >
              My Mid-Tier Circle (80%)
            </button>
            <button
              onClick={() => setFilterCircle("all")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterCircle === "all"
                  ? "bg-tea text-white shadow-xs"
                  : "text-ink-secondary hover:text-black"
              }`}
            >
              All Circles
            </button>
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-black/20 text-xs sm:text-sm text-ink font-medium flex items-center gap-2.5">
        <Sun className="h-5 w-5 text-amber-600 shrink-0" />
        <span>
          <strong>Carefully Designed for Calm: </strong>
          No stressful 1st-to-100th rankings! You are walking together in the Silver Tea Circle with 42 fellow elders across Assam & Northeast.
        </span>
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((m) => {
          const isMe = m.name.includes("(You)");
          const hasCheered = cheeredNames.includes(m.name);
          return (
            <div
              key={m.name}
              className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 ${
                isMe
                  ? "border-black bg-amber-200/70 shadow-[3px_3px_0px_#000] ring-2 ring-tea"
                  : "border-black/20 bg-canvas hover:border-black/40 hover:bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-white border-2 border-black flex items-center justify-center text-xl shadow-xs">
                  {m.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-black text-sm text-ink">{m.name}</span>
                    <span className="text-[10px] text-ink-secondary">({m.location})</span>
                  </div>
                  <div className="text-[11px] text-ink-secondary font-medium mt-0.5">
                    {m.todayStatus}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.2 rounded border border-black/30 text-tea">
                      🔥 {m.streakDays} Day Streak
                    </span>
                    <span className="text-[10px] text-neutral-600 font-bold">
                      {m.favoriteGame}
                    </span>
                  </div>
                </div>
              </div>

              {!isMe && (
                <button
                  onClick={() => handleCheer(m.name)}
                  className={`p-2 rounded-xl border-2 text-xs font-bold transition-all cursor-pointer ${
                    hasCheered
                      ? "border-black bg-rose-200 text-rose-900 shadow-xs"
                      : "border-black/30 bg-white hover:bg-rose-50 text-ink"
                  }`}
                  title="Send peer cheer"
                >
                  <Heart className={`h-4 w-4 ${hasCheered ? "fill-rose-600 text-rose-600" : "text-neutral-500"}`} />
                </button>
              )}

              {isMe && (
                <span className="text-xs font-black font-mono bg-tea text-white px-2 py-1 rounded-lg border border-black">
                  Active 🌟
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
