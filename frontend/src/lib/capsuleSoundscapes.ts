import type { AmbientSoundType } from "@/types/capsule";
import { pickVoice, ensureAudioContext } from "./sound";

let _ambientMasterGain: GainNode | null = null;
let _spatialPanner: StereoPannerNode | null = null;
let _binauralGain: GainNode | null = null;
let _binauralOsc1: OscillatorNode | null = null;
let _binauralOsc2: OscillatorNode | null = null;
let _activeSoundSource: {
  stop: () => void;
} | null = null;
let _activeVoiceAudio: HTMLAudioElement | null = null;

function getAudioContext(): AudioContext | null {
  return ensureAudioContext();
}

export function updateSpatialPan(panX: number): void {
  const ctx = ensureAudioContext();
  if (!_spatialPanner || !ctx) return;
  try {
    const clamped = Math.max(-0.85, Math.min(0.85, panX * 0.75));
    _spatialPanner.pan.setTargetAtTime(clamped, ctx.currentTime, 0.06);
  } catch {}
}

let _currentSoundType: AmbientSoundType | null = null;

export function setSoundscapeVolume(volume: number): void {
  const ctx = ensureAudioContext();
  if (!_ambientMasterGain || !ctx) return;
  try {
    const target = Math.max(0, Math.min(1, volume));
    _ambientMasterGain.gain.setTargetAtTime(target, ctx.currentTime, 0.1);
  } catch {}
}

export function playCapsuleSoundscape(type: AmbientSoundType, volume = 0.35): void {
  // If already playing this exact soundscape, smoothly update volume without restarting
  if (_currentSoundType === type && _ambientMasterGain && _activeSoundSource) {
    setSoundscapeVolume(volume);
    return;
  }

  stopCapsuleSoundscape();
  _currentSoundType = type;

  const ctx = getAudioContext();
  if (!ctx) return;

  const master = ctx.createGain();
  master.gain.setValueAtTime(0.0001, ctx.currentTime);
  master.gain.exponentialRampToValueAtTime(Math.max(0.01, volume), ctx.currentTime + 1.2);
  master.connect(ctx.destination);
  _ambientMasterGain = master;

  let panner: StereoPannerNode | null = null;
  if (typeof ctx.createStereoPanner === "function") {
    panner = ctx.createStereoPanner();
    panner.pan.setValueAtTime(0, ctx.currentTime);
    panner.connect(master);
    _spatialPanner = panner;
  }
  const soundDestination: AudioNode = panner || master;

  let isCancelled = false;
  const cleanupTasks: Array<() => void> = [];

  switch (type) {
    case "rain": {
      // 1. Continuous soothing rain noise (pink-filtered)
      const bufferSize = ctx.sampleRate * 3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.25;
      }

      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;

      const rainFilter = ctx.createBiquadFilter();
      rainFilter.type = "lowpass";
      rainFilter.frequency.value = 750;

      const rainGain = ctx.createGain();
      rainGain.gain.value = 0.20;

      noiseSrc.connect(rainFilter);
      rainFilter.connect(rainGain);
      rainGain.connect(soundDestination);
      noiseSrc.start();
      cleanupTasks.push(() => {
        try { noiseSrc.stop(); } catch {}
      });

      // 2. Gentle veranda raindrop clicks (spaced and click-free with linear attack)
      const dropTimer = setInterval(() => {
        if (isCancelled || !ctx) return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const now = ctx.currentTime;
          osc.type = "sine";
          osc.frequency.setValueAtTime(1100 + Math.random() * 400, now);
          osc.frequency.exponentialRampToValueAtTime(350, now + 0.06);
          // Soft attack prevents audio pops
          gain.gain.setValueAtTime(0.0001, now);
          gain.gain.linearRampToValueAtTime(0.03 + Math.random() * 0.02, now + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
          osc.connect(gain);
          gain.connect(soundDestination);
          osc.start(now);
          osc.stop(now + 0.07);
        } catch {}
      }, 420);
      cleanupTasks.push(() => clearInterval(dropTimer));
      break;
    }

    case "river": {
      // Flowing water wave undulation
      const bufferSize = ctx.sampleRate * 4;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;

      const bandpass = ctx.createBiquadFilter();
      bandpass.type = "bandpass";
      bandpass.frequency.value = 450;
      bandpass.Q.value = 1.4;

      // LFO for slow water swell
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.value = 0.25; // 4 second swell
      lfoGain.gain.value = 180;
      lfo.connect(lfoGain);
      lfoGain.connect(bandpass.frequency);

      const riverGain = ctx.createGain();
      riverGain.gain.value = 0.35;

      noiseSrc.connect(bandpass);
      bandpass.connect(riverGain);
      riverGain.connect(soundDestination);

      noiseSrc.start();
      lfo.start();
      cleanupTasks.push(() => {
        try { noiseSrc.stop(); lfo.stop(); } catch {}
      });
      break;
    }

    case "birds": {
      // Gentle atmospheric forest breeze + periodic melodious birdsong
      const breeze = ctx.createOscillator();
      const breezeGain = ctx.createGain();
      breeze.type = "triangle";
      breeze.frequency.value = 120;
      breezeGain.gain.value = 0.04;
      breeze.connect(breezeGain);
      breezeGain.connect(soundDestination);
      breeze.start();
      cleanupTasks.push(() => {
        try { breeze.stop(); } catch {}
      });

      const birdTimer = setInterval(() => {
        if (isCancelled || !ctx) return;
        try {
          const notes = [2093, 2349, 2637, 3136]; // C7, D7, E7, G7 pentatonic
          const base = notes[Math.floor(Math.random() * notes.length)];
          const now = ctx.currentTime;
          
          for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const t = now + i * 0.09;
            osc.type = "sine";
            osc.frequency.setValueAtTime(base * (1 + (i % 2) * 0.15), t);
            osc.frequency.exponentialRampToValueAtTime(base * 0.9, t + 0.07);
            gain.gain.setValueAtTime(0.06, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
            osc.connect(gain);
            gain.connect(soundDestination);
            osc.start(t);
            osc.stop(t + 0.09);
          }
        } catch {}
      }, 2400);
      cleanupTasks.push(() => clearInterval(birdTimer));
      break;
    }

    case "namghar": {
      // Deep sacred bronze bell tone & chime resonance
      const bellTimer = setInterval(() => {
        if (isCancelled || !ctx) return;
        try {
          const fundamental = 261.63; // Middle C bell
          const partials = [1, 2.76, 5.4, 8.93]; // Metallic inharmonic ratios
          const now = ctx.currentTime;

          partials.forEach((ratio, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const dur = 4.5 / (idx + 1);
            osc.type = "sine";
            osc.frequency.value = fundamental * ratio;
            gain.gain.setValueAtTime(0.07 / (idx + 1), now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
            osc.connect(gain);
            gain.connect(soundDestination);
            osc.start(now);
            osc.stop(now + dur);
          });
        } catch {}
      }, 5000);
      cleanupTasks.push(() => clearInterval(bellTimer));
      break;
    }

    case "flute": {
      // Serene Bamboo Flute in Raga Bhupali (C, D, E, G, A)
      const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25];
      let noteIdx = 0;
      const fluteTimer = setInterval(() => {
        if (isCancelled || !ctx) return;
        try {
          const freq = scale[noteIdx % scale.length];
          noteIdx = (noteIdx + Math.floor(Math.random() * 3) + 1) % scale.length;
          const now = ctx.currentTime;
          const dur = 2.4;

          const osc = ctx.createOscillator();
          const vibrato = ctx.createOscillator();
          const vibGain = ctx.createGain();
          const gain = ctx.createGain();

          osc.type = "triangle";
          osc.frequency.value = freq;

          vibrato.frequency.value = 5.2; // 5Hz natural breath vibrato
          vibGain.gain.value = freq * 0.02;
          vibrato.connect(vibGain);
          vibGain.connect(osc.frequency);

          // Gentle breath envelope
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.09, now + 0.4);
          gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

          osc.connect(gain);
          gain.connect(soundDestination);

          vibrato.start(now);
          osc.start(now);
          vibrato.stop(now + dur);
          osc.stop(now + dur);
        } catch {}
      }, 2600);
      cleanupTasks.push(() => clearInterval(fluteTimer));
      break;
    }

    case "bazaar": {
      // Warm low-frequency ambient rumble & distant rhythmic bustle
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = noiseBuffer;
      noiseSrc.loop = true;

      const lowpass = ctx.createBiquadFilter();
      lowpass.type = "lowpass";
      lowpass.frequency.value = 280;

      const gain = ctx.createGain();
      gain.gain.value = 0.18;

      noiseSrc.connect(lowpass);
      lowpass.connect(gain);
      gain.connect(soundDestination);
      noiseSrc.start();
      cleanupTasks.push(() => {
        try { noiseSrc.stop(); } catch {}
      });
      break;
    }
  }

  _activeSoundSource = {
    stop: () => {
      isCancelled = true;
      cleanupTasks.forEach((fn) => fn());
    },
  };
}

export function stopCapsuleSoundscape(): void {
  _currentSoundType = null;
  if (_activeSoundSource) {
    _activeSoundSource.stop();
    _activeSoundSource = null;
  }
  if (_ambientMasterGain) {
    const gainToFade = _ambientMasterGain;
    _ambientMasterGain = null;
    const ctx = ensureAudioContext();
    try {
      const now = ctx ? ctx.currentTime : 0;
      gainToFade.gain.setTargetAtTime(0.0001, now, 0.25);
      setTimeout(() => {
        try {
          gainToFade.disconnect();
        } catch {}
      }, 500);
    } catch {
      try {
        gainToFade.disconnect();
      } catch {}
    }
  }
}

// ---------------------------------------------------------------------------
// Neuro-Acoustic Binaural Stimulation (40Hz Gamma / 10Hz Alpha)
// ---------------------------------------------------------------------------
export function toggleBinauralBeat(mode: "gamma" | "alpha" | "off"): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Stop existing binaural oscillators if running
  if (_binauralGain) {
    try {
      const now = ctx.currentTime;
      _binauralGain.gain.setTargetAtTime(0.0001, now, 0.15);
      setTimeout(() => {
        try {
          _binauralOsc1?.stop();
          _binauralOsc2?.stop();
          _binauralOsc1?.disconnect();
          _binauralOsc2?.disconnect();
          _binauralGain?.disconnect();
          _binauralOsc1 = null;
          _binauralOsc2 = null;
          _binauralGain = null;
        } catch {}
      }, 300);
    } catch {}
  }

  if (mode === "off") return;

  try {
    const carrier = 210; // Soothing warm base tone
    const offset = mode === "gamma" ? 40 : 10; // 40Hz for gamma cognition, 10Hz for alpha calm

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 1.0); // Gentle, subtle background layer
    masterGain.connect(ctx.destination);
    _binauralGain = masterGain;

    // Left channel carrier
    const oscLeft = ctx.createOscillator();
    oscLeft.type = "sine";
    oscLeft.frequency.value = carrier;

    // Right channel carrier + offset
    const oscRight = ctx.createOscillator();
    oscRight.type = "sine";
    oscRight.frequency.value = carrier + offset;

    // Channel merger for true binaural stereo separation
    const merger = ctx.createChannelMerger(2);
    oscLeft.connect(merger, 0, 0); // Left ear
    oscRight.connect(merger, 0, 1); // Right ear
    merger.connect(masterGain);

    oscLeft.start();
    oscRight.start();
    _binauralOsc1 = oscLeft;
    _binauralOsc2 = oscRight;
  } catch (err) {
    console.warn("Could not start binaural beat:", err);
  }
}

// ---------------------------------------------------------------------------
// Tactile Hotspot Auditory Feedback
// ---------------------------------------------------------------------------
export function playHotspotAudioCue(cue: "chime" | "teacup" | "water" | "bird" = "chime"): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    if (cue === "teacup") {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1850, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.13);
    } else if (cue === "water") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(340, now);
      osc.frequency.exponentialRampToValueAtTime(680, now + 0.22);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.23);
    } else if (cue === "bird") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.setValueAtTime(2600, now);
      osc.frequency.exponentialRampToValueAtTime(3400, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(2900, now + 0.16);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.17);
      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 0.18);
    } else {
      // Default: Sacred 528Hz Solfeggio / Harmonic Bronze Chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      osc1.type = "sine";
      osc2.type = "sine";
      osc1.frequency.value = 528;
      osc2.frequency.value = 1056;

      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

      osc1.connect(gain);
      osc2.connect(gain);
      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.2);
      osc2.stop(now + 1.2);
    }
  } catch {}
}

// ---------------------------------------------------------------------------
// Family Voice Note Audio Playback (with audio blob / recording support)
// ---------------------------------------------------------------------------
let _currentVoiceUtterance: SpeechSynthesisUtterance | null = null;

export function playFamilyVoiceNote(
  text: string,
  locale = "as",
  onStart?: () => void,
  onEnd?: () => void,
  audioUrl?: string | null,
  onBoundary?: (charIdx: number) => void
): void {
  stopFamilyVoiceNote();

  // If a genuine family voice recording exists (from mic or uploaded audio file)
  if (audioUrl) {
    try {
      const audio = new Audio(audioUrl);
      _activeVoiceAudio = audio;
      audio.volume = 1.0;
      audio.onplay = () => onStart?.();
      audio.onended = () => {
        _activeVoiceAudio = null;
        onEnd?.();
      };
      audio.onerror = () => {
        _activeVoiceAudio = null;
        // Fallback to speech synthesis if audio file fails
        fallbackSpeak(text, locale, onStart, onEnd, onBoundary);
      };
      audio.play().catch(() => {
        fallbackSpeak(text, locale, onStart, onEnd, onBoundary);
      });
      return;
    } catch {
      // Fallback
    }
  }

  fallbackSpeak(text, locale, onStart, onEnd, onBoundary);
}

function fallbackSpeak(
  text: string,
  locale: string,
  onStart?: () => void,
  onEnd?: () => void,
  onBoundary?: (charIdx: number) => void
) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    onStart?.();
    setTimeout(() => onEnd?.(), 3000);
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const matchedVoice = pickVoice(locale);
  if (matchedVoice) utterance.voice = matchedVoice;

  utterance.lang = locale;
  utterance.rate = 0.82; // Warm, deliberate, gentle dementia-calibrated cadence
  utterance.pitch = 1.05; // Friendly, affectionate, reassuring tone
  utterance.volume = 1.0;

  utterance.onboundary = (event) => {
    if (event.name === "word") {
      onBoundary?.(event.charIndex);
    }
  };

  utterance.onstart = () => {
    onStart?.();
  };

  utterance.onend = () => {
    _currentVoiceUtterance = null;
    onEnd?.();
  };

  utterance.onerror = () => {
    _currentVoiceUtterance = null;
    onEnd?.();
  };

  _currentVoiceUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function stopFamilyVoiceNote(): void {
  if (_activeVoiceAudio) {
    try {
      _activeVoiceAudio.pause();
      _activeVoiceAudio.currentTime = 0;
    } catch {}
    _activeVoiceAudio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  _currentVoiceUtterance = null;
}
