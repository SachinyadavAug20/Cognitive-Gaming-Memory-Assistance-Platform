export function playMechanicalClick() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const audioCtx = new AudioContextClass();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(160, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      40,
      audioCtx.currentTime + 0.08
    );

    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.01,
      audioCtx.currentTime + 0.08
    );

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch {
    // Graceful fallback — no audio
  }
}

export function playSuccessChime() {
  if (typeof window === "undefined") return;
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const audioCtx = new AudioContextClass();

    const notes = [523, 659, 784]; // C5, E5, G5
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(
        0.01,
        audioCtx.currentTime + i * 0.12 + 0.2
      );
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + i * 0.12);
      osc.stop(audioCtx.currentTime + i * 0.12 + 0.2);
    });
  } catch {
    // Graceful fallback
  }
}
