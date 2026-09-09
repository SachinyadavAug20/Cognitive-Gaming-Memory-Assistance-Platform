import type { MemoryCapsule } from "@/types/capsule";

export const DEFAULT_MEMORY_CAPSULES: MemoryCapsule[] = [
  {
    id: "capsule-biren-01",
    patientId: 2,
    title: "Courtyard Lal Saah & Mango Tree Shade",
    locationName: "Silpukhuri Courtyard, Guwahati",
    seasonOrTime: "Morning Sunlight • 8:30 AM",
    photoUrl: "/sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg",
    familyMemberName: "Pratima Borah",
    relationship: "Wife",
    voiceNoteText:
      "Biren, the morning Lal Saah is warm and waiting on the cane table. Look at how bright the sun shines through our mango leaves. Take a sip, everything is peaceful.",
    ambientSoundType: "birds",
    atmosphereParticle: "sun_motes",
    colorFilter: "golden_hour",
    hotspots: [
      {
        id: "biren-01-tea",
        x: -0.35,
        y: -0.2,
        label: "Lal Saah in Brass Cup",
        detail: "Warm Assam red tea with a hint of crushed ginger and lemongrass from your kitchen garden.",
        soundCue: "teacup",
      },
      {
        id: "biren-01-tree",
        x: 0.4,
        y: 0.45,
        label: "Mango Tree Canopy",
        detail: "Planted forty years ago with Deuta. Its green leaves provide cool respite every summer.",
        soundCue: "bird",
      },
      {
        id: "biren-01-chair",
        x: 0.1,
        y: -0.3,
        label: "Cane Easy Chair",
        detail: "Your favored cane armchair where Pratima sits across with the morning newspaper.",
        soundCue: "chime",
      },
    ],
    lifeChapter: "family_home",
    circadianPhase: "morning_rise",
    coPilotPrompts: {
      sensoryAnchor: "Gently point toward the warm brass cup on the cane table.",
      validationPrompt: "Ask softly: 'Does the ginger tea smell fresh this morning, Biren?'",
      affectionBridge: "Hold their hand and say: 'Pratima brewed this special for you today.'",
    },
    guidedPrompts: {
      initialPrompt:
        "Welcome to your morning courtyard, Biren. Look around at the warm light falling on the verandah.",
      sensoryPrompt:
        "Listen to the morning koel calling from the bamboo grove. Pratima has poured your favorite warm red tea.",
      reflectionPrompt:
        "How sweet the morning feels when sitting together in Silpukhuri. You are safe, loved, and home.",
    },
    emotionTag: "peaceful",
    createdAt: "2026-08-30T09:15:00Z",
  },
  {
    id: "capsule-mary-01",
    patientId: 1,
    title: "Sunday Chimes at Laitumkhrah Cathedral",
    locationName: "Cathedral of Mary Help of Christians, Shillong",
    seasonOrTime: "Sunday Morning Chimes • 10:00 AM",
    photoUrl: "/sample-images/patient_2_mary_nongrum/places/03_cathedral_mary_help_christians.jpg",
    familyMemberName: "Daphisha Nongrum",
    relationship: "Daughter",
    voiceNoteText:
      "Kong Mary, listen to the church bells ringing across Laitumkhrah hill. Banylla is holding your hand in her red woollen gloves. The blue cathedral doors are open for hymns.",
    ambientSoundType: "namghar",
    atmosphereParticle: "flower_petals",
    colorFilter: "monsoon_emerald",
    hotspots: [
      {
        id: "mary-01-spire",
        x: -0.15,
        y: 0.5,
        label: "Cathedral Spires",
        detail: "The iconic blue spires standing tall against the misty clouds of Shillong peak.",
        soundCue: "chime",
      },
      {
        id: "mary-01-steps",
        x: 0.25,
        y: -0.35,
        label: "Stone Steps & Archway",
        detail: "Climbing these steps with Daphisha and Banylla for joyful Sunday choir service.",
        soundCue: "chime",
      },
    ],
    lifeChapter: "early_roots",
    circadianPhase: "morning_rise",
    coPilotPrompts: {
      sensoryAnchor: "Trace the tall blue spires in the sky with your finger.",
      validationPrompt: "Ask gently: 'Do you hear the bells ringing across the hill, Kong Mary?'",
      affectionBridge: "Say: 'Daphisha and Banylla are wearing their red woollen gloves with you today.'",
    },
    guidedPrompts: {
      initialPrompt:
        "Kong Mary, look up at the tall blue cathedral towers reaching into the cool Shillong sky.",
      sensoryPrompt:
        "The brass bell chimes carry through the pines. Feel the crisp mountain air and Banylla's hand in yours.",
      reflectionPrompt:
        "Countless joyful Sundays have blessed this sacred path. You are wrapped in warmth and prayer.",
    },
    emotionTag: "comforting",
    createdAt: "2026-08-30T10:00:00Z",
  },
  {
    id: "capsule-biren-02",
    patientId: 2,
    title: "Gentle Waters of the Brahmaputra Riverbank",
    locationName: "Uzan Bazar Ghat & Majuli Crossing",
    seasonOrTime: "Late Afternoon Breeze • 5:00 PM",
    photoUrl: "/sample-images/patient_1_biren_borah/places/05_dighalipukhuri_lake_park.jpg",
    familyMemberName: "Manash Borah",
    relationship: "Son",
    voiceNoteText:
      "Deuta, look at the country boats gliding across the river. The evening breeze feels so cool against your forehead. We have all the time in the world to stroll together.",
    ambientSoundType: "river",
    atmosphereParticle: "river_mist",
    colorFilter: "twilight",
    hotspots: [
      {
        id: "biren-02-boat",
        x: -0.3,
        y: 0.05,
        label: "Wooden Country Ferry",
        detail: "Majuli riverboat sailing across the broad waters carrying baskets of fresh seasonal harvest.",
        soundCue: "water",
      },
      {
        id: "biren-02-bank",
        x: 0.35,
        y: -0.35,
        label: "Riverbank Stroll Path",
        detail: "The red clay walking track where you and son Manash watch the sunset skies turn violet.",
        soundCue: "water",
      },
    ],
    lifeChapter: "career_pride",
    circadianPhase: "afternoon_stroll",
    coPilotPrompts: {
      sensoryAnchor: "Point toward the wooden ferry gliding across the broad river.",
      validationPrompt: "Ask: 'Do you feel the cool river breeze coming off the Brahmaputra, Deuta?'",
      affectionBridge: "Say: 'Manash is right here with you. We can sit on the ghat as long as you like.'",
    },
    guidedPrompts: {
      initialPrompt:
        "Deuta, see how the golden twilight ripples across the calm waters.",
      sensoryPrompt:
        "Hear the soft lapping of the river waves against the wooden shore. Breathe in the cool river breeze.",
      reflectionPrompt:
        "Every river path always leads us back to home and family. Take Manash's arm and enjoy the sunset.",
    },
    emotionTag: "nostalgic",
    createdAt: "2026-09-01T17:00:00Z",
  },
  {
    id: "capsule-mary-02",
    patientId: 1,
    title: "Monsoon Rain on the Nongrim Hills Veranda",
    locationName: "Nongrim Hills Cottage, Shillong",
    seasonOrTime: "Rainy Afternoon • 3:30 PM",
    photoUrl: "/sample-images/patient_2_mary_nongrum/places/01_home_nongrim_hills_cottage.jpg",
    familyMemberName: "Banker Nongrum",
    relationship: "Spouse",
    voiceNoteText:
      "Mary, the monsoon rain is tapping softly on our green tin roof. The purple hydrangeas are drinking the rain outside. Come sit with me under the warm woollen shawl.",
    ambientSoundType: "rain",
    atmosphereParticle: "gentle_rain",
    colorFilter: "monsoon_emerald",
    hotspots: [
      {
        id: "mary-02-roof",
        x: 0.0,
        y: 0.5,
        label: "Green Tin Roof",
        detail: "The comforting rhythm of Meghalaya monsoon drops drumming softly above.",
        soundCue: "chime",
      },
      {
        id: "mary-02-flowers",
        x: -0.4,
        y: -0.3,
        label: "Terrace Hydrangeas",
        detail: "Blue and violet clusters flourishing with each afternoon shower.",
        soundCue: "chime",
      },
    ],
    lifeChapter: "family_home",
    circadianPhase: "evening_sundown",
    coPilotPrompts: {
      sensoryAnchor: "Listen to the gentle rain tapping on the green tin roof.",
      validationPrompt: "Ask: 'Isn't the rain cozy on Nongrim Hills today?'",
      affectionBridge: "Wrap the woollen shawl gently around their shoulders and say: 'Banker is holding your hand.'",
    },
    guidedPrompts: {
      initialPrompt:
        "Mary, watch the gentle raindrops slide down the wooden window panes.",
      sensoryPrompt:
        "Listen to that rhythmic patter on the tin roof—the coziest sound in all of the Khasi hills.",
      reflectionPrompt:
        "Forty-five years of peaceful monsoons together in this cottage. You are safe, dry, and cherished.",
    },
    emotionTag: "peaceful",
    createdAt: "2026-09-02T15:30:00Z",
  },
  {
    id: "capsule-biren-03",
    patientId: 2,
    title: "Hari Namghar Flute & Evening Earthen Lamps",
    locationName: "Silpukhuri Hari Namghar, Assam",
    seasonOrTime: "Dusk Prayers • 6:30 PM",
    photoUrl: "/sample-images/patient_1_biren_borah/places/03_silpukhuri_hari_namghar.jpg",
    familyMemberName: "Arnav Borah",
    relationship: "Grandson",
    voiceNoteText:
      "Koka, the clay lamps are lit at the Namghar. Hear the flute playing softly? You taught me that melody on the porch last winter.",
    ambientSoundType: "flute",
    atmosphereParticle: "fireflies",
    colorFilter: "golden_hour",
    hotspots: [
      {
        id: "biren-03-lamps",
        x: -0.2,
        y: -0.2,
        label: "Clay Mustard Lamps",
        detail: "Warm glowing earthen diyas illuminating the sacred prayer floor with calming fragrance.",
        soundCue: "chime",
      },
      {
        id: "biren-03-hall",
        x: 0.3,
        y: 0.25,
        label: "Wooden Prayer Pillar",
        detail: "Carved sal-wood pillar where elders gather to chant holy Borgeet verses.",
        soundCue: "chime",
      },
    ],
    lifeChapter: "grandchildren",
    circadianPhase: "evening_sundown",
    coPilotPrompts: {
      sensoryAnchor: "Look at the gentle flicker of the earthen mustard oil lamps.",
      validationPrompt: "Ask: 'Do you remember teaching Arnav this flute melody on the porch?'",
      affectionBridge: "Say: 'Your grandson learned that rhythm from you, Koka. You taught him with love.'",
    },
    guidedPrompts: {
      initialPrompt:
        "Koka, look at the warm flickering flames of the mustard oil lamps lighting up the prayer hall.",
      sensoryPrompt:
        "Hear the serene flute melody drift through the dusk. Arnav is smiling right beside you.",
      reflectionPrompt:
        "The sacred rhythm lives in your heart and through your grandson's laughter. A peaceful evening blesses you.",
    },
    emotionTag: "joyful",
    createdAt: "2026-09-03T18:30:00Z",
  },
  {
    id: "capsule-mary-03",
    patientId: 1,
    title: "Wards Lake Swans & Pine Grove Stroll",
    locationName: "Ward's Lake (Nan Polok), Shillong",
    seasonOrTime: "Midday Stroll • 12:00 PM",
    photoUrl: "/sample-images/patient_2_mary_nongrum/places/05_wards_lake_nan_polok.jpg",
    familyMemberName: "Banylla Nongrum",
    relationship: "Granddaughter",
    voiceNoteText:
      "Mei, the white swans are swimming near the wooden arch bridge! Look at all the red cherry blossoms floating on the water.",
    ambientSoundType: "birds",
    atmosphereParticle: "flower_petals",
    colorFilter: "monsoon_emerald",
    hotspots: [
      {
        id: "mary-03-bridge",
        x: 0.1,
        y: 0.2,
        label: "Wooden Arch Bridge",
        detail: "The historic wooden bridge over Nan Polok where children love to feed the ducks.",
        soundCue: "bird",
      },
      {
        id: "mary-03-swans",
        x: -0.35,
        y: -0.3,
        label: "Gliding Swans",
        detail: "Pair of serene white swans paddling across the mirror-like green water.",
        soundCue: "water",
      },
    ],
    lifeChapter: "grandchildren",
    circadianPhase: "afternoon_stroll",
    coPilotPrompts: {
      sensoryAnchor: "Watch the white swans swimming near the wooden arch bridge.",
      validationPrompt: "Ask: 'See the red cherry blossoms floating on the lake, Mei?'",
      affectionBridge: "Smile and say: 'Banylla is holding your hand so tight. She loves walking with you.'",
    },
    guidedPrompts: {
      initialPrompt:
        "Mei, see the wooden bridge curving gently across the sparkling green lake.",
      sensoryPrompt:
        "Banylla is laughing and pointing at the swimming swans. Listen to the wind whisper through the tall pine needles.",
      reflectionPrompt:
        "Every step along this lake is paved with fond family strolls. Banylla's hand is tucked tightly into yours.",
    },
    emotionTag: "joyful",
    createdAt: "2026-09-04T12:00:00Z",
  },
];

const CAPSULES_STORAGE_KEY = "cognicare_memory_capsules";
const CAPSULE_LOGS_KEY = "cognicare_capsule_session_logs";

export function getCustomCapsules(): MemoryCapsule[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CAPSULES_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as MemoryCapsule[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveCustomCapsule(capsule: MemoryCapsule): MemoryCapsule[] {
  if (typeof window === "undefined") return [capsule];
  try {
    const existing = getCustomCapsules();
    const updated = [capsule, ...existing.filter((c) => c.id !== capsule.id)];
    window.localStorage.setItem(CAPSULES_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("Could not write capsule to localStorage:", err);
    return [capsule];
  }
}

export function getAllCapsulesForPatient(patientId?: number | null): MemoryCapsule[] {
  const custom = getCustomCapsules();
  const all = [...custom, ...DEFAULT_MEMORY_CAPSULES];
  const uniqueMap = new Map<string, MemoryCapsule>();
  for (const cap of all) {
    if (!uniqueMap.has(cap.id)) {
      uniqueMap.set(cap.id, cap);
    }
  }

  const merged = Array.from(uniqueMap.values());
  if (!patientId) return merged;

  const filtered = merged.filter((c) => c.patientId === patientId);
  return filtered.length > 0 ? filtered : merged;
}

import type { CapsuleSessionLog } from "@/types/capsule";

export function getCapsuleSessionLogs(patientId?: number): CapsuleSessionLog[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CAPSU_LOGS_STORAGE_KEY_FALLBACK(patientId));
    if (!raw) return [];
    const list = JSON.parse(raw) as CapsuleSessionLog[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function CAPSU_LOGS_STORAGE_KEY_FALLBACK(patientId?: number): string {
  return patientId ? `${CAPSULE_LOGS_KEY}_${patientId}` : CAPSULE_LOGS_KEY;
}

export function saveCapsuleSessionLog(log: CapsuleSessionLog): CapsuleSessionLog[] {
  if (typeof window === "undefined") return [log];
  try {
    const key = CAPSU_LOGS_STORAGE_KEY_FALLBACK(log.patientId);
    const existing = getCapsuleSessionLogs(log.patientId);
    const updated = [log, ...existing].slice(0, 50); // Keep last 50
    window.localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("Could not write capsule session log:", err);
    return [log];
  }
}

// ---------------------------------------------------------------------------
// Future Time Capsules (Patient & Family Messages for Tomorrow)
// ---------------------------------------------------------------------------
import type { FutureTimeCapsule } from "@/types/capsule";

const TIME_CAPSULES_STORAGE_KEY = "cognicare_future_time_capsules";

export const DEFAULT_FUTURE_TIME_CAPSULES: FutureTimeCapsule[] = [
  {
    id: "time-capsule-biren-01",
    patientId: 2,
    authorName: "Biren Borah",
    authorRole: "patient",
    title: "To My Future Self on Foggy Days",
    recipient: "future_self",
    messageText:
      "Dear Biren, if today feels confusing or the names slip away, listen to this: You are Biren Borah, retired headmaster, beloved father of Manash and Ananya, husband to Pratima. You built this home in Silpukhuri with honest hands. You are safe. Look out the verandah at the mango tree. Everything is going to be okay.",
    photoUrl: "/sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg",
    theme: "identity",
    milestone: "confused_days",
    milestoneLabel: "When I Feel Foggy or Anxious",
    sealedAt: "2026-09-01T10:00:00Z",
    unlockDate: null,
    isSealed: true,
  },
  {
    id: "time-capsule-biren-02",
    patientId: 2,
    authorName: "Biren Borah",
    authorRole: "patient",
    title: "Blessing for Manash & Little Arnav",
    recipient: "family",
    messageText:
      "Manash and my dear grandchild Arnav, watching you grow and care for me fills my heart with peaceful joy. Never forget to sit together for morning tea, stay truthful in all you do, and listen to the birds at Silpukhuri. My blessings walk with you every step.",
    photoUrl: "/sample-images/patient_1_biren_borah/relatives/01_son_manash_borah.jpg",
    theme: "family_love",
    milestone: "next_bihu",
    milestoneLabel: "Rongali Bihu Gathering",
    sealedAt: "2026-09-02T16:30:00Z",
    unlockDate: "2027-04-14",
    isSealed: true,
  },
  {
    id: "time-capsule-biren-03",
    patientId: 2,
    authorName: "Biren Borah",
    authorRole: "patient",
    title: "My Eternal Gratitude for Pratima",
    recipient: "family",
    messageText:
      "Pratima, forty-six years of marriage have been my greatest fortune. Even when my memory wanders, my heart always recognizes your warm tea, your footsteps, and your gentle voice. Thank you for holding my hand every single day.",
    photoUrl: "/sample-images/patient_1_biren_borah/relatives/02_spouse_pratima_borah.jpg",
    theme: "gratitude",
    milestone: "anytime",
    milestoneLabel: "Cherished Words Forever",
    sealedAt: "2026-09-05T11:15:00Z",
    unlockDate: null,
    isSealed: true,
  },
];

export function getFutureTimeCapsules(patientId?: number): FutureTimeCapsule[] {
  if (typeof window === "undefined") {
    return patientId ? DEFAULT_FUTURE_TIME_CAPSULES.filter((c) => c.patientId === patientId) : DEFAULT_FUTURE_TIME_CAPSULES;
  }
  try {
    const raw = window.localStorage.getItem(TIME_CAPSULES_STORAGE_KEY);
    const custom: FutureTimeCapsule[] = raw ? JSON.parse(raw) : [];
    const all = [...custom, ...DEFAULT_FUTURE_TIME_CAPSULES];
    const map = new Map<string, FutureTimeCapsule>();
    all.forEach((c) => {
      if (!map.has(c.id)) map.set(c.id, c);
    });
    const merged = Array.from(map.values());
    if (!patientId) return merged;
    const filtered = merged.filter((c) => c.patientId === patientId);
    return filtered.length > 0 ? filtered : merged;
  } catch {
    return DEFAULT_FUTURE_TIME_CAPSULES;
  }
}

export function saveFutureTimeCapsule(capsule: FutureTimeCapsule): FutureTimeCapsule[] {
  if (typeof window === "undefined") return [capsule];
  try {
    const raw = window.localStorage.getItem(TIME_CAPSULES_STORAGE_KEY);
    const existing: FutureTimeCapsule[] = raw ? JSON.parse(raw) : [];
    const updated = [capsule, ...existing.filter((c) => c.id !== capsule.id)];
    window.localStorage.setItem(TIME_CAPSULES_STORAGE_KEY, JSON.stringify(updated));
    return getFutureTimeCapsules(capsule.patientId);
  } catch (err) {
    console.warn("Could not save future time capsule:", err);
    return [capsule];
  }
}

