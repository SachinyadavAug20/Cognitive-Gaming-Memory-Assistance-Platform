package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminOverviewDTO {
    private long totalPatients;
    private long activeCards;
    private long totalSessions;
    private String ollamaStatus; // "UP", "DOWN", or "UNREACHABLE"
    private String dbStatus;     // "UP"
}
