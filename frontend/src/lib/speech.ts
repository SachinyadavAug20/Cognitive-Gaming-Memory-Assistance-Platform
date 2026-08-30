import { LOCALE_MAP } from "./i18n";

function toSpeechLang(locale: string): string {
  return LOCALE_MAP[locale] ?? "en-US";
}

export function speak(
  text: string,
  locale = "en",
  rate = 0.85,
  { cancel = true } = {}
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (cancel) window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = toSpeechLang(locale);
  utterance.rate = rate;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
}

export function speechSupported(locale = "en"): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return false;
  const lang = toSpeechLang(locale);
  const voices = window.speechSynthesis.getVoices();
  const primary = lang.split("-")[0];
  return (
    voices.some((v) => v.lang === lang) ||
    voices.some((v) => v.lang.startsWith(primary))
  );
}