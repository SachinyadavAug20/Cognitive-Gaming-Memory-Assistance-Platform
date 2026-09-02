package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPredictiveTrajectoryDTO {
    private Long patientId;
    private String patientName;
    private String currentStage;          // "MCI (Mild Cognitive Impairment)", "Mild Alzheimer's", "Moderate Dementia"
    private double currentMocaScore;      // e.g. 22.5 / 30
    private double predictedMoca30Days;   // e.g. 22.8 (Improvement/Stable)
    private double predictedMoca60Days;   // e.g. 22.4
    private double predictedMoca90Days;   // e.g. 22.0
    private String riskClassification;    // "STABLE_PRESERVED", "MODERATE_RISK", "ACCELERATED_DECLINE_RISK"
    private double adherenceImpactFactor; // e.g. +18% cognitive preservation with 3x/week games
    private List<String> recommendedInterventions; // e.g. ["Bihu Drum Pacing", "Hydration Scaffolding", "Living Memoir Chat"]
}
