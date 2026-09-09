"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  Clock,
  Heart,
  Camera,
  Mic,
  MicOff,
  Play,
  Square,
  Volume2,
  Lock,
  Unlock,
  CheckCircle2,
  Shield,
  Smile,
  Calendar,
  Layers,
  ArrowRight,
  RotateCcw,
  Sun,
  User,
  Image as ImageIcon,
} from "lucide-react";
import type { FutureTimeCapsule, TimeCapsuleMilestone, TimeCapsuleTheme } from "@/types/capsule";
import { getFutureTimeCapsules, saveFutureTimeCapsule } from "@/data/defaultCapsules";
import { playCorrect, playTapFeedback, playEncourage } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";

interface FutureTimeCapsuleModalProps {
  patientId: number;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  langCode?: string;
}

const PRESET_IDENTITY_PROMPTS = [
  {
    theme: "identity" as TimeCapsuleTheme,
    label: "My Identity & Home Anchor",
    title: "To Myself When Days Feel Foggy",
    text: "Dear Biren, if today feels confusing or the names slip away: Remember you are Biren Borah, retired headmaster, beloved father and grandfather. You built your home at Silpukhuri with honest hands. You are safe. Look out the verandah at the mango tree. Everything is alright.",
    milestone: "confused_days" as TimeCapsuleMilestone,
    milestoneLabel: "When I Feel Foggy or Lost",
    icon: "🛡️",
  },
  {
    theme: "family_love" as TimeCapsuleTheme,
    label: "Blessing for Children & Grandkids",
    title: "Blessing for My Family",
    text: "To Manash, Ananya, and dear grandchild Arnav: Watching you grow and care for me fills my heart with joy. Never forget to sit together for morning tea, stay truthful in all you do, and listen to the birds at Silpukhuri. My blessings walk with you every step.",
    milestone: "next_bihu" as TimeCapsuleMilestone,
    milestoneLabel: "Next Festive Gathering (Rongali Bihu)",
    icon: "🌸",
  },
  {
    theme: "gratitude" as TimeCapsuleTheme,
    label: "Gratitude for Pratima",
    title: "Words of Love for Pratima",
    text: "Pratima, forty-six years together have been my greatest fortune. Even when my memory wanders, my heart always recognizes your warm tea, your footsteps, and your gentle voice. Thank you for holding my hand every single day.",
    milestone: "anytime" as TimeCapsuleMilestone,
    milestoneLabel: "Cherished Words Forever",
    icon: "💖",
  },
];

const PRESET_PHOTOS = [
  {
    url: "/sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg",
    label: "Silpukhuri Verandah",
  },
  {
    url: "/sample-images/patient_1_biren_borah/relatives/01_son_manash_borah.jpg",
    label: "Son Manash",
  },
  {
    url: "/sample-images/patient_1_biren_borah/relatives/02_spouse_pratima_borah.jpg",
    label: "Wife Pratima",
  },
  {
    url: "/sample-images/patient_1_biren_borah/places/03_silpukhuri_hari_namghar.jpg",
    label: "Namghar Prayer Hall",
  },
];

export function FutureTimeCapsuleModal({
  patientId,
  patientName,
  isOpen,
  onClose,
  langCode = "as",
}: FutureTimeCapsuleModalProps) {
  const [activeTab, setActiveTab] = useState<"create" | "vault">("create");
  const [capsules, setCapsules] = useState<FutureTimeCapsule[]>(() =>
    getFutureTimeCapsules(patientId)
  );

  // Form Fields
  const [title, setTitle] = useState(PRESET_IDENTITY_PROMPTS[0].title);
  const [messageText, setMessageText] = useState(PRESET_IDENTITY_PROMPTS[0].text);
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_PHOTOS[0].url);
  const [selectedMilestone, setSelectedMilestone] = useState<TimeCapsuleMilestone>("confused_days");
  const [selectedTheme, setSelectedTheme] = useState<TimeCapsuleTheme>("identity");
  const [recipient, setRecipient] = useState<"future_self" | "family" | "children">("future_self");

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Sealing celebration animation state
  const [isSealing, setIsSealing] = useState(false);
  const [sealedCapsuleJustNow, setSealedCapsuleJustNow] = useState<FutureTimeCapsule | null>(null);

  // Active opened capsule in vault view
  const [openedCapsule, setOpenedCapsule] = useState<FutureTimeCapsule | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setCapsules(getFutureTimeCapsules(patientId));
  }, [patientId, isOpen]);

  if (!isOpen) return null;

  const handleSelectPrompt = (p: typeof PRESET_IDENTITY_PROMPTS[0]) => {
    playTapFeedback();
    setTitle(p.title);
    setMessageText(p.text);
    setSelectedMilestone(p.milestone);
    setSelectedTheme(p.theme);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mr = new MediaRecorder(stream);
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          setRecordedAudioUrl(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch {
      alert("Microphone permission needed to record audio message.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      playCorrect();
    }
  };

  const handlePreviewSpeech = () => {
    playTapFeedback();
    if (recordedAudioUrl) {
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
        audioPlayerRef.current = null;
        setIsPlayingAudio(false);
        return;
      }
      const a = new Audio(recordedAudioUrl);
      audioPlayerRef.current = a;
      setIsPlayingAudio(true);
      a.onended = () => {
        setIsPlayingAudio(false);
        audioPlayerRef.current = null;
      };
      a.play().catch(() => setIsPlayingAudio(false));
    } else {
      speak(messageText, langCode, 0.85);
    }
  };

  const handleSealCapsule = () => {
    if (!messageText.trim()) return;
    setIsSealing(true);
    playEncourage();

    const milestoneLabelMap: Record<TimeCapsuleMilestone, string> = {
      confused_days: "When I Feel Foggy or Anxious",
      next_bihu: "Next Festive Gathering (Rongali Bihu)",
      six_months: "In 6 Months",
      one_year: "In 1 Year",
      anytime: "Cherished Words Always",
    };

    const newCapsule: FutureTimeCapsule = {
      id: `time-capsule-${Date.now()}`,
      patientId,
      authorName: patientName,
      authorRole: "patient",
      title: title || "A Message for Tomorrow",
      recipient,
      messageText,
      photoUrl: selectedPhoto,
      audioUrl: recordedAudioUrl,
      theme: selectedTheme,
      milestone: selectedMilestone,
      milestoneLabel: milestoneLabelMap[selectedMilestone],
      sealedAt: new Date().toISOString(),
      isSealed: true,
    };

    setTimeout(() => {
      const updated = saveFutureTimeCapsule(newCapsule);
      setCapsules(updated);
      setIsSealing(false);
      setSealedCapsuleJustNow(newCapsule);
      setActiveTab("vault");
      setOpenedCapsule(newCapsule);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border-3 border-black bg-[#FAF6F0] shadow-[8px_8px_0px_#000] overflow-hidden text-ink">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black/10 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-2xl bg-amber-100 border-2 border-amber-800 text-amber-900 flex items-center justify-center font-black">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-serif font-black text-lg sm:text-xl text-ink leading-tight flex items-center gap-1.5">
                <span>Time Capsule: Words for Tomorrow</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-tea-light text-tea-dark font-sans font-bold border border-tea/30">
                  ভৱিষ্যতৰ বাৰ্তা
                </span>
              </h2>
              <p className="text-xs text-ink-secondary font-bold">
                Preserve comforting words, identity anchors & blessings for your future self & family
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              if (audioPlayerRef.current) audioPlayerRef.current.pause();
              onClose();
            }}
            className="h-8 w-8 rounded-full border-2 border-black bg-white hover:bg-rose-100 flex items-center justify-center cursor-pointer transition-colors"
            title="Close"
          >
            <X className="h-4 w-4 text-ink" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b-2 border-black/10 bg-amber-50/50 px-5 pt-2">
          <button
            type="button"
            onClick={() => {
              playTapFeedback();
              setActiveTab("create");
            }}
            className={`pb-2.5 px-4 text-xs sm:text-sm font-black transition-all border-b-3 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "create"
                ? "border-tea text-tea-dark font-black"
                : "border-transparent text-ink-secondary hover:text-ink"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Create Future Message</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTapFeedback();
              setActiveTab("vault");
            }}
            className={`pb-2.5 px-4 text-xs sm:text-sm font-black transition-all border-b-3 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "vault"
                ? "border-tea text-tea-dark font-black"
                : "border-transparent text-ink-secondary hover:text-ink"
            }`}
          >
            <Lock className="h-4 w-4" />
            <span>Sealed Capsules Vault ({capsules.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {activeTab === "create" ? (
            <>
              {/* Errorless Assisted Inspiration Prompts */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-ink-secondary mb-2">
                  Choose a Heartfelt Anchor or Write Your Own
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PRESET_IDENTITY_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPrompt(p)}
                      className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        title === p.title
                          ? "border-black bg-amber-100 shadow-[2px_2px_0px_#000]"
                          : "border-black/20 bg-white hover:bg-amber-50"
                      }`}
                    >
                      <div className="text-lg mb-1">{p.icon}</div>
                      <h4 className="text-xs font-black text-ink leading-tight mb-1">{p.label}</h4>
                      <p className="text-[10px] text-ink-secondary font-bold line-clamp-2">{p.title}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Message Box */}
              <div>
                <label className="block text-xs font-black text-ink mb-1">
                  Message Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border-2 border-black bg-white px-3.5 py-2 text-sm font-bold text-ink shadow-[2px_2px_0px_#000] focus:outline-none focus:ring-2 focus:ring-tea"
                  placeholder="e.g. To My Future Self on Foggy Days"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-ink">
                    Your Words of Comfort & Memory
                  </label>
                  <button
                    type="button"
                    onClick={handlePreviewSpeech}
                    className="inline-flex items-center gap-1 text-[11px] font-black text-tea hover:text-tea-dark cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Listen Aloud</span>
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full rounded-2xl border-2 border-black bg-white p-3.5 text-sm font-medium text-ink shadow-[2px_2px_0px_#000] leading-relaxed focus:outline-none focus:ring-2 focus:ring-tea"
                  placeholder="Write gentle words, your name, names of loved ones, or memories you never want to forget..."
                />
              </div>

              {/* Photo Attachment Selection */}
              <div>
                <label className="block text-xs font-black text-ink mb-2">
                  Attach a Cherished Photo
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_PHOTOS.map((photo, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        playTapFeedback();
                        setSelectedPhoto(photo.url);
                      }}
                      className={`group relative rounded-xl border-2 overflow-hidden transition-all cursor-pointer aspect-video ${
                        selectedPhoto === photo.url
                          ? "border-amber-600 ring-2 ring-amber-500 scale-[1.02]"
                          : "border-black/30 opacity-80 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.label}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 px-1.5 py-0.5 text-[9px] font-black text-white text-center truncate">
                        {photo.label}
                      </div>
                      {selectedPhoto === photo.url && (
                        <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Recording Strip */}
              <div className="rounded-2xl border-2 border-black bg-white p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-[2px_2px_0px_#000]">
                <div className="flex items-center gap-2.5">
                  <div className={`h-8 w-8 rounded-full border-2 border-black flex items-center justify-center ${
                    isRecording ? "bg-rose-500 text-white animate-pulse" : "bg-amber-100 text-amber-900"
                  }`}>
                    <Mic className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-ink">
                      {isRecording ? `Recording... (${recordingSeconds}s)` : "Voice Message"}
                    </h5>
                    <p className="text-[10px] text-ink-secondary font-bold">
                      {recordedAudioUrl
                        ? "Voice note recorded and attached"
                        : "Record yourself speaking in your own voice"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isRecording ? (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-rose-600 text-white px-3 py-1.5 text-xs font-black cursor-pointer shadow-[2px_2px_0px_#000]"
                    >
                      <Square className="h-3 w-3 fill-white" />
                      <span>Stop Recording</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-amber-50 hover:bg-amber-100 text-amber-950 px-3 py-1.5 text-xs font-black cursor-pointer shadow-[2px_2px_0px_#000]"
                    >
                      <Mic className="h-3.5 w-3.5 text-amber-800" />
                      <span>{recordedAudioUrl ? "Re-record Voice" : "Record Voice"}</span>
                    </button>
                  )}

                  {recordedAudioUrl && !isRecording && (
                    <button
                      type="button"
                      onClick={handlePreviewSpeech}
                      className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-tea text-white px-3 py-1.5 text-xs font-black cursor-pointer shadow-[2px_2px_0px_#000]"
                    >
                      <Play className="h-3 w-3 fill-white" />
                      <span>{isPlayingAudio ? "Playing..." : "Play"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Delivery Milestone Condition */}
              <div>
                <label className="block text-xs font-black text-ink mb-1.5">
                  When Should This Capsule Be Unsealed?
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {[
                    { key: "confused_days", label: "When Feeling Foggy", sub: "Compassion Anchor" },
                    { key: "next_bihu", label: "Rongali Bihu", sub: "Festive Joy" },
                    { key: "six_months", label: "In 6 Months", sub: "Future Milestone" },
                    { key: "anytime", label: "Always Available", sub: "Cherished Anytime" },
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => {
                        playTapFeedback();
                        setSelectedMilestone(m.key as TimeCapsuleMilestone);
                      }}
                      className={`p-2.5 rounded-xl border-2 text-left cursor-pointer transition-all ${
                        selectedMilestone === m.key
                          ? "border-black bg-tea text-white shadow-[2px_2px_0px_#000]"
                          : "border-black/20 bg-white text-ink hover:bg-amber-50"
                      }`}
                    >
                      <div className="font-black text-xs leading-tight">{m.label}</div>
                      <div className={`text-[10px] font-bold ${selectedMilestone === m.key ? "text-white/80" : "text-ink-secondary"}`}>
                        {m.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Seal Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSealCapsule}
                  disabled={isSealing || !messageText.trim()}
                  className="w-full btn-tactile inline-flex items-center justify-center gap-2 rounded-2xl border-3 border-black bg-amber-500 hover:bg-amber-600 text-amber-950 px-6 py-3.5 text-base font-black shadow-[4px_4px_0px_#000] cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSealing ? (
                    <>
                      <Lock className="h-5 w-5 animate-spin" />
                      <span>Sealing Time Capsule with Sacred Chime...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="h-5 w-5" />
                      <span>Seal Time Capsule into Vault (চীল কৰক)</span>
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Vault of Sealed Capsules */
            <div className="space-y-4">
              {openedCapsule ? (
                /* Unsealed Capsule View */
                <div className="rounded-3xl border-3 border-black bg-white p-5 shadow-[4px_4px_0px_#000] space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase">
                        {openedCapsule.milestoneLabel}
                      </span>
                      <span className="text-xs text-ink-secondary font-bold">
                        Sealed {new Date(openedCapsule.sealedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setOpenedCapsule(null)}
                      className="text-xs font-black text-tea hover:underline cursor-pointer"
                    >
                      ← Back to All Capsules
                    </button>
                  </div>

                  {openedCapsule.photoUrl && (
                    <div className="relative w-full h-48 sm:h-64 rounded-2xl border-2 border-black overflow-hidden shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={openedCapsule.photoUrl}
                        alt={openedCapsule.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <h3 className="font-serif font-black text-xl text-ink mb-1">
                      {openedCapsule.title}
                    </h3>
                    <p className="text-xs font-bold text-ink-secondary mb-3">
                      From {openedCapsule.authorName} to {openedCapsule.recipient.replace("_", " ")}
                    </p>
                    <div className="rounded-2xl border-2 border-black/10 bg-amber-50/60 p-4 text-sm font-medium text-ink leading-relaxed whitespace-pre-wrap">
                      {openedCapsule.messageText}
                    </div>
                  </div>

                  {/* Audio Playback of the patient's own voice */}
                  <div className="flex items-center justify-between rounded-xl border-2 border-black bg-[#FAF6F0] p-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-ink">
                      <Volume2 className="h-4 w-4 text-tea" />
                      <span>Hear Voice of Capsule</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (openedCapsule.audioUrl) {
                          const a = new Audio(openedCapsule.audioUrl);
                          a.play();
                        } else {
                          speak(openedCapsule.messageText, langCode, 0.85);
                        }
                      }}
                      className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea text-white px-3.5 py-1.5 text-xs font-black cursor-pointer shadow-[2px_2px_0px_#000]"
                    >
                      <Play className="h-3.5 w-3.5 fill-white" />
                      <span>Listen to Message</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* List of Capsules */
                <div className="space-y-3">
                  <p className="text-xs font-bold text-ink-secondary">
                    Tap any sealed capsule to open and listen to its comforting message:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {capsules.map((cap) => (
                      <div
                        key={cap.id}
                        onClick={() => {
                          playTapFeedback();
                          setOpenedCapsule(cap);
                        }}
                        className="p-4 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000] hover:bg-amber-50/70 transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-[11px] font-black uppercase text-tea mb-1">
                            <span className="flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              <span>{cap.milestoneLabel}</span>
                            </span>
                            <span className="text-ink-secondary text-[10px]">
                              {new Date(cap.sealedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <h4 className="font-serif font-black text-sm text-ink leading-tight mb-1">
                            {cap.title}
                          </h4>
                          <p className="text-xs text-ink-secondary line-clamp-2 leading-relaxed">
                            {cap.messageText}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between text-xs font-black text-tea">
                          <span>Unseal & Listen</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
