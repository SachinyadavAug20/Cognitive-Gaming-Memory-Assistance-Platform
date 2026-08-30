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
public class AiBazaarResponse {
    private String merchantName;
    private String merchantDialogue;
    private String itemName;
    private Integer finalPrice;
    private Integer updatedBudget;
    private List<String> quickOptions;
    private Boolean isDealClosed;
    private String culturalFact;
}
