package com.sih.cognicare.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminAshaWorkerDTO {
    private String id;
    private String name;
    private String phone;
    private String assignedDistrict;
    private String primaryPhc;
    private int assignedPatients;
    private int homeVisitsThisWeek;
    private int openAlerts;
    private String status; // "ACTIVE", "ON_FIELD", "OFFLINE"
}
