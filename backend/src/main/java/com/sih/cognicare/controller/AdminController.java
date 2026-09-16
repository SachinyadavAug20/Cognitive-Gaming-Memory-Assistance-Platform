package com.sih.cognicare.controller;

import com.sih.cognicare.dto.*;
import com.sih.cognicare.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping({"/admin/overview", "/api/v1/admin/overview"})
    public ResponseEntity<AdminOverviewDTO> getOverview() {
        return ResponseEntity.ok(adminService.getOverview());
    }

    @GetMapping({"/admin/patients", "/api/v1/admin/patients"})
    public ResponseEntity<List<AdminPatientRowDTO>> getAllPatients() {
        return ResponseEntity.ok(adminService.getAllPatients());
    }

    @PostMapping({"/admin/cards/{patientId}/revoke", "/api/v1/admin/cards/{patientId}/revoke"})
    public ResponseEntity<Map<String, Object>> revokeCards(@PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(adminService.revokeCards(patientId));
    }

    @PostMapping({"/admin/cards/{patientId}/reissue", "/api/v1/admin/cards/{patientId}/reissue"})
    public ResponseEntity<GenerateCardResponse> reissueCard(@PathVariable("patientId") Long patientId) {
        return ResponseEntity.ok(adminService.reissueCard(patientId));
    }

    @GetMapping({"/admin/ai-models", "/api/v1/admin/ai-models"})
    public ResponseEntity<AdminAiDiagnosticsDTO> getAiDiagnostics() {
        return ResponseEntity.ok(adminService.getAiDiagnostics());
    }

    @GetMapping({"/admin/sessions/recent", "/api/v1/admin/sessions/recent"})
    public ResponseEntity<List<AdminSessionRowDTO>> getRecentSessions() {
        return ResponseEntity.ok(adminService.getRecentSessions());
    }

    @GetMapping({"/admin/ner-districts", "/api/v1/admin/ner-districts"})
    public ResponseEntity<List<AdminDistrictHealthDTO>> getNerDistricts() {
        return ResponseEntity.ok(adminService.getNerDistricts());
    }

    @GetMapping({"/admin/offline-sync", "/api/v1/admin/offline-sync"})
    public ResponseEntity<AdminOfflineQueueDTO> getOfflineSyncStatus() {
        return ResponseEntity.ok(adminService.getOfflineSyncStatus());
    }

    @GetMapping({"/admin/surveillance", "/api/v1/admin/surveillance"})
    public ResponseEntity<List<AdminEpidemiologicalSurveillanceDTO>> getEpidemiologicalSurveillance() {
        return ResponseEntity.ok(adminService.getEpidemiologicalSurveillance());
    }

    @GetMapping({"/admin/asha-workers", "/api/v1/admin/asha-workers"})
    public ResponseEntity<List<AdminAshaWorkerDTO>> getAshaWorkers() {
        return ResponseEntity.ok(adminService.getAshaWorkers());
    }

    @GetMapping({"/admin/alerts", "/api/v1/admin/alerts"})
    public ResponseEntity<List<AdminClinicalAlertDTO>> getClinicalAlerts() {
        return ResponseEntity.ok(adminService.getClinicalAlerts());
    }

    @PostMapping({"/admin/alerts/{id}/resolve", "/api/v1/admin/alerts/{id}/resolve"})
    public ResponseEntity<Map<String, Object>> resolveAlert(@PathVariable("id") String alertId) {
        return ResponseEntity.ok(adminService.resolveAlert(alertId));
    }

    @GetMapping({"/admin/ai-tuning", "/api/v1/admin/ai-tuning"})
    public ResponseEntity<AdminAiTuningDTO> getAiTuning() {
        return ResponseEntity.ok(adminService.getAiTuning());
    }

    @PostMapping({"/admin/ai-tuning", "/api/v1/admin/ai-tuning"})
    public ResponseEntity<AdminAiTuningDTO> updateAiTuning(@RequestBody AdminAiTuningDTO updated) {
        return ResponseEntity.ok(adminService.updateAiTuning(updated));
    }

    @GetMapping({"/admin/tele-manas", "/api/v1/admin/tele-manas"})
    public ResponseEntity<List<AdminTeleManasConsultationDTO>> getTeleManasQueue() {
        return ResponseEntity.ok(adminService.getTeleManasQueue());
    }

    @PostMapping({"/admin/tele-manas/schedule", "/api/v1/admin/tele-manas/schedule"})
    public ResponseEntity<AdminTeleManasConsultationDTO> scheduleTeleManas(@RequestBody AdminTeleManasConsultationDTO req) {
        return ResponseEntity.ok(adminService.scheduleTeleManas(req));
    }

    @GetMapping({"/admin/medications", "/api/v1/admin/medications"})
    public ResponseEntity<List<AdminMedicationAdherenceDTO>> getMedicationAdherence() {
        return ResponseEntity.ok(adminService.getMedicationAdherence());
    }

    @PostMapping({"/admin/medications/{id}/remind", "/api/v1/admin/medications/{id}/remind"})
    public ResponseEntity<Map<String, Object>> triggerMedicationReminder(@PathVariable("id") Long patientId) {
        return ResponseEntity.ok(adminService.triggerMedicationReminder(patientId));
    }

    @GetMapping({"/admin/kiosk-fleet", "/api/v1/admin/kiosk-fleet"})
    public ResponseEntity<List<AdminKioskDeviceDTO>> getKioskFleetHardware() {
        return ResponseEntity.ok(adminService.getKioskFleetHardware());
    }

    @GetMapping({"/admin/cultural-assets", "/api/v1/admin/cultural-assets"})
    public ResponseEntity<List<AdminCulturalAssetDTO>> getCulturalAssets() {
        return ResponseEntity.ok(adminService.getCulturalAssets());
    }

    @PostMapping({"/admin/cultural-assets", "/api/v1/admin/cultural-assets"})
    public ResponseEntity<AdminCulturalAssetDTO> addCulturalAsset(@RequestBody AdminCulturalAssetDTO asset) {
        return ResponseEntity.ok(adminService.addCulturalAsset(asset));
    }

    @GetMapping({"/admin/audit-logs", "/api/v1/admin/audit-logs"})
    public ResponseEntity<List<AdminAuditLogDTO>> getAuditLogs() {
        return ResponseEntity.ok(adminService.getAuditLogs());
    }

    @GetMapping({"/admin/asha-incentives", "/api/v1/admin/asha-incentives"})
    public ResponseEntity<List<AdminAshaIncentiveDTO>> getAshaIncentives() {
        return ResponseEntity.ok(adminService.getAshaIncentives());
    }

    @PostMapping({"/admin/asha-incentives/{id}/approve", "/api/v1/admin/asha-incentives/{id}/approve"})
    public ResponseEntity<AdminAshaIncentiveDTO> approveAshaIncentive(@PathVariable("id") String workerId) {
        return ResponseEntity.ok(adminService.approveAshaIncentive(workerId));
    }

    @GetMapping({"/admin/predictive-trajectories", "/api/v1/admin/predictive-trajectories"})
    public ResponseEntity<List<AdminPredictiveTrajectoryDTO>> getPredictiveTrajectories() {
        return ResponseEntity.ok(adminService.getPredictiveTrajectories());
    }

    @GetMapping({"/admin/caregiver-burnout", "/api/v1/admin/caregiver-burnout"})
    public ResponseEntity<List<AdminCaregiverBurnoutDTO>> getCaregiverBurnoutScores() {
        return ResponseEntity.ok(adminService.getCaregiverBurnoutScores());
    }

    @GetMapping({"/admin/emergency-broadcasts", "/api/v1/admin/emergency-broadcasts"})
    public ResponseEntity<List<AdminEmergencyBroadcastDTO>> getEmergencyBroadcasts() {
        return ResponseEntity.ok(adminService.getEmergencyBroadcasts());
    }

    @PostMapping({"/admin/emergency-broadcast", "/api/v1/admin/emergency-broadcast"})
    public ResponseEntity<AdminEmergencyBroadcastDTO> dispatchEmergencyBroadcast(@RequestBody AdminEmergencyBroadcastDTO req) {
        return ResponseEntity.ok(adminService.dispatchEmergencyBroadcast(req));
    }

    @GetMapping({"/admin/kiosks", "/api/v1/admin/kiosks"})
    public ResponseEntity<List<AdminKioskStationDTO>> getKioskNetwork() {
        return ResponseEntity.ok(adminService.getKioskNetwork());
    }

    @GetMapping({"/admin/export", "/api/v1/admin/export"})
    public ResponseEntity<Map<String, Object>> exportDatabase() {
        return ResponseEntity.ok(adminService.exportDatabase());
    }
}
