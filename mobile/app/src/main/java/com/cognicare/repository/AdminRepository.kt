package com.cognicare.repository

import com.cognicare.data.remote.*

class AdminRepository(private val api: CogniCareApi) {
    suspend fun getOverview(): Result<AdminOverviewDto> = runCatching { api.getAdminOverview().body()!! }
    suspend fun getPatients(): Result<List<AdminPatientRowDto>> = runCatching { api.getAdminPatients().body()!! }
    suspend fun revokeCard(patientId: Long): Result<Map<String, Any>> = runCatching { api.revokeCard(patientId).body()!! }
    suspend fun reissueCard(patientId: Long): Result<GenerateCardResponse> = runCatching { api.reissueCard(patientId).body()!! }
    suspend fun getAiDiagnostics(): Result<AdminAiDiagnosticsDto> = runCatching { api.getAiDiagnostics().body()!! }
    suspend fun getRecentSessions(): Result<List<AdminSessionRowDto>> = runCatching { api.getRecentSessions().body()!! }
    suspend fun getNerDistricts(): Result<List<AdminDistrictHealthDto>> = runCatching { api.getNerDistricts().body()!! }
    suspend fun getOfflineSync(): Result<AdminOfflineQueueDto> = runCatching { api.getOfflineSync().body()!! }
    suspend fun getEpidemiologicalSurveillance(): Result<List<AdminEpidemiologicalSurveillanceDto>> = runCatching { api.getEpidemiologicalSurveillance().body()!! }
    suspend fun getAshaWorkers(): Result<List<AdminAshaWorkerDto>> = runCatching { api.getAshaWorkers().body()!! }
    suspend fun getAlerts(): Result<List<AdminClinicalAlertDto>> = runCatching { api.getAlerts().body()!! }
    suspend fun resolveAlert(id: String): Result<Map<String, Any>> = runCatching { api.resolveAlert(id).body()!! }
    suspend fun getAiTuning(): Result<AdminAiTuningDto> = runCatching { api.getAiTuning().body()!! }
    suspend fun updateAiTuning(body: AdminAiTuningDto): Result<AdminAiTuningDto> = runCatching { api.updateAiTuning(body).body()!! }
    suspend fun getTeleManas(): Result<List<AdminTeleManasConsultationDto>> = runCatching { api.getTeleManas().body()!! }
    suspend fun scheduleTeleManas(dto: AdminTeleManasConsultationDto): Result<AdminTeleManasConsultationDto> = runCatching { api.scheduleTeleManas(dto).body()!! }
    suspend fun getMedications(): Result<List<AdminMedicationAdherenceDto>> = runCatching { api.getMedications().body()!! }
    suspend fun remindMedication(id: Long): Result<Map<String, Any>> = runCatching { api.remindMedication(id).body()!! }
    suspend fun getKioskFleet(): Result<List<AdminKioskDeviceDto>> = runCatching { api.getKioskFleet().body()!! }
    suspend fun getCulturalAssets(): Result<List<AdminCulturalAssetDto>> = runCatching { api.getCulturalAssets().body()!! }
    suspend fun addCulturalAsset(asset: AdminCulturalAssetDto): Result<AdminCulturalAssetDto> = runCatching { api.addCulturalAsset(asset).body()!! }
    suspend fun getAuditLogs(): Result<List<AdminAuditLogDto>> = runCatching { api.getAuditLogs().body()!! }
    suspend fun getAshaIncentives(): Result<List<AdminAshaIncentiveDto>> = runCatching { api.getAshaIncentives().body()!! }
    suspend fun approveAshaIncentive(id: String): Result<AdminAshaIncentiveDto> = runCatching { api.approveAshaIncentive(id).body()!! }
    suspend fun getPredictiveTrajectories(): Result<List<AdminPredictiveTrajectoryDto>> = runCatching { api.getPredictiveTrajectories().body()!! }
    suspend fun getCaregiverBurnout(): Result<List<AdminCaregiverBurnoutDto>> = runCatching { api.getCaregiverBurnout().body()!! }
    suspend fun getEmergencyBroadcasts(): Result<List<AdminEmergencyBroadcastDto>> = runCatching { api.getEmergencyBroadcasts().body()!! }
    suspend fun dispatchEmergencyBroadcast(broadcast: AdminEmergencyBroadcastDto): Result<AdminEmergencyBroadcastDto> = runCatching { api.dispatchEmergencyBroadcast(broadcast).body()!! }
    suspend fun getKioskStations(): Result<List<AdminKioskStationDto>> = runCatching { api.getKioskStations().body()!! }
    suspend fun exportData(): Result<Map<String, Any>> = runCatching { api.exportData().body()!! }
}
