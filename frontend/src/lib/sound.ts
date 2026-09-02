import { LOCALE_MAP } from "./i18n";

// ---------------------------------------------------------------------------
// Voice cache & initialization — loads voices asynchronously and repopulates
// on `voiceschanged` event so utterances always have access to native voices.
// ---------------------------------------------------------------------------
let cachedVoices: SpeechSynthesisVoice[] = [];

export function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  if (voices && voices.length > 0) cachedVoices = voices;
  return cachedVoices;
}

function initVoiceCache(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  loadVoices();
  if ("onvoiceschanged" in window.speechSynthesis) {
    window.speechSynthesis.onvoiceschanged = () => {
      cachedVoices = window.speechSynthesis.getVoices();
    };
  }
}

// Persistent reference to prevent Chromium / WebKit Garbage Collection mid-speech
let _activeUtterance: SpeechSynthesisUtterance | null = null;
let _speechResumeTimer: ReturnType<typeof setInterval> | null = null;

// Multi-tier regional language fallbacks for Indian languages
const VOICE_TIERS: Record<string, string[]> = {
  as: ["as-in", "as", "bn-in", "bn", "hi-in", "hi", "en-in", "en-gb", "en-us"],
  hi: ["hi-in", "hi", "en-in", "en-us"],
  mr: ["mr-in", "mr", "hi-in", "hi", "en-in", "en-us"],
  bn: ["bn-in", "bn", "hi-in", "hi", "en-in", "en-us"],
  ne: ["ne-in", "ne", "hi-in", "hi", "en-in", "en-us"],
  mni: ["mni-in", "mni", "hi-in", "hi", "bn-in", "bn", "en-in", "en-us"],
  lus: ["lus-in", "lus", "hi-in", "hi", "en-in", "en-us"],
  kha: ["kha-in", "kha", "hi-in", "hi", "en-in", "en-us"],
  brx: ["brx-in", "brx", "hi-in", "hi", "as-in", "as", "en-in", "en-us"],
  grt: ["grt-in", "grt", "hi-in", "hi", "en-in", "en-us"],
  en: ["en-in", "en-us", "en-gb", "en"],
};

const LANG_BY_TAG: Record<string, string> = {
  "as-in": "as",
  as: "as",
  "hi-in": "hi",
  hi: "hi",
  "mr-in": "mr",
  mr: "mr",
  "bn-in": "bn",
  bn: "bn",
  "ne-in": "ne",
  ne: "ne",
  "mni-in": "mni",
  mni: "mni",
  "lus-in": "lus",
  lus: "lus",
  "kha-in": "kha",
  kha: "kha",
  "brx-in": "brx",
  brx: "brx",
  "grt-in": "grt",
  grt: "grt",
  "en-in": "en",
  "en-us": "en",
  "en-gb": "en",
  en: "en",
};

function toLang(locale: string): string {
  const value = locale.toLowerCase();
  return LANG_BY_TAG[value] ?? value.split("-")[0] ?? "en";
}

export function pickVoice(locale: string): SpeechSynthesisVoice | null {
  const voices = loadVoices();
  if (voices.length === 0) return null;
  const lang = toLang(locale) in LANG_BY_TAG ? toLang(locale) : "en";
  const candidates = VOICE_TIERS[lang] ?? VOICE_TIERS.en;

  for (const tag of candidates) {
    const match = voices.find(
      (v) => v.lang.toLowerCase() === tag.toLowerCase()
    );
    if (match) return match;
  }

  // Any voice starting with language prefix
  const primary = (candidates[0] ?? "en").split("-")[0];
  const prefixMatch = voices.find((v) =>
    v.lang.toLowerCase().startsWith(primary)
  );
  if (prefixMatch) return prefixMatch;

  const english = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
  return english ?? voices[0] ?? null;
}

let _activeAudioElement: HTMLAudioElement | null = null;

// ---------------------------------------------------------------------------
// Speech synthesis engine with Hybrid Neural Stream + Web Speech Fallback
// ---------------------------------------------------------------------------
export function speakText(
  text: string,
  locale = "en",
  rate = 0.82,
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (typeof window === "undefined" || !text) {
    onEnd?.();
    return;
  }

  // Resume Web Audio context if suspended
  ensureAudioContext();

  // Stop any currently playing audio stream or speech
  stopSpeaking();

  // If muted or 0 volume, complete immediately
  if (!_settings.enabled || _settings.volume <= 0) {
    onStart?.();
    setTimeout(() => onEnd?.(), Math.max(1200, text.length * 60));
    return;
  }

  // Local fallback runner using native Web Speech API
  const fallbackToWebSpeech = () => {
    if (!("speechSynthesis" in window)) {
      onEnd?.();
      return;
    }

    const synth = window.speechSynthesis;
    try {
      synth.cancel();
      if (synth.paused) synth.resume();
    } catch {
      // Ignore
    }

    setTimeout(() => {
      try {
        if (synth.paused) synth.resume();

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = pickVoice(locale);
        if (voice) utterance.voice = voice;
        utterance.lang = voice ? voice.lang : (LOCALE_MAP[locale] ?? "en-IN");
        utterance.rate = rate;
        utterance.pitch = 1.02;
        utterance.volume = Math.max(0.1, _settings.volume);

        duck();

        utterance.onstart = () => {
          onStart?.();
          if (_speechResumeTimer) clearInterval(_speechResumeTimer);
          _speechResumeTimer = setInterval(() => {
            if (synth.speaking && !synth.paused) {
              synth.resume();
            }
          }, 4500);
        };

        utterance.onend = () => {
          if (_speechResumeTimer) {
            clearInterval(_speechResumeTimer);
            _speechResumeTimer = null;
          }
          _activeUtterance = null;
          unduck();
          onEnd?.();
        };

        utterance.onerror = () => {
          if (_speechResumeTimer) {
            clearInterval(_speechResumeTimer);
            _speechResumeTimer = null;
          }
          _activeUtterance = null;
          unduck();
          onEnd?.();
        };

        _activeUtterance = utterance;
        if (typeof window !== "undefined") {
          (window as unknown as { _activeCogniUtterance?: SpeechSynthesisUtterance })._activeCogniUtterance = utterance;
        }

        synth.speak(utterance);
      } catch {
        _activeUtterance = null;
        unduck();
        onEnd?.();
      }
    }, 25);
  };

  // Attempt Neural Audio Stream from Next.js /api/tts endpoint
  try {
    const audioUrl = `/api/tts?text=${encodeURIComponent(text.slice(0, 200))}&lang=${encodeURIComponent(locale)}`;
    const audio = new Audio(audioUrl);
    audio.volume = Math.max(0.1, _settings.volume);

    audio.onplay = () => {
      duck();
      onStart?.();
    };

    audio.onended = () => {
      _activeAudioElement = null;
      unduck();
      onEnd?.();
    };

    audio.onerror = () => {
      _activeAudioElement = null;
      // Graceful fallback to client-side Web Speech
      fallbackToWebSpeech();
    };

    _activeAudioElement = audio;
    audio.play().catch(() => {
      // If autoplay policy or network blocked audio element, fallback to Web Speech
      _activeAudioElement = null;
      fallbackToWebSpeech();
    });
  } catch {
    fallbackToWebSpeech();
  }
}

export function stopSpeaking(): void {
  if (_activeAudioElement) {
    try {
      _activeAudioElement.pause();
      _activeAudioElement.currentTime = 0;
    } catch {
      // Ignore
    }
    _activeAudioElement = null;
  }
  if (_speechResumeTimer) {
    clearInterval(_speechResumeTimer);
    _speechResumeTimer = null;
  }
  _activeUtterance = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }
  unduck();
}

export function speechSupported(locale = "en"): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }
  const voices = loadVoices();
  if (voices.length === 0) return true; // voices still loading
  const lang = toLang(locale);
  return voices.some((v) => v.lang.toLowerCase().startsWith(lang));
}

initVoiceCache();

// ===========================================================================
// Procedural Web Audio Engine — Zero external audio files, 100% offline-safe
// ===========================================================================

const STORAGE_KEY = "cognicare-audio";

interface AudioSettings {
  volume: number; // 0..1
  enabled: boolean;
}

function loadSettings(): AudioSettings {
  if (typeof window === "undefined") return { volume: 0.8, enabled: true };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AudioSettings>;
      return {
        volume: Math.max(0, Math.min(1, parsed.volume ?? 0.8)),
        enabled: parsed.enabled !== false,
      };
    }
  } catch {
    // Storage fallback
  }
  return { volume: 0.8, enabled: true };
}

function saveSettings(s: AudioSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    // Quota fallback
  }
}

const _settings = loadSettings();

export function getVolume(): number {
  return _settings.volume;
}

export function isEnabled(): boolean {
  return _settings.enabled;
}

export function setVolume(v: number): void {
  _settings.volume = Math.max(0, Math.min(1, v));
  saveSettings(_settings);
  updateMasterGain();
}

export function setSoundsEnabled(on: boolean): void {
  _settings.enabled = on;
  saveSettings(_settings);
  updateMasterGain();
}

export function toggleSounds(): boolean {
  setSoundsEnabled(!_settings.enabled);
  return _settings.enabled;
}

// ---------------------------------------------------------------------------
// AudioContext singleton with Master Gain & Dynamic Compression Graph
// ---------------------------------------------------------------------------
let _ctx: AudioContext | null = null;
let _masterGain: GainNode | null = null;
let _compressor: DynamicsCompressorNode | null = null;
let _duckGain: GainNode | null = null;

const DUCK_AMOUNT = 0.35; // Duck SFX to 35% during speech
const DUCK_RAMP = 0.15;

export function ensureAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx && _ctx.state !== "closed") {
    if (_ctx.state === "suspended") {
      void _ctx.resume();
    }
    return _ctx;
  }
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return null;

    const ctx = new AudioContextClass();

    // Compressor prevents harsh clipping during layered game audio
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.15;
    compressor.connect(ctx.destination);

    // Master gain
    const masterGain = ctx.createGain();
    masterGain.gain.value = _settings.enabled ? _settings.volume : 0;
    masterGain.connect(compressor);

    // Duck node
    const duckGain = ctx.createGain();
    duckGain.gain.value = 1;
    duckGain.connect(masterGain);

    _ctx = ctx;
    _compressor = compressor;
    _masterGain = masterGain;
    _duckGain = duckGain;

    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    return ctx;
  } catch {
    return null;
  }
}

/** Global user-gesture audio unlocker for modern browser autoplay policies */
export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  const ctx = ensureAudioContext();
  if (ctx && ctx.state === "suspended") {
    void ctx.resume();
  }
  loadVoices();
}

// Auto-register passive unlock listeners on first interaction
if (typeof window !== "undefined") {
  const handleFirstInteraction = () => {
    unlockAudio();
    window.removeEventListener("pointerdown", handleFirstInteraction);
    window.removeEventListener("touchstart", handleFirstInteraction);
    window.removeEventListener("keydown", handleFirstInteraction);
    window.removeEventListener("click", handleFirstInteraction);
  };
  window.addEventListener("pointerdown", handleFirstInteraction, { passive: true });
  window.addEventListener("touchstart", handleFirstInteraction, { passive: true });
  window.addEventListener("keydown", handleFirstInteraction, { passive: true });
  window.addEventListener("click", handleFirstInteraction, { passive: true });
}

function updateMasterGain(): void {
  if (_masterGain && _ctx) {
    const target = _settings.enabled ? _settings.volume : 0;
    _masterGain.gain.setTargetAtTime(target, _ctx.currentTime, 0.01);
  }
}

function duck(): void {
  if (!_duckGain || !_ctx) return;
  _duckGain.gain.setTargetAtTime(DUCK_AMOUNT, _ctx.currentTime, DUCK_RAMP);
}

function unduck(): void {
  if (!_duckGain || !_ctx) return;
  _duckGain.gain.setTargetAtTime(1, _ctx.currentTime, DUCK_RAMP);
}

// ---------------------------------------------------------------------------
// Tone Primitives
// ---------------------------------------------------------------------------
function playNote(
  freq: number,
  startAt: number,
  duration: number,
  gainValue = 0.2,
  type: OscillatorType = "sine"
): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_duckGain) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(gainValue, startAt + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
    osc.connect(gain);
    gain.connect(_duckGain);
    osc.start(startAt);
    osc.stop(startAt + duration + 0.02);
  } catch {
    // Audio node error fallback
  }
}

// ---------------------------------------------------------------------------
// Tactile Feedback & Game Sound Library
// ---------------------------------------------------------------------------

/** Button press / chunky haptic thock — 130->45 Hz descending sweep */
export function playPress(): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_duckGain) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(130, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
    osc.connect(gain);
    gain.connect(_duckGain);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch {
    // Fallback
  }
}

/** Subtle soft tap */
export function playTapFeedback(): void {
  playNote(350, ensureAudioContext()?.currentTime ?? 0, 0.035, 0.1);
}

export function playMechanicalClick(): void {
  playPress();
}

/** Correct answer — C5->G5 warm rising two-tone */
export function playCorrect(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(523.25, now, 0.35, 0.2);
  playNote(783.99, now + 0.13, 0.4, 0.24);
}

export function playSuccessChime(): void {
  playCorrect();
}

/** Gentle encouragement — E5->A5 */
export function playEncourage(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(659.25, now, 0.55, 0.16);
  playNote(880, now + 0.22, 0.8, 0.18);
}

export function playEncouragementChime(): void {
  playEncourage();
}

/** Task complete — 4-note ascending fanfare with sparkle */
export function playComplete(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(523.25, now, 0.3, 0.18); // C5
  playNote(659.25, now + 0.1, 0.3, 0.18); // E5
  playNote(783.99, now + 0.2, 0.3, 0.2); // G5
  playNote(1046.5, now + 0.3, 0.6, 0.22); // C6
  playNote(1318.51, now + 0.35, 0.15, 0.06, "triangle");
  playNote(1567.98, now + 0.45, 0.2, 0.05, "triangle");
}

/** Non-startling gentle incorrect tone */
export function playIncorrect(): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_duckGain) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(210, now + 0.22);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(_duckGain);
    osc.start(now);
    osc.stop(now + 0.24);
  } catch {
    // Fallback
  }
}

/** Error / failure tone */
export function playError(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(180, now, 0.2, 0.15);
  playNote(140, now + 0.15, 0.35, 0.12);
}

/** Reminder chime */
export function playRemind(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(659.25, now, 0.25, 0.18); // E5
  playNote(880, now + 0.1, 0.25, 0.18); // A5
  playNote(659.25, now + 0.22, 0.2, 0.14); // E5
}

/** QR scan success */
export function playScanSuccess(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(659.25, now, 0.2, 0.2); // E5
  playNote(783.99, now + 0.08, 0.2, 0.2); // G5
  playNote(1046.5, now + 0.16, 0.35, 0.22); // C6
}

/** Resonant Monastery Bell / Singing Bowl */
export function playMonasteryBell(freq = 440): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_duckGain) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.22, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    osc.connect(gain);
    gain.connect(_duckGain);
    osc.start(now);
    osc.stop(now + 2.1);
  } catch {
    playPress();
  }
}

export function playChimeTone(freq = 440): void {
  playMonasteryBell(freq);
}

/** Bamboo Dance Rhythm Clap */
export function playBambooClap(isOpen: boolean): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_duckGain) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(isOpen ? 480 : 180, now);
    osc.frequency.exponentialRampToValueAtTime(isOpen ? 220 : 80, now + 0.16);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(_duckGain);
    osc.start(now);
    osc.stop(now + 0.2);
  } catch {
    playPress();
  }
}

/** Resonant Ethnic Drum Beat (Bihu Dhol / Khasi Ksing) */
export function playDholBeat(accent = false): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_duckGain) return;
  try {
    const now = ctx.currentTime;

    // 1. Deep Bass Resonance
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(accent ? 145 : 120, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.32);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(320, now);

    gain.gain.setValueAtTime(accent ? 0.8 : 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(_duckGain);
    osc.start(now);
    osc.stop(now + 0.36);

    // 2. High Rim Snap
    const rimOsc = ctx.createOscillator();
    const rimGain = ctx.createGain();
    rimOsc.type = "triangle";
    rimOsc.frequency.setValueAtTime(accent ? 360 : 280, now);
    rimOsc.frequency.exponentialRampToValueAtTime(160, now + 0.12);
    rimGain.gain.setValueAtTime(accent ? 0.35 : 0.2, now);
    rimGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    rimOsc.connect(rimGain);
    rimGain.connect(_duckGain);
    rimOsc.start(now);
    rimOsc.stop(now + 0.15);
  } catch {
    playPress();
  }
}

/** Tea Leaf Pluck */
export function playLeafPluck(): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_duckGain) return;
  const now = ctx.currentTime;
  playNote(620, now, 0.03, 0.12, "triangle");
  playNote(840, now + 0.02, 0.05, 0.16, "sine");
  playNote(420, now + 0.05, 0.04, 0.08, "sine");
}

/** Water Ripple & Lotus Bloom */
export function playWaterRipple(): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_duckGain) return;
  const now = ctx.currentTime;
  const baseFreq = 523.25 + Math.random() * 200;
  playNote(baseFreq, now, 0.4, 0.09, "sine");
  playNote(baseFreq * 1.5, now + 0.08, 0.6, 0.07, "triangle");
}

/** Wooden Loom Shuttle Clack */
export function playShuttleClack(): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_duckGain) return;
  const now = ctx.currentTime;
  playNote(480, now, 0.04, 0.15, "triangle");
  playNote(260, now + 0.05, 0.08, 0.18, "sine");
}

/** Vintage Radio Tuning Chime */
export function playRadioTune(): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_duckGain) return;
  const now = ctx.currentTime;
  playNote(440, now, 0.12, 0.08, "sine");
  playNote(880, now + 0.08, 0.25, 0.14, "sine");
  playNote(1320, now + 0.18, 0.4, 0.12, "triangle");
}

/** Whispering Mountain Breeze */
export function playPineBreeze(): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_duckGain) return;
  const now = ctx.currentTime;
  playNote(392.0, now, 0.8, 0.08, "triangle");
  playNote(587.33, now + 0.15, 0.9, 0.09, "sine");
  playNote(783.99, now + 0.35, 1.2, 0.06, "sine");
}

/** Kitchen Sizzle */
export function playSizzle(): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_duckGain) return;
  const now = ctx.currentTime;
  playNote(280, now, 0.15, 0.14, "triangle");
  playNote(340, now + 0.08, 0.2, 0.12, "sine");
}

/** Gentle C major arpeggio for calming */
export function playCalmTone(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [523.25, 587.33, 659.25, 783.99];
  notes.forEach((freq, i) => {
    playNote(freq, now + i * 0.45, 1.8, 0.1);
  });
}

/** Life story folk melody */
export function playLifeSong(): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_duckGain) return;
  const now = ctx.currentTime;
  playNote(220, now, 7.5, 0.05, "sine");
  playNote(440, now, 1.8, 0.11, "sine");
  playNote(523.25, now + 1.1, 1.5, 0.09, "triangle");
  playNote(587.33, now + 2.0, 1.4, 0.11, "triangle");
  playNote(659.25, now + 2.9, 1.7, 0.11, "triangle");
  playNote(587.33, now + 4.1, 1.3, 0.08, "triangle");
  playNote(523.25, now + 5.1, 2.6, 0.09, "sine");
}

/** Landmark Arrival Chime */
export function playLandmarkChime(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(523.25, now, 1.8, 0.15, "sine");
  playNote(1046.5, now, 1.2, 0.08, "triangle");
  playNote(1567.98, now + 0.05, 0.9, 0.04, "sine");
}

/** Footstep Tap */
export function playStepSound(): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_duckGain) return;
  const now = ctx.currentTime;
  playNote(120, now, 0.08, 0.12, "sine");
  playNote(85, now + 0.02, 0.06, 0.08, "sine");
}

// ---------------------------------------------------------------------------
// Ambient Soundscape Loop
// ---------------------------------------------------------------------------
let _ambientInterval: ReturnType<typeof setInterval> | null = null;
let _ambientGain: GainNode | null = null;

export function playAmbientLoop(): void {
  stopAmbientLoop();

  const ctx = ensureAudioContext();
  if (!ctx || !_duckGain) return;

  const loopGain = ctx.createGain();
  loopGain.gain.value = 0;
  loopGain.gain.setTargetAtTime(0.15, ctx.currentTime, 1.5);
  loopGain.connect(_duckGain);
  _ambientGain = loopGain;

  // Filtered rain
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const playRain = () => {
    if (!_ambientGain || !_ctx) return;
    try {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer;
      src.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 600;
      filter.Q.value = 0.5;

      const segGain = ctx.createGain();
      segGain.gain.value = 0.12;

      src.connect(filter);
      filter.connect(segGain);
      segGain.connect(_ambientGain);
      src.start();
      src.stop(ctx.currentTime + 8);
    } catch {
      // Ignore
    }
  };

  playRain();

  _ambientInterval = setInterval(() => {
    if (Math.random() < 0.5 && _ambientGain && _ctx) {
      const baseFreq = 1200 + Math.random() * 800;
      const now = _ctx.currentTime;
      playNote(baseFreq, now, 0.06, 0.03, "triangle");
      playNote(baseFreq * 1.2, now + 0.05, 0.06, 0.03, "triangle");
    }
  }, 4500);
}

export function stopAmbientLoop(): void {
  if (_ambientInterval) {
    clearInterval(_ambientInterval);
    _ambientInterval = null;
  }
  if (_ambientGain && _ctx) {
    _ambientGain.gain.setTargetAtTime(0, _ctx.currentTime, 0.6);
    const oldGain = _ambientGain;
    setTimeout(() => {
      try {
        oldGain.disconnect();
      } catch {
        // Disconnected
      }
    }, 2000);
    _ambientGain = null;
  }
}
