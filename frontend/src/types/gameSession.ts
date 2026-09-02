export type GameTypeKey =
  | "MAJULI_WALK"
  | "TEA_HARVEST"
  | "BIHU_DHOL"
  | "MEMORY_PIECES"
  | "ARROW_ESCAPE"
  | "VOICE_BRAHMAPUTRA"
  | "DAY_IN_MY_WORLD"
  | "BAZAAR_BUDDIES"
  | "MEMORY_GARDEN"
  | "MEMORY_ROAD";

export interface GameSessionPayload {
  patientId: number;
  gameType: GameTypeKey;
  durationSeconds: number;
  accuracyPercentage: number;
  spatialRecallScore?: number;
  motorReactionTimeMs?: number;
  hesitationCount: number;
  difficultyLevel: number;
}

export interface GameSessionRecord extends GameSessionPayload {
  id: number;
  timestamp: string;
}

export interface GameSessionStats {
  totalSessions: number;
  averageAccuracy: number;
  averageMotorLatencyMs: number;
  averageSpatialRecall: number;
  recentSessions: GameSessionRecord[];
  aiClinicalSummary?: string;
}
