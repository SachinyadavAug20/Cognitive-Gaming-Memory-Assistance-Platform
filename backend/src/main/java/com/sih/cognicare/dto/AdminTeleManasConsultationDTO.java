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
public class AdminTeleManasConsultationDTO {
    private String consultationId;
    private Long patientId;
    private String patientName;
    private String specialistDoctor;
    private String hospitalCenter; // e.g. "AIIMS Guwahati - Neurology Dept", "NIMHANS Tele-MANAS Hub"
    private String primaryDiagnosis;
    private LocalDateTime scheduledAt;
    private String status;         // "SCHEDULED", "IN_PROGRESS", "COMPLETED", "URGENT_REFERRAL"
    private String videoCallUrl;
    private String aiPreAssessmentSummary;
}
