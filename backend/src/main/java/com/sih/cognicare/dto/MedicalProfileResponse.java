package com.sih.cognicare.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalProfileResponse {
    private String diagnosis;
    private String icd10;
    private String dateOfDiagnosis;
    private String examiningPhysician;
    private String clinicOrHospital;
    private String clinicalStage;
    private Integer recommendedStartDifficulty;
    private String llmSummary;
    private String testType;
    private Integer mmseScore;
    private Integer maxScore;
    private String mtaScore;
    private String fazekasGrade;
    private String impairedDomains;
    private String primaryDeficits;
    private List<String> medications;
    private Map<String, SubscaleScoreDto> subscaleScores;
    private Map<String, DomainAssessment> domains;
    private GameConfigDto gameConfig;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class SubscaleScoreDto {
        private int score;
        private int max;
    }

    /**
     * Calibrated starting parameters for Game 1 (Memory Pieces) and Game 2 (Remember the Way),
     * derived from the patient's clinical stage / recommended start difficulty.
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GameConfigDto {
        private int startLevel;
        private int memoryGridSize;
        private int memoryPreviewSeconds;
        private boolean memoryShowHints;
        private int wayfindingRouteLength;
        private double audioSpeechRate;
    }
}
