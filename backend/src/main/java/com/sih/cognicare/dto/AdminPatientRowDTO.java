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
public class AdminPatientRowDTO {
    private Long id;
    private String name;
    private String gender;
    private String preferredLanguage;
    private String phone;
    private LocalDateTime createdAt;
    private boolean hasActiveCard;
    private String activeCardToken;
}
