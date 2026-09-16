package com.sih.cognicare.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.cognicare.dto.*;
import com.sih.cognicare.model.GameSession;
import com.sih.cognicare.model.Patient;
import com.sih.cognicare.model.PatientCard;
import com.sih.cognicare.repository.GameSessionRepository;
import com.sih.cognicare.repository.PatientCardRepository;
import com.sih.cognicare.repository.PatientRepository;
import com.sih.cognicare.service.AdminService;
import com.sih.cognicare.service.PatientCardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class AdminServiceImpl implements AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminServiceImpl.class);
    private static final String OLLAMA_BASE_URL = "http://localhost:11434";
    private static final String OLLAMA_TAGS_URL = OLLAMA_BASE_URL + "/api/tags";

    private final PatientRepository patientRepository;
    private final PatientCardRepository patientCardRepository;
    private final GameSessionRepository gameSessionRepository;
    private final PatientCardService patientCardService;
    private final AdminRegionalSeedDataProvider seedDataProvider;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<String, AdminClinicalAlertDTO> alertsStore;
    private final Map<String, AdminTeleManasConsultationDTO> teleManasStore;
    private final List<AdminCulturalAssetDTO> culturalAssetsStore;
    private final List<AdminAuditLogDTO> auditLogsStore;
    private final Map<String, AdminAshaIncentiveDTO> ashaIncentivesStore;
    private final List<AdminEmergencyBroadcastDTO> broadcastsStore;

    private AdminAiTuningDTO aiTuning = AdminAiTuningDTO.builder()
            .baselineReactionLatencyMs(850)
            .hesitationThreshold(2)
            .errorlessScaffolding(true)
            .sundowningProtectionMode(true)
            .primaryModel("llama3.2:3b")
            .speechRate(0.82)
            .fallbackMode("RULE_BASED_CLINICAL")
            .build();

    public AdminServiceImpl(
            PatientRepository patientRepository,
            PatientCardRepository patientCardRepository,
            GameSessionRepository gameSessionRepository,
            PatientCardService patientCardService,
            AdminRegionalSeedDataProvider seedDataProvider) {
        this.patientRepository = patientRepository;
        this.patientCardRepository = patientCardRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.patientCardService = patientCardService;
        this.seedDataProvider = seedDataProvider;

        this.alertsStore = seedDataProvider.createInitialClinicalAlertsStore();
        this.teleManasStore = seedDataProvider.createInitialTeleManasConsultationStore();
        this.culturalAssetsStore = seedDataProvider.createInitialCulturalHeritageAssetsStore();
        this.auditLogsStore = seedDataProvider.createInitialSystemAuditLogsStore();
        this.ashaIncentivesStore = seedDataProvider.createInitialAshaIncentivesStore();
        this.broadcastsStore = seedDataProvider.createInitialEmergencyBroadcastsStore();
    }

    @Override
    public AdminOverviewDTO getOverview() {
        long totalPatients = patientRepository.count();
        long activeCards = patientCardRepository.countByIsActiveTrue();
        long totalSessions = gameSessionRepository.count();
        String ollamaStatus = checkOllamaHealthStatus();

        return AdminOverviewDTO.builder()
                .totalPatients(totalPatients)
                .activeCards(activeCards)
                .totalSessions(totalSessions)
                .ollamaStatus(ollamaStatus)
                .dbStatus("UP")
                .build();
    }

    @Override
    public List<AdminPatientRowDTO> getAllPatients() {
        List<Patient> patients = patientRepository.findAll();

        return patients.stream().map(patient -> {
            Optional<PatientCard> activeCard = patientCardRepository.findTopByPatientIdAndIsActiveTrue(patient.getId());
            boolean hasActive = activeCard.isPresent();
            String maskedToken = null;

            if (hasActive) {
                String token = activeCard.get().getSecureToken();
                if (token != null && token.length() > 10) {
                    maskedToken = token.substring(0, 6) + "..." + token.substring(token.length() - 4);
                } else {
                    maskedToken = token;
                }
            }

            return AdminPatientRowDTO.builder()
                    .id(patient.getId())
                    .name(patient.getName())
                    .gender(patient.getGender() != null ? patient.getGender() : "Not specified")
                    .preferredLanguage(patient.getPreferredLanguage() != null ? patient.getPreferredLanguage() : "English")
                    .phone(patient.getPhone() != null ? patient.getPhone() : "-")
                    .createdAt(patient.getCreatedAt())
                    .hasActiveCard(hasActive)
                    .activeCardToken(maskedToken)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public Map<String, Object> revokeCards(Long patientId) {
        List<PatientCard> cards = patientCardRepository.findAllByPatientId(patientId);
        int revokedCount = 0;
        for (PatientCard card : cards) {
            if (card.isActive()) {
                card.setActive(false);
                revokedCount++;
            }
        }

        if (revokedCount > 0) {
            patientCardRepository.saveAll(cards);
        }

        recordAuditLog("ADMIN_SUPERVISOR", "Admin Officer", "REISSUE_QR", patientId,
                "Revoked " + revokedCount + " active cards for patient #" + patientId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("patientId", patientId);
        response.put("revokedCount", revokedCount);
        response.put("message", "Revoked " + revokedCount + " active QR cards for patient " + patientId);
        return response;
    }

    @Override
    public GenerateCardResponse reissueCard(Long patientId) {
        GenerateCardResponse newCard = patientCardService.generateCard(patientId);

        recordAuditLog("ADMIN_SUPERVISOR", "Admin Officer", "REISSUE_QR", patientId,
                "Generated fresh cryptographic QR Passkey for patient #" + patientId);

        return newCard;
    }

    @Override
    public AdminAiDiagnosticsDTO getAiDiagnostics() {
        long start = System.currentTimeMillis();
        List<String> models = new ArrayList<>();
        String status = "DOWN";

        try {
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(2000);
            factory.setReadTimeout(2500);
            RestTemplate restTemplate = new RestTemplate(factory);

            ResponseEntity<String> res = restTemplate.getForEntity(OLLAMA_TAGS_URL, String.class);
            if (res.getStatusCode().is2xxSuccessful() && res.getBody() != null) {
                status = "UP";
                JsonNode root = objectMapper.readTree(res.getBody());
                if (root.has("models") && root.get("models").isArray()) {
                    for (JsonNode m : root.get("models")) {
                        if (m.has("name")) {
                            models.add(m.get("name").asText());
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.debug("Ollama diagnostics ping: {}", e.getMessage());
        }

        long latency = System.currentTimeMillis() - start;
        if (models.isEmpty()) {
            models.add("llama3.2:3b (Configured)");
            models.add("qwen2.5:1.5b (Fast Edge)");
        }

        return AdminAiDiagnosticsDTO.builder()
                .status(status)
                .host(OLLAMA_BASE_URL)
                .latencyMs(latency)
                .availableModels(models)
                .defaultModel("llama3.2:3b")
                .clinicalPersona("Loving Grandchild (Biren Borah) & ASHA Telemetry Scribe")
                .build();
    }

    @Override
    public List<AdminSessionRowDTO> getRecentSessions() {
        List<GameSession> sessions = gameSessionRepository.findTop50ByOrderByTimestampDesc();
        Map<Long, String> patientNames = patientRepository.findAll().stream()
                .collect(Collectors.toMap(Patient::getId, Patient::getName, (a, b) -> a));

        return sessions.stream().map(s -> AdminSessionRowDTO.builder()
                .sessionId(s.getId())
                .patientId(s.getPatientId())
                .patientName(patientNames.getOrDefault(s.getPatientId(), "Patient #" + s.getPatientId()))
                .gameType(s.getGameType())
                .durationSeconds(s.getDurationSeconds())
                .accuracyPercentage(s.getAccuracyPercentage())
                .motorReactionTimeMs(s.getMotorReactionTimeMs())
                .spatialRecallScore(s.getSpatialRecallScore())
                .hesitationCount(s.getHesitationCount())
                .difficultyLevel(s.getDifficultyLevel())
                .timestamp(s.getTimestamp())
                .build()).collect(Collectors.toList());
    }

    @Override
    public List<AdminDistrictHealthDTO> getNerDistricts() {
        return seedDataProvider.getNorthEastDistrictsHealthStatistics();
    }

    @Override
    public AdminOfflineQueueDTO getOfflineSyncStatus() {
        return AdminOfflineQueueDTO.builder()
                .pendingSyncPackets(3)
                .synchronizedToday(48)
                .lowBandwidthMode(true)
                .networkType("2G Edge / Hill Cellular")
                .dataSavedPct(68.4)
                .lastBatchSync(LocalDateTime.now().minusMinutes(4))
                .syncStatus("SYNCHRONIZED")
                .build();
    }

    @Override
    public List<AdminEpidemiologicalSurveillanceDTO> getEpidemiologicalSurveillance() {
        return seedDataProvider.getRegionalEpidemiologicalSurveillanceList();
    }

    @Override
    public List<AdminAshaWorkerDTO> getAshaWorkers() {
        return seedDataProvider.getActiveAshaWorkersDirectory();
    }

    @Override
    public List<AdminClinicalAlertDTO> getClinicalAlerts() {
        List<AdminClinicalAlertDTO> list = new ArrayList<>(alertsStore.values());
        list.sort(Comparator.comparing(AdminClinicalAlertDTO::getTriggeredAt).reversed());
        return list;
    }

    @Override
    public Map<String, Object> resolveAlert(String alertId) {
        AdminClinicalAlertDTO alert = alertsStore.get(alertId);
        if (alert != null) {
            alert.setResolved(true);
            alertsStore.put(alertId, alert);
        }
        return Map.of("status", "SUCCESS", "alertId", alertId, "resolved", true);
    }

    @Override
    public AdminAiTuningDTO getAiTuning() {
        return aiTuning;
    }

    @Override
    public AdminAiTuningDTO updateAiTuning(AdminAiTuningDTO updated) {
        this.aiTuning = updated;
        return this.aiTuning;
    }

    @Override
    public List<AdminTeleManasConsultationDTO> getTeleManasQueue() {
        List<AdminTeleManasConsultationDTO> list = new ArrayList<>(teleManasStore.values());
        list.sort(Comparator.comparing(AdminTeleManasConsultationDTO::getScheduledAt));
        return list;
    }

    @Override
    public AdminTeleManasConsultationDTO scheduleTeleManas(AdminTeleManasConsultationDTO req) {
        String id = "TM-" + System.currentTimeMillis();
        req.setConsultationId(id);
        req.setStatus("SCHEDULED");
        if (req.getVideoCallUrl() == null || req.getVideoCallUrl().isEmpty()) {
            req.setVideoCallUrl("https://esanjeevani.in/telemanas/room/" + id.toLowerCase());
        }
        teleManasStore.put(id, req);
        return req;
    }

    @Override
    public List<AdminMedicationAdherenceDTO> getMedicationAdherence() {
        return seedDataProvider.getRegionalMedicationAdherenceList();
    }

    @Override
    public Map<String, Object> triggerMedicationReminder(Long patientId) {
        return Map.of(
                "status", "DISPATCHED",
                "patientId", patientId,
                "channel", "IVR_REGIONAL_VOICE_SMS",
                "message", "Automated regional voice medication reminder dispatched to caregiver & patient."
        );
    }

    @Override
    public List<AdminKioskDeviceDTO> getKioskFleetHardware() {
        return seedDataProvider.getKioskHardwareDevicesFleet();
    }

    @Override
    public List<AdminCulturalAssetDTO> getCulturalAssets() {
        return culturalAssetsStore;
    }

    @Override
    public AdminCulturalAssetDTO addCulturalAsset(AdminCulturalAssetDTO asset) {
        if (asset.getId() == null || asset.getId().isEmpty()) {
            asset.setId("CUL-" + asset.getLanguageCode().toUpperCase() + "-" + System.currentTimeMillis());
        }
        culturalAssetsStore.add(asset);
        return asset;
    }

    @Override
    public List<AdminAuditLogDTO> getAuditLogs() {
        return auditLogsStore;
    }

    @Override
    public void recordAuditLog(String actorRole, String actorName, String actionType, Long targetPatientId, String details) {
        auditLogsStore.add(AdminAuditLogDTO.builder()
                .id("LOG-" + System.currentTimeMillis())
                .actorRole(actorRole)
                .actorName(actorName)
                .actionType(actionType)
                .targetPatientId(targetPatientId)
                .details(details)
                .ipAddress("127.0.0.1")
                .timestamp(LocalDateTime.now())
                .build());
    }

    @Override
    public List<AdminAshaIncentiveDTO> getAshaIncentives() {
        return new ArrayList<>(ashaIncentivesStore.values());
    }

    @Override
    public AdminAshaIncentiveDTO approveAshaIncentive(String workerId) {
        AdminAshaIncentiveDTO inc = ashaIncentivesStore.get(workerId);
        if (inc != null) {
            inc.setDisbursementStatus("APPROVED");
            inc.setLastVerifiedAt(LocalDateTime.now());
            ashaIncentivesStore.put(workerId, inc);

            recordAuditLog("ADMIN_SUPERVISOR", "NHM DBT Officer", "APPROVE_DBT", null,
                    "Approved DBT honorarium disbursement of ₹" + inc.getTotalIncentiveInr() + " for ASHA " + inc.getWorkerName());
        }
        return inc;
    }

    @Override
    public List<AdminPredictiveTrajectoryDTO> getPredictiveTrajectories() {
        return seedDataProvider.getPredictiveCognitiveTrajectoriesList();
    }

    @Override
    public List<AdminCaregiverBurnoutDTO> getCaregiverBurnoutScores() {
        return seedDataProvider.getCaregiverBurnoutAssessmentsList();
    }

    @Override
    public List<AdminEmergencyBroadcastDTO> getEmergencyBroadcasts() {
        return broadcastsStore;
    }

    @Override
    public AdminEmergencyBroadcastDTO dispatchEmergencyBroadcast(AdminEmergencyBroadcastDTO req) {
        String id = "BC-" + System.currentTimeMillis();
        req.setBroadcastId(id);
        req.setDispatchedAt(LocalDateTime.now());
        req.setRecipientsDelivered(145);
        req.setDispatchStatus("DELIVERED");
        broadcastsStore.add(0, req);

        recordAuditLog("ADMIN_SUPERVISOR", "Emergency Health Dispatcher", "EMERGENCY_BROADCAST", null,
                "Dispatched regional emergency broadcast (" + req.getAlertCategory() + ") to " + req.getTargetDistrict() + " caregivers.");

        return req;
    }

    @Override
    public List<AdminKioskStationDTO> getKioskNetwork() {
        return seedDataProvider.getRegionalKioskStationsNetwork();
    }

    @Override
    public Map<String, Object> exportDatabase() {
        Map<String, Object> export = new HashMap<>();
        export.put("exportedAt", LocalDateTime.now());
        export.put("patients", patientRepository.findAll());
        export.put("cards", patientCardRepository.findAll());
        export.put("sessions", gameSessionRepository.findAll());
        export.put("alerts", alertsStore.values());
        export.put("teleManas", teleManasStore.values());
        export.put("culturalAssets", culturalAssetsStore);
        export.put("aiTuning", aiTuning);
        export.put("ashaIncentives", ashaIncentivesStore.values());
        export.put("broadcasts", broadcastsStore);
        export.put("auditLogs", auditLogsStore);
        export.put("systemVersion", "CogniCare-v1.4-MDoNER-Production");
        return export;
    }

    private String checkOllamaHealthStatus() {
        try {
            SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(2000);
            factory.setReadTimeout(2000);
            RestTemplate restTemplate = new RestTemplate(factory);

            ResponseEntity<String> res = restTemplate.getForEntity(OLLAMA_TAGS_URL, String.class);
            if (res.getStatusCode().is2xxSuccessful()) {
                return "UP";
            }
            return "DOWN";
        } catch (Exception e) {
            log.debug("Ollama health status check: {}", e.getMessage());
            return "DOWN";
        }
    }
}
