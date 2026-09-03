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
public class CaregiverSosDTO {
    private Long id;
    private Long patientId;
    private String patientName;
    private Double patientLat;
    private Double patientLng;
    private String locationLabel;
    private String status;              // PENDING, ACKNOWLEDGED, RESOLVED
    private String acknowledgedBy;
    private LocalDateTime requestedAt;
    private LocalDateTime acknowledgedAt;
}
