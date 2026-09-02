package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminMedicationAdherenceDTO {
    private Long patientId;
    private String patientName;
    private String district;
    private List<String> activePrescriptions; // e.g. ["Donepezil 5mg", "Amlodipine 5mg", "Vitamin B-Complex"]
    private double adherenceRate;             // e.g. 94.0%
    private int missedDosesThisWeek;
    private int hydrationAvgGlasses;          // e.g. 5 of 6 glasses
    private LocalDateTime lastDoseTakenAt;
    private String riskStatus;                // "STABLE", "NEEDS_REMINDER", "HIGH_RISK"
}
