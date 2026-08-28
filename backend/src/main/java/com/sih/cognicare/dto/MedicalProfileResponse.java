package com.sih.cognicare.dto;

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
    private String dateOfDiagnosis;
    private String clinicalStage;
    private Integer recommendedStartDifficulty;
    private String llmSummary;
    private String testType;
    private Integer mmseScore;
    private Integer maxScore;
    private String impairedDomains;
    private List<String> medications;
    private Map<String, DomainAssessment> domains;
}
