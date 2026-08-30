package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiMemoirResponse {
    private String memoirTitle;
    private String poeticNarrative;
    private String emotionalTone;
    private Integer syntacticRichnessScore;
    private String culturalDedication;
}
