package com.sih.cognicare.dto;

import com.sih.cognicare.model.GameSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameSessionStatsResponse {
    private int totalSessions;
    private double averageAccuracy;
    private double averageMotorLatencyMs;
    private double averageSpatialRecall;
    private List<GameSession> recentSessions;
    private String aiClinicalSummary;
}
