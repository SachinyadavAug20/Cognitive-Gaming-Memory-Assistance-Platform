export const locales = [
  "en", "hi", "as", "bn", "mni", "kha", "lus", "nep", "brx", "trl",
  "ta", "te", "mr", "ml", "kn", "gu", "pa", "od", "ur", "mai",
  "sat", "sd", "ks", "dog", "kok", "sa",
] as const;

export type Locale = (typeof locales)[number];

export const LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  as: "as-IN",
  bn: "bn-IN",
  mni: "mni-IN",
  kha: "en-IN",
  lus: "en-IN",
  nep: "ne-NP",
  brx: "hi-IN",
  trl: "en-IN",
  ta: "ta-IN",
  te: "te-IN",
  mr: "mr-IN",
  ml: "ml-IN",
  kn: "kn-IN",
  gu: "gu-IN",
  pa: "pa-IN",
  od: "od-IN",
  ur: "ur-IN",
  mai: "hi-IN",
  sat: "hi-IN",
  sd: "sd-PK",
  ks: "ks-IN",
  dog: "hi-IN",
  kok: "en-IN",
  sa: "hi-IN",
};

export const DEFAULT_LOCALE: Locale = "en";
