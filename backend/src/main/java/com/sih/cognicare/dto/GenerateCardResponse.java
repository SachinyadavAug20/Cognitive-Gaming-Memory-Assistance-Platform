package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GenerateCardResponse {
    private String secureToken;
    private Long patientId;
    private String patientName;
    private LocalDateTime issuedAt;
    private boolean isActive;
}