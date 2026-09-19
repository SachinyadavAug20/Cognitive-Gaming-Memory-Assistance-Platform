package com.sih.cognicare.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sih.cognicare.dto.GameSessionRequest;
import com.sih.cognicare.dto.GameSessionStatsResponse;
import com.sih.cognicare.model.GameSession;
import com.sih.cognicare.service.GameSessionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class GameSessionControllerTest {

    @Mock
    private GameSessionService gameSessionService;

    @InjectMocks
    private GameSessionController gameSessionController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(gameSessionController).build();
    }

    @Test
    @DisplayName("POST /api/v1/patients/{id}/sessions should record game session and return 200 OK")
    void testRecordSession() throws Exception {
        GameSession session = GameSession.builder()
                .id(101L)
                .patientId(1L)
                .gameType("MAJULI_WALK")
                .durationSeconds(120)
                .accuracyPercentage(95.0)
                .spatialRecallScore(90)
                .motorReactionTimeMs(850)
                .hesitationCount(1)
                .difficultyLevel(2)
                .timestamp(LocalDateTime.now())
                .build();

        when(gameSessionService.saveSession(eq(1L), any(GameSessionRequest.class))).thenReturn(session);

        GameSessionRequest request = new GameSessionRequest();
        request.setGameType("MAJULI_WALK");
        request.setDurationSeconds(120);
        request.setAccuracyPercentage(95.0);

        mockMvc.perform(post("/api/v1/patients/1/sessions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(101))
                .andExpect(jsonPath("$.patientId").value(1))
                .andExpect(jsonPath("$.gameType").value("MAJULI_WALK"))
                .andExpect(jsonPath("$.accuracyPercentage").value(95.0))
                .andExpect(jsonPath("$.motorReactionTimeMs").value(850));
    }

    @Test
    @DisplayName("GET /api/v1/patients/{id}/sessions/stats should return aggregated stats and 200 OK")
    void testGetSessionStats() throws Exception {
        GameSessionStatsResponse stats = GameSessionStatsResponse.builder()
                .totalSessions(12)
                .averageAccuracy(88.5)
                .averageMotorLatencyMs(920.0)
                .averageSpatialRecall(85.0)
                .recentSessions(Collections.emptyList())
                .aiClinicalSummary("Patient shows consistent cognitive stability across 12 sessions.")
                .build();

        when(gameSessionService.getPatientSessionStats(1L)).thenReturn(stats);

        mockMvc.perform(get("/api/v1/patients/1/sessions/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSessions").value(12))
                .andExpect(jsonPath("$.averageAccuracy").value(88.5))
                .andExpect(jsonPath("$.averageMotorLatencyMs").value(920.0))
                .andExpect(jsonPath("$.aiClinicalSummary").value("Patient shows consistent cognitive stability across 12 sessions."));
    }
}
