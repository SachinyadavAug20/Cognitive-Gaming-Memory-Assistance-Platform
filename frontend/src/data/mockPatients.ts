import type { PatientDetailRecord, PatientSummary } from "@/types";
import type { DiagnosticData, IntakeFormData } from "@/types/intake";
import { DEMO_PATIENT_RECORD } from "./demoPatient";

export const DEFAULT_PATIENT_SUMMARIES: PatientSummary[] = [
  {
    id: 1,
    name: "Mary Nongrum",
    languagePreference: "en",
    dob: "1957-11-10",
  },
  {
    id: 2,
    name: "Biren Borah",
    languagePreference: "as",
    dob: "1954-05-15",
  },
];

export const MOCK_MARY_NONGRUM_RECORD: PatientDetailRecord = {
  id: 1,
  name: "Mary Nongrum",
  dob: "1957-11-10",
  gender: "Female",
  phone: "+91 94361 08722",
  relationship: "Child",
  caregiverId: 1,
  preferredLanguage: "en",
  culturalBackground:
    "Khasi community; celebrates Shad Suk Mynsiem and Christmas; loves wearing traditional Khasi Jainsem.",
  joyTriggers:
    "Tending to potted orchids on the veranda, listening to Sunday church bells, and holding hands with granddaughter Banylla.",
  photoUrl: null,
  createdAt: "2026-08-29T18:22:22Z",
  lifeStory: {
    occupation: "Retired Senior Head Nurse (Civil Hospital Shillong)",
    favoriteMusic:
      "Traditional Khasi gospel hymns, Lou Majaw acoustic melodies, choral church music, Jim Reeves classics.",
    hobbies: ["Gardening", "Religious", "Music", "Reading"],
    lifeEvents: [
      { event: "Graduated Nursing School", year: "1979", photoUrl: null },
      {
        event: "Marriage to Banker in Laitumkhrah",
        year: "1983",
        photoUrl: null,
      },
      { event: "Born daughter Daphisha", year: "1990", photoUrl: null },
      { event: "Retirement from Civil Hospital", year: "2017", photoUrl: null },
    ],
  },
  medicalProfile: {
    diagnosis: "Mild Cognitive Impairment (Amnestic Subtype)",
    icd10: "G31.84",
    dateOfDiagnosis: "2024-03-12",
    examiningPhysician: "Dr. Wanbha Kharkongor, MD (Neurology)",
    clinicOrHospital: "Civil Hospital Shillong",
    clinicalStage: "MCI",
    recommendedStartDifficulty: 1,
    llmSummary:
      "Mild cognitive impairment with preserved basic activities of daily living. Regular reminiscing and auditory rhythmic stimulation recommended.",
    testType: "MMSE",
    mmseScore: 24,
    maxScore: 30,
    mtaScore: "Grade 1",
    fazekasGrade: "Grade 1",
    impairedDomains:
      '[{"domain":"memory","impairment_level":"Mild","evidence":"Delayed recall score: 1/3."}]',
    primaryDeficits:
      '[{"domain":"memory","impairment_level":"Mild","evidence":"Delayed recall score: 1/3."}]',
    medications: ["Donepezil 5mg (bedtime)", "Multivitamin B-Complex"],
    subscaleScores: {
      orientation: { score: 9, max: 10 },
      registration: { score: 3, max: 3 },
      attention_calculation: { score: 4, max: 5 },
      recall: { score: 1, max: 3 },
      language_visuospatial: { score: 7, max: 9 },
    },
    domains: {
      memory: {
        needs_help: true,
        impairment_level: "Mild",
        score_pct: 65,
        evidence: "Short-term delayed recall deficit.",
      },
      attention: {
        needs_help: false,
        impairment_level: "None",
        score_pct: 85,
        evidence: null,
      },
      orientation: {
        needs_help: false,
        impairment_level: "None",
        score_pct: 90,
        evidence: null,
      },
    },
    gameConfig: {
      startLevel: 1,
      memoryGridSize: 2,
      memoryPreviewSeconds: 15,
      memoryShowHints: true,
      wayfindingRouteLength: 2,
      audioSpeechRate: 0.75,
    },
  },
  familyMembers: [
    {
      id: 1,
      name: "Daphisha Nongrum",
      relation: "Daughter",
      notes:
        "Lives in Shillong with me; school teacher at St. Mary's; prepares herbal morning tea and organizes medicines.",
      photoUrl: null,
    },
    {
      id: 2,
      name: "Banker Nongrum",
      relation: "Spouse",
      notes:
        "Married 45 years; retired forestry officer; loves tending the orchid and hydrangea garden with me.",
      photoUrl: null,
    },
    {
      id: 3,
      name: "Banylla Nongrum",
      relation: "Granddaughter",
      notes:
        "Granddaughter; loves reading illustrated Khasi folktales and singing church choir hymns with Kong Mary.",
      photoUrl: null,
    },
    {
      id: 4,
      name: "Pynskhem Nongrum",
      relation: "Son",
      notes:
        "Lives in Mawlai; works in state tourism; visits every Wednesday evening and brings traditional Khasi snacks.",
      photoUrl: null,
    },
    {
      id: 5,
      name: "Ibadalin Nongrum",
      relation: "Sister",
      notes:
        "Younger sister; lives near Police Bazar; knits woollen sweaters with me every Saturday afternoon.",
      photoUrl: null,
    },
  ],
  familiarPlaces: [
    {
      id: 1,
      name: "Home (Nongrim Hills Cottage)",
      category: "Home",
      description:
        "Where we live — wooden-roof heritage cottage with blooming orchid garden.",
      emoji: "home",
      photoUrl: null,
    },
    {
      id: 2,
      name: "Laitumkhrah Main Market",
      category: "Market",
      description:
        "Where we shop — bakery, fresh fruit stalls, and woollen garment shops.",
      emoji: "market",
      photoUrl: null,
    },
    {
      id: 3,
      name: "Cathedral of Mary Help of Christians",
      category: "Worship",
      description:
        "Place of worship — iconic blue cathedral in Laitumkhrah where she attends Sunday mass.",
      emoji: "temple",
      photoUrl: null,
    },
    {
      id: 4,
      name: "Shillong Civil Hospital OPD",
      category: "Hospital",
      description:
        "Where I worked for 35 years and get monthly blood pressure checkups.",
      emoji: "hospital",
      photoUrl: null,
    },
    {
      id: 5,
      name: "Ward's Lake (Nan Polok)",
      category: "Park",
      description:
        "Where we stroll — scenic horseshoe lake with wooden bridge, swans, and flowerbeds.",
      emoji: "park",
      photoUrl: null,
    },
  ],
  card: {
    secureToken: "95003062-8705-4506-a29e-410b96ff881e",
    patientId: 1,
    patientName: "Mary Nongrum",
    issuedAt: "2026-08-29T22:38:00Z",
    isActive: true,
  },
};

/** Pre-calibrated, high-fidelity clinical diagnostic extraction for demo PDF analysis */
export const DEMO_FAKE_DIAGNOSTIC_DATA: DiagnosticData = {
  diagnosis: "Mild Cognitive Impairment (Amnestic Multi-Domain)",
  icd10: "G31.84",
  dateOfDiagnosis: new Date().toISOString().split("T")[0],
  examiningPhysician: "Dr. Wanbha Kharkongor, MD (Neurology)",
  clinicOrHospital: "Civil Hospital Shillong / Gauhati Medical Center",
  testType: "MMSE",
  score: 23,
  maxScore: 30,
  stage: "MCI",
  severity: "Mild",
  cognitiveScores: [
    { testType: "MMSE", score: 23, maxScore: 30 },
    { testType: "MoCA", score: 21, maxScore: 30 },
  ],
  recommendedStartLevel: 1,
  mtaScore: "Grade 1 (Mild Entorhinal Atrophy)",
  fazekasGrade: "Grade 1 (Punctate White Matter Hyperintensities)",
  medications: [
    "Donepezil 5mg (once daily at bedtime)",
    "Citicoline 500mg (morning)",
    "Multivitamin B-Complex & Methylcobalamin",
  ],
  subscaleScores: {
    orientation: { score: 8, max: 10 },
    registration: { score: 3, max: 3 },
    attention_calculation: { score: 3, max: 5 },
    recall: { score: 1, max: 3 },
    language_visuospatial: { score: 8, max: 9 },
  },
  domains: {
    memory: {
      needs_help: true,
      impairment_level: "Mild",
      score_pct: 60,
      evidence: "Delayed recall score 1/3; benefits from associative cues and visual prompts.",
    },
    attention: {
      needs_help: false,
      impairment_level: "Mild",
      score_pct: 70,
      evidence: "Serial subtraction hesitation noted; rhythm auditory pacing recommended.",
    },
    orientation: {
      needs_help: false,
      impairment_level: "None",
      score_pct: 85,
      evidence: "Temporal orientation preserved; occasional date uncertainty.",
    },
    language: {
      needs_help: false,
      impairment_level: "None",
      score_pct: 90,
      evidence: "Fluent mother tongue conversation; naming and comprehension intact.",
    },
    visuospatial: {
      needs_help: false,
      impairment_level: "None",
      score_pct: 80,
      evidence: "Clock drawing intact with minor contour asymmetry.",
    },
    executive_function: {
      needs_help: true,
      impairment_level: "Mild",
      score_pct: 65,
      evidence: "Multistep planning slowing; calibrated for assisted navigation.",
    },
  },
  gameConfig: {
    startLevel: 1,
    memoryGridSize: 2,
    memoryPreviewSeconds: 15,
    memoryShowHints: true,
    wayfindingRouteLength: 2,
    audioSpeechRate: 0.75,
  },
  physicianNotes:
    "Patient exhibits early amnestic Mild Cognitive Impairment (MMSE 23/30). Preserved IADLs with mild short-term recall deficits. Cleared for multi-sensory cognitive stimulation CDTx exercises (3D Spatial, Webcam Kinematics, Auditory Beats) with low stress parameters.",
};

const ONBOARDED_PATIENTS_KEY = "cognicare_onboarded_patients";

export function getCustomOnboardedPatients(): PatientDetailRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ONBOARDED_PATIENTS_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as PatientDetailRecord[];
    if (!Array.isArray(list)) return [];

    // Filter out duplicates of default canonical patients and prevent duplicate names
    const seenNames = new Set<string>(["mary nongrum", "biren borah"]);
    const seenIds = new Set<number>([1, 2]);
    const cleanList: PatientDetailRecord[] = [];

    for (const p of list) {
      if (!p || !p.name) continue;
      const norm = p.name.trim().toLowerCase();
      if (seenNames.has(norm) || seenIds.has(p.id)) continue;
      seenNames.add(norm);
      seenIds.add(p.id);
      cleanList.push(p);
    }

    if (cleanList.length !== list.length) {
      window.localStorage.setItem(ONBOARDED_PATIENTS_KEY, JSON.stringify(cleanList));
    }

    return cleanList;
  } catch {
    return [];
  }
}

export function saveDemoPatientFromIntake(
  patientId: number,
  formData: IntakeFormData
): PatientDetailRecord {
  const diag = formData.diagnostic.extractedData || DEMO_FAKE_DIAGNOSTIC_DATA;
  const newRecord: PatientDetailRecord = {
    id: patientId,
    name: formData.personal.fullName || "Demo Patient",
    dob: formData.personal.dateOfBirth || "1956-06-15",
    gender: formData.personal.gender || "Female",
    phone: formData.personal.phone || "+91 98765 43210",
    relationship: formData.personal.relationship || "Caregiver",
    caregiverId: 1,
    preferredLanguage: formData.lifeStory.preferredLanguage || "en",
    culturalBackground:
      formData.lifeStory.culturalBackground ||
      "North East heritage, community traditions & cultural festivities.",
    joyTriggers:
      formData.lifeStory.joyNote ||
      "Morning tea, family music sessions, gardening, and village folklore.",
    photoUrl: null,
    createdAt: new Date().toISOString(),
    lifeStory: {
      occupation: formData.lifeStory.occupation || "Retired Senior Educator",
      favoriteMusic:
        formData.lifeStory.favoriteMusic ||
        "Traditional regional folk melodies, acoustic ballads & hymns.",
      hobbies:
        formData.lifeStory.interests && formData.lifeStory.interests.length > 0
          ? formData.lifeStory.interests
          : ["Gardening", "Music", "Reading"],
      lifeEvents:
        formData.lifeStory.lifeEvents && formData.lifeStory.lifeEvents.length > 0
          ? formData.lifeStory.lifeEvents.map((e) => ({
              event: e.event,
              year: e.year,
              photoUrl: e.photoUrl || null,
            }))
          : [
              { event: "Completed Higher Education", year: "1978", photoUrl: null },
              { event: "Family Residence Built", year: "1986", photoUrl: null },
              { event: "Retirement from Service", year: "2018", photoUrl: null },
            ],
    },
    medicalProfile: {
      diagnosis: diag.diagnosis || "Mild Cognitive Impairment (Amnestic Subtype)",
      icd10: diag.icd10 || "G31.84",
      dateOfDiagnosis: diag.dateOfDiagnosis || new Date().toISOString().split("T")[0],
      examiningPhysician: diag.examiningPhysician || "Dr. Wanbha Kharkongor, MD (Neurology)",
      clinicOrHospital: diag.clinicOrHospital || "Civil Hospital OPD",
      clinicalStage: diag.stage || "MCI",
      recommendedStartDifficulty: diag.recommendedStartLevel || 1,
      llmSummary: diag.physicianNotes || "Automated baseline calibrated for CDTx modules.",
      testType: diag.testType || "MMSE",
      mmseScore: diag.score ?? 23,
      maxScore: diag.maxScore ?? 30,
      mtaScore: diag.mtaScore || "Grade 1",
      fazekasGrade: diag.fazekasGrade || "Grade 1",
      impairedDomains: JSON.stringify([
        { domain: "memory", impairment_level: "Mild", evidence: "Delayed recall deficit" },
      ]),
      primaryDeficits: JSON.stringify([
        { domain: "memory", impairment_level: "Mild", evidence: "Delayed recall deficit" },
      ]),
      medications: diag.medications?.length ? diag.medications : ["Donepezil 5mg", "B-Complex"],
      subscaleScores: diag.subscaleScores || {
        orientation: { score: 8, max: 10 },
        registration: { score: 3, max: 3 },
        attention_calculation: { score: 3, max: 5 },
        recall: { score: 1, max: 3 },
        language_visuospatial: { score: 8, max: 9 },
      },
      domains: (diag.domains as any) || {
        memory: {
          needs_help: true,
          impairment_level: "Mild",
          score_pct: 60,
          evidence: "Delayed recall score 1/3.",
        },
      },
      gameConfig: diag.gameConfig || {
        startLevel: 1,
        memoryGridSize: 2,
        memoryPreviewSeconds: 15,
        memoryShowHints: true,
        wayfindingRouteLength: 2,
        audioSpeechRate: 0.75,
      },
    },
    familyMembers:
      formData.relatives && formData.relatives.length > 0
        ? formData.relatives.map((r, i) => ({
            id: i + 1,
            name: r.name || "Family Member",
            relation: r.relationship || "Relative",
            notes: r.notes || "Regular family visitor and support pillar.",
            photoUrl: r.photoUrl || null,
          }))
        : [
            {
              id: 1,
              name: "Priyanka Borah",
              relation: "Daughter",
              notes: "Primary caregiver; assists with daily routines and morning tea.",
              photoUrl: null,
            },
          ],
    familiarPlaces:
      formData.landmarks && formData.landmarks.length > 0
        ? formData.landmarks.map((l, i) => ({
            id: i + 1,
            name: l.name || "Neighborhood Place",
            category: "Place",
            description: l.description || "Familiar everyday destination.",
            emoji: l.emoji || "home",
            photoUrl: l.photoUrl || null,
          }))
        : [
            {
              id: 1,
              name: "Family Ancestral Home",
              category: "Home",
              description: "Quiet heritage residence with front courtyard.",
              emoji: "home",
              photoUrl: null,
            },
          ],
    card: {
      secureToken: `demo-token-${patientId}-${Date.now()}`,
      patientId,
      patientName: formData.personal.fullName || "Demo Patient",
      issuedAt: new Date().toISOString(),
      isActive: true,
    },
  };

  if (typeof window !== "undefined") {
    try {
      const existing = getCustomOnboardedPatients();
      const normNewName = (formData.personal.fullName || "").trim().toLowerCase();
      // Never duplicate default canonical patients
      if (normNewName !== "mary nongrum" && normNewName !== "biren borah") {
        const updated = [
          newRecord,
          ...existing.filter(
            (p) => p.id !== patientId && p.name.trim().toLowerCase() !== normNewName
          ),
        ];
        window.localStorage.setItem(ONBOARDED_PATIENTS_KEY, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn("Could not write to localStorage:", e);
    }
  }

  return newRecord;
}

export function getFallbackPatient(id: string | number): PatientDetailRecord {
  const numId = Number(id);
  const custom = getCustomOnboardedPatients();
  const customFound = custom.find((p) => p.id === numId);
  if (customFound) {
    return customFound;
  }

  if (numId === 1) {
    return MOCK_MARY_NONGRUM_RECORD;
  }

  if (numId === 2 || numId === 101) {
    return {
      ...DEMO_PATIENT_RECORD,
      id: numId,
    };
  }

  // Provide a complete, high-fidelity profile for any onboarded demo ID
  return {
    ...DEMO_PATIENT_RECORD,
    id: numId || 101,
    name: `Patient #${numId || 101}`,
    card: {
      secureToken: `demo-token-${numId || 101}`,
      patientId: numId || 101,
      patientName: `Patient #${numId || 101}`,
      issuedAt: new Date().toISOString(),
      isActive: true,
    },
  };
}

export function getAllPatientSummaries(): PatientSummary[] {
  const custom = getCustomOnboardedPatients().map((p) => ({
    id: p.id,
    name: p.name,
    languagePreference: p.preferredLanguage,
    dob: p.dob,
  }));

  const seenNames = new Set<string>();
  const seenIds = new Set<number>();
  const list: PatientSummary[] = [];

  // Default patients (Mary Nongrum = 1, Biren Borah = 2) always appear once
  for (const def of DEFAULT_PATIENT_SUMMARIES) {
    seenNames.add(def.name.trim().toLowerCase());
    seenIds.add(def.id);
    list.push(def);
  }

  // Any custom unique patient
  for (const c of custom) {
    const norm = c.name.trim().toLowerCase();
    if (!seenNames.has(norm) && !seenIds.has(c.id)) {
      seenNames.add(norm);
      seenIds.add(c.id);
      list.push(c);
    }
  }

  return list;
}
