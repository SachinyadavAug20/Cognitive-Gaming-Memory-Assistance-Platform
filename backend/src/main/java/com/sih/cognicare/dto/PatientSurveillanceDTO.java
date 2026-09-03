package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientSurveillanceDTO {
    private Long patientId;
    private String patientName;
    private String gender;
    private String preferredLanguage;
    private String district;
    private String riskLevel;             // LOW, MODERATE, HIGH, CRITICAL
    private Integer riskScore;
    private Integer heartRateBpm;
    private Double spo2Pct;
    private Double bodyTempC;
    private String activityLevel;
    private Integer steps;
    private Integer hydrationGlasses;
    private Double latitude;
    private Double longitude;
    private String geofenceStatus;
    private String locationLabel;
    private String syncStatus;
    private String networkType;
    private Integer queuedPackets;
    private Integer batteryPct;
    private long openAlertCount;
    private String lastSeen;
}
