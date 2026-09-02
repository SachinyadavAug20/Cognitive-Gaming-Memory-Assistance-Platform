package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameSessionRequest {
    private Long patientId;
    private String gameType; // MAJULI_WALK, TEA_HARVEST, BIHU_DHOL, MEMORY_PIECES, ARROW_ESCAPE
    private Integer durationSeconds;
    private Double accuracyPercentage;
    private Integer spatialRecallScore;
    private Integer motorReactionTimeMs;
    private Integer hesitationCount;
    private Integer difficultyLevel;
}
