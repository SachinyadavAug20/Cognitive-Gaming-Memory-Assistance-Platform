package com.sih.cognicare.service;

import com.sih.cognicare.dto.GameSessionRequest;
import com.sih.cognicare.dto.GameSessionStatsResponse;
import com.sih.cognicare.model.GameSession;
import com.sih.cognicare.model.Patient;
import com.sih.cognicare.repository.GameSessionRepository;
import com.sih.cognicare.repository.PatientRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameSessionServiceTest {

    @Mock
    private GameSessionRepository gameSessionRepository;

    @Mock
    private PatientRepository patientRepository;

    @InjectMocks
    private GameSessionService gameSessionService;

    private Patient samplePatient;

    @BeforeEach
    void setUp() {
        samplePatient = Patient.builder()
                .id(1L)
                .name("Pratima Borah")
                .preferredLanguage("as")
                .culturalBackground("North East India (Assam)")
                .build();
    }

    @Test
    @DisplayName("Should save game session using default values when request fields are null")
    void testSaveSessionWithDefaults() {
        GameSessionRequest request = new GameSessionRequest(); // all fields null

        when(gameSessionRepository.save(any(GameSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GameSession saved = gameSessionService.saveSession(1L, request);

        assertNotNull(saved);
        assertEquals(1L, saved.getPatientId());
        assertEquals("MAJULI_WALK", saved.getGameType());
        assertEquals(60, saved.getDurationSeconds());
        assertEquals(100.0, saved.getAccuracyPercentage());
        assertEquals(100, saved.getSpatialRecallScore());
        assertEquals(1200, saved.getMotorReactionTimeMs());
        assertEquals(0, saved.getHesitationCount());
        assertEquals(1, saved.getDifficultyLevel());
        assertNotNull(saved.getTimestamp());
    }

    @Test
    @DisplayName("Should save game session with custom telemetry values")
    void testSaveSessionWithCustomValues() {
        GameSessionRequest request = new GameSessionRequest();
        request.setGameType("RIVER_LANTERNS");
        request.setDurationSeconds(120);
        request.setAccuracyPercentage(85.5);
        request.setSpatialRecallScore(90);
        request.setMotorReactionTimeMs(950);
        request.setHesitationCount(2);
        request.setDifficultyLevel(3);

        when(gameSessionRepository.save(any(GameSession.class))).thenAnswer(invocation -> invocation.getArgument(0));

        GameSession saved = gameSessionService.saveSession(5L, request);

        assertNotNull(saved);
        assertEquals(5L, saved.getPatientId());
        assertEquals("RIVER_LANTERNS", saved.getGameType());
        assertEquals(120, saved.getDurationSeconds());
        assertEquals(85.5, saved.getAccuracyPercentage());
        assertEquals(90, saved.getSpatialRecallScore());
        assertEquals(950, saved.getMotorReactionTimeMs());
        assertEquals(2, saved.getHesitationCount());
        assertEquals(3, saved.getDifficultyLevel());
    }

    @Test
    @DisplayName("Should return default empty stats when no sessions have been logged")
    void testGetPatientSessionStatsEmpty() {
        when(gameSessionRepository.findByPatientIdOrderByTimestampDesc(1L))
                .thenReturn(Collections.emptyList());

        GameSessionStatsResponse stats = gameSessionService.getPatientSessionStats(1L);

        assertNotNull(stats);
        assertEquals(0, stats.getTotalSessions());
        assertEquals(100.0, stats.getAverageAccuracy());
        assertEquals(1200.0, stats.getAverageMotorLatencyMs());
        assertEquals(100.0, stats.getAverageSpatialRecall());
        assertTrue(stats.getRecentSessions().isEmpty());
        assertTrue(stats.getAiClinicalSummary().contains("No gaming sessions logged yet"));
    }

    @Test
    @DisplayName("Should accurately aggregate averages and limit recent sessions to 10")
    void testGetPatientSessionStatsAggregated() {
        List<GameSession> sessions = new ArrayList<>();
        for (int i = 0; i < 15; i++) {
            sessions.add(GameSession.builder()
                    .id((long) (i + 1))
                    .patientId(1L)
                    .gameType("GAME_" + i)
                    .accuracyPercentage(i % 2 == 0 ? 90.0 : 80.0) // avg 85.33
                    .motorReactionTimeMs(1000 + (i * 50))
                    .spatialRecallScore(80 + i)
                    .timestamp(LocalDateTime.now().minusDays(i))
                    .build());
        }

        when(gameSessionRepository.findByPatientIdOrderByTimestampDesc(1L)).thenReturn(sessions);
        when(patientRepository.findById(1L)).thenReturn(Optional.of(samplePatient));

        GameSessionStatsResponse stats = gameSessionService.getPatientSessionStats(1L);

        assertNotNull(stats);
        assertEquals(15, stats.getTotalSessions());
        assertEquals(10, stats.getRecentSessions().size(), "Recent sessions must be capped at 10");
        assertTrue(stats.getAverageAccuracy() > 80.0 && stats.getAverageAccuracy() < 90.0);
        assertTrue(stats.getAverageMotorLatencyMs() > 1000.0);
        assertNotNull(stats.getAiClinicalSummary());
        assertTrue(stats.getAiClinicalSummary().contains("Pratima Borah"));
    }

    @Test
    @DisplayName("Should generate rule-based fallback summary when Ollama is unavailable")
    void testGenerateAiClinicalSummaryFallback() {
        GameSession latest = GameSession.builder()
                .patientId(1L)
                .gameType("WEAVING_PATTERNS")
                .accuracyPercentage(92.0)
                .motorReactionTimeMs(850)
                .spatialRecallScore(95)
                .build();

        when(patientRepository.findById(1L)).thenReturn(Optional.of(samplePatient));

        String summary = gameSessionService.generateAiClinicalSummary(1L, List.of(latest));

        assertNotNull(summary);
        assertTrue(summary.contains("Pratima Borah"), "Summary must mention the patient name");
        assertTrue(summary.contains("WEAVING PATTERNS"), "Summary must mention the game title");
        assertTrue(summary.contains("92%"), "Summary must mention accuracy percentage");
        assertTrue(summary.contains("850ms"), "Summary must mention reaction time");
    }
}
