"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface DoctorPrescription {
  rxId: string;
  doctorName: string;
  prescribedGameId: string;
  prescribedGameTitle: string;
  prescribedRoute: string;
  dailyTargetMinutes: number;
  doctorNotes: string;
  assistanceLevel: number; // 1 (Full assistance) to 4 (Independent)
  updatedAt: string;
}

export interface FamilyNote {
  id: string;
  sender: string;
  relation: string;
  avatar: string;
  message: string;
  timestamp: string;
  hearts: number;
}

export interface FamilyUploadedPhoto {
  id: string;
  title: string;
  tag: string;
  img: string;
  decade: string;
  prompt: string;
}

export interface CareSyncState {
  // 1. Doctor Prescription
  prescription: DoctorPrescription;
  setPrescription: (rx: Partial<DoctorPrescription>) => void;

  // 2. Family Notes
  familyNotes: FamilyNote[];
  addFamilyNote: (note: Omit<FamilyNote, "id" | "timestamp" | "hearts">) => void;
  likeFamilyNote: (id: string) => void;

  // 3. Family Memory Photos
  familyPhotos: FamilyUploadedPhoto[];
  addFamilyPhoto: (photo: Omit<FamilyUploadedPhoto, "id">) => void;

  // 4. Patient Daily Nutrition & Metabolic Logs
  morningMedicineTaken: boolean;
  waterGlasses: number;
  mealsTakenToday: string[];
  glucoseReadings: Array<{
    time: string;
    type: "fasting" | "post_meal" | "random";
    glucoseMgDl: number;
    reactionTimeMs: number;
  }>;
  recentGameReactionTimeMs: number;

  setMorningMedicineTaken: (taken: boolean) => void;
  incrementWater: () => void;
  decrementWater: () => void;
  toggleMealTaken: (meal: string) => void;
  addGlucoseReading: (reading: {
    type: "fasting" | "post_meal" | "random";
    glucoseMgDl: number;
    reactionTimeMs?: number;
  }) => void;
  recordGameReactionTime: (rtMs: number) => void;
}

const DEFAULT_PRESCRIPTION: DoctorPrescription = {
  rxId: "RX-2026-904",
  doctorName: "Dr. Arindam Sharma, MD (Neurology)",
  prescribedGameId: "card-mastery",
  prescribedGameTitle: "Heritage Playing Cards (Taash)",
  prescribedRoute: "/patient/games/card-mastery",
  dailyTargetMinutes: 10,
  doctorNotes:
    "Prescribed: Heritage Card Mastery Level 1–4 for working memory and Majuli 3D walk for peaceful visuospatial orientation. Keep post-meal glucose steady.",
  assistanceLevel: 2,
  updatedAt: "Today 09:00 AM",
};

const DEFAULT_FAMILY_NOTES: FamilyNote[] = [
  {
    id: "fn_1",
    sender: "Rahul",
    relation: "Grandson",
    avatar: "👦",
    message: "Dadu, I heard you played Card Mastery this morning! You are the best card player! Love you! ❤️",
    timestamp: "2 hours ago",
    hearts: 14,
  },
  {
    id: "fn_2",
    sender: "Meera",
    relation: "Daughter",
    avatar: "👩",
    message: "Ma, your memory scores are getting better every day. We are so proud of your consistency! 🌸",
    timestamp: "Yesterday",
    hearts: 19,
  },
];

const DEFAULT_FAMILY_PHOTOS: FamilyUploadedPhoto[] = [
  {
    id: "p_1",
    title: "Silpukhuri Namghar",
    tag: "Prayer & Bell",
    img: "/sample-images/patient_1_biren_borah/places/03_silpukhuri_hari_namghar.jpg",
    decade: "1970s",
    prompt: "Do you remember the sacred brass bell and the morning prayers?",
  },
  {
    id: "p_2",
    title: "Kamalabari River Ghat",
    tag: "Brahmaputra 1978",
    img: "/sample-images/patient_1_biren_borah/places/05_dighalipukhuri_lake_park.jpg",
    decade: "1978",
    prompt: "The wooden ferry boat waiting by the wide golden river waters.",
  },
  {
    id: "p_3",
    title: "Daily Morning Market",
    tag: "Fresh Greens",
    img: "/sample-images/patient_1_biren_borah/places/02_silpukhuri_daily_market.jpg",
    decade: "1980s",
    prompt: "Greeting the local vegetable farmers and drinking warm red tea.",
  },
  {
    id: "p_4",
    title: "Ancestral Residence",
    tag: "Courtyard Home",
    img: "/sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg",
    decade: "1960s",
    prompt: "The thatched bamboo courtyard with the evening monsoon breeze.",
  },
];

export const useCareSyncStore = create<CareSyncState>()(
  persist(
    (set, get) => ({
      prescription: DEFAULT_PRESCRIPTION,
      familyNotes: DEFAULT_FAMILY_NOTES,
      familyPhotos: DEFAULT_FAMILY_PHOTOS,
      morningMedicineTaken: false,
      waterGlasses: 5,
      mealsTakenToday: ["breakfast", "lunch"],
      recentGameReactionTimeMs: 330,
      glucoseReadings: [
        { time: "Mon 08:00", type: "fasting", glucoseMgDl: 98, reactionTimeMs: 330 },
        { time: "Mon 14:00", type: "post_meal", glucoseMgDl: 165, reactionTimeMs: 410 },
        { time: "Tue 08:00", type: "fasting", glucoseMgDl: 104, reactionTimeMs: 340 },
        { time: "Tue 14:00", type: "post_meal", glucoseMgDl: 195, reactionTimeMs: 490 },
        { time: "Wed 08:00", type: "fasting", glucoseMgDl: 94, reactionTimeMs: 320 },
        { time: "Wed 14:00", type: "post_meal", glucoseMgDl: 142, reactionTimeMs: 360 },
        { time: "Thu 08:00", type: "fasting", glucoseMgDl: 101, reactionTimeMs: 335 },
      ],

      setPrescription: (rx) =>
        set((state) => ({
          prescription: {
            ...state.prescription,
            ...rx,
            updatedAt: "Just now",
          },
        })),

      addFamilyNote: (note) =>
        set((state) => ({
          familyNotes: [
            {
              ...note,
              id: "fn_" + Date.now(),
              timestamp: "Just now",
              hearts: 1,
            },
            ...state.familyNotes,
          ],
        })),

      likeFamilyNote: (id) =>
        set((state) => ({
          familyNotes: state.familyNotes.map((n) =>
            n.id === id ? { ...n, hearts: n.hearts + 1 } : n
          ),
        })),

      addFamilyPhoto: (photo) =>
        set((state) => ({
          familyPhotos: [
            {
              ...photo,
              id: "photo_" + Date.now(),
            },
            ...state.familyPhotos,
          ],
        })),

      setMorningMedicineTaken: (taken) => set({ morningMedicineTaken: taken }),

      incrementWater: () =>
        set((state) => ({ waterGlasses: state.waterGlasses + 1 })),

      decrementWater: () =>
        set((state) => ({
          waterGlasses: Math.max(0, state.waterGlasses - 1),
        })),

      toggleMealTaken: (meal) =>
        set((state) => ({
          mealsTakenToday: state.mealsTakenToday.includes(meal)
            ? state.mealsTakenToday.filter((m) => m !== meal)
            : [...state.mealsTakenToday, meal],
        })),

      addGlucoseReading: (reading) =>
        set((state) => {
          let simulatedRT = 330;
          const g = reading.glucoseMgDl;
          if (g > 140) {
            simulatedRT = Math.min(580, Math.round(330 + (g - 140) * 1.8));
          } else if (g < 75) {
            simulatedRT = Math.min(550, Math.round(330 + (75 - g) * 3.5));
          }
          const entry = {
            time: "Today " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            type: reading.type,
            glucoseMgDl: reading.glucoseMgDl,
            reactionTimeMs: reading.reactionTimeMs || simulatedRT,
          };
          return {
            glucoseReadings: [...state.glucoseReadings.slice(-9), entry],
          };
        }),

      recordGameReactionTime: (rtMs) =>
        set((state) => {
          const latestReading = state.glucoseReadings[state.glucoseReadings.length - 1];
          if (latestReading) {
            const updated = { ...latestReading, reactionTimeMs: rtMs };
            return {
              recentGameReactionTimeMs: rtMs,
              glucoseReadings: [...state.glucoseReadings.slice(0, -1), updated],
            };
          }
          return { recentGameReactionTimeMs: rtMs };
        }),
    }),
    {
      name: "cognicare-care-sync",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
