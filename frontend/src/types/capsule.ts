export type AmbientSoundType =
  | "rain"
  | "river"
  | "birds"
  | "namghar"
  | "flute"
  | "bazaar";

export type AtmosphereParticleType =
  | "sun_motes"
  | "gentle_rain"
  | "flower_petals"
  | "river_mist"
  | "fireflies";

export type CapsuleEmotion =
  | "peaceful"
  | "nostalgic"
  | "joyful"
  | "comforting";

export interface MemoryHotspot {
  id: string;
  x: number; // -1 .. 1
  y: number; // -1 .. 1
  label: string;
  detail: string;
  soundCue?: "chime" | "teacup" | "water" | "bird";
}

export type MemoryColorFilter =
  | "natural"
  | "golden_hour"
  | "monsoon_emerald"
  | "kodachrome"
  | "twilight";

export interface MemoryCapsule {
  id: string;
  patientId: number;
  title: string;
  locationName: string;
  seasonOrTime: string;
  photoUrl: string;
  familyMemberName: string;
  relationship: string;
  voiceNoteText: string;
  voiceAudioUrl?: string | null;
  ambientSoundType: AmbientSoundType;
  atmosphereParticle: AtmosphereParticleType;
  colorFilter?: MemoryColorFilter;
  hotspots?: MemoryHotspot[];
  guidedPrompts: {
    initialPrompt: string;
    sensoryPrompt: string;
    reflectionPrompt: string;
  };
  emotionTag: CapsuleEmotion;
  createdAt: string;
  isCustom?: boolean;
}

export interface CapsuleTrackingState {
  x: number; // -1 .. 1
  y: number; // -1 .. 1
  isTracking: boolean;
  mode: "webcam" | "pointer";
  sensitivity?: "gentle" | "normal" | "high";
}

export interface CapsuleSessionLog {
  id: string;
  patientId: number;
  capsuleId: string;
  capsuleTitle: string;
  timestamp: string;
  durationSeconds: number;
  headTrackingUsed: boolean;
  engagementScore: number; // 0 - 100%
  caregiverObservation?: "calm" | "joyful" | "nostalgic" | "verbal" | "resting";
}
