export const locales = ["en", "hi", "as"] as const;
export type Locale = (typeof locales)[number];

const translations: Record<Locale, Record<string, string>> = {
  en: {
    greeting: "Good Morning",
    startExercise: "Today's Exercise",
    start: "Start",
    medicine: "Medicine",
    hydration: "Drink Water",
    appointment: "Appointment",
    offline: "Offline — data will sync when connected",
    online: "Online",
  },
  hi: {
    greeting: "सुप्रभात",
    startExercise: "आज का व्यायाम",
    start: "शुरू करें",
    medicine: "दवाई",
    hydration: "पानी पिएं",
    appointment: "अपॉइंटमेंट",
    offline: "ऑफलाइन — डेटा जुड़ने पर सिंक होगा",
    online: "ऑनलाइन",
  },
  as: {
    greeting: "শুভ পুৱা",
    startExercise: "আজিৰ ব্যায়াম",
    start: "আৰম্ভ কৰক",
    medicine: "ওষুধ",
    hydration: "পানী পিও",
    appointment: "এপইণ্টমেণ্ট",
    offline: "অফলাইন — ডেটা সংযোগ হ'লে সিংক হ'ব",
    online: "অনলাইন",
  },
};

export function t(locale: Locale, key: string): string {
  return translations[locale]?.[key] ?? key;
}
