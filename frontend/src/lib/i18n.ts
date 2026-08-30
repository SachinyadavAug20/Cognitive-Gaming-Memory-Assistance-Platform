export const LOCALE_MAP: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  as: "as-IN",
  mr: "mr-IN",
};

export function patientLangCode(lang?: string | null): string {
  if (!lang) return "en";
  const value = lang.trim().toLowerCase();
  if (["en", "hi", "as", "mr"].includes(value)) return value;
  const byLabel: Record<string, string> = {
    english: "en",
    assamese: "as",
    hindi: "hi",
    marathi: "mr",
  };
  return byLabel[value] ?? "en";
}
