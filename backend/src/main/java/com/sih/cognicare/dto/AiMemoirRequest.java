package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiMemoirRequest {
    private Long patientId;
    private String photoPromptTitle;
    private String userSpokenNarrative;
}
