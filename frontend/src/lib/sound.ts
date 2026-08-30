import { LOCALE_MAP } from "./i18n";

// ---------------------------------------------------------------------------
// Voice cache — browser speechSynthesis loads voices asynchronously. We cache
// them and repopulate on `voiceschanged` so the first utterance never plays
// with an empty voice list.
// ---------------------------------------------------------------------------
let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) cachedVoices = voices;
  return cachedVoices;
}

function initVoiceCache(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  loadVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    cachedVoices = window.speechSynthesis.getVoices();
  };
}

// Keep the utterance referenced at module scope so Chromium does not garbage
// collect it mid-sentence. `_activeUtterance` is intentionally write-only; the
// underscore prefix keeps eslint's unused-vars rule happy.
let _activeUtterance: SpeechSynthesisUtterance | null = null;

// Multi-tier regional language fallbacks. Assamese falls back to Bengali
// (phonetic cousin), then Hindi, then any English voice.
const VOICE_TIERS: Record<string, string[]> = {
  as: ["as-in", "as", "bn-in", "bn", "hi-in", "hi", "en-in", "en-gb", "en-us"],
  hi: ["hi-in", "hi", "en-in", "en-us"],
  mr: ["mr-in", "mr", "hi-in", "hi", "en-in", "en-us"],
  en: ["en-in", "en-us", "en-gb", "en"],
};

const LANG_BY_TAG: Record<string, string> = {
  "as-in": "as",
  as: "as",
  "hi-in": "hi",
  hi: "hi",
  "mr-in": "mr",
  mr: "mr",
  "en-in": "en",
  "en-us": "en",
  "en-gb": "en",
  en: "en",
};

function toLang(locale: string): string {
  const value = locale.toLowerCase();
  return LANG_BY_TAG[value] ?? value.split("-")[0] ?? "en";
}

function pickVoice(locale: string): SpeechSynthesisVoice | null {
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

  // Last resort: any voice whose language prefix matches the tier head.
  const primary = (candidates[0] ?? "en").split("-")[0];
  const prefixMatch = voices.find((v) =>
    v.lang.toLowerCase().startsWith(primary)
  );
  if (prefixMatch) return prefixMatch;

  const english = voices.find((v) => v.lang.toLowerCase().startsWith("en"));
  return english ?? null;
}

// ---------------------------------------------------------------------------
// Speech synthesis
// ---------------------------------------------------------------------------
export function speakText(
  text: string,
  locale = "en",
  rate = 0.85,
  onStart?: () => void,
  onEnd?: () => void
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onEnd?.();
    return;
  }

  const synth = window.speechSynthesis;
  synth.cancel(); // clear stuck or queued audio

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = pickVoice(locale);
  if (voice) utterance.voice = voice;
  utterance.lang = voice ? voice.lang : (LOCALE_MAP[locale] ?? "en-US");
  utterance.rate = rate; // slow, gentle cadence
  utterance.pitch = 1.05; // warm, soothing tone

  // Duck SFX volume while speaking, restore on end
  duck();

  utterance.onstart = () => onStart?.();
  utterance.onend = () => {
    _activeUtterance = null;
    unduck();
    onEnd?.();
  };
  utterance.onerror = (event) => {
    console.warn("Speech synthesis error:", event.error);
    _activeUtterance = null;
    unduck();
    onEnd?.();
  };

  _activeUtterance = utterance; // prevent GC mid-sentence
  synth.speak(utterance);
}

export function stopSpeaking(): void {
  _activeUtterance = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  unduck();
}

export function speechSupported(locale = "en"): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return false;
  }
  const voices = loadVoices();
  if (voices.length === 0) return true; // voices still loading — assume yes
  const lang = toLang(locale);
  return voices.some((v) => v.lang.toLowerCase().startsWith(lang));
}

initVoiceCache();

// ===========================================================================
// Procedural Web Audio Engine — zero external audio, offline-safe
//
// Design principles (evidence-based for dementia patients):
//   - Low-mid frequency range (200–900 Hz) — elderly lose high-freq sensitivity
//   - Simple, predictable waveforms (sine/triangle) — no harsh square/saw
//   - Slow envelopes with gentle attacks — avoids startling
//   - Short durations — prevents sensory overload
//   - Each semantic action has a UNIQUE auditory signature
//   - Volume/mute persisted — respects autonomy, ARHL accommodation
//   - Single AudioContext — no per-call waste, no Chrome memory leak
// ===========================================================================

const STORAGE_KEY = "cognicare-audio";

interface AudioSettings {
  volume: number;   // 0..1
  enabled: boolean;
}

function loadSettings(): AudioSettings {
  if (typeof window === "undefined") return { volume: 0.7, enabled: true };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AudioSettings>;
      return {
        volume: Math.max(0, Math.min(1, parsed.volume ?? 0.7)),
        enabled: parsed.enabled !== false,
      };
    }
  } catch { /* corrupt storage */ }
  return { volume: 0.7, enabled: true };
}

function saveSettings(s: AudioSettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch { /* quota exceeded — ignore */ }
}

const _settings = loadSettings();

export function getVolume(): number { return _settings.volume; }
export function isEnabled(): boolean { return _settings.enabled; }

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
// AudioContext singleton + routing graph
//
//   oscillator → per-note gain → masterGain → compressor → destination
//                              ↑ duck node
//
// ---------------------------------------------------------------------------
let _ctx: AudioContext | null = null;
let _masterGain: GainNode | null = null;
let _compressor: DynamicsCompressorNode | null = null;
let _duckGain: GainNode | null = null;

const DUCK_AMOUNT = 0.3;   // reduce to 30% during TTS
const DUCK_RAMP = 0.15;    // seconds to ramp down/up

function ensureAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (_ctx && _ctx.state !== "closed") {
    if (_ctx.state === "suspended") void _ctx.resume();
    return _ctx;
  }
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return null;

    const ctx = new AudioContextClass();

    // Compressor prevents clipping when many notes overlap
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -24;
    compressor.knee.value = 12;
    compressor.ratio.value = 4;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.15;
    compressor.connect(ctx.destination);

    // Master gain — this is what volume/mute controls
    const masterGain = ctx.createGain();
    masterGain.gain.value = _settings.enabled ? _settings.volume : 0;
    masterGain.connect(compressor);

    // Duck node — TTS goes here; ramps masterGain down while speaking
    const duckGain = ctx.createGain();
    duckGain.gain.value = 1;
    duckGain.connect(masterGain);

    _ctx = ctx;
    _compressor = compressor;
    _masterGain = masterGain;
    _duckGain = duckGain;

    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function updateMasterGain(): void {
  if (_masterGain) {
    const target = _settings.enabled ? _settings.volume : 0;
    _masterGain.gain.setTargetAtTime(target, _ctx?.currentTime ?? 0, 0.01);
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
// Note primitive — gentle sine/triangle with soft attack + exponential decay
// All notes route through masterGain → compressor → destination
// ---------------------------------------------------------------------------
function playNote(
  freq: number,
  startAt: number,
  duration: number,
  gainValue = 0.2,
  type: OscillatorType = "sine"
): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_masterGain) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, startAt);
  gain.gain.exponentialRampToValueAtTime(gainValue, startAt + 0.025);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain);
  gain.connect(_masterGain);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.02);
}

// ---------------------------------------------------------------------------
// Deprecated legacy names — kept as re-exports so all existing callers
// continue to work without import changes. Callers can be migrated at leisure.
// ---------------------------------------------------------------------------

/** Button press / haptic thock — gentle 130→45 Hz descending sweep */
export function playPress(): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_masterGain) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(130, now);
  osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);
  gain.gain.setValueAtTime(0.35, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
  osc.connect(gain);
  gain.connect(_masterGain);
  osc.start(now);
  osc.stop(now + 0.1);
}

/** Subtle soft tap — 350 Hz sine 35ms, very quiet */
export function playTapFeedback(): void {
  playNote(350, ensureAudioContext()?.currentTime ?? 0, 0.035, 0.1);
}

/** @deprecated Use playPress() */
export function playMechanicalClick(): void { playPress(); }

/** Correct answer — C5→G5 warm rising two-tone */
export function playCorrect(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(523.25, now, 0.35, 0.2);
  playNote(783.99, now + 0.13, 0.4, 0.24);
}

/** @deprecated Use playCorrect() */
export function playSuccessChime(): void { playCorrect(); }

/** Gentle progress encouragement — E5→A5 slower, softer */
export function playEncourage(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(659.25, now, 0.55, 0.16);
  playNote(880, now + 0.22, 0.8, 0.18);
}

/** @deprecated Use playEncourage() */
export function playEncouragementChime(): void { playEncourage(); }

/** Task complete — 4-note ascending fanfare with sparkle */
export function playComplete(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(523.25, now, 0.3, 0.18);       // C5
  playNote(659.25, now + 0.1, 0.3, 0.18); // E5
  playNote(783.99, now + 0.2, 0.3, 0.2);  // G5
  playNote(1046.5, now + 0.3, 0.6, 0.22); // C6
  // Sparkle shimmer — two high soft notes
  playNote(1318.51, now + 0.35, 0.15, 0.06, "triangle");
  playNote(1567.98, now + 0.45, 0.2, 0.05, "triangle");
}

/** Wrong answer — 320→210 Hz gentle descending, warm, non-harsh */
export function playIncorrect(): void {
  const ctx = ensureAudioContext();
  if (!ctx || !_masterGain) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(320, now);
  osc.frequency.exponentialRampToValueAtTime(210, now + 0.22);
  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
  osc.connect(gain);
  gain.connect(_masterGain);
  osc.start(now);
  osc.stop(now + 0.24);
}

/** Error / failure — low two-tone (kiosk, upload, API) */
export function playError(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(180, now, 0.2, 0.15);
  playNote(140, now + 0.15, 0.35, 0.12);
}

/** Reminder chime — pleasant bell tone (medicine, hydration, appointments) */
export function playRemind(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(659.25, now, 0.25, 0.18);       // E5
  playNote(880, now + 0.1, 0.25, 0.18);    // A5
  playNote(659.25, now + 0.22, 0.2, 0.14); // E5
}

/** QR scan success — brighter 3-note acknowledgement */
export function playScanSuccess(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  playNote(659.25, now, 0.2, 0.2);         // E5
  playNote(783.99, now + 0.08, 0.2, 0.2);  // G5
  playNote(1046.5, now + 0.16, 0.35, 0.22);// C6
}

// ---------------------------------------------------------------------------
// Calming Corner — ambient loop
//
// Procedural looping soundscape: gentle filtered noise rain + sparse
// bird chirps. Offline-safe, royalty-free. No audio files needed.
// ---------------------------------------------------------------------------

let _ambientInterval: ReturnType<typeof setInterval> | null = null;
let _ambientGain: GainNode | null = null;

/** Start the calming ambient loop (gentle rain + sparse birds) */
export function playAmbientLoop(): void {
  stopAmbientLoop();

  const ctx = ensureAudioContext();
  if (!ctx || !_masterGain) return;

  const loopGain = ctx.createGain();
  loopGain.gain.value = 0;
  loopGain.gain.setTargetAtTime(0.15, ctx.currentTime, 1.5);
  loopGain.connect(_masterGain);
  _ambientGain = loopGain;

  // Gentle rain — filtered white noise
  const bufferSize = ctx.sampleRate * 2;
  const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const playRainSegment = () => {
    if (!_ambientGain || !_ctx) return;
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

    // Fade volume for natural variation
    segGain.gain.setTargetAtTime(0.08 + Math.random() * 0.08, ctx.currentTime + 2, 3);
  };

  playRainSegment();

  // Sparse bird chirps every 4–8 seconds
  const playChirp = () => {
    if (!_ambientGain || !_ctx) return;
    const baseFreq = 1200 + Math.random() * 800;
    const now = ctx.currentTime;
    // 2–3 short chirp notes
    for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
      const t = now + i * 0.08;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.2, t + 0.04);
      g.gain.setValueAtTime(0.001, t);
      g.gain.exponentialRampToValueAtTime(0.04, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      osc.connect(g);
      g.connect(_ambientGain);
      osc.start(t);
      osc.stop(t + 0.06);
    }
  };

  _ambientInterval = setInterval(() => {
    if (Math.random() < 0.5) playChirp();
  }, 4000);
}

/** Stop the calming ambient loop with gentle fade-out */
export function stopAmbientLoop(): void {
  if (_ambientInterval) {
    clearInterval(_ambientInterval);
    _ambientInterval = null;
  }
  if (_ambientGain && _ctx) {
    _ambientGain.gain.setTargetAtTime(0, _ctx.currentTime, 0.8);
    const oldGain = _ambientGain;
    // Disconnect after fade completes to avoid dangling nodes
    setTimeout(() => {
      try { oldGain.disconnect(); } catch { /* already disconnected */ }
    }, 3000);
    _ambientGain = null;
  }
}

// ---------------------------------------------------------------------------
// Calm arpeggio — one-shot C-D-E-G ascending (moved from patient/page.tsx)
// ---------------------------------------------------------------------------

/** Gentle warm C major arpeggio — for calming corner button press */
export function playCalmTone(): void {
  const ctx = ensureAudioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [523.25, 587.33, 659.25, 783.99];
  notes.forEach((freq, i) => {
    playNote(freq, now + i * 0.5, 1.8, 0.1);
  });
}
