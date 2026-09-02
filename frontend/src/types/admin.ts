export interface AdminOverview {
  totalPatients: number;
  activeCards: number;
  totalSessions: number;
  ollamaStatus: "UP" | "DOWN" | "UNREACHABLE" | string;
  dbStatus: string;
}

export interface AdminPatientRow {
  id: number;
  name: string;
  gender: string;
  preferredLanguage: string;
  phone: string;
  createdAt: string;
  hasActiveCard: boolean;
  activeCardToken?: string | null;
}

export interface AdminSessionRow {
  sessionId: number;
  patientId: number;
  patientName: string;
  gameType: string;
  durationSeconds: number;
  accuracyPercentage: number;
  motorReactionTimeMs: number;
  spatialRecallScore: number;
  hesitationCount: number;
  difficultyLevel: number;
  timestamp: string;
}

export interface AdminAiDiagnostics {
  status: "UP" | "DOWN" | string;
  host: string;
  latencyMs: number;
  availableModels: string[];
  defaultModel: string;
  clinicalPersona: string;
}

export interface AdminKioskStation {
  kioskId: string;
  stationName: string;
  locationDistrict: string;
  state: string;
  status: "ONLINE" | "IDLE" | "OFFLINE" | string;
  scansToday: number;
  lastPingAt: string;
}

export interface AdminDistrictHealth {
  state: string;
  district: string;
  enrolledPatients: number;
  mciStageCount: number;
  moderateStageCount: number;
  ashaWorkersActive: number;
  activeKiosks: number;
  cognitiveAdherenceRate: number;
  primaryPhc: string;
}

export interface AdminOfflineQueue {
  pendingSyncPackets: number;
  synchronizedToday: number;
  lowBandwidthMode: boolean;
  networkType: string;
  dataSavedPct: number;
  lastBatchSync: string;
  syncStatus: string;
}

export interface AdminAshaWorker {
  id: string;
  name: string;
  phone: string;
  assignedDistrict: string;
  primaryPhc: string;
  assignedPatients: number;
  homeVisitsThisWeek: number;
  openAlerts: number;
  status: "ACTIVE" | "ON_FIELD" | "OFFLINE" | string;
}

export interface AdminClinicalAlert {
  id: string;
  patientId: number;
  patientName: string;
  location: string;
  alertType: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE" | string;
  clinicalNote: string;
  assignedAsha: string;
  resolved: boolean;
  triggeredAt: string;
}

export interface AdminAiTuning {
  baselineReactionLatencyMs: number;
  hesitationThreshold: number;
  errorlessScaffolding: boolean;
  sundowningProtectionMode: boolean;
  primaryModel: string;
  speechRate: number;
  fallbackMode: string;
}

export interface AdminTeleManasConsultation {
  consultationId: string;
  patientId: number;
  patientName: string;
  specialistDoctor: string;
  hospitalCenter: string;
  primaryDiagnosis: string;
  scheduledAt: string;
  status: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "URGENT_REFERRAL" | string;
  videoCallUrl: string;
  aiPreAssessmentSummary: string;
}

export interface AdminMedicationAdherence {
  patientId: number;
  patientName: string;
  district: string;
  activePrescriptions: string[];
  adherenceRate: number;
  missedDosesThisWeek: number;
  hydrationAvgGlasses: number;
  lastDoseTakenAt: string;
  riskStatus: "STABLE" | "NEEDS_REMINDER" | "HIGH_RISK" | string;
}

export interface AdminKioskDevice {
  deviceId: string;
  villageLocation: string;
  state: string;
  batteryPct: number;
  cameraFps: number;
  storageFreeMb: number;
  firmwareVersion: string;
  isLowBandwidth2G: boolean;
  queuedPackets: number;
  lastHeartbeat: string;
  deviceHealth: "OPTIMAL" | "WARNING" | "OFFLINE" | string;
}

export interface AdminCulturalAsset {
  id: string;
  languageCode: string;
  languageName: string;
  category: string;
  textPrompt: string;
  nativeScript: string;
  missingWordAnswer: string;
  culturalContext: string;
}

export interface AdminAuditLog {
  id: string;
  actorRole: string;
  actorName: string;
  actionType: string;
  targetPatientId?: number | null;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export interface AdminAshaIncentive {
  workerId: string;
  workerName: string;
  district: string;
  primaryPhc: string;
  screeningsCompleted: number;
  assistedGameSessions: number;
  totalIncentiveInr: number;
  abhaLinkedBankMasked: string;
  disbursementStatus: "APPROVED" | "PENDING_VERIFICATION" | "DISBURSED" | string;
  lastVerifiedAt: string;
}

export interface AdminPredictiveTrajectory {
  patientId: number;
  patientName: string;
  currentStage: string;
  currentMocaScore: number;
  predictedMoca30Days: number;
  predictedMoca60Days: number;
  predictedMoca90Days: number;
  riskClassification: "STABLE_PRESERVED" | "MODERATE_RISK" | "ACCELERATED_DECLINE_RISK" | string;
  adherenceImpactFactor: number;
  recommendedInterventions: string[];
}

export interface AdminCaregiverBurnout {
  caregiverId: number;
  caregiverName: string;
  relationship: string;
  patientId: number;
  patientName: string;
  district: string;
  zaritBurdenScore: number;
  burdenCategory: "MILD_STRAIN" | "MODERATE_STRAIN" | "HIGH_BURNOUT_RISK" | string;
  weeklyNightWanderingAlerts: number;
  daysActiveThisMonth: number;
  respiteCareStatus: "RESPITE_RECOMMENDED" | "STABLE_COPING" | "COMMUNITY_ASHA_DISPATCHED" | string;
}

export interface AdminEmergencyBroadcast {
  broadcastId: string;
  targetState: string;
  targetDistrict: string;
  alertCategory: string;
  language: string;
  messageText: string;
  recipientsDelivered: number;
  dispatchedAt: string;
  dispatchStatus: string;
}
