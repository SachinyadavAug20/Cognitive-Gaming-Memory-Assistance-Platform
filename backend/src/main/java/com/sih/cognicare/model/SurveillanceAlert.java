package com.sih.cognicare.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "surveillance_alerts", indexes = {
        @Index(name = "idx_surv_alert_patient_time", columnList = "patient_id, triggeredAt")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SurveillanceAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(nullable = false)
    private String alertType; // WANDERING_GEOFENCE, FALL_DETECTED, VITAL_ANOMALY, LOW_ACTIVITY, MISSED_MEDICATION, SOS_CALL_CAREGIVER

    @Column(nullable = false)
    private String severity; // CRITICAL, HIGH, MODERATE, LOW

    @Column(columnDefinition = "TEXT")
    private String message;

    private String source; // SIMULATOR, SENSOR, PATIENT_APP

    private boolean resolved;

    private LocalDateTime resolvedAt;

    private String assignedAsha;

    @Column(nullable = false)
    private LocalDateTime triggeredAt;
}
