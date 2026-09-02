package com.sih.cognicare.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.cognicare.dto.*;
import com.sih.cognicare.model.GameSession;
import com.sih.cognicare.model.Patient;
import com.sih.cognicare.model.PatientCard;
import com.sih.cognicare.repository.GameSessionRepository;
import com.sih.cognicare.repository.PatientCardRepository;
import com.sih.cognicare.repository.PatientRepository;
import com.sih.cognicare.service.PatientCardService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);
    private static final String OLLAMA_BASE_URL = "http://localhost:11434";
    private static final String OLLAMA_TAGS_URL = OLLAMA_BASE_URL + "/api/tags";

    private final PatientRepository patientRepository;
    private final PatientCardRepository patientCardRepository;
    private final GameSessionRepository gameSessionRepository;
    private final PatientCardService patientCardService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // In-memory stores for mission control features
    private final Map<String, AdminClinicalAlertDTO> alertsStore = new ConcurrentHashMap<>();
    private final Map<String, AdminTeleManasConsultationDTO> teleManasStore = new ConcurrentHashMap<>();
    private final List<AdminCulturalAssetDTO> culturalAssetsStore = new ArrayList<>();
    private final List<AdminAuditLogDTO> auditLogsStore = new ArrayList<>();
    private final Map<String, AdminAshaIncentiveDTO> ashaIncentivesStore = new ConcurrentHashMap<>();
    private final List<AdminEmergencyBroadcastDTO> broadcastsStore = new ArrayList<>();

    private AdminAiTuningDTO aiTuning = AdminAiTuningDTO.builder()
            .baselineReactionLatencyMs(850)
            .hesitationThreshold(2)
            .errorlessScaffolding(true)
            .sundowningProtectionMode(true)
            .primaryModel("llama3.2:3b")
            .speechRate(0.82)
            .fallbackMode("RULE_BASED_CLINICAL")
            .build();

    public AdminController(
            PatientRepository patientRepository,
            PatientCardRepository patientCardRepository,
            GameSessionRepository gameSessionRepository,
            PatientCardService patientCardService) {
        this.patientRepository = patientRepository;
        this.patientCardRepository = patientCardRepository;
        this.gameSessionRepository = gameSessionRepository;
        this.patientCardService = patientCardService;

        initializeMissionControlData();
    }

    private void initializeMissionControlData() {
        // 1. Default Alerts
        alertsStore.put("ALT-001", AdminClinicalAlertDTO.builder()
                .id("ALT-001")
                .patientId(1L)
                .patientName("Biren Borah")
                .location("Majuli Island, Assam")
                .alertType("TREMOR_SPIKE")
                .severity("HIGH")
                .clinicalNote("Micro-hesitation increased by 35% during Tea Garden Harvest session. Recommended ASHA motor evaluation.")
                .assignedAsha("Priyanka Saikia (PHC Kamalabari)")
                .resolved(false)
                .triggeredAt(LocalDateTime.now().minusHours(2))
                .build());

        alertsStore.put("ALT-002", AdminClinicalAlertDTO.builder()
                .id("ALT-002")
                .patientId(2L)
                .patientName("Mary Nongrum")
                .location("East Khasi Hills, Meghalaya")
                .alertType("HYDRATION_DEFICIT")
                .severity("MODERATE")
                .clinicalNote("Hydration check-in recorded 2/6 glasses today. Caregiver reminder triggered.")
                .assignedAsha("Larisa Mawlong (Shillong PHC)")
                .resolved(false)
                .triggeredAt(LocalDateTime.now().minusHours(4))
                .build());

        alertsStore.put("ALT-003", AdminClinicalAlertDTO.builder()
                .id("ALT-003")
                .patientId(3L)
                .patientName("Ibochouba Singh")
                .location("Imphal West, Manipur")
                .alertType("MISSED_MEDICATION")
                .severity("CRITICAL")
                .clinicalNote("Morning BP & neuro-protective medication not marked done by 11:00 AM.")
                .assignedAsha("Bembem Devi (Imphal PHC)")
                .resolved(false)
                .triggeredAt(LocalDateTime.now().minusMinutes(45))
                .build());

        // 2. Tele-MANAS Neurological Appointments
        teleManasStore.put("TM-AS-901", AdminTeleManasConsultationDTO.builder()
                .consultationId("TM-AS-901")
                .patientId(1L)
                .patientName("Biren Borah")
                .specialistDoctor("Dr. Abhijit Das, MD (Cognitive Neurology)")
                .hospitalCenter("AIIMS Guwahati - Tele-MANAS Regional Hub")
                .primaryDiagnosis("Mild Cognitive Impairment (MCI) - Spatial Recall Deficit")
                .scheduledAt(LocalDateTime.now().plusDays(1).withHour(11).withMinute(0))
                .status("SCHEDULED")
                .videoCallUrl("https://esanjeevani.in/telemanas/room/tm-as-901")
                .aiPreAssessmentSummary("MoCA Score: 22/30. Recent Majuli 3D walk showed 94% accuracy with 780ms motor latency. Stable mood with grandchild AI chat.")
                .build());

        teleManasStore.put("TM-ML-902", AdminTeleManasConsultationDTO.builder()
                .consultationId("TM-ML-902")
                .patientId(2L)
                .patientName("Mary Nongrum")
                .specialistDoctor("Dr. Catherine Lyngdoh (Geriatric Psychiatry)")
                .hospitalCenter("NEIGRIHMS Shillong - Geriatric Clinic")
                .primaryDiagnosis("Early-Stage Alzheimer's Dementia")
                .scheduledAt(LocalDateTime.now().plusDays(2).withHour(15).withMinute(30))
                .status("SCHEDULED")
                .videoCallUrl("https://esanjeevani.in/telemanas/room/tm-ml-902")
                .aiPreAssessmentSummary("MoCA Score: 18/30. Living Root Bridge recall demonstrated 85% spatial path recognition. Daily routine adherence steady at 90%.")
                .build());

        // 3. Cultural Proverbs Bank across 11 Languages
        culturalAssetsStore.add(AdminCulturalAssetDTO.builder()
                .id("CUL-AS-01")
                .languageCode("as")
                .languageName("Assamese")
                .category("PROVERB")
                .textPrompt("ধানৰ ভঁৰাল, পুখুৰীৰ...")
                .nativeScript("ধানৰ ভঁৰাল, পুখুৰীৰ মাছ (অসমীয়া সুখৰ পৰিচয়)")
                .missingWordAnswer("মাছ")
                .culturalContext("Timeless Assamese proverb evoking agrarian peace and abundance.")
                .build());

        culturalAssetsStore.add(AdminCulturalAssetDTO.builder()
                .id("CUL-KHA-02")
                .languageCode("kha")
                .languageName("Khasi")
                .category("PROVERB")
                .textPrompt("Ka jingieit ia ka...")
                .nativeScript("Ka jingieit ia ka Mei-mariang (Love for Mother Nature)")
                .missingWordAnswer("Mei-mariang")
                .culturalContext("Sacred Khasi reverence for living root bridges and nature.")
                .build());

        culturalAssetsStore.add(AdminCulturalAssetDTO.builder()
                .id("CUL-MNI-03")
                .languageCode("mni")
                .languageName("Manipuri (Meitei)")
                .category("FESTIVAL_MEMORY")
                .textPrompt("Ningol Chakkouba numitta...")
                .nativeScript("নিংঙোল চাক্কৌবা নুমিৎতা ইচানুপীশিংবু কৌবা")
                .missingWordAnswer("ইচানুপী")
                .culturalContext("Beloved festival welcoming daughters and sisters home.")
                .build());

        // 4. ASHA DBT Honorarium Ledger
        ashaIncentivesStore.put("ASHA-AS-01", AdminAshaIncentiveDTO.builder()
                .workerId("ASHA-AS-01")
                .workerName("Priyanka Saikia")
                .district("Majuli Island, Assam")
                .primaryPhc("Kamalabari Model PHC")
                .screeningsCompleted(18)
                .assistedGameSessions(42)
                .totalIncentiveInr(4200)
                .abhaLinkedBankMasked("SBI •••• 4092")
                .disbursementStatus("APPROVED")
                .lastVerifiedAt(LocalDateTime.now().minusDays(1))
                .build());

        ashaIncentivesStore.put("ASHA-ML-02", AdminAshaIncentiveDTO.builder()
                .workerId("ASHA-ML-02")
                .workerName("Larisa Mawlong")
                .district("East Khasi Hills, Meghalaya")
                .primaryPhc("Shillong Civil Outreach")
                .screeningsCompleted(14)
                .assistedGameSessions(31)
                .totalIncentiveInr(3100)
                .abhaLinkedBankMasked("HDFC •••• 8821")
                .disbursementStatus("PENDING_VERIFICATION")
                .lastVerifiedAt(LocalDateTime.now().minusDays(3))
                .build());

        ashaIncentivesStore.put("ASHA-MN-03", AdminAshaIncentiveDTO.builder()
                .workerId("ASHA-MN-03")
                .workerName("Bembem Devi")
                .district("Imphal West, Manipur")
                .primaryPhc("Lamphelpat Sub-Center")
                .screeningsCompleted(15)
                .assistedGameSessions(35)
                .totalIncentiveInr(3500)
                .abhaLinkedBankMasked("PNB •••• 1104")
                .disbursementStatus("APPROVED")
                .lastVerifiedAt(LocalDateTime.now().minusDays(2))
                .build());

        // 5. Emergency Broadcast History
        broadcastsStore.add(AdminEmergencyBroadcastDTO.builder()
                .broadcastId("BC-MAJULI-01")
                .targetState("Assam")
                .targetDistrict("Majuli River Island")
                .alertCategory("FLOOD_MONSOON_WANDERING")
                .language("as")
                .messageText("সাৱধান: ব্ৰহ্মপুত্ৰৰ জলস্তৰ বৃদ্ধি পাইছে। অনুগ্ৰহ কৰি বয়োজ্যেষ্ঠ ব্যক্তিসকলক নদীৰ পাৰলৈ অকলে যাব নিদিব।")
                .recipientsDelivered(128)
                .dispatchedAt(LocalDateTime.now().minusDays(2))
                .dispatchStatus("DELIVERED")
                .build());

        // 6. Audit Log Initialization
        auditLogsStore.add(AdminAuditLogDTO.builder()
                .id("LOG-101")
                .actorRole("ADMIN_SUPERVISOR")
                .actorName("Dr. Hemanta Sarma")
                .actionType("CALIBRATE_AI")
                .targetPatientId(null)
                .details("Adjusted baseline reaction threshold to 850ms with sundowning acoustic mode ON.")
                .ipAddress("10.0.4.12")
                .timestamp(LocalDateTime.now().minusHours(1))
                .build());
    }

    /**
     * 1. GET /api/v1/admin/overview
     */
    @GetMapping({"/admin/overview", "/api/v1/admin/overview"})
    public ResponseEntity<AdminOverviewDTO> getOverview() {
        long totalPatients = patientRepository.count();
        long activeCards = patientCardRepository.countByIsActiveTrue();
        long totalSessions = gameSessionRepository.count();

        String ollamaStatus = checkOllamaHealth();

        AdminOverviewDTO overview = AdminOverviewDTO.builder()
                .totalPatients(totalPatients)
                .activeCards(activeCards)
                .totalSessions(totalSessions)
                .ollamaStatus(ollamaStatus)
                .dbStatus("UP")
                .build();

        return ResponseEntity.ok(overview);
    }

    /**
     * 2. GET /api/v1/admin/patients
     */
    @GetMapping({"/admin/patients", "/api/v1/admin/patients"})
    public ResponseEntity<List<AdminPatientRowDTO>> getAllPatients() {
        List<Patient> patients = patientRepository.findAll();

        List<AdminPatientRowDTO> rows = patients.stream().map(patient -> {
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

        return ResponseEntity.ok(rows);
    }

    /**
     * 3. POST /api/v1/admin/cards/{patientId}/revoke
     */
    @PostMapping({"/admin/cards/{patientId}/revoke", "/api/v1/admin/cards/{patientId}/revoke"})
    public ResponseEntity<Map<String, Object>> revokeCards(@PathVariable("patientId") Long patientId) {
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

        auditLogsStore.add(AdminAuditLogDTO.builder()
                .id("LOG-" + System.currentTimeMillis())
                .actorRole("ADMIN_SUPERVISOR")
                .actorName("Admin Officer")
                .actionType("REISSUE_QR")
                .targetPatientId(patientId)
                .details("Revoked " + revokedCount + " active cards for patient #" + patientId)
                .ipAddress("127.0.0.1")
                .timestamp(LocalDateTime.now())
                .build());

        Map<String, Object> response = new HashMap<>();
        response.put("status", "SUCCESS");
        response.put("patientId", patientId);
        response.put("revokedCount", revokedCount);
        response.put("message", "Revoked " + revokedCount + " active QR cards for patient " + patientId);

        return ResponseEntity.ok(response);
    }

    /**
     * 4. POST /api/v1/admin/cards/{patientId}/reissue
     */
    @PostMapping({"/admin/cards/{patientId}/reissue", "/api/v1/admin/cards/{patientId}/reissue"})
    public ResponseEntity<GenerateCardResponse> reissueCard(@PathVariable("patientId") Long patientId) {
        GenerateCardResponse newCard = patientCardService.generateCard(patientId);

        auditLogsStore.add(AdminAuditLogDTO.builder()
                .id("LOG-" + System.currentTimeMillis())
                .actorRole("ADMIN_SUPERVISOR")
                .actorName("Admin Officer")
                .actionType("REISSUE_QR")
                .targetPatientId(patientId)
                .details("Generated fresh cryptographic QR Passkey for patient #" + patientId)
                .ipAddress("127.0.0.1")
                .timestamp(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(newCard);
    }

    /**
     * 5. GET /api/v1/admin/ai-models
     */
    @GetMapping({"/admin/ai-models", "/api/v1/admin/ai-models"})
    public ResponseEntity<AdminAiDiagnosticsDTO> getAiDiagnostics() {
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
            log.debug("Ollama diagnostics failed: {}", e.getMessage());
        }

        long latency = System.currentTimeMillis() - start;
        if (models.isEmpty()) {
            models.add("llama3.2:3b (Configured)");
            models.add("qwen2.5:1.5b (Fast Edge)");
        }

        AdminAiDiagnosticsDTO diag = AdminAiDiagnosticsDTO.builder()
                .status(status)
                .host(OLLAMA_BASE_URL)
                .latencyMs(latency)
                .availableModels(models)
                .defaultModel("llama3.2:3b")
                .clinicalPersona("Loving Grandchild (Biren Borah) & ASHA Telemetry Scribe")
                .build();

        return ResponseEntity.ok(diag);
    }

    /**
     * 6. GET /api/v1/admin/sessions/recent
     */
    @GetMapping({"/admin/sessions/recent", "/api/v1/admin/sessions/recent"})
    public ResponseEntity<List<AdminSessionRowDTO>> getRecentSessions() {
        List<GameSession> sessions = gameSessionRepository.findTop50ByOrderByTimestampDesc();
        Map<Long, String> patientNames = patientRepository.findAll().stream()
                .collect(Collectors.toMap(Patient::getId, Patient::getName, (a, b) -> a));

        List<AdminSessionRowDTO> rows = sessions.stream().map(s -> AdminSessionRowDTO.builder()
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

        return ResponseEntity.ok(rows);
    }

    /**
     * 7. GET /api/v1/admin/ner-districts
     */
    @GetMapping({"/admin/ner-districts", "/api/v1/admin/ner-districts"})
    public ResponseEntity<List<AdminDistrictHealthDTO>> getNerDistricts() {
        List<AdminDistrictHealthDTO> districts = List.of(
                AdminDistrictHealthDTO.builder()
                        .state("Assam")
                        .district("Majuli River Island")
                        .enrolledPatients(14)
                        .mciStageCount(8)
                        .moderateStageCount(6)
                        .ashaWorkersActive(12)
                        .activeKiosks(2)
                        .cognitiveAdherenceRate(94.5)
                        .primaryPhc("Kamalabari Model PHC")
                        .build(),
                AdminDistrictHealthDTO.builder()
                        .state("Assam")
                        .district("Kamrup Metropolitan")
                        .enrolledPatients(22)
                        .mciStageCount(15)
                        .moderateStageCount(7)
                        .ashaWorkersActive(18)
                        .activeKiosks(3)
                        .cognitiveAdherenceRate(92.0)
                        .primaryPhc("Dispur Capital PHC")
                        .build(),
                AdminDistrictHealthDTO.builder()
                        .state("Meghalaya")
                        .district("East Khasi Hills")
                        .enrolledPatients(11)
                        .mciStageCount(6)
                        .moderateStageCount(5)
                        .ashaWorkersActive(9)
                        .activeKiosks(2)
                        .cognitiveAdherenceRate(89.5)
                        .primaryPhc("Shillong Civil Outreach Center")
                        .build(),
                AdminDistrictHealthDTO.builder()
                        .state("Manipur")
                        .district("Imphal West")
                        .enrolledPatients(9)
                        .mciStageCount(5)
                        .moderateStageCount(4)
                        .ashaWorkersActive(7)
                        .activeKiosks(1)
                        .cognitiveAdherenceRate(91.2)
                        .primaryPhc("Lamphelpat Sub-Center")
                        .build(),
                AdminDistrictHealthDTO.builder()
                        .state("Mizoram")
                        .district("Aizawl District")
                        .enrolledPatients(8)
                        .mciStageCount(5)
                        .moderateStageCount(3)
                        .ashaWorkersActive(6)
                        .activeKiosks(1)
                        .cognitiveAdherenceRate(96.0)
                        .primaryPhc("Durtlang Health Post")
                        .build(),
                AdminDistrictHealthDTO.builder()
                        .state("Nagaland")
                        .district("Kohima")
                        .enrolledPatients(6)
                        .mciStageCount(4)
                        .moderateStageCount(2)
                        .ashaWorkersActive(5)
                        .activeKiosks(1)
                        .cognitiveAdherenceRate(88.0)
                        .primaryPhc("Naga Hospital Outreach")
                        .build(),
                AdminDistrictHealthDTO.builder()
                        .state("Arunachal Pradesh")
                        .district("Tawang")
                        .enrolledPatients(5)
                        .mciStageCount(3)
                        .moderateStageCount(2)
                        .ashaWorkersActive(4)
                        .activeKiosks(1)
                        .cognitiveAdherenceRate(87.5)
                        .primaryPhc("Tawang District Hospital")
                        .build(),
                AdminDistrictHealthDTO.builder()
                        .state("Tripura")
                        .district("West Tripura")
                        .enrolledPatients(7)
                        .mciStageCount(4)
                        .moderateStageCount(3)
                        .ashaWorkersActive(6)
                        .activeKiosks(1)
                        .cognitiveAdherenceRate(90.5)
                        .primaryPhc("Agartala Community Health Center")
                        .build()
        );
        return ResponseEntity.ok(districts);
    }

    /**
     * 8. GET /api/v1/admin/offline-sync
     */
    @GetMapping({"/admin/offline-sync", "/api/v1/admin/offline-sync"})
    public ResponseEntity<AdminOfflineQueueDTO> getOfflineSyncStatus() {
        AdminOfflineQueueDTO sync = AdminOfflineQueueDTO.builder()
                .pendingSyncPackets(3)
                .synchronizedToday(48)
                .lowBandwidthMode(true)
                .networkType("2G Edge / Hill Cellular")
                .dataSavedPct(68.4)
                .lastBatchSync(LocalDateTime.now().minusMinutes(4))
                .syncStatus("SYNCHRONIZED")
                .build();
        return ResponseEntity.ok(sync);
    }

    /**
     * 9. GET /api/v1/admin/asha-workers
     */
    @GetMapping({"/admin/asha-workers", "/api/v1/admin/asha-workers"})
    public ResponseEntity<List<AdminAshaWorkerDTO>> getAshaWorkers() {
        List<AdminAshaWorkerDTO> ashas = List.of(
                AdminAshaWorkerDTO.builder()
                        .id("ASHA-AS-01")
                        .name("Priyanka Saikia")
                        .phone("+91 94351-88201")
                        .assignedDistrict("Majuli")
                        .primaryPhc("Kamalabari Model PHC")
                        .assignedPatients(4)
                        .homeVisitsThisWeek(7)
                        .openAlerts(1)
                        .status("ON_FIELD")
                        .build(),
                AdminAshaWorkerDTO.builder()
                        .id("ASHA-ML-02")
                        .name("Larisa Mawlong")
                        .phone("+91 98620-44102")
                        .assignedDistrict("East Khasi Hills")
                        .primaryPhc("Shillong Civil Outreach")
                        .assignedPatients(3)
                        .homeVisitsThisWeek(5)
                        .openAlerts(1)
                        .status("ACTIVE")
                        .build(),
                AdminAshaWorkerDTO.builder()
                        .id("ASHA-MN-03")
                        .name("Bembem Devi")
                        .phone("+91 89740-11203")
                        .assignedDistrict("Imphal West")
                        .primaryPhc("Lamphelpat Sub-Center")
                        .assignedPatients(3)
                        .homeVisitsThisWeek(6)
                        .openAlerts(1)
                        .status("ACTIVE")
                        .build(),
                AdminAshaWorkerDTO.builder()
                        .id("ASHA-MZ-04")
                        .name("Lalremsiami")
                        .phone("+91 96120-77804")
                        .assignedDistrict("Aizawl")
                        .primaryPhc("Durtlang Health Post")
                        .assignedPatients(2)
                        .homeVisitsThisWeek(4)
                        .openAlerts(0)
                        .status("ACTIVE")
                        .build()
        );
        return ResponseEntity.ok(ashas);
    }

    /**
     * 10. GET /api/v1/admin/alerts
     */
    @GetMapping({"/admin/alerts", "/api/v1/admin/alerts"})
    public ResponseEntity<List<AdminClinicalAlertDTO>> getClinicalAlerts() {
        List<AdminClinicalAlertDTO> list = new ArrayList<>(alertsStore.values());
        list.sort(Comparator.comparing(AdminClinicalAlertDTO::getTriggeredAt).reversed());
        return ResponseEntity.ok(list);
    }

    /**
     * 11. POST /api/v1/admin/alerts/{id}/resolve
     */
    @PostMapping({"/admin/alerts/{id}/resolve", "/api/v1/admin/alerts/{id}/resolve"})
    public ResponseEntity<Map<String, Object>> resolveAlert(@PathVariable("id") String alertId) {
        AdminClinicalAlertDTO alert = alertsStore.get(alertId);
        if (alert != null) {
            alert.setResolved(true);
            alertsStore.put(alertId, alert);
        }
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "alertId", alertId, "resolved", true));
    }

    /**
     * 12. GET & POST /api/v1/admin/ai-tuning
     */
    @GetMapping({"/admin/ai-tuning", "/api/v1/admin/ai-tuning"})
    public ResponseEntity<AdminAiTuningDTO> getAiTuning() {
        return ResponseEntity.ok(aiTuning);
    }

    @PostMapping({"/admin/ai-tuning", "/api/v1/admin/ai-tuning"})
    public ResponseEntity<AdminAiTuningDTO> updateAiTuning(@RequestBody AdminAiTuningDTO updated) {
        this.aiTuning = updated;
        return ResponseEntity.ok(this.aiTuning);
    }

    /**
     * 13. GET /api/v1/admin/tele-manas & POST /api/v1/admin/tele-manas/schedule
     */
    @GetMapping({"/admin/tele-manas", "/api/v1/admin/tele-manas"})
    public ResponseEntity<List<AdminTeleManasConsultationDTO>> getTeleManasQueue() {
        List<AdminTeleManasConsultationDTO> list = new ArrayList<>(teleManasStore.values());
        list.sort(Comparator.comparing(AdminTeleManasConsultationDTO::getScheduledAt));
        return ResponseEntity.ok(list);
    }

    @PostMapping({"/admin/tele-manas/schedule", "/api/v1/admin/tele-manas/schedule"})
    public ResponseEntity<AdminTeleManasConsultationDTO> scheduleTeleManas(@RequestBody AdminTeleManasConsultationDTO req) {
        String id = "TM-" + System.currentTimeMillis();
        req.setConsultationId(id);
        req.setStatus("SCHEDULED");
        if (req.getVideoCallUrl() == null || req.getVideoCallUrl().isEmpty()) {
            req.setVideoCallUrl("https://esanjeevani.in/telemanas/room/" + id.toLowerCase());
        }
        teleManasStore.put(id, req);
        return ResponseEntity.ok(req);
    }

    /**
     * 14. GET /api/v1/admin/medications
     */
    @GetMapping({"/admin/medications", "/api/v1/admin/medications"})
    public ResponseEntity<List<AdminMedicationAdherenceDTO>> getMedicationAdherence() {
        List<AdminMedicationAdherenceDTO> list = List.of(
                AdminMedicationAdherenceDTO.builder()
                        .patientId(1L)
                        .patientName("Biren Borah")
                        .district("Majuli Island, Assam")
                        .activePrescriptions(List.of("Donepezil 5mg (Bedtime)", "Telmisartan 40mg (Morning)", "Vitamin B-12"))
                        .adherenceRate(94.5)
                        .missedDosesThisWeek(0)
                        .hydrationAvgGlasses(5)
                        .lastDoseTakenAt(LocalDateTime.now().minusHours(4))
                        .riskStatus("STABLE")
                        .build(),
                AdminMedicationAdherenceDTO.builder()
                        .patientId(2L)
                        .patientName("Mary Nongrum")
                        .district("East Khasi Hills, Meghalaya")
                        .activePrescriptions(List.of("Memantine 10mg (Twice Daily)", "Amlodipine 5mg", "Omega-3 Fatty Acid"))
                        .adherenceRate(86.0)
                        .missedDosesThisWeek(1)
                        .hydrationAvgGlasses(4)
                        .lastDoseTakenAt(LocalDateTime.now().minusHours(8))
                        .riskStatus("NEEDS_REMINDER")
                        .build(),
                AdminMedicationAdherenceDTO.builder()
                        .patientId(3L)
                        .patientName("Ibochouba Singh")
                        .district("Imphal West, Manipur")
                        .activePrescriptions(List.of("Rivastigmine Patch 4.6mg", "Losartan 50mg", "Calcium + Vitamin D3"))
                        .adherenceRate(78.0)
                        .missedDosesThisWeek(2)
                        .hydrationAvgGlasses(3)
                        .lastDoseTakenAt(LocalDateTime.now().minusHours(14))
                        .riskStatus("HIGH_RISK")
                        .build()
        );
        return ResponseEntity.ok(list);
    }

    @PostMapping({"/admin/medications/{id}/remind", "/api/v1/admin/medications/{id}/remind"})
    public ResponseEntity<Map<String, Object>> triggerMedicationReminder(@PathVariable("id") Long patientId) {
        return ResponseEntity.ok(Map.of(
                "status", "DISPATCHED",
                "patientId", patientId,
                "channel", "IVR_REGIONAL_VOICE_SMS",
                "message", "Automated regional voice medication reminder dispatched to caregiver & patient."
        ));
    }

    /**
     * 15. GET /api/v1/admin/kiosk-fleet
     */
    @GetMapping({"/admin/kiosk-fleet", "/api/v1/admin/kiosk-fleet"})
    public ResponseEntity<List<AdminKioskDeviceDTO>> getKioskFleetHardware() {
        List<AdminKioskDeviceDTO> fleet = List.of(
                AdminKioskDeviceDTO.builder()
                        .deviceId("HW-DISPUR-01")
                        .villageLocation("Dispur Capital PHC Station")
                        .state("Assam")
                        .batteryPct(100)
                        .cameraFps(30)
                        .storageFreeMb(14200)
                        .firmwareVersion("v2.4.1-ner")
                        .isLowBandwidth2G(false)
                        .queuedPackets(0)
                        .lastHeartbeat(LocalDateTime.now().minusMinutes(1))
                        .deviceHealth("OPTIMAL")
                        .build(),
                AdminKioskDeviceDTO.builder()
                        .deviceId("HW-MAJULI-02")
                        .villageLocation("Kamalabari Ghat Rural Kiosk")
                        .state("Assam")
                        .batteryPct(88)
                        .cameraFps(28)
                        .storageFreeMb(8900)
                        .firmwareVersion("v2.4.1-ner")
                        .isLowBandwidth2G(true)
                        .queuedPackets(2)
                        .lastHeartbeat(LocalDateTime.now().minusMinutes(3))
                        .deviceHealth("OPTIMAL")
                        .build(),
                AdminKioskDeviceDTO.builder()
                        .deviceId("HW-SHILLONG-03")
                        .villageLocation("East Khasi Hills Sub-Center")
                        .state("Meghalaya")
                        .batteryPct(74)
                        .cameraFps(24)
                        .storageFreeMb(6500)
                        .firmwareVersion("v2.4.0-ner")
                        .isLowBandwidth2G(true)
                        .queuedPackets(1)
                        .lastHeartbeat(LocalDateTime.now().minusMinutes(8))
                        .deviceHealth("OPTIMAL")
                        .build(),
                AdminKioskDeviceDTO.builder()
                        .deviceId("HW-AIZAWL-04")
                        .villageLocation("Durtlang Hill Health Post")
                        .state("Mizoram")
                        .batteryPct(95)
                        .cameraFps(30)
                        .storageFreeMb(12100)
                        .firmwareVersion("v2.4.1-ner")
                        .isLowBandwidth2G(false)
                        .queuedPackets(0)
                        .lastHeartbeat(LocalDateTime.now().minusMinutes(2))
                        .deviceHealth("OPTIMAL")
                        .build()
        );
        return ResponseEntity.ok(fleet);
    }

    /**
     * 16. GET & POST /api/v1/admin/cultural-assets
     */
    @GetMapping({"/admin/cultural-assets", "/api/v1/admin/cultural-assets"})
    public ResponseEntity<List<AdminCulturalAssetDTO>> getCulturalAssets() {
        return ResponseEntity.ok(culturalAssetsStore);
    }

    @PostMapping({"/admin/cultural-assets", "/api/v1/admin/cultural-assets"})
    public ResponseEntity<AdminCulturalAssetDTO> addCulturalAsset(@RequestBody AdminCulturalAssetDTO asset) {
        if (asset.getId() == null || asset.getId().isEmpty()) {
            asset.setId("CUL-" + asset.getLanguageCode().toUpperCase() + "-" + System.currentTimeMillis());
        }
        culturalAssetsStore.add(asset);
        return ResponseEntity.ok(asset);
    }

    /**
     * 17. GET /api/v1/admin/audit-logs
     */
    @GetMapping({"/admin/audit-logs", "/api/v1/admin/audit-logs"})
    public ResponseEntity<List<AdminAuditLogDTO>> getAuditLogs() {
        return ResponseEntity.ok(auditLogsStore);
    }

    /**
     * 18. GET & POST /api/v1/admin/asha-incentives
     * Direct Benefit Transfer (DBT) screening honorarium tracking
     */
    @GetMapping({"/admin/asha-incentives", "/api/v1/admin/asha-incentives"})
    public ResponseEntity<List<AdminAshaIncentiveDTO>> getAshaIncentives() {
        List<AdminAshaIncentiveDTO> list = new ArrayList<>(ashaIncentivesStore.values());
        return ResponseEntity.ok(list);
    }

    @PostMapping({"/admin/asha-incentives/{id}/approve", "/api/v1/admin/asha-incentives/{id}/approve"})
    public ResponseEntity<AdminAshaIncentiveDTO> approveAshaIncentive(@PathVariable("id") String workerId) {
        AdminAshaIncentiveDTO inc = ashaIncentivesStore.get(workerId);
        if (inc != null) {
            inc.setDisbursementStatus("APPROVED");
            inc.setLastVerifiedAt(LocalDateTime.now());
            ashaIncentivesStore.put(workerId, inc);

            auditLogsStore.add(AdminAuditLogDTO.builder()
                    .id("LOG-" + System.currentTimeMillis())
                    .actorRole("ADMIN_SUPERVISOR")
                    .actorName("NHM DBT Officer")
                    .actionType("APPROVE_DBT")
                    .targetPatientId(null)
                    .details("Approved DBT honorarium disbursement of ₹" + inc.getTotalIncentiveInr() + " for ASHA " + inc.getWorkerName())
                    .ipAddress("127.0.0.1")
                    .timestamp(LocalDateTime.now())
                    .build());
        }
        return ResponseEntity.ok(inc);
    }

    /**
     * 19. GET /api/v1/admin/predictive-trajectories
     * AI Cognitive Stability 90-day prognosis model
     */
    @GetMapping({"/admin/predictive-trajectories", "/api/v1/admin/predictive-trajectories"})
    public ResponseEntity<List<AdminPredictiveTrajectoryDTO>> getPredictiveTrajectories() {
        List<AdminPredictiveTrajectoryDTO> trajectories = List.of(
                AdminPredictiveTrajectoryDTO.builder()
                        .patientId(1L)
                        .patientName("Biren Borah (72 Yrs)")
                        .currentStage("MCI (Mild Cognitive Impairment)")
                        .currentMocaScore(22.5)
                        .predictedMoca30Days(22.8)
                        .predictedMoca60Days(22.4)
                        .predictedMoca90Days(22.1)
                        .riskClassification("STABLE_PRESERVED")
                        .adherenceImpactFactor(18.5)
                        .recommendedInterventions(List.of("Majuli Spatial Walk (3x/wk)", "Tea Harvest Motor Kinesthetics", "Grandchild Memoir Chat"))
                        .build(),
                AdminPredictiveTrajectoryDTO.builder()
                        .patientId(2L)
                        .patientName("Mary Nongrum (68 Yrs)")
                        .currentStage("Mild Alzheimer's Dementia")
                        .currentMocaScore(18.2)
                        .predictedMoca30Days(18.0)
                        .predictedMoca60Days(17.6)
                        .predictedMoca90Days(17.1)
                        .riskClassification("MODERATE_RISK")
                        .adherenceImpactFactor(14.0)
                        .recommendedInterventions(List.of("Living Root Bridge Pathways", "Hydration Scaffolding Reminders", "Khasi Folk Songs"))
                        .build(),
                AdminPredictiveTrajectoryDTO.builder()
                        .patientId(3L)
                        .patientName("Ibochouba Singh (76 Yrs)")
                        .currentStage("Moderate Dementia")
                        .currentMocaScore(14.0)
                        .predictedMoca30Days(13.5)
                        .predictedMoca60Days(12.8)
                        .predictedMoca90Days(12.0)
                        .riskClassification("ACCELERATED_DECLINE_RISK")
                        .adherenceImpactFactor(22.0)
                        .recommendedInterventions(List.of("Urgent Tele-MANAS Neurologist Referral", "Errorless Scaffolding Mode", "High-Priority ASHA Home Visit"))
                        .build()
        );
        return ResponseEntity.ok(trajectories);
    }

    /**
     * 20. GET /api/v1/admin/caregiver-burnout
     */
    @GetMapping({"/admin/caregiver-burnout", "/api/v1/admin/caregiver-burnout"})
    public ResponseEntity<List<AdminCaregiverBurnoutDTO>> getCaregiverBurnoutScores() {
        List<AdminCaregiverBurnoutDTO> list = List.of(
                AdminCaregiverBurnoutDTO.builder()
                        .caregiverId(101L)
                        .caregiverName("Anurag Borah")
                        .relationship("Son & Primary Caregiver")
                        .patientId(1L)
                        .patientName("Biren Borah")
                        .district("Majuli, Assam")
                        .zaritBurdenScore(24)
                        .burdenCategory("MILD_STRAIN")
                        .weeklyNightWanderingAlerts(0)
                        .daysActiveThisMonth(28)
                        .respiteCareStatus("STABLE_COPING")
                        .build(),
                AdminCaregiverBurnoutDTO.builder()
                        .caregiverId(102L)
                        .caregiverName("Grace Nongrum")
                        .relationship("Daughter")
                        .patientId(2L)
                        .patientName("Mary Nongrum")
                        .district("East Khasi Hills, Meghalaya")
                        .zaritBurdenScore(42)
                        .burdenCategory("MODERATE_STRAIN")
                        .weeklyNightWanderingAlerts(1)
                        .daysActiveThisMonth(26)
                        .respiteCareStatus("RESPITE_RECOMMENDED")
                        .build(),
                AdminCaregiverBurnoutDTO.builder()
                        .caregiverId(103L)
                        .caregiverName("Tomba Singh")
                        .relationship("Spouse (74 Yrs)")
                        .patientId(3L)
                        .patientName("Ibochouba Singh")
                        .district("Imphal West, Manipur")
                        .zaritBurdenScore(58)
                        .burdenCategory("HIGH_BURNOUT_RISK")
                        .weeklyNightWanderingAlerts(3)
                        .daysActiveThisMonth(29)
                        .respiteCareStatus("COMMUNITY_ASHA_DISPATCHED")
                        .build()
        );
        return ResponseEntity.ok(list);
    }

    /**
     * 21. GET & POST /api/v1/admin/emergency-broadcasts
     */
    @GetMapping({"/admin/emergency-broadcasts", "/api/v1/admin/emergency-broadcasts"})
    public ResponseEntity<List<AdminEmergencyBroadcastDTO>> getEmergencyBroadcasts() {
        return ResponseEntity.ok(broadcastsStore);
    }

    @PostMapping({"/admin/emergency-broadcast", "/api/v1/admin/emergency-broadcast"})
    public ResponseEntity<AdminEmergencyBroadcastDTO> dispatchEmergencyBroadcast(@RequestBody AdminEmergencyBroadcastDTO req) {
        String id = "BC-" + System.currentTimeMillis();
        req.setBroadcastId(id);
        req.setDispatchedAt(LocalDateTime.now());
        req.setRecipientsDelivered(145);
        req.setDispatchStatus("DELIVERED");
        broadcastsStore.add(0, req);

        auditLogsStore.add(AdminAuditLogDTO.builder()
                .id("LOG-" + System.currentTimeMillis())
                .actorRole("ADMIN_SUPERVISOR")
                .actorName("Emergency Health Dispatcher")
                .actionType("EMERGENCY_BROADCAST")
                .targetPatientId(null)
                .details("Dispatched regional emergency broadcast (" + req.getAlertCategory() + ") to " + req.getTargetDistrict() + " caregivers.")
                .ipAddress("127.0.0.1")
                .timestamp(LocalDateTime.now())
                .build());

        return ResponseEntity.ok(req);
    }

    /**
     * 22. GET /api/v1/admin/kiosks
     */
    @GetMapping({"/admin/kiosks", "/api/v1/admin/kiosks"})
    public ResponseEntity<List<AdminKioskStationDTO>> getKioskNetwork() {
        List<AdminKioskStationDTO> kiosks = List.of(
                AdminKioskStationDTO.builder()
                        .kioskId("KSK-DISPUR-01")
                        .stationName("Dispur Primary Health Center Station")
                        .locationDistrict("Kamrup Metropolitan")
                        .state("Assam")
                        .status("ONLINE")
                        .scansToday(14)
                        .lastPingAt(LocalDateTime.now().minusMinutes(2))
                        .build(),
                AdminKioskStationDTO.builder()
                        .kioskId("KSK-MAJULI-02")
                        .stationName("Majuli Kamalabari Rural Wellness Kiosk")
                        .locationDistrict("Majuli")
                        .state("Assam")
                        .status("ONLINE")
                        .scansToday(8)
                        .lastPingAt(LocalDateTime.now().minusMinutes(5))
                        .build(),
                AdminKioskStationDTO.builder()
                        .kioskId("KSK-SHILLONG-03")
                        .stationName("East Khasi Hills Civil Outreach Station")
                        .locationDistrict("East Khasi Hills")
                        .state("Meghalaya")
                        .status("IDLE")
                        .scansToday(6)
                        .lastPingAt(LocalDateTime.now().minusMinutes(12))
                        .build(),
                AdminKioskStationDTO.builder()
                        .kioskId("KSK-AIZAWL-04")
                        .stationName("Aizawl Urban Health Center Station")
                        .locationDistrict("Aizawl")
                        .state("Mizoram")
                        .status("ONLINE")
                        .scansToday(11)
                        .lastPingAt(LocalDateTime.now().minusMinutes(1))
                        .build()
        );
        return ResponseEntity.ok(kiosks);
    }

    /**
     * 23. GET /api/v1/admin/export
     */
    @GetMapping({"/admin/export", "/api/v1/admin/export"})
    public ResponseEntity<Map<String, Object>> exportDatabase() {
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
        return ResponseEntity.ok(export);
    }

    private String checkOllamaHealth() {
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
            log.debug("Ollama health ping failed: {}", e.getMessage());
            return "DOWN";
        }
    }
}
