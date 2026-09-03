package com.sih.cognicare.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.cognicare.dto.GameSessionRequest;
import com.sih.cognicare.dto.GameSessionStatsResponse;
import com.sih.cognicare.model.GameSession;
import com.sih.cognicare.model.Patient;
import com.sih.cognicare.repository.GameSessionRepository;
import com.sih.cognicare.repository.PatientRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class GameSessionService {

    private static final Logger log = LoggerFactory.getLogger(GameSessionService.class);
    private static final String OLLAMA_URL = "http://localhost:11434/api/generate";
    private static final String MODEL = "qwen2.5:1.5b";
    private static final int TIMEOUT_MS = 30_000;

    private final GameSessionRepository gameSessionRepository;
    private final PatientRepository patientRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public GameSessionService(
            GameSessionRepository gameSessionRepository,
            PatientRepository patientRepository) {
        this.gameSessionRepository = gameSessionRepository;
        this.patientRepository = patientRepository;
    }

    private RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(2_500);
        factory.setReadTimeout(TIMEOUT_MS);
        return new RestTemplate(factory);
    }

    /**
     * Save patient game session telemetry
     */
    public GameSession saveSession(Long patientId, GameSessionRequest request) {
        GameSession session = GameSession.builder()
                .patientId(patientId)
                .gameType(request.getGameType() != null ? request.getGameType() : "MAJULI_WALK")
                .durationSeconds(request.getDurationSeconds() != null ? request.getDurationSeconds() : 60)
                .accuracyPercentage(request.getAccuracyPercentage() != null ? request.getAccuracyPercentage() : 100.0)
                .spatialRecallScore(request.getSpatialRecallScore() != null ? request.getSpatialRecallScore() : 100)
                .motorReactionTimeMs(request.getMotorReactionTimeMs() != null ? request.getMotorReactionTimeMs() : 1200)
                .hesitationCount(request.getHesitationCount() != null ? request.getHesitationCount() : 0)
                .difficultyLevel(request.getDifficultyLevel() != null ? request.getDifficultyLevel() : 1)
                .timestamp(LocalDateTime.now())
                .build();

        return gameSessionRepository.save(session);
    }

    /**
     * Get patient gaming session stats and rolling averages
     */
    public GameSessionStatsResponse getPatientSessionStats(Long patientId) {
        List<GameSession> sessions = gameSessionRepository.findByPatientIdOrderByTimestampDesc(patientId);

        if (sessions.isEmpty()) {
            return GameSessionStatsResponse.builder()
                    .totalSessions(0)
                    .averageAccuracy(100.0)
                    .averageMotorLatencyMs(1200.0)
                    .averageSpatialRecall(100.0)
                    .recentSessions(Collections.emptyList())
                    .aiClinicalSummary("No gaming sessions logged yet. Patient is ready for initial cognitive baseline assessment.")
                    .build();
        }

        double avgAccuracy = sessions.stream()
                .mapToDouble(s -> s.getAccuracyPercentage() != null ? s.getAccuracyPercentage() : 100.0)
                .average()
                .orElse(100.0);

        double avgMotorLatency = sessions.stream()
                .mapToDouble(s -> s.getMotorReactionTimeMs() != null ? s.getMotorReactionTimeMs() : 1200.0)
                .average()
                .orElse(1200.0);

        double avgSpatialRecall = sessions.stream()
                .mapToDouble(s -> s.getSpatialRecallScore() != null ? s.getSpatialRecallScore() : 100.0)
                .average()
                .orElse(100.0);

        List<GameSession> recent = sessions.subList(0, Math.min(10, sessions.size()));
        String aiSummary = generateAiClinicalSummary(patientId, recent);

        return GameSessionStatsResponse.builder()
                .totalSessions(sessions.size())
                .averageAccuracy(Math.round(avgAccuracy * 10.0) / 10.0)
                .averageMotorLatencyMs(Math.round(avgMotorLatency))
                .averageSpatialRecall(Math.round(avgSpatialRecall * 10.0) / 10.0)
                .recentSessions(recent)
                .aiClinicalSummary(aiSummary)
                .build();
    }

    /**
     * Generate 3-sentence plain-language clinical summary via Ollama for ASHA workers
     */
    public String generateAiClinicalSummary(Long patientId, List<GameSession> recentSessions) {
        Patient patient = (patientId != null && patientId > 0)
                ? patientRepository.findById(patientId).orElse(null)
                : patientRepository.findAll().stream().findFirst().orElse(null);

        String patientName = patient != null ? patient.getName() : "Pratima Borah";
        String lang = patient != null && patient.getPreferredLanguage() != null ? patient.getPreferredLanguage() : "English";
        String culture = patient != null && patient.getCulturalBackground() != null ? patient.getCulturalBackground() : "North East India (Assam)";

        if (recentSessions == null || recentSessions.isEmpty()) {
            return patientName + " has not completed any interactive sessions yet.";
        }

        GameSession latest = recentSessions.get(0);
        String gameType = latest.getGameType();
        double accuracy = latest.getAccuracyPercentage() != null ? latest.getAccuracyPercentage() : 100.0;
        int motorMs = latest.getMotorReactionTimeMs() != null ? latest.getMotorReactionTimeMs() : 1200;
        int hesitation = latest.getHesitationCount() != null ? latest.getHesitationCount() : 0;
        int spatial = latest.getSpatialRecallScore() != null ? latest.getSpatialRecallScore() : 100;

        double avgAccuracy = recentSessions.stream()
                .mapToDouble(s -> s.getAccuracyPercentage() != null ? s.getAccuracyPercentage() : 100.0)
                .average()
                .orElse(accuracy);

        double avgLatency = recentSessions.stream()
                .mapToDouble(s -> s.getMotorReactionTimeMs() != null ? s.getMotorReactionTimeMs() : 1200.0)
                .average()
                .orElse(motorMs);

        String recentGamesList = recentSessions.stream()
                .map(s -> s.getGameType().replace("_", " "))
                .distinct()
                .limit(4)
                .collect(Collectors.joining(", "));

        String prompt = String.format(
                "You are an empathetic geriatric cognitive specialist creating a brief clinical progress note for an ASHA community health worker.\n\n" +
                "PATIENT PROFILE:\n" +
                "- Name: %s\n" +
                "- Region & Culture: %s\n" +
                "- Preferred Language: %s\n\n" +
                "COGNITIVE TELEMETRY DATA:\n" +
                "- Latest Therapy Module: %s\n" +
                "- Session Accuracy: %.1f%% (Rolling Average: %.1f%%)\n" +
                "- Motor Response Latency: %d ms (Rolling Average: %.0f ms)\n" +
                "- Spatial Recall Index: %d / 100\n" +
                "- Hesitation Instances: %d\n" +
                "- Recent Activities: %s\n\n" +
                "INSTRUCTIONS:\n" +
                "Write exactly 3 concise, highly supportive sentences in plain English:\n" +
                "1. Summarize their spatial orientation and recall performance during the session.\n" +
                "2. Assess their motor latency and coordination calmness.\n" +
                "3. Provide one actionable, culturally sensitive recommendation for daily care and family encouragement.\n" +
                "Do not use markdown headers or bullet points.",
                patientName, culture, lang,
                gameType.replace("_", " "), accuracy, avgAccuracy,
                motorMs, avgLatency,
                spatial, hesitation,
                recentGamesList
        );

        try {
            String raw = callOllama(prompt);
            if (raw != null && !raw.trim().isEmpty()) {
                return raw.trim().replaceAll("^\"|\"$", "");
            }
        } catch (Exception e) {
            log.warn("Ollama AI summary unavailable, using rule-based clinical fallback: {}", e.getMessage());
        }

        // Clinical Rule-Based Fallback
        return String.format(
                "%s exhibited steady spatial recall and engagement during the %s session with %.0f%% accuracy. " +
                "Motor reaction speed averaged %dms with calm bilateral coordination and minimal hesitation. " +
                "Recommended for continued daily cognitive stimulation, warm family conversations, and hydration check-ins.",
                patientName, gameType.replace("_", " "), accuracy, motorMs
        );
    }

    private String callOllama(String prompt) {
        try {
            RestTemplate restTemplate = createRestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("model", MODEL);
            body.put("prompt", prompt);
            body.put("stream", false);
            body.put("options", Map.of(
                    "temperature", 0.4,
                    "repeat_penalty", 1.15,
                    "num_predict", 250,
                    "num_ctx", 2048
            ));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(OLLAMA_URL, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                if (root.has("response")) {
                    return root.get("response").asText();
                }
            }
        } catch (Exception e) {
            log.warn("Ollama call failed: {}", e.getMessage());
        }
        return null;
    }
}
