import {
  speakText,
  stopSpeaking as stop,
  speechSupported as supported,
} from "./sound";

// Compatibility layer — callers import { speak } from "@/lib/speech".
// The resilient implementation lives in `sound.ts` (the CogniCare Audio &
// Speech Engine) so both the engine and its thin API stay in sync.
export const speak = speakText;
export const stopSpeaking = stop;
export const speechSupported = supported;