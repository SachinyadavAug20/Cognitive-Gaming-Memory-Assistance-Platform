"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  ChevronLeft,
  ChevronRight,
  Heart,
  Eye,
  Camera,
  Layers,
  Bird,
  CloudRain,
  Waves,
  Bell,
  Music,
  Store,
  RefreshCw,
  Headphones,
  Maximize2,
  Minimize2,
  Wind,
  Palette,
  Activity,
  CheckCircle2,
  Clock,
  Compass,
  HeartHandshake,
  MessageSquareHeart,
  Sun,
  Sunset,
  Coffee,
  SlidersHorizontal,
  Lock,
  ArrowRight,
} from "lucide-react";
import type {
  MemoryCapsule,
  AmbientSoundType,
  MemoryHotspot,
  MemoryColorFilter,
  CircadianPhase,
} from "@/types/capsule";
import {
  getAllCapsulesForPatient,
  saveCapsuleSessionLog,
  getFutureTimeCapsules,
} from "@/data/defaultCapsules";
import { Capsule3DScene } from "./Capsule3DScene";
import { WebcamHeadTracker } from "./WebcamHeadTracker";
import { FutureTimeCapsuleModal } from "./FutureTimeCapsuleModal";
import {
  playCapsuleSoundscape,
  stopCapsuleSoundscape,
  setSoundscapeVolume,
  playFamilyVoiceNote,
  stopFamilyVoiceNote,
  updateSpatialPan,
  toggleBinauralBeat,
  playHotspotAudioCue,
} from "@/lib/capsuleSoundscapes";
import { fetchCapsuleVariation } from "@/lib/capsuleOllama";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speak, stopSpeaking } from "@/lib/speech";
import { patientLangCode } from "@/lib/i18n";
import { speechRate } from "@/games/config";
import { playTapFeedback, playEncourage } from "@/lib/sound";

export function EchoesOfHomeClient() {
  const searchParams = useSearchParams();
  const requestedCapsuleId = searchParams.get("capsuleId");

  const { detail, patientId } = usePatientDetail();
  const patientName = detail?.name || "Biren Borah";
  const langCode = patientLangCode(detail?.preferredLanguage || "as");
  const rate = speechRate(detail);

  const [capsules, setCapsules] = useState<MemoryCapsule[]>(() =>
    getAllCapsulesForPatient(patientId || 2)
  );

  // Active Capsule Selection
  const [selectedIndex, setSelectedIndex] = useState(() => {
    if (requestedCapsuleId) {
      const idx = capsules.findIndex((c) => c.id === requestedCapsuleId);
      if (idx !== -1) return idx;
    }
    return 0;
  });

  const activeCapsule = capsules[selectedIndex] || capsules[0];

  // Motion Tracking Coordinates
  const [lookCoords, setLookCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [sensitivity, setSensitivity] = useState<"gentle" | "normal" | "high">("normal");

  // Audio States
  const [soundscapePlaying, setSoundscapePlaying] = useState(true);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [binauralMode, setBinauralMode] = useState<"gamma" | "alpha" | "off">("off");
  const [volume, setVolume] = useState(0.35);

  // Visual Atmosphere & Color Filters
  const [activeFilter, setActiveFilter] = useState<MemoryColorFilter>(
    activeCapsule?.colorFilter || "golden_hour"
  );
  const [zenMode, setZenMode] = useState(false);

  // Autopilot & Caregiver Controls
  const [autopilot, setAutopilot] = useState(false);
  const [showCaregiverDrawer, setShowCaregiverDrawer] = useState(false);
  const [showCoPilot, setShowCoPilot] = useState(false);
  const [circadianFilter, setCircadianFilter] = useState<CircadianPhase | "all">("all");

  // Future Time Capsule Modal state
  const [isTimeCapsuleOpen, setIsTimeCapsuleOpen] = useState(false);
  const futureCapsules = useMemo(() => getFutureTimeCapsules(patientId || 2), [patientId, isTimeCapsuleOpen]);

  const filteredCapsules = useMemo(() => {
    if (circadianFilter === "all") return capsules;
    return capsules.filter((c) => c.circadianPhase === circadianFilter);
  }, [capsules, circadianFilter]);

  // Interactive Joy Hotspots
  const [focusedHotspot, setFocusedHotspot] = useState<MemoryHotspot | null>(null);

  // Calming Breathing Guide
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Breathe In" | "Hold" | "Breathe Out">("Breathe In");

  // AI Guided Narration
  const [guidedText, setGuidedText] = useState(activeCapsule?.guidedPrompts?.sensoryPrompt || "");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  // Session Logging
  const [sessionStartTime] = useState<number>(() => Date.now());
  const [loggedFeedback, setLoggedFeedback] = useState<string | null>(null);

  // Stable coordinate change handler
  const handleCoordsChange = useCallback((coords: { x: number; y: number }) => {
    setLookCoords(coords);
    updateSpatialPan(coords.x);
  }, []);

  // Stable hotspot hover handler
  const handleHotspotHover = useCallback((hotspot: MemoryHotspot | null) => {
    if (hotspot && hotspot.id !== focusedHotspot?.id) {
      playHotspotAudioCue(hotspot.soundCue || "chime");
    }
    setFocusedHotspot(hotspot);
  }, [focusedHotspot?.id]);

  // Start soundscape on capsule switch (Notice: volume excluded to prevent sound restart flicker)
  useEffect(() => {
    if (soundscapePlaying && activeCapsule) {
      playCapsuleSoundscape(activeCapsule.ambientSoundType, volume);
    }
    setGuidedText(activeCapsule?.guidedPrompts?.sensoryPrompt || "");
    setActiveFilter(activeCapsule?.colorFilter || "golden_hour");
    setIsAiGenerated(false);
    setFocusedHotspot(null);
    stopFamilyVoiceNote();
    setVoicePlaying(false);

    return () => {
      stopCapsuleSoundscape();
      stopFamilyVoiceNote();
      toggleBinauralBeat("off");
    };
  }, [selectedIndex, activeCapsule?.id, soundscapePlaying]);

  // Breathing Cycle Timer
  useEffect(() => {
    if (!breathActive) return;
    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % 3;
      if (step === 0) setBreathPhase("Breathe In");
      else if (step === 1) setBreathPhase("Hold");
      else setBreathPhase("Breathe Out");
    }, 4000);
    return () => clearInterval(interval);
  }, [breathActive]);

  const handleToggleSoundscape = () => {
    playTapFeedback();
    if (soundscapePlaying) {
      stopCapsuleSoundscape();
      setSoundscapePlaying(false);
    } else {
      playCapsuleSoundscape(activeCapsule.ambientSoundType, volume);
      setSoundscapePlaying(true);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setSoundscapeVolume(newVol);
  };

  const handleBinauralToggle = (mode: "gamma" | "alpha") => {
    playTapFeedback();
    if (binauralMode === mode) {
      toggleBinauralBeat("off");
      setBinauralMode("off");
    } else {
      toggleBinauralBeat(mode);
      setBinauralMode(mode);
    }
  };

  const handlePlayVoice = () => {
    playTapFeedback();
    if (voicePlaying) {
      stopFamilyVoiceNote();
      setVoicePlaying(false);
    } else {
      setVoicePlaying(true);
      playFamilyVoiceNote(
        activeCapsule.voiceNoteText,
        langCode,
        () => setVoicePlaying(true),
        () => setVoicePlaying(false),
        activeCapsule.voiceAudioUrl
      );
    }
  };

  const handleNarrateGuide = () => {
    playTapFeedback();
    speak(guidedText, langCode, rate);
  };

  const handleGenerateAiVariation = async () => {
    setIsGeneratingAi(true);
    playTapFeedback();
    try {
      const result = await fetchCapsuleVariation(activeCapsule, patientName);
      setGuidedText(result.text);
      setIsAiGenerated(result.isAiGenerated);
      speak(result.text, langCode, rate);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleLogObservation = (obs: "calm" | "joyful" | "nostalgic" | "verbal") => {
    playEncourage();
    const duration = Math.max(10, Math.round((Date.now() - sessionStartTime) / 1000));
    saveCapsuleSessionLog({
      id: `log-${Date.now()}`,
      patientId: activeCapsule.patientId,
      capsuleId: activeCapsule.id,
      capsuleTitle: activeCapsule.title,
      timestamp: new Date().toISOString(),
      durationSeconds: duration,
      headTrackingUsed: webcamEnabled,
      autopilotUsed: autopilot,
      engagementScore: webcamEnabled ? 94 : autopilot ? 88 : 80,
      caregiverObservation: obs,
    });
    setLoggedFeedback(obs);
    setTimeout(() => setLoggedFeedback(null), 3000);
  };

  const handlePrevCapsule = () => {
    playTapFeedback();
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : capsules.length - 1));
  };

  const handleNextCapsule = () => {
    playTapFeedback();
    setSelectedIndex((prev) => (prev < capsules.length - 1 ? prev + 1 : 0));
  };

  const soundLabelMap: Record<AmbientSoundType, { name: string; icon: React.ReactNode }> = {
    rain: { name: "Monsoon Rain on Tin Roof", icon: <CloudRain className="h-4 w-4 text-blue-600" /> },
    river: { name: "Brahmaputra River Swell", icon: <Waves className="h-4 w-4 text-cyan-600" /> },
    birds: { name: "Morning Bamboo Birds", icon: <Bird className="h-4 w-4 text-emerald-600" /> },
    namghar: { name: "Sacred Temple Chimes", icon: <Bell className="h-4 w-4 text-amber-600" /> },
    flute: { name: "Bamboo Flute (Raga Bhupali)", icon: <Music className="h-4 w-4 text-teal-600" /> },
    bazaar: { name: "Distant Village Market", icon: <Store className="h-4 w-4 text-orange-600" /> },
  };

  return (
    <div className={`min-h-screen pb-16 bg-[#FAF6F0] flex flex-col transition-all ${zenMode ? "fixed inset-0 z-50 overflow-hidden pb-0 bg-black" : ""}`}>
      {/* Top Header */}
      {!zenMode && (
        <header className="bg-white border-b-3 border-black px-4 py-3 text-ink shadow-xs">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/patient"
                className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-50 px-3 py-1.5 text-xs font-black text-ink hover:bg-amber-100 transition-colors cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                ← Patient Home
              </Link>
              <div>
                <h1 className="font-serif font-black text-lg md:text-xl text-ink flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  <span>Echoes of Home</span>
                  <span className="hidden sm:inline-block text-xs font-bold text-ink-secondary">
                    (ঘৰৰ চিনাকি সুৰ)
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Loving Messages Keepsake Button */}
              <button
                type="button"
                onClick={() => {
                  playTapFeedback();
                  setIsTimeCapsuleOpen(true);
                }}
                className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-amber-400 hover:bg-amber-500 text-amber-950 px-3.5 py-1.5 text-xs font-black cursor-pointer shadow-[2px_2px_0px_#000]"
                title="Open or write loving messages"
              >
                <Heart className="h-4 w-4 fill-amber-950 text-amber-950" />
                <span>Loving Messages ({futureCapsules.length})</span>
              </button>

              {/* Soothing Soundscape master toggle */}
              <button
                type="button"
                onClick={handleToggleSoundscape}
                className={`btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-black transition-colors cursor-pointer shadow-[2px_2px_0px_#000] ${
                  soundscapePlaying
                    ? "border-black bg-emerald-100 text-emerald-950"
                    : "border-black/30 bg-white text-ink-secondary"
                }`}
              >
                {soundscapePlaying ? (
                  <>
                    <Volume2 className="h-4 w-4 text-emerald-800 animate-pulse" />
                    <span className="hidden sm:inline">Sound: ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 text-ink-secondary" />
                    <span className="hidden sm:inline">Sound Muted</span>
                  </>
                )}
              </button>

              {/* Caregiver Clinical Settings Drawer Toggle */}
              <button
                type="button"
                onClick={() => setShowCaregiverDrawer((s) => !s)}
                className={`btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-1.5 text-xs font-black cursor-pointer shadow-[2px_2px_0px_#000] ${
                  showCaregiverDrawer
                    ? "border-black bg-tea text-white"
                    : "border-black bg-white text-ink hover:bg-amber-50"
                }`}
                title="Clinical controls for caregiver (gaze tracker, 40Hz stimulation)"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Caregiver Tools</span>
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Main Peaceful Theatre Area */}
      <main className={`max-w-5xl mx-auto px-4 pt-4 flex-1 w-full space-y-4 ${zenMode ? "p-2 max-w-none h-full flex flex-col justify-between" : ""}`}>
        {/* Navigation & Memory Title Banner */}
        {!zenMode && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border-3 border-black bg-white p-4 shadow-[4px_4px_0px_#000]">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-black text-tea-dark uppercase tracking-wider mb-1">
                <span className="px-2.5 py-0.5 rounded-md bg-tea-light border border-tea/30">
                  Memory {selectedIndex + 1} of {capsules.length}
                </span>
                <span>•</span>
                <span>{activeCapsule.locationName}</span>
                <span>•</span>
                <span className="text-ink-secondary">{activeCapsule.seasonOrTime}</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-black text-ink">
                {activeCapsule.title}
              </h2>
            </div>

            {/* Large Friendly Previous & Next Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handlePrevCapsule}
                className="btn-tactile min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-[#FAF6F0] hover:bg-amber-100 px-4 py-2 text-xs sm:text-sm font-black text-ink cursor-pointer shadow-[3px_3px_0px_#000]"
                aria-label="Previous Memory"
              >
                <ChevronLeft className="h-5 w-5" />
                <span>Prev</span>
              </button>
              <button
                type="button"
                onClick={handleNextCapsule}
                className="btn-tactile min-h-[44px] inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea hover:bg-tea-dark px-4 py-2 text-xs sm:text-sm font-black text-white cursor-pointer shadow-[3px_3px_0px_#000]"
                aria-label="Next Memory"
              >
                <span>Next</span>
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Zen Fullscreen Button */}
              <button
                type="button"
                onClick={() => setZenMode(true)}
                className="btn-tactile min-h-[44px] inline-flex items-center gap-1 rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-black text-ink hover:bg-black/5 cursor-pointer shadow-[2px_2px_0px_#000]"
                title="Enter distraction-free Zen mode"
              >
                <Maximize2 className="h-4 w-4 text-tea" />
              </button>
            </div>
          </div>
        )}

        {/* 3D Spatial Memory Canvas Stage (Completely Flicker-Free) */}
        <div className={`relative rounded-3xl border-4 border-black bg-slate-950 overflow-hidden shadow-[8px_8px_0px_#000] ${zenMode ? "flex-1 rounded-2xl h-full border-2" : ""}`}>
          <Capsule3DScene
            capsule={activeCapsule}
            coords={lookCoords}
            colorFilter={activeFilter}
            autopilot={autopilot}
            onPointerMove={handleCoordsChange}
            onHotspotActive={handleHotspotHover}
            onHotspotClick={(h) => {
              playHotspotAudioCue(h.soundCue || "chime");
              setFocusedHotspot(h);
            }}
          />

          {/* Top Left: Soundscape Indicator */}
          <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-white/95 px-3.5 py-1 text-xs font-black text-ink backdrop-blur-md shadow-sm">
              {soundLabelMap[activeCapsule.ambientSoundType]?.icon}
              <span>{soundLabelMap[activeCapsule.ambientSoundType]?.name}</span>
            </span>
          </div>

          {/* Top Right: Zen Exit */}
          {zenMode && (
            <button
              type="button"
              onClick={() => setZenMode(false)}
              className="absolute top-4 right-4 z-20 btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-white/50 bg-black/80 px-4 py-2 text-xs font-black text-white hover:bg-black cursor-pointer shadow-md"
            >
              <Minimize2 className="h-4 w-4" />
              <span>Exit Zen Mode</span>
            </button>
          )}

          {/* Gentle Hotspot Spotlight popup */}
          {focusedHotspot && (
            <div className="absolute top-16 right-4 max-w-xs animate-in fade-in rounded-2xl border-3 border-amber-400 bg-black/90 backdrop-blur-md p-4 text-white shadow-[4px_4px_0px_#f59e0b] z-20">
              <div className="flex items-center gap-2 mb-1">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Memory Spotlight
                </span>
              </div>
              <h4 className="font-serif text-sm font-black text-white">
                {focusedHotspot.label}
              </h4>
              <p className="text-xs font-medium text-amber-100/90 mt-1 leading-relaxed">
                {focusedHotspot.detail}
              </p>
            </div>
          )}

          {/* Bottom Floating Family Voice Strip */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/85 backdrop-blur-md border-2 border-white/20 rounded-2xl p-3.5 text-white z-10">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="h-10 w-10 rounded-full border-2 border-amber-400 bg-amber-400/20 flex items-center justify-center text-lg font-black text-amber-300 shrink-0">
                {activeCapsule.familyMemberName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 block">
                  Family Message from {activeCapsule.familyMemberName} ({activeCapsule.relationship})
                </span>
                <p className="text-xs font-semibold text-white/95 line-clamp-1 italic">
                  "{activeCapsule.voiceNoteText}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                type="button"
                onClick={handlePlayVoice}
                className={`btn-tactile min-h-[44px] inline-flex items-center gap-2 rounded-xl border-2 px-5 py-2.5 text-xs sm:text-sm font-black transition-all cursor-pointer shadow-[3px_3px_0px_#000] ${
                  voicePlaying
                    ? "border-amber-400 bg-amber-400 text-black animate-pulse"
                    : "border-black bg-white text-ink hover:bg-amber-100"
                }`}
              >
                <Volume2 className="h-4 w-4 text-tea" />
                <span>{voicePlaying ? "Playing Family Note..." : "Hear Family Voice"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Gentle Memory Reflection (Calibrated for Low Cognitive Load) */}
        {!zenMode && (
          <div className="rounded-3xl border-3 border-black bg-white p-5 shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex items-center justify-between gap-3 border-b-2 border-black/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-amber-100">
                  <Sparkles className="h-5 w-5 text-amber-900" />
                </div>
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-black text-ink">
                    Cherished Memory Reflection
                  </h3>
                  <span className="text-xs font-bold text-ink-secondary">
                    A peaceful moment to reminisce
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNarrateGuide}
                  className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-tea px-4 py-2 text-xs sm:text-sm font-black text-white hover:bg-tea-dark cursor-pointer shadow-[2px_2px_0px_#000]"
                >
                  <Volume2 className="h-4 w-4" />
                  <span>Listen</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-black/15 bg-amber-50/70 p-4">
              <p className="font-serif text-base sm:text-lg font-bold text-ink leading-relaxed">
                "{guidedText}"
              </p>
            </div>
          </div>
        )}

        {/* Collapsible Caregiver & Clinical Drawer (Keeps patient view minimal by default) */}
        {!zenMode && showCaregiverDrawer && (
          <div className="rounded-3xl border-3 border-black bg-white p-5 shadow-[5px_5px_0px_#000] space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b-2 border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-tea" />
                <h3 className="font-serif font-black text-base text-ink">
                  Caregiver Clinical & Neuro-Acoustic Controls
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCaregiverDrawer(false)}
                className="text-xs font-black text-ink-secondary hover:text-ink cursor-pointer"
              >
                Close Drawer ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              {/* 40Hz Gamma / 10Hz Alpha Neuro-Acoustics */}
              <div className="p-3.5 rounded-2xl border-2 border-black/20 bg-amber-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
                    <Headphones className="h-4 w-4" />
                    <span>Neuro-Acoustic Beats</span>
                  </div>
                  <p className="text-[11px] text-ink-secondary font-semibold">
                    40Hz Gamma promotes microglia activation & working memory; 10Hz Alpha calms agitation.
                  </p>
                </div>
                <div className="flex gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => handleBinauralToggle("gamma")}
                    className={`flex-1 py-1.5 rounded-xl border-2 text-center font-black cursor-pointer ${
                      binauralMode === "gamma"
                        ? "border-black bg-amber-800 text-white"
                        : "border-black/30 bg-white text-ink"
                    }`}
                  >
                    40Hz Gamma
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBinauralToggle("alpha")}
                    className={`flex-1 py-1.5 rounded-xl border-2 text-center font-black cursor-pointer ${
                      binauralMode === "alpha"
                        ? "border-black bg-teal-800 text-white"
                        : "border-black/30 bg-white text-ink"
                    }`}
                  >
                    10Hz Alpha
                  </button>
                </div>
              </div>

              {/* Autopilot Ken Burns Memory Cruise */}
              <div className="p-3.5 rounded-2xl border-2 border-black/20 bg-amber-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
                    <Compass className="h-4 w-4" />
                    <span>Autopilot Ken Burns Drift</span>
                  </div>
                  <p className="text-[11px] text-ink-secondary font-semibold">
                    Cinematic slow camera panning visiting hotspots without requiring touch or head motion.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAutopilot((a) => !a)}
                  className={`mt-2.5 w-full py-1.5 rounded-xl border-2 text-center font-black cursor-pointer ${
                    autopilot
                      ? "border-black bg-amber-400 text-amber-950"
                      : "border-black/30 bg-white text-ink"
                  }`}
                >
                  {autopilot ? "Autopilot Active ✓" : "Enable Autopilot"}
                </button>
              </div>

              {/* Webcam Head Tracker */}
              <div className="p-3.5 rounded-2xl border-2 border-black/20 bg-amber-50/60 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
                    <Eye className="h-4 w-4" />
                    <span>Webcam Gaze Tracking</span>
                  </div>
                  <p className="text-[11px] text-ink-secondary font-semibold">
                    Hands-free parallax navigation via subtle head movement.
                  </p>
                </div>
                <div className="mt-2.5">
                  <WebcamHeadTracker
                    active={webcamEnabled}
                    onToggleActive={() => setWebcamEnabled((prev) => !prev)}
                    onCoordsChange={handleCoordsChange}
                    sensitivity={sensitivity}
                    onSensitivityChange={setSensitivity}
                  />
                </div>
              </div>
            </div>

            {/* Quick Emotional Response Logger */}
            <div className="p-3.5 rounded-2xl border-2 border-black/20 bg-emerald-50/50 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-black text-emerald-950 block">Caregiver Reaction Log</span>
                <span className="text-[11px] text-emerald-800 font-semibold">
                  Record patient's response to monitor wellbeing trends.
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "joyful", label: "Smiled / Joyful", emoji: "😊" },
                  { key: "calm", label: "Calm & Relaxed", emoji: "🌿" },
                  { key: "nostalgic", label: "Recollected", emoji: "💭" },
                  { key: "verbal", label: "Spoke Name", emoji: "🗣️" },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => handleLogObservation(item.key as any)}
                    className={`rounded-xl border-2 border-black px-3 py-1.5 text-xs font-black cursor-pointer transition-all ${
                      loggedFeedback === item.key
                        ? "bg-emerald-600 text-white"
                        : "bg-white text-ink hover:bg-emerald-100"
                    }`}
                  >
                    <span className="mr-1">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Carousel Thumbnails */}
        {!zenMode && (
          <div className="rounded-2xl border-3 border-black bg-white p-4 shadow-[4px_4px_0px_#000] space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-ink-secondary">
              All Living Memory Capsules ({capsules.length})
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {filteredCapsules.map((cap) => {
                const isActive = cap.id === activeCapsule.id;
                return (
                  <button
                    key={cap.id}
                    type="button"
                    onClick={() => {
                      playTapFeedback();
                      const idx = capsules.findIndex((c) => c.id === cap.id);
                      if (idx !== -1) setSelectedIndex(idx);
                    }}
                    className={`group rounded-xl border-2 overflow-hidden text-left transition-all p-1.5 cursor-pointer ${
                      isActive
                        ? "border-tea bg-tea-light shadow-xs scale-102"
                        : "border-black/20 bg-white hover:border-black"
                    }`}
                  >
                    <div className="relative h-16 w-full rounded-lg overflow-hidden bg-slate-900 mb-1.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={cap.photoUrl}
                        alt={cap.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-tea/25 border-2 border-tea rounded-lg pointer-events-none" />
                      )}
                    </div>
                    <span className="text-[11px] font-black text-ink block truncate leading-tight">
                      {cap.title}
                    </span>
                    <span className="text-[9px] font-semibold text-ink-secondary block truncate">
                      {cap.familyMemberName} • {cap.locationName}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Future Time Capsule Modal */}
      <FutureTimeCapsuleModal
        patientId={patientId || 2}
        patientName={patientName}
        isOpen={isTimeCapsuleOpen}
        onClose={() => setIsTimeCapsuleOpen(false)}
        langCode={langCode}
      />
    </div>
  );
}

