// Lightweight WebAudio sound engine - no external assets needed.
// Provides: clock ringing, ticking, footsteps, birds, door, soft background music, and speech.

let ctx = null;
let master = null;
let musicGain = null;
let muted = false;

export function ensureAudio() {
  if (ctx) { ensureRunning(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  try { ctx = new AC(); } catch (e) { return; }
  master = ctx.createGain();
  master.gain.value = muted ? 0 : 1;
  master.connect(ctx.destination);

  // ambient music loop (gentle pad)
  musicGain = ctx.createGain();
  musicGain.gain.value = 0.16;
  musicGain.connect(master);
  startMusic();
  ensureRunning();
}

// Resume the context once called from a user gesture (autoplay policy).
export function ensureRunning() {
  if (ctx && ctx.state === 'suspended') {
    try { ctx.resume(); } catch (e) {}
  }
}

export function setMuted(m) {
  muted = m;
  if (master) master.gain.value = m ? 0 : 1;
}

export function toggleMuted() {
  muted = !muted;
  if (master) master.gain.value = muted ? 0 : 1;
  return muted;
}

export function isMuted() { return muted; }

// ---------- Music ----------
let musicTimer = null;
function startMusic() {
  // soft two-chord pad loop using oscillators
  let step = 0;
  const chords = [
    [261.63, 329.63, 392.00], // C
    [220.00, 261.63, 329.63], // A minor
    [174.61, 220.00, 261.63], // F
    [196.00, 246.94, 293.66], // G
  ];
  const playChord = () => {
    const now = ctx.currentTime;
    const notes = chords[step % chords.length];
    notes.forEach((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.5, now + 0.6);
      g.gain.exponentialRampToValueAtTime(0.001, now + 3.4);
      osc.connect(g); g.connect(musicGain);
      osc.start(now); osc.stop(now + 3.6);
    });
    step++;
  };
  playChord();
  musicTimer = setInterval(playChord, 3600);
}

export function stopMusic() {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  if (musicGain) musicGain.gain.value = 0;
}

// ---------- One-shot sounds ----------
function blip(type, freq, dur, vol = 0.3, when = 0) {
  if (!ctx) return;
  const now = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + dur);
  osc.connect(g); g.connect(master);
  osc.start(now); osc.stop(now + dur + 0.02);
}

export function ringAlarm() {
  // classic mechanical double-ring
  for (let i = 0; i < 8; i++) {
    blip('square', 700 + (i % 2 ? 0 : 200), 0.22, 0.12, i * 0.3);
  }
}

export function ticking(freq = 1200) {
  blip('triangle', freq, 0.03, 0.4);
}

export function footstep() {
  blip('sine', 120, 0.08, 0.25);
  blip('sine', 90, 0.08, 0.2, 0.05);
}

export function doorOpen() {
  blip('sine', 200, 0.3, 0.25);
  blip('sine', 140, 0.35, 0.2, 0.15);
}

export function bird() {
  if (!ctx) return;
  for (let i = 0; i < 3; i++) {
    blip('sine', 1800 + Math.random() * 800, 0.08, 0.06, i * 0.12);
  }
}

export function chime() {
  // pleasant correct ding
  blip('sine', 880, 0.4, 0.25);
  blip('sine', 1318, 0.5, 0.2, 0.08);
}

export function buzz() {
  blip('square', 220, 0.2, 0.12);
}

export function whoosh() {
  blip('sine', 400, 0.4, 0.15);
  blip('sine', 200, 0.5, 0.12, 0.1);
}

// ---------- Speech ----------
let speechEnabled = true;
export function setSpeechEnabled(on) { speechEnabled = on; stopSpeech(); }

export function stopSpeech() {
  try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) {}
}

export function speak(text, opts = {}) {
  if (!speechEnabled || typeof window === 'undefined' || !window.speechSynthesis) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = opts.rate ?? 0.95;
    u.pitch = opts.pitch ?? 1.0;
    const voices = window.speechSynthesis.getVoices();
    const en = voices.find(v => /en/i.test(v.lang));
    if (en) u.voice = en;
    // Saathi (guide) has a slightly gentler voice via pitch
    if (opts.saathi) u.pitch = 1.08;
    window.speechSynthesis.speak(u);
  } catch (e) {}
}
