package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminSessionRowDTO {
    private Long sessionId;
    private Long patientId;
    private String patientName;
    private String gameType;
    private Integer durationSeconds;
    private Double accuracyPercentage;
    private Integer motorReactionTimeMs;
    private Integer spatialRecallScore;
    private Integer hesitationCount;
    private Integer difficultyLevel;
    private LocalDateTime timestamp;
}
