"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  Heart,
  MessageCircle,
  Camera,
  Calendar,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Send,
  Upload,
  User,
  ArrowLeft,
  Volume2,
} from "lucide-react";
import { playEncourage, playTapFeedback } from "@/lib/sound";
import { useLocale } from "next-intl";
import { useCareSyncStore } from "@/lib/careSyncStore";

export default function FamilyPortalPage() {
  const locale = useLocale();
  const normLoc = (locale?.split("-")[0]?.toLowerCase() || "en");

  const addFamilyNote = useCareSyncStore((s) => s.addFamilyNote);
  const familyPhotos = useCareSyncStore((s) => s.familyPhotos);
  const addFamilyPhoto = useCareSyncStore((s) => s.addFamilyPhoto);

  const [loveNote, setLoveNote] = useState("");
  const [senderName, setSenderName] = useState("Rahul (Grandson)");
  const [noteSent, setNoteSent] = useState(false);

  const handleSendNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loveNote.trim()) return;
    playTapFeedback();
    playEncourage();

    addFamilyNote({
      sender: senderName,
      relation: senderName.includes("Grandson") ? "Grandson" : senderName.includes("Daughter") ? "Daughter" : "Family Member",
      avatar: senderName.includes("Grandson") ? "👦" : senderName.includes("Daughter") ? "👩" : "💌",
      message: loveNote,
    });

    setNoteSent(true);
    setLoveNote("");
    setTimeout(() => setNoteSent(false), 4000);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playTapFeedback();
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          addFamilyPhoto({
            title: file.name.replace(/\.[^/.]+$/, ""),
            tag: "Family Memory",
            img: reader.result,
            decade: "1970s",
            prompt: "Do you remember this cherished family moment?",
          });
          playEncourage();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-canvas pb-24 text-ink">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-700 via-pink-600 to-rose-700 text-white border-b-4 border-black px-4 py-6 md:px-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/patient"
              className="p-2.5 rounded-xl bg-white text-black border-2 border-black shadow-[2px_2px_0px_#000] hover:bg-amber-100 flex items-center justify-center cursor-pointer"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-white text-rose-700 px-2 py-0.5 rounded">
                  Family Care Circle
                </span>
                <span className="text-xs text-rose-100">Biren Borah's Family Portal</span>
              </div>
              <h1 className="font-serif font-black text-2xl sm:text-3xl mt-0.5">
                Family & Grandchildren Hub
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-2xl border border-white/20">
            <Heart className="h-5 w-5 text-amber-300 fill-amber-300" />
            <div>
              <div className="text-[10px] uppercase tracking-wider font-mono text-white/80">Baba's Happiness Index</div>
              <div className="text-sm font-black text-amber-300">Peaceful & Active (94%)</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Quick Vitals & Activity Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="border-3 border-black bg-surface rounded-2xl p-4 shadow-[3px_3px_0px_#000]">
            <span className="text-xs font-bold text-ink-secondary">Today's Therapy</span>
            <div className="font-serif font-black text-xl text-ink mt-1 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-tea" />
              <span>Card Mastery Level 4</span>
            </div>
            <p className="text-xs text-ink-secondary mt-1">Completed at 9:30 AM • 12 mins played</p>
          </div>

          <div className="border-3 border-black bg-surface rounded-2xl p-4 shadow-[3px_3px_0px_#000]">
            <span className="text-xs font-bold text-ink-secondary">Breakfast Log</span>
            <div className="font-serif font-black text-xl text-teal-800 mt-1">
              Pitha & Red Tea 🍵
            </div>
            <p className="text-xs text-ink-secondary mt-1">Blood sugar: 104 mg/dL (Normal & steady)</p>
          </div>

          <div className="border-3 border-black bg-surface rounded-2xl p-4 shadow-[3px_3px_0px_#000]">
            <span className="text-xs font-bold text-ink-secondary">Caregiver on Duty</span>
            <div className="font-serif font-black text-xl text-ink mt-1 flex items-center justify-between">
              <span>Runu Deka (ASHA)</span>
              <a
                href="tel:919876543210"
                className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer"
                title="Call Caregiver"
              >
                <PhoneCall className="h-4 w-4" />
              </a>
            </div>
            <p className="text-xs text-ink-secondary mt-1">Morning visit completed • Next at 4 PM</p>
          </div>
        </div>

        {/* Send Love Note to Baba */}
        <div className="border-3 border-black bg-gradient-to-br from-rose-50 to-pink-50 rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_#000] space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 border-2 border-black flex items-center justify-center text-white text-2xl shadow-[2px_2px_0px_#000]">
              💌
            </div>
            <div>
              <h3 className="font-serif font-black text-xl text-ink">
                Send a Voice Blessing or Love Note to Baba
              </h3>
              <p className="text-xs text-ink-secondary">
                This message appears directly on Baba's dashboard with large readable letters and audio read-aloud.
              </p>
            </div>
          </div>

          <form onSubmit={handleSendNote} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-ink">From</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-xl border-2 border-black bg-white font-bold text-xs"
                  required
                />
              </div>
              <div className="flex items-end gap-2 flex-wrap">
                {["Dadu you are the best! ❤️", "Proud of you Ma! 🌸", "See you this Sunday! 🏡"].map((quick) => (
                  <button
                    key={quick}
                    type="button"
                    onClick={() => setLoveNote(quick)}
                    className="p-2 rounded-xl border border-black/30 bg-white text-[11px] font-bold hover:bg-amber-100 cursor-pointer"
                  >
                    {quick}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink">Message Text</label>
              <textarea
                rows={3}
                value={loveNote}
                onChange={(e) => setLoveNote(e.target.value)}
                placeholder="Write something loving that brings a smile to Baba's face..."
                className="mt-1 w-full p-3 rounded-xl border-2 border-black bg-white text-sm"
                required
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-700 font-bold">
                {noteSent && "✓ Message delivered straight to Baba's dashboard!"}
              </span>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl border-2 border-black bg-rose-600 text-white font-bold text-xs shadow-[2px_2px_0px_#000] hover:bg-rose-700 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                <span>Send Note to Baba</span>
              </button>
            </div>
          </form>
        </div>

        {/* Upload Ancestral Photos */}
        <div className="border-3 border-black bg-surface rounded-3xl p-5 sm:p-6 shadow-[4px_4px_0px_#000] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 border-2 border-black flex items-center justify-center text-black text-2xl shadow-[2px_2px_0px_#000]">
                📸
              </div>
              <div>
                <h3 className="font-serif font-black text-xl text-ink">
                  Upload Childhood & Family Reminiscence Photos
                </h3>
                <p className="text-xs text-ink-secondary">
                  Photos uploaded here appear in Baba's deep memory recall questions and Memory Spotlight.
                </p>
              </div>
            </div>

            <label className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black bg-tea text-white font-bold text-xs shadow-[2px_2px_0px_#000] hover:bg-emerald-800 cursor-pointer">
              <Upload className="h-4 w-4" />
              <span>Upload Photo</span>
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {familyPhotos.map((p) => (
              <div key={p.id} className="border-2 border-black rounded-2xl overflow-hidden bg-white shadow-xs">
                <div className="h-28 bg-neutral-200 relative">
                  <img src={p.img} alt={p.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-2.5">
                  <h4 className="font-bold text-xs text-ink truncate">{p.title}</h4>
                  <span className="text-[10px] text-ink-secondary font-mono">{p.tag}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
