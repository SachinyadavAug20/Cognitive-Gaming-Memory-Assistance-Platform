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
public class SurveillanceAlertDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private String alertType;
    private String severity;
    private String message;
    private String source;
    private boolean resolved;
    private LocalDateTime resolvedAt;
    private String assignedAsha;
    private LocalDateTime triggeredAt;
}
