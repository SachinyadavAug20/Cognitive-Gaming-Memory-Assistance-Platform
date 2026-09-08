"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
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
  Home,
  Headphones,
  Maximize2,
  Minimize2,
  Wind,
  Palette,
  Smile,
  Activity,
  CheckCircle2,
  Clock,
  Compass,
  HeartHandshake,
  MessageSquareHeart,
  Sun,
  Sunset,
  Coffee,
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
} from "@/data/defaultCapsules";
import { Capsule3DScene } from "./Capsule3DScene";
import { WebcamHeadTracker } from "./WebcamHeadTracker";
import {
  playCapsuleSoundscape,
  stopCapsuleSoundscape,
  playFamilyVoiceNote,
  stopFamilyVoiceNote,
  updateSpatialPan,
  toggleBinauralBeat,
  playHotspotAudioCue,
} from "@/lib/capsuleSoundscapes";
import { fetchCapsuleVariation } from "@/lib/capsuleOllama";
import { usePatientDetail } from "@/games/usePatientDetail";
import { speak } from "@/lib/speech";
import { patientLangCode } from "@/lib/i18n";
import { speechRate } from "@/games/config";

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

  // Motion Tracking Coordinates & Sensitivity
  const [lookCoords, setLookCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [sensitivity, setSensitivity] = useState<"gentle" | "normal" | "high">("normal");

  // Audio & Neuro-Acoustic States
  const [soundscapePlaying, setSoundscapePlaying] = useState(true);
  const [voicePlaying, setVoicePlaying] = useState(false);
  const [binauralMode, setBinauralMode] = useState<"gamma" | "alpha" | "off">("off");
  const [volume, setVolume] = useState(0.4);

  // Visual Atmosphere & Color Filters
  const [activeFilter, setActiveFilter] = useState<MemoryColorFilter>(
    activeCapsule?.colorFilter || "golden_hour"
  );
  const [zenMode, setZenMode] = useState(false);

  // Autopilot Memory Cruise & Caregiver Co-Pilot
  const [autopilot, setAutopilot] = useState(false);
  const [showCoPilot, setShowCoPilot] = useState(false);
  const [circadianFilter, setCircadianFilter] = useState<CircadianPhase | "all">("all");

  const filteredCapsules = useMemo(() => {
    if (circadianFilter === "all") return capsules;
    return capsules.filter((c) => c.circadianPhase === circadianFilter);
  }, [capsules, circadianFilter]);

  // Interactive Joy Hotspots
  const [focusedHotspot, setFocusedHotspot] = useState<MemoryHotspot | null>(null);

  // Calming Breathing Guide (Sundowning Support)
  const [breathActive, setBreathActive] = useState(false);
  const [breathPhase, setBreathPhase] = useState<"Breathe In" | "Hold" | "Breathe Out">("Breathe In");

  // AI Guided Narration States
  const [guidedText, setGuidedText] = useState(activeCapsule?.guidedPrompts?.sensoryPrompt || "");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  // Session Logging / Caregiver Observation
  const [sessionStartTime] = useState<number>(() => Date.now());
  const [loggedFeedback, setLoggedFeedback] = useState<string | null>(null);

  // Sync spatial pan with coordinates
  const handleCoordsChange = (coords: { x: number; y: number }) => {
    setLookCoords(coords);
    updateSpatialPan(coords.x);
  };

  // Start soundscape on capsule switch
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
  }, [selectedIndex, activeCapsule?.id]);

  // Calming Breath Cycle Timer (4s in, 4s hold, 4s out)
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
    if (soundscapePlaying) {
      stopCapsuleSoundscape();
      setSoundscapePlaying(false);
    } else {
      playCapsuleSoundscape(activeCapsule.ambientSoundType, volume);
      setSoundscapePlaying(true);
    }
  };

  const handleBinauralToggle = (mode: "gamma" | "alpha") => {
    if (binauralMode === mode) {
      toggleBinauralBeat("off");
      setBinauralMode("off");
    } else {
      toggleBinauralBeat(mode);
      setBinauralMode(mode);
    }
  };

  const handlePlayVoice = () => {
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
    speak(guidedText, langCode, rate);
  };

  const handleGenerateAiVariation = async () => {
    setIsGeneratingAi(true);
    try {
      const result = await fetchCapsuleVariation(activeCapsule, patientName);
      setGuidedText(result.text);
      setIsAiGenerated(result.isAiGenerated);
      speak(result.text, langCode, rate);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleHotspotHover = (hotspot: MemoryHotspot | null) => {
    if (hotspot && hotspot.id !== focusedHotspot?.id) {
      playHotspotAudioCue(hotspot.soundCue || "chime");
    }
    setFocusedHotspot(hotspot);
  };

  const handleLogObservation = (obs: "calm" | "joyful" | "nostalgic" | "verbal") => {
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
    setTimeout(() => setLoggedFeedback(null), 3500);
  };

  const handlePrevCapsule = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : capsules.length - 1));
  };

  const handleNextCapsule = () => {
    setSelectedIndex((prev) => (prev < capsules.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className={`min-h-screen pb-16 bg-[#FAF6F0] flex flex-col transition-all ${zenMode ? "fixed inset-0 z-50 overflow-hidden pb-0 bg-black" : ""}`}>
      {/* Top Header (Hidden in Zen Mode) */}
      {!zenMode && (
        <header className="bg-ink border-b-4 border-black px-4 py-3.5 text-white shadow-md">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link
                href="/patient"
                className="btn-tactile rounded-xl border-2 border-white/40 bg-white/10 px-3 py-1 text-xs font-black text-white hover:bg-white/20 transition-colors"
              >
                ← Patient Home
              </Link>
              <div>
                <h1 className="font-serif font-black text-lg md:text-xl text-white flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-400" />
                  <span>Echoes of Home</span>
                  <span className="hidden sm:inline-block text-xs font-bold text-amber-300/80">
                    // Multi-Sensory Memory Capsule
                  </span>
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Soundscape master button */}
              <button
                type="button"
                onClick={handleToggleSoundscape}
                className={`btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-black transition-colors cursor-pointer ${
                  soundscapePlaying
                    ? "border-emerald-500 bg-emerald-900/40 text-emerald-300"
                    : "border-white/30 bg-black/40 text-white/70"
                }`}
              >
                {soundscapePlaying ? (
                  <>
                    <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" />
                    <span className="hidden sm:inline capitalize">{activeCapsule.ambientSoundType} Audio ON</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 text-white/50" />
                    <span className="hidden sm:inline">Audio Muted</span>
                  </>
                )}
              </button>

              {/* Webcam Head Tracker Toggle */}
              <WebcamHeadTracker
                active={webcamEnabled}
                onToggleActive={() => setWebcamEnabled((prev) => !prev)}
                onCoordsChange={handleCoordsChange}
                sensitivity={sensitivity}
                onSensitivityChange={setSensitivity}
              />
            </div>
          </div>
        </header>
      )}

      {/* Main Theatre Area */}
      <main className={`max-w-6xl mx-auto px-4 pt-4 flex-1 w-full space-y-4 ${zenMode ? "p-2 max-w-none h-full flex flex-col justify-between" : ""}`}>
        {/* Capsule Banner Info & Controls */}
        {!zenMode && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border-3 border-black bg-white p-4 shadow-[4px_4px_0px_#000]">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-black text-tea-dark uppercase tracking-wider mb-1">
                <span className="px-2 py-0.5 rounded-md bg-tea-light border border-tea/30">
                  Memory {selectedIndex + 1} of {capsules.length}
                </span>
                {activeCapsule.lifeChapter && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 border border-amber-300 text-amber-950 font-bold capitalize">
                    {activeCapsule.lifeChapter.replace("_", " ")}
                  </span>
                )}
                <span>•</span>
                <span>{activeCapsule.locationName}</span>
                <span>•</span>
                <span className="text-ink-secondary">{activeCapsule.seasonOrTime}</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-black text-ink">
                {activeCapsule.title}
              </h2>
            </div>

            {/* Top Sensory Toggles Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Autopilot Memory Cruise Toggle */}
              <button
                type="button"
                onClick={() => setAutopilot((a) => !a)}
                className={`btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-black cursor-pointer shadow-[2px_2px_0px_#000] ${
                  autopilot
                    ? "border-amber-700 bg-amber-400 text-amber-950 shadow-inner"
                    : "border-black bg-white text-ink hover:bg-amber-50"
                }`}
                title="Cinematic drift navigation visiting hotspots sequentially without requiring head or hand motion"
              >
                <Compass className={`h-3.5 w-3.5 text-amber-900 ${autopilot ? "animate-spin" : ""}`} />
                <span>{autopilot ? "Autopilot Cruise ON" : "Autopilot Cruise"}</span>
              </button>

              {/* Neuro-Acoustic 40Hz / 10Hz Stimulation */}
              <div className="flex items-center rounded-xl border-2 border-black bg-amber-50 p-1 text-[11px] font-black">
                <Headphones className="h-3.5 w-3.5 text-amber-900 mx-1.5" />
                <button
                  type="button"
                  onClick={() => handleBinauralToggle("gamma")}
                  className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                    binauralMode === "gamma"
                      ? "bg-amber-800 text-white shadow-xs"
                      : "text-amber-900 hover:bg-amber-200"
                  }`}
                  title="40Hz Sensory Gamma for Cognitive Memory Stimulation"
                >
                  40Hz Gamma
                </button>
                <button
                  type="button"
                  onClick={() => handleBinauralToggle("alpha")}
                  className={`px-2 py-0.5 rounded-lg cursor-pointer ${
                    binauralMode === "alpha"
                      ? "bg-teal-800 text-white shadow-xs"
                      : "text-teal-900 hover:bg-teal-100"
                  }`}
                  title="10Hz Alpha Tone for Calming Sundowning Agitation"
                >
                  10Hz Alpha
                </button>
              </div>

              {/* Calming Breath Sync Button */}
              <button
                type="button"
                onClick={() => setBreathActive((b) => !b)}
                className={`btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-black cursor-pointer shadow-[2px_2px_0px_#000] ${
                  breathActive
                    ? "border-cyan-800 bg-cyan-100 text-cyan-950"
                    : "border-black bg-white text-ink hover:bg-amber-50"
                }`}
                title="Breathe with memory rhythm"
              >
                <Wind className={`h-3.5 w-3.5 text-cyan-700 ${breathActive ? "animate-spin" : ""}`} />
                <span>{breathActive ? `Breath: ${breathPhase}` : "Calm Breath"}</span>
              </button>

              {/* Prev / Next Navigation */}
              <button
                type="button"
                onClick={handlePrevCapsule}
                className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-[#FAF6F0] px-2.5 py-1.5 text-xs font-black text-ink hover:bg-amber-100 cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleNextCapsule}
                className="btn-tactile inline-flex items-center gap-1 rounded-xl border-2 border-black bg-[#FAF6F0] px-2.5 py-1.5 text-xs font-black text-ink hover:bg-amber-100 cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>

              {/* Zen Fullscreen Button */}
              <button
                type="button"
                onClick={() => setZenMode(true)}
                className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-1.5 text-xs font-black text-ink hover:bg-black/5 cursor-pointer shadow-[2px_2px_0px_#000]"
                title="Enter distraction-free Zen mode"
              >
                <Maximize2 className="h-3.5 w-3.5 text-tea" />
                <span className="hidden sm:inline">Zen Mode</span>
              </button>
            </div>
          </div>
        )}

        {/* 3D Spatial Memory Stage */}
        <div className={`relative rounded-3xl border-4 border-black bg-slate-950 overflow-hidden shadow-[8px_8px_0px_#000] ${zenMode ? "flex-1 rounded-2xl h-full border-2" : ""}`}>
          {/* Three.js 3D Spatial Canvas */}
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

          {/* Autopilot HUD Floating Pill */}
          {autopilot && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
              <span className="inline-flex items-center gap-2 rounded-full border-2 border-amber-400 bg-black/85 px-4 py-1 text-xs font-black text-amber-300 backdrop-blur-md shadow-lg animate-pulse">
                <Compass className="h-3.5 w-3.5 animate-spin" />
                <span>Autopilot Cruise • Ken Burns Memory Drift</span>
              </span>
            </div>
          )}

          {/* Top Left: Atmosphere Badges & 3D Lighting Filter */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 pointer-events-none">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-black bg-white/95 px-3 py-1 text-xs font-black text-ink backdrop-blur-md shadow-xs pointer-events-auto">
              {activeCapsule.ambientSoundType === "rain" && <CloudRain className="h-4 w-4 text-blue-600" />}
              {activeCapsule.ambientSoundType === "river" && <Waves className="h-4 w-4 text-cyan-600" />}
              {activeCapsule.ambientSoundType === "namghar" && <Bell className="h-4 w-4 text-amber-600" />}
              {activeCapsule.ambientSoundType === "flute" && <Music className="h-4 w-4 text-teal-600" />}
              {activeCapsule.ambientSoundType === "bazaar" && <Store className="h-4 w-4 text-orange-600" />}
              {activeCapsule.ambientSoundType === "birds" && <Bird className="h-4 w-4 text-emerald-600" />}
              <span className="capitalize">{activeCapsule.ambientSoundType} Soundscape</span>
            </span>

            {/* Color Filter Quick Pill Picker */}
            <div className="hidden md:flex items-center gap-1 rounded-full border-2 border-black bg-black/60 backdrop-blur-md p-1 pointer-events-auto text-[10px] font-black">
              <Palette className="h-3 w-3 text-amber-300 ml-1.5 mr-0.5" />
              {(["golden_hour", "monsoon_emerald", "kodachrome", "twilight", "natural"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setActiveFilter(f)}
                  className={`px-2 py-0.5 rounded-full uppercase tracking-wider cursor-pointer ${
                    activeFilter === f
                      ? "bg-amber-400 text-black shadow-xs font-black"
                      : "text-white/80 hover:text-white"
                  }`}
                >
                  {f === "golden_hour" ? "Golden" : f === "monsoon_emerald" ? "Monsoon" : f === "kodachrome" ? "Film" : f === "twilight" ? "Dusk" : "Natural"}
                </button>
              ))}
            </div>
          </div>

          {/* Top Right: Zen Mode Exit button */}
          {zenMode && (
            <button
              type="button"
              onClick={() => setZenMode(false)}
              className="absolute top-4 right-4 z-20 btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-white/50 bg-black/70 px-3 py-1.5 text-xs font-black text-white hover:bg-black cursor-pointer shadow-md"
            >
              <Minimize2 className="h-4 w-4" />
              <span>Exit Zen</span>
            </button>
          )}

          {/* Interactive Joy Hotspot Floating Card (Triggered by gaze / hover) */}
          {focusedHotspot && (
            <div className="absolute top-16 right-4 max-w-xs animate-fade-in rounded-2xl border-3 border-amber-400 bg-black/85 backdrop-blur-md p-3.5 text-white shadow-[4px_4px_0px_#f59e0b] z-20">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                  Joy Trigger Spotlight
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

          {/* Calming Breathing Guide Visual Orb (When Active) */}
          {breathActive && (
            <div className="absolute top-16 left-4 z-20 rounded-2xl border-2 border-cyan-400/50 bg-black/80 backdrop-blur-md p-3 text-white flex items-center gap-3 animate-fade-in shadow-md">
              <div className="relative h-10 w-10 rounded-full border-2 border-cyan-400 flex items-center justify-center">
                <div
                  className={`h-7 w-7 rounded-full bg-cyan-400/70 transition-all duration-1000 ${
                    breathPhase === "Breathe In"
                      ? "scale-125 bg-cyan-300"
                      : breathPhase === "Hold"
                      ? "scale-100 bg-amber-300"
                      : "scale-75 bg-blue-500"
                  }`}
                />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 block">
                  Calming Breath Guide
                </span>
                <span className="text-xs font-black text-white">{breathPhase}</span>
              </div>
            </div>
          )}

          {/* Bottom Floating Interaction Bar */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/80 backdrop-blur-md border-2 border-white/20 rounded-2xl p-3 text-white z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full border-2 border-amber-300 bg-amber-400/20 flex items-center justify-center text-lg font-black text-amber-300 shrink-0">
                {activeCapsule.familyMemberName.charAt(0)}
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 block">
                  Spoken Voice Note from {activeCapsule.familyMemberName} ({activeCapsule.relationship})
                </span>
                <p className="text-xs font-semibold text-white/90 line-clamp-1 italic">
                  "{activeCapsule.voiceNoteText}"
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handlePlayVoice}
                className={`btn-tactile inline-flex items-center gap-2 rounded-xl border-2 px-4 py-2 text-xs font-black transition-all cursor-pointer shadow-[2px_2px_0px_#000] ${
                  voicePlaying
                    ? "border-amber-400 bg-amber-400 text-black animate-pulse"
                    : "border-black bg-white text-ink hover:bg-amber-100"
                }`}
              >
                <Volume2 className="h-4 w-4 text-tea" />
                <span>{voicePlaying ? "Playing Family Voice..." : "Hear Family Voice"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Guided Reminiscence & Local Ollama AI Generator */}
        {!zenMode && (
          <div className="rounded-3xl border-3 border-black bg-white p-5 shadow-[5px_5px_0px_#000] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-amber-100">
                  <Sparkles className="h-4 w-4 text-amber-900" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-black text-ink">
                    Guided Memory Companion (Saathi AI)
                  </h3>
                  <span className="text-[10px] font-bold text-ink-secondary">
                    {isAiGenerated
                      ? "✨ Fresh variation dynamically generated by Local Ollama (qwen2.5:1.5b)"
                      : "Calibrated multi-sensory prompt for cognitive reminiscing"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleNarrateGuide}
                  className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-tea px-3 py-1.5 text-xs font-black text-white hover:bg-tea-dark cursor-pointer shadow-[2px_2px_0px_#000]"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                  <span>Narrate Guide Aloud</span>
                </button>

                <button
                  type="button"
                  onClick={handleGenerateAiVariation}
                  disabled={isGeneratingAi}
                  className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-[#FAF6F0] px-3 py-1.5 text-xs font-black text-ink hover:bg-amber-100 disabled:opacity-50 cursor-pointer shadow-[2px_2px_0px_#000]"
                >
                  <RefreshCw className={`h-3.5 w-3.5 text-amber-700 ${isGeneratingAi ? "animate-spin" : ""}`} />
                  <span>{isGeneratingAi ? "Generating..." : "Fresh Variation (Ollama)"}</span>
                </button>
              </div>
            </div>

            <div className="rounded-2xl border-2 border-black/10 bg-amber-50/70 p-4">
              <p className="font-serif text-sm sm:text-base font-bold text-ink leading-relaxed">
                "{guidedText}"
              </p>
            </div>
          </div>
        )}

        {/* Caregiver Co-Pilot (Validation Therapy In-the-Moment Guide) */}
        {!zenMode && (
          <div className="rounded-3xl border-3 border-black bg-gradient-to-br from-amber-50 via-orange-50/40 to-yellow-50 p-5 shadow-[5px_5px_0px_#000] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-amber-900/15 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-black bg-amber-300 shadow-xs">
                  <HeartHandshake className="h-5 w-5 text-amber-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-base sm:text-lg font-black text-ink">
                      Caregiver Co-Pilot — In-the-Moment Guide
                    </h3>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-amber-200 border border-amber-800/30 text-[10px] font-black text-amber-950 uppercase">
                      Naomi Feil Validation Therapy
                    </span>
                  </div>
                  <p className="text-[11px] font-semibold text-ink-secondary">
                    Sit beside {patientName}. Follow these calibrated prompts to validate emotions without quizzing or testing memory.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowCoPilot((s) => !s)}
                className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border-2 border-black bg-white px-3 py-1.5 text-xs font-black text-ink hover:bg-amber-100 cursor-pointer shadow-[2px_2px_0px_#000]"
              >
                <span>{showCoPilot ? "Minimize Co-Pilot" : "Open Co-Pilot Guide"}</span>
              </button>
            </div>

            {showCoPilot && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 animate-fade-in">
                {/* 1. Sensory Anchor */}
                <div className="rounded-2xl border-2 border-black bg-white p-3.5 shadow-[2px_2px_0px_#000] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-amber-900 uppercase tracking-wider mb-1.5">
                      <Eye className="h-3.5 w-3.5 text-amber-700" />
                      <span>1. Sensory Anchor</span>
                    </div>
                    <p className="text-xs font-semibold text-ink leading-relaxed">
                      {activeCapsule.coPilotPrompts?.sensoryAnchor || `Notice the warm ambient ${activeCapsule.ambientSoundType} sounds and colors together.`}
                    </p>
                  </div>
                  <span className="text-[10px] font-medium text-ink-secondary mt-2 block border-t border-black/10 pt-1.5">
                    Gently point at screen or describe sound to ground their focus.
                  </span>
                </div>

                {/* 2. Validation Prompt */}
                <div className="rounded-2xl border-2 border-black bg-white p-3.5 shadow-[2px_2px_0px_#000] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-tea-dark uppercase tracking-wider mb-1.5">
                      <MessageSquareHeart className="h-3.5 w-3.5 text-tea" />
                      <span>2. Validation Prompt</span>
                    </div>
                    <p className="font-serif text-xs font-bold text-ink leading-relaxed italic">
                      "{activeCapsule.coPilotPrompts?.validationPrompt || `Does this peaceful light bring warmth to your day?`}"
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-black/10 flex items-center justify-between">
                    <span className="text-[10px] font-medium text-ink-secondary">
                      Non-judgmental & validating
                    </span>
                    {activeCapsule.coPilotPrompts?.validationPrompt && (
                      <button
                        type="button"
                        onClick={() => speak(activeCapsule.coPilotPrompts!.validationPrompt, langCode, rate)}
                        className="text-[10px] font-black text-tea hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Volume2 className="h-3 w-3" /> Speak
                      </button>
                    )}
                  </div>
                </div>

                {/* 3. Affection Bridge */}
                <div className="rounded-2xl border-2 border-black bg-white p-3.5 shadow-[2px_2px_0px_#000] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-black text-rose-900 uppercase tracking-wider mb-1.5">
                      <Heart className="h-3.5 w-3.5 text-rose-600" />
                      <span>3. Affection Bridge</span>
                    </div>
                    <p className="font-serif text-xs font-bold text-ink leading-relaxed">
                      "{activeCapsule.coPilotPrompts?.affectionBridge || `${activeCapsule.familyMemberName} loves you dearly and is right here with you.`}"
                    </p>
                  </div>
                  <span className="text-[10px] font-medium text-rose-900/80 mt-2 block border-t border-black/10 pt-1.5">
                    Warm touch: hold hand or place gentle arm around shoulder.
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Caregiver Observation & Real-Time Telemetry Bar */}
        {!zenMode && (
          <div className="rounded-2xl border-3 border-black bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 p-4 shadow-[4px_4px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950 uppercase tracking-wider">
                <Activity className="h-4 w-4 text-emerald-700" />
                <span>Caregiver Quick Reaction Logger</span>
              </div>
              <p className="text-[11px] font-semibold text-emerald-800">
                Log patient's emotional response during this memory session to track long-term wellbeing.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: "joyful", label: "Smiled / Joyful", emoji: "😊" },
                { key: "calm", label: "Calm & Relaxed", emoji: "🌿" },
                { key: "nostalgic", label: "Nostalgic Recollection", emoji: "💭" },
                { key: "verbal", label: "Spoke Family Name", emoji: "🗣️" },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleLogObservation(item.key as any)}
                  className={`btn-tactile rounded-xl border-2 border-black px-3 py-1.5 text-xs font-black cursor-pointer shadow-xs transition-all ${
                    loggedFeedback === item.key
                      ? "bg-emerald-600 text-white border-emerald-900"
                      : "bg-white text-ink hover:bg-emerald-100"
                  }`}
                >
                  <span className="mr-1">{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              ))}
              {loggedFeedback && (
                <span className="text-xs font-black text-emerald-900 animate-fade-in flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Logged!</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Carousel Thumbnails with Circadian Filter */}
        {!zenMode && (
          <div className="rounded-2xl border-3 border-black bg-white p-4 shadow-[4px_4px_0px_#000] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-ink-secondary">
                Memory Capsule Library
              </h4>

              {/* Circadian Phase Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: "all", label: "All Capsules", icon: Sparkles },
                  { key: "morning_rise", label: "Morning Light", icon: Sun },
                  { key: "afternoon_stroll", label: "Afternoon Stroll", icon: Coffee },
                  { key: "evening_sundown", label: "Sundown Shield", icon: Sunset },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = circadianFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setCircadianFilter(tab.key as any)}
                      className={`btn-tactile inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-black cursor-pointer shadow-2xs transition-colors ${
                        isActive
                          ? "border-black bg-amber-300 text-ink shadow-xs"
                          : "border-black/20 bg-slate-50 text-ink-secondary hover:bg-amber-100 hover:text-ink"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {filteredCapsules.map((cap) => {
                const isActive = cap.id === activeCapsule.id;
                return (
                  <button
                    key={cap.id}
                    type="button"
                    onClick={() => {
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
                      <img
                        src={cap.photoUrl}
                        alt={cap.title}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-tea/30 border-2 border-tea rounded-lg pointer-events-none" />
                      )}
                      {cap.circadianPhase && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[8px] font-black text-amber-300 uppercase">
                          {cap.circadianPhase === "morning_rise" ? "Morning" : cap.circadianPhase === "afternoon_stroll" ? "Afternoon" : "Sundown"}
                        </span>
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
    </div>
  );
}
