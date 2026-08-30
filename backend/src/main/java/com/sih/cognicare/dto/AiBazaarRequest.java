package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiBazaarRequest {
    private Long patientId;
    private String marketName;
    private String currentItem;
    private Integer userOfferPrice;
    private String userSpokenMessage;
    private Integer budgetRemaining;
}
