package com.sih.cognicare.controller;

import com.sih.cognicare.dto.GameSessionRequest;
import com.sih.cognicare.dto.GameSessionStatsResponse;
import com.sih.cognicare.model.GameSession;
import com.sih.cognicare.service.GameSessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class GameSessionController {

    private final GameSessionService gameSessionService;

    public GameSessionController(GameSessionService gameSessionService) {
        this.gameSessionService = gameSessionService;
    }

    /**
     * Save patient game session telemetry
     */
    @PostMapping({"/api/v1/patients/{id}/sessions"})
    public ResponseEntity<GameSession> recordSession(
            @PathVariable("id") Long patientId,
            @RequestBody @jakarta.validation.Valid GameSessionRequest request) {
        GameSession session = gameSessionService.saveSession(patientId, request);
        return ResponseEntity.ok(session);
    }

    /**
     * Get patient gaming session stats and rolling averages
     */
    @GetMapping({"/api/v1/patients/{id}/sessions/stats"})
    public ResponseEntity<GameSessionStatsResponse> getSessionStats(
            @PathVariable("id") Long patientId) {
        GameSessionStatsResponse stats = gameSessionService.getPatientSessionStats(patientId);
        return ResponseEntity.ok(stats);
    }
}
