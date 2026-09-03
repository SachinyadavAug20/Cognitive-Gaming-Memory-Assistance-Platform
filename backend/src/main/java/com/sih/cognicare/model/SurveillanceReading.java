package com.sih.cognicare.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "surveillance_readings", indexes = {
        @Index(name = "idx_surv_reading_patient_time", columnList = "patient_id, recordedAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveillanceReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private LocalDateTime recordedAt;

    @Column(nullable = false)
    private String readingType; // VITALS, ACTIVITY, LOCATION, DEVICE_HEARTBEAT, GAME_TELEMETRY

    // Vitals
    private Integer heartRateBpm;
    private Double spo2Pct;
    private Double bodyTempC;

    // Activity / ADL
    private String activityLevel; // LOW, MODERATE, HIGH
    private Integer steps;
    private Double sleepHours;
    private Integer hydrationGlasses;

    // Location / geofencing
    private Double latitude;
    private Double longitude;
    private String geofenceStatus; // INSIDE, OUTSIDE, UNKNOWN
    private String locationLabel;

    // Device / sync heartbeat
    private String deviceId;
    private String networkType;
    private String syncStatus;
    private Integer queuedPackets;
    private Integer batteryPct;

    private Integer riskScore;
}
