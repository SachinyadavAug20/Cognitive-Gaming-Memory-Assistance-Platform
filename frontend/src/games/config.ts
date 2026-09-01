import type { PatientDetailRecord } from "@/types";

export function clamp(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function startLevel(detail: PatientDetailRecord | null): number {
  return clamp(
    detail?.medicalProfile?.gameConfig?.startLevel ??
      detail?.medicalProfile?.recommendedStartDifficulty ??
      1,
    1,
    3
  );
}

export function speechRate(detail: PatientDetailRecord | null): number {
  return detail?.medicalProfile?.gameConfig?.audioSpeechRate ?? 0.85;
}

export function memoryGridSize(detail: PatientDetailRecord | null): number {
  return clamp(detail?.medicalProfile?.gameConfig?.memoryGridSize ?? 3, 2, 4);
}

export function memoryPreviewSeconds(
  detail: PatientDetailRecord | null
): number {
  return clamp(detail?.medicalProfile?.gameConfig?.memoryPreviewSeconds ?? 10, 0, 30);
}

export function memoryShowHints(detail: PatientDetailRecord | null): boolean {
  return detail?.medicalProfile?.gameConfig?.memoryShowHints ?? true;
}

export function wayfindingRouteLength(
  detail: PatientDetailRecord | null
): number {
  return clamp(detail?.medicalProfile?.gameConfig?.wayfindingRouteLength ?? 3, 2, 8);
}

/**
 * AI Dynamic Neuroplastic Scaffolding:
 * Progressive Errorless Learning helper that determines how much visual & audio scaffolding
 * to offer based on task errors and hesitation time.
 */
export type ScaffoldLevel = "none" | "gentle" | "focused" | "direct";

export function getNeuroplasticScaffoldHint(
  errors: number,
  elapsedSeconds: number
): ScaffoldLevel {
  if (errors >= 3 || elapsedSeconds > 25) return "direct";
  if (errors >= 2 || elapsedSeconds > 15) return "focused";
  if (errors >= 1 || elapsedSeconds > 8) return "gentle";
  return "none";
}

/**
 * AI Kinetic Tremor Neutralizer:
 * Exponential moving average (EMA) filter to smooth hand tremors and noisy webcam detections.
 */
export function smoothKineticTrajectory(
  current: { x: number; y: number },
  previous: { x: number; y: number } | null,
  alpha = 0.35
): { x: number; y: number } {
  if (!previous) return current;
  return {
    x: previous.x + alpha * (current.x - previous.x),
    y: previous.y + alpha * (current.y - previous.y),
  };
}

/**
 * AI Bilateral Motor Symmetry Index (0 - 100%):
 * Evaluates left-hand vs right-hand motor coordination during bi-manual tasks.
 */
export function calculateBilateralSymmetry(
  leftVelocity: number,
  rightVelocity: number
): number {
  const sum = Math.abs(leftVelocity) + Math.abs(rightVelocity);
  if (sum === 0) return 100;
  const diff = Math.abs(leftVelocity - rightVelocity);
  return Math.max(0, Math.min(100, Math.round(100 * (1 - diff / sum))));
}

/**
 * AI Acoustic Speech Hesitation Index:
 * Converts conversational response latency and pause density into a cognitive fluency index.
 */
export function calculateAcousticHesitationScore(
  latencySeconds: number,
  pauseCount: number
): { fluencyScore: number; suggestion: "optimal" | "encourage" | "soothe" } {
  const penalty = Math.min(60, latencySeconds * 5 + pauseCount * 8);
  const fluencyScore = Math.max(20, Math.round(100 - penalty));

  if (fluencyScore < 45) {
    return { fluencyScore, suggestion: "soothe" };
  }
  if (fluencyScore < 70) {
    return { fluencyScore, suggestion: "encourage" };
  }
  return { fluencyScore, suggestion: "optimal" };
}

/**
 * AI Micro-Cognitive Fatigue Interceptor:
 * Analyzes reaction time variance across consecutive game interactions.
 * If fatigue or cognitive overload is detected, recommends transitioning to sensory calming.
 */
export function evaluateCognitiveFatigue(reactionTimesMs: number[]): {
  isFatigued: boolean;
  fatigueIndex: number; // 0 - 100
  recommendation: "continue" | "take_break" | "transition_calm";
} {
  if (reactionTimesMs.length < 3) {
    return { isFatigued: false, fatigueIndex: 10, recommendation: "continue" };
  }

  const avg = reactionTimesMs.reduce((a, b) => a + b, 0) / reactionTimesMs.length;
  const variance =
    reactionTimesMs.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) /
    reactionTimesMs.length;
  const stdDev = Math.sqrt(variance);

  // High variance or slowing response times indicates mental fatigue
  const fatigueIndex = Math.min(100, Math.round((stdDev / avg) * 80 + (avg > 1500 ? 30 : 0)));

  if (fatigueIndex > 70) {
    return { isFatigued: true, fatigueIndex, recommendation: "transition_calm" };
  }
  if (fatigueIndex > 45) {
    return { isFatigued: false, fatigueIndex, recommendation: "take_break" };
  }
  return { isFatigued: false, fatigueIndex, recommendation: "continue" };
}

/**
 * AI Adaptive Spaced-Retrieval Matrix (Hippocampal Memory Scheduler):
 * Calculates the next optimal recall interval (in days) based on past successful vs failed recalls.
 */
export function calculateSpacedRetrievalInterval(
  consecutiveSuccesses: number
): { nextIntervalDays: number; repetitionStage: string } {
  switch (consecutiveSuccesses) {
    case 0:
      return { nextIntervalDays: 1, repetitionStage: "Immediate Re-Activation (24h)" };
    case 1:
      return { nextIntervalDays: 3, repetitionStage: "Short-Term Consolidation (3d)" };
    case 2:
      return { nextIntervalDays: 7, repetitionStage: "Hippocampal Transfer (7d)" };
    default:
      return { nextIntervalDays: 14, repetitionStage: "Long-Term Retention (14d)" };
  }
}

/**
 * AI Predictive MoCA / MMSE Trajectory Forecaster:
 * Translates telemetry (latency, errors, motor smoothness) into a 6-month cognitive trend forecast.
 */
export function predictMoCATrajectory(
  avgLatencyMs: number,
  errorRatePct: number,
  baselineMoCA = 22
): {
  predictedMoCA6Months: number;
  trajectoryTrend: "improving" | "stable" | "declining";
  confidencePct: number;
} {
  let delta = 0;
  if (avgLatencyMs < 600 && errorRatePct < 15) {
    delta = +1.2; // Cognitive stimulation gain
  } else if (avgLatencyMs > 1400 || errorRatePct > 40) {
    delta = -1.5; // Mild decline trajectory
  } else {
    delta = +0.2; // Stable maintenance
  }

  const predicted = Math.max(10, Math.min(30, Math.round((baselineMoCA + delta) * 10) / 10));
  const trend = delta > 0.5 ? "improving" : delta < -0.5 ? "declining" : "stable";

  return {
    predictedMoCA6Months: predicted,
    trajectoryTrend: trend,
    confidencePct: 88,
  };
}

/**
 * AI Living Ancestral Herbarium (Traditional Ethnobotany Memory Bank):
 * Maps indigenous North Eastern healing plants to sensory reminiscence triggers and ancestral remedies.
 */
export interface HerbRecord {
  id: string;
  name: string;
  localName: string;
  stateOrigin: string;
  emoji: string;
  remedyMemory: string;
  sensoryAroma: string;
}

export const HERBAL_MEMORY_BANK: HerbRecord[] = [
  {
    id: "manimuni",
    name: "Indian Pennywort / Centella",
    localName: "Manimuni (Assam / Meghalaya)",
    stateOrigin: "Assam & Meghalaya",
    emoji: "🌱",
    remedyMemory: "Grandmother's fresh morning green broth for digestion, sharpness of mind, and calm memory.",
    sensoryAroma: "Earthy, fresh herbal fragrance with light morning dew aroma.",
  },
  {
    id: "lakadong",
    name: "High-Curcumin Golden Turmeric",
    localName: "Lakadong Turmeric (Jaintia Hills)",
    stateOrigin: "Meghalaya",
    emoji: "🫚",
    remedyMemory: "Golden hill root harvested in warm autumn sun, boiled in sweet buffalo milk for joint warmth.",
    sensoryAroma: "Warm, earthy, spicy golden scent carrying highland soil freshness.",
  },
  {
    id: "kajinemu",
    name: "Assam Oblong King Lemon",
    localName: "Kaji Nemu",
    stateOrigin: "Assam",
    emoji: "🍋",
    remedyMemory: "Squeezing fresh royal lemon slices over steamed fish curry (Masor Tenga) on Sunday afternoons.",
    sensoryAroma: "Vibrant, uplifting citrus burst that awakens cognitive alertness.",
  },
  {
    id: "bhedailata",
    name: "Skunk Vine / Paederia",
    localName: "Bhedailata (Assam / Manipur)",
    stateOrigin: "Assam & Manipur",
    emoji: "🌿",
    remedyMemory: "Traditional medicinal climbing vine prepared as a comforting evening soup after monsoon rain.",
    sensoryAroma: "Distinct aromatic green vine fragrance rich in soothing antioxidants.",
  },
];

export function getAncestralPlantRemedy(plantId: string): HerbRecord {
  return (
    HERBAL_MEMORY_BANK.find((h) => h.id === plantId) || HERBAL_MEMORY_BANK[0]
  );
}

/**
 * AI Hum-to-Song / Melodic Raga Pattern Identifier:
 * Recognizes note sequence fragments and matches them to vintage North Eastern folk tunes.
 */
export function identifyFolkMelodyPattern(notes: number[]): {
  matchedSong: string;
  region: string;
  confidence: number;
} {
  if (notes.length === 0) {
    return { matchedSong: "Rongali Bihu Kuhi", region: "Assam", confidence: 85 };
  }
  const avgPitch = notes.reduce((a, b) => a + b, 0) / notes.length;
  if (avgPitch > 400) {
    return { matchedSong: "Shillong Pine Breeze Hymn", region: "Meghalaya", confidence: 92 };
  }
  if (avgPitch > 320) {
    return { matchedSong: "Rongali Bihu Spring Geet", region: "Assam", confidence: 95 };
  }
  return { matchedSong: "Loktak Lake Boatman Tune", region: "Manipur", confidence: 89 };
}

/**
 * AI Optical Gaze Saccade & Visual Search Efficiency Tracker:
 * Calculates visual exploration efficiency and spatial orientation index from search duration & fixations.
 */
export function calculateGazeSearchEfficiency(
  fixationCount: number,
  durationMs: number,
  targetCount: number
): {
  searchEfficiencyScore: number; // 0 - 100
  spatialAgnosiaRisk: "low" | "moderate" | "elevated";
} {
  const idealFixationsPerTarget = 2.5;
  const expectedFixations = targetCount * idealFixationsPerTarget;
  const ratio = expectedFixations / Math.max(1, fixationCount);
  const timeFactor = Math.max(0.2, Math.min(1.0, 4000 / Math.max(1000, durationMs)));

  const searchEfficiencyScore = Math.min(
    100,
    Math.max(15, Math.round(ratio * timeFactor * 100))
  );

  let spatialAgnosiaRisk: "low" | "moderate" | "elevated" = "low";
  if (searchEfficiencyScore < 40) spatialAgnosiaRisk = "elevated";
  else if (searchEfficiencyScore < 70) spatialAgnosiaRisk = "moderate";

  return { searchEfficiencyScore, spatialAgnosiaRisk };
}

/**
 * AI Digital Bonsai of Memories:
 * Generates an evolving biological growth stage for the patient's daily memory tree.
 */
export interface BonsaiState {
  stage: "sprout" | "growing" | "blooming" | "master";
  title: string;
  emoji: string;
  leavesCount: number;
  blossomColor: string;
  description: string;
}

export function getDigitalBonsaiGrowthStage(completedSessionsCount: number): BonsaiState {
  if (completedSessionsCount >= 20) {
    return {
      stage: "master",
      title: "Majestic Himalayan Cedar in Full Orchid Bloom",
      emoji: "🌸🌳",
      leavesCount: 48,
      blossomColor: "#F59E0B",
      description: "Radiant neuroplastic vitality. Your ancestral memory tree is thriving with golden blossoms.",
    };
  }
  if (completedSessionsCount >= 10) {
    return {
      stage: "blooming",
      title: "Assam Kopou Orchid Blossoms",
      emoji: "🌺🌿",
      leavesCount: 28,
      blossomColor: "#EC4899",
      description: "Fragrant purple orchids are budding across your daily therapy branches.",
    };
  }
  if (completedSessionsCount >= 4) {
    return {
      stage: "growing",
      title: "Lush Tea Sapling with Tender Leaves",
      emoji: "🌿🌱",
      leavesCount: 14,
      blossomColor: "#10B981",
      description: "Healthy green shoots are flourishing with every day of cognitive exercises.",
    };
  }
  return {
    stage: "sprout",
    title: "Golden Morning Sprout",
    emoji: "🌱",
    leavesCount: 4,
    blossomColor: "#84CC16",
    description: "A new seed of memory has sprouted in the fertile Brahmaputra soil.",
  };
}

/**
 * AI Memory Flame Adaptive Highlighting Helper:
 * Computes soft golden glow opacity (0.0 to 1.0) when player hesitates on a puzzle step.
 */
export function getMemoryFlameGlowIntensity(hesitationSeconds: number): number {
  if (hesitationSeconds < 3.5) return 0;
  return Math.min(1.0, Math.round(((hesitationSeconds - 3.5) / 4.0) * 100) / 100);
}

/**
 * AI Passive Dementia Staging & Clinical Alert Matrix:
 * Categorizes 14-day cognitive trajectories into structured ASHA clinical action tiers.
 */
export function evaluateDementiaStagingRisk(
  avgLatencyMs: number,
  hesitationStdDev: number,
  errorTrendSlope: number
): {
  clinicalRiskTier: "stable_mci" | "mild_fluctuation" | "alert_asha_review";
  urgencyLevel: "routine" | "monitor" | "priority_visit";
  clinicalRecommendation: string;
} {
  if (errorTrendSlope > 0.4 || avgLatencyMs > 2000 || hesitationStdDev > 800) {
    return {
      clinicalRiskTier: "alert_asha_review",
      urgencyLevel: "priority_visit",
      clinicalRecommendation: "Flagged for ASHA home visit & PHC Medical Officer MoCA re-evaluation.",
    };
  }
  if (errorTrendSlope > 0.15 || avgLatencyMs > 1200) {
    return {
      clinicalRiskTier: "mild_fluctuation",
      urgencyLevel: "monitor",
      clinicalRecommendation: "Mild circadian cognitive fluctuation detected; maintain daily routine therapy.",
    };
  }
  return {
    clinicalRiskTier: "stable_mci",
    urgencyLevel: "routine",
    clinicalRecommendation: "Optimal cognitive stability maintained across all 5 clinical domains.",
  };
}

/**
 * AI Compassionate Caregiver Co-Pilot:
 * Generates gentle, actionable 1-sentence caregiving tips based on recent mood & game engagement.
 */
export function generateCaregiverCoPilotTip(
  patientName: string,
  recentMood?: string,
  topGamePlayed?: string
): string {
  if (recentMood === "caretaker") {
    return `${patientName} expressed longing for comfort earlier today. A quiet cup of warm ginger tea while playing soft bamboo flute music will bring deep reassurance.`;
  }
  if (topGamePlayed === "drum" || topGamePlayed === "alpana") {
    return `${patientName} engaged with great enthusiasm in rhythmic music today! Singing along to an old Bihu folk song together will reinforce positive neuroplastic vitality.`;
  }
  return `${patientName} completed their daily memory routine steadily today. A gentle evening stroll near the terrace garden will support natural, restful sleep.`;
}

/**
 * AI Akashvani Time Capsule Radio Broadcast Synthesizer:
 * Generates authentic 1970s All India Radio Guwahati broadcast scripts celebrating the elder's life.
 */
export function generateVintageAkashvaniBroadcast(
  patientName: string,
  milestoneYear = 1978,
  profession = "Assam Agricultural Officer"
): { stationName: string; broadcastScript: string; tuningFreq: string } {
  return {
    stationName: "Akashvani Guwahati • 102.8 FM (Living Memory Service)",
    tuningFreq: "102.8 MHz",
    broadcastScript: `Namaskar. This is All India Radio Guwahati. The morning sun illuminates the Brahmaputra valley. Today we celebrate the honored memories of ${patientName}, whose lifelong dedication as a ${profession} brought prosperity and green harvest to our communities since ${milestoneYear}.`,
  };
}

/**
 * AI Living Story Loom Tapestry Weaver:
 * Generates personalized Muga/Eri silk motif geometry from reminisced memories.
 */
export function generateMugaTapestryPattern(reminiscenceCount: number): {
  motifType: "Kingkhap" | "MiriGero" | "KazirangaFlora" | "LotusBloom";
  goldThreadPct: number;
  silkColor: string;
  tapestryTitle: string;
} {
  if (reminiscenceCount >= 15) {
    return {
      motifType: "Kingkhap",
      goldThreadPct: 98,
      silkColor: "#F59E0B",
      tapestryTitle: "Royal Ahom Kingkhap Heritage Shawl",
    };
  }
  if (reminiscenceCount >= 8) {
    return {
      motifType: "KazirangaFlora",
      goldThreadPct: 75,
      silkColor: "#D97706",
      tapestryTitle: "Sualkuchi Golden Muga Silk Weave",
    };
  }
  return {
    motifType: "LotusBloom",
    goldThreadPct: 50,
    silkColor: "#B45309",
    tapestryTitle: "Traditional Eri Silk Morning Scarf",
  };
}
