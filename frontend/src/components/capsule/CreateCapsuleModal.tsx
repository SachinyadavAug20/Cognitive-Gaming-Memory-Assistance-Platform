"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Volume2,
  Image as ImageIcon,
  Heart,
  Music,
  CloudRain,
  Waves,
  Bird,
  Bell,
  Store,
  Check,
  Mic,
  MicOff,
  Square,
  Play,
  Palette,
} from "lucide-react";
import type {
  MemoryCapsule,
  AmbientSoundType,
  AtmosphereParticleType,
  CapsuleEmotion,
  MemoryColorFilter,
  MemoryHotspot,
} from "@/types/capsule";
import { playCapsuleSoundscape, stopCapsuleSoundscape, playFamilyVoiceNote, stopFamilyVoiceNote } from "@/lib/capsuleSoundscapes";
import { saveCustomCapsule } from "@/data/defaultCapsules";

interface CreateCapsuleModalProps {
  patientId: number;
  open: boolean;
  onClose: () => void;
  onCreated: (capsule: MemoryCapsule) => void;
}

const PRESET_PLACES = [
  {
    name: "Silpukhuri Courtyard, Guwahati",
    url: "/sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg",
    label: "Courtyard Verandah",
  },
  {
    name: "Hari Namghar, Assam",
    url: "/sample-images/patient_1_biren_borah/places/03_silpukhuri_hari_namghar.jpg",
    label: "Prayer Namghar",
  },
  {
    name: "Cathedral of Mary Help of Christians, Shillong",
    url: "/sample-images/patient_2_mary_nongrum/places/03_cathedral_mary_help_christians.jpg",
    label: "Blue Cathedral",
  },
  {
    name: "Nongrim Hills Cottage, Shillong",
    url: "/sample-images/patient_2_mary_nongrum/places/01_home_nongrim_hills_cottage.jpg",
    label: "Heritage Cottage",
  },
  {
    name: "Dighalipukhuri Lake Park, Assam",
    url: "/sample-images/patient_1_biren_borah/places/05_dighalipukhuri_lake_park.jpg",
    label: "Riverbank Park",
  },
];

const SOUNDSCAPES: { type: AmbientSoundType; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: "birds", label: "Morning Birds", icon: <Bird className="h-4 w-4 text-emerald-700" />, desc: "Singing Himalayan birds in bamboo grove" },
  { type: "rain", label: "Monsoon Rain", icon: <CloudRain className="h-4 w-4 text-emerald-700" />, desc: "Gentle rain patter on cottage tin roof" },
  { type: "river", label: "River Waters", icon: <Waves className="h-4 w-4 text-teal-700" />, desc: "Brahmaputra water waves & evening breeze" },
  { type: "namghar", label: "Sacred Bells", icon: <Bell className="h-4 w-4 text-amber-700" />, desc: "Bronze bell chimes & evening prayer resonance" },
  { type: "flute", label: "Bamboo Flute", icon: <Music className="h-4 w-4 text-teal-700" />, desc: "Peaceful pentatonic raga flute notes" },
  { type: "bazaar", label: "Village Bazaar", icon: <Store className="h-4 w-4 text-orange-700" />, desc: "Distant friendly market chatter" },
];

export function CreateCapsuleModal({
  patientId,
  open,
  onClose,
  onCreated,
}: CreateCapsuleModalProps) {
  const [title, setTitle] = useState("");
  const [locationName, setLocationName] = useState(PRESET_PLACES[0].name);
  const [seasonOrTime, setSeasonOrTime] = useState("Morning Sunlight • 9:00 AM");
  const [photoUrl, setPhotoUrl] = useState(PRESET_PLACES[0].url);
  const [familyMemberName, setFamilyMemberName] = useState("");
  const [relationship, setRelationship] = useState("Daughter");
  const [voiceNoteText, setVoiceNoteText] = useState("");
  const [ambientSoundType, setAmbientSoundType] = useState<AmbientSoundType>("birds");
  const [atmosphereParticle, setAtmosphereParticle] = useState<AtmosphereParticleType>("sun_motes");
  const [colorFilter, setColorFilter] = useState<MemoryColorFilter>("golden_hour");
  const [emotionTag, setEmotionTag] = useState<CapsuleEmotion>("peaceful");
  const [testingAudio, setTestingAudio] = useState(false);
  const [testingVoice, setTestingVoice] = useState(false);

  // In-Browser Family Mic Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecorded, setIsPlayingRecorded] = useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const timerIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  if (!open) return null;

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
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.warn("Could not access mic:", err);
      alert("Microphone access is needed to record a family voice note.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const playRecordedVoice = () => {
    if (!recordedAudioUrl) return;
    const a = new Audio(recordedAudioUrl);
    setIsPlayingRecorded(true);
    a.onended = () => setIsPlayingRecorded(false);
    a.onerror = () => setIsPlayingRecorded(false);
    a.play().catch(() => setIsPlayingRecorded(false));
  };

  const handleTestSound = (st: AmbientSoundType) => {
    if (testingAudio && ambientSoundType === st) {
      stopCapsuleSoundscape();
      setTestingAudio(false);
    } else {
      playCapsuleSoundscape(st, 0.4);
      setAmbientSoundType(st);
      setTestingAudio(true);
    }
  };

  const handleTestVoice = () => {
    if (testingVoice) {
      stopFamilyVoiceNote();
      setTestingVoice(false);
    } else {
      if (!voiceNoteText.trim() && !recordedAudioUrl) return;
      setTestingVoice(true);
      playFamilyVoiceNote(
        voiceNoteText,
        "as",
        () => setTestingVoice(true),
        () => setTestingVoice(false),
        recordedAudioUrl
      );
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    stopCapsuleSoundscape();
    stopFamilyVoiceNote();

    const newCapsule: MemoryCapsule = {
      id: `capsule-custom-${Date.now()}`,
      patientId: patientId || 2,
      title: title.trim() || "Cherished Family Afternoon",
      locationName: locationName.trim() || "Family Homestead",
      seasonOrTime: seasonOrTime.trim() || "Peaceful Day",
      photoUrl: photoUrl || PRESET_PLACES[0].url,
      familyMemberName: familyMemberName.trim() || "Loving Family",
      relationship: relationship.trim() || "Family",
      voiceNoteText:
        voiceNoteText.trim() ||
        "We are sitting together in the warm sun. You are surrounded by love and peace.",
      voiceAudioUrl: recordedAudioUrl,
      ambientSoundType,
      atmosphereParticle,
      colorFilter,
      hotspots: [
        {
          id: `spot-${Date.now()}-1`,
          x: -0.25,
          y: 0.1,
          label: "Heart of this Memory",
          detail: `Cherished moment captured with ${familyMemberName || "family"} at ${locationName || "home"}.`,
          soundCue: "chime",
        },
      ],
      guidedPrompts: {
        initialPrompt: `Look around at this cherished moment at ${locationName || "home"}.`,
        sensoryPrompt: `Listen to the peaceful sounds all around you. Your ${relationship} ${familyMemberName} is here.`,
        reflectionPrompt: `Every memory made here is held safely with love. You are home.`,
      },
      emotionTag,
      createdAt: new Date().toISOString(),
      isCustom: true,
    };

    saveCustomCapsule(newCapsule);
    onCreated(newCapsule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border-4 border-black bg-[#FAF6F0] p-6 shadow-[8px_8px_0px_#000]">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black/10 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-black bg-amber-200 shadow-xs">
              <Sparkles className="h-5 w-5 text-amber-900" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-black text-ink">
                Create 3D Memory Scene
              </h2>
              <p className="text-xs font-semibold text-ink-secondary">
                Add photos, ambient sounds, and voice recordings for gentle reminiscing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              stopCapsuleSoundscape();
              stopFamilyVoiceNote();
              onClose();
            }}
            className="rounded-xl border-2 border-black p-1.5 hover:bg-black/10 transition-colors"
          >
            <X className="h-5 w-5 text-ink" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Title & Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-ink-secondary mb-1">
                Memory Capsule Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Courtyard Tea with Pratima"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-tea"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-ink-secondary mb-1">
                Season / Time of Day
              </label>
              <input
                type="text"
                placeholder="e.g. Winter Morning Sunlight • 9:00 AM"
                value={seasonOrTime}
                onChange={(e) => setSeasonOrTime(e.target.value)}
                className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-tea"
              />
            </div>
          </div>

          {/* Photo Selection */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-ink-secondary mb-1.5">
              Select Memory Photograph *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {PRESET_PLACES.map((p) => {
                const selected = photoUrl === p.url;
                return (
                  <button
                    key={p.url}
                    type="button"
                    onClick={() => {
                      setPhotoUrl(p.url);
                      setLocationName(p.name);
                    }}
                    className={`relative rounded-xl border-2 overflow-hidden text-left transition-all p-1 cursor-pointer ${
                      selected ? "border-tea bg-tea-light/40 shadow-xs scale-[1.02]" : "border-black/30 bg-white hover:border-black"
                    }`}
                  >
                    <div className="h-14 w-full rounded-lg overflow-hidden bg-surface-muted mb-1">
                      <img src={p.url} alt={p.label} className="h-full w-full object-cover" />
                    </div>
                    <span className="text-[10px] font-black text-ink block truncate">{p.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Family Member & Relationship */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-ink-secondary mb-1">
                Family Member Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pratima Borah / Daphisha"
                value={familyMemberName}
                onChange={(e) => setFamilyMemberName(e.target.value)}
                className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-tea"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-ink-secondary mb-1">
                Relationship
              </label>
              <select
                value={relationship}
                onChange={(e) => setRelationship(e.target.value)}
                className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-tea"
              >
                <option value="Wife">Wife</option>
                <option value="Husband">Husband</option>
                <option value="Daughter">Daughter</option>
                <option value="Son">Son</option>
                <option value="Granddaughter">Granddaughter</option>
                <option value="Grandson">Grandson</option>
                <option value="Sister">Sister</option>
                <option value="Brother">Brother</option>
              </select>
            </div>
          </div>

          {/* Family Voice Recording & Spoken Text */}
          <div className="rounded-2xl border-2 border-black bg-amber-50/70 p-3.5 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="block text-[11px] font-black uppercase tracking-wider text-amber-950">
                Family Voice Note (Record Live or Text) *
              </label>

              <div className="flex items-center gap-2">
                {/* Live Mic Recorder Button */}
                {!isRecording ? (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border border-rose-800 bg-rose-50 px-2.5 py-1 text-[11px] font-black text-rose-900 shadow-2xs hover:bg-rose-100 cursor-pointer"
                  >
                    <Mic className="h-3.5 w-3.5 text-rose-600" />
                    <span>{recordedAudioUrl ? "Re-record Voice" : "Record Live Voice"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="btn-tactile inline-flex items-center gap-1.5 rounded-xl border border-black bg-rose-600 px-2.5 py-1 text-[11px] font-black text-white shadow-2xs animate-pulse cursor-pointer"
                  >
                    <Square className="h-3 w-3 fill-white" />
                    <span>Stop Recording ({recordingSeconds}s)</span>
                  </button>
                )}

                {/* Play Recorded Audio Preview */}
                {recordedAudioUrl && !isRecording && (
                  <button
                    type="button"
                    onClick={playRecordedVoice}
                    className="btn-tactile inline-flex items-center gap-1 rounded-xl border border-emerald-800 bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-950 shadow-2xs cursor-pointer"
                  >
                    <Play className="h-3 w-3 fill-emerald-900" />
                    <span>{isPlayingRecorded ? "Playing..." : "Listen Recording"}</span>
                  </button>
                )}
              </div>
            </div>

            <textarea
              required={!recordedAudioUrl}
              rows={2}
              placeholder="e.g. Deuta, look at our courtyard mango tree. The red tea is warm and waiting for you..."
              value={voiceNoteText}
              onChange={(e) => setVoiceNoteText(e.target.value)}
              className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-tea placeholder:text-ink-secondary/60"
            />
            <div className="flex items-center justify-between text-[10px] font-semibold text-amber-900/80">
              <span>{recordedAudioUrl ? "Live voice clip recorded and attached." : "Type a warm reassuring message (or click Record Live Voice above)."}</span>
              <button
                type="button"
                onClick={handleTestVoice}
                disabled={!voiceNoteText.trim() && !recordedAudioUrl}
                className="inline-flex items-center gap-1 text-[11px] font-black text-tea hover:underline disabled:opacity-40 cursor-pointer"
              >
                <Volume2 className="h-3.5 w-3.5" />
                <span>{testingVoice ? "Stop Preview" : "Test Audio"}</span>
              </button>
            </div>
          </div>

          {/* Cinematic Memory Atmosphere & Color Filter */}
          <div className="rounded-2xl border-2 border-black bg-white p-3 space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-ink-secondary">
              <Palette className="h-3.5 w-3.5 text-tea" />
              <span>Nostalgia Lighting & Color Grade</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
              {[
                { id: "golden_hour", label: "Golden Hour", desc: "Warm Amber Sunlight" },
                { id: "monsoon_emerald", label: "Monsoon", desc: "Lush Rainy Green" },
                { id: "kodachrome", label: "Kodachrome", desc: "Vintage 1970s Film" },
                { id: "twilight", label: "Twilight", desc: "Gentle Indigo Calm" },
                { id: "natural", label: "Natural", desc: "Standard Balance" },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setColorFilter(f.id as MemoryColorFilter)}
                  className={`rounded-xl border-2 p-1.5 text-center cursor-pointer transition-all ${
                    colorFilter === f.id
                      ? "border-tea bg-tea-light/50 font-black shadow-2xs"
                      : "border-black/20 bg-surface hover:border-black font-semibold"
                  }`}
                >
                  <span className="text-[10px] text-ink block">{f.label}</span>
                  <span className="text-[8px] text-ink-secondary block truncate">{f.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ambient Soundscape Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-ink-secondary">
                Ambient Soundscape (Web Audio Synthesizer)
              </label>
              {testingAudio && (
                <span className="text-[10px] font-black text-emerald-800 animate-pulse flex items-center gap-1">
                  Playing Soundscape Preview
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SOUNDSCAPES.map((s) => {
                const isSelected = ambientSoundType === s.type;
                return (
                  <button
                    key={s.type}
                    type="button"
                    onClick={() => handleTestSound(s.type)}
                    className={`flex items-center gap-2 rounded-xl border-2 p-2.5 text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-700 bg-emerald-100/70 shadow-xs"
                        : "border-black/20 bg-white hover:border-black"
                    }`}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-black/20 bg-surface shadow-2xs">
                      {s.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-black text-ink truncate">{s.label}</span>
                        {isSelected && <Check className="h-3 w-3 text-emerald-800 shrink-0" />}
                      </div>
                      <span className="text-[9px] font-semibold text-ink-secondary block truncate">{s.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Atmosphere Effect & Emotion */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-ink-secondary mb-1">
                3D Atmosphere Particles
              </label>
              <select
                value={atmosphereParticle}
                onChange={(e) => setAtmosphereParticle(e.target.value as AtmosphereParticleType)}
                className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-tea"
              >
                <option value="sun_motes">Golden Sun Motes (Warm & Cheerful)</option>
                <option value="gentle_rain">Monsoon Raindrops (Calming & Soothing)</option>
                <option value="flower_petals">Falling Flower Petals (Nostalgic)</option>
                <option value="river_mist">River Twilight Mist (Serene)</option>
                <option value="fireflies">Evening Fireflies (Whimsical & Wonder)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black uppercase tracking-wider text-ink-secondary mb-1">
                Therapeutic Mood Intention
              </label>
              <select
                value={emotionTag}
                onChange={(e) => setEmotionTag(e.target.value as CapsuleEmotion)}
                className="w-full rounded-xl border-2 border-black bg-white px-3 py-2 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-tea"
              >
                <option value="peaceful">Peaceful (Reduces Anxiety & Restlessness)</option>
                <option value="comforting">Comforting (Reassures Loved Presence)</option>
                <option value="nostalgic">Nostalgic (Stimulates Long-Term Memory)</option>
                <option value="joyful">Joyful (Lifts Mood & Encourages Smilies)</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black/10">
            <button
              type="button"
              onClick={() => {
                stopCapsuleSoundscape();
                stopFamilyVoiceNote();
                onClose();
              }}
              className="btn-tactile rounded-xl border-2 border-black bg-white px-4 py-2 text-xs font-black text-ink cursor-pointer hover:bg-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-tactile inline-flex items-center gap-2 rounded-xl border-2 border-black bg-tea px-5 py-2 text-xs font-black text-white shadow-[2px_2px_0px_#000] cursor-pointer hover:bg-tea-dark"
            >
              <Sparkles className="h-4 w-4" />
              <span>Save & Seal Capsule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
