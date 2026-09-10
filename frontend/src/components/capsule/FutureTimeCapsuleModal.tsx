"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Sparkles,
  Heart,
  Mic,
  Square,
  Volume2,
  VolumeX,
  CheckCircle2,
  ArrowLeft,
  MessageCircle,
} from "lucide-react";
import type { FutureTimeCapsule, TimeCapsuleMilestone, TimeCapsuleTheme } from "@/types/capsule";
import { getFutureTimeCapsules, saveFutureTimeCapsule } from "@/data/defaultCapsules";
import { playTapFeedback, playEncourage, unlockAudio } from "@/lib/sound";
import { speak, stopSpeaking } from "@/lib/speech";

interface FutureTimeCapsuleModalProps {
  patientId: number;
  patientName: string;
  isOpen: boolean;
  onClose: () => void;
  langCode?: string;
}

const PRESET_IDEAS = [
  {
    theme: "identity" as TimeCapsuleTheme,
    icon: "🏡",
    title: "To Myself When Days Feel Foggy",
    label: "Remind Me Who I Am",
    text: "Dear Biren, if today feels confusing: Remember you are Biren Borah, retired headmaster, beloved father and grandfather. You built your home at Silpukhuri with honest hands. You are safe, loved, and at home.",
    photoUrl: "/sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg",
  },
  {
    theme: "family_love" as TimeCapsuleTheme,
    icon: "🌸",
    title: "Blessing for My Family",
    label: "Blessing for My Children & Grandkids",
    text: "To my dear children and grandchild: Watching you care for me fills my heart with joy. Never forget to sit together for morning tea, stay truthful in all you do, and remember I love you always.",
    photoUrl: "/sample-images/patient_1_biren_borah/relatives/01_son_manash_borah.jpg",
  },
  {
    theme: "gratitude" as TimeCapsuleTheme,
    icon: "💖",
    title: "Words of Love for Pratima",
    label: "A Message of Gratitude",
    text: "Pratima, forty-six years together have been my greatest fortune. Even when my memory wanders, my heart always recognizes your warm tea, your footsteps, and your gentle voice. Thank you.",
    photoUrl: "/sample-images/patient_1_biren_borah/relatives/02_spouse_pratima_borah.jpg",
  },
];

const PHOTO_CHOICES = [
  {
    url: "/sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg",
    label: "Our Home Verandah",
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
  const [activeTab, setActiveTab] = useState<"messages" | "create">("messages");
  const [capsules, setCapsules] = useState<FutureTimeCapsule[]>(() =>
    getFutureTimeCapsules(patientId)
  );

  // Active message detail view
  const [selectedMessage, setSelectedMessage] = useState<FutureTimeCapsule | null>(null);

  // Form Fields for new message
  const [title, setTitle] = useState(PRESET_IDEAS[0].title);
  const [messageText, setMessageText] = useState(PRESET_IDEAS[0].text);
  const [selectedPhoto, setSelectedPhoto] = useState(PRESET_IDEAS[0].photoUrl);
  const [selectedTheme, setSelectedTheme] = useState<TimeCapsuleTheme>("identity");

  // Voice recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Sealing / saving feedback
  const [isSaved, setIsSaved] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setCapsules(getFutureTimeCapsules(patientId));
  }, [patientId, isOpen]);

  useEffect(() => {
    if (isOpen) {
      const existing = getFutureTimeCapsules(patientId);
      setCapsules(existing);
      if (existing.length > 0) {
        setActiveTab("messages");
        setSelectedMessage(null);
      } else {
        setActiveTab("create");
      }
      setIsSaved(false);
    }
  }, [isOpen, patientId]);

  if (!isOpen) return null;

  const handleSelectPreset = (p: typeof PRESET_IDEAS[0]) => {
    playTapFeedback();
    setTitle(p.title);
    setMessageText(p.text);
    setSelectedPhoto(p.photoUrl);
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
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };
      mediaRecorderRef.current = mr;
      mr.start();
      setIsRecording(true);
      playTapFeedback();
    } catch {
      alert("Microphone permission was denied. You can still use the written message!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      playTapFeedback();
    }
  };

  const handleListenText = (text: string) => {
    unlockAudio();
    if (isPlayingAudio) {
      stopSpeaking();
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speak(text, langCode, 0.85, () => {}, () => setIsPlayingAudio(false));
    }
  };

  const handlePlayVoiceAudio = (audioUrl: string | null | undefined, fallbackText: string) => {
    unlockAudio();
    if (isPlayingAudio) {
      stopSpeaking();
      if (audioPlayerRef.current) audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
      return;
    }

    if (audioUrl) {
      setIsPlayingAudio(true);
      const audio = new Audio(audioUrl);
      audioPlayerRef.current = audio;
      audio.onended = () => setIsPlayingAudio(false);
      audio.onerror = () => {
        setIsPlayingAudio(false);
        speak(fallbackText, langCode, 0.85);
      };
      audio.play().catch(() => {
        setIsPlayingAudio(false);
        speak(fallbackText, langCode, 0.85);
      });
    } else {
      setIsPlayingAudio(true);
      speak(fallbackText, langCode, 0.85, () => {}, () => setIsPlayingAudio(false));
    }
  };

  const handleSave = () => {
    if (!messageText.trim()) return;
    playEncourage();

    const newCapsule: FutureTimeCapsule = {
      id: `time-capsule-${Date.now()}`,
      patientId,
      authorName: patientName,
      authorRole: "patient",
      title: title || "A Message for Tomorrow",
      recipient: "future_self",
      messageText: messageText.trim(),
      photoUrl: selectedPhoto,
      audioUrl: recordedAudioUrl,
      theme: selectedTheme,
      milestone: "anytime",
      milestoneLabel: "Cherished Words",
      sealedAt: new Date().toISOString(),
      isSealed: true,
    };

    const updated = saveFutureTimeCapsule(newCapsule);
    setCapsules(updated);
    setIsSaved(true);

    setTimeout(() => {
      setIsSaved(false);
      setActiveTab("messages");
      setSelectedMessage(newCapsule);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-5 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col rounded-3xl border-3 border-black bg-[#FAF6F0] shadow-[8px_8px_0px_#000] overflow-hidden text-ink">
        
        {/* Header - Clean, gentle, high-contrast */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-black/15 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-2xl bg-amber-100 border-2 border-black text-amber-900 flex items-center justify-center font-black">
              <Heart className="h-5 w-5 fill-amber-400 text-amber-900" />
            </div>
            <div>
              <h2 className="font-serif font-black text-lg sm:text-xl text-ink leading-tight">
                Loving Messages for Tomorrow
              </h2>
              <p className="text-xs text-ink-secondary font-bold">
                Gentle reminders and comforting words from your heart
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
            className="h-10 w-10 rounded-full border-2 border-black bg-white hover:bg-rose-100 flex items-center justify-center cursor-pointer transition-colors shadow-xs"
            title="Close"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-ink" />
          </button>
        </div>

        {/* Minimal 2-Tab Bar */}
        <div className="flex border-b-2 border-black/15 bg-[#FFF9EE] px-4 pt-2">
          <button
            type="button"
            onClick={() => {
              playTapFeedback();
              setActiveTab("messages");
              setSelectedMessage(null);
            }}
            className={`pb-2.5 px-4 text-xs sm:text-sm font-black transition-all border-b-3 cursor-pointer flex items-center gap-2 ${
              activeTab === "messages"
                ? "border-tea text-tea-dark font-black"
                : "border-transparent text-ink-secondary hover:text-ink"
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Read & Listen ({capsules.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playTapFeedback();
              setActiveTab("create");
              setSelectedMessage(null);
            }}
            className={`pb-2.5 px-4 text-xs sm:text-sm font-black transition-all border-b-3 cursor-pointer flex items-center gap-2 ${
              activeTab === "create"
                ? "border-tea text-tea-dark font-black"
                : "border-transparent text-ink-secondary hover:text-ink"
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Leave a New Message</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === "messages" ? (
            selectedMessage ? (
              /* Single Message Expanded View - Large, clear, readable */
              <div className="space-y-4 animate-in fade-in">
                <button
                  type="button"
                  onClick={() => {
                    playTapFeedback();
                    setSelectedMessage(null);
                  }}
                  className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3.5 py-1.5 text-xs font-black text-ink hover:bg-amber-50 cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>All Messages</span>
                </button>

                {selectedMessage.photoUrl && (
                  <div className="relative w-full h-44 sm:h-52 rounded-2xl border-2 border-black overflow-hidden shadow-xs">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedMessage.photoUrl}
                      alt={selectedMessage.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h3 className="font-serif font-black text-xl sm:text-2xl text-ink leading-tight">
                    {selectedMessage.title}
                  </h3>
                  <p className="text-xs text-ink-secondary font-bold mt-1">
                    Saved on {new Date(selectedMessage.sealedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Big message text box */}
                <div className="rounded-2xl border-2 border-black/15 bg-white p-4 text-base sm:text-lg font-medium text-ink leading-relaxed whitespace-pre-wrap shadow-xs">
                  {selectedMessage.messageText}
                </div>

                {/* Big Listen Button */}
                <button
                  type="button"
                  onClick={() =>
                    handlePlayVoiceAudio(selectedMessage.audioUrl, selectedMessage.messageText)
                  }
                  className={`btn-tactile w-full py-3.5 rounded-2xl border-3 border-black text-base font-black shadow-[3px_3px_0px_#000] cursor-pointer flex items-center justify-center gap-2.5 transition-all active:scale-95 ${
                    isPlayingAudio
                      ? "bg-amber-400 text-black ring-2 ring-black"
                      : "bg-tea text-white hover:bg-emerald-800"
                  }`}
                >
                  {isPlayingAudio ? (
                    <>
                      <VolumeX className="h-5 w-5" />
                      <span>Stop Reading</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-5 w-5" />
                      <span>Listen to Message</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* Message List - Simple & Clean */
              <div className="space-y-3">
                <p className="text-xs sm:text-sm font-bold text-ink-secondary">
                  Tap any card to open and listen:
                </p>

                {capsules.length === 0 ? (
                  <div className="rounded-2xl border-2 border-dashed border-black/30 p-8 text-center bg-white space-y-3">
                    <Heart className="h-10 w-10 text-amber-600 mx-auto" />
                    <p className="font-serif text-base font-bold text-ink">
                      No saved messages yet.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("create")}
                      className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-tea px-4 py-2 text-xs font-black text-white cursor-pointer shadow-xs"
                    >
                      <span>Leave Your First Message</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {capsules.map((cap) => (
                      <div
                        key={cap.id}
                        onClick={() => {
                          playTapFeedback();
                          setSelectedMessage(cap);
                        }}
                        className="btn-tactile p-4 rounded-2xl border-2 border-black bg-white shadow-[3px_3px_0px_#000] hover:bg-amber-50/70 transition-all cursor-pointer flex items-center gap-3.5"
                      >
                        {cap.photoUrl ? (
                          <div className="h-16 w-16 rounded-xl border-2 border-black overflow-hidden shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={cap.photoUrl}
                              alt={cap.title}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-16 w-16 rounded-xl border-2 border-black bg-amber-100 flex items-center justify-center shrink-0">
                            <Heart className="h-7 w-7 text-amber-800" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-black text-base text-ink leading-tight truncate">
                            {cap.title}
                          </h4>
                          <p className="text-xs text-ink-secondary line-clamp-1 mt-1 font-medium">
                            {cap.messageText}
                          </p>
                          <span className="text-[11px] font-bold text-tea-dark mt-1 inline-block">
                            Tap to listen →
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          ) : (
            /* Creation Flow - Ultra-simple, 2-step */
            <div className="space-y-4">
              {/* Step 1: 1-Tap Heartfelt Presets */}
              <div>
                <label className="block text-xs font-black text-ink mb-1.5">
                  1. What would you like this message to be about?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {PRESET_IDEAS.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(item)}
                      className={`p-3 rounded-2xl border-2 text-left cursor-pointer transition-all ${
                        title === item.title
                          ? "border-black bg-amber-200 shadow-[2px_2px_0px_#000]"
                          : "border-black/20 bg-white hover:bg-amber-50"
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <h4 className="font-serif font-black text-xs text-ink mt-1 leading-snug">
                        {item.label}
                      </h4>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: The Message Words */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-black text-ink">
                    2. Your Words (Read or Edit)
                  </label>
                  <button
                    type="button"
                    onClick={() => handleListenText(messageText)}
                    className="inline-flex items-center gap-1 text-xs font-black text-tea hover:text-tea-dark cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    <span>Listen Aloud</span>
                  </button>
                </div>

                <textarea
                  rows={4}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="w-full rounded-2xl border-2 border-black bg-white p-3.5 text-sm sm:text-base font-medium text-ink shadow-[2px_2px_0px_#000] leading-relaxed focus:outline-none focus:ring-2 focus:ring-tea"
                  placeholder="Write your words here..."
                />
              </div>

              {/* Optional: Tap to Speak Voice Note */}
              <div className="rounded-2xl border-2 border-black bg-white p-3.5 flex items-center justify-between gap-3 shadow-[2px_2px_0px_#000]">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full border-2 border-black flex items-center justify-center ${
                      isRecording
                        ? "bg-rose-500 text-white animate-pulse"
                        : recordedAudioUrl
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    <Mic className="h-5 w-5" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-ink">
                      {isRecording ? "Listening to your voice..." : "Add Your Voice (Optional)"}
                    </h5>
                    <p className="text-[11px] text-ink-secondary font-bold">
                      {recordedAudioUrl
                        ? "Voice recorded and attached!"
                        : "Speak in your own comforting voice"}
                    </p>
                  </div>
                </div>

                {isRecording ? (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-rose-600 text-white px-3.5 py-2 text-xs font-black cursor-pointer shadow-xs"
                  >
                    <Square className="h-3.5 w-3.5 fill-white" />
                    <span>Done</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-100 hover:bg-amber-200 text-amber-950 px-3.5 py-2 text-xs font-black cursor-pointer shadow-xs"
                  >
                    <Mic className="h-3.5 w-3.5" />
                    <span>{recordedAudioUrl ? "Re-record" : "Speak"}</span>
                  </button>
                )}
              </div>

              {/* Step 3: Pick a Photo */}
              <div>
                <label className="block text-xs font-black text-ink mb-1.5">
                  3. Pick a Familiar Photo
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {PHOTO_CHOICES.map((photo, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        playTapFeedback();
                        setSelectedPhoto(photo.url);
                      }}
                      className={`relative rounded-xl border-2 overflow-hidden transition-all cursor-pointer aspect-square ${
                        selectedPhoto === photo.url
                          ? "border-tea ring-3 ring-tea/50 scale-102 shadow-xs"
                          : "border-black/30 opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.url}
                        alt={photo.label}
                        className="w-full h-full object-cover"
                      />
                      {selectedPhoto === photo.url && (
                        <div className="absolute top-1 right-1 h-5 w-5 rounded-full bg-tea text-white flex items-center justify-center">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!messageText.trim() || isSaved}
                  className="w-full btn-tactile inline-flex items-center justify-center gap-2 rounded-2xl border-3 border-black bg-tea hover:bg-emerald-800 text-white px-6 py-3.5 text-base font-black shadow-[4px_4px_0px_#000] cursor-pointer transition-transform active:scale-95 disabled:opacity-50"
                >
                  {isSaved ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Saved with Love!</span>
                    </>
                  ) : (
                    <>
                      <Heart className="h-5 w-5 fill-white" />
                      <span>Save My Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
