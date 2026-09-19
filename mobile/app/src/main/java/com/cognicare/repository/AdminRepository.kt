package com.cognicare.repository

import com.cognicare.data.remote.*
import com.cognicare.util.bodyAsResult

class AdminRepository(private val api: CogniCareApi) {
    suspend fun getOverview(): Result<AdminOverviewDto> = runCatching { api.getAdminOverview().bodyAsResult().getOrThrow() }
    suspend fun getPatients(): Result<List<AdminPatientRowDto>> = runCatching { api.getAdminPatients().bodyAsResult().getOrThrow() }
    suspend fun revokeCard(patientId: Long): Result<Map<String, Any>> = runCatching { api.revokeCard(patientId).bodyAsResult().getOrThrow() }
    suspend fun reissueCard(patientId: Long): Result<GenerateCardResponse> = runCatching { api.reissueCard(patientId).bodyAsResult().getOrThrow() }
    suspend fun getAiDiagnostics(): Result<AdminAiDiagnosticsDto> = runCatching { api.getAiDiagnostics().bodyAsResult().getOrThrow() }
    suspend fun getRecentSessions(): Result<List<AdminSessionRowDto>> = runCatching { api.getRecentSessions().bodyAsResult().getOrThrow() }
    suspend fun getNerDistricts(): Result<List<AdminDistrictHealthDto>> = runCatching { api.getNerDistricts().bodyAsResult().getOrThrow() }
    suspend fun getOfflineSync(): Result<AdminOfflineQueueDto> = runCatching { api.getOfflineSync().bodyAsResult().getOrThrow() }
    suspend fun getEpidemiologicalSurveillance(): Result<List<AdminEpidemiologicalSurveillanceDto>> = runCatching { api.getEpidemiologicalSurveillance().bodyAsResult().getOrThrow() }
    suspend fun getAshaWorkers(): Result<List<AdminAshaWorkerDto>> = runCatching { api.getAshaWorkers().bodyAsResult().getOrThrow() }
    suspend fun getAlerts(): Result<List<AdminClinicalAlertDto>> = runCatching { api.getAlerts().bodyAsResult().getOrThrow() }
    suspend fun resolveAlert(id: String): Result<Map<String, Any>> = runCatching { api.resolveAlert(id).bodyAsResult().getOrThrow() }
    suspend fun getAiTuning(): Result<AdminAiTuningDto> = runCatching { api.getAiTuning().bodyAsResult().getOrThrow() }
    suspend fun updateAiTuning(body: AdminAiTuningDto): Result<AdminAiTuningDto> = runCatching { api.updateAiTuning(body).bodyAsResult().getOrThrow() }
    suspend fun getTeleManas(): Result<List<AdminTeleManasConsultationDto>> = runCatching { api.getTeleManas().bodyAsResult().getOrThrow() }
    suspend fun scheduleTeleManas(dto: AdminTeleManasConsultationDto): Result<AdminTeleManasConsultationDto> = runCatching { api.scheduleTeleManas(dto).bodyAsResult().getOrThrow() }
    suspend fun getMedications(): Result<List<AdminMedicationAdherenceDto>> = runCatching { api.getMedications().bodyAsResult().getOrThrow() }
    suspend fun remindMedication(id: Long): Result<Map<String, Any>> = runCatching { api.remindMedication(id).bodyAsResult().getOrThrow() }
    suspend fun getKioskFleet(): Result<List<AdminKioskDeviceDto>> = runCatching { api.getKioskFleet().bodyAsResult().getOrThrow() }
    suspend fun getCulturalAssets(): Result<List<AdminCulturalAssetDto>> = runCatching { api.getCulturalAssets().bodyAsResult().getOrThrow() }
    suspend fun addCulturalAsset(asset: AdminCulturalAssetDto): Result<AdminCulturalAssetDto> = runCatching { api.addCulturalAsset(asset).bodyAsResult().getOrThrow() }
    suspend fun getAuditLogs(): Result<List<AdminAuditLogDto>> = runCatching { api.getAuditLogs().bodyAsResult().getOrThrow() }
    suspend fun getAshaIncentives(): Result<List<AdminAshaIncentiveDto>> = runCatching { api.getAshaIncentives().bodyAsResult().getOrThrow() }
    suspend fun approveAshaIncentive(id: String): Result<AdminAshaIncentiveDto> = runCatching { api.approveAshaIncentive(id).bodyAsResult().getOrThrow() }
    suspend fun getPredictiveTrajectories(): Result<List<AdminPredictiveTrajectoryDto>> = runCatching { api.getPredictiveTrajectories().bodyAsResult().getOrThrow() }
    suspend fun getCaregiverBurnout(): Result<List<AdminCaregiverBurnoutDto>> = runCatching { api.getCaregiverBurnout().bodyAsResult().getOrThrow() }
    suspend fun getEmergencyBroadcasts(): Result<List<AdminEmergencyBroadcastDto>> = runCatching { api.getEmergencyBroadcasts().bodyAsResult().getOrThrow() }
    suspend fun dispatchEmergencyBroadcast(broadcast: AdminEmergencyBroadcastDto): Result<AdminEmergencyBroadcastDto> = runCatching { api.dispatchEmergencyBroadcast(broadcast).bodyAsResult().getOrThrow() }
    suspend fun getKioskStations(): Result<List<AdminKioskStationDto>> = runCatching { api.getKioskStations().bodyAsResult().getOrThrow() }
    suspend fun exportData(): Result<Map<String, Any>> = runCatching { api.exportData().bodyAsResult().getOrThrow() }
}
