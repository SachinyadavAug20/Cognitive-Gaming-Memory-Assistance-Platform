package com.cognicare.data.remote

import com.google.gson.annotations.SerializedName

data class AdminOverviewDto(
    @SerializedName("totalPatients") val totalPatients: Long,
    @SerializedName("activeCards") val activeCards: Long,
    @SerializedName("totalSessions") val totalSessions: Long,
    @SerializedName("ollamaStatus") val ollamaStatus: String?,
    @SerializedName("dbStatus") val dbStatus: String?
)

data class AdminPatientRowDto(
    @SerializedName("id") val id: Long,
    @SerializedName("name") val name: String?,
    @SerializedName("gender") val gender: String?,
    @SerializedName("preferredLanguage") val preferredLanguage: String?,
    @SerializedName("phone") val phone: String?,
    @SerializedName("createdAt") val createdAt: String?,
    @SerializedName("hasActiveCard") val hasActiveCard: Boolean,
    @SerializedName("activeCardToken") val activeCardToken: String?
)

data class AdminAiDiagnosticsDto(
    @SerializedName("status") val status: String?,
    @SerializedName("host") val host: String?,
    @SerializedName("latencyMs") val latencyMs: Long,
    @SerializedName("availableModels") val availableModels: List<String>,
    @SerializedName("defaultModel") val defaultModel: String?,
    @SerializedName("clinicalPersona") val clinicalPersona: String?
)

data class AdminSessionRowDto(
    @SerializedName("sessionId") val sessionId: Long,
    @SerializedName("patientId") val patientId: Long,
    @SerializedName("patientName") val patientName: String?,
    @SerializedName("gameType") val gameType: String?,
    @SerializedName("durationSeconds") val durationSeconds: Int?,
    @SerializedName("accuracyPercentage") val accuracyPercentage: Double?,
    @SerializedName("motorReactionTimeMs") val motorReactionTimeMs: Int?,
    @SerializedName("spatialRecallScore") val spatialRecallScore: Int?,
    @SerializedName("hesitationCount") val hesitationCount: Int?,
    @SerializedName("difficultyLevel") val difficultyLevel: Int?,
    @SerializedName("timestamp") val timestamp: String?
)

data class AdminDistrictHealthDto(
    @SerializedName("state") val state: String?,
    @SerializedName("district") val district: String?,
    @SerializedName("enrolledPatients") val enrolledPatients: Int,
    @SerializedName("mciStageCount") val mciStageCount: Int,
    @SerializedName("moderateStageCount") val moderateStageCount: Int,
    @SerializedName("ashaWorkersActive") val ashaWorkersActive: Int,
    @SerializedName("activeKiosks") val activeKiosks: Int,
    @SerializedName("cognitiveAdherenceRate") val cognitiveAdherenceRate: Double,
    @SerializedName("primaryPhc") val primaryPhc: String?
)

data class AdminOfflineQueueDto(
    @SerializedName("pendingSyncPackets") val pendingSyncPackets: Int,
    @SerializedName("synchronizedToday") val synchronizedToday: Int,
    @SerializedName("lowBandwidthMode") val lowBandwidthMode: Boolean,
    @SerializedName("networkType") val networkType: String?,
    @SerializedName("dataSavedPct") val dataSavedPct: Double,
    @SerializedName("lastBatchSync") val lastBatchSync: String?,
    @SerializedName("syncStatus") val syncStatus: String?
)

data class AdminEpidemiologicalSurveillanceDto(
    @SerializedName("state") val state: String?,
    @SerializedName("stateCode") val stateCode: String?,
    @SerializedName("estimatedElderlyPopulation") val estimatedElderlyPopulation: Long,
    @SerializedName("screenedPatientsCount") val screenedPatientsCount: Int,
    @SerializedName("mciPrevalencePct") val mciPrevalencePct: Double,
    @SerializedName("dementiaPrevalencePct") val dementiaPrevalencePct: Double,
    @SerializedName("earlyInterventionIndexPct") val earlyInterventionIndexPct: Double,
    @SerializedName("remoteTerrainBarrierIndex") val remoteTerrainBarrierIndex: String?,
    @SerializedName("offlineSyncDelayAvgHours") val offlineSyncDelayAvgHours: Double,
    @SerializedName("activeAshaUnits") val activeAshaUnits: Int,
    @SerializedName("highRiskWanderingFlagged") val highRiskWanderingFlagged: Int
)

data class AdminAshaWorkerDto(
    @SerializedName("id") val id: String?,
    @SerializedName("name") val name: String?,
    @SerializedName("phone") val phone: String?,
    @SerializedName("assignedDistrict") val assignedDistrict: String?,
    @SerializedName("primaryPhc") val primaryPhc: String?,
    @SerializedName("assignedPatients") val assignedPatients: Int,
    @SerializedName("homeVisitsThisWeek") val homeVisitsThisWeek: Int,
    @SerializedName("openAlerts") val openAlerts: Int,
    @SerializedName("status") val status: String?
)

data class AdminClinicalAlertDto(
    @SerializedName("id") val id: String?,
    @SerializedName("patientId") val patientId: Long?,
    @SerializedName("patientName") val patientName: String?,
    @SerializedName("location") val location: String?,
    @SerializedName("alertType") val alertType: String?,
    @SerializedName("severity") val severity: String?,
    @SerializedName("clinicalNote") val clinicalNote: String?,
    @SerializedName("assignedAsha") val assignedAsha: String?,
    @SerializedName("resolved") val resolved: Boolean,
    @SerializedName("triggeredAt") val triggeredAt: String?
)

data class AdminAiTuningDto(
    @SerializedName("baselineReactionLatencyMs") val baselineReactionLatencyMs: Int,
    @SerializedName("hesitationThreshold") val hesitationThreshold: Int,
    @SerializedName("errorlessScaffolding") val errorlessScaffolding: Boolean,
    @SerializedName("sundowningProtectionMode") val sundowningProtectionMode: Boolean,
    @SerializedName("primaryModel") val primaryModel: String?,
    @SerializedName("speechRate") val speechRate: Double,
    @SerializedName("fallbackMode") val fallbackMode: String?
)

data class AdminTeleManasConsultationDto(
    @SerializedName("consultationId") val consultationId: String?,
    @SerializedName("patientId") val patientId: Long?,
    @SerializedName("patientName") val patientName: String?,
    @SerializedName("specialistDoctor") val specialistDoctor: String?,
    @SerializedName("hospitalCenter") val hospitalCenter: String?,
    @SerializedName("primaryDiagnosis") val primaryDiagnosis: String?,
    @SerializedName("scheduledAt") val scheduledAt: String?,
    @SerializedName("status") val status: String?,
    @SerializedName("videoCallUrl") val videoCallUrl: String?,
    @SerializedName("aiPreAssessmentSummary") val aiPreAssessmentSummary: String?
)

data class AdminMedicationAdherenceDto(
    @SerializedName("patientId") val patientId: Long?,
    @SerializedName("patientName") val patientName: String?,
    @SerializedName("district") val district: String?,
    @SerializedName("activePrescriptions") val activePrescriptions: List<String>,
    @SerializedName("adherenceRate") val adherenceRate: Double,
    @SerializedName("missedDosesThisWeek") val missedDosesThisWeek: Int,
    @SerializedName("hydrationAvgGlasses") val hydrationAvgGlasses: Int,
    @SerializedName("lastDoseTakenAt") val lastDoseTakenAt: String?,
    @SerializedName("riskStatus") val riskStatus: String?
)

data class AdminKioskDeviceDto(
    @SerializedName("deviceId") val deviceId: String?,
    @SerializedName("villageLocation") val villageLocation: String?,
    @SerializedName("state") val state: String?,
    @SerializedName("batteryPct") val batteryPct: Int,
    @SerializedName("cameraFps") val cameraFps: Int,
    @SerializedName("storageFreeMb") val storageFreeMb: Int,
    @SerializedName("firmwareVersion") val firmwareVersion: String?,
    @SerializedName("isLowBandwidth2G") val isLowBandwidth2G: Boolean,
    @SerializedName("queuedPackets") val queuedPackets: Int,
    @SerializedName("lastHeartbeat") val lastHeartbeat: String?,
    @SerializedName("deviceHealth") val deviceHealth: String?
)

data class AdminCulturalAssetDto(
    @SerializedName("id") val id: String?,
    @SerializedName("languageCode") val languageCode: String?,
    @SerializedName("languageName") val languageName: String?,
    @SerializedName("category") val category: String?,
    @SerializedName("textPrompt") val textPrompt: String?,
    @SerializedName("nativeScript") val nativeScript: String?,
    @SerializedName("missingWordAnswer") val missingWordAnswer: String?,
    @SerializedName("culturalContext") val culturalContext: String?
)

data class AdminAuditLogDto(
    @SerializedName("id") val id: String?,
    @SerializedName("actorRole") val actorRole: String?,
    @SerializedName("actorName") val actorName: String?,
    @SerializedName("actionType") val actionType: String?,
    @SerializedName("targetPatientId") val targetPatientId: Long?,
    @SerializedName("details") val details: String?,
    @SerializedName("ipAddress") val ipAddress: String?,
    @SerializedName("timestamp") val timestamp: String?
)

data class AdminAshaIncentiveDto(
    @SerializedName("workerId") val workerId: String?,
    @SerializedName("workerName") val workerName: String?,
    @SerializedName("district") val district: String?,
    @SerializedName("primaryPhc") val primaryPhc: String?,
    @SerializedName("screeningsCompleted") val screeningsCompleted: Int,
    @SerializedName("assistedGameSessions") val assistedGameSessions: Int,
    @SerializedName("totalIncentiveInr") val totalIncentiveInr: Int,
    @SerializedName("abhaLinkedBankMasked") val abhaLinkedBankMasked: String?,
    @SerializedName("disbursementStatus") val disbursementStatus: String?,
    @SerializedName("lastVerifiedAt") val lastVerifiedAt: String?
)

data class AdminPredictiveTrajectoryDto(
    @SerializedName("patientId") val patientId: Long?,
    @SerializedName("patientName") val patientName: String?,
    @SerializedName("currentStage") val currentStage: String?,
    @SerializedName("currentMocaScore") val currentMocaScore: Double,
    @SerializedName("predictedMoca30Days") val predictedMoca30Days: Double,
    @SerializedName("predictedMoca60Days") val predictedMoca60Days: Double,
    @SerializedName("predictedMoca90Days") val predictedMoca90Days: Double,
    @SerializedName("riskClassification") val riskClassification: String?,
    @SerializedName("adherenceImpactFactor") val adherenceImpactFactor: Double,
    @SerializedName("recommendedInterventions") val recommendedInterventions: List<String>
)

data class AdminCaregiverBurnoutDto(
    @SerializedName("caregiverId") val caregiverId: Long?,
    @SerializedName("caregiverName") val caregiverName: String?,
    @SerializedName("relationship") val relationship: String?,
    @SerializedName("patientId") val patientId: Long?,
    @SerializedName("patientName") val patientName: String?,
    @SerializedName("district") val district: String?,
    @SerializedName("zaritBurdenScore") val zaritBurdenScore: Int,
    @SerializedName("burdenCategory") val burdenCategory: String?,
    @SerializedName("weeklyNightWanderingAlerts") val weeklyNightWanderingAlerts: Int,
    @SerializedName("daysActiveThisMonth") val daysActiveThisMonth: Int,
    @SerializedName("respiteCareStatus") val respiteCareStatus: String?
)

data class AdminEmergencyBroadcastDto(
    @SerializedName("broadcastId") val broadcastId: String?,
    @SerializedName("targetState") val targetState: String?,
    @SerializedName("targetDistrict") val targetDistrict: String?,
    @SerializedName("alertCategory") val alertCategory: String?,
    @SerializedName("language") val language: String?,
    @SerializedName("messageText") val messageText: String?,
    @SerializedName("recipientsDelivered") val recipientsDelivered: Int,
    @SerializedName("dispatchedAt") val dispatchedAt: String?,
    @SerializedName("dispatchStatus") val dispatchStatus: String?
)

data class AdminKioskStationDto(
    @SerializedName("kioskId") val kioskId: String?,
    @SerializedName("stationName") val stationName: String?,
    @SerializedName("locationDistrict") val locationDistrict: String?,
    @SerializedName("state") val state: String?,
    @SerializedName("status") val status: String?,
    @SerializedName("scansToday") val scansToday: Int,
    @SerializedName("lastPingAt") val lastPingAt: String?
)

data class HealthResponse(
    @SerializedName("status") val status: String?,
    @SerializedName("service") val service: String?,
    @SerializedName("springOnline") val springOnline: Boolean,
    @SerializedName("llmOnline") val llmOnline: Boolean,
    @SerializedName("llmStatus") val llmStatus: String?,
    @SerializedName("timestamp") val timestamp: String?
)
