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
public class AdminClinicalAlertDTO {
    private String id;
    private Long patientId;
    private String patientName;
    private String location;
    private String alertType;      // "TREMOR_SPIKE", "HYDRATION_DEFICIT", "MISSED_MEDICATION", "SUNDOWNING_AGITATION"
    private String severity;       // "CRITICAL", "HIGH", "MODERATE"
    private String clinicalNote;
    private String assignedAsha;
    private boolean resolved;
    private LocalDateTime triggeredAt;
}
