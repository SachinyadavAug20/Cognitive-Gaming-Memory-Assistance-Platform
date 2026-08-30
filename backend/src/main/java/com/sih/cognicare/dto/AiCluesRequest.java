package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiCluesRequest {
    private Long patientId;
    private String targetType; // "FAMILY" or "PLACE" or "CAREER"
    private String targetName;
    private String targetRelationOrSignificance;
    private String targetNotes;
}
