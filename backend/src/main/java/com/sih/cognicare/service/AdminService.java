package com.sih.cognicare.service;

import com.sih.cognicare.dto.*;
import java.util.List;
import java.util.Map;

public interface AdminService {
    AdminOverviewDTO getOverview();
    List<AdminPatientRowDTO> getAllPatients();
    Map<String, Object> revokeCards(Long patientId);
    GenerateCardResponse reissueCard(Long patientId);
    AdminAiDiagnosticsDTO getAiDiagnostics();
    List<AdminSessionRowDTO> getRecentSessions();
    List<AdminDistrictHealthDTO> getNerDistricts();
    AdminOfflineQueueDTO getOfflineSyncStatus();
    List<AdminEpidemiologicalSurveillanceDTO> getEpidemiologicalSurveillance();
    List<AdminAshaWorkerDTO> getAshaWorkers();
    List<AdminClinicalAlertDTO> getClinicalAlerts();
    Map<String, Object> resolveAlert(String alertId);
    AdminAiTuningDTO getAiTuning();
    AdminAiTuningDTO updateAiTuning(AdminAiTuningDTO updated);
    List<AdminTeleManasConsultationDTO> getTeleManasQueue();
    AdminTeleManasConsultationDTO scheduleTeleManas(AdminTeleManasConsultationDTO request);
    List<AdminMedicationAdherenceDTO> getMedicationAdherence();
    Map<String, Object> triggerMedicationReminder(Long patientId);
    List<AdminKioskDeviceDTO> getKioskFleetHardware();
    List<AdminCulturalAssetDTO> getCulturalAssets();
    AdminCulturalAssetDTO addCulturalAsset(AdminCulturalAssetDTO asset);
    List<AdminAuditLogDTO> getAuditLogs();
    void recordAuditLog(String actorRole, String actorName, String actionType, Long targetPatientId, String details);
    List<AdminAshaIncentiveDTO> getAshaIncentives();
    AdminAshaIncentiveDTO approveAshaIncentive(String workerId);
    List<AdminPredictiveTrajectoryDTO> getPredictiveTrajectories();
    List<AdminCaregiverBurnoutDTO> getCaregiverBurnoutScores();
    List<AdminEmergencyBroadcastDTO> getEmergencyBroadcasts();
    AdminEmergencyBroadcastDTO dispatchEmergencyBroadcast(AdminEmergencyBroadcastDTO request);
    List<AdminKioskStationDTO> getKioskNetwork();
    Map<String, Object> exportDatabase();
}
