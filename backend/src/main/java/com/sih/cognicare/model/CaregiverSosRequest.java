package com.sih.cognicare.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "caregiver_sos_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaregiverSosRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    private Double patientLat;

    private Double patientLng;

    private String locationLabel;

    @Column(nullable = false)
    private String status; // PENDING, ACKNOWLEDGED, RESOLVED

    private String acknowledgedBy;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    private LocalDateTime acknowledgedAt;
}
