export type PhotoCategory = "all" | "family" | "places" | "portrait" | "custom";

export interface PatientPhotoItem {
  id: string;
  url: string;
  label: string;
  category: "family" | "places" | "portrait" | "custom";
  categoryLabel?: string;
  subtext?: string;
}

export const BIREN_BORAH_PHOTOS: PatientPhotoItem[] = [
  {
    id: "biren-home",
    url: "/sample-images/patient_1_biren_borah/places/01_home_silpukhuri_residence.jpg",
    label: "Silpukhuri Residence Verandah",
    category: "places",
    subtext: "Family Home & Courtyard",
  },
  {
    id: "biren-pratima",
    url: "/sample-images/patient_1_biren_borah/relatives/02_spouse_pratima_borah.jpg",
    label: "Wife Pratima Borah",
    category: "family",
    subtext: "Beloved Spouse (46 Years)",
  },
  {
    id: "biren-manash",
    url: "/sample-images/patient_1_biren_borah/relatives/01_son_manash_borah.jpg",
    label: "Son Manash Borah",
    category: "family",
    subtext: "Eldest Son",
  },
  {
    id: "biren-namghar",
    url: "/sample-images/patient_1_biren_borah/places/03_silpukhuri_hari_namghar.jpg",
    label: "Hari Namghar Prayer Hall",
    category: "places",
    subtext: "Community Prayer Hall",
  },
  {
    id: "biren-ananya",
    url: "/sample-images/patient_1_biren_borah/relatives/03_daughter_ananya_borah.jpg",
    label: "Daughter Ananya Borah",
    category: "family",
    subtext: "Youngest Daughter",
  },
  {
    id: "biren-arnav",
    url: "/sample-images/patient_1_biren_borah/relatives/04_grandchild_arnav_borah.jpg",
    label: "Grandson Arnav Borah",
    category: "family",
    subtext: "Beloved Grandchild (Age 8)",
  },
  {
    id: "biren-market",
    url: "/sample-images/patient_1_biren_borah/places/02_silpukhuri_daily_market.jpg",
    label: "Silpukhuri Daily Bazaar",
    category: "places",
    subtext: "Morning River Fish & Greens",
  },
  {
    id: "biren-dighalipukhuri",
    url: "/sample-images/patient_1_biren_borah/places/05_dighalipukhuri_lake_park.jpg",
    label: "Dighalipukhuri Lake Park",
    category: "places",
    subtext: "Evening Walking Trail",
  },
  {
    id: "biren-dhireswar",
    url: "/sample-images/patient_1_biren_borah/relatives/05_sibling_dhireswar_borah.jpg",
    label: "Brother Dhireswar Borah",
    category: "family",
    subtext: "Elder Brother (Jorhat)",
  },
  {
    id: "biren-clinic",
    url: "/sample-images/patient_1_biren_borah/places/04_community_phc_clinic.jpg",
    label: "Silpukhuri Community Clinic",
    category: "places",
    subtext: "Familiar Health Center",
  },
  {
    id: "biren-portrait",
    url: "/sample-images/patient_1_biren_borah/patient_profile_photo_biren_borah.jpg",
    label: "Portrait of Biren Borah",
    category: "portrait",
    subtext: "Headmaster & Father",
  },
];

export const MARY_NONGRUM_PHOTOS: PatientPhotoItem[] = [
  {
    id: "mary-home",
    url: "/sample-images/patient_2_mary_nongrum/places/01_home_nongrim_hills_cottage.jpg",
    label: "Nongrim Hills Cottage",
    category: "places",
    subtext: "Heritage Cottage, Shillong",
  },
  {
    id: "mary-daphisha",
    url: "/sample-images/patient_2_mary_nongrum/relatives/01_daughter_daphisha_nongrum.jpg",
    label: "Daughter Daphisha Nongrum",
    category: "family",
    subtext: "Loving Daughter",
  },
  {
    id: "mary-cathedral",
    url: "/sample-images/patient_2_mary_nongrum/places/03_cathedral_mary_help_christians.jpg",
    label: "Cathedral of Mary Help of Christians",
    category: "places",
    subtext: "Blue Spire Cathedral",
  },
  {
    id: "mary-spouse",
    url: "/sample-images/patient_2_mary_nongrum/relatives/02_spouse_banker_nongrum.jpg",
    label: "Spouse Banker Nongrum",
    category: "family",
    subtext: "Beloved Husband",
  },
  {
    id: "mary-banylla",
    url: "/sample-images/patient_2_mary_nongrum/relatives/03_grandchild_banylla_nongrum.jpg",
    label: "Grandchild Banylla Nongrum",
    category: "family",
    subtext: "Granddaughter",
  },
  {
    id: "mary-market",
    url: "/sample-images/patient_2_mary_nongrum/places/02_laitumkhrah_main_market.jpg",
    label: "Laitumkhrah Main Market",
    category: "places",
    subtext: "Distant Friendly Market",
  },
  {
    id: "mary-son",
    url: "/sample-images/patient_2_mary_nongrum/relatives/04_son_pynskhem_nongrum.jpg",
    label: "Son Pynskhem Nongrum",
    category: "family",
    subtext: "Eldest Son",
  },
  {
    id: "mary-wards-lake",
    url: "/sample-images/patient_2_mary_nongrum/places/05_wards_lake_nan_polok.jpg",
    label: "Ward's Lake (Nan Polok)",
    category: "places",
    subtext: "Wooden Bridge & Cherry Blossoms",
  },
  {
    id: "mary-sister",
    url: "/sample-images/patient_2_mary_nongrum/relatives/05_sibling_ibadalin_nongrum.jpg",
    label: "Sister Ibadalin Nongrum",
    category: "family",
    subtext: "Sister",
  },
  {
    id: "mary-clinic",
    url: "/sample-images/patient_2_mary_nongrum/places/04_shillong_civil_hospital.jpg",
    label: "Shillong Civil Hospital",
    category: "places",
    subtext: "Wellness Clinic",
  },
  {
    id: "mary-portrait",
    url: "/sample-images/patient_2_mary_nongrum/patient_profile_photo_mary_nongrum.jpg",
    label: "Portrait of Mary Nongrum",
    category: "portrait",
    subtext: "Mother & Elder",
  },
];

export const IBOCHOUBA_SINGH_PHOTOS: PatientPhotoItem[] = [
  {
    id: "ibochouba-home",
    url: "/sample-images/patient_3_ibochouba_singh/places/01_home_uripok_courtyard.jpg",
    label: "Uripok Courtyard Residence",
    category: "places",
    subtext: "Traditional Homestead, Imphal",
  },
  {
    id: "ibochouba-spouse",
    url: "/sample-images/patient_3_ibochouba_singh/relatives/01_spouse_sanatombi_devi.jpg",
    label: "Spouse Sanatombi Devi",
    category: "family",
    subtext: "Beloved Wife",
  },
  {
    id: "ibochouba-market",
    url: "/sample-images/patient_3_ibochouba_singh/places/02_ema_keithel_market.jpg",
    label: "Ema Keithel Market",
    category: "places",
    subtext: "Mother's Market, Imphal",
  },
  {
    id: "ibochouba-son",
    url: "/sample-images/patient_3_ibochouba_singh/relatives/02_son_birjit_singh.jpg",
    label: "Son Birjit Singh",
    category: "family",
    subtext: "Eldest Son",
  },
  {
    id: "ibochouba-temple",
    url: "/sample-images/patient_3_ibochouba_singh/places/03_shree_govindaji_temple.jpg",
    label: "Shree Govindaji Temple",
    category: "places",
    subtext: "Sacred Temple",
  },
  {
    id: "ibochouba-daughter",
    url: "/sample-images/patient_3_ibochouba_singh/relatives/03_daughter_memcha_devi.jpg",
    label: "Daughter Memcha Devi",
    category: "family",
    subtext: "Daughter",
  },
  {
    id: "ibochouba-grandchild",
    url: "/sample-images/patient_3_ibochouba_singh/relatives/04_grandchild_tomba_singh.jpg",
    label: "Grandson Tomba Singh",
    category: "family",
    subtext: "Grandchild",
  },
  {
    id: "ibochouba-kangla",
    url: "/sample-images/patient_3_ibochouba_singh/places/05_kangla_fort_moat_park.jpg",
    label: "Kangla Fort & Moat Park",
    category: "places",
    subtext: "Historic Sanctuary",
  },
  {
    id: "ibochouba-sibling",
    url: "/sample-images/patient_3_ibochouba_singh/relatives/05_sibling_tombi_singh.jpg",
    label: "Brother Tombi Singh",
    category: "family",
    subtext: "Brother",
  },
  {
    id: "ibochouba-clinic",
    url: "/sample-images/patient_3_ibochouba_singh/places/04_rims_hospital_clinic.jpg",
    label: "RIMS Hospital & Clinic",
    category: "places",
    subtext: "Medical Care",
  },
  {
    id: "ibochouba-portrait",
    url: "/sample-images/patient_3_ibochouba_singh/patient_profile_photo_ibochouba_singh.jpg",
    label: "Portrait of Ibochouba Singh",
    category: "portrait",
    subtext: "Veteran & Elder",
  },
];

export const LALHMINGMAWII_SAILO_PHOTOS: PatientPhotoItem[] = [
  {
    id: "sailo-home",
    url: "/sample-images/patient_4_lalhmingmawii_sailo/places/01_home_zarkawt_residence.jpg",
    label: "Zarkawt Residence",
    category: "places",
    subtext: "Aizawl Family Home",
  },
  {
    id: "sailo-spouse",
    url: "/sample-images/patient_4_lalhmingmawii_sailo/relatives/01_spouse_lalrinzuala_sailo.jpg",
    label: "Spouse Lalrinzuala Sailo",
    category: "family",
    subtext: "Beloved Husband",
  },
  {
    id: "sailo-church",
    url: "/sample-images/patient_4_lalhmingmawii_sailo/places/03_zarkawt_presbyterian_church.jpg",
    label: "Zarkawt Presbyterian Church",
    category: "places",
    subtext: "Sunday Fellowship",
  },
  {
    id: "sailo-daughter",
    url: "/sample-images/patient_4_lalhmingmawii_sailo/relatives/02_daughter_vanlalruati_sailo.jpg",
    label: "Daughter Vanlalruati Sailo",
    category: "family",
    subtext: "Loving Daughter",
  },
  {
    id: "sailo-bazar",
    url: "/sample-images/patient_4_lalhmingmawii_sailo/places/02_aizawl_bara_bazar.jpg",
    label: "Aizawl Bara Bazar",
    category: "places",
    subtext: "Marketplace",
  },
  {
    id: "sailo-son",
    url: "/sample-images/patient_4_lalhmingmawii_sailo/relatives/03_son_lalbiakzuala_sailo.jpg",
    label: "Son Lalbiakzuala Sailo",
    category: "family",
    subtext: "Son",
  },
  {
    id: "sailo-grandchild",
    url: "/sample-images/patient_4_lalhmingmawii_sailo/relatives/04_grandchild_lalramchhani_sailo.jpg",
    label: "Granddaughter Lalramchhani Sailo",
    category: "family",
    subtext: "Granddaughter",
  },
  {
    id: "sailo-durtlang",
    url: "/sample-images/patient_4_lalhmingmawii_sailo/places/05_durtlang_hills_viewpoint.jpg",
    label: "Durtlang Hills Viewpoint",
    category: "places",
    subtext: "Scenic Mountain Breeze",
  },
  {
    id: "sailo-sibling",
    url: "/sample-images/patient_4_lalhmingmawii_sailo/relatives/05_sibling_lalthanmawii_sailo.jpg",
    label: "Sister Lalthanmawii Sailo",
    category: "family",
    subtext: "Sister",
  },
  {
    id: "sailo-clinic",
    url: "/sample-images/patient_4_lalhmingmawii_sailo/places/04_aizawl_civil_hospital.jpg",
    label: "Aizawl Civil Hospital",
    category: "places",
    subtext: "Hospital & Care",
  },
  {
    id: "sailo-portrait",
    url: "/sample-images/patient_4_lalhmingmawii_sailo/patient_profile_photo_lalhmingmawii_sailo.jpg",
    label: "Portrait of Lalhmingmawii Sailo",
    category: "portrait",
    subtext: "Mother & Elder",
  },
];

export const KEVICHUSA_ANGAMI_PHOTOS: PatientPhotoItem[] = [
  {
    id: "angami-home",
    url: "/sample-images/patient_5_kevichusa_angami/places/01_home_midland_homestead.jpg",
    label: "Midland Homestead",
    category: "places",
    subtext: "Kohima Family Homestead",
  },
  {
    id: "angami-daughter",
    url: "/sample-images/patient_5_kevichusa_angami/relatives/01_daughter_seyievinuo_angami.jpg",
    label: "Daughter Seyievinuo Angami",
    category: "family",
    subtext: "Daughter",
  },
  {
    id: "angami-spouse",
    url: "/sample-images/patient_5_kevichusa_angami/relatives/02_spouse_neiphrelie_angami.jpg",
    label: "Spouse Neiphrelie Angami",
    category: "family",
    subtext: "Spouse",
  },
  {
    id: "angami-cathedral",
    url: "/sample-images/patient_5_kevichusa_angami/places/03_cathedral_kohima_aradurah.jpg",
    label: "Cathedral Kohima Aradurah",
    category: "places",
    subtext: "Aradurah Hill Church",
  },
  {
    id: "angami-market",
    url: "/sample-images/patient_5_kevichusa_angami/places/02_kohima_mao_market.jpg",
    label: "Kohima Mao Market",
    category: "places",
    subtext: "Produce Market",
  },
  {
    id: "angami-son",
    url: "/sample-images/patient_5_kevichusa_angami/relatives/03_son_kevilezo_angami.jpg",
    label: "Son Kevilezo Angami",
    category: "family",
    subtext: "Son",
  },
  {
    id: "angami-grandchild",
    url: "/sample-images/patient_5_kevichusa_angami/relatives/04_grandchild_vimenuo_angami.jpg",
    label: "Granddaughter Vimenuo Angami",
    category: "family",
    subtext: "Granddaughter",
  },
  {
    id: "angami-memorial",
    url: "/sample-images/patient_5_kevichusa_angami/places/05_war_cemetery_memorial_park.jpg",
    label: "War Cemetery Memorial Park",
    category: "places",
    subtext: "Peace Memorial Park",
  },
  {
    id: "angami-sibling",
    url: "/sample-images/patient_5_kevichusa_angami/relatives/05_sibling_vitsore_angami.jpg",
    label: "Brother Vitsore Angami",
    category: "family",
    subtext: "Brother",
  },
  {
    id: "angami-clinic",
    url: "/sample-images/patient_5_kevichusa_angami/places/04_naga_hospital_clinic.jpg",
    label: "Naga Hospital Clinic",
    category: "places",
    subtext: "Care Clinic",
  },
  {
    id: "angami-portrait",
    url: "/sample-images/patient_5_kevichusa_angami/patient_profile_photo_kevichusa_angami.jpg",
    label: "Portrait of Kevichusa Angami",
    category: "portrait",
    subtext: "Elder & Patriarch",
  },
];

const CUSTOM_PHOTOS_KEY = "cognicare_custom_patient_photos";

export function getCustomPatientPhotos(patientId?: number): PatientPhotoItem[] {
  if (typeof window === "undefined" || !patientId) return [];
  try {
    const key = CUSTOM_PHOTOS_KEY + "_" + patientId;
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const list = JSON.parse(raw) as PatientPhotoItem[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function saveCustomPatientPhoto(
  patientId: number,
  photo: PatientPhotoItem
): PatientPhotoItem[] {
  if (typeof window === "undefined") return [photo];
  try {
    const key = CUSTOM_PHOTOS_KEY + "_" + patientId;
    const existing = getCustomPatientPhotos(patientId);
    const updated = [photo, ...existing.filter((p) => p.id !== photo.id)];
    window.localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn("Could not save custom photo to localStorage:", e);
    return [photo];
  }
}

export function getPatientPhotos(
  patientId?: number,
  patientName?: string
): PatientPhotoItem[] {
  const custom = getCustomPatientPhotos(patientId);
  const name = (patientName || "").toLowerCase();
  let base: PatientPhotoItem[] = BIREN_BORAH_PHOTOS;

  if (patientId === 1 || name.includes("mary") || name.includes("nongrum")) {
    base = MARY_NONGRUM_PHOTOS;
  } else if (patientId === 3 || name.includes("ibochouba") || name.includes("singh")) {
    base = IBOCHOUBA_SINGH_PHOTOS;
  } else if (patientId === 4 || name.includes("sailo") || name.includes("lalhmingmawii")) {
    base = LALHMINGMAWII_SAILO_PHOTOS;
  } else if (patientId === 5 || name.includes("angami") || name.includes("kevichusa")) {
    base = KEVICHUSA_ANGAMI_PHOTOS;
  }

  if (custom.length > 0) {
    return [...custom, ...base];
  }
  return base;
}
