package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SurveillanceReadingRequest {
    private String readingType;       // VITALS, ACTIVITY, LOCATION, DEVICE_HEARTBEAT, GAME_TELEMETRY
    private Integer heartRateBpm;
    private Double spo2Pct;
    private Double bodyTempC;
    private String activityLevel;     // LOW, MODERATE, HIGH
    private Integer steps;
    private Double sleepHours;
    private Integer hydrationGlasses;
    private Double latitude;
    private Double longitude;
    private String geofenceStatus;    // INSIDE, OUTSIDE, UNKNOWN
    private String locationLabel;
    private String deviceId;
    private String networkType;
    private String syncStatus;
    private Integer queuedPackets;
    private Integer batteryPct;
    private Integer riskScore;
}
