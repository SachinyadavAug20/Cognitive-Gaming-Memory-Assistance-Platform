package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminCaregiverBurnoutDTO {
    private Long caregiverId;
    private String caregiverName;
    private String relationship;       // "Son", "Daughter-in-law", "Spouse", "Granddaughter"
    private Long patientId;
    private String patientName;
    private String district;
    private int zaritBurdenScore;      // 0 - 88 (e.g. 28 = Mild-to-Moderate, 45 = Severe)
    private String burdenCategory;     // "MILD_STRAIN", "MODERATE_STRAIN", "HIGH_BURNOUT_RISK"
    private int weeklyNightWanderingAlerts;
    private int daysActiveThisMonth;
    private String respiteCareStatus;  // "RESPITE_RECOMMENDED", "STABLE_COPING", "COMMUNITY_ASHA_DISPATCHED"
}
