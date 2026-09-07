import { TextToSpeech } from '@capacitor-community/text-to-speech';

/**
 * Maps CogniCare 11 regional language codes to standard BCP-47 locale identifiers.
 */
const LOCALE_TO_BCP47: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  as: 'as-IN', // Assamese
  bn: 'bn-IN', // Bengali
  mni: 'mni-IN', // Manipuri / Meitei
  lus: 'lus-IN', // Mizo
  kha: 'kha-IN', // Khasi
  brx: 'brx-IN', // Bodo
  grt: 'grt-IN', // Garo
  mr: 'mr-IN', // Marathi
  ne: 'ne-NP', // Nepali
};

/**
 * Spoken voice synthesis through native Android TTS engine.
 */
export async function speakNative(text: string, langCode: string = 'en', rate: number = 0.82): Promise<void> {
  if (!text || !text.trim()) return;

  const bcp47 = LOCALE_TO_BCP47[langCode] || 'en-IN';

  try {
    // Stop any ongoing speech
    await TextToSpeech.stop();

    await TextToSpeech.speak({
      text: text.trim(),
      lang: bcp47,
      rate: Math.max(0.6, Math.min(rate, 1.2)),
      pitch: 1.0,
      volume: 1.0,
      category: 'ambient',
    });
  } catch (err) {
    console.warn('Native TTS fallback to Web Speech API:', err);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = bcp47;
      utter.rate = rate;
      window.speechSynthesis.speak(utter);
    }
  }
}

export async function stopNativeSpeech(): Promise<void> {
  try {
    await TextToSpeech.stop();
  } catch {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}
