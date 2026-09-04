import {
  EMPTY_FORM,
  INTEREST_OPTIONS,
  LANDMARK_EMOJIS,
  LANGUAGE_OPTIONS,
} from "@/types/intake";
import type {
  IntakeFormData,
  LandmarkEntry,
  LifeEvent,
  Relative,
} from "@/types/intake";

function asString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  return fallback;
}

function parseDob(value: unknown): string {
  const text = asString(value);
  const dmy = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) {
    const [, day, month, year] = dmy;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  return "";
}

function languageCodeFromLabel(label: unknown): string {
  const text = asString(label).trim();
  if (!text) return "";
  return LANGUAGE_OPTIONS.find((l) => l.label === text)?.code ?? text;
}

const LEGACY_EMOJI_TO_ID: Record<string, string> = {
  "\uD83D\uDED2": "market",
  "\uD83D\uDECD\uFE0F": "market",
  "\uD83D\uDECD": "market",
  "\uD83C\uDFE0": "home",
  "\uD83C\uDFE1": "home",
  "\uD83D\uDE4F": "temple",
  "\uD83C\uDFE5": "clinic",
  "\uD83C\uDFEB": "school",
  "\uD83C\uDF33": "park",
  "\uD83D\uDE8C": "bus",
  "\uD83C\uDFEA": "store",
  "\u26F0\uFE0F": "hills",
  "\uD83C\uDF0A": "lake",
};

function landmarkEmoji(emoji: unknown): string {
  const text = asString(emoji).trim();
  if (LANDMARK_EMOJIS.includes(text)) return text;
  return LEGACY_EMOJI_TO_ID[text] ?? "home";
}

function mapLifeEvents(list: unknown): LifeEvent[] | null {
  if (!Array.isArray(list)) return null;
  return list
    .filter((item) => item !== null && typeof item === "object")
    .map((item) => {
      const e = item as Record<string, unknown>;
      return {
        event: asString(e["event"]),
        year: asString(e["year"]),
      };
    })
    .filter((e) => e.event.trim() !== "");
}

function mapInterests(list: unknown): string[] | null {
  if (!Array.isArray(list)) return null;
  const valid = new Set(INTEREST_OPTIONS);
  return list.map((v) => asString(v)).filter((interest) => valid.has(interest));
}

/**
 * Resolves a bundled sample photo to its public URL:
 * - "images/patient_N_.../relatives/x.jpg"  -> "/sample-images/patient_N_.../relatives/x.jpg"
 * - "patient_N_.../relatives/x.jpg"         -> "/sample-images/patient_N_.../relatives/x.jpg"
 * - "01_son_manash_borah.jpg"               -> base + name (legacy flat layout)
 */
function sampleImageUrl(base: string, filename: unknown): string {
  const name = asString(filename).trim();
  if (!name) return "";
  if (name.startsWith("images/")) {
    return `/sample-images/${name.slice("images/".length)}`;
  }
  if (name.includes("/")) {
    return `/sample-images/${name}`;
  }
  return `${base}${name}`;
}

/**
 * Fetches a bundled sample photo and turns it into a File (for the backend
 * upload) plus an object URL (for instant preview). Any failure simply yields
 * no file — the wizard still works without photos.
 */
async function fetchSampleFile(
  base: string,
  filename: unknown
): Promise<{ file: File | undefined; photoUrl: string }> {
  const url = sampleImageUrl(base, filename);
  if (!url) return { file: undefined, photoUrl: "" };
  try {
    const res = await fetch(url);
    if (!res.ok) return { file: undefined, photoUrl: "" };
    const blob = await res.blob();
    const file = new File([blob], url.split("/").pop() ?? "photo.png", {
      type: blob.type || "image/png",
    });
    return { file, photoUrl: URL.createObjectURL(file) };
  } catch {
    return { file: undefined, photoUrl: "" };
  }
}

async function mapRelatives(list: unknown): Promise<Relative[] | null> {
  if (!Array.isArray(list)) return null;
  const base = list
    .filter((item) => item !== null && typeof item === "object")
    .map((item) => {
      const r = item as Record<string, unknown>;
      return {
        name: asString(r["name"]),
        relationship: asString(r["relation"]).trim().toLowerCase(),
        imageFile: asString(r["image_file"] ?? r["photo_file"]),
        notes: asString(r["notes"]),
      };
    });
  return Promise.all(
    base.map(async (r) => {
      const { file, photoUrl } = await fetchSampleFile(
        "/sample-images/relatives/",
        r.imageFile
      );
      return {
        name: r.name,
        relationship: r.relationship,
        photoUrl,
        notes: r.notes,
        fileRef: file,
      };
    })
  );
}

async function mapLandmarks(list: unknown): Promise<LandmarkEntry[] | null> {
  if (!Array.isArray(list)) return null;
  const base = list
    .filter((item) => item !== null && typeof item === "object")
    .map((item) => {
      const p = item as Record<string, unknown>;
      return {
        name: asString(p["place_name"]),
        description: asString(p["short_description"]),
        emoji: landmarkEmoji(p["icon_symbol"]),
        imageFile: asString(p["image_file"] ?? p["photo_file"]),
      };
    });
  return Promise.all(
    base.map(async (p) => {
      const { file, photoUrl } = await fetchSampleFile(
        "/sample-images/places/",
        p.imageFile
      );
      return {
        name: p.name,
        description: p.description,
        emoji: p.emoji,
        photoUrl,
        fileRef: file,
      };
    })
  );
}

/**
 * Maps the sample CogniCare patient JSON (e.g. patient_1_biren_borah_complete.json)
 * into the wizard's IntakeFormData. Fails gracefully with a friendly Error on any
 * malformed/unparseable input. Never throws on missing fields — missing sections
 * fall back to EMPTY_FORM defaults. When an entry carries an `image_file`, the
 * bundled photo is fetched, converted to a File, and given a preview object URL.
 */
export async function mapSampleJsonToFormData(
  jsonString: string
): Promise<IntakeFormData> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error(
      "Invalid JSON — could not parse the pasted text. Please paste a valid patient JSON object."
    );
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(
      "Invalid data — expected a JSON object like patient_1_biren_borah_complete.json."
    );
  }

  const data = parsed as Record<string, unknown>;

  const step1 = (data["step_1_about_patient"] ?? {}) as Record<string, unknown>;
  const ls = (data["step_4_life_story_and_interests"] ?? {}) as Record<string, unknown>;

  const mappedLifeEvents = mapLifeEvents(ls["key_life_events"]);
  const mappedInterests = mapInterests(ls["interests_and_hobbies"]);
  const [mappedRelatives, mappedLandmarks] = await Promise.all([
    mapRelatives(data["step_3_family_and_relatives"]),
    mapLandmarks(data["step_5_and_6_familiar_places"]),
  ]);

  return {
    ...EMPTY_FORM,
    personal: {
      fullName: asString(step1["full_name"]),
      dateOfBirth: parseDob(step1["date_of_birth"]),
      gender: asString(step1["gender"]).trim().toLowerCase(),
      phone: asString(step1["phone_number"]),
      relationship: asString(step1["form_filled_by"]).trim().toLowerCase(),
    },
    diagnostic: {
      ...EMPTY_FORM.diagnostic,
      skipped: true,
    },
    relatives: mappedRelatives ?? [],
    lifeStory: {
      ...EMPTY_FORM.lifeStory,
      occupation: asString(ls["occupation"]),
      lifeEvents: mappedLifeEvents ?? EMPTY_FORM.lifeStory.lifeEvents,
      interests: mappedInterests ?? [],
      favoriteMusic: asString(ls["favorite_music_or_artists"]),
      culturalBackground: asString(ls["cultural_background"]),
      preferredLanguage: languageCodeFromLabel(ls["preferred_language"]),
      joyNote: asString(ls["what_brings_them_joy"]),
    },
    landmarks: mappedLandmarks ?? [],
  };
}