export const LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  as: "as-IN",
  mr: "mr-IN",
  bn: "bn-IN",
  ne: "ne-IN",
  mni: "mni-IN",
  lus: "lus-IN",
  kha: "kha-IN",
  brx: "brx-IN",
  grt: "grt-IN",
};

export function patientLangCode(lang?: string | null): string {
  if (!lang) return "en";
  const value = lang.trim().toLowerCase();
  if (["en", "hi", "as", "mr", "bn", "ne", "mni", "lus", "kha", "brx", "grt"].includes(value)) return value;
  const byLabel: Record<string, string> = {
    english: "en",
    assamese: "as",
    hindi: "hi",
    marathi: "mr",
    bengali: "bn",
    nepali: "ne",
    manipuri: "mni",
    meitei: "mni",
    mizo: "lus",
    lushai: "lus",
    khasi: "kha",
    bodo: "brx",
    garo: "grt",
  };
  return byLabel[value] ?? "en";
}
