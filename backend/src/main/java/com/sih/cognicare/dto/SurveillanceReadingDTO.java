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
public class SurveillanceReadingDTO {
    private Long id;
    private Long patientId;
    private LocalDateTime recordedAt;
    private String readingType;
    private Integer heartRateBpm;
    private Double spo2Pct;
    private Double bodyTempC;
    private String activityLevel;
    private Integer steps;
    private Double sleepHours;
    private Integer hydrationGlasses;
    private Double latitude;
    private Double longitude;
    private String geofenceStatus;
    private String locationLabel;
    private String deviceId;
    private String networkType;
    private String syncStatus;
    private Integer queuedPackets;
    private Integer batteryPct;
    private Integer riskScore;
}