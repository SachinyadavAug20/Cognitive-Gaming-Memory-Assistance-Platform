package com.sih.cognicare.controller;

import com.sih.cognicare.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class HealthController {

    private final AdminService adminService;

    @GetMapping({"/health", "/api/v1/health", "/healthz"})
    public ResponseEntity<Map<String, Object>> checkHealth() {
        String ollamaStatus = "DOWN";
        try {
            ollamaStatus = adminService.getOverview().getOllamaStatus();
        } catch (Exception ignored) {
        }

        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "cognicare-backend",
                "springOnline", true,
                "llmOnline", "UP".equalsIgnoreCase(ollamaStatus),
                "llmStatus", ollamaStatus,
                "timestamp", Instant.now().toString()
        ));
    }
}
